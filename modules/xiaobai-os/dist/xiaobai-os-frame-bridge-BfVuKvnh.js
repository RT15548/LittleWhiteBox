/* eslint-disable */
var I = "LittleWhiteBox-XiaobaiOS", m = class extends Error {
  code;
  constructor(t, i) {
    super(t, i), this.code = t, this.name = "FrameRequestError";
  }
}, A = class extends Error {
  code;
  phase;
  retryable;
  requiresAppRetry;
  constructor(t) {
    super(t.message || t.error || "host_request_failed"), this.name = "HostRequestError", this.code = t.error || "host_request_failed", this.phase = t.phase || "host", this.retryable = t.retryable !== !1, this.requiresAppRetry = t.requiresAppRetry === !0;
  }
};
function h() {
  return `xiaobai-os-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function T() {
  const t = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set();
  let a = !1, o = null;
  function u(e, s = {}, r = "") {
    const n = o && e !== "app/activate" && e !== "app/retry" && e !== "os/frame-ready" && e !== "os/close", l = n && !r ? h() : r;
    parent.postMessage({
      source: I,
      type: e,
      requestId: l,
      ...n ? o : {},
      payload: s
    }, window.location.origin);
  }
  function w(e) {
    const s = String(e.requestId || "");
    if (!s) return !1;
    const r = t.get(s);
    if (!r || r.session && (e.appId !== r.session.appId || e.activationToken !== r.session.activationToken)) return !1;
    t.delete(s), clearTimeout(r.timer);
    const n = e.payload;
    return n?.ok === !1 ? r.reject(new A(n)) : r.resolve(n), !0;
  }
  function f(e) {
    e.origin !== window.location.origin || e.source !== parent || e.data?.source !== "LittleWhiteBox-XiaobaiOS" || typeof e.data.type != "string" || w(e.data) || i.forEach((s) => s(e.data));
  }
  function c() {
    u("os/frame-ready");
  }
  function q() {
    a || (a = !0, window.addEventListener("message", f), document.readyState === "complete" ? c() : window.addEventListener("load", c, { once: !0 }));
  }
  function g(e, s = {}, r = 15e3) {
    const n = h();
    return new Promise((l, d) => {
      const p = setTimeout(() => {
        t.delete(n), d(new m("host_request_timeout"));
      }, r);
      t.set(n, {
        resolve: l,
        reject: d,
        timer: p,
        session: o ? { ...o } : null
      });
      try {
        u(e, s, n);
      } catch (b) {
        t.delete(n), clearTimeout(p), d(new m("host_request_not_sent", { cause: b }));
      }
    });
  }
  function E(e) {
    o = Object.freeze({ ...e });
  }
  function _() {
    const e = o;
    if (o = null, !!e)
      for (const [s, r] of t)
        r.session?.activationToken === e.activationToken && (clearTimeout(r.timer), r.reject(/* @__PURE__ */ new Error("app_inactive")), t.delete(s));
  }
  function S() {
    return o ? { ...o } : null;
  }
  function v(e) {
    return i.add(e), () => i.delete(e);
  }
  function R() {
    window.removeEventListener("load", c), a && window.removeEventListener("message", f), a = !1, i.clear(), t.forEach((e) => {
      clearTimeout(e.timer), e.reject(/* @__PURE__ */ new Error("frame_bridge_disposed"));
    }), t.clear(), o = null;
  }
  return Object.freeze({
    start: q,
    post: u,
    request: g,
    subscribe: v,
    setAppSession: E,
    clearAppSession: _,
    getAppSession: S,
    dispose: R
  });
}
export {
  A as n,
  T as r,
  m as t
};
