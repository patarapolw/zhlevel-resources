import m from "mithril";

export default {
    view(vnode: any) {
        const authName = (window as any).auth.name;

        return m(".navbar-nav", [
            m(".nav-item.mr-3.my-2", authName ? `Welcome back, ${authName}` : ""),
            m("button.btn" + (authName ? ".btn-outline-danger" : ".btn-outline-success"), {
                onclick() {
                    location.replace(authName ? "/logout" : "/login");
                }
            }, authName ? "Logout" : "Login for more")
        ]);
    }
};
