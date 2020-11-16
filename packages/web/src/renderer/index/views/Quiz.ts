import $ from "jquery";
import showdown from "showdown";
import XRegExp from "xregexp";
import uuid from "uuid";
import m from "mithril";
import { fetchJSON, shuffle } from "../../util";
import Loader from "../components/Loader";
import { IVocabQuiz } from "../../../server/db/VocabQuizRes";
import SimpleMDE from "simplemde";
import tingle from "tingle.js";
import "simplemde/dist/simplemde.min.css";
import "tingle.js/dist/tingle.min.css";

let quizOptions = {
    maxSrsLevel: 3
} as IVocabQuiz;

try {
    quizOptions = require("../../../user/quizOptions").default;
} catch (e) {}

const mdConverter = new showdown.Converter();

export default {
    view() {
        return m(Loader);
    },
    oncreate(vnode: any) {
        const $app = $(vnode.dom);

        (async () => {
            const entries: string[] = await fetchJSON("/api/quiz/build", quizOptions);
            $app.html("");
            $app.append(`
            <div id="zh-editor">
                <h3>Markdown Editor</h3>
                <textarea></textarea>
            </div>
            <div>${entries.length} entries to go...</div>`);

            const editorMde = new SimpleMDE({
                toolbar: false,
                spellChecker: false
            });

            const $zhEditor = $("#zh-editor");
            const editorDialog = new tingle.modal({
                footer: true,
                stickyFooter: false,
                closeMethods: ["overlay", "button", "escape"],
                closeLabel: "Cancel",
                onClose: () => {
                    editorMde.value("");
                }
            });

            editorDialog.setContent(document.getElementById("zh-editor")!);
            editorDialog.addFooterBtn("Save", "tingle-btn tingle-btn--primary", () => {
                const $parent = $(`#${$zhEditor.data("id")}`);
                $parent.find(".zh-text").each((i, el) => {
                    const $el = $(el);
                    const $zhEdit = $el.siblings(".zh-edit");
                    const fieldName = $zhEditor.data("side");

                    if ($zhEdit.find(".zh-side").text() === fieldName) {
                        const template = $parent.data("template");
                        const fieldData = editorMde.value();

                        fetchJSON("/api/quiz/update", {
                            template,
                            fieldName,
                            fieldData
                        }).then(() => {
                            template[fieldName] = fieldData;
                            $parent.data("template", template);

                            $el.html(md2html(fieldData));
                        });
                    }
                });
                editorDialog.close();
            });

            if (entries.length > 0) {
                $app.on("click", ".zh-edit", (e) => {
                    const $target = $(e.target);
                    const $parent = $target.closest(".zh-vocab");
                    const side = $target.find(".zh-side").text();

                    editorMde.value($parent.data("template")[side]);

                    $zhEditor.data("side", side);
                    $zhEditor.data("id", $parent.attr("id")!);

                    editorDialog.open();
                    setTimeout(() => {
                        editorMde.codemirror.refresh();
                    }, 0);
                });

                shuffle(entries);

                while (entries.length > 0) {
                    const entry = entries.splice(0, 1)[0];
                    const t = await fetchJSON("/api/quiz/findDef", { entry });
                    const id = uuid();

                    $app.append(`
                    <div id="${id}" class="zh-vocab">
                        <div class="zh-all">
                            <span class="zh-edit float-right" style='font-size:20px;'>
                                &#x270D;
                                <div class="hidden zh-side">front</div>
                                <div class="hidden zh-id">${id}</div>
                            </span>
                            <span class="zh-text">${md2html(t[0].front)}</span>
                        </div>
                        <div class="zh-back">
                            <span class="zh-edit float-right" style='font-size:20px;'>
                                &#x270D;
                                <div class="hidden zh-side">back</div>
                                <div class="hidden zh-id">${id}</div>
                            </span>
                            <span class="zh-text">${md2html(t[0].back)}</span>
                        </div>
                        <div class="zh-btn-list mt-3 mb-3">
                            <button class="btn btn-primary zh-front zh-btn-show">Show</button>
                            <button class="btn btn-success zh-back zh-btn-right">Right</button>
                            <button class="btn btn-danger zh-back zh-btn-wrong">Wrong</button>
                            <button class="btn btn-warning zh-back zh-btn-skip">Skip</button>
                        </div>
                    </div>
                    `);
                    window.scrollTo(0, document.body.scrollHeight);

                    const $parent = $(`#${id}`);
                    $(".zh-back", $parent).hide();
                    $(".zh-btn-show", $parent).click(() => {
                        $(".zh-front", $parent).hide();
                        $(".zh-back", $parent).show();
                        window.scrollTo(0, document.body.scrollHeight);
                    });

                    $parent.data("template", t[0]);

                    await new Promise((resolve, reject) => {
                        $(".zh-btn-right", $parent).click(() => {
                            const template = $parent.data("template");
                            fetchJSON("/api/quiz/right", {template});
                            resolve();
                        });

                        $(".zh-btn-wrong", $parent).click(() => {
                            const template = $parent.data("template");
                            fetchJSON("/api/quiz/wrong", {template});
                            resolve();
                        });

                        $(".zh-btn-skip", $parent).click(() => {
                            resolve();
                        });
                    });

                    $(".zh-btn-list", $parent).hide();
                }

                $app.append(`<div>All done!</div>`);
            } else {
                const [nextHour, nextDay] = await Promise.all([
                    fetchJSON("/api/quiz/build", {
                        ...quizOptions,
                        due: {hour: 1}
                    }),
                    fetchJSON("/api/quiz/build", {
                        ...quizOptions,
                        due: {hour: 24}
                    })
                ]);

                $app.append(`
                <div>Pending next hour: ${nextHour.length}</div>
                <div>Pending next day: ${nextDay.length}</div>`);
            }
        })();

        $(document).on("click", ".zh-speak", (e) => {
            const ut = new SpeechSynthesisUtterance($(e.target).text());
            ut.lang = "zh-CN";
            ut.rate = 0.8;
            speechSynthesis.speak(ut);
        });
    }
};

function md2html(md: string): string {
// tslint:disable-next-line: max-line-length
    XRegExp.forEach(md, XRegExp(`([^\\p{Han}]?)((?:\\p{Han}+(?:(?![\\[])[\\p{P}\\p{N}\\p{Z}\\p{Latin}])*)+\\p{Han}?)`),
    (mObj) => {
        if (["=", ">"].indexOf(mObj[1]) === -1) {
            const type = mObj[2].indexOf("。") !== -1 ? "sentence" : "vocab";

            md = md.replace(mObj[0], `${mObj[1]}<span class="zh-contextmenu ${type}">${mObj[2]}</span>`);
        }
    });

    XRegExp.forEach(md, /{([^}]+)}\(([^)]+)\)/, (mObj) => {
        md = md.replace(mObj[0], `<ruby><rt>${mObj[2]}</rt><rb>${mObj[1]}</rb></ruby>`);
    });

    return mdConverter.makeHtml(md);
}
