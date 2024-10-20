import { ILike } from "../Models/LikeModel";
import { IPost } from "../Models/PostModel";

export interface IPostInteractor{
    createPost(username: string, postImageUrl: String, description: string | undefined): Promise<IPost>
    getPosts(userId: string): Promise<IPost[]> 
    likePost(userId: string, postId: string): Promise<ILike>
    unlikePost(userId: string, postId: string): Promise<ILike>
    checkLike(userId: string, postId: string): Promise<boolean>
    fetchPostDetails(postId: string): Promise<IPost | null>
    updatePost(postId: string, description: string, croppedImage: string): Promise<void>
}