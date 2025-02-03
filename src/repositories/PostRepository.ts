import mongoose, { Types } from "mongoose";
import { IPostRepository } from "../interfaces/IPostRepository";
import PostModel, { IPost } from "../Models/PostModel";
import { IUser, MongooseUserModel, UserModel } from "../Models/UserModel";
import CustomError from "../utils/CustomError";
import LikeModel, { ILike } from "../Models/LikeModel";
import { exit } from "process";
import CommentModel, { IComment } from "../Models/CommentModel";
import { CommentListResponse, CommentResponse } from "../dtos/CommentResponse";
import ReportModel, { IReport } from "../Models/ReportModel";
import { Post } from "../dtos/Post";
import { Follower } from "../Models/FollowModel";
import { Community } from "../Models/CommunityModel";
import { log } from "console";
import { publishToQueue } from "../services/RabbitMQPublisher";

export class PostRepository implements IPostRepository {
  async createPost(username: string, postImageUrl: String, description: string): Promise<IPost> {
    try {
      const user = await MongooseUserModel.findOne({ username: username })
      if (!user) {
        throw new CustomError("User not found!", 404);
      }

      const newPost = new PostModel({
        title: description,
        content: postImageUrl,
        author: user.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await newPost.save();

      await publishToQueue('content-service-post-created', {
        postId: newPost._id,
        title: newPost.title,
        content: newPost.content,
        author: newPost.author,
        createdAt: newPost.createdAt
      });

      console.log("Repository new post", newPost)
      return newPost;
    } catch (error) {
      throw new CustomError("Error create post: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }

  async fetchPosts(userId: string): Promise<IPost[]> {
    try {
      console.log('userId', userId)
      const posts = await PostModel.aggregate([
        { $match: { author: new mongoose.Types.ObjectId(userId) } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "postId",
            as: "likes",
          },
        },
        {
          $addFields: {
            likeCount: { $size: "$likes" },
          },
        },
        {
          $project: {
            title: 1,
            content: 1,
            author: 1,
            comments: 1,
            createdAt: 1,
            updatedAt: 1,
            likeCount: 1,
          },
        },
      ]);

      return posts;
    } catch (error) {
      throw new CustomError("Error fetching posts: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }
  async likePost(userId: string, postId: string): Promise<ILike> {
    try {
      const user = await MongooseUserModel.findOne({ userId: userId });
      if (!user) throw new CustomError("User not found!", 404);

      const post = await PostModel.findById(postId);
      if (!post) throw new CustomError("Post not found!", 404);

      // Check for existing like
      const existingLike = await LikeModel.findOne({
        postId: postId,
        userId: userId
      });

      if (existingLike) return existingLike;

      // Create new like
      const like = new LikeModel({
        postId: postId,
        userId: userId,
        createdAt: Date.now(),
      });

      await like.save();

      // Update post like count and get the new count
      await PostModel.findByIdAndUpdate(postId, {
        $inc: { likeCount: 1 }
      });

      // Get the current likes count and liked users
      const likeCount = await LikeModel.countDocuments({ postId: postId });
      const likedByUsers = await LikeModel.find({ postId: postId })
        .distinct('userId')
        .lean();

      console.log('Updated like information:', {
        postId,
        likeCount,
        likedByUsers
      });

      // Publish updated like information
      await publishToQueue('content_like_updates', {
        postId,
        likeCount,
        likedByUsers: likedByUsers.map(id => id.toString())
      });

      return like;
    } catch (error) {
      throw new CustomError(
        "Error liking post: " +
        (error instanceof Error ? error.message : "Unknown error"),
        500
      );
    }
  }

  // async likePost(userId: string, postId: String): Promise<ILike> {
  //   try {
  //     const user = await MongooseUserModel.findOne({ userId: userId })
  //     if (!user) {
  //       throw new CustomError("User not found!", 404);
  //     }

  //     const post = await PostModel.findById(postId)
  //     if (!post) {
  //       throw new CustomError("Post not found!", 404);
  //     }

  //     // const existingLike = await LikeModel.find({postId: postId, userId: userId})
  //     // if(existingLike){
  //     //   this.unlikePost(userId, postId)
  //     //   exit
  //     // }

  //     const like = await new LikeModel({
  //       postId: postId,
  //       userId: userId,
  //       createdAt: Date.now(),
  //     });

  //     await PostModel.findByIdAndUpdate(postId, {
  //       $inc: { likeCount: 1 }
  //     });

  //     console.log("Post liked", like)
  //     await like.save();
  //     return like;

  //   } catch (error) {
  //     throw new CustomError("Error Like post: " + (error instanceof Error ? error.message : "Unknown error"), 500);
  //   }
  // }

  // async unlikePost(userId: string, postId: String): Promise<ILike> {
  //   try {
  //     const user = await MongooseUserModel.findOne({ userId: userId })
  //     if (!user) {
  //       throw new CustomError("User not found!", 404);
  //     }

  //     const post = await PostModel.findById(postId)
  //     if (!post) {
  //       throw new CustomError("Post not found!", 404);
  //     }
  //     console.log("Post unliked", userId, postId)

  //     const unlike = await LikeModel.findOneAndDelete({
  //       userId: userId,
  //       postId: postId,
  //     });

  //     if (unlike) {
  //       await PostModel.findByIdAndUpdate(postId, {
  //         $inc: { likeCount: -1 }
  //       });
  //     }

  //     if (!unlike) {
  //       throw new CustomError("User not liked the post", 404);
  //     }

  //     return unlike;

  //   } catch (error) {
  //     throw new CustomError("Error Like post: " + (error instanceof Error ? error.message : "Unknown error"), 500);
  //   }
  // }


  async unlikePost(userId: string, postId: string): Promise<ILike> {
    try {
      const user = await MongooseUserModel.findOne({ userId: userId });
      if (!user) throw new CustomError("User not found!", 404);

      const post = await PostModel.findById(postId);
      if (!post) throw new CustomError("Post not found!", 404);

      const unlike = await LikeModel.findOneAndDelete({
        userId: userId,
        postId: postId,
      });

      if (!unlike) throw new CustomError("User has not liked the post", 404);

      // Update post like count
      await PostModel.findByIdAndUpdate(postId, {
        $inc: { likeCount: -1 }
      });

      // Get the current likes count and liked users
      const likeCount = await LikeModel.countDocuments({ postId: postId });
      const likedByUsers = await LikeModel.find({ postId: postId })
        .distinct('userId')
        .lean();

      console.log('Updated unlike information:', {
        postId,
        likeCount,
        likedByUsers
      });

      // Publish updated like information
      await publishToQueue('content_like_updates', {
        postId,
        likeCount,
        likedByUsers: likedByUsers.map(id => id.toString())
      });

      return unlike;
    } catch (error) {
      throw new CustomError(
        "Error unliking post: " +
        (error instanceof Error ? error.message : "Unknown error"),
        500
      );
    }
  }



  async checkLike(userId: string, postId: string): Promise<boolean> {
    try {
      const isLike = await LikeModel.findOne({ postId, userId }).exec();
      return !!isLike;
    } catch (error) {
      throw new CustomError("Error checking like for post: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }

  async fetchPostDetails(postId: string): Promise<IPost | null> {
    try {
      const post = await PostModel.findById(postId).exec();
      return post;
    } catch (error) {
      throw new CustomError("Error fetching post: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }

  async updatePost(postId: string, description: string, croppedImage: string): Promise<void> {
    try {
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        {
          content: croppedImage,
          title: description,
          updatedAt: Date.now(),
        },
        { new: true }
      );

      if (!updatedPost) {
        throw new CustomError("Post not found", 404);
      }

      await publishToQueue('content-service-post-updated', {
        postId: updatedPost._id,
        title: updatedPost.title,
        content: updatedPost.content,
        updatedAt: updatedPost.updatedAt
      });

    } catch (error) {
      throw new CustomError("Error updating post: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }

  async addComment(postId: string, userId: string, comment: string): Promise<CommentResponse> {
    try {
      const post = await PostModel.findOne({ _id: postId });
      if (!post) {
        throw new CustomError("Post not found", 404);
      }

      const user = await MongooseUserModel.findOne({ userId: userId });
      if (!user) {
        throw new CustomError("User not found", 404);
      }

      const newComment = new CommentModel({
        postId,
        author: userId,
        content: comment,
      });

      await newComment.save();
      console.log('newComment', newComment)
      if (newComment._id) {
        return {
          _id: newComment._id.toString(),
          postId: newComment.postId.toString(),
          author: newComment.author.toString(),
          content: newComment.content,
          createdAt: newComment.createdAt,
          userDetails: {
            _id: user.userId.toString(),
            username: user.username,
            displayName: user.displayName,
            profileImage: user.profileImage || '',
          },
        };
      } else {
        throw new CustomError("Error adding comment: ", 500);
      }

    } catch (error) {
      throw new CustomError("Error adding comment: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }

  async fetchComment(postId: string): Promise<CommentListResponse[]> {
    try {
      console.log("Fetching comments for postId: ", postId);

      const post = await PostModel.findOne({ _id: postId });
      if (!post) {
        console.error("Post not found for postId: ", postId);
        throw new CustomError("Post not found", 404);
      }

      console.log("Post found: ", post);

      const comments = await CommentModel.aggregate([
        { $match: { postId: new mongoose.Types.ObjectId(postId) } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "users",
            let: { authorId: { $toString: "$author" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$userId", "$$authorId"] } } }
            ],
            as: "userDetails"
          }
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            postId: 1,
            author: 1,
            content: 1,
            createdAt: 1,
            "userDetails._id": 1,
            "userDetails.profileImage": 1,
            "userDetails.username": 1,
            "userDetails.displayName": 1,
          }
        }
      ]);

      console.log("Comments after Lookup: ", JSON.stringify(comments, null, 2));

      // if (comments.length === 0) {
      //   throw new CustomError("No comments found", 404);
      // }

      return comments;
    } catch (error) {
      console.error("Error fetching comments: ", error);
      throw new CustomError("Error fetching comments: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }

  async updateComment(commentId: string, editContent: string): Promise<IComment | null> {
    try {
      const comment = await CommentModel.findByIdAndUpdate(
        { _id: commentId },
        { content: editContent },
        { new: true }
      );

      return comment;
    } catch (error) {
      throw new CustomError("Error updating comment: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      const result = await CommentModel.findByIdAndDelete(commentId);
      if (!result) {
        throw new CustomError("Comment not found", 404);
      }
    } catch (error) {
      throw new CustomError("Error deleting comment: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }


  async reportPost(userId: string, postId: string, reason: string): Promise<IReport> {
    try {
      const user = MongooseUserModel.findOne({ userId: userId })
      const post = await PostModel.findOne({ _id: postId });
      if (!user) {
        throw new CustomError("User not found!", 404);
      }
      if (!post) {
        throw new CustomError("Post not found!", 404);
      }
      const newReport = new ReportModel({
        reporterId: userId,
        targetId: postId,
        targetType: "post",
        reason: reason,
        status: "pending",
      });
      await newReport.save();

      await publishToQueue('content-service-post-reported', {
        reportId: newReport._id,
        postId: postId,
        userId: userId,
        reason: reason,
        status: newReport.status
      });

      return newReport;
    } catch (error) {
      throw new CustomError("Error reporting post: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }

  async findAllPosts(page: number, limit: number): Promise<Post[]> {
    const skip = (page - 1) * limit;
    let posts;
    posts = await PostModel.aggregate([
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          let: { authorId: '$author' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$authorId']
                }
              }
            }
          ],
          as: 'authorById'
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { authorId: { $toString: '$author' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$userId', '$$authorId']
                }
              }
            }
          ],
          as: 'authorByUserId'
        }
      },

      {
        $addFields: {
          author: {
            $cond: {
              if: { $gt: [{ $size: '$authorById' }, 0] },
              then: { $arrayElemAt: ['$authorById', 0] },
              else: { $arrayElemAt: ['$authorByUserId', 0] }
            }
          }
        }
      },

      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'communities',
          let: { communityId: '$community' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$communityId']
                }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                image: 1,
                description: 1
              }
            }
          ],
          as: 'communityDetails'
        }
      },
      {
        $unwind: {
          path: '$communityDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'comments',
          let: { postId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$postId', '$$postId'] }
              }
            },
            { $count: 'count' }
          ],
          as: 'commentCount'
        }
      },
      {
        $lookup: {
          from: 'likes',
          let: { postId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$postId', '$$postId'] }
              }
            },
            { $count: 'count' }
          ],
          as: 'likeCount'
        }
      },
      {
        $addFields: {
          commentCount: {
            $ifNull: [{ $arrayElemAt: ['$commentCount.count', 0] }, 0]
          },
          likeCount: {
            $ifNull: [{ $arrayElemAt: ['$likeCount.count', 0] }, 0]
          }
        }
      }
    ]);
    console.log('Final step : ', posts);

    return posts;
  }

  async deletePost(postId: string): Promise<void> {
    try {
      const existingPost = await PostModel.findById(postId);

      if (!existingPost) {
        throw new Error("Post not found");
      }
  
      await LikeModel.deleteMany({ postId });
      await CommentModel.deleteMany({ postId });
      await PostModel.findByIdAndDelete(postId);
    } catch (error) {
      throw new CustomError("Error deleting post: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }

  async resolveReport(postId: string): Promise<IReport[]> {
    try {
        const reports = await ReportModel.find({ targetId: postId, targetType: 'post' });

        if (reports.length === 0) {
            throw new CustomError('No reports found for this post', 404)
        }

        await ReportModel.updateMany({ targetId: postId, targetType: 'post' }, { status: 'resolved' });
        return reports

    } catch (error) {
        throw new CustomError("Error while resolving report: " + (error instanceof Error || error instanceof CustomError ? error.message : "Unknown error"), 500);
    }
}

  // async findPersonalizedPosts(userId: string, page: number, limit: number): Promise<Post[]> {
  //     const skip = (page - 1) * limit;
  //     const userObjectId = new mongoose.Types.ObjectId(userId);

  //     const followedUsers = await Follower.find({
  //       followerId: userObjectId,  
  //       status: 'Accepted'
  //     }).distinct('followerId'); 

  //     console.log("Follow status true: ", followedUsers)
  //     const followedCommunities = await Community.find({
  //       followers: userObjectId
  //     }).distinct('_id');
  //     console.log("Follow status true(communities): ", followedUsers)

  //     console.log('Debug - Found followed:', {
  //       followedUsers,
  //       followedCommunities,
  //       userId
  //     });

  //     const posts = await PostModel.aggregate([
  //       {
  //         $match: {
  //           $or: [
  //             { author: { $in: followedUsers } },
  //             { community: { $in: followedCommunities } }
  //           ]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: 'users',
  //           localField: 'author',
  //           foreignField: '_id',
  //           as: 'author'
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: 'communities',
  //           localField: 'community',
  //           foreignField: '_id',
  //           as: 'community'
  //         }
  //       },
  //       { $unwind: '$author' },
  //       { $unwind: { path: '$community', preserveNullAndEmptyArrays: true } },
  //       {
  //         $lookup: {
  //           from: 'comments',
  //           let: { postId: '$_id' },
  //           pipeline: [
  //             { $match: { $expr: { $eq: ['$postId', '$$postId'] } } },
  //             { $count: 'count' }
  //           ],
  //           as: 'commentCount'
  //         }
  //       },
  //       {
  //         $addFields: {
  //           commentCount: { $ifNull: [{ $arrayElemAt: ['$commentCount.count', 0] }, 0] }
  //         }
  //       },
  //       { $skip: skip },
  //       { $limit: limit },
  //       { $sort: { createdAt: -1 } }
  //     ]);
  //     console.log("Personalised posts", posts)
  //     return posts;
  //   }

  async findPersonalizedPosts(userId: string, page: number, limit: number): Promise<Post[]> {
    const skip = (page - 1) * limit;
    const userObjectId = new Types.ObjectId(userId);

    // Get users that the current user is following
    const followedUsers = await Follower.find({
      followerId: userObjectId,
      status: 'Accepted'
    }).distinct('userId') as Types.ObjectId[];

    // Get communities the user follows
    const followedCommunities = await Community.find({
      followers: userObjectId
    }).distinct('_id') as Types.ObjectId[];

    const posts = await PostModel.aggregate([
      {
        $match: {
          $or: [
            { author: { $in: followedUsers } },
            { community: { $in: followedCommunities } }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          let: { authorId: '$author' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$authorId']
                }
              }
            }
          ],
          as: 'authorById'
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { authorId: { $toString: '$author' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$userId', '$$authorId']
                }
              }
            }
          ],
          as: 'authorByUserId'
        }
      },
      {
        $addFields: {
          author: {
            $cond: {
              if: { $gt: [{ $size: '$authorById' }, 0] },
              then: { $arrayElemAt: ['$authorById', 0] },
              else: { $arrayElemAt: ['$authorByUserId', 0] }
            }
          }
        }
      },
      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'communities',
          let: { communityId: '$community' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$communityId']
                }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                image: 1,
                description: 1
              }
            }
          ],
          as: 'communityDetails'
        }
      },
      {
        $unwind: {
          path: '$communityDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'comments',
          let: { postId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$postId', '$$postId'] }
              }
            },
            { $count: 'count' }
          ],
          as: 'commentCount'
        }
      },
      {
        $lookup: {
          from: 'likes',
          let: { postId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$postId', '$$postId'] }
              }
            },
            { $count: 'count' }
          ],
          as: 'likeCount'
        }
      },
      {
        $addFields: {
          commentCount: {
            $ifNull: [{ $arrayElemAt: ['$commentCount.count', 0] }, 0]
          },
          likeCount: {
            $ifNull: [{ $arrayElemAt: ['$likeCount.count', 0] }, 0]
          }
        }
      }
    ]);
    console.log("Personalised post: ", posts)

    return posts;
  }

}
