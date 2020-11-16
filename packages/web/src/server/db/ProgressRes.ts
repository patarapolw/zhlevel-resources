import Database, { INote } from "./Database";
import { ObjectID } from "bson";
import levelJSON from "./level.json";
import NoteRes from "./NoteRes";

export interface IHanziToSrsLevel {
    hanzi: string;
    srsLevel?: number;
}

interface IHanziToSrsLevelMap {
    level: number;
    hanzis: IHanziToSrsLevel[];
}

interface IHToSListMap {
    [h: string]: number[];
}

export default class ProgressRes {
    private db: Database;
    private userId: ObjectID;
    private noteRes: NoteRes;

    constructor(db: Database, userId: ObjectID) {
        this.db = db;
        this.userId = userId;
        this.noteRes = new NoteRes(db, userId);
    }

    public async get(): Promise<IHanziToSrsLevel[][]> {
        const allHanzi = Object.values(levelJSON).join("").split("");

        const assNotes = await this.db.note.aggregate([
            {$match: {
                userId: this.userId,
                type: "vocab",
                $or: allHanzi.map((h) => {
                    return {entry: {$regex: h}};
                })
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
            {$unwind: "$c"},
            {$project: {
                entry: "$entry",
                srsLevel: {$max: "$c.srsLevel"}
            }}
        ]).toArray();

        const h2sListMap = {} as IHToSListMap;
        assNotes.forEach((el: any) => {
            el.entry.split("").forEach((h: string) => {
                h2sListMap[h] = h2sListMap[h] || [];
                h2sListMap[h].push(el.srsLevel || -1);
            });
        });

        const vLv = [] as IHanziToSrsLevelMap[];
        for (const lv of Object.keys(levelJSON)) {
            const hanziList = (levelJSON as any)[lv] as string;
            const vSubLv = [] as IHanziToSrsLevel[];

            hanziList.split("").forEach((h, i) => {
                vSubLv.push({
                    hanzi: h,
                    srsLevel: Math.max(-1, ...h2sListMap[h])
                });
            });

            vLv.push({
                level: parseInt(lv),
                hanzis: vSubLv
            });
        }

        return vLv.sort((a, b) => a.level - b.level).map((x) => x.hanzis);
    }
}
