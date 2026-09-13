/* eslint-disable */
import { F as c, K as u, M as f, S as _, b as m, c as v, d as y, f as h, l as t, m as g, p as l, w as b } from "./xiaobai-os-runtime-dom.esm-bundler-BcM9c-Z9.js";
import { r as w, t as A } from "./xiaobai-os-app-navigation-sg-40eOk.js";
var K = ["onKeydown"], k = /* @__PURE__ */ m({
  inheritAttrs: !1,
  __name: "AppDialog",
  props: { busy: { type: Boolean } },
  emits: ["close"],
  setup(r, { emit: i }) {
    const n = r, p = i, d = _(A, null), s = h(() => d?.root.value?.firstElementChild ?? null), o = u(null);
    function e() {
      n.busy || p("close");
    }
    return w(o, e), (a, B) => (f(), g(y, {
      to: s.value ?? "body",
      disabled: !s.value
    }, [l("div", {
      ref_key: "shade",
      ref: o,
      class: "os-app-dialog-shade",
      onClick: t(e, ["self"]),
      onKeydown: v(t(e, ["stop", "prevent"]), ["esc"])
    }, [l("section", b(a.$attrs, {
      role: "dialog",
      tabindex: "-1"
    }), [c(a.$slots, "default")], 16)], 40, K)], 8, ["to", "disabled"]));
  }
}), M = k;
export {
  M as t
};
