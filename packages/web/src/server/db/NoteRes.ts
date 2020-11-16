import Database, { INote } from "./Database";
import { ObjectID } from "bson";
import { FilterQuery } from "mongodb";

export default class NoteRes {
    private db: Database;
    private userId: ObjectID;

    constructor(db: Database, userId: ObjectID) {
        this.db = db;
        this.userId = userId;
    }

    public async get(type: string, entry: string): Promise<INote> {
        const output = await this.db.note.findOne({
            userId: this.userId,
            type, entry
        });

        if (!output) {
            throw new Error("Note not found");
        }

        return output;
    }

    public async find(type: string, cond: FilterQuery<INote[]>): Promise<INote[]> {
        const output = await this.db.note.find({
            userId: this.userId,
            type,
            ...cond
        }).toArray();

        return output;
    }

    public async delete(type: string, entry: string): Promise<boolean> {
        const n = await this.get(type, entry);
        const [_d, _] = await Promise.all([
            this.db.note.deleteOne({ _id: n._id! }),
            this.db.card.deleteMany({ noteId: n._id! })
        ]);
        const d = _d.deletedCount;

        return d !== undefined && d > 0;
    }

    public async getOrCreate(type: string, entry: string): Promise<INote> {
        return (await this.db.note.findOneAndUpdate({
            userId: this.userId,
            type,
            entry
        }, {
            $setOnInsert: {
                userId: this.userId,
                type,
                entry,
                modified: new Date()
            } as INote
        }, {
            returnOriginal: false,
            upsert: true
        })).value!;
    }
}
