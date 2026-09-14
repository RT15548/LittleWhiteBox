/* eslint-disable */
import { K as c, M as u, c as f, h as m, i as _, k as v, o as y, s as a, x as h, y as g } from "./xiaobai-os-runtime-core.esm-bundler-x_Eikhco.js";
import { c as b, l as r } from "./xiaobai-os-runtime-dom.esm-bundler-DWFjb9Vy.js";
import { r as k, t as A } from "./xiaobai-os-app-navigation-BcQEoInO.js";
var K = ["onKeydown"], w = /* @__PURE__ */ m({
  inheritAttrs: !1,
  __name: "AppDialog",
  props: { busy: { type: Boolean } },
  emits: ["close"],
  setup(l, { emit: i }) {
    const n = l, p = i, d = g(A, null), s = y(() => d?.root.value?.firstElementChild ?? null), o = c(null);
    function e() {
      n.busy || p("close");
    }
    return k(o, e), (t, B) => (v(), f(_, {
      to: s.value ?? "body",
      disabled: !s.value
    }, [a("div", {
      ref_key: "shade",
      ref: o,
      class: "os-app-dialog-shade",
      onClick: r(e, ["self"]),
      onKeydown: b(r(e, ["stop", "prevent"]), ["esc"])
    }, [a("section", h(t.$attrs, {
      role: "dialog",
      tabindex: "-1"
    }), [u(t.$slots, "default")], 16)], 40, K)], 8, ["to", "disabled"]));
  }
}), M = w;
export {
  M as t
};
