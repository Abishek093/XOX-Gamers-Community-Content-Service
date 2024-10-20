import { ISponsoredPostInteractor } from "../interfaces/ISponsoredPostInteractor";
import { ISponsoredPostRepository } from "../interfaces/ISponsoredPostRepository";
import { ISponsoredPost } from "../Models/SponsoredPost";

export class SponsoredPostInteractor implements ISponsoredPostInteractor {
    constructor(private repository: ISponsoredPostRepository) {}

    async fetchSponsoredPosts(): Promise<ISponsoredPost[]> {
        const posts = await this.repository.fetchSponsoredPosts();
        // console.log('Use case posts:', posts); 
        return posts;
      }

}
