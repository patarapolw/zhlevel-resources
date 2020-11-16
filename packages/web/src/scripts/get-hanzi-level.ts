import fs from "fs";
import Database, { mongoClient } from "../server/db/Database";

(async () => {
    await mongoClient.connect();
    const zhDb = new Database();

    let lv = 0;
    const allItems: string[] = [];
    let levelItems: string[] = [];

    fs.readFileSync("./resources/junda-simp.tsv", "utf-8").split("\n").map((row, i) => {
        if (i < 3000) {
            const hanzi = row.split("\t")[1];
            allItems.push(hanzi);
            levelItems.push(hanzi);

            if (levelItems.length >= 60) {
                lv++;
                zhDb.lvHanzi.insertMany(levelItems.map((h) => {
                    return {
                        entry: h,
                        level: lv
                    };
                }));

                levelItems = [];
            }
        }
    });

    fs.readFileSync("./resources/junda-trad.tsv", "utf-8").split("\n").map((row, i) => {
        if (lv < 60) {
            const hanzi = row.split("\t")[1];
            if (allItems.indexOf(hanzi) === -1) {
                levelItems.push(hanzi);
                console.log(i);

                if (levelItems.length >= 60) {
                    lv++;
                    zhDb.lvHanzi.insertMany(levelItems.map((h) => {
                        return {
                            entry: h,
                            level: lv
                        };
                    }));

                    levelItems = [];
                }
            }
        }
    });

    mongoClient.close();
})();
