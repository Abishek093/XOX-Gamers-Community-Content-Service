import { Request, Response } from 'express';
import { ExploreInteractor } from '../interactors/ExploreInteractor'; 
import { PostRepository } from '../repositories/PostRepository';
import { log } from 'console';

export class ExploreController {
  private interactor: ExploreInteractor;

  constructor() {
    const postRepository = new PostRepository();
    this.interactor = new ExploreInteractor(postRepository);
  }

  getExplorePosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      log(`page: ${page}, limit: ${limit}`)
      const posts = await this.interactor.getExplorePosts(page, limit);
      res.status(200).json({ posts });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching explore posts' });
    }
  };

  getForYouPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("personal post request")
      const userId = req.query.userId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const posts = await this.interactor.getForYouPosts(userId, page, limit);
      res.status(200).json({ posts });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching personalized posts' });
    }
  };
}