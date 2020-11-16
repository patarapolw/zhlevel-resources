import m from "mithril";
import App from "./renderer/index/App";

import "./renderer/index/index.css";

m.render(document.getElementById("App") as HTMLDivElement, m(App));
