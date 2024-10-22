import { ICommunityInteractor } from "../interfaces/ICommunityInteractor";
import { ICommunity, ICommunityWithCounts } from "../Models/CommunityModel";
import { IFollower } from "../Models/FollowModel";
import { IPost } from "../Models/PostModel";
import { CommunityRepository } from "../repositories/CommunityRepository";
import CustomError from "../utils/CustomError";
import { v4 as uuidv4 } from 'uuid';


export class CommunityInteractor implements ICommunityInteractor {
    constructor(private repository: CommunityRepository) { }

    async createCommunity(userId: string, communityName: string, description: string, postPermission: string, image: string): Promise<ICommunity> {
        try {
            const existingCommunity = await this.repository.existingCommunity(communityName)
            if (existingCommunity) {
                throw new CustomError('Community already exist', 409)
            }
            const newCommunity = this.repository.createCommunity(userId, communityName, description, postPermission, image)
            return newCommunity

        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }

    async fetchCommunities(): Promise<ICommunityWithCounts[]> {
        try {
            return await this.repository.fetchAllCommunities()
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }

    async fetchCommunity(communityId: string): Promise<ICommunity | null> {
        try {
            return await this.repository.fetchCommunity(communityId)
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }


    async createCommunityPost(username: string, croppedImage: string, description: string, communityId: string): Promise<IPost> {
        try {
            return await this.repository.createCommunityPost(username, croppedImage, description, communityId)
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }

    async updateCommunity(communityId: string, communityName?: string, description?: string, postPermission?: string, imageUrl?: string | null): Promise<ICommunity | null> {
        try {
            const updateData: Partial<ICommunity> = {};

            if (communityName) updateData.name = communityName;
            if (description) updateData.description = description;
            if (postPermission) updateData.postPermission = postPermission as 'admin' | 'anyone';
            if (imageUrl) { updateData.image = imageUrl }

            return await this.repository.updateCommunity(communityId, updateData);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }

    async deleteCommunity(communityId: string): Promise<void> {
        try {
            const community = await this.repository.fetchCommunity(communityId);

            if (!community) {
                throw new Error('Community not found');
            }

            await this.repository.deleteCommunity(communityId);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }

    async followCommunity(userId: string, communityId: string): Promise<{ status: string }> {
        try {
            const result = await this.repository.followCommunity(userId, communityId);
            return result;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }

    async unfollowCommunity(userId: string, communityId: string): Promise<void> {
        try {
            await this.repository.unfollowCommunity(userId, communityId);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }

    async fetchCommunityFollowers(communityId: string): Promise<IFollower[]> {
        try {
            const followers = await this.repository.fetchCommunityFollowers(communityId);
            return followers;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }

    async checkFollowStatus(userId: string, communityId: string): Promise<boolean> {
        try {
            return this.repository.checkFollowStatus(userId, communityId);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }
}