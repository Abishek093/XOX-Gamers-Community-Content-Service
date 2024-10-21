// import { Router } from "express";
// import { PostController } from "../controllers/PostController";
// import { PostRepository } from "../repositories/PostRepository";
// import { PostInteractor } from "../interactors/PostInteractor";
// import { protectUser } from "../middlewares/authMiddleware";

// const postRoutes = Router()

// const postRepository = new PostRepository()
// const postInteractor = new PostInteractor(postRepository)
// const postController = new PostController(postInteractor)

// postRoutes.post("/posts/upload-url", postController.generatePresignedUrl.bind(postController));
// postRoutes.get('/create-post', postController.createPost.bind(postController))

// export default postRoutes




// import { Router } from 'express';
// import { PostController } from "../controllers/PostController";
// import { PostRepository } from "../repositories/PostRepository";
// import { PostInteractor } from "../interactors/PostInteractor";
// import { protectUser } from "../middlewares/authMiddleware";

// const postRoutes = Router();

// const postRepository = new PostRepository();
// const postInteractor = new PostInteractor(postRepository);
// const postController = new PostController(postInteractor);

// postRoutes.post("/upload-url", (req, res, next) => {
//     console.log("Content Service PostRoutes: Reached /upload-url route");
//     postController.generatePresignedUrl(req, res, next);
// });

// postRoutes.post('/create-post', (req, res, next) => {
//     console.log("Content Service PostRoutes: Reached /create-post route");
//     postController.createPost(req, res, next);
// });

// export default postRoutes;






import { Router } from 'express';
import { PostController } from "../controllers/PostController";
import { PostRepository } from "../repositories/PostRepository";
import { PostInteractor } from "../interactors/PostInteractor";
import { protectUser } from '../middlewares/authMiddleware';

const postRoutes = Router();

const postRepository = new PostRepository();
const postInteractor = new PostInteractor(postRepository);
const postController = new PostController(postInteractor);

postRoutes.post('/upload-url', protectUser, postController.generatePresignedUrl.bind(postController))
postRoutes.post('/create-post', protectUser, postController.createPost.bind(postController))
postRoutes.get("/fetch-posts/:id", protectUser, postController.getPosts.bind(postController))
postRoutes.post("/like-post", protectUser, postController.likePost.bind(postController))
postRoutes.post("/unlike-post", protectUser, postController.unlikePost.bind(postController))
postRoutes.post("/check-like", protectUser, postController.checkLike.bind(postController))

postRoutes.get("/fetch-post-details/:postId", protectUser, postController.fetchPostDetails.bind(postController))
postRoutes.post("/update-post", protectUser, postController.updatePost.bind(postController))

postRoutes.get("/fetch-comments/:postId", postController.fetchComments.bind(postController))
postRoutes.post("/add-comment", protectUser, postController.addComment.bind(postController))
postRoutes.put('/update-comment/:commentId', protectUser, postController.updateComment.bind(postController))
postRoutes.delete('/deleteComment/:commentId', protectUser, postController.deleteComment.bind(postController))


postRoutes.post("/report-post", protectUser, postController.reportPost.bind(postController))
postRoutes.get("/report-reasons", protectUser, postController.reportReasons.bind(postController))

export default postRoutes;