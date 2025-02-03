import { IFollower, IFollowerWithDetails } from '../Models/FollowModel';

export interface IContentConnectionRepository {
    createFollowRequest(followerId: string, userId: string): Promise<void>;
    updateFollowStatus(userId: string, followerId: string, status: string): Promise<void>;
    removeFollowRelation(userId: string, followerId: string): Promise<void>;
    getFollowerCount(userId: string): Promise<number>;
    getFollowingCount(userId: string): Promise<number>;
    getFollowers(userId: string): Promise<IFollower[]>;
    getFollowing(userId: string): Promise<IFollower[]>;
    getFollowStatus(followerId: string, userId: string): Promise<string | null>;
}