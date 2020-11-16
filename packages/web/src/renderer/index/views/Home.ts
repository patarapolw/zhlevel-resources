import m from "mithril";
import XRegExp from "xregexp";
import CodeArea from "../components/CodeArea";
import pinyin from "chinese-to-pinyin";
import Loader from "../components/Loader";

const isHanRegex = XRegExp("\\p{Han}");

export default () => {
    let textSegments: any[] = [];
    let isLoading = true;

    function parseSentence(entry: string, additionalElements: any[] = []) {
        isLoading = true;
        if (entry.trim().length > 0) {
            $.post("/api/jieba/", {entry}).then((res) => {
                textSegments = [...res.map((el: string) => {
                    return isHanRegex.test(el) ? m("ruby", [
                        m("rt", pinyin(el)),
                        m(".zh-contextmenu.vocab", el)
                    ]) : el;
                }), ...additionalElements];
                isLoading = false;
                m.redraw();
            });
        } else {
            Promise.all([
                $.post("/api/sentence/random"),
                $.post("/api/vocab/random")
            ]).then((r) => {
                parseSentence(
                    "Sentence of the day: \n" +
                    r[0].chinese + "\n\n" +
                    "Word of the day: \n" +
                    r[1].simplified, [
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
