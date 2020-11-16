import {ContextMenu} from "jquery-contextmenu";
import { postJson } from "../utils";

import "jquery-contextmenu/dist/jquery.contextMenu.min.css";
import Auth from "../auth/Auth";

async function databaseSubmenu(type: string, entry: string, auth: Auth) {
    const email = auth.getJwt().email;

    try {
        const r = await postJson("/api/user/note/check", { email, type, entry });

        if (r.isInDatabase) {
            return {
                remove: {
                    name: "Remove from database",
                    callback() {
                        fetch("/api/user/note/", {
                            method: "DELETE",
                            body: JSON.stringify({email, type, entry}),
                            headers: {
                                "Content-Type": "application/json"
                            }
                        })
                        .then((r1) => {
                            if (r1.status === 201) {
                                alert(`Removed ${type}: ${entry}`);
                            }
                        });
                    }
                }
            };
        } else {
            return {
                add: {
                    name: "Add to database",
                    callback(e: any, key: any, current: any) {
                        fetch("/api/user/note/", {
                            method: "PUT",
                            body: JSON.stringify({email, type, entry}),
                            headers: {
                                "Content-Type": "application/json"
                            }
                        })
                        .then((r1) => {
                            if (r1.status === 201) {
                                alert(`Added ${type}: ${entry}`);
                            }
                        });
                    }
                }
            };
        }
    } catch (error) {
        console.error("Error:", error);
        return {};
    }
}

export default (auth: Auth) => {
    const contextMenu = new ContextMenu();

    contextMenu.create({
        selector: ".zh-contextmenu",
        build($trigger: any) {
            const text = $trigger.currentTarget.innerText || $trigger.currentTarget.value;

            const menu = {
                items: {
                    speak: {
                        name: "Speak",
                        callback() {
                            const utterance = new SpeechSynthesisUtterance(text);
                            utterance.lang = "zh-CN";
                            speechSynthesis.speak(utterance);
                        }
                    },
                    parseHanzi: {
                        name: "Parse Hanzi",
                        callback() {
                            open(`#!/Hanzi?q=${encodeURIComponent(text)}`, "_blank");
                        }
                    },
                    parseVocab: {
                        name: "Parse vocab",
                        callback() {
                            open(`#!/Vocab?q=${encodeURIComponent(text)}`, "_blank");
                        }
                    },
                    openInMdbg: {
                        name: "Open in MDBG",
                        callback() {
                            open(`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${text}`,
                            "_blank");
                        }
                    }
                }
            };

            const classList = $trigger.currentTarget.className.split(" ");

            if (classList.indexOf("hanzi") !== -1) {
                delete menu.items.parseHanzi;
            }

            if (auth.isAuthenticated()) {
                ["hanzi", "vocab", "sentence"].forEach((el) => {
                    if (classList.indexOf(el) !== -1) {
                        Object.assign(menu.items, {
                            [el + "Database"]: {
                                name: el[0].toUpperCase() + el.substring(1) + " database",
                                items: databaseSubmenu(el, text, auth)
                            }
                        });
                    }
                });
            }

            return menu;
        }
    });
};
