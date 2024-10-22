import mongoose, { model } from "mongoose";
import { ICommunityRepository } from "../interfaces/ICommunityRepository";
import { Community, ICommunity, ICommunityWithCounts } from "../Models/CommunityModel";
import PostModel, { IPost } from "../Models/PostModel";
import { MongooseUserModel, UserModel } from "../Models/UserModel";
import CustomError from "../utils/CustomError";
import { Follower, IFollower } from "../Models/FollowModel";

export class CommunityRepository implements ICommunityRepository {
    async existingCommunity(communityName: string): Promise<ICommunity | null> {
        try {
            const existingCommunity = await Community.findOne({ name: communityName });
            if (existingCommunity) {
                return existingCommunity;
            }
            return null;
        } catch (error) {
            throw new CustomError("Error finding community: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }



    async createCommunity(userId: string, communityName: string, description: string, postPermission: string, image: string): Promise<ICommunity> {
        try {
            const existingCommunity = await Community.findOne({ name: communityName });
            if (existingCommunity) {
                throw new CustomError("Community already exist", 409);
            }
            const newCommunity = new Community({
                name: communityName,
                description: description,
                createdBy: userId,
                postPermission: postPermission,
                image: image,
            });
            await newCommunity.save();
            return newCommunity;
        } catch (error) {
            throw new CustomError("Error creating community: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async fetchAllCommunities(): Promise<ICommunityWithCounts[]> {
        try {
            const communities = await Community.find().lean().exec();
            return communities.map((community) => ({
                ...community,
                postCount: community.posts ? community.posts.length : 0,
                followerCount: community.followers ? community.followers.length : 0,
            })) as ICommunityWithCounts[];
        } catch (error) {
            throw new CustomError("Error fetching communities: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async fetchCommunity(communityId: string): Promise<ICommunity | null> {
        try {
            const communityData = await Community.findById(communityId)
                .populate({
                    path: "posts",
                    model: PostModel, // Assuming this is the correct model for 'posts'
                    populate: [
                        {
                            path: "author",
                            model: 'Users',
                            select: "username displayName profileImage createdAt updatedAt",
                        },
                        {
                            path: "likeCount",
                        },
                    ],
                    select: "title content author createdAt updatedAt",
                    options: { sort: { createdAt: -1 } },
                })
                .exec();
            return communityData;
        } catch (error) {
            throw new CustomError("Error fetching community: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async createCommunityPost(username: string, postImageUrl: string, description: string, communityId: string): Promise<IPost> {
        try {
            const user = await MongooseUserModel.findOne({ username: username });
            console.log(username, postImageUrl, description, communityId)
            if (!user) {
                throw new Error("User not found!");
            }

            const newPost = new PostModel({
                title: description,
                content: postImageUrl,
                author: user.id,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            await newPost.save();

            const community = await Community.findById(communityId);
            if (!community) {
                throw new Error("Community not found!");
            }

            community.posts.push(newPost._id as mongoose.Types.ObjectId);
            await community.save();

            return newPost;
        } catch (error) {
            throw new CustomError("Error creating community: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async updateCommunity(communityId: string, updateData: Partial<ICommunity>): Promise<ICommunity | null> {
        try {
            const updatedCommunity = await Community.findByIdAndUpdate(
                communityId,
                updateData,
                { new: true }
            );
            return updatedCommunity;
        } catch (error) {
            throw new CustomError("Error updating community: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async deleteCommunity(communityId: string): Promise<void> {
        try {
            const existingCommunity = await Community.findById(communityId);

            if (!existingCommunity) {
                throw new Error("Community not found");
            }

            await Community.findByIdAndDelete(communityId);
        } catch (error) {
            throw new CustomError("Error deleting community: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }


    async followCommunity(userId: string, communityId: string): Promise<{ status: string }> {
        try {
            const existingFollow = await Follower.findOne({
                followerId: new mongoose.Types.ObjectId(communityId),
                userId: new mongoose.Types.ObjectId(userId),
            });

            if (!existingFollow) {
                const follow = new Follower({
                    followerId: new mongoose.Types.ObjectId(communityId),
                    userId: new mongoose.Types.ObjectId(userId),
                    status: "Accepted",
                });
                await follow.save();
            }

            const followerCount = await Follower.countDocuments({ followerId: communityId, status: "Accepted" });
            //   SocketService.getInstance(io).emitFollowCommunity(communityId, followerCount);

            return { status: "Accepted" };
        } catch (error) {
            throw new CustomError("Error following community: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async unfollowCommunity(userId: string, communityId: string): Promise<void> {
        try {
            await Follower.findOneAndDelete({
                followerId: new mongoose.Types.ObjectId(communityId),
                userId: new mongoose.Types.ObjectId(userId),
            });

            const followerCount = await Follower.countDocuments({ followerId: communityId, status: "Accepted" });
            //   SocketService.getInstance(io).emitUnfollowCommunity(communityId, followerCount);
        } catch (error) {
            throw new CustomError("Error unfollowing community: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async fetchCommunityFollowers(communityId: string): Promise<IFollower[]> {
        try {
            const followers = await Follower.find({
                followerId: new mongoose.Types.ObjectId(communityId)
            }).populate("userId", "username displayName profileImage");
            return followers;
        } catch (error) {
            throw new CustomError("Error fetching community followers: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async checkFollowStatus(userId: string, communityId: string): Promise<boolean> {
        try {
            const follower = await Follower.findOne({
                userId: new mongoose.Types.ObjectId(userId),
                followerId: new mongoose.Types.ObjectId(communityId),
                status: 'Accepted'
            });
            return !!follower;
        } catch (error) {
            throw new CustomError("Error checking follow status: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }
}