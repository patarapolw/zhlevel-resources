import Database, { ICard } from "./Database";
import { ObjectID } from "bson";
import ITemplate from "./Template";
import { FilterQuery } from "mongodb";
import moment from "moment";

export default class CardRes {
    public static srsMap = ["4h", "8h", "1d", "3d", "1w", "2w", "1M", "4M"];

    private db: Database;
    private userId: ObjectID;

    constructor(db: Database, userId: ObjectID) {
        this.db = db;
        this.userId = userId;
    }

    public async markCorrect(noteId: ObjectID, template: ITemplate): Promise<boolean> {
        const card = await this.getOrCreate(noteId, template);
        return (await this.db.card.updateOne({_id: card._id}, {$set: {
            srsLevel: card.srsLevel < CardRes.srsMap.length - 1 ? ++card.srsLevel : card.srsLevel,
            nextReview: this.getNextReview(card.srsLevel)
        }})).modifiedCount > 0;
    }

    public async markWrong(noteId: ObjectID, template: ITemplate): Promise<boolean> {
        const card = await this.getOrCreate(noteId, template);
        return (await this.db.card.updateOne({_id: card._id}, {$set: {
            srsLevel: card.srsLevel > 0 ? --card.srsLevel : card.srsLevel,
            nextReview: this.getNextReview(card.srsLevel)
        }})).modifiedCount > 0;
    }

    public async update(noteId: ObjectID, template: ITemplate, fieldName: string, fieldData: string): Promise<boolean> {
        const card = await this.getOrCreate(noteId, template);
        return (await this.db.card.updateOne({_id: card._id}, {$set: {
            [fieldName]: fieldData
        }})).modifiedCount > 0;
    }

    public async find(noteId: ObjectID, cond: FilterQuery<ICard>): Promise<ICard[]> {
        return await this.db.card.find({
            userId: this.userId,
            noteId,
            ...cond
        }).toArray();
    }

    private async getOrCreate(noteId: ObjectID, template: ITemplate) {
        const nextReview = new Date();
        nextReview.setHours(4);

        return (await this.db.card.findOneAndUpdate({
            userId: this.userId,
            noteId
            // front: template.front
        }, {
            $setOnInsert: {
                userId: this.userId,
                noteId,
                front: template.front,
                back: template.back,
                srsLevel: 0,
                nextReview
            } as ICard
        }, {
            returnOriginal: false,
            upsert: true
        })).value!;
    }

    private getNextReview(srsLevel: number): Date {
        const toAdd = CardRes.srsMap[srsLevel - 1];
        const nextReview = moment();
        if (toAdd === undefined) {
            nextReview.add(10, "minute");
            return nextReview.toDate();
        }
        const toAddNumber = parseInt(toAdd[0]);

        switch (toAdd[1]) {
            case "h":
                nextReview.add(toAddNumber, "hour");
                break;
            case "d":
                nextReview.add(toAddNumber, "day");
                break;
            case "w":
                nextReview.add(toAddNumber, "week");
                break;
            case "M":
                nextReview.add(toAddNumber, "month");
        }

        return nextReview.toDate();
    }
}
