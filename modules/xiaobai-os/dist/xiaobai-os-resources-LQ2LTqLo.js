/* eslint-disable */
var s = 1.8;
function i() {
  return Math.min(window.devicePixelRatio || 1, s);
}
function t(e, n) {
  let r = 0;
  return {
    request() {
      r || document.hidden || !n() || (r = requestAnimationFrame(() => {
        r = 0, !document.hidden && n() && e();
      }));
    },
    cancel() {
      r && (cancelAnimationFrame(r), r = 0);
    }
  };
}
var o = class {
  resources = /* @__PURE__ */ new Set();
  own(e) {
    return this.resources.add(e), e;
  }
  dispose() {
    for (const e of this.resources) e.dispose();
    this.resources.clear();
  }
};
export {
  t as n,
  i as r,
  o as t
};
