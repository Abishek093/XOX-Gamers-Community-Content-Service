import { CommentListResponse, CommentResponse } from "../dtos/CommentResponse";
import { IPostInteractor } from "../interfaces/IPostInteractor";
import { IPostRepository } from "../interfaces/IPostRepository";
import { IComment } from "../Models/CommentModel";
import { ILike } from "../Models/LikeModel";
import { IPost } from "../Models/PostModel";
import CustomError from "../utils/CustomError";

export class PostInteractor implements IPostInteractor {
  constructor(private repository: IPostRepository) { }

  async createPost(username: string, postImageUrl: String, description: string): Promise<IPost> {
    try {
      const newPost = await this.repository.createPost(username, postImageUrl, description)
      return newPost
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async getPosts(userId: string): Promise<IPost[]> {
    try {
      const posts = await this.repository.fetchPosts(userId);
      return posts;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }


  async likePost(userId: string, postId: string): Promise<ILike> {
    try {
      const like = await this.repository.likePost(userId,postId);
      return like;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async unlikePost(userId: string, postId: string): Promise<ILike> {
    try {
      const unlike = await this.repository.unlikePost(userId, postId);
      return unlike;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async checkLike(userId: string, postId: string): Promise<boolean> {
    try {
      const isLiked = await this.repository.checkLike(userId,postId);
      return isLiked;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async fetchPostDetails(postId: string): Promise<IPost | null>{
    try {
      const postDetails = this.repository.fetchPostDetails(postId)
      return postDetails
    }  catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async updatePost(postId: string, description: string, croppedImage: string): Promise<void>{
    try {
      const updatePost = this.repository.updatePost(postId, description, croppedImage)
      return updatePost  
    }  catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }


  async addComment(postId: string, userId: string, comment: string): Promise<CommentResponse>{
    try {
      const newComment = this.repository.addComment(postId, userId, comment)
      return newComment  
    }  catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async fetchComments(postId: string): Promise<CommentListResponse[]>{
    try {
      const comments = this.repository.fetchComment(postId)
      return comments
    }  catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async UpdateComment(commentId: string, editContent: string): Promise<IComment | null> {
    try {
      const updatedComment = await this.repository.updateComment(commentId, editContent); 
      return updatedComment;
    }  catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

}