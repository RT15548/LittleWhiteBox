/* eslint-disable */
var v = "LittleWhiteBox-XiaobaiOS", I = class extends Error {
  code;
  phase;
  retryable;
  requiresAppRetry;
  constructor(r) {
    super(r.message || r.error || "host_request_failed"), this.name = "HostRequestError", this.code = r.error || "host_request_failed", this.phase = r.phase || "host", this.retryable = r.retryable !== !1, this.requiresAppRetry = r.requiresAppRetry === !0;
  }
};
function p() {
  return `xiaobai-os-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function R() {
  const r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set();
  let a = !1, s = null;
  function u(e, n = {}, t = "") {
    const o = s && e !== "app/activate" && e !== "app/retry" && e !== "os/frame-ready" && e !== "os/close", l = o && !t ? p() : t;
    parent.postMessage({
      source: v,
      type: e,
      requestId: l,
      ...o ? s : {},
      payload: n
    }, window.location.origin);
  }
  function m(e) {
    const n = String(e.requestId || "");
    if (!n) return !1;
    const t = r.get(n);
    if (!t || t.session && (e.appId !== t.session.appId || e.activationToken !== t.session.activationToken)) return !1;
    r.delete(n), clearTimeout(t.timer);
    const o = e.payload;
    return o?.ok === !1 ? t.reject(new I(o)) : t.resolve(o), !0;
  }
  function d(e) {
    e.origin !== window.location.origin || e.source !== parent || e.data?.source !== "LittleWhiteBox-XiaobaiOS" || typeof e.data.type != "string" || m(e.data) || i.forEach((n) => n(e.data));
  }
  function c() {
    u("os/frame-ready");
  }
  function w() {
    a || (a = !0, window.addEventListener("message", d), document.readyState === "complete" ? c() : window.addEventListener("load", c, { once: !0 }));
  }
  function h(e, n = {}, t = 15e3) {
    const o = p();
    return new Promise((l, f) => {
      const b = setTimeout(() => {
        r.delete(o), f(/* @__PURE__ */ new Error("host_request_timeout"));
      }, t);
      r.set(o, {
        resolve: l,
        reject: f,
        timer: b,
        session: s ? { ...s } : null
      }), u(e, n, o);
    });
  }
  function g(e) {
    s = Object.freeze({ ...e });
  }
  function q() {
    const e = s;
    if (s = null, !!e)
      for (const [n, t] of r)
        t.session?.activationToken === e.activationToken && (clearTimeout(t.timer), t.reject(/* @__PURE__ */ new Error("app_inactive")), r.delete(n));
  }
  function E() {
    return s ? { ...s } : null;
  }
  function S(e) {
    return i.add(e), () => i.delete(e);
  }
  function _() {
    window.removeEventListener("load", c), a && window.removeEventListener("message", d), a = !1, i.clear(), r.forEach((e) => {
      clearTimeout(e.timer), e.reject(/* @__PURE__ */ new Error("frame_bridge_disposed"));
    }), r.clear(), s = null;
  }
  return Object.freeze({
    start: w,
    post: u,
    request: h,
    subscribe: S,
    setAppSession: g,
    clearAppSession: q,
    getAppSession: E,
    dispose: _
  });
}
export {
  R as n,
  I as t
};
