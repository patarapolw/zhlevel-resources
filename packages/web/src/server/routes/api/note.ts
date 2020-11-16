import { Request, Response, Router } from "express";
import NoteRes from "../../db/NoteRes";
import Database, { INote } from "../../db/Database";
import { getUserId } from "./util";
import asyncHandler from "express-async-handler";

class NoteController {
    public static async get(req: Request, res: Response): Promise<Response> {
        const userId = await getUserId(req);
        const r = new NoteRes(new Database(), userId);
        const entry: string = req.body.entry;
        const type: string = req.body.type;
        const output: INote = await r.get(type, entry);

        return res.json(output);
    }

    public static async check(req: Request, res: Response): Promise<Response> {
        const userId = await getUserId(req);
        const r = new NoteRes(new Database(), userId);
        const entry: string = req.body.entry;
        const type: string = req.body.type;

        try {
            await r.get(type, entry);
            return res.sendStatus(201);
        } catch (e) {
            return res.sendStatus(404);
        }
    }

    public static async getOrCreate(req: Request, res: Response) {
        const userId = await getUserId(req);
        const r = new NoteRes(new Database(), userId);
        const entry: string = req.body.entry;
        const type: string = req.body.type;
        const output: INote = await r.getOrCreate(type, entry);

        return res.json(output);
    }

    public static async delete(req: Request, res: Response) {
        const userId = await getUserId(req);
        const r = new NoteRes(new Database(), userId);
        const entry: string = req.body.entry;
        const type: string = req.body.type;
        const output: boolean = await r.delete(type, entry);

        return res.json(output);
    }
}

export const router = Router();

router.post("/", asyncHandler(NoteController.get));
router.put("/", asyncHandler(NoteController.getOrCreate));
router.delete("/", asyncHandler(NoteController.delete));
router.post("/check", asyncHandler(NoteController.check));

export default router;
