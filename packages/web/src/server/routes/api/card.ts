import { Request, Response, Router } from "express";
import CardRes from "../../db/CardRes";
import Database from "../../db/Database";
import { getUserId } from "./util";
import ITemplate from "../../db/Template";
import { ObjectID } from "bson";
import asyncHandler from "express-async-handler";

class CardController {
    public static async correct(req: Request, res: Response): Promise<Response> {
        const userId = await getUserId(req);
        const r = new CardRes(new Database(), userId);
        const noteId: string = req.body.noteId;
        const template: ITemplate = req.body.template;
        const output: boolean = await r.markCorrect(new ObjectID(noteId), template);

        return res.json(output);
    }

    public static async wrong(req: Request, res: Response): Promise<Response> {
        const userId = await getUserId(req);
        const r = new CardRes(new Database(), userId);
        const noteId: string = req.body.noteId;
        const template: ITemplate = req.body.template;
        const output: boolean = await r.markWrong(new ObjectID(noteId), template);

        return res.json(output);
    }
}

export const router = Router();

router.post("/correct", asyncHandler(CardController.correct));
router.post("/wrong", asyncHandler(CardController.wrong));

export default router;
