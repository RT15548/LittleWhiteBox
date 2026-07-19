var Bm = Object.create, fd = Object.defineProperty, Gm = Object.getOwnPropertyDescriptor, Om = Object.getOwnPropertyNames, Hm = Object.getPrototypeOf, Vm = Object.prototype.hasOwnProperty, Oo = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), Jm = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var o = Om(t), s = 0, a = o.length, c; s < a; s++)
      c = o[s], !Vm.call(e, c) && c !== n && fd(e, c, {
        get: ((u) => t[u]).bind(null, c),
        enumerable: !(r = Gm(t, c)) || r.enumerable
      });
  return e;
}, Km = (e, t, n) => (n = e != null ? Bm(Hm(e)) : {}, Jm(t || !e || !e.__esModule ? fd(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), Wm = "https://api.tavily.com";
function Bs(e = "") {
  return String(e || "").trim();
}
function Je(e = "") {
  return String(e || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var hd = "openai-compatible", qi = "默认", pd = "default", zm = "deny", Ym = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), Xm = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), Gs = {
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
  return JSON.parse(JSON.stringify(Gs));
}
function we() {
  return {
    provider: hd,
    modelConfigs: un(),
    permissionMode: pd
  };
}
function Qm(e = we()) {
  const t = e && typeof e == "object" ? e : we();
  return {
    provider: Bi(t.provider),
    modelConfigs: Ue(t.modelConfigs || {})
  };
}
function cn(e) {
  return e === "full" ? "full" : pd;
}
function mt(e) {
  return e === "allow" ? "allow" : zm;
}
function re(e) {
  return String(e || "").trim() || "默认";
}
function Ue(e = {}) {
  const t = un();
  return Object.keys(Gs).forEach((n) => {
    t[n] = {
      ...Gs[n],
      ...e && typeof e[n] == "object" ? e[n] : {}
    };
  }), t;
}
function Bi(e) {
  return typeof e == "string" && e.trim() ? e : hd;
}
function Gi(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function md(e = {}, t) {
  const n = {}, r = Gi(e, t);
  return Object.entries(r).forEach(([o, s]) => {
    if (!s || typeof s != "object") return;
    const a = re(o);
    n[a] = {
      provider: Bi(s.provider),
      modelConfigs: Ue(s.modelConfigs || {}),
      permissionMode: cn(s.permissionMode)
    };
  }), Object.keys(n).length || (n[qi] = we()), n;
}
function gd(e, t) {
  const n = re(t);
  return e[n] ? n : Object.keys(e)[0];
}
function yd(e, t, n) {
  const r = re(t || n);
  return e[r] ? r : e[n] ? n : Object.keys(e)[0];
}
function _d(e = {}, t = we()) {
  const n = Qm(t), r = e && typeof e == "object" ? e : {};
  return {
    provider: Bi(r.provider || n.provider),
    modelConfigs: Ue(r.modelConfigs || n.modelConfigs)
  };
}
function Zm(e = {}, t, n, r, o) {
  const s = o(e?.[r]);
  if (s) return s;
  const a = Gi(e, t), c = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(a || {})
  ].map(re), u = /* @__PURE__ */ new Set();
  for (const d of c) {
    if (u.has(d)) continue;
    u.add(d);
    const h = o(a?.[d]?.[r]);
    if (h) return h;
  }
  return o(e?.delegateConfig?.[r]);
}
function jm(e = {}, t, n) {
  const r = (c) => String(c || "").trim();
  if (r(e?.tavilyBaseUrl)) return Je(e.tavilyBaseUrl);
  const o = Gi(e, t), s = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(o || {})
  ].map(re), a = /* @__PURE__ */ new Set();
  for (const c of s) {
    if (a.has(c)) continue;
    a.add(c);
    const u = o?.[c]?.tavilyBaseUrl;
    if (r(u)) return Je(u);
  }
  return r(e?.delegateConfig?.tavilyBaseUrl) ? Je(e.delegateConfig.tavilyBaseUrl) : Wm;
}
function vd(e = {}, t, n) {
  return {
    tavilyApiKey: Zm(e, t, n, "tavilyApiKey", Bs),
    tavilyBaseUrl: jm(e, t, n)
  };
}
function eg(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: r = (f) => String(f || "") } = t, o = re(e.currentPresetName || e.presetName || "默认"), s = md(e, o), a = gd(s, e.currentPresetName), c = yd(s, e.delegatePresetName, a), u = s[c] || s[a] || we(), d = _d(e.delegateConfig, u), h = vd(e, o, a);
  return {
    enabled: !!e.enabled,
    workspaceFileName: r(e.workspaceFileName || n),
    jsApiPermission: mt(e.jsApiPermission),
    currentPresetName: a,
    delegatePresetName: c,
    delegateConfig: d,
    presets: s,
    tavilyApiKey: h.tavilyApiKey,
    tavilyBaseUrl: h.tavilyBaseUrl,
    updatedAt: Number(e.updatedAt) || 0,
    configVersion: Number(e.configVersion) || 0
  };
}
function lo(e = {}) {
  const t = re(e.currentPresetName || e.presetDraftName || "默认"), n = md(e, t), r = gd(n, e.currentPresetName), o = yd(n, e.delegatePresetName, r), s = n[r] || we(), a = n[o] || s, c = _d(e.delegateConfig, a), u = vd(e, t, r);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    jsApiPermission: mt(e.jsApiPermission),
    currentPresetName: r,
    delegatePresetName: o,
    delegateConfig: c,
    presetDraftName: re(e.presetDraftName || r),
    presetNames: Object.keys(n),
    presets: n,
    provider: s.provider,
    modelConfigs: s.modelConfigs,
    permissionMode: cn(s.permissionMode),
    tavilyApiKey: u.tavilyApiKey,
    tavilyBaseUrl: u.tavilyBaseUrl
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
var Ad = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Ad = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function yr(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Os = (e) => {
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
}, Fe = class Hs extends V {
  constructor(t, n, r, o, s) {
    super(`${Hs.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("request-id"), this.error = n, this.type = s ?? null;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Ho({
      message: r,
      cause: Os(n)
    });
    const s = n, a = s?.error?.type;
    return t === 400 ? new Td(t, s, r, o, a) : t === 401 ? new Ed(t, s, r, o, a) : t === 403 ? new wd(t, s, r, o, a) : t === 404 ? new Cd(t, s, r, o, a) : t === 409 ? new Id(t, s, r, o, a) : t === 422 ? new bd(t, s, r, o, a) : t === 429 ? new Pd(t, s, r, o, a) : t >= 500 ? new Rd(t, s, r, o, a) : new Hs(t, s, r, o, a);
  }
}, et = class extends Fe {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Ho = class extends Fe {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Sd = class extends Ho {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Td = class extends Fe {
}, Ed = class extends Fe {
}, wd = class extends Fe {
}, Cd = class extends Fe {
}, Id = class extends Fe {
}, bd = class extends Fe {
}, Pd = class extends Fe {
}, Rd = class extends Fe {
}, tg = /^[a-z][a-z0-9+.-]*:/i, ng = (e) => tg.test(e), Vs = (e) => (Vs = Array.isArray, Vs(e)), el = Vs;
function Js(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function tl(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function rg(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var og = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new V(`${e} must be an integer`);
  if (t < 0) throw new V(`${e} must be a positive integer`);
  return t;
}, xd = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, sg = (e) => new Promise((t) => setTimeout(t, e)), rn = "0.91.1", ig = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function ag() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var lg = () => {
  const e = ag();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": rn,
    "X-Stainless-OS": rl(Deno.build.os),
    "X-Stainless-Arch": nl(Deno.build.arch),
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
    "X-Stainless-OS": rl(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": nl(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = ug();
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
function ug() {
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
var nl = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", rl = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), ol, cg = () => ol ?? (ol = lg());
function dg() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Md(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Nd(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Md({
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
function Oi(e) {
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
async function fg(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var hg = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function pg(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new V(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function mg(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var sl;
function Hi(e) {
  let t;
  return (sl ?? (t = new globalThis.TextEncoder(), sl = t.encode.bind(t)))(e);
}
var il;
function al(e) {
  let t;
  return (il ?? (t = new globalThis.TextDecoder(), il = t.decode.bind(t)))(e);
}
var xe, Me, Er = class {
  constructor() {
    xe.set(this, void 0), Me.set(this, void 0), L(this, xe, new Uint8Array(), "f"), L(this, Me, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Hi(e) : e;
    L(this, xe, mg([T(this, xe, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = gg(T(this, xe, "f"), T(this, Me, "f"))) != null; ) {
      if (r.carriage && T(this, Me, "f") == null) {
        L(this, Me, r.index, "f");
        continue;
      }
      if (T(this, Me, "f") != null && (r.index !== T(this, Me, "f") + 1 || r.carriage)) {
        n.push(al(T(this, xe, "f").subarray(0, T(this, Me, "f") - 1))), L(this, xe, T(this, xe, "f").subarray(T(this, Me, "f")), "f"), L(this, Me, null, "f");
        continue;
      }
      const o = T(this, Me, "f") !== null ? r.preceding - 1 : r.preceding, s = al(T(this, xe, "f").subarray(0, o));
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
function gg(e, t) {
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
function yg(e) {
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
}, ll = (e, t, n) => {
  if (e) {
    if (rg(Io, e)) return e;
    Ae(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Io))}`);
  }
};
function Wn() {
}
function Dr(e, t, n) {
  return !t || Io[e] > Io[n] ? Wn : t[e].bind(t);
}
var _g = {
  error: Wn,
  warn: Wn,
  info: Wn,
  debug: Wn
}, ul = /* @__PURE__ */ new WeakMap();
function Ae(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return _g;
  const r = ul.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: Dr("error", t, n),
    warn: Dr("warn", t, n),
    info: Dr("info", t, n),
    debug: Dr("debug", t, n)
  };
  return ul.set(t, [n, o]), o;
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
      let c = !1;
      try {
        for await (const u of vg(t, n)) {
          if (u.event === "completion") try {
            yield JSON.parse(u.data);
          } catch (d) {
            throw s.error("Could not parse message into JSON:", u.data), s.error("From chunk:", u.raw), d;
          }
          if (u.event === "message_start" || u.event === "message_delta" || u.event === "message_stop" || u.event === "content_block_start" || u.event === "content_block_delta" || u.event === "content_block_stop" || u.event === "message" || u.event === "user.message" || u.event === "user.interrupt" || u.event === "user.tool_confirmation" || u.event === "user.custom_tool_result" || u.event === "agent.message" || u.event === "agent.thinking" || u.event === "agent.tool_use" || u.event === "agent.tool_result" || u.event === "agent.mcp_tool_use" || u.event === "agent.mcp_tool_result" || u.event === "agent.custom_tool_use" || u.event === "agent.thread_context_compacted" || u.event === "session.status_running" || u.event === "session.status_idle" || u.event === "session.status_rescheduled" || u.event === "session.status_terminated" || u.event === "session.error" || u.event === "session.deleted" || u.event === "span.model_request_start" || u.event === "span.model_request_end") try {
            yield JSON.parse(u.data);
          } catch (d) {
            throw s.error("Could not parse message into JSON:", u.data), s.error("From chunk:", u.raw), d;
          }
          if (u.event !== "ping" && u.event === "error") {
            const d = xd(u.data) ?? u.data, h = d?.error?.type;
            throw new Fe(void 0, d, void 0, t.headers, h);
          }
        }
        c = !0;
      } catch (u) {
        if (yr(u)) return;
        throw u;
      } finally {
        c || n.abort();
      }
    }
    return new zn(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* s() {
      const c = new Er(), u = Oi(t);
      for await (const d of u) for (const h of c.decode(d)) yield h;
      for (const d of c.flush()) yield d;
    }
    async function* a() {
      if (o) throw new V("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let c = !1;
      try {
        for await (const u of s())
          c || u && (yield JSON.parse(u));
        c = !0;
      } catch (u) {
        if (yr(u)) return;
        throw u;
      } finally {
        c || n.abort();
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
    return Md({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: s } = await n.next();
          if (s) return r.close();
          const a = Hi(JSON.stringify(o) + `
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
async function* vg(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new V("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new V("Attempted to iterate over a response with no body");
  const n = new Sg(), r = new Er(), o = Oi(e.body);
  for await (const s of Ag(o)) for (const a of r.decode(s)) {
    const c = n.decode(a);
    c && (yield c);
  }
  for (const s of r.flush()) {
    const a = n.decode(s);
    a && (yield a);
  }
}
async function* Ag(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Hi(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let s;
    for (; (s = yg(t)) !== -1; )
      yield t.slice(0, s), t = t.slice(s);
  }
  t.length > 0 && (yield t);
}
var Sg = class {
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
    let [t, n, r] = Tg(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function Tg(e, t) {
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
async function kd(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: s } = t, a = await (async () => {
    if (t.options.stream)
      return Ae(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : _r.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type")?.split(";")[0]?.trim();
    return c?.includes("application/json") || c?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Dd(await n.json(), n) : await n.text();
  })();
  return Ae(e).debug(`[${r}] response parsed`, Lt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - s
  })), a;
}
function Dd(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var Yn, $d = class Ld extends Promise {
  constructor(t, n, r = kd) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, Yn.set(this, void 0), L(this, Yn, t, "f");
  }
  _thenUnwrap(t) {
    return new Ld(T(this, Yn, "f"), this.responsePromise, async (n, r) => Dd(t(await this.parseResponse(n, r), r), r.response));
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
var $r, Ud = class {
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
}, Eg = class extends $d {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await kd(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, wr = class extends Ud {
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
          ...Js(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Js(this.options.query),
        after_id: e
      }
    } : null;
  }
}, Pe = class extends Ud {
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
        ...Js(this.options.query),
        page: e
      }
    } : null;
  }
}, Fd = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function hn(e, t, n) {
  return Fd(), new File(e, t ?? "unknown_file", n);
}
function uo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var qd = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Vi = async (e, t, n = !0) => ({
  ...e,
  body: await Cg(e.body, t, n)
}), cl = /* @__PURE__ */ new WeakMap();
function wg(e) {
  const t = typeof e == "function" ? e : e.fetch, n = cl.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, s = new FormData();
      return s.toString() !== await new o(s).text();
    } catch {
      return !0;
    }
  })();
  return cl.set(t, r), r;
}
var Cg = async (e, t, n = !0) => {
  if (!await wg(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, s]) => Ks(r, o, s, n))), r;
}, Ig = (e) => e instanceof Blob && "name" in e, Ks = async (e, t, n, r) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let o = {};
      const s = n.headers.get("Content-Type");
      s && (o = { type: s }), e.append(t, hn([await n.blob()], uo(n, r), o));
    } else if (qd(n)) e.append(t, hn([await new Response(Nd(n)).blob()], uo(n, r)));
    else if (Ig(n)) e.append(t, hn([n], uo(n, r), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => Ks(e, t + "[]", o, r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, s]) => Ks(e, `${t}[${o}]`, s, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Bd = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", bg = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Bd(e), Pg = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Rg(e, t, n) {
  if (Fd(), e = await e, t || (t = uo(e, !0)), bg(e))
    return e instanceof File && t == null && n == null ? e : hn([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (Pg(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), hn(await Ws(o), t, n);
  }
  const r = await Ws(e);
  if (!n?.type) {
    const o = r.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return hn(r, t, n);
}
async function Ws(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Bd(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (qd(e)) for await (const n of e) t.push(...await Ws(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${xg(e)}`);
  }
  return t;
}
function xg(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ne = class {
  constructor(e) {
    this._client = e;
  }
}, Gd = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Mg(e) {
  if (!e) return;
  if (Gd in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const s of o) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : el(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const s = el(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const c of s)
      c !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, c]);
  }
}
var N = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [s, a] of Mg(r)) {
      const c = s.toLowerCase();
      o.has(c) || (t.delete(s), o.add(c)), a === null ? (t.delete(s), n.add(c)) : (t.append(s, a), n.delete(c));
    }
  }
  return {
    [Gd]: !0,
    values: t,
    nulls: n
  };
};
function Od(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var dl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Ng = (e = Od) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const s = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let g = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? dl) ?? dl)?.toString) && (g = m + "", s.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : g);
  }, ""), c = a.split(/[?#]/, 1)[0], u = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = u.exec(c)) !== null; ) s.push({
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
}, B = /* @__PURE__ */ Ng(Od), Hd = class extends ne {
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
function Vd(e, t) {
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
function Jd(e, t) {
  const n = Vd(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function kg(e) {
  return co(e) ? { "x-stainless-helper": e[ur] } : {};
}
var Kd = class extends ne {
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
    return this._client.post("/v1/files?beta=true", Vi({
      body: r,
      ...t,
      headers: N([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        kg(r.file),
        t?.headers
      ])
    }, this._client));
  }
}, Wd = class extends ne {
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
}, zd = class extends ne {
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
}, Yd = class extends ne {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(B`/v1/agents/${e}/versions?beta=true`, Pe, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ji = class extends ne {
  constructor() {
    super(...arguments), this.versions = new Yd(this._client);
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
Ji.Versions = Yd;
var Xd = class extends ne {
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
}, Qd = class extends ne {
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
}, Vo = class extends ne {
  constructor() {
    super(...arguments), this.memories = new Xd(this._client), this.memoryVersions = new Qd(this._client);
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
Vo.Memories = Xd;
Vo.MemoryVersions = Qd;
var Zd = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function jd(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function fl(e, t, n) {
  const r = jd(t);
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
  } : ef(e, t, n);
}
function ef(e, t, n) {
  let r = null;
  const o = e.content.map((s) => {
    if (s.type === "text") {
      const a = Dg(t, s.text);
      r === null && (r = a);
      const c = Object.defineProperty({ ...s }, "parsed_output", {
        value: a,
        enumerable: !1
      });
      return Object.defineProperty(c, "parsed", {
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
function Dg(e, t) {
  const n = jd(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new V(`Failed to parse structured output: ${r}`);
  }
}
var $g = (e) => {
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
      let a = "", c = !1;
      for (r = e[++t]; r !== '"'; ) {
        if (t === e.length) {
          c = !0;
          break;
        }
        if (r === "\\") {
          if (t++, t === e.length) {
            c = !0;
            break;
          }
          a += r + e[t], r = e[++t];
        } else
          a += r, r = e[++t];
      }
      r = e[++t], c || n.push({
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
}, Lg = (e) => {
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
}, Ug = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, tf = (e) => JSON.parse(Ug(Lg(on($g(e))))), He, St, Qt, Rn, Lr, xn, Mn, Ur, Nn, ct, kn, Fr, qr, kt, Br, Gr, Dn, ys, hl, Or, _s, vs, As, pl, ml = "__json_buf";
function gl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Fg = class zs {
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
    const n = new zs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const s = new zs(n, { logger: o });
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
      T(this, He, "m", _s).call(this);
      const { response: a, data: c } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const u of c) T(this, He, "m", vs).call(this, u);
      if (c.controller.signal?.aborted) throw new et();
      T(this, He, "m", As).call(this);
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
    return await this.done(), T(this, He, "m", ys).call(this);
  }
  async finalText() {
    return await this.done(), T(this, He, "m", hl).call(this);
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
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, He, "m", ys).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      T(this, He, "m", _s).call(this), this._connected(null);
      const s = _r.fromReadableStream(t, this.controller);
      for await (const a of s) T(this, He, "m", vs).call(this, a);
      if (s.controller.signal?.aborted) throw new et();
      T(this, He, "m", As).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(St = /* @__PURE__ */ new WeakMap(), Qt = /* @__PURE__ */ new WeakMap(), Rn = /* @__PURE__ */ new WeakMap(), Lr = /* @__PURE__ */ new WeakMap(), xn = /* @__PURE__ */ new WeakMap(), Mn = /* @__PURE__ */ new WeakMap(), Ur = /* @__PURE__ */ new WeakMap(), Nn = /* @__PURE__ */ new WeakMap(), ct = /* @__PURE__ */ new WeakMap(), kn = /* @__PURE__ */ new WeakMap(), Fr = /* @__PURE__ */ new WeakMap(), qr = /* @__PURE__ */ new WeakMap(), kt = /* @__PURE__ */ new WeakMap(), Br = /* @__PURE__ */ new WeakMap(), Gr = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap(), Or = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ new WeakSet(), ys = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, hl = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new V("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, _s = function() {
    this.ended || L(this, St, void 0, "f");
  }, vs = function(n) {
    if (this.ended) return;
    const r = T(this, He, "m", pl).call(this, n);
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
            gl(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage(fl(r, T(this, Qt, "f"), { logger: T(this, Dn, "f") }), !0);
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
  }, As = function() {
    if (this.ended) throw new V("stream has ended, this shouldn't happen");
    const n = T(this, St, "f");
    if (!n) throw new V("request ended without sending any chunks");
    return L(this, St, void 0, "f"), fl(n, T(this, Qt, "f"), { logger: T(this, Dn, "f") });
  }, pl = function(n) {
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
            if (o && gl(o)) {
              let s = o[ml] || "";
              s += n.delta.partial_json;
              const a = { ...o };
              if (Object.defineProperty(a, ml, {
                value: s,
                enumerable: !1,
                writable: !0
              }), s) try {
                a.input = tf(s);
              } catch (c) {
                const u = new V(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${c}. JSON: ${s}`);
                T(this, Or, "f").call(this, u);
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
}, nf = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var qg = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, $n, Zt, Dt, ie, Ee, Re, gt, Tt, Ln, yl, Ys;
function _l() {
  let e, t;
  return {
    promise: new Promise((n, r) => {
      e = n, t = r;
    }),
    resolve: e,
    reject: t
  };
}
var rf = class {
  constructor(e, t, n) {
    $n.add(this), this.client = e, Zt.set(this, !1), Dt.set(this, !1), ie.set(this, void 0), Ee.set(this, void 0), Re.set(this, void 0), gt.set(this, void 0), Tt.set(this, void 0), Ln.set(this, 0), L(this, ie, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const r = ["BetaToolRunner", ...Vd(t.tools, t.messages)].join(", ");
    L(this, Ee, {
      ...n,
      headers: N([{ "x-stainless-helper": r }, n?.headers])
    }, "f"), L(this, Tt, _l(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Zt = /* @__PURE__ */ new WeakMap(), Dt = /* @__PURE__ */ new WeakMap(), ie = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new WeakMap(), Re = /* @__PURE__ */ new WeakMap(), gt = /* @__PURE__ */ new WeakMap(), Tt = /* @__PURE__ */ new WeakMap(), Ln = /* @__PURE__ */ new WeakMap(), $n = /* @__PURE__ */ new WeakSet(), yl = async function() {
    const t = T(this, ie, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (T(this, Re, "f") !== void 0) try {
      const u = await T(this, Re, "f");
      n = u.usage.input_tokens + (u.usage.cache_creation_input_tokens ?? 0) + (u.usage.cache_read_input_tokens ?? 0) + u.usage.output_tokens;
    } catch {
      return !1;
    }
    const r = t.contextTokenThreshold ?? 1e5;
    if (n < r) return !1;
    const o = t.model ?? T(this, ie, "f").params.model, s = t.summaryPrompt ?? qg, a = T(this, ie, "f").params.messages;
    if (a[a.length - 1].role === "assistant") {
      const u = a[a.length - 1];
      if (Array.isArray(u.content)) {
        const d = u.content.filter((h) => h.type !== "tool_use");
        d.length === 0 ? a.pop() : u.content = d;
      }
    }
    const c = await this.client.beta.messages.create({
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
      signal: T(this, Ee, "f").signal,
      headers: N([T(this, Ee, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (c.content[0]?.type !== "text") throw new V("Expected text response for compaction");
    return T(this, ie, "f").params.messages = [{
      role: "user",
      content: c.content
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
          if (o.stream ? (t = this.client.beta.messages.stream({ ...o }, T(this, Ee, "f")), L(this, Re, t.finalMessage(), "f"), T(this, Re, "f").catch(() => {
          }), yield t) : (L(this, Re, this.client.beta.messages.create({
            ...o,
            stream: !1
          }, T(this, Ee, "f")), "f"), yield T(this, Re, "f")), !await T(this, $n, "m", yl).call(this)) {
            if (!T(this, Dt, "f")) {
              const { role: a, content: c } = await T(this, Re, "f");
              T(this, ie, "f").params.messages.push({
                role: a,
                content: c
              });
            }
            const s = await T(this, $n, "m", Ys).call(this, T(this, ie, "f").params.messages.at(-1));
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
      }), T(this, Tt, "f").reject(t), L(this, Tt, _l(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? T(this, ie, "f").params = e(T(this, ie, "f").params) : T(this, ie, "f").params = e, L(this, Dt, !0, "f"), L(this, gt, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? L(this, Ee, e(T(this, Ee, "f")), "f") : L(this, Ee, {
      ...T(this, Ee, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = T(this, Ee, "f").signal) {
    const t = await T(this, Re, "f") ?? this.params.messages.at(-1);
    return t ? T(this, $n, "m", Ys).call(this, t, e) : null;
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
Ys = async function(t, n = T(this, Ee, "f").signal) {
  return T(this, gt, "f") !== void 0 ? T(this, gt, "f") : (L(this, gt, Bg(T(this, ie, "f").params, t, {
    ...T(this, Ee, "f"),
    signal: n
  }), "f"), T(this, gt, "f"));
};
async function Bg(e, t = e.messages.at(-1), n) {
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
        const c = await s.run(a, {
          toolUseBlock: o,
          signal: n?.signal
        });
        return {
          type: "tool_result",
          tool_use_id: o.id,
          content: c
        };
      } catch (a) {
        return {
          type: "tool_result",
          tool_use_id: o.id,
          content: a instanceof nf ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var of = class sf {
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
    return new sf(Oi(t.body), n);
  }
}, af = class extends ne {
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
    })._thenUnwrap((s, a) => of.fromResponse(a.response, a.controller));
  }
}, vl = {
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
}, Gg = ["claude-mythos-preview", "claude-opus-4-6"], Cr = class extends ne {
  constructor() {
    super(...arguments), this.batches = new af(this._client);
  }
  create(e, t) {
    const n = Al(e), { betas: r, ...o } = n;
    o.model in vl && console.warn(`The model '${o.model}' is deprecated and will reach end-of-life on ${vl[o.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Gg.includes(o.model) && o.thinking && o.thinking.type === "enabled" && console.warn(`Using Claude with ${o.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let s = this._client._options.timeout;
    if (!o.stream && s == null) {
      const c = Zd[o.model] ?? void 0;
      s = this._client.calculateNonstreamingTimeout(o.max_tokens, c);
    }
    const a = Jd(o.tools, o.messages);
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
    }, this.create(e, t).then((n) => ef(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Fg.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...r } = Al(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new rf(this._client, e, t);
  }
};
function Al(e) {
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
Cr.Batches = af;
Cr.BetaToolRunner = rf;
Cr.ToolError = nf;
var lf = class extends ne {
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
}, uf = class extends ne {
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
}, Jo = class extends ne {
  constructor() {
    super(...arguments), this.events = new lf(this._client), this.resources = new uf(this._client);
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
Jo.Events = lf;
Jo.Resources = uf;
var cf = class extends ne {
  create(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.post(B`/v1/skills/${e}/versions?beta=true`, Vi({
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
}, Ki = class extends ne {
  constructor() {
    super(...arguments), this.versions = new cf(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Vi({
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
Ki.Versions = cf;
var df = class extends ne {
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
}, Wi = class extends ne {
  constructor() {
    super(...arguments), this.credentials = new df(this._client);
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
Wi.Credentials = df;
var ze = class extends ne {
  constructor() {
    super(...arguments), this.models = new Wd(this._client), this.messages = new Cr(this._client), this.agents = new Ji(this._client), this.environments = new Hd(this._client), this.sessions = new Jo(this._client), this.vaults = new Wi(this._client), this.memoryStores = new Vo(this._client), this.files = new Kd(this._client), this.skills = new Ki(this._client), this.userProfiles = new zd(this._client);
  }
};
ze.Models = Wd;
ze.Messages = Cr;
ze.Agents = Ji;
ze.Environments = Hd;
ze.Sessions = Jo;
ze.Vaults = Wi;
ze.MemoryStores = Vo;
ze.Files = Kd;
ze.Skills = Ki;
ze.UserProfiles = zd;
var ff = class extends ne {
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
function hf(e) {
  return e?.output_config?.format;
}
function Sl(e, t, n) {
  const r = hf(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((o) => o.type === "text" ? Object.defineProperty({ ...o }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : o),
    parsed_output: null
  } : pf(e, t, n);
}
function pf(e, t, n) {
  let r = null;
  const o = e.content.map((s) => {
    if (s.type === "text") {
      const a = Og(t, s.text);
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
function Og(e, t) {
  const n = hf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new V(`Failed to parse structured output: ${r}`);
  }
}
var Ve, Et, jt, Un, Hr, Fn, qn, Vr, Bn, dt, Gn, Jr, Kr, $t, Wr, zr, On, Ss, Tl, Ts, Es, ws, Cs, El, wl = "__json_buf";
function Cl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var Hg = class Xs {
  constructor(t, n) {
    Ve.add(this), this.messages = [], this.receivedMessages = [], Et.set(this, void 0), jt.set(this, null), this.controller = new AbortController(), Un.set(this, void 0), Hr.set(this, () => {
    }), Fn.set(this, () => {
    }), qn.set(this, void 0), Vr.set(this, () => {
    }), Bn.set(this, () => {
    }), dt.set(this, {}), Gn.set(this, !1), Jr.set(this, !1), Kr.set(this, !1), $t.set(this, !1), Wr.set(this, void 0), zr.set(this, void 0), On.set(this, void 0), Ts.set(this, (r) => {
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
    const n = new Xs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const s = new Xs(n, { logger: o });
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
    }, T(this, Ts, "f"));
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
      T(this, Ve, "m", Es).call(this);
      const { response: a, data: c } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const u of c) T(this, Ve, "m", ws).call(this, u);
      if (c.controller.signal?.aborted) throw new et();
      T(this, Ve, "m", Cs).call(this);
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
    return await this.done(), T(this, Ve, "m", Ss).call(this);
  }
  async finalText() {
    return await this.done(), T(this, Ve, "m", Tl).call(this);
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
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, Ve, "m", Ss).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      T(this, Ve, "m", Es).call(this), this._connected(null);
      const s = _r.fromReadableStream(t, this.controller);
      for await (const a of s) T(this, Ve, "m", ws).call(this, a);
      if (s.controller.signal?.aborted) throw new et();
      T(this, Ve, "m", Cs).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(Et = /* @__PURE__ */ new WeakMap(), jt = /* @__PURE__ */ new WeakMap(), Un = /* @__PURE__ */ new WeakMap(), Hr = /* @__PURE__ */ new WeakMap(), Fn = /* @__PURE__ */ new WeakMap(), qn = /* @__PURE__ */ new WeakMap(), Vr = /* @__PURE__ */ new WeakMap(), Bn = /* @__PURE__ */ new WeakMap(), dt = /* @__PURE__ */ new WeakMap(), Gn = /* @__PURE__ */ new WeakMap(), Jr = /* @__PURE__ */ new WeakMap(), Kr = /* @__PURE__ */ new WeakMap(), $t = /* @__PURE__ */ new WeakMap(), Wr = /* @__PURE__ */ new WeakMap(), zr = /* @__PURE__ */ new WeakMap(), On = /* @__PURE__ */ new WeakMap(), Ts = /* @__PURE__ */ new WeakMap(), Ve = /* @__PURE__ */ new WeakSet(), Ss = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Tl = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new V("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Es = function() {
    this.ended || L(this, Et, void 0, "f");
  }, ws = function(n) {
    if (this.ended) return;
    const r = T(this, Ve, "m", El).call(this, n);
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
            Cl(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage(Sl(r, T(this, jt, "f"), { logger: T(this, On, "f") }), !0);
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
  }, Cs = function() {
    if (this.ended) throw new V("stream has ended, this shouldn't happen");
    const n = T(this, Et, "f");
    if (!n) throw new V("request ended without sending any chunks");
    return L(this, Et, void 0, "f"), Sl(n, T(this, jt, "f"), { logger: T(this, On, "f") });
  }, El = function(n) {
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
            if (o && Cl(o)) {
              let s = o[wl] || "";
              s += n.delta.partial_json;
              const a = { ...o };
              Object.defineProperty(a, wl, {
                value: s,
                enumerable: !1,
                writable: !0
              }), s && (a.input = tf(s)), r.content[n.index] = a;
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
}, mf = class extends ne {
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
    })._thenUnwrap((r, o) => of.fromResponse(o.response, o.controller));
  }
}, zi = class extends ne {
  constructor() {
    super(...arguments), this.batches = new mf(this._client);
  }
  create(e, t) {
    e.model in Il && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${Il[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Vg.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const o = Zd[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, o);
    }
    const r = Jd(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: N([r, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => pf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Hg.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, Il = {
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
}, Vg = ["claude-mythos-preview", "claude-opus-4-6"];
zi.Batches = mf;
var gf = class extends ne {
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
}, Qs, Yi, fo, yf, Jg = "\\n\\nHuman:", Kg = "\\n\\nAssistant:", oe = class {
  constructor({ baseURL: e = Yr("ANTHROPIC_BASE_URL"), apiKey: t = Yr("ANTHROPIC_API_KEY") ?? null, authToken: n = Yr("ANTHROPIC_AUTH_TOKEN") ?? null, ...r } = {}) {
    Qs.add(this), fo.set(this, void 0);
    const o = {
      apiKey: t,
      authToken: n,
      ...r,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!o.dangerouslyAllowBrowser && ig()) throw new V(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = o.baseURL, this.timeout = o.timeout ?? Yi.DEFAULT_TIMEOUT, this.logger = o.logger ?? console;
    const s = "warn";
    this.logLevel = s, this.logLevel = ll(o.logLevel, "ClientOptions.logLevel", this) ?? ll(Yr("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? s, this.fetchOptions = o.fetchOptions, this.maxRetries = o.maxRetries ?? 2, this.fetch = o.fetch ?? dg(), L(this, fo, hg, "f"), this._options = o, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return pg(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${rn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Ad()}`;
  }
  makeStatusError(e, t, n, r) {
    return Fe.generate(e, t, n, r);
  }
  buildURL(e, t, n) {
    const r = !T(this, Qs, "m", yf).call(this) && n || this.baseURL, o = ng(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), s = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!tl(s) || !tl(a)) && (t = {
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
    return new $d(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, o = r.maxRetries ?? this.maxRetries;
    t == null && (t = o), await this.prepareOptions(r);
    const { req: s, url: a, timeout: c } = await this.buildRequest(r, { retryCount: o - t });
    await this.prepareRequest(s, {
      url: a,
      options: r
    });
    const u = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (Ae(this).debug(`[${u}] sending request`, Lt({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: s.headers
    })), r.signal?.aborted) throw new et();
    const f = new AbortController(), p = await this.fetchWithTimeout(a, s, c, f).catch(Os), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new et();
      const v = yr(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return Ae(this).info(`[${u}] connection ${v ? "timed out" : "failed"} - ${_}`), Ae(this).debug(`[${u}] connection ${v ? "timed out" : "failed"} (${_})`, Lt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(r, t, n ?? u);
      throw Ae(this).info(`[${u}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), Ae(this).debug(`[${u}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, Lt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - h,
        message: p.message
      })), v ? new Sd() : new Ho({ cause: p });
    }
    const g = `[${u}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, v]) => ", " + _ + ": " + JSON.stringify(v)).join("")}] ${s.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const M = `retrying, ${t} attempts remaining`;
        return await fg(p.body), Ae(this).info(`${g} - ${M}`), Ae(this).debug(`[${u}] response error (${M})`, Lt({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(r, t, n ?? u, p.headers);
      }
      const v = _ ? "error; no more retries left" : "error; not retryable";
      Ae(this).info(`${g} - ${v}`);
      const w = await p.text().catch((M) => Os(M).message), I = xd(w), P = I ? void 0 : w;
      throw Ae(this).debug(`[${u}] response error (${v})`, Lt({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: P,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, I, P, p.headers);
    }
    return Ae(this).info(g), Ae(this).debug(`[${u}] response start`, Lt({
      retryOfRequestLogID: n,
      url: p.url,
      status: p.status,
      headers: p.headers,
      durationMs: m - h
    })), {
      response: p,
      options: r,
      controller: f,
      requestLogID: u,
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
    return new Eg(this, n, e);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: o, method: s, ...a } = t || {}, c = this._makeAbort(r);
    o && o.addEventListener("abort", c, { once: !0 });
    const u = setTimeout(c, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, h = {
      signal: r.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...a
    };
    s && (h.method = s.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, h);
    } finally {
      clearTimeout(u);
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
      const c = parseFloat(s);
      Number.isNaN(c) || (o = c);
    }
    const a = r?.get("retry-after");
    if (a && !o) {
      const c = parseFloat(a);
      Number.isNaN(c) ? o = Date.parse(a) - Date.now() : o = c * 1e3;
    }
    if (o === void 0) {
      const c = e.maxRetries ?? this.maxRetries;
      o = this.calculateDefaultRetryTimeoutMillis(t, c);
    }
    return await sg(o), this.makeRequest(e, t - 1, n);
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
    const n = { ...e }, { method: r, path: o, query: s, defaultBaseURL: a } = n, c = this.buildURL(o, s, a);
    "timeout" in n && og("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: u, body: d } = this.buildBody({ options: n });
    return {
      req: {
        method: r,
        headers: await this.buildHeaders({
          options: e,
          method: r,
          bodyHeaders: u,
          retryCount: t
        }),
        ...n.signal && { signal: n.signal },
        ...globalThis.ReadableStream && d instanceof globalThis.ReadableStream && { duplex: "half" },
        ...d && { body: d },
        ...this.fetchOptions ?? {},
        ...n.fetchOptions ?? {}
      },
      url: c,
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
        ...cg(),
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
      body: Nd(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : T(this, fo, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Yi = oe, fo = /* @__PURE__ */ new WeakMap(), Qs = /* @__PURE__ */ new WeakSet(), yf = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
oe.Anthropic = Yi;
oe.HUMAN_PROMPT = Jg;
oe.AI_PROMPT = Kg;
oe.DEFAULT_TIMEOUT = 6e5;
oe.AnthropicError = V;
oe.APIError = Fe;
oe.APIConnectionError = Ho;
oe.APIConnectionTimeoutError = Sd;
oe.APIUserAbortError = et;
oe.NotFoundError = Cd;
oe.ConflictError = Id;
oe.RateLimitError = Pd;
oe.BadRequestError = Td;
oe.AuthenticationError = Ed;
oe.InternalServerError = Rd;
oe.PermissionDeniedError = wd;
oe.UnprocessableEntityError = bd;
oe.toFile = Rg;
var Ir = class extends oe {
  constructor() {
    super(...arguments), this.completions = new ff(this), this.messages = new zi(this), this.models = new gf(this), this.beta = new ze(this);
  }
};
Ir.Completions = ff;
Ir.Messages = zi;
Ir.Models = gf;
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
function Wg(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function zg(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function _f(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Yg(e) {
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
      const r = zg(n.image_url.url);
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
function Xg(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function Qg(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && _f(t) || null;
}
function Zg(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: _f(e.content) || [] } : void 0;
}
function bl(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function Pl(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: Wg(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function jg(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const r = e[n];
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const o = Qg(r), s = Pl(r.tool_calls);
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
        const o = [bl(r)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, o.push(bl(e[n]));
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
          }] : [], ...Pl(r.tool_calls)]
        });
        continue;
      }
      t.push({
        role: r.role,
        content: Yg(r.content)
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
function Rl(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
var ey = class {
  constructor(e) {
    this.config = e, this.client = new Ir({
      apiKey: e.apiKey,
      baseURL: Rl(e.baseUrl),
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
    })), n = Xg(e), r = {
      model: this.config.model,
      system: n,
      messages: jg(e.messages),
      tools: t,
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (r.temperature = e.temperature), e.reasoning?.enabled && (r.thinking = {
      type: "adaptive",
      display: "summarized"
    }), r;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = Rl(this.config.baseUrl);
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
      const s = this.client.messages.stream(t, { signal: e.signal }), a = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map();
      let u = "";
      const d = () => Array.from(a.entries()).sort(([p], [m]) => p.localeCompare(m)).map(([p, m]) => ({
        label: p.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: m
      })).filter((p) => p.text), h = () => Array.from(c.entries()).sort(([p], [m]) => Number(p) - Number(m)).map(([, p]) => ({
        id: p.id || "anthropic-tool-draft",
        name: p.name || "工具调用",
        arguments: p.inputJson || "{}",
        draft: !0
      })).filter((p) => p.name), f = () => {
        const p = h();
        p.length && Xr(e, {
          text: u,
          thoughts: d(),
          toolCalls: p,
          toolCallDraft: !0
        });
      };
      s.on("text", (p, m) => {
        u = m || "", Xr(e, {
          text: u,
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
            text: u,
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), s.on("streamEvent", (p) => {
        if (p?.type === "content_block_start" && p.content_block?.type === "tool_use") {
          const m = p.content_block.input && typeof p.content_block.input == "object" ? p.content_block.input : {};
          c.set(p.index, {
            id: p.content_block.id || `anthropic-tool-draft-${p.index + 1}`,
            name: p.content_block.name || "工具调用",
            inputJson: Object.keys(m).length ? JSON.stringify(m) : ""
          }), f();
          return;
        }
        if (p?.type === "content_block_delta" && p.delta?.type === "input_json_delta") {
          const m = c.get(p.index) || {
            id: `anthropic-tool-draft-${p.index + 1}`,
            name: "工具调用",
            inputJson: ""
          };
          c.set(p.index, {
            ...m,
            inputJson: `${m.inputJson || ""}${p.delta.partial_json || ""}`
          }), f();
        }
      }), s.on("contentBlock", (p) => {
        p?.type === "redacted_thinking" && (a.set("redacted:0", p.data || ""), Xr(e, {
          thoughts: d(),
          ...h().length ? {
            text: u,
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
      providerPayload: Zg(r),
      requestInspection: n
    };
  }
}, ty = /* @__PURE__ */ Oo(((e, t) => {
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
      var c = this._errors[a], u = c.message, d = (r[u] || 0) + 1;
      r[u] = d, d >= s && (o = c, s = d);
    }
    return o;
  };
})), ny = /* @__PURE__ */ Oo(((e) => {
  var t = ty();
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
    return n && n.forever && !s.length && s.push(this.createTimeout(a, r)), s.sort(function(c, u) {
      return c - u;
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
      var c = o[a], u = n[c];
      n[c] = function(h) {
        var f = e.operation(r), p = Array.prototype.slice.call(arguments, 1), m = p.pop();
        p.push(function(g) {
          f.retry(g) || (g && (arguments[0] = f.mainError()), m.apply(this, arguments));
        }), f.attempt(function() {
          h.apply(n, p);
        });
      }.bind(n, u), n[c].options = r;
    }
  };
})), ry = /* @__PURE__ */ Oo(((e, t) => {
  t.exports = ny();
})), oy = /* @__PURE__ */ Oo(((e, t) => {
  var n = ry(), r = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], o = class extends Error {
    constructor(u) {
      super(), u instanceof Error ? (this.originalError = u, { message: u } = u) : (this.originalError = new Error(u), this.originalError.stack = this.stack), this.name = "AbortError", this.message = u;
    }
  }, s = (u, d, h) => {
    const f = h.retries - (d - 1);
    return u.attemptNumber = d, u.retriesLeft = f, u;
  }, a = (u) => r.includes(u), c = (u, d) => new Promise((h, f) => {
    d = {
      onFailedAttempt: () => {
      },
      retries: 10,
      ...d
    };
    const p = n.operation(d);
    p.attempt(async (m) => {
      try {
        h(await u(m));
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
  t.exports = c, t.exports.default = c, t.exports.AbortError = o;
})), xl = /* @__PURE__ */ Km(oy(), 1), sy = void 0, iy = void 0;
function ay() {
  return {
    geminiUrl: sy,
    vertexUrl: iy
  };
}
function ly(e, t, n, r) {
  var o, s;
  if (!e?.baseUrl) {
    const a = ay();
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
      const c = a.slice(0, -2);
      if (!(c in e)) if (Array.isArray(n)) e[c] = Array.from({ length: n.length }, () => ({}));
      else throw new Error(`Value must be a list given an array path ${a}`);
      if (Array.isArray(e[c])) {
        const u = e[c];
        if (Array.isArray(n)) for (let d = 0; d < u.length; d++) {
          const h = u[d];
          l(h, t.slice(s + 1), n[d]);
        }
        else for (const d of u) l(d, t.slice(s + 1), n);
      }
      return;
    } else if (a.endsWith("[0]")) {
      const c = a.slice(0, -3);
      c in e || (e[c] = [{}]);
      const u = e[c];
      l(u[0], t.slice(s + 1), n);
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
          return Array.isArray(a) ? a.map((c) => i(c, t.slice(r + 1), n)) : n;
        } else return n;
      } else e = e[o];
    }
    return e;
  } catch (r) {
    if (r instanceof TypeError) return n;
    throw r;
  }
}
function uy(e, t) {
  for (const [n, r] of Object.entries(t)) {
    const o = n.split("."), s = r.split("."), a = /* @__PURE__ */ new Set();
    let c = -1;
    for (let u = 0; u < o.length; u++) if (o[u] === "*") {
      c = u;
      break;
    }
    if (c !== -1 && s.length > c) for (let u = c; u < s.length; u++) {
      const d = s[u];
      d !== "*" && !d.endsWith("[]") && !d.endsWith("[0]") && a.add(d);
    }
    Zs(e, o, s, 0, a);
  }
}
function Zs(e, t, n, r, o) {
  if (r >= t.length || typeof e != "object" || e === null) return;
  const s = t[r];
  if (s.endsWith("[]")) {
    const a = s.slice(0, -2), c = e;
    if (a in c && Array.isArray(c[a])) for (const u of c[a]) Zs(u, t, n, r + 1, o);
  } else if (s === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const a = e, c = Object.keys(a).filter((d) => !d.startsWith("_") && !o.has(d)), u = {};
      for (const d of c) u[d] = a[d];
      for (const [d, h] of Object.entries(u)) {
        const f = [];
        for (const p of n.slice(r)) p === "*" ? f.push(d) : f.push(p);
        l(a, f, h);
      }
      for (const d of c) delete a[d];
    }
  } else {
    const a = e;
    s in a && Zs(a[s], t, n, r + 1, o);
  }
}
function Xi(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function cy(e) {
  const t = {}, n = i(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const r = i(e, ["resourceName"]);
  return r != null && l(t, ["_url", "resourceName"], r), t;
}
function dy(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], hy(a)), t;
}
function fy(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], py(a)), t;
}
function hy(e) {
  const t = {}, n = i(e, ["generatedSamples"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((a) => my(a))), l(t, ["generatedVideos"], s);
  }
  const r = i(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = i(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function py(e) {
  const t = {}, n = i(e, ["videos"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((a) => gy(a))), l(t, ["generatedVideos"], s);
  }
  const r = i(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = i(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function my(e) {
  const t = {}, n = i(e, ["video"]);
  return n != null && l(t, ["video"], Ty(n)), t;
}
function gy(e) {
  const t = {}, n = i(e, ["_self"]);
  return n != null && l(t, ["video"], Ey(n)), t;
}
function yy(e) {
  const t = {}, n = i(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function _y(e) {
  const t = {}, n = i(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function vy(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], Ay(a)), t;
}
function Ay(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = i(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function vf(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], Sy(a)), t;
}
function Sy(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = i(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function Ty(e) {
  const t = {}, n = i(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const r = i(e, ["encodedVideo"]);
  r != null && l(t, ["videoBytes"], Xi(r));
  const o = i(e, ["encoding"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Ey(e) {
  const t = {}, n = i(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const r = i(e, ["bytesBase64Encoded"]);
  r != null && l(t, ["videoBytes"], Xi(r));
  const o = i(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
var Ml;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(Ml || (Ml = {}));
var Nl;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(Nl || (Nl = {}));
var kl;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(kl || (kl = {}));
var Rt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(Rt || (Rt = {}));
var Dl;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(Dl || (Dl = {}));
var $l;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})($l || ($l = {}));
var Ll;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(Ll || (Ll = {}));
var Ul;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(Fl || (Fl = {}));
var ql;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(ql || (ql = {}));
var Bl;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(Bl || (Bl = {}));
var js;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(js || (js = {}));
var cr;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(cr || (cr = {}));
var Gl;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(Gl || (Gl = {}));
var Ol;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Ol || (Ol = {}));
var Hl;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Hl || (Hl = {}));
var Vl;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Vl || (Vl = {}));
var Jl;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Jl || (Jl = {}));
var Kl;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Kl || (Kl = {}));
var Wl;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Wl || (Wl = {}));
var zl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(zl || (zl = {}));
var Yl;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Xl || (Xl = {}));
var Ql;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Ql || (Ql = {}));
var bo;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(bo || (bo = {}));
var Zl;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Zl || (Zl = {}));
var jl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(jl || (jl = {}));
var eu;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(eu || (eu = {}));
var tu;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(tu || (tu = {}));
var ei;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(ei || (ei = {}));
var nu;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(nu || (nu = {}));
var ru;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(ru || (ru = {}));
var ou;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(ou || (ou = {}));
var su;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(su || (su = {}));
var iu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(iu || (iu = {}));
var au;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(au || (au = {}));
var lu;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(lu || (lu = {}));
var ti;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(ti || (ti = {}));
var uu;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(uu || (uu = {}));
var cu;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(cu || (cu = {}));
var Po;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(Po || (Po = {}));
var du;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(du || (du = {}));
var fu;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(fu || (fu = {}));
var hu;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(hu || (hu = {}));
var pu;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(pu || (pu = {}));
var mu;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(mu || (mu = {}));
var gu;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(gu || (gu = {}));
var yu;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(yu || (yu = {}));
var _u;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(_u || (_u = {}));
var vu;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(vu || (vu = {}));
var Au;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(Au || (Au = {}));
var Su;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(Su || (Su = {}));
var Tu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(Tu || (Tu = {}));
var Eu;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(Eu || (Eu = {}));
var wu;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(wu || (wu = {}));
var Cu;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(Cu || (Cu = {}));
var Iu;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(Iu || (Iu = {}));
var bu;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(bu || (bu = {}));
var Pu;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(Pu || (Pu = {}));
var Ru;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(Ru || (Ru = {}));
var xu;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(xu || (xu = {}));
var Mu;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(Mu || (Mu = {}));
var Nu;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(Nu || (Nu = {}));
var ku;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(ku || (ku = {}));
var dn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(dn || (dn = {}));
var ni = class {
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
    var e, t, n, r, o, s, a, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let u = "", d = !1;
    const h = [];
    for (const f of (c = (a = (s = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || s === void 0 ? void 0 : s.content) === null || a === void 0 ? void 0 : a.parts) !== null && c !== void 0 ? c : []) {
      for (const [p, m] of Object.entries(f)) p !== "text" && p !== "thought" && p !== "thoughtSignature" && (m !== null || m !== void 0) && h.push(p);
      if (typeof f.text == "string") {
        if (typeof f.thought == "boolean" && f.thought) continue;
        d = !0, u += f.text;
      }
    }
    return h.length > 0 && console.warn(`there are non-text parts ${h} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? u : void 0;
  }
  get data() {
    var e, t, n, r, o, s, a, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let u = "";
    const d = [];
    for (const h of (c = (a = (s = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || s === void 0 ? void 0 : s.content) === null || a === void 0 ? void 0 : a.parts) !== null && c !== void 0 ? c : []) {
      for (const [f, p] of Object.entries(h)) f !== "inlineData" && (p !== null || p !== void 0) && d.push(f);
      h.inlineData && typeof h.inlineData.data == "string" && (u += atob(h.inlineData.data));
    }
    return d.length > 0 && console.warn(`there are non-data parts ${d} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), u.length > 0 ? btoa(u) : void 0;
  }
  get functionCalls() {
    var e, t, n, r, o, s, a, c;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    const u = (c = (a = (s = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || s === void 0 ? void 0 : s.content) === null || a === void 0 ? void 0 : a.parts) === null || c === void 0 ? void 0 : c.filter((d) => d.functionCall).map((d) => d.functionCall).filter((d) => d !== void 0);
    if (u?.length !== 0)
      return u;
  }
  get executableCode() {
    var e, t, n, r, o, s, a, c, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    const d = (c = (a = (s = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || s === void 0 ? void 0 : s.content) === null || a === void 0 ? void 0 : a.parts) === null || c === void 0 ? void 0 : c.filter((h) => h.executableCode).map((h) => h.executableCode).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (u = d?.[0]) === null || u === void 0 ? void 0 : u.code;
  }
  get codeExecutionResult() {
    var e, t, n, r, o, s, a, c, u;
    if (((r = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || r === void 0 ? void 0 : r.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (c = (a = (s = (o = this.candidates) === null || o === void 0 ? void 0 : o[0]) === null || s === void 0 ? void 0 : s.content) === null || a === void 0 ? void 0 : a.parts) === null || c === void 0 ? void 0 : c.filter((h) => h.codeExecutionResult).map((h) => h.codeExecutionResult).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (u = d?.[0]) === null || u === void 0 ? void 0 : u.output;
  }
}, Du = class {
}, $u = class {
}, wy = class {
}, Cy = class {
}, Iy = class {
}, by = class {
}, Lu = class {
}, Uu = class {
}, Fu = class {
}, Py = class {
}, qu = class Af {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new Af();
    let o;
    const s = t;
    return n ? o = fy(s) : o = dy(s), Object.assign(r, o), r;
  }
}, Bu = class {
}, Gu = class {
}, Ou = class {
}, Hu = class {
}, Ry = class {
}, xy = class {
}, My = class {
}, Ny = class Sf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new Sf(), o = vy(t);
    return Object.assign(r, o), r;
  }
}, ky = class {
}, Dy = class {
}, $y = class {
}, Ly = class {
}, Vu = class {
}, Uy = class {
  get text() {
    var e, t, n;
    let r = "", o = !1;
    const s = [];
    for (const a of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [c, u] of Object.entries(a)) c !== "text" && c !== "thought" && u !== null && s.push(c);
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
      for (const [a, c] of Object.entries(s)) a !== "inlineData" && c !== null && o.push(a);
      s.inlineData && typeof s.inlineData.data == "string" && (r += atob(s.inlineData.data));
    }
    return o.length > 0 && console.warn(`there are non-data parts ${o} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), r.length > 0 ? btoa(r) : void 0;
  }
}, Fy = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, qy = class Tf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new Tf(), o = vf(t);
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
function Ef(e, t) {
  const n = Y(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function wf(e) {
  return Array.isArray(e) ? e.map((t) => Ro(t)) : [Ro(e)];
}
function Ro(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function Cf(e) {
  const t = Ro(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function If(e) {
  const t = Ro(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Ju(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function bf(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Ju(t)) : [Ju(e)];
}
function ri(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Ku(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Wu(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function de(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return ri(e) ? e : {
    role: "user",
    parts: bf(e)
  };
}
function Qi(e, t) {
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
    if (Ku(e) || Wu(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [de(e)];
  }
  const t = [], n = [], r = ri(e[0]);
  for (const o of e) {
    const s = ri(o);
    if (s != r) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (s) t.push(o);
    else {
      if (Ku(o) || Wu(o)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(o);
    }
  }
  return r || t.push({
    role: "user",
    parts: bf(n)
  }), t;
}
function By(e, t) {
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
  s != null && s.length == 2 && (s[0].type === "null" ? (t.nullable = !0, e = s[1]) : s[1].type === "null" && (t.nullable = !0, e = s[0])), e.type instanceof Array && By(e.type, t);
  for (const [a, c] of Object.entries(e))
    if (c != null)
      if (a == "type") {
        if (c === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (c instanceof Array) continue;
        t.type = Object.values(Rt).includes(c.toUpperCase()) ? c.toUpperCase() : Rt.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = pn(c);
      else if (r.includes(a)) {
        const u = [];
        for (const d of c) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          u.push(pn(d));
        }
        t[a] = u;
      } else if (o.includes(a)) {
        const u = {};
        for (const [d, h] of Object.entries(c)) u[d] = pn(h);
        t[a] = u;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = c;
      }
  return t;
}
function Zi(e) {
  return pn(e);
}
function ji(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function ea(e) {
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
function Gy(e, t, n, r = 1) {
  const o = !t.startsWith(`${n}/`) && t.split("/").length === r;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : o ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : o ? `${n}/${t}` : t;
}
function vt(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return Gy(e, t, "cachedContents");
}
function Pf(e) {
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
  return Xi(e);
}
function Oy(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function Hy(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function Vy(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function Rf(e) {
  var t;
  let n;
  if (Oy(e) && (n = e.name), !(Vy(e) && (n = e.uri, n === void 0)) && !(Hy(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const r = n.split("files/")[1].match(/[a-z0-9]+/);
      if (r === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = r[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function xf(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function Mf(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (Jy(e, t)) return e[t];
  return [];
}
function Jy(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function Ky(e, t = {}) {
  const n = e, r = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (r.responseJsonSchema = n.outputSchema), t.behavior && (r.behavior = t.behavior), { functionDeclarations: [r] };
}
function Wy(e, t = {}) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = o.name;
    if (r.has(s)) throw new Error(`Duplicate function name ${s} found in MCP tools. Please ensure function names are unique.`);
    r.add(s);
    const a = Ky(o, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function Nf(e, t) {
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
function zy(e) {
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
function kf(e) {
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
function Df(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function Yy(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function Xy(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Qy(e) {
  const t = {}, n = i(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const r = i(e, ["inlinedResponses", "inlinedResponses"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => M_(a))), l(t, ["inlinedResponses"], s);
  }
  const o = i(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], s);
  }
  return t;
}
function Zy(e) {
  const t = {}, n = i(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const r = i(e, ["gcsDestination", "outputUriPrefix"]);
  r != null && l(t, ["gcsUri"], r);
  const o = i(e, ["bigqueryDestination", "outputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function jy(e) {
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
  o != null && l(t, ["state"], Df(o));
  const s = i(e, ["metadata", "createTime"]);
  s != null && l(t, ["createTime"], s);
  const a = i(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const c = i(e, ["metadata", "updateTime"]);
  c != null && l(t, ["updateTime"], c);
  const u = i(e, ["metadata", "model"]);
  u != null && l(t, ["model"], u);
  const d = i(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], Qy(kf(d))), t;
}
function oi(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = i(e, ["state"]);
  o != null && l(t, ["state"], Df(o));
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["createTime"]);
  a != null && l(t, ["createTime"], a);
  const c = i(e, ["startTime"]);
  c != null && l(t, ["startTime"], c);
  const u = i(e, ["endTime"]);
  u != null && l(t, ["endTime"], u);
  const d = i(e, ["updateTime"]);
  d != null && l(t, ["updateTime"], d);
  const h = i(e, ["model"]);
  h != null && l(t, ["model"], h);
  const f = i(e, ["inputConfig"]);
  f != null && l(t, ["src"], e_(f));
  const p = i(e, ["outputConfig"]);
  p != null && l(t, ["dest"], Zy(kf(p)));
  const m = i(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function e_(e) {
  const t = {}, n = i(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const r = i(e, ["gcsSource", "uris"]);
  r != null && l(t, ["gcsUri"], r);
  const o = i(e, ["bigquerySource", "inputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function t_(e, t) {
  const n = {};
  if (i(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (i(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (i(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const r = i(t, ["fileName"]);
  r != null && l(n, ["fileName"], r);
  const o = i(t, ["inlinedRequests"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => x_(e, a))), l(n, ["requests", "requests"], s);
  }
  return n;
}
function n_(e) {
  const t = {}, n = i(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const r = i(e, ["gcsUri"]);
  r != null && l(t, ["gcsSource", "uris"], r);
  const o = i(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigquerySource", "inputUri"], o), i(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (i(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function r_(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function o_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], En(e, r)), n;
}
function s_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], En(e, r)), n;
}
function i_(e) {
  const t = {}, n = i(e, ["content"]);
  n != null && l(t, ["content"], n);
  const r = i(e, ["citationMetadata"]);
  r != null && l(t, ["citationMetadata"], a_(r));
  const o = i(e, ["tokenCount"]);
  o != null && l(t, ["tokenCount"], o);
  const s = i(e, ["finishReason"]);
  s != null && l(t, ["finishReason"], s);
  const a = i(e, ["groundingMetadata"]);
  a != null && l(t, ["groundingMetadata"], a);
  const c = i(e, ["avgLogprobs"]);
  c != null && l(t, ["avgLogprobs"], c);
  const u = i(e, ["index"]);
  u != null && l(t, ["index"], u);
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
function a_(e) {
  const t = {}, n = i(e, ["citationSources"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["citations"], r);
  }
  return t;
}
function $f(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => F_(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function l_(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  if (t !== void 0 && r != null && l(t, ["batch", "displayName"], r), i(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const o = i(e, ["webhookConfig"]);
  return t !== void 0 && o != null && l(t, ["batch", "webhookConfig"], o), n;
}
function u_(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const o = i(e, ["dest"]);
  if (t !== void 0 && o != null && l(t, ["outputConfig"], jy(zy(o))), i(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function zu(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = i(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], t_(e, Nf(e, o)));
  const s = i(t, ["config"]);
  return s != null && l_(s, n), n;
}
function c_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["model"], Y(e, r));
  const o = i(t, ["src"]);
  o != null && l(n, ["inputConfig"], n_(Nf(e, o)));
  const s = i(t, ["config"]);
  return s != null && u_(s, n), n;
}
function d_(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["batch", "displayName"], r), n;
}
function f_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = i(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], v_(e, o));
  const s = i(t, ["config"]);
  return s != null && d_(s, n), n;
}
function h_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], En(e, r)), n;
}
function p_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], En(e, r)), n;
}
function m_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  return s != null && l(t, ["error"], s), t;
}
function g_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  return s != null && l(t, ["error"], s), t;
}
function y_(e, t) {
  const n = {}, r = i(t, ["contents"]);
  if (r != null) {
    let s = Qi(e, r);
    Array.isArray(s) && (s = s.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], s);
  }
  const o = i(t, ["config"]);
  return o != null && (l(n, ["_self"], __(o, n)), uy(n, { "requests[].*": "requests[].request.*" })), n;
}
function __(e, t) {
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
function v_(e, t) {
  const n = {}, r = i(t, ["fileName"]);
  r != null && l(n, ["file_name"], r);
  const o = i(t, ["inlinedRequests"]);
  return o != null && l(n, ["requests"], y_(e, o)), n;
}
function A_(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function S_(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function T_(e) {
  const t = {}, n = i(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = i(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function E_(e, t, n) {
  const r = {}, o = i(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], $f(de(o)));
  const s = i(t, ["temperature"]);
  s != null && l(r, ["temperature"], s);
  const a = i(t, ["topP"]);
  a != null && l(r, ["topP"], a);
  const c = i(t, ["topK"]);
  c != null && l(r, ["topK"], c);
  const u = i(t, ["candidateCount"]);
  u != null && l(r, ["candidateCount"], u);
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
  w != null && l(r, ["responseSchema"], Zi(w));
  const I = i(t, ["responseJsonSchema"]);
  if (I != null && l(r, ["responseJsonSchema"], I), i(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (i(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = i(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let Q = P;
    Array.isArray(Q) && (Q = Q.map((X) => q_(X))), l(n, ["safetySettings"], Q);
  }
  const M = i(t, ["tools"]);
  if (n !== void 0 && M != null) {
    let Q = Tn(M);
    Array.isArray(Q) && (Q = Q.map((X) => G_(Sn(X)))), l(n, ["tools"], Q);
  }
  const x = i(t, ["toolConfig"]);
  if (n !== void 0 && x != null && l(n, ["toolConfig"], B_(x)), i(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const C = i(t, ["cachedContent"]);
  n !== void 0 && C != null && l(n, ["cachedContent"], vt(e, C));
  const F = i(t, ["responseModalities"]);
  F != null && l(r, ["responseModalities"], F);
  const R = i(t, ["mediaResolution"]);
  R != null && l(r, ["mediaResolution"], R);
  const D = i(t, ["speechConfig"]);
  if (D != null && l(r, ["speechConfig"], ji(D)), i(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = i(t, ["thinkingConfig"]);
  H != null && l(r, ["thinkingConfig"], H);
  const z = i(t, ["imageConfig"]);
  z != null && l(r, ["imageConfig"], R_(z));
  const j = i(t, ["enableEnhancedCivicAnswers"]);
  if (j != null && l(r, ["enableEnhancedCivicAnswers"], j), i(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const ee = i(t, ["serviceTier"]);
  return n !== void 0 && ee != null && l(n, ["serviceTier"], ee), r;
}
function w_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["candidates"]);
  if (r != null) {
    let d = r;
    Array.isArray(d) && (d = d.map((h) => i_(h))), l(t, ["candidates"], d);
  }
  const o = i(e, ["modelVersion"]);
  o != null && l(t, ["modelVersion"], o);
  const s = i(e, ["promptFeedback"]);
  s != null && l(t, ["promptFeedback"], s);
  const a = i(e, ["responseId"]);
  a != null && l(t, ["responseId"], a);
  const c = i(e, ["usageMetadata"]);
  c != null && l(t, ["usageMetadata"], c);
  const u = i(e, ["modelStatus"]);
  return u != null && l(t, ["modelStatus"], u), t;
}
function C_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], En(e, r)), n;
}
function I_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], En(e, r)), n;
}
function b_(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Xy(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function P_(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function R_(e) {
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
function x_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["request", "model"], Y(e, r));
  const o = i(t, ["contents"]);
  if (o != null) {
    let c = Ie(o);
    Array.isArray(c) && (c = c.map((u) => $f(u))), l(n, ["request", "contents"], c);
  }
  const s = i(t, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const a = i(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], E_(e, a, i(n, ["request"], {}))), n;
}
function M_(e) {
  const t = {}, n = i(e, ["response"]);
  n != null && l(t, ["response"], w_(n));
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function N_(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  if (t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), i(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function k_(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const s = i(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), n;
}
function D_(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && N_(n, t), t;
}
function $_(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && k_(n, t), t;
}
function L_(e) {
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
function U_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = i(e, ["batchPredictionJobs"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => oi(a))), l(t, ["batchJobs"], s);
  }
  return t;
}
function F_(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], A_(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], S_(a));
  const c = i(e, ["functionResponse"]);
  c != null && l(t, ["functionResponse"], c);
  const u = i(e, ["inlineData"]);
  u != null && l(t, ["inlineData"], r_(u));
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
function q_(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = i(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function B_(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = i(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], T_(r));
  const o = i(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function G_(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], P_(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], b_(s));
  const a = i(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = i(e, ["functionDeclarations"]);
  if (c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const u = i(e, ["googleSearchRetrieval"]);
  if (u != null && l(t, ["googleSearchRetrieval"], u), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
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
}, O_ = class extends _t {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Yt(yt.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = zu(this.apiClient, e), n = t._url, r = $("{model}:batchGenerateContent", n), o = t.batch.inputConfig.requests, s = o.requests, a = [];
    for (const c of s) {
      const u = Object.assign({}, c);
      if (u.systemInstruction) {
        const d = u.systemInstruction;
        delete u.systemInstruction;
        const h = u.request;
        h.systemInstruction = d, u.request = h;
      }
      a.push(u);
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
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = c_(this.apiClient, e);
      return a = $("batchPredictionJobs", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => oi(d));
    } else {
      const u = zu(this.apiClient, e);
      return a = $("{model}:batchGenerateContent", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
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
      const a = f_(this.apiClient, e);
      return o = $("{model}:asyncBatchEmbedContent", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => ho(c));
    }
  }
  async get(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = I_(this.apiClient, e);
      return a = $("batchPredictionJobs/{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => oi(d));
    } else {
      const u = C_(this.apiClient, e);
      return a = $("batches/{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
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
      const c = s_(this.apiClient, e);
      s = $("batchPredictionJobs/{name}:cancel", c._url), a = c._query, delete c._url, delete c._query, await this.apiClient.request({
        path: s,
        queryParams: a,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const c = o_(this.apiClient, e);
      s = $("batches/{name}:cancel", c._url), a = c._query, delete c._url, delete c._query, await this.apiClient.request({
        path: s,
        queryParams: a,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = $_(e);
      return a = $("batchPredictionJobs", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = U_(d), f = new Vu();
        return Object.assign(f, h), f;
      });
    } else {
      const u = D_(e);
      return a = $("batches", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = L_(d), f = new Vu();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = p_(this.apiClient, e);
      return a = $("batchPredictionJobs/{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => g_(d));
    } else {
      const u = h_(this.apiClient, e);
      return a = $("batches/{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => m_(d));
    }
  }
};
function H_(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function V_(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Yu(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => hv(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Xu(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => pv(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function J_(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const s = i(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const a = i(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let h = Ie(a);
    Array.isArray(h) && (h = h.map((f) => Yu(f))), l(t, ["contents"], h);
  }
  const c = i(e, ["systemInstruction"]);
  t !== void 0 && c != null && l(t, ["systemInstruction"], Yu(de(c)));
  const u = i(e, ["tools"]);
  if (t !== void 0 && u != null) {
    let h = u;
    Array.isArray(h) && (h = h.map((f) => yv(f))), l(t, ["tools"], h);
  }
  const d = i(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], mv(d)), i(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function K_(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const s = i(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const a = i(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = Ie(a);
    Array.isArray(f) && (f = f.map((p) => Xu(p))), l(t, ["contents"], f);
  }
  const c = i(e, ["systemInstruction"]);
  t !== void 0 && c != null && l(t, ["systemInstruction"], Xu(de(c)));
  const u = i(e, ["tools"]);
  if (t !== void 0 && u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => _v(p))), l(t, ["tools"], f);
  }
  const d = i(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], gv(d));
  const h = i(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function W_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["model"], Ef(e, r));
  const o = i(t, ["config"]);
  return o != null && J_(o, n), n;
}
function z_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["model"], Ef(e, r));
  const o = i(t, ["config"]);
  return o != null && K_(o, n), n;
}
function Y_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], vt(e, r)), n;
}
function X_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], vt(e, r)), n;
}
function Q_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Z_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function j_(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function ev(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function tv(e) {
  const t = {}, n = i(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = i(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function nv(e) {
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
  const c = i(e, ["responseJsonSchema"]);
  if (c != null && l(t, ["responseJsonSchema"], c), i(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function rv(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], vt(e, r)), n;
}
function ov(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], vt(e, r)), n;
}
function sv(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], H_(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function iv(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function av(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function lv(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function uv(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && av(n, t), t;
}
function cv(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && lv(n, t), t;
}
function dv(e) {
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
function fv(e) {
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
function hv(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], j_(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], ev(a));
  const c = i(e, ["functionResponse"]);
  c != null && l(t, ["functionResponse"], c);
  const u = i(e, ["inlineData"]);
  u != null && l(t, ["inlineData"], V_(u));
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
function pv(e) {
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
  const c = i(e, ["functionResponse"]);
  c != null && l(t, ["functionResponse"], c);
  const u = i(e, ["inlineData"]);
  u != null && l(t, ["inlineData"], u);
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
function mv(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = i(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], tv(r));
  const o = i(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function gv(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = i(e, ["functionCallingConfig"]);
  if (r != null && l(t, ["functionCallingConfig"], r), i(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function yv(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], iv(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], sv(s));
  const a = i(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = i(e, ["functionDeclarations"]);
  if (c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const u = i(e, ["googleSearchRetrieval"]);
  if (u != null && l(t, ["googleSearchRetrieval"], u), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = i(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = i(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function _v(e) {
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
  const c = i(e, ["enterpriseWebSearch"]);
  c != null && l(t, ["enterpriseWebSearch"], c);
  const u = i(e, ["functionDeclarations"]);
  if (u != null) {
    let p = u;
    Array.isArray(p) && (p = p.map((m) => nv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = i(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = i(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = i(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function vv(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function Av(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function Sv(e, t) {
  const n = {}, r = i(t, ["name"]);
  r != null && l(n, ["_url", "name"], vt(e, r));
  const o = i(t, ["config"]);
  return o != null && vv(o, n), n;
}
function Tv(e, t) {
  const n = {}, r = i(t, ["name"]);
  r != null && l(n, ["_url", "name"], vt(e, r));
  const o = i(t, ["config"]);
  return o != null && Av(o, n), n;
}
var Ev = class extends _t {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Yt(yt.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = z_(this.apiClient, e);
      return a = $("cachedContents", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const u = W_(this.apiClient, e);
      return a = $("cachedContents", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    }
  }
  async get(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = ov(this.apiClient, e);
      return a = $("{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const u = rv(this.apiClient, e);
      return a = $("{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    }
  }
  async delete(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = X_(this.apiClient, e);
      return a = $("{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Z_(d), f = new Ou();
        return Object.assign(f, h), f;
      });
    } else {
      const u = Y_(this.apiClient, e);
      return a = $("{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = Q_(d), f = new Ou();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = Tv(this.apiClient, e);
      return a = $("{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const u = Sv(this.apiClient, e);
      return a = $("{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = cv(e);
      return a = $("cachedContents", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = fv(d), f = new Hu();
        return Object.assign(f, h), f;
      });
    } else {
      const u = uv(e);
      return a = $("cachedContents", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = dv(d), f = new Hu();
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
function Qu(e) {
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
  return o = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), c("next"), c("throw"), c("return", a), o[Symbol.asyncIterator] = function() {
    return this;
  }, o;
  function a(m) {
    return function(g) {
      return Promise.resolve(g).then(m, f);
    };
  }
  function c(m, g) {
    r[m] && (o[m] = function(_) {
      return new Promise(function(v, w) {
        s.push([
          m,
          _,
          v,
          w
        ]) > 1 || u(m, _);
      });
    }, g && (o[m] = g(o[m])));
  }
  function u(m, g) {
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
    u("next", m);
  }
  function f(m) {
    u("throw", m);
  }
  function p(m, g) {
    m(g), s.shift(), s.length && u(s[0][0], s[0][1]);
  }
}
function nt(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Qu == "function" ? Qu(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function r(s) {
    n[s] = e[s] && function(a) {
      return new Promise(function(c, u) {
        a = e[s](a), o(c, u, a.done, a.value);
      });
    };
  }
  function o(s, a, c, u) {
    Promise.resolve(u).then(function(d) {
      s({
        value: d,
        done: c
      });
    }, a);
  }
}
function wv(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : Lf(n);
}
function Lf(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function Cv(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Zu(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let r = 0;
  for (; r < n; ) if (e[r].role === "user")
    t.push(e[r]), r++;
  else {
    const o = [];
    let s = !0;
    for (; r < n && e[r].role === "model"; )
      o.push(e[r]), s && !Lf(e[r]) && (s = !1), r++;
    s ? t.push(...o) : t.pop();
  }
  return t;
}
var Iv = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new bv(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, bv = class {
  constructor(e, t, n, r = {}, o = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = r, this.history = o, this.sendPromise = Promise.resolve(), Cv(o);
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
      const c = await r, u = (s = (o = c.candidates) === null || o === void 0 ? void 0 : o[0]) === null || s === void 0 ? void 0 : s.content, d = c.automaticFunctionCallingHistory, h = this.getHistory(!0).length;
      let f = [];
      d != null && (f = (a = d.slice(h)) !== null && a !== void 0 ? a : []);
      const p = u ? [u] : [];
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
    const t = e ? Zu(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return tt(this, arguments, function* () {
      var r, o, s, a, c, u;
      const d = [];
      try {
        for (var h = !0, f = nt(e), p; p = yield J(f.next()), r = p.done, !r; h = !0) {
          a = p.value, h = !1;
          const m = a;
          if (wv(m)) {
            const g = (u = (c = m.candidates) === null || c === void 0 ? void 0 : c[0]) === null || u === void 0 ? void 0 : u.content;
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
    }), n && n.length > 0 ? this.history.push(...Zu(n)) : this.history.push(e), this.history.push(...r);
  }
}, Uf = class Ff extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Ff.prototype);
  }
};
function Pv(e) {
  const t = {}, n = i(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function Rv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function xv(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Rf(n)), t;
}
function Mv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Nv(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Rf(n)), t;
}
function kv(e) {
  const t = {}, n = i(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function Dv(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function $v(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && Dv(n, t), t;
}
function Lv(e) {
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
function Uv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["files"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["files"], o);
  }
  return t;
}
var Fv = class extends _t {
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
      const a = $v(e);
      return o = $("files", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json().then((u) => {
        const d = u;
        return d.sdkHttpResponse = { headers: c.headers }, d;
      })), r.then((c) => {
        const u = Lv(c), d = new ky();
        return Object.assign(d, u), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Pv(e);
      return o = $("upload/v1beta/files", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => {
        const u = Rv(c), d = new Dy();
        return Object.assign(d, u), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Nv(e);
      return o = $("files/{file}", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => c);
    }
  }
  async delete(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = xv(e);
      return o = $("files/{file}", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json().then((u) => {
        const d = u;
        return d.sdkHttpResponse = { headers: c.headers }, d;
      })), r.then((c) => {
        const u = Mv(c), d = new $y();
        return Object.assign(d, u), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = kv(e);
      return o = $("files:register", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => {
        const u = Uv(c), d = new Ly();
        return Object.assign(d, u), d;
      });
    }
  }
};
function ju(e) {
  const t = {};
  if (i(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function qv(e) {
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
function Bv(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => rA(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Gv(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => oA(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Ov(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Hv(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Vv(e) {
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
  const c = i(e, ["responseJsonSchema"]);
  if (c != null && l(t, ["responseJsonSchema"], c), i(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function Jv(e) {
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
  const c = i(e, ["frequencyPenalty"]);
  c != null && l(t, ["frequencyPenalty"], c);
  const u = i(e, ["logprobs"]);
  u != null && l(t, ["logprobs"], u);
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
function Kv(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], qv(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function Wv(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function zv(e, t) {
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
  const c = i(e, ["topK"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], c);
  const u = i(e, ["maxOutputTokens"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], u);
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
  ], ea(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Bv(de(g)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let R = Tn(_);
    Array.isArray(R) && (R = R.map((D) => aA(Sn(D)))), l(t, ["setup", "tools"], R);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], iA(v));
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], ju(w));
  const I = i(e, ["outputAudioTranscription"]);
  t !== void 0 && I != null && l(t, ["setup", "outputAudioTranscription"], ju(I));
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
    Array.isArray(R) && (R = R.map((D) => sA(D))), l(t, ["setup", "safetySettings"], R);
  }
  return n;
}
function Yv(e, t) {
  const n = {}, r = i(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], Jv(r));
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
  const c = i(e, ["topK"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], c);
  const u = i(e, ["maxOutputTokens"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], u);
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
  ], ea(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Gv(de(g)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let D = Tn(_);
    Array.isArray(D) && (D = D.map((H) => lA(Sn(H)))), l(t, ["setup", "tools"], D);
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
function Xv(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = i(t, ["config"]);
  return o != null && l(n, ["config"], zv(o, n)), n;
}
function Qv(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = i(t, ["config"]);
  return o != null && l(n, ["config"], Yv(o, n)), n;
}
function Zv(e) {
  const t = {}, n = i(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function jv(e) {
  const t = {}, n = i(e, ["weightedPrompts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["weightedPrompts"], r);
  }
  return t;
}
function eA(e) {
  const t = {}, n = i(e, ["media"]);
  if (n != null) {
    let d = wf(n);
    Array.isArray(d) && (d = d.map((h) => po(h))), l(t, ["mediaChunks"], d);
  }
  const r = i(e, ["audio"]);
  r != null && l(t, ["audio"], po(If(r)));
  const o = i(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const s = i(e, ["video"]);
  s != null && l(t, ["video"], po(Cf(s)));
  const a = i(e, ["text"]);
  a != null && l(t, ["text"], a);
  const c = i(e, ["activityStart"]);
  c != null && l(t, ["activityStart"], c);
  const u = i(e, ["activityEnd"]);
  return u != null && l(t, ["activityEnd"], u), t;
}
function tA(e) {
  const t = {}, n = i(e, ["media"]);
  if (n != null) {
    let d = wf(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const r = i(e, ["audio"]);
  r != null && l(t, ["audio"], If(r));
  const o = i(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const s = i(e, ["video"]);
  s != null && l(t, ["video"], Cf(s));
  const a = i(e, ["text"]);
  a != null && l(t, ["text"], a);
  const c = i(e, ["activityStart"]);
  c != null && l(t, ["activityStart"], c);
  const u = i(e, ["activityEnd"]);
  return u != null && l(t, ["activityEnd"], u), t;
}
function nA(e) {
  const t = {}, n = i(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const r = i(e, ["serverContent"]);
  r != null && l(t, ["serverContent"], r);
  const o = i(e, ["toolCall"]);
  o != null && l(t, ["toolCall"], o);
  const s = i(e, ["toolCallCancellation"]);
  s != null && l(t, ["toolCallCancellation"], s);
  const a = i(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], uA(a));
  const c = i(e, ["goAway"]);
  c != null && l(t, ["goAway"], c);
  const u = i(e, ["sessionResumptionUpdate"]);
  u != null && l(t, ["sessionResumptionUpdate"], u);
  const d = i(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = i(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], cA(h)), t;
}
function rA(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], Ov(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Hv(a));
  const c = i(e, ["functionResponse"]);
  c != null && l(t, ["functionResponse"], c);
  const u = i(e, ["inlineData"]);
  u != null && l(t, ["inlineData"], po(u));
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
function oA(e) {
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
  const c = i(e, ["functionResponse"]);
  c != null && l(t, ["functionResponse"], c);
  const u = i(e, ["inlineData"]);
  u != null && l(t, ["inlineData"], u);
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
function sA(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = i(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function iA(e) {
  const t = {}, n = i(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), i(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function aA(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], Wv(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], Kv(s));
  const a = i(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = i(e, ["functionDeclarations"]);
  if (c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const u = i(e, ["googleSearchRetrieval"]);
  if (u != null && l(t, ["googleSearchRetrieval"], u), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = i(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = i(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function lA(e) {
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
  const c = i(e, ["enterpriseWebSearch"]);
  c != null && l(t, ["enterpriseWebSearch"], c);
  const u = i(e, ["functionDeclarations"]);
  if (u != null) {
    let p = u;
    Array.isArray(p) && (p = p.map((m) => Vv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = i(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = i(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = i(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function uA(e) {
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
  const c = i(e, ["totalTokenCount"]);
  c != null && l(t, ["totalTokenCount"], c);
  const u = i(e, ["promptTokensDetails"]);
  if (u != null) {
    let m = u;
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
function cA(e) {
  const t = {}, n = i(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function dA(e, t) {
  const n = {}, r = i(e, ["apiKey"]);
  if (r != null && l(n, ["apiKey"], r), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function fA(e, t) {
  const n = {}, r = i(e, ["data"]);
  if (r != null && l(n, ["data"], r), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function hA(e, t) {
  const n = {}, r = i(e, ["content"]);
  r != null && l(n, ["content"], r);
  const o = i(e, ["citationMetadata"]);
  o != null && l(n, ["citationMetadata"], pA(o));
  const s = i(e, ["tokenCount"]);
  s != null && l(n, ["tokenCount"], s);
  const a = i(e, ["finishReason"]);
  a != null && l(n, ["finishReason"], a);
  const c = i(e, ["groundingMetadata"]);
  c != null && l(n, ["groundingMetadata"], c);
  const u = i(e, ["avgLogprobs"]);
  u != null && l(n, ["avgLogprobs"], u);
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
function pA(e, t) {
  const n = {}, r = i(e, ["citationSources"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => s)), l(n, ["citations"], o);
  }
  return n;
}
function mA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let a = Ie(s);
    Array.isArray(a) && (a = a.map((c) => wn(c))), l(r, ["contents"], a);
  }
  return r;
}
function gA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["tokensInfo"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(n, ["tokensInfo"], s);
  }
  return n;
}
function yA(e, t) {
  const n = {}, r = i(e, ["values"]);
  r != null && l(n, ["values"], r);
  const o = i(e, ["statistics"]);
  return o != null && l(n, ["statistics"], _A(o)), n;
}
function _A(e, t) {
  const n = {}, r = i(e, ["truncated"]);
  r != null && l(n, ["truncated"], r);
  const o = i(e, ["token_count"]);
  return o != null && l(n, ["tokenCount"], o), n;
}
function br(e, t) {
  const n = {}, r = i(e, ["parts"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => bS(a))), l(n, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function wn(e, t) {
  const n = {}, r = i(e, ["parts"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => PS(a))), l(n, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function vA(e, t) {
  const n = {}, r = i(e, ["controlType"]);
  r != null && l(n, ["controlType"], r);
  const o = i(e, ["enableControlImageComputation"]);
  return o != null && l(n, ["computeControl"], o), n;
}
function AA(e, t) {
  const n = {};
  if (i(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (i(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (i(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function SA(e, t, n) {
  const r = {}, o = i(e, ["systemInstruction"]);
  t !== void 0 && o != null && l(t, ["systemInstruction"], wn(de(o)));
  const s = i(e, ["tools"]);
  if (t !== void 0 && s != null) {
    let c = s;
    Array.isArray(c) && (c = c.map((u) => Of(u))), l(t, ["tools"], c);
  }
  const a = i(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], fS(a)), r;
}
function TA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let c = Ie(s);
    Array.isArray(c) && (c = c.map((u) => br(u))), l(r, ["contents"], c);
  }
  const a = i(t, ["config"]);
  return a != null && AA(a), r;
}
function EA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let c = Ie(s);
    Array.isArray(c) && (c = c.map((u) => wn(u))), l(r, ["contents"], c);
  }
  const a = i(t, ["config"]);
  return a != null && SA(a, r), r;
}
function wA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["totalTokens"]);
  o != null && l(n, ["totalTokens"], o);
  const s = i(e, ["cachedContentTokenCount"]);
  return s != null && l(n, ["cachedContentTokenCount"], s), n;
}
function CA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["totalTokens"]);
  return o != null && l(n, ["totalTokens"], o), n;
}
function IA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function bA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function PA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function RA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function xA(e, t, n) {
  const r = {}, o = i(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
  const s = i(e, ["negativePrompt"]);
  t !== void 0 && s != null && l(t, ["parameters", "negativePrompt"], s);
  const a = i(e, ["numberOfImages"]);
  t !== void 0 && a != null && l(t, ["parameters", "sampleCount"], a);
  const c = i(e, ["aspectRatio"]);
  t !== void 0 && c != null && l(t, ["parameters", "aspectRatio"], c);
  const u = i(e, ["guidanceScale"]);
  t !== void 0 && u != null && l(t, ["parameters", "guidanceScale"], u);
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
function MA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["referenceImages"]);
  if (a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((d) => DS(d))), l(r, ["instances[0]", "referenceImages"], u);
  }
  const c = i(t, ["config"]);
  return c != null && xA(c, r), r;
}
function NA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => Ko(a))), l(n, ["generatedImages"], s);
  }
  return n;
}
function kA(e, t, n) {
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
function DA(e, t, n) {
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
  let c = i(n, ["embeddingApiType"]);
  if (c === void 0 && (c = "PREDICT"), c === "PREDICT") {
    const f = i(e, ["mimeType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "mimeType"], f);
  }
  let u = i(n, ["embeddingApiType"]);
  if (u === void 0 && (u = "PREDICT"), u === "PREDICT") {
    const f = i(e, ["autoTruncate"]);
    t !== void 0 && f != null && l(t, ["parameters", "autoTruncate"], f);
  } else if (u === "EMBED_CONTENT") {
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
function $A(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let d = Qi(e, s);
    Array.isArray(d) && (d = d.map((h) => h)), l(r, ["requests[]", "content"], d);
  }
  const a = i(t, ["content"]);
  a != null && br(de(a));
  const c = i(t, ["config"]);
  c != null && kA(c, r);
  const u = i(t, ["model"]);
  return u !== void 0 && l(r, ["requests[]", "model"], Y(e, u)), r;
}
function LA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  let s = i(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "PREDICT") {
    const u = i(t, ["contents"]);
    if (u != null) {
      let d = Qi(e, u);
      Array.isArray(d) && (d = d.map((h) => h)), l(r, ["instances[]", "content"], d);
    }
  }
  let a = i(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const u = i(t, ["content"]);
    u != null && l(r, ["content"], wn(de(u)));
  }
  const c = i(t, ["config"]);
  return c != null && DA(c, r, n), r;
}
function UA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["embeddings"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((c) => c)), l(n, ["embeddings"], a);
  }
  const s = i(e, ["metadata"]);
  return s != null && l(n, ["metadata"], s), n;
}
function FA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions[]", "embeddings"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((c) => yA(c))), l(n, ["embeddings"], a);
  }
  const s = i(e, ["metadata"]);
  if (s != null && l(n, ["metadata"], s), t && i(t, ["embeddingApiType"]) === "EMBED_CONTENT") {
    const a = i(e, ["embedding"]), c = i(e, ["usageMetadata"]), u = i(e, ["truncated"]);
    if (a) {
      const d = {};
      c && c.promptTokenCount && (d.tokenCount = c.promptTokenCount), u && (d.truncated = u), a.statistics = d, l(n, ["embeddings"], [a]);
    }
  }
  return n;
}
function qA(e, t) {
  const n = {}, r = i(e, ["endpoint"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["deployedModelId"]);
  return o != null && l(n, ["deployedModelId"], o), n;
}
function BA(e, t) {
  const n = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["fileUri"]);
  r != null && l(n, ["fileUri"], r);
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function GA(e, t) {
  const n = {}, r = i(e, ["id"]);
  r != null && l(n, ["id"], r);
  const o = i(e, ["args"]);
  o != null && l(n, ["args"], o);
  const s = i(e, ["name"]);
  if (s != null && l(n, ["name"], s), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function OA(e, t) {
  const n = {}, r = i(e, ["allowedFunctionNames"]);
  r != null && l(n, ["allowedFunctionNames"], r);
  const o = i(e, ["mode"]);
  if (o != null && l(n, ["mode"], o), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function HA(e, t) {
  const n = {}, r = i(e, ["description"]);
  r != null && l(n, ["description"], r);
  const o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["parameters"]);
  s != null && l(n, ["parameters"], s);
  const a = i(e, ["parametersJsonSchema"]);
  a != null && l(n, ["parametersJsonSchema"], a);
  const c = i(e, ["response"]);
  c != null && l(n, ["response"], c);
  const u = i(e, ["responseJsonSchema"]);
  if (u != null && l(n, ["responseJsonSchema"], u), i(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return n;
}
function VA(e, t, n, r) {
  const o = {}, s = i(t, ["systemInstruction"]);
  n !== void 0 && s != null && l(n, ["systemInstruction"], br(de(s)));
  const a = i(t, ["temperature"]);
  a != null && l(o, ["temperature"], a);
  const c = i(t, ["topP"]);
  c != null && l(o, ["topP"], c);
  const u = i(t, ["topK"]);
  u != null && l(o, ["topK"], u);
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
  I != null && l(o, ["responseSchema"], Zi(I));
  const P = i(t, ["responseJsonSchema"]);
  if (P != null && l(o, ["responseJsonSchema"], P), i(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (i(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const M = i(t, ["safetySettings"]);
  if (n !== void 0 && M != null) {
    let X = M;
    Array.isArray(X) && (X = X.map((me) => $S(me))), l(n, ["safetySettings"], X);
  }
  const x = i(t, ["tools"]);
  if (n !== void 0 && x != null) {
    let X = Tn(x);
    Array.isArray(X) && (X = X.map((me) => HS(Sn(me)))), l(n, ["tools"], X);
  }
  const C = i(t, ["toolConfig"]);
  if (n !== void 0 && C != null && l(n, ["toolConfig"], GS(C)), i(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const F = i(t, ["cachedContent"]);
  n !== void 0 && F != null && l(n, ["cachedContent"], vt(e, F));
  const R = i(t, ["responseModalities"]);
  R != null && l(o, ["responseModalities"], R);
  const D = i(t, ["mediaResolution"]);
  D != null && l(o, ["mediaResolution"], D);
  const H = i(t, ["speechConfig"]);
  if (H != null && l(o, ["speechConfig"], ji(H)), i(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const z = i(t, ["thinkingConfig"]);
  z != null && l(o, ["thinkingConfig"], z);
  const j = i(t, ["imageConfig"]);
  j != null && l(o, ["imageConfig"], yS(j));
  const ee = i(t, ["enableEnhancedCivicAnswers"]);
  if (ee != null && l(o, ["enableEnhancedCivicAnswers"], ee), i(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const Q = i(t, ["serviceTier"]);
  return n !== void 0 && Q != null && l(n, ["serviceTier"], Q), o;
}
function JA(e, t, n, r) {
  const o = {}, s = i(t, ["systemInstruction"]);
  n !== void 0 && s != null && l(n, ["systemInstruction"], wn(de(s)));
  const a = i(t, ["temperature"]);
  a != null && l(o, ["temperature"], a);
  const c = i(t, ["topP"]);
  c != null && l(o, ["topP"], c);
  const u = i(t, ["topK"]);
  u != null && l(o, ["topK"], u);
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
  I != null && l(o, ["responseSchema"], Zi(I));
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
    Array.isArray(_e) && (_e = _e.map((Xt) => Of(Sn(Xt)))), l(n, ["tools"], _e);
  }
  const R = i(t, ["toolConfig"]);
  n !== void 0 && R != null && l(n, ["toolConfig"], OS(R));
  const D = i(t, ["labels"]);
  n !== void 0 && D != null && l(n, ["labels"], D);
  const H = i(t, ["cachedContent"]);
  n !== void 0 && H != null && l(n, ["cachedContent"], vt(e, H));
  const z = i(t, ["responseModalities"]);
  z != null && l(o, ["responseModalities"], z);
  const j = i(t, ["mediaResolution"]);
  j != null && l(o, ["mediaResolution"], j);
  const ee = i(t, ["speechConfig"]);
  ee != null && l(o, ["speechConfig"], ji(ee));
  const Q = i(t, ["audioTimestamp"]);
  Q != null && l(o, ["audioTimestamp"], Q);
  const X = i(t, ["thinkingConfig"]);
  X != null && l(o, ["thinkingConfig"], X);
  const me = i(t, ["imageConfig"]);
  if (me != null && l(o, ["imageConfig"], _S(me)), i(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Ge = i(t, ["modelArmorConfig"]);
  n !== void 0 && Ge != null && l(n, ["modelArmorConfig"], Ge);
  const Te = i(t, ["serviceTier"]);
  return n !== void 0 && Te != null && l(n, ["serviceTier"], Te), o;
}
function ec(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let c = Ie(s);
    Array.isArray(c) && (c = c.map((u) => br(u))), l(r, ["contents"], c);
  }
  const a = i(t, ["config"]);
  return a != null && l(r, ["generationConfig"], VA(e, a, r)), r;
}
function tc(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let c = Ie(s);
    Array.isArray(c) && (c = c.map((u) => wn(u))), l(r, ["contents"], c);
  }
  const a = i(t, ["config"]);
  return a != null && l(r, ["generationConfig"], JA(e, a, r)), r;
}
function nc(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["candidates"]);
  if (o != null) {
    let h = o;
    Array.isArray(h) && (h = h.map((f) => hA(f))), l(n, ["candidates"], h);
  }
  const s = i(e, ["modelVersion"]);
  s != null && l(n, ["modelVersion"], s);
  const a = i(e, ["promptFeedback"]);
  a != null && l(n, ["promptFeedback"], a);
  const c = i(e, ["responseId"]);
  c != null && l(n, ["responseId"], c);
  const u = i(e, ["usageMetadata"]);
  u != null && l(n, ["usageMetadata"], u);
  const d = i(e, ["modelStatus"]);
  return d != null && l(n, ["modelStatus"], d), n;
}
function rc(e, t) {
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
  const c = i(e, ["promptFeedback"]);
  c != null && l(n, ["promptFeedback"], c);
  const u = i(e, ["responseId"]);
  u != null && l(n, ["responseId"], u);
  const d = i(e, ["usageMetadata"]);
  return d != null && l(n, ["usageMetadata"], d), n;
}
function KA(e, t, n) {
  const r = {};
  if (i(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (i(e, ["negativePrompt"]) !== void 0) throw new Error("negativePrompt parameter is not supported in Gemini API.");
  const o = i(e, ["numberOfImages"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
  const s = i(e, ["aspectRatio"]);
  t !== void 0 && s != null && l(t, ["parameters", "aspectRatio"], s);
  const a = i(e, ["guidanceScale"]);
  if (t !== void 0 && a != null && l(t, ["parameters", "guidanceScale"], a), i(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const c = i(e, ["safetyFilterLevel"]);
  t !== void 0 && c != null && l(t, ["parameters", "safetySetting"], c);
  const u = i(e, ["personGeneration"]);
  t !== void 0 && u != null && l(t, ["parameters", "personGeneration"], u);
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
function WA(e, t, n) {
  const r = {}, o = i(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
  const s = i(e, ["negativePrompt"]);
  t !== void 0 && s != null && l(t, ["parameters", "negativePrompt"], s);
  const a = i(e, ["numberOfImages"]);
  t !== void 0 && a != null && l(t, ["parameters", "sampleCount"], a);
  const c = i(e, ["aspectRatio"]);
  t !== void 0 && c != null && l(t, ["parameters", "aspectRatio"], c);
  const u = i(e, ["guidanceScale"]);
  t !== void 0 && u != null && l(t, ["parameters", "guidanceScale"], u);
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
function zA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["config"]);
  return a != null && KA(a, r), r;
}
function YA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["config"]);
  return a != null && WA(a, r), r;
}
function XA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((c) => lS(c))), l(n, ["generatedImages"], a);
  }
  const s = i(e, ["positivePromptSafetyAttributes"]);
  return s != null && l(n, ["positivePromptSafetyAttributes"], Bf(s)), n;
}
function QA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((c) => Ko(c))), l(n, ["generatedImages"], a);
  }
  const s = i(e, ["positivePromptSafetyAttributes"]);
  return s != null && l(n, ["positivePromptSafetyAttributes"], Gf(s)), n;
}
function ZA(e, t, n) {
  const r = {}, o = i(e, ["numberOfVideos"]);
  if (t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o), i(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (i(e, ["fps"]) !== void 0) throw new Error("fps parameter is not supported in Gemini API.");
  const s = i(e, ["durationSeconds"]);
  if (t !== void 0 && s != null && l(t, ["parameters", "durationSeconds"], s), i(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const a = i(e, ["aspectRatio"]);
  t !== void 0 && a != null && l(t, ["parameters", "aspectRatio"], a);
  const c = i(e, ["resolution"]);
  t !== void 0 && c != null && l(t, ["parameters", "resolution"], c);
  const u = i(e, ["personGeneration"]);
  if (t !== void 0 && u != null && l(t, ["parameters", "personGeneration"], u), i(e, ["pubsubTopic"]) !== void 0) throw new Error("pubsubTopic parameter is not supported in Gemini API.");
  const d = i(e, ["negativePrompt"]);
  t !== void 0 && d != null && l(t, ["parameters", "negativePrompt"], d);
  const h = i(e, ["enhancePrompt"]);
  if (t !== void 0 && h != null && l(t, ["parameters", "enhancePrompt"], h), i(e, ["generateAudio"]) !== void 0) throw new Error("generateAudio parameter is not supported in Gemini API.");
  const f = i(e, ["lastFrame"]);
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Wo(f));
  const p = i(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => nT(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (i(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (i(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (i(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = i(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), r;
}
function jA(e, t, n) {
  const r = {}, o = i(e, ["numberOfVideos"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
  const s = i(e, ["outputGcsUri"]);
  t !== void 0 && s != null && l(t, ["parameters", "storageUri"], s);
  const a = i(e, ["fps"]);
  t !== void 0 && a != null && l(t, ["parameters", "fps"], a);
  const c = i(e, ["durationSeconds"]);
  t !== void 0 && c != null && l(t, ["parameters", "durationSeconds"], c);
  const u = i(e, ["seed"]);
  t !== void 0 && u != null && l(t, ["parameters", "seed"], u);
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
    Array.isArray(x) && (x = x.map((C) => rT(C))), l(t, ["instances[0]", "referenceImages"], x);
  }
  const I = i(e, ["mask"]);
  t !== void 0 && I != null && l(t, ["instances[0]", "mask"], tT(I));
  const P = i(e, ["compressionQuality"]);
  t !== void 0 && P != null && l(t, ["parameters", "compressionQuality"], P);
  const M = i(e, ["labels"]);
  if (t !== void 0 && M != null && l(t, ["labels"], M), i(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return r;
}
function eS(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const s = i(e, ["done"]);
  s != null && l(n, ["done"], s);
  const a = i(e, ["error"]);
  a != null && l(n, ["error"], a);
  const c = i(e, ["response", "generateVideoResponse"]);
  return c != null && l(n, ["response"], oS(c)), n;
}
function tS(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const s = i(e, ["done"]);
  s != null && l(n, ["done"], s);
  const a = i(e, ["error"]);
  a != null && l(n, ["error"], a);
  const c = i(e, ["response"]);
  return c != null && l(n, ["response"], sS(c)), n;
}
function nS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], Wo(a));
  const c = i(t, ["video"]);
  c != null && l(r, ["instances[0]", "video"], Hf(c));
  const u = i(t, ["source"]);
  u != null && iS(u, r);
  const d = i(t, ["config"]);
  return d != null && ZA(d, r), r;
}
function rS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], rt(a));
  const c = i(t, ["video"]);
  c != null && l(r, ["instances[0]", "video"], Vf(c));
  const u = i(t, ["source"]);
  u != null && aS(u, r);
  const d = i(t, ["config"]);
  return d != null && jA(d, r), r;
}
function oS(e, t) {
  const n = {}, r = i(e, ["generatedSamples"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((c) => cS(c))), l(n, ["generatedVideos"], a);
  }
  const o = i(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const s = i(e, ["raiMediaFilteredReasons"]);
  return s != null && l(n, ["raiMediaFilteredReasons"], s), n;
}
function sS(e, t) {
  const n = {}, r = i(e, ["videos"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((c) => dS(c))), l(n, ["generatedVideos"], a);
  }
  const o = i(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const s = i(e, ["raiMediaFilteredReasons"]);
  return s != null && l(n, ["raiMediaFilteredReasons"], s), n;
}
function iS(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["image"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "image"], Wo(s));
  const a = i(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Hf(a)), r;
}
function aS(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["image"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "image"], rt(s));
  const a = i(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Vf(a)), r;
}
function lS(e, t) {
  const n = {}, r = i(e, ["_self"]);
  r != null && l(n, ["image"], vS(r));
  const o = i(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const s = i(e, ["_self"]);
  return s != null && l(n, ["safetyAttributes"], Bf(s)), n;
}
function Ko(e, t) {
  const n = {}, r = i(e, ["_self"]);
  r != null && l(n, ["image"], qf(r));
  const o = i(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const s = i(e, ["_self"]);
  s != null && l(n, ["safetyAttributes"], Gf(s));
  const a = i(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function uS(e, t) {
  const n = {}, r = i(e, ["_self"]);
  r != null && l(n, ["mask"], qf(r));
  const o = i(e, ["labels"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(n, ["labels"], s);
  }
  return n;
}
function cS(e, t) {
  const n = {}, r = i(e, ["video"]);
  return r != null && l(n, ["video"], jS(r)), n;
}
function dS(e, t) {
  const n = {}, r = i(e, ["_self"]);
  return r != null && l(n, ["video"], eT(r)), n;
}
function fS(e, t) {
  const n = {}, r = i(e, ["modelSelectionConfig"]);
  r != null && l(n, ["modelConfig"], r);
  const o = i(e, ["responseJsonSchema"]);
  o != null && l(n, ["responseJsonSchema"], o);
  const s = i(e, ["audioTimestamp"]);
  s != null && l(n, ["audioTimestamp"], s);
  const a = i(e, ["candidateCount"]);
  a != null && l(n, ["candidateCount"], a);
  const c = i(e, ["enableAffectiveDialog"]);
  c != null && l(n, ["enableAffectiveDialog"], c);
  const u = i(e, ["frequencyPenalty"]);
  u != null && l(n, ["frequencyPenalty"], u);
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
function hS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function pS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function mS(e, t) {
  const n = {}, r = i(e, ["authConfig"]);
  r != null && l(n, ["authConfig"], dA(r));
  const o = i(e, ["enableWidget"]);
  return o != null && l(n, ["enableWidget"], o), n;
}
function gS(e, t) {
  const n = {}, r = i(e, ["searchTypes"]);
  if (r != null && l(n, ["searchTypes"], r), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = i(e, ["timeRangeFilter"]);
  return o != null && l(n, ["timeRangeFilter"], o), n;
}
function yS(e, t) {
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
function _S(e, t) {
  const n = {}, r = i(e, ["aspectRatio"]);
  r != null && l(n, ["aspectRatio"], r);
  const o = i(e, ["imageSize"]);
  o != null && l(n, ["imageSize"], o);
  const s = i(e, ["personGeneration"]);
  s != null && l(n, ["personGeneration"], s);
  const a = i(e, ["prominentPeople"]);
  a != null && l(n, ["prominentPeople"], a);
  const c = i(e, ["outputMimeType"]);
  c != null && l(n, ["imageOutputOptions", "mimeType"], c);
  const u = i(e, ["outputCompressionQuality"]);
  u != null && l(n, ["imageOutputOptions", "compressionQuality"], u);
  const d = i(e, ["imageOutputOptions"]);
  return d != null && l(n, ["imageOutputOptions"], d), n;
}
function vS(e, t) {
  const n = {}, r = i(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], Nt(r));
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function qf(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = i(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], Nt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function Wo(e, t) {
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
function AS(e, t, n, r) {
  const o = {}, s = i(t, ["pageSize"]);
  n !== void 0 && s != null && l(n, ["_query", "pageSize"], s);
  const a = i(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const c = i(t, ["filter"]);
  n !== void 0 && c != null && l(n, ["_query", "filter"], c);
  const u = i(t, ["queryBase"]);
  return n !== void 0 && u != null && l(n, ["_url", "models_url"], xf(e, u)), o;
}
function SS(e, t, n, r) {
  const o = {}, s = i(t, ["pageSize"]);
  n !== void 0 && s != null && l(n, ["_query", "pageSize"], s);
  const a = i(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const c = i(t, ["filter"]);
  n !== void 0 && c != null && l(n, ["_query", "filter"], c);
  const u = i(t, ["queryBase"]);
  return n !== void 0 && u != null && l(n, ["_url", "models_url"], xf(e, u)), o;
}
function TS(e, t, n) {
  const r = {}, o = i(t, ["config"]);
  return o != null && AS(e, o, r), r;
}
function ES(e, t, n) {
  const r = {}, o = i(t, ["config"]);
  return o != null && SS(e, o, r), r;
}
function wS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["_self"]);
  if (s != null) {
    let a = Mf(s);
    Array.isArray(a) && (a = a.map((c) => si(c))), l(n, ["models"], a);
  }
  return n;
}
function CS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["_self"]);
  if (s != null) {
    let a = Mf(s);
    Array.isArray(a) && (a = a.map((c) => ii(c))), l(n, ["models"], a);
  }
  return n;
}
function IS(e, t) {
  const n = {}, r = i(e, ["maskMode"]);
  r != null && l(n, ["maskMode"], r);
  const o = i(e, ["segmentationClasses"]);
  o != null && l(n, ["maskClasses"], o);
  const s = i(e, ["maskDilation"]);
  return s != null && l(n, ["dilation"], s), n;
}
function si(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const s = i(e, ["description"]);
  s != null && l(n, ["description"], s);
  const a = i(e, ["version"]);
  a != null && l(n, ["version"], a);
  const c = i(e, ["_self"]);
  c != null && l(n, ["tunedModelInfo"], VS(c));
  const u = i(e, ["inputTokenLimit"]);
  u != null && l(n, ["inputTokenLimit"], u);
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
function ii(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const s = i(e, ["description"]);
  s != null && l(n, ["description"], s);
  const a = i(e, ["versionId"]);
  a != null && l(n, ["version"], a);
  const c = i(e, ["deployedModels"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => qA(m))), l(n, ["endpoints"], p);
  }
  const u = i(e, ["labels"]);
  u != null && l(n, ["labels"], u);
  const d = i(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], JS(d));
  const h = i(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = i(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function bS(e, t) {
  const n = {}, r = i(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = i(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const s = i(e, ["executableCode"]);
  s != null && l(n, ["executableCode"], s);
  const a = i(e, ["fileData"]);
  a != null && l(n, ["fileData"], BA(a));
  const c = i(e, ["functionCall"]);
  c != null && l(n, ["functionCall"], GA(c));
  const u = i(e, ["functionResponse"]);
  u != null && l(n, ["functionResponse"], u);
  const d = i(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], fA(d));
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
function PS(e, t) {
  const n = {}, r = i(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = i(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const s = i(e, ["executableCode"]);
  s != null && l(n, ["executableCode"], s);
  const a = i(e, ["fileData"]);
  a != null && l(n, ["fileData"], a);
  const c = i(e, ["functionCall"]);
  c != null && l(n, ["functionCall"], c);
  const u = i(e, ["functionResponse"]);
  u != null && l(n, ["functionResponse"], u);
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
function RS(e, t) {
  const n = {}, r = i(e, ["productImage"]);
  return r != null && l(n, ["image"], rt(r)), n;
}
function xS(e, t, n) {
  const r = {}, o = i(e, ["numberOfImages"]);
  t !== void 0 && o != null && l(t, ["parameters", "sampleCount"], o);
  const s = i(e, ["baseSteps"]);
  t !== void 0 && s != null && l(t, ["parameters", "baseSteps"], s);
  const a = i(e, ["outputGcsUri"]);
  t !== void 0 && a != null && l(t, ["parameters", "storageUri"], a);
  const c = i(e, ["seed"]);
  t !== void 0 && c != null && l(t, ["parameters", "seed"], c);
  const u = i(e, ["safetyFilterLevel"]);
  t !== void 0 && u != null && l(t, ["parameters", "safetySetting"], u);
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
function MS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["source"]);
  s != null && kS(s, r);
  const a = i(t, ["config"]);
  return a != null && xS(a, r), r;
}
function NS(e, t) {
  const n = {}, r = i(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => Ko(s))), l(n, ["generatedImages"], o);
  }
  return n;
}
function kS(e, t, n) {
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
    let c = a;
    Array.isArray(c) && (c = c.map((u) => RS(u))), l(t, ["instances[0]", "productImages"], c);
  }
  return r;
}
function DS(e, t) {
  const n = {}, r = i(e, ["referenceImage"]);
  r != null && l(n, ["referenceImage"], rt(r));
  const o = i(e, ["referenceId"]);
  o != null && l(n, ["referenceId"], o);
  const s = i(e, ["referenceType"]);
  s != null && l(n, ["referenceType"], s);
  const a = i(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], IS(a));
  const c = i(e, ["controlImageConfig"]);
  c != null && l(n, ["controlImageConfig"], vA(c));
  const u = i(e, ["styleImageConfig"]);
  u != null && l(n, ["styleImageConfig"], u);
  const d = i(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function Bf(e, t) {
  const n = {}, r = i(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = i(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const s = i(e, ["contentType"]);
  return s != null && l(n, ["contentType"], s), n;
}
function Gf(e, t) {
  const n = {}, r = i(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = i(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const s = i(e, ["contentType"]);
  return s != null && l(n, ["contentType"], s), n;
}
function $S(e, t) {
  const n = {}, r = i(e, ["category"]);
  if (r != null && l(n, ["category"], r), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = i(e, ["threshold"]);
  return o != null && l(n, ["threshold"], o), n;
}
function LS(e, t) {
  const n = {}, r = i(e, ["image"]);
  return r != null && l(n, ["image"], rt(r)), n;
}
function US(e, t, n) {
  const r = {}, o = i(e, ["mode"]);
  t !== void 0 && o != null && l(t, ["parameters", "mode"], o);
  const s = i(e, ["maxPredictions"]);
  t !== void 0 && s != null && l(t, ["parameters", "maxPredictions"], s);
  const a = i(e, ["confidenceThreshold"]);
  t !== void 0 && a != null && l(t, ["parameters", "confidenceThreshold"], a);
  const c = i(e, ["maskDilation"]);
  t !== void 0 && c != null && l(t, ["parameters", "maskDilation"], c);
  const u = i(e, ["binaryColorThreshold"]);
  t !== void 0 && u != null && l(t, ["parameters", "binaryColorThreshold"], u);
  const d = i(e, ["labels"]);
  return t !== void 0 && d != null && l(t, ["labels"], d), r;
}
function FS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["source"]);
  s != null && BS(s, r);
  const a = i(t, ["config"]);
  return a != null && US(a, r), r;
}
function qS(e, t) {
  const n = {}, r = i(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => uS(s))), l(n, ["generatedMasks"], o);
  }
  return n;
}
function BS(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["image"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "image"], rt(s));
  const a = i(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], LS(a)), r;
}
function GS(e, t) {
  const n = {}, r = i(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = i(e, ["functionCallingConfig"]);
  o != null && l(n, ["functionCallingConfig"], OA(o));
  const s = i(e, ["includeServerSideToolInvocations"]);
  return s != null && l(n, ["includeServerSideToolInvocations"], s), n;
}
function OS(e, t) {
  const n = {}, r = i(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = i(e, ["functionCallingConfig"]);
  if (o != null && l(n, ["functionCallingConfig"], o), i(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function HS(e, t) {
  const n = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const r = i(e, ["computerUse"]);
  r != null && l(n, ["computerUse"], r);
  const o = i(e, ["fileSearch"]);
  o != null && l(n, ["fileSearch"], o);
  const s = i(e, ["googleSearch"]);
  s != null && l(n, ["googleSearch"], gS(s));
  const a = i(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], mS(a));
  const c = i(e, ["codeExecution"]);
  if (c != null && l(n, ["codeExecution"], c), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(e, ["functionDeclarations"]);
  if (u != null) {
    let p = u;
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
function Of(e, t) {
  const n = {}, r = i(e, ["retrieval"]);
  r != null && l(n, ["retrieval"], r);
  const o = i(e, ["computerUse"]);
  if (o != null && l(n, ["computerUse"], o), i(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const s = i(e, ["googleSearch"]);
  s != null && l(n, ["googleSearch"], s);
  const a = i(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], a);
  const c = i(e, ["codeExecution"]);
  c != null && l(n, ["codeExecution"], c);
  const u = i(e, ["enterpriseWebSearch"]);
  u != null && l(n, ["enterpriseWebSearch"], u);
  const d = i(e, ["functionDeclarations"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => HA(g))), l(n, ["functionDeclarations"], m);
  }
  const h = i(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = i(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = i(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function VS(e, t) {
  const n = {}, r = i(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const s = i(e, ["updateTime"]);
  return s != null && l(n, ["updateTime"], s), n;
}
function JS(e, t) {
  const n = {}, r = i(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const s = i(e, ["updateTime"]);
  return s != null && l(n, ["updateTime"], s), n;
}
function KS(e, t, n) {
  const r = {}, o = i(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = i(e, ["description"]);
  t !== void 0 && s != null && l(t, ["description"], s);
  const a = i(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function WS(e, t, n) {
  const r = {}, o = i(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = i(e, ["description"]);
  t !== void 0 && s != null && l(t, ["description"], s);
  const a = i(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function zS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "name"], Y(e, o));
  const s = i(t, ["config"]);
  return s != null && KS(s, r), r;
}
function YS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["config"]);
  return s != null && WS(s, r), r;
}
function XS(e, t, n) {
  const r = {}, o = i(e, ["outputGcsUri"]);
  t !== void 0 && o != null && l(t, ["parameters", "storageUri"], o);
  const s = i(e, ["safetyFilterLevel"]);
  t !== void 0 && s != null && l(t, ["parameters", "safetySetting"], s);
  const a = i(e, ["personGeneration"]);
  t !== void 0 && a != null && l(t, ["parameters", "personGeneration"], a);
  const c = i(e, ["includeRaiReason"]);
  t !== void 0 && c != null && l(t, ["parameters", "includeRaiReason"], c);
  const u = i(e, ["outputMimeType"]);
  t !== void 0 && u != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], u);
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
function QS(e, t, n) {
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
  const c = i(t, ["config"]);
  return c != null && XS(c, r), r;
}
function ZS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => Ko(a))), l(n, ["generatedImages"], s);
  }
  return n;
}
function jS(e, t) {
  const n = {}, r = i(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = i(e, ["encodedVideo"]);
  o != null && l(n, ["videoBytes"], Nt(o));
  const s = i(e, ["encoding"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function eT(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["uri"], r);
  const o = i(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["videoBytes"], Nt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function tT(e, t) {
  const n = {}, r = i(e, ["image"]);
  r != null && l(n, ["_self"], rt(r));
  const o = i(e, ["maskMode"]);
  return o != null && l(n, ["maskMode"], o), n;
}
function nT(e, t) {
  const n = {}, r = i(e, ["image"]);
  r != null && l(n, ["image"], Wo(r));
  const o = i(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function rT(e, t) {
  const n = {}, r = i(e, ["image"]);
  r != null && l(n, ["image"], rt(r));
  const o = i(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function Hf(e, t) {
  const n = {}, r = i(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = i(e, ["videoBytes"]);
  o != null && l(n, ["encodedVideo"], Nt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["encoding"], s), n;
}
function Vf(e, t) {
  const n = {}, r = i(e, ["uri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = i(e, ["videoBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Nt(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function oT(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["displayName"], r), n;
}
function sT(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && oT(n, t), t;
}
function iT(e, t) {
  const n = {}, r = i(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function aT(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = i(e, ["config"]);
  return r != null && iT(r, t), t;
}
function lT(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function uT(e, t) {
  const n = {}, r = i(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => a)), l(t, ["customMetadata"], s);
  }
  const o = i(e, ["chunkingConfig"]);
  return t !== void 0 && o != null && l(t, ["chunkingConfig"], o), n;
}
function cT(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], fT(a)), t;
}
function dT(e) {
  const t = {}, n = i(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = i(e, ["fileName"]);
  r != null && l(t, ["fileName"], r);
  const o = i(e, ["config"]);
  return o != null && uT(o, t), t;
}
function fT(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = i(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function hT(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function pT(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && hT(n, t), t;
}
function mT(e) {
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
function Jf(e, t) {
  const n = {}, r = i(e, ["mimeType"]);
  t !== void 0 && r != null && l(t, ["mimeType"], r);
  const o = i(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = i(e, ["customMetadata"]);
  if (t !== void 0 && s != null) {
    let c = s;
    Array.isArray(c) && (c = c.map((u) => u)), l(t, ["customMetadata"], c);
  }
  const a = i(e, ["chunkingConfig"]);
  return t !== void 0 && a != null && l(t, ["chunkingConfig"], a), n;
}
function gT(e) {
  const t = {}, n = i(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = i(e, ["config"]);
  return r != null && Jf(r, t), t;
}
function yT(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var _T = "Content-Type", vT = "X-Server-Timeout", AT = "User-Agent", ai = "x-goog-api-client", ST = "google-genai-sdk/1.50.1", TT = "v1beta1", ET = "v1beta", wT = /* @__PURE__ */ new Set(["us", "eu"]), CT = 5, IT = [
  408,
  429,
  500,
  502,
  503,
  504
], bT = class {
  constructor(e) {
    var t, n, r;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const o = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const s = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !s ? (o.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? o.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && wT.has(this.clientOptions.location) ? o.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (o.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), o.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : TT;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), o.apiVersion = (r = this.clientOptions.apiVersion) !== null && r !== void 0 ? r : ET, o.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === ti.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
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
    return t && t.extraBody !== null && PT(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await oc(r), new ni(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await oc(r), this.processStreamResponse(r))).catch((r) => {
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
        const a = "data:", c = [
          `

`,
          "\r\r",
          `\r
\r
`
        ];
        for (; ; ) {
          const { done: u, value: d } = yield J(r.read());
          if (u) {
            if (s.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const h = o.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(h);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, v = g.code, w = `got status: ${_}. ${JSON.stringify(m)}`;
              if (v >= 400 && v < 600) throw new Uf({
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
            for (const _ of c) {
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
                yield yield J(new ni(new Response(_, {
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
      throw IT.includes(s.status) ? new Error(`Retryable HTTP Error: ${s.statusText}`) : new xl.AbortError(`Non-retryable exception ${s.statusText} sending request`);
    };
    return (0, xl.default)(o, { retries: ((n = r.attempts) !== null && n !== void 0 ? n : CT) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = ST + " " + this.clientOptions.userAgentExtra;
    return e[AT] = t, e[ai] = t, e[_T] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [r, o] of Object.entries(e.headers)) n.append(r, o);
      e.timeout && e.timeout > 0 && n.append(vT, String(Math.ceil(e.timeout / 1e3)));
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
    const c = { file: r }, u = this.getFileName(e), d = $("upload/v1beta/files", c._url), h = await this.fetchUploadUrl(d, r.sizeBytes, r.mimeType, u, c, t?.httpOptions);
    return o.upload(e, h, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var r;
    const o = this.clientOptions.uploader, s = await o.stat(t), a = String(s.size), c = (r = n?.mimeType) !== null && r !== void 0 ? r : s.type;
    if (c === void 0 || c === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const u = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), h = {};
    n != null && Jf(n, h);
    const f = await this.fetchUploadUrl(u, a, c, d, h, n?.httpOptions);
    return o.uploadToFileSearchStore(t, f, this);
  }
  async downloadFile(e) {
    await this.clientOptions.downloader.download(e, this);
  }
  async fetchUploadUrl(e, t, n, r, o, s) {
    var a;
    let c = {};
    s ? c = s : c = {
      apiVersion: "",
      headers: Object.assign({
        "Content-Type": "application/json",
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": `${t}`,
        "X-Goog-Upload-Header-Content-Type": `${n}`
      }, r ? { "X-Goog-Upload-File-Name": r } : {})
    };
    const u = await this.request({
      path: e,
      body: JSON.stringify(o),
      httpMethod: "POST",
      httpOptions: c
    });
    if (!u || !u?.headers) throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
    const d = (a = u?.headers) === null || a === void 0 ? void 0 : a["x-goog-upload-url"];
    if (d === void 0) throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
    return d;
  }
};
async function oc(e) {
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
    throw n >= 400 && n < 600 ? new Uf({
      message: o,
      status: n
    }) : new Error(o);
  }
}
function PT(e, t) {
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
    const c = Object.assign({}, s);
    for (const u in a) if (Object.prototype.hasOwnProperty.call(a, u)) {
      const d = a[u], h = c[u];
      d && typeof d == "object" && !Array.isArray(d) && h && typeof h == "object" && !Array.isArray(h) ? c[u] = r(h, d) : (h && d && typeof h != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${u}". Original type: ${typeof h}, New type: ${typeof d}. Overwriting.`), c[u] = d);
    }
    return c;
  }
  const o = r(n, t);
  e.body = JSON.stringify(o);
}
var RT = "mcp_used/unknown", xT = !1;
function Kf(e) {
  for (const t of e)
    if (MT(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return xT;
}
function Wf(e) {
  var t;
  e[ai] = (((t = e[ai]) !== null && t !== void 0 ? t : "") + ` ${RT}`).trimStart();
}
function MT(e) {
  return e !== null && typeof e == "object" && e instanceof kT;
}
function NT(e) {
  return tt(this, arguments, function* (n, r = 100) {
    let o, s = 0;
    for (; s < r; ) {
      const a = yield J(n.listTools({ cursor: o }));
      for (const c of a.tools)
        yield yield J(c), s++;
      if (!a.nextCursor) break;
      o = a.nextCursor;
    }
  });
}
var kT = class zf {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new zf(t, n);
  }
  async initialize() {
    var t, n, r, o;
    if (this.mcpTools.length > 0) return;
    const s = {}, a = [];
    for (const h of this.mcpClients) try {
      for (var c = !0, u = (n = void 0, nt(NT(h))), d; d = await u.next(), t = d.done, !t; c = !0) {
        o = d.value, c = !1;
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
        !c && !t && (r = u.return) && await r.call(u);
      } finally {
        if (n) throw n.error;
      }
    }
    this.mcpTools = a, this.functionNameToMcpClient = s;
  }
  async tool() {
    return await this.initialize(), Wy(this.mcpTools, this.config);
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
async function DT(e, t, n) {
  const r = new Fy();
  let o;
  n.data instanceof Blob ? o = JSON.parse(await n.data.text()) : o = JSON.parse(n.data), Object.assign(r, o), t(r);
}
var $T = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), o = this.apiClient.getApiVersion(), s = FT(this.apiClient.getDefaultHeaders()), a = `${r}/ws/google.ai.generativelanguage.${o}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let c = () => {
    };
    const u = new Promise((_) => {
      c = _;
    }), d = e.callbacks, h = function() {
      c({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        DT(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(a, UT(s), p);
    m.connect(), await u;
    const g = { setup: { model: Y(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new LT(m, this.apiClient);
  }
}, LT = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = jv(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = Zv(e);
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
function UT(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function FT(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var qT = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function BT(e, t, n) {
  const r = new Uy();
  let o;
  n.data instanceof Blob ? o = await n.data.text() : n.data instanceof ArrayBuffer ? o = new TextDecoder().decode(n.data) : o = n.data;
  const s = JSON.parse(o);
  if (e.isVertexAI()) {
    const a = nA(s);
    Object.assign(r, a);
  } else Object.assign(r, s);
  t(r);
}
var GT = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new $T(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, r, o, s, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const c = this.apiClient.getWebsocketBaseUrl(), u = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && Kf(e.config.tools) && Wf(h);
    const f = JT(h);
    if (this.apiClient.isVertexAI()) {
      const R = this.apiClient.getProject(), D = this.apiClient.getLocation(), H = this.apiClient.getApiKey(), z = !!R && !!D || !!H;
      this.apiClient.getCustomBaseUrl() && !z ? d = c : (d = `${c}/ws/google.cloud.aiplatform.${u}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const R = this.apiClient.getApiKey();
      let D = "BidiGenerateContent", H = "key";
      R?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), u !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), D = "BidiGenerateContentConstrained", H = "access_token"), d = `${c}/ws/google.ai.generativelanguage.${u}.GenerativeService.${D}?${H}=${R}`;
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
        BT(v, g.onmessage, R);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(R) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(R) {
      }
    }, I = this.webSocketFactory.create(d, VT(f), w);
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
    return this.apiClient.isVertexAI() ? M = Qv(this.apiClient, F) : M = Xv(this.apiClient, F), delete M.config, I.send(JSON.stringify(M)), new HT(I, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, OT = { turnComplete: !0 }, HT = class {
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
      if (!e.isVertexAI() && !("id" in r)) throw new Error(qT);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, OT), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: tA(e) } : t = { realtimeInput: eA(e) }, this.conn.send(JSON.stringify(t));
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
function VT(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function JT(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var sc = 10;
function ic(e) {
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
function KT(e) {
  var t, n, r;
  return (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((o) => mn(o))) !== null && r !== void 0 ? r : !1;
}
function ac(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((r, o) => {
    if (mn(r)) return;
    const s = r;
    s.functionDeclarations && s.functionDeclarations.length > 0 && n.push(o);
  }), n;
}
function lc(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var WT = class extends _t {
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
      const c = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !KT(t) || ic(t.config)) return await this.generateContentInternal(c);
      const u = ac(t);
      if (u.length > 0) {
        const g = u.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, h;
      const f = Ie(c.contents), p = (o = (r = (n = c.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && o !== void 0 ? o : sc;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(c), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const v of (a = (s = t.config) === null || s === void 0 ? void 0 : s.tools) !== null && a !== void 0 ? a : []) if (mn(v)) {
          const w = await v.callTool(d.functionCalls);
          _.push(...w);
        }
        m++, h = {
          role: "user",
          parts: _
        }, c.contents = Ie(c.contents), c.contents.push(g), c.contents.push(h), lc(c.config) && (f.push(g), f.push(h));
      }
      return lc(c.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, r, o, s, a;
      if (this.maybeMoveToResponseJsonSchem(t), ic(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const c = ac(t);
      if (c.length > 0) {
        const h = c.map((f) => `tools[${f}]`).join(", ");
        throw new Error(`Incompatible tools found at ${h}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
      }
      const u = (o = (r = (n = t?.config) === null || n === void 0 ? void 0 : n.toolConfig) === null || r === void 0 ? void 0 : r.functionCallingConfig) === null || o === void 0 ? void 0 : o.streamFunctionCallArguments, d = (a = (s = t?.config) === null || s === void 0 ? void 0 : s.automaticFunctionCalling) === null || a === void 0 ? void 0 : a.disable;
      if (u && !d) throw new Error("Running in streaming mode with 'streamFunctionCallArguments' enabled, this feature is not compatible with automatic function calling (AFC). Please set 'config.automaticFunctionCalling.disable' to true to disable AFC or leave 'config.toolConfig.functionCallingConfig.streamFunctionCallArguments' to be undefined or set to false to disable streaming function call arguments feature.");
      return await this.processAfcStream(t);
    }, this.generateImages = async (t) => await this.generateImagesInternal(t).then((n) => {
      var r;
      let o;
      const s = [];
      if (n?.generatedImages) for (const c of n.generatedImages) c && c?.safetyAttributes && ((r = c?.safetyAttributes) === null || r === void 0 ? void 0 : r.contentType) === "Positive Prompt" ? o = c?.safetyAttributes : s.push(c);
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
      var n, r, o, s, a, c;
      if ((t.prompt || t.image || t.video) && t.source) throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      return this.apiClient.isVertexAI() || (!((n = t.video) === null || n === void 0) && n.uri && (!((r = t.video) === null || r === void 0) && r.videoBytes) ? t.video = {
        uri: t.video.uri,
        mimeType: t.video.mimeType
      } : !((s = (o = t.source) === null || o === void 0 ? void 0 : o.video) === null || s === void 0) && s.uri && (!((c = (a = t.source) === null || a === void 0 ? void 0 : a.video) === null || c === void 0) && c.videoBytes) && (t.source.video = {
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
    const s = await Promise.all(o.map(async (c) => mn(c) ? await c.tool() : c)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: s })
    };
    if (a.config.tools = s, e.config && e.config.tools && Kf(e.config.tools)) {
      const c = (r = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && r !== void 0 ? r : {};
      let u = Object.assign({}, c);
      Object.keys(u).length === 0 && (u = this.apiClient.getDefaultHeaders()), Wf(u), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: u });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, r;
    const o = /* @__PURE__ */ new Map();
    for (const s of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (mn(s)) {
      const a = s, c = await a.tool();
      for (const u of (r = c.functionDeclarations) !== null && r !== void 0 ? r : []) {
        if (!u.name) throw new Error("Function declaration name is required.");
        if (o.has(u.name)) throw new Error(`Duplicate tool declaration name: ${u.name}`);
        o.set(u.name, a);
      }
    }
    return o;
  }
  async processAfcStream(e) {
    var t, n, r;
    const o = (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && r !== void 0 ? r : sc;
    let s = !1, a = 0;
    const c = await this.initAfcToolsMap(e);
    return (function(u, d, h) {
      return tt(this, arguments, function* () {
        for (var f, p, m, g, _, v; a < o; ) {
          s && (a++, s = !1);
          const M = yield J(u.processParamsMaybeAddMcpUsage(h)), x = yield J(u.generateContentStreamInternal(M)), C = [], F = [];
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
    })(this, c, e);
  }
  async generateContentInternal(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = tc(this.apiClient, e);
      return a = $("{model}:generateContent", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = rc(d), f = new Hn();
        return Object.assign(f, h), f;
      });
    } else {
      const u = ec(this.apiClient, e);
      return a = $("{model}:generateContent", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = nc(d), f = new Hn();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = tc(this.apiClient, e);
      return a = $("{model}:streamGenerateContent?alt=sse", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.requestStream({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
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
    } else {
      const u = ec(this.apiClient, e);
      return a = $("{model}:streamGenerateContent?alt=sse", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.requestStream({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }), s.then(function(d) {
        return tt(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = nt(d), v; v = yield J(_.next()), h = v.done, !h; g = !0) {
              m = v.value, g = !1;
              const w = m, I = nc(yield J(w.json()), e);
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
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = LA(this.apiClient, e, e);
      return a = $(Yy(e.model) ? "{model}:embedContent" : "{model}:predict", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = FA(d, e), f = new Du();
        return Object.assign(f, h), f;
      });
    } else {
      const u = $A(this.apiClient, e);
      return a = $("{model}:batchEmbedContents", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = UA(d), f = new Du();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = YA(this.apiClient, e);
      return a = $("{model}:predict", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = QA(d), f = new $u();
        return Object.assign(f, h), f;
      });
    } else {
      const u = zA(this.apiClient, e);
      return a = $("{model}:predict", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = XA(d), f = new $u();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = MA(this.apiClient, e);
      return o = $("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json().then((u) => {
        const d = u;
        return d.sdkHttpResponse = { headers: c.headers }, d;
      })), r.then((c) => {
        const u = NA(c), d = new wy();
        return Object.assign(d, u), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = QS(this.apiClient, e);
      return o = $("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json().then((u) => {
        const d = u;
        return d.sdkHttpResponse = { headers: c.headers }, d;
      })), r.then((c) => {
        const u = ZS(c), d = new Cy();
        return Object.assign(d, u), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = MS(this.apiClient, e);
      return o = $("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => {
        const u = NS(c), d = new Iy();
        return Object.assign(d, u), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = FS(this.apiClient, e);
      return o = $("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => {
        const u = qS(c), d = new by();
        return Object.assign(d, u), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = pS(this.apiClient, e);
      return a = $("{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => ii(d));
    } else {
      const u = hS(this.apiClient, e);
      return a = $("{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => si(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = ES(this.apiClient, e);
      return a = $("{models_url}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = CS(d), f = new Lu();
        return Object.assign(f, h), f;
      });
    } else {
      const u = TS(this.apiClient, e);
      return a = $("{models_url}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = wS(d), f = new Lu();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = YS(this.apiClient, e);
      return a = $("{model}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => ii(d));
    } else {
      const u = zS(this.apiClient, e);
      return a = $("{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => si(d));
    }
  }
  async delete(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = bA(this.apiClient, e);
      return a = $("{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = RA(d), f = new Uu();
        return Object.assign(f, h), f;
      });
    } else {
      const u = IA(this.apiClient, e);
      return a = $("{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = PA(d), f = new Uu();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = EA(this.apiClient, e);
      return a = $("{model}:countTokens", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = CA(d), f = new Fu();
        return Object.assign(f, h), f;
      });
    } else {
      const u = TA(this.apiClient, e);
      return a = $("{model}:countTokens", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = wA(d), f = new Fu();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = mA(this.apiClient, e);
      return o = $("{model}:computeTokens", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json().then((u) => {
        const d = u;
        return d.sdkHttpResponse = { headers: c.headers }, d;
      })), r.then((c) => {
        const u = gA(c), d = new Py();
        return Object.assign(d, u), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = rS(this.apiClient, e);
      return a = $("{model}:predictLongRunning", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => {
        const h = tS(d), f = new qu();
        return Object.assign(f, h), f;
      });
    } else {
      const u = nS(this.apiClient, e);
      return a = $("{model}:predictLongRunning", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => {
        const h = eS(d), f = new qu();
        return Object.assign(f, h), f;
      });
    }
  }
}, zT = class extends _t {
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
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = _y(e);
      return a = $("{operationName}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s;
    } else {
      const u = yy(e);
      return a = $("{operationName}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
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
      const a = cy(e);
      return o = $("{resourceName}:fetchPredictOperation", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r;
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
};
function uc(e) {
  const t = {};
  if (i(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function YT(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function XT(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function QT(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => iE(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function ZT(e, t, n) {
  const r = {}, o = i(t, ["expireTime"]);
  n !== void 0 && o != null && l(n, ["expireTime"], o);
  const s = i(t, ["newSessionExpireTime"]);
  n !== void 0 && s != null && l(n, ["newSessionExpireTime"], s);
  const a = i(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const c = i(t, ["liveConnectConstraints"]);
  n !== void 0 && c != null && l(n, ["bidiGenerateContentSetup"], sE(e, c));
  const u = i(t, ["lockAdditionalFields"]);
  return n !== void 0 && u != null && l(n, ["fieldMask"], u), r;
}
function jT(e, t) {
  const n = {}, r = i(t, ["config"]);
  return r != null && l(n, ["config"], ZT(e, r, n)), n;
}
function eE(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function tE(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function nE(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], YT(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function rE(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function oE(e, t) {
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
  const c = i(e, ["topK"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], c);
  const u = i(e, ["maxOutputTokens"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], u);
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
  ], ea(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], QT(de(g)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let R = Tn(_);
    Array.isArray(R) && (R = R.map((D) => uE(Sn(D)))), l(t, ["setup", "tools"], R);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], lE(v));
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], uc(w));
  const I = i(e, ["outputAudioTranscription"]);
  t !== void 0 && I != null && l(t, ["setup", "outputAudioTranscription"], uc(I));
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
    Array.isArray(R) && (R = R.map((D) => aE(D))), l(t, ["setup", "safetySettings"], R);
  }
  return n;
}
function sE(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = i(t, ["config"]);
  return o != null && l(n, ["config"], oE(o, n)), n;
}
function iE(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], eE(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], tE(a));
  const c = i(e, ["functionResponse"]);
  c != null && l(t, ["functionResponse"], c);
  const u = i(e, ["inlineData"]);
  u != null && l(t, ["inlineData"], XT(u));
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
function aE(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = i(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function lE(e) {
  const t = {}, n = i(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), i(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function uE(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], rE(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], nE(s));
  const a = i(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = i(e, ["functionDeclarations"]);
  if (c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const u = i(e, ["googleSearchRetrieval"]);
  if (u != null && l(t, ["googleSearchRetrieval"], u), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = i(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = i(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function cE(e) {
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
function dE(e, t) {
  let n = null;
  const r = e.bidiGenerateContentSetup;
  if (typeof r == "object" && r !== null && "setup" in r) {
    const s = r.setup;
    typeof s == "object" && s !== null ? (e.bidiGenerateContentSetup = s, n = s) : delete e.bidiGenerateContentSetup;
  } else r !== void 0 && delete e.bidiGenerateContentSetup;
  const o = e.fieldMask;
  if (n) {
    const s = cE(n);
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
      let c = [];
      o.length > 0 && (c = o.map((d) => a.includes(d) ? `generationConfig.${d}` : d));
      const u = [];
      s && u.push(s), c.length > 0 && u.push(...c), u.length > 0 ? e.fieldMask = u.join(",") : delete e.fieldMask;
    } else delete e.fieldMask;
  } else o !== null && Array.isArray(o) && o.length > 0 ? e.fieldMask = o.join(",") : delete e.fieldMask;
  return e;
}
var fE = class extends _t {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = jT(this.apiClient, e);
      o = $("auth_tokens", a._url), s = a._query, delete a.config, delete a._url, delete a._query;
      const c = dE(a, e.config);
      return r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => u);
    }
  }
};
function hE(e, t) {
  const n = {}, r = i(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function pE(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = i(e, ["config"]);
  return r != null && hE(r, t), t;
}
function mE(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function gE(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function yE(e) {
  const t = {}, n = i(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const r = i(e, ["config"]);
  return r != null && gE(r, t), t;
}
function _E(e) {
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
var vE = class extends _t {
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
      const a = mE(e);
      return o = $("{name}", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => c);
    }
  }
  async delete(e) {
    var t, n;
    let r = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = pE(e);
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
      const a = yE(e);
      return o = $("{parent}/documents", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => {
        const u = _E(c), d = new Ry();
        return Object.assign(d, u), d;
      });
    }
  }
}, AE = class extends _t {
  constructor(e, t = new vE(e)) {
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
      const a = sT(e);
      return o = $("fileSearchStores", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => c);
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = lT(e);
      return o = $("{name}", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => c);
    }
  }
  async delete(e) {
    var t, n;
    let r = "", o = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = aT(e);
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
      const a = pT(e);
      return o = $("fileSearchStores", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => {
        const u = mT(c), d = new xy();
        return Object.assign(d, u), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = gT(e);
      return o = $("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => {
        const u = yT(c), d = new My();
        return Object.assign(d, u), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = dT(e);
      return o = $("{file_search_store_name}:importFile", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), r.then((c) => {
        const u = cT(c), d = new Ny();
        return Object.assign(d, u), d;
      });
    }
  }
}, Yf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Yf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
}, SE = () => Yf();
function li(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ui = (e) => {
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
}, Ye = class ci extends We {
  constructor(t, n, r, o) {
    super(`${ci.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.error = n;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new zo({
      message: r,
      cause: ui(n)
    });
    const s = n;
    return t === 400 ? new Qf(t, s, r, o) : t === 401 ? new Zf(t, s, r, o) : t === 403 ? new jf(t, s, r, o) : t === 404 ? new eh(t, s, r, o) : t === 409 ? new th(t, s, r, o) : t === 422 ? new nh(t, s, r, o) : t === 429 ? new rh(t, s, r, o) : t >= 500 ? new oh(t, s, r, o) : new ci(t, s, r, o);
  }
}, di = class extends Ye {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, zo = class extends Ye {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Xf = class extends zo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Qf = class extends Ye {
}, Zf = class extends Ye {
}, jf = class extends Ye {
}, eh = class extends Ye {
}, th = class extends Ye {
}, nh = class extends Ye {
}, rh = class extends Ye {
}, oh = class extends Ye {
}, TE = /^[a-z][a-z0-9+.-]*:/i, EE = (e) => TE.test(e), fi = (e) => (fi = Array.isArray, fi(e)), cc = fi;
function dc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function wE(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var CE = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new We(`${e} must be an integer`);
  if (t < 0) throw new We(`${e} must be a positive integer`);
  return t;
}, IE = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, bE = (e) => new Promise((t) => setTimeout(t, e));
function PE() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function sh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function RE(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return sh({
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
function ih(e) {
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
async function xE(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const r = e.getReader(), o = r.cancel();
  r.releaseLock(), await o;
}
var ME = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function NE(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new We(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var kE = "0.0.1", ah = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Is(e, t, n) {
  return ah(), new File(e, t ?? "unknown_file", n);
}
function DE(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var $E = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", lh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", LE = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && lh(e), UE = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function FE(e, t, n) {
  if (ah(), e = await e, LE(e))
    return e instanceof File ? e : Is([await e.arrayBuffer()], e.name);
  if (UE(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Is(await hi(o), t, n);
  }
  const r = await hi(e);
  if (t || (t = DE(e)), !n?.type) {
    const o = r.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof o == "string" && (n = Object.assign(Object.assign({}, n), { type: o }));
  }
  return Is(r, t, n);
}
async function hi(e) {
  var t, n, r, o, s;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (lh(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if ($E(e)) try {
    for (var c = !0, u = nt(e), d; d = await u.next(), t = d.done, !t; c = !0) {
      o = d.value, c = !1;
      const h = o;
      a.push(...await hi(h));
    }
  } catch (h) {
    n = { error: h };
  } finally {
    try {
      !c && !t && (r = u.return) && await r.call(u);
    } finally {
      if (n) throw n.error;
    }
  }
  else {
    const h = (s = e?.constructor) === null || s === void 0 ? void 0 : s.name;
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${qE(e)}`);
  }
  return a;
}
function qE(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ta = class {
  constructor(e) {
    this._client = e;
  }
};
ta._key = [];
function uh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var fc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), BE = (e = uh) => (function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const s = [], a = n.reduce((h, f, p) => {
    var m, g, _;
    /[?#]/.test(f) && (o = !0);
    const v = r[p];
    let w = (o ? encodeURIComponent : e)("" + v);
    return p !== r.length && (v == null || typeof v == "object" && v.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = v.hasOwnProperty) !== null && m !== void 0 ? m : fc)) !== null && g !== void 0 ? g : fc)) === null || _ === void 0 ? void 0 : _.toString)) && (w = v + "", s.push({
      start: h.length + f.length,
      length: w.length,
      error: `Value of type ${Object.prototype.toString.call(v).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : w);
  }, ""), c = a.split(/[?#]/, 1)[0], u = /(^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = u.exec(c)) !== null; ) {
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
}), Qe = /* @__PURE__ */ BE(uh), ch = class extends ta {
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
ch._key = Object.freeze(["interactions"]);
var dh = class extends ch {
}, fh = class extends ta {
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
fh._key = Object.freeze(["webhooks"]);
var hh = class extends fh {
};
function GE(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var Qr;
function na(e) {
  let t;
  return (Qr ?? (t = new globalThis.TextEncoder(), Qr = t.encode.bind(t)))(e);
}
var Zr;
function hc(e) {
  let t;
  return (Zr ?? (t = new globalThis.TextDecoder(), Zr = t.decode.bind(t)))(e);
}
var Yo = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? na(e) : e;
    this.buffer = GE([this.buffer, n]);
    const r = [];
    let o;
    for (; (o = OE(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (o.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = o.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (o.index !== this.carriageReturnIndex + 1 || o.carriage)) {
        r.push(hc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const s = this.carriageReturnIndex !== null ? o.preceding - 1 : o.preceding, a = hc(this.buffer.subarray(0, s));
      r.push(a), this.buffer = this.buffer.subarray(o.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), r;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Yo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Yo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function OE(e, t) {
  const o = t ?? 0, s = e.indexOf(10, o), a = e.indexOf(13, o);
  if (s === -1 && a === -1) return null;
  let c;
  return s !== -1 && a !== -1 ? c = Math.min(s, a) : c = s !== -1 ? s : a, e[c] === 10 ? {
    preceding: c,
    index: c + 1,
    carriage: !1
  } : {
    preceding: c,
    index: c + 1,
    carriage: !0
  };
}
var xo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, pc = (e, t, n) => {
  if (e) {
    if (wE(xo, e)) return e;
    Se(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(xo))}`);
  }
};
function Xn() {
}
function jr(e, t, n) {
  return !t || xo[e] > xo[n] ? Xn : t[e].bind(t);
}
var HE = {
  error: Xn,
  warn: Xn,
  info: Xn,
  debug: Xn
}, mc = /* @__PURE__ */ new WeakMap();
function Se(e) {
  var t;
  const n = e.logger, r = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return HE;
  const o = mc.get(n);
  if (o && o[0] === r) return o[1];
  const s = {
    error: jr("error", n, r),
    warn: jr("warn", n, r),
    info: jr("info", n, r),
    debug: jr("debug", n, r)
  };
  return mc.set(n, [r, s]), s;
}
var Ut = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), VE = class Qn {
  constructor(t, n, r) {
    this.iterator = t, this.controller = n, this.client = r;
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const s = r ? Se(r) : console;
    function a() {
      return tt(this, arguments, function* () {
        var u, d, h, f;
        if (o) throw new We("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = nt(JE(t, n)), _; _ = yield J(g.next()), u = _.done, !u; m = !0) {
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
              !m && !u && (h = g.return) && (yield J(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (li(v)) return yield J(void 0);
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
        var u, d, h, f;
        const p = new Yo(), m = ih(t);
        try {
          for (var g = !0, _ = nt(m), v; v = yield J(_.next()), u = v.done, !u; g = !0) {
            f = v.value, g = !1;
            const w = f;
            for (const I of p.decode(w)) yield yield J(I);
          }
        } catch (w) {
          d = { error: w };
        } finally {
          try {
            !g && !u && (h = _.return) && (yield J(h.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const w of p.flush()) yield yield J(w);
      });
    }
    function a() {
      return tt(this, arguments, function* () {
        var u, d, h, f;
        if (o) throw new We("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = nt(s()), _; _ = yield J(g.next()), u = _.done, !u; m = !0) {
              f = _.value, m = !1;
              const v = f;
              p || v && (yield yield J(JSON.parse(v)));
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !u && (h = g.return) && (yield J(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (v) {
          if (li(v)) return yield J(void 0);
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
    return sh({
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
        var r;
        await ((r = n.return) === null || r === void 0 ? void 0 : r.call(n));
      }
    });
  }
};
function JE(e, t) {
  return tt(this, arguments, function* () {
    var r, o, s, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new We("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new We("Attempted to iterate over a response with no body");
    const c = new WE(), u = new Yo(), d = ih(e.body);
    try {
      for (var h = !0, f = nt(KE(d)), p; p = yield J(f.next()), r = p.done, !r; h = !0) {
        a = p.value, h = !1;
        const m = a;
        for (const g of u.decode(m)) {
          const _ = c.decode(g);
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
    for (const m of u.flush()) {
      const g = c.decode(m);
      g && (yield yield J(g));
    }
  });
}
function KE(e) {
  return tt(this, arguments, function* () {
    var n, r, o, s;
    try {
      for (var a = !0, c = nt(e), u; u = yield J(c.next()), n = u.done, !n; a = !0) {
        s = u.value, a = !1;
        const d = s;
        d != null && (yield yield J(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? na(d) : d));
      }
    } catch (d) {
      r = { error: d };
    } finally {
      try {
        !a && !n && (o = c.return) && (yield J(o.call(c)));
      } finally {
        if (r) throw r.error;
      }
    }
  });
}
var WE = class {
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
    let [t, n, r] = zE(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function zE(e, t) {
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
async function YE(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: s } = t, a = await (async () => {
    var c;
    if (t.options.stream)
      return Se(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : VE.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type"), d = (c = u?.split(";")[0]) === null || c === void 0 ? void 0 : c.trim();
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
var XE = class ph extends Promise {
  constructor(t, n, r = YE) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, this.client = t;
  }
  _thenUnwrap(t) {
    return new ph(this.client, this.responsePromise, async (n, r) => t(await this.parseResponse(n, r), r));
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
}, mh = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* QE(e) {
  if (!e) return;
  if (mh in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const s of o) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : cc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const s = cc(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const c of s)
      c !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, c]);
  }
}
var Vn = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [s, a] of QE(r)) {
      const c = s.toLowerCase();
      o.has(c) || (t.delete(s), o.add(c)), a === null ? (t.delete(s), n.add(c)) : (t.append(s, a), n.delete(c));
    }
  }
  return {
    [mh]: !0,
    values: t,
    nulls: n
  };
}, bs = (e) => {
  var t, n, r, o, s;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((s = (o = (r = globalThis.Deno.env) === null || r === void 0 ? void 0 : r.get) === null || o === void 0 ? void 0 : o.call(r, e)) === null || s === void 0 ? void 0 : s.trim()) || void 0;
}, gh, yh = class _h {
  constructor(t) {
    var n, r, o, s, a, c, u, { baseURL: d = bs("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = bs("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = xt(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (r = m.timeout) !== null && r !== void 0 ? r : _h.DEFAULT_TIMEOUT, this.logger = (o = m.logger) !== null && o !== void 0 ? o : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (a = (s = pc(m.logLevel, "ClientOptions.logLevel", this)) !== null && s !== void 0 ? s : pc(bs("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (c = m.maxRetries) !== null && c !== void 0 ? c : 2, this.fetch = (u = m.fetch) !== null && u !== void 0 ? u : PE(), this.encoder = ME, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    return NE(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${kE}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${SE()}`;
  }
  makeStatusError(t, n, r, o) {
    return Ye.generate(t, n, r, o);
  }
  buildURL(t, n, r) {
    const o = !this.baseURLOverridden() && r || this.baseURL, s = EE(t) ? new URL(t) : new URL(o + (o.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), c = Object.fromEntries(s.searchParams);
    return (!dc(a) || !dc(c)) && (n = Object.assign(Object.assign(Object.assign({}, c), a), n)), typeof n == "object" && n && !Array.isArray(n) && (s.search = this.stringifyQuery(n)), s.toString();
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
    return new XE(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, r) {
    var o, s, a;
    const c = await t, u = (o = c.maxRetries) !== null && o !== void 0 ? o : this.maxRetries;
    n == null && (n = u), await this.prepareOptions(c);
    const { req: d, url: h, timeout: f } = await this.buildRequest(c, { retryCount: u - n });
    await this.prepareRequest(d, {
      url: h,
      options: c
    });
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = r === void 0 ? "" : `, retryOf: ${r}`, g = Date.now();
    if (Se(this).debug(`[${p}] sending request`, Ut({
      retryOfRequestLogID: r,
      method: c.method,
      url: h,
      options: c,
      headers: d.headers
    })), !((s = c.signal) === null || s === void 0) && s.aborted) throw new di();
    const _ = new AbortController(), v = await this.fetchWithTimeout(h, d, f, _).catch(ui), w = Date.now();
    if (v instanceof globalThis.Error) {
      const P = `retrying, ${n} attempts remaining`;
      if (!((a = c.signal) === null || a === void 0) && a.aborted) throw new di();
      const M = li(v) || /timed? ?out/i.test(String(v) + ("cause" in v ? String(v.cause) : ""));
      if (n)
        return Se(this).info(`[${p}] connection ${M ? "timed out" : "failed"} - ${P}`), Se(this).debug(`[${p}] connection ${M ? "timed out" : "failed"} (${P})`, Ut({
          retryOfRequestLogID: r,
          url: h,
          durationMs: w - g,
          message: v.message
        })), this.retryRequest(c, n, r ?? p);
      throw Se(this).info(`[${p}] connection ${M ? "timed out" : "failed"} - error; no more retries left`), Se(this).debug(`[${p}] connection ${M ? "timed out" : "failed"} (error; no more retries left)`, Ut({
        retryOfRequestLogID: r,
        url: h,
        durationMs: w - g,
        message: v.message
      })), M ? new Xf() : new zo({ cause: v });
    }
    const I = `[${p}${m}] ${d.method} ${h} ${v.ok ? "succeeded" : "failed"} with status ${v.status} in ${w - g}ms`;
    if (!v.ok) {
      const P = await this.shouldRetry(v);
      if (n && P) {
        const R = `retrying, ${n} attempts remaining`;
        return await xE(v.body), Se(this).info(`${I} - ${R}`), Se(this).debug(`[${p}] response error (${R})`, Ut({
          retryOfRequestLogID: r,
          url: v.url,
          status: v.status,
          headers: v.headers,
          durationMs: w - g
        })), this.retryRequest(c, n, r ?? p, v.headers);
      }
      const M = P ? "error; no more retries left" : "error; not retryable";
      Se(this).info(`${I} - ${M}`);
      const x = await v.text().catch((R) => ui(R).message), C = IE(x), F = C ? void 0 : x;
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
      options: c,
      controller: _,
      requestLogID: p,
      retryOfRequestLogID: r,
      startTime: g
    };
  }
  async fetchWithTimeout(t, n, r, o) {
    const s = n || {}, { signal: a, method: c } = s, u = xt(s, ["signal", "method"]), d = this._makeAbort(o);
    a && a.addEventListener("abort", d, { once: !0 });
    const h = setTimeout(d, r), f = globalThis.ReadableStream && u.body instanceof globalThis.ReadableStream || typeof u.body == "object" && u.body !== null && Symbol.asyncIterator in u.body, p = Object.assign(Object.assign(Object.assign({ signal: o.signal }, f ? { duplex: "half" } : {}), { method: "GET" }), u);
    c && (p.method = c.toUpperCase());
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
    const c = o?.get("retry-after-ms");
    if (c) {
      const d = parseFloat(c);
      Number.isNaN(d) || (a = d);
    }
    const u = o?.get("retry-after");
    if (u && !a) {
      const d = parseFloat(u);
      Number.isNaN(d) ? a = Date.parse(u) - Date.now() : a = d * 1e3;
    }
    if (a === void 0) {
      const d = (s = t.maxRetries) !== null && s !== void 0 ? s : this.maxRetries;
      a = this.calculateDefaultRetryTimeoutMillis(n, d);
    }
    return await bE(a), this.makeRequest(t, n - 1, r);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const s = n - t;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var r, o, s;
    const a = Object.assign({}, t), { method: c, path: u, query: d, defaultBaseURL: h } = a, f = this.buildURL(u, d, h);
    "timeout" in a && CE("timeout", a.timeout), a.timeout = (r = a.timeout) !== null && r !== void 0 ? r : this.timeout;
    const { bodyHeaders: p, body: m } = this.buildBody({ options: a }), g = await this.buildHeaders({
      options: t,
      method: c,
      bodyHeaders: p,
      retryCount: n
    });
    return {
      req: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
        method: c,
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
    let c = Vn([
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
    return this.validateHeaders(c), c.values;
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
      body: RE(t)
    } : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: r
    });
  }
};
yh.DEFAULT_TIMEOUT = 6e4;
var le = class extends yh {
  constructor() {
    super(...arguments), this.interactions = new dh(this), this.webhooks = new hh(this);
  }
};
gh = le;
le.GeminiNextGenAPIClient = gh;
le.GeminiNextGenAPIClientError = We;
le.APIError = Ye;
le.APIConnectionError = zo;
le.APIConnectionTimeoutError = Xf;
le.APIUserAbortError = di;
le.NotFoundError = eh;
le.ConflictError = th;
le.RateLimitError = rh;
le.BadRequestError = Qf;
le.AuthenticationError = Zf;
le.InternalServerError = oh;
le.PermissionDeniedError = jf;
le.UnprocessableEntityError = nh;
le.toFile = FE;
le.Interactions = dh;
le.Webhooks = hh;
function ZE(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function jE(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function ew(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function tw(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function nw(e, t, n) {
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
  const c = i(e, ["batchSize"]);
  t !== void 0 && c != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "batchSize"
  ], c);
  const u = i(e, ["learningRate"]);
  if (t !== void 0 && u != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "learningRate"
  ], u), i(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  if (i(e, ["beta"]) !== void 0) throw new Error("beta parameter is not supported in Gemini API.");
  if (i(e, ["baseTeacherModel"]) !== void 0) throw new Error("baseTeacherModel parameter is not supported in Gemini API.");
  if (i(e, ["tunedTeacherModelSource"]) !== void 0) throw new Error("tunedTeacherModelSource parameter is not supported in Gemini API.");
  if (i(e, ["sftLossWeightMultiplier"]) !== void 0) throw new Error("sftLossWeightMultiplier parameter is not supported in Gemini API.");
  if (i(e, ["outputUri"]) !== void 0) throw new Error("outputUri parameter is not supported in Gemini API.");
  if (i(e, ["encryptionSpec"]) !== void 0) throw new Error("encryptionSpec parameter is not supported in Gemini API.");
  return r;
}
function rw(e, t, n) {
  const r = {};
  let o = i(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const C = i(e, ["validationDataset"]);
    t !== void 0 && C != null && l(t, ["supervisedTuningSpec"], Ps(C));
  } else if (o === "PREFERENCE_TUNING") {
    const C = i(e, ["validationDataset"]);
    t !== void 0 && C != null && l(t, ["preferenceOptimizationSpec"], Ps(C));
  } else if (o === "DISTILLATION") {
    const C = i(e, ["validationDataset"]);
    t !== void 0 && C != null && l(t, ["distillationSpec"], Ps(C));
  }
  const s = i(e, ["tunedModelDisplayName"]);
  t !== void 0 && s != null && l(t, ["tunedModelDisplayName"], s);
  const a = i(e, ["description"]);
  t !== void 0 && a != null && l(t, ["description"], a);
  let c = i(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const C = i(e, ["epochCount"]);
    t !== void 0 && C != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], C);
  } else if (c === "PREFERENCE_TUNING") {
    const C = i(e, ["epochCount"]);
    t !== void 0 && C != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], C);
  } else if (c === "DISTILLATION") {
    const C = i(e, ["epochCount"]);
    t !== void 0 && C != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], C);
  }
  let u = i(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const C = i(e, ["learningRateMultiplier"]);
    t !== void 0 && C != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], C);
  } else if (u === "PREFERENCE_TUNING") {
    const C = i(e, ["learningRateMultiplier"]);
    t !== void 0 && C != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], C);
  } else if (u === "DISTILLATION") {
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
function ow(e, t) {
  const n = {}, r = i(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const s = i(e, ["trainingDataset"]);
  s != null && mw(s);
  const a = i(e, ["config"]);
  return a != null && nw(a, n), n;
}
function sw(e, t) {
  const n = {}, r = i(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const s = i(e, ["trainingDataset"]);
  s != null && gw(s, n, t);
  const a = i(e, ["config"]);
  return a != null && rw(a, n, t), n;
}
function iw(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function aw(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function lw(e, t, n) {
  const r = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  t !== void 0 && s != null && l(t, ["_query", "pageToken"], s);
  const a = i(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function uw(e, t, n) {
  const r = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  t !== void 0 && s != null && l(t, ["_query", "pageToken"], s);
  const a = i(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function cw(e, t) {
  const n = {}, r = i(e, ["config"]);
  return r != null && lw(r, n), n;
}
function dw(e, t) {
  const n = {}, r = i(e, ["config"]);
  return r != null && uw(r, n), n;
}
function fw(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["tunedModels"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((c) => vh(c))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function hw(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["tuningJobs"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((c) => pi(c))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function pw(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["model"], r);
  const o = i(e, ["name"]);
  return o != null && l(n, ["endpoint"], o), n;
}
function mw(e, t) {
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
function gw(e, t, n) {
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
function vh(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["state"]);
  s != null && l(n, ["state"], Pf(s));
  const a = i(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const c = i(e, ["tuningTask", "startTime"]);
  c != null && l(n, ["startTime"], c);
  const u = i(e, ["tuningTask", "completeTime"]);
  u != null && l(n, ["endTime"], u);
  const d = i(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const h = i(e, ["description"]);
  h != null && l(n, ["description"], h);
  const f = i(e, ["baseModel"]);
  f != null && l(n, ["baseModel"], f);
  const p = i(e, ["_self"]);
  return p != null && l(n, ["tunedModel"], pw(p)), n;
}
function pi(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["state"]);
  s != null && l(n, ["state"], Pf(s));
  const a = i(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const c = i(e, ["startTime"]);
  c != null && l(n, ["startTime"], c);
  const u = i(e, ["endTime"]);
  u != null && l(n, ["endTime"], u);
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
    let Te = C;
    Array.isArray(Te) && (Te = Te.map((_e) => _e)), l(n, ["evaluateDatasetRuns"], Te);
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
function yw(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const a = i(e, ["done"]);
  a != null && l(n, ["done"], a);
  const c = i(e, ["error"]);
  return c != null && l(n, ["error"], c), n;
}
function Ps(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["validationDatasetUri"], r);
  const o = i(e, ["vertexDatasetResource"]);
  return o != null && l(n, ["validationDatasetUri"], o), n;
}
var _w = class extends _t {
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
          state: ei.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = aw(e);
      return a = $("{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => pi(d));
    } else {
      const u = iw(e);
      return a = $("{name}", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => vh(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = dw(e);
      return a = $("tuningJobs", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = hw(d), f = new Bu();
        return Object.assign(f, h), f;
      });
    } else {
      const u = cw(e);
      return a = $("tunedModels", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = fw(d), f = new Bu();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let s, a = "", c = {};
    if (this.apiClient.isVertexAI()) {
      const u = jE(e);
      return a = $("{name}:cancel", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = tw(d), f = new Gu();
        return Object.assign(f, h), f;
      });
    } else {
      const u = ZE(e);
      return a = $("{name}:cancel", u._url), c = u._query, delete u._url, delete u._query, s = this.apiClient.request({
        path: a,
        queryParams: c,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), s.then((d) => {
        const h = ew(d), f = new Gu();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = sw(e, e);
      return o = $("tuningJobs", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json().then((u) => {
        const d = u;
        return d.sdkHttpResponse = { headers: c.headers }, d;
      })), r.then((c) => pi(c));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = ow(e);
      return o = $("tunedModels", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json().then((u) => {
        const d = u;
        return d.sdkHttpResponse = { headers: c.headers }, d;
      })), r.then((c) => yw(c));
    }
  }
}, vw = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, Aw = 1024 * 1024 * 8, Sw = 3, Tw = 1e3, Ew = 2, Mo = "x-goog-upload-status";
async function ww(e, t, n, r) {
  var o;
  const s = await Ah(e, t, n, r), a = await s?.json();
  if (((o = s?.headers) === null || o === void 0 ? void 0 : o[Mo]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function Cw(e, t, n, r) {
  var o;
  const s = await Ah(e, t, n, r), a = await s?.json();
  if (((o = s?.headers) === null || o === void 0 ? void 0 : o[Mo]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const c = vf(a), u = new qy();
  return Object.assign(u, c), u;
}
async function Ah(e, t, n, r) {
  var o, s, a;
  let c = t;
  const u = r?.baseUrl || ((o = n.clientOptions.httpOptions) === null || o === void 0 ? void 0 : o.baseUrl);
  if (u) {
    const m = new URL(u), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, c = g.toString();
  }
  let d = 0, h = 0, f = new ni(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(Aw, d - h), g = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, v = Tw;
    for (; _ < Sw; ) {
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
          baseUrl: c,
          headers: w
        })
      }), !((s = f?.headers) === null || s === void 0) && s[Mo]) break;
      _++, await bw(v), v = v * Ew;
    }
    if (h += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[Mo]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function Iw(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function bw(e) {
  return new Promise((t) => setTimeout(t, e));
}
var Pw = class {
  async upload(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await ww(e, t, n, r);
  }
  async uploadToFileSearchStore(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Cw(e, t, n, r);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Iw(e);
  }
}, Rw = class {
  create(e, t, n) {
    return new xw(e, t, n);
  }
}, xw = class {
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
}, gc = "x-goog-api-key", Mw = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(gc) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(gc, this.apiKey);
    }
  }
}, Nw = class {
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
    const n = ly(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const r = new Mw(this.apiKey);
    this.apiClient = new bT({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new Pw(),
      downloader: new vw()
    }), this.models = new WT(this.apiClient), this.live = new GT(this.apiClient, r, new Rw()), this.batches = new O_(this.apiClient), this.chats = new Iv(this.models, this.apiClient), this.caches = new Ev(this.apiClient), this.files = new Fv(this.apiClient), this.operations = new zT(this.apiClient), this.authTokens = new fE(this.apiClient), this.tunings = new _w(this.apiClient), this.fileSearchStores = new AE(this.apiClient);
  }
};
function yc(e) {
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
function kw(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function Dw(e) {
  if (typeof e == "string") return [Ht(e)];
  if (!Array.isArray(e)) return [Ht("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? Ht(n.text || "") : n.type === "image_url" && n.image_url?.url ? kw(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [Ht("")];
}
function _c() {
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
function $w(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function Lw(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function Rs(e, t) {
  return e?.functionCall?.name ? [
    String(e.functionCall.id || ""),
    String(e.functionCall.name || ""),
    JSON.stringify(e.functionCall.args || {}),
    String(t)
  ].join("\0") : "";
}
function Uw(e = [], t = "") {
  const n = e.map((u) => Pr(u, "model")).filter(Boolean);
  if (!n.length) return null;
  const r = [...n].reverse().find((u) => $w(u)) || null, o = [...n].reverse().find((u) => Lw(u)) || null, s = dr(r || o || n[n.length - 1]);
  if (!s?.parts?.length) return n[n.length - 1];
  if (o) {
    const u = /* @__PURE__ */ new Map();
    n.forEach((h) => {
      h.parts.forEach((f, p) => {
        const m = Rs(f, p);
        if (!m) return;
        const g = u.get(m);
        (!g || f.thoughtSignature || !g.thoughtSignature) && u.set(m, dr(f));
      });
    });
    const d = /* @__PURE__ */ new Set();
    s.parts = s.parts.map((h, f) => {
      const p = Rs(h, f);
      return p ? (d.add(p), u.get(p) || h) : h;
    }), o.parts.forEach((h, f) => {
      const p = Rs(h, f);
      !p || d.has(p) || (s.parts.push(u.get(p) || dr(h)), d.add(p));
    });
  }
  const a = String(t || ""), c = s.parts.filter((u) => !(typeof u?.text == "string" && !u?.thought));
  return s.parts = a ? [{ text: a }, ...c] : c, s.parts.length ? s : n[n.length - 1];
}
function vc(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((r) => !r?.thought && typeof r?.text == "string" && r.text).map((r) => r.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function Ac(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((r) => r?.functionCall || r).filter((r) => r && r.name);
  return (t.length ? t : n).map((r, o) => ({
    id: r.id || `google-tool-${o + 1}`,
    name: r.name || "",
    arguments: JSON.stringify(r.args || {})
  })).filter((r) => r.name);
}
function Fw(e = [], t = []) {
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
function qw(e = []) {
  return {
    role: "user",
    parts: e.filter((t) => t && t.name).map((t) => ({ functionResponse: {
      name: t.name,
      response: t.response || {}
    } }))
  };
}
function Bw(e) {
  switch (e) {
    case "high":
      return cr.HIGH;
    case "medium":
      return cr.MEDIUM;
    default:
      return cr.LOW;
  }
}
function Sc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function Gw(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function Ow(e) {
  const t = e?.providerPayload?.googleContent;
  return Pr(t, "model");
}
function Hw(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = Ow(e);
    return n ? [n] : [];
  }
  return t.map((n) => Pr(n, "model")).filter(Boolean);
}
function ra(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => Pr(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function Vw(e) {
  const t = e?.candidates?.[0]?.content;
  return ra(t ? [t] : []);
}
function Jw(e) {
  return ra(e ? [e] : []);
}
function Sh(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? dr(e.history) || [] : [];
}
function Kw(e, t = 0) {
  return Sh(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => Pr(n, "model")).filter(Boolean);
}
function Ww(e) {
  const t = /* @__PURE__ */ new Map(), n = [], r = (e || []).filter((s) => s.role === "user" || s.role === "assistant" || s.role === "tool");
  r.forEach((s) => {
    (s.tool_calls || []).forEach((a) => {
      a.id && a.function?.name && t.set(a.id, a.function.name);
    });
  });
  for (let s = 0; s < r.length; s += 1) {
    const a = r[s];
    if (a.role === "tool") {
      const c = [];
      let u = s;
      for (; u < r.length && r[u].role === "tool"; ) {
        const d = r[u];
        c.push({ functionResponse: {
          name: String(d.toolName || d.tool_name || "").trim() || t.get(d.tool_call_id || "") || "tool_result",
          response: yc(d.content)
        } }), u += 1;
      }
      n.push({
        role: "user",
        parts: c
      }), s = u - 1;
      continue;
    }
    if (a.role === "assistant") {
      const c = Hw(a);
      if (c.length) {
        n.push(...c);
        continue;
      }
    }
    if (a.role === "assistant" && Array.isArray(a.tool_calls) && a.tool_calls.length) {
      n.push({
        role: "model",
        parts: [...a.content ? [Ht(a.content)] : [], ...a.tool_calls.map((c) => ({ functionCall: {
          name: c.function.name,
          args: yc(c.function.arguments)
        } }))]
      });
      continue;
    }
    n.push({
      role: a.role === "assistant" ? "model" : "user",
      parts: Dw(a.content)
    });
  }
  if (!n.length) return {
    history: [],
    latestMessage: _c().parts
  };
  const o = n[n.length - 1];
  return o.role === "user" && o.parts?.length ? {
    history: n.slice(0, -1),
    latestMessage: o.parts
  } : {
    history: n,
    latestMessage: _c().parts
  };
}
function zw(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Tc(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
var Yw = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.client = new Nw({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e) {
    const t = Ww(e.messages), n = Array.isArray(e.tools) ? e.tools : [], r = Gw(e), o = {
      ...r ? { systemInstruction: r } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    return e.reasoning?.enabled && (o.thinkingConfig = {
      includeThoughts: !0,
      thinkingLevel: Bw(e.reasoning.effort)
    }), n.length && (o.tools = [{ functionDeclarations: n.map((s) => ({
      name: s.function.name,
      description: s.function.description,
      parameters: s.function.parameters
    })) }]), n.length && e.toolChoice && e.toolChoice !== "auto" && e.toolChoice !== "none" && (o.toolConfig = { functionCallingConfig: { mode: js.ANY } }), {
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
    let r, o, s, a = [], c = null;
    const u = { ...t }, d = typeof n.onStreamProgress == "function", h = Sh(e).length;
    if (d) {
      const g = await e.sendMessageStream(u), _ = /* @__PURE__ */ new Map();
      let v = "", w = [], I = null;
      const P = [];
      for await (const M of g) {
        I = M;
        const x = M?.candidates?.[0]?.content;
        x?.parts?.length && P.push(x), Sc(M).forEach((F, R) => {
          const D = `${F.label}:${R}`;
          _.set(D, Tc(_.get(D) || "", F.text));
        }), w = (M.functionCalls || []).map((F, R) => ({
          id: F.id || `google-tool-${R + 1}`,
          name: F.name || "",
          arguments: JSON.stringify(F.args || {})
        })).filter((F) => F.name), a = Fw(a, w.length ? w : Ac(M));
        const C = vc(M);
        v = Tc(v, C), zw(n, {
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
      r = I || { functionCalls: w }, c = Uw(P, v) || r?.candidates?.[0]?.content || null, o = Array.from(_.values()).filter(Boolean).map((M, x) => ({
        label: `思考块 ${x + 1}`,
        text: M
      })), s = v;
    } else
      r = await e.sendMessage(u), o = Sc(r), s = vc(r);
    const f = Ac(r), p = f.length ? f : a, m = Kw(e, h);
    return {
      text: s,
      toolCalls: p,
      thoughts: o,
      finishReason: r.candidates?.[0]?.finishReason || "STOP",
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: ra(m) || Jw(c) || Vw(r)
    };
  }
  async chat(e) {
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: qw(e.toolResponses) };
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
var Th = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Th = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function mi(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var gi = (e) => {
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
}, ge = class yi extends G {
  constructor(t, n, r, o) {
    super(`${yi.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("x-request-id"), this.error = n;
    const s = n;
    this.code = s?.code, this.param = s?.param, this.type = s?.type;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Xo({
      message: r,
      cause: gi(n)
    });
    const s = n?.error;
    return t === 400 ? new Eh(t, s, r, o) : t === 401 ? new wh(t, s, r, o) : t === 403 ? new Ch(t, s, r, o) : t === 404 ? new Ih(t, s, r, o) : t === 409 ? new bh(t, s, r, o) : t === 422 ? new Ph(t, s, r, o) : t === 429 ? new Rh(t, s, r, o) : t >= 500 ? new xh(t, s, r, o) : new yi(t, s, r, o);
  }
}, Ke = class extends ge {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Xo = class extends ge {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, oa = class extends Xo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Eh = class extends ge {
}, wh = class extends ge {
}, Ch = class extends ge {
}, Ih = class extends ge {
}, bh = class extends ge {
}, Ph = class extends ge {
}, Rh = class extends ge {
}, xh = class extends ge {
}, Mh = class extends G {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, Nh = class extends G {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Zn = class extends Error {
  constructor(e) {
    super(e);
  }
}, kh = class extends ge {
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
}, Xw = class extends G {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, Qw = /^[a-z][a-z0-9+.-]*:/i, Zw = (e) => Qw.test(e), Ce = (e) => (Ce = Array.isArray, Ce(e)), Ec = Ce;
function sa(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function wc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function jw(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function xs(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var eC = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new G(`${e} must be an integer`);
  if (t < 0) throw new G(`${e} must be a positive integer`);
  return t;
}, tC = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Rr = (e) => new Promise((t) => setTimeout(t, e)), sn = "6.44.0", nC = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function rC() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var oC = () => {
  const e = rC();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": sn,
    "X-Stainless-OS": Ic(Deno.build.os),
    "X-Stainless-Arch": Cc(Deno.build.arch),
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
    "X-Stainless-OS": Ic(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Cc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = sC();
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
function sC() {
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
var Cc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Ic = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), bc, iC = () => bc ?? (bc = oC());
function Dh() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function $h(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Lh(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return $h({
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
function Uh(e) {
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
async function Pc(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var aC = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Fh = "RFC3986", qh = (e) => String(e), Rc = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: qh
};
var _i = (e, t) => (_i = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), _i(e, t)), ot = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), Ms = 1024, lC = (e, t, n, r, o) => {
  if (e.length === 0) return e;
  let s = e;
  if (typeof e == "symbol" ? s = Symbol.prototype.toString.call(e) : typeof e != "string" && (s = String(e)), n === "iso-8859-1") return escape(s).replace(/%u[0-9a-f]{4}/gi, function(c) {
    return "%26%23" + parseInt(c.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let c = 0; c < s.length; c += Ms) {
    const u = s.length >= Ms ? s.slice(c, c + Ms) : s, d = [];
    for (let h = 0; h < u.length; ++h) {
      let f = u.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || o === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = u.charAt(h);
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
      h += 1, f = 65536 + ((f & 1023) << 10 | u.charCodeAt(h) & 1023), d[d.length] = ot[240 | f >> 18] + ot[128 | f >> 12 & 63] + ot[128 | f >> 6 & 63] + ot[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function uC(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function xc(e, t) {
  if (Ce(e)) {
    const n = [];
    for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
    return n;
  }
  return t(e);
}
var Bh = {
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
}, Gh = function(e, t) {
  Array.prototype.push.apply(e, Ce(t) ? t : [t]);
}, Mc, ae = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: lC,
  encodeValuesOnly: !1,
  format: Fh,
  formatter: qh,
  indices: !1,
  serializeDate(e) {
    return (Mc ?? (Mc = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function cC(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var Ns = {};
function Oh(e, t, n, r, o, s, a, c, u, d, h, f, p, m, g, _, v, w) {
  let I = e, P = w, M = 0, x = !1;
  for (; (P = P.get(Ns)) !== void 0 && !x; ) {
    const H = P.get(e);
    if (M += 1, typeof H < "u") {
      if (H === M) throw new RangeError("Cyclic object value");
      x = !0;
    }
    typeof P.get(Ns) > "u" && (M = 0);
  }
  if (typeof d == "function" ? I = d(t, I) : I instanceof Date ? I = p?.(I) : n === "comma" && Ce(I) && (I = xc(I, function(H) {
    return H instanceof Date ? p?.(H) : H;
  })), I === null) {
    if (s) return u && !_ ? u(t, ae.encoder, v, "key", m) : t;
    I = "";
  }
  if (cC(I) || uC(I)) {
    if (u) {
      const H = _ ? t : u(t, ae.encoder, v, "key", m);
      return [g?.(H) + "=" + g?.(u(I, ae.encoder, v, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(I))];
  }
  const C = [];
  if (typeof I > "u") return C;
  let F;
  if (n === "comma" && Ce(I))
    _ && u && (I = xc(I, u)), F = [{ value: I.length > 0 ? I.join(",") || null : void 0 }];
  else if (Ce(d)) F = d;
  else {
    const H = Object.keys(I);
    F = h ? H.sort(h) : H;
  }
  const R = c ? String(t).replace(/\./g, "%2E") : String(t), D = r && Ce(I) && I.length === 1 ? R + "[]" : R;
  if (o && Ce(I) && I.length === 0) return D + "[]";
  for (let H = 0; H < F.length; ++H) {
    const z = F[H], j = typeof z == "object" && typeof z.value < "u" ? z.value : I[z];
    if (a && j === null) continue;
    const ee = f && c ? z.replace(/\./g, "%2E") : z, Q = Ce(I) ? typeof n == "function" ? n(D, ee) : D : D + (f ? "." + ee : "[" + ee + "]");
    w.set(e, M);
    const X = /* @__PURE__ */ new WeakMap();
    X.set(Ns, w), Gh(C, Oh(j, Q, n, r, o, s, a, c, n === "comma" && _ && Ce(I) ? null : u, d, h, f, p, m, g, _, v, X));
  }
  return C;
}
function dC(e = ae) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || ae.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Fh;
  if (typeof e.format < "u") {
    if (!_i(Rc, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const r = Rc[n];
  let o = ae.filter;
  (typeof e.filter == "function" || Ce(e.filter)) && (o = e.filter);
  let s;
  if (e.arrayFormat && e.arrayFormat in Bh ? s = e.arrayFormat : "indices" in e ? s = e.indices ? "indices" : "repeat" : s = ae.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
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
function fC(e, t = {}) {
  let n = e;
  const r = dC(t);
  let o, s;
  typeof r.filter == "function" ? (s = r.filter, n = s("", n)) : Ce(r.filter) && (s = r.filter, o = s);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const c = Bh[r.arrayFormat], u = c === "comma" && r.commaRoundTrip;
  o || (o = Object.keys(n)), r.sort && o.sort(r.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < o.length; ++p) {
    const m = o[p];
    r.skipNulls && n[m] === null || Gh(a, Oh(n[m], m, c, u, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, d));
  }
  const h = a.join(r.delimiter);
  let f = r.addQueryPrefix === !0 ? "?" : "";
  return r.charsetSentinel && (r.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function hC(e) {
  return fC(e, { arrayFormat: "brackets" });
}
function pC(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var Nc;
function ia(e) {
  let t;
  return (Nc ?? (t = new globalThis.TextEncoder(), Nc = t.encode.bind(t)))(e);
}
var kc;
function Dc(e) {
  let t;
  return (kc ?? (t = new globalThis.TextDecoder(), kc = t.decode.bind(t)))(e);
}
var Ne, ke, Qo = class {
  constructor() {
    Ne.set(this, void 0), ke.set(this, void 0), O(this, Ne, new Uint8Array(), "f"), O(this, ke, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ia(e) : e;
    O(this, Ne, pC([E(this, Ne, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = mC(E(this, Ne, "f"), E(this, ke, "f"))) != null; ) {
      if (r.carriage && E(this, ke, "f") == null) {
        O(this, ke, r.index, "f");
        continue;
      }
      if (E(this, ke, "f") != null && (r.index !== E(this, ke, "f") + 1 || r.carriage)) {
        n.push(Dc(E(this, Ne, "f").subarray(0, E(this, ke, "f") - 1))), O(this, Ne, E(this, Ne, "f").subarray(E(this, ke, "f")), "f"), O(this, ke, null, "f");
        continue;
      }
      const o = E(this, ke, "f") !== null ? r.preceding - 1 : r.preceding, s = Dc(E(this, Ne, "f").subarray(0, o));
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
Qo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Qo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function mC(e, t) {
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
function gC(e) {
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
}, $c = (e, t, n) => {
  if (e) {
    if (jw(No, e)) return e;
    fe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(No))}`);
  }
};
function jn() {
}
function eo(e, t, n) {
  return !t || No[e] > No[n] ? jn : t[e].bind(t);
}
var yC = {
  error: jn,
  warn: jn,
  info: jn,
  debug: jn
}, Lc = /* @__PURE__ */ new WeakMap();
function fe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return yC;
  const r = Lc.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: eo("error", t, n),
    warn: eo("warn", t, n),
    info: eo("info", t, n),
    debug: eo("debug", t, n)
  };
  return Lc.set(t, [n, o]), o;
}
var Ft = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Jn, Ar = class er {
  constructor(t, n, r) {
    this.iterator = t, Jn.set(this, void 0), this.controller = n, O(this, Jn, r, "f");
  }
  static fromSSEResponse(t, n, r, o) {
    let s = !1;
    const a = r ? fe(r) : console;
    async function* c() {
      if (s) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const d of _C(t, n))
          if (!u) {
            if (d.data.startsWith("[DONE]")) {
              u = !0;
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
        u = !0;
      } catch (d) {
        if (mi(d)) return;
        throw d;
      } finally {
        u || n.abort();
      }
    }
    return new er(c, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* s() {
      const c = new Qo(), u = Uh(t);
      for await (const d of u) for (const h of c.decode(d)) yield h;
      for (const d of c.flush()) yield d;
    }
    async function* a() {
      if (o) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let c = !1;
      try {
        for await (const u of s())
          c || u && (yield JSON.parse(u));
        c = !0;
      } catch (u) {
        if (mi(u)) return;
        throw u;
      } finally {
        c || n.abort();
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
    return $h({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: s } = await n.next();
          if (s) return r.close();
          const a = ia(JSON.stringify(o) + `
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
async function* _C(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
  const n = new AC(), r = new Qo(), o = Uh(e.body);
  for await (const s of vC(o)) for (const a of r.decode(s)) {
    const c = n.decode(a);
    c && (yield c);
  }
  for (const s of r.flush()) {
    const a = n.decode(s);
    a && (yield a);
  }
}
async function* vC(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? ia(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let s;
    for (; (s = gC(t)) !== -1; )
      yield t.slice(0, s), t = t.slice(s);
  }
  t.length > 0 && (yield t);
}
var AC = class {
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
    let [t, n, r] = SC(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function SC(e, t) {
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
async function Hh(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: s } = t, a = await (async () => {
    if (t.options.stream)
      return fe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : Ar.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type")?.split(";")[0]?.trim();
    return c?.includes("application/json") || c?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Vh(await n.json(), n) : await n.text();
  })();
  return fe(e).debug(`[${r}] response parsed`, Ft({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - s
  })), a;
}
function Vh(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var tr, Jh = class Kh extends Promise {
  constructor(t, n, r = Hh) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, tr.set(this, void 0), O(this, tr, t, "f");
  }
  _thenUnwrap(t) {
    return new Kh(E(this, tr, "f"), this.responsePromise, async (n, r) => Vh(t(await this.parseResponse(n, r), r), r.response));
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
var to, Zo = class {
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
}, TC = class extends Jh {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await Hh(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Mt = class extends Zo {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, te = class extends Zo {
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
        ...sa(this.options.query),
        after: t
      }
    } : null;
  }
}, pe = class extends Zo {
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
        ...sa(this.options.query),
        after: e
      }
    } : null;
  }
}, At = class extends Zo {
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
        ...sa(this.options.query),
        after: e
      }
    } : null;
  }
}, EC = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, wC = "urn:ietf:params:oauth:grant-type:token-exchange", CC = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Dh();
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
      grant_type: wC,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: EC[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new kh(t.status, a, t.headers) : ge.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
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
}, Wh = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function fr(e, t, n) {
  return Wh(), new File(e, t ?? "unknown_file", n);
}
function mo(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var aa = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", jo = async (e, t) => vi(e.body) ? {
  ...e,
  body: await zh(e.body, t)
} : e, at = async (e, t) => ({
  ...e,
  body: await zh(e.body, t)
}), Uc = /* @__PURE__ */ new WeakMap();
function IC(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Uc.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, s = new FormData();
      return s.toString() !== await new o(s).text();
    } catch {
      return !0;
    }
  })();
  return Uc.set(t, r), r;
}
var zh = async (e, t) => {
  if (!await IC(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, o]) => Ai(n, r, o))), n;
}, Yh = (e) => e instanceof Blob && "name" in e, bC = (e) => typeof e == "object" && e !== null && (e instanceof Response || aa(e) || Yh(e)), vi = (e) => {
  if (bC(e)) return !0;
  if (Array.isArray(e)) return e.some(vi);
  if (e && typeof e == "object") {
    for (const t in e) if (vi(e[t])) return !0;
  }
  return !1;
}, Ai = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, fr([await n.blob()], mo(n)));
    else if (aa(n)) e.append(t, fr([await new Response(Lh(n)).blob()], mo(n)));
    else if (Yh(n)) e.append(t, n, mo(n));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Ai(e, t + "[]", r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, o]) => Ai(e, `${t}[${r}]`, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Xh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", PC = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Xh(e), RC = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function xC(e, t, n) {
  if (Wh(), e = await e, PC(e))
    return e instanceof File ? e : fr([await e.arrayBuffer()], e.name);
  if (RC(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), fr(await Si(o), t, n);
  }
  const r = await Si(e);
  if (t || (t = mo(e)), !n?.type) {
    const o = r.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return fr(r, t, n);
}
async function Si(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Xh(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (aa(e)) for await (const n of e) t.push(...await Si(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${MC(e)}`);
  }
  return t;
}
function MC(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var k = class {
  constructor(e) {
    this._client = e;
  }
};
function Qh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Fc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), NC = (e = Qh) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const s = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let g = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Fc) ?? Fc)?.toString) && (g = m + "", s.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : g);
  }, ""), c = a.split(/[?#]/, 1)[0], u = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = u.exec(c)) !== null; ) s.push({
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
}, A = /* @__PURE__ */ NC(Qh), Zh = class extends k {
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
function la(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function xr(e) {
  return e?.$brand === "auto-parseable-tool";
}
function kC(e, t) {
  return !t || !jh(t) ? {
    ...e,
    choices: e.choices.map((n) => (ep(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : ua(e, t);
}
function ua(e, t) {
  const n = e.choices.map((r) => {
    if (r.finish_reason === "length") throw new Mh();
    if (r.finish_reason === "content_filter") throw new Nh();
    return ep(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        ...r.message.tool_calls ? { tool_calls: r.message.tool_calls?.map((o) => $C(t, o)) ?? void 0 } : void 0,
        parsed: r.message.content && !r.message.refusal ? DC(t, r.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function DC(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function $C(e, t) {
  const n = e.tools?.find((r) => ko(r) && r.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: xr(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function LC(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((r) => ko(r) && r.function?.name === t.function.name);
  return ko(n) && (xr(n) || n?.function.strict || !1);
}
function jh(e) {
  return la(e.response_format) ? !0 : e.tools?.some((t) => xr(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function ep(e) {
  for (const t of e || []) if (t.type !== "function") throw new G(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function UC(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new G(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new G(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Do = (e) => e?.role === "assistant", tp = (e) => e?.role === "tool", Ti, go, yo, nr, rr, _o, or, ht, sr, $o, Lo, an, np, ca = class {
  constructor() {
    Ti.add(this), this.controller = new AbortController(), go.set(this, void 0), yo.set(this, () => {
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
      }, E(this, Ti, "m", np).bind(this));
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
go = /* @__PURE__ */ new WeakMap(), yo = /* @__PURE__ */ new WeakMap(), nr = /* @__PURE__ */ new WeakMap(), rr = /* @__PURE__ */ new WeakMap(), _o = /* @__PURE__ */ new WeakMap(), or = /* @__PURE__ */ new WeakMap(), ht = /* @__PURE__ */ new WeakMap(), sr = /* @__PURE__ */ new WeakMap(), $o = /* @__PURE__ */ new WeakMap(), Lo = /* @__PURE__ */ new WeakMap(), an = /* @__PURE__ */ new WeakMap(), Ti = /* @__PURE__ */ new WeakSet(), np = function(t) {
  if (O(this, $o, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Ke()), t instanceof Ke)
    return O(this, Lo, !0, "f"), this._emit("abort", t);
  if (t instanceof G) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new G(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new G(String(t)));
};
function FC(e) {
  return typeof e.parse == "function";
}
var ve, Ei, Uo, wi, Ci, Ii, rp, op, qC = 10, sp = class extends ca {
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
      if (this._emit("message", e), tp(e) && e.content) this._emit("functionToolCallResult", e.content);
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
    return await this.done(), E(this, ve, "m", Ei).call(this);
  }
  async finalMessage() {
    return await this.done(), E(this, ve, "m", Uo).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), E(this, ve, "m", wi).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), E(this, ve, "m", Ci).call(this);
  }
  async totalUsage() {
    return await this.done(), E(this, ve, "m", Ii).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = E(this, ve, "m", Uo).call(this);
    t && this._emit("finalMessage", t);
    const n = E(this, ve, "m", Ei).call(this);
    n && this._emit("finalContent", n);
    const r = E(this, ve, "m", wi).call(this);
    r && this._emit("finalFunctionToolCall", r);
    const o = E(this, ve, "m", Ci).call(this);
    o != null && this._emit("finalFunctionToolCallResult", o), this._chatCompletions.some((s) => s.usage) && this._emit("totalUsage", E(this, ve, "m", Ii).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), E(this, ve, "m", rp).call(this, t);
    const o = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(ua(o, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const r of t.messages) this._addMessage(r, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const r = "tool", { tool_choice: o = "auto", stream: s, ...a } = t, c = typeof o != "string" && o.type === "function" && o?.function?.name, { maxChatCompletions: u = qC } = n || {}, d = t.tools.map((p) => {
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
    for (let p = 0; p < u; ++p) {
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
          if (c && c !== v) {
            const C = `Invalid tool_call: ${JSON.stringify(v)}. ${JSON.stringify(c)} requested. Please try again`;
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
          P = FC(I) ? await I.parse(w) : w;
        } catch (C) {
          const F = C instanceof Error ? C.message : String(C);
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: F
          });
          continue;
        }
        const M = await I.function(P, this), x = E(this, ve, "m", op).call(this, M);
        if (this._addMessage({
          role: r,
          tool_call_id: _,
          content: x
        }), c) return;
      }
    }
  }
};
ve = /* @__PURE__ */ new WeakSet(), Ei = function() {
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
}, wi = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Do(n) && n?.tool_calls?.length) for (let r = n.tool_calls.length - 1; r >= 0; r--) {
      const o = n.tool_calls[r];
      if (o?.type === "function") return o.function;
    }
  }
}, Ci = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (tp(n) && n.content != null && typeof n.content == "string" && this.messages.some((r) => r.role === "assistant" && r.tool_calls?.some((o) => o.type === "function" && o.id === n.tool_call_id))) return n.content;
  }
}, Ii = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, rp = function(t) {
  if (t.n != null && t.n > 1) throw new G("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, op = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var BC = class ip extends sp {
  static runTools(t, n, r) {
    const o = new ip(), s = {
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
}, GC = class extends Error {
}, OC = class extends Error {
};
function HC(e, t = ce.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return VC(e.trim(), t);
}
var VC = (e, t) => {
  const n = e.length;
  let r = 0;
  const o = (p) => {
    throw new GC(`${p} at position ${r}`);
  }, s = (p) => {
    throw new OC(`${p} at position ${r}`);
  }, a = () => (f(), r >= n && o("Unexpected end of input"), e[r] === '"' ? c() : e[r] === "{" ? u() : e[r] === "[" ? d() : e.substring(r, r + 4) === "null" || ce.NULL & t && n - r < 4 && "null".startsWith(e.substring(r)) ? (r += 4, null) : e.substring(r, r + 4) === "true" || ce.BOOL & t && n - r < 4 && "true".startsWith(e.substring(r)) ? (r += 4, !0) : e.substring(r, r + 5) === "false" || ce.BOOL & t && n - r < 5 && "false".startsWith(e.substring(r)) ? (r += 5, !1) : e.substring(r, r + 8) === "Infinity" || ce.INFINITY & t && n - r < 8 && "Infinity".startsWith(e.substring(r)) ? (r += 8, 1 / 0) : e.substring(r, r + 9) === "-Infinity" || ce.MINUS_INFINITY & t && 1 < n - r && n - r < 9 && "-Infinity".startsWith(e.substring(r)) ? (r += 9, -1 / 0) : e.substring(r, r + 3) === "NaN" || ce.NAN & t && n - r < 3 && "NaN".startsWith(e.substring(r)) ? (r += 3, NaN) : h()), c = () => {
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
  }, u = () => {
    r++, f();
    const p = {};
    try {
      for (; e[r] !== "}"; ) {
        if (f(), r >= n && ce.OBJ & t) return p;
        const m = c();
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
}, qc = (e) => HC(e, ce.ALL ^ ce.NUM), se, ft, en, wt, ks, no, Ds, $s, Ls, ro, Us, Bc, ap = class bi extends sp {
  constructor(t) {
    super(), se.add(this), ft.set(this, void 0), en.set(this, void 0), wt.set(this, void 0), O(this, ft, t, "f"), O(this, en, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return E(this, wt, "f");
  }
  static fromReadableStream(t) {
    const n = new bi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, r) {
    const o = new bi(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), E(this, se, "m", ks).call(this);
    const s = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of s) E(this, se, "m", Ds).call(this, a);
    if (s.controller.signal?.aborted) throw new Ke();
    return this._addChatCompletion(E(this, se, "m", ro).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), E(this, se, "m", ks).call(this), this._connected();
    const o = Ar.fromReadableStream(t, this.controller);
    let s;
    for await (const a of o)
      s && s !== a.id && this._addChatCompletion(E(this, se, "m", ro).call(this)), E(this, se, "m", Ds).call(this, a), s = a.id;
    if (o.controller.signal?.aborted) throw new Ke();
    return this._addChatCompletion(E(this, se, "m", ro).call(this));
  }
  [(ft = /* @__PURE__ */ new WeakMap(), en = /* @__PURE__ */ new WeakMap(), wt = /* @__PURE__ */ new WeakMap(), se = /* @__PURE__ */ new WeakSet(), ks = function() {
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
  }, Ds = function(n) {
    if (this.ended) return;
    const r = E(this, se, "m", Bc).call(this, n);
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
      s.finish_reason && (E(this, se, "m", Ls).call(this, s), a.current_tool_call_index != null && E(this, se, "m", $s).call(this, s, a.current_tool_call_index));
      for (const c of o.delta.tool_calls ?? [])
        a.current_tool_call_index !== c.index && (E(this, se, "m", Ls).call(this, s), a.current_tool_call_index != null && E(this, se, "m", $s).call(this, s, a.current_tool_call_index)), a.current_tool_call_index = c.index;
      for (const c of o.delta.tool_calls ?? []) {
        const u = s.message.tool_calls?.[c.index];
        u?.type && (u?.type === "function" ? this._emit("tool_calls.function.arguments.delta", {
          name: u.function?.name,
          index: c.index,
          arguments: u.function.arguments,
          parsed_arguments: u.function.parsed_arguments,
          arguments_delta: c.function?.arguments ?? ""
        }) : u?.type);
      }
    }
  }, $s = function(n, r) {
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
  }, Ls = function(n) {
    const r = E(this, se, "m", no).call(this, n);
    if (n.message.content && !r.content_done) {
      r.content_done = !0;
      const o = E(this, se, "m", Us).call(this);
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
    return O(this, wt, void 0, "f"), O(this, en, [], "f"), JC(n, E(this, ft, "f"));
  }, Us = function() {
    const n = E(this, ft, "f")?.response_format;
    return la(n) ? n : null;
  }, Bc = function(n) {
    var r, o, s, a;
    let c = E(this, wt, "f");
    const { choices: u, ...d } = n;
    c ? Object.assign(c, d) : c = O(this, wt, {
      ...d,
      choices: []
    }, "f");
    for (const { delta: h, finish_reason: f, index: p, logprobs: m = null, ...g } of n.choices) {
      let _ = c.choices[p];
      if (_ || (_ = c.choices[p] = {
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
      if (f && (_.finish_reason = f, E(this, ft, "f") && jh(E(this, ft, "f")))) {
        if (f === "length") throw new Mh();
        if (f === "content_filter") throw new Nh();
      }
      if (Object.assign(_, g), !h) continue;
      const { content: v, refusal: w, function_call: I, role: P, tool_calls: M, ...x } = h;
      if (Object.assign(_.message, x), w && (_.message.refusal = (_.message.refusal || "") + w), P && (_.message.role = P), I && (_.message.function_call ? (I.name && (_.message.function_call.name = I.name), I.arguments && ((s = _.message.function_call).arguments ?? (s.arguments = ""), _.message.function_call.arguments += I.arguments)) : _.message.function_call = I), v && (_.message.content = (_.message.content || "") + v, !_.message.refusal && E(this, se, "m", Us).call(this) && (_.message.parsed = qc(_.message.content))), M) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: C, id: F, type: R, function: D, ...H } of M) {
          const z = (a = _.message.tool_calls)[C] ?? (a[C] = {});
          Object.assign(z, H), F && (z.id = F), R && (z.type = R), D && (z.function ?? (z.function = {
            name: D.name ?? "",
            arguments: ""
          })), D?.name && (z.function.name = D.name), D?.arguments && (z.function.arguments += D.arguments, LC(E(this, ft, "f"), z) && (z.function.parsed_arguments = qc(z.function.arguments)));
        }
      }
    }
    return c;
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
function JC(e, t) {
  const { id: n, choices: r, created: o, model: s, system_fingerprint: a, ...c } = e;
  return kC({
    ...c,
    id: n,
    choices: r.map(({ message: u, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new G(`missing finish_reason for choice ${h}`);
      const { content: m = null, function_call: g, tool_calls: _, ...v } = u, w = u.role;
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
            refusal: u.refusal ?? null
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
          refusal: u.refusal ?? null,
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
          refusal: u.refusal ?? null
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
var KC = class Pi extends ap {
  static fromReadableStream(t) {
    const n = new Pi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, r) {
    const o = new Pi(n), s = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, s)), o;
  }
}, da = class extends k {
  constructor() {
    super(...arguments), this.messages = new Zh(this._client);
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
    return UC(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => ua(n, e));
  }
  runTools(e, t) {
    return e.stream ? KC.runTools(this._client, e, t) : BC.runTools(this._client, e, t);
  }
  stream(e, t) {
    return ap.createChatCompletion(this._client, e, t);
  }
};
da.Messages = Zh;
var fa = class extends k {
  constructor() {
    super(...arguments), this.completions = new da(this._client);
  }
};
fa.Completions = da;
var lp = class extends k {
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
}, up = class extends k {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", pe, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, cp = class extends k {
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
}, dp = class extends k {
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
}, fp = class extends k {
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
}, hp = class extends k {
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
}, pp = class extends k {
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
}, mp = class extends k {
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
}, gp = class extends k {
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
}, yp = class extends k {
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
}, es = class extends k {
  constructor() {
    super(...arguments), this.users = new yp(this._client), this.roles = new gp(this._client);
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
es.Users = yp;
es.Roles = gp;
var _p = class extends k {
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
}, vp = class extends k {
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
}, Ap = class extends k {
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
}, Sp = class extends k {
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
}, Tp = class extends k {
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
}, Ep = class extends k {
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
}, wp = class extends k {
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
}, Cp = class extends k {
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
}, Ip = class extends k {
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
}, bp = class extends k {
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
}, ha = class extends k {
  constructor() {
    super(...arguments), this.roles = new bp(this._client);
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
ha.Roles = bp;
var Pp = class extends k {
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
}, pa = class extends k {
  constructor() {
    super(...arguments), this.roles = new Pp(this._client);
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
pa.Roles = Pp;
var qe = class extends k {
  constructor() {
    super(...arguments), this.users = new pa(this._client), this.serviceAccounts = new Cp(this._client), this.apiKeys = new _p(this._client), this.rateLimits = new Ep(this._client), this.modelPermissions = new Tp(this._client), this.hostedToolPermissions = new Sp(this._client), this.groups = new ha(this._client), this.roles = new wp(this._client), this.dataRetention = new Ap(this._client), this.spendAlerts = new Ip(this._client), this.certificates = new vp(this._client);
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
qe.Users = pa;
qe.ServiceAccounts = Cp;
qe.APIKeys = _p;
qe.RateLimits = Ep;
qe.ModelPermissions = Tp;
qe.HostedToolPermissions = Sp;
qe.Groups = ha;
qe.Roles = wp;
qe.DataRetention = Ap;
qe.SpendAlerts = Ip;
qe.Certificates = vp;
var Rp = class extends k {
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
}, ma = class extends k {
  constructor() {
    super(...arguments), this.roles = new Rp(this._client);
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
ma.Roles = Rp;
var Be = class extends k {
  constructor() {
    super(...arguments), this.auditLogs = new up(this._client), this.adminAPIKeys = new lp(this._client), this.usage = new mp(this._client), this.invites = new fp(this._client), this.users = new ma(this._client), this.groups = new es(this._client), this.roles = new hp(this._client), this.dataRetention = new dp(this._client), this.spendAlerts = new pp(this._client), this.certificates = new cp(this._client), this.projects = new qe(this._client);
  }
};
Be.AuditLogs = up;
Be.AdminAPIKeys = lp;
Be.Usage = mp;
Be.Invites = fp;
Be.Users = ma;
Be.Groups = es;
Be.Roles = hp;
Be.DataRetention = dp;
Be.SpendAlerts = pp;
Be.Certificates = cp;
Be.Projects = qe;
var ga = class extends k {
  constructor() {
    super(...arguments), this.organization = new Be(this._client);
  }
};
ga.Organization = Be;
var xp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* WC(e) {
  if (!e) return;
  if (xp in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const s of o) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Ec(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const s = Ec(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const c of s)
      c !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, c]);
  }
}
var U = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [s, a] of WC(r)) {
      const c = s.toLowerCase();
      o.has(c) || (t.delete(s), o.add(c)), a === null ? (t.delete(s), n.add(c)) : (t.append(s, a), n.delete(c));
    }
  }
  return {
    [xp]: !0,
    values: t,
    nulls: n
  };
}, Mp = class extends k {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: U([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Np = class extends k {
  create(e, t) {
    return this._client.post("/audio/transcriptions", at({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, kp = class extends k {
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
    super(...arguments), this.transcriptions = new Np(this._client), this.translations = new kp(this._client), this.speech = new Mp(this._client);
  }
};
Mr.Transcriptions = Np;
Mr.Translations = kp;
Mr.Speech = Mp;
var Dp = class extends k {
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
}, $p = class extends k {
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
}, Lp = class extends k {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Up = class extends k {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, ts = class extends k {
  constructor() {
    super(...arguments), this.sessions = new Lp(this._client), this.transcriptionSessions = new Up(this._client);
  }
};
ts.Sessions = Lp;
ts.TranscriptionSessions = Up;
var Fp = class extends k {
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
}, qp = class extends k {
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
}, ns = class extends k {
  constructor() {
    super(...arguments), this.sessions = new Fp(this._client), this.threads = new qp(this._client);
  }
};
ns.Sessions = Fp;
ns.Threads = qp;
var Bp = class extends k {
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
}, Gp = class extends k {
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
}, zC = (e) => {
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
}, he, Vt, Ri, it, vo, Xe, Jt, fn, Bt, Fo, De, Ao, So, hr, ir, ar, Gc, Oc, Hc, Vc, Jc, Kc, Wc, pr = class extends ca {
  constructor() {
    super(...arguments), he.add(this), Ri.set(this, []), it.set(this, {}), vo.set(this, {}), Xe.set(this, void 0), Jt.set(this, void 0), fn.set(this, void 0), Bt.set(this, void 0), Fo.set(this, void 0), De.set(this, void 0), Ao.set(this, void 0), So.set(this, void 0), hr.set(this, void 0);
  }
  [(Ri = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), vo = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakMap(), fn = /* @__PURE__ */ new WeakMap(), Bt = /* @__PURE__ */ new WeakMap(), Fo = /* @__PURE__ */ new WeakMap(), De = /* @__PURE__ */ new WeakMap(), Ao = /* @__PURE__ */ new WeakMap(), So = /* @__PURE__ */ new WeakMap(), hr = /* @__PURE__ */ new WeakMap(), he = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    for await (const c of a) E(this, he, "m", ir).call(this, c);
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
    for await (const c of a) E(this, he, "m", ir).call(this, c);
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
      else if (xs(o) && xs(r)) o = this.accumulateDelta(o, r);
      else if (Array.isArray(o) && Array.isArray(r)) {
        if (o.every((s) => typeof s == "string" || typeof s == "number")) {
          o.push(...r);
          continue;
        }
        for (const s of r) {
          if (!xs(s)) throw new Error(`Expected array delta entry to be an object but got: ${s}`);
          const a = s.index;
          if (a == null)
            throw console.error(s), new Error("Expected array delta entry to have an `index` property");
          if (typeof a != "number") throw new Error(`Expected array delta entry \`index\` property to be a number but got ${a}`);
          const c = o[a];
          c == null ? o.push(s) : o[a] = this.accumulateDelta(c, s);
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
    switch (O(this, Ao, t, "f"), E(this, he, "m", Hc).call(this, t), t.event) {
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
        E(this, he, "m", Wc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        E(this, he, "m", Oc).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        E(this, he, "m", Gc).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, ar = function() {
  if (this.ended) throw new G("stream has ended, this shouldn't happen");
  if (!E(this, Jt, "f")) throw Error("Final run has not been received");
  return E(this, Jt, "f");
}, Gc = function(t) {
  const [n, r] = E(this, he, "m", Jc).call(this, t, E(this, Xe, "f"));
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
}, Oc = function(t) {
  const n = E(this, he, "m", Vc).call(this, t);
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
}, Hc = function(t) {
  E(this, Ri, "f").push(t), this._emit("event", t);
}, Vc = function(t) {
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
}, Jc = function(t, n) {
  let r = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, r];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let o = t.data;
      if (o.delta.content) for (const s of o.delta.content) if (s.index in n.content) {
        let a = n.content[s.index];
        n.content[s.index] = E(this, he, "m", Kc).call(this, s, a);
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
}, Kc = function(t, n) {
  return Vt.accumulateDelta(n, t);
}, Wc = function(t) {
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
var ya = class extends k {
  constructor() {
    super(...arguments), this.steps = new Gp(this._client);
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
            const c = s.headers.get("openai-poll-after-ms");
            if (c) {
              const u = parseInt(c);
              isNaN(u) || (a = u);
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
ya.Steps = Gp;
var rs = class extends k {
  constructor() {
    super(...arguments), this.runs = new ya(this._client), this.messages = new Bp(this._client);
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
rs.Runs = ya;
rs.Messages = Bp;
var Cn = class extends k {
  constructor() {
    super(...arguments), this.realtime = new ts(this._client), this.chatkit = new ns(this._client), this.assistants = new $p(this._client), this.threads = new rs(this._client);
  }
};
Cn.Realtime = ts;
Cn.ChatKit = ns;
Cn.Assistants = $p;
Cn.Threads = rs;
var Op = class extends k {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, Hp = class extends k {
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(A`/containers/${r}/files/${e}/content`, {
      ...n,
      headers: U([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, _a = class extends k {
  constructor() {
    super(...arguments), this.content = new Hp(this._client);
  }
  create(e, t, n) {
    return this._client.post(A`/containers/${e}/files`, jo({
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
_a.Content = Hp;
var va = class extends k {
  constructor() {
    super(...arguments), this.files = new _a(this._client);
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
va.Files = _a;
var Vp = class extends k {
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
}, Aa = class extends k {
  constructor() {
    super(...arguments), this.items = new Vp(this._client);
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
Aa.Items = Vp;
var Jp = class extends k {
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
      const c = a.embedding;
      a.embedding = zC(c);
    }), s)));
  }
}, Kp = class extends k {
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
}, Sa = class extends k {
  constructor() {
    super(...arguments), this.outputItems = new Kp(this._client);
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
Sa.OutputItems = Kp;
var Ta = class extends k {
  constructor() {
    super(...arguments), this.runs = new Sa(this._client);
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
Ta.Runs = Sa;
var Wp = class extends k {
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
      if (await Rr(t), s = await this.retrieve(e), Date.now() - o > n) throw new oa({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return s;
  }
}, zp = class extends k {
}, Yp = class extends k {
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
}, Ea = class extends k {
  constructor() {
    super(...arguments), this.graders = new Yp(this._client);
  }
};
Ea.Graders = Yp;
var Xp = class extends k {
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
}, wa = class extends k {
  constructor() {
    super(...arguments), this.permissions = new Xp(this._client);
  }
};
wa.Permissions = Xp;
var Qp = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/fine_tuning/jobs/${e}/checkpoints`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Ca = class extends k {
  constructor() {
    super(...arguments), this.checkpoints = new Qp(this._client);
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
Ca.Checkpoints = Qp;
var In = class extends k {
  constructor() {
    super(...arguments), this.methods = new zp(this._client), this.jobs = new Ca(this._client), this.checkpoints = new wa(this._client), this.alpha = new Ea(this._client);
  }
};
In.Methods = zp;
In.Jobs = Ca;
In.Checkpoints = wa;
In.Alpha = Ea;
var Zp = class extends k {
}, Ia = class extends k {
  constructor() {
    super(...arguments), this.graderModels = new Zp(this._client);
  }
};
Ia.GraderModels = Zp;
var jp = class extends k {
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
}, em = class extends k {
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
}, tm = class extends k {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, nm = class extends k {
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
}, rm = class extends k {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, os = class extends k {
  constructor() {
    super(...arguments), this.clientSecrets = new rm(this._client), this.calls = new nm(this._client);
  }
};
os.ClientSecrets = rm;
os.Calls = nm;
function YC(e, t) {
  return !t || !QC(t) ? {
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
  } : om(e, t);
}
function om(e, t) {
  const n = e.output.map((o) => {
    if (o.type === "function_call") return {
      ...o,
      parsed_arguments: eI(t, o)
    };
    if (o.type === "message") {
      const s = o.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: XC(t, a.text)
      } : a);
      return {
        ...o,
        content: s
      };
    }
    return o;
  }), r = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || xi(r), Object.defineProperty(r, "output_parsed", {
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
function XC(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function QC(e) {
  return !!la(e.text?.format);
}
function ZC(e) {
  return e?.$brand === "auto-parseable-tool";
}
function jC(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function eI(e, t) {
  const n = jC(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: ZC(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function xi(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const r of n.content) r.type === "output_text" && t.push(r.text);
  e.output_text = t.join("");
}
var tn, so, It, io, zc, Yc, Xc, Qc, tI = class sm extends ca {
  constructor(t) {
    super(), tn.add(this), so.set(this, void 0), It.set(this, void 0), io.set(this, void 0), O(this, so, t, "f");
  }
  static createResponse(t, n, r) {
    const o = new sm(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), E(this, tn, "m", zc).call(this);
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
    for await (const c of s) E(this, tn, "m", Yc).call(this, c, a);
    if (s.controller.signal?.aborted) throw new Ke();
    return E(this, tn, "m", Xc).call(this);
  }
  [(so = /* @__PURE__ */ new WeakMap(), It = /* @__PURE__ */ new WeakMap(), io = /* @__PURE__ */ new WeakMap(), tn = /* @__PURE__ */ new WeakSet(), zc = function() {
    this.ended || O(this, It, void 0, "f");
  }, Yc = function(n, r) {
    if (this.ended) return;
    const o = (a, c) => {
      (r == null || c.sequence_number > r) && this._emit(a, c);
    }, s = E(this, tn, "m", Qc).call(this, n);
    switch (o("event", n), n.type) {
      case "response.output_text.delta": {
        const a = s.output[n.output_index];
        if (!a) throw new G(`missing output at index ${n.output_index}`);
        if (a.type === "message") {
          const c = a.content[n.content_index];
          if (!c) throw new G(`missing content at index ${n.content_index}`);
          if (c.type !== "output_text") throw new G(`expected content to be 'output_text', got ${c.type}`);
          o("response.output_text.delta", {
            ...n,
            snapshot: c.text
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
  }, Xc = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = E(this, It, "f");
    if (!n) throw new G("request ended without sending any events");
    O(this, It, void 0, "f");
    const r = nI(n, E(this, so, "f"));
    return O(this, io, r, "f"), r;
  }, Qc = function(n) {
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
function nI(e, t) {
  return YC(e, t);
}
var im = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/responses/${e}/input_items`, te, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, am = class extends k {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, ss = class extends k {
  constructor() {
    super(...arguments), this.inputItems = new im(this._client), this.inputTokens = new am(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && xi(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(A`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((r) => ("object" in r && r.object === "response" && xi(r), r));
  }
  delete(e, t) {
    return this._client.delete(A`/responses/${e}`, {
      ...t,
      headers: U([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => om(n, e));
  }
  stream(e, t) {
    return tI.createResponse(this._client, e, t);
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
ss.InputItems = im;
ss.InputTokens = am;
var lm = class extends k {
  retrieve(e, t) {
    return this._client.get(A`/skills/${e}/content`, {
      ...t,
      headers: U([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, um = class extends k {
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(A`/skills/${r}/versions/${e}/content`, {
      ...n,
      headers: U([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, ba = class extends k {
  constructor() {
    super(...arguments), this.content = new um(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(A`/skills/${e}/versions`, jo({
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
ba.Content = um;
var is = class extends k {
  constructor() {
    super(...arguments), this.content = new lm(this._client), this.versions = new ba(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", jo({
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
is.Content = lm;
is.Versions = ba;
var cm = class extends k {
  create(e, t, n) {
    return this._client.post(A`/uploads/${e}/parts`, at({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Pa = class extends k {
  constructor() {
    super(...arguments), this.parts = new cm(this._client);
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
Pa.Parts = cm;
var rI = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((o) => o.status === "rejected");
  if (n.length) {
    for (const o of n) console.error(o.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const r = [];
  for (const o of t) o.status === "fulfilled" && r.push(o.value);
  return r;
}, dm = class extends k {
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
            const c = s.headers.get("openai-poll-after-ms");
            if (c) {
              const u = parseInt(c);
              isNaN(u) || (a = u);
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
    const o = r?.maxConcurrency ?? 5, s = Math.min(o, t.length), a = this._client, c = t.values(), u = [...n];
    async function d(h) {
      for (let f of h) {
        const p = await a.files.create({
          file: f,
          purpose: "assistants"
        }, r);
        u.push(p.id);
      }
    }
    return await rI(Array(s).fill(c).map(d)), await this.createAndPoll(e, { file_ids: u });
  }
}, fm = class extends k {
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
            const c = o.response.headers.get("openai-poll-after-ms");
            if (c) {
              const u = parseInt(c);
              isNaN(u) || (a = u);
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
}, as = class extends k {
  constructor() {
    super(...arguments), this.files = new fm(this._client), this.fileBatches = new dm(this._client);
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
as.Files = fm;
as.FileBatches = dm;
var hm = class extends k {
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
    return this._client.post(A`/videos/${e}/remix`, jo({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, ln, pm, To, mm = class extends k {
  constructor() {
    super(...arguments), ln.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
    return await this.verifySignature(e, t, n, r), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    E(this, ln, "m", pm).call(this, n);
    const o = U([t]).values, s = E(this, ln, "m", To).call(this, o, "webhook-signature"), a = E(this, ln, "m", To).call(this, o, "webhook-timestamp"), c = E(this, ln, "m", To).call(this, o, "webhook-id"), u = parseInt(a, 10);
    if (isNaN(u)) throw new Zn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - u > r) throw new Zn("Webhook timestamp is too old");
    if (u > d + r) throw new Zn("Webhook timestamp is too new");
    const h = s.split(" ").map((g) => g.startsWith("v1,") ? g.substring(3) : g), f = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), p = c ? `${c}.${a}.${e}` : `${a}.${e}`, m = await crypto.subtle.importKey("raw", f, {
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
ln = /* @__PURE__ */ new WeakSet(), pm = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, To = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const r = t.get(n);
  if (r == null) throw new Error(`Missing required header: ${n}`);
  return r;
};
var Mi, Ra, Eo, gm, oI = "workload-identity-auth", K = class {
  constructor({ baseURL: e = Ct("OPENAI_BASE_URL"), apiKey: t = Ct("OPENAI_API_KEY") ?? null, adminAPIKey: n = Ct("OPENAI_ADMIN_KEY") ?? null, organization: r = Ct("OPENAI_ORG_ID") ?? null, project: o = Ct("OPENAI_PROJECT_ID") ?? null, webhookSecret: s = Ct("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: a, ...c } = {}) {
    Mi.add(this), Eo.set(this, void 0), this.completions = new Op(this), this.chat = new fa(this), this.embeddings = new Jp(this), this.files = new Wp(this), this.images = new jp(this), this.audio = new Mr(this), this.moderations = new tm(this), this.models = new em(this), this.fineTuning = new In(this), this.graders = new Ia(this), this.vectorStores = new as(this), this.webhooks = new mm(this), this.beta = new Cn(this), this.batches = new Dp(this), this.uploads = new Pa(this), this.admin = new ga(this), this.responses = new ss(this), this.realtime = new os(this), this.conversations = new Aa(this), this.evals = new Ta(this), this.containers = new va(this), this.skills = new is(this), this.videos = new hm(this);
    const u = {
      apiKey: t,
      adminAPIKey: n,
      organization: r,
      project: o,
      webhookSecret: s,
      workloadIdentity: a,
      ...c,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (t && a) throw new G("The `apiKey` and `workloadIdentity` options are mutually exclusive");
    if (!t && !n && !a) throw new G("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, `adminAPIKey`, or set the `OPENAI_API_KEY` or `OPENAI_ADMIN_KEY` environment variable.");
    if (!u.dangerouslyAllowBrowser && nC()) throw new G(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = u.baseURL, this.timeout = u.timeout ?? Ra.DEFAULT_TIMEOUT, this.logger = u.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = $c(u.logLevel, "ClientOptions.logLevel", this) ?? $c(Ct("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = u.fetchOptions, this.maxRetries = u.maxRetries ?? 2, this.fetch = u.fetch ?? Dh(), O(this, Eo, aC, "f");
    const h = Ct("OPENAI_CUSTOM_HEADERS");
    if (h) {
      const f = {};
      for (const p of h.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (f[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      u.defaultHeaders = U([f, u.defaultHeaders]);
    }
    this._options = u, a && (this._workloadIdentityAuth = new CC(a, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = r, this.project = o, this.webhookSecret = s;
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
    return hC(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${sn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Th()}`;
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
    const r = !E(this, Mi, "m", gm).call(this) && n || this.baseURL, o = Zw(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), s = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!wc(s) || !wc(a)) && (t = {
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
    return new Jh(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const r = await e, o = r.maxRetries ?? this.maxRetries;
    t == null && (t = o), await this.prepareOptions(r);
    const { req: s, url: a, timeout: c } = await this.buildRequest(r, { retryCount: o - t });
    await this.prepareRequest(s, {
      url: a,
      options: r
    });
    const u = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (fe(this).debug(`[${u}] sending request`, Ft({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: s.headers
    })), r.signal?.aborted) throw new Ke();
    const f = r.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(a, s, c, p, f).catch(gi), g = Date.now();
    if (m instanceof globalThis.Error) {
      const v = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new Ke();
      const w = mi(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return fe(this).info(`[${u}] connection ${w ? "timed out" : "failed"} - ${v}`), fe(this).debug(`[${u}] connection ${w ? "timed out" : "failed"} (${v})`, Ft({
          retryOfRequestLogID: n,
          url: a,
          durationMs: g - h,
          message: m.message
        })), this.retryRequest(r, t, n ?? u);
      throw fe(this).info(`[${u}] connection ${w ? "timed out" : "failed"} - error; no more retries left`), fe(this).debug(`[${u}] connection ${w ? "timed out" : "failed"} (error; no more retries left)`, Ft({
        retryOfRequestLogID: n,
        url: a,
        durationMs: g - h,
        message: m.message
      })), m instanceof kh || m instanceof Xw ? m : w ? new oa() : new Xo({
        message: sI(m),
        cause: m
      });
    }
    const _ = `[${u}${d}${[...m.headers.entries()].filter(([v]) => v === "x-request-id").map(([v, w]) => ", " + v + ": " + JSON.stringify(w)).join("")}] ${s.method} ${a} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - h}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && f.bearerAuth && !r.__metadata?.hasStreamingBody && !r.__metadata?.workloadIdentityTokenRefreshed)
        return await Pc(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...r,
          __metadata: {
            ...r.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? u);
      const v = await this.shouldRetry(m);
      if (t && v) {
        const x = `retrying, ${t} attempts remaining`;
        return await Pc(m.body), fe(this).info(`${_} - ${x}`), fe(this).debug(`[${u}] response error (${x})`, Ft({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - h
        })), this.retryRequest(r, t, n ?? u, m.headers);
      }
      const w = v ? "error; no more retries left" : "error; not retryable";
      fe(this).info(`${_} - ${w}`);
      const I = await m.text().catch((x) => gi(x).message), P = tC(I), M = P ? void 0 : I;
      throw fe(this).debug(`[${u}] response error (${w})`, Ft({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: M,
        durationMs: Date.now() - h
      })), this.makeStatusError(m.status, P, M, m.headers);
    }
    return fe(this).info(_), fe(this).debug(`[${u}] response start`, Ft({
      retryOfRequestLogID: n,
      url: m.url,
      status: m.status,
      headers: m.headers,
      durationMs: g - h
    })), {
      response: m,
      options: r,
      controller: p,
      requestLogID: u,
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
    return new TC(this, n, e);
  }
  async fetchWithAuth(e, t, n, r, o = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && o.bearerAuth) {
      const s = t.headers, a = s.get("Authorization");
      if (!a || a === `Bearer ${oI}`) {
        const c = await this._workloadIdentityAuth.getToken();
        s.set("Authorization", `Bearer ${c}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, r);
  }
  async fetchWithTimeout(e, t, n, r) {
    const { signal: o, method: s, ...a } = t || {}, c = this._makeAbort(r);
    o && o.addEventListener("abort", c, { once: !0 });
    const u = setTimeout(c, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, h = {
      signal: r.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...a
    };
    s && (h.method = s.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, h);
    } finally {
      clearTimeout(u);
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
      const c = parseFloat(s);
      Number.isNaN(c) || (o = c);
    }
    const a = r?.get("retry-after");
    if (a && !o) {
      const c = parseFloat(a);
      Number.isNaN(c) ? o = Date.parse(a) - Date.now() : o = c * 1e3;
    }
    if (o === void 0) {
      const c = e.maxRetries ?? this.maxRetries;
      o = this.calculateDefaultRetryTimeoutMillis(t, c);
    }
    return await Rr(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: s, defaultBaseURL: a } = n, c = this.buildURL(o, s, a);
    "timeout" in n && eC("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: u, body: d, isStreamingBody: h } = this.buildBody({ options: n });
    return h && (e.__metadata = {
      ...e.__metadata,
      hasStreamingBody: !0
    }), {
      req: {
        method: r,
        headers: await this.buildHeaders({
          options: e,
          method: r,
          bodyHeaders: u,
          retryCount: t
        }),
        ...n.signal && { signal: n.signal },
        ...globalThis.ReadableStream && d instanceof globalThis.ReadableStream && { duplex: "half" },
        ...d && { body: d },
        ...this.fetchOptions ?? {},
        ...n.fetchOptions ?? {}
      },
      url: c,
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
        ...iC(),
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
      body: Lh(e),
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
Ra = K, Eo = /* @__PURE__ */ new WeakMap(), Mi = /* @__PURE__ */ new WeakSet(), gm = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
K.OpenAI = Ra;
K.DEFAULT_TIMEOUT = 6e5;
K.OpenAIError = G;
K.APIError = ge;
K.APIConnectionError = Xo;
K.APIConnectionTimeoutError = oa;
K.APIUserAbortError = Ke;
K.NotFoundError = Ih;
K.ConflictError = bh;
K.RateLimitError = Rh;
K.BadRequestError = Eh;
K.AuthenticationError = wh;
K.InternalServerError = xh;
K.PermissionDeniedError = Ch;
K.UnprocessableEntityError = Ph;
K.InvalidWebhookSignatureError = Zn;
K.toFile = xC;
K.Completions = Op;
K.Chat = fa;
K.Embeddings = Jp;
K.Files = Wp;
K.Images = jp;
K.Audio = Mr;
K.Moderations = tm;
K.Models = em;
K.FineTuning = In;
K.Graders = Ia;
K.VectorStores = as;
K.Webhooks = mm;
K.Beta = Cn;
K.Batches = Dp;
K.Uploads = Pa;
K.Admin = ga;
K.Responses = ss;
K.Realtime = os;
K.Conversations = Aa;
K.Evals = Ta;
K.Containers = va;
K.Skills = is;
K.Videos = hm;
function sI(e) {
  if (iI(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function iI(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const r = t;
    if (r.code === "UND_ERR_INVALID_ARG" && typeof r.message == "string" && r.message.includes("invalid onRequestStart method")) return !0;
    t = r.cause;
  }
  return !1;
}
function Zc(e = "", t = 0) {
  let n = 0;
  for (let r = t - 1; r >= 0 && e[r] === "\\"; r -= 1) n += 1;
  return n % 2 === 1;
}
function aI(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function lI(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function uI(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function cI(e = "") {
  const t = String(e ?? "");
  let n = "", r = 0;
  for (; r < t.length; ) {
    const o = t.slice(r, r + 2), s = t.slice(r + 2, r + 6);
    if (o !== "\\u" || Zc(t, r) || !aI(s)) {
      n += t[r] || "", r += 1;
      continue;
    }
    const a = r + 6, c = t.slice(a + 2, a + 6);
    if (lI(s) && t.slice(a, a + 2) === "\\u" && !Zc(t, a) && uI(c)) {
      const u = Number.parseInt(s, 16), d = Number.parseInt(c, 16), h = 65536 + (u - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(h), r += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(s, 16)), r += 6;
  }
  return n;
}
function dI(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), cI(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function fI(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function xa(e = "", t = "", n = 0) {
  const r = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${fI(t)}(?:\\\\?")?\\s*:`, "i"), o = String(e || "").slice(Math.max(0, n)).match(r);
  if (!o || o.index === void 0) return null;
  const s = o[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + o.index + s,
    end: Math.max(0, n) + o.index + o[0].length
  };
}
function hI(e = "", t = [], n = 0) {
  return t.map((r) => xa(e, r, n)).filter(Boolean).sort((r, o) => r.index - o.index)[0] || null;
}
function je(e = "", t = "", n = []) {
  const r = String(e || ""), o = xa(r, t);
  if (!o) return;
  let s = o.end;
  for (; /\s/.test(r[s] || ""); ) s += 1;
  r[s] === '"' && (s += 1);
  const a = hI(r, n.filter((d) => d !== t), s);
  let c = a ? a.index : r.length;
  if (a) {
    const d = r.lastIndexOf(",", a.index);
    d >= s && (c = d);
  }
  let u = r.slice(s, c).trim();
  return a || (u = u.replace(/\}\s*$/, "").trimEnd()), dI(u);
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
}, pI = [
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
function jc(e = "", t = [], n = []) {
  for (const r of t) {
    const o = je(e, r, n);
    if (o !== void 0) return o;
  }
}
function mI(e = "", t = "") {
  if (t === "Read") {
    const n = lr.Read, r = {};
    return n.forEach((o, s) => {
      const a = je(e, o, n.slice(s + 1));
      a !== void 0 && (r[o] = pt(a));
    }), r.filePath === void 0 && r.path !== void 0 && (r.filePath = r.path, delete r.path), r.filePath === void 0 && r.scope !== void 0 && (r.filePath = r.scope, delete r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "Write") {
    const n = {}, r = jc(e, ["filePath", "path"], ["content"]), o = je(e, "content", []);
    return r !== void 0 && (n.filePath = pt(r)), o !== void 0 && (n.content = pt(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, r = jc(e, ["filePath", "path"], ["edits"]), o = je(e, "edits", []);
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
function gI(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const a = JSON.parse(n);
    if (a && typeof a == "object" && !Array.isArray(a)) return a;
  } catch {
  }
  const r = mI(n, t);
  if (r) return r;
  const o = lr[t] || pI, s = {};
  return o.forEach((a, c) => {
    const u = je(n, a, o.slice(c + 1));
    u !== void 0 && (s[a] = pt(u));
  }), Object.keys(s).length ? s : null;
}
function yI(e = "", t = "") {
  const n = gI(e, t);
  return n ? JSON.stringify(n) : "";
}
function ym(e) {
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
function _m(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function vm(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : _m(e);
  return yI(n, t) || JSON.stringify(ym(n));
}
function _I(e = "") {
  const t = String(e || ""), n = xa(t, "arguments");
  if (!n) return "";
  let r = n.end;
  for (; /\s/.test(t[r] || ""); ) r += 1;
  const o = t[r] || "";
  return o === "{" ? t.slice(r).replace(/\}\s*$/, "").trimEnd() : o === '"' ? t.slice(r + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(r).replace(/\}\s*$/, "").trimEnd();
}
function vI(e = "", t = 0) {
  const n = String(e || "").trim(), r = je(n, "name", ["id", "arguments"]) || je(n, "toolName", ["id", "arguments"]) || "", o = je(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, s = _I(n);
  return !r || !s ? null : {
    id: o,
    name: r,
    arguments: vm(s, r)
  };
}
function AI(e, t = 0, n = "openai-tool") {
  if (!ye(e)) return null;
  const r = ye(e.function) ? e.function : null, o = String(r?.name || "").trim();
  if (!o) return null;
  const s = be(e) || {};
  return delete s.index, s.id = String(s.id || `${n}-${t + 1}`), s.type = "function", s.function = {
    ...be(r) || {},
    name: o,
    arguments: _m(r.arguments)
  }, s;
}
function Kt(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, r) => AI(n, r, t)).filter(Boolean);
}
function Ma(e) {
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
function Am(e) {
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
function Ni(e = "") {
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
          arguments: vm(a.arguments, a.name)
        });
      } catch {
        const a = vI(o[1], s);
        a && n.push(a);
      }
    });
  }), n.filter((r) => r.name);
}
function ls(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : Ma(t);
}
function SI(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function TI(e) {
  if (Kt(e?.tool_calls).length > 0) return !0;
  const t = ls(e);
  return Array.isArray(t?.tool_calls) && t.tool_calls.length > 0;
}
function EI(e = {}) {
  const t = Kt(e?.tool_calls);
  if (t.length) return t;
  const n = Kt(ls(e)?.tool_calls);
  return n.length ? n : [];
}
function wI(e = {}) {
  return Kt(e?.tool_calls).length > 0;
}
function CI(e, t, n) {
  return e?.role !== "assistant" || t <= n ? !1 : TI(e);
}
function II(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function bI(e = "") {
  return /claude/i.test(String(e || ""));
}
function Sm(e = [], t = "") {
  if (!bI(t)) return e;
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
function ed(e, t = "") {
  return !ye(e) || !II(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var td = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function PI(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((r) => be(r) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((r, o) => {
    const s = be(r) || {}, a = Number.isInteger(Number(r?.index)) ? Number(r.index) : o, c = n[a];
    n[a] = ye(c) ? Wt(c, s, "tool_call") : s;
  }), n.filter((r) => r !== void 0);
}
function Wt(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return be(t);
  if (t === null && td.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return PI(e, t);
  if (typeof e == "string" && typeof t == "string")
    return td.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : be(t);
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
  }), n.role || (n.role = "assistant"), Ma(n) || { role: "assistant" };
}
function gr(e, t = {}) {
  const n = Ma(qo(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function RI(e = {}, t = {}) {
  return ye(e) ? ye(t) ? Wt(be(e) || {}, t, "") : be(e) : be(t);
}
function ki(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], r = SI(n), o = n.map((a, c) => {
    const u = Kt(a?.tool_calls);
    if (CI(a, c, r)) {
      const h = ls(a);
      if (wI(h)) return ed({
        ...h,
        ...u.length ? { tool_calls: u } : {}
      }, t);
    }
    const d = {
      role: a.role,
      content: a.content
    };
    return a.role === "tool" && a.tool_call_id && (d.tool_call_id = a.tool_call_id), a.role === "assistant" && u.length && (d.tool_calls = u), ed(d, t);
  }), s = String(e.systemPrompt || "").trim();
  return s && o[0]?.role !== "system" && o.unshift({
    role: "system",
    content: s
  }), Sm(o, t);
}
function nd(e) {
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
function Di(e, t = "") {
  const n = /* @__PURE__ */ new Map(), r = [];
  return (Array.isArray(e.messages) ? e.messages : []).forEach((o) => {
    if (o.role === "assistant") {
      const s = EI(o);
      if (s.length) {
        const a = ls(o), c = typeof a?.content == "string" ? a.content : String(o.content || ""), u = s.map((d, h) => {
          const f = d.function?.name || "", p = d.id || `tool-call-${h + 1}`;
          return f && n.set(p, f), `<tool_call>${JSON.stringify({
            id: p,
            name: f,
            arguments: ym(d.function?.arguments || "{}")
          })}</tool_call>`;
        }).join(`
`);
        r.push({
          role: "assistant",
          content: [c, u].filter(Boolean).join(`

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
    content: nd(e)
  }) : r[0] = {
    ...r[0],
    content: nd({
      ...e,
      systemPrompt: r[0].content || e.systemPrompt
    })
  }, Sm(r, t);
}
function rd(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function od(e, t, n) {
  !e || !t || n === void 0 || (e[t] = Wt(e[t], n, t));
}
function xI(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const r = Number(n?.index ?? 0), o = { ...e.tool_calls[r] || {} };
    Object.entries(n || {}).forEach(([s, a]) => {
      if (s !== "index" && !(s === "function" && a == null)) {
        if (s === "function" && ye(a)) {
          o.function = ye(o.function) ? { ...o.function } : {}, Object.entries(a).forEach(([c, u]) => {
            o.function[c] = Wt(o.function[c], u, c);
          });
          return;
        }
        o[s] = Wt(o[s], a, s);
      }
    }), e.tool_calls[r] = o;
  }));
}
function $i(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([r, o]) => {
    r === "delta" || r === "finish_reason" || r === "index" || r === "logprobs" || od(e, r, o);
  });
  const n = ye(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([r, o]) => {
    if (r === "tool_calls") {
      xI(e, o);
      return;
    }
    od(e, r, o);
  });
}
function Li(e, t = {}) {
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
async function MI(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("openai_compatible_stream_missing_body");
  const r = new TextDecoder();
  let o = "";
  const s = /\r?\n\r?\n/;
  for (; ; ) {
    const { done: c, value: u } = await n.read();
    if (c) break;
    for (o += r.decode(u, { stream: !0 }); ; ) {
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
    const c = a.split(/\r?\n/).filter((u) => u.startsWith("data:")).map((u) => u.slice(5).trimStart()).join(`
`).trim();
    c && c !== "[DONE]" && t(JSON.parse(c));
  }
}
var NI = class {
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
      messages: t ? Di(e, this.config.model) : ki(e, this.config.model),
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
    let a = "stop", c = this.config.model;
    await MI(r, (g) => {
      c = g?.model || c;
      const _ = g?.choices?.[0], v = _?.delta || {};
      $i(s, _), _?.finish_reason && (a = _.finish_reason), typeof v.content == "string" && (o.content += v.content), Array.isArray(v.tool_calls) && v.tool_calls.forEach((M) => {
        Li(o, M);
      });
      const w = Gt(o.content), I = o.toolCalls.filter((M) => M?.function?.name), P = I.length ? bt(o.toolCalls) : Ni(w.cleaned);
      rd(e, {
        text: I.length ? w.cleaned : Ot(w.cleaned),
        thoughts: Pt(s, _).concat(w.thoughts),
        ...P.length ? { toolCalls: P } : {},
        ...!I.length && P.length ? { toolCallDraft: !0 } : {}
      });
    });
    const u = gr(s), d = bt(o.toolCalls), h = Gt(o.content), f = Pt(s, {});
    h.thoughts.forEach((g) => f.push(g));
    const p = d.length ? [] : mr(h.cleaned), m = [...d, ...p];
    return {
      text: d.length ? h.cleaned : Ot(h.cleaned),
      toolCalls: m,
      thoughts: f,
      finishReason: a,
      model: c,
      provider: "openai-compatible",
      providerPayload: u
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
        $i(w, ee), ee?.finish_reason && (I = ee.finish_reason), typeof Q.content == "string" && (v.content += Q.content), Array.isArray(Q.tool_calls) && Q.tool_calls.forEach((Te) => {
          Li(v, Te);
        });
        const X = Gt(v.content), me = v.toolCalls.filter((Te) => Te?.function?.name), Ge = me.length ? bt(v.toolCalls) : Ni(X.cleaned);
        rd(e, {
          text: me.length ? X.cleaned : Ot(X.cleaned),
          thoughts: Pt(w, ee).concat(X.thoughts),
          ...Ge.length ? { toolCalls: Ge } : {},
          ...!me.length && Ge.length ? { toolCallDraft: !0 } : {}
        });
      }
      const x = (typeof _.finalChatCompletion == "function" ? await _.finalChatCompletion() : null)?.choices?.[0] || null, C = RI(w, qo(x?.message || w, x || {}));
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
    const s = await this.client.chat.completions.create(r, { signal: e.signal }), a = s.choices?.[0] || {}, c = a.message || {}, u = Pt(c, a), d = bt(c.tool_calls || []), h = Gt(Am(c.content));
    h.thoughts.forEach((_) => u.push(_));
    const f = d.length ? [] : mr(h.cleaned), p = [...d, ...f], m = d.length ? h.cleaned : Ot(h.cleaned), g = qo(c, a);
    return {
      text: m,
      toolCalls: p,
      thoughts: u,
      finishReason: a.finish_reason || "stop",
      model: s.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: gr(g),
      requestInspection: o
    };
  }
};
function Tm(e, t) {
  return {
    type: "message",
    role: e,
    content: kI(t)
  };
}
function Bo(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function kI(e) {
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
function sd(e, t = [], n = {}) {
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
function DI(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (sd(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), sd(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function $I(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function LI(e) {
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
function UI(e) {
  const t = e?.choices?.[0], n = t?.message?.content, r = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const o = n.toLowerCase();
  return !o.includes("proxy error") || !o.includes("/responses") && !r.toLowerCase().includes("proxy error") ? null : n.trim();
}
function FI(e) {
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
      t.push(n.role === "user" ? Tm(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function qI(e) {
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
    t.push(n.role === "user" ? Tm(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function BI(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function GI(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function OI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function Fs(e, t) {
  const [n = "0", r = "0"] = String(e || "").split(":"), [o = "0", s = "0"] = String(t || "").split(":");
  return Number(n) - Number(o) || Number(r) - Number(s);
}
var HI = class {
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
      instructions: t ? void 0 : $I(e) || void 0,
      input: t ? qI(e) : FI(e),
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
    const n = (u) => {
      const d = UI(u);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const h = Array.isArray(u.output) ? u.output : [];
      return {
        output: h,
        thoughts: DI(h),
        toolCalls: h.filter((f) => f.type === "function_call" && f.name).map((f, p) => ({
          id: f.call_id || `response-tool-${p + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: LI(u)
      };
    }, r = async (u = !1) => {
      const d = this.buildRequestBody(e, u);
      return t = this.inspectRequest(e, {
        body: d,
        legacySystemInInput: u
      }), await this.client.responses.create(d, { signal: e.signal });
    }, o = async (u = !1) => {
      const d = this.buildRequestBody(e, u);
      t = this.inspectRequest(e, {
        body: d,
        legacySystemInInput: u
      });
      const h = this.client.responses.stream(d, { signal: e.signal }), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), g = () => {
        const _ = [];
        Array.from(p.entries()).sort(([v], [w]) => Fs(v, w)).forEach(([, v]) => Go(_, "推理文本", v)), Array.from(m.entries()).sort(([v], [w]) => Fs(v, w)).forEach(([, v]) => Go(_, "推理摘要", v)), OI(e, {
          text: Array.from(f.entries()).sort(([v], [w]) => Fs(v, w)).map(([, v]) => v).join(`
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
    }, s = !BI(this.config.baseUrl);
    let a, c;
    try {
      a = typeof e.onStreamProgress == "function" ? await o(!1) : await r(!1), c = n(a), s && !c.text && !c.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), c = n(a));
    } catch (u) {
      if (!s || !GI(u)) throw u;
      a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), c = n(a);
    }
    return {
      text: c.text,
      toolCalls: c.toolCalls,
      thoughts: c.thoughts,
      finishReason: a.incomplete_details?.reason || a.status || "stop",
      model: a.model || this.config.model,
      provider: "openai-responses",
      requestInspection: t
    };
  }
};
async function VI(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("host_chat_completions_stream_missing_body");
  const r = new TextDecoder();
  let o = "";
  const s = /\r?\n\r?\n/, a = (u) => {
    const d = u.split(/\r?\n/).filter((h) => h.startsWith("data:")).map((h) => h.slice(5).trimStart()).join(`
`).trim();
    !d || d === "[DONE]" || t(JSON.parse(d));
  };
  for (; ; ) {
    const { done: u, value: d } = await n.read();
    if (u) break;
    for (o += r.decode(d, { stream: !0 }); ; ) {
      const h = o.match(s);
      if (!h || typeof h.index != "number") break;
      const f = o.slice(0, h.index);
      o = o.slice(h.index + h[0].length), a(f);
    }
  }
  const c = o.trim();
  c && a(c);
}
var bn = "openai", Na = "claude", ka = "makersuite", JI = "/api/backends/chat-completions/status", KI = "/api/backends/chat-completions/generate", Em = Object.freeze({
  [Na]: "https://api.anthropic.com/v1",
  [ka]: "https://generativelanguage.googleapis.com"
}), wm = null;
function WI(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function zI(e, t) {
  const n = WI(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function YI(e) {
  wm = typeof e == "function" ? e : null;
}
async function Cm() {
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(wm?.() || {}),
    Accept: "application/json"
  };
}
function XI(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : r;
  }), t;
}
async function Nr(e = {}, t = !1) {
  const n = await Cm(), r = {
    url: KI,
    method: "POST",
    headers: XI(n),
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
function QI(e = "") {
  return /^\s*<!DOCTYPE\s+html/i.test(String(e || ""));
}
function ZI(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function jI() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function _n(e = "", t = "") {
  return ZI(e) || QI(e) ? jI() : String(e || t || "").trim();
}
function Im(e = {}, t = bn) {
  const n = zI(e.baseUrl, t), r = String(e.apiKey || "").trim(), o = Em[t] || "", s = n || (r ? o : ""), a = { chat_completion_source: t || "openai" };
  return s && (a.reverse_proxy = s), r && (a.proxy_password = r), a;
}
function e0(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function t0(e = {}, t = bn) {
  return Im(e, t);
}
function Da(e = {}, t = {}, n = [], r = !1, o = bn) {
  return e0({
    ...Im(e, o),
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
function n0(e = {}, t = {}, n = [], r = !1) {
  return Da(e, t, n, r, bn);
}
function r0(e = {}, t = {}, n = [], r = !1) {
  return Da(e, t, n, r, Na);
}
function o0(e = {}, t = {}, n = [], r = !1) {
  return Da(e, t, n, r, ka);
}
async function s0(e = {}, t = bn, n = {}) {
  const r = await fetch(JI, {
    method: "POST",
    headers: await Cm(),
    body: JSON.stringify(t0(e, t)),
    signal: n.signal
  }), o = await r.text();
  let s = null;
  try {
    s = o ? JSON.parse(o) : {};
  } catch (c) {
    throw new Error(`酒馆后端模型列表拉取失败：${_n(o, String(c?.message || c))}`);
  }
  if (!r.ok || s?.error) {
    const c = _n(s?.message || s?.error?.message || o, `HTTP ${r.status}`);
    throw new Error(`酒馆后端模型列表拉取失败：${c}`);
  }
  const a = Array.isArray(s?.data) ? s.data.map((c) => String(c?.id || c?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(a)];
}
async function $a(e = {}, t = {}) {
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
    throw new Error(`酒馆后端生成失败：${_n(o, String(a?.message || a))}`);
  }
  if (!r.ok || s?.error) {
    const a = _n(s?.error?.message || s?.message || o, `HTTP ${r.status}`);
    throw new Error(`酒馆后端生成失败：${a}`);
  }
  return s;
}
async function La(e = {}, t, n = {}) {
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
    throw new Error(_n(s, `酒馆后端流式生成失败：HTTP ${o.status}`));
  }
  await VI(o, (s) => {
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
function bm(e = "") {
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
function i0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const r = bm(t.function.arguments || "{}");
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
function a0(e = []) {
  const t = Array.isArray(e) ? zt(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function l0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  return t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const o = zt(r) || {}, s = a0(o?.providerPayload?.anthropicContent), a = i0(o.tool_calls);
    delete o.providerPayload, o.role === "assistant" && s && a.length ? (delete o.tool_calls, o.content = s.filter((c) => c?.type !== "tool_use").concat(a)) : o.role === "assistant" && s && (delete o.tool_calls, o.content = s), n.push(o);
  }), n;
}
function u0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const r = bm(t.inputJson);
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
function c0(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: zt(t.input) || {}
  } : zt(t) || null).filter(Boolean);
}
function d0(e = []) {
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
function Pm(e = [], t = {}) {
  const n = u0(e), r = n.filter((o) => o.type === "tool_use" && o.name).map((o, s) => ({
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
    providerPayload: n.length ? { anthropicContent: c0(n) } : void 0
  };
}
function f0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function h0(e, t = {}) {
  const n = [];
  let r = "stop", o = t.model || "";
  const s = (c, u = {}) => {
    const d = Number.isInteger(Number(c)) ? Number(c) : n.length;
    return n[d] ? n[d] = {
      ...n[d],
      ...u
    } : n[d] = { ...u }, n[d];
  }, a = () => {
    const c = d0(n);
    f0(e, {
      text: c.text,
      thoughts: c.thoughts,
      ...Array.isArray(c.toolCalls) ? { toolCalls: c.toolCalls } : {},
      ...c.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(c = {}) {
      if (c?.message?.model && (o = c.message.model), c.type === "content_block_start") {
        s(c.index, zt(c.content_block) || {}), a();
        return;
      }
      if (c.type === "content_block_delta") {
        const u = s(c.index), d = c.delta || {};
        d.type === "text_delta" ? (u.type = u.type || "text", u.text = `${u.text || ""}${d.text || ""}`) : d.type === "input_json_delta" ? (u.type = u.type || "tool_use", u.inputJson = `${u.inputJson || ""}${d.partial_json || ""}`) : d.type === "thinking_delta" ? (u.type = u.type || "thinking", u.thinking = `${u.thinking || ""}${d.thinking || ""}`) : d.type === "signature_delta" && (u.signature = `${u.signature || ""}${d.signature || ""}`), a();
        return;
      }
      c.type === "message_delta" && (r = c.delta?.stop_reason || r);
    },
    result() {
      return Pm(n, {
        finishReason: r,
        model: o
      });
    }
  };
}
var p0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return l0(e);
  }
  buildPayload(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildMessages(e);
    return r0(this.config, e, n, t);
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
        const a = h0(e, this.config);
        return await La(n, (c) => {
          a.accept(c);
        }, {
          signal: e.signal,
          onRequest: o
        }), {
          ...a.result(),
          requestInspection: r
        };
      }
      const s = await $a(n, {
        signal: e.signal,
        onRequest: o
      });
      return {
        ...Pm(Array.isArray(s?.content) ? s.content : [{
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
function Ua(e) {
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
  const t = Ua(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function m0(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((o) => vn(o)).filter((o) => Array.isArray(o.parts) && o.parts.length);
  const n = e?.providerPayload?.googleContent, r = vn(n);
  return r.parts.length ? [r] : [];
}
function g0(e = {}) {
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
function y0(e = {}, t = 0) {
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
    const c = g0(a.inlineData);
    c && r.content.push(c);
  }), s.length && r.content.push({
    type: "tool_calls",
    tool_calls: s
  }), o && r.content.some((a) => a?.type === "text") && (r.signature = o), r.content.length ? r : null;
}
function _0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  return t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const o = m0(r);
    if (r.role === "assistant" && o.length) {
      o.forEach((a, c) => {
        const u = y0(a, c);
        u && n.push(u);
      });
      return;
    }
    const s = Ua(r) || {};
    delete s.providerPayload, n.push(s);
  }), n;
}
function Rm(e = {}) {
  return vn(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function xm(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function Mm(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function Nm(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function v0(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
function A0(e = [], t = []) {
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
function km(e) {
  const t = vn(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function S0(e = {}, t = {}) {
  const n = Rm(e), r = e?.choices?.[0]?.message?.content || "";
  return {
    text: xm(n) || r,
    toolCalls: Nm(n),
    thoughts: Mm(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: km(n)
  };
}
function T0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function E0(e, t = {}) {
  let n = "", r = [], o = [], s = "STOP", a = t.model || "";
  const c = [];
  return {
    accept(u = {}) {
      a = u.model || u.modelVersion || a, s = u?.candidates?.[0]?.finishReason || s;
      const d = Rm(u);
      d.parts.length && c.push(...Ua(d.parts) || []), n = v0(n, xm(d)), r = A0(r, Nm(d));
      const h = Mm(d);
      h.length && (o = h), T0(e, {
        text: n,
        thoughts: o,
        ...r.length ? {
          toolCalls: r,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const u = vn({
        role: "model",
        parts: c.length ? c : n ? [{ text: n }] : []
      });
      return {
        text: n,
        toolCalls: r,
        thoughts: o,
        finishReason: s,
        model: a,
        provider: "sillytavern-google",
        providerPayload: km(u)
      };
    }
  };
}
var w0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return _0(e);
  }
  buildPayload(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildMessages(e);
    return o0(this.config, e, n, t);
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
        const s = E0(e, this.config);
        return await La(n, (a) => {
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
        ...S0(await $a(n, {
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
function C0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function qs(e, t = []) {
  const n = Gt(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : Ot(n.cleaned)
  };
}
function I0(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var b0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? Di(e, this.config.model) : ki(e, this.config.model);
  }
  buildPayload(e, t = !1) {
    const n = t ? Di(e, this.config.model) : ki(e, this.config.model);
    return n0(this.config, t ? {
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
    await La(t, (p) => {
      a = p?.model || a;
      const m = p?.choices?.[0] || {}, g = m.delta || {};
      $i(o, m), m.finish_reason && (s = m.finish_reason), typeof g.content == "string" && (r.content += g.content), Array.isArray(g.tool_calls) && g.tool_calls.forEach((P) => {
        Li(r, P);
      });
      const _ = r.toolCalls.filter((P) => P?.function?.name), { thinkTagged: v, cleanedText: w } = qs(r.content, _), I = _.length ? bt(r.toolCalls, "st-openai-tool") : Ni(v.cleaned);
      C0(e, {
        text: w,
        thoughts: Pt(o, m).concat(v.thoughts),
        ...I.length ? { toolCalls: I } : {},
        ...!_.length && I.length ? { toolCallDraft: !0 } : {}
      });
    }, {
      signal: e.signal,
      onRequest: n.onRequest
    });
    const c = bt(r.toolCalls, "st-openai-tool"), { thinkTagged: u, cleanedText: d } = qs(r.content, c), h = Pt(o, {});
    u.thoughts.forEach((p) => h.push(p));
    const f = c.length ? [] : mr(u.cleaned);
    return {
      text: d,
      toolCalls: [...c, ...f],
      thoughts: h,
      finishReason: s,
      model: a,
      provider: "sillytavern-openai-compatible",
      providerPayload: gr(o)
    };
  }
  async nonStreamingChat(e, t, n = {}) {
    const r = await $a(t, {
      signal: e.signal,
      onRequest: n.onRequest
    }), o = r.choices?.[0] || {}, s = o.message || {}, a = Pt(s, o), c = bt(s.tool_calls || [], "st-openai-tool"), { thinkTagged: u, cleanedText: d } = qs(Am(s.content), c);
    u.thoughts.forEach((p) => a.push(p));
    const h = c.length ? [] : mr(u.cleaned), f = qo(s, o);
    return {
      text: d,
      toolCalls: [...c, ...h],
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
      const c = (u) => {
        a = this.buildRequestInspection(u);
      };
      try {
        return {
          ...typeof e.onStreamProgress == "function" ? await this.streamChat(e, s, { onRequest: c }) : await this.nonStreamingChat(e, s, { onRequest: c }),
          requestInspection: a
        };
      } catch (u) {
        throw a && u && typeof u == "object" && (u.requestInspection = a), u;
      }
    }, o = this.buildPayload(e, t);
    try {
      return await r(o);
    } catch (s) {
      if (t || !n || !I0(s)) throw s;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await r(this.buildPayload(e, !0));
  }
}, id = 900 * 1e3, ad = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), Ui = Object.freeze([
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
]), P0 = Object.freeze([
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
function ld(e = "") {
  return e === "anthropic" || e === "sillytavern-claude";
}
function R0(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function $e(e = "") {
  return Ui.some((t) => t.value === e) ? e : "medium";
}
function Le(e, t = 0.2) {
  const n = typeof e == "string" && !e.trim() ? t : e, r = Number(n);
  return Number.isFinite(r) ? Math.max(0, Math.min(2, r)) : Le(t, 0.2);
}
function gn(e = {}) {
  return e.sendTemperature !== !1;
}
function ud(e = {}) {
  return gn(e) ? Le(e.temperature, 0.2) : void 0;
}
function cd(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : P0.find((n) => n.value === e)?.label || e || "未配置";
}
function x0(e = {}, t = {}) {
  const n = lo(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const u = n.delegateConfig.provider || "openai-compatible", d = (n.delegateConfig.modelConfigs || un())[u] || un()[u] || {};
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: u,
      baseUrl: String(d.baseUrl || ""),
      model: String(d.model || ""),
      apiKey: String(d.apiKey || ""),
      tavilyApiKey: Bs(n.tavilyApiKey),
      tavilyBaseUrl: Je(n.tavilyBaseUrl),
      temperature: ud(d),
      sendTemperature: gn(d),
      maxTokens: ld(u) ? 32e3 : null,
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: d.toolMode || "native",
      reasoningEnabled: !!d.reasoningEnabled,
      reasoningEffort: $e(d.reasoningEffort)
    };
  }
  const r = re(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), o = n.presets?.[r] ? r : n.presets?.[n.currentPresetName] ? n.currentPresetName : qi, s = n.presets?.[o] || we(), a = s.provider || n.provider || "openai-compatible", c = (s.modelConfigs || n.modelConfigs || un())[a] || un()[a] || {};
  return {
    currentPresetName: String(o || ""),
    provider: a,
    baseUrl: String(c.baseUrl || ""),
    model: String(c.model || ""),
    apiKey: String(c.apiKey || ""),
    tavilyApiKey: Bs(n.tavilyApiKey),
    tavilyBaseUrl: Je(n.tavilyBaseUrl),
    temperature: ud(c),
    sendTemperature: gn(c),
    maxTokens: ld(a) ? 32e3 : null,
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: c.toolMode || "native",
    reasoningEnabled: !!c.reasoningEnabled,
    reasoningEffort: $e(c.reasoningEffort)
  };
}
function M0(e = {}, t = {}) {
  if (!e.apiKey && !R0(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (e.provider) {
    case "sillytavern-openai-compatible":
      return new b0(e);
    case "sillytavern-claude":
      return new p0(e);
    case "sillytavern-google":
      return new w0(e);
    case "openai-responses":
      return new HI(e);
    case "anthropic":
      return new ey(e);
    case "google":
      return new Yw(e);
    default:
      return new NI(e);
  }
}
var N0 = { chat: { exclude: [
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
] } }, k0 = Object.freeze([
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
  const t = [...new Set(e.filter(Boolean).map((o) => String(o).trim()).filter(Boolean))], n = N0.chat, r = t.filter((o) => {
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
function D0(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function nn(e = "") {
  return e === "openai-compatible" || e === "sillytavern-openai-compatible";
}
function Fi(e = "") {
  return e === "anthropic" || e === "sillytavern-claude";
}
function $0(e = "") {
  return e === "sillytavern-claude" ? Na : e === "sillytavern-google" ? ka : bn;
}
function Tr(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function L0(e) {
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
function Dm(e) {
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
function U0(e, t) {
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
async function q0(e, t = {}) {
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
function B0(e) {
  return Sr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function $m(e) {
  return Sr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function G0(e) {
  return Sr((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function wo({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: r }) {
  let o = null;
  for (const s of e) for (const a of t) {
    const c = await q0(s, a);
    if (!c.ok) {
      o = c;
      continue;
    }
    if (c.parseError) {
      o = {
        ...c,
        errorSnippet: "返回的不是 JSON"
      };
      continue;
    }
    const u = n(c.data);
    if (u.length) return u;
    o = {
      ...c,
      errorSnippet: "返回成功，但模型列表为空"
    };
  }
  if (o) {
    const s = o.url ? ` (${o.url})` : "", a = o.errorSnippet ? `：${o.errorSnippet}` : "";
    throw new Error(`${r} 拉取模型失败：${o.status || "unknown"}${a}${s}`);
  }
  throw new Error(`${r} 拉取模型失败：未获取到模型列表。`);
}
async function O0(e) {
  const t = String(e.apiKey || "").trim(), n = An(e.baseUrl || ""), r = An(n || Em.claude);
  if (t && r) try {
    return await wo({
      urls: Dm(r),
      requestOptionsList: [{ headers: {
        "x-api-key": t,
        "anthropic-version": "2023-06-01",
        Accept: "application/json"
      } }],
      extractModels: $m,
      providerLabel: "Anthropic"
    });
  } catch (o) {
    if (n) throw o;
  }
  return [...k0];
}
async function dd(e) {
  const t = e.provider, n = An(e.baseUrl || ""), r = String(e.apiKey || "").trim();
  if (t === "sillytavern-claude") return Sr(await O0(e));
  if (D0(t)) return Sr(await s0(e, $0(t)));
  if (!r) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await wo({
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
    extractModels: G0,
    providerLabel: "Google AI"
  }) : Fi(t) ? await wo({
    urls: Dm(n),
    requestOptionsList: [{ headers: {
      "x-api-key": r,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: $m,
    providerLabel: "Anthropic"
  }) : await wo({
    urls: L0(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${r}`,
      Accept: "application/json"
    } }],
    extractModels: B0,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function H0(e) {
  return e instanceof Error ? e.message : String(e || "unknown_error");
}
function Y0(e = {}) {
  const { state: t, render: n, showToast: r, createRequestId: o = (y = "req") => `${y}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, saveConfig: s, describeError: a = H0, getRuntimeSummaryText: c } = e;
  function u() {
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
    const b = g(y, qi), q = S && typeof S == "object" ? S : we(), W = q.provider || "openai-compatible", Z = Ue(q.modelConfigs || {}), ue = Z[W] || {};
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
    const q = re(y || "默认"), W = S && typeof S == "object" ? S : we(), Z = W.provider || "openai-compatible", ue = Ue(W.modelConfigs || {}), lt = v(Z, ue), ut = g(b?.delegatePresetName, q), us = _(ut, b?.delegateConfig && typeof b.delegateConfig == "object" ? b.delegateConfig : (b?.presets || {})[ut] || W);
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
      ...us
    };
  }
  function P() {
    if (t.configDraft) return t.configDraft;
    const y = re(t.config?.currentPresetName || "默认");
    return t.configDraft = I(y, (t.config?.presets || {})[y] || we()), t.configDraft;
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
    return Fi(y.provider) ? 32e3 : null;
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
      timeoutMs: id,
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
      maxTokens: Fi(y.delegateProvider) ? 32e3 : null,
      timeoutMs: id,
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
    return typeof c == "function" ? c({
      state: t,
      draft: y,
      provider: S,
      pullState: q,
      providerLabel: cd(S)
    }) : `预设「${y.currentPresetName || "默认"}」 · ${cd(S)}`;
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
    const S = P(), b = S.provider || "openai-compatible", q = m(b), W = S.delegateProvider || "openai-compatible", Z = m(W, "delegate"), ue = y.querySelector("#xb-assistant-tool-mode-wrap"), lt = y.querySelector("#xb-assistant-tool-mode"), ut = y.querySelector("#xb-assistant-reasoning-enabled"), us = y.querySelector("#xb-assistant-reasoning-effort-wrap"), qa = y.querySelector("#xb-assistant-reasoning-effort"), cs = y.querySelector("#xb-assistant-permission-mode"), ds = y.querySelector("#xb-assistant-jsapi-permission"), Ba = y.querySelector("#xb-assistant-model-pulled"), fs = y.querySelector("#xb-assistant-preset-select"), Ga = y.querySelector("#xb-assistant-preset-name"), hs = y.querySelector("#xb-assistant-delegate-preset-select"), Oa = y.querySelector("#xb-assistant-delegate-provider"), Ha = y.querySelector("#xb-assistant-delegate-base-url"), Va = y.querySelector("#xb-assistant-delegate-model"), Ja = y.querySelector("#xb-assistant-delegate-api-key"), Ka = y.querySelector("#xb-assistant-tavily-api-key"), ps = y.querySelector("#xb-assistant-delegate-model-pulled"), Wa = y.querySelector("#xb-assistant-delegate-tool-mode-wrap"), ms = y.querySelector("#xb-assistant-delegate-tool-mode"), za = y.querySelector("#xb-assistant-delegate-reasoning-enabled"), Ya = y.querySelector("#xb-assistant-delegate-reasoning-effort-wrap"), gs = y.querySelector("#xb-assistant-delegate-reasoning-effort");
    if (!fs || !Ga) return;
    const Xa = (t.config.presetNames || []).map((Oe) => ({
      value: Oe,
      label: Oe
    }));
    st(fs, Xa), fs.value = S.currentPresetName || t.config.currentPresetName || "默认", hs && (st(hs, Xa), hs.value = g(S.delegatePresetName, S.currentPresetName)), Ga.value = S.presetDraftName || S.currentPresetName || "默认", y.querySelector("#xb-assistant-provider").value = b, y.querySelector("#xb-assistant-base-url").value = S.baseUrl || "", y.querySelector("#xb-assistant-model").value = S.model || "", y.querySelector("#xb-assistant-api-key").value = S.apiKey || "", y.querySelector("#xb-assistant-temperature").value = String(Le(S.temperature, 0.2)), y.querySelector("#xb-assistant-send-temperature").checked = !!(S.sendTemperature ?? !0), Ka && (Ka.value = S.tavilyApiKey || ""), ue.style.display = nn(b) ? "" : "none", st(lt, ad), lt.value = S.toolMode || "native", cs && (st(cs, Ym), cs.value = cn(S.permissionMode)), ds && (st(ds, Xm), ds.value = mt(S.jsApiPermission)), st(qa, Ui), ut.checked = !!S.reasoningEnabled, qa.value = $e(S.reasoningEffort), us.style.display = ut.checked ? "" : "none", st(Ba, q.map((Oe) => ({
      value: Oe,
      label: Oe
    })), "手动填写"), Ba.value = q.includes(S.model) ? S.model : "", Oa && (Oa.value = W), Ha && (Ha.value = S.delegateBaseUrl || ""), Va && (Va.value = S.delegateModel || ""), Ja && (Ja.value = S.delegateApiKey || "");
    const Qa = y.querySelector("#xb-assistant-delegate-temperature"), Za = y.querySelector("#xb-assistant-delegate-send-temperature");
    Qa && (Qa.value = String(Le(S.delegateTemperature, 0.2))), Za && (Za.checked = !!(S.delegateSendTemperature ?? !0)), Wa && (Wa.style.display = nn(W) ? "" : "none"), ms && (st(ms, ad), ms.value = S.delegateToolMode || "native"), gs && (st(gs, Ui), gs.value = $e(S.delegateReasoningEffort)), za && (za.checked = !!S.delegateReasoningEnabled), Ya && (Ya.style.display = S.delegateReasoningEnabled ? "" : "none"), ps && (st(ps, Z.map((Oe) => ({
      value: Oe,
      label: Oe
    })), "手动填写"), ps.value = Z.includes(S.delegateModel) ? S.delegateModel : ""), X(y, "#xb-assistant-model-pull-status", h(b)), X(y, "#xb-assistant-delegate-model-pull-status", h(W, "delegate"));
    const ja = y.querySelector("#xb-assistant-runtime");
    if (ja) {
      const Oe = t.configPage === "delegate";
      ja.textContent = Q(Oe ? {
        ...S,
        currentPresetName: "分身",
        provider: W
      } : S, Oe ? W : b, Oe ? "delegate" : "main");
    }
  }
  function Te(y) {
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
      presets: y?.presets || {}
    };
  }
  function kr(y, S = {}) {
    const b = x(y), q = re(S.presetName || b.presetDraftName), W = re(b.currentPresetName || t.config?.currentPresetName || "默认"), Z = (t.config?.presets || {})[W] || we(), ue = Ue(b.modelConfigs || Z.modelConfigs || {}), lt = {
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
      presets: ut
    }), t.configDraft = I(q, lt, t.config), u(), Te({
      requestId: o(S.requestPrefix || "save-config"),
      config: t.config,
      payload: Xt(t.config)
    });
  }
  function Fa(y, S = "") {
    const b = re(S || "默认"), q = typeof window < "u" && typeof window.prompt == "function" ? window.prompt(y, b) : b;
    return q === null ? "" : re(q);
  }
  function Lm(y) {
    const S = Fa("输入新预设名称：", `${x(y).currentPresetName || "默认"} 副本`);
    if (!S) {
      r?.("预设名称不能为空");
      return;
    }
    y.querySelector("#xb-assistant-preset-name").value = S, kr(y, {
      presetName: S,
      requestPrefix: "create-preset"
    });
  }
  function Um(y) {
    const S = x(y), b = re(S.currentPresetName || t.config?.currentPresetName || "默认"), q = Fa("输入预设名称：", S.presetDraftName || b);
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
  function Fm(y) {
    if (Object.keys(t.config?.presets || {}).length <= 1) {
      r?.("至少要保留一套预设");
      return;
    }
    const S = x(y), b = re(t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), q = { ...t.config?.presets || {} };
    delete q[b];
    const W = Object.keys(q)[0] || "默认", Z = q[W] || we();
    t.config = lo({
      ...t.config,
      jsApiPermission: mt(S.jsApiPermission),
      tavilyApiKey: String(S.tavilyApiKey || t.config?.tavilyApiKey || ""),
      tavilyBaseUrl: Je(S.tavilyBaseUrl || t.config?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: W,
      delegatePresetName: g(S.delegatePresetName, W),
      delegateConfig: D(S),
      presets: q
    }), t.configDraft = I(W, Z, t.config), u(), Te({
      requestId: o("delete-preset"),
      config: t.config,
      payload: Xt(t.config)
    }), n?.();
  }
  function qm(y) {
    y?.querySelector?.("#xb-assistant-provider") && (y.querySelector("#xb-assistant-provider").addEventListener("change", (S) => {
      const b = S.currentTarget.value, q = x(y);
      t.configDraft = {
        ...q,
        provider: b,
        ...v(b, q.modelConfigs)
      }, u(), n?.();
    }), y.querySelector("#xb-assistant-preset-select").addEventListener("change", (S) => {
      const b = re(S.currentTarget.value), q = (t.config?.presets || {})[b] || we(), W = x(y);
      t.config = lo({
        ...t.config,
        jsApiPermission: mt(W.jsApiPermission),
        currentPresetName: b,
        delegatePresetName: g(W.delegatePresetName, b),
        delegateConfig: D(W)
      }), t.configDraft = I(b, q, t.config), u(), n?.();
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
      }, u(), n?.();
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
      x(y), u(), n?.();
    }), y.querySelector("#xb-assistant-reasoning-effort").addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-tool-mode").addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-delegate-reasoning-enabled")?.addEventListener("change", () => {
      x(y), u(), n?.();
    }), y.querySelector("#xb-assistant-delegate-reasoning-effort")?.addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-delegate-tool-mode")?.addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-permission-mode")?.addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-jsapi-permission")?.addEventListener("change", () => {
      x(y);
    }), y.querySelector("#xb-assistant-delegate-preset-select")?.addEventListener("change", (S) => {
      const b = g(S.currentTarget?.value, t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), q = (t.config?.presets || {})[b] || we();
      t.configDraft = {
        ...x(y),
        ..._(b, q)
      }, u(), n?.();
    }), y.querySelectorAll("[data-config-page]").forEach((S) => {
      S.addEventListener("click", (b) => {
        x(y), t.configPage = ao(b.currentTarget?.dataset?.configPage), me(y), Ge(y);
      });
    }), y.querySelector("#xb-assistant-pull-models").addEventListener("click", async () => {
      x(y), u();
      const S = j();
      f(S.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), n?.();
      try {
        const b = await dd(S);
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
      u(), n?.();
    }), y.querySelector("#xb-assistant-delegate-pull-models")?.addEventListener("click", async () => {
      x(y), u();
      const S = j({ role: "delegate" });
      f(S.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }, "delegate"), n?.();
      try {
        const b = await dd(S);
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
      u(), n?.();
    }), y.querySelector("#xb-assistant-new-preset")?.addEventListener("click", () => {
      Lm(y);
    }), y.querySelector("#xb-assistant-rename-preset")?.addEventListener("click", () => {
      Um(y);
    }), y.querySelector("#xb-assistant-save").addEventListener("click", () => {
      kr(y);
    }), y.querySelector("#xb-assistant-delegate-save")?.addEventListener("click", () => {
      kr(y, { requestPrefix: "save-delegate-config" });
    }), y.querySelector("#xb-assistant-delete-preset").addEventListener("click", () => {
      Fm(y);
    }));
  }
  return {
    getActiveProviderConfig: j,
    syncConfigToForm: Ge,
    bindSettingsPanelEvents: qm
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
    title: Co(e?.error || "保存失败")
  } : {
    className: "xb-assistant-save-button",
    title: "保存配置"
  };
}
function X0(e = {}) {
  const { configSave: t = {}, runtimeText: n = "", inlineToastText: r = "", showInlineToast: o = !0, showAssistantPermissions: s = !0, showDelegateSettings: a = !0, activePage: c = "main", delegatePresetHint: u = "DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。", isBusy: d = !1, canDeletePreset: h = !0 } = e, f = J0(t), p = V0(t), m = d || String(t?.status || "") === "saving" ? "disabled" : "", g = d || !h ? "disabled" : "", _ = c === "delegate" ? "delegate" : "main", v = _ === "main", w = _ === "delegate", I = s ? `
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
                <p class="xb-assistant-config-note">${Co(u)}</p>
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
  YI(typeof e.requestHeadersProvider == "function" ? e.requestHeadersProvider : null);
}
async function Z0(e = {}) {
  const t = x0(eg(e.config || {})), n = M0(t, { missingApiKeyMessage: "请先在小白agent的 API配置 里填写当前预设的 API Key。" }), r = !!e.stream && typeof e.onStreamProgress == "function", o = await n.chat({
    systemPrompt: K0,
    messages: z0(e.builtPrompt || {}, { disableAssistantPrefill: !!e.disableAssistantPrefill }),
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
  X0 as buildAgentSettingsPanelMarkup,
  Q0 as configureFourthWallAgent,
  Y0 as createAgentSettingsPanel,
  Z0 as generateFourthWallResponse,
  lo as normalizeAgentConfig
};
