import { Router } from "express";
import { CommunityRepository } from "../repositories/CommunityRepository";
import { CommunityInteractor } from "../interactors/CommunityInteractor";
import { CommunityController } from "../controllers/CommunityController";
import { protectUser } from "../middlewares/authMiddleware";

const communityRoutes = Router()

const communityRepository = new CommunityRepository()
const communityInteractor = new CommunityInteractor(communityRepository)
const communityController = new CommunityController(communityInteractor)



communityRoutes.post("/create-community", protectUser, communityController.createCommunity.bind(communityController));
communityRoutes.get("/fetch-all-communities", protectUser, communityController.fetchAllCommunities.bind(communityController));
communityRoutes.get("/fetch-community/:communityId", protectUser, communityController.fetchCommunity.bind(communityController));
communityRoutes.post("/community-post", protectUser, communityController.communityPost.bind(communityController));
communityRoutes.patch("/update-community/:communityId", protectUser, communityController.updateCommunity.bind(communityController));
communityRoutes.delete("/delete-community/:communityId", protectUser, communityController.deleteCommunity.bind(communityController));
communityRoutes.post("/follow/:communityId/user/:userId", protectUser, communityController.followCommunity.bind(communityController));
communityRoutes.delete("/unfollow/:communityId/user/:userId", protectUser, communityController.unfollowCommunity.bind(communityController));
communityRoutes.get("/fetchFollowers/:communityId", protectUser, communityController.fetchCommunityFollowers.bind(communityController));
communityRoutes.get('/follower/:userId/community/:communityId', protectUser, communityController.checkFollowStatus.bind(communityController));



export default communityRoutes