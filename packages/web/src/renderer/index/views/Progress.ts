import m from "mithril";
import $ from "jquery";
import Loader from "../components/Loader";
import { fetchJSON } from "../../util";
import { IHanziToSrsLevel } from "../../../server/db/ProgressRes";

export default {
    view() {
        return m(Loader);
    },
    oncreate(vnode: any) {
        const $app = $(vnode.dom);

        (async () => {
            const vLv: IHanziToSrsLevel[][] = await fetchJSON("/api/progress/", {});

            $app.html(`<table class="table"></table>`);
            const $table = $("table", $app);

            vLv.forEach((lv, i) => {
                $table.append(`
                <tr>
                    <th scope="row">${i + 1}</th>
                    <td class="zh-lv${i + 1} zh-10xlv${Math.floor(i / 10) + 1}"></td>
                </tr>`);
                const $td = $(`td.zh-lv${i + 1}`, $table);

                lv.forEach((el) => {
                    $td.append(`<span class="zh-srs-cat${
                        Math.floor(((el.srsLevel || -1) + 1) / 2)}">${el.hanzi}</span>`);
                });
            });
        })();
    }
};
