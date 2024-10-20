import { Router } from "express";
import { SponsoredPostRepository } from "../repositories/SponsoredPostRepository";
import { SponsoredPostInteractor } from "../interactors/SponsoredPostInteractor";
import { SponsoredPostController } from "../controllers/SponsoredPostController";

const sponsoredPostRoutes = Router();

const sponsoredPostRepository = new SponsoredPostRepository();
const sponsoredPostInteractor = new SponsoredPostInteractor(sponsoredPostRepository);
const sponsoredPostController = new SponsoredPostController(sponsoredPostInteractor);

sponsoredPostRoutes.get('/', sponsoredPostController.fetchSponsoredPosts.bind(sponsoredPostController))


export default sponsoredPostRoutes;
