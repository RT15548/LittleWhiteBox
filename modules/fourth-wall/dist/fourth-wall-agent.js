var Tg = Object.create, Od = Object.defineProperty, Eg = Object.getOwnPropertyDescriptor, wg = Object.getOwnPropertyNames, Cg = Object.getPrototypeOf, Ig = Object.prototype.hasOwnProperty, ns = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), bg = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var o = wg(t), s = 0, a = o.length, u; s < a; s++)
      u = o[s], !Ig.call(e, u) && u !== n && Od(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(r = Eg(t, u)) || r.enumerable
      });
  return e;
}, Pg = (e, t, n) => (n = e != null ? Tg(Cg(e)) : {}, bg(t || !e || !e.__esModule ? Od(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), Rg = "https://api.tavily.com";
function ti(e = "") {
  return String(e || "").trim();
}
function Je(e = "") {
  return String(e || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var xg = Object.freeze({
  min: "最小",
  low: "低",
  medium: "中",
  high: "高",
  max: "最大"
}), qd = Object.freeze({
  efforts: Object.freeze([
    "min",
    "low",
    "medium",
    "high",
    "max"
  ]),
  includeOutput: !1
}), Mg = Object.freeze({
  "openai-responses": Object.freeze({
    efforts: Object.freeze([
      "min",
      "low",
      "medium",
      "high",
      "max"
    ]),
    includeOutput: !0
  }),
  "openai-compatible": qd,
  "sillytavern-openai-compatible": Object.freeze({
    efforts: Object.freeze([
      "min",
      "low",
      "medium",
      "high",
      "max"
    ]),
    includeOutput: !1
  }),
  "sillytavern-claude": Object.freeze({
    efforts: Object.freeze([
      "min",
      "low",
      "medium",
      "high",
      "max"
    ]),
    includeOutput: !0
  }),
  "sillytavern-google": Object.freeze({
    efforts: Object.freeze([
      "min",
      "low",
      "medium",
      "high",
      "max"
    ]),
    includeOutput: !0
  }),
  anthropic: Object.freeze({
    efforts: Object.freeze([
      "low",
      "medium",
      "high",
      "max"
    ]),
    includeOutput: !0
  }),
  google: Object.freeze({
    efforts: Object.freeze([
      "min",
      "low",
      "medium",
      "high"
    ]),
    includeOutput: !0
  })
});
function Er(e = "") {
  return Mg[String(e || "").trim()] || qd;
}
function Cl(e = "") {
  return Er(e).efforts.map((t) => ({
    value: t,
    label: xg[t]
  }));
}
function Ve(e = "", t = "") {
  const n = e === "minimal" ? "min" : e === "xhigh" ? "max" : e;
  return Er(t).efforts.includes(n) ? n : "medium";
}
function Ng(e = "", t = "") {
  const n = String(e || "").trim(), r = Ve(t, n);
  if (n === "openai-responses" || n === "openai-compatible") {
    if (r === "min") return "minimal";
    if (r === "max") return "xhigh";
  }
  return n === "google" && r === "min" ? "minimal" : r;
}
function gt(e, t = "") {
  return Er(t).includeOutput && e !== !1;
}
function Lo(e = "", t = {}) {
  const n = Ve(t.reasoningEffort, e), r = t.reasoningEnabled === !0;
  return {
    reasoningEnabled: r,
    reasoningRequestedEffort: n,
    reasoningEffort: Ng(e, n),
    reasoningIncludeOutput: r && gt(t.reasoningIncludeOutput, e)
  };
}
var Bd = "openai-compatible", rs = "默认", Gd = "default", kg = "deny", yt = 32e3, Dg = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), $g = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), ni = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: yt,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: yt,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: yt,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: yt,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: yt,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: yt,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: yt,
    sendTemperature: !0
  }
};
function cn() {
  return JSON.parse(JSON.stringify(ni));
}
function Te() {
  return {
    provider: Bd,
    modelConfigs: cn(),
    permissionMode: Gd
  };
}
function Hd(e = Te()) {
  const t = e && typeof e == "object" ? e : Te();
  return {
    provider: Zi(t.provider),
    modelConfigs: Le(t.modelConfigs || {})
  };
}
function dn(e) {
  return e === "full" ? "full" : Gd;
}
function _t(e) {
  return e === "allow" ? "allow" : kg;
}
function we(e, t = yt) {
  const n = Number(e);
  if (!Number.isFinite(n) || n <= 0) {
    const r = Number(t);
    return Number.isFinite(r) && r > 0 ? Math.floor(r) : yt;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}
function oe(e) {
  return String(e || "").trim() || "默认";
}
function Le(e = {}) {
  const t = cn();
  return Object.keys(ni).forEach((n) => {
    const r = e && typeof e[n] == "object" ? e[n] : {};
    t[n] = {
      ...ni[n],
      ...r,
      maxTokens: we(r.maxTokens),
      reasoningEnabled: r.reasoningEnabled === !0,
      reasoningEffort: Ve(r.reasoningEffort, n),
      reasoningIncludeOutput: gt(r.reasoningIncludeOutput, n)
    };
  }), t;
}
function Zi(e) {
  return typeof e == "string" && e.trim() ? e : Bd;
}
function ji(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function Vd(e = {}, t) {
  const n = {}, r = ji(e, t);
  return Object.entries(r).forEach(([o, s]) => {
    if (!s || typeof s != "object") return;
    const a = oe(o);
    n[a] = {
      provider: Zi(s.provider),
      modelConfigs: Le(s.modelConfigs || {}),
      permissionMode: dn(s.permissionMode)
    };
  }), Object.keys(n).length || (n[rs] = Te()), n;
}
function Jd(e, t) {
  const n = oe(t);
  return e[n] ? n : Object.keys(e)[0];
}
function Kd(e, t, n) {
  const r = oe(t || n);
  return e[r] ? r : e[n] ? n : Object.keys(e)[0];
}
function ea(e = {}, t = Te()) {
  const n = Hd(t), r = e && typeof e == "object" ? e : {};
  return {
    provider: Zi(r.provider || n.provider),
    modelConfigs: Le(r.modelConfigs || n.modelConfigs)
  };
}
function Wd(e = {}, t = {}, n = rs, r = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (r !== n) return !0;
  const o = e?.delegateConfig;
  if (!o || typeof o != "object" || Array.isArray(o) || !(typeof o.provider == "string" && o.provider.trim() || o.modelConfigs && typeof o.modelConfigs == "object" && Object.keys(o.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const s = t[n] || Te(), a = Hd(s), u = ea(o, s);
  return JSON.stringify(u) !== JSON.stringify(a);
}
function Lg(e = {}, t, n, r, o) {
  const s = o(e?.[r]);
  if (s) return s;
  const a = ji(e, t), u = [
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
function Ug(e = {}, t, n) {
  const r = (u) => String(u || "").trim();
  if (r(e?.tavilyBaseUrl)) return Je(e.tavilyBaseUrl);
  const o = ji(e, t), s = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(o || {})
  ].map(oe), a = /* @__PURE__ */ new Set();
  for (const u of s) {
    if (a.has(u)) continue;
    a.add(u);
    const c = o?.[u]?.tavilyBaseUrl;
    if (r(c)) return Je(c);
  }
  return r(e?.delegateConfig?.tavilyBaseUrl) ? Je(e.delegateConfig.tavilyBaseUrl) : Rg;
}
function zd(e = {}, t, n) {
  return {
    tavilyApiKey: Lg(e, t, n, "tavilyApiKey", ti),
    tavilyBaseUrl: Ug(e, t, n)
  };
}
function Fg(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: r = (p) => String(p || "") } = t, o = oe(e.currentPresetName || e.presetName || "默认"), s = Vd(e, o), a = Jd(s, e.currentPresetName), u = Kd(s, e.delegatePresetName, a), c = s[u] || s[a] || Te(), d = ea(e.delegateConfig, c), h = Wd(e, s, a, u), f = zd(e, o, a);
  return {
    enabled: !!e.enabled,
    workspaceFileName: r(e.workspaceFileName || n),
    jsApiPermission: _t(e.jsApiPermission),
    currentPresetName: a,
    delegatePresetName: u,
    delegateConfig: d,
    delegateConfigured: h,
    presets: s,
    tavilyApiKey: f.tavilyApiKey,
    tavilyBaseUrl: f.tavilyBaseUrl,
    updatedAt: Number(e.updatedAt) || 0,
    configVersion: Number(e.configVersion) || 0
  };
}
function Ao(e = {}) {
  const t = oe(e.currentPresetName || e.presetDraftName || "默认"), n = Vd(e, t), r = Jd(n, e.currentPresetName), o = Kd(n, e.delegatePresetName, r), s = n[r] || Te(), a = n[o] || s, u = ea(e.delegateConfig, a), c = Wd(e, n, r, o), d = zd(e, t, r);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    updatedAt: Number(e.updatedAt) || 0,
    jsApiPermission: _t(e.jsApiPermission),
    currentPresetName: r,
    delegatePresetName: o,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: oe(e.presetDraftName || r),
    presetNames: Object.keys(n),
    presets: n,
    provider: s.provider,
    modelConfigs: s.modelConfigs,
    permissionMode: dn(s.permissionMode),
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
function E(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var Yd = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Yd = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function wr(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ri = (e) => {
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
}, J = class extends Error {
}, Ue = class oi extends J {
  constructor(t, n, r, o, s) {
    super(`${oi.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("request-id"), this.error = n, this.type = s ?? null;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new os({
      message: r,
      cause: ri(n)
    });
    const s = n, a = s?.error?.type;
    return t === 400 ? new Qd(t, s, r, o, a) : t === 401 ? new Zd(t, s, r, o, a) : t === 403 ? new jd(t, s, r, o, a) : t === 404 ? new ef(t, s, r, o, a) : t === 409 ? new tf(t, s, r, o, a) : t === 422 ? new nf(t, s, r, o, a) : t === 429 ? new rf(t, s, r, o, a) : t >= 500 ? new of(t, s, r, o, a) : new oi(t, s, r, o, a);
  }
}, et = class extends Ue {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, os = class extends Ue {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Xd = class extends os {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Qd = class extends Ue {
}, Zd = class extends Ue {
}, jd = class extends Ue {
}, ef = class extends Ue {
}, tf = class extends Ue {
}, nf = class extends Ue {
}, rf = class extends Ue {
}, of = class extends Ue {
}, Og = /^[a-z][a-z0-9+.-]*:/i, qg = (e) => Og.test(e), si = (e) => (si = Array.isArray, si(e)), Il = si;
function ii(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function bl(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Bg(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Gg = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new J(`${e} must be an integer`);
  if (t < 0) throw new J(`${e} must be a positive integer`);
  return t;
}, sf = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Hg = (e) => new Promise((t) => setTimeout(t, e)), on = "0.91.1", Vg = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Jg() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Kg = () => {
  const e = Jg();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": on,
    "X-Stainless-OS": Rl(Deno.build.os),
    "X-Stainless-Arch": Pl(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": on,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": on,
    "X-Stainless-OS": Rl(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Pl(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Wg();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": on,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": on,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Wg() {
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
var Pl = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Rl = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), xl, zg = () => xl ?? (xl = Kg());
function Yg() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function af(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function lf(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return af({
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
function ta(e) {
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
async function Xg(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Qg = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Zg(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new J(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function jg(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var Ml;
function na(e) {
  let t;
  return (Ml ?? (t = new globalThis.TextEncoder(), Ml = t.encode.bind(t)))(e);
}
var Nl;
function kl(e) {
  let t;
  return (Nl ?? (t = new globalThis.TextDecoder(), Nl = t.decode.bind(t)))(e);
}
var xe, Me, Nr = class {
  constructor() {
    xe.set(this, void 0), Me.set(this, void 0), U(this, xe, new Uint8Array(), "f"), U(this, Me, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? na(e) : e;
    U(this, xe, jg([E(this, xe, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = ey(E(this, xe, "f"), E(this, Me, "f"))) != null; ) {
      if (r.carriage && E(this, Me, "f") == null) {
        U(this, Me, r.index, "f");
        continue;
      }
      if (E(this, Me, "f") != null && (r.index !== E(this, Me, "f") + 1 || r.carriage)) {
        n.push(kl(E(this, xe, "f").subarray(0, E(this, Me, "f") - 1))), U(this, xe, E(this, xe, "f").subarray(E(this, Me, "f")), "f"), U(this, Me, null, "f");
        continue;
      }
      const o = E(this, Me, "f") !== null ? r.preceding - 1 : r.preceding, s = kl(E(this, xe, "f").subarray(0, o));
      n.push(s), U(this, xe, E(this, xe, "f").subarray(r.index), "f"), U(this, Me, null, "f");
    }
    return n;
  }
  flush() {
    return E(this, xe, "f").length ? this.decode(`
`) : [];
  }
};
xe = /* @__PURE__ */ new WeakMap(), Me = /* @__PURE__ */ new WeakMap();
Nr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Nr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function ey(e, t) {
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
function ty(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var Uo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Dl = (e, t, n) => {
  if (e) {
    if (Bg(Uo, e)) return e;
    Ae(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Uo))}`);
  }
};
function jn() {
}
function Jr(e, t, n) {
  return !t || Uo[e] > Uo[n] ? jn : t[e].bind(t);
}
var ny = {
  error: jn,
  warn: jn,
  info: jn,
  debug: jn
}, $l = /* @__PURE__ */ new WeakMap();
function Ae(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return ny;
  const r = $l.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: Jr("error", t, n),
    warn: Jr("warn", t, n),
    info: Jr("info", t, n),
    debug: Jr("debug", t, n)
  };
  return $l.set(t, [n, o]), o;
}
var Ft = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Dn, Cr = class er {
  constructor(t, n, r) {
    this.iterator = t, Dn.set(this, void 0), this.controller = n, U(this, Dn, r, "f");
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const s = r ? Ae(r) : console;
    async function* a() {
      if (o) throw new J("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of ry(t, n)) {
          if (c.event === "completion") try {
            yield JSON.parse(c.data);
          } catch (d) {
            throw s.error("Could not parse message into JSON:", c.data), s.error("From chunk:", c.raw), d;
          }
          if (c.event === "message_start" || c.event === "message_delta" || c.event === "message_stop" || c.event === "content_block_start" || c.event === "content_block_delta" || c.event === "content_block_stop" || c.event === "message" || c.event === "user.message" || c.event === "user.interrupt" || c.event === "user.tool_confirmation" || c.event === "user.custom_tool_result" || c.event === "agent.message" || c.event === "agent.thinking" || c.event === "agent.tool_use" || c.event === "agent.tool_result" || c.event === "agent.mcp_tool_use" || c.event === "agent.mcp_tool_result" || c.event === "agent.custom_tool_use" || c.event === "agent.thread_context_compacted" || c.event === "session.status_running" || c.event === "session.status_idle" || c.event === "session.status_rescheduled" || c.event === "session.status_terminated" || c.event === "session.error" || c.event === "session.deleted" || c.event === "span.model_request_start" || c.event === "span.model_request_end") try {
            yield JSON.parse(c.data);
          } catch (d) {
            throw s.error("Could not parse message into JSON:", c.data), s.error("From chunk:", c.raw), d;
          }
          if (c.event !== "ping" && c.event === "error") {
            const d = sf(c.data) ?? c.data, h = d?.error?.type;
            throw new Ue(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (wr(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new er(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* s() {
      const u = new Nr(), c = ta(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (o) throw new J("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of s())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (wr(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new er(a, n, r);
  }
  [(Dn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), o = (s) => ({ next: () => {
      if (s.length === 0) {
        const a = r.next();
        t.push(a), n.push(a);
      }
      return s.shift();
    } });
    return [new er(() => o(t), this.controller, E(this, Dn, "f")), new er(() => o(n), this.controller, E(this, Dn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return af({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: s } = await n.next();
          if (s) return r.close();
          const a = na(JSON.stringify(o) + `
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
async function* ry(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new J("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new J("Attempted to iterate over a response with no body");
  const n = new sy(), r = new Nr(), o = ta(e.body);
  for await (const s of oy(o)) for (const a of r.decode(s)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const s of r.flush()) {
    const a = n.decode(s);
    a && (yield a);
  }
}
async function* oy(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? na(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let s;
    for (; (s = ty(t)) !== -1; )
      yield t.slice(0, s), t = t.slice(s);
  }
  t.length > 0 && (yield t);
}
var sy = class {
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
    let [t, n, r] = iy(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function iy(e, t) {
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
async function uf(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: s } = t, a = await (async () => {
    if (t.options.stream)
      return Ae(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : Cr.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : cf(await n.json(), n) : await n.text();
  })();
  return Ae(e).debug(`[${r}] response parsed`, Ft({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - s
  })), a;
}
function cf(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var tr, df = class ff extends Promise {
  constructor(t, n, r = uf) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, tr.set(this, void 0), U(this, tr, t, "f");
  }
  _thenUnwrap(t) {
    return new ff(E(this, tr, "f"), this.responsePromise, async (n, r) => cf(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(E(this, tr, "f"), t))), this.parsedPromise;
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
tr = /* @__PURE__ */ new WeakMap();
var Kr, hf = class {
  constructor(e, t, n, r) {
    Kr.set(this, void 0), U(this, Kr, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new J("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await E(this, Kr, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Kr = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, ay = class extends df {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await uf(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, kr = class extends hf {
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
          ...ii(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...ii(this.options.query),
        after_id: e
      }
    } : null;
  }
}, Pe = class extends hf {
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
        ...ii(this.options.query),
        page: e
      }
    } : null;
  }
}, pf = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function vn(e, t, n) {
  return pf(), new File(e, t ?? "unknown_file", n);
}
function So(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var mf = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", ra = async (e, t, n = !0) => ({
  ...e,
  body: await uy(e.body, t, n)
}), Ll = /* @__PURE__ */ new WeakMap();
function ly(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Ll.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, s = new FormData();
      return s.toString() !== await new o(s).text();
    } catch {
      return !0;
    }
  })();
  return Ll.set(t, r), r;
}
var uy = async (e, t, n = !0) => {
  if (!await ly(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, s]) => ai(r, o, s, n))), r;
}, cy = (e) => e instanceof Blob && "name" in e, ai = async (e, t, n, r) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let o = {};
      const s = n.headers.get("Content-Type");
      s && (o = { type: s }), e.append(t, vn([await n.blob()], So(n, r), o));
    } else if (mf(n)) e.append(t, vn([await new Response(lf(n)).blob()], So(n, r)));
    else if (cy(n)) e.append(t, vn([n], So(n, r), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => ai(e, t + "[]", o, r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, s]) => ai(e, `${t}[${o}]`, s, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, gf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", dy = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && gf(e), fy = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function hy(e, t, n) {
  if (pf(), e = await e, t || (t = So(e, !0)), dy(e))
    return e instanceof File && t == null && n == null ? e : vn([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (fy(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), vn(await li(o), t, n);
  }
  const r = await li(e);
  if (!n?.type) {
    const o = r.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return vn(r, t, n);
}
async function li(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (gf(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (mf(e)) for await (const n of e) t.push(...await li(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${py(e)}`);
  }
  return t;
}
function py(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ne = class {
  constructor(e) {
    this._client = e;
  }
}, yf = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* my(e) {
  if (!e) return;
  if (yf in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const s of o) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Il(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const s = Il(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of s)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var M = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [s, a] of my(r)) {
      const u = s.toLowerCase();
      o.has(u) || (t.delete(s), o.add(u)), a === null ? (t.delete(s), n.add(u)) : (t.append(s, a), n.delete(u));
    }
  }
  return {
    [yf]: !0,
    values: t,
    nulls: n
  };
};
function _f(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Ul = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), gy = (e = _f) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const s = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let y = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Ul) ?? Ul)?.toString) && (y = m + "", s.push({
      start: h.length + f.length,
      length: y.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : y);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) s.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (s.sort((h, f) => h.start - f.start), s.length > 0) {
    let h = 0;
    const f = s.reduce((p, m) => {
      const y = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + y + _;
    }, "");
    throw new J(`Path parameters result in path with invalid segments:
${s.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, q = /* @__PURE__ */ gy(_f), vf = class extends ne {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/environments/${e}?beta=true`, {
      body: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", Pe, {
      query: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, gr = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function To(e) {
  return typeof e == "object" && e !== null && gr in e;
}
function Af(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const r of e) To(r) && n.add(r[gr]);
  if (t) {
    for (const r of t)
      if (To(r) && n.add(r[gr]), Array.isArray(r.content))
        for (const o of r.content) To(o) && n.add(o[gr]);
  }
  return Array.from(n);
}
function Sf(e, t) {
  const n = Af(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function yy(e) {
  return To(e) ? { "x-stainless-helper": e[gr] } : {};
}
var Tf = class extends ne {
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", kr, {
      query: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/files/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/files/${e}/content?beta=true`, {
      ...n,
      headers: M([{
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
      headers: M([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/files?beta=true", ra({
      body: r,
      ...t,
      headers: M([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        yy(r.file),
        t?.headers
      ])
    }, this._client));
  }
}, Ef = class extends ne {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/models/${e}?beta=true`, {
      ...n,
      headers: M([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", kr, {
      query: r,
      ...t,
      headers: M([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, wf = class extends ne {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/user_profiles?beta=true", {
      body: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/user_profiles/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/user_profiles/${e}?beta=true`, {
      body: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/user_profiles?beta=true", Pe, {
      query: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  createEnrollmentURL(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/user_profiles/${e}/enrollment_url?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
}, Cf = class extends ne {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/agents/${e}/versions?beta=true`, Pe, {
      query: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, oa = class extends ne {
  constructor() {
    super(...arguments), this.versions = new Cf(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.get(q`/v1/agents/${e}?beta=true`, {
      query: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/agents/${e}?beta=true`, {
      body: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", Pe, {
      query: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
oa.Versions = Cf;
var If = class extends ne {
  create(e, t, n) {
    const { view: r, betas: o, ...s } = t;
    return this._client.post(q`/v1/memory_stores/${e}/memories?beta=true`, {
      query: { view: r },
      body: s,
      ...n,
      headers: M([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { memory_store_id: r, betas: o, ...s } = t;
    return this._client.get(q`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: s,
      ...n,
      headers: M([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { memory_store_id: r, view: o, betas: s, ...a } = t;
    return this._client.post(q`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: { view: o },
      body: a,
      ...n,
      headers: M([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/memory_stores/${e}/memories?beta=true`, Pe, {
      query: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { memory_store_id: r, expected_content_sha256: o, betas: s } = t;
    return this._client.delete(q`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: { expected_content_sha256: o },
      ...n,
      headers: M([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, bf = class extends ne {
  retrieve(e, t, n) {
    const { memory_store_id: r, betas: o, ...s } = t;
    return this._client.get(q`/v1/memory_stores/${r}/memory_versions/${e}?beta=true`, {
      query: s,
      ...n,
      headers: M([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/memory_stores/${e}/memory_versions?beta=true`, Pe, {
      query: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  redact(e, t, n) {
    const { memory_store_id: r, betas: o } = t;
    return this._client.post(q`/v1/memory_stores/${r}/memory_versions/${e}/redact?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, ss = class extends ne {
  constructor() {
    super(...arguments), this.memories = new If(this._client), this.memoryVersions = new bf(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/memory_stores?beta=true", {
      body: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/memory_stores/${e}?beta=true`, {
      body: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/memory_stores?beta=true", Pe, {
      query: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/memory_stores/${e}/archive?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
ss.Memories = If;
ss.MemoryVersions = bf;
var Pf = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function Rf(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function Fl(e, t, n) {
  const r = Rf(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((o) => {
      if (o.type === "text") {
        const s = Object.defineProperty({ ...o }, "parsed_output", {
          value: null,
          enumerable: !1
        });
        return Object.defineProperty(s, "parsed", {
          get() {
            return n.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead."), null;
          },
          enumerable: !1
        });
      }
      return o;
    }),
    parsed_output: null
  } : xf(e, t, n);
}
function xf(e, t, n) {
  let r = null;
  const o = e.content.map((s) => {
    if (s.type === "text") {
      const a = _y(t, s.text);
      r === null && (r = a);
      const u = Object.defineProperty({ ...s }, "parsed_output", {
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
    return s;
  });
  return {
    ...e,
    content: o,
    parsed_output: r
  };
}
function _y(e, t) {
  const n = Rf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new J(`Failed to parse structured output: ${r}`);
  }
}
var vy = (e) => {
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
    let s = /[a-z]/i;
    if (r && s.test(r)) {
      let a = "";
      for (; r && s.test(r) && t !== e.length; )
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
}, sn = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), sn(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), sn(e);
    case "string":
      let r = e[e.length - 2];
      if (r?.type === "delimiter")
        return e = e.slice(0, e.length - 1), sn(e);
      if (r?.type === "brace" && r.value === "{")
        return e = e.slice(0, e.length - 1), sn(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), sn(e);
  }
  return e;
}, Ay = (e) => {
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
}, Sy = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, Mf = (e) => JSON.parse(Sy(Ay(sn(vy(e))))), Ge, wt, Zt, $n, Wr, Ln, Un, zr, Fn, dt, On, Yr, Xr, $t, Qr, Zr, qn, ks, Ol, jr, Ds, $s, Ls, ql, Bl = "__json_buf";
function Gl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Ty = class ui {
  constructor(t, n) {
    Ge.add(this), this.messages = [], this.receivedMessages = [], wt.set(this, void 0), Zt.set(this, null), this.controller = new AbortController(), $n.set(this, void 0), Wr.set(this, () => {
    }), Ln.set(this, () => {
    }), Un.set(this, void 0), zr.set(this, () => {
    }), Fn.set(this, () => {
    }), dt.set(this, {}), On.set(this, !1), Yr.set(this, !1), Xr.set(this, !1), $t.set(this, !1), Qr.set(this, void 0), Zr.set(this, void 0), qn.set(this, void 0), jr.set(this, (r) => {
      if (U(this, Yr, !0, "f"), wr(r) && (r = new et()), r instanceof et)
        return U(this, Xr, !0, "f"), this._emit("abort", r);
      if (r instanceof J) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new J(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new J(String(r)));
    }), U(this, $n, new Promise((r, o) => {
      U(this, Wr, r, "f"), U(this, Ln, o, "f");
    }), "f"), U(this, Un, new Promise((r, o) => {
      U(this, zr, r, "f"), U(this, Fn, o, "f");
    }), "f"), E(this, $n, "f").catch(() => {
    }), E(this, Un, "f").catch(() => {
    }), U(this, Zt, t, "f"), U(this, qn, n?.logger ?? console, "f");
  }
  get response() {
    return E(this, Qr, "f");
  }
  get request_id() {
    return E(this, Zr, "f");
  }
  async withResponse() {
    U(this, $t, !0, "f");
    const t = await E(this, $n, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new ui(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const s = new ui(n, { logger: o });
    for (const a of n.messages) s._addMessageParam(a);
    return U(s, Zt, {
      ...n,
      stream: !0
    }, "f"), s._run(() => s._createMessage(t, {
      ...n,
      stream: !0
    }, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), s;
  }
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, E(this, jr, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, r) {
    const o = r?.signal;
    let s;
    o && (o.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), o.addEventListener("abort", s));
    try {
      E(this, Ge, "m", Ds).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) E(this, Ge, "m", $s).call(this, c);
      if (u.controller.signal?.aborted) throw new et();
      E(this, Ge, "m", Ls).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  _connected(t) {
    this.ended || (U(this, Qr, t, "f"), U(this, Zr, t?.headers.get("request-id"), "f"), E(this, Wr, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return E(this, On, "f");
  }
  get errored() {
    return E(this, Yr, "f");
  }
  get aborted() {
    return E(this, Xr, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (E(this, dt, "f")[t] || (E(this, dt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = E(this, dt, "f")[t];
    if (!r) return this;
    const o = r.findIndex((s) => s.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (E(this, dt, "f")[t] || (E(this, dt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      U(this, $t, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    U(this, $t, !0, "f"), await E(this, Un, "f");
  }
  get currentMessage() {
    return E(this, wt, "f");
  }
  async finalMessage() {
    return await this.done(), E(this, Ge, "m", ks).call(this);
  }
  async finalText() {
    return await this.done(), E(this, Ge, "m", Ol).call(this);
  }
  _emit(t, ...n) {
    if (E(this, On, "f")) return;
    t === "end" && (U(this, On, !0, "f"), E(this, zr, "f").call(this));
    const r = E(this, dt, "f")[t];
    if (r && (E(this, dt, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !E(this, $t, "f") && !r?.length && Promise.reject(o), E(this, Ln, "f").call(this, o), E(this, Fn, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !E(this, $t, "f") && !r?.length && Promise.reject(o), E(this, Ln, "f").call(this, o), E(this, Fn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", E(this, Ge, "m", ks).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      E(this, Ge, "m", Ds).call(this), this._connected(null);
      const s = Cr.fromReadableStream(t, this.controller);
      for await (const a of s) E(this, Ge, "m", $s).call(this, a);
      if (s.controller.signal?.aborted) throw new et();
      E(this, Ge, "m", Ls).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(wt = /* @__PURE__ */ new WeakMap(), Zt = /* @__PURE__ */ new WeakMap(), $n = /* @__PURE__ */ new WeakMap(), Wr = /* @__PURE__ */ new WeakMap(), Ln = /* @__PURE__ */ new WeakMap(), Un = /* @__PURE__ */ new WeakMap(), zr = /* @__PURE__ */ new WeakMap(), Fn = /* @__PURE__ */ new WeakMap(), dt = /* @__PURE__ */ new WeakMap(), On = /* @__PURE__ */ new WeakMap(), Yr = /* @__PURE__ */ new WeakMap(), Xr = /* @__PURE__ */ new WeakMap(), $t = /* @__PURE__ */ new WeakMap(), Qr = /* @__PURE__ */ new WeakMap(), Zr = /* @__PURE__ */ new WeakMap(), qn = /* @__PURE__ */ new WeakMap(), jr = /* @__PURE__ */ new WeakMap(), Ge = /* @__PURE__ */ new WeakSet(), ks = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Ol = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new J("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Ds = function() {
    this.ended || U(this, wt, void 0, "f");
  }, $s = function(n) {
    if (this.ended) return;
    const r = E(this, Ge, "m", ql).call(this, n);
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
            Gl(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage(Fl(r, E(this, Zt, "f"), { logger: E(this, qn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        U(this, wt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Ls = function() {
    if (this.ended) throw new J("stream has ended, this shouldn't happen");
    const n = E(this, wt, "f");
    if (!n) throw new J("request ended without sending any chunks");
    return U(this, wt, void 0, "f"), Fl(n, E(this, Zt, "f"), { logger: E(this, qn, "f") });
  }, ql = function(n) {
    let r = E(this, wt, "f");
    if (n.type === "message_start") {
      if (r) throw new J(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new J(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (o && Gl(o)) {
              let s = o[Bl] || "";
              s += n.delta.partial_json;
              const a = { ...o };
              if (Object.defineProperty(a, Bl, {
                value: s,
                enumerable: !1,
                writable: !0
              }), s) try {
                a.input = Mf(s);
              } catch (u) {
                const c = new J(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${s}`);
                E(this, jr, "f").call(this, c);
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
      const s = n.shift();
      s ? s.resolve(o) : t.push(o);
    }), this.on("end", () => {
      r = !0;
      for (const o of n) o.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (o) => {
      r = !0;
      for (const s of n) s.reject(o);
      n.length = 0;
    }), this.on("error", (o) => {
      r = !0;
      for (const s of n) s.reject(o);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((o, s) => n.push({
        resolve: o,
        reject: s
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
    return new Cr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Nf = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var Ey = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, Bn, jt, Lt, le, Ee, Re, vt, Ct, Gn, Hl, ci;
function Vl() {
  let e, t;
  return {
    promise: new Promise((n, r) => {
      e = n, t = r;
    }),
    resolve: e,
    reject: t
  };
}
var kf = class {
  constructor(e, t, n) {
    Bn.add(this), this.client = e, jt.set(this, !1), Lt.set(this, !1), le.set(this, void 0), Ee.set(this, void 0), Re.set(this, void 0), vt.set(this, void 0), Ct.set(this, void 0), Gn.set(this, 0), U(this, le, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const r = ["BetaToolRunner", ...Af(t.tools, t.messages)].join(", ");
    U(this, Ee, {
      ...n,
      headers: M([{ "x-stainless-helper": r }, n?.headers])
    }, "f"), U(this, Ct, Vl(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(jt = /* @__PURE__ */ new WeakMap(), Lt = /* @__PURE__ */ new WeakMap(), le = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new WeakMap(), Re = /* @__PURE__ */ new WeakMap(), vt = /* @__PURE__ */ new WeakMap(), Ct = /* @__PURE__ */ new WeakMap(), Gn = /* @__PURE__ */ new WeakMap(), Bn = /* @__PURE__ */ new WeakSet(), Hl = async function() {
    const t = E(this, le, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (E(this, Re, "f") !== void 0) try {
      const c = await E(this, Re, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const r = t.contextTokenThreshold ?? 1e5;
    if (n < r) return !1;
    const o = t.model ?? E(this, le, "f").params.model, s = t.summaryPrompt ?? Ey, a = E(this, le, "f").params.messages;
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
          text: s
        }]
      }],
      max_tokens: E(this, le, "f").params.max_tokens
    }, {
      signal: E(this, Ee, "f").signal,
      headers: M([E(this, Ee, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new J("Expected text response for compaction");
    return E(this, le, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (E(this, jt, "f")) throw new J("Cannot iterate over a consumed stream");
    U(this, jt, !0, "f"), U(this, Lt, !0, "f"), U(this, vt, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (E(this, le, "f").params.max_iterations && E(this, Gn, "f") >= E(this, le, "f").params.max_iterations) break;
          U(this, Lt, !1, "f"), U(this, vt, void 0, "f"), U(this, Gn, (e = E(this, Gn, "f"), e++, e), "f"), U(this, Re, void 0, "f");
          const { max_iterations: n, compactionControl: r, ...o } = E(this, le, "f").params;
          if (o.stream ? (t = this.client.beta.messages.stream({ ...o }, E(this, Ee, "f")), U(this, Re, t.finalMessage(), "f"), E(this, Re, "f").catch(() => {
          }), yield t) : (U(this, Re, this.client.beta.messages.create({
            ...o,
            stream: !1
          }, E(this, Ee, "f")), "f"), yield E(this, Re, "f")), !await E(this, Bn, "m", Hl).call(this)) {
            if (!E(this, Lt, "f")) {
              const { role: a, content: u } = await E(this, Re, "f");
              E(this, le, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const s = await E(this, Bn, "m", ci).call(this, E(this, le, "f").params.messages.at(-1));
            if (s) E(this, le, "f").params.messages.push(s);
            else if (!E(this, Lt, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!E(this, Re, "f")) throw new J("ToolRunner concluded without a message from the server");
      E(this, Ct, "f").resolve(await E(this, Re, "f"));
    } catch (t) {
      throw U(this, jt, !1, "f"), E(this, Ct, "f").promise.catch(() => {
      }), E(this, Ct, "f").reject(t), U(this, Ct, Vl(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? E(this, le, "f").params = e(E(this, le, "f").params) : E(this, le, "f").params = e, U(this, Lt, !0, "f"), U(this, vt, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? U(this, Ee, e(E(this, Ee, "f")), "f") : U(this, Ee, {
      ...E(this, Ee, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = E(this, Ee, "f").signal) {
    const t = await E(this, Re, "f") ?? this.params.messages.at(-1);
    return t ? E(this, Bn, "m", ci).call(this, t, e) : null;
  }
  done() {
    return E(this, Ct, "f").promise;
  }
  async runUntilDone() {
    if (!E(this, jt, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return E(this, le, "f").params;
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
ci = async function(t, n = E(this, Ee, "f").signal) {
  return E(this, vt, "f") !== void 0 ? E(this, vt, "f") : (U(this, vt, wy(E(this, le, "f").params, t, {
    ...E(this, Ee, "f"),
    signal: n
  }), "f"), E(this, vt, "f"));
};
async function wy(e, t = e.messages.at(-1), n) {
  if (!t || t.role !== "assistant" || !t.content || typeof t.content == "string") return null;
  const r = t.content.filter((o) => o.type === "tool_use");
  return r.length === 0 ? null : {
    role: "user",
    content: await Promise.all(r.map(async (o) => {
      const s = e.tools.find((a) => ("name" in a ? a.name : a.mcp_server_name) === o.name);
      if (!s || !("run" in s)) return {
        type: "tool_result",
        tool_use_id: o.id,
        content: `Error: Tool '${o.name}' not found`,
        is_error: !0
      };
      try {
        let a = o.input;
        "parse" in s && s.parse && (a = s.parse(a));
        const u = await s.run(a, {
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
          content: a instanceof Nf ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var Df = class $f {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new Nr();
    for await (const n of this.iterator) for (const r of t.decode(n)) yield JSON.parse(r);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new J("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new J("Attempted to iterate over a response with no body");
    return new $f(ta(t.body), n);
  }
}, Lf = class extends ne {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", kr, {
      query: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const r = await this.retrieve(e);
    if (!r.results_url) throw new J(`No batch \`results_url\`; Has it finished processing? ${r.processing_status} - ${r.id}`);
    const { betas: o } = t ?? {};
    return this._client.get(r.results_url, {
      ...n,
      headers: M([{
        "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((s, a) => Df.fromResponse(a.response, a.controller));
  }
}, Jl = {
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
}, Cy = ["claude-mythos-preview", "claude-opus-4-6"], Dr = class extends ne {
  constructor() {
    super(...arguments), this.batches = new Lf(this._client);
  }
  create(e, t) {
    const n = Kl(e), { betas: r, ...o } = n;
    o.model in Jl && console.warn(`The model '${o.model}' is deprecated and will reach end-of-life on ${Jl[o.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Cy.includes(o.model) && o.thinking && o.thinking.type === "enabled" && console.warn(`Using Claude with ${o.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let s = this._client._options.timeout;
    if (!o.stream && s == null) {
      const u = Pf[o.model] ?? void 0;
      s = this._client.calculateNonstreamingTimeout(o.max_tokens, u);
    }
    const a = Sf(o.tools, o.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: o,
      timeout: s ?? 6e5,
      ...t,
      headers: M([
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
      headers: M([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => xf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Ty.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...r } = Kl(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new kf(this._client, e, t);
  }
};
function Kl(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new J("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
Dr.Batches = Lf;
Dr.BetaToolRunner = kf;
Dr.ToolError = Nf;
var Uf = class extends ne {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/sessions/${e}/events?beta=true`, Pe, {
      query: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/sessions/${e}/events?beta=true`, {
      body: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, Ff = class extends ne {
  retrieve(e, t, n) {
    const { session_id: r, betas: o } = t;
    return this._client.get(q`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: r, betas: o, ...s } = t;
    return this._client.post(q`/v1/sessions/${r}/resources/${e}?beta=true`, {
      body: s,
      ...n,
      headers: M([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/sessions/${e}/resources?beta=true`, Pe, {
      query: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: r, betas: o } = t;
    return this._client.delete(q`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/sessions/${e}/resources?beta=true`, {
      body: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, is = class extends ne {
  constructor() {
    super(...arguments), this.events = new Uf(this._client), this.resources = new Ff(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/sessions/${e}?beta=true`, {
      body: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", Pe, {
      query: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
is.Events = Uf;
is.Resources = Ff;
var Of = class extends ne {
  create(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.post(q`/v1/skills/${e}/versions?beta=true`, ra({
      body: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r, betas: o } = t;
    return this._client.get(q`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/skills/${e}/versions?beta=true`, Pe, {
      query: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: r, betas: o } = t;
    return this._client.delete(q`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, sa = class extends ne {
  constructor() {
    super(...arguments), this.versions = new Of(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.post("/v1/skills?beta=true", ra({
      body: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", Pe, {
      query: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
sa.Versions = Of;
var qf = class extends ne {
  create(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/vaults/${e}/credentials?beta=true`, {
      body: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.get(q`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: r, betas: o, ...s } = t;
    return this._client.post(q`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      body: s,
      ...n,
      headers: M([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/vaults/${e}/credentials?beta=true`, Pe, {
      query: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.delete(q`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.post(q`/v1/vaults/${r}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, ia = class extends ne {
  constructor() {
    super(...arguments), this.credentials = new qf(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(q`/v1/vaults/${e}?beta=true`, {
      body: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", Pe, {
      query: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(q`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(q`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
ia.Credentials = qf;
var ze = class extends ne {
  constructor() {
    super(...arguments), this.models = new Ef(this._client), this.messages = new Dr(this._client), this.agents = new oa(this._client), this.environments = new vf(this._client), this.sessions = new is(this._client), this.vaults = new ia(this._client), this.memoryStores = new ss(this._client), this.files = new Tf(this._client), this.skills = new sa(this._client), this.userProfiles = new wf(this._client);
  }
};
ze.Models = Ef;
ze.Messages = Dr;
ze.Agents = oa;
ze.Environments = vf;
ze.Sessions = is;
ze.Vaults = ia;
ze.MemoryStores = ss;
ze.Files = Tf;
ze.Skills = sa;
ze.UserProfiles = wf;
var Bf = class extends ne {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/complete", {
      body: r,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: M([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function Gf(e) {
  return e?.output_config?.format;
}
function Wl(e, t, n) {
  const r = Gf(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((o) => o.type === "text" ? Object.defineProperty({ ...o }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : o),
    parsed_output: null
  } : Hf(e, t, n);
}
function Hf(e, t, n) {
  let r = null;
  const o = e.content.map((s) => {
    if (s.type === "text") {
      const a = Iy(t, s.text);
      return r === null && (r = a), Object.defineProperty({ ...s }, "parsed_output", {
        value: a,
        enumerable: !1
      });
    }
    return s;
  });
  return {
    ...e,
    content: o,
    parsed_output: r
  };
}
function Iy(e, t) {
  const n = Gf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new J(`Failed to parse structured output: ${r}`);
  }
}
var He, It, en, Hn, eo, Vn, Jn, to, Kn, ft, Wn, no, ro, Ut, oo, so, zn, Us, zl, Fs, Os, qs, Bs, Yl, Xl = "__json_buf";
function Ql(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var by = class di {
  constructor(t, n) {
    He.add(this), this.messages = [], this.receivedMessages = [], It.set(this, void 0), en.set(this, null), this.controller = new AbortController(), Hn.set(this, void 0), eo.set(this, () => {
    }), Vn.set(this, () => {
    }), Jn.set(this, void 0), to.set(this, () => {
    }), Kn.set(this, () => {
    }), ft.set(this, {}), Wn.set(this, !1), no.set(this, !1), ro.set(this, !1), Ut.set(this, !1), oo.set(this, void 0), so.set(this, void 0), zn.set(this, void 0), Fs.set(this, (r) => {
      if (U(this, no, !0, "f"), wr(r) && (r = new et()), r instanceof et)
        return U(this, ro, !0, "f"), this._emit("abort", r);
      if (r instanceof J) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new J(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new J(String(r)));
    }), U(this, Hn, new Promise((r, o) => {
      U(this, eo, r, "f"), U(this, Vn, o, "f");
    }), "f"), U(this, Jn, new Promise((r, o) => {
      U(this, to, r, "f"), U(this, Kn, o, "f");
    }), "f"), E(this, Hn, "f").catch(() => {
    }), E(this, Jn, "f").catch(() => {
    }), U(this, en, t, "f"), U(this, zn, n?.logger ?? console, "f");
  }
  get response() {
    return E(this, oo, "f");
  }
  get request_id() {
    return E(this, so, "f");
  }
  async withResponse() {
    U(this, Ut, !0, "f");
    const t = await E(this, Hn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new di(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const s = new di(n, { logger: o });
    for (const a of n.messages) s._addMessageParam(a);
    return U(s, en, {
      ...n,
      stream: !0
    }, "f"), s._run(() => s._createMessage(t, {
      ...n,
      stream: !0
    }, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), s;
  }
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, E(this, Fs, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, r) {
    const o = r?.signal;
    let s;
    o && (o.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), o.addEventListener("abort", s));
    try {
      E(this, He, "m", Os).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) E(this, He, "m", qs).call(this, c);
      if (u.controller.signal?.aborted) throw new et();
      E(this, He, "m", Bs).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  _connected(t) {
    this.ended || (U(this, oo, t, "f"), U(this, so, t?.headers.get("request-id"), "f"), E(this, eo, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return E(this, Wn, "f");
  }
  get errored() {
    return E(this, no, "f");
  }
  get aborted() {
    return E(this, ro, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (E(this, ft, "f")[t] || (E(this, ft, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = E(this, ft, "f")[t];
    if (!r) return this;
    const o = r.findIndex((s) => s.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (E(this, ft, "f")[t] || (E(this, ft, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      U(this, Ut, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    U(this, Ut, !0, "f"), await E(this, Jn, "f");
  }
  get currentMessage() {
    return E(this, It, "f");
  }
  async finalMessage() {
    return await this.done(), E(this, He, "m", Us).call(this);
  }
  async finalText() {
    return await this.done(), E(this, He, "m", zl).call(this);
  }
  _emit(t, ...n) {
    if (E(this, Wn, "f")) return;
    t === "end" && (U(this, Wn, !0, "f"), E(this, to, "f").call(this));
    const r = E(this, ft, "f")[t];
    if (r && (E(this, ft, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !E(this, Ut, "f") && !r?.length && Promise.reject(o), E(this, Vn, "f").call(this, o), E(this, Kn, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !E(this, Ut, "f") && !r?.length && Promise.reject(o), E(this, Vn, "f").call(this, o), E(this, Kn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", E(this, He, "m", Us).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      E(this, He, "m", Os).call(this), this._connected(null);
      const s = Cr.fromReadableStream(t, this.controller);
      for await (const a of s) E(this, He, "m", qs).call(this, a);
      if (s.controller.signal?.aborted) throw new et();
      E(this, He, "m", Bs).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(It = /* @__PURE__ */ new WeakMap(), en = /* @__PURE__ */ new WeakMap(), Hn = /* @__PURE__ */ new WeakMap(), eo = /* @__PURE__ */ new WeakMap(), Vn = /* @__PURE__ */ new WeakMap(), Jn = /* @__PURE__ */ new WeakMap(), to = /* @__PURE__ */ new WeakMap(), Kn = /* @__PURE__ */ new WeakMap(), ft = /* @__PURE__ */ new WeakMap(), Wn = /* @__PURE__ */ new WeakMap(), no = /* @__PURE__ */ new WeakMap(), ro = /* @__PURE__ */ new WeakMap(), Ut = /* @__PURE__ */ new WeakMap(), oo = /* @__PURE__ */ new WeakMap(), so = /* @__PURE__ */ new WeakMap(), zn = /* @__PURE__ */ new WeakMap(), Fs = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ new WeakSet(), Us = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, zl = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new J("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Os = function() {
    this.ended || U(this, It, void 0, "f");
  }, qs = function(n) {
    if (this.ended) return;
    const r = E(this, He, "m", Yl).call(this, n);
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
            Ql(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage(Wl(r, E(this, en, "f"), { logger: E(this, zn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        U(this, It, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Bs = function() {
    if (this.ended) throw new J("stream has ended, this shouldn't happen");
    const n = E(this, It, "f");
    if (!n) throw new J("request ended without sending any chunks");
    return U(this, It, void 0, "f"), Wl(n, E(this, en, "f"), { logger: E(this, zn, "f") });
  }, Yl = function(n) {
    let r = E(this, It, "f");
    if (n.type === "message_start") {
      if (r) throw new J(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new J(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (o && Ql(o)) {
              let s = o[Xl] || "";
              s += n.delta.partial_json;
              const a = { ...o };
              Object.defineProperty(a, Xl, {
                value: s,
                enumerable: !1,
                writable: !0
              }), s && (a.input = Mf(s)), r.content[n.index] = a;
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
      const s = n.shift();
      s ? s.resolve(o) : t.push(o);
    }), this.on("end", () => {
      r = !0;
      for (const o of n) o.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (o) => {
      r = !0;
      for (const s of n) s.reject(o);
      n.length = 0;
    }), this.on("error", (o) => {
      r = !0;
      for (const s of n) s.reject(o);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((o, s) => n.push({
        resolve: o,
        reject: s
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
    return new Cr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Vf = class extends ne {
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
    return this._client.getAPIList("/v1/messages/batches", kr, {
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
    if (!n.results_url) throw new J(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: M([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((r, o) => Df.fromResponse(o.response, o.controller));
  }
}, aa = class extends ne {
  constructor() {
    super(...arguments), this.batches = new Vf(this._client);
  }
  create(e, t) {
    e.model in Zl && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${Zl[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Py.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const o = Pf[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, o);
    }
    const r = Sf(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: M([r, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Hf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return by.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, Zl = {
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
}, Py = ["claude-mythos-preview", "claude-opus-4-6"];
aa.Batches = Vf;
var Jf = class extends ne {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/models/${e}`, {
      ...n,
      headers: M([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models", kr, {
      query: r,
      ...t,
      headers: M([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, io = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, fi, la, Eo, Kf, Ry = "\\n\\nHuman:", xy = "\\n\\nAssistant:", ie = class {
  constructor({ baseURL: e = io("ANTHROPIC_BASE_URL"), apiKey: t = io("ANTHROPIC_API_KEY") ?? null, authToken: n = io("ANTHROPIC_AUTH_TOKEN") ?? null, ...r } = {}) {
    fi.add(this), Eo.set(this, void 0);
    const o = {
      apiKey: t,
      authToken: n,
      ...r,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!o.dangerouslyAllowBrowser && Vg()) throw new J(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = o.baseURL, this.timeout = o.timeout ?? la.DEFAULT_TIMEOUT, this.logger = o.logger ?? console;
    const s = "warn";
    this.logLevel = s, this.logLevel = Dl(o.logLevel, "ClientOptions.logLevel", this) ?? Dl(io("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? s, this.fetchOptions = o.fetchOptions, this.maxRetries = o.maxRetries ?? 2, this.fetch = o.fetch ?? Yg(), U(this, Eo, Qg, "f"), this._options = o, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return M([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return M([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return M([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return Zg(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${on}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Yd()}`;
  }
  makeStatusError(e, t, n, r) {
    return Ue.generate(e, t, n, r);
  }
  buildURL(e, t, n) {
    const r = !E(this, fi, "m", Kf).call(this) && n || this.baseURL, o = qg(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), s = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!bl(s) || !bl(a)) && (t = {
      ...a,
      ...s,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (o.search = this.stringifyQuery(t)), o.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new J("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
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
    return new df(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, o = r.maxRetries ?? this.maxRetries;
    t == null && (t = o), await this.prepareOptions(r);
    const { req: s, url: a, timeout: u } = await this.buildRequest(r, { retryCount: o - t });
    await this.prepareRequest(s, {
      url: a,
      options: r
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (Ae(this).debug(`[${c}] sending request`, Ft({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: s.headers
    })), r.signal?.aborted) throw new et();
    const f = new AbortController(), p = await this.fetchWithTimeout(a, s, u, f).catch(ri), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new et();
      const v = wr(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return Ae(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${_}`), Ae(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${_})`, Ft({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(r, t, n ?? c);
      throw Ae(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), Ae(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, Ft({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - h,
        message: p.message
      })), v ? new Xd() : new os({ cause: p });
    }
    const y = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, v]) => ", " + _ + ": " + JSON.stringify(v)).join("")}] ${s.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const x = `retrying, ${t} attempts remaining`;
        return await Xg(p.body), Ae(this).info(`${y} - ${x}`), Ae(this).debug(`[${c}] response error (${x})`, Ft({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(r, t, n ?? c, p.headers);
      }
      const v = _ ? "error; no more retries left" : "error; not retryable";
      Ae(this).info(`${y} - ${v}`);
      const w = await p.text().catch((x) => ri(x).message), b = sf(w), P = b ? void 0 : w;
      throw Ae(this).debug(`[${c}] response error (${v})`, Ft({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: P,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, b, P, p.headers);
    }
    return Ae(this).info(y), Ae(this).debug(`[${c}] response start`, Ft({
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
    return new ay(this, n, e);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: o, method: s, ...a } = t || {}, u = this._makeAbort(r);
    o && o.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, h = {
      signal: r.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...a
    };
    s && (h.method = s.toUpperCase());
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
    const s = r?.get("retry-after-ms");
    if (s) {
      const u = parseFloat(s);
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
    return await Hg(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new J("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: s, defaultBaseURL: a } = n, u = this.buildURL(o, s, a);
    "timeout" in n && Gg("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const s = M([
      o,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...zg(),
        ...this._options.dangerouslyAllowBrowser ? { "anthropic-dangerous-direct-browser-access": "true" } : void 0,
        "anthropic-version": "2023-06-01"
      },
      await this.authHeaders(e),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(s), s.values;
  }
  _makeAbort(e) {
    return () => e.abort();
  }
  buildBody({ options: { body: e, headers: t } }) {
    if (!e) return {
      bodyHeaders: void 0,
      body: void 0
    };
    const n = M([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: lf(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : E(this, Eo, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
la = ie, Eo = /* @__PURE__ */ new WeakMap(), fi = /* @__PURE__ */ new WeakSet(), Kf = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
ie.Anthropic = la;
ie.HUMAN_PROMPT = Ry;
ie.AI_PROMPT = xy;
ie.DEFAULT_TIMEOUT = 6e5;
ie.AnthropicError = J;
ie.APIError = Ue;
ie.APIConnectionError = os;
ie.APIConnectionTimeoutError = Xd;
ie.APIUserAbortError = et;
ie.NotFoundError = ef;
ie.ConflictError = tf;
ie.RateLimitError = rf;
ie.BadRequestError = Qd;
ie.AuthenticationError = Zd;
ie.InternalServerError = of;
ie.PermissionDeniedError = jd;
ie.UnprocessableEntityError = nf;
ie.toFile = hy;
var $r = class extends ie {
  constructor() {
    super(...arguments), this.completions = new Bf(this), this.messages = new aa(this), this.models = new Jf(this), this.beta = new ze(this);
  }
};
$r.Completions = Bf;
$r.Messages = aa;
$r.Models = Jf;
$r.Beta = ze;
function En(e) {
  if (Array.isArray(e)) return e.map((n) => En(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key|proxy_password|password/i.test(n) ? "[redacted]" : En(r);
  }), t;
}
function zt(e = {}, t = {}) {
  const n = typeof t.enabled == "boolean" ? t.enabled : e.reasoning?.enabled === !0, r = n && (typeof t.includeOutput == "boolean" ? t.includeOutput : e.reasoning?.includeOutput !== !1);
  return {
    reasoningEnabled: n,
    reasoningEffort: n ? String(t.effort ?? e.reasoning?.effort ?? "") : "",
    reasoningIncludeOutput: r
  };
}
function Ir(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: En({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    }),
    ...e.effectiveConfig ? { effectiveConfig: e.effectiveConfig } : {}
  };
}
function My(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Ny(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function Wf(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function ky(e) {
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
      const r = Ny(n.image_url.url);
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
function Dy(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function $y(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && Wf(t) || null;
}
function Ly(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: Wf(e.content) || [] } : void 0;
}
function jl(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function eu(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: My(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function Uy(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const r = e[n];
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const o = $y(r), s = eu(r.tool_calls);
        if (o && s.length) {
          t.push({
            role: "assistant",
            content: o.filter((a) => a?.type !== "tool_use").concat(s)
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
        const o = [jl(r)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, o.push(jl(e[n]));
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
          }] : [], ...eu(r.tool_calls)]
        });
        continue;
      }
      t.push({
        role: r.role,
        content: ky(r.content)
      });
    }
  }
  return t;
}
function ao(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function tu(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function Fy(e = "auto", t = []) {
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
var Oy = class {
  constructor(e) {
    this.config = e, this.client = new $r({
      apiKey: e.apiKey,
      baseURL: tu(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e) {
    const t = Array.isArray(e.tools) ? e.tools : [], n = t.map((s) => ({
      name: s.function.name,
      description: s.function.description,
      input_schema: s.function.parameters
    })), r = Dy(e), o = {
      model: this.config.model,
      system: r,
      messages: Uy(e.messages),
      ...n.length ? {
        tools: n,
        tool_choice: Fy(e.toolChoice, t)
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (o.temperature = e.temperature), e.reasoning?.enabled && (o.thinking = {
      type: "adaptive",
      display: e.reasoning.includeOutput !== !1 ? "summarized" : "omitted"
    }, o.output_config = { effort: e.reasoning.effort }), o;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = tu(this.config.baseUrl), o = t.body || this.buildRequestBody(e);
    return Ir({
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
      effectiveConfig: zt(e, {
        enabled: !!o.thinking,
        effort: o.output_config?.effort,
        includeOutput: o.thinking?.display !== "omitted"
      })
    });
  }
  async chat(e) {
    const t = this.buildRequestBody(e), n = this.inspectRequest(e, { body: t });
    let r;
    if (typeof e.onStreamProgress == "function") {
      const s = this.client.messages.stream(t, { signal: e.signal }), a = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
      let c = "";
      const d = () => e.reasoning?.includeOutput === !1 ? [] : Array.from(a.entries()).sort(([p], [m]) => p.localeCompare(m)).map(([p, m]) => ({
        label: p.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: m
      })).filter((p) => p.text), h = () => Array.from(u.entries()).sort(([p], [m]) => Number(p) - Number(m)).map(([, p]) => ({
        id: p.id || "anthropic-tool-draft",
        name: p.name || "工具调用",
        arguments: p.inputJson || "{}",
        draft: !0
      })).filter((p) => p.name), f = () => {
        const p = h();
        p.length && ao(e, {
          text: c,
          thoughts: d(),
          toolCalls: p,
          toolCallDraft: !0
        });
      };
      s.on("text", (p, m) => {
        c = m || "", ao(e, {
          text: c,
          thoughts: d(),
          ...h().length ? {
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), s.on("thinking", (p, m) => {
        a.set("thinking:0", m || ""), ao(e, {
          thoughts: d(),
          ...h().length ? {
            text: c,
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), s.on("streamEvent", (p) => {
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
      }), s.on("contentBlock", (p) => {
        p?.type === "redacted_thinking" && (a.set("redacted:0", p.data || ""), ao(e, {
          thoughts: d(),
          ...h().length ? {
            text: c,
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        }));
      }), r = await s.finalMessage();
    } else r = await this.client.messages.create(t, { signal: e.signal });
    const o = (r.content || []).filter((s) => s.type === "tool_use" && s.name).map((s, a) => ({
      id: s.id || `anthropic-tool-${a + 1}`,
      name: s.name,
      arguments: JSON.stringify(s.input || {})
    }));
    return {
      text: (r.content || []).filter((s) => s.type === "text").map((s) => s.text || "").join(`
`),
      toolCalls: o,
      thoughts: e.reasoning?.includeOutput === !1 ? [] : (r.content || []).filter((s) => s.type === "thinking" || s.type === "redacted_thinking").map((s) => ({
        label: s.type === "thinking" ? "思考块" : "已脱敏思考块",
        text: s.type === "thinking" ? s.thinking || "" : s.data || ""
      })).filter((s) => s.text),
      finishReason: r.stop_reason || "stop",
      model: r.model || this.config.model,
      provider: "anthropic",
      providerPayload: Ly(r),
      requestInspection: n
    };
  }
}, qy = /* @__PURE__ */ ns(((e, t) => {
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
    var s = this._timeouts.shift();
    if (s === void 0) if (this._cachedTimeouts)
      this._errors.splice(0, this._errors.length - 1), s = this._cachedTimeouts.slice(-1);
    else return !1;
    var a = this;
    return this._timer = setTimeout(function() {
      a._attempts++, a._operationTimeoutCb && (a._timeout = setTimeout(function() {
        a._operationTimeoutCb(a._attempts);
      }, a._operationTimeout), a._options.unref && a._timeout.unref()), a._fn(a._attempts);
    }, s), this._options.unref && this._timer.unref(), !0;
  }, n.prototype.attempt = function(r, o) {
    this._fn = r, o && (o.timeout && (this._operationTimeout = o.timeout), o.cb && (this._operationTimeoutCb = o.cb));
    var s = this;
    this._operationTimeoutCb && (this._timeout = setTimeout(function() {
      s._operationTimeoutCb();
    }, s._operationTimeout)), this._operationStart = (/* @__PURE__ */ new Date()).getTime(), this._fn(this._attempts);
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
    for (var r = {}, o = null, s = 0, a = 0; a < this._errors.length; a++) {
      var u = this._errors[a], c = u.message, d = (r[c] || 0) + 1;
      r[c] = d, d >= s && (o = u, s = d);
    }
    return o;
  };
})), By = /* @__PURE__ */ ns(((e) => {
  var t = qy();
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
    for (var s = [], a = 0; a < r.retries; a++) s.push(this.createTimeout(a, r));
    return n && n.forever && !s.length && s.push(this.createTimeout(a, r)), s.sort(function(u, c) {
      return u - c;
    }), s;
  }, e.createTimeout = function(n, r) {
    var o = r.randomize ? Math.random() + 1 : 1, s = Math.round(o * Math.max(r.minTimeout, 1) * Math.pow(r.factor, n));
    return s = Math.min(s, r.maxTimeout), s;
  }, e.wrap = function(n, r, o) {
    if (r instanceof Array && (o = r, r = null), !o) {
      o = [];
      for (var s in n) typeof n[s] == "function" && o.push(s);
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
})), Gy = /* @__PURE__ */ ns(((e, t) => {
  t.exports = By();
})), Hy = /* @__PURE__ */ ns(((e, t) => {
  var n = Gy(), r = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], o = class extends Error {
    constructor(c) {
      super(), c instanceof Error ? (this.originalError = c, { message: c } = c) : (this.originalError = new Error(c), this.originalError.stack = this.stack), this.name = "AbortError", this.message = c;
    }
  }, s = (c, d, h) => {
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
          s(y, m, d);
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
})), nu = /* @__PURE__ */ Pg(Hy(), 1), Vy = void 0, Jy = void 0;
function Ky() {
  return {
    geminiUrl: Vy,
    vertexUrl: Jy
  };
}
function Wy(e, t, n, r) {
  var o, s;
  if (!e?.baseUrl) {
    const a = Ky();
    return t ? (o = a.vertexUrl) !== null && o !== void 0 ? o : n : (s = a.geminiUrl) !== null && s !== void 0 ? s : r;
  }
  return e.baseUrl;
}
var St = class {
};
function D(e, t) {
  return e.replace(/\{([^}]+)\}/g, (n, r) => {
    if (Object.prototype.hasOwnProperty.call(t, r)) {
      const o = t[r];
      return o != null ? String(o) : "";
    } else throw new Error(`Key '${r}' not found in valueMap.`);
  });
}
function l(e, t, n) {
  for (let s = 0; s < t.length - 1; s++) {
    const a = t[s];
    if (a.endsWith("[]")) {
      const u = a.slice(0, -2);
      if (!(u in e)) if (Array.isArray(n)) e[u] = Array.from({ length: n.length }, () => ({}));
      else throw new Error(`Value must be a list given an array path ${a}`);
      if (Array.isArray(e[u])) {
        const c = e[u];
        if (Array.isArray(n)) for (let d = 0; d < c.length; d++) {
          const h = c[d];
          l(h, t.slice(s + 1), n[d]);
        }
        else for (const d of c) l(d, t.slice(s + 1), n);
      }
      return;
    } else if (a.endsWith("[0]")) {
      const u = a.slice(0, -3);
      u in e || (e[u] = [{}]);
      const c = e[u];
      l(c[0], t.slice(s + 1), n);
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
function i(e, t, n = void 0) {
  try {
    if (t.length === 1 && t[0] === "_self") return e;
    for (let r = 0; r < t.length; r++) {
      if (typeof e != "object" || e === null) return n;
      const o = t[r];
      if (o.endsWith("[]")) {
        const s = o.slice(0, -2);
        if (s in e) {
          const a = e[s];
          return Array.isArray(a) ? a.map((u) => i(u, t.slice(r + 1), n)) : n;
        } else return n;
      } else e = e[o];
    }
    return e;
  } catch (r) {
    if (r instanceof TypeError) return n;
    throw r;
  }
}
function zy(e, t) {
  for (const [n, r] of Object.entries(t)) {
    const o = n.split("."), s = r.split("."), a = /* @__PURE__ */ new Set();
    let u = -1;
    for (let c = 0; c < o.length; c++) if (o[c] === "*") {
      u = c;
      break;
    }
    if (u !== -1 && s.length > u) for (let c = u; c < s.length; c++) {
      const d = s[c];
      d !== "*" && !d.endsWith("[]") && !d.endsWith("[0]") && a.add(d);
    }
    hi(e, o, s, 0, a);
  }
}
function hi(e, t, n, r, o) {
  if (r >= t.length || typeof e != "object" || e === null) return;
  const s = t[r];
  if (s.endsWith("[]")) {
    const a = s.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) hi(c, t, n, r + 1, o);
  } else if (s === "*") {
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
    s in a && hi(a[s], t, n, r + 1, o);
  }
}
function ua(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function Yy(e) {
  const t = {}, n = i(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const r = i(e, ["resourceName"]);
  return r != null && l(t, ["_url", "resourceName"], r), t;
}
function Xy(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], Zy(a)), t;
}
function Qy(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], jy(a)), t;
}
function Zy(e) {
  const t = {}, n = i(e, ["generatedSamples"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((a) => e_(a))), l(t, ["generatedVideos"], s);
  }
  const r = i(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = i(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function jy(e) {
  const t = {}, n = i(e, ["videos"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((a) => t_(a))), l(t, ["generatedVideos"], s);
  }
  const r = i(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = i(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function e_(e) {
  const t = {}, n = i(e, ["video"]);
  return n != null && l(t, ["video"], a_(n)), t;
}
function t_(e) {
  const t = {}, n = i(e, ["_self"]);
  return n != null && l(t, ["video"], l_(n)), t;
}
function n_(e) {
  const t = {}, n = i(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function r_(e) {
  const t = {}, n = i(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function o_(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], s_(a)), t;
}
function s_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = i(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function zf(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], i_(a)), t;
}
function i_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = i(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function a_(e) {
  const t = {}, n = i(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const r = i(e, ["encodedVideo"]);
  r != null && l(t, ["videoBytes"], ua(r));
  const o = i(e, ["encoding"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function l_(e) {
  const t = {}, n = i(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const r = i(e, ["bytesBase64Encoded"]);
  r != null && l(t, ["videoBytes"], ua(r));
  const o = i(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
var ru;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(ru || (ru = {}));
var ou;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(ou || (ou = {}));
var su;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(su || (su = {}));
var Mt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(Mt || (Mt = {}));
var iu;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(iu || (iu = {}));
var au;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(au || (au = {}));
var lu;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(lu || (lu = {}));
var uu;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(uu || (uu = {}));
var cu;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(cu || (cu = {}));
var du;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(du || (du = {}));
var fu;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(fu || (fu = {}));
var fn;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(fn || (fn = {}));
var hn;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(hn || (hn = {}));
var hu;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(hu || (hu = {}));
var pu;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(pu || (pu = {}));
var mu;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(mu || (mu = {}));
var gu;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(gu || (gu = {}));
var yu;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(yu || (yu = {}));
var _u;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(_u || (_u = {}));
var vu;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(vu || (vu = {}));
var Au;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Au || (Au = {}));
var Su;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Su || (Su = {}));
var Tu;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Tu || (Tu = {}));
var Eu;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Eu || (Eu = {}));
var Fo;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(Fo || (Fo = {}));
var wu;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(wu || (wu = {}));
var Cu;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(Cu || (Cu = {}));
var Iu;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Iu || (Iu = {}));
var bu;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(bu || (bu = {}));
var pi;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(pi || (pi = {}));
var Pu;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Pu || (Pu = {}));
var Ru;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(Ru || (Ru = {}));
var xu;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(xu || (xu = {}));
var Mu;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Mu || (Mu = {}));
var Nu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Nu || (Nu = {}));
var ku;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(ku || (ku = {}));
var Du;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(Du || (Du = {}));
var mi;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(mi || (mi = {}));
var $u;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})($u || ($u = {}));
var Lu;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(Lu || (Lu = {}));
var Oo;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(Oo || (Oo = {}));
var Uu;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(Uu || (Uu = {}));
var Fu;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(Fu || (Fu = {}));
var Ou;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(Ou || (Ou = {}));
var qu;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(qu || (qu = {}));
var Bu;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(Bu || (Bu = {}));
var Gu;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(Gu || (Gu = {}));
var Hu;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(Hu || (Hu = {}));
var Vu;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(Vu || (Vu = {}));
var Ju;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(Ju || (Ju = {}));
var Ku;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(Ku || (Ku = {}));
var Wu;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(Wu || (Wu = {}));
var zu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(zu || (zu = {}));
var Yu;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(Yu || (Yu = {}));
var Xu;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(Xu || (Xu = {}));
var Qu;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(Qu || (Qu = {}));
var Zu;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(Zu || (Zu = {}));
var ju;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(ju || (ju = {}));
var ec;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(ec || (ec = {}));
var tc;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(tc || (tc = {}));
var nc;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(nc || (nc = {}));
var rc;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(rc || (rc = {}));
var oc;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(oc || (oc = {}));
var sc;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(sc || (sc = {}));
var pn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(pn || (pn = {}));
var gi = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Yn = class {
  get text() {
    var e, t, n, r, o, s, a, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let c = "", d = !1;
    const h = [];
    for (const f of (u = (a = (s = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || s === void 0 ? void 0 : s.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [p, m] of Object.entries(f)) p !== "text" && p !== "thought" && p !== "thoughtSignature" && (m !== null || m !== void 0) && h.push(p);
      if (typeof f.text == "string") {
        if (typeof f.thought == "boolean" && f.thought) continue;
        d = !0, c += f.text;
      }
    }
    return h.length > 0 && console.warn(`there are non-text parts ${h} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, r, o, s, a, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const h of (u = (a = (s = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || s === void 0 ? void 0 : s.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [f, p] of Object.entries(h)) f !== "inlineData" && (p !== null || p !== void 0) && d.push(f);
      h.inlineData && typeof h.inlineData.data == "string" && (c += atob(h.inlineData.data));
    }
    return d.length > 0 && console.warn(`there are non-data parts ${d} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), c.length > 0 ? btoa(c) : void 0;
  }
  get functionCalls() {
    var e, t, n, r, o, s, a, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    const c = (u = (a = (s = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || s === void 0 ? void 0 : s.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((d) => d.functionCall).map((d) => d.functionCall).filter((d) => d !== void 0);
    if (c?.length !== 0)
      return c;
  }
  get executableCode() {
    var e, t, n, r, o, s, a, u, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    const d = (u = (a = (s = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || s === void 0 ? void 0 : s.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.executableCode).map((h) => h.executableCode).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, r, o, s, a, u, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (a = (s = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || s === void 0 ? void 0 : s.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.codeExecutionResult).map((h) => h.codeExecutionResult).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, ic = class {
}, ac = class {
}, u_ = class {
}, c_ = class {
}, d_ = class {
}, f_ = class {
}, lc = class {
}, uc = class {
}, cc = class {
}, h_ = class {
}, dc = class Yf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new Yf();
    let o;
    const s = t;
    return n ? o = Qy(s) : o = Xy(s), Object.assign(r, o), r;
  }
}, fc = class {
}, hc = class {
}, pc = class {
}, mc = class {
}, p_ = class {
}, m_ = class {
}, g_ = class {
}, y_ = class Xf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new Xf(), o = o_(t);
    return Object.assign(r, o), r;
  }
}, __ = class {
}, v_ = class {
}, A_ = class {
}, S_ = class {
}, gc = class {
}, T_ = class {
  get text() {
    var e, t, n;
    let r = "", o = !1;
    const s = [];
    for (const a of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [u, c] of Object.entries(a)) u !== "text" && u !== "thought" && c !== null && s.push(u);
      if (typeof a.text == "string") {
        if (typeof a.thought == "boolean" && a.thought) continue;
        o = !0, r += a.text;
      }
    }
    return s.length > 0 && console.warn(`there are non-text parts ${s} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), o ? r : void 0;
  }
  get data() {
    var e, t, n;
    let r = "";
    const o = [];
    for (const s of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [a, u] of Object.entries(s)) a !== "inlineData" && u !== null && o.push(a);
      s.inlineData && typeof s.inlineData.data == "string" && (r += atob(s.inlineData.data));
    }
    return o.length > 0 && console.warn(`there are non-data parts ${o} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), r.length > 0 ? btoa(r) : void 0;
  }
}, E_ = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, w_ = class Qf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new Qf(), o = zf(t);
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
function Zf(e, t) {
  const n = Y(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function jf(e) {
  return Array.isArray(e) ? e.map((t) => qo(t)) : [qo(e)];
}
function qo(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function eh(e) {
  const t = qo(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function th(e) {
  const t = qo(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function yc(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function nh(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => yc(t)) : [yc(e)];
}
function yi(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function _c(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function vc(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function fe(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return yi(e) ? e : {
    role: "user",
    parts: nh(e)
  };
}
function ca(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const r = fe(n);
    return r.parts && r.parts.length > 0 && r.parts[0].text !== void 0 ? [r.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = fe(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => fe(n)) : [fe(t)];
}
function Ie(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (_c(e) || vc(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [fe(e)];
  }
  const t = [], n = [], r = yi(e[0]);
  for (const o of e) {
    const s = yi(o);
    if (s != r) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (s) t.push(o);
    else {
      if (_c(o) || vc(o)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(o);
    }
  }
  return r || t.push({
    role: "user",
    parts: nh(n)
  }), t;
}
function C_(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((r) => r !== "null");
  if (n.length === 1) t.type = Object.values(Mt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : Mt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const r of n) t.anyOf.push({ type: Object.values(Mt).includes(r.toUpperCase()) ? r.toUpperCase() : Mt.TYPE_UNSPECIFIED });
  }
}
function An(e) {
  const t = {}, n = ["items"], r = ["anyOf"], o = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const s = e.anyOf;
  s != null && s.length == 2 && (s[0].type === "null" ? (t.nullable = !0, e = s[1]) : s[1].type === "null" && (t.nullable = !0, e = s[0])), e.type instanceof Array && C_(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(Mt).includes(u.toUpperCase()) ? u.toUpperCase() : Mt.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = An(u);
      else if (r.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(An(d));
        }
        t[a] = c;
      } else if (o.includes(a)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = An(h);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function da(e) {
  return An(e);
}
function fa(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function ha(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function bn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = An(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = An(t.response));
  return e;
}
function Pn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function I_(e, t, n, r = 1) {
  const o = !t.startsWith(`${n}/`) && t.split("/").length === r;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : o ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : o ? `${n}/${t}` : t;
}
function Tt(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return I_(e, t, "cachedContents");
}
function rh(e) {
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
function Dt(e) {
  return ua(e);
}
function b_(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function P_(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function R_(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function oh(e) {
  var t;
  let n;
  if (b_(e) && (n = e.name), !(R_(e) && (n = e.uri, n === void 0)) && !(P_(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const r = n.split("files/")[1].match(/[a-z0-9]+/);
      if (r === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = r[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function sh(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function ih(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (x_(e, t)) return e[t];
  return [];
}
function x_(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function M_(e, t = {}) {
  const n = e, r = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (r.responseJsonSchema = n.outputSchema), t.behavior && (r.behavior = t.behavior), { functionDeclarations: [r] };
}
function N_(e, t = {}) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = o.name;
    if (r.has(s)) throw new Error(`Duplicate function name ${s} found in MCP tools. Please ensure function names are unique.`);
    r.add(s);
    const a = M_(o, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function ah(e, t) {
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
function k_(e) {
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
function lh(e) {
  if (typeof e != "object" || e === null) return {};
  const t = e, n = t.inlinedResponses;
  if (typeof n != "object" || n === null) return e;
  const r = n.inlinedResponses;
  if (!Array.isArray(r) || r.length === 0) return e;
  let o = !1;
  for (const s of r) {
    if (typeof s != "object" || s === null) continue;
    const a = s.response;
    if (!(typeof a != "object" || a === null) && a.embedding !== void 0) {
      o = !0;
      break;
    }
  }
  return o && (t.inlinedEmbedContentResponses = t.inlinedResponses, delete t.inlinedResponses), e;
}
function Rn(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function uh(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function D_(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function $_(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function L_(e) {
  const t = {}, n = i(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const r = i(e, ["inlinedResponses", "inlinedResponses"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => gv(a))), l(t, ["inlinedResponses"], s);
  }
  const o = i(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], s);
  }
  return t;
}
function U_(e) {
  const t = {}, n = i(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const r = i(e, ["gcsDestination", "outputUriPrefix"]);
  r != null && l(t, ["gcsUri"], r);
  const o = i(e, ["bigqueryDestination", "outputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function F_(e) {
  const t = {}, n = i(e, ["format"]);
  n != null && l(t, ["predictionsFormat"], n);
  const r = i(e, ["gcsUri"]);
  r != null && l(t, ["gcsDestination", "outputUriPrefix"], r);
  const o = i(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigqueryDestination", "outputUri"], o), i(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (i(e, ["inlinedResponses"]) !== void 0) throw new Error("inlinedResponses parameter is not supported in Vertex AI.");
  if (i(e, ["inlinedEmbedContentResponses"]) !== void 0) throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");
  return t;
}
function wo(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata", "displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = i(e, ["metadata", "state"]);
  o != null && l(t, ["state"], uh(o));
  const s = i(e, ["metadata", "createTime"]);
  s != null && l(t, ["createTime"], s);
  const a = i(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = i(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = i(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = i(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], L_(lh(d))), t;
}
function _i(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = i(e, ["state"]);
  o != null && l(t, ["state"], uh(o));
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["createTime"]);
  a != null && l(t, ["createTime"], a);
  const u = i(e, ["startTime"]);
  u != null && l(t, ["startTime"], u);
  const c = i(e, ["endTime"]);
  c != null && l(t, ["endTime"], c);
  const d = i(e, ["updateTime"]);
  d != null && l(t, ["updateTime"], d);
  const h = i(e, ["model"]);
  h != null && l(t, ["model"], h);
  const f = i(e, ["inputConfig"]);
  f != null && l(t, ["src"], O_(f));
  const p = i(e, ["outputConfig"]);
  p != null && l(t, ["dest"], U_(lh(p)));
  const m = i(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function O_(e) {
  const t = {}, n = i(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const r = i(e, ["gcsSource", "uris"]);
  r != null && l(t, ["gcsUri"], r);
  const o = i(e, ["bigquerySource", "inputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function q_(e, t) {
  const n = {};
  if (i(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (i(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (i(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const r = i(t, ["fileName"]);
  r != null && l(n, ["fileName"], r);
  const o = i(t, ["inlinedRequests"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => mv(e, a))), l(n, ["requests", "requests"], s);
  }
  return n;
}
function B_(e) {
  const t = {}, n = i(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const r = i(e, ["gcsUri"]);
  r != null && l(t, ["gcsSource", "uris"], r);
  const o = i(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigquerySource", "inputUri"], o), i(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (i(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function G_(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function H_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Rn(e, r)), n;
}
function V_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Rn(e, r)), n;
}
function J_(e) {
  const t = {}, n = i(e, ["content"]);
  n != null && l(t, ["content"], n);
  const r = i(e, ["citationMetadata"]);
  r != null && l(t, ["citationMetadata"], K_(r));
  const o = i(e, ["tokenCount"]);
  o != null && l(t, ["tokenCount"], o);
  const s = i(e, ["finishReason"]);
  s != null && l(t, ["finishReason"], s);
  const a = i(e, ["groundingMetadata"]);
  a != null && l(t, ["groundingMetadata"], a);
  const u = i(e, ["avgLogprobs"]);
  u != null && l(t, ["avgLogprobs"], u);
  const c = i(e, ["index"]);
  c != null && l(t, ["index"], c);
  const d = i(e, ["logprobsResult"]);
  d != null && l(t, ["logprobsResult"], d);
  const h = i(e, ["safetyRatings"]);
  if (h != null) {
    let p = h;
    Array.isArray(p) && (p = p.map((m) => m)), l(t, ["safetyRatings"], p);
  }
  const f = i(e, ["urlContextMetadata"]);
  return f != null && l(t, ["urlContextMetadata"], f), t;
}
function K_(e) {
  const t = {}, n = i(e, ["citationSources"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["citations"], r);
  }
  return t;
}
function ch(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => Ev(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function W_(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  if (t !== void 0 && r != null && l(t, ["batch", "displayName"], r), i(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const o = i(e, ["webhookConfig"]);
  return t !== void 0 && o != null && l(t, ["batch", "webhookConfig"], o), n;
}
function z_(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const o = i(e, ["dest"]);
  if (t !== void 0 && o != null && l(t, ["outputConfig"], F_(k_(o))), i(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Ac(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = i(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], q_(e, ah(e, o)));
  const s = i(t, ["config"]);
  return s != null && W_(s, n), n;
}
function Y_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["model"], Y(e, r));
  const o = i(t, ["src"]);
  o != null && l(n, ["inputConfig"], B_(ah(e, o)));
  const s = i(t, ["config"]);
  return s != null && z_(s, n), n;
}
function X_(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["batch", "displayName"], r), n;
}
function Q_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = i(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], ov(e, o));
  const s = i(t, ["config"]);
  return s != null && X_(s, n), n;
}
function Z_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Rn(e, r)), n;
}
function j_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Rn(e, r)), n;
}
function ev(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  return s != null && l(t, ["error"], s), t;
}
function tv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  return s != null && l(t, ["error"], s), t;
}
function nv(e, t) {
  const n = {}, r = i(t, ["contents"]);
  if (r != null) {
    let s = ca(e, r);
    Array.isArray(s) && (s = s.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], s);
  }
  const o = i(t, ["config"]);
  return o != null && (l(n, ["_self"], rv(o, n)), zy(n, { "requests[].*": "requests[].request.*" })), n;
}
function rv(e, t) {
  const n = {}, r = i(e, ["taskType"]);
  t !== void 0 && r != null && l(t, ["requests[]", "taskType"], r);
  const o = i(e, ["title"]);
  t !== void 0 && o != null && l(t, ["requests[]", "title"], o);
  const s = i(e, ["outputDimensionality"]);
  if (t !== void 0 && s != null && l(t, ["requests[]", "outputDimensionality"], s), i(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (i(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (i(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (i(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return n;
}
function ov(e, t) {
  const n = {}, r = i(t, ["fileName"]);
  r != null && l(n, ["file_name"], r);
  const o = i(t, ["inlinedRequests"]);
  return o != null && l(n, ["requests"], nv(e, o)), n;
}
function sv(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function iv(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function av(e) {
  const t = {}, n = i(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = i(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function lv(e, t, n) {
  const r = {}, o = i(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], ch(fe(o)));
  const s = i(t, ["temperature"]);
  s != null && l(r, ["temperature"], s);
  const a = i(t, ["topP"]);
  a != null && l(r, ["topP"], a);
  const u = i(t, ["topK"]);
  u != null && l(r, ["topK"], u);
  const c = i(t, ["candidateCount"]);
  c != null && l(r, ["candidateCount"], c);
  const d = i(t, ["maxOutputTokens"]);
  d != null && l(r, ["maxOutputTokens"], d);
  const h = i(t, ["stopSequences"]);
  h != null && l(r, ["stopSequences"], h);
  const f = i(t, ["responseLogprobs"]);
  f != null && l(r, ["responseLogprobs"], f);
  const p = i(t, ["logprobs"]);
  p != null && l(r, ["logprobs"], p);
  const m = i(t, ["presencePenalty"]);
  m != null && l(r, ["presencePenalty"], m);
  const y = i(t, ["frequencyPenalty"]);
  y != null && l(r, ["frequencyPenalty"], y);
  const _ = i(t, ["seed"]);
  _ != null && l(r, ["seed"], _);
  const v = i(t, ["responseMimeType"]);
  v != null && l(r, ["responseMimeType"], v);
  const w = i(t, ["responseSchema"]);
  w != null && l(r, ["responseSchema"], da(w));
  const b = i(t, ["responseJsonSchema"]);
  if (b != null && l(r, ["responseJsonSchema"], b), i(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (i(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = i(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let Q = P;
    Array.isArray(Q) && (Q = Q.map((X) => wv(X))), l(n, ["safetySettings"], Q);
  }
  const x = i(t, ["tools"]);
  if (n !== void 0 && x != null) {
    let Q = Pn(x);
    Array.isArray(Q) && (Q = Q.map((X) => Iv(bn(X)))), l(n, ["tools"], Q);
  }
  const $ = i(t, ["toolConfig"]);
  if (n !== void 0 && $ != null && l(n, ["toolConfig"], Cv($)), i(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const S = i(t, ["cachedContent"]);
  n !== void 0 && S != null && l(n, ["cachedContent"], Tt(e, S));
  const O = i(t, ["responseModalities"]);
  O != null && l(r, ["responseModalities"], O);
  const R = i(t, ["mediaResolution"]);
  R != null && l(r, ["mediaResolution"], R);
  const k = i(t, ["speechConfig"]);
  if (k != null && l(r, ["speechConfig"], fa(k)), i(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = i(t, ["thinkingConfig"]);
  H != null && l(r, ["thinkingConfig"], H);
  const z = i(t, ["imageConfig"]);
  z != null && l(r, ["imageConfig"], pv(z));
  const se = i(t, ["enableEnhancedCivicAnswers"]);
  if (se != null && l(r, ["enableEnhancedCivicAnswers"], se), i(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const j = i(t, ["serviceTier"]);
  return n !== void 0 && j != null && l(n, ["serviceTier"], j), r;
}
function uv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["candidates"]);
  if (r != null) {
    let d = r;
    Array.isArray(d) && (d = d.map((h) => J_(h))), l(t, ["candidates"], d);
  }
  const o = i(e, ["modelVersion"]);
  o != null && l(t, ["modelVersion"], o);
  const s = i(e, ["promptFeedback"]);
  s != null && l(t, ["promptFeedback"], s);
  const a = i(e, ["responseId"]);
  a != null && l(t, ["responseId"], a);
  const u = i(e, ["usageMetadata"]);
  u != null && l(t, ["usageMetadata"], u);
  const c = i(e, ["modelStatus"]);
  return c != null && l(t, ["modelStatus"], c), t;
}
function cv(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Rn(e, r)), n;
}
function dv(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Rn(e, r)), n;
}
function fv(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], $_(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function hv(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function pv(e) {
  const t = {}, n = i(e, ["aspectRatio"]);
  n != null && l(t, ["aspectRatio"], n);
  const r = i(e, ["imageSize"]);
  if (r != null && l(t, ["imageSize"], r), i(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (i(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (i(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (i(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (i(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return t;
}
function mv(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["request", "model"], Y(e, r));
  const o = i(t, ["contents"]);
  if (o != null) {
    let u = Ie(o);
    Array.isArray(u) && (u = u.map((c) => ch(c))), l(n, ["request", "contents"], u);
  }
  const s = i(t, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const a = i(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], lv(e, a, i(n, ["request"], {}))), n;
}
function gv(e) {
  const t = {}, n = i(e, ["response"]);
  n != null && l(t, ["response"], uv(n));
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function yv(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  if (t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), i(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function _v(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const s = i(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), n;
}
function vv(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && yv(n, t), t;
}
function Av(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && _v(n, t), t;
}
function Sv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = i(e, ["operations"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => wo(a))), l(t, ["batchJobs"], s);
  }
  return t;
}
function Tv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = i(e, ["batchPredictionJobs"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => _i(a))), l(t, ["batchJobs"], s);
  }
  return t;
}
function Ev(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], sv(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], iv(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], G_(c));
  const d = i(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = i(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = i(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = i(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = i(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const y = i(e, ["toolResponse"]);
  y != null && l(t, ["toolResponse"], y);
  const _ = i(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function wv(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = i(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function Cv(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = i(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], av(r));
  const o = i(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function Iv(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], hv(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], fv(s));
  const a = i(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = i(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = i(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = i(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
var At;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(At || (At = {}));
var Xt = class {
  constructor(e, t, n, r) {
    this.pageInternal = [], this.paramsInternal = {}, this.requestInternal = t, this.init(e, n, r);
  }
  init(e, t, n) {
    var r, o;
    this.nameInternal = e, this.pageInternal = t[this.nameInternal] || [], this.sdkHttpResponseInternal = t?.sdkHttpResponse, this.idxInternal = 0;
    let s = { config: {} };
    !n || Object.keys(n).length === 0 ? s = { config: {} } : typeof n == "object" ? s = Object.assign({}, n) : s = n, s.config && (s.config.pageToken = t.nextPageToken), this.paramsInternal = s, this.pageInternalSize = (o = (r = s.config) === null || r === void 0 ? void 0 : r.pageSize) !== null && o !== void 0 ? o : this.pageInternal.length;
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
}, bv = class extends St {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Xt(At.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Ac(this.apiClient, e), n = t._url, r = D("{model}:batchGenerateContent", n), o = t.batch.inputConfig.requests, s = o.requests, a = [];
    for (const u of s) {
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
      const o = this.getGcsUri(e), s = this.getBigqueryUri(e);
      if (o) o.endsWith(".jsonl") ? n.dest = `${o.slice(0, -6)}/dest` : n.dest = `${o}_dest_${r}`;
      else if (s) n.dest = `${s}_dest_${r}`;
      else throw new Error("Unsupported source for Vertex AI: No GCS or BigQuery URI found.");
    }
    return n;
  }
  async createInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Y_(this.apiClient, e);
      return a = D("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => _i(d));
    } else {
      const c = Ac(this.apiClient, e);
      return a = D("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => wo(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Q_(this.apiClient, e);
      return o = D("{model}:asyncBatchEmbedContent", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => wo(u));
    }
  }
  async get(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = dv(this.apiClient, e);
      return a = D("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => _i(d));
    } else {
      const c = cv(this.apiClient, e);
      return a = D("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => wo(d));
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let s = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = V_(this.apiClient, e);
      s = D("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: s,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = H_(this.apiClient, e);
      s = D("batches/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: s,
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
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Av(e);
      return a = D("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Tv(d), f = new gc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = vv(e);
      return a = D("batches", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Sv(d), f = new gc();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = j_(this.apiClient, e);
      return a = D("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => tv(d));
    } else {
      const c = Z_(this.apiClient, e);
      return a = D("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => ev(d));
    }
  }
};
function Pv(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Rv(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Sc(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => Zv(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Tc(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => jv(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function xv(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const s = i(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const a = i(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let h = Ie(a);
    Array.isArray(h) && (h = h.map((f) => Sc(f))), l(t, ["contents"], h);
  }
  const u = i(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Sc(fe(u)));
  const c = i(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => nA(f))), l(t, ["tools"], h);
  }
  const d = i(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], eA(d)), i(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function Mv(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const s = i(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const a = i(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = Ie(a);
    Array.isArray(f) && (f = f.map((p) => Tc(p))), l(t, ["contents"], f);
  }
  const u = i(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Tc(fe(u)));
  const c = i(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => rA(p))), l(t, ["tools"], f);
  }
  const d = i(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], tA(d));
  const h = i(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function Nv(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["model"], Zf(e, r));
  const o = i(t, ["config"]);
  return o != null && xv(o, n), n;
}
function kv(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["model"], Zf(e, r));
  const o = i(t, ["config"]);
  return o != null && Mv(o, n), n;
}
function Dv(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Tt(e, r)), n;
}
function $v(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Tt(e, r)), n;
}
function Lv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Uv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Fv(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Ov(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function qv(e) {
  const t = {}, n = i(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = i(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Bv(e) {
  const t = {}, n = i(e, ["description"]);
  n != null && l(t, ["description"], n);
  const r = i(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = i(e, ["parameters"]);
  o != null && l(t, ["parameters"], o);
  const s = i(e, ["parametersJsonSchema"]);
  s != null && l(t, ["parametersJsonSchema"], s);
  const a = i(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = i(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), i(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function Gv(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Tt(e, r)), n;
}
function Hv(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Tt(e, r)), n;
}
function Vv(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Pv(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function Jv(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function Kv(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function Wv(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function zv(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && Kv(n, t), t;
}
function Yv(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && Wv(n, t), t;
}
function Xv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = i(e, ["cachedContents"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(t, ["cachedContents"], s);
  }
  return t;
}
function Qv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = i(e, ["cachedContents"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(t, ["cachedContents"], s);
  }
  return t;
}
function Zv(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], Fv(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Ov(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Rv(c));
  const d = i(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = i(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = i(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = i(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = i(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const y = i(e, ["toolResponse"]);
  y != null && l(t, ["toolResponse"], y);
  const _ = i(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function jv(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], s);
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], a);
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = i(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = i(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = i(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = i(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), i(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (i(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (i(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function eA(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = i(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], qv(r));
  const o = i(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function tA(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = i(e, ["functionCallingConfig"]);
  if (r != null && l(t, ["functionCallingConfig"], r), i(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function nA(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], Jv(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], Vv(s));
  const a = i(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = i(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = i(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = i(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function rA(e) {
  const t = {}, n = i(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const r = i(e, ["computerUse"]);
  if (r != null && l(t, ["computerUse"], r), i(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], o);
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], s);
  const a = i(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = i(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = i(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => Bv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = i(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = i(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = i(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function oA(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function sA(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function iA(e, t) {
  const n = {}, r = i(t, ["name"]);
  r != null && l(n, ["_url", "name"], Tt(e, r));
  const o = i(t, ["config"]);
  return o != null && oA(o, n), n;
}
function aA(e, t) {
  const n = {}, r = i(t, ["name"]);
  r != null && l(n, ["_url", "name"], Tt(e, r));
  const o = i(t, ["config"]);
  return o != null && sA(o, n), n;
}
var lA = class extends St {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Xt(At.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = kv(this.apiClient, e);
      return a = D("cachedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const c = Nv(this.apiClient, e);
      return a = D("cachedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    }
  }
  async get(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Hv(this.apiClient, e);
      return a = D("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const c = Gv(this.apiClient, e);
      return a = D("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    }
  }
  async delete(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $v(this.apiClient, e);
      return a = D("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Uv(d), f = new pc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Dv(this.apiClient, e);
      return a = D("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Lv(d), f = new pc();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = aA(this.apiClient, e);
      return a = D("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const c = iA(this.apiClient, e);
      return a = D("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Yv(e);
      return a = D("cachedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Qv(d), f = new mc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = zv(e);
      return a = D("cachedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Xv(d), f = new mc();
        return Object.assign(f, h), f;
      });
    }
  }
};
function Nt(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, r = Object.getOwnPropertySymbols(e); o < r.length; o++) t.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[o]) && (n[r[o]] = e[r[o]]);
  return n;
}
function Ec(e) {
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
function K(e) {
  return this instanceof K ? (this.v = e, this) : new K(e);
}
function tt(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var r = n.apply(e, t || []), o, s = [];
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
      return new Promise(function(v, w) {
        s.push([
          m,
          _,
          v,
          w
        ]) > 1 || c(m, _);
      });
    }, y && (o[m] = y(o[m])));
  }
  function c(m, y) {
    try {
      d(r[m](y));
    } catch (_) {
      p(s[0][3], _);
    }
  }
  function d(m) {
    m.value instanceof K ? Promise.resolve(m.value.v).then(h, f) : p(s[0][2], m);
  }
  function h(m) {
    c("next", m);
  }
  function f(m) {
    c("throw", m);
  }
  function p(m, y) {
    m(y), s.shift(), s.length && c(s[0][0], s[0][1]);
  }
}
function nt(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Ec == "function" ? Ec(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function r(s) {
    n[s] = e[s] && function(a) {
      return new Promise(function(u, c) {
        a = e[s](a), o(u, c, a.done, a.value);
      });
    };
  }
  function o(s, a, u, c) {
    Promise.resolve(c).then(function(d) {
      s({
        value: d,
        done: u
      });
    }, a);
  }
}
function uA(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : dh(n);
}
function dh(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function cA(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function wc(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let r = 0;
  for (; r < n; ) if (e[r].role === "user")
    t.push(e[r]), r++;
  else {
    const o = [];
    let s = !0;
    for (; r < n && e[r].role === "model"; )
      o.push(e[r]), s && !dh(e[r]) && (s = !1), r++;
    s ? t.push(...o) : t.pop();
  }
  return t;
}
var dA = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new fA(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, fA = class {
  constructor(e, t, n, r = {}, o = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = r, this.history = o, this.sendPromise = Promise.resolve(), cA(o);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = fe(e.message), r = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var o, s, a;
      const u = await r, c = (s = (o = u.candidates) === null || o === void 0 ? void 0 : o[0]) === null || s === void 0 ? void 0 : s.content, d = u.automaticFunctionCallingHistory, h = this.getHistory(!0).length;
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
    const n = fe(e.message), r = this.modelsModule.generateContentStream({
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
    const t = e ? wc(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return tt(this, arguments, function* () {
      var r, o, s, a, u, c;
      const d = [];
      try {
        for (var h = !0, f = nt(e), p; p = yield K(f.next()), r = p.done, !r; h = !0) {
          a = p.value, h = !1;
          const m = a;
          if (uA(m)) {
            const y = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            y !== void 0 && d.push(y);
          }
          yield yield K(m);
        }
      } catch (m) {
        o = { error: m };
      } finally {
        try {
          !h && !r && (s = f.return) && (yield K(s.call(f)));
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
    }), n && n.length > 0 ? this.history.push(...wc(n)) : this.history.push(e), this.history.push(...r);
  }
}, fh = class hh extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, hh.prototype);
  }
};
function hA(e) {
  const t = {}, n = i(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function pA(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function mA(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "file"], oh(n)), t;
}
function gA(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function yA(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "file"], oh(n)), t;
}
function _A(e) {
  const t = {}, n = i(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function vA(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function AA(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && vA(n, t), t;
}
function SA(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = i(e, ["files"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(t, ["files"], s);
  }
  return t;
}
function TA(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["files"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["files"], o);
  }
  return t;
}
var EA = class extends St {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Xt(At.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = AA(e);
      return o = D("files", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = SA(u), d = new __();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = hA(e);
      return o = D("upload/v1beta/files", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = pA(u), d = new v_();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = yA(e);
      return o = D("files/{file}", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = mA(e);
      return o = D("files/{file}", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = gA(u), d = new A_();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = _A(e);
      return o = D("files:register", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = TA(u), d = new S_();
        return Object.assign(d, c), d;
      });
    }
  }
};
function Cc(e) {
  const t = {};
  if (i(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function wA(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Co(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function CA(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => GA(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function IA(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => HA(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function bA(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function PA(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function RA(e) {
  const t = {}, n = i(e, ["description"]);
  n != null && l(t, ["description"], n);
  const r = i(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = i(e, ["parameters"]);
  o != null && l(t, ["parameters"], o);
  const s = i(e, ["parametersJsonSchema"]);
  s != null && l(t, ["parametersJsonSchema"], s);
  const a = i(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = i(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), i(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function xA(e) {
  const t = {}, n = i(e, ["modelSelectionConfig"]);
  n != null && l(t, ["modelConfig"], n);
  const r = i(e, ["responseJsonSchema"]);
  r != null && l(t, ["responseJsonSchema"], r);
  const o = i(e, ["audioTimestamp"]);
  o != null && l(t, ["audioTimestamp"], o);
  const s = i(e, ["candidateCount"]);
  s != null && l(t, ["candidateCount"], s);
  const a = i(e, ["enableAffectiveDialog"]);
  a != null && l(t, ["enableAffectiveDialog"], a);
  const u = i(e, ["frequencyPenalty"]);
  u != null && l(t, ["frequencyPenalty"], u);
  const c = i(e, ["logprobs"]);
  c != null && l(t, ["logprobs"], c);
  const d = i(e, ["maxOutputTokens"]);
  d != null && l(t, ["maxOutputTokens"], d);
  const h = i(e, ["mediaResolution"]);
  h != null && l(t, ["mediaResolution"], h);
  const f = i(e, ["presencePenalty"]);
  f != null && l(t, ["presencePenalty"], f);
  const p = i(e, ["responseLogprobs"]);
  p != null && l(t, ["responseLogprobs"], p);
  const m = i(e, ["responseMimeType"]);
  m != null && l(t, ["responseMimeType"], m);
  const y = i(e, ["responseModalities"]);
  y != null && l(t, ["responseModalities"], y);
  const _ = i(e, ["responseSchema"]);
  _ != null && l(t, ["responseSchema"], _);
  const v = i(e, ["routingConfig"]);
  v != null && l(t, ["routingConfig"], v);
  const w = i(e, ["seed"]);
  w != null && l(t, ["seed"], w);
  const b = i(e, ["speechConfig"]);
  b != null && l(t, ["speechConfig"], b);
  const P = i(e, ["stopSequences"]);
  P != null && l(t, ["stopSequences"], P);
  const x = i(e, ["temperature"]);
  x != null && l(t, ["temperature"], x);
  const $ = i(e, ["thinkingConfig"]);
  $ != null && l(t, ["thinkingConfig"], $);
  const S = i(e, ["topK"]);
  S != null && l(t, ["topK"], S);
  const O = i(e, ["topP"]);
  if (O != null && l(t, ["topP"], O), i(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function MA(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], wA(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function NA(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function kA(e, t) {
  const n = {}, r = i(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], r);
  const o = i(e, ["responseModalities"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], o);
  const s = i(e, ["temperature"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], s);
  const a = i(e, ["topP"]);
  t !== void 0 && a != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], a);
  const u = i(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = i(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = i(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = i(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = i(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], ha(f));
  const p = i(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = i(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const y = i(e, ["systemInstruction"]);
  t !== void 0 && y != null && l(t, ["setup", "systemInstruction"], CA(fe(y)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let R = Pn(_);
    Array.isArray(R) && (R = R.map((k) => KA(bn(k)))), l(t, ["setup", "tools"], R);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], JA(v));
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], Cc(w));
  const b = i(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], Cc(b));
  const P = i(e, ["realtimeInputConfig"]);
  t !== void 0 && P != null && l(t, ["setup", "realtimeInputConfig"], P);
  const x = i(e, ["contextWindowCompression"]);
  t !== void 0 && x != null && l(t, ["setup", "contextWindowCompression"], x);
  const $ = i(e, ["proactivity"]);
  if (t !== void 0 && $ != null && l(t, ["setup", "proactivity"], $), i(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = i(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const O = i(e, ["safetySettings"]);
  if (t !== void 0 && O != null) {
    let R = O;
    Array.isArray(R) && (R = R.map((k) => VA(k))), l(t, ["setup", "safetySettings"], R);
  }
  return n;
}
function DA(e, t) {
  const n = {}, r = i(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], xA(r));
  const o = i(e, ["responseModalities"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], o);
  const s = i(e, ["temperature"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], s);
  const a = i(e, ["topP"]);
  t !== void 0 && a != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], a);
  const u = i(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = i(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = i(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = i(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = i(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], ha(f));
  const p = i(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = i(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const y = i(e, ["systemInstruction"]);
  t !== void 0 && y != null && l(t, ["setup", "systemInstruction"], IA(fe(y)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let k = Pn(_);
    Array.isArray(k) && (k = k.map((H) => WA(bn(H)))), l(t, ["setup", "tools"], k);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], v);
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], w);
  const b = i(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], b);
  const P = i(e, ["realtimeInputConfig"]);
  t !== void 0 && P != null && l(t, ["setup", "realtimeInputConfig"], P);
  const x = i(e, ["contextWindowCompression"]);
  t !== void 0 && x != null && l(t, ["setup", "contextWindowCompression"], x);
  const $ = i(e, ["proactivity"]);
  t !== void 0 && $ != null && l(t, ["setup", "proactivity"], $);
  const S = i(e, ["explicitVadSignal"]);
  t !== void 0 && S != null && l(t, ["setup", "explicitVadSignal"], S);
  const O = i(e, ["avatarConfig"]);
  t !== void 0 && O != null && l(t, ["setup", "avatarConfig"], O);
  const R = i(e, ["safetySettings"]);
  if (t !== void 0 && R != null) {
    let k = R;
    Array.isArray(k) && (k = k.map((H) => H)), l(t, ["setup", "safetySettings"], k);
  }
  return n;
}
function $A(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = i(t, ["config"]);
  return o != null && l(n, ["config"], kA(o, n)), n;
}
function LA(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = i(t, ["config"]);
  return o != null && l(n, ["config"], DA(o, n)), n;
}
function UA(e) {
  const t = {}, n = i(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function FA(e) {
  const t = {}, n = i(e, ["weightedPrompts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["weightedPrompts"], r);
  }
  return t;
}
function OA(e) {
  const t = {}, n = i(e, ["media"]);
  if (n != null) {
    let d = jf(n);
    Array.isArray(d) && (d = d.map((h) => Co(h))), l(t, ["mediaChunks"], d);
  }
  const r = i(e, ["audio"]);
  r != null && l(t, ["audio"], Co(th(r)));
  const o = i(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const s = i(e, ["video"]);
  s != null && l(t, ["video"], Co(eh(s)));
  const a = i(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = i(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = i(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function qA(e) {
  const t = {}, n = i(e, ["media"]);
  if (n != null) {
    let d = jf(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const r = i(e, ["audio"]);
  r != null && l(t, ["audio"], th(r));
  const o = i(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const s = i(e, ["video"]);
  s != null && l(t, ["video"], eh(s));
  const a = i(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = i(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = i(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function BA(e) {
  const t = {}, n = i(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const r = i(e, ["serverContent"]);
  r != null && l(t, ["serverContent"], r);
  const o = i(e, ["toolCall"]);
  o != null && l(t, ["toolCall"], o);
  const s = i(e, ["toolCallCancellation"]);
  s != null && l(t, ["toolCallCancellation"], s);
  const a = i(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], zA(a));
  const u = i(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = i(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = i(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = i(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], YA(h)), t;
}
function GA(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], bA(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], PA(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Co(c));
  const d = i(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = i(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = i(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = i(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = i(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const y = i(e, ["toolResponse"]);
  y != null && l(t, ["toolResponse"], y);
  const _ = i(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function HA(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], s);
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], a);
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = i(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = i(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = i(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = i(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), i(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (i(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (i(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function VA(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = i(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function JA(e) {
  const t = {}, n = i(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), i(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function KA(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], NA(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], MA(s));
  const a = i(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = i(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = i(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = i(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function WA(e) {
  const t = {}, n = i(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const r = i(e, ["computerUse"]);
  if (r != null && l(t, ["computerUse"], r), i(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], o);
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], s);
  const a = i(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = i(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = i(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => RA(m))), l(t, ["functionDeclarations"], p);
  }
  const d = i(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = i(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = i(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function zA(e) {
  const t = {}, n = i(e, ["promptTokenCount"]);
  n != null && l(t, ["promptTokenCount"], n);
  const r = i(e, ["cachedContentTokenCount"]);
  r != null && l(t, ["cachedContentTokenCount"], r);
  const o = i(e, ["candidatesTokenCount"]);
  o != null && l(t, ["responseTokenCount"], o);
  const s = i(e, ["toolUsePromptTokenCount"]);
  s != null && l(t, ["toolUsePromptTokenCount"], s);
  const a = i(e, ["thoughtsTokenCount"]);
  a != null && l(t, ["thoughtsTokenCount"], a);
  const u = i(e, ["totalTokenCount"]);
  u != null && l(t, ["totalTokenCount"], u);
  const c = i(e, ["promptTokensDetails"]);
  if (c != null) {
    let m = c;
    Array.isArray(m) && (m = m.map((y) => y)), l(t, ["promptTokensDetails"], m);
  }
  const d = i(e, ["cacheTokensDetails"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((y) => y)), l(t, ["cacheTokensDetails"], m);
  }
  const h = i(e, ["candidatesTokensDetails"]);
  if (h != null) {
    let m = h;
    Array.isArray(m) && (m = m.map((y) => y)), l(t, ["responseTokensDetails"], m);
  }
  const f = i(e, ["toolUsePromptTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((y) => y)), l(t, ["toolUsePromptTokensDetails"], m);
  }
  const p = i(e, ["trafficType"]);
  return p != null && l(t, ["trafficType"], p), t;
}
function YA(e) {
  const t = {}, n = i(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function XA(e, t) {
  const n = {}, r = i(e, ["apiKey"]);
  if (r != null && l(n, ["apiKey"], r), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function QA(e, t) {
  const n = {}, r = i(e, ["data"]);
  if (r != null && l(n, ["data"], r), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function ZA(e, t) {
  const n = {}, r = i(e, ["content"]);
  r != null && l(n, ["content"], r);
  const o = i(e, ["citationMetadata"]);
  o != null && l(n, ["citationMetadata"], jA(o));
  const s = i(e, ["tokenCount"]);
  s != null && l(n, ["tokenCount"], s);
  const a = i(e, ["finishReason"]);
  a != null && l(n, ["finishReason"], a);
  const u = i(e, ["groundingMetadata"]);
  u != null && l(n, ["groundingMetadata"], u);
  const c = i(e, ["avgLogprobs"]);
  c != null && l(n, ["avgLogprobs"], c);
  const d = i(e, ["index"]);
  d != null && l(n, ["index"], d);
  const h = i(e, ["logprobsResult"]);
  h != null && l(n, ["logprobsResult"], h);
  const f = i(e, ["safetyRatings"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((y) => y)), l(n, ["safetyRatings"], m);
  }
  const p = i(e, ["urlContextMetadata"]);
  return p != null && l(n, ["urlContextMetadata"], p), n;
}
function jA(e, t) {
  const n = {}, r = i(e, ["citationSources"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => s)), l(n, ["citations"], o);
  }
  return n;
}
function eS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let a = Ie(s);
    Array.isArray(a) && (a = a.map((u) => xn(u))), l(r, ["contents"], a);
  }
  return r;
}
function tS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["tokensInfo"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(n, ["tokensInfo"], s);
  }
  return n;
}
function nS(e, t) {
  const n = {}, r = i(e, ["values"]);
  r != null && l(n, ["values"], r);
  const o = i(e, ["statistics"]);
  return o != null && l(n, ["statistics"], rS(o)), n;
}
function rS(e, t) {
  const n = {}, r = i(e, ["truncated"]);
  r != null && l(n, ["truncated"], r);
  const o = i(e, ["token_count"]);
  return o != null && l(n, ["tokenCount"], o), n;
}
function Lr(e, t) {
  const n = {}, r = i(e, ["parts"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => fT(a))), l(n, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function xn(e, t) {
  const n = {}, r = i(e, ["parts"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => hT(a))), l(n, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function oS(e, t) {
  const n = {}, r = i(e, ["controlType"]);
  r != null && l(n, ["controlType"], r);
  const o = i(e, ["enableControlImageComputation"]);
  return o != null && l(n, ["computeControl"], o), n;
}
function sS(e, t) {
  const n = {};
  if (i(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (i(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (i(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function iS(e, t, n) {
  const r = {}, o = i(e, ["systemInstruction"]);
  t !== void 0 && o != null && l(t, ["systemInstruction"], xn(fe(o)));
  const s = i(e, ["tools"]);
  if (t !== void 0 && s != null) {
    let u = s;
    Array.isArray(u) && (u = u.map((c) => yh(c))), l(t, ["tools"], u);
  }
  const a = i(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], QS(a)), r;
}
function aS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let u = Ie(s);
    Array.isArray(u) && (u = u.map((c) => Lr(c))), l(r, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && sS(a), r;
}
function lS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let u = Ie(s);
    Array.isArray(u) && (u = u.map((c) => xn(c))), l(r, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && iS(a, r), r;
}
function uS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["totalTokens"]);
  o != null && l(n, ["totalTokens"], o);
  const s = i(e, ["cachedContentTokenCount"]);
  return s != null && l(n, ["cachedContentTokenCount"], s), n;
}
function cS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["totalTokens"]);
  return o != null && l(n, ["totalTokens"], o), n;
}
function dS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function fS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function hS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function pS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function mS(e, t, n) {
  const r = {}, o = i(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
  const s = i(e, ["negativePrompt"]);
  t !== void 0 && s != null && l(t, ["parameters", "negativePrompt"], s);
  const a = i(e, ["numberOfImages"]);
  t !== void 0 && a != null && l(t, ["parameters", "sampleCount"], a);
  const u = i(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = i(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = i(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const h = i(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && l(t, ["parameters", "safetySetting"], h);
  const f = i(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = i(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = i(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const y = i(e, ["language"]);
  t !== void 0 && y != null && l(t, ["parameters", "language"], y);
  const _ = i(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const v = i(e, ["outputCompressionQuality"]);
  t !== void 0 && v != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], v);
  const w = i(e, ["addWatermark"]);
  t !== void 0 && w != null && l(t, ["parameters", "addWatermark"], w);
  const b = i(e, ["labels"]);
  t !== void 0 && b != null && l(t, ["labels"], b);
  const P = i(e, ["editMode"]);
  t !== void 0 && P != null && l(t, ["parameters", "editMode"], P);
  const x = i(e, ["baseSteps"]);
  return t !== void 0 && x != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], x), r;
}
function gS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => vT(d))), l(r, ["instances[0]", "referenceImages"], c);
  }
  const u = i(t, ["config"]);
  return u != null && mS(u, r), r;
}
function yS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => as(a))), l(n, ["generatedImages"], s);
  }
  return n;
}
function _S(e, t, n) {
  const r = {}, o = i(e, ["taskType"]);
  t !== void 0 && o != null && l(t, ["requests[]", "taskType"], o);
  const s = i(e, ["title"]);
  t !== void 0 && s != null && l(t, ["requests[]", "title"], s);
  const a = i(e, ["outputDimensionality"]);
  if (t !== void 0 && a != null && l(t, ["requests[]", "outputDimensionality"], a), i(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (i(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (i(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (i(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return r;
}
function vS(e, t, n) {
  const r = {};
  let o = i(n, ["embeddingApiType"]);
  if (o === void 0 && (o = "PREDICT"), o === "PREDICT") {
    const f = i(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "task_type"], f);
  } else if (o === "EMBED_CONTENT") {
    const f = i(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "taskType"], f);
  }
  let s = i(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "PREDICT") {
    const f = i(e, ["title"]);
    t !== void 0 && f != null && l(t, ["instances[]", "title"], f);
  } else if (s === "EMBED_CONTENT") {
    const f = i(e, ["title"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "title"], f);
  }
  let a = i(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "PREDICT") {
    const f = i(e, ["outputDimensionality"]);
    t !== void 0 && f != null && l(t, ["parameters", "outputDimensionality"], f);
  } else if (a === "EMBED_CONTENT") {
    const f = i(e, ["outputDimensionality"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "outputDimensionality"], f);
  }
  let u = i(n, ["embeddingApiType"]);
  if (u === void 0 && (u = "PREDICT"), u === "PREDICT") {
    const f = i(e, ["mimeType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "mimeType"], f);
  }
  let c = i(n, ["embeddingApiType"]);
  if (c === void 0 && (c = "PREDICT"), c === "PREDICT") {
    const f = i(e, ["autoTruncate"]);
    t !== void 0 && f != null && l(t, ["parameters", "autoTruncate"], f);
  } else if (c === "EMBED_CONTENT") {
    const f = i(e, ["autoTruncate"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "autoTruncate"], f);
  }
  let d = i(n, ["embeddingApiType"]);
  if (d === void 0 && (d = "PREDICT"), d === "EMBED_CONTENT") {
    const f = i(e, ["documentOcr"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "documentOcr"], f);
  }
  let h = i(n, ["embeddingApiType"]);
  if (h === void 0 && (h = "PREDICT"), h === "EMBED_CONTENT") {
    const f = i(e, ["audioTrackExtraction"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "audioTrackExtraction"], f);
  }
  return r;
}
function AS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let d = ca(e, s);
    Array.isArray(d) && (d = d.map((h) => h)), l(r, ["requests[]", "content"], d);
  }
  const a = i(t, ["content"]);
  a != null && Lr(fe(a));
  const u = i(t, ["config"]);
  u != null && _S(u, r);
  const c = i(t, ["model"]);
  return c !== void 0 && l(r, ["requests[]", "model"], Y(e, c)), r;
}
function SS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  let s = i(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "PREDICT") {
    const c = i(t, ["contents"]);
    if (c != null) {
      let d = ca(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(r, ["instances[]", "content"], d);
    }
  }
  let a = i(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = i(t, ["content"]);
    c != null && l(r, ["content"], xn(fe(c)));
  }
  const u = i(t, ["config"]);
  return u != null && vS(u, r, n), r;
}
function TS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["embeddings"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => u)), l(n, ["embeddings"], a);
  }
  const s = i(e, ["metadata"]);
  return s != null && l(n, ["metadata"], s), n;
}
function ES(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions[]", "embeddings"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => nS(u))), l(n, ["embeddings"], a);
  }
  const s = i(e, ["metadata"]);
  if (s != null && l(n, ["metadata"], s), t && i(t, ["embeddingApiType"]) === "EMBED_CONTENT") {
    const a = i(e, ["embedding"]), u = i(e, ["usageMetadata"]), c = i(e, ["truncated"]);
    if (a) {
      const d = {};
      u && u.promptTokenCount && (d.tokenCount = u.promptTokenCount), c && (d.truncated = c), a.statistics = d, l(n, ["embeddings"], [a]);
    }
  }
  return n;
}
function wS(e, t) {
  const n = {}, r = i(e, ["endpoint"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["deployedModelId"]);
  return o != null && l(n, ["deployedModelId"], o), n;
}
function CS(e, t) {
  const n = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["fileUri"]);
  r != null && l(n, ["fileUri"], r);
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function IS(e, t) {
  const n = {}, r = i(e, ["id"]);
  r != null && l(n, ["id"], r);
  const o = i(e, ["args"]);
  o != null && l(n, ["args"], o);
  const s = i(e, ["name"]);
  if (s != null && l(n, ["name"], s), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function bS(e, t) {
  const n = {}, r = i(e, ["allowedFunctionNames"]);
  r != null && l(n, ["allowedFunctionNames"], r);
  const o = i(e, ["mode"]);
  if (o != null && l(n, ["mode"], o), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function PS(e, t) {
  const n = {}, r = i(e, ["description"]);
  r != null && l(n, ["description"], r);
  const o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["parameters"]);
  s != null && l(n, ["parameters"], s);
  const a = i(e, ["parametersJsonSchema"]);
  a != null && l(n, ["parametersJsonSchema"], a);
  const u = i(e, ["response"]);
  u != null && l(n, ["response"], u);
  const c = i(e, ["responseJsonSchema"]);
  if (c != null && l(n, ["responseJsonSchema"], c), i(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return n;
}
function RS(e, t, n, r) {
  const o = {}, s = i(t, ["systemInstruction"]);
  n !== void 0 && s != null && l(n, ["systemInstruction"], Lr(fe(s)));
  const a = i(t, ["temperature"]);
  a != null && l(o, ["temperature"], a);
  const u = i(t, ["topP"]);
  u != null && l(o, ["topP"], u);
  const c = i(t, ["topK"]);
  c != null && l(o, ["topK"], c);
  const d = i(t, ["candidateCount"]);
  d != null && l(o, ["candidateCount"], d);
  const h = i(t, ["maxOutputTokens"]);
  h != null && l(o, ["maxOutputTokens"], h);
  const f = i(t, ["stopSequences"]);
  f != null && l(o, ["stopSequences"], f);
  const p = i(t, ["responseLogprobs"]);
  p != null && l(o, ["responseLogprobs"], p);
  const m = i(t, ["logprobs"]);
  m != null && l(o, ["logprobs"], m);
  const y = i(t, ["presencePenalty"]);
  y != null && l(o, ["presencePenalty"], y);
  const _ = i(t, ["frequencyPenalty"]);
  _ != null && l(o, ["frequencyPenalty"], _);
  const v = i(t, ["seed"]);
  v != null && l(o, ["seed"], v);
  const w = i(t, ["responseMimeType"]);
  w != null && l(o, ["responseMimeType"], w);
  const b = i(t, ["responseSchema"]);
  b != null && l(o, ["responseSchema"], da(b));
  const P = i(t, ["responseJsonSchema"]);
  if (P != null && l(o, ["responseJsonSchema"], P), i(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (i(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const x = i(t, ["safetySettings"]);
  if (n !== void 0 && x != null) {
    let X = x;
    Array.isArray(X) && (X = X.map((he) => AT(he))), l(n, ["safetySettings"], X);
  }
  const $ = i(t, ["tools"]);
  if (n !== void 0 && $ != null) {
    let X = Pn($);
    Array.isArray(X) && (X = X.map((he) => PT(bn(he)))), l(n, ["tools"], X);
  }
  const S = i(t, ["toolConfig"]);
  if (n !== void 0 && S != null && l(n, ["toolConfig"], IT(S)), i(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const O = i(t, ["cachedContent"]);
  n !== void 0 && O != null && l(n, ["cachedContent"], Tt(e, O));
  const R = i(t, ["responseModalities"]);
  R != null && l(o, ["responseModalities"], R);
  const k = i(t, ["mediaResolution"]);
  k != null && l(o, ["mediaResolution"], k);
  const H = i(t, ["speechConfig"]);
  if (H != null && l(o, ["speechConfig"], fa(H)), i(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const z = i(t, ["thinkingConfig"]);
  z != null && l(o, ["thinkingConfig"], z);
  const se = i(t, ["imageConfig"]);
  se != null && l(o, ["imageConfig"], nT(se));
  const j = i(t, ["enableEnhancedCivicAnswers"]);
  if (j != null && l(o, ["enableEnhancedCivicAnswers"], j), i(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const Q = i(t, ["serviceTier"]);
  return n !== void 0 && Q != null && l(n, ["serviceTier"], Q), o;
}
function xS(e, t, n, r) {
  const o = {}, s = i(t, ["systemInstruction"]);
  n !== void 0 && s != null && l(n, ["systemInstruction"], xn(fe(s)));
  const a = i(t, ["temperature"]);
  a != null && l(o, ["temperature"], a);
  const u = i(t, ["topP"]);
  u != null && l(o, ["topP"], u);
  const c = i(t, ["topK"]);
  c != null && l(o, ["topK"], c);
  const d = i(t, ["candidateCount"]);
  d != null && l(o, ["candidateCount"], d);
  const h = i(t, ["maxOutputTokens"]);
  h != null && l(o, ["maxOutputTokens"], h);
  const f = i(t, ["stopSequences"]);
  f != null && l(o, ["stopSequences"], f);
  const p = i(t, ["responseLogprobs"]);
  p != null && l(o, ["responseLogprobs"], p);
  const m = i(t, ["logprobs"]);
  m != null && l(o, ["logprobs"], m);
  const y = i(t, ["presencePenalty"]);
  y != null && l(o, ["presencePenalty"], y);
  const _ = i(t, ["frequencyPenalty"]);
  _ != null && l(o, ["frequencyPenalty"], _);
  const v = i(t, ["seed"]);
  v != null && l(o, ["seed"], v);
  const w = i(t, ["responseMimeType"]);
  w != null && l(o, ["responseMimeType"], w);
  const b = i(t, ["responseSchema"]);
  b != null && l(o, ["responseSchema"], da(b));
  const P = i(t, ["responseJsonSchema"]);
  P != null && l(o, ["responseJsonSchema"], P);
  const x = i(t, ["routingConfig"]);
  x != null && l(o, ["routingConfig"], x);
  const $ = i(t, ["modelSelectionConfig"]);
  $ != null && l(o, ["modelConfig"], $);
  const S = i(t, ["safetySettings"]);
  if (n !== void 0 && S != null) {
    let _e = S;
    Array.isArray(_e) && (_e = _e.map((Qt) => Qt)), l(n, ["safetySettings"], _e);
  }
  const O = i(t, ["tools"]);
  if (n !== void 0 && O != null) {
    let _e = Pn(O);
    Array.isArray(_e) && (_e = _e.map((Qt) => yh(bn(Qt)))), l(n, ["tools"], _e);
  }
  const R = i(t, ["toolConfig"]);
  n !== void 0 && R != null && l(n, ["toolConfig"], bT(R));
  const k = i(t, ["labels"]);
  n !== void 0 && k != null && l(n, ["labels"], k);
  const H = i(t, ["cachedContent"]);
  n !== void 0 && H != null && l(n, ["cachedContent"], Tt(e, H));
  const z = i(t, ["responseModalities"]);
  z != null && l(o, ["responseModalities"], z);
  const se = i(t, ["mediaResolution"]);
  se != null && l(o, ["mediaResolution"], se);
  const j = i(t, ["speechConfig"]);
  j != null && l(o, ["speechConfig"], fa(j));
  const Q = i(t, ["audioTimestamp"]);
  Q != null && l(o, ["audioTimestamp"], Q);
  const X = i(t, ["thinkingConfig"]);
  X != null && l(o, ["thinkingConfig"], X);
  const he = i(t, ["imageConfig"]);
  if (he != null && l(o, ["imageConfig"], rT(he)), i(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const qe = i(t, ["modelArmorConfig"]);
  n !== void 0 && qe != null && l(n, ["modelArmorConfig"], qe);
  const ot = i(t, ["serviceTier"]);
  return n !== void 0 && ot != null && l(n, ["serviceTier"], ot), o;
}
function Ic(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let u = Ie(s);
    Array.isArray(u) && (u = u.map((c) => Lr(c))), l(r, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && l(r, ["generationConfig"], RS(e, a, r)), r;
}
function bc(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let u = Ie(s);
    Array.isArray(u) && (u = u.map((c) => xn(c))), l(r, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && l(r, ["generationConfig"], xS(e, a, r)), r;
}
function Pc(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["candidates"]);
  if (o != null) {
    let h = o;
    Array.isArray(h) && (h = h.map((f) => ZA(f))), l(n, ["candidates"], h);
  }
  const s = i(e, ["modelVersion"]);
  s != null && l(n, ["modelVersion"], s);
  const a = i(e, ["promptFeedback"]);
  a != null && l(n, ["promptFeedback"], a);
  const u = i(e, ["responseId"]);
  u != null && l(n, ["responseId"], u);
  const c = i(e, ["usageMetadata"]);
  c != null && l(n, ["usageMetadata"], c);
  const d = i(e, ["modelStatus"]);
  return d != null && l(n, ["modelStatus"], d), n;
}
function Rc(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["candidates"]);
  if (o != null) {
    let h = o;
    Array.isArray(h) && (h = h.map((f) => f)), l(n, ["candidates"], h);
  }
  const s = i(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const a = i(e, ["modelVersion"]);
  a != null && l(n, ["modelVersion"], a);
  const u = i(e, ["promptFeedback"]);
  u != null && l(n, ["promptFeedback"], u);
  const c = i(e, ["responseId"]);
  c != null && l(n, ["responseId"], c);
  const d = i(e, ["usageMetadata"]);
  return d != null && l(n, ["usageMetadata"], d), n;
}
function MS(e, t, n) {
  const r = {};
  if (i(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (i(e, ["negativePrompt"]) !== void 0) throw new Error("negativePrompt parameter is not supported in Gemini API.");
  const o = i(e, ["numberOfImages"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
  const s = i(e, ["aspectRatio"]);
  t !== void 0 && s != null && l(t, ["parameters", "aspectRatio"], s);
  const a = i(e, ["guidanceScale"]);
  if (t !== void 0 && a != null && l(t, ["parameters", "guidanceScale"], a), i(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const u = i(e, ["safetyFilterLevel"]);
  t !== void 0 && u != null && l(t, ["parameters", "safetySetting"], u);
  const c = i(e, ["personGeneration"]);
  t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c);
  const d = i(e, ["includeSafetyAttributes"]);
  t !== void 0 && d != null && l(t, ["parameters", "includeSafetyAttributes"], d);
  const h = i(e, ["includeRaiReason"]);
  t !== void 0 && h != null && l(t, ["parameters", "includeRaiReason"], h);
  const f = i(e, ["language"]);
  t !== void 0 && f != null && l(t, ["parameters", "language"], f);
  const p = i(e, ["outputMimeType"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], p);
  const m = i(e, ["outputCompressionQuality"]);
  if (t !== void 0 && m != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], m), i(e, ["addWatermark"]) !== void 0) throw new Error("addWatermark parameter is not supported in Gemini API.");
  if (i(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const y = i(e, ["imageSize"]);
  if (t !== void 0 && y != null && l(t, ["parameters", "sampleImageSize"], y), i(e, ["enhancePrompt"]) !== void 0) throw new Error("enhancePrompt parameter is not supported in Gemini API.");
  return r;
}
function NS(e, t, n) {
  const r = {}, o = i(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
  const s = i(e, ["negativePrompt"]);
  t !== void 0 && s != null && l(t, ["parameters", "negativePrompt"], s);
  const a = i(e, ["numberOfImages"]);
  t !== void 0 && a != null && l(t, ["parameters", "sampleCount"], a);
  const u = i(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = i(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = i(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const h = i(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && l(t, ["parameters", "safetySetting"], h);
  const f = i(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = i(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = i(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const y = i(e, ["language"]);
  t !== void 0 && y != null && l(t, ["parameters", "language"], y);
  const _ = i(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const v = i(e, ["outputCompressionQuality"]);
  t !== void 0 && v != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], v);
  const w = i(e, ["addWatermark"]);
  t !== void 0 && w != null && l(t, ["parameters", "addWatermark"], w);
  const b = i(e, ["labels"]);
  t !== void 0 && b != null && l(t, ["labels"], b);
  const P = i(e, ["imageSize"]);
  t !== void 0 && P != null && l(t, ["parameters", "sampleImageSize"], P);
  const x = i(e, ["enhancePrompt"]);
  return t !== void 0 && x != null && l(t, ["parameters", "enhancePrompt"], x), r;
}
function kS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["config"]);
  return a != null && MS(a, r), r;
}
function DS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["config"]);
  return a != null && NS(a, r), r;
}
function $S(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => WS(u))), l(n, ["generatedImages"], a);
  }
  const s = i(e, ["positivePromptSafetyAttributes"]);
  return s != null && l(n, ["positivePromptSafetyAttributes"], mh(s)), n;
}
function LS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => as(u))), l(n, ["generatedImages"], a);
  }
  const s = i(e, ["positivePromptSafetyAttributes"]);
  return s != null && l(n, ["positivePromptSafetyAttributes"], gh(s)), n;
}
function US(e, t, n) {
  const r = {}, o = i(e, ["numberOfVideos"]);
  if (t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o), i(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (i(e, ["fps"]) !== void 0) throw new Error("fps parameter is not supported in Gemini API.");
  const s = i(e, ["durationSeconds"]);
  if (t !== void 0 && s != null && l(t, ["parameters", "durationSeconds"], s), i(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const a = i(e, ["aspectRatio"]);
  t !== void 0 && a != null && l(t, ["parameters", "aspectRatio"], a);
  const u = i(e, ["resolution"]);
  t !== void 0 && u != null && l(t, ["parameters", "resolution"], u);
  const c = i(e, ["personGeneration"]);
  if (t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c), i(e, ["pubsubTopic"]) !== void 0) throw new Error("pubsubTopic parameter is not supported in Gemini API.");
  const d = i(e, ["negativePrompt"]);
  t !== void 0 && d != null && l(t, ["parameters", "negativePrompt"], d);
  const h = i(e, ["enhancePrompt"]);
  if (t !== void 0 && h != null && l(t, ["parameters", "enhancePrompt"], h), i(e, ["generateAudio"]) !== void 0) throw new Error("generateAudio parameter is not supported in Gemini API.");
  const f = i(e, ["lastFrame"]);
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], ls(f));
  const p = i(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let y = p;
    Array.isArray(y) && (y = y.map((_) => BT(_))), l(t, ["instances[0]", "referenceImages"], y);
  }
  if (i(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (i(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (i(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = i(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), r;
}
function FS(e, t, n) {
  const r = {}, o = i(e, ["numberOfVideos"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
  const s = i(e, ["outputGcsUri"]);
  t !== void 0 && s != null && l(t, ["parameters", "storageUri"], s);
  const a = i(e, ["fps"]);
  t !== void 0 && a != null && l(t, ["parameters", "fps"], a);
  const u = i(e, ["durationSeconds"]);
  t !== void 0 && u != null && l(t, ["parameters", "durationSeconds"], u);
  const c = i(e, ["seed"]);
  t !== void 0 && c != null && l(t, ["parameters", "seed"], c);
  const d = i(e, ["aspectRatio"]);
  t !== void 0 && d != null && l(t, ["parameters", "aspectRatio"], d);
  const h = i(e, ["resolution"]);
  t !== void 0 && h != null && l(t, ["parameters", "resolution"], h);
  const f = i(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = i(e, ["pubsubTopic"]);
  t !== void 0 && p != null && l(t, ["parameters", "pubsubTopic"], p);
  const m = i(e, ["negativePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "negativePrompt"], m);
  const y = i(e, ["enhancePrompt"]);
  t !== void 0 && y != null && l(t, ["parameters", "enhancePrompt"], y);
  const _ = i(e, ["generateAudio"]);
  t !== void 0 && _ != null && l(t, ["parameters", "generateAudio"], _);
  const v = i(e, ["lastFrame"]);
  t !== void 0 && v != null && l(t, ["instances[0]", "lastFrame"], rt(v));
  const w = i(e, ["referenceImages"]);
  if (t !== void 0 && w != null) {
    let $ = w;
    Array.isArray($) && ($ = $.map((S) => GT(S))), l(t, ["instances[0]", "referenceImages"], $);
  }
  const b = i(e, ["mask"]);
  t !== void 0 && b != null && l(t, ["instances[0]", "mask"], qT(b));
  const P = i(e, ["compressionQuality"]);
  t !== void 0 && P != null && l(t, ["parameters", "compressionQuality"], P);
  const x = i(e, ["labels"]);
  if (t !== void 0 && x != null && l(t, ["labels"], x), i(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return r;
}
function OS(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const s = i(e, ["done"]);
  s != null && l(n, ["done"], s);
  const a = i(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = i(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], HS(u)), n;
}
function qS(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const s = i(e, ["done"]);
  s != null && l(n, ["done"], s);
  const a = i(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = i(e, ["response"]);
  return u != null && l(n, ["response"], VS(u)), n;
}
function BS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], ls(a));
  const u = i(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], _h(u));
  const c = i(t, ["source"]);
  c != null && JS(c, r);
  const d = i(t, ["config"]);
  return d != null && US(d, r), r;
}
function GS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], rt(a));
  const u = i(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], vh(u));
  const c = i(t, ["source"]);
  c != null && KS(c, r);
  const d = i(t, ["config"]);
  return d != null && FS(d, r), r;
}
function HS(e, t) {
  const n = {}, r = i(e, ["generatedSamples"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => YS(u))), l(n, ["generatedVideos"], a);
  }
  const o = i(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const s = i(e, ["raiMediaFilteredReasons"]);
  return s != null && l(n, ["raiMediaFilteredReasons"], s), n;
}
function VS(e, t) {
  const n = {}, r = i(e, ["videos"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => XS(u))), l(n, ["generatedVideos"], a);
  }
  const o = i(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const s = i(e, ["raiMediaFilteredReasons"]);
  return s != null && l(n, ["raiMediaFilteredReasons"], s), n;
}
function JS(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["image"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "image"], ls(s));
  const a = i(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], _h(a)), r;
}
function KS(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["image"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "image"], rt(s));
  const a = i(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], vh(a)), r;
}
function WS(e, t) {
  const n = {}, r = i(e, ["_self"]);
  r != null && l(n, ["image"], oT(r));
  const o = i(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const s = i(e, ["_self"]);
  return s != null && l(n, ["safetyAttributes"], mh(s)), n;
}
function as(e, t) {
  const n = {}, r = i(e, ["_self"]);
  r != null && l(n, ["image"], ph(r));
  const o = i(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const s = i(e, ["_self"]);
  s != null && l(n, ["safetyAttributes"], gh(s));
  const a = i(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function zS(e, t) {
  const n = {}, r = i(e, ["_self"]);
  r != null && l(n, ["mask"], ph(r));
  const o = i(e, ["labels"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(n, ["labels"], s);
  }
  return n;
}
function YS(e, t) {
  const n = {}, r = i(e, ["video"]);
  return r != null && l(n, ["video"], FT(r)), n;
}
function XS(e, t) {
  const n = {}, r = i(e, ["_self"]);
  return r != null && l(n, ["video"], OT(r)), n;
}
function QS(e, t) {
  const n = {}, r = i(e, ["modelSelectionConfig"]);
  r != null && l(n, ["modelConfig"], r);
  const o = i(e, ["responseJsonSchema"]);
  o != null && l(n, ["responseJsonSchema"], o);
  const s = i(e, ["audioTimestamp"]);
  s != null && l(n, ["audioTimestamp"], s);
  const a = i(e, ["candidateCount"]);
  a != null && l(n, ["candidateCount"], a);
  const u = i(e, ["enableAffectiveDialog"]);
  u != null && l(n, ["enableAffectiveDialog"], u);
  const c = i(e, ["frequencyPenalty"]);
  c != null && l(n, ["frequencyPenalty"], c);
  const d = i(e, ["logprobs"]);
  d != null && l(n, ["logprobs"], d);
  const h = i(e, ["maxOutputTokens"]);
  h != null && l(n, ["maxOutputTokens"], h);
  const f = i(e, ["mediaResolution"]);
  f != null && l(n, ["mediaResolution"], f);
  const p = i(e, ["presencePenalty"]);
  p != null && l(n, ["presencePenalty"], p);
  const m = i(e, ["responseLogprobs"]);
  m != null && l(n, ["responseLogprobs"], m);
  const y = i(e, ["responseMimeType"]);
  y != null && l(n, ["responseMimeType"], y);
  const _ = i(e, ["responseModalities"]);
  _ != null && l(n, ["responseModalities"], _);
  const v = i(e, ["responseSchema"]);
  v != null && l(n, ["responseSchema"], v);
  const w = i(e, ["routingConfig"]);
  w != null && l(n, ["routingConfig"], w);
  const b = i(e, ["seed"]);
  b != null && l(n, ["seed"], b);
  const P = i(e, ["speechConfig"]);
  P != null && l(n, ["speechConfig"], P);
  const x = i(e, ["stopSequences"]);
  x != null && l(n, ["stopSequences"], x);
  const $ = i(e, ["temperature"]);
  $ != null && l(n, ["temperature"], $);
  const S = i(e, ["thinkingConfig"]);
  S != null && l(n, ["thinkingConfig"], S);
  const O = i(e, ["topK"]);
  O != null && l(n, ["topK"], O);
  const R = i(e, ["topP"]);
  if (R != null && l(n, ["topP"], R), i(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function ZS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function jS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function eT(e, t) {
  const n = {}, r = i(e, ["authConfig"]);
  r != null && l(n, ["authConfig"], XA(r));
  const o = i(e, ["enableWidget"]);
  return o != null && l(n, ["enableWidget"], o), n;
}
function tT(e, t) {
  const n = {}, r = i(e, ["searchTypes"]);
  if (r != null && l(n, ["searchTypes"], r), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = i(e, ["timeRangeFilter"]);
  return o != null && l(n, ["timeRangeFilter"], o), n;
}
function nT(e, t) {
  const n = {}, r = i(e, ["aspectRatio"]);
  r != null && l(n, ["aspectRatio"], r);
  const o = i(e, ["imageSize"]);
  if (o != null && l(n, ["imageSize"], o), i(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (i(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (i(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (i(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (i(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return n;
}
function rT(e, t) {
  const n = {}, r = i(e, ["aspectRatio"]);
  r != null && l(n, ["aspectRatio"], r);
  const o = i(e, ["imageSize"]);
  o != null && l(n, ["imageSize"], o);
  const s = i(e, ["personGeneration"]);
  s != null && l(n, ["personGeneration"], s);
  const a = i(e, ["prominentPeople"]);
  a != null && l(n, ["prominentPeople"], a);
  const u = i(e, ["outputMimeType"]);
  u != null && l(n, ["imageOutputOptions", "mimeType"], u);
  const c = i(e, ["outputCompressionQuality"]);
  c != null && l(n, ["imageOutputOptions", "compressionQuality"], c);
  const d = i(e, ["imageOutputOptions"]);
  return d != null && l(n, ["imageOutputOptions"], d), n;
}
function oT(e, t) {
  const n = {}, r = i(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], Dt(r));
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function ph(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = i(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], Dt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function ls(e, t) {
  const n = {};
  if (i(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const r = i(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], Dt(r));
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function rt(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = i(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Dt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function sT(e, t, n, r) {
  const o = {}, s = i(t, ["pageSize"]);
  n !== void 0 && s != null && l(n, ["_query", "pageSize"], s);
  const a = i(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = i(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = i(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], sh(e, c)), o;
}
function iT(e, t, n, r) {
  const o = {}, s = i(t, ["pageSize"]);
  n !== void 0 && s != null && l(n, ["_query", "pageSize"], s);
  const a = i(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = i(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = i(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], sh(e, c)), o;
}
function aT(e, t, n) {
  const r = {}, o = i(t, ["config"]);
  return o != null && sT(e, o, r), r;
}
function lT(e, t, n) {
  const r = {}, o = i(t, ["config"]);
  return o != null && iT(e, o, r), r;
}
function uT(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["_self"]);
  if (s != null) {
    let a = ih(s);
    Array.isArray(a) && (a = a.map((u) => vi(u))), l(n, ["models"], a);
  }
  return n;
}
function cT(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["_self"]);
  if (s != null) {
    let a = ih(s);
    Array.isArray(a) && (a = a.map((u) => Ai(u))), l(n, ["models"], a);
  }
  return n;
}
function dT(e, t) {
  const n = {}, r = i(e, ["maskMode"]);
  r != null && l(n, ["maskMode"], r);
  const o = i(e, ["segmentationClasses"]);
  o != null && l(n, ["maskClasses"], o);
  const s = i(e, ["maskDilation"]);
  return s != null && l(n, ["dilation"], s), n;
}
function vi(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const s = i(e, ["description"]);
  s != null && l(n, ["description"], s);
  const a = i(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = i(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], RT(u));
  const c = i(e, ["inputTokenLimit"]);
  c != null && l(n, ["inputTokenLimit"], c);
  const d = i(e, ["outputTokenLimit"]);
  d != null && l(n, ["outputTokenLimit"], d);
  const h = i(e, ["supportedGenerationMethods"]);
  h != null && l(n, ["supportedActions"], h);
  const f = i(e, ["temperature"]);
  f != null && l(n, ["temperature"], f);
  const p = i(e, ["maxTemperature"]);
  p != null && l(n, ["maxTemperature"], p);
  const m = i(e, ["topP"]);
  m != null && l(n, ["topP"], m);
  const y = i(e, ["topK"]);
  y != null && l(n, ["topK"], y);
  const _ = i(e, ["thinking"]);
  return _ != null && l(n, ["thinking"], _), n;
}
function Ai(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const s = i(e, ["description"]);
  s != null && l(n, ["description"], s);
  const a = i(e, ["versionId"]);
  a != null && l(n, ["version"], a);
  const u = i(e, ["deployedModels"]);
  if (u != null) {
    let p = u;
    Array.isArray(p) && (p = p.map((m) => wS(m))), l(n, ["endpoints"], p);
  }
  const c = i(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = i(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], xT(d));
  const h = i(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = i(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function fT(e, t) {
  const n = {}, r = i(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = i(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const s = i(e, ["executableCode"]);
  s != null && l(n, ["executableCode"], s);
  const a = i(e, ["fileData"]);
  a != null && l(n, ["fileData"], CS(a));
  const u = i(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], IS(u));
  const c = i(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = i(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], QA(d));
  const h = i(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = i(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = i(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = i(e, ["videoMetadata"]);
  m != null && l(n, ["videoMetadata"], m);
  const y = i(e, ["toolCall"]);
  y != null && l(n, ["toolCall"], y);
  const _ = i(e, ["toolResponse"]);
  _ != null && l(n, ["toolResponse"], _);
  const v = i(e, ["partMetadata"]);
  return v != null && l(n, ["partMetadata"], v), n;
}
function hT(e, t) {
  const n = {}, r = i(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = i(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const s = i(e, ["executableCode"]);
  s != null && l(n, ["executableCode"], s);
  const a = i(e, ["fileData"]);
  a != null && l(n, ["fileData"], a);
  const u = i(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], u);
  const c = i(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = i(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], d);
  const h = i(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = i(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = i(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = i(e, ["videoMetadata"]);
  if (m != null && l(n, ["videoMetadata"], m), i(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (i(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (i(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return n;
}
function pT(e, t) {
  const n = {}, r = i(e, ["productImage"]);
  return r != null && l(n, ["image"], rt(r)), n;
}
function mT(e, t, n) {
  const r = {}, o = i(e, ["numberOfImages"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
  const s = i(e, ["baseSteps"]);
  t !== void 0 && s != null && l(t, ["parameters", "baseSteps"], s);
  const a = i(e, ["outputGcsUri"]);
  t !== void 0 && a != null && l(t, ["parameters", "storageUri"], a);
  const u = i(e, ["seed"]);
  t !== void 0 && u != null && l(t, ["parameters", "seed"], u);
  const c = i(e, ["safetyFilterLevel"]);
  t !== void 0 && c != null && l(t, ["parameters", "safetySetting"], c);
  const d = i(e, ["personGeneration"]);
  t !== void 0 && d != null && l(t, ["parameters", "personGeneration"], d);
  const h = i(e, ["addWatermark"]);
  t !== void 0 && h != null && l(t, ["parameters", "addWatermark"], h);
  const f = i(e, ["outputMimeType"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], f);
  const p = i(e, ["outputCompressionQuality"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], p);
  const m = i(e, ["enhancePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "enhancePrompt"], m);
  const y = i(e, ["labels"]);
  return t !== void 0 && y != null && l(t, ["labels"], y), r;
}
function gT(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["source"]);
  s != null && _T(s, r);
  const a = i(t, ["config"]);
  return a != null && mT(a, r), r;
}
function yT(e, t) {
  const n = {}, r = i(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => as(s))), l(n, ["generatedImages"], o);
  }
  return n;
}
function _T(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["personImage"]);
  t !== void 0 && s != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], rt(s));
  const a = i(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => pT(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return r;
}
function vT(e, t) {
  const n = {}, r = i(e, ["referenceImage"]);
  r != null && l(n, ["referenceImage"], rt(r));
  const o = i(e, ["referenceId"]);
  o != null && l(n, ["referenceId"], o);
  const s = i(e, ["referenceType"]);
  s != null && l(n, ["referenceType"], s);
  const a = i(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], dT(a));
  const u = i(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], oS(u));
  const c = i(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = i(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function mh(e, t) {
  const n = {}, r = i(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = i(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const s = i(e, ["contentType"]);
  return s != null && l(n, ["contentType"], s), n;
}
function gh(e, t) {
  const n = {}, r = i(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = i(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const s = i(e, ["contentType"]);
  return s != null && l(n, ["contentType"], s), n;
}
function AT(e, t) {
  const n = {}, r = i(e, ["category"]);
  if (r != null && l(n, ["category"], r), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = i(e, ["threshold"]);
  return o != null && l(n, ["threshold"], o), n;
}
function ST(e, t) {
  const n = {}, r = i(e, ["image"]);
  return r != null && l(n, ["image"], rt(r)), n;
}
function TT(e, t, n) {
  const r = {}, o = i(e, ["mode"]);
  t !== void 0 && o != null && l(t, ["parameters", "mode"], o);
  const s = i(e, ["maxPredictions"]);
  t !== void 0 && s != null && l(t, ["parameters", "maxPredictions"], s);
  const a = i(e, ["confidenceThreshold"]);
  t !== void 0 && a != null && l(t, ["parameters", "confidenceThreshold"], a);
  const u = i(e, ["maskDilation"]);
  t !== void 0 && u != null && l(t, ["parameters", "maskDilation"], u);
  const c = i(e, ["binaryColorThreshold"]);
  t !== void 0 && c != null && l(t, ["parameters", "binaryColorThreshold"], c);
  const d = i(e, ["labels"]);
  return t !== void 0 && d != null && l(t, ["labels"], d), r;
}
function ET(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["source"]);
  s != null && CT(s, r);
  const a = i(t, ["config"]);
  return a != null && TT(a, r), r;
}
function wT(e, t) {
  const n = {}, r = i(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => zS(s))), l(n, ["generatedMasks"], o);
  }
  return n;
}
function CT(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["image"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "image"], rt(s));
  const a = i(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], ST(a)), r;
}
function IT(e, t) {
  const n = {}, r = i(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = i(e, ["functionCallingConfig"]);
  o != null && l(n, ["functionCallingConfig"], bS(o));
  const s = i(e, ["includeServerSideToolInvocations"]);
  return s != null && l(n, ["includeServerSideToolInvocations"], s), n;
}
function bT(e, t) {
  const n = {}, r = i(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = i(e, ["functionCallingConfig"]);
  if (o != null && l(n, ["functionCallingConfig"], o), i(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function PT(e, t) {
  const n = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const r = i(e, ["computerUse"]);
  r != null && l(n, ["computerUse"], r);
  const o = i(e, ["fileSearch"]);
  o != null && l(n, ["fileSearch"], o);
  const s = i(e, ["googleSearch"]);
  s != null && l(n, ["googleSearch"], tT(s));
  const a = i(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], eT(a));
  const u = i(e, ["codeExecution"]);
  if (u != null && l(n, ["codeExecution"], u), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = i(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["functionDeclarations"], p);
  }
  const d = i(e, ["googleSearchRetrieval"]);
  if (d != null && l(n, ["googleSearchRetrieval"], d), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const h = i(e, ["urlContext"]);
  h != null && l(n, ["urlContext"], h);
  const f = i(e, ["mcpServers"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["mcpServers"], p);
  }
  return n;
}
function yh(e, t) {
  const n = {}, r = i(e, ["retrieval"]);
  r != null && l(n, ["retrieval"], r);
  const o = i(e, ["computerUse"]);
  if (o != null && l(n, ["computerUse"], o), i(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const s = i(e, ["googleSearch"]);
  s != null && l(n, ["googleSearch"], s);
  const a = i(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], a);
  const u = i(e, ["codeExecution"]);
  u != null && l(n, ["codeExecution"], u);
  const c = i(e, ["enterpriseWebSearch"]);
  c != null && l(n, ["enterpriseWebSearch"], c);
  const d = i(e, ["functionDeclarations"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((y) => PS(y))), l(n, ["functionDeclarations"], m);
  }
  const h = i(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = i(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = i(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function RT(e, t) {
  const n = {}, r = i(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const s = i(e, ["updateTime"]);
  return s != null && l(n, ["updateTime"], s), n;
}
function xT(e, t) {
  const n = {}, r = i(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const s = i(e, ["updateTime"]);
  return s != null && l(n, ["updateTime"], s), n;
}
function MT(e, t, n) {
  const r = {}, o = i(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = i(e, ["description"]);
  t !== void 0 && s != null && l(t, ["description"], s);
  const a = i(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function NT(e, t, n) {
  const r = {}, o = i(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = i(e, ["description"]);
  t !== void 0 && s != null && l(t, ["description"], s);
  const a = i(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function kT(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "name"], Y(e, o));
  const s = i(t, ["config"]);
  return s != null && MT(s, r), r;
}
function DT(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["config"]);
  return s != null && NT(s, r), r;
}
function $T(e, t, n) {
  const r = {}, o = i(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
  const s = i(e, ["safetyFilterLevel"]);
  t !== void 0 && s != null && l(t, ["parameters", "safetySetting"], s);
  const a = i(e, ["personGeneration"]);
  t !== void 0 && a != null && l(t, ["parameters", "personGeneration"], a);
  const u = i(e, ["includeRaiReason"]);
  t !== void 0 && u != null && l(t, ["parameters", "includeRaiReason"], u);
  const c = i(e, ["outputMimeType"]);
  t !== void 0 && c != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], c);
  const d = i(e, ["outputCompressionQuality"]);
  t !== void 0 && d != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], d);
  const h = i(e, ["enhanceInputImage"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "upscaleConfig",
    "enhanceInputImage"
  ], h);
  const f = i(e, ["imagePreservationFactor"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "upscaleConfig",
    "imagePreservationFactor"
  ], f);
  const p = i(e, ["labels"]);
  t !== void 0 && p != null && l(t, ["labels"], p);
  const m = i(e, ["numberOfImages"]);
  t !== void 0 && m != null && l(t, ["parameters", "sampleCount"], m);
  const y = i(e, ["mode"]);
  return t !== void 0 && y != null && l(t, ["parameters", "mode"], y), r;
}
function LT(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["image"]);
  s != null && l(r, ["instances[0]", "image"], rt(s));
  const a = i(t, ["upscaleFactor"]);
  a != null && l(r, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = i(t, ["config"]);
  return u != null && $T(u, r), r;
}
function UT(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => as(a))), l(n, ["generatedImages"], s);
  }
  return n;
}
function FT(e, t) {
  const n = {}, r = i(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = i(e, ["encodedVideo"]);
  o != null && l(n, ["videoBytes"], Dt(o));
  const s = i(e, ["encoding"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function OT(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["uri"], r);
  const o = i(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["videoBytes"], Dt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function qT(e, t) {
  const n = {}, r = i(e, ["image"]);
  r != null && l(n, ["_self"], rt(r));
  const o = i(e, ["maskMode"]);
  return o != null && l(n, ["maskMode"], o), n;
}
function BT(e, t) {
  const n = {}, r = i(e, ["image"]);
  r != null && l(n, ["image"], ls(r));
  const o = i(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function GT(e, t) {
  const n = {}, r = i(e, ["image"]);
  r != null && l(n, ["image"], rt(r));
  const o = i(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function _h(e, t) {
  const n = {}, r = i(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = i(e, ["videoBytes"]);
  o != null && l(n, ["encodedVideo"], Dt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["encoding"], s), n;
}
function vh(e, t) {
  const n = {}, r = i(e, ["uri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = i(e, ["videoBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Dt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function HT(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["displayName"], r), n;
}
function VT(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && HT(n, t), t;
}
function JT(e, t) {
  const n = {}, r = i(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function KT(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = i(e, ["config"]);
  return r != null && JT(r, t), t;
}
function WT(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function zT(e, t) {
  const n = {}, r = i(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => a)), l(t, ["customMetadata"], s);
  }
  const o = i(e, ["chunkingConfig"]);
  return t !== void 0 && o != null && l(t, ["chunkingConfig"], o), n;
}
function YT(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], QT(a)), t;
}
function XT(e) {
  const t = {}, n = i(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = i(e, ["fileName"]);
  r != null && l(t, ["fileName"], r);
  const o = i(e, ["config"]);
  return o != null && zT(o, t), t;
}
function QT(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = i(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function ZT(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function jT(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && ZT(n, t), t;
}
function eE(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = i(e, ["fileSearchStores"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(t, ["fileSearchStores"], s);
  }
  return t;
}
function Ah(e, t) {
  const n = {}, r = i(e, ["mimeType"]);
  t !== void 0 && r != null && l(t, ["mimeType"], r);
  const o = i(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = i(e, ["customMetadata"]);
  if (t !== void 0 && s != null) {
    let u = s;
    Array.isArray(u) && (u = u.map((c) => c)), l(t, ["customMetadata"], u);
  }
  const a = i(e, ["chunkingConfig"]);
  return t !== void 0 && a != null && l(t, ["chunkingConfig"], a), n;
}
function tE(e) {
  const t = {}, n = i(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = i(e, ["config"]);
  return r != null && Ah(r, t), t;
}
function nE(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var rE = "Content-Type", oE = "X-Server-Timeout", sE = "User-Agent", Si = "x-goog-api-client", iE = "google-genai-sdk/1.50.1", aE = "v1beta1", lE = "v1beta", uE = /* @__PURE__ */ new Set(["us", "eu"]), cE = 5, dE = [
  408,
  429,
  500,
  502,
  503,
  504
], fE = class {
  constructor(e) {
    var t, n, r;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const o = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const s = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !s ? (o.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? o.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && uE.has(this.clientOptions.location) ? o.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (o.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), o.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : aE;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), o.apiVersion = (r = this.clientOptions.apiVersion) !== null && r !== void 0 ? r : lE, o.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === mi.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
  }
  async request(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), r = this.constructUrl(e.path, t, n);
    if (e.queryParams) for (const [s, a] of Object.entries(e.queryParams)) r.searchParams.append(s, String(a));
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
      const o = new AbortController(), s = o.signal;
      if (t.timeout && t?.timeout > 0) {
        const a = setTimeout(() => o.abort(), t.timeout);
        a && typeof a.unref == "function" && a.unref();
      }
      r && r.addEventListener("abort", () => {
        o.abort();
      }), e.signal = s;
    }
    return t && t.extraBody !== null && hE(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await xc(r), new gi(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await xc(r), this.processStreamResponse(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  processStreamResponse(e) {
    return tt(this, arguments, function* () {
      var n;
      const r = (n = e?.body) === null || n === void 0 ? void 0 : n.getReader(), o = new TextDecoder("utf-8");
      if (!r) throw new Error("Response body is empty");
      try {
        let s = "";
        const a = "data:", u = [
          `

`,
          "\r\r",
          `\r
\r
`
        ];
        for (; ; ) {
          const { done: c, value: d } = yield K(r.read());
          if (c) {
            if (s.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const h = o.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(h);
            if ("error" in m) {
              const y = JSON.parse(JSON.stringify(m.error)), _ = y.status, v = y.code, w = `got status: ${_}. ${JSON.stringify(m)}`;
              if (v >= 400 && v < 600) throw new fh({
                message: w,
                status: v
              });
            }
          } catch (m) {
            if (m.name === "ApiError") throw m;
          }
          s += h;
          let f = -1, p = 0;
          for (; ; ) {
            f = -1, p = 0;
            for (const _ of u) {
              const v = s.indexOf(_);
              v !== -1 && (f === -1 || v < f) && (f = v, p = _.length);
            }
            if (f === -1) break;
            const m = s.substring(0, f);
            s = s.substring(f + p);
            const y = m.trim();
            if (y.startsWith(a)) {
              const _ = y.substring(5).trim();
              try {
                yield yield K(new gi(new Response(_, {
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
      const s = await fetch(e, t);
      if (s.ok) return s;
      throw dE.includes(s.status) ? new Error(`Retryable HTTP Error: ${s.statusText}`) : new nu.AbortError(`Non-retryable exception ${s.statusText} sending request`);
    };
    return (0, nu.default)(o, { retries: ((n = r.attempts) !== null && n !== void 0 ? n : cE) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = iE + " " + this.clientOptions.userAgentExtra;
    return e[sE] = t, e[Si] = t, e[rE] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [r, o] of Object.entries(e.headers)) n.append(r, o);
      e.timeout && e.timeout > 0 && n.append(oE, String(Math.ceil(e.timeout / 1e3)));
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
    const o = this.clientOptions.uploader, s = await o.stat(e);
    r.sizeBytes = String(s.size);
    const a = (n = t?.mimeType) !== null && n !== void 0 ? n : s.type;
    if (a === void 0 || a === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    r.mimeType = a;
    const u = { file: r }, c = this.getFileName(e), d = D("upload/v1beta/files", u._url), h = await this.fetchUploadUrl(d, r.sizeBytes, r.mimeType, c, u, t?.httpOptions);
    return o.upload(e, h, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var r;
    const o = this.clientOptions.uploader, s = await o.stat(t), a = String(s.size), u = (r = n?.mimeType) !== null && r !== void 0 ? r : s.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), h = {};
    n != null && Ah(n, h);
    const f = await this.fetchUploadUrl(c, a, u, d, h, n?.httpOptions);
    return o.uploadToFileSearchStore(t, f, this);
  }
  async downloadFile(e) {
    await this.clientOptions.downloader.download(e, this);
  }
  async fetchUploadUrl(e, t, n, r, o, s) {
    var a;
    let u = {};
    s ? u = s : u = {
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
async function xc(e) {
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
    throw n >= 400 && n < 600 ? new fh({
      message: o,
      status: n
    }) : new Error(o);
  }
}
function hE(e, t) {
  if (!t || Object.keys(t).length === 0) return;
  if (e.body instanceof Blob) {
    console.warn("includeExtraBodyToRequestInit: extraBody provided but current request body is a Blob. extraBody will be ignored as merging is not supported for Blob bodies.");
    return;
  }
  let n = {};
  if (typeof e.body == "string" && e.body.length > 0) try {
    const s = JSON.parse(e.body);
    if (typeof s == "object" && s !== null && !Array.isArray(s)) n = s;
    else {
      console.warn("includeExtraBodyToRequestInit: Original request body is valid JSON but not a non-array object. Skip applying extraBody to the request body.");
      return;
    }
  } catch {
    console.warn("includeExtraBodyToRequestInit: Original request body is not valid JSON. Skip applying extraBody to the request body.");
    return;
  }
  function r(s, a) {
    const u = Object.assign({}, s);
    for (const c in a) if (Object.prototype.hasOwnProperty.call(a, c)) {
      const d = a[c], h = u[c];
      d && typeof d == "object" && !Array.isArray(d) && h && typeof h == "object" && !Array.isArray(h) ? u[c] = r(h, d) : (h && d && typeof h != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof h}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const o = r(n, t);
  e.body = JSON.stringify(o);
}
var pE = "mcp_used/unknown", mE = !1;
function Sh(e) {
  for (const t of e)
    if (gE(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return mE;
}
function Th(e) {
  var t;
  e[Si] = (((t = e[Si]) !== null && t !== void 0 ? t : "") + ` ${pE}`).trimStart();
}
function gE(e) {
  return e !== null && typeof e == "object" && e instanceof _E;
}
function yE(e) {
  return tt(this, arguments, function* (n, r = 100) {
    let o, s = 0;
    for (; s < r; ) {
      const a = yield K(n.listTools({ cursor: o }));
      for (const u of a.tools)
        yield yield K(u), s++;
      if (!a.nextCursor) break;
      o = a.nextCursor;
    }
  });
}
var _E = class Eh {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Eh(t, n);
  }
  async initialize() {
    var t, n, r, o;
    if (this.mcpTools.length > 0) return;
    const s = {}, a = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, nt(yE(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
        o = d.value, u = !1;
        const f = o;
        a.push(f);
        const p = f.name;
        if (s[p]) throw new Error(`Duplicate function name ${p} found in MCP tools. Please ensure function names are unique.`);
        s[p] = h;
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
    this.mcpTools = a, this.functionNameToMcpClient = s;
  }
  async tool() {
    return await this.initialize(), N_(this.mcpTools, this.config);
  }
  async callTool(t) {
    await this.initialize();
    const n = [];
    for (const r of t) if (r.name in this.functionNameToMcpClient) {
      const o = this.functionNameToMcpClient[r.name];
      let s;
      this.config.timeout && (s = { timeout: this.config.timeout });
      const a = await o.callTool({
        name: r.name,
        arguments: r.args
      }, void 0, s);
      n.push({ functionResponse: {
        name: r.name,
        response: a.isError ? { error: a } : a
      } });
    }
    return n;
  }
};
async function vE(e, t, n) {
  const r = new E_();
  let o;
  n.data instanceof Blob ? o = JSON.parse(await n.data.text()) : o = JSON.parse(n.data), Object.assign(r, o), t(r);
}
var AE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), o = this.apiClient.getApiVersion(), s = EE(this.apiClient.getDefaultHeaders()), a = `${r}/ws/google.ai.generativelanguage.${o}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        vE(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(a, TE(s), p);
    m.connect(), await c;
    const y = { setup: { model: Y(this.apiClient, e.model) } };
    return m.send(JSON.stringify(y)), new SE(m, this.apiClient);
  }
}, SE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = FA(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = UA(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(pn.PLAY);
  }
  pause() {
    this.sendPlaybackControl(pn.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(pn.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(pn.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function TE(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function EE(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var wE = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function CE(e, t, n) {
  const r = new T_();
  let o;
  n.data instanceof Blob ? o = await n.data.text() : n.data instanceof ArrayBuffer ? o = new TextDecoder().decode(n.data) : o = n.data;
  const s = JSON.parse(o);
  if (e.isVertexAI()) {
    const a = BA(s);
    Object.assign(r, a);
  } else Object.assign(r, s);
  t(r);
}
var IE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new AE(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, r, o, s, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && Sh(e.config.tools) && Th(h);
    const f = xE(h);
    if (this.apiClient.isVertexAI()) {
      const R = this.apiClient.getProject(), k = this.apiClient.getLocation(), H = this.apiClient.getApiKey(), z = !!R && !!k || !!H;
      this.apiClient.getCustomBaseUrl() && !z ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const R = this.apiClient.getApiKey();
      let k = "BidiGenerateContent", H = "key";
      R?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), k = "BidiGenerateContentConstrained", H = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${k}?${H}=${R}`;
    }
    let p = () => {
    };
    const m = new Promise((R) => {
      p = R;
    }), y = e.callbacks, _ = function() {
      var R;
      (R = y?.onopen) === null || R === void 0 || R.call(y), p({});
    }, v = this.apiClient, w = {
      onopen: _,
      onmessage: (R) => {
        CE(v, y.onmessage, R);
      },
      onerror: (t = y?.onerror) !== null && t !== void 0 ? t : function(R) {
      },
      onclose: (n = y?.onclose) !== null && n !== void 0 ? n : function(R) {
      }
    }, b = this.webSocketFactory.create(d, RE(f), w);
    b.connect(), await m;
    let P = Y(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && P.startsWith("publishers/")) {
      const R = this.apiClient.getProject(), k = this.apiClient.getLocation();
      R && k && (P = `projects/${R}/locations/${k}/` + P);
    }
    let x = {};
    this.apiClient.isVertexAI() && ((r = e.config) === null || r === void 0 ? void 0 : r.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [Fo.AUDIO] } : e.config.responseModalities = [Fo.AUDIO]), !((o = e.config) === null || o === void 0) && o.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const $ = (a = (s = e.config) === null || s === void 0 ? void 0 : s.tools) !== null && a !== void 0 ? a : [], S = [];
    for (const R of $) if (this.isCallableTool(R)) {
      const k = R;
      S.push(await k.tool());
    } else S.push(R);
    S.length > 0 && (e.config.tools = S);
    const O = {
      model: P,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? x = LA(this.apiClient, O) : x = $A(this.apiClient, O), delete x.config, b.send(JSON.stringify(x)), new PE(b, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, bE = { turnComplete: !0 }, PE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = Ie(t.turns), e.isVertexAI() || (n = n.map((r) => Lr(r)));
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
      if (!e.isVertexAI() && !("id" in r)) throw new Error(wE);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, bE), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: qA(e) } : t = { realtimeInput: OA(e) }, this.conn.send(JSON.stringify(t));
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
function RE(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function xE(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var Mc = 10;
function Nc(e) {
  var t, n, r;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let o = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (Sn(a)) {
    o = !0;
    break;
  }
  if (!o) return !0;
  const s = (r = e?.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls;
  return s && (s < 0 || !Number.isInteger(s)) || s == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", s), !0) : !1;
}
function Sn(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function ME(e) {
  var t, n, r;
  return (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((o) => Sn(o))) !== null && r !== void 0 ? r : !1;
}
function kc(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((r, o) => {
    if (Sn(r)) return;
    const s = r;
    s.functionDeclarations && s.functionDeclarations.length > 0 && n.push(o);
  }), n;
}
function Dc(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var NE = class extends St {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = Ie(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = Ie(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const r = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: Oo.EMBED_CONTENT
        });
        return await this.embedContentInternal(r);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: Oo.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, r, o, s, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !ME(t) || Nc(t.config)) return await this.generateContentInternal(u);
      const c = kc(t);
      if (c.length > 0) {
        const y = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${y}.`);
      }
      let d, h;
      const f = Ie(u.contents), p = (o = (r = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && o !== void 0 ? o : Mc;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const y = d.candidates[0].content, _ = [];
        for (const v of (a = (s = t.config) === null || s === void 0 ? void 0 : s.tools) !== null && a !== void 0 ? a : []) if (Sn(v)) {
          const w = await v.callTool(d.functionCalls);
          _.push(...w);
        }
        m++, h = {
          role: "user",
          parts: _
        }, u.contents = Ie(u.contents), u.contents.push(y), u.contents.push(h), Dc(u.config) && (f.push(y), f.push(h));
      }
      return Dc(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, r, o, s, a;
      if (this.maybeMoveToResponseJsonSchem(t), Nc(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = kc(t);
      if (u.length > 0) {
        const h = u.map((f) => `tools[${f}]`).join(", ");
        throw new Error(`Incompatible tools found at ${h}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
      }
      const c = (o = (r = (n = t?.config) === null || n === void 0 ? void 0 : n.toolConfig) === null || r === void 0 ? void 0 : r.functionCallingConfig) === null || o === void 0 ? void 0 : o.streamFunctionCallArguments, d = (a = (s = t?.config) === null || s === void 0 ? void 0 : s.automaticFunctionCalling) === null || a === void 0 ? void 0 : a.disable;
      if (c && !d) throw new Error("Running in streaming mode with 'streamFunctionCallArguments' enabled, this feature is not compatible with automatic function calling (AFC). Please set 'config.automaticFunctionCalling.disable' to true to disable AFC or leave 'config.toolConfig.functionCallingConfig.streamFunctionCallArguments' to be undefined or set to false to disable streaming function call arguments feature.");
      return await this.processAfcStream(t);
    }, this.generateImages = async (t) => await this.generateImagesInternal(t).then((n) => {
      var r;
      let o;
      const s = [];
      if (n?.generatedImages) for (const u of n.generatedImages) u && u?.safetyAttributes && ((r = u?.safetyAttributes) === null || r === void 0 ? void 0 : r.contentType) === "Positive Prompt" ? o = u?.safetyAttributes : s.push(u);
      let a;
      return o ? a = {
        generatedImages: s,
        positivePromptSafetyAttributes: o,
        sdkHttpResponse: n.sdkHttpResponse
      } : a = {
        generatedImages: s,
        sdkHttpResponse: n.sdkHttpResponse
      }, a;
    }), this.list = async (t) => {
      var n;
      const r = { config: Object.assign(Object.assign({}, { queryBase: !0 }), t?.config) };
      if (this.apiClient.isVertexAI() && !r.config.queryBase) {
        if (!((n = r.config) === null || n === void 0) && n.filter) throw new Error("Filtering tuned models list for Vertex AI is not currently supported");
        r.config.filter = "labels.tune-type:*";
      }
      return new Xt(At.PAGED_ITEM_MODELS, (o) => this.listInternal(o), await this.listInternal(r), r);
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
      var n, r, o, s, a, u;
      if ((t.prompt || t.image || t.video) && t.source) throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      return this.apiClient.isVertexAI() || (!((n = t.video) === null || n === void 0) && n.uri && (!((r = t.video) === null || r === void 0) && r.videoBytes) ? t.video = {
        uri: t.video.uri,
        mimeType: t.video.mimeType
      } : !((s = (o = t.source) === null || o === void 0 ? void 0 : o.video) === null || s === void 0) && s.uri && (!((u = (a = t.source) === null || a === void 0 ? void 0 : a.video) === null || u === void 0) && u.videoBytes) && (t.source.video = {
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
    const s = await Promise.all(o.map(async (u) => Sn(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: s })
    };
    if (a.config.tools = s, e.config && e.config.tools && Sh(e.config.tools)) {
      const u = (r = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && r !== void 0 ? r : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), Th(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, r;
    const o = /* @__PURE__ */ new Map();
    for (const s of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (Sn(s)) {
      const a = s, u = await a.tool();
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
    const o = (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && r !== void 0 ? r : Mc;
    let s = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return tt(this, arguments, function* () {
        for (var f, p, m, y, _, v; a < o; ) {
          s && (a++, s = !1);
          const x = yield K(c.processParamsMaybeAddMcpUsage(h)), $ = yield K(c.generateContentStreamInternal(x)), S = [], O = [];
          try {
            for (var w = !0, b = (p = void 0, nt($)), P; P = yield K(b.next()), f = P.done, !f; w = !0) {
              y = P.value, w = !1;
              const R = y;
              if (yield yield K(R), R.candidates && (!((_ = R.candidates[0]) === null || _ === void 0) && _.content)) {
                O.push(R.candidates[0].content);
                for (const k of (v = R.candidates[0].content.parts) !== null && v !== void 0 ? v : []) if (a < o && k.functionCall) {
                  if (!k.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(k.functionCall.name)) {
                    const H = yield K(d.get(k.functionCall.name).callTool([k.functionCall]));
                    S.push(...H);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${k.functionCall.name}`);
                }
              }
            }
          } catch (R) {
            p = { error: R };
          } finally {
            try {
              !w && !f && (m = b.return) && (yield K(m.call(b)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (S.length > 0) {
            s = !0;
            const R = new Yn();
            R.candidates = [{ content: {
              role: "user",
              parts: S
            } }], yield yield K(R);
            const k = [];
            k.push(...O), k.push({
              role: "user",
              parts: S
            }), h.contents = Ie(h.contents).concat(k);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = bc(this.apiClient, e);
      return a = D("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Rc(d), f = new Yn();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Ic(this.apiClient, e);
      return a = D("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Pc(d), f = new Yn();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = bc(this.apiClient, e);
      return a = D("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), s.then(function(d) {
        return tt(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var y = !0, _ = nt(d), v; v = yield K(_.next()), h = v.done, !h; y = !0) {
              m = v.value, y = !1;
              const w = m, b = Rc(yield K(w.json()), e);
              b.sdkHttpResponse = { headers: w.headers };
              const P = new Yn();
              Object.assign(P, b), yield yield K(P);
            }
          } catch (w) {
            f = { error: w };
          } finally {
            try {
              !y && !h && (p = _.return) && (yield K(p.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = Ic(this.apiClient, e);
      return a = D("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }), s.then(function(d) {
        return tt(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var y = !0, _ = nt(d), v; v = yield K(_.next()), h = v.done, !h; y = !0) {
              m = v.value, y = !1;
              const w = m, b = Pc(yield K(w.json()), e);
              b.sdkHttpResponse = { headers: w.headers };
              const P = new Yn();
              Object.assign(P, b), yield yield K(P);
            }
          } catch (w) {
            f = { error: w };
          } finally {
            try {
              !y && !h && (p = _.return) && (yield K(p.call(_)));
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
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = SS(this.apiClient, e, e);
      return a = D(D_(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = ES(d, e), f = new ic();
        return Object.assign(f, h), f;
      });
    } else {
      const c = AS(this.apiClient, e);
      return a = D("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = TS(d), f = new ic();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = DS(this.apiClient, e);
      return a = D("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = LS(d), f = new ac();
        return Object.assign(f, h), f;
      });
    } else {
      const c = kS(this.apiClient, e);
      return a = D("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = $S(d), f = new ac();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = gS(this.apiClient, e);
      return o = D("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = yS(u), d = new u_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = LT(this.apiClient, e);
      return o = D("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = UT(u), d = new c_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = gT(this.apiClient, e);
      return o = D("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = yT(u), d = new d_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = ET(this.apiClient, e);
      return o = D("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = wT(u), d = new f_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = jS(this.apiClient, e);
      return a = D("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => Ai(d));
    } else {
      const c = ZS(this.apiClient, e);
      return a = D("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => vi(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = lT(this.apiClient, e);
      return a = D("{models_url}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = cT(d), f = new lc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = aT(this.apiClient, e);
      return a = D("{models_url}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = uT(d), f = new lc();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = DT(this.apiClient, e);
      return a = D("{model}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => Ai(d));
    } else {
      const c = kT(this.apiClient, e);
      return a = D("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => vi(d));
    }
  }
  async delete(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = fS(this.apiClient, e);
      return a = D("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = pS(d), f = new uc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = dS(this.apiClient, e);
      return a = D("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = hS(d), f = new uc();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = lS(this.apiClient, e);
      return a = D("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = cS(d), f = new cc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = aS(this.apiClient, e);
      return a = D("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = uS(d), f = new cc();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = eS(this.apiClient, e);
      return o = D("{model}:computeTokens", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => {
        const c = tS(u), d = new h_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = GS(this.apiClient, e);
      return a = D("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => {
        const h = qS(d), f = new dc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = BS(this.apiClient, e);
      return a = D("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => {
        const h = OS(d), f = new dc();
        return Object.assign(f, h), f;
      });
    }
  }
}, kE = class extends St {
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
      const s = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: r,
        config: { httpOptions: o }
      });
      return t._fromAPIResponse({
        apiResponse: s,
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
      const s = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: r,
        config: { httpOptions: o }
      });
      return t._fromAPIResponse({
        apiResponse: s,
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
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = r_(e);
      return a = D("{operationName}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s;
    } else {
      const c = n_(e);
      return a = D("{operationName}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s;
    }
  }
  async fetchPredictVideosOperationInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = Yy(e);
      return o = D("{resourceName}:fetchPredictOperation", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r;
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
};
function $c(e) {
  const t = {};
  if (i(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function DE(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function $E(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function LE(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => JE(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function UE(e, t, n) {
  const r = {}, o = i(t, ["expireTime"]);
  n !== void 0 && o != null && l(n, ["expireTime"], o);
  const s = i(t, ["newSessionExpireTime"]);
  n !== void 0 && s != null && l(n, ["newSessionExpireTime"], s);
  const a = i(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = i(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], VE(e, u));
  const c = i(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), r;
}
function FE(e, t) {
  const n = {}, r = i(t, ["config"]);
  return r != null && l(n, ["config"], UE(e, r, n)), n;
}
function OE(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function qE(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function BE(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], DE(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function GE(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function HE(e, t) {
  const n = {}, r = i(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], r);
  const o = i(e, ["responseModalities"]);
  t !== void 0 && o != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], o);
  const s = i(e, ["temperature"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], s);
  const a = i(e, ["topP"]);
  t !== void 0 && a != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], a);
  const u = i(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = i(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = i(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const h = i(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = i(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], ha(f));
  const p = i(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = i(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const y = i(e, ["systemInstruction"]);
  t !== void 0 && y != null && l(t, ["setup", "systemInstruction"], LE(fe(y)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let R = Pn(_);
    Array.isArray(R) && (R = R.map((k) => zE(bn(k)))), l(t, ["setup", "tools"], R);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], WE(v));
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], $c(w));
  const b = i(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], $c(b));
  const P = i(e, ["realtimeInputConfig"]);
  t !== void 0 && P != null && l(t, ["setup", "realtimeInputConfig"], P);
  const x = i(e, ["contextWindowCompression"]);
  t !== void 0 && x != null && l(t, ["setup", "contextWindowCompression"], x);
  const $ = i(e, ["proactivity"]);
  if (t !== void 0 && $ != null && l(t, ["setup", "proactivity"], $), i(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = i(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const O = i(e, ["safetySettings"]);
  if (t !== void 0 && O != null) {
    let R = O;
    Array.isArray(R) && (R = R.map((k) => KE(k))), l(t, ["setup", "safetySettings"], R);
  }
  return n;
}
function VE(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = i(t, ["config"]);
  return o != null && l(n, ["config"], HE(o, n)), n;
}
function JE(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], OE(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], qE(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], $E(c));
  const d = i(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = i(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = i(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = i(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = i(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const y = i(e, ["toolResponse"]);
  y != null && l(t, ["toolResponse"], y);
  const _ = i(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function KE(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = i(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function WE(e) {
  const t = {}, n = i(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), i(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function zE(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], GE(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], BE(s));
  const a = i(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = i(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = i(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = i(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function YE(e) {
  const t = [];
  for (const n in e) if (Object.prototype.hasOwnProperty.call(e, n)) {
    const r = e[n];
    if (typeof r == "object" && r != null && Object.keys(r).length > 0) {
      const o = Object.keys(r).map((s) => `${n}.${s}`);
      t.push(...o);
    } else t.push(n);
  }
  return t.join(",");
}
function XE(e, t) {
  let n = null;
  const r = e.bidiGenerateContentSetup;
  if (typeof r == "object" && r !== null && "setup" in r) {
    const s = r.setup;
    typeof s == "object" && s !== null ? (e.bidiGenerateContentSetup = s, n = s) : delete e.bidiGenerateContentSetup;
  } else r !== void 0 && delete e.bidiGenerateContentSetup;
  const o = e.fieldMask;
  if (n) {
    const s = YE(n);
    if (Array.isArray(t?.lockAdditionalFields) && t?.lockAdditionalFields.length === 0) s ? e.fieldMask = s : delete e.fieldMask;
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
      s && c.push(s), u.length > 0 && c.push(...u), c.length > 0 ? e.fieldMask = c.join(",") : delete e.fieldMask;
    } else delete e.fieldMask;
  } else o !== null && Array.isArray(o) && o.length > 0 ? e.fieldMask = o.join(",") : delete e.fieldMask;
  return e;
}
var QE = class extends St {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = FE(this.apiClient, e);
      o = D("auth_tokens", a._url), s = a._query, delete a.config, delete a._url, delete a._query;
      const u = XE(a, e.config);
      return r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => c);
    }
  }
};
function ZE(e, t) {
  const n = {}, r = i(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function jE(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = i(e, ["config"]);
  return r != null && ZE(r, t), t;
}
function ew(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function tw(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function nw(e) {
  const t = {}, n = i(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const r = i(e, ["config"]);
  return r != null && tw(r, t), t;
}
function rw(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = i(e, ["documents"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(t, ["documents"], s);
  }
  return t;
}
var ow = class extends St {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Xt(At.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = ew(e);
      return o = D("{name}", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
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
      const s = jE(e);
      r = D("{name}", s._url), o = s._query, delete s._url, delete s._query, await this.apiClient.request({
        path: r,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = nw(e);
      return o = D("{parent}/documents", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = rw(u), d = new p_();
        return Object.assign(d, c), d;
      });
    }
  }
}, sw = class extends St {
  constructor(e, t = new ow(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Xt(At.PAGED_ITEM_FILE_SEARCH_STORES, (r) => this.listInternal(r), await this.listInternal(n), n);
  }
  async uploadToFileSearchStore(e) {
    if (this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support uploading files to a file search store.");
    return this.apiClient.uploadFileToFileSearchStore(e.fileSearchStoreName, e.file, e.config);
  }
  async create(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = VT(e);
      return o = D("fileSearchStores", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = WT(e);
      return o = D("{name}", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
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
      const s = KT(e);
      r = D("{name}", s._url), o = s._query, delete s._url, delete s._query, await this.apiClient.request({
        path: r,
        queryParams: o,
        body: JSON.stringify(s),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = jT(e);
      return o = D("fileSearchStores", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = eE(u), d = new m_();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = tE(e);
      return o = D("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = nE(u), d = new g_();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = XT(e);
      return o = D("{file_search_store_name}:importFile", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = YT(u), d = new y_();
        return Object.assign(d, c), d;
      });
    }
  }
}, wh = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return wh = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
}, iw = () => wh();
function Ti(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ei = (e) => {
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
}, We = class extends Error {
}, Ye = class wi extends We {
  constructor(t, n, r, o) {
    super(`${wi.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.error = n;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new us({
      message: r,
      cause: Ei(n)
    });
    const s = n;
    return t === 400 ? new Ih(t, s, r, o) : t === 401 ? new bh(t, s, r, o) : t === 403 ? new Ph(t, s, r, o) : t === 404 ? new Rh(t, s, r, o) : t === 409 ? new xh(t, s, r, o) : t === 422 ? new Mh(t, s, r, o) : t === 429 ? new Nh(t, s, r, o) : t >= 500 ? new kh(t, s, r, o) : new wi(t, s, r, o);
  }
}, Ci = class extends Ye {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, us = class extends Ye {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Ch = class extends us {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Ih = class extends Ye {
}, bh = class extends Ye {
}, Ph = class extends Ye {
}, Rh = class extends Ye {
}, xh = class extends Ye {
}, Mh = class extends Ye {
}, Nh = class extends Ye {
}, kh = class extends Ye {
}, aw = /^[a-z][a-z0-9+.-]*:/i, lw = (e) => aw.test(e), Ii = (e) => (Ii = Array.isArray, Ii(e)), Lc = Ii;
function Uc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function uw(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var cw = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new We(`${e} must be an integer`);
  if (t < 0) throw new We(`${e} must be a positive integer`);
  return t;
}, dw = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, fw = (e) => new Promise((t) => setTimeout(t, e));
function hw() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Dh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function pw(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Dh({
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
function $h(e) {
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
async function mw(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const r = e.getReader(), o = r.cancel();
  r.releaseLock(), await o;
}
var gw = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function yw(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new We(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var _w = "0.0.1", Lh = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Gs(e, t, n) {
  return Lh(), new File(e, t ?? "unknown_file", n);
}
function vw(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Aw = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Uh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Sw = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Uh(e), Tw = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Ew(e, t, n) {
  if (Lh(), e = await e, Sw(e))
    return e instanceof File ? e : Gs([await e.arrayBuffer()], e.name);
  if (Tw(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Gs(await bi(o), t, n);
  }
  const r = await bi(e);
  if (t || (t = vw(e)), !n?.type) {
    const o = r.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof o == "string" && (n = Object.assign(Object.assign({}, n), { type: o }));
  }
  return Gs(r, t, n);
}
async function bi(e) {
  var t, n, r, o, s;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (Uh(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Aw(e)) try {
    for (var u = !0, c = nt(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      o = d.value, u = !1;
      const h = o;
      a.push(...await bi(h));
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
    const h = (s = e?.constructor) === null || s === void 0 ? void 0 : s.name;
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${ww(e)}`);
  }
  return a;
}
function ww(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var pa = class {
  constructor(e) {
    this._client = e;
  }
};
pa._key = [];
function Fh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Fc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Cw = (e = Fh) => (function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const s = [], a = n.reduce((h, f, p) => {
    var m, y, _;
    /[?#]/.test(f) && (o = !0);
    const v = r[p];
    let w = (o ? encodeURIComponent : e)("" + v);
    return p !== r.length && (v == null || typeof v == "object" && v.toString === ((_ = Object.getPrototypeOf((y = Object.getPrototypeOf((m = v.hasOwnProperty) !== null && m !== void 0 ? m : Fc)) !== null && y !== void 0 ? y : Fc)) === null || _ === void 0 ? void 0 : _.toString)) && (w = v + "", s.push({
      start: h.length + f.length,
      length: w.length,
      error: `Value of type ${Object.prototype.toString.call(v).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : w);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) {
    const h = d[0].startsWith("/"), f = h ? 1 : 0, p = h ? d[0].slice(1) : d[0];
    s.push({
      start: d.index + f,
      length: p.length,
      error: `Value "${p}" can't be safely passed as a path parameter`
    });
  }
  if (s.sort((h, f) => h.start - f.start), s.length > 0) {
    let h = 0;
    const f = s.reduce((p, m) => {
      const y = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + y + _;
    }, "");
    throw new We(`Path parameters result in path with invalid segments:
${s.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), Qe = /* @__PURE__ */ Cw(Fh), Oh = class extends pa {
  create(e, t) {
    var n;
    const { api_version: r = this._client.apiVersion } = e, o = Nt(e, ["api_version"]);
    if ("model" in o && "agent_config" in o) throw new We("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in o && "generation_config" in o) throw new We("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(Qe`/${r}/interactions`, Object.assign(Object.assign({ body: o }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(Qe`/${r}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.post(Qe`/${r}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var r;
    const o = t ?? {}, { api_version: s = this._client.apiVersion } = o, a = Nt(o, ["api_version"]);
    return this._client.get(Qe`/${s}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (r = t?.stream) !== null && r !== void 0 ? r : !1 }));
  }
};
Oh._key = Object.freeze(["interactions"]);
var qh = class extends Oh {
}, Bh = class extends pa {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: r } = e, o = Nt(e, ["api_version", "webhook_id"]);
    return this._client.post(Qe`/${n}/webhooks`, Object.assign({
      query: { webhook_id: r },
      body: o
    }, t));
  }
  update(e, t, n) {
    const { api_version: r = this._client.apiVersion, update_mask: o } = t, s = Nt(t, ["api_version", "update_mask"]);
    return this._client.patch(Qe`/${r}/webhooks/${e}`, Object.assign({
      query: { update_mask: o },
      body: s
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: r = this._client.apiVersion } = n, o = Nt(n, ["api_version"]);
    return this._client.get(Qe`/${r}/webhooks`, Object.assign({ query: o }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(Qe`/${r}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.get(Qe`/${r}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: r = this._client.apiVersion, body: o } = t ?? {};
    return this._client.post(Qe`/${r}/webhooks/${e}:ping`, Object.assign({ body: o }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const r = t ?? {}, { api_version: o = this._client.apiVersion } = r, s = Nt(r, ["api_version"]);
    return this._client.post(Qe`/${o}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: s }, n));
  }
};
Bh._key = Object.freeze(["webhooks"]);
var Gh = class extends Bh {
};
function Iw(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var lo;
function ma(e) {
  let t;
  return (lo ?? (t = new globalThis.TextEncoder(), lo = t.encode.bind(t)))(e);
}
var uo;
function Oc(e) {
  let t;
  return (uo ?? (t = new globalThis.TextDecoder(), uo = t.decode.bind(t)))(e);
}
var cs = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ma(e) : e;
    this.buffer = Iw([this.buffer, n]);
    const r = [];
    let o;
    for (; (o = bw(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (o.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = o.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (o.index !== this.carriageReturnIndex + 1 || o.carriage)) {
        r.push(Oc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const s = this.carriageReturnIndex !== null ? o.preceding - 1 : o.preceding, a = Oc(this.buffer.subarray(0, s));
      r.push(a), this.buffer = this.buffer.subarray(o.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), r;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
cs.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
cs.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function bw(e, t) {
  const o = t ?? 0, s = e.indexOf(10, o), a = e.indexOf(13, o);
  if (s === -1 && a === -1) return null;
  let u;
  return s !== -1 && a !== -1 ? u = Math.min(s, a) : u = s !== -1 ? s : a, e[u] === 10 ? {
    preceding: u,
    index: u + 1,
    carriage: !1
  } : {
    preceding: u,
    index: u + 1,
    carriage: !0
  };
}
var Bo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, qc = (e, t, n) => {
  if (e) {
    if (uw(Bo, e)) return e;
    Se(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Bo))}`);
  }
};
function nr() {
}
function co(e, t, n) {
  return !t || Bo[e] > Bo[n] ? nr : t[e].bind(t);
}
var Pw = {
  error: nr,
  warn: nr,
  info: nr,
  debug: nr
}, Bc = /* @__PURE__ */ new WeakMap();
function Se(e) {
  var t;
  const n = e.logger, r = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return Pw;
  const o = Bc.get(n);
  if (o && o[0] === r) return o[1];
  const s = {
    error: co("error", n, r),
    warn: co("warn", n, r),
    info: co("info", n, r),
    debug: co("debug", n, r)
  };
  return Bc.set(n, [r, s]), s;
}
var Ot = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Rw = class rr {
  constructor(t, n, r) {
    this.iterator = t, this.controller = n, this.client = r;
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const s = r ? Se(r) : console;
    function a() {
      return tt(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new We("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, y = nt(xw(t, n)), _; _ = yield K(y.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const v = f;
              if (!p)
                if (v.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield K(JSON.parse(v.data));
                } catch (w) {
                  throw s.error("Could not parse message into JSON:", v.data), s.error("From chunk:", v.raw), w;
                }
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (h = y.return) && (yield K(h.call(y)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (Ti(v)) return yield K(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new rr(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    function s() {
      return tt(this, arguments, function* () {
        var c, d, h, f;
        const p = new cs(), m = $h(t);
        try {
          for (var y = !0, _ = nt(m), v; v = yield K(_.next()), c = v.done, !c; y = !0) {
            f = v.value, y = !1;
            const w = f;
            for (const b of p.decode(w)) yield yield K(b);
          }
        } catch (w) {
          d = { error: w };
        } finally {
          try {
            !y && !c && (h = _.return) && (yield K(h.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const w of p.flush()) yield yield K(w);
      });
    }
    function a() {
      return tt(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new We("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, y = nt(s()), _; _ = yield K(y.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const v = f;
              p || v && (yield yield K(JSON.parse(v)));
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (h = y.return) && (yield K(h.call(y)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (Ti(v)) return yield K(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new rr(a, n, r);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), o = (s) => ({ next: () => {
      if (s.length === 0) {
        const a = r.next();
        t.push(a), n.push(a);
      }
      return s.shift();
    } });
    return [new rr(() => o(t), this.controller, this.client), new rr(() => o(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Dh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: s } = await n.next();
          if (s) return r.close();
          const a = ma(JSON.stringify(o) + `
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
function xw(e, t) {
  return tt(this, arguments, function* () {
    var r, o, s, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new We("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new We("Attempted to iterate over a response with no body");
    const u = new Nw(), c = new cs(), d = $h(e.body);
    try {
      for (var h = !0, f = nt(Mw(d)), p; p = yield K(f.next()), r = p.done, !r; h = !0) {
        a = p.value, h = !1;
        const m = a;
        for (const y of c.decode(m)) {
          const _ = u.decode(y);
          _ && (yield yield K(_));
        }
      }
    } catch (m) {
      o = { error: m };
    } finally {
      try {
        !h && !r && (s = f.return) && (yield K(s.call(f)));
      } finally {
        if (o) throw o.error;
      }
    }
    for (const m of c.flush()) {
      const y = u.decode(m);
      y && (yield yield K(y));
    }
  });
}
function Mw(e) {
  return tt(this, arguments, function* () {
    var n, r, o, s;
    try {
      for (var a = !0, u = nt(e), c; c = yield K(u.next()), n = c.done, !n; a = !0) {
        s = c.value, a = !1;
        const d = s;
        d != null && (yield yield K(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? ma(d) : d));
      }
    } catch (d) {
      r = { error: d };
    } finally {
      try {
        !a && !n && (o = u.return) && (yield K(o.call(u)));
      } finally {
        if (r) throw r.error;
      }
    }
  });
}
var Nw = class {
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
    let [t, n, r] = kw(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function kw(e, t) {
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
async function Dw(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: s } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return Se(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : Rw.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return Se(e).debug(`[${r}] response parsed`, Ot({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - s
  })), a;
}
var $w = class Hh extends Promise {
  constructor(t, n, r = Dw) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, this.client = t;
  }
  _thenUnwrap(t) {
    return new Hh(this.client, this.responsePromise, async (n, r) => t(await this.parseResponse(n, r), r));
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
}, Vh = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* Lw(e) {
  if (!e) return;
  if (Vh in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const s of o) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Lc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const s = Lc(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of s)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var Xn = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [s, a] of Lw(r)) {
      const u = s.toLowerCase();
      o.has(u) || (t.delete(s), o.add(u)), a === null ? (t.delete(s), n.add(u)) : (t.append(s, a), n.delete(u));
    }
  }
  return {
    [Vh]: !0,
    values: t,
    nulls: n
  };
}, Hs = (e) => {
  var t, n, r, o, s;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((s = (o = (r = globalThis.Deno.env) === null || r === void 0 ? void 0 : r.get) === null || o === void 0 ? void 0 : o.call(r, e)) === null || s === void 0 ? void 0 : s.trim()) || void 0;
}, Jh, Kh = class Wh {
  constructor(t) {
    var n, r, o, s, a, u, c, { baseURL: d = Hs("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = Hs("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = Nt(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (r = m.timeout) !== null && r !== void 0 ? r : Wh.DEFAULT_TIMEOUT, this.logger = (o = m.logger) !== null && o !== void 0 ? o : console;
    const y = "warn";
    this.logLevel = y, this.logLevel = (a = (s = qc(m.logLevel, "ClientOptions.logLevel", this)) !== null && s !== void 0 ? s : qc(Hs("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : y, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : hw(), this.encoder = gw, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = Xn([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return Xn([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return Xn([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return yw(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${_w}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${iw()}`;
  }
  makeStatusError(t, n, r, o) {
    return Ye.generate(t, n, r, o);
  }
  buildURL(t, n, r) {
    const o = !this.baseURLOverridden() && r || this.baseURL, s = lw(t) ? new URL(t) : new URL(o + (o.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(s.searchParams);
    return (!Uc(a) || !Uc(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (s.search = this.stringifyQuery(n)), s.toString();
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
    return new $w(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, r) {
    var o, s, a;
    const u = await t, c = (o = u.maxRetries) !== null && o !== void 0 ? o : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: h, timeout: f } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: h,
      options: u
    });
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = r === void 0 ? "" : `, retryOf: ${r}`, y = Date.now();
    if (Se(this).debug(`[${p}] sending request`, Ot({
      retryOfRequestLogID: r,
      method: u.method,
      url: h,
      options: u,
      headers: d.headers
    })), !((s = u.signal) === null || s === void 0) && s.aborted) throw new Ci();
    const _ = new AbortController(), v = await this.fetchWithTimeout(h, d, f, _).catch(Ei), w = Date.now();
    if (v instanceof globalThis.Error) {
      const P = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new Ci();
      const x = Ti(v) || /timed? ?out/i.test(String(v) + ("cause" in v ? String(v.cause) : ""));
      if (n)
        return Se(this).info(`[${p}] connection ${x ? "timed out" : "failed"} - ${P}`), Se(this).debug(`[${p}] connection ${x ? "timed out" : "failed"} (${P})`, Ot({
          retryOfRequestLogID: r,
          url: h,
          durationMs: w - y,
          message: v.message
        })), this.retryRequest(u, n, r ?? p);
      throw Se(this).info(`[${p}] connection ${x ? "timed out" : "failed"} - error; no more retries left`), Se(this).debug(`[${p}] connection ${x ? "timed out" : "failed"} (error; no more retries left)`, Ot({
        retryOfRequestLogID: r,
        url: h,
        durationMs: w - y,
        message: v.message
      })), x ? new Ch() : new us({ cause: v });
    }
    const b = `[${p}${m}] ${d.method} ${h} ${v.ok ? "succeeded" : "failed"} with status ${v.status} in ${w - y}ms`;
    if (!v.ok) {
      const P = await this.shouldRetry(v);
      if (n && P) {
        const R = `retrying, ${n} attempts remaining`;
        return await mw(v.body), Se(this).info(`${b} - ${R}`), Se(this).debug(`[${p}] response error (${R})`, Ot({
          retryOfRequestLogID: r,
          url: v.url,
          status: v.status,
          headers: v.headers,
          durationMs: w - y
        })), this.retryRequest(u, n, r ?? p, v.headers);
      }
      const x = P ? "error; no more retries left" : "error; not retryable";
      Se(this).info(`${b} - ${x}`);
      const $ = await v.text().catch((R) => Ei(R).message), S = dw($), O = S ? void 0 : $;
      throw Se(this).debug(`[${p}] response error (${x})`, Ot({
        retryOfRequestLogID: r,
        url: v.url,
        status: v.status,
        headers: v.headers,
        message: O,
        durationMs: Date.now() - y
      })), this.makeStatusError(v.status, S, O, v.headers);
    }
    return Se(this).info(b), Se(this).debug(`[${p}] response start`, Ot({
      retryOfRequestLogID: r,
      url: v.url,
      status: v.status,
      headers: v.headers,
      durationMs: w - y
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
    const s = n || {}, { signal: a, method: u } = s, c = Nt(s, ["signal", "method"]), d = this._makeAbort(o);
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
    var s;
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
      const d = (s = t.maxRetries) !== null && s !== void 0 ? s : this.maxRetries;
      a = this.calculateDefaultRetryTimeoutMillis(n, d);
    }
    return await fw(a), this.makeRequest(t, n - 1, r);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const s = n - t;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var r, o, s;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = a, f = this.buildURL(c, d, h);
    "timeout" in a && cw("timeout", a.timeout), a.timeout = (r = a.timeout) !== null && r !== void 0 ? r : this.timeout;
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
      }, a.signal && { signal: a.signal }), globalThis.ReadableStream && m instanceof globalThis.ReadableStream && { duplex: "half" }), m && { body: m }), (o = this.fetchOptions) !== null && o !== void 0 ? o : {}), (s = a.fetchOptions) !== null && s !== void 0 ? s : {}),
      url: f,
      timeout: a.timeout
    };
  }
  async buildHeaders({ options: t, method: n, bodyHeaders: r, retryCount: o }) {
    let s = {};
    this.idempotencyHeader && n !== "get" && (t.idempotencyKey || (t.idempotencyKey = this.defaultIdempotencyKey()), s[this.idempotencyHeader] = t.idempotencyKey);
    const a = await this.authHeaders(t);
    let u = Xn([
      s,
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
    const r = Xn([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: pw(t)
    } : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: r
    });
  }
};
Kh.DEFAULT_TIMEOUT = 6e4;
var ce = class extends Kh {
  constructor() {
    super(...arguments), this.interactions = new qh(this), this.webhooks = new Gh(this);
  }
};
Jh = ce;
ce.GeminiNextGenAPIClient = Jh;
ce.GeminiNextGenAPIClientError = We;
ce.APIError = Ye;
ce.APIConnectionError = us;
ce.APIConnectionTimeoutError = Ch;
ce.APIUserAbortError = Ci;
ce.NotFoundError = Rh;
ce.ConflictError = xh;
ce.RateLimitError = Nh;
ce.BadRequestError = Ih;
ce.AuthenticationError = bh;
ce.InternalServerError = kh;
ce.PermissionDeniedError = Ph;
ce.UnprocessableEntityError = Mh;
ce.toFile = Ew;
ce.Interactions = qh;
ce.Webhooks = Gh;
function Uw(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function Fw(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function Ow(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function qw(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function Bw(e, t, n) {
  const r = {};
  if (i(e, ["validationDataset"]) !== void 0) throw new Error("validationDataset parameter is not supported in Gemini API.");
  const o = i(e, ["tunedModelDisplayName"]);
  if (t !== void 0 && o != null && l(t, ["displayName"], o), i(e, ["description"]) !== void 0) throw new Error("description parameter is not supported in Gemini API.");
  const s = i(e, ["epochCount"]);
  t !== void 0 && s != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "epochCount"
  ], s);
  const a = i(e, ["learningRateMultiplier"]);
  if (a != null && l(r, [
    "tuningTask",
    "hyperparameters",
    "learningRateMultiplier"
  ], a), i(e, ["exportLastCheckpointOnly"]) !== void 0) throw new Error("exportLastCheckpointOnly parameter is not supported in Gemini API.");
  if (i(e, ["preTunedModelCheckpointId"]) !== void 0) throw new Error("preTunedModelCheckpointId parameter is not supported in Gemini API.");
  if (i(e, ["adapterSize"]) !== void 0) throw new Error("adapterSize parameter is not supported in Gemini API.");
  if (i(e, ["tuningMode"]) !== void 0) throw new Error("tuningMode parameter is not supported in Gemini API.");
  if (i(e, ["customBaseModel"]) !== void 0) throw new Error("customBaseModel parameter is not supported in Gemini API.");
  const u = i(e, ["batchSize"]);
  t !== void 0 && u != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "batchSize"
  ], u);
  const c = i(e, ["learningRate"]);
  if (t !== void 0 && c != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "learningRate"
  ], c), i(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  if (i(e, ["beta"]) !== void 0) throw new Error("beta parameter is not supported in Gemini API.");
  if (i(e, ["baseTeacherModel"]) !== void 0) throw new Error("baseTeacherModel parameter is not supported in Gemini API.");
  if (i(e, ["tunedTeacherModelSource"]) !== void 0) throw new Error("tunedTeacherModelSource parameter is not supported in Gemini API.");
  if (i(e, ["sftLossWeightMultiplier"]) !== void 0) throw new Error("sftLossWeightMultiplier parameter is not supported in Gemini API.");
  if (i(e, ["outputUri"]) !== void 0) throw new Error("outputUri parameter is not supported in Gemini API.");
  if (i(e, ["encryptionSpec"]) !== void 0) throw new Error("encryptionSpec parameter is not supported in Gemini API.");
  return r;
}
function Gw(e, t, n) {
  const r = {};
  let o = i(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const S = i(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec"], Vs(S));
  } else if (o === "PREFERENCE_TUNING") {
    const S = i(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["preferenceOptimizationSpec"], Vs(S));
  } else if (o === "DISTILLATION") {
    const S = i(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["distillationSpec"], Vs(S));
  }
  const s = i(e, ["tunedModelDisplayName"]);
  t !== void 0 && s != null && l(t, ["tunedModelDisplayName"], s);
  const a = i(e, ["description"]);
  t !== void 0 && a != null && l(t, ["description"], a);
  let u = i(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const S = i(e, ["epochCount"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], S);
  } else if (u === "PREFERENCE_TUNING") {
    const S = i(e, ["epochCount"]);
    t !== void 0 && S != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], S);
  } else if (u === "DISTILLATION") {
    const S = i(e, ["epochCount"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], S);
  }
  let c = i(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const S = i(e, ["learningRateMultiplier"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], S);
  } else if (c === "PREFERENCE_TUNING") {
    const S = i(e, ["learningRateMultiplier"]);
    t !== void 0 && S != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], S);
  } else if (c === "DISTILLATION") {
    const S = i(e, ["learningRateMultiplier"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], S);
  }
  let d = i(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const S = i(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], S);
  } else if (d === "PREFERENCE_TUNING") {
    const S = i(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && S != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], S);
  } else if (d === "DISTILLATION") {
    const S = i(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && S != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], S);
  }
  let h = i(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const S = i(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  } else if (h === "PREFERENCE_TUNING") {
    const S = i(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  } else if (h === "DISTILLATION") {
    const S = i(e, ["adapterSize"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], S);
  }
  let f = i(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const S = i(e, ["tuningMode"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec", "tuningMode"], S);
  } else if (f === "DISTILLATION") {
    const S = i(e, ["tuningMode"]);
    t !== void 0 && S != null && l(t, ["distillationSpec", "tuningMode"], S);
  }
  const p = i(e, ["customBaseModel"]);
  t !== void 0 && p != null && l(t, ["customBaseModel"], p);
  let m = i(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const S = i(e, ["batchSize"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], S);
  } else if (m === "DISTILLATION") {
    const S = i(e, ["batchSize"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], S);
  }
  let y = i(n, ["config", "method"]);
  if (y === void 0 && (y = "SUPERVISED_FINE_TUNING"), y === "SUPERVISED_FINE_TUNING") {
    const S = i(e, ["learningRate"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], S);
  } else if (y === "DISTILLATION") {
    const S = i(e, ["learningRate"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], S);
  }
  const _ = i(e, ["labels"]);
  t !== void 0 && _ != null && l(t, ["labels"], _);
  const v = i(e, ["beta"]);
  t !== void 0 && v != null && l(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], v);
  const w = i(e, ["baseTeacherModel"]);
  t !== void 0 && w != null && l(t, ["distillationSpec", "baseTeacherModel"], w);
  const b = i(e, ["tunedTeacherModelSource"]);
  t !== void 0 && b != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], b);
  const P = i(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && P != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], P);
  const x = i(e, ["outputUri"]);
  t !== void 0 && x != null && l(t, ["outputUri"], x);
  const $ = i(e, ["encryptionSpec"]);
  return t !== void 0 && $ != null && l(t, ["encryptionSpec"], $), r;
}
function Hw(e, t) {
  const n = {}, r = i(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const s = i(e, ["trainingDataset"]);
  s != null && eC(s);
  const a = i(e, ["config"]);
  return a != null && Bw(a, n), n;
}
function Vw(e, t) {
  const n = {}, r = i(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const s = i(e, ["trainingDataset"]);
  s != null && tC(s, n, t);
  const a = i(e, ["config"]);
  return a != null && Gw(a, n, t), n;
}
function Jw(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function Kw(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function Ww(e, t, n) {
  const r = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  t !== void 0 && s != null && l(t, ["_query", "pageToken"], s);
  const a = i(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function zw(e, t, n) {
  const r = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  t !== void 0 && s != null && l(t, ["_query", "pageToken"], s);
  const a = i(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function Yw(e, t) {
  const n = {}, r = i(e, ["config"]);
  return r != null && Ww(r, n), n;
}
function Xw(e, t) {
  const n = {}, r = i(e, ["config"]);
  return r != null && zw(r, n), n;
}
function Qw(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["tunedModels"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => zh(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function Zw(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["tuningJobs"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => Pi(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function jw(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["model"], r);
  const o = i(e, ["name"]);
  return o != null && l(n, ["endpoint"], o), n;
}
function eC(e, t) {
  const n = {};
  if (i(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (i(e, ["vertexDatasetResource"]) !== void 0) throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");
  const r = i(e, ["examples"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => s)), l(n, ["examples", "examples"], o);
  }
  return n;
}
function tC(e, t, n) {
  const r = {};
  let o = i(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const a = i(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (o === "PREFERENCE_TUNING") {
    const a = i(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  } else if (o === "DISTILLATION") {
    const a = i(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["distillationSpec", "promptDatasetUri"], a);
  }
  let s = i(n, ["config", "method"]);
  if (s === void 0 && (s = "SUPERVISED_FINE_TUNING"), s === "SUPERVISED_FINE_TUNING") {
    const a = i(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (s === "PREFERENCE_TUNING") {
    const a = i(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  } else if (s === "DISTILLATION") {
    const a = i(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["distillationSpec", "promptDatasetUri"], a);
  }
  if (i(e, ["examples"]) !== void 0) throw new Error("examples parameter is not supported in Vertex AI.");
  return r;
}
function zh(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["state"]);
  s != null && l(n, ["state"], rh(s));
  const a = i(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const u = i(e, ["tuningTask", "startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = i(e, ["tuningTask", "completeTime"]);
  c != null && l(n, ["endTime"], c);
  const d = i(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const h = i(e, ["description"]);
  h != null && l(n, ["description"], h);
  const f = i(e, ["baseModel"]);
  f != null && l(n, ["baseModel"], f);
  const p = i(e, ["_self"]);
  return p != null && l(n, ["tunedModel"], jw(p)), n;
}
function Pi(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["state"]);
  s != null && l(n, ["state"], rh(s));
  const a = i(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const u = i(e, ["startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = i(e, ["endTime"]);
  c != null && l(n, ["endTime"], c);
  const d = i(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const h = i(e, ["error"]);
  h != null && l(n, ["error"], h);
  const f = i(e, ["description"]);
  f != null && l(n, ["description"], f);
  const p = i(e, ["baseModel"]);
  p != null && l(n, ["baseModel"], p);
  const m = i(e, ["tunedModel"]);
  m != null && l(n, ["tunedModel"], m);
  const y = i(e, ["preTunedModel"]);
  y != null && l(n, ["preTunedModel"], y);
  const _ = i(e, ["supervisedTuningSpec"]);
  _ != null && l(n, ["supervisedTuningSpec"], _);
  const v = i(e, ["preferenceOptimizationSpec"]);
  v != null && l(n, ["preferenceOptimizationSpec"], v);
  const w = i(e, ["distillationSpec"]);
  w != null && l(n, ["distillationSpec"], w);
  const b = i(e, ["tuningDataStats"]);
  b != null && l(n, ["tuningDataStats"], b);
  const P = i(e, ["encryptionSpec"]);
  P != null && l(n, ["encryptionSpec"], P);
  const x = i(e, ["partnerModelTuningSpec"]);
  x != null && l(n, ["partnerModelTuningSpec"], x);
  const $ = i(e, ["customBaseModel"]);
  $ != null && l(n, ["customBaseModel"], $);
  const S = i(e, ["evaluateDatasetRuns"]);
  if (S != null) {
    let ot = S;
    Array.isArray(ot) && (ot = ot.map((_e) => _e)), l(n, ["evaluateDatasetRuns"], ot);
  }
  const O = i(e, ["experiment"]);
  O != null && l(n, ["experiment"], O);
  const R = i(e, ["fullFineTuningSpec"]);
  R != null && l(n, ["fullFineTuningSpec"], R);
  const k = i(e, ["labels"]);
  k != null && l(n, ["labels"], k);
  const H = i(e, ["outputUri"]);
  H != null && l(n, ["outputUri"], H);
  const z = i(e, ["pipelineJob"]);
  z != null && l(n, ["pipelineJob"], z);
  const se = i(e, ["serviceAccount"]);
  se != null && l(n, ["serviceAccount"], se);
  const j = i(e, ["tunedModelDisplayName"]);
  j != null && l(n, ["tunedModelDisplayName"], j);
  const Q = i(e, ["tuningJobState"]);
  Q != null && l(n, ["tuningJobState"], Q);
  const X = i(e, ["veoTuningSpec"]);
  X != null && l(n, ["veoTuningSpec"], X);
  const he = i(e, ["distillationSamplingSpec"]);
  he != null && l(n, ["distillationSamplingSpec"], he);
  const qe = i(e, ["tuningJobMetadata"]);
  return qe != null && l(n, ["tuningJobMetadata"], qe), n;
}
function nC(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const a = i(e, ["done"]);
  a != null && l(n, ["done"], a);
  const u = i(e, ["error"]);
  return u != null && l(n, ["error"], u), n;
}
function Vs(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["validationDatasetUri"], r);
  const o = i(e, ["vertexDatasetResource"]);
  return o != null && l(n, ["validationDatasetUri"], o), n;
}
var rC = class extends St {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Xt(At.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
        let s = "";
        return o.metadata !== void 0 && o.metadata.tunedModel !== void 0 ? s = o.metadata.tunedModel : o.name !== void 0 && o.name.includes("/operations/") && (s = o.name.split("/operations/")[0]), {
          name: s,
          state: pi.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Kw(e);
      return a = D("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => Pi(d));
    } else {
      const c = Jw(e);
      return a = D("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => zh(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Xw(e);
      return a = D("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Zw(d), f = new fc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Yw(e);
      return a = D("tunedModels", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Qw(d), f = new fc();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Fw(e);
      return a = D("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = qw(d), f = new hc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Uw(e);
      return a = D("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Ow(d), f = new hc();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = Vw(e, e);
      return o = D("tuningJobs", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => Pi(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Hw(e);
      return o = D("tunedModels", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => nC(u));
    }
  }
}, oC = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, sC = 1024 * 1024 * 8, iC = 3, aC = 1e3, lC = 2, Go = "x-goog-upload-status";
async function uC(e, t, n, r) {
  var o;
  const s = await Yh(e, t, n, r), a = await s?.json();
  if (((o = s?.headers) === null || o === void 0 ? void 0 : o[Go]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function cC(e, t, n, r) {
  var o;
  const s = await Yh(e, t, n, r), a = await s?.json();
  if (((o = s?.headers) === null || o === void 0 ? void 0 : o[Go]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = zf(a), c = new w_();
  return Object.assign(c, u), c;
}
async function Yh(e, t, n, r) {
  var o, s, a;
  let u = t;
  const c = r?.baseUrl || ((o = n.clientOptions.httpOptions) === null || o === void 0 ? void 0 : o.baseUrl);
  if (c) {
    const m = new URL(c), y = new URL(t);
    y.protocol = m.protocol, y.host = m.host, y.port = m.port, u = y.toString();
  }
  let d = 0, h = 0, f = new gi(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(sC, d - h), y = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, v = aC;
    for (; _ < iC; ) {
      const w = Object.assign(Object.assign({}, r?.headers || {}), {
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
          headers: w
        })
      }), !((s = f?.headers) === null || s === void 0) && s[Go]) break;
      _++, await fC(v), v = v * lC;
    }
    if (h += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[Go]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function dC(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function fC(e) {
  return new Promise((t) => setTimeout(t, e));
}
var hC = class {
  async upload(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await uC(e, t, n, r);
  }
  async uploadToFileSearchStore(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await cC(e, t, n, r);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await dC(e);
  }
}, pC = class {
  create(e, t, n) {
    return new mC(e, t, n);
  }
}, mC = class {
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
}, Gc = "x-goog-api-key", gC = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(Gc) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(Gc, this.apiKey);
    }
  }
}, yC = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new ce({
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
    const n = Wy(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const r = new gC(this.apiKey);
    this.apiClient = new fE({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new hC(),
      downloader: new oC()
    }), this.models = new NE(this.apiClient), this.live = new IE(this.apiClient, r, new pC()), this.batches = new bv(this.apiClient), this.chats = new dA(this.models, this.apiClient), this.caches = new lA(this.apiClient), this.files = new EA(this.apiClient), this.operations = new kE(this.apiClient), this.authTokens = new QE(this.apiClient), this.tunings = new rC(this.apiClient), this.fileSearchStores = new sw(this.apiClient);
  }
};
function Hc(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Ho(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Jt(e) {
  return { text: String(e || "") };
}
function _C(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function vC(e) {
  if (typeof e == "string") return [Jt(e)];
  if (!Array.isArray(e)) return [Jt("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? Jt(n.text || "") : n.type === "image_url" && n.image_url?.url ? _C(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [Jt("")];
}
function Vc() {
  return {
    role: "user",
    parts: [Jt("")]
  };
}
function Ur(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = Ho(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function AC(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function SC(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function Jc(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const r = String(e.functionCall.id || "").trim();
  return r ? `id:${r}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function TC(e, t) {
  const n = e?.functionCall || {}, r = t?.functionCall || {}, o = n.args && typeof n.args == "object" && !Array.isArray(n.args) ? n.args : {}, s = r.args && typeof r.args == "object" && !Array.isArray(r.args) ? r.args : {};
  return {
    ...e,
    ...t,
    ...e?.thoughtSignature && !t?.thoughtSignature ? { thoughtSignature: e.thoughtSignature } : {},
    functionCall: {
      ...n,
      ...r,
      args: {
        ...o,
        ...s
      }
    }
  };
}
function EC(e = [], t = "") {
  const n = e.map((h) => Ur(h, "model")).filter(Boolean);
  if (!n.length) return null;
  const r = [...n].reverse().find((h) => AC(h)) || null, o = [...n].reverse().find((h) => SC(h)) || null, s = r || o || n[n.length - 1], a = n.indexOf(s), u = Ho(s);
  if (!u?.parts?.length) return n[n.length - 1];
  if (o) {
    const h = /* @__PURE__ */ new Map(), f = [];
    n.forEach((m, y) => {
      m.parts.forEach((_, v) => {
        const w = Jc(_, v, y);
        if (!w) return;
        h.has(w) || f.push(w);
        const b = h.get(w);
        b ? h.set(w, TC(b, _)) : h.set(w, Ho(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((m, y) => {
      const _ = Jc(m, y, a);
      return _ ? (p.add(_), h.get(_) || m) : m;
    }), f.forEach((m) => {
      p.has(m) || (u.parts.push(h.get(m)), p.add(m));
    });
  }
  const c = String(t || ""), d = u.parts.filter((h) => !(typeof h?.text == "string" && !h?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function Kc(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((r) => !r?.thought && typeof r?.text == "string" && r.text).map((r) => r.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function Xh(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((r) => r?.functionCall || r).filter((r) => r && r.name);
  return t.length ? t : n;
}
function Qh(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function Wc(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function wC(e, t) {
  const n = Wc(e), r = Wc(t);
  return n && r ? JSON.stringify({
    ...n,
    ...r
  }) : String(t || "").trim() || String(e || "{}");
}
function CC(e, t = "google-tool") {
  return Xh(e).map((n, r) => {
    const o = String(n.id || "").trim();
    return {
      id: o || `${t}-${r + 1}`,
      name: n.name || "",
      arguments: Qh(n),
      ...o ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function IC(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let r = 0;
  function o(a, u, c, d) {
    return a.name = String(u.name || a.name || "").trim(), a.arguments = wC(a.arguments, d), c && (n.set(c, a), a.id !== c ? a.providerId = c : delete a.providerId), a;
  }
  function s(a) {
    return Xh(a).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), h = Qh(u);
      let f = d ? n.get(d) : null;
      f ? o(f, u, d, h) : (f = {
        id: d || `${e}-${++r}`,
        name: c,
        arguments: h,
        ...d ? {} : { providerId: "" }
      }, t.push(f)), d && n.set(d, f);
    }), t.map((u) => ({ ...u }));
  }
  return { append: s };
}
function bC(e = []) {
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
function PC(e) {
  switch (e) {
    case "minimal":
      return hn.MINIMAL;
    case "high":
      return hn.HIGH;
    case "medium":
      return hn.MEDIUM;
    default:
      return hn.LOW;
  }
}
function zc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function RC(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function xC(e) {
  const t = e?.providerPayload?.googleContent;
  return Ur(t, "model");
}
function MC(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = xC(e);
    return n ? [n] : [];
  }
  return t.map((n) => Ur(n, "model")).filter(Boolean);
}
function ga(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => Ur(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function NC(e) {
  const t = e?.candidates?.[0]?.content;
  return ga(t ? [t] : []);
}
function kC(e) {
  return ga(e ? [e] : []);
}
function Zh(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? Ho(e.history) || [] : [];
}
function DC(e, t = 0) {
  return Zh(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => Ur(n, "model")).filter(Boolean);
}
function $C(e) {
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
          response: Hc(h.content)
        } }), d += 1;
      }
      r.push({
        role: "user",
        parts: c
      }), a = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = MC(u);
      if (c.length) {
        r.push(...c);
        continue;
      }
    }
    if (u.role === "assistant" && Array.isArray(u.tool_calls) && u.tool_calls.length) {
      r.push({
        role: "model",
        parts: [...u.content ? [Jt(u.content)] : [], ...u.tool_calls.map((c) => ({ functionCall: {
          ...(() => {
            const d = Object.prototype.hasOwnProperty.call(c, "providerToolCallId") ? String(c.providerToolCallId || "").trim() : String(c.id || "").trim();
            return d ? { id: d } : {};
          })(),
          name: c.function.name,
          args: Hc(c.function.arguments)
        } }))]
      });
      continue;
    }
    r.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: vC(u.content)
    });
  }
  if (!r.length) return {
    history: [],
    latestMessage: Vc().parts
  };
  const s = r[r.length - 1];
  return s.role === "user" && s.parts?.length ? {
    history: r.slice(0, -1),
    latestMessage: s.parts
  } : {
    history: r,
    latestMessage: Vc().parts
  };
}
function LC(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Yc(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var UC = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.toolCallResponseSequence = 0, this.client = new yC({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e) {
    const t = $C(e.messages), n = Array.isArray(e.tools) ? e.tools : [], r = RC(e), o = {
      ...r ? { systemInstruction: r } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    if (e.reasoning?.enabled && (o.thinkingConfig = {
      includeThoughts: e.reasoning.includeOutput !== !1,
      thinkingLevel: PC(e.reasoning.effort)
    }), n.length && (o.tools = [{ functionDeclarations: n.map((s) => ({
      name: s.function.name,
      description: s.function.description,
      parameters: s.function.parameters
    })) }]), n.length) {
      const s = String(e.toolChoice || "auto").trim();
      o.toolConfig = { functionCallingConfig: s === "none" ? { mode: fn.NONE } : s === "auto" ? { mode: fn.AUTO } : s === "required" ? { mode: fn.ANY } : {
        mode: fn.ANY,
        allowedFunctionNames: [s]
      } };
    }
    return {
      createPayload: {
        model: this.config.model,
        history: t.history,
        config: o
      },
      sendPayload: { message: t.latestMessage }
    };
  }
  inspectRequest(e, t = {}) {
    const n = t.payload || this.buildChatPayload(e), r = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return Ir({
      provider: "google",
      model: this.config.model,
      transport: "google-genai-sdk",
      url: `${r}/models/${encodeURIComponent(this.config.model || "")}:generateContent`,
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
      effectiveConfig: zt(e, {
        enabled: !!n.createPayload.config?.thinkingConfig,
        effort: n.createPayload.config?.thinkingConfig?.thinkingLevel,
        includeOutput: n.createPayload.config?.thinkingConfig?.includeThoughts === !0
      })
    });
  }
  inspectSendRequest(e, t) {
    const n = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return Ir({
      provider: "google",
      model: this.config.model,
      transport: "google-genai-sdk",
      url: `${n}/models/${encodeURIComponent(this.config.model || "")}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.config.apiKey || ""
      },
      body: {
        sendMessage: e,
        stream: typeof t.onStreamProgress == "function"
      },
      sdk: typeof t.onStreamProgress == "function" ? "activeChat.sendMessageStream" : "activeChat.sendMessage",
      effectiveConfig: zt(t, {
        enabled: !!this.sessionConfig?.thinkingConfig,
        effort: this.sessionConfig?.thinkingConfig?.thinkingLevel,
        includeOutput: this.sessionConfig?.thinkingConfig?.includeThoughts === !0
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
    let r, o, s, a = [];
    const u = `google-tool-${++this.toolCallResponseSequence}`, c = IC(u);
    let d = null;
    const h = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, f = {
      ...t,
      ...h ? { config: h } : {}
    }, p = typeof n.onStreamProgress == "function", m = Zh(e).length;
    if (p) {
      const v = await e.sendMessageStream(f), w = /* @__PURE__ */ new Map();
      let b = "", P = null;
      const x = [];
      for await (const $ of v) {
        P = $;
        const S = $?.candidates?.[0]?.content;
        S?.parts?.length && x.push(S), n.reasoning?.includeOutput !== !1 && zc($).forEach((R, k) => {
          const H = `${R.label}:${k}`;
          w.set(H, Yc(w.get(H) || "", R.text));
        }), a = c.append($);
        const O = Kc($);
        b = Yc(b, O), LC(n, {
          text: b,
          thoughts: Array.from(w.values()).filter(Boolean).map((R, k) => ({
            label: `思考块 ${k + 1}`,
            text: R
          })),
          ...a.length ? {
            toolCalls: a,
            toolCallDraft: !0
          } : {}
        });
      }
      r = {
        ...P || {},
        functionCalls: a
      }, d = EC(x, b) || r?.candidates?.[0]?.content || null, o = Array.from(w.values()).filter(Boolean).map(($, S) => ({
        label: `思考块 ${S + 1}`,
        text: $
      })), s = b;
    } else
      r = await e.sendMessage(f), o = n.reasoning?.includeOutput === !1 ? [] : zc(r), s = Kc(r);
    const y = p ? a : CC(r, u), _ = DC(e, m);
    return {
      text: s,
      toolCalls: y,
      thoughts: o,
      finishReason: r.candidates?.[0]?.finishReason || "STOP",
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: ga(_) || kC(d) || NC(r)
    };
  }
  async chat(e) {
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: bC(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, r, e),
        requestInspection: this.inspectSendRequest(r, e)
      };
    }
    const t = String(e.finalAnswerReminderText || "").trim();
    if (t) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: [Jt(t)] };
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
function C(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var jh = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return jh = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function Ri(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var xi = (e) => {
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
}, B = class extends Error {
}, ye = class Mi extends B {
  constructor(t, n, r, o) {
    super(`${Mi.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("x-request-id"), this.error = n;
    const s = n;
    this.code = s?.code, this.param = s?.param, this.type = s?.type;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new ds({
      message: r,
      cause: xi(n)
    });
    const s = n?.error;
    return t === 400 ? new ep(t, s, r, o) : t === 401 ? new tp(t, s, r, o) : t === 403 ? new np(t, s, r, o) : t === 404 ? new rp(t, s, r, o) : t === 409 ? new op(t, s, r, o) : t === 422 ? new sp(t, s, r, o) : t === 429 ? new ip(t, s, r, o) : t >= 500 ? new ap(t, s, r, o) : new Mi(t, s, r, o);
  }
}, Ke = class extends ye {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, ds = class extends ye {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, ya = class extends ds {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, ep = class extends ye {
}, tp = class extends ye {
}, np = class extends ye {
}, rp = class extends ye {
}, op = class extends ye {
}, sp = class extends ye {
}, ip = class extends ye {
}, ap = class extends ye {
}, lp = class extends B {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, up = class extends B {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, or = class extends Error {
  constructor(e) {
    super(e);
  }
}, cp = class extends ye {
  constructor(e, t, n) {
    let r = "OAuth2 authentication error", o;
    if (t && typeof t == "object") {
      const s = t;
      o = s.error;
      const a = s.error_description;
      a && typeof a == "string" ? r = a : o && (r = o);
    }
    super(e, t, r, n), this.error_code = o;
  }
}, FC = class extends B {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, OC = /^[a-z][a-z0-9+.-]*:/i, qC = (e) => OC.test(e), Ce = (e) => (Ce = Array.isArray, Ce(e)), Xc = Ce;
function _a(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Qc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function BC(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Js(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var GC = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new B(`${e} must be an integer`);
  if (t < 0) throw new B(`${e} must be a positive integer`);
  return t;
}, HC = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Fr = (e) => new Promise((t) => setTimeout(t, e)), an = "6.44.0", VC = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function JC() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var KC = () => {
  const e = JC();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": an,
    "X-Stainless-OS": jc(Deno.build.os),
    "X-Stainless-Arch": Zc(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": an,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": an,
    "X-Stainless-OS": jc(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Zc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = WC();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": an,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": an,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function WC() {
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
var Zc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", jc = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), ed, zC = () => ed ?? (ed = KC());
function dp() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function fp(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function hp(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return fp({
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
function pp(e) {
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
async function td(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var YC = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), mp = "RFC3986", gp = (e) => String(e), nd = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: gp
};
var Ni = (e, t) => (Ni = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Ni(e, t)), st = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), Ks = 1024, XC = (e, t, n, r, o) => {
  if (e.length === 0) return e;
  let s = e;
  if (typeof e == "symbol" ? s = Symbol.prototype.toString.call(e) : typeof e != "string" && (s = String(e)), n === "iso-8859-1") return escape(s).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < s.length; u += Ks) {
    const c = s.length >= Ks ? s.slice(u, u + Ks) : s, d = [];
    for (let h = 0; h < c.length; ++h) {
      let f = c.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || o === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(h);
        continue;
      }
      if (f < 128) {
        d[d.length] = st[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = st[192 | f >> 6] + st[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = st[224 | f >> 12] + st[128 | f >> 6 & 63] + st[128 | f & 63];
        continue;
      }
      h += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(h) & 1023), d[d.length] = st[240 | f >> 18] + st[128 | f >> 12 & 63] + st[128 | f >> 6 & 63] + st[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function QC(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function rd(e, t) {
  if (Ce(e)) {
    const n = [];
    for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
    return n;
  }
  return t(e);
}
var yp = {
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
}, _p = function(e, t) {
  Array.prototype.push.apply(e, Ce(t) ? t : [t]);
}, od, ue = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: XC,
  encodeValuesOnly: !1,
  format: mp,
  formatter: gp,
  indices: !1,
  serializeDate(e) {
    return (od ?? (od = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function ZC(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var Ws = {};
function vp(e, t, n, r, o, s, a, u, c, d, h, f, p, m, y, _, v, w) {
  let b = e, P = w, x = 0, $ = !1;
  for (; (P = P.get(Ws)) !== void 0 && !$; ) {
    const H = P.get(e);
    if (x += 1, typeof H < "u") {
      if (H === x) throw new RangeError("Cyclic object value");
      $ = !0;
    }
    typeof P.get(Ws) > "u" && (x = 0);
  }
  if (typeof d == "function" ? b = d(t, b) : b instanceof Date ? b = p?.(b) : n === "comma" && Ce(b) && (b = rd(b, function(H) {
    return H instanceof Date ? p?.(H) : H;
  })), b === null) {
    if (s) return c && !_ ? c(t, ue.encoder, v, "key", m) : t;
    b = "";
  }
  if (ZC(b) || QC(b)) {
    if (c) {
      const H = _ ? t : c(t, ue.encoder, v, "key", m);
      return [y?.(H) + "=" + y?.(c(b, ue.encoder, v, "value", m))];
    }
    return [y?.(t) + "=" + y?.(String(b))];
  }
  const S = [];
  if (typeof b > "u") return S;
  let O;
  if (n === "comma" && Ce(b))
    _ && c && (b = rd(b, c)), O = [{ value: b.length > 0 ? b.join(",") || null : void 0 }];
  else if (Ce(d)) O = d;
  else {
    const H = Object.keys(b);
    O = h ? H.sort(h) : H;
  }
  const R = u ? String(t).replace(/\./g, "%2E") : String(t), k = r && Ce(b) && b.length === 1 ? R + "[]" : R;
  if (o && Ce(b) && b.length === 0) return k + "[]";
  for (let H = 0; H < O.length; ++H) {
    const z = O[H], se = typeof z == "object" && typeof z.value < "u" ? z.value : b[z];
    if (a && se === null) continue;
    const j = f && u ? z.replace(/\./g, "%2E") : z, Q = Ce(b) ? typeof n == "function" ? n(k, j) : k : k + (f ? "." + j : "[" + j + "]");
    w.set(e, x);
    const X = /* @__PURE__ */ new WeakMap();
    X.set(Ws, w), _p(S, vp(se, Q, n, r, o, s, a, u, n === "comma" && _ && Ce(b) ? null : c, d, h, f, p, m, y, _, v, X));
  }
  return S;
}
function jC(e = ue) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || ue.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = mp;
  if (typeof e.format < "u") {
    if (!Ni(nd, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const r = nd[n];
  let o = ue.filter;
  (typeof e.filter == "function" || Ce(e.filter)) && (o = e.filter);
  let s;
  if (e.arrayFormat && e.arrayFormat in yp ? s = e.arrayFormat : "indices" in e ? s = e.indices ? "indices" : "repeat" : s = ue.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : ue.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : ue.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : ue.allowEmptyArrays,
    arrayFormat: s,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : ue.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? ue.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : ue.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : ue.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : ue.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : ue.encodeValuesOnly,
    filter: o,
    format: n,
    formatter: r,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : ue.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : ue.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : ue.strictNullHandling
  };
}
function eI(e, t = {}) {
  let n = e;
  const r = jC(t);
  let o, s;
  typeof r.filter == "function" ? (s = r.filter, n = s("", n)) : Ce(r.filter) && (s = r.filter, o = s);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = yp[r.arrayFormat], c = u === "comma" && r.commaRoundTrip;
  o || (o = Object.keys(n)), r.sort && o.sort(r.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < o.length; ++p) {
    const m = o[p];
    r.skipNulls && n[m] === null || _p(a, vp(n[m], m, u, c, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, d));
  }
  const h = a.join(r.delimiter);
  let f = r.addQueryPrefix === !0 ? "?" : "";
  return r.charsetSentinel && (r.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function tI(e) {
  return eI(e, { arrayFormat: "brackets" });
}
function nI(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var sd;
function va(e) {
  let t;
  return (sd ?? (t = new globalThis.TextEncoder(), sd = t.encode.bind(t)))(e);
}
var id;
function ad(e) {
  let t;
  return (id ?? (t = new globalThis.TextDecoder(), id = t.decode.bind(t)))(e);
}
var Ne, ke, fs = class {
  constructor() {
    Ne.set(this, void 0), ke.set(this, void 0), V(this, Ne, new Uint8Array(), "f"), V(this, ke, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? va(e) : e;
    V(this, Ne, nI([C(this, Ne, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = rI(C(this, Ne, "f"), C(this, ke, "f"))) != null; ) {
      if (r.carriage && C(this, ke, "f") == null) {
        V(this, ke, r.index, "f");
        continue;
      }
      if (C(this, ke, "f") != null && (r.index !== C(this, ke, "f") + 1 || r.carriage)) {
        n.push(ad(C(this, Ne, "f").subarray(0, C(this, ke, "f") - 1))), V(this, Ne, C(this, Ne, "f").subarray(C(this, ke, "f")), "f"), V(this, ke, null, "f");
        continue;
      }
      const o = C(this, ke, "f") !== null ? r.preceding - 1 : r.preceding, s = ad(C(this, Ne, "f").subarray(0, o));
      n.push(s), V(this, Ne, C(this, Ne, "f").subarray(r.index), "f"), V(this, ke, null, "f");
    }
    return n;
  }
  flush() {
    return C(this, Ne, "f").length ? this.decode(`
`) : [];
  }
};
Ne = /* @__PURE__ */ new WeakMap(), ke = /* @__PURE__ */ new WeakMap();
fs.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
fs.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function rI(e, t) {
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
function oI(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var Vo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, ld = (e, t, n) => {
  if (e) {
    if (BC(Vo, e)) return e;
    pe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Vo))}`);
  }
};
function sr() {
}
function fo(e, t, n) {
  return !t || Vo[e] > Vo[n] ? sr : t[e].bind(t);
}
var sI = {
  error: sr,
  warn: sr,
  info: sr,
  debug: sr
}, ud = /* @__PURE__ */ new WeakMap();
function pe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return sI;
  const r = ud.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: fo("error", t, n),
    warn: fo("warn", t, n),
    info: fo("info", t, n),
    debug: fo("debug", t, n)
  };
  return ud.set(t, [n, o]), o;
}
var qt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Qn, br = class ir {
  constructor(t, n, r) {
    this.iterator = t, Qn.set(this, void 0), this.controller = n, V(this, Qn, r, "f");
  }
  static fromSSEResponse(t, n, r, o) {
    let s = !1;
    const a = r ? pe(r) : console;
    async function* u() {
      if (s) throw new B("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let c = !1;
      try {
        for await (const d of iI(t, n))
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
              if (h && h.error) throw new ye(void 0, h.error, void 0, t.headers);
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
              if (d.event == "error") throw new ye(void 0, h.error, h.message, void 0);
              yield {
                event: d.event,
                data: h
              };
            }
          }
        c = !0;
      } catch (d) {
        if (Ri(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new ir(u, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* s() {
      const u = new fs(), c = pp(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (o) throw new B("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of s())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Ri(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new ir(a, n, r);
  }
  [(Qn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], r = this.iterator(), o = (s) => ({ next: () => {
      if (s.length === 0) {
        const a = r.next();
        t.push(a), n.push(a);
      }
      return s.shift();
    } });
    return [new ir(() => o(t), this.controller, C(this, Qn, "f")), new ir(() => o(n), this.controller, C(this, Qn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return fp({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: s } = await n.next();
          if (s) return r.close();
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
async function* iI(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new B("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new B("Attempted to iterate over a response with no body");
  const n = new lI(), r = new fs(), o = pp(e.body);
  for await (const s of aI(o)) for (const a of r.decode(s)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const s of r.flush()) {
    const a = n.decode(s);
    a && (yield a);
  }
}
async function* aI(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? va(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let s;
    for (; (s = oI(t)) !== -1; )
      yield t.slice(0, s), t = t.slice(s);
  }
  t.length > 0 && (yield t);
}
var lI = class {
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
    let [t, n, r] = uI(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function uI(e, t) {
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
async function Ap(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: s } = t, a = await (async () => {
    if (t.options.stream)
      return pe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : br.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Sp(await n.json(), n) : await n.text();
  })();
  return pe(e).debug(`[${r}] response parsed`, qt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - s
  })), a;
}
function Sp(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var ar, Tp = class Ep extends Promise {
  constructor(t, n, r = Ap) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, ar.set(this, void 0), V(this, ar, t, "f");
  }
  _thenUnwrap(t) {
    return new Ep(C(this, ar, "f"), this.responsePromise, async (n, r) => Sp(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(C(this, ar, "f"), t))), this.parsedPromise;
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
ar = /* @__PURE__ */ new WeakMap();
var ho, hs = class {
  constructor(e, t, n, r) {
    ho.set(this, void 0), V(this, ho, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new B("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await C(this, ho, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(ho = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, cI = class extends Tp {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await Ap(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, kt = class extends hs {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, te = class extends hs {
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
        ..._a(this.options.query),
        after: t
      }
    } : null;
  }
}, ge = class extends hs {
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
        ..._a(this.options.query),
        after: e
      }
    } : null;
  }
}, Et = class extends hs {
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
        ..._a(this.options.query),
        after: e
      }
    } : null;
  }
}, dI = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, fI = "urn:ietf:params:oauth:grant-type:token-exchange", hI = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? dp();
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
      grant_type: fI,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: dI[this.config.provider.tokenType],
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
      const s = await t.text();
      let a;
      try {
        a = JSON.parse(s);
      } catch {
      }
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new cp(t.status, a, t.headers) : ye.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
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
}, wp = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function yr(e, t, n) {
  return wp(), new File(e, t ?? "unknown_file", n);
}
function Io(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Aa = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", ps = async (e, t) => ki(e.body) ? {
  ...e,
  body: await Cp(e.body, t)
} : e, lt = async (e, t) => ({
  ...e,
  body: await Cp(e.body, t)
}), cd = /* @__PURE__ */ new WeakMap();
function pI(e) {
  const t = typeof e == "function" ? e : e.fetch, n = cd.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, s = new FormData();
      return s.toString() !== await new o(s).text();
    } catch {
      return !0;
    }
  })();
  return cd.set(t, r), r;
}
var Cp = async (e, t) => {
  if (!await pI(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, o]) => Di(n, r, o))), n;
}, Ip = (e) => e instanceof Blob && "name" in e, mI = (e) => typeof e == "object" && e !== null && (e instanceof Response || Aa(e) || Ip(e)), ki = (e) => {
  if (mI(e)) return !0;
  if (Array.isArray(e)) return e.some(ki);
  if (e && typeof e == "object") {
    for (const t in e) if (ki(e[t])) return !0;
  }
  return !1;
}, Di = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, yr([await n.blob()], Io(n)));
    else if (Aa(n)) e.append(t, yr([await new Response(hp(n)).blob()], Io(n)));
    else if (Ip(n)) e.append(t, n, Io(n));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Di(e, t + "[]", r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, o]) => Di(e, `${t}[${r}]`, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, bp = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", gI = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && bp(e), yI = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function _I(e, t, n) {
  if (wp(), e = await e, gI(e))
    return e instanceof File ? e : yr([await e.arrayBuffer()], e.name);
  if (yI(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), yr(await $i(o), t, n);
  }
  const r = await $i(e);
  if (t || (t = Io(e)), !n?.type) {
    const o = r.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return yr(r, t, n);
}
async function $i(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (bp(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Aa(e)) for await (const n of e) t.push(...await $i(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${vI(e)}`);
  }
  return t;
}
function vI(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var N = class {
  constructor(e) {
    this._client = e;
  }
};
function Pp(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var dd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), AI = (e = Pp) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const s = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let y = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? dd) ?? dd)?.toString) && (y = m + "", s.push({
      start: h.length + f.length,
      length: y.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : y);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) s.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (s.sort((h, f) => h.start - f.start), s.length > 0) {
    let h = 0;
    const f = s.reduce((p, m) => {
      const y = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + y + _;
    }, "");
    throw new B(`Path parameters result in path with invalid segments:
${s.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, A = /* @__PURE__ */ AI(Pp), Rp = class extends N {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/chat/completions/${e}/messages`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function Jo(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Sa(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function Or(e) {
  return e?.$brand === "auto-parseable-tool";
}
function SI(e, t) {
  return !t || !xp(t) ? {
    ...e,
    choices: e.choices.map((n) => (Mp(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : Ta(e, t);
}
function Ta(e, t) {
  const n = e.choices.map((r) => {
    if (r.finish_reason === "length") throw new lp();
    if (r.finish_reason === "content_filter") throw new up();
    return Mp(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        ...r.message.tool_calls ? { tool_calls: r.message.tool_calls?.map((o) => EI(t, o)) ?? void 0 } : void 0,
        parsed: r.message.content && !r.message.refusal ? TI(t, r.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function TI(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function EI(e, t) {
  const n = e.tools?.find((r) => Jo(r) && r.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: Or(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function wI(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((r) => Jo(r) && r.function?.name === t.function.name);
  return Jo(n) && (Or(n) || n?.function.strict || !1);
}
function xp(e) {
  return Sa(e.response_format) ? !0 : e.tools?.some((t) => Or(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function Mp(e) {
  for (const t of e || []) if (t.type !== "function") throw new B(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function CI(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new B(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new B(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Ko = (e) => e?.role === "assistant", Np = (e) => e?.role === "tool", Li, bo, Po, lr, ur, Ro, cr, pt, dr, Wo, zo, ln, kp, Ea = class {
  constructor() {
    Li.add(this), this.controller = new AbortController(), bo.set(this, void 0), Po.set(this, () => {
    }), lr.set(this, () => {
    }), ur.set(this, void 0), Ro.set(this, () => {
    }), cr.set(this, () => {
    }), pt.set(this, {}), dr.set(this, !1), Wo.set(this, !1), zo.set(this, !1), ln.set(this, !1), V(this, bo, new Promise((e, t) => {
      V(this, Po, e, "f"), V(this, lr, t, "f");
    }), "f"), V(this, ur, new Promise((e, t) => {
      V(this, Ro, e, "f"), V(this, cr, t, "f");
    }), "f"), C(this, bo, "f").catch(() => {
    }), C(this, ur, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, C(this, Li, "m", kp).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (C(this, Po, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return C(this, dr, "f");
  }
  get errored() {
    return C(this, Wo, "f");
  }
  get aborted() {
    return C(this, zo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (C(this, pt, "f")[e] || (C(this, pt, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = C(this, pt, "f")[e];
    if (!n) return this;
    const r = n.findIndex((o) => o.listener === t);
    return r >= 0 && n.splice(r, 1), this;
  }
  once(e, t) {
    return (C(this, pt, "f")[e] || (C(this, pt, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      V(this, ln, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    V(this, ln, !0, "f"), await C(this, ur, "f");
  }
  _emit(e, ...t) {
    if (C(this, dr, "f")) return;
    e === "end" && (V(this, dr, !0, "f"), C(this, Ro, "f").call(this));
    const n = C(this, pt, "f")[e];
    if (n && (C(this, pt, "f")[e] = n.filter((r) => !r.once), n.forEach(({ listener: r }) => r(...t))), e === "abort") {
      const r = t[0];
      !C(this, ln, "f") && !n?.length && Promise.reject(r), C(this, lr, "f").call(this, r), C(this, cr, "f").call(this, r), this._emit("end");
      return;
    }
    if (e === "error") {
      const r = t[0];
      !C(this, ln, "f") && !n?.length && Promise.reject(r), C(this, lr, "f").call(this, r), C(this, cr, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
bo = /* @__PURE__ */ new WeakMap(), Po = /* @__PURE__ */ new WeakMap(), lr = /* @__PURE__ */ new WeakMap(), ur = /* @__PURE__ */ new WeakMap(), Ro = /* @__PURE__ */ new WeakMap(), cr = /* @__PURE__ */ new WeakMap(), pt = /* @__PURE__ */ new WeakMap(), dr = /* @__PURE__ */ new WeakMap(), Wo = /* @__PURE__ */ new WeakMap(), zo = /* @__PURE__ */ new WeakMap(), ln = /* @__PURE__ */ new WeakMap(), Li = /* @__PURE__ */ new WeakSet(), kp = function(t) {
  if (V(this, Wo, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Ke()), t instanceof Ke)
    return V(this, zo, !0, "f"), this._emit("abort", t);
  if (t instanceof B) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new B(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new B(String(t)));
};
function II(e) {
  return typeof e.parse == "function";
}
var ve, Ui, Yo, Fi, Oi, qi, Dp, $p, bI = 10, Lp = class extends Ea {
  constructor() {
    super(...arguments), ve.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), Np(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (Ko(e) && e.tool_calls)
        for (const n of e.tool_calls) n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e) throw new B("stream ended without producing a ChatCompletion");
    return e;
  }
  async finalContent() {
    return await this.done(), C(this, ve, "m", Ui).call(this);
  }
  async finalMessage() {
    return await this.done(), C(this, ve, "m", Yo).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), C(this, ve, "m", Fi).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), C(this, ve, "m", Oi).call(this);
  }
  async totalUsage() {
    return await this.done(), C(this, ve, "m", qi).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = C(this, ve, "m", Yo).call(this);
    t && this._emit("finalMessage", t);
    const n = C(this, ve, "m", Ui).call(this);
    n && this._emit("finalContent", n);
    const r = C(this, ve, "m", Fi).call(this);
    r && this._emit("finalFunctionToolCall", r);
    const o = C(this, ve, "m", Oi).call(this);
    o != null && this._emit("finalFunctionToolCallResult", o), this._chatCompletions.some((s) => s.usage) && this._emit("totalUsage", C(this, ve, "m", qi).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), C(this, ve, "m", Dp).call(this, t);
    const o = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(Ta(o, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const r of t.messages) this._addMessage(r, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const r = "tool", { tool_choice: o = "auto", stream: s, ...a } = t, u = typeof o != "string" && o.type === "function" && o?.function?.name, { maxChatCompletions: c = bI } = n || {}, d = t.tools.map((p) => {
      if (Or(p)) {
        if (!p.$callback) throw new B("Tool given to `.runTools()` that does not have an associated function");
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
      if (!m) throw new B("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const y of m.tool_calls) {
        if (y.type !== "function") continue;
        const _ = y.id, { name: v, arguments: w } = y.function, b = h[v];
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
        let P;
        try {
          P = II(b) ? await b.parse(w) : w;
        } catch (S) {
          const O = S instanceof Error ? S.message : String(S);
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: O
          });
          continue;
        }
        const x = await b.function(P, this), $ = C(this, ve, "m", $p).call(this, x);
        if (this._addMessage({
          role: r,
          tool_call_id: _,
          content: $
        }), u) return;
      }
    }
  }
};
ve = /* @__PURE__ */ new WeakSet(), Ui = function() {
  return C(this, ve, "m", Yo).call(this).content ?? null;
}, Yo = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (Ko(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new B("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Fi = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Ko(n) && n?.tool_calls?.length) for (let r = n.tool_calls.length - 1; r >= 0; r--) {
      const o = n.tool_calls[r];
      if (o?.type === "function") return o.function;
    }
  }
}, Oi = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Np(n) && n.content != null && typeof n.content == "string" && this.messages.some((r) => r.role === "assistant" && r.tool_calls?.some((o) => o.type === "function" && o.id === n.tool_call_id))) return n.content;
  }
}, qi = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, Dp = function(t) {
  if (t.n != null && t.n > 1) throw new B("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, $p = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var PI = class Up extends Lp {
  static runTools(t, n, r) {
    const o = new Up(), s = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, s)), o;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), Ko(t) && t.content && this._emit("content", t.content);
  }
}, de = {
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
}, RI = class extends Error {
}, xI = class extends Error {
};
function MI(e, t = de.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return NI(e.trim(), t);
}
var NI = (e, t) => {
  const n = e.length;
  let r = 0;
  const o = (p) => {
    throw new RI(`${p} at position ${r}`);
  }, s = (p) => {
    throw new xI(`${p} at position ${r}`);
  }, a = () => (f(), r >= n && o("Unexpected end of input"), e[r] === '"' ? u() : e[r] === "{" ? c() : e[r] === "[" ? d() : e.substring(r, r + 4) === "null" || de.NULL & t && n - r < 4 && "null".startsWith(e.substring(r)) ? (r += 4, null) : e.substring(r, r + 4) === "true" || de.BOOL & t && n - r < 4 && "true".startsWith(e.substring(r)) ? (r += 4, !0) : e.substring(r, r + 5) === "false" || de.BOOL & t && n - r < 5 && "false".startsWith(e.substring(r)) ? (r += 5, !1) : e.substring(r, r + 8) === "Infinity" || de.INFINITY & t && n - r < 8 && "Infinity".startsWith(e.substring(r)) ? (r += 8, 1 / 0) : e.substring(r, r + 9) === "-Infinity" || de.MINUS_INFINITY & t && 1 < n - r && n - r < 9 && "-Infinity".startsWith(e.substring(r)) ? (r += 9, -1 / 0) : e.substring(r, r + 3) === "NaN" || de.NAN & t && n - r < 3 && "NaN".startsWith(e.substring(r)) ? (r += 3, NaN) : h()), u = () => {
    const p = r;
    let m = !1;
    for (r++; r < n && (e[r] !== '"' || m && e[r - 1] === "\\"); )
      m = e[r] === "\\" ? !m : !1, r++;
    if (e.charAt(r) == '"') try {
      return JSON.parse(e.substring(p, ++r - Number(m)));
    } catch (y) {
      s(String(y));
    }
    else if (de.STR & t) try {
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
        if (f(), r >= n && de.OBJ & t) return p;
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
          if (de.OBJ & t) return p;
          throw y;
        }
        f(), e[r] === "," && r++;
      }
    } catch {
      if (de.OBJ & t) return p;
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
      if (de.ARR & t) return p;
      o("Expected ']' at end of array");
    }
    return r++, p;
  }, h = () => {
    if (r === 0) {
      e === "-" && de.NUM & t && o("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (de.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        s(String(m));
      }
    }
    const p = r;
    for (e[r] === "-" && r++; e[r] && !",]}".includes(e[r]); ) r++;
    r == n && !(de.NUM & t) && o("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, r));
    } catch {
      e.substring(p, r) === "-" && de.NUM & t && o("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(p, e.lastIndexOf("e")));
      } catch (y) {
        s(String(y));
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
}, fd = (e) => MI(e, de.ALL ^ de.NUM), ae, ht, tn, bt, zs, po, Ys, Xs, Qs, mo, Zs, hd, Fp = class Bi extends Lp {
  constructor(t) {
    super(), ae.add(this), ht.set(this, void 0), tn.set(this, void 0), bt.set(this, void 0), V(this, ht, t, "f"), V(this, tn, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return C(this, bt, "f");
  }
  static fromReadableStream(t) {
    const n = new Bi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, r) {
    const o = new Bi(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), C(this, ae, "m", zs).call(this);
    const s = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of s) C(this, ae, "m", Ys).call(this, a);
    if (s.controller.signal?.aborted) throw new Ke();
    return this._addChatCompletion(C(this, ae, "m", mo).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), C(this, ae, "m", zs).call(this), this._connected();
    const o = br.fromReadableStream(t, this.controller);
    let s;
    for await (const a of o)
      s && s !== a.id && this._addChatCompletion(C(this, ae, "m", mo).call(this)), C(this, ae, "m", Ys).call(this, a), s = a.id;
    if (o.controller.signal?.aborted) throw new Ke();
    return this._addChatCompletion(C(this, ae, "m", mo).call(this));
  }
  [(ht = /* @__PURE__ */ new WeakMap(), tn = /* @__PURE__ */ new WeakMap(), bt = /* @__PURE__ */ new WeakMap(), ae = /* @__PURE__ */ new WeakSet(), zs = function() {
    this.ended || V(this, bt, void 0, "f");
  }, po = function(n) {
    let r = C(this, tn, "f")[n.index];
    return r || (r = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, C(this, tn, "f")[n.index] = r, r);
  }, Ys = function(n) {
    if (this.ended) return;
    const r = C(this, ae, "m", hd).call(this, n);
    this._emit("chunk", n, r);
    for (const o of n.choices) {
      const s = r.choices[o.index];
      o.delta.content != null && s.message?.role === "assistant" && s.message?.content && (this._emit("content", o.delta.content, s.message.content), this._emit("content.delta", {
        delta: o.delta.content,
        snapshot: s.message.content,
        parsed: s.message.parsed
      })), o.delta.refusal != null && s.message?.role === "assistant" && s.message?.refusal && this._emit("refusal.delta", {
        delta: o.delta.refusal,
        snapshot: s.message.refusal
      }), o.logprobs?.content != null && s.message?.role === "assistant" && this._emit("logprobs.content.delta", {
        content: o.logprobs?.content,
        snapshot: s.logprobs?.content ?? []
      }), o.logprobs?.refusal != null && s.message?.role === "assistant" && this._emit("logprobs.refusal.delta", {
        refusal: o.logprobs?.refusal,
        snapshot: s.logprobs?.refusal ?? []
      });
      const a = C(this, ae, "m", po).call(this, s);
      s.finish_reason && (C(this, ae, "m", Qs).call(this, s), a.current_tool_call_index != null && C(this, ae, "m", Xs).call(this, s, a.current_tool_call_index));
      for (const u of o.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (C(this, ae, "m", Qs).call(this, s), a.current_tool_call_index != null && C(this, ae, "m", Xs).call(this, s, a.current_tool_call_index)), a.current_tool_call_index = u.index;
      for (const u of o.delta.tool_calls ?? []) {
        const c = s.message.tool_calls?.[u.index];
        c?.type && (c?.type === "function" ? this._emit("tool_calls.function.arguments.delta", {
          name: c.function?.name,
          index: u.index,
          arguments: c.function.arguments,
          parsed_arguments: c.function.parsed_arguments,
          arguments_delta: u.function?.arguments ?? ""
        }) : c?.type);
      }
    }
  }, Xs = function(n, r) {
    if (C(this, ae, "m", po).call(this, n).done_tool_calls.has(r)) return;
    const o = n.message.tool_calls?.[r];
    if (!o) throw new Error("no tool call snapshot");
    if (!o.type) throw new Error("tool call snapshot missing `type`");
    if (o.type === "function") {
      const s = C(this, ht, "f")?.tools?.find((a) => Jo(a) && a.function.name === o.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: o.function.name,
        index: r,
        arguments: o.function.arguments,
        parsed_arguments: Or(s) ? s.$parseRaw(o.function.arguments) : s?.function.strict ? JSON.parse(o.function.arguments) : null
      });
    } else o.type;
  }, Qs = function(n) {
    const r = C(this, ae, "m", po).call(this, n);
    if (n.message.content && !r.content_done) {
      r.content_done = !0;
      const o = C(this, ae, "m", Zs).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: o ? o.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !r.refusal_done && (r.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !r.logprobs_content_done && (r.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !r.logprobs_refusal_done && (r.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, mo = function() {
    if (this.ended) throw new B("stream has ended, this shouldn't happen");
    const n = C(this, bt, "f");
    if (!n) throw new B("request ended without sending any chunks");
    return V(this, bt, void 0, "f"), V(this, tn, [], "f"), kI(n, C(this, ht, "f"));
  }, Zs = function() {
    const n = C(this, ht, "f")?.response_format;
    return Sa(n) ? n : null;
  }, hd = function(n) {
    var r, o, s, a;
    let u = C(this, bt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = V(this, bt, {
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
        const { content: S, refusal: O, ...R } = m;
        Object.assign(_.logprobs, R), S && ((r = _.logprobs).content ?? (r.content = []), _.logprobs.content.push(...S)), O && ((o = _.logprobs).refusal ?? (o.refusal = []), _.logprobs.refusal.push(...O));
      }
      if (f && (_.finish_reason = f, C(this, ht, "f") && xp(C(this, ht, "f")))) {
        if (f === "length") throw new lp();
        if (f === "content_filter") throw new up();
      }
      if (Object.assign(_, y), !h) continue;
      const { content: v, refusal: w, function_call: b, role: P, tool_calls: x, ...$ } = h;
      if (Object.assign(_.message, $), w && (_.message.refusal = (_.message.refusal || "") + w), P && (_.message.role = P), b && (_.message.function_call ? (b.name && (_.message.function_call.name = b.name), b.arguments && ((s = _.message.function_call).arguments ?? (s.arguments = ""), _.message.function_call.arguments += b.arguments)) : _.message.function_call = b), v && (_.message.content = (_.message.content || "") + v, !_.message.refusal && C(this, ae, "m", Zs).call(this) && (_.message.parsed = fd(_.message.content))), x) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: S, id: O, type: R, function: k, ...H } of x) {
          const z = (a = _.message.tool_calls)[S] ?? (a[S] = {});
          Object.assign(z, H), O && (z.id = O), R && (z.type = R), k && (z.function ?? (z.function = {
            name: k.name ?? "",
            arguments: ""
          })), k?.name && (z.function.name = k.name), k?.arguments && (z.function.arguments += k.arguments, wI(C(this, ht, "f"), z) && (z.function.parsed_arguments = fd(z.function.arguments)));
        }
      }
    }
    return u;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let r = !1;
    return this.on("chunk", (o) => {
      const s = n.shift();
      s ? s.resolve(o) : t.push(o);
    }), this.on("end", () => {
      r = !0;
      for (const o of n) o.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (o) => {
      r = !0;
      for (const s of n) s.reject(o);
      n.length = 0;
    }), this.on("error", (o) => {
      r = !0;
      for (const s of n) s.reject(o);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((o, s) => n.push({
        resolve: o,
        reject: s
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
    return new br(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function kI(e, t) {
  const { id: n, choices: r, created: o, model: s, system_fingerprint: a, ...u } = e;
  return SI({
    ...u,
    id: n,
    choices: r.map(({ message: c, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new B(`missing finish_reason for choice ${h}`);
      const { content: m = null, function_call: y, tool_calls: _, ...v } = c, w = c.role;
      if (!w) throw new B(`missing role for choice ${h}`);
      if (y) {
        const { arguments: b, name: P } = y;
        if (b == null) throw new B(`missing function_call.arguments for choice ${h}`);
        if (!P) throw new B(`missing function_call.name for choice ${h}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: b,
              name: P
            },
            role: w,
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
          role: w,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: _.map((b, P) => {
            const { function: x, type: $, id: S, ...O } = b, { arguments: R, name: k, ...H } = x || {};
            if (S == null) throw new B(`missing choices[${h}].tool_calls[${P}].id
${go(e)}`);
            if ($ == null) throw new B(`missing choices[${h}].tool_calls[${P}].type
${go(e)}`);
            if (k == null) throw new B(`missing choices[${h}].tool_calls[${P}].function.name
${go(e)}`);
            if (R == null) throw new B(`missing choices[${h}].tool_calls[${P}].function.arguments
${go(e)}`);
            return {
              ...O,
              id: S,
              type: $,
              function: {
                ...H,
                name: k,
                arguments: R
              }
            };
          })
        }
      } : {
        ...p,
        message: {
          ...v,
          content: m,
          role: w,
          refusal: c.refusal ?? null
        },
        finish_reason: d,
        index: h,
        logprobs: f
      };
    }),
    created: o,
    model: s,
    object: "chat.completion",
    ...a ? { system_fingerprint: a } : {}
  }, t);
}
function go(e) {
  return JSON.stringify(e);
}
var DI = class Gi extends Fp {
  static fromReadableStream(t) {
    const n = new Gi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, r) {
    const o = new Gi(n), s = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, s)), o;
  }
}, wa = class extends N {
  constructor() {
    super(...arguments), this.messages = new Rp(this._client);
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
    return this._client.get(A`/chat/completions/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/chat/completions/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chat/completions", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/chat/completions/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return CI(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => Ta(n, e));
  }
  runTools(e, t) {
    return e.stream ? DI.runTools(this._client, e, t) : PI.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Fp.createChatCompletion(this._client, e, t);
  }
};
wa.Messages = Rp;
var Ca = class extends N {
  constructor() {
    super(...arguments), this.completions = new wa(this._client);
  }
};
Ca.Completions = wa;
var Op = class extends N {
  create(e, t) {
    return this._client.post("/organization/admin_api_keys", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/organization/admin_api_keys/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/admin_api_keys", te, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/organization/admin_api_keys/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, qp = class extends N {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", ge, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Bp = class extends N {
  create(e, t) {
    return this._client.post("/organization/certificates", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(A`/organization/certificates/${e}`, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/organization/certificates/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/certificates", ge, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/organization/certificates/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t) {
    return this._client.getAPIList("/organization/certificates/activate", kt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", kt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Gp = class extends N {
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
}, Hp = class extends N {
  create(e, t) {
    return this._client.post("/organization/invites", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/organization/invites/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/invites", ge, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/organization/invites/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Vp = class extends N {
  create(e, t) {
    return this._client.post("/organization/roles", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/organization/roles/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/organization/roles/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/roles", Et, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/organization/roles/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Jp = class extends N {
  create(e, t) {
    return this._client.post("/organization/spend_alerts", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/organization/spend_alerts/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/organization/spend_alerts/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/spend_alerts", ge, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/organization/spend_alerts/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Kp = class extends N {
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
}, Wp = class extends N {
  create(e, t, n) {
    return this._client.post(A`/organization/groups/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { group_id: r } = t;
    return this._client.get(A`/organization/groups/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/groups/${e}/roles`, Et, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { group_id: r } = t;
    return this._client.delete(A`/organization/groups/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, zp = class extends N {
  create(e, t, n) {
    return this._client.post(A`/organization/groups/${e}/users`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { group_id: r } = t;
    return this._client.get(A`/organization/groups/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/groups/${e}/users`, Et, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { group_id: r } = t;
    return this._client.delete(A`/organization/groups/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, ms = class extends N {
  constructor() {
    super(...arguments), this.users = new zp(this._client), this.roles = new Wp(this._client);
  }
  create(e, t) {
    return this._client.post("/organization/groups", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/organization/groups/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/organization/groups/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/groups", Et, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/organization/groups/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
ms.Users = zp;
ms.Roles = Wp;
var Yp = class extends N {
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(A`/organization/projects/${r}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/api_keys`, ge, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(A`/organization/projects/${r}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Xp = class extends N {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/certificates`, ge, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/certificates/activate`, kt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/certificates/deactivate`, kt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Qp = class extends N {
  retrieve(e, t) {
    return this._client.get(A`/organization/projects/${e}/data_retention`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/organization/projects/${e}/data_retention`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Zp = class extends N {
  retrieve(e, t) {
    return this._client.get(A`/organization/projects/${e}/hosted_tool_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/organization/projects/${e}/hosted_tool_permissions`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, jp = class extends N {
  retrieve(e, t) {
    return this._client.get(A`/organization/projects/${e}/model_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/organization/projects/${e}/model_permissions`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/organization/projects/${e}/model_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, em = class extends N {
  listRateLimits(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/rate_limits`, ge, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  updateRateLimit(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(A`/organization/projects/${r}/rate_limits/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, tm = class extends N {
  create(e, t, n) {
    return this._client.post(A`/projects/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(A`/projects/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(A`/projects/${r}/roles/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/projects/${e}/roles`, Et, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(A`/projects/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, nm = class extends N {
  create(e, t, n) {
    return this._client.post(A`/organization/projects/${e}/service_accounts`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(A`/organization/projects/${r}/service_accounts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(A`/organization/projects/${r}/service_accounts/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/service_accounts`, ge, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(A`/organization/projects/${r}/service_accounts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, rm = class extends N {
  create(e, t, n) {
    return this._client.post(A`/organization/projects/${e}/spend_alerts`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(A`/organization/projects/${r}/spend_alerts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(A`/organization/projects/${r}/spend_alerts/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/spend_alerts`, ge, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(A`/organization/projects/${r}/spend_alerts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, om = class extends N {
  create(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(A`/projects/${r}/groups/${e}/roles`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r, group_id: o } = t;
    return this._client.get(A`/projects/${r}/groups/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.getAPIList(A`/projects/${r}/groups/${e}/roles`, Et, {
      query: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r, group_id: o } = t;
    return this._client.delete(A`/projects/${r}/groups/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ia = class extends N {
  constructor() {
    super(...arguments), this.roles = new om(this._client);
  }
  create(e, t, n) {
    return this._client.post(A`/organization/projects/${e}/groups`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.get(A`/organization/projects/${r}/groups/${e}`, {
      query: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/groups`, Et, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(A`/organization/projects/${r}/groups/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Ia.Roles = om;
var sm = class extends N {
  create(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(A`/projects/${r}/users/${e}/roles`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r, user_id: o } = t;
    return this._client.get(A`/projects/${r}/users/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.getAPIList(A`/projects/${r}/users/${e}/roles`, Et, {
      query: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r, user_id: o } = t;
    return this._client.delete(A`/projects/${r}/users/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, ba = class extends N {
  constructor() {
    super(...arguments), this.roles = new sm(this._client);
  }
  create(e, t, n) {
    return this._client.post(A`/organization/projects/${e}/users`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(A`/organization/projects/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(A`/organization/projects/${r}/users/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/users`, ge, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(A`/organization/projects/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
ba.Roles = sm;
var Fe = class extends N {
  constructor() {
    super(...arguments), this.users = new ba(this._client), this.serviceAccounts = new nm(this._client), this.apiKeys = new Yp(this._client), this.rateLimits = new em(this._client), this.modelPermissions = new jp(this._client), this.hostedToolPermissions = new Zp(this._client), this.groups = new Ia(this._client), this.roles = new tm(this._client), this.dataRetention = new Qp(this._client), this.spendAlerts = new rm(this._client), this.certificates = new Xp(this._client);
  }
  create(e, t) {
    return this._client.post("/organization/projects", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/organization/projects/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/organization/projects/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/projects", ge, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  archive(e, t) {
    return this._client.post(A`/organization/projects/${e}/archive`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Fe.Users = ba;
Fe.ServiceAccounts = nm;
Fe.APIKeys = Yp;
Fe.RateLimits = em;
Fe.ModelPermissions = jp;
Fe.HostedToolPermissions = Zp;
Fe.Groups = Ia;
Fe.Roles = tm;
Fe.DataRetention = Qp;
Fe.SpendAlerts = rm;
Fe.Certificates = Xp;
var im = class extends N {
  create(e, t, n) {
    return this._client.post(A`/organization/users/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { user_id: r } = t;
    return this._client.get(A`/organization/users/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/users/${e}/roles`, Et, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { user_id: r } = t;
    return this._client.delete(A`/organization/users/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Pa = class extends N {
  constructor() {
    super(...arguments), this.roles = new im(this._client);
  }
  retrieve(e, t) {
    return this._client.get(A`/organization/users/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/organization/users/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/users", ge, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/organization/users/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Pa.Roles = im;
var Oe = class extends N {
  constructor() {
    super(...arguments), this.auditLogs = new qp(this._client), this.adminAPIKeys = new Op(this._client), this.usage = new Kp(this._client), this.invites = new Hp(this._client), this.users = new Pa(this._client), this.groups = new ms(this._client), this.roles = new Vp(this._client), this.dataRetention = new Gp(this._client), this.spendAlerts = new Jp(this._client), this.certificates = new Bp(this._client), this.projects = new Fe(this._client);
  }
};
Oe.AuditLogs = qp;
Oe.AdminAPIKeys = Op;
Oe.Usage = Kp;
Oe.Invites = Hp;
Oe.Users = Pa;
Oe.Groups = ms;
Oe.Roles = Vp;
Oe.DataRetention = Gp;
Oe.SpendAlerts = Jp;
Oe.Certificates = Bp;
Oe.Projects = Fe;
var Ra = class extends N {
  constructor() {
    super(...arguments), this.organization = new Oe(this._client);
  }
};
Ra.Organization = Oe;
var am = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* $I(e) {
  if (!e) return;
  if (am in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const s of o) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Xc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const s = Xc(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of s)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var F = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [s, a] of $I(r)) {
      const u = s.toLowerCase();
      o.has(u) || (t.delete(s), o.add(u)), a === null ? (t.delete(s), n.add(u)) : (t.append(s, a), n.delete(u));
    }
  }
  return {
    [am]: !0,
    values: t,
    nulls: n
  };
}, lm = class extends N {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: F([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, um = class extends N {
  create(e, t) {
    return this._client.post("/audio/transcriptions", lt({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, cm = class extends N {
  create(e, t) {
    return this._client.post("/audio/translations", lt({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, qr = class extends N {
  constructor() {
    super(...arguments), this.transcriptions = new um(this._client), this.translations = new cm(this._client), this.speech = new lm(this._client);
  }
};
qr.Transcriptions = um;
qr.Translations = cm;
qr.Speech = lm;
var dm = class extends N {
  create(e, t) {
    return this._client.post("/batches", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/batches/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/batches", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(A`/batches/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, fm = class extends N {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/assistants/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/assistants/${e}`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", te, {
      query: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/assistants/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, hm = class extends N {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, pm = class extends N {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, gs = class extends N {
  constructor() {
    super(...arguments), this.sessions = new hm(this._client), this.transcriptionSessions = new pm(this._client);
  }
};
gs.Sessions = hm;
gs.TranscriptionSessions = pm;
var mm = class extends N {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(A`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, gm = class extends N {
  retrieve(e, t) {
    return this._client.get(A`/chatkit/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", ge, {
      query: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/chatkit/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(A`/chatkit/threads/${e}/items`, ge, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, ys = class extends N {
  constructor() {
    super(...arguments), this.sessions = new mm(this._client), this.threads = new gm(this._client);
  }
};
ys.Sessions = mm;
ys.Threads = gm;
var ym = class extends N {
  create(e, t, n) {
    return this._client.post(A`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(A`/threads/${r}/messages/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(A`/threads/${r}/messages/${e}`, {
      body: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/threads/${e}/messages`, te, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { thread_id: r } = t;
    return this._client.delete(A`/threads/${r}/messages/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, _m = class extends N {
  retrieve(e, t, n) {
    const { thread_id: r, run_id: o, ...s } = t;
    return this._client.get(A`/threads/${r}/runs/${o}/steps/${e}`, {
      query: s,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.getAPIList(A`/threads/${r}/runs/${e}/steps`, te, {
      query: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, LI = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, r = new Uint8Array(n);
    for (let o = 0; o < n; o++) r[o] = t.charCodeAt(o);
    return Array.from(new Float32Array(r.buffer));
  }
}, Pt = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, me, Kt, Hi, at, xo, Xe, Wt, mn, Gt, Xo, De, Mo, No, _r, fr, hr, pd, md, gd, yd, _d, vd, Ad, vr = class extends Ea {
  constructor() {
    super(...arguments), me.add(this), Hi.set(this, []), at.set(this, {}), xo.set(this, {}), Xe.set(this, void 0), Wt.set(this, void 0), mn.set(this, void 0), Gt.set(this, void 0), Xo.set(this, void 0), De.set(this, void 0), Mo.set(this, void 0), No.set(this, void 0), _r.set(this, void 0);
  }
  [(Hi = /* @__PURE__ */ new WeakMap(), at = /* @__PURE__ */ new WeakMap(), xo = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakMap(), Wt = /* @__PURE__ */ new WeakMap(), mn = /* @__PURE__ */ new WeakMap(), Gt = /* @__PURE__ */ new WeakMap(), Xo = /* @__PURE__ */ new WeakMap(), De = /* @__PURE__ */ new WeakMap(), Mo = /* @__PURE__ */ new WeakMap(), No = /* @__PURE__ */ new WeakMap(), _r = /* @__PURE__ */ new WeakMap(), me = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new Kt();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const r = br.fromReadableStream(e, this.controller);
    for await (const o of r) C(this, me, "m", fr).call(this, o);
    if (r.controller.signal?.aborted) throw new Ke();
    return this._addRun(C(this, me, "m", hr).call(this));
  }
  toReadableStream() {
    return new br(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, r) {
    const o = new Kt();
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
    const s = {
      ...n,
      stream: !0
    }, a = await e.submitToolOutputs(t, s, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) C(this, me, "m", fr).call(this, u);
    if (a.controller.signal?.aborted) throw new Ke();
    return this._addRun(C(this, me, "m", hr).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const r = new Kt();
    return r._run(() => r._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  static createAssistantStream(e, t, n, r) {
    const o = new Kt();
    return o._run(() => o._runAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  currentEvent() {
    return C(this, Mo, "f");
  }
  currentRun() {
    return C(this, No, "f");
  }
  currentMessageSnapshot() {
    return C(this, Xe, "f");
  }
  currentRunStepSnapshot() {
    return C(this, _r, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(C(this, at, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(C(this, xo, "f"));
  }
  async finalRun() {
    if (await this.done(), !C(this, Wt, "f")) throw Error("Final run was not received.");
    return C(this, Wt, "f");
  }
  async _createThreadAssistantStream(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort()));
    const o = {
      ...t,
      stream: !0
    }, s = await e.createAndRun(o, {
      ...n,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of s) C(this, me, "m", fr).call(this, a);
    if (s.controller.signal?.aborted) throw new Ke();
    return this._addRun(C(this, me, "m", hr).call(this));
  }
  async _createAssistantStream(e, t, n, r) {
    const o = r?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort()));
    const s = {
      ...n,
      stream: !0
    }, a = await e.create(t, s, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) C(this, me, "m", fr).call(this, u);
    if (a.controller.signal?.aborted) throw new Ke();
    return this._addRun(C(this, me, "m", hr).call(this));
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
      else if (Js(o) && Js(r)) o = this.accumulateDelta(o, r);
      else if (Array.isArray(o) && Array.isArray(r)) {
        if (o.every((s) => typeof s == "string" || typeof s == "number")) {
          o.push(...r);
          continue;
        }
        for (const s of r) {
          if (!Js(s)) throw new Error(`Expected array delta entry to be an object but got: ${s}`);
          const a = s.index;
          if (a == null)
            throw console.error(s), new Error("Expected array delta entry to have an `index` property");
          if (typeof a != "number") throw new Error(`Expected array delta entry \`index\` property to be a number but got ${a}`);
          const u = o[a];
          u == null ? o.push(s) : o[a] = this.accumulateDelta(u, s);
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
Kt = vr, fr = function(t) {
  if (!this.ended)
    switch (V(this, Mo, t, "f"), C(this, me, "m", gd).call(this, t), t.event) {
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
        C(this, me, "m", Ad).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        C(this, me, "m", md).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        C(this, me, "m", pd).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, hr = function() {
  if (this.ended) throw new B("stream has ended, this shouldn't happen");
  if (!C(this, Wt, "f")) throw Error("Final run has not been received");
  return C(this, Wt, "f");
}, pd = function(t) {
  const [n, r] = C(this, me, "m", _d).call(this, t, C(this, Xe, "f"));
  V(this, Xe, n, "f"), C(this, xo, "f")[n.id] = n;
  for (const o of r) {
    const s = n.content[o.index];
    s?.type == "text" && this._emit("textCreated", s.text);
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
          let s = o.text, a = n.content[o.index];
          if (a && a.type == "text") this._emit("textDelta", s, a.text);
          else throw Error("The snapshot associated with this text delta is not text or missing");
        }
        if (o.index != C(this, mn, "f")) {
          if (C(this, Gt, "f")) switch (C(this, Gt, "f").type) {
            case "text":
              this._emit("textDone", C(this, Gt, "f").text, C(this, Xe, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", C(this, Gt, "f").image_file, C(this, Xe, "f"));
              break;
          }
          V(this, mn, o.index, "f");
        }
        V(this, Gt, n.content[o.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (C(this, mn, "f") !== void 0) {
        const o = t.data.content[C(this, mn, "f")];
        if (o) switch (o.type) {
          case "image_file":
            this._emit("imageFileDone", o.image_file, C(this, Xe, "f"));
            break;
          case "text":
            this._emit("textDone", o.text, C(this, Xe, "f"));
            break;
        }
      }
      C(this, Xe, "f") && this._emit("messageDone", t.data), V(this, Xe, void 0, "f");
  }
}, md = function(t) {
  const n = C(this, me, "m", yd).call(this, t);
  switch (V(this, _r, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const r = t.data.delta;
      if (r.step_details && r.step_details.type == "tool_calls" && r.step_details.tool_calls && n.step_details.type == "tool_calls") for (const o of r.step_details.tool_calls) o.index == C(this, Xo, "f") ? this._emit("toolCallDelta", o, n.step_details.tool_calls[o.index]) : (C(this, De, "f") && this._emit("toolCallDone", C(this, De, "f")), V(this, Xo, o.index, "f"), V(this, De, n.step_details.tool_calls[o.index], "f"), C(this, De, "f") && this._emit("toolCallCreated", C(this, De, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      V(this, _r, void 0, "f"), t.data.step_details.type == "tool_calls" && C(this, De, "f") && (this._emit("toolCallDone", C(this, De, "f")), V(this, De, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, gd = function(t) {
  C(this, Hi, "f").push(t), this._emit("event", t);
}, yd = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return C(this, at, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = C(this, at, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let r = t.data;
      if (r.delta) {
        const o = Kt.accumulateDelta(n, r.delta);
        C(this, at, "f")[t.data.id] = o;
      }
      return C(this, at, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      C(this, at, "f")[t.data.id] = t.data;
      break;
  }
  if (C(this, at, "f")[t.data.id]) return C(this, at, "f")[t.data.id];
  throw new Error("No snapshot available");
}, _d = function(t, n) {
  let r = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, r];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let o = t.data;
      if (o.delta.content) for (const s of o.delta.content) if (s.index in n.content) {
        let a = n.content[s.index];
        n.content[s.index] = C(this, me, "m", vd).call(this, s, a);
      } else
        n.content[s.index] = s, r.push(s);
      return [n, r];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (n) return [n, r];
      throw Error("Received thread message event with no existing snapshot");
  }
  throw Error("Tried to accumulate a non-message event");
}, vd = function(t, n) {
  return Kt.accumulateDelta(n, t);
}, Ad = function(t) {
  switch (V(this, No, t.data, "f"), t.event) {
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
      V(this, Wt, t.data, "f"), C(this, De, "f") && (this._emit("toolCallDone", C(this, De, "f")), V(this, De, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var xa = class extends N {
  constructor() {
    super(...arguments), this.steps = new _m(this._client);
  }
  create(e, t, n) {
    const { include: r, ...o } = t;
    return this._client.post(A`/threads/${e}/runs`, {
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
    return this._client.get(A`/threads/${r}/runs/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(A`/threads/${r}/runs/${e}`, {
      body: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/threads/${e}/runs`, te, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { thread_id: r } = t;
    return this._client.post(A`/threads/${r}/runs/${e}/cancel`, {
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
    return vr.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const r = F([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: o, response: s } = await this.retrieve(e, t, {
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
            const u = s.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await Fr(a);
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
    return vr.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(A`/threads/${r}/runs/${e}/submit_tool_outputs`, {
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
    return vr.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
xa.Steps = _m;
var _s = class extends N {
  constructor() {
    super(...arguments), this.runs = new xa(this._client), this.messages = new ym(this._client);
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
    return this._client.get(A`/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/threads/${e}`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/threads/${e}`, {
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
    return vr.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
_s.Runs = xa;
_s.Messages = ym;
var Mn = class extends N {
  constructor() {
    super(...arguments), this.realtime = new gs(this._client), this.chatkit = new ys(this._client), this.assistants = new fm(this._client), this.threads = new _s(this._client);
  }
};
Mn.Realtime = gs;
Mn.ChatKit = ys;
Mn.Assistants = fm;
Mn.Threads = _s;
var vm = class extends N {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, Am = class extends N {
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(A`/containers/${r}/files/${e}/content`, {
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Ma = class extends N {
  constructor() {
    super(...arguments), this.content = new Am(this._client);
  }
  create(e, t, n) {
    return this._client.post(A`/containers/${e}/files`, ps({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(A`/containers/${r}/files/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/containers/${e}/files`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { container_id: r } = t;
    return this._client.delete(A`/containers/${r}/files/${e}`, {
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Ma.Content = Am;
var Na = class extends N {
  constructor() {
    super(...arguments), this.files = new Ma(this._client);
  }
  create(e, t) {
    return this._client.post("/containers", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/containers/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/containers/${e}`, {
      ...t,
      headers: F([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Na.Files = Ma;
var Sm = class extends N {
  create(e, t, n) {
    const { include: r, ...o } = t;
    return this._client.post(A`/conversations/${e}/items`, {
      query: { include: r },
      body: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: r, ...o } = t;
    return this._client.get(A`/conversations/${r}/items/${e}`, {
      query: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/conversations/${e}/items`, ge, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { conversation_id: r } = t;
    return this._client.delete(A`/conversations/${r}/items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, ka = class extends N {
  constructor() {
    super(...arguments), this.items = new Sm(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/conversations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/conversations/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/conversations/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/conversations/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
ka.Items = Sm;
var Tm = class extends N {
  create(e, t) {
    const n = !!e.encoding_format;
    let r = n ? e.encoding_format : "base64";
    n && pe(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const o = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: r
      },
      ...t,
      __security: { bearerAuth: !0 }
    });
    return n ? o : (pe(this._client).debug("embeddings/decoding base64 embeddings from base64"), o._thenUnwrap((s) => (s && s.data && s.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = LI(u);
    }), s)));
  }
}, Em = class extends N {
  retrieve(e, t, n) {
    const { eval_id: r, run_id: o } = t;
    return this._client.get(A`/evals/${r}/runs/${o}/output_items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { eval_id: r, ...o } = t;
    return this._client.getAPIList(A`/evals/${r}/runs/${e}/output_items`, te, {
      query: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Da = class extends N {
  constructor() {
    super(...arguments), this.outputItems = new Em(this._client);
  }
  create(e, t, n) {
    return this._client.post(A`/evals/${e}/runs`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { eval_id: r } = t;
    return this._client.get(A`/evals/${r}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/evals/${e}/runs`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { eval_id: r } = t;
    return this._client.delete(A`/evals/${r}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { eval_id: r } = t;
    return this._client.post(A`/evals/${r}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
Da.OutputItems = Em;
var $a = class extends N {
  constructor() {
    super(...arguments), this.runs = new Da(this._client);
  }
  create(e, t) {
    return this._client.post("/evals", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/evals/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/evals/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/evals", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/evals/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
$a.Runs = Da;
var wm = class extends N {
  create(e, t) {
    return this._client.post("/files", lt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(A`/files/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/files", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/files/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  content(e, t) {
    return this._client.get(A`/files/${e}/content`, {
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
    let s = await this.retrieve(e);
    for (; !s.status || !r.has(s.status); )
      if (await Fr(t), s = await this.retrieve(e), Date.now() - o > n) throw new ya({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return s;
  }
}, Cm = class extends N {
}, Im = class extends N {
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
}, La = class extends N {
  constructor() {
    super(...arguments), this.graders = new Im(this._client);
  }
};
La.Graders = Im;
var bm = class extends N {
  create(e, t, n) {
    return this._client.getAPIList(A`/fine_tuning/checkpoints/${e}/permissions`, kt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(A`/fine_tuning/checkpoints/${e}/permissions`, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/fine_tuning/checkpoints/${e}/permissions`, ge, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: r } = t;
    return this._client.delete(A`/fine_tuning/checkpoints/${r}/permissions/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ua = class extends N {
  constructor() {
    super(...arguments), this.permissions = new bm(this._client);
  }
};
Ua.Permissions = bm;
var Pm = class extends N {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/fine_tuning/jobs/${e}/checkpoints`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Fa = class extends N {
  constructor() {
    super(...arguments), this.checkpoints = new Pm(this._client);
  }
  create(e, t) {
    return this._client.post("/fine_tuning/jobs", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/fine_tuning/jobs/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/fine_tuning/jobs", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(A`/fine_tuning/jobs/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  listEvents(e, t = {}, n) {
    return this._client.getAPIList(A`/fine_tuning/jobs/${e}/events`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  pause(e, t) {
    return this._client.post(A`/fine_tuning/jobs/${e}/pause`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  resume(e, t) {
    return this._client.post(A`/fine_tuning/jobs/${e}/resume`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
Fa.Checkpoints = Pm;
var Nn = class extends N {
  constructor() {
    super(...arguments), this.methods = new Cm(this._client), this.jobs = new Fa(this._client), this.checkpoints = new Ua(this._client), this.alpha = new La(this._client);
  }
};
Nn.Methods = Cm;
Nn.Jobs = Fa;
Nn.Checkpoints = Ua;
Nn.Alpha = La;
var Rm = class extends N {
}, Oa = class extends N {
  constructor() {
    super(...arguments), this.graderModels = new Rm(this._client);
  }
};
Oa.GraderModels = Rm;
var xm = class extends N {
  createVariation(e, t) {
    return this._client.post("/images/variations", lt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", lt({
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
}, Mm = class extends N {
  retrieve(e, t) {
    return this._client.get(A`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", kt, {
      ...e,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Nm = class extends N {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, km = class extends N {
  accept(e, t, n) {
    return this._client.post(A`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  hangup(e, t) {
    return this._client.post(A`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: F([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  refer(e, t, n) {
    return this._client.post(A`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(A`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Dm = class extends N {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, vs = class extends N {
  constructor() {
    super(...arguments), this.clientSecrets = new Dm(this._client), this.calls = new km(this._client);
  }
};
vs.ClientSecrets = Dm;
vs.Calls = km;
function UI(e, t) {
  return !t || !OI(t) ? {
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
  } : $m(e, t);
}
function $m(e, t) {
  const n = e.output.map((o) => {
    if (o.type === "function_call") return {
      ...o,
      parsed_arguments: GI(t, o)
    };
    if (o.type === "message") {
      const s = o.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: FI(t, a.text)
      } : a);
      return {
        ...o,
        content: s
      };
    }
    return o;
  }), r = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || Vi(r), Object.defineProperty(r, "output_parsed", {
    enumerable: !0,
    get() {
      for (const o of r.output)
        if (o.type === "message") {
          for (const s of o.content) if (s.type === "output_text" && s.parsed !== null) return s.parsed;
        }
      return null;
    }
  }), r;
}
function FI(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function OI(e) {
  return !!Sa(e.text?.format);
}
function qI(e) {
  return e?.$brand === "auto-parseable-tool";
}
function BI(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function GI(e, t) {
  const n = BI(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: qI(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function Vi(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const r of n.content) r.type === "output_text" && t.push(r.text);
  e.output_text = t.join("");
}
var nn, yo, Rt, _o, Sd, Td, Ed, wd, HI = class Lm extends Ea {
  constructor(t) {
    super(), nn.add(this), yo.set(this, void 0), Rt.set(this, void 0), _o.set(this, void 0), V(this, yo, t, "f");
  }
  static createResponse(t, n, r) {
    const o = new Lm(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), C(this, nn, "m", Sd).call(this);
    let s, a = null;
    "response_id" in n ? (s = await t.responses.retrieve(n.response_id, { stream: !0 }, {
      ...r,
      signal: this.controller.signal,
      stream: !0
    }), a = n.starting_after ?? null) : s = await t.responses.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    }), this._connected();
    for await (const u of s) C(this, nn, "m", Td).call(this, u, a);
    if (s.controller.signal?.aborted) throw new Ke();
    return C(this, nn, "m", Ed).call(this);
  }
  [(yo = /* @__PURE__ */ new WeakMap(), Rt = /* @__PURE__ */ new WeakMap(), _o = /* @__PURE__ */ new WeakMap(), nn = /* @__PURE__ */ new WeakSet(), Sd = function() {
    this.ended || V(this, Rt, void 0, "f");
  }, Td = function(n, r) {
    if (this.ended) return;
    const o = (a, u) => {
      (r == null || u.sequence_number > r) && this._emit(a, u);
    }, s = C(this, nn, "m", wd).call(this, n);
    switch (o("event", n), n.type) {
      case "response.output_text.delta": {
        const a = s.output[n.output_index];
        if (!a) throw new B(`missing output at index ${n.output_index}`);
        if (a.type === "message") {
          const u = a.content[n.content_index];
          if (!u) throw new B(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new B(`expected content to be 'output_text', got ${u.type}`);
          o("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const a = s.output[n.output_index];
        if (!a) throw new B(`missing output at index ${n.output_index}`);
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
  }, Ed = function() {
    if (this.ended) throw new B("stream has ended, this shouldn't happen");
    const n = C(this, Rt, "f");
    if (!n) throw new B("request ended without sending any events");
    V(this, Rt, void 0, "f");
    const r = VI(n, C(this, yo, "f"));
    return V(this, _o, r, "f"), r;
  }, wd = function(n) {
    let r = C(this, Rt, "f");
    if (!r) {
      if (n.type !== "response.created") throw new B(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return r = V(this, Rt, n.response, "f"), r;
    }
    switch (n.type) {
      case "response.output_item.added":
        r.output.push(n.item);
        break;
      case "response.content_part.added": {
        const o = r.output[n.output_index];
        if (!o) throw new B(`missing output at index ${n.output_index}`);
        const s = o.type, a = n.part;
        s === "message" && a.type !== "reasoning_text" ? o.content.push(a) : s === "reasoning" && a.type === "reasoning_text" && (o.content || (o.content = []), o.content.push(a));
        break;
      }
      case "response.output_text.delta": {
        const o = r.output[n.output_index];
        if (!o) throw new B(`missing output at index ${n.output_index}`);
        if (o.type === "message") {
          const s = o.content[n.content_index];
          if (!s) throw new B(`missing content at index ${n.content_index}`);
          if (s.type !== "output_text") throw new B(`expected content to be 'output_text', got ${s.type}`);
          s.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const o = r.output[n.output_index];
        if (!o) throw new B(`missing output at index ${n.output_index}`);
        o.type === "function_call" && (o.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const o = r.output[n.output_index];
        if (!o) throw new B(`missing output at index ${n.output_index}`);
        if (o.type === "reasoning") {
          const s = o.content?.[n.content_index];
          if (!s) throw new B(`missing content at index ${n.content_index}`);
          if (s.type !== "reasoning_text") throw new B(`expected content to be 'reasoning_text', got ${s.type}`);
          s.text += n.delta;
        }
        break;
      }
      case "response.completed":
        V(this, Rt, n.response, "f");
        break;
    }
    return r;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let r = !1;
    return this.on("event", (o) => {
      const s = n.shift();
      s ? s.resolve(o) : t.push(o);
    }), this.on("end", () => {
      r = !0;
      for (const o of n) o.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (o) => {
      r = !0;
      for (const s of n) s.reject(o);
      n.length = 0;
    }), this.on("error", (o) => {
      r = !0;
      for (const s of n) s.reject(o);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : r ? {
        value: void 0,
        done: !0
      } : new Promise((o, s) => n.push({
        resolve: o,
        reject: s
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
    const t = C(this, _o, "f");
    if (!t) throw new B("stream ended without producing a ChatCompletion");
    return t;
  }
};
function VI(e, t) {
  return UI(e, t);
}
var Um = class extends N {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/responses/${e}/input_items`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Fm = class extends N {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, As = class extends N {
  constructor() {
    super(...arguments), this.inputItems = new Um(this._client), this.inputTokens = new Fm(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && Vi(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(A`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((r) => ("object" in r && r.object === "response" && Vi(r), r));
  }
  delete(e, t) {
    return this._client.delete(A`/responses/${e}`, {
      ...t,
      headers: F([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => $m(n, e));
  }
  stream(e, t) {
    return HI.createResponse(this._client, e, t);
  }
  cancel(e, t) {
    return this._client.post(A`/responses/${e}/cancel`, {
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
As.InputItems = Um;
As.InputTokens = Fm;
var Om = class extends N {
  retrieve(e, t) {
    return this._client.get(A`/skills/${e}/content`, {
      ...t,
      headers: F([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, qm = class extends N {
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(A`/skills/${r}/versions/${e}/content`, {
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, qa = class extends N {
  constructor() {
    super(...arguments), this.content = new qm(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(A`/skills/${e}/versions`, ps({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(A`/skills/${r}/versions/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/skills/${e}/versions`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { skill_id: r } = t;
    return this._client.delete(A`/skills/${r}/versions/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
qa.Content = qm;
var Ss = class extends N {
  constructor() {
    super(...arguments), this.content = new Om(this._client), this.versions = new qa(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", ps({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(A`/skills/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/skills/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/skills", te, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/skills/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
Ss.Content = Om;
Ss.Versions = qa;
var Bm = class extends N {
  create(e, t, n) {
    return this._client.post(A`/uploads/${e}/parts`, lt({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Ba = class extends N {
  constructor() {
    super(...arguments), this.parts = new Bm(this._client);
  }
  create(e, t) {
    return this._client.post("/uploads", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(A`/uploads/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  complete(e, t, n) {
    return this._client.post(A`/uploads/${e}/complete`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
Ba.Parts = Bm;
var JI = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((o) => o.status === "rejected");
  if (n.length) {
    for (const o of n) console.error(o.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const r = [];
  for (const o of t) o.status === "fulfilled" && r.push(o.value);
  return r;
}, Gm = class extends N {
  create(e, t, n) {
    return this._client.post(A`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(A`/vector_stores/${r}/file_batches/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.post(A`/vector_stores/${r}/file_batches/${e}/cancel`, {
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
    return this._client.getAPIList(A`/vector_stores/${r}/file_batches/${e}/files`, te, {
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
      const { data: o, response: s } = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: r
      }).withResponse();
      switch (o.status) {
        case "in_progress":
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = s.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await Fr(a);
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
    const o = r?.maxConcurrency ?? 5, s = Math.min(o, t.length), a = this._client, u = t.values(), c = [...n];
    async function d(h) {
      for (let f of h) {
        const p = await a.files.create({
          file: f,
          purpose: "assistants"
        }, r);
        c.push(p.id);
      }
    }
    return await JI(Array(s).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, Hm = class extends N {
  create(e, t, n) {
    return this._client.post(A`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(A`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { vector_store_id: r, ...o } = t;
    return this._client.post(A`/vector_stores/${r}/files/${e}`, {
      body: o,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/vector_stores/${e}/files`, te, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.delete(A`/vector_stores/${r}/files/${e}`, {
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
      }).withResponse(), s = o.data;
      switch (s.status) {
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
          await Fr(a);
          break;
        case "failed":
        case "completed":
          return s;
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
    return this._client.getAPIList(A`/vector_stores/${r}/files/${e}/content`, kt, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Ts = class extends N {
  constructor() {
    super(...arguments), this.files = new Hm(this._client), this.fileBatches = new Gm(this._client);
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
    return this._client.get(A`/vector_stores/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", te, {
      query: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/vector_stores/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(A`/vector_stores/${e}/search`, kt, {
      body: t,
      method: "post",
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Ts.Files = Hm;
Ts.FileBatches = Gm;
var Vm = class extends N {
  create(e, t) {
    return this._client.post("/videos", lt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(A`/videos/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/videos", ge, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/videos/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  createCharacter(e, t) {
    return this._client.post("/videos/characters", lt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(A`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", lt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", lt({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  getCharacter(e, t) {
    return this._client.get(A`/videos/characters/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  remix(e, t, n) {
    return this._client.post(A`/videos/${e}/remix`, ps({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, un, Jm, ko, Km = class extends N {
  constructor() {
    super(...arguments), un.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
    return await this.verifySignature(e, t, n, r), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    C(this, un, "m", Jm).call(this, n);
    const o = F([t]).values, s = C(this, un, "m", ko).call(this, o, "webhook-signature"), a = C(this, un, "m", ko).call(this, o, "webhook-timestamp"), u = C(this, un, "m", ko).call(this, o, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new or("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > r) throw new or("Webhook timestamp is too old");
    if (c > d + r) throw new or("Webhook timestamp is too new");
    const h = s.split(" ").map((y) => y.startsWith("v1,") ? y.substring(3) : y), f = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), p = u ? `${u}.${a}.${e}` : `${a}.${e}`, m = await crypto.subtle.importKey("raw", f, {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["verify"]);
    for (const y of h) try {
      const _ = Buffer.from(y, "base64");
      if (await crypto.subtle.verify("HMAC", m, _, new TextEncoder().encode(p))) return;
    } catch {
      continue;
    }
    throw new or("The given webhook signature does not match the expected signature");
  }
};
un = /* @__PURE__ */ new WeakSet(), Jm = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, ko = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const r = t.get(n);
  if (r == null) throw new Error(`Missing required header: ${n}`);
  return r;
};
var Ji, Ga, Do, Wm, KI = "workload-identity-auth", W = class {
  constructor({ baseURL: e = Pt("OPENAI_BASE_URL"), apiKey: t = Pt("OPENAI_API_KEY") ?? null, adminAPIKey: n = Pt("OPENAI_ADMIN_KEY") ?? null, organization: r = Pt("OPENAI_ORG_ID") ?? null, project: o = Pt("OPENAI_PROJECT_ID") ?? null, webhookSecret: s = Pt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: a, ...u } = {}) {
    Ji.add(this), Do.set(this, void 0), this.completions = new vm(this), this.chat = new Ca(this), this.embeddings = new Tm(this), this.files = new wm(this), this.images = new xm(this), this.audio = new qr(this), this.moderations = new Nm(this), this.models = new Mm(this), this.fineTuning = new Nn(this), this.graders = new Oa(this), this.vectorStores = new Ts(this), this.webhooks = new Km(this), this.beta = new Mn(this), this.batches = new dm(this), this.uploads = new Ba(this), this.admin = new Ra(this), this.responses = new As(this), this.realtime = new vs(this), this.conversations = new ka(this), this.evals = new $a(this), this.containers = new Na(this), this.skills = new Ss(this), this.videos = new Vm(this);
    const c = {
      apiKey: t,
      adminAPIKey: n,
      organization: r,
      project: o,
      webhookSecret: s,
      workloadIdentity: a,
      ...u,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (t && a) throw new B("The `apiKey` and `workloadIdentity` options are mutually exclusive");
    if (!t && !n && !a) throw new B("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, `adminAPIKey`, or set the `OPENAI_API_KEY` or `OPENAI_ADMIN_KEY` environment variable.");
    if (!c.dangerouslyAllowBrowser && VC()) throw new B(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? Ga.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = ld(c.logLevel, "ClientOptions.logLevel", this) ?? ld(Pt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? dp(), V(this, Do, YC, "f");
    const h = Pt("OPENAI_CUSTOM_HEADERS");
    if (h) {
      const f = {};
      for (const p of h.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (f[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = F([f, c.defaultHeaders]);
    }
    this._options = c, a && (this._workloadIdentityAuth = new hI(a, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = r, this.project = o, this.webhookSecret = s;
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
    return tI(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${an}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${jh()}`;
  }
  makeStatusError(e, t, n, r) {
    return ye.generate(e, t, n, r);
  }
  async _callApiKey() {
    const e = this._options.apiKey;
    if (typeof e != "function") return !1;
    let t;
    try {
      t = await e();
    } catch (n) {
      throw n instanceof B ? n : new B(`Failed to get token from 'apiKey' function: ${n.message}`, { cause: n });
    }
    if (typeof t != "string" || !t) throw new B(`Expected 'apiKey' function argument to return a string but it returned ${t}`);
    return this.apiKey = t, !0;
  }
  buildURL(e, t, n) {
    const r = !C(this, Ji, "m", Wm).call(this) && n || this.baseURL, o = qC(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), s = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!Qc(s) || !Qc(a)) && (t = {
      ...a,
      ...s,
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
    return new Tp(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, o = r.maxRetries ?? this.maxRetries;
    t == null && (t = o), await this.prepareOptions(r);
    const { req: s, url: a, timeout: u } = await this.buildRequest(r, { retryCount: o - t });
    await this.prepareRequest(s, {
      url: a,
      options: r
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (pe(this).debug(`[${c}] sending request`, qt({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: s.headers
    })), r.signal?.aborted) throw new Ke();
    const f = r.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(a, s, u, p, f).catch(xi), y = Date.now();
    if (m instanceof globalThis.Error) {
      const v = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new Ke();
      const w = Ri(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return pe(this).info(`[${c}] connection ${w ? "timed out" : "failed"} - ${v}`), pe(this).debug(`[${c}] connection ${w ? "timed out" : "failed"} (${v})`, qt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: y - h,
          message: m.message
        })), this.retryRequest(r, t, n ?? c);
      throw pe(this).info(`[${c}] connection ${w ? "timed out" : "failed"} - error; no more retries left`), pe(this).debug(`[${c}] connection ${w ? "timed out" : "failed"} (error; no more retries left)`, qt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: y - h,
        message: m.message
      })), m instanceof cp || m instanceof FC ? m : w ? new ya() : new ds({
        message: WI(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([v]) => v === "x-request-id").map(([v, w]) => ", " + v + ": " + JSON.stringify(w)).join("")}] ${s.method} ${a} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${y - h}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && f.bearerAuth && !r.__metadata?.hasStreamingBody && !r.__metadata?.workloadIdentityTokenRefreshed)
        return await td(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...r,
          __metadata: {
            ...r.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const v = await this.shouldRetry(m);
      if (t && v) {
        const $ = `retrying, ${t} attempts remaining`;
        return await td(m.body), pe(this).info(`${_} - ${$}`), pe(this).debug(`[${c}] response error (${$})`, qt({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: y - h
        })), this.retryRequest(r, t, n ?? c, m.headers);
      }
      const w = v ? "error; no more retries left" : "error; not retryable";
      pe(this).info(`${_} - ${w}`);
      const b = await m.text().catch(($) => xi($).message), P = HC(b), x = P ? void 0 : b;
      throw pe(this).debug(`[${c}] response error (${w})`, qt({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: x,
        durationMs: Date.now() - h
      })), this.makeStatusError(m.status, P, x, m.headers);
    }
    return pe(this).info(_), pe(this).debug(`[${c}] response start`, qt({
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
    return new cI(this, n, e);
  }
  async fetchWithAuth(e, t, n, r, o = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && o.bearerAuth) {
      const s = t.headers, a = s.get("Authorization");
      if (!a || a === `Bearer ${KI}`) {
        const u = await this._workloadIdentityAuth.getToken();
        s.set("Authorization", `Bearer ${u}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, r);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: o, method: s, ...a } = t || {}, u = this._makeAbort(r);
    o && o.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, h = {
      signal: r.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...a
    };
    s && (h.method = s.toUpperCase());
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
    const s = r?.get("retry-after-ms");
    if (s) {
      const u = parseFloat(s);
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
    return await Fr(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: s, defaultBaseURL: a } = n, u = this.buildURL(o, s, a);
    "timeout" in n && GC("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const s = F([
      o,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...zC(),
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project
      },
      await this.authHeaders(e, e.__security ?? { bearerAuth: !0 }),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(s, e.__security ?? { bearerAuth: !0 }), s.values;
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
      body: hp(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...C(this, Do, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
Ga = W, Do = /* @__PURE__ */ new WeakMap(), Ji = /* @__PURE__ */ new WeakSet(), Wm = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
W.OpenAI = Ga;
W.DEFAULT_TIMEOUT = 6e5;
W.OpenAIError = B;
W.APIError = ye;
W.APIConnectionError = ds;
W.APIConnectionTimeoutError = ya;
W.APIUserAbortError = Ke;
W.NotFoundError = rp;
W.ConflictError = op;
W.RateLimitError = ip;
W.BadRequestError = ep;
W.AuthenticationError = tp;
W.InternalServerError = ap;
W.PermissionDeniedError = np;
W.UnprocessableEntityError = sp;
W.InvalidWebhookSignatureError = or;
W.toFile = _I;
W.Completions = vm;
W.Chat = Ca;
W.Embeddings = Tm;
W.Files = wm;
W.Images = xm;
W.Audio = qr;
W.Moderations = Nm;
W.Models = Mm;
W.FineTuning = Nn;
W.Graders = Oa;
W.VectorStores = Ts;
W.Webhooks = Km;
W.Beta = Mn;
W.Batches = dm;
W.Uploads = Ba;
W.Admin = Ra;
W.Responses = As;
W.Realtime = vs;
W.Conversations = ka;
W.Evals = $a;
W.Containers = Na;
W.Skills = Ss;
W.Videos = Vm;
function WI(e) {
  if (zI(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function zI(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const r = t;
    if (r.code === "UND_ERR_INVALID_ARG" && typeof r.message == "string" && r.message.includes("invalid onRequestStart method")) return !0;
    t = r.cause;
  }
  return !1;
}
function Cd(e = "", t = 0) {
  let n = 0;
  for (let r = t - 1; r >= 0 && e[r] === "\\"; r -= 1) n += 1;
  return n % 2 === 1;
}
function YI(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function XI(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function QI(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function ZI(e = "") {
  const t = String(e ?? "");
  let n = "", r = 0;
  for (; r < t.length; ) {
    const o = t.slice(r, r + 2), s = t.slice(r + 2, r + 6);
    if (o !== "\\u" || Cd(t, r) || !YI(s)) {
      n += t[r] || "", r += 1;
      continue;
    }
    const a = r + 6, u = t.slice(a + 2, a + 6);
    if (XI(s) && t.slice(a, a + 2) === "\\u" && !Cd(t, a) && QI(u)) {
      const c = Number.parseInt(s, 16), d = Number.parseInt(u, 16), h = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(h), r += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(s, 16)), r += 6;
  }
  return n;
}
function jI(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), ZI(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function eb(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Ha(e = "", t = "", n = 0) {
  const r = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${eb(t)}(?:\\\\?")?\\s*:`, "i"), o = String(e || "").slice(Math.max(0, n)).match(r);
  if (!o || o.index === void 0) return null;
  const s = o[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + o.index + s,
    end: Math.max(0, n) + o.index + o[0].length
  };
}
function tb(e = "", t = [], n = 0) {
  return t.map((r) => Ha(e, r, n)).filter(Boolean).sort((r, o) => r.index - o.index)[0] || null;
}
function je(e = "", t = "", n = []) {
  const r = String(e || ""), o = Ha(r, t);
  if (!o) return;
  let s = o.end;
  for (; /\s/.test(r[s] || ""); ) s += 1;
  r[s] === '"' && (s += 1);
  const a = tb(r, n.filter((d) => d !== t), s);
  let u = a ? a.index : r.length;
  if (a) {
    const d = r.lastIndexOf(",", a.index);
    d >= s && (u = d);
  }
  let c = r.slice(s, u).trim();
  return a || (c = c.replace(/\}\s*$/, "").trimEnd()), jI(c);
}
function mt(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var pr = {
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
}, nb = [
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
function Id(e = "", t = [], n = []) {
  for (const r of t) {
    const o = je(e, r, n);
    if (o !== void 0) return o;
  }
}
function rb(e = "", t = "") {
  if (t === "Read") {
    const n = pr.Read, r = {};
    return n.forEach((o, s) => {
      const a = je(e, o, n.slice(s + 1));
      a !== void 0 && (r[o] = mt(a));
    }), r.filePath === void 0 && r.path !== void 0 && (r.filePath = r.path, delete r.path), r.filePath === void 0 && r.scope !== void 0 && (r.filePath = r.scope, delete r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "Write") {
    const n = {}, r = Id(e, ["filePath", "path"], ["content"]), o = je(e, "content", []);
    return r !== void 0 && (n.filePath = mt(r)), o !== void 0 && (n.content = mt(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, r = Id(e, ["filePath", "path"], ["edits"]), o = je(e, "edits", []);
    return r !== void 0 && (n.filePath = mt(r)), o !== void 0 && (n.edits = mt(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = pr.Grep, r = {};
    return n.forEach((o) => {
      const s = je(e, o, n.filter((a) => a !== o));
      s !== void 0 && (r[o] = mt(s));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "MemoryGrep") {
    const n = pr.MemoryGrep, r = {};
    return n.forEach((o) => {
      const s = je(e, o, n.filter((a) => a !== o));
      s !== void 0 && (r[o] = mt(s));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  if (t === "ChatHistory") {
    const n = pr.ChatHistory, r = {};
    return n.forEach((o) => {
      const s = je(e, o, n.filter((a) => a !== o));
      s !== void 0 && (r[o] = mt(s));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  return null;
}
function ob(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const a = JSON.parse(n);
    if (a && typeof a == "object" && !Array.isArray(a)) return a;
  } catch {
  }
  const r = rb(n, t);
  if (r) return r;
  const o = pr[t] || nb, s = {};
  return o.forEach((a, u) => {
    const c = je(n, a, o.slice(u + 1));
    c !== void 0 && (s[a] = mt(c));
  }), Object.keys(s).length ? s : null;
}
function sb(e = "", t = "") {
  const n = ob(e, t);
  return n ? JSON.stringify(n) : "";
}
function zm(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Ze(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function be(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function ee(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Ym(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function Xm(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : Ym(e);
  return sb(n, t) || JSON.stringify(zm(n));
}
function ib(e = "") {
  const t = String(e || ""), n = Ha(t, "arguments");
  if (!n) return "";
  let r = n.end;
  for (; /\s/.test(t[r] || ""); ) r += 1;
  const o = t[r] || "";
  return o === "{" ? t.slice(r).replace(/\}\s*$/, "").trimEnd() : o === '"' ? t.slice(r + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(r).replace(/\}\s*$/, "").trimEnd();
}
function ab(e = "", t = 0) {
  const n = String(e || "").trim(), r = je(n, "name", ["id", "arguments"]) || je(n, "toolName", ["id", "arguments"]) || "", o = je(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, s = ib(n);
  return !r || !s ? null : {
    id: o,
    name: r,
    arguments: Xm(s, r)
  };
}
function lb(e, t = 0, n = "openai-tool") {
  if (!ee(e)) return null;
  const r = ee(e.function) ? e.function : null, o = String(r?.name || "").trim();
  if (!o) return null;
  const s = be(e) || {};
  return delete s.index, s.id = String(s.id || `${n}-${t + 1}`), s.type = "function", s.function = {
    ...be(r) || {},
    name: o,
    arguments: Ym(r.arguments)
  }, s;
}
function Pr(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, r) => lb(n, r, t)).filter(Boolean);
}
function Rr(e, t) {
  return Array.isArray(e) ? e.some((n) => Rr(n, t)) : ee(e) ? Object.entries(e).some(([n, r]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(r) : (Array.isArray(r) || ee(r)) && Rr(r, t)) : !1;
}
function ub(e) {
  return Rr(e, (t) => typeof t == "string" && t.length > 0);
}
function Ki(e) {
  return Rr(e, () => !0);
}
function cb(e) {
  return Rr(e, (t) => typeof t != "string" || t.length === 0);
}
function db(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => ub(t));
}
var bd = /* @__PURE__ */ new WeakSet();
function Va(e) {
  if (!ee(e)) return null;
  const t = be(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = Vt(Ht(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = Pr(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function Ja(e = [], t = "openai-tool") {
  return Pr(e, t).map((n, r) => ({
    id: n.id || `${t}-${Date.now()}-${r + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function Ka(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function Ht(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, r) => (Ze(t, "思考块", r), "")).trim(),
    thoughts: t
  };
}
function Vt(e = "") {
  const t = String(e || ""), n = t.search(/<tool_call\b/i);
  return n < 0 ? t.trim() : t.slice(0, n).trim();
}
function Wi(e = "") {
  const t = String(e || "");
  return /<tool_call\b/i.test(t) ? [{
    id: "tagged-json-draft",
    name: t.match(/["']?name["']?\s*:\s*["']([^"']+)/i)?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }] : [];
}
function Bt(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      Ze(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((r) => Bt(e, r, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && Ze(e, n, t.text), typeof t.content == "string" && Ze(e, n, t.content), typeof t.reasoning_content == "string" && Ze(e, n, t.reasoning_content), typeof t.thinking == "string" && Ze(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((r) => {
      if (typeof r == "string") {
        Ze(e, "推理摘要", r);
        return;
      }
      r && typeof r == "object" && Ze(e, "推理摘要", r.text || r.content || "");
    }));
  }
}
function xt(e = {}, t = {}) {
  const n = [];
  return Bt(n, e.reasoning_content, "推理文本"), Bt(n, e.reasoning, "推理文本"), Bt(n, e.reasoning_text, "推理文本"), Bt(n, e.thinking, "思考块"), Bt(n, t.reasoning_content, "推理文本"), Bt(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        Ze(n, "推理文本", r.text);
        return;
      }
      if (r.type === "summary_text") {
        Ze(n, "推理摘要", r.text);
        return;
      }
      (r.type === "thinking" || r.type === "reasoning" || r.type === "reasoning_content") && Ze(n, "思考块", r.text || r.content || r.reasoning || "");
    }
  }), n;
}
function Ar(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((r) => {
    [...e.matchAll(r)].forEach((o, s) => {
      try {
        const a = JSON.parse(o[1]);
        n.push({
          id: a.id || `tool-call-${s + 1}`,
          name: String(a.name || ""),
          arguments: Xm(a.arguments, a.name)
        });
      } catch {
        const a = ab(o[1], s);
        a && n.push(a);
      }
    });
  }), n.filter((r) => r.name);
}
function Wa(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : Va(t);
}
function fb(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function hb(e = {}) {
  const t = Pr(e?.tool_calls);
  if (t.length) return t;
  const n = Pr(Wa(e)?.tool_calls);
  return n.length ? n : [];
}
function pb(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function mb(e = "") {
  return /claude/i.test(String(e || ""));
}
function Qm(e = [], t = "") {
  if (!mb(t)) return e;
  let n = -1;
  for (let o = e.length - 1; o >= 0; o -= 1) if (typeof e[o]?.role == "string") {
    n = o;
    break;
  }
  const r = e[n]?.role;
  return n < 0 || r === "user" || r !== "system" && r !== "assistant" ? e : e.map((o, s) => s === n ? {
    ...o,
    role: "user"
  } : o);
}
function Pd(e, t = "") {
  return !ee(e) || !pb(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var zi = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function gb(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((r) => be(r) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((r, o) => {
    const s = be(r) || {}, a = Number.isInteger(Number(r?.index)) ? Number(r.index) : o, u = n[a];
    n[a] = ee(u) ? Br(u, s, "tool_call") : s;
  }), n.filter((r) => r !== void 0);
}
function Br(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return be(t);
  if (t === null && zi.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return gb(e, t);
  if (typeof e == "string" && typeof t == "string")
    return zi.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : be(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(be(t) || []);
  if (ee(e) && ee(t)) {
    const r = { ...e };
    return Object.entries(t).forEach(([o, s]) => {
      r[o] = Br(r[o], s, o);
    }), r;
  }
  return be(t);
}
function Qo(e = {}, t = {}) {
  const n = ee(e) ? be(e) || {} : {}, r = ee(t) ? be(t) || {} : {};
  return delete r.message, delete r.finish_reason, delete r.index, delete r.logprobs, delete r.delta, Object.entries(r).forEach(([o, s]) => {
    n[o] = Br(n[o], s, o);
  }), n.role || (n.role = "assistant"), Va(n) || { role: "assistant" };
}
function Sr(e, t = {}) {
  const n = Va(Qo(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function yb(e = {}, t = {}) {
  return ee(e) ? ee(t) ? Br(be(e) || {}, t, "") : be(e) : be(t);
}
function Yi(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], r = fb(n), o = [];
  let s = !1;
  n.forEach((u, c) => {
    if (s) {
      if (u?.role === "tool") return;
      s = !1;
    }
    const d = u?.role === "assistant", h = d ? u?.providerPayload?.openaiCompatibleMessage : null, f = jm(Array.isArray(h?.tool_calls) && h.tool_calls.some((w) => Ki(w)) ? h.tool_calls : d && Array.isArray(u?.tool_calls) && u.tool_calls.some((w) => Ki(w)) ? u.tool_calls : null);
    if (f) {
      const w = ee(h) ? h : u;
      (!ee(w) || !bd.has(w)) && (ee(w) && bd.add(w), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: f.index,
        toolName: f.toolName,
        reason: f.reason
      })), s = !0;
      return;
    }
    const p = d ? Pr(u?.tool_calls) : [], m = d ? Wa(u) : null, y = Array.isArray(m?.tool_calls) ? m.tool_calls : [], _ = y.length > 0 && db(m);
    if (y.length && c > r) {
      o.push(Pd({
        ...m,
        ...p.length && !_ ? { tool_calls: p } : {}
      }, t));
      return;
    }
    const v = {
      role: u.role,
      content: u.content
    };
    u.role === "tool" && u.tool_call_id && (v.tool_call_id = u.tool_call_id), _ ? v.tool_calls = y : p.length && (v.tool_calls = p), o.push(Pd(v, t));
  });
  const a = String(e.systemPrompt || "").trim();
  return a && o[0]?.role !== "system" && o.unshift({
    role: "system",
    content: a
  }), Qm(o, t);
}
function Rd(e) {
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
function Xi(e, t = "") {
  const n = /* @__PURE__ */ new Map(), r = [];
  return (Array.isArray(e.messages) ? e.messages : []).forEach((o) => {
    if (o.role === "assistant") {
      const s = hb(o);
      if (s.length) {
        const a = Wa(o), u = typeof a?.content == "string" ? a.content : String(o.content || ""), c = s.map((d, h) => {
          const f = d.function?.name || "", p = d.id || `tool-call-${h + 1}`;
          return f && n.set(p, f), `<tool_call>${JSON.stringify({
            id: p,
            name: f,
            arguments: zm(d.function?.arguments || "{}")
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
      const s = String(o.toolName || o.tool_name || "").trim() || n.get(o.tool_call_id || "") || "unknown_tool";
      o.tool_call_id && n.delete(o.tool_call_id);
      const a = String(o.content || "");
      r.push({
        role: "user",
        content: [
          "<tool_result>",
          "这是系统工具执行结果，不是用户新发言。",
          `name: ${s}`,
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
    content: Rd(e)
  }) : r[0] = {
    ...r[0],
    content: Rd({
      ...e,
      systemPrompt: r[0].content || e.systemPrompt
    })
  }, Qm(r, t);
}
function xd(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Zm(e, t, n) {
  !e || !t || n === void 0 || (e[t] = Br(e[t], n, t));
}
function Zo(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (ee(n)) {
      const r = ee(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([o, s]) => {
        Zo(r, o, s);
      }), e[t] = r;
      return;
    }
    if (typeof n == "string" && zi.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || Zm(e, t, n);
  }
}
function _b(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const r = Number(n?.index ?? 0), o = { ...e.tool_calls[r] || {} };
    Object.entries(n || {}).forEach(([s, a]) => {
      if (s !== "index" && !(s === "function" && a == null)) {
        if (s === "function" && ee(a)) {
          o.function = ee(o.function) ? { ...o.function } : {}, Object.entries(a).forEach(([u, c]) => {
            Zo(o.function, u, c);
          });
          return;
        }
        Zo(o, s, a);
      }
    }), e.tool_calls[r] = o;
  }));
}
function Qi(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([r, o]) => {
    r === "delta" || r === "finish_reason" || r === "index" || r === "logprobs" || Zm(e, r, o);
  });
  const n = ee(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([r, o]) => {
    if (r === "tool_calls") {
      _b(e, o);
      return;
    }
    Zo(e, r, o);
  });
}
function gn(e = {}) {
  return Ka(e?.content);
}
function yn(e = {}) {
  return Ja(e?.tool_calls || []);
}
function vb(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return ee(JSON.parse(e));
  } catch {
    return !1;
  }
}
function jm(e) {
  if (!Array.isArray(e) || !e.some((t) => Ki(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], r = ee(n?.function) ? n.function : null, o = String(r?.name || "").trim();
    let s = "";
    if (!ee(n) || !r ? s = "invalid_function_shape" : o ? vb(r.arguments) ? cb(n) && (s = "invalid_thought_signature") : s = "invalid_function_arguments" : s = "missing_function_name", s) return {
      index: t,
      toolName: o,
      reason: s
    };
  }
  return null;
}
function _n(e = {}) {
  const t = jm(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function Ab(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("openai_compatible_stream_missing_body");
  const r = new TextDecoder();
  let o = "";
  const s = /\r?\n\r?\n/;
  for (; ; ) {
    const { done: u, value: c } = await n.read();
    if (u) break;
    for (o += r.decode(c, { stream: !0 }); ; ) {
      const d = o.match(s);
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
var Sb = 600 * 1e3, Tr = /* @__PURE__ */ new Map();
function eg(e = {}) {
  return `${String(e.baseUrl || "https://api.openai.com/v1").trim().replace(/\/+$/, "")}\0${String(e.model || "").trim()}`;
}
function tg(e = {}) {
  const t = eg(e), n = Tr.get(t);
  return Number.isFinite(n) ? n > Date.now() ? !0 : (Tr.delete(t), !1) : !1;
}
function ng(e = {}) {
  const t = Date.now();
  Tr.forEach((n, r) => {
    (!Number.isFinite(n) || n <= t) && Tr.delete(r);
  }), Tr.set(eg(e), t + Sb);
}
function jo(e, t, n = /* @__PURE__ */ new Set()) {
  if (e != null) {
    if (typeof e == "string") {
      t.push(e);
      const r = e.trim();
      if (r.startsWith("{") && r.endsWith("}") || r.startsWith("[") && r.endsWith("]")) try {
        jo(JSON.parse(r), t, n);
      } catch {
      }
      return;
    }
    typeof e != "object" || n.has(e) || (n.add(e), Object.values(e).forEach((r) => {
      jo(r, t, n);
    }));
  }
}
function rg(e) {
  const t = Number(e?.status ?? e?.response?.status ?? 0);
  if (t !== 400 && t !== 422) return !1;
  const n = [
    e?.message,
    e?.code,
    e?.param
  ].filter(Boolean);
  jo(e?.error, n), jo(e?.body, n);
  const r = n.join(" ").toLowerCase();
  if (!/reasoning[_ -]?effort/.test(r)) return !1;
  const o = String(e?.code || e?.error?.code || "").toLowerCase(), s = String(e?.param || e?.error?.param || "").toLowerCase();
  return /reasoning[_ -]?effort/.test(s) && /(unsupported_parameter|unknown_parameter|unrecognized_parameter|extra_forbidden)/.test(o) ? !0 : /(?:unsupported|unknown|unrecognized|unexpected|invalid)\s+(?:request\s+)?(?:parameter|field|argument)(?:\s+supplied)?\s*:?\s*['"]?reasoning[_ -]?effort/.test(r) || /(?:parameter|field|argument)\s*['"]?reasoning[_ -]?effort['"]?\s+(?:is\s+)?(?:not supported|not allowed|not permitted)/.test(r) || /reasoning[_ -]?effort['"]?\s+(?:is\s+)?(?:an?\s+)?(?:unsupported|unknown|unrecognized|unexpected)\s+(?:parameter|field|argument)/.test(r) || /reasoning[_ -]?effort[\s\S]*extra inputs?[\s\S]*(?:not permitted|forbidden)/.test(r) || /extra inputs?[\s\S]*(?:not permitted|forbidden)[\s\S]*reasoning[_ -]?effort/.test(r) || /unknown name\s*['"]?reasoning[_ -]?effort['"]?/.test(r) || /reasoning[_ -]?effort['"]?\s*:?\s*cannot find field/.test(r);
}
var Tb = class {
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
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = !t && Array.isArray(e.tools) && e.tools.length ? e.tools : null, r = {
      model: this.config.model,
      messages: t ? Xi(e, this.config.model) : Yi(e, this.config.model),
      ...n ? {
        tools: n,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (r.temperature = e.temperature), e.reasoning?.enabled && !tg(this.config) && (r.reasoning_effort = e.reasoning.effort), r;
  }
  async requestWithReasoningEffortFallback(e, t, n, r = {}) {
    try {
      return {
        result: await n(t),
        body: t
      };
    } catch (o) {
      if (e.signal?.aborted || typeof r.canRetry == "function" && !r.canRetry() || !Object.prototype.hasOwnProperty.call(t, "reasoning_effort") || !rg(o)) throw o;
      ng(this.config);
      const s = { ...t };
      return delete s.reasoning_effort, {
        result: await n(s),
        body: s
      };
    }
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = {
      ...t.body || this.buildRequestBody(e),
      ...n ? { stream: !0 } : {}
    }, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), s = !!e.reasoning?.enabled && !Object.prototype.hasOwnProperty.call(r, "reasoning_effort"), a = Object.prototype.hasOwnProperty.call(r, "reasoning_effort");
    return {
      ...Ir({
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
        effectiveConfig: zt(e, {
          enabled: a,
          effort: r.reasoning_effort,
          includeOutput: !1
        })
      }),
      ...s ? { degraded: ["reasoning_effort_unsupported"] } : {}
    };
  }
  async streamNativeChatCompletions(e, t, n = {}) {
    const r = `${String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`, o = await fetch(r, {
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
    if (!o.ok) {
      const y = await o.text().catch(() => ""), _ = new Error(y || `openai_compatible_stream_http_${o.status}`);
      throw _.status = o.status, _;
    }
    typeof n.onResponseAccepted == "function" && n.onResponseAccepted();
    const s = { role: "assistant" };
    let a = "stop", u = this.config.model;
    await Ab(o, (y) => {
      u = y?.model || u;
      const _ = y?.choices?.[0];
      Qi(s, _), _?.finish_reason && (a = _.finish_reason);
      const v = Ht(gn(s)), w = yn(s), b = w.length ? w : Wi(v.cleaned);
      xd(e, {
        text: w.length ? v.cleaned : Vt(v.cleaned),
        thoughts: xt(s, _).concat(v.thoughts),
        ...b.length ? { toolCalls: b } : {},
        ...!w.length && b.length ? { toolCallDraft: !0 } : {}
      });
    }), _n(s);
    const c = Sr(s), d = yn(s), h = Ht(gn(s)), f = xt(s, {});
    h.thoughts.forEach((y) => f.push(y));
    const p = d.length ? [] : Ar(h.cleaned), m = [...d, ...p];
    return {
      text: d.length ? h.cleaned : Vt(h.cleaned),
      toolCalls: m,
      thoughts: f,
      finishReason: a,
      model: u,
      provider: "openai-compatible",
      providerPayload: c
    };
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = typeof e.onStreamProgress == "function", r = this.buildRequestBody(e);
    let o = null;
    const s = async (v, w = {}) => {
      const b = await this.requestWithReasoningEffortFallback(e, r, v, w);
      return o = this.inspectRequest(e, { body: b.body }), b.result;
    };
    if (n) {
      if (!t) {
        let j = !1;
        return {
          ...await s((Q) => this.streamNativeChatCompletions(e, Q, { onResponseAccepted: () => {
            j = !0;
          } }), { canRetry: () => !j }),
          requestInspection: o
        };
      }
      const v = await s((j) => this.client.chat.completions.create({
        ...j,
        stream: !0
      }, { signal: e.signal })), w = { role: "assistant" };
      let b = "stop", P = this.config.model, x;
      for await (const j of v) {
        P = j.model || P;
        const Q = j.choices?.[0];
        Qi(w, Q), Q?.finish_reason && (b = Q.finish_reason);
        const X = Ht(gn(w)), he = yn(w), qe = he.length ? he : Wi(X.cleaned);
        xd(e, {
          text: he.length ? X.cleaned : Vt(X.cleaned),
          thoughts: xt(w, Q).concat(X.thoughts),
          ...qe.length ? { toolCalls: qe } : {},
          ...!he.length && qe.length ? { toolCallDraft: !0 } : {}
        });
      }
      const $ = (typeof v.finalChatCompletion == "function" ? await v.finalChatCompletion() : null)?.choices?.[0] || null, S = $?.message || w;
      _n(S);
      const O = yb(w, Qo(S, $ || {}));
      _n(O), x = Sr(O);
      const R = yn(O), k = Ht(gn(O)), H = xt(O, $ || {});
      k.thoughts.forEach((j) => H.push(j));
      const z = R.length ? [] : Ar(k.cleaned), se = [...R, ...z];
      return {
        text: R.length ? k.cleaned : Vt(k.cleaned),
        toolCalls: se,
        thoughts: H,
        finishReason: b,
        model: P,
        provider: "openai-compatible",
        providerPayload: x,
        requestInspection: o
      };
    }
    const a = await s((v) => this.client.chat.completions.create(v, { signal: e.signal })), u = a.choices?.[0] || {}, c = u.message || {};
    _n(c);
    const d = xt(c, u), h = Ja(c.tool_calls || []), f = Ht(Ka(c.content));
    f.thoughts.forEach((v) => d.push(v));
    const p = h.length ? [] : Ar(f.cleaned), m = [...h, ...p], y = h.length ? f.cleaned : Vt(f.cleaned), _ = Qo(c, u);
    return {
      text: y,
      toolCalls: m,
      thoughts: d,
      finishReason: u.finish_reason || "stop",
      model: a.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: Sr(_),
      requestInspection: o
    };
  }
};
function og(e, t) {
  return {
    type: "message",
    role: e,
    content: Eb(t)
  };
}
function es(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function Eb(e) {
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
function ts(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function Md(e, t = [], n = {}) {
  (t || []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        ts(e, n.reasoning || "推理文本", r.text);
        return;
      }
      r.type === "summary_text" && ts(e, n.summary || "推理摘要", r.text);
    }
  });
}
function wb(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (Md(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), Md(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function Cb(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function Ib(e) {
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
function bb(e) {
  const t = e?.choices?.[0], n = t?.message?.content, r = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const o = n.toLowerCase();
  return !o.includes("proxy error") || !o.includes("/responses") && !r.toLowerCase().includes("proxy error") ? null : n.trim();
}
function Pb(e) {
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
      if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
        n.content?.trim() && t.push(es(n.content)), n.tool_calls.forEach((r, o) => {
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
        t.push(es(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? og(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function Rb(e) {
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
    if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
      n.content?.trim() && t.push(es(n.content)), n.tool_calls.forEach((r, o) => {
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
      t.push(es(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? og(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function xb(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function Mb(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function Nb(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function js(e, t) {
  const [n = "0", r = "0"] = String(e || "").split(":"), [o = "0", s = "0"] = String(t || "").split(":");
  return Number(n) - Number(o) || Number(r) - Number(s);
}
var kb = class {
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
    const n = {
      model: this.config.model,
      instructions: t ? void 0 : Cb(e) || void 0,
      input: t ? Rb(e) : Pb(e),
      ...Array.isArray(e.tools) && e.tools.length ? {
        tools: e.tools.map((r) => ({
          type: "function",
          name: r.function.name,
          description: r.function.description,
          parameters: r.function.parameters
        })),
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? { max_output_tokens: e.maxTokens } : {}
    };
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (n.temperature = e.temperature), e.reasoning?.enabled && (n.reasoning = {
      effort: e.reasoning.effort,
      ...e.reasoning.includeOutput !== !1 ? { summary: "auto" } : {}
    }), n;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = t.legacySystemInInput === !0, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), s = t.body || this.buildRequestBody(e, r);
    return Ir({
      provider: "openai-responses",
      model: this.config.model,
      transport: "openai-responses",
      url: `${o}/responses`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: s,
      sdk: n ? "client.responses.stream" : "client.responses.create",
      effectiveConfig: zt(e, {
        enabled: !!s.reasoning,
        effort: s.reasoning?.effort,
        includeOutput: !!s.reasoning?.summary
      })
    });
  }
  async chat(e) {
    let t = this.inspectRequest(e);
    const n = (c) => {
      const d = bb(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const h = Array.isArray(c.output) ? c.output : [];
      return {
        output: h,
        thoughts: e.reasoning?.includeOutput === !1 ? [] : wb(h),
        toolCalls: h.filter((f) => f.type === "function_call" && f.name).map((f, p) => ({
          id: f.call_id || `response-tool-${p + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: Ib(c)
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
        e.reasoning?.includeOutput !== !1 && (Array.from(p.entries()).sort(([v], [w]) => js(v, w)).forEach(([, v]) => ts(_, "推理文本", v)), Array.from(m.entries()).sort(([v], [w]) => js(v, w)).forEach(([, v]) => ts(_, "推理摘要", v))), Nb(e, {
          text: Array.from(f.entries()).sort(([v], [w]) => js(v, w)).map(([, v]) => v).join(`
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
    }, s = !xb(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await o(!1) : await r(!1), u = n(a), s && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), u = n(a));
    } catch (c) {
      if (!s || !Mb(c)) throw c;
      a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), u = n(a);
    }
    return {
      text: u.text,
      toolCalls: u.toolCalls,
      thoughts: u.thoughts,
      finishReason: a.incomplete_details?.reason || a.status || "stop",
      model: a.model || this.config.model,
      provider: "openai-responses",
      requestInspection: t
    };
  }
};
async function Db(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("host_chat_completions_stream_missing_body");
  const r = new TextDecoder();
  let o = "";
  const s = /\r?\n\r?\n/, a = (c) => {
    const d = c.split(/\r?\n/).filter((h) => h.startsWith("data:")).map((h) => h.slice(5).trimStart()).join(`
`).trim();
    !d || d === "[DONE]" || t(JSON.parse(d));
  };
  for (; ; ) {
    const { done: c, value: d } = await n.read();
    if (c) break;
    for (o += r.decode(d, { stream: !0 }); ; ) {
      const h = o.match(s);
      if (!h || typeof h.index != "number") break;
      const f = o.slice(0, h.index);
      o = o.slice(h.index + h[0].length), a(f);
    }
  }
  const u = o.trim();
  u && a(u);
}
var kn = "openai", za = "claude", Ya = "makersuite", $b = "/api/backends/chat-completions/status", Lb = "/api/backends/chat-completions/generate", sg = Object.freeze({
  [za]: "https://api.anthropic.com/v1",
  [Ya]: "https://generativelanguage.googleapis.com"
}), ig = null;
function Ub(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function Fb(e, t) {
  const n = Ub(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function Ob(e) {
  ig = typeof e == "function" ? e : null;
}
async function ag() {
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(ig?.() || {}),
    Accept: "application/json"
  };
}
function qb(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : r;
  }), t;
}
async function Gr(e = {}, t = !1) {
  const n = await ag(), r = {
    url: Lb,
    method: "POST",
    headers: qb(n),
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
function Bb(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function Gb(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function Hb() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function Nd(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function kd(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => Nd(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => Nd(n));
}
function Vb(e = "") {
  const t = String(e || ""), n = kd((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), r = kd(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), o = n || r;
  return o.length > 240 ? `${o.slice(0, 237)}...` : o;
}
function Jb(e = null) {
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
function Kb(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function wn(e = "", t = "", n = null) {
  if (Gb(e)) return Hb();
  const r = Jb(n);
  if (Bb(e) || /\btext\/html\b/i.test(r.contentType)) {
    const o = Kb(r), s = Vb(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      o ? `（${o}）` : "",
      s ? `：${s}` : ""
    ].join("");
  }
  return String(e || t || "").trim();
}
function lg(e = {}, t = kn) {
  const n = Fb(e.baseUrl, t), r = String(e.apiKey || "").trim(), o = sg[t] || "", s = n || (r ? o : ""), a = { chat_completion_source: t || "openai" };
  return s && (a.reverse_proxy = s), r && (a.proxy_password = r), a;
}
function Wb(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function zb(e = {}, t = kn) {
  return lg(e, t);
}
function Xa(e = {}, t = {}, n = [], r = !1, o = kn) {
  return Wb({
    ...lg(e, o),
    stream: !!r,
    messages: n,
    model: e.model,
    max_tokens: t.maxTokens,
    temperature: t.reasoning?.enabled ? void 0 : t.temperature,
    tools: Array.isArray(t.tools) && t.tools.length ? t.tools : void 0,
    tool_choice: Array.isArray(t.tools) && t.tools.length ? t.toolChoice || "auto" : void 0,
    use_sysprompt: o === "openai" ? void 0 : !0,
    reasoning_effort: t.reasoning?.enabled ? t.reasoning.effort : void 0,
    include_reasoning: o === "openai" ? void 0 : t.reasoning?.enabled ? t.reasoning.includeOutput !== !1 : void 0
  });
}
function Yb(e = {}, t = {}, n = [], r = !1) {
  return Xa(e, t, n, r, kn);
}
function Xb(e = {}, t = {}, n = [], r = !1) {
  return Xa(e, t, n, r, za);
}
function Qb(e = {}, t = {}, n = [], r = !1) {
  return Xa(e, t, n, r, Ya);
}
async function Zb(e = {}, t = kn, n = {}) {
  const r = await fetch($b, {
    method: "POST",
    headers: await ag(),
    body: JSON.stringify(zb(e, t)),
    signal: n.signal
  }), o = await r.text();
  let s = null;
  try {
    s = o ? JSON.parse(o) : {};
  } catch (u) {
    throw new Error(`酒馆后端模型列表拉取失败：${wn(o, String(u?.message || u), r)}`);
  }
  if (!r.ok || s?.error) {
    const u = wn(s?.message || s?.error?.message || o, `HTTP ${r.status}`, r);
    throw new Error(`酒馆后端模型列表拉取失败：${u}`);
  }
  const a = Array.isArray(s?.data) ? s.data.map((u) => String(u?.id || u?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(a)];
}
async function Qa(e = {}, t = {}) {
  const n = await Gr(e, !1);
  typeof t.onRequest == "function" && t.onRequest(n);
  const r = await fetch(n.url, {
    method: n.method,
    headers: n.rawHeaders || n.headers,
    body: JSON.stringify(n.body),
    signal: t.signal
  }), o = await r.text();
  let s = null;
  try {
    s = o ? JSON.parse(o) : {};
  } catch (a) {
    const u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${wn(o, String(a?.message || a), r)}`);
    throw u.status = r.status, u.body = o, u;
  }
  if (!r.ok || s?.error) {
    const a = wn(s?.error?.message || s?.message || o, `HTTP ${r.status}`, r), u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${a}`);
    throw u.status = r.status, u.error = s?.error, u;
  }
  return s;
}
async function Za(e = {}, t, n = {}) {
  const r = await Gr(e, !0);
  typeof n.onRequest == "function" && n.onRequest(r);
  const o = await fetch(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!o.ok) {
    const s = await o.text().catch(() => ""), a = new Error(wn(s, `酒馆后端流式生成失败：HTTP ${o.status}`, o));
    throw a.status = o.status, a.body = s, a;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await Db(o, (s) => {
    if (s?.error) {
      const a = wn(s.error?.message || s.message || JSON.stringify(s.error), "酒馆后端流式生成失败");
      throw new Error(a);
    }
    t(s);
  });
}
function Yt(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function jb(e) {
  const t = String(e || "").trim();
  if (!t || t === "auto") return "auto";
  if (t === "required") return "any";
  if (t === "none") return "none";
  throw new Error(`酒馆托管 Claude 不支持 tool_choice：${t}。仅支持 auto/required/none。`);
}
var e0 = /^claude-(3-7|opus-4|sonnet-4|haiku-4-5|opus-4-5|opus-4-6|sonnet-4-6|opus-4-7)/, t0 = /^claude-opus-4-7/;
function n0(e = {}, t = {}) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const n = jb(t.toolChoice), r = String(e.model || "").trim(), o = e0.test(r) && !t0.test(r);
  return {
    toolChoice: n,
    reasoningDisabledForForcedTool: n === "any" && t.reasoning?.enabled === !0 && o
  };
}
var r0 = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function o0(e = {}, t = {}) {
  const n = e.reasoning?.enabled === !0 && t.reasoningDisabledForForcedTool !== !0;
  return {
    toolChoice: String(t.toolChoice || ""),
    reasoningEnabled: n,
    reasoningEffort: n ? String(e.reasoning?.effort || "") : "",
    reasoningIncludeOutput: n && e.reasoning?.includeOutput !== !1
  };
}
function ug(e = "") {
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
function s0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const r = ug(t.function.arguments || "{}");
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
function i0(e = []) {
  const t = Array.isArray(e) ? Yt(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function a0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const s = Yt(o) || {}, a = i0(s?.providerPayload?.anthropicContent), u = s0(s.tool_calls);
    delete s.providerPayload, s.role === "assistant" && a && u.length ? (delete s.tool_calls, s.content = a.filter((c) => c?.type !== "tool_use").concat(u)) : s.role === "assistant" && a && (delete s.tool_calls, s.content = a), n.push(s);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function l0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const r = ug(t.inputJson);
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
      const n = Yt(t.input);
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
      thinking: String(t.thinking || t.text || "")
    } : t.type === "redacted_thinking" ? {
      type: "redacted_thinking",
      data: String(t.data || "")
    } : Yt(t) || null;
  }).filter(Boolean);
}
function u0(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: Yt(t.input) || {}
  } : Yt(t) || null).filter(Boolean);
}
function c0(e = []) {
  const t = Array.isArray(e) ? e : [], n = t.filter((s) => s?.type === "text").map((s) => s.text || "").join(`
`), r = t.filter((s) => s?.type === "thinking" || s?.type === "redacted_thinking").map((s) => ({
    label: s.type === "thinking" ? "思考块" : "已脱敏思考块",
    text: s.type === "thinking" ? s.thinking || "" : s.data || ""
  })).filter((s) => s.text), o = t.filter((s) => s?.type === "tool_use" && s.name).map((s, a) => ({
    id: s.id || `st-claude-tool-${a + 1}`,
    name: s.name,
    arguments: s.inputJson !== void 0 ? s.inputJson : JSON.stringify(s.input || {})
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
function cg(e = [], t = {}) {
  const n = l0(e), r = n.filter((o) => o.type === "tool_use" && o.name).map((o, s) => ({
    id: o.id || `st-claude-tool-${s + 1}`,
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
    providerPayload: n.length ? { anthropicContent: u0(n) } : void 0
  };
}
function d0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function f0(e, t = {}) {
  const n = [];
  let r = "stop", o = t.model || "";
  const s = (u, c = {}) => {
    const d = Number.isInteger(Number(u)) ? Number(u) : n.length;
    return n[d] ? n[d] = {
      ...n[d],
      ...c
    } : n[d] = { ...c }, n[d];
  }, a = () => {
    const u = c0(n);
    d0(e, {
      text: u.text,
      thoughts: e.reasoning?.includeOutput === !1 ? [] : u.thoughts,
      ...Array.isArray(u.toolCalls) ? { toolCalls: u.toolCalls } : {},
      ...u.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(u = {}) {
      if (u?.message?.model && (o = u.message.model), u.type === "content_block_start") {
        s(u.index, Yt(u.content_block) || {}), a();
        return;
      }
      if (u.type === "content_block_delta") {
        const c = s(u.index), d = u.delta || {};
        d.type === "text_delta" ? (c.type = c.type || "text", c.text = `${c.text || ""}${d.text || ""}`) : d.type === "input_json_delta" ? (c.type = c.type || "tool_use", c.inputJson = `${c.inputJson || ""}${d.partial_json || ""}`) : d.type === "thinking_delta" ? (c.type = c.type || "thinking", c.thinking = `${c.thinking || ""}${d.thinking || ""}`) : d.type === "signature_delta" && (c.signature = `${c.signature || ""}${d.signature || ""}`), a();
        return;
      }
      u.type === "message_delta" && (r = u.delta?.stop_reason || r);
    },
    result() {
      return cg(n, {
        finishReason: r,
        model: o,
        includeReasoningOutput: e.reasoning?.includeOutput !== !1
      });
    }
  };
}
var h0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return a0(e);
  }
  resolveToolProtocol(e) {
    return n0(this.config, e);
  }
  buildPayload(e, t = this.resolveToolProtocol(e)) {
    const n = typeof e.onStreamProgress == "function", r = this.buildMessages(e), o = {
      ...e,
      toolChoice: t.toolChoice,
      ...t.reasoningDisabledForForcedTool ? { reasoning: {
        ...e.reasoning || {},
        enabled: !1
      } } : {}
    };
    return Xb(this.config, o, r, n);
  }
  async inspectRequest(e, t = {}) {
    const n = this.resolveToolProtocol(e), r = await Gr(t.payload || this.buildPayload(e, n), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(r, n, e);
  }
  buildRequestInspection(e, t = {}, n = {}) {
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: En(e),
      effectiveConfig: o0(n, t),
      ...t.reasoningDisabledForForcedTool ? { notices: [r0] } : {}
    };
  }
  async chat(e) {
    const t = typeof e.onStreamProgress == "function", n = this.resolveToolProtocol(e), r = this.buildPayload(e, n);
    let o = null;
    const s = (a) => {
      o = this.buildRequestInspection(a, n, e);
    };
    try {
      if (t) {
        const u = f0(e, this.config);
        return await Za(r, (c) => {
          u.accept(c);
        }, {
          signal: e.signal,
          onRequest: s
        }), {
          ...u.result(),
          requestInspection: o
        };
      }
      const a = await Qa(r, {
        signal: e.signal,
        onRequest: s
      });
      return {
        ...cg(Array.isArray(a?.content) ? a.content : [{
          type: "text",
          text: a?.choices?.[0]?.message?.content || ""
        }], {
          finishReason: a?.stop_reason || a?.choices?.[0]?.finish_reason || "stop",
          model: a?.model || this.config.model,
          includeReasoningOutput: e.reasoning?.includeOutput !== !1
        }),
        requestInspection: o
      };
    } catch (a) {
      throw o && a && typeof a == "object" && (a.requestInspection = o), a;
    }
  }
};
function ja(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Cn(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = ja(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function p0(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((o) => Cn(o)).filter((o) => Array.isArray(o.parts) && o.parts.length);
  const n = e?.providerPayload?.googleContent, r = Cn(n);
  return r.parts.length ? [r] : [];
}
function m0(e = {}) {
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
function g0(e = {}, t = 0) {
  const n = Cn(e);
  if (!n.parts.length) return null;
  const r = {
    role: n.role === "user" ? "user" : "assistant",
    content: []
  }, o = n.parts.find((a) => !a?.thought && typeof a?.text == "string" && typeof a?.thoughtSignature == "string" && a.thoughtSignature)?.thoughtSignature || "", s = [];
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
      s.push({
        id: String(a.functionCall.id || `st-google-tool-${t + 1}-${s.length + 1}`),
        type: "function",
        function: {
          name: String(a.functionCall.name || ""),
          arguments: JSON.stringify(a.functionCall.args || {})
        },
        ...typeof a.thoughtSignature == "string" && a.thoughtSignature ? { signature: a.thoughtSignature } : {}
      });
      return;
    }
    const u = m0(a.inlineData);
    u && r.content.push(u);
  }), s.length && r.content.push({
    type: "tool_calls",
    tool_calls: s
  }), o && r.content.some((a) => a?.type === "text") && (r.signature = o), r.content.length ? r : null;
}
function y0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const s = p0(o);
    if (o.role === "assistant" && s.length) {
      s.forEach((u, c) => {
        const d = g0(u, c);
        d && n.push(d);
      });
      return;
    }
    const a = ja(o) || {};
    delete a.providerPayload, n.push(a);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function dg(e = {}) {
  return Cn(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function fg(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function hg(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function pg(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function _0(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
function v0(e = [], t = []) {
  const n = Array.isArray(e) ? [...e] : [];
  return t.forEach((r) => {
    const o = [
      r.id || "",
      r.name || "",
      r.arguments || ""
    ].join("\0");
    n.some((s) => [
      s.id || "",
      s.name || "",
      s.arguments || ""
    ].join("\0") === o) || n.push(r);
  }), n;
}
function mg(e) {
  const t = Cn(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function A0(e = {}, t = {}) {
  const n = dg(e), r = e?.choices?.[0]?.message?.content || "";
  return {
    text: fg(n) || r,
    toolCalls: pg(n),
    thoughts: t.includeReasoningOutput === !1 ? [] : hg(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: mg(n)
  };
}
function S0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function T0(e, t = {}) {
  let n = "", r = [], o = [], s = "STOP", a = t.model || "";
  const u = [];
  return {
    accept(c = {}) {
      a = c.model || c.modelVersion || a, s = c?.candidates?.[0]?.finishReason || s;
      const d = dg(c);
      d.parts.length && u.push(...ja(d.parts) || []), n = _0(n, fg(d)), r = v0(r, pg(d));
      const h = e.reasoning?.includeOutput === !1 ? [] : hg(d);
      h.length && (o = h), S0(e, {
        text: n,
        thoughts: o,
        ...r.length ? {
          toolCalls: r,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const c = Cn({
        role: "model",
        parts: u.length ? u : n ? [{ text: n }] : []
      });
      return {
        text: n,
        toolCalls: r,
        thoughts: o,
        finishReason: s,
        model: a,
        provider: "sillytavern-google",
        providerPayload: mg(c)
      };
    }
  };
}
var E0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return y0(e);
  }
  buildPayload(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildMessages(e);
    return Qb(this.config, e, n, t);
  }
  async inspectRequest(e, t = {}) {
    const n = await Gr(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = Object.prototype.hasOwnProperty.call(e?.body || {}, "reasoning_effort");
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: En(e),
      effectiveConfig: zt(t, {
        enabled: n,
        effort: e?.body?.reasoning_effort,
        includeOutput: e?.body?.include_reasoning === !0
      })
    };
  }
  async chat(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildPayload(e);
    let r = null;
    const o = (s) => {
      r = this.buildRequestInspection(s, e);
    };
    try {
      if (t) {
        const s = T0(e, this.config);
        return await Za(n, (a) => {
          s.accept(a);
        }, {
          signal: e.signal,
          onRequest: o
        }), {
          ...s.result(),
          requestInspection: r
        };
      }
      return {
        ...A0(await Qa(n, {
          signal: e.signal,
          onRequest: o
        }), {
          model: this.config.model,
          includeReasoningOutput: e.reasoning?.includeOutput !== !1
        }),
        requestInspection: r
      };
    } catch (s) {
      throw r && s && typeof s == "object" && (s.requestInspection = r), s;
    }
  }
};
function w0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function ei(e, t = []) {
  const n = Ht(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : Vt(n.cleaned)
  };
}
function C0(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var I0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? Xi(e, this.config.model) : Yi(e, this.config.model);
  }
  buildPayload(e, t = !1) {
    const n = t ? Xi(e, this.config.model) : Yi(e, this.config.model), r = Yb(this.config, t ? {
      ...e,
      tools: void 0,
      toolChoice: void 0
    } : e, n, typeof e.onStreamProgress == "function");
    return e.reasoning?.enabled && tg(this.config) && delete r.reasoning_effort, r;
  }
  async inspectRequest(e, t = {}) {
    const n = await Gr(t.payload || this.buildPayload(e, !!t.taggedMode), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = !!t.reasoning?.enabled && !Object.prototype.hasOwnProperty.call(e?.body || {}, "reasoning_effort"), r = Object.prototype.hasOwnProperty.call(e?.body || {}, "reasoning_effort");
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: En(e),
      effectiveConfig: zt(t, {
        enabled: r,
        effort: e?.body?.reasoning_effort,
        includeOutput: !1
      }),
      ...n ? { degraded: ["reasoning_effort_unsupported"] } : {}
    };
  }
  async streamChat(e, t, n = {}) {
    const r = { role: "assistant" };
    let o = "stop", s = this.config.model;
    await Za(t, (f) => {
      s = f?.model || s;
      const p = f?.choices?.[0] || {};
      Qi(r, p), p.finish_reason && (o = p.finish_reason);
      const m = yn(r), { thinkTagged: y, cleanedText: _ } = ei(gn(r), m), v = m.length ? m : Wi(y.cleaned);
      w0(e, {
        text: _,
        thoughts: xt(r, p).concat(y.thoughts),
        ...v.length ? { toolCalls: v } : {},
        ...!m.length && v.length ? { toolCallDraft: !0 } : {}
      });
    }, {
      signal: e.signal,
      onRequest: n.onRequest,
      onResponseAccepted: n.onResponseAccepted
    }), _n(r);
    const a = yn(r), { thinkTagged: u, cleanedText: c } = ei(gn(r), a), d = xt(r, {});
    u.thoughts.forEach((f) => d.push(f));
    const h = a.length ? [] : Ar(u.cleaned);
    return {
      text: c,
      toolCalls: [...a, ...h],
      thoughts: d,
      finishReason: o,
      model: s,
      provider: "sillytavern-openai-compatible",
      providerPayload: Sr(r)
    };
  }
  async nonStreamingChat(e, t, n = {}) {
    const r = await Qa(t, {
      signal: e.signal,
      onRequest: n.onRequest
    }), o = r.choices?.[0] || {}, s = o.message || {};
    _n(s);
    const a = xt(s, o), u = Ja(s.tool_calls || []), { thinkTagged: c, cleanedText: d } = ei(Ka(s.content), u);
    c.thoughts.forEach((p) => a.push(p));
    const h = u.length ? [] : Ar(c.cleaned), f = Qo(s, o);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: a,
      finishReason: o.finish_reason || "stop",
      model: r.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: Sr(f)
    };
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = Array.isArray(e.tools) && e.tools.length > 0, r = async (a, u = {}) => {
      let c = null;
      const d = (h) => {
        c = this.buildRequestInspection(h, e);
      };
      try {
        return {
          ...typeof e.onStreamProgress == "function" ? await this.streamChat(e, a, {
            onRequest: d,
            onResponseAccepted: u.onResponseAccepted
          }) : await this.nonStreamingChat(e, a, { onRequest: d }),
          requestInspection: c
        };
      } catch (h) {
        throw c && h && typeof h == "object" && (h.requestInspection = c), h;
      }
    }, o = async (a) => {
      let u = !1;
      try {
        return await r(a, { onResponseAccepted: () => {
          u = !0;
        } });
      } catch (c) {
        if (e.signal?.aborted || u || !Object.prototype.hasOwnProperty.call(a, "reasoning_effort") || !rg(c)) throw c;
        ng(this.config);
        const d = { ...a };
        return delete d.reasoning_effort, await r(d);
      }
    }, s = this.buildPayload(e, t);
    try {
      return await o(s);
    } catch (a) {
      if (e.allowToolProtocolFallback === !1 || t || !n || !C0(a)) throw a;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await o(this.buildPayload(e, !0));
  }
}, Dd = 900 * 1e3, $d = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), b0 = Object.freeze([
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
function P0(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function $e(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, r = Number(n);
  return Number.isFinite(r) ? Math.max(0, Math.min(2, r)) : $e(t, 1);
}
function Tn(e = {}) {
  return e.sendTemperature !== !1;
}
function Ld(e = {}) {
  return Tn(e) ? $e(e.temperature, 1) : void 0;
}
function Ud(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : b0.find((n) => n.value === e)?.label || e || "未配置";
}
function R0(e = {}, t = {}) {
  const n = Ao(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const c = n.delegateConfig.provider || "openai-compatible", d = (n.delegateConfig.modelConfigs || cn())[c] || cn()[c] || {};
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: c,
      baseUrl: String(d.baseUrl || ""),
      model: String(d.model || ""),
      apiKey: String(d.apiKey || ""),
      tavilyApiKey: ti(n.tavilyApiKey),
      tavilyBaseUrl: Je(n.tavilyBaseUrl),
      temperature: Ld(d),
      sendTemperature: Tn(d),
      maxTokens: we(d.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: d.toolMode || "native",
      ...Lo(c, d)
    };
  }
  const r = oe(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), o = n.presets?.[r] ? r : n.presets?.[n.currentPresetName] ? n.currentPresetName : rs, s = n.presets?.[o] || Te(), a = s.provider || n.provider || "openai-compatible", u = (s.modelConfigs || n.modelConfigs || cn())[a] || cn()[a] || {};
  return {
    currentPresetName: String(o || ""),
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    tavilyApiKey: ti(n.tavilyApiKey),
    tavilyBaseUrl: Je(n.tavilyBaseUrl),
    temperature: Ld(u),
    sendTemperature: Tn(u),
    maxTokens: we(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    ...Lo(a, u)
  };
}
function x0(e = {}, t = {}) {
  if (!e.apiKey && !P0(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (e.provider) {
    case "sillytavern-openai-compatible":
      return new I0(e);
    case "sillytavern-claude":
      return new h0(e);
    case "sillytavern-google":
      return new E0(e);
    case "openai-responses":
      return new kb(e);
    case "anthropic":
      return new Oy(e);
    case "google":
      return new UC(e);
    default:
      return new Tb(e);
  }
}
var M0 = { chat: { exclude: [
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
] } }, N0 = Object.freeze([
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
function it(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const r = document.createElement("option");
    r.value = "", r.textContent = n, e.appendChild(r);
  }
  t.forEach((r) => {
    const o = document.createElement("option");
    o.value = r.value, o.textContent = r.label, e.appendChild(o);
  });
}
function xr(e = []) {
  const t = [...new Set(e.filter(Boolean).map((o) => String(o).trim()).filter(Boolean))], n = M0.chat, r = t.filter((o) => {
    const s = o.toLowerCase();
    return !n.exclude.some((a) => s.includes(a));
  });
  return r.length ? r : t;
}
function vo(e = "") {
  return e === "delegate" ? "delegate" : "main";
}
function In(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function k0(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function rn(e = "") {
  return e === "openai-compatible" || e === "sillytavern-openai-compatible";
}
function D0(e = "") {
  return e === "anthropic" || e === "sillytavern-claude";
}
function $0(e = "") {
  return e === "sillytavern-claude" ? za : e === "sillytavern-google" ? Ya : kn;
}
function Mr(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function L0(e) {
  const t = In(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return Mr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return Mr([`${t}/v1/models`, `${t}/models`]);
}
function gg(e) {
  const t = In(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return Mr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return Mr([`${t}/v1/models`, `${t}/models`]);
}
function U0(e, t) {
  const n = In(e);
  if (!n) return [];
  const r = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return Mr([
    `${n}/models?key=${encodeURIComponent(t)}`,
    `${n}/models`,
    `${r}/v1beta/models?key=${encodeURIComponent(t)}`,
    `${r}/v1beta/models`,
    `${r}/models?key=${encodeURIComponent(t)}`,
    `${r}/models`
  ]);
}
function F0(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((r) => typeof r == "string" && r.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function O0(e, t = {}) {
  const n = await fetch(e, t), r = await n.text();
  let o = null, s = null;
  try {
    o = r ? JSON.parse(r) : {};
  } catch (a) {
    s = a;
  }
  return {
    ok: n.ok,
    status: n.status,
    url: e,
    data: o,
    rawText: r,
    parseError: s,
    errorSnippet: F0(o, r)
  };
}
function q0(e) {
  return xr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function yg(e) {
  return xr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function B0(e) {
  return xr((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function $o({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: r }) {
  let o = null;
  for (const s of e) for (const a of t) {
    const u = await O0(s, a);
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
    const s = o.url ? ` (${o.url})` : "", a = o.errorSnippet ? `：${o.errorSnippet}` : "";
    throw new Error(`${r} 拉取模型失败：${o.status || "unknown"}${a}${s}`);
  }
  throw new Error(`${r} 拉取模型失败：未获取到模型列表。`);
}
async function G0(e) {
  const t = String(e.apiKey || "").trim(), n = In(e.baseUrl || ""), r = In(n || sg.claude);
  if (t && r) try {
    return await $o({
      urls: gg(r),
      requestOptionsList: [{ headers: {
        "x-api-key": t,
        "anthropic-version": "2023-06-01",
        Accept: "application/json"
      } }],
      extractModels: yg,
      providerLabel: "Anthropic"
    });
  } catch (o) {
    if (n) throw o;
  }
  return [...N0];
}
async function Fd(e) {
  const t = e.provider, n = In(e.baseUrl || ""), r = String(e.apiKey || "").trim();
  if (t === "sillytavern-claude") return xr(await G0(e));
  if (k0(t)) return xr(await Zb(e, $0(t)));
  if (!r) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await $o({
    urls: U0(n, r),
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
    extractModels: B0,
    providerLabel: "Google AI"
  }) : D0(t) ? await $o({
    urls: gg(n),
    requestOptionsList: [{ headers: {
      "x-api-key": r,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: yg,
    providerLabel: "Anthropic"
  }) : await $o({
    urls: L0(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${r}`,
      Accept: "application/json"
    } }],
    extractModels: q0,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function H0(e) {
  return e instanceof Error ? e.message : String(e || "unknown_error");
}
function Y0(e = {}) {
  const { state: t, render: n, showToast: r, createRequestId: o = (g = "req") => `${g}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, saveConfig: s, reloadConfig: a, describeError: u = H0, getRuntimeSummaryText: c } = e;
  function d() {
    t.configFormSyncPending = !0;
  }
  function h(g, T = "main") {
    const I = String(g || "").trim() || "openai-compatible";
    return T === "delegate" ? `delegate:${I}` : I;
  }
  function f(g, T = "main") {
    return t.pullStateByProvider?.[h(g, T)] || {
      status: "idle",
      message: ""
    };
  }
  function p(g, T, I = "main") {
    t.pullStateByProvider = {
      ...t.pullStateByProvider || {},
      [h(g, I)]: T
    };
  }
  function m(g, T, I = "main") {
    t.modelOptionsByProvider = {
      ...t.modelOptionsByProvider || {},
      [h(g, I)]: Array.isArray(T) ? T : []
    };
  }
  function y(g, T = "main") {
    const I = h(g, T);
    return Array.isArray(t.modelOptionsByProvider?.[I]) ? t.modelOptionsByProvider[I] : [];
  }
  function _(g, T) {
    const I = t.config?.presets || {}, L = oe(g || T || "默认");
    return I[L] ? L : T && I[T] ? T : Object.keys(I)[0] || "默认";
  }
  function v(g, T) {
    const I = _(g, rs), L = T && typeof T == "object" ? T : Te(), G = L.provider || "openai-compatible", Z = Le(L.modelConfigs || {}), re = Z[G] || {};
    return {
      delegatePresetName: I,
      delegateProvider: G,
      delegateModelConfigs: Z,
      delegateBaseUrl: String(re.baseUrl || ""),
      delegateModel: String(re.model || ""),
      delegateApiKey: String(re.apiKey || ""),
      delegateTemperature: $e(re.temperature, 1),
      delegateMaxTokens: we(re.maxTokens),
      delegateSendTemperature: Tn(re),
      delegateReasoningEnabled: !!re.reasoningEnabled,
      delegateReasoningEffort: Ve(re.reasoningEffort, G),
      delegateReasoningIncludeOutput: gt(re.reasoningIncludeOutput, G),
      delegateToolMode: re.toolMode || "native"
    };
  }
  function w(g = "openai-compatible", T = {}) {
    const I = Le(T || {})[g] || {};
    return {
      baseUrl: String(I.baseUrl || ""),
      model: String(I.model || ""),
      apiKey: String(I.apiKey || ""),
      temperature: $e(I.temperature, 1),
      maxTokens: we(I.maxTokens),
      sendTemperature: Tn(I),
      reasoningEnabled: !!I.reasoningEnabled,
      reasoningEffort: Ve(I.reasoningEffort, g),
      reasoningIncludeOutput: gt(I.reasoningIncludeOutput, g),
      toolMode: I.toolMode || "native"
    };
  }
  function b(g = "openai-compatible", T = {}) {
    const I = Le(T || {})[g] || {};
    return {
      delegateBaseUrl: String(I.baseUrl || ""),
      delegateModel: String(I.model || ""),
      delegateApiKey: String(I.apiKey || ""),
      delegateTemperature: $e(I.temperature, 1),
      delegateMaxTokens: we(I.maxTokens),
      delegateSendTemperature: Tn(I),
      delegateReasoningEnabled: !!I.reasoningEnabled,
      delegateReasoningEffort: Ve(I.reasoningEffort, g),
      delegateReasoningIncludeOutput: gt(I.reasoningIncludeOutput, g),
      delegateToolMode: I.toolMode || "native"
    };
  }
  function P(g, T, I = t.config) {
    const L = oe(g || "默认"), G = T && typeof T == "object" ? T : Te(), Z = G.provider || "openai-compatible", re = Le(G.modelConfigs || {}), ut = w(Z, re), ct = _(I?.delegatePresetName, L), Vr = v(ct, I?.delegateConfig && typeof I.delegateConfig == "object" ? I.delegateConfig : (I?.presets || {})[ct] || G);
    return {
      currentPresetName: L,
      presetDraftName: L,
      provider: Z,
      modelConfigs: re,
      ...ut,
      tavilyApiKey: String(I?.tavilyApiKey || ""),
      tavilyBaseUrl: Je(I?.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: dn(G.permissionMode),
      jsApiPermission: _t(I?.jsApiPermission),
      ...Vr
    };
  }
  function x() {
    if (t.configDraft) return t.configDraft;
    const g = oe(t.config?.currentPresetName || "默认");
    return t.configDraft = P(g, (t.config?.presets || {})[g] || Te()), t.configDraft;
  }
  function $(g) {
    const T = x(), I = g.querySelector("#xb-assistant-provider")?.value || T.provider || "openai-compatible", L = g.querySelector("#xb-assistant-delegate-provider")?.value || T.delegateProvider || "openai-compatible", G = {
      baseUrl: g.querySelector("#xb-assistant-base-url")?.value.trim() || "",
      model: g.querySelector("#xb-assistant-model")?.value.trim() || "",
      apiKey: g.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      temperature: $e(g.querySelector("#xb-assistant-temperature")?.value, T.temperature ?? 1),
      maxTokens: we(g.querySelector("#xb-assistant-max-tokens")?.value, T.maxTokens),
      sendTemperature: g.querySelector("#xb-assistant-send-temperature")?.checked ?? !!(T.sendTemperature ?? !0),
      reasoningEnabled: g.querySelector("#xb-assistant-reasoning-enabled")?.checked || !1,
      reasoningEffort: Ve(g.querySelector("#xb-assistant-reasoning-effort")?.value, I),
      reasoningIncludeOutput: g.querySelector("#xb-assistant-reasoning-include-output")?.checked ?? !!T.reasoningIncludeOutput,
      toolMode: rn(I) ? g.querySelector("#xb-assistant-tool-mode")?.value || T.toolMode || "native" : void 0
    }, Z = {
      baseUrl: g.querySelector("#xb-assistant-delegate-base-url")?.value.trim() ?? T.delegateBaseUrl ?? "",
      model: g.querySelector("#xb-assistant-delegate-model")?.value.trim() ?? T.delegateModel ?? "",
      apiKey: g.querySelector("#xb-assistant-delegate-api-key")?.value.trim() ?? T.delegateApiKey ?? "",
      temperature: $e(g.querySelector("#xb-assistant-delegate-temperature")?.value, T.delegateTemperature ?? 1),
      maxTokens: we(g.querySelector("#xb-assistant-delegate-max-tokens")?.value, T.delegateMaxTokens),
      sendTemperature: g.querySelector("#xb-assistant-delegate-send-temperature")?.checked ?? !!(T.delegateSendTemperature ?? !0),
      reasoningEnabled: g.querySelector("#xb-assistant-delegate-reasoning-enabled")?.checked ?? !!T.delegateReasoningEnabled,
      reasoningEffort: Ve(g.querySelector("#xb-assistant-delegate-reasoning-effort")?.value || T.delegateReasoningEffort, L),
      reasoningIncludeOutput: g.querySelector("#xb-assistant-delegate-reasoning-include-output")?.checked ?? !!T.delegateReasoningIncludeOutput,
      toolMode: rn(L) ? g.querySelector("#xb-assistant-delegate-tool-mode")?.value || T.delegateToolMode || "native" : void 0
    }, re = {
      ...Le(T.modelConfigs || {}),
      [I]: {
        ...Le(T.modelConfigs || {})[I] || {},
        ...G
      }
    }, ut = {
      ...Le(T.delegateModelConfigs || {}),
      [L]: {
        ...Le(T.delegateModelConfigs || {})[L] || {},
        ...Z
      }
    };
    return {
      ...T,
      currentPresetName: T.currentPresetName,
      presetDraftName: oe(g.querySelector("#xb-assistant-preset-name")?.value),
      provider: I,
      modelConfigs: re,
      baseUrl: G.baseUrl,
      model: G.model,
      apiKey: G.apiKey,
      temperature: G.temperature,
      maxTokens: G.maxTokens,
      sendTemperature: G.sendTemperature,
      reasoningEnabled: G.reasoningEnabled,
      reasoningEffort: G.reasoningEffort,
      reasoningIncludeOutput: G.reasoningIncludeOutput,
      toolMode: G.toolMode || T.toolMode || "native",
      tavilyApiKey: g.querySelector("#xb-assistant-tavily-api-key")?.value.trim() || "",
      tavilyBaseUrl: Je(T.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: dn(g.querySelector("#xb-assistant-permission-mode")?.value || T.permissionMode),
      jsApiPermission: _t(g.querySelector("#xb-assistant-jsapi-permission")?.value || T.jsApiPermission),
      delegatePresetName: _(g.querySelector("#xb-assistant-delegate-preset-select")?.value || T.delegatePresetName, T.currentPresetName),
      delegateProvider: L,
      delegateModelConfigs: ut,
      delegateBaseUrl: Z.baseUrl,
      delegateModel: Z.model,
      delegateApiKey: Z.apiKey,
      delegateTemperature: Z.temperature,
      delegateMaxTokens: Z.maxTokens,
      delegateSendTemperature: Z.sendTemperature,
      delegateReasoningEnabled: Z.reasoningEnabled,
      delegateReasoningEffort: Z.reasoningEffort,
      delegateReasoningIncludeOutput: Z.reasoningIncludeOutput,
      delegateToolMode: Z.toolMode || T.delegateToolMode || "native"
    };
  }
  function S(g) {
    return t.configDraft = $(g), t.configDirty = !0, t.configDraft;
  }
  function O(g = x()) {
    return {
      baseUrl: String(g.baseUrl || ""),
      model: String(g.model || ""),
      apiKey: String(g.apiKey || ""),
      temperature: $e(g.temperature, 1),
      maxTokens: we(g.maxTokens),
      sendTemperature: !!(g.sendTemperature ?? !0),
      reasoningEnabled: !!g.reasoningEnabled,
      reasoningEffort: Ve(g.reasoningEffort, g.provider),
      reasoningIncludeOutput: gt(g.reasoningIncludeOutput, g.provider),
      toolMode: rn(g.provider) ? g.toolMode || "native" : void 0
    };
  }
  function R(g = x()) {
    return {
      baseUrl: String(g.delegateBaseUrl || ""),
      model: String(g.delegateModel || ""),
      apiKey: String(g.delegateApiKey || ""),
      temperature: $e(g.delegateTemperature, 1),
      maxTokens: we(g.delegateMaxTokens),
      sendTemperature: !!(g.delegateSendTemperature ?? !0),
      reasoningEnabled: !!g.delegateReasoningEnabled,
      reasoningEffort: Ve(g.delegateReasoningEffort, g.delegateProvider),
      reasoningIncludeOutput: gt(g.delegateReasoningIncludeOutput, g.delegateProvider),
      toolMode: rn(g.delegateProvider) ? g.delegateToolMode || "native" : void 0
    };
  }
  function k(g = x()) {
    const T = g.delegateProvider || "openai-compatible", I = Le(g.delegateModelConfigs || {});
    return {
      provider: T,
      modelConfigs: {
        ...I,
        [T]: {
          ...I[T] || {},
          ...R(g)
        }
      }
    };
  }
  function H(g = x()) {
    return {
      provider: g.provider || "openai-compatible",
      baseUrl: g.baseUrl || "",
      model: g.model || "",
      apiKey: g.apiKey || "",
      tavilyApiKey: g.tavilyApiKey || "",
      tavilyBaseUrl: Je(g.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: g.sendTemperature === !1 ? void 0 : $e(g.temperature, 1),
      sendTemperature: !!(g.sendTemperature ?? !0),
      maxTokens: we(g.maxTokens),
      timeoutMs: Dd,
      toolMode: g.toolMode || "native",
      ...Lo(g.provider, g)
    };
  }
  function z(g = x()) {
    return {
      provider: g.delegateProvider || "openai-compatible",
      baseUrl: g.delegateBaseUrl || "",
      model: g.delegateModel || "",
      apiKey: g.delegateApiKey || "",
      tavilyApiKey: g.tavilyApiKey || "",
      tavilyBaseUrl: Je(g.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: g.delegateSendTemperature === !1 ? void 0 : $e(g.delegateTemperature, 1),
      sendTemperature: !!(g.delegateSendTemperature ?? !0),
      maxTokens: we(g.delegateMaxTokens),
      timeoutMs: Dd,
      toolMode: g.delegateToolMode || "native",
      ...Lo(g.delegateProvider, {
        reasoningEnabled: g.delegateReasoningEnabled,
        reasoningEffort: g.delegateReasoningEffort,
        reasoningIncludeOutput: g.delegateReasoningIncludeOutput
      })
    };
  }
  function se(g = {}) {
    const T = (g.role === "delegate", x());
    return g.role === "delegate" ? z(T) : H(T);
  }
  function j(g) {
    x(), t.configDraft = {
      ...t.configDraft,
      presetDraftName: oe(g.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function Q(g = x(), T = g.provider || "openai-compatible", I = "main") {
    const L = f(T, I);
    return typeof c == "function" ? c({
      state: t,
      draft: g,
      provider: T,
      pullState: L,
      providerLabel: Ud(T)
    }) : `预设「${g.currentPresetName || "默认"}」 · ${Ud(T)}`;
  }
  function X(g, T, I) {
    const L = g?.querySelector?.(T);
    if (!L) return;
    const G = String(I?.status || "idle"), Z = String(I?.message || "").trim();
    L.textContent = Z, L.hidden = !Z, L.classList.toggle("is-loading", G === "loading"), L.classList.toggle("is-success", G === "success"), L.classList.toggle("is-error", G === "error");
  }
  function he(g) {
    if (!g) return;
    const T = vo(t.configPage);
    t.configPage = T, g.querySelectorAll("[data-config-page]").forEach((I) => {
      const L = vo(I?.dataset?.configPage) === T;
      I.classList.toggle("is-active", L), I.setAttribute("aria-selected", L ? "true" : "false");
    }), g.querySelectorAll("[data-config-page-panel]").forEach((I) => {
      const L = vo(I?.dataset?.configPagePanel) === T;
      I.toggleAttribute("hidden", !L);
    }), g.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("hidden", T === "delegate");
  }
  function qe(g) {
    if (!t.config) return;
    he(g);
    const T = x(), I = T.provider || "openai-compatible", L = y(I), G = T.delegateProvider || "openai-compatible", Z = y(G, "delegate"), re = g.querySelector("#xb-assistant-provider"), ut = g.querySelector("#xb-assistant-base-url"), ct = g.querySelector("#xb-assistant-model"), Vr = g.querySelector("#xb-assistant-api-key"), tl = g.querySelector("#xb-assistant-temperature"), nl = g.querySelector("#xb-assistant-send-temperature"), rl = g.querySelector("#xb-assistant-tool-mode-wrap"), Es = g.querySelector("#xb-assistant-tool-mode"), ol = g.querySelector("#xb-assistant-reasoning-enabled"), sl = g.querySelector("#xb-assistant-reasoning-effort-wrap"), ws = g.querySelector("#xb-assistant-reasoning-effort"), il = g.querySelector("#xb-assistant-reasoning-include-output-wrap"), al = g.querySelector("#xb-assistant-reasoning-include-output"), Cs = g.querySelector("#xb-assistant-permission-mode"), Is = g.querySelector("#xb-assistant-jsapi-permission"), bs = g.querySelector("#xb-assistant-model-pulled"), ll = g.querySelector("#xb-assistant-max-tokens"), Ps = g.querySelector("#xb-assistant-preset-select"), ul = g.querySelector("#xb-assistant-preset-name"), Rs = g.querySelector("#xb-assistant-delegate-preset-select"), cl = g.querySelector("#xb-assistant-delegate-provider"), dl = g.querySelector("#xb-assistant-delegate-base-url"), fl = g.querySelector("#xb-assistant-delegate-model"), hl = g.querySelector("#xb-assistant-delegate-api-key"), pl = g.querySelector("#xb-assistant-tavily-api-key"), xs = g.querySelector("#xb-assistant-delegate-model-pulled"), ml = g.querySelector("#xb-assistant-delegate-max-tokens"), gl = g.querySelector("#xb-assistant-delegate-tool-mode-wrap"), Ms = g.querySelector("#xb-assistant-delegate-tool-mode"), yl = g.querySelector("#xb-assistant-delegate-reasoning-enabled"), _l = g.querySelector("#xb-assistant-delegate-reasoning-effort-wrap"), Ns = g.querySelector("#xb-assistant-delegate-reasoning-effort"), vl = g.querySelector("#xb-assistant-delegate-reasoning-include-output-wrap"), Al = g.querySelector("#xb-assistant-delegate-reasoning-include-output");
    if (!Ps || !ul) return;
    const Sl = (t.config.presetNames || []).map((Be) => ({
      value: Be,
      label: Be
    }));
    it(Ps, Sl), Ps.value = T.currentPresetName || t.config.currentPresetName || "默认", Rs && (it(Rs, Sl), Rs.value = _(T.delegatePresetName, T.currentPresetName)), ul.value = T.presetDraftName || T.currentPresetName || "默认", re && (re.value = I), ut && (ut.value = T.baseUrl || ""), ct && (ct.value = T.model || ""), Vr && (Vr.value = T.apiKey || ""), ll && (ll.value = String(we(T.maxTokens))), tl && (tl.value = String($e(T.temperature, 1))), nl && (nl.checked = !!(T.sendTemperature ?? !0)), pl && (pl.value = T.tavilyApiKey || ""), rl && (rl.style.display = rn(I) ? "" : "none"), Es && (it(Es, $d), Es.value = T.toolMode || "native"), Cs && (it(Cs, Dg), Cs.value = dn(T.permissionMode)), Is && (it(Is, $g), Is.value = _t(T.jsApiPermission)), ws && (it(ws, Cl(I)), ws.value = Ve(T.reasoningEffort, I)), ol && (ol.checked = !!T.reasoningEnabled), sl && (sl.style.display = T.reasoningEnabled ? "" : "none"), al && (al.checked = gt(T.reasoningIncludeOutput, I)), il && (il.style.display = T.reasoningEnabled && Er(I).includeOutput ? "" : "none"), bs && (it(bs, L.map((Be) => ({
      value: Be,
      label: Be
    })), "手动填写"), bs.value = L.includes(T.model) ? T.model : ""), cl && (cl.value = G), dl && (dl.value = T.delegateBaseUrl || ""), fl && (fl.value = T.delegateModel || ""), hl && (hl.value = T.delegateApiKey || "");
    const Tl = g.querySelector("#xb-assistant-delegate-temperature"), El = g.querySelector("#xb-assistant-delegate-send-temperature");
    ml && (ml.value = String(we(T.delegateMaxTokens))), Tl && (Tl.value = String($e(T.delegateTemperature, 1))), El && (El.checked = !!(T.delegateSendTemperature ?? !0)), gl && (gl.style.display = rn(G) ? "" : "none"), Ms && (it(Ms, $d), Ms.value = T.delegateToolMode || "native"), Ns && (it(Ns, Cl(G)), Ns.value = Ve(T.delegateReasoningEffort, G)), yl && (yl.checked = !!T.delegateReasoningEnabled), _l && (_l.style.display = T.delegateReasoningEnabled ? "" : "none"), Al && (Al.checked = gt(T.delegateReasoningIncludeOutput, G)), vl && (vl.style.display = T.delegateReasoningEnabled && Er(G).includeOutput ? "" : "none"), xs && (it(xs, Z.map((Be) => ({
      value: Be,
      label: Be
    })), "手动填写"), xs.value = Z.includes(T.delegateModel) ? T.delegateModel : ""), X(g, "#xb-assistant-model-pull-status", f(I)), X(g, "#xb-assistant-delegate-model-pull-status", f(G, "delegate"));
    const wl = g.querySelector("#xb-assistant-runtime");
    if (wl) {
      const Be = t.configPage === "delegate";
      wl.textContent = Q(Be ? {
        ...T,
        currentPresetName: "分身",
        provider: G
      } : T, Be ? G : I, Be ? "delegate" : "main");
    }
  }
  function ot(g) {
    if (typeof s != "function") return;
    const T = s(g);
    T && typeof T.catch == "function" && T.catch((I) => {
      r?.(u(I));
    });
  }
  function _e(g, T, I) {
    g.querySelector(T)?.addEventListener("click", () => {
      const L = g.querySelector(I);
      L && (L.type = L.type === "password" ? "text" : "password");
    });
  }
  function Qt(g) {
    return {
      expectedUpdatedAt: Number(g?.updatedAt) || 0,
      workspaceFileName: g?.workspaceFileName || "",
      jsApiPermission: _t(g?.jsApiPermission),
      tavilyApiKey: String(g?.tavilyApiKey || ""),
      tavilyBaseUrl: Je(g?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: g?.currentPresetName || "默认",
      delegatePresetName: g?.delegatePresetName || g?.currentPresetName || "默认",
      delegateConfig: g?.delegateConfig || {},
      delegateConfigured: g?.delegateConfigured === !0,
      presets: g?.presets || {}
    };
  }
  function Hr(g, T = {}) {
    const I = S(g), L = oe(T.presetName || I.presetDraftName), G = oe(I.currentPresetName || t.config?.currentPresetName || "默认"), Z = (t.config?.presets || {})[G] || Te(), re = Le(I.modelConfigs || Z.modelConfigs || {}), ut = {
      ...Z,
      provider: I.provider,
      permissionMode: dn(I.permissionMode),
      modelConfigs: {
        ...re,
        [I.provider]: {
          ...re[I.provider] || {},
          ...O(I)
        }
      }
    }, ct = { ...t.config?.presets || {} };
    T.renameCurrentPreset && L !== G && delete ct[G], ct[L] = ut, t.config = Ao({
      ...t.config,
      jsApiPermission: _t(I.jsApiPermission),
      tavilyApiKey: String(I.tavilyApiKey || ""),
      tavilyBaseUrl: Je(I.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: L,
      delegatePresetName: _(I.delegatePresetName, L),
      delegateConfig: k(I),
      delegateConfigured: T.configureDelegate === !0 || t.config?.delegateConfigured === !0,
      presets: ct
    }), t.configDraft = P(L, ut, t.config), d(), ot({
      requestId: o(T.requestPrefix || "save-config"),
      config: t.config,
      payload: Qt(t.config)
    });
  }
  function el(g, T = "") {
    const I = oe(T || "默认"), L = typeof window < "u" && typeof window.prompt == "function" ? window.prompt(g, I) : I;
    return L === null ? "" : oe(L);
  }
  function _g(g) {
    const T = el("输入新预设名称：", `${S(g).currentPresetName || "默认"} 副本`);
    if (!T) {
      r?.("预设名称不能为空");
      return;
    }
    const I = g.querySelector("#xb-assistant-preset-name");
    I && (I.value = T, Hr(g, {
      presetName: T,
      requestPrefix: "create-preset"
    }));
  }
  function vg(g) {
    const T = S(g), I = oe(T.currentPresetName || t.config?.currentPresetName || "默认"), L = el("输入预设名称：", T.presetDraftName || I);
    if (!L) {
      r?.("预设名称不能为空");
      return;
    }
    if (L === I) return;
    const G = g.querySelector("#xb-assistant-preset-name");
    G && (G.value = L, Hr(g, {
      presetName: L,
      renameCurrentPreset: !0,
      requestPrefix: "rename-preset"
    }));
  }
  function Ag(g) {
    if (Object.keys(t.config?.presets || {}).length <= 1) {
      r?.("至少要保留一套预设");
      return;
    }
    const T = S(g), I = oe(t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), L = { ...t.config?.presets || {} };
    delete L[I];
    const G = Object.keys(L)[0] || "默认", Z = L[G] || Te();
    t.config = Ao({
      ...t.config,
      jsApiPermission: _t(T.jsApiPermission),
      tavilyApiKey: String(T.tavilyApiKey || t.config?.tavilyApiKey || ""),
      tavilyBaseUrl: Je(T.tavilyBaseUrl || t.config?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: G,
      delegatePresetName: _(T.delegatePresetName, G),
      delegateConfig: k(T),
      presets: L
    }), t.configDraft = P(G, Z, t.config), d(), ot({
      requestId: o("delete-preset"),
      config: t.config,
      payload: Qt(t.config)
    }), n?.();
  }
  function Sg(g) {
    g?.querySelector?.("[data-xb-agent-config-retry]")?.addEventListener("click", () => {
      a?.();
    }), g?.querySelector?.("[data-xb-agent-config-reload]")?.addEventListener("click", () => {
      t.configDraft = null, t.configDirty = !1, t.configExternalChangePending = !1, d(), n?.();
    }), g?.querySelector?.("#xb-assistant-provider") && (g.querySelector("#xb-assistant-provider")?.addEventListener("change", (T) => {
      const I = T.currentTarget.value, L = S(g);
      t.configDraft = {
        ...L,
        provider: I,
        ...w(I, L.modelConfigs)
      }, d(), n?.();
    }), g.querySelector("#xb-assistant-preset-select")?.addEventListener("change", (T) => {
      const I = oe(T.currentTarget.value), L = (t.config?.presets || {})[I] || Te(), G = S(g);
      t.config = Ao({
        ...t.config,
        jsApiPermission: _t(G.jsApiPermission),
        currentPresetName: I,
        delegatePresetName: _(G.delegatePresetName, I),
        delegateConfig: k(G)
      }), t.configDraft = P(I, L, t.config), d(), n?.();
    }), g.querySelector("#xb-assistant-preset-name")?.addEventListener("input", () => {
      j(g);
    }), g.querySelector("#xb-assistant-base-url")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-model")?.addEventListener("input", () => {
      S(g);
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
    }), g.querySelector("#xb-assistant-model-pulled")?.addEventListener("change", (T) => {
      const I = T.currentTarget.value;
      if (!I) return;
      const L = g.querySelector("#xb-assistant-model");
      L && (L.value = I), S(g);
    }), _e(g, "#xb-assistant-toggle-key", "#xb-assistant-api-key"), _e(g, "#xb-assistant-toggle-tavily-key", "#xb-assistant-tavily-api-key"), g.querySelector("#xb-assistant-delegate-provider")?.addEventListener("change", (T) => {
      const I = S(g), L = T.currentTarget.value;
      t.configDraft = {
        ...I,
        delegateProvider: L,
        ...b(L, I.delegateModelConfigs)
      }, d(), n?.();
    }), g.querySelector("#xb-assistant-delegate-base-url")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-model")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-api-key")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-max-tokens")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-temperature")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-send-temperature")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-model-pulled")?.addEventListener("change", (T) => {
      const I = T.currentTarget.value;
      if (!I) return;
      const L = g.querySelector("#xb-assistant-delegate-model");
      L && (L.value = I), S(g);
    }), _e(g, "#xb-assistant-delegate-toggle-key", "#xb-assistant-delegate-api-key"), g.querySelector("#xb-assistant-reasoning-enabled")?.addEventListener("change", () => {
      S(g), d(), n?.();
    }), g.querySelector("#xb-assistant-reasoning-effort")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-reasoning-include-output")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-tool-mode")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-reasoning-enabled")?.addEventListener("change", () => {
      S(g), d(), n?.();
    }), g.querySelector("#xb-assistant-delegate-reasoning-effort")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-reasoning-include-output")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-tool-mode")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-permission-mode")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-jsapi-permission")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-preset-select")?.addEventListener("change", (T) => {
      const I = _(T.currentTarget?.value, t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), L = (t.config?.presets || {})[I] || Te();
      t.configDraft = {
        ...S(g),
        ...v(I, L)
      }, d(), n?.();
    }), g.querySelectorAll("[data-config-page]").forEach((T) => {
      T.addEventListener("click", (I) => {
        S(g), t.configPage = vo(I.currentTarget?.dataset?.configPage), he(g), qe(g);
      });
    }), g.querySelector("#xb-assistant-pull-models")?.addEventListener("click", async () => {
      S(g), d();
      const T = se();
      p(T.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), n?.();
      try {
        const I = await Fd(T);
        m(T.provider, I), p(T.provider, {
          status: "success",
          message: `已拉取 ${I.length} 个模型`
        });
      } catch (I) {
        m(T.provider, []), p(T.provider, {
          status: "error",
          message: u(I)
        });
      }
      d(), n?.();
    }), g.querySelector("#xb-assistant-delegate-pull-models")?.addEventListener("click", async () => {
      S(g), d();
      const T = se({ role: "delegate" });
      p(T.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }, "delegate"), n?.();
      try {
        const I = await Fd(T);
        m(T.provider, I, "delegate"), p(T.provider, {
          status: "success",
          message: `已拉取 ${I.length} 个模型`
        }, "delegate");
      } catch (I) {
        m(T.provider, [], "delegate"), p(T.provider, {
          status: "error",
          message: u(I)
        }, "delegate");
      }
      d(), n?.();
    }), g.querySelector("#xb-assistant-new-preset")?.addEventListener("click", () => {
      _g(g);
    }), g.querySelector("#xb-assistant-rename-preset")?.addEventListener("click", () => {
      vg(g);
    }), g.querySelector("#xb-assistant-save")?.addEventListener("click", () => {
      Hr(g);
    }), g.querySelector("#xb-assistant-delegate-save")?.addEventListener("click", () => {
      Hr(g, {
        requestPrefix: "save-delegate-config",
        configureDelegate: !0
      });
    }), g.querySelector("#xb-assistant-delete-preset")?.addEventListener("click", () => {
      Ag(g);
    }));
  }
  return {
    getActiveProviderConfig: se,
    syncConfigToForm: qe,
    bindSettingsPanelEvents: Sg
  };
}
function mr(e = "") {
  return String(e || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Zn(e) {
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
function V0(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? "saving" : t === "success" ? "success" : t === "error" ? "error" : "save";
}
function J0(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? {
    className: "xb-assistant-save-button is-saving",
    title: "正在保存配置"
  } : t === "success" ? {
    className: "xb-assistant-save-button is-success",
    title: "配置已保存"
  } : t === "error" ? {
    className: "xb-assistant-save-button is-error",
    title: mr(e?.error || "保存失败")
  } : {
    className: "xb-assistant-save-button",
    title: "保存配置"
  };
}
function X0(e = {}) {
  const { configSave: t = {}, runtimeText: n = "", inlineToastText: r = "", showInlineToast: o = !0, showAssistantPermissions: s = !0, showDelegateSettings: a = !0, activePage: u = "main", delegatePresetHint: c = "DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。", isBusy: d = !1, canDeletePreset: h = !0, configLoadError: f = "", configExternalChangePending: p = !1 } = e, m = String(f || "").trim(), y = J0(t), _ = V0(t), v = d || m || String(t?.status || "") === "saving" ? "disabled" : "", w = d || !h ? "disabled" : "", b = u === "delegate" ? "delegate" : "main", P = b === "main", x = b === "delegate", $ = s ? `
            <label>
                <span>斜杠命令权限</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>
            <label>
                <span>JavaScript API 权限</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>` : "", S = a ? `
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${P ? "is-active" : ""}" data-config-page="main" role="tab" aria-selected="${P ? "true" : "false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${x ? "is-active" : ""}" data-config-page="delegate" role="tab" aria-selected="${x ? "true" : "false"}">分身 API</button>
            </div>` : "", O = a ? `
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${x ? "" : "hidden"}>
                <p class="xb-assistant-config-note">${mr(c)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${y.className}" title="${y.title}" aria-label="${y.title}" ${v}>${Zn(_)}</button>
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
                <label class="xb-assistant-checkbox-row">
                    <span>
                        Reasoning 参数
                        <small>按当前 Provider 的协议发送</small>
                    </span>
                    <span class="xb-assistant-checkbox-control">
                        <input id="xb-assistant-delegate-reasoning-enabled" type="checkbox" />
                        <span>开启</span>
                    </span>
                </label>
                <label id="xb-assistant-delegate-reasoning-effort-wrap">
                    <span>思考强度</span>
                    <select id="xb-assistant-delegate-reasoning-effort"></select>
                </label>
                <label id="xb-assistant-delegate-reasoning-include-output-wrap" class="xb-assistant-checkbox-row">
                    <span>
                        回传思考内容
                        <small>不影响模型是否推理</small>
                    </span>
                    <span class="xb-assistant-checkbox-control">
                        <input id="xb-assistant-delegate-reasoning-include-output" type="checkbox" />
                        <span>开启</span>
                    </span>
                </label>
            </div>` : "";
  return `
        <section class="xb-assistant-config">
            <div class="xb-assistant-config-alert is-error" data-xb-agent-config-load-error ${m ? "" : "hidden"}>
                <span data-xb-agent-config-load-error-message>${mr(m)}</span>
                <button type="button" data-xb-agent-config-retry>重新读取</button>
            </div>
            <div class="xb-assistant-config-alert is-conflict" data-xb-agent-config-conflict ${m || !p ? "hidden" : ""}>
                <span>共享配置已在其他页面更新。当前未保存编辑仍保留；重新载入会放弃这些编辑。</span>
                <button type="button" data-xb-agent-config-reload>重新载入</button>
            </div>
            <fieldset class="xb-assistant-config-fields" data-xb-agent-config-fields ${m ? "disabled" : ""}>
            ${S}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${P ? "" : "hidden"}>
            <div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${d ? "disabled" : ""}>${Zn("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${d ? "disabled" : ""}>${Zn("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${y.className}" title="${y.title}" aria-label="${y.title}" ${v}>${Zn(_)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${w}>${Zn("delete")}</button>
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
            ${$}
            <label class="xb-assistant-checkbox-row">
                <span>
                    Reasoning 参数
                    <small>按当前 Provider 的协议发送</small>
                </span>
                <span class="xb-assistant-checkbox-control">
                    <input id="xb-assistant-reasoning-enabled" type="checkbox" />
                    <span>开启</span>
                </span>
            </label>
            <label id="xb-assistant-reasoning-effort-wrap">
                <span>思考强度</span>
                <select id="xb-assistant-reasoning-effort"></select>
            </label>
            <label id="xb-assistant-reasoning-include-output-wrap" class="xb-assistant-checkbox-row">
                <span>
                    回传思考内容
                    <small>不影响模型是否推理</small>
                </span>
                <span class="xb-assistant-checkbox-control">
                    <input id="xb-assistant-reasoning-include-output" type="checkbox" />
                    <span>开启</span>
                </span>
            </label>
            </div>
            ${O}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${mr(n)}</div>
            </fieldset>
            ${o ? `<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${mr(r)}</div>` : ""}
        </section>
    `;
}
var K0 = [
  "你是小白X“四次元壁”的交流生成器。",
  "只完成本轮四次元壁回复，不调用工具，不编造外部事实。",
  "严格遵循后续提示词里的输出格式，优先输出可被解析的 <thinking> 与 <msg> 内容。"
].join(`
`);
function W0(e = {}) {
  return {
    msg1: String(e.msg1 || "").trim(),
    msg2: String(e.msg2 || "").trim(),
    msg3: String(e.msg3 || "").trim(),
    msg4: String(e.msg4 || "").trim()
  };
}
function z0(e = {}, t = {}) {
  const { msg1: n, msg2: r, msg3: o, msg4: s } = W0(e);
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
    s && !t.disableAssistantPrefill ? {
      role: "assistant",
      content: s
    } : null
  ].filter(Boolean);
}
function Q0(e = {}) {
  Ob(typeof e.requestHeadersProvider == "function" ? e.requestHeadersProvider : null);
}
async function Z0(e = {}) {
  const t = R0(Fg(e.config || {})), n = x0(t, { missingApiKeyMessage: "请先在小白agent的 API配置 里填写当前预设的 API Key。" }), r = !!e.stream && typeof e.onStreamProgress == "function", o = await n.chat({
    systemPrompt: K0,
    messages: z0(e.builtPrompt || {}, { disableAssistantPrefill: !!e.disableAssistantPrefill }),
    tools: [],
    temperature: t.temperature,
    maxTokens: t.maxTokens,
    reasoning: {
      enabled: t.reasoningEnabled,
      effort: t.reasoningEffort,
      includeOutput: t.reasoningIncludeOutput
    },
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
  X0 as buildAgentSettingsPanelMarkup,
  Q0 as configureFourthWallAgent,
  Y0 as createAgentSettingsPanel,
  Z0 as generateFourthWallResponse,
  Ao as normalizeAgentConfig
};
