import Database, { mongoClient } from "../server/db/Database";
import levelJson from "../server/db/level.json";

(async () => {
    await mongoClient.connect();

    const db = new Database();
    let v = (await db.lvVocab.find({
        entry: {$regex: `[${levelJson["1"]}]+`},
        level: {$lte: 1}
    }).project({entry: 1}).toArray()).map((el) => el.entry);

    const _v = (await db.note.find({entry: {$in: v}}).project({entry: 1}).toArray()).map((el) => el.entry);
    v = v.filter((el) => _v.indexOf(el) === -1);

    const s = await db.sentence.find({$or: v.map((el) => {
        return {chinese: {$regex: el}};
    })}).toArray();

    const sentences = s.map((el) => el.chinese);

    console.log(v.filter((el) => sentenceCount(el, sentences) > 0).sort((a, b) => {
        return sentenceCount(b, sentences) - sentenceCount(a, sentences);
    }).join("\n"));

    mongoClient.close();
})();

function sentenceCount(v: string, sentenceList: string[]): number {
    return sentenceList.filter((sent) => sent.indexOf(v) !== -1).length;
}
