import m from "mithril";

const NavItem = {
    view(vnode: any) {
        const name: string = vnode.attrs.name;
        const current: string = vnode.attrs.current;

        return m("li.nav-item" + (name === current ? ".active" : ""), [
            m("a.nav-link", {
                href: `#!/${name}`
            }, name)
        ]);
    }
};

export default {
    view(vnode: any) {
        const authName = (window as any).auth.name;
        const navMenu = [
            m(NavItem, {name: "Home", current: vnode.attrs.current}),
            m(NavItem, {name: "Hanzi", current: vnode.attrs.current}),
            m(NavItem, {name: "Vocab", current: vnode.attrs.current})
        ];

        if (authName) {
            navMenu.push(...[
                m(NavItem, {name: "Quiz", current: vnode.attrs.current}),
                m(NavItem, {name: "Progress", current: vnode.attrs.current})
            ]);
        }

        navMenu.push(
            m("li.nav-item", [
                m(".nav-link", {
                    onclick() {
                        open("https://github.com/patarapolw/zhlevel-ts", "_blank");
                    },
                    style: {
                        cursor: "pointer"
                    }
                }, "About")
            ])
        );

        return m("ul.navbar-nav.mr-auto", navMenu);
    }
};
