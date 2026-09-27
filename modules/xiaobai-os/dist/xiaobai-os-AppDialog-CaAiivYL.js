/* eslint-disable */
import { C as c, F as u, R as f, T as _, Y as m, c as v, f as h, h as y, l as t, m as l, p as g, x as b } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { r as A, t as k } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
var w = ["onKeydown"], B = /* @__PURE__ */ b({
  inheritAttrs: !1,
  __name: "AppDialog",
  props: { busy: { type: Boolean } },
  emits: ["close"],
  setup(r, { emit: i }) {
    const n = r, p = i, d = c(k, null), s = g(() => d?.root.value?.firstElementChild ?? null), o = m(null);
    function e() {
      n.busy || p("close");
    }
    return A(o, e), (a, C) => (u(), y(h, {
      to: s.value ?? "body",
      disabled: !s.value
    }, [l("div", {
      ref_key: "shade",
      ref: o,
      class: "os-app-dialog-shade",
      onClick: t(e, ["self"]),
      onKeydown: v(t(e, ["stop", "prevent"]), ["esc"])
    }, [l("section", _(a.$attrs, {
      role: "dialog",
      tabindex: "-1"
    }), [f(a.$slots, "default")], 16)], 40, w)], 8, ["to", "disabled"]));
  }
}), x = B;
export {
  x as t
};
