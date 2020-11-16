import express from "express";
import secured from "../middleware/secured";

const router = express.Router();

/* GET user profile. */
router.post("/user", secured(), (req, res, next) => {
    const { _raw, _json, ...userProfile } = req.user;
    res.json(userProfile);
});

export default router;
