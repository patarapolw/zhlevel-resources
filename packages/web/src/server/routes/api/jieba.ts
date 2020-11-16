import nodeJieba from "nodejieba";
import { Router } from "express";

export const router = Router();

router.post("/", (req, res) => {
    res.json(nodeJieba.cut(req.body.entry, true));
});

export default router;
