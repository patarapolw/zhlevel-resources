import Database, { IVocab } from "./Database";
import XRegExp from "xregexp";
import { ObjectID } from "bson";

export default class VocabRes {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    public async searchChinese(s: string): Promise<IVocab[]> {
        return this.sorter(await this.db.vocab.find({$or: [
            { simplified: new RegExp(XRegExp.escape(s), "i") },
            { traditional: new RegExp(XRegExp.escape(s), "i") }
        ]}).toArray());
    }

    public async searchChineseMatch(s: string): Promise<IVocab[]> {
        return this.sorter(await this.db.vocab.find({$or: [
            { simplified: s },
            { traditional: s }
        ]}).toArray());
    }

    public async searchPinyin(s: string): Promise<IVocab[]> {
        return this.sorter(await this.searchOne(s, "pinyin"));
    }

    public async searchEnglish(s: string): Promise<IVocab[]> {
        return this.sorter(await this.searchOne(s, "english"));
    }

    public async search(s: string): Promise<IVocab[]> {
        if (XRegExp("\\p{Han}").test(s)) {
            return this.searchChinese(s);
        } else {
            return this.searchNonChinese(s);
        }
    }

    public async random(): Promise<IVocab> {
        return (await this.db.vocab.aggregate([
            {$match: {frequency: {$gt: 0}}},
            {$sample: {size: 1}}
        ]).toArray())[0];
    }

    private async searchOne(s: string, col: string): Promise<IVocab[]> {
        return await this.db.vocab.find({[col]: new RegExp(XRegExp.escape(s), "i")}).toArray();
    }

    private async searchNonChinese(s: string): Promise<IVocab[]> {
        const [pinyinList, englishList] = await Promise.all([
            await this.searchOne(s, "pinyin"),
            await this.searchOne(s, "english")
        ]);

        const output: IVocab[] = [];
        const usedId: ObjectID[] = [];
        pinyinList.forEach((el) => {
            if (usedId.indexOf(el._id!) === -1) {
                output.push(el);
                usedId.push(el._id!);
            }
        });

        englishList.forEach((el) => {
            if (usedId.indexOf(el._id!) === -1) {
                output.push(el);
                usedId.push(el._id!);
            }
        });

        return this.sorter(output);
    }

    private sorter(ls: IVocab[]): IVocab[] {
        return ls.sort((a, b) => {
            return (b.frequency || 0) - (a.frequency || 0);
        });
    }
}
