import m from "mithril";
import $ from "jquery";
import "bootstrap";

import NavbarLeft from "./components/NavbarLeft";
import NavbarRight from "./components/NavbarRight";
import Hanzi from "./views/Hanzi";
import Home from "./views/Home";
import Vocab from "./views/Vocab";
import Quiz from "./views/Quiz";
import "./components/zh-contextmenu";

import "bootstrap/dist/css/bootstrap.min.css";
import Progress from "./views/Progress";

document.addEventListener("contextmenu", (e: any) => {
    $(e.target).addClass("hover");

    let observer: any = null;
    function removeHoverEl() {
        if ($(".context-menu-list").length === 0) {
            $(".zh-contextmenu").removeClass("hover");

            if (observer !== null) {
                observer.disconnect();
            }
        }
    }

    observer = new MutationObserver(removeHoverEl);
    observer.observe(document.body,  { attributes: true, childList: true });
});

const Layout = {
    view(vnode: any) {
        return m("#app", [
            m("header.navbar.navbar-expand-lg.navbar-light.bg-light", [
                m("a.navbar-brand", {
                    href: "/"
                }, "中文 Level"),
                m("button.navbar-toggler", {
                    "data-toggle": "collapse",
                    "data-target": "#navbarMain",
                    "aria-controls": "navbarMain",
                    "aria-expanded": false,
                    "aria-label": "Toggle navigation"
                }, [
                    m("span.navbar-toggler-icon")
                ]),
                m("#navbarMain.collapse.navbar-collapse", [
                    m(NavbarLeft, {current: vnode.attrs.current}),
                    m(NavbarRight)
                ])
            ]),
            m(".container.mt-3", [
                m("i", [
                    m(".d-inline", "Right click for more options and to speak")
                ]),
                vnode.children
            ])
        ]);
    },
    oncreate() {
        m.request({
            method: "POST",
            url: "/user"
        }).then((r: any) => {
            (window as any).auth.name = r.displayName;
        }).catch(() => {
            (window as any).auth.name = null;
        });
    }
};

export default {
    oncreate(vnode: any) {
        m.route(vnode.dom, "/", {
            "/": { view: () => m(Layout, {current: "Home"}, m(Home)) },
            "/Home": { view: () => m(Layout, {current: "Home"}, m(Home)) },
            "/Hanzi": { view: () => m(Layout, {current: "Hanzi"}, m(Hanzi)) },
            "/Vocab": { view: () => m(Layout, {current: "Vocab"}, m(Vocab)) },
            "/Quiz": { view: () => m(Layout, {current: "Quiz"}, m(Quiz)) },
            "/Progress": { view: () => m(Layout, {current: "Progress"}, m(Progress)) }
        });
    },
    view(vnode: any) {
        return m(".App", vnode.attrs.children);
    }
};
