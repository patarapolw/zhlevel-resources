import { Request, Response, Router } from "express";
import ProgressRes from "../../db/ProgressRes";
import Database from "../../db/Database";
import { getUserId } from "./util";
import asyncHandler from "express-async-handler";

class ProgressController {
    public static async get(req: Request, res: Response): Promise<Response> {
        const userId = await getUserId(req);
        const r = new ProgressRes(new Database(), userId);

        return res.json(await r.get());
    }
}

export const router = Router();
router.post("/", asyncHandler(ProgressController.get));

export default router;
