import { IVocab, ISentence } from "./Database";

export default interface ITemplate {
    entry: string;
    name?: string;
    front: string;
    back?: string;
}

export function vocabTemplate(vocab: IVocab): ITemplate[] {
    if (vocab.english === undefined) {
        vocab.english = vocab.simplified;
    }

    const entries = [
        {
            entry: vocab.simplified,
            name: "vocab EC",
            front: `### ${vocab.english}`,
            back: trimIndent(`
            ## ${vocab.simplified}

            ### ${vocab.traditional || ""}

            ${vocab.pinyin}`)
        }
    ];

    if (vocab.simplified !== vocab.english) {
        entries.push({
            entry: vocab.simplified,
            name: "vocab SE",
            front: `### ${vocab.simplified}`,
            back: trimIndent(`
            ## ${vocab.english}

            ### ${vocab.traditional || ""}

            ${vocab.pinyin}`)
        });
    }

    if (typeof vocab.traditional === "string" && vocab.traditional !== vocab.english) {
        entries.push({
            entry: vocab.simplified,
            name: "vocab TE",
            front: `### ${vocab.traditional}`,
            back: trimIndent(`
            ## ${vocab.english}

            ### ${vocab.simplified}

            ${vocab.pinyin}`)
        });
    }

    return entries;
}

export function sentenceTemplate(sentence: ISentence): ITemplate[] {
    if (sentence.english === undefined) {
        sentence.english = sentence.chinese;
    }

    const entries = [
        {
            entry: sentence.chinese,
            name: "sentence EC",
            front: `### ${sentence.english}`,
            back: trimIndent(`
            ## ${sentence.chinese}

            ${sentence.pinyin}`)
        }
    ];

    if (sentence.chinese !== sentence.english) {
        entries.push({
            entry: sentence.chinese,
            name: "sentence CE",
            front: `### ${sentence.chinese}`,
            back: trimIndent(`
            ## ${sentence.english}

            ${sentence.pinyin}`)
        });
    }

    return entries;
}

export function trimIndent(s: string): string {
    const lines = s.trim().split("\n");
    // @ts-ignore
    const margin = Math.min(...(lines.map((line) => {
        const m = /^( *)\w/.exec(line);
        return m ? m[1].length : null;
    }).filter((el) => el !== null)));

    return lines.map((line) => {
        return (line[0] !== " " || line.length < margin) ? line : line.substring(margin);
    }).join("\n");
}
