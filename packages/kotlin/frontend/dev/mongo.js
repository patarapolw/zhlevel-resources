const sqlite3 = require('better-sqlite3');
const mongodb = require("mongodb");
const XRegExp = require("xregexp");
const pinyin = require("chinese-to-pinyin");
require('dotenv').config({
    path: "../.env"
});

const sql = sqlite3("/Users/patarapolw/GitHubProjects/hanzileveljs/kotlin/src/main/resources/data.db", {
    readonly: true
});
const isHanRegex = XRegExp("\\p{Han}")

mongodb.MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true
}).then((client) => {
    console.log("Connected");

    const db = client.db("zhdata");
    const col = {
        vocab: db.collection("vocab"),
        token: db.collection("token"),
        sentence: db.collection("sentence")
    }

    // createSchema(col).then(() => {
        console.log("Schema created");
        importSentenceAndLink(col).then(() => {
            console.log("Data imported");
            client.close();
            console.log("Disconnected")
        });
    // });
}).catch((e) => console.error(e));

function createSchema(db) {
    return Promise.all([
        db.vocab.createIndex({
            simplified: 1,
            traditional: 1,
            pinyin: 1
        }, {
            unique: true
        }),
        db.token.createIndex({
            entry: 2
        }, {
            unique: true
        }),
        // db.sentence.createIndex({text: 3}, {unique: true}),
    ]);
}

function importData(db) {
    return Promise.all([
        importVocab(db),
        importToken(db),
        importSentenceAndLink(db)
    ])
}

function importVocab(db) {
    const vocabs = sql.prepare(`
    SELECT simplified, traditional, pinyin, english, frequency
    FROM vocab
    INNER JOIN token ON token.entry = simplified
    `).all();
    return db.vocab.insertMany(vocabs);
}

function _importTokenPart(s, part) {
    return sql.prepare(`
    SELECT s.entry AS x
    FROM token AS c
    INNER JOIN ${part} AS p ON p.token_id = c.id
    INNER JOIN token AS s ON p.${part}_id = s.id
    WHERE c.entry = ?
    ORDER BY s.frequency DESC
    `).all(s).map((r) => r.x);
}

function importToken(db) {
    return db.token.insertMany(sql.prepare("SELECT entry, frequency FROM token").all().map((r) => {
        if (isHanRegex.test(r.entry)) {
            Object.assign(r, {
                sub: _importTokenPart(r.entry, "sub"),
                super: _importTokenPart(r.entry, "super"),
                variant: _importTokenPart(r.entry, "variant")
            });
        }
        return r;
    }));
}

async function importSentenceAndLink(db) {
    const raw = sql.prepare(`
    SELECT s.text AS chinese, t.text AS english
    FROM sentence AS s
    INNER JOIN link ON sentence_id = s.id
    INNER JOIN sentence AS t ON translation_id = t.id
    WHERE s.lang = ? AND t.lang = ?
    `).all("cmn", "eng");
    const allChinese = raw.map((el) => el.chinese);

    const allEntries = raw.filter((el, i) => allChinese.indexOf(el.chinese) === i).map((el) => {
        return {
            chinese: el.chinese,
            pinyin: pinyin(el.chinese, {filterChinese: true}),
            english: el.english
        }
    })

    return await db.sentence.insertMany(allEntries);
}