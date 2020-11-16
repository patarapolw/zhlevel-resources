import m from "mithril";
import "./Loader.css";

export default {
    oncreate(vnode: any) {
        vnode.dom.innerHTML = `<div class="lds-roller">
        <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`;
    },
    view() {
        return m(".lds-roller-wrapper");
    }
};
