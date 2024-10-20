import { ISponsoredPostRepository } from "../interfaces/ISponsoredPostRepository";
import SponsoredPostModel, { ISponsoredPost } from "../Models/SponsoredPost";

export class SponsoredPostRepository implements ISponsoredPostRepository {
    async fetchSponsoredPosts(): Promise<ISponsoredPost[]> {
        const sponsoredPosts = await SponsoredPostModel.find().lean();
        // console.log('Repository posts:', sponsoredPosts); 
        return sponsoredPosts;
    }
}
