/* eslint-disable */
import { D as c, V as u, W as _, _ as f, b as v, i as y, j as m, k as h, m as o, p as g, rt as b, t as k, v as A, y as l } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
var w = ["onKeydown"], B = /* @__PURE__ */ c({
  inheritAttrs: !1,
  __name: "AppDialog",
  props: { busy: { type: Boolean } },
  emits: ["close"],
  setup(i, { emit: n }) {
    const r = i, p = n, d = h(k, null), s = A(() => d?.root.value?.firstElementChild ?? null), a = b(null);
    function e() {
      r.busy || p("close");
    }
    return y(a, e), (t, D) => (u(), v(f, {
      to: s.value ?? "body",
      disabled: !s.value
    }, [l("div", {
      ref_key: "shade",
      ref: a,
      class: "os-app-dialog-shade",
      onClick: o(e, ["self"]),
      onKeydown: g(o(e, ["stop", "prevent"]), ["esc"])
    }, [l("section", m(t.$attrs, {
      role: "dialog",
      tabindex: "-1"
    }), [_(t.$slots, "default")], 16)], 40, w)], 8, ["to", "disabled"]));
  }
}), C = B;
export {
  C as t
};
