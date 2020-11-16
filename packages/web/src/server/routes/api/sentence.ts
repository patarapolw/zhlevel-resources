import SentenceRes from "../../db/SentenceRes";
import Database, { ISentence } from "../../db/Database";
import { Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";

class SentenceController {
    public static async post(req: Request, res: Response): Promise<Response> {
        const r = new SentenceRes(new Database());
        const entry: string = req.body.entry;
        const limit: number = req.body.limit || 10;
        const output: ISentence[] = (await r.search(entry)).slice(0, limit);

        return res.json(output);
    }

    public static async random(req: Request, res: Response): Promise<Response> {
        const r = new SentenceRes(new Database());
        const output: ISentence = await r.random();

        return res.json(output);
    }
}

export const router = Router();

router.post("/", asyncHandler(SentenceController.post));
router.post("/random", asyncHandler(SentenceController.random));

export default router;
