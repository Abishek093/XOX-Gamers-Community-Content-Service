import { CommentListResponse, CommentResponse } from "../dtos/CommentResponse";
import { ILike } from "../Models/LikeModel";
import { IPost } from "../Models/PostModel";

export interface IPostRepository {
    createPost(username: string, postImageUrl: String, description: string): Promise<IPost> 
    fetchPosts(userId: string): Promise<IPost[]>
    likePost(userId: string, postId: String): Promise<ILike>
    unlikePost(userId: string, postId: String): Promise<ILike>
    checkLike(userId: string, postId: string):Promise<boolean>
    fetchPostDetails(postId: string): Promise<IPost | null>
    updatePost(postId: string, description: string, croppedImage: string): Promise<void>
    addComment(postId: string, userId: string, comment: string): Promise<CommentResponse>
    fetchComment(postId: string): Promise<CommentListResponse[]> 
}