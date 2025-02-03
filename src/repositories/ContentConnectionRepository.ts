import { IContentConnectionRepository } from '../interfaces/IContentConnectionRepository';
import { Follower, IFollower, IFollowerWithDetails } from '../Models/FollowModel';
import CustomError from '../utils/CustomError';

export class ContentConnectionRepository implements IContentConnectionRepository {
    async createFollowRequest(followerId: string, userId: string): Promise<void> {
        try {
            const existingFollow = await Follower.findOne({
                userId,
                followerId
            });

            if (existingFollow) {
                existingFollow.status = 'Requested';
                await existingFollow.save();
            } else {
                const follow = new Follower({
                    userId,
                    followerId,
                    status: 'Requested'
                });
                await follow.save();
            }
        } catch (error) {
            throw new CustomError(
                "Error creating follow request: " + 
                (error instanceof Error ? error.message : "Unknown error"),
                500
            );
        }
    }

    async updateFollowStatus(userId: string, followerId: string, status: string): Promise<void> {
        try {
            const follow = await Follower.findOne({ userId, followerId });
            if (!follow) {
                throw new CustomError("Follow relationship not found", 404);
            }

            follow.status = status as 'Requested' | 'Accepted' | 'Rejected';
            await follow.save();
        } catch (error) {
            throw new CustomError(
                "Error updating follow status: " + 
                (error instanceof Error ? error.message : "Unknown error"),
                500
            );
        }
    }

    async removeFollowRelation(userId: string, followerId: string): Promise<void> {
        try {
            const result = await Follower.findOneAndDelete({ userId, followerId });
            if (!result) {
                throw new CustomError("Follow relationship not found", 404);
            }
        } catch (error) {
            throw new CustomError(
                "Error removing follow relation: " + 
                (error instanceof Error ? error.message : "Unknown error"),
                500
            );
        }
    }

    async getFollowerCount(userId: string): Promise<number> {
        try {
            return await Follower.countDocuments({
                userId,
                status: 'Accepted'
            });
        } catch (error) {
            throw new CustomError(
                "Error getting follower count: " + 
                (error instanceof Error ? error.message : "Unknown error"),
                500
            );
        }
    }

    async getFollowingCount(userId: string): Promise<number> {
        try {
            return await Follower.countDocuments({
                followerId: userId,
                status: 'Accepted'
            });
        } catch (error) {
            throw new CustomError(
                "Error getting following count: " + 
                (error instanceof Error ? error.message : "Unknown error"),
                500
            );
        }
    }

    async getFollowers(userId: string): Promise<IFollower[]> {
        try {
            return await Follower.find({
                userId,
                status: 'Accepted'
            }).populate('followerId', 'username displayName profileImage');
        } catch (error) {
            throw new CustomError(
                "Error getting followers: " + 
                (error instanceof Error ? error.message : "Unknown error"),
                500
            );
        }
    }

    async getFollowing(userId: string): Promise<IFollower[]> {
        try {
            return await Follower.find({
                followerId: userId,
                status: 'Accepted'
            }).populate('userId', 'username displayName profileImage');
        } catch (error) {
            throw new CustomError(
                "Error getting following: " + 
                (error instanceof Error ? error.message : "Unknown error"),
                500
            );
        }
    }

    async getFollowStatus(followerId: string, userId: string): Promise<string | null> {
        try {
            const follow = await Follower.findOne({ userId, followerId });
            return follow ? follow.status : null;
        } catch (error) {
            throw new CustomError(
                "Error getting follow status: " + 
                (error instanceof Error ? error.message : "Unknown error"),
                500
            );
        }
    }
}