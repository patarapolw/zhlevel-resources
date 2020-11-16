import m from "mithril";
import Auth from "../auth/Auth";

export default {
    view(vnode: any) {
        const auth: Auth = vnode.attrs.auth;
        const isAuthenticated = auth.isAuthenticated();

        return m(".navbar-nav", [
            m(".nav-item.mr-3.my-2", isAuthenticated ? `Welcome back, ${auth.getJwt().name}` : ""),
            m("button.btn" + (isAuthenticated ? ".btn-outline-danger" : ".btn-outline-success"), {
                onclick() {
                    isAuthenticated ? auth.logout() : auth.login();
                }
            }, isAuthenticated ? "Logout" : "Login for more")
        ]);
    }
};
