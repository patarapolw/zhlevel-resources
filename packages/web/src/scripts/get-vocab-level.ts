import fs from "fs";
import XRegexp from "xregexp";
import Database, { mongoClient } from "../server/db/Database";

interface IVocabLevel {
    [key: string]: string[];
}

async function getHsk() {
    await mongoClient.connect();
    const zhDb = new Database();

    const lv: string[][] = [];

    Array.from({length: 6}).forEach((_, i) => {
        lv[i] = fs.readFileSync(`./resources/hsk/L${i + 1}.txt`, "utf8").trim().split("\n");
    });

    const vocabLevel: IVocabLevel = {
        1: lv[0].splice(0, 30),
        2: lv[0].splice(0, 30),
        3: lv[0].splice(0, 30),
        4: lv[0].splice(0, 30),
        5: lv[0].splice(0, 30),
        6: lv[1].splice(0, 30),
        7: lv[1].splice(0, 30),
        8: lv[1].splice(0, 30),
        9: lv[1].splice(0, 30),
        10: lv[1],
        11: lv[2].splice(0, 30),
        12: lv[2].splice(0, 30),
        13: lv[2].splice(0, 30),
        14: lv[2].splice(0, 30),
        15: lv[2].splice(0, 30),
        16: lv[2].splice(0, 30),
        17: lv[2].splice(0, 30),
        18: lv[2].splice(0, 30),
        19: lv[2].splice(0, 30),
        20: lv[2],
        21: lv[3].splice(0, 60),
        22: lv[3].splice(0, 60),
        23: lv[3].splice(0, 60),
        24: lv[3].splice(0, 60),
        25: lv[3].splice(0, 60),
        26: lv[3].splice(0, 60),
        27: lv[3].splice(0, 60),
        28: lv[3].splice(0, 60),
        29: lv[3].splice(0, 60),
        30: lv[3],
        31: lv[4].splice(0, 130),
        32: lv[4].splice(0, 130),
        33: lv[4].splice(0, 130),
        34: lv[4].splice(0, 130),
        35: lv[4].splice(0, 130),
        36: lv[4].splice(0, 130),
        37: lv[4].splice(0, 130),
        38: lv[4].splice(0, 130),
        39: lv[4].splice(0, 130),
        40: lv[4],
        41: lv[5].splice(0, 125),
        42: lv[5].splice(0, 125),
        43: lv[5].splice(0, 125),
        44: lv[5].splice(0, 125),
        45: lv[5].splice(0, 125),
        46: lv[5].splice(0, 125),
        47: lv[5].splice(0, 125),
        48: lv[5].splice(0, 125),
        49: lv[5].splice(0, 125),
        50: lv[5].splice(0, 125),
        51: lv[5].splice(0, 125),
        52: lv[5].splice(0, 125),
        53: lv[5].splice(0, 125),
        54: lv[5].splice(0, 125),
        55: lv[5].splice(0, 125),
        56: lv[5].splice(0, 125),
        57: lv[5].splice(0, 125),
        58: lv[5].splice(0, 125),
        59: lv[5].splice(0, 125),
        60: lv[5]
    };

    const allVocab: string[] = [];
    for (const k of Object.keys(vocabLevel)) {
        vocabLevel[k].forEach((vocab) => {
            if (allVocab.indexOf(vocab) !== -1) {
                vocabLevel[k].splice(vocabLevel[k].indexOf(vocab), 1);
            } else {
                allVocab.push(vocab);
            }
        });
        console.log(vocabLevel[k].length);
    }

    for (const k of Object.keys(vocabLevel)) {
        zhDb.lvVocab.updateMany({entry: {$in: vocabLevel[k]}}, {$set: {tag: ["HSK"]}});
    }

    mongoClient.close();
}

async function getInternet() {
    await mongoClient.connect();

    const zhDb = new Database();

    const existingVocab = (await zhDb.lvVocab.find().toArray()).map((el) => el.entry);
    let lv = 0;
    let lvNeeded = 500 - await zhDb.lvVocab.find({
        level: (lv + 1),
        tag: "HSK"
    }).count();
    let vocabList: string[] = [];

    console.log(lvNeeded);

    const rows = fs.readFileSync("./resources/internet.num", "utf8").trim().split("\n");
    for (const row of rows) {
        const c = row.split(" ");
        if (lv < 60) {
            const vocab = c[2];
            if (existingVocab.indexOf(vocab) === -1 && XRegexp("\\p{Han}").test(vocab)) {
                vocabList.push(vocab);

                if (vocabList.length >= lvNeeded) {
                    // zhDb.lvVocab.insertMany(vocabList.map((v) => {
                    //     return {
                    //         entry: v,
                    //         level: lv + 1
                    //     };
                    // }));
                    zhDb.lvVocab.updateMany({entry: {$in: vocabList}}, {$set: {tag: ["internet"]}});

                    lv++;
                    lvNeeded = 500 - await zhDb.lvVocab.find({level: (lv + 1)}).count();
                    vocabList = [];
                }
            }
        } else {
            break;
        }
    }

    mongoClient.close();
}

(() => {
    getInternet();
})();
