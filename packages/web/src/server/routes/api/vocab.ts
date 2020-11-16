import { Router, Request, Response } from "express";
import VocabRes from "../../db/VocabRes";
import Database, { IVocab } from "../../db/Database";
import asyncHandler from "express-async-handler";

class VocabController {
    public static async post(req: Request, res: Response): Promise<Response> {
        const r = new VocabRes(new Database());
        const limit: number = req.body.limit || 10;
        let output: IVocab[] | null = null;

        if (req.body.entries) {
            const vocabs: string[] = req.body.entries;
            const result: IVocab[] = (await Promise.all(vocabs.map((el) => r.search(el))))
            .map((el) => el.slice(0, limit)).reduce((x, y) => [...x, ...y]);
            const ids = result.map((el) => el._id!);
            output = result.filter((el, i) => ids.indexOf(el._id!) === i);
        } else if (req.body.entry) {
            const vocab: string = req.body.entry;
            const result = await r.search(vocab);
            output = result.slice(0, limit);
        }

        if (!output) {
            return res.sendStatus(404);
        }

        return res.json(output);
    }

    public static async match(req: Request, res: Response) {
        const r = new VocabRes(new Database());
        let output: IVocab[] | null = null;

        if (req.body.entries) {
            const vocabs: string[] = req.body.entries;
            output = (await Promise.all(vocabs.map((v) => r.searchChineseMatch(v))))
            .reduce((x, y) => [...x, ...y]);
        } else if (req.body.entry) {
            const vocab: string = req.body.entry;
            output = await r.searchChineseMatch(vocab);
        }

        if (!output) {
            return res.sendStatus(404);
        }

        return res.json(output);
    }

    public static async random(req: Request, res: Response) {
        const r = new VocabRes(new Database());
        const output: IVocab = await r.random();

        return res.json(output);
    }
}

export const router = Router();

router.post("/", asyncHandler(VocabController.post));
router.post("/match", asyncHandler(VocabController.match));
router.post("/random", asyncHandler(VocabController.random));

export default router;
