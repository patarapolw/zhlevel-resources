import { Router, Request, Response } from "express";
import Database, { ICard } from "../../db/Database";
import { getUserId } from "./util";
import { FilterQuery, ObjectID } from "mongodb";
import moment from "moment";
import CardRes from "../../db/CardRes";
import asyncHandler from "express-async-handler";

class EditorController {
    public static async find(req: Request, res: Response): Promise<Response> {
        const db = new Database();
        const userId = await getUserId(req);

        const cond: FilterQuery<ICard> = req.body.cond || {};
        const offset: number = req.body.offset || 0;
        const limit: number = req.body.limit || 0;

        const total = await db.card.find({userId, ...cond}).count();
        const data = await db.card.aggregate([
            {$match: {userId, ...cond}},
            {$lookup: {
                from: "note",
                localField: "noteId",
                foreignField: "_id",
                as: "note"
            }},
            {$unwind: "$note"},
            {$project: {
                _id: {$toString: "$_id"},
                front: 1,
                back: 1,
                mnemonic: 1,
                srsLevel: 1,
                nextReview: {$toString: "$nextReview"},
                entry: "$note.entry",
                tag: "$note.tag"
            }},
            {$sort: {srsLevel: 1, entry: 1}}
        ])
            .skip(offset)
            .limit(limit)
            .toArray();

        return res.json({data, total});
    }

    public static async update(req: Request, res: Response): Promise<Response> {
        const db = new Database();

        const _id: ObjectID = new ObjectID(req.body._id as string);
        const fieldName: string = req.body.fieldName;
        let fieldData: string | string[] | number | Date;

        if (fieldName === "srsLevel") {
            fieldData = typeof req.body.fieldData === "number" ? req.body.fieldData : parseInt(req.body.fieldData);
            if (fieldData < 0 || fieldData > CardRes.srsMap.length) {
                return res.sendStatus(304);
            }
        } else if (fieldName === "nextReview") {
            const m = moment(req.body.fieldData);
            if (!m.isValid()) {
                return res.sendStatus(304);
            }
            fieldData = m.toDate();
        } else if (fieldName === "tag") {
            if (!Array.isArray(req.body.fieldData)) {
                return res.sendStatus(304);
            }
            fieldData = req.body.fieldData as string[];
        } else {
            if (typeof req.body.fieldData !== "string") {
                return res.sendStatus(304);
            }
            fieldData = req.body.fieldData as string;
        }

        let isSuccessful = false;

        if (["_id", "entry"].indexOf(fieldName) !== -1) {
            return res.sendStatus(304);
        } else if (fieldName === "tag") {
            isSuccessful = (await db.note.updateOne({
                _id: (await db.card.findOne({_id}))!.noteId
            }, {$set: {[fieldName]: fieldData}})).modifiedCount > 0;
        } else {
            isSuccessful = (await db.card.updateOne({_id}, {$set: {[fieldName]: fieldData}})).modifiedCount > 0;
        }

        return isSuccessful ? res.json(_id.toHexString()) : res.sendStatus(304);
    }

    public static async delete(req: Request, res: Response): Promise<Response> {
        const db = new Database();

        const _id: ObjectID = new ObjectID(req.body._id as string);
        const deletedCount = (await db.card.deleteOne({_id})).deletedCount;

        return res.sendStatus(deletedCount ? 201 : 304);
    }
}

const router = Router();

router.post("/", asyncHandler(EditorController.find));
router.put("/", asyncHandler(EditorController.update));
router.delete("/", asyncHandler(EditorController.delete));

export default router;
