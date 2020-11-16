import m from "mithril";
import XRegExp from "xregexp";
import $ from "jquery";
import url from "url";

import InputBar from "../components/InputBar";
import Loader from "../components/Loader";
import uuid4 from "uuid/v4";

export default () => {
    let subCompositions: any[] = [];
    let superCompositions: any[] = [];
    let variants: any[] = [];
    let vocab: any[] = [];
    let hanziList: string[] = [];
    let currentHanzi: string = "";
    let isRadicalLoading = true;
    let isVocabLoading = true;

    const current: any = {};

    let i: number = 0;

    const IsHanRegex = XRegExp("\\p{Han}");

    function parseHanziList(s: string, index?: number) {
        if (s.length > 0) {
            const _hanziList: any = XRegExp.matchChain(s, [IsHanRegex]);
            hanziList = (_hanziList === null ? hanziList : _hanziList)
                .filter((el: string, _i: number, self: any) => {
                    return self.indexOf(el) === _i;
                });

            if (index !== undefined) {
                i = index;
            }
        }
    }

    function getCharacterBlock(s: string) {
        const sUuid = s + uuid4().substring(0, 8);

        return m(".character-block", [
            m(`#${sUuid}-base.character-block-base`, {
                onmouseenter(e: any) {
                    const baseEl = e.target;
                    const hoverEl = document.getElementById(`${sUuid}-hover`);
                    const $baseOffset = $(baseEl).offset();

                    if (hoverEl !== null && $baseOffset !== undefined) {
                        $(hoverEl).offset({
                            left: $baseOffset.left + (baseEl.offsetWidth / 2) - (hoverEl.offsetWidth / 2),
                            top: $baseOffset.top + (baseEl.offsetHeight / 2) - (hoverEl.offsetHeight / 2)
                        });

                        baseEl.style.color = "white";
                    }
                }
            }, s),
            m(`#${sUuid}-hover.character-block-hover.hanzi.zh-contextmenu`, {
                onclick(e: any) {
                    parseHanziList(e.target.innerText, 0);
                },
                onmouseout(e: any) {
                    const baseEl = document.getElementById(`${sUuid}-base`);
                    const $hoverEl = $(e.target);

                    let observer: any = null;
                    function removeHoverEl() {
                        if ($(".context-menu-list").length === 0) {
                            $hoverEl.offset({
                                left: -9999
                            });

                            if (baseEl !== null) {
                                baseEl.style.color = "black";
                            }

                            if (observer !== null) {
                                observer.disconnect();
                            }
                        }
                    }

                    observer = new MutationObserver(removeHoverEl);
                    observer.observe(document.body,  { attributes: true, childList: true });

                    removeHoverEl();
                }
            }, s)
        ]);
    }

    return {
        view() {
            const q = url.parse(location.hash.substring(2), true).query.q as string;

            if (current.q !== q) {
                parseHanziList(q);
                current.q = q;
            }

            if (currentHanzi !== hanziList[i] && hanziList[i] !== undefined) {
                currentHanzi = hanziList[i];
                isRadicalLoading = true;
                $.post("/api/radical/", {
                    entry: hanziList[i]
                }).then((res) => {
                    subCompositions = res.sub.map((el: string) => getCharacterBlock(el));
                    superCompositions = res.super.map((el: string) => getCharacterBlock(el));
                    variants = res.variant.map((el: string) => getCharacterBlock(el));
                    isRadicalLoading = false;
                    m.redraw();
                });

                isVocabLoading = true;
                $.post("/api/vocab/", {
                    entry: hanziList[i]
                }).then((res) => {
                    vocab = res.map((el: any) => {
                        return m(".inline", [
                            m(".zh-contextmenu.vocab", el.simplified),
                            el.traditional === undefined ? "" : m(".zh-contextmenu.vocab", el.traditional),
                            m("div", `[${el.pinyin}]`),
                            m("div", el.english)
                        ]);
                    });
                    isVocabLoading = false;
                    m.redraw();
                });
            }

            return m(".row.mt-3", [
                m(".input-group", [
                    m(InputBar, {
                        parse(v: string) { parseHanziList(v, 0); }
                    })
                ]),
                m(".row.mt-3.full-width", [
                    m(".col-md-6.text-center", [
                        m("input.col-md-6.hanzi.zh-contextmenu", {
                            oninput(e: any) {
                                parseHanziList(e.target.value);
                                return true;
                            },
                            value: hanziList[i]
                        }),
                        m(".button-prev-next", [
                            m(".btn-group.col-auto", [
                                m("button.btn.btn-info.btn-default", {
                                    disabled: !(i > 0),
                                    onclick(e: any) { i--; m.redraw(); }
                                }, "Previous"),
                                m("button.btn.btn-info.btn-default", {
                                    disabled: !(i < hanziList.length - 1),
                                    onclick(e: any) { i++; m.redraw(); }
                                }, "Next")
                            ])
                        ])
                    ]),
                    m(".col-md-6", [
                        m(".row", m("h4", "Subcompositions")),
                        m(".row.hanzi-list",
                            isRadicalLoading ? m(Loader) : subCompositions),
                        m(".row", m("h4", "Supercompositions")),
                        m(".row.hanzi-list",
                            isRadicalLoading ? m(Loader) : superCompositions),
                        m(".row", m("h4", "Variants")),
                        m(".row.hanzi-list",
                            isRadicalLoading ? m(Loader) : variants),
                        m(".row", m("h4", "Vocabularies")),
                        m(".row.vocab-list",
                            isVocabLoading ? m(Loader) : vocab)
                    ])
                ])
            ]);
        }
    };
};
