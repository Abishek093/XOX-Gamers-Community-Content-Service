import mongoose from "mongoose";
import { IPostRepository } from "../interfaces/IPostRepository";
import PostModel, { IPost } from "../Models/PostModel";
import { MongooseUserModel, UserModel } from "../Models/UserModel";
import CustomError from "../utils/CustomError";
import LikeModel, { ILike } from "../Models/LikeModel";
import { exit } from "process";
import CommentModel from "../Models/CommentModel";

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

  async addComment(postId: string, userId: string, comment: string): Promise<any> {
    try {
      const post = await PostModel.find({ _id: postId });
      if (!post) {
        throw new Error("Post not found");
      }
      const user = await new UserModel().findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const newComment = await new CommentModel({
        postId: postId,
        author: userId,
        content: comment,
      });
  
      await newComment.save();

      return {
        _id: newComment._id,
        postId: newComment.postId,
        author: newComment.author,
        content: newComment.content,
        createdAt: newComment.createdAt,
        userDetails: {
          _id: user.userId,
          username: user.username,
          displayName: user.displayName,
          profileImage: user.profileImage,
        },
      };
    }catch (error) {
      throw new CustomError("Error adding comment: " + (error instanceof Error ? error.message : "Unknown error"), 500);
    }
  }

}