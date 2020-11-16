import RadicalRes from "../../db/RadicalRes";
import Database, { IToken } from "../../db/Database";
import { Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";

class RadicalController {
    public static async post(req: Request, res: Response): Promise<Response> {
        const r = new RadicalRes(new Database());
        const entry: string = req.body.entry;
        const output: IToken = await r.search(entry);

        return res.json(output);
    }

    public static async random(req: Request, res: Response): Promise<Response> {
        const r = new RadicalRes(new Database());
        const output: IToken = await r.random();

        return res.json(output);
    }
}

export const router = Router();

router.post("/", asyncHandler(RadicalController.post));
router.post("/random", asyncHandler(RadicalController.random));

export default router;
