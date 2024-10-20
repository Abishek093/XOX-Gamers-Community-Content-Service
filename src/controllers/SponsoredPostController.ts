import { Request, Response } from "express";
import { ISponsoredPostInteractor } from "../interfaces/ISponsoredPostInteractor";
import { NextFunction } from "express-serve-static-core";

export class SponsoredPostController {
    constructor(private sponsoredPostInteractor: ISponsoredPostInteractor) {}

    fetchSponsoredPosts = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const posts = await this.sponsoredPostInteractor.fetchSponsoredPosts();
            res.status(200).json(posts)
        } catch (error) {
            next(error)
        }
    }
}
