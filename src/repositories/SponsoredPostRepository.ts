import { ISponsoredPostRepository } from "../interfaces/ISponsoredPostRepository";
import SponsoredPostModel, { ISponsoredPost } from "../Models/SponsoredPost";
import CustomError from "../utils/CustomError";

export class SponsoredPostRepository implements ISponsoredPostRepository {
    async fetchSponsoredPosts(): Promise<ISponsoredPost[]> {

        try {
            const sponsoredPosts = await SponsoredPostModel.find().lean();
            // console.log('Repository posts:', sponsoredPosts); 
            return sponsoredPosts;
        } catch (error) {
            throw new CustomError(
              "Error fetching sponsored post: " +
                (error instanceof Error || error instanceof CustomError
                  ? error.message
                  : "Unknown error"),
              500
            );
          }

    }


    async createSponsoredPost(
        _id: string,
        title: string, 
        imageUrl: string, 
        link: string
      ): Promise<ISponsoredPost> {
        try {
          const newPost = new SponsoredPostModel({ title, imageUrl, link });
      
          const savedPost = await newPost.save();
          
          console.log("Saved Post: ", savedPost)
          return savedPost;
        } catch (error) {
          throw new CustomError(
            "Error creating sponsored post: " +
              (error instanceof Error || error instanceof CustomError
                ? error.message
                : "Unknown error"),
            500
          );
        }
      }
}
