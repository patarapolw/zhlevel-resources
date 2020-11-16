import Database, { ISentence } from "./Database";
import XRegExp from "xregexp";

export default class SentenceRes {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    public async search(s: string): Promise<ISentence[]> {
        return await this.db.sentence.find({chinese: new RegExp(XRegExp.escape(s), "i")}).toArray();
    }

    public async random(): Promise<ISentence> {
        return (await this.db.sentence.aggregate([
            {$sample: {size: 1}}
        ]).toArray())[0];
    }
}
