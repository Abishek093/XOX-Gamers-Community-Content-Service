import mongoose from "mongoose";
import { IPostRepository } from "../interfaces/IPostRepository";
import PostModel, { IPost } from "../Models/PostModel";
import { IUser, MongooseUserModel, UserModel } from "../Models/UserModel";
import CustomError from "../utils/CustomError";
import LikeModel, { ILike } from "../Models/LikeModel";
import { exit } from "process";
import CommentModel, { IComment } from "../Models/CommentModel";
import { CommentListResponse, CommentResponse } from "../dtos/CommentResponse";

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

  async likePost(userId: string, postId: String): Promise<ILike> {
    try {
      const user = await MongooseUserModel.findOne({ userId: userId })
      if (!user) {
        throw new CustomError("User not found!", 404);
      }

      const post = await PostModel.findById(postId)
      if (!post) {
        throw new CustomError("Post not found!", 404);
      }

      // const existingLike = await LikeModel.find({postId: postId, userId: userId})
      // if(existingLike){
      //   this.unlikePost(userId, postId)
      //   exit
      // }

      const like = await new LikeModel({
        postId: postId,
        userId: userId,
        createdAt: Date.now(),
      });
      console.log("Post liked", like)
      await like.save();
      return like;

    } catch (error) {
      throw new CustomError("Error Like post: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }

  async unlikePost(userId: string, postId: String): Promise<ILike> {
    try {
      const user = await MongooseUserModel.findOne({ userId: userId })
      if (!user) {
        throw new CustomError("User not found!", 404);
      }

      const post = await PostModel.findById(postId)
      if (!post) {
        throw new CustomError("Post not found!", 404);
      }
      console.log("Post unliked", userId, postId)

      const unlike = await LikeModel.findOneAndDelete({
        userId: userId,
        postId: postId,
      });

      if (!unlike) {
        throw new CustomError("User not liked the post", 404);
      }

      return unlike;

    } catch (error) {
      throw new CustomError("Error Like post: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }
  
  async checkLike(userId: string, postId: string):Promise<boolean>{
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
    }catch (error) {
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
      console.log('newComment',newComment)
      if(newComment._id){
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
      }else{
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

  async deleteComment(commentId: string): Promise<void>{
    try {
      const result = await CommentModel.findByIdAndDelete(commentId);
      if (!result) {
        throw new CustomError("Comment not found", 404);
      }
    } catch (error) {
      throw new CustomError("Error deleting comment: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }


}