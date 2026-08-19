var Wm = Object.create, gd = Object.defineProperty, zm = Object.getOwnPropertyDescriptor, Ym = Object.getOwnPropertyNames, Xm = Object.getPrototypeOf, Qm = Object.prototype.hasOwnProperty, Vo = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), Zm = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var o = Ym(t), s = 0, a = o.length, u; s < a; s++)
      u = o[s], !Qm.call(e, u) && u !== n && gd(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(r = zm(t, u)) || r.enumerable
      });
  return e;
}, jm = (e, t, n) => (n = e != null ? Wm(Xm(e)) : {}, Zm(t || !e || !e.__esModule ? gd(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), eg = "https://api.tavily.com";
function Os(e = "") {
  return String(e || "").trim();
}
function Ke(e = "") {
  return String(e || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var yd = "openai-compatible", Jo = "默认", _d = "default", tg = "deny", gt = 32e3, ng = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), rg = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), Hs = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: gt,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: gt,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: gt,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: gt,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: gt,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: gt,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: gt,
    sendTemperature: !0
  }
};
function dn() {
  return JSON.parse(JSON.stringify(Hs));
}
function Te() {
  return {
    provider: yd,
    modelConfigs: dn(),
    permissionMode: _d
  };
}
function vd(e = Te()) {
  const t = e && typeof e == "object" ? e : Te();
  return {
    provider: qi(t.provider),
    modelConfigs: Fe(t.modelConfigs || {})
  };
}
function fn(e) {
  return e === "full" ? "full" : _d;
}
function yt(e) {
  return e === "allow" ? "allow" : tg;
}
function Ce(e, t = gt) {
  const n = Number(e);
  if (!Number.isFinite(n) || n <= 0) {
    const r = Number(t);
    return Number.isFinite(r) && r > 0 ? Math.floor(r) : gt;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}
function re(e) {
  return String(e || "").trim() || "默认";
}
function Fe(e = {}) {
  const t = dn();
  return Object.keys(Hs).forEach((n) => {
    const r = e && typeof e[n] == "object" ? e[n] : {};
    t[n] = {
      ...Hs[n],
      ...r,
      maxTokens: Ce(r.maxTokens)
    };
  }), t;
}
function qi(e) {
  return typeof e == "string" && e.trim() ? e : yd;
}
function Bi(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function Ad(e = {}, t) {
  const n = {}, r = Bi(e, t);
  return Object.entries(r).forEach(([o, s]) => {
    if (!s || typeof s != "object") return;
    const a = re(o);
    n[a] = {
      provider: qi(s.provider),
      modelConfigs: Fe(s.modelConfigs || {}),
      permissionMode: fn(s.permissionMode)
    };
  }), Object.keys(n).length || (n[Jo] = Te()), n;
}
function Sd(e, t) {
  const n = re(t);
  return e[n] ? n : Object.keys(e)[0];
}
function Td(e, t, n) {
  const r = re(t || n);
  return e[r] ? r : e[n] ? n : Object.keys(e)[0];
}
function Gi(e = {}, t = Te()) {
  const n = vd(t), r = e && typeof e == "object" ? e : {};
  return {
    provider: qi(r.provider || n.provider),
    modelConfigs: Fe(r.modelConfigs || n.modelConfigs)
  };
}
function Ed(e = {}, t = {}, n = Jo, r = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (r !== n) return !0;
  const o = e?.delegateConfig;
  if (!o || typeof o != "object" || Array.isArray(o) || !(typeof o.provider == "string" && o.provider.trim() || o.modelConfigs && typeof o.modelConfigs == "object" && Object.keys(o.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const s = t[n] || Te(), a = vd(s), u = Gi(o, s);
  return JSON.stringify(u) !== JSON.stringify(a);
}
function og(e = {}, t, n, r, o) {
  const s = o(e?.[r]);
  if (s) return s;
  const a = Bi(e, t), u = [
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
function sg(e = {}, t, n) {
  const r = (u) => String(u || "").trim();
  if (r(e?.tavilyBaseUrl)) return Ke(e.tavilyBaseUrl);
  const o = Bi(e, t), s = [
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
    if (r(c)) return Ke(c);
  }
  return r(e?.delegateConfig?.tavilyBaseUrl) ? Ke(e.delegateConfig.tavilyBaseUrl) : eg;
}
function wd(e = {}, t, n) {
  return {
    tavilyApiKey: og(e, t, n, "tavilyApiKey", Os),
    tavilyBaseUrl: sg(e, t, n)
  };
}
function ig(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: r = (p) => String(p || "") } = t, o = re(e.currentPresetName || e.presetName || "默认"), s = Ad(e, o), a = Sd(s, e.currentPresetName), u = Td(s, e.delegatePresetName, a), c = s[u] || s[a] || Te(), d = Gi(e.delegateConfig, c), h = Ed(e, s, a, u), f = wd(e, o, a);
  return {
    enabled: !!e.enabled,
    workspaceFileName: r(e.workspaceFileName || n),
    jsApiPermission: yt(e.jsApiPermission),
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
function uo(e = {}) {
  const t = re(e.currentPresetName || e.presetDraftName || "默认"), n = Ad(e, t), r = Sd(n, e.currentPresetName), o = Td(n, e.delegatePresetName, r), s = n[r] || Te(), a = n[o] || s, u = Gi(e.delegateConfig, a), c = Ed(e, n, r, o), d = wd(e, t, r);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    jsApiPermission: yt(e.jsApiPermission),
    currentPresetName: r,
    delegatePresetName: o,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: re(e.presetDraftName || r),
    presetNames: Object.keys(n),
    presets: n,
    provider: s.provider,
    modelConfigs: s.modelConfigs,
    permissionMode: fn(s.permissionMode),
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
var Cd = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Cd = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function vr(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Vs = (e) => {
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
}, qe = class Js extends V {
  constructor(t, n, r, o, s) {
    super(`${Js.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("request-id"), this.error = n, this.type = s ?? null;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Ko({
      message: r,
      cause: Vs(n)
    });
    const s = n, a = s?.error?.type;
    return t === 400 ? new bd(t, s, r, o, a) : t === 401 ? new Pd(t, s, r, o, a) : t === 403 ? new Rd(t, s, r, o, a) : t === 404 ? new xd(t, s, r, o, a) : t === 409 ? new Md(t, s, r, o, a) : t === 422 ? new Nd(t, s, r, o, a) : t === 429 ? new kd(t, s, r, o, a) : t >= 500 ? new Dd(t, s, r, o, a) : new Js(t, s, r, o, a);
  }
}, tt = class extends qe {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Ko = class extends qe {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Id = class extends Ko {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, bd = class extends qe {
}, Pd = class extends qe {
}, Rd = class extends qe {
}, xd = class extends qe {
}, Md = class extends qe {
}, Nd = class extends qe {
}, kd = class extends qe {
}, Dd = class extends qe {
}, ag = /^[a-z][a-z0-9+.-]*:/i, lg = (e) => ag.test(e), Ks = (e) => (Ks = Array.isArray, Ks(e)), nl = Ks;
function Ws(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function rl(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function ug(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var cg = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new V(`${e} must be an integer`);
  if (t < 0) throw new V(`${e} must be a positive integer`);
  return t;
}, $d = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, dg = (e) => new Promise((t) => setTimeout(t, e)), sn = "0.91.1", fg = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function hg() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var pg = () => {
  const e = hg();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": sn,
    "X-Stainless-OS": sl(Deno.build.os),
    "X-Stainless-Arch": ol(Deno.build.arch),
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
    "X-Stainless-OS": sl(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": ol(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = mg();
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
function mg() {
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
var ol = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", sl = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), il, gg = () => il ?? (il = pg());
function yg() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Ld(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Ud(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Ld({
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
async function _g(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var vg = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Ag(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new V(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function Sg(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var al;
function Hi(e) {
  let t;
  return (al ?? (t = new globalThis.TextEncoder(), al = t.encode.bind(t)))(e);
}
var ll;
function ul(e) {
  let t;
  return (ll ?? (t = new globalThis.TextDecoder(), ll = t.decode.bind(t)))(e);
}
var Me, Ne, Cr = class {
  constructor() {
    Me.set(this, void 0), Ne.set(this, void 0), L(this, Me, new Uint8Array(), "f"), L(this, Ne, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Hi(e) : e;
    L(this, Me, Sg([T(this, Me, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = Tg(T(this, Me, "f"), T(this, Ne, "f"))) != null; ) {
      if (r.carriage && T(this, Ne, "f") == null) {
        L(this, Ne, r.index, "f");
        continue;
      }
      if (T(this, Ne, "f") != null && (r.index !== T(this, Ne, "f") + 1 || r.carriage)) {
        n.push(ul(T(this, Me, "f").subarray(0, T(this, Ne, "f") - 1))), L(this, Me, T(this, Me, "f").subarray(T(this, Ne, "f")), "f"), L(this, Ne, null, "f");
        continue;
      }
      const o = T(this, Ne, "f") !== null ? r.preceding - 1 : r.preceding, s = ul(T(this, Me, "f").subarray(0, o));
      n.push(s), L(this, Me, T(this, Me, "f").subarray(r.index), "f"), L(this, Ne, null, "f");
    }
    return n;
  }
  flush() {
    return T(this, Me, "f").length ? this.decode(`
`) : [];
  }
};
Me = /* @__PURE__ */ new WeakMap(), Ne = /* @__PURE__ */ new WeakMap();
Cr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Cr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Tg(e, t) {
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
function Eg(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var bo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, cl = (e, t, n) => {
  if (e) {
    if (ug(bo, e)) return e;
    Ae(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(bo))}`);
  }
};
function Xn() {
}
function $r(e, t, n) {
  return !t || bo[e] > bo[n] ? Xn : t[e].bind(t);
}
var wg = {
  error: Xn,
  warn: Xn,
  info: Xn,
  debug: Xn
}, dl = /* @__PURE__ */ new WeakMap();
function Ae(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return wg;
  const r = dl.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: $r("error", t, n),
    warn: $r("warn", t, n),
    info: $r("info", t, n),
    debug: $r("debug", t, n)
  };
  return dl.set(t, [n, o]), o;
}
var qt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Mn, Ar = class Qn {
  constructor(t, n, r) {
    this.iterator = t, Mn.set(this, void 0), this.controller = n, L(this, Mn, r, "f");
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const s = r ? Ae(r) : console;
    async function* a() {
      if (o) throw new V("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of Cg(t, n)) {
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
            const d = $d(c.data) ?? c.data, h = d?.error?.type;
            throw new qe(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (vr(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Qn(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* s() {
      const u = new Cr(), c = Oi(t);
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
        if (vr(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Qn(a, n, r);
  }
  [(Mn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Qn(() => o(t), this.controller, T(this, Mn, "f")), new Qn(() => o(n), this.controller, T(this, Mn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Ld({
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
async function* Cg(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new V("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new V("Attempted to iterate over a response with no body");
  const n = new bg(), r = new Cr(), o = Oi(e.body);
  for await (const s of Ig(o)) for (const a of r.decode(s)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const s of r.flush()) {
    const a = n.decode(s);
    a && (yield a);
  }
}
async function* Ig(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Hi(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let s;
    for (; (s = Eg(t)) !== -1; )
      yield t.slice(0, s), t = t.slice(s);
  }
  t.length > 0 && (yield t);
}
var bg = class {
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
    let [t, n, r] = Pg(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function Pg(e, t) {
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
async function Fd(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: s } = t, a = await (async () => {
    if (t.options.stream)
      return Ae(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : Ar.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : qd(await n.json(), n) : await n.text();
  })();
  return Ae(e).debug(`[${r}] response parsed`, qt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - s
  })), a;
}
function qd(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var Zn, Bd = class Gd extends Promise {
  constructor(t, n, r = Fd) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, Zn.set(this, void 0), L(this, Zn, t, "f");
  }
  _thenUnwrap(t) {
    return new Gd(T(this, Zn, "f"), this.responsePromise, async (n, r) => qd(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(T(this, Zn, "f"), t))), this.parsedPromise;
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
Zn = /* @__PURE__ */ new WeakMap();
var Lr, Od = class {
  constructor(e, t, n, r) {
    Lr.set(this, void 0), L(this, Lr, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new V("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await T(this, Lr, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Lr = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Rg = class extends Bd {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await Fd(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Ir = class extends Od {
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
          ...Ws(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Ws(this.options.query),
        after_id: e
      }
    } : null;
  }
}, Re = class extends Od {
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
        ...Ws(this.options.query),
        page: e
      }
    } : null;
  }
}, Hd = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function gn(e, t, n) {
  return Hd(), new File(e, t ?? "unknown_file", n);
}
function co(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Vd = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Vi = async (e, t, n = !0) => ({
  ...e,
  body: await Mg(e.body, t, n)
}), fl = /* @__PURE__ */ new WeakMap();
function xg(e) {
  const t = typeof e == "function" ? e : e.fetch, n = fl.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, s = new FormData();
      return s.toString() !== await new o(s).text();
    } catch {
      return !0;
    }
  })();
  return fl.set(t, r), r;
}
var Mg = async (e, t, n = !0) => {
  if (!await xg(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, s]) => zs(r, o, s, n))), r;
}, Ng = (e) => e instanceof Blob && "name" in e, zs = async (e, t, n, r) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let o = {};
      const s = n.headers.get("Content-Type");
      s && (o = { type: s }), e.append(t, gn([await n.blob()], co(n, r), o));
    } else if (Vd(n)) e.append(t, gn([await new Response(Ud(n)).blob()], co(n, r)));
    else if (Ng(n)) e.append(t, gn([n], co(n, r), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => zs(e, t + "[]", o, r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, s]) => zs(e, `${t}[${o}]`, s, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Jd = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", kg = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Jd(e), Dg = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function $g(e, t, n) {
  if (Hd(), e = await e, t || (t = co(e, !0)), kg(e))
    return e instanceof File && t == null && n == null ? e : gn([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (Dg(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), gn(await Ys(o), t, n);
  }
  const r = await Ys(e);
  if (!n?.type) {
    const o = r.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return gn(r, t, n);
}
async function Ys(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Jd(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Vd(e)) for await (const n of e) t.push(...await Ys(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Lg(e)}`);
  }
  return t;
}
function Lg(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var te = class {
  constructor(e) {
    this._client = e;
  }
}, Kd = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Ug(e) {
  if (!e) return;
  if (Kd in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const s of o) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : nl(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const s = nl(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of s)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var M = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [s, a] of Ug(r)) {
      const u = s.toLowerCase();
      o.has(u) || (t.delete(s), o.add(u)), a === null ? (t.delete(s), n.add(u)) : (t.append(s, a), n.delete(u));
    }
  }
  return {
    [Kd]: !0,
    values: t,
    nulls: n
  };
};
function Wd(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var hl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Fg = (e = Wd) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const s = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let g = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? hl) ?? hl)?.toString) && (g = m + "", s.push({
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
}, q = /* @__PURE__ */ Fg(Wd), zd = class extends te {
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
    return this._client.getAPIList("/v1/environments?beta=true", Re, {
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
}, fr = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function fo(e) {
  return typeof e == "object" && e !== null && fr in e;
}
function Yd(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const r of e) fo(r) && n.add(r[fr]);
  if (t) {
    for (const r of t)
      if (fo(r) && n.add(r[fr]), Array.isArray(r.content))
        for (const o of r.content) fo(o) && n.add(o[fr]);
  }
  return Array.from(n);
}
function Xd(e, t) {
  const n = Yd(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function qg(e) {
  return fo(e) ? { "x-stainless-helper": e[fr] } : {};
}
var Qd = class extends te {
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", Ir, {
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
    return this._client.post("/v1/files?beta=true", Vi({
      body: r,
      ...t,
      headers: M([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        qg(r.file),
        t?.headers
      ])
    }, this._client));
  }
}, Zd = class extends te {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/models/${e}?beta=true`, {
      ...n,
      headers: M([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", Ir, {
      query: r,
      ...t,
      headers: M([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, jd = class extends te {
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
    return this._client.getAPIList("/v1/user_profiles?beta=true", Re, {
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
}, ef = class extends te {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/agents/${e}/versions?beta=true`, Re, {
      query: o,
      ...n,
      headers: M([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ji = class extends te {
  constructor() {
    super(...arguments), this.versions = new ef(this._client);
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
    return this._client.getAPIList("/v1/agents?beta=true", Re, {
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
Ji.Versions = ef;
var tf = class extends te {
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
    return this._client.getAPIList(q`/v1/memory_stores/${e}/memories?beta=true`, Re, {
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
}, nf = class extends te {
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
    return this._client.getAPIList(q`/v1/memory_stores/${e}/memory_versions?beta=true`, Re, {
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
}, Wo = class extends te {
  constructor() {
    super(...arguments), this.memories = new tf(this._client), this.memoryVersions = new nf(this._client);
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
    return this._client.getAPIList("/v1/memory_stores?beta=true", Re, {
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
Wo.Memories = tf;
Wo.MemoryVersions = nf;
var rf = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function of(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function pl(e, t, n) {
  const r = of(t);
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
  } : sf(e, t, n);
}
function sf(e, t, n) {
  let r = null;
  const o = e.content.map((s) => {
    if (s.type === "text") {
      const a = Bg(t, s.text);
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
function Bg(e, t) {
  const n = of(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new V(`Failed to parse structured output: ${r}`);
  }
}
var Gg = (e) => {
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
}, an = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), an(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), an(e);
    case "string":
      let r = e[e.length - 2];
      if (r?.type === "delimiter")
        return e = e.slice(0, e.length - 1), an(e);
      if (r?.type === "brace" && r.value === "{")
        return e = e.slice(0, e.length - 1), an(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), an(e);
  }
  return e;
}, Og = (e) => {
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
}, Hg = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, af = (e) => JSON.parse(Hg(Og(an(Gg(e))))), Ve, wt, jt, Nn, Ur, kn, Dn, Fr, $n, dt, Ln, qr, Br, Lt, Gr, Or, Un, As, ml, Hr, Ss, Ts, Es, gl, yl = "__json_buf";
function _l(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Vg = class Xs {
  constructor(t, n) {
    Ve.add(this), this.messages = [], this.receivedMessages = [], wt.set(this, void 0), jt.set(this, null), this.controller = new AbortController(), Nn.set(this, void 0), Ur.set(this, () => {
    }), kn.set(this, () => {
    }), Dn.set(this, void 0), Fr.set(this, () => {
    }), $n.set(this, () => {
    }), dt.set(this, {}), Ln.set(this, !1), qr.set(this, !1), Br.set(this, !1), Lt.set(this, !1), Gr.set(this, void 0), Or.set(this, void 0), Un.set(this, void 0), Hr.set(this, (r) => {
      if (L(this, qr, !0, "f"), vr(r) && (r = new tt()), r instanceof tt)
        return L(this, Br, !0, "f"), this._emit("abort", r);
      if (r instanceof V) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new V(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new V(String(r)));
    }), L(this, Nn, new Promise((r, o) => {
      L(this, Ur, r, "f"), L(this, kn, o, "f");
    }), "f"), L(this, Dn, new Promise((r, o) => {
      L(this, Fr, r, "f"), L(this, $n, o, "f");
    }), "f"), T(this, Nn, "f").catch(() => {
    }), T(this, Dn, "f").catch(() => {
    }), L(this, jt, t, "f"), L(this, Un, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, Gr, "f");
  }
  get request_id() {
    return T(this, Or, "f");
  }
  async withResponse() {
    L(this, Lt, !0, "f");
    const t = await T(this, Nn, "f");
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
    }, T(this, Hr, "f"));
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
      T(this, Ve, "m", Ss).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) T(this, Ve, "m", Ts).call(this, c);
      if (u.controller.signal?.aborted) throw new tt();
      T(this, Ve, "m", Es).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  _connected(t) {
    this.ended || (L(this, Gr, t, "f"), L(this, Or, t?.headers.get("request-id"), "f"), T(this, Ur, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, Ln, "f");
  }
  get errored() {
    return T(this, qr, "f");
  }
  get aborted() {
    return T(this, Br, "f");
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
      L(this, Lt, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    L(this, Lt, !0, "f"), await T(this, Dn, "f");
  }
  get currentMessage() {
    return T(this, wt, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, Ve, "m", As).call(this);
  }
  async finalText() {
    return await this.done(), T(this, Ve, "m", ml).call(this);
  }
  _emit(t, ...n) {
    if (T(this, Ln, "f")) return;
    t === "end" && (L(this, Ln, !0, "f"), T(this, Fr, "f").call(this));
    const r = T(this, dt, "f")[t];
    if (r && (T(this, dt, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !T(this, Lt, "f") && !r?.length && Promise.reject(o), T(this, kn, "f").call(this, o), T(this, $n, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !T(this, Lt, "f") && !r?.length && Promise.reject(o), T(this, kn, "f").call(this, o), T(this, $n, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, Ve, "m", As).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      T(this, Ve, "m", Ss).call(this), this._connected(null);
      const s = Ar.fromReadableStream(t, this.controller);
      for await (const a of s) T(this, Ve, "m", Ts).call(this, a);
      if (s.controller.signal?.aborted) throw new tt();
      T(this, Ve, "m", Es).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(wt = /* @__PURE__ */ new WeakMap(), jt = /* @__PURE__ */ new WeakMap(), Nn = /* @__PURE__ */ new WeakMap(), Ur = /* @__PURE__ */ new WeakMap(), kn = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap(), Fr = /* @__PURE__ */ new WeakMap(), $n = /* @__PURE__ */ new WeakMap(), dt = /* @__PURE__ */ new WeakMap(), Ln = /* @__PURE__ */ new WeakMap(), qr = /* @__PURE__ */ new WeakMap(), Br = /* @__PURE__ */ new WeakMap(), Lt = /* @__PURE__ */ new WeakMap(), Gr = /* @__PURE__ */ new WeakMap(), Or = /* @__PURE__ */ new WeakMap(), Un = /* @__PURE__ */ new WeakMap(), Hr = /* @__PURE__ */ new WeakMap(), Ve = /* @__PURE__ */ new WeakSet(), As = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, ml = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new V("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Ss = function() {
    this.ended || L(this, wt, void 0, "f");
  }, Ts = function(n) {
    if (this.ended) return;
    const r = T(this, Ve, "m", gl).call(this, n);
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
            _l(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage(pl(r, T(this, jt, "f"), { logger: T(this, Un, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        L(this, wt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Es = function() {
    if (this.ended) throw new V("stream has ended, this shouldn't happen");
    const n = T(this, wt, "f");
    if (!n) throw new V("request ended without sending any chunks");
    return L(this, wt, void 0, "f"), pl(n, T(this, jt, "f"), { logger: T(this, Un, "f") });
  }, gl = function(n) {
    let r = T(this, wt, "f");
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
            if (o && _l(o)) {
              let s = o[yl] || "";
              s += n.delta.partial_json;
              const a = { ...o };
              if (Object.defineProperty(a, yl, {
                value: s,
                enumerable: !1,
                writable: !0
              }), s) try {
                a.input = af(s);
              } catch (u) {
                const c = new V(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${s}`);
                T(this, Hr, "f").call(this, c);
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
    return new Ar(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, lf = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var Jg = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, Fn, en, Ut, ae, we, xe, _t, Ct, qn, vl, Qs;
function Al() {
  let e, t;
  return {
    promise: new Promise((n, r) => {
      e = n, t = r;
    }),
    resolve: e,
    reject: t
  };
}
var uf = class {
  constructor(e, t, n) {
    Fn.add(this), this.client = e, en.set(this, !1), Ut.set(this, !1), ae.set(this, void 0), we.set(this, void 0), xe.set(this, void 0), _t.set(this, void 0), Ct.set(this, void 0), qn.set(this, 0), L(this, ae, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const r = ["BetaToolRunner", ...Yd(t.tools, t.messages)].join(", ");
    L(this, we, {
      ...n,
      headers: M([{ "x-stainless-helper": r }, n?.headers])
    }, "f"), L(this, Ct, Al(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(en = /* @__PURE__ */ new WeakMap(), Ut = /* @__PURE__ */ new WeakMap(), ae = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakMap(), xe = /* @__PURE__ */ new WeakMap(), _t = /* @__PURE__ */ new WeakMap(), Ct = /* @__PURE__ */ new WeakMap(), qn = /* @__PURE__ */ new WeakMap(), Fn = /* @__PURE__ */ new WeakSet(), vl = async function() {
    const t = T(this, ae, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (T(this, xe, "f") !== void 0) try {
      const c = await T(this, xe, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const r = t.contextTokenThreshold ?? 1e5;
    if (n < r) return !1;
    const o = t.model ?? T(this, ae, "f").params.model, s = t.summaryPrompt ?? Jg, a = T(this, ae, "f").params.messages;
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
      max_tokens: T(this, ae, "f").params.max_tokens
    }, {
      signal: T(this, we, "f").signal,
      headers: M([T(this, we, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new V("Expected text response for compaction");
    return T(this, ae, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (T(this, en, "f")) throw new V("Cannot iterate over a consumed stream");
    L(this, en, !0, "f"), L(this, Ut, !0, "f"), L(this, _t, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (T(this, ae, "f").params.max_iterations && T(this, qn, "f") >= T(this, ae, "f").params.max_iterations) break;
          L(this, Ut, !1, "f"), L(this, _t, void 0, "f"), L(this, qn, (e = T(this, qn, "f"), e++, e), "f"), L(this, xe, void 0, "f");
          const { max_iterations: n, compactionControl: r, ...o } = T(this, ae, "f").params;
          if (o.stream ? (t = this.client.beta.messages.stream({ ...o }, T(this, we, "f")), L(this, xe, t.finalMessage(), "f"), T(this, xe, "f").catch(() => {
          }), yield t) : (L(this, xe, this.client.beta.messages.create({
            ...o,
            stream: !1
          }, T(this, we, "f")), "f"), yield T(this, xe, "f")), !await T(this, Fn, "m", vl).call(this)) {
            if (!T(this, Ut, "f")) {
              const { role: a, content: u } = await T(this, xe, "f");
              T(this, ae, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const s = await T(this, Fn, "m", Qs).call(this, T(this, ae, "f").params.messages.at(-1));
            if (s) T(this, ae, "f").params.messages.push(s);
            else if (!T(this, Ut, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!T(this, xe, "f")) throw new V("ToolRunner concluded without a message from the server");
      T(this, Ct, "f").resolve(await T(this, xe, "f"));
    } catch (t) {
      throw L(this, en, !1, "f"), T(this, Ct, "f").promise.catch(() => {
      }), T(this, Ct, "f").reject(t), L(this, Ct, Al(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? T(this, ae, "f").params = e(T(this, ae, "f").params) : T(this, ae, "f").params = e, L(this, Ut, !0, "f"), L(this, _t, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? L(this, we, e(T(this, we, "f")), "f") : L(this, we, {
      ...T(this, we, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = T(this, we, "f").signal) {
    const t = await T(this, xe, "f") ?? this.params.messages.at(-1);
    return t ? T(this, Fn, "m", Qs).call(this, t, e) : null;
  }
  done() {
    return T(this, Ct, "f").promise;
  }
  async runUntilDone() {
    if (!T(this, en, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return T(this, ae, "f").params;
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
Qs = async function(t, n = T(this, we, "f").signal) {
  return T(this, _t, "f") !== void 0 ? T(this, _t, "f") : (L(this, _t, Kg(T(this, ae, "f").params, t, {
    ...T(this, we, "f"),
    signal: n
  }), "f"), T(this, _t, "f"));
};
async function Kg(e, t = e.messages.at(-1), n) {
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
          content: a instanceof lf ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var cf = class df {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new Cr();
    for await (const n of this.iterator) for (const r of t.decode(n)) yield JSON.parse(r);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new V("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new V("Attempted to iterate over a response with no body");
    return new df(Oi(t.body), n);
  }
}, ff = class extends te {
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
    return this._client.getAPIList("/v1/messages/batches?beta=true", Ir, {
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
    if (!r.results_url) throw new V(`No batch \`results_url\`; Has it finished processing? ${r.processing_status} - ${r.id}`);
    const { betas: o } = t ?? {};
    return this._client.get(r.results_url, {
      ...n,
      headers: M([{
        "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((s, a) => cf.fromResponse(a.response, a.controller));
  }
}, Sl = {
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
}, Wg = ["claude-mythos-preview", "claude-opus-4-6"], br = class extends te {
  constructor() {
    super(...arguments), this.batches = new ff(this._client);
  }
  create(e, t) {
    const n = Tl(e), { betas: r, ...o } = n;
    o.model in Sl && console.warn(`The model '${o.model}' is deprecated and will reach end-of-life on ${Sl[o.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Wg.includes(o.model) && o.thinking && o.thinking.type === "enabled" && console.warn(`Using Claude with ${o.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let s = this._client._options.timeout;
    if (!o.stream && s == null) {
      const u = rf[o.model] ?? void 0;
      s = this._client.calculateNonstreamingTimeout(o.max_tokens, u);
    }
    const a = Xd(o.tools, o.messages);
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
    }, this.create(e, t).then((n) => sf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Vg.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...r } = Tl(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: r,
      ...t,
      headers: M([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new uf(this._client, e, t);
  }
};
function Tl(e) {
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
br.Batches = ff;
br.BetaToolRunner = uf;
br.ToolError = lf;
var hf = class extends te {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/sessions/${e}/events?beta=true`, Re, {
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
}, pf = class extends te {
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
    return this._client.getAPIList(q`/v1/sessions/${e}/resources?beta=true`, Re, {
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
}, zo = class extends te {
  constructor() {
    super(...arguments), this.events = new hf(this._client), this.resources = new pf(this._client);
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
    return this._client.getAPIList("/v1/sessions?beta=true", Re, {
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
zo.Events = hf;
zo.Resources = pf;
var mf = class extends te {
  create(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.post(q`/v1/skills/${e}/versions?beta=true`, Vi({
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
    return this._client.getAPIList(q`/v1/skills/${e}/versions?beta=true`, Re, {
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
}, Ki = class extends te {
  constructor() {
    super(...arguments), this.versions = new mf(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Vi({
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
    return this._client.getAPIList("/v1/skills?beta=true", Re, {
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
Ki.Versions = mf;
var gf = class extends te {
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
    return this._client.getAPIList(q`/v1/vaults/${e}/credentials?beta=true`, Re, {
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
}, Wi = class extends te {
  constructor() {
    super(...arguments), this.credentials = new gf(this._client);
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
    return this._client.getAPIList("/v1/vaults?beta=true", Re, {
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
Wi.Credentials = gf;
var Ye = class extends te {
  constructor() {
    super(...arguments), this.models = new Zd(this._client), this.messages = new br(this._client), this.agents = new Ji(this._client), this.environments = new zd(this._client), this.sessions = new zo(this._client), this.vaults = new Wi(this._client), this.memoryStores = new Wo(this._client), this.files = new Qd(this._client), this.skills = new Ki(this._client), this.userProfiles = new jd(this._client);
  }
};
Ye.Models = Zd;
Ye.Messages = br;
Ye.Agents = Ji;
Ye.Environments = zd;
Ye.Sessions = zo;
Ye.Vaults = Wi;
Ye.MemoryStores = Wo;
Ye.Files = Qd;
Ye.Skills = Ki;
Ye.UserProfiles = jd;
var yf = class extends te {
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
function _f(e) {
  return e?.output_config?.format;
}
function El(e, t, n) {
  const r = _f(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((o) => o.type === "text" ? Object.defineProperty({ ...o }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : o),
    parsed_output: null
  } : vf(e, t, n);
}
function vf(e, t, n) {
  let r = null;
  const o = e.content.map((s) => {
    if (s.type === "text") {
      const a = zg(t, s.text);
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
function zg(e, t) {
  const n = _f(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new V(`Failed to parse structured output: ${r}`);
  }
}
var Je, It, tn, Bn, Vr, Gn, On, Jr, Hn, ft, Vn, Kr, Wr, Ft, zr, Yr, Jn, ws, wl, Cs, Is, bs, Ps, Cl, Il = "__json_buf";
function bl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var Yg = class Zs {
  constructor(t, n) {
    Je.add(this), this.messages = [], this.receivedMessages = [], It.set(this, void 0), tn.set(this, null), this.controller = new AbortController(), Bn.set(this, void 0), Vr.set(this, () => {
    }), Gn.set(this, () => {
    }), On.set(this, void 0), Jr.set(this, () => {
    }), Hn.set(this, () => {
    }), ft.set(this, {}), Vn.set(this, !1), Kr.set(this, !1), Wr.set(this, !1), Ft.set(this, !1), zr.set(this, void 0), Yr.set(this, void 0), Jn.set(this, void 0), Cs.set(this, (r) => {
      if (L(this, Kr, !0, "f"), vr(r) && (r = new tt()), r instanceof tt)
        return L(this, Wr, !0, "f"), this._emit("abort", r);
      if (r instanceof V) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new V(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new V(String(r)));
    }), L(this, Bn, new Promise((r, o) => {
      L(this, Vr, r, "f"), L(this, Gn, o, "f");
    }), "f"), L(this, On, new Promise((r, o) => {
      L(this, Jr, r, "f"), L(this, Hn, o, "f");
    }), "f"), T(this, Bn, "f").catch(() => {
    }), T(this, On, "f").catch(() => {
    }), L(this, tn, t, "f"), L(this, Jn, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, zr, "f");
  }
  get request_id() {
    return T(this, Yr, "f");
  }
  async withResponse() {
    L(this, Ft, !0, "f");
    const t = await T(this, Bn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Zs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const s = new Zs(n, { logger: o });
    for (const a of n.messages) s._addMessageParam(a);
    return L(s, tn, {
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
    }, T(this, Cs, "f"));
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
      T(this, Je, "m", Is).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) T(this, Je, "m", bs).call(this, c);
      if (u.controller.signal?.aborted) throw new tt();
      T(this, Je, "m", Ps).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  _connected(t) {
    this.ended || (L(this, zr, t, "f"), L(this, Yr, t?.headers.get("request-id"), "f"), T(this, Vr, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, Vn, "f");
  }
  get errored() {
    return T(this, Kr, "f");
  }
  get aborted() {
    return T(this, Wr, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (T(this, ft, "f")[t] || (T(this, ft, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = T(this, ft, "f")[t];
    if (!r) return this;
    const o = r.findIndex((s) => s.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (T(this, ft, "f")[t] || (T(this, ft, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      L(this, Ft, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    L(this, Ft, !0, "f"), await T(this, On, "f");
  }
  get currentMessage() {
    return T(this, It, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, Je, "m", ws).call(this);
  }
  async finalText() {
    return await this.done(), T(this, Je, "m", wl).call(this);
  }
  _emit(t, ...n) {
    if (T(this, Vn, "f")) return;
    t === "end" && (L(this, Vn, !0, "f"), T(this, Jr, "f").call(this));
    const r = T(this, ft, "f")[t];
    if (r && (T(this, ft, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !T(this, Ft, "f") && !r?.length && Promise.reject(o), T(this, Gn, "f").call(this, o), T(this, Hn, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !T(this, Ft, "f") && !r?.length && Promise.reject(o), T(this, Gn, "f").call(this, o), T(this, Hn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, Je, "m", ws).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      T(this, Je, "m", Is).call(this), this._connected(null);
      const s = Ar.fromReadableStream(t, this.controller);
      for await (const a of s) T(this, Je, "m", bs).call(this, a);
      if (s.controller.signal?.aborted) throw new tt();
      T(this, Je, "m", Ps).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(It = /* @__PURE__ */ new WeakMap(), tn = /* @__PURE__ */ new WeakMap(), Bn = /* @__PURE__ */ new WeakMap(), Vr = /* @__PURE__ */ new WeakMap(), Gn = /* @__PURE__ */ new WeakMap(), On = /* @__PURE__ */ new WeakMap(), Jr = /* @__PURE__ */ new WeakMap(), Hn = /* @__PURE__ */ new WeakMap(), ft = /* @__PURE__ */ new WeakMap(), Vn = /* @__PURE__ */ new WeakMap(), Kr = /* @__PURE__ */ new WeakMap(), Wr = /* @__PURE__ */ new WeakMap(), Ft = /* @__PURE__ */ new WeakMap(), zr = /* @__PURE__ */ new WeakMap(), Yr = /* @__PURE__ */ new WeakMap(), Jn = /* @__PURE__ */ new WeakMap(), Cs = /* @__PURE__ */ new WeakMap(), Je = /* @__PURE__ */ new WeakSet(), ws = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, wl = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new V("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Is = function() {
    this.ended || L(this, It, void 0, "f");
  }, bs = function(n) {
    if (this.ended) return;
    const r = T(this, Je, "m", Cl).call(this, n);
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
            bl(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage(El(r, T(this, tn, "f"), { logger: T(this, Jn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        L(this, It, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Ps = function() {
    if (this.ended) throw new V("stream has ended, this shouldn't happen");
    const n = T(this, It, "f");
    if (!n) throw new V("request ended without sending any chunks");
    return L(this, It, void 0, "f"), El(n, T(this, tn, "f"), { logger: T(this, Jn, "f") });
  }, Cl = function(n) {
    let r = T(this, It, "f");
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
            if (o && bl(o)) {
              let s = o[Il] || "";
              s += n.delta.partial_json;
              const a = { ...o };
              Object.defineProperty(a, Il, {
                value: s,
                enumerable: !1,
                writable: !0
              }), s && (a.input = af(s)), r.content[n.index] = a;
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
    return new Ar(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Af = class extends te {
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
    return this._client.getAPIList("/v1/messages/batches", Ir, {
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
    if (!n.results_url) throw new V(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: M([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((r, o) => cf.fromResponse(o.response, o.controller));
  }
}, zi = class extends te {
  constructor() {
    super(...arguments), this.batches = new Af(this._client);
  }
  create(e, t) {
    e.model in Pl && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${Pl[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Xg.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const o = rf[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, o);
    }
    const r = Xd(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: M([r, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => vf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Yg.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, Pl = {
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
}, Xg = ["claude-mythos-preview", "claude-opus-4-6"];
zi.Batches = Af;
var Sf = class extends te {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/models/${e}`, {
      ...n,
      headers: M([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models", Ir, {
      query: r,
      ...t,
      headers: M([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Xr = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, js, Yi, ho, Tf, Qg = "\\n\\nHuman:", Zg = "\\n\\nAssistant:", oe = class {
  constructor({ baseURL: e = Xr("ANTHROPIC_BASE_URL"), apiKey: t = Xr("ANTHROPIC_API_KEY") ?? null, authToken: n = Xr("ANTHROPIC_AUTH_TOKEN") ?? null, ...r } = {}) {
    js.add(this), ho.set(this, void 0);
    const o = {
      apiKey: t,
      authToken: n,
      ...r,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!o.dangerouslyAllowBrowser && fg()) throw new V(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = o.baseURL, this.timeout = o.timeout ?? Yi.DEFAULT_TIMEOUT, this.logger = o.logger ?? console;
    const s = "warn";
    this.logLevel = s, this.logLevel = cl(o.logLevel, "ClientOptions.logLevel", this) ?? cl(Xr("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? s, this.fetchOptions = o.fetchOptions, this.maxRetries = o.maxRetries ?? 2, this.fetch = o.fetch ?? yg(), L(this, ho, vg, "f"), this._options = o, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return Ag(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${sn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Cd()}`;
  }
  makeStatusError(e, t, n, r) {
    return qe.generate(e, t, n, r);
  }
  buildURL(e, t, n) {
    const r = !T(this, js, "m", Tf).call(this) && n || this.baseURL, o = lg(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), s = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!rl(s) || !rl(a)) && (t = {
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
    return new Bd(this, this.makeRequest(e, t, void 0));
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
    if (Ae(this).debug(`[${c}] sending request`, qt({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: s.headers
    })), r.signal?.aborted) throw new tt();
    const f = new AbortController(), p = await this.fetchWithTimeout(a, s, u, f).catch(Vs), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new tt();
      const v = vr(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return Ae(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${_}`), Ae(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${_})`, qt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(r, t, n ?? c);
      throw Ae(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), Ae(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, qt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - h,
        message: p.message
      })), v ? new Id() : new Ko({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, v]) => ", " + _ + ": " + JSON.stringify(v)).join("")}] ${s.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const k = `retrying, ${t} attempts remaining`;
        return await _g(p.body), Ae(this).info(`${g} - ${k}`), Ae(this).debug(`[${c}] response error (${k})`, qt({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(r, t, n ?? c, p.headers);
      }
      const v = _ ? "error; no more retries left" : "error; not retryable";
      Ae(this).info(`${g} - ${v}`);
      const w = await p.text().catch((k) => Vs(k).message), C = $d(w), P = C ? void 0 : w;
      throw Ae(this).debug(`[${c}] response error (${v})`, qt({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: P,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, C, P, p.headers);
    }
    return Ae(this).info(g), Ae(this).debug(`[${c}] response start`, qt({
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
    return new Rg(this, n, e);
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
    return await dg(o), this.makeRequest(e, t - 1, n);
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
    "timeout" in n && cg("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
        ...gg(),
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
      body: Ud(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : T(this, ho, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Yi = oe, ho = /* @__PURE__ */ new WeakMap(), js = /* @__PURE__ */ new WeakSet(), Tf = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
oe.Anthropic = Yi;
oe.HUMAN_PROMPT = Qg;
oe.AI_PROMPT = Zg;
oe.DEFAULT_TIMEOUT = 6e5;
oe.AnthropicError = V;
oe.APIError = qe;
oe.APIConnectionError = Ko;
oe.APIConnectionTimeoutError = Id;
oe.APIUserAbortError = tt;
oe.NotFoundError = xd;
oe.ConflictError = Md;
oe.RateLimitError = kd;
oe.BadRequestError = bd;
oe.AuthenticationError = Pd;
oe.InternalServerError = Dd;
oe.PermissionDeniedError = Rd;
oe.UnprocessableEntityError = Nd;
oe.toFile = $g;
var Pr = class extends oe {
  constructor() {
    super(...arguments), this.completions = new yf(this), this.messages = new zi(this), this.models = new Sf(this), this.beta = new Ye(this);
  }
};
Pr.Completions = yf;
Pr.Messages = zi;
Pr.Models = Sf;
Pr.Beta = Ye;
function An(e) {
  if (Array.isArray(e)) return e.map((n) => An(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key|proxy_password|password/i.test(n) ? "[redacted]" : An(r);
  }), t;
}
function Sr(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: An({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    })
  };
}
function jg(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function ey(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function Ef(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function ty(e) {
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
      const r = ey(n.image_url.url);
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
function ny(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function ry(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && Ef(t) || null;
}
function oy(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: Ef(e.content) || [] } : void 0;
}
function Rl(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function xl(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: jg(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function sy(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const r = e[n];
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const o = ry(r), s = xl(r.tool_calls);
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
        const o = [Rl(r)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, o.push(Rl(e[n]));
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
          }] : [], ...xl(r.tool_calls)]
        });
        continue;
      }
      t.push({
        role: r.role,
        content: ty(r.content)
      });
    }
  }
  return t;
}
function Qr(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Ml(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
var iy = class {
  constructor(e) {
    this.config = e, this.client = new Pr({
      apiKey: e.apiKey,
      baseURL: Ml(e.baseUrl),
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
    })), n = ny(e), r = {
      model: this.config.model,
      system: n,
      messages: sy(e.messages),
      tools: t,
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (r.temperature = e.temperature), e.reasoning?.enabled && (r.thinking = {
      type: "adaptive",
      display: "summarized"
    }), r;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = Ml(this.config.baseUrl);
    return Sr({
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
        p.length && Qr(e, {
          text: c,
          thoughts: d(),
          toolCalls: p,
          toolCallDraft: !0
        });
      };
      s.on("text", (p, m) => {
        c = m || "", Qr(e, {
          text: c,
          thoughts: d(),
          ...h().length ? {
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), s.on("thinking", (p, m) => {
        a.set("thinking:0", m || ""), Qr(e, {
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
        p?.type === "redacted_thinking" && (a.set("redacted:0", p.data || ""), Qr(e, {
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
      providerPayload: oy(r),
      requestInspection: n
    };
  }
}, ay = /* @__PURE__ */ Vo(((e, t) => {
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
})), ly = /* @__PURE__ */ Vo(((e) => {
  var t = ay();
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
})), uy = /* @__PURE__ */ Vo(((e, t) => {
  t.exports = ly();
})), cy = /* @__PURE__ */ Vo(((e, t) => {
  var n = uy(), r = [
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
})), Nl = /* @__PURE__ */ jm(cy(), 1), dy = void 0, fy = void 0;
function hy() {
  return {
    geminiUrl: dy,
    vertexUrl: fy
  };
}
function py(e, t, n, r) {
  var o, s;
  if (!e?.baseUrl) {
    const a = hy();
    return t ? (o = a.vertexUrl) !== null && o !== void 0 ? o : n : (s = a.geminiUrl) !== null && s !== void 0 ? s : r;
  }
  return e.baseUrl;
}
var At = class {
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
function my(e, t) {
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
    ei(e, o, s, 0, a);
  }
}
function ei(e, t, n, r, o) {
  if (r >= t.length || typeof e != "object" || e === null) return;
  const s = t[r];
  if (s.endsWith("[]")) {
    const a = s.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) ei(c, t, n, r + 1, o);
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
    s in a && ei(a[s], t, n, r + 1, o);
  }
}
function Xi(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function gy(e) {
  const t = {}, n = i(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const r = i(e, ["resourceName"]);
  return r != null && l(t, ["_url", "resourceName"], r), t;
}
function yy(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], vy(a)), t;
}
function _y(e) {
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
function vy(e) {
  const t = {}, n = i(e, ["generatedSamples"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((a) => Sy(a))), l(t, ["generatedVideos"], s);
  }
  const r = i(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = i(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function Ay(e) {
  const t = {}, n = i(e, ["videos"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((a) => Ty(a))), l(t, ["generatedVideos"], s);
  }
  const r = i(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = i(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function Sy(e) {
  const t = {}, n = i(e, ["video"]);
  return n != null && l(t, ["video"], Py(n)), t;
}
function Ty(e) {
  const t = {}, n = i(e, ["_self"]);
  return n != null && l(t, ["video"], Ry(n)), t;
}
function Ey(e) {
  const t = {}, n = i(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function wy(e) {
  const t = {}, n = i(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Cy(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], Iy(a)), t;
}
function Iy(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = i(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function wf(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], by(a)), t;
}
function by(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = i(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function Py(e) {
  const t = {}, n = i(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const r = i(e, ["encodedVideo"]);
  r != null && l(t, ["videoBytes"], Xi(r));
  const o = i(e, ["encoding"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Ry(e) {
  const t = {}, n = i(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const r = i(e, ["bytesBase64Encoded"]);
  r != null && l(t, ["videoBytes"], Xi(r));
  const o = i(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
var kl;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(kl || (kl = {}));
var Dl;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(Dl || (Dl = {}));
var $l;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})($l || ($l = {}));
var Nt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(Nt || (Nt = {}));
var Ll;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(Ll || (Ll = {}));
var Ul;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(Fl || (Fl = {}));
var ql;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(ql || (ql = {}));
var Bl;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(Bl || (Bl = {}));
var Gl;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(Gl || (Gl = {}));
var Ol;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(Ol || (Ol = {}));
var hn;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(hn || (hn = {}));
var hr;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(hr || (hr = {}));
var Hl;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(Hl || (Hl = {}));
var Vl;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Vl || (Vl = {}));
var Jl;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Jl || (Jl = {}));
var Kl;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Kl || (Kl = {}));
var Wl;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Wl || (Wl = {}));
var zl;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(zl || (zl = {}));
var Yl;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Xl || (Xl = {}));
var Ql;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Ql || (Ql = {}));
var Zl;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Zl || (Zl = {}));
var jl;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(jl || (jl = {}));
var Po;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(Po || (Po = {}));
var eu;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(eu || (eu = {}));
var tu;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(tu || (tu = {}));
var nu;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(nu || (nu = {}));
var ru;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(ru || (ru = {}));
var ti;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(ti || (ti = {}));
var ou;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(ou || (ou = {}));
var su;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(su || (su = {}));
var iu;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(iu || (iu = {}));
var au;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(au || (au = {}));
var lu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(lu || (lu = {}));
var uu;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(uu || (uu = {}));
var cu;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(cu || (cu = {}));
var ni;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(ni || (ni = {}));
var du;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(du || (du = {}));
var fu;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(fu || (fu = {}));
var Ro;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(Ro || (Ro = {}));
var hu;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(hu || (hu = {}));
var pu;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(pu || (pu = {}));
var mu;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(mu || (mu = {}));
var gu;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(gu || (gu = {}));
var yu;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(yu || (yu = {}));
var _u;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(_u || (_u = {}));
var vu;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(vu || (vu = {}));
var Au;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(Au || (Au = {}));
var Su;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(Su || (Su = {}));
var Tu;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(Tu || (Tu = {}));
var Eu;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(Eu || (Eu = {}));
var wu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(wu || (wu = {}));
var Cu;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(Cu || (Cu = {}));
var Iu;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(Iu || (Iu = {}));
var bu;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(bu || (bu = {}));
var Pu;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(Pu || (Pu = {}));
var Ru;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(Ru || (Ru = {}));
var xu;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(xu || (xu = {}));
var Mu;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(Mu || (Mu = {}));
var Nu;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(Nu || (Nu = {}));
var ku;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(ku || (ku = {}));
var Du;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(Du || (Du = {}));
var $u;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})($u || ($u = {}));
var pn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(pn || (pn = {}));
var ri = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Kn = class {
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
}, Lu = class {
}, Uu = class {
}, xy = class {
}, My = class {
}, Ny = class {
}, ky = class {
}, Fu = class {
}, qu = class {
}, Bu = class {
}, Dy = class {
}, Gu = class Cf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new Cf();
    let o;
    const s = t;
    return n ? o = _y(s) : o = yy(s), Object.assign(r, o), r;
  }
}, Ou = class {
}, Hu = class {
}, Vu = class {
}, Ju = class {
}, $y = class {
}, Ly = class {
}, Uy = class {
}, Fy = class If {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new If(), o = Cy(t);
    return Object.assign(r, o), r;
  }
}, qy = class {
}, By = class {
}, Gy = class {
}, Oy = class {
}, Ku = class {
}, Hy = class {
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
}, Vy = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, Jy = class bf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new bf(), o = wf(t);
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
function Pf(e, t) {
  const n = Y(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function Rf(e) {
  return Array.isArray(e) ? e.map((t) => xo(t)) : [xo(e)];
}
function xo(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function xf(e) {
  const t = xo(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Mf(e) {
  const t = xo(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Wu(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function Nf(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Wu(t)) : [Wu(e)];
}
function oi(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function zu(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Yu(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function de(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return oi(e) ? e : {
    role: "user",
    parts: Nf(e)
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
function be(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (zu(e) || Yu(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [de(e)];
  }
  const t = [], n = [], r = oi(e[0]);
  for (const o of e) {
    const s = oi(o);
    if (s != r) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (s) t.push(o);
    else {
      if (zu(o) || Yu(o)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(o);
    }
  }
  return r || t.push({
    role: "user",
    parts: Nf(n)
  }), t;
}
function Ky(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((r) => r !== "null");
  if (n.length === 1) t.type = Object.values(Nt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : Nt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const r of n) t.anyOf.push({ type: Object.values(Nt).includes(r.toUpperCase()) ? r.toUpperCase() : Nt.TYPE_UNSPECIFIED });
  }
}
function yn(e) {
  const t = {}, n = ["items"], r = ["anyOf"], o = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const s = e.anyOf;
  s != null && s.length == 2 && (s[0].type === "null" ? (t.nullable = !0, e = s[1]) : s[1].type === "null" && (t.nullable = !0, e = s[0])), e.type instanceof Array && Ky(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(Nt).includes(u.toUpperCase()) ? u.toUpperCase() : Nt.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = yn(u);
      else if (r.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(yn(d));
        }
        t[a] = c;
      } else if (o.includes(a)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = yn(h);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function Zi(e) {
  return yn(e);
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
function wn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = yn(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = yn(t.response));
  return e;
}
function Cn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function Wy(e, t, n, r = 1) {
  const o = !t.startsWith(`${n}/`) && t.split("/").length === r;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : o ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : o ? `${n}/${t}` : t;
}
function St(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return Wy(e, t, "cachedContents");
}
function kf(e) {
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
function $t(e) {
  return Xi(e);
}
function zy(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function Yy(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function Xy(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function Df(e) {
  var t;
  let n;
  if (zy(e) && (n = e.name), !(Xy(e) && (n = e.uri, n === void 0)) && !(Yy(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const r = n.split("files/")[1].match(/[a-z0-9]+/);
      if (r === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = r[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function $f(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function Lf(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (Qy(e, t)) return e[t];
  return [];
}
function Qy(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function Zy(e, t = {}) {
  const n = e, r = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (r.responseJsonSchema = n.outputSchema), t.behavior && (r.behavior = t.behavior), { functionDeclarations: [r] };
}
function jy(e, t = {}) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = o.name;
    if (r.has(s)) throw new Error(`Duplicate function name ${s} found in MCP tools. Please ensure function names are unique.`);
    r.add(s);
    const a = Zy(o, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function Uf(e, t) {
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
function e_(e) {
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
function Ff(e) {
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
function In(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function qf(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function t_(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function n_(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function r_(e) {
  const t = {}, n = i(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const r = i(e, ["inlinedResponses", "inlinedResponses"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => U_(a))), l(t, ["inlinedResponses"], s);
  }
  const o = i(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], s);
  }
  return t;
}
function o_(e) {
  const t = {}, n = i(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const r = i(e, ["gcsDestination", "outputUriPrefix"]);
  r != null && l(t, ["gcsUri"], r);
  const o = i(e, ["bigqueryDestination", "outputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function s_(e) {
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
function po(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata", "displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = i(e, ["metadata", "state"]);
  o != null && l(t, ["state"], qf(o));
  const s = i(e, ["metadata", "createTime"]);
  s != null && l(t, ["createTime"], s);
  const a = i(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = i(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = i(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = i(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], r_(Ff(d))), t;
}
function si(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = i(e, ["state"]);
  o != null && l(t, ["state"], qf(o));
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
  f != null && l(t, ["src"], i_(f));
  const p = i(e, ["outputConfig"]);
  p != null && l(t, ["dest"], o_(Ff(p)));
  const m = i(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function i_(e) {
  const t = {}, n = i(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const r = i(e, ["gcsSource", "uris"]);
  r != null && l(t, ["gcsUri"], r);
  const o = i(e, ["bigquerySource", "inputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function a_(e, t) {
  const n = {};
  if (i(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (i(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (i(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const r = i(t, ["fileName"]);
  r != null && l(n, ["fileName"], r);
  const o = i(t, ["inlinedRequests"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => L_(e, a))), l(n, ["requests", "requests"], s);
  }
  return n;
}
function l_(e) {
  const t = {}, n = i(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const r = i(e, ["gcsUri"]);
  r != null && l(t, ["gcsSource", "uris"], r);
  const o = i(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigquerySource", "inputUri"], o), i(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (i(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function u_(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function c_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], In(e, r)), n;
}
function d_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], In(e, r)), n;
}
function f_(e) {
  const t = {}, n = i(e, ["content"]);
  n != null && l(t, ["content"], n);
  const r = i(e, ["citationMetadata"]);
  r != null && l(t, ["citationMetadata"], h_(r));
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
function h_(e) {
  const t = {}, n = i(e, ["citationSources"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["citations"], r);
  }
  return t;
}
function Bf(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => V_(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function p_(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  if (t !== void 0 && r != null && l(t, ["batch", "displayName"], r), i(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const o = i(e, ["webhookConfig"]);
  return t !== void 0 && o != null && l(t, ["batch", "webhookConfig"], o), n;
}
function m_(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const o = i(e, ["dest"]);
  if (t !== void 0 && o != null && l(t, ["outputConfig"], s_(e_(o))), i(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Xu(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = i(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], a_(e, Uf(e, o)));
  const s = i(t, ["config"]);
  return s != null && p_(s, n), n;
}
function g_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["model"], Y(e, r));
  const o = i(t, ["src"]);
  o != null && l(n, ["inputConfig"], l_(Uf(e, o)));
  const s = i(t, ["config"]);
  return s != null && m_(s, n), n;
}
function y_(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["batch", "displayName"], r), n;
}
function __(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = i(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], C_(e, o));
  const s = i(t, ["config"]);
  return s != null && y_(s, n), n;
}
function v_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], In(e, r)), n;
}
function A_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], In(e, r)), n;
}
function S_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  return s != null && l(t, ["error"], s), t;
}
function T_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  return s != null && l(t, ["error"], s), t;
}
function E_(e, t) {
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
  return o != null && (l(n, ["_self"], w_(o, n)), my(n, { "requests[].*": "requests[].request.*" })), n;
}
function w_(e, t) {
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
function C_(e, t) {
  const n = {}, r = i(t, ["fileName"]);
  r != null && l(n, ["file_name"], r);
  const o = i(t, ["inlinedRequests"]);
  return o != null && l(n, ["requests"], E_(e, o)), n;
}
function I_(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function b_(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function P_(e) {
  const t = {}, n = i(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = i(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function R_(e, t, n) {
  const r = {}, o = i(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], Bf(de(o)));
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
  w != null && l(r, ["responseSchema"], Zi(w));
  const C = i(t, ["responseJsonSchema"]);
  if (C != null && l(r, ["responseJsonSchema"], C), i(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (i(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = i(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let Q = P;
    Array.isArray(Q) && (Q = Q.map((X) => J_(X))), l(n, ["safetySettings"], Q);
  }
  const k = i(t, ["tools"]);
  if (n !== void 0 && k != null) {
    let Q = Cn(k);
    Array.isArray(Q) && (Q = Q.map((X) => W_(wn(X)))), l(n, ["tools"], Q);
  }
  const R = i(t, ["toolConfig"]);
  if (n !== void 0 && R != null && l(n, ["toolConfig"], K_(R)), i(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const I = i(t, ["cachedContent"]);
  n !== void 0 && I != null && l(n, ["cachedContent"], St(e, I));
  const B = i(t, ["responseModalities"]);
  B != null && l(r, ["responseModalities"], B);
  const x = i(t, ["mediaResolution"]);
  x != null && l(r, ["mediaResolution"], x);
  const D = i(t, ["speechConfig"]);
  if (D != null && l(r, ["speechConfig"], ji(D)), i(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const O = i(t, ["thinkingConfig"]);
  O != null && l(r, ["thinkingConfig"], O);
  const z = i(t, ["imageConfig"]);
  z != null && l(r, ["imageConfig"], $_(z));
  const ne = i(t, ["enableEnhancedCivicAnswers"]);
  if (ne != null && l(r, ["enableEnhancedCivicAnswers"], ne), i(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const j = i(t, ["serviceTier"]);
  return n !== void 0 && j != null && l(n, ["serviceTier"], j), r;
}
function x_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["candidates"]);
  if (r != null) {
    let d = r;
    Array.isArray(d) && (d = d.map((h) => f_(h))), l(t, ["candidates"], d);
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
function M_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], In(e, r)), n;
}
function N_(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], In(e, r)), n;
}
function k_(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], n_(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function D_(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function $_(e) {
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
function L_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["request", "model"], Y(e, r));
  const o = i(t, ["contents"]);
  if (o != null) {
    let u = be(o);
    Array.isArray(u) && (u = u.map((c) => Bf(c))), l(n, ["request", "contents"], u);
  }
  const s = i(t, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const a = i(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], R_(e, a, i(n, ["request"], {}))), n;
}
function U_(e) {
  const t = {}, n = i(e, ["response"]);
  n != null && l(t, ["response"], x_(n));
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function F_(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  if (t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), i(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function q_(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const s = i(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), n;
}
function B_(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && F_(n, t), t;
}
function G_(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && q_(n, t), t;
}
function O_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = i(e, ["operations"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => po(a))), l(t, ["batchJobs"], s);
  }
  return t;
}
function H_(e) {
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
function V_(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], I_(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], b_(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], u_(c));
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
function J_(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = i(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function K_(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = i(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], P_(r));
  const o = i(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function W_(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], D_(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], k_(s));
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
var vt;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(vt || (vt = {}));
var Zt = class {
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
}, z_ = class extends At {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Zt(vt.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Xu(this.apiClient, e), n = t._url, r = $("{model}:batchGenerateContent", n), o = t.batch.inputConfig.requests, s = o.requests, a = [];
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
      const c = g_(this.apiClient, e);
      return a = $("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => si(d));
    } else {
      const c = Xu(this.apiClient, e);
      return a = $("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => po(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = __(this.apiClient, e);
      return o = $("{model}:asyncBatchEmbedContent", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => po(u));
    }
  }
  async get(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = N_(this.apiClient, e);
      return a = $("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => si(d));
    } else {
      const c = M_(this.apiClient, e);
      return a = $("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => po(d));
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let s = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = d_(this.apiClient, e);
      s = $("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: s,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = c_(this.apiClient, e);
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
      const c = G_(e);
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
        const h = H_(d), f = new Ku();
        return Object.assign(f, h), f;
      });
    } else {
      const c = B_(e);
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
        const h = O_(d), f = new Ku();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = A_(this.apiClient, e);
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
      })), s.then((d) => T_(d));
    } else {
      const c = v_(this.apiClient, e);
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
      })), s.then((d) => S_(d));
    }
  }
};
function Y_(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function X_(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Qu(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => vv(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Zu(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => Av(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Q_(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const s = i(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const a = i(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let h = be(a);
    Array.isArray(h) && (h = h.map((f) => Qu(f))), l(t, ["contents"], h);
  }
  const u = i(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Qu(de(u)));
  const c = i(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => Ev(f))), l(t, ["tools"], h);
  }
  const d = i(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], Sv(d)), i(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function Z_(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const s = i(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const a = i(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = be(a);
    Array.isArray(f) && (f = f.map((p) => Zu(p))), l(t, ["contents"], f);
  }
  const u = i(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Zu(de(u)));
  const c = i(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => wv(p))), l(t, ["tools"], f);
  }
  const d = i(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], Tv(d));
  const h = i(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function j_(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["model"], Pf(e, r));
  const o = i(t, ["config"]);
  return o != null && Q_(o, n), n;
}
function ev(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["model"], Pf(e, r));
  const o = i(t, ["config"]);
  return o != null && Z_(o, n), n;
}
function tv(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], St(e, r)), n;
}
function nv(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], St(e, r)), n;
}
function rv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function ov(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
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
function lv(e) {
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
function uv(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], St(e, r)), n;
}
function cv(e, t) {
  const n = {}, r = i(t, ["name"]);
  return r != null && l(n, ["_url", "name"], St(e, r)), n;
}
function dv(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Y_(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function fv(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function hv(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function pv(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function mv(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && hv(n, t), t;
}
function gv(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && pv(n, t), t;
}
function yv(e) {
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
function _v(e) {
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
function vv(e) {
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
  c != null && l(t, ["inlineData"], X_(c));
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
function Av(e) {
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
function Sv(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = i(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], av(r));
  const o = i(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function Tv(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = i(e, ["functionCallingConfig"]);
  if (r != null && l(t, ["functionCallingConfig"], r), i(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function Ev(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], fv(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], dv(s));
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
function wv(e) {
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
    Array.isArray(p) && (p = p.map((m) => lv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = i(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = i(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = i(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function Cv(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function Iv(e, t) {
  const n = {}, r = i(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = i(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function bv(e, t) {
  const n = {}, r = i(t, ["name"]);
  r != null && l(n, ["_url", "name"], St(e, r));
  const o = i(t, ["config"]);
  return o != null && Cv(o, n), n;
}
function Pv(e, t) {
  const n = {}, r = i(t, ["name"]);
  r != null && l(n, ["_url", "name"], St(e, r));
  const o = i(t, ["config"]);
  return o != null && Iv(o, n), n;
}
var Rv = class extends At {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Zt(vt.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ev(this.apiClient, e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const c = j_(this.apiClient, e);
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
      const c = cv(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const c = uv(this.apiClient, e);
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
      const c = nv(this.apiClient, e);
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
        const h = ov(d), f = new Vu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = tv(this.apiClient, e);
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
        const h = rv(d), f = new Vu();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Pv(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => d);
    } else {
      const c = bv(this.apiClient, e);
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
      const c = gv(e);
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
        const h = _v(d), f = new Ju();
        return Object.assign(f, h), f;
      });
    } else {
      const c = mv(e);
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
        const h = yv(d), f = new Ju();
        return Object.assign(f, h), f;
      });
    }
  }
};
function kt(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, r = Object.getOwnPropertySymbols(e); o < r.length; o++) t.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[o]) && (n[r[o]] = e[r[o]]);
  return n;
}
function ju(e) {
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
function nt(e, t, n) {
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
function rt(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof ju == "function" ? ju(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
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
function xv(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : Gf(n);
}
function Gf(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function Mv(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function ec(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let r = 0;
  for (; r < n; ) if (e[r].role === "user")
    t.push(e[r]), r++;
  else {
    const o = [];
    let s = !0;
    for (; r < n && e[r].role === "model"; )
      o.push(e[r]), s && !Gf(e[r]) && (s = !1), r++;
    s ? t.push(...o) : t.pop();
  }
  return t;
}
var Nv = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new kv(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, kv = class {
  constructor(e, t, n, r = {}, o = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = r, this.history = o, this.sendPromise = Promise.resolve(), Mv(o);
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
    const t = e ? ec(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return nt(this, arguments, function* () {
      var r, o, s, a, u, c;
      const d = [];
      try {
        for (var h = !0, f = rt(e), p; p = yield J(f.next()), r = p.done, !r; h = !0) {
          a = p.value, h = !1;
          const m = a;
          if (xv(m)) {
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
    }), n && n.length > 0 ? this.history.push(...ec(n)) : this.history.push(e), this.history.push(...r);
  }
}, Of = class Hf extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Hf.prototype);
  }
};
function Dv(e) {
  const t = {}, n = i(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function $v(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Lv(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Df(n)), t;
}
function Uv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Fv(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Df(n)), t;
}
function qv(e) {
  const t = {}, n = i(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function Bv(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function Gv(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && Bv(n, t), t;
}
function Ov(e) {
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
function Hv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["files"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["files"], o);
  }
  return t;
}
var Vv = class extends At {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Zt(vt.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const a = Gv(e);
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
        const c = Ov(u), d = new qy();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Dv(e);
      return o = $("upload/v1beta/files", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = $v(u), d = new By();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Fv(e);
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
      const a = Lv(e);
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
        const c = Uv(u), d = new Gy();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = qv(e);
      return o = $("files:register", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = Hv(u), d = new Oy();
        return Object.assign(d, c), d;
      });
    }
  }
};
function tc(e) {
  const t = {};
  if (i(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function Jv(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function mo(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Kv(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => uA(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Wv(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => cA(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function zv(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Yv(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Xv(e) {
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
function Qv(e) {
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
  const C = i(e, ["speechConfig"]);
  C != null && l(t, ["speechConfig"], C);
  const P = i(e, ["stopSequences"]);
  P != null && l(t, ["stopSequences"], P);
  const k = i(e, ["temperature"]);
  k != null && l(t, ["temperature"], k);
  const R = i(e, ["thinkingConfig"]);
  R != null && l(t, ["thinkingConfig"], R);
  const I = i(e, ["topK"]);
  I != null && l(t, ["topK"], I);
  const B = i(e, ["topP"]);
  if (B != null && l(t, ["topP"], B), i(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function Zv(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Jv(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function jv(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function eA(e, t) {
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Kv(de(g)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = Cn(_);
    Array.isArray(x) && (x = x.map((D) => hA(wn(D)))), l(t, ["setup", "tools"], x);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], fA(v));
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], tc(w));
  const C = i(e, ["outputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "outputAudioTranscription"], tc(C));
  const P = i(e, ["realtimeInputConfig"]);
  t !== void 0 && P != null && l(t, ["setup", "realtimeInputConfig"], P);
  const k = i(e, ["contextWindowCompression"]);
  t !== void 0 && k != null && l(t, ["setup", "contextWindowCompression"], k);
  const R = i(e, ["proactivity"]);
  if (t !== void 0 && R != null && l(t, ["setup", "proactivity"], R), i(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const I = i(e, ["avatarConfig"]);
  t !== void 0 && I != null && l(t, ["setup", "avatarConfig"], I);
  const B = i(e, ["safetySettings"]);
  if (t !== void 0 && B != null) {
    let x = B;
    Array.isArray(x) && (x = x.map((D) => dA(D))), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function tA(e, t) {
  const n = {}, r = i(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], Qv(r));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Wv(de(g)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let D = Cn(_);
    Array.isArray(D) && (D = D.map((O) => pA(wn(O)))), l(t, ["setup", "tools"], D);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], v);
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], w);
  const C = i(e, ["outputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "outputAudioTranscription"], C);
  const P = i(e, ["realtimeInputConfig"]);
  t !== void 0 && P != null && l(t, ["setup", "realtimeInputConfig"], P);
  const k = i(e, ["contextWindowCompression"]);
  t !== void 0 && k != null && l(t, ["setup", "contextWindowCompression"], k);
  const R = i(e, ["proactivity"]);
  t !== void 0 && R != null && l(t, ["setup", "proactivity"], R);
  const I = i(e, ["explicitVadSignal"]);
  t !== void 0 && I != null && l(t, ["setup", "explicitVadSignal"], I);
  const B = i(e, ["avatarConfig"]);
  t !== void 0 && B != null && l(t, ["setup", "avatarConfig"], B);
  const x = i(e, ["safetySettings"]);
  if (t !== void 0 && x != null) {
    let D = x;
    Array.isArray(D) && (D = D.map((O) => O)), l(t, ["setup", "safetySettings"], D);
  }
  return n;
}
function nA(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = i(t, ["config"]);
  return o != null && l(n, ["config"], eA(o, n)), n;
}
function rA(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = i(t, ["config"]);
  return o != null && l(n, ["config"], tA(o, n)), n;
}
function oA(e) {
  const t = {}, n = i(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function sA(e) {
  const t = {}, n = i(e, ["weightedPrompts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["weightedPrompts"], r);
  }
  return t;
}
function iA(e) {
  const t = {}, n = i(e, ["media"]);
  if (n != null) {
    let d = Rf(n);
    Array.isArray(d) && (d = d.map((h) => mo(h))), l(t, ["mediaChunks"], d);
  }
  const r = i(e, ["audio"]);
  r != null && l(t, ["audio"], mo(Mf(r)));
  const o = i(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const s = i(e, ["video"]);
  s != null && l(t, ["video"], mo(xf(s)));
  const a = i(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = i(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = i(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function aA(e) {
  const t = {}, n = i(e, ["media"]);
  if (n != null) {
    let d = Rf(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const r = i(e, ["audio"]);
  r != null && l(t, ["audio"], Mf(r));
  const o = i(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const s = i(e, ["video"]);
  s != null && l(t, ["video"], xf(s));
  const a = i(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = i(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = i(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function lA(e) {
  const t = {}, n = i(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const r = i(e, ["serverContent"]);
  r != null && l(t, ["serverContent"], r);
  const o = i(e, ["toolCall"]);
  o != null && l(t, ["toolCall"], o);
  const s = i(e, ["toolCallCancellation"]);
  s != null && l(t, ["toolCallCancellation"], s);
  const a = i(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], mA(a));
  const u = i(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = i(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = i(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = i(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], gA(h)), t;
}
function uA(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], zv(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Yv(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], mo(c));
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
function cA(e) {
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
function dA(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = i(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function fA(e) {
  const t = {}, n = i(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), i(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function hA(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], jv(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], Zv(s));
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
function pA(e) {
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
    Array.isArray(p) && (p = p.map((m) => Xv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = i(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = i(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = i(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function mA(e) {
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
function gA(e) {
  const t = {}, n = i(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function yA(e, t) {
  const n = {}, r = i(e, ["apiKey"]);
  if (r != null && l(n, ["apiKey"], r), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function _A(e, t) {
  const n = {}, r = i(e, ["data"]);
  if (r != null && l(n, ["data"], r), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function vA(e, t) {
  const n = {}, r = i(e, ["content"]);
  r != null && l(n, ["content"], r);
  const o = i(e, ["citationMetadata"]);
  o != null && l(n, ["citationMetadata"], AA(o));
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
function AA(e, t) {
  const n = {}, r = i(e, ["citationSources"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => s)), l(n, ["citations"], o);
  }
  return n;
}
function SA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let a = be(s);
    Array.isArray(a) && (a = a.map((u) => bn(u))), l(r, ["contents"], a);
  }
  return r;
}
function TA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["tokensInfo"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(n, ["tokensInfo"], s);
  }
  return n;
}
function EA(e, t) {
  const n = {}, r = i(e, ["values"]);
  r != null && l(n, ["values"], r);
  const o = i(e, ["statistics"]);
  return o != null && l(n, ["statistics"], wA(o)), n;
}
function wA(e, t) {
  const n = {}, r = i(e, ["truncated"]);
  r != null && l(n, ["truncated"], r);
  const o = i(e, ["token_count"]);
  return o != null && l(n, ["tokenCount"], o), n;
}
function Rr(e, t) {
  const n = {}, r = i(e, ["parts"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => kS(a))), l(n, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function bn(e, t) {
  const n = {}, r = i(e, ["parts"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => DS(a))), l(n, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function CA(e, t) {
  const n = {}, r = i(e, ["controlType"]);
  r != null && l(n, ["controlType"], r);
  const o = i(e, ["enableControlImageComputation"]);
  return o != null && l(n, ["computeControl"], o), n;
}
function IA(e, t) {
  const n = {};
  if (i(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (i(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (i(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function bA(e, t, n) {
  const r = {}, o = i(e, ["systemInstruction"]);
  t !== void 0 && o != null && l(t, ["systemInstruction"], bn(de(o)));
  const s = i(e, ["tools"]);
  if (t !== void 0 && s != null) {
    let u = s;
    Array.isArray(u) && (u = u.map((c) => Wf(c))), l(t, ["tools"], u);
  }
  const a = i(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], _S(a)), r;
}
function PA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let u = be(s);
    Array.isArray(u) && (u = u.map((c) => Rr(c))), l(r, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && IA(a), r;
}
function RA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let u = be(s);
    Array.isArray(u) && (u = u.map((c) => bn(c))), l(r, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && bA(a, r), r;
}
function xA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["totalTokens"]);
  o != null && l(n, ["totalTokens"], o);
  const s = i(e, ["cachedContentTokenCount"]);
  return s != null && l(n, ["cachedContentTokenCount"], s), n;
}
function MA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["totalTokens"]);
  return o != null && l(n, ["totalTokens"], o), n;
}
function NA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function kA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function DA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function $A(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function LA(e, t, n) {
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
  const C = i(e, ["labels"]);
  t !== void 0 && C != null && l(t, ["labels"], C);
  const P = i(e, ["editMode"]);
  t !== void 0 && P != null && l(t, ["parameters", "editMode"], P);
  const k = i(e, ["baseSteps"]);
  return t !== void 0 && k != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], k), r;
}
function UA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => BS(d))), l(r, ["instances[0]", "referenceImages"], c);
  }
  const u = i(t, ["config"]);
  return u != null && LA(u, r), r;
}
function FA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => Yo(a))), l(n, ["generatedImages"], s);
  }
  return n;
}
function qA(e, t, n) {
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
function BA(e, t, n) {
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
function GA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let d = Qi(e, s);
    Array.isArray(d) && (d = d.map((h) => h)), l(r, ["requests[]", "content"], d);
  }
  const a = i(t, ["content"]);
  a != null && Rr(de(a));
  const u = i(t, ["config"]);
  u != null && qA(u, r);
  const c = i(t, ["model"]);
  return c !== void 0 && l(r, ["requests[]", "model"], Y(e, c)), r;
}
function OA(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  let s = i(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "PREDICT") {
    const c = i(t, ["contents"]);
    if (c != null) {
      let d = Qi(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(r, ["instances[]", "content"], d);
    }
  }
  let a = i(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = i(t, ["content"]);
    c != null && l(r, ["content"], bn(de(c)));
  }
  const u = i(t, ["config"]);
  return u != null && BA(u, r, n), r;
}
function HA(e, t) {
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
function VA(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions[]", "embeddings"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => EA(u))), l(n, ["embeddings"], a);
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
function JA(e, t) {
  const n = {}, r = i(e, ["endpoint"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["deployedModelId"]);
  return o != null && l(n, ["deployedModelId"], o), n;
}
function KA(e, t) {
  const n = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["fileUri"]);
  r != null && l(n, ["fileUri"], r);
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function WA(e, t) {
  const n = {}, r = i(e, ["id"]);
  r != null && l(n, ["id"], r);
  const o = i(e, ["args"]);
  o != null && l(n, ["args"], o);
  const s = i(e, ["name"]);
  if (s != null && l(n, ["name"], s), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function zA(e, t) {
  const n = {}, r = i(e, ["allowedFunctionNames"]);
  r != null && l(n, ["allowedFunctionNames"], r);
  const o = i(e, ["mode"]);
  if (o != null && l(n, ["mode"], o), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function YA(e, t) {
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
function XA(e, t, n, r) {
  const o = {}, s = i(t, ["systemInstruction"]);
  n !== void 0 && s != null && l(n, ["systemInstruction"], Rr(de(s)));
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
  const C = i(t, ["responseSchema"]);
  C != null && l(o, ["responseSchema"], Zi(C));
  const P = i(t, ["responseJsonSchema"]);
  if (P != null && l(o, ["responseJsonSchema"], P), i(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (i(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const k = i(t, ["safetySettings"]);
  if (n !== void 0 && k != null) {
    let X = k;
    Array.isArray(X) && (X = X.map((me) => GS(me))), l(n, ["safetySettings"], X);
  }
  const R = i(t, ["tools"]);
  if (n !== void 0 && R != null) {
    let X = Cn(R);
    Array.isArray(X) && (X = X.map((me) => YS(wn(me)))), l(n, ["tools"], X);
  }
  const I = i(t, ["toolConfig"]);
  if (n !== void 0 && I != null && l(n, ["toolConfig"], WS(I)), i(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const B = i(t, ["cachedContent"]);
  n !== void 0 && B != null && l(n, ["cachedContent"], St(e, B));
  const x = i(t, ["responseModalities"]);
  x != null && l(o, ["responseModalities"], x);
  const D = i(t, ["mediaResolution"]);
  D != null && l(o, ["mediaResolution"], D);
  const O = i(t, ["speechConfig"]);
  if (O != null && l(o, ["speechConfig"], ji(O)), i(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const z = i(t, ["thinkingConfig"]);
  z != null && l(o, ["thinkingConfig"], z);
  const ne = i(t, ["imageConfig"]);
  ne != null && l(o, ["imageConfig"], ES(ne));
  const j = i(t, ["enableEnhancedCivicAnswers"]);
  if (j != null && l(o, ["enableEnhancedCivicAnswers"], j), i(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const Q = i(t, ["serviceTier"]);
  return n !== void 0 && Q != null && l(n, ["serviceTier"], Q), o;
}
function QA(e, t, n, r) {
  const o = {}, s = i(t, ["systemInstruction"]);
  n !== void 0 && s != null && l(n, ["systemInstruction"], bn(de(s)));
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
  const C = i(t, ["responseSchema"]);
  C != null && l(o, ["responseSchema"], Zi(C));
  const P = i(t, ["responseJsonSchema"]);
  P != null && l(o, ["responseJsonSchema"], P);
  const k = i(t, ["routingConfig"]);
  k != null && l(o, ["routingConfig"], k);
  const R = i(t, ["modelSelectionConfig"]);
  R != null && l(o, ["modelConfig"], R);
  const I = i(t, ["safetySettings"]);
  if (n !== void 0 && I != null) {
    let Ee = I;
    Array.isArray(Ee) && (Ee = Ee.map((Et) => Et)), l(n, ["safetySettings"], Ee);
  }
  const B = i(t, ["tools"]);
  if (n !== void 0 && B != null) {
    let Ee = Cn(B);
    Array.isArray(Ee) && (Ee = Ee.map((Et) => Wf(wn(Et)))), l(n, ["tools"], Ee);
  }
  const x = i(t, ["toolConfig"]);
  n !== void 0 && x != null && l(n, ["toolConfig"], zS(x));
  const D = i(t, ["labels"]);
  n !== void 0 && D != null && l(n, ["labels"], D);
  const O = i(t, ["cachedContent"]);
  n !== void 0 && O != null && l(n, ["cachedContent"], St(e, O));
  const z = i(t, ["responseModalities"]);
  z != null && l(o, ["responseModalities"], z);
  const ne = i(t, ["mediaResolution"]);
  ne != null && l(o, ["mediaResolution"], ne);
  const j = i(t, ["speechConfig"]);
  j != null && l(o, ["speechConfig"], ji(j));
  const Q = i(t, ["audioTimestamp"]);
  Q != null && l(o, ["audioTimestamp"], Q);
  const X = i(t, ["thinkingConfig"]);
  X != null && l(o, ["thinkingConfig"], X);
  const me = i(t, ["imageConfig"]);
  if (me != null && l(o, ["imageConfig"], wS(me)), i(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Oe = i(t, ["modelArmorConfig"]);
  n !== void 0 && Oe != null && l(n, ["modelArmorConfig"], Oe);
  const _e = i(t, ["serviceTier"]);
  return n !== void 0 && _e != null && l(n, ["serviceTier"], _e), o;
}
function nc(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let u = be(s);
    Array.isArray(u) && (u = u.map((c) => Rr(c))), l(r, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && l(r, ["generationConfig"], XA(e, a, r)), r;
}
function rc(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let u = be(s);
    Array.isArray(u) && (u = u.map((c) => bn(c))), l(r, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && l(r, ["generationConfig"], QA(e, a, r)), r;
}
function oc(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["candidates"]);
  if (o != null) {
    let h = o;
    Array.isArray(h) && (h = h.map((f) => vA(f))), l(n, ["candidates"], h);
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
function sc(e, t) {
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
function ZA(e, t, n) {
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
function jA(e, t, n) {
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
  const C = i(e, ["labels"]);
  t !== void 0 && C != null && l(t, ["labels"], C);
  const P = i(e, ["imageSize"]);
  t !== void 0 && P != null && l(t, ["parameters", "sampleImageSize"], P);
  const k = i(e, ["enhancePrompt"]);
  return t !== void 0 && k != null && l(t, ["parameters", "enhancePrompt"], k), r;
}
function eS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["config"]);
  return a != null && ZA(a, r), r;
}
function tS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["config"]);
  return a != null && jA(a, r), r;
}
function nS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => pS(u))), l(n, ["generatedImages"], a);
  }
  const s = i(e, ["positivePromptSafetyAttributes"]);
  return s != null && l(n, ["positivePromptSafetyAttributes"], Jf(s)), n;
}
function rS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => Yo(u))), l(n, ["generatedImages"], a);
  }
  const s = i(e, ["positivePromptSafetyAttributes"]);
  return s != null && l(n, ["positivePromptSafetyAttributes"], Kf(s)), n;
}
function oS(e, t, n) {
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
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Xo(f));
  const p = i(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => lT(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (i(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (i(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (i(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = i(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), r;
}
function sS(e, t, n) {
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
  t !== void 0 && v != null && l(t, ["instances[0]", "lastFrame"], ot(v));
  const w = i(e, ["referenceImages"]);
  if (t !== void 0 && w != null) {
    let R = w;
    Array.isArray(R) && (R = R.map((I) => uT(I))), l(t, ["instances[0]", "referenceImages"], R);
  }
  const C = i(e, ["mask"]);
  t !== void 0 && C != null && l(t, ["instances[0]", "mask"], aT(C));
  const P = i(e, ["compressionQuality"]);
  t !== void 0 && P != null && l(t, ["parameters", "compressionQuality"], P);
  const k = i(e, ["labels"]);
  if (t !== void 0 && k != null && l(t, ["labels"], k), i(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return r;
}
function iS(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const s = i(e, ["done"]);
  s != null && l(n, ["done"], s);
  const a = i(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = i(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], cS(u)), n;
}
function aS(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = i(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const s = i(e, ["done"]);
  s != null && l(n, ["done"], s);
  const a = i(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = i(e, ["response"]);
  return u != null && l(n, ["response"], dS(u)), n;
}
function lS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], Xo(a));
  const u = i(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], zf(u));
  const c = i(t, ["source"]);
  c != null && fS(c, r);
  const d = i(t, ["config"]);
  return d != null && oS(d, r), r;
}
function uS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["prompt"]);
  s != null && l(r, ["instances[0]", "prompt"], s);
  const a = i(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], ot(a));
  const u = i(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], Yf(u));
  const c = i(t, ["source"]);
  c != null && hS(c, r);
  const d = i(t, ["config"]);
  return d != null && sS(d, r), r;
}
function cS(e, t) {
  const n = {}, r = i(e, ["generatedSamples"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => gS(u))), l(n, ["generatedVideos"], a);
  }
  const o = i(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const s = i(e, ["raiMediaFilteredReasons"]);
  return s != null && l(n, ["raiMediaFilteredReasons"], s), n;
}
function dS(e, t) {
  const n = {}, r = i(e, ["videos"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => yS(u))), l(n, ["generatedVideos"], a);
  }
  const o = i(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const s = i(e, ["raiMediaFilteredReasons"]);
  return s != null && l(n, ["raiMediaFilteredReasons"], s), n;
}
function fS(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["image"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "image"], Xo(s));
  const a = i(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], zf(a)), r;
}
function hS(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["image"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "image"], ot(s));
  const a = i(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Yf(a)), r;
}
function pS(e, t) {
  const n = {}, r = i(e, ["_self"]);
  r != null && l(n, ["image"], CS(r));
  const o = i(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const s = i(e, ["_self"]);
  return s != null && l(n, ["safetyAttributes"], Jf(s)), n;
}
function Yo(e, t) {
  const n = {}, r = i(e, ["_self"]);
  r != null && l(n, ["image"], Vf(r));
  const o = i(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const s = i(e, ["_self"]);
  s != null && l(n, ["safetyAttributes"], Kf(s));
  const a = i(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function mS(e, t) {
  const n = {}, r = i(e, ["_self"]);
  r != null && l(n, ["mask"], Vf(r));
  const o = i(e, ["labels"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => a)), l(n, ["labels"], s);
  }
  return n;
}
function gS(e, t) {
  const n = {}, r = i(e, ["video"]);
  return r != null && l(n, ["video"], sT(r)), n;
}
function yS(e, t) {
  const n = {}, r = i(e, ["_self"]);
  return r != null && l(n, ["video"], iT(r)), n;
}
function _S(e, t) {
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
  const C = i(e, ["seed"]);
  C != null && l(n, ["seed"], C);
  const P = i(e, ["speechConfig"]);
  P != null && l(n, ["speechConfig"], P);
  const k = i(e, ["stopSequences"]);
  k != null && l(n, ["stopSequences"], k);
  const R = i(e, ["temperature"]);
  R != null && l(n, ["temperature"], R);
  const I = i(e, ["thinkingConfig"]);
  I != null && l(n, ["thinkingConfig"], I);
  const B = i(e, ["topK"]);
  B != null && l(n, ["topK"], B);
  const x = i(e, ["topP"]);
  if (x != null && l(n, ["topP"], x), i(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function vS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function AS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function SS(e, t) {
  const n = {}, r = i(e, ["authConfig"]);
  r != null && l(n, ["authConfig"], yA(r));
  const o = i(e, ["enableWidget"]);
  return o != null && l(n, ["enableWidget"], o), n;
}
function TS(e, t) {
  const n = {}, r = i(e, ["searchTypes"]);
  if (r != null && l(n, ["searchTypes"], r), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = i(e, ["timeRangeFilter"]);
  return o != null && l(n, ["timeRangeFilter"], o), n;
}
function ES(e, t) {
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
function wS(e, t) {
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
function CS(e, t) {
  const n = {}, r = i(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], $t(r));
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function Vf(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = i(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], $t(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function Xo(e, t) {
  const n = {};
  if (i(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const r = i(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], $t(r));
  const o = i(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function ot(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = i(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], $t(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function IS(e, t, n, r) {
  const o = {}, s = i(t, ["pageSize"]);
  n !== void 0 && s != null && l(n, ["_query", "pageSize"], s);
  const a = i(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = i(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = i(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], $f(e, c)), o;
}
function bS(e, t, n, r) {
  const o = {}, s = i(t, ["pageSize"]);
  n !== void 0 && s != null && l(n, ["_query", "pageSize"], s);
  const a = i(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = i(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = i(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], $f(e, c)), o;
}
function PS(e, t, n) {
  const r = {}, o = i(t, ["config"]);
  return o != null && IS(e, o, r), r;
}
function RS(e, t, n) {
  const r = {}, o = i(t, ["config"]);
  return o != null && bS(e, o, r), r;
}
function xS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["_self"]);
  if (s != null) {
    let a = Lf(s);
    Array.isArray(a) && (a = a.map((u) => ii(u))), l(n, ["models"], a);
  }
  return n;
}
function MS(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["_self"]);
  if (s != null) {
    let a = Lf(s);
    Array.isArray(a) && (a = a.map((u) => ai(u))), l(n, ["models"], a);
  }
  return n;
}
function NS(e, t) {
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
  u != null && l(n, ["tunedModelInfo"], XS(u));
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
    Array.isArray(p) && (p = p.map((m) => JA(m))), l(n, ["endpoints"], p);
  }
  const c = i(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = i(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], QS(d));
  const h = i(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = i(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function kS(e, t) {
  const n = {}, r = i(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = i(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const s = i(e, ["executableCode"]);
  s != null && l(n, ["executableCode"], s);
  const a = i(e, ["fileData"]);
  a != null && l(n, ["fileData"], KA(a));
  const u = i(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], WA(u));
  const c = i(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = i(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], _A(d));
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
function DS(e, t) {
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
function $S(e, t) {
  const n = {}, r = i(e, ["productImage"]);
  return r != null && l(n, ["image"], ot(r)), n;
}
function LS(e, t, n) {
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
function US(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["source"]);
  s != null && qS(s, r);
  const a = i(t, ["config"]);
  return a != null && LS(a, r), r;
}
function FS(e, t) {
  const n = {}, r = i(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => Yo(s))), l(n, ["generatedImages"], o);
  }
  return n;
}
function qS(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["personImage"]);
  t !== void 0 && s != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], ot(s));
  const a = i(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => $S(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return r;
}
function BS(e, t) {
  const n = {}, r = i(e, ["referenceImage"]);
  r != null && l(n, ["referenceImage"], ot(r));
  const o = i(e, ["referenceId"]);
  o != null && l(n, ["referenceId"], o);
  const s = i(e, ["referenceType"]);
  s != null && l(n, ["referenceType"], s);
  const a = i(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], NS(a));
  const u = i(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], CA(u));
  const c = i(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = i(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function Jf(e, t) {
  const n = {}, r = i(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = i(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const s = i(e, ["contentType"]);
  return s != null && l(n, ["contentType"], s), n;
}
function Kf(e, t) {
  const n = {}, r = i(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = i(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const s = i(e, ["contentType"]);
  return s != null && l(n, ["contentType"], s), n;
}
function GS(e, t) {
  const n = {}, r = i(e, ["category"]);
  if (r != null && l(n, ["category"], r), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = i(e, ["threshold"]);
  return o != null && l(n, ["threshold"], o), n;
}
function OS(e, t) {
  const n = {}, r = i(e, ["image"]);
  return r != null && l(n, ["image"], ot(r)), n;
}
function HS(e, t, n) {
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
function VS(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["source"]);
  s != null && KS(s, r);
  const a = i(t, ["config"]);
  return a != null && HS(a, r), r;
}
function JS(e, t) {
  const n = {}, r = i(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((s) => mS(s))), l(n, ["generatedMasks"], o);
  }
  return n;
}
function KS(e, t, n) {
  const r = {}, o = i(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const s = i(e, ["image"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "image"], ot(s));
  const a = i(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], OS(a)), r;
}
function WS(e, t) {
  const n = {}, r = i(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = i(e, ["functionCallingConfig"]);
  o != null && l(n, ["functionCallingConfig"], zA(o));
  const s = i(e, ["includeServerSideToolInvocations"]);
  return s != null && l(n, ["includeServerSideToolInvocations"], s), n;
}
function zS(e, t) {
  const n = {}, r = i(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = i(e, ["functionCallingConfig"]);
  if (o != null && l(n, ["functionCallingConfig"], o), i(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function YS(e, t) {
  const n = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const r = i(e, ["computerUse"]);
  r != null && l(n, ["computerUse"], r);
  const o = i(e, ["fileSearch"]);
  o != null && l(n, ["fileSearch"], o);
  const s = i(e, ["googleSearch"]);
  s != null && l(n, ["googleSearch"], TS(s));
  const a = i(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], SS(a));
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
function Wf(e, t) {
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
    Array.isArray(m) && (m = m.map((g) => YA(g))), l(n, ["functionDeclarations"], m);
  }
  const h = i(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = i(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = i(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function XS(e, t) {
  const n = {}, r = i(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const s = i(e, ["updateTime"]);
  return s != null && l(n, ["updateTime"], s), n;
}
function QS(e, t) {
  const n = {}, r = i(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const s = i(e, ["updateTime"]);
  return s != null && l(n, ["updateTime"], s), n;
}
function ZS(e, t, n) {
  const r = {}, o = i(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = i(e, ["description"]);
  t !== void 0 && s != null && l(t, ["description"], s);
  const a = i(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function jS(e, t, n) {
  const r = {}, o = i(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = i(e, ["description"]);
  t !== void 0 && s != null && l(t, ["description"], s);
  const a = i(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function eT(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "name"], Y(e, o));
  const s = i(t, ["config"]);
  return s != null && ZS(s, r), r;
}
function tT(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["config"]);
  return s != null && jS(s, r), r;
}
function nT(e, t, n) {
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
function rT(e, t, n) {
  const r = {}, o = i(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const s = i(t, ["image"]);
  s != null && l(r, ["instances[0]", "image"], ot(s));
  const a = i(t, ["upscaleFactor"]);
  a != null && l(r, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = i(t, ["config"]);
  return u != null && nT(u, r), r;
}
function oT(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((a) => Yo(a))), l(n, ["generatedImages"], s);
  }
  return n;
}
function sT(e, t) {
  const n = {}, r = i(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = i(e, ["encodedVideo"]);
  o != null && l(n, ["videoBytes"], $t(o));
  const s = i(e, ["encoding"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function iT(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["uri"], r);
  const o = i(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["videoBytes"], $t(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function aT(e, t) {
  const n = {}, r = i(e, ["image"]);
  r != null && l(n, ["_self"], ot(r));
  const o = i(e, ["maskMode"]);
  return o != null && l(n, ["maskMode"], o), n;
}
function lT(e, t) {
  const n = {}, r = i(e, ["image"]);
  r != null && l(n, ["image"], Xo(r));
  const o = i(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function uT(e, t) {
  const n = {}, r = i(e, ["image"]);
  r != null && l(n, ["image"], ot(r));
  const o = i(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function zf(e, t) {
  const n = {}, r = i(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = i(e, ["videoBytes"]);
  o != null && l(n, ["encodedVideo"], $t(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["encoding"], s), n;
}
function Yf(e, t) {
  const n = {}, r = i(e, ["uri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = i(e, ["videoBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], $t(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function cT(e, t) {
  const n = {}, r = i(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["displayName"], r), n;
}
function dT(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && cT(n, t), t;
}
function fT(e, t) {
  const n = {}, r = i(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function hT(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = i(e, ["config"]);
  return r != null && fT(r, t), t;
}
function pT(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function mT(e, t) {
  const n = {}, r = i(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((a) => a)), l(t, ["customMetadata"], s);
  }
  const o = i(e, ["chunkingConfig"]);
  return t !== void 0 && o != null && l(t, ["chunkingConfig"], o), n;
}
function gT(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = i(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = i(e, ["done"]);
  o != null && l(t, ["done"], o);
  const s = i(e, ["error"]);
  s != null && l(t, ["error"], s);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], _T(a)), t;
}
function yT(e) {
  const t = {}, n = i(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = i(e, ["fileName"]);
  r != null && l(t, ["fileName"], r);
  const o = i(e, ["config"]);
  return o != null && mT(o, t), t;
}
function _T(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = i(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = i(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function vT(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function AT(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && vT(n, t), t;
}
function ST(e) {
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
function Xf(e, t) {
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
function TT(e) {
  const t = {}, n = i(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = i(e, ["config"]);
  return r != null && Xf(r, t), t;
}
function ET(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var wT = "Content-Type", CT = "X-Server-Timeout", IT = "User-Agent", li = "x-goog-api-client", bT = "google-genai-sdk/1.50.1", PT = "v1beta1", RT = "v1beta", xT = /* @__PURE__ */ new Set(["us", "eu"]), MT = 5, NT = [
  408,
  429,
  500,
  502,
  503,
  504
], kT = class {
  constructor(e) {
    var t, n, r;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const o = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const s = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !s ? (o.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? o.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && xT.has(this.clientOptions.location) ? o.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (o.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), o.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : PT;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), o.apiVersion = (r = this.clientOptions.apiVersion) !== null && r !== void 0 ? r : RT, o.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return t && t.extraBody !== null && DT(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await ic(r), new ri(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await ic(r), this.processStreamResponse(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  processStreamResponse(e) {
    return nt(this, arguments, function* () {
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
              if (v >= 400 && v < 600) throw new Of({
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
      throw NT.includes(s.status) ? new Error(`Retryable HTTP Error: ${s.statusText}`) : new Nl.AbortError(`Non-retryable exception ${s.statusText} sending request`);
    };
    return (0, Nl.default)(o, { retries: ((n = r.attempts) !== null && n !== void 0 ? n : MT) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = bT + " " + this.clientOptions.userAgentExtra;
    return e[IT] = t, e[li] = t, e[wT] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [r, o] of Object.entries(e.headers)) n.append(r, o);
      e.timeout && e.timeout > 0 && n.append(CT, String(Math.ceil(e.timeout / 1e3)));
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
    n != null && Xf(n, h);
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
async function ic(e) {
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
    throw n >= 400 && n < 600 ? new Of({
      message: o,
      status: n
    }) : new Error(o);
  }
}
function DT(e, t) {
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
var $T = "mcp_used/unknown", LT = !1;
function Qf(e) {
  for (const t of e)
    if (UT(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return LT;
}
function Zf(e) {
  var t;
  e[li] = (((t = e[li]) !== null && t !== void 0 ? t : "") + ` ${$T}`).trimStart();
}
function UT(e) {
  return e !== null && typeof e == "object" && e instanceof qT;
}
function FT(e) {
  return nt(this, arguments, function* (n, r = 100) {
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
var qT = class jf {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new jf(t, n);
  }
  async initialize() {
    var t, n, r, o;
    if (this.mcpTools.length > 0) return;
    const s = {}, a = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, rt(FT(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
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
    return await this.initialize(), jy(this.mcpTools, this.config);
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
async function BT(e, t, n) {
  const r = new Vy();
  let o;
  n.data instanceof Blob ? o = JSON.parse(await n.data.text()) : o = JSON.parse(n.data), Object.assign(r, o), t(r);
}
var GT = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), o = this.apiClient.getApiVersion(), s = VT(this.apiClient.getDefaultHeaders()), a = `${r}/ws/google.ai.generativelanguage.${o}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        BT(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(a, HT(s), p);
    m.connect(), await c;
    const g = { setup: { model: Y(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new OT(m, this.apiClient);
  }
}, OT = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = sA(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = oA(e);
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
function HT(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function VT(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var JT = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function KT(e, t, n) {
  const r = new Hy();
  let o;
  n.data instanceof Blob ? o = await n.data.text() : n.data instanceof ArrayBuffer ? o = new TextDecoder().decode(n.data) : o = n.data;
  const s = JSON.parse(o);
  if (e.isVertexAI()) {
    const a = lA(s);
    Object.assign(r, a);
  } else Object.assign(r, s);
  t(r);
}
var WT = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new GT(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, r, o, s, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && Qf(e.config.tools) && Zf(h);
    const f = QT(h);
    if (this.apiClient.isVertexAI()) {
      const x = this.apiClient.getProject(), D = this.apiClient.getLocation(), O = this.apiClient.getApiKey(), z = !!x && !!D || !!O;
      this.apiClient.getCustomBaseUrl() && !z ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const x = this.apiClient.getApiKey();
      let D = "BidiGenerateContent", O = "key";
      x?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), D = "BidiGenerateContentConstrained", O = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${D}?${O}=${x}`;
    }
    let p = () => {
    };
    const m = new Promise((x) => {
      p = x;
    }), g = e.callbacks, _ = function() {
      var x;
      (x = g?.onopen) === null || x === void 0 || x.call(g), p({});
    }, v = this.apiClient, w = {
      onopen: _,
      onmessage: (x) => {
        KT(v, g.onmessage, x);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(x) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(x) {
      }
    }, C = this.webSocketFactory.create(d, XT(f), w);
    C.connect(), await m;
    let P = Y(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && P.startsWith("publishers/")) {
      const x = this.apiClient.getProject(), D = this.apiClient.getLocation();
      x && D && (P = `projects/${x}/locations/${D}/` + P);
    }
    let k = {};
    this.apiClient.isVertexAI() && ((r = e.config) === null || r === void 0 ? void 0 : r.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [Po.AUDIO] } : e.config.responseModalities = [Po.AUDIO]), !((o = e.config) === null || o === void 0) && o.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const R = (a = (s = e.config) === null || s === void 0 ? void 0 : s.tools) !== null && a !== void 0 ? a : [], I = [];
    for (const x of R) if (this.isCallableTool(x)) {
      const D = x;
      I.push(await D.tool());
    } else I.push(x);
    I.length > 0 && (e.config.tools = I);
    const B = {
      model: P,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? k = rA(this.apiClient, B) : k = nA(this.apiClient, B), delete k.config, C.send(JSON.stringify(k)), new YT(C, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, zT = { turnComplete: !0 }, YT = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = be(t.turns), e.isVertexAI() || (n = n.map((r) => Rr(r)));
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
      if (!e.isVertexAI() && !("id" in r)) throw new Error(JT);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, zT), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: aA(e) } : t = { realtimeInput: iA(e) }, this.conn.send(JSON.stringify(t));
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
function XT(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function QT(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var ac = 10;
function lc(e) {
  var t, n, r;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let o = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (_n(a)) {
    o = !0;
    break;
  }
  if (!o) return !0;
  const s = (r = e?.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls;
  return s && (s < 0 || !Number.isInteger(s)) || s == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", s), !0) : !1;
}
function _n(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function ZT(e) {
  var t, n, r;
  return (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((o) => _n(o))) !== null && r !== void 0 ? r : !1;
}
function uc(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((r, o) => {
    if (_n(r)) return;
    const s = r;
    s.functionDeclarations && s.functionDeclarations.length > 0 && n.push(o);
  }), n;
}
function cc(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var jT = class extends At {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = be(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = be(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const r = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: Ro.EMBED_CONTENT
        });
        return await this.embedContentInternal(r);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: Ro.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, r, o, s, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !ZT(t) || lc(t.config)) return await this.generateContentInternal(u);
      const c = uc(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, h;
      const f = be(u.contents), p = (o = (r = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && o !== void 0 ? o : ac;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const v of (a = (s = t.config) === null || s === void 0 ? void 0 : s.tools) !== null && a !== void 0 ? a : []) if (_n(v)) {
          const w = await v.callTool(d.functionCalls);
          _.push(...w);
        }
        m++, h = {
          role: "user",
          parts: _
        }, u.contents = be(u.contents), u.contents.push(g), u.contents.push(h), cc(u.config) && (f.push(g), f.push(h));
      }
      return cc(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, r, o, s, a;
      if (this.maybeMoveToResponseJsonSchem(t), lc(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = uc(t);
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
      return new Zt(vt.PAGED_ITEM_MODELS, (o) => this.listInternal(o), await this.listInternal(r), r);
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
    const s = await Promise.all(o.map(async (u) => _n(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: s })
    };
    if (a.config.tools = s, e.config && e.config.tools && Qf(e.config.tools)) {
      const u = (r = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && r !== void 0 ? r : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), Zf(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, r;
    const o = /* @__PURE__ */ new Map();
    for (const s of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (_n(s)) {
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
    const o = (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && r !== void 0 ? r : ac;
    let s = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return nt(this, arguments, function* () {
        for (var f, p, m, g, _, v; a < o; ) {
          s && (a++, s = !1);
          const k = yield J(c.processParamsMaybeAddMcpUsage(h)), R = yield J(c.generateContentStreamInternal(k)), I = [], B = [];
          try {
            for (var w = !0, C = (p = void 0, rt(R)), P; P = yield J(C.next()), f = P.done, !f; w = !0) {
              g = P.value, w = !1;
              const x = g;
              if (yield yield J(x), x.candidates && (!((_ = x.candidates[0]) === null || _ === void 0) && _.content)) {
                B.push(x.candidates[0].content);
                for (const D of (v = x.candidates[0].content.parts) !== null && v !== void 0 ? v : []) if (a < o && D.functionCall) {
                  if (!D.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(D.functionCall.name)) {
                    const O = yield J(d.get(D.functionCall.name).callTool([D.functionCall]));
                    I.push(...O);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${D.functionCall.name}`);
                }
              }
            }
          } catch (x) {
            p = { error: x };
          } finally {
            try {
              !w && !f && (m = C.return) && (yield J(m.call(C)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (I.length > 0) {
            s = !0;
            const x = new Kn();
            x.candidates = [{ content: {
              role: "user",
              parts: I
            } }], yield yield J(x);
            const D = [];
            D.push(...B), D.push({
              role: "user",
              parts: I
            }), h.contents = be(h.contents).concat(D);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = rc(this.apiClient, e);
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
        const h = sc(d), f = new Kn();
        return Object.assign(f, h), f;
      });
    } else {
      const c = nc(this.apiClient, e);
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
        const h = oc(d), f = new Kn();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = rc(this.apiClient, e);
      return a = $("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), s.then(function(d) {
        return nt(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = rt(d), v; v = yield J(_.next()), h = v.done, !h; g = !0) {
              m = v.value, g = !1;
              const w = m, C = sc(yield J(w.json()), e);
              C.sdkHttpResponse = { headers: w.headers };
              const P = new Kn();
              Object.assign(P, C), yield yield J(P);
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
      const c = nc(this.apiClient, e);
      return a = $("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }), s.then(function(d) {
        return nt(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = rt(d), v; v = yield J(_.next()), h = v.done, !h; g = !0) {
              m = v.value, g = !1;
              const w = m, C = oc(yield J(w.json()), e);
              C.sdkHttpResponse = { headers: w.headers };
              const P = new Kn();
              Object.assign(P, C), yield yield J(P);
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
      const c = OA(this.apiClient, e, e);
      return a = $(t_(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
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
        const h = VA(d, e), f = new Lu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = GA(this.apiClient, e);
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
        const h = HA(d), f = new Lu();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = tS(this.apiClient, e);
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
        const h = rS(d), f = new Uu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = eS(this.apiClient, e);
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
        const h = nS(d), f = new Uu();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = UA(this.apiClient, e);
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
        const c = FA(u), d = new xy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = rT(this.apiClient, e);
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
        const c = oT(u), d = new My();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = US(this.apiClient, e);
      return o = $("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = FS(u), d = new Ny();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = VS(this.apiClient, e);
      return o = $("{model}:predict", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = JS(u), d = new ky();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = AS(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => ai(d));
    } else {
      const c = vS(this.apiClient, e);
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
      const c = RS(this.apiClient, e);
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
        const h = MS(d), f = new Fu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = PS(this.apiClient, e);
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
        const h = xS(d), f = new Fu();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = tT(this.apiClient, e);
      return a = $("{model}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => ai(d));
    } else {
      const c = eT(this.apiClient, e);
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
      const c = kA(this.apiClient, e);
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
        const h = $A(d), f = new qu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = NA(this.apiClient, e);
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
        const h = DA(d), f = new qu();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = RA(this.apiClient, e);
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
        const h = MA(d), f = new Bu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = PA(this.apiClient, e);
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
        const h = xA(d), f = new Bu();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = SA(this.apiClient, e);
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
        const c = TA(u), d = new Dy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = uS(this.apiClient, e);
      return a = $("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s.then((d) => {
        const h = aS(d), f = new Gu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = lS(this.apiClient, e);
      return a = $("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), s.then((d) => {
        const h = iS(d), f = new Gu();
        return Object.assign(f, h), f;
      });
    }
  }
}, eE = class extends At {
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
      const c = wy(e);
      return a = $("{operationName}", c._url), u = c._query, delete c._url, delete c._query, s = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), s;
    } else {
      const c = Ey(e);
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
      const a = gy(e);
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
function dc(e) {
  const t = {};
  if (i(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function tE(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function nE(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function rE(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => fE(s))), l(t, ["parts"], o);
  }
  const r = i(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function oE(e, t, n) {
  const r = {}, o = i(t, ["expireTime"]);
  n !== void 0 && o != null && l(n, ["expireTime"], o);
  const s = i(t, ["newSessionExpireTime"]);
  n !== void 0 && s != null && l(n, ["newSessionExpireTime"], s);
  const a = i(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = i(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], dE(e, u));
  const c = i(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), r;
}
function sE(e, t) {
  const n = {}, r = i(t, ["config"]);
  return r != null && l(n, ["config"], oE(e, r, n)), n;
}
function iE(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = i(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function aE(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = i(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = i(e, ["name"]);
  if (o != null && l(t, ["name"], o), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function lE(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], tE(n));
  const r = i(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function uE(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = i(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function cE(e, t) {
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], rE(de(g)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = Cn(_);
    Array.isArray(x) && (x = x.map((D) => mE(wn(D)))), l(t, ["setup", "tools"], x);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], pE(v));
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], dc(w));
  const C = i(e, ["outputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "outputAudioTranscription"], dc(C));
  const P = i(e, ["realtimeInputConfig"]);
  t !== void 0 && P != null && l(t, ["setup", "realtimeInputConfig"], P);
  const k = i(e, ["contextWindowCompression"]);
  t !== void 0 && k != null && l(t, ["setup", "contextWindowCompression"], k);
  const R = i(e, ["proactivity"]);
  if (t !== void 0 && R != null && l(t, ["setup", "proactivity"], R), i(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const I = i(e, ["avatarConfig"]);
  t !== void 0 && I != null && l(t, ["setup", "avatarConfig"], I);
  const B = i(e, ["safetySettings"]);
  if (t !== void 0 && B != null) {
    let x = B;
    Array.isArray(x) && (x = x.map((D) => hE(D))), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function dE(e, t) {
  const n = {}, r = i(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = i(t, ["config"]);
  return o != null && l(n, ["config"], cE(o, n)), n;
}
function fE(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = i(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = i(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const s = i(e, ["fileData"]);
  s != null && l(t, ["fileData"], iE(s));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], aE(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], nE(c));
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
function hE(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = i(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function pE(e) {
  const t = {}, n = i(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), i(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function mE(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = i(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = i(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], uE(o));
  const s = i(e, ["googleMaps"]);
  s != null && l(t, ["googleMaps"], lE(s));
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
function gE(e) {
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
function yE(e, t) {
  let n = null;
  const r = e.bidiGenerateContentSetup;
  if (typeof r == "object" && r !== null && "setup" in r) {
    const s = r.setup;
    typeof s == "object" && s !== null ? (e.bidiGenerateContentSetup = s, n = s) : delete e.bidiGenerateContentSetup;
  } else r !== void 0 && delete e.bidiGenerateContentSetup;
  const o = e.fieldMask;
  if (n) {
    const s = gE(n);
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
var _E = class extends At {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = sE(this.apiClient, e);
      o = $("auth_tokens", a._url), s = a._query, delete a.config, delete a._url, delete a._query;
      const u = yE(a, e.config);
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
function vE(e, t) {
  const n = {}, r = i(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function AE(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = i(e, ["config"]);
  return r != null && vE(r, t), t;
}
function SE(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function TE(e, t) {
  const n = {}, r = i(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = i(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function EE(e) {
  const t = {}, n = i(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const r = i(e, ["config"]);
  return r != null && TE(r, t), t;
}
function wE(e) {
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
var CE = class extends At {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Zt(vt.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = SE(e);
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
      const s = AE(e);
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
      const a = EE(e);
      return o = $("{parent}/documents", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = wE(u), d = new $y();
        return Object.assign(d, c), d;
      });
    }
  }
}, IE = class extends At {
  constructor(e, t = new CE(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Zt(vt.PAGED_ITEM_FILE_SEARCH_STORES, (r) => this.listInternal(r), await this.listInternal(n), n);
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
      const a = dT(e);
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
      const a = pT(e);
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
      const s = hT(e);
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
      const a = AT(e);
      return o = $("fileSearchStores", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = ST(u), d = new Ly();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = TT(e);
      return o = $("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = ET(u), d = new Uy();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = yT(e);
      return o = $("{file_search_store_name}:importFile", a._url), s = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = gT(u), d = new Fy();
        return Object.assign(d, c), d;
      });
    }
  }
}, eh = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return eh = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
}, bE = () => eh();
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
}, ze = class extends Error {
}, Xe = class di extends ze {
  constructor(t, n, r, o) {
    super(`${di.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.error = n;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Qo({
      message: r,
      cause: ci(n)
    });
    const s = n;
    return t === 400 ? new nh(t, s, r, o) : t === 401 ? new rh(t, s, r, o) : t === 403 ? new oh(t, s, r, o) : t === 404 ? new sh(t, s, r, o) : t === 409 ? new ih(t, s, r, o) : t === 422 ? new ah(t, s, r, o) : t === 429 ? new lh(t, s, r, o) : t >= 500 ? new uh(t, s, r, o) : new di(t, s, r, o);
  }
}, fi = class extends Xe {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Qo = class extends Xe {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, th = class extends Qo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, nh = class extends Xe {
}, rh = class extends Xe {
}, oh = class extends Xe {
}, sh = class extends Xe {
}, ih = class extends Xe {
}, ah = class extends Xe {
}, lh = class extends Xe {
}, uh = class extends Xe {
}, PE = /^[a-z][a-z0-9+.-]*:/i, RE = (e) => PE.test(e), hi = (e) => (hi = Array.isArray, hi(e)), fc = hi;
function hc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function xE(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var ME = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new ze(`${e} must be an integer`);
  if (t < 0) throw new ze(`${e} must be a positive integer`);
  return t;
}, NE = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, kE = (e) => new Promise((t) => setTimeout(t, e));
function DE() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function ch(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function $E(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return ch({
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
function dh(e) {
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
async function LE(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const r = e.getReader(), o = r.cancel();
  r.releaseLock(), await o;
}
var UE = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function FE(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new ze(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var qE = "0.0.1", fh = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Rs(e, t, n) {
  return fh(), new File(e, t ?? "unknown_file", n);
}
function BE(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var GE = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", hh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", OE = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && hh(e), HE = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function VE(e, t, n) {
  if (fh(), e = await e, OE(e))
    return e instanceof File ? e : Rs([await e.arrayBuffer()], e.name);
  if (HE(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Rs(await pi(o), t, n);
  }
  const r = await pi(e);
  if (t || (t = BE(e)), !n?.type) {
    const o = r.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof o == "string" && (n = Object.assign(Object.assign({}, n), { type: o }));
  }
  return Rs(r, t, n);
}
async function pi(e) {
  var t, n, r, o, s;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (hh(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (GE(e)) try {
    for (var u = !0, c = rt(e), d; d = await c.next(), t = d.done, !t; u = !0) {
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
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${JE(e)}`);
  }
  return a;
}
function JE(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ta = class {
  constructor(e) {
    this._client = e;
  }
};
ta._key = [];
function ph(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var pc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), KE = (e = ph) => (function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const s = [], a = n.reduce((h, f, p) => {
    var m, g, _;
    /[?#]/.test(f) && (o = !0);
    const v = r[p];
    let w = (o ? encodeURIComponent : e)("" + v);
    return p !== r.length && (v == null || typeof v == "object" && v.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = v.hasOwnProperty) !== null && m !== void 0 ? m : pc)) !== null && g !== void 0 ? g : pc)) === null || _ === void 0 ? void 0 : _.toString)) && (w = v + "", s.push({
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
    throw new ze(`Path parameters result in path with invalid segments:
${s.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), Ze = /* @__PURE__ */ KE(ph), mh = class extends ta {
  create(e, t) {
    var n;
    const { api_version: r = this._client.apiVersion } = e, o = kt(e, ["api_version"]);
    if ("model" in o && "agent_config" in o) throw new ze("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in o && "generation_config" in o) throw new ze("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(Ze`/${r}/interactions`, Object.assign(Object.assign({ body: o }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(Ze`/${r}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.post(Ze`/${r}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var r;
    const o = t ?? {}, { api_version: s = this._client.apiVersion } = o, a = kt(o, ["api_version"]);
    return this._client.get(Ze`/${s}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (r = t?.stream) !== null && r !== void 0 ? r : !1 }));
  }
};
mh._key = Object.freeze(["interactions"]);
var gh = class extends mh {
}, yh = class extends ta {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: r } = e, o = kt(e, ["api_version", "webhook_id"]);
    return this._client.post(Ze`/${n}/webhooks`, Object.assign({
      query: { webhook_id: r },
      body: o
    }, t));
  }
  update(e, t, n) {
    const { api_version: r = this._client.apiVersion, update_mask: o } = t, s = kt(t, ["api_version", "update_mask"]);
    return this._client.patch(Ze`/${r}/webhooks/${e}`, Object.assign({
      query: { update_mask: o },
      body: s
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: r = this._client.apiVersion } = n, o = kt(n, ["api_version"]);
    return this._client.get(Ze`/${r}/webhooks`, Object.assign({ query: o }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(Ze`/${r}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.get(Ze`/${r}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: r = this._client.apiVersion, body: o } = t ?? {};
    return this._client.post(Ze`/${r}/webhooks/${e}:ping`, Object.assign({ body: o }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const r = t ?? {}, { api_version: o = this._client.apiVersion } = r, s = kt(r, ["api_version"]);
    return this._client.post(Ze`/${o}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: s }, n));
  }
};
yh._key = Object.freeze(["webhooks"]);
var _h = class extends yh {
};
function WE(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var Zr;
function na(e) {
  let t;
  return (Zr ?? (t = new globalThis.TextEncoder(), Zr = t.encode.bind(t)))(e);
}
var jr;
function mc(e) {
  let t;
  return (jr ?? (t = new globalThis.TextDecoder(), jr = t.decode.bind(t)))(e);
}
var Zo = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? na(e) : e;
    this.buffer = WE([this.buffer, n]);
    const r = [];
    let o;
    for (; (o = zE(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (o.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = o.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (o.index !== this.carriageReturnIndex + 1 || o.carriage)) {
        r.push(mc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const s = this.carriageReturnIndex !== null ? o.preceding - 1 : o.preceding, a = mc(this.buffer.subarray(0, s));
      r.push(a), this.buffer = this.buffer.subarray(o.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), r;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Zo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Zo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function zE(e, t) {
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
var Mo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, gc = (e, t, n) => {
  if (e) {
    if (xE(Mo, e)) return e;
    Se(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Mo))}`);
  }
};
function jn() {
}
function eo(e, t, n) {
  return !t || Mo[e] > Mo[n] ? jn : t[e].bind(t);
}
var YE = {
  error: jn,
  warn: jn,
  info: jn,
  debug: jn
}, yc = /* @__PURE__ */ new WeakMap();
function Se(e) {
  var t;
  const n = e.logger, r = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return YE;
  const o = yc.get(n);
  if (o && o[0] === r) return o[1];
  const s = {
    error: eo("error", n, r),
    warn: eo("warn", n, r),
    info: eo("info", n, r),
    debug: eo("debug", n, r)
  };
  return yc.set(n, [r, s]), s;
}
var Bt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), XE = class er {
  constructor(t, n, r) {
    this.iterator = t, this.controller = n, this.client = r;
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const s = r ? Se(r) : console;
    function a() {
      return nt(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new ze("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = rt(QE(t, n)), _; _ = yield J(g.next()), c = _.done, !c; m = !0) {
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
    return new er(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    function s() {
      return nt(this, arguments, function* () {
        var c, d, h, f;
        const p = new Zo(), m = dh(t);
        try {
          for (var g = !0, _ = rt(m), v; v = yield J(_.next()), c = v.done, !c; g = !0) {
            f = v.value, g = !1;
            const w = f;
            for (const C of p.decode(w)) yield yield J(C);
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
      return nt(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new ze("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = rt(s()), _; _ = yield J(g.next()), c = _.done, !c; m = !0) {
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
    return new er(a, n, r);
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
    return [new er(() => o(t), this.controller, this.client), new er(() => o(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return ch({
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
function QE(e, t) {
  return nt(this, arguments, function* () {
    var r, o, s, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new ze("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new ze("Attempted to iterate over a response with no body");
    const u = new jE(), c = new Zo(), d = dh(e.body);
    try {
      for (var h = !0, f = rt(ZE(d)), p; p = yield J(f.next()), r = p.done, !r; h = !0) {
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
function ZE(e) {
  return nt(this, arguments, function* () {
    var n, r, o, s;
    try {
      for (var a = !0, u = rt(e), c; c = yield J(u.next()), n = c.done, !n; a = !0) {
        s = c.value, a = !1;
        const d = s;
        d != null && (yield yield J(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? na(d) : d));
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
var jE = class {
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
    let [t, n, r] = ew(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function ew(e, t) {
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
async function tw(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: s } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return Se(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : XE.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return Se(e).debug(`[${r}] response parsed`, Bt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - s
  })), a;
}
var nw = class vh extends Promise {
  constructor(t, n, r = tw) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, this.client = t;
  }
  _thenUnwrap(t) {
    return new vh(this.client, this.responsePromise, async (n, r) => t(await this.parseResponse(n, r), r));
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
}, Ah = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* rw(e) {
  if (!e) return;
  if (Ah in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const s of o) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : fc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const s = fc(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of s)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var Wn = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [s, a] of rw(r)) {
      const u = s.toLowerCase();
      o.has(u) || (t.delete(s), o.add(u)), a === null ? (t.delete(s), n.add(u)) : (t.append(s, a), n.delete(u));
    }
  }
  return {
    [Ah]: !0,
    values: t,
    nulls: n
  };
}, xs = (e) => {
  var t, n, r, o, s;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((s = (o = (r = globalThis.Deno.env) === null || r === void 0 ? void 0 : r.get) === null || o === void 0 ? void 0 : o.call(r, e)) === null || s === void 0 ? void 0 : s.trim()) || void 0;
}, Sh, Th = class Eh {
  constructor(t) {
    var n, r, o, s, a, u, c, { baseURL: d = xs("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = xs("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = kt(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (r = m.timeout) !== null && r !== void 0 ? r : Eh.DEFAULT_TIMEOUT, this.logger = (o = m.logger) !== null && o !== void 0 ? o : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (a = (s = gc(m.logLevel, "ClientOptions.logLevel", this)) !== null && s !== void 0 ? s : gc(xs("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : DE(), this.encoder = UE, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = Wn([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return Wn([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return Wn([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return FE(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${qE}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${bE()}`;
  }
  makeStatusError(t, n, r, o) {
    return Xe.generate(t, n, r, o);
  }
  buildURL(t, n, r) {
    const o = !this.baseURLOverridden() && r || this.baseURL, s = RE(t) ? new URL(t) : new URL(o + (o.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(s.searchParams);
    return (!hc(a) || !hc(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (s.search = this.stringifyQuery(n)), s.toString();
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
    return new nw(this, this.makeRequest(t, n, void 0));
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
    if (Se(this).debug(`[${p}] sending request`, Bt({
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
      const k = ui(v) || /timed? ?out/i.test(String(v) + ("cause" in v ? String(v.cause) : ""));
      if (n)
        return Se(this).info(`[${p}] connection ${k ? "timed out" : "failed"} - ${P}`), Se(this).debug(`[${p}] connection ${k ? "timed out" : "failed"} (${P})`, Bt({
          retryOfRequestLogID: r,
          url: h,
          durationMs: w - g,
          message: v.message
        })), this.retryRequest(u, n, r ?? p);
      throw Se(this).info(`[${p}] connection ${k ? "timed out" : "failed"} - error; no more retries left`), Se(this).debug(`[${p}] connection ${k ? "timed out" : "failed"} (error; no more retries left)`, Bt({
        retryOfRequestLogID: r,
        url: h,
        durationMs: w - g,
        message: v.message
      })), k ? new th() : new Qo({ cause: v });
    }
    const C = `[${p}${m}] ${d.method} ${h} ${v.ok ? "succeeded" : "failed"} with status ${v.status} in ${w - g}ms`;
    if (!v.ok) {
      const P = await this.shouldRetry(v);
      if (n && P) {
        const x = `retrying, ${n} attempts remaining`;
        return await LE(v.body), Se(this).info(`${C} - ${x}`), Se(this).debug(`[${p}] response error (${x})`, Bt({
          retryOfRequestLogID: r,
          url: v.url,
          status: v.status,
          headers: v.headers,
          durationMs: w - g
        })), this.retryRequest(u, n, r ?? p, v.headers);
      }
      const k = P ? "error; no more retries left" : "error; not retryable";
      Se(this).info(`${C} - ${k}`);
      const R = await v.text().catch((x) => ci(x).message), I = NE(R), B = I ? void 0 : R;
      throw Se(this).debug(`[${p}] response error (${k})`, Bt({
        retryOfRequestLogID: r,
        url: v.url,
        status: v.status,
        headers: v.headers,
        message: B,
        durationMs: Date.now() - g
      })), this.makeStatusError(v.status, I, B, v.headers);
    }
    return Se(this).info(C), Se(this).debug(`[${p}] response start`, Bt({
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
    const s = n || {}, { signal: a, method: u } = s, c = kt(s, ["signal", "method"]), d = this._makeAbort(o);
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
    return await kE(a), this.makeRequest(t, n - 1, r);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const s = n - t;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var r, o, s;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = a, f = this.buildURL(c, d, h);
    "timeout" in a && ME("timeout", a.timeout), a.timeout = (r = a.timeout) !== null && r !== void 0 ? r : this.timeout;
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
    let u = Wn([
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
    const r = Wn([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: $E(t)
    } : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: r
    });
  }
};
Th.DEFAULT_TIMEOUT = 6e4;
var ue = class extends Th {
  constructor() {
    super(...arguments), this.interactions = new gh(this), this.webhooks = new _h(this);
  }
};
Sh = ue;
ue.GeminiNextGenAPIClient = Sh;
ue.GeminiNextGenAPIClientError = ze;
ue.APIError = Xe;
ue.APIConnectionError = Qo;
ue.APIConnectionTimeoutError = th;
ue.APIUserAbortError = fi;
ue.NotFoundError = sh;
ue.ConflictError = ih;
ue.RateLimitError = lh;
ue.BadRequestError = nh;
ue.AuthenticationError = rh;
ue.InternalServerError = uh;
ue.PermissionDeniedError = oh;
ue.UnprocessableEntityError = ah;
ue.toFile = VE;
ue.Interactions = gh;
ue.Webhooks = _h;
function ow(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function sw(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function iw(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function aw(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function lw(e, t, n) {
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
function uw(e, t, n) {
  const r = {};
  let o = i(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const I = i(e, ["validationDataset"]);
    t !== void 0 && I != null && l(t, ["supervisedTuningSpec"], Ms(I));
  } else if (o === "PREFERENCE_TUNING") {
    const I = i(e, ["validationDataset"]);
    t !== void 0 && I != null && l(t, ["preferenceOptimizationSpec"], Ms(I));
  } else if (o === "DISTILLATION") {
    const I = i(e, ["validationDataset"]);
    t !== void 0 && I != null && l(t, ["distillationSpec"], Ms(I));
  }
  const s = i(e, ["tunedModelDisplayName"]);
  t !== void 0 && s != null && l(t, ["tunedModelDisplayName"], s);
  const a = i(e, ["description"]);
  t !== void 0 && a != null && l(t, ["description"], a);
  let u = i(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const I = i(e, ["epochCount"]);
    t !== void 0 && I != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], I);
  } else if (u === "PREFERENCE_TUNING") {
    const I = i(e, ["epochCount"]);
    t !== void 0 && I != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], I);
  } else if (u === "DISTILLATION") {
    const I = i(e, ["epochCount"]);
    t !== void 0 && I != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], I);
  }
  let c = i(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const I = i(e, ["learningRateMultiplier"]);
    t !== void 0 && I != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], I);
  } else if (c === "PREFERENCE_TUNING") {
    const I = i(e, ["learningRateMultiplier"]);
    t !== void 0 && I != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], I);
  } else if (c === "DISTILLATION") {
    const I = i(e, ["learningRateMultiplier"]);
    t !== void 0 && I != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], I);
  }
  let d = i(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const I = i(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && I != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], I);
  } else if (d === "PREFERENCE_TUNING") {
    const I = i(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && I != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], I);
  } else if (d === "DISTILLATION") {
    const I = i(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && I != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], I);
  }
  let h = i(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const I = i(e, ["adapterSize"]);
    t !== void 0 && I != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], I);
  } else if (h === "PREFERENCE_TUNING") {
    const I = i(e, ["adapterSize"]);
    t !== void 0 && I != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], I);
  } else if (h === "DISTILLATION") {
    const I = i(e, ["adapterSize"]);
    t !== void 0 && I != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], I);
  }
  let f = i(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const I = i(e, ["tuningMode"]);
    t !== void 0 && I != null && l(t, ["supervisedTuningSpec", "tuningMode"], I);
  } else if (f === "DISTILLATION") {
    const I = i(e, ["tuningMode"]);
    t !== void 0 && I != null && l(t, ["distillationSpec", "tuningMode"], I);
  }
  const p = i(e, ["customBaseModel"]);
  t !== void 0 && p != null && l(t, ["customBaseModel"], p);
  let m = i(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const I = i(e, ["batchSize"]);
    t !== void 0 && I != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], I);
  } else if (m === "DISTILLATION") {
    const I = i(e, ["batchSize"]);
    t !== void 0 && I != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], I);
  }
  let g = i(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const I = i(e, ["learningRate"]);
    t !== void 0 && I != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], I);
  } else if (g === "DISTILLATION") {
    const I = i(e, ["learningRate"]);
    t !== void 0 && I != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], I);
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
  const C = i(e, ["tunedTeacherModelSource"]);
  t !== void 0 && C != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], C);
  const P = i(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && P != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], P);
  const k = i(e, ["outputUri"]);
  t !== void 0 && k != null && l(t, ["outputUri"], k);
  const R = i(e, ["encryptionSpec"]);
  return t !== void 0 && R != null && l(t, ["encryptionSpec"], R), r;
}
function cw(e, t) {
  const n = {}, r = i(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const s = i(e, ["trainingDataset"]);
  s != null && Sw(s);
  const a = i(e, ["config"]);
  return a != null && lw(a, n), n;
}
function dw(e, t) {
  const n = {}, r = i(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = i(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const s = i(e, ["trainingDataset"]);
  s != null && Tw(s, n, t);
  const a = i(e, ["config"]);
  return a != null && uw(a, n, t), n;
}
function fw(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function hw(e, t) {
  const n = {}, r = i(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function pw(e, t, n) {
  const r = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  t !== void 0 && s != null && l(t, ["_query", "pageToken"], s);
  const a = i(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function mw(e, t, n) {
  const r = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  t !== void 0 && s != null && l(t, ["_query", "pageToken"], s);
  const a = i(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function gw(e, t) {
  const n = {}, r = i(e, ["config"]);
  return r != null && pw(r, n), n;
}
function yw(e, t) {
  const n = {}, r = i(e, ["config"]);
  return r != null && mw(r, n), n;
}
function _w(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const s = i(e, ["tunedModels"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => wh(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function vw(e, t) {
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
function Aw(e, t) {
  const n = {}, r = i(e, ["name"]);
  r != null && l(n, ["model"], r);
  const o = i(e, ["name"]);
  return o != null && l(n, ["endpoint"], o), n;
}
function Sw(e, t) {
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
function Tw(e, t, n) {
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
function wh(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["state"]);
  s != null && l(n, ["state"], kf(s));
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
  return p != null && l(n, ["tunedModel"], Aw(p)), n;
}
function mi(e, t) {
  const n = {}, r = i(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["state"]);
  s != null && l(n, ["state"], kf(s));
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
  const C = i(e, ["tuningDataStats"]);
  C != null && l(n, ["tuningDataStats"], C);
  const P = i(e, ["encryptionSpec"]);
  P != null && l(n, ["encryptionSpec"], P);
  const k = i(e, ["partnerModelTuningSpec"]);
  k != null && l(n, ["partnerModelTuningSpec"], k);
  const R = i(e, ["customBaseModel"]);
  R != null && l(n, ["customBaseModel"], R);
  const I = i(e, ["evaluateDatasetRuns"]);
  if (I != null) {
    let _e = I;
    Array.isArray(_e) && (_e = _e.map((Ee) => Ee)), l(n, ["evaluateDatasetRuns"], _e);
  }
  const B = i(e, ["experiment"]);
  B != null && l(n, ["experiment"], B);
  const x = i(e, ["fullFineTuningSpec"]);
  x != null && l(n, ["fullFineTuningSpec"], x);
  const D = i(e, ["labels"]);
  D != null && l(n, ["labels"], D);
  const O = i(e, ["outputUri"]);
  O != null && l(n, ["outputUri"], O);
  const z = i(e, ["pipelineJob"]);
  z != null && l(n, ["pipelineJob"], z);
  const ne = i(e, ["serviceAccount"]);
  ne != null && l(n, ["serviceAccount"], ne);
  const j = i(e, ["tunedModelDisplayName"]);
  j != null && l(n, ["tunedModelDisplayName"], j);
  const Q = i(e, ["tuningJobState"]);
  Q != null && l(n, ["tuningJobState"], Q);
  const X = i(e, ["veoTuningSpec"]);
  X != null && l(n, ["veoTuningSpec"], X);
  const me = i(e, ["distillationSamplingSpec"]);
  me != null && l(n, ["distillationSamplingSpec"], me);
  const Oe = i(e, ["tuningJobMetadata"]);
  return Oe != null && l(n, ["tuningJobMetadata"], Oe), n;
}
function Ew(e, t) {
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
function Ms(e, t) {
  const n = {}, r = i(e, ["gcsUri"]);
  r != null && l(n, ["validationDatasetUri"], r);
  const o = i(e, ["vertexDatasetResource"]);
  return o != null && l(n, ["validationDatasetUri"], o), n;
}
var ww = class extends At {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Zt(vt.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
      const c = hw(e);
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
      const c = fw(e);
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
      })), s.then((d) => wh(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = yw(e);
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
        const h = vw(d), f = new Ou();
        return Object.assign(f, h), f;
      });
    } else {
      const c = gw(e);
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
        const h = _w(d), f = new Ou();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let s, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = sw(e);
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
        const h = aw(d), f = new Hu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = ow(e);
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
        const h = iw(d), f = new Hu();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let r, o = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const a = dw(e, e);
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
      const a = cw(e);
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
      })), r.then((u) => Ew(u));
    }
  }
}, Cw = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, Iw = 1024 * 1024 * 8, bw = 3, Pw = 1e3, Rw = 2, No = "x-goog-upload-status";
async function xw(e, t, n, r) {
  var o;
  const s = await Ch(e, t, n, r), a = await s?.json();
  if (((o = s?.headers) === null || o === void 0 ? void 0 : o[No]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function Mw(e, t, n, r) {
  var o;
  const s = await Ch(e, t, n, r), a = await s?.json();
  if (((o = s?.headers) === null || o === void 0 ? void 0 : o[No]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = wf(a), c = new Jy();
  return Object.assign(c, u), c;
}
async function Ch(e, t, n, r) {
  var o, s, a;
  let u = t;
  const c = r?.baseUrl || ((o = n.clientOptions.httpOptions) === null || o === void 0 ? void 0 : o.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, h = 0, f = new ri(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(Iw, d - h), g = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, v = Pw;
    for (; _ < bw; ) {
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
      }), !((s = f?.headers) === null || s === void 0) && s[No]) break;
      _++, await kw(v), v = v * Rw;
    }
    if (h += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[No]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function Nw(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function kw(e) {
  return new Promise((t) => setTimeout(t, e));
}
var Dw = class {
  async upload(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await xw(e, t, n, r);
  }
  async uploadToFileSearchStore(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Mw(e, t, n, r);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Nw(e);
  }
}, $w = class {
  create(e, t, n) {
    return new Lw(e, t, n);
  }
}, Lw = class {
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
}, _c = "x-goog-api-key", Uw = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(_c) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(_c, this.apiKey);
    }
  }
}, Fw = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new ue({
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
    const n = py(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const r = new Uw(this.apiKey);
    this.apiClient = new kT({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new Dw(),
      downloader: new Cw()
    }), this.models = new jT(this.apiClient), this.live = new WT(this.apiClient, r, new $w()), this.batches = new z_(this.apiClient), this.chats = new Nv(this.models, this.apiClient), this.caches = new Rv(this.apiClient), this.files = new Vv(this.apiClient), this.operations = new eE(this.apiClient), this.authTokens = new _E(this.apiClient), this.tunings = new ww(this.apiClient), this.fileSearchStores = new IE(this.apiClient);
  }
};
function vc(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function ko(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Kt(e) {
  return { text: String(e || "") };
}
function qw(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function Bw(e) {
  if (typeof e == "string") return [Kt(e)];
  if (!Array.isArray(e)) return [Kt("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? Kt(n.text || "") : n.type === "image_url" && n.image_url?.url ? qw(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [Kt("")];
}
function Ac() {
  return {
    role: "user",
    parts: [Kt("")]
  };
}
function xr(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = ko(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function Gw(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function Ow(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function Sc(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const r = String(e.functionCall.id || "").trim();
  return r ? `id:${r}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function Hw(e, t) {
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
function Vw(e = [], t = "") {
  const n = e.map((h) => xr(h, "model")).filter(Boolean);
  if (!n.length) return null;
  const r = [...n].reverse().find((h) => Gw(h)) || null, o = [...n].reverse().find((h) => Ow(h)) || null, s = r || o || n[n.length - 1], a = n.indexOf(s), u = ko(s);
  if (!u?.parts?.length) return n[n.length - 1];
  if (o) {
    const h = /* @__PURE__ */ new Map(), f = [];
    n.forEach((m, g) => {
      m.parts.forEach((_, v) => {
        const w = Sc(_, v, g);
        if (!w) return;
        h.has(w) || f.push(w);
        const C = h.get(w);
        C ? h.set(w, Hw(C, _)) : h.set(w, ko(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((m, g) => {
      const _ = Sc(m, g, a);
      return _ ? (p.add(_), h.get(_) || m) : m;
    }), f.forEach((m) => {
      p.has(m) || (u.parts.push(h.get(m)), p.add(m));
    });
  }
  const c = String(t || ""), d = u.parts.filter((h) => !(typeof h?.text == "string" && !h?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function Tc(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((r) => !r?.thought && typeof r?.text == "string" && r.text).map((r) => r.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function Ih(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((r) => r?.functionCall || r).filter((r) => r && r.name);
  return t.length ? t : n;
}
function bh(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function Ec(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function Jw(e, t) {
  const n = Ec(e), r = Ec(t);
  return n && r ? JSON.stringify({
    ...n,
    ...r
  }) : String(t || "").trim() || String(e || "{}");
}
function Kw(e, t = "google-tool") {
  return Ih(e).map((n, r) => {
    const o = String(n.id || "").trim();
    return {
      id: o || `${t}-${r + 1}`,
      name: n.name || "",
      arguments: bh(n),
      ...o ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function Ww(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let r = 0;
  function o(a, u, c, d) {
    return a.name = String(u.name || a.name || "").trim(), a.arguments = Jw(a.arguments, d), c && (n.set(c, a), a.id !== c ? a.providerId = c : delete a.providerId), a;
  }
  function s(a) {
    return Ih(a).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), h = bh(u);
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
function zw(e = []) {
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
function Yw(e) {
  switch (e) {
    case "high":
      return hr.HIGH;
    case "medium":
      return hr.MEDIUM;
    default:
      return hr.LOW;
  }
}
function wc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function Xw(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function Qw(e) {
  const t = e?.providerPayload?.googleContent;
  return xr(t, "model");
}
function Zw(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = Qw(e);
    return n ? [n] : [];
  }
  return t.map((n) => xr(n, "model")).filter(Boolean);
}
function ra(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => xr(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function jw(e) {
  const t = e?.candidates?.[0]?.content;
  return ra(t ? [t] : []);
}
function eC(e) {
  return ra(e ? [e] : []);
}
function Ph(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? ko(e.history) || [] : [];
}
function tC(e, t = 0) {
  return Ph(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => xr(n, "model")).filter(Boolean);
}
function nC(e) {
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
          response: vc(h.content)
        } }), d += 1;
      }
      r.push({
        role: "user",
        parts: c
      }), a = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = Zw(u);
      if (c.length) {
        r.push(...c);
        continue;
      }
    }
    if (u.role === "assistant" && Array.isArray(u.tool_calls) && u.tool_calls.length) {
      r.push({
        role: "model",
        parts: [...u.content ? [Kt(u.content)] : [], ...u.tool_calls.map((c) => ({ functionCall: {
          ...(() => {
            const d = Object.prototype.hasOwnProperty.call(c, "providerToolCallId") ? String(c.providerToolCallId || "").trim() : String(c.id || "").trim();
            return d ? { id: d } : {};
          })(),
          name: c.function.name,
          args: vc(c.function.arguments)
        } }))]
      });
      continue;
    }
    r.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: Bw(u.content)
    });
  }
  if (!r.length) return {
    history: [],
    latestMessage: Ac().parts
  };
  const s = r[r.length - 1];
  return s.role === "user" && s.parts?.length ? {
    history: r.slice(0, -1),
    latestMessage: s.parts
  } : {
    history: r,
    latestMessage: Ac().parts
  };
}
function rC(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Cc(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var oC = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.toolCallResponseSequence = 0, this.client = new Fw({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e) {
    const t = nC(e.messages), n = Array.isArray(e.tools) ? e.tools : [], r = Xw(e), o = {
      ...r ? { systemInstruction: r } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    if (e.reasoning?.enabled && (o.thinkingConfig = {
      includeThoughts: !0,
      thinkingLevel: Yw(e.reasoning.effort)
    }), n.length && (o.tools = [{ functionDeclarations: n.map((s) => ({
      name: s.function.name,
      description: s.function.description,
      parameters: s.function.parameters
    })) }]), n.length) {
      const s = String(e.toolChoice || "auto").trim();
      o.toolConfig = { functionCallingConfig: s === "none" ? { mode: hn.NONE } : s === "auto" ? { mode: hn.AUTO } : s === "required" ? { mode: hn.ANY } : {
        mode: hn.ANY,
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
    return Sr({
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
    return Sr({
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
      sessionConfig: t.createPayload.config,
      sendPayload: t.sendPayload,
      requestInspection: this.inspectRequest(e, { payload: t })
    };
  }
  async sendThroughChat(e, t, n) {
    let r, o, s, a = [];
    const u = `google-tool-${++this.toolCallResponseSequence}`, c = Ww(u);
    let d = null;
    const h = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, f = {
      ...t,
      ...h ? { config: h } : {}
    }, p = typeof n.onStreamProgress == "function", m = Ph(e).length;
    if (p) {
      const v = await e.sendMessageStream(f), w = /* @__PURE__ */ new Map();
      let C = "", P = null;
      const k = [];
      for await (const R of v) {
        P = R;
        const I = R?.candidates?.[0]?.content;
        I?.parts?.length && k.push(I), wc(R).forEach((x, D) => {
          const O = `${x.label}:${D}`;
          w.set(O, Cc(w.get(O) || "", x.text));
        }), a = c.append(R);
        const B = Tc(R);
        C = Cc(C, B), rC(n, {
          text: C,
          thoughts: Array.from(w.values()).filter(Boolean).map((x, D) => ({
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
        ...P || {},
        functionCalls: a
      }, d = Vw(k, C) || r?.candidates?.[0]?.content || null, o = Array.from(w.values()).filter(Boolean).map((R, I) => ({
        label: `思考块 ${I + 1}`,
        text: R
      })), s = C;
    } else
      r = await e.sendMessage(f), o = wc(r), s = Tc(r);
    const g = p ? a : Kw(r, u), _ = tC(e, m);
    return {
      text: s,
      toolCalls: g,
      thoughts: o,
      finishReason: r.candidates?.[0]?.finishReason || "STOP",
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: ra(_) || eC(d) || jw(r)
    };
  }
  async chat(e) {
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: zw(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, r, e),
        requestInspection: this.inspectSendRequest(r, e)
      };
    }
    const t = String(e.finalAnswerReminderText || "").trim();
    if (t) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: [Kt(t)] };
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
function H(e, t, n, r, o) {
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
var Rh = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Rh = e.randomUUID.bind(e), e.randomUUID();
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
    if (!t || !o) return new jo({
      message: r,
      cause: yi(n)
    });
    const s = n?.error;
    return t === 400 ? new xh(t, s, r, o) : t === 401 ? new Mh(t, s, r, o) : t === 403 ? new Nh(t, s, r, o) : t === 404 ? new kh(t, s, r, o) : t === 409 ? new Dh(t, s, r, o) : t === 422 ? new $h(t, s, r, o) : t === 429 ? new Lh(t, s, r, o) : t >= 500 ? new Uh(t, s, r, o) : new _i(t, s, r, o);
  }
}, We = class extends ge {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, jo = class extends ge {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, oa = class extends jo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, xh = class extends ge {
}, Mh = class extends ge {
}, Nh = class extends ge {
}, kh = class extends ge {
}, Dh = class extends ge {
}, $h = class extends ge {
}, Lh = class extends ge {
}, Uh = class extends ge {
}, Fh = class extends G {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, qh = class extends G {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, tr = class extends Error {
  constructor(e) {
    super(e);
  }
}, Bh = class extends ge {
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
}, sC = class extends G {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, iC = /^[a-z][a-z0-9+.-]*:/i, aC = (e) => iC.test(e), Ie = (e) => (Ie = Array.isArray, Ie(e)), Ic = Ie;
function sa(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function bc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function lC(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Ns(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var uC = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new G(`${e} must be an integer`);
  if (t < 0) throw new G(`${e} must be a positive integer`);
  return t;
}, cC = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Mr = (e) => new Promise((t) => setTimeout(t, e)), ln = "6.44.0", dC = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function fC() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var hC = () => {
  const e = fC();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": ln,
    "X-Stainless-OS": Rc(Deno.build.os),
    "X-Stainless-Arch": Pc(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": ln,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": ln,
    "X-Stainless-OS": Rc(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Pc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = pC();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": ln,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": ln,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function pC() {
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
var Pc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Rc = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), xc, mC = () => xc ?? (xc = hC());
function Gh() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Oh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Hh(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Oh({
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
async function Mc(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var gC = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Jh = "RFC3986", Kh = (e) => String(e), Nc = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Kh
};
var vi = (e, t) => (vi = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), vi(e, t)), st = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), ks = 1024, yC = (e, t, n, r, o) => {
  if (e.length === 0) return e;
  let s = e;
  if (typeof e == "symbol" ? s = Symbol.prototype.toString.call(e) : typeof e != "string" && (s = String(e)), n === "iso-8859-1") return escape(s).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < s.length; u += ks) {
    const c = s.length >= ks ? s.slice(u, u + ks) : s, d = [];
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
function _C(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function kc(e, t) {
  if (Ie(e)) {
    const n = [];
    for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
    return n;
  }
  return t(e);
}
var Wh = {
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
}, zh = function(e, t) {
  Array.prototype.push.apply(e, Ie(t) ? t : [t]);
}, Dc, le = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: yC,
  encodeValuesOnly: !1,
  format: Jh,
  formatter: Kh,
  indices: !1,
  serializeDate(e) {
    return (Dc ?? (Dc = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function vC(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var Ds = {};
function Yh(e, t, n, r, o, s, a, u, c, d, h, f, p, m, g, _, v, w) {
  let C = e, P = w, k = 0, R = !1;
  for (; (P = P.get(Ds)) !== void 0 && !R; ) {
    const O = P.get(e);
    if (k += 1, typeof O < "u") {
      if (O === k) throw new RangeError("Cyclic object value");
      R = !0;
    }
    typeof P.get(Ds) > "u" && (k = 0);
  }
  if (typeof d == "function" ? C = d(t, C) : C instanceof Date ? C = p?.(C) : n === "comma" && Ie(C) && (C = kc(C, function(O) {
    return O instanceof Date ? p?.(O) : O;
  })), C === null) {
    if (s) return c && !_ ? c(t, le.encoder, v, "key", m) : t;
    C = "";
  }
  if (vC(C) || _C(C)) {
    if (c) {
      const O = _ ? t : c(t, le.encoder, v, "key", m);
      return [g?.(O) + "=" + g?.(c(C, le.encoder, v, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(C))];
  }
  const I = [];
  if (typeof C > "u") return I;
  let B;
  if (n === "comma" && Ie(C))
    _ && c && (C = kc(C, c)), B = [{ value: C.length > 0 ? C.join(",") || null : void 0 }];
  else if (Ie(d)) B = d;
  else {
    const O = Object.keys(C);
    B = h ? O.sort(h) : O;
  }
  const x = u ? String(t).replace(/\./g, "%2E") : String(t), D = r && Ie(C) && C.length === 1 ? x + "[]" : x;
  if (o && Ie(C) && C.length === 0) return D + "[]";
  for (let O = 0; O < B.length; ++O) {
    const z = B[O], ne = typeof z == "object" && typeof z.value < "u" ? z.value : C[z];
    if (a && ne === null) continue;
    const j = f && u ? z.replace(/\./g, "%2E") : z, Q = Ie(C) ? typeof n == "function" ? n(D, j) : D : D + (f ? "." + j : "[" + j + "]");
    w.set(e, k);
    const X = /* @__PURE__ */ new WeakMap();
    X.set(Ds, w), zh(I, Yh(ne, Q, n, r, o, s, a, u, n === "comma" && _ && Ie(C) ? null : c, d, h, f, p, m, g, _, v, X));
  }
  return I;
}
function AC(e = le) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || le.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Jh;
  if (typeof e.format < "u") {
    if (!vi(Nc, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const r = Nc[n];
  let o = le.filter;
  (typeof e.filter == "function" || Ie(e.filter)) && (o = e.filter);
  let s;
  if (e.arrayFormat && e.arrayFormat in Wh ? s = e.arrayFormat : "indices" in e ? s = e.indices ? "indices" : "repeat" : s = le.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : le.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : le.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : le.allowEmptyArrays,
    arrayFormat: s,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : le.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? le.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : le.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : le.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : le.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : le.encodeValuesOnly,
    filter: o,
    format: n,
    formatter: r,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : le.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : le.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : le.strictNullHandling
  };
}
function SC(e, t = {}) {
  let n = e;
  const r = AC(t);
  let o, s;
  typeof r.filter == "function" ? (s = r.filter, n = s("", n)) : Ie(r.filter) && (s = r.filter, o = s);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = Wh[r.arrayFormat], c = u === "comma" && r.commaRoundTrip;
  o || (o = Object.keys(n)), r.sort && o.sort(r.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < o.length; ++p) {
    const m = o[p];
    r.skipNulls && n[m] === null || zh(a, Yh(n[m], m, u, c, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, d));
  }
  const h = a.join(r.delimiter);
  let f = r.addQueryPrefix === !0 ? "?" : "";
  return r.charsetSentinel && (r.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function TC(e) {
  return SC(e, { arrayFormat: "brackets" });
}
function EC(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var $c;
function ia(e) {
  let t;
  return ($c ?? (t = new globalThis.TextEncoder(), $c = t.encode.bind(t)))(e);
}
var Lc;
function Uc(e) {
  let t;
  return (Lc ?? (t = new globalThis.TextDecoder(), Lc = t.decode.bind(t)))(e);
}
var ke, De, es = class {
  constructor() {
    ke.set(this, void 0), De.set(this, void 0), H(this, ke, new Uint8Array(), "f"), H(this, De, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ia(e) : e;
    H(this, ke, EC([E(this, ke, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = wC(E(this, ke, "f"), E(this, De, "f"))) != null; ) {
      if (r.carriage && E(this, De, "f") == null) {
        H(this, De, r.index, "f");
        continue;
      }
      if (E(this, De, "f") != null && (r.index !== E(this, De, "f") + 1 || r.carriage)) {
        n.push(Uc(E(this, ke, "f").subarray(0, E(this, De, "f") - 1))), H(this, ke, E(this, ke, "f").subarray(E(this, De, "f")), "f"), H(this, De, null, "f");
        continue;
      }
      const o = E(this, De, "f") !== null ? r.preceding - 1 : r.preceding, s = Uc(E(this, ke, "f").subarray(0, o));
      n.push(s), H(this, ke, E(this, ke, "f").subarray(r.index), "f"), H(this, De, null, "f");
    }
    return n;
  }
  flush() {
    return E(this, ke, "f").length ? this.decode(`
`) : [];
  }
};
ke = /* @__PURE__ */ new WeakMap(), De = /* @__PURE__ */ new WeakMap();
es.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
es.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function wC(e, t) {
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
function CC(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var Do = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Fc = (e, t, n) => {
  if (e) {
    if (lC(Do, e)) return e;
    fe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Do))}`);
  }
};
function nr() {
}
function to(e, t, n) {
  return !t || Do[e] > Do[n] ? nr : t[e].bind(t);
}
var IC = {
  error: nr,
  warn: nr,
  info: nr,
  debug: nr
}, qc = /* @__PURE__ */ new WeakMap();
function fe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return IC;
  const r = qc.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: to("error", t, n),
    warn: to("warn", t, n),
    info: to("info", t, n),
    debug: to("debug", t, n)
  };
  return qc.set(t, [n, o]), o;
}
var Gt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), zn, Tr = class rr {
  constructor(t, n, r) {
    this.iterator = t, zn.set(this, void 0), this.controller = n, H(this, zn, r, "f");
  }
  static fromSSEResponse(t, n, r, o) {
    let s = !1;
    const a = r ? fe(r) : console;
    async function* u() {
      if (s) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let c = !1;
      try {
        for await (const d of bC(t, n))
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
    return new rr(u, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* s() {
      const u = new es(), c = Vh(t);
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
    return new rr(a, n, r);
  }
  [(zn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new rr(() => o(t), this.controller, E(this, zn, "f")), new rr(() => o(n), this.controller, E(this, zn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Oh({
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
async function* bC(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
  const n = new RC(), r = new es(), o = Vh(e.body);
  for await (const s of PC(o)) for (const a of r.decode(s)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const s of r.flush()) {
    const a = n.decode(s);
    a && (yield a);
  }
}
async function* PC(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? ia(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let s;
    for (; (s = CC(t)) !== -1; )
      yield t.slice(0, s), t = t.slice(s);
  }
  t.length > 0 && (yield t);
}
var RC = class {
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
    let [t, n, r] = xC(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function xC(e, t) {
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
async function Xh(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: s } = t, a = await (async () => {
    if (t.options.stream)
      return fe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : Tr.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Qh(await n.json(), n) : await n.text();
  })();
  return fe(e).debug(`[${r}] response parsed`, Gt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - s
  })), a;
}
function Qh(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var or, Zh = class jh extends Promise {
  constructor(t, n, r = Xh) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, or.set(this, void 0), H(this, or, t, "f");
  }
  _thenUnwrap(t) {
    return new jh(E(this, or, "f"), this.responsePromise, async (n, r) => Qh(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(E(this, or, "f"), t))), this.parsedPromise;
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
or = /* @__PURE__ */ new WeakMap();
var no, ts = class {
  constructor(e, t, n, r) {
    no.set(this, void 0), H(this, no, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new G("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await E(this, no, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(no = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, MC = class extends Zh {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await Xh(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Dt = class extends ts {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, ee = class extends ts {
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
}, pe = class extends ts {
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
}, Tt = class extends ts {
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
}, NC = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, kC = "urn:ietf:params:oauth:grant-type:token-exchange", DC = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Gh();
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
      grant_type: kC,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: NC[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new Bh(t.status, a, t.headers) : ge.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
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
}, ep = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function pr(e, t, n) {
  return ep(), new File(e, t ?? "unknown_file", n);
}
function go(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var aa = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", ns = async (e, t) => Ai(e.body) ? {
  ...e,
  body: await tp(e.body, t)
} : e, lt = async (e, t) => ({
  ...e,
  body: await tp(e.body, t)
}), Bc = /* @__PURE__ */ new WeakMap();
function $C(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Bc.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, s = new FormData();
      return s.toString() !== await new o(s).text();
    } catch {
      return !0;
    }
  })();
  return Bc.set(t, r), r;
}
var tp = async (e, t) => {
  if (!await $C(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, o]) => Si(n, r, o))), n;
}, np = (e) => e instanceof Blob && "name" in e, LC = (e) => typeof e == "object" && e !== null && (e instanceof Response || aa(e) || np(e)), Ai = (e) => {
  if (LC(e)) return !0;
  if (Array.isArray(e)) return e.some(Ai);
  if (e && typeof e == "object") {
    for (const t in e) if (Ai(e[t])) return !0;
  }
  return !1;
}, Si = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, pr([await n.blob()], go(n)));
    else if (aa(n)) e.append(t, pr([await new Response(Hh(n)).blob()], go(n)));
    else if (np(n)) e.append(t, n, go(n));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Si(e, t + "[]", r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, o]) => Si(e, `${t}[${r}]`, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, rp = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", UC = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && rp(e), FC = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function qC(e, t, n) {
  if (ep(), e = await e, UC(e))
    return e instanceof File ? e : pr([await e.arrayBuffer()], e.name);
  if (FC(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), pr(await Ti(o), t, n);
  }
  const r = await Ti(e);
  if (t || (t = go(e)), !n?.type) {
    const o = r.find((s) => typeof s == "object" && "type" in s && s.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return pr(r, t, n);
}
async function Ti(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (rp(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (aa(e)) for await (const n of e) t.push(...await Ti(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${BC(e)}`);
  }
  return t;
}
function BC(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var N = class {
  constructor(e) {
    this._client = e;
  }
};
function op(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Gc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), GC = (e = op) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const s = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let g = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Gc) ?? Gc)?.toString) && (g = m + "", s.push({
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
}, A = /* @__PURE__ */ GC(op), sp = class extends N {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/chat/completions/${e}/messages`, ee, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function $o(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function la(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function Nr(e) {
  return e?.$brand === "auto-parseable-tool";
}
function OC(e, t) {
  return !t || !ip(t) ? {
    ...e,
    choices: e.choices.map((n) => (ap(n.message.tool_calls), {
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
    if (r.finish_reason === "length") throw new Fh();
    if (r.finish_reason === "content_filter") throw new qh();
    return ap(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        ...r.message.tool_calls ? { tool_calls: r.message.tool_calls?.map((o) => VC(t, o)) ?? void 0 } : void 0,
        parsed: r.message.content && !r.message.refusal ? HC(t, r.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function HC(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function VC(e, t) {
  const n = e.tools?.find((r) => $o(r) && r.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: Nr(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function JC(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((r) => $o(r) && r.function?.name === t.function.name);
  return $o(n) && (Nr(n) || n?.function.strict || !1);
}
function ip(e) {
  return la(e.response_format) ? !0 : e.tools?.some((t) => Nr(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function ap(e) {
  for (const t of e || []) if (t.type !== "function") throw new G(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function KC(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new G(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new G(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Lo = (e) => e?.role === "assistant", lp = (e) => e?.role === "tool", Ei, yo, _o, sr, ir, vo, ar, pt, lr, Uo, Fo, un, up, ca = class {
  constructor() {
    Ei.add(this), this.controller = new AbortController(), yo.set(this, void 0), _o.set(this, () => {
    }), sr.set(this, () => {
    }), ir.set(this, void 0), vo.set(this, () => {
    }), ar.set(this, () => {
    }), pt.set(this, {}), lr.set(this, !1), Uo.set(this, !1), Fo.set(this, !1), un.set(this, !1), H(this, yo, new Promise((e, t) => {
      H(this, _o, e, "f"), H(this, sr, t, "f");
    }), "f"), H(this, ir, new Promise((e, t) => {
      H(this, vo, e, "f"), H(this, ar, t, "f");
    }), "f"), E(this, yo, "f").catch(() => {
    }), E(this, ir, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, E(this, Ei, "m", up).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (E(this, _o, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return E(this, lr, "f");
  }
  get errored() {
    return E(this, Uo, "f");
  }
  get aborted() {
    return E(this, Fo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (E(this, pt, "f")[e] || (E(this, pt, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = E(this, pt, "f")[e];
    if (!n) return this;
    const r = n.findIndex((o) => o.listener === t);
    return r >= 0 && n.splice(r, 1), this;
  }
  once(e, t) {
    return (E(this, pt, "f")[e] || (E(this, pt, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      H(this, un, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    H(this, un, !0, "f"), await E(this, ir, "f");
  }
  _emit(e, ...t) {
    if (E(this, lr, "f")) return;
    e === "end" && (H(this, lr, !0, "f"), E(this, vo, "f").call(this));
    const n = E(this, pt, "f")[e];
    if (n && (E(this, pt, "f")[e] = n.filter((r) => !r.once), n.forEach(({ listener: r }) => r(...t))), e === "abort") {
      const r = t[0];
      !E(this, un, "f") && !n?.length && Promise.reject(r), E(this, sr, "f").call(this, r), E(this, ar, "f").call(this, r), this._emit("end");
      return;
    }
    if (e === "error") {
      const r = t[0];
      !E(this, un, "f") && !n?.length && Promise.reject(r), E(this, sr, "f").call(this, r), E(this, ar, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
yo = /* @__PURE__ */ new WeakMap(), _o = /* @__PURE__ */ new WeakMap(), sr = /* @__PURE__ */ new WeakMap(), ir = /* @__PURE__ */ new WeakMap(), vo = /* @__PURE__ */ new WeakMap(), ar = /* @__PURE__ */ new WeakMap(), pt = /* @__PURE__ */ new WeakMap(), lr = /* @__PURE__ */ new WeakMap(), Uo = /* @__PURE__ */ new WeakMap(), Fo = /* @__PURE__ */ new WeakMap(), un = /* @__PURE__ */ new WeakMap(), Ei = /* @__PURE__ */ new WeakSet(), up = function(t) {
  if (H(this, Uo, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new We()), t instanceof We)
    return H(this, Fo, !0, "f"), this._emit("abort", t);
  if (t instanceof G) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new G(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new G(String(t)));
};
function WC(e) {
  return typeof e.parse == "function";
}
var ve, wi, qo, Ci, Ii, bi, cp, dp, zC = 10, fp = class extends ca {
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
      if (this._emit("message", e), lp(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (Lo(e) && e.tool_calls)
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
    return await this.done(), E(this, ve, "m", qo).call(this);
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
    const t = E(this, ve, "m", qo).call(this);
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
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), E(this, ve, "m", cp).call(this, t);
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
    const r = "tool", { tool_choice: o = "auto", stream: s, ...a } = t, u = typeof o != "string" && o.type === "function" && o?.function?.name, { maxChatCompletions: c = zC } = n || {}, d = t.tools.map((p) => {
      if (Nr(p)) {
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
        const _ = g.id, { name: v, arguments: w } = g.function, C = h[v];
        if (C) {
          if (u && u !== v) {
            const I = `Invalid tool_call: ${JSON.stringify(v)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: r,
              tool_call_id: _,
              content: I
            });
            continue;
          }
        } else {
          const I = `Invalid tool_call: ${JSON.stringify(v)}. Available options are: ${Object.keys(h).map((B) => JSON.stringify(B)).join(", ")}. Please try again`;
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: I
          });
          continue;
        }
        let P;
        try {
          P = WC(C) ? await C.parse(w) : w;
        } catch (I) {
          const B = I instanceof Error ? I.message : String(I);
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: B
          });
          continue;
        }
        const k = await C.function(P, this), R = E(this, ve, "m", dp).call(this, k);
        if (this._addMessage({
          role: r,
          tool_call_id: _,
          content: R
        }), u) return;
      }
    }
  }
};
ve = /* @__PURE__ */ new WeakSet(), wi = function() {
  return E(this, ve, "m", qo).call(this).content ?? null;
}, qo = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (Lo(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new G("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Ci = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Lo(n) && n?.tool_calls?.length) for (let r = n.tool_calls.length - 1; r >= 0; r--) {
      const o = n.tool_calls[r];
      if (o?.type === "function") return o.function;
    }
  }
}, Ii = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (lp(n) && n.content != null && typeof n.content == "string" && this.messages.some((r) => r.role === "assistant" && r.tool_calls?.some((o) => o.type === "function" && o.id === n.tool_call_id))) return n.content;
  }
}, bi = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, cp = function(t) {
  if (t.n != null && t.n > 1) throw new G("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, dp = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var YC = class hp extends fp {
  static runTools(t, n, r) {
    const o = new hp(), s = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, s)), o;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), Lo(t) && t.content && this._emit("content", t.content);
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
}, XC = class extends Error {
}, QC = class extends Error {
};
function ZC(e, t = ce.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return jC(e.trim(), t);
}
var jC = (e, t) => {
  const n = e.length;
  let r = 0;
  const o = (p) => {
    throw new XC(`${p} at position ${r}`);
  }, s = (p) => {
    throw new QC(`${p} at position ${r}`);
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
}, Oc = (e) => ZC(e, ce.ALL ^ ce.NUM), ie, ht, nn, bt, $s, ro, Ls, Us, Fs, oo, qs, Hc, pp = class Pi extends fp {
  constructor(t) {
    super(), ie.add(this), ht.set(this, void 0), nn.set(this, void 0), bt.set(this, void 0), H(this, ht, t, "f"), H(this, nn, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return E(this, bt, "f");
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), E(this, ie, "m", $s).call(this);
    const s = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of s) E(this, ie, "m", Ls).call(this, a);
    if (s.controller.signal?.aborted) throw new We();
    return this._addChatCompletion(E(this, ie, "m", oo).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), E(this, ie, "m", $s).call(this), this._connected();
    const o = Tr.fromReadableStream(t, this.controller);
    let s;
    for await (const a of o)
      s && s !== a.id && this._addChatCompletion(E(this, ie, "m", oo).call(this)), E(this, ie, "m", Ls).call(this, a), s = a.id;
    if (o.controller.signal?.aborted) throw new We();
    return this._addChatCompletion(E(this, ie, "m", oo).call(this));
  }
  [(ht = /* @__PURE__ */ new WeakMap(), nn = /* @__PURE__ */ new WeakMap(), bt = /* @__PURE__ */ new WeakMap(), ie = /* @__PURE__ */ new WeakSet(), $s = function() {
    this.ended || H(this, bt, void 0, "f");
  }, ro = function(n) {
    let r = E(this, nn, "f")[n.index];
    return r || (r = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, E(this, nn, "f")[n.index] = r, r);
  }, Ls = function(n) {
    if (this.ended) return;
    const r = E(this, ie, "m", Hc).call(this, n);
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
      const a = E(this, ie, "m", ro).call(this, s);
      s.finish_reason && (E(this, ie, "m", Fs).call(this, s), a.current_tool_call_index != null && E(this, ie, "m", Us).call(this, s, a.current_tool_call_index));
      for (const u of o.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (E(this, ie, "m", Fs).call(this, s), a.current_tool_call_index != null && E(this, ie, "m", Us).call(this, s, a.current_tool_call_index)), a.current_tool_call_index = u.index;
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
  }, Us = function(n, r) {
    if (E(this, ie, "m", ro).call(this, n).done_tool_calls.has(r)) return;
    const o = n.message.tool_calls?.[r];
    if (!o) throw new Error("no tool call snapshot");
    if (!o.type) throw new Error("tool call snapshot missing `type`");
    if (o.type === "function") {
      const s = E(this, ht, "f")?.tools?.find((a) => $o(a) && a.function.name === o.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: o.function.name,
        index: r,
        arguments: o.function.arguments,
        parsed_arguments: Nr(s) ? s.$parseRaw(o.function.arguments) : s?.function.strict ? JSON.parse(o.function.arguments) : null
      });
    } else o.type;
  }, Fs = function(n) {
    const r = E(this, ie, "m", ro).call(this, n);
    if (n.message.content && !r.content_done) {
      r.content_done = !0;
      const o = E(this, ie, "m", qs).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: o ? o.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !r.refusal_done && (r.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !r.logprobs_content_done && (r.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !r.logprobs_refusal_done && (r.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, oo = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = E(this, bt, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return H(this, bt, void 0, "f"), H(this, nn, [], "f"), eI(n, E(this, ht, "f"));
  }, qs = function() {
    const n = E(this, ht, "f")?.response_format;
    return la(n) ? n : null;
  }, Hc = function(n) {
    var r, o, s, a;
    let u = E(this, bt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = H(this, bt, {
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
        const { content: I, refusal: B, ...x } = m;
        Object.assign(_.logprobs, x), I && ((r = _.logprobs).content ?? (r.content = []), _.logprobs.content.push(...I)), B && ((o = _.logprobs).refusal ?? (o.refusal = []), _.logprobs.refusal.push(...B));
      }
      if (f && (_.finish_reason = f, E(this, ht, "f") && ip(E(this, ht, "f")))) {
        if (f === "length") throw new Fh();
        if (f === "content_filter") throw new qh();
      }
      if (Object.assign(_, g), !h) continue;
      const { content: v, refusal: w, function_call: C, role: P, tool_calls: k, ...R } = h;
      if (Object.assign(_.message, R), w && (_.message.refusal = (_.message.refusal || "") + w), P && (_.message.role = P), C && (_.message.function_call ? (C.name && (_.message.function_call.name = C.name), C.arguments && ((s = _.message.function_call).arguments ?? (s.arguments = ""), _.message.function_call.arguments += C.arguments)) : _.message.function_call = C), v && (_.message.content = (_.message.content || "") + v, !_.message.refusal && E(this, ie, "m", qs).call(this) && (_.message.parsed = Oc(_.message.content))), k) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: I, id: B, type: x, function: D, ...O } of k) {
          const z = (a = _.message.tool_calls)[I] ?? (a[I] = {});
          Object.assign(z, O), B && (z.id = B), x && (z.type = x), D && (z.function ?? (z.function = {
            name: D.name ?? "",
            arguments: ""
          })), D?.name && (z.function.name = D.name), D?.arguments && (z.function.arguments += D.arguments, JC(E(this, ht, "f"), z) && (z.function.parsed_arguments = Oc(z.function.arguments)));
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
    return new Tr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function eI(e, t) {
  const { id: n, choices: r, created: o, model: s, system_fingerprint: a, ...u } = e;
  return OC({
    ...u,
    id: n,
    choices: r.map(({ message: c, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new G(`missing finish_reason for choice ${h}`);
      const { content: m = null, function_call: g, tool_calls: _, ...v } = c, w = c.role;
      if (!w) throw new G(`missing role for choice ${h}`);
      if (g) {
        const { arguments: C, name: P } = g;
        if (C == null) throw new G(`missing function_call.arguments for choice ${h}`);
        if (!P) throw new G(`missing function_call.name for choice ${h}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: C,
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
          tool_calls: _.map((C, P) => {
            const { function: k, type: R, id: I, ...B } = C, { arguments: x, name: D, ...O } = k || {};
            if (I == null) throw new G(`missing choices[${h}].tool_calls[${P}].id
${so(e)}`);
            if (R == null) throw new G(`missing choices[${h}].tool_calls[${P}].type
${so(e)}`);
            if (D == null) throw new G(`missing choices[${h}].tool_calls[${P}].function.name
${so(e)}`);
            if (x == null) throw new G(`missing choices[${h}].tool_calls[${P}].function.arguments
${so(e)}`);
            return {
              ...B,
              id: I,
              type: R,
              function: {
                ...O,
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
function so(e) {
  return JSON.stringify(e);
}
var tI = class Ri extends pp {
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
}, da = class extends N {
  constructor() {
    super(...arguments), this.messages = new sp(this._client);
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
    return this._client.getAPIList("/chat/completions", ee, {
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
    return KC(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => ua(n, e));
  }
  runTools(e, t) {
    return e.stream ? tI.runTools(this._client, e, t) : YC.runTools(this._client, e, t);
  }
  stream(e, t) {
    return pp.createChatCompletion(this._client, e, t);
  }
};
da.Messages = sp;
var fa = class extends N {
  constructor() {
    super(...arguments), this.completions = new da(this._client);
  }
};
fa.Completions = da;
var mp = class extends N {
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
    return this._client.getAPIList("/organization/admin_api_keys", ee, {
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
}, gp = class extends N {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", pe, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, yp = class extends N {
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
    return this._client.getAPIList("/organization/certificates/activate", Dt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", Dt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, _p = class extends N {
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
}, vp = class extends N {
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
}, Ap = class extends N {
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
    return this._client.getAPIList("/organization/roles", Tt, {
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
}, Sp = class extends N {
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
}, Tp = class extends N {
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
}, Ep = class extends N {
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
    return this._client.getAPIList(A`/organization/groups/${e}/roles`, Tt, {
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
}, wp = class extends N {
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
    return this._client.getAPIList(A`/organization/groups/${e}/users`, Tt, {
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
}, rs = class extends N {
  constructor() {
    super(...arguments), this.users = new wp(this._client), this.roles = new Ep(this._client);
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
    return this._client.getAPIList("/organization/groups", Tt, {
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
rs.Users = wp;
rs.Roles = Ep;
var Cp = class extends N {
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
}, Ip = class extends N {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/certificates`, pe, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/certificates/activate`, Dt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(A`/organization/projects/${e}/certificates/deactivate`, Dt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, bp = class extends N {
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
}, Pp = class extends N {
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
}, Rp = class extends N {
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
}, xp = class extends N {
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
}, Mp = class extends N {
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
    return this._client.getAPIList(A`/projects/${e}/roles`, Tt, {
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
}, Np = class extends N {
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
}, kp = class extends N {
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
}, Dp = class extends N {
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
    return this._client.getAPIList(A`/projects/${r}/groups/${e}/roles`, Tt, {
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
}, ha = class extends N {
  constructor() {
    super(...arguments), this.roles = new Dp(this._client);
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
    return this._client.getAPIList(A`/organization/projects/${e}/groups`, Tt, {
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
ha.Roles = Dp;
var $p = class extends N {
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
    return this._client.getAPIList(A`/projects/${r}/users/${e}/roles`, Tt, {
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
}, pa = class extends N {
  constructor() {
    super(...arguments), this.roles = new $p(this._client);
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
pa.Roles = $p;
var Be = class extends N {
  constructor() {
    super(...arguments), this.users = new pa(this._client), this.serviceAccounts = new Np(this._client), this.apiKeys = new Cp(this._client), this.rateLimits = new xp(this._client), this.modelPermissions = new Rp(this._client), this.hostedToolPermissions = new Pp(this._client), this.groups = new ha(this._client), this.roles = new Mp(this._client), this.dataRetention = new bp(this._client), this.spendAlerts = new kp(this._client), this.certificates = new Ip(this._client);
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
Be.Users = pa;
Be.ServiceAccounts = Np;
Be.APIKeys = Cp;
Be.RateLimits = xp;
Be.ModelPermissions = Rp;
Be.HostedToolPermissions = Pp;
Be.Groups = ha;
Be.Roles = Mp;
Be.DataRetention = bp;
Be.SpendAlerts = kp;
Be.Certificates = Ip;
var Lp = class extends N {
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
    return this._client.getAPIList(A`/organization/users/${e}/roles`, Tt, {
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
}, ma = class extends N {
  constructor() {
    super(...arguments), this.roles = new Lp(this._client);
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
ma.Roles = Lp;
var Ge = class extends N {
  constructor() {
    super(...arguments), this.auditLogs = new gp(this._client), this.adminAPIKeys = new mp(this._client), this.usage = new Tp(this._client), this.invites = new vp(this._client), this.users = new ma(this._client), this.groups = new rs(this._client), this.roles = new Ap(this._client), this.dataRetention = new _p(this._client), this.spendAlerts = new Sp(this._client), this.certificates = new yp(this._client), this.projects = new Be(this._client);
  }
};
Ge.AuditLogs = gp;
Ge.AdminAPIKeys = mp;
Ge.Usage = Tp;
Ge.Invites = vp;
Ge.Users = ma;
Ge.Groups = rs;
Ge.Roles = Ap;
Ge.DataRetention = _p;
Ge.SpendAlerts = Sp;
Ge.Certificates = yp;
Ge.Projects = Be;
var ga = class extends N {
  constructor() {
    super(...arguments), this.organization = new Ge(this._client);
  }
};
ga.Organization = Ge;
var Up = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* nI(e) {
  if (!e) return;
  if (Up in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const s of o) yield [s, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Ic(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const s = Ic(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of s)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var U = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [s, a] of nI(r)) {
      const u = s.toLowerCase();
      o.has(u) || (t.delete(s), o.add(u)), a === null ? (t.delete(s), n.add(u)) : (t.append(s, a), n.delete(u));
    }
  }
  return {
    [Up]: !0,
    values: t,
    nulls: n
  };
}, Fp = class extends N {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: U([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, qp = class extends N {
  create(e, t) {
    return this._client.post("/audio/transcriptions", lt({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Bp = class extends N {
  create(e, t) {
    return this._client.post("/audio/translations", lt({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, kr = class extends N {
  constructor() {
    super(...arguments), this.transcriptions = new qp(this._client), this.translations = new Bp(this._client), this.speech = new Fp(this._client);
  }
};
kr.Transcriptions = qp;
kr.Translations = Bp;
kr.Speech = Fp;
var Gp = class extends N {
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
    return this._client.getAPIList("/batches", ee, {
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
}, Op = class extends N {
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
    return this._client.getAPIList("/assistants", ee, {
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
}, Hp = class extends N {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Vp = class extends N {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, os = class extends N {
  constructor() {
    super(...arguments), this.sessions = new Hp(this._client), this.transcriptionSessions = new Vp(this._client);
  }
};
os.Sessions = Hp;
os.TranscriptionSessions = Vp;
var Jp = class extends N {
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
}, Kp = class extends N {
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
}, ss = class extends N {
  constructor() {
    super(...arguments), this.sessions = new Jp(this._client), this.threads = new Kp(this._client);
  }
};
ss.Sessions = Jp;
ss.Threads = Kp;
var Wp = class extends N {
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
    return this._client.getAPIList(A`/threads/${e}/messages`, ee, {
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
}, zp = class extends N {
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
    return this._client.getAPIList(A`/threads/${r}/runs/${e}/steps`, ee, {
      query: o,
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, rI = (e) => {
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
}, he, Wt, xi, at, Ao, Qe, zt, mn, Ht, Bo, $e, So, To, mr, ur, cr, Vc, Jc, Kc, Wc, zc, Yc, Xc, gr = class extends ca {
  constructor() {
    super(...arguments), he.add(this), xi.set(this, []), at.set(this, {}), Ao.set(this, {}), Qe.set(this, void 0), zt.set(this, void 0), mn.set(this, void 0), Ht.set(this, void 0), Bo.set(this, void 0), $e.set(this, void 0), So.set(this, void 0), To.set(this, void 0), mr.set(this, void 0);
  }
  [(xi = /* @__PURE__ */ new WeakMap(), at = /* @__PURE__ */ new WeakMap(), Ao = /* @__PURE__ */ new WeakMap(), Qe = /* @__PURE__ */ new WeakMap(), zt = /* @__PURE__ */ new WeakMap(), mn = /* @__PURE__ */ new WeakMap(), Ht = /* @__PURE__ */ new WeakMap(), Bo = /* @__PURE__ */ new WeakMap(), $e = /* @__PURE__ */ new WeakMap(), So = /* @__PURE__ */ new WeakMap(), To = /* @__PURE__ */ new WeakMap(), mr = /* @__PURE__ */ new WeakMap(), he = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new Wt();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const r = Tr.fromReadableStream(e, this.controller);
    for await (const o of r) E(this, he, "m", ur).call(this, o);
    if (r.controller.signal?.aborted) throw new We();
    return this._addRun(E(this, he, "m", cr).call(this));
  }
  toReadableStream() {
    return new Tr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, r) {
    const o = new Wt();
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
    for await (const u of a) E(this, he, "m", ur).call(this, u);
    if (a.controller.signal?.aborted) throw new We();
    return this._addRun(E(this, he, "m", cr).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const r = new Wt();
    return r._run(() => r._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  static createAssistantStream(e, t, n, r) {
    const o = new Wt();
    return o._run(() => o._runAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  currentEvent() {
    return E(this, So, "f");
  }
  currentRun() {
    return E(this, To, "f");
  }
  currentMessageSnapshot() {
    return E(this, Qe, "f");
  }
  currentRunStepSnapshot() {
    return E(this, mr, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(E(this, at, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(E(this, Ao, "f"));
  }
  async finalRun() {
    if (await this.done(), !E(this, zt, "f")) throw Error("Final run was not received.");
    return E(this, zt, "f");
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
    for await (const a of s) E(this, he, "m", ur).call(this, a);
    if (s.controller.signal?.aborted) throw new We();
    return this._addRun(E(this, he, "m", cr).call(this));
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
    for await (const u of a) E(this, he, "m", ur).call(this, u);
    if (a.controller.signal?.aborted) throw new We();
    return this._addRun(E(this, he, "m", cr).call(this));
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
      else if (Ns(o) && Ns(r)) o = this.accumulateDelta(o, r);
      else if (Array.isArray(o) && Array.isArray(r)) {
        if (o.every((s) => typeof s == "string" || typeof s == "number")) {
          o.push(...r);
          continue;
        }
        for (const s of r) {
          if (!Ns(s)) throw new Error(`Expected array delta entry to be an object but got: ${s}`);
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
Wt = gr, ur = function(t) {
  if (!this.ended)
    switch (H(this, So, t, "f"), E(this, he, "m", Kc).call(this, t), t.event) {
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
        E(this, he, "m", Xc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        E(this, he, "m", Jc).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        E(this, he, "m", Vc).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, cr = function() {
  if (this.ended) throw new G("stream has ended, this shouldn't happen");
  if (!E(this, zt, "f")) throw Error("Final run has not been received");
  return E(this, zt, "f");
}, Vc = function(t) {
  const [n, r] = E(this, he, "m", zc).call(this, t, E(this, Qe, "f"));
  H(this, Qe, n, "f"), E(this, Ao, "f")[n.id] = n;
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
        if (o.index != E(this, mn, "f")) {
          if (E(this, Ht, "f")) switch (E(this, Ht, "f").type) {
            case "text":
              this._emit("textDone", E(this, Ht, "f").text, E(this, Qe, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", E(this, Ht, "f").image_file, E(this, Qe, "f"));
              break;
          }
          H(this, mn, o.index, "f");
        }
        H(this, Ht, n.content[o.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (E(this, mn, "f") !== void 0) {
        const o = t.data.content[E(this, mn, "f")];
        if (o) switch (o.type) {
          case "image_file":
            this._emit("imageFileDone", o.image_file, E(this, Qe, "f"));
            break;
          case "text":
            this._emit("textDone", o.text, E(this, Qe, "f"));
            break;
        }
      }
      E(this, Qe, "f") && this._emit("messageDone", t.data), H(this, Qe, void 0, "f");
  }
}, Jc = function(t) {
  const n = E(this, he, "m", Wc).call(this, t);
  switch (H(this, mr, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const r = t.data.delta;
      if (r.step_details && r.step_details.type == "tool_calls" && r.step_details.tool_calls && n.step_details.type == "tool_calls") for (const o of r.step_details.tool_calls) o.index == E(this, Bo, "f") ? this._emit("toolCallDelta", o, n.step_details.tool_calls[o.index]) : (E(this, $e, "f") && this._emit("toolCallDone", E(this, $e, "f")), H(this, Bo, o.index, "f"), H(this, $e, n.step_details.tool_calls[o.index], "f"), E(this, $e, "f") && this._emit("toolCallCreated", E(this, $e, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      H(this, mr, void 0, "f"), t.data.step_details.type == "tool_calls" && E(this, $e, "f") && (this._emit("toolCallDone", E(this, $e, "f")), H(this, $e, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Kc = function(t) {
  E(this, xi, "f").push(t), this._emit("event", t);
}, Wc = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return E(this, at, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = E(this, at, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let r = t.data;
      if (r.delta) {
        const o = Wt.accumulateDelta(n, r.delta);
        E(this, at, "f")[t.data.id] = o;
      }
      return E(this, at, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      E(this, at, "f")[t.data.id] = t.data;
      break;
  }
  if (E(this, at, "f")[t.data.id]) return E(this, at, "f")[t.data.id];
  throw new Error("No snapshot available");
}, zc = function(t, n) {
  let r = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, r];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let o = t.data;
      if (o.delta.content) for (const s of o.delta.content) if (s.index in n.content) {
        let a = n.content[s.index];
        n.content[s.index] = E(this, he, "m", Yc).call(this, s, a);
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
}, Yc = function(t, n) {
  return Wt.accumulateDelta(n, t);
}, Xc = function(t) {
  switch (H(this, To, t.data, "f"), t.event) {
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
      H(this, zt, t.data, "f"), E(this, $e, "f") && (this._emit("toolCallDone", E(this, $e, "f")), H(this, $e, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var ya = class extends N {
  constructor() {
    super(...arguments), this.steps = new zp(this._client);
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
    return this._client.getAPIList(A`/threads/${e}/runs`, ee, {
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
    return gr.createAssistantStream(e, this._client.beta.threads.runs, t, n);
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
          await Mr(a);
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
    return gr.createAssistantStream(e, this._client.beta.threads.runs, t, n);
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
    return gr.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
ya.Steps = zp;
var is = class extends N {
  constructor() {
    super(...arguments), this.runs = new ya(this._client), this.messages = new Wp(this._client);
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
    return gr.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
is.Runs = ya;
is.Messages = Wp;
var Pn = class extends N {
  constructor() {
    super(...arguments), this.realtime = new os(this._client), this.chatkit = new ss(this._client), this.assistants = new Op(this._client), this.threads = new is(this._client);
  }
};
Pn.Realtime = os;
Pn.ChatKit = ss;
Pn.Assistants = Op;
Pn.Threads = is;
var Yp = class extends N {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, Xp = class extends N {
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(A`/containers/${r}/files/${e}/content`, {
      ...n,
      headers: U([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, _a = class extends N {
  constructor() {
    super(...arguments), this.content = new Xp(this._client);
  }
  create(e, t, n) {
    return this._client.post(A`/containers/${e}/files`, ns({
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
    return this._client.getAPIList(A`/containers/${e}/files`, ee, {
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
_a.Content = Xp;
var va = class extends N {
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
    return this._client.getAPIList("/containers", ee, {
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
var Qp = class extends N {
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
}, Aa = class extends N {
  constructor() {
    super(...arguments), this.items = new Qp(this._client);
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
Aa.Items = Qp;
var Zp = class extends N {
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
      a.embedding = rI(u);
    }), s)));
  }
}, jp = class extends N {
  retrieve(e, t, n) {
    const { eval_id: r, run_id: o } = t;
    return this._client.get(A`/evals/${r}/runs/${o}/output_items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { eval_id: r, ...o } = t;
    return this._client.getAPIList(A`/evals/${r}/runs/${e}/output_items`, ee, {
      query: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Sa = class extends N {
  constructor() {
    super(...arguments), this.outputItems = new jp(this._client);
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
    return this._client.getAPIList(A`/evals/${e}/runs`, ee, {
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
Sa.OutputItems = jp;
var Ta = class extends N {
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
    return this._client.getAPIList("/evals", ee, {
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
var em = class extends N {
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
    return this._client.getAPIList("/files", ee, {
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
      if (await Mr(t), s = await this.retrieve(e), Date.now() - o > n) throw new oa({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return s;
  }
}, tm = class extends N {
}, nm = class extends N {
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
}, Ea = class extends N {
  constructor() {
    super(...arguments), this.graders = new nm(this._client);
  }
};
Ea.Graders = nm;
var rm = class extends N {
  create(e, t, n) {
    return this._client.getAPIList(A`/fine_tuning/checkpoints/${e}/permissions`, Dt, {
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
}, wa = class extends N {
  constructor() {
    super(...arguments), this.permissions = new rm(this._client);
  }
};
wa.Permissions = rm;
var om = class extends N {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/fine_tuning/jobs/${e}/checkpoints`, ee, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Ca = class extends N {
  constructor() {
    super(...arguments), this.checkpoints = new om(this._client);
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
    return this._client.getAPIList("/fine_tuning/jobs", ee, {
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
    return this._client.getAPIList(A`/fine_tuning/jobs/${e}/events`, ee, {
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
Ca.Checkpoints = om;
var Rn = class extends N {
  constructor() {
    super(...arguments), this.methods = new tm(this._client), this.jobs = new Ca(this._client), this.checkpoints = new wa(this._client), this.alpha = new Ea(this._client);
  }
};
Rn.Methods = tm;
Rn.Jobs = Ca;
Rn.Checkpoints = wa;
Rn.Alpha = Ea;
var sm = class extends N {
}, Ia = class extends N {
  constructor() {
    super(...arguments), this.graderModels = new sm(this._client);
  }
};
Ia.GraderModels = sm;
var im = class extends N {
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
}, am = class extends N {
  retrieve(e, t) {
    return this._client.get(A`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", Dt, {
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
}, lm = class extends N {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, um = class extends N {
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
}, cm = class extends N {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, as = class extends N {
  constructor() {
    super(...arguments), this.clientSecrets = new cm(this._client), this.calls = new um(this._client);
  }
};
as.ClientSecrets = cm;
as.Calls = um;
function oI(e, t) {
  return !t || !iI(t) ? {
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
  } : dm(e, t);
}
function dm(e, t) {
  const n = e.output.map((o) => {
    if (o.type === "function_call") return {
      ...o,
      parsed_arguments: uI(t, o)
    };
    if (o.type === "message") {
      const s = o.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: sI(t, a.text)
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
function sI(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function iI(e) {
  return !!la(e.text?.format);
}
function aI(e) {
  return e?.$brand === "auto-parseable-tool";
}
function lI(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function uI(e, t) {
  const n = lI(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: aI(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function Mi(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const r of n.content) r.type === "output_text" && t.push(r.text);
  e.output_text = t.join("");
}
var rn, io, Rt, ao, Qc, Zc, jc, ed, cI = class fm extends ca {
  constructor(t) {
    super(), rn.add(this), io.set(this, void 0), Rt.set(this, void 0), ao.set(this, void 0), H(this, io, t, "f");
  }
  static createResponse(t, n, r) {
    const o = new fm(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), E(this, rn, "m", Qc).call(this);
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
    for await (const u of s) E(this, rn, "m", Zc).call(this, u, a);
    if (s.controller.signal?.aborted) throw new We();
    return E(this, rn, "m", jc).call(this);
  }
  [(io = /* @__PURE__ */ new WeakMap(), Rt = /* @__PURE__ */ new WeakMap(), ao = /* @__PURE__ */ new WeakMap(), rn = /* @__PURE__ */ new WeakSet(), Qc = function() {
    this.ended || H(this, Rt, void 0, "f");
  }, Zc = function(n, r) {
    if (this.ended) return;
    const o = (a, u) => {
      (r == null || u.sequence_number > r) && this._emit(a, u);
    }, s = E(this, rn, "m", ed).call(this, n);
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
  }, jc = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = E(this, Rt, "f");
    if (!n) throw new G("request ended without sending any events");
    H(this, Rt, void 0, "f");
    const r = dI(n, E(this, io, "f"));
    return H(this, ao, r, "f"), r;
  }, ed = function(n) {
    let r = E(this, Rt, "f");
    if (!r) {
      if (n.type !== "response.created") throw new G(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return r = H(this, Rt, n.response, "f"), r;
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
        H(this, Rt, n.response, "f");
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
    const t = E(this, ao, "f");
    if (!t) throw new G("stream ended without producing a ChatCompletion");
    return t;
  }
};
function dI(e, t) {
  return oI(e, t);
}
var hm = class extends N {
  list(e, t = {}, n) {
    return this._client.getAPIList(A`/responses/${e}/input_items`, ee, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, pm = class extends N {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, ls = class extends N {
  constructor() {
    super(...arguments), this.inputItems = new hm(this._client), this.inputTokens = new pm(this._client);
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
    return this._client.responses.create(e, t)._thenUnwrap((n) => dm(n, e));
  }
  stream(e, t) {
    return cI.createResponse(this._client, e, t);
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
ls.InputItems = hm;
ls.InputTokens = pm;
var mm = class extends N {
  retrieve(e, t) {
    return this._client.get(A`/skills/${e}/content`, {
      ...t,
      headers: U([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, gm = class extends N {
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(A`/skills/${r}/versions/${e}/content`, {
      ...n,
      headers: U([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, ba = class extends N {
  constructor() {
    super(...arguments), this.content = new gm(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(A`/skills/${e}/versions`, ns({
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
    return this._client.getAPIList(A`/skills/${e}/versions`, ee, {
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
ba.Content = gm;
var us = class extends N {
  constructor() {
    super(...arguments), this.content = new mm(this._client), this.versions = new ba(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", ns({
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
    return this._client.getAPIList("/skills", ee, {
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
us.Content = mm;
us.Versions = ba;
var ym = class extends N {
  create(e, t, n) {
    return this._client.post(A`/uploads/${e}/parts`, lt({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Pa = class extends N {
  constructor() {
    super(...arguments), this.parts = new ym(this._client);
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
Pa.Parts = ym;
var fI = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((o) => o.status === "rejected");
  if (n.length) {
    for (const o of n) console.error(o.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const r = [];
  for (const o of t) o.status === "fulfilled" && r.push(o.value);
  return r;
}, _m = class extends N {
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
    return this._client.getAPIList(A`/vector_stores/${r}/file_batches/${e}/files`, ee, {
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
          await Mr(a);
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
    return await fI(Array(s).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, vm = class extends N {
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
    return this._client.getAPIList(A`/vector_stores/${e}/files`, ee, {
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
          await Mr(a);
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
    return this._client.getAPIList(A`/vector_stores/${r}/files/${e}/content`, Dt, {
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, cs = class extends N {
  constructor() {
    super(...arguments), this.files = new vm(this._client), this.fileBatches = new _m(this._client);
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
    return this._client.getAPIList("/vector_stores", ee, {
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
    return this._client.getAPIList(A`/vector_stores/${e}/search`, Dt, {
      body: t,
      method: "post",
      ...n,
      headers: U([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
cs.Files = vm;
cs.FileBatches = _m;
var Am = class extends N {
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
      headers: U([{ Accept: "application/binary" }, n?.headers]),
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
    return this._client.post(A`/videos/${e}/remix`, ns({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, cn, Sm, Eo, Tm = class extends N {
  constructor() {
    super(...arguments), cn.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
    return await this.verifySignature(e, t, n, r), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    E(this, cn, "m", Sm).call(this, n);
    const o = U([t]).values, s = E(this, cn, "m", Eo).call(this, o, "webhook-signature"), a = E(this, cn, "m", Eo).call(this, o, "webhook-timestamp"), u = E(this, cn, "m", Eo).call(this, o, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new tr("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > r) throw new tr("Webhook timestamp is too old");
    if (c > d + r) throw new tr("Webhook timestamp is too new");
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
    throw new tr("The given webhook signature does not match the expected signature");
  }
};
cn = /* @__PURE__ */ new WeakSet(), Sm = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, Eo = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const r = t.get(n);
  if (r == null) throw new Error(`Missing required header: ${n}`);
  return r;
};
var Ni, Ra, wo, Em, hI = "workload-identity-auth", K = class {
  constructor({ baseURL: e = Pt("OPENAI_BASE_URL"), apiKey: t = Pt("OPENAI_API_KEY") ?? null, adminAPIKey: n = Pt("OPENAI_ADMIN_KEY") ?? null, organization: r = Pt("OPENAI_ORG_ID") ?? null, project: o = Pt("OPENAI_PROJECT_ID") ?? null, webhookSecret: s = Pt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: a, ...u } = {}) {
    Ni.add(this), wo.set(this, void 0), this.completions = new Yp(this), this.chat = new fa(this), this.embeddings = new Zp(this), this.files = new em(this), this.images = new im(this), this.audio = new kr(this), this.moderations = new lm(this), this.models = new am(this), this.fineTuning = new Rn(this), this.graders = new Ia(this), this.vectorStores = new cs(this), this.webhooks = new Tm(this), this.beta = new Pn(this), this.batches = new Gp(this), this.uploads = new Pa(this), this.admin = new ga(this), this.responses = new ls(this), this.realtime = new as(this), this.conversations = new Aa(this), this.evals = new Ta(this), this.containers = new va(this), this.skills = new us(this), this.videos = new Am(this);
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
    if (!c.dangerouslyAllowBrowser && dC()) throw new G(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? Ra.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = Fc(c.logLevel, "ClientOptions.logLevel", this) ?? Fc(Pt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? Gh(), H(this, wo, gC, "f");
    const h = Pt("OPENAI_CUSTOM_HEADERS");
    if (h) {
      const f = {};
      for (const p of h.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (f[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = U([f, c.defaultHeaders]);
    }
    this._options = c, a && (this._workloadIdentityAuth = new DC(a, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = r, this.project = o, this.webhookSecret = s;
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
    return TC(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${ln}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Rh()}`;
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
    const r = !E(this, Ni, "m", Em).call(this) && n || this.baseURL, o = aC(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), s = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!bc(s) || !bc(a)) && (t = {
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
    return new Zh(this, this.makeRequest(e, t, void 0));
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
    if (fe(this).debug(`[${c}] sending request`, Gt({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: s.headers
    })), r.signal?.aborted) throw new We();
    const f = r.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(a, s, u, p, f).catch(yi), g = Date.now();
    if (m instanceof globalThis.Error) {
      const v = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new We();
      const w = gi(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return fe(this).info(`[${c}] connection ${w ? "timed out" : "failed"} - ${v}`), fe(this).debug(`[${c}] connection ${w ? "timed out" : "failed"} (${v})`, Gt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: g - h,
          message: m.message
        })), this.retryRequest(r, t, n ?? c);
      throw fe(this).info(`[${c}] connection ${w ? "timed out" : "failed"} - error; no more retries left`), fe(this).debug(`[${c}] connection ${w ? "timed out" : "failed"} (error; no more retries left)`, Gt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: g - h,
        message: m.message
      })), m instanceof Bh || m instanceof sC ? m : w ? new oa() : new jo({
        message: pI(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([v]) => v === "x-request-id").map(([v, w]) => ", " + v + ": " + JSON.stringify(w)).join("")}] ${s.method} ${a} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - h}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && f.bearerAuth && !r.__metadata?.hasStreamingBody && !r.__metadata?.workloadIdentityTokenRefreshed)
        return await Mc(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...r,
          __metadata: {
            ...r.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const v = await this.shouldRetry(m);
      if (t && v) {
        const R = `retrying, ${t} attempts remaining`;
        return await Mc(m.body), fe(this).info(`${_} - ${R}`), fe(this).debug(`[${c}] response error (${R})`, Gt({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - h
        })), this.retryRequest(r, t, n ?? c, m.headers);
      }
      const w = v ? "error; no more retries left" : "error; not retryable";
      fe(this).info(`${_} - ${w}`);
      const C = await m.text().catch((R) => yi(R).message), P = cC(C), k = P ? void 0 : C;
      throw fe(this).debug(`[${c}] response error (${w})`, Gt({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: k,
        durationMs: Date.now() - h
      })), this.makeStatusError(m.status, P, k, m.headers);
    }
    return fe(this).info(_), fe(this).debug(`[${c}] response start`, Gt({
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
    return new MC(this, n, e);
  }
  async fetchWithAuth(e, t, n, r, o = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && o.bearerAuth) {
      const s = t.headers, a = s.get("Authorization");
      if (!a || a === `Bearer ${hI}`) {
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
    return await Mr(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: s, defaultBaseURL: a } = n, u = this.buildURL(o, s, a);
    "timeout" in n && uC("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
        ...mC(),
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
      body: Hh(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...E(this, wo, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
Ra = K, wo = /* @__PURE__ */ new WeakMap(), Ni = /* @__PURE__ */ new WeakSet(), Em = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
K.OpenAI = Ra;
K.DEFAULT_TIMEOUT = 6e5;
K.OpenAIError = G;
K.APIError = ge;
K.APIConnectionError = jo;
K.APIConnectionTimeoutError = oa;
K.APIUserAbortError = We;
K.NotFoundError = kh;
K.ConflictError = Dh;
K.RateLimitError = Lh;
K.BadRequestError = xh;
K.AuthenticationError = Mh;
K.InternalServerError = Uh;
K.PermissionDeniedError = Nh;
K.UnprocessableEntityError = $h;
K.InvalidWebhookSignatureError = tr;
K.toFile = qC;
K.Completions = Yp;
K.Chat = fa;
K.Embeddings = Zp;
K.Files = em;
K.Images = im;
K.Audio = kr;
K.Moderations = lm;
K.Models = am;
K.FineTuning = Rn;
K.Graders = Ia;
K.VectorStores = cs;
K.Webhooks = Tm;
K.Beta = Pn;
K.Batches = Gp;
K.Uploads = Pa;
K.Admin = ga;
K.Responses = ls;
K.Realtime = as;
K.Conversations = Aa;
K.Evals = Ta;
K.Containers = va;
K.Skills = us;
K.Videos = Am;
function pI(e) {
  if (mI(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function mI(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const r = t;
    if (r.code === "UND_ERR_INVALID_ARG" && typeof r.message == "string" && r.message.includes("invalid onRequestStart method")) return !0;
    t = r.cause;
  }
  return !1;
}
function td(e = "", t = 0) {
  let n = 0;
  for (let r = t - 1; r >= 0 && e[r] === "\\"; r -= 1) n += 1;
  return n % 2 === 1;
}
function gI(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function yI(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function _I(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function vI(e = "") {
  const t = String(e ?? "");
  let n = "", r = 0;
  for (; r < t.length; ) {
    const o = t.slice(r, r + 2), s = t.slice(r + 2, r + 6);
    if (o !== "\\u" || td(t, r) || !gI(s)) {
      n += t[r] || "", r += 1;
      continue;
    }
    const a = r + 6, u = t.slice(a + 2, a + 6);
    if (yI(s) && t.slice(a, a + 2) === "\\u" && !td(t, a) && _I(u)) {
      const c = Number.parseInt(s, 16), d = Number.parseInt(u, 16), h = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(h), r += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(s, 16)), r += 6;
  }
  return n;
}
function AI(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), vI(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function SI(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function xa(e = "", t = "", n = 0) {
  const r = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${SI(t)}(?:\\\\?")?\\s*:`, "i"), o = String(e || "").slice(Math.max(0, n)).match(r);
  if (!o || o.index === void 0) return null;
  const s = o[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + o.index + s,
    end: Math.max(0, n) + o.index + o[0].length
  };
}
function TI(e = "", t = [], n = 0) {
  return t.map((r) => xa(e, r, n)).filter(Boolean).sort((r, o) => r.index - o.index)[0] || null;
}
function et(e = "", t = "", n = []) {
  const r = String(e || ""), o = xa(r, t);
  if (!o) return;
  let s = o.end;
  for (; /\s/.test(r[s] || ""); ) s += 1;
  r[s] === '"' && (s += 1);
  const a = TI(r, n.filter((d) => d !== t), s);
  let u = a ? a.index : r.length;
  if (a) {
    const d = r.lastIndexOf(",", a.index);
    d >= s && (u = d);
  }
  let c = r.slice(s, u).trim();
  return a || (c = c.replace(/\}\s*$/, "").trimEnd()), AI(c);
}
function mt(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var dr = {
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
}, EI = [
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
function nd(e = "", t = [], n = []) {
  for (const r of t) {
    const o = et(e, r, n);
    if (o !== void 0) return o;
  }
}
function wI(e = "", t = "") {
  if (t === "Read") {
    const n = dr.Read, r = {};
    return n.forEach((o, s) => {
      const a = et(e, o, n.slice(s + 1));
      a !== void 0 && (r[o] = mt(a));
    }), r.filePath === void 0 && r.path !== void 0 && (r.filePath = r.path, delete r.path), r.filePath === void 0 && r.scope !== void 0 && (r.filePath = r.scope, delete r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "Write") {
    const n = {}, r = nd(e, ["filePath", "path"], ["content"]), o = et(e, "content", []);
    return r !== void 0 && (n.filePath = mt(r)), o !== void 0 && (n.content = mt(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, r = nd(e, ["filePath", "path"], ["edits"]), o = et(e, "edits", []);
    return r !== void 0 && (n.filePath = mt(r)), o !== void 0 && (n.edits = mt(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = dr.Grep, r = {};
    return n.forEach((o) => {
      const s = et(e, o, n.filter((a) => a !== o));
      s !== void 0 && (r[o] = mt(s));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "MemoryGrep") {
    const n = dr.MemoryGrep, r = {};
    return n.forEach((o) => {
      const s = et(e, o, n.filter((a) => a !== o));
      s !== void 0 && (r[o] = mt(s));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  if (t === "ChatHistory") {
    const n = dr.ChatHistory, r = {};
    return n.forEach((o) => {
      const s = et(e, o, n.filter((a) => a !== o));
      s !== void 0 && (r[o] = mt(s));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  return null;
}
function CI(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const a = JSON.parse(n);
    if (a && typeof a == "object" && !Array.isArray(a)) return a;
  } catch {
  }
  const r = wI(n, t);
  if (r) return r;
  const o = dr[t] || EI, s = {};
  return o.forEach((a, u) => {
    const c = et(n, a, o.slice(u + 1));
    c !== void 0 && (s[a] = mt(c));
  }), Object.keys(s).length ? s : null;
}
function II(e = "", t = "") {
  const n = CI(e, t);
  return n ? JSON.stringify(n) : "";
}
function wm(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function je(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function Pe(e) {
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
function Cm(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function Im(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : Cm(e);
  return II(n, t) || JSON.stringify(wm(n));
}
function bI(e = "") {
  const t = String(e || ""), n = xa(t, "arguments");
  if (!n) return "";
  let r = n.end;
  for (; /\s/.test(t[r] || ""); ) r += 1;
  const o = t[r] || "";
  return o === "{" ? t.slice(r).replace(/\}\s*$/, "").trimEnd() : o === '"' ? t.slice(r + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(r).replace(/\}\s*$/, "").trimEnd();
}
function PI(e = "", t = 0) {
  const n = String(e || "").trim(), r = et(n, "name", ["id", "arguments"]) || et(n, "toolName", ["id", "arguments"]) || "", o = et(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, s = bI(n);
  return !r || !s ? null : {
    id: o,
    name: r,
    arguments: Im(s, r)
  };
}
function RI(e, t = 0, n = "openai-tool") {
  if (!ye(e)) return null;
  const r = ye(e.function) ? e.function : null, o = String(r?.name || "").trim();
  if (!o) return null;
  const s = Pe(e) || {};
  return delete s.index, s.id = String(s.id || `${n}-${t + 1}`), s.type = "function", s.function = {
    ...Pe(r) || {},
    name: o,
    arguments: Cm(r.arguments)
  }, s;
}
function Yt(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, r) => RI(n, r, t)).filter(Boolean);
}
function Ma(e) {
  if (!ye(e)) return null;
  const t = Pe(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = Jt(Vt(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = Yt(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function xt(e = [], t = "openai-tool") {
  return Yt(e, t).map((n, r) => ({
    id: n.id || `${t}-${Date.now()}-${r + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function bm(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function Vt(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, r) => (je(t, "思考块", r), "")).trim(),
    thoughts: t
  };
}
function Jt(e = "") {
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
function Ot(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      je(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((r) => Ot(e, r, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && je(e, n, t.text), typeof t.content == "string" && je(e, n, t.content), typeof t.reasoning_content == "string" && je(e, n, t.reasoning_content), typeof t.thinking == "string" && je(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((r) => {
      if (typeof r == "string") {
        je(e, "推理摘要", r);
        return;
      }
      r && typeof r == "object" && je(e, "推理摘要", r.text || r.content || "");
    }));
  }
}
function Mt(e = {}, t = {}) {
  const n = [];
  return Ot(n, e.reasoning_content, "推理文本"), Ot(n, e.reasoning, "推理文本"), Ot(n, e.reasoning_text, "推理文本"), Ot(n, e.thinking, "思考块"), Ot(n, t.reasoning_content, "推理文本"), Ot(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        je(n, "推理文本", r.text);
        return;
      }
      if (r.type === "summary_text") {
        je(n, "推理摘要", r.text);
        return;
      }
      (r.type === "thinking" || r.type === "reasoning" || r.type === "reasoning_content") && je(n, "思考块", r.text || r.content || r.reasoning || "");
    }
  }), n;
}
function yr(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((r) => {
    [...e.matchAll(r)].forEach((o, s) => {
      try {
        const a = JSON.parse(o[1]);
        n.push({
          id: a.id || `tool-call-${s + 1}`,
          name: String(a.name || ""),
          arguments: Im(a.arguments, a.name)
        });
      } catch {
        const a = PI(o[1], s);
        a && n.push(a);
      }
    });
  }), n.filter((r) => r.name);
}
function ds(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : Ma(t);
}
function xI(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function MI(e) {
  if (Yt(e?.tool_calls).length > 0) return !0;
  const t = ds(e);
  return Array.isArray(t?.tool_calls) && t.tool_calls.length > 0;
}
function NI(e = {}) {
  const t = Yt(e?.tool_calls);
  if (t.length) return t;
  const n = Yt(ds(e)?.tool_calls);
  return n.length ? n : [];
}
function kI(e = {}) {
  return Yt(e?.tool_calls).length > 0;
}
function DI(e, t, n) {
  return e?.role !== "assistant" || t <= n ? !1 : MI(e);
}
function $I(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function LI(e = "") {
  return /claude/i.test(String(e || ""));
}
function Pm(e = [], t = "") {
  if (!LI(t)) return e;
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
function rd(e, t = "") {
  return !ye(e) || !$I(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var od = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function UI(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((r) => Pe(r) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((r, o) => {
    const s = Pe(r) || {}, a = Number.isInteger(Number(r?.index)) ? Number(r.index) : o, u = n[a];
    n[a] = ye(u) ? Xt(u, s, "tool_call") : s;
  }), n.filter((r) => r !== void 0);
}
function Xt(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return Pe(t);
  if (t === null && od.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return UI(e, t);
  if (typeof e == "string" && typeof t == "string")
    return od.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : Pe(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(Pe(t) || []);
  if (ye(e) && ye(t)) {
    const r = { ...e };
    return Object.entries(t).forEach(([o, s]) => {
      r[o] = Xt(r[o], s, o);
    }), r;
  }
  return Pe(t);
}
function Go(e = {}, t = {}) {
  const n = ye(e) ? Pe(e) || {} : {}, r = ye(t) ? Pe(t) || {} : {};
  return delete r.message, delete r.finish_reason, delete r.index, delete r.logprobs, delete r.delta, Object.entries(r).forEach(([o, s]) => {
    n[o] = Xt(n[o], s, o);
  }), n.role || (n.role = "assistant"), Ma(n) || { role: "assistant" };
}
function _r(e, t = {}) {
  const n = Ma(Go(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function FI(e = {}, t = {}) {
  return ye(e) ? ye(t) ? Xt(Pe(e) || {}, t, "") : Pe(e) : Pe(t);
}
function Di(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], r = xI(n), o = n.map((a, u) => {
    const c = Yt(a?.tool_calls);
    if (DI(a, u, r)) {
      const h = ds(a);
      if (kI(h)) return rd({
        ...h,
        ...c.length ? { tool_calls: c } : {}
      }, t);
    }
    const d = {
      role: a.role,
      content: a.content
    };
    return a.role === "tool" && a.tool_call_id && (d.tool_call_id = a.tool_call_id), a.role === "assistant" && c.length && (d.tool_calls = c), rd(d, t);
  }), s = String(e.systemPrompt || "").trim();
  return s && o[0]?.role !== "system" && o.unshift({
    role: "system",
    content: s
  }), Pm(o, t);
}
function sd(e) {
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
      const s = NI(o);
      if (s.length) {
        const a = ds(o), u = typeof a?.content == "string" ? a.content : String(o.content || ""), c = s.map((d, h) => {
          const f = d.function?.name || "", p = d.id || `tool-call-${h + 1}`;
          return f && n.set(p, f), `<tool_call>${JSON.stringify({
            id: p,
            name: f,
            arguments: wm(d.function?.arguments || "{}")
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
    content: sd(e)
  }) : r[0] = {
    ...r[0],
    content: sd({
      ...e,
      systemPrompt: r[0].content || e.systemPrompt
    })
  }, Pm(r, t);
}
function id(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function ad(e, t, n) {
  !e || !t || n === void 0 || (e[t] = Xt(e[t], n, t));
}
function qI(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const r = Number(n?.index ?? 0), o = { ...e.tool_calls[r] || {} };
    Object.entries(n || {}).forEach(([s, a]) => {
      if (s !== "index" && !(s === "function" && a == null)) {
        if (s === "function" && ye(a)) {
          o.function = ye(o.function) ? { ...o.function } : {}, Object.entries(a).forEach(([u, c]) => {
            o.function[u] = Xt(o.function[u], c, u);
          });
          return;
        }
        o[s] = Xt(o[s], a, s);
      }
    }), e.tool_calls[r] = o;
  }));
}
function Li(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([r, o]) => {
    r === "delta" || r === "finish_reason" || r === "index" || r === "logprobs" || ad(e, r, o);
  });
  const n = ye(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([r, o]) => {
    if (r === "tool_calls") {
      qI(e, o);
      return;
    }
    ad(e, r, o);
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
async function BI(e, t) {
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
var GI = class {
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
    return Sr({
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
    await BI(r, (g) => {
      u = g?.model || u;
      const _ = g?.choices?.[0], v = _?.delta || {};
      Li(s, _), _?.finish_reason && (a = _.finish_reason), typeof v.content == "string" && (o.content += v.content), Array.isArray(v.tool_calls) && v.tool_calls.forEach((k) => {
        Ui(o, k);
      });
      const w = Vt(o.content), C = o.toolCalls.filter((k) => k?.function?.name), P = C.length ? xt(o.toolCalls) : ki(w.cleaned);
      id(e, {
        text: C.length ? w.cleaned : Jt(w.cleaned),
        thoughts: Mt(s, _).concat(w.thoughts),
        ...P.length ? { toolCalls: P } : {},
        ...!C.length && P.length ? { toolCallDraft: !0 } : {}
      });
    });
    const c = _r(s), d = xt(o.toolCalls), h = Vt(o.content), f = Mt(s, {});
    h.thoughts.forEach((g) => f.push(g));
    const p = d.length ? [] : yr(h.cleaned), m = [...d, ...p];
    return {
      text: d.length ? h.cleaned : Jt(h.cleaned),
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
      let C = "stop", P = this.config.model, k;
      for await (const ne of _) {
        P = ne.model || P;
        const j = ne.choices?.[0], Q = j?.delta || {};
        Li(w, j), j?.finish_reason && (C = j.finish_reason), typeof Q.content == "string" && (v.content += Q.content), Array.isArray(Q.tool_calls) && Q.tool_calls.forEach((_e) => {
          Ui(v, _e);
        });
        const X = Vt(v.content), me = v.toolCalls.filter((_e) => _e?.function?.name), Oe = me.length ? xt(v.toolCalls) : ki(X.cleaned);
        id(e, {
          text: me.length ? X.cleaned : Jt(X.cleaned),
          thoughts: Mt(w, j).concat(X.thoughts),
          ...Oe.length ? { toolCalls: Oe } : {},
          ...!me.length && Oe.length ? { toolCallDraft: !0 } : {}
        });
      }
      const R = (typeof _.finalChatCompletion == "function" ? await _.finalChatCompletion() : null)?.choices?.[0] || null, I = FI(w, Go(R?.message || w, R || {}));
      k = _r(I);
      const B = xt(v.toolCalls), x = Vt(v.content), D = Mt(I, R || {});
      x.thoughts.forEach((ne) => D.push(ne));
      const O = B.length ? [] : yr(x.cleaned), z = [...B, ...O];
      return {
        text: B.length ? x.cleaned : Jt(x.cleaned),
        toolCalls: z,
        thoughts: D,
        finishReason: C,
        model: P,
        provider: "openai-compatible",
        providerPayload: k,
        requestInspection: o
      };
    }
    const s = await this.client.chat.completions.create(r, { signal: e.signal }), a = s.choices?.[0] || {}, u = a.message || {}, c = Mt(u, a), d = xt(u.tool_calls || []), h = Vt(bm(u.content));
    h.thoughts.forEach((_) => c.push(_));
    const f = d.length ? [] : yr(h.cleaned), p = [...d, ...f], m = d.length ? h.cleaned : Jt(h.cleaned), g = Go(u, a);
    return {
      text: m,
      toolCalls: p,
      thoughts: c,
      finishReason: a.finish_reason || "stop",
      model: s.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: _r(g),
      requestInspection: o
    };
  }
};
function Rm(e, t) {
  return {
    type: "message",
    role: e,
    content: OI(t)
  };
}
function Oo(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function OI(e) {
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
function Ho(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function ld(e, t = [], n = {}) {
  (t || []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        Ho(e, n.reasoning || "推理文本", r.text);
        return;
      }
      r.type === "summary_text" && Ho(e, n.summary || "推理摘要", r.text);
    }
  });
}
function HI(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (ld(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), ld(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function VI(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function JI(e) {
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
function KI(e) {
  const t = e?.choices?.[0], n = t?.message?.content, r = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const o = n.toLowerCase();
  return !o.includes("proxy error") || !o.includes("/responses") && !r.toLowerCase().includes("proxy error") ? null : n.trim();
}
function WI(e) {
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
        n.content?.trim() && t.push(Oo(n.content)), n.tool_calls.forEach((r, o) => {
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
        t.push(Oo(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? Rm(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function zI(e) {
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
      n.content?.trim() && t.push(Oo(n.content)), n.tool_calls.forEach((r, o) => {
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
      t.push(Oo(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? Rm(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function YI(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function XI(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function QI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function Bs(e, t) {
  const [n = "0", r = "0"] = String(e || "").split(":"), [o = "0", s = "0"] = String(t || "").split(":");
  return Number(n) - Number(o) || Number(r) - Number(s);
}
var ZI = class {
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
      instructions: t ? void 0 : VI(e) || void 0,
      input: t ? zI(e) : WI(e),
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
    return Sr({
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
      const d = KI(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const h = Array.isArray(c.output) ? c.output : [];
      return {
        output: h,
        thoughts: HI(h),
        toolCalls: h.filter((f) => f.type === "function_call" && f.name).map((f, p) => ({
          id: f.call_id || `response-tool-${p + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: JI(c)
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
        Array.from(p.entries()).sort(([v], [w]) => Bs(v, w)).forEach(([, v]) => Ho(_, "推理文本", v)), Array.from(m.entries()).sort(([v], [w]) => Bs(v, w)).forEach(([, v]) => Ho(_, "推理摘要", v)), QI(e, {
          text: Array.from(f.entries()).sort(([v], [w]) => Bs(v, w)).map(([, v]) => v).join(`
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
    }, s = !YI(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await o(!1) : await r(!1), u = n(a), s && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), u = n(a));
    } catch (c) {
      if (!s || !XI(c)) throw c;
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
async function jI(e, t) {
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
var xn = "openai", Na = "claude", ka = "makersuite", eb = "/api/backends/chat-completions/status", tb = "/api/backends/chat-completions/generate", xm = Object.freeze({
  [Na]: "https://api.anthropic.com/v1",
  [ka]: "https://generativelanguage.googleapis.com"
}), Mm = null;
function nb(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function rb(e, t) {
  const n = nb(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function ob(e) {
  Mm = typeof e == "function" ? e : null;
}
async function Nm() {
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(Mm?.() || {}),
    Accept: "application/json"
  };
}
function sb(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : r;
  }), t;
}
async function Dr(e = {}, t = !1) {
  const n = await Nm(), r = {
    url: tb,
    method: "POST",
    headers: sb(n),
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
function ib(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function ab(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function lb() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function ud(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function cd(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => ud(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => ud(n));
}
function ub(e = "") {
  const t = String(e || ""), n = cd((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), r = cd(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), o = n || r;
  return o.length > 240 ? `${o.slice(0, 237)}...` : o;
}
function cb(e = null) {
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
function db(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function Sn(e = "", t = "", n = null) {
  if (ab(e)) return lb();
  const r = cb(n);
  if (ib(e) || /\btext\/html\b/i.test(r.contentType)) {
    const o = db(r), s = ub(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      o ? `（${o}）` : "",
      s ? `：${s}` : ""
    ].join("");
  }
  return String(e || t || "").trim();
}
function km(e = {}, t = xn) {
  const n = rb(e.baseUrl, t), r = String(e.apiKey || "").trim(), o = xm[t] || "", s = n || (r ? o : ""), a = { chat_completion_source: t || "openai" };
  return s && (a.reverse_proxy = s), r && (a.proxy_password = r), a;
}
function fb(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function hb(e = {}, t = xn) {
  return km(e, t);
}
function Da(e = {}, t = {}, n = [], r = !1, o = xn) {
  return fb({
    ...km(e, o),
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
function pb(e = {}, t = {}, n = [], r = !1) {
  return Da(e, t, n, r, xn);
}
function mb(e = {}, t = {}, n = [], r = !1) {
  return Da(e, t, n, r, Na);
}
function gb(e = {}, t = {}, n = [], r = !1) {
  return Da(e, t, n, r, ka);
}
async function yb(e = {}, t = xn, n = {}) {
  const r = await fetch(eb, {
    method: "POST",
    headers: await Nm(),
    body: JSON.stringify(hb(e, t)),
    signal: n.signal
  }), o = await r.text();
  let s = null;
  try {
    s = o ? JSON.parse(o) : {};
  } catch (u) {
    throw new Error(`酒馆后端模型列表拉取失败：${Sn(o, String(u?.message || u), r)}`);
  }
  if (!r.ok || s?.error) {
    const u = Sn(s?.message || s?.error?.message || o, `HTTP ${r.status}`, r);
    throw new Error(`酒馆后端模型列表拉取失败：${u}`);
  }
  const a = Array.isArray(s?.data) ? s.data.map((u) => String(u?.id || u?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(a)];
}
async function $a(e = {}, t = {}) {
  const n = await Dr(e, !1);
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
    throw new Error(`酒馆后端生成失败：${Sn(o, String(a?.message || a), r)}`);
  }
  if (!r.ok || s?.error) {
    const a = Sn(s?.error?.message || s?.message || o, `HTTP ${r.status}`, r);
    throw new Error(`酒馆后端生成失败：${a}`);
  }
  return s;
}
async function La(e = {}, t, n = {}) {
  const r = await Dr(e, !0);
  typeof n.onRequest == "function" && n.onRequest(r);
  const o = await fetch(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!o.ok) {
    const s = await o.text().catch(() => "");
    throw new Error(Sn(s, `酒馆后端流式生成失败：HTTP ${o.status}`, o));
  }
  await jI(o, (s) => {
    if (s?.error) {
      const a = Sn(s.error?.message || s.message || JSON.stringify(s.error), "酒馆后端流式生成失败");
      throw new Error(a);
    }
    t(s);
  });
}
function Qt(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Dm(e = "") {
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
function _b(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const r = Dm(t.function.arguments || "{}");
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
function vb(e = []) {
  const t = Array.isArray(e) ? Qt(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function Ab(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  return t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const o = Qt(r) || {}, s = vb(o?.providerPayload?.anthropicContent), a = _b(o.tool_calls);
    delete o.providerPayload, o.role === "assistant" && s && a.length ? (delete o.tool_calls, o.content = s.filter((u) => u?.type !== "tool_use").concat(a)) : o.role === "assistant" && s && (delete o.tool_calls, o.content = s), n.push(o);
  }), n;
}
function Sb(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const r = Dm(t.inputJson);
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
      const n = Qt(t.input);
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
    } : Qt(t) || null;
  }).filter(Boolean);
}
function Tb(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: Qt(t.input) || {}
  } : Qt(t) || null).filter(Boolean);
}
function Eb(e = []) {
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
function $m(e = [], t = {}) {
  const n = Sb(e), r = n.filter((o) => o.type === "tool_use" && o.name).map((o, s) => ({
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
    providerPayload: n.length ? { anthropicContent: Tb(n) } : void 0
  };
}
function wb(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Cb(e, t = {}) {
  const n = [];
  let r = "stop", o = t.model || "";
  const s = (u, c = {}) => {
    const d = Number.isInteger(Number(u)) ? Number(u) : n.length;
    return n[d] ? n[d] = {
      ...n[d],
      ...c
    } : n[d] = { ...c }, n[d];
  }, a = () => {
    const u = Eb(n);
    wb(e, {
      text: u.text,
      thoughts: u.thoughts,
      ...Array.isArray(u.toolCalls) ? { toolCalls: u.toolCalls } : {},
      ...u.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(u = {}) {
      if (u?.message?.model && (o = u.message.model), u.type === "content_block_start") {
        s(u.index, Qt(u.content_block) || {}), a();
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
      return $m(n, {
        finishReason: r,
        model: o
      });
    }
  };
}
var Ib = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return Ab(e);
  }
  buildPayload(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildMessages(e);
    return mb(this.config, e, n, t);
  }
  async inspectRequest(e, t = {}) {
    const n = await Dr(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n);
  }
  buildRequestInspection(e) {
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: An(e)
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
        const a = Cb(e, this.config);
        return await La(n, (u) => {
          a.accept(u);
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
        ...$m(Array.isArray(s?.content) ? s.content : [{
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
function Tn(e) {
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
function bb(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((o) => Tn(o)).filter((o) => Array.isArray(o.parts) && o.parts.length);
  const n = e?.providerPayload?.googleContent, r = Tn(n);
  return r.parts.length ? [r] : [];
}
function Pb(e = {}) {
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
function Rb(e = {}, t = 0) {
  const n = Tn(e);
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
    const u = Pb(a.inlineData);
    u && r.content.push(u);
  }), s.length && r.content.push({
    type: "tool_calls",
    tool_calls: s
  }), o && r.content.some((a) => a?.type === "text") && (r.signature = o), r.content.length ? r : null;
}
function xb(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  return t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const o = bb(r);
    if (r.role === "assistant" && o.length) {
      o.forEach((a, u) => {
        const c = Rb(a, u);
        c && n.push(c);
      });
      return;
    }
    const s = Ua(r) || {};
    delete s.providerPayload, n.push(s);
  }), n;
}
function Lm(e = {}) {
  return Tn(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function Um(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function Fm(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function qm(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function Mb(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
function Nb(e = [], t = []) {
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
function Bm(e) {
  const t = Tn(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function kb(e = {}, t = {}) {
  const n = Lm(e), r = e?.choices?.[0]?.message?.content || "";
  return {
    text: Um(n) || r,
    toolCalls: qm(n),
    thoughts: Fm(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: Bm(n)
  };
}
function Db(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function $b(e, t = {}) {
  let n = "", r = [], o = [], s = "STOP", a = t.model || "";
  const u = [];
  return {
    accept(c = {}) {
      a = c.model || c.modelVersion || a, s = c?.candidates?.[0]?.finishReason || s;
      const d = Lm(c);
      d.parts.length && u.push(...Ua(d.parts) || []), n = Mb(n, Um(d)), r = Nb(r, qm(d));
      const h = Fm(d);
      h.length && (o = h), Db(e, {
        text: n,
        thoughts: o,
        ...r.length ? {
          toolCalls: r,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const c = Tn({
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
        providerPayload: Bm(c)
      };
    }
  };
}
var Lb = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return xb(e);
  }
  buildPayload(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildMessages(e);
    return gb(this.config, e, n, t);
  }
  async inspectRequest(e, t = {}) {
    const n = await Dr(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n);
  }
  buildRequestInspection(e) {
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: An(e)
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
        const s = $b(e, this.config);
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
        ...kb(await $a(n, {
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
function Ub(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Gs(e, t = []) {
  const n = Vt(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : Jt(n.cleaned)
  };
}
function Fb(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var qb = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? $i(e, this.config.model) : Di(e, this.config.model);
  }
  buildPayload(e, t = !1) {
    const n = t ? $i(e, this.config.model) : Di(e, this.config.model);
    return pb(this.config, t ? {
      ...e,
      tools: void 0,
      toolChoice: void 0
    } : e, n, typeof e.onStreamProgress == "function");
  }
  async inspectRequest(e, t = {}) {
    const n = await Dr(t.payload || this.buildPayload(e, !!t.taggedMode), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n);
  }
  buildRequestInspection(e) {
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: An(e)
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
      Li(o, m), m.finish_reason && (s = m.finish_reason), typeof g.content == "string" && (r.content += g.content), Array.isArray(g.tool_calls) && g.tool_calls.forEach((P) => {
        Ui(r, P);
      });
      const _ = r.toolCalls.filter((P) => P?.function?.name), { thinkTagged: v, cleanedText: w } = Gs(r.content, _), C = _.length ? xt(r.toolCalls, "st-openai-tool") : ki(v.cleaned);
      Ub(e, {
        text: w,
        thoughts: Mt(o, m).concat(v.thoughts),
        ...C.length ? { toolCalls: C } : {},
        ...!_.length && C.length ? { toolCallDraft: !0 } : {}
      });
    }, {
      signal: e.signal,
      onRequest: n.onRequest
    });
    const u = xt(r.toolCalls, "st-openai-tool"), { thinkTagged: c, cleanedText: d } = Gs(r.content, u), h = Mt(o, {});
    c.thoughts.forEach((p) => h.push(p));
    const f = u.length ? [] : yr(c.cleaned);
    return {
      text: d,
      toolCalls: [...u, ...f],
      thoughts: h,
      finishReason: s,
      model: a,
      provider: "sillytavern-openai-compatible",
      providerPayload: _r(o)
    };
  }
  async nonStreamingChat(e, t, n = {}) {
    const r = await $a(t, {
      signal: e.signal,
      onRequest: n.onRequest
    }), o = r.choices?.[0] || {}, s = o.message || {}, a = Mt(s, o), u = xt(s.tool_calls || [], "st-openai-tool"), { thinkTagged: c, cleanedText: d } = Gs(bm(s.content), u);
    c.thoughts.forEach((p) => a.push(p));
    const h = u.length ? [] : yr(c.cleaned), f = Go(s, o);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: a,
      finishReason: o.finish_reason || "stop",
      model: r.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: _r(f)
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
      if (t || !n || !Fb(s)) throw s;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await r(this.buildPayload(e, !0));
  }
}, dd = 900 * 1e3, fd = Object.freeze([{
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
]), Bb = Object.freeze([
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
function Gb(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function Le(e = "") {
  return Fi.some((t) => t.value === e) ? e : "medium";
}
function Ue(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, r = Number(n);
  return Number.isFinite(r) ? Math.max(0, Math.min(2, r)) : Ue(t, 1);
}
function vn(e = {}) {
  return e.sendTemperature !== !1;
}
function hd(e = {}) {
  return vn(e) ? Ue(e.temperature, 1) : void 0;
}
function pd(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : Bb.find((n) => n.value === e)?.label || e || "未配置";
}
function Ob(e = {}, t = {}) {
  const n = uo(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const c = n.delegateConfig.provider || "openai-compatible", d = (n.delegateConfig.modelConfigs || dn())[c] || dn()[c] || {};
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: c,
      baseUrl: String(d.baseUrl || ""),
      model: String(d.model || ""),
      apiKey: String(d.apiKey || ""),
      tavilyApiKey: Os(n.tavilyApiKey),
      tavilyBaseUrl: Ke(n.tavilyBaseUrl),
      temperature: hd(d),
      sendTemperature: vn(d),
      maxTokens: Ce(d.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: d.toolMode || "native",
      reasoningEnabled: !!d.reasoningEnabled,
      reasoningEffort: Le(d.reasoningEffort)
    };
  }
  const r = re(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), o = n.presets?.[r] ? r : n.presets?.[n.currentPresetName] ? n.currentPresetName : Jo, s = n.presets?.[o] || Te(), a = s.provider || n.provider || "openai-compatible", u = (s.modelConfigs || n.modelConfigs || dn())[a] || dn()[a] || {};
  return {
    currentPresetName: String(o || ""),
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    tavilyApiKey: Os(n.tavilyApiKey),
    tavilyBaseUrl: Ke(n.tavilyBaseUrl),
    temperature: hd(u),
    sendTemperature: vn(u),
    maxTokens: Ce(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoningEnabled: !!u.reasoningEnabled,
    reasoningEffort: Le(u.reasoningEffort)
  };
}
function Hb(e = {}, t = {}) {
  if (!e.apiKey && !Gb(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (e.provider) {
    case "sillytavern-openai-compatible":
      return new qb(e);
    case "sillytavern-claude":
      return new Ib(e);
    case "sillytavern-google":
      return new Lb(e);
    case "openai-responses":
      return new ZI(e);
    case "anthropic":
      return new iy(e);
    case "google":
      return new oC(e);
    default:
      return new GI(e);
  }
}
var Vb = { chat: { exclude: [
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
] } }, Jb = Object.freeze([
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
function Er(e = []) {
  const t = [...new Set(e.filter(Boolean).map((o) => String(o).trim()).filter(Boolean))], n = Vb.chat, r = t.filter((o) => {
    const s = o.toLowerCase();
    return !n.exclude.some((a) => s.includes(a));
  });
  return r.length ? r : t;
}
function lo(e = "") {
  return e === "delegate" ? "delegate" : "main";
}
function En(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function Kb(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function on(e = "") {
  return e === "openai-compatible" || e === "sillytavern-openai-compatible";
}
function Wb(e = "") {
  return e === "anthropic" || e === "sillytavern-claude";
}
function zb(e = "") {
  return e === "sillytavern-claude" ? Na : e === "sillytavern-google" ? ka : xn;
}
function wr(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function Yb(e) {
  const t = En(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return wr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return wr([`${t}/v1/models`, `${t}/models`]);
}
function Gm(e) {
  const t = En(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return wr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return wr([`${t}/v1/models`, `${t}/models`]);
}
function Xb(e, t) {
  const n = En(e);
  if (!n) return [];
  const r = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return wr([
    `${n}/models?key=${encodeURIComponent(t)}`,
    `${n}/models`,
    `${r}/v1beta/models?key=${encodeURIComponent(t)}`,
    `${r}/v1beta/models`,
    `${r}/models?key=${encodeURIComponent(t)}`,
    `${r}/models`
  ]);
}
function Qb(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((r) => typeof r == "string" && r.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function Zb(e, t = {}) {
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
    errorSnippet: Qb(o, r)
  };
}
function jb(e) {
  return Er((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function Om(e) {
  return Er((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function e0(e) {
  return Er((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function Co({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: r }) {
  let o = null;
  for (const s of e) for (const a of t) {
    const u = await Zb(s, a);
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
async function t0(e) {
  const t = String(e.apiKey || "").trim(), n = En(e.baseUrl || ""), r = En(n || xm.claude);
  if (t && r) try {
    return await Co({
      urls: Gm(r),
      requestOptionsList: [{ headers: {
        "x-api-key": t,
        "anthropic-version": "2023-06-01",
        Accept: "application/json"
      } }],
      extractModels: Om,
      providerLabel: "Anthropic"
    });
  } catch (o) {
    if (n) throw o;
  }
  return [...Jb];
}
async function md(e) {
  const t = e.provider, n = En(e.baseUrl || ""), r = String(e.apiKey || "").trim();
  if (t === "sillytavern-claude") return Er(await t0(e));
  if (Kb(t)) return Er(await yb(e, zb(t)));
  if (!r) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await Co({
    urls: Xb(n, r),
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
    extractModels: e0,
    providerLabel: "Google AI"
  }) : Wb(t) ? await Co({
    urls: Gm(n),
    requestOptionsList: [{ headers: {
      "x-api-key": r,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: Om,
    providerLabel: "Anthropic"
  }) : await Co({
    urls: Yb(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${r}`,
      Accept: "application/json"
    } }],
    extractModels: jb,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function n0(e) {
  return e instanceof Error ? e.message : String(e || "unknown_error");
}
function l0(e = {}) {
  const { state: t, render: n, showToast: r, createRequestId: o = (y = "req") => `${y}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, saveConfig: s, describeError: a = n0, getRuntimeSummaryText: u } = e;
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
    const b = t.config?.presets || {}, F = re(y || S || "默认");
    return b[F] ? F : S && b[S] ? S : Object.keys(b)[0] || "默认";
  }
  function _(y, S) {
    const b = g(y, Jo), F = S && typeof S == "object" ? S : Te(), W = F.provider || "openai-compatible", Z = Fe(F.modelConfigs || {}), se = Z[W] || {};
    return {
      delegatePresetName: b,
      delegateProvider: W,
      delegateModelConfigs: Z,
      delegateBaseUrl: String(se.baseUrl || ""),
      delegateModel: String(se.model || ""),
      delegateApiKey: String(se.apiKey || ""),
      delegateTemperature: Ue(se.temperature, 1),
      delegateMaxTokens: Ce(se.maxTokens),
      delegateSendTemperature: vn(se),
      delegateReasoningEnabled: !!se.reasoningEnabled,
      delegateReasoningEffort: Le(se.reasoningEffort),
      delegateToolMode: se.toolMode || "native"
    };
  }
  function v(y = "openai-compatible", S = {}) {
    const b = Fe(S || {})[y] || {};
    return {
      baseUrl: String(b.baseUrl || ""),
      model: String(b.model || ""),
      apiKey: String(b.apiKey || ""),
      temperature: Ue(b.temperature, 1),
      maxTokens: Ce(b.maxTokens),
      sendTemperature: vn(b),
      reasoningEnabled: !!b.reasoningEnabled,
      reasoningEffort: Le(b.reasoningEffort),
      toolMode: b.toolMode || "native"
    };
  }
  function w(y = "openai-compatible", S = {}) {
    const b = Fe(S || {})[y] || {};
    return {
      delegateBaseUrl: String(b.baseUrl || ""),
      delegateModel: String(b.model || ""),
      delegateApiKey: String(b.apiKey || ""),
      delegateTemperature: Ue(b.temperature, 1),
      delegateMaxTokens: Ce(b.maxTokens),
      delegateSendTemperature: vn(b),
      delegateReasoningEnabled: !!b.reasoningEnabled,
      delegateReasoningEffort: Le(b.reasoningEffort),
      delegateToolMode: b.toolMode || "native"
    };
  }
  function C(y, S, b = t.config) {
    const F = re(y || "默认"), W = S && typeof S == "object" ? S : Te(), Z = W.provider || "openai-compatible", se = Fe(W.modelConfigs || {}), ut = v(Z, se), ct = g(b?.delegatePresetName, F), fs = _(ct, b?.delegateConfig && typeof b.delegateConfig == "object" ? b.delegateConfig : (b?.presets || {})[ct] || W);
    return {
      currentPresetName: F,
      presetDraftName: F,
      provider: Z,
      modelConfigs: se,
      ...ut,
      tavilyApiKey: String(b?.tavilyApiKey || ""),
      tavilyBaseUrl: Ke(b?.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: fn(W.permissionMode),
      jsApiPermission: yt(b?.jsApiPermission),
      ...fs
    };
  }
  function P() {
    if (t.configDraft) return t.configDraft;
    const y = re(t.config?.currentPresetName || "默认");
    return t.configDraft = C(y, (t.config?.presets || {})[y] || Te()), t.configDraft;
  }
  function k(y) {
    const S = P(), b = y.querySelector("#xb-assistant-provider")?.value || S.provider || "openai-compatible", F = y.querySelector("#xb-assistant-delegate-provider")?.value || S.delegateProvider || "openai-compatible", W = {
      baseUrl: y.querySelector("#xb-assistant-base-url")?.value.trim() || "",
      model: y.querySelector("#xb-assistant-model")?.value.trim() || "",
      apiKey: y.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      temperature: Ue(y.querySelector("#xb-assistant-temperature")?.value, S.temperature ?? 1),
      maxTokens: Ce(y.querySelector("#xb-assistant-max-tokens")?.value, S.maxTokens),
      sendTemperature: y.querySelector("#xb-assistant-send-temperature")?.checked ?? !!(S.sendTemperature ?? !0),
      reasoningEnabled: y.querySelector("#xb-assistant-reasoning-enabled")?.checked || !1,
      reasoningEffort: Le(y.querySelector("#xb-assistant-reasoning-effort")?.value),
      toolMode: on(b) ? y.querySelector("#xb-assistant-tool-mode")?.value || S.toolMode || "native" : void 0
    }, Z = {
      baseUrl: y.querySelector("#xb-assistant-delegate-base-url")?.value.trim() ?? S.delegateBaseUrl ?? "",
      model: y.querySelector("#xb-assistant-delegate-model")?.value.trim() ?? S.delegateModel ?? "",
      apiKey: y.querySelector("#xb-assistant-delegate-api-key")?.value.trim() ?? S.delegateApiKey ?? "",
      temperature: Ue(y.querySelector("#xb-assistant-delegate-temperature")?.value, S.delegateTemperature ?? 1),
      maxTokens: Ce(y.querySelector("#xb-assistant-delegate-max-tokens")?.value, S.delegateMaxTokens),
      sendTemperature: y.querySelector("#xb-assistant-delegate-send-temperature")?.checked ?? !!(S.delegateSendTemperature ?? !0),
      reasoningEnabled: y.querySelector("#xb-assistant-delegate-reasoning-enabled")?.checked ?? !!S.delegateReasoningEnabled,
      reasoningEffort: Le(y.querySelector("#xb-assistant-delegate-reasoning-effort")?.value || S.delegateReasoningEffort),
      toolMode: on(F) ? y.querySelector("#xb-assistant-delegate-tool-mode")?.value || S.delegateToolMode || "native" : void 0
    }, se = {
      ...Fe(S.modelConfigs || {}),
      [b]: {
        ...Fe(S.modelConfigs || {})[b] || {},
        ...W
      }
    }, ut = {
      ...Fe(S.delegateModelConfigs || {}),
      [F]: {
        ...Fe(S.delegateModelConfigs || {})[F] || {},
        ...Z
      }
    };
    return {
      ...S,
      currentPresetName: S.currentPresetName,
      presetDraftName: re(y.querySelector("#xb-assistant-preset-name")?.value),
      provider: b,
      modelConfigs: se,
      baseUrl: W.baseUrl,
      model: W.model,
      apiKey: W.apiKey,
      temperature: W.temperature,
      maxTokens: W.maxTokens,
      sendTemperature: W.sendTemperature,
      reasoningEnabled: W.reasoningEnabled,
      reasoningEffort: W.reasoningEffort,
      toolMode: W.toolMode || S.toolMode || "native",
      tavilyApiKey: y.querySelector("#xb-assistant-tavily-api-key")?.value.trim() || "",
      tavilyBaseUrl: Ke(S.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: fn(y.querySelector("#xb-assistant-permission-mode")?.value || S.permissionMode),
      jsApiPermission: yt(y.querySelector("#xb-assistant-jsapi-permission")?.value || S.jsApiPermission),
      delegatePresetName: g(y.querySelector("#xb-assistant-delegate-preset-select")?.value || S.delegatePresetName, S.currentPresetName),
      delegateProvider: F,
      delegateModelConfigs: ut,
      delegateBaseUrl: Z.baseUrl,
      delegateModel: Z.model,
      delegateApiKey: Z.apiKey,
      delegateTemperature: Z.temperature,
      delegateMaxTokens: Z.maxTokens,
      delegateSendTemperature: Z.sendTemperature,
      delegateReasoningEnabled: Z.reasoningEnabled,
      delegateReasoningEffort: Z.reasoningEffort,
      delegateToolMode: Z.toolMode || S.delegateToolMode || "native"
    };
  }
  function R(y) {
    return t.configDraft = k(y), t.configDraft;
  }
  function I(y = P()) {
    return {
      baseUrl: String(y.baseUrl || ""),
      model: String(y.model || ""),
      apiKey: String(y.apiKey || ""),
      temperature: Ue(y.temperature, 1),
      maxTokens: Ce(y.maxTokens),
      sendTemperature: !!(y.sendTemperature ?? !0),
      reasoningEnabled: !!y.reasoningEnabled,
      reasoningEffort: Le(y.reasoningEffort),
      toolMode: on(y.provider) ? y.toolMode || "native" : void 0
    };
  }
  function B(y = P()) {
    return {
      baseUrl: String(y.delegateBaseUrl || ""),
      model: String(y.delegateModel || ""),
      apiKey: String(y.delegateApiKey || ""),
      temperature: Ue(y.delegateTemperature, 1),
      maxTokens: Ce(y.delegateMaxTokens),
      sendTemperature: !!(y.delegateSendTemperature ?? !0),
      reasoningEnabled: !!y.delegateReasoningEnabled,
      reasoningEffort: Le(y.delegateReasoningEffort),
      toolMode: on(y.delegateProvider) ? y.delegateToolMode || "native" : void 0
    };
  }
  function x(y = P()) {
    const S = y.delegateProvider || "openai-compatible", b = Fe(y.delegateModelConfigs || {});
    return {
      provider: S,
      modelConfigs: {
        ...b,
        [S]: {
          ...b[S] || {},
          ...B(y)
        }
      }
    };
  }
  function D(y = P()) {
    return {
      provider: y.provider || "openai-compatible",
      baseUrl: y.baseUrl || "",
      model: y.model || "",
      apiKey: y.apiKey || "",
      tavilyApiKey: y.tavilyApiKey || "",
      tavilyBaseUrl: Ke(y.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: y.sendTemperature === !1 ? void 0 : Ue(y.temperature, 1),
      sendTemperature: !!(y.sendTemperature ?? !0),
      maxTokens: Ce(y.maxTokens),
      timeoutMs: dd,
      toolMode: y.toolMode || "native",
      reasoningEnabled: !!y.reasoningEnabled,
      reasoningEffort: Le(y.reasoningEffort)
    };
  }
  function O(y = P()) {
    return {
      provider: y.delegateProvider || "openai-compatible",
      baseUrl: y.delegateBaseUrl || "",
      model: y.delegateModel || "",
      apiKey: y.delegateApiKey || "",
      tavilyApiKey: y.tavilyApiKey || "",
      tavilyBaseUrl: Ke(y.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: y.delegateSendTemperature === !1 ? void 0 : Ue(y.delegateTemperature, 1),
      sendTemperature: !!(y.delegateSendTemperature ?? !0),
      maxTokens: Ce(y.delegateMaxTokens),
      timeoutMs: dd,
      toolMode: y.delegateToolMode || "native",
      reasoningEnabled: !!y.delegateReasoningEnabled,
      reasoningEffort: Le(y.delegateReasoningEffort)
    };
  }
  function z(y = {}) {
    const S = (y.role === "delegate", P());
    return y.role === "delegate" ? O(S) : D(S);
  }
  function ne(y) {
    P(), t.configDraft = {
      ...t.configDraft,
      presetDraftName: re(y.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function j(y = P(), S = y.provider || "openai-compatible", b = "main") {
    const F = h(S, b);
    return typeof u == "function" ? u({
      state: t,
      draft: y,
      provider: S,
      pullState: F,
      providerLabel: pd(S)
    }) : `预设「${y.currentPresetName || "默认"}」 · ${pd(S)}`;
  }
  function Q(y, S, b) {
    const F = y?.querySelector?.(S);
    if (!F) return;
    const W = String(b?.status || "idle"), Z = String(b?.message || "").trim();
    F.textContent = Z, F.hidden = !Z, F.classList.toggle("is-loading", W === "loading"), F.classList.toggle("is-success", W === "success"), F.classList.toggle("is-error", W === "error");
  }
  function X(y) {
    if (!y) return;
    const S = lo(t.configPage);
    t.configPage = S, y.querySelectorAll("[data-config-page]").forEach((b) => {
      const F = lo(b?.dataset?.configPage) === S;
      b.classList.toggle("is-active", F), b.setAttribute("aria-selected", F ? "true" : "false");
    }), y.querySelectorAll("[data-config-page-panel]").forEach((b) => {
      const F = lo(b?.dataset?.configPagePanel) === S;
      b.toggleAttribute("hidden", !F);
    }), y.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("hidden", S === "delegate");
  }
  function me(y) {
    if (!t.config) return;
    X(y);
    const S = P(), b = S.provider || "openai-compatible", F = m(b), W = S.delegateProvider || "openai-compatible", Z = m(W, "delegate"), se = y.querySelector("#xb-assistant-tool-mode-wrap"), ut = y.querySelector("#xb-assistant-tool-mode"), ct = y.querySelector("#xb-assistant-reasoning-enabled"), fs = y.querySelector("#xb-assistant-reasoning-effort-wrap"), qa = y.querySelector("#xb-assistant-reasoning-effort"), hs = y.querySelector("#xb-assistant-permission-mode"), ps = y.querySelector("#xb-assistant-jsapi-permission"), Ba = y.querySelector("#xb-assistant-model-pulled"), Ga = y.querySelector("#xb-assistant-max-tokens"), ms = y.querySelector("#xb-assistant-preset-select"), Oa = y.querySelector("#xb-assistant-preset-name"), gs = y.querySelector("#xb-assistant-delegate-preset-select"), Ha = y.querySelector("#xb-assistant-delegate-provider"), Va = y.querySelector("#xb-assistant-delegate-base-url"), Ja = y.querySelector("#xb-assistant-delegate-model"), Ka = y.querySelector("#xb-assistant-delegate-api-key"), Wa = y.querySelector("#xb-assistant-tavily-api-key"), ys = y.querySelector("#xb-assistant-delegate-model-pulled"), za = y.querySelector("#xb-assistant-delegate-max-tokens"), Ya = y.querySelector("#xb-assistant-delegate-tool-mode-wrap"), _s = y.querySelector("#xb-assistant-delegate-tool-mode"), Xa = y.querySelector("#xb-assistant-delegate-reasoning-enabled"), Qa = y.querySelector("#xb-assistant-delegate-reasoning-effort-wrap"), vs = y.querySelector("#xb-assistant-delegate-reasoning-effort");
    if (!ms || !Oa) return;
    const Za = (t.config.presetNames || []).map((He) => ({
      value: He,
      label: He
    }));
    it(ms, Za), ms.value = S.currentPresetName || t.config.currentPresetName || "默认", gs && (it(gs, Za), gs.value = g(S.delegatePresetName, S.currentPresetName)), Oa.value = S.presetDraftName || S.currentPresetName || "默认", y.querySelector("#xb-assistant-provider").value = b, y.querySelector("#xb-assistant-base-url").value = S.baseUrl || "", y.querySelector("#xb-assistant-model").value = S.model || "", y.querySelector("#xb-assistant-api-key").value = S.apiKey || "", Ga && (Ga.value = String(Ce(S.maxTokens))), y.querySelector("#xb-assistant-temperature").value = String(Ue(S.temperature, 1)), y.querySelector("#xb-assistant-send-temperature").checked = !!(S.sendTemperature ?? !0), Wa && (Wa.value = S.tavilyApiKey || ""), se.style.display = on(b) ? "" : "none", it(ut, fd), ut.value = S.toolMode || "native", hs && (it(hs, ng), hs.value = fn(S.permissionMode)), ps && (it(ps, rg), ps.value = yt(S.jsApiPermission)), it(qa, Fi), ct.checked = !!S.reasoningEnabled, qa.value = Le(S.reasoningEffort), fs.style.display = ct.checked ? "" : "none", it(Ba, F.map((He) => ({
      value: He,
      label: He
    })), "手动填写"), Ba.value = F.includes(S.model) ? S.model : "", Ha && (Ha.value = W), Va && (Va.value = S.delegateBaseUrl || ""), Ja && (Ja.value = S.delegateModel || ""), Ka && (Ka.value = S.delegateApiKey || "");
    const ja = y.querySelector("#xb-assistant-delegate-temperature"), el = y.querySelector("#xb-assistant-delegate-send-temperature");
    za && (za.value = String(Ce(S.delegateMaxTokens))), ja && (ja.value = String(Ue(S.delegateTemperature, 1))), el && (el.checked = !!(S.delegateSendTemperature ?? !0)), Ya && (Ya.style.display = on(W) ? "" : "none"), _s && (it(_s, fd), _s.value = S.delegateToolMode || "native"), vs && (it(vs, Fi), vs.value = Le(S.delegateReasoningEffort)), Xa && (Xa.checked = !!S.delegateReasoningEnabled), Qa && (Qa.style.display = S.delegateReasoningEnabled ? "" : "none"), ys && (it(ys, Z.map((He) => ({
      value: He,
      label: He
    })), "手动填写"), ys.value = Z.includes(S.delegateModel) ? S.delegateModel : ""), Q(y, "#xb-assistant-model-pull-status", h(b)), Q(y, "#xb-assistant-delegate-model-pull-status", h(W, "delegate"));
    const tl = y.querySelector("#xb-assistant-runtime");
    if (tl) {
      const He = t.configPage === "delegate";
      tl.textContent = j(He ? {
        ...S,
        currentPresetName: "分身",
        provider: W
      } : S, He ? W : b, He ? "delegate" : "main");
    }
  }
  function Oe(y) {
    if (typeof s != "function") return;
    const S = s(y);
    S && typeof S.catch == "function" && S.catch((b) => {
      r?.(a(b));
    });
  }
  function _e(y, S, b) {
    y.querySelector(S)?.addEventListener("click", () => {
      const F = y.querySelector(b);
      F && (F.type = F.type === "password" ? "text" : "password");
    });
  }
  function Ee(y) {
    return {
      workspaceFileName: y?.workspaceFileName || "",
      jsApiPermission: yt(y?.jsApiPermission),
      tavilyApiKey: String(y?.tavilyApiKey || ""),
      tavilyBaseUrl: Ke(y?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: y?.currentPresetName || "默认",
      delegatePresetName: y?.delegatePresetName || y?.currentPresetName || "默认",
      delegateConfig: y?.delegateConfig || {},
      delegateConfigured: y?.delegateConfigured === !0,
      presets: y?.presets || {}
    };
  }
  function Et(y, S = {}) {
    const b = R(y), F = re(S.presetName || b.presetDraftName), W = re(b.currentPresetName || t.config?.currentPresetName || "默认"), Z = (t.config?.presets || {})[W] || Te(), se = Fe(b.modelConfigs || Z.modelConfigs || {}), ut = {
      ...Z,
      provider: b.provider,
      permissionMode: fn(b.permissionMode),
      modelConfigs: {
        ...se,
        [b.provider]: {
          ...se[b.provider] || {},
          ...I(b)
        }
      }
    }, ct = { ...t.config?.presets || {} };
    S.renameCurrentPreset && F !== W && delete ct[W], ct[F] = ut, t.config = uo({
      ...t.config,
      jsApiPermission: yt(b.jsApiPermission),
      tavilyApiKey: String(b.tavilyApiKey || ""),
      tavilyBaseUrl: Ke(b.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: F,
      delegatePresetName: g(b.delegatePresetName, F),
      delegateConfig: x(b),
      delegateConfigured: S.configureDelegate === !0 || t.config?.delegateConfigured === !0,
      presets: ct
    }), t.configDraft = C(F, ut, t.config), c(), Oe({
      requestId: o(S.requestPrefix || "save-config"),
      config: t.config,
      payload: Ee(t.config)
    });
  }
  function Fa(y, S = "") {
    const b = re(S || "默认"), F = typeof window < "u" && typeof window.prompt == "function" ? window.prompt(y, b) : b;
    return F === null ? "" : re(F);
  }
  function Hm(y) {
    const S = Fa("输入新预设名称：", `${R(y).currentPresetName || "默认"} 副本`);
    if (!S) {
      r?.("预设名称不能为空");
      return;
    }
    y.querySelector("#xb-assistant-preset-name").value = S, Et(y, {
      presetName: S,
      requestPrefix: "create-preset"
    });
  }
  function Vm(y) {
    const S = R(y), b = re(S.currentPresetName || t.config?.currentPresetName || "默认"), F = Fa("输入预设名称：", S.presetDraftName || b);
    if (!F) {
      r?.("预设名称不能为空");
      return;
    }
    F !== b && (y.querySelector("#xb-assistant-preset-name").value = F, Et(y, {
      presetName: F,
      renameCurrentPreset: !0,
      requestPrefix: "rename-preset"
    }));
  }
  function Jm(y) {
    if (Object.keys(t.config?.presets || {}).length <= 1) {
      r?.("至少要保留一套预设");
      return;
    }
    const S = R(y), b = re(t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), F = { ...t.config?.presets || {} };
    delete F[b];
    const W = Object.keys(F)[0] || "默认", Z = F[W] || Te();
    t.config = uo({
      ...t.config,
      jsApiPermission: yt(S.jsApiPermission),
      tavilyApiKey: String(S.tavilyApiKey || t.config?.tavilyApiKey || ""),
      tavilyBaseUrl: Ke(S.tavilyBaseUrl || t.config?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: W,
      delegatePresetName: g(S.delegatePresetName, W),
      delegateConfig: x(S),
      presets: F
    }), t.configDraft = C(W, Z, t.config), c(), Oe({
      requestId: o("delete-preset"),
      config: t.config,
      payload: Ee(t.config)
    }), n?.();
  }
  function Km(y) {
    y?.querySelector?.("#xb-assistant-provider") && (y.querySelector("#xb-assistant-provider").addEventListener("change", (S) => {
      const b = S.currentTarget.value, F = R(y);
      t.configDraft = {
        ...F,
        provider: b,
        ...v(b, F.modelConfigs)
      }, c(), n?.();
    }), y.querySelector("#xb-assistant-preset-select").addEventListener("change", (S) => {
      const b = re(S.currentTarget.value), F = (t.config?.presets || {})[b] || Te(), W = R(y);
      t.config = uo({
        ...t.config,
        jsApiPermission: yt(W.jsApiPermission),
        currentPresetName: b,
        delegatePresetName: g(W.delegatePresetName, b),
        delegateConfig: x(W)
      }), t.configDraft = C(b, F, t.config), c(), n?.();
    }), y.querySelector("#xb-assistant-preset-name")?.addEventListener("input", () => {
      ne(y);
    }), y.querySelector("#xb-assistant-base-url").addEventListener("input", () => {
      R(y);
    }), y.querySelector("#xb-assistant-model").addEventListener("input", () => {
      R(y);
    }), y.querySelector("#xb-assistant-api-key").addEventListener("input", () => {
      R(y);
    }), y.querySelector("#xb-assistant-max-tokens")?.addEventListener("input", () => {
      R(y);
    }), y.querySelector("#xb-assistant-temperature")?.addEventListener("input", () => {
      R(y);
    }), y.querySelector("#xb-assistant-send-temperature")?.addEventListener("change", () => {
      R(y);
    }), y.querySelector("#xb-assistant-tavily-api-key")?.addEventListener("input", () => {
      R(y);
    }), y.querySelector("#xb-assistant-model-pulled").addEventListener("change", (S) => {
      const b = S.currentTarget.value;
      b && (y.querySelector("#xb-assistant-model").value = b, R(y));
    }), _e(y, "#xb-assistant-toggle-key", "#xb-assistant-api-key"), _e(y, "#xb-assistant-toggle-tavily-key", "#xb-assistant-tavily-api-key"), y.querySelector("#xb-assistant-delegate-provider")?.addEventListener("change", (S) => {
      const b = R(y), F = S.currentTarget.value;
      t.configDraft = {
        ...b,
        delegateProvider: F,
        ...w(F, b.delegateModelConfigs)
      }, c(), n?.();
    }), y.querySelector("#xb-assistant-delegate-base-url")?.addEventListener("input", () => {
      R(y);
    }), y.querySelector("#xb-assistant-delegate-model")?.addEventListener("input", () => {
      R(y);
    }), y.querySelector("#xb-assistant-delegate-api-key")?.addEventListener("input", () => {
      R(y);
    }), y.querySelector("#xb-assistant-delegate-max-tokens")?.addEventListener("input", () => {
      R(y);
    }), y.querySelector("#xb-assistant-delegate-temperature")?.addEventListener("input", () => {
      R(y);
    }), y.querySelector("#xb-assistant-delegate-send-temperature")?.addEventListener("change", () => {
      R(y);
    }), y.querySelector("#xb-assistant-delegate-model-pulled")?.addEventListener("change", (S) => {
      const b = S.currentTarget.value;
      if (!b) return;
      const F = y.querySelector("#xb-assistant-delegate-model");
      F && (F.value = b), R(y);
    }), _e(y, "#xb-assistant-delegate-toggle-key", "#xb-assistant-delegate-api-key"), y.querySelector("#xb-assistant-reasoning-enabled").addEventListener("change", () => {
      R(y), c(), n?.();
    }), y.querySelector("#xb-assistant-reasoning-effort").addEventListener("change", () => {
      R(y);
    }), y.querySelector("#xb-assistant-tool-mode").addEventListener("change", () => {
      R(y);
    }), y.querySelector("#xb-assistant-delegate-reasoning-enabled")?.addEventListener("change", () => {
      R(y), c(), n?.();
    }), y.querySelector("#xb-assistant-delegate-reasoning-effort")?.addEventListener("change", () => {
      R(y);
    }), y.querySelector("#xb-assistant-delegate-tool-mode")?.addEventListener("change", () => {
      R(y);
    }), y.querySelector("#xb-assistant-permission-mode")?.addEventListener("change", () => {
      R(y);
    }), y.querySelector("#xb-assistant-jsapi-permission")?.addEventListener("change", () => {
      R(y);
    }), y.querySelector("#xb-assistant-delegate-preset-select")?.addEventListener("change", (S) => {
      const b = g(S.currentTarget?.value, t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), F = (t.config?.presets || {})[b] || Te();
      t.configDraft = {
        ...R(y),
        ..._(b, F)
      }, c(), n?.();
    }), y.querySelectorAll("[data-config-page]").forEach((S) => {
      S.addEventListener("click", (b) => {
        R(y), t.configPage = lo(b.currentTarget?.dataset?.configPage), X(y), me(y);
      });
    }), y.querySelector("#xb-assistant-pull-models").addEventListener("click", async () => {
      R(y), c();
      const S = z();
      f(S.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), n?.();
      try {
        const b = await md(S);
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
      R(y), c();
      const S = z({ role: "delegate" });
      f(S.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }, "delegate"), n?.();
      try {
        const b = await md(S);
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
      Hm(y);
    }), y.querySelector("#xb-assistant-rename-preset")?.addEventListener("click", () => {
      Vm(y);
    }), y.querySelector("#xb-assistant-save").addEventListener("click", () => {
      Et(y);
    }), y.querySelector("#xb-assistant-delegate-save")?.addEventListener("click", () => {
      Et(y, {
        requestPrefix: "save-delegate-config",
        configureDelegate: !0
      });
    }), y.querySelector("#xb-assistant-delete-preset").addEventListener("click", () => {
      Jm(y);
    }));
  }
  return {
    getActiveProviderConfig: z,
    syncConfigToForm: me,
    bindSettingsPanelEvents: Km
  };
}
function Io(e = "") {
  return String(e || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Yn(e) {
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
function r0(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? "saving" : t === "success" ? "success" : t === "error" ? "error" : "save";
}
function o0(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? {
    className: "xb-assistant-save-button is-saving",
    title: "正在保存配置"
  } : t === "success" ? {
    className: "xb-assistant-save-button is-success",
    title: "配置已保存"
  } : t === "error" ? {
    className: "xb-assistant-save-button is-error",
    title: Io(e?.error || "保存失败")
  } : {
    className: "xb-assistant-save-button",
    title: "保存配置"
  };
}
function u0(e = {}) {
  const { configSave: t = {}, runtimeText: n = "", inlineToastText: r = "", showInlineToast: o = !0, showAssistantPermissions: s = !0, showDelegateSettings: a = !0, activePage: u = "main", delegatePresetHint: c = "DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。", isBusy: d = !1, canDeletePreset: h = !0 } = e, f = o0(t), p = r0(t), m = d || String(t?.status || "") === "saving" ? "disabled" : "", g = d || !h ? "disabled" : "", _ = u === "delegate" ? "delegate" : "main", v = _ === "main", w = _ === "delegate", C = s ? `
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
            </div>` : "", k = a ? `
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${w ? "" : "hidden"}>
                <p class="xb-assistant-config-note">${Io(c)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${f.className}" title="${f.title}" aria-label="${f.title}" ${m}>${Yn(p)}</button>
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
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${d ? "disabled" : ""}>${Yn("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${d ? "disabled" : ""}>${Yn("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${f.className}" title="${f.title}" aria-label="${f.title}" ${m}>${Yn(p)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${g}>${Yn("delete")}</button>
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
            ${C}
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
            ${k}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${Io(n)}</div>
            ${o ? `<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${Io(r)}</div>` : ""}
        </section>
    `;
}
var s0 = [
  "你是小白X“四次元壁”的交流生成器。",
  "只完成本轮四次元壁回复，不调用工具，不编造外部事实。",
  "严格遵循后续提示词里的输出格式，优先输出可被解析的 <thinking> 与 <msg> 内容。"
].join(`
`);
function i0(e = {}) {
  return {
    msg1: String(e.msg1 || "").trim(),
    msg2: String(e.msg2 || "").trim(),
    msg3: String(e.msg3 || "").trim(),
    msg4: String(e.msg4 || "").trim()
  };
}
function a0(e = {}, t = {}) {
  const { msg1: n, msg2: r, msg3: o, msg4: s } = i0(e);
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
function c0(e = {}) {
  ob(typeof e.requestHeadersProvider == "function" ? e.requestHeadersProvider : null);
}
async function d0(e = {}) {
  const t = Ob(ig(e.config || {})), n = Hb(t, { missingApiKeyMessage: "请先在小白agent的 API配置 里填写当前预设的 API Key。" }), r = !!e.stream && typeof e.onStreamProgress == "function", o = await n.chat({
    systemPrompt: s0,
    messages: a0(e.builtPrompt || {}, { disableAssistantPrefill: !!e.disableAssistantPrefill }),
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
  u0 as buildAgentSettingsPanelMarkup,
  c0 as configureFourthWallAgent,
  l0 as createAgentSettingsPanel,
  d0 as generateFourthWallResponse,
  uo as normalizeAgentConfig
};
