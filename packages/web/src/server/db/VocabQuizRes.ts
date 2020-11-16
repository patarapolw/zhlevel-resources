import pinyin from "chinese-to-pinyin";
import Database from "./Database";
import NoteRes from "./NoteRes";
import { ObjectID } from "bson";
import CardRes from "./CardRes";
import ITemplate, { trimIndent } from "./Template";
import XRegExp from "xregexp";
import moment from "moment";

export interface IPartialVocab {
    simplified: string;
    traditional?: string;
    pinyin: string;
    english?: string;
}

export interface IDue {
    [key: string]: number;
}

export interface IVocabQuiz {
    level?: number;
    maxSrsLevel?: number;
    vocabList?: string[];
    due?: IDue;
}

export default class VocabQuizRes {
    private userId: ObjectID;
    private db: Database;
    private noteRes: NoteRes;
    private cardRes: CardRes;

    constructor(db: Database, userId: ObjectID) {
        this.db = db;
        this.noteRes = new NoteRes(db, userId);
        this.cardRes = new CardRes(db, userId);
        this.userId = userId;
    }

    public async right(template: ITemplate): Promise<boolean> {
        const note = await this.noteRes.getOrCreate("vocab", template.entry);
        return await this.cardRes.markCorrect(note._id!, template);
    }

    public async wrong(template: ITemplate): Promise<boolean> {
        const note = await this.noteRes.getOrCreate("vocab", template.entry);
        return await this.cardRes.markWrong(note._id!, template);
    }

    public async update(template: ITemplate, fieldName: string, fieldData: string): Promise<boolean> {
        const note = await this.noteRes.getOrCreate("vocab", template.entry);
        return await this.cardRes.update(note._id!, template, fieldName, fieldData);
    }

    public async buildQuiz(cond: IVocabQuiz): Promise<string[]> {
        const {level, maxSrsLevel, vocabList, due} = cond;

        let inclusion: string[] = [];
        if (!level && vocabList) {
            inclusion = vocabList;
        } else {
            const c0 = {} as any;

            if (level) {
                c0.level = {$lte: level || 60};
            }

            if (vocabList) {
                c0.entry = {$in: vocabList};
            }

            if (level || vocabList) {
                inclusion = (await this.db.lvVocab.find(c0).project({entry: 1}).toArray())
                .map((el) => el.entry);
            }
        }

        const dueDate = moment();
        if (due) {
            dueDate.add(due.hour || 0, "hour");
        }

        return (await this.db.note.aggregate([
            {$match: {
                userId: this.userId,
                type: "vocab",
                entry: inclusion.length > 0 ? {$in: inclusion} : {$exists: true}
            }},
            {$project: {
                _id: 1,
                entry: 1
            }},
            {$lookup: {
                from: "card",
                localField: "_id",
                foreignField: "noteId",
                as: "c"
            }},
            {$unwind: {
                path: "$c",
                preserveNullAndEmptyArrays: true
            }},
            {$project: {
                entry: "$entry",
                srsLevel: {$max: "$c.srsLevel"},
                nextReview: {$min: "$c.nextReview"}
            }},
            {$match: {
                srsLevel: {$not: {$gt: maxSrsLevel}},
                nextReview: {$not: {$gt: dueDate.toDate()}}
            }},
            {$project: {entry: 1}}
        ]).toArray()).map((el) => el.entry);
    }

    public async findDef(entry: string): Promise<ITemplate[]> {
        const t = await this.db.note.aggregate([
            {$match: {
                userId: this.userId,
                entry,
                type: "vocab"
            }},
            {$lookup: {
                from: "card",
                localField: "_id",
                foreignField: "noteId",
                as: "c"
            }},
            {$unwind: "$c"},
            {$project: {
                entry: 1,
                front: "$c.front",
                back: "$c.back"
            }},
            {$limit: 1}
        ]).toArray() as any[];

        if (t.length > 0) {
            return t as ITemplate[];
        }

        let vocab: IPartialVocab = {
            simplified: entry,
            pinyin: entry
        };

        let vocabs: IPartialVocab[] = await this.db.vocab.find({$or: [
                {simplified: entry},
                {traditional: entry}
        ]}).toArray();

        if (vocabs.length === 0) {
            vocabs = await this.db.userVocab.find({$and: [
                {userId: this.userId},
                {$or: [
                    {simplified: entry},
                    {traditional: entry}
                ]}
            ]}).toArray();
        }

        if (vocabs.length > 0) {
            vocab = vocabs.filter((el) => {
                let en = el.english;
                if (en) {
                    en = en.toLowerCase();
                    return [el.simplified, "surname"].every((key) => en!.indexOf(key) === -1);
                } else {
                    return true;
                }
            })[0] || vocabs[0];
        } else {
            vocab.pinyin = pinyin(entry);
        }

        return (await this.getTemplate(vocab));
    }

    private async getTemplate(vocab: IPartialVocab): Promise<ITemplate[]> {
        if (vocab.english === undefined) {
            vocab.english = vocab.simplified;
        }

        const entry = vocab.simplified;
        const sentences = (await this.db.sentence.find({
            chinese: new RegExp(XRegExp.escape(vocab.simplified), "i")
        }, {limit: 10}).toArray()).map((s) => {
                return trimIndent(`
                - {${s.chinese}}(${s.pinyin})
                    - ${s.english}`);
            }).join("\n");

        const entries = [
            {
                entry,
                name: "vocab EC",
                front: `### ${vocab.english}`,
                back: trimIndent(`
                ## ${vocab.simplified}

                ### ${vocab.traditional || ""}

                ${vocab.pinyin}

                ${sentences}`)
            }
        ];

        if (vocab.simplified !== vocab.english) {
            entries.push({
                entry,
                name: "vocab SE",
                front: `### ${vocab.simplified}`,
                back: trimIndent(`
                ## ${vocab.english}

                ### ${vocab.simplified} | ${vocab.traditional || ""}

                ${vocab.pinyin}

                ${sentences}`)
            });
        }

        if (typeof vocab.traditional === "string" && vocab.traditional !== vocab.english) {
            entries.push({
                entry,
                name: "vocab TE",
                front: `### ${vocab.traditional}`,
                back: trimIndent(`
                ## ${vocab.english}

                ### ${vocab.simplified}

                ${vocab.pinyin}

                ${sentences}`)
            });
        }

        return entries;
    }
}
