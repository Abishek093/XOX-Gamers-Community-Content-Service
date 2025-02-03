import { NextFunction, Request, Response } from "express";
import { IPostInteractor } from "../interfaces/IPostInteractor";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import CustomError from "../utils/CustomError";


export class PostController {
    constructor(private postInteractor: IPostInteractor) { }

    createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { username, postImageUrl, description } = req.body
            console.log('req.body: ', req.body)
            console.log('username: ', username, 'postImageUrl: ', postImageUrl, 'description: ', description)
            const newPost = await this.postInteractor.createPost(username, postImageUrl, description)
            console.log("Controller new post", newPost)

            res.status(200).json(newPost)
        } catch (error) {
            next(error)
        }
    }


    generatePresignedUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            console.log('Generating presigned URL. Request body:', req.body);
            const { userId, fileType } = req.body;
            if (!userId) {
                res.status(400).json({ message: 'UserId is required' });
                return;
            }

            const region = process.env.AWS_REGION;
            const bucket = process.env.AWS_BUCKET_NAME;

            // Initialize S3Client here
            const s3Client = new S3Client({ region });

            // Generate a unique key for each upload
            const uniqueId = uuidv4();
            const key = `${userId}/${fileType}/${uniqueId}.jpg`;

            const params = {
                Bucket: bucket,
                Key: key,
                ContentType: 'image/jpeg',
            };

            // Use the correct S3Client instance
            const command = new PutObjectCommand(params);
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

            res.status(200).json({ uploadUrl: signedUrl, key });
        } catch (error) {
            console.error("Error generating pre-signed URL", error);
            res.status(500).json({ message: 'Failed to generate pre-signed URL' });
        }
    };



    getPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.params.id;
        try {
            const posts = await this.postInteractor.getPosts(userId)
            console.log('posts in controller', posts);
            res.status(200).json(posts)
        } catch (error) {
            next(error)
        }
    };

    likePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { userId, postId } = req.body;
        try {
            const posts = await this.postInteractor.likePost(userId, postId)
            console.log('posts in controller', posts);
            res.status(200).json('success')
        } catch (error) {
            next(error)
        }
    };

    unlikePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { userId, postId } = req.body;
        try {
            const posts = await this.postInteractor.unlikePost(userId, postId)
            console.log('posts in controller', posts);
            res.status(200).json('success')
        } catch (error) {
            next(error)
        }
    };

    checkLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { postId, userId } = req.body
            const isLiked = await this.postInteractor.checkLike(userId, postId);
            res.json({ liked: isLiked });
        } catch (error) {
            next(error)
        }
    }

    fetchPostDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const postId = req.params.postId;
            const post = await this.postInteractor.fetchPostDetails(postId);
            if (!post) {
                throw new CustomError('Post not found', 404)
            }
            console.log('Post fetched successfully:', post);
            res.status(200).json(post);
        } catch (error) {
            next(error)
        }
    }

    updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { postId, description, croppedImage } = req.body;
        try {
            const updatedPost = await this.postInteractor.updatePost(postId, description, croppedImage);
            console.log('Post updated successfully:', updatedPost);
            res.status(200).json(updatedPost);
        } catch (error) {
            next(error)
        }
    };

    deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
          const { postId } = req.params;
          console.log(postId);
          await this.postInteractor.deletePost(postId);
          res.status(200).json('Post deleted successfully');
        } catch (error) {
            next(error)
        }
      };

    addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { postId, userId, comment } = req.body;
        try {
            const newComment = await this.postInteractor.addComment(postId, userId, comment);
            res.status(200).json(newComment);
        } catch (error) {
            next(error)
        }
    };

    fetchComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const postId = req.params.postId;
        try {
            const comments = await this.postInteractor.fetchComments(postId);
            res.status(200).json(comments);
        } catch (error) {
            next(error)
        }
    };

    updateComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { commentId } = req.params;
            const content = req.body.content;
            const updatedComment = await this.postInteractor.UpdateComment(commentId, content);
            res.status(200).json(updatedComment);
        } catch (error) {
            next(error)
        }
    };

    deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { commentId } = req.params;
            await this.postInteractor.deleteComment(commentId);
            res.status(200).json("Comment deleted successfully");
        } catch (error) {
            next(error)
        }
    };

    reportPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId, postId, reason } = req.body;
            const report = await this.postInteractor.reportPost(userId, postId, reason);
            res.status(200).json({ message: 'Report created successfully', report });
        } catch (error) {
            next(error)
        }
    };

    reportReasons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const reasons = await this.postInteractor.getReportReasons()
            res.json(reasons)
        } catch (error) {
            next(error)
        }
    }
}