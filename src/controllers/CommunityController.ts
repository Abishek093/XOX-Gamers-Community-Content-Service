import { NextFunction, Request, Response } from "express";
import { CommunityInteractor } from "../interactors/CommunityInteractor";

export class CommunityController {
    constructor(private interactor: CommunityInteractor) { }

    createCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { userID, communityName, description, postPermission, communityImage } = req.body
        try {
            const newCommunity = await this.interactor.createCommunity(userID, communityName, description, postPermission, communityImage)
            res.status(200).json(newCommunity)
        } catch (error) {
            next(error)
        }
    }

    fetchAllCommunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const communities = await this.interactor.fetchCommunities();
            res.status(200).json(communities);
        } catch (error) {
            next(error)
        }
    };

    fetchCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { communityId } = req.params
            const communities = await this.interactor.fetchCommunity(communityId);
            res.status(200).json(communities);
        } catch (error) {
            next(error)
        }
    };

    communityPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userName, postImageUrl, description, communityId } = req.body
            console.log("req.body", req.body)
            const result = await this.interactor.createCommunityPost(userName, postImageUrl, description, communityId)
            res.status(200).json({ message: 'Post added successfully' })
        } catch (error) {
            next(error)
        }
    }

    updateCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        const { communityId } = req.params;
        const { name, description, postPermission, image } = req.body;
        try {
            const updatedCommunity = await this.interactor.updateCommunity(
                communityId,
                name,
                description,
                postPermission,
                image
            );
            res.status(200).json(updatedCommunity)
        } catch (error) {
            next(error)
        }
    };

    deleteCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { communityId } = req.params;
            await this.interactor.deleteCommunity(communityId);
            res.status(200).json({ message: 'Community deleted successfully' })
        } catch (error) {
            next(error)
        }
    };

    followCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { communityId, userId } = req.params;
        try {
            const result = await this.interactor.followCommunity(userId, communityId);
            res.status(200).json(result);
        } catch (error) {
            next(error)
        }
    };

    unfollowCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { communityId, userId } = req.params;
        try {
            await this.interactor.unfollowCommunity(userId, communityId);
            res.status(200).json({ message: "Unfollow successful" });
        } catch (error) {
            next(error)
        }
    };

    fetchCommunityFollowers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { communityId } = req.params;
            const followers = await this.interactor.fetchCommunityFollowers(communityId);
            res.status(200).json(followers);
        } catch (error) {
            next(error)
        }
    };

    checkFollowStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { userId, communityId } = req.params;
        try {
            const isFollowing = await this.interactor.checkFollowStatus(userId, communityId);
            res.status(200).json({ isFollowing });
        } catch (error) {
            next(error)
        }
    }
}