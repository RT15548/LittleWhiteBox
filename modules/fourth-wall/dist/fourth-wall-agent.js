var Rg = Object.create, Wd = Object.defineProperty, xg = Object.getOwnPropertyDescriptor, Mg = Object.getOwnPropertyNames, Ng = Object.getPrototypeOf, kg = Object.prototype.hasOwnProperty, Si = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), Dg = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var o = Mg(t), i = 0, a = o.length, u; i < a; i++)
      u = o[i], !kg.call(e, u) && u !== n && Wd(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(r = xg(t, u)) || r.enumerable
      });
  return e;
}, $g = (e, t, n) => (n = e != null ? Rg(Ng(e)) : {}, Dg(t || !e || !e.__esModule ? Wd(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), Lg = "https://api.tavily.com";
function gs(e = "") {
  return String(e || "").trim();
}
function Ze(e = "") {
  return String(e || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var kP = Object.freeze([
  Object.freeze({
    value: "inherit",
    label: "跟随模型默认"
  }),
  Object.freeze({
    value: "on",
    label: "开启"
  }),
  Object.freeze({
    value: "off",
    label: "关闭"
  })
]), DP = Object.freeze([Object.freeze({
  value: "hide",
  label: "隐藏"
}), Object.freeze({
  value: "show",
  label: "显示"
})]);
function Ug(e = "") {
  return e === "on" || e === "off" ? e : "inherit";
}
function zd(e = "") {
  return e === "show" ? "show" : "hide";
}
function Fg(e) {
  return String(e ?? "").trim().toLowerCase() || void 0;
}
function Og(e) {
  if (e == null || e === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? Math.floor(t) : void 0;
}
function un(e = {}) {
  const t = e && typeof e == "object" ? e : {}, n = Fg(t.effort), r = Og(t.budgetTokens);
  return {
    mode: Ug(t.mode),
    output: zd(t.output),
    ...n ? { effort: n } : {},
    ...r !== void 0 ? { budgetTokens: r } : {}
  };
}
function Z(e = {}) {
  return zd(e?.output) === "show";
}
var Yd = "openai-compatible", Ei = "默认", Xd = "default", qg = "deny", St = 32e3;
var Bg = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), Gg = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), ys = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: St,
    sendTemperature: !0
  }
};
function Rn() {
  return JSON.parse(JSON.stringify(ys));
}
function Me() {
  return {
    provider: Yd,
    modelConfigs: Rn(),
    permissionMode: Xd
  };
}
function Qd(e = Me()) {
  const t = e && typeof e == "object" ? e : Me();
  return {
    provider: ma(t.provider),
    modelConfigs: Ke(t.modelConfigs || {})
  };
}
function xn(e) {
  return e === "full" ? "full" : Xd;
}
function Et(e) {
  return e === "allow" ? "allow" : qg;
}
function ue(e, t = St) {
  const n = Number(e);
  if (!Number.isFinite(n) || n <= 0) {
    const r = Number(t);
    return Number.isFinite(r) && r > 0 ? Math.floor(r) : St;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}
function oe(e) {
  return String(e || "").trim() || "默认";
}
function Ke(e = {}) {
  const t = Rn();
  return Object.keys(ys).forEach((n) => {
    const r = e && typeof e[n] == "object" ? e[n] : {}, o = ys[n];
    t[n] = {
      baseUrl: String(r.baseUrl ?? o.baseUrl ?? ""),
      model: String(r.model ?? o.model ?? ""),
      apiKey: String(r.apiKey ?? o.apiKey ?? ""),
      temperature: r.temperature ?? o.temperature,
      maxTokens: ue(r.maxTokens, o.maxTokens),
      sendTemperature: typeof r.sendTemperature == "boolean" ? r.sendTemperature : o.sendTemperature,
      ..."toolMode" in o ? { toolMode: String(r.toolMode || o.toolMode || "native") } : {},
      reasoning: un(r.reasoning)
    };
  }), t;
}
function ma(e) {
  return typeof e == "string" && e.trim() ? e : Yd;
}
function ga(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function Zd(e = {}, t) {
  const n = {}, r = ga(e, t);
  return Object.entries(r).forEach(([o, i]) => {
    if (!i || typeof i != "object") return;
    const a = oe(o);
    n[a] = {
      provider: ma(i.provider),
      modelConfigs: Ke(i.modelConfigs || {}),
      permissionMode: xn(i.permissionMode)
    };
  }), Object.keys(n).length || (n[Ei] = Me()), n;
}
function jd(e, t) {
  const n = oe(t);
  return e[n] ? n : Object.keys(e)[0];
}
function ef(e, t, n) {
  const r = oe(t || n);
  return e[r] ? r : e[n] ? n : Object.keys(e)[0];
}
function ya(e = {}, t = Me()) {
  const n = Qd(t), r = e && typeof e == "object" ? e : {};
  return {
    provider: ma(r.provider || n.provider),
    modelConfigs: Ke(r.modelConfigs || n.modelConfigs)
  };
}
function tf(e = {}, t = {}, n = Ei, r = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (r !== n) return !0;
  const o = e?.delegateConfig;
  if (!o || typeof o != "object" || Array.isArray(o) || !(typeof o.provider == "string" && o.provider.trim() || o.modelConfigs && typeof o.modelConfigs == "object" && Object.keys(o.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const i = t[n] || Me(), a = Qd(i), u = ya(o, i);
  return JSON.stringify(u) !== JSON.stringify(a);
}
function Hg(e = {}, t, n, r, o) {
  const i = o(e?.[r]);
  if (i) return i;
  const a = ga(e, t), u = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(a || {})
  ].map(oe), c = /* @__PURE__ */ new Set();
  for (const d of u) {
    if (c.has(d)) continue;
    c.add(d);
    const h = o(a?.[d]?.[r]);
    if (h) return h;
  }
  return o(e?.delegateConfig?.[r]);
}
function Vg(e = {}, t, n) {
  const r = (u) => String(u || "").trim();
  if (r(e?.tavilyBaseUrl)) return Ze(e.tavilyBaseUrl);
  const o = ga(e, t), i = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(o || {})
  ].map(oe), a = /* @__PURE__ */ new Set();
  for (const u of i) {
    if (a.has(u)) continue;
    a.add(u);
    const c = o?.[u]?.tavilyBaseUrl;
    if (r(c)) return Ze(c);
  }
  return r(e?.delegateConfig?.tavilyBaseUrl) ? Ze(e.delegateConfig.tavilyBaseUrl) : Lg;
}
function nf(e = {}, t, n) {
  return {
    tavilyApiKey: Hg(e, t, n, "tavilyApiKey", gs),
    tavilyBaseUrl: Vg(e, t, n)
  };
}
function Kg(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: r = (p) => String(p || "") } = t, o = oe(e.currentPresetName || e.presetName || "默认"), i = Zd(e, o), a = jd(i, e.currentPresetName), u = ef(i, e.delegatePresetName, a), c = i[u] || i[a] || Me(), d = ya(e.delegateConfig, c), h = tf(e, i, a, u), f = nf(e, o, a);
  return {
    enabled: !!e.enabled,
    workspaceFileName: r(e.workspaceFileName || n),
    jsApiPermission: Et(e.jsApiPermission),
    currentPresetName: a,
    delegatePresetName: u,
    delegateConfig: d,
    delegateConfigured: h,
    presets: i,
    tavilyApiKey: f.tavilyApiKey,
    tavilyBaseUrl: f.tavilyBaseUrl,
    updatedAt: Number(e.updatedAt) || 0,
    configVersion: 1
  };
}
function _s(e = {}) {
  const t = oe(e.currentPresetName || e.presetDraftName || "默认"), n = Zd(e, t), r = jd(n, e.currentPresetName), o = ef(n, e.delegatePresetName, r), i = n[r] || Me(), a = n[o] || i, u = ya(e.delegateConfig, a), c = tf(e, n, r, o), d = nf(e, t, r);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    updatedAt: Number(e.updatedAt) || 0,
    jsApiPermission: Et(e.jsApiPermission),
    currentPresetName: r,
    delegatePresetName: o,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: oe(e.presetDraftName || r),
    presetNames: Object.keys(n),
    presets: n,
    provider: i.provider,
    modelConfigs: i.modelConfigs,
    permissionMode: xn(i.permissionMode),
    tavilyApiKey: d.tavilyApiKey,
    tavilyBaseUrl: d.tavilyBaseUrl
  };
}
function U(e, t, n, r, o) {
  if (r === "m") throw new TypeError("Private method is not writable");
  if (r === "a" && !o) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? o.call(e, n) : o ? o.value = n : t.set(e, n), n;
}
function w(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var rf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return rf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function Vr(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var vs = (e) => {
  if (e instanceof Error) return e;
  if (typeof e == "object" && e !== null) {
    try {
      if (Object.prototype.toString.call(e) === "[object Error]") {
        const t = new Error(e.message, e.cause ? { cause: e.cause } : {});
        return e.stack && (t.stack = e.stack), e.cause && !t.cause && (t.cause = e.cause), e.name && (t.name = e.name), t;
      }
    } catch {
    }
    try {
      return new Error(JSON.stringify(e));
    } catch {
    }
  }
  return new Error(e);
}, K = class extends Error {
}, Je = class As extends K {
  constructor(t, n, r, o, i) {
    super(`${As.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new wi({
      message: r,
      cause: vs(n)
    });
    const i = n, a = i?.error?.type;
    return t === 400 ? new sf(t, i, r, o, a) : t === 401 ? new af(t, i, r, o, a) : t === 403 ? new lf(t, i, r, o, a) : t === 404 ? new uf(t, i, r, o, a) : t === 409 ? new cf(t, i, r, o, a) : t === 422 ? new df(t, i, r, o, a) : t === 429 ? new ff(t, i, r, o, a) : t >= 500 ? new hf(t, i, r, o, a) : new As(t, i, r, o, a);
  }
}, ut = class extends Je {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, wi = class extends Je {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, of = class extends wi {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, sf = class extends Je {
}, af = class extends Je {
}, lf = class extends Je {
}, uf = class extends Je {
}, cf = class extends Je {
}, df = class extends Je {
}, ff = class extends Je {
}, hf = class extends Je {
}, Jg = /^[a-z][a-z0-9+.-]*:/i, Wg = (e) => Jg.test(e), Ts = (e) => (Ts = Array.isArray, Ts(e)), xl = Ts;
function Ss(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Ml(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function zg(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Yg = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new K(`${e} must be an integer`);
  if (t < 0) throw new K(`${e} must be a positive integer`);
  return t;
}, pf = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Xg = (e) => new Promise((t) => setTimeout(t, e)), wn = "0.91.1", Qg = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Zg() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var jg = () => {
  const e = Zg();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": wn,
    "X-Stainless-OS": kl(Deno.build.os),
    "X-Stainless-Arch": Nl(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": wn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": wn,
    "X-Stainless-OS": kl(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Nl(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = ey();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": wn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": wn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function ey() {
  if (typeof navigator > "u" || !navigator) return null;
  for (const { key: e, pattern: t } of [
    {
      key: "edge",
      pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "ie",
      pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "ie",
      pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "chrome",
      pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "firefox",
      pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "safari",
      pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/
    }
  ]) {
    const n = t.exec(navigator.userAgent);
    if (n) return {
      browser: e,
      version: `${n[1] || 0}.${n[2] || 0}.${n[3] || 0}`
    };
  }
  return null;
}
var Nl = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", kl = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Dl, ty = () => Dl ?? (Dl = jg());
function ny() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function mf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function gf(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return mf({
    start() {
    },
    async pull(n) {
      const { done: r, value: o } = await t.next();
      r ? n.close() : n.enqueue(o);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function _a(e) {
  if (e[Symbol.asyncIterator]) return e;
  const t = e.getReader();
  return {
    async next() {
      try {
        const n = await t.read();
        return n?.done && t.releaseLock(), n;
      } catch (n) {
        throw t.releaseLock(), n;
      }
    },
    async return() {
      const n = t.cancel();
      return t.releaseLock(), await n, {
        done: !0,
        value: void 0
      };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
async function ry(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var oy = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function iy(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new K(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function sy(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var $l;
function va(e) {
  let t;
  return ($l ?? (t = new globalThis.TextEncoder(), $l = t.encode.bind(t)))(e);
}
var Ll;
function Ul(e) {
  let t;
  return (Ll ?? (t = new globalThis.TextDecoder(), Ll = t.decode.bind(t)))(e);
}
var Oe, qe, Zr = class {
  constructor() {
    Oe.set(this, void 0), qe.set(this, void 0), U(this, Oe, new Uint8Array(), "f"), U(this, qe, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? va(e) : e;
    U(this, Oe, sy([w(this, Oe, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = ay(w(this, Oe, "f"), w(this, qe, "f"))) != null; ) {
      if (r.carriage && w(this, qe, "f") == null) {
        U(this, qe, r.index, "f");
        continue;
      }
      if (w(this, qe, "f") != null && (r.index !== w(this, qe, "f") + 1 || r.carriage)) {
        n.push(Ul(w(this, Oe, "f").subarray(0, w(this, qe, "f") - 1))), U(this, Oe, w(this, Oe, "f").subarray(w(this, qe, "f")), "f"), U(this, qe, null, "f");
        continue;
      }
      const o = w(this, qe, "f") !== null ? r.preceding - 1 : r.preceding, i = Ul(w(this, Oe, "f").subarray(0, o));
      n.push(i), U(this, Oe, w(this, Oe, "f").subarray(r.index), "f"), U(this, qe, null, "f");
    }
    return n;
  }
  flush() {
    return w(this, Oe, "f").length ? this.decode(`
`) : [];
  }
};
Oe = /* @__PURE__ */ new WeakMap(), qe = /* @__PURE__ */ new WeakMap();
Zr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Zr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function ay(e, t) {
  for (let o = t ?? 0; o < e.length; o++) {
    if (e[o] === 10) return {
      preceding: o,
      index: o + 1,
      carriage: !1
    };
    if (e[o] === 13) return {
      preceding: o,
      index: o + 1,
      carriage: !0
    };
  }
  return null;
}
function ly(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var oi = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Fl = (e, t, n) => {
  if (e) {
    if (zg(oi, e)) return e;
    Re(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(oi))}`);
  }
};
function Tr() {
}
function po(e, t, n) {
  return !t || oi[e] > oi[n] ? Tr : t[e].bind(t);
}
var uy = {
  error: Tr,
  warn: Tr,
  info: Tr,
  debug: Tr
}, Ol = /* @__PURE__ */ new WeakMap();
function Re(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return uy;
  const r = Ol.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: po("error", t, n),
    warn: po("warn", t, n),
    info: po("info", t, n),
    debug: po("debug", t, n)
  };
  return Ol.set(t, [n, o]), o;
}
var Qt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), er, Kr = class Sr {
  constructor(t, n, r) {
    this.iterator = t, er.set(this, void 0), this.controller = n, U(this, er, r, "f");
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const i = r ? Re(r) : console;
    async function* a() {
      if (o) throw new K("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of cy(t, n)) {
          if (c.event === "completion") try {
            yield JSON.parse(c.data);
          } catch (d) {
            throw i.error("Could not parse message into JSON:", c.data), i.error("From chunk:", c.raw), d;
          }
          if (c.event === "message_start" || c.event === "message_delta" || c.event === "message_stop" || c.event === "content_block_start" || c.event === "content_block_delta" || c.event === "content_block_stop" || c.event === "message" || c.event === "user.message" || c.event === "user.interrupt" || c.event === "user.tool_confirmation" || c.event === "user.custom_tool_result" || c.event === "agent.message" || c.event === "agent.thinking" || c.event === "agent.tool_use" || c.event === "agent.tool_result" || c.event === "agent.mcp_tool_use" || c.event === "agent.mcp_tool_result" || c.event === "agent.custom_tool_use" || c.event === "agent.thread_context_compacted" || c.event === "session.status_running" || c.event === "session.status_idle" || c.event === "session.status_rescheduled" || c.event === "session.status_terminated" || c.event === "session.error" || c.event === "session.deleted" || c.event === "span.model_request_start" || c.event === "span.model_request_end") try {
            yield JSON.parse(c.data);
          } catch (d) {
            throw i.error("Could not parse message into JSON:", c.data), i.error("From chunk:", c.raw), d;
          }
          if (c.event !== "ping" && c.event === "error") {
            const d = pf(c.data) ?? c.data, h = d?.error?.type;
            throw new Je(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (Vr(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Sr(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* i() {
      const u = new Zr(), c = _a(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (o) throw new K("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Vr(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Sr(a, n, r);
  }
  [(er = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), o = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = r.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new Sr(() => o(t), this.controller, w(this, er, "f")), new Sr(() => o(n), this.controller, w(this, er, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return mf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = va(JSON.stringify(o) + `
`);
          r.enqueue(a);
        } catch (o) {
          r.error(o);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* cy(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new K("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new K("Attempted to iterate over a response with no body");
  const n = new fy(), r = new Zr(), o = _a(e.body);
  for await (const i of dy(o)) for (const a of r.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of r.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* dy(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? va(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let i;
    for (; (i = ly(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var fy = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const o = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], o;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, r] = hy(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function hy(e, t) {
  const n = e.indexOf(t);
  return n !== -1 ? [
    e.substring(0, n),
    t,
    e.substring(n + t.length)
  ] : [
    e,
    "",
    ""
  ];
}
async function yf(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return Re(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : Kr.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : _f(await n.json(), n) : await n.text();
  })();
  return Re(e).debug(`[${r}] response parsed`, Qt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function _f(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var Er, vf = class Af extends Promise {
  constructor(t, n, r = yf) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, Er.set(this, void 0), U(this, Er, t, "f");
  }
  _thenUnwrap(t) {
    return new Af(w(this, Er, "f"), this.responsePromise, async (n, r) => _f(t(await this.parseResponse(n, r), r), r.response));
  }
  asResponse() {
    return this.responsePromise.then((t) => t.response);
  }
  async withResponse() {
    const [t, n] = await Promise.all([this.parse(), this.asResponse()]);
    return {
      data: t,
      response: n,
      request_id: n.headers.get("request-id")
    };
  }
  parse() {
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(w(this, Er, "f"), t))), this.parsedPromise;
  }
  then(t, n) {
    return this.parse().then(t, n);
  }
  catch(t) {
    return this.parse().catch(t);
  }
  finally(t) {
    return this.parse().finally(t);
  }
};
Er = /* @__PURE__ */ new WeakMap();
var mo, Tf = class {
  constructor(e, t, n, r) {
    mo.set(this, void 0), U(this, mo, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new K("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await w(this, mo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(mo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, py = class extends vf {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await yf(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, jr = class extends Tf {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.has_more = n.has_more || !1, this.first_id = n.first_id || null, this.last_id = n.last_id || null;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    return this.has_more === !1 ? !1 : super.hasNextPage();
  }
  nextPageRequestOptions() {
    if (this.options.query?.before_id) {
      const t = this.first_id;
      return t ? {
        ...this.options,
        query: {
          ...Ss(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Ss(this.options.query),
        after_id: e
      }
    } : null;
  }
}, Ue = class extends Tf {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.next_page = n.next_page || null;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    const e = this.next_page;
    return e ? {
      ...this.options,
      query: {
        ...Ss(this.options.query),
        page: e
      }
    } : null;
  }
}, Sf = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Fn(e, t, n) {
  return Sf(), new File(e, t ?? "unknown_file", n);
}
function Ho(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Ef = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Aa = async (e, t, n = !0) => ({
  ...e,
  body: await gy(e.body, t, n)
}), ql = /* @__PURE__ */ new WeakMap();
function my(e) {
  const t = typeof e == "function" ? e : e.fetch, n = ql.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new o(i).text();
    } catch {
      return !0;
    }
  })();
  return ql.set(t, r), r;
}
var gy = async (e, t, n = !0) => {
  if (!await my(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, i]) => Es(r, o, i, n))), r;
}, yy = (e) => e instanceof Blob && "name" in e, Es = async (e, t, n, r) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let o = {};
      const i = n.headers.get("Content-Type");
      i && (o = { type: i }), e.append(t, Fn([await n.blob()], Ho(n, r), o));
    } else if (Ef(n)) e.append(t, Fn([await new Response(gf(n)).blob()], Ho(n, r)));
    else if (yy(n)) e.append(t, Fn([n], Ho(n, r), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => Es(e, t + "[]", o, r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, i]) => Es(e, `${t}[${o}]`, i, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, wf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", _y = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && wf(e), vy = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Ay(e, t, n) {
  if (Sf(), e = await e, t || (t = Ho(e, !0)), _y(e))
    return e instanceof File && t == null && n == null ? e : Fn([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (vy(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Fn(await ws(o), t, n);
  }
  const r = await ws(e);
  if (!n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return Fn(r, t, n);
}
async function ws(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (wf(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Ef(e)) for await (const n of e) t.push(...await ws(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Ty(e)}`);
  }
  return t;
}
function Ty(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var re = class {
  constructor(e) {
    this._client = e;
  }
}, If = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Sy(e) {
  if (!e) return;
  if (If in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : xl(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = xl(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var N = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of Sy(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [If]: !0,
    values: t,
    nulls: n
  };
};
function Cf(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Bl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Ey = (e = Cf) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let y = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Bl) ?? Bl)?.toString) && (y = m + "", i.push({
      start: h.length + f.length,
      length: y.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : y);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) i.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (i.sort((h, f) => h.start - f.start), i.length > 0) {
    let h = 0;
    const f = i.reduce((p, m) => {
      const y = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + y + _;
    }, "");
    throw new K(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, q = /* @__PURE__ */ Ey(Cf), bf = class extends re {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/environments/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", Ue, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Fr = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function Vo(e) {
  return typeof e == "object" && e !== null && Fr in e;
}
function Pf(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const r of e) Vo(r) && n.add(r[Fr]);
  if (t) {
    for (const r of t)
      if (Vo(r) && n.add(r[Fr]), Array.isArray(r.content))
        for (const o of r.content) Vo(o) && n.add(o[Fr]);
  }
  return Array.from(n);
}
function Rf(e, t) {
  const n = Pf(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function wy(e) {
  return Vo(e) ? { "x-stainless-helper": e[Fr] } : {};
}
var xf = class extends re {
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", jr, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/files/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/files/${e}/content?beta=true`, {
      ...n,
      headers: N([{
        "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/files/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/files?beta=true", Aa({
      body: r,
      ...t,
      headers: N([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        wy(r.file),
        t?.headers
      ])
    }, this._client));
  }
}, Mf = class extends re {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/models/${e}?beta=true`, {
      ...n,
      headers: N([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", jr, {
      query: r,
      ...t,
      headers: N([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Nf = class extends re {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/user_profiles?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/user_profiles/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/user_profiles/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/user_profiles?beta=true", Ue, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  createEnrollmentURL(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/user_profiles/${e}/enrollment_url?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
}, kf = class extends re {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/agents/${e}/versions?beta=true`, Ue, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ta = class extends re {
  constructor() {
    super(...arguments), this.versions = new kf(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.get(q`/v1/agents/${e}?beta=true`, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/agents/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", Ue, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Ta.Versions = kf;
var Df = class extends re {
  create(e, t, n) {
    const { view: r, betas: o, ...i } = t;
    return this._client.post(q`/v1/memory_stores/${e}/memories?beta=true`, {
      query: { view: r },
      body: i,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { memory_store_id: r, betas: o, ...i } = t;
    return this._client.get(q`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: i,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { memory_store_id: r, view: o, betas: i, ...a } = t;
    return this._client.post(q`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: { view: o },
      body: a,
      ...n,
      headers: N([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/memory_stores/${e}/memories?beta=true`, Ue, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { memory_store_id: r, expected_content_sha256: o, betas: i } = t;
    return this._client.delete(q`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: { expected_content_sha256: o },
      ...n,
      headers: N([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, $f = class extends re {
  retrieve(e, t, n) {
    const { memory_store_id: r, betas: o, ...i } = t;
    return this._client.get(q`/v1/memory_stores/${r}/memory_versions/${e}?beta=true`, {
      query: i,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/memory_stores/${e}/memory_versions?beta=true`, Ue, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  redact(e, t, n) {
    const { memory_store_id: r, betas: o } = t;
    return this._client.post(q`/v1/memory_stores/${r}/memory_versions/${e}/redact?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ii = class extends re {
  constructor() {
    super(...arguments), this.memories = new Df(this._client), this.memoryVersions = new $f(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/memory_stores?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/memory_stores/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/memory_stores?beta=true", Ue, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/memory_stores/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Ii.Memories = Df;
Ii.MemoryVersions = $f;
var Lf = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function Uf(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function Gl(e, t, n) {
  const r = Uf(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((o) => {
      if (o.type === "text") {
        const i = Object.defineProperty({ ...o }, "parsed_output", {
          value: null,
          enumerable: !1
        });
        return Object.defineProperty(i, "parsed", {
          get() {
            return n.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead."), null;
          },
          enumerable: !1
        });
      }
      return o;
    }),
    parsed_output: null
  } : Ff(e, t, n);
}
function Ff(e, t, n) {
  let r = null;
  const o = e.content.map((i) => {
    if (i.type === "text") {
      const a = Iy(t, i.text);
      r === null && (r = a);
      const u = Object.defineProperty({ ...i }, "parsed_output", {
        value: a,
        enumerable: !1
      });
      return Object.defineProperty(u, "parsed", {
        get() {
          return n.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead."), a;
        },
        enumerable: !1
      });
    }
    return i;
  });
  return {
    ...e,
    content: o,
    parsed_output: r
  };
}
function Iy(e, t) {
  const n = Uf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new K(`Failed to parse structured output: ${r}`);
  }
}
var Cy = (e) => {
  let t = 0, n = [];
  for (; t < e.length; ) {
    let r = e[t];
    if (r === "\\") {
      t++;
      continue;
    }
    if (r === "{") {
      n.push({
        type: "brace",
        value: "{"
      }), t++;
      continue;
    }
    if (r === "}") {
      n.push({
        type: "brace",
        value: "}"
      }), t++;
      continue;
    }
    if (r === "[") {
      n.push({
        type: "paren",
        value: "["
      }), t++;
      continue;
    }
    if (r === "]") {
      n.push({
        type: "paren",
        value: "]"
      }), t++;
      continue;
    }
    if (r === ":") {
      n.push({
        type: "separator",
        value: ":"
      }), t++;
      continue;
    }
    if (r === ",") {
      n.push({
        type: "delimiter",
        value: ","
      }), t++;
      continue;
    }
    if (r === '"') {
      let a = "", u = !1;
      for (r = e[++t]; r !== '"'; ) {
        if (t === e.length) {
          u = !0;
          break;
        }
        if (r === "\\") {
          if (t++, t === e.length) {
            u = !0;
            break;
          }
          a += r + e[t], r = e[++t];
        } else
          a += r, r = e[++t];
      }
      r = e[++t], u || n.push({
        type: "string",
        value: a
      });
      continue;
    }
    if (r && /\s/.test(r)) {
      t++;
      continue;
    }
    let o = /[0-9]/;
    if (r && o.test(r) || r === "-" || r === ".") {
      let a = "";
      for (r === "-" && (a += r, r = e[++t]); r && o.test(r) || r === "."; )
        a += r, r = e[++t];
      n.push({
        type: "number",
        value: a
      });
      continue;
    }
    let i = /[a-z]/i;
    if (r && i.test(r)) {
      let a = "";
      for (; r && i.test(r) && t !== e.length; )
        a += r, r = e[++t];
      if (a == "true" || a == "false" || a === "null") n.push({
        type: "name",
        value: a
      });
      else {
        t++;
        continue;
      }
      continue;
    }
    t++;
  }
  return n;
}, In = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), In(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), In(e);
    case "string":
      let r = e[e.length - 2];
      if (r?.type === "delimiter")
        return e = e.slice(0, e.length - 1), In(e);
      if (r?.type === "brace" && r.value === "{")
        return e = e.slice(0, e.length - 1), In(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), In(e);
  }
  return e;
}, by = (e) => {
  let t = [];
  return e.map((n) => {
    n.type === "brace" && (n.value === "{" ? t.push("}") : t.splice(t.lastIndexOf("}"), 1)), n.type === "paren" && (n.value === "[" ? t.push("]") : t.splice(t.lastIndexOf("]"), 1));
  }), t.length > 0 && t.reverse().map((n) => {
    n === "}" ? e.push({
      type: "brace",
      value: "}"
    }) : n === "]" && e.push({
      type: "paren",
      value: "]"
    });
  }), e;
}, Py = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, Of = (e) => JSON.parse(Py(by(In(Cy(e))))), Xe, Mt, yn, tr, go, nr, rr, yo, or, yt, ir, _o, vo, Wt, Ao, To, sr, zi, Hl, So, Yi, Xi, Qi, Vl, Kl = "__json_buf";
function Jl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Ry = class Is {
  constructor(t, n) {
    Xe.add(this), this.messages = [], this.receivedMessages = [], Mt.set(this, void 0), yn.set(this, null), this.controller = new AbortController(), tr.set(this, void 0), go.set(this, () => {
    }), nr.set(this, () => {
    }), rr.set(this, void 0), yo.set(this, () => {
    }), or.set(this, () => {
    }), yt.set(this, {}), ir.set(this, !1), _o.set(this, !1), vo.set(this, !1), Wt.set(this, !1), Ao.set(this, void 0), To.set(this, void 0), sr.set(this, void 0), So.set(this, (r) => {
      if (U(this, _o, !0, "f"), Vr(r) && (r = new ut()), r instanceof ut)
        return U(this, vo, !0, "f"), this._emit("abort", r);
      if (r instanceof K) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new K(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new K(String(r)));
    }), U(this, tr, new Promise((r, o) => {
      U(this, go, r, "f"), U(this, nr, o, "f");
    }), "f"), U(this, rr, new Promise((r, o) => {
      U(this, yo, r, "f"), U(this, or, o, "f");
    }), "f"), w(this, tr, "f").catch(() => {
    }), w(this, rr, "f").catch(() => {
    }), U(this, yn, t, "f"), U(this, sr, n?.logger ?? console, "f");
  }
  get response() {
    return w(this, Ao, "f");
  }
  get request_id() {
    return w(this, To, "f");
  }
  async withResponse() {
    U(this, Wt, !0, "f");
    const t = await w(this, tr, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Is(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const i = new Is(n, { logger: o });
    for (const a of n.messages) i._addMessageParam(a);
    return U(i, yn, {
      ...n,
      stream: !0
    }, "f"), i._run(() => i._createMessage(t, {
      ...n,
      stream: !0
    }, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, w(this, So, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, r) {
    const o = r?.signal;
    let i;
    o && (o.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), o.addEventListener("abort", i));
    try {
      w(this, Xe, "m", Yi).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) w(this, Xe, "m", Xi).call(this, c);
      if (u.controller.signal?.aborted) throw new ut();
      w(this, Xe, "m", Qi).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (U(this, Ao, t, "f"), U(this, To, t?.headers.get("request-id"), "f"), w(this, go, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return w(this, ir, "f");
  }
  get errored() {
    return w(this, _o, "f");
  }
  get aborted() {
    return w(this, vo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (w(this, yt, "f")[t] || (w(this, yt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = w(this, yt, "f")[t];
    if (!r) return this;
    const o = r.findIndex((i) => i.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (w(this, yt, "f")[t] || (w(this, yt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      U(this, Wt, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    U(this, Wt, !0, "f"), await w(this, rr, "f");
  }
  get currentMessage() {
    return w(this, Mt, "f");
  }
  async finalMessage() {
    return await this.done(), w(this, Xe, "m", zi).call(this);
  }
  async finalText() {
    return await this.done(), w(this, Xe, "m", Hl).call(this);
  }
  _emit(t, ...n) {
    if (w(this, ir, "f")) return;
    t === "end" && (U(this, ir, !0, "f"), w(this, yo, "f").call(this));
    const r = w(this, yt, "f")[t];
    if (r && (w(this, yt, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !w(this, Wt, "f") && !r?.length && Promise.reject(o), w(this, nr, "f").call(this, o), w(this, or, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !w(this, Wt, "f") && !r?.length && Promise.reject(o), w(this, nr, "f").call(this, o), w(this, or, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", w(this, Xe, "m", zi).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      w(this, Xe, "m", Yi).call(this), this._connected(null);
      const i = Kr.fromReadableStream(t, this.controller);
      for await (const a of i) w(this, Xe, "m", Xi).call(this, a);
      if (i.controller.signal?.aborted) throw new ut();
      w(this, Xe, "m", Qi).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(Mt = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), tr = /* @__PURE__ */ new WeakMap(), go = /* @__PURE__ */ new WeakMap(), nr = /* @__PURE__ */ new WeakMap(), rr = /* @__PURE__ */ new WeakMap(), yo = /* @__PURE__ */ new WeakMap(), or = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), ir = /* @__PURE__ */ new WeakMap(), _o = /* @__PURE__ */ new WeakMap(), vo = /* @__PURE__ */ new WeakMap(), Wt = /* @__PURE__ */ new WeakMap(), Ao = /* @__PURE__ */ new WeakMap(), To = /* @__PURE__ */ new WeakMap(), sr = /* @__PURE__ */ new WeakMap(), So = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakSet(), zi = function() {
    if (this.receivedMessages.length === 0) throw new K("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Hl = function() {
    if (this.receivedMessages.length === 0) throw new K("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new K("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Yi = function() {
    this.ended || U(this, Mt, void 0, "f");
  }, Xi = function(n) {
    if (this.ended) return;
    const r = w(this, Xe, "m", Vl).call(this, n);
    switch (this._emit("streamEvent", n, r), n.type) {
      case "content_block_delta": {
        const o = r.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            o.type === "text" && this._emit("text", n.delta.text, o.text || "");
            break;
          case "citations_delta":
            o.type === "text" && this._emit("citation", n.delta.citation, o.citations ?? []);
            break;
          case "input_json_delta":
            Jl(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
            break;
          case "thinking_delta":
            o.type === "thinking" && this._emit("thinking", n.delta.thinking, o.thinking);
            break;
          case "signature_delta":
            o.type === "thinking" && this._emit("signature", o.signature);
            break;
          case "compaction_delta":
            o.type === "compaction" && o.content && this._emit("compaction", o.content);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(r), this._addMessage(Gl(r, w(this, yn, "f"), { logger: w(this, sr, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        U(this, Mt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Qi = function() {
    if (this.ended) throw new K("stream has ended, this shouldn't happen");
    const n = w(this, Mt, "f");
    if (!n) throw new K("request ended without sending any chunks");
    return U(this, Mt, void 0, "f"), Gl(n, w(this, yn, "f"), { logger: w(this, sr, "f") });
  }, Vl = function(n) {
    let r = w(this, Mt, "f");
    if (n.type === "message_start") {
      if (r) throw new K(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new K(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return r;
      case "message_delta":
        return r.container = n.delta.container, r.stop_reason = n.delta.stop_reason, r.stop_sequence = n.delta.stop_sequence, r.usage.output_tokens = n.usage.output_tokens, r.context_management = n.context_management, n.usage.input_tokens != null && (r.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (r.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (r.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (r.usage.server_tool_use = n.usage.server_tool_use), n.usage.iterations != null && (r.usage.iterations = n.usage.iterations), r;
      case "content_block_start":
        return r.content.push(n.content_block), r;
      case "content_block_delta": {
        const o = r.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            o?.type === "text" && (r.content[n.index] = {
              ...o,
              text: (o.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            o?.type === "text" && (r.content[n.index] = {
              ...o,
              citations: [...o.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (o && Jl(o)) {
              let i = o[Kl] || "";
              i += n.delta.partial_json;
              const a = { ...o };
              if (Object.defineProperty(a, Kl, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                a.input = Of(i);
              } catch (u) {
                const c = new K(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                w(this, So, "f").call(this, c);
              }
              r.content[n.index] = a;
            }
            break;
          case "thinking_delta":
            o?.type === "thinking" && (r.content[n.index] = {
              ...o,
              thinking: o.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            o?.type === "thinking" && (r.content[n.index] = {
              ...o,
              signature: n.delta.signature
            });
            break;
          case "compaction_delta":
            o?.type === "compaction" && (r.content[n.index] = {
              ...o,
              content: (o.content || "") + n.delta.content
            });
            break;
          default:
            n.delta;
        }
        return r;
      }
      case "content_block_stop":
        return r;
    }
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let r = !1;
    return this.on("streamEvent", (o) => {
      const i = n.shift();
      i ? i.resolve(o) : t.push(o);
    }), this.on("end", () => {
      r = !0;
      for (const o of n) o.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), this.on("error", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((o, i) => n.push({
        resolve: o,
        reject: i
      })).then((o) => o ? {
        value: o,
        done: !1
      } : {
        value: void 0,
        done: !0
      }),
      return: async () => (this.abort(), {
        value: void 0,
        done: !0
      })
    };
  }
  toReadableStream() {
    return new Kr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, qf = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var xy = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
1. Task Overview
The user's core request and success criteria
Any clarifications or constraints they specified
2. Current State
What has been completed so far
Files created, modified, or analyzed (with paths if relevant)
Key outputs or artifacts produced
3. Important Discoveries
Technical constraints or requirements uncovered
Decisions made and their rationale
Errors encountered and how they were resolved
What approaches were tried that didn't work (and why)
4. Next Steps
Specific actions needed to complete the task
Any blockers or open questions to resolve
Priority order if multiple steps remain
5. Context to Preserve
User preferences or style requirements
Domain-specific details that aren't obvious
Any promises made to the user
Be concise but complete—err on the side of including information that would prevent duplicate work or repeated mistakes. Write in a way that enables immediate resumption of the task.
Wrap your summary in <summary></summary> tags.`, ar, _n, zt, pe, ke, Fe, wt, Nt, lr, Wl, Cs;
function zl() {
  let e, t;
  return {
    promise: new Promise((n, r) => {
      e = n, t = r;
    }),
    resolve: e,
    reject: t
  };
}
var Bf = class {
  constructor(e, t, n) {
    ar.add(this), this.client = e, _n.set(this, !1), zt.set(this, !1), pe.set(this, void 0), ke.set(this, void 0), Fe.set(this, void 0), wt.set(this, void 0), Nt.set(this, void 0), lr.set(this, 0), U(this, pe, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const r = ["BetaToolRunner", ...Pf(t.tools, t.messages)].join(", ");
    U(this, ke, {
      ...n,
      headers: N([{ "x-stainless-helper": r }, n?.headers])
    }, "f"), U(this, Nt, zl(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(_n = /* @__PURE__ */ new WeakMap(), zt = /* @__PURE__ */ new WeakMap(), pe = /* @__PURE__ */ new WeakMap(), ke = /* @__PURE__ */ new WeakMap(), Fe = /* @__PURE__ */ new WeakMap(), wt = /* @__PURE__ */ new WeakMap(), Nt = /* @__PURE__ */ new WeakMap(), lr = /* @__PURE__ */ new WeakMap(), ar = /* @__PURE__ */ new WeakSet(), Wl = async function() {
    const t = w(this, pe, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (w(this, Fe, "f") !== void 0) try {
      const c = await w(this, Fe, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const r = t.contextTokenThreshold ?? 1e5;
    if (n < r) return !1;
    const o = t.model ?? w(this, pe, "f").params.model, i = t.summaryPrompt ?? xy, a = w(this, pe, "f").params.messages;
    if (a[a.length - 1].role === "assistant") {
      const c = a[a.length - 1];
      if (Array.isArray(c.content)) {
        const d = c.content.filter((h) => h.type !== "tool_use");
        d.length === 0 ? a.pop() : c.content = d;
      }
    }
    const u = await this.client.beta.messages.create({
      model: o,
      messages: [...a, {
        role: "user",
        content: [{
          type: "text",
          text: i
        }]
      }],
      max_tokens: w(this, pe, "f").params.max_tokens
    }, {
      signal: w(this, ke, "f").signal,
      headers: N([w(this, ke, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new K("Expected text response for compaction");
    return w(this, pe, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (w(this, _n, "f")) throw new K("Cannot iterate over a consumed stream");
    U(this, _n, !0, "f"), U(this, zt, !0, "f"), U(this, wt, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (w(this, pe, "f").params.max_iterations && w(this, lr, "f") >= w(this, pe, "f").params.max_iterations) break;
          U(this, zt, !1, "f"), U(this, wt, void 0, "f"), U(this, lr, (e = w(this, lr, "f"), e++, e), "f"), U(this, Fe, void 0, "f");
          const { max_iterations: n, compactionControl: r, ...o } = w(this, pe, "f").params;
          if (o.stream ? (t = this.client.beta.messages.stream({ ...o }, w(this, ke, "f")), U(this, Fe, t.finalMessage(), "f"), w(this, Fe, "f").catch(() => {
          }), yield t) : (U(this, Fe, this.client.beta.messages.create({
            ...o,
            stream: !1
          }, w(this, ke, "f")), "f"), yield w(this, Fe, "f")), !await w(this, ar, "m", Wl).call(this)) {
            if (!w(this, zt, "f")) {
              const { role: a, content: u } = await w(this, Fe, "f");
              w(this, pe, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const i = await w(this, ar, "m", Cs).call(this, w(this, pe, "f").params.messages.at(-1));
            if (i) w(this, pe, "f").params.messages.push(i);
            else if (!w(this, zt, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!w(this, Fe, "f")) throw new K("ToolRunner concluded without a message from the server");
      w(this, Nt, "f").resolve(await w(this, Fe, "f"));
    } catch (t) {
      throw U(this, _n, !1, "f"), w(this, Nt, "f").promise.catch(() => {
      }), w(this, Nt, "f").reject(t), U(this, Nt, zl(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? w(this, pe, "f").params = e(w(this, pe, "f").params) : w(this, pe, "f").params = e, U(this, zt, !0, "f"), U(this, wt, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? U(this, ke, e(w(this, ke, "f")), "f") : U(this, ke, {
      ...w(this, ke, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = w(this, ke, "f").signal) {
    const t = await w(this, Fe, "f") ?? this.params.messages.at(-1);
    return t ? w(this, ar, "m", Cs).call(this, t, e) : null;
  }
  done() {
    return w(this, Nt, "f").promise;
  }
  async runUntilDone() {
    if (!w(this, _n, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return w(this, pe, "f").params;
  }
  pushMessages(...e) {
    this.setMessagesParams((t) => ({
      ...t,
      messages: [...t.messages, ...e]
    }));
  }
  then(e, t) {
    return this.runUntilDone().then(e, t);
  }
};
Cs = async function(t, n = w(this, ke, "f").signal) {
  return w(this, wt, "f") !== void 0 ? w(this, wt, "f") : (U(this, wt, My(w(this, pe, "f").params, t, {
    ...w(this, ke, "f"),
    signal: n
  }), "f"), w(this, wt, "f"));
};
async function My(e, t = e.messages.at(-1), n) {
  if (!t || t.role !== "assistant" || !t.content || typeof t.content == "string") return null;
  const r = t.content.filter((o) => o.type === "tool_use");
  return r.length === 0 ? null : {
    role: "user",
    content: await Promise.all(r.map(async (o) => {
      const i = e.tools.find((a) => ("name" in a ? a.name : a.mcp_server_name) === o.name);
      if (!i || !("run" in i)) return {
        type: "tool_result",
        tool_use_id: o.id,
        content: `Error: Tool '${o.name}' not found`,
        is_error: !0
      };
      try {
        let a = o.input;
        "parse" in i && i.parse && (a = i.parse(a));
        const u = await i.run(a, {
          toolUseBlock: o,
          signal: n?.signal
        });
        return {
          type: "tool_result",
          tool_use_id: o.id,
          content: u
        };
      } catch (a) {
        return {
          type: "tool_result",
          tool_use_id: o.id,
          content: a instanceof qf ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var Gf = class Hf {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new Zr();
    for await (const n of this.iterator) for (const r of t.decode(n)) yield JSON.parse(r);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new K("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new K("Attempted to iterate over a response with no body");
    return new Hf(_a(t.body), n);
  }
}, Vf = class extends re {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", jr, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const r = await this.retrieve(e);
    if (!r.results_url) throw new K(`No batch \`results_url\`; Has it finished processing? ${r.processing_status} - ${r.id}`);
    const { betas: o } = t ?? {};
    return this._client.get(r.results_url, {
      ...n,
      headers: N([{
        "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, a) => Gf.fromResponse(a.response, a.controller));
  }
}, Yl = {
  "claude-1.3": "November 6th, 2024",
  "claude-1.3-100k": "November 6th, 2024",
  "claude-instant-1.1": "November 6th, 2024",
  "claude-instant-1.1-100k": "November 6th, 2024",
  "claude-instant-1.2": "November 6th, 2024",
  "claude-3-sonnet-20240229": "July 21st, 2025",
  "claude-3-opus-20240229": "January 5th, 2026",
  "claude-2.1": "July 21st, 2025",
  "claude-2.0": "July 21st, 2025",
  "claude-3-7-sonnet-latest": "February 19th, 2026",
  "claude-3-7-sonnet-20250219": "February 19th, 2026"
}, Ny = ["claude-mythos-preview", "claude-opus-4-6"], eo = class extends re {
  constructor() {
    super(...arguments), this.batches = new Vf(this._client);
  }
  create(e, t) {
    const n = Xl(e), { betas: r, ...o } = n;
    o.model in Yl && console.warn(`The model '${o.model}' is deprecated and will reach end-of-life on ${Yl[o.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Ny.includes(o.model) && o.thinking && o.thinking.type === "enabled" && console.warn(`Using Claude with ${o.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!o.stream && i == null) {
      const u = Lf[o.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(o.max_tokens, u);
    }
    const a = Rf(o.tools, o.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: o,
      timeout: i ?? 6e5,
      ...t,
      headers: N([
        { ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 },
        a,
        t?.headers
      ]),
      stream: n.stream ?? !1
    });
  }
  parse(e, t) {
    return t = {
      ...t,
      headers: N([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => Ff(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Ry.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...r } = Xl(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new Bf(this._client, e, t);
  }
};
function Xl(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new K("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
eo.Batches = Vf;
eo.BetaToolRunner = Bf;
eo.ToolError = qf;
var Kf = class extends re {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/sessions/${e}/events?beta=true`, Ue, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/sessions/${e}/events?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, Jf = class extends re {
  retrieve(e, t, n) {
    const { session_id: r, betas: o } = t;
    return this._client.get(q`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: r, betas: o, ...i } = t;
    return this._client.post(q`/v1/sessions/${r}/resources/${e}?beta=true`, {
      body: i,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/sessions/${e}/resources?beta=true`, Ue, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: r, betas: o } = t;
    return this._client.delete(q`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/sessions/${e}/resources?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ci = class extends re {
  constructor() {
    super(...arguments), this.events = new Kf(this._client), this.resources = new Jf(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/sessions/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", Ue, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Ci.Events = Kf;
Ci.Resources = Jf;
var Wf = class extends re {
  create(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.post(q`/v1/skills/${e}/versions?beta=true`, Aa({
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r, betas: o } = t;
    return this._client.get(q`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/skills/${e}/versions?beta=true`, Ue, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: r, betas: o } = t;
    return this._client.delete(q`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, Sa = class extends re {
  constructor() {
    super(...arguments), this.versions = new Wf(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Aa({
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", Ue, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
Sa.Versions = Wf;
var zf = class extends re {
  create(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/vaults/${e}/credentials?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.get(q`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: r, betas: o, ...i } = t;
    return this._client.post(q`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      body: i,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/vaults/${e}/credentials?beta=true`, Ue, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.delete(q`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.post(q`/v1/vaults/${r}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ea = class extends re {
  constructor() {
    super(...arguments), this.credentials = new zf(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/vaults/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", Ue, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Ea.Credentials = zf;
var nt = class extends re {
  constructor() {
    super(...arguments), this.models = new Mf(this._client), this.messages = new eo(this._client), this.agents = new Ta(this._client), this.environments = new bf(this._client), this.sessions = new Ci(this._client), this.vaults = new Ea(this._client), this.memoryStores = new Ii(this._client), this.files = new xf(this._client), this.skills = new Sa(this._client), this.userProfiles = new Nf(this._client);
  }
};
nt.Models = Mf;
nt.Messages = eo;
nt.Agents = Ta;
nt.Environments = bf;
nt.Sessions = Ci;
nt.Vaults = Ea;
nt.MemoryStores = Ii;
nt.Files = xf;
nt.Skills = Sa;
nt.UserProfiles = Nf;
var Yf = class extends re {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/complete", {
      body: r,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: N([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function Xf(e) {
  return e?.output_config?.format;
}
function Ql(e, t, n) {
  const r = Xf(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((o) => o.type === "text" ? Object.defineProperty({ ...o }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : o),
    parsed_output: null
  } : Qf(e, t, n);
}
function Qf(e, t, n) {
  let r = null;
  const o = e.content.map((i) => {
    if (i.type === "text") {
      const a = ky(t, i.text);
      return r === null && (r = a), Object.defineProperty({ ...i }, "parsed_output", {
        value: a,
        enumerable: !1
      });
    }
    return i;
  });
  return {
    ...e,
    content: o,
    parsed_output: r
  };
}
function ky(e, t) {
  const n = Xf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new K(`Failed to parse structured output: ${r}`);
  }
}
var Qe, kt, vn, ur, Eo, cr, dr, wo, fr, _t, hr, Io, Co, Yt, bo, Po, pr, Zi, Zl, ji, es, ts, ns, jl, eu = "__json_buf";
function tu(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var Dy = class bs {
  constructor(t, n) {
    Qe.add(this), this.messages = [], this.receivedMessages = [], kt.set(this, void 0), vn.set(this, null), this.controller = new AbortController(), ur.set(this, void 0), Eo.set(this, () => {
    }), cr.set(this, () => {
    }), dr.set(this, void 0), wo.set(this, () => {
    }), fr.set(this, () => {
    }), _t.set(this, {}), hr.set(this, !1), Io.set(this, !1), Co.set(this, !1), Yt.set(this, !1), bo.set(this, void 0), Po.set(this, void 0), pr.set(this, void 0), ji.set(this, (r) => {
      if (U(this, Io, !0, "f"), Vr(r) && (r = new ut()), r instanceof ut)
        return U(this, Co, !0, "f"), this._emit("abort", r);
      if (r instanceof K) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new K(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new K(String(r)));
    }), U(this, ur, new Promise((r, o) => {
      U(this, Eo, r, "f"), U(this, cr, o, "f");
    }), "f"), U(this, dr, new Promise((r, o) => {
      U(this, wo, r, "f"), U(this, fr, o, "f");
    }), "f"), w(this, ur, "f").catch(() => {
    }), w(this, dr, "f").catch(() => {
    }), U(this, vn, t, "f"), U(this, pr, n?.logger ?? console, "f");
  }
  get response() {
    return w(this, bo, "f");
  }
  get request_id() {
    return w(this, Po, "f");
  }
  async withResponse() {
    U(this, Yt, !0, "f");
    const t = await w(this, ur, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new bs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const i = new bs(n, { logger: o });
    for (const a of n.messages) i._addMessageParam(a);
    return U(i, vn, {
      ...n,
      stream: !0
    }, "f"), i._run(() => i._createMessage(t, {
      ...n,
      stream: !0
    }, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, w(this, ji, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, r) {
    const o = r?.signal;
    let i;
    o && (o.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), o.addEventListener("abort", i));
    try {
      w(this, Qe, "m", es).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) w(this, Qe, "m", ts).call(this, c);
      if (u.controller.signal?.aborted) throw new ut();
      w(this, Qe, "m", ns).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (U(this, bo, t, "f"), U(this, Po, t?.headers.get("request-id"), "f"), w(this, Eo, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return w(this, hr, "f");
  }
  get errored() {
    return w(this, Io, "f");
  }
  get aborted() {
    return w(this, Co, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (w(this, _t, "f")[t] || (w(this, _t, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = w(this, _t, "f")[t];
    if (!r) return this;
    const o = r.findIndex((i) => i.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (w(this, _t, "f")[t] || (w(this, _t, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      U(this, Yt, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    U(this, Yt, !0, "f"), await w(this, dr, "f");
  }
  get currentMessage() {
    return w(this, kt, "f");
  }
  async finalMessage() {
    return await this.done(), w(this, Qe, "m", Zi).call(this);
  }
  async finalText() {
    return await this.done(), w(this, Qe, "m", Zl).call(this);
  }
  _emit(t, ...n) {
    if (w(this, hr, "f")) return;
    t === "end" && (U(this, hr, !0, "f"), w(this, wo, "f").call(this));
    const r = w(this, _t, "f")[t];
    if (r && (w(this, _t, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !w(this, Yt, "f") && !r?.length && Promise.reject(o), w(this, cr, "f").call(this, o), w(this, fr, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !w(this, Yt, "f") && !r?.length && Promise.reject(o), w(this, cr, "f").call(this, o), w(this, fr, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", w(this, Qe, "m", Zi).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      w(this, Qe, "m", es).call(this), this._connected(null);
      const i = Kr.fromReadableStream(t, this.controller);
      for await (const a of i) w(this, Qe, "m", ts).call(this, a);
      if (i.controller.signal?.aborted) throw new ut();
      w(this, Qe, "m", ns).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(kt = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakMap(), ur = /* @__PURE__ */ new WeakMap(), Eo = /* @__PURE__ */ new WeakMap(), cr = /* @__PURE__ */ new WeakMap(), dr = /* @__PURE__ */ new WeakMap(), wo = /* @__PURE__ */ new WeakMap(), fr = /* @__PURE__ */ new WeakMap(), _t = /* @__PURE__ */ new WeakMap(), hr = /* @__PURE__ */ new WeakMap(), Io = /* @__PURE__ */ new WeakMap(), Co = /* @__PURE__ */ new WeakMap(), Yt = /* @__PURE__ */ new WeakMap(), bo = /* @__PURE__ */ new WeakMap(), Po = /* @__PURE__ */ new WeakMap(), pr = /* @__PURE__ */ new WeakMap(), ji = /* @__PURE__ */ new WeakMap(), Qe = /* @__PURE__ */ new WeakSet(), Zi = function() {
    if (this.receivedMessages.length === 0) throw new K("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Zl = function() {
    if (this.receivedMessages.length === 0) throw new K("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new K("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, es = function() {
    this.ended || U(this, kt, void 0, "f");
  }, ts = function(n) {
    if (this.ended) return;
    const r = w(this, Qe, "m", jl).call(this, n);
    switch (this._emit("streamEvent", n, r), n.type) {
      case "content_block_delta": {
        const o = r.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            o.type === "text" && this._emit("text", n.delta.text, o.text || "");
            break;
          case "citations_delta":
            o.type === "text" && this._emit("citation", n.delta.citation, o.citations ?? []);
            break;
          case "input_json_delta":
            tu(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
            break;
          case "thinking_delta":
            o.type === "thinking" && this._emit("thinking", n.delta.thinking, o.thinking);
            break;
          case "signature_delta":
            o.type === "thinking" && this._emit("signature", o.signature);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(r), this._addMessage(Ql(r, w(this, vn, "f"), { logger: w(this, pr, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        U(this, kt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, ns = function() {
    if (this.ended) throw new K("stream has ended, this shouldn't happen");
    const n = w(this, kt, "f");
    if (!n) throw new K("request ended without sending any chunks");
    return U(this, kt, void 0, "f"), Ql(n, w(this, vn, "f"), { logger: w(this, pr, "f") });
  }, jl = function(n) {
    let r = w(this, kt, "f");
    if (n.type === "message_start") {
      if (r) throw new K(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new K(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return r;
      case "message_delta":
        return r.stop_reason = n.delta.stop_reason, r.stop_sequence = n.delta.stop_sequence, r.usage.output_tokens = n.usage.output_tokens, n.usage.input_tokens != null && (r.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (r.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (r.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (r.usage.server_tool_use = n.usage.server_tool_use), r;
      case "content_block_start":
        return r.content.push({ ...n.content_block }), r;
      case "content_block_delta": {
        const o = r.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            o?.type === "text" && (r.content[n.index] = {
              ...o,
              text: (o.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            o?.type === "text" && (r.content[n.index] = {
              ...o,
              citations: [...o.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (o && tu(o)) {
              let i = o[eu] || "";
              i += n.delta.partial_json;
              const a = { ...o };
              Object.defineProperty(a, eu, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (a.input = Of(i)), r.content[n.index] = a;
            }
            break;
          case "thinking_delta":
            o?.type === "thinking" && (r.content[n.index] = {
              ...o,
              thinking: o.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            o?.type === "thinking" && (r.content[n.index] = {
              ...o,
              signature: n.delta.signature
            });
            break;
          default:
            n.delta;
        }
        return r;
      }
      case "content_block_stop":
        return r;
    }
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let r = !1;
    return this.on("streamEvent", (o) => {
      const i = n.shift();
      i ? i.resolve(o) : t.push(o);
    }), this.on("end", () => {
      r = !0;
      for (const o of n) o.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), this.on("error", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((o, i) => n.push({
        resolve: o,
        reject: i
      })).then((o) => o ? {
        value: o,
        done: !1
      } : {
        value: void 0,
        done: !0
      }),
      return: async () => (this.abort(), {
        value: void 0,
        done: !0
      })
    };
  }
  toReadableStream() {
    return new Kr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Zf = class extends re {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(q`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", jr, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(q`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(q`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new K(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: N([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((r, o) => Gf.fromResponse(o.response, o.controller));
  }
}, wa = class extends re {
  constructor() {
    super(...arguments), this.batches = new Zf(this._client);
  }
  create(e, t) {
    e.model in nu && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${nu[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), $y.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const o = Lf[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, o);
    }
    const r = Rf(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: N([r, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Qf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Dy.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, nu = {
  "claude-1.3": "November 6th, 2024",
  "claude-1.3-100k": "November 6th, 2024",
  "claude-instant-1.1": "November 6th, 2024",
  "claude-instant-1.1-100k": "November 6th, 2024",
  "claude-instant-1.2": "November 6th, 2024",
  "claude-3-sonnet-20240229": "July 21st, 2025",
  "claude-3-opus-20240229": "January 5th, 2026",
  "claude-2.1": "July 21st, 2025",
  "claude-2.0": "July 21st, 2025",
  "claude-3-7-sonnet-latest": "February 19th, 2026",
  "claude-3-7-sonnet-20250219": "February 19th, 2026",
  "claude-3-5-haiku-latest": "February 19th, 2026",
  "claude-3-5-haiku-20241022": "February 19th, 2026",
  "claude-opus-4-0": "June 15th, 2026",
  "claude-opus-4-20250514": "June 15th, 2026",
  "claude-sonnet-4-0": "June 15th, 2026",
  "claude-sonnet-4-20250514": "June 15th, 2026"
}, $y = ["claude-mythos-preview", "claude-opus-4-6"];
wa.Batches = Zf;
var jf = class extends re {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/models/${e}`, {
      ...n,
      headers: N([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models", jr, {
      query: r,
      ...t,
      headers: N([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Ro = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Ps, Ia, Ko, eh, Ly = "\\n\\nHuman:", Uy = "\\n\\nAssistant:", ce = class {
  constructor({ baseURL: e = Ro("ANTHROPIC_BASE_URL"), apiKey: t = Ro("ANTHROPIC_API_KEY") ?? null, authToken: n = Ro("ANTHROPIC_AUTH_TOKEN") ?? null, ...r } = {}) {
    Ps.add(this), Ko.set(this, void 0);
    const o = {
      apiKey: t,
      authToken: n,
      ...r,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!o.dangerouslyAllowBrowser && Qg()) throw new K(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = o.baseURL, this.timeout = o.timeout ?? Ia.DEFAULT_TIMEOUT, this.logger = o.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = Fl(o.logLevel, "ClientOptions.logLevel", this) ?? Fl(Ro("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = o.fetchOptions, this.maxRetries = o.maxRetries ?? 2, this.fetch = o.fetch ?? ny(), U(this, Ko, oy, "f"), this._options = o, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
  }
  withOptions(e) {
    return new this.constructor({
      ...this._options,
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      apiKey: this.apiKey,
      authToken: this.authToken,
      ...e
    });
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  validateHeaders({ values: e, nulls: t }) {
    if (!(e.get("x-api-key") || e.get("authorization")) && !(this.apiKey && e.get("x-api-key")) && !t.has("x-api-key") && !(this.authToken && e.get("authorization")) && !t.has("authorization"))
      throw new Error('Could not resolve authentication method. Expected either apiKey or authToken to be set. Or for one of the "X-Api-Key" or "Authorization" headers to be explicitly omitted');
  }
  async authHeaders(e) {
    return N([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return N([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return N([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return iy(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${wn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${rf()}`;
  }
  makeStatusError(e, t, n, r) {
    return Je.generate(e, t, n, r);
  }
  buildURL(e, t, n) {
    const r = !w(this, Ps, "m", eh).call(this) && n || this.baseURL, o = Wg(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!Ml(i) || !Ml(a)) && (t = {
      ...a,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (o.search = this.stringifyQuery(t)), o.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new K("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
    return 600 * 1e3;
  }
  async prepareOptions(e) {
  }
  async prepareRequest(e, { url: t, options: n }) {
  }
  get(e, t) {
    return this.methodRequest("get", e, t);
  }
  post(e, t) {
    return this.methodRequest("post", e, t);
  }
  patch(e, t) {
    return this.methodRequest("patch", e, t);
  }
  put(e, t) {
    return this.methodRequest("put", e, t);
  }
  delete(e, t) {
    return this.methodRequest("delete", e, t);
  }
  methodRequest(e, t, n) {
    return this.request(Promise.resolve(n).then((r) => ({
      method: e,
      path: t,
      ...r
    })));
  }
  request(e, t = null) {
    return new vf(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, o = r.maxRetries ?? this.maxRetries;
    t == null && (t = o), await this.prepareOptions(r);
    const { req: i, url: a, timeout: u } = await this.buildRequest(r, { retryCount: o - t });
    await this.prepareRequest(i, {
      url: a,
      options: r
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (Re(this).debug(`[${c}] sending request`, Qt({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: i.headers
    })), r.signal?.aborted) throw new ut();
    const f = new AbortController(), p = await this.fetchWithTimeout(a, i, u, f).catch(vs), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new ut();
      const v = Vr(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return Re(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${_}`), Re(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${_})`, Qt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(r, t, n ?? c);
      throw Re(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), Re(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, Qt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - h,
        message: p.message
      })), v ? new of() : new wi({ cause: p });
    }
    const y = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, v]) => ", " + _ + ": " + JSON.stringify(v)).join("")}] ${i.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const P = `retrying, ${t} attempts remaining`;
        return await ry(p.body), Re(this).info(`${y} - ${P}`), Re(this).debug(`[${c}] response error (${P})`, Qt({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(r, t, n ?? c, p.headers);
      }
      const v = _ ? "error; no more retries left" : "error; not retryable";
      Re(this).info(`${y} - ${v}`);
      const E = await p.text().catch((P) => vs(P).message), b = pf(E), R = b ? void 0 : E;
      throw Re(this).debug(`[${c}] response error (${v})`, Qt({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: R,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, b, R, p.headers);
    }
    return Re(this).info(y), Re(this).debug(`[${c}] response start`, Qt({
      retryOfRequestLogID: n,
      url: p.url,
      status: p.status,
      headers: p.headers,
      durationMs: m - h
    })), {
      response: p,
      options: r,
      controller: f,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: h
    };
  }
  getAPIList(e, t, n) {
    return this.requestAPIList(t, n && "then" in n ? n.then((r) => ({
      method: "get",
      path: e,
      ...r
    })) : {
      method: "get",
      path: e,
      ...n
    });
  }
  requestAPIList(e, t) {
    const n = this.makeRequest(t, null, void 0);
    return new py(this, n, e);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: o, method: i, ...a } = t || {}, u = this._makeAbort(r);
    o && o.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, h = {
      signal: r.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...a
    };
    i && (h.method = i.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, h);
    } finally {
      clearTimeout(c);
    }
  }
  async shouldRetry(e) {
    const t = e.headers.get("x-should-retry");
    return t === "true" ? !0 : t === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
  }
  async retryRequest(e, t, n, r) {
    let o;
    const i = r?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (o = u);
    }
    const a = r?.get("retry-after");
    if (a && !o) {
      const u = parseFloat(a);
      Number.isNaN(u) ? o = Date.parse(a) - Date.now() : o = u * 1e3;
    }
    if (o === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      o = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await Xg(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new K("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: i, defaultBaseURL: a } = n, u = this.buildURL(o, i, a);
    "timeout" in n && Yg("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: c, body: d } = this.buildBody({ options: n });
    return {
      req: {
        method: r,
        headers: await this.buildHeaders({
          options: e,
          method: r,
          bodyHeaders: c,
          retryCount: t
        }),
        ...n.signal && { signal: n.signal },
        ...globalThis.ReadableStream && d instanceof globalThis.ReadableStream && { duplex: "half" },
        ...d && { body: d },
        ...this.fetchOptions ?? {},
        ...n.fetchOptions ?? {}
      },
      url: u,
      timeout: n.timeout
    };
  }
  async buildHeaders({ options: e, method: t, bodyHeaders: n, retryCount: r }) {
    let o = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), o[this.idempotencyHeader] = e.idempotencyKey);
    const i = N([
      o,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...ty(),
        ...this._options.dangerouslyAllowBrowser ? { "anthropic-dangerous-direct-browser-access": "true" } : void 0,
        "anthropic-version": "2023-06-01"
      },
      await this.authHeaders(e),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(i), i.values;
  }
  _makeAbort(e) {
    return () => e.abort();
  }
  buildBody({ options: { body: e, headers: t } }) {
    if (!e) return {
      bodyHeaders: void 0,
      body: void 0
    };
    const n = N([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: gf(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : w(this, Ko, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Ia = ce, Ko = /* @__PURE__ */ new WeakMap(), Ps = /* @__PURE__ */ new WeakSet(), eh = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
ce.Anthropic = Ia;
ce.HUMAN_PROMPT = Ly;
ce.AI_PROMPT = Uy;
ce.DEFAULT_TIMEOUT = 6e5;
ce.AnthropicError = K;
ce.APIError = Je;
ce.APIConnectionError = wi;
ce.APIConnectionTimeoutError = of;
ce.APIUserAbortError = ut;
ce.NotFoundError = uf;
ce.ConflictError = cf;
ce.RateLimitError = ff;
ce.BadRequestError = sf;
ce.AuthenticationError = af;
ce.InternalServerError = hf;
ce.PermissionDeniedError = lf;
ce.UnprocessableEntityError = df;
ce.toFile = Ay;
var to = class extends ce {
  constructor() {
    super(...arguments), this.completions = new Yf(this), this.messages = new wa(this), this.models = new jf(this), this.beta = new nt(this);
  }
};
to.Completions = Yf;
to.Messages = wa;
to.Models = jf;
to.Beta = nt;
function cn(e) {
  if (Array.isArray(e)) return e.map((n) => cn(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, r]) => {
    t[n] = /^(?:authorization|proxy[-_]?authorization|(?:x[-_])?csrf(?:[-_]?token)?|token|access[-_]?token|refresh[-_]?token|id[-_]?token|api[-_]?key|x[-_](?:goog[-_])?api[-_]?key|proxy[-_]?password|password|client[-_]?secret)$/i.test(n) ? "[redacted]" : cn(r);
  }), t;
}
function qt(e = {}, t = {}) {
  const n = String(e.reasoning?.mode || "inherit"), r = e.reasoning?.output === "show" ? "show" : "hide", o = String(t.effectiveMode || n);
  return {
    reasoningRequestedMode: n,
    reasoningRequestedOutput: r,
    reasoningProfileId: String(t.profileId || e.reasoning?.profileId || "unsupported"),
    reasoningEffectiveMode: o,
    reasoningEffort: o === "on" ? String(t.effort ?? e.reasoning?.effort ?? "") : "",
    reasoningBudgetTokens: o === "on" && Number.isFinite(Number(t.budgetTokens ?? e.reasoning?.budgetTokens)) ? Number(t.budgetTokens ?? e.reasoning?.budgetTokens) : null,
    reasoningControlFields: cn(t.controlFields || {}),
    reasoningOutputVisible: o !== "off" && r === "show"
  };
}
function Jr(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: cn({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    }),
    ...e.effectiveConfig ? { effectiveConfig: e.effectiveConfig } : {}
  };
}
var Fy = Object.freeze({
  minimal: "最小",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "超高",
  max: "最大",
  min: "最小"
});
function bi(e) {
  const t = e.intensity || { kind: "none" };
  return Object.freeze({
    ...e,
    modes: Object.freeze([...e.modes || ["inherit"]]),
    outputModes: Object.freeze([...e.outputModes || ["hide", "show"]]),
    temperatureOmitModes: Object.freeze([...e.temperatureOmitModes || []]),
    intensity: Object.freeze({
      ...t,
      ...Array.isArray(t.values) ? { values: Object.freeze([...t.values]) } : {}
    })
  });
}
function le(e, t, n, r, o = {}) {
  return bi({
    profileId: e,
    modes: t,
    intensity: {
      kind: "effort",
      values: n,
      defaultValue: r
    },
    outputModes: o.outputModes,
    temperatureOmitModes: o.temperatureOmitModes
  });
}
function Pi(e, t, n, r = {}) {
  return bi({
    profileId: e,
    modes: t,
    intensity: {
      kind: "budget",
      min: n.min,
      max: n.max,
      defaultValue: n.defaultValue,
      allowAuto: n.allowAuto === !0
    },
    outputModes: r.outputModes,
    temperatureOmitModes: r.temperatureOmitModes
  });
}
function Oy(e, t, n = {}) {
  return bi({
    profileId: e,
    modes: t,
    intensity: { kind: "none" },
    outputModes: n.outputModes,
    temperatureOmitModes: n.temperatureOmitModes
  });
}
var je = bi({
  profileId: "unsupported",
  modes: ["inherit"],
  outputModes: ["hide"],
  intensity: { kind: "none" },
  unsupportedReason: "当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。"
}), fn = Object.freeze(["on"]), An = Object.freeze(["inherit", "on"]), Ca = Object.freeze([
  "inherit",
  "on",
  "off"
]), Xt = Object.freeze({
  latest: le("openai-gpt-5.6", [
    "inherit",
    "on",
    "off"
  ], [
    "low",
    "medium",
    "high",
    "xhigh",
    "max"
  ], "medium", { temperatureOmitModes: Ca }),
  gpt55: le("openai-gpt-5.5", [
    "inherit",
    "on",
    "off"
  ], [
    "low",
    "medium",
    "high",
    "xhigh"
  ], "medium", { temperatureOmitModes: An }),
  gpt52To54: le("openai-gpt-5.2-5.4", [
    "inherit",
    "on",
    "off"
  ], [
    "low",
    "medium",
    "high",
    "xhigh"
  ], "medium", { temperatureOmitModes: An }),
  gpt51: le("openai-gpt-5.1", [
    "inherit",
    "on",
    "off"
  ], [
    "low",
    "medium",
    "high"
  ], "medium", { temperatureOmitModes: An }),
  fixedMedium: le("openai-gpt-5.3-chat", ["inherit", "on"], ["medium"], "medium", { temperatureOmitModes: An }),
  gpt5: le("openai-gpt-5", ["inherit", "on"], [
    "minimal",
    "low",
    "medium",
    "high"
  ], "medium", { temperatureOmitModes: An }),
  oSeries: le("openai-o-series", ["inherit", "on"], [
    "low",
    "medium",
    "high"
  ], "medium", { temperatureOmitModes: An })
}), qy = Object.freeze([
  "o1",
  "o3-mini",
  "o3-mini-2025-01-31",
  "o4-mini",
  "o4-mini-2025-04-16",
  "o3",
  "o3-2025-04-16",
  "gpt-5",
  "gpt-5-2025-08-07",
  "gpt-5-mini",
  "gpt-5-mini-2025-08-07",
  "gpt-5-nano",
  "gpt-5-nano-2025-08-07",
  "gpt-5.1",
  "gpt-5.1-2025-11-13",
  "gpt-5.1-chat-latest",
  "gpt-5.2",
  "gpt-5.2-2025-12-11",
  "gpt-5.2-chat-latest",
  "gpt-5.3-chat-latest",
  "gpt-5.4",
  "gpt-5.4-2026-03-05",
  "gpt-5.4-mini",
  "gpt-5.4-mini-2026-03-17",
  "gpt-5.4-nano",
  "gpt-5.4-nano-2026-03-17",
  "gpt-5.5",
  "gpt-5.5-2026-04-23"
]), By = new Set(qy), Gy = /* @__PURE__ */ new Set([
  "o1",
  "o1-2024-12-17",
  "o3-mini",
  "o3-mini-2025-01-31",
  "o3",
  "o3-2025-04-16",
  "o4-mini",
  "o4-mini-2025-04-16"
]), Hy = le("kimi-k3", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "max", { temperatureOmitModes: fn }), Vy = Oy("kimi-k2.5-k2.6", [
  "inherit",
  "on",
  "off"
], { temperatureOmitModes: fn }), Ky = le("deepseek-thinking", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "high", { temperatureOmitModes: fn }), Jy = le("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: fn }), Wy = le("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: Ca }), zy = Pi("anthropic-manual", [
  "inherit",
  "on",
  "off"
], {
  min: 1024,
  max: 128e3,
  defaultValue: 8192
}, { temperatureOmitModes: fn }), Yy = le("sillytavern-claude-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: Ca }), Xy = le("sillytavern-claude-adaptive-conditional", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: fn }), Qy = le("sillytavern-claude-manual", [
  "inherit",
  "on",
  "off"
], [
  "min",
  "low",
  "medium",
  "high",
  "max"
], "medium", { temperatureOmitModes: fn }), Zy = Pi("google-gemini-2.5-flash", [
  "inherit",
  "on",
  "off"
], {
  min: 1,
  max: 24576,
  defaultValue: -1,
  allowAuto: !0
}), jy = Pi("google-gemini-2.5-flash-lite", [
  "inherit",
  "on",
  "off"
], {
  min: 512,
  max: 24576,
  defaultValue: -1,
  allowAuto: !0
}), e_ = Pi("google-gemini-2.5-pro", ["inherit", "on"], {
  min: 128,
  max: 32768,
  defaultValue: -1,
  allowAuto: !0
}), t_ = le("google-gemini-3-flash", ["inherit", "on"], [
  "minimal",
  "low",
  "medium",
  "high"
], "high"), n_ = le("google-gemini-3-pro", ["inherit", "on"], ["low", "high"], "high"), r_ = le("sillytavern-google-2.5-flash", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "medium"), o_ = le("sillytavern-google-2.5-flash-lite", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "medium"), i_ = le("sillytavern-google-2.5-pro", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high",
  "max"
], "medium"), s_ = le("sillytavern-google-3-flash", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high"
], "high"), a_ = le("sillytavern-google-3-pro", ["inherit", "on"], ["low", "high"], "high");
function no(e = "") {
  return String(e || "").trim().toLowerCase();
}
function Rs(e = "") {
  const t = no(e);
  return /^gpt-5\.6(?:[-.]|$)/.test(t) ? Xt.latest : /^gpt-5\.5(?:[-.]|$)/.test(t) ? Xt.gpt55 : /^gpt-5\.3-chat-latest(?:[-.]|$)/.test(t) ? Xt.fixedMedium : /^gpt-5\.(?:2|4)(?:[-.]|$)/.test(t) ? Xt.gpt52To54 : /^gpt-5\.1(?:[-.]|$)/.test(t) ? Xt.gpt51 : /^gpt-5(?:-(?:mini|nano))?(?:-|$)/.test(t) ? Xt.gpt5 : Gy.has(t) ? Xt.oSeries : null;
}
function l_(e = "", t = "") {
  const n = no(t), r = String(e || "").trim().toLowerCase();
  return /^kimi-k3(?:[.-]|$)/.test(n) ? Hy : /^kimi-k2[.-](?:5|6)(?:[.-]|$)/.test(n) ? Vy : /^kimi-k2[.-]7(?:[.-]|$)/.test(n) ? je : /^deepseek-(?:chat|reasoner|v3)/.test(n) || r.includes("api.deepseek.com") && n.startsWith("deepseek-") ? Ky : Rs(n) || je;
}
function ru(e = "", t = !1) {
  const n = no(e);
  return /^claude-opus-4-7/.test(n) ? t ? Yy : Wy : /^claude-(?:opus-4-6|sonnet-4-6)/.test(n) ? t ? Xy : Jy : /^claude-(?:3-7|opus-4|sonnet-4|haiku-4-5)/.test(n) ? t ? Qy : zy : je;
}
function ou(e = "", t = !1) {
  const n = no(e);
  return n.includes("image") ? je : /^gemini-2\.5-flash-lite/.test(n) ? t ? o_ : jy : /^gemini-2\.5-flash/.test(n) ? t ? r_ : Zy : /^gemini-2\.5-pro/.test(n) ? t ? i_ : e_ : /^gemini-3(?:[.\d]*)?-flash/.test(n) ? t ? s_ : t_ : /^gemini-3(?:[.\d]*)?-pro/.test(n) ? t ? a_ : n_ : je;
}
function ro(e = {}) {
  const t = String(e.provider || "").trim(), n = no(e.model);
  switch (t) {
    case "openai-responses":
      return Rs(n) || je;
    case "openai-compatible":
      return l_(e.baseUrl, n);
    case "sillytavern-openai-compatible":
      return By.has(n) && Rs(n) || je;
    case "anthropic":
      return ru(n, !1);
    case "sillytavern-claude":
      return ru(n, !0);
    case "google":
      return ou(n, !1);
    case "sillytavern-google":
      return ou(n, !0);
    default:
      return je;
  }
}
function u_(e = je) {
  const t = new Set(e.modes || ["inherit"]);
  return [
    {
      value: "inherit",
      label: "跟随模型默认",
      disabled: !1
    },
    {
      value: "on",
      label: "开启",
      disabled: !t.has("on")
    },
    {
      value: "off",
      label: "关闭",
      disabled: !t.has("off")
    }
  ];
}
function c_(e = je) {
  return e.intensity?.kind !== "effort" ? [] : e.intensity.values.map((t) => ({
    value: t,
    label: Fy[t] || t
  }));
}
function d_(e = je) {
  const t = new Set(e.outputModes || ["hide"]);
  return [{
    value: "hide",
    label: "隐藏",
    disabled: !t.has("hide")
  }, {
    value: "show",
    label: "显示",
    disabled: !t.has("show")
  }];
}
function mr(e, t, n, r = "REASONING_CAPABILITY_UNSUPPORTED") {
  return {
    ...e,
    profileId: t.profileId,
    valid: !1,
    error: n,
    code: r
  };
}
function f_(e, t) {
  const n = { ...e };
  return delete n.effort, delete n.budgetTokens, t.intensity?.kind === "effort" ? {
    ...n,
    ...e.effort ? { effort: e.effort } : {}
  } : t.intensity?.kind === "budget" ? {
    ...n,
    ...e.budgetTokens !== void 0 ? { budgetTokens: e.budgetTokens } : {}
  } : n;
}
function on(e = {}, t = {}) {
  const n = ro(e), r = f_(un(t), n);
  if (!n.outputModes.includes(r.output)) return mr(r, n, "当前模型不支持返回 Reasoning 内容，请选择“隐藏”。");
  if (!n.modes.includes(r.mode)) return mr(r, n, r.mode === "off" ? "当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。" : n.unsupportedReason || "当前模型不支持显式开启 Reasoning。");
  if (r.mode !== "on") return {
    ...r,
    profileId: n.profileId,
    valid: !0
  };
  if (n.intensity.kind === "effort") {
    const o = r.effort || n.intensity.defaultValue;
    return n.intensity.values.includes(o) ? {
      ...r,
      effort: o,
      profileId: n.profileId,
      valid: !0
    } : mr(r, n, `当前模型不支持 Reasoning 强度“${o}”。`, "REASONING_CONFIG_INVALID");
  }
  if (n.intensity.kind === "budget") {
    const o = r.budgetTokens ?? n.intensity.defaultValue;
    if (!(n.intensity.allowAuto && o === -1) && (!Number.isInteger(o) || o < n.intensity.min || o > n.intensity.max)) return mr(r, n, `Reasoning Token 预算必须在 ${n.intensity.min}–${n.intensity.max} 之间${n.intensity.allowAuto ? "，或填写 -1 使用自动预算" : ""}。`, "REASONING_CONFIG_INVALID");
    const i = Number(e.maxTokens);
    return n.profileId === "anthropic-manual" && Number.isFinite(i) && i > 0 && o >= Math.floor(i) ? mr(r, n, "Anthropic 手动 thinking 的 Token 预算必须小于最大输出 Token。", "REASONING_CONFIG_INVALID") : {
      ...r,
      budgetTokens: o,
      profileId: n.profileId,
      valid: !0
    };
  }
  return {
    ...r,
    profileId: n.profileId,
    valid: !0
  };
}
var h_ = class extends Error {
  constructor(e = {}) {
    super(e.error || "当前模型不支持所选 Reasoning 配置。"), this.name = "ReasoningCapabilityError", this.code = e.code || "REASONING_CAPABILITY_UNSUPPORTED", this.profileId = e.profileId || "unsupported", this.reasoning = e;
  }
};
function th(e = {}) {
  if (e.valid === !1) throw new h_(e);
  return e;
}
function Ne(e = "", t = {}, n = {}, r = {}) {
  return th(on({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model,
    maxTokens: r.maxTokens ?? t.maxTokens
  }, n));
}
function oo(e = {}, t = {}) {
  return ro(e).temperatureOmitModes.includes(t.mode);
}
function p_(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function m_(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function nh(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function g_(e) {
  if (typeof e == "string") return [{
    type: "text",
    text: e
  }];
  if (!Array.isArray(e)) return [{
    type: "text",
    text: ""
  }];
  const t = e.map((n) => {
    if (!n || typeof n != "object") return null;
    if (n.type === "text") return {
      type: "text",
      text: n.text || ""
    };
    if (n.type === "image_url" && n.image_url?.url) {
      const r = m_(n.image_url.url);
      return !r.mediaType || !r.data ? null : {
        type: "image",
        source: {
          type: "base64",
          media_type: r.mediaType,
          data: r.data
        }
      };
    }
    return null;
  }).filter(Boolean);
  return t.length ? t : [{
    type: "text",
    text: ""
  }];
}
function y_(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function __(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && nh(t) || null;
}
function v_(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: nh(e.content) || [] } : void 0;
}
function iu(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function su(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: p_(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function A_(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const r = e[n];
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const o = __(r), i = su(r.tool_calls);
        if (o && i.length) {
          t.push({
            role: "assistant",
            content: o.filter((a) => a?.type !== "tool_use").concat(i)
          });
          continue;
        }
        if (o) {
          t.push({
            role: "assistant",
            content: o
          });
          continue;
        }
      }
      if (r.role === "tool") {
        const o = [iu(r)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, o.push(iu(e[n]));
        t.push({
          role: "user",
          content: o
        });
        continue;
      }
      if (r.role === "assistant" && Array.isArray(r.tool_calls) && r.tool_calls.length) {
        t.push({
          role: "assistant",
          content: [...r.content ? [{
            type: "text",
            text: r.content
          }] : [], ...su(r.tool_calls)]
        });
        continue;
      }
      t.push({
        role: r.role,
        content: g_(r.content)
      });
    }
  }
  return t;
}
function xo(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function au(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function T_(e = "auto", t = []) {
  const n = new Set((Array.isArray(t) ? t : []).map((o) => String(o?.function?.name || "").trim()).filter(Boolean)), r = String(e || "auto").trim() || "auto";
  if (r === "auto") return { type: "auto" };
  if (r === "required") return { type: "any" };
  if (r === "none") return { type: "none" };
  if (!n.has(r)) throw new Error(`Anthropic toolChoice 指定了不存在的工具：${r}`);
  return {
    type: "tool",
    name: r
  };
}
var S_ = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function lu(e = {}, t = {}) {
  const n = Array.isArray(t.tools) ? t.tools : [], r = n.length ? T_(t.toolChoice, n) : void 0, o = un(t.reasoning), i = ro({
    provider: "anthropic",
    baseUrl: e.baseUrl,
    model: e.model
  }), a = o.mode === "on" && i.profileId === "anthropic-manual" && (r?.type === "any" || r?.type === "tool"), u = Ne("anthropic", e, {
    ...o,
    ...a ? { mode: "off" } : {}
  }, { maxTokens: t.maxTokens });
  return {
    toolChoice: r,
    reasoning: a ? {
      ...o,
      profileId: i.profileId
    } : u,
    effectiveReasoning: u,
    reasoningDisabledForForcedTool: a
  };
}
var E_ = class {
  constructor(e) {
    this.config = e, this.client = new to({
      apiKey: e.apiKey,
      baseURL: au(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e) {
    const t = lu(this.config, e), n = t.effectiveReasoning, r = (Array.isArray(e.tools) ? e.tools : []).map((a) => ({
      name: a.function.name,
      description: a.function.description,
      input_schema: a.function.parameters
    })), o = y_(e), i = {
      model: this.config.model,
      system: o,
      messages: A_(e.messages),
      ...r.length ? {
        tools: r,
        tool_choice: t.toolChoice
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !oo({
      ...this.config,
      provider: "anthropic"
    }, n) && typeof e.temperature == "number" && (i.temperature = e.temperature), n.mode === "off" ? i.thinking = { type: "disabled" } : n.mode === "on" && n.profileId === "anthropic-adaptive" ? (i.thinking = {
      type: "adaptive",
      display: Z(n) ? "summarized" : "omitted"
    }, i.output_config = { effort: n.effort }) : n.mode === "on" && n.profileId === "anthropic-manual" && (i.thinking = {
      type: "enabled",
      budget_tokens: n.budgetTokens,
      display: Z(n) ? "summarized" : "omitted"
    }), i;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = au(this.config.baseUrl), o = t.body || this.buildRequestBody(e), i = lu(this.config, e), a = i.effectiveReasoning;
    return {
      ...Jr({
        provider: "anthropic",
        model: this.config.model,
        transport: "anthropic-sdk",
        url: `${r}/v1/messages`,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey || ""
        },
        body: o,
        sdk: n ? "client.messages.stream" : "client.messages.create",
        effectiveConfig: qt(e, {
          profileId: i.reasoning.profileId,
          effectiveMode: a.mode,
          effort: o.output_config?.effort,
          budgetTokens: o.thinking?.budget_tokens,
          controlFields: {
            ...o.thinking ? { thinking: o.thinking } : {},
            ...o.output_config ? { output_config: o.output_config } : {}
          }
        })
      }),
      ...i.reasoningDisabledForForcedTool ? { notices: [S_] } : {}
    };
  }
  async chat(e) {
    const t = this.buildRequestBody(e), n = this.inspectRequest(e, { body: t });
    let r;
    if (typeof e.onStreamProgress == "function") {
      const i = this.client.messages.stream(t, { signal: e.signal }), a = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
      let c = "";
      const d = () => Z(e.reasoning) ? Array.from(a.entries()).sort(([p], [m]) => p.localeCompare(m)).map(([p, m]) => ({
        label: p.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: m
      })).filter((p) => p.text) : [], h = () => Array.from(u.entries()).sort(([p], [m]) => Number(p) - Number(m)).map(([, p]) => ({
        id: p.id || "anthropic-tool-draft",
        name: p.name || "工具调用",
        arguments: p.inputJson || "{}",
        draft: !0
      })).filter((p) => p.name), f = () => {
        const p = h();
        p.length && xo(e, {
          text: c,
          thoughts: d(),
          toolCalls: p,
          toolCallDraft: !0
        });
      };
      i.on("text", (p, m) => {
        c = m || "", xo(e, {
          text: c,
          thoughts: d(),
          ...h().length ? {
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), i.on("thinking", (p, m) => {
        a.set("thinking:0", m || ""), xo(e, {
          thoughts: d(),
          ...h().length ? {
            text: c,
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), i.on("streamEvent", (p) => {
        if (p?.type === "content_block_start" && p.content_block?.type === "tool_use") {
          const m = p.content_block.input && typeof p.content_block.input == "object" ? p.content_block.input : {};
          u.set(p.index, {
            id: p.content_block.id || `anthropic-tool-draft-${p.index + 1}`,
            name: p.content_block.name || "工具调用",
            inputJson: Object.keys(m).length ? JSON.stringify(m) : ""
          }), f();
          return;
        }
        if (p?.type === "content_block_delta" && p.delta?.type === "input_json_delta") {
          const m = u.get(p.index) || {
            id: `anthropic-tool-draft-${p.index + 1}`,
            name: "工具调用",
            inputJson: ""
          };
          u.set(p.index, {
            ...m,
            inputJson: `${m.inputJson || ""}${p.delta.partial_json || ""}`
          }), f();
        }
      }), i.on("contentBlock", (p) => {
        p?.type === "redacted_thinking" && (a.set("redacted:0", p.data || ""), xo(e, {
          thoughts: d(),
          ...h().length ? {
            text: c,
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        }));
      }), r = await i.finalMessage();
    } else r = await this.client.messages.create(t, { signal: e.signal });
    const o = (r.content || []).filter((i) => i.type === "tool_use" && i.name).map((i, a) => ({
      id: i.id || `anthropic-tool-${a + 1}`,
      name: i.name,
      arguments: JSON.stringify(i.input || {})
    }));
    return {
      text: (r.content || []).filter((i) => i.type === "text").map((i) => i.text || "").join(`
`),
      toolCalls: o,
      thoughts: Z(e.reasoning) ? (r.content || []).filter((i) => i.type === "thinking" || i.type === "redacted_thinking").map((i) => ({
        label: i.type === "thinking" ? "思考块" : "已脱敏思考块",
        text: i.type === "thinking" ? i.thinking || "" : i.data || ""
      })).filter((i) => i.text) : [],
      finishReason: r.stop_reason || "stop",
      model: r.model || this.config.model,
      provider: "anthropic",
      providerPayload: v_(r),
      requestInspection: n
    };
  }
}, w_ = /* @__PURE__ */ Si(((e, t) => {
  function n(r, o) {
    typeof o == "boolean" && (o = { forever: o }), this._originalTimeouts = JSON.parse(JSON.stringify(r)), this._timeouts = r, this._options = o || {}, this._maxRetryTime = o && o.maxRetryTime || 1 / 0, this._fn = null, this._errors = [], this._attempts = 1, this._operationTimeout = null, this._operationTimeoutCb = null, this._timeout = null, this._operationStart = null, this._timer = null, this._options.forever && (this._cachedTimeouts = this._timeouts.slice(0));
  }
  t.exports = n, n.prototype.reset = function() {
    this._attempts = 1, this._timeouts = this._originalTimeouts.slice(0);
  }, n.prototype.stop = function() {
    this._timeout && clearTimeout(this._timeout), this._timer && clearTimeout(this._timer), this._timeouts = [], this._cachedTimeouts = null;
  }, n.prototype.retry = function(r) {
    if (this._timeout && clearTimeout(this._timeout), !r) return !1;
    var o = (/* @__PURE__ */ new Date()).getTime();
    if (r && o - this._operationStart >= this._maxRetryTime)
      return this._errors.push(r), this._errors.unshift(/* @__PURE__ */ new Error("RetryOperation timeout occurred")), !1;
    this._errors.push(r);
    var i = this._timeouts.shift();
    if (i === void 0) if (this._cachedTimeouts)
      this._errors.splice(0, this._errors.length - 1), i = this._cachedTimeouts.slice(-1);
    else return !1;
    var a = this;
    return this._timer = setTimeout(function() {
      a._attempts++, a._operationTimeoutCb && (a._timeout = setTimeout(function() {
        a._operationTimeoutCb(a._attempts);
      }, a._operationTimeout), a._options.unref && a._timeout.unref()), a._fn(a._attempts);
    }, i), this._options.unref && this._timer.unref(), !0;
  }, n.prototype.attempt = function(r, o) {
    this._fn = r, o && (o.timeout && (this._operationTimeout = o.timeout), o.cb && (this._operationTimeoutCb = o.cb));
    var i = this;
    this._operationTimeoutCb && (this._timeout = setTimeout(function() {
      i._operationTimeoutCb();
    }, i._operationTimeout)), this._operationStart = (/* @__PURE__ */ new Date()).getTime(), this._fn(this._attempts);
  }, n.prototype.try = function(r) {
    this.attempt(r);
  }, n.prototype.start = function(r) {
    this.attempt(r);
  }, n.prototype.start = n.prototype.try, n.prototype.errors = function() {
    return this._errors;
  }, n.prototype.attempts = function() {
    return this._attempts;
  }, n.prototype.mainError = function() {
    if (this._errors.length === 0) return null;
    for (var r = {}, o = null, i = 0, a = 0; a < this._errors.length; a++) {
      var u = this._errors[a], c = u.message, d = (r[c] || 0) + 1;
      r[c] = d, d >= i && (o = u, i = d);
    }
    return o;
  };
})), I_ = /* @__PURE__ */ Si(((e) => {
  var t = w_();
  e.operation = function(n) {
    return new t(e.timeouts(n), {
      forever: n && (n.forever || n.retries === 1 / 0),
      unref: n && n.unref,
      maxRetryTime: n && n.maxRetryTime
    });
  }, e.timeouts = function(n) {
    if (n instanceof Array) return [].concat(n);
    var r = {
      retries: 10,
      factor: 2,
      minTimeout: 1 * 1e3,
      maxTimeout: 1 / 0,
      randomize: !1
    };
    for (var o in n) r[o] = n[o];
    if (r.minTimeout > r.maxTimeout) throw new Error("minTimeout is greater than maxTimeout");
    for (var i = [], a = 0; a < r.retries; a++) i.push(this.createTimeout(a, r));
    return n && n.forever && !i.length && i.push(this.createTimeout(a, r)), i.sort(function(u, c) {
      return u - c;
    }), i;
  }, e.createTimeout = function(n, r) {
    var o = r.randomize ? Math.random() + 1 : 1, i = Math.round(o * Math.max(r.minTimeout, 1) * Math.pow(r.factor, n));
    return i = Math.min(i, r.maxTimeout), i;
  }, e.wrap = function(n, r, o) {
    if (r instanceof Array && (o = r, r = null), !o) {
      o = [];
      for (var i in n) typeof n[i] == "function" && o.push(i);
    }
    for (var a = 0; a < o.length; a++) {
      var u = o[a], c = n[u];
      n[u] = function(h) {
        var f = e.operation(r), p = Array.prototype.slice.call(arguments, 1), m = p.pop();
        p.push(function(y) {
          f.retry(y) || (y && (arguments[0] = f.mainError()), m.apply(this, arguments));
        }), f.attempt(function() {
          h.apply(n, p);
        });
      }.bind(n, c), n[u].options = r;
    }
  };
})), C_ = /* @__PURE__ */ Si(((e, t) => {
  t.exports = I_();
})), b_ = /* @__PURE__ */ Si(((e, t) => {
  var n = C_(), r = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], o = class extends Error {
    constructor(c) {
      super(), c instanceof Error ? (this.originalError = c, { message: c } = c) : (this.originalError = new Error(c), this.originalError.stack = this.stack), this.name = "AbortError", this.message = c;
    }
  }, i = (c, d, h) => {
    const f = h.retries - (d - 1);
    return c.attemptNumber = d, c.retriesLeft = f, c;
  }, a = (c) => r.includes(c), u = (c, d) => new Promise((h, f) => {
    d = {
      onFailedAttempt: () => {
      },
      retries: 10,
      ...d
    };
    const p = n.operation(d);
    p.attempt(async (m) => {
      try {
        h(await c(m));
      } catch (y) {
        if (!(y instanceof Error)) {
          f(/* @__PURE__ */ new TypeError(`Non-error was thrown: "${y}". You should only throw errors.`));
          return;
        }
        if (y instanceof o)
          p.stop(), f(y.originalError);
        else if (y instanceof TypeError && !a(y.message))
          p.stop(), f(y);
        else {
          i(y, m, d);
          try {
            await d.onFailedAttempt(y);
          } catch (_) {
            f(_);
            return;
          }
          p.retry(y) || f(p.mainError());
        }
      }
    });
  });
  t.exports = u, t.exports.default = u, t.exports.AbortError = o;
})), uu = /* @__PURE__ */ $g(b_(), 1), P_ = void 0, R_ = void 0;
function x_() {
  return {
    geminiUrl: P_,
    vertexUrl: R_
  };
}
function M_(e, t, n, r) {
  var o, i;
  if (!e?.baseUrl) {
    const a = x_();
    return t ? (o = a.vertexUrl) !== null && o !== void 0 ? o : n : (i = a.geminiUrl) !== null && i !== void 0 ? i : r;
  }
  return e.baseUrl;
}
var Ct = class {
};
function $(e, t) {
  return e.replace(/\{([^}]+)\}/g, (n, r) => {
    if (Object.prototype.hasOwnProperty.call(t, r)) {
      const o = t[r];
      return o != null ? String(o) : "";
    } else throw new Error(`Key '${r}' not found in valueMap.`);
  });
}
function l(e, t, n) {
  for (let i = 0; i < t.length - 1; i++) {
    const a = t[i];
    if (a.endsWith("[]")) {
      const u = a.slice(0, -2);
      if (!(u in e)) if (Array.isArray(n)) e[u] = Array.from({ length: n.length }, () => ({}));
      else throw new Error(`Value must be a list given an array path ${a}`);
      if (Array.isArray(e[u])) {
        const c = e[u];
        if (Array.isArray(n)) for (let d = 0; d < c.length; d++) {
          const h = c[d];
          l(h, t.slice(i + 1), n[d]);
        }
        else for (const d of c) l(d, t.slice(i + 1), n);
      }
      return;
    } else if (a.endsWith("[0]")) {
      const u = a.slice(0, -3);
      u in e || (e[u] = [{}]);
      const c = e[u];
      l(c[0], t.slice(i + 1), n);
      return;
    }
    (!e[a] || typeof e[a] != "object") && (e[a] = {}), e = e[a];
  }
  const r = t[t.length - 1], o = e[r];
  if (o !== void 0) {
    if (!n || typeof n == "object" && Object.keys(n).length === 0 || n === o) return;
    if (typeof o == "object" && typeof n == "object" && o !== null && n !== null) Object.assign(o, n);
    else throw new Error(`Cannot set value for an existing key. Key: ${r}`);
  } else r === "_self" && typeof n == "object" && n !== null && !Array.isArray(n) ? Object.assign(e, n) : e[r] = n;
}
function s(e, t, n = void 0) {
  try {
    if (t.length === 1 && t[0] === "_self") return e;
    for (let r = 0; r < t.length; r++) {
      if (typeof e != "object" || e === null) return n;
      const o = t[r];
      if (o.endsWith("[]")) {
        const i = o.slice(0, -2);
        if (i in e) {
          const a = e[i];
          return Array.isArray(a) ? a.map((u) => s(u, t.slice(r + 1), n)) : n;
        } else return n;
      } else e = e[o];
    }
    return e;
  } catch (r) {
    if (r instanceof TypeError) return n;
    throw r;
  }
}
function N_(e, t) {
  for (const [n, r] of Object.entries(t)) {
    const o = n.split("."), i = r.split("."), a = /* @__PURE__ */ new Set();
    let u = -1;
    for (let c = 0; c < o.length; c++) if (o[c] === "*") {
      u = c;
      break;
    }
    if (u !== -1 && i.length > u) for (let c = u; c < i.length; c++) {
      const d = i[c];
      d !== "*" && !d.endsWith("[]") && !d.endsWith("[0]") && a.add(d);
    }
    xs(e, o, i, 0, a);
  }
}
function xs(e, t, n, r, o) {
  if (r >= t.length || typeof e != "object" || e === null) return;
  const i = t[r];
  if (i.endsWith("[]")) {
    const a = i.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) xs(c, t, n, r + 1, o);
  } else if (i === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const a = e, u = Object.keys(a).filter((d) => !d.startsWith("_") && !o.has(d)), c = {};
      for (const d of u) c[d] = a[d];
      for (const [d, h] of Object.entries(c)) {
        const f = [];
        for (const p of n.slice(r)) p === "*" ? f.push(d) : f.push(p);
        l(a, f, h);
      }
      for (const d of u) delete a[d];
    }
  } else {
    const a = e;
    i in a && xs(a[i], t, n, r + 1, o);
  }
}
function ba(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function k_(e) {
  const t = {}, n = s(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const r = s(e, ["resourceName"]);
  return r != null && l(t, ["_url", "resourceName"], r), t;
}
function D_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], L_(a)), t;
}
function $_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], U_(a)), t;
}
function L_(e) {
  const t = {}, n = s(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => F_(a))), l(t, ["generatedVideos"], i);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = s(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function U_(e) {
  const t = {}, n = s(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => O_(a))), l(t, ["generatedVideos"], i);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = s(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function F_(e) {
  const t = {}, n = s(e, ["video"]);
  return n != null && l(t, ["video"], K_(n)), t;
}
function O_(e) {
  const t = {}, n = s(e, ["_self"]);
  return n != null && l(t, ["video"], J_(n)), t;
}
function q_(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function B_(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function G_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], H_(a)), t;
}
function H_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function rh(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], V_(a)), t;
}
function V_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function K_(e) {
  const t = {}, n = s(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const r = s(e, ["encodedVideo"]);
  r != null && l(t, ["videoBytes"], ba(r));
  const o = s(e, ["encoding"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function J_(e) {
  const t = {}, n = s(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const r = s(e, ["bytesBase64Encoded"]);
  r != null && l(t, ["videoBytes"], ba(r));
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
var cu;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(cu || (cu = {}));
var du;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(du || (du = {}));
var fu;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(fu || (fu = {}));
var Ft;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(Ft || (Ft = {}));
var hu;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(hu || (hu = {}));
var pu;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(pu || (pu = {}));
var mu;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(mu || (mu = {}));
var gu;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(gu || (gu = {}));
var yu;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(yu || (yu = {}));
var _u;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(_u || (_u = {}));
var vu;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(vu || (vu = {}));
var Mn;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(Mn || (Mn = {}));
var Nn;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Nn || (Nn = {}));
var Au;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(Au || (Au = {}));
var Tu;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Tu || (Tu = {}));
var Su;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Su || (Su = {}));
var Eu;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Eu || (Eu = {}));
var wu;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(wu || (wu = {}));
var Iu;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Iu || (Iu = {}));
var Cu;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Cu || (Cu = {}));
var bu;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(bu || (bu = {}));
var Pu;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Pu || (Pu = {}));
var Ru;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Ru || (Ru = {}));
var xu;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(xu || (xu = {}));
var ii;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(ii || (ii = {}));
var Mu;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Mu || (Mu = {}));
var Nu;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(Nu || (Nu = {}));
var ku;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(ku || (ku = {}));
var Du;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(Du || (Du = {}));
var Ms;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(Ms || (Ms = {}));
var $u;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})($u || ($u = {}));
var Lu;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(Lu || (Lu = {}));
var Uu;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(Uu || (Uu = {}));
var Fu;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Fu || (Fu = {}));
var Ou;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Ou || (Ou = {}));
var qu;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(qu || (qu = {}));
var Bu;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(Bu || (Bu = {}));
var Ns;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(Ns || (Ns = {}));
var Gu;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(Gu || (Gu = {}));
var Hu;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(Hu || (Hu = {}));
var si;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(si || (si = {}));
var Vu;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(Vu || (Vu = {}));
var Ku;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(Ku || (Ku = {}));
var Ju;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(Ju || (Ju = {}));
var Wu;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(Wu || (Wu = {}));
var zu;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(zu || (zu = {}));
var Yu;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(Yu || (Yu = {}));
var Xu;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(Xu || (Xu = {}));
var Qu;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(Qu || (Qu = {}));
var Zu;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(Zu || (Zu = {}));
var ju;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(ju || (ju = {}));
var ec;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(ec || (ec = {}));
var tc;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(tc || (tc = {}));
var nc;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(nc || (nc = {}));
var rc;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(rc || (rc = {}));
var oc;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(oc || (oc = {}));
var ic;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(ic || (ic = {}));
var sc;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(sc || (sc = {}));
var ac;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(ac || (ac = {}));
var lc;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(lc || (lc = {}));
var uc;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(uc || (uc = {}));
var cc;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(cc || (cc = {}));
var dc;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(dc || (dc = {}));
var fc;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(fc || (fc = {}));
var kn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(kn || (kn = {}));
var ks = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, gr = class {
  get text() {
    var e, t, n, r, o, i, a, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let c = "", d = !1;
    const h = [];
    for (const f of (u = (a = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [p, m] of Object.entries(f)) p !== "text" && p !== "thought" && p !== "thoughtSignature" && (m !== null || m !== void 0) && h.push(p);
      if (typeof f.text == "string") {
        if (typeof f.thought == "boolean" && f.thought) continue;
        d = !0, c += f.text;
      }
    }
    return h.length > 0 && console.warn(`there are non-text parts ${h} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, r, o, i, a, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const h of (u = (a = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [f, p] of Object.entries(h)) f !== "inlineData" && (p !== null || p !== void 0) && d.push(f);
      h.inlineData && typeof h.inlineData.data == "string" && (c += atob(h.inlineData.data));
    }
    return d.length > 0 && console.warn(`there are non-data parts ${d} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), c.length > 0 ? btoa(c) : void 0;
  }
  get functionCalls() {
    var e, t, n, r, o, i, a, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    const c = (u = (a = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((d) => d.functionCall).map((d) => d.functionCall).filter((d) => d !== void 0);
    if (c?.length !== 0)
      return c;
  }
  get executableCode() {
    var e, t, n, r, o, i, a, u, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    const d = (u = (a = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.executableCode).map((h) => h.executableCode).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, r, o, i, a, u, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (a = (i = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.codeExecutionResult).map((h) => h.codeExecutionResult).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, hc = class {
}, pc = class {
}, W_ = class {
}, z_ = class {
}, Y_ = class {
}, X_ = class {
}, mc = class {
}, gc = class {
}, yc = class {
}, Q_ = class {
}, _c = class oh {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new oh();
    let o;
    const i = t;
    return n ? o = $_(i) : o = D_(i), Object.assign(r, o), r;
  }
}, vc = class {
}, Ac = class {
}, Tc = class {
}, Sc = class {
}, Z_ = class {
}, j_ = class {
}, ev = class {
}, tv = class ih {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new ih(), o = G_(t);
    return Object.assign(r, o), r;
  }
}, nv = class {
}, rv = class {
}, ov = class {
}, iv = class {
}, Ec = class {
}, sv = class {
  get text() {
    var e, t, n;
    let r = "", o = !1;
    const i = [];
    for (const a of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [u, c] of Object.entries(a)) u !== "text" && u !== "thought" && c !== null && i.push(u);
      if (typeof a.text == "string") {
        if (typeof a.thought == "boolean" && a.thought) continue;
        o = !0, r += a.text;
      }
    }
    return i.length > 0 && console.warn(`there are non-text parts ${i} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), o ? r : void 0;
  }
  get data() {
    var e, t, n;
    let r = "";
    const o = [];
    for (const i of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [a, u] of Object.entries(i)) a !== "inlineData" && u !== null && o.push(a);
      i.inlineData && typeof i.inlineData.data == "string" && (r += atob(i.inlineData.data));
    }
    return o.length > 0 && console.warn(`there are non-data parts ${o} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), r.length > 0 ? btoa(r) : void 0;
  }
}, av = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, lv = class sh {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new sh(), o = rh(t);
    return Object.assign(r, o), r;
  }
};
function Y(e, t) {
  if (!t || typeof t != "string") throw new Error("model is required and must be a string");
  if (t.includes("..") || t.includes("?") || t.includes("&")) throw new Error("invalid model parameter");
  if (e.isVertexAI()) {
    if (t.startsWith("publishers/") || t.startsWith("projects/") || t.startsWith("models/")) return t;
    if (t.indexOf("/") >= 0) {
      const n = t.split("/", 2);
      return `publishers/${n[0]}/models/${n[1]}`;
    } else return `publishers/google/models/${t}`;
  } else return t.startsWith("models/") || t.startsWith("tunedModels/") ? t : `models/${t}`;
}
function ah(e, t) {
  const n = Y(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function lh(e) {
  return Array.isArray(e) ? e.map((t) => ai(t)) : [ai(e)];
}
function ai(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function uh(e) {
  const t = ai(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function ch(e) {
  const t = ai(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function wc(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function dh(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => wc(t)) : [wc(e)];
}
function Ds(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Ic(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Cc(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function Te(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return Ds(e) ? e : {
    role: "user",
    parts: dh(e)
  };
}
function Pa(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const r = Te(n);
    return r.parts && r.parts.length > 0 && r.parts[0].text !== void 0 ? [r.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = Te(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => Te(n)) : [Te(t)];
}
function $e(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Ic(e) || Cc(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [Te(e)];
  }
  const t = [], n = [], r = Ds(e[0]);
  for (const o of e) {
    const i = Ds(o);
    if (i != r) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(o);
    else {
      if (Ic(o) || Cc(o)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(o);
    }
  }
  return r || t.push({
    role: "user",
    parts: dh(n)
  }), t;
}
function uv(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((r) => r !== "null");
  if (n.length === 1) t.type = Object.values(Ft).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : Ft.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const r of n) t.anyOf.push({ type: Object.values(Ft).includes(r.toUpperCase()) ? r.toUpperCase() : Ft.TYPE_UNSPECIFIED });
  }
}
function On(e) {
  const t = {}, n = ["items"], r = ["anyOf"], o = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && uv(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(Ft).includes(u.toUpperCase()) ? u.toUpperCase() : Ft.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = On(u);
      else if (r.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(On(d));
        }
        t[a] = c;
      } else if (o.includes(a)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = On(h);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function Ra(e) {
  return On(e);
}
function xa(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function Ma(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function Kn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = On(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = On(t.response));
  return e;
}
function Jn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function cv(e, t, n, r = 1) {
  const o = !t.startsWith(`${n}/`) && t.split("/").length === r;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : o ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : o ? `${n}/${t}` : t;
}
function bt(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return cv(e, t, "cachedContents");
}
function fh(e) {
  switch (e) {
    case "STATE_UNSPECIFIED":
      return "JOB_STATE_UNSPECIFIED";
    case "CREATING":
      return "JOB_STATE_RUNNING";
    case "ACTIVE":
      return "JOB_STATE_SUCCEEDED";
    case "FAILED":
      return "JOB_STATE_FAILED";
    default:
      return e;
  }
}
function Gt(e) {
  return ba(e);
}
function dv(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function fv(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function hv(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function hh(e) {
  var t;
  let n;
  if (dv(e) && (n = e.name), !(hv(e) && (n = e.uri, n === void 0)) && !(fv(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const r = n.split("files/")[1].match(/[a-z0-9]+/);
      if (r === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = r[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function ph(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function mh(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (pv(e, t)) return e[t];
  return [];
}
function pv(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function mv(e, t = {}) {
  const n = e, r = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (r.responseJsonSchema = n.outputSchema), t.behavior && (r.behavior = t.behavior), { functionDeclarations: [r] };
}
function gv(e, t = {}) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const o of e) {
    const i = o.name;
    if (r.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    r.add(i);
    const a = mv(o, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function gh(e, t) {
  let n;
  if (typeof t == "string") if (e.isVertexAI()) if (t.startsWith("gs://")) n = {
    format: "jsonl",
    gcsUri: [t]
  };
  else if (t.startsWith("bq://")) n = {
    format: "bigquery",
    bigqueryUri: t
  };
  else throw new Error(`Unsupported string source for Vertex AI: ${t}`);
  else if (t.startsWith("files/")) n = { fileName: t };
  else throw new Error(`Unsupported string source for Gemini API: ${t}`);
  else if (Array.isArray(t)) {
    if (e.isVertexAI()) throw new Error("InlinedRequest[] is not supported in Vertex AI.");
    n = { inlinedRequests: t };
  } else n = t;
  const r = [n.gcsUri, n.bigqueryUri].filter(Boolean).length, o = [n.inlinedRequests, n.fileName].filter(Boolean).length;
  if (e.isVertexAI()) {
    if (o > 0 || r !== 1) throw new Error("Exactly one of `gcsUri` or `bigqueryUri` must be set for Vertex AI.");
  } else if (r > 0 || o !== 1) throw new Error("Exactly one of `inlinedRequests`, `fileName`, must be set for Gemini API.");
  return n;
}
function yv(e) {
  if (typeof e != "string") return e;
  const t = e;
  if (t.startsWith("gs://")) return {
    format: "jsonl",
    gcsUri: t
  };
  if (t.startsWith("bq://")) return {
    format: "bigquery",
    bigqueryUri: t
  };
  throw new Error(`Unsupported destination: ${t}`);
}
function yh(e) {
  if (typeof e != "object" || e === null) return {};
  const t = e, n = t.inlinedResponses;
  if (typeof n != "object" || n === null) return e;
  const r = n.inlinedResponses;
  if (!Array.isArray(r) || r.length === 0) return e;
  let o = !1;
  for (const i of r) {
    if (typeof i != "object" || i === null) continue;
    const a = i.response;
    if (!(typeof a != "object" || a === null) && a.embedding !== void 0) {
      o = !0;
      break;
    }
  }
  return o && (t.inlinedEmbedContentResponses = t.inlinedResponses, delete t.inlinedResponses), e;
}
function Wn(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function _h(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function _v(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function vv(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Av(e) {
  const t = {}, n = s(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const r = s(e, ["inlinedResponses", "inlinedResponses"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => eA(a))), l(t, ["inlinedResponses"], i);
  }
  const o = s(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function Tv(e) {
  const t = {}, n = s(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const r = s(e, ["gcsDestination", "outputUriPrefix"]);
  r != null && l(t, ["gcsUri"], r);
  const o = s(e, ["bigqueryDestination", "outputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function Sv(e) {
  const t = {}, n = s(e, ["format"]);
  n != null && l(t, ["predictionsFormat"], n);
  const r = s(e, ["gcsUri"]);
  r != null && l(t, ["gcsDestination", "outputUriPrefix"], r);
  const o = s(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigqueryDestination", "outputUri"], o), s(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedResponses"]) !== void 0) throw new Error("inlinedResponses parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedEmbedContentResponses"]) !== void 0) throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");
  return t;
}
function Jo(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata", "displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = s(e, ["metadata", "state"]);
  o != null && l(t, ["state"], _h(o));
  const i = s(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const a = s(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = s(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = s(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = s(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], Av(yh(d))), t;
}
function $s(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = s(e, ["state"]);
  o != null && l(t, ["state"], _h(o));
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["createTime"]);
  a != null && l(t, ["createTime"], a);
  const u = s(e, ["startTime"]);
  u != null && l(t, ["startTime"], u);
  const c = s(e, ["endTime"]);
  c != null && l(t, ["endTime"], c);
  const d = s(e, ["updateTime"]);
  d != null && l(t, ["updateTime"], d);
  const h = s(e, ["model"]);
  h != null && l(t, ["model"], h);
  const f = s(e, ["inputConfig"]);
  f != null && l(t, ["src"], Ev(f));
  const p = s(e, ["outputConfig"]);
  p != null && l(t, ["dest"], Tv(yh(p)));
  const m = s(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function Ev(e) {
  const t = {}, n = s(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const r = s(e, ["gcsSource", "uris"]);
  r != null && l(t, ["gcsUri"], r);
  const o = s(e, ["bigquerySource", "inputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function wv(e, t) {
  const n = {};
  if (s(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (s(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (s(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const r = s(t, ["fileName"]);
  r != null && l(n, ["fileName"], r);
  const o = s(t, ["inlinedRequests"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => jv(e, a))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function Iv(e) {
  const t = {}, n = s(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const r = s(e, ["gcsUri"]);
  r != null && l(t, ["gcsSource", "uris"], r);
  const o = s(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigquerySource", "inputUri"], o), s(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function Cv(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function bv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Wn(e, r)), n;
}
function Pv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Wn(e, r)), n;
}
function Rv(e) {
  const t = {}, n = s(e, ["content"]);
  n != null && l(t, ["content"], n);
  const r = s(e, ["citationMetadata"]);
  r != null && l(t, ["citationMetadata"], xv(r));
  const o = s(e, ["tokenCount"]);
  o != null && l(t, ["tokenCount"], o);
  const i = s(e, ["finishReason"]);
  i != null && l(t, ["finishReason"], i);
  const a = s(e, ["groundingMetadata"]);
  a != null && l(t, ["groundingMetadata"], a);
  const u = s(e, ["avgLogprobs"]);
  u != null && l(t, ["avgLogprobs"], u);
  const c = s(e, ["index"]);
  c != null && l(t, ["index"], c);
  const d = s(e, ["logprobsResult"]);
  d != null && l(t, ["logprobsResult"], d);
  const h = s(e, ["safetyRatings"]);
  if (h != null) {
    let p = h;
    Array.isArray(p) && (p = p.map((m) => m)), l(t, ["safetyRatings"], p);
  }
  const f = s(e, ["urlContextMetadata"]);
  return f != null && l(t, ["urlContextMetadata"], f), t;
}
function xv(e) {
  const t = {}, n = s(e, ["citationSources"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["citations"], r);
  }
  return t;
}
function vh(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => aA(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Mv(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  if (t !== void 0 && r != null && l(t, ["batch", "displayName"], r), s(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const o = s(e, ["webhookConfig"]);
  return t !== void 0 && o != null && l(t, ["batch", "webhookConfig"], o), n;
}
function Nv(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const o = s(e, ["dest"]);
  if (t !== void 0 && o != null && l(t, ["outputConfig"], Sv(yv(o))), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function bc(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], wv(e, gh(e, o)));
  const i = s(t, ["config"]);
  return i != null && Mv(i, n), n;
}
function kv(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], Y(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["inputConfig"], Iv(gh(e, o)));
  const i = s(t, ["config"]);
  return i != null && Nv(i, n), n;
}
function Dv(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["batch", "displayName"], r), n;
}
function $v(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], Gv(e, o));
  const i = s(t, ["config"]);
  return i != null && Dv(i, n), n;
}
function Lv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Wn(e, r)), n;
}
function Uv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Wn(e, r)), n;
}
function Fv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function Ov(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function qv(e, t) {
  const n = {}, r = s(t, ["contents"]);
  if (r != null) {
    let i = Pa(e, r);
    Array.isArray(i) && (i = i.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const o = s(t, ["config"]);
  return o != null && (l(n, ["_self"], Bv(o, n)), N_(n, { "requests[].*": "requests[].request.*" })), n;
}
function Bv(e, t) {
  const n = {}, r = s(e, ["taskType"]);
  t !== void 0 && r != null && l(t, ["requests[]", "taskType"], r);
  const o = s(e, ["title"]);
  t !== void 0 && o != null && l(t, ["requests[]", "title"], o);
  const i = s(e, ["outputDimensionality"]);
  if (t !== void 0 && i != null && l(t, ["requests[]", "outputDimensionality"], i), s(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (s(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (s(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (s(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return n;
}
function Gv(e, t) {
  const n = {}, r = s(t, ["fileName"]);
  r != null && l(n, ["file_name"], r);
  const o = s(t, ["inlinedRequests"]);
  return o != null && l(n, ["requests"], qv(e, o)), n;
}
function Hv(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Vv(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Kv(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = s(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Jv(e, t, n) {
  const r = {}, o = s(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], vh(Te(o)));
  const i = s(t, ["temperature"]);
  i != null && l(r, ["temperature"], i);
  const a = s(t, ["topP"]);
  a != null && l(r, ["topP"], a);
  const u = s(t, ["topK"]);
  u != null && l(r, ["topK"], u);
  const c = s(t, ["candidateCount"]);
  c != null && l(r, ["candidateCount"], c);
  const d = s(t, ["maxOutputTokens"]);
  d != null && l(r, ["maxOutputTokens"], d);
  const h = s(t, ["stopSequences"]);
  h != null && l(r, ["stopSequences"], h);
  const f = s(t, ["responseLogprobs"]);
  f != null && l(r, ["responseLogprobs"], f);
  const p = s(t, ["logprobs"]);
  p != null && l(r, ["logprobs"], p);
  const m = s(t, ["presencePenalty"]);
  m != null && l(r, ["presencePenalty"], m);
  const y = s(t, ["frequencyPenalty"]);
  y != null && l(r, ["frequencyPenalty"], y);
  const _ = s(t, ["seed"]);
  _ != null && l(r, ["seed"], _);
  const v = s(t, ["responseMimeType"]);
  v != null && l(r, ["responseMimeType"], v);
  const E = s(t, ["responseSchema"]);
  E != null && l(r, ["responseSchema"], Ra(E));
  const b = s(t, ["responseJsonSchema"]);
  if (b != null && l(r, ["responseJsonSchema"], b), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const R = s(t, ["safetySettings"]);
  if (n !== void 0 && R != null) {
    let j = R;
    Array.isArray(j) && (j = j.map((X) => lA(X))), l(n, ["safetySettings"], j);
  }
  const P = s(t, ["tools"]);
  if (n !== void 0 && P != null) {
    let j = Jn(P);
    Array.isArray(j) && (j = j.map((X) => cA(Kn(X)))), l(n, ["tools"], j);
  }
  const L = s(t, ["toolConfig"]);
  if (n !== void 0 && L != null && l(n, ["toolConfig"], uA(L)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const S = s(t, ["cachedContent"]);
  n !== void 0 && S != null && l(n, ["cachedContent"], bt(e, S));
  const O = s(t, ["responseModalities"]);
  O != null && l(r, ["responseModalities"], O);
  const x = s(t, ["mediaResolution"]);
  x != null && l(r, ["mediaResolution"], x);
  const D = s(t, ["speechConfig"]);
  if (D != null && l(r, ["speechConfig"], xa(D)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = s(t, ["thinkingConfig"]);
  H != null && l(r, ["thinkingConfig"], H);
  const z = s(t, ["imageConfig"]);
  z != null && l(r, ["imageConfig"], Zv(z));
  const ye = s(t, ["enableEnhancedCivicAnswers"]);
  if (ye != null && l(r, ["enableEnhancedCivicAnswers"], ye), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const Q = s(t, ["serviceTier"]);
  return n !== void 0 && Q != null && l(n, ["serviceTier"], Q), r;
}
function Wv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["candidates"]);
  if (r != null) {
    let d = r;
    Array.isArray(d) && (d = d.map((h) => Rv(h))), l(t, ["candidates"], d);
  }
  const o = s(e, ["modelVersion"]);
  o != null && l(t, ["modelVersion"], o);
  const i = s(e, ["promptFeedback"]);
  i != null && l(t, ["promptFeedback"], i);
  const a = s(e, ["responseId"]);
  a != null && l(t, ["responseId"], a);
  const u = s(e, ["usageMetadata"]);
  u != null && l(t, ["usageMetadata"], u);
  const c = s(e, ["modelStatus"]);
  return c != null && l(t, ["modelStatus"], c), t;
}
function zv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Wn(e, r)), n;
}
function Yv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Wn(e, r)), n;
}
function Xv(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], vv(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function Qv(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function Zv(e) {
  const t = {}, n = s(e, ["aspectRatio"]);
  n != null && l(t, ["aspectRatio"], n);
  const r = s(e, ["imageSize"]);
  if (r != null && l(t, ["imageSize"], r), s(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (s(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (s(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (s(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return t;
}
function jv(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["request", "model"], Y(e, r));
  const o = s(t, ["contents"]);
  if (o != null) {
    let u = $e(o);
    Array.isArray(u) && (u = u.map((c) => vh(c))), l(n, ["request", "contents"], u);
  }
  const i = s(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = s(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], Jv(e, a, s(n, ["request"], {}))), n;
}
function eA(e) {
  const t = {}, n = s(e, ["response"]);
  n != null && l(t, ["response"], Wv(n));
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function tA(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  if (t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), s(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function nA(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const i = s(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function rA(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && tA(n, t), t;
}
function oA(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && nA(n, t), t;
}
function iA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["operations"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Jo(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function sA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["batchPredictionJobs"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => $s(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function aA(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], Hv(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Vv(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Cv(c));
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = s(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const y = s(e, ["toolResponse"]);
  y != null && l(t, ["toolResponse"], y);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function lA(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function uA(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], Kv(r));
  const o = s(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function cA(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], Qv(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Xv(i));
  const a = s(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), s(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = s(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = s(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), s(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = s(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = s(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
var It;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(It || (It = {}));
var hn = class {
  constructor(e, t, n, r) {
    this.pageInternal = [], this.paramsInternal = {}, this.requestInternal = t, this.init(e, n, r);
  }
  init(e, t, n) {
    var r, o;
    this.nameInternal = e, this.pageInternal = t[this.nameInternal] || [], this.sdkHttpResponseInternal = t?.sdkHttpResponse, this.idxInternal = 0;
    let i = { config: {} };
    !n || Object.keys(n).length === 0 ? i = { config: {} } : typeof n == "object" ? i = Object.assign({}, n) : i = n, i.config && (i.config.pageToken = t.nextPageToken), this.paramsInternal = i, this.pageInternalSize = (o = (r = i.config) === null || r === void 0 ? void 0 : r.pageSize) !== null && o !== void 0 ? o : this.pageInternal.length;
  }
  initNextPage(e) {
    this.init(this.nameInternal, e, this.paramsInternal);
  }
  get page() {
    return this.pageInternal;
  }
  get name() {
    return this.nameInternal;
  }
  get pageSize() {
    return this.pageInternalSize;
  }
  get sdkHttpResponse() {
    return this.sdkHttpResponseInternal;
  }
  get params() {
    return this.paramsInternal;
  }
  get pageLength() {
    return this.pageInternal.length;
  }
  getItem(e) {
    return this.pageInternal[e];
  }
  [Symbol.asyncIterator]() {
    return {
      next: async () => {
        if (this.idxInternal >= this.pageLength) if (this.hasNextPage()) await this.nextPage();
        else return {
          value: void 0,
          done: !0
        };
        const e = this.getItem(this.idxInternal);
        return this.idxInternal += 1, {
          value: e,
          done: !1
        };
      },
      return: async () => ({
        value: void 0,
        done: !0
      })
    };
  }
  async nextPage() {
    if (!this.hasNextPage()) throw new Error("No more pages to fetch.");
    const e = await this.requestInternal(this.params);
    return this.initNextPage(e), this.page;
  }
  hasNextPage() {
    var e;
    return ((e = this.params.config) === null || e === void 0 ? void 0 : e.pageToken) !== void 0;
  }
}, dA = class extends Ct {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new hn(It.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = bc(this.apiClient, e), n = t._url, r = $("{model}:batchGenerateContent", n), o = t.batch.inputConfig.requests, i = o.requests, a = [];
    for (const u of i) {
      const c = Object.assign({}, u);
      if (c.systemInstruction) {
        const d = c.systemInstruction;
        delete c.systemInstruction;
        const h = c.request;
        h.systemInstruction = d, c.request = h;
      }
      a.push(c);
    }
    return o.requests = a, delete t.config, delete t._url, delete t._query, {
      path: r,
      body: t
    };
  }
  getGcsUri(e) {
    if (typeof e == "string") return e.startsWith("gs://") ? e : void 0;
    if (!Array.isArray(e) && e.gcsUri && e.gcsUri.length > 0) return e.gcsUri[0];
  }
  getBigqueryUri(e) {
    if (typeof e == "string") return e.startsWith("bq://") ? e : void 0;
    if (!Array.isArray(e)) return e.bigqueryUri;
  }
  formatDestination(e, t) {
    const n = t ? Object.assign({}, t) : {}, r = Date.now().toString();
    if (n.displayName || (n.displayName = `genaiBatchJob_${r}`), n.dest === void 0) {
      const o = this.getGcsUri(e), i = this.getBigqueryUri(e);
      if (o) o.endsWith(".jsonl") ? n.dest = `${o.slice(0, -6)}/dest` : n.dest = `${o}_dest_${r}`;
      else if (i) n.dest = `${i}_dest_${r}`;
      else throw new Error("Unsupported source for Vertex AI: No GCS or BigQuery URI found.");
    }
    return n;
  }
  async createInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = kv(this.apiClient, e);
      return a = $("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => $s(d));
    } else {
      const c = bc(this.apiClient, e);
      return a = $("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Jo(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = $v(this.apiClient, e);
      return o = $("{model}:asyncBatchEmbedContent", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => Jo(u));
    }
  }
  async get(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Yv(this.apiClient, e);
      return a = $("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => $s(d));
    } else {
      const c = zv(this.apiClient, e);
      return a = $("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Jo(d));
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let i = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = Pv(this.apiClient, e);
      i = $("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = bv(this.apiClient, e);
      i = $("batches/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = oA(e);
      return a = $("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = sA(d), f = new Ec();
        return Object.assign(f, h), f;
      });
    } else {
      const c = rA(e);
      return a = $("batches", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = iA(d), f = new Ec();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Uv(this.apiClient, e);
      return a = $("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Ov(d));
    } else {
      const c = Lv(this.apiClient, e);
      return a = $("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Fv(d));
    }
  }
};
function fA(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function hA(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Pc(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => LA(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Rc(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => UA(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function pA(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let h = $e(a);
    Array.isArray(h) && (h = h.map((f) => Pc(f))), l(t, ["contents"], h);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Pc(Te(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => qA(f))), l(t, ["tools"], h);
  }
  const d = s(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], FA(d)), s(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function mA(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = $e(a);
    Array.isArray(f) && (f = f.map((p) => Rc(p))), l(t, ["contents"], f);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Rc(Te(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => BA(p))), l(t, ["tools"], f);
  }
  const d = s(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], OA(d));
  const h = s(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function gA(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], ah(e, r));
  const o = s(t, ["config"]);
  return o != null && pA(o, n), n;
}
function yA(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], ah(e, r));
  const o = s(t, ["config"]);
  return o != null && mA(o, n), n;
}
function _A(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], bt(e, r)), n;
}
function vA(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], bt(e, r)), n;
}
function AA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function TA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function SA(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function EA(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function wA(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = s(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function IA(e) {
  const t = {}, n = s(e, ["description"]);
  n != null && l(t, ["description"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["parameters"]);
  o != null && l(t, ["parameters"], o);
  const i = s(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const a = s(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = s(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), s(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function CA(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], bt(e, r)), n;
}
function bA(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], bt(e, r)), n;
}
function PA(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], fA(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function RA(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function xA(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function MA(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function NA(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && xA(n, t), t;
}
function kA(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && MA(n, t), t;
}
function DA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["cachedContents"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["cachedContents"], i);
  }
  return t;
}
function $A(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["cachedContents"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["cachedContents"], i);
  }
  return t;
}
function LA(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], SA(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], EA(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], hA(c));
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = s(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const y = s(e, ["toolResponse"]);
  y != null && l(t, ["toolResponse"], y);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function UA(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], i);
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], a);
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), s(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (s(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (s(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function FA(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], wA(r));
  const o = s(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function OA(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  if (r != null && l(t, ["functionCallingConfig"], r), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function qA(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], RA(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], PA(i));
  const a = s(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), s(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = s(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = s(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), s(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = s(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = s(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function BA(e) {
  const t = {}, n = s(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const r = s(e, ["computerUse"]);
  if (r != null && l(t, ["computerUse"], r), s(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], o);
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const a = s(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = s(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = s(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => IA(m))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function GA(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function HA(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function VA(e, t) {
  const n = {}, r = s(t, ["name"]);
  r != null && l(n, ["_url", "name"], bt(e, r));
  const o = s(t, ["config"]);
  return o != null && GA(o, n), n;
}
function KA(e, t) {
  const n = {}, r = s(t, ["name"]);
  r != null && l(n, ["_url", "name"], bt(e, r));
  const o = s(t, ["config"]);
  return o != null && HA(o, n), n;
}
var JA = class extends Ct {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new hn(It.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = yA(this.apiClient, e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = gA(this.apiClient, e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async get(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = bA(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = CA(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = vA(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = TA(d), f = new Tc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = _A(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = AA(d), f = new Tc();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = KA(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = VA(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = kA(e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = $A(d), f = new Sc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = NA(e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = DA(d), f = new Sc();
        return Object.assign(f, h), f;
      });
    }
  }
};
function Ot(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, r = Object.getOwnPropertySymbols(e); o < r.length; o++) t.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[o]) && (n[r[o]] = e[r[o]]);
  return n;
}
function xc(e) {
  var t = typeof Symbol == "function" && Symbol.iterator, n = t && e[t], r = 0;
  if (n) return n.call(e);
  if (e && typeof e.length == "number") return { next: function() {
    return e && r >= e.length && (e = void 0), {
      value: e && e[r++],
      done: !e
    };
  } };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function J(e) {
  return this instanceof J ? (this.v = e, this) : new J(e);
}
function ct(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var r = n.apply(e, t || []), o, i = [];
  return o = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), u("next"), u("throw"), u("return", a), o[Symbol.asyncIterator] = function() {
    return this;
  }, o;
  function a(m) {
    return function(y) {
      return Promise.resolve(y).then(m, f);
    };
  }
  function u(m, y) {
    r[m] && (o[m] = function(_) {
      return new Promise(function(v, E) {
        i.push([
          m,
          _,
          v,
          E
        ]) > 1 || c(m, _);
      });
    }, y && (o[m] = y(o[m])));
  }
  function c(m, y) {
    try {
      d(r[m](y));
    } catch (_) {
      p(i[0][3], _);
    }
  }
  function d(m) {
    m.value instanceof J ? Promise.resolve(m.value.v).then(h, f) : p(i[0][2], m);
  }
  function h(m) {
    c("next", m);
  }
  function f(m) {
    c("throw", m);
  }
  function p(m, y) {
    m(y), i.shift(), i.length && c(i[0][0], i[0][1]);
  }
}
function dt(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof xc == "function" ? xc(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function r(i) {
    n[i] = e[i] && function(a) {
      return new Promise(function(u, c) {
        a = e[i](a), o(u, c, a.done, a.value);
      });
    };
  }
  function o(i, a, u, c) {
    Promise.resolve(c).then(function(d) {
      i({
        value: d,
        done: u
      });
    }, a);
  }
}
function WA(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : Ah(n);
}
function Ah(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function zA(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Mc(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let r = 0;
  for (; r < n; ) if (e[r].role === "user")
    t.push(e[r]), r++;
  else {
    const o = [];
    let i = !0;
    for (; r < n && e[r].role === "model"; )
      o.push(e[r]), i && !Ah(e[r]) && (i = !1), r++;
    i ? t.push(...o) : t.pop();
  }
  return t;
}
var YA = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new XA(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, XA = class {
  constructor(e, t, n, r = {}, o = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = r, this.history = o, this.sendPromise = Promise.resolve(), zA(o);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = Te(e.message), r = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var o, i, a;
      const u = await r, c = (i = (o = u.candidates) === null || o === void 0 ? void 0 : o[0]) === null || i === void 0 ? void 0 : i.content, d = u.automaticFunctionCallingHistory, h = this.getHistory(!0).length;
      let f = [];
      d != null && (f = (a = d.slice(h)) !== null && a !== void 0 ? a : []);
      const p = c ? [c] : [];
      this.recordHistory(n, p, f);
    })(), await this.sendPromise.catch(() => {
      this.sendPromise = Promise.resolve();
    }), r;
  }
  async sendMessageStream(e) {
    var t;
    await this.sendPromise;
    const n = Te(e.message), r = this.modelsModule.generateContentStream({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    this.sendPromise = r.then(() => {
    }).catch(() => {
    });
    const o = await r;
    return this.processStreamResponse(o, n);
  }
  getHistory(e = !1) {
    const t = e ? Mc(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return ct(this, arguments, function* () {
      var r, o, i, a, u, c;
      const d = [];
      try {
        for (var h = !0, f = dt(e), p; p = yield J(f.next()), r = p.done, !r; h = !0) {
          a = p.value, h = !1;
          const m = a;
          if (WA(m)) {
            const y = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            y !== void 0 && d.push(y);
          }
          yield yield J(m);
        }
      } catch (m) {
        o = { error: m };
      } finally {
        try {
          !h && !r && (i = f.return) && (yield J(i.call(f)));
        } finally {
          if (o) throw o.error;
        }
      }
      this.recordHistory(t, d);
    });
  }
  recordHistory(e, t, n) {
    let r = [];
    t.length > 0 && t.every((o) => o.role !== void 0) ? r = t : r.push({
      role: "model",
      parts: []
    }), n && n.length > 0 ? this.history.push(...Mc(n)) : this.history.push(e), this.history.push(...r);
  }
}, Th = class Sh extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Sh.prototype);
  }
};
function QA(e) {
  const t = {}, n = s(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function ZA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function jA(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], hh(n)), t;
}
function eT(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function tT(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], hh(n)), t;
}
function nT(e) {
  const t = {}, n = s(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function rT(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function oT(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && rT(n, t), t;
}
function iT(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["files"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["files"], i);
  }
  return t;
}
function sT(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["files"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(t, ["files"], o);
  }
  return t;
}
var aT = class extends Ct {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new hn(It.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async upload(e) {
    if (this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support uploading files. You can share files through a GCS bucket.");
    return this.apiClient.uploadFile(e.file, e.config).then((t) => t);
  }
  async download(e) {
    await this.apiClient.downloadFile(e);
  }
  async registerFiles(e) {
    throw new Error("registerFiles is only supported in Node.js environments.");
  }
  async _registerFiles(e) {
    return this.registerFilesInternal(e);
  }
  async listInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = oT(e);
      return o = $("files", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = iT(u), d = new nv();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = QA(e);
      return o = $("upload/v1beta/files", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = ZA(u), d = new rv();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = tT(e);
      return o = $("files/{file}", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = jA(e);
      return o = $("files/{file}", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = eT(u), d = new ov();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = nT(e);
      return o = $("files:register", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = sT(u), d = new iv();
        return Object.assign(d, c), d;
      });
    }
  }
};
function Nc(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function lT(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Wo(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function uT(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => CT(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function cT(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => bT(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function dT(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function fT(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function hT(e) {
  const t = {}, n = s(e, ["description"]);
  n != null && l(t, ["description"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["parameters"]);
  o != null && l(t, ["parameters"], o);
  const i = s(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const a = s(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = s(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), s(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function pT(e) {
  const t = {}, n = s(e, ["modelSelectionConfig"]);
  n != null && l(t, ["modelConfig"], n);
  const r = s(e, ["responseJsonSchema"]);
  r != null && l(t, ["responseJsonSchema"], r);
  const o = s(e, ["audioTimestamp"]);
  o != null && l(t, ["audioTimestamp"], o);
  const i = s(e, ["candidateCount"]);
  i != null && l(t, ["candidateCount"], i);
  const a = s(e, ["enableAffectiveDialog"]);
  a != null && l(t, ["enableAffectiveDialog"], a);
  const u = s(e, ["frequencyPenalty"]);
  u != null && l(t, ["frequencyPenalty"], u);
  const c = s(e, ["logprobs"]);
  c != null && l(t, ["logprobs"], c);
  const d = s(e, ["maxOutputTokens"]);
  d != null && l(t, ["maxOutputTokens"], d);
  const h = s(e, ["mediaResolution"]);
  h != null && l(t, ["mediaResolution"], h);
  const f = s(e, ["presencePenalty"]);
  f != null && l(t, ["presencePenalty"], f);
  const p = s(e, ["responseLogprobs"]);
  p != null && l(t, ["responseLogprobs"], p);
  const m = s(e, ["responseMimeType"]);
  m != null && l(t, ["responseMimeType"], m);
  const y = s(e, ["responseModalities"]);
  y != null && l(t, ["responseModalities"], y);
  const _ = s(e, ["responseSchema"]);
  _ != null && l(t, ["responseSchema"], _);
  const v = s(e, ["routingConfig"]);
  v != null && l(t, ["routingConfig"], v);
  const E = s(e, ["seed"]);
  E != null && l(t, ["seed"], E);
  const b = s(e, ["speechConfig"]);
  b != null && l(t, ["speechConfig"], b);
  const R = s(e, ["stopSequences"]);
  R != null && l(t, ["stopSequences"], R);
  const P = s(e, ["temperature"]);
  P != null && l(t, ["temperature"], P);
  const L = s(e, ["thinkingConfig"]);
  L != null && l(t, ["thinkingConfig"], L);
  const S = s(e, ["topK"]);
  S != null && l(t, ["topK"], S);
  const O = s(e, ["topP"]);
  if (O != null && l(t, ["topP"], O), s(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function mT(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], lT(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function gT(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function yT(e, t) {
  const n = {}, r = s(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], r);
  const o = s(e, ["responseModalities"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], o);
  const i = s(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
  const a = s(e, ["topP"]);
  t !== void 0 && a != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], a);
  const u = s(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = s(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = s(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = s(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = s(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Ma(f));
  const p = s(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = s(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const y = s(e, ["systemInstruction"]);
  t !== void 0 && y != null && l(t, ["setup", "systemInstruction"], uT(Te(y)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = Jn(_);
    Array.isArray(x) && (x = x.map((D) => xT(Kn(D)))), l(t, ["setup", "tools"], x);
  }
  const v = s(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], RT(v));
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], Nc(E));
  const b = s(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], Nc(b));
  const R = s(e, ["realtimeInputConfig"]);
  t !== void 0 && R != null && l(t, ["setup", "realtimeInputConfig"], R);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const L = s(e, ["proactivity"]);
  if (t !== void 0 && L != null && l(t, ["setup", "proactivity"], L), s(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = s(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const O = s(e, ["safetySettings"]);
  if (t !== void 0 && O != null) {
    let x = O;
    Array.isArray(x) && (x = x.map((D) => PT(D))), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function _T(e, t) {
  const n = {}, r = s(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], pT(r));
  const o = s(e, ["responseModalities"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], o);
  const i = s(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
  const a = s(e, ["topP"]);
  t !== void 0 && a != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], a);
  const u = s(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = s(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = s(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = s(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = s(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Ma(f));
  const p = s(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = s(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const y = s(e, ["systemInstruction"]);
  t !== void 0 && y != null && l(t, ["setup", "systemInstruction"], cT(Te(y)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let D = Jn(_);
    Array.isArray(D) && (D = D.map((H) => MT(Kn(H)))), l(t, ["setup", "tools"], D);
  }
  const v = s(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], v);
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], E);
  const b = s(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], b);
  const R = s(e, ["realtimeInputConfig"]);
  t !== void 0 && R != null && l(t, ["setup", "realtimeInputConfig"], R);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const L = s(e, ["proactivity"]);
  t !== void 0 && L != null && l(t, ["setup", "proactivity"], L);
  const S = s(e, ["explicitVadSignal"]);
  t !== void 0 && S != null && l(t, ["setup", "explicitVadSignal"], S);
  const O = s(e, ["avatarConfig"]);
  t !== void 0 && O != null && l(t, ["setup", "avatarConfig"], O);
  const x = s(e, ["safetySettings"]);
  if (t !== void 0 && x != null) {
    let D = x;
    Array.isArray(D) && (D = D.map((H) => H)), l(t, ["setup", "safetySettings"], D);
  }
  return n;
}
function vT(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], yT(o, n)), n;
}
function AT(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], _T(o, n)), n;
}
function TT(e) {
  const t = {}, n = s(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function ST(e) {
  const t = {}, n = s(e, ["weightedPrompts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["weightedPrompts"], r);
  }
  return t;
}
function ET(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = lh(n);
    Array.isArray(d) && (d = d.map((h) => Wo(h))), l(t, ["mediaChunks"], d);
  }
  const r = s(e, ["audio"]);
  r != null && l(t, ["audio"], Wo(ch(r)));
  const o = s(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], Wo(uh(i)));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function wT(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = lh(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const r = s(e, ["audio"]);
  r != null && l(t, ["audio"], ch(r));
  const o = s(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], uh(i));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function IT(e) {
  const t = {}, n = s(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const r = s(e, ["serverContent"]);
  r != null && l(t, ["serverContent"], r);
  const o = s(e, ["toolCall"]);
  o != null && l(t, ["toolCall"], o);
  const i = s(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const a = s(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], NT(a));
  const u = s(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = s(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = s(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = s(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], kT(h)), t;
}
function CT(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], dT(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], fT(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Wo(c));
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = s(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const y = s(e, ["toolResponse"]);
  y != null && l(t, ["toolResponse"], y);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function bT(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], i);
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], a);
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), s(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (s(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (s(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function PT(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function RT(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function xT(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], gT(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], mT(i));
  const a = s(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), s(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = s(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = s(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), s(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = s(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = s(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function MT(e) {
  const t = {}, n = s(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const r = s(e, ["computerUse"]);
  if (r != null && l(t, ["computerUse"], r), s(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], o);
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const a = s(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = s(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = s(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => hT(m))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function NT(e) {
  const t = {}, n = s(e, ["promptTokenCount"]);
  n != null && l(t, ["promptTokenCount"], n);
  const r = s(e, ["cachedContentTokenCount"]);
  r != null && l(t, ["cachedContentTokenCount"], r);
  const o = s(e, ["candidatesTokenCount"]);
  o != null && l(t, ["responseTokenCount"], o);
  const i = s(e, ["toolUsePromptTokenCount"]);
  i != null && l(t, ["toolUsePromptTokenCount"], i);
  const a = s(e, ["thoughtsTokenCount"]);
  a != null && l(t, ["thoughtsTokenCount"], a);
  const u = s(e, ["totalTokenCount"]);
  u != null && l(t, ["totalTokenCount"], u);
  const c = s(e, ["promptTokensDetails"]);
  if (c != null) {
    let m = c;
    Array.isArray(m) && (m = m.map((y) => y)), l(t, ["promptTokensDetails"], m);
  }
  const d = s(e, ["cacheTokensDetails"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((y) => y)), l(t, ["cacheTokensDetails"], m);
  }
  const h = s(e, ["candidatesTokensDetails"]);
  if (h != null) {
    let m = h;
    Array.isArray(m) && (m = m.map((y) => y)), l(t, ["responseTokensDetails"], m);
  }
  const f = s(e, ["toolUsePromptTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((y) => y)), l(t, ["toolUsePromptTokensDetails"], m);
  }
  const p = s(e, ["trafficType"]);
  return p != null && l(t, ["trafficType"], p), t;
}
function kT(e) {
  const t = {}, n = s(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function DT(e, t) {
  const n = {}, r = s(e, ["apiKey"]);
  if (r != null && l(n, ["apiKey"], r), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function $T(e, t) {
  const n = {}, r = s(e, ["data"]);
  if (r != null && l(n, ["data"], r), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function LT(e, t) {
  const n = {}, r = s(e, ["content"]);
  r != null && l(n, ["content"], r);
  const o = s(e, ["citationMetadata"]);
  o != null && l(n, ["citationMetadata"], UT(o));
  const i = s(e, ["tokenCount"]);
  i != null && l(n, ["tokenCount"], i);
  const a = s(e, ["finishReason"]);
  a != null && l(n, ["finishReason"], a);
  const u = s(e, ["groundingMetadata"]);
  u != null && l(n, ["groundingMetadata"], u);
  const c = s(e, ["avgLogprobs"]);
  c != null && l(n, ["avgLogprobs"], c);
  const d = s(e, ["index"]);
  d != null && l(n, ["index"], d);
  const h = s(e, ["logprobsResult"]);
  h != null && l(n, ["logprobsResult"], h);
  const f = s(e, ["safetyRatings"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((y) => y)), l(n, ["safetyRatings"], m);
  }
  const p = s(e, ["urlContextMetadata"]);
  return p != null && l(n, ["urlContextMetadata"], p), n;
}
function UT(e, t) {
  const n = {}, r = s(e, ["citationSources"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(n, ["citations"], o);
  }
  return n;
}
function FT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let a = $e(i);
    Array.isArray(a) && (a = a.map((u) => zn(u))), l(r, ["contents"], a);
  }
  return r;
}
function OT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["tokensInfo"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function qT(e, t) {
  const n = {}, r = s(e, ["values"]);
  r != null && l(n, ["values"], r);
  const o = s(e, ["statistics"]);
  return o != null && l(n, ["statistics"], BT(o)), n;
}
function BT(e, t) {
  const n = {}, r = s(e, ["truncated"]);
  r != null && l(n, ["truncated"], r);
  const o = s(e, ["token_count"]);
  return o != null && l(n, ["tokenCount"], o), n;
}
function io(e, t) {
  const n = {}, r = s(e, ["parts"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => XS(a))), l(n, ["parts"], i);
  }
  const o = s(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function zn(e, t) {
  const n = {}, r = s(e, ["parts"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => QS(a))), l(n, ["parts"], i);
  }
  const o = s(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function GT(e, t) {
  const n = {}, r = s(e, ["controlType"]);
  r != null && l(n, ["controlType"], r);
  const o = s(e, ["enableControlImageComputation"]);
  return o != null && l(n, ["computeControl"], o), n;
}
function HT(e, t) {
  const n = {};
  if (s(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (s(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (s(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function VT(e, t, n) {
  const r = {}, o = s(e, ["systemInstruction"]);
  t !== void 0 && o != null && l(t, ["systemInstruction"], zn(Te(o)));
  const i = s(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => Ch(c))), l(t, ["tools"], u);
  }
  const a = s(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], $S(a)), r;
}
function KT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = $e(i);
    Array.isArray(u) && (u = u.map((c) => io(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && HT(a), r;
}
function JT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = $e(i);
    Array.isArray(u) && (u = u.map((c) => zn(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && VT(a, r), r;
}
function WT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["totalTokens"]);
  o != null && l(n, ["totalTokens"], o);
  const i = s(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function zT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["totalTokens"]);
  return o != null && l(n, ["totalTokens"], o), n;
}
function YT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function XT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function QT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function ZT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function jT(e, t, n) {
  const r = {}, o = s(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
  const i = s(e, ["negativePrompt"]);
  t !== void 0 && i != null && l(t, ["parameters", "negativePrompt"], i);
  const a = s(e, ["numberOfImages"]);
  t !== void 0 && a != null && l(t, ["parameters", "sampleCount"], a);
  const u = s(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = s(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = s(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const h = s(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && l(t, ["parameters", "safetySetting"], h);
  const f = s(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = s(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = s(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const y = s(e, ["language"]);
  t !== void 0 && y != null && l(t, ["parameters", "language"], y);
  const _ = s(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const v = s(e, ["outputCompressionQuality"]);
  t !== void 0 && v != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], v);
  const E = s(e, ["addWatermark"]);
  t !== void 0 && E != null && l(t, ["parameters", "addWatermark"], E);
  const b = s(e, ["labels"]);
  t !== void 0 && b != null && l(t, ["labels"], b);
  const R = s(e, ["editMode"]);
  t !== void 0 && R != null && l(t, ["parameters", "editMode"], R);
  const P = s(e, ["baseSteps"]);
  return t !== void 0 && P != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], P), r;
}
function eS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => rE(d))), l(r, ["instances[0]", "referenceImages"], c);
  }
  const u = s(t, ["config"]);
  return u != null && jT(u, r), r;
}
function tS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Ri(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function nS(e, t, n) {
  const r = {}, o = s(e, ["taskType"]);
  t !== void 0 && o != null && l(t, ["requests[]", "taskType"], o);
  const i = s(e, ["title"]);
  t !== void 0 && i != null && l(t, ["requests[]", "title"], i);
  const a = s(e, ["outputDimensionality"]);
  if (t !== void 0 && a != null && l(t, ["requests[]", "outputDimensionality"], a), s(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (s(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (s(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (s(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return r;
}
function rS(e, t, n) {
  const r = {};
  let o = s(n, ["embeddingApiType"]);
  if (o === void 0 && (o = "PREDICT"), o === "PREDICT") {
    const f = s(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "task_type"], f);
  } else if (o === "EMBED_CONTENT") {
    const f = s(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "taskType"], f);
  }
  let i = s(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const f = s(e, ["title"]);
    t !== void 0 && f != null && l(t, ["instances[]", "title"], f);
  } else if (i === "EMBED_CONTENT") {
    const f = s(e, ["title"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "title"], f);
  }
  let a = s(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "PREDICT") {
    const f = s(e, ["outputDimensionality"]);
    t !== void 0 && f != null && l(t, ["parameters", "outputDimensionality"], f);
  } else if (a === "EMBED_CONTENT") {
    const f = s(e, ["outputDimensionality"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "outputDimensionality"], f);
  }
  let u = s(n, ["embeddingApiType"]);
  if (u === void 0 && (u = "PREDICT"), u === "PREDICT") {
    const f = s(e, ["mimeType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "mimeType"], f);
  }
  let c = s(n, ["embeddingApiType"]);
  if (c === void 0 && (c = "PREDICT"), c === "PREDICT") {
    const f = s(e, ["autoTruncate"]);
    t !== void 0 && f != null && l(t, ["parameters", "autoTruncate"], f);
  } else if (c === "EMBED_CONTENT") {
    const f = s(e, ["autoTruncate"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "autoTruncate"], f);
  }
  let d = s(n, ["embeddingApiType"]);
  if (d === void 0 && (d = "PREDICT"), d === "EMBED_CONTENT") {
    const f = s(e, ["documentOcr"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "documentOcr"], f);
  }
  let h = s(n, ["embeddingApiType"]);
  if (h === void 0 && (h = "PREDICT"), h === "EMBED_CONTENT") {
    const f = s(e, ["audioTrackExtraction"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "audioTrackExtraction"], f);
  }
  return r;
}
function oS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let d = Pa(e, i);
    Array.isArray(d) && (d = d.map((h) => h)), l(r, ["requests[]", "content"], d);
  }
  const a = s(t, ["content"]);
  a != null && io(Te(a));
  const u = s(t, ["config"]);
  u != null && nS(u, r);
  const c = s(t, ["model"]);
  return c !== void 0 && l(r, ["requests[]", "model"], Y(e, c)), r;
}
function iS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  let i = s(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = s(t, ["contents"]);
    if (c != null) {
      let d = Pa(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(r, ["instances[]", "content"], d);
    }
  }
  let a = s(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = s(t, ["content"]);
    c != null && l(r, ["content"], zn(Te(c)));
  }
  const u = s(t, ["config"]);
  return u != null && rS(u, r, n), r;
}
function sS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["embeddings"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => u)), l(n, ["embeddings"], a);
  }
  const i = s(e, ["metadata"]);
  return i != null && l(n, ["metadata"], i), n;
}
function aS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions[]", "embeddings"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => qT(u))), l(n, ["embeddings"], a);
  }
  const i = s(e, ["metadata"]);
  if (i != null && l(n, ["metadata"], i), t && s(t, ["embeddingApiType"]) === "EMBED_CONTENT") {
    const a = s(e, ["embedding"]), u = s(e, ["usageMetadata"]), c = s(e, ["truncated"]);
    if (a) {
      const d = {};
      u && u.promptTokenCount && (d.tokenCount = u.promptTokenCount), c && (d.truncated = c), a.statistics = d, l(n, ["embeddings"], [a]);
    }
  }
  return n;
}
function lS(e, t) {
  const n = {}, r = s(e, ["endpoint"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["deployedModelId"]);
  return o != null && l(n, ["deployedModelId"], o), n;
}
function uS(e, t) {
  const n = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["fileUri"]);
  r != null && l(n, ["fileUri"], r);
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function cS(e, t) {
  const n = {}, r = s(e, ["id"]);
  r != null && l(n, ["id"], r);
  const o = s(e, ["args"]);
  o != null && l(n, ["args"], o);
  const i = s(e, ["name"]);
  if (i != null && l(n, ["name"], i), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function dS(e, t) {
  const n = {}, r = s(e, ["allowedFunctionNames"]);
  r != null && l(n, ["allowedFunctionNames"], r);
  const o = s(e, ["mode"]);
  if (o != null && l(n, ["mode"], o), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function fS(e, t) {
  const n = {}, r = s(e, ["description"]);
  r != null && l(n, ["description"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = s(e, ["parameters"]);
  i != null && l(n, ["parameters"], i);
  const a = s(e, ["parametersJsonSchema"]);
  a != null && l(n, ["parametersJsonSchema"], a);
  const u = s(e, ["response"]);
  u != null && l(n, ["response"], u);
  const c = s(e, ["responseJsonSchema"]);
  if (c != null && l(n, ["responseJsonSchema"], c), s(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return n;
}
function hS(e, t, n, r) {
  const o = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], io(Te(i)));
  const a = s(t, ["temperature"]);
  a != null && l(o, ["temperature"], a);
  const u = s(t, ["topP"]);
  u != null && l(o, ["topP"], u);
  const c = s(t, ["topK"]);
  c != null && l(o, ["topK"], c);
  const d = s(t, ["candidateCount"]);
  d != null && l(o, ["candidateCount"], d);
  const h = s(t, ["maxOutputTokens"]);
  h != null && l(o, ["maxOutputTokens"], h);
  const f = s(t, ["stopSequences"]);
  f != null && l(o, ["stopSequences"], f);
  const p = s(t, ["responseLogprobs"]);
  p != null && l(o, ["responseLogprobs"], p);
  const m = s(t, ["logprobs"]);
  m != null && l(o, ["logprobs"], m);
  const y = s(t, ["presencePenalty"]);
  y != null && l(o, ["presencePenalty"], y);
  const _ = s(t, ["frequencyPenalty"]);
  _ != null && l(o, ["frequencyPenalty"], _);
  const v = s(t, ["seed"]);
  v != null && l(o, ["seed"], v);
  const E = s(t, ["responseMimeType"]);
  E != null && l(o, ["responseMimeType"], E);
  const b = s(t, ["responseSchema"]);
  b != null && l(o, ["responseSchema"], Ra(b));
  const R = s(t, ["responseJsonSchema"]);
  if (R != null && l(o, ["responseJsonSchema"], R), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = s(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let X = P;
    Array.isArray(X) && (X = X.map((Se) => oE(Se))), l(n, ["safetySettings"], X);
  }
  const L = s(t, ["tools"]);
  if (n !== void 0 && L != null) {
    let X = Jn(L);
    Array.isArray(X) && (X = X.map((Se) => fE(Kn(Se)))), l(n, ["tools"], X);
  }
  const S = s(t, ["toolConfig"]);
  if (n !== void 0 && S != null && l(n, ["toolConfig"], cE(S)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const O = s(t, ["cachedContent"]);
  n !== void 0 && O != null && l(n, ["cachedContent"], bt(e, O));
  const x = s(t, ["responseModalities"]);
  x != null && l(o, ["responseModalities"], x);
  const D = s(t, ["mediaResolution"]);
  D != null && l(o, ["mediaResolution"], D);
  const H = s(t, ["speechConfig"]);
  if (H != null && l(o, ["speechConfig"], xa(H)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const z = s(t, ["thinkingConfig"]);
  z != null && l(o, ["thinkingConfig"], z);
  const ye = s(t, ["imageConfig"]);
  ye != null && l(o, ["imageConfig"], qS(ye));
  const Q = s(t, ["enableEnhancedCivicAnswers"]);
  if (Q != null && l(o, ["enableEnhancedCivicAnswers"], Q), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const j = s(t, ["serviceTier"]);
  return n !== void 0 && j != null && l(n, ["serviceTier"], j), o;
}
function pS(e, t, n, r) {
  const o = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], zn(Te(i)));
  const a = s(t, ["temperature"]);
  a != null && l(o, ["temperature"], a);
  const u = s(t, ["topP"]);
  u != null && l(o, ["topP"], u);
  const c = s(t, ["topK"]);
  c != null && l(o, ["topK"], c);
  const d = s(t, ["candidateCount"]);
  d != null && l(o, ["candidateCount"], d);
  const h = s(t, ["maxOutputTokens"]);
  h != null && l(o, ["maxOutputTokens"], h);
  const f = s(t, ["stopSequences"]);
  f != null && l(o, ["stopSequences"], f);
  const p = s(t, ["responseLogprobs"]);
  p != null && l(o, ["responseLogprobs"], p);
  const m = s(t, ["logprobs"]);
  m != null && l(o, ["logprobs"], m);
  const y = s(t, ["presencePenalty"]);
  y != null && l(o, ["presencePenalty"], y);
  const _ = s(t, ["frequencyPenalty"]);
  _ != null && l(o, ["frequencyPenalty"], _);
  const v = s(t, ["seed"]);
  v != null && l(o, ["seed"], v);
  const E = s(t, ["responseMimeType"]);
  E != null && l(o, ["responseMimeType"], E);
  const b = s(t, ["responseSchema"]);
  b != null && l(o, ["responseSchema"], Ra(b));
  const R = s(t, ["responseJsonSchema"]);
  R != null && l(o, ["responseJsonSchema"], R);
  const P = s(t, ["routingConfig"]);
  P != null && l(o, ["routingConfig"], P);
  const L = s(t, ["modelSelectionConfig"]);
  L != null && l(o, ["modelConfig"], L);
  const S = s(t, ["safetySettings"]);
  if (n !== void 0 && S != null) {
    let ie = S;
    Array.isArray(ie) && (ie = ie.map((pn) => pn)), l(n, ["safetySettings"], ie);
  }
  const O = s(t, ["tools"]);
  if (n !== void 0 && O != null) {
    let ie = Jn(O);
    Array.isArray(ie) && (ie = ie.map((pn) => Ch(Kn(pn)))), l(n, ["tools"], ie);
  }
  const x = s(t, ["toolConfig"]);
  n !== void 0 && x != null && l(n, ["toolConfig"], dE(x));
  const D = s(t, ["labels"]);
  n !== void 0 && D != null && l(n, ["labels"], D);
  const H = s(t, ["cachedContent"]);
  n !== void 0 && H != null && l(n, ["cachedContent"], bt(e, H));
  const z = s(t, ["responseModalities"]);
  z != null && l(o, ["responseModalities"], z);
  const ye = s(t, ["mediaResolution"]);
  ye != null && l(o, ["mediaResolution"], ye);
  const Q = s(t, ["speechConfig"]);
  Q != null && l(o, ["speechConfig"], xa(Q));
  const j = s(t, ["audioTimestamp"]);
  j != null && l(o, ["audioTimestamp"], j);
  const X = s(t, ["thinkingConfig"]);
  X != null && l(o, ["thinkingConfig"], X);
  const Se = s(t, ["imageConfig"]);
  if (Se != null && l(o, ["imageConfig"], BS(Se)), s(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Ye = s(t, ["modelArmorConfig"]);
  n !== void 0 && Ye != null && l(n, ["modelArmorConfig"], Ye);
  const _e = s(t, ["serviceTier"]);
  return n !== void 0 && _e != null && l(n, ["serviceTier"], _e), o;
}
function kc(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = $e(i);
    Array.isArray(u) && (u = u.map((c) => io(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(r, ["generationConfig"], hS(e, a, r)), r;
}
function Dc(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = $e(i);
    Array.isArray(u) && (u = u.map((c) => zn(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(r, ["generationConfig"], pS(e, a, r)), r;
}
function $c(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["candidates"]);
  if (o != null) {
    let h = o;
    Array.isArray(h) && (h = h.map((f) => LT(f))), l(n, ["candidates"], h);
  }
  const i = s(e, ["modelVersion"]);
  i != null && l(n, ["modelVersion"], i);
  const a = s(e, ["promptFeedback"]);
  a != null && l(n, ["promptFeedback"], a);
  const u = s(e, ["responseId"]);
  u != null && l(n, ["responseId"], u);
  const c = s(e, ["usageMetadata"]);
  c != null && l(n, ["usageMetadata"], c);
  const d = s(e, ["modelStatus"]);
  return d != null && l(n, ["modelStatus"], d), n;
}
function Lc(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["candidates"]);
  if (o != null) {
    let h = o;
    Array.isArray(h) && (h = h.map((f) => f)), l(n, ["candidates"], h);
  }
  const i = s(e, ["createTime"]);
  i != null && l(n, ["createTime"], i);
  const a = s(e, ["modelVersion"]);
  a != null && l(n, ["modelVersion"], a);
  const u = s(e, ["promptFeedback"]);
  u != null && l(n, ["promptFeedback"], u);
  const c = s(e, ["responseId"]);
  c != null && l(n, ["responseId"], c);
  const d = s(e, ["usageMetadata"]);
  return d != null && l(n, ["usageMetadata"], d), n;
}
function mS(e, t, n) {
  const r = {};
  if (s(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (s(e, ["negativePrompt"]) !== void 0) throw new Error("negativePrompt parameter is not supported in Gemini API.");
  const o = s(e, ["numberOfImages"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
  const i = s(e, ["aspectRatio"]);
  t !== void 0 && i != null && l(t, ["parameters", "aspectRatio"], i);
  const a = s(e, ["guidanceScale"]);
  if (t !== void 0 && a != null && l(t, ["parameters", "guidanceScale"], a), s(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const u = s(e, ["safetyFilterLevel"]);
  t !== void 0 && u != null && l(t, ["parameters", "safetySetting"], u);
  const c = s(e, ["personGeneration"]);
  t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c);
  const d = s(e, ["includeSafetyAttributes"]);
  t !== void 0 && d != null && l(t, ["parameters", "includeSafetyAttributes"], d);
  const h = s(e, ["includeRaiReason"]);
  t !== void 0 && h != null && l(t, ["parameters", "includeRaiReason"], h);
  const f = s(e, ["language"]);
  t !== void 0 && f != null && l(t, ["parameters", "language"], f);
  const p = s(e, ["outputMimeType"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], p);
  const m = s(e, ["outputCompressionQuality"]);
  if (t !== void 0 && m != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], m), s(e, ["addWatermark"]) !== void 0) throw new Error("addWatermark parameter is not supported in Gemini API.");
  if (s(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const y = s(e, ["imageSize"]);
  if (t !== void 0 && y != null && l(t, ["parameters", "sampleImageSize"], y), s(e, ["enhancePrompt"]) !== void 0) throw new Error("enhancePrompt parameter is not supported in Gemini API.");
  return r;
}
function gS(e, t, n) {
  const r = {}, o = s(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
  const i = s(e, ["negativePrompt"]);
  t !== void 0 && i != null && l(t, ["parameters", "negativePrompt"], i);
  const a = s(e, ["numberOfImages"]);
  t !== void 0 && a != null && l(t, ["parameters", "sampleCount"], a);
  const u = s(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = s(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = s(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const h = s(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && l(t, ["parameters", "safetySetting"], h);
  const f = s(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = s(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = s(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const y = s(e, ["language"]);
  t !== void 0 && y != null && l(t, ["parameters", "language"], y);
  const _ = s(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const v = s(e, ["outputCompressionQuality"]);
  t !== void 0 && v != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], v);
  const E = s(e, ["addWatermark"]);
  t !== void 0 && E != null && l(t, ["parameters", "addWatermark"], E);
  const b = s(e, ["labels"]);
  t !== void 0 && b != null && l(t, ["labels"], b);
  const R = s(e, ["imageSize"]);
  t !== void 0 && R != null && l(t, ["parameters", "sampleImageSize"], R);
  const P = s(e, ["enhancePrompt"]);
  return t !== void 0 && P != null && l(t, ["parameters", "enhancePrompt"], P), r;
}
function yS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && mS(a, r), r;
}
function _S(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && gS(a, r), r;
}
function vS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => MS(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], wh(i)), n;
}
function AS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => Ri(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Ih(i)), n;
}
function TS(e, t, n) {
  const r = {}, o = s(e, ["numberOfVideos"]);
  if (t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o), s(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (s(e, ["fps"]) !== void 0) throw new Error("fps parameter is not supported in Gemini API.");
  const i = s(e, ["durationSeconds"]);
  if (t !== void 0 && i != null && l(t, ["parameters", "durationSeconds"], i), s(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const a = s(e, ["aspectRatio"]);
  t !== void 0 && a != null && l(t, ["parameters", "aspectRatio"], a);
  const u = s(e, ["resolution"]);
  t !== void 0 && u != null && l(t, ["parameters", "resolution"], u);
  const c = s(e, ["personGeneration"]);
  if (t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c), s(e, ["pubsubTopic"]) !== void 0) throw new Error("pubsubTopic parameter is not supported in Gemini API.");
  const d = s(e, ["negativePrompt"]);
  t !== void 0 && d != null && l(t, ["parameters", "negativePrompt"], d);
  const h = s(e, ["enhancePrompt"]);
  if (t !== void 0 && h != null && l(t, ["parameters", "enhancePrompt"], h), s(e, ["generateAudio"]) !== void 0) throw new Error("generateAudio parameter is not supported in Gemini API.");
  const f = s(e, ["lastFrame"]);
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], xi(f));
  const p = s(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let y = p;
    Array.isArray(y) && (y = y.map((_) => IE(_))), l(t, ["instances[0]", "referenceImages"], y);
  }
  if (s(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (s(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = s(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), r;
}
function SS(e, t, n) {
  const r = {}, o = s(e, ["numberOfVideos"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
  const i = s(e, ["outputGcsUri"]);
  t !== void 0 && i != null && l(t, ["parameters", "storageUri"], i);
  const a = s(e, ["fps"]);
  t !== void 0 && a != null && l(t, ["parameters", "fps"], a);
  const u = s(e, ["durationSeconds"]);
  t !== void 0 && u != null && l(t, ["parameters", "durationSeconds"], u);
  const c = s(e, ["seed"]);
  t !== void 0 && c != null && l(t, ["parameters", "seed"], c);
  const d = s(e, ["aspectRatio"]);
  t !== void 0 && d != null && l(t, ["parameters", "aspectRatio"], d);
  const h = s(e, ["resolution"]);
  t !== void 0 && h != null && l(t, ["parameters", "resolution"], h);
  const f = s(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = s(e, ["pubsubTopic"]);
  t !== void 0 && p != null && l(t, ["parameters", "pubsubTopic"], p);
  const m = s(e, ["negativePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "negativePrompt"], m);
  const y = s(e, ["enhancePrompt"]);
  t !== void 0 && y != null && l(t, ["parameters", "enhancePrompt"], y);
  const _ = s(e, ["generateAudio"]);
  t !== void 0 && _ != null && l(t, ["parameters", "generateAudio"], _);
  const v = s(e, ["lastFrame"]);
  t !== void 0 && v != null && l(t, ["instances[0]", "lastFrame"], ft(v));
  const E = s(e, ["referenceImages"]);
  if (t !== void 0 && E != null) {
    let L = E;
    Array.isArray(L) && (L = L.map((S) => CE(S))), l(t, ["instances[0]", "referenceImages"], L);
  }
  const b = s(e, ["mask"]);
  t !== void 0 && b != null && l(t, ["instances[0]", "mask"], wE(b));
  const R = s(e, ["compressionQuality"]);
  t !== void 0 && R != null && l(t, ["parameters", "compressionQuality"], R);
  const P = s(e, ["labels"]);
  if (t !== void 0 && P != null && l(t, ["labels"], P), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return r;
}
function ES(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], bS(u)), n;
}
function wS(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response"]);
  return u != null && l(n, ["response"], PS(u)), n;
}
function IS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], xi(a));
  const u = s(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], bh(u));
  const c = s(t, ["source"]);
  c != null && RS(c, r);
  const d = s(t, ["config"]);
  return d != null && TS(d, r), r;
}
function CS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], ft(a));
  const u = s(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], Ph(u));
  const c = s(t, ["source"]);
  c != null && xS(c, r);
  const d = s(t, ["config"]);
  return d != null && SS(d, r), r;
}
function bS(e, t) {
  const n = {}, r = s(e, ["generatedSamples"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => kS(u))), l(n, ["generatedVideos"], a);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function PS(e, t) {
  const n = {}, r = s(e, ["videos"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => DS(u))), l(n, ["generatedVideos"], a);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function RS(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], xi(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], bh(a)), r;
}
function xS(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], ft(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Ph(a)), r;
}
function MS(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["image"], GS(r));
  const o = s(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const i = s(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], wh(i)), n;
}
function Ri(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["image"], Eh(r));
  const o = s(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const i = s(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], Ih(i));
  const a = s(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function NS(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["mask"], Eh(r));
  const o = s(e, ["labels"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["labels"], i);
  }
  return n;
}
function kS(e, t) {
  const n = {}, r = s(e, ["video"]);
  return r != null && l(n, ["video"], SE(r)), n;
}
function DS(e, t) {
  const n = {}, r = s(e, ["_self"]);
  return r != null && l(n, ["video"], EE(r)), n;
}
function $S(e, t) {
  const n = {}, r = s(e, ["modelSelectionConfig"]);
  r != null && l(n, ["modelConfig"], r);
  const o = s(e, ["responseJsonSchema"]);
  o != null && l(n, ["responseJsonSchema"], o);
  const i = s(e, ["audioTimestamp"]);
  i != null && l(n, ["audioTimestamp"], i);
  const a = s(e, ["candidateCount"]);
  a != null && l(n, ["candidateCount"], a);
  const u = s(e, ["enableAffectiveDialog"]);
  u != null && l(n, ["enableAffectiveDialog"], u);
  const c = s(e, ["frequencyPenalty"]);
  c != null && l(n, ["frequencyPenalty"], c);
  const d = s(e, ["logprobs"]);
  d != null && l(n, ["logprobs"], d);
  const h = s(e, ["maxOutputTokens"]);
  h != null && l(n, ["maxOutputTokens"], h);
  const f = s(e, ["mediaResolution"]);
  f != null && l(n, ["mediaResolution"], f);
  const p = s(e, ["presencePenalty"]);
  p != null && l(n, ["presencePenalty"], p);
  const m = s(e, ["responseLogprobs"]);
  m != null && l(n, ["responseLogprobs"], m);
  const y = s(e, ["responseMimeType"]);
  y != null && l(n, ["responseMimeType"], y);
  const _ = s(e, ["responseModalities"]);
  _ != null && l(n, ["responseModalities"], _);
  const v = s(e, ["responseSchema"]);
  v != null && l(n, ["responseSchema"], v);
  const E = s(e, ["routingConfig"]);
  E != null && l(n, ["routingConfig"], E);
  const b = s(e, ["seed"]);
  b != null && l(n, ["seed"], b);
  const R = s(e, ["speechConfig"]);
  R != null && l(n, ["speechConfig"], R);
  const P = s(e, ["stopSequences"]);
  P != null && l(n, ["stopSequences"], P);
  const L = s(e, ["temperature"]);
  L != null && l(n, ["temperature"], L);
  const S = s(e, ["thinkingConfig"]);
  S != null && l(n, ["thinkingConfig"], S);
  const O = s(e, ["topK"]);
  O != null && l(n, ["topK"], O);
  const x = s(e, ["topP"]);
  if (x != null && l(n, ["topP"], x), s(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function LS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function US(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function FS(e, t) {
  const n = {}, r = s(e, ["authConfig"]);
  r != null && l(n, ["authConfig"], DT(r));
  const o = s(e, ["enableWidget"]);
  return o != null && l(n, ["enableWidget"], o), n;
}
function OS(e, t) {
  const n = {}, r = s(e, ["searchTypes"]);
  if (r != null && l(n, ["searchTypes"], r), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(n, ["timeRangeFilter"], o), n;
}
function qS(e, t) {
  const n = {}, r = s(e, ["aspectRatio"]);
  r != null && l(n, ["aspectRatio"], r);
  const o = s(e, ["imageSize"]);
  if (o != null && l(n, ["imageSize"], o), s(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (s(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (s(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (s(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return n;
}
function BS(e, t) {
  const n = {}, r = s(e, ["aspectRatio"]);
  r != null && l(n, ["aspectRatio"], r);
  const o = s(e, ["imageSize"]);
  o != null && l(n, ["imageSize"], o);
  const i = s(e, ["personGeneration"]);
  i != null && l(n, ["personGeneration"], i);
  const a = s(e, ["prominentPeople"]);
  a != null && l(n, ["prominentPeople"], a);
  const u = s(e, ["outputMimeType"]);
  u != null && l(n, ["imageOutputOptions", "mimeType"], u);
  const c = s(e, ["outputCompressionQuality"]);
  c != null && l(n, ["imageOutputOptions", "compressionQuality"], c);
  const d = s(e, ["imageOutputOptions"]);
  return d != null && l(n, ["imageOutputOptions"], d), n;
}
function GS(e, t) {
  const n = {}, r = s(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], Gt(r));
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function Eh(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], Gt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function xi(e, t) {
  const n = {};
  if (s(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const r = s(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], Gt(r));
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function ft(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Gt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function HS(e, t, n, r) {
  const o = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], ph(e, c)), o;
}
function VS(e, t, n, r) {
  const o = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], ph(e, c)), o;
}
function KS(e, t, n) {
  const r = {}, o = s(t, ["config"]);
  return o != null && HS(e, o, r), r;
}
function JS(e, t, n) {
  const r = {}, o = s(t, ["config"]);
  return o != null && VS(e, o, r), r;
}
function WS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = mh(i);
    Array.isArray(a) && (a = a.map((u) => Ls(u))), l(n, ["models"], a);
  }
  return n;
}
function zS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = mh(i);
    Array.isArray(a) && (a = a.map((u) => Us(u))), l(n, ["models"], a);
  }
  return n;
}
function YS(e, t) {
  const n = {}, r = s(e, ["maskMode"]);
  r != null && l(n, ["maskMode"], r);
  const o = s(e, ["segmentationClasses"]);
  o != null && l(n, ["maskClasses"], o);
  const i = s(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function Ls(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const i = s(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = s(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = s(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], hE(u));
  const c = s(e, ["inputTokenLimit"]);
  c != null && l(n, ["inputTokenLimit"], c);
  const d = s(e, ["outputTokenLimit"]);
  d != null && l(n, ["outputTokenLimit"], d);
  const h = s(e, ["supportedGenerationMethods"]);
  h != null && l(n, ["supportedActions"], h);
  const f = s(e, ["temperature"]);
  f != null && l(n, ["temperature"], f);
  const p = s(e, ["maxTemperature"]);
  p != null && l(n, ["maxTemperature"], p);
  const m = s(e, ["topP"]);
  m != null && l(n, ["topP"], m);
  const y = s(e, ["topK"]);
  y != null && l(n, ["topK"], y);
  const _ = s(e, ["thinking"]);
  return _ != null && l(n, ["thinking"], _), n;
}
function Us(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const i = s(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = s(e, ["versionId"]);
  a != null && l(n, ["version"], a);
  const u = s(e, ["deployedModels"]);
  if (u != null) {
    let p = u;
    Array.isArray(p) && (p = p.map((m) => lS(m))), l(n, ["endpoints"], p);
  }
  const c = s(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = s(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], pE(d));
  const h = s(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = s(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function XS(e, t) {
  const n = {}, r = s(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const i = s(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = s(e, ["fileData"]);
  a != null && l(n, ["fileData"], uS(a));
  const u = s(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], cS(u));
  const c = s(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = s(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], $T(d));
  const h = s(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = s(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = s(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = s(e, ["videoMetadata"]);
  m != null && l(n, ["videoMetadata"], m);
  const y = s(e, ["toolCall"]);
  y != null && l(n, ["toolCall"], y);
  const _ = s(e, ["toolResponse"]);
  _ != null && l(n, ["toolResponse"], _);
  const v = s(e, ["partMetadata"]);
  return v != null && l(n, ["partMetadata"], v), n;
}
function QS(e, t) {
  const n = {}, r = s(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const i = s(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = s(e, ["fileData"]);
  a != null && l(n, ["fileData"], a);
  const u = s(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], u);
  const c = s(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = s(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], d);
  const h = s(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = s(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = s(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = s(e, ["videoMetadata"]);
  if (m != null && l(n, ["videoMetadata"], m), s(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (s(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (s(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return n;
}
function ZS(e, t) {
  const n = {}, r = s(e, ["productImage"]);
  return r != null && l(n, ["image"], ft(r)), n;
}
function jS(e, t, n) {
  const r = {}, o = s(e, ["numberOfImages"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
  const i = s(e, ["baseSteps"]);
  t !== void 0 && i != null && l(t, ["parameters", "baseSteps"], i);
  const a = s(e, ["outputGcsUri"]);
  t !== void 0 && a != null && l(t, ["parameters", "storageUri"], a);
  const u = s(e, ["seed"]);
  t !== void 0 && u != null && l(t, ["parameters", "seed"], u);
  const c = s(e, ["safetyFilterLevel"]);
  t !== void 0 && c != null && l(t, ["parameters", "safetySetting"], c);
  const d = s(e, ["personGeneration"]);
  t !== void 0 && d != null && l(t, ["parameters", "personGeneration"], d);
  const h = s(e, ["addWatermark"]);
  t !== void 0 && h != null && l(t, ["parameters", "addWatermark"], h);
  const f = s(e, ["outputMimeType"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], f);
  const p = s(e, ["outputCompressionQuality"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], p);
  const m = s(e, ["enhancePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "enhancePrompt"], m);
  const y = s(e, ["labels"]);
  return t !== void 0 && y != null && l(t, ["labels"], y), r;
}
function eE(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["source"]);
  i != null && nE(i, r);
  const a = s(t, ["config"]);
  return a != null && jS(a, r), r;
}
function tE(e, t) {
  const n = {}, r = s(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => Ri(i))), l(n, ["generatedImages"], o);
  }
  return n;
}
function nE(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], ft(i));
  const a = s(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => ZS(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return r;
}
function rE(e, t) {
  const n = {}, r = s(e, ["referenceImage"]);
  r != null && l(n, ["referenceImage"], ft(r));
  const o = s(e, ["referenceId"]);
  o != null && l(n, ["referenceId"], o);
  const i = s(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const a = s(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], YS(a));
  const u = s(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], GT(u));
  const c = s(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = s(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function wh(e, t) {
  const n = {}, r = s(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = s(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function Ih(e, t) {
  const n = {}, r = s(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = s(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function oE(e, t) {
  const n = {}, r = s(e, ["category"]);
  if (r != null && l(n, ["category"], r), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(n, ["threshold"], o), n;
}
function iE(e, t) {
  const n = {}, r = s(e, ["image"]);
  return r != null && l(n, ["image"], ft(r)), n;
}
function sE(e, t, n) {
  const r = {}, o = s(e, ["mode"]);
  t !== void 0 && o != null && l(t, ["parameters", "mode"], o);
  const i = s(e, ["maxPredictions"]);
  t !== void 0 && i != null && l(t, ["parameters", "maxPredictions"], i);
  const a = s(e, ["confidenceThreshold"]);
  t !== void 0 && a != null && l(t, ["parameters", "confidenceThreshold"], a);
  const u = s(e, ["maskDilation"]);
  t !== void 0 && u != null && l(t, ["parameters", "maskDilation"], u);
  const c = s(e, ["binaryColorThreshold"]);
  t !== void 0 && c != null && l(t, ["parameters", "binaryColorThreshold"], c);
  const d = s(e, ["labels"]);
  return t !== void 0 && d != null && l(t, ["labels"], d), r;
}
function aE(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["source"]);
  i != null && uE(i, r);
  const a = s(t, ["config"]);
  return a != null && sE(a, r), r;
}
function lE(e, t) {
  const n = {}, r = s(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => NS(i))), l(n, ["generatedMasks"], o);
  }
  return n;
}
function uE(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], ft(i));
  const a = s(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], iE(a)), r;
}
function cE(e, t) {
  const n = {}, r = s(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = s(e, ["functionCallingConfig"]);
  o != null && l(n, ["functionCallingConfig"], dS(o));
  const i = s(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function dE(e, t) {
  const n = {}, r = s(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = s(e, ["functionCallingConfig"]);
  if (o != null && l(n, ["functionCallingConfig"], o), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function fE(e, t) {
  const n = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const r = s(e, ["computerUse"]);
  r != null && l(n, ["computerUse"], r);
  const o = s(e, ["fileSearch"]);
  o != null && l(n, ["fileSearch"], o);
  const i = s(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], OS(i));
  const a = s(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], FS(a));
  const u = s(e, ["codeExecution"]);
  if (u != null && l(n, ["codeExecution"], u), s(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = s(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  if (d != null && l(n, ["googleSearchRetrieval"], d), s(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const h = s(e, ["urlContext"]);
  h != null && l(n, ["urlContext"], h);
  const f = s(e, ["mcpServers"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["mcpServers"], p);
  }
  return n;
}
function Ch(e, t) {
  const n = {}, r = s(e, ["retrieval"]);
  r != null && l(n, ["retrieval"], r);
  const o = s(e, ["computerUse"]);
  if (o != null && l(n, ["computerUse"], o), s(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const i = s(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], i);
  const a = s(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], a);
  const u = s(e, ["codeExecution"]);
  u != null && l(n, ["codeExecution"], u);
  const c = s(e, ["enterpriseWebSearch"]);
  c != null && l(n, ["enterpriseWebSearch"], c);
  const d = s(e, ["functionDeclarations"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((y) => fS(y))), l(n, ["functionDeclarations"], m);
  }
  const h = s(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = s(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = s(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function hE(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function pE(e, t) {
  const n = {}, r = s(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function mE(e, t, n) {
  const r = {}, o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function gE(e, t, n) {
  const r = {}, o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function yE(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "name"], Y(e, o));
  const i = s(t, ["config"]);
  return i != null && mE(i, r), r;
}
function _E(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["config"]);
  return i != null && gE(i, r), r;
}
function vE(e, t, n) {
  const r = {}, o = s(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
  const i = s(e, ["safetyFilterLevel"]);
  t !== void 0 && i != null && l(t, ["parameters", "safetySetting"], i);
  const a = s(e, ["personGeneration"]);
  t !== void 0 && a != null && l(t, ["parameters", "personGeneration"], a);
  const u = s(e, ["includeRaiReason"]);
  t !== void 0 && u != null && l(t, ["parameters", "includeRaiReason"], u);
  const c = s(e, ["outputMimeType"]);
  t !== void 0 && c != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], c);
  const d = s(e, ["outputCompressionQuality"]);
  t !== void 0 && d != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], d);
  const h = s(e, ["enhanceInputImage"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "upscaleConfig",
    "enhanceInputImage"
  ], h);
  const f = s(e, ["imagePreservationFactor"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "upscaleConfig",
    "imagePreservationFactor"
  ], f);
  const p = s(e, ["labels"]);
  t !== void 0 && p != null && l(t, ["labels"], p);
  const m = s(e, ["numberOfImages"]);
  t !== void 0 && m != null && l(t, ["parameters", "sampleCount"], m);
  const y = s(e, ["mode"]);
  return t !== void 0 && y != null && l(t, ["parameters", "mode"], y), r;
}
function AE(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["image"]);
  i != null && l(r, ["instances[0]", "image"], ft(i));
  const a = s(t, ["upscaleFactor"]);
  a != null && l(r, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = s(t, ["config"]);
  return u != null && vE(u, r), r;
}
function TE(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Ri(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function SE(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["encodedVideo"]);
  o != null && l(n, ["videoBytes"], Gt(o));
  const i = s(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function EE(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["videoBytes"], Gt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function wE(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["_self"], ft(r));
  const o = s(e, ["maskMode"]);
  return o != null && l(n, ["maskMode"], o), n;
}
function IE(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["image"], xi(r));
  const o = s(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function CE(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["image"], ft(r));
  const o = s(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function bh(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["videoBytes"]);
  o != null && l(n, ["encodedVideo"], Gt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function Ph(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["videoBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Gt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function bE(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["displayName"], r), n;
}
function PE(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && bE(n, t), t;
}
function RE(e, t) {
  const n = {}, r = s(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function xE(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = s(e, ["config"]);
  return r != null && RE(r, t), t;
}
function ME(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function NE(e, t) {
  const n = {}, r = s(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["customMetadata"], i);
  }
  const o = s(e, ["chunkingConfig"]);
  return t !== void 0 && o != null && l(t, ["chunkingConfig"], o), n;
}
function kE(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], $E(a)), t;
}
function DE(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = s(e, ["fileName"]);
  r != null && l(t, ["fileName"], r);
  const o = s(e, ["config"]);
  return o != null && NE(o, t), t;
}
function $E(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function LE(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function UE(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && LE(n, t), t;
}
function FE(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["fileSearchStores"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["fileSearchStores"], i);
  }
  return t;
}
function Rh(e, t) {
  const n = {}, r = s(e, ["mimeType"]);
  t !== void 0 && r != null && l(t, ["mimeType"], r);
  const o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = s(e, ["customMetadata"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => c)), l(t, ["customMetadata"], u);
  }
  const a = s(e, ["chunkingConfig"]);
  return t !== void 0 && a != null && l(t, ["chunkingConfig"], a), n;
}
function OE(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = s(e, ["config"]);
  return r != null && Rh(r, t), t;
}
function qE(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var BE = "Content-Type", GE = "X-Server-Timeout", HE = "User-Agent", Fs = "x-goog-api-client", VE = "google-genai-sdk/1.50.1", KE = "v1beta1", JE = "v1beta", WE = /* @__PURE__ */ new Set(["us", "eu"]), zE = 5, YE = [
  408,
  429,
  500,
  502,
  503,
  504
], XE = class {
  constructor(e) {
    var t, n, r;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const o = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (o.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? o.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && WE.has(this.clientOptions.location) ? o.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (o.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), o.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : KE;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), o.apiVersion = (r = this.clientOptions.apiVersion) !== null && r !== void 0 ? r : JE, o.baseUrl = "https://generativelanguage.googleapis.com/";
    o.headers = this.getDefaultHeaders(), this.clientOptions.httpOptions = o, e.httpOptions && (this.clientOptions.httpOptions = this.patchHttpOptions(o, e.httpOptions));
  }
  isVertexAI() {
    var e;
    return (e = this.clientOptions.vertexai) !== null && e !== void 0 ? e : !1;
  }
  getProject() {
    return this.clientOptions.project;
  }
  getLocation() {
    return this.clientOptions.location;
  }
  getCustomBaseUrl() {
    return this.customBaseUrl;
  }
  async getAuthHeaders() {
    const e = new Headers();
    return await this.clientOptions.auth.addAuthHeaders(e), e;
  }
  getApiVersion() {
    if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.apiVersion !== void 0) return this.clientOptions.httpOptions.apiVersion;
    throw new Error("API version is not set.");
  }
  getBaseUrl() {
    if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.baseUrl !== void 0) return this.clientOptions.httpOptions.baseUrl;
    throw new Error("Base URL is not set.");
  }
  getRequestUrl() {
    return this.getRequestUrlInternal(this.clientOptions.httpOptions);
  }
  getHeaders() {
    if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.headers !== void 0) return this.clientOptions.httpOptions.headers;
    throw new Error("Headers are not set.");
  }
  getRequestUrlInternal(e) {
    if (!e || e.baseUrl === void 0 || e.apiVersion === void 0) throw new Error("HTTP options are not correctly set.");
    const t = [e.baseUrl.endsWith("/") ? e.baseUrl.slice(0, -1) : e.baseUrl];
    return e.apiVersion && e.apiVersion !== "" && t.push(e.apiVersion), t.join("/");
  }
  getBaseResourcePath() {
    return `projects/${this.clientOptions.project}/locations/${this.clientOptions.location}`;
  }
  getApiKey() {
    return this.clientOptions.apiKey;
  }
  getWebsocketBaseUrl() {
    const e = this.getBaseUrl(), t = new URL(e);
    return t.protocol = t.protocol == "http:" ? "ws" : "wss", t.toString();
  }
  setBaseUrl(e) {
    if (this.clientOptions.httpOptions) this.clientOptions.httpOptions.baseUrl = e;
    else throw new Error("HTTP options are not correctly set.");
  }
  constructUrl(e, t, n) {
    const r = [this.getRequestUrlInternal(t)];
    return n && r.push(this.getBaseResourcePath()), e !== "" && r.push(e), new URL(`${r.join("/")}`);
  }
  shouldPrependVertexProjectPath(e, t) {
    return !(t.baseUrl && t.baseUrlResourceScope === Ns.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
  }
  async request(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), r = this.constructUrl(e.path, t, n);
    if (e.queryParams) for (const [i, a] of Object.entries(e.queryParams)) r.searchParams.append(i, String(a));
    let o = {};
    if (e.httpMethod === "GET") {
      if (e.body && e.body !== "{}") throw new Error("Request body should be empty for GET request, but got non empty request body");
    } else o.body = e.body;
    return o = await this.includeExtraHttpOptionsToRequestInit(o, t, r.toString(), e.abortSignal), this.unaryApiCall(r, o, e.httpMethod);
  }
  patchHttpOptions(e, t) {
    const n = JSON.parse(JSON.stringify(e));
    for (const [r, o] of Object.entries(t)) typeof o == "object" ? n[r] = Object.assign(Object.assign({}, n[r]), o) : o !== void 0 && (n[r] = o);
    return n;
  }
  async requestStream(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), r = this.constructUrl(e.path, t, n);
    (!r.searchParams.has("alt") || r.searchParams.get("alt") !== "sse") && r.searchParams.set("alt", "sse");
    let o = {};
    return o.body = e.body, o = await this.includeExtraHttpOptionsToRequestInit(o, t, r.toString(), e.abortSignal), this.streamApiCall(r, o, e.httpMethod);
  }
  async includeExtraHttpOptionsToRequestInit(e, t, n, r) {
    if (t && t.timeout || r) {
      const o = new AbortController(), i = o.signal;
      if (t.timeout && t?.timeout > 0) {
        const a = setTimeout(() => o.abort(), t.timeout);
        a && typeof a.unref == "function" && a.unref();
      }
      r && r.addEventListener("abort", () => {
        o.abort();
      }), e.signal = i;
    }
    return t && t.extraBody !== null && QE(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Uc(r), new ks(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Uc(r), this.processStreamResponse(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  processStreamResponse(e) {
    return ct(this, arguments, function* () {
      var n;
      const r = (n = e?.body) === null || n === void 0 ? void 0 : n.getReader(), o = new TextDecoder("utf-8");
      if (!r) throw new Error("Response body is empty");
      try {
        let i = "";
        const a = "data:", u = [
          `

`,
          "\r\r",
          `\r
\r
`
        ];
        for (; ; ) {
          const { done: c, value: d } = yield J(r.read());
          if (c) {
            if (i.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const h = o.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(h);
            if ("error" in m) {
              const y = JSON.parse(JSON.stringify(m.error)), _ = y.status, v = y.code, E = `got status: ${_}. ${JSON.stringify(m)}`;
              if (v >= 400 && v < 600) throw new Th({
                message: E,
                status: v
              });
            }
          } catch (m) {
            if (m.name === "ApiError") throw m;
          }
          i += h;
          let f = -1, p = 0;
          for (; ; ) {
            f = -1, p = 0;
            for (const _ of u) {
              const v = i.indexOf(_);
              v !== -1 && (f === -1 || v < f) && (f = v, p = _.length);
            }
            if (f === -1) break;
            const m = i.substring(0, f);
            i = i.substring(f + p);
            const y = m.trim();
            if (y.startsWith(a)) {
              const _ = y.substring(5).trim();
              try {
                yield yield J(new ks(new Response(_, {
                  headers: e?.headers,
                  status: e?.status,
                  statusText: e?.statusText
                })));
              } catch (v) {
                throw new Error(`exception parsing stream chunk ${_}. ${v}`);
              }
            }
          }
        }
      } finally {
        r.releaseLock();
      }
    });
  }
  async apiCall(e, t) {
    var n;
    if (!this.clientOptions.httpOptions || !this.clientOptions.httpOptions.retryOptions) return fetch(e, t);
    const r = this.clientOptions.httpOptions.retryOptions, o = async () => {
      const i = await fetch(e, t);
      if (i.ok) return i;
      throw YE.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new uu.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, uu.default)(o, { retries: ((n = r.attempts) !== null && n !== void 0 ? n : zE) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = VE + " " + this.clientOptions.userAgentExtra;
    return e[HE] = t, e[Fs] = t, e[BE] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [r, o] of Object.entries(e.headers)) n.append(r, o);
      e.timeout && e.timeout > 0 && n.append(GE, String(Math.ceil(e.timeout / 1e3)));
    }
    return await this.clientOptions.auth.addAuthHeaders(n, t), n;
  }
  getFileName(e) {
    var t;
    let n = "";
    return typeof e == "string" && (n = e.replace(/[/\\]+$/, ""), n = (t = n.split(/[/\\]/).pop()) !== null && t !== void 0 ? t : ""), n;
  }
  async uploadFile(e, t) {
    var n;
    const r = {};
    t != null && (r.mimeType = t.mimeType, r.name = t.name, r.displayName = t.displayName), r.name && !r.name.startsWith("files/") && (r.name = `files/${r.name}`);
    const o = this.clientOptions.uploader, i = await o.stat(e);
    r.sizeBytes = String(i.size);
    const a = (n = t?.mimeType) !== null && n !== void 0 ? n : i.type;
    if (a === void 0 || a === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    r.mimeType = a;
    const u = { file: r }, c = this.getFileName(e), d = $("upload/v1beta/files", u._url), h = await this.fetchUploadUrl(d, r.sizeBytes, r.mimeType, c, u, t?.httpOptions);
    return o.upload(e, h, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var r;
    const o = this.clientOptions.uploader, i = await o.stat(t), a = String(i.size), u = (r = n?.mimeType) !== null && r !== void 0 ? r : i.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), h = {};
    n != null && Rh(n, h);
    const f = await this.fetchUploadUrl(c, a, u, d, h, n?.httpOptions);
    return o.uploadToFileSearchStore(t, f, this);
  }
  async downloadFile(e) {
    await this.clientOptions.downloader.download(e, this);
  }
  async fetchUploadUrl(e, t, n, r, o, i) {
    var a;
    let u = {};
    i ? u = i : u = {
      apiVersion: "",
      headers: Object.assign({
        "Content-Type": "application/json",
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": `${t}`,
        "X-Goog-Upload-Header-Content-Type": `${n}`
      }, r ? { "X-Goog-Upload-File-Name": r } : {})
    };
    const c = await this.request({
      path: e,
      body: JSON.stringify(o),
      httpMethod: "POST",
      httpOptions: u
    });
    if (!c || !c?.headers) throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
    const d = (a = c?.headers) === null || a === void 0 ? void 0 : a["x-goog-upload-url"];
    if (d === void 0) throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
    return d;
  }
};
async function Uc(e) {
  var t;
  if (e === void 0) throw new Error("response is undefined");
  if (!e.ok) {
    const n = e.status;
    let r;
    !((t = e.headers.get("content-type")) === null || t === void 0) && t.includes("application/json") ? r = await e.json() : r = { error: {
      message: await e.text(),
      code: e.status,
      status: e.statusText
    } };
    const o = JSON.stringify(r);
    throw n >= 400 && n < 600 ? new Th({
      message: o,
      status: n
    }) : new Error(o);
  }
}
function QE(e, t) {
  if (!t || Object.keys(t).length === 0) return;
  if (e.body instanceof Blob) {
    console.warn("includeExtraBodyToRequestInit: extraBody provided but current request body is a Blob. extraBody will be ignored as merging is not supported for Blob bodies.");
    return;
  }
  let n = {};
  if (typeof e.body == "string" && e.body.length > 0) try {
    const i = JSON.parse(e.body);
    if (typeof i == "object" && i !== null && !Array.isArray(i)) n = i;
    else {
      console.warn("includeExtraBodyToRequestInit: Original request body is valid JSON but not a non-array object. Skip applying extraBody to the request body.");
      return;
    }
  } catch {
    console.warn("includeExtraBodyToRequestInit: Original request body is not valid JSON. Skip applying extraBody to the request body.");
    return;
  }
  function r(i, a) {
    const u = Object.assign({}, i);
    for (const c in a) if (Object.prototype.hasOwnProperty.call(a, c)) {
      const d = a[c], h = u[c];
      d && typeof d == "object" && !Array.isArray(d) && h && typeof h == "object" && !Array.isArray(h) ? u[c] = r(h, d) : (h && d && typeof h != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof h}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const o = r(n, t);
  e.body = JSON.stringify(o);
}
var ZE = "mcp_used/unknown", jE = !1;
function xh(e) {
  for (const t of e)
    if (ew(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return jE;
}
function Mh(e) {
  var t;
  e[Fs] = (((t = e[Fs]) !== null && t !== void 0 ? t : "") + ` ${ZE}`).trimStart();
}
function ew(e) {
  return e !== null && typeof e == "object" && e instanceof nw;
}
function tw(e) {
  return ct(this, arguments, function* (n, r = 100) {
    let o, i = 0;
    for (; i < r; ) {
      const a = yield J(n.listTools({ cursor: o }));
      for (const u of a.tools)
        yield yield J(u), i++;
      if (!a.nextCursor) break;
      o = a.nextCursor;
    }
  });
}
var nw = class Nh {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Nh(t, n);
  }
  async initialize() {
    var t, n, r, o;
    if (this.mcpTools.length > 0) return;
    const i = {}, a = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, dt(tw(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
        o = d.value, u = !1;
        const f = o;
        a.push(f);
        const p = f.name;
        if (i[p]) throw new Error(`Duplicate function name ${p} found in MCP tools. Please ensure function names are unique.`);
        i[p] = h;
      }
    } catch (f) {
      n = { error: f };
    } finally {
      try {
        !u && !t && (r = c.return) && await r.call(c);
      } finally {
        if (n) throw n.error;
      }
    }
    this.mcpTools = a, this.functionNameToMcpClient = i;
  }
  async tool() {
    return await this.initialize(), gv(this.mcpTools, this.config);
  }
  async callTool(t) {
    await this.initialize();
    const n = [];
    for (const r of t) if (r.name in this.functionNameToMcpClient) {
      const o = this.functionNameToMcpClient[r.name];
      let i;
      this.config.timeout && (i = { timeout: this.config.timeout });
      const a = await o.callTool({
        name: r.name,
        arguments: r.args
      }, void 0, i);
      n.push({ functionResponse: {
        name: r.name,
        response: a.isError ? { error: a } : a
      } });
    }
    return n;
  }
};
async function rw(e, t, n) {
  const r = new av();
  let o;
  n.data instanceof Blob ? o = JSON.parse(await n.data.text()) : o = JSON.parse(n.data), Object.assign(r, o), t(r);
}
var ow = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), o = this.apiClient.getApiVersion(), i = aw(this.apiClient.getDefaultHeaders()), a = `${r}/ws/google.ai.generativelanguage.${o}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        rw(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(a, sw(i), p);
    m.connect(), await c;
    const y = { setup: { model: Y(this.apiClient, e.model) } };
    return m.send(JSON.stringify(y)), new iw(m, this.apiClient);
  }
}, iw = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = ST(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = TT(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(kn.PLAY);
  }
  pause() {
    this.sendPlaybackControl(kn.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(kn.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(kn.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function sw(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function aw(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var lw = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function uw(e, t, n) {
  const r = new sv();
  let o;
  n.data instanceof Blob ? o = await n.data.text() : n.data instanceof ArrayBuffer ? o = new TextDecoder().decode(n.data) : o = n.data;
  const i = JSON.parse(o);
  if (e.isVertexAI()) {
    const a = IT(i);
    Object.assign(r, a);
  } else Object.assign(r, i);
  t(r);
}
var cw = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new ow(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, r, o, i, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && xh(e.config.tools) && Mh(h);
    const f = pw(h);
    if (this.apiClient.isVertexAI()) {
      const x = this.apiClient.getProject(), D = this.apiClient.getLocation(), H = this.apiClient.getApiKey(), z = !!x && !!D || !!H;
      this.apiClient.getCustomBaseUrl() && !z ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const x = this.apiClient.getApiKey();
      let D = "BidiGenerateContent", H = "key";
      x?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), D = "BidiGenerateContentConstrained", H = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${D}?${H}=${x}`;
    }
    let p = () => {
    };
    const m = new Promise((x) => {
      p = x;
    }), y = e.callbacks, _ = function() {
      var x;
      (x = y?.onopen) === null || x === void 0 || x.call(y), p({});
    }, v = this.apiClient, E = {
      onopen: _,
      onmessage: (x) => {
        uw(v, y.onmessage, x);
      },
      onerror: (t = y?.onerror) !== null && t !== void 0 ? t : function(x) {
      },
      onclose: (n = y?.onclose) !== null && n !== void 0 ? n : function(x) {
      }
    }, b = this.webSocketFactory.create(d, hw(f), E);
    b.connect(), await m;
    let R = Y(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && R.startsWith("publishers/")) {
      const x = this.apiClient.getProject(), D = this.apiClient.getLocation();
      x && D && (R = `projects/${x}/locations/${D}/` + R);
    }
    let P = {};
    this.apiClient.isVertexAI() && ((r = e.config) === null || r === void 0 ? void 0 : r.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [ii.AUDIO] } : e.config.responseModalities = [ii.AUDIO]), !((o = e.config) === null || o === void 0) && o.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const L = (a = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : [], S = [];
    for (const x of L) if (this.isCallableTool(x)) {
      const D = x;
      S.push(await D.tool());
    } else S.push(x);
    S.length > 0 && (e.config.tools = S);
    const O = {
      model: R,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? P = AT(this.apiClient, O) : P = vT(this.apiClient, O), delete P.config, b.send(JSON.stringify(P)), new fw(b, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, dw = { turnComplete: !0 }, fw = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = $e(t.turns), e.isVertexAI() || (n = n.map((r) => io(r)));
      } catch {
        throw new Error(`Failed to parse client content "turns", type: '${typeof t.turns}'`);
      }
      return { clientContent: {
        turns: n,
        turnComplete: t.turnComplete
      } };
    }
    return { clientContent: { turnComplete: t.turnComplete } };
  }
  tLiveClienttToolResponse(e, t) {
    let n = [];
    if (t.functionResponses == null) throw new Error("functionResponses is required.");
    if (Array.isArray(t.functionResponses) ? n = t.functionResponses : n = [t.functionResponses], n.length === 0) throw new Error("functionResponses is required.");
    for (const r of n) {
      if (typeof r != "object" || r === null || !("name" in r) || !("response" in r)) throw new Error(`Could not parse function response, type '${typeof r}'.`);
      if (!e.isVertexAI() && !("id" in r)) throw new Error(lw);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, dw), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: wT(e) } : t = { realtimeInput: ET(e) }, this.conn.send(JSON.stringify(t));
  }
  sendToolResponse(e) {
    if (e.functionResponses == null) throw new Error("Tool response parameters are required.");
    const t = this.tLiveClienttToolResponse(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  close() {
    this.conn.close();
  }
};
function hw(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function pw(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var Fc = 10;
function Oc(e) {
  var t, n, r;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let o = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (qn(a)) {
    o = !0;
    break;
  }
  if (!o) return !0;
  const i = (r = e?.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function qn(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function mw(e) {
  var t, n, r;
  return (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((o) => qn(o))) !== null && r !== void 0 ? r : !1;
}
function qc(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((r, o) => {
    if (qn(r)) return;
    const i = r;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(o);
  }), n;
}
function Bc(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var gw = class extends Ct {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = $e(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = $e(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const r = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: si.EMBED_CONTENT
        });
        return await this.embedContentInternal(r);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: si.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, r, o, i, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !mw(t) || Oc(t.config)) return await this.generateContentInternal(u);
      const c = qc(t);
      if (c.length > 0) {
        const y = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${y}.`);
      }
      let d, h;
      const f = $e(u.contents), p = (o = (r = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && o !== void 0 ? o : Fc;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const y = d.candidates[0].content, _ = [];
        for (const v of (a = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : []) if (qn(v)) {
          const E = await v.callTool(d.functionCalls);
          _.push(...E);
        }
        m++, h = {
          role: "user",
          parts: _
        }, u.contents = $e(u.contents), u.contents.push(y), u.contents.push(h), Bc(u.config) && (f.push(y), f.push(h));
      }
      return Bc(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, r, o, i, a;
      if (this.maybeMoveToResponseJsonSchem(t), Oc(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = qc(t);
      if (u.length > 0) {
        const h = u.map((f) => `tools[${f}]`).join(", ");
        throw new Error(`Incompatible tools found at ${h}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
      }
      const c = (o = (r = (n = t?.config) === null || n === void 0 ? void 0 : n.toolConfig) === null || r === void 0 ? void 0 : r.functionCallingConfig) === null || o === void 0 ? void 0 : o.streamFunctionCallArguments, d = (a = (i = t?.config) === null || i === void 0 ? void 0 : i.automaticFunctionCalling) === null || a === void 0 ? void 0 : a.disable;
      if (c && !d) throw new Error("Running in streaming mode with 'streamFunctionCallArguments' enabled, this feature is not compatible with automatic function calling (AFC). Please set 'config.automaticFunctionCalling.disable' to true to disable AFC or leave 'config.toolConfig.functionCallingConfig.streamFunctionCallArguments' to be undefined or set to false to disable streaming function call arguments feature.");
      return await this.processAfcStream(t);
    }, this.generateImages = async (t) => await this.generateImagesInternal(t).then((n) => {
      var r;
      let o;
      const i = [];
      if (n?.generatedImages) for (const u of n.generatedImages) u && u?.safetyAttributes && ((r = u?.safetyAttributes) === null || r === void 0 ? void 0 : r.contentType) === "Positive Prompt" ? o = u?.safetyAttributes : i.push(u);
      let a;
      return o ? a = {
        generatedImages: i,
        positivePromptSafetyAttributes: o,
        sdkHttpResponse: n.sdkHttpResponse
      } : a = {
        generatedImages: i,
        sdkHttpResponse: n.sdkHttpResponse
      }, a;
    }), this.list = async (t) => {
      var n;
      const r = { config: Object.assign(Object.assign({}, { queryBase: !0 }), t?.config) };
      if (this.apiClient.isVertexAI() && !r.config.queryBase) {
        if (!((n = r.config) === null || n === void 0) && n.filter) throw new Error("Filtering tuned models list for Vertex AI is not currently supported");
        r.config.filter = "labels.tune-type:*";
      }
      return new hn(It.PAGED_ITEM_MODELS, (o) => this.listInternal(o), await this.listInternal(r), r);
    }, this.editImage = async (t) => {
      const n = {
        model: t.model,
        prompt: t.prompt,
        referenceImages: [],
        config: t.config
      };
      return t.referenceImages && t.referenceImages && (n.referenceImages = t.referenceImages.map((r) => r.toReferenceImageAPI())), await this.editImageInternal(n);
    }, this.upscaleImage = async (t) => {
      let n = {
        numberOfImages: 1,
        mode: "upscale"
      };
      t.config && (n = Object.assign(Object.assign({}, n), t.config));
      const r = {
        model: t.model,
        image: t.image,
        upscaleFactor: t.upscaleFactor,
        config: n
      };
      return await this.upscaleImageInternal(r);
    }, this.generateVideos = async (t) => {
      var n, r, o, i, a, u;
      if ((t.prompt || t.image || t.video) && t.source) throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      return this.apiClient.isVertexAI() || (!((n = t.video) === null || n === void 0) && n.uri && (!((r = t.video) === null || r === void 0) && r.videoBytes) ? t.video = {
        uri: t.video.uri,
        mimeType: t.video.mimeType
      } : !((i = (o = t.source) === null || o === void 0 ? void 0 : o.video) === null || i === void 0) && i.uri && (!((u = (a = t.source) === null || a === void 0 ? void 0 : a.video) === null || u === void 0) && u.videoBytes) && (t.source.video = {
        uri: t.source.video.uri,
        mimeType: t.source.video.mimeType
      })), await this.generateVideosInternal(t);
    };
  }
  maybeMoveToResponseJsonSchem(e) {
    e.config && e.config.responseSchema && (e.config.responseJsonSchema || Object.keys(e.config.responseSchema).includes("$schema") && (e.config.responseJsonSchema = e.config.responseSchema, delete e.config.responseSchema));
  }
  async processParamsMaybeAddMcpUsage(e) {
    var t, n, r;
    const o = (t = e.config) === null || t === void 0 ? void 0 : t.tools;
    if (!o) return e;
    const i = await Promise.all(o.map(async (u) => qn(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (a.config.tools = i, e.config && e.config.tools && xh(e.config.tools)) {
      const u = (r = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && r !== void 0 ? r : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), Mh(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, r;
    const o = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (qn(i)) {
      const a = i, u = await a.tool();
      for (const c of (r = u.functionDeclarations) !== null && r !== void 0 ? r : []) {
        if (!c.name) throw new Error("Function declaration name is required.");
        if (o.has(c.name)) throw new Error(`Duplicate tool declaration name: ${c.name}`);
        o.set(c.name, a);
      }
    }
    return o;
  }
  async processAfcStream(e) {
    var t, n, r;
    const o = (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && r !== void 0 ? r : Fc;
    let i = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return ct(this, arguments, function* () {
        for (var f, p, m, y, _, v; a < o; ) {
          i && (a++, i = !1);
          const P = yield J(c.processParamsMaybeAddMcpUsage(h)), L = yield J(c.generateContentStreamInternal(P)), S = [], O = [];
          try {
            for (var E = !0, b = (p = void 0, dt(L)), R; R = yield J(b.next()), f = R.done, !f; E = !0) {
              y = R.value, E = !1;
              const x = y;
              if (yield yield J(x), x.candidates && (!((_ = x.candidates[0]) === null || _ === void 0) && _.content)) {
                O.push(x.candidates[0].content);
                for (const D of (v = x.candidates[0].content.parts) !== null && v !== void 0 ? v : []) if (a < o && D.functionCall) {
                  if (!D.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(D.functionCall.name)) {
                    const H = yield J(d.get(D.functionCall.name).callTool([D.functionCall]));
                    S.push(...H);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${D.functionCall.name}`);
                }
              }
            }
          } catch (x) {
            p = { error: x };
          } finally {
            try {
              !E && !f && (m = b.return) && (yield J(m.call(b)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (S.length > 0) {
            i = !0;
            const x = new gr();
            x.candidates = [{ content: {
              role: "user",
              parts: S
            } }], yield yield J(x);
            const D = [];
            D.push(...O), D.push({
              role: "user",
              parts: S
            }), h.contents = $e(h.contents).concat(D);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Dc(this.apiClient, e);
      return a = $("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Lc(d), f = new gr();
        return Object.assign(f, h), f;
      });
    } else {
      const c = kc(this.apiClient, e);
      return a = $("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = $c(d), f = new gr();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Dc(this.apiClient, e);
      return a = $("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return ct(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var y = !0, _ = dt(d), v; v = yield J(_.next()), h = v.done, !h; y = !0) {
              m = v.value, y = !1;
              const E = m, b = Lc(yield J(E.json()), e);
              b.sdkHttpResponse = { headers: E.headers };
              const R = new gr();
              Object.assign(R, b), yield yield J(R);
            }
          } catch (E) {
            f = { error: E };
          } finally {
            try {
              !y && !h && (p = _.return) && (yield J(p.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = kc(this.apiClient, e);
      return a = $("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }), i.then(function(d) {
        return ct(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var y = !0, _ = dt(d), v; v = yield J(_.next()), h = v.done, !h; y = !0) {
              m = v.value, y = !1;
              const E = m, b = $c(yield J(E.json()), e);
              b.sdkHttpResponse = { headers: E.headers };
              const R = new gr();
              Object.assign(R, b), yield yield J(R);
            }
          } catch (E) {
            f = { error: E };
          } finally {
            try {
              !y && !h && (p = _.return) && (yield J(p.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    }
  }
  async embedContentInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = iS(this.apiClient, e, e);
      return a = $(_v(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = aS(d, e), f = new hc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = oS(this.apiClient, e);
      return a = $("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = sS(d), f = new hc();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = _S(this.apiClient, e);
      return a = $("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = AS(d), f = new pc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = yS(this.apiClient, e);
      return a = $("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = vS(d), f = new pc();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = eS(this.apiClient, e);
      return o = $("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = tS(u), d = new W_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = AE(this.apiClient, e);
      return o = $("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = TE(u), d = new z_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = eE(this.apiClient, e);
      return o = $("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = tE(u), d = new Y_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = aE(this.apiClient, e);
      return o = $("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = lE(u), d = new X_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = US(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Us(d));
    } else {
      const c = LS(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Ls(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = JS(this.apiClient, e);
      return a = $("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = zS(d), f = new mc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = KS(this.apiClient, e);
      return a = $("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = WS(d), f = new mc();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = _E(this.apiClient, e);
      return a = $("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Us(d));
    } else {
      const c = yE(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Ls(d));
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = XT(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = ZT(d), f = new gc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = YT(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = QT(d), f = new gc();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = JT(this.apiClient, e);
      return a = $("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = zT(d), f = new yc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = KT(this.apiClient, e);
      return a = $("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = WT(d), f = new yc();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = FT(this.apiClient, e);
      return o = $("{model}:computeTokens", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = OT(u), d = new Q_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = CS(this.apiClient, e);
      return a = $("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = wS(d), f = new _c();
        return Object.assign(f, h), f;
      });
    } else {
      const c = IS(this.apiClient, e);
      return a = $("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = ES(d), f = new _c();
        return Object.assign(f, h), f;
      });
    }
  }
}, yw = class extends Ct {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async getVideosOperation(e) {
    const t = e.operation, n = e.config;
    if (t.name === void 0 || t.name === "") throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const r = t.name.split("/operations/")[0];
      let o;
      n && "httpOptions" in n && (o = n.httpOptions);
      const i = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: r,
        config: { httpOptions: o }
      });
      return t._fromAPIResponse({
        apiResponse: i,
        _isVertexAI: !0
      });
    } else {
      const r = await this.getVideosOperationInternal({
        operationName: t.name,
        config: n
      });
      return t._fromAPIResponse({
        apiResponse: r,
        _isVertexAI: !1
      });
    }
  }
  async get(e) {
    const t = e.operation, n = e.config;
    if (t.name === void 0 || t.name === "") throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const r = t.name.split("/operations/")[0];
      let o;
      n && "httpOptions" in n && (o = n.httpOptions);
      const i = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: r,
        config: { httpOptions: o }
      });
      return t._fromAPIResponse({
        apiResponse: i,
        _isVertexAI: !0
      });
    } else {
      const r = await this.getVideosOperationInternal({
        operationName: t.name,
        config: n
      });
      return t._fromAPIResponse({
        apiResponse: r,
        _isVertexAI: !1
      });
    }
  }
  async getVideosOperationInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = B_(e);
      return a = $("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = q_(e);
      return a = $("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i;
    }
  }
  async fetchPredictVideosOperationInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = k_(e);
      return o = $("{resourceName}:fetchPredictOperation", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r;
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
};
function Gc(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function _w(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function vw(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Aw(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => Rw(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Tw(e, t, n) {
  const r = {}, o = s(t, ["expireTime"]);
  n !== void 0 && o != null && l(n, ["expireTime"], o);
  const i = s(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const a = s(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = s(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], Pw(e, u));
  const c = s(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), r;
}
function Sw(e, t) {
  const n = {}, r = s(t, ["config"]);
  return r != null && l(n, ["config"], Tw(e, r, n)), n;
}
function Ew(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function ww(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Iw(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], _w(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function Cw(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function bw(e, t) {
  const n = {}, r = s(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], r);
  const o = s(e, ["responseModalities"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], o);
  const i = s(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
  const a = s(e, ["topP"]);
  t !== void 0 && a != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], a);
  const u = s(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = s(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = s(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = s(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = s(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Ma(f));
  const p = s(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = s(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const y = s(e, ["systemInstruction"]);
  t !== void 0 && y != null && l(t, ["setup", "systemInstruction"], Aw(Te(y)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = Jn(_);
    Array.isArray(x) && (x = x.map((D) => Nw(Kn(D)))), l(t, ["setup", "tools"], x);
  }
  const v = s(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], Mw(v));
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], Gc(E));
  const b = s(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], Gc(b));
  const R = s(e, ["realtimeInputConfig"]);
  t !== void 0 && R != null && l(t, ["setup", "realtimeInputConfig"], R);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const L = s(e, ["proactivity"]);
  if (t !== void 0 && L != null && l(t, ["setup", "proactivity"], L), s(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = s(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const O = s(e, ["safetySettings"]);
  if (t !== void 0 && O != null) {
    let x = O;
    Array.isArray(x) && (x = x.map((D) => xw(D))), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function Pw(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], bw(o, n)), n;
}
function Rw(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], Ew(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], ww(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], vw(c));
  const d = s(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = s(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = s(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = s(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = s(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const y = s(e, ["toolResponse"]);
  y != null && l(t, ["toolResponse"], y);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function xw(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function Mw(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function Nw(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], Cw(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Iw(i));
  const a = s(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), s(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = s(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = s(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), s(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = s(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = s(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function kw(e) {
  const t = [];
  for (const n in e) if (Object.prototype.hasOwnProperty.call(e, n)) {
    const r = e[n];
    if (typeof r == "object" && r != null && Object.keys(r).length > 0) {
      const o = Object.keys(r).map((i) => `${n}.${i}`);
      t.push(...o);
    } else t.push(n);
  }
  return t.join(",");
}
function Dw(e, t) {
  let n = null;
  const r = e.bidiGenerateContentSetup;
  if (typeof r == "object" && r !== null && "setup" in r) {
    const i = r.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else r !== void 0 && delete e.bidiGenerateContentSetup;
  const o = e.fieldMask;
  if (n) {
    const i = kw(n);
    if (Array.isArray(t?.lockAdditionalFields) && t?.lockAdditionalFields.length === 0) i ? e.fieldMask = i : delete e.fieldMask;
    else if (t?.lockAdditionalFields && t.lockAdditionalFields.length > 0 && o !== null && Array.isArray(o) && o.length > 0) {
      const a = [
        "temperature",
        "topK",
        "topP",
        "maxOutputTokens",
        "responseModalities",
        "seed",
        "speechConfig"
      ];
      let u = [];
      o.length > 0 && (u = o.map((d) => a.includes(d) ? `generationConfig.${d}` : d));
      const c = [];
      i && c.push(i), u.length > 0 && c.push(...u), c.length > 0 ? e.fieldMask = c.join(",") : delete e.fieldMask;
    } else delete e.fieldMask;
  } else o !== null && Array.isArray(o) && o.length > 0 ? e.fieldMask = o.join(",") : delete e.fieldMask;
  return e;
}
var $w = class extends Ct {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = Sw(this.apiClient, e);
      o = $("auth_tokens", a._url), i = a._query, delete a.config, delete a._url, delete a._query;
      const u = Dw(a, e.config);
      return r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => c);
    }
  }
};
function Lw(e, t) {
  const n = {}, r = s(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function Uw(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = s(e, ["config"]);
  return r != null && Lw(r, t), t;
}
function Fw(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function Ow(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function qw(e) {
  const t = {}, n = s(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const r = s(e, ["config"]);
  return r != null && Ow(r, t), t;
}
function Bw(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["documents"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["documents"], i);
  }
  return t;
}
var Gw = class extends Ct {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new hn(It.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Fw(e);
      return o = $("{name}", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let r = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const i = Uw(e);
      r = $("{name}", i._url), o = i._query, delete i._url, delete i._query, await this.apiClient.request({
        path: r,
        queryParams: o,
        body: JSON.stringify(i),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = qw(e);
      return o = $("{parent}/documents", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = Bw(u), d = new Z_();
        return Object.assign(d, c), d;
      });
    }
  }
}, Hw = class extends Ct {
  constructor(e, t = new Gw(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new hn(It.PAGED_ITEM_FILE_SEARCH_STORES, (r) => this.listInternal(r), await this.listInternal(n), n);
  }
  async uploadToFileSearchStore(e) {
    if (this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support uploading files to a file search store.");
    return this.apiClient.uploadFileToFileSearchStore(e.fileSearchStoreName, e.file, e.config);
  }
  async create(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = PE(e);
      return o = $("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = ME(e);
      return o = $("{name}", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let r = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const i = xE(e);
      r = $("{name}", i._url), o = i._query, delete i._url, delete i._query, await this.apiClient.request({
        path: r,
        queryParams: o,
        body: JSON.stringify(i),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = UE(e);
      return o = $("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = FE(u), d = new j_();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = OE(e);
      return o = $("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = qE(u), d = new ev();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = DE(e);
      return o = $("{file_search_store_name}:importFile", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = kE(u), d = new tv();
        return Object.assign(d, c), d;
      });
    }
  }
}, kh = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return kh = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
}, Vw = () => kh();
function Os(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var qs = (e) => {
  if (e instanceof Error) return e;
  if (typeof e == "object" && e !== null) {
    try {
      if (Object.prototype.toString.call(e) === "[object Error]") {
        const t = new Error(e.message, e.cause ? { cause: e.cause } : {});
        return e.stack && (t.stack = e.stack), e.cause && !t.cause && (t.cause = e.cause), e.name && (t.name = e.name), t;
      }
    } catch {
    }
    try {
      return new Error(JSON.stringify(e));
    } catch {
    }
  }
  return new Error(e);
}, tt = class extends Error {
}, rt = class Bs extends tt {
  constructor(t, n, r, o) {
    super(`${Bs.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.error = n;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Mi({
      message: r,
      cause: qs(n)
    });
    const i = n;
    return t === 400 ? new $h(t, i, r, o) : t === 401 ? new Lh(t, i, r, o) : t === 403 ? new Uh(t, i, r, o) : t === 404 ? new Fh(t, i, r, o) : t === 409 ? new Oh(t, i, r, o) : t === 422 ? new qh(t, i, r, o) : t === 429 ? new Bh(t, i, r, o) : t >= 500 ? new Gh(t, i, r, o) : new Bs(t, i, r, o);
  }
}, Gs = class extends rt {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Mi = class extends rt {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Dh = class extends Mi {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, $h = class extends rt {
}, Lh = class extends rt {
}, Uh = class extends rt {
}, Fh = class extends rt {
}, Oh = class extends rt {
}, qh = class extends rt {
}, Bh = class extends rt {
}, Gh = class extends rt {
}, Kw = /^[a-z][a-z0-9+.-]*:/i, Jw = (e) => Kw.test(e), Hs = (e) => (Hs = Array.isArray, Hs(e)), Hc = Hs;
function Vc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Ww(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var zw = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new tt(`${e} must be an integer`);
  if (t < 0) throw new tt(`${e} must be a positive integer`);
  return t;
}, Yw = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Xw = (e) => new Promise((t) => setTimeout(t, e));
function Qw() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Hh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Zw(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Hh({
    start() {
    },
    async pull(n) {
      const { done: r, value: o } = await t.next();
      r ? n.close() : n.enqueue(o);
    },
    async cancel() {
      var n;
      await ((n = t.return) === null || n === void 0 ? void 0 : n.call(t));
    }
  });
}
function Vh(e) {
  if (e[Symbol.asyncIterator]) return e;
  const t = e.getReader();
  return {
    async next() {
      try {
        const n = await t.read();
        return n?.done && t.releaseLock(), n;
      } catch (n) {
        throw t.releaseLock(), n;
      }
    },
    async return() {
      const n = t.cancel();
      return t.releaseLock(), await n, {
        done: !0,
        value: void 0
      };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
async function jw(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const r = e.getReader(), o = r.cancel();
  r.releaseLock(), await o;
}
var eI = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function tI(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new tt(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var nI = "0.0.1", Kh = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function rs(e, t, n) {
  return Kh(), new File(e, t ?? "unknown_file", n);
}
function rI(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var oI = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Jh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", iI = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Jh(e), sI = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function aI(e, t, n) {
  if (Kh(), e = await e, iI(e))
    return e instanceof File ? e : rs([await e.arrayBuffer()], e.name);
  if (sI(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), rs(await Vs(o), t, n);
  }
  const r = await Vs(e);
  if (t || (t = rI(e)), !n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = Object.assign(Object.assign({}, n), { type: o }));
  }
  return rs(r, t, n);
}
async function Vs(e) {
  var t, n, r, o, i;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (Jh(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (oI(e)) try {
    for (var u = !0, c = dt(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      o = d.value, u = !1;
      const h = o;
      a.push(...await Vs(h));
    }
  } catch (h) {
    n = { error: h };
  } finally {
    try {
      !u && !t && (r = c.return) && await r.call(c);
    } finally {
      if (n) throw n.error;
    }
  }
  else {
    const h = (i = e?.constructor) === null || i === void 0 ? void 0 : i.name;
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${lI(e)}`);
  }
  return a;
}
function lI(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Na = class {
  constructor(e) {
    this._client = e;
  }
};
Na._key = [];
function Wh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Kc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), uI = (e = Wh) => (function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    var m, y, _;
    /[?#]/.test(f) && (o = !0);
    const v = r[p];
    let E = (o ? encodeURIComponent : e)("" + v);
    return p !== r.length && (v == null || typeof v == "object" && v.toString === ((_ = Object.getPrototypeOf((y = Object.getPrototypeOf((m = v.hasOwnProperty) !== null && m !== void 0 ? m : Kc)) !== null && y !== void 0 ? y : Kc)) === null || _ === void 0 ? void 0 : _.toString)) && (E = v + "", i.push({
      start: h.length + f.length,
      length: E.length,
      error: `Value of type ${Object.prototype.toString.call(v).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : E);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) {
    const h = d[0].startsWith("/"), f = h ? 1 : 0, p = h ? d[0].slice(1) : d[0];
    i.push({
      start: d.index + f,
      length: p.length,
      error: `Value "${p}" can't be safely passed as a path parameter`
    });
  }
  if (i.sort((h, f) => h.start - f.start), i.length > 0) {
    let h = 0;
    const f = i.reduce((p, m) => {
      const y = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + y + _;
    }, "");
    throw new tt(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), st = /* @__PURE__ */ uI(Wh), zh = class extends Na {
  create(e, t) {
    var n;
    const { api_version: r = this._client.apiVersion } = e, o = Ot(e, ["api_version"]);
    if ("model" in o && "agent_config" in o) throw new tt("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in o && "generation_config" in o) throw new tt("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(st`/${r}/interactions`, Object.assign(Object.assign({ body: o }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(st`/${r}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.post(st`/${r}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var r;
    const o = t ?? {}, { api_version: i = this._client.apiVersion } = o, a = Ot(o, ["api_version"]);
    return this._client.get(st`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (r = t?.stream) !== null && r !== void 0 ? r : !1 }));
  }
};
zh._key = Object.freeze(["interactions"]);
var Yh = class extends zh {
}, Xh = class extends Na {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: r } = e, o = Ot(e, ["api_version", "webhook_id"]);
    return this._client.post(st`/${n}/webhooks`, Object.assign({
      query: { webhook_id: r },
      body: o
    }, t));
  }
  update(e, t, n) {
    const { api_version: r = this._client.apiVersion, update_mask: o } = t, i = Ot(t, ["api_version", "update_mask"]);
    return this._client.patch(st`/${r}/webhooks/${e}`, Object.assign({
      query: { update_mask: o },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: r = this._client.apiVersion } = n, o = Ot(n, ["api_version"]);
    return this._client.get(st`/${r}/webhooks`, Object.assign({ query: o }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(st`/${r}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.get(st`/${r}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: r = this._client.apiVersion, body: o } = t ?? {};
    return this._client.post(st`/${r}/webhooks/${e}:ping`, Object.assign({ body: o }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const r = t ?? {}, { api_version: o = this._client.apiVersion } = r, i = Ot(r, ["api_version"]);
    return this._client.post(st`/${o}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
Xh._key = Object.freeze(["webhooks"]);
var Qh = class extends Xh {
};
function cI(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var Mo;
function ka(e) {
  let t;
  return (Mo ?? (t = new globalThis.TextEncoder(), Mo = t.encode.bind(t)))(e);
}
var No;
function Jc(e) {
  let t;
  return (No ?? (t = new globalThis.TextDecoder(), No = t.decode.bind(t)))(e);
}
var Ni = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ka(e) : e;
    this.buffer = cI([this.buffer, n]);
    const r = [];
    let o;
    for (; (o = dI(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (o.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = o.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (o.index !== this.carriageReturnIndex + 1 || o.carriage)) {
        r.push(Jc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? o.preceding - 1 : o.preceding, a = Jc(this.buffer.subarray(0, i));
      r.push(a), this.buffer = this.buffer.subarray(o.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), r;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Ni.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Ni.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function dI(e, t) {
  const o = t ?? 0, i = e.indexOf(10, o), a = e.indexOf(13, o);
  if (i === -1 && a === -1) return null;
  let u;
  return i !== -1 && a !== -1 ? u = Math.min(i, a) : u = i !== -1 ? i : a, e[u] === 10 ? {
    preceding: u,
    index: u + 1,
    carriage: !1
  } : {
    preceding: u,
    index: u + 1,
    carriage: !0
  };
}
var li = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Wc = (e, t, n) => {
  if (e) {
    if (Ww(li, e)) return e;
    xe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(li))}`);
  }
};
function wr() {
}
function ko(e, t, n) {
  return !t || li[e] > li[n] ? wr : t[e].bind(t);
}
var fI = {
  error: wr,
  warn: wr,
  info: wr,
  debug: wr
}, zc = /* @__PURE__ */ new WeakMap();
function xe(e) {
  var t;
  const n = e.logger, r = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return fI;
  const o = zc.get(n);
  if (o && o[0] === r) return o[1];
  const i = {
    error: ko("error", n, r),
    warn: ko("warn", n, r),
    info: ko("info", n, r),
    debug: ko("debug", n, r)
  };
  return zc.set(n, [r, i]), i;
}
var Zt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), hI = class Ir {
  constructor(t, n, r) {
    this.iterator = t, this.controller = n, this.client = r;
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const i = r ? xe(r) : console;
    function a() {
      return ct(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new tt("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, y = dt(pI(t, n)), _; _ = yield J(y.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const v = f;
              if (!p)
                if (v.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield J(JSON.parse(v.data));
                } catch (E) {
                  throw i.error("Could not parse message into JSON:", v.data), i.error("From chunk:", v.raw), E;
                }
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (h = y.return) && (yield J(h.call(y)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (Os(v)) return yield J(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Ir(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    function i() {
      return ct(this, arguments, function* () {
        var c, d, h, f;
        const p = new Ni(), m = Vh(t);
        try {
          for (var y = !0, _ = dt(m), v; v = yield J(_.next()), c = v.done, !c; y = !0) {
            f = v.value, y = !1;
            const E = f;
            for (const b of p.decode(E)) yield yield J(b);
          }
        } catch (E) {
          d = { error: E };
        } finally {
          try {
            !y && !c && (h = _.return) && (yield J(h.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const E of p.flush()) yield yield J(E);
      });
    }
    function a() {
      return ct(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new tt("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, y = dt(i()), _; _ = yield J(y.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const v = f;
              p || v && (yield yield J(JSON.parse(v)));
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (h = y.return) && (yield J(h.call(y)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (Os(v)) return yield J(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Ir(a, n, r);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), o = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = r.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new Ir(() => o(t), this.controller, this.client), new Ir(() => o(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Hh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = ka(JSON.stringify(o) + `
`);
          r.enqueue(a);
        } catch (o) {
          r.error(o);
        }
      },
      async cancel() {
        var r;
        await ((r = n.return) === null || r === void 0 ? void 0 : r.call(n));
      }
    });
  }
};
function pI(e, t) {
  return ct(this, arguments, function* () {
    var r, o, i, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new tt("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new tt("Attempted to iterate over a response with no body");
    const u = new gI(), c = new Ni(), d = Vh(e.body);
    try {
      for (var h = !0, f = dt(mI(d)), p; p = yield J(f.next()), r = p.done, !r; h = !0) {
        a = p.value, h = !1;
        const m = a;
        for (const y of c.decode(m)) {
          const _ = u.decode(y);
          _ && (yield yield J(_));
        }
      }
    } catch (m) {
      o = { error: m };
    } finally {
      try {
        !h && !r && (i = f.return) && (yield J(i.call(f)));
      } finally {
        if (o) throw o.error;
      }
    }
    for (const m of c.flush()) {
      const y = u.decode(m);
      y && (yield yield J(y));
    }
  });
}
function mI(e) {
  return ct(this, arguments, function* () {
    var n, r, o, i;
    try {
      for (var a = !0, u = dt(e), c; c = yield J(u.next()), n = c.done, !n; a = !0) {
        i = c.value, a = !1;
        const d = i;
        d != null && (yield yield J(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? ka(d) : d));
      }
    } catch (d) {
      r = { error: d };
    } finally {
      try {
        !a && !n && (o = u.return) && (yield J(o.call(u)));
      } finally {
        if (r) throw r.error;
      }
    }
  });
}
var gI = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const o = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], o;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, r] = yI(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function yI(e, t) {
  const n = e.indexOf(t);
  return n !== -1 ? [
    e.substring(0, n),
    t,
    e.substring(n + t.length)
  ] : [
    e,
    "",
    ""
  ];
}
async function _I(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return xe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : hI.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return xe(e).debug(`[${r}] response parsed`, Zt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
var vI = class Zh extends Promise {
  constructor(t, n, r = _I) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, this.client = t;
  }
  _thenUnwrap(t) {
    return new Zh(this.client, this.responsePromise, async (n, r) => t(await this.parseResponse(n, r), r));
  }
  asResponse() {
    return this.responsePromise.then((t) => t.response);
  }
  async withResponse() {
    const [t, n] = await Promise.all([this.parse(), this.asResponse()]);
    return {
      data: t,
      response: n
    };
  }
  parse() {
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(this.client, t))), this.parsedPromise;
  }
  then(t, n) {
    return this.parse().then(t, n);
  }
  catch(t) {
    return this.parse().catch(t);
  }
  finally(t) {
    return this.parse().finally(t);
  }
}, jh = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* AI(e) {
  if (!e) return;
  if (jh in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Hc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = Hc(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var yr = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of AI(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [jh]: !0,
    values: t,
    nulls: n
  };
}, os = (e) => {
  var t, n, r, o, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (o = (r = globalThis.Deno.env) === null || r === void 0 ? void 0 : r.get) === null || o === void 0 ? void 0 : o.call(r, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, ep, tp = class np {
  constructor(t) {
    var n, r, o, i, a, u, c, { baseURL: d = os("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = os("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = Ot(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (r = m.timeout) !== null && r !== void 0 ? r : np.DEFAULT_TIMEOUT, this.logger = (o = m.logger) !== null && o !== void 0 ? o : console;
    const y = "warn";
    this.logLevel = y, this.logLevel = (a = (i = Wc(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : Wc(os("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : y, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : Qw(), this.encoder = eI, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
  }
  withOptions(t) {
    return new this.constructor(Object.assign(Object.assign(Object.assign({}, this._options), {
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      apiKey: this.apiKey,
      apiVersion: this.apiVersion
    }), t));
  }
  baseURLOverridden() {
    return this.baseURL !== "https://generativelanguage.googleapis.com";
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  validateHeaders({ values: t, nulls: n }) {
    if (!(t.has("authorization") || t.has("x-goog-api-key")) && !(this.apiKey && t.get("x-goog-api-key")) && !n.has("x-goog-api-key"))
      throw new Error('Could not resolve authentication method. Expected the apiKey to be set. Or for the "x-goog-api-key" headers to be explicitly omitted');
  }
  async authHeaders(t) {
    const n = yr([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return yr([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return yr([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return tI(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${nI}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Vw()}`;
  }
  makeStatusError(t, n, r, o) {
    return rt.generate(t, n, r, o);
  }
  buildURL(t, n, r) {
    const o = !this.baseURLOverridden() && r || this.baseURL, i = Jw(t) ? new URL(t) : new URL(o + (o.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!Vc(a) || !Vc(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
  }
  async prepareOptions(t) {
    if (this.clientAdapter && this.clientAdapter.isVertexAI() && !t.path.startsWith(`/${this.apiVersion}/projects/`)) {
      const n = t.path.slice(this.apiVersion.length + 1);
      t.path = `/${this.apiVersion}/projects/${this.clientAdapter.getProject()}/locations/${this.clientAdapter.getLocation()}${n}`;
    }
  }
  async prepareRequest(t, { url: n, options: r }) {
  }
  get(t, n) {
    return this.methodRequest("get", t, n);
  }
  post(t, n) {
    return this.methodRequest("post", t, n);
  }
  patch(t, n) {
    return this.methodRequest("patch", t, n);
  }
  put(t, n) {
    return this.methodRequest("put", t, n);
  }
  delete(t, n) {
    return this.methodRequest("delete", t, n);
  }
  methodRequest(t, n, r) {
    return this.request(Promise.resolve(r).then((o) => Object.assign({
      method: t,
      path: n
    }, o)));
  }
  request(t, n = null) {
    return new vI(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, r) {
    var o, i, a;
    const u = await t, c = (o = u.maxRetries) !== null && o !== void 0 ? o : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: h, timeout: f } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: h,
      options: u
    });
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = r === void 0 ? "" : `, retryOf: ${r}`, y = Date.now();
    if (xe(this).debug(`[${p}] sending request`, Zt({
      retryOfRequestLogID: r,
      method: u.method,
      url: h,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new Gs();
    const _ = new AbortController(), v = await this.fetchWithTimeout(h, d, f, _).catch(qs), E = Date.now();
    if (v instanceof globalThis.Error) {
      const R = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new Gs();
      const P = Os(v) || /timed? ?out/i.test(String(v) + ("cause" in v ? String(v.cause) : ""));
      if (n)
        return xe(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - ${R}`), xe(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (${R})`, Zt({
          retryOfRequestLogID: r,
          url: h,
          durationMs: E - y,
          message: v.message
        })), this.retryRequest(u, n, r ?? p);
      throw xe(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - error; no more retries left`), xe(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (error; no more retries left)`, Zt({
        retryOfRequestLogID: r,
        url: h,
        durationMs: E - y,
        message: v.message
      })), P ? new Dh() : new Mi({ cause: v });
    }
    const b = `[${p}${m}] ${d.method} ${h} ${v.ok ? "succeeded" : "failed"} with status ${v.status} in ${E - y}ms`;
    if (!v.ok) {
      const R = await this.shouldRetry(v);
      if (n && R) {
        const x = `retrying, ${n} attempts remaining`;
        return await jw(v.body), xe(this).info(`${b} - ${x}`), xe(this).debug(`[${p}] response error (${x})`, Zt({
          retryOfRequestLogID: r,
          url: v.url,
          status: v.status,
          headers: v.headers,
          durationMs: E - y
        })), this.retryRequest(u, n, r ?? p, v.headers);
      }
      const P = R ? "error; no more retries left" : "error; not retryable";
      xe(this).info(`${b} - ${P}`);
      const L = await v.text().catch((x) => qs(x).message), S = Yw(L), O = S ? void 0 : L;
      throw xe(this).debug(`[${p}] response error (${P})`, Zt({
        retryOfRequestLogID: r,
        url: v.url,
        status: v.status,
        headers: v.headers,
        message: O,
        durationMs: Date.now() - y
      })), this.makeStatusError(v.status, S, O, v.headers);
    }
    return xe(this).info(b), xe(this).debug(`[${p}] response start`, Zt({
      retryOfRequestLogID: r,
      url: v.url,
      status: v.status,
      headers: v.headers,
      durationMs: E - y
    })), {
      response: v,
      options: u,
      controller: _,
      requestLogID: p,
      retryOfRequestLogID: r,
      startTime: y
    };
  }
  async fetchWithTimeout(t, n, r, o) {
    const i = n || {}, { signal: a, method: u } = i, c = Ot(i, ["signal", "method"]), d = this._makeAbort(o);
    a && a.addEventListener("abort", d, { once: !0 });
    const h = setTimeout(d, r), f = globalThis.ReadableStream && c.body instanceof globalThis.ReadableStream || typeof c.body == "object" && c.body !== null && Symbol.asyncIterator in c.body, p = Object.assign(Object.assign(Object.assign({ signal: o.signal }, f ? { duplex: "half" } : {}), { method: "GET" }), c);
    u && (p.method = u.toUpperCase());
    try {
      return await this.fetch.call(void 0, t, p);
    } finally {
      clearTimeout(h);
    }
  }
  async shouldRetry(t) {
    const n = t.headers.get("x-should-retry");
    return n === "true" ? !0 : n === "false" ? !1 : t.status === 408 || t.status === 409 || t.status === 429 || t.status >= 500;
  }
  async retryRequest(t, n, r, o) {
    var i;
    let a;
    const u = o?.get("retry-after-ms");
    if (u) {
      const d = parseFloat(u);
      Number.isNaN(d) || (a = d);
    }
    const c = o?.get("retry-after");
    if (c && !a) {
      const d = parseFloat(c);
      Number.isNaN(d) ? a = Date.parse(c) - Date.now() : a = d * 1e3;
    }
    if (a === void 0) {
      const d = (i = t.maxRetries) !== null && i !== void 0 ? i : this.maxRetries;
      a = this.calculateDefaultRetryTimeoutMillis(n, d);
    }
    return await Xw(a), this.makeRequest(t, n - 1, r);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var r, o, i;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = a, f = this.buildURL(c, d, h);
    "timeout" in a && zw("timeout", a.timeout), a.timeout = (r = a.timeout) !== null && r !== void 0 ? r : this.timeout;
    const { bodyHeaders: p, body: m } = this.buildBody({ options: a }), y = await this.buildHeaders({
      options: t,
      method: u,
      bodyHeaders: p,
      retryCount: n
    });
    return {
      req: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
        method: u,
        headers: y
      }, a.signal && { signal: a.signal }), globalThis.ReadableStream && m instanceof globalThis.ReadableStream && { duplex: "half" }), m && { body: m }), (o = this.fetchOptions) !== null && o !== void 0 ? o : {}), (i = a.fetchOptions) !== null && i !== void 0 ? i : {}),
      url: f,
      timeout: a.timeout
    };
  }
  async buildHeaders({ options: t, method: n, bodyHeaders: r, retryCount: o }) {
    let i = {};
    this.idempotencyHeader && n !== "get" && (t.idempotencyKey || (t.idempotencyKey = this.defaultIdempotencyKey()), i[this.idempotencyHeader] = t.idempotencyKey);
    const a = await this.authHeaders(t);
    let u = yr([
      i,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent()
      },
      this._options.defaultHeaders,
      r,
      t.headers,
      a
    ]);
    return this.validateHeaders(u), u.values;
  }
  _makeAbort(t) {
    return () => t.abort();
  }
  buildBody({ options: { body: t, headers: n } }) {
    if (!t) return {
      bodyHeaders: void 0,
      body: void 0
    };
    const r = yr([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: Zw(t)
    } : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: r
    });
  }
};
tp.DEFAULT_TIMEOUT = 6e4;
var ge = class extends tp {
  constructor() {
    super(...arguments), this.interactions = new Yh(this), this.webhooks = new Qh(this);
  }
};
ep = ge;
ge.GeminiNextGenAPIClient = ep;
ge.GeminiNextGenAPIClientError = tt;
ge.APIError = rt;
ge.APIConnectionError = Mi;
ge.APIConnectionTimeoutError = Dh;
ge.APIUserAbortError = Gs;
ge.NotFoundError = Fh;
ge.ConflictError = Oh;
ge.RateLimitError = Bh;
ge.BadRequestError = $h;
ge.AuthenticationError = Lh;
ge.InternalServerError = Gh;
ge.PermissionDeniedError = Uh;
ge.UnprocessableEntityError = qh;
ge.toFile = aI;
ge.Interactions = Yh;
ge.Webhooks = Qh;
function TI(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function SI(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function EI(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function wI(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function II(e, t, n) {
  const r = {};
  if (s(e, ["validationDataset"]) !== void 0) throw new Error("validationDataset parameter is not supported in Gemini API.");
  const o = s(e, ["tunedModelDisplayName"]);
  if (t !== void 0 && o != null && l(t, ["displayName"], o), s(e, ["description"]) !== void 0) throw new Error("description parameter is not supported in Gemini API.");
  const i = s(e, ["epochCount"]);
  t !== void 0 && i != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "epochCount"
  ], i);
  const a = s(e, ["learningRateMultiplier"]);
  if (a != null && l(r, [
    "tuningTask",
    "hyperparameters",
    "learningRateMultiplier"
  ], a), s(e, ["exportLastCheckpointOnly"]) !== void 0) throw new Error("exportLastCheckpointOnly parameter is not supported in Gemini API.");
  if (s(e, ["preTunedModelCheckpointId"]) !== void 0) throw new Error("preTunedModelCheckpointId parameter is not supported in Gemini API.");
  if (s(e, ["adapterSize"]) !== void 0) throw new Error("adapterSize parameter is not supported in Gemini API.");
  if (s(e, ["tuningMode"]) !== void 0) throw new Error("tuningMode parameter is not supported in Gemini API.");
  if (s(e, ["customBaseModel"]) !== void 0) throw new Error("customBaseModel parameter is not supported in Gemini API.");
  const u = s(e, ["batchSize"]);
  t !== void 0 && u != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "batchSize"
  ], u);
  const c = s(e, ["learningRate"]);
  if (t !== void 0 && c != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "learningRate"
  ], c), s(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  if (s(e, ["beta"]) !== void 0) throw new Error("beta parameter is not supported in Gemini API.");
  if (s(e, ["baseTeacherModel"]) !== void 0) throw new Error("baseTeacherModel parameter is not supported in Gemini API.");
  if (s(e, ["tunedTeacherModelSource"]) !== void 0) throw new Error("tunedTeacherModelSource parameter is not supported in Gemini API.");
  if (s(e, ["sftLossWeightMultiplier"]) !== void 0) throw new Error("sftLossWeightMultiplier parameter is not supported in Gemini API.");
  if (s(e, ["outputUri"]) !== void 0) throw new Error("outputUri parameter is not supported in Gemini API.");
  if (s(e, ["encryptionSpec"]) !== void 0) throw new Error("encryptionSpec parameter is not supported in Gemini API.");
  return r;
}
function CI(e, t, n) {
  const r = {};
  let o = s(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec"], is(S));
  } else if (o === "PREFERENCE_TUNING") {
    const S = s(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["preferenceOptimizationSpec"], is(S));
  } else if (o === "DISTILLATION") {
    const S = s(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["distillationSpec"], is(S));
  }
  const i = s(e, ["tunedModelDisplayName"]);
  t !== void 0 && i != null && l(t, ["tunedModelDisplayName"], i);
  const a = s(e, ["description"]);
  t !== void 0 && a != null && l(t, ["description"], a);
  let u = s(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["epochCount"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], S);
  } else if (u === "PREFERENCE_TUNING") {
    const S = s(e, ["epochCount"]);
    t !== void 0 && S != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], S);
  } else if (u === "DISTILLATION") {
    const S = s(e, ["epochCount"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], S);
  }
  let c = s(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["learningRateMultiplier"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], S);
  } else if (c === "PREFERENCE_TUNING") {
    const S = s(e, ["learningRateMultiplier"]);
    t !== void 0 && S != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], S);
  } else if (c === "DISTILLATION") {
    const S = s(e, ["learningRateMultiplier"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], S);
  }
  let d = s(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], S);
  } else if (d === "PREFERENCE_TUNING") {
    const S = s(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && S != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], S);
  } else if (d === "DISTILLATION") {
    const S = s(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && S != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], S);
  }
  let h = s(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  } else if (h === "PREFERENCE_TUNING") {
    const S = s(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  } else if (h === "DISTILLATION") {
    const S = s(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  }
  let f = s(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["tuningMode"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec", "tuningMode"], S);
  } else if (f === "DISTILLATION") {
    const S = s(e, ["tuningMode"]);
    t !== void 0 && S != null && l(t, ["distillationSpec", "tuningMode"], S);
  }
  const p = s(e, ["customBaseModel"]);
  t !== void 0 && p != null && l(t, ["customBaseModel"], p);
  let m = s(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["batchSize"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], S);
  } else if (m === "DISTILLATION") {
    const S = s(e, ["batchSize"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], S);
  }
  let y = s(n, ["config", "method"]);
  if (y === void 0 && (y = "SUPERVISED_FINE_TUNING"), y === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["learningRate"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], S);
  } else if (y === "DISTILLATION") {
    const S = s(e, ["learningRate"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], S);
  }
  const _ = s(e, ["labels"]);
  t !== void 0 && _ != null && l(t, ["labels"], _);
  const v = s(e, ["beta"]);
  t !== void 0 && v != null && l(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], v);
  const E = s(e, ["baseTeacherModel"]);
  t !== void 0 && E != null && l(t, ["distillationSpec", "baseTeacherModel"], E);
  const b = s(e, ["tunedTeacherModelSource"]);
  t !== void 0 && b != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], b);
  const R = s(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && R != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], R);
  const P = s(e, ["outputUri"]);
  t !== void 0 && P != null && l(t, ["outputUri"], P);
  const L = s(e, ["encryptionSpec"]);
  return t !== void 0 && L != null && l(t, ["encryptionSpec"], L), r;
}
function bI(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const i = s(e, ["trainingDataset"]);
  i != null && FI(i);
  const a = s(e, ["config"]);
  return a != null && II(a, n), n;
}
function PI(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const i = s(e, ["trainingDataset"]);
  i != null && OI(i, n, t);
  const a = s(e, ["config"]);
  return a != null && CI(a, n, t), n;
}
function RI(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function xI(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function MI(e, t, n) {
  const r = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function NI(e, t, n) {
  const r = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function kI(e, t) {
  const n = {}, r = s(e, ["config"]);
  return r != null && MI(r, n), n;
}
function DI(e, t) {
  const n = {}, r = s(e, ["config"]);
  return r != null && NI(r, n), n;
}
function $I(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["tunedModels"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => rp(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function LI(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["tuningJobs"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => Ks(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function UI(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["model"], r);
  const o = s(e, ["name"]);
  return o != null && l(n, ["endpoint"], o), n;
}
function FI(e, t) {
  const n = {};
  if (s(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (s(e, ["vertexDatasetResource"]) !== void 0) throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");
  const r = s(e, ["examples"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(n, ["examples", "examples"], o);
  }
  return n;
}
function OI(e, t, n) {
  const r = {};
  let o = s(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const a = s(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (o === "PREFERENCE_TUNING") {
    const a = s(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  } else if (o === "DISTILLATION") {
    const a = s(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["distillationSpec", "promptDatasetUri"], a);
  }
  let i = s(n, ["config", "method"]);
  if (i === void 0 && (i = "SUPERVISED_FINE_TUNING"), i === "SUPERVISED_FINE_TUNING") {
    const a = s(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (i === "PREFERENCE_TUNING") {
    const a = s(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  } else if (i === "DISTILLATION") {
    const a = s(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["distillationSpec", "promptDatasetUri"], a);
  }
  if (s(e, ["examples"]) !== void 0) throw new Error("examples parameter is not supported in Vertex AI.");
  return r;
}
function rp(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], fh(i));
  const a = s(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const u = s(e, ["tuningTask", "startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = s(e, ["tuningTask", "completeTime"]);
  c != null && l(n, ["endTime"], c);
  const d = s(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const h = s(e, ["description"]);
  h != null && l(n, ["description"], h);
  const f = s(e, ["baseModel"]);
  f != null && l(n, ["baseModel"], f);
  const p = s(e, ["_self"]);
  return p != null && l(n, ["tunedModel"], UI(p)), n;
}
function Ks(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], fh(i));
  const a = s(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const u = s(e, ["startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = s(e, ["endTime"]);
  c != null && l(n, ["endTime"], c);
  const d = s(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const h = s(e, ["error"]);
  h != null && l(n, ["error"], h);
  const f = s(e, ["description"]);
  f != null && l(n, ["description"], f);
  const p = s(e, ["baseModel"]);
  p != null && l(n, ["baseModel"], p);
  const m = s(e, ["tunedModel"]);
  m != null && l(n, ["tunedModel"], m);
  const y = s(e, ["preTunedModel"]);
  y != null && l(n, ["preTunedModel"], y);
  const _ = s(e, ["supervisedTuningSpec"]);
  _ != null && l(n, ["supervisedTuningSpec"], _);
  const v = s(e, ["preferenceOptimizationSpec"]);
  v != null && l(n, ["preferenceOptimizationSpec"], v);
  const E = s(e, ["distillationSpec"]);
  E != null && l(n, ["distillationSpec"], E);
  const b = s(e, ["tuningDataStats"]);
  b != null && l(n, ["tuningDataStats"], b);
  const R = s(e, ["encryptionSpec"]);
  R != null && l(n, ["encryptionSpec"], R);
  const P = s(e, ["partnerModelTuningSpec"]);
  P != null && l(n, ["partnerModelTuningSpec"], P);
  const L = s(e, ["customBaseModel"]);
  L != null && l(n, ["customBaseModel"], L);
  const S = s(e, ["evaluateDatasetRuns"]);
  if (S != null) {
    let _e = S;
    Array.isArray(_e) && (_e = _e.map((ie) => ie)), l(n, ["evaluateDatasetRuns"], _e);
  }
  const O = s(e, ["experiment"]);
  O != null && l(n, ["experiment"], O);
  const x = s(e, ["fullFineTuningSpec"]);
  x != null && l(n, ["fullFineTuningSpec"], x);
  const D = s(e, ["labels"]);
  D != null && l(n, ["labels"], D);
  const H = s(e, ["outputUri"]);
  H != null && l(n, ["outputUri"], H);
  const z = s(e, ["pipelineJob"]);
  z != null && l(n, ["pipelineJob"], z);
  const ye = s(e, ["serviceAccount"]);
  ye != null && l(n, ["serviceAccount"], ye);
  const Q = s(e, ["tunedModelDisplayName"]);
  Q != null && l(n, ["tunedModelDisplayName"], Q);
  const j = s(e, ["tuningJobState"]);
  j != null && l(n, ["tuningJobState"], j);
  const X = s(e, ["veoTuningSpec"]);
  X != null && l(n, ["veoTuningSpec"], X);
  const Se = s(e, ["distillationSamplingSpec"]);
  Se != null && l(n, ["distillationSamplingSpec"], Se);
  const Ye = s(e, ["tuningJobMetadata"]);
  return Ye != null && l(n, ["tuningJobMetadata"], Ye), n;
}
function qI(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = s(e, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = s(e, ["done"]);
  a != null && l(n, ["done"], a);
  const u = s(e, ["error"]);
  return u != null && l(n, ["error"], u), n;
}
function is(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["validationDatasetUri"], r);
  const o = s(e, ["vertexDatasetResource"]);
  return o != null && l(n, ["validationDatasetUri"], o), n;
}
var BI = class extends Ct {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new hn(It.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
      var n;
      if (this.apiClient.isVertexAI()) if (t.baseModel.startsWith("projects/")) {
        const r = { tunedModelName: t.baseModel };
        !((n = t.config) === null || n === void 0) && n.preTunedModelCheckpointId && (r.checkpointId = t.config.preTunedModelCheckpointId);
        const o = Object.assign(Object.assign({}, t), { preTunedModel: r });
        return o.baseModel = void 0, await this.tuneInternal(o);
      } else {
        const r = Object.assign({}, t);
        return await this.tuneInternal(r);
      }
      else {
        const r = Object.assign({}, t), o = await this.tuneMldevInternal(r);
        let i = "";
        return o.metadata !== void 0 && o.metadata.tunedModel !== void 0 ? i = o.metadata.tunedModel : o.name !== void 0 && o.name.includes("/operations/") && (i = o.name.split("/operations/")[0]), {
          name: i,
          state: Ms.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = xI(e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Ks(d));
    } else {
      const c = RI(e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => rp(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = DI(e);
      return a = $("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = LI(d), f = new vc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = kI(e);
      return a = $("tunedModels", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = $I(d), f = new vc();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = SI(e);
      return a = $("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = wI(d), f = new Ac();
        return Object.assign(f, h), f;
      });
    } else {
      const c = TI(e);
      return a = $("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = EI(d), f = new Ac();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = PI(e, e);
      return o = $("tuningJobs", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => Ks(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = bI(e);
      return o = $("tunedModels", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => qI(u));
    }
  }
}, GI = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, HI = 1024 * 1024 * 8, VI = 3, KI = 1e3, JI = 2, ui = "x-goog-upload-status";
async function WI(e, t, n, r) {
  var o;
  const i = await op(e, t, n, r), a = await i?.json();
  if (((o = i?.headers) === null || o === void 0 ? void 0 : o[ui]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function zI(e, t, n, r) {
  var o;
  const i = await op(e, t, n, r), a = await i?.json();
  if (((o = i?.headers) === null || o === void 0 ? void 0 : o[ui]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = rh(a), c = new lv();
  return Object.assign(c, u), c;
}
async function op(e, t, n, r) {
  var o, i, a;
  let u = t;
  const c = r?.baseUrl || ((o = n.clientOptions.httpOptions) === null || o === void 0 ? void 0 : o.baseUrl);
  if (c) {
    const m = new URL(c), y = new URL(t);
    y.protocol = m.protocol, y.host = m.host, y.port = m.port, u = y.toString();
  }
  let d = 0, h = 0, f = new ks(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(HI, d - h), y = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, v = KI;
    for (; _ < VI; ) {
      const E = Object.assign(Object.assign({}, r?.headers || {}), {
        "X-Goog-Upload-Command": p,
        "X-Goog-Upload-Offset": String(h),
        "Content-Length": String(m)
      });
      if (f = await n.request({
        path: "",
        body: y,
        httpMethod: "POST",
        httpOptions: Object.assign(Object.assign({}, r), {
          apiVersion: "",
          baseUrl: u,
          headers: E
        })
      }), !((i = f?.headers) === null || i === void 0) && i[ui]) break;
      _++, await XI(v), v = v * JI;
    }
    if (h += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[ui]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function YI(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function XI(e) {
  return new Promise((t) => setTimeout(t, e));
}
var QI = class {
  async upload(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await WI(e, t, n, r);
  }
  async uploadToFileSearchStore(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await zI(e, t, n, r);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await YI(e);
  }
}, ZI = class {
  create(e, t, n) {
    return new jI(e, t, n);
  }
}, jI = class {
  constructor(e, t, n) {
    this.url = e, this.headers = t, this.callbacks = n;
  }
  connect() {
    this.ws = new WebSocket(this.url), this.ws.onopen = this.callbacks.onopen, this.ws.onerror = this.callbacks.onerror, this.ws.onclose = this.callbacks.onclose, this.ws.onmessage = this.callbacks.onmessage;
  }
  send(e) {
    if (this.ws === void 0) throw new Error("WebSocket is not connected");
    this.ws.send(e);
  }
  close() {
    if (this.ws === void 0) throw new Error("WebSocket is not connected");
    this.ws.close();
  }
}, Yc = "x-goog-api-key", eC = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(Yc) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(Yc, this.apiKey);
    }
  }
}, tC = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new ge({
        baseURL: this.apiClient.getBaseUrl(),
        apiKey: this.apiKey,
        apiVersion: this.apiClient.getApiVersion(),
        clientAdapter: this.apiClient,
        defaultHeaders: this.apiClient.getDefaultHeaders(),
        timeout: n?.timeout,
        maxRetries: (e = n?.retryOptions) === null || e === void 0 ? void 0 : e.attempts
      });
    }
    return t?.extraBody && console.warn("GoogleGenAI.interactions: Client level httpOptions.extraBody is not supported by the interactions client and will be ignored."), this._nextGenClient;
  }
  get interactions() {
    return this._interactions !== void 0 ? this._interactions : (console.warn("GoogleGenAI.interactions: Interactions usage is experimental and may change in future versions."), this._interactions = this.getNextGenClient().interactions, this._interactions);
  }
  get webhooks() {
    return this._webhooks !== void 0 ? this._webhooks : (this._webhooks = this.getNextGenClient().webhooks, this._webhooks);
  }
  constructor(e) {
    var t;
    if (e.apiKey == null) throw new Error("An API Key must be set when running in a browser");
    if (e.project || e.location) throw new Error("Vertex AI project based authentication is not supported on browser runtimes. Please do not provide a project or location.");
    this.vertexai = (t = e.vertexai) !== null && t !== void 0 ? t : !1, this.apiKey = e.apiKey;
    const n = M_(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const r = new eC(this.apiKey);
    this.apiClient = new XE({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new QI(),
      downloader: new GI()
    }), this.models = new gw(this.apiClient), this.live = new cw(this.apiClient, r, new ZI()), this.batches = new dA(this.apiClient), this.chats = new YA(this.models, this.apiClient), this.caches = new JA(this.apiClient), this.files = new aT(this.apiClient), this.operations = new yw(this.apiClient), this.authTokens = new $w(this.apiClient), this.tunings = new BI(this.apiClient), this.fileSearchStores = new Hw(this.apiClient);
  }
};
function Xc(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function ci(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function sn(e) {
  return { text: String(e || "") };
}
function nC(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function rC(e) {
  if (typeof e == "string") return [sn(e)];
  if (!Array.isArray(e)) return [sn("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? sn(n.text || "") : n.type === "image_url" && n.image_url?.url ? nC(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [sn("")];
}
function Qc() {
  return {
    role: "user",
    parts: [sn("")]
  };
}
function so(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = ci(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function oC(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function iC(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function Zc(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const r = String(e.functionCall.id || "").trim();
  return r ? `id:${r}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function sC(e, t) {
  const n = e?.functionCall || {}, r = t?.functionCall || {}, o = n.args && typeof n.args == "object" && !Array.isArray(n.args) ? n.args : {}, i = r.args && typeof r.args == "object" && !Array.isArray(r.args) ? r.args : {};
  return {
    ...e,
    ...t,
    ...e?.thoughtSignature && !t?.thoughtSignature ? { thoughtSignature: e.thoughtSignature } : {},
    functionCall: {
      ...n,
      ...r,
      args: {
        ...o,
        ...i
      }
    }
  };
}
function aC(e = [], t = "") {
  const n = e.map((h) => so(h, "model")).filter(Boolean);
  if (!n.length) return null;
  const r = [...n].reverse().find((h) => oC(h)) || null, o = [...n].reverse().find((h) => iC(h)) || null, i = r || o || n[n.length - 1], a = n.indexOf(i), u = ci(i);
  if (!u?.parts?.length) return n[n.length - 1];
  if (o) {
    const h = /* @__PURE__ */ new Map(), f = [];
    n.forEach((m, y) => {
      m.parts.forEach((_, v) => {
        const E = Zc(_, v, y);
        if (!E) return;
        h.has(E) || f.push(E);
        const b = h.get(E);
        b ? h.set(E, sC(b, _)) : h.set(E, ci(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((m, y) => {
      const _ = Zc(m, y, a);
      return _ ? (p.add(_), h.get(_) || m) : m;
    }), f.forEach((m) => {
      p.has(m) || (u.parts.push(h.get(m)), p.add(m));
    });
  }
  const c = String(t || ""), d = u.parts.filter((h) => !(typeof h?.text == "string" && !h?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function jc(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((r) => !r?.thought && typeof r?.text == "string" && r.text).map((r) => r.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function ip(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((r) => r?.functionCall || r).filter((r) => r && r.name);
  return t.length ? t : n;
}
function sp(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function ed(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function lC(e, t) {
  const n = ed(e), r = ed(t);
  return n && r ? JSON.stringify({
    ...n,
    ...r
  }) : String(t || "").trim() || String(e || "{}");
}
function uC(e, t = "google-tool") {
  return ip(e).map((n, r) => {
    const o = String(n.id || "").trim();
    return {
      id: o || `${t}-${r + 1}`,
      name: n.name || "",
      arguments: sp(n),
      ...o ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function cC(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let r = 0;
  function o(a, u, c, d) {
    return a.name = String(u.name || a.name || "").trim(), a.arguments = lC(a.arguments, d), c && (n.set(c, a), a.id !== c ? a.providerId = c : delete a.providerId), a;
  }
  function i(a) {
    return ip(a).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), h = sp(u);
      let f = d ? n.get(d) : null;
      f ? o(f, u, d, h) : (f = {
        id: d || `${e}-${++r}`,
        name: c,
        arguments: h,
        ...d ? {} : { providerId: "" }
      }, t.push(f)), d && n.set(d, f);
    }), t.map((u) => ({ ...u }));
  }
  return { append: i };
}
function dC(e = []) {
  return {
    role: "user",
    parts: e.filter((t) => t && t.name).map((t) => {
      const n = Object.prototype.hasOwnProperty.call(t, "providerId") ? String(t.providerId || "").trim() : String(t.id || "").trim();
      return { functionResponse: {
        ...n ? { id: n } : {},
        name: t.name,
        response: t.response || {}
      } };
    })
  };
}
function fC(e) {
  switch (e) {
    case "minimal":
      return Nn.MINIMAL;
    case "high":
      return Nn.HIGH;
    case "medium":
      return Nn.MEDIUM;
    default:
      return Nn.LOW;
  }
}
function td(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function hC(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function pC(e) {
  const t = e?.providerPayload?.googleContent;
  return so(t, "model");
}
function mC(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = pC(e);
    return n ? [n] : [];
  }
  return t.map((n) => so(n, "model")).filter(Boolean);
}
function Da(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => so(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function gC(e) {
  const t = e?.candidates?.[0]?.content;
  return Da(t ? [t] : []);
}
function yC(e) {
  return Da(e ? [e] : []);
}
function ap(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? ci(e.history) || [] : [];
}
function _C(e, t = 0) {
  return ap(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => so(n, "model")).filter(Boolean);
}
function vC(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = [], o = (e || []).filter((a) => a.role === "user" || a.role === "assistant" || a.role === "tool");
  o.forEach((a) => {
    (a.tool_calls || []).forEach((u) => {
      u.id && u.function?.name && t.set(u.id, u.function.name), u.id && Object.prototype.hasOwnProperty.call(u, "providerToolCallId") && n.set(u.id, String(u.providerToolCallId || "").trim());
    });
  });
  for (let a = 0; a < o.length; a += 1) {
    const u = o[a];
    if (u.role === "tool") {
      const c = [];
      let d = a;
      for (; d < o.length && o[d].role === "tool"; ) {
        const h = o[d], f = String(h.tool_call_id || "").trim(), p = n.has(f) ? n.get(f) : f;
        c.push({ functionResponse: {
          ...p ? { id: p } : {},
          name: String(h.toolName || h.tool_name || "").trim() || t.get(f) || "tool_result",
          response: Xc(h.content)
        } }), d += 1;
      }
      r.push({
        role: "user",
        parts: c
      }), a = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = mC(u);
      if (c.length) {
        r.push(...c);
        continue;
      }
    }
    if (u.role === "assistant" && Array.isArray(u.tool_calls) && u.tool_calls.length) {
      r.push({
        role: "model",
        parts: [...u.content ? [sn(u.content)] : [], ...u.tool_calls.map((c) => ({ functionCall: {
          ...(() => {
            const d = Object.prototype.hasOwnProperty.call(c, "providerToolCallId") ? String(c.providerToolCallId || "").trim() : String(c.id || "").trim();
            return d ? { id: d } : {};
          })(),
          name: c.function.name,
          args: Xc(c.function.arguments)
        } }))]
      });
      continue;
    }
    r.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: rC(u.content)
    });
  }
  if (!r.length) return {
    history: [],
    latestMessage: Qc().parts
  };
  const i = r[r.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: r.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: r,
    latestMessage: Qc().parts
  };
}
function AC(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function nd(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var TC = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.toolCallResponseSequence = 0, this.client = new tC({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e) {
    const t = Ne("google", this.config, e.reasoning), n = vC(e.messages), r = Array.isArray(e.tools) ? e.tools : [], o = hC(e), i = {
      ...o ? { systemInstruction: o } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    if (t.mode === "off" ? i.thinkingConfig = {
      includeThoughts: !1,
      thinkingBudget: 0
    } : t.mode === "on" && t.profileId.startsWith("google-gemini-2.5-") ? i.thinkingConfig = {
      includeThoughts: Z(t),
      thinkingBudget: t.budgetTokens
    } : t.mode === "on" ? i.thinkingConfig = {
      includeThoughts: Z(t),
      thinkingLevel: fC(t.effort)
    } : Z(t) && (i.thinkingConfig = { includeThoughts: !0 }), r.length && (i.tools = [{ functionDeclarations: r.map((a) => ({
      name: a.function.name,
      description: a.function.description,
      parameters: a.function.parameters
    })) }]), r.length) {
      const a = String(e.toolChoice || "auto").trim();
      i.toolConfig = { functionCallingConfig: a === "none" ? { mode: Mn.NONE } : a === "auto" ? { mode: Mn.AUTO } : a === "required" ? { mode: Mn.ANY } : {
        mode: Mn.ANY,
        allowedFunctionNames: [a]
      } };
    }
    return {
      createPayload: {
        model: this.config.model,
        history: n.history,
        config: i
      },
      sendPayload: { message: n.latestMessage }
    };
  }
  inspectRequest(e, t = {}) {
    const n = t.payload || this.buildChatPayload(e), r = Ne("google", this.config, e.reasoning), o = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return Jr({
      provider: "google",
      model: this.config.model,
      transport: "google-genai-sdk",
      url: `${o}/models/${encodeURIComponent(this.config.model || "")}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.config.apiKey || ""
      },
      body: {
        chatCreate: n.createPayload,
        sendMessage: n.sendPayload,
        stream: typeof e.onStreamProgress == "function"
      },
      sdk: typeof e.onStreamProgress == "function" ? "client.chats.create(...).sendMessageStream" : "client.chats.create(...).sendMessage",
      effectiveConfig: qt(e, {
        profileId: r.profileId,
        effectiveMode: r.mode,
        effort: n.createPayload.config?.thinkingConfig?.thinkingLevel,
        budgetTokens: n.createPayload.config?.thinkingConfig?.thinkingBudget,
        controlFields: n.createPayload.config?.thinkingConfig ? { thinkingConfig: n.createPayload.config.thinkingConfig } : {}
      })
    });
  }
  inspectSendRequest(e, t) {
    const n = Ne("google", this.config, t.reasoning), r = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return Jr({
      provider: "google",
      model: this.config.model,
      transport: "google-genai-sdk",
      url: `${r}/models/${encodeURIComponent(this.config.model || "")}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.config.apiKey || ""
      },
      body: {
        sendMessage: e,
        stream: typeof t.onStreamProgress == "function"
      },
      sdk: typeof t.onStreamProgress == "function" ? "activeChat.sendMessageStream" : "activeChat.sendMessage",
      effectiveConfig: qt(t, {
        profileId: n.profileId,
        effectiveMode: n.mode,
        effort: this.sessionConfig?.thinkingConfig?.thinkingLevel,
        budgetTokens: this.sessionConfig?.thinkingConfig?.thinkingBudget,
        controlFields: this.sessionConfig?.thinkingConfig ? { thinkingConfig: this.sessionConfig.thinkingConfig } : {}
      })
    });
  }
  createChat(e) {
    const t = this.buildChatPayload(e);
    return {
      chat: this.client.chats.create(t.createPayload),
      sessionConfig: t.createPayload.config,
      sendPayload: t.sendPayload,
      requestInspection: this.inspectRequest(e, { payload: t })
    };
  }
  async sendThroughChat(e, t, n) {
    let r, o, i, a = [];
    const u = `google-tool-${++this.toolCallResponseSequence}`, c = cC(u);
    let d = null;
    const h = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, f = {
      ...t,
      ...h ? { config: h } : {}
    }, p = typeof n.onStreamProgress == "function", m = ap(e).length;
    if (p) {
      const v = await e.sendMessageStream(f), E = /* @__PURE__ */ new Map();
      let b = "", R = null;
      const P = [];
      for await (const L of v) {
        R = L;
        const S = L?.candidates?.[0]?.content;
        S?.parts?.length && P.push(S), Z(n.reasoning) && td(L).forEach((x, D) => {
          const H = `${x.label}:${D}`;
          E.set(H, nd(E.get(H) || "", x.text));
        }), a = c.append(L);
        const O = jc(L);
        b = nd(b, O), AC(n, {
          text: b,
          thoughts: Array.from(E.values()).filter(Boolean).map((x, D) => ({
            label: `思考块 ${D + 1}`,
            text: x
          })),
          ...a.length ? {
            toolCalls: a,
            toolCallDraft: !0
          } : {}
        });
      }
      r = {
        ...R || {},
        functionCalls: a
      }, d = aC(P, b) || r?.candidates?.[0]?.content || null, o = Array.from(E.values()).filter(Boolean).map((L, S) => ({
        label: `思考块 ${S + 1}`,
        text: L
      })), i = b;
    } else
      r = await e.sendMessage(f), o = Z(n.reasoning) ? td(r) : [], i = jc(r);
    const y = p ? a : uC(r, u), _ = _C(e, m);
    return {
      text: i,
      toolCalls: y,
      thoughts: o,
      finishReason: r.candidates?.[0]?.finishReason || "STOP",
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: Da(_) || yC(d) || gC(r)
    };
  }
  async chat(e) {
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: dC(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, r, e),
        requestInspection: this.inspectSendRequest(r, e)
      };
    }
    const t = String(e.finalAnswerReminderText || "").trim();
    if (t) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: [sn(t)] };
      return {
        ...await this.sendThroughChat(this.activeChat, r, e),
        requestInspection: this.inspectSendRequest(r, e)
      };
    }
    const n = this.createChat(e);
    return this.activeChat = n.chat, this.sessionConfig = n.sessionConfig, {
      ...await this.sendThroughChat(this.activeChat, n.sendPayload, e),
      requestInspection: n.requestInspection
    };
  }
};
function V(e, t, n, r, o) {
  if (r === "m") throw new TypeError("Private method is not writable");
  if (r === "a" && !o) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? o.call(e, n) : o ? o.value = n : t.set(e, n), n;
}
function I(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var lp = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return lp = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function Js(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ws = (e) => {
  if (e instanceof Error) return e;
  if (typeof e == "object" && e !== null) {
    try {
      if (Object.prototype.toString.call(e) === "[object Error]") {
        const t = new Error(e.message, e.cause ? { cause: e.cause } : {});
        return e.stack && (t.stack = e.stack), e.cause && !t.cause && (t.cause = e.cause), e.name && (t.name = e.name), t;
      }
    } catch {
    }
    try {
      return new Error(JSON.stringify(e));
    } catch {
    }
  }
  return new Error(e);
}, G = class extends Error {
}, be = class zs extends G {
  constructor(t, n, r, o) {
    super(`${zs.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new ki({
      message: r,
      cause: Ws(n)
    });
    const i = n?.error;
    return t === 400 ? new up(t, i, r, o) : t === 401 ? new cp(t, i, r, o) : t === 403 ? new dp(t, i, r, o) : t === 404 ? new fp(t, i, r, o) : t === 409 ? new hp(t, i, r, o) : t === 422 ? new pp(t, i, r, o) : t === 429 ? new mp(t, i, r, o) : t >= 500 ? new gp(t, i, r, o) : new zs(t, i, r, o);
  }
}, et = class extends be {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, ki = class extends be {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, $a = class extends ki {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, up = class extends be {
}, cp = class extends be {
}, dp = class extends be {
}, fp = class extends be {
}, hp = class extends be {
}, pp = class extends be {
}, mp = class extends be {
}, gp = class extends be {
}, yp = class extends G {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, _p = class extends G {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Cr = class extends Error {
  constructor(e) {
    super(e);
  }
}, vp = class extends be {
  constructor(e, t, n) {
    let r = "OAuth2 authentication error", o;
    if (t && typeof t == "object") {
      const i = t;
      o = i.error;
      const a = i.error_description;
      a && typeof a == "string" ? r = a : o && (r = o);
    }
    super(e, t, r, n), this.error_code = o;
  }
}, SC = class extends G {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, EC = /^[a-z][a-z0-9+.-]*:/i, wC = (e) => EC.test(e), De = (e) => (De = Array.isArray, De(e)), rd = De;
function La(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function od(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function IC(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function ss(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var CC = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new G(`${e} must be an integer`);
  if (t < 0) throw new G(`${e} must be a positive integer`);
  return t;
}, bC = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, ao = (e) => new Promise((t) => setTimeout(t, e)), Cn = "6.44.0", PC = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function RC() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var xC = () => {
  const e = RC();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Cn,
    "X-Stainless-OS": sd(Deno.build.os),
    "X-Stainless-Arch": id(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Cn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Cn,
    "X-Stainless-OS": sd(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": id(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = MC();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Cn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Cn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function MC() {
  if (typeof navigator > "u" || !navigator) return null;
  for (const { key: e, pattern: t } of [
    {
      key: "edge",
      pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "ie",
      pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "ie",
      pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "chrome",
      pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "firefox",
      pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/
    },
    {
      key: "safari",
      pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/
    }
  ]) {
    const n = t.exec(navigator.userAgent);
    if (n) return {
      browser: e,
      version: `${n[1] || 0}.${n[2] || 0}.${n[3] || 0}`
    };
  }
  return null;
}
var id = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", sd = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), ad, NC = () => ad ?? (ad = xC());
function Ap() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Tp(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Sp(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Tp({
    start() {
    },
    async pull(n) {
      const { done: r, value: o } = await t.next();
      r ? n.close() : n.enqueue(o);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function Ep(e) {
  if (e[Symbol.asyncIterator]) return e;
  const t = e.getReader();
  return {
    async next() {
      try {
        const n = await t.read();
        return n?.done && t.releaseLock(), n;
      } catch (n) {
        throw t.releaseLock(), n;
      }
    },
    async return() {
      const n = t.cancel();
      return t.releaseLock(), await n, {
        done: !0,
        value: void 0
      };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
async function ld(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var kC = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), wp = "RFC3986", Ip = (e) => String(e), ud = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Ip
};
var Ys = (e, t) => (Ys = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Ys(e, t)), ht = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), as = 1024, DC = (e, t, n, r, o) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < i.length; u += as) {
    const c = i.length >= as ? i.slice(u, u + as) : i, d = [];
    for (let h = 0; h < c.length; ++h) {
      let f = c.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || o === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(h);
        continue;
      }
      if (f < 128) {
        d[d.length] = ht[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = ht[192 | f >> 6] + ht[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = ht[224 | f >> 12] + ht[128 | f >> 6 & 63] + ht[128 | f & 63];
        continue;
      }
      h += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(h) & 1023), d[d.length] = ht[240 | f >> 18] + ht[128 | f >> 12 & 63] + ht[128 | f >> 6 & 63] + ht[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function $C(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function cd(e, t) {
  if (De(e)) {
    const n = [];
    for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
    return n;
  }
  return t(e);
}
var Cp = {
  brackets(e) {
    return String(e) + "[]";
  },
  comma: "comma",
  indices(e, t) {
    return String(e) + "[" + t + "]";
  },
  repeat(e) {
    return String(e);
  }
}, bp = function(e, t) {
  Array.prototype.push.apply(e, De(t) ? t : [t]);
}, dd, me = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: DC,
  encodeValuesOnly: !1,
  format: wp,
  formatter: Ip,
  indices: !1,
  serializeDate(e) {
    return (dd ?? (dd = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function LC(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var ls = {};
function Pp(e, t, n, r, o, i, a, u, c, d, h, f, p, m, y, _, v, E) {
  let b = e, R = E, P = 0, L = !1;
  for (; (R = R.get(ls)) !== void 0 && !L; ) {
    const H = R.get(e);
    if (P += 1, typeof H < "u") {
      if (H === P) throw new RangeError("Cyclic object value");
      L = !0;
    }
    typeof R.get(ls) > "u" && (P = 0);
  }
  if (typeof d == "function" ? b = d(t, b) : b instanceof Date ? b = p?.(b) : n === "comma" && De(b) && (b = cd(b, function(H) {
    return H instanceof Date ? p?.(H) : H;
  })), b === null) {
    if (i) return c && !_ ? c(t, me.encoder, v, "key", m) : t;
    b = "";
  }
  if (LC(b) || $C(b)) {
    if (c) {
      const H = _ ? t : c(t, me.encoder, v, "key", m);
      return [y?.(H) + "=" + y?.(c(b, me.encoder, v, "value", m))];
    }
    return [y?.(t) + "=" + y?.(String(b))];
  }
  const S = [];
  if (typeof b > "u") return S;
  let O;
  if (n === "comma" && De(b))
    _ && c && (b = cd(b, c)), O = [{ value: b.length > 0 ? b.join(",") || null : void 0 }];
  else if (De(d)) O = d;
  else {
    const H = Object.keys(b);
    O = h ? H.sort(h) : H;
  }
  const x = u ? String(t).replace(/\./g, "%2E") : String(t), D = r && De(b) && b.length === 1 ? x + "[]" : x;
  if (o && De(b) && b.length === 0) return D + "[]";
  for (let H = 0; H < O.length; ++H) {
    const z = O[H], ye = typeof z == "object" && typeof z.value < "u" ? z.value : b[z];
    if (a && ye === null) continue;
    const Q = f && u ? z.replace(/\./g, "%2E") : z, j = De(b) ? typeof n == "function" ? n(D, Q) : D : D + (f ? "." + Q : "[" + Q + "]");
    E.set(e, P);
    const X = /* @__PURE__ */ new WeakMap();
    X.set(ls, E), bp(S, Pp(ye, j, n, r, o, i, a, u, n === "comma" && _ && De(b) ? null : c, d, h, f, p, m, y, _, v, X));
  }
  return S;
}
function UC(e = me) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || me.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = wp;
  if (typeof e.format < "u") {
    if (!Ys(ud, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const r = ud[n];
  let o = me.filter;
  (typeof e.filter == "function" || De(e.filter)) && (o = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in Cp ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = me.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : me.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : me.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : me.allowEmptyArrays,
    arrayFormat: i,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : me.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? me.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : me.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : me.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : me.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : me.encodeValuesOnly,
    filter: o,
    format: n,
    formatter: r,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : me.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : me.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : me.strictNullHandling
  };
}
function FC(e, t = {}) {
  let n = e;
  const r = UC(t);
  let o, i;
  typeof r.filter == "function" ? (i = r.filter, n = i("", n)) : De(r.filter) && (i = r.filter, o = i);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = Cp[r.arrayFormat], c = u === "comma" && r.commaRoundTrip;
  o || (o = Object.keys(n)), r.sort && o.sort(r.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < o.length; ++p) {
    const m = o[p];
    r.skipNulls && n[m] === null || bp(a, Pp(n[m], m, u, c, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, d));
  }
  const h = a.join(r.delimiter);
  let f = r.addQueryPrefix === !0 ? "?" : "";
  return r.charsetSentinel && (r.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function OC(e) {
  return FC(e, { arrayFormat: "brackets" });
}
function qC(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var fd;
function Ua(e) {
  let t;
  return (fd ?? (t = new globalThis.TextEncoder(), fd = t.encode.bind(t)))(e);
}
var hd;
function pd(e) {
  let t;
  return (hd ?? (t = new globalThis.TextDecoder(), hd = t.decode.bind(t)))(e);
}
var Be, Ge, Di = class {
  constructor() {
    Be.set(this, void 0), Ge.set(this, void 0), V(this, Be, new Uint8Array(), "f"), V(this, Ge, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Ua(e) : e;
    V(this, Be, qC([I(this, Be, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = BC(I(this, Be, "f"), I(this, Ge, "f"))) != null; ) {
      if (r.carriage && I(this, Ge, "f") == null) {
        V(this, Ge, r.index, "f");
        continue;
      }
      if (I(this, Ge, "f") != null && (r.index !== I(this, Ge, "f") + 1 || r.carriage)) {
        n.push(pd(I(this, Be, "f").subarray(0, I(this, Ge, "f") - 1))), V(this, Be, I(this, Be, "f").subarray(I(this, Ge, "f")), "f"), V(this, Ge, null, "f");
        continue;
      }
      const o = I(this, Ge, "f") !== null ? r.preceding - 1 : r.preceding, i = pd(I(this, Be, "f").subarray(0, o));
      n.push(i), V(this, Be, I(this, Be, "f").subarray(r.index), "f"), V(this, Ge, null, "f");
    }
    return n;
  }
  flush() {
    return I(this, Be, "f").length ? this.decode(`
`) : [];
  }
};
Be = /* @__PURE__ */ new WeakMap(), Ge = /* @__PURE__ */ new WeakMap();
Di.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Di.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function BC(e, t) {
  for (let o = t ?? 0; o < e.length; o++) {
    if (e[o] === 10) return {
      preceding: o,
      index: o + 1,
      carriage: !1
    };
    if (e[o] === 13) return {
      preceding: o,
      index: o + 1,
      carriage: !0
    };
  }
  return null;
}
function GC(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var di = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, md = (e, t, n) => {
  if (e) {
    if (IC(di, e)) return e;
    we(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(di))}`);
  }
};
function br() {
}
function Do(e, t, n) {
  return !t || di[e] > di[n] ? br : t[e].bind(t);
}
var HC = {
  error: br,
  warn: br,
  info: br,
  debug: br
}, gd = /* @__PURE__ */ new WeakMap();
function we(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return HC;
  const r = gd.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: Do("error", t, n),
    warn: Do("warn", t, n),
    info: Do("info", t, n),
    debug: Do("debug", t, n)
  };
  return gd.set(t, [n, o]), o;
}
var jt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), _r, Wr = class Pr {
  constructor(t, n, r) {
    this.iterator = t, _r.set(this, void 0), this.controller = n, V(this, _r, r, "f");
  }
  static fromSSEResponse(t, n, r, o) {
    let i = !1;
    const a = r ? we(r) : console;
    async function* u() {
      if (i) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of VC(t, n))
          if (!c) {
            if (d.data.startsWith("[DONE]")) {
              c = !0;
              continue;
            }
            if (d.event === null || !d.event.startsWith("thread.")) {
              let h;
              try {
                h = JSON.parse(d.data);
              } catch (f) {
                throw a.error("Could not parse message into JSON:", d.data), a.error("From chunk:", d.raw), f;
              }
              if (h && h.error) throw new be(void 0, h.error, void 0, t.headers);
              yield o ? {
                event: d.event,
                data: h
              } : h;
            } else {
              let h;
              try {
                h = JSON.parse(d.data);
              } catch (f) {
                throw console.error("Could not parse message into JSON:", d.data), console.error("From chunk:", d.raw), f;
              }
              if (d.event == "error") throw new be(void 0, h.error, h.message, void 0);
              yield {
                event: d.event,
                data: h
              };
            }
          }
        c = !0;
      } catch (d) {
        if (Js(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Pr(u, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* i() {
      const u = new Di(), c = Ep(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (o) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Js(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Pr(a, n, r);
  }
  [(_r = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), o = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = r.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new Pr(() => o(t), this.controller, I(this, _r, "f")), new Pr(() => o(n), this.controller, I(this, _r, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Tp({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = Ua(JSON.stringify(o) + `
`);
          r.enqueue(a);
        } catch (o) {
          r.error(o);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* VC(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
  const n = new JC(), r = new Di(), o = Ep(e.body);
  for await (const i of KC(o)) for (const a of r.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of r.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* KC(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Ua(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let i;
    for (; (i = GC(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var JC = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const o = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], o;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, r] = WC(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function WC(e, t) {
  const n = e.indexOf(t);
  return n !== -1 ? [
    e.substring(0, n),
    t,
    e.substring(n + t.length)
  ] : [
    e,
    "",
    ""
  ];
}
async function Rp(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return we(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : Wr.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : xp(await n.json(), n) : await n.text();
  })();
  return we(e).debug(`[${r}] response parsed`, jt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function xp(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Rr, Mp = class Np extends Promise {
  constructor(t, n, r = Rp) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, Rr.set(this, void 0), V(this, Rr, t, "f");
  }
  _thenUnwrap(t) {
    return new Np(I(this, Rr, "f"), this.responsePromise, async (n, r) => xp(t(await this.parseResponse(n, r), r), r.response));
  }
  asResponse() {
    return this.responsePromise.then((t) => t.response);
  }
  async withResponse() {
    const [t, n] = await Promise.all([this.parse(), this.asResponse()]);
    return {
      data: t,
      response: n,
      request_id: n.headers.get("x-request-id")
    };
  }
  parse() {
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(I(this, Rr, "f"), t))), this.parsedPromise;
  }
  then(t, n) {
    return this.parse().then(t, n);
  }
  catch(t) {
    return this.parse().catch(t);
  }
  finally(t) {
    return this.parse().finally(t);
  }
};
Rr = /* @__PURE__ */ new WeakMap();
var $o, $i = class {
  constructor(e, t, n, r) {
    $o.set(this, void 0), V(this, $o, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new G("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await I(this, $o, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[($o = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, zC = class extends Mp {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await Rp(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Bt = class extends $i {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, ne = class extends $i {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.has_more = n.has_more || !1;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    return this.has_more === !1 ? !1 : super.hasNextPage();
  }
  nextPageRequestOptions() {
    const e = this.getPaginatedItems(), t = e[e.length - 1]?.id;
    return t ? {
      ...this.options,
      query: {
        ...La(this.options.query),
        after: t
      }
    } : null;
  }
}, Ce = class extends $i {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.has_more = n.has_more || !1, this.last_id = n.last_id || "";
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    return this.has_more === !1 ? !1 : super.hasNextPage();
  }
  nextPageRequestOptions() {
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...La(this.options.query),
        after: e
      }
    } : null;
  }
}, Pt = class extends $i {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.has_more = n.has_more || !1, this.next = n.next || null;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    return this.has_more === !1 ? !1 : super.hasNextPage();
  }
  nextPageRequestOptions() {
    const e = this.next;
    return e ? {
      ...this.options,
      query: {
        ...La(this.options.query),
        after: e
      }
    } : null;
  }
}, YC = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, XC = "urn:ietf:params:oauth:grant-type:token-exchange", QC = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Ap();
  }
  async getToken() {
    if (!this.cachedToken || this.isTokenExpired(this.cachedToken)) {
      if (this.refreshPromise) return await this.refreshPromise;
      this.refreshPromise = this.refreshToken();
      try {
        return await this.refreshPromise;
      } finally {
        this.refreshPromise = null;
      }
    }
    return this.needsRefresh(this.cachedToken) && !this.refreshPromise && (this.refreshPromise = this.refreshToken().finally(() => {
      this.refreshPromise = null;
    })), this.cachedToken.token;
  }
  async refreshToken() {
    const e = {
      grant_type: XC,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: YC[this.config.provider.tokenType],
      identity_provider_id: this.config.identityProviderId,
      service_account_id: this.config.serviceAccountId
    };
    this.config.clientId && (e.client_id = this.config.clientId);
    const t = await this.fetch(this.tokenExchangeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(e)
    });
    if (!t.ok) {
      const i = await t.text();
      let a;
      try {
        a = JSON.parse(i);
      } catch {
      }
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new vp(t.status, a, t.headers) : be.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
    }
    const n = await t.json(), r = n.expires_in || 3600, o = Date.now() + r * 1e3;
    return this.cachedToken = {
      token: n.access_token,
      expiresAt: o
    }, n.access_token;
  }
  isTokenExpired(e) {
    return Date.now() >= e.expiresAt;
  }
  needsRefresh(e) {
    const t = (this.config.refreshBufferSeconds ?? 1200) * 1e3;
    return Date.now() >= e.expiresAt - t;
  }
  invalidateToken() {
    this.cachedToken = null, this.refreshPromise = null;
  }
}, kp = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Or(e, t, n) {
  return kp(), new File(e, t ?? "unknown_file", n);
}
function zo(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Fa = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Li = async (e, t) => Xs(e.body) ? {
  ...e,
  body: await Dp(e.body, t)
} : e, mt = async (e, t) => ({
  ...e,
  body: await Dp(e.body, t)
}), yd = /* @__PURE__ */ new WeakMap();
function ZC(e) {
  const t = typeof e == "function" ? e : e.fetch, n = yd.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new o(i).text();
    } catch {
      return !0;
    }
  })();
  return yd.set(t, r), r;
}
var Dp = async (e, t) => {
  if (!await ZC(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, o]) => Qs(n, r, o))), n;
}, $p = (e) => e instanceof Blob && "name" in e, jC = (e) => typeof e == "object" && e !== null && (e instanceof Response || Fa(e) || $p(e)), Xs = (e) => {
  if (jC(e)) return !0;
  if (Array.isArray(e)) return e.some(Xs);
  if (e && typeof e == "object") {
    for (const t in e) if (Xs(e[t])) return !0;
  }
  return !1;
}, Qs = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, Or([await n.blob()], zo(n)));
    else if (Fa(n)) e.append(t, Or([await new Response(Sp(n)).blob()], zo(n)));
    else if ($p(n)) e.append(t, n, zo(n));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Qs(e, t + "[]", r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, o]) => Qs(e, `${t}[${r}]`, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Lp = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", eb = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Lp(e), tb = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function nb(e, t, n) {
  if (kp(), e = await e, eb(e))
    return e instanceof File ? e : Or([await e.arrayBuffer()], e.name);
  if (tb(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Or(await Zs(o), t, n);
  }
  const r = await Zs(e);
  if (t || (t = zo(e)), !n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return Or(r, t, n);
}
async function Zs(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Lp(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Fa(e)) for await (const n of e) t.push(...await Zs(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${rb(e)}`);
  }
  return t;
}
function rb(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var k = class {
  constructor(e) {
    this._client = e;
  }
};
function Up(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var _d = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), ob = (e = Up) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let y = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? _d) ?? _d)?.toString) && (y = m + "", i.push({
      start: h.length + f.length,
      length: y.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : y);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) i.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (i.sort((h, f) => h.start - f.start), i.length > 0) {
    let h = 0;
    const f = i.reduce((p, m) => {
      const y = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + y + _;
    }, "");
    throw new G(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, T = /* @__PURE__ */ ob(Up), Fp = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/chat/completions/${e}/messages`, ne, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function fi(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Oa(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function lo(e) {
  return e?.$brand === "auto-parseable-tool";
}
function ib(e, t) {
  return !t || !Op(t) ? {
    ...e,
    choices: e.choices.map((n) => (qp(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : qa(e, t);
}
function qa(e, t) {
  const n = e.choices.map((r) => {
    if (r.finish_reason === "length") throw new yp();
    if (r.finish_reason === "content_filter") throw new _p();
    return qp(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        ...r.message.tool_calls ? { tool_calls: r.message.tool_calls?.map((o) => ab(t, o)) ?? void 0 } : void 0,
        parsed: r.message.content && !r.message.refusal ? sb(t, r.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function sb(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function ab(e, t) {
  const n = e.tools?.find((r) => fi(r) && r.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: lo(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function lb(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((r) => fi(r) && r.function?.name === t.function.name);
  return fi(n) && (lo(n) || n?.function.strict || !1);
}
function Op(e) {
  return Oa(e.response_format) ? !0 : e.tools?.some((t) => lo(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function qp(e) {
  for (const t of e || []) if (t.type !== "function") throw new G(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function ub(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new G(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new G(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var hi = (e) => e?.role === "assistant", Bp = (e) => e?.role === "tool", js, Yo, Xo, xr, Mr, Qo, Nr, At, kr, pi, mi, bn, Gp, Ba = class {
  constructor() {
    js.add(this), this.controller = new AbortController(), Yo.set(this, void 0), Xo.set(this, () => {
    }), xr.set(this, () => {
    }), Mr.set(this, void 0), Qo.set(this, () => {
    }), Nr.set(this, () => {
    }), At.set(this, {}), kr.set(this, !1), pi.set(this, !1), mi.set(this, !1), bn.set(this, !1), V(this, Yo, new Promise((e, t) => {
      V(this, Xo, e, "f"), V(this, xr, t, "f");
    }), "f"), V(this, Mr, new Promise((e, t) => {
      V(this, Qo, e, "f"), V(this, Nr, t, "f");
    }), "f"), I(this, Yo, "f").catch(() => {
    }), I(this, Mr, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, I(this, js, "m", Gp).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (I(this, Xo, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return I(this, kr, "f");
  }
  get errored() {
    return I(this, pi, "f");
  }
  get aborted() {
    return I(this, mi, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (I(this, At, "f")[e] || (I(this, At, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = I(this, At, "f")[e];
    if (!n) return this;
    const r = n.findIndex((o) => o.listener === t);
    return r >= 0 && n.splice(r, 1), this;
  }
  once(e, t) {
    return (I(this, At, "f")[e] || (I(this, At, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      V(this, bn, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    V(this, bn, !0, "f"), await I(this, Mr, "f");
  }
  _emit(e, ...t) {
    if (I(this, kr, "f")) return;
    e === "end" && (V(this, kr, !0, "f"), I(this, Qo, "f").call(this));
    const n = I(this, At, "f")[e];
    if (n && (I(this, At, "f")[e] = n.filter((r) => !r.once), n.forEach(({ listener: r }) => r(...t))), e === "abort") {
      const r = t[0];
      !I(this, bn, "f") && !n?.length && Promise.reject(r), I(this, xr, "f").call(this, r), I(this, Nr, "f").call(this, r), this._emit("end");
      return;
    }
    if (e === "error") {
      const r = t[0];
      !I(this, bn, "f") && !n?.length && Promise.reject(r), I(this, xr, "f").call(this, r), I(this, Nr, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
Yo = /* @__PURE__ */ new WeakMap(), Xo = /* @__PURE__ */ new WeakMap(), xr = /* @__PURE__ */ new WeakMap(), Mr = /* @__PURE__ */ new WeakMap(), Qo = /* @__PURE__ */ new WeakMap(), Nr = /* @__PURE__ */ new WeakMap(), At = /* @__PURE__ */ new WeakMap(), kr = /* @__PURE__ */ new WeakMap(), pi = /* @__PURE__ */ new WeakMap(), mi = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakMap(), js = /* @__PURE__ */ new WeakSet(), Gp = function(t) {
  if (V(this, pi, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new et()), t instanceof et)
    return V(this, mi, !0, "f"), this._emit("abort", t);
  if (t instanceof G) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new G(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new G(String(t)));
};
function cb(e) {
  return typeof e.parse == "function";
}
var Pe, ea, gi, ta, na, ra, Hp, Vp, db = 10, Kp = class extends Ba {
  constructor() {
    super(...arguments), Pe.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), Bp(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (hi(e) && e.tool_calls)
        for (const n of e.tool_calls) n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e) throw new G("stream ended without producing a ChatCompletion");
    return e;
  }
  async finalContent() {
    return await this.done(), I(this, Pe, "m", ea).call(this);
  }
  async finalMessage() {
    return await this.done(), I(this, Pe, "m", gi).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), I(this, Pe, "m", ta).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), I(this, Pe, "m", na).call(this);
  }
  async totalUsage() {
    return await this.done(), I(this, Pe, "m", ra).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = I(this, Pe, "m", gi).call(this);
    t && this._emit("finalMessage", t);
    const n = I(this, Pe, "m", ea).call(this);
    n && this._emit("finalContent", n);
    const r = I(this, Pe, "m", ta).call(this);
    r && this._emit("finalFunctionToolCall", r);
    const o = I(this, Pe, "m", na).call(this);
    o != null && this._emit("finalFunctionToolCallResult", o), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", I(this, Pe, "m", ra).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), I(this, Pe, "m", Hp).call(this, t);
    const o = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(qa(o, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const r of t.messages) this._addMessage(r, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const r = "tool", { tool_choice: o = "auto", stream: i, ...a } = t, u = typeof o != "string" && o.type === "function" && o?.function?.name, { maxChatCompletions: c = db } = n || {}, d = t.tools.map((p) => {
      if (lo(p)) {
        if (!p.$callback) throw new G("Tool given to `.runTools()` that does not have an associated function");
        return {
          type: "function",
          function: {
            function: p.$callback,
            name: p.function.name,
            description: p.function.description || "",
            parameters: p.function.parameters,
            parse: p.$parseRaw,
            strict: !0
          }
        };
      }
      return p;
    }), h = {};
    for (const p of d) p.type === "function" && (h[p.function.name || p.function.function.name] = p.function);
    const f = "tools" in t ? d.map((p) => p.type === "function" ? {
      type: "function",
      function: {
        name: p.function.name || p.function.function.name,
        parameters: p.function.parameters,
        description: p.function.description,
        strict: p.function.strict
      }
    } : p) : void 0;
    for (const p of t.messages) this._addMessage(p, !1);
    for (let p = 0; p < c; ++p) {
      const m = (await this._createChatCompletion(e, {
        ...a,
        tool_choice: o,
        tools: f,
        messages: [...this.messages]
      }, n)).choices[0]?.message;
      if (!m) throw new G("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const y of m.tool_calls) {
        if (y.type !== "function") continue;
        const _ = y.id, { name: v, arguments: E } = y.function, b = h[v];
        if (b) {
          if (u && u !== v) {
            const S = `Invalid tool_call: ${JSON.stringify(v)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: r,
              tool_call_id: _,
              content: S
            });
            continue;
          }
        } else {
          const S = `Invalid tool_call: ${JSON.stringify(v)}. Available options are: ${Object.keys(h).map((O) => JSON.stringify(O)).join(", ")}. Please try again`;
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: S
          });
          continue;
        }
        let R;
        try {
          R = cb(b) ? await b.parse(E) : E;
        } catch (S) {
          const O = S instanceof Error ? S.message : String(S);
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: O
          });
          continue;
        }
        const P = await b.function(R, this), L = I(this, Pe, "m", Vp).call(this, P);
        if (this._addMessage({
          role: r,
          tool_call_id: _,
          content: L
        }), u) return;
      }
    }
  }
};
Pe = /* @__PURE__ */ new WeakSet(), ea = function() {
  return I(this, Pe, "m", gi).call(this).content ?? null;
}, gi = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (hi(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new G("stream ended without producing a ChatCompletionMessage with role=assistant");
}, ta = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (hi(n) && n?.tool_calls?.length) for (let r = n.tool_calls.length - 1; r >= 0; r--) {
      const o = n.tool_calls[r];
      if (o?.type === "function") return o.function;
    }
  }
}, na = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Bp(n) && n.content != null && typeof n.content == "string" && this.messages.some((r) => r.role === "assistant" && r.tool_calls?.some((o) => o.type === "function" && o.id === n.tool_call_id))) return n.content;
  }
}, ra = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, Hp = function(t) {
  if (t.n != null && t.n > 1) throw new G("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, Vp = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var fb = class Jp extends Kp {
  static runTools(t, n, r) {
    const o = new Jp(), i = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, i)), o;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), hi(t) && t.content && this._emit("content", t.content);
  }
}, Ae = {
  STR: 1,
  NUM: 2,
  ARR: 4,
  OBJ: 8,
  NULL: 16,
  BOOL: 32,
  NAN: 64,
  INFINITY: 128,
  MINUS_INFINITY: 256,
  INF: 384,
  SPECIAL: 496,
  ATOM: 499,
  COLLECTION: 12,
  ALL: 511
}, hb = class extends Error {
}, pb = class extends Error {
};
function mb(e, t = Ae.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return gb(e.trim(), t);
}
var gb = (e, t) => {
  const n = e.length;
  let r = 0;
  const o = (p) => {
    throw new hb(`${p} at position ${r}`);
  }, i = (p) => {
    throw new pb(`${p} at position ${r}`);
  }, a = () => (f(), r >= n && o("Unexpected end of input"), e[r] === '"' ? u() : e[r] === "{" ? c() : e[r] === "[" ? d() : e.substring(r, r + 4) === "null" || Ae.NULL & t && n - r < 4 && "null".startsWith(e.substring(r)) ? (r += 4, null) : e.substring(r, r + 4) === "true" || Ae.BOOL & t && n - r < 4 && "true".startsWith(e.substring(r)) ? (r += 4, !0) : e.substring(r, r + 5) === "false" || Ae.BOOL & t && n - r < 5 && "false".startsWith(e.substring(r)) ? (r += 5, !1) : e.substring(r, r + 8) === "Infinity" || Ae.INFINITY & t && n - r < 8 && "Infinity".startsWith(e.substring(r)) ? (r += 8, 1 / 0) : e.substring(r, r + 9) === "-Infinity" || Ae.MINUS_INFINITY & t && 1 < n - r && n - r < 9 && "-Infinity".startsWith(e.substring(r)) ? (r += 9, -1 / 0) : e.substring(r, r + 3) === "NaN" || Ae.NAN & t && n - r < 3 && "NaN".startsWith(e.substring(r)) ? (r += 3, NaN) : h()), u = () => {
    const p = r;
    let m = !1;
    for (r++; r < n && (e[r] !== '"' || m && e[r - 1] === "\\"); )
      m = e[r] === "\\" ? !m : !1, r++;
    if (e.charAt(r) == '"') try {
      return JSON.parse(e.substring(p, ++r - Number(m)));
    } catch (y) {
      i(String(y));
    }
    else if (Ae.STR & t) try {
      return JSON.parse(e.substring(p, r - Number(m)) + '"');
    } catch {
      return JSON.parse(e.substring(p, e.lastIndexOf("\\")) + '"');
    }
    o("Unterminated string literal");
  }, c = () => {
    r++, f();
    const p = {};
    try {
      for (; e[r] !== "}"; ) {
        if (f(), r >= n && Ae.OBJ & t) return p;
        const m = u();
        f(), r++;
        try {
          const y = a();
          Object.defineProperty(p, m, {
            value: y,
            writable: !0,
            enumerable: !0,
            configurable: !0
          });
        } catch (y) {
          if (Ae.OBJ & t) return p;
          throw y;
        }
        f(), e[r] === "," && r++;
      }
    } catch {
      if (Ae.OBJ & t) return p;
      o("Expected '}' at end of object");
    }
    return r++, p;
  }, d = () => {
    r++;
    const p = [];
    try {
      for (; e[r] !== "]"; )
        p.push(a()), f(), e[r] === "," && r++;
    } catch {
      if (Ae.ARR & t) return p;
      o("Expected ']' at end of array");
    }
    return r++, p;
  }, h = () => {
    if (r === 0) {
      e === "-" && Ae.NUM & t && o("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (Ae.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        i(String(m));
      }
    }
    const p = r;
    for (e[r] === "-" && r++; e[r] && !",]}".includes(e[r]); ) r++;
    r == n && !(Ae.NUM & t) && o("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, r));
    } catch {
      e.substring(p, r) === "-" && Ae.NUM & t && o("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(p, e.lastIndexOf("e")));
      } catch (y) {
        i(String(y));
      }
    }
  }, f = () => {
    for (; r < n && [
      32,
      10,
      13,
      9
    ].includes(e.charCodeAt(r)); ) r++;
  };
  return a();
}, vd = (e) => mb(e, Ae.ALL ^ Ae.NUM), he, vt, Tn, Dt, us, Lo, cs, ds, fs, Uo, hs, Ad, Wp = class oa extends Kp {
  constructor(t) {
    super(), he.add(this), vt.set(this, void 0), Tn.set(this, void 0), Dt.set(this, void 0), V(this, vt, t, "f"), V(this, Tn, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return I(this, Dt, "f");
  }
  static fromReadableStream(t) {
    const n = new oa(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, r) {
    const o = new oa(n);
    return o._run(() => o._runChatCompletion(t, {
      ...n,
      stream: !0
    }, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  async _createChatCompletion(t, n, r) {
    super._createChatCompletion;
    const o = r?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), I(this, he, "m", us).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) I(this, he, "m", cs).call(this, a);
    if (i.controller.signal?.aborted) throw new et();
    return this._addChatCompletion(I(this, he, "m", Uo).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), I(this, he, "m", us).call(this), this._connected();
    const o = Wr.fromReadableStream(t, this.controller);
    let i;
    for await (const a of o)
      i && i !== a.id && this._addChatCompletion(I(this, he, "m", Uo).call(this)), I(this, he, "m", cs).call(this, a), i = a.id;
    if (o.controller.signal?.aborted) throw new et();
    return this._addChatCompletion(I(this, he, "m", Uo).call(this));
  }
  [(vt = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), Dt = /* @__PURE__ */ new WeakMap(), he = /* @__PURE__ */ new WeakSet(), us = function() {
    this.ended || V(this, Dt, void 0, "f");
  }, Lo = function(n) {
    let r = I(this, Tn, "f")[n.index];
    return r || (r = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, I(this, Tn, "f")[n.index] = r, r);
  }, cs = function(n) {
    if (this.ended) return;
    const r = I(this, he, "m", Ad).call(this, n);
    this._emit("chunk", n, r);
    for (const o of n.choices) {
      const i = r.choices[o.index];
      o.delta.content != null && i.message?.role === "assistant" && i.message?.content && (this._emit("content", o.delta.content, i.message.content), this._emit("content.delta", {
        delta: o.delta.content,
        snapshot: i.message.content,
        parsed: i.message.parsed
      })), o.delta.refusal != null && i.message?.role === "assistant" && i.message?.refusal && this._emit("refusal.delta", {
        delta: o.delta.refusal,
        snapshot: i.message.refusal
      }), o.logprobs?.content != null && i.message?.role === "assistant" && this._emit("logprobs.content.delta", {
        content: o.logprobs?.content,
        snapshot: i.logprobs?.content ?? []
      }), o.logprobs?.refusal != null && i.message?.role === "assistant" && this._emit("logprobs.refusal.delta", {
        refusal: o.logprobs?.refusal,
        snapshot: i.logprobs?.refusal ?? []
      });
      const a = I(this, he, "m", Lo).call(this, i);
      i.finish_reason && (I(this, he, "m", fs).call(this, i), a.current_tool_call_index != null && I(this, he, "m", ds).call(this, i, a.current_tool_call_index));
      for (const u of o.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (I(this, he, "m", fs).call(this, i), a.current_tool_call_index != null && I(this, he, "m", ds).call(this, i, a.current_tool_call_index)), a.current_tool_call_index = u.index;
      for (const u of o.delta.tool_calls ?? []) {
        const c = i.message.tool_calls?.[u.index];
        c?.type && (c?.type === "function" ? this._emit("tool_calls.function.arguments.delta", {
          name: c.function?.name,
          index: u.index,
          arguments: c.function.arguments,
          parsed_arguments: c.function.parsed_arguments,
          arguments_delta: u.function?.arguments ?? ""
        }) : c?.type);
      }
    }
  }, ds = function(n, r) {
    if (I(this, he, "m", Lo).call(this, n).done_tool_calls.has(r)) return;
    const o = n.message.tool_calls?.[r];
    if (!o) throw new Error("no tool call snapshot");
    if (!o.type) throw new Error("tool call snapshot missing `type`");
    if (o.type === "function") {
      const i = I(this, vt, "f")?.tools?.find((a) => fi(a) && a.function.name === o.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: o.function.name,
        index: r,
        arguments: o.function.arguments,
        parsed_arguments: lo(i) ? i.$parseRaw(o.function.arguments) : i?.function.strict ? JSON.parse(o.function.arguments) : null
      });
    } else o.type;
  }, fs = function(n) {
    const r = I(this, he, "m", Lo).call(this, n);
    if (n.message.content && !r.content_done) {
      r.content_done = !0;
      const o = I(this, he, "m", hs).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: o ? o.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !r.refusal_done && (r.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !r.logprobs_content_done && (r.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !r.logprobs_refusal_done && (r.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Uo = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = I(this, Dt, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return V(this, Dt, void 0, "f"), V(this, Tn, [], "f"), yb(n, I(this, vt, "f"));
  }, hs = function() {
    const n = I(this, vt, "f")?.response_format;
    return Oa(n) ? n : null;
  }, Ad = function(n) {
    var r, o, i, a;
    let u = I(this, Dt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = V(this, Dt, {
      ...d,
      choices: []
    }, "f");
    for (const { delta: h, finish_reason: f, index: p, logprobs: m = null, ...y } of n.choices) {
      let _ = u.choices[p];
      if (_ || (_ = u.choices[p] = {
        finish_reason: f,
        index: p,
        message: {},
        logprobs: m,
        ...y
      }), m) if (!_.logprobs) _.logprobs = Object.assign({}, m);
      else {
        const { content: S, refusal: O, ...x } = m;
        Object.assign(_.logprobs, x), S && ((r = _.logprobs).content ?? (r.content = []), _.logprobs.content.push(...S)), O && ((o = _.logprobs).refusal ?? (o.refusal = []), _.logprobs.refusal.push(...O));
      }
      if (f && (_.finish_reason = f, I(this, vt, "f") && Op(I(this, vt, "f")))) {
        if (f === "length") throw new yp();
        if (f === "content_filter") throw new _p();
      }
      if (Object.assign(_, y), !h) continue;
      const { content: v, refusal: E, function_call: b, role: R, tool_calls: P, ...L } = h;
      if (Object.assign(_.message, L), E && (_.message.refusal = (_.message.refusal || "") + E), R && (_.message.role = R), b && (_.message.function_call ? (b.name && (_.message.function_call.name = b.name), b.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += b.arguments)) : _.message.function_call = b), v && (_.message.content = (_.message.content || "") + v, !_.message.refusal && I(this, he, "m", hs).call(this) && (_.message.parsed = vd(_.message.content))), P) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: S, id: O, type: x, function: D, ...H } of P) {
          const z = (a = _.message.tool_calls)[S] ?? (a[S] = {});
          Object.assign(z, H), O && (z.id = O), x && (z.type = x), D && (z.function ?? (z.function = {
            name: D.name ?? "",
            arguments: ""
          })), D?.name && (z.function.name = D.name), D?.arguments && (z.function.arguments += D.arguments, lb(I(this, vt, "f"), z) && (z.function.parsed_arguments = vd(z.function.arguments)));
        }
      }
    }
    return u;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let r = !1;
    return this.on("chunk", (o) => {
      const i = n.shift();
      i ? i.resolve(o) : t.push(o);
    }), this.on("end", () => {
      r = !0;
      for (const o of n) o.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), this.on("error", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((o, i) => n.push({
        resolve: o,
        reject: i
      })).then((o) => o ? {
        value: o,
        done: !1
      } : {
        value: void 0,
        done: !0
      }),
      return: async () => (this.abort(), {
        value: void 0,
        done: !0
      })
    };
  }
  toReadableStream() {
    return new Wr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function yb(e, t) {
  const { id: n, choices: r, created: o, model: i, system_fingerprint: a, ...u } = e;
  return ib({
    ...u,
    id: n,
    choices: r.map(({ message: c, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new G(`missing finish_reason for choice ${h}`);
      const { content: m = null, function_call: y, tool_calls: _, ...v } = c, E = c.role;
      if (!E) throw new G(`missing role for choice ${h}`);
      if (y) {
        const { arguments: b, name: R } = y;
        if (b == null) throw new G(`missing function_call.arguments for choice ${h}`);
        if (!R) throw new G(`missing function_call.name for choice ${h}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: b,
              name: R
            },
            role: E,
            refusal: c.refusal ?? null
          },
          finish_reason: d,
          index: h,
          logprobs: f
        };
      }
      return _ ? {
        ...p,
        index: h,
        finish_reason: d,
        logprobs: f,
        message: {
          ...v,
          role: E,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: _.map((b, R) => {
            const { function: P, type: L, id: S, ...O } = b, { arguments: x, name: D, ...H } = P || {};
            if (S == null) throw new G(`missing choices[${h}].tool_calls[${R}].id
${Fo(e)}`);
            if (L == null) throw new G(`missing choices[${h}].tool_calls[${R}].type
${Fo(e)}`);
            if (D == null) throw new G(`missing choices[${h}].tool_calls[${R}].function.name
${Fo(e)}`);
            if (x == null) throw new G(`missing choices[${h}].tool_calls[${R}].function.arguments
${Fo(e)}`);
            return {
              ...O,
              id: S,
              type: L,
              function: {
                ...H,
                name: D,
                arguments: x
              }
            };
          })
        }
      } : {
        ...p,
        message: {
          ...v,
          content: m,
          role: E,
          refusal: c.refusal ?? null
        },
        finish_reason: d,
        index: h,
        logprobs: f
      };
    }),
    created: o,
    model: i,
    object: "chat.completion",
    ...a ? { system_fingerprint: a } : {}
  }, t);
}
function Fo(e) {
  return JSON.stringify(e);
}
var _b = class ia extends Wp {
  static fromReadableStream(t) {
    const n = new ia(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, r) {
    const o = new ia(n), i = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, i)), o;
  }
}, Ga = class extends k {
  constructor() {
    super(...arguments), this.messages = new Fp(this._client);
  }
  create(e, t) {
    return this._client.post("/chat/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/chat/completions/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/chat/completions/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chat/completions", ne, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/chat/completions/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return ub(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => qa(n, e));
  }
  runTools(e, t) {
    return e.stream ? _b.runTools(this._client, e, t) : fb.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Wp.createChatCompletion(this._client, e, t);
  }
};
Ga.Messages = Fp;
var Ha = class extends k {
  constructor() {
    super(...arguments), this.completions = new Ga(this._client);
  }
};
Ha.Completions = Ga;
var zp = class extends k {
  create(e, t) {
    return this._client.post("/organization/admin_api_keys", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/admin_api_keys/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/admin_api_keys", ne, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/admin_api_keys/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Yp = class extends k {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", Ce, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Xp = class extends k {
  create(e, t) {
    return this._client.post("/organization/certificates", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(T`/organization/certificates/${e}`, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/certificates/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/certificates", Ce, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/certificates/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t) {
    return this._client.getAPIList("/organization/certificates/activate", Bt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", Bt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Qp = class extends k {
  retrieve(e) {
    return this._client.get("/organization/data_retention", {
      ...e,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t) {
    return this._client.post("/organization/data_retention", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Zp = class extends k {
  create(e, t) {
    return this._client.post("/organization/invites", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/invites/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/invites", Ce, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/invites/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, jp = class extends k {
  create(e, t) {
    return this._client.post("/organization/roles", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/roles/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/roles/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/roles", Pt, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/roles/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, em = class extends k {
  create(e, t) {
    return this._client.post("/organization/spend_alerts", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/spend_alerts/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/spend_alerts/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/spend_alerts", Ce, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/spend_alerts/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, tm = class extends k {
  audioSpeeches(e, t) {
    return this._client.get("/organization/usage/audio_speeches", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  audioTranscriptions(e, t) {
    return this._client.get("/organization/usage/audio_transcriptions", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  codeInterpreterSessions(e, t) {
    return this._client.get("/organization/usage/code_interpreter_sessions", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  completions(e, t) {
    return this._client.get("/organization/usage/completions", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  costs(e, t) {
    return this._client.get("/organization/costs", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  embeddings(e, t) {
    return this._client.get("/organization/usage/embeddings", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  fileSearchCalls(e, t) {
    return this._client.get("/organization/usage/file_search_calls", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  images(e, t) {
    return this._client.get("/organization/usage/images", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  moderations(e, t) {
    return this._client.get("/organization/usage/moderations", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  vectorStores(e, t) {
    return this._client.get("/organization/usage/vector_stores", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  webSearchCalls(e, t) {
    return this._client.get("/organization/usage/web_search_calls", {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, nm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/organization/groups/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { group_id: r } = t;
    return this._client.get(T`/organization/groups/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/groups/${e}/roles`, Pt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { group_id: r } = t;
    return this._client.delete(T`/organization/groups/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, rm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/organization/groups/${e}/users`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { group_id: r } = t;
    return this._client.get(T`/organization/groups/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/groups/${e}/users`, Pt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { group_id: r } = t;
    return this._client.delete(T`/organization/groups/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ui = class extends k {
  constructor() {
    super(...arguments), this.users = new rm(this._client), this.roles = new nm(this._client);
  }
  create(e, t) {
    return this._client.post("/organization/groups", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/groups/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/groups/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/groups", Pt, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/groups/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Ui.Users = rm;
Ui.Roles = nm;
var om = class extends k {
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(T`/organization/projects/${r}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/api_keys`, Ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(T`/organization/projects/${r}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, im = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/certificates`, Ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/certificates/activate`, Bt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/certificates/deactivate`, Bt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, sm = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/organization/projects/${e}/data_retention`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/data_retention`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, am = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/organization/projects/${e}/hosted_tool_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/hosted_tool_permissions`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, lm = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/organization/projects/${e}/model_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/model_permissions`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/projects/${e}/model_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, um = class extends k {
  listRateLimits(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/rate_limits`, Ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  updateRateLimit(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/organization/projects/${r}/rate_limits/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, cm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/projects/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(T`/projects/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/projects/${r}/roles/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/projects/${e}/roles`, Pt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(T`/projects/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, dm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/service_accounts`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(T`/organization/projects/${r}/service_accounts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/organization/projects/${r}/service_accounts/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/service_accounts`, Ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(T`/organization/projects/${r}/service_accounts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, fm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/spend_alerts`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(T`/organization/projects/${r}/spend_alerts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/organization/projects/${r}/spend_alerts/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/spend_alerts`, Ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(T`/organization/projects/${r}/spend_alerts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, hm = class extends k {
  create(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/projects/${r}/groups/${e}/roles`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r, group_id: o } = t;
    return this._client.get(T`/projects/${r}/groups/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.getAPIList(T`/projects/${r}/groups/${e}/roles`, Pt, {
      query: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r, group_id: o } = t;
    return this._client.delete(T`/projects/${r}/groups/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Va = class extends k {
  constructor() {
    super(...arguments), this.roles = new hm(this._client);
  }
  create(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/groups`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.get(T`/organization/projects/${r}/groups/${e}`, {
      query: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/groups`, Pt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(T`/organization/projects/${r}/groups/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Va.Roles = hm;
var pm = class extends k {
  create(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/projects/${r}/users/${e}/roles`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r, user_id: o } = t;
    return this._client.get(T`/projects/${r}/users/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.getAPIList(T`/projects/${r}/users/${e}/roles`, Pt, {
      query: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r, user_id: o } = t;
    return this._client.delete(T`/projects/${r}/users/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ka = class extends k {
  constructor() {
    super(...arguments), this.roles = new pm(this._client);
  }
  create(e, t, n) {
    return this._client.post(T`/organization/projects/${e}/users`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(T`/organization/projects/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(T`/organization/projects/${r}/users/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/users`, Ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(T`/organization/projects/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Ka.Roles = pm;
var We = class extends k {
  constructor() {
    super(...arguments), this.users = new Ka(this._client), this.serviceAccounts = new dm(this._client), this.apiKeys = new om(this._client), this.rateLimits = new um(this._client), this.modelPermissions = new lm(this._client), this.hostedToolPermissions = new am(this._client), this.groups = new Va(this._client), this.roles = new cm(this._client), this.dataRetention = new sm(this._client), this.spendAlerts = new fm(this._client), this.certificates = new im(this._client);
  }
  create(e, t) {
    return this._client.post("/organization/projects", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/projects/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/projects/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/projects", Ce, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  archive(e, t) {
    return this._client.post(T`/organization/projects/${e}/archive`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
We.Users = Ka;
We.ServiceAccounts = dm;
We.APIKeys = om;
We.RateLimits = um;
We.ModelPermissions = lm;
We.HostedToolPermissions = am;
We.Groups = Va;
We.Roles = cm;
We.DataRetention = sm;
We.SpendAlerts = fm;
We.Certificates = im;
var mm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/organization/users/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { user_id: r } = t;
    return this._client.get(T`/organization/users/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/users/${e}/roles`, Pt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { user_id: r } = t;
    return this._client.delete(T`/organization/users/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ja = class extends k {
  constructor() {
    super(...arguments), this.roles = new mm(this._client);
  }
  retrieve(e, t) {
    return this._client.get(T`/organization/users/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/organization/users/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/users", Ce, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/organization/users/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Ja.Roles = mm;
var ze = class extends k {
  constructor() {
    super(...arguments), this.auditLogs = new Yp(this._client), this.adminAPIKeys = new zp(this._client), this.usage = new tm(this._client), this.invites = new Zp(this._client), this.users = new Ja(this._client), this.groups = new Ui(this._client), this.roles = new jp(this._client), this.dataRetention = new Qp(this._client), this.spendAlerts = new em(this._client), this.certificates = new Xp(this._client), this.projects = new We(this._client);
  }
};
ze.AuditLogs = Yp;
ze.AdminAPIKeys = zp;
ze.Usage = tm;
ze.Invites = Zp;
ze.Users = Ja;
ze.Groups = Ui;
ze.Roles = jp;
ze.DataRetention = Qp;
ze.SpendAlerts = em;
ze.Certificates = Xp;
ze.Projects = We;
var Wa = class extends k {
  constructor() {
    super(...arguments), this.organization = new ze(this._client);
  }
};
Wa.Organization = ze;
var gm = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* vb(e) {
  if (!e) return;
  if (gm in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : rd(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = rd(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var F = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of vb(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [gm]: !0,
    values: t,
    nulls: n
  };
}, ym = class extends k {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: F([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, _m = class extends k {
  create(e, t) {
    return this._client.post("/audio/transcriptions", mt({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, vm = class extends k {
  create(e, t) {
    return this._client.post("/audio/translations", mt({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, uo = class extends k {
  constructor() {
    super(...arguments), this.transcriptions = new _m(this._client), this.translations = new vm(this._client), this.speech = new ym(this._client);
  }
};
uo.Transcriptions = _m;
uo.Translations = vm;
uo.Speech = ym;
var Am = class extends k {
  create(e, t) {
    return this._client.post("/batches", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/batches/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/batches", ne, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(T`/batches/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Tm = class extends k {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/assistants/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/assistants/${e}`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", ne, {
      query: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/assistants/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Sm = class extends k {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Em = class extends k {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Fi = class extends k {
  constructor() {
    super(...arguments), this.sessions = new Sm(this._client), this.transcriptionSessions = new Em(this._client);
  }
};
Fi.Sessions = Sm;
Fi.TranscriptionSessions = Em;
var wm = class extends k {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(T`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Im = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/chatkit/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", Ce, {
      query: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/chatkit/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(T`/chatkit/threads/${e}/items`, Ce, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Oi = class extends k {
  constructor() {
    super(...arguments), this.sessions = new wm(this._client), this.threads = new Im(this._client);
  }
};
Oi.Sessions = wm;
Oi.Threads = Im;
var Cm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(T`/threads/${r}/messages/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(T`/threads/${r}/messages/${e}`, {
      body: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/threads/${e}/messages`, ne, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { thread_id: r } = t;
    return this._client.delete(T`/threads/${r}/messages/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, bm = class extends k {
  retrieve(e, t, n) {
    const { thread_id: r, run_id: o, ...i } = t;
    return this._client.get(T`/threads/${r}/runs/${o}/steps/${e}`, {
      query: i,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.getAPIList(T`/threads/${r}/runs/${e}/steps`, ne, {
      query: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Ab = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, r = new Uint8Array(n);
    for (let o = 0; o < n; o++) r[o] = t.charCodeAt(o);
    return Array.from(new Float32Array(r.buffer));
  }
}, $t = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Ie, an, sa, pt, Zo, it, ln, Dn, tn, yi, He, jo, ei, qr, Dr, $r, Td, Sd, Ed, wd, Id, Cd, bd, Br = class extends Ba {
  constructor() {
    super(...arguments), Ie.add(this), sa.set(this, []), pt.set(this, {}), Zo.set(this, {}), it.set(this, void 0), ln.set(this, void 0), Dn.set(this, void 0), tn.set(this, void 0), yi.set(this, void 0), He.set(this, void 0), jo.set(this, void 0), ei.set(this, void 0), qr.set(this, void 0);
  }
  [(sa = /* @__PURE__ */ new WeakMap(), pt = /* @__PURE__ */ new WeakMap(), Zo = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), ln = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap(), tn = /* @__PURE__ */ new WeakMap(), yi = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ new WeakMap(), jo = /* @__PURE__ */ new WeakMap(), ei = /* @__PURE__ */ new WeakMap(), qr = /* @__PURE__ */ new WeakMap(), Ie = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const e = [], t = [];
    let n = !1;
    return this.on("event", (r) => {
      const o = t.shift();
      o ? o.resolve(r) : e.push(r);
    }), this.on("end", () => {
      n = !0;
      for (const r of t) r.resolve(void 0);
      t.length = 0;
    }), this.on("abort", (r) => {
      n = !0;
      for (const o of t) o.reject(r);
      t.length = 0;
    }), this.on("error", (r) => {
      n = !0;
      for (const o of t) o.reject(r);
      t.length = 0;
    }), {
      next: async () => e.length ? {
        value: e.shift(),
        done: !1
      } : n ? {
        value: void 0,
        done: !0
      } : new Promise((r, o) => t.push({
        resolve: r,
        reject: o
      })).then((r) => r ? {
        value: r,
        done: !1
      } : {
        value: void 0,
        done: !0
      }),
      return: async () => (this.abort(), {
        value: void 0,
        done: !0
      })
    };
  }
  static fromReadableStream(e) {
    const t = new an();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const r = Wr.fromReadableStream(e, this.controller);
    for await (const o of r) I(this, Ie, "m", Dr).call(this, o);
    if (r.controller.signal?.aborted) throw new et();
    return this._addRun(I(this, Ie, "m", $r).call(this));
  }
  toReadableStream() {
    return new Wr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, r) {
    const o = new an();
    return o._run(() => o._runToolAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  async _createToolAssistantStream(e, t, n, r) {
    const o = r?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...n,
      stream: !0
    }, a = await e.submitToolOutputs(t, i, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) I(this, Ie, "m", Dr).call(this, u);
    if (a.controller.signal?.aborted) throw new et();
    return this._addRun(I(this, Ie, "m", $r).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const r = new an();
    return r._run(() => r._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  static createAssistantStream(e, t, n, r) {
    const o = new an();
    return o._run(() => o._runAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  currentEvent() {
    return I(this, jo, "f");
  }
  currentRun() {
    return I(this, ei, "f");
  }
  currentMessageSnapshot() {
    return I(this, it, "f");
  }
  currentRunStepSnapshot() {
    return I(this, qr, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(I(this, pt, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(I(this, Zo, "f"));
  }
  async finalRun() {
    if (await this.done(), !I(this, ln, "f")) throw Error("Final run was not received.");
    return I(this, ln, "f");
  }
  async _createThreadAssistantStream(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort()));
    const o = {
      ...t,
      stream: !0
    }, i = await e.createAndRun(o, {
      ...n,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) I(this, Ie, "m", Dr).call(this, a);
    if (i.controller.signal?.aborted) throw new et();
    return this._addRun(I(this, Ie, "m", $r).call(this));
  }
  async _createAssistantStream(e, t, n, r) {
    const o = r?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...n,
      stream: !0
    }, a = await e.create(t, i, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) I(this, Ie, "m", Dr).call(this, u);
    if (a.controller.signal?.aborted) throw new et();
    return this._addRun(I(this, Ie, "m", $r).call(this));
  }
  static accumulateDelta(e, t) {
    for (const [n, r] of Object.entries(t)) {
      if (!e.hasOwnProperty(n)) {
        e[n] = r;
        continue;
      }
      let o = e[n];
      if (o == null) {
        e[n] = r;
        continue;
      }
      if (n === "index" || n === "type") {
        e[n] = r;
        continue;
      }
      if (typeof o == "string" && typeof r == "string") o += r;
      else if (typeof o == "number" && typeof r == "number") o += r;
      else if (ss(o) && ss(r)) o = this.accumulateDelta(o, r);
      else if (Array.isArray(o) && Array.isArray(r)) {
        if (o.every((i) => typeof i == "string" || typeof i == "number")) {
          o.push(...r);
          continue;
        }
        for (const i of r) {
          if (!ss(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
          const a = i.index;
          if (a == null)
            throw console.error(i), new Error("Expected array delta entry to have an `index` property");
          if (typeof a != "number") throw new Error(`Expected array delta entry \`index\` property to be a number but got ${a}`);
          const u = o[a];
          u == null ? o.push(i) : o[a] = this.accumulateDelta(u, i);
        }
        continue;
      } else throw Error(`Unhandled record type: ${n}, deltaValue: ${r}, accValue: ${o}`);
      e[n] = o;
    }
    return e;
  }
  _addRun(e) {
    return e;
  }
  async _threadAssistantStream(e, t, n) {
    return await this._createThreadAssistantStream(t, e, n);
  }
  async _runAssistantStream(e, t, n, r) {
    return await this._createAssistantStream(t, e, n, r);
  }
  async _runToolAssistantStream(e, t, n, r) {
    return await this._createToolAssistantStream(t, e, n, r);
  }
};
an = Br, Dr = function(t) {
  if (!this.ended)
    switch (V(this, jo, t, "f"), I(this, Ie, "m", Ed).call(this, t), t.event) {
      case "thread.created":
        break;
      case "thread.run.created":
      case "thread.run.queued":
      case "thread.run.in_progress":
      case "thread.run.requires_action":
      case "thread.run.completed":
      case "thread.run.incomplete":
      case "thread.run.failed":
      case "thread.run.cancelling":
      case "thread.run.cancelled":
      case "thread.run.expired":
        I(this, Ie, "m", bd).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        I(this, Ie, "m", Sd).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        I(this, Ie, "m", Td).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, $r = function() {
  if (this.ended) throw new G("stream has ended, this shouldn't happen");
  if (!I(this, ln, "f")) throw Error("Final run has not been received");
  return I(this, ln, "f");
}, Td = function(t) {
  const [n, r] = I(this, Ie, "m", Id).call(this, t, I(this, it, "f"));
  V(this, it, n, "f"), I(this, Zo, "f")[n.id] = n;
  for (const o of r) {
    const i = n.content[o.index];
    i?.type == "text" && this._emit("textCreated", i.text);
  }
  switch (t.event) {
    case "thread.message.created":
      this._emit("messageCreated", t.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      if (this._emit("messageDelta", t.data.delta, n), t.data.delta.content) for (const o of t.data.delta.content) {
        if (o.type == "text" && o.text) {
          let i = o.text, a = n.content[o.index];
          if (a && a.type == "text") this._emit("textDelta", i, a.text);
          else throw Error("The snapshot associated with this text delta is not text or missing");
        }
        if (o.index != I(this, Dn, "f")) {
          if (I(this, tn, "f")) switch (I(this, tn, "f").type) {
            case "text":
              this._emit("textDone", I(this, tn, "f").text, I(this, it, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", I(this, tn, "f").image_file, I(this, it, "f"));
              break;
          }
          V(this, Dn, o.index, "f");
        }
        V(this, tn, n.content[o.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (I(this, Dn, "f") !== void 0) {
        const o = t.data.content[I(this, Dn, "f")];
        if (o) switch (o.type) {
          case "image_file":
            this._emit("imageFileDone", o.image_file, I(this, it, "f"));
            break;
          case "text":
            this._emit("textDone", o.text, I(this, it, "f"));
            break;
        }
      }
      I(this, it, "f") && this._emit("messageDone", t.data), V(this, it, void 0, "f");
  }
}, Sd = function(t) {
  const n = I(this, Ie, "m", wd).call(this, t);
  switch (V(this, qr, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const r = t.data.delta;
      if (r.step_details && r.step_details.type == "tool_calls" && r.step_details.tool_calls && n.step_details.type == "tool_calls") for (const o of r.step_details.tool_calls) o.index == I(this, yi, "f") ? this._emit("toolCallDelta", o, n.step_details.tool_calls[o.index]) : (I(this, He, "f") && this._emit("toolCallDone", I(this, He, "f")), V(this, yi, o.index, "f"), V(this, He, n.step_details.tool_calls[o.index], "f"), I(this, He, "f") && this._emit("toolCallCreated", I(this, He, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      V(this, qr, void 0, "f"), t.data.step_details.type == "tool_calls" && I(this, He, "f") && (this._emit("toolCallDone", I(this, He, "f")), V(this, He, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Ed = function(t) {
  I(this, sa, "f").push(t), this._emit("event", t);
}, wd = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return I(this, pt, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = I(this, pt, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let r = t.data;
      if (r.delta) {
        const o = an.accumulateDelta(n, r.delta);
        I(this, pt, "f")[t.data.id] = o;
      }
      return I(this, pt, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      I(this, pt, "f")[t.data.id] = t.data;
      break;
  }
  if (I(this, pt, "f")[t.data.id]) return I(this, pt, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Id = function(t, n) {
  let r = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, r];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let o = t.data;
      if (o.delta.content) for (const i of o.delta.content) if (i.index in n.content) {
        let a = n.content[i.index];
        n.content[i.index] = I(this, Ie, "m", Cd).call(this, i, a);
      } else
        n.content[i.index] = i, r.push(i);
      return [n, r];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (n) return [n, r];
      throw Error("Received thread message event with no existing snapshot");
  }
  throw Error("Tried to accumulate a non-message event");
}, Cd = function(t, n) {
  return an.accumulateDelta(n, t);
}, bd = function(t) {
  switch (V(this, ei, t.data, "f"), t.event) {
    case "thread.run.created":
      break;
    case "thread.run.queued":
      break;
    case "thread.run.in_progress":
      break;
    case "thread.run.requires_action":
    case "thread.run.cancelled":
    case "thread.run.failed":
    case "thread.run.completed":
    case "thread.run.expired":
    case "thread.run.incomplete":
      V(this, ln, t.data, "f"), I(this, He, "f") && (this._emit("toolCallDone", I(this, He, "f")), V(this, He, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var za = class extends k {
  constructor() {
    super(...arguments), this.steps = new bm(this._client);
  }
  create(e, t, n) {
    const { include: r, ...o } = t;
    return this._client.post(T`/threads/${e}/runs`, {
      query: { include: r },
      body: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(T`/threads/${r}/runs/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(T`/threads/${r}/runs/${e}`, {
      body: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/threads/${e}/runs`, ne, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { thread_id: r } = t;
    return this._client.post(T`/threads/${r}/runs/${e}/cancel`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(r.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return Br.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const r = F([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: o, response: i } = await this.retrieve(e, t, {
        ...n,
        headers: {
          ...n?.headers,
          ...r
        }
      }).withResponse();
      switch (o.status) {
        case "queued":
        case "in_progress":
        case "cancelling":
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = i.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await ao(a);
          break;
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return o;
      }
    }
  }
  stream(e, t, n) {
    return Br.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(T`/threads/${r}/runs/${e}/submit_tool_outputs`, {
      body: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  async submitToolOutputsAndPoll(e, t, n) {
    const r = await this.submitToolOutputs(e, t, n);
    return await this.poll(r.id, t, n);
  }
  submitToolOutputsStream(e, t, n) {
    return Br.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
za.Steps = bm;
var qi = class extends k {
  constructor() {
    super(...arguments), this.runs = new za(this._client), this.messages = new Cm(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/threads/${e}`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      stream: e.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  async createAndRunPoll(e, t) {
    const n = await this.createAndRun(e, t);
    return await this.runs.poll(n.id, { thread_id: n.thread_id }, t);
  }
  createAndRunStream(e, t) {
    return Br.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
qi.Runs = za;
qi.Messages = Cm;
var Yn = class extends k {
  constructor() {
    super(...arguments), this.realtime = new Fi(this._client), this.chatkit = new Oi(this._client), this.assistants = new Tm(this._client), this.threads = new qi(this._client);
  }
};
Yn.Realtime = Fi;
Yn.ChatKit = Oi;
Yn.Assistants = Tm;
Yn.Threads = qi;
var Pm = class extends k {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, Rm = class extends k {
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(T`/containers/${r}/files/${e}/content`, {
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Ya = class extends k {
  constructor() {
    super(...arguments), this.content = new Rm(this._client);
  }
  create(e, t, n) {
    return this._client.post(T`/containers/${e}/files`, Li({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(T`/containers/${r}/files/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/containers/${e}/files`, ne, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { container_id: r } = t;
    return this._client.delete(T`/containers/${r}/files/${e}`, {
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Ya.Content = Rm;
var Xa = class extends k {
  constructor() {
    super(...arguments), this.files = new Ya(this._client);
  }
  create(e, t) {
    return this._client.post("/containers", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/containers/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", ne, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/containers/${e}`, {
      ...t,
      headers: F([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Xa.Files = Ya;
var xm = class extends k {
  create(e, t, n) {
    const { include: r, ...o } = t;
    return this._client.post(T`/conversations/${e}/items`, {
      query: { include: r },
      body: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: r, ...o } = t;
    return this._client.get(T`/conversations/${r}/items/${e}`, {
      query: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/conversations/${e}/items`, Ce, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { conversation_id: r } = t;
    return this._client.delete(T`/conversations/${r}/items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Qa = class extends k {
  constructor() {
    super(...arguments), this.items = new xm(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/conversations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/conversations/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/conversations/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/conversations/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
Qa.Items = xm;
var Mm = class extends k {
  create(e, t) {
    const n = !!e.encoding_format;
    let r = n ? e.encoding_format : "base64";
    n && we(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const o = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: r
      },
      ...t,
      __security: { bearerAuth: !0 }
    });
    return n ? o : (we(this._client).debug("embeddings/decoding base64 embeddings from base64"), o._thenUnwrap((i) => (i && i.data && i.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = Ab(u);
    }), i)));
  }
}, Nm = class extends k {
  retrieve(e, t, n) {
    const { eval_id: r, run_id: o } = t;
    return this._client.get(T`/evals/${r}/runs/${o}/output_items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { eval_id: r, ...o } = t;
    return this._client.getAPIList(T`/evals/${r}/runs/${e}/output_items`, ne, {
      query: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Za = class extends k {
  constructor() {
    super(...arguments), this.outputItems = new Nm(this._client);
  }
  create(e, t, n) {
    return this._client.post(T`/evals/${e}/runs`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { eval_id: r } = t;
    return this._client.get(T`/evals/${r}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/evals/${e}/runs`, ne, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { eval_id: r } = t;
    return this._client.delete(T`/evals/${r}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { eval_id: r } = t;
    return this._client.post(T`/evals/${r}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
Za.OutputItems = Nm;
var ja = class extends k {
  constructor() {
    super(...arguments), this.runs = new Za(this._client);
  }
  create(e, t) {
    return this._client.post("/evals", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/evals/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/evals/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/evals", ne, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/evals/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
ja.Runs = Za;
var km = class extends k {
  create(e, t) {
    return this._client.post("/files", mt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(T`/files/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/files", ne, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/files/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  content(e, t) {
    return this._client.get(T`/files/${e}/content`, {
      ...t,
      headers: F([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  async waitForProcessing(e, { pollInterval: t = 5e3, maxWait: n = 1800 * 1e3 } = {}) {
    const r = /* @__PURE__ */ new Set([
      "processed",
      "error",
      "deleted"
    ]), o = Date.now();
    let i = await this.retrieve(e);
    for (; !i.status || !r.has(i.status); )
      if (await ao(t), i = await this.retrieve(e), Date.now() - o > n) throw new $a({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, Dm = class extends k {
}, $m = class extends k {
  run(e, t) {
    return this._client.post("/fine_tuning/alpha/graders/run", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  validate(e, t) {
    return this._client.post("/fine_tuning/alpha/graders/validate", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, el = class extends k {
  constructor() {
    super(...arguments), this.graders = new $m(this._client);
  }
};
el.Graders = $m;
var Lm = class extends k {
  create(e, t, n) {
    return this._client.getAPIList(T`/fine_tuning/checkpoints/${e}/permissions`, Bt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(T`/fine_tuning/checkpoints/${e}/permissions`, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/fine_tuning/checkpoints/${e}/permissions`, Ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: r } = t;
    return this._client.delete(T`/fine_tuning/checkpoints/${r}/permissions/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, tl = class extends k {
  constructor() {
    super(...arguments), this.permissions = new Lm(this._client);
  }
};
tl.Permissions = Lm;
var Um = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/fine_tuning/jobs/${e}/checkpoints`, ne, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, nl = class extends k {
  constructor() {
    super(...arguments), this.checkpoints = new Um(this._client);
  }
  create(e, t) {
    return this._client.post("/fine_tuning/jobs", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/fine_tuning/jobs/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/fine_tuning/jobs", ne, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(T`/fine_tuning/jobs/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  listEvents(e, t = {}, n) {
    return this._client.getAPIList(T`/fine_tuning/jobs/${e}/events`, ne, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  pause(e, t) {
    return this._client.post(T`/fine_tuning/jobs/${e}/pause`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  resume(e, t) {
    return this._client.post(T`/fine_tuning/jobs/${e}/resume`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
nl.Checkpoints = Um;
var Xn = class extends k {
  constructor() {
    super(...arguments), this.methods = new Dm(this._client), this.jobs = new nl(this._client), this.checkpoints = new tl(this._client), this.alpha = new el(this._client);
  }
};
Xn.Methods = Dm;
Xn.Jobs = nl;
Xn.Checkpoints = tl;
Xn.Alpha = el;
var Fm = class extends k {
}, rl = class extends k {
  constructor() {
    super(...arguments), this.graderModels = new Fm(this._client);
  }
};
rl.GraderModels = Fm;
var Om = class extends k {
  createVariation(e, t) {
    return this._client.post("/images/variations", mt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", mt({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  generate(e, t) {
    return this._client.post("/images/generations", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, qm = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", Bt, {
      ...e,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Bm = class extends k {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Gm = class extends k {
  accept(e, t, n) {
    return this._client.post(T`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  hangup(e, t) {
    return this._client.post(T`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: F([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  refer(e, t, n) {
    return this._client.post(T`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(T`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Hm = class extends k {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Bi = class extends k {
  constructor() {
    super(...arguments), this.clientSecrets = new Hm(this._client), this.calls = new Gm(this._client);
  }
};
Bi.ClientSecrets = Hm;
Bi.Calls = Gm;
function Tb(e, t) {
  return !t || !Eb(t) ? {
    ...e,
    output_parsed: null,
    output: e.output.map((n) => n.type === "function_call" ? {
      ...n,
      parsed_arguments: null
    } : n.type === "message" ? {
      ...n,
      content: n.content.map((r) => ({
        ...r,
        parsed: null
      }))
    } : n)
  } : Vm(e, t);
}
function Vm(e, t) {
  const n = e.output.map((o) => {
    if (o.type === "function_call") return {
      ...o,
      parsed_arguments: Cb(t, o)
    };
    if (o.type === "message") {
      const i = o.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: Sb(t, a.text)
      } : a);
      return {
        ...o,
        content: i
      };
    }
    return o;
  }), r = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || aa(r), Object.defineProperty(r, "output_parsed", {
    enumerable: !0,
    get() {
      for (const o of r.output)
        if (o.type === "message") {
          for (const i of o.content) if (i.type === "output_text" && i.parsed !== null) return i.parsed;
        }
      return null;
    }
  }), r;
}
function Sb(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function Eb(e) {
  return !!Oa(e.text?.format);
}
function wb(e) {
  return e?.$brand === "auto-parseable-tool";
}
function Ib(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function Cb(e, t) {
  const n = Ib(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: wb(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function aa(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const r of n.content) r.type === "output_text" && t.push(r.text);
  e.output_text = t.join("");
}
var Sn, Oo, Lt, qo, Pd, Rd, xd, Md, bb = class Km extends Ba {
  constructor(t) {
    super(), Sn.add(this), Oo.set(this, void 0), Lt.set(this, void 0), qo.set(this, void 0), V(this, Oo, t, "f");
  }
  static createResponse(t, n, r) {
    const o = new Km(n);
    return o._run(() => o._createOrRetrieveResponse(t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  async _createOrRetrieveResponse(t, n, r) {
    const o = r?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), I(this, Sn, "m", Pd).call(this);
    let i, a = null;
    "response_id" in n ? (i = await t.responses.retrieve(n.response_id, { stream: !0 }, {
      ...r,
      signal: this.controller.signal,
      stream: !0
    }), a = n.starting_after ?? null) : i = await t.responses.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    }), this._connected();
    for await (const u of i) I(this, Sn, "m", Rd).call(this, u, a);
    if (i.controller.signal?.aborted) throw new et();
    return I(this, Sn, "m", xd).call(this);
  }
  [(Oo = /* @__PURE__ */ new WeakMap(), Lt = /* @__PURE__ */ new WeakMap(), qo = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakSet(), Pd = function() {
    this.ended || V(this, Lt, void 0, "f");
  }, Rd = function(n, r) {
    if (this.ended) return;
    const o = (a, u) => {
      (r == null || u.sequence_number > r) && this._emit(a, u);
    }, i = I(this, Sn, "m", Md).call(this, n);
    switch (o("event", n), n.type) {
      case "response.output_text.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new G(`missing output at index ${n.output_index}`);
        if (a.type === "message") {
          const u = a.content[n.content_index];
          if (!u) throw new G(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new G(`expected content to be 'output_text', got ${u.type}`);
          o("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new G(`missing output at index ${n.output_index}`);
        a.type === "function_call" && o("response.function_call_arguments.delta", {
          ...n,
          snapshot: a.arguments
        });
        break;
      }
      default:
        o(n.type, n);
        break;
    }
  }, xd = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = I(this, Lt, "f");
    if (!n) throw new G("request ended without sending any events");
    V(this, Lt, void 0, "f");
    const r = Pb(n, I(this, Oo, "f"));
    return V(this, qo, r, "f"), r;
  }, Md = function(n) {
    let r = I(this, Lt, "f");
    if (!r) {
      if (n.type !== "response.created") throw new G(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return r = V(this, Lt, n.response, "f"), r;
    }
    switch (n.type) {
      case "response.output_item.added":
        r.output.push(n.item);
        break;
      case "response.content_part.added": {
        const o = r.output[n.output_index];
        if (!o) throw new G(`missing output at index ${n.output_index}`);
        const i = o.type, a = n.part;
        i === "message" && a.type !== "reasoning_text" ? o.content.push(a) : i === "reasoning" && a.type === "reasoning_text" && (o.content || (o.content = []), o.content.push(a));
        break;
      }
      case "response.output_text.delta": {
        const o = r.output[n.output_index];
        if (!o) throw new G(`missing output at index ${n.output_index}`);
        if (o.type === "message") {
          const i = o.content[n.content_index];
          if (!i) throw new G(`missing content at index ${n.content_index}`);
          if (i.type !== "output_text") throw new G(`expected content to be 'output_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const o = r.output[n.output_index];
        if (!o) throw new G(`missing output at index ${n.output_index}`);
        o.type === "function_call" && (o.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const o = r.output[n.output_index];
        if (!o) throw new G(`missing output at index ${n.output_index}`);
        if (o.type === "reasoning") {
          const i = o.content?.[n.content_index];
          if (!i) throw new G(`missing content at index ${n.content_index}`);
          if (i.type !== "reasoning_text") throw new G(`expected content to be 'reasoning_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.completed":
        V(this, Lt, n.response, "f");
        break;
    }
    return r;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let r = !1;
    return this.on("event", (o) => {
      const i = n.shift();
      i ? i.resolve(o) : t.push(o);
    }), this.on("end", () => {
      r = !0;
      for (const o of n) o.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), this.on("error", (o) => {
      r = !0;
      for (const i of n) i.reject(o);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((o, i) => n.push({
        resolve: o,
        reject: i
      })).then((o) => o ? {
        value: o,
        done: !1
      } : {
        value: void 0,
        done: !0
      }),
      return: async () => (this.abort(), {
        value: void 0,
        done: !0
      })
    };
  }
  async finalResponse() {
    await this.done();
    const t = I(this, qo, "f");
    if (!t) throw new G("stream ended without producing a ChatCompletion");
    return t;
  }
};
function Pb(e, t) {
  return Tb(e, t);
}
var Jm = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/responses/${e}/input_items`, ne, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Wm = class extends k {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Gi = class extends k {
  constructor() {
    super(...arguments), this.inputItems = new Jm(this._client), this.inputTokens = new Wm(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && aa(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(T`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((r) => ("object" in r && r.object === "response" && aa(r), r));
  }
  delete(e, t) {
    return this._client.delete(T`/responses/${e}`, {
      ...t,
      headers: F([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Vm(n, e));
  }
  stream(e, t) {
    return bb.createResponse(this._client, e, t);
  }
  cancel(e, t) {
    return this._client.post(T`/responses/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  compact(e, t) {
    return this._client.post("/responses/compact", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
Gi.InputItems = Jm;
Gi.InputTokens = Wm;
var zm = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/skills/${e}/content`, {
      ...t,
      headers: F([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Ym = class extends k {
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(T`/skills/${r}/versions/${e}/content`, {
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, ol = class extends k {
  constructor() {
    super(...arguments), this.content = new Ym(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(T`/skills/${e}/versions`, Li({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(T`/skills/${r}/versions/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/skills/${e}/versions`, ne, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { skill_id: r } = t;
    return this._client.delete(T`/skills/${r}/versions/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
ol.Content = Ym;
var Hi = class extends k {
  constructor() {
    super(...arguments), this.content = new zm(this._client), this.versions = new ol(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", Li({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(T`/skills/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/skills/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/skills", ne, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/skills/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
Hi.Content = zm;
Hi.Versions = ol;
var Xm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/uploads/${e}/parts`, mt({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, il = class extends k {
  constructor() {
    super(...arguments), this.parts = new Xm(this._client);
  }
  create(e, t) {
    return this._client.post("/uploads", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(T`/uploads/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  complete(e, t, n) {
    return this._client.post(T`/uploads/${e}/complete`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
il.Parts = Xm;
var Rb = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((o) => o.status === "rejected");
  if (n.length) {
    for (const o of n) console.error(o.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const r = [];
  for (const o of t) o.status === "fulfilled" && r.push(o.value);
  return r;
}, Qm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(T`/vector_stores/${r}/file_batches/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.post(T`/vector_stores/${r}/file_batches/${e}/cancel`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t);
    return await this.poll(e, r.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: r, ...o } = t;
    return this._client.getAPIList(T`/vector_stores/${r}/file_batches/${e}/files`, ne, {
      query: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async poll(e, t, n) {
    const r = F([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: o, response: i } = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: r
      }).withResponse();
      switch (o.status) {
        case "in_progress":
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = i.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await ao(a);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return o;
      }
    }
  }
  async uploadAndPoll(e, { files: t, fileIds: n = [] }, r) {
    if (t == null || t.length == 0) throw new Error("No `files` provided to process. If you've already uploaded files you should use `.createAndPoll()` instead");
    const o = r?.maxConcurrency ?? 5, i = Math.min(o, t.length), a = this._client, u = t.values(), c = [...n];
    async function d(h) {
      for (let f of h) {
        const p = await a.files.create({
          file: f,
          purpose: "assistants"
        }, r);
        c.push(p.id);
      }
    }
    return await Rb(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, Zm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(T`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { vector_store_id: r, ...o } = t;
    return this._client.post(T`/vector_stores/${r}/files/${e}`, {
      body: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/vector_stores/${e}/files`, ne, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.delete(T`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(e, r.id, n);
  }
  async poll(e, t, n) {
    const r = F([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const o = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: r
      }).withResponse(), i = o.data;
      switch (i.status) {
        case "in_progress":
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = o.response.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await ao(a);
          break;
        case "failed":
        case "completed":
          return i;
      }
    }
  }
  async upload(e, t, n) {
    const r = await this._client.files.create({
      file: t,
      purpose: "assistants"
    }, n);
    return this.create(e, { file_id: r.id }, n);
  }
  async uploadAndPoll(e, t, n) {
    const r = await this.upload(e, t, n);
    return await this.poll(e, r.id, n);
  }
  content(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.getAPIList(T`/vector_stores/${r}/files/${e}/content`, Bt, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Vi = class extends k {
  constructor() {
    super(...arguments), this.files = new Zm(this._client), this.fileBatches = new Qm(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(T`/vector_stores/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(T`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", ne, {
      query: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/vector_stores/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(T`/vector_stores/${e}/search`, Bt, {
      body: t,
      method: "post",
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Vi.Files = Zm;
Vi.FileBatches = Qm;
var jm = class extends k {
  create(e, t) {
    return this._client.post("/videos", mt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(T`/videos/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/videos", Ce, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(T`/videos/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  createCharacter(e, t) {
    return this._client.post("/videos/characters", mt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(T`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", mt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", mt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  getCharacter(e, t) {
    return this._client.get(T`/videos/characters/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  remix(e, t, n) {
    return this._client.post(T`/videos/${e}/remix`, Li({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Pn, eg, ti, tg = class extends k {
  constructor() {
    super(...arguments), Pn.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
    return await this.verifySignature(e, t, n, r), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    I(this, Pn, "m", eg).call(this, n);
    const o = F([t]).values, i = I(this, Pn, "m", ti).call(this, o, "webhook-signature"), a = I(this, Pn, "m", ti).call(this, o, "webhook-timestamp"), u = I(this, Pn, "m", ti).call(this, o, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new Cr("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > r) throw new Cr("Webhook timestamp is too old");
    if (c > d + r) throw new Cr("Webhook timestamp is too new");
    const h = i.split(" ").map((y) => y.startsWith("v1,") ? y.substring(3) : y), f = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), p = u ? `${u}.${a}.${e}` : `${a}.${e}`, m = await crypto.subtle.importKey("raw", f, {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["verify"]);
    for (const y of h) try {
      const _ = Buffer.from(y, "base64");
      if (await crypto.subtle.verify("HMAC", m, _, new TextEncoder().encode(p))) return;
    } catch {
      continue;
    }
    throw new Cr("The given webhook signature does not match the expected signature");
  }
};
Pn = /* @__PURE__ */ new WeakSet(), eg = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, ti = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const r = t.get(n);
  if (r == null) throw new Error(`Missing required header: ${n}`);
  return r;
};
var la, sl, ni, ng, xb = "workload-identity-auth", W = class {
  constructor({ baseURL: e = $t("OPENAI_BASE_URL"), apiKey: t = $t("OPENAI_API_KEY") ?? null, adminAPIKey: n = $t("OPENAI_ADMIN_KEY") ?? null, organization: r = $t("OPENAI_ORG_ID") ?? null, project: o = $t("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = $t("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: a, ...u } = {}) {
    la.add(this), ni.set(this, void 0), this.completions = new Pm(this), this.chat = new Ha(this), this.embeddings = new Mm(this), this.files = new km(this), this.images = new Om(this), this.audio = new uo(this), this.moderations = new Bm(this), this.models = new qm(this), this.fineTuning = new Xn(this), this.graders = new rl(this), this.vectorStores = new Vi(this), this.webhooks = new tg(this), this.beta = new Yn(this), this.batches = new Am(this), this.uploads = new il(this), this.admin = new Wa(this), this.responses = new Gi(this), this.realtime = new Bi(this), this.conversations = new Qa(this), this.evals = new ja(this), this.containers = new Xa(this), this.skills = new Hi(this), this.videos = new jm(this);
    const c = {
      apiKey: t,
      adminAPIKey: n,
      organization: r,
      project: o,
      webhookSecret: i,
      workloadIdentity: a,
      ...u,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (t && a) throw new G("The `apiKey` and `workloadIdentity` options are mutually exclusive");
    if (!t && !n && !a) throw new G("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, `adminAPIKey`, or set the `OPENAI_API_KEY` or `OPENAI_ADMIN_KEY` environment variable.");
    if (!c.dangerouslyAllowBrowser && PC()) throw new G(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? sl.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = md(c.logLevel, "ClientOptions.logLevel", this) ?? md($t("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? Ap(), V(this, ni, kC, "f");
    const h = $t("OPENAI_CUSTOM_HEADERS");
    if (h) {
      const f = {};
      for (const p of h.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (f[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = F([f, c.defaultHeaders]);
    }
    this._options = c, a && (this._workloadIdentityAuth = new QC(a, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = r, this.project = o, this.webhookSecret = i;
  }
  withOptions(e) {
    return new this.constructor({
      ...this._options,
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      apiKey: this._options.apiKey,
      adminAPIKey: this.adminAPIKey,
      workloadIdentity: this._options.workloadIdentity,
      organization: this.organization,
      project: this.project,
      webhookSecret: this.webhookSecret,
      ...e
    });
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  validateHeaders({ values: e, nulls: t }, n = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (!(e.get("authorization") || e.get("api-key")) && !(t.has("authorization") || t.has("api-key")) && !(this._workloadIdentityAuth && n.bearerAuth))
      throw new Error('Could not resolve authentication method. Expected either apiKey or adminAPIKey to be set. Or for one of the "Authorization" or "api-key" headers to be explicitly omitted');
  }
  async authHeaders(e, t = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    return F([t.bearerAuth ? await this.bearerAuth(e) : null, t.adminAPIKeyAuth ? await this.adminAPIKeyAuth(e) : null]);
  }
  async bearerAuth(e) {
    if (this._workloadIdentityAuth) return F([{ Authorization: `Bearer ${await this._workloadIdentityAuth.getToken()}` }]);
    if (this.apiKey != null)
      return F([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  async adminAPIKeyAuth(e) {
    if (this.adminAPIKey != null)
      return F([{ Authorization: `Bearer ${this.adminAPIKey}` }]);
  }
  stringifyQuery(e) {
    return OC(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Cn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${lp()}`;
  }
  makeStatusError(e, t, n, r) {
    return be.generate(e, t, n, r);
  }
  async _callApiKey() {
    const e = this._options.apiKey;
    if (typeof e != "function") return !1;
    let t;
    try {
      t = await e();
    } catch (n) {
      throw n instanceof G ? n : new G(`Failed to get token from 'apiKey' function: ${n.message}`, { cause: n });
    }
    if (typeof t != "string" || !t) throw new G(`Expected 'apiKey' function argument to return a string but it returned ${t}`);
    return this.apiKey = t, !0;
  }
  buildURL(e, t, n) {
    const r = !I(this, la, "m", ng).call(this) && n || this.baseURL, o = wC(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!od(i) || !od(a)) && (t = {
      ...a,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (o.search = this.stringifyQuery(t)), o.toString();
  }
  async prepareOptions(e) {
    (e.__security ?? { bearerAuth: !0 }).bearerAuth && await this._callApiKey();
  }
  async prepareRequest(e, { url: t, options: n }) {
  }
  get(e, t) {
    return this.methodRequest("get", e, t);
  }
  post(e, t) {
    return this.methodRequest("post", e, t);
  }
  patch(e, t) {
    return this.methodRequest("patch", e, t);
  }
  put(e, t) {
    return this.methodRequest("put", e, t);
  }
  delete(e, t) {
    return this.methodRequest("delete", e, t);
  }
  methodRequest(e, t, n) {
    return this.request(Promise.resolve(n).then((r) => ({
      method: e,
      path: t,
      ...r
    })));
  }
  request(e, t = null) {
    return new Mp(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, o = r.maxRetries ?? this.maxRetries;
    t == null && (t = o), await this.prepareOptions(r);
    const { req: i, url: a, timeout: u } = await this.buildRequest(r, { retryCount: o - t });
    await this.prepareRequest(i, {
      url: a,
      options: r
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (we(this).debug(`[${c}] sending request`, jt({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: i.headers
    })), r.signal?.aborted) throw new et();
    const f = r.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(a, i, u, p, f).catch(Ws), y = Date.now();
    if (m instanceof globalThis.Error) {
      const v = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new et();
      const E = Js(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return we(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - ${v}`), we(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (${v})`, jt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: y - h,
          message: m.message
        })), this.retryRequest(r, t, n ?? c);
      throw we(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - error; no more retries left`), we(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (error; no more retries left)`, jt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: y - h,
        message: m.message
      })), m instanceof vp || m instanceof SC ? m : E ? new $a() : new ki({
        message: Mb(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([v]) => v === "x-request-id").map(([v, E]) => ", " + v + ": " + JSON.stringify(E)).join("")}] ${i.method} ${a} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${y - h}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && f.bearerAuth && !r.__metadata?.hasStreamingBody && !r.__metadata?.workloadIdentityTokenRefreshed)
        return await ld(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...r,
          __metadata: {
            ...r.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const v = await this.shouldRetry(m);
      if (t && v) {
        const L = `retrying, ${t} attempts remaining`;
        return await ld(m.body), we(this).info(`${_} - ${L}`), we(this).debug(`[${c}] response error (${L})`, jt({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: y - h
        })), this.retryRequest(r, t, n ?? c, m.headers);
      }
      const E = v ? "error; no more retries left" : "error; not retryable";
      we(this).info(`${_} - ${E}`);
      const b = await m.text().catch((L) => Ws(L).message), R = bC(b), P = R ? void 0 : b;
      throw we(this).debug(`[${c}] response error (${E})`, jt({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: P,
        durationMs: Date.now() - h
      })), this.makeStatusError(m.status, R, P, m.headers);
    }
    return we(this).info(_), we(this).debug(`[${c}] response start`, jt({
      retryOfRequestLogID: n,
      url: m.url,
      status: m.status,
      headers: m.headers,
      durationMs: y - h
    })), {
      response: m,
      options: r,
      controller: p,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: h
    };
  }
  getAPIList(e, t, n) {
    return this.requestAPIList(t, n && "then" in n ? n.then((r) => ({
      method: "get",
      path: e,
      ...r
    })) : {
      method: "get",
      path: e,
      ...n
    });
  }
  requestAPIList(e, t) {
    const n = this.makeRequest(t, null, void 0);
    return new zC(this, n, e);
  }
  async fetchWithAuth(e, t, n, r, o = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && o.bearerAuth) {
      const i = t.headers, a = i.get("Authorization");
      if (!a || a === `Bearer ${xb}`) {
        const u = await this._workloadIdentityAuth.getToken();
        i.set("Authorization", `Bearer ${u}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, r);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: o, method: i, ...a } = t || {}, u = this._makeAbort(r);
    o && o.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, h = {
      signal: r.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...a
    };
    i && (h.method = i.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, h);
    } finally {
      clearTimeout(c);
    }
  }
  async shouldRetry(e) {
    const t = e.headers.get("x-should-retry");
    return t === "true" ? !0 : t === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
  }
  async retryRequest(e, t, n, r) {
    let o;
    const i = r?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (o = u);
    }
    const a = r?.get("retry-after");
    if (a && !o) {
      const u = parseFloat(a);
      Number.isNaN(u) ? o = Date.parse(a) - Date.now() : o = u * 1e3;
    }
    if (o === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      o = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await ao(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: i, defaultBaseURL: a } = n, u = this.buildURL(o, i, a);
    "timeout" in n && CC("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: c, body: d, isStreamingBody: h } = this.buildBody({ options: n });
    return h && (e.__metadata = {
      ...e.__metadata,
      hasStreamingBody: !0
    }), {
      req: {
        method: r,
        headers: await this.buildHeaders({
          options: e,
          method: r,
          bodyHeaders: c,
          retryCount: t
        }),
        ...n.signal && { signal: n.signal },
        ...globalThis.ReadableStream && d instanceof globalThis.ReadableStream && { duplex: "half" },
        ...d && { body: d },
        ...this.fetchOptions ?? {},
        ...n.fetchOptions ?? {}
      },
      url: u,
      timeout: n.timeout
    };
  }
  async buildHeaders({ options: e, method: t, bodyHeaders: n, retryCount: r }) {
    let o = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), o[this.idempotencyHeader] = e.idempotencyKey);
    const i = F([
      o,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...NC(),
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project
      },
      await this.authHeaders(e, e.__security ?? { bearerAuth: !0 }),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(i, e.__security ?? { bearerAuth: !0 }), i.values;
  }
  _makeAbort(e) {
    return () => e.abort();
  }
  buildBody({ options: { body: e, headers: t } }) {
    if (!e) return {
      bodyHeaders: void 0,
      body: void 0,
      isStreamingBody: !1
    };
    const n = F([t]), r = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, o = !r && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || r ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !o
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Sp(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...I(this, ni, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
sl = W, ni = /* @__PURE__ */ new WeakMap(), la = /* @__PURE__ */ new WeakSet(), ng = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
W.OpenAI = sl;
W.DEFAULT_TIMEOUT = 6e5;
W.OpenAIError = G;
W.APIError = be;
W.APIConnectionError = ki;
W.APIConnectionTimeoutError = $a;
W.APIUserAbortError = et;
W.NotFoundError = fp;
W.ConflictError = hp;
W.RateLimitError = mp;
W.BadRequestError = up;
W.AuthenticationError = cp;
W.InternalServerError = gp;
W.PermissionDeniedError = dp;
W.UnprocessableEntityError = pp;
W.InvalidWebhookSignatureError = Cr;
W.toFile = nb;
W.Completions = Pm;
W.Chat = Ha;
W.Embeddings = Mm;
W.Files = km;
W.Images = Om;
W.Audio = uo;
W.Moderations = Bm;
W.Models = qm;
W.FineTuning = Xn;
W.Graders = rl;
W.VectorStores = Vi;
W.Webhooks = tg;
W.Beta = Yn;
W.Batches = Am;
W.Uploads = il;
W.Admin = Wa;
W.Responses = Gi;
W.Realtime = Bi;
W.Conversations = Qa;
W.Evals = ja;
W.Containers = Xa;
W.Skills = Hi;
W.Videos = jm;
function Mb(e) {
  if (Nb(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function Nb(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const r = t;
    if (r.code === "UND_ERR_INVALID_ARG" && typeof r.message == "string" && r.message.includes("invalid onRequestStart method")) return !0;
    t = r.cause;
  }
  return !1;
}
function Nd(e = "", t = 0) {
  let n = 0;
  for (let r = t - 1; r >= 0 && e[r] === "\\"; r -= 1) n += 1;
  return n % 2 === 1;
}
function kb(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function Db(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function $b(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function Lb(e = "") {
  const t = String(e ?? "");
  let n = "", r = 0;
  for (; r < t.length; ) {
    const o = t.slice(r, r + 2), i = t.slice(r + 2, r + 6);
    if (o !== "\\u" || Nd(t, r) || !kb(i)) {
      n += t[r] || "", r += 1;
      continue;
    }
    const a = r + 6, u = t.slice(a + 2, a + 6);
    if (Db(i) && t.slice(a, a + 2) === "\\u" && !Nd(t, a) && $b(u)) {
      const c = Number.parseInt(i, 16), d = Number.parseInt(u, 16), h = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(h), r += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(i, 16)), r += 6;
  }
  return n;
}
function Ub(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), Lb(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function Fb(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function al(e = "", t = "", n = 0) {
  const r = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${Fb(t)}(?:\\\\?")?\\s*:`, "i"), o = String(e || "").slice(Math.max(0, n)).match(r);
  if (!o || o.index === void 0) return null;
  const i = o[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + o.index + i,
    end: Math.max(0, n) + o.index + o[0].length
  };
}
function Ob(e = "", t = [], n = 0) {
  return t.map((r) => al(e, r, n)).filter(Boolean).sort((r, o) => r.index - o.index)[0] || null;
}
function lt(e = "", t = "", n = []) {
  const r = String(e || ""), o = al(r, t);
  if (!o) return;
  let i = o.end;
  for (; /\s/.test(r[i] || ""); ) i += 1;
  r[i] === '"' && (i += 1);
  const a = Ob(r, n.filter((d) => d !== t), i);
  let u = a ? a.index : r.length;
  if (a) {
    const d = r.lastIndexOf(",", a.index);
    d >= i && (u = d);
  }
  let c = r.slice(i, u).trim();
  return a || (c = c.replace(/\}\s*$/, "").trimEnd()), Ub(c);
}
function Tt(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var Lr = {
  Read: [
    "filePath",
    "path",
    "scope",
    "fromLine",
    "toLine",
    "tail",
    "offset",
    "limit",
    "outputMode",
    "contentFormat"
  ],
  Write: [
    "filePath",
    "path",
    "content"
  ],
  Edit: [
    "filePath",
    "path",
    "edits"
  ],
  Delete: ["filePath", "path"],
  Move: [
    "fromPath",
    "toPath",
    "filePath",
    "path"
  ],
  RenameBook: ["title", "name"],
  ImportMaterial: [
    "title",
    "content",
    "source"
  ],
  Glob: [
    "pattern",
    "path",
    "scope"
  ],
  Grep: [
    "pattern",
    "query",
    "path",
    "scope",
    "include",
    "outputMode",
    "limit",
    "offset",
    "contextLines",
    "useRegex"
  ],
  MapDocs: [
    "docType",
    "docId",
    "limit",
    "offset"
  ],
  MapInspect: [
    "docType",
    "docId",
    "mode",
    "elementId",
    "locationKey",
    "actorKey",
    "from",
    "to",
    "kind",
    "status",
    "query",
    "parent",
    "limit",
    "offset"
  ],
  MapPatch: [
    "docType",
    "docId",
    "expectedRevision",
    "activate",
    "dryRun",
    "ops"
  ],
  MemoryRead: [
    "filePath",
    "path",
    "offset",
    "limit",
    "tail"
  ],
  MemoryWrite: [
    "filePath",
    "path",
    "content"
  ],
  MemoryEdit: [
    "filePath",
    "path",
    "edits"
  ],
  MemoryGrep: [
    "pattern",
    "query",
    "filePath",
    "path",
    "scope",
    "outputMode",
    "limit",
    "offset",
    "contextLines",
    "regex",
    "useRegex"
  ],
  ChatHistory: [
    "mode",
    "limit",
    "offset",
    "startOrder",
    "endOrder",
    "pattern",
    "query",
    "regex",
    "useRegex",
    "full"
  ],
  WebSearch: ["query", "maxResults"],
  DelegateRun: ["task"],
  PlanCreate: [
    "title",
    "details",
    "priority",
    "owner",
    "blockedBy"
  ],
  PlanUpdate: [
    "id",
    "status",
    "details",
    "priority",
    "owner",
    "blockedBy"
  ],
  PlanList: ["status"],
  apply_patch: ["patchText"]
}, qb = [
  "filePath",
  "path",
  "fromPath",
  "toPath",
  "content",
  "edits",
  "patchText",
  "query",
  "task",
  "title",
  "details",
  "pattern",
  "scope",
  "include",
  "status",
  "priority",
  "owner",
  "blockedBy",
  "fromLine",
  "toLine",
  "tail",
  "maxResults",
  "outputMode",
  "contentFormat",
  "limit",
  "offset",
  "contextLines",
  "useRegex",
  "regex",
  "mode",
  "docType",
  "docId",
  "expectedRevision",
  "activate",
  "dryRun",
  "ops",
  "op",
  "eventId",
  "fingerprint",
  "vision",
  "doneWhen",
  "hookForModel",
  "startOrder",
  "endOrder",
  "full"
];
function kd(e = "", t = [], n = []) {
  for (const r of t) {
    const o = lt(e, r, n);
    if (o !== void 0) return o;
  }
}
function Bb(e = "", t = "") {
  if (t === "Read") {
    const n = Lr.Read, r = {};
    return n.forEach((o, i) => {
      const a = lt(e, o, n.slice(i + 1));
      a !== void 0 && (r[o] = Tt(a));
    }), r.filePath === void 0 && r.path !== void 0 && (r.filePath = r.path, delete r.path), r.filePath === void 0 && r.scope !== void 0 && (r.filePath = r.scope, delete r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "Write") {
    const n = {}, r = kd(e, ["filePath", "path"], ["content"]), o = lt(e, "content", []);
    return r !== void 0 && (n.filePath = Tt(r)), o !== void 0 && (n.content = Tt(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, r = kd(e, ["filePath", "path"], ["edits"]), o = lt(e, "edits", []);
    return r !== void 0 && (n.filePath = Tt(r)), o !== void 0 && (n.edits = Tt(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = Lr.Grep, r = {};
    return n.forEach((o) => {
      const i = lt(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = Tt(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "MemoryGrep") {
    const n = Lr.MemoryGrep, r = {};
    return n.forEach((o) => {
      const i = lt(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = Tt(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  if (t === "ChatHistory") {
    const n = Lr.ChatHistory, r = {};
    return n.forEach((o) => {
      const i = lt(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = Tt(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  return null;
}
function Gb(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const a = JSON.parse(n);
    if (a && typeof a == "object" && !Array.isArray(a)) return a;
  } catch {
  }
  const r = Bb(n, t);
  if (r) return r;
  const o = Lr[t] || qb, i = {};
  return o.forEach((a, u) => {
    const c = lt(n, a, o.slice(u + 1));
    c !== void 0 && (i[a] = Tt(c));
  }), Object.keys(i).length ? i : null;
}
function Hb(e = "", t = "") {
  const n = Gb(e, t);
  return n ? JSON.stringify(n) : "";
}
function rg(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function at(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function Le(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function te(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function og(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function ig(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : og(e);
  return Hb(n, t) || JSON.stringify(rg(n));
}
function Vb(e = "") {
  const t = String(e || ""), n = al(t, "arguments");
  if (!n) return "";
  let r = n.end;
  for (; /\s/.test(t[r] || ""); ) r += 1;
  const o = t[r] || "";
  return o === "{" ? t.slice(r).replace(/\}\s*$/, "").trimEnd() : o === '"' ? t.slice(r + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(r).replace(/\}\s*$/, "").trimEnd();
}
function Kb(e = "", t = 0) {
  const n = String(e || "").trim(), r = lt(n, "name", ["id", "arguments"]) || lt(n, "toolName", ["id", "arguments"]) || "", o = lt(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, i = Vb(n);
  return !r || !i ? null : {
    id: o,
    name: r,
    arguments: ig(i, r)
  };
}
function Jb(e, t = 0, n = "openai-tool") {
  if (!te(e)) return null;
  const r = te(e.function) ? e.function : null, o = String(r?.name || "").trim();
  if (!o) return null;
  const i = Le(e) || {};
  return delete i.index, i.id = String(i.id || `${n}-${t + 1}`), i.type = "function", i.function = {
    ...Le(r) || {},
    name: o,
    arguments: og(r.arguments)
  }, i;
}
function zr(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, r) => Jb(n, r, t)).filter(Boolean);
}
function Yr(e, t) {
  return Array.isArray(e) ? e.some((n) => Yr(n, t)) : te(e) ? Object.entries(e).some(([n, r]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(r) : (Array.isArray(r) || te(r)) && Yr(r, t)) : !1;
}
function Wb(e) {
  return Yr(e, (t) => typeof t == "string" && t.length > 0);
}
function ua(e) {
  return Yr(e, () => !0);
}
function zb(e) {
  return Yr(e, (t) => typeof t != "string" || t.length === 0);
}
function Yb(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => Wb(t));
}
var Dd = /* @__PURE__ */ new WeakSet();
function ll(e) {
  if (!te(e)) return null;
  const t = Le(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = rn(nn(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = zr(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function ul(e = [], t = "openai-tool") {
  return zr(e, t).map((n, r) => ({
    id: n.id || `${t}-${Date.now()}-${r + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function cl(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function nn(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, r) => (at(t, "思考块", r), "")).trim(),
    thoughts: t
  };
}
function rn(e = "") {
  const t = String(e || ""), n = t.search(/<tool_call\b/i);
  return n < 0 ? t.trim() : t.slice(0, n).trim();
}
function ca(e = "") {
  const t = String(e || "");
  return /<tool_call\b/i.test(t) ? [{
    id: "tagged-json-draft",
    name: t.match(/["']?name["']?\s*:\s*["']([^"']+)/i)?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }] : [];
}
function en(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      at(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((r) => en(e, r, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && at(e, n, t.text), typeof t.content == "string" && at(e, n, t.content), typeof t.reasoning_content == "string" && at(e, n, t.reasoning_content), typeof t.thinking == "string" && at(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((r) => {
      if (typeof r == "string") {
        at(e, "推理摘要", r);
        return;
      }
      r && typeof r == "object" && at(e, "推理摘要", r.text || r.content || "");
    }));
  }
}
function Ut(e = {}, t = {}) {
  const n = [];
  return en(n, e.reasoning_content, "推理文本"), en(n, e.reasoning, "推理文本"), en(n, e.reasoning_text, "推理文本"), en(n, e.thinking, "思考块"), en(n, t.reasoning_content, "推理文本"), en(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        at(n, "推理文本", r.text);
        return;
      }
      if (r.type === "summary_text") {
        at(n, "推理摘要", r.text);
        return;
      }
      (r.type === "thinking" || r.type === "reasoning" || r.type === "reasoning_content") && at(n, "思考块", r.text || r.content || r.reasoning || "");
    }
  }), n;
}
function Gr(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((r) => {
    [...e.matchAll(r)].forEach((o, i) => {
      try {
        const a = JSON.parse(o[1]);
        n.push({
          id: a.id || `tool-call-${i + 1}`,
          name: String(a.name || ""),
          arguments: ig(a.arguments, a.name)
        });
      } catch {
        const a = Kb(o[1], i);
        a && n.push(a);
      }
    });
  }), n.filter((r) => r.name);
}
function dl(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : ll(t);
}
function Xb(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function Qb(e = {}) {
  const t = zr(e?.tool_calls);
  if (t.length) return t;
  const n = zr(dl(e)?.tool_calls);
  return n.length ? n : [];
}
function Zb(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function jb(e = "") {
  return /claude/i.test(String(e || ""));
}
function e0(e = "") {
  return /^o(?:1|3|4)(?:-|$)/i.test(String(e || "").trim());
}
function sg(e = [], t = "") {
  if (!jb(t)) return e;
  let n = -1;
  for (let o = e.length - 1; o >= 0; o -= 1) if (typeof e[o]?.role == "string") {
    n = o;
    break;
  }
  const r = e[n]?.role;
  return n < 0 || r === "user" || r !== "system" && r !== "assistant" ? e : e.map((o, i) => i === n ? {
    ...o,
    role: "user"
  } : o);
}
function $d(e, t = "") {
  return !te(e) || !Zb(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var da = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function t0(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((r) => Le(r) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((r, o) => {
    const i = Le(r) || {}, a = Number.isInteger(Number(r?.index)) ? Number(r.index) : o, u = n[a];
    n[a] = te(u) ? co(u, i, "tool_call") : i;
  }), n.filter((r) => r !== void 0);
}
function co(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return Le(t);
  if (t === null && da.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return t0(e, t);
  if (typeof e == "string" && typeof t == "string")
    return da.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : Le(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(Le(t) || []);
  if (te(e) && te(t)) {
    const r = { ...e };
    return Object.entries(t).forEach(([o, i]) => {
      r[o] = co(r[o], i, o);
    }), r;
  }
  return Le(t);
}
function _i(e = {}, t = {}) {
  const n = te(e) ? Le(e) || {} : {}, r = te(t) ? Le(t) || {} : {};
  return delete r.message, delete r.finish_reason, delete r.index, delete r.logprobs, delete r.delta, Object.entries(r).forEach(([o, i]) => {
    n[o] = co(n[o], i, o);
  }), n.role || (n.role = "assistant"), ll(n) || { role: "assistant" };
}
function Hr(e, t = {}) {
  const n = ll(_i(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function n0(e = {}, t = {}) {
  return te(e) ? te(t) ? co(Le(e) || {}, t, "") : Le(e) : Le(t);
}
function fa(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], r = Xb(n), o = [];
  let i = !1;
  n.forEach((u, c) => {
    if (i) {
      if (u?.role === "tool") return;
      i = !1;
    }
    const d = u?.role === "assistant", h = d ? u?.providerPayload?.openaiCompatibleMessage : null, f = lg(Array.isArray(h?.tool_calls) && h.tool_calls.some((E) => ua(E)) ? h.tool_calls : d && Array.isArray(u?.tool_calls) && u.tool_calls.some((E) => ua(E)) ? u.tool_calls : null);
    if (f) {
      const E = te(h) ? h : u;
      (!te(E) || !Dd.has(E)) && (te(E) && Dd.add(E), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: f.index,
        toolName: f.toolName,
        reason: f.reason
      })), i = !0;
      return;
    }
    const p = d ? zr(u?.tool_calls) : [], m = d ? dl(u) : null, y = Array.isArray(m?.tool_calls) ? m.tool_calls : [], _ = y.length > 0 && Yb(m);
    if (y.length && c > r) {
      o.push($d({
        ...m,
        ...p.length && !_ ? { tool_calls: p } : {}
      }, t));
      return;
    }
    const v = {
      role: u.role,
      content: u.content
    };
    u.role === "tool" && u.tool_call_id && (v.tool_call_id = u.tool_call_id), _ ? v.tool_calls = y : p.length && (v.tool_calls = p), o.push($d(v, t));
  });
  const a = String(e.systemPrompt || "").trim();
  return a && o[0]?.role !== "system" && o.unshift({
    role: "system",
    content: a
  }), sg(o, t);
}
function Ld(e) {
  const t = (e.tools || []).map((o) => [`- ${o.function.name}: ${o.function.description || ""}`.trim(), `  参数 JSON Schema: ${JSON.stringify(o.function.parameters || {})}`].join(`
`)).join(`
`), n = String(e.toolChoice || "auto").trim() || "auto", r = n === "required" ? "本轮必须调用工具，不得只返回正文。" : n === "none" ? "本轮不得调用工具，不得输出 <tool_call> 标签。" : n === "auto" ? "请根据任务判断是否需要调用工具。" : `本轮必须调用工具 ${n}，不得调用其他工具，也不得只返回正文。`;
  return [
    e.systemPrompt || "",
    "如果你需要调用工具，不要使用原生 tool calling 字段。",
    r,
    "用 <tool_call> 和 </tool_call> 明确 JSON 范围，请严格输出如下边界标记和包裹的 JSON，不要改写边界标记：",
    '<tool_call>{"name":"工具名","arguments":{...}}</tool_call>',
    "如果需要多个工具调用，可以连续输出多段 <tool_call> ... </tool_call>。",
    "在输出第一个 <tool_call> 之前，可根据任务复杂度决定是否需要先说明：简单查询可直接输出 <tool_call>；复杂任务可先简要说明你准备查什么或怎么查。",
    "一旦开始输出第一个 <tool_call>，就不要再继续输出面向用户的正文、解释、总结或补充；把本轮需要的 tool_call 连续输出完就结束。",
    t ? `可用工具:
${t}` : ""
  ].filter(Boolean).join(`

`);
}
function ha(e, t = "") {
  const n = /* @__PURE__ */ new Map(), r = [];
  return (Array.isArray(e.messages) ? e.messages : []).forEach((o) => {
    if (o.role === "assistant") {
      const i = Qb(o);
      if (i.length) {
        const a = dl(o), u = typeof a?.content == "string" ? a.content : String(o.content || ""), c = i.map((d, h) => {
          const f = d.function?.name || "", p = d.id || `tool-call-${h + 1}`;
          return f && n.set(p, f), `<tool_call>${JSON.stringify({
            id: p,
            name: f,
            arguments: rg(d.function?.arguments || "{}")
          })}</tool_call>`;
        }).join(`
`);
        r.push({
          role: "assistant",
          content: [u, c].filter(Boolean).join(`

`)
        });
        return;
      }
    }
    if (o.role === "tool") {
      const i = String(o.toolName || o.tool_name || "").trim() || n.get(o.tool_call_id || "") || "unknown_tool";
      o.tool_call_id && n.delete(o.tool_call_id);
      const a = String(o.content || "");
      r.push({
        role: "user",
        content: [
          "<tool_result>",
          "这是系统工具执行结果，不是用户新发言。",
          `name: ${i}`,
          "content:",
          a,
          "</tool_result>"
        ].join(`
`)
      });
      return;
    }
    r.push({
      role: o.role,
      content: o.content
    });
  }), !r.length || r[0].role !== "system" ? r.unshift({
    role: "system",
    content: Ld(e)
  }) : r[0] = {
    ...r[0],
    content: Ld({
      ...e,
      systemPrompt: r[0].content || e.systemPrompt
    })
  }, sg(r, t);
}
function Ud(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: Z(e.reasoning) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function vr(e, t = []) {
  return Z(e.reasoning) ? t : [];
}
function ag(e, t, n) {
  !e || !t || n === void 0 || (e[t] = co(e[t], n, t));
}
function vi(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (te(n)) {
      const r = te(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([o, i]) => {
        vi(r, o, i);
      }), e[t] = r;
      return;
    }
    if (typeof n == "string" && da.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || ag(e, t, n);
  }
}
function r0(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const r = Number(n?.index ?? 0), o = { ...e.tool_calls[r] || {} };
    Object.entries(n || {}).forEach(([i, a]) => {
      if (i !== "index" && !(i === "function" && a == null)) {
        if (i === "function" && te(a)) {
          o.function = te(o.function) ? { ...o.function } : {}, Object.entries(a).forEach(([u, c]) => {
            vi(o.function, u, c);
          });
          return;
        }
        vi(o, i, a);
      }
    }), e.tool_calls[r] = o;
  }));
}
function pa(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([r, o]) => {
    r === "delta" || r === "finish_reason" || r === "index" || r === "logprobs" || ag(e, r, o);
  });
  const n = te(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([r, o]) => {
    if (r === "tool_calls") {
      r0(e, o);
      return;
    }
    vi(e, r, o);
  });
}
function $n(e = {}) {
  return cl(e?.content);
}
function Ln(e = {}) {
  return ul(e?.tool_calls || []);
}
function o0(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return te(JSON.parse(e));
  } catch {
    return !1;
  }
}
function lg(e) {
  if (!Array.isArray(e) || !e.some((t) => ua(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], r = te(n?.function) ? n.function : null, o = String(r?.name || "").trim();
    let i = "";
    if (!te(n) || !r ? i = "invalid_function_shape" : o ? o0(r.arguments) ? zb(n) && (i = "invalid_thought_signature") : i = "invalid_function_arguments" : i = "missing_function_name", i) return {
      index: t,
      toolName: o,
      reason: i
    };
  }
  return null;
}
function Un(e = {}) {
  const t = lg(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function i0(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("openai_compatible_stream_missing_body");
  const r = new TextDecoder();
  let o = "";
  const i = /\r?\n\r?\n/;
  for (; ; ) {
    const { done: u, value: c } = await n.read();
    if (u) break;
    for (o += r.decode(c, { stream: !0 }); ; ) {
      const d = o.match(i);
      if (!d || typeof d.index != "number") break;
      const h = d.index, f = o.slice(0, h);
      o = o.slice(h + d[0].length);
      const p = f.split(/\r?\n/).filter((m) => m.startsWith("data:")).map((m) => m.slice(5).trimStart()).join(`
`).trim();
      !p || p === "[DONE]" || t(JSON.parse(p));
    }
  }
  const a = o.trim();
  if (a && a !== "[DONE]") {
    const u = a.split(/\r?\n/).filter((c) => c.startsWith("data:")).map((c) => c.slice(5).trimStart()).join(`
`).trim();
    u && u !== "[DONE]" && t(JSON.parse(u));
  }
}
var s0 = class {
  constructor(e) {
    this.config = e, this.client = new W({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e) {
    const t = Ne("openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, r = !n && Array.isArray(e.tools) && e.tools.length ? e.tools : null, o = {
      model: this.config.model,
      messages: n ? ha(e, this.config.model) : fa(e, this.config.model),
      ...r ? {
        tools: r,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? e0(this.config.model) ? { max_completion_tokens: e.maxTokens } : { max_tokens: e.maxTokens } : {}
    };
    return !oo({
      ...this.config,
      provider: "openai-compatible"
    }, t) && typeof e.temperature == "number" && (o.temperature = e.temperature), (t.mode === "on" || t.mode === "off") && (t.profileId.startsWith("openai-") || t.profileId === "kimi-k3" ? o.reasoning_effort = t.mode === "off" ? t.profileId === "kimi-k3" ? "off" : "none" : t.effort : t.profileId === "kimi-k2.5-k2.6" ? o.thinking = { type: t.mode === "off" ? "disabled" : "enabled" } : t.profileId === "deepseek-thinking" && (o.thinking = { type: t.mode === "off" ? "disabled" : "enabled" }, t.mode === "on" && (o.reasoning_effort = t.effort))), o;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = {
      ...t.body || this.buildRequestBody(e),
      ...n ? { stream: !0 } : {}
    }, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = Ne("openai-compatible", this.config, e.reasoning), a = {
      ...Object.hasOwn(r, "reasoning_effort") ? { reasoning_effort: r.reasoning_effort } : {},
      ...Object.hasOwn(r, "thinking") ? { thinking: r.thinking } : {}
    };
    return { ...Jr({
      provider: "openai-compatible",
      model: this.config.model,
      transport: "openai-compatible",
      url: `${o}/chat/completions`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: r,
      sdk: n ? "client.chat.completions.create(..., { stream: true })" : "client.chat.completions.create",
      effectiveConfig: qt(e, {
        profileId: i.profileId,
        effectiveMode: i.mode,
        effort: r.reasoning_effort,
        controlFields: a
      })
    }) };
  }
  async streamNativeChatCompletions(e, t) {
    const n = `${String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`, r = await fetch(n, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        ...t,
        stream: !0
      }),
      signal: e.signal
    });
    if (!r.ok) {
      const m = await r.text().catch(() => ""), y = new Error(m || `openai_compatible_stream_http_${r.status}`);
      throw y.status = r.status, y;
    }
    const o = { role: "assistant" };
    let i = "stop", a = this.config.model;
    await i0(r, (m) => {
      a = m?.model || a;
      const y = m?.choices?.[0];
      pa(o, y), y?.finish_reason && (i = y.finish_reason);
      const _ = nn($n(o)), v = Ln(o), E = v.length ? v : ca(_.cleaned);
      Ud(e, {
        text: v.length ? _.cleaned : rn(_.cleaned),
        thoughts: vr(e, Ut(o, y).concat(_.thoughts)),
        ...E.length ? { toolCalls: E } : {},
        ...!v.length && E.length ? { toolCallDraft: !0 } : {}
      });
    }), Un(o);
    const u = Hr(o), c = Ln(o), d = nn($n(o)), h = Ut(o, {});
    d.thoughts.forEach((m) => h.push(m));
    const f = c.length ? [] : Gr(d.cleaned), p = [...c, ...f];
    return {
      text: c.length ? d.cleaned : rn(d.cleaned),
      toolCalls: p,
      thoughts: vr(e, h),
      finishReason: i,
      model: a,
      provider: "openai-compatible",
      providerPayload: u
    };
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = typeof e.onStreamProgress == "function", r = this.buildRequestBody(e), o = this.inspectRequest(e, { body: r }), i = async (v) => {
      try {
        return await v(r);
      } catch (E) {
        throw E && typeof E == "object" && (E.requestInspection = o), E;
      }
    };
    if (n) {
      if (!t) return {
        ...await i((Q) => this.streamNativeChatCompletions(e, Q)),
        requestInspection: o
      };
      const v = await i((Q) => this.client.chat.completions.create({
        ...Q,
        stream: !0
      }, { signal: e.signal })), E = { role: "assistant" };
      let b = "stop", R = this.config.model, P;
      for await (const Q of v) {
        R = Q.model || R;
        const j = Q.choices?.[0];
        pa(E, j), j?.finish_reason && (b = j.finish_reason);
        const X = nn($n(E)), Se = Ln(E), Ye = Se.length ? Se : ca(X.cleaned);
        Ud(e, {
          text: Se.length ? X.cleaned : rn(X.cleaned),
          thoughts: vr(e, Ut(E, j).concat(X.thoughts)),
          ...Ye.length ? { toolCalls: Ye } : {},
          ...!Se.length && Ye.length ? { toolCallDraft: !0 } : {}
        });
      }
      const L = (typeof v.finalChatCompletion == "function" ? await v.finalChatCompletion() : null)?.choices?.[0] || null, S = L?.message || E;
      Un(S);
      const O = n0(E, _i(S, L || {}));
      Un(O), P = Hr(O);
      const x = Ln(O), D = nn($n(O)), H = Ut(O, L || {});
      D.thoughts.forEach((Q) => H.push(Q));
      const z = x.length ? [] : Gr(D.cleaned), ye = [...x, ...z];
      return {
        text: x.length ? D.cleaned : rn(D.cleaned),
        toolCalls: ye,
        thoughts: vr(e, H),
        finishReason: b,
        model: R,
        provider: "openai-compatible",
        providerPayload: P,
        requestInspection: o
      };
    }
    const a = await i((v) => this.client.chat.completions.create(v, { signal: e.signal })), u = a.choices?.[0] || {}, c = u.message || {};
    Un(c);
    const d = Ut(c, u), h = ul(c.tool_calls || []), f = nn(cl(c.content));
    f.thoughts.forEach((v) => d.push(v));
    const p = h.length ? [] : Gr(f.cleaned), m = [...h, ...p], y = h.length ? f.cleaned : rn(f.cleaned), _ = _i(c, u);
    return {
      text: y,
      toolCalls: m,
      thoughts: vr(e, d),
      finishReason: u.finish_reason || "stop",
      model: a.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: Hr(_),
      requestInspection: o
    };
  }
};
function fl(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function ug(e, t) {
  return {
    type: "message",
    role: e,
    content: a0(t)
  };
}
function Ai(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function a0(e) {
  if (typeof e == "string") return [{
    type: "input_text",
    text: e
  }];
  if (!Array.isArray(e)) return [{
    type: "input_text",
    text: ""
  }];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "image_url" && n.image_url?.url ? {
    type: "input_image",
    image_url: n.image_url.url
  } : n.type === "text" ? {
    type: "input_text",
    text: n.text || ""
  } : null).filter(Boolean);
  return t.length ? t : [{
    type: "input_text",
    text: ""
  }];
}
function Ti(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function Fd(e, t = [], n = {}) {
  (t || []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        Ti(e, n.reasoning || "推理文本", r.text);
        return;
      }
      r.type === "summary_text" && Ti(e, n.summary || "推理摘要", r.text);
    }
  });
}
function l0(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (Fd(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), Fd(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function u0(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function c0(e) {
  const t = e?.choices?.[0]?.message?.content;
  if (typeof t == "string" && t.trim()) return t.trim();
  if (typeof e?.output_text == "string" && e.output_text.trim()) return e.output_text.trim();
  const n = [];
  return (Array.isArray(e?.output) ? e.output : []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "message" && Array.isArray(r.content)) {
        r.content.forEach((o) => {
          if (!(!o || typeof o != "object")) {
            if (o.type === "output_text" && typeof o.text == "string" && o.text.trim()) {
              n.push(o.text.trim());
              return;
            }
            o.type === "refusal" && typeof o.refusal == "string" && o.refusal.trim() && n.push(o.refusal.trim());
          }
        });
        return;
      }
      typeof r.text == "string" && r.text.trim() && n.push(r.text.trim());
    }
  }), n.join(`
`).trim();
}
function d0(e) {
  const t = e?.choices?.[0], n = t?.message?.content, r = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const o = n.toLowerCase();
  return !o.includes("proxy error") || !o.includes("/responses") && !r.toLowerCase().includes("proxy error") ? null : n.trim();
}
function f0(e) {
  const t = [];
  for (const n of e.messages || [])
    if (n.role !== "system") {
      if (n.role === "tool") {
        t.push({
          type: "function_call_output",
          call_id: n.tool_call_id || "missing_tool_call_id",
          output: n.content
        });
        continue;
      }
      if (n.role === "assistant" && Array.isArray(n?.providerPayload?.openAIResponseOutput) && n.providerPayload.openAIResponseOutput.length) {
        t.push(...fl(n.providerPayload.openAIResponseOutput) || []);
        continue;
      }
      if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
        n.content?.trim() && t.push(Ai(n.content)), n.tool_calls.forEach((r, o) => {
          t.push({
            type: "function_call",
            call_id: r.id || `function_call_${o + 1}`,
            name: r.function?.name || "",
            arguments: r.function?.arguments || "{}",
            status: "completed"
          });
        });
        continue;
      }
      if (n.role === "assistant") {
        t.push(Ai(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? ug(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function h0(e) {
  const t = [];
  for (const n of e.messages || []) {
    if (n.role === "system") {
      t.push({
        role: "system",
        content: typeof n.content == "string" ? n.content : ""
      });
      continue;
    }
    if (n.role === "tool") {
      t.push({
        type: "function_call_output",
        call_id: n.tool_call_id || "missing_tool_call_id",
        output: n.content
      });
      continue;
    }
    if (n.role === "assistant" && Array.isArray(n?.providerPayload?.openAIResponseOutput) && n.providerPayload.openAIResponseOutput.length) {
      t.push(...fl(n.providerPayload.openAIResponseOutput) || []);
      continue;
    }
    if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
      n.content?.trim() && t.push(Ai(n.content)), n.tool_calls.forEach((r, o) => {
        t.push({
          type: "function_call",
          call_id: r.id || `function_call_${o + 1}`,
          name: r.function?.name || "",
          arguments: r.function?.arguments || "{}",
          status: "completed"
        });
      });
      continue;
    }
    if (n.role === "assistant") {
      t.push(Ai(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? ug(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function p0(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function m0(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function g0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function ps(e, t) {
  const [n = "0", r = "0"] = String(e || "").split(":"), [o = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(o) || Number(r) - Number(i);
}
var y0 = class {
  constructor(e) {
    this.config = e, this.client = new W({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = !1) {
    const n = Ne("openai-responses", this.config, e.reasoning), r = {
      model: this.config.model,
      instructions: t ? void 0 : u0(e) || void 0,
      input: t ? h0(e) : f0(e),
      ...Array.isArray(e.tools) && e.tools.length ? {
        tools: e.tools.map((o) => ({
          type: "function",
          name: o.function.name,
          description: o.function.description,
          parameters: o.function.parameters
        })),
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? { max_output_tokens: e.maxTokens } : {}
    };
    return !oo({
      ...this.config,
      provider: "openai-responses"
    }, n) && typeof e.temperature == "number" && (r.temperature = e.temperature), n.mode === "on" || n.mode === "off" ? r.reasoning = {
      effort: n.mode === "off" ? "none" : n.effort,
      ...n.mode === "on" && Z(n) ? { summary: "auto" } : {}
    } : Z(n) && (r.reasoning = { summary: "auto" }), n.mode !== "off" && n.profileId.startsWith("openai-") && (r.include = ["reasoning.encrypted_content"]), r;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = t.legacySystemInInput === !0, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = t.body || this.buildRequestBody(e, r), a = Ne("openai-responses", this.config, e.reasoning);
    return Jr({
      provider: "openai-responses",
      model: this.config.model,
      transport: "openai-responses",
      url: `${o}/responses`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: i,
      sdk: n ? "client.responses.stream" : "client.responses.create",
      effectiveConfig: qt(e, {
        profileId: a.profileId,
        effectiveMode: i.reasoning?.effort === "none" ? "off" : a.mode,
        effort: i.reasoning?.effort,
        controlFields: {
          ...i.reasoning ? { reasoning: i.reasoning } : {},
          ...i.include ? { include: i.include } : {}
        }
      })
    });
  }
  async chat(e) {
    let t = this.inspectRequest(e);
    const n = (c) => {
      const d = d0(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const h = Array.isArray(c.output) ? c.output : [];
      return {
        output: h,
        thoughts: Z(e.reasoning) ? l0(h) : [],
        toolCalls: h.filter((f) => f.type === "function_call" && f.name).map((f, p) => ({
          id: f.call_id || `response-tool-${p + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: c0(c)
      };
    }, r = async (c = !1) => {
      const d = this.buildRequestBody(e, c);
      return t = this.inspectRequest(e, {
        body: d,
        legacySystemInInput: c
      }), await this.client.responses.create(d, { signal: e.signal });
    }, o = async (c = !1) => {
      const d = this.buildRequestBody(e, c);
      t = this.inspectRequest(e, {
        body: d,
        legacySystemInInput: c
      });
      const h = this.client.responses.stream(d, { signal: e.signal }), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), y = () => {
        const _ = [];
        Z(e.reasoning) && (Array.from(p.entries()).sort(([v], [E]) => ps(v, E)).forEach(([, v]) => Ti(_, "推理文本", v)), Array.from(m.entries()).sort(([v], [E]) => ps(v, E)).forEach(([, v]) => Ti(_, "推理摘要", v))), g0(e, {
          text: Array.from(f.entries()).sort(([v], [E]) => ps(v, E)).map(([, v]) => v).join(`
`).trim(),
          thoughts: _
        });
      };
      return h.on("response.output_text.delta", (_) => {
        const v = `${_.output_index}:${_.content_index}`;
        f.set(v, `${f.get(v) || ""}${_.delta}`), y();
      }), h.on("response.reasoning_text.delta", (_) => {
        const v = `${_.output_index}:${_.content_index}`;
        p.set(v, `${p.get(v) || ""}${_.delta}`), y();
      }), h.on("response.reasoning_summary_text.delta", (_) => {
        const v = `${_.output_index}:${_.summary_index}`;
        m.set(v, `${m.get(v) || ""}${_.delta}`), y();
      }), await h.finalResponse();
    }, i = !p0(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await o(!1) : await r(!1), u = n(a), i && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), u = n(a));
    } catch (c) {
      if (!i || !m0(c)) throw c;
      a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), u = n(a);
    }
    return {
      text: u.text,
      toolCalls: u.toolCalls,
      thoughts: u.thoughts,
      finishReason: a.incomplete_details?.reason || a.status || "stop",
      model: a.model || this.config.model,
      provider: "openai-responses",
      providerPayload: u.output.length ? { openAIResponseOutput: fl(u.output) || [] } : void 0,
      requestInspection: t
    };
  }
};
async function _0(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("host_chat_completions_stream_missing_body");
  const r = new TextDecoder();
  let o = "";
  const i = /\r?\n\r?\n/, a = (c) => {
    const d = c.split(/\r?\n/).filter((h) => h.startsWith("data:")).map((h) => h.slice(5).trimStart()).join(`
`).trim();
    !d || d === "[DONE]" || t(JSON.parse(d));
  };
  for (; ; ) {
    const { done: c, value: d } = await n.read();
    if (c) break;
    for (o += r.decode(d, { stream: !0 }); ; ) {
      const h = o.match(i);
      if (!h || typeof h.index != "number") break;
      const f = o.slice(0, h.index);
      o = o.slice(h.index + h[0].length), a(f);
    }
  }
  const u = o.trim();
  u && a(u);
}
var Qn = "openai", hl = "claude", pl = "makersuite", v0 = "/api/backends/chat-completions/status", A0 = "/api/backends/chat-completions/generate", cg = Object.freeze({
  [hl]: "https://api.anthropic.com/v1",
  [pl]: "https://generativelanguage.googleapis.com"
}), dg = null;
function T0(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function S0(e = "") {
  return /^o(?:1|3|4)(?:-|$)/i.test(String(e || "").trim());
}
function E0(e, t) {
  const n = T0(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function w0(e) {
  dg = typeof e == "function" ? e : null;
}
async function fg() {
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(dg?.() || {}),
    Accept: "application/json"
  };
}
function I0(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : r;
  }), t;
}
async function fo(e = {}, t = !1) {
  const n = await fg(), r = {
    url: A0,
    method: "POST",
    headers: I0(n),
    body: {
      ...e,
      stream: !!t
    }
  };
  return Object.defineProperty(r, "rawHeaders", {
    value: n,
    enumerable: !1
  }), r;
}
function C0(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function b0(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function P0() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function Od(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function qd(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => Od(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => Od(n));
}
function R0(e = "") {
  const t = String(e || ""), n = qd((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), r = qd(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), o = n || r;
  return o.length > 240 ? `${o.slice(0, 237)}...` : o;
}
function x0(e = null) {
  const t = Number(e?.status), n = String(e?.statusText || "").trim();
  let r = "";
  try {
    r = String(e?.headers?.get?.("content-type") || "").trim();
  } catch {
    r = "";
  }
  return {
    status: Number.isFinite(t) && t > 0 ? t : 0,
    statusText: n,
    contentType: r
  };
}
function M0(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function Gn(e = "", t = "", n = null) {
  if (b0(e)) return P0();
  const r = x0(n);
  if (C0(e) || /\btext\/html\b/i.test(r.contentType)) {
    const o = M0(r), i = R0(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      o ? `（${o}）` : "",
      i ? `：${i}` : ""
    ].join("");
  }
  return String(e || t || "").trim();
}
function hg(e = {}, t = Qn) {
  const n = E0(e.baseUrl, t), r = String(e.apiKey || "").trim(), o = cg[t] || "", i = n || (r ? o : ""), a = { chat_completion_source: t || "openai" };
  return i && (a.reverse_proxy = i), r && (a.proxy_password = r), a;
}
function N0(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function k0(e = {}, t = Qn) {
  return hg(e, t);
}
function ml(e = {}, t = {}, n = [], r = !1, o = Qn) {
  const i = t.maxTokens, a = o === "openai" && S0(e.model);
  return N0({
    ...hg(e, o),
    stream: !!r,
    messages: n,
    model: e.model,
    max_tokens: a ? void 0 : i,
    max_completion_tokens: a ? i : void 0,
    temperature: t.temperature,
    tools: Array.isArray(t.tools) && t.tools.length ? t.tools : void 0,
    tool_choice: Array.isArray(t.tools) && t.tools.length ? t.toolChoice || "auto" : void 0,
    use_sysprompt: o === "openai" ? void 0 : !0
  });
}
function D0(e = {}, t = {}, n = [], r = !1) {
  return ml(e, t, n, r, Qn);
}
function $0(e = {}, t = {}, n = [], r = !1) {
  return ml(e, t, n, r, hl);
}
function L0(e = {}, t = {}, n = [], r = !1) {
  return ml(e, t, n, r, pl);
}
async function U0(e = {}, t = Qn, n = {}) {
  const r = await fetch(v0, {
    method: "POST",
    headers: await fg(),
    body: JSON.stringify(k0(e, t)),
    signal: n.signal
  }), o = await r.text();
  let i = null;
  try {
    i = o ? JSON.parse(o) : {};
  } catch (u) {
    throw new Error(`酒馆后端模型列表拉取失败：${Gn(o, String(u?.message || u), r)}`);
  }
  if (!r.ok || i?.error) {
    const u = Gn(i?.message || i?.error?.message || o, `HTTP ${r.status}`, r);
    throw new Error(`酒馆后端模型列表拉取失败：${u}`);
  }
  const a = Array.isArray(i?.data) ? i.data.map((u) => String(u?.id || u?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(a)];
}
async function gl(e = {}, t = {}) {
  const n = await fo(e, !1);
  typeof t.onRequest == "function" && t.onRequest(n);
  const r = await fetch(n.url, {
    method: n.method,
    headers: n.rawHeaders || n.headers,
    body: JSON.stringify(n.body),
    signal: t.signal
  }), o = await r.text();
  let i = null;
  try {
    i = o ? JSON.parse(o) : {};
  } catch (a) {
    const u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${Gn(o, String(a?.message || a), r)}`);
    throw u.status = r.status, u.body = o, u;
  }
  if (!r.ok || i?.error) {
    const a = Gn(i?.error?.message || i?.message || o, `HTTP ${r.status}`, r), u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${a}`);
    throw u.status = r.status, u.error = i?.error, u;
  }
  return i;
}
async function yl(e = {}, t, n = {}) {
  const r = await fo(e, !0);
  typeof n.onRequest == "function" && n.onRequest(r);
  const o = await fetch(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!o.ok) {
    const i = await o.text().catch(() => ""), a = new Error(Gn(i, `酒馆后端流式生成失败：HTTP ${o.status}`, o));
    throw a.status = o.status, a.body = i, a;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await _0(o, (i) => {
    if (i?.error) {
      const a = Gn(i.error?.message || i.message || JSON.stringify(i.error), "酒馆后端流式生成失败");
      throw new Error(a);
    }
    t(i);
  });
}
function dn(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function F0(e) {
  const t = String(e || "").trim();
  if (!t || t === "auto") return "auto";
  if (t === "required") return "any";
  if (t === "none") return "none";
  throw new Error(`酒馆托管 Claude 不支持 tool_choice：${t}。仅支持 auto/required/none。`);
}
function O0(e = {}, t = {}) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const n = F0(t.toolChoice), r = Ne("sillytavern-claude", e, t.reasoning), o = r.profileId === "sillytavern-claude-manual" || r.profileId === "sillytavern-claude-adaptive-conditional";
  return {
    toolChoice: n,
    reasoningDisabledForForcedTool: n === "any" && r.mode === "on" && o
  };
}
var q0 = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function B0(e = {}, t = {}, n = {}) {
  const r = Ne("sillytavern-claude", e, t.reasoning), o = n.reasoningDisabledForForcedTool ? "off" : r.mode;
  return qt(t, {
    profileId: r.profileId,
    effectiveMode: o,
    effort: o === "on" ? r.effort : "",
    controlFields: n.controlFields || {}
  });
}
function G0(e = {}, t = {}) {
  return { toolChoice: String(t.toolChoice || "") };
}
function pg(e = "") {
  try {
    return {
      ok: !0,
      input: JSON.parse(String(e || ""))
    };
  } catch (t) {
    return {
      ok: !1,
      input: {},
      raw: String(e || ""),
      error: t instanceof Error ? t.message : String(t || "invalid_tool_input_json")
    };
  }
}
function H0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const r = pg(t.function.arguments || "{}");
    return {
      type: "tool_use",
      id: String(t.id || n),
      name: n,
      input: r.input,
      ...r.ok ? {} : {
        invalidInputJson: r.raw,
        inputParseError: r.error
      }
    };
  }).filter(Boolean);
}
function V0(e = []) {
  const t = Array.isArray(e) ? dn(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function K0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const i = dn(o) || {}, a = V0(i?.providerPayload?.anthropicContent), u = H0(i.tool_calls);
    delete i.providerPayload, i.role === "assistant" && a && u.length ? (delete i.tool_calls, i.content = a.filter((c) => c?.type !== "tool_use").concat(u)) : i.role === "assistant" && a && (delete i.tool_calls, i.content = a), n.push(i);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function J0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const r = pg(t.inputJson);
        return {
          type: "tool_use",
          id: String(t.id || t.name),
          name: String(t.name),
          input: r.input,
          ...r.ok ? {} : {
            invalidInputJson: r.raw,
            inputParseError: r.error
          }
        };
      }
      const n = dn(t.input);
      return n !== void 0 ? {
        type: "tool_use",
        id: String(t.id || t.name),
        name: String(t.name),
        input: n
      } : {
        type: "tool_use",
        id: String(t.id || t.name),
        name: String(t.name),
        input: {}
      };
    }
    return t.type === "thinking" ? {
      type: "thinking",
      thinking: String(t.thinking || t.text || ""),
      ...typeof t.signature == "string" ? { signature: t.signature } : {}
    } : t.type === "redacted_thinking" ? {
      type: "redacted_thinking",
      data: String(t.data || "")
    } : dn(t) || null;
  }).filter(Boolean);
}
function W0(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: dn(t.input) || {}
  } : dn(t) || null).filter(Boolean);
}
function z0(e = []) {
  const t = Array.isArray(e) ? e : [], n = t.filter((i) => i?.type === "text").map((i) => i.text || "").join(`
`), r = t.filter((i) => i?.type === "thinking" || i?.type === "redacted_thinking").map((i) => ({
    label: i.type === "thinking" ? "思考块" : "已脱敏思考块",
    text: i.type === "thinking" ? i.thinking || "" : i.data || ""
  })).filter((i) => i.text), o = t.filter((i) => i?.type === "tool_use" && i.name).map((i, a) => ({
    id: i.id || `st-claude-tool-${a + 1}`,
    name: i.name,
    arguments: i.inputJson !== void 0 ? i.inputJson : JSON.stringify(i.input || {})
  }));
  return {
    text: n,
    thoughts: r,
    ...o.length ? {
      toolCalls: o,
      toolCallDraft: !0
    } : {}
  };
}
function mg(e = [], t = {}) {
  const n = J0(e), r = n.filter((o) => o.type === "tool_use" && o.name).map((o, i) => ({
    id: o.id || `st-claude-tool-${i + 1}`,
    name: o.name,
    arguments: o.invalidInputJson !== void 0 ? o.invalidInputJson : JSON.stringify(o.input || {})
  }));
  return {
    text: n.filter((o) => o.type === "text").map((o) => o.text || "").join(`
`),
    toolCalls: r,
    thoughts: t.includeReasoningOutput === !1 ? [] : n.filter((o) => o.type === "thinking" || o.type === "redacted_thinking").map((o) => ({
      label: o.type === "thinking" ? "思考块" : "已脱敏思考块",
      text: o.type === "thinking" ? o.thinking || "" : o.data || ""
    })).filter((o) => o.text),
    finishReason: t.finishReason || "stop",
    model: t.model || "",
    provider: "sillytavern-claude",
    providerPayload: n.length ? { anthropicContent: W0(n) } : void 0
  };
}
function Y0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function X0(e, t = {}) {
  const n = [];
  let r = "stop", o = t.model || "";
  const i = (u, c = {}) => {
    const d = Number.isInteger(Number(u)) ? Number(u) : n.length;
    return n[d] ? n[d] = {
      ...n[d],
      ...c
    } : n[d] = { ...c }, n[d];
  }, a = () => {
    const u = z0(n);
    Y0(e, {
      text: u.text,
      thoughts: Z(e.reasoning) ? u.thoughts : [],
      ...Array.isArray(u.toolCalls) ? { toolCalls: u.toolCalls } : {},
      ...u.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(u = {}) {
      if (u?.message?.model && (o = u.message.model), u.type === "content_block_start") {
        i(u.index, dn(u.content_block) || {}), a();
        return;
      }
      if (u.type === "content_block_delta") {
        const c = i(u.index), d = u.delta || {};
        d.type === "text_delta" ? (c.type = c.type || "text", c.text = `${c.text || ""}${d.text || ""}`) : d.type === "input_json_delta" ? (c.type = c.type || "tool_use", c.inputJson = `${c.inputJson || ""}${d.partial_json || ""}`) : d.type === "thinking_delta" ? (c.type = c.type || "thinking", c.thinking = `${c.thinking || ""}${d.thinking || ""}`) : d.type === "signature_delta" && (c.signature = `${c.signature || ""}${d.signature || ""}`), a();
        return;
      }
      u.type === "message_delta" && (r = u.delta?.stop_reason || r);
    },
    result() {
      return mg(n, {
        finishReason: r,
        model: o,
        includeReasoningOutput: Z(e.reasoning)
      });
    }
  };
}
var Q0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return K0(e);
  }
  resolveToolProtocol(e) {
    return O0(this.config, e);
  }
  buildPayload(e, t = this.resolveToolProtocol(e)) {
    const n = Ne("sillytavern-claude", this.config, e.reasoning), r = typeof e.onStreamProgress == "function", o = this.buildMessages(e), i = t.reasoningDisabledForForcedTool ? {
      ...n,
      mode: "off"
    } : n, a = {
      ...e,
      toolChoice: t.toolChoice,
      reasoning: i,
      temperature: oo({
        ...this.config,
        provider: "sillytavern-claude"
      }, i) ? void 0 : e.temperature
    }, u = $0(this.config, a, o, r);
    return i.mode === "on" ? (u.reasoning_effort = i.effort, u.include_reasoning = Z(i)) : i.mode === "off" ? (u.reasoning_effort = "auto", u.include_reasoning = !1) : (u.reasoning_effort = "auto", u.include_reasoning = Z(i)), u;
  }
  async inspectRequest(e, t = {}) {
    const n = this.resolveToolProtocol(e), r = await fo(t.payload || this.buildPayload(e, n), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(r, n, e);
  }
  buildRequestInspection(e, t = {}, n = {}) {
    const r = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: cn(e),
      effectiveConfig: {
        ...G0(n, t),
        ...B0(this.config, n, {
          ...t,
          controlFields: r
        })
      },
      ...t.reasoningDisabledForForcedTool ? { notices: [q0] } : {}
    };
  }
  async chat(e) {
    const t = typeof e.onStreamProgress == "function", n = this.resolveToolProtocol(e), r = this.buildPayload(e, n);
    let o = null;
    const i = (a) => {
      o = this.buildRequestInspection(a, n, e);
    };
    try {
      if (t) {
        const u = X0(e, this.config);
        return await yl(r, (c) => {
          u.accept(c);
        }, {
          signal: e.signal,
          onRequest: i
        }), {
          ...u.result(),
          requestInspection: o
        };
      }
      const a = await gl(r, {
        signal: e.signal,
        onRequest: i
      });
      return {
        ...mg(Array.isArray(a?.content) ? a.content : [{
          type: "text",
          text: a?.choices?.[0]?.message?.content || ""
        }], {
          finishReason: a?.stop_reason || a?.choices?.[0]?.finish_reason || "stop",
          model: a?.model || this.config.model,
          includeReasoningOutput: Z(e.reasoning)
        }),
        requestInspection: o
      };
    } catch (a) {
      throw o && a && typeof a == "object" && (a.requestInspection = o), a;
    }
  }
};
function _l(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Hn(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = _l(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function Z0(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((o) => Hn(o)).filter((o) => Array.isArray(o.parts) && o.parts.length);
  const n = e?.providerPayload?.googleContent, r = Hn(n);
  return r.parts.length ? [r] : [];
}
function j0(e = {}) {
  const t = String(e?.mimeType || "").trim(), n = String(e?.data || "").trim();
  if (!t || !n) return null;
  const r = `data:${t};base64,${n}`;
  return t.startsWith("image/") ? {
    type: "image_url",
    image_url: { url: r }
  } : t.startsWith("video/") ? {
    type: "video_url",
    video_url: { url: r }
  } : t.startsWith("audio/") ? {
    type: "audio_url",
    audio_url: { url: r }
  } : null;
}
function eP(e = {}, t = 0) {
  const n = Hn(e);
  if (!n.parts.length) return null;
  const r = {
    role: n.role === "user" ? "user" : "assistant",
    content: []
  }, o = n.parts.find((a) => !a?.thought && typeof a?.text == "string" && typeof a?.thoughtSignature == "string" && a.thoughtSignature)?.thoughtSignature || "", i = [];
  return n.parts.forEach((a) => {
    if (!a || typeof a != "object") return;
    if (!a.thought && typeof a.text == "string" && a.text) {
      r.content.push({
        type: "text",
        text: a.text
      });
      return;
    }
    if (a.functionCall?.name) {
      i.push({
        id: String(a.functionCall.id || `st-google-tool-${t + 1}-${i.length + 1}`),
        type: "function",
        function: {
          name: String(a.functionCall.name || ""),
          arguments: JSON.stringify(a.functionCall.args || {})
        },
        ...typeof a.thoughtSignature == "string" && a.thoughtSignature ? { signature: a.thoughtSignature } : {}
      });
      return;
    }
    const u = j0(a.inlineData);
    u && r.content.push(u);
  }), i.length && r.content.push({
    type: "tool_calls",
    tool_calls: i
  }), o && r.content.some((a) => a?.type === "text") && (r.signature = o), r.content.length ? r : null;
}
function tP(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const i = Z0(o);
    if (o.role === "assistant" && i.length) {
      i.forEach((u, c) => {
        const d = eP(u, c);
        d && n.push(d);
      });
      return;
    }
    const a = _l(o) || {};
    delete a.providerPayload, n.push(a);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function gg(e = {}) {
  return Hn(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function yg(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function _g(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function vg(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function nP(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
function rP(e = [], t = []) {
  const n = Array.isArray(e) ? [...e] : [];
  return t.forEach((r) => {
    const o = [
      r.id || "",
      r.name || "",
      r.arguments || ""
    ].join("\0");
    n.some((i) => [
      i.id || "",
      i.name || "",
      i.arguments || ""
    ].join("\0") === o) || n.push(r);
  }), n;
}
function Ag(e) {
  const t = Hn(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function oP(e = {}, t = {}) {
  const n = gg(e), r = e?.choices?.[0]?.message?.content || "";
  return {
    text: yg(n) || r,
    toolCalls: vg(n),
    thoughts: t.includeReasoningOutput === !1 ? [] : _g(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: Ag(n)
  };
}
function iP(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function sP(e, t = {}) {
  let n = "", r = [], o = [], i = "STOP", a = t.model || "";
  const u = [];
  return {
    accept(c = {}) {
      a = c.model || c.modelVersion || a, i = c?.candidates?.[0]?.finishReason || i;
      const d = gg(c);
      d.parts.length && u.push(..._l(d.parts) || []), n = nP(n, yg(d)), r = rP(r, vg(d));
      const h = Z(e.reasoning) ? _g(d) : [];
      h.length && (o = h), iP(e, {
        text: n,
        thoughts: o,
        ...r.length ? {
          toolCalls: r,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const c = Hn({
        role: "model",
        parts: u.length ? u : n ? [{ text: n }] : []
      });
      return {
        text: n,
        toolCalls: r,
        thoughts: o,
        finishReason: i,
        model: a,
        provider: "sillytavern-google",
        providerPayload: Ag(c)
      };
    }
  };
}
var aP = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return tP(e);
  }
  buildPayload(e) {
    const t = Ne("sillytavern-google", this.config, e.reasoning), n = typeof e.onStreamProgress == "function", r = this.buildMessages(e), o = L0(this.config, e, r, n);
    return t.mode === "on" ? (o.reasoning_effort = t.effort, o.include_reasoning = Z(t)) : t.mode === "off" ? (o.reasoning_effort = "min", o.include_reasoning = !1) : (o.reasoning_effort = "auto", o.include_reasoning = Z(t)), o;
  }
  async inspectRequest(e, t = {}) {
    const n = await fo(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = Ne("sillytavern-google", this.config, t.reasoning), r = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: cn(e),
      effectiveConfig: qt(t, {
        profileId: n.profileId,
        effectiveMode: n.mode,
        effort: e?.body?.reasoning_effort,
        controlFields: r
      })
    };
  }
  async chat(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildPayload(e);
    let r = null;
    const o = (i) => {
      r = this.buildRequestInspection(i, e);
    };
    try {
      if (t) {
        const i = sP(e, this.config);
        return await yl(n, (a) => {
          i.accept(a);
        }, {
          signal: e.signal,
          onRequest: o
        }), {
          ...i.result(),
          requestInspection: r
        };
      }
      return {
        ...oP(await gl(n, {
          signal: e.signal,
          onRequest: o
        }), {
          model: this.config.model,
          includeReasoningOutput: Z(e.reasoning)
        }),
        requestInspection: r
      };
    } catch (i) {
      throw r && i && typeof i == "object" && (i.requestInspection = r), i;
    }
  }
};
function lP(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: Z(e.reasoning) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function ms(e, t = []) {
  const n = nn(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : rn(n.cleaned)
  };
}
function uP(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var cP = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? ha(e, this.config.model) : fa(e, this.config.model);
  }
  buildPayload(e, t = !1) {
    const n = Ne("sillytavern-openai-compatible", this.config, e.reasoning), r = t ? ha(e, this.config.model) : fa(e, this.config.model), o = {
      ...e,
      temperature: oo({
        ...this.config,
        provider: "sillytavern-openai-compatible"
      }, n) ? void 0 : e.temperature
    }, i = D0(this.config, t ? {
      ...o,
      tools: void 0,
      toolChoice: void 0
    } : o, r, typeof e.onStreamProgress == "function");
    return n.mode === "on" ? i.reasoning_effort = n.effort : n.mode === "off" && (i.reasoning_effort = "none"), i;
  }
  async inspectRequest(e, t = {}) {
    const n = await fo(t.payload || this.buildPayload(e, !!t.taggedMode), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = Ne("sillytavern-openai-compatible", this.config, t.reasoning);
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: cn(e),
      effectiveConfig: qt(t, {
        profileId: n.profileId,
        effectiveMode: n.mode,
        effort: e?.body?.reasoning_effort,
        controlFields: Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {}
      })
    };
  }
  async streamChat(e, t, n = {}) {
    const r = { role: "assistant" };
    let o = "stop", i = this.config.model;
    await yl(t, (f) => {
      i = f?.model || i;
      const p = f?.choices?.[0] || {};
      pa(r, p), p.finish_reason && (o = p.finish_reason);
      const m = Ln(r), { thinkTagged: y, cleanedText: _ } = ms($n(r), m), v = m.length ? m : ca(y.cleaned);
      lP(e, {
        text: _,
        thoughts: Z(e.reasoning) ? Ut(r, p).concat(y.thoughts) : [],
        ...v.length ? { toolCalls: v } : {},
        ...!m.length && v.length ? { toolCallDraft: !0 } : {}
      });
    }, {
      signal: e.signal,
      onRequest: n.onRequest,
      onResponseAccepted: n.onResponseAccepted
    }), Un(r);
    const a = Ln(r), { thinkTagged: u, cleanedText: c } = ms($n(r), a), d = Ut(r, {});
    u.thoughts.forEach((f) => d.push(f));
    const h = a.length ? [] : Gr(u.cleaned);
    return {
      text: c,
      toolCalls: [...a, ...h],
      thoughts: Z(e.reasoning) ? d : [],
      finishReason: o,
      model: i,
      provider: "sillytavern-openai-compatible",
      providerPayload: Hr(r)
    };
  }
  async nonStreamingChat(e, t, n = {}) {
    const r = await gl(t, {
      signal: e.signal,
      onRequest: n.onRequest
    }), o = r.choices?.[0] || {}, i = o.message || {};
    Un(i);
    const a = Ut(i, o), u = ul(i.tool_calls || []), { thinkTagged: c, cleanedText: d } = ms(cl(i.content), u);
    c.thoughts.forEach((p) => a.push(p));
    const h = u.length ? [] : Gr(c.cleaned), f = _i(i, o);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: Z(e.reasoning) ? a : [],
      finishReason: o.finish_reason || "stop",
      model: r.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: Hr(f)
    };
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = Array.isArray(e.tools) && e.tools.length > 0, r = async (i, a = {}) => {
      let u = null;
      const c = (d) => {
        u = this.buildRequestInspection(d, e);
      };
      try {
        return {
          ...typeof e.onStreamProgress == "function" ? await this.streamChat(e, i, {
            onRequest: c,
            onResponseAccepted: a.onResponseAccepted
          }) : await this.nonStreamingChat(e, i, { onRequest: c }),
          requestInspection: u
        };
      } catch (d) {
        throw u && d && typeof d == "object" && (d.requestInspection = u), d;
      }
    }, o = this.buildPayload(e, t);
    try {
      return await r(o);
    } catch (i) {
      if (e.allowToolProtocolFallback === !1 || t || !n || !uP(i)) throw i;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await r(this.buildPayload(e, !0));
  }
}, Bd = 900 * 1e3, Gd = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), dP = Object.freeze([
  {
    value: "openai-responses",
    label: "OpenAI Responses"
  },
  {
    value: "openai-compatible",
    label: "OpenAI 兼容"
  },
  {
    value: "sillytavern-openai-compatible",
    label: "酒馆 OpenAI 兼容"
  },
  {
    value: "sillytavern-claude",
    label: "酒馆 Claude"
  },
  {
    value: "sillytavern-google",
    label: "酒馆 Google AI"
  },
  {
    value: "anthropic",
    label: "Anthropic"
  },
  {
    value: "google",
    label: "Google AI"
  }
]);
function fP(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function Ve(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, r = Number(n);
  return Number.isFinite(r) ? Math.max(0, Math.min(2, r)) : Ve(t, 1);
}
function Bn(e = {}) {
  return e.sendTemperature !== !1;
}
function Hd(e = {}) {
  return Bn(e) ? Ve(e.temperature, 1) : void 0;
}
function Vd(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : dP.find((n) => n.value === e)?.label || e || "未配置";
}
function hP(e = {}, t = {}) {
  const n = _s(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const d = n.delegateConfig.provider || "openai-compatible", h = (n.delegateConfig.modelConfigs || Rn())[d] || Rn()[d] || {}, f = {
      provider: d,
      baseUrl: String(h.baseUrl || ""),
      model: String(h.model || ""),
      maxTokens: ue(h.maxTokens)
    };
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: d,
      baseUrl: String(h.baseUrl || ""),
      model: String(h.model || ""),
      apiKey: String(h.apiKey || ""),
      tavilyApiKey: gs(n.tavilyApiKey),
      tavilyBaseUrl: Ze(n.tavilyBaseUrl),
      temperature: Hd(h),
      sendTemperature: Bn(h),
      maxTokens: ue(h.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: h.toolMode || "native",
      reasoning: on(f, h.reasoning)
    };
  }
  const r = oe(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), o = n.presets?.[r] ? r : n.presets?.[n.currentPresetName] ? n.currentPresetName : Ei, i = n.presets?.[o] || Me(), a = i.provider || n.provider || "openai-compatible", u = (i.modelConfigs || n.modelConfigs || Rn())[a] || Rn()[a] || {}, c = {
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    maxTokens: ue(u.maxTokens)
  };
  return {
    currentPresetName: String(o || ""),
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    tavilyApiKey: gs(n.tavilyApiKey),
    tavilyBaseUrl: Ze(n.tavilyBaseUrl),
    temperature: Hd(u),
    sendTemperature: Bn(u),
    maxTokens: ue(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoning: on(c, u.reasoning)
  };
}
function pP(e = {}, t = {}) {
  if (!e.apiKey && !fP(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (th(e.reasoning || {}), e.provider) {
    case "sillytavern-openai-compatible":
      return new cP(e);
    case "sillytavern-claude":
      return new Q0(e);
    case "sillytavern-google":
      return new aP(e);
    case "openai-responses":
      return new y0(e);
    case "anthropic":
      return new E_(e);
    case "google":
      return new TC(e);
    default:
      return new s0(e);
  }
}
var mP = { chat: { exclude: [
  "embedding",
  "embed",
  "rerank",
  "reranker",
  "tts",
  "speech",
  "audio",
  "whisper",
  "transcription",
  "stt",
  "image",
  "sdxl",
  "flux",
  "moderation"
] } }, gP = Object.freeze([
  "claude-opus-4-7",
  "claude-opus-4-6",
  "claude-opus-4-5",
  "claude-opus-4-5-20251101",
  "claude-sonnet-4-6",
  "claude-sonnet-4-5",
  "claude-sonnet-4-5-20250929",
  "claude-opus-4-1",
  "claude-opus-4-1-20250805",
  "claude-opus-4-0",
  "claude-opus-4-20250514",
  "claude-sonnet-4-0",
  "claude-sonnet-4-20250514"
]);
function ot(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const r = document.createElement("option");
    r.value = "", r.textContent = n, e.appendChild(r);
  }
  t.forEach((r) => {
    const o = document.createElement("option");
    o.value = r.value, o.textContent = r.label, o.disabled = r.disabled === !0, e.appendChild(o);
  });
}
function Bo(e = "", t = {}) {
  const n = un(t.reasoning), r = ro({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model
  }), o = {
    reasoningMode: n.mode,
    reasoningOutput: n.output,
    reasoningEffort: "",
    reasoningBudgetTokens: void 0
  };
  if (r.intensity.kind === "effort") o.reasoningEffort = r.intensity.values.includes(n.effort) ? n.effort : r.intensity.defaultValue;
  else if (r.intensity.kind === "budget") {
    const i = n.budgetTokens, a = r.intensity.allowAuto && i === -1, u = Number.isInteger(i) && i >= r.intensity.min && i <= r.intensity.max;
    o.reasoningBudgetTokens = a || u ? i : r.intensity.defaultValue;
  }
  return o;
}
function Kd(e = {}) {
  return un(e);
}
function Xr(e = []) {
  const t = [...new Set(e.filter(Boolean).map((o) => String(o).trim()).filter(Boolean))], n = mP.chat, r = t.filter((o) => {
    const i = o.toLowerCase();
    return !n.exclude.some((a) => i.includes(a));
  });
  return r.length ? r : t;
}
function Go(e = "") {
  return e === "delegate" ? "delegate" : "main";
}
function Vn(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function yP(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function En(e = "") {
  return e === "openai-compatible" || e === "sillytavern-openai-compatible";
}
function _P(e = "") {
  return e === "anthropic" || e === "sillytavern-claude";
}
function vP(e = "") {
  return e === "sillytavern-claude" ? hl : e === "sillytavern-google" ? pl : Qn;
}
function Qr(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function AP(e) {
  const t = Vn(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return Qr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return Qr([`${t}/v1/models`, `${t}/models`]);
}
function Tg(e) {
  const t = Vn(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return Qr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return Qr([`${t}/v1/models`, `${t}/models`]);
}
function TP(e, t) {
  const n = Vn(e);
  if (!n) return [];
  const r = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return Qr([
    `${n}/models?key=${encodeURIComponent(t)}`,
    `${n}/models`,
    `${r}/v1beta/models?key=${encodeURIComponent(t)}`,
    `${r}/v1beta/models`,
    `${r}/models?key=${encodeURIComponent(t)}`,
    `${r}/models`
  ]);
}
function SP(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((r) => typeof r == "string" && r.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function EP(e, t = {}) {
  const n = await fetch(e, t), r = await n.text();
  let o = null, i = null;
  try {
    o = r ? JSON.parse(r) : {};
  } catch (a) {
    i = a;
  }
  return {
    ok: n.ok,
    status: n.status,
    url: e,
    data: o,
    rawText: r,
    parseError: i,
    errorSnippet: SP(o, r)
  };
}
function wP(e) {
  return Xr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function Sg(e) {
  return Xr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function IP(e) {
  return Xr((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function ri({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: r }) {
  let o = null;
  for (const i of e) for (const a of t) {
    const u = await EP(i, a);
    if (!u.ok) {
      o = u;
      continue;
    }
    if (u.parseError) {
      o = {
        ...u,
        errorSnippet: "返回的不是 JSON"
      };
      continue;
    }
    const c = n(u.data);
    if (c.length) return c;
    o = {
      ...u,
      errorSnippet: "返回成功，但模型列表为空"
    };
  }
  if (o) {
    const i = o.url ? ` (${o.url})` : "", a = o.errorSnippet ? `：${o.errorSnippet}` : "";
    throw new Error(`${r} 拉取模型失败：${o.status || "unknown"}${a}${i}`);
  }
  throw new Error(`${r} 拉取模型失败：未获取到模型列表。`);
}
async function CP(e) {
  const t = String(e.apiKey || "").trim(), n = Vn(e.baseUrl || ""), r = Vn(n || cg.claude);
  if (t && r) try {
    return await ri({
      urls: Tg(r),
      requestOptionsList: [{ headers: {
        "x-api-key": t,
        "anthropic-version": "2023-06-01",
        Accept: "application/json"
      } }],
      extractModels: Sg,
      providerLabel: "Anthropic"
    });
  } catch (o) {
    if (n) throw o;
  }
  return [...gP];
}
async function Jd(e) {
  const t = e.provider, n = Vn(e.baseUrl || ""), r = String(e.apiKey || "").trim();
  if (t === "sillytavern-claude") return Xr(await CP(e));
  if (yP(t)) return Xr(await U0(e, vP(t)));
  if (!r) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await ri({
    urls: TP(n, r),
    requestOptionsList: [
      { headers: {
        Accept: "application/json",
        "x-goog-api-key": r
      } },
      { headers: {
        Accept: "application/json",
        Authorization: `Bearer ${r}`
      } },
      { headers: { Accept: "application/json" } }
    ],
    extractModels: IP,
    providerLabel: "Google AI"
  }) : _P(t) ? await ri({
    urls: Tg(n),
    requestOptionsList: [{ headers: {
      "x-api-key": r,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: Sg,
    providerLabel: "Anthropic"
  }) : await ri({
    urls: AP(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${r}`,
      Accept: "application/json"
    } }],
    extractModels: wP,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function bP(e) {
  return e instanceof Error ? e.message : String(e || "unknown_error");
}
function $P(e = {}) {
  const { state: t, render: n, showToast: r, createRequestId: o = (g = "req") => `${g}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, saveConfig: i, reloadConfig: a, describeError: u = bP, getRuntimeSummaryText: c } = e;
  function d() {
    t.configFormSyncPending = !0;
  }
  function h(g, C = "main") {
    const A = String(g || "").trim() || "openai-compatible";
    return C === "delegate" ? `delegate:${A}` : A;
  }
  function f(g, C = "main") {
    return t.pullStateByProvider?.[h(g, C)] || {
      status: "idle",
      message: ""
    };
  }
  function p(g, C, A = "main") {
    t.pullStateByProvider = {
      ...t.pullStateByProvider || {},
      [h(g, A)]: C
    };
  }
  function m(g, C, A = "main") {
    t.modelOptionsByProvider = {
      ...t.modelOptionsByProvider || {},
      [h(g, A)]: Array.isArray(C) ? C : []
    };
  }
  function y(g, C = "main") {
    const A = h(g, C);
    return Array.isArray(t.modelOptionsByProvider?.[A]) ? t.modelOptionsByProvider[A] : [];
  }
  function _(g, C) {
    const A = t.config?.presets || {}, M = oe(g || C || "默认");
    return A[M] ? M : C && A[C] ? C : Object.keys(A)[0] || "默认";
  }
  function v(g, C) {
    const A = _(g, Ei), M = C && typeof C == "object" ? C : Me(), B = M.provider || "openai-compatible", se = Ke(M.modelConfigs || {}), ee = se[B] || {}, de = Bo(B, ee);
    return {
      delegatePresetName: A,
      delegateProvider: B,
      delegateModelConfigs: se,
      delegateBaseUrl: String(ee.baseUrl || ""),
      delegateModel: String(ee.model || ""),
      delegateApiKey: String(ee.apiKey || ""),
      delegateTemperature: Ve(ee.temperature, 1),
      delegateMaxTokens: ue(ee.maxTokens),
      delegateSendTemperature: Bn(ee),
      delegateReasoningMode: de.reasoningMode,
      delegateReasoningOutput: de.reasoningOutput,
      delegateReasoningEffort: de.reasoningEffort,
      delegateReasoningBudgetTokens: de.reasoningBudgetTokens,
      delegateToolMode: ee.toolMode || "native"
    };
  }
  function E(g = "openai-compatible", C = {}) {
    const A = Ke(C || {})[g] || {}, M = Bo(g, A);
    return {
      baseUrl: String(A.baseUrl || ""),
      model: String(A.model || ""),
      apiKey: String(A.apiKey || ""),
      temperature: Ve(A.temperature, 1),
      maxTokens: ue(A.maxTokens),
      sendTemperature: Bn(A),
      ...M,
      toolMode: A.toolMode || "native"
    };
  }
  function b(g = "openai-compatible", C = {}) {
    const A = Ke(C || {})[g] || {}, M = Bo(g, A);
    return {
      delegateBaseUrl: String(A.baseUrl || ""),
      delegateModel: String(A.model || ""),
      delegateApiKey: String(A.apiKey || ""),
      delegateTemperature: Ve(A.temperature, 1),
      delegateMaxTokens: ue(A.maxTokens),
      delegateSendTemperature: Bn(A),
      delegateReasoningMode: M.reasoningMode,
      delegateReasoningOutput: M.reasoningOutput,
      delegateReasoningEffort: M.reasoningEffort,
      delegateReasoningBudgetTokens: M.reasoningBudgetTokens,
      delegateToolMode: A.toolMode || "native"
    };
  }
  function R(g, C, A = t.config) {
    const M = oe(g || "默认"), B = C && typeof C == "object" ? C : Me(), se = B.provider || "openai-compatible", ee = Ke(B.modelConfigs || {}), de = E(se, ee), ve = _(A?.delegatePresetName, M), ae = v(ve, A?.delegateConfig && typeof A.delegateConfig == "object" ? A.delegateConfig : (A?.presets || {})[ve] || B);
    return {
      currentPresetName: M,
      presetDraftName: M,
      provider: se,
      modelConfigs: ee,
      ...de,
      tavilyApiKey: String(A?.tavilyApiKey || ""),
      tavilyBaseUrl: Ze(A?.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: xn(B.permissionMode),
      jsApiPermission: Et(A?.jsApiPermission),
      ...ae
    };
  }
  function P() {
    if (t.configDraft) return t.configDraft;
    const g = oe(t.config?.currentPresetName || "默认");
    return t.configDraft = R(g, (t.config?.presets || {})[g] || Me()), t.configDraft;
  }
  function L(g, C = {}) {
    const A = P(), M = C.provider || g.querySelector("#xb-assistant-provider")?.value || A.provider || "openai-compatible", B = C.delegateProvider || g.querySelector("#xb-assistant-delegate-provider")?.value || A.delegateProvider || "openai-compatible", se = g.querySelector("#xb-assistant-base-url")?.value.trim() || "", ee = g.querySelector("#xb-assistant-model")?.value.trim() || "", de = g.querySelector("#xb-assistant-delegate-base-url")?.value.trim() ?? A.delegateBaseUrl ?? "", ve = g.querySelector("#xb-assistant-delegate-model")?.value.trim() ?? A.delegateModel ?? "", ae = Kd({
      mode: g.querySelector("#xb-assistant-reasoning-mode")?.value || A.reasoningMode,
      output: g.querySelector("#xb-assistant-reasoning-output")?.value || A.reasoningOutput,
      effort: g.querySelector("#xb-assistant-reasoning-effort")?.value || A.reasoningEffort,
      budgetTokens: g.querySelector("#xb-assistant-reasoning-budget")?.value ?? A.reasoningBudgetTokens
    }), gt = Kd({
      mode: g.querySelector("#xb-assistant-delegate-reasoning-mode")?.value || A.delegateReasoningMode,
      output: g.querySelector("#xb-assistant-delegate-reasoning-output")?.value || A.delegateReasoningOutput,
      effort: g.querySelector("#xb-assistant-delegate-reasoning-effort")?.value || A.delegateReasoningEffort,
      budgetTokens: g.querySelector("#xb-assistant-delegate-reasoning-budget")?.value ?? A.delegateReasoningBudgetTokens
    }), fe = {
      baseUrl: se,
      model: ee,
      apiKey: g.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      temperature: Ve(g.querySelector("#xb-assistant-temperature")?.value, A.temperature ?? 1),
      maxTokens: ue(g.querySelector("#xb-assistant-max-tokens")?.value, A.maxTokens),
      sendTemperature: g.querySelector("#xb-assistant-send-temperature")?.checked ?? !!(A.sendTemperature ?? !0),
      reasoning: ae,
      toolMode: En(M) ? g.querySelector("#xb-assistant-tool-mode")?.value || A.toolMode || "native" : void 0
    }, Ee = {
      baseUrl: de,
      model: ve,
      apiKey: g.querySelector("#xb-assistant-delegate-api-key")?.value.trim() ?? A.delegateApiKey ?? "",
      temperature: Ve(g.querySelector("#xb-assistant-delegate-temperature")?.value, A.delegateTemperature ?? 1),
      maxTokens: ue(g.querySelector("#xb-assistant-delegate-max-tokens")?.value, A.delegateMaxTokens),
      sendTemperature: g.querySelector("#xb-assistant-delegate-send-temperature")?.checked ?? !!(A.delegateSendTemperature ?? !0),
      reasoning: gt,
      toolMode: En(B) ? g.querySelector("#xb-assistant-delegate-tool-mode")?.value || A.delegateToolMode || "native" : void 0
    }, Ht = {
      ...Ke(A.modelConfigs || {}),
      [M]: {
        ...Ke(A.modelConfigs || {})[M] || {},
        ...fe
      }
    }, Vt = {
      ...Ke(A.delegateModelConfigs || {}),
      [B]: {
        ...Ke(A.delegateModelConfigs || {})[B] || {},
        ...Ee
      }
    };
    return {
      ...A,
      currentPresetName: A.currentPresetName,
      presetDraftName: oe(g.querySelector("#xb-assistant-preset-name")?.value),
      provider: M,
      modelConfigs: Ht,
      baseUrl: fe.baseUrl,
      model: fe.model,
      apiKey: fe.apiKey,
      temperature: fe.temperature,
      maxTokens: fe.maxTokens,
      sendTemperature: fe.sendTemperature,
      reasoningMode: fe.reasoning.mode,
      reasoningOutput: fe.reasoning.output,
      reasoningEffort: fe.reasoning.effort || "",
      reasoningBudgetTokens: fe.reasoning.budgetTokens,
      toolMode: fe.toolMode || A.toolMode || "native",
      tavilyApiKey: g.querySelector("#xb-assistant-tavily-api-key")?.value.trim() || "",
      tavilyBaseUrl: Ze(A.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: xn(g.querySelector("#xb-assistant-permission-mode")?.value || A.permissionMode),
      jsApiPermission: Et(g.querySelector("#xb-assistant-jsapi-permission")?.value || A.jsApiPermission),
      delegatePresetName: _(g.querySelector("#xb-assistant-delegate-preset-select")?.value || A.delegatePresetName, A.currentPresetName),
      delegateProvider: B,
      delegateModelConfigs: Vt,
      delegateBaseUrl: Ee.baseUrl,
      delegateModel: Ee.model,
      delegateApiKey: Ee.apiKey,
      delegateTemperature: Ee.temperature,
      delegateMaxTokens: Ee.maxTokens,
      delegateSendTemperature: Ee.sendTemperature,
      delegateReasoningMode: Ee.reasoning.mode,
      delegateReasoningOutput: Ee.reasoning.output,
      delegateReasoningEffort: Ee.reasoning.effort || "",
      delegateReasoningBudgetTokens: Ee.reasoning.budgetTokens,
      delegateToolMode: Ee.toolMode || A.delegateToolMode || "native"
    };
  }
  function S(g, C = {}) {
    return t.configDraft = L(g, C), t.configDirty = !0, t.configDraft;
  }
  function O(g = P()) {
    return {
      baseUrl: String(g.baseUrl || ""),
      model: String(g.model || ""),
      apiKey: String(g.apiKey || ""),
      temperature: Ve(g.temperature, 1),
      maxTokens: ue(g.maxTokens),
      sendTemperature: !!(g.sendTemperature ?? !0),
      reasoning: un({
        mode: g.reasoningMode,
        output: g.reasoningOutput,
        effort: g.reasoningEffort,
        budgetTokens: g.reasoningBudgetTokens
      }),
      toolMode: En(g.provider) ? g.toolMode || "native" : void 0
    };
  }
  function x(g = P()) {
    return {
      baseUrl: String(g.delegateBaseUrl || ""),
      model: String(g.delegateModel || ""),
      apiKey: String(g.delegateApiKey || ""),
      temperature: Ve(g.delegateTemperature, 1),
      maxTokens: ue(g.delegateMaxTokens),
      sendTemperature: !!(g.delegateSendTemperature ?? !0),
      reasoning: un({
        mode: g.delegateReasoningMode,
        output: g.delegateReasoningOutput,
        effort: g.delegateReasoningEffort,
        budgetTokens: g.delegateReasoningBudgetTokens
      }),
      toolMode: En(g.delegateProvider) ? g.delegateToolMode || "native" : void 0
    };
  }
  function D(g = P()) {
    const C = g.delegateProvider || "openai-compatible", A = Ke(g.delegateModelConfigs || {});
    return {
      provider: C,
      modelConfigs: {
        ...A,
        [C]: {
          ...A[C] || {},
          ...x(g)
        }
      }
    };
  }
  function H(g = P()) {
    return {
      provider: g.provider || "openai-compatible",
      baseUrl: g.baseUrl || "",
      model: g.model || "",
      apiKey: g.apiKey || "",
      tavilyApiKey: g.tavilyApiKey || "",
      tavilyBaseUrl: Ze(g.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: g.sendTemperature === !1 ? void 0 : Ve(g.temperature, 1),
      sendTemperature: !!(g.sendTemperature ?? !0),
      maxTokens: ue(g.maxTokens),
      timeoutMs: Bd,
      toolMode: g.toolMode || "native",
      reasoning: on({
        provider: g.provider,
        baseUrl: g.baseUrl,
        model: g.model,
        maxTokens: ue(g.maxTokens)
      }, {
        mode: g.reasoningMode,
        output: g.reasoningOutput,
        effort: g.reasoningEffort,
        budgetTokens: g.reasoningBudgetTokens
      })
    };
  }
  function z(g = P()) {
    return {
      provider: g.delegateProvider || "openai-compatible",
      baseUrl: g.delegateBaseUrl || "",
      model: g.delegateModel || "",
      apiKey: g.delegateApiKey || "",
      tavilyApiKey: g.tavilyApiKey || "",
      tavilyBaseUrl: Ze(g.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: g.delegateSendTemperature === !1 ? void 0 : Ve(g.delegateTemperature, 1),
      sendTemperature: !!(g.delegateSendTemperature ?? !0),
      maxTokens: ue(g.delegateMaxTokens),
      timeoutMs: Bd,
      toolMode: g.delegateToolMode || "native",
      reasoning: on({
        provider: g.delegateProvider,
        baseUrl: g.delegateBaseUrl,
        model: g.delegateModel,
        maxTokens: ue(g.delegateMaxTokens)
      }, {
        mode: g.delegateReasoningMode,
        output: g.delegateReasoningOutput,
        effort: g.delegateReasoningEffort,
        budgetTokens: g.delegateReasoningBudgetTokens
      })
    };
  }
  function ye(g = {}) {
    const C = [];
    Object.entries(g.presets || {}).forEach(([se, ee]) => {
      const de = ee?.provider || "openai-compatible", ve = ee?.modelConfigs?.[de] || {}, ae = on({
        provider: de,
        baseUrl: ve.baseUrl,
        model: ve.model,
        maxTokens: ue(ve.maxTokens)
      }, ve.reasoning);
      ae.valid === !1 && C.push(`预设“${se}”：${ae.error}`);
    });
    const A = g.delegateConfig?.provider || "openai-compatible", M = g.delegateConfig?.modelConfigs?.[A] || {}, B = on({
      provider: A,
      baseUrl: M.baseUrl,
      model: M.model,
      maxTokens: ue(M.maxTokens)
    }, M.reasoning);
    return B.valid === !1 && C.push(`分身模型：${B.error}`), C;
  }
  function Q(g = {}) {
    const C = (g.role === "delegate", P());
    return g.role === "delegate" ? z(C) : H(C);
  }
  function j(g) {
    P(), t.configDraft = {
      ...t.configDraft,
      presetDraftName: oe(g.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function X(g = P(), C = g.provider || "openai-compatible", A = "main") {
    const M = f(C, A);
    return typeof c == "function" ? c({
      state: t,
      draft: g,
      provider: C,
      pullState: M,
      providerLabel: Vd(C)
    }) : `预设「${g.currentPresetName || "默认"}」 · ${Vd(C)}`;
  }
  function Se(g, C, A) {
    const M = g?.querySelector?.(C);
    if (!M) return;
    const B = String(A?.status || "idle"), se = String(A?.message || "").trim();
    M.textContent = se, M.hidden = !se, M.classList.toggle("is-loading", B === "loading"), M.classList.toggle("is-success", B === "success"), M.classList.toggle("is-error", B === "error");
  }
  function Ye(g) {
    if (!g) return;
    const C = Go(t.configPage);
    t.configPage = C, g.querySelectorAll("[data-config-page]").forEach((A) => {
      const M = Go(A?.dataset?.configPage) === C;
      A.classList.toggle("is-active", M), A.setAttribute("aria-selected", M ? "true" : "false");
    }), g.querySelectorAll("[data-config-page-panel]").forEach((A) => {
      const M = Go(A?.dataset?.configPagePanel) === C;
      A.toggleAttribute("hidden", !M);
    }), g.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("hidden", C === "delegate");
  }
  function _e(g, C = "main") {
    const A = P(), M = C === "delegate", B = M ? "#xb-assistant-delegate-reasoning" : "#xb-assistant-reasoning", se = M ? A.delegateProvider : A.provider, ee = M ? A.delegateBaseUrl : A.baseUrl, de = M ? A.delegateModel : A.model, ve = {
      mode: M ? A.delegateReasoningMode : A.reasoningMode,
      output: M ? A.delegateReasoningOutput : A.reasoningOutput,
      effort: M ? A.delegateReasoningEffort : A.reasoningEffort,
      budgetTokens: M ? A.delegateReasoningBudgetTokens : A.reasoningBudgetTokens
    }, ae = ro({
      provider: se,
      baseUrl: ee,
      model: de
    }), gt = Bo(se, {
      baseUrl: ee,
      model: de,
      reasoning: ve
    }), fe = gt.reasoningMode, Ee = gt.reasoningOutput, Ht = gt.reasoningEffort, Vt = gt.reasoningBudgetTokens, Kt = g.querySelector(`${B}-mode`), mn = g.querySelector(`${B}-capability`), Zn = g.querySelector(`${B}-effort-wrap`), Jt = g.querySelector(`${B}-effort`), jn = g.querySelector(`${B}-budget-wrap`), Rt = g.querySelector(`${B}-budget`), gn = g.querySelector(`${B}-output`);
    Kt && (ot(Kt, u_(ae)), Kt.value = fe), mn && (mn.textContent = ae.unsupportedReason || `能力配置：${ae.profileId}`), Jt && (ot(Jt, c_(ae)), Jt.value = Ht), Zn && (Zn.style.display = fe === "on" && ae.intensity.kind === "effort" ? "" : "none"), Rt && ae.intensity.kind === "budget" && (Rt.min = ae.intensity.allowAuto ? "-1" : String(ae.intensity.min), Rt.max = String(ae.intensity.max), Rt.value = String(Vt)), jn && (jn.style.display = fe === "on" && ae.intensity.kind === "budget" ? "" : "none"), gn && (ot(gn, d_(ae)), gn.value = Ee);
  }
  function ie(g) {
    const C = g.querySelector("#xb-assistant-runtime");
    if (!C) return;
    const A = P(), M = t.configPage === "delegate", B = M ? A.delegateProvider : A.provider;
    C.textContent = X(M ? {
      ...A,
      currentPresetName: "分身",
      provider: B
    } : A, B || "openai-compatible", M ? "delegate" : "main");
  }
  function pn(g) {
    if (!t.config) return;
    Ye(g);
    const C = P(), A = C.provider || "openai-compatible", M = y(A), B = C.delegateProvider || "openai-compatible", se = y(B, "delegate"), ee = g.querySelector("#xb-assistant-provider"), de = g.querySelector("#xb-assistant-base-url"), ve = g.querySelector("#xb-assistant-model"), ae = g.querySelector("#xb-assistant-api-key"), gt = g.querySelector("#xb-assistant-temperature"), fe = g.querySelector("#xb-assistant-send-temperature"), Ee = g.querySelector("#xb-assistant-tool-mode-wrap"), Ht = g.querySelector("#xb-assistant-tool-mode"), Vt = g.querySelector("#xb-assistant-permission-mode"), Kt = g.querySelector("#xb-assistant-jsapi-permission"), mn = g.querySelector("#xb-assistant-model-pulled"), Zn = g.querySelector("#xb-assistant-max-tokens"), Jt = g.querySelector("#xb-assistant-preset-select"), jn = g.querySelector("#xb-assistant-preset-name"), Rt = g.querySelector("#xb-assistant-delegate-preset-select"), gn = g.querySelector("#xb-assistant-delegate-provider"), Tl = g.querySelector("#xb-assistant-delegate-base-url"), Sl = g.querySelector("#xb-assistant-delegate-model"), El = g.querySelector("#xb-assistant-delegate-api-key"), wl = g.querySelector("#xb-assistant-tavily-api-key"), Ji = g.querySelector("#xb-assistant-delegate-model-pulled"), Il = g.querySelector("#xb-assistant-delegate-max-tokens"), Cl = g.querySelector("#xb-assistant-delegate-tool-mode-wrap"), Wi = g.querySelector("#xb-assistant-delegate-tool-mode");
    if (!Jt || !jn) return;
    const bl = (t.config.presetNames || []).map((xt) => ({
      value: xt,
      label: xt
    }));
    ot(Jt, bl), Jt.value = C.currentPresetName || t.config.currentPresetName || "默认", Rt && (ot(Rt, bl), Rt.value = _(C.delegatePresetName, C.currentPresetName)), jn.value = C.presetDraftName || C.currentPresetName || "默认", ee && (ee.value = A), de && (de.value = C.baseUrl || ""), ve && (ve.value = C.model || ""), ae && (ae.value = C.apiKey || ""), Zn && (Zn.value = String(ue(C.maxTokens))), gt && (gt.value = String(Ve(C.temperature, 1))), fe && (fe.checked = !!(C.sendTemperature ?? !0)), wl && (wl.value = C.tavilyApiKey || ""), Ee && (Ee.style.display = En(A) ? "" : "none"), Ht && (ot(Ht, Gd), Ht.value = C.toolMode || "native"), Vt && (ot(Vt, Bg), Vt.value = xn(C.permissionMode)), Kt && (ot(Kt, Gg), Kt.value = Et(C.jsApiPermission)), _e(g), mn && (ot(mn, M.map((xt) => ({
      value: xt,
      label: xt
    })), "手动填写"), mn.value = M.includes(C.model) ? C.model : ""), gn && (gn.value = B), Tl && (Tl.value = C.delegateBaseUrl || ""), Sl && (Sl.value = C.delegateModel || ""), El && (El.value = C.delegateApiKey || "");
    const Pl = g.querySelector("#xb-assistant-delegate-temperature"), Rl = g.querySelector("#xb-assistant-delegate-send-temperature");
    Il && (Il.value = String(ue(C.delegateMaxTokens))), Pl && (Pl.value = String(Ve(C.delegateTemperature, 1))), Rl && (Rl.checked = !!(C.delegateSendTemperature ?? !0)), Cl && (Cl.style.display = En(B) ? "" : "none"), Wi && (ot(Wi, Gd), Wi.value = C.delegateToolMode || "native"), _e(g, "delegate"), Ji && (ot(Ji, se.map((xt) => ({
      value: xt,
      label: xt
    })), "手动填写"), Ji.value = se.includes(C.delegateModel) ? C.delegateModel : ""), Se(g, "#xb-assistant-model-pull-status", f(A)), Se(g, "#xb-assistant-delegate-model-pull-status", f(B, "delegate")), ie(g);
  }
  function Eg(g) {
    if (typeof i != "function") return;
    const C = i(g);
    C && typeof C.catch == "function" && C.catch((A) => {
      r?.(u(A));
    });
  }
  function Ki(g, C, A) {
    g.querySelector(C)?.addEventListener("click", () => {
      const M = g.querySelector(A);
      M && (M.type = M.type === "password" ? "text" : "password");
    });
  }
  function wg(g) {
    return {
      expectedUpdatedAt: Number(g?.updatedAt) || 0,
      workspaceFileName: g?.workspaceFileName || "",
      jsApiPermission: Et(g?.jsApiPermission),
      tavilyApiKey: String(g?.tavilyApiKey || ""),
      tavilyBaseUrl: Ze(g?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: g?.currentPresetName || "默认",
      delegatePresetName: g?.delegatePresetName || g?.currentPresetName || "默认",
      delegateConfig: g?.delegateConfig || {},
      delegateConfigured: g?.delegateConfigured === !0,
      presets: g?.presets || {}
    };
  }
  function vl(g, C = {}) {
    const A = _s(g), M = ye(A);
    if (M.length)
      return r?.(M[0]), !1;
    t.config = A;
    const B = oe(C.presetName || A.currentPresetName || "默认");
    return t.configDraft = R(B, A.presets?.[B] || Me(), A), d(), Eg({
      requestId: o(C.requestPrefix || "save-config"),
      config: A,
      payload: wg(A)
    }), !0;
  }
  function ho(g, C = {}) {
    const A = S(g), M = oe(C.presetName || A.presetDraftName), B = oe(A.currentPresetName || t.config?.currentPresetName || "默认"), se = (t.config?.presets || {})[B] || Me(), ee = Ke(A.modelConfigs || se.modelConfigs || {}), de = {
      ...se,
      provider: A.provider,
      permissionMode: xn(A.permissionMode),
      modelConfigs: {
        ...ee,
        [A.provider]: {
          ...ee[A.provider] || {},
          ...O(A)
        }
      }
    }, ve = { ...t.config?.presets || {} };
    C.renameCurrentPreset && M !== B && delete ve[B], ve[M] = de, vl({
      ...t.config,
      jsApiPermission: Et(A.jsApiPermission),
      tavilyApiKey: String(A.tavilyApiKey || ""),
      tavilyBaseUrl: Ze(A.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: M,
      delegatePresetName: _(A.delegatePresetName, M),
      delegateConfig: D(A),
      delegateConfigured: C.configureDelegate === !0 || t.config?.delegateConfigured === !0,
      presets: ve
    }, {
      presetName: M,
      requestPrefix: C.requestPrefix
    });
  }
  function Al(g, C = "") {
    const A = oe(C || "默认"), M = typeof window < "u" && typeof window.prompt == "function" ? window.prompt(g, A) : A;
    return M === null ? "" : oe(M);
  }
  function Ig(g) {
    const C = Al("输入新预设名称：", `${S(g).currentPresetName || "默认"} 副本`);
    if (!C) {
      r?.("预设名称不能为空");
      return;
    }
    const A = g.querySelector("#xb-assistant-preset-name");
    A && (A.value = C, ho(g, {
      presetName: C,
      requestPrefix: "create-preset"
    }));
  }
  function Cg(g) {
    const C = S(g), A = oe(C.currentPresetName || t.config?.currentPresetName || "默认"), M = Al("输入预设名称：", C.presetDraftName || A);
    if (!M) {
      r?.("预设名称不能为空");
      return;
    }
    if (M === A) return;
    const B = g.querySelector("#xb-assistant-preset-name");
    B && (B.value = M, ho(g, {
      presetName: M,
      renameCurrentPreset: !0,
      requestPrefix: "rename-preset"
    }));
  }
  function bg(g) {
    if (Object.keys(t.config?.presets || {}).length <= 1) {
      r?.("至少要保留一套预设");
      return;
    }
    const C = S(g), A = oe(t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), M = { ...t.config?.presets || {} };
    delete M[A];
    const B = Object.keys(M)[0] || "默认";
    vl({
      ...t.config,
      jsApiPermission: Et(C.jsApiPermission),
      tavilyApiKey: String(C.tavilyApiKey || t.config?.tavilyApiKey || ""),
      tavilyBaseUrl: Ze(C.tavilyBaseUrl || t.config?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: B,
      delegatePresetName: _(C.delegatePresetName, B),
      delegateConfig: D(C),
      presets: M
    }, {
      presetName: B,
      requestPrefix: "delete-preset"
    }) && n?.();
  }
  function Pg(g) {
    g?.querySelector?.("[data-xb-agent-config-retry]")?.addEventListener("click", () => {
      a?.();
    }), g?.querySelector?.("[data-xb-agent-config-reload]")?.addEventListener("click", () => {
      t.configDraft = null, t.configDirty = !1, t.configExternalChangePending = !1, d(), n?.();
    }), g?.querySelector?.("#xb-assistant-provider") && (g.querySelector("#xb-assistant-provider")?.addEventListener("change", (C) => {
      const A = C.currentTarget.value, M = P().provider, B = S(g, { provider: M });
      t.configDraft = {
        ...B,
        provider: A,
        ...E(A, B.modelConfigs)
      }, d(), n?.();
    }), g.querySelector("#xb-assistant-preset-select")?.addEventListener("change", (C) => {
      const A = oe(C.currentTarget.value), M = (t.config?.presets || {})[A] || Me(), B = S(g);
      t.config = _s({
        ...t.config,
        jsApiPermission: Et(B.jsApiPermission),
        currentPresetName: A,
        delegatePresetName: _(B.delegatePresetName, A),
        delegateConfig: D(B)
      }), t.configDraft = R(A, M, t.config), d(), n?.();
    }), g.querySelector("#xb-assistant-preset-name")?.addEventListener("input", () => {
      j(g);
    }), g.querySelector("#xb-assistant-base-url")?.addEventListener("input", () => {
      S(g), _e(g), ie(g);
    }), g.querySelector("#xb-assistant-model")?.addEventListener("input", () => {
      S(g), _e(g), ie(g);
    }), g.querySelector("#xb-assistant-api-key")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-max-tokens")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-temperature")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-send-temperature")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-tavily-api-key")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-model-pulled")?.addEventListener("change", (C) => {
      const A = C.currentTarget.value;
      if (!A) return;
      const M = g.querySelector("#xb-assistant-model");
      M && (M.value = A), S(g), _e(g), ie(g);
    }), Ki(g, "#xb-assistant-toggle-key", "#xb-assistant-api-key"), Ki(g, "#xb-assistant-toggle-tavily-key", "#xb-assistant-tavily-api-key"), g.querySelector("#xb-assistant-delegate-provider")?.addEventListener("change", (C) => {
      const A = C.currentTarget.value, M = P().delegateProvider, B = S(g, { delegateProvider: M });
      t.configDraft = {
        ...B,
        delegateProvider: A,
        ...b(A, B.delegateModelConfigs)
      }, d(), n?.();
    }), g.querySelector("#xb-assistant-delegate-base-url")?.addEventListener("input", () => {
      S(g), _e(g, "delegate"), ie(g);
    }), g.querySelector("#xb-assistant-delegate-model")?.addEventListener("input", () => {
      S(g), _e(g, "delegate"), ie(g);
    }), g.querySelector("#xb-assistant-delegate-api-key")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-max-tokens")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-temperature")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-send-temperature")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-model-pulled")?.addEventListener("change", (C) => {
      const A = C.currentTarget.value;
      if (!A) return;
      const M = g.querySelector("#xb-assistant-delegate-model");
      M && (M.value = A), S(g), _e(g, "delegate"), ie(g);
    }), Ki(g, "#xb-assistant-delegate-toggle-key", "#xb-assistant-delegate-api-key"), g.querySelector("#xb-assistant-reasoning-mode")?.addEventListener("change", () => {
      S(g), _e(g), ie(g);
    }), g.querySelector("#xb-assistant-reasoning-effort")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-reasoning-budget")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-reasoning-output")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-tool-mode")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-reasoning-mode")?.addEventListener("change", () => {
      S(g), _e(g, "delegate"), ie(g);
    }), g.querySelector("#xb-assistant-delegate-reasoning-effort")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-reasoning-budget")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-reasoning-output")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-tool-mode")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-permission-mode")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-jsapi-permission")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-preset-select")?.addEventListener("change", (C) => {
      const A = _(C.currentTarget?.value, t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), M = (t.config?.presets || {})[A] || Me();
      t.configDraft = {
        ...S(g),
        ...v(A, M)
      }, d(), n?.();
    }), g.querySelectorAll("[data-config-page]").forEach((C) => {
      C.addEventListener("click", (A) => {
        S(g), t.configPage = Go(A.currentTarget?.dataset?.configPage), Ye(g), pn(g);
      });
    }), g.querySelector("#xb-assistant-pull-models")?.addEventListener("click", async () => {
      S(g), d();
      const C = Q();
      p(C.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), n?.();
      try {
        const A = await Jd(C);
        m(C.provider, A), p(C.provider, {
          status: "success",
          message: `已拉取 ${A.length} 个模型`
        });
      } catch (A) {
        m(C.provider, []), p(C.provider, {
          status: "error",
          message: u(A)
        });
      }
      d(), n?.();
    }), g.querySelector("#xb-assistant-delegate-pull-models")?.addEventListener("click", async () => {
      S(g), d();
      const C = Q({ role: "delegate" });
      p(C.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }, "delegate"), n?.();
      try {
        const A = await Jd(C);
        m(C.provider, A, "delegate"), p(C.provider, {
          status: "success",
          message: `已拉取 ${A.length} 个模型`
        }, "delegate");
      } catch (A) {
        m(C.provider, [], "delegate"), p(C.provider, {
          status: "error",
          message: u(A)
        }, "delegate");
      }
      d(), n?.();
    }), g.querySelector("#xb-assistant-new-preset")?.addEventListener("click", () => {
      Ig(g);
    }), g.querySelector("#xb-assistant-rename-preset")?.addEventListener("click", () => {
      Cg(g);
    }), g.querySelector("#xb-assistant-save")?.addEventListener("click", () => {
      ho(g);
    }), g.querySelector("#xb-assistant-delegate-save")?.addEventListener("click", () => {
      ho(g, {
        requestPrefix: "save-delegate-config",
        configureDelegate: !0
      });
    }), g.querySelector("#xb-assistant-delete-preset")?.addEventListener("click", () => {
      bg(g);
    }));
  }
  return {
    getActiveProviderConfig: Q,
    syncConfigToForm: pn,
    bindSettingsPanelEvents: Pg
  };
}
function Ur(e = "") {
  return String(e || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Ar(e) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${{
    add: '<path d="M12 5v14" /><path d="M5 12h14" />',
    rename: '<path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />',
    save: '<path d="M5 21h14a1 1 0 0 0 1-1V7.5L16.5 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z" /><path d="M8 21v-7h8v7" /><path d="M8 4v5h7" />',
    saving: '<path class="xb-assistant-save-spinner" d="M12 3a9 9 0 1 1-8.2 5.3" />',
    success: '<path d="M20 6 9 17l-5-5" />',
    error: '<path d="M18 6 6 18" /><path d="M6 6l12 12" />',
    delete: '<path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />'
  }[e] || ""}</svg>`;
}
function PP(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? "saving" : t === "success" ? "success" : t === "error" ? "error" : "save";
}
function RP(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? {
    className: "xb-assistant-save-button is-saving",
    title: "正在保存配置"
  } : t === "success" ? {
    className: "xb-assistant-save-button is-success",
    title: "配置已保存"
  } : t === "error" ? {
    className: "xb-assistant-save-button is-error",
    title: Ur(e?.error || "保存失败")
  } : {
    className: "xb-assistant-save-button",
    title: "保存配置"
  };
}
function LP(e = {}) {
  const { configSave: t = {}, runtimeText: n = "", inlineToastText: r = "", showInlineToast: o = !0, showAssistantPermissions: i = !0, showDelegateSettings: a = !0, activePage: u = "main", delegatePresetHint: c = "DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。", isBusy: d = !1, canDeletePreset: h = !0, configLoadError: f = "", configExternalChangePending: p = !1 } = e, m = String(f || "").trim(), y = RP(t), _ = PP(t), v = d || m || String(t?.status || "") === "saving" ? "disabled" : "", E = d || !h ? "disabled" : "", b = u === "delegate" ? "delegate" : "main", R = b === "main", P = b === "delegate", L = i ? `
            <label>
                <span>斜杠命令权限</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>
            <label>
                <span>JavaScript API 权限</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>` : "", S = a ? `
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${R ? "is-active" : ""}" data-config-page="main" role="tab" aria-selected="${R ? "true" : "false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${P ? "is-active" : ""}" data-config-page="delegate" role="tab" aria-selected="${P ? "true" : "false"}">分身 API</button>
            </div>` : "", O = a ? `
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${P ? "" : "hidden"}>
                <p class="xb-assistant-config-note">${Ur(c)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${y.className}" title="${y.title}" aria-label="${y.title}" ${v}>${Ar(_)}</button>
                    </div>
                </div>
                <label>
                    <span>Provider</span>
                    <select id="xb-assistant-delegate-provider">
                        <option value="openai-responses">OpenAI Responses</option>
                        <option value="openai-compatible">OpenAI 兼容</option>
                        <option value="sillytavern-openai-compatible">酒馆 OpenAI 兼容</option>
                        <option value="sillytavern-claude">酒馆 Claude</option>
                        <option value="sillytavern-google">酒馆 Google AI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google AI</option>
                    </select>
                </label>
                <label>
                    <span>Base URL</span>
                    <input id="xb-assistant-delegate-base-url" type="text" />
                </label>
                <label>
                    <span>API Key</span>
                    <div class="xb-assistant-inline-input">
                        <input id="xb-assistant-delegate-api-key" type="password" />
                        <button id="xb-assistant-delegate-toggle-key" type="button" class="secondary ghost">显示</button>
                    </div>
                </label>
                <label>
                    <span>Model</span>
                    <input id="xb-assistant-delegate-model" type="text" />
                </label>
                <div class="xb-assistant-inline-input xb-assistant-model-row">
                    <label class="xb-assistant-grow">
                        <span>已拉取模型</span>
                        <select id="xb-assistant-delegate-model-pulled">
                            <option value="">手动填写</option>
                        </select>
                    </label>
                    <button id="xb-assistant-delegate-pull-models" type="button" class="secondary" ${d ? "disabled" : ""}>拉取模型</button>
                </div>
                <div class="xb-assistant-inline-status" id="xb-assistant-delegate-model-pull-status" aria-live="polite" hidden></div>
                <label>
                    <span>最大输出 Token</span>
                    <input id="xb-assistant-delegate-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
                </label>
                <div class="xb-assistant-temperature-row">
                    <label>
                        <span>温度</span>
                        <input id="xb-assistant-delegate-temperature" type="number" min="0" max="2" step="0.05" />
                    </label>
                    <label class="xb-assistant-checkbox-row">
                        <span>允许传参</span>
                        <span class="xb-assistant-checkbox-control">
                            <input id="xb-assistant-delegate-send-temperature" type="checkbox" />
                        </span>
                    </label>
                </div>
                <label id="xb-assistant-delegate-tool-mode-wrap">
                    <span>Tool 调用格式</span>
                    <select id="xb-assistant-delegate-tool-mode"></select>
                </label>
                <label>
                    <span>Reasoning 模式</span>
                    <select id="xb-assistant-delegate-reasoning-mode"></select>
                    <small id="xb-assistant-delegate-reasoning-capability"></small>
                </label>
                <label id="xb-assistant-delegate-reasoning-effort-wrap">
                    <span>思考强度</span>
                    <select id="xb-assistant-delegate-reasoning-effort"></select>
                </label>
                <label id="xb-assistant-delegate-reasoning-budget-wrap">
                    <span>思考 Token 预算</span>
                    <input id="xb-assistant-delegate-reasoning-budget" type="number" step="1" inputmode="numeric" />
                    <small>支持 -1 时表示由模型自动决定</small>
                </label>
                <label>
                    <span>思考内容</span>
                    <select id="xb-assistant-delegate-reasoning-output"></select>
                    <small>只控制界面展示；隐藏时仍保留续轮所需签名</small>
                </label>
            </div>` : "";
  return `
        <section class="xb-assistant-config">
            <div class="xb-assistant-config-alert is-error" data-xb-agent-config-load-error ${m ? "" : "hidden"}>
                <span data-xb-agent-config-load-error-message>${Ur(m)}</span>
                <button type="button" data-xb-agent-config-retry>重新读取</button>
            </div>
            <div class="xb-assistant-config-alert is-conflict" data-xb-agent-config-conflict ${m || !p ? "hidden" : ""}>
                <span>共享配置已在其他页面更新。当前未保存编辑仍保留；重新载入会放弃这些编辑。</span>
                <button type="button" data-xb-agent-config-reload>重新载入</button>
            </div>
            <fieldset class="xb-assistant-config-fields" data-xb-agent-config-fields ${m ? "disabled" : ""}>
            ${S}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${R ? "" : "hidden"}>
            <div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${d ? "disabled" : ""}>${Ar("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${d ? "disabled" : ""}>${Ar("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${y.className}" title="${y.title}" aria-label="${y.title}" ${v}>${Ar(_)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${E}>${Ar("delete")}</button>
                </div>
            </div>
            <label>
                <span>Provider</span>
                <select id="xb-assistant-provider">
                    <option value="openai-responses">OpenAI Responses</option>
                    <option value="openai-compatible">OpenAI 兼容</option>
                    <option value="sillytavern-openai-compatible">酒馆 OpenAI 兼容</option>
                    <option value="sillytavern-claude">酒馆 Claude</option>
                    <option value="sillytavern-google">酒馆 Google AI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google AI</option>
                </select>
            </label>
            <label>
                <span>Base URL</span>
                <input id="xb-assistant-base-url" type="text" />
            </label>
            <label>
                <span>API Key</span>
                <div class="xb-assistant-inline-input">
                    <input id="xb-assistant-api-key" type="password" />
                    <button id="xb-assistant-toggle-key" type="button" class="secondary ghost">显示</button>
                </div>
            </label>
            <label>
                <span>Model</span>
                <input id="xb-assistant-model" type="text" />
            </label>
            <div class="xb-assistant-inline-input xb-assistant-model-row">
                <label class="xb-assistant-grow">
                    <span>已拉取模型</span>
                    <select id="xb-assistant-model-pulled">
                        <option value="">手动填写</option>
                    </select>
                </label>
                <button id="xb-assistant-pull-models" type="button" class="secondary" ${d ? "disabled" : ""}>拉取模型</button>
            </div>
            <div class="xb-assistant-inline-status" id="xb-assistant-model-pull-status" aria-live="polite" hidden></div>
            <label>
                <span>最大输出 Token</span>
                <input id="xb-assistant-max-tokens" type="number" min="1" step="1" inputmode="numeric" />
            </label>
            <div class="xb-assistant-temperature-row">
                <label>
                    <span>温度</span>
                    <input id="xb-assistant-temperature" type="number" min="0" max="2" step="0.05" />
                </label>
                <label class="xb-assistant-checkbox-row">
                    <span>允许传参</span>
                    <span class="xb-assistant-checkbox-control">
                        <input id="xb-assistant-send-temperature" type="checkbox" />
                    </span>
                </label>
            </div>
            <label>
                <span>Tavily API Key（全局）</span>
                <div class="xb-assistant-inline-input">
                    <input id="xb-assistant-tavily-api-key" type="password" />
                    <button id="xb-assistant-toggle-tavily-key" type="button" class="secondary ghost">显示</button>
                </div>
            </label>
            <label id="xb-assistant-tool-mode-wrap">
                <span>Tool 调用格式</span>
                <select id="xb-assistant-tool-mode"></select>
            </label>
            ${L}
            <label>
                <span>Reasoning 模式</span>
                <select id="xb-assistant-reasoning-mode"></select>
                <small id="xb-assistant-reasoning-capability"></small>
            </label>
            <label id="xb-assistant-reasoning-effort-wrap">
                <span>思考强度</span>
                <select id="xb-assistant-reasoning-effort"></select>
            </label>
            <label id="xb-assistant-reasoning-budget-wrap">
                <span>思考 Token 预算</span>
                <input id="xb-assistant-reasoning-budget" type="number" step="1" inputmode="numeric" />
                <small>支持 -1 时表示由模型自动决定</small>
            </label>
            <label>
                <span>思考内容</span>
                <select id="xb-assistant-reasoning-output"></select>
                <small>只控制界面展示；隐藏时仍保留续轮所需签名</small>
            </label>
            </div>
            ${O}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${Ur(n)}</div>
            </fieldset>
            ${o ? `<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${Ur(r)}</div>` : ""}
        </section>
    `;
}
var xP = [
  "你是小白X“四次元壁”的交流生成器。",
  "只完成本轮四次元壁回复，不调用工具，不编造外部事实。",
  "严格遵循后续提示词里的输出格式，优先输出可被解析的 <thinking> 与 <msg> 内容。"
].join(`
`);
function MP(e = {}) {
  return {
    msg1: String(e.msg1 || "").trim(),
    msg2: String(e.msg2 || "").trim(),
    msg3: String(e.msg3 || "").trim(),
    msg4: String(e.msg4 || "").trim()
  };
}
function NP(e = {}, t = {}) {
  const { msg1: n, msg2: r, msg3: o, msg4: i } = MP(e);
  return [
    n ? {
      role: "user",
      content: n
    } : null,
    r ? {
      role: "assistant",
      content: r
    } : null,
    o ? {
      role: "user",
      content: o
    } : null,
    i && !t.disableAssistantPrefill ? {
      role: "assistant",
      content: i
    } : null
  ].filter(Boolean);
}
function UP(e = {}) {
  w0(typeof e.requestHeadersProvider == "function" ? e.requestHeadersProvider : null);
}
async function FP(e = {}) {
  const t = hP(Kg(e.config || {})), n = pP(t, { missingApiKeyMessage: "请先在小白agent的 API配置 里填写当前预设的 API Key。" }), r = !!e.stream && typeof e.onStreamProgress == "function", o = await n.chat({
    systemPrompt: xP,
    messages: NP(e.builtPrompt || {}, { disableAssistantPrefill: !!e.disableAssistantPrefill }),
    tools: [],
    temperature: t.temperature,
    maxTokens: t.maxTokens,
    reasoning: t.reasoning,
    signal: e.signal,
    onStreamProgress: r ? e.onStreamProgress : void 0
  });
  return {
    text: String(o?.text || ""),
    thoughts: Array.isArray(o?.thoughts) ? o.thoughts : [],
    provider: o?.provider || t.provider,
    model: o?.model || t.model,
    finishReason: o?.finishReason || ""
  };
}
export {
  LP as buildAgentSettingsPanelMarkup,
  UP as configureFourthWallAgent,
  $P as createAgentSettingsPanel,
  FP as generateFourthWallResponse,
  _s as normalizeAgentConfig
};
