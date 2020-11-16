import { writeFileSync } from "fs";
import Database, { mongoClient } from "../server/db/Database";

(async () => {
    await mongoClient.connect();

    const zhDb = new Database();

    writeFileSync("./dump/zh.json", JSON.stringify({
        zhdata: {
            sentence: await zhDb.sentence.find().toArray(),
            token: await zhDb.token.find().toArray(),
            vocab: await zhDb.vocab.find().toArray()
        },
        zhlevel: {
            hanzi: await zhDb.lvHanzi.find().toArray(),
            vocab: await zhDb.lvVocab.find().toArray()
        }
    }));

    mongoClient.close();
})();
