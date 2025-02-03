import { PostRepository } from '../repositories/PostRepository';
import { Post } from '../dtos/Post'; 

export class ExploreInteractor {
  constructor(private postRepository: PostRepository) {}

  public async getExplorePosts(page: number, limit: number): Promise<Post[]> {
    return this.postRepository.findAllPosts(page, limit);
  }

  public async getForYouPosts(userId: string, page: number, limit: number): Promise<Post[]> {
    return this.postRepository.findPersonalizedPosts(userId, page, limit);
  }
}