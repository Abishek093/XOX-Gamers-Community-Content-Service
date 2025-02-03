import { CommentListResponse, CommentResponse } from "../dtos/CommentResponse";
import { IComment } from "../Models/CommentModel";
import { ILike } from "../Models/LikeModel";
import { IPost } from "../Models/PostModel";
import { IReport } from "../Models/ReportModel";

export interface IPostInteractor{
    createPost(username: string, postImageUrl: String, description: string | undefined): Promise<IPost>
    getPosts(userId: string): Promise<IPost[]> 
    likePost(userId: string, postId: string): Promise<ILike>
    unlikePost(userId: string, postId: string): Promise<ILike>
    checkLike(userId: string, postId: string): Promise<boolean>
    fetchPostDetails(postId: string): Promise<IPost | null>
    updatePost(postId: string, description: string, croppedImage: string): Promise<void>
    addComment(postId: string, userId: string, comment: string): Promise<CommentResponse>
    fetchComments(postId: string): Promise<CommentListResponse[]>
    UpdateComment(commentId: string, editContent: string): Promise<IComment | null>
    deleteComment(commentId: string): Promise<void>
    reportPost(userId: string, postId: string, reason: string): Promise<IReport>
    getReportReasons(): Promise<string[]> 
    deletePost(postId: string):Promise<void>
}