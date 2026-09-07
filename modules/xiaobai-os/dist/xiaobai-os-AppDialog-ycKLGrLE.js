/* eslint-disable */
import { C as c, H as u, M as f, b as _, c as m, d as v, f as y, k as h, l as t, m as g, p as l, x as b } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { r as k, t as A } from "./xiaobai-os-app-navigation-D5qZ5Ulq.js";
var w = ["onKeydown"], B = /* @__PURE__ */ _({
  inheritAttrs: !1,
  __name: "AppDialog",
  props: { busy: { type: Boolean } },
  emits: ["close"],
  setup(r, { emit: i }) {
    const n = r, p = i, d = b(A, null), s = y(() => d?.root.value?.firstElementChild ?? null), o = u(null);
    function e() {
      n.busy || p("close");
    }
    return k(o, e), (a, C) => (h(), g(v, {
      to: s.value ?? "body",
      disabled: !s.value
    }, [l("div", {
      ref_key: "shade",
      ref: o,
      class: "os-app-dialog-shade",
      onClick: t(e, ["self"]),
      onKeydown: m(t(e, ["stop", "prevent"]), ["esc"])
    }, [l("section", c(a.$attrs, {
      role: "dialog",
      tabindex: "-1"
    }), [f(a.$slots, "default")], 16)], 40, w)], 8, ["to", "disabled"]));
  }
}), x = B;
export {
  x as t
};
