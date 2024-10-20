import { ISponsoredPost } from "../Models/SponsoredPost";

export interface ISponsoredPostRepository{
    fetchSponsoredPosts(): Promise<ISponsoredPost[]>
}