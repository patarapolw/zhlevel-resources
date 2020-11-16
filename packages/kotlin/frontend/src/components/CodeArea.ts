import m from "mithril";

export default {
    view(vnode: any) {
        return m("textarea.parse-textarea", {
            oninput(e: any) {
                vnode.attrs.onchange(e.target.value);
            },
            placeholder: "Type text to parse here..."
        });
    }
};
