import { Router, Request, Response, NextFunction } from "express";
import VocabQuizRes, { IDue } from "../../db/VocabQuizRes";
import Database from "../../db/Database";
import { getUserId } from "./util";
import ITemplate from "../../db/Template";
import asyncHandler from "express-async-handler";

class QuizController {
    public static async buildQuiz(req: Request, res: Response): Promise<Response> {
        const userId = await getUserId(req);
        const r = new VocabQuizRes(new Database(), userId);

        const level: number | undefined = req.body.level;
        const maxSrsLevel: number | undefined = req.body.maxSrsLevel;
        const vocabList: string[] | undefined = req.body.vocabList;
        const due: IDue | undefined = req.body.due;
        const output: string[] = await r.buildQuiz({level, maxSrsLevel, vocabList, due});

        return res.json(output);
    }

    public static async findDef(req: Request, res: Response): Promise<Response> {
        const userId = await getUserId(req);
        const r = new VocabQuizRes(new Database(), userId);

        const entry: string = req.body.entry;
        const output: ITemplate[] = await r.findDef(entry);

        return res.json(output);
    }

    public static async right(req: Request, res: Response): Promise<Response> {
        const userId = await getUserId(req);
        const r = new VocabQuizRes(new Database(), userId);

        const template: ITemplate = req.body.template;
        const output: boolean = await r.right(template);

        return res.sendStatus(output ? 201 : 404);
    }

    public static async wrong(req: Request, res: Response): Promise<Response> {
        const userId = await getUserId(req);
        const r = new VocabQuizRes(new Database(), userId);

        const template: ITemplate = req.body.template;
        const output: boolean = await r.wrong(template);

        return res.sendStatus(output ? 201 : 404);
    }

    public static async update(req: Request, res: Response): Promise<Response> {
        const userId = await getUserId(req);
        const r = new VocabQuizRes(new Database(), userId);

        const template: ITemplate = req.body.template;
        const fieldName: string = req.body.fieldName;
        const fieldData: string = req.body.fieldData;

        const output: boolean = await r.update(template, fieldName, fieldData);

        return res.sendStatus(output ? 201 : 404);
    }
}

export const router = Router();

router.post("/build", asyncHandler(QuizController.buildQuiz));
router.post("/findDef", asyncHandler(QuizController.findDef));
router.post("/right", asyncHandler(QuizController.right));
router.post("/wrong", asyncHandler(QuizController.wrong));
router.post("/update", asyncHandler(QuizController.update));

export default router;
