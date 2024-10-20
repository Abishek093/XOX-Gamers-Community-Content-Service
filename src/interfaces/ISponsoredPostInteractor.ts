import { ISponsoredPost } from "../Models/SponsoredPost";

export interface ISponsoredPostInteractor{
    fetchSponsoredPosts(): Promise<ISponsoredPost[]> 
}