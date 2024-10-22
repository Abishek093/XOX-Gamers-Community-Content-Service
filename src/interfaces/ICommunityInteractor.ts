import { ICommunity, ICommunityWithCounts } from "../Models/CommunityModel";
import { IFollower } from "../Models/FollowModel";
import { IPost } from "../Models/PostModel";

export interface ICommunityInteractor{
    createCommunity(userId: string, communityName: string, description: string, postPermission: string, image: string):Promise<ICommunity>
    fetchCommunities(): Promise<ICommunityWithCounts[]>
    fetchCommunity(communityId: string): Promise<ICommunity | null>
    createCommunityPost(username: string, croppedImage: string, description: string, communityId: string): Promise<IPost>
    updateCommunity(communityId: string, communityName?: string, description?: string, postPermission?: string, imageUrl?: string | null): Promise<ICommunity | null>
    deleteCommunity(communityId: string): Promise<void> 
    followCommunity(userId: string, communityId: string): Promise<{ status: string }>
    unfollowCommunity(userId: string, communityId: string): Promise<void>
    fetchCommunityFollowers(communityId: string): Promise<IFollower[]>
    checkFollowStatus(userId: string, communityId: string): Promise<boolean>
}