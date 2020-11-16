import m from "mithril";
import XRegExp from "xregexp";
import CodeArea from "../components/CodeArea";
import { postJson } from "../utils";
import pinyin from "chinese-to-pinyin";
import Loader from "../components/Loader";

const isHanRegex = XRegExp("\\p{Han}");

export default () => {
    let textSegments: any[] = [];
    let isLoading = true;

    function parseSentence(entry: string, additionalElements: any[] = []) {
        isLoading = true;
        if (entry.trim().length > 0) {
            postJson("/api/jieba/", { entry }).then((res) => {
                textSegments = [...res.map((el: any) => {
                    return isHanRegex.test(el.word) ? m("ruby", [
                        m("rt", pinyin(el.word)),
                        m(".zh-contextmenu.vocab", el.word)
                    ]) : el.word;
                }), ...additionalElements];
                isLoading = false;
                m.redraw();
            });
        } else {
            (async () => {
                return {
                    sentence: (await postJson("/api/sentence/random", {})).chinese,
                    vocab: (await postJson("/api/vocab/random", {})).simplified
                };
            })().then((r) => {
                parseSentence(
                    "Sentence of the day: \n" +
                    r.sentence + "\n\n" +
                    "Word of the day: \n" +
                    r.vocab, [
                        m(".align-right", [
                            m("button.btn.btn-outline-success", {
                                onclick() {
                                    parseSentence("");
                                }
                            }, "Refresh")
                        ])
                    ]);
            });
        }
    }

    return {
        oncreate() {
            parseSentence("");
        },
        view() {
            return m(".row.mt-3", [
                m(".col-md-6", {
                    style: {
                        display: "inline-block"
                    }
                }, [
                    m(CodeArea, {
                        onchange(v: string) {
                            parseSentence(v);
                        }
                    })
                ]),
                m(".col-md-6", [
                    isLoading ? m(Loader) : m("pre", textSegments)
                ])
            ]);
        }
    };
};
