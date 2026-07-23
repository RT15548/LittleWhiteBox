var Vm = Object.create, md = Object.defineProperty, Jm = Object.getOwnPropertyDescriptor, Km = Object.getOwnPropertyNames, Wm = Object.getPrototypeOf, zm = Object.prototype.hasOwnProperty, Oo = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), Ym = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var o = Km(t), s = 0, a = o.length, u; s < a; s++)
      u = o[s], !zm.call(e, u) && u !== n && md(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(r = Jm(t, u)) || r.enumerable
      });
  return e;
}, Xm = (e, t, n) => (n = e != null ? Vm(Wm(e)) : {}, Ym(t || !e || !e.__esModule ? md(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), Qm = "https://api.tavily.com";
function Gs(e = "") {
  return String(e || "").trim();
}
function Je(e = "") {
  return String(e || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var gd = "openai-compatible", Ho = "默认", yd = "default", Zm = "deny", jm = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), eg = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), Os = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 0.2,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 0.2,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 0.2,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 0.2,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 0.2,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 0.2,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 0.2,
    sendTemperature: !0
  }
};
function un() {
  return JSON.parse(JSON.stringify(Os));
}
function Te() {
  return {
    provider: gd,
    modelConfigs: un(),
    permissionMode: yd
  };
}
function _d(e = Te()) {
  const t = e && typeof e == "object" ? e : Te();
  return {
    provider: Bi(t.provider),
    modelConfigs: Ue(t.modelConfigs || {})
  };
}
function cn(e) {
  return e === "full" ? "full" : yd;
}
function mt(e) {
  return e === "allow" ? "allow" : Zm;
}
function re(e) {
  return String(e || "").trim() || "默认";
}
function Ue(e = {}) {
  const t = un();
  return Object.keys(Os).forEach((n) => {
    t[n] = {
      ...Os[n],
      ...e && typeof e[n] == "object" ? e[n] : {}
    };
  }), t;
}
function Bi(e) {
  return typeof e == "string" && e.trim() ? e : gd;
}
function Gi(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function vd(e = {}, t) {
  const n = {}, r = Gi(e, t);
  return Object.entries(r).forEach(([o, s]) => {
    if (!s || typeof s != "object") return;
    const a = re(o);
    n[a] = {
      provider: Bi(s.provider),
      modelConfigs: Ue(s.modelConfigs || {}),
      permissionMode: cn(s.permissionMode)
    };
  }), Object.keys(n).length || (n[Ho] = Te()), n;
}
function Ad(e, t) {
  const n = re(t);
  return e[n] ? n : Object.keys(e)[0];
}
function Sd(e, t, n) {
  const r = re(t || n);
  return e[r] ? r : e[n] ? n : Object.keys(e)[0];
}
function Oi(e = {}, t = Te()) {
  const n = _d(t), r = e && typeof e == "object" ? e : {};
  return {
    provider: Bi(r.provider || n.provider),
    modelConfigs: Ue(r.modelConfigs || n.modelConfigs)
  };
}
function Td(e = {}, t = {}, n = Ho, r = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (r !== n) return !0;
  const o = e?.delegateConfig;
  if (!o || typeof o != "object" || Array.isArray(o) || !(typeof o.provider == "string" && o.provider.trim() || o.modelConfigs && typeof o.modelConfigs == "object" && Object.keys(o.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const s = t[n] || Te(), a = _d(s), u = Oi(o, s);
  return JSON.stringify(u) !== JSON.stringify(a);
}
function tg(e = {}, t, n, r, o) {
  const s = o(e?.[r]);
  if (s) return s;
  const a = Gi(e, t), u = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(a || {})
  ].map(re), c = /* @__PURE__ */ new Set();
  for (const d of u) {
    if (c.has(d)) continue;
    c.add(d);
    const h = o(a?.[d]?.[r]);
    if (h) return h;
  }
  return o(e?.delegateConfig?.[r]);
}
function ng(e = {}, t, n) {
  const r = (u) => String(u || "").trim();
  if (r(e?.tavilyBaseUrl)) return Je(e.tavilyBaseUrl);
  const o = Gi(e, t), s = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(o || {})
  ].map(re), a = /* @__PURE__ */ new Set();
  for (const u of s) {
    if (a.has(u)) continue;
    a.add(u);
    const c = o?.[u]?.tavilyBaseUrl;
    if (r(c)) return Je(c);
  }
  return r(e?.delegateConfig?.tavilyBaseUrl) ? Je(e.delegateConfig.tavilyBaseUrl) : Qm;
}
function Ed(e = {}, t, n) {
  return {
    tavilyApiKey: tg(e, t, n, "tavilyApiKey", Gs),
    tavilyBaseUrl: ng(e, t, n)
  };
}
function rg(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: r = (p) => String(p || "") } = t, o = re(e.currentPresetName || e.presetName || "默认"), s = vd(e, o), a = Ad(s, e.currentPresetName), u = Sd(s, e.delegatePresetName, a), c = s[u] || s[a] || Te(), d = Oi(e.delegateConfig, c), h = Td(e, s, a, u), f = Ed(e, o, a);
  return {
    enabled: !!e.enabled,
    workspaceFileName: r(e.workspaceFileName || n),
    jsApiPermission: mt(e.jsApiPermission),
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
function lo(e = {}) {
  const t = re(e.currentPresetName || e.presetDraftName || "默认"), n = vd(e, t), r = Ad(n, e.currentPresetName), o = Sd(n, e.delegatePresetName, r), s = n[r] || Te(), a = n[o] || s, u = Oi(e.delegateConfig, a), c = Td(e, n, r, o), d = Ed(e, t, r);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    jsApiPermission: mt(e.jsApiPermission),
    currentPresetName: r,
    delegatePresetName: o,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: re(e.presetDraftName || r),
    presetNames: Object.keys(n),
    presets: n,
    provider: s.provider,
    modelConfigs: s.modelConfigs,
    permissionMode: cn(s.permissionMode),
    tavilyApiKey: d.tavilyApiKey,
    tavilyBaseUrl: d.tavilyBaseUrl
  };
}
function L(e, t, n, r, o) {
  if (r === "m") throw new TypeError("Private method is not writable");
  if (r === "a" && !o) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? o.call(e, n) : o ? o.value = n : t.set(e, n), n;
}
function T(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var wd = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return wd = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function yr(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Hs = (e) => {
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
}, V = class extends Error {
}, Fe = class Vs extends V {
  constructor(t, n, r, o, s) {
    super(`${Vs.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("request-id"), this.error = n, this.type = s ?? null;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Vo({
      message: r,
      cause: Hs(n)
    });
    const s = n, a = s?.error?.type;
    return t === 400 ? new Id(t, s, r, o, a) : t === 401 ? new bd(t, s, r, o, a) : t === 403 ? new Pd(t, s, r, o, a) : t === 404 ? new Rd(t, s, r, o, a) : t === 409 ? new xd(t, s, r, o, a) : t === 422 ? new Md(t, s, r, o, a) : t === 429 ? new Nd(t, s, r, o, a) : t >= 500 ? new kd(t, s, r, o, a) : new Vs(t, s, r, o, a);
  }
}, et = class extends Fe {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Vo = class extends Fe {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Cd = class extends Vo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Id = class extends Fe {
}, bd = class extends Fe {
}, Pd = class extends Fe {
}, Rd = class extends Fe {
}, xd = class extends Fe {
}, Md = class extends Fe {
}, Nd = class extends Fe {
}, kd = class extends Fe {
}, og = /^[a-z][a-z0-9+.-]*:/i, sg = (e) => og.test(e), Js = (e) => (Js = Array.isArray, Js(e)), tl = Js;
function Ks(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function nl(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function ig(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var ag = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new V(`${e} must be an integer`);
  if (t < 0) throw new V(`${e} must be a positive integer`);
  return t;
}, Dd = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, lg = (e) => new Promise((t) => setTimeout(t, e)), rn = "0.91.1", ug = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function cg() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var dg = () => {
  const e = cg();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": rn,
    "X-Stainless-OS": ol(Deno.build.os),
    "X-Stainless-Arch": rl(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": rn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": rn,
    "X-Stainless-OS": ol(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": rl(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = fg();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": rn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": rn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function fg() {
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
var rl = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", ol = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), sl, hg = () => sl ?? (sl = dg());
function pg() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function $d(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Ld(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return $d({
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
function Hi(e) {
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
async function mg(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var gg = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function yg(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new V(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function _g(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var il;
function Vi(e) {
  let t;
  return (il ?? (t = new globalThis.TextEncoder(), il = t.encode.bind(t)))(e);
}
var al;
function ll(e) {
  let t;
  return (al ?? (t = new globalThis.TextDecoder(), al = t.decode.bind(t)))(e);
}
var xe, Me, Er = class {
  constructor() {
    xe.set(this, void 0), Me.set(this, void 0), L(this, xe, new Uint8Array(), "f"), L(this, Me, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Vi(e) : e;
    L(this, xe, _g([T(this, xe, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = vg(T(this, xe, "f"), T(this, Me, "f"))) != null; ) {
      if (r.carriage && T(this, Me, "f") == null) {
        L(this, Me, r.index, "f");
        continue;
      }
      if (T(this, Me, "f") != null && (r.index !== T(this, Me, "f") + 1 || r.carriage)) {
        n.push(ll(T(this, xe, "f").subarray(0, T(this, Me, "f") - 1))), L(this, xe, T(this, xe, "f").subarray(T(this, Me, "f")), "f"), L(this, Me, null, "f");
        continue;
      }
      const o = T(this, Me, "f") !== null ? r.preceding - 1 : r.preceding, s = ll(T(this, xe, "f").subarray(0, o));
      n.push(s), L(this, xe, T(this, xe, "f").subarray(r.index), "f"), L(this, Me, null, "f");
    }
    return n;
  }
  flush() {
    return T(this, xe, "f").length ? this.decode(`
`) : [];
  }
};
xe = /* @__PURE__ */ new WeakMap(), Me = /* @__PURE__ */ new WeakMap();
Er.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Er.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function vg(e, t) {
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
function Ag(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var Io = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, ul = (e, t, n) => {
  if (e) {
    if (ig(Io, e)) return e;
    Ae(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Io))}`);
  }
};
function Wn() {
}
function Dr(e, t, n) {
  return !t || Io[e] > Io[n] ? Wn : t[e].bind(t);
}
var Sg = {
  error: Wn,
  warn: Wn,
  info: Wn,
  debug: Wn
}, cl = /* @__PURE__ */ new WeakMap();
function Ae(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Sg;
  const r = cl.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: Dr("error", t, n),
    warn: Dr("warn", t, n),
    info: Dr("info", t, n),
    debug: Dr("debug", t, n)
  };
  return cl.set(t, [n, o]), o;
}
var Lt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Pn, _r = class zn {
  constructor(t, n, r) {
    this.iterator = t, Pn.set(this, void 0), this.controller = n, L(this, Pn, r, "f");
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const s = r ? Ae(r) : console;
    async function* a() {
      if (o) throw new V("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of Tg(t, n)) {
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
            const d = Dd(c.data) ?? c.data, h = d?.error?.type;
            throw new Fe(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (yr(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new zn(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* s() {
      const u = new Er(), c = Hi(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (o) throw new V("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of s())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (yr(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new zn(a, n, r);
  }
  [(Pn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new zn(() => o(t), this.controller, T(this, Pn, "f")), new zn(() => o(n), this.controller, T(this, Pn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return $d({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: s } = await n.next();
          if (s) return r.close();
          const a = Vi(JSON.stringify(o) + `
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
async function* Tg(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new V("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new V("Attempted to iterate over a response with no body");
  const n = new wg(), r = new Er(), o = Hi(e.body);
  for await (const s of Eg(o)) for (const a of r.decode(s)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const s of r.flush()) {
    const a = n.decode(s);
    a && (yield a);
  }
}
async function* Eg(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Vi(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let s;
    for (; (s = Ag(t)) !== -1; )
      yield t.slice(0, s), t = t.slice(s);
  }
  t.length > 0 && (yield t);
}
var wg = class {
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
    let [t, n, r] = Cg(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function Cg(e, t) {
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
async function Ud(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: s } = t, a = await (async () => {
    if (t.options.stream)
      return Ae(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : _r.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Fd(await n.json(), n) : await n.text();
  })();
  return Ae(e).debug(`[${r}] response parsed`, Lt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - s
  })), a;
}
function Fd(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var Yn, qd = class Bd extends Promise {
  constructor(t, n, r = Ud) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, Yn.set(this, void 0), L(this, Yn, t, "f");
  }
  _thenUnwrap(t) {
    return new Bd(T(this, Yn, "f"), this.responsePromise, async (n, r) => Fd(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(T(this, Yn, "f"), t))), this.parsedPromise;
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
Yn = /* @__PURE__ */ new WeakMap();
var $r, Gd = class {
  constructor(e, t, n, r) {
    $r.set(this, void 0), L(this, $r, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new V("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await T(this, $r, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[($r = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Ig = class extends qd {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await Ud(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, wr = class extends Gd {
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
          ...Ks(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Ks(this.options.query),
        after_id: e
      }
    } : null;
  }
}, Pe = class extends Gd {
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
        ...Ks(this.options.query),
        page: e
      }
    } : null;
  }
}, Od = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function hn(e, t, n) {
  return Od(), new File(e, t ?? "unknown_file", n);
}
function uo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Hd = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Ji = async (e, t, n = !0) => ({
  ...e,
  body: await Pg(e.body, t, n)
}), dl = /* @__PURE__ */ new WeakMap();
function bg(e) {
  const t = typeof e == "function" ? e : e.fetch, n = dl.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, s = new FormData();
      return s.toString() !== await new o(s).text();
    } catch {
      return !0;
    }
  })();
  return dl.set(t, r), r;
}
var Pg = async (e, t, n = !0) => {
  if (!await bg(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, s]) => Ws(r, o, s, n))), r;
}, Rg = (e) => e instanceof Blob && "name" in e, Ws = async (e, t, n, r) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let o = {};
      const s = n.headers.get("Content-Type");
      s && (o = { type: s }), e.append(t, hn([await n.blob()], uo(n, r), o));
    } else if (Hd(n)) e.append(t, hn([await new Response(Ld(n)).blob()], uo(n, r)));
    else if (Rg(n)) e.append(t, hn([n], uo(n, r), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => Ws(e, t + "[]", o, r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, s]) => Ws(e, `${t}[${o}]`, s, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Vd = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", xg = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Vd(e), Mg = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Ng(e, t, n) {
  if (Od(), e = await e, t || (t = uo(e, !0)), xg(e))
    return e instanceof File && t == null && n == null ? e : hn([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (Mg(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), hn(await zs(o), t, n);
  }
  const r = await zs(e);
  if (!n?.type) {
    const o = r.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return hn(r, t, n);
}
async function zs(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Vd(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Hd(e)) for await (const n of e) t.push(...await zs(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${kg(e)}`);
  }
  return t;
}
function kg(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ne = class {
  constructor(e) {
    this._client = e;
  }
}, Jd = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Dg(e) {
  if (!e) return;
  if (Jd in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const s of o) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : tl(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const s = tl(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of s)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var N = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [s, a] of Dg(r)) {
      const u = s.toLowerCase();
      o.has(u) || (t.delete(s), o.add(u)), a === null ? (t.delete(s), n.add(u)) : (t.append(s, a), n.delete(u));
    }
  }
  return {
    [Jd]: !0,
    values: t,
    nulls: n
  };
};
function Kd(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var fl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), $g = (e = Kd) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const s = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let g = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? fl) ?? fl)?.toString) && (g = m + "", s.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : g);
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
      const g = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + g + _;
    }, "");
    throw new V(`Path parameters result in path with invalid segments:
${s.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, B = /* @__PURE__ */ $g(Kd), Wd = class extends ne {
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
    return this._client.get(B`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(B`/v1/environments/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", Pe, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(B`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(B`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, ur = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function co(e) {
  return typeof e == "object" && e !== null && ur in e;
}
function zd(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const r of e) co(r) && n.add(r[ur]);
  if (t) {
    for (const r of t)
      if (co(r) && n.add(r[ur]), Array.isArray(r.content))
        for (const o of r.content) co(o) && n.add(o[ur]);
  }
  return Array.from(n);
}
function Yd(e, t) {
  const n = zd(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function Lg(e) {
  return co(e) ? { "x-stainless-helper": e[ur] } : {};
}
var Xd = class extends ne {
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", wr, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(B`/v1/files/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(B`/v1/files/${e}/content?beta=true`, {
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
    return this._client.get(B`/v1/files/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/files?beta=true", Ji({
      body: r,
      ...t,
      headers: N([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        Lg(r.file),
        t?.headers
      ])
    }, this._client));
  }
}, Qd = class extends ne {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(B`/v1/models/${e}?beta=true`, {
      ...n,
      headers: N([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", wr, {
      query: r,
      ...t,
      headers: N([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Zd = class extends ne {
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
    return this._client.get(B`/v1/user_profiles/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(B`/v1/user_profiles/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/user_profiles?beta=true", Pe, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  createEnrollmentURL(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(B`/v1/user_profiles/${e}/enrollment_url?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
}, jd = class extends ne {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(B`/v1/agents/${e}/versions?beta=true`, Pe, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ki = class extends ne {
  constructor() {
    super(...arguments), this.versions = new jd(this._client);
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
    return this._client.get(B`/v1/agents/${e}?beta=true`, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(B`/v1/agents/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", Pe, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(B`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Ki.Versions = jd;
var ef = class extends ne {
  create(e, t, n) {
    const { view: r, betas: o, ...s } = t;
    return this._client.post(B`/v1/memory_stores/${e}/memories?beta=true`, {
      query: { view: r },
      body: s,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { memory_store_id: r, betas: o, ...s } = t;
    return this._client.get(B`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: s,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { memory_store_id: r, view: o, betas: s, ...a } = t;
    return this._client.post(B`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: { view: o },
      body: a,
      ...n,
      headers: N([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(B`/v1/memory_stores/${e}/memories?beta=true`, Pe, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { memory_store_id: r, expected_content_sha256: o, betas: s } = t;
    return this._client.delete(B`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: { expected_content_sha256: o },
      ...n,
      headers: N([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, tf = class extends ne {
  retrieve(e, t, n) {
    const { memory_store_id: r, betas: o, ...s } = t;
    return this._client.get(B`/v1/memory_stores/${r}/memory_versions/${e}?beta=true`, {
      query: s,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(B`/v1/memory_stores/${e}/memory_versions?beta=true`, Pe, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  redact(e, t, n) {
    const { memory_store_id: r, betas: o } = t;
    return this._client.post(B`/v1/memory_stores/${r}/memory_versions/${e}/redact?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Jo = class extends ne {
  constructor() {
    super(...arguments), this.memories = new ef(this._client), this.memoryVersions = new tf(this._client);
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
    return this._client.get(B`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(B`/v1/memory_stores/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/memory_stores?beta=true", Pe, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(B`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(B`/v1/memory_stores/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Jo.Memories = ef;
Jo.MemoryVersions = tf;
var nf = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function rf(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function hl(e, t, n) {
  const r = rf(t);
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
  } : of(e, t, n);
}
function of(e, t, n) {
  let r = null;
  const o = e.content.map((s) => {
    if (s.type === "text") {
      const a = Ug(t, s.text);
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
function Ug(e, t) {
  const n = rf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new V(`Failed to parse structured output: ${r}`);
  }
}
var Fg = (e) => {
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
}, on = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), on(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), on(e);
    case "string":
      let r = e[e.length - 2];
      if (r?.type === "delimiter")
        return e = e.slice(0, e.length - 1), on(e);
      if (r?.type === "brace" && r.value === "{")
        return e = e.slice(0, e.length - 1), on(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), on(e);
  }
  return e;
}, qg = (e) => {
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
}, Bg = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, sf = (e) => JSON.parse(Bg(qg(on(Fg(e))))), He, St, Qt, Rn, Lr, xn, Mn, Ur, Nn, ct, kn, Fr, qr, kt, Br, Gr, Dn, _s, pl, Or, vs, As, Ss, ml, gl = "__json_buf";
function yl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Gg = class Ys {
  constructor(t, n) {
    He.add(this), this.messages = [], this.receivedMessages = [], St.set(this, void 0), Qt.set(this, null), this.controller = new AbortController(), Rn.set(this, void 0), Lr.set(this, () => {
    }), xn.set(this, () => {
    }), Mn.set(this, void 0), Ur.set(this, () => {
    }), Nn.set(this, () => {
    }), ct.set(this, {}), kn.set(this, !1), Fr.set(this, !1), qr.set(this, !1), kt.set(this, !1), Br.set(this, void 0), Gr.set(this, void 0), Dn.set(this, void 0), Or.set(this, (r) => {
      if (L(this, Fr, !0, "f"), yr(r) && (r = new et()), r instanceof et)
        return L(this, qr, !0, "f"), this._emit("abort", r);
      if (r instanceof V) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new V(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new V(String(r)));
    }), L(this, Rn, new Promise((r, o) => {
      L(this, Lr, r, "f"), L(this, xn, o, "f");
    }), "f"), L(this, Mn, new Promise((r, o) => {
      L(this, Ur, r, "f"), L(this, Nn, o, "f");
    }), "f"), T(this, Rn, "f").catch(() => {
    }), T(this, Mn, "f").catch(() => {
    }), L(this, Qt, t, "f"), L(this, Dn, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, Br, "f");
  }
  get request_id() {
    return T(this, Gr, "f");
  }
  async withResponse() {
    L(this, kt, !0, "f");
    const t = await T(this, Rn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Ys(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const s = new Ys(n, { logger: o });
    for (const a of n.messages) s._addMessageParam(a);
    return L(s, Qt, {
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
    }, T(this, Or, "f"));
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
      T(this, He, "m", vs).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) T(this, He, "m", As).call(this, c);
      if (u.controller.signal?.aborted) throw new et();
      T(this, He, "m", Ss).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  _connected(t) {
    this.ended || (L(this, Br, t, "f"), L(this, Gr, t?.headers.get("request-id"), "f"), T(this, Lr, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, kn, "f");
  }
  get errored() {
    return T(this, Fr, "f");
  }
  get aborted() {
    return T(this, qr, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (T(this, ct, "f")[t] || (T(this, ct, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = T(this, ct, "f")[t];
    if (!r) return this;
    const o = r.findIndex((s) => s.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (T(this, ct, "f")[t] || (T(this, ct, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      L(this, kt, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    L(this, kt, !0, "f"), await T(this, Mn, "f");
  }
  get currentMessage() {
    return T(this, St, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, He, "m", _s).call(this);
  }
  async finalText() {
    return await this.done(), T(this, He, "m", pl).call(this);
  }
  _emit(t, ...n) {
    if (T(this, kn, "f")) return;
    t === "end" && (L(this, kn, !0, "f"), T(this, Ur, "f").call(this));
    const r = T(this, ct, "f")[t];
    if (r && (T(this, ct, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !T(this, kt, "f") && !r?.length && Promise.reject(o), T(this, xn, "f").call(this, o), T(this, Nn, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !T(this, kt, "f") && !r?.length && Promise.reject(o), T(this, xn, "f").call(this, o), T(this, Nn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, He, "m", _s).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      T(this, He, "m", vs).call(this), this._connected(null);
      const s = _r.fromReadableStream(t, this.controller);
      for await (const a of s) T(this, He, "m", As).call(this, a);
      if (s.controller.signal?.aborted) throw new et();
      T(this, He, "m", Ss).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(St = /* @__PURE__ */ new WeakMap(), Qt = /* @__PURE__ */ new WeakMap(), Rn = /* @__PURE__ */ new WeakMap(), Lr = /* @__PURE__ */ new WeakMap(), xn = /* @__PURE__ */ new WeakMap(), Mn = /* @__PURE__ */ new WeakMap(), Ur = /* @__PURE__ */ new WeakMap(), Nn = /* @__PURE__ */ new WeakMap(), ct = /* @__PURE__ */ new WeakMap(), kn = /* @__PURE__ */ new WeakMap(), Fr = /* @__PURE__ */ new WeakMap(), qr = /* @__PURE__ */ new WeakMap(), kt = /* @__PURE__ */ new WeakMap(), Br = /* @__PURE__ */ new WeakMap(), Gr = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap(), Or = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ new WeakSet(), _s = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, pl = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new V("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, vs = function() {
    this.ended || L(this, St, void 0, "f");
  }, As = function(n) {
    if (this.ended) return;
    const r = T(this, He, "m", ml).call(this, n);
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
            yl(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage(hl(r, T(this, Qt, "f"), { logger: T(this, Dn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        L(this, St, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Ss = function() {
    if (this.ended) throw new V("stream has ended, this shouldn't happen");
    const n = T(this, St, "f");
    if (!n) throw new V("request ended without sending any chunks");
    return L(this, St, void 0, "f"), hl(n, T(this, Qt, "f"), { logger: T(this, Dn, "f") });
  }, ml = function(n) {
    let r = T(this, St, "f");
    if (n.type === "message_start") {
      if (r) throw new V(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new V(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (o && yl(o)) {
              let s = o[gl] || "";
              s += n.delta.partial_json;
              const a = { ...o };
              if (Object.defineProperty(a, gl, {
                value: s,
                enumerable: !1,
                writable: !0
              }), s) try {
                a.input = sf(s);
              } catch (u) {
                const c = new V(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${s}`);
                T(this, Or, "f").call(this, c);
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
    return new _r(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, af = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var Og = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, $n, Zt, Dt, ie, we, Re, gt, Tt, Ln, _l, Xs;
function vl() {
  let e, t;
  return {
    promise: new Promise((n, r) => {
      e = n, t = r;
    }),
    resolve: e,
    reject: t
  };
}
var lf = class {
  constructor(e, t, n) {
    $n.add(this), this.client = e, Zt.set(this, !1), Dt.set(this, !1), ie.set(this, void 0), we.set(this, void 0), Re.set(this, void 0), gt.set(this, void 0), Tt.set(this, void 0), Ln.set(this, 0), L(this, ie, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const r = ["BetaToolRunner", ...zd(t.tools, t.messages)].join(", ");
    L(this, we, {
      ...n,
      headers: N([{ "x-stainless-helper": r }, n?.headers])
    }, "f"), L(this, Tt, vl(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Zt = /* @__PURE__ */ new WeakMap(), Dt = /* @__PURE__ */ new WeakMap(), ie = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakMap(), Re = /* @__PURE__ */ new WeakMap(), gt = /* @__PURE__ */ new WeakMap(), Tt = /* @__PURE__ */ new WeakMap(), Ln = /* @__PURE__ */ new WeakMap(), $n = /* @__PURE__ */ new WeakSet(), _l = async function() {
    const t = T(this, ie, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (T(this, Re, "f") !== void 0) try {
      const c = await T(this, Re, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const r = t.contextTokenThreshold ?? 1e5;
    if (n < r) return !1;
    const o = t.model ?? T(this, ie, "f").params.model, s = t.summaryPrompt ?? Og, a = T(this, ie, "f").params.messages;
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
      max_tokens: T(this, ie, "f").params.max_tokens
    }, {
      signal: T(this, we, "f").signal,
      headers: N([T(this, we, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new V("Expected text response for compaction");
    return T(this, ie, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (T(this, Zt, "f")) throw new V("Cannot iterate over a consumed stream");
    L(this, Zt, !0, "f"), L(this, Dt, !0, "f"), L(this, gt, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (T(this, ie, "f").params.max_iterations && T(this, Ln, "f") >= T(this, ie, "f").params.max_iterations) break;
          L(this, Dt, !1, "f"), L(this, gt, void 0, "f"), L(this, Ln, (e = T(this, Ln, "f"), e++, e), "f"), L(this, Re, void 0, "f");
          const { max_iterations: n, compactionControl: r, ...o } = T(this, ie, "f").params;
          if (o.stream ? (t = this.client.beta.messages.stream({ ...o }, T(this, we, "f")), L(this, Re, t.finalMessage(), "f"), T(this, Re, "f").catch(() => {
          }), yield t) : (L(this, Re, this.client.beta.messages.create({
            ...o,
            stream: !1
          }, T(this, we, "f")), "f"), yield T(this, Re, "f")), !await T(this, $n, "m", _l).call(this)) {
            if (!T(this, Dt, "f")) {
              const { role: a, content: u } = await T(this, Re, "f");
              T(this, ie, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const s = await T(this, $n, "m", Xs).call(this, T(this, ie, "f").params.messages.at(-1));
            if (s) T(this, ie, "f").params.messages.push(s);
            else if (!T(this, Dt, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!T(this, Re, "f")) throw new V("ToolRunner concluded without a message from the server");
      T(this, Tt, "f").resolve(await T(this, Re, "f"));
    } catch (t) {
      throw L(this, Zt, !1, "f"), T(this, Tt, "f").promise.catch(() => {
      }), T(this, Tt, "f").reject(t), L(this, Tt, vl(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? T(this, ie, "f").params = e(T(this, ie, "f").params) : T(this, ie, "f").params = e, L(this, Dt, !0, "f"), L(this, gt, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? L(this, we, e(T(this, we, "f")), "f") : L(this, we, {
      ...T(this, we, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = T(this, we, "f").signal) {
    const t = await T(this, Re, "f") ?? this.params.messages.at(-1);
    return t ? T(this, $n, "m", Xs).call(this, t, e) : null;
  }
  done() {
    return T(this, Tt, "f").promise;
  }
  async runUntilDone() {
    if (!T(this, Zt, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return T(this, ie, "f").params;
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
Xs = async function(t, n = T(this, we, "f").signal) {
  return T(this, gt, "f") !== void 0 ? T(this, gt, "f") : (L(this, gt, Hg(T(this, ie, "f").params, t, {
    ...T(this, we, "f"),
    signal: n
  }), "f"), T(this, gt, "f"));
};
async function Hg(e, t = e.messages.at(-1), n) {
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
          content: a instanceof af ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var uf = class cf {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new Er();
    for await (const n of this.iterator) for (const r of t.decode(n)) yield JSON.parse(r);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new V("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new V("Attempted to iterate over a response with no body");
    return new cf(Hi(t.body), n);
  }
}, df = class extends ne {
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
    return this._client.get(B`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", wr, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(B`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(B`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const r = await this.retrieve(e);
    if (!r.results_url) throw new V(`No batch \`results_url\`; Has it finished processing? ${r.processing_status} - ${r.id}`);
    const { betas: o } = t ?? {};
    return this._client.get(r.results_url, {
      ...n,
      headers: N([{
        "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((s, a) => uf.fromResponse(a.response, a.controller));
  }
}, Al = {
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
}, Vg = ["claude-mythos-preview", "claude-opus-4-6"], Cr = class extends ne {
  constructor() {
    super(...arguments), this.batches = new df(this._client);
  }
  create(e, t) {
    const n = Sl(e), { betas: r, ...o } = n;
    o.model in Al && console.warn(`The model '${o.model}' is deprecated and will reach end-of-life on ${Al[o.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Vg.includes(o.model) && o.thinking && o.thinking.type === "enabled" && console.warn(`Using Claude with ${o.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let s = this._client._options.timeout;
    if (!o.stream && s == null) {
      const u = nf[o.model] ?? void 0;
      s = this._client.calculateNonstreamingTimeout(o.max_tokens, u);
    }
    const a = Yd(o.tools, o.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: o,
      timeout: s ?? 6e5,
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
    }, this.create(e, t).then((n) => of(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Gg.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...r } = Sl(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new lf(this._client, e, t);
  }
};
function Sl(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new V("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
Cr.Batches = df;
Cr.BetaToolRunner = lf;
Cr.ToolError = af;
var ff = class extends ne {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(B`/v1/sessions/${e}/events?beta=true`, Pe, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(B`/v1/sessions/${e}/events?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(B`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, hf = class extends ne {
  retrieve(e, t, n) {
    const { session_id: r, betas: o } = t;
    return this._client.get(B`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: r, betas: o, ...s } = t;
    return this._client.post(B`/v1/sessions/${r}/resources/${e}?beta=true`, {
      body: s,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(B`/v1/sessions/${e}/resources?beta=true`, Pe, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: r, betas: o } = t;
    return this._client.delete(B`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(B`/v1/sessions/${e}/resources?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ko = class extends ne {
  constructor() {
    super(...arguments), this.events = new ff(this._client), this.resources = new hf(this._client);
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
    return this._client.get(B`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(B`/v1/sessions/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", Pe, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(B`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(B`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Ko.Events = ff;
Ko.Resources = hf;
var pf = class extends ne {
  create(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.post(B`/v1/skills/${e}/versions?beta=true`, Ji({
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r, betas: o } = t;
    return this._client.get(B`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(B`/v1/skills/${e}/versions?beta=true`, Pe, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: r, betas: o } = t;
    return this._client.delete(B`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, Wi = class extends ne {
  constructor() {
    super(...arguments), this.versions = new pf(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Ji({
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(B`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", Pe, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(B`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
Wi.Versions = pf;
var mf = class extends ne {
  create(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(B`/v1/vaults/${e}/credentials?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.get(B`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: r, betas: o, ...s } = t;
    return this._client.post(B`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      body: s,
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(B`/v1/vaults/${e}/credentials?beta=true`, Pe, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.delete(B`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.post(B`/v1/vaults/${r}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, zi = class extends ne {
  constructor() {
    super(...arguments), this.credentials = new mf(this._client);
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
    return this._client.get(B`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post(B`/v1/vaults/${e}?beta=true`, {
      body: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", Pe, {
      query: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete(B`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post(B`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
zi.Credentials = mf;
var ze = class extends ne {
  constructor() {
    super(...arguments), this.models = new Qd(this._client), this.messages = new Cr(this._client), this.agents = new Ki(this._client), this.environments = new Wd(this._client), this.sessions = new Ko(this._client), this.vaults = new zi(this._client), this.memoryStores = new Jo(this._client), this.files = new Xd(this._client), this.skills = new Wi(this._client), this.userProfiles = new Zd(this._client);
  }
};
ze.Models = Qd;
ze.Messages = Cr;
ze.Agents = Ki;
ze.Environments = Wd;
ze.Sessions = Ko;
ze.Vaults = zi;
ze.MemoryStores = Jo;
ze.Files = Xd;
ze.Skills = Wi;
ze.UserProfiles = Zd;
var gf = class extends ne {
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
function yf(e) {
  return e?.output_config?.format;
}
function Tl(e, t, n) {
  const r = yf(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((o) => o.type === "text" ? Object.defineProperty({ ...o }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : o),
    parsed_output: null
  } : _f(e, t, n);
}
function _f(e, t, n) {
  let r = null;
  const o = e.content.map((s) => {
    if (s.type === "text") {
      const a = Jg(t, s.text);
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
function Jg(e, t) {
  const n = yf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new V(`Failed to parse structured output: ${r}`);
  }
}
var Ve, Et, jt, Un, Hr, Fn, qn, Vr, Bn, dt, Gn, Jr, Kr, $t, Wr, zr, On, Ts, El, Es, ws, Cs, Is, wl, Cl = "__json_buf";
function Il(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var Kg = class Qs {
  constructor(t, n) {
    Ve.add(this), this.messages = [], this.receivedMessages = [], Et.set(this, void 0), jt.set(this, null), this.controller = new AbortController(), Un.set(this, void 0), Hr.set(this, () => {
    }), Fn.set(this, () => {
    }), qn.set(this, void 0), Vr.set(this, () => {
    }), Bn.set(this, () => {
    }), dt.set(this, {}), Gn.set(this, !1), Jr.set(this, !1), Kr.set(this, !1), $t.set(this, !1), Wr.set(this, void 0), zr.set(this, void 0), On.set(this, void 0), Es.set(this, (r) => {
      if (L(this, Jr, !0, "f"), yr(r) && (r = new et()), r instanceof et)
        return L(this, Kr, !0, "f"), this._emit("abort", r);
      if (r instanceof V) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new V(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new V(String(r)));
    }), L(this, Un, new Promise((r, o) => {
      L(this, Hr, r, "f"), L(this, Fn, o, "f");
    }), "f"), L(this, qn, new Promise((r, o) => {
      L(this, Vr, r, "f"), L(this, Bn, o, "f");
    }), "f"), T(this, Un, "f").catch(() => {
    }), T(this, qn, "f").catch(() => {
    }), L(this, jt, t, "f"), L(this, On, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, Wr, "f");
  }
  get request_id() {
    return T(this, zr, "f");
  }
  async withResponse() {
    L(this, $t, !0, "f");
    const t = await T(this, Un, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Qs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const s = new Qs(n, { logger: o });
    for (const a of n.messages) s._addMessageParam(a);
    return L(s, jt, {
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
    }, T(this, Es, "f"));
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
      T(this, Ve, "m", ws).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) T(this, Ve, "m", Cs).call(this, c);
      if (u.controller.signal?.aborted) throw new et();
      T(this, Ve, "m", Is).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  _connected(t) {
    this.ended || (L(this, Wr, t, "f"), L(this, zr, t?.headers.get("request-id"), "f"), T(this, Hr, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, Gn, "f");
  }
  get errored() {
    return T(this, Jr, "f");
  }
  get aborted() {
    return T(this, Kr, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (T(this, dt, "f")[t] || (T(this, dt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = T(this, dt, "f")[t];
    if (!r) return this;
    const o = r.findIndex((s) => s.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (T(this, dt, "f")[t] || (T(this, dt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      L(this, $t, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    L(this, $t, !0, "f"), await T(this, qn, "f");
  }
  get currentMessage() {
    return T(this, Et, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, Ve, "m", Ts).call(this);
  }
  async finalText() {
    return await this.done(), T(this, Ve, "m", El).call(this);
  }
  _emit(t, ...n) {
    if (T(this, Gn, "f")) return;
    t === "end" && (L(this, Gn, !0, "f"), T(this, Vr, "f").call(this));
    const r = T(this, dt, "f")[t];
    if (r && (T(this, dt, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !T(this, $t, "f") && !r?.length && Promise.reject(o), T(this, Fn, "f").call(this, o), T(this, Bn, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !T(this, $t, "f") && !r?.length && Promise.reject(o), T(this, Fn, "f").call(this, o), T(this, Bn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, Ve, "m", Ts).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      T(this, Ve, "m", ws).call(this), this._connected(null);
      const s = _r.fromReadableStream(t, this.controller);
      for await (const a of s) T(this, Ve, "m", Cs).call(this, a);
      if (s.controller.signal?.aborted) throw new et();
      T(this, Ve, "m", Is).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(Et = /* @__PURE__ */ new WeakMap(), jt = /* @__PURE__ */ new WeakMap(), Un = /* @__PURE__ */ new WeakMap(), Hr = /* @__PURE__ */ new WeakMap(), Fn = /* @__PURE__ */ new WeakMap(), qn = /* @__PURE__ */ new WeakMap(), Vr = /* @__PURE__ */ new WeakMap(), Bn = /* @__PURE__ */ new WeakMap(), dt = /* @__PURE__ */ new WeakMap(), Gn = /* @__PURE__ */ new WeakMap(), Jr = /* @__PURE__ */ new WeakMap(), Kr = /* @__PURE__ */ new WeakMap(), $t = /* @__PURE__ */ new WeakMap(), Wr = /* @__PURE__ */ new WeakMap(), zr = /* @__PURE__ */ new WeakMap(), On = /* @__PURE__ */ new WeakMap(), Es = /* @__PURE__ */ new WeakMap(), Ve = /* @__PURE__ */ new WeakSet(), Ts = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, El = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new V("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, ws = function() {
    this.ended || L(this, Et, void 0, "f");
  }, Cs = function(n) {
    if (this.ended) return;
    const r = T(this, Ve, "m", wl).call(this, n);
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
            Il(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage(Tl(r, T(this, jt, "f"), { logger: T(this, On, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        L(this, Et, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Is = function() {
    if (this.ended) throw new V("stream has ended, this shouldn't happen");
    const n = T(this, Et, "f");
    if (!n) throw new V("request ended without sending any chunks");
    return L(this, Et, void 0, "f"), Tl(n, T(this, jt, "f"), { logger: T(this, On, "f") });
  }, wl = function(n) {
    let r = T(this, Et, "f");
    if (n.type === "message_start") {
      if (r) throw new V(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new V(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (o && Il(o)) {
              let s = o[Cl] || "";
              s += n.delta.partial_json;
              const a = { ...o };
              Object.defineProperty(a, Cl, {
                value: s,
                enumerable: !1,
                writable: !0
              }), s && (a.input = sf(s)), r.content[n.index] = a;
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
    return new _r(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, vf = class extends ne {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(B`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", wr, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(B`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(B`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new V(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: N([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((r, o) => uf.fromResponse(o.response, o.controller));
  }
}, Yi = class extends ne {
  constructor() {
    super(...arguments), this.batches = new vf(this._client);
  }
  create(e, t) {
    e.model in bl && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${bl[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Wg.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const o = nf[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, o);
    }
    const r = Yd(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: N([r, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => _f(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Kg.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, bl = {
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
}, Wg = ["claude-mythos-preview", "claude-opus-4-6"];
Yi.Batches = vf;
var Af = class extends ne {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(B`/v1/models/${e}`, {
      ...n,
      headers: N([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models", wr, {
      query: r,
      ...t,
      headers: N([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Yr = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Zs, Xi, fo, Sf, zg = "\\n\\nHuman:", Yg = "\\n\\nAssistant:", oe = class {
  constructor({ baseURL: e = Yr("ANTHROPIC_BASE_URL"), apiKey: t = Yr("ANTHROPIC_API_KEY") ?? null, authToken: n = Yr("ANTHROPIC_AUTH_TOKEN") ?? null, ...r } = {}) {
    Zs.add(this), fo.set(this, void 0);
    const o = {
      apiKey: t,
      authToken: n,
      ...r,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!o.dangerouslyAllowBrowser && ug()) throw new V(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = o.baseURL, this.timeout = o.timeout ?? Xi.DEFAULT_TIMEOUT, this.logger = o.logger ?? console;
    const s = "warn";
    this.logLevel = s, this.logLevel = ul(o.logLevel, "ClientOptions.logLevel", this) ?? ul(Yr("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? s, this.fetchOptions = o.fetchOptions, this.maxRetries = o.maxRetries ?? 2, this.fetch = o.fetch ?? pg(), L(this, fo, gg, "f"), this._options = o, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return yg(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${rn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${wd()}`;
  }
  makeStatusError(e, t, n, r) {
    return Fe.generate(e, t, n, r);
  }
  buildURL(e, t, n) {
    const r = !T(this, Zs, "m", Sf).call(this) && n || this.baseURL, o = sg(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), s = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!nl(s) || !nl(a)) && (t = {
      ...a,
      ...s,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (o.search = this.stringifyQuery(t)), o.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new V("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
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
    return new qd(this, this.makeRequest(e, t, void 0));
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
    if (Ae(this).debug(`[${c}] sending request`, Lt({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: s.headers
    })), r.signal?.aborted) throw new et();
    const f = new AbortController(), p = await this.fetchWithTimeout(a, s, u, f).catch(Hs), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new et();
      const v = yr(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return Ae(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${_}`), Ae(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${_})`, Lt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(r, t, n ?? c);
      throw Ae(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), Ae(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, Lt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - h,
        message: p.message
      })), v ? new Cd() : new Vo({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, v]) => ", " + _ + ": " + JSON.stringify(v)).join("")}] ${s.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const M = `retrying, ${t} attempts remaining`;
        return await mg(p.body), Ae(this).info(`${g} - ${M}`), Ae(this).debug(`[${c}] response error (${M})`, Lt({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(r, t, n ?? c, p.headers);
      }
      const v = _ ? "error; no more retries left" : "error; not retryable";
      Ae(this).info(`${g} - ${v}`);
      const w = await p.text().catch((M) => Hs(M).message), I = Dd(w), P = I ? void 0 : w;
      throw Ae(this).debug(`[${c}] response error (${v})`, Lt({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: P,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, I, P, p.headers);
    }
    return Ae(this).info(g), Ae(this).debug(`[${c}] response start`, Lt({
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
    return new Ig(this, n, e);
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
    return await lg(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new V("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: s, defaultBaseURL: a } = n, u = this.buildURL(o, s, a);
    "timeout" in n && ag("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const s = N([
      o,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...hg(),
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
    const n = N([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Ld(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : T(this, fo, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Xi = oe, fo = /* @__PURE__ */ new WeakMap(), Zs = /* @__PURE__ */ new WeakSet(), Sf = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
oe.Anthropic = Xi;
oe.HUMAN_PROMPT = zg;
oe.AI_PROMPT = Yg;
oe.DEFAULT_TIMEOUT = 6e5;
oe.AnthropicError = V;
oe.APIError = Fe;
oe.APIConnectionError = Vo;
oe.APIConnectionTimeoutError = Cd;
oe.APIUserAbortError = et;
oe.NotFoundError = Rd;
oe.ConflictError = xd;
oe.RateLimitError = Nd;
oe.BadRequestError = Id;
oe.AuthenticationError = bd;
oe.InternalServerError = kd;
oe.PermissionDeniedError = Pd;
oe.UnprocessableEntityError = Md;
oe.toFile = Ng;
var Ir = class extends oe {
  constructor() {
    super(...arguments), this.completions = new gf(this), this.messages = new Yi(this), this.models = new Af(this), this.beta = new ze(this);
  }
};
Ir.Completions = gf;
Ir.Messages = Yi;
Ir.Models = Af;
Ir.Beta = ze;
function yn(e) {
  if (Array.isArray(e)) return e.map((n) => yn(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key|proxy_password|password/i.test(n) ? "[redacted]" : yn(r);
  }), t;
}
function vr(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: yn({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    })
  };
}
function Xg(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Qg(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function Tf(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Zg(e) {
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
      const r = Qg(n.image_url.url);
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
function jg(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function ey(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && Tf(t) || null;
}
function ty(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: Tf(e.content) || [] } : void 0;
}
function Pl(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function Rl(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: Xg(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function ny(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const r = e[n];
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const o = ey(r), s = Rl(r.tool_calls);
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
        const o = [Pl(r)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, o.push(Pl(e[n]));
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
          }] : [], ...Rl(r.tool_calls)]
        });
        continue;
      }
      t.push({
        role: r.role,
        content: Zg(r.content)
      });
    }
  }
  return t;
}
function Xr(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function xl(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
var ry = class {
  constructor(e) {
    this.config = e, this.client = new Ir({
      apiKey: e.apiKey,
      baseURL: xl(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e) {
    const t = (e.tools || []).map((o) => ({
      name: o.function.name,
      description: o.function.description,
      input_schema: o.function.parameters
    })), n = jg(e), r = {
      model: this.config.model,
      system: n,
      messages: ny(e.messages),
      tools: t,
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (r.temperature = e.temperature), e.reasoning?.enabled && (r.thinking = {
      type: "adaptive",
      display: "summarized"
    }), r;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = xl(this.config.baseUrl);
    return vr({
      provider: "anthropic",
      model: this.config.model,
      transport: "anthropic-sdk",
      url: `${r}/v1/messages`,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey || ""
      },
      body: t.body || this.buildRequestBody(e),
      sdk: n ? "client.messages.stream" : "client.messages.create"
    });
  }
  async chat(e) {
    const t = this.buildRequestBody(e), n = this.inspectRequest(e, { body: t });
    let r;
    if (typeof e.onStreamProgress == "function") {
      const s = this.client.messages.stream(t, { signal: e.signal }), a = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
      let c = "";
      const d = () => Array.from(a.entries()).sort(([p], [m]) => p.localeCompare(m)).map(([p, m]) => ({
        label: p.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: m
      })).filter((p) => p.text), h = () => Array.from(u.entries()).sort(([p], [m]) => Number(p) - Number(m)).map(([, p]) => ({
        id: p.id || "anthropic-tool-draft",
        name: p.name || "工具调用",
        arguments: p.inputJson || "{}",
        draft: !0
      })).filter((p) => p.name), f = () => {
        const p = h();
        p.length && Xr(e, {
          text: c,
          thoughts: d(),
          toolCalls: p,
          toolCallDraft: !0
        });
      };
      s.on("text", (p, m) => {
        c = m || "", Xr(e, {
          text: c,
          thoughts: d(),
          ...h().length ? {
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), s.on("thinking", (p, m) => {
        a.set("thinking:0", m || ""), Xr(e, {
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
        p?.type === "redacted_thinking" && (a.set("redacted:0", p.data || ""), Xr(e, {
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
      thoughts: (r.content || []).filter((s) => s.type === "thinking" || s.type === "redacted_thinking").map((s) => ({
        label: s.type === "thinking" ? "思考块" : "已脱敏思考块",
        text: s.type === "thinking" ? s.thinking || "" : s.data || ""
      })).filter((s) => s.text),
      finishReason: r.stop_reason || "stop",
      model: r.model || this.config.model,
      provider: "anthropic",
      providerPayload: ty(r),
      requestInspection: n
    };
  }
}, oy = /* @__PURE__ */ Oo(((e, t) => {
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
})), sy = /* @__PURE__ */ Oo(((e) => {
  var t = oy();
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
        p.push(function(g) {
          f.retry(g) || (g && (arguments[0] = f.mainError()), m.apply(this, arguments));
        }), f.attempt(function() {
          h.apply(n, p);
        });
      }.bind(n, c), n[u].options = r;
    }
  };
})), iy = /* @__PURE__ */ Oo(((e, t) => {
  t.exports = sy();
})), ay = /* @__PURE__ */ Oo(((e, t) => {
  var n = iy(), r = [
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
      } catch (g) {
        if (!(g instanceof Error)) {
          f(/* @__PURE__ */ new TypeError(`Non-error was thrown: "${g}". You should only throw errors.`));
          return;
        }
        if (g instanceof o)
          p.stop(), f(g.originalError);
        else if (g instanceof TypeError && !a(g.message))
          p.stop(), f(g);
        else {
          s(g, m, d);
          try {
            await d.onFailedAttempt(g);
          } catch (_) {
            f(_);
            return;
          }
          p.retry(g) || f(p.mainError());
        }
      }
    });
  });
  t.exports = u, t.exports.default = u, t.exports.AbortError = o;
})), Ml = /* @__PURE__ */ Xm(ay(), 1), ly = void 0, uy = void 0;
function cy() {
  return {
    geminiUrl: ly,
    vertexUrl: uy
  };
}
function dy(e, t, n, r) {
  var o, s;
  if (!e?.baseUrl) {
    const a = cy();
    return t ? (o = a.vertexUrl) !== null && o !== void 0 ? o : n : (s = a.geminiUrl) !== null && s !== void 0 ? s : r;
  }
  return e.baseUrl;
}
var _t = class {
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
function fy(e, t) {
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
    js(e, o, s, 0, a);
  }
}
function js(e, t, n, r, o) {
  if (r >= t.length || typeof e != "object" || e === null) return;
  const s = t[r];
  if (s.endsWith("[]")) {
    const a = s.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) js(c, t, n, r + 1, o);
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
    s in a && js(a[s], t, n, r + 1, o);
  }
}
function Qi(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function hy(e) {
  const t = {}, n = i(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const r = i(e, ["resourceName"]);
  return r != null && l(t, ["_url", "resourceName"], r), t;
}
function py(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], gy(a)), t;
}
function my(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], yy(a)), t;
}
function gy(e) {
  const t = {}, n = i(e, ["generatedSamples"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((a) => _y(a))), l(t, ["generatedVideos"], s);
  }
  const r = i(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = i(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function yy(e) {
  const t = {}, n = i(e, ["videos"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((a) => vy(a))), l(t, ["generatedVideos"], s);
  }
  const r = i(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = i(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function _y(e) {
  const t = {}, n = i(e, ["video"]);
  return n != null && l(t, ["video"], Cy(n)), t;
}
function vy(e) {
  const t = {}, n = i(e, ["_self"]);
  return n != null && l(t, ["video"], Iy(n)), t;
}
function Ay(e) {
  const t = {}, n = i(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Sy(e) {
  const t = {}, n = i(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Ty(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], Ey(a)), t;
}
function Ey(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = i(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function Ef(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], wy(a)), t;
}
function wy(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = i(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function Cy(e) {
  const t = {}, n = i(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const r = i(e, ["encodedVideo"]);
  r != null && l(t, ["videoBytes"], Qi(r));
  const o = i(e, ["encoding"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Iy(e) {
  const t = {}, n = i(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const r = i(e, ["bytesBase64Encoded"]);
  r != null && l(t, ["videoBytes"], Qi(r));
  const o = i(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
var Nl;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(Nl || (Nl = {}));
var kl;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(kl || (kl = {}));
var Dl;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(Dl || (Dl = {}));
var Rt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(Rt || (Rt = {}));
var $l;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})($l || ($l = {}));
var Ll;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(Ll || (Ll = {}));
var Ul;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(Fl || (Fl = {}));
var ql;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(ql || (ql = {}));
var Bl;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(Bl || (Bl = {}));
var Gl;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(Gl || (Gl = {}));
var ei;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(ei || (ei = {}));
var cr;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(cr || (cr = {}));
var Ol;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(Ol || (Ol = {}));
var Hl;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Hl || (Hl = {}));
var Vl;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Vl || (Vl = {}));
var Jl;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Jl || (Jl = {}));
var Kl;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Kl || (Kl = {}));
var Wl;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Wl || (Wl = {}));
var zl;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(zl || (zl = {}));
var Yl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Xl || (Xl = {}));
var Ql;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Ql || (Ql = {}));
var Zl;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Zl || (Zl = {}));
var bo;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(bo || (bo = {}));
var jl;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(jl || (jl = {}));
var eu;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(eu || (eu = {}));
var tu;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(tu || (tu = {}));
var nu;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(nu || (nu = {}));
var ti;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(ti || (ti = {}));
var ru;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(ru || (ru = {}));
var ou;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(ou || (ou = {}));
var su;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(su || (su = {}));
var iu;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(iu || (iu = {}));
var au;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(au || (au = {}));
var lu;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(lu || (lu = {}));
var uu;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(uu || (uu = {}));
var ni;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(ni || (ni = {}));
var cu;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(cu || (cu = {}));
var du;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(du || (du = {}));
var Po;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(Po || (Po = {}));
var fu;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(fu || (fu = {}));
var hu;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(hu || (hu = {}));
var pu;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(pu || (pu = {}));
var mu;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(mu || (mu = {}));
var gu;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(gu || (gu = {}));
var yu;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(yu || (yu = {}));
var _u;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(_u || (_u = {}));
var vu;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(vu || (vu = {}));
var Au;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(Au || (Au = {}));
var Su;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(Su || (Su = {}));
var Tu;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(Tu || (Tu = {}));
var Eu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(Eu || (Eu = {}));
var wu;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(wu || (wu = {}));
var Cu;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(Cu || (Cu = {}));
var Iu;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(Iu || (Iu = {}));
var bu;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(bu || (bu = {}));
var Pu;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(Pu || (Pu = {}));
var Ru;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(Ru || (Ru = {}));
var xu;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(xu || (xu = {}));
var Mu;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(Mu || (Mu = {}));
var Nu;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(Nu || (Nu = {}));
var ku;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(ku || (ku = {}));
var Du;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(Du || (Du = {}));
var dn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(dn || (dn = {}));
var ri = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Hn = class {
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
}, $u = class {
}, Lu = class {
}, by = class {
}, Py = class {
}, Ry = class {
}, xy = class {
}, Uu = class {
}, Fu = class {
}, qu = class {
}, My = class {
}, Bu = class wf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new wf();
    let o;
    const s = t;
    return n ? o = my(s) : o = py(s), Object.assign(r, o), r;
  }
}, Gu = class {
}, Ou = class {
}, Hu = class {
}, Vu = class {
}, Ny = class {
}, ky = class {
}, Dy = class {
}, $y = class Cf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new Cf(), o = Ty(t);
    return Object.assign(r, o), r;
  }
}, Ly = class {
}, Uy = class {
}, Fy = class {
}, qy = class {
}, Ju = class {
}, By = class {
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
}, Gy = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, Oy = class If {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new If(), o = Ef(t);
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
function bf(e, t) {
  const n = Y(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function Pf(e) {
  return Array.isArray(e) ? e.map((t) => Ro(t)) : [Ro(e)];
}
function Ro(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function Rf(e) {
  const t = Ro(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function xf(e) {
  const t = Ro(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Ku(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function Mf(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Ku(t)) : [Ku(e)];
}
function oi(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Wu(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function zu(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function de(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return oi(e) ? e : {
    role: "user",
    parts: Mf(e)
  };
}
function Zi(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const r = de(n);
    return r.parts && r.parts.length > 0 && r.parts[0].text !== void 0 ? [r.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = de(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => de(n)) : [de(t)];
}
function Ie(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Wu(e) || zu(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [de(e)];
  }
  const t = [], n = [], r = oi(e[0]);
  for (const o of e) {
    const s = oi(o);
    if (s != r) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (s) t.push(o);
    else {
      if (Wu(o) || zu(o)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(o);
    }
  }
  return r || t.push({
    role: "user",
    parts: Mf(n)
  }), t;
}
function Hy(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((r) => r !== "null");
  if (n.length === 1) t.type = Object.values(Rt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : Rt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const r of n) t.anyOf.push({ type: Object.values(Rt).includes(r.toUpperCase()) ? r.toUpperCase() : Rt.TYPE_UNSPECIFIED });
  }
}
function pn(e) {
  const t = {}, n = ["items"], r = ["anyOf"], o = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const s = e.anyOf;
  s != null && s.length == 2 && (s[0].type === "null" ? (t.nullable = !0, e = s[1]) : s[1].type === "null" && (t.nullable = !0, e = s[0])), e.type instanceof Array && Hy(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(Rt).includes(u.toUpperCase()) ? u.toUpperCase() : Rt.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = pn(u);
      else if (r.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(pn(d));
        }
        t[a] = c;
      } else if (o.includes(a)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = pn(h);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function ji(e) {
  return pn(e);
}
function ea(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function ta(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function Sn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = pn(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = pn(t.response));
  return e;
}
function Tn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function Vy(e, t, n, r = 1) {
  const o = !t.startsWith(`${n}/`) && t.split("/").length === r;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : o ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : o ? `${n}/${t}` : t;
}
function vt(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return Vy(e, t, "cachedContents");
}
function Nf(e) {
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
function Nt(e) {
  return Qi(e);
}
function Jy(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function Ky(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function Wy(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function kf(e) {
  var t;
  let n;
  if (Jy(e) && (n = e.name), !(Wy(e) && (n = e.uri, n === void 0)) && !(Ky(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const r = n.split("files/")[1].match(/[a-z0-9]+/);
      if (r === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = r[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function Df(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function $f(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (zy(e, t)) return e[t];
  return [];
}
function zy(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function Yy(e, t = {}) {
  const n = e, r = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (r.responseJsonSchema = n.outputSchema), t.behavior && (r.behavior = t.behavior), { functionDeclarations: [r] };
}
function Xy(e, t = {}) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = o.name;
    if (r.has(s)) throw new Error(`Duplicate function name ${s} found in MCP tools. Please ensure function names are unique.`);
    r.add(s);
    const a = Yy(o, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function Lf(e, t) {
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
function Qy(e) {
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
function Uf(e) {
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
function En(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function Ff(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function Zy(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function jy(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function e_(e) {
  const t = {}, n = i(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const r = i(e, ["inlinedResponses", "inlinedResponses"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => D_(a))), l(t, ["inlinedResponses"], s);
  }
  const o = i(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], s);
  }
  return t;
}
function t_(e) {
  const t = {}, n = i(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const r = i(e, ["gcsDestination", "outputUriPrefix"]);
  r != null && l(t, ["gcsUri"], r);
  const o = i(e, ["bigqueryDestination", "outputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function n_(e) {
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
function ho(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata", "displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = i(e, ["metadata", "state"]);
  o != null && l(t, ["state"], Ff(o));
  const s = i(e, ["metadata", "createTime"]);
  s != null && l(t, ["createTime"], s);
  const a = i(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = i(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = i(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = i(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], e_(Uf(d))), t;
}
function si(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = i(e, ["state"]);
  o != null && l(t, ["state"], Ff(o));
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
  f != null && l(t, ["src"], r_(f));
  const p = i(e, ["outputConfig"]);
  p != null && l(t, ["dest"], t_(Uf(p)));
  const m = i(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function r_(e) {
  const t = {}, n = i(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const r = i(e, ["gcsSource", "uris"]);
  r != null && l(t, ["gcsUri"], r);
  const o = i(e, ["bigquerySource", "inputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function o_(e, t) {
  const n = {};
  if (i(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (i(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (i(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const r = i(t, ["fileName"]);
  r != null && l(n, ["fileName"], r);
  const o = i(t, ["inlinedRequests"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => k_(e, a))), l(n, ["requests", "requests"], s);
  }
  return n;
}
function s_(e) {
  const t = {}, n = i(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const r = i(e, ["gcsUri"]);
  r != null && l(t, ["gcsSource", "uris"], r);
  const o = i(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigquerySource", "inputUri"], o), i(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (i(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function i_(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function a_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], En(e, r)), n;
}
function l_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], En(e, r)), n;
}
function u_(e) {
  const t = {}, n = i(e, ["content"]);
  n != null && l(t, ["content"], n);
  const r = i(e, ["citationMetadata"]);
  r != null && l(t, ["citationMetadata"], c_(r));
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
function c_(e) {
  const t = {}, n = i(e, ["citationSources"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["citations"], r);
  }
  return t;
}
function qf(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => G_(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function d_(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  if (t !== void 0 && r != null && l(t, ["batch", "displayName"], r), i(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const o = i(e, ["webhookConfig"]);
  return t !== void 0 && o != null && l(t, ["batch", "webhookConfig"], o), n;
}
function f_(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const o = i(e, ["dest"]);
  if (t !== void 0 && o != null && l(t, ["outputConfig"], n_(Qy(o))), i(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Yu(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = i(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], o_(e, Lf(e, o)));
  const s = i(t, ["config"]);
  return s != null && d_(s, n), n;
}
function h_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["model"], Y(e, r));
  const o = i(t, ["src"]);
  o != null && l(n, ["inputConfig"], s_(Lf(e, o)));
  const s = i(t, ["config"]);
  return s != null && f_(s, n), n;
}
function p_(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["batch", "displayName"], r), n;
}
function m_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = i(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], T_(e, o));
  const s = i(t, ["config"]);
  return s != null && p_(s, n), n;
}
function g_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], En(e, r)), n;
}
function y_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], En(e, r)), n;
}
function __(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  return s != null && l(t, ["error"], s), t;
}
function v_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  return s != null && l(t, ["error"], s), t;
}
function A_(e, t) {
  const n = {}, r = i(t, ["contents"]);
  if (r != null) {
    let s = Zi(e, r);
    Array.isArray(s) && (s = s.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], s);
  }
  const o = i(t, ["config"]);
  return o != null && (l(n, ["_self"], S_(o, n)), fy(n, { "requests[].*": "requests[].request.*" })), n;
}
function S_(e, t) {
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
function T_(e, t) {
  const n = {}, r = i(t, ["fileName"]);
  r != null && l(n, ["file_name"], r);
  const o = i(t, ["inlinedRequests"]);
  return o != null && l(n, ["requests"], A_(e, o)), n;
}
function E_(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function w_(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function C_(e) {
  const t = {}, n = i(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = i(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function I_(e, t, n) {
  const r = {}, o = i(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], qf(de(o)));
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
  const g = i(t, ["frequencyPenalty"]);
  g != null && l(r, ["frequencyPenalty"], g);
  const _ = i(t, ["seed"]);
  _ != null && l(r, ["seed"], _);
  const v = i(t, ["responseMimeType"]);
  v != null && l(r, ["responseMimeType"], v);
  const w = i(t, ["responseSchema"]);
  w != null && l(r, ["responseSchema"], ji(w));
  const I = i(t, ["responseJsonSchema"]);
  if (I != null && l(r, ["responseJsonSchema"], I), i(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (i(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = i(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let Q = P;
    Array.isArray(Q) && (Q = Q.map((X) => O_(X))), l(n, ["safetySettings"], Q);
  }
  const M = i(t, ["tools"]);
  if (n !== void 0 && M != null) {
    let Q = Tn(M);
    Array.isArray(Q) && (Q = Q.map((X) => V_(Sn(X)))), l(n, ["tools"], Q);
  }
  const x = i(t, ["toolConfig"]);
  if (n !== void 0 && x != null && l(n, ["toolConfig"], H_(x)), i(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const C = i(t, ["cachedContent"]);
  n !== void 0 && C != null && l(n, ["cachedContent"], vt(e, C));
  const F = i(t, ["responseModalities"]);
  F != null && l(r, ["responseModalities"], F);
  const R = i(t, ["mediaResolution"]);
  R != null && l(r, ["mediaResolution"], R);
  const D = i(t, ["speechConfig"]);
  if (D != null && l(r, ["speechConfig"], ea(D)), i(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = i(t, ["thinkingConfig"]);
  H != null && l(r, ["thinkingConfig"], H);
  const z = i(t, ["imageConfig"]);
  z != null && l(r, ["imageConfig"], N_(z));
  const j = i(t, ["enableEnhancedCivicAnswers"]);
  if (j != null && l(r, ["enableEnhancedCivicAnswers"], j), i(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const ee = i(t, ["serviceTier"]);
  return n !== void 0 && ee != null && l(n, ["serviceTier"], ee), r;
}
function b_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["candidates"]);
  if (r != null) {
    let d = r;
    Array.isArray(d) && (d = d.map((h) => u_(h))), l(t, ["candidates"], d);
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
function P_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], En(e, r)), n;
}
function R_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], En(e, r)), n;
}
function x_(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], jy(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function M_(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function N_(e) {
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
function k_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["request", "model"], Y(e, r));
  const o = i(t, ["contents"]);
  if (o != null) {
    let u = Ie(o);
    Array.isArray(u) && (u = u.map((c) => qf(c))), l(n, ["request", "contents"], u);
  }
  const s = i(t, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const a = i(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], I_(e, a, i(n, ["request"], {}))), n;
}
function D_(e) {
  const t = {}, n = i(e, ["response"]);
  n != null && l(t, ["response"], b_(n));
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function $_(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  if (t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), i(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function L_(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const s = i(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), n;
}
function U_(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && $_(n, t), t;
}
function F_(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && L_(n, t), t;
}
function q_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = i(e, ["operations"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => ho(a))), l(t, ["batchJobs"], s);
  }
  return t;
}
function B_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = i(e, ["batchPredictionJobs"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => si(a))), l(t, ["batchJobs"], s);
  }
  return t;
}
function G_(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], E_(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], w_(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], i_(c));
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
  const g = i(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = i(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function O_(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = i(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function H_(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = i(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], C_(r));
  const o = i(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function V_(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], M_(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], x_(s));
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
var yt;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(yt || (yt = {}));
var Yt = class {
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
}, J_ = class extends _t {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Yt(yt.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Yu(this.apiClient, e), n = t._url, r = $("{model}:batchGenerateContent", n), o = t.batch.inputConfig.requests, s = o.requests, a = [];
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
      const c = h_(this.apiClient, e);
      return a = $("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => si(d));
    } else {
      const c = Yu(this.apiClient, e);
      return a = $("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => ho(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = m_(this.apiClient, e);
      return o = $("{model}:asyncBatchEmbedContent", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => ho(u));
    }
  }
  async get(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = R_(this.apiClient, e);
      return a = $("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => si(d));
    } else {
      const c = P_(this.apiClient, e);
      return a = $("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => ho(d));
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let s = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = l_(this.apiClient, e);
      s = $("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: s,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = a_(this.apiClient, e);
      s = $("batches/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
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
      const c = F_(e);
      return a = $("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = B_(d), f = new Ju();
        return Object.assign(f, h), f;
      });
    } else {
      const c = U_(e);
      return a = $("batches", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = q_(d), f = new Ju();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = y_(this.apiClient, e);
      return a = $("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => v_(d));
    } else {
      const c = g_(this.apiClient, e);
      return a = $("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => __(d));
    }
  }
};
function K_(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function W_(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Xu(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => gv(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Qu(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => yv(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function z_(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const s = i(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const a = i(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let h = Ie(a);
    Array.isArray(h) && (h = h.map((f) => Xu(f))), l(t, ["contents"], h);
  }
  const u = i(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Xu(de(u)));
  const c = i(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => Av(f))), l(t, ["tools"], h);
  }
  const d = i(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], _v(d)), i(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function Y_(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const s = i(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const a = i(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = Ie(a);
    Array.isArray(f) && (f = f.map((p) => Qu(p))), l(t, ["contents"], f);
  }
  const u = i(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Qu(de(u)));
  const c = i(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => Sv(p))), l(t, ["tools"], f);
  }
  const d = i(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], vv(d));
  const h = i(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function X_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["model"], bf(e, r));
  const o = i(t, ["config"]);
  return o != null && z_(o, n), n;
}
function Q_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["model"], bf(e, r));
  const o = i(t, ["config"]);
  return o != null && Y_(o, n), n;
}
function Z_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], vt(e, r)), n;
}
function j_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], vt(e, r)), n;
}
function ev(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function tv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function nv(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function rv(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function ov(e) {
  const t = {}, n = i(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = i(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function sv(e) {
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
function iv(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], vt(e, r)), n;
}
function av(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], vt(e, r)), n;
}
function lv(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], K_(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function uv(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function cv(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function dv(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function fv(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && cv(n, t), t;
}
function hv(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && dv(n, t), t;
}
function pv(e) {
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
function mv(e) {
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
function gv(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], nv(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], rv(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], W_(c));
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
  const g = i(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = i(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function yv(e) {
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
function _v(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = i(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], ov(r));
  const o = i(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function vv(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = i(e, ["functionCallingConfig"]);
  if (r != null && l(t, ["functionCallingConfig"], r), i(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function Av(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], uv(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], lv(s));
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
function Sv(e) {
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
    Array.isArray(p) && (p = p.map((m) => sv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = i(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = i(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = i(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function Tv(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function Ev(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function wv(e, t) {
  const n = {}, r = i(t, ["name"]);
  r != null && l(n, ["_url", "name"], vt(e, r));
  const o = i(t, ["config"]);
  return o != null && Tv(o, n), n;
}
function Cv(e, t) {
  const n = {}, r = i(t, ["name"]);
  r != null && l(n, ["_url", "name"], vt(e, r));
  const o = i(t, ["config"]);
  return o != null && Ev(o, n), n;
}
var Iv = class extends _t {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Yt(yt.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Q_(this.apiClient, e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const c = X_(this.apiClient, e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
      const c = av(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const c = iv(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
      const c = j_(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = tv(d), f = new Hu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Z_(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = ev(d), f = new Hu();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Cv(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const c = wv(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
      const c = hv(e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = mv(d), f = new Vu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = fv(e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = pv(d), f = new Vu();
        return Object.assign(f, h), f;
      });
    }
  }
};
function xt(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, r = Object.getOwnPropertySymbols(e); o < r.length; o++) t.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[o]) && (n[r[o]] = e[r[o]]);
  return n;
}
function Zu(e) {
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
function tt(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var r = n.apply(e, t || []), o, s = [];
  return o = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), u("next"), u("throw"), u("return", a), o[Symbol.asyncIterator] = function() {
    return this;
  }, o;
  function a(m) {
    return function(g) {
      return Promise.resolve(g).then(m, f);
    };
  }
  function u(m, g) {
    r[m] && (o[m] = function(_) {
      return new Promise(function(v, w) {
        s.push([
          m,
          _,
          v,
          w
        ]) > 1 || c(m, _);
      });
    }, g && (o[m] = g(o[m])));
  }
  function c(m, g) {
    try {
      d(r[m](g));
    } catch (_) {
      p(s[0][3], _);
    }
  }
  function d(m) {
    m.value instanceof J ? Promise.resolve(m.value.v).then(h, f) : p(s[0][2], m);
  }
  function h(m) {
    c("next", m);
  }
  function f(m) {
    c("throw", m);
  }
  function p(m, g) {
    m(g), s.shift(), s.length && c(s[0][0], s[0][1]);
  }
}
function nt(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Zu == "function" ? Zu(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
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
function bv(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : Bf(n);
}
function Bf(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function Pv(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function ju(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let r = 0;
  for (; r < n; ) if (e[r].role === "user")
    t.push(e[r]), r++;
  else {
    const o = [];
    let s = !0;
    for (; r < n && e[r].role === "model"; )
      o.push(e[r]), s && !Bf(e[r]) && (s = !1), r++;
    s ? t.push(...o) : t.pop();
  }
  return t;
}
var Rv = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new xv(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, xv = class {
  constructor(e, t, n, r = {}, o = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = r, this.history = o, this.sendPromise = Promise.resolve(), Pv(o);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = de(e.message), r = this.modelsModule.generateContent({
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
    const n = de(e.message), r = this.modelsModule.generateContentStream({
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
    const t = e ? ju(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return tt(this, arguments, function* () {
      var r, o, s, a, u, c;
      const d = [];
      try {
        for (var h = !0, f = nt(e), p; p = yield J(f.next()), r = p.done, !r; h = !0) {
          a = p.value, h = !1;
          const m = a;
          if (bv(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield J(m);
        }
      } catch (m) {
        o = { error: m };
      } finally {
        try {
          !h && !r && (s = f.return) && (yield J(s.call(f)));
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
    }), n && n.length > 0 ? this.history.push(...ju(n)) : this.history.push(e), this.history.push(...r);
  }
}, Gf = class Of extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Of.prototype);
  }
};
function Mv(e) {
  const t = {}, n = i(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function Nv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function kv(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "file"], kf(n)), t;
}
function Dv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function $v(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "file"], kf(n)), t;
}
function Lv(e) {
  const t = {}, n = i(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function Uv(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function Fv(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && Uv(n, t), t;
}
function qv(e) {
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
function Bv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["files"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["files"], o);
  }
  return t;
}
var Gv = class extends _t {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Yt(yt.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const a = Fv(e);
      return o = $("files", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
        const c = qv(u), d = new Ly();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Mv(e);
      return o = $("upload/v1beta/files", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = Nv(u), d = new Uy();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = $v(e);
      return o = $("files/{file}", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
      const a = kv(e);
      return o = $("files/{file}", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
        const c = Dv(u), d = new Fy();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Lv(e);
      return o = $("files:register", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = Bv(u), d = new qy();
        return Object.assign(d, c), d;
      });
    }
  }
};
function ec(e) {
  const t = {};
  if (i(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function Ov(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function po(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Hv(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => iA(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Vv(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => aA(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Jv(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Kv(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Wv(e) {
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
function zv(e) {
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
  const g = i(e, ["responseModalities"]);
  g != null && l(t, ["responseModalities"], g);
  const _ = i(e, ["responseSchema"]);
  _ != null && l(t, ["responseSchema"], _);
  const v = i(e, ["routingConfig"]);
  v != null && l(t, ["routingConfig"], v);
  const w = i(e, ["seed"]);
  w != null && l(t, ["seed"], w);
  const I = i(e, ["speechConfig"]);
  I != null && l(t, ["speechConfig"], I);
  const P = i(e, ["stopSequences"]);
  P != null && l(t, ["stopSequences"], P);
  const M = i(e, ["temperature"]);
  M != null && l(t, ["temperature"], M);
  const x = i(e, ["thinkingConfig"]);
  x != null && l(t, ["thinkingConfig"], x);
  const C = i(e, ["topK"]);
  C != null && l(t, ["topK"], C);
  const F = i(e, ["topP"]);
  if (F != null && l(t, ["topP"], F), i(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function Yv(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Ov(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function Xv(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function Qv(e, t) {
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
  ], ta(f));
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
  const g = i(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Hv(de(g)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let R = Tn(_);
    Array.isArray(R) && (R = R.map((D) => cA(Sn(D)))), l(t, ["setup", "tools"], R);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], uA(v));
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], ec(w));
  const I = i(e, ["outputAudioTranscription"]);
  t !== void 0 && I != null && l(t, ["setup", "outputAudioTranscription"], ec(I));
  const P = i(e, ["realtimeInputConfig"]);
  t !== void 0 && P != null && l(t, ["setup", "realtimeInputConfig"], P);
  const M = i(e, ["contextWindowCompression"]);
  t !== void 0 && M != null && l(t, ["setup", "contextWindowCompression"], M);
  const x = i(e, ["proactivity"]);
  if (t !== void 0 && x != null && l(t, ["setup", "proactivity"], x), i(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const C = i(e, ["avatarConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "avatarConfig"], C);
  const F = i(e, ["safetySettings"]);
  if (t !== void 0 && F != null) {
    let R = F;
    Array.isArray(R) && (R = R.map((D) => lA(D))), l(t, ["setup", "safetySettings"], R);
  }
  return n;
}
function Zv(e, t) {
  const n = {}, r = i(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], zv(r));
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
  ], ta(f));
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
  const g = i(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Vv(de(g)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let D = Tn(_);
    Array.isArray(D) && (D = D.map((H) => dA(Sn(H)))), l(t, ["setup", "tools"], D);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], v);
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], w);
  const I = i(e, ["outputAudioTranscription"]);
  t !== void 0 && I != null && l(t, ["setup", "outputAudioTranscription"], I);
  const P = i(e, ["realtimeInputConfig"]);
  t !== void 0 && P != null && l(t, ["setup", "realtimeInputConfig"], P);
  const M = i(e, ["contextWindowCompression"]);
  t !== void 0 && M != null && l(t, ["setup", "contextWindowCompression"], M);
  const x = i(e, ["proactivity"]);
  t !== void 0 && x != null && l(t, ["setup", "proactivity"], x);
  const C = i(e, ["explicitVadSignal"]);
  t !== void 0 && C != null && l(t, ["setup", "explicitVadSignal"], C);
  const F = i(e, ["avatarConfig"]);
  t !== void 0 && F != null && l(t, ["setup", "avatarConfig"], F);
  const R = i(e, ["safetySettings"]);
  if (t !== void 0 && R != null) {
    let D = R;
    Array.isArray(D) && (D = D.map((H) => H)), l(t, ["setup", "safetySettings"], D);
  }
  return n;
}
function jv(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = i(t, ["config"]);
  return o != null && l(n, ["config"], Qv(o, n)), n;
}
function eA(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = i(t, ["config"]);
  return o != null && l(n, ["config"], Zv(o, n)), n;
}
function tA(e) {
  const t = {}, n = i(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function nA(e) {
  const t = {}, n = i(e, ["weightedPrompts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["weightedPrompts"], r);
  }
  return t;
}
function rA(e) {
  const t = {}, n = i(e, ["media"]);
  if (n != null) {
    let d = Pf(n);
    Array.isArray(d) && (d = d.map((h) => po(h))), l(t, ["mediaChunks"], d);
  }
  const r = i(e, ["audio"]);
  r != null && l(t, ["audio"], po(xf(r)));
  const o = i(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const s = i(e, ["video"]);
  s != null && l(t, ["video"], po(Rf(s)));
  const a = i(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = i(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = i(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function oA(e) {
  const t = {}, n = i(e, ["media"]);
  if (n != null) {
    let d = Pf(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const r = i(e, ["audio"]);
  r != null && l(t, ["audio"], xf(r));
  const o = i(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const s = i(e, ["video"]);
  s != null && l(t, ["video"], Rf(s));
  const a = i(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = i(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = i(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function sA(e) {
  const t = {}, n = i(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const r = i(e, ["serverContent"]);
  r != null && l(t, ["serverContent"], r);
  const o = i(e, ["toolCall"]);
  o != null && l(t, ["toolCall"], o);
  const s = i(e, ["toolCallCancellation"]);
  s != null && l(t, ["toolCallCancellation"], s);
  const a = i(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], fA(a));
  const u = i(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = i(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = i(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = i(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], hA(h)), t;
}
function iA(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], Jv(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Kv(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], po(c));
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
  const g = i(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = i(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function aA(e) {
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
function lA(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = i(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function uA(e) {
  const t = {}, n = i(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), i(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function cA(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], Xv(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], Yv(s));
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
function dA(e) {
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
    Array.isArray(p) && (p = p.map((m) => Wv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = i(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = i(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = i(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function fA(e) {
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
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["promptTokensDetails"], m);
  }
  const d = i(e, ["cacheTokensDetails"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["cacheTokensDetails"], m);
  }
  const h = i(e, ["candidatesTokensDetails"]);
  if (h != null) {
    let m = h;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["responseTokensDetails"], m);
  }
  const f = i(e, ["toolUsePromptTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["toolUsePromptTokensDetails"], m);
  }
  const p = i(e, ["trafficType"]);
  return p != null && l(t, ["trafficType"], p), t;
}
function hA(e) {
  const t = {}, n = i(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function pA(e, t) {
  const n = {}, r = i(e, ["apiKey"]);
  if (r != null && l(n, ["apiKey"], r), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function mA(e, t) {
  const n = {}, r = i(e, ["data"]);
  if (r != null && l(n, ["data"], r), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function gA(e, t) {
  const n = {}, r = i(e, ["content"]);
  r != null && l(n, ["content"], r);
  const o = i(e, ["citationMetadata"]);
  o != null && l(n, ["citationMetadata"], yA(o));
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
    Array.isArray(m) && (m = m.map((g) => g)), l(n, ["safetyRatings"], m);
  }
  const p = i(e, ["urlContextMetadata"]);
  return p != null && l(n, ["urlContextMetadata"], p), n;
}
function yA(e, t) {
  const n = {}, r = i(e, ["citationSources"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => s)), l(n, ["citations"], o);
  }
  return n;
}
function _A(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let a = Ie(s);
    Array.isArray(a) && (a = a.map((u) => wn(u))), l(r, ["contents"], a);
  }
  return r;
}
function vA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["tokensInfo"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(n, ["tokensInfo"], s);
  }
  return n;
}
function AA(e, t) {
  const n = {}, r = i(e, ["values"]);
  r != null && l(n, ["values"], r);
  const o = i(e, ["statistics"]);
  return o != null && l(n, ["statistics"], SA(o)), n;
}
function SA(e, t) {
  const n = {}, r = i(e, ["truncated"]);
  r != null && l(n, ["truncated"], r);
  const o = i(e, ["token_count"]);
  return o != null && l(n, ["tokenCount"], o), n;
}
function br(e, t) {
  const n = {}, r = i(e, ["parts"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => xS(a))), l(n, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function wn(e, t) {
  const n = {}, r = i(e, ["parts"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => MS(a))), l(n, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function TA(e, t) {
  const n = {}, r = i(e, ["controlType"]);
  r != null && l(n, ["controlType"], r);
  const o = i(e, ["enableControlImageComputation"]);
  return o != null && l(n, ["computeControl"], o), n;
}
function EA(e, t) {
  const n = {};
  if (i(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (i(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (i(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function wA(e, t, n) {
  const r = {}, o = i(e, ["systemInstruction"]);
  t !== void 0 && o != null && l(t, ["systemInstruction"], wn(de(o)));
  const s = i(e, ["tools"]);
  if (t !== void 0 && s != null) {
    let u = s;
    Array.isArray(u) && (u = u.map((c) => Kf(c))), l(t, ["tools"], u);
  }
  const a = i(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], mS(a)), r;
}
function CA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let u = Ie(s);
    Array.isArray(u) && (u = u.map((c) => br(c))), l(r, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && EA(a), r;
}
function IA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let u = Ie(s);
    Array.isArray(u) && (u = u.map((c) => wn(c))), l(r, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && wA(a, r), r;
}
function bA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["totalTokens"]);
  o != null && l(n, ["totalTokens"], o);
  const s = i(e, ["cachedContentTokenCount"]);
  return s != null && l(n, ["cachedContentTokenCount"], s), n;
}
function PA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["totalTokens"]);
  return o != null && l(n, ["totalTokens"], o), n;
}
function RA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function xA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function MA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function NA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function kA(e, t, n) {
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
  const g = i(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
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
  const I = i(e, ["labels"]);
  t !== void 0 && I != null && l(t, ["labels"], I);
  const P = i(e, ["editMode"]);
  t !== void 0 && P != null && l(t, ["parameters", "editMode"], P);
  const M = i(e, ["baseSteps"]);
  return t !== void 0 && M != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], M), r;
}
function DA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => US(d))), l(r, ["instances[0]", "referenceImages"], c);
  }
  const u = i(t, ["config"]);
  return u != null && kA(u, r), r;
}
function $A(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => Wo(a))), l(n, ["generatedImages"], s);
  }
  return n;
}
function LA(e, t, n) {
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
function UA(e, t, n) {
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
function FA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let d = Zi(e, s);
    Array.isArray(d) && (d = d.map((h) => h)), l(r, ["requests[]", "content"], d);
  }
  const a = i(t, ["content"]);
  a != null && br(de(a));
  const u = i(t, ["config"]);
  u != null && LA(u, r);
  const c = i(t, ["model"]);
  return c !== void 0 && l(r, ["requests[]", "model"], Y(e, c)), r;
}
function qA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  let s = i(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "PREDICT") {
    const c = i(t, ["contents"]);
    if (c != null) {
      let d = Zi(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(r, ["instances[]", "content"], d);
    }
  }
  let a = i(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = i(t, ["content"]);
    c != null && l(r, ["content"], wn(de(c)));
  }
  const u = i(t, ["config"]);
  return u != null && UA(u, r, n), r;
}
function BA(e, t) {
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
function GA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions[]", "embeddings"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => AA(u))), l(n, ["embeddings"], a);
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
function OA(e, t) {
  const n = {}, r = i(e, ["endpoint"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["deployedModelId"]);
  return o != null && l(n, ["deployedModelId"], o), n;
}
function HA(e, t) {
  const n = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["fileUri"]);
  r != null && l(n, ["fileUri"], r);
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function VA(e, t) {
  const n = {}, r = i(e, ["id"]);
  r != null && l(n, ["id"], r);
  const o = i(e, ["args"]);
  o != null && l(n, ["args"], o);
  const s = i(e, ["name"]);
  if (s != null && l(n, ["name"], s), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function JA(e, t) {
  const n = {}, r = i(e, ["allowedFunctionNames"]);
  r != null && l(n, ["allowedFunctionNames"], r);
  const o = i(e, ["mode"]);
  if (o != null && l(n, ["mode"], o), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function KA(e, t) {
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
function WA(e, t, n, r) {
  const o = {}, s = i(t, ["systemInstruction"]);
  n !== void 0 && s != null && l(n, ["systemInstruction"], br(de(s)));
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
  const g = i(t, ["presencePenalty"]);
  g != null && l(o, ["presencePenalty"], g);
  const _ = i(t, ["frequencyPenalty"]);
  _ != null && l(o, ["frequencyPenalty"], _);
  const v = i(t, ["seed"]);
  v != null && l(o, ["seed"], v);
  const w = i(t, ["responseMimeType"]);
  w != null && l(o, ["responseMimeType"], w);
  const I = i(t, ["responseSchema"]);
  I != null && l(o, ["responseSchema"], ji(I));
  const P = i(t, ["responseJsonSchema"]);
  if (P != null && l(o, ["responseJsonSchema"], P), i(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (i(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const M = i(t, ["safetySettings"]);
  if (n !== void 0 && M != null) {
    let X = M;
    Array.isArray(X) && (X = X.map((me) => FS(me))), l(n, ["safetySettings"], X);
  }
  const x = i(t, ["tools"]);
  if (n !== void 0 && x != null) {
    let X = Tn(x);
    Array.isArray(X) && (X = X.map((me) => KS(Sn(me)))), l(n, ["tools"], X);
  }
  const C = i(t, ["toolConfig"]);
  if (n !== void 0 && C != null && l(n, ["toolConfig"], VS(C)), i(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const F = i(t, ["cachedContent"]);
  n !== void 0 && F != null && l(n, ["cachedContent"], vt(e, F));
  const R = i(t, ["responseModalities"]);
  R != null && l(o, ["responseModalities"], R);
  const D = i(t, ["mediaResolution"]);
  D != null && l(o, ["mediaResolution"], D);
  const H = i(t, ["speechConfig"]);
  if (H != null && l(o, ["speechConfig"], ea(H)), i(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const z = i(t, ["thinkingConfig"]);
  z != null && l(o, ["thinkingConfig"], z);
  const j = i(t, ["imageConfig"]);
  j != null && l(o, ["imageConfig"], AS(j));
  const ee = i(t, ["enableEnhancedCivicAnswers"]);
  if (ee != null && l(o, ["enableEnhancedCivicAnswers"], ee), i(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const Q = i(t, ["serviceTier"]);
  return n !== void 0 && Q != null && l(n, ["serviceTier"], Q), o;
}
function zA(e, t, n, r) {
  const o = {}, s = i(t, ["systemInstruction"]);
  n !== void 0 && s != null && l(n, ["systemInstruction"], wn(de(s)));
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
  const g = i(t, ["presencePenalty"]);
  g != null && l(o, ["presencePenalty"], g);
  const _ = i(t, ["frequencyPenalty"]);
  _ != null && l(o, ["frequencyPenalty"], _);
  const v = i(t, ["seed"]);
  v != null && l(o, ["seed"], v);
  const w = i(t, ["responseMimeType"]);
  w != null && l(o, ["responseMimeType"], w);
  const I = i(t, ["responseSchema"]);
  I != null && l(o, ["responseSchema"], ji(I));
  const P = i(t, ["responseJsonSchema"]);
  P != null && l(o, ["responseJsonSchema"], P);
  const M = i(t, ["routingConfig"]);
  M != null && l(o, ["routingConfig"], M);
  const x = i(t, ["modelSelectionConfig"]);
  x != null && l(o, ["modelConfig"], x);
  const C = i(t, ["safetySettings"]);
  if (n !== void 0 && C != null) {
    let _e = C;
    Array.isArray(_e) && (_e = _e.map((Xt) => Xt)), l(n, ["safetySettings"], _e);
  }
  const F = i(t, ["tools"]);
  if (n !== void 0 && F != null) {
    let _e = Tn(F);
    Array.isArray(_e) && (_e = _e.map((Xt) => Kf(Sn(Xt)))), l(n, ["tools"], _e);
  }
  const R = i(t, ["toolConfig"]);
  n !== void 0 && R != null && l(n, ["toolConfig"], JS(R));
  const D = i(t, ["labels"]);
  n !== void 0 && D != null && l(n, ["labels"], D);
  const H = i(t, ["cachedContent"]);
  n !== void 0 && H != null && l(n, ["cachedContent"], vt(e, H));
  const z = i(t, ["responseModalities"]);
  z != null && l(o, ["responseModalities"], z);
  const j = i(t, ["mediaResolution"]);
  j != null && l(o, ["mediaResolution"], j);
  const ee = i(t, ["speechConfig"]);
  ee != null && l(o, ["speechConfig"], ea(ee));
  const Q = i(t, ["audioTimestamp"]);
  Q != null && l(o, ["audioTimestamp"], Q);
  const X = i(t, ["thinkingConfig"]);
  X != null && l(o, ["thinkingConfig"], X);
  const me = i(t, ["imageConfig"]);
  if (me != null && l(o, ["imageConfig"], SS(me)), i(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Ge = i(t, ["modelArmorConfig"]);
  n !== void 0 && Ge != null && l(n, ["modelArmorConfig"], Ge);
  const Ee = i(t, ["serviceTier"]);
  return n !== void 0 && Ee != null && l(n, ["serviceTier"], Ee), o;
}
function tc(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let u = Ie(s);
    Array.isArray(u) && (u = u.map((c) => br(c))), l(r, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && l(r, ["generationConfig"], WA(e, a, r)), r;
}
function nc(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let u = Ie(s);
    Array.isArray(u) && (u = u.map((c) => wn(c))), l(r, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && l(r, ["generationConfig"], zA(e, a, r)), r;
}
function rc(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["candidates"]);
  if (o != null) {
    let h = o;
    Array.isArray(h) && (h = h.map((f) => gA(f))), l(n, ["candidates"], h);
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
function oc(e, t) {
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
function YA(e, t, n) {
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
  const g = i(e, ["imageSize"]);
  if (t !== void 0 && g != null && l(t, ["parameters", "sampleImageSize"], g), i(e, ["enhancePrompt"]) !== void 0) throw new Error("enhancePrompt parameter is not supported in Gemini API.");
  return r;
}
function XA(e, t, n) {
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
  const g = i(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
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
  const I = i(e, ["labels"]);
  t !== void 0 && I != null && l(t, ["labels"], I);
  const P = i(e, ["imageSize"]);
  t !== void 0 && P != null && l(t, ["parameters", "sampleImageSize"], P);
  const M = i(e, ["enhancePrompt"]);
  return t !== void 0 && M != null && l(t, ["parameters", "enhancePrompt"], M), r;
}
function QA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["config"]);
  return a != null && YA(a, r), r;
}
function ZA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["config"]);
  return a != null && XA(a, r), r;
}
function jA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => dS(u))), l(n, ["generatedImages"], a);
  }
  const s = i(e, ["positivePromptSafetyAttributes"]);
  return s != null && l(n, ["positivePromptSafetyAttributes"], Vf(s)), n;
}
function eS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => Wo(u))), l(n, ["generatedImages"], a);
  }
  const s = i(e, ["positivePromptSafetyAttributes"]);
  return s != null && l(n, ["positivePromptSafetyAttributes"], Jf(s)), n;
}
function tS(e, t, n) {
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
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], zo(f));
  const p = i(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => sT(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (i(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (i(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (i(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = i(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), r;
}
function nS(e, t, n) {
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
  const g = i(e, ["enhancePrompt"]);
  t !== void 0 && g != null && l(t, ["parameters", "enhancePrompt"], g);
  const _ = i(e, ["generateAudio"]);
  t !== void 0 && _ != null && l(t, ["parameters", "generateAudio"], _);
  const v = i(e, ["lastFrame"]);
  t !== void 0 && v != null && l(t, ["instances[0]", "lastFrame"], rt(v));
  const w = i(e, ["referenceImages"]);
  if (t !== void 0 && w != null) {
    let x = w;
    Array.isArray(x) && (x = x.map((C) => iT(C))), l(t, ["instances[0]", "referenceImages"], x);
  }
  const I = i(e, ["mask"]);
  t !== void 0 && I != null && l(t, ["instances[0]", "mask"], oT(I));
  const P = i(e, ["compressionQuality"]);
  t !== void 0 && P != null && l(t, ["parameters", "compressionQuality"], P);
  const M = i(e, ["labels"]);
  if (t !== void 0 && M != null && l(t, ["labels"], M), i(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return r;
}
function rS(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const s = i(e, ["done"]);
  s != null && l(n, ["done"], s);
  const a = i(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = i(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], aS(u)), n;
}
function oS(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const s = i(e, ["done"]);
  s != null && l(n, ["done"], s);
  const a = i(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = i(e, ["response"]);
  return u != null && l(n, ["response"], lS(u)), n;
}
function sS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], zo(a));
  const u = i(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], Wf(u));
  const c = i(t, ["source"]);
  c != null && uS(c, r);
  const d = i(t, ["config"]);
  return d != null && tS(d, r), r;
}
function iS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], rt(a));
  const u = i(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], zf(u));
  const c = i(t, ["source"]);
  c != null && cS(c, r);
  const d = i(t, ["config"]);
  return d != null && nS(d, r), r;
}
function aS(e, t) {
  const n = {}, r = i(e, ["generatedSamples"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => hS(u))), l(n, ["generatedVideos"], a);
  }
  const o = i(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const s = i(e, ["raiMediaFilteredReasons"]);
  return s != null && l(n, ["raiMediaFilteredReasons"], s), n;
}
function lS(e, t) {
  const n = {}, r = i(e, ["videos"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => pS(u))), l(n, ["generatedVideos"], a);
  }
  const o = i(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const s = i(e, ["raiMediaFilteredReasons"]);
  return s != null && l(n, ["raiMediaFilteredReasons"], s), n;
}
function uS(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["image"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "image"], zo(s));
  const a = i(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Wf(a)), r;
}
function cS(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["image"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "image"], rt(s));
  const a = i(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], zf(a)), r;
}
function dS(e, t) {
  const n = {}, r = i(e, ["_self"]);
  r != null && l(n, ["image"], TS(r));
  const o = i(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const s = i(e, ["_self"]);
  return s != null && l(n, ["safetyAttributes"], Vf(s)), n;
}
function Wo(e, t) {
  const n = {}, r = i(e, ["_self"]);
  r != null && l(n, ["image"], Hf(r));
  const o = i(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const s = i(e, ["_self"]);
  s != null && l(n, ["safetyAttributes"], Jf(s));
  const a = i(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function fS(e, t) {
  const n = {}, r = i(e, ["_self"]);
  r != null && l(n, ["mask"], Hf(r));
  const o = i(e, ["labels"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(n, ["labels"], s);
  }
  return n;
}
function hS(e, t) {
  const n = {}, r = i(e, ["video"]);
  return r != null && l(n, ["video"], nT(r)), n;
}
function pS(e, t) {
  const n = {}, r = i(e, ["_self"]);
  return r != null && l(n, ["video"], rT(r)), n;
}
function mS(e, t) {
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
  const g = i(e, ["responseMimeType"]);
  g != null && l(n, ["responseMimeType"], g);
  const _ = i(e, ["responseModalities"]);
  _ != null && l(n, ["responseModalities"], _);
  const v = i(e, ["responseSchema"]);
  v != null && l(n, ["responseSchema"], v);
  const w = i(e, ["routingConfig"]);
  w != null && l(n, ["routingConfig"], w);
  const I = i(e, ["seed"]);
  I != null && l(n, ["seed"], I);
  const P = i(e, ["speechConfig"]);
  P != null && l(n, ["speechConfig"], P);
  const M = i(e, ["stopSequences"]);
  M != null && l(n, ["stopSequences"], M);
  const x = i(e, ["temperature"]);
  x != null && l(n, ["temperature"], x);
  const C = i(e, ["thinkingConfig"]);
  C != null && l(n, ["thinkingConfig"], C);
  const F = i(e, ["topK"]);
  F != null && l(n, ["topK"], F);
  const R = i(e, ["topP"]);
  if (R != null && l(n, ["topP"], R), i(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function gS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function yS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function _S(e, t) {
  const n = {}, r = i(e, ["authConfig"]);
  r != null && l(n, ["authConfig"], pA(r));
  const o = i(e, ["enableWidget"]);
  return o != null && l(n, ["enableWidget"], o), n;
}
function vS(e, t) {
  const n = {}, r = i(e, ["searchTypes"]);
  if (r != null && l(n, ["searchTypes"], r), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = i(e, ["timeRangeFilter"]);
  return o != null && l(n, ["timeRangeFilter"], o), n;
}
function AS(e, t) {
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
function SS(e, t) {
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
function TS(e, t) {
  const n = {}, r = i(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], Nt(r));
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function Hf(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = i(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], Nt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function zo(e, t) {
  const n = {};
  if (i(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const r = i(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], Nt(r));
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function rt(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = i(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Nt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function ES(e, t, n, r) {
  const o = {}, s = i(t, ["pageSize"]);
  n !== void 0 && s != null && l(n, ["_query", "pageSize"], s);
  const a = i(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = i(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = i(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], Df(e, c)), o;
}
function wS(e, t, n, r) {
  const o = {}, s = i(t, ["pageSize"]);
  n !== void 0 && s != null && l(n, ["_query", "pageSize"], s);
  const a = i(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = i(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = i(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], Df(e, c)), o;
}
function CS(e, t, n) {
  const r = {}, o = i(t, ["config"]);
  return o != null && ES(e, o, r), r;
}
function IS(e, t, n) {
  const r = {}, o = i(t, ["config"]);
  return o != null && wS(e, o, r), r;
}
function bS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["_self"]);
  if (s != null) {
    let a = $f(s);
    Array.isArray(a) && (a = a.map((u) => ii(u))), l(n, ["models"], a);
  }
  return n;
}
function PS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["_self"]);
  if (s != null) {
    let a = $f(s);
    Array.isArray(a) && (a = a.map((u) => ai(u))), l(n, ["models"], a);
  }
  return n;
}
function RS(e, t) {
  const n = {}, r = i(e, ["maskMode"]);
  r != null && l(n, ["maskMode"], r);
  const o = i(e, ["segmentationClasses"]);
  o != null && l(n, ["maskClasses"], o);
  const s = i(e, ["maskDilation"]);
  return s != null && l(n, ["dilation"], s), n;
}
function ii(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const s = i(e, ["description"]);
  s != null && l(n, ["description"], s);
  const a = i(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = i(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], WS(u));
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
  const g = i(e, ["topK"]);
  g != null && l(n, ["topK"], g);
  const _ = i(e, ["thinking"]);
  return _ != null && l(n, ["thinking"], _), n;
}
function ai(e, t) {
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
    Array.isArray(p) && (p = p.map((m) => OA(m))), l(n, ["endpoints"], p);
  }
  const c = i(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = i(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], zS(d));
  const h = i(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = i(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function xS(e, t) {
  const n = {}, r = i(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = i(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const s = i(e, ["executableCode"]);
  s != null && l(n, ["executableCode"], s);
  const a = i(e, ["fileData"]);
  a != null && l(n, ["fileData"], HA(a));
  const u = i(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], VA(u));
  const c = i(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = i(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], mA(d));
  const h = i(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = i(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = i(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = i(e, ["videoMetadata"]);
  m != null && l(n, ["videoMetadata"], m);
  const g = i(e, ["toolCall"]);
  g != null && l(n, ["toolCall"], g);
  const _ = i(e, ["toolResponse"]);
  _ != null && l(n, ["toolResponse"], _);
  const v = i(e, ["partMetadata"]);
  return v != null && l(n, ["partMetadata"], v), n;
}
function MS(e, t) {
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
function NS(e, t) {
  const n = {}, r = i(e, ["productImage"]);
  return r != null && l(n, ["image"], rt(r)), n;
}
function kS(e, t, n) {
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
  const g = i(e, ["labels"]);
  return t !== void 0 && g != null && l(t, ["labels"], g), r;
}
function DS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["source"]);
  s != null && LS(s, r);
  const a = i(t, ["config"]);
  return a != null && kS(a, r), r;
}
function $S(e, t) {
  const n = {}, r = i(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => Wo(s))), l(n, ["generatedImages"], o);
  }
  return n;
}
function LS(e, t, n) {
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
    Array.isArray(u) && (u = u.map((c) => NS(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return r;
}
function US(e, t) {
  const n = {}, r = i(e, ["referenceImage"]);
  r != null && l(n, ["referenceImage"], rt(r));
  const o = i(e, ["referenceId"]);
  o != null && l(n, ["referenceId"], o);
  const s = i(e, ["referenceType"]);
  s != null && l(n, ["referenceType"], s);
  const a = i(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], RS(a));
  const u = i(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], TA(u));
  const c = i(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = i(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function Vf(e, t) {
  const n = {}, r = i(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = i(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const s = i(e, ["contentType"]);
  return s != null && l(n, ["contentType"], s), n;
}
function Jf(e, t) {
  const n = {}, r = i(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = i(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const s = i(e, ["contentType"]);
  return s != null && l(n, ["contentType"], s), n;
}
function FS(e, t) {
  const n = {}, r = i(e, ["category"]);
  if (r != null && l(n, ["category"], r), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = i(e, ["threshold"]);
  return o != null && l(n, ["threshold"], o), n;
}
function qS(e, t) {
  const n = {}, r = i(e, ["image"]);
  return r != null && l(n, ["image"], rt(r)), n;
}
function BS(e, t, n) {
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
function GS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["source"]);
  s != null && HS(s, r);
  const a = i(t, ["config"]);
  return a != null && BS(a, r), r;
}
function OS(e, t) {
  const n = {}, r = i(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => fS(s))), l(n, ["generatedMasks"], o);
  }
  return n;
}
function HS(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["image"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "image"], rt(s));
  const a = i(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], qS(a)), r;
}
function VS(e, t) {
  const n = {}, r = i(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = i(e, ["functionCallingConfig"]);
  o != null && l(n, ["functionCallingConfig"], JA(o));
  const s = i(e, ["includeServerSideToolInvocations"]);
  return s != null && l(n, ["includeServerSideToolInvocations"], s), n;
}
function JS(e, t) {
  const n = {}, r = i(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = i(e, ["functionCallingConfig"]);
  if (o != null && l(n, ["functionCallingConfig"], o), i(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function KS(e, t) {
  const n = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const r = i(e, ["computerUse"]);
  r != null && l(n, ["computerUse"], r);
  const o = i(e, ["fileSearch"]);
  o != null && l(n, ["fileSearch"], o);
  const s = i(e, ["googleSearch"]);
  s != null && l(n, ["googleSearch"], vS(s));
  const a = i(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], _S(a));
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
function Kf(e, t) {
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
    Array.isArray(m) && (m = m.map((g) => KA(g))), l(n, ["functionDeclarations"], m);
  }
  const h = i(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = i(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = i(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function WS(e, t) {
  const n = {}, r = i(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const s = i(e, ["updateTime"]);
  return s != null && l(n, ["updateTime"], s), n;
}
function zS(e, t) {
  const n = {}, r = i(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const s = i(e, ["updateTime"]);
  return s != null && l(n, ["updateTime"], s), n;
}
function YS(e, t, n) {
  const r = {}, o = i(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = i(e, ["description"]);
  t !== void 0 && s != null && l(t, ["description"], s);
  const a = i(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function XS(e, t, n) {
  const r = {}, o = i(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = i(e, ["description"]);
  t !== void 0 && s != null && l(t, ["description"], s);
  const a = i(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function QS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "name"], Y(e, o));
  const s = i(t, ["config"]);
  return s != null && YS(s, r), r;
}
function ZS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["config"]);
  return s != null && XS(s, r), r;
}
function jS(e, t, n) {
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
  const g = i(e, ["mode"]);
  return t !== void 0 && g != null && l(t, ["parameters", "mode"], g), r;
}
function eT(e, t, n) {
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
  return u != null && jS(u, r), r;
}
function tT(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => Wo(a))), l(n, ["generatedImages"], s);
  }
  return n;
}
function nT(e, t) {
  const n = {}, r = i(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = i(e, ["encodedVideo"]);
  o != null && l(n, ["videoBytes"], Nt(o));
  const s = i(e, ["encoding"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function rT(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["uri"], r);
  const o = i(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["videoBytes"], Nt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function oT(e, t) {
  const n = {}, r = i(e, ["image"]);
  r != null && l(n, ["_self"], rt(r));
  const o = i(e, ["maskMode"]);
  return o != null && l(n, ["maskMode"], o), n;
}
function sT(e, t) {
  const n = {}, r = i(e, ["image"]);
  r != null && l(n, ["image"], zo(r));
  const o = i(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function iT(e, t) {
  const n = {}, r = i(e, ["image"]);
  r != null && l(n, ["image"], rt(r));
  const o = i(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function Wf(e, t) {
  const n = {}, r = i(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = i(e, ["videoBytes"]);
  o != null && l(n, ["encodedVideo"], Nt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["encoding"], s), n;
}
function zf(e, t) {
  const n = {}, r = i(e, ["uri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = i(e, ["videoBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Nt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function aT(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["displayName"], r), n;
}
function lT(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && aT(n, t), t;
}
function uT(e, t) {
  const n = {}, r = i(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function cT(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = i(e, ["config"]);
  return r != null && uT(r, t), t;
}
function dT(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function fT(e, t) {
  const n = {}, r = i(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => a)), l(t, ["customMetadata"], s);
  }
  const o = i(e, ["chunkingConfig"]);
  return t !== void 0 && o != null && l(t, ["chunkingConfig"], o), n;
}
function hT(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], mT(a)), t;
}
function pT(e) {
  const t = {}, n = i(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = i(e, ["fileName"]);
  r != null && l(t, ["fileName"], r);
  const o = i(e, ["config"]);
  return o != null && fT(o, t), t;
}
function mT(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = i(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function gT(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function yT(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && gT(n, t), t;
}
function _T(e) {
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
function Yf(e, t) {
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
function vT(e) {
  const t = {}, n = i(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = i(e, ["config"]);
  return r != null && Yf(r, t), t;
}
function AT(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var ST = "Content-Type", TT = "X-Server-Timeout", ET = "User-Agent", li = "x-goog-api-client", wT = "google-genai-sdk/1.50.1", CT = "v1beta1", IT = "v1beta", bT = /* @__PURE__ */ new Set(["us", "eu"]), PT = 5, RT = [
  408,
  429,
  500,
  502,
  503,
  504
], xT = class {
  constructor(e) {
    var t, n, r;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const o = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const s = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !s ? (o.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? o.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && bT.has(this.clientOptions.location) ? o.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (o.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), o.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : CT;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), o.apiVersion = (r = this.clientOptions.apiVersion) !== null && r !== void 0 ? r : IT, o.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === ni.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
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
    return t && t.extraBody !== null && MT(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await sc(r), new ri(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await sc(r), this.processStreamResponse(r))).catch((r) => {
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
          const { done: c, value: d } = yield J(r.read());
          if (c) {
            if (s.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const h = o.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(h);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, v = g.code, w = `got status: ${_}. ${JSON.stringify(m)}`;
              if (v >= 400 && v < 600) throw new Gf({
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
            const g = m.trim();
            if (g.startsWith(a)) {
              const _ = g.substring(5).trim();
              try {
                yield yield J(new ri(new Response(_, {
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
      throw RT.includes(s.status) ? new Error(`Retryable HTTP Error: ${s.statusText}`) : new Ml.AbortError(`Non-retryable exception ${s.statusText} sending request`);
    };
    return (0, Ml.default)(o, { retries: ((n = r.attempts) !== null && n !== void 0 ? n : PT) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = wT + " " + this.clientOptions.userAgentExtra;
    return e[ET] = t, e[li] = t, e[ST] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [r, o] of Object.entries(e.headers)) n.append(r, o);
      e.timeout && e.timeout > 0 && n.append(TT, String(Math.ceil(e.timeout / 1e3)));
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
    const u = { file: r }, c = this.getFileName(e), d = $("upload/v1beta/files", u._url), h = await this.fetchUploadUrl(d, r.sizeBytes, r.mimeType, c, u, t?.httpOptions);
    return o.upload(e, h, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var r;
    const o = this.clientOptions.uploader, s = await o.stat(t), a = String(s.size), u = (r = n?.mimeType) !== null && r !== void 0 ? r : s.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), h = {};
    n != null && Yf(n, h);
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
async function sc(e) {
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
    throw n >= 400 && n < 600 ? new Gf({
      message: o,
      status: n
    }) : new Error(o);
  }
}
function MT(e, t) {
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
var NT = "mcp_used/unknown", kT = !1;
function Xf(e) {
  for (const t of e)
    if (DT(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return kT;
}
function Qf(e) {
  var t;
  e[li] = (((t = e[li]) !== null && t !== void 0 ? t : "") + ` ${NT}`).trimStart();
}
function DT(e) {
  return e !== null && typeof e == "object" && e instanceof LT;
}
function $T(e) {
  return tt(this, arguments, function* (n, r = 100) {
    let o, s = 0;
    for (; s < r; ) {
      const a = yield J(n.listTools({ cursor: o }));
      for (const u of a.tools)
        yield yield J(u), s++;
      if (!a.nextCursor) break;
      o = a.nextCursor;
    }
  });
}
var LT = class Zf {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Zf(t, n);
  }
  async initialize() {
    var t, n, r, o;
    if (this.mcpTools.length > 0) return;
    const s = {}, a = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, nt($T(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
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
    return await this.initialize(), Xy(this.mcpTools, this.config);
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
async function UT(e, t, n) {
  const r = new Gy();
  let o;
  n.data instanceof Blob ? o = JSON.parse(await n.data.text()) : o = JSON.parse(n.data), Object.assign(r, o), t(r);
}
var FT = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), o = this.apiClient.getApiVersion(), s = GT(this.apiClient.getDefaultHeaders()), a = `${r}/ws/google.ai.generativelanguage.${o}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        UT(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(a, BT(s), p);
    m.connect(), await c;
    const g = { setup: { model: Y(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new qT(m, this.apiClient);
  }
}, qT = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = nA(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = tA(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(dn.PLAY);
  }
  pause() {
    this.sendPlaybackControl(dn.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(dn.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(dn.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function BT(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function GT(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var OT = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function HT(e, t, n) {
  const r = new By();
  let o;
  n.data instanceof Blob ? o = await n.data.text() : n.data instanceof ArrayBuffer ? o = new TextDecoder().decode(n.data) : o = n.data;
  const s = JSON.parse(o);
  if (e.isVertexAI()) {
    const a = sA(s);
    Object.assign(r, a);
  } else Object.assign(r, s);
  t(r);
}
var VT = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new FT(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, r, o, s, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && Xf(e.config.tools) && Qf(h);
    const f = zT(h);
    if (this.apiClient.isVertexAI()) {
      const R = this.apiClient.getProject(), D = this.apiClient.getLocation(), H = this.apiClient.getApiKey(), z = !!R && !!D || !!H;
      this.apiClient.getCustomBaseUrl() && !z ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const R = this.apiClient.getApiKey();
      let D = "BidiGenerateContent", H = "key";
      R?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), D = "BidiGenerateContentConstrained", H = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${D}?${H}=${R}`;
    }
    let p = () => {
    };
    const m = new Promise((R) => {
      p = R;
    }), g = e.callbacks, _ = function() {
      var R;
      (R = g?.onopen) === null || R === void 0 || R.call(g), p({});
    }, v = this.apiClient, w = {
      onopen: _,
      onmessage: (R) => {
        HT(v, g.onmessage, R);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(R) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(R) {
      }
    }, I = this.webSocketFactory.create(d, WT(f), w);
    I.connect(), await m;
    let P = Y(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && P.startsWith("publishers/")) {
      const R = this.apiClient.getProject(), D = this.apiClient.getLocation();
      R && D && (P = `projects/${R}/locations/${D}/` + P);
    }
    let M = {};
    this.apiClient.isVertexAI() && ((r = e.config) === null || r === void 0 ? void 0 : r.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [bo.AUDIO] } : e.config.responseModalities = [bo.AUDIO]), !((o = e.config) === null || o === void 0) && o.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const x = (a = (s = e.config) === null || s === void 0 ? void 0 : s.tools) !== null && a !== void 0 ? a : [], C = [];
    for (const R of x) if (this.isCallableTool(R)) {
      const D = R;
      C.push(await D.tool());
    } else C.push(R);
    C.length > 0 && (e.config.tools = C);
    const F = {
      model: P,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? M = eA(this.apiClient, F) : M = jv(this.apiClient, F), delete M.config, I.send(JSON.stringify(M)), new KT(I, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, JT = { turnComplete: !0 }, KT = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = Ie(t.turns), e.isVertexAI() || (n = n.map((r) => br(r)));
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
      if (!e.isVertexAI() && !("id" in r)) throw new Error(OT);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, JT), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: oA(e) } : t = { realtimeInput: rA(e) }, this.conn.send(JSON.stringify(t));
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
function WT(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function zT(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var ic = 10;
function ac(e) {
  var t, n, r;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let o = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (mn(a)) {
    o = !0;
    break;
  }
  if (!o) return !0;
  const s = (r = e?.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls;
  return s && (s < 0 || !Number.isInteger(s)) || s == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", s), !0) : !1;
}
function mn(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function YT(e) {
  var t, n, r;
  return (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((o) => mn(o))) !== null && r !== void 0 ? r : !1;
}
function lc(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((r, o) => {
    if (mn(r)) return;
    const s = r;
    s.functionDeclarations && s.functionDeclarations.length > 0 && n.push(o);
  }), n;
}
function uc(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var XT = class extends _t {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = Ie(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = Ie(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const r = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: Po.EMBED_CONTENT
        });
        return await this.embedContentInternal(r);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: Po.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, r, o, s, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !YT(t) || ac(t.config)) return await this.generateContentInternal(u);
      const c = lc(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, h;
      const f = Ie(u.contents), p = (o = (r = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && o !== void 0 ? o : ic;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const v of (a = (s = t.config) === null || s === void 0 ? void 0 : s.tools) !== null && a !== void 0 ? a : []) if (mn(v)) {
          const w = await v.callTool(d.functionCalls);
          _.push(...w);
        }
        m++, h = {
          role: "user",
          parts: _
        }, u.contents = Ie(u.contents), u.contents.push(g), u.contents.push(h), uc(u.config) && (f.push(g), f.push(h));
      }
      return uc(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, r, o, s, a;
      if (this.maybeMoveToResponseJsonSchem(t), ac(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = lc(t);
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
      return new Yt(yt.PAGED_ITEM_MODELS, (o) => this.listInternal(o), await this.listInternal(r), r);
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
    const s = await Promise.all(o.map(async (u) => mn(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: s })
    };
    if (a.config.tools = s, e.config && e.config.tools && Xf(e.config.tools)) {
      const u = (r = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && r !== void 0 ? r : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), Qf(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, r;
    const o = /* @__PURE__ */ new Map();
    for (const s of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (mn(s)) {
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
    const o = (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && r !== void 0 ? r : ic;
    let s = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return tt(this, arguments, function* () {
        for (var f, p, m, g, _, v; a < o; ) {
          s && (a++, s = !1);
          const M = yield J(c.processParamsMaybeAddMcpUsage(h)), x = yield J(c.generateContentStreamInternal(M)), C = [], F = [];
          try {
            for (var w = !0, I = (p = void 0, nt(x)), P; P = yield J(I.next()), f = P.done, !f; w = !0) {
              g = P.value, w = !1;
              const R = g;
              if (yield yield J(R), R.candidates && (!((_ = R.candidates[0]) === null || _ === void 0) && _.content)) {
                F.push(R.candidates[0].content);
                for (const D of (v = R.candidates[0].content.parts) !== null && v !== void 0 ? v : []) if (a < o && D.functionCall) {
                  if (!D.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(D.functionCall.name)) {
                    const H = yield J(d.get(D.functionCall.name).callTool([D.functionCall]));
                    C.push(...H);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${D.functionCall.name}`);
                }
              }
            }
          } catch (R) {
            p = { error: R };
          } finally {
            try {
              !w && !f && (m = I.return) && (yield J(m.call(I)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (C.length > 0) {
            s = !0;
            const R = new Hn();
            R.candidates = [{ content: {
              role: "user",
              parts: C
            } }], yield yield J(R);
            const D = [];
            D.push(...F), D.push({
              role: "user",
              parts: C
            }), h.contents = Ie(h.contents).concat(D);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = nc(this.apiClient, e);
      return a = $("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = oc(d), f = new Hn();
        return Object.assign(f, h), f;
      });
    } else {
      const c = tc(this.apiClient, e);
      return a = $("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = rc(d), f = new Hn();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = nc(this.apiClient, e);
      return a = $("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.requestStream({
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
            for (var g = !0, _ = nt(d), v; v = yield J(_.next()), h = v.done, !h; g = !0) {
              m = v.value, g = !1;
              const w = m, I = oc(yield J(w.json()), e);
              I.sdkHttpResponse = { headers: w.headers };
              const P = new Hn();
              Object.assign(P, I), yield yield J(P);
            }
          } catch (w) {
            f = { error: w };
          } finally {
            try {
              !g && !h && (p = _.return) && (yield J(p.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = tc(this.apiClient, e);
      return a = $("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.requestStream({
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
            for (var g = !0, _ = nt(d), v; v = yield J(_.next()), h = v.done, !h; g = !0) {
              m = v.value, g = !1;
              const w = m, I = rc(yield J(w.json()), e);
              I.sdkHttpResponse = { headers: w.headers };
              const P = new Hn();
              Object.assign(P, I), yield yield J(P);
            }
          } catch (w) {
            f = { error: w };
          } finally {
            try {
              !g && !h && (p = _.return) && (yield J(p.call(_)));
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
      const c = qA(this.apiClient, e, e);
      return a = $(Zy(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = GA(d, e), f = new $u();
        return Object.assign(f, h), f;
      });
    } else {
      const c = FA(this.apiClient, e);
      return a = $("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = BA(d), f = new $u();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ZA(this.apiClient, e);
      return a = $("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = eS(d), f = new Lu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = QA(this.apiClient, e);
      return a = $("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = jA(d), f = new Lu();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = DA(this.apiClient, e);
      return o = $("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
        const c = $A(u), d = new by();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = eT(this.apiClient, e);
      return o = $("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
        const c = tT(u), d = new Py();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = DS(this.apiClient, e);
      return o = $("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = $S(u), d = new Ry();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = GS(this.apiClient, e);
      return o = $("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = OS(u), d = new xy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = yS(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => ai(d));
    } else {
      const c = gS(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => ii(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = IS(this.apiClient, e);
      return a = $("{models_url}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = PS(d), f = new Uu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = CS(this.apiClient, e);
      return a = $("{models_url}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = bS(d), f = new Uu();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ZS(this.apiClient, e);
      return a = $("{model}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => ai(d));
    } else {
      const c = QS(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => ii(d));
    }
  }
  async delete(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = xA(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = NA(d), f = new Fu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = RA(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = MA(d), f = new Fu();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = IA(this.apiClient, e);
      return a = $("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = PA(d), f = new qu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = CA(this.apiClient, e);
      return a = $("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = bA(d), f = new qu();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = _A(this.apiClient, e);
      return o = $("{model}:computeTokens", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
        const c = vA(u), d = new My();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = iS(this.apiClient, e);
      return a = $("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => {
        const h = oS(d), f = new Bu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = sS(this.apiClient, e);
      return a = $("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => {
        const h = rS(d), f = new Bu();
        return Object.assign(f, h), f;
      });
    }
  }
}, QT = class extends _t {
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
      const c = Sy(e);
      return a = $("{operationName}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s;
    } else {
      const c = Ay(e);
      return a = $("{operationName}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
      const a = hy(e);
      return o = $("{resourceName}:fetchPredictOperation", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
function cc(e) {
  const t = {};
  if (i(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function ZT(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function jT(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function eE(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => uE(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function tE(e, t, n) {
  const r = {}, o = i(t, ["expireTime"]);
  n !== void 0 && o != null && l(n, ["expireTime"], o);
  const s = i(t, ["newSessionExpireTime"]);
  n !== void 0 && s != null && l(n, ["newSessionExpireTime"], s);
  const a = i(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = i(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], lE(e, u));
  const c = i(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), r;
}
function nE(e, t) {
  const n = {}, r = i(t, ["config"]);
  return r != null && l(n, ["config"], tE(e, r, n)), n;
}
function rE(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function oE(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function sE(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], ZT(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function iE(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function aE(e, t) {
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
  ], ta(f));
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
  const g = i(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], eE(de(g)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let R = Tn(_);
    Array.isArray(R) && (R = R.map((D) => fE(Sn(D)))), l(t, ["setup", "tools"], R);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], dE(v));
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], cc(w));
  const I = i(e, ["outputAudioTranscription"]);
  t !== void 0 && I != null && l(t, ["setup", "outputAudioTranscription"], cc(I));
  const P = i(e, ["realtimeInputConfig"]);
  t !== void 0 && P != null && l(t, ["setup", "realtimeInputConfig"], P);
  const M = i(e, ["contextWindowCompression"]);
  t !== void 0 && M != null && l(t, ["setup", "contextWindowCompression"], M);
  const x = i(e, ["proactivity"]);
  if (t !== void 0 && x != null && l(t, ["setup", "proactivity"], x), i(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const C = i(e, ["avatarConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "avatarConfig"], C);
  const F = i(e, ["safetySettings"]);
  if (t !== void 0 && F != null) {
    let R = F;
    Array.isArray(R) && (R = R.map((D) => cE(D))), l(t, ["setup", "safetySettings"], R);
  }
  return n;
}
function lE(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = i(t, ["config"]);
  return o != null && l(n, ["config"], aE(o, n)), n;
}
function uE(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], rE(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], oE(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], jT(c));
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
  const g = i(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = i(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function cE(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = i(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function dE(e) {
  const t = {}, n = i(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), i(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function fE(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], iE(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], sE(s));
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
function hE(e) {
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
function pE(e, t) {
  let n = null;
  const r = e.bidiGenerateContentSetup;
  if (typeof r == "object" && r !== null && "setup" in r) {
    const s = r.setup;
    typeof s == "object" && s !== null ? (e.bidiGenerateContentSetup = s, n = s) : delete e.bidiGenerateContentSetup;
  } else r !== void 0 && delete e.bidiGenerateContentSetup;
  const o = e.fieldMask;
  if (n) {
    const s = hE(n);
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
var mE = class extends _t {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = nE(this.apiClient, e);
      o = $("auth_tokens", a._url), s = a._query, delete a.config, delete a._url, delete a._query;
      const u = pE(a, e.config);
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
function gE(e, t) {
  const n = {}, r = i(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function yE(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = i(e, ["config"]);
  return r != null && gE(r, t), t;
}
function _E(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function vE(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function AE(e) {
  const t = {}, n = i(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const r = i(e, ["config"]);
  return r != null && vE(r, t), t;
}
function SE(e) {
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
var TE = class extends _t {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Yt(yt.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = _E(e);
      return o = $("{name}", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
      const s = yE(e);
      r = $("{name}", s._url), o = s._query, delete s._url, delete s._query, await this.apiClient.request({
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
      const a = AE(e);
      return o = $("{parent}/documents", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = SE(u), d = new Ny();
        return Object.assign(d, c), d;
      });
    }
  }
}, EE = class extends _t {
  constructor(e, t = new TE(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Yt(yt.PAGED_ITEM_FILE_SEARCH_STORES, (r) => this.listInternal(r), await this.listInternal(n), n);
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
      const a = lT(e);
      return o = $("fileSearchStores", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
      const a = dT(e);
      return o = $("{name}", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
      const s = cT(e);
      r = $("{name}", s._url), o = s._query, delete s._url, delete s._query, await this.apiClient.request({
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
      const a = yT(e);
      return o = $("fileSearchStores", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = _T(u), d = new ky();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = vT(e);
      return o = $("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = AT(u), d = new Dy();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = pT(e);
      return o = $("{file_search_store_name}:importFile", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = hT(u), d = new $y();
        return Object.assign(d, c), d;
      });
    }
  }
}, jf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return jf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
}, wE = () => jf();
function ui(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ci = (e) => {
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
}, Ye = class di extends We {
  constructor(t, n, r, o) {
    super(`${di.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.error = n;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Yo({
      message: r,
      cause: ci(n)
    });
    const s = n;
    return t === 400 ? new th(t, s, r, o) : t === 401 ? new nh(t, s, r, o) : t === 403 ? new rh(t, s, r, o) : t === 404 ? new oh(t, s, r, o) : t === 409 ? new sh(t, s, r, o) : t === 422 ? new ih(t, s, r, o) : t === 429 ? new ah(t, s, r, o) : t >= 500 ? new lh(t, s, r, o) : new di(t, s, r, o);
  }
}, fi = class extends Ye {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Yo = class extends Ye {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, eh = class extends Yo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, th = class extends Ye {
}, nh = class extends Ye {
}, rh = class extends Ye {
}, oh = class extends Ye {
}, sh = class extends Ye {
}, ih = class extends Ye {
}, ah = class extends Ye {
}, lh = class extends Ye {
}, CE = /^[a-z][a-z0-9+.-]*:/i, IE = (e) => CE.test(e), hi = (e) => (hi = Array.isArray, hi(e)), dc = hi;
function fc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function bE(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var PE = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new We(`${e} must be an integer`);
  if (t < 0) throw new We(`${e} must be a positive integer`);
  return t;
}, RE = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, xE = (e) => new Promise((t) => setTimeout(t, e));
function ME() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function uh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function NE(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return uh({
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
function ch(e) {
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
async function kE(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const r = e.getReader(), o = r.cancel();
  r.releaseLock(), await o;
}
var DE = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function $E(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new We(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var LE = "0.0.1", dh = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function bs(e, t, n) {
  return dh(), new File(e, t ?? "unknown_file", n);
}
function UE(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var FE = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", fh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", qE = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && fh(e), BE = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function GE(e, t, n) {
  if (dh(), e = await e, qE(e))
    return e instanceof File ? e : bs([await e.arrayBuffer()], e.name);
  if (BE(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), bs(await pi(o), t, n);
  }
  const r = await pi(e);
  if (t || (t = UE(e)), !n?.type) {
    const o = r.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof o == "string" && (n = Object.assign(Object.assign({}, n), { type: o }));
  }
  return bs(r, t, n);
}
async function pi(e) {
  var t, n, r, o, s;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (fh(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (FE(e)) try {
    for (var u = !0, c = nt(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      o = d.value, u = !1;
      const h = o;
      a.push(...await pi(h));
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
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${OE(e)}`);
  }
  return a;
}
function OE(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var na = class {
  constructor(e) {
    this._client = e;
  }
};
na._key = [];
function hh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var hc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), HE = (e = hh) => (function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const s = [], a = n.reduce((h, f, p) => {
    var m, g, _;
    /[?#]/.test(f) && (o = !0);
    const v = r[p];
    let w = (o ? encodeURIComponent : e)("" + v);
    return p !== r.length && (v == null || typeof v == "object" && v.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = v.hasOwnProperty) !== null && m !== void 0 ? m : hc)) !== null && g !== void 0 ? g : hc)) === null || _ === void 0 ? void 0 : _.toString)) && (w = v + "", s.push({
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
      const g = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + g + _;
    }, "");
    throw new We(`Path parameters result in path with invalid segments:
${s.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), Qe = /* @__PURE__ */ HE(hh), ph = class extends na {
  create(e, t) {
    var n;
    const { api_version: r = this._client.apiVersion } = e, o = xt(e, ["api_version"]);
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
    const o = t ?? {}, { api_version: s = this._client.apiVersion } = o, a = xt(o, ["api_version"]);
    return this._client.get(Qe`/${s}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (r = t?.stream) !== null && r !== void 0 ? r : !1 }));
  }
};
ph._key = Object.freeze(["interactions"]);
var mh = class extends ph {
}, gh = class extends na {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: r } = e, o = xt(e, ["api_version", "webhook_id"]);
    return this._client.post(Qe`/${n}/webhooks`, Object.assign({
      query: { webhook_id: r },
      body: o
    }, t));
  }
  update(e, t, n) {
    const { api_version: r = this._client.apiVersion, update_mask: o } = t, s = xt(t, ["api_version", "update_mask"]);
    return this._client.patch(Qe`/${r}/webhooks/${e}`, Object.assign({
      query: { update_mask: o },
      body: s
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: r = this._client.apiVersion } = n, o = xt(n, ["api_version"]);
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
    const r = t ?? {}, { api_version: o = this._client.apiVersion } = r, s = xt(r, ["api_version"]);
    return this._client.post(Qe`/${o}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: s }, n));
  }
};
gh._key = Object.freeze(["webhooks"]);
var yh = class extends gh {
};
function VE(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var Qr;
function ra(e) {
  let t;
  return (Qr ?? (t = new globalThis.TextEncoder(), Qr = t.encode.bind(t)))(e);
}
var Zr;
function pc(e) {
  let t;
  return (Zr ?? (t = new globalThis.TextDecoder(), Zr = t.decode.bind(t)))(e);
}
var Xo = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ra(e) : e;
    this.buffer = VE([this.buffer, n]);
    const r = [];
    let o;
    for (; (o = JE(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (o.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = o.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (o.index !== this.carriageReturnIndex + 1 || o.carriage)) {
        r.push(pc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const s = this.carriageReturnIndex !== null ? o.preceding - 1 : o.preceding, a = pc(this.buffer.subarray(0, s));
      r.push(a), this.buffer = this.buffer.subarray(o.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), r;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Xo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Xo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function JE(e, t) {
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
var xo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, mc = (e, t, n) => {
  if (e) {
    if (bE(xo, e)) return e;
    Se(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(xo))}`);
  }
};
function Xn() {
}
function jr(e, t, n) {
  return !t || xo[e] > xo[n] ? Xn : t[e].bind(t);
}
var KE = {
  error: Xn,
  warn: Xn,
  info: Xn,
  debug: Xn
}, gc = /* @__PURE__ */ new WeakMap();
function Se(e) {
  var t;
  const n = e.logger, r = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return KE;
  const o = gc.get(n);
  if (o && o[0] === r) return o[1];
  const s = {
    error: jr("error", n, r),
    warn: jr("warn", n, r),
    info: jr("info", n, r),
    debug: jr("debug", n, r)
  };
  return gc.set(n, [r, s]), s;
}
var Ut = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), WE = class Qn {
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
            for (var m = !0, g = nt(zE(t, n)), _; _ = yield J(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const v = f;
              if (!p)
                if (v.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield J(JSON.parse(v.data));
                } catch (w) {
                  throw s.error("Could not parse message into JSON:", v.data), s.error("From chunk:", v.raw), w;
                }
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield J(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (ui(v)) return yield J(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Qn(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    function s() {
      return tt(this, arguments, function* () {
        var c, d, h, f;
        const p = new Xo(), m = ch(t);
        try {
          for (var g = !0, _ = nt(m), v; v = yield J(_.next()), c = v.done, !c; g = !0) {
            f = v.value, g = !1;
            const w = f;
            for (const I of p.decode(w)) yield yield J(I);
          }
        } catch (w) {
          d = { error: w };
        } finally {
          try {
            !g && !c && (h = _.return) && (yield J(h.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const w of p.flush()) yield yield J(w);
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
            for (var m = !0, g = nt(s()), _; _ = yield J(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const v = f;
              p || v && (yield yield J(JSON.parse(v)));
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield J(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (ui(v)) return yield J(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Qn(a, n, r);
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
    return [new Qn(() => o(t), this.controller, this.client), new Qn(() => o(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return uh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: s } = await n.next();
          if (s) return r.close();
          const a = ra(JSON.stringify(o) + `
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
function zE(e, t) {
  return tt(this, arguments, function* () {
    var r, o, s, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new We("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new We("Attempted to iterate over a response with no body");
    const u = new XE(), c = new Xo(), d = ch(e.body);
    try {
      for (var h = !0, f = nt(YE(d)), p; p = yield J(f.next()), r = p.done, !r; h = !0) {
        a = p.value, h = !1;
        const m = a;
        for (const g of c.decode(m)) {
          const _ = u.decode(g);
          _ && (yield yield J(_));
        }
      }
    } catch (m) {
      o = { error: m };
    } finally {
      try {
        !h && !r && (s = f.return) && (yield J(s.call(f)));
      } finally {
        if (o) throw o.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield J(g));
    }
  });
}
function YE(e) {
  return tt(this, arguments, function* () {
    var n, r, o, s;
    try {
      for (var a = !0, u = nt(e), c; c = yield J(u.next()), n = c.done, !n; a = !0) {
        s = c.value, a = !1;
        const d = s;
        d != null && (yield yield J(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? ra(d) : d));
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
var XE = class {
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
    let [t, n, r] = QE(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function QE(e, t) {
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
async function ZE(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: s } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return Se(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : WE.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return Se(e).debug(`[${r}] response parsed`, Ut({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - s
  })), a;
}
var jE = class _h extends Promise {
  constructor(t, n, r = ZE) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, this.client = t;
  }
  _thenUnwrap(t) {
    return new _h(this.client, this.responsePromise, async (n, r) => t(await this.parseResponse(n, r), r));
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
}, vh = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* ew(e) {
  if (!e) return;
  if (vh in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const s of o) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : dc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const s = dc(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of s)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var Vn = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [s, a] of ew(r)) {
      const u = s.toLowerCase();
      o.has(u) || (t.delete(s), o.add(u)), a === null ? (t.delete(s), n.add(u)) : (t.append(s, a), n.delete(u));
    }
  }
  return {
    [vh]: !0,
    values: t,
    nulls: n
  };
}, Ps = (e) => {
  var t, n, r, o, s;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((s = (o = (r = globalThis.Deno.env) === null || r === void 0 ? void 0 : r.get) === null || o === void 0 ? void 0 : o.call(r, e)) === null || s === void 0 ? void 0 : s.trim()) || void 0;
}, Ah, Sh = class Th {
  constructor(t) {
    var n, r, o, s, a, u, c, { baseURL: d = Ps("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = Ps("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = xt(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (r = m.timeout) !== null && r !== void 0 ? r : Th.DEFAULT_TIMEOUT, this.logger = (o = m.logger) !== null && o !== void 0 ? o : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (a = (s = mc(m.logLevel, "ClientOptions.logLevel", this)) !== null && s !== void 0 ? s : mc(Ps("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : ME(), this.encoder = DE, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = Vn([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return Vn([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return Vn([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return $E(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${LE}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${wE()}`;
  }
  makeStatusError(t, n, r, o) {
    return Ye.generate(t, n, r, o);
  }
  buildURL(t, n, r) {
    const o = !this.baseURLOverridden() && r || this.baseURL, s = IE(t) ? new URL(t) : new URL(o + (o.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(s.searchParams);
    return (!fc(a) || !fc(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (s.search = this.stringifyQuery(n)), s.toString();
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
    return new jE(this, this.makeRequest(t, n, void 0));
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
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = r === void 0 ? "" : `, retryOf: ${r}`, g = Date.now();
    if (Se(this).debug(`[${p}] sending request`, Ut({
      retryOfRequestLogID: r,
      method: u.method,
      url: h,
      options: u,
      headers: d.headers
    })), !((s = u.signal) === null || s === void 0) && s.aborted) throw new fi();
    const _ = new AbortController(), v = await this.fetchWithTimeout(h, d, f, _).catch(ci), w = Date.now();
    if (v instanceof globalThis.Error) {
      const P = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new fi();
      const M = ui(v) || /timed? ?out/i.test(String(v) + ("cause" in v ? String(v.cause) : ""));
      if (n)
        return Se(this).info(`[${p}] connection ${M ? "timed out" : "failed"} - ${P}`), Se(this).debug(`[${p}] connection ${M ? "timed out" : "failed"} (${P})`, Ut({
          retryOfRequestLogID: r,
          url: h,
          durationMs: w - g,
          message: v.message
        })), this.retryRequest(u, n, r ?? p);
      throw Se(this).info(`[${p}] connection ${M ? "timed out" : "failed"} - error; no more retries left`), Se(this).debug(`[${p}] connection ${M ? "timed out" : "failed"} (error; no more retries left)`, Ut({
        retryOfRequestLogID: r,
        url: h,
        durationMs: w - g,
        message: v.message
      })), M ? new eh() : new Yo({ cause: v });
    }
    const I = `[${p}${m}] ${d.method} ${h} ${v.ok ? "succeeded" : "failed"} with status ${v.status} in ${w - g}ms`;
    if (!v.ok) {
      const P = await this.shouldRetry(v);
      if (n && P) {
        const R = `retrying, ${n} attempts remaining`;
        return await kE(v.body), Se(this).info(`${I} - ${R}`), Se(this).debug(`[${p}] response error (${R})`, Ut({
          retryOfRequestLogID: r,
          url: v.url,
          status: v.status,
          headers: v.headers,
          durationMs: w - g
        })), this.retryRequest(u, n, r ?? p, v.headers);
      }
      const M = P ? "error; no more retries left" : "error; not retryable";
      Se(this).info(`${I} - ${M}`);
      const x = await v.text().catch((R) => ci(R).message), C = RE(x), F = C ? void 0 : x;
      throw Se(this).debug(`[${p}] response error (${M})`, Ut({
        retryOfRequestLogID: r,
        url: v.url,
        status: v.status,
        headers: v.headers,
        message: F,
        durationMs: Date.now() - g
      })), this.makeStatusError(v.status, C, F, v.headers);
    }
    return Se(this).info(I), Se(this).debug(`[${p}] response start`, Ut({
      retryOfRequestLogID: r,
      url: v.url,
      status: v.status,
      headers: v.headers,
      durationMs: w - g
    })), {
      response: v,
      options: u,
      controller: _,
      requestLogID: p,
      retryOfRequestLogID: r,
      startTime: g
    };
  }
  async fetchWithTimeout(t, n, r, o) {
    const s = n || {}, { signal: a, method: u } = s, c = xt(s, ["signal", "method"]), d = this._makeAbort(o);
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
    return await xE(a), this.makeRequest(t, n - 1, r);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const s = n - t;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var r, o, s;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = a, f = this.buildURL(c, d, h);
    "timeout" in a && PE("timeout", a.timeout), a.timeout = (r = a.timeout) !== null && r !== void 0 ? r : this.timeout;
    const { bodyHeaders: p, body: m } = this.buildBody({ options: a }), g = await this.buildHeaders({
      options: t,
      method: u,
      bodyHeaders: p,
      retryCount: n
    });
    return {
      req: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
        method: u,
        headers: g
      }, a.signal && { signal: a.signal }), globalThis.ReadableStream && m instanceof globalThis.ReadableStream && { duplex: "half" }), m && { body: m }), (o = this.fetchOptions) !== null && o !== void 0 ? o : {}), (s = a.fetchOptions) !== null && s !== void 0 ? s : {}),
      url: f,
      timeout: a.timeout
    };
  }
  async buildHeaders({ options: t, method: n, bodyHeaders: r, retryCount: o }) {
    let s = {};
    this.idempotencyHeader && n !== "get" && (t.idempotencyKey || (t.idempotencyKey = this.defaultIdempotencyKey()), s[this.idempotencyHeader] = t.idempotencyKey);
    const a = await this.authHeaders(t);
    let u = Vn([
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
    const r = Vn([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: NE(t)
    } : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: r
    });
  }
};
Sh.DEFAULT_TIMEOUT = 6e4;
var le = class extends Sh {
  constructor() {
    super(...arguments), this.interactions = new mh(this), this.webhooks = new yh(this);
  }
};
Ah = le;
le.GeminiNextGenAPIClient = Ah;
le.GeminiNextGenAPIClientError = We;
le.APIError = Ye;
le.APIConnectionError = Yo;
le.APIConnectionTimeoutError = eh;
le.APIUserAbortError = fi;
le.NotFoundError = oh;
le.ConflictError = sh;
le.RateLimitError = ah;
le.BadRequestError = th;
le.AuthenticationError = nh;
le.InternalServerError = lh;
le.PermissionDeniedError = rh;
le.UnprocessableEntityError = ih;
le.toFile = GE;
le.Interactions = mh;
le.Webhooks = yh;
function tw(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function nw(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function rw(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function ow(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function sw(e, t, n) {
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
function iw(e, t, n) {
  const r = {};
  let o = i(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const C = i(e, ["validationDataset"]);
    t !== void 0 && C != null && l(t, ["supervisedTuningSpec"], Rs(C));
  } else if (o === "PREFERENCE_TUNING") {
    const C = i(e, ["validationDataset"]);
    t !== void 0 && C != null && l(t, ["preferenceOptimizationSpec"], Rs(C));
  } else if (o === "DISTILLATION") {
    const C = i(e, ["validationDataset"]);
    t !== void 0 && C != null && l(t, ["distillationSpec"], Rs(C));
  }
  const s = i(e, ["tunedModelDisplayName"]);
  t !== void 0 && s != null && l(t, ["tunedModelDisplayName"], s);
  const a = i(e, ["description"]);
  t !== void 0 && a != null && l(t, ["description"], a);
  let u = i(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const C = i(e, ["epochCount"]);
    t !== void 0 && C != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], C);
  } else if (u === "PREFERENCE_TUNING") {
    const C = i(e, ["epochCount"]);
    t !== void 0 && C != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], C);
  } else if (u === "DISTILLATION") {
    const C = i(e, ["epochCount"]);
    t !== void 0 && C != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], C);
  }
  let c = i(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const C = i(e, ["learningRateMultiplier"]);
    t !== void 0 && C != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], C);
  } else if (c === "PREFERENCE_TUNING") {
    const C = i(e, ["learningRateMultiplier"]);
    t !== void 0 && C != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], C);
  } else if (c === "DISTILLATION") {
    const C = i(e, ["learningRateMultiplier"]);
    t !== void 0 && C != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], C);
  }
  let d = i(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const C = i(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && C != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], C);
  } else if (d === "PREFERENCE_TUNING") {
    const C = i(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && C != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], C);
  } else if (d === "DISTILLATION") {
    const C = i(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && C != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], C);
  }
  let h = i(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const C = i(e, ["adapterSize"]);
    t !== void 0 && C != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], C);
  } else if (h === "PREFERENCE_TUNING") {
    const C = i(e, ["adapterSize"]);
    t !== void 0 && C != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], C);
  } else if (h === "DISTILLATION") {
    const C = i(e, ["adapterSize"]);
    t !== void 0 && C != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], C);
  }
  let f = i(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const C = i(e, ["tuningMode"]);
    t !== void 0 && C != null && l(t, ["supervisedTuningSpec", "tuningMode"], C);
  } else if (f === "DISTILLATION") {
    const C = i(e, ["tuningMode"]);
    t !== void 0 && C != null && l(t, ["distillationSpec", "tuningMode"], C);
  }
  const p = i(e, ["customBaseModel"]);
  t !== void 0 && p != null && l(t, ["customBaseModel"], p);
  let m = i(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const C = i(e, ["batchSize"]);
    t !== void 0 && C != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], C);
  } else if (m === "DISTILLATION") {
    const C = i(e, ["batchSize"]);
    t !== void 0 && C != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], C);
  }
  let g = i(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const C = i(e, ["learningRate"]);
    t !== void 0 && C != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], C);
  } else if (g === "DISTILLATION") {
    const C = i(e, ["learningRate"]);
    t !== void 0 && C != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], C);
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
  const I = i(e, ["tunedTeacherModelSource"]);
  t !== void 0 && I != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], I);
  const P = i(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && P != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], P);
  const M = i(e, ["outputUri"]);
  t !== void 0 && M != null && l(t, ["outputUri"], M);
  const x = i(e, ["encryptionSpec"]);
  return t !== void 0 && x != null && l(t, ["encryptionSpec"], x), r;
}
function aw(e, t) {
  const n = {}, r = i(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const s = i(e, ["trainingDataset"]);
  s != null && _w(s);
  const a = i(e, ["config"]);
  return a != null && sw(a, n), n;
}
function lw(e, t) {
  const n = {}, r = i(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const s = i(e, ["trainingDataset"]);
  s != null && vw(s, n, t);
  const a = i(e, ["config"]);
  return a != null && iw(a, n, t), n;
}
function uw(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function cw(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function dw(e, t, n) {
  const r = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  t !== void 0 && s != null && l(t, ["_query", "pageToken"], s);
  const a = i(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function fw(e, t, n) {
  const r = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  t !== void 0 && s != null && l(t, ["_query", "pageToken"], s);
  const a = i(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function hw(e, t) {
  const n = {}, r = i(e, ["config"]);
  return r != null && dw(r, n), n;
}
function pw(e, t) {
  const n = {}, r = i(e, ["config"]);
  return r != null && fw(r, n), n;
}
function mw(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["tunedModels"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => Eh(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function gw(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["tuningJobs"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => mi(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function yw(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["model"], r);
  const o = i(e, ["name"]);
  return o != null && l(n, ["endpoint"], o), n;
}
function _w(e, t) {
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
function vw(e, t, n) {
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
function Eh(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["state"]);
  s != null && l(n, ["state"], Nf(s));
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
  return p != null && l(n, ["tunedModel"], yw(p)), n;
}
function mi(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["state"]);
  s != null && l(n, ["state"], Nf(s));
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
  const g = i(e, ["preTunedModel"]);
  g != null && l(n, ["preTunedModel"], g);
  const _ = i(e, ["supervisedTuningSpec"]);
  _ != null && l(n, ["supervisedTuningSpec"], _);
  const v = i(e, ["preferenceOptimizationSpec"]);
  v != null && l(n, ["preferenceOptimizationSpec"], v);
  const w = i(e, ["distillationSpec"]);
  w != null && l(n, ["distillationSpec"], w);
  const I = i(e, ["tuningDataStats"]);
  I != null && l(n, ["tuningDataStats"], I);
  const P = i(e, ["encryptionSpec"]);
  P != null && l(n, ["encryptionSpec"], P);
  const M = i(e, ["partnerModelTuningSpec"]);
  M != null && l(n, ["partnerModelTuningSpec"], M);
  const x = i(e, ["customBaseModel"]);
  x != null && l(n, ["customBaseModel"], x);
  const C = i(e, ["evaluateDatasetRuns"]);
  if (C != null) {
    let Ee = C;
    Array.isArray(Ee) && (Ee = Ee.map((_e) => _e)), l(n, ["evaluateDatasetRuns"], Ee);
  }
  const F = i(e, ["experiment"]);
  F != null && l(n, ["experiment"], F);
  const R = i(e, ["fullFineTuningSpec"]);
  R != null && l(n, ["fullFineTuningSpec"], R);
  const D = i(e, ["labels"]);
  D != null && l(n, ["labels"], D);
  const H = i(e, ["outputUri"]);
  H != null && l(n, ["outputUri"], H);
  const z = i(e, ["pipelineJob"]);
  z != null && l(n, ["pipelineJob"], z);
  const j = i(e, ["serviceAccount"]);
  j != null && l(n, ["serviceAccount"], j);
  const ee = i(e, ["tunedModelDisplayName"]);
  ee != null && l(n, ["tunedModelDisplayName"], ee);
  const Q = i(e, ["tuningJobState"]);
  Q != null && l(n, ["tuningJobState"], Q);
  const X = i(e, ["veoTuningSpec"]);
  X != null && l(n, ["veoTuningSpec"], X);
  const me = i(e, ["distillationSamplingSpec"]);
  me != null && l(n, ["distillationSamplingSpec"], me);
  const Ge = i(e, ["tuningJobMetadata"]);
  return Ge != null && l(n, ["tuningJobMetadata"], Ge), n;
}
function Aw(e, t) {
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
function Rs(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["validationDatasetUri"], r);
  const o = i(e, ["vertexDatasetResource"]);
  return o != null && l(n, ["validationDatasetUri"], o), n;
}
var Sw = class extends _t {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Yt(yt.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: ti.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = cw(e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => mi(d));
    } else {
      const c = uw(e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => Eh(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = pw(e);
      return a = $("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = gw(d), f = new Gu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = hw(e);
      return a = $("tunedModels", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = mw(d), f = new Gu();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = nw(e);
      return a = $("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = ow(d), f = new Ou();
        return Object.assign(f, h), f;
      });
    } else {
      const c = tw(e);
      return a = $("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = rw(d), f = new Ou();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = lw(e, e);
      return o = $("tuningJobs", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => mi(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = aw(e);
      return o = $("tunedModels", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => Aw(u));
    }
  }
}, Tw = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, Ew = 1024 * 1024 * 8, ww = 3, Cw = 1e3, Iw = 2, Mo = "x-goog-upload-status";
async function bw(e, t, n, r) {
  var o;
  const s = await wh(e, t, n, r), a = await s?.json();
  if (((o = s?.headers) === null || o === void 0 ? void 0 : o[Mo]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function Pw(e, t, n, r) {
  var o;
  const s = await wh(e, t, n, r), a = await s?.json();
  if (((o = s?.headers) === null || o === void 0 ? void 0 : o[Mo]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = Ef(a), c = new Oy();
  return Object.assign(c, u), c;
}
async function wh(e, t, n, r) {
  var o, s, a;
  let u = t;
  const c = r?.baseUrl || ((o = n.clientOptions.httpOptions) === null || o === void 0 ? void 0 : o.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, h = 0, f = new ri(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(Ew, d - h), g = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, v = Cw;
    for (; _ < ww; ) {
      const w = Object.assign(Object.assign({}, r?.headers || {}), {
        "X-Goog-Upload-Command": p,
        "X-Goog-Upload-Offset": String(h),
        "Content-Length": String(m)
      });
      if (f = await n.request({
        path: "",
        body: g,
        httpMethod: "POST",
        httpOptions: Object.assign(Object.assign({}, r), {
          apiVersion: "",
          baseUrl: u,
          headers: w
        })
      }), !((s = f?.headers) === null || s === void 0) && s[Mo]) break;
      _++, await xw(v), v = v * Iw;
    }
    if (h += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[Mo]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function Rw(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function xw(e) {
  return new Promise((t) => setTimeout(t, e));
}
var Mw = class {
  async upload(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await bw(e, t, n, r);
  }
  async uploadToFileSearchStore(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Pw(e, t, n, r);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Rw(e);
  }
}, Nw = class {
  create(e, t, n) {
    return new kw(e, t, n);
  }
}, kw = class {
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
}, yc = "x-goog-api-key", Dw = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(yc) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(yc, this.apiKey);
    }
  }
}, $w = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new le({
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
    const n = dy(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const r = new Dw(this.apiKey);
    this.apiClient = new xT({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new Mw(),
      downloader: new Tw()
    }), this.models = new XT(this.apiClient), this.live = new VT(this.apiClient, r, new Nw()), this.batches = new J_(this.apiClient), this.chats = new Rv(this.models, this.apiClient), this.caches = new Iv(this.apiClient), this.files = new Gv(this.apiClient), this.operations = new QT(this.apiClient), this.authTokens = new mE(this.apiClient), this.tunings = new Sw(this.apiClient), this.fileSearchStores = new EE(this.apiClient);
  }
};
function _c(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function dr(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Ht(e) {
  return { text: String(e || "") };
}
function Lw(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function Uw(e) {
  if (typeof e == "string") return [Ht(e)];
  if (!Array.isArray(e)) return [Ht("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? Ht(n.text || "") : n.type === "image_url" && n.image_url?.url ? Lw(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [Ht("")];
}
function vc() {
  return {
    role: "user",
    parts: [Ht("")]
  };
}
function Pr(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = dr(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function Fw(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function qw(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function xs(e, t) {
  return e?.functionCall?.name ? [
    String(e.functionCall.id || ""),
    String(e.functionCall.name || ""),
    JSON.stringify(e.functionCall.args || {}),
    String(t)
  ].join("\0") : "";
}
function Bw(e = [], t = "") {
  const n = e.map((c) => Pr(c, "model")).filter(Boolean);
  if (!n.length) return null;
  const r = [...n].reverse().find((c) => Fw(c)) || null, o = [...n].reverse().find((c) => qw(c)) || null, s = dr(r || o || n[n.length - 1]);
  if (!s?.parts?.length) return n[n.length - 1];
  if (o) {
    const c = /* @__PURE__ */ new Map();
    n.forEach((h) => {
      h.parts.forEach((f, p) => {
        const m = xs(f, p);
        if (!m) return;
        const g = c.get(m);
        (!g || f.thoughtSignature || !g.thoughtSignature) && c.set(m, dr(f));
      });
    });
    const d = /* @__PURE__ */ new Set();
    s.parts = s.parts.map((h, f) => {
      const p = xs(h, f);
      return p ? (d.add(p), c.get(p) || h) : h;
    }), o.parts.forEach((h, f) => {
      const p = xs(h, f);
      !p || d.has(p) || (s.parts.push(c.get(p) || dr(h)), d.add(p));
    });
  }
  const a = String(t || ""), u = s.parts.filter((c) => !(typeof c?.text == "string" && !c?.thought));
  return s.parts = a ? [{ text: a }, ...u] : u, s.parts.length ? s : n[n.length - 1];
}
function Ac(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((r) => !r?.thought && typeof r?.text == "string" && r.text).map((r) => r.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function Sc(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((r) => r?.functionCall || r).filter((r) => r && r.name);
  return (t.length ? t : n).map((r, o) => ({
    id: r.id || `google-tool-${o + 1}`,
    name: r.name || "",
    arguments: JSON.stringify(r.args || {})
  })).filter((r) => r.name);
}
function Gw(e = [], t = []) {
  const n = Array.isArray(e) ? [...e] : [];
  return (Array.isArray(t) ? t : []).forEach((r) => {
    if (!r?.name) return;
    const o = [
      String(r.id || ""),
      String(r.name || ""),
      String(r.arguments || "")
    ].join("\0");
    n.some((s) => [
      String(s.id || ""),
      String(s.name || ""),
      String(s.arguments || "")
    ].join("\0") === o) || n.push(r);
  }), n;
}
function Ow(e = []) {
  return {
    role: "user",
    parts: e.filter((t) => t && t.name).map((t) => ({ functionResponse: {
      name: t.name,
      response: t.response || {}
    } }))
  };
}
function Hw(e) {
  switch (e) {
    case "high":
      return cr.HIGH;
    case "medium":
      return cr.MEDIUM;
    default:
      return cr.LOW;
  }
}
function Tc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function Vw(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function Jw(e) {
  const t = e?.providerPayload?.googleContent;
  return Pr(t, "model");
}
function Kw(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = Jw(e);
    return n ? [n] : [];
  }
  return t.map((n) => Pr(n, "model")).filter(Boolean);
}
function oa(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => Pr(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function Ww(e) {
  const t = e?.candidates?.[0]?.content;
  return oa(t ? [t] : []);
}
function zw(e) {
  return oa(e ? [e] : []);
}
function Ch(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? dr(e.history) || [] : [];
}
function Yw(e, t = 0) {
  return Ch(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => Pr(n, "model")).filter(Boolean);
}
function Xw(e) {
  const t = /* @__PURE__ */ new Map(), n = [], r = (e || []).filter((s) => s.role === "user" || s.role === "assistant" || s.role === "tool");
  r.forEach((s) => {
    (s.tool_calls || []).forEach((a) => {
      a.id && a.function?.name && t.set(a.id, a.function.name);
    });
  });
  for (let s = 0; s < r.length; s += 1) {
    const a = r[s];
    if (a.role === "tool") {
      const u = [];
      let c = s;
      for (; c < r.length && r[c].role === "tool"; ) {
        const d = r[c];
        u.push({ functionResponse: {
          name: String(d.toolName || d.tool_name || "").trim() || t.get(d.tool_call_id || "") || "tool_result",
          response: _c(d.content)
        } }), c += 1;
      }
      n.push({
        role: "user",
        parts: u
      }), s = c - 1;
      continue;
    }
    if (a.role === "assistant") {
      const u = Kw(a);
      if (u.length) {
        n.push(...u);
        continue;
      }
    }
    if (a.role === "assistant" && Array.isArray(a.tool_calls) && a.tool_calls.length) {
      n.push({
        role: "model",
        parts: [...a.content ? [Ht(a.content)] : [], ...a.tool_calls.map((u) => ({ functionCall: {
          name: u.function.name,
          args: _c(u.function.arguments)
        } }))]
      });
      continue;
    }
    n.push({
      role: a.role === "assistant" ? "model" : "user",
      parts: Uw(a.content)
    });
  }
  if (!n.length) return {
    history: [],
    latestMessage: vc().parts
  };
  const o = n[n.length - 1];
  return o.role === "user" && o.parts?.length ? {
    history: n.slice(0, -1),
    latestMessage: o.parts
  } : {
    history: n,
    latestMessage: vc().parts
  };
}
function Qw(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Ec(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
var Zw = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.client = new $w({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e) {
    const t = Xw(e.messages), n = Array.isArray(e.tools) ? e.tools : [], r = Vw(e), o = {
      ...r ? { systemInstruction: r } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    return e.reasoning?.enabled && (o.thinkingConfig = {
      includeThoughts: !0,
      thinkingLevel: Hw(e.reasoning.effort)
    }), n.length && (o.tools = [{ functionDeclarations: n.map((s) => ({
      name: s.function.name,
      description: s.function.description,
      parameters: s.function.parameters
    })) }]), n.length && e.toolChoice && e.toolChoice !== "auto" && e.toolChoice !== "none" && (o.toolConfig = { functionCallingConfig: { mode: ei.ANY } }), {
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
    return vr({
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
      sdk: typeof e.onStreamProgress == "function" ? "client.chats.create(...).sendMessageStream" : "client.chats.create(...).sendMessage"
    });
  }
  inspectSendRequest(e, t) {
    const n = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return vr({
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
      sdk: typeof t.onStreamProgress == "function" ? "activeChat.sendMessageStream" : "activeChat.sendMessage"
    });
  }
  createChat(e) {
    const t = this.buildChatPayload(e);
    return {
      chat: this.client.chats.create(t.createPayload),
      sendPayload: t.sendPayload,
      requestInspection: this.inspectRequest(e, { payload: t })
    };
  }
  async sendThroughChat(e, t, n) {
    let r, o, s, a = [], u = null;
    const c = { ...t }, d = typeof n.onStreamProgress == "function", h = Ch(e).length;
    if (d) {
      const g = await e.sendMessageStream(c), _ = /* @__PURE__ */ new Map();
      let v = "", w = [], I = null;
      const P = [];
      for await (const M of g) {
        I = M;
        const x = M?.candidates?.[0]?.content;
        x?.parts?.length && P.push(x), Tc(M).forEach((F, R) => {
          const D = `${F.label}:${R}`;
          _.set(D, Ec(_.get(D) || "", F.text));
        }), w = (M.functionCalls || []).map((F, R) => ({
          id: F.id || `google-tool-${R + 1}`,
          name: F.name || "",
          arguments: JSON.stringify(F.args || {})
        })).filter((F) => F.name), a = Gw(a, w.length ? w : Sc(M));
        const C = Ac(M);
        v = Ec(v, C), Qw(n, {
          text: v,
          thoughts: Array.from(_.values()).filter(Boolean).map((F, R) => ({
            label: `思考块 ${R + 1}`,
            text: F
          })),
          ...w.length ? {
            toolCalls: w,
            toolCallDraft: !0
          } : {}
        });
      }
      r = I || { functionCalls: w }, u = Bw(P, v) || r?.candidates?.[0]?.content || null, o = Array.from(_.values()).filter(Boolean).map((M, x) => ({
        label: `思考块 ${x + 1}`,
        text: M
      })), s = v;
    } else
      r = await e.sendMessage(c), o = Tc(r), s = Ac(r);
    const f = Sc(r), p = f.length ? f : a, m = Yw(e, h);
    return {
      text: s,
      toolCalls: p,
      thoughts: o,
      finishReason: r.candidates?.[0]?.finishReason || "STOP",
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: oa(m) || zw(u) || Ww(r)
    };
  }
  async chat(e) {
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: Ow(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, r, e),
        requestInspection: this.inspectSendRequest(r, e)
      };
    }
    const t = String(e.finalAnswerReminderText || "").trim();
    if (t) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: [Ht(t)] };
      return {
        ...await this.sendThroughChat(this.activeChat, r, e),
        requestInspection: this.inspectSendRequest(r, e)
      };
    }
    const n = this.createChat(e);
    return this.activeChat = n.chat, {
      ...await this.sendThroughChat(this.activeChat, n.sendPayload, e),
      requestInspection: n.requestInspection
    };
  }
};
function O(e, t, n, r, o) {
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
var Ih = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Ih = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function gi(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var yi = (e) => {
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
}, ge = class _i extends G {
  constructor(t, n, r, o) {
    super(`${_i.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("x-request-id"), this.error = n;
    const s = n;
    this.code = s?.code, this.param = s?.param, this.type = s?.type;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Qo({
      message: r,
      cause: yi(n)
    });
    const s = n?.error;
    return t === 400 ? new bh(t, s, r, o) : t === 401 ? new Ph(t, s, r, o) : t === 403 ? new Rh(t, s, r, o) : t === 404 ? new xh(t, s, r, o) : t === 409 ? new Mh(t, s, r, o) : t === 422 ? new Nh(t, s, r, o) : t === 429 ? new kh(t, s, r, o) : t >= 500 ? new Dh(t, s, r, o) : new _i(t, s, r, o);
  }
}, Ke = class extends ge {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Qo = class extends ge {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, sa = class extends Qo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, bh = class extends ge {
}, Ph = class extends ge {
}, Rh = class extends ge {
}, xh = class extends ge {
}, Mh = class extends ge {
}, Nh = class extends ge {
}, kh = class extends ge {
}, Dh = class extends ge {
}, $h = class extends G {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, Lh = class extends G {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Zn = class extends Error {
  constructor(e) {
    super(e);
  }
}, Uh = class extends ge {
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
}, jw = class extends G {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, eC = /^[a-z][a-z0-9+.-]*:/i, tC = (e) => eC.test(e), Ce = (e) => (Ce = Array.isArray, Ce(e)), wc = Ce;
function ia(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Cc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function nC(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Ms(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var rC = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new G(`${e} must be an integer`);
  if (t < 0) throw new G(`${e} must be a positive integer`);
  return t;
}, oC = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Rr = (e) => new Promise((t) => setTimeout(t, e)), sn = "6.44.0", sC = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function iC() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var aC = () => {
  const e = iC();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": sn,
    "X-Stainless-OS": bc(Deno.build.os),
    "X-Stainless-Arch": Ic(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": sn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": sn,
    "X-Stainless-OS": bc(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Ic(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = lC();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": sn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": sn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function lC() {
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
var Ic = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", bc = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Pc, uC = () => Pc ?? (Pc = aC());
function Fh() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function qh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Bh(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return qh({
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
function Gh(e) {
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
async function Rc(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var cC = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Oh = "RFC3986", Hh = (e) => String(e), xc = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Hh
};
var vi = (e, t) => (vi = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), vi(e, t)), ot = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), Ns = 1024, dC = (e, t, n, r, o) => {
  if (e.length === 0) return e;
  let s = e;
  if (typeof e == "symbol" ? s = Symbol.prototype.toString.call(e) : typeof e != "string" && (s = String(e)), n === "iso-8859-1") return escape(s).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < s.length; u += Ns) {
    const c = s.length >= Ns ? s.slice(u, u + Ns) : s, d = [];
    for (let h = 0; h < c.length; ++h) {
      let f = c.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || o === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(h);
        continue;
      }
      if (f < 128) {
        d[d.length] = ot[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = ot[192 | f >> 6] + ot[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = ot[224 | f >> 12] + ot[128 | f >> 6 & 63] + ot[128 | f & 63];
        continue;
      }
      h += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(h) & 1023), d[d.length] = ot[240 | f >> 18] + ot[128 | f >> 12 & 63] + ot[128 | f >> 6 & 63] + ot[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function fC(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function Mc(e, t) {
  if (Ce(e)) {
    const n = [];
    for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
    return n;
  }
  return t(e);
}
var Vh = {
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
}, Jh = function(e, t) {
  Array.prototype.push.apply(e, Ce(t) ? t : [t]);
}, Nc, ae = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: dC,
  encodeValuesOnly: !1,
  format: Oh,
  formatter: Hh,
  indices: !1,
  serializeDate(e) {
    return (Nc ?? (Nc = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function hC(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var ks = {};
function Kh(e, t, n, r, o, s, a, u, c, d, h, f, p, m, g, _, v, w) {
  let I = e, P = w, M = 0, x = !1;
  for (; (P = P.get(ks)) !== void 0 && !x; ) {
    const H = P.get(e);
    if (M += 1, typeof H < "u") {
      if (H === M) throw new RangeError("Cyclic object value");
      x = !0;
    }
    typeof P.get(ks) > "u" && (M = 0);
  }
  if (typeof d == "function" ? I = d(t, I) : I instanceof Date ? I = p?.(I) : n === "comma" && Ce(I) && (I = Mc(I, function(H) {
    return H instanceof Date ? p?.(H) : H;
  })), I === null) {
    if (s) return c && !_ ? c(t, ae.encoder, v, "key", m) : t;
    I = "";
  }
  if (hC(I) || fC(I)) {
    if (c) {
      const H = _ ? t : c(t, ae.encoder, v, "key", m);
      return [g?.(H) + "=" + g?.(c(I, ae.encoder, v, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(I))];
  }
  const C = [];
  if (typeof I > "u") return C;
  let F;
  if (n === "comma" && Ce(I))
    _ && c && (I = Mc(I, c)), F = [{ value: I.length > 0 ? I.join(",") || null : void 0 }];
  else if (Ce(d)) F = d;
  else {
    const H = Object.keys(I);
    F = h ? H.sort(h) : H;
  }
  const R = u ? String(t).replace(/\./g, "%2E") : String(t), D = r && Ce(I) && I.length === 1 ? R + "[]" : R;
  if (o && Ce(I) && I.length === 0) return D + "[]";
  for (let H = 0; H < F.length; ++H) {
    const z = F[H], j = typeof z == "object" && typeof z.value < "u" ? z.value : I[z];
    if (a && j === null) continue;
    const ee = f && u ? z.replace(/\./g, "%2E") : z, Q = Ce(I) ? typeof n == "function" ? n(D, ee) : D : D + (f ? "." + ee : "[" + ee + "]");
    w.set(e, M);
    const X = /* @__PURE__ */ new WeakMap();
    X.set(ks, w), Jh(C, Kh(j, Q, n, r, o, s, a, u, n === "comma" && _ && Ce(I) ? null : c, d, h, f, p, m, g, _, v, X));
  }
  return C;
}
function pC(e = ae) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || ae.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Oh;
  if (typeof e.format < "u") {
    if (!vi(xc, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const r = xc[n];
  let o = ae.filter;
  (typeof e.filter == "function" || Ce(e.filter)) && (o = e.filter);
  let s;
  if (e.arrayFormat && e.arrayFormat in Vh ? s = e.arrayFormat : "indices" in e ? s = e.indices ? "indices" : "repeat" : s = ae.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : ae.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : ae.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : ae.allowEmptyArrays,
    arrayFormat: s,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : ae.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? ae.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : ae.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : ae.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : ae.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : ae.encodeValuesOnly,
    filter: o,
    format: n,
    formatter: r,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : ae.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : ae.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : ae.strictNullHandling
  };
}
function mC(e, t = {}) {
  let n = e;
  const r = pC(t);
  let o, s;
  typeof r.filter == "function" ? (s = r.filter, n = s("", n)) : Ce(r.filter) && (s = r.filter, o = s);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = Vh[r.arrayFormat], c = u === "comma" && r.commaRoundTrip;
  o || (o = Object.keys(n)), r.sort && o.sort(r.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < o.length; ++p) {
    const m = o[p];
    r.skipNulls && n[m] === null || Jh(a, Kh(n[m], m, u, c, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, d));
  }
  const h = a.join(r.delimiter);
  let f = r.addQueryPrefix === !0 ? "?" : "";
  return r.charsetSentinel && (r.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function gC(e) {
  return mC(e, { arrayFormat: "brackets" });
}
function yC(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var kc;
function aa(e) {
  let t;
  return (kc ?? (t = new globalThis.TextEncoder(), kc = t.encode.bind(t)))(e);
}
var Dc;
function $c(e) {
  let t;
  return (Dc ?? (t = new globalThis.TextDecoder(), Dc = t.decode.bind(t)))(e);
}
var Ne, ke, Zo = class {
  constructor() {
    Ne.set(this, void 0), ke.set(this, void 0), O(this, Ne, new Uint8Array(), "f"), O(this, ke, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? aa(e) : e;
    O(this, Ne, yC([E(this, Ne, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = _C(E(this, Ne, "f"), E(this, ke, "f"))) != null; ) {
      if (r.carriage && E(this, ke, "f") == null) {
        O(this, ke, r.index, "f");
        continue;
      }
      if (E(this, ke, "f") != null && (r.index !== E(this, ke, "f") + 1 || r.carriage)) {
        n.push($c(E(this, Ne, "f").subarray(0, E(this, ke, "f") - 1))), O(this, Ne, E(this, Ne, "f").subarray(E(this, ke, "f")), "f"), O(this, ke, null, "f");
        continue;
      }
      const o = E(this, ke, "f") !== null ? r.preceding - 1 : r.preceding, s = $c(E(this, Ne, "f").subarray(0, o));
      n.push(s), O(this, Ne, E(this, Ne, "f").subarray(r.index), "f"), O(this, ke, null, "f");
    }
    return n;
  }
  flush() {
    return E(this, Ne, "f").length ? this.decode(`
`) : [];
  }
};
Ne = /* @__PURE__ */ new WeakMap(), ke = /* @__PURE__ */ new WeakMap();
Zo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Zo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function _C(e, t) {
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
function vC(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var No = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Lc = (e, t, n) => {
  if (e) {
    if (nC(No, e)) return e;
    fe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(No))}`);
  }
};
function jn() {
}
function eo(e, t, n) {
  return !t || No[e] > No[n] ? jn : t[e].bind(t);
}
var AC = {
  error: jn,
  warn: jn,
  info: jn,
  debug: jn
}, Uc = /* @__PURE__ */ new WeakMap();
function fe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return AC;
  const r = Uc.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: eo("error", t, n),
    warn: eo("warn", t, n),
    info: eo("info", t, n),
    debug: eo("debug", t, n)
  };
  return Uc.set(t, [n, o]), o;
}
var Ft = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Jn, Ar = class er {
  constructor(t, n, r) {
    this.iterator = t, Jn.set(this, void 0), this.controller = n, O(this, Jn, r, "f");
  }
  static fromSSEResponse(t, n, r, o) {
    let s = !1;
    const a = r ? fe(r) : console;
    async function* u() {
      if (s) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let c = !1;
      try {
        for await (const d of SC(t, n))
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
              if (h && h.error) throw new ge(void 0, h.error, void 0, t.headers);
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
              if (d.event == "error") throw new ge(void 0, h.error, h.message, void 0);
              yield {
                event: d.event,
                data: h
              };
            }
          }
        c = !0;
      } catch (d) {
        if (gi(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new er(u, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* s() {
      const u = new Zo(), c = Gh(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (o) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of s())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (gi(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new er(a, n, r);
  }
  [(Jn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new er(() => o(t), this.controller, E(this, Jn, "f")), new er(() => o(n), this.controller, E(this, Jn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return qh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: s } = await n.next();
          if (s) return r.close();
          const a = aa(JSON.stringify(o) + `
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
async function* SC(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
  const n = new EC(), r = new Zo(), o = Gh(e.body);
  for await (const s of TC(o)) for (const a of r.decode(s)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const s of r.flush()) {
    const a = n.decode(s);
    a && (yield a);
  }
}
async function* TC(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? aa(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let s;
    for (; (s = vC(t)) !== -1; )
      yield t.slice(0, s), t = t.slice(s);
  }
  t.length > 0 && (yield t);
}
var EC = class {
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
    let [t, n, r] = wC(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function wC(e, t) {
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
async function Wh(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: s } = t, a = await (async () => {
    if (t.options.stream)
      return fe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : Ar.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : zh(await n.json(), n) : await n.text();
  })();
  return fe(e).debug(`[${r}] response parsed`, Ft({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - s
  })), a;
}
function zh(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var tr, Yh = class Xh extends Promise {
  constructor(t, n, r = Wh) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, tr.set(this, void 0), O(this, tr, t, "f");
  }
  _thenUnwrap(t) {
    return new Xh(E(this, tr, "f"), this.responsePromise, async (n, r) => zh(t(await this.parseResponse(n, r), r), r.response));
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
var to, jo = class {
  constructor(e, t, n, r) {
    to.set(this, void 0), O(this, to, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new G("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await E(this, to, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(to = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, CC = class extends Yh {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await Wh(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Mt = class extends jo {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, te = class extends jo {
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
        ...ia(this.options.query),
        after: t
      }
    } : null;
  }
}, pe = class extends jo {
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
        ...ia(this.options.query),
        after: e
      }
    } : null;
  }
}, At = class extends jo {
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
        ...ia(this.options.query),
        after: e
      }
    } : null;
  }
}, IC = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, bC = "urn:ietf:params:oauth:grant-type:token-exchange", PC = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Fh();
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
      grant_type: bC,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: IC[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new Uh(t.status, a, t.headers) : ge.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
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
}, Qh = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function fr(e, t, n) {
  return Qh(), new File(e, t ?? "unknown_file", n);
}
function mo(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var la = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", es = async (e, t) => Ai(e.body) ? {
  ...e,
  body: await Zh(e.body, t)
} : e, at = async (e, t) => ({
  ...e,
  body: await Zh(e.body, t)
}), Fc = /* @__PURE__ */ new WeakMap();
function RC(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Fc.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, s = new FormData();
      return s.toString() !== await new o(s).text();
    } catch {
      return !0;
    }
  })();
  return Fc.set(t, r), r;
}
var Zh = async (e, t) => {
  if (!await RC(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, o]) => Si(n, r, o))), n;
}, jh = (e) => e instanceof Blob && "name" in e, xC = (e) => typeof e == "object" && e !== null && (e instanceof Response || la(e) || jh(e)), Ai = (e) => {
  if (xC(e)) return !0;
  if (Array.isArray(e)) return e.some(Ai);
  if (e && typeof e == "object") {
    for (const t in e) if (Ai(e[t])) return !0;
  }
  return !1;
}, Si = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, fr([await n.blob()], mo(n)));
    else if (la(n)) e.append(t, fr([await new Response(Bh(n)).blob()], mo(n)));
    else if (jh(n)) e.append(t, n, mo(n));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Si(e, t + "[]", r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, o]) => Si(e, `${t}[${r}]`, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, ep = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", MC = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && ep(e), NC = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function kC(e, t, n) {
  if (Qh(), e = await e, MC(e))
    return e instanceof File ? e : fr([await e.arrayBuffer()], e.name);
  if (NC(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), fr(await Ti(o), t, n);
  }
  const r = await Ti(e);
  if (t || (t = mo(e)), !n?.type) {
    const o = r.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return fr(r, t, n);
}
async function Ti(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (ep(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (la(e)) for await (const n of e) t.push(...await Ti(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${DC(e)}`);
  }
  return t;
}
function DC(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var k = class {
  constructor(e) {
    this._client = e;
  }
};
function tp(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var qc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), $C = (e = tp) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const s = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let g = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? qc) ?? qc)?.toString) && (g = m + "", s.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : g);
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
      const g = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + g + _;
    }, "");
    throw new G(`Path parameters result in path with invalid segments:
${s.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, A = /* @__PURE__ */ $C(tp), np = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/chat/completions/${e}/messages`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function ko(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function ua(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function xr(e) {
  return e?.$brand === "auto-parseable-tool";
}
function LC(e, t) {
  return !t || !rp(t) ? {
    ...e,
    choices: e.choices.map((n) => (op(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : ca(e, t);
}
function ca(e, t) {
  const n = e.choices.map((r) => {
    if (r.finish_reason === "length") throw new $h();
    if (r.finish_reason === "content_filter") throw new Lh();
    return op(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        ...r.message.tool_calls ? { tool_calls: r.message.tool_calls?.map((o) => FC(t, o)) ?? void 0 } : void 0,
        parsed: r.message.content && !r.message.refusal ? UC(t, r.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function UC(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function FC(e, t) {
  const n = e.tools?.find((r) => ko(r) && r.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: xr(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function qC(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((r) => ko(r) && r.function?.name === t.function.name);
  return ko(n) && (xr(n) || n?.function.strict || !1);
}
function rp(e) {
  return ua(e.response_format) ? !0 : e.tools?.some((t) => xr(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function op(e) {
  for (const t of e || []) if (t.type !== "function") throw new G(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function BC(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new G(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new G(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Do = (e) => e?.role === "assistant", sp = (e) => e?.role === "tool", Ei, go, yo, nr, rr, _o, or, ht, sr, $o, Lo, an, ip, da = class {
  constructor() {
    Ei.add(this), this.controller = new AbortController(), go.set(this, void 0), yo.set(this, () => {
    }), nr.set(this, () => {
    }), rr.set(this, void 0), _o.set(this, () => {
    }), or.set(this, () => {
    }), ht.set(this, {}), sr.set(this, !1), $o.set(this, !1), Lo.set(this, !1), an.set(this, !1), O(this, go, new Promise((e, t) => {
      O(this, yo, e, "f"), O(this, nr, t, "f");
    }), "f"), O(this, rr, new Promise((e, t) => {
      O(this, _o, e, "f"), O(this, or, t, "f");
    }), "f"), E(this, go, "f").catch(() => {
    }), E(this, rr, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, E(this, Ei, "m", ip).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (E(this, yo, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return E(this, sr, "f");
  }
  get errored() {
    return E(this, $o, "f");
  }
  get aborted() {
    return E(this, Lo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (E(this, ht, "f")[e] || (E(this, ht, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = E(this, ht, "f")[e];
    if (!n) return this;
    const r = n.findIndex((o) => o.listener === t);
    return r >= 0 && n.splice(r, 1), this;
  }
  once(e, t) {
    return (E(this, ht, "f")[e] || (E(this, ht, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      O(this, an, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    O(this, an, !0, "f"), await E(this, rr, "f");
  }
  _emit(e, ...t) {
    if (E(this, sr, "f")) return;
    e === "end" && (O(this, sr, !0, "f"), E(this, _o, "f").call(this));
    const n = E(this, ht, "f")[e];
    if (n && (E(this, ht, "f")[e] = n.filter((r) => !r.once), n.forEach(({ listener: r }) => r(...t))), e === "abort") {
      const r = t[0];
      !E(this, an, "f") && !n?.length && Promise.reject(r), E(this, nr, "f").call(this, r), E(this, or, "f").call(this, r), this._emit("end");
      return;
    }
    if (e === "error") {
      const r = t[0];
      !E(this, an, "f") && !n?.length && Promise.reject(r), E(this, nr, "f").call(this, r), E(this, or, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
go = /* @__PURE__ */ new WeakMap(), yo = /* @__PURE__ */ new WeakMap(), nr = /* @__PURE__ */ new WeakMap(), rr = /* @__PURE__ */ new WeakMap(), _o = /* @__PURE__ */ new WeakMap(), or = /* @__PURE__ */ new WeakMap(), ht = /* @__PURE__ */ new WeakMap(), sr = /* @__PURE__ */ new WeakMap(), $o = /* @__PURE__ */ new WeakMap(), Lo = /* @__PURE__ */ new WeakMap(), an = /* @__PURE__ */ new WeakMap(), Ei = /* @__PURE__ */ new WeakSet(), ip = function(t) {
  if (O(this, $o, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Ke()), t instanceof Ke)
    return O(this, Lo, !0, "f"), this._emit("abort", t);
  if (t instanceof G) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new G(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new G(String(t)));
};
function GC(e) {
  return typeof e.parse == "function";
}
var ve, wi, Uo, Ci, Ii, bi, ap, lp, OC = 10, up = class extends da {
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
      if (this._emit("message", e), sp(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (Do(e) && e.tool_calls)
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
    return await this.done(), E(this, ve, "m", wi).call(this);
  }
  async finalMessage() {
    return await this.done(), E(this, ve, "m", Uo).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), E(this, ve, "m", Ci).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), E(this, ve, "m", Ii).call(this);
  }
  async totalUsage() {
    return await this.done(), E(this, ve, "m", bi).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = E(this, ve, "m", Uo).call(this);
    t && this._emit("finalMessage", t);
    const n = E(this, ve, "m", wi).call(this);
    n && this._emit("finalContent", n);
    const r = E(this, ve, "m", Ci).call(this);
    r && this._emit("finalFunctionToolCall", r);
    const o = E(this, ve, "m", Ii).call(this);
    o != null && this._emit("finalFunctionToolCallResult", o), this._chatCompletions.some((s) => s.usage) && this._emit("totalUsage", E(this, ve, "m", bi).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), E(this, ve, "m", ap).call(this, t);
    const o = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(ca(o, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const r of t.messages) this._addMessage(r, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const r = "tool", { tool_choice: o = "auto", stream: s, ...a } = t, u = typeof o != "string" && o.type === "function" && o?.function?.name, { maxChatCompletions: c = OC } = n || {}, d = t.tools.map((p) => {
      if (xr(p)) {
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
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const _ = g.id, { name: v, arguments: w } = g.function, I = h[v];
        if (I) {
          if (u && u !== v) {
            const C = `Invalid tool_call: ${JSON.stringify(v)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: r,
              tool_call_id: _,
              content: C
            });
            continue;
          }
        } else {
          const C = `Invalid tool_call: ${JSON.stringify(v)}. Available options are: ${Object.keys(h).map((F) => JSON.stringify(F)).join(", ")}. Please try again`;
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: C
          });
          continue;
        }
        let P;
        try {
          P = GC(I) ? await I.parse(w) : w;
        } catch (C) {
          const F = C instanceof Error ? C.message : String(C);
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: F
          });
          continue;
        }
        const M = await I.function(P, this), x = E(this, ve, "m", lp).call(this, M);
        if (this._addMessage({
          role: r,
          tool_call_id: _,
          content: x
        }), u) return;
      }
    }
  }
};
ve = /* @__PURE__ */ new WeakSet(), wi = function() {
  return E(this, ve, "m", Uo).call(this).content ?? null;
}, Uo = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (Do(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new G("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Ci = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Do(n) && n?.tool_calls?.length) for (let r = n.tool_calls.length - 1; r >= 0; r--) {
      const o = n.tool_calls[r];
      if (o?.type === "function") return o.function;
    }
  }
}, Ii = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (sp(n) && n.content != null && typeof n.content == "string" && this.messages.some((r) => r.role === "assistant" && r.tool_calls?.some((o) => o.type === "function" && o.id === n.tool_call_id))) return n.content;
  }
}, bi = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, ap = function(t) {
  if (t.n != null && t.n > 1) throw new G("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, lp = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var HC = class cp extends up {
  static runTools(t, n, r) {
    const o = new cp(), s = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, s)), o;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), Do(t) && t.content && this._emit("content", t.content);
  }
}, ce = {
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
}, VC = class extends Error {
}, JC = class extends Error {
};
function KC(e, t = ce.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return WC(e.trim(), t);
}
var WC = (e, t) => {
  const n = e.length;
  let r = 0;
  const o = (p) => {
    throw new VC(`${p} at position ${r}`);
  }, s = (p) => {
    throw new JC(`${p} at position ${r}`);
  }, a = () => (f(), r >= n && o("Unexpected end of input"), e[r] === '"' ? u() : e[r] === "{" ? c() : e[r] === "[" ? d() : e.substring(r, r + 4) === "null" || ce.NULL & t && n - r < 4 && "null".startsWith(e.substring(r)) ? (r += 4, null) : e.substring(r, r + 4) === "true" || ce.BOOL & t && n - r < 4 && "true".startsWith(e.substring(r)) ? (r += 4, !0) : e.substring(r, r + 5) === "false" || ce.BOOL & t && n - r < 5 && "false".startsWith(e.substring(r)) ? (r += 5, !1) : e.substring(r, r + 8) === "Infinity" || ce.INFINITY & t && n - r < 8 && "Infinity".startsWith(e.substring(r)) ? (r += 8, 1 / 0) : e.substring(r, r + 9) === "-Infinity" || ce.MINUS_INFINITY & t && 1 < n - r && n - r < 9 && "-Infinity".startsWith(e.substring(r)) ? (r += 9, -1 / 0) : e.substring(r, r + 3) === "NaN" || ce.NAN & t && n - r < 3 && "NaN".startsWith(e.substring(r)) ? (r += 3, NaN) : h()), u = () => {
    const p = r;
    let m = !1;
    for (r++; r < n && (e[r] !== '"' || m && e[r - 1] === "\\"); )
      m = e[r] === "\\" ? !m : !1, r++;
    if (e.charAt(r) == '"') try {
      return JSON.parse(e.substring(p, ++r - Number(m)));
    } catch (g) {
      s(String(g));
    }
    else if (ce.STR & t) try {
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
        if (f(), r >= n && ce.OBJ & t) return p;
        const m = u();
        f(), r++;
        try {
          const g = a();
          Object.defineProperty(p, m, {
            value: g,
            writable: !0,
            enumerable: !0,
            configurable: !0
          });
        } catch (g) {
          if (ce.OBJ & t) return p;
          throw g;
        }
        f(), e[r] === "," && r++;
      }
    } catch {
      if (ce.OBJ & t) return p;
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
      if (ce.ARR & t) return p;
      o("Expected ']' at end of array");
    }
    return r++, p;
  }, h = () => {
    if (r === 0) {
      e === "-" && ce.NUM & t && o("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (ce.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        s(String(m));
      }
    }
    const p = r;
    for (e[r] === "-" && r++; e[r] && !",]}".includes(e[r]); ) r++;
    r == n && !(ce.NUM & t) && o("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, r));
    } catch {
      e.substring(p, r) === "-" && ce.NUM & t && o("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(p, e.lastIndexOf("e")));
      } catch (g) {
        s(String(g));
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
}, Bc = (e) => KC(e, ce.ALL ^ ce.NUM), se, ft, en, wt, Ds, no, $s, Ls, Us, ro, Fs, Gc, dp = class Pi extends up {
  constructor(t) {
    super(), se.add(this), ft.set(this, void 0), en.set(this, void 0), wt.set(this, void 0), O(this, ft, t, "f"), O(this, en, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return E(this, wt, "f");
  }
  static fromReadableStream(t) {
    const n = new Pi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, r) {
    const o = new Pi(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), E(this, se, "m", Ds).call(this);
    const s = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of s) E(this, se, "m", $s).call(this, a);
    if (s.controller.signal?.aborted) throw new Ke();
    return this._addChatCompletion(E(this, se, "m", ro).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), E(this, se, "m", Ds).call(this), this._connected();
    const o = Ar.fromReadableStream(t, this.controller);
    let s;
    for await (const a of o)
      s && s !== a.id && this._addChatCompletion(E(this, se, "m", ro).call(this)), E(this, se, "m", $s).call(this, a), s = a.id;
    if (o.controller.signal?.aborted) throw new Ke();
    return this._addChatCompletion(E(this, se, "m", ro).call(this));
  }
  [(ft = /* @__PURE__ */ new WeakMap(), en = /* @__PURE__ */ new WeakMap(), wt = /* @__PURE__ */ new WeakMap(), se = /* @__PURE__ */ new WeakSet(), Ds = function() {
    this.ended || O(this, wt, void 0, "f");
  }, no = function(n) {
    let r = E(this, en, "f")[n.index];
    return r || (r = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, E(this, en, "f")[n.index] = r, r);
  }, $s = function(n) {
    if (this.ended) return;
    const r = E(this, se, "m", Gc).call(this, n);
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
      const a = E(this, se, "m", no).call(this, s);
      s.finish_reason && (E(this, se, "m", Us).call(this, s), a.current_tool_call_index != null && E(this, se, "m", Ls).call(this, s, a.current_tool_call_index));
      for (const u of o.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (E(this, se, "m", Us).call(this, s), a.current_tool_call_index != null && E(this, se, "m", Ls).call(this, s, a.current_tool_call_index)), a.current_tool_call_index = u.index;
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
  }, Ls = function(n, r) {
    if (E(this, se, "m", no).call(this, n).done_tool_calls.has(r)) return;
    const o = n.message.tool_calls?.[r];
    if (!o) throw new Error("no tool call snapshot");
    if (!o.type) throw new Error("tool call snapshot missing `type`");
    if (o.type === "function") {
      const s = E(this, ft, "f")?.tools?.find((a) => ko(a) && a.function.name === o.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: o.function.name,
        index: r,
        arguments: o.function.arguments,
        parsed_arguments: xr(s) ? s.$parseRaw(o.function.arguments) : s?.function.strict ? JSON.parse(o.function.arguments) : null
      });
    } else o.type;
  }, Us = function(n) {
    const r = E(this, se, "m", no).call(this, n);
    if (n.message.content && !r.content_done) {
      r.content_done = !0;
      const o = E(this, se, "m", Fs).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: o ? o.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !r.refusal_done && (r.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !r.logprobs_content_done && (r.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !r.logprobs_refusal_done && (r.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, ro = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = E(this, wt, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return O(this, wt, void 0, "f"), O(this, en, [], "f"), zC(n, E(this, ft, "f"));
  }, Fs = function() {
    const n = E(this, ft, "f")?.response_format;
    return ua(n) ? n : null;
  }, Gc = function(n) {
    var r, o, s, a;
    let u = E(this, wt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = O(this, wt, {
      ...d,
      choices: []
    }, "f");
    for (const { delta: h, finish_reason: f, index: p, logprobs: m = null, ...g } of n.choices) {
      let _ = u.choices[p];
      if (_ || (_ = u.choices[p] = {
        finish_reason: f,
        index: p,
        message: {},
        logprobs: m,
        ...g
      }), m) if (!_.logprobs) _.logprobs = Object.assign({}, m);
      else {
        const { content: C, refusal: F, ...R } = m;
        Object.assign(_.logprobs, R), C && ((r = _.logprobs).content ?? (r.content = []), _.logprobs.content.push(...C)), F && ((o = _.logprobs).refusal ?? (o.refusal = []), _.logprobs.refusal.push(...F));
      }
      if (f && (_.finish_reason = f, E(this, ft, "f") && rp(E(this, ft, "f")))) {
        if (f === "length") throw new $h();
        if (f === "content_filter") throw new Lh();
      }
      if (Object.assign(_, g), !h) continue;
      const { content: v, refusal: w, function_call: I, role: P, tool_calls: M, ...x } = h;
      if (Object.assign(_.message, x), w && (_.message.refusal = (_.message.refusal || "") + w), P && (_.message.role = P), I && (_.message.function_call ? (I.name && (_.message.function_call.name = I.name), I.arguments && ((s = _.message.function_call).arguments ?? (s.arguments = ""), _.message.function_call.arguments += I.arguments)) : _.message.function_call = I), v && (_.message.content = (_.message.content || "") + v, !_.message.refusal && E(this, se, "m", Fs).call(this) && (_.message.parsed = Bc(_.message.content))), M) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: C, id: F, type: R, function: D, ...H } of M) {
          const z = (a = _.message.tool_calls)[C] ?? (a[C] = {});
          Object.assign(z, H), F && (z.id = F), R && (z.type = R), D && (z.function ?? (z.function = {
            name: D.name ?? "",
            arguments: ""
          })), D?.name && (z.function.name = D.name), D?.arguments && (z.function.arguments += D.arguments, qC(E(this, ft, "f"), z) && (z.function.parsed_arguments = Bc(z.function.arguments)));
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
    return new Ar(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function zC(e, t) {
  const { id: n, choices: r, created: o, model: s, system_fingerprint: a, ...u } = e;
  return LC({
    ...u,
    id: n,
    choices: r.map(({ message: c, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new G(`missing finish_reason for choice ${h}`);
      const { content: m = null, function_call: g, tool_calls: _, ...v } = c, w = c.role;
      if (!w) throw new G(`missing role for choice ${h}`);
      if (g) {
        const { arguments: I, name: P } = g;
        if (I == null) throw new G(`missing function_call.arguments for choice ${h}`);
        if (!P) throw new G(`missing function_call.name for choice ${h}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: I,
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
          tool_calls: _.map((I, P) => {
            const { function: M, type: x, id: C, ...F } = I, { arguments: R, name: D, ...H } = M || {};
            if (C == null) throw new G(`missing choices[${h}].tool_calls[${P}].id
${oo(e)}`);
            if (x == null) throw new G(`missing choices[${h}].tool_calls[${P}].type
${oo(e)}`);
            if (D == null) throw new G(`missing choices[${h}].tool_calls[${P}].function.name
${oo(e)}`);
            if (R == null) throw new G(`missing choices[${h}].tool_calls[${P}].function.arguments
${oo(e)}`);
            return {
              ...F,
              id: C,
              type: x,
              function: {
                ...H,
                name: D,
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
function oo(e) {
  return JSON.stringify(e);
}
var YC = class Ri extends dp {
  static fromReadableStream(t) {
    const n = new Ri(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, r) {
    const o = new Ri(n), s = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, s)), o;
  }
}, fa = class extends k {
  constructor() {
    super(...arguments), this.messages = new np(this._client);
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
    return BC(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => ca(n, e));
  }
  runTools(e, t) {
    return e.stream ? YC.runTools(this._client, e, t) : HC.runTools(this._client, e, t);
  }
  stream(e, t) {
    return dp.createChatCompletion(this._client, e, t);
  }
};
fa.Messages = np;
var ha = class extends k {
  constructor() {
    super(...arguments), this.completions = new fa(this._client);
  }
};
ha.Completions = fa;
var fp = class extends k {
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
}, hp = class extends k {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", pe, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, pp = class extends k {
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
    return this._client.getAPIList("/organization/certificates", pe, {
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
    return this._client.getAPIList("/organization/certificates/activate", Mt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", Mt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, mp = class extends k {
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
}, gp = class extends k {
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
    return this._client.getAPIList("/organization/invites", pe, {
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
}, yp = class extends k {
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
    return this._client.getAPIList("/organization/roles", At, {
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
}, _p = class extends k {
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
    return this._client.getAPIList("/organization/spend_alerts", pe, {
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
}, vp = class extends k {
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
}, Ap = class extends k {
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
    return this._client.getAPIList(A`/organization/groups/${e}/roles`, At, {
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
}, Sp = class extends k {
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
    return this._client.getAPIList(A`/organization/groups/${e}/users`, At, {
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
}, ts = class extends k {
  constructor() {
    super(...arguments), this.users = new Sp(this._client), this.roles = new Ap(this._client);
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
    return this._client.getAPIList("/organization/groups", At, {
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
ts.Users = Sp;
ts.Roles = Ap;
var Tp = class extends k {
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(A`/organization/projects/${r}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/api_keys`, pe, {
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
}, Ep = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/certificates`, pe, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/certificates/activate`, Mt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/certificates/deactivate`, Mt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, wp = class extends k {
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
}, Cp = class extends k {
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
}, Ip = class extends k {
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
}, bp = class extends k {
  listRateLimits(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/rate_limits`, pe, {
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
}, Pp = class extends k {
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
    return this._client.getAPIList(A`/projects/${e}/roles`, At, {
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
}, Rp = class extends k {
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
    return this._client.getAPIList(A`/organization/projects/${e}/service_accounts`, pe, {
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
}, xp = class extends k {
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
    return this._client.getAPIList(A`/organization/projects/${e}/spend_alerts`, pe, {
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
}, Mp = class extends k {
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
    return this._client.getAPIList(A`/projects/${r}/groups/${e}/roles`, At, {
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
}, pa = class extends k {
  constructor() {
    super(...arguments), this.roles = new Mp(this._client);
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
    return this._client.getAPIList(A`/organization/projects/${e}/groups`, At, {
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
pa.Roles = Mp;
var Np = class extends k {
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
    return this._client.getAPIList(A`/projects/${r}/users/${e}/roles`, At, {
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
}, ma = class extends k {
  constructor() {
    super(...arguments), this.roles = new Np(this._client);
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
    return this._client.getAPIList(A`/organization/projects/${e}/users`, pe, {
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
ma.Roles = Np;
var qe = class extends k {
  constructor() {
    super(...arguments), this.users = new ma(this._client), this.serviceAccounts = new Rp(this._client), this.apiKeys = new Tp(this._client), this.rateLimits = new bp(this._client), this.modelPermissions = new Ip(this._client), this.hostedToolPermissions = new Cp(this._client), this.groups = new pa(this._client), this.roles = new Pp(this._client), this.dataRetention = new wp(this._client), this.spendAlerts = new xp(this._client), this.certificates = new Ep(this._client);
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
    return this._client.getAPIList("/organization/projects", pe, {
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
qe.Users = ma;
qe.ServiceAccounts = Rp;
qe.APIKeys = Tp;
qe.RateLimits = bp;
qe.ModelPermissions = Ip;
qe.HostedToolPermissions = Cp;
qe.Groups = pa;
qe.Roles = Pp;
qe.DataRetention = wp;
qe.SpendAlerts = xp;
qe.Certificates = Ep;
var kp = class extends k {
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
    return this._client.getAPIList(A`/organization/users/${e}/roles`, At, {
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
}, ga = class extends k {
  constructor() {
    super(...arguments), this.roles = new kp(this._client);
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
    return this._client.getAPIList("/organization/users", pe, {
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
ga.Roles = kp;
var Be = class extends k {
  constructor() {
    super(...arguments), this.auditLogs = new hp(this._client), this.adminAPIKeys = new fp(this._client), this.usage = new vp(this._client), this.invites = new gp(this._client), this.users = new ga(this._client), this.groups = new ts(this._client), this.roles = new yp(this._client), this.dataRetention = new mp(this._client), this.spendAlerts = new _p(this._client), this.certificates = new pp(this._client), this.projects = new qe(this._client);
  }
};
Be.AuditLogs = hp;
Be.AdminAPIKeys = fp;
Be.Usage = vp;
Be.Invites = gp;
Be.Users = ga;
Be.Groups = ts;
Be.Roles = yp;
Be.DataRetention = mp;
Be.SpendAlerts = _p;
Be.Certificates = pp;
Be.Projects = qe;
var ya = class extends k {
  constructor() {
    super(...arguments), this.organization = new Be(this._client);
  }
};
ya.Organization = Be;
var Dp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* XC(e) {
  if (!e) return;
  if (Dp in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const s of o) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : wc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const s = wc(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of s)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var U = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [s, a] of XC(r)) {
      const u = s.toLowerCase();
      o.has(u) || (t.delete(s), o.add(u)), a === null ? (t.delete(s), n.add(u)) : (t.append(s, a), n.delete(u));
    }
  }
  return {
    [Dp]: !0,
    values: t,
    nulls: n
  };
}, $p = class extends k {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: U([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Lp = class extends k {
  create(e, t) {
    return this._client.post("/audio/transcriptions", at({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Up = class extends k {
  create(e, t) {
    return this._client.post("/audio/translations", at({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Mr = class extends k {
  constructor() {
    super(...arguments), this.transcriptions = new Lp(this._client), this.translations = new Up(this._client), this.speech = new $p(this._client);
  }
};
Mr.Transcriptions = Lp;
Mr.Translations = Up;
Mr.Speech = $p;
var Fp = class extends k {
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
}, qp = class extends k {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/assistants/${e}`, {
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/assistants/${e}`, {
      body: t,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", te, {
      query: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/assistants/${e}`, {
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Bp = class extends k {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Gp = class extends k {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, ns = class extends k {
  constructor() {
    super(...arguments), this.sessions = new Bp(this._client), this.transcriptionSessions = new Gp(this._client);
  }
};
ns.Sessions = Bp;
ns.TranscriptionSessions = Gp;
var Op = class extends k {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(A`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: U([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Hp = class extends k {
  retrieve(e, t) {
    return this._client.get(A`/chatkit/threads/${e}`, {
      ...t,
      headers: U([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", pe, {
      query: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/chatkit/threads/${e}`, {
      ...t,
      headers: U([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(A`/chatkit/threads/${e}/items`, pe, {
      query: t,
      ...n,
      headers: U([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, rs = class extends k {
  constructor() {
    super(...arguments), this.sessions = new Op(this._client), this.threads = new Hp(this._client);
  }
};
rs.Sessions = Op;
rs.Threads = Hp;
var Vp = class extends k {
  create(e, t, n) {
    return this._client.post(A`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(A`/threads/${r}/messages/${e}`, {
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(A`/threads/${r}/messages/${e}`, {
      body: o,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/threads/${e}/messages`, te, {
      query: t,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { thread_id: r } = t;
    return this._client.delete(A`/threads/${r}/messages/${e}`, {
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Jp = class extends k {
  retrieve(e, t, n) {
    const { thread_id: r, run_id: o, ...s } = t;
    return this._client.get(A`/threads/${r}/runs/${o}/steps/${e}`, {
      query: s,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.getAPIList(A`/threads/${r}/runs/${e}/steps`, te, {
      query: o,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, QC = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, r = new Uint8Array(n);
    for (let o = 0; o < n; o++) r[o] = t.charCodeAt(o);
    return Array.from(new Float32Array(r.buffer));
  }
}, Ct = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, he, Vt, xi, it, vo, Xe, Jt, fn, Bt, Fo, De, Ao, So, hr, ir, ar, Oc, Hc, Vc, Jc, Kc, Wc, zc, pr = class extends da {
  constructor() {
    super(...arguments), he.add(this), xi.set(this, []), it.set(this, {}), vo.set(this, {}), Xe.set(this, void 0), Jt.set(this, void 0), fn.set(this, void 0), Bt.set(this, void 0), Fo.set(this, void 0), De.set(this, void 0), Ao.set(this, void 0), So.set(this, void 0), hr.set(this, void 0);
  }
  [(xi = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), vo = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakMap(), fn = /* @__PURE__ */ new WeakMap(), Bt = /* @__PURE__ */ new WeakMap(), Fo = /* @__PURE__ */ new WeakMap(), De = /* @__PURE__ */ new WeakMap(), Ao = /* @__PURE__ */ new WeakMap(), So = /* @__PURE__ */ new WeakMap(), hr = /* @__PURE__ */ new WeakMap(), he = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new Vt();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const r = Ar.fromReadableStream(e, this.controller);
    for await (const o of r) E(this, he, "m", ir).call(this, o);
    if (r.controller.signal?.aborted) throw new Ke();
    return this._addRun(E(this, he, "m", ar).call(this));
  }
  toReadableStream() {
    return new Ar(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, r) {
    const o = new Vt();
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
    for await (const u of a) E(this, he, "m", ir).call(this, u);
    if (a.controller.signal?.aborted) throw new Ke();
    return this._addRun(E(this, he, "m", ar).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const r = new Vt();
    return r._run(() => r._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  static createAssistantStream(e, t, n, r) {
    const o = new Vt();
    return o._run(() => o._runAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  currentEvent() {
    return E(this, Ao, "f");
  }
  currentRun() {
    return E(this, So, "f");
  }
  currentMessageSnapshot() {
    return E(this, Xe, "f");
  }
  currentRunStepSnapshot() {
    return E(this, hr, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(E(this, it, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(E(this, vo, "f"));
  }
  async finalRun() {
    if (await this.done(), !E(this, Jt, "f")) throw Error("Final run was not received.");
    return E(this, Jt, "f");
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
    for await (const a of s) E(this, he, "m", ir).call(this, a);
    if (s.controller.signal?.aborted) throw new Ke();
    return this._addRun(E(this, he, "m", ar).call(this));
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
    for await (const u of a) E(this, he, "m", ir).call(this, u);
    if (a.controller.signal?.aborted) throw new Ke();
    return this._addRun(E(this, he, "m", ar).call(this));
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
      else if (Ms(o) && Ms(r)) o = this.accumulateDelta(o, r);
      else if (Array.isArray(o) && Array.isArray(r)) {
        if (o.every((s) => typeof s == "string" || typeof s == "number")) {
          o.push(...r);
          continue;
        }
        for (const s of r) {
          if (!Ms(s)) throw new Error(`Expected array delta entry to be an object but got: ${s}`);
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
Vt = pr, ir = function(t) {
  if (!this.ended)
    switch (O(this, Ao, t, "f"), E(this, he, "m", Vc).call(this, t), t.event) {
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
        E(this, he, "m", zc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        E(this, he, "m", Hc).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        E(this, he, "m", Oc).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, ar = function() {
  if (this.ended) throw new G("stream has ended, this shouldn't happen");
  if (!E(this, Jt, "f")) throw Error("Final run has not been received");
  return E(this, Jt, "f");
}, Oc = function(t) {
  const [n, r] = E(this, he, "m", Kc).call(this, t, E(this, Xe, "f"));
  O(this, Xe, n, "f"), E(this, vo, "f")[n.id] = n;
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
        if (o.index != E(this, fn, "f")) {
          if (E(this, Bt, "f")) switch (E(this, Bt, "f").type) {
            case "text":
              this._emit("textDone", E(this, Bt, "f").text, E(this, Xe, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", E(this, Bt, "f").image_file, E(this, Xe, "f"));
              break;
          }
          O(this, fn, o.index, "f");
        }
        O(this, Bt, n.content[o.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (E(this, fn, "f") !== void 0) {
        const o = t.data.content[E(this, fn, "f")];
        if (o) switch (o.type) {
          case "image_file":
            this._emit("imageFileDone", o.image_file, E(this, Xe, "f"));
            break;
          case "text":
            this._emit("textDone", o.text, E(this, Xe, "f"));
            break;
        }
      }
      E(this, Xe, "f") && this._emit("messageDone", t.data), O(this, Xe, void 0, "f");
  }
}, Hc = function(t) {
  const n = E(this, he, "m", Jc).call(this, t);
  switch (O(this, hr, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const r = t.data.delta;
      if (r.step_details && r.step_details.type == "tool_calls" && r.step_details.tool_calls && n.step_details.type == "tool_calls") for (const o of r.step_details.tool_calls) o.index == E(this, Fo, "f") ? this._emit("toolCallDelta", o, n.step_details.tool_calls[o.index]) : (E(this, De, "f") && this._emit("toolCallDone", E(this, De, "f")), O(this, Fo, o.index, "f"), O(this, De, n.step_details.tool_calls[o.index], "f"), E(this, De, "f") && this._emit("toolCallCreated", E(this, De, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      O(this, hr, void 0, "f"), t.data.step_details.type == "tool_calls" && E(this, De, "f") && (this._emit("toolCallDone", E(this, De, "f")), O(this, De, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Vc = function(t) {
  E(this, xi, "f").push(t), this._emit("event", t);
}, Jc = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return E(this, it, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = E(this, it, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let r = t.data;
      if (r.delta) {
        const o = Vt.accumulateDelta(n, r.delta);
        E(this, it, "f")[t.data.id] = o;
      }
      return E(this, it, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      E(this, it, "f")[t.data.id] = t.data;
      break;
  }
  if (E(this, it, "f")[t.data.id]) return E(this, it, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Kc = function(t, n) {
  let r = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, r];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let o = t.data;
      if (o.delta.content) for (const s of o.delta.content) if (s.index in n.content) {
        let a = n.content[s.index];
        n.content[s.index] = E(this, he, "m", Wc).call(this, s, a);
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
}, Wc = function(t, n) {
  return Vt.accumulateDelta(n, t);
}, zc = function(t) {
  switch (O(this, So, t.data, "f"), t.event) {
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
      O(this, Jt, t.data, "f"), E(this, De, "f") && (this._emit("toolCallDone", E(this, De, "f")), O(this, De, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var _a = class extends k {
  constructor() {
    super(...arguments), this.steps = new Jp(this._client);
  }
  create(e, t, n) {
    const { include: r, ...o } = t;
    return this._client.post(A`/threads/${e}/runs`, {
      query: { include: r },
      body: o,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(A`/threads/${r}/runs/${e}`, {
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(A`/threads/${r}/runs/${e}`, {
      body: o,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/threads/${e}/runs`, te, {
      query: t,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { thread_id: r } = t;
    return this._client.post(A`/threads/${r}/runs/${e}/cancel`, {
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(r.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return pr.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const r = U([n?.headers, {
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
          await Rr(a);
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
    return pr.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(A`/threads/${r}/runs/${e}/submit_tool_outputs`, {
      body: o,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
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
    return pr.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
_a.Steps = Jp;
var os = class extends k {
  constructor() {
    super(...arguments), this.runs = new _a(this._client), this.messages = new Vp(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/threads/${e}`, {
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/threads/${e}`, {
      body: t,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/threads/${e}`, {
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
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
    return pr.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
os.Runs = _a;
os.Messages = Vp;
var Cn = class extends k {
  constructor() {
    super(...arguments), this.realtime = new ns(this._client), this.chatkit = new rs(this._client), this.assistants = new qp(this._client), this.threads = new os(this._client);
  }
};
Cn.Realtime = ns;
Cn.ChatKit = rs;
Cn.Assistants = qp;
Cn.Threads = os;
var Kp = class extends k {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, Wp = class extends k {
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(A`/containers/${r}/files/${e}/content`, {
      ...n,
      headers: U([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, va = class extends k {
  constructor() {
    super(...arguments), this.content = new Wp(this._client);
  }
  create(e, t, n) {
    return this._client.post(A`/containers/${e}/files`, es({
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
      headers: U([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
va.Content = Wp;
var Aa = class extends k {
  constructor() {
    super(...arguments), this.files = new va(this._client);
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
      headers: U([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Aa.Files = va;
var zp = class extends k {
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
    return this._client.getAPIList(A`/conversations/${e}/items`, pe, {
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
}, Sa = class extends k {
  constructor() {
    super(...arguments), this.items = new zp(this._client);
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
Sa.Items = zp;
var Yp = class extends k {
  create(e, t) {
    const n = !!e.encoding_format;
    let r = n ? e.encoding_format : "base64";
    n && fe(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const o = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: r
      },
      ...t,
      __security: { bearerAuth: !0 }
    });
    return n ? o : (fe(this._client).debug("embeddings/decoding base64 embeddings from base64"), o._thenUnwrap((s) => (s && s.data && s.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = QC(u);
    }), s)));
  }
}, Xp = class extends k {
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
}, Ta = class extends k {
  constructor() {
    super(...arguments), this.outputItems = new Xp(this._client);
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
Ta.OutputItems = Xp;
var Ea = class extends k {
  constructor() {
    super(...arguments), this.runs = new Ta(this._client);
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
Ea.Runs = Ta;
var Qp = class extends k {
  create(e, t) {
    return this._client.post("/files", at({
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
      headers: U([{ Accept: "application/binary" }, t?.headers]),
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
      if (await Rr(t), s = await this.retrieve(e), Date.now() - o > n) throw new sa({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return s;
  }
}, Zp = class extends k {
}, jp = class extends k {
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
}, wa = class extends k {
  constructor() {
    super(...arguments), this.graders = new jp(this._client);
  }
};
wa.Graders = jp;
var em = class extends k {
  create(e, t, n) {
    return this._client.getAPIList(A`/fine_tuning/checkpoints/${e}/permissions`, Mt, {
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
    return this._client.getAPIList(A`/fine_tuning/checkpoints/${e}/permissions`, pe, {
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
}, Ca = class extends k {
  constructor() {
    super(...arguments), this.permissions = new em(this._client);
  }
};
Ca.Permissions = em;
var tm = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/fine_tuning/jobs/${e}/checkpoints`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Ia = class extends k {
  constructor() {
    super(...arguments), this.checkpoints = new tm(this._client);
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
Ia.Checkpoints = tm;
var In = class extends k {
  constructor() {
    super(...arguments), this.methods = new Zp(this._client), this.jobs = new Ia(this._client), this.checkpoints = new Ca(this._client), this.alpha = new wa(this._client);
  }
};
In.Methods = Zp;
In.Jobs = Ia;
In.Checkpoints = Ca;
In.Alpha = wa;
var nm = class extends k {
}, ba = class extends k {
  constructor() {
    super(...arguments), this.graderModels = new nm(this._client);
  }
};
ba.GraderModels = nm;
var rm = class extends k {
  createVariation(e, t) {
    return this._client.post("/images/variations", at({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", at({
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
}, om = class extends k {
  retrieve(e, t) {
    return this._client.get(A`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", Mt, {
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
}, sm = class extends k {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, im = class extends k {
  accept(e, t, n) {
    return this._client.post(A`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: U([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  hangup(e, t) {
    return this._client.post(A`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: U([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  refer(e, t, n) {
    return this._client.post(A`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: U([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(A`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: U([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, am = class extends k {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, ss = class extends k {
  constructor() {
    super(...arguments), this.clientSecrets = new am(this._client), this.calls = new im(this._client);
  }
};
ss.ClientSecrets = am;
ss.Calls = im;
function ZC(e, t) {
  return !t || !eI(t) ? {
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
  } : lm(e, t);
}
function lm(e, t) {
  const n = e.output.map((o) => {
    if (o.type === "function_call") return {
      ...o,
      parsed_arguments: rI(t, o)
    };
    if (o.type === "message") {
      const s = o.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: jC(t, a.text)
      } : a);
      return {
        ...o,
        content: s
      };
    }
    return o;
  }), r = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || Mi(r), Object.defineProperty(r, "output_parsed", {
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
function jC(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function eI(e) {
  return !!ua(e.text?.format);
}
function tI(e) {
  return e?.$brand === "auto-parseable-tool";
}
function nI(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function rI(e, t) {
  const n = nI(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: tI(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function Mi(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const r of n.content) r.type === "output_text" && t.push(r.text);
  e.output_text = t.join("");
}
var tn, so, It, io, Yc, Xc, Qc, Zc, oI = class um extends da {
  constructor(t) {
    super(), tn.add(this), so.set(this, void 0), It.set(this, void 0), io.set(this, void 0), O(this, so, t, "f");
  }
  static createResponse(t, n, r) {
    const o = new um(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), E(this, tn, "m", Yc).call(this);
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
    for await (const u of s) E(this, tn, "m", Xc).call(this, u, a);
    if (s.controller.signal?.aborted) throw new Ke();
    return E(this, tn, "m", Qc).call(this);
  }
  [(so = /* @__PURE__ */ new WeakMap(), It = /* @__PURE__ */ new WeakMap(), io = /* @__PURE__ */ new WeakMap(), tn = /* @__PURE__ */ new WeakSet(), Yc = function() {
    this.ended || O(this, It, void 0, "f");
  }, Xc = function(n, r) {
    if (this.ended) return;
    const o = (a, u) => {
      (r == null || u.sequence_number > r) && this._emit(a, u);
    }, s = E(this, tn, "m", Zc).call(this, n);
    switch (o("event", n), n.type) {
      case "response.output_text.delta": {
        const a = s.output[n.output_index];
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
        const a = s.output[n.output_index];
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
  }, Qc = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = E(this, It, "f");
    if (!n) throw new G("request ended without sending any events");
    O(this, It, void 0, "f");
    const r = sI(n, E(this, so, "f"));
    return O(this, io, r, "f"), r;
  }, Zc = function(n) {
    let r = E(this, It, "f");
    if (!r) {
      if (n.type !== "response.created") throw new G(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return r = O(this, It, n.response, "f"), r;
    }
    switch (n.type) {
      case "response.output_item.added":
        r.output.push(n.item);
        break;
      case "response.content_part.added": {
        const o = r.output[n.output_index];
        if (!o) throw new G(`missing output at index ${n.output_index}`);
        const s = o.type, a = n.part;
        s === "message" && a.type !== "reasoning_text" ? o.content.push(a) : s === "reasoning" && a.type === "reasoning_text" && (o.content || (o.content = []), o.content.push(a));
        break;
      }
      case "response.output_text.delta": {
        const o = r.output[n.output_index];
        if (!o) throw new G(`missing output at index ${n.output_index}`);
        if (o.type === "message") {
          const s = o.content[n.content_index];
          if (!s) throw new G(`missing content at index ${n.content_index}`);
          if (s.type !== "output_text") throw new G(`expected content to be 'output_text', got ${s.type}`);
          s.text += n.delta;
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
          const s = o.content?.[n.content_index];
          if (!s) throw new G(`missing content at index ${n.content_index}`);
          if (s.type !== "reasoning_text") throw new G(`expected content to be 'reasoning_text', got ${s.type}`);
          s.text += n.delta;
        }
        break;
      }
      case "response.completed":
        O(this, It, n.response, "f");
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
    const t = E(this, io, "f");
    if (!t) throw new G("stream ended without producing a ChatCompletion");
    return t;
  }
};
function sI(e, t) {
  return ZC(e, t);
}
var cm = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/responses/${e}/input_items`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, dm = class extends k {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, is = class extends k {
  constructor() {
    super(...arguments), this.inputItems = new cm(this._client), this.inputTokens = new dm(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && Mi(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(A`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((r) => ("object" in r && r.object === "response" && Mi(r), r));
  }
  delete(e, t) {
    return this._client.delete(A`/responses/${e}`, {
      ...t,
      headers: U([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => lm(n, e));
  }
  stream(e, t) {
    return oI.createResponse(this._client, e, t);
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
is.InputItems = cm;
is.InputTokens = dm;
var fm = class extends k {
  retrieve(e, t) {
    return this._client.get(A`/skills/${e}/content`, {
      ...t,
      headers: U([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, hm = class extends k {
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(A`/skills/${r}/versions/${e}/content`, {
      ...n,
      headers: U([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Pa = class extends k {
  constructor() {
    super(...arguments), this.content = new hm(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(A`/skills/${e}/versions`, es({
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
Pa.Content = hm;
var as = class extends k {
  constructor() {
    super(...arguments), this.content = new fm(this._client), this.versions = new Pa(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", es({
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
as.Content = fm;
as.Versions = Pa;
var pm = class extends k {
  create(e, t, n) {
    return this._client.post(A`/uploads/${e}/parts`, at({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Ra = class extends k {
  constructor() {
    super(...arguments), this.parts = new pm(this._client);
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
Ra.Parts = pm;
var iI = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((o) => o.status === "rejected");
  if (n.length) {
    for (const o of n) console.error(o.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const r = [];
  for (const o of t) o.status === "fulfilled" && r.push(o.value);
  return r;
}, mm = class extends k {
  create(e, t, n) {
    return this._client.post(A`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(A`/vector_stores/${r}/file_batches/${e}`, {
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.post(A`/vector_stores/${r}/file_batches/${e}/cancel`, {
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
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
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async poll(e, t, n) {
    const r = U([n?.headers, {
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
          await Rr(a);
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
    return await iI(Array(s).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, gm = class extends k {
  create(e, t, n) {
    return this._client.post(A`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(A`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { vector_store_id: r, ...o } = t;
    return this._client.post(A`/vector_stores/${r}/files/${e}`, {
      body: o,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/vector_stores/${e}/files`, te, {
      query: t,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.delete(A`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(e, r.id, n);
  }
  async poll(e, t, n) {
    const r = U([n?.headers, {
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
          await Rr(a);
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
    return this._client.getAPIList(A`/vector_stores/${r}/files/${e}/content`, Mt, {
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, ls = class extends k {
  constructor() {
    super(...arguments), this.files = new gm(this._client), this.fileBatches = new mm(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(A`/vector_stores/${e}`, {
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(A`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", te, {
      query: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(A`/vector_stores/${e}`, {
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(A`/vector_stores/${e}/search`, Mt, {
      body: t,
      method: "post",
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
ls.Files = gm;
ls.FileBatches = mm;
var ym = class extends k {
  create(e, t) {
    return this._client.post("/videos", at({
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
    return this._client.getAPIList("/videos", pe, {
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
    return this._client.post("/videos/characters", at({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(A`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: U([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", at({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", at({
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
    return this._client.post(A`/videos/${e}/remix`, es({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, ln, _m, To, vm = class extends k {
  constructor() {
    super(...arguments), ln.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
    return await this.verifySignature(e, t, n, r), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    E(this, ln, "m", _m).call(this, n);
    const o = U([t]).values, s = E(this, ln, "m", To).call(this, o, "webhook-signature"), a = E(this, ln, "m", To).call(this, o, "webhook-timestamp"), u = E(this, ln, "m", To).call(this, o, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new Zn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > r) throw new Zn("Webhook timestamp is too old");
    if (c > d + r) throw new Zn("Webhook timestamp is too new");
    const h = s.split(" ").map((g) => g.startsWith("v1,") ? g.substring(3) : g), f = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), p = u ? `${u}.${a}.${e}` : `${a}.${e}`, m = await crypto.subtle.importKey("raw", f, {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["verify"]);
    for (const g of h) try {
      const _ = Buffer.from(g, "base64");
      if (await crypto.subtle.verify("HMAC", m, _, new TextEncoder().encode(p))) return;
    } catch {
      continue;
    }
    throw new Zn("The given webhook signature does not match the expected signature");
  }
};
ln = /* @__PURE__ */ new WeakSet(), _m = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, To = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const r = t.get(n);
  if (r == null) throw new Error(`Missing required header: ${n}`);
  return r;
};
var Ni, xa, Eo, Am, aI = "workload-identity-auth", K = class {
  constructor({ baseURL: e = Ct("OPENAI_BASE_URL"), apiKey: t = Ct("OPENAI_API_KEY") ?? null, adminAPIKey: n = Ct("OPENAI_ADMIN_KEY") ?? null, organization: r = Ct("OPENAI_ORG_ID") ?? null, project: o = Ct("OPENAI_PROJECT_ID") ?? null, webhookSecret: s = Ct("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: a, ...u } = {}) {
    Ni.add(this), Eo.set(this, void 0), this.completions = new Kp(this), this.chat = new ha(this), this.embeddings = new Yp(this), this.files = new Qp(this), this.images = new rm(this), this.audio = new Mr(this), this.moderations = new sm(this), this.models = new om(this), this.fineTuning = new In(this), this.graders = new ba(this), this.vectorStores = new ls(this), this.webhooks = new vm(this), this.beta = new Cn(this), this.batches = new Fp(this), this.uploads = new Ra(this), this.admin = new ya(this), this.responses = new is(this), this.realtime = new ss(this), this.conversations = new Sa(this), this.evals = new Ea(this), this.containers = new Aa(this), this.skills = new as(this), this.videos = new ym(this);
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
    if (t && a) throw new G("The `apiKey` and `workloadIdentity` options are mutually exclusive");
    if (!t && !n && !a) throw new G("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, `adminAPIKey`, or set the `OPENAI_API_KEY` or `OPENAI_ADMIN_KEY` environment variable.");
    if (!c.dangerouslyAllowBrowser && sC()) throw new G(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? xa.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = Lc(c.logLevel, "ClientOptions.logLevel", this) ?? Lc(Ct("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? Fh(), O(this, Eo, cC, "f");
    const h = Ct("OPENAI_CUSTOM_HEADERS");
    if (h) {
      const f = {};
      for (const p of h.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (f[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = U([f, c.defaultHeaders]);
    }
    this._options = c, a && (this._workloadIdentityAuth = new PC(a, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = r, this.project = o, this.webhookSecret = s;
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
    return U([t.bearerAuth ? await this.bearerAuth(e) : null, t.adminAPIKeyAuth ? await this.adminAPIKeyAuth(e) : null]);
  }
  async bearerAuth(e) {
    if (this._workloadIdentityAuth) return U([{ Authorization: `Bearer ${await this._workloadIdentityAuth.getToken()}` }]);
    if (this.apiKey != null)
      return U([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  async adminAPIKeyAuth(e) {
    if (this.adminAPIKey != null)
      return U([{ Authorization: `Bearer ${this.adminAPIKey}` }]);
  }
  stringifyQuery(e) {
    return gC(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${sn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Ih()}`;
  }
  makeStatusError(e, t, n, r) {
    return ge.generate(e, t, n, r);
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
    const r = !E(this, Ni, "m", Am).call(this) && n || this.baseURL, o = tC(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), s = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!Cc(s) || !Cc(a)) && (t = {
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
    return new Yh(this, this.makeRequest(e, t, void 0));
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
    if (fe(this).debug(`[${c}] sending request`, Ft({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: s.headers
    })), r.signal?.aborted) throw new Ke();
    const f = r.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(a, s, u, p, f).catch(yi), g = Date.now();
    if (m instanceof globalThis.Error) {
      const v = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new Ke();
      const w = gi(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return fe(this).info(`[${c}] connection ${w ? "timed out" : "failed"} - ${v}`), fe(this).debug(`[${c}] connection ${w ? "timed out" : "failed"} (${v})`, Ft({
          retryOfRequestLogID: n,
          url: a,
          durationMs: g - h,
          message: m.message
        })), this.retryRequest(r, t, n ?? c);
      throw fe(this).info(`[${c}] connection ${w ? "timed out" : "failed"} - error; no more retries left`), fe(this).debug(`[${c}] connection ${w ? "timed out" : "failed"} (error; no more retries left)`, Ft({
        retryOfRequestLogID: n,
        url: a,
        durationMs: g - h,
        message: m.message
      })), m instanceof Uh || m instanceof jw ? m : w ? new sa() : new Qo({
        message: lI(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([v]) => v === "x-request-id").map(([v, w]) => ", " + v + ": " + JSON.stringify(w)).join("")}] ${s.method} ${a} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - h}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && f.bearerAuth && !r.__metadata?.hasStreamingBody && !r.__metadata?.workloadIdentityTokenRefreshed)
        return await Rc(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...r,
          __metadata: {
            ...r.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const v = await this.shouldRetry(m);
      if (t && v) {
        const x = `retrying, ${t} attempts remaining`;
        return await Rc(m.body), fe(this).info(`${_} - ${x}`), fe(this).debug(`[${c}] response error (${x})`, Ft({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - h
        })), this.retryRequest(r, t, n ?? c, m.headers);
      }
      const w = v ? "error; no more retries left" : "error; not retryable";
      fe(this).info(`${_} - ${w}`);
      const I = await m.text().catch((x) => yi(x).message), P = oC(I), M = P ? void 0 : I;
      throw fe(this).debug(`[${c}] response error (${w})`, Ft({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: M,
        durationMs: Date.now() - h
      })), this.makeStatusError(m.status, P, M, m.headers);
    }
    return fe(this).info(_), fe(this).debug(`[${c}] response start`, Ft({
      retryOfRequestLogID: n,
      url: m.url,
      status: m.status,
      headers: m.headers,
      durationMs: g - h
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
    return new CC(this, n, e);
  }
  async fetchWithAuth(e, t, n, r, o = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && o.bearerAuth) {
      const s = t.headers, a = s.get("Authorization");
      if (!a || a === `Bearer ${aI}`) {
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
    return await Rr(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: s, defaultBaseURL: a } = n, u = this.buildURL(o, s, a);
    "timeout" in n && rC("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const s = U([
      o,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...uC(),
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
    const n = U([t]), r = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, o = !r && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || r ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !o
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Bh(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...E(this, Eo, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
xa = K, Eo = /* @__PURE__ */ new WeakMap(), Ni = /* @__PURE__ */ new WeakSet(), Am = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
K.OpenAI = xa;
K.DEFAULT_TIMEOUT = 6e5;
K.OpenAIError = G;
K.APIError = ge;
K.APIConnectionError = Qo;
K.APIConnectionTimeoutError = sa;
K.APIUserAbortError = Ke;
K.NotFoundError = xh;
K.ConflictError = Mh;
K.RateLimitError = kh;
K.BadRequestError = bh;
K.AuthenticationError = Ph;
K.InternalServerError = Dh;
K.PermissionDeniedError = Rh;
K.UnprocessableEntityError = Nh;
K.InvalidWebhookSignatureError = Zn;
K.toFile = kC;
K.Completions = Kp;
K.Chat = ha;
K.Embeddings = Yp;
K.Files = Qp;
K.Images = rm;
K.Audio = Mr;
K.Moderations = sm;
K.Models = om;
K.FineTuning = In;
K.Graders = ba;
K.VectorStores = ls;
K.Webhooks = vm;
K.Beta = Cn;
K.Batches = Fp;
K.Uploads = Ra;
K.Admin = ya;
K.Responses = is;
K.Realtime = ss;
K.Conversations = Sa;
K.Evals = Ea;
K.Containers = Aa;
K.Skills = as;
K.Videos = ym;
function lI(e) {
  if (uI(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function uI(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const r = t;
    if (r.code === "UND_ERR_INVALID_ARG" && typeof r.message == "string" && r.message.includes("invalid onRequestStart method")) return !0;
    t = r.cause;
  }
  return !1;
}
function jc(e = "", t = 0) {
  let n = 0;
  for (let r = t - 1; r >= 0 && e[r] === "\\"; r -= 1) n += 1;
  return n % 2 === 1;
}
function cI(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function dI(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function fI(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function hI(e = "") {
  const t = String(e ?? "");
  let n = "", r = 0;
  for (; r < t.length; ) {
    const o = t.slice(r, r + 2), s = t.slice(r + 2, r + 6);
    if (o !== "\\u" || jc(t, r) || !cI(s)) {
      n += t[r] || "", r += 1;
      continue;
    }
    const a = r + 6, u = t.slice(a + 2, a + 6);
    if (dI(s) && t.slice(a, a + 2) === "\\u" && !jc(t, a) && fI(u)) {
      const c = Number.parseInt(s, 16), d = Number.parseInt(u, 16), h = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(h), r += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(s, 16)), r += 6;
  }
  return n;
}
function pI(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), hI(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function mI(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Ma(e = "", t = "", n = 0) {
  const r = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${mI(t)}(?:\\\\?")?\\s*:`, "i"), o = String(e || "").slice(Math.max(0, n)).match(r);
  if (!o || o.index === void 0) return null;
  const s = o[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + o.index + s,
    end: Math.max(0, n) + o.index + o[0].length
  };
}
function gI(e = "", t = [], n = 0) {
  return t.map((r) => Ma(e, r, n)).filter(Boolean).sort((r, o) => r.index - o.index)[0] || null;
}
function je(e = "", t = "", n = []) {
  const r = String(e || ""), o = Ma(r, t);
  if (!o) return;
  let s = o.end;
  for (; /\s/.test(r[s] || ""); ) s += 1;
  r[s] === '"' && (s += 1);
  const a = gI(r, n.filter((d) => d !== t), s);
  let u = a ? a.index : r.length;
  if (a) {
    const d = r.lastIndexOf(",", a.index);
    d >= s && (u = d);
  }
  let c = r.slice(s, u).trim();
  return a || (c = c.replace(/\}\s*$/, "").trimEnd()), pI(c);
}
function pt(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var lr = {
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
}, yI = [
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
function ed(e = "", t = [], n = []) {
  for (const r of t) {
    const o = je(e, r, n);
    if (o !== void 0) return o;
  }
}
function _I(e = "", t = "") {
  if (t === "Read") {
    const n = lr.Read, r = {};
    return n.forEach((o, s) => {
      const a = je(e, o, n.slice(s + 1));
      a !== void 0 && (r[o] = pt(a));
    }), r.filePath === void 0 && r.path !== void 0 && (r.filePath = r.path, delete r.path), r.filePath === void 0 && r.scope !== void 0 && (r.filePath = r.scope, delete r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "Write") {
    const n = {}, r = ed(e, ["filePath", "path"], ["content"]), o = je(e, "content", []);
    return r !== void 0 && (n.filePath = pt(r)), o !== void 0 && (n.content = pt(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, r = ed(e, ["filePath", "path"], ["edits"]), o = je(e, "edits", []);
    return r !== void 0 && (n.filePath = pt(r)), o !== void 0 && (n.edits = pt(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = lr.Grep, r = {};
    return n.forEach((o) => {
      const s = je(e, o, n.filter((a) => a !== o));
      s !== void 0 && (r[o] = pt(s));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "MemoryGrep") {
    const n = lr.MemoryGrep, r = {};
    return n.forEach((o) => {
      const s = je(e, o, n.filter((a) => a !== o));
      s !== void 0 && (r[o] = pt(s));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  if (t === "ChatHistory") {
    const n = lr.ChatHistory, r = {};
    return n.forEach((o) => {
      const s = je(e, o, n.filter((a) => a !== o));
      s !== void 0 && (r[o] = pt(s));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  return null;
}
function vI(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const a = JSON.parse(n);
    if (a && typeof a == "object" && !Array.isArray(a)) return a;
  } catch {
  }
  const r = _I(n, t);
  if (r) return r;
  const o = lr[t] || yI, s = {};
  return o.forEach((a, u) => {
    const c = je(n, a, o.slice(u + 1));
    c !== void 0 && (s[a] = pt(c));
  }), Object.keys(s).length ? s : null;
}
function AI(e = "", t = "") {
  const n = vI(e, t);
  return n ? JSON.stringify(n) : "";
}
function Sm(e) {
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
function ye(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Tm(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function Em(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : Tm(e);
  return AI(n, t) || JSON.stringify(Sm(n));
}
function SI(e = "") {
  const t = String(e || ""), n = Ma(t, "arguments");
  if (!n) return "";
  let r = n.end;
  for (; /\s/.test(t[r] || ""); ) r += 1;
  const o = t[r] || "";
  return o === "{" ? t.slice(r).replace(/\}\s*$/, "").trimEnd() : o === '"' ? t.slice(r + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(r).replace(/\}\s*$/, "").trimEnd();
}
function TI(e = "", t = 0) {
  const n = String(e || "").trim(), r = je(n, "name", ["id", "arguments"]) || je(n, "toolName", ["id", "arguments"]) || "", o = je(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, s = SI(n);
  return !r || !s ? null : {
    id: o,
    name: r,
    arguments: Em(s, r)
  };
}
function EI(e, t = 0, n = "openai-tool") {
  if (!ye(e)) return null;
  const r = ye(e.function) ? e.function : null, o = String(r?.name || "").trim();
  if (!o) return null;
  const s = be(e) || {};
  return delete s.index, s.id = String(s.id || `${n}-${t + 1}`), s.type = "function", s.function = {
    ...be(r) || {},
    name: o,
    arguments: Tm(r.arguments)
  }, s;
}
function Kt(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, r) => EI(n, r, t)).filter(Boolean);
}
function Na(e) {
  if (!ye(e)) return null;
  const t = be(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = Ot(Gt(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = Kt(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function bt(e = [], t = "openai-tool") {
  return Kt(e, t).map((n, r) => ({
    id: n.id || `${t}-${Date.now()}-${r + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function wm(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function Gt(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, r) => (Ze(t, "思考块", r), "")).trim(),
    thoughts: t
  };
}
function Ot(e = "") {
  const t = String(e || ""), n = t.search(/<tool_call\b/i);
  return n < 0 ? t.trim() : t.slice(0, n).trim();
}
function ki(e = "") {
  const t = String(e || "");
  return /<tool_call\b/i.test(t) ? [{
    id: "tagged-json-draft",
    name: t.match(/["']?name["']?\s*:\s*["']([^"']+)/i)?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }] : [];
}
function qt(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      Ze(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((r) => qt(e, r, n));
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
function Pt(e = {}, t = {}) {
  const n = [];
  return qt(n, e.reasoning_content, "推理文本"), qt(n, e.reasoning, "推理文本"), qt(n, e.reasoning_text, "推理文本"), qt(n, e.thinking, "思考块"), qt(n, t.reasoning_content, "推理文本"), qt(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((r) => {
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
function mr(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((r) => {
    [...e.matchAll(r)].forEach((o, s) => {
      try {
        const a = JSON.parse(o[1]);
        n.push({
          id: a.id || `tool-call-${s + 1}`,
          name: String(a.name || ""),
          arguments: Em(a.arguments, a.name)
        });
      } catch {
        const a = TI(o[1], s);
        a && n.push(a);
      }
    });
  }), n.filter((r) => r.name);
}
function us(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : Na(t);
}
function wI(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function CI(e) {
  if (Kt(e?.tool_calls).length > 0) return !0;
  const t = us(e);
  return Array.isArray(t?.tool_calls) && t.tool_calls.length > 0;
}
function II(e = {}) {
  const t = Kt(e?.tool_calls);
  if (t.length) return t;
  const n = Kt(us(e)?.tool_calls);
  return n.length ? n : [];
}
function bI(e = {}) {
  return Kt(e?.tool_calls).length > 0;
}
function PI(e, t, n) {
  return e?.role !== "assistant" || t <= n ? !1 : CI(e);
}
function RI(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function xI(e = "") {
  return /claude/i.test(String(e || ""));
}
function Cm(e = [], t = "") {
  if (!xI(t)) return e;
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
function td(e, t = "") {
  return !ye(e) || !RI(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var nd = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function MI(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((r) => be(r) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((r, o) => {
    const s = be(r) || {}, a = Number.isInteger(Number(r?.index)) ? Number(r.index) : o, u = n[a];
    n[a] = ye(u) ? Wt(u, s, "tool_call") : s;
  }), n.filter((r) => r !== void 0);
}
function Wt(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return be(t);
  if (t === null && nd.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return MI(e, t);
  if (typeof e == "string" && typeof t == "string")
    return nd.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : be(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(be(t) || []);
  if (ye(e) && ye(t)) {
    const r = { ...e };
    return Object.entries(t).forEach(([o, s]) => {
      r[o] = Wt(r[o], s, o);
    }), r;
  }
  return be(t);
}
function qo(e = {}, t = {}) {
  const n = ye(e) ? be(e) || {} : {}, r = ye(t) ? be(t) || {} : {};
  return delete r.message, delete r.finish_reason, delete r.index, delete r.logprobs, delete r.delta, Object.entries(r).forEach(([o, s]) => {
    n[o] = Wt(n[o], s, o);
  }), n.role || (n.role = "assistant"), Na(n) || { role: "assistant" };
}
function gr(e, t = {}) {
  const n = Na(qo(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function NI(e = {}, t = {}) {
  return ye(e) ? ye(t) ? Wt(be(e) || {}, t, "") : be(e) : be(t);
}
function Di(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], r = wI(n), o = n.map((a, u) => {
    const c = Kt(a?.tool_calls);
    if (PI(a, u, r)) {
      const h = us(a);
      if (bI(h)) return td({
        ...h,
        ...c.length ? { tool_calls: c } : {}
      }, t);
    }
    const d = {
      role: a.role,
      content: a.content
    };
    return a.role === "tool" && a.tool_call_id && (d.tool_call_id = a.tool_call_id), a.role === "assistant" && c.length && (d.tool_calls = c), td(d, t);
  }), s = String(e.systemPrompt || "").trim();
  return s && o[0]?.role !== "system" && o.unshift({
    role: "system",
    content: s
  }), Cm(o, t);
}
function rd(e) {
  const t = (e.tools || []).map((n) => [`- ${n.function.name}: ${n.function.description || ""}`.trim(), `  参数 JSON Schema: ${JSON.stringify(n.function.parameters || {})}`].join(`
`)).join(`
`);
  return [
    e.systemPrompt || "",
    "如果你需要调用工具，不要使用原生 tool calling 字段。",
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
function $i(e, t = "") {
  const n = /* @__PURE__ */ new Map(), r = [];
  return (Array.isArray(e.messages) ? e.messages : []).forEach((o) => {
    if (o.role === "assistant") {
      const s = II(o);
      if (s.length) {
        const a = us(o), u = typeof a?.content == "string" ? a.content : String(o.content || ""), c = s.map((d, h) => {
          const f = d.function?.name || "", p = d.id || `tool-call-${h + 1}`;
          return f && n.set(p, f), `<tool_call>${JSON.stringify({
            id: p,
            name: f,
            arguments: Sm(d.function?.arguments || "{}")
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
    content: rd(e)
  }) : r[0] = {
    ...r[0],
    content: rd({
      ...e,
      systemPrompt: r[0].content || e.systemPrompt
    })
  }, Cm(r, t);
}
function od(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function sd(e, t, n) {
  !e || !t || n === void 0 || (e[t] = Wt(e[t], n, t));
}
function kI(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const r = Number(n?.index ?? 0), o = { ...e.tool_calls[r] || {} };
    Object.entries(n || {}).forEach(([s, a]) => {
      if (s !== "index" && !(s === "function" && a == null)) {
        if (s === "function" && ye(a)) {
          o.function = ye(o.function) ? { ...o.function } : {}, Object.entries(a).forEach(([u, c]) => {
            o.function[u] = Wt(o.function[u], c, u);
          });
          return;
        }
        o[s] = Wt(o[s], a, s);
      }
    }), e.tool_calls[r] = o;
  }));
}
function Li(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([r, o]) => {
    r === "delta" || r === "finish_reason" || r === "index" || r === "logprobs" || sd(e, r, o);
  });
  const n = ye(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([r, o]) => {
    if (r === "tool_calls") {
      kI(e, o);
      return;
    }
    sd(e, r, o);
  });
}
function Ui(e, t = {}) {
  if (!e || !ye(t)) return;
  const n = Number(t.index ?? 0), r = e.toolCalls[n] || {
    id: "",
    type: "function",
    function: {
      name: "",
      arguments: ""
    }
  }, o = ye(t.function) ? t.function : {};
  e.toolCalls[n] = {
    ...r,
    id: t.id || r.id,
    type: t.type || r.type,
    function: {
      name: o.name || r.function?.name || "",
      arguments: `${r.function?.arguments || ""}${o.arguments || ""}`
    }
  };
}
async function DI(e, t) {
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
var $I = class {
  constructor(e) {
    this.config = e, this.client = new K({
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
      messages: t ? $i(e, this.config.model) : Di(e, this.config.model),
      ...n ? {
        tools: n,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (r.temperature = e.temperature), e.reasoning?.enabled && (r.reasoning_effort = e.reasoning.effort), r;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = {
      ...t.body || this.buildRequestBody(e),
      ...n ? { stream: !0 } : {}
    }, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
    return vr({
      provider: "openai-compatible",
      model: this.config.model,
      transport: "openai-compatible",
      url: `${o}/chat/completions`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: r,
      sdk: n ? "client.chat.completions.create(..., { stream: true })" : "client.chat.completions.create"
    });
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
      const g = await r.text().catch(() => "");
      throw new Error(g || `openai_compatible_stream_http_${r.status}`);
    }
    const o = {
      content: "",
      toolCalls: []
    }, s = { role: "assistant" };
    let a = "stop", u = this.config.model;
    await DI(r, (g) => {
      u = g?.model || u;
      const _ = g?.choices?.[0], v = _?.delta || {};
      Li(s, _), _?.finish_reason && (a = _.finish_reason), typeof v.content == "string" && (o.content += v.content), Array.isArray(v.tool_calls) && v.tool_calls.forEach((M) => {
        Ui(o, M);
      });
      const w = Gt(o.content), I = o.toolCalls.filter((M) => M?.function?.name), P = I.length ? bt(o.toolCalls) : ki(w.cleaned);
      od(e, {
        text: I.length ? w.cleaned : Ot(w.cleaned),
        thoughts: Pt(s, _).concat(w.thoughts),
        ...P.length ? { toolCalls: P } : {},
        ...!I.length && P.length ? { toolCallDraft: !0 } : {}
      });
    });
    const c = gr(s), d = bt(o.toolCalls), h = Gt(o.content), f = Pt(s, {});
    h.thoughts.forEach((g) => f.push(g));
    const p = d.length ? [] : mr(h.cleaned), m = [...d, ...p];
    return {
      text: d.length ? h.cleaned : Ot(h.cleaned),
      toolCalls: m,
      thoughts: f,
      finishReason: a,
      model: u,
      provider: "openai-compatible",
      providerPayload: c
    };
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = typeof e.onStreamProgress == "function", r = this.buildRequestBody(e), o = this.inspectRequest(e, { body: r });
    if (n) {
      if (!t) return {
        ...await this.streamNativeChatCompletions(e, r),
        requestInspection: o
      };
      const _ = await this.client.chat.completions.create({
        ...r,
        stream: !0
      }, { signal: e.signal }), v = {
        content: "",
        toolCalls: []
      }, w = { role: "assistant" };
      let I = "stop", P = this.config.model, M;
      for await (const j of _) {
        P = j.model || P;
        const ee = j.choices?.[0], Q = ee?.delta || {};
        Li(w, ee), ee?.finish_reason && (I = ee.finish_reason), typeof Q.content == "string" && (v.content += Q.content), Array.isArray(Q.tool_calls) && Q.tool_calls.forEach((Ee) => {
          Ui(v, Ee);
        });
        const X = Gt(v.content), me = v.toolCalls.filter((Ee) => Ee?.function?.name), Ge = me.length ? bt(v.toolCalls) : ki(X.cleaned);
        od(e, {
          text: me.length ? X.cleaned : Ot(X.cleaned),
          thoughts: Pt(w, ee).concat(X.thoughts),
          ...Ge.length ? { toolCalls: Ge } : {},
          ...!me.length && Ge.length ? { toolCallDraft: !0 } : {}
        });
      }
      const x = (typeof _.finalChatCompletion == "function" ? await _.finalChatCompletion() : null)?.choices?.[0] || null, C = NI(w, qo(x?.message || w, x || {}));
      M = gr(C);
      const F = bt(v.toolCalls), R = Gt(v.content), D = Pt(C, x || {});
      R.thoughts.forEach((j) => D.push(j));
      const H = F.length ? [] : mr(R.cleaned), z = [...F, ...H];
      return {
        text: F.length ? R.cleaned : Ot(R.cleaned),
        toolCalls: z,
        thoughts: D,
        finishReason: I,
        model: P,
        provider: "openai-compatible",
        providerPayload: M,
        requestInspection: o
      };
    }
    const s = await this.client.chat.completions.create(r, { signal: e.signal }), a = s.choices?.[0] || {}, u = a.message || {}, c = Pt(u, a), d = bt(u.tool_calls || []), h = Gt(wm(u.content));
    h.thoughts.forEach((_) => c.push(_));
    const f = d.length ? [] : mr(h.cleaned), p = [...d, ...f], m = d.length ? h.cleaned : Ot(h.cleaned), g = qo(u, a);
    return {
      text: m,
      toolCalls: p,
      thoughts: c,
      finishReason: a.finish_reason || "stop",
      model: s.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: gr(g),
      requestInspection: o
    };
  }
};
function Im(e, t) {
  return {
    type: "message",
    role: e,
    content: LI(t)
  };
}
function Bo(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function LI(e) {
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
function Go(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function id(e, t = [], n = {}) {
  (t || []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        Go(e, n.reasoning || "推理文本", r.text);
        return;
      }
      r.type === "summary_text" && Go(e, n.summary || "推理摘要", r.text);
    }
  });
}
function UI(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (id(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), id(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function FI(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function qI(e) {
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
function BI(e) {
  const t = e?.choices?.[0], n = t?.message?.content, r = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const o = n.toLowerCase();
  return !o.includes("proxy error") || !o.includes("/responses") && !r.toLowerCase().includes("proxy error") ? null : n.trim();
}
function GI(e) {
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
        n.content?.trim() && t.push(Bo(n.content)), n.tool_calls.forEach((r, o) => {
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
        t.push(Bo(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? Im(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function OI(e) {
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
      n.content?.trim() && t.push(Bo(n.content)), n.tool_calls.forEach((r, o) => {
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
      t.push(Bo(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? Im(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function HI(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function VI(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function JI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function qs(e, t) {
  const [n = "0", r = "0"] = String(e || "").split(":"), [o = "0", s = "0"] = String(t || "").split(":");
  return Number(n) - Number(o) || Number(r) - Number(s);
}
var KI = class {
  constructor(e) {
    this.config = e, this.client = new K({
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
      instructions: t ? void 0 : FI(e) || void 0,
      input: t ? OI(e) : GI(e),
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
      summary: "detailed"
    }), n;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = t.legacySystemInInput === !0, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
    return vr({
      provider: "openai-responses",
      model: this.config.model,
      transport: "openai-responses",
      url: `${o}/responses`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: t.body || this.buildRequestBody(e, r),
      sdk: n ? "client.responses.stream" : "client.responses.create"
    });
  }
  async chat(e) {
    let t = this.inspectRequest(e);
    const n = (c) => {
      const d = BI(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const h = Array.isArray(c.output) ? c.output : [];
      return {
        output: h,
        thoughts: UI(h),
        toolCalls: h.filter((f) => f.type === "function_call" && f.name).map((f, p) => ({
          id: f.call_id || `response-tool-${p + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: qI(c)
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
      const h = this.client.responses.stream(d, { signal: e.signal }), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), g = () => {
        const _ = [];
        Array.from(p.entries()).sort(([v], [w]) => qs(v, w)).forEach(([, v]) => Go(_, "推理文本", v)), Array.from(m.entries()).sort(([v], [w]) => qs(v, w)).forEach(([, v]) => Go(_, "推理摘要", v)), JI(e, {
          text: Array.from(f.entries()).sort(([v], [w]) => qs(v, w)).map(([, v]) => v).join(`
`).trim(),
          thoughts: _
        });
      };
      return h.on("response.output_text.delta", (_) => {
        const v = `${_.output_index}:${_.content_index}`;
        f.set(v, `${f.get(v) || ""}${_.delta}`), g();
      }), h.on("response.reasoning_text.delta", (_) => {
        const v = `${_.output_index}:${_.content_index}`;
        p.set(v, `${p.get(v) || ""}${_.delta}`), g();
      }), h.on("response.reasoning_summary_text.delta", (_) => {
        const v = `${_.output_index}:${_.summary_index}`;
        m.set(v, `${m.get(v) || ""}${_.delta}`), g();
      }), await h.finalResponse();
    }, s = !HI(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await o(!1) : await r(!1), u = n(a), s && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), u = n(a));
    } catch (c) {
      if (!s || !VI(c)) throw c;
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
async function WI(e, t) {
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
var bn = "openai", ka = "claude", Da = "makersuite", zI = "/api/backends/chat-completions/status", YI = "/api/backends/chat-completions/generate", bm = Object.freeze({
  [ka]: "https://api.anthropic.com/v1",
  [Da]: "https://generativelanguage.googleapis.com"
}), Pm = null;
function XI(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function QI(e, t) {
  const n = XI(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function ZI(e) {
  Pm = typeof e == "function" ? e : null;
}
async function Rm() {
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(Pm?.() || {}),
    Accept: "application/json"
  };
}
function jI(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : r;
  }), t;
}
async function Nr(e = {}, t = !1) {
  const n = await Rm(), r = {
    url: YI,
    method: "POST",
    headers: jI(n),
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
function e0(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function t0(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function n0() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function ad(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function ld(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => ad(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => ad(n));
}
function r0(e = "") {
  const t = String(e || ""), n = ld((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), r = ld(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), o = n || r;
  return o.length > 240 ? `${o.slice(0, 237)}...` : o;
}
function o0(e = null) {
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
function s0(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function _n(e = "", t = "", n = null) {
  if (t0(e)) return n0();
  const r = o0(n);
  if (e0(e) || /\btext\/html\b/i.test(r.contentType)) {
    const o = s0(r), s = r0(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      o ? `（${o}）` : "",
      s ? `：${s}` : ""
    ].join("");
  }
  return String(e || t || "").trim();
}
function xm(e = {}, t = bn) {
  const n = QI(e.baseUrl, t), r = String(e.apiKey || "").trim(), o = bm[t] || "", s = n || (r ? o : ""), a = { chat_completion_source: t || "openai" };
  return s && (a.reverse_proxy = s), r && (a.proxy_password = r), a;
}
function i0(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function a0(e = {}, t = bn) {
  return xm(e, t);
}
function $a(e = {}, t = {}, n = [], r = !1, o = bn) {
  return i0({
    ...xm(e, o),
    stream: !!r,
    messages: n,
    model: e.model,
    max_tokens: t.maxTokens,
    temperature: t.reasoning?.enabled ? void 0 : t.temperature,
    tools: Array.isArray(t.tools) && t.tools.length ? t.tools : void 0,
    tool_choice: Array.isArray(t.tools) && t.tools.length ? t.toolChoice || "auto" : void 0,
    use_sysprompt: o === "openai" ? void 0 : !0,
    reasoning_effort: t.reasoning?.enabled ? t.reasoning.effort : void 0,
    include_reasoning: o === "openai" ? void 0 : t.reasoning?.enabled ? !0 : void 0
  });
}
function l0(e = {}, t = {}, n = [], r = !1) {
  return $a(e, t, n, r, bn);
}
function u0(e = {}, t = {}, n = [], r = !1) {
  return $a(e, t, n, r, ka);
}
function c0(e = {}, t = {}, n = [], r = !1) {
  return $a(e, t, n, r, Da);
}
async function d0(e = {}, t = bn, n = {}) {
  const r = await fetch(zI, {
    method: "POST",
    headers: await Rm(),
    body: JSON.stringify(a0(e, t)),
    signal: n.signal
  }), o = await r.text();
  let s = null;
  try {
    s = o ? JSON.parse(o) : {};
  } catch (u) {
    throw new Error(`酒馆后端模型列表拉取失败：${_n(o, String(u?.message || u), r)}`);
  }
  if (!r.ok || s?.error) {
    const u = _n(s?.message || s?.error?.message || o, `HTTP ${r.status}`, r);
    throw new Error(`酒馆后端模型列表拉取失败：${u}`);
  }
  const a = Array.isArray(s?.data) ? s.data.map((u) => String(u?.id || u?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(a)];
}
async function La(e = {}, t = {}) {
  const n = await Nr(e, !1);
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
    throw new Error(`酒馆后端生成失败：${_n(o, String(a?.message || a), r)}`);
  }
  if (!r.ok || s?.error) {
    const a = _n(s?.error?.message || s?.message || o, `HTTP ${r.status}`, r);
    throw new Error(`酒馆后端生成失败：${a}`);
  }
  return s;
}
async function Ua(e = {}, t, n = {}) {
  const r = await Nr(e, !0);
  typeof n.onRequest == "function" && n.onRequest(r);
  const o = await fetch(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!o.ok) {
    const s = await o.text().catch(() => "");
    throw new Error(_n(s, `酒馆后端流式生成失败：HTTP ${o.status}`, o));
  }
  await WI(o, (s) => {
    if (s?.error) {
      const a = _n(s.error?.message || s.message || JSON.stringify(s.error), "酒馆后端流式生成失败");
      throw new Error(a);
    }
    t(s);
  });
}
function zt(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Mm(e = "") {
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
function f0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const r = Mm(t.function.arguments || "{}");
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
function h0(e = []) {
  const t = Array.isArray(e) ? zt(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function p0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  return t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const o = zt(r) || {}, s = h0(o?.providerPayload?.anthropicContent), a = f0(o.tool_calls);
    delete o.providerPayload, o.role === "assistant" && s && a.length ? (delete o.tool_calls, o.content = s.filter((u) => u?.type !== "tool_use").concat(a)) : o.role === "assistant" && s && (delete o.tool_calls, o.content = s), n.push(o);
  }), n;
}
function m0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const r = Mm(t.inputJson);
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
      const n = zt(t.input);
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
    } : zt(t) || null;
  }).filter(Boolean);
}
function g0(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: zt(t.input) || {}
  } : zt(t) || null).filter(Boolean);
}
function y0(e = []) {
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
function Nm(e = [], t = {}) {
  const n = m0(e), r = n.filter((o) => o.type === "tool_use" && o.name).map((o, s) => ({
    id: o.id || `st-claude-tool-${s + 1}`,
    name: o.name,
    arguments: o.invalidInputJson !== void 0 ? o.invalidInputJson : JSON.stringify(o.input || {})
  }));
  return {
    text: n.filter((o) => o.type === "text").map((o) => o.text || "").join(`
`),
    toolCalls: r,
    thoughts: n.filter((o) => o.type === "thinking" || o.type === "redacted_thinking").map((o) => ({
      label: o.type === "thinking" ? "思考块" : "已脱敏思考块",
      text: o.type === "thinking" ? o.thinking || "" : o.data || ""
    })).filter((o) => o.text),
    finishReason: t.finishReason || "stop",
    model: t.model || "",
    provider: "sillytavern-claude",
    providerPayload: n.length ? { anthropicContent: g0(n) } : void 0
  };
}
function _0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function v0(e, t = {}) {
  const n = [];
  let r = "stop", o = t.model || "";
  const s = (u, c = {}) => {
    const d = Number.isInteger(Number(u)) ? Number(u) : n.length;
    return n[d] ? n[d] = {
      ...n[d],
      ...c
    } : n[d] = { ...c }, n[d];
  }, a = () => {
    const u = y0(n);
    _0(e, {
      text: u.text,
      thoughts: u.thoughts,
      ...Array.isArray(u.toolCalls) ? { toolCalls: u.toolCalls } : {},
      ...u.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(u = {}) {
      if (u?.message?.model && (o = u.message.model), u.type === "content_block_start") {
        s(u.index, zt(u.content_block) || {}), a();
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
      return Nm(n, {
        finishReason: r,
        model: o
      });
    }
  };
}
var A0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return p0(e);
  }
  buildPayload(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildMessages(e);
    return u0(this.config, e, n, t);
  }
  async inspectRequest(e, t = {}) {
    const n = await Nr(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n);
  }
  buildRequestInspection(e) {
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: yn(e)
    };
  }
  async chat(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildPayload(e);
    let r = null;
    const o = (s) => {
      r = this.buildRequestInspection(s);
    };
    try {
      if (t) {
        const a = v0(e, this.config);
        return await Ua(n, (u) => {
          a.accept(u);
        }, {
          signal: e.signal,
          onRequest: o
        }), {
          ...a.result(),
          requestInspection: r
        };
      }
      const s = await La(n, {
        signal: e.signal,
        onRequest: o
      });
      return {
        ...Nm(Array.isArray(s?.content) ? s.content : [{
          type: "text",
          text: s?.choices?.[0]?.message?.content || ""
        }], {
          finishReason: s?.stop_reason || s?.choices?.[0]?.finish_reason || "stop",
          model: s?.model || this.config.model
        }),
        requestInspection: r
      };
    } catch (s) {
      throw r && s && typeof s == "object" && (s.requestInspection = r), s;
    }
  }
};
function Fa(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function vn(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = Fa(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function S0(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((o) => vn(o)).filter((o) => Array.isArray(o.parts) && o.parts.length);
  const n = e?.providerPayload?.googleContent, r = vn(n);
  return r.parts.length ? [r] : [];
}
function T0(e = {}) {
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
function E0(e = {}, t = 0) {
  const n = vn(e);
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
    const u = T0(a.inlineData);
    u && r.content.push(u);
  }), s.length && r.content.push({
    type: "tool_calls",
    tool_calls: s
  }), o && r.content.some((a) => a?.type === "text") && (r.signature = o), r.content.length ? r : null;
}
function w0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  return t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const o = S0(r);
    if (r.role === "assistant" && o.length) {
      o.forEach((a, u) => {
        const c = E0(a, u);
        c && n.push(c);
      });
      return;
    }
    const s = Fa(r) || {};
    delete s.providerPayload, n.push(s);
  }), n;
}
function km(e = {}) {
  return vn(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function Dm(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function $m(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function Lm(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function C0(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
function I0(e = [], t = []) {
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
function Um(e) {
  const t = vn(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function b0(e = {}, t = {}) {
  const n = km(e), r = e?.choices?.[0]?.message?.content || "";
  return {
    text: Dm(n) || r,
    toolCalls: Lm(n),
    thoughts: $m(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: Um(n)
  };
}
function P0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function R0(e, t = {}) {
  let n = "", r = [], o = [], s = "STOP", a = t.model || "";
  const u = [];
  return {
    accept(c = {}) {
      a = c.model || c.modelVersion || a, s = c?.candidates?.[0]?.finishReason || s;
      const d = km(c);
      d.parts.length && u.push(...Fa(d.parts) || []), n = C0(n, Dm(d)), r = I0(r, Lm(d));
      const h = $m(d);
      h.length && (o = h), P0(e, {
        text: n,
        thoughts: o,
        ...r.length ? {
          toolCalls: r,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const c = vn({
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
        providerPayload: Um(c)
      };
    }
  };
}
var x0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return w0(e);
  }
  buildPayload(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildMessages(e);
    return c0(this.config, e, n, t);
  }
  async inspectRequest(e, t = {}) {
    const n = await Nr(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n);
  }
  buildRequestInspection(e) {
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: yn(e)
    };
  }
  async chat(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildPayload(e);
    let r = null;
    const o = (s) => {
      r = this.buildRequestInspection(s);
    };
    try {
      if (t) {
        const s = R0(e, this.config);
        return await Ua(n, (a) => {
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
        ...b0(await La(n, {
          signal: e.signal,
          onRequest: o
        }), { model: this.config.model }),
        requestInspection: r
      };
    } catch (s) {
      throw r && s && typeof s == "object" && (s.requestInspection = r), s;
    }
  }
};
function M0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Bs(e, t = []) {
  const n = Gt(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : Ot(n.cleaned)
  };
}
function N0(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var k0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? $i(e, this.config.model) : Di(e, this.config.model);
  }
  buildPayload(e, t = !1) {
    const n = t ? $i(e, this.config.model) : Di(e, this.config.model);
    return l0(this.config, t ? {
      ...e,
      tools: void 0,
      toolChoice: void 0
    } : e, n, typeof e.onStreamProgress == "function");
  }
  async inspectRequest(e, t = {}) {
    const n = await Nr(t.payload || this.buildPayload(e, !!t.taggedMode), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n);
  }
  buildRequestInspection(e) {
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: yn(e)
    };
  }
  async streamChat(e, t, n = {}) {
    const r = {
      content: "",
      toolCalls: []
    }, o = { role: "assistant" };
    let s = "stop", a = this.config.model;
    await Ua(t, (p) => {
      a = p?.model || a;
      const m = p?.choices?.[0] || {}, g = m.delta || {};
      Li(o, m), m.finish_reason && (s = m.finish_reason), typeof g.content == "string" && (r.content += g.content), Array.isArray(g.tool_calls) && g.tool_calls.forEach((P) => {
        Ui(r, P);
      });
      const _ = r.toolCalls.filter((P) => P?.function?.name), { thinkTagged: v, cleanedText: w } = Bs(r.content, _), I = _.length ? bt(r.toolCalls, "st-openai-tool") : ki(v.cleaned);
      M0(e, {
        text: w,
        thoughts: Pt(o, m).concat(v.thoughts),
        ...I.length ? { toolCalls: I } : {},
        ...!_.length && I.length ? { toolCallDraft: !0 } : {}
      });
    }, {
      signal: e.signal,
      onRequest: n.onRequest
    });
    const u = bt(r.toolCalls, "st-openai-tool"), { thinkTagged: c, cleanedText: d } = Bs(r.content, u), h = Pt(o, {});
    c.thoughts.forEach((p) => h.push(p));
    const f = u.length ? [] : mr(c.cleaned);
    return {
      text: d,
      toolCalls: [...u, ...f],
      thoughts: h,
      finishReason: s,
      model: a,
      provider: "sillytavern-openai-compatible",
      providerPayload: gr(o)
    };
  }
  async nonStreamingChat(e, t, n = {}) {
    const r = await La(t, {
      signal: e.signal,
      onRequest: n.onRequest
    }), o = r.choices?.[0] || {}, s = o.message || {}, a = Pt(s, o), u = bt(s.tool_calls || [], "st-openai-tool"), { thinkTagged: c, cleanedText: d } = Bs(wm(s.content), u);
    c.thoughts.forEach((p) => a.push(p));
    const h = u.length ? [] : mr(c.cleaned), f = qo(s, o);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: a,
      finishReason: o.finish_reason || "stop",
      model: r.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: gr(f)
    };
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = Array.isArray(e.tools) && e.tools.length > 0, r = async (s) => {
      let a = null;
      const u = (c) => {
        a = this.buildRequestInspection(c);
      };
      try {
        return {
          ...typeof e.onStreamProgress == "function" ? await this.streamChat(e, s, { onRequest: u }) : await this.nonStreamingChat(e, s, { onRequest: u }),
          requestInspection: a
        };
      } catch (c) {
        throw a && c && typeof c == "object" && (c.requestInspection = a), c;
      }
    }, o = this.buildPayload(e, t);
    try {
      return await r(o);
    } catch (s) {
      if (t || !n || !N0(s)) throw s;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await r(this.buildPayload(e, !0));
  }
}, ud = 900 * 1e3, cd = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), Fi = Object.freeze([
  {
    value: "low",
    label: "低"
  },
  {
    value: "medium",
    label: "中"
  },
  {
    value: "high",
    label: "高"
  }
]), D0 = Object.freeze([
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
function dd(e = "") {
  return e === "anthropic" || e === "sillytavern-claude";
}
function $0(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function $e(e = "") {
  return Fi.some((t) => t.value === e) ? e : "medium";
}
function Le(e, t = 0.2) {
  const n = typeof e == "string" && !e.trim() ? t : e, r = Number(n);
  return Number.isFinite(r) ? Math.max(0, Math.min(2, r)) : Le(t, 0.2);
}
function gn(e = {}) {
  return e.sendTemperature !== !1;
}
function fd(e = {}) {
  return gn(e) ? Le(e.temperature, 0.2) : void 0;
}
function hd(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : D0.find((n) => n.value === e)?.label || e || "未配置";
}
function L0(e = {}, t = {}) {
  const n = lo(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const c = n.delegateConfig.provider || "openai-compatible", d = (n.delegateConfig.modelConfigs || un())[c] || un()[c] || {};
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: c,
      baseUrl: String(d.baseUrl || ""),
      model: String(d.model || ""),
      apiKey: String(d.apiKey || ""),
      tavilyApiKey: Gs(n.tavilyApiKey),
      tavilyBaseUrl: Je(n.tavilyBaseUrl),
      temperature: fd(d),
      sendTemperature: gn(d),
      maxTokens: dd(c) ? 32e3 : null,
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: d.toolMode || "native",
      reasoningEnabled: !!d.reasoningEnabled,
      reasoningEffort: $e(d.reasoningEffort)
    };
  }
  const r = re(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), o = n.presets?.[r] ? r : n.presets?.[n.currentPresetName] ? n.currentPresetName : Ho, s = n.presets?.[o] || Te(), a = s.provider || n.provider || "openai-compatible", u = (s.modelConfigs || n.modelConfigs || un())[a] || un()[a] || {};
  return {
    currentPresetName: String(o || ""),
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    tavilyApiKey: Gs(n.tavilyApiKey),
    tavilyBaseUrl: Je(n.tavilyBaseUrl),
    temperature: fd(u),
    sendTemperature: gn(u),
    maxTokens: dd(a) ? 32e3 : null,
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoningEnabled: !!u.reasoningEnabled,
    reasoningEffort: $e(u.reasoningEffort)
  };
}
function U0(e = {}, t = {}) {
  if (!e.apiKey && !$0(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (e.provider) {
    case "sillytavern-openai-compatible":
      return new k0(e);
    case "sillytavern-claude":
      return new A0(e);
    case "sillytavern-google":
      return new x0(e);
    case "openai-responses":
      return new KI(e);
    case "anthropic":
      return new ry(e);
    case "google":
      return new Zw(e);
    default:
      return new $I(e);
  }
}
var F0 = { chat: { exclude: [
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
] } }, q0 = Object.freeze([
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
function st(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const r = document.createElement("option");
    r.value = "", r.textContent = n, e.appendChild(r);
  }
  t.forEach((r) => {
    const o = document.createElement("option");
    o.value = r.value, o.textContent = r.label, e.appendChild(o);
  });
}
function Sr(e = []) {
  const t = [...new Set(e.filter(Boolean).map((o) => String(o).trim()).filter(Boolean))], n = F0.chat, r = t.filter((o) => {
    const s = o.toLowerCase();
    return !n.exclude.some((a) => s.includes(a));
  });
  return r.length ? r : t;
}
function ao(e = "") {
  return e === "delegate" ? "delegate" : "main";
}
function An(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function B0(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function nn(e = "") {
  return e === "openai-compatible" || e === "sillytavern-openai-compatible";
}
function qi(e = "") {
  return e === "anthropic" || e === "sillytavern-claude";
}
function G0(e = "") {
  return e === "sillytavern-claude" ? ka : e === "sillytavern-google" ? Da : bn;
}
function Tr(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function O0(e) {
  const t = An(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return Tr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return Tr([`${t}/v1/models`, `${t}/models`]);
}
function Fm(e) {
  const t = An(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return Tr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return Tr([`${t}/v1/models`, `${t}/models`]);
}
function H0(e, t) {
  const n = An(e);
  if (!n) return [];
  const r = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return Tr([
    `${n}/models?key=${encodeURIComponent(t)}`,
    `${n}/models`,
    `${r}/v1beta/models?key=${encodeURIComponent(t)}`,
    `${r}/v1beta/models`,
    `${r}/models?key=${encodeURIComponent(t)}`,
    `${r}/models`
  ]);
}
function V0(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((r) => typeof r == "string" && r.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function J0(e, t = {}) {
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
    errorSnippet: V0(o, r)
  };
}
function K0(e) {
  return Sr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function qm(e) {
  return Sr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function W0(e) {
  return Sr((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function wo({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: r }) {
  let o = null;
  for (const s of e) for (const a of t) {
    const u = await J0(s, a);
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
async function z0(e) {
  const t = String(e.apiKey || "").trim(), n = An(e.baseUrl || ""), r = An(n || bm.claude);
  if (t && r) try {
    return await wo({
      urls: Fm(r),
      requestOptionsList: [{ headers: {
        "x-api-key": t,
        "anthropic-version": "2023-06-01",
        Accept: "application/json"
      } }],
      extractModels: qm,
      providerLabel: "Anthropic"
    });
  } catch (o) {
    if (n) throw o;
  }
  return [...q0];
}
async function pd(e) {
  const t = e.provider, n = An(e.baseUrl || ""), r = String(e.apiKey || "").trim();
  if (t === "sillytavern-claude") return Sr(await z0(e));
  if (B0(t)) return Sr(await d0(e, G0(t)));
  if (!r) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await wo({
    urls: H0(n, r),
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
    extractModels: W0,
    providerLabel: "Google AI"
  }) : qi(t) ? await wo({
    urls: Fm(n),
    requestOptionsList: [{ headers: {
      "x-api-key": r,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: qm,
    providerLabel: "Anthropic"
  }) : await wo({
    urls: O0(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${r}`,
      Accept: "application/json"
    } }],
    extractModels: K0,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function Y0(e) {
  return e instanceof Error ? e.message : String(e || "unknown_error");
}
function tb(e = {}) {
  const { state: t, render: n, showToast: r, createRequestId: o = (y = "req") => `${y}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, saveConfig: s, describeError: a = Y0, getRuntimeSummaryText: u } = e;
  function c() {
    t.configFormSyncPending = !0;
  }
  function d(y, S = "main") {
    const b = String(y || "").trim() || "openai-compatible";
    return S === "delegate" ? `delegate:${b}` : b;
  }
  function h(y, S = "main") {
    return t.pullStateByProvider?.[d(y, S)] || {
      status: "idle",
      message: ""
    };
  }
  function f(y, S, b = "main") {
    t.pullStateByProvider = {
      ...t.pullStateByProvider || {},
      [d(y, b)]: S
    };
  }
  function p(y, S, b = "main") {
    t.modelOptionsByProvider = {
      ...t.modelOptionsByProvider || {},
      [d(y, b)]: Array.isArray(S) ? S : []
    };
  }
  function m(y, S = "main") {
    const b = d(y, S);
    return Array.isArray(t.modelOptionsByProvider?.[b]) ? t.modelOptionsByProvider[b] : [];
  }
  function g(y, S) {
    const b = t.config?.presets || {}, q = re(y || S || "默认");
    return b[q] ? q : S && b[S] ? S : Object.keys(b)[0] || "默认";
  }
  function _(y, S) {
    const b = g(y, Ho), q = S && typeof S == "object" ? S : Te(), W = q.provider || "openai-compatible", Z = Ue(q.modelConfigs || {}), ue = Z[W] || {};
    return {
      delegatePresetName: b,
      delegateProvider: W,
      delegateModelConfigs: Z,
      delegateBaseUrl: String(ue.baseUrl || ""),
      delegateModel: String(ue.model || ""),
      delegateApiKey: String(ue.apiKey || ""),
      delegateTemperature: Le(ue.temperature, 0.2),
      delegateSendTemperature: gn(ue),
      delegateReasoningEnabled: !!ue.reasoningEnabled,
      delegateReasoningEffort: $e(ue.reasoningEffort),
      delegateToolMode: ue.toolMode || "native"
    };
  }
  function v(y = "openai-compatible", S = {}) {
    const b = Ue(S || {})[y] || {};
    return {
      baseUrl: String(b.baseUrl || ""),
      model: String(b.model || ""),
      apiKey: String(b.apiKey || ""),
      temperature: Le(b.temperature, 0.2),
      sendTemperature: gn(b),
      reasoningEnabled: !!b.reasoningEnabled,
      reasoningEffort: $e(b.reasoningEffort),
      toolMode: b.toolMode || "native"
    };
  }
  function w(y = "openai-compatible", S = {}) {
    const b = Ue(S || {})[y] || {};
    return {
      delegateBaseUrl: String(b.baseUrl || ""),
      delegateModel: String(b.model || ""),
      delegateApiKey: String(b.apiKey || ""),
      delegateTemperature: Le(b.temperature, 0.2),
      delegateSendTemperature: gn(b),
      delegateReasoningEnabled: !!b.reasoningEnabled,
      delegateReasoningEffort: $e(b.reasoningEffort),
      delegateToolMode: b.toolMode || "native"
    };
  }
  function I(y, S, b = t.config) {
    const q = re(y || "默认"), W = S && typeof S == "object" ? S : Te(), Z = W.provider || "openai-compatible", ue = Ue(W.modelConfigs || {}), lt = v(Z, ue), ut = g(b?.delegatePresetName, q), cs = _(ut, b?.delegateConfig && typeof b.delegateConfig == "object" ? b.delegateConfig : (b?.presets || {})[ut] || W);
    return {
      currentPresetName: q,
      presetDraftName: q,
      provider: Z,
      modelConfigs: ue,
      ...lt,
      tavilyApiKey: String(b?.tavilyApiKey || ""),
      tavilyBaseUrl: Je(b?.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: cn(W.permissionMode),
      jsApiPermission: mt(b?.jsApiPermission),
      ...cs
    };
  }
  function P() {
    if (t.configDraft) return t.configDraft;
    const y = re(t.config?.currentPresetName || "默认");
    return t.configDraft = I(y, (t.config?.presets || {})[y] || Te()), t.configDraft;
  }
  function M(y) {
    const S = P(), b = y.querySelector("#xb-assistant-provider")?.value || S.provider || "openai-compatible", q = y.querySelector("#xb-assistant-delegate-provider")?.value || S.delegateProvider || "openai-compatible", W = {
      baseUrl: y.querySelector("#xb-assistant-base-url")?.value.trim() || "",
      model: y.querySelector("#xb-assistant-model")?.value.trim() || "",
      apiKey: y.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      temperature: Le(y.querySelector("#xb-assistant-temperature")?.value, S.temperature ?? 0.2),
      sendTemperature: y.querySelector("#xb-assistant-send-temperature")?.checked ?? !!(S.sendTemperature ?? !0),
      reasoningEnabled: y.querySelector("#xb-assistant-reasoning-enabled")?.checked || !1,
      reasoningEffort: $e(y.querySelector("#xb-assistant-reasoning-effort")?.value),
      toolMode: nn(b) ? y.querySelector("#xb-assistant-tool-mode")?.value || S.toolMode || "native" : void 0
    }, Z = {
      baseUrl: y.querySelector("#xb-assistant-delegate-base-url")?.value.trim() ?? S.delegateBaseUrl ?? "",
      model: y.querySelector("#xb-assistant-delegate-model")?.value.trim() ?? S.delegateModel ?? "",
      apiKey: y.querySelector("#xb-assistant-delegate-api-key")?.value.trim() ?? S.delegateApiKey ?? "",
      temperature: Le(y.querySelector("#xb-assistant-delegate-temperature")?.value, S.delegateTemperature ?? 0.2),
      sendTemperature: y.querySelector("#xb-assistant-delegate-send-temperature")?.checked ?? !!(S.delegateSendTemperature ?? !0),
      reasoningEnabled: y.querySelector("#xb-assistant-delegate-reasoning-enabled")?.checked ?? !!S.delegateReasoningEnabled,
      reasoningEffort: $e(y.querySelector("#xb-assistant-delegate-reasoning-effort")?.value || S.delegateReasoningEffort),
      toolMode: nn(q) ? y.querySelector("#xb-assistant-delegate-tool-mode")?.value || S.delegateToolMode || "native" : void 0
    }, ue = {
      ...Ue(S.modelConfigs || {}),
      [b]: {
        ...Ue(S.modelConfigs || {})[b] || {},
        ...W
      }
    }, lt = {
      ...Ue(S.delegateModelConfigs || {}),
      [q]: {
        ...Ue(S.delegateModelConfigs || {})[q] || {},
        ...Z
      }
    };
    return {
      ...S,
      currentPresetName: S.currentPresetName,
      presetDraftName: re(y.querySelector("#xb-assistant-preset-name")?.value),
      provider: b,
      modelConfigs: ue,
      baseUrl: W.baseUrl,
      model: W.model,
      apiKey: W.apiKey,
      temperature: W.temperature,
      sendTemperature: W.sendTemperature,
      reasoningEnabled: W.reasoningEnabled,
      reasoningEffort: W.reasoningEffort,
      toolMode: W.toolMode || S.toolMode || "native",
      tavilyApiKey: y.querySelector("#xb-assistant-tavily-api-key")?.value.trim() || "",
      tavilyBaseUrl: Je(S.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: cn(y.querySelector("#xb-assistant-permission-mode")?.value || S.permissionMode),
      jsApiPermission: mt(y.querySelector("#xb-assistant-jsapi-permission")?.value || S.jsApiPermission),
      delegatePresetName: g(y.querySelector("#xb-assistant-delegate-preset-select")?.value || S.delegatePresetName, S.currentPresetName),
      delegateProvider: q,
      delegateModelConfigs: lt,
      delegateBaseUrl: Z.baseUrl,
      delegateModel: Z.model,
      delegateApiKey: Z.apiKey,
      delegateTemperature: Z.temperature,
      delegateSendTemperature: Z.sendTemperature,
      delegateReasoningEnabled: Z.reasoningEnabled,
      delegateReasoningEffort: Z.reasoningEffort,
      delegateToolMode: Z.toolMode || S.delegateToolMode || "native"
    };
  }
  function x(y) {
    return t.configDraft = M(y), t.configDraft;
  }
  function C(y = P()) {
    return qi(y.provider) ? 32e3 : null;
  }
  function F(y = P()) {
    return {
      baseUrl: String(y.baseUrl || ""),
      model: String(y.model || ""),
      apiKey: String(y.apiKey || ""),
      temperature: Le(y.temperature, 0.2),
      sendTemperature: !!(y.sendTemperature ?? !0),
      reasoningEnabled: !!y.reasoningEnabled,
      reasoningEffort: $e(y.reasoningEffort),
      toolMode: nn(y.provider) ? y.toolMode || "native" : void 0
    };
  }
  function R(y = P()) {
    return {
      baseUrl: String(y.delegateBaseUrl || ""),
      model: String(y.delegateModel || ""),
      apiKey: String(y.delegateApiKey || ""),
      temperature: Le(y.delegateTemperature, 0.2),
      sendTemperature: !!(y.delegateSendTemperature ?? !0),
      reasoningEnabled: !!y.delegateReasoningEnabled,
      reasoningEffort: $e(y.delegateReasoningEffort),
      toolMode: nn(y.delegateProvider) ? y.delegateToolMode || "native" : void 0
    };
  }
  function D(y = P()) {
    const S = y.delegateProvider || "openai-compatible", b = Ue(y.delegateModelConfigs || {});
    return {
      provider: S,
      modelConfigs: {
        ...b,
        [S]: {
          ...b[S] || {},
          ...R(y)
        }
      }
    };
  }
  function H(y = P()) {
    return {
      provider: y.provider || "openai-compatible",
      baseUrl: y.baseUrl || "",
      model: y.model || "",
      apiKey: y.apiKey || "",
      tavilyApiKey: y.tavilyApiKey || "",
      tavilyBaseUrl: Je(y.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: y.sendTemperature === !1 ? void 0 : Le(y.temperature, 0.2),
      sendTemperature: !!(y.sendTemperature ?? !0),
      maxTokens: C(y),
      timeoutMs: ud,
      toolMode: y.toolMode || "native",
      reasoningEnabled: !!y.reasoningEnabled,
      reasoningEffort: $e(y.reasoningEffort)
    };
  }
  function z(y = P()) {
    return {
      provider: y.delegateProvider || "openai-compatible",
      baseUrl: y.delegateBaseUrl || "",
      model: y.delegateModel || "",
      apiKey: y.delegateApiKey || "",
      tavilyApiKey: y.tavilyApiKey || "",
      tavilyBaseUrl: Je(y.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: y.delegateSendTemperature === !1 ? void 0 : Le(y.delegateTemperature, 0.2),
      sendTemperature: !!(y.delegateSendTemperature ?? !0),
      maxTokens: qi(y.delegateProvider) ? 32e3 : null,
      timeoutMs: ud,
      toolMode: y.delegateToolMode || "native",
      reasoningEnabled: !!y.delegateReasoningEnabled,
      reasoningEffort: $e(y.delegateReasoningEffort)
    };
  }
  function j(y = {}) {
    const S = (y.role === "delegate", P());
    return y.role === "delegate" ? z(S) : H(S);
  }
  function ee(y) {
    P(), t.configDraft = {
      ...t.configDraft,
      presetDraftName: re(y.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function Q(y = P(), S = y.provider || "openai-compatible", b = "main") {
    const q = h(S, b);
    return typeof u == "function" ? u({
      state: t,
      draft: y,
      provider: S,
      pullState: q,
      providerLabel: hd(S)
    }) : `预设「${y.currentPresetName || "默认"}」 · ${hd(S)}`;
  }
  function X(y, S, b) {
    const q = y?.querySelector?.(S);
    if (!q) return;
    const W = String(b?.status || "idle"), Z = String(b?.message || "").trim();
    q.textContent = Z, q.hidden = !Z, q.classList.toggle("is-loading", W === "loading"), q.classList.toggle("is-success", W === "success"), q.classList.toggle("is-error", W === "error");
  }
  function me(y) {
    if (!y) return;
    const S = ao(t.configPage);
    t.configPage = S, y.querySelectorAll("[data-config-page]").forEach((b) => {
      const q = ao(b?.dataset?.configPage) === S;
      b.classList.toggle("is-active", q), b.setAttribute("aria-selected", q ? "true" : "false");
    }), y.querySelectorAll("[data-config-page-panel]").forEach((b) => {
      const q = ao(b?.dataset?.configPagePanel) === S;
      b.toggleAttribute("hidden", !q);
    }), y.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("hidden", S === "delegate");
  }
  function Ge(y) {
    if (!t.config) return;
    me(y);
    const S = P(), b = S.provider || "openai-compatible", q = m(b), W = S.delegateProvider || "openai-compatible", Z = m(W, "delegate"), ue = y.querySelector("#xb-assistant-tool-mode-wrap"), lt = y.querySelector("#xb-assistant-tool-mode"), ut = y.querySelector("#xb-assistant-reasoning-enabled"), cs = y.querySelector("#xb-assistant-reasoning-effort-wrap"), Ba = y.querySelector("#xb-assistant-reasoning-effort"), ds = y.querySelector("#xb-assistant-permission-mode"), fs = y.querySelector("#xb-assistant-jsapi-permission"), Ga = y.querySelector("#xb-assistant-model-pulled"), hs = y.querySelector("#xb-assistant-preset-select"), Oa = y.querySelector("#xb-assistant-preset-name"), ps = y.querySelector("#xb-assistant-delegate-preset-select"), Ha = y.querySelector("#xb-assistant-delegate-provider"), Va = y.querySelector("#xb-assistant-delegate-base-url"), Ja = y.querySelector("#xb-assistant-delegate-model"), Ka = y.querySelector("#xb-assistant-delegate-api-key"), Wa = y.querySelector("#xb-assistant-tavily-api-key"), ms = y.querySelector("#xb-assistant-delegate-model-pulled"), za = y.querySelector("#xb-assistant-delegate-tool-mode-wrap"), gs = y.querySelector("#xb-assistant-delegate-tool-mode"), Ya = y.querySelector("#xb-assistant-delegate-reasoning-enabled"), Xa = y.querySelector("#xb-assistant-delegate-reasoning-effort-wrap"), ys = y.querySelector("#xb-assistant-delegate-reasoning-effort");
    if (!hs || !Oa) return;
    const Qa = (t.config.presetNames || []).map((Oe) => ({
      value: Oe,
      label: Oe
    }));
    st(hs, Qa), hs.value = S.currentPresetName || t.config.currentPresetName || "默认", ps && (st(ps, Qa), ps.value = g(S.delegatePresetName, S.currentPresetName)), Oa.value = S.presetDraftName || S.currentPresetName || "默认", y.querySelector("#xb-assistant-provider").value = b, y.querySelector("#xb-assistant-base-url").value = S.baseUrl || "", y.querySelector("#xb-assistant-model").value = S.model || "", y.querySelector("#xb-assistant-api-key").value = S.apiKey || "", y.querySelector("#xb-assistant-temperature").value = String(Le(S.temperature, 0.2)), y.querySelector("#xb-assistant-send-temperature").checked = !!(S.sendTemperature ?? !0), Wa && (Wa.value = S.tavilyApiKey || ""), ue.style.display = nn(b) ? "" : "none", st(lt, cd), lt.value = S.toolMode || "native", ds && (st(ds, jm), ds.value = cn(S.permissionMode)), fs && (st(fs, eg), fs.value = mt(S.jsApiPermission)), st(Ba, Fi), ut.checked = !!S.reasoningEnabled, Ba.value = $e(S.reasoningEffort), cs.style.display = ut.checked ? "" : "none", st(Ga, q.map((Oe) => ({
      value: Oe,
      label: Oe
    })), "手动填写"), Ga.value = q.includes(S.model) ? S.model : "", Ha && (Ha.value = W), Va && (Va.value = S.delegateBaseUrl || ""), Ja && (Ja.value = S.delegateModel || ""), Ka && (Ka.value = S.delegateApiKey || "");
    const Za = y.querySelector("#xb-assistant-delegate-temperature"), ja = y.querySelector("#xb-assistant-delegate-send-temperature");
    Za && (Za.value = String(Le(S.delegateTemperature, 0.2))), ja && (ja.checked = !!(S.delegateSendTemperature ?? !0)), za && (za.style.display = nn(W) ? "" : "none"), gs && (st(gs, cd), gs.value = S.delegateToolMode || "native"), ys && (st(ys, Fi), ys.value = $e(S.delegateReasoningEffort)), Ya && (Ya.checked = !!S.delegateReasoningEnabled), Xa && (Xa.style.display = S.delegateReasoningEnabled ? "" : "none"), ms && (st(ms, Z.map((Oe) => ({
      value: Oe,
      label: Oe
    })), "手动填写"), ms.value = Z.includes(S.delegateModel) ? S.delegateModel : ""), X(y, "#xb-assistant-model-pull-status", h(b)), X(y, "#xb-assistant-delegate-model-pull-status", h(W, "delegate"));
    const el = y.querySelector("#xb-assistant-runtime");
    if (el) {
      const Oe = t.configPage === "delegate";
      el.textContent = Q(Oe ? {
        ...S,
        currentPresetName: "分身",
        provider: W
      } : S, Oe ? W : b, Oe ? "delegate" : "main");
    }
  }
  function Ee(y) {
    if (typeof s != "function") return;
    const S = s(y);
    S && typeof S.catch == "function" && S.catch((b) => {
      r?.(a(b));
    });
  }
  function _e(y, S, b) {
    y.querySelector(S)?.addEventListener("click", () => {
      const q = y.querySelector(b);
      q && (q.type = q.type === "password" ? "text" : "password");
    });
  }
  function Xt(y) {
    return {
      workspaceFileName: y?.workspaceFileName || "",
      jsApiPermission: mt(y?.jsApiPermission),
      tavilyApiKey: String(y?.tavilyApiKey || ""),
      tavilyBaseUrl: Je(y?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: y?.currentPresetName || "默认",
      delegatePresetName: y?.delegatePresetName || y?.currentPresetName || "默认",
      delegateConfig: y?.delegateConfig || {},
      delegateConfigured: y?.delegateConfigured === !0,
      presets: y?.presets || {}
    };
  }
  function kr(y, S = {}) {
    const b = x(y), q = re(S.presetName || b.presetDraftName), W = re(b.currentPresetName || t.config?.currentPresetName || "默认"), Z = (t.config?.presets || {})[W] || Te(), ue = Ue(b.modelConfigs || Z.modelConfigs || {}), lt = {
      ...Z,
      provider: b.provider,
      permissionMode: cn(b.permissionMode),
      modelConfigs: {
        ...ue,
        [b.provider]: {
          ...ue[b.provider] || {},
          ...F(b)
        }
      }
    }, ut = { ...t.config?.presets || {} };
    S.renameCurrentPreset && q !== W && delete ut[W], ut[q] = lt, t.config = lo({
      ...t.config,
      jsApiPermission: mt(b.jsApiPermission),
      tavilyApiKey: String(b.tavilyApiKey || ""),
      tavilyBaseUrl: Je(b.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: q,
      delegatePresetName: g(b.delegatePresetName, q),
      delegateConfig: D(b),
      delegateConfigured: S.configureDelegate === !0 || t.config?.delegateConfigured === !0,
      presets: ut
    }), t.configDraft = I(q, lt, t.config), c(), Ee({
      requestId: o(S.requestPrefix || "save-config"),
      config: t.config,
      payload: Xt(t.config)
    });
  }
  function qa(y, S = "") {
    const b = re(S || "默认"), q = typeof window < "u" && typeof window.prompt == "function" ? window.prompt(y, b) : b;
    return q === null ? "" : re(q);
  }
  function Bm(y) {
    const S = qa("输入新预设名称：", `${x(y).currentPresetName || "默认"} 副本`);
    if (!S) {
      r?.("预设名称不能为空");
      return;
    }
    y.querySelector("#xb-assistant-preset-name").value = S, kr(y, {
      presetName: S,
      requestPrefix: "create-preset"
    });
  }
  function Gm(y) {
    const S = x(y), b = re(S.currentPresetName || t.config?.currentPresetName || "默认"), q = qa("输入预设名称：", S.presetDraftName || b);
    if (!q) {
      r?.("预设名称不能为空");
      return;
    }
    q !== b && (y.querySelector("#xb-assistant-preset-name").value = q, kr(y, {
      presetName: q,
      renameCurrentPreset: !0,
      requestPrefix: "rename-preset"
    }));
  }
  function Om(y) {
    if (Object.keys(t.config?.presets || {}).length <= 1) {
      r?.("至少要保留一套预设");
      return;
    }
    const S = x(y), b = re(t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), q = { ...t.config?.presets || {} };
    delete q[b];
    const W = Object.keys(q)[0] || "默认", Z = q[W] || Te();
    t.config = lo({
      ...t.config,
      jsApiPermission: mt(S.jsApiPermission),
      tavilyApiKey: String(S.tavilyApiKey || t.config?.tavilyApiKey || ""),
      tavilyBaseUrl: Je(S.tavilyBaseUrl || t.config?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: W,
      delegatePresetName: g(S.delegatePresetName, W),
      delegateConfig: D(S),
      presets: q
    }), t.configDraft = I(W, Z, t.config), c(), Ee({
      requestId: o("delete-preset"),
      config: t.config,
      payload: Xt(t.config)
    }), n?.();
  }
  function Hm(y) {
    y?.querySelector?.("#xb-assistant-provider") && (y.querySelector("#xb-assistant-provider").addEventListener("change", (S) => {
      const b = S.currentTarget.value, q = x(y);
      t.configDraft = {
        ...q,
        provider: b,
        ...v(b, q.modelConfigs)
      }, c(), n?.();
    }), y.querySelector("#xb-assistant-preset-select").addEventListener("change", (S) => {
      const b = re(S.currentTarget.value), q = (t.config?.presets || {})[b] || Te(), W = x(y);
      t.config = lo({
        ...t.config,
        jsApiPermission: mt(W.jsApiPermission),
        currentPresetName: b,
        delegatePresetName: g(W.delegatePresetName, b),
        delegateConfig: D(W)
      }), t.configDraft = I(b, q, t.config), c(), n?.();
    }), y.querySelector("#xb-assistant-preset-name")?.addEventListener("input", () => {
      ee(y);
    }), y.querySelector("#xb-assistant-base-url").addEventListener("input", () => {
      x(y);
    }), y.querySelector("#xb-assistant-model").addEventListener("input", () => {
      x(y);
    }), y.querySelector("#xb-assistant-api-key").addEventListener("input", () => {
      x(y);
    }), y.querySelector("#xb-assistant-temperature")?.addEventListener("input", () => {
      x(y);
    }), y.querySelector("#xb-assistant-send-temperature")?.addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-tavily-api-key")?.addEventListener("input", () => {
      x(y);
    }), y.querySelector("#xb-assistant-model-pulled").addEventListener("change", (S) => {
      const b = S.currentTarget.value;
      b && (y.querySelector("#xb-assistant-model").value = b, x(y));
    }), _e(y, "#xb-assistant-toggle-key", "#xb-assistant-api-key"), _e(y, "#xb-assistant-toggle-tavily-key", "#xb-assistant-tavily-api-key"), y.querySelector("#xb-assistant-delegate-provider")?.addEventListener("change", (S) => {
      const b = x(y), q = S.currentTarget.value;
      t.configDraft = {
        ...b,
        delegateProvider: q,
        ...w(q, b.delegateModelConfigs)
      }, c(), n?.();
    }), y.querySelector("#xb-assistant-delegate-base-url")?.addEventListener("input", () => {
      x(y);
    }), y.querySelector("#xb-assistant-delegate-model")?.addEventListener("input", () => {
      x(y);
    }), y.querySelector("#xb-assistant-delegate-api-key")?.addEventListener("input", () => {
      x(y);
    }), y.querySelector("#xb-assistant-delegate-temperature")?.addEventListener("input", () => {
      x(y);
    }), y.querySelector("#xb-assistant-delegate-send-temperature")?.addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-delegate-model-pulled")?.addEventListener("change", (S) => {
      const b = S.currentTarget.value;
      if (!b) return;
      const q = y.querySelector("#xb-assistant-delegate-model");
      q && (q.value = b), x(y);
    }), _e(y, "#xb-assistant-delegate-toggle-key", "#xb-assistant-delegate-api-key"), y.querySelector("#xb-assistant-reasoning-enabled").addEventListener("change", () => {
      x(y), c(), n?.();
    }), y.querySelector("#xb-assistant-reasoning-effort").addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-tool-mode").addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-delegate-reasoning-enabled")?.addEventListener("change", () => {
      x(y), c(), n?.();
    }), y.querySelector("#xb-assistant-delegate-reasoning-effort")?.addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-delegate-tool-mode")?.addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-permission-mode")?.addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-jsapi-permission")?.addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-delegate-preset-select")?.addEventListener("change", (S) => {
      const b = g(S.currentTarget?.value, t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), q = (t.config?.presets || {})[b] || Te();
      t.configDraft = {
        ...x(y),
        ..._(b, q)
      }, c(), n?.();
    }), y.querySelectorAll("[data-config-page]").forEach((S) => {
      S.addEventListener("click", (b) => {
        x(y), t.configPage = ao(b.currentTarget?.dataset?.configPage), me(y), Ge(y);
      });
    }), y.querySelector("#xb-assistant-pull-models").addEventListener("click", async () => {
      x(y), c();
      const S = j();
      f(S.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), n?.();
      try {
        const b = await pd(S);
        p(S.provider, b), f(S.provider, {
          status: "success",
          message: `已拉取 ${b.length} 个模型`
        });
      } catch (b) {
        p(S.provider, []), f(S.provider, {
          status: "error",
          message: a(b)
        });
      }
      c(), n?.();
    }), y.querySelector("#xb-assistant-delegate-pull-models")?.addEventListener("click", async () => {
      x(y), c();
      const S = j({ role: "delegate" });
      f(S.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }, "delegate"), n?.();
      try {
        const b = await pd(S);
        p(S.provider, b, "delegate"), f(S.provider, {
          status: "success",
          message: `已拉取 ${b.length} 个模型`
        }, "delegate");
      } catch (b) {
        p(S.provider, [], "delegate"), f(S.provider, {
          status: "error",
          message: a(b)
        }, "delegate");
      }
      c(), n?.();
    }), y.querySelector("#xb-assistant-new-preset")?.addEventListener("click", () => {
      Bm(y);
    }), y.querySelector("#xb-assistant-rename-preset")?.addEventListener("click", () => {
      Gm(y);
    }), y.querySelector("#xb-assistant-save").addEventListener("click", () => {
      kr(y);
    }), y.querySelector("#xb-assistant-delegate-save")?.addEventListener("click", () => {
      kr(y, {
        requestPrefix: "save-delegate-config",
        configureDelegate: !0
      });
    }), y.querySelector("#xb-assistant-delete-preset").addEventListener("click", () => {
      Om(y);
    }));
  }
  return {
    getActiveProviderConfig: j,
    syncConfigToForm: Ge,
    bindSettingsPanelEvents: Hm
  };
}
function Co(e = "") {
  return String(e || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Kn(e) {
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
function X0(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? "saving" : t === "success" ? "success" : t === "error" ? "error" : "save";
}
function Q0(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? {
    className: "xb-assistant-save-button is-saving",
    title: "正在保存配置"
  } : t === "success" ? {
    className: "xb-assistant-save-button is-success",
    title: "配置已保存"
  } : t === "error" ? {
    className: "xb-assistant-save-button is-error",
    title: Co(e?.error || "保存失败")
  } : {
    className: "xb-assistant-save-button",
    title: "保存配置"
  };
}
function nb(e = {}) {
  const { configSave: t = {}, runtimeText: n = "", inlineToastText: r = "", showInlineToast: o = !0, showAssistantPermissions: s = !0, showDelegateSettings: a = !0, activePage: u = "main", delegatePresetHint: c = "DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。", isBusy: d = !1, canDeletePreset: h = !0 } = e, f = Q0(t), p = X0(t), m = d || String(t?.status || "") === "saving" ? "disabled" : "", g = d || !h ? "disabled" : "", _ = u === "delegate" ? "delegate" : "main", v = _ === "main", w = _ === "delegate", I = s ? `
            <label>
                <span>斜杠命令权限</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>
            <label>
                <span>JavaScript API 权限</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>` : "", P = a ? `
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${v ? "is-active" : ""}" data-config-page="main" role="tab" aria-selected="${v ? "true" : "false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${w ? "is-active" : ""}" data-config-page="delegate" role="tab" aria-selected="${w ? "true" : "false"}">分身 API</button>
            </div>` : "", M = a ? `
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${w ? "" : "hidden"}>
                <p class="xb-assistant-config-note">${Co(c)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${f.className}" title="${f.title}" aria-label="${f.title}" ${m}>${Kn(p)}</button>
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
                        Reasoning参数
                        <small>需 API 支持，否则报错</small>
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
            </div>` : "";
  return `
        <section class="xb-assistant-config">
            ${P}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${v ? "" : "hidden"}>
            <div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${d ? "disabled" : ""}>${Kn("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${d ? "disabled" : ""}>${Kn("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${f.className}" title="${f.title}" aria-label="${f.title}" ${m}>${Kn(p)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${g}>${Kn("delete")}</button>
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
            ${I}
            <label class="xb-assistant-checkbox-row">
                <span>
                    Reasoning参数
                    <small>需 API 支持，否则报错</small>
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
            </div>
            ${M}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${Co(n)}</div>
            ${o ? `<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${Co(r)}</div>` : ""}
        </section>
    `;
}
var Z0 = [
  "你是小白X“四次元壁”的交流生成器。",
  "只完成本轮四次元壁回复，不调用工具，不编造外部事实。",
  "严格遵循后续提示词里的输出格式，优先输出可被解析的 <thinking> 与 <msg> 内容。"
].join(`
`);
function j0(e = {}) {
  return {
    msg1: String(e.msg1 || "").trim(),
    msg2: String(e.msg2 || "").trim(),
    msg3: String(e.msg3 || "").trim(),
    msg4: String(e.msg4 || "").trim()
  };
}
function eb(e = {}, t = {}) {
  const { msg1: n, msg2: r, msg3: o, msg4: s } = j0(e);
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
function rb(e = {}) {
  ZI(typeof e.requestHeadersProvider == "function" ? e.requestHeadersProvider : null);
}
async function ob(e = {}) {
  const t = L0(rg(e.config || {})), n = U0(t, { missingApiKeyMessage: "请先在小白agent的 API配置 里填写当前预设的 API Key。" }), r = !!e.stream && typeof e.onStreamProgress == "function", o = await n.chat({
    systemPrompt: Z0,
    messages: eb(e.builtPrompt || {}, { disableAssistantPrefill: !!e.disableAssistantPrefill }),
    tools: [],
    temperature: t.temperature,
    maxTokens: t.maxTokens,
    reasoning: {
      enabled: t.reasoningEnabled,
      effort: t.reasoningEffort
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
  nb as buildAgentSettingsPanelMarkup,
  rb as configureFourthWallAgent,
  tb as createAgentSettingsPanel,
  ob as generateFourthWallResponse,
  lo as normalizeAgentConfig
};
