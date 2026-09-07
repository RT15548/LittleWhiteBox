/* eslint-disable */
import { I as l, w as f, x as v } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
var d = /* @__PURE__ */ Symbol("app-navigation");
function s(e) {
  return e.isConnected && !e.matches(":disabled") && !e.closest("[inert]") && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
}
function m(e) {
  for (const o of [
    "[autofocus]",
    'button, [href], input, textarea, select, summary, [tabindex]:not([tabindex="-1"])',
    '[tabindex="-1"]'
  ]) for (const t of e.querySelectorAll(o))
    if (s(t) && (t.focus({ preventScroll: !0 }), t.ownerDocument.activeElement === t))
      return;
  e.focus({ preventScroll: !0 });
}
function i(e, o = null) {
  const t = e?.root.value;
  queueMicrotask(() => {
    f(() => {
      if (t && (!t.isConnected || e?.root.value !== t)) return;
      const n = document.activeElement;
      if (n instanceof HTMLElement && n !== document.body && s(n)) return;
      const c = e?.layers.value.at(-1);
      o instanceof HTMLElement && s(o) && (!t || t.contains(o)) && (!c || c.contains(o)) && (o.focus({ preventScroll: !0 }), document.activeElement === o) || (c ? m(c) : t?.focus({ preventScroll: !0 }));
    });
  });
}
function y(e, o = () => !0) {
  const t = v(d, null), n = (c = null) => {
    const u = e();
    return u && i(t, c), u;
  };
  return l(o, (c, u, r) => {
    if (c && t) {
      const a = document.activeElement, p = t.stack.add(() => n(a));
      r(() => {
        p(), i(t, a);
      });
    }
  }, {
    immediate: !0,
    flush: "sync"
  }), () => t ? t.stack.back() : n();
}
function E(e, o) {
  const t = v(d, null);
  y(() => (o(), !0), () => !!e.value), l(e, async (n, c, u) => {
    if (!n) return;
    const r = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    t && (t.layers.value = [...t.layers.value, n]), u(() => {
      t && (t.layers.value = t.layers.value.filter((a) => a !== n)), i(t, r);
    }), await f(), !(!n.isConnected || t && t.layers.value.at(-1) !== n) && m(n);
  }, { flush: "post" });
}
export {
  y as n,
  E as r,
  d as t
};
