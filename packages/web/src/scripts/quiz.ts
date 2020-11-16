import readline from "readline";
import Database, { mongoClient } from "../server/db/Database";
import VocabQuizRes from "../server/db/VocabQuizRes";
import { trimIndent } from "../server/db/Template";

(async () => {
    await mongoClient.connect();

    const db = new Database();
    const userId = (await db.user.findOne({email: "patarapolw@gmail.com"}))!._id!;
    const vocabQuizRes = new VocabQuizRes(db, userId);
    const vocabList = await vocabQuizRes.buildQuiz({
        level: 1,
        maxSrsLevel: 0
    });

    console.log(`${vocabList.length} entries to go...\n`);

    while (true) {
        const t = vocabList[Math.floor(Math.random() * vocabList.length)];
        const vocab = (await vocabQuizRes.findDef(t))[0];
        await prompt(vocab.front);
        console.log(vocab.back || "");
        const ans = await prompt(trimIndent(`
        Did you answer correctly?
        Y/y - Yes
        N/n - No
        Q/q - Quit :`));

        switch (ans.toLowerCase()) {
            case "y": vocabQuizRes.right(vocab); break;
            case "n": vocabQuizRes.wrong(vocab); break;
        }

        if (ans.toLowerCase() === "q") {
            break;
        }
    }

    mongoClient.close();
})();

async function prompt(q: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return await new Promise((resolve) => rl.question(q, (ans) => {
        rl.close();
        resolve(ans);
    }));
}
