import { Router } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import quizRouter from "./quiz";
import vocabRouter from "./vocab";
import radicalRouter from "./radical";
import sentenceRouter from "./sentence";
import noteRouter from "./note";
import jiebaRouter from "./jieba";
import progressRouter from "./progress";
import editorRouter from "./editor";

export const router = Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(cors());
router.use("/quiz", quizRouter);
router.use("/vocab", vocabRouter);
router.use("/radical", radicalRouter);
router.use("/sentence", sentenceRouter);
router.use("/note", noteRouter);
router.use("/jieba", jiebaRouter);
router.use("/progress", progressRouter);
router.use("/editor", editorRouter);

export default router;
