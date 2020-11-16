import $ from "jquery";
import showdown from "showdown";
import XRegExp from "xregexp";
import uuid from "uuid";
import quizOptions from "./user/quizOptions";

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./renderer/index/index.css";

const $app = $("#App");
const mdConverter = new showdown.Converter();

(async () => {
    const entries: string[] = await fetchJSON("/api/quiz/build", quizOptions);

    shuffle(entries);

    $app.append(`<div>${entries.length} entries to go...</div>`);

    while (entries.length > 0) {
        const entry = entries.splice(0, 1)[0];
        const t = await fetchJSON("/api/quiz/findDef", { entry });
        const id = uuid();

        $app.append(`
        <div id="v-${id}">
            <div class="zh-all">${md2html(t[0].front)}</div>
            <div class="zh-back">${md2html(t[0].back)}</div>
            <div class="zh-btn-list mt-3 mb-3">
                <button class="btn btn-primary zh-front zh-btn-show">Show</button>
                <button class="btn btn-success zh-back zh-btn-right">Right</button>
                <button class="btn btn-danger zh-back zh-btn-wrong">Wrong</button>
            </div>
        </div>
        `);
        window.scrollTo(0, document.body.scrollHeight);

        const $parent = $(`#v-${id}`);
        $(".zh-back", $parent).hide();
        $(".zh-btn-show", $parent).click(() => {
            $(".zh-front", $parent).hide();
            $(".zh-back", $parent).show();
            window.scrollTo(0, document.body.scrollHeight);
        });

        await new Promise((resolve, reject) => {
            $(".zh-btn-right", $parent).click(() => {
                fetchJSON("/api/quiz/right", {template: t[0]});
                resolve();
            });

            $(".zh-btn-wrong", $parent).click(() => {
                fetchJSON("/api/quiz/wrong", {template: t[0]});
                resolve();
            });
        });

        $(".zh-btn-list", $parent).hide();
    }
})();

$(document).on("click", ".zh-speak", (e) => {
    const ut = new SpeechSynthesisUtterance($(e.target).text());
    ut.lang = "zh-CN";
    ut.rate = 0.8;
    speechSynthesis.speak(ut);
});

function shuffle(a: any[]) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

async function fetchJSON(url: string, data: any) {
    return await (await fetch(url, {
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(data),
        method: "POST"
    })).json();
}

function md2html(md: string): string {
// tslint:disable-next-line: max-line-length
    XRegExp.forEach(md, XRegExp(`([^\\p{Han}]?)((?:\\p{Han}+(?:(?![\\[])[\\p{P}\\p{N}\\p{Z}\\p{Latin}])*)+\\p{Han}?)`),
    (m) => {
        if (["=", ">"].indexOf(m[1]) === -1) {
            md = md.replace(m[0], `${m[1]}<span class="zh-speak">${m[2]}</span>`);
        }
    });

    XRegExp.forEach(md, /{([^}]+)}\(([^)]+)\)/, (m) => {
        md = md.replace(m[0], `<ruby><rb>${m[1]}</rb><rt>${m[2]}</rt></ruby>`);
    });

    return mdConverter.makeHtml(md);
}
