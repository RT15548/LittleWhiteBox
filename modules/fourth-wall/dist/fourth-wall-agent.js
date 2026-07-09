var pm = Object.create, rd = Object.defineProperty, hm = Object.getOwnPropertyDescriptor, mm = Object.getOwnPropertyNames, gm = Object.getPrototypeOf, ym = Object.prototype.hasOwnProperty, Fs = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), _m = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var s = mm(t), r = 0, a = s.length, u; r < a; r++)
      u = s[r], !ym.call(e, u) && u !== n && rd(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(o = hm(t, u)) || o.enumerable
      });
  return e;
}, vm = (e, t, n) => (n = e != null ? pm(gm(e)) : {}, _m(t || !e || !e.__esModule ? rd(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), Sm = "https://api.tavily.com";
function Ur(e = "") {
  return String(e || "").trim();
}
function Ge(e = "") {
  return String(e || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var id = "openai-compatible", Di = "默认", ad = "default", Tm = "deny", Em = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), wm = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), Lr = {
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
function on() {
  return JSON.parse(JSON.stringify(Lr));
}
function we() {
  return {
    provider: id,
    modelConfigs: on(),
    permissionMode: ad
  };
}
function Cm(e = we()) {
  const t = e && typeof e == "object" ? e : we();
  return {
    provider: Ui(t.provider),
    modelConfigs: Ue(t.modelConfigs || {})
  };
}
function sn(e) {
  return e === "full" ? "full" : ad;
}
function dt(e) {
  return e === "allow" ? "allow" : Tm;
}
function ne(e) {
  return String(e || "").trim() || "默认";
}
function Ue(e = {}) {
  const t = on();
  return Object.keys(Lr).forEach((n) => {
    t[n] = {
      ...Lr[n],
      ...e && typeof e[n] == "object" ? e[n] : {}
    };
  }), t;
}
function Ui(e) {
  return typeof e == "string" && e.trim() ? e : id;
}
function Li(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function ld(e = {}, t) {
  const n = {}, o = Li(e, t);
  return Object.entries(o).forEach(([s, r]) => {
    if (!r || typeof r != "object") return;
    const a = ne(s);
    n[a] = {
      provider: Ui(r.provider),
      modelConfigs: Ue(r.modelConfigs || {}),
      permissionMode: sn(r.permissionMode)
    };
  }), Object.keys(n).length || (n[Di] = we()), n;
}
function ud(e, t) {
  const n = ne(t);
  return e[n] ? n : Object.keys(e)[0];
}
function cd(e, t, n) {
  const o = ne(t || n);
  return e[o] ? o : e[n] ? n : Object.keys(e)[0];
}
function dd(e = {}, t = we()) {
  const n = Cm(t), o = e && typeof e == "object" ? e : {};
  return {
    provider: Ui(o.provider || n.provider),
    modelConfigs: Ue(o.modelConfigs || n.modelConfigs)
  };
}
function Am(e = {}, t, n, o, s) {
  const r = s(e?.[o]);
  if (r) return r;
  const a = Li(e, t), u = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(a || {})
  ].map(ne), c = /* @__PURE__ */ new Set();
  for (const d of u) {
    if (c.has(d)) continue;
    c.add(d);
    const p = s(a?.[d]?.[o]);
    if (p) return p;
  }
  return s(e?.delegateConfig?.[o]);
}
function Im(e = {}, t, n) {
  const o = (u) => String(u || "").trim();
  if (o(e?.tavilyBaseUrl)) return Ge(e.tavilyBaseUrl);
  const s = Li(e, t), r = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(s || {})
  ].map(ne), a = /* @__PURE__ */ new Set();
  for (const u of r) {
    if (a.has(u)) continue;
    a.add(u);
    const c = s?.[u]?.tavilyBaseUrl;
    if (o(c)) return Ge(c);
  }
  return o(e?.delegateConfig?.tavilyBaseUrl) ? Ge(e.delegateConfig.tavilyBaseUrl) : Sm;
}
function fd(e = {}, t, n) {
  return {
    tavilyApiKey: Am(e, t, n, "tavilyApiKey", Ur),
    tavilyBaseUrl: Im(e, t, n)
  };
}
function bm(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: o = (f) => String(f || "") } = t, s = ne(e.currentPresetName || e.presetName || "默认"), r = ld(e, s), a = ud(r, e.currentPresetName), u = cd(r, e.delegatePresetName, a), c = r[u] || r[a] || we(), d = dd(e.delegateConfig, c), p = fd(e, s, a);
  return {
    enabled: !!e.enabled,
    workspaceFileName: o(e.workspaceFileName || n),
    jsApiPermission: dt(e.jsApiPermission),
    currentPresetName: a,
    delegatePresetName: u,
    delegateConfig: d,
    presets: r,
    tavilyApiKey: p.tavilyApiKey,
    tavilyBaseUrl: p.tavilyBaseUrl,
    updatedAt: Number(e.updatedAt) || 0,
    configVersion: Number(e.configVersion) || 0
  };
}
function ss(e = {}) {
  const t = ne(e.currentPresetName || e.presetDraftName || "默认"), n = ld(e, t), o = ud(n, e.currentPresetName), s = cd(n, e.delegatePresetName, o), r = n[o] || we(), a = n[s] || r, u = dd(e.delegateConfig, a), c = fd(e, t, o);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    jsApiPermission: dt(e.jsApiPermission),
    currentPresetName: o,
    delegatePresetName: s,
    delegateConfig: u,
    presetDraftName: ne(e.presetDraftName || o),
    presetNames: Object.keys(n),
    presets: n,
    provider: r.provider,
    modelConfigs: r.modelConfigs,
    permissionMode: sn(r.permissionMode),
    tavilyApiKey: c.tavilyApiKey,
    tavilyBaseUrl: c.tavilyBaseUrl
  };
}
function U(e, t, n, o, s) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !s) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !s : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? s.call(e, n) : s ? s.value = n : t.set(e, n), n;
}
function T(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var pd = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return pd = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function fo(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var $r = (e) => {
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
}, Le = class Fr extends V {
  constructor(t, n, o, s, r) {
    super(`${Fr.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.requestID = s?.get("request-id"), this.error = n, this.type = r ?? null;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new Bs({
      message: o,
      cause: $r(n)
    });
    const r = n, a = r?.error?.type;
    return t === 400 ? new md(t, r, o, s, a) : t === 401 ? new gd(t, r, o, s, a) : t === 403 ? new yd(t, r, o, s, a) : t === 404 ? new _d(t, r, o, s, a) : t === 409 ? new vd(t, r, o, s, a) : t === 422 ? new Sd(t, r, o, s, a) : t === 429 ? new Td(t, r, o, s, a) : t >= 500 ? new Ed(t, r, o, s, a) : new Fr(t, r, o, s, a);
  }
}, ze = class extends Le {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Bs = class extends Le {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, hd = class extends Bs {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, md = class extends Le {
}, gd = class extends Le {
}, yd = class extends Le {
}, _d = class extends Le {
}, vd = class extends Le {
}, Sd = class extends Le {
}, Td = class extends Le {
}, Ed = class extends Le {
}, Rm = /^[a-z][a-z0-9+.-]*:/i, Pm = (e) => Rm.test(e), Br = (e) => (Br = Array.isArray, Br(e)), Ja = Br;
function qr(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Wa(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function xm(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Mm = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new V(`${e} must be an integer`);
  if (t < 0) throw new V(`${e} must be a positive integer`);
  return t;
}, wd = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Nm = (e) => new Promise((t) => setTimeout(t, e)), Zt = "0.89.0", km = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Dm() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Um = () => {
  const e = Dm();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Zt,
    "X-Stainless-OS": za(Deno.build.os),
    "X-Stainless-Arch": Ka(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Zt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Zt,
    "X-Stainless-OS": za(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Ka(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Lm();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Zt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Zt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Lm() {
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
var Ka = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", za = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Ya, $m = () => Ya ?? (Ya = Um());
function Fm() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Cd(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Ad(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Cd({
    start() {
    },
    async pull(n) {
      const { done: o, value: s } = await t.next();
      o ? n.close() : n.enqueue(s);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function $i(e) {
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
async function Bm(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var qm = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Gm(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new V(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function Om(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var Xa;
function Fi(e) {
  let t;
  return (Xa ?? (t = new globalThis.TextEncoder(), Xa = t.encode.bind(t)))(e);
}
var Qa;
function Za(e) {
  let t;
  return (Qa ?? (t = new globalThis.TextDecoder(), Qa = t.decode.bind(t)))(e);
}
var Re, Pe, vo = class {
  constructor() {
    Re.set(this, void 0), Pe.set(this, void 0), U(this, Re, new Uint8Array(), "f"), U(this, Pe, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Fi(e) : e;
    U(this, Re, Om([T(this, Re, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = Hm(T(this, Re, "f"), T(this, Pe, "f"))) != null; ) {
      if (o.carriage && T(this, Pe, "f") == null) {
        U(this, Pe, o.index, "f");
        continue;
      }
      if (T(this, Pe, "f") != null && (o.index !== T(this, Pe, "f") + 1 || o.carriage)) {
        n.push(Za(T(this, Re, "f").subarray(0, T(this, Pe, "f") - 1))), U(this, Re, T(this, Re, "f").subarray(T(this, Pe, "f")), "f"), U(this, Pe, null, "f");
        continue;
      }
      const s = T(this, Pe, "f") !== null ? o.preceding - 1 : o.preceding, r = Za(T(this, Re, "f").subarray(0, s));
      n.push(r), U(this, Re, T(this, Re, "f").subarray(o.index), "f"), U(this, Pe, null, "f");
    }
    return n;
  }
  flush() {
    return T(this, Re, "f").length ? this.decode(`
`) : [];
  }
};
Re = /* @__PURE__ */ new WeakMap(), Pe = /* @__PURE__ */ new WeakMap();
vo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
vo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Hm(e, t) {
  for (let s = t ?? 0; s < e.length; s++) {
    if (e[s] === 10) return {
      preceding: s,
      index: s + 1,
      carriage: !1
    };
    if (e[s] === 13) return {
      preceding: s,
      index: s + 1,
      carriage: !0
    };
  }
  return null;
}
function Vm(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var Es = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, ja = (e, t, n) => {
  if (e) {
    if (xm(Es, e)) return e;
    ve(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Es))}`);
  }
};
function On() {
}
function xo(e, t, n) {
  return !t || Es[e] > Es[n] ? On : t[e].bind(t);
}
var Jm = {
  error: On,
  warn: On,
  info: On,
  debug: On
}, el = /* @__PURE__ */ new WeakMap();
function ve(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Jm;
  const o = el.get(t);
  if (o && o[0] === n) return o[1];
  const s = {
    error: xo("error", t, n),
    warn: xo("warn", t, n),
    info: xo("info", t, n),
    debug: xo("debug", t, n)
  };
  return el.set(t, [n, s]), s;
}
var xt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), wn, po = class Hn {
  constructor(t, n, o) {
    this.iterator = t, wn.set(this, void 0), this.controller = n, U(this, wn, o, "f");
  }
  static fromSSEResponse(t, n, o) {
    let s = !1;
    const r = o ? ve(o) : console;
    async function* a() {
      if (s) throw new V("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of Wm(t, n)) {
          if (c.event === "completion") try {
            yield JSON.parse(c.data);
          } catch (d) {
            throw r.error("Could not parse message into JSON:", c.data), r.error("From chunk:", c.raw), d;
          }
          if (c.event === "message_start" || c.event === "message_delta" || c.event === "message_stop" || c.event === "content_block_start" || c.event === "content_block_delta" || c.event === "content_block_stop" || c.event === "message" || c.event === "user.message" || c.event === "user.interrupt" || c.event === "user.tool_confirmation" || c.event === "user.custom_tool_result" || c.event === "agent.message" || c.event === "agent.thinking" || c.event === "agent.tool_use" || c.event === "agent.tool_result" || c.event === "agent.mcp_tool_use" || c.event === "agent.mcp_tool_result" || c.event === "agent.custom_tool_use" || c.event === "agent.thread_context_compacted" || c.event === "session.status_running" || c.event === "session.status_idle" || c.event === "session.status_rescheduled" || c.event === "session.status_terminated" || c.event === "session.error" || c.event === "session.deleted" || c.event === "span.model_request_start" || c.event === "span.model_request_end") try {
            yield JSON.parse(c.data);
          } catch (d) {
            throw r.error("Could not parse message into JSON:", c.data), r.error("From chunk:", c.raw), d;
          }
          if (c.event !== "ping" && c.event === "error") {
            const d = wd(c.data) ?? c.data, p = d?.error?.type;
            throw new Le(void 0, d, void 0, t.headers, p);
          }
        }
        u = !0;
      } catch (c) {
        if (fo(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Hn(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    async function* r() {
      const u = new vo(), c = $i(t);
      for await (const d of c) for (const p of u.decode(d)) yield p;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (s) throw new V("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of r())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (fo(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Hn(a, n, o);
  }
  [(wn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), s = (r) => ({ next: () => {
      if (r.length === 0) {
        const a = o.next();
        t.push(a), n.push(a);
      }
      return r.shift();
    } });
    return [new Hn(() => s(t), this.controller, T(this, wn, "f")), new Hn(() => s(n), this.controller, T(this, wn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Cd({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: r } = await n.next();
          if (r) return o.close();
          const a = Fi(JSON.stringify(s) + `
`);
          o.enqueue(a);
        } catch (s) {
          o.error(s);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* Wm(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new V("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new V("Attempted to iterate over a response with no body");
  const n = new zm(), o = new vo(), s = $i(e.body);
  for await (const r of Km(s)) for (const a of o.decode(r)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const r of o.flush()) {
    const a = n.decode(r);
    a && (yield a);
  }
}
async function* Km(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Fi(n) : n;
    let s = new Uint8Array(t.length + o.length);
    s.set(t), s.set(o, t.length), t = s;
    let r;
    for (; (r = Vm(t)) !== -1; )
      yield t.slice(0, r), t = t.slice(r);
  }
  t.length > 0 && (yield t);
}
var zm = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const s = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], s;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, o] = Ym(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Ym(e, t) {
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
async function Id(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: r } = t, a = await (async () => {
    if (t.options.stream)
      return ve(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : po.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : bd(await n.json(), n) : await n.text();
  })();
  return ve(e).debug(`[${o}] response parsed`, xt({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - r
  })), a;
}
function bd(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var Vn, Rd = class Pd extends Promise {
  constructor(t, n, o = Id) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, Vn.set(this, void 0), U(this, Vn, t, "f");
  }
  _thenUnwrap(t) {
    return new Pd(T(this, Vn, "f"), this.responsePromise, async (n, o) => bd(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(T(this, Vn, "f"), t))), this.parsedPromise;
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
Vn = /* @__PURE__ */ new WeakMap();
var Mo, xd = class {
  constructor(e, t, n, o) {
    Mo.set(this, void 0), U(this, Mo, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new V("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await T(this, Mo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Mo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Xm = class extends Rd {
  constructor(e, t, n) {
    super(e, t, async (o, s) => new n(o, s.response, await Id(o, s), s.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, So = class extends xd {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.has_more = n.has_more || !1, this.first_id = n.first_id || null, this.last_id = n.last_id || null;
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
          ...qr(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...qr(this.options.query),
        after_id: e
      }
    } : null;
  }
}, ot = class extends xd {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.next_page = n.next_page || null;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    const e = this.next_page;
    return e ? {
      ...this.options,
      query: {
        ...qr(this.options.query),
        page: e
      }
    } : null;
  }
}, Md = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function ln(e, t, n) {
  return Md(), new File(e, t ?? "unknown_file", n);
}
function rs(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Nd = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Bi = async (e, t, n = !0) => ({
  ...e,
  body: await Zm(e.body, t, n)
}), tl = /* @__PURE__ */ new WeakMap();
function Qm(e) {
  const t = typeof e == "function" ? e : e.fetch, n = tl.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const s = "Response" in t ? t.Response : (await t("data:,")).constructor, r = new FormData();
      return r.toString() !== await new s(r).text();
    } catch {
      return !0;
    }
  })();
  return tl.set(t, o), o;
}
var Zm = async (e, t, n = !0) => {
  if (!await Qm(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const o = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([s, r]) => Gr(o, s, r, n))), o;
}, jm = (e) => e instanceof Blob && "name" in e, Gr = async (e, t, n, o) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let s = {};
      const r = n.headers.get("Content-Type");
      r && (s = { type: r }), e.append(t, ln([await n.blob()], rs(n, o), s));
    } else if (Nd(n)) e.append(t, ln([await new Response(Ad(n)).blob()], rs(n, o)));
    else if (jm(n)) e.append(t, ln([n], rs(n, o), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((s) => Gr(e, t + "[]", s, o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([s, r]) => Gr(e, `${t}[${s}]`, r, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, kd = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", eg = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && kd(e), tg = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function ng(e, t, n) {
  if (Md(), e = await e, t || (t = rs(e, !0)), eg(e))
    return e instanceof File && t == null && n == null ? e : ln([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (tg(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), ln(await Or(s), t, n);
  }
  const o = await Or(e);
  if (!n?.type) {
    const s = o.find((r) => typeof r == "object" && "type" in r && r.type);
    typeof s == "string" && (n = {
      ...n,
      type: s
    });
  }
  return ln(o, t, n);
}
async function Or(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (kd(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Nd(e)) for await (const n of e) t.push(...await Or(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${og(e)}`);
  }
  return t;
}
function og(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ae = class {
  constructor(e) {
    this._client = e;
  }
}, Dd = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* sg(e) {
  if (!e) return;
  if (Dd in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const r of s) yield [r, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Ja(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const r = Ja(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of r)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var D = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [r, a] of sg(o)) {
      const u = r.toLowerCase();
      s.has(u) || (t.delete(r), s.add(u)), a === null ? (t.delete(r), n.add(u)) : (t.append(r, a), n.delete(u));
    }
  }
  return {
    [Dd]: !0,
    values: t,
    nulls: n
  };
};
function Ud(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var nl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), rg = (e = Ud) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const r = [], a = n.reduce((p, f, h) => {
    /[?#]/.test(f) && (s = !0);
    const m = o[h];
    let g = (s ? encodeURIComponent : e)("" + m);
    return h !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? nl) ?? nl)?.toString) && (g = m + "", r.push({
      start: p.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), p + f + (h === o.length ? "" : g);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) r.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (r.sort((p, f) => p.start - f.start), r.length > 0) {
    let p = 0;
    const f = r.reduce((h, m) => {
      const g = " ".repeat(m.start - p), _ = "^".repeat(m.length);
      return p = m.start + m.length, h + g + _;
    }, "");
    throw new V(`Path parameters result in path with invalid segments:
${r.map((h) => h.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, O = /* @__PURE__ */ rg(Ud), Ld = class extends ae {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(O`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(O`/v1/environments/${e}?beta=true`, {
      body: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", ot, {
      query: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(O`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(O`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, oo = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function is(e) {
  return typeof e == "object" && e !== null && oo in e;
}
function $d(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const o of e) is(o) && n.add(o[oo]);
  if (t) {
    for (const o of t)
      if (is(o) && n.add(o[oo]), Array.isArray(o.content))
        for (const s of o.content) is(s) && n.add(s[oo]);
  }
  return Array.from(n);
}
function Fd(e, t) {
  const n = $d(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function ig(e) {
  return is(e) ? { "x-stainless-helper": e[oo] } : {};
}
var Bd = class extends ae {
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/files", So, {
      query: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(O`/v1/files/${e}`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(O`/v1/files/${e}/content`, {
      ...n,
      headers: D([{
        "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(O`/v1/files/${e}`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/files", Bi({
      body: o,
      ...t,
      headers: D([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        ig(o.file),
        t?.headers
      ])
    }, this._client));
  }
}, qd = class extends ae {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(O`/v1/models/${e}?beta=true`, {
      ...n,
      headers: D([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", So, {
      query: o,
      ...t,
      headers: D([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Gd = class extends ae {
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(O`/v1/agents/${e}/versions?beta=true`, ot, {
      query: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, qi = class extends ae {
  constructor() {
    super(...arguments), this.versions = new Gd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.get(O`/v1/agents/${e}?beta=true`, {
      query: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(O`/v1/agents/${e}?beta=true`, {
      body: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", ot, {
      query: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(O`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
qi.Versions = Gd;
var Od = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function Hd(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function ol(e, t, n) {
  const o = Hd(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((s) => {
      if (s.type === "text") {
        const r = Object.defineProperty({ ...s }, "parsed_output", {
          value: null,
          enumerable: !1
        });
        return Object.defineProperty(r, "parsed", {
          get() {
            return n.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead."), null;
          },
          enumerable: !1
        });
      }
      return s;
    }),
    parsed_output: null
  } : Vd(e, t, n);
}
function Vd(e, t, n) {
  let o = null;
  const s = e.content.map((r) => {
    if (r.type === "text") {
      const a = ag(t, r.text);
      o === null && (o = a);
      const u = Object.defineProperty({ ...r }, "parsed_output", {
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
    return r;
  });
  return {
    ...e,
    content: s,
    parsed_output: o
  };
}
function ag(e, t) {
  const n = Hd(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new V(`Failed to parse structured output: ${o}`);
  }
}
var lg = (e) => {
  let t = 0, n = [];
  for (; t < e.length; ) {
    let o = e[t];
    if (o === "\\") {
      t++;
      continue;
    }
    if (o === "{") {
      n.push({
        type: "brace",
        value: "{"
      }), t++;
      continue;
    }
    if (o === "}") {
      n.push({
        type: "brace",
        value: "}"
      }), t++;
      continue;
    }
    if (o === "[") {
      n.push({
        type: "paren",
        value: "["
      }), t++;
      continue;
    }
    if (o === "]") {
      n.push({
        type: "paren",
        value: "]"
      }), t++;
      continue;
    }
    if (o === ":") {
      n.push({
        type: "separator",
        value: ":"
      }), t++;
      continue;
    }
    if (o === ",") {
      n.push({
        type: "delimiter",
        value: ","
      }), t++;
      continue;
    }
    if (o === '"') {
      let a = "", u = !1;
      for (o = e[++t]; o !== '"'; ) {
        if (t === e.length) {
          u = !0;
          break;
        }
        if (o === "\\") {
          if (t++, t === e.length) {
            u = !0;
            break;
          }
          a += o + e[t], o = e[++t];
        } else
          a += o, o = e[++t];
      }
      o = e[++t], u || n.push({
        type: "string",
        value: a
      });
      continue;
    }
    if (o && /\s/.test(o)) {
      t++;
      continue;
    }
    let s = /[0-9]/;
    if (o && s.test(o) || o === "-" || o === ".") {
      let a = "";
      for (o === "-" && (a += o, o = e[++t]); o && s.test(o) || o === "."; )
        a += o, o = e[++t];
      n.push({
        type: "number",
        value: a
      });
      continue;
    }
    let r = /[a-z]/i;
    if (o && r.test(o)) {
      let a = "";
      for (; o && r.test(o) && t !== e.length; )
        a += o, o = e[++t];
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
}, jt = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), jt(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), jt(e);
    case "string":
      let o = e[e.length - 2];
      if (o?.type === "delimiter")
        return e = e.slice(0, e.length - 1), jt(e);
      if (o?.type === "brace" && o.value === "{")
        return e = e.slice(0, e.length - 1), jt(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), jt(e);
  }
  return e;
}, ug = (e) => {
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
}, cg = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, Jd = (e) => JSON.parse(cg(ug(jt(lg(e))))), Be, gt, Jt, Cn, No, An, In, ko, bn, at, Rn, Do, Uo, bt, Lo, $o, Pn, dr, sl, Fo, fr, pr, hr, rl, il = "__json_buf";
function al(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var dg = class Hr {
  constructor(t, n) {
    Be.add(this), this.messages = [], this.receivedMessages = [], gt.set(this, void 0), Jt.set(this, null), this.controller = new AbortController(), Cn.set(this, void 0), No.set(this, () => {
    }), An.set(this, () => {
    }), In.set(this, void 0), ko.set(this, () => {
    }), bn.set(this, () => {
    }), at.set(this, {}), Rn.set(this, !1), Do.set(this, !1), Uo.set(this, !1), bt.set(this, !1), Lo.set(this, void 0), $o.set(this, void 0), Pn.set(this, void 0), Fo.set(this, (o) => {
      if (U(this, Do, !0, "f"), fo(o) && (o = new ze()), o instanceof ze)
        return U(this, Uo, !0, "f"), this._emit("abort", o);
      if (o instanceof V) return this._emit("error", o);
      if (o instanceof Error) {
        const s = new V(o.message);
        return s.cause = o, this._emit("error", s);
      }
      return this._emit("error", new V(String(o)));
    }), U(this, Cn, new Promise((o, s) => {
      U(this, No, o, "f"), U(this, An, s, "f");
    }), "f"), U(this, In, new Promise((o, s) => {
      U(this, ko, o, "f"), U(this, bn, s, "f");
    }), "f"), T(this, Cn, "f").catch(() => {
    }), T(this, In, "f").catch(() => {
    }), U(this, Jt, t, "f"), U(this, Pn, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, Lo, "f");
  }
  get request_id() {
    return T(this, $o, "f");
  }
  async withResponse() {
    U(this, bt, !0, "f");
    const t = await T(this, Cn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Hr(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: s } = {}) {
    const r = new Hr(n, { logger: s });
    for (const a of n.messages) r._addMessageParam(a);
    return U(r, Jt, {
      ...n,
      stream: !0
    }, "f"), r._run(() => r._createMessage(t, {
      ...n,
      stream: !0
    }, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, T(this, Fo, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, o) {
    const s = o?.signal;
    let r;
    s && (s.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), s.addEventListener("abort", r));
    try {
      T(this, Be, "m", fr).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) T(this, Be, "m", pr).call(this, c);
      if (u.controller.signal?.aborted) throw new ze();
      T(this, Be, "m", hr).call(this);
    } finally {
      s && r && s.removeEventListener("abort", r);
    }
  }
  _connected(t) {
    this.ended || (U(this, Lo, t, "f"), U(this, $o, t?.headers.get("request-id"), "f"), T(this, No, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, Rn, "f");
  }
  get errored() {
    return T(this, Do, "f");
  }
  get aborted() {
    return T(this, Uo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (T(this, at, "f")[t] || (T(this, at, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = T(this, at, "f")[t];
    if (!o) return this;
    const s = o.findIndex((r) => r.listener === n);
    return s >= 0 && o.splice(s, 1), this;
  }
  once(t, n) {
    return (T(this, at, "f")[t] || (T(this, at, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      U(this, bt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    U(this, bt, !0, "f"), await T(this, In, "f");
  }
  get currentMessage() {
    return T(this, gt, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, Be, "m", dr).call(this);
  }
  async finalText() {
    return await this.done(), T(this, Be, "m", sl).call(this);
  }
  _emit(t, ...n) {
    if (T(this, Rn, "f")) return;
    t === "end" && (U(this, Rn, !0, "f"), T(this, ko, "f").call(this));
    const o = T(this, at, "f")[t];
    if (o && (T(this, at, "f")[t] = o.filter((s) => !s.once), o.forEach(({ listener: s }) => s(...n))), t === "abort") {
      const s = n[0];
      !T(this, bt, "f") && !o?.length && Promise.reject(s), T(this, An, "f").call(this, s), T(this, bn, "f").call(this, s), this._emit("end");
      return;
    }
    if (t === "error") {
      const s = n[0];
      !T(this, bt, "f") && !o?.length && Promise.reject(s), T(this, An, "f").call(this, s), T(this, bn, "f").call(this, s), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, Be, "m", dr).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let s;
    o && (o.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), o.addEventListener("abort", s));
    try {
      T(this, Be, "m", fr).call(this), this._connected(null);
      const r = po.fromReadableStream(t, this.controller);
      for await (const a of r) T(this, Be, "m", pr).call(this, a);
      if (r.controller.signal?.aborted) throw new ze();
      T(this, Be, "m", hr).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  [(gt = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), No = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), In = /* @__PURE__ */ new WeakMap(), ko = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakMap(), at = /* @__PURE__ */ new WeakMap(), Rn = /* @__PURE__ */ new WeakMap(), Do = /* @__PURE__ */ new WeakMap(), Uo = /* @__PURE__ */ new WeakMap(), bt = /* @__PURE__ */ new WeakMap(), Lo = /* @__PURE__ */ new WeakMap(), $o = /* @__PURE__ */ new WeakMap(), Pn = /* @__PURE__ */ new WeakMap(), Fo = /* @__PURE__ */ new WeakMap(), Be = /* @__PURE__ */ new WeakSet(), dr = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, sl = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new V("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, fr = function() {
    this.ended || U(this, gt, void 0, "f");
  }, pr = function(n) {
    if (this.ended) return;
    const o = T(this, Be, "m", rl).call(this, n);
    switch (this._emit("streamEvent", n, o), n.type) {
      case "content_block_delta": {
        const s = o.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            s.type === "text" && this._emit("text", n.delta.text, s.text || "");
            break;
          case "citations_delta":
            s.type === "text" && this._emit("citation", n.delta.citation, s.citations ?? []);
            break;
          case "input_json_delta":
            al(s) && s.input && this._emit("inputJson", n.delta.partial_json, s.input);
            break;
          case "thinking_delta":
            s.type === "thinking" && this._emit("thinking", n.delta.thinking, s.thinking);
            break;
          case "signature_delta":
            s.type === "thinking" && this._emit("signature", s.signature);
            break;
          case "compaction_delta":
            s.type === "compaction" && s.content && this._emit("compaction", s.content);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(o), this._addMessage(ol(o, T(this, Jt, "f"), { logger: T(this, Pn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        U(this, gt, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, hr = function() {
    if (this.ended) throw new V("stream has ended, this shouldn't happen");
    const n = T(this, gt, "f");
    if (!n) throw new V("request ended without sending any chunks");
    return U(this, gt, void 0, "f"), ol(n, T(this, Jt, "f"), { logger: T(this, Pn, "f") });
  }, rl = function(n) {
    let o = T(this, gt, "f");
    if (n.type === "message_start") {
      if (o) throw new V(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new V(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return o;
      case "message_delta":
        return o.container = n.delta.container, o.stop_reason = n.delta.stop_reason, o.stop_sequence = n.delta.stop_sequence, o.usage.output_tokens = n.usage.output_tokens, o.context_management = n.context_management, n.usage.input_tokens != null && (o.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (o.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (o.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (o.usage.server_tool_use = n.usage.server_tool_use), n.usage.iterations != null && (o.usage.iterations = n.usage.iterations), o;
      case "content_block_start":
        return o.content.push(n.content_block), o;
      case "content_block_delta": {
        const s = o.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            s?.type === "text" && (o.content[n.index] = {
              ...s,
              text: (s.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            s?.type === "text" && (o.content[n.index] = {
              ...s,
              citations: [...s.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (s && al(s)) {
              let r = s[il] || "";
              r += n.delta.partial_json;
              const a = { ...s };
              if (Object.defineProperty(a, il, {
                value: r,
                enumerable: !1,
                writable: !0
              }), r) try {
                a.input = Jd(r);
              } catch (u) {
                const c = new V(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${r}`);
                T(this, Fo, "f").call(this, c);
              }
              o.content[n.index] = a;
            }
            break;
          case "thinking_delta":
            s?.type === "thinking" && (o.content[n.index] = {
              ...s,
              thinking: s.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            s?.type === "thinking" && (o.content[n.index] = {
              ...s,
              signature: n.delta.signature
            });
            break;
          case "compaction_delta":
            s?.type === "compaction" && (o.content[n.index] = {
              ...s,
              content: (s.content || "") + n.delta.content
            });
            break;
          default:
            n.delta;
        }
        return o;
      }
      case "content_block_stop":
        return o;
    }
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("streamEvent", (s) => {
      const r = n.shift();
      r ? r.resolve(s) : t.push(s);
    }), this.on("end", () => {
      o = !0;
      for (const s of n) s.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (s) => {
      o = !0;
      for (const r of n) r.reject(s);
      n.length = 0;
    }), this.on("error", (s) => {
      o = !0;
      for (const r of n) r.reject(s);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((s, r) => n.push({
        resolve: s,
        reject: r
      })).then((s) => s ? {
        value: s,
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
    return new po(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var Wd = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var fg = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, xn, Wt, Rt, re, Ee, be, ft, yt, Mn, ll, Vr;
function ul() {
  let e, t;
  return {
    promise: new Promise((n, o) => {
      e = n, t = o;
    }),
    resolve: e,
    reject: t
  };
}
var Kd = class {
  constructor(e, t, n) {
    xn.add(this), this.client = e, Wt.set(this, !1), Rt.set(this, !1), re.set(this, void 0), Ee.set(this, void 0), be.set(this, void 0), ft.set(this, void 0), yt.set(this, void 0), Mn.set(this, 0), U(this, re, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const o = ["BetaToolRunner", ...$d(t.tools, t.messages)].join(", ");
    U(this, Ee, {
      ...n,
      headers: D([{ "x-stainless-helper": o }, n?.headers])
    }, "f"), U(this, yt, ul(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Wt = /* @__PURE__ */ new WeakMap(), Rt = /* @__PURE__ */ new WeakMap(), re = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new WeakMap(), be = /* @__PURE__ */ new WeakMap(), ft = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), Mn = /* @__PURE__ */ new WeakMap(), xn = /* @__PURE__ */ new WeakSet(), ll = async function() {
    const t = T(this, re, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (T(this, be, "f") !== void 0) try {
      const c = await T(this, be, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const o = t.contextTokenThreshold ?? 1e5;
    if (n < o) return !1;
    const s = t.model ?? T(this, re, "f").params.model, r = t.summaryPrompt ?? fg, a = T(this, re, "f").params.messages;
    if (a[a.length - 1].role === "assistant") {
      const c = a[a.length - 1];
      if (Array.isArray(c.content)) {
        const d = c.content.filter((p) => p.type !== "tool_use");
        d.length === 0 ? a.pop() : c.content = d;
      }
    }
    const u = await this.client.beta.messages.create({
      model: s,
      messages: [...a, {
        role: "user",
        content: [{
          type: "text",
          text: r
        }]
      }],
      max_tokens: T(this, re, "f").params.max_tokens
    }, {
      signal: T(this, Ee, "f").signal,
      headers: D([T(this, Ee, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new V("Expected text response for compaction");
    return T(this, re, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (T(this, Wt, "f")) throw new V("Cannot iterate over a consumed stream");
    U(this, Wt, !0, "f"), U(this, Rt, !0, "f"), U(this, ft, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (T(this, re, "f").params.max_iterations && T(this, Mn, "f") >= T(this, re, "f").params.max_iterations) break;
          U(this, Rt, !1, "f"), U(this, ft, void 0, "f"), U(this, Mn, (e = T(this, Mn, "f"), e++, e), "f"), U(this, be, void 0, "f");
          const { max_iterations: n, compactionControl: o, ...s } = T(this, re, "f").params;
          if (s.stream ? (t = this.client.beta.messages.stream({ ...s }, T(this, Ee, "f")), U(this, be, t.finalMessage(), "f"), T(this, be, "f").catch(() => {
          }), yield t) : (U(this, be, this.client.beta.messages.create({
            ...s,
            stream: !1
          }, T(this, Ee, "f")), "f"), yield T(this, be, "f")), !await T(this, xn, "m", ll).call(this)) {
            if (!T(this, Rt, "f")) {
              const { role: a, content: u } = await T(this, be, "f");
              T(this, re, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const r = await T(this, xn, "m", Vr).call(this, T(this, re, "f").params.messages.at(-1));
            if (r) T(this, re, "f").params.messages.push(r);
            else if (!T(this, Rt, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!T(this, be, "f")) throw new V("ToolRunner concluded without a message from the server");
      T(this, yt, "f").resolve(await T(this, be, "f"));
    } catch (t) {
      throw U(this, Wt, !1, "f"), T(this, yt, "f").promise.catch(() => {
      }), T(this, yt, "f").reject(t), U(this, yt, ul(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? T(this, re, "f").params = e(T(this, re, "f").params) : T(this, re, "f").params = e, U(this, Rt, !0, "f"), U(this, ft, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? U(this, Ee, e(T(this, Ee, "f")), "f") : U(this, Ee, {
      ...T(this, Ee, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = T(this, Ee, "f").signal) {
    const t = await T(this, be, "f") ?? this.params.messages.at(-1);
    return t ? T(this, xn, "m", Vr).call(this, t, e) : null;
  }
  done() {
    return T(this, yt, "f").promise;
  }
  async runUntilDone() {
    if (!T(this, Wt, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return T(this, re, "f").params;
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
Vr = async function(t, n = T(this, Ee, "f").signal) {
  return T(this, ft, "f") !== void 0 ? T(this, ft, "f") : (U(this, ft, pg(T(this, re, "f").params, t, {
    ...T(this, Ee, "f"),
    signal: n
  }), "f"), T(this, ft, "f"));
};
async function pg(e, t = e.messages.at(-1), n) {
  if (!t || t.role !== "assistant" || !t.content || typeof t.content == "string") return null;
  const o = t.content.filter((s) => s.type === "tool_use");
  return o.length === 0 ? null : {
    role: "user",
    content: await Promise.all(o.map(async (s) => {
      const r = e.tools.find((a) => ("name" in a ? a.name : a.mcp_server_name) === s.name);
      if (!r || !("run" in r)) return {
        type: "tool_result",
        tool_use_id: s.id,
        content: `Error: Tool '${s.name}' not found`,
        is_error: !0
      };
      try {
        let a = s.input;
        "parse" in r && r.parse && (a = r.parse(a));
        const u = await r.run(a, {
          toolUseBlock: s,
          signal: n?.signal
        });
        return {
          type: "tool_result",
          tool_use_id: s.id,
          content: u
        };
      } catch (a) {
        return {
          type: "tool_result",
          tool_use_id: s.id,
          content: a instanceof Wd ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var zd = class Yd {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new vo();
    for await (const n of this.iterator) for (const o of t.decode(n)) yield JSON.parse(o);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new V("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new V("Attempted to iterate over a response with no body");
    return new Yd($i(t.body), n);
  }
}, Xd = class extends ae {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(O`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", So, {
      query: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(O`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(O`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const o = await this.retrieve(e);
    if (!o.results_url) throw new V(`No batch \`results_url\`; Has it finished processing? ${o.processing_status} - ${o.id}`);
    const { betas: s } = t ?? {};
    return this._client.get(o.results_url, {
      ...n,
      headers: D([{
        "anthropic-beta": [...s ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((r, a) => zd.fromResponse(a.response, a.controller));
  }
}, cl = {
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
}, hg = ["claude-opus-4-6"], To = class extends ae {
  constructor() {
    super(...arguments), this.batches = new Xd(this._client);
  }
  create(e, t) {
    const n = dl(e), { betas: o, ...s } = n;
    s.model in cl && console.warn(`The model '${s.model}' is deprecated and will reach end-of-life on ${cl[s.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), s.model in hg && s.thinking && s.thinking.type === "enabled" && console.warn(`Using Claude with ${s.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let r = this._client._options.timeout;
    if (!s.stream && r == null) {
      const u = Od[s.model] ?? void 0;
      r = this._client.calculateNonstreamingTimeout(s.max_tokens, u);
    }
    const a = Fd(s.tools, s.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: s,
      timeout: r ?? 6e5,
      ...t,
      headers: D([
        { ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 },
        a,
        t?.headers
      ]),
      stream: n.stream ?? !1
    });
  }
  parse(e, t) {
    return t = {
      ...t,
      headers: D([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => Vd(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return dg.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...o } = dl(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new Kd(this._client, e, t);
  }
};
function dl(e) {
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
To.Batches = Xd;
To.BetaToolRunner = Kd;
To.ToolError = Wd;
var Qd = class extends ae {
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(O`/v1/sessions/${e}/events?beta=true`, ot, {
      query: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(O`/v1/sessions/${e}/events?beta=true`, {
      body: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(O`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, Zd = class extends ae {
  retrieve(e, t, n) {
    const { session_id: o, betas: s } = t;
    return this._client.get(O`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: o, betas: s, ...r } = t;
    return this._client.post(O`/v1/sessions/${o}/resources/${e}?beta=true`, {
      body: r,
      ...n,
      headers: D([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(O`/v1/sessions/${e}/resources?beta=true`, ot, {
      query: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: o, betas: s } = t;
    return this._client.delete(O`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(O`/v1/sessions/${e}/resources?beta=true`, {
      body: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, qs = class extends ae {
  constructor() {
    super(...arguments), this.events = new Qd(this._client), this.resources = new Zd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(O`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(O`/v1/sessions/${e}?beta=true`, {
      body: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", ot, {
      query: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(O`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(O`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
qs.Events = Qd;
qs.Resources = Zd;
var jd = class extends ae {
  create(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.post(O`/v1/skills/${e}/versions?beta=true`, Bi({
      body: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o, betas: s } = t;
    return this._client.get(O`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...s ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(O`/v1/skills/${e}/versions?beta=true`, ot, {
      query: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: o, betas: s } = t;
    return this._client.delete(O`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...s ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, Gi = class extends ae {
  constructor() {
    super(...arguments), this.versions = new jd(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Bi({
      body: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(O`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", ot, {
      query: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(O`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
Gi.Versions = jd;
var ef = class extends ae {
  create(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(O`/v1/vaults/${e}/credentials?beta=true`, {
      body: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.get(O`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: o, betas: s, ...r } = t;
    return this._client.post(O`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      body: r,
      ...n,
      headers: D([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...s } = t ?? {};
    return this._client.getAPIList(O`/v1/vaults/${e}/credentials?beta=true`, ot, {
      query: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.delete(O`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: o, betas: s } = t;
    return this._client.post(O`/v1/vaults/${o}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...s ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Oi = class extends ae {
  constructor() {
    super(...arguments), this.credentials = new ef(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(O`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...s } = t;
    return this._client.post(O`/v1/vaults/${e}?beta=true`, {
      body: s,
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", ot, {
      query: o,
      ...t,
      headers: D([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(O`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(O`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: D([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Oi.Credentials = ef;
var st = class extends ae {
  constructor() {
    super(...arguments), this.models = new qd(this._client), this.messages = new To(this._client), this.agents = new qi(this._client), this.environments = new Ld(this._client), this.sessions = new qs(this._client), this.vaults = new Oi(this._client), this.files = new Bd(this._client), this.skills = new Gi(this._client);
  }
};
st.Models = qd;
st.Messages = To;
st.Agents = qi;
st.Environments = Ld;
st.Sessions = qs;
st.Vaults = Oi;
st.Files = Bd;
st.Skills = Gi;
var tf = class extends ae {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/complete", {
      body: o,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: D([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function nf(e) {
  return e?.output_config?.format;
}
function fl(e, t, n) {
  const o = nf(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((s) => s.type === "text" ? Object.defineProperty({ ...s }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : s),
    parsed_output: null
  } : of(e, t, n);
}
function of(e, t, n) {
  let o = null;
  const s = e.content.map((r) => {
    if (r.type === "text") {
      const a = mg(t, r.text);
      return o === null && (o = a), Object.defineProperty({ ...r }, "parsed_output", {
        value: a,
        enumerable: !1
      });
    }
    return r;
  });
  return {
    ...e,
    content: s,
    parsed_output: o
  };
}
function mg(e, t) {
  const n = nf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new V(`Failed to parse structured output: ${o}`);
  }
}
var qe, _t, Kt, Nn, Bo, kn, Dn, qo, Un, lt, Ln, Go, Oo, Pt, Ho, Vo, $n, mr, pl, gr, yr, _r, vr, hl, ml = "__json_buf";
function gl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var gg = class Jr {
  constructor(t, n) {
    qe.add(this), this.messages = [], this.receivedMessages = [], _t.set(this, void 0), Kt.set(this, null), this.controller = new AbortController(), Nn.set(this, void 0), Bo.set(this, () => {
    }), kn.set(this, () => {
    }), Dn.set(this, void 0), qo.set(this, () => {
    }), Un.set(this, () => {
    }), lt.set(this, {}), Ln.set(this, !1), Go.set(this, !1), Oo.set(this, !1), Pt.set(this, !1), Ho.set(this, void 0), Vo.set(this, void 0), $n.set(this, void 0), gr.set(this, (o) => {
      if (U(this, Go, !0, "f"), fo(o) && (o = new ze()), o instanceof ze)
        return U(this, Oo, !0, "f"), this._emit("abort", o);
      if (o instanceof V) return this._emit("error", o);
      if (o instanceof Error) {
        const s = new V(o.message);
        return s.cause = o, this._emit("error", s);
      }
      return this._emit("error", new V(String(o)));
    }), U(this, Nn, new Promise((o, s) => {
      U(this, Bo, o, "f"), U(this, kn, s, "f");
    }), "f"), U(this, Dn, new Promise((o, s) => {
      U(this, qo, o, "f"), U(this, Un, s, "f");
    }), "f"), T(this, Nn, "f").catch(() => {
    }), T(this, Dn, "f").catch(() => {
    }), U(this, Kt, t, "f"), U(this, $n, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, Ho, "f");
  }
  get request_id() {
    return T(this, Vo, "f");
  }
  async withResponse() {
    U(this, Pt, !0, "f");
    const t = await T(this, Nn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Jr(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: s } = {}) {
    const r = new Jr(n, { logger: s });
    for (const a of n.messages) r._addMessageParam(a);
    return U(r, Kt, {
      ...n,
      stream: !0
    }, "f"), r._run(() => r._createMessage(t, {
      ...n,
      stream: !0
    }, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, T(this, gr, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, o) {
    const s = o?.signal;
    let r;
    s && (s.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), s.addEventListener("abort", r));
    try {
      T(this, qe, "m", yr).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) T(this, qe, "m", _r).call(this, c);
      if (u.controller.signal?.aborted) throw new ze();
      T(this, qe, "m", vr).call(this);
    } finally {
      s && r && s.removeEventListener("abort", r);
    }
  }
  _connected(t) {
    this.ended || (U(this, Ho, t, "f"), U(this, Vo, t?.headers.get("request-id"), "f"), T(this, Bo, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, Ln, "f");
  }
  get errored() {
    return T(this, Go, "f");
  }
  get aborted() {
    return T(this, Oo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (T(this, lt, "f")[t] || (T(this, lt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = T(this, lt, "f")[t];
    if (!o) return this;
    const s = o.findIndex((r) => r.listener === n);
    return s >= 0 && o.splice(s, 1), this;
  }
  once(t, n) {
    return (T(this, lt, "f")[t] || (T(this, lt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      U(this, Pt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    U(this, Pt, !0, "f"), await T(this, Dn, "f");
  }
  get currentMessage() {
    return T(this, _t, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, qe, "m", mr).call(this);
  }
  async finalText() {
    return await this.done(), T(this, qe, "m", pl).call(this);
  }
  _emit(t, ...n) {
    if (T(this, Ln, "f")) return;
    t === "end" && (U(this, Ln, !0, "f"), T(this, qo, "f").call(this));
    const o = T(this, lt, "f")[t];
    if (o && (T(this, lt, "f")[t] = o.filter((s) => !s.once), o.forEach(({ listener: s }) => s(...n))), t === "abort") {
      const s = n[0];
      !T(this, Pt, "f") && !o?.length && Promise.reject(s), T(this, kn, "f").call(this, s), T(this, Un, "f").call(this, s), this._emit("end");
      return;
    }
    if (t === "error") {
      const s = n[0];
      !T(this, Pt, "f") && !o?.length && Promise.reject(s), T(this, kn, "f").call(this, s), T(this, Un, "f").call(this, s), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, qe, "m", mr).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let s;
    o && (o.aborted && this.controller.abort(), s = this.controller.abort.bind(this.controller), o.addEventListener("abort", s));
    try {
      T(this, qe, "m", yr).call(this), this._connected(null);
      const r = po.fromReadableStream(t, this.controller);
      for await (const a of r) T(this, qe, "m", _r).call(this, a);
      if (r.controller.signal?.aborted) throw new ze();
      T(this, qe, "m", vr).call(this);
    } finally {
      o && s && o.removeEventListener("abort", s);
    }
  }
  [(_t = /* @__PURE__ */ new WeakMap(), Kt = /* @__PURE__ */ new WeakMap(), Nn = /* @__PURE__ */ new WeakMap(), Bo = /* @__PURE__ */ new WeakMap(), kn = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap(), qo = /* @__PURE__ */ new WeakMap(), Un = /* @__PURE__ */ new WeakMap(), lt = /* @__PURE__ */ new WeakMap(), Ln = /* @__PURE__ */ new WeakMap(), Go = /* @__PURE__ */ new WeakMap(), Oo = /* @__PURE__ */ new WeakMap(), Pt = /* @__PURE__ */ new WeakMap(), Ho = /* @__PURE__ */ new WeakMap(), Vo = /* @__PURE__ */ new WeakMap(), $n = /* @__PURE__ */ new WeakMap(), gr = /* @__PURE__ */ new WeakMap(), qe = /* @__PURE__ */ new WeakSet(), mr = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, pl = function() {
    if (this.receivedMessages.length === 0) throw new V("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new V("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, yr = function() {
    this.ended || U(this, _t, void 0, "f");
  }, _r = function(n) {
    if (this.ended) return;
    const o = T(this, qe, "m", hl).call(this, n);
    switch (this._emit("streamEvent", n, o), n.type) {
      case "content_block_delta": {
        const s = o.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            s.type === "text" && this._emit("text", n.delta.text, s.text || "");
            break;
          case "citations_delta":
            s.type === "text" && this._emit("citation", n.delta.citation, s.citations ?? []);
            break;
          case "input_json_delta":
            gl(s) && s.input && this._emit("inputJson", n.delta.partial_json, s.input);
            break;
          case "thinking_delta":
            s.type === "thinking" && this._emit("thinking", n.delta.thinking, s.thinking);
            break;
          case "signature_delta":
            s.type === "thinking" && this._emit("signature", s.signature);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(o), this._addMessage(fl(o, T(this, Kt, "f"), { logger: T(this, $n, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        U(this, _t, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, vr = function() {
    if (this.ended) throw new V("stream has ended, this shouldn't happen");
    const n = T(this, _t, "f");
    if (!n) throw new V("request ended without sending any chunks");
    return U(this, _t, void 0, "f"), fl(n, T(this, Kt, "f"), { logger: T(this, $n, "f") });
  }, hl = function(n) {
    let o = T(this, _t, "f");
    if (n.type === "message_start") {
      if (o) throw new V(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new V(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return o;
      case "message_delta":
        return o.stop_reason = n.delta.stop_reason, o.stop_sequence = n.delta.stop_sequence, o.usage.output_tokens = n.usage.output_tokens, n.usage.input_tokens != null && (o.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (o.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (o.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (o.usage.server_tool_use = n.usage.server_tool_use), o;
      case "content_block_start":
        return o.content.push({ ...n.content_block }), o;
      case "content_block_delta": {
        const s = o.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            s?.type === "text" && (o.content[n.index] = {
              ...s,
              text: (s.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            s?.type === "text" && (o.content[n.index] = {
              ...s,
              citations: [...s.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (s && gl(s)) {
              let r = s[ml] || "";
              r += n.delta.partial_json;
              const a = { ...s };
              Object.defineProperty(a, ml, {
                value: r,
                enumerable: !1,
                writable: !0
              }), r && (a.input = Jd(r)), o.content[n.index] = a;
            }
            break;
          case "thinking_delta":
            s?.type === "thinking" && (o.content[n.index] = {
              ...s,
              thinking: s.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            s?.type === "thinking" && (o.content[n.index] = {
              ...s,
              signature: n.delta.signature
            });
            break;
          default:
            n.delta;
        }
        return o;
      }
      case "content_block_stop":
        return o;
    }
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("streamEvent", (s) => {
      const r = n.shift();
      r ? r.resolve(s) : t.push(s);
    }), this.on("end", () => {
      o = !0;
      for (const s of n) s.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (s) => {
      o = !0;
      for (const r of n) r.reject(s);
      n.length = 0;
    }), this.on("error", (s) => {
      o = !0;
      for (const r of n) r.reject(s);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((s, r) => n.push({
        resolve: s,
        reject: r
      })).then((s) => s ? {
        value: s,
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
    return new po(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
var sf = class extends ae {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(O`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", So, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(O`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(O`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new V(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: D([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, s) => zd.fromResponse(s.response, s.controller));
  }
}, Hi = class extends ae {
  constructor() {
    super(...arguments), this.batches = new sf(this._client);
  }
  create(e, t) {
    e.model in yl && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${yl[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), e.model in yg && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const s = Od[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, s);
    }
    const o = Fd(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: D([o, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => of(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return gg.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, yl = {
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
}, yg = ["claude-opus-4-6"];
Hi.Batches = sf;
var rf = class extends ae {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(O`/v1/models/${e}`, {
      ...n,
      headers: D([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models", So, {
      query: o,
      ...t,
      headers: D([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Jo = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Wr, Vi, as, af, _g = "\\n\\nHuman:", vg = "\\n\\nAssistant:", oe = class {
  constructor({ baseURL: e = Jo("ANTHROPIC_BASE_URL"), apiKey: t = Jo("ANTHROPIC_API_KEY") ?? null, authToken: n = Jo("ANTHROPIC_AUTH_TOKEN") ?? null, ...o } = {}) {
    Wr.add(this), as.set(this, void 0);
    const s = {
      apiKey: t,
      authToken: n,
      ...o,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!s.dangerouslyAllowBrowser && km()) throw new V(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = s.baseURL, this.timeout = s.timeout ?? Vi.DEFAULT_TIMEOUT, this.logger = s.logger ?? console;
    const r = "warn";
    this.logLevel = r, this.logLevel = ja(s.logLevel, "ClientOptions.logLevel", this) ?? ja(Jo("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? r, this.fetchOptions = s.fetchOptions, this.maxRetries = s.maxRetries ?? 2, this.fetch = s.fetch ?? Fm(), U(this, as, qm, "f"), this._options = s, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return D([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return D([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return D([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return Gm(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Zt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${pd()}`;
  }
  makeStatusError(e, t, n, o) {
    return Le.generate(e, t, n, o);
  }
  buildURL(e, t, n) {
    const o = !T(this, Wr, "m", af).call(this) && n || this.baseURL, s = Pm(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), r = this.defaultQuery(), a = Object.fromEntries(s.searchParams);
    return (!Wa(r) || !Wa(a)) && (t = {
      ...a,
      ...r,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (s.search = this.stringifyQuery(t)), s.toString();
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
    return this.request(Promise.resolve(n).then((o) => ({
      method: e,
      path: t,
      ...o
    })));
  }
  request(e, t = null) {
    return new Rd(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, s = o.maxRetries ?? this.maxRetries;
    t == null && (t = s), await this.prepareOptions(o);
    const { req: r, url: a, timeout: u } = await this.buildRequest(o, { retryCount: s - t });
    await this.prepareRequest(r, {
      url: a,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, p = Date.now();
    if (ve(this).debug(`[${c}] sending request`, xt({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: r.headers
    })), o.signal?.aborted) throw new ze();
    const f = new AbortController(), h = await this.fetchWithTimeout(a, r, u, f).catch($r), m = Date.now();
    if (h instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new ze();
      const v = fo(h) || /timed? ?out/i.test(String(h) + ("cause" in h ? String(h.cause) : ""));
      if (t)
        return ve(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${_}`), ve(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${_})`, xt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - p,
          message: h.message
        })), this.retryRequest(o, t, n ?? c);
      throw ve(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), ve(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, xt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - p,
        message: h.message
      })), v ? new hd() : new Bs({ cause: h });
    }
    const g = `[${c}${d}${[...h.headers.entries()].filter(([_]) => _ === "request-id").map(([_, v]) => ", " + _ + ": " + JSON.stringify(v)).join("")}] ${r.method} ${a} ${h.ok ? "succeeded" : "failed"} with status ${h.status} in ${m - p}ms`;
    if (!h.ok) {
      const _ = await this.shouldRetry(h);
      if (t && _) {
        const x = `retrying, ${t} attempts remaining`;
        return await Bm(h.body), ve(this).info(`${g} - ${x}`), ve(this).debug(`[${c}] response error (${x})`, xt({
          retryOfRequestLogID: n,
          url: h.url,
          status: h.status,
          headers: h.headers,
          durationMs: m - p
        })), this.retryRequest(o, t, n ?? c, h.headers);
      }
      const v = _ ? "error; no more retries left" : "error; not retryable";
      ve(this).info(`${g} - ${v}`);
      const w = await h.text().catch((x) => $r(x).message), A = wd(w), b = A ? void 0 : w;
      throw ve(this).debug(`[${c}] response error (${v})`, xt({
        retryOfRequestLogID: n,
        url: h.url,
        status: h.status,
        headers: h.headers,
        message: b,
        durationMs: Date.now() - p
      })), this.makeStatusError(h.status, A, b, h.headers);
    }
    return ve(this).info(g), ve(this).debug(`[${c}] response start`, xt({
      retryOfRequestLogID: n,
      url: h.url,
      status: h.status,
      headers: h.headers,
      durationMs: m - p
    })), {
      response: h,
      options: o,
      controller: f,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: p
    };
  }
  getAPIList(e, t, n) {
    return this.requestAPIList(t, n && "then" in n ? n.then((o) => ({
      method: "get",
      path: e,
      ...o
    })) : {
      method: "get",
      path: e,
      ...n
    });
  }
  requestAPIList(e, t) {
    const n = this.makeRequest(t, null, void 0);
    return new Xm(this, n, e);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: s, method: r, ...a } = t || {}, u = this._makeAbort(o);
    s && s.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, p = {
      signal: o.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...a
    };
    r && (p.method = r.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, p);
    } finally {
      clearTimeout(c);
    }
  }
  async shouldRetry(e) {
    const t = e.headers.get("x-should-retry");
    return t === "true" ? !0 : t === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
  }
  async retryRequest(e, t, n, o) {
    let s;
    const r = o?.get("retry-after-ms");
    if (r) {
      const u = parseFloat(r);
      Number.isNaN(u) || (s = u);
    }
    const a = o?.get("retry-after");
    if (a && !s) {
      const u = parseFloat(a);
      Number.isNaN(u) ? s = Date.parse(a) - Date.now() : s = u * 1e3;
    }
    if (s === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      s = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await Nm(s), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const s = t - e;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new V("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: s, query: r, defaultBaseURL: a } = n, u = this.buildURL(s, r, a);
    "timeout" in n && Mm("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: c, body: d } = this.buildBody({ options: n });
    return {
      req: {
        method: o,
        headers: await this.buildHeaders({
          options: e,
          method: o,
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
  async buildHeaders({ options: e, method: t, bodyHeaders: n, retryCount: o }) {
    let s = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), s[this.idempotencyHeader] = e.idempotencyKey);
    const r = D([
      s,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...$m(),
        ...this._options.dangerouslyAllowBrowser ? { "anthropic-dangerous-direct-browser-access": "true" } : void 0,
        "anthropic-version": "2023-06-01"
      },
      await this.authHeaders(e),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(r), r.values;
  }
  _makeAbort(e) {
    return () => e.abort();
  }
  buildBody({ options: { body: e, headers: t } }) {
    if (!e) return {
      bodyHeaders: void 0,
      body: void 0
    };
    const n = D([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Ad(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : T(this, as, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Vi = oe, as = /* @__PURE__ */ new WeakMap(), Wr = /* @__PURE__ */ new WeakSet(), af = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
oe.Anthropic = Vi;
oe.HUMAN_PROMPT = _g;
oe.AI_PROMPT = vg;
oe.DEFAULT_TIMEOUT = 6e5;
oe.AnthropicError = V;
oe.APIError = Le;
oe.APIConnectionError = Bs;
oe.APIConnectionTimeoutError = hd;
oe.APIUserAbortError = ze;
oe.NotFoundError = _d;
oe.ConflictError = vd;
oe.RateLimitError = Td;
oe.BadRequestError = md;
oe.AuthenticationError = gd;
oe.InternalServerError = Ed;
oe.PermissionDeniedError = yd;
oe.UnprocessableEntityError = Sd;
oe.toFile = ng;
var Eo = class extends oe {
  constructor() {
    super(...arguments), this.completions = new tf(this), this.messages = new Hi(this), this.models = new rf(this), this.beta = new st(this);
  }
};
Eo.Completions = tf;
Eo.Messages = Hi;
Eo.Models = rf;
Eo.Beta = st;
function fn(e) {
  if (Array.isArray(e)) return e.map((n) => fn(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, o]) => {
    t[n] = /authorization|csrf|token|api[-_]?key|proxy_password|password/i.test(n) ? "[redacted]" : fn(o);
  }), t;
}
function ho(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: fn({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    })
  };
}
function Sg(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Tg(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function lf(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Eg(e) {
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
      const o = Tg(n.image_url.url);
      return !o.mediaType || !o.data ? null : {
        type: "image",
        source: {
          type: "base64",
          media_type: o.mediaType,
          data: o.data
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
function wg(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function Cg(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && lf(t) || null;
}
function Ag(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: lf(e.content) || [] } : void 0;
}
function _l(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function vl(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: Sg(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function Ig(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const o = e[n];
    if (o.role !== "system") {
      if (o.role === "assistant") {
        const s = Cg(o), r = vl(o.tool_calls);
        if (s && r.length) {
          t.push({
            role: "assistant",
            content: s.filter((a) => a?.type !== "tool_use").concat(r)
          });
          continue;
        }
        if (s) {
          t.push({
            role: "assistant",
            content: s
          });
          continue;
        }
      }
      if (o.role === "tool") {
        const s = [_l(o)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, s.push(_l(e[n]));
        t.push({
          role: "user",
          content: s
        });
        continue;
      }
      if (o.role === "assistant" && Array.isArray(o.tool_calls) && o.tool_calls.length) {
        t.push({
          role: "assistant",
          content: [...o.content ? [{
            type: "text",
            text: o.content
          }] : [], ...vl(o.tool_calls)]
        });
        continue;
      }
      t.push({
        role: o.role,
        content: Eg(o.content)
      });
    }
  }
  return t;
}
function Wo(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Sl(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
var bg = class {
  constructor(e) {
    this.config = e, this.client = new Eo({
      apiKey: e.apiKey,
      baseURL: Sl(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e) {
    const t = (e.tools || []).map((s) => ({
      name: s.function.name,
      description: s.function.description,
      input_schema: s.function.parameters
    })), n = wg(e), o = {
      model: this.config.model,
      system: n,
      messages: Ig(e.messages),
      tools: t,
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (o.temperature = e.temperature), e.reasoning?.enabled && (o.thinking = {
      type: "adaptive",
      display: "summarized"
    }), o;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = Sl(this.config.baseUrl);
    return ho({
      provider: "anthropic",
      model: this.config.model,
      transport: "anthropic-sdk",
      url: `${o}/v1/messages`,
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
    let o;
    if (typeof e.onStreamProgress == "function") {
      const r = this.client.messages.stream(t, { signal: e.signal }), a = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
      let c = "";
      const d = () => Array.from(a.entries()).sort(([h], [m]) => h.localeCompare(m)).map(([h, m]) => ({
        label: h.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: m
      })).filter((h) => h.text), p = () => Array.from(u.entries()).sort(([h], [m]) => Number(h) - Number(m)).map(([, h]) => ({
        id: h.id || "anthropic-tool-draft",
        name: h.name || "工具调用",
        arguments: h.inputJson || "{}",
        draft: !0
      })).filter((h) => h.name), f = () => {
        const h = p();
        h.length && Wo(e, {
          text: c,
          thoughts: d(),
          toolCalls: h,
          toolCallDraft: !0
        });
      };
      r.on("text", (h, m) => {
        c = m || "", Wo(e, {
          text: c,
          thoughts: d(),
          ...p().length ? {
            toolCalls: p(),
            toolCallDraft: !0
          } : {}
        });
      }), r.on("thinking", (h, m) => {
        a.set("thinking:0", m || ""), Wo(e, {
          thoughts: d(),
          ...p().length ? {
            text: c,
            toolCalls: p(),
            toolCallDraft: !0
          } : {}
        });
      }), r.on("streamEvent", (h) => {
        if (h?.type === "content_block_start" && h.content_block?.type === "tool_use") {
          const m = h.content_block.input && typeof h.content_block.input == "object" ? h.content_block.input : {};
          u.set(h.index, {
            id: h.content_block.id || `anthropic-tool-draft-${h.index + 1}`,
            name: h.content_block.name || "工具调用",
            inputJson: Object.keys(m).length ? JSON.stringify(m) : ""
          }), f();
          return;
        }
        if (h?.type === "content_block_delta" && h.delta?.type === "input_json_delta") {
          const m = u.get(h.index) || {
            id: `anthropic-tool-draft-${h.index + 1}`,
            name: "工具调用",
            inputJson: ""
          };
          u.set(h.index, {
            ...m,
            inputJson: `${m.inputJson || ""}${h.delta.partial_json || ""}`
          }), f();
        }
      }), r.on("contentBlock", (h) => {
        h?.type === "redacted_thinking" && (a.set("redacted:0", h.data || ""), Wo(e, {
          thoughts: d(),
          ...p().length ? {
            text: c,
            toolCalls: p(),
            toolCallDraft: !0
          } : {}
        }));
      }), o = await r.finalMessage();
    } else o = await this.client.messages.create(t, { signal: e.signal });
    const s = (o.content || []).filter((r) => r.type === "tool_use" && r.name).map((r, a) => ({
      id: r.id || `anthropic-tool-${a + 1}`,
      name: r.name,
      arguments: JSON.stringify(r.input || {})
    }));
    return {
      text: (o.content || []).filter((r) => r.type === "text").map((r) => r.text || "").join(`
`),
      toolCalls: s,
      thoughts: (o.content || []).filter((r) => r.type === "thinking" || r.type === "redacted_thinking").map((r) => ({
        label: r.type === "thinking" ? "思考块" : "已脱敏思考块",
        text: r.type === "thinking" ? r.thinking || "" : r.data || ""
      })).filter((r) => r.text),
      finishReason: o.stop_reason || "stop",
      model: o.model || this.config.model,
      provider: "anthropic",
      providerPayload: Ag(o),
      requestInspection: n
    };
  }
}, Rg = /* @__PURE__ */ Fs(((e, t) => {
  function n(o, s) {
    typeof s == "boolean" && (s = { forever: s }), this._originalTimeouts = JSON.parse(JSON.stringify(o)), this._timeouts = o, this._options = s || {}, this._maxRetryTime = s && s.maxRetryTime || 1 / 0, this._fn = null, this._errors = [], this._attempts = 1, this._operationTimeout = null, this._operationTimeoutCb = null, this._timeout = null, this._operationStart = null, this._timer = null, this._options.forever && (this._cachedTimeouts = this._timeouts.slice(0));
  }
  t.exports = n, n.prototype.reset = function() {
    this._attempts = 1, this._timeouts = this._originalTimeouts.slice(0);
  }, n.prototype.stop = function() {
    this._timeout && clearTimeout(this._timeout), this._timer && clearTimeout(this._timer), this._timeouts = [], this._cachedTimeouts = null;
  }, n.prototype.retry = function(o) {
    if (this._timeout && clearTimeout(this._timeout), !o) return !1;
    var s = (/* @__PURE__ */ new Date()).getTime();
    if (o && s - this._operationStart >= this._maxRetryTime)
      return this._errors.push(o), this._errors.unshift(/* @__PURE__ */ new Error("RetryOperation timeout occurred")), !1;
    this._errors.push(o);
    var r = this._timeouts.shift();
    if (r === void 0) if (this._cachedTimeouts)
      this._errors.splice(0, this._errors.length - 1), r = this._cachedTimeouts.slice(-1);
    else return !1;
    var a = this;
    return this._timer = setTimeout(function() {
      a._attempts++, a._operationTimeoutCb && (a._timeout = setTimeout(function() {
        a._operationTimeoutCb(a._attempts);
      }, a._operationTimeout), a._options.unref && a._timeout.unref()), a._fn(a._attempts);
    }, r), this._options.unref && this._timer.unref(), !0;
  }, n.prototype.attempt = function(o, s) {
    this._fn = o, s && (s.timeout && (this._operationTimeout = s.timeout), s.cb && (this._operationTimeoutCb = s.cb));
    var r = this;
    this._operationTimeoutCb && (this._timeout = setTimeout(function() {
      r._operationTimeoutCb();
    }, r._operationTimeout)), this._operationStart = (/* @__PURE__ */ new Date()).getTime(), this._fn(this._attempts);
  }, n.prototype.try = function(o) {
    this.attempt(o);
  }, n.prototype.start = function(o) {
    this.attempt(o);
  }, n.prototype.start = n.prototype.try, n.prototype.errors = function() {
    return this._errors;
  }, n.prototype.attempts = function() {
    return this._attempts;
  }, n.prototype.mainError = function() {
    if (this._errors.length === 0) return null;
    for (var o = {}, s = null, r = 0, a = 0; a < this._errors.length; a++) {
      var u = this._errors[a], c = u.message, d = (o[c] || 0) + 1;
      o[c] = d, d >= r && (s = u, r = d);
    }
    return s;
  };
})), Pg = /* @__PURE__ */ Fs(((e) => {
  var t = Rg();
  e.operation = function(n) {
    return new t(e.timeouts(n), {
      forever: n && (n.forever || n.retries === 1 / 0),
      unref: n && n.unref,
      maxRetryTime: n && n.maxRetryTime
    });
  }, e.timeouts = function(n) {
    if (n instanceof Array) return [].concat(n);
    var o = {
      retries: 10,
      factor: 2,
      minTimeout: 1 * 1e3,
      maxTimeout: 1 / 0,
      randomize: !1
    };
    for (var s in n) o[s] = n[s];
    if (o.minTimeout > o.maxTimeout) throw new Error("minTimeout is greater than maxTimeout");
    for (var r = [], a = 0; a < o.retries; a++) r.push(this.createTimeout(a, o));
    return n && n.forever && !r.length && r.push(this.createTimeout(a, o)), r.sort(function(u, c) {
      return u - c;
    }), r;
  }, e.createTimeout = function(n, o) {
    var s = o.randomize ? Math.random() + 1 : 1, r = Math.round(s * Math.max(o.minTimeout, 1) * Math.pow(o.factor, n));
    return r = Math.min(r, o.maxTimeout), r;
  }, e.wrap = function(n, o, s) {
    if (o instanceof Array && (s = o, o = null), !s) {
      s = [];
      for (var r in n) typeof n[r] == "function" && s.push(r);
    }
    for (var a = 0; a < s.length; a++) {
      var u = s[a], c = n[u];
      n[u] = function(p) {
        var f = e.operation(o), h = Array.prototype.slice.call(arguments, 1), m = h.pop();
        h.push(function(g) {
          f.retry(g) || (g && (arguments[0] = f.mainError()), m.apply(this, arguments));
        }), f.attempt(function() {
          p.apply(n, h);
        });
      }.bind(n, c), n[u].options = o;
    }
  };
})), xg = /* @__PURE__ */ Fs(((e, t) => {
  t.exports = Pg();
})), Mg = /* @__PURE__ */ Fs(((e, t) => {
  var n = xg(), o = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], s = class extends Error {
    constructor(c) {
      super(), c instanceof Error ? (this.originalError = c, { message: c } = c) : (this.originalError = new Error(c), this.originalError.stack = this.stack), this.name = "AbortError", this.message = c;
    }
  }, r = (c, d, p) => {
    const f = p.retries - (d - 1);
    return c.attemptNumber = d, c.retriesLeft = f, c;
  }, a = (c) => o.includes(c), u = (c, d) => new Promise((p, f) => {
    d = {
      onFailedAttempt: () => {
      },
      retries: 10,
      ...d
    };
    const h = n.operation(d);
    h.attempt(async (m) => {
      try {
        p(await c(m));
      } catch (g) {
        if (!(g instanceof Error)) {
          f(/* @__PURE__ */ new TypeError(`Non-error was thrown: "${g}". You should only throw errors.`));
          return;
        }
        if (g instanceof s)
          h.stop(), f(g.originalError);
        else if (g instanceof TypeError && !a(g.message))
          h.stop(), f(g);
        else {
          r(g, m, d);
          try {
            await d.onFailedAttempt(g);
          } catch (_) {
            f(_);
            return;
          }
          h.retry(g) || f(h.mainError());
        }
      }
    });
  });
  t.exports = u, t.exports.default = u, t.exports.AbortError = s;
})), Tl = /* @__PURE__ */ vm(Mg(), 1), Ng = void 0, kg = void 0;
function Dg() {
  return {
    geminiUrl: Ng,
    vertexUrl: kg
  };
}
function Ug(e, t, n, o) {
  var s, r;
  if (!e?.baseUrl) {
    const a = Dg();
    return t ? (s = a.vertexUrl) !== null && s !== void 0 ? s : n : (r = a.geminiUrl) !== null && r !== void 0 ? r : o;
  }
  return e.baseUrl;
}
var ht = class {
};
function k(e, t) {
  return e.replace(/\{([^}]+)\}/g, (n, o) => {
    if (Object.prototype.hasOwnProperty.call(t, o)) {
      const s = t[o];
      return s != null ? String(s) : "";
    } else throw new Error(`Key '${o}' not found in valueMap.`);
  });
}
function l(e, t, n) {
  for (let r = 0; r < t.length - 1; r++) {
    const a = t[r];
    if (a.endsWith("[]")) {
      const u = a.slice(0, -2);
      if (!(u in e)) if (Array.isArray(n)) e[u] = Array.from({ length: n.length }, () => ({}));
      else throw new Error(`Value must be a list given an array path ${a}`);
      if (Array.isArray(e[u])) {
        const c = e[u];
        if (Array.isArray(n)) for (let d = 0; d < c.length; d++) {
          const p = c[d];
          l(p, t.slice(r + 1), n[d]);
        }
        else for (const d of c) l(d, t.slice(r + 1), n);
      }
      return;
    } else if (a.endsWith("[0]")) {
      const u = a.slice(0, -3);
      u in e || (e[u] = [{}]);
      const c = e[u];
      l(c[0], t.slice(r + 1), n);
      return;
    }
    (!e[a] || typeof e[a] != "object") && (e[a] = {}), e = e[a];
  }
  const o = t[t.length - 1], s = e[o];
  if (s !== void 0) {
    if (!n || typeof n == "object" && Object.keys(n).length === 0 || n === s) return;
    if (typeof s == "object" && typeof n == "object" && s !== null && n !== null) Object.assign(s, n);
    else throw new Error(`Cannot set value for an existing key. Key: ${o}`);
  } else o === "_self" && typeof n == "object" && n !== null && !Array.isArray(n) ? Object.assign(e, n) : e[o] = n;
}
function i(e, t, n = void 0) {
  try {
    if (t.length === 1 && t[0] === "_self") return e;
    for (let o = 0; o < t.length; o++) {
      if (typeof e != "object" || e === null) return n;
      const s = t[o];
      if (s.endsWith("[]")) {
        const r = s.slice(0, -2);
        if (r in e) {
          const a = e[r];
          return Array.isArray(a) ? a.map((u) => i(u, t.slice(o + 1), n)) : n;
        } else return n;
      } else e = e[s];
    }
    return e;
  } catch (o) {
    if (o instanceof TypeError) return n;
    throw o;
  }
}
function Lg(e, t) {
  for (const [n, o] of Object.entries(t)) {
    const s = n.split("."), r = o.split("."), a = /* @__PURE__ */ new Set();
    let u = -1;
    for (let c = 0; c < s.length; c++) if (s[c] === "*") {
      u = c;
      break;
    }
    if (u !== -1 && r.length > u) for (let c = u; c < r.length; c++) {
      const d = r[c];
      d !== "*" && !d.endsWith("[]") && !d.endsWith("[0]") && a.add(d);
    }
    Kr(e, s, r, 0, a);
  }
}
function Kr(e, t, n, o, s) {
  if (o >= t.length || typeof e != "object" || e === null) return;
  const r = t[o];
  if (r.endsWith("[]")) {
    const a = r.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) Kr(c, t, n, o + 1, s);
  } else if (r === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const a = e, u = Object.keys(a).filter((d) => !d.startsWith("_") && !s.has(d)), c = {};
      for (const d of u) c[d] = a[d];
      for (const [d, p] of Object.entries(c)) {
        const f = [];
        for (const h of n.slice(o)) h === "*" ? f.push(d) : f.push(h);
        l(a, f, p);
      }
      for (const d of u) delete a[d];
    }
  } else {
    const a = e;
    r in a && Kr(a[r], t, n, o + 1, s);
  }
}
function Ji(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function $g(e) {
  const t = {}, n = i(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const o = i(e, ["resourceName"]);
  return o != null && l(t, ["_url", "resourceName"], o), t;
}
function Fg(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = i(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = i(e, ["done"]);
  s != null && l(t, ["done"], s);
  const r = i(e, ["error"]);
  r != null && l(t, ["error"], r);
  const a = i(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], qg(a)), t;
}
function Bg(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = i(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = i(e, ["done"]);
  s != null && l(t, ["done"], s);
  const r = i(e, ["error"]);
  r != null && l(t, ["error"], r);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], Gg(a)), t;
}
function qg(e) {
  const t = {}, n = i(e, ["generatedSamples"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((a) => Og(a))), l(t, ["generatedVideos"], r);
  }
  const o = i(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const s = i(e, ["raiMediaFilteredReasons"]);
  return s != null && l(t, ["raiMediaFilteredReasons"], s), t;
}
function Gg(e) {
  const t = {}, n = i(e, ["videos"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((a) => Hg(a))), l(t, ["generatedVideos"], r);
  }
  const o = i(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const s = i(e, ["raiMediaFilteredReasons"]);
  return s != null && l(t, ["raiMediaFilteredReasons"], s), t;
}
function Og(e) {
  const t = {}, n = i(e, ["video"]);
  return n != null && l(t, ["video"], Yg(n)), t;
}
function Hg(e) {
  const t = {}, n = i(e, ["_self"]);
  return n != null && l(t, ["video"], Xg(n)), t;
}
function Vg(e) {
  const t = {}, n = i(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Jg(e) {
  const t = {}, n = i(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Wg(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = i(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = i(e, ["done"]);
  s != null && l(t, ["done"], s);
  const r = i(e, ["error"]);
  r != null && l(t, ["error"], r);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], Kg(a)), t;
}
function Kg(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = i(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function uf(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = i(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = i(e, ["done"]);
  s != null && l(t, ["done"], s);
  const r = i(e, ["error"]);
  r != null && l(t, ["error"], r);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], zg(a)), t;
}
function zg(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = i(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function Yg(e) {
  const t = {}, n = i(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const o = i(e, ["encodedVideo"]);
  o != null && l(t, ["videoBytes"], Ji(o));
  const s = i(e, ["encoding"]);
  return s != null && l(t, ["mimeType"], s), t;
}
function Xg(e) {
  const t = {}, n = i(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const o = i(e, ["bytesBase64Encoded"]);
  o != null && l(t, ["videoBytes"], Ji(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(t, ["mimeType"], s), t;
}
var El;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(El || (El = {}));
var wl;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(wl || (wl = {}));
var Cl;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(Cl || (Cl = {}));
var Ct;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(Ct || (Ct = {}));
var Al;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(Al || (Al = {}));
var Il;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(Il || (Il = {}));
var bl;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(bl || (bl = {}));
var Rl;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(Rl || (Rl = {}));
var Pl;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(Pl || (Pl = {}));
var xl;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(xl || (xl = {}));
var Ml;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(Ml || (Ml = {}));
var zr;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(zr || (zr = {}));
var so;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(so || (so = {}));
var Nl;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(Nl || (Nl = {}));
var kl;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(kl || (kl = {}));
var Dl;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Dl || (Dl = {}));
var Ul;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Ul || (Ul = {}));
var Ll;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Ll || (Ll = {}));
var $l;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})($l || ($l = {}));
var Fl;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Fl || (Fl = {}));
var Bl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Bl || (Bl = {}));
var ql;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(ql || (ql = {}));
var Gl;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Gl || (Gl = {}));
var Ol;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Ol || (Ol = {}));
var ws;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(ws || (ws = {}));
var Hl;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Hl || (Hl = {}));
var Vl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(Vl || (Vl = {}));
var Jl;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Jl || (Jl = {}));
var Wl;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(Wl || (Wl = {}));
var Yr;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(Yr || (Yr = {}));
var Kl;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Kl || (Kl = {}));
var zl;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(zl || (zl = {}));
var Yl;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Xl || (Xl = {}));
var Ql;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Ql || (Ql = {}));
var Zl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(Zl || (Zl = {}));
var jl;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(jl || (jl = {}));
var Xr;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(Xr || (Xr = {}));
var eu;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(eu || (eu = {}));
var tu;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(tu || (tu = {}));
var Cs;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(Cs || (Cs = {}));
var nu;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(nu || (nu = {}));
var ou;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(ou || (ou = {}));
var su;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(su || (su = {}));
var ru;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(ru || (ru = {}));
var iu;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(iu || (iu = {}));
var au;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(au || (au = {}));
var lu;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(lu || (lu = {}));
var uu;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(uu || (uu = {}));
var cu;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(cu || (cu = {}));
var du;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(du || (du = {}));
var fu;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(fu || (fu = {}));
var pu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(pu || (pu = {}));
var hu;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(hu || (hu = {}));
var mu;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(mu || (mu = {}));
var gu;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(gu || (gu = {}));
var yu;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(yu || (yu = {}));
var _u;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(_u || (_u = {}));
var vu;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(vu || (vu = {}));
var Su;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(Su || (Su = {}));
var Tu;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(Tu || (Tu = {}));
var Eu;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(Eu || (Eu = {}));
var wu;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(wu || (wu = {}));
var Cu;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(Cu || (Cu = {}));
var rn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(rn || (rn = {}));
var Qr = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Fn = class {
  get text() {
    var e, t, n, o, s, r, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let c = "", d = !1;
    const p = [];
    for (const f of (u = (a = (r = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || r === void 0 ? void 0 : r.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [h, m] of Object.entries(f)) h !== "text" && h !== "thought" && h !== "thoughtSignature" && (m !== null || m !== void 0) && p.push(h);
      if (typeof f.text == "string") {
        if (typeof f.thought == "boolean" && f.thought) continue;
        d = !0, c += f.text;
      }
    }
    return p.length > 0 && console.warn(`there are non-text parts ${p} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, o, s, r, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const p of (u = (a = (r = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || r === void 0 ? void 0 : r.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [f, h] of Object.entries(p)) f !== "inlineData" && (h !== null || h !== void 0) && d.push(f);
      p.inlineData && typeof p.inlineData.data == "string" && (c += atob(p.inlineData.data));
    }
    return d.length > 0 && console.warn(`there are non-data parts ${d} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), c.length > 0 ? btoa(c) : void 0;
  }
  get functionCalls() {
    var e, t, n, o, s, r, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    const c = (u = (a = (r = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || r === void 0 ? void 0 : r.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((d) => d.functionCall).map((d) => d.functionCall).filter((d) => d !== void 0);
    if (c?.length !== 0)
      return c;
  }
  get executableCode() {
    var e, t, n, o, s, r, a, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    const d = (u = (a = (r = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || r === void 0 ? void 0 : r.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((p) => p.executableCode).map((p) => p.executableCode).filter((p) => p !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, o, s, r, a, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (a = (r = (s = this.candidates) === null || s === void 0 ? void 0 : s[0]) === null || r === void 0 ? void 0 : r.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((p) => p.codeExecutionResult).map((p) => p.codeExecutionResult).filter((p) => p !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, Au = class {
}, Iu = class {
}, Qg = class {
}, Zg = class {
}, jg = class {
}, ey = class {
}, bu = class {
}, Ru = class {
}, Pu = class {
}, ty = class {
}, xu = class cf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new cf();
    let s;
    const r = t;
    return n ? s = Bg(r) : s = Fg(r), Object.assign(o, s), o;
  }
}, Mu = class {
}, Nu = class {
}, ku = class {
}, Du = class {
}, ny = class {
}, oy = class {
}, sy = class {
}, ry = class df {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new df(), s = Wg(t);
    return Object.assign(o, s), o;
  }
}, iy = class {
}, ay = class {
}, ly = class {
}, uy = class {
}, Uu = class {
}, cy = class {
  get text() {
    var e, t, n;
    let o = "", s = !1;
    const r = [];
    for (const a of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [u, c] of Object.entries(a)) u !== "text" && u !== "thought" && c !== null && r.push(u);
      if (typeof a.text == "string") {
        if (typeof a.thought == "boolean" && a.thought) continue;
        s = !0, o += a.text;
      }
    }
    return r.length > 0 && console.warn(`there are non-text parts ${r} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), s ? o : void 0;
  }
  get data() {
    var e, t, n;
    let o = "";
    const s = [];
    for (const r of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [a, u] of Object.entries(r)) a !== "inlineData" && u !== null && s.push(a);
      r.inlineData && typeof r.inlineData.data == "string" && (o += atob(r.inlineData.data));
    }
    return s.length > 0 && console.warn(`there are non-data parts ${s} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), o.length > 0 ? btoa(o) : void 0;
  }
}, dy = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, fy = class ff {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new ff(), s = uf(t);
    return Object.assign(o, s), o;
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
function pf(e, t) {
  const n = Y(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function hf(e) {
  return Array.isArray(e) ? e.map((t) => As(t)) : [As(e)];
}
function As(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function mf(e) {
  const t = As(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function gf(e) {
  const t = As(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Lu(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function yf(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Lu(t)) : [Lu(e)];
}
function Zr(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function $u(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Fu(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function de(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return Zr(e) ? e : {
    role: "user",
    parts: yf(e)
  };
}
function Wi(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const o = de(n);
    return o.parts && o.parts.length > 0 && o.parts[0].text !== void 0 ? [o.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = de(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => de(n)) : [de(t)];
}
function Ae(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if ($u(e) || Fu(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [de(e)];
  }
  const t = [], n = [], o = Zr(e[0]);
  for (const s of e) {
    const r = Zr(s);
    if (r != o) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (r) t.push(s);
    else {
      if ($u(s) || Fu(s)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(s);
    }
  }
  return o || t.push({
    role: "user",
    parts: yf(n)
  }), t;
}
function py(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((o) => o !== "null");
  if (n.length === 1) t.type = Object.values(Ct).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : Ct.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const o of n) t.anyOf.push({ type: Object.values(Ct).includes(o.toUpperCase()) ? o.toUpperCase() : Ct.TYPE_UNSPECIFIED });
  }
}
function un(e) {
  const t = {}, n = ["items"], o = ["anyOf"], s = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const r = e.anyOf;
  r != null && r.length == 2 && (r[0].type === "null" ? (t.nullable = !0, e = r[1]) : r[1].type === "null" && (t.nullable = !0, e = r[0])), e.type instanceof Array && py(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(Ct).includes(u.toUpperCase()) ? u.toUpperCase() : Ct.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = un(u);
      else if (o.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(un(d));
        }
        t[a] = c;
      } else if (s.includes(a)) {
        const c = {};
        for (const [d, p] of Object.entries(u)) c[d] = un(p);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function Ki(e) {
  return un(e);
}
function zi(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function Yi(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function gn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = un(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = un(t.response));
  return e;
}
function yn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function hy(e, t, n, o = 1) {
  const s = !t.startsWith(`${n}/`) && t.split("/").length === o;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : s ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : s ? `${n}/${t}` : t;
}
function mt(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return hy(e, t, "cachedContents");
}
function _f(e) {
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
function It(e) {
  return Ji(e);
}
function my(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function gy(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function yy(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function vf(e) {
  var t;
  let n;
  if (my(e) && (n = e.name), !(yy(e) && (n = e.uri, n === void 0)) && !(gy(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const o = n.split("files/")[1].match(/[a-z0-9]+/);
      if (o === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = o[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function Sf(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function Tf(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (_y(e, t)) return e[t];
  return [];
}
function _y(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function vy(e, t = {}) {
  const n = e, o = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (o.responseJsonSchema = n.outputSchema), t.behavior && (o.behavior = t.behavior), { functionDeclarations: [o] };
}
function Sy(e, t = {}) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const s of e) {
    const r = s.name;
    if (o.has(r)) throw new Error(`Duplicate function name ${r} found in MCP tools. Please ensure function names are unique.`);
    o.add(r);
    const a = vy(s, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function Ef(e, t) {
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
  const o = [n.gcsUri, n.bigqueryUri].filter(Boolean).length, s = [n.inlinedRequests, n.fileName].filter(Boolean).length;
  if (e.isVertexAI()) {
    if (s > 0 || o !== 1) throw new Error("Exactly one of `gcsUri` or `bigqueryUri` must be set for Vertex AI.");
  } else if (o > 0 || s !== 1) throw new Error("Exactly one of `inlinedRequests`, `fileName`, must be set for Gemini API.");
  return n;
}
function Ty(e) {
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
function wf(e) {
  if (typeof e != "object" || e === null) return {};
  const t = e, n = t.inlinedResponses;
  if (typeof n != "object" || n === null) return e;
  const o = n.inlinedResponses;
  if (!Array.isArray(o) || o.length === 0) return e;
  let s = !1;
  for (const r of o) {
    if (typeof r != "object" || r === null) continue;
    const a = r.response;
    if (!(typeof a != "object" || a === null) && a.embedding !== void 0) {
      s = !0;
      break;
    }
  }
  return s && (t.inlinedEmbedContentResponses = t.inlinedResponses, delete t.inlinedResponses), e;
}
function _n(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function Cf(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function Ey(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function wy(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Cy(e) {
  const t = {}, n = i(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const o = i(e, ["inlinedResponses", "inlinedResponses"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((a) => s_(a))), l(t, ["inlinedResponses"], r);
  }
  const s = i(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (s != null) {
    let r = s;
    Array.isArray(r) && (r = r.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], r);
  }
  return t;
}
function Ay(e) {
  const t = {}, n = i(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const o = i(e, ["gcsDestination", "outputUriPrefix"]);
  o != null && l(t, ["gcsUri"], o);
  const s = i(e, ["bigqueryDestination", "outputUri"]);
  return s != null && l(t, ["bigqueryUri"], s), t;
}
function Iy(e) {
  const t = {}, n = i(e, ["format"]);
  n != null && l(t, ["predictionsFormat"], n);
  const o = i(e, ["gcsUri"]);
  o != null && l(t, ["gcsDestination", "outputUriPrefix"], o);
  const s = i(e, ["bigqueryUri"]);
  if (s != null && l(t, ["bigqueryDestination", "outputUri"], s), i(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (i(e, ["inlinedResponses"]) !== void 0) throw new Error("inlinedResponses parameter is not supported in Vertex AI.");
  if (i(e, ["inlinedEmbedContentResponses"]) !== void 0) throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");
  return t;
}
function ls(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = i(e, ["metadata", "displayName"]);
  o != null && l(t, ["displayName"], o);
  const s = i(e, ["metadata", "state"]);
  s != null && l(t, ["state"], Cf(s));
  const r = i(e, ["metadata", "createTime"]);
  r != null && l(t, ["createTime"], r);
  const a = i(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = i(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = i(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = i(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], Cy(wf(d))), t;
}
function jr(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = i(e, ["displayName"]);
  o != null && l(t, ["displayName"], o);
  const s = i(e, ["state"]);
  s != null && l(t, ["state"], Cf(s));
  const r = i(e, ["error"]);
  r != null && l(t, ["error"], r);
  const a = i(e, ["createTime"]);
  a != null && l(t, ["createTime"], a);
  const u = i(e, ["startTime"]);
  u != null && l(t, ["startTime"], u);
  const c = i(e, ["endTime"]);
  c != null && l(t, ["endTime"], c);
  const d = i(e, ["updateTime"]);
  d != null && l(t, ["updateTime"], d);
  const p = i(e, ["model"]);
  p != null && l(t, ["model"], p);
  const f = i(e, ["inputConfig"]);
  f != null && l(t, ["src"], by(f));
  const h = i(e, ["outputConfig"]);
  h != null && l(t, ["dest"], Ay(wf(h)));
  const m = i(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function by(e) {
  const t = {}, n = i(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const o = i(e, ["gcsSource", "uris"]);
  o != null && l(t, ["gcsUri"], o);
  const s = i(e, ["bigquerySource", "inputUri"]);
  return s != null && l(t, ["bigqueryUri"], s), t;
}
function Ry(e, t) {
  const n = {};
  if (i(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (i(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (i(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = i(t, ["fileName"]);
  o != null && l(n, ["fileName"], o);
  const s = i(t, ["inlinedRequests"]);
  if (s != null) {
    let r = s;
    Array.isArray(r) && (r = r.map((a) => o_(e, a))), l(n, ["requests", "requests"], r);
  }
  return n;
}
function Py(e) {
  const t = {}, n = i(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const o = i(e, ["gcsUri"]);
  o != null && l(t, ["gcsSource", "uris"], o);
  const s = i(e, ["bigqueryUri"]);
  if (s != null && l(t, ["bigquerySource", "inputUri"], s), i(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (i(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function xy(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function My(e, t) {
  const n = {}, o = i(t, ["name"]);
  return o != null && l(n, ["_url", "name"], _n(e, o)), n;
}
function Ny(e, t) {
  const n = {}, o = i(t, ["name"]);
  return o != null && l(n, ["_url", "name"], _n(e, o)), n;
}
function ky(e) {
  const t = {}, n = i(e, ["content"]);
  n != null && l(t, ["content"], n);
  const o = i(e, ["citationMetadata"]);
  o != null && l(t, ["citationMetadata"], Dy(o));
  const s = i(e, ["tokenCount"]);
  s != null && l(t, ["tokenCount"], s);
  const r = i(e, ["finishReason"]);
  r != null && l(t, ["finishReason"], r);
  const a = i(e, ["groundingMetadata"]);
  a != null && l(t, ["groundingMetadata"], a);
  const u = i(e, ["avgLogprobs"]);
  u != null && l(t, ["avgLogprobs"], u);
  const c = i(e, ["index"]);
  c != null && l(t, ["index"], c);
  const d = i(e, ["logprobsResult"]);
  d != null && l(t, ["logprobsResult"], d);
  const p = i(e, ["safetyRatings"]);
  if (p != null) {
    let h = p;
    Array.isArray(h) && (h = h.map((m) => m)), l(t, ["safetyRatings"], h);
  }
  const f = i(e, ["urlContextMetadata"]);
  return f != null && l(t, ["urlContextMetadata"], f), t;
}
function Dy(e) {
  const t = {}, n = i(e, ["citationSources"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["citations"], o);
  }
  return t;
}
function Af(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((r) => d_(r))), l(t, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Uy(e, t) {
  const n = {}, o = i(e, ["displayName"]);
  if (t !== void 0 && o != null && l(t, ["batch", "displayName"], o), i(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const s = i(e, ["webhookConfig"]);
  return t !== void 0 && s != null && l(t, ["batch", "webhookConfig"], s), n;
}
function Ly(e, t) {
  const n = {}, o = i(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const s = i(e, ["dest"]);
  if (t !== void 0 && s != null && l(t, ["outputConfig"], Iy(Ty(s))), i(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Bu(e, t) {
  const n = {}, o = i(t, ["model"]);
  o != null && l(n, ["_url", "model"], Y(e, o));
  const s = i(t, ["src"]);
  s != null && l(n, ["batch", "inputConfig"], Ry(e, Ef(e, s)));
  const r = i(t, ["config"]);
  return r != null && Uy(r, n), n;
}
function $y(e, t) {
  const n = {}, o = i(t, ["model"]);
  o != null && l(n, ["model"], Y(e, o));
  const s = i(t, ["src"]);
  s != null && l(n, ["inputConfig"], Py(Ef(e, s)));
  const r = i(t, ["config"]);
  return r != null && Ly(r, n), n;
}
function Fy(e, t) {
  const n = {}, o = i(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["batch", "displayName"], o), n;
}
function By(e, t) {
  const n = {}, o = i(t, ["model"]);
  o != null && l(n, ["_url", "model"], Y(e, o));
  const s = i(t, ["src"]);
  s != null && l(n, ["batch", "inputConfig"], Wy(e, s));
  const r = i(t, ["config"]);
  return r != null && Fy(r, n), n;
}
function qy(e, t) {
  const n = {}, o = i(t, ["name"]);
  return o != null && l(n, ["_url", "name"], _n(e, o)), n;
}
function Gy(e, t) {
  const n = {}, o = i(t, ["name"]);
  return o != null && l(n, ["_url", "name"], _n(e, o)), n;
}
function Oy(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = i(e, ["done"]);
  s != null && l(t, ["done"], s);
  const r = i(e, ["error"]);
  return r != null && l(t, ["error"], r), t;
}
function Hy(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = i(e, ["done"]);
  s != null && l(t, ["done"], s);
  const r = i(e, ["error"]);
  return r != null && l(t, ["error"], r), t;
}
function Vy(e, t) {
  const n = {}, o = i(t, ["contents"]);
  if (o != null) {
    let r = Wi(e, o);
    Array.isArray(r) && (r = r.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], r);
  }
  const s = i(t, ["config"]);
  return s != null && (l(n, ["_self"], Jy(s, n)), Lg(n, { "requests[].*": "requests[].request.*" })), n;
}
function Jy(e, t) {
  const n = {}, o = i(e, ["taskType"]);
  t !== void 0 && o != null && l(t, ["requests[]", "taskType"], o);
  const s = i(e, ["title"]);
  t !== void 0 && s != null && l(t, ["requests[]", "title"], s);
  const r = i(e, ["outputDimensionality"]);
  if (t !== void 0 && r != null && l(t, ["requests[]", "outputDimensionality"], r), i(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (i(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (i(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (i(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return n;
}
function Wy(e, t) {
  const n = {}, o = i(t, ["fileName"]);
  o != null && l(n, ["file_name"], o);
  const s = i(t, ["inlinedRequests"]);
  return s != null && l(n, ["requests"], Vy(e, s)), n;
}
function Ky(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = i(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function zy(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = i(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = i(e, ["name"]);
  if (s != null && l(t, ["name"], s), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Yy(e) {
  const t = {}, n = i(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = i(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Xy(e, t, n) {
  const o = {}, s = i(t, ["systemInstruction"]);
  n !== void 0 && s != null && l(n, ["systemInstruction"], Af(de(s)));
  const r = i(t, ["temperature"]);
  r != null && l(o, ["temperature"], r);
  const a = i(t, ["topP"]);
  a != null && l(o, ["topP"], a);
  const u = i(t, ["topK"]);
  u != null && l(o, ["topK"], u);
  const c = i(t, ["candidateCount"]);
  c != null && l(o, ["candidateCount"], c);
  const d = i(t, ["maxOutputTokens"]);
  d != null && l(o, ["maxOutputTokens"], d);
  const p = i(t, ["stopSequences"]);
  p != null && l(o, ["stopSequences"], p);
  const f = i(t, ["responseLogprobs"]);
  f != null && l(o, ["responseLogprobs"], f);
  const h = i(t, ["logprobs"]);
  h != null && l(o, ["logprobs"], h);
  const m = i(t, ["presencePenalty"]);
  m != null && l(o, ["presencePenalty"], m);
  const g = i(t, ["frequencyPenalty"]);
  g != null && l(o, ["frequencyPenalty"], g);
  const _ = i(t, ["seed"]);
  _ != null && l(o, ["seed"], _);
  const v = i(t, ["responseMimeType"]);
  v != null && l(o, ["responseMimeType"], v);
  const w = i(t, ["responseSchema"]);
  w != null && l(o, ["responseSchema"], Ki(w));
  const A = i(t, ["responseJsonSchema"]);
  if (A != null && l(o, ["responseJsonSchema"], A), i(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (i(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const b = i(t, ["safetySettings"]);
  if (n !== void 0 && b != null) {
    let Q = b;
    Array.isArray(Q) && (Q = Q.map((X) => f_(X))), l(n, ["safetySettings"], Q);
  }
  const x = i(t, ["tools"]);
  if (n !== void 0 && x != null) {
    let Q = yn(x);
    Array.isArray(Q) && (Q = Q.map((X) => h_(gn(X)))), l(n, ["tools"], Q);
  }
  const M = i(t, ["toolConfig"]);
  if (n !== void 0 && M != null && l(n, ["toolConfig"], p_(M)), i(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const C = i(t, ["cachedContent"]);
  n !== void 0 && C != null && l(n, ["cachedContent"], mt(e, C));
  const L = i(t, ["responseModalities"]);
  L != null && l(o, ["responseModalities"], L);
  const P = i(t, ["mediaResolution"]);
  P != null && l(o, ["mediaResolution"], P);
  const N = i(t, ["speechConfig"]);
  if (N != null && l(o, ["speechConfig"], zi(N)), i(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = i(t, ["thinkingConfig"]);
  H != null && l(o, ["thinkingConfig"], H);
  const z = i(t, ["imageConfig"]);
  z != null && l(o, ["imageConfig"], n_(z));
  const j = i(t, ["enableEnhancedCivicAnswers"]);
  if (j != null && l(o, ["enableEnhancedCivicAnswers"], j), i(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const ee = i(t, ["serviceTier"]);
  return n !== void 0 && ee != null && l(n, ["serviceTier"], ee), o;
}
function Qy(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((p) => ky(p))), l(t, ["candidates"], d);
  }
  const s = i(e, ["modelVersion"]);
  s != null && l(t, ["modelVersion"], s);
  const r = i(e, ["promptFeedback"]);
  r != null && l(t, ["promptFeedback"], r);
  const a = i(e, ["responseId"]);
  a != null && l(t, ["responseId"], a);
  const u = i(e, ["usageMetadata"]);
  u != null && l(t, ["usageMetadata"], u);
  const c = i(e, ["modelStatus"]);
  return c != null && l(t, ["modelStatus"], c), t;
}
function Zy(e, t) {
  const n = {}, o = i(t, ["name"]);
  return o != null && l(n, ["_url", "name"], _n(e, o)), n;
}
function jy(e, t) {
  const n = {}, o = i(t, ["name"]);
  return o != null && l(n, ["_url", "name"], _n(e, o)), n;
}
function e_(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], wy(n));
  const o = i(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function t_(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = i(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function n_(e) {
  const t = {}, n = i(e, ["aspectRatio"]);
  n != null && l(t, ["aspectRatio"], n);
  const o = i(e, ["imageSize"]);
  if (o != null && l(t, ["imageSize"], o), i(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (i(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (i(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (i(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (i(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return t;
}
function o_(e, t) {
  const n = {}, o = i(t, ["model"]);
  o != null && l(n, ["request", "model"], Y(e, o));
  const s = i(t, ["contents"]);
  if (s != null) {
    let u = Ae(s);
    Array.isArray(u) && (u = u.map((c) => Af(c))), l(n, ["request", "contents"], u);
  }
  const r = i(t, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const a = i(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], Xy(e, a, i(n, ["request"], {}))), n;
}
function s_(e) {
  const t = {}, n = i(e, ["response"]);
  n != null && l(t, ["response"], Qy(n));
  const o = i(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = i(e, ["error"]);
  return s != null && l(t, ["error"], s), t;
}
function r_(e, t) {
  const n = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  if (t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), i(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function i_(e, t) {
  const n = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  t !== void 0 && s != null && l(t, ["_query", "pageToken"], s);
  const r = i(e, ["filter"]);
  return t !== void 0 && r != null && l(t, ["_query", "filter"], r), n;
}
function a_(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && r_(n, t), t;
}
function l_(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && i_(n, t), t;
}
function u_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = i(e, ["operations"]);
  if (s != null) {
    let r = s;
    Array.isArray(r) && (r = r.map((a) => ls(a))), l(t, ["batchJobs"], r);
  }
  return t;
}
function c_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = i(e, ["batchPredictionJobs"]);
  if (s != null) {
    let r = s;
    Array.isArray(r) && (r = r.map((a) => jr(a))), l(t, ["batchJobs"], r);
  }
  return t;
}
function d_(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = i(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = i(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const r = i(e, ["fileData"]);
  r != null && l(t, ["fileData"], Ky(r));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], zy(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], xy(c));
  const d = i(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = i(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = i(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = i(e, ["videoMetadata"]);
  h != null && l(t, ["videoMetadata"], h);
  const m = i(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = i(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = i(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function f_(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = i(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function p_(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = i(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], Yy(o));
  const s = i(e, ["includeServerSideToolInvocations"]);
  return s != null && l(t, ["includeServerSideToolInvocations"], s), t;
}
function h_(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = i(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = i(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], t_(s));
  const r = i(e, ["googleMaps"]);
  r != null && l(t, ["googleMaps"], e_(r));
  const a = i(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["functionDeclarations"], f);
  }
  const c = i(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = i(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const p = i(e, ["mcpServers"]);
  if (p != null) {
    let f = p;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["mcpServers"], f);
  }
  return t;
}
var pt;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(pt || (pt = {}));
var Ht = class {
  constructor(e, t, n, o) {
    this.pageInternal = [], this.paramsInternal = {}, this.requestInternal = t, this.init(e, n, o);
  }
  init(e, t, n) {
    var o, s;
    this.nameInternal = e, this.pageInternal = t[this.nameInternal] || [], this.sdkHttpResponseInternal = t?.sdkHttpResponse, this.idxInternal = 0;
    let r = { config: {} };
    !n || Object.keys(n).length === 0 ? r = { config: {} } : typeof n == "object" ? r = Object.assign({}, n) : r = n, r.config && (r.config.pageToken = t.nextPageToken), this.paramsInternal = r, this.pageInternalSize = (s = (o = r.config) === null || o === void 0 ? void 0 : o.pageSize) !== null && s !== void 0 ? s : this.pageInternal.length;
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
}, m_ = class extends ht {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ht(pt.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Bu(this.apiClient, e), n = t._url, o = k("{model}:batchGenerateContent", n), s = t.batch.inputConfig.requests, r = s.requests, a = [];
    for (const u of r) {
      const c = Object.assign({}, u);
      if (c.systemInstruction) {
        const d = c.systemInstruction;
        delete c.systemInstruction;
        const p = c.request;
        p.systemInstruction = d, c.request = p;
      }
      a.push(c);
    }
    return s.requests = a, delete t.config, delete t._url, delete t._query, {
      path: o,
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
    const n = t ? Object.assign({}, t) : {}, o = Date.now().toString();
    if (n.displayName || (n.displayName = `genaiBatchJob_${o}`), n.dest === void 0) {
      const s = this.getGcsUri(e), r = this.getBigqueryUri(e);
      if (s) s.endsWith(".jsonl") ? n.dest = `${s.slice(0, -6)}/dest` : n.dest = `${s}_dest_${o}`;
      else if (r) n.dest = `${r}_dest_${o}`;
      else throw new Error("Unsupported source for Vertex AI: No GCS or BigQuery URI found.");
    }
    return n;
  }
  async createInternal(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $y(this.apiClient, e);
      return a = k("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), r.then((d) => jr(d));
    } else {
      const c = Bu(this.apiClient, e);
      return a = k("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), r.then((d) => ls(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = By(this.apiClient, e);
      return s = k("{model}:asyncBatchEmbedContent", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => ls(u));
    }
  }
  async get(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = jy(this.apiClient, e);
      return a = k("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), r.then((d) => jr(d));
    } else {
      const c = Zy(this.apiClient, e);
      return a = k("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), r.then((d) => ls(d));
    }
  }
  async cancel(e) {
    var t, n, o, s;
    let r = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = Ny(this.apiClient, e);
      r = k("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: r,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = My(this.apiClient, e);
      r = k("batches/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: r,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = l_(e);
      return a = k("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = c_(d), f = new Uu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = a_(e);
      return a = k("batches", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = u_(d), f = new Uu();
        return Object.assign(f, p), f;
      });
    }
  }
  async delete(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Gy(this.apiClient, e);
      return a = k("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => Hy(d));
    } else {
      const c = qy(this.apiClient, e);
      return a = k("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => Oy(d));
    }
  }
};
function g_(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function y_(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function qu(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((r) => q_(r))), l(t, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Gu(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((r) => G_(r))), l(t, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function __(e, t) {
  const n = {}, o = i(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = i(e, ["expireTime"]);
  t !== void 0 && s != null && l(t, ["expireTime"], s);
  const r = i(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const a = i(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let p = Ae(a);
    Array.isArray(p) && (p = p.map((f) => qu(f))), l(t, ["contents"], p);
  }
  const u = i(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], qu(de(u)));
  const c = i(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((f) => V_(f))), l(t, ["tools"], p);
  }
  const d = i(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], O_(d)), i(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function v_(e, t) {
  const n = {}, o = i(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = i(e, ["expireTime"]);
  t !== void 0 && s != null && l(t, ["expireTime"], s);
  const r = i(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const a = i(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = Ae(a);
    Array.isArray(f) && (f = f.map((h) => Gu(h))), l(t, ["contents"], f);
  }
  const u = i(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Gu(de(u)));
  const c = i(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((h) => J_(h))), l(t, ["tools"], f);
  }
  const d = i(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], H_(d));
  const p = i(e, ["kmsKeyName"]);
  return t !== void 0 && p != null && l(t, ["encryption_spec", "kmsKeyName"], p), n;
}
function S_(e, t) {
  const n = {}, o = i(t, ["model"]);
  o != null && l(n, ["model"], pf(e, o));
  const s = i(t, ["config"]);
  return s != null && __(s, n), n;
}
function T_(e, t) {
  const n = {}, o = i(t, ["model"]);
  o != null && l(n, ["model"], pf(e, o));
  const s = i(t, ["config"]);
  return s != null && v_(s, n), n;
}
function E_(e, t) {
  const n = {}, o = i(t, ["name"]);
  return o != null && l(n, ["_url", "name"], mt(e, o)), n;
}
function w_(e, t) {
  const n = {}, o = i(t, ["name"]);
  return o != null && l(n, ["_url", "name"], mt(e, o)), n;
}
function C_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function A_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function I_(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = i(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function b_(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = i(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = i(e, ["name"]);
  if (s != null && l(t, ["name"], s), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function R_(e) {
  const t = {}, n = i(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = i(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function P_(e) {
  const t = {}, n = i(e, ["description"]);
  n != null && l(t, ["description"], n);
  const o = i(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = i(e, ["parameters"]);
  s != null && l(t, ["parameters"], s);
  const r = i(e, ["parametersJsonSchema"]);
  r != null && l(t, ["parametersJsonSchema"], r);
  const a = i(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = i(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), i(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function x_(e, t) {
  const n = {}, o = i(t, ["name"]);
  return o != null && l(n, ["_url", "name"], mt(e, o)), n;
}
function M_(e, t) {
  const n = {}, o = i(t, ["name"]);
  return o != null && l(n, ["_url", "name"], mt(e, o)), n;
}
function N_(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], g_(n));
  const o = i(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function k_(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = i(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function D_(e, t) {
  const n = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function U_(e, t) {
  const n = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function L_(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && D_(n, t), t;
}
function $_(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && U_(n, t), t;
}
function F_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = i(e, ["cachedContents"]);
  if (s != null) {
    let r = s;
    Array.isArray(r) && (r = r.map((a) => a)), l(t, ["cachedContents"], r);
  }
  return t;
}
function B_(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = i(e, ["cachedContents"]);
  if (s != null) {
    let r = s;
    Array.isArray(r) && (r = r.map((a) => a)), l(t, ["cachedContents"], r);
  }
  return t;
}
function q_(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = i(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = i(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const r = i(e, ["fileData"]);
  r != null && l(t, ["fileData"], I_(r));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], b_(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], y_(c));
  const d = i(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = i(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = i(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = i(e, ["videoMetadata"]);
  h != null && l(t, ["videoMetadata"], h);
  const m = i(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = i(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = i(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function G_(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = i(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = i(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const r = i(e, ["fileData"]);
  r != null && l(t, ["fileData"], r);
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], a);
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = i(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = i(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = i(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = i(e, ["videoMetadata"]);
  if (h != null && l(t, ["videoMetadata"], h), i(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (i(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (i(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function O_(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = i(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], R_(o));
  const s = i(e, ["includeServerSideToolInvocations"]);
  return s != null && l(t, ["includeServerSideToolInvocations"], s), t;
}
function H_(e) {
  const t = {}, n = i(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = i(e, ["functionCallingConfig"]);
  if (o != null && l(t, ["functionCallingConfig"], o), i(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function V_(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = i(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = i(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], k_(s));
  const r = i(e, ["googleMaps"]);
  r != null && l(t, ["googleMaps"], N_(r));
  const a = i(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["functionDeclarations"], f);
  }
  const c = i(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = i(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const p = i(e, ["mcpServers"]);
  if (p != null) {
    let f = p;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["mcpServers"], f);
  }
  return t;
}
function J_(e) {
  const t = {}, n = i(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const o = i(e, ["computerUse"]);
  if (o != null && l(t, ["computerUse"], o), i(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const s = i(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], s);
  const r = i(e, ["googleMaps"]);
  r != null && l(t, ["googleMaps"], r);
  const a = i(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = i(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = i(e, ["functionDeclarations"]);
  if (c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((m) => P_(m))), l(t, ["functionDeclarations"], h);
  }
  const d = i(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const p = i(e, ["parallelAiSearch"]);
  p != null && l(t, ["parallelAiSearch"], p);
  const f = i(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function W_(e, t) {
  const n = {}, o = i(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = i(e, ["expireTime"]);
  return t !== void 0 && s != null && l(t, ["expireTime"], s), n;
}
function K_(e, t) {
  const n = {}, o = i(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const s = i(e, ["expireTime"]);
  return t !== void 0 && s != null && l(t, ["expireTime"], s), n;
}
function z_(e, t) {
  const n = {}, o = i(t, ["name"]);
  o != null && l(n, ["_url", "name"], mt(e, o));
  const s = i(t, ["config"]);
  return s != null && W_(s, n), n;
}
function Y_(e, t) {
  const n = {}, o = i(t, ["name"]);
  o != null && l(n, ["_url", "name"], mt(e, o));
  const s = i(t, ["config"]);
  return s != null && K_(s, n), n;
}
var X_ = class extends ht {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ht(pt.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = T_(this.apiClient, e);
      return a = k("cachedContents", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), r.then((d) => d);
    } else {
      const c = S_(this.apiClient, e);
      return a = k("cachedContents", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), r.then((d) => d);
    }
  }
  async get(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = M_(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), r.then((d) => d);
    } else {
      const c = x_(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), r.then((d) => d);
    }
  }
  async delete(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = w_(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = A_(d), f = new ku();
        return Object.assign(f, p), f;
      });
    } else {
      const c = E_(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = C_(d), f = new ku();
        return Object.assign(f, p), f;
      });
    }
  }
  async update(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Y_(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), r.then((d) => d);
    } else {
      const c = z_(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), r.then((d) => d);
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $_(e);
      return a = k("cachedContents", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = B_(d), f = new Du();
        return Object.assign(f, p), f;
      });
    } else {
      const c = L_(e);
      return a = k("cachedContents", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = F_(d), f = new Du();
        return Object.assign(f, p), f;
      });
    }
  }
};
function At(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, o = Object.getOwnPropertySymbols(e); s < o.length; s++) t.indexOf(o[s]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[s]) && (n[o[s]] = e[o[s]]);
  return n;
}
function Ou(e) {
  var t = typeof Symbol == "function" && Symbol.iterator, n = t && e[t], o = 0;
  if (n) return n.call(e);
  if (e && typeof e.length == "number") return { next: function() {
    return e && o >= e.length && (e = void 0), {
      value: e && e[o++],
      done: !e
    };
  } };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function J(e) {
  return this instanceof J ? (this.v = e, this) : new J(e);
}
function Ye(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var o = n.apply(e, t || []), s, r = [];
  return s = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), u("next"), u("throw"), u("return", a), s[Symbol.asyncIterator] = function() {
    return this;
  }, s;
  function a(m) {
    return function(g) {
      return Promise.resolve(g).then(m, f);
    };
  }
  function u(m, g) {
    o[m] && (s[m] = function(_) {
      return new Promise(function(v, w) {
        r.push([
          m,
          _,
          v,
          w
        ]) > 1 || c(m, _);
      });
    }, g && (s[m] = g(s[m])));
  }
  function c(m, g) {
    try {
      d(o[m](g));
    } catch (_) {
      h(r[0][3], _);
    }
  }
  function d(m) {
    m.value instanceof J ? Promise.resolve(m.value.v).then(p, f) : h(r[0][2], m);
  }
  function p(m) {
    c("next", m);
  }
  function f(m) {
    c("throw", m);
  }
  function h(m, g) {
    m(g), r.shift(), r.length && c(r[0][0], r[0][1]);
  }
}
function Xe(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Ou == "function" ? Ou(e) : e[Symbol.iterator](), n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function o(r) {
    n[r] = e[r] && function(a) {
      return new Promise(function(u, c) {
        a = e[r](a), s(u, c, a.done, a.value);
      });
    };
  }
  function s(r, a, u, c) {
    Promise.resolve(c).then(function(d) {
      r({
        value: d,
        done: u
      });
    }, a);
  }
}
function Q_(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : If(n);
}
function If(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function Z_(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Hu(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let o = 0;
  for (; o < n; ) if (e[o].role === "user")
    t.push(e[o]), o++;
  else {
    const s = [];
    let r = !0;
    for (; o < n && e[o].role === "model"; )
      s.push(e[o]), r && !If(e[o]) && (r = !1), o++;
    r ? t.push(...s) : t.pop();
  }
  return t;
}
var j_ = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new ev(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, ev = class {
  constructor(e, t, n, o = {}, s = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = o, this.history = s, this.sendPromise = Promise.resolve(), Z_(s);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = de(e.message), o = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var s, r, a;
      const u = await o, c = (r = (s = u.candidates) === null || s === void 0 ? void 0 : s[0]) === null || r === void 0 ? void 0 : r.content, d = u.automaticFunctionCallingHistory, p = this.getHistory(!0).length;
      let f = [];
      d != null && (f = (a = d.slice(p)) !== null && a !== void 0 ? a : []);
      const h = c ? [c] : [];
      this.recordHistory(n, h, f);
    })(), await this.sendPromise.catch(() => {
      this.sendPromise = Promise.resolve();
    }), o;
  }
  async sendMessageStream(e) {
    var t;
    await this.sendPromise;
    const n = de(e.message), o = this.modelsModule.generateContentStream({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    this.sendPromise = o.then(() => {
    }).catch(() => {
    });
    const s = await o;
    return this.processStreamResponse(s, n);
  }
  getHistory(e = !1) {
    const t = e ? Hu(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return Ye(this, arguments, function* () {
      var o, s, r, a, u, c;
      const d = [];
      try {
        for (var p = !0, f = Xe(e), h; h = yield J(f.next()), o = h.done, !o; p = !0) {
          a = h.value, p = !1;
          const m = a;
          if (Q_(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield J(m);
        }
      } catch (m) {
        s = { error: m };
      } finally {
        try {
          !p && !o && (r = f.return) && (yield J(r.call(f)));
        } finally {
          if (s) throw s.error;
        }
      }
      this.recordHistory(t, d);
    });
  }
  recordHistory(e, t, n) {
    let o = [];
    t.length > 0 && t.every((s) => s.role !== void 0) ? o = t : o.push({
      role: "model",
      parts: []
    }), n && n.length > 0 ? this.history.push(...Hu(n)) : this.history.push(e), this.history.push(...o);
  }
}, bf = class Rf extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Rf.prototype);
  }
};
function tv(e) {
  const t = {}, n = i(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function nv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function ov(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "file"], vf(n)), t;
}
function sv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function rv(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "file"], vf(n)), t;
}
function iv(e) {
  const t = {}, n = i(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function av(e, t) {
  const n = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function lv(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && av(n, t), t;
}
function uv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = i(e, ["files"]);
  if (s != null) {
    let r = s;
    Array.isArray(r) && (r = r.map((a) => a)), l(t, ["files"], r);
  }
  return t;
}
function cv(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["files"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((r) => r)), l(t, ["files"], s);
  }
  return t;
}
var dv = class extends ht {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ht(pt.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = lv(e);
      return s = k("files", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = uv(u), d = new iy();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = tv(e);
      return s = k("upload/v1beta/files", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = nv(u), d = new ay();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = rv(e);
      return s = k("files/{file}", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = ov(e);
      return s = k("files/{file}", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = sv(u), d = new ly();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = iv(e);
      return s = k("files:register", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = cv(u), d = new uy();
        return Object.assign(d, c), d;
      });
    }
  }
};
function Vu(e) {
  const t = {};
  if (i(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function fv(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function us(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function pv(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((r) => xv(r))), l(t, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function hv(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((r) => Mv(r))), l(t, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function mv(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = i(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function gv(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = i(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = i(e, ["name"]);
  if (s != null && l(t, ["name"], s), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function yv(e) {
  const t = {}, n = i(e, ["description"]);
  n != null && l(t, ["description"], n);
  const o = i(e, ["name"]);
  o != null && l(t, ["name"], o);
  const s = i(e, ["parameters"]);
  s != null && l(t, ["parameters"], s);
  const r = i(e, ["parametersJsonSchema"]);
  r != null && l(t, ["parametersJsonSchema"], r);
  const a = i(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = i(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), i(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function _v(e) {
  const t = {}, n = i(e, ["modelSelectionConfig"]);
  n != null && l(t, ["modelConfig"], n);
  const o = i(e, ["responseJsonSchema"]);
  o != null && l(t, ["responseJsonSchema"], o);
  const s = i(e, ["audioTimestamp"]);
  s != null && l(t, ["audioTimestamp"], s);
  const r = i(e, ["candidateCount"]);
  r != null && l(t, ["candidateCount"], r);
  const a = i(e, ["enableAffectiveDialog"]);
  a != null && l(t, ["enableAffectiveDialog"], a);
  const u = i(e, ["frequencyPenalty"]);
  u != null && l(t, ["frequencyPenalty"], u);
  const c = i(e, ["logprobs"]);
  c != null && l(t, ["logprobs"], c);
  const d = i(e, ["maxOutputTokens"]);
  d != null && l(t, ["maxOutputTokens"], d);
  const p = i(e, ["mediaResolution"]);
  p != null && l(t, ["mediaResolution"], p);
  const f = i(e, ["presencePenalty"]);
  f != null && l(t, ["presencePenalty"], f);
  const h = i(e, ["responseLogprobs"]);
  h != null && l(t, ["responseLogprobs"], h);
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
  const A = i(e, ["speechConfig"]);
  A != null && l(t, ["speechConfig"], A);
  const b = i(e, ["stopSequences"]);
  b != null && l(t, ["stopSequences"], b);
  const x = i(e, ["temperature"]);
  x != null && l(t, ["temperature"], x);
  const M = i(e, ["thinkingConfig"]);
  M != null && l(t, ["thinkingConfig"], M);
  const C = i(e, ["topK"]);
  C != null && l(t, ["topK"], C);
  const L = i(e, ["topP"]);
  if (L != null && l(t, ["topP"], L), i(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function vv(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], fv(n));
  const o = i(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Sv(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = i(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Tv(e, t) {
  const n = {}, o = i(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], o);
  const s = i(e, ["responseModalities"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], s);
  const r = i(e, ["temperature"]);
  t !== void 0 && r != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], r);
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
  const p = i(e, ["seed"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], p);
  const f = i(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Yi(f));
  const h = i(e, ["thinkingConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], h);
  const m = i(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = i(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], pv(de(g)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let P = yn(_);
    Array.isArray(P) && (P = P.map((N) => Dv(gn(N)))), l(t, ["setup", "tools"], P);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], kv(v));
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], Vu(w));
  const A = i(e, ["outputAudioTranscription"]);
  t !== void 0 && A != null && l(t, ["setup", "outputAudioTranscription"], Vu(A));
  const b = i(e, ["realtimeInputConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "realtimeInputConfig"], b);
  const x = i(e, ["contextWindowCompression"]);
  t !== void 0 && x != null && l(t, ["setup", "contextWindowCompression"], x);
  const M = i(e, ["proactivity"]);
  if (t !== void 0 && M != null && l(t, ["setup", "proactivity"], M), i(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const C = i(e, ["avatarConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "avatarConfig"], C);
  const L = i(e, ["safetySettings"]);
  if (t !== void 0 && L != null) {
    let P = L;
    Array.isArray(P) && (P = P.map((N) => Nv(N))), l(t, ["setup", "safetySettings"], P);
  }
  return n;
}
function Ev(e, t) {
  const n = {}, o = i(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], _v(o));
  const s = i(e, ["responseModalities"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], s);
  const r = i(e, ["temperature"]);
  t !== void 0 && r != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], r);
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
  const p = i(e, ["seed"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], p);
  const f = i(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Yi(f));
  const h = i(e, ["thinkingConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], h);
  const m = i(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = i(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], hv(de(g)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let N = yn(_);
    Array.isArray(N) && (N = N.map((H) => Uv(gn(H)))), l(t, ["setup", "tools"], N);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], v);
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], w);
  const A = i(e, ["outputAudioTranscription"]);
  t !== void 0 && A != null && l(t, ["setup", "outputAudioTranscription"], A);
  const b = i(e, ["realtimeInputConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "realtimeInputConfig"], b);
  const x = i(e, ["contextWindowCompression"]);
  t !== void 0 && x != null && l(t, ["setup", "contextWindowCompression"], x);
  const M = i(e, ["proactivity"]);
  t !== void 0 && M != null && l(t, ["setup", "proactivity"], M);
  const C = i(e, ["explicitVadSignal"]);
  t !== void 0 && C != null && l(t, ["setup", "explicitVadSignal"], C);
  const L = i(e, ["avatarConfig"]);
  t !== void 0 && L != null && l(t, ["setup", "avatarConfig"], L);
  const P = i(e, ["safetySettings"]);
  if (t !== void 0 && P != null) {
    let N = P;
    Array.isArray(N) && (N = N.map((H) => H)), l(t, ["setup", "safetySettings"], N);
  }
  return n;
}
function wv(e, t) {
  const n = {}, o = i(t, ["model"]);
  o != null && l(n, ["setup", "model"], Y(e, o));
  const s = i(t, ["config"]);
  return s != null && l(n, ["config"], Tv(s, n)), n;
}
function Cv(e, t) {
  const n = {}, o = i(t, ["model"]);
  o != null && l(n, ["setup", "model"], Y(e, o));
  const s = i(t, ["config"]);
  return s != null && l(n, ["config"], Ev(s, n)), n;
}
function Av(e) {
  const t = {}, n = i(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function Iv(e) {
  const t = {}, n = i(e, ["weightedPrompts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((s) => s)), l(t, ["weightedPrompts"], o);
  }
  return t;
}
function bv(e) {
  const t = {}, n = i(e, ["media"]);
  if (n != null) {
    let d = hf(n);
    Array.isArray(d) && (d = d.map((p) => us(p))), l(t, ["mediaChunks"], d);
  }
  const o = i(e, ["audio"]);
  o != null && l(t, ["audio"], us(gf(o)));
  const s = i(e, ["audioStreamEnd"]);
  s != null && l(t, ["audioStreamEnd"], s);
  const r = i(e, ["video"]);
  r != null && l(t, ["video"], us(mf(r)));
  const a = i(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = i(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = i(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function Rv(e) {
  const t = {}, n = i(e, ["media"]);
  if (n != null) {
    let d = hf(n);
    Array.isArray(d) && (d = d.map((p) => p)), l(t, ["mediaChunks"], d);
  }
  const o = i(e, ["audio"]);
  o != null && l(t, ["audio"], gf(o));
  const s = i(e, ["audioStreamEnd"]);
  s != null && l(t, ["audioStreamEnd"], s);
  const r = i(e, ["video"]);
  r != null && l(t, ["video"], mf(r));
  const a = i(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = i(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = i(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function Pv(e) {
  const t = {}, n = i(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const o = i(e, ["serverContent"]);
  o != null && l(t, ["serverContent"], o);
  const s = i(e, ["toolCall"]);
  s != null && l(t, ["toolCall"], s);
  const r = i(e, ["toolCallCancellation"]);
  r != null && l(t, ["toolCallCancellation"], r);
  const a = i(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], Lv(a));
  const u = i(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = i(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = i(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const p = i(e, ["voiceActivity"]);
  return p != null && l(t, ["voiceActivity"], $v(p)), t;
}
function xv(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = i(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = i(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const r = i(e, ["fileData"]);
  r != null && l(t, ["fileData"], mv(r));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], gv(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], us(c));
  const d = i(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = i(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = i(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = i(e, ["videoMetadata"]);
  h != null && l(t, ["videoMetadata"], h);
  const m = i(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = i(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = i(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function Mv(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = i(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = i(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const r = i(e, ["fileData"]);
  r != null && l(t, ["fileData"], r);
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], a);
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = i(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = i(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = i(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = i(e, ["videoMetadata"]);
  if (h != null && l(t, ["videoMetadata"], h), i(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (i(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (i(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function Nv(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = i(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function kv(e) {
  const t = {}, n = i(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), i(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function Dv(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = i(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = i(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], Sv(s));
  const r = i(e, ["googleMaps"]);
  r != null && l(t, ["googleMaps"], vv(r));
  const a = i(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["functionDeclarations"], f);
  }
  const c = i(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = i(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const p = i(e, ["mcpServers"]);
  if (p != null) {
    let f = p;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["mcpServers"], f);
  }
  return t;
}
function Uv(e) {
  const t = {}, n = i(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const o = i(e, ["computerUse"]);
  if (o != null && l(t, ["computerUse"], o), i(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const s = i(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], s);
  const r = i(e, ["googleMaps"]);
  r != null && l(t, ["googleMaps"], r);
  const a = i(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = i(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = i(e, ["functionDeclarations"]);
  if (c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((m) => yv(m))), l(t, ["functionDeclarations"], h);
  }
  const d = i(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const p = i(e, ["parallelAiSearch"]);
  p != null && l(t, ["parallelAiSearch"], p);
  const f = i(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function Lv(e) {
  const t = {}, n = i(e, ["promptTokenCount"]);
  n != null && l(t, ["promptTokenCount"], n);
  const o = i(e, ["cachedContentTokenCount"]);
  o != null && l(t, ["cachedContentTokenCount"], o);
  const s = i(e, ["candidatesTokenCount"]);
  s != null && l(t, ["responseTokenCount"], s);
  const r = i(e, ["toolUsePromptTokenCount"]);
  r != null && l(t, ["toolUsePromptTokenCount"], r);
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
  const p = i(e, ["candidatesTokensDetails"]);
  if (p != null) {
    let m = p;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["responseTokensDetails"], m);
  }
  const f = i(e, ["toolUsePromptTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["toolUsePromptTokensDetails"], m);
  }
  const h = i(e, ["trafficType"]);
  return h != null && l(t, ["trafficType"], h), t;
}
function $v(e) {
  const t = {}, n = i(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function Fv(e, t) {
  const n = {}, o = i(e, ["apiKey"]);
  if (o != null && l(n, ["apiKey"], o), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function Bv(e, t) {
  const n = {}, o = i(e, ["data"]);
  if (o != null && l(n, ["data"], o), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function qv(e, t) {
  const n = {}, o = i(e, ["content"]);
  o != null && l(n, ["content"], o);
  const s = i(e, ["citationMetadata"]);
  s != null && l(n, ["citationMetadata"], Gv(s));
  const r = i(e, ["tokenCount"]);
  r != null && l(n, ["tokenCount"], r);
  const a = i(e, ["finishReason"]);
  a != null && l(n, ["finishReason"], a);
  const u = i(e, ["groundingMetadata"]);
  u != null && l(n, ["groundingMetadata"], u);
  const c = i(e, ["avgLogprobs"]);
  c != null && l(n, ["avgLogprobs"], c);
  const d = i(e, ["index"]);
  d != null && l(n, ["index"], d);
  const p = i(e, ["logprobsResult"]);
  p != null && l(n, ["logprobsResult"], p);
  const f = i(e, ["safetyRatings"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(n, ["safetyRatings"], m);
  }
  const h = i(e, ["urlContextMetadata"]);
  return h != null && l(n, ["urlContextMetadata"], h), n;
}
function Gv(e, t) {
  const n = {}, o = i(e, ["citationSources"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((r) => r)), l(n, ["citations"], s);
  }
  return n;
}
function Ov(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["contents"]);
  if (r != null) {
    let a = Ae(r);
    Array.isArray(a) && (a = a.map((u) => vn(u))), l(o, ["contents"], a);
  }
  return o;
}
function Hv(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["tokensInfo"]);
  if (s != null) {
    let r = s;
    Array.isArray(r) && (r = r.map((a) => a)), l(n, ["tokensInfo"], r);
  }
  return n;
}
function Vv(e, t) {
  const n = {}, o = i(e, ["values"]);
  o != null && l(n, ["values"], o);
  const s = i(e, ["statistics"]);
  return s != null && l(n, ["statistics"], Jv(s)), n;
}
function Jv(e, t) {
  const n = {}, o = i(e, ["truncated"]);
  o != null && l(n, ["truncated"], o);
  const s = i(e, ["token_count"]);
  return s != null && l(n, ["tokenCount"], s), n;
}
function wo(e, t) {
  const n = {}, o = i(e, ["parts"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((a) => eT(a))), l(n, ["parts"], r);
  }
  const s = i(e, ["role"]);
  return s != null && l(n, ["role"], s), n;
}
function vn(e, t) {
  const n = {}, o = i(e, ["parts"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((a) => tT(a))), l(n, ["parts"], r);
  }
  const s = i(e, ["role"]);
  return s != null && l(n, ["role"], s), n;
}
function Wv(e, t) {
  const n = {}, o = i(e, ["controlType"]);
  o != null && l(n, ["controlType"], o);
  const s = i(e, ["enableControlImageComputation"]);
  return s != null && l(n, ["computeControl"], s), n;
}
function Kv(e, t) {
  const n = {};
  if (i(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (i(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (i(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function zv(e, t, n) {
  const o = {}, s = i(e, ["systemInstruction"]);
  t !== void 0 && s != null && l(t, ["systemInstruction"], vn(de(s)));
  const r = i(e, ["tools"]);
  if (t !== void 0 && r != null) {
    let u = r;
    Array.isArray(u) && (u = u.map((c) => Nf(c))), l(t, ["tools"], u);
  }
  const a = i(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], BS(a)), o;
}
function Yv(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["contents"]);
  if (r != null) {
    let u = Ae(r);
    Array.isArray(u) && (u = u.map((c) => wo(c))), l(o, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && Kv(a), o;
}
function Xv(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["contents"]);
  if (r != null) {
    let u = Ae(r);
    Array.isArray(u) && (u = u.map((c) => vn(c))), l(o, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && zv(a, o), o;
}
function Qv(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["totalTokens"]);
  s != null && l(n, ["totalTokens"], s);
  const r = i(e, ["cachedContentTokenCount"]);
  return r != null && l(n, ["cachedContentTokenCount"], r), n;
}
function Zv(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["totalTokens"]);
  return s != null && l(n, ["totalTokens"], s), n;
}
function jv(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  return s != null && l(o, ["_url", "name"], Y(e, s)), o;
}
function eS(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  return s != null && l(o, ["_url", "name"], Y(e, s)), o;
}
function tS(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function nS(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function oS(e, t, n) {
  const o = {}, s = i(e, ["outputGcsUri"]);
  t !== void 0 && s != null && l(t, ["parameters", "storageUri"], s);
  const r = i(e, ["negativePrompt"]);
  t !== void 0 && r != null && l(t, ["parameters", "negativePrompt"], r);
  const a = i(e, ["numberOfImages"]);
  t !== void 0 && a != null && l(t, ["parameters", "sampleCount"], a);
  const u = i(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = i(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = i(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const p = i(e, ["safetyFilterLevel"]);
  t !== void 0 && p != null && l(t, ["parameters", "safetySetting"], p);
  const f = i(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const h = i(e, ["includeSafetyAttributes"]);
  t !== void 0 && h != null && l(t, ["parameters", "includeSafetyAttributes"], h);
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
  const A = i(e, ["labels"]);
  t !== void 0 && A != null && l(t, ["labels"], A);
  const b = i(e, ["editMode"]);
  t !== void 0 && b != null && l(t, ["parameters", "editMode"], b);
  const x = i(e, ["baseSteps"]);
  return t !== void 0 && x != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], x), o;
}
function sS(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["prompt"]);
  r != null && l(o, ["instances[0]", "prompt"], r);
  const a = i(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => aT(d))), l(o, ["instances[0]", "referenceImages"], c);
  }
  const u = i(t, ["config"]);
  return u != null && oS(u, o), o;
}
function rS(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["predictions"]);
  if (s != null) {
    let r = s;
    Array.isArray(r) && (r = r.map((a) => Gs(a))), l(n, ["generatedImages"], r);
  }
  return n;
}
function iS(e, t, n) {
  const o = {}, s = i(e, ["taskType"]);
  t !== void 0 && s != null && l(t, ["requests[]", "taskType"], s);
  const r = i(e, ["title"]);
  t !== void 0 && r != null && l(t, ["requests[]", "title"], r);
  const a = i(e, ["outputDimensionality"]);
  if (t !== void 0 && a != null && l(t, ["requests[]", "outputDimensionality"], a), i(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (i(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (i(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (i(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return o;
}
function aS(e, t, n) {
  const o = {};
  let s = i(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "PREDICT") {
    const f = i(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "task_type"], f);
  } else if (s === "EMBED_CONTENT") {
    const f = i(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "taskType"], f);
  }
  let r = i(n, ["embeddingApiType"]);
  if (r === void 0 && (r = "PREDICT"), r === "PREDICT") {
    const f = i(e, ["title"]);
    t !== void 0 && f != null && l(t, ["instances[]", "title"], f);
  } else if (r === "EMBED_CONTENT") {
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
  let p = i(n, ["embeddingApiType"]);
  if (p === void 0 && (p = "PREDICT"), p === "EMBED_CONTENT") {
    const f = i(e, ["audioTrackExtraction"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "audioTrackExtraction"], f);
  }
  return o;
}
function lS(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["contents"]);
  if (r != null) {
    let d = Wi(e, r);
    Array.isArray(d) && (d = d.map((p) => p)), l(o, ["requests[]", "content"], d);
  }
  const a = i(t, ["content"]);
  a != null && wo(de(a));
  const u = i(t, ["config"]);
  u != null && iS(u, o);
  const c = i(t, ["model"]);
  return c !== void 0 && l(o, ["requests[]", "model"], Y(e, c)), o;
}
function uS(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  let r = i(n, ["embeddingApiType"]);
  if (r === void 0 && (r = "PREDICT"), r === "PREDICT") {
    const c = i(t, ["contents"]);
    if (c != null) {
      let d = Wi(e, c);
      Array.isArray(d) && (d = d.map((p) => p)), l(o, ["instances[]", "content"], d);
    }
  }
  let a = i(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = i(t, ["content"]);
    c != null && l(o, ["content"], vn(de(c)));
  }
  const u = i(t, ["config"]);
  return u != null && aS(u, o, n), o;
}
function cS(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["embeddings"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => u)), l(n, ["embeddings"], a);
  }
  const r = i(e, ["metadata"]);
  return r != null && l(n, ["metadata"], r), n;
}
function dS(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["predictions[]", "embeddings"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => Vv(u))), l(n, ["embeddings"], a);
  }
  const r = i(e, ["metadata"]);
  if (r != null && l(n, ["metadata"], r), t && i(t, ["embeddingApiType"]) === "EMBED_CONTENT") {
    const a = i(e, ["embedding"]), u = i(e, ["usageMetadata"]), c = i(e, ["truncated"]);
    if (a) {
      const d = {};
      u && u.promptTokenCount && (d.tokenCount = u.promptTokenCount), c && (d.truncated = c), a.statistics = d, l(n, ["embeddings"], [a]);
    }
  }
  return n;
}
function fS(e, t) {
  const n = {}, o = i(e, ["endpoint"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["deployedModelId"]);
  return s != null && l(n, ["deployedModelId"], s), n;
}
function pS(e, t) {
  const n = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(e, ["fileUri"]);
  o != null && l(n, ["fileUri"], o);
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function hS(e, t) {
  const n = {}, o = i(e, ["id"]);
  o != null && l(n, ["id"], o);
  const s = i(e, ["args"]);
  s != null && l(n, ["args"], s);
  const r = i(e, ["name"]);
  if (r != null && l(n, ["name"], r), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function mS(e, t) {
  const n = {}, o = i(e, ["allowedFunctionNames"]);
  o != null && l(n, ["allowedFunctionNames"], o);
  const s = i(e, ["mode"]);
  if (s != null && l(n, ["mode"], s), i(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function gS(e, t) {
  const n = {}, o = i(e, ["description"]);
  o != null && l(n, ["description"], o);
  const s = i(e, ["name"]);
  s != null && l(n, ["name"], s);
  const r = i(e, ["parameters"]);
  r != null && l(n, ["parameters"], r);
  const a = i(e, ["parametersJsonSchema"]);
  a != null && l(n, ["parametersJsonSchema"], a);
  const u = i(e, ["response"]);
  u != null && l(n, ["response"], u);
  const c = i(e, ["responseJsonSchema"]);
  if (c != null && l(n, ["responseJsonSchema"], c), i(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return n;
}
function yS(e, t, n, o) {
  const s = {}, r = i(t, ["systemInstruction"]);
  n !== void 0 && r != null && l(n, ["systemInstruction"], wo(de(r)));
  const a = i(t, ["temperature"]);
  a != null && l(s, ["temperature"], a);
  const u = i(t, ["topP"]);
  u != null && l(s, ["topP"], u);
  const c = i(t, ["topK"]);
  c != null && l(s, ["topK"], c);
  const d = i(t, ["candidateCount"]);
  d != null && l(s, ["candidateCount"], d);
  const p = i(t, ["maxOutputTokens"]);
  p != null && l(s, ["maxOutputTokens"], p);
  const f = i(t, ["stopSequences"]);
  f != null && l(s, ["stopSequences"], f);
  const h = i(t, ["responseLogprobs"]);
  h != null && l(s, ["responseLogprobs"], h);
  const m = i(t, ["logprobs"]);
  m != null && l(s, ["logprobs"], m);
  const g = i(t, ["presencePenalty"]);
  g != null && l(s, ["presencePenalty"], g);
  const _ = i(t, ["frequencyPenalty"]);
  _ != null && l(s, ["frequencyPenalty"], _);
  const v = i(t, ["seed"]);
  v != null && l(s, ["seed"], v);
  const w = i(t, ["responseMimeType"]);
  w != null && l(s, ["responseMimeType"], w);
  const A = i(t, ["responseSchema"]);
  A != null && l(s, ["responseSchema"], Ki(A));
  const b = i(t, ["responseJsonSchema"]);
  if (b != null && l(s, ["responseJsonSchema"], b), i(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (i(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const x = i(t, ["safetySettings"]);
  if (n !== void 0 && x != null) {
    let X = x;
    Array.isArray(X) && (X = X.map((he) => lT(he))), l(n, ["safetySettings"], X);
  }
  const M = i(t, ["tools"]);
  if (n !== void 0 && M != null) {
    let X = yn(M);
    Array.isArray(X) && (X = X.map((he) => gT(gn(he)))), l(n, ["tools"], X);
  }
  const C = i(t, ["toolConfig"]);
  if (n !== void 0 && C != null && l(n, ["toolConfig"], hT(C)), i(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const L = i(t, ["cachedContent"]);
  n !== void 0 && L != null && l(n, ["cachedContent"], mt(e, L));
  const P = i(t, ["responseModalities"]);
  P != null && l(s, ["responseModalities"], P);
  const N = i(t, ["mediaResolution"]);
  N != null && l(s, ["mediaResolution"], N);
  const H = i(t, ["speechConfig"]);
  if (H != null && l(s, ["speechConfig"], zi(H)), i(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const z = i(t, ["thinkingConfig"]);
  z != null && l(s, ["thinkingConfig"], z);
  const j = i(t, ["imageConfig"]);
  j != null && l(s, ["imageConfig"], VS(j));
  const ee = i(t, ["enableEnhancedCivicAnswers"]);
  if (ee != null && l(s, ["enableEnhancedCivicAnswers"], ee), i(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const Q = i(t, ["serviceTier"]);
  return n !== void 0 && Q != null && l(n, ["serviceTier"], Q), s;
}
function _S(e, t, n, o) {
  const s = {}, r = i(t, ["systemInstruction"]);
  n !== void 0 && r != null && l(n, ["systemInstruction"], vn(de(r)));
  const a = i(t, ["temperature"]);
  a != null && l(s, ["temperature"], a);
  const u = i(t, ["topP"]);
  u != null && l(s, ["topP"], u);
  const c = i(t, ["topK"]);
  c != null && l(s, ["topK"], c);
  const d = i(t, ["candidateCount"]);
  d != null && l(s, ["candidateCount"], d);
  const p = i(t, ["maxOutputTokens"]);
  p != null && l(s, ["maxOutputTokens"], p);
  const f = i(t, ["stopSequences"]);
  f != null && l(s, ["stopSequences"], f);
  const h = i(t, ["responseLogprobs"]);
  h != null && l(s, ["responseLogprobs"], h);
  const m = i(t, ["logprobs"]);
  m != null && l(s, ["logprobs"], m);
  const g = i(t, ["presencePenalty"]);
  g != null && l(s, ["presencePenalty"], g);
  const _ = i(t, ["frequencyPenalty"]);
  _ != null && l(s, ["frequencyPenalty"], _);
  const v = i(t, ["seed"]);
  v != null && l(s, ["seed"], v);
  const w = i(t, ["responseMimeType"]);
  w != null && l(s, ["responseMimeType"], w);
  const A = i(t, ["responseSchema"]);
  A != null && l(s, ["responseSchema"], Ki(A));
  const b = i(t, ["responseJsonSchema"]);
  b != null && l(s, ["responseJsonSchema"], b);
  const x = i(t, ["routingConfig"]);
  x != null && l(s, ["routingConfig"], x);
  const M = i(t, ["modelSelectionConfig"]);
  M != null && l(s, ["modelConfig"], M);
  const C = i(t, ["safetySettings"]);
  if (n !== void 0 && C != null) {
    let ye = C;
    Array.isArray(ye) && (ye = ye.map((Vt) => Vt)), l(n, ["safetySettings"], ye);
  }
  const L = i(t, ["tools"]);
  if (n !== void 0 && L != null) {
    let ye = yn(L);
    Array.isArray(ye) && (ye = ye.map((Vt) => Nf(gn(Vt)))), l(n, ["tools"], ye);
  }
  const P = i(t, ["toolConfig"]);
  n !== void 0 && P != null && l(n, ["toolConfig"], mT(P));
  const N = i(t, ["labels"]);
  n !== void 0 && N != null && l(n, ["labels"], N);
  const H = i(t, ["cachedContent"]);
  n !== void 0 && H != null && l(n, ["cachedContent"], mt(e, H));
  const z = i(t, ["responseModalities"]);
  z != null && l(s, ["responseModalities"], z);
  const j = i(t, ["mediaResolution"]);
  j != null && l(s, ["mediaResolution"], j);
  const ee = i(t, ["speechConfig"]);
  ee != null && l(s, ["speechConfig"], zi(ee));
  const Q = i(t, ["audioTimestamp"]);
  Q != null && l(s, ["audioTimestamp"], Q);
  const X = i(t, ["thinkingConfig"]);
  X != null && l(s, ["thinkingConfig"], X);
  const he = i(t, ["imageConfig"]);
  if (he != null && l(s, ["imageConfig"], JS(he)), i(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const $e = i(t, ["modelArmorConfig"]);
  n !== void 0 && $e != null && l(n, ["modelArmorConfig"], $e);
  const Te = i(t, ["serviceTier"]);
  return n !== void 0 && Te != null && l(n, ["serviceTier"], Te), s;
}
function Ju(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["contents"]);
  if (r != null) {
    let u = Ae(r);
    Array.isArray(u) && (u = u.map((c) => wo(c))), l(o, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && l(o, ["generationConfig"], yS(e, a, o)), o;
}
function Wu(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["contents"]);
  if (r != null) {
    let u = Ae(r);
    Array.isArray(u) && (u = u.map((c) => vn(c))), l(o, ["contents"], u);
  }
  const a = i(t, ["config"]);
  return a != null && l(o, ["generationConfig"], _S(e, a, o)), o;
}
function Ku(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["candidates"]);
  if (s != null) {
    let p = s;
    Array.isArray(p) && (p = p.map((f) => qv(f))), l(n, ["candidates"], p);
  }
  const r = i(e, ["modelVersion"]);
  r != null && l(n, ["modelVersion"], r);
  const a = i(e, ["promptFeedback"]);
  a != null && l(n, ["promptFeedback"], a);
  const u = i(e, ["responseId"]);
  u != null && l(n, ["responseId"], u);
  const c = i(e, ["usageMetadata"]);
  c != null && l(n, ["usageMetadata"], c);
  const d = i(e, ["modelStatus"]);
  return d != null && l(n, ["modelStatus"], d), n;
}
function zu(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["candidates"]);
  if (s != null) {
    let p = s;
    Array.isArray(p) && (p = p.map((f) => f)), l(n, ["candidates"], p);
  }
  const r = i(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const a = i(e, ["modelVersion"]);
  a != null && l(n, ["modelVersion"], a);
  const u = i(e, ["promptFeedback"]);
  u != null && l(n, ["promptFeedback"], u);
  const c = i(e, ["responseId"]);
  c != null && l(n, ["responseId"], c);
  const d = i(e, ["usageMetadata"]);
  return d != null && l(n, ["usageMetadata"], d), n;
}
function vS(e, t, n) {
  const o = {};
  if (i(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (i(e, ["negativePrompt"]) !== void 0) throw new Error("negativePrompt parameter is not supported in Gemini API.");
  const s = i(e, ["numberOfImages"]);
  t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s);
  const r = i(e, ["aspectRatio"]);
  t !== void 0 && r != null && l(t, ["parameters", "aspectRatio"], r);
  const a = i(e, ["guidanceScale"]);
  if (t !== void 0 && a != null && l(t, ["parameters", "guidanceScale"], a), i(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const u = i(e, ["safetyFilterLevel"]);
  t !== void 0 && u != null && l(t, ["parameters", "safetySetting"], u);
  const c = i(e, ["personGeneration"]);
  t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c);
  const d = i(e, ["includeSafetyAttributes"]);
  t !== void 0 && d != null && l(t, ["parameters", "includeSafetyAttributes"], d);
  const p = i(e, ["includeRaiReason"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeRaiReason"], p);
  const f = i(e, ["language"]);
  t !== void 0 && f != null && l(t, ["parameters", "language"], f);
  const h = i(e, ["outputMimeType"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], h);
  const m = i(e, ["outputCompressionQuality"]);
  if (t !== void 0 && m != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], m), i(e, ["addWatermark"]) !== void 0) throw new Error("addWatermark parameter is not supported in Gemini API.");
  if (i(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const g = i(e, ["imageSize"]);
  if (t !== void 0 && g != null && l(t, ["parameters", "sampleImageSize"], g), i(e, ["enhancePrompt"]) !== void 0) throw new Error("enhancePrompt parameter is not supported in Gemini API.");
  return o;
}
function SS(e, t, n) {
  const o = {}, s = i(e, ["outputGcsUri"]);
  t !== void 0 && s != null && l(t, ["parameters", "storageUri"], s);
  const r = i(e, ["negativePrompt"]);
  t !== void 0 && r != null && l(t, ["parameters", "negativePrompt"], r);
  const a = i(e, ["numberOfImages"]);
  t !== void 0 && a != null && l(t, ["parameters", "sampleCount"], a);
  const u = i(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = i(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = i(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const p = i(e, ["safetyFilterLevel"]);
  t !== void 0 && p != null && l(t, ["parameters", "safetySetting"], p);
  const f = i(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const h = i(e, ["includeSafetyAttributes"]);
  t !== void 0 && h != null && l(t, ["parameters", "includeSafetyAttributes"], h);
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
  const A = i(e, ["labels"]);
  t !== void 0 && A != null && l(t, ["labels"], A);
  const b = i(e, ["imageSize"]);
  t !== void 0 && b != null && l(t, ["parameters", "sampleImageSize"], b);
  const x = i(e, ["enhancePrompt"]);
  return t !== void 0 && x != null && l(t, ["parameters", "enhancePrompt"], x), o;
}
function TS(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["prompt"]);
  r != null && l(o, ["instances[0]", "prompt"], r);
  const a = i(t, ["config"]);
  return a != null && vS(a, o), o;
}
function ES(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["prompt"]);
  r != null && l(o, ["instances[0]", "prompt"], r);
  const a = i(t, ["config"]);
  return a != null && SS(a, o), o;
}
function wS(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["predictions"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => US(u))), l(n, ["generatedImages"], a);
  }
  const r = i(e, ["positivePromptSafetyAttributes"]);
  return r != null && l(n, ["positivePromptSafetyAttributes"], xf(r)), n;
}
function CS(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["predictions"]);
  if (s != null) {
    let a = s;
    Array.isArray(a) && (a = a.map((u) => Gs(u))), l(n, ["generatedImages"], a);
  }
  const r = i(e, ["positivePromptSafetyAttributes"]);
  return r != null && l(n, ["positivePromptSafetyAttributes"], Mf(r)), n;
}
function AS(e, t, n) {
  const o = {}, s = i(e, ["numberOfVideos"]);
  if (t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s), i(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (i(e, ["fps"]) !== void 0) throw new Error("fps parameter is not supported in Gemini API.");
  const r = i(e, ["durationSeconds"]);
  if (t !== void 0 && r != null && l(t, ["parameters", "durationSeconds"], r), i(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const a = i(e, ["aspectRatio"]);
  t !== void 0 && a != null && l(t, ["parameters", "aspectRatio"], a);
  const u = i(e, ["resolution"]);
  t !== void 0 && u != null && l(t, ["parameters", "resolution"], u);
  const c = i(e, ["personGeneration"]);
  if (t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c), i(e, ["pubsubTopic"]) !== void 0) throw new Error("pubsubTopic parameter is not supported in Gemini API.");
  const d = i(e, ["negativePrompt"]);
  t !== void 0 && d != null && l(t, ["parameters", "negativePrompt"], d);
  const p = i(e, ["enhancePrompt"]);
  if (t !== void 0 && p != null && l(t, ["parameters", "enhancePrompt"], p), i(e, ["generateAudio"]) !== void 0) throw new Error("generateAudio parameter is not supported in Gemini API.");
  const f = i(e, ["lastFrame"]);
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Os(f));
  const h = i(e, ["referenceImages"]);
  if (t !== void 0 && h != null) {
    let g = h;
    Array.isArray(g) && (g = g.map((_) => PT(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (i(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (i(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (i(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = i(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), o;
}
function IS(e, t, n) {
  const o = {}, s = i(e, ["numberOfVideos"]);
  t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s);
  const r = i(e, ["outputGcsUri"]);
  t !== void 0 && r != null && l(t, ["parameters", "storageUri"], r);
  const a = i(e, ["fps"]);
  t !== void 0 && a != null && l(t, ["parameters", "fps"], a);
  const u = i(e, ["durationSeconds"]);
  t !== void 0 && u != null && l(t, ["parameters", "durationSeconds"], u);
  const c = i(e, ["seed"]);
  t !== void 0 && c != null && l(t, ["parameters", "seed"], c);
  const d = i(e, ["aspectRatio"]);
  t !== void 0 && d != null && l(t, ["parameters", "aspectRatio"], d);
  const p = i(e, ["resolution"]);
  t !== void 0 && p != null && l(t, ["parameters", "resolution"], p);
  const f = i(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const h = i(e, ["pubsubTopic"]);
  t !== void 0 && h != null && l(t, ["parameters", "pubsubTopic"], h);
  const m = i(e, ["negativePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "negativePrompt"], m);
  const g = i(e, ["enhancePrompt"]);
  t !== void 0 && g != null && l(t, ["parameters", "enhancePrompt"], g);
  const _ = i(e, ["generateAudio"]);
  t !== void 0 && _ != null && l(t, ["parameters", "generateAudio"], _);
  const v = i(e, ["lastFrame"]);
  t !== void 0 && v != null && l(t, ["instances[0]", "lastFrame"], Qe(v));
  const w = i(e, ["referenceImages"]);
  if (t !== void 0 && w != null) {
    let M = w;
    Array.isArray(M) && (M = M.map((C) => xT(C))), l(t, ["instances[0]", "referenceImages"], M);
  }
  const A = i(e, ["mask"]);
  t !== void 0 && A != null && l(t, ["instances[0]", "mask"], RT(A));
  const b = i(e, ["compressionQuality"]);
  t !== void 0 && b != null && l(t, ["parameters", "compressionQuality"], b);
  const x = i(e, ["labels"]);
  if (t !== void 0 && x != null && l(t, ["labels"], x), i(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return o;
}
function bS(e, t) {
  const n = {}, o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const r = i(e, ["done"]);
  r != null && l(n, ["done"], r);
  const a = i(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = i(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], MS(u)), n;
}
function RS(e, t) {
  const n = {}, o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["metadata"]);
  s != null && l(n, ["metadata"], s);
  const r = i(e, ["done"]);
  r != null && l(n, ["done"], r);
  const a = i(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = i(e, ["response"]);
  return u != null && l(n, ["response"], NS(u)), n;
}
function PS(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["prompt"]);
  r != null && l(o, ["instances[0]", "prompt"], r);
  const a = i(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], Os(a));
  const u = i(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], kf(u));
  const c = i(t, ["source"]);
  c != null && kS(c, o);
  const d = i(t, ["config"]);
  return d != null && AS(d, o), o;
}
function xS(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["prompt"]);
  r != null && l(o, ["instances[0]", "prompt"], r);
  const a = i(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], Qe(a));
  const u = i(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], Df(u));
  const c = i(t, ["source"]);
  c != null && DS(c, o);
  const d = i(t, ["config"]);
  return d != null && IS(d, o), o;
}
function MS(e, t) {
  const n = {}, o = i(e, ["generatedSamples"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => $S(u))), l(n, ["generatedVideos"], a);
  }
  const s = i(e, ["raiMediaFilteredCount"]);
  s != null && l(n, ["raiMediaFilteredCount"], s);
  const r = i(e, ["raiMediaFilteredReasons"]);
  return r != null && l(n, ["raiMediaFilteredReasons"], r), n;
}
function NS(e, t) {
  const n = {}, o = i(e, ["videos"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => FS(u))), l(n, ["generatedVideos"], a);
  }
  const s = i(e, ["raiMediaFilteredCount"]);
  s != null && l(n, ["raiMediaFilteredCount"], s);
  const r = i(e, ["raiMediaFilteredReasons"]);
  return r != null && l(n, ["raiMediaFilteredReasons"], r), n;
}
function kS(e, t, n) {
  const o = {}, s = i(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const r = i(e, ["image"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "image"], Os(r));
  const a = i(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], kf(a)), o;
}
function DS(e, t, n) {
  const o = {}, s = i(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const r = i(e, ["image"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "image"], Qe(r));
  const a = i(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Df(a)), o;
}
function US(e, t) {
  const n = {}, o = i(e, ["_self"]);
  o != null && l(n, ["image"], WS(o));
  const s = i(e, ["raiFilteredReason"]);
  s != null && l(n, ["raiFilteredReason"], s);
  const r = i(e, ["_self"]);
  return r != null && l(n, ["safetyAttributes"], xf(r)), n;
}
function Gs(e, t) {
  const n = {}, o = i(e, ["_self"]);
  o != null && l(n, ["image"], Pf(o));
  const s = i(e, ["raiFilteredReason"]);
  s != null && l(n, ["raiFilteredReason"], s);
  const r = i(e, ["_self"]);
  r != null && l(n, ["safetyAttributes"], Mf(r));
  const a = i(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function LS(e, t) {
  const n = {}, o = i(e, ["_self"]);
  o != null && l(n, ["mask"], Pf(o));
  const s = i(e, ["labels"]);
  if (s != null) {
    let r = s;
    Array.isArray(r) && (r = r.map((a) => a)), l(n, ["labels"], r);
  }
  return n;
}
function $S(e, t) {
  const n = {}, o = i(e, ["video"]);
  return o != null && l(n, ["video"], IT(o)), n;
}
function FS(e, t) {
  const n = {}, o = i(e, ["_self"]);
  return o != null && l(n, ["video"], bT(o)), n;
}
function BS(e, t) {
  const n = {}, o = i(e, ["modelSelectionConfig"]);
  o != null && l(n, ["modelConfig"], o);
  const s = i(e, ["responseJsonSchema"]);
  s != null && l(n, ["responseJsonSchema"], s);
  const r = i(e, ["audioTimestamp"]);
  r != null && l(n, ["audioTimestamp"], r);
  const a = i(e, ["candidateCount"]);
  a != null && l(n, ["candidateCount"], a);
  const u = i(e, ["enableAffectiveDialog"]);
  u != null && l(n, ["enableAffectiveDialog"], u);
  const c = i(e, ["frequencyPenalty"]);
  c != null && l(n, ["frequencyPenalty"], c);
  const d = i(e, ["logprobs"]);
  d != null && l(n, ["logprobs"], d);
  const p = i(e, ["maxOutputTokens"]);
  p != null && l(n, ["maxOutputTokens"], p);
  const f = i(e, ["mediaResolution"]);
  f != null && l(n, ["mediaResolution"], f);
  const h = i(e, ["presencePenalty"]);
  h != null && l(n, ["presencePenalty"], h);
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
  const A = i(e, ["seed"]);
  A != null && l(n, ["seed"], A);
  const b = i(e, ["speechConfig"]);
  b != null && l(n, ["speechConfig"], b);
  const x = i(e, ["stopSequences"]);
  x != null && l(n, ["stopSequences"], x);
  const M = i(e, ["temperature"]);
  M != null && l(n, ["temperature"], M);
  const C = i(e, ["thinkingConfig"]);
  C != null && l(n, ["thinkingConfig"], C);
  const L = i(e, ["topK"]);
  L != null && l(n, ["topK"], L);
  const P = i(e, ["topP"]);
  if (P != null && l(n, ["topP"], P), i(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function qS(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  return s != null && l(o, ["_url", "name"], Y(e, s)), o;
}
function GS(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  return s != null && l(o, ["_url", "name"], Y(e, s)), o;
}
function OS(e, t) {
  const n = {}, o = i(e, ["authConfig"]);
  o != null && l(n, ["authConfig"], Fv(o));
  const s = i(e, ["enableWidget"]);
  return s != null && l(n, ["enableWidget"], s), n;
}
function HS(e, t) {
  const n = {}, o = i(e, ["searchTypes"]);
  if (o != null && l(n, ["searchTypes"], o), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const s = i(e, ["timeRangeFilter"]);
  return s != null && l(n, ["timeRangeFilter"], s), n;
}
function VS(e, t) {
  const n = {}, o = i(e, ["aspectRatio"]);
  o != null && l(n, ["aspectRatio"], o);
  const s = i(e, ["imageSize"]);
  if (s != null && l(n, ["imageSize"], s), i(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (i(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (i(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (i(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (i(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return n;
}
function JS(e, t) {
  const n = {}, o = i(e, ["aspectRatio"]);
  o != null && l(n, ["aspectRatio"], o);
  const s = i(e, ["imageSize"]);
  s != null && l(n, ["imageSize"], s);
  const r = i(e, ["personGeneration"]);
  r != null && l(n, ["personGeneration"], r);
  const a = i(e, ["prominentPeople"]);
  a != null && l(n, ["prominentPeople"], a);
  const u = i(e, ["outputMimeType"]);
  u != null && l(n, ["imageOutputOptions", "mimeType"], u);
  const c = i(e, ["outputCompressionQuality"]);
  c != null && l(n, ["imageOutputOptions", "compressionQuality"], c);
  const d = i(e, ["imageOutputOptions"]);
  return d != null && l(n, ["imageOutputOptions"], d), n;
}
function WS(e, t) {
  const n = {}, o = i(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], It(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function Pf(e, t) {
  const n = {}, o = i(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = i(e, ["bytesBase64Encoded"]);
  s != null && l(n, ["imageBytes"], It(s));
  const r = i(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function Os(e, t) {
  const n = {};
  if (i(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const o = i(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], It(o));
  const s = i(e, ["mimeType"]);
  return s != null && l(n, ["mimeType"], s), n;
}
function Qe(e, t) {
  const n = {}, o = i(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = i(e, ["imageBytes"]);
  s != null && l(n, ["bytesBase64Encoded"], It(s));
  const r = i(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function KS(e, t, n, o) {
  const s = {}, r = i(t, ["pageSize"]);
  n !== void 0 && r != null && l(n, ["_query", "pageSize"], r);
  const a = i(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = i(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = i(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], Sf(e, c)), s;
}
function zS(e, t, n, o) {
  const s = {}, r = i(t, ["pageSize"]);
  n !== void 0 && r != null && l(n, ["_query", "pageSize"], r);
  const a = i(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = i(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = i(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], Sf(e, c)), s;
}
function YS(e, t, n) {
  const o = {}, s = i(t, ["config"]);
  return s != null && KS(e, s, o), o;
}
function XS(e, t, n) {
  const o = {}, s = i(t, ["config"]);
  return s != null && zS(e, s, o), o;
}
function QS(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const r = i(e, ["_self"]);
  if (r != null) {
    let a = Tf(r);
    Array.isArray(a) && (a = a.map((u) => ei(u))), l(n, ["models"], a);
  }
  return n;
}
function ZS(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const r = i(e, ["_self"]);
  if (r != null) {
    let a = Tf(r);
    Array.isArray(a) && (a = a.map((u) => ti(u))), l(n, ["models"], a);
  }
  return n;
}
function jS(e, t) {
  const n = {}, o = i(e, ["maskMode"]);
  o != null && l(n, ["maskMode"], o);
  const s = i(e, ["segmentationClasses"]);
  s != null && l(n, ["maskClasses"], s);
  const r = i(e, ["maskDilation"]);
  return r != null && l(n, ["dilation"], r), n;
}
function ei(e, t) {
  const n = {}, o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["displayName"]);
  s != null && l(n, ["displayName"], s);
  const r = i(e, ["description"]);
  r != null && l(n, ["description"], r);
  const a = i(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = i(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], yT(u));
  const c = i(e, ["inputTokenLimit"]);
  c != null && l(n, ["inputTokenLimit"], c);
  const d = i(e, ["outputTokenLimit"]);
  d != null && l(n, ["outputTokenLimit"], d);
  const p = i(e, ["supportedGenerationMethods"]);
  p != null && l(n, ["supportedActions"], p);
  const f = i(e, ["temperature"]);
  f != null && l(n, ["temperature"], f);
  const h = i(e, ["maxTemperature"]);
  h != null && l(n, ["maxTemperature"], h);
  const m = i(e, ["topP"]);
  m != null && l(n, ["topP"], m);
  const g = i(e, ["topK"]);
  g != null && l(n, ["topK"], g);
  const _ = i(e, ["thinking"]);
  return _ != null && l(n, ["thinking"], _), n;
}
function ti(e, t) {
  const n = {}, o = i(e, ["name"]);
  o != null && l(n, ["name"], o);
  const s = i(e, ["displayName"]);
  s != null && l(n, ["displayName"], s);
  const r = i(e, ["description"]);
  r != null && l(n, ["description"], r);
  const a = i(e, ["versionId"]);
  a != null && l(n, ["version"], a);
  const u = i(e, ["deployedModels"]);
  if (u != null) {
    let h = u;
    Array.isArray(h) && (h = h.map((m) => fS(m))), l(n, ["endpoints"], h);
  }
  const c = i(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = i(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], _T(d));
  const p = i(e, ["defaultCheckpointId"]);
  p != null && l(n, ["defaultCheckpointId"], p);
  const f = i(e, ["checkpoints"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((m) => m)), l(n, ["checkpoints"], h);
  }
  return n;
}
function eT(e, t) {
  const n = {}, o = i(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const s = i(e, ["codeExecutionResult"]);
  s != null && l(n, ["codeExecutionResult"], s);
  const r = i(e, ["executableCode"]);
  r != null && l(n, ["executableCode"], r);
  const a = i(e, ["fileData"]);
  a != null && l(n, ["fileData"], pS(a));
  const u = i(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], hS(u));
  const c = i(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = i(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], Bv(d));
  const p = i(e, ["text"]);
  p != null && l(n, ["text"], p);
  const f = i(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const h = i(e, ["thoughtSignature"]);
  h != null && l(n, ["thoughtSignature"], h);
  const m = i(e, ["videoMetadata"]);
  m != null && l(n, ["videoMetadata"], m);
  const g = i(e, ["toolCall"]);
  g != null && l(n, ["toolCall"], g);
  const _ = i(e, ["toolResponse"]);
  _ != null && l(n, ["toolResponse"], _);
  const v = i(e, ["partMetadata"]);
  return v != null && l(n, ["partMetadata"], v), n;
}
function tT(e, t) {
  const n = {}, o = i(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const s = i(e, ["codeExecutionResult"]);
  s != null && l(n, ["codeExecutionResult"], s);
  const r = i(e, ["executableCode"]);
  r != null && l(n, ["executableCode"], r);
  const a = i(e, ["fileData"]);
  a != null && l(n, ["fileData"], a);
  const u = i(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], u);
  const c = i(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = i(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], d);
  const p = i(e, ["text"]);
  p != null && l(n, ["text"], p);
  const f = i(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const h = i(e, ["thoughtSignature"]);
  h != null && l(n, ["thoughtSignature"], h);
  const m = i(e, ["videoMetadata"]);
  if (m != null && l(n, ["videoMetadata"], m), i(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (i(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (i(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return n;
}
function nT(e, t) {
  const n = {}, o = i(e, ["productImage"]);
  return o != null && l(n, ["image"], Qe(o)), n;
}
function oT(e, t, n) {
  const o = {}, s = i(e, ["numberOfImages"]);
  t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s);
  const r = i(e, ["baseSteps"]);
  t !== void 0 && r != null && l(t, ["parameters", "baseSteps"], r);
  const a = i(e, ["outputGcsUri"]);
  t !== void 0 && a != null && l(t, ["parameters", "storageUri"], a);
  const u = i(e, ["seed"]);
  t !== void 0 && u != null && l(t, ["parameters", "seed"], u);
  const c = i(e, ["safetyFilterLevel"]);
  t !== void 0 && c != null && l(t, ["parameters", "safetySetting"], c);
  const d = i(e, ["personGeneration"]);
  t !== void 0 && d != null && l(t, ["parameters", "personGeneration"], d);
  const p = i(e, ["addWatermark"]);
  t !== void 0 && p != null && l(t, ["parameters", "addWatermark"], p);
  const f = i(e, ["outputMimeType"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], f);
  const h = i(e, ["outputCompressionQuality"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], h);
  const m = i(e, ["enhancePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "enhancePrompt"], m);
  const g = i(e, ["labels"]);
  return t !== void 0 && g != null && l(t, ["labels"], g), o;
}
function sT(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["source"]);
  r != null && iT(r, o);
  const a = i(t, ["config"]);
  return a != null && oT(a, o), o;
}
function rT(e, t) {
  const n = {}, o = i(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((r) => Gs(r))), l(n, ["generatedImages"], s);
  }
  return n;
}
function iT(e, t, n) {
  const o = {}, s = i(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const r = i(e, ["personImage"]);
  t !== void 0 && r != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], Qe(r));
  const a = i(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => nT(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return o;
}
function aT(e, t) {
  const n = {}, o = i(e, ["referenceImage"]);
  o != null && l(n, ["referenceImage"], Qe(o));
  const s = i(e, ["referenceId"]);
  s != null && l(n, ["referenceId"], s);
  const r = i(e, ["referenceType"]);
  r != null && l(n, ["referenceType"], r);
  const a = i(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], jS(a));
  const u = i(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], Wv(u));
  const c = i(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = i(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function xf(e, t) {
  const n = {}, o = i(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const s = i(e, ["safetyAttributes", "scores"]);
  s != null && l(n, ["scores"], s);
  const r = i(e, ["contentType"]);
  return r != null && l(n, ["contentType"], r), n;
}
function Mf(e, t) {
  const n = {}, o = i(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const s = i(e, ["safetyAttributes", "scores"]);
  s != null && l(n, ["scores"], s);
  const r = i(e, ["contentType"]);
  return r != null && l(n, ["contentType"], r), n;
}
function lT(e, t) {
  const n = {}, o = i(e, ["category"]);
  if (o != null && l(n, ["category"], o), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const s = i(e, ["threshold"]);
  return s != null && l(n, ["threshold"], s), n;
}
function uT(e, t) {
  const n = {}, o = i(e, ["image"]);
  return o != null && l(n, ["image"], Qe(o)), n;
}
function cT(e, t, n) {
  const o = {}, s = i(e, ["mode"]);
  t !== void 0 && s != null && l(t, ["parameters", "mode"], s);
  const r = i(e, ["maxPredictions"]);
  t !== void 0 && r != null && l(t, ["parameters", "maxPredictions"], r);
  const a = i(e, ["confidenceThreshold"]);
  t !== void 0 && a != null && l(t, ["parameters", "confidenceThreshold"], a);
  const u = i(e, ["maskDilation"]);
  t !== void 0 && u != null && l(t, ["parameters", "maskDilation"], u);
  const c = i(e, ["binaryColorThreshold"]);
  t !== void 0 && c != null && l(t, ["parameters", "binaryColorThreshold"], c);
  const d = i(e, ["labels"]);
  return t !== void 0 && d != null && l(t, ["labels"], d), o;
}
function dT(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["source"]);
  r != null && pT(r, o);
  const a = i(t, ["config"]);
  return a != null && cT(a, o), o;
}
function fT(e, t) {
  const n = {}, o = i(e, ["predictions"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((r) => LS(r))), l(n, ["generatedMasks"], s);
  }
  return n;
}
function pT(e, t, n) {
  const o = {}, s = i(e, ["prompt"]);
  t !== void 0 && s != null && l(t, ["instances[0]", "prompt"], s);
  const r = i(e, ["image"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "image"], Qe(r));
  const a = i(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], uT(a)), o;
}
function hT(e, t) {
  const n = {}, o = i(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const s = i(e, ["functionCallingConfig"]);
  s != null && l(n, ["functionCallingConfig"], mS(s));
  const r = i(e, ["includeServerSideToolInvocations"]);
  return r != null && l(n, ["includeServerSideToolInvocations"], r), n;
}
function mT(e, t) {
  const n = {}, o = i(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const s = i(e, ["functionCallingConfig"]);
  if (s != null && l(n, ["functionCallingConfig"], s), i(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function gT(e, t) {
  const n = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = i(e, ["computerUse"]);
  o != null && l(n, ["computerUse"], o);
  const s = i(e, ["fileSearch"]);
  s != null && l(n, ["fileSearch"], s);
  const r = i(e, ["googleSearch"]);
  r != null && l(n, ["googleSearch"], HS(r));
  const a = i(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], OS(a));
  const u = i(e, ["codeExecution"]);
  if (u != null && l(n, ["codeExecution"], u), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = i(e, ["functionDeclarations"]);
  if (c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((m) => m)), l(n, ["functionDeclarations"], h);
  }
  const d = i(e, ["googleSearchRetrieval"]);
  if (d != null && l(n, ["googleSearchRetrieval"], d), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const p = i(e, ["urlContext"]);
  p != null && l(n, ["urlContext"], p);
  const f = i(e, ["mcpServers"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((m) => m)), l(n, ["mcpServers"], h);
  }
  return n;
}
function Nf(e, t) {
  const n = {}, o = i(e, ["retrieval"]);
  o != null && l(n, ["retrieval"], o);
  const s = i(e, ["computerUse"]);
  if (s != null && l(n, ["computerUse"], s), i(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const r = i(e, ["googleSearch"]);
  r != null && l(n, ["googleSearch"], r);
  const a = i(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], a);
  const u = i(e, ["codeExecution"]);
  u != null && l(n, ["codeExecution"], u);
  const c = i(e, ["enterpriseWebSearch"]);
  c != null && l(n, ["enterpriseWebSearch"], c);
  const d = i(e, ["functionDeclarations"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => gS(g))), l(n, ["functionDeclarations"], m);
  }
  const p = i(e, ["googleSearchRetrieval"]);
  p != null && l(n, ["googleSearchRetrieval"], p);
  const f = i(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const h = i(e, ["urlContext"]);
  if (h != null && l(n, ["urlContext"], h), i(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function yT(e, t) {
  const n = {}, o = i(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = i(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const r = i(e, ["updateTime"]);
  return r != null && l(n, ["updateTime"], r), n;
}
function _T(e, t) {
  const n = {}, o = i(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  o != null && l(n, ["baseModel"], o);
  const s = i(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const r = i(e, ["updateTime"]);
  return r != null && l(n, ["updateTime"], r), n;
}
function vT(e, t, n) {
  const o = {}, s = i(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const r = i(e, ["description"]);
  t !== void 0 && r != null && l(t, ["description"], r);
  const a = i(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function ST(e, t, n) {
  const o = {}, s = i(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const r = i(e, ["description"]);
  t !== void 0 && r != null && l(t, ["description"], r);
  const a = i(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function TT(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "name"], Y(e, s));
  const r = i(t, ["config"]);
  return r != null && vT(r, o), o;
}
function ET(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["config"]);
  return r != null && ST(r, o), o;
}
function wT(e, t, n) {
  const o = {}, s = i(e, ["outputGcsUri"]);
  t !== void 0 && s != null && l(t, ["parameters", "storageUri"], s);
  const r = i(e, ["safetyFilterLevel"]);
  t !== void 0 && r != null && l(t, ["parameters", "safetySetting"], r);
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
  const p = i(e, ["enhanceInputImage"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "upscaleConfig",
    "enhanceInputImage"
  ], p);
  const f = i(e, ["imagePreservationFactor"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "upscaleConfig",
    "imagePreservationFactor"
  ], f);
  const h = i(e, ["labels"]);
  t !== void 0 && h != null && l(t, ["labels"], h);
  const m = i(e, ["numberOfImages"]);
  t !== void 0 && m != null && l(t, ["parameters", "sampleCount"], m);
  const g = i(e, ["mode"]);
  return t !== void 0 && g != null && l(t, ["parameters", "mode"], g), o;
}
function CT(e, t, n) {
  const o = {}, s = i(t, ["model"]);
  s != null && l(o, ["_url", "model"], Y(e, s));
  const r = i(t, ["image"]);
  r != null && l(o, ["instances[0]", "image"], Qe(r));
  const a = i(t, ["upscaleFactor"]);
  a != null && l(o, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = i(t, ["config"]);
  return u != null && wT(u, o), o;
}
function AT(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["predictions"]);
  if (s != null) {
    let r = s;
    Array.isArray(r) && (r = r.map((a) => Gs(a))), l(n, ["generatedImages"], r);
  }
  return n;
}
function IT(e, t) {
  const n = {}, o = i(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const s = i(e, ["encodedVideo"]);
  s != null && l(n, ["videoBytes"], It(s));
  const r = i(e, ["encoding"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function bT(e, t) {
  const n = {}, o = i(e, ["gcsUri"]);
  o != null && l(n, ["uri"], o);
  const s = i(e, ["bytesBase64Encoded"]);
  s != null && l(n, ["videoBytes"], It(s));
  const r = i(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function RT(e, t) {
  const n = {}, o = i(e, ["image"]);
  o != null && l(n, ["_self"], Qe(o));
  const s = i(e, ["maskMode"]);
  return s != null && l(n, ["maskMode"], s), n;
}
function PT(e, t) {
  const n = {}, o = i(e, ["image"]);
  o != null && l(n, ["image"], Os(o));
  const s = i(e, ["referenceType"]);
  return s != null && l(n, ["referenceType"], s), n;
}
function xT(e, t) {
  const n = {}, o = i(e, ["image"]);
  o != null && l(n, ["image"], Qe(o));
  const s = i(e, ["referenceType"]);
  return s != null && l(n, ["referenceType"], s), n;
}
function kf(e, t) {
  const n = {}, o = i(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const s = i(e, ["videoBytes"]);
  s != null && l(n, ["encodedVideo"], It(s));
  const r = i(e, ["mimeType"]);
  return r != null && l(n, ["encoding"], r), n;
}
function Df(e, t) {
  const n = {}, o = i(e, ["uri"]);
  o != null && l(n, ["gcsUri"], o);
  const s = i(e, ["videoBytes"]);
  s != null && l(n, ["bytesBase64Encoded"], It(s));
  const r = i(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function MT(e, t) {
  const n = {}, o = i(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["displayName"], o), n;
}
function NT(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && MT(n, t), t;
}
function kT(e, t) {
  const n = {}, o = i(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function DT(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = i(e, ["config"]);
  return o != null && kT(o, t), t;
}
function UT(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function LT(e, t) {
  const n = {}, o = i(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((a) => a)), l(t, ["customMetadata"], r);
  }
  const s = i(e, ["chunkingConfig"]);
  return t !== void 0 && s != null && l(t, ["chunkingConfig"], s), n;
}
function $T(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = i(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const s = i(e, ["done"]);
  s != null && l(t, ["done"], s);
  const r = i(e, ["error"]);
  r != null && l(t, ["error"], r);
  const a = i(e, ["response"]);
  return a != null && l(t, ["response"], BT(a)), t;
}
function FT(e) {
  const t = {}, n = i(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = i(e, ["fileName"]);
  o != null && l(t, ["fileName"], o);
  const s = i(e, ["config"]);
  return s != null && LT(s, t), t;
}
function BT(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const s = i(e, ["documentName"]);
  return s != null && l(t, ["documentName"], s), t;
}
function qT(e, t) {
  const n = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function GT(e) {
  const t = {}, n = i(e, ["config"]);
  return n != null && qT(n, t), t;
}
function OT(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = i(e, ["fileSearchStores"]);
  if (s != null) {
    let r = s;
    Array.isArray(r) && (r = r.map((a) => a)), l(t, ["fileSearchStores"], r);
  }
  return t;
}
function Uf(e, t) {
  const n = {}, o = i(e, ["mimeType"]);
  t !== void 0 && o != null && l(t, ["mimeType"], o);
  const s = i(e, ["displayName"]);
  t !== void 0 && s != null && l(t, ["displayName"], s);
  const r = i(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let u = r;
    Array.isArray(u) && (u = u.map((c) => c)), l(t, ["customMetadata"], u);
  }
  const a = i(e, ["chunkingConfig"]);
  return t !== void 0 && a != null && l(t, ["chunkingConfig"], a), n;
}
function HT(e) {
  const t = {}, n = i(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = i(e, ["config"]);
  return o != null && Uf(o, t), t;
}
function VT(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var JT = "Content-Type", WT = "X-Server-Timeout", KT = "User-Agent", ni = "x-goog-api-client", zT = "google-genai-sdk/1.50.1", YT = "v1beta1", XT = "v1beta", QT = /* @__PURE__ */ new Set(["us", "eu"]), ZT = 5, jT = [
  408,
  429,
  500,
  502,
  503,
  504
], eE = class {
  constructor(e) {
    var t, n, o;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const s = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const r = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !r ? (s.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? s.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && QT.has(this.clientOptions.location) ? s.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (s.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), s.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : YT;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), s.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : XT, s.baseUrl = "https://generativelanguage.googleapis.com/";
    s.headers = this.getDefaultHeaders(), this.clientOptions.httpOptions = s, e.httpOptions && (this.clientOptions.httpOptions = this.patchHttpOptions(s, e.httpOptions));
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
    const o = [this.getRequestUrlInternal(t)];
    return n && o.push(this.getBaseResourcePath()), e !== "" && o.push(e), new URL(`${o.join("/")}`);
  }
  shouldPrependVertexProjectPath(e, t) {
    return !(t.baseUrl && t.baseUrlResourceScope === Xr.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
  }
  async request(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), o = this.constructUrl(e.path, t, n);
    if (e.queryParams) for (const [r, a] of Object.entries(e.queryParams)) o.searchParams.append(r, String(a));
    let s = {};
    if (e.httpMethod === "GET") {
      if (e.body && e.body !== "{}") throw new Error("Request body should be empty for GET request, but got non empty request body");
    } else s.body = e.body;
    return s = await this.includeExtraHttpOptionsToRequestInit(s, t, o.toString(), e.abortSignal), this.unaryApiCall(o, s, e.httpMethod);
  }
  patchHttpOptions(e, t) {
    const n = JSON.parse(JSON.stringify(e));
    for (const [o, s] of Object.entries(t)) typeof s == "object" ? n[o] = Object.assign(Object.assign({}, n[o]), s) : s !== void 0 && (n[o] = s);
    return n;
  }
  async requestStream(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), o = this.constructUrl(e.path, t, n);
    (!o.searchParams.has("alt") || o.searchParams.get("alt") !== "sse") && o.searchParams.set("alt", "sse");
    let s = {};
    return s.body = e.body, s = await this.includeExtraHttpOptionsToRequestInit(s, t, o.toString(), e.abortSignal), this.streamApiCall(o, s, e.httpMethod);
  }
  async includeExtraHttpOptionsToRequestInit(e, t, n, o) {
    if (t && t.timeout || o) {
      const s = new AbortController(), r = s.signal;
      if (t.timeout && t?.timeout > 0) {
        const a = setTimeout(() => s.abort(), t.timeout);
        a && typeof a.unref == "function" && a.unref();
      }
      o && o.addEventListener("abort", () => {
        s.abort();
      }), e.signal = r;
    }
    return t && t.extraBody !== null && tE(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Yu(o), new Qr(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Yu(o), this.processStreamResponse(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  processStreamResponse(e) {
    return Ye(this, arguments, function* () {
      var n;
      const o = (n = e?.body) === null || n === void 0 ? void 0 : n.getReader(), s = new TextDecoder("utf-8");
      if (!o) throw new Error("Response body is empty");
      try {
        let r = "";
        const a = "data:", u = [
          `

`,
          "\r\r",
          `\r
\r
`
        ];
        for (; ; ) {
          const { done: c, value: d } = yield J(o.read());
          if (c) {
            if (r.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const p = s.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(p);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, v = g.code, w = `got status: ${_}. ${JSON.stringify(m)}`;
              if (v >= 400 && v < 600) throw new bf({
                message: w,
                status: v
              });
            }
          } catch (m) {
            if (m.name === "ApiError") throw m;
          }
          r += p;
          let f = -1, h = 0;
          for (; ; ) {
            f = -1, h = 0;
            for (const _ of u) {
              const v = r.indexOf(_);
              v !== -1 && (f === -1 || v < f) && (f = v, h = _.length);
            }
            if (f === -1) break;
            const m = r.substring(0, f);
            r = r.substring(f + h);
            const g = m.trim();
            if (g.startsWith(a)) {
              const _ = g.substring(5).trim();
              try {
                yield yield J(new Qr(new Response(_, {
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
        o.releaseLock();
      }
    });
  }
  async apiCall(e, t) {
    var n;
    if (!this.clientOptions.httpOptions || !this.clientOptions.httpOptions.retryOptions) return fetch(e, t);
    const o = this.clientOptions.httpOptions.retryOptions, s = async () => {
      const r = await fetch(e, t);
      if (r.ok) return r;
      throw jT.includes(r.status) ? new Error(`Retryable HTTP Error: ${r.statusText}`) : new Tl.AbortError(`Non-retryable exception ${r.statusText} sending request`);
    };
    return (0, Tl.default)(s, { retries: ((n = o.attempts) !== null && n !== void 0 ? n : ZT) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = zT + " " + this.clientOptions.userAgentExtra;
    return e[KT] = t, e[ni] = t, e[JT] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [o, s] of Object.entries(e.headers)) n.append(o, s);
      e.timeout && e.timeout > 0 && n.append(WT, String(Math.ceil(e.timeout / 1e3)));
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
    const o = {};
    t != null && (o.mimeType = t.mimeType, o.name = t.name, o.displayName = t.displayName), o.name && !o.name.startsWith("files/") && (o.name = `files/${o.name}`);
    const s = this.clientOptions.uploader, r = await s.stat(e);
    o.sizeBytes = String(r.size);
    const a = (n = t?.mimeType) !== null && n !== void 0 ? n : r.type;
    if (a === void 0 || a === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    o.mimeType = a;
    const u = { file: o }, c = this.getFileName(e), d = k("upload/v1beta/files", u._url), p = await this.fetchUploadUrl(d, o.sizeBytes, o.mimeType, c, u, t?.httpOptions);
    return s.upload(e, p, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var o;
    const s = this.clientOptions.uploader, r = await s.stat(t), a = String(r.size), u = (o = n?.mimeType) !== null && o !== void 0 ? o : r.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), p = {};
    n != null && Uf(n, p);
    const f = await this.fetchUploadUrl(c, a, u, d, p, n?.httpOptions);
    return s.uploadToFileSearchStore(t, f, this);
  }
  async downloadFile(e) {
    await this.clientOptions.downloader.download(e, this);
  }
  async fetchUploadUrl(e, t, n, o, s, r) {
    var a;
    let u = {};
    r ? u = r : u = {
      apiVersion: "",
      headers: Object.assign({
        "Content-Type": "application/json",
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": `${t}`,
        "X-Goog-Upload-Header-Content-Type": `${n}`
      }, o ? { "X-Goog-Upload-File-Name": o } : {})
    };
    const c = await this.request({
      path: e,
      body: JSON.stringify(s),
      httpMethod: "POST",
      httpOptions: u
    });
    if (!c || !c?.headers) throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
    const d = (a = c?.headers) === null || a === void 0 ? void 0 : a["x-goog-upload-url"];
    if (d === void 0) throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
    return d;
  }
};
async function Yu(e) {
  var t;
  if (e === void 0) throw new Error("response is undefined");
  if (!e.ok) {
    const n = e.status;
    let o;
    !((t = e.headers.get("content-type")) === null || t === void 0) && t.includes("application/json") ? o = await e.json() : o = { error: {
      message: await e.text(),
      code: e.status,
      status: e.statusText
    } };
    const s = JSON.stringify(o);
    throw n >= 400 && n < 600 ? new bf({
      message: s,
      status: n
    }) : new Error(s);
  }
}
function tE(e, t) {
  if (!t || Object.keys(t).length === 0) return;
  if (e.body instanceof Blob) {
    console.warn("includeExtraBodyToRequestInit: extraBody provided but current request body is a Blob. extraBody will be ignored as merging is not supported for Blob bodies.");
    return;
  }
  let n = {};
  if (typeof e.body == "string" && e.body.length > 0) try {
    const r = JSON.parse(e.body);
    if (typeof r == "object" && r !== null && !Array.isArray(r)) n = r;
    else {
      console.warn("includeExtraBodyToRequestInit: Original request body is valid JSON but not a non-array object. Skip applying extraBody to the request body.");
      return;
    }
  } catch {
    console.warn("includeExtraBodyToRequestInit: Original request body is not valid JSON. Skip applying extraBody to the request body.");
    return;
  }
  function o(r, a) {
    const u = Object.assign({}, r);
    for (const c in a) if (Object.prototype.hasOwnProperty.call(a, c)) {
      const d = a[c], p = u[c];
      d && typeof d == "object" && !Array.isArray(d) && p && typeof p == "object" && !Array.isArray(p) ? u[c] = o(p, d) : (p && d && typeof p != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof p}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const s = o(n, t);
  e.body = JSON.stringify(s);
}
var nE = "mcp_used/unknown", oE = !1;
function Lf(e) {
  for (const t of e)
    if (sE(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return oE;
}
function $f(e) {
  var t;
  e[ni] = (((t = e[ni]) !== null && t !== void 0 ? t : "") + ` ${nE}`).trimStart();
}
function sE(e) {
  return e !== null && typeof e == "object" && e instanceof iE;
}
function rE(e) {
  return Ye(this, arguments, function* (n, o = 100) {
    let s, r = 0;
    for (; r < o; ) {
      const a = yield J(n.listTools({ cursor: s }));
      for (const u of a.tools)
        yield yield J(u), r++;
      if (!a.nextCursor) break;
      s = a.nextCursor;
    }
  });
}
var iE = class Ff {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Ff(t, n);
  }
  async initialize() {
    var t, n, o, s;
    if (this.mcpTools.length > 0) return;
    const r = {}, a = [];
    for (const p of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, Xe(rE(p))), d; d = await c.next(), t = d.done, !t; u = !0) {
        s = d.value, u = !1;
        const f = s;
        a.push(f);
        const h = f.name;
        if (r[h]) throw new Error(`Duplicate function name ${h} found in MCP tools. Please ensure function names are unique.`);
        r[h] = p;
      }
    } catch (f) {
      n = { error: f };
    } finally {
      try {
        !u && !t && (o = c.return) && await o.call(c);
      } finally {
        if (n) throw n.error;
      }
    }
    this.mcpTools = a, this.functionNameToMcpClient = r;
  }
  async tool() {
    return await this.initialize(), Sy(this.mcpTools, this.config);
  }
  async callTool(t) {
    await this.initialize();
    const n = [];
    for (const o of t) if (o.name in this.functionNameToMcpClient) {
      const s = this.functionNameToMcpClient[o.name];
      let r;
      this.config.timeout && (r = { timeout: this.config.timeout });
      const a = await s.callTool({
        name: o.name,
        arguments: o.args
      }, void 0, r);
      n.push({ functionResponse: {
        name: o.name,
        response: a.isError ? { error: a } : a
      } });
    }
    return n;
  }
};
async function aE(e, t, n) {
  const o = new dy();
  let s;
  n.data instanceof Blob ? s = JSON.parse(await n.data.text()) : s = JSON.parse(n.data), Object.assign(o, s), t(o);
}
var lE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const o = this.apiClient.getWebsocketBaseUrl(), s = this.apiClient.getApiVersion(), r = dE(this.apiClient.getDefaultHeaders()), a = `${o}/ws/google.ai.generativelanguage.${s}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, p = function() {
      u({});
    }, f = this.apiClient, h = {
      onopen: p,
      onmessage: (_) => {
        aE(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(a, cE(r), h);
    m.connect(), await c;
    const g = { setup: { model: Y(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new uE(m, this.apiClient);
  }
}, uE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = Iv(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = Av(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(rn.PLAY);
  }
  pause() {
    this.sendPlaybackControl(rn.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(rn.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(rn.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function cE(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function dE(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var fE = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function pE(e, t, n) {
  const o = new cy();
  let s;
  n.data instanceof Blob ? s = await n.data.text() : n.data instanceof ArrayBuffer ? s = new TextDecoder().decode(n.data) : s = n.data;
  const r = JSON.parse(s);
  if (e.isVertexAI()) {
    const a = Pv(r);
    Object.assign(o, a);
  } else Object.assign(o, r);
  t(o);
}
var hE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new lE(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, o, s, r, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const p = this.apiClient.getHeaders();
    e.config && e.config.tools && Lf(e.config.tools) && $f(p);
    const f = _E(p);
    if (this.apiClient.isVertexAI()) {
      const P = this.apiClient.getProject(), N = this.apiClient.getLocation(), H = this.apiClient.getApiKey(), z = !!P && !!N || !!H;
      this.apiClient.getCustomBaseUrl() && !z ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const P = this.apiClient.getApiKey();
      let N = "BidiGenerateContent", H = "key";
      P?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), N = "BidiGenerateContentConstrained", H = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${N}?${H}=${P}`;
    }
    let h = () => {
    };
    const m = new Promise((P) => {
      h = P;
    }), g = e.callbacks, _ = function() {
      var P;
      (P = g?.onopen) === null || P === void 0 || P.call(g), h({});
    }, v = this.apiClient, w = {
      onopen: _,
      onmessage: (P) => {
        pE(v, g.onmessage, P);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(P) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(P) {
      }
    }, A = this.webSocketFactory.create(d, yE(f), w);
    A.connect(), await m;
    let b = Y(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && b.startsWith("publishers/")) {
      const P = this.apiClient.getProject(), N = this.apiClient.getLocation();
      P && N && (b = `projects/${P}/locations/${N}/` + b);
    }
    let x = {};
    this.apiClient.isVertexAI() && ((o = e.config) === null || o === void 0 ? void 0 : o.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [ws.AUDIO] } : e.config.responseModalities = [ws.AUDIO]), !((s = e.config) === null || s === void 0) && s.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const M = (a = (r = e.config) === null || r === void 0 ? void 0 : r.tools) !== null && a !== void 0 ? a : [], C = [];
    for (const P of M) if (this.isCallableTool(P)) {
      const N = P;
      C.push(await N.tool());
    } else C.push(P);
    C.length > 0 && (e.config.tools = C);
    const L = {
      model: b,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? x = Cv(this.apiClient, L) : x = wv(this.apiClient, L), delete x.config, A.send(JSON.stringify(x)), new gE(A, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, mE = { turnComplete: !0 }, gE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = Ae(t.turns), e.isVertexAI() || (n = n.map((o) => wo(o)));
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
    for (const o of n) {
      if (typeof o != "object" || o === null || !("name" in o) || !("response" in o)) throw new Error(`Could not parse function response, type '${typeof o}'.`);
      if (!e.isVertexAI() && !("id" in o)) throw new Error(fE);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, mE), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: Rv(e) } : t = { realtimeInput: bv(e) }, this.conn.send(JSON.stringify(t));
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
function yE(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function _E(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var Xu = 10;
function Qu(e) {
  var t, n, o;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let s = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (cn(a)) {
    s = !0;
    break;
  }
  if (!s) return !0;
  const r = (o = e?.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls;
  return r && (r < 0 || !Number.isInteger(r)) || r == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", r), !0) : !1;
}
function cn(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function vE(e) {
  var t, n, o;
  return (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((s) => cn(s))) !== null && o !== void 0 ? o : !1;
}
function Zu(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((o, s) => {
    if (cn(o)) return;
    const r = o;
    r.functionDeclarations && r.functionDeclarations.length > 0 && n.push(s);
  }), n;
}
function ju(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var SE = class extends ht {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = Ae(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = Ae(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const o = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: Cs.EMBED_CONTENT
        });
        return await this.embedContentInternal(o);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: Cs.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, o, s, r, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !vE(t) || Qu(t.config)) return await this.generateContentInternal(u);
      const c = Zu(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, p;
      const f = Ae(u.contents), h = (s = (o = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && s !== void 0 ? s : Xu;
      let m = 0;
      for (; m < h && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const v of (a = (r = t.config) === null || r === void 0 ? void 0 : r.tools) !== null && a !== void 0 ? a : []) if (cn(v)) {
          const w = await v.callTool(d.functionCalls);
          _.push(...w);
        }
        m++, p = {
          role: "user",
          parts: _
        }, u.contents = Ae(u.contents), u.contents.push(g), u.contents.push(p), ju(u.config) && (f.push(g), f.push(p));
      }
      return ju(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, o, s, r, a;
      if (this.maybeMoveToResponseJsonSchem(t), Qu(t.config)) {
        const p = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(p);
      }
      const u = Zu(t);
      if (u.length > 0) {
        const p = u.map((f) => `tools[${f}]`).join(", ");
        throw new Error(`Incompatible tools found at ${p}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
      }
      const c = (s = (o = (n = t?.config) === null || n === void 0 ? void 0 : n.toolConfig) === null || o === void 0 ? void 0 : o.functionCallingConfig) === null || s === void 0 ? void 0 : s.streamFunctionCallArguments, d = (a = (r = t?.config) === null || r === void 0 ? void 0 : r.automaticFunctionCalling) === null || a === void 0 ? void 0 : a.disable;
      if (c && !d) throw new Error("Running in streaming mode with 'streamFunctionCallArguments' enabled, this feature is not compatible with automatic function calling (AFC). Please set 'config.automaticFunctionCalling.disable' to true to disable AFC or leave 'config.toolConfig.functionCallingConfig.streamFunctionCallArguments' to be undefined or set to false to disable streaming function call arguments feature.");
      return await this.processAfcStream(t);
    }, this.generateImages = async (t) => await this.generateImagesInternal(t).then((n) => {
      var o;
      let s;
      const r = [];
      if (n?.generatedImages) for (const u of n.generatedImages) u && u?.safetyAttributes && ((o = u?.safetyAttributes) === null || o === void 0 ? void 0 : o.contentType) === "Positive Prompt" ? s = u?.safetyAttributes : r.push(u);
      let a;
      return s ? a = {
        generatedImages: r,
        positivePromptSafetyAttributes: s,
        sdkHttpResponse: n.sdkHttpResponse
      } : a = {
        generatedImages: r,
        sdkHttpResponse: n.sdkHttpResponse
      }, a;
    }), this.list = async (t) => {
      var n;
      const o = { config: Object.assign(Object.assign({}, { queryBase: !0 }), t?.config) };
      if (this.apiClient.isVertexAI() && !o.config.queryBase) {
        if (!((n = o.config) === null || n === void 0) && n.filter) throw new Error("Filtering tuned models list for Vertex AI is not currently supported");
        o.config.filter = "labels.tune-type:*";
      }
      return new Ht(pt.PAGED_ITEM_MODELS, (s) => this.listInternal(s), await this.listInternal(o), o);
    }, this.editImage = async (t) => {
      const n = {
        model: t.model,
        prompt: t.prompt,
        referenceImages: [],
        config: t.config
      };
      return t.referenceImages && t.referenceImages && (n.referenceImages = t.referenceImages.map((o) => o.toReferenceImageAPI())), await this.editImageInternal(n);
    }, this.upscaleImage = async (t) => {
      let n = {
        numberOfImages: 1,
        mode: "upscale"
      };
      t.config && (n = Object.assign(Object.assign({}, n), t.config));
      const o = {
        model: t.model,
        image: t.image,
        upscaleFactor: t.upscaleFactor,
        config: n
      };
      return await this.upscaleImageInternal(o);
    }, this.generateVideos = async (t) => {
      var n, o, s, r, a, u;
      if ((t.prompt || t.image || t.video) && t.source) throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      return this.apiClient.isVertexAI() || (!((n = t.video) === null || n === void 0) && n.uri && (!((o = t.video) === null || o === void 0) && o.videoBytes) ? t.video = {
        uri: t.video.uri,
        mimeType: t.video.mimeType
      } : !((r = (s = t.source) === null || s === void 0 ? void 0 : s.video) === null || r === void 0) && r.uri && (!((u = (a = t.source) === null || a === void 0 ? void 0 : a.video) === null || u === void 0) && u.videoBytes) && (t.source.video = {
        uri: t.source.video.uri,
        mimeType: t.source.video.mimeType
      })), await this.generateVideosInternal(t);
    };
  }
  maybeMoveToResponseJsonSchem(e) {
    e.config && e.config.responseSchema && (e.config.responseJsonSchema || Object.keys(e.config.responseSchema).includes("$schema") && (e.config.responseJsonSchema = e.config.responseSchema, delete e.config.responseSchema));
  }
  async processParamsMaybeAddMcpUsage(e) {
    var t, n, o;
    const s = (t = e.config) === null || t === void 0 ? void 0 : t.tools;
    if (!s) return e;
    const r = await Promise.all(s.map(async (u) => cn(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: r })
    };
    if (a.config.tools = r, e.config && e.config.tools && Lf(e.config.tools)) {
      const u = (o = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && o !== void 0 ? o : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), $f(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, o;
    const s = /* @__PURE__ */ new Map();
    for (const r of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (cn(r)) {
      const a = r, u = await a.tool();
      for (const c of (o = u.functionDeclarations) !== null && o !== void 0 ? o : []) {
        if (!c.name) throw new Error("Function declaration name is required.");
        if (s.has(c.name)) throw new Error(`Duplicate tool declaration name: ${c.name}`);
        s.set(c.name, a);
      }
    }
    return s;
  }
  async processAfcStream(e) {
    var t, n, o;
    const s = (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && o !== void 0 ? o : Xu;
    let r = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, p) {
      return Ye(this, arguments, function* () {
        for (var f, h, m, g, _, v; a < s; ) {
          r && (a++, r = !1);
          const x = yield J(c.processParamsMaybeAddMcpUsage(p)), M = yield J(c.generateContentStreamInternal(x)), C = [], L = [];
          try {
            for (var w = !0, A = (h = void 0, Xe(M)), b; b = yield J(A.next()), f = b.done, !f; w = !0) {
              g = b.value, w = !1;
              const P = g;
              if (yield yield J(P), P.candidates && (!((_ = P.candidates[0]) === null || _ === void 0) && _.content)) {
                L.push(P.candidates[0].content);
                for (const N of (v = P.candidates[0].content.parts) !== null && v !== void 0 ? v : []) if (a < s && N.functionCall) {
                  if (!N.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(N.functionCall.name)) {
                    const H = yield J(d.get(N.functionCall.name).callTool([N.functionCall]));
                    C.push(...H);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${N.functionCall.name}`);
                }
              }
            }
          } catch (P) {
            h = { error: P };
          } finally {
            try {
              !w && !f && (m = A.return) && (yield J(m.call(A)));
            } finally {
              if (h) throw h.error;
            }
          }
          if (C.length > 0) {
            r = !0;
            const P = new Fn();
            P.candidates = [{ content: {
              role: "user",
              parts: C
            } }], yield yield J(P);
            const N = [];
            N.push(...L), N.push({
              role: "user",
              parts: C
            }), p.contents = Ae(p.contents).concat(N);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Wu(this.apiClient, e);
      return a = k("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = zu(d), f = new Fn();
        return Object.assign(f, p), f;
      });
    } else {
      const c = Ju(this.apiClient, e);
      return a = k("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = Ku(d), f = new Fn();
        return Object.assign(f, p), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Wu(this.apiClient, e);
      return a = k("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), r.then(function(d) {
        return Ye(this, arguments, function* () {
          var p, f, h, m;
          try {
            for (var g = !0, _ = Xe(d), v; v = yield J(_.next()), p = v.done, !p; g = !0) {
              m = v.value, g = !1;
              const w = m, A = zu(yield J(w.json()), e);
              A.sdkHttpResponse = { headers: w.headers };
              const b = new Fn();
              Object.assign(b, A), yield yield J(b);
            }
          } catch (w) {
            f = { error: w };
          } finally {
            try {
              !g && !p && (h = _.return) && (yield J(h.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = Ju(this.apiClient, e);
      return a = k("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }), r.then(function(d) {
        return Ye(this, arguments, function* () {
          var p, f, h, m;
          try {
            for (var g = !0, _ = Xe(d), v; v = yield J(_.next()), p = v.done, !p; g = !0) {
              m = v.value, g = !1;
              const w = m, A = Ku(yield J(w.json()), e);
              A.sdkHttpResponse = { headers: w.headers };
              const b = new Fn();
              Object.assign(b, A), yield yield J(b);
            }
          } catch (w) {
            f = { error: w };
          } finally {
            try {
              !g && !p && (h = _.return) && (yield J(h.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    }
  }
  async embedContentInternal(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = uS(this.apiClient, e, e);
      return a = k(Ey(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = dS(d, e), f = new Au();
        return Object.assign(f, p), f;
      });
    } else {
      const c = lS(this.apiClient, e);
      return a = k("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = cS(d), f = new Au();
        return Object.assign(f, p), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ES(this.apiClient, e);
      return a = k("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = CS(d), f = new Iu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = TS(this.apiClient, e);
      return a = k("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = wS(d), f = new Iu();
        return Object.assign(f, p), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) {
      const a = sS(this.apiClient, e);
      return s = k("{model}:predict", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = rS(u), d = new Qg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) {
      const a = CT(this.apiClient, e);
      return s = k("{model}:predict", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = AT(u), d = new Zg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) {
      const a = sT(this.apiClient, e);
      return s = k("{model}:predict", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = rT(u), d = new jg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) {
      const a = dT(this.apiClient, e);
      return s = k("{model}:predict", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = fT(u), d = new ey();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = GS(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), r.then((d) => ti(d));
    } else {
      const c = qS(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), r.then((d) => ei(d));
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = XS(this.apiClient, e);
      return a = k("{models_url}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = ZS(d), f = new bu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = YS(this.apiClient, e);
      return a = k("{models_url}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = QS(d), f = new bu();
        return Object.assign(f, p), f;
      });
    }
  }
  async update(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ET(this.apiClient, e);
      return a = k("{model}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), r.then((d) => ti(d));
    } else {
      const c = TT(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), r.then((d) => ei(d));
    }
  }
  async delete(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = eS(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = nS(d), f = new Ru();
        return Object.assign(f, p), f;
      });
    } else {
      const c = jv(this.apiClient, e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = tS(d), f = new Ru();
        return Object.assign(f, p), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Xv(this.apiClient, e);
      return a = k("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = Zv(d), f = new Pu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = Yv(this.apiClient, e);
      return a = k("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = Qv(d), f = new Pu();
        return Object.assign(f, p), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) {
      const a = Ov(this.apiClient, e);
      return s = k("{model}:computeTokens", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = Hv(u), d = new ty();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = xS(this.apiClient, e);
      return a = k("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), r.then((d) => {
        const p = RS(d), f = new xu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = PS(this.apiClient, e);
      return a = k("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), r.then((d) => {
        const p = bS(d), f = new xu();
        return Object.assign(f, p), f;
      });
    }
  }
}, TE = class extends ht {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async getVideosOperation(e) {
    const t = e.operation, n = e.config;
    if (t.name === void 0 || t.name === "") throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const o = t.name.split("/operations/")[0];
      let s;
      n && "httpOptions" in n && (s = n.httpOptions);
      const r = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: o,
        config: { httpOptions: s }
      });
      return t._fromAPIResponse({
        apiResponse: r,
        _isVertexAI: !0
      });
    } else {
      const o = await this.getVideosOperationInternal({
        operationName: t.name,
        config: n
      });
      return t._fromAPIResponse({
        apiResponse: o,
        _isVertexAI: !1
      });
    }
  }
  async get(e) {
    const t = e.operation, n = e.config;
    if (t.name === void 0 || t.name === "") throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const o = t.name.split("/operations/")[0];
      let s;
      n && "httpOptions" in n && (s = n.httpOptions);
      const r = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: o,
        config: { httpOptions: s }
      });
      return t._fromAPIResponse({
        apiResponse: r,
        _isVertexAI: !0
      });
    } else {
      const o = await this.getVideosOperationInternal({
        operationName: t.name,
        config: n
      });
      return t._fromAPIResponse({
        apiResponse: o,
        _isVertexAI: !1
      });
    }
  }
  async getVideosOperationInternal(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Jg(e);
      return a = k("{operationName}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), r;
    } else {
      const c = Vg(e);
      return a = k("{operationName}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json()), r;
    }
  }
  async fetchPredictVideosOperationInternal(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) {
      const a = $g(e);
      return s = k("{resourceName}:fetchPredictOperation", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o;
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
};
function ec(e) {
  const t = {};
  if (i(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function EE(e) {
  const t = {}, n = i(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), i(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (i(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (i(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (i(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (i(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function wE(e) {
  const t = {}, n = i(e, ["data"]);
  if (n != null && l(t, ["data"], n), i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = i(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function CE(e) {
  const t = {}, n = i(e, ["parts"]);
  if (n != null) {
    let s = n;
    Array.isArray(s) && (s = s.map((r) => kE(r))), l(t, ["parts"], s);
  }
  const o = i(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function AE(e, t, n) {
  const o = {}, s = i(t, ["expireTime"]);
  n !== void 0 && s != null && l(n, ["expireTime"], s);
  const r = i(t, ["newSessionExpireTime"]);
  n !== void 0 && r != null && l(n, ["newSessionExpireTime"], r);
  const a = i(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = i(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], NE(e, u));
  const c = i(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), o;
}
function IE(e, t) {
  const n = {}, o = i(t, ["config"]);
  return o != null && l(n, ["config"], AE(e, o, n)), n;
}
function bE(e) {
  const t = {};
  if (i(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = i(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = i(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function RE(e) {
  const t = {}, n = i(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = i(e, ["args"]);
  o != null && l(t, ["args"], o);
  const s = i(e, ["name"]);
  if (s != null && l(t, ["name"], s), i(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (i(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function PE(e) {
  const t = {}, n = i(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], EE(n));
  const o = i(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function xE(e) {
  const t = {}, n = i(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), i(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (i(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = i(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function ME(e, t) {
  const n = {}, o = i(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], o);
  const s = i(e, ["responseModalities"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], s);
  const r = i(e, ["temperature"]);
  t !== void 0 && r != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], r);
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
  const p = i(e, ["seed"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], p);
  const f = i(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], Yi(f));
  const h = i(e, ["thinkingConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], h);
  const m = i(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = i(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], CE(de(g)));
  const _ = i(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let P = yn(_);
    Array.isArray(P) && (P = P.map((N) => LE(gn(N)))), l(t, ["setup", "tools"], P);
  }
  const v = i(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], UE(v));
  const w = i(e, ["inputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "inputAudioTranscription"], ec(w));
  const A = i(e, ["outputAudioTranscription"]);
  t !== void 0 && A != null && l(t, ["setup", "outputAudioTranscription"], ec(A));
  const b = i(e, ["realtimeInputConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "realtimeInputConfig"], b);
  const x = i(e, ["contextWindowCompression"]);
  t !== void 0 && x != null && l(t, ["setup", "contextWindowCompression"], x);
  const M = i(e, ["proactivity"]);
  if (t !== void 0 && M != null && l(t, ["setup", "proactivity"], M), i(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const C = i(e, ["avatarConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "avatarConfig"], C);
  const L = i(e, ["safetySettings"]);
  if (t !== void 0 && L != null) {
    let P = L;
    Array.isArray(P) && (P = P.map((N) => DE(N))), l(t, ["setup", "safetySettings"], P);
  }
  return n;
}
function NE(e, t) {
  const n = {}, o = i(t, ["model"]);
  o != null && l(n, ["setup", "model"], Y(e, o));
  const s = i(t, ["config"]);
  return s != null && l(n, ["config"], ME(s, n)), n;
}
function kE(e) {
  const t = {}, n = i(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = i(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const s = i(e, ["executableCode"]);
  s != null && l(t, ["executableCode"], s);
  const r = i(e, ["fileData"]);
  r != null && l(t, ["fileData"], bE(r));
  const a = i(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], RE(a));
  const u = i(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = i(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], wE(c));
  const d = i(e, ["text"]);
  d != null && l(t, ["text"], d);
  const p = i(e, ["thought"]);
  p != null && l(t, ["thought"], p);
  const f = i(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const h = i(e, ["videoMetadata"]);
  h != null && l(t, ["videoMetadata"], h);
  const m = i(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = i(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = i(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function DE(e) {
  const t = {}, n = i(e, ["category"]);
  if (n != null && l(t, ["category"], n), i(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = i(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function UE(e) {
  const t = {}, n = i(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), i(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function LE(e) {
  const t = {};
  if (i(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = i(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = i(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const s = i(e, ["googleSearch"]);
  s != null && l(t, ["googleSearch"], xE(s));
  const r = i(e, ["googleMaps"]);
  r != null && l(t, ["googleMaps"], PE(r));
  const a = i(e, ["codeExecution"]);
  if (a != null && l(t, ["codeExecution"], a), i(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = i(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["functionDeclarations"], f);
  }
  const c = i(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), i(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = i(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const p = i(e, ["mcpServers"]);
  if (p != null) {
    let f = p;
    Array.isArray(f) && (f = f.map((h) => h)), l(t, ["mcpServers"], f);
  }
  return t;
}
function $E(e) {
  const t = [];
  for (const n in e) if (Object.prototype.hasOwnProperty.call(e, n)) {
    const o = e[n];
    if (typeof o == "object" && o != null && Object.keys(o).length > 0) {
      const s = Object.keys(o).map((r) => `${n}.${r}`);
      t.push(...s);
    } else t.push(n);
  }
  return t.join(",");
}
function FE(e, t) {
  let n = null;
  const o = e.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const r = o.setup;
    typeof r == "object" && r !== null ? (e.bidiGenerateContentSetup = r, n = r) : delete e.bidiGenerateContentSetup;
  } else o !== void 0 && delete e.bidiGenerateContentSetup;
  const s = e.fieldMask;
  if (n) {
    const r = $E(n);
    if (Array.isArray(t?.lockAdditionalFields) && t?.lockAdditionalFields.length === 0) r ? e.fieldMask = r : delete e.fieldMask;
    else if (t?.lockAdditionalFields && t.lockAdditionalFields.length > 0 && s !== null && Array.isArray(s) && s.length > 0) {
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
      s.length > 0 && (u = s.map((d) => a.includes(d) ? `generationConfig.${d}` : d));
      const c = [];
      r && c.push(r), u.length > 0 && c.push(...u), c.length > 0 ? e.fieldMask = c.join(",") : delete e.fieldMask;
    } else delete e.fieldMask;
  } else s !== null && Array.isArray(s) && s.length > 0 ? e.fieldMask = s.join(",") : delete e.fieldMask;
  return e;
}
var BE = class extends ht {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = IE(this.apiClient, e);
      s = k("auth_tokens", a._url), r = a._query, delete a.config, delete a._url, delete a._query;
      const u = FE(a, e.config);
      return o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), o.then((c) => c);
    }
  }
};
function qE(e, t) {
  const n = {}, o = i(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function GE(e) {
  const t = {}, n = i(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = i(e, ["config"]);
  return o != null && qE(o, t), t;
}
function OE(e) {
  const t = {}, n = i(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function HE(e, t) {
  const n = {}, o = i(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const s = i(e, ["pageToken"]);
  return t !== void 0 && s != null && l(t, ["_query", "pageToken"], s), n;
}
function VE(e) {
  const t = {}, n = i(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const o = i(e, ["config"]);
  return o != null && HE(o, t), t;
}
function JE(e) {
  const t = {}, n = i(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = i(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const s = i(e, ["documents"]);
  if (s != null) {
    let r = s;
    Array.isArray(r) && (r = r.map((a) => a)), l(t, ["documents"], r);
  }
  return t;
}
var WE = class extends ht {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Ht(pt.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = OE(e);
      return s = k("{name}", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const r = GE(e);
      o = k("{name}", r._url), s = r._query, delete r._url, delete r._query, await this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(r),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = VE(e);
      return s = k("{parent}/documents", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = JE(u), d = new ny();
        return Object.assign(d, c), d;
      });
    }
  }
}, KE = class extends ht {
  constructor(e, t = new WE(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Ht(pt.PAGED_ITEM_FILE_SEARCH_STORES, (o) => this.listInternal(o), await this.listInternal(n), n);
  }
  async uploadToFileSearchStore(e) {
    if (this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support uploading files to a file search store.");
    return this.apiClient.uploadFileToFileSearchStore(e.fileSearchStoreName, e.file, e.config);
  }
  async create(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = NT(e);
      return s = k("fileSearchStores", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async get(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = UT(e);
      return s = k("{name}", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let o = "", s = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const r = DT(e);
      o = k("{name}", r._url), s = r._query, delete r._url, delete r._query, await this.apiClient.request({
        path: o,
        queryParams: s,
        body: JSON.stringify(r),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = GT(e);
      return s = k("fileSearchStores", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = OT(u), d = new oy();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = HT(e);
      return s = k("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = VT(u), d = new sy();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = FT(e);
      return s = k("{file_search_store_name}:importFile", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = $T(u), d = new ry();
        return Object.assign(d, c), d;
      });
    }
  }
}, Bf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Bf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
}, zE = () => Bf();
function oi(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var si = (e) => {
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
}, He = class extends Error {
}, Ve = class ri extends He {
  constructor(t, n, o, s) {
    super(`${ri.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.error = n;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new Hs({
      message: o,
      cause: si(n)
    });
    const r = n;
    return t === 400 ? new Gf(t, r, o, s) : t === 401 ? new Of(t, r, o, s) : t === 403 ? new Hf(t, r, o, s) : t === 404 ? new Vf(t, r, o, s) : t === 409 ? new Jf(t, r, o, s) : t === 422 ? new Wf(t, r, o, s) : t === 429 ? new Kf(t, r, o, s) : t >= 500 ? new zf(t, r, o, s) : new ri(t, r, o, s);
  }
}, ii = class extends Ve {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Hs = class extends Ve {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, qf = class extends Hs {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Gf = class extends Ve {
}, Of = class extends Ve {
}, Hf = class extends Ve {
}, Vf = class extends Ve {
}, Jf = class extends Ve {
}, Wf = class extends Ve {
}, Kf = class extends Ve {
}, zf = class extends Ve {
}, YE = /^[a-z][a-z0-9+.-]*:/i, XE = (e) => YE.test(e), ai = (e) => (ai = Array.isArray, ai(e)), tc = ai;
function nc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function QE(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var ZE = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new He(`${e} must be an integer`);
  if (t < 0) throw new He(`${e} must be a positive integer`);
  return t;
}, jE = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, ew = (e) => new Promise((t) => setTimeout(t, e));
function tw() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Yf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function nw(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Yf({
    start() {
    },
    async pull(n) {
      const { done: o, value: s } = await t.next();
      o ? n.close() : n.enqueue(s);
    },
    async cancel() {
      var n;
      await ((n = t.return) === null || n === void 0 ? void 0 : n.call(t));
    }
  });
}
function Xf(e) {
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
async function ow(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const o = e.getReader(), s = o.cancel();
  o.releaseLock(), await s;
}
var sw = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function rw(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new He(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var iw = "0.0.1", Qf = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Sr(e, t, n) {
  return Qf(), new File(e, t ?? "unknown_file", n);
}
function aw(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var lw = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Zf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", uw = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Zf(e), cw = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function dw(e, t, n) {
  if (Qf(), e = await e, uw(e))
    return e instanceof File ? e : Sr([await e.arrayBuffer()], e.name);
  if (cw(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Sr(await li(s), t, n);
  }
  const o = await li(e);
  if (t || (t = aw(e)), !n?.type) {
    const s = o.find((r) => typeof r == "object" && "type" in r && r.type);
    typeof s == "string" && (n = Object.assign(Object.assign({}, n), { type: s }));
  }
  return Sr(o, t, n);
}
async function li(e) {
  var t, n, o, s, r;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (Zf(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (lw(e)) try {
    for (var u = !0, c = Xe(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      s = d.value, u = !1;
      const p = s;
      a.push(...await li(p));
    }
  } catch (p) {
    n = { error: p };
  } finally {
    try {
      !u && !t && (o = c.return) && await o.call(c);
    } finally {
      if (n) throw n.error;
    }
  }
  else {
    const p = (r = e?.constructor) === null || r === void 0 ? void 0 : r.name;
    throw new Error(`Unexpected data type: ${typeof e}${p ? `; constructor: ${p}` : ""}${fw(e)}`);
  }
  return a;
}
function fw(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Xi = class {
  constructor(e) {
    this._client = e;
  }
};
Xi._key = [];
function jf(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var oc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), pw = (e = jf) => (function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const r = [], a = n.reduce((p, f, h) => {
    var m, g, _;
    /[?#]/.test(f) && (s = !0);
    const v = o[h];
    let w = (s ? encodeURIComponent : e)("" + v);
    return h !== o.length && (v == null || typeof v == "object" && v.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = v.hasOwnProperty) !== null && m !== void 0 ? m : oc)) !== null && g !== void 0 ? g : oc)) === null || _ === void 0 ? void 0 : _.toString)) && (w = v + "", r.push({
      start: p.length + f.length,
      length: w.length,
      error: `Value of type ${Object.prototype.toString.call(v).slice(8, -1)} is not a valid path parameter`
    })), p + f + (h === o.length ? "" : w);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) {
    const p = d[0].startsWith("/"), f = p ? 1 : 0, h = p ? d[0].slice(1) : d[0];
    r.push({
      start: d.index + f,
      length: h.length,
      error: `Value "${h}" can't be safely passed as a path parameter`
    });
  }
  if (r.sort((p, f) => p.start - f.start), r.length > 0) {
    let p = 0;
    const f = r.reduce((h, m) => {
      const g = " ".repeat(m.start - p), _ = "^".repeat(m.length);
      return p = m.start + m.length, h + g + _;
    }, "");
    throw new He(`Path parameters result in path with invalid segments:
${r.map((h) => h.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), We = /* @__PURE__ */ pw(jf), ep = class extends Xi {
  create(e, t) {
    var n;
    const { api_version: o = this._client.apiVersion } = e, s = At(e, ["api_version"]);
    if ("model" in s && "agent_config" in s) throw new He("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in s && "generation_config" in s) throw new He("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(We`/${o}/interactions`, Object.assign(Object.assign({ body: s }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(We`/${o}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.post(We`/${o}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var o;
    const s = t ?? {}, { api_version: r = this._client.apiVersion } = s, a = At(s, ["api_version"]);
    return this._client.get(We`/${r}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (o = t?.stream) !== null && o !== void 0 ? o : !1 }));
  }
};
ep._key = Object.freeze(["interactions"]);
var tp = class extends ep {
}, np = class extends Xi {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: o } = e, s = At(e, ["api_version", "webhook_id"]);
    return this._client.post(We`/${n}/webhooks`, Object.assign({
      query: { webhook_id: o },
      body: s
    }, t));
  }
  update(e, t, n) {
    const { api_version: o = this._client.apiVersion, update_mask: s } = t, r = At(t, ["api_version", "update_mask"]);
    return this._client.patch(We`/${o}/webhooks/${e}`, Object.assign({
      query: { update_mask: s },
      body: r
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: o = this._client.apiVersion } = n, s = At(n, ["api_version"]);
    return this._client.get(We`/${o}/webhooks`, Object.assign({ query: s }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(We`/${o}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.get(We`/${o}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: o = this._client.apiVersion, body: s } = t ?? {};
    return this._client.post(We`/${o}/webhooks/${e}:ping`, Object.assign({ body: s }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const o = t ?? {}, { api_version: s = this._client.apiVersion } = o, r = At(o, ["api_version"]);
    return this._client.post(We`/${s}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: r }, n));
  }
};
np._key = Object.freeze(["webhooks"]);
var op = class extends np {
};
function hw(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var Ko;
function Qi(e) {
  let t;
  return (Ko ?? (t = new globalThis.TextEncoder(), Ko = t.encode.bind(t)))(e);
}
var zo;
function sc(e) {
  let t;
  return (zo ?? (t = new globalThis.TextDecoder(), zo = t.decode.bind(t)))(e);
}
var Vs = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Qi(e) : e;
    this.buffer = hw([this.buffer, n]);
    const o = [];
    let s;
    for (; (s = mw(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (s.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = s.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (s.index !== this.carriageReturnIndex + 1 || s.carriage)) {
        o.push(sc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const r = this.carriageReturnIndex !== null ? s.preceding - 1 : s.preceding, a = sc(this.buffer.subarray(0, r));
      o.push(a), this.buffer = this.buffer.subarray(s.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), o;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Vs.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Vs.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function mw(e, t) {
  const s = t ?? 0, r = e.indexOf(10, s), a = e.indexOf(13, s);
  if (r === -1 && a === -1) return null;
  let u;
  return r !== -1 && a !== -1 ? u = Math.min(r, a) : u = r !== -1 ? r : a, e[u] === 10 ? {
    preceding: u,
    index: u + 1,
    carriage: !1
  } : {
    preceding: u,
    index: u + 1,
    carriage: !0
  };
}
var Is = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, rc = (e, t, n) => {
  if (e) {
    if (QE(Is, e)) return e;
    Se(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Is))}`);
  }
};
function Jn() {
}
function Yo(e, t, n) {
  return !t || Is[e] > Is[n] ? Jn : t[e].bind(t);
}
var gw = {
  error: Jn,
  warn: Jn,
  info: Jn,
  debug: Jn
}, ic = /* @__PURE__ */ new WeakMap();
function Se(e) {
  var t;
  const n = e.logger, o = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return gw;
  const s = ic.get(n);
  if (s && s[0] === o) return s[1];
  const r = {
    error: Yo("error", n, o),
    warn: Yo("warn", n, o),
    info: Yo("info", n, o),
    debug: Yo("debug", n, o)
  };
  return ic.set(n, [o, r]), r;
}
var Mt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), yw = class Wn {
  constructor(t, n, o) {
    this.iterator = t, this.controller = n, this.client = o;
  }
  static fromSSEResponse(t, n, o) {
    let s = !1;
    const r = o ? Se(o) : console;
    function a() {
      return Ye(this, arguments, function* () {
        var c, d, p, f;
        if (s) throw new He("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        s = !0;
        let h = !1;
        try {
          try {
            for (var m = !0, g = Xe(_w(t, n)), _; _ = yield J(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const v = f;
              if (!h)
                if (v.data.startsWith("[DONE]")) {
                  h = !0;
                  continue;
                } else try {
                  yield yield J(JSON.parse(v.data));
                } catch (w) {
                  throw r.error("Could not parse message into JSON:", v.data), r.error("From chunk:", v.raw), w;
                }
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (p = g.return) && (yield J(p.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          h = !0;
        } catch (v) {
          if (oi(v)) return yield J(void 0);
          throw v;
        } finally {
          h || n.abort();
        }
      });
    }
    return new Wn(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    function r() {
      return Ye(this, arguments, function* () {
        var c, d, p, f;
        const h = new Vs(), m = Xf(t);
        try {
          for (var g = !0, _ = Xe(m), v; v = yield J(_.next()), c = v.done, !c; g = !0) {
            f = v.value, g = !1;
            const w = f;
            for (const A of h.decode(w)) yield yield J(A);
          }
        } catch (w) {
          d = { error: w };
        } finally {
          try {
            !g && !c && (p = _.return) && (yield J(p.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const w of h.flush()) yield yield J(w);
      });
    }
    function a() {
      return Ye(this, arguments, function* () {
        var c, d, p, f;
        if (s) throw new He("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        s = !0;
        let h = !1;
        try {
          try {
            for (var m = !0, g = Xe(r()), _; _ = yield J(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const v = f;
              h || v && (yield yield J(JSON.parse(v)));
            }
          } catch (v) {
            d = { error: v };
          } finally {
            try {
              !m && !c && (p = g.return) && (yield J(p.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          h = !0;
        } catch (v) {
          if (oi(v)) return yield J(void 0);
          throw v;
        } finally {
          h || n.abort();
        }
      });
    }
    return new Wn(a, n, o);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), s = (r) => ({ next: () => {
      if (r.length === 0) {
        const a = o.next();
        t.push(a), n.push(a);
      }
      return r.shift();
    } });
    return [new Wn(() => s(t), this.controller, this.client), new Wn(() => s(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Yf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: r } = await n.next();
          if (r) return o.close();
          const a = Qi(JSON.stringify(s) + `
`);
          o.enqueue(a);
        } catch (s) {
          o.error(s);
        }
      },
      async cancel() {
        var o;
        await ((o = n.return) === null || o === void 0 ? void 0 : o.call(n));
      }
    });
  }
};
function _w(e, t) {
  return Ye(this, arguments, function* () {
    var o, s, r, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new He("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new He("Attempted to iterate over a response with no body");
    const u = new Sw(), c = new Vs(), d = Xf(e.body);
    try {
      for (var p = !0, f = Xe(vw(d)), h; h = yield J(f.next()), o = h.done, !o; p = !0) {
        a = h.value, p = !1;
        const m = a;
        for (const g of c.decode(m)) {
          const _ = u.decode(g);
          _ && (yield yield J(_));
        }
      }
    } catch (m) {
      s = { error: m };
    } finally {
      try {
        !p && !o && (r = f.return) && (yield J(r.call(f)));
      } finally {
        if (s) throw s.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield J(g));
    }
  });
}
function vw(e) {
  return Ye(this, arguments, function* () {
    var n, o, s, r;
    try {
      for (var a = !0, u = Xe(e), c; c = yield J(u.next()), n = c.done, !n; a = !0) {
        r = c.value, a = !1;
        const d = r;
        d != null && (yield yield J(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? Qi(d) : d));
      }
    } catch (d) {
      o = { error: d };
    } finally {
      try {
        !a && !n && (s = u.return) && (yield J(s.call(u)));
      } finally {
        if (o) throw o.error;
      }
    }
  });
}
var Sw = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const s = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], s;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, o] = Tw(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Tw(e, t) {
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
async function Ew(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: r } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return Se(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : yw.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return Se(e).debug(`[${o}] response parsed`, Mt({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - r
  })), a;
}
var ww = class sp extends Promise {
  constructor(t, n, o = Ew) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, this.client = t;
  }
  _thenUnwrap(t) {
    return new sp(this.client, this.responsePromise, async (n, o) => t(await this.parseResponse(n, o), o));
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
}, rp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* Cw(e) {
  if (!e) return;
  if (rp in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const r of s) yield [r, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : tc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const r = tc(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of r)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var Bn = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [r, a] of Cw(o)) {
      const u = r.toLowerCase();
      s.has(u) || (t.delete(r), s.add(u)), a === null ? (t.delete(r), n.add(u)) : (t.append(r, a), n.delete(u));
    }
  }
  return {
    [rp]: !0,
    values: t,
    nulls: n
  };
}, Tr = (e) => {
  var t, n, o, s, r;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((r = (s = (o = globalThis.Deno.env) === null || o === void 0 ? void 0 : o.get) === null || s === void 0 ? void 0 : s.call(o, e)) === null || r === void 0 ? void 0 : r.trim()) || void 0;
}, ip, ap = class lp {
  constructor(t) {
    var n, o, s, r, a, u, c, { baseURL: d = Tr("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: p = (n = Tr("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, h = At(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: p,
      apiVersion: f
    }, h), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (o = m.timeout) !== null && o !== void 0 ? o : lp.DEFAULT_TIMEOUT, this.logger = (s = m.logger) !== null && s !== void 0 ? s : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (a = (r = rc(m.logLevel, "ClientOptions.logLevel", this)) !== null && r !== void 0 ? r : rc(Tr("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : tw(), this.encoder = sw, this._options = m, this.apiKey = p, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = Bn([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return Bn([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return Bn([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return rw(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${iw}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${zE()}`;
  }
  makeStatusError(t, n, o, s) {
    return Ve.generate(t, n, o, s);
  }
  buildURL(t, n, o) {
    const s = !this.baseURLOverridden() && o || this.baseURL, r = XE(t) ? new URL(t) : new URL(s + (s.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(r.searchParams);
    return (!nc(a) || !nc(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (r.search = this.stringifyQuery(n)), r.toString();
  }
  async prepareOptions(t) {
    if (this.clientAdapter && this.clientAdapter.isVertexAI() && !t.path.startsWith(`/${this.apiVersion}/projects/`)) {
      const n = t.path.slice(this.apiVersion.length + 1);
      t.path = `/${this.apiVersion}/projects/${this.clientAdapter.getProject()}/locations/${this.clientAdapter.getLocation()}${n}`;
    }
  }
  async prepareRequest(t, { url: n, options: o }) {
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
  methodRequest(t, n, o) {
    return this.request(Promise.resolve(o).then((s) => Object.assign({
      method: t,
      path: n
    }, s)));
  }
  request(t, n = null) {
    return new ww(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, o) {
    var s, r, a;
    const u = await t, c = (s = u.maxRetries) !== null && s !== void 0 ? s : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: p, timeout: f } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: p,
      options: u
    });
    const h = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = o === void 0 ? "" : `, retryOf: ${o}`, g = Date.now();
    if (Se(this).debug(`[${h}] sending request`, Mt({
      retryOfRequestLogID: o,
      method: u.method,
      url: p,
      options: u,
      headers: d.headers
    })), !((r = u.signal) === null || r === void 0) && r.aborted) throw new ii();
    const _ = new AbortController(), v = await this.fetchWithTimeout(p, d, f, _).catch(si), w = Date.now();
    if (v instanceof globalThis.Error) {
      const b = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new ii();
      const x = oi(v) || /timed? ?out/i.test(String(v) + ("cause" in v ? String(v.cause) : ""));
      if (n)
        return Se(this).info(`[${h}] connection ${x ? "timed out" : "failed"} - ${b}`), Se(this).debug(`[${h}] connection ${x ? "timed out" : "failed"} (${b})`, Mt({
          retryOfRequestLogID: o,
          url: p,
          durationMs: w - g,
          message: v.message
        })), this.retryRequest(u, n, o ?? h);
      throw Se(this).info(`[${h}] connection ${x ? "timed out" : "failed"} - error; no more retries left`), Se(this).debug(`[${h}] connection ${x ? "timed out" : "failed"} (error; no more retries left)`, Mt({
        retryOfRequestLogID: o,
        url: p,
        durationMs: w - g,
        message: v.message
      })), x ? new qf() : new Hs({ cause: v });
    }
    const A = `[${h}${m}] ${d.method} ${p} ${v.ok ? "succeeded" : "failed"} with status ${v.status} in ${w - g}ms`;
    if (!v.ok) {
      const b = await this.shouldRetry(v);
      if (n && b) {
        const P = `retrying, ${n} attempts remaining`;
        return await ow(v.body), Se(this).info(`${A} - ${P}`), Se(this).debug(`[${h}] response error (${P})`, Mt({
          retryOfRequestLogID: o,
          url: v.url,
          status: v.status,
          headers: v.headers,
          durationMs: w - g
        })), this.retryRequest(u, n, o ?? h, v.headers);
      }
      const x = b ? "error; no more retries left" : "error; not retryable";
      Se(this).info(`${A} - ${x}`);
      const M = await v.text().catch((P) => si(P).message), C = jE(M), L = C ? void 0 : M;
      throw Se(this).debug(`[${h}] response error (${x})`, Mt({
        retryOfRequestLogID: o,
        url: v.url,
        status: v.status,
        headers: v.headers,
        message: L,
        durationMs: Date.now() - g
      })), this.makeStatusError(v.status, C, L, v.headers);
    }
    return Se(this).info(A), Se(this).debug(`[${h}] response start`, Mt({
      retryOfRequestLogID: o,
      url: v.url,
      status: v.status,
      headers: v.headers,
      durationMs: w - g
    })), {
      response: v,
      options: u,
      controller: _,
      requestLogID: h,
      retryOfRequestLogID: o,
      startTime: g
    };
  }
  async fetchWithTimeout(t, n, o, s) {
    const r = n || {}, { signal: a, method: u } = r, c = At(r, ["signal", "method"]), d = this._makeAbort(s);
    a && a.addEventListener("abort", d, { once: !0 });
    const p = setTimeout(d, o), f = globalThis.ReadableStream && c.body instanceof globalThis.ReadableStream || typeof c.body == "object" && c.body !== null && Symbol.asyncIterator in c.body, h = Object.assign(Object.assign(Object.assign({ signal: s.signal }, f ? { duplex: "half" } : {}), { method: "GET" }), c);
    u && (h.method = u.toUpperCase());
    try {
      return await this.fetch.call(void 0, t, h);
    } finally {
      clearTimeout(p);
    }
  }
  async shouldRetry(t) {
    const n = t.headers.get("x-should-retry");
    return n === "true" ? !0 : n === "false" ? !1 : t.status === 408 || t.status === 409 || t.status === 429 || t.status >= 500;
  }
  async retryRequest(t, n, o, s) {
    var r;
    let a;
    const u = s?.get("retry-after-ms");
    if (u) {
      const d = parseFloat(u);
      Number.isNaN(d) || (a = d);
    }
    const c = s?.get("retry-after");
    if (c && !a) {
      const d = parseFloat(c);
      Number.isNaN(d) ? a = Date.parse(c) - Date.now() : a = d * 1e3;
    }
    if (a === void 0) {
      const d = (r = t.maxRetries) !== null && r !== void 0 ? r : this.maxRetries;
      a = this.calculateDefaultRetryTimeoutMillis(n, d);
    }
    return await ew(a), this.makeRequest(t, n - 1, o);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const r = n - t;
    return Math.min(0.5 * Math.pow(2, r), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var o, s, r;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: p } = a, f = this.buildURL(c, d, p);
    "timeout" in a && ZE("timeout", a.timeout), a.timeout = (o = a.timeout) !== null && o !== void 0 ? o : this.timeout;
    const { bodyHeaders: h, body: m } = this.buildBody({ options: a }), g = await this.buildHeaders({
      options: t,
      method: u,
      bodyHeaders: h,
      retryCount: n
    });
    return {
      req: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
        method: u,
        headers: g
      }, a.signal && { signal: a.signal }), globalThis.ReadableStream && m instanceof globalThis.ReadableStream && { duplex: "half" }), m && { body: m }), (s = this.fetchOptions) !== null && s !== void 0 ? s : {}), (r = a.fetchOptions) !== null && r !== void 0 ? r : {}),
      url: f,
      timeout: a.timeout
    };
  }
  async buildHeaders({ options: t, method: n, bodyHeaders: o, retryCount: s }) {
    let r = {};
    this.idempotencyHeader && n !== "get" && (t.idempotencyKey || (t.idempotencyKey = this.defaultIdempotencyKey()), r[this.idempotencyHeader] = t.idempotencyKey);
    const a = await this.authHeaders(t);
    let u = Bn([
      r,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent()
      },
      this._options.defaultHeaders,
      o,
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
    const o = Bn([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && o.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: nw(t)
    } : typeof t == "object" && o.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: o
    });
  }
};
ap.DEFAULT_TIMEOUT = 6e4;
var le = class extends ap {
  constructor() {
    super(...arguments), this.interactions = new tp(this), this.webhooks = new op(this);
  }
};
ip = le;
le.GeminiNextGenAPIClient = ip;
le.GeminiNextGenAPIClientError = He;
le.APIError = Ve;
le.APIConnectionError = Hs;
le.APIConnectionTimeoutError = qf;
le.APIUserAbortError = ii;
le.NotFoundError = Vf;
le.ConflictError = Jf;
le.RateLimitError = Kf;
le.BadRequestError = Gf;
le.AuthenticationError = Of;
le.InternalServerError = zf;
le.PermissionDeniedError = Hf;
le.UnprocessableEntityError = Wf;
le.toFile = dw;
le.Interactions = tp;
le.Webhooks = op;
function Aw(e, t) {
  const n = {}, o = i(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function Iw(e, t) {
  const n = {}, o = i(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function bw(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function Rw(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function Pw(e, t, n) {
  const o = {};
  if (i(e, ["validationDataset"]) !== void 0) throw new Error("validationDataset parameter is not supported in Gemini API.");
  const s = i(e, ["tunedModelDisplayName"]);
  if (t !== void 0 && s != null && l(t, ["displayName"], s), i(e, ["description"]) !== void 0) throw new Error("description parameter is not supported in Gemini API.");
  const r = i(e, ["epochCount"]);
  t !== void 0 && r != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "epochCount"
  ], r);
  const a = i(e, ["learningRateMultiplier"]);
  if (a != null && l(o, [
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
  return o;
}
function xw(e, t, n) {
  const o = {};
  let s = i(n, ["config", "method"]);
  if (s === void 0 && (s = "SUPERVISED_FINE_TUNING"), s === "SUPERVISED_FINE_TUNING") {
    const C = i(e, ["validationDataset"]);
    t !== void 0 && C != null && l(t, ["supervisedTuningSpec"], Er(C));
  } else if (s === "PREFERENCE_TUNING") {
    const C = i(e, ["validationDataset"]);
    t !== void 0 && C != null && l(t, ["preferenceOptimizationSpec"], Er(C));
  } else if (s === "DISTILLATION") {
    const C = i(e, ["validationDataset"]);
    t !== void 0 && C != null && l(t, ["distillationSpec"], Er(C));
  }
  const r = i(e, ["tunedModelDisplayName"]);
  t !== void 0 && r != null && l(t, ["tunedModelDisplayName"], r);
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
  let p = i(n, ["config", "method"]);
  if (p === void 0 && (p = "SUPERVISED_FINE_TUNING"), p === "SUPERVISED_FINE_TUNING") {
    const C = i(e, ["adapterSize"]);
    t !== void 0 && C != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], C);
  } else if (p === "PREFERENCE_TUNING") {
    const C = i(e, ["adapterSize"]);
    t !== void 0 && C != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], C);
  } else if (p === "DISTILLATION") {
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
  const h = i(e, ["customBaseModel"]);
  t !== void 0 && h != null && l(t, ["customBaseModel"], h);
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
  const A = i(e, ["tunedTeacherModelSource"]);
  t !== void 0 && A != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], A);
  const b = i(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && b != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], b);
  const x = i(e, ["outputUri"]);
  t !== void 0 && x != null && l(t, ["outputUri"], x);
  const M = i(e, ["encryptionSpec"]);
  return t !== void 0 && M != null && l(t, ["encryptionSpec"], M), o;
}
function Mw(e, t) {
  const n = {}, o = i(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = i(e, ["preTunedModel"]);
  s != null && l(n, ["preTunedModel"], s);
  const r = i(e, ["trainingDataset"]);
  r != null && Ow(r);
  const a = i(e, ["config"]);
  return a != null && Pw(a, n), n;
}
function Nw(e, t) {
  const n = {}, o = i(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const s = i(e, ["preTunedModel"]);
  s != null && l(n, ["preTunedModel"], s);
  const r = i(e, ["trainingDataset"]);
  r != null && Hw(r, n, t);
  const a = i(e, ["config"]);
  return a != null && xw(a, n, t), n;
}
function kw(e, t) {
  const n = {}, o = i(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function Dw(e, t) {
  const n = {}, o = i(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function Uw(e, t, n) {
  const o = {}, s = i(e, ["pageSize"]);
  t !== void 0 && s != null && l(t, ["_query", "pageSize"], s);
  const r = i(e, ["pageToken"]);
  t !== void 0 && r != null && l(t, ["_query", "pageToken"], r);
  const a = i(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function Lw(e, t, n) {
  const o = {}, s = i(e, ["pageSize"]);
  t !== void 0 && s != null && l(t, ["_query", "pageSize"], s);
  const r = i(e, ["pageToken"]);
  t !== void 0 && r != null && l(t, ["_query", "pageToken"], r);
  const a = i(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function $w(e, t) {
  const n = {}, o = i(e, ["config"]);
  return o != null && Uw(o, n), n;
}
function Fw(e, t) {
  const n = {}, o = i(e, ["config"]);
  return o != null && Lw(o, n), n;
}
function Bw(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const r = i(e, ["tunedModels"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => up(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function qw(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["nextPageToken"]);
  s != null && l(n, ["nextPageToken"], s);
  const r = i(e, ["tuningJobs"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => ui(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function Gw(e, t) {
  const n = {}, o = i(e, ["name"]);
  o != null && l(n, ["model"], o);
  const s = i(e, ["name"]);
  return s != null && l(n, ["endpoint"], s), n;
}
function Ow(e, t) {
  const n = {};
  if (i(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (i(e, ["vertexDatasetResource"]) !== void 0) throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");
  const o = i(e, ["examples"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((r) => r)), l(n, ["examples", "examples"], s);
  }
  return n;
}
function Hw(e, t, n) {
  const o = {};
  let s = i(n, ["config", "method"]);
  if (s === void 0 && (s = "SUPERVISED_FINE_TUNING"), s === "SUPERVISED_FINE_TUNING") {
    const a = i(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (s === "PREFERENCE_TUNING") {
    const a = i(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  } else if (s === "DISTILLATION") {
    const a = i(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["distillationSpec", "promptDatasetUri"], a);
  }
  let r = i(n, ["config", "method"]);
  if (r === void 0 && (r = "SUPERVISED_FINE_TUNING"), r === "SUPERVISED_FINE_TUNING") {
    const a = i(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (r === "PREFERENCE_TUNING") {
    const a = i(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  } else if (r === "DISTILLATION") {
    const a = i(e, ["vertexDatasetResource"]);
    t !== void 0 && a != null && l(t, ["distillationSpec", "promptDatasetUri"], a);
  }
  if (i(e, ["examples"]) !== void 0) throw new Error("examples parameter is not supported in Vertex AI.");
  return o;
}
function up(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["name"]);
  s != null && l(n, ["name"], s);
  const r = i(e, ["state"]);
  r != null && l(n, ["state"], _f(r));
  const a = i(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const u = i(e, ["tuningTask", "startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = i(e, ["tuningTask", "completeTime"]);
  c != null && l(n, ["endTime"], c);
  const d = i(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const p = i(e, ["description"]);
  p != null && l(n, ["description"], p);
  const f = i(e, ["baseModel"]);
  f != null && l(n, ["baseModel"], f);
  const h = i(e, ["_self"]);
  return h != null && l(n, ["tunedModel"], Gw(h)), n;
}
function ui(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["name"]);
  s != null && l(n, ["name"], s);
  const r = i(e, ["state"]);
  r != null && l(n, ["state"], _f(r));
  const a = i(e, ["createTime"]);
  a != null && l(n, ["createTime"], a);
  const u = i(e, ["startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = i(e, ["endTime"]);
  c != null && l(n, ["endTime"], c);
  const d = i(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const p = i(e, ["error"]);
  p != null && l(n, ["error"], p);
  const f = i(e, ["description"]);
  f != null && l(n, ["description"], f);
  const h = i(e, ["baseModel"]);
  h != null && l(n, ["baseModel"], h);
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
  const A = i(e, ["tuningDataStats"]);
  A != null && l(n, ["tuningDataStats"], A);
  const b = i(e, ["encryptionSpec"]);
  b != null && l(n, ["encryptionSpec"], b);
  const x = i(e, ["partnerModelTuningSpec"]);
  x != null && l(n, ["partnerModelTuningSpec"], x);
  const M = i(e, ["customBaseModel"]);
  M != null && l(n, ["customBaseModel"], M);
  const C = i(e, ["evaluateDatasetRuns"]);
  if (C != null) {
    let Te = C;
    Array.isArray(Te) && (Te = Te.map((ye) => ye)), l(n, ["evaluateDatasetRuns"], Te);
  }
  const L = i(e, ["experiment"]);
  L != null && l(n, ["experiment"], L);
  const P = i(e, ["fullFineTuningSpec"]);
  P != null && l(n, ["fullFineTuningSpec"], P);
  const N = i(e, ["labels"]);
  N != null && l(n, ["labels"], N);
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
  const he = i(e, ["distillationSamplingSpec"]);
  he != null && l(n, ["distillationSamplingSpec"], he);
  const $e = i(e, ["tuningJobMetadata"]);
  return $e != null && l(n, ["tuningJobMetadata"], $e), n;
}
function Vw(e, t) {
  const n = {}, o = i(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const s = i(e, ["name"]);
  s != null && l(n, ["name"], s);
  const r = i(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const a = i(e, ["done"]);
  a != null && l(n, ["done"], a);
  const u = i(e, ["error"]);
  return u != null && l(n, ["error"], u), n;
}
function Er(e, t) {
  const n = {}, o = i(e, ["gcsUri"]);
  o != null && l(n, ["validationDatasetUri"], o);
  const s = i(e, ["vertexDatasetResource"]);
  return s != null && l(n, ["validationDatasetUri"], s), n;
}
var Jw = class extends ht {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ht(pt.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
      var n;
      if (this.apiClient.isVertexAI()) if (t.baseModel.startsWith("projects/")) {
        const o = { tunedModelName: t.baseModel };
        !((n = t.config) === null || n === void 0) && n.preTunedModelCheckpointId && (o.checkpointId = t.config.preTunedModelCheckpointId);
        const s = Object.assign(Object.assign({}, t), { preTunedModel: o });
        return s.baseModel = void 0, await this.tuneInternal(s);
      } else {
        const o = Object.assign({}, t);
        return await this.tuneInternal(o);
      }
      else {
        const o = Object.assign({}, t), s = await this.tuneMldevInternal(o);
        let r = "";
        return s.metadata !== void 0 && s.metadata.tunedModel !== void 0 ? r = s.metadata.tunedModel : s.name !== void 0 && s.name.includes("/operations/") && (r = s.name.split("/operations/")[0]), {
          name: r,
          state: Yr.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Dw(e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => ui(d));
    } else {
      const c = kw(e);
      return a = k("{name}", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => up(d));
    }
  }
  async listInternal(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Fw(e);
      return a = k("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = qw(d), f = new Mu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = $w(e);
      return a = k("tunedModels", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = Bw(d), f = new Mu();
        return Object.assign(f, p), f;
      });
    }
  }
  async cancel(e) {
    var t, n, o, s;
    let r, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Iw(e);
      return a = k("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = Rw(d), f = new Nu();
        return Object.assign(f, p), f;
      });
    } else {
      const c = Aw(e);
      return a = k("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, r = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (s = e.config) === null || s === void 0 ? void 0 : s.abortSignal
      }).then((d) => d.json().then((p) => {
        const f = p;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), r.then((d) => {
        const p = bw(d), f = new Nu();
        return Object.assign(f, p), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) {
      const a = Nw(e, e);
      return s = k("tuningJobs", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => ui(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let o, s = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Mw(e);
      return s = k("tunedModels", a._url), r = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: s,
        queryParams: r,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => Vw(u));
    }
  }
}, Ww = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, Kw = 1024 * 1024 * 8, zw = 3, Yw = 1e3, Xw = 2, bs = "x-goog-upload-status";
async function Qw(e, t, n, o) {
  var s;
  const r = await cp(e, t, n, o), a = await r?.json();
  if (((s = r?.headers) === null || s === void 0 ? void 0 : s[bs]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function Zw(e, t, n, o) {
  var s;
  const r = await cp(e, t, n, o), a = await r?.json();
  if (((s = r?.headers) === null || s === void 0 ? void 0 : s[bs]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = uf(a), c = new fy();
  return Object.assign(c, u), c;
}
async function cp(e, t, n, o) {
  var s, r, a;
  let u = t;
  const c = o?.baseUrl || ((s = n.clientOptions.httpOptions) === null || s === void 0 ? void 0 : s.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, p = 0, f = new Qr(new Response()), h = "upload";
  for (d = e.size; p < d; ) {
    const m = Math.min(Kw, d - p), g = e.slice(p, p + m);
    p + m >= d && (h += ", finalize");
    let _ = 0, v = Yw;
    for (; _ < zw; ) {
      const w = Object.assign(Object.assign({}, o?.headers || {}), {
        "X-Goog-Upload-Command": h,
        "X-Goog-Upload-Offset": String(p),
        "Content-Length": String(m)
      });
      if (f = await n.request({
        path: "",
        body: g,
        httpMethod: "POST",
        httpOptions: Object.assign(Object.assign({}, o), {
          apiVersion: "",
          baseUrl: u,
          headers: w
        })
      }), !((r = f?.headers) === null || r === void 0) && r[bs]) break;
      _++, await eC(v), v = v * Xw;
    }
    if (p += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[bs]) !== "active") break;
    if (d <= p) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function jw(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function eC(e) {
  return new Promise((t) => setTimeout(t, e));
}
var tC = class {
  async upload(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Qw(e, t, n, o);
  }
  async uploadToFileSearchStore(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await Zw(e, t, n, o);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await jw(e);
  }
}, nC = class {
  create(e, t, n) {
    return new oC(e, t, n);
  }
}, oC = class {
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
}, ac = "x-goog-api-key", sC = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(ac) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(ac, this.apiKey);
    }
  }
}, rC = "gl-node/", iC = class {
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
    const n = Ug(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const o = new sC(this.apiKey);
    this.apiClient = new eE({
      auth: o,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: rC + "web",
      uploader: new tC(),
      downloader: new Ww()
    }), this.models = new SE(this.apiClient), this.live = new hE(this.apiClient, o, new nC()), this.batches = new m_(this.apiClient), this.chats = new j_(this.models, this.apiClient), this.caches = new X_(this.apiClient), this.files = new dv(this.apiClient), this.operations = new TE(this.apiClient), this.authTokens = new BE(this.apiClient), this.tunings = new Jw(this.apiClient), this.fileSearchStores = new KE(this.apiClient);
  }
};
function lc(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function ro(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function $t(e) {
  return { text: String(e || "") };
}
function aC(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function lC(e) {
  if (typeof e == "string") return [$t(e)];
  if (!Array.isArray(e)) return [$t("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? $t(n.text || "") : n.type === "image_url" && n.image_url?.url ? aC(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [$t("")];
}
function uc() {
  return {
    role: "user",
    parts: [$t("")]
  };
}
function Co(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = ro(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function uC(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function cC(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function wr(e, t) {
  return e?.functionCall?.name ? [
    String(e.functionCall.id || ""),
    String(e.functionCall.name || ""),
    JSON.stringify(e.functionCall.args || {}),
    String(t)
  ].join("\0") : "";
}
function dC(e = [], t = "") {
  const n = e.map((c) => Co(c, "model")).filter(Boolean);
  if (!n.length) return null;
  const o = [...n].reverse().find((c) => uC(c)) || null, s = [...n].reverse().find((c) => cC(c)) || null, r = ro(o || s || n[n.length - 1]);
  if (!r?.parts?.length) return n[n.length - 1];
  if (s) {
    const c = /* @__PURE__ */ new Map();
    n.forEach((p) => {
      p.parts.forEach((f, h) => {
        const m = wr(f, h);
        if (!m) return;
        const g = c.get(m);
        (!g || f.thoughtSignature || !g.thoughtSignature) && c.set(m, ro(f));
      });
    });
    const d = /* @__PURE__ */ new Set();
    r.parts = r.parts.map((p, f) => {
      const h = wr(p, f);
      return h ? (d.add(h), c.get(h) || p) : p;
    }), s.parts.forEach((p, f) => {
      const h = wr(p, f);
      !h || d.has(h) || (r.parts.push(c.get(h) || ro(p)), d.add(h));
    });
  }
  const a = String(t || ""), u = r.parts.filter((c) => !(typeof c?.text == "string" && !c?.thought));
  return r.parts = a ? [{ text: a }, ...u] : u, r.parts.length ? r : n[n.length - 1];
}
function cc(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((o) => !o?.thought && typeof o?.text == "string" && o.text).map((o) => o.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function dc(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((o) => o?.functionCall || o).filter((o) => o && o.name);
  return (t.length ? t : n).map((o, s) => ({
    id: o.id || `google-tool-${s + 1}`,
    name: o.name || "",
    arguments: JSON.stringify(o.args || {})
  })).filter((o) => o.name);
}
function fC(e = [], t = []) {
  const n = Array.isArray(e) ? [...e] : [];
  return (Array.isArray(t) ? t : []).forEach((o) => {
    if (!o?.name) return;
    const s = [
      String(o.id || ""),
      String(o.name || ""),
      String(o.arguments || "")
    ].join("\0");
    n.some((r) => [
      String(r.id || ""),
      String(r.name || ""),
      String(r.arguments || "")
    ].join("\0") === s) || n.push(o);
  }), n;
}
function pC(e = []) {
  return {
    role: "user",
    parts: e.filter((t) => t && t.name).map((t) => ({ functionResponse: {
      name: t.name,
      response: t.response || {}
    } }))
  };
}
function hC(e) {
  switch (e) {
    case "high":
      return so.HIGH;
    case "medium":
      return so.MEDIUM;
    default:
      return so.LOW;
  }
}
function fc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function mC(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function gC(e) {
  const t = e?.providerPayload?.googleContent;
  return Co(t, "model");
}
function yC(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = gC(e);
    return n ? [n] : [];
  }
  return t.map((n) => Co(n, "model")).filter(Boolean);
}
function Zi(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => Co(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function _C(e) {
  const t = e?.candidates?.[0]?.content;
  return Zi(t ? [t] : []);
}
function vC(e) {
  return Zi(e ? [e] : []);
}
function dp(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? ro(e.history) || [] : [];
}
function SC(e, t = 0) {
  return dp(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => Co(n, "model")).filter(Boolean);
}
function TC(e) {
  const t = /* @__PURE__ */ new Map(), n = [], o = (e || []).filter((r) => r.role === "user" || r.role === "assistant" || r.role === "tool");
  o.forEach((r) => {
    (r.tool_calls || []).forEach((a) => {
      a.id && a.function?.name && t.set(a.id, a.function.name);
    });
  });
  for (let r = 0; r < o.length; r += 1) {
    const a = o[r];
    if (a.role === "tool") {
      const u = [];
      let c = r;
      for (; c < o.length && o[c].role === "tool"; ) {
        const d = o[c];
        u.push({ functionResponse: {
          name: String(d.toolName || d.tool_name || "").trim() || t.get(d.tool_call_id || "") || "tool_result",
          response: lc(d.content)
        } }), c += 1;
      }
      n.push({
        role: "user",
        parts: u
      }), r = c - 1;
      continue;
    }
    if (a.role === "assistant") {
      const u = yC(a);
      if (u.length) {
        n.push(...u);
        continue;
      }
    }
    if (a.role === "assistant" && Array.isArray(a.tool_calls) && a.tool_calls.length) {
      n.push({
        role: "model",
        parts: [...a.content ? [$t(a.content)] : [], ...a.tool_calls.map((u) => ({ functionCall: {
          name: u.function.name,
          args: lc(u.function.arguments)
        } }))]
      });
      continue;
    }
    n.push({
      role: a.role === "assistant" ? "model" : "user",
      parts: lC(a.content)
    });
  }
  if (!n.length) return {
    history: [],
    latestMessage: uc().parts
  };
  const s = n[n.length - 1];
  return s.role === "user" && s.parts?.length ? {
    history: n.slice(0, -1),
    latestMessage: s.parts
  } : {
    history: n,
    latestMessage: uc().parts
  };
}
function EC(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function pc(e, t) {
  const n = String(t || ""), o = String(e || "");
  return n ? !o || n.startsWith(o) ? n : o.endsWith(n) ? o : `${o}${n}` : o;
}
var wC = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.client = new iC({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e) {
    const t = TC(e.messages), n = Array.isArray(e.tools) ? e.tools : [], o = mC(e), s = {
      ...o ? { systemInstruction: o } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    return e.reasoning?.enabled && (s.thinkingConfig = {
      includeThoughts: !0,
      thinkingLevel: hC(e.reasoning.effort)
    }), n.length && (s.tools = [{ functionDeclarations: n.map((r) => ({
      name: r.function.name,
      description: r.function.description,
      parameters: r.function.parameters
    })) }]), n.length && e.toolChoice && e.toolChoice !== "auto" && e.toolChoice !== "none" && (s.toolConfig = { functionCallingConfig: { mode: zr.ANY } }), {
      createPayload: {
        model: this.config.model,
        history: t.history,
        config: s
      },
      sendPayload: { message: t.latestMessage }
    };
  }
  inspectRequest(e, t = {}) {
    const n = t.payload || this.buildChatPayload(e), o = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return ho({
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
      sdk: typeof e.onStreamProgress == "function" ? "client.chats.create(...).sendMessageStream" : "client.chats.create(...).sendMessage"
    });
  }
  inspectSendRequest(e, t) {
    const n = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return ho({
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
    let o, s, r, a = [], u = null;
    const c = { ...t }, d = typeof n.onStreamProgress == "function", p = dp(e).length;
    if (d) {
      const g = await e.sendMessageStream(c), _ = /* @__PURE__ */ new Map();
      let v = "", w = [], A = null;
      const b = [];
      for await (const x of g) {
        A = x;
        const M = x?.candidates?.[0]?.content;
        M?.parts?.length && b.push(M), fc(x).forEach((L, P) => {
          const N = `${L.label}:${P}`;
          _.set(N, pc(_.get(N) || "", L.text));
        }), w = (x.functionCalls || []).map((L, P) => ({
          id: L.id || `google-tool-${P + 1}`,
          name: L.name || "",
          arguments: JSON.stringify(L.args || {})
        })).filter((L) => L.name), a = fC(a, w.length ? w : dc(x));
        const C = cc(x);
        v = pc(v, C), EC(n, {
          text: v,
          thoughts: Array.from(_.values()).filter(Boolean).map((L, P) => ({
            label: `思考块 ${P + 1}`,
            text: L
          })),
          ...w.length ? {
            toolCalls: w,
            toolCallDraft: !0
          } : {}
        });
      }
      o = A || { functionCalls: w }, u = dC(b, v) || o?.candidates?.[0]?.content || null, s = Array.from(_.values()).filter(Boolean).map((x, M) => ({
        label: `思考块 ${M + 1}`,
        text: x
      })), r = v;
    } else
      o = await e.sendMessage(c), s = fc(o), r = cc(o);
    const f = dc(o), h = f.length ? f : a, m = SC(e, p);
    return {
      text: r,
      toolCalls: h,
      thoughts: s,
      finishReason: o.candidates?.[0]?.finishReason || "STOP",
      model: o.modelVersion || this.config.model,
      provider: "google",
      providerPayload: Zi(m) || vC(u) || _C(o)
    };
  }
  async chat(e) {
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const o = { message: pC(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, o, e),
        requestInspection: this.inspectSendRequest(o, e)
      };
    }
    const t = String(e.finalAnswerReminderText || "").trim();
    if (t) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const o = { message: [$t(t)] };
      return {
        ...await this.sendThroughChat(this.activeChat, o, e),
        requestInspection: this.inspectSendRequest(o, e)
      };
    }
    const n = this.createChat(e);
    return this.activeChat = n.chat, {
      ...await this.sendThroughChat(this.activeChat, n.sendPayload, e),
      requestInspection: n.requestInspection
    };
  }
};
function G(e, t, n, o, s) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !s) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !s : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? s.call(e, n) : s ? s.value = n : t.set(e, n), n;
}
function E(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var fp = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return fp = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function ci(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var di = (e) => {
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
}, q = class extends Error {
}, me = class fi extends q {
  constructor(t, n, o, s) {
    super(`${fi.makeMessage(t, n, o)}`), this.status = t, this.headers = s, this.requestID = s?.get("x-request-id"), this.error = n;
    const r = n;
    this.code = r?.code, this.param = r?.param, this.type = r?.type;
  }
  static makeMessage(t, n, o) {
    const s = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && s ? `${t} ${s}` : t ? `${t} status code (no body)` : s || "(no status code or body)";
  }
  static generate(t, n, o, s) {
    if (!t || !s) return new Js({
      message: o,
      cause: di(n)
    });
    const r = n?.error;
    return t === 400 ? new pp(t, r, o, s) : t === 401 ? new hp(t, r, o, s) : t === 403 ? new mp(t, r, o, s) : t === 404 ? new gp(t, r, o, s) : t === 409 ? new yp(t, r, o, s) : t === 422 ? new _p(t, r, o, s) : t === 429 ? new vp(t, r, o, s) : t >= 500 ? new Sp(t, r, o, s) : new fi(t, r, o, s);
  }
}, Oe = class extends me {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Js = class extends me {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, ji = class extends Js {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, pp = class extends me {
}, hp = class extends me {
}, mp = class extends me {
}, gp = class extends me {
}, yp = class extends me {
}, _p = class extends me {
}, vp = class extends me {
}, Sp = class extends me {
}, Tp = class extends q {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, Ep = class extends q {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Kn = class extends Error {
  constructor(e) {
    super(e);
  }
}, wp = class extends me {
  constructor(e, t, n) {
    let o = "OAuth2 authentication error", s;
    if (t && typeof t == "object") {
      const r = t;
      s = r.error;
      const a = r.error_description;
      a && typeof a == "string" ? o = a : s && (o = s);
    }
    super(e, t, o, n), this.error_code = s;
  }
}, CC = class extends q {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, AC = /^[a-z][a-z0-9+.-]*:/i, IC = (e) => AC.test(e), Ce = (e) => (Ce = Array.isArray, Ce(e)), hc = Ce;
function Cp(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function mc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function bC(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Cr(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var RC = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new q(`${e} must be an integer`);
  if (t < 0) throw new q(`${e} must be a positive integer`);
  return t;
}, PC = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Ao = (e) => new Promise((t) => setTimeout(t, e)), en = "6.34.0", xC = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function MC() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var NC = () => {
  const e = MC();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": en,
    "X-Stainless-OS": yc(Deno.build.os),
    "X-Stainless-Arch": gc(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": en,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": en,
    "X-Stainless-OS": yc(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": gc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = kC();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": en,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": en,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function kC() {
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
var gc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", yc = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), _c, DC = () => _c ?? (_c = NC());
function Ap() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Ip(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function bp(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Ip({
    start() {
    },
    async pull(n) {
      const { done: o, value: s } = await t.next();
      o ? n.close() : n.enqueue(s);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function Rp(e) {
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
async function vc(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var UC = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Pp = "RFC3986", xp = (e) => String(e), Sc = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: xp
};
var pi = (e, t) => (pi = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), pi(e, t)), Ze = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), Ar = 1024, LC = (e, t, n, o, s) => {
  if (e.length === 0) return e;
  let r = e;
  if (typeof e == "symbol" ? r = Symbol.prototype.toString.call(e) : typeof e != "string" && (r = String(e)), n === "iso-8859-1") return escape(r).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < r.length; u += Ar) {
    const c = r.length >= Ar ? r.slice(u, u + Ar) : r, d = [];
    for (let p = 0; p < c.length; ++p) {
      let f = c.charCodeAt(p);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || s === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(p);
        continue;
      }
      if (f < 128) {
        d[d.length] = Ze[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = Ze[192 | f >> 6] + Ze[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = Ze[224 | f >> 12] + Ze[128 | f >> 6 & 63] + Ze[128 | f & 63];
        continue;
      }
      p += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(p) & 1023), d[d.length] = Ze[240 | f >> 18] + Ze[128 | f >> 12 & 63] + Ze[128 | f >> 6 & 63] + Ze[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function $C(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function Tc(e, t) {
  if (Ce(e)) {
    const n = [];
    for (let o = 0; o < e.length; o += 1) n.push(t(e[o]));
    return n;
  }
  return t(e);
}
var Mp = {
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
}, Np = function(e, t) {
  Array.prototype.push.apply(e, Ce(t) ? t : [t]);
}, Ec, ie = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: LC,
  encodeValuesOnly: !1,
  format: Pp,
  formatter: xp,
  indices: !1,
  serializeDate(e) {
    return (Ec ?? (Ec = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function FC(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var Ir = {};
function kp(e, t, n, o, s, r, a, u, c, d, p, f, h, m, g, _, v, w) {
  let A = e, b = w, x = 0, M = !1;
  for (; (b = b.get(Ir)) !== void 0 && !M; ) {
    const H = b.get(e);
    if (x += 1, typeof H < "u") {
      if (H === x) throw new RangeError("Cyclic object value");
      M = !0;
    }
    typeof b.get(Ir) > "u" && (x = 0);
  }
  if (typeof d == "function" ? A = d(t, A) : A instanceof Date ? A = h?.(A) : n === "comma" && Ce(A) && (A = Tc(A, function(H) {
    return H instanceof Date ? h?.(H) : H;
  })), A === null) {
    if (r) return c && !_ ? c(t, ie.encoder, v, "key", m) : t;
    A = "";
  }
  if (FC(A) || $C(A)) {
    if (c) {
      const H = _ ? t : c(t, ie.encoder, v, "key", m);
      return [g?.(H) + "=" + g?.(c(A, ie.encoder, v, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(A))];
  }
  const C = [];
  if (typeof A > "u") return C;
  let L;
  if (n === "comma" && Ce(A))
    _ && c && (A = Tc(A, c)), L = [{ value: A.length > 0 ? A.join(",") || null : void 0 }];
  else if (Ce(d)) L = d;
  else {
    const H = Object.keys(A);
    L = p ? H.sort(p) : H;
  }
  const P = u ? String(t).replace(/\./g, "%2E") : String(t), N = o && Ce(A) && A.length === 1 ? P + "[]" : P;
  if (s && Ce(A) && A.length === 0) return N + "[]";
  for (let H = 0; H < L.length; ++H) {
    const z = L[H], j = typeof z == "object" && typeof z.value < "u" ? z.value : A[z];
    if (a && j === null) continue;
    const ee = f && u ? z.replace(/\./g, "%2E") : z, Q = Ce(A) ? typeof n == "function" ? n(N, ee) : N : N + (f ? "." + ee : "[" + ee + "]");
    w.set(e, x);
    const X = /* @__PURE__ */ new WeakMap();
    X.set(Ir, w), Np(C, kp(j, Q, n, o, s, r, a, u, n === "comma" && _ && Ce(A) ? null : c, d, p, f, h, m, g, _, v, X));
  }
  return C;
}
function BC(e = ie) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || ie.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Pp;
  if (typeof e.format < "u") {
    if (!pi(Sc, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const o = Sc[n];
  let s = ie.filter;
  (typeof e.filter == "function" || Ce(e.filter)) && (s = e.filter);
  let r;
  if (e.arrayFormat && e.arrayFormat in Mp ? r = e.arrayFormat : "indices" in e ? r = e.indices ? "indices" : "repeat" : r = ie.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : ie.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : ie.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : ie.allowEmptyArrays,
    arrayFormat: r,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : ie.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? ie.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : ie.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : ie.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : ie.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : ie.encodeValuesOnly,
    filter: s,
    format: n,
    formatter: o,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : ie.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : ie.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : ie.strictNullHandling
  };
}
function qC(e, t = {}) {
  let n = e;
  const o = BC(t);
  let s, r;
  typeof o.filter == "function" ? (r = o.filter, n = r("", n)) : Ce(o.filter) && (r = o.filter, s = r);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = Mp[o.arrayFormat], c = u === "comma" && o.commaRoundTrip;
  s || (s = Object.keys(n)), o.sort && s.sort(o.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let h = 0; h < s.length; ++h) {
    const m = s[h];
    o.skipNulls && n[m] === null || Np(a, kp(n[m], m, u, c, o.allowEmptyArrays, o.strictNullHandling, o.skipNulls, o.encodeDotInKeys, o.encode ? o.encoder : null, o.filter, o.sort, o.allowDots, o.serializeDate, o.format, o.formatter, o.encodeValuesOnly, o.charset, d));
  }
  const p = a.join(o.delimiter);
  let f = o.addQueryPrefix === !0 ? "?" : "";
  return o.charsetSentinel && (o.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), p.length > 0 ? f + p : "";
}
function GC(e) {
  return qC(e, { arrayFormat: "brackets" });
}
function OC(e) {
  let t = 0;
  for (const s of e) t += s.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const s of e)
    n.set(s, o), o += s.length;
  return n;
}
var wc;
function ea(e) {
  let t;
  return (wc ?? (t = new globalThis.TextEncoder(), wc = t.encode.bind(t)))(e);
}
var Cc;
function Ac(e) {
  let t;
  return (Cc ?? (t = new globalThis.TextDecoder(), Cc = t.decode.bind(t)))(e);
}
var xe, Me, Ws = class {
  constructor() {
    xe.set(this, void 0), Me.set(this, void 0), G(this, xe, new Uint8Array(), "f"), G(this, Me, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ea(e) : e;
    G(this, xe, OC([E(this, xe, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = HC(E(this, xe, "f"), E(this, Me, "f"))) != null; ) {
      if (o.carriage && E(this, Me, "f") == null) {
        G(this, Me, o.index, "f");
        continue;
      }
      if (E(this, Me, "f") != null && (o.index !== E(this, Me, "f") + 1 || o.carriage)) {
        n.push(Ac(E(this, xe, "f").subarray(0, E(this, Me, "f") - 1))), G(this, xe, E(this, xe, "f").subarray(E(this, Me, "f")), "f"), G(this, Me, null, "f");
        continue;
      }
      const s = E(this, Me, "f") !== null ? o.preceding - 1 : o.preceding, r = Ac(E(this, xe, "f").subarray(0, s));
      n.push(r), G(this, xe, E(this, xe, "f").subarray(o.index), "f"), G(this, Me, null, "f");
    }
    return n;
  }
  flush() {
    return E(this, xe, "f").length ? this.decode(`
`) : [];
  }
};
xe = /* @__PURE__ */ new WeakMap(), Me = /* @__PURE__ */ new WeakMap();
Ws.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Ws.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function HC(e, t) {
  for (let s = t ?? 0; s < e.length; s++) {
    if (e[s] === 10) return {
      preceding: s,
      index: s + 1,
      carriage: !1
    };
    if (e[s] === 13) return {
      preceding: s,
      index: s + 1,
      carriage: !0
    };
  }
  return null;
}
function VC(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var Rs = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Ic = (e, t, n) => {
  if (e) {
    if (bC(Rs, e)) return e;
    fe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Rs))}`);
  }
};
function zn() {
}
function Xo(e, t, n) {
  return !t || Rs[e] > Rs[n] ? zn : t[e].bind(t);
}
var JC = {
  error: zn,
  warn: zn,
  info: zn,
  debug: zn
}, bc = /* @__PURE__ */ new WeakMap();
function fe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return JC;
  const o = bc.get(t);
  if (o && o[0] === n) return o[1];
  const s = {
    error: Xo("error", t, n),
    warn: Xo("warn", t, n),
    info: Xo("info", t, n),
    debug: Xo("debug", t, n)
  };
  return bc.set(t, [n, s]), s;
}
var Nt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), qn, mo = class Yn {
  constructor(t, n, o) {
    this.iterator = t, qn.set(this, void 0), this.controller = n, G(this, qn, o, "f");
  }
  static fromSSEResponse(t, n, o, s) {
    let r = !1;
    const a = o ? fe(o) : console;
    async function* u() {
      if (r) throw new q("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let c = !1;
      try {
        for await (const d of WC(t, n))
          if (!c) {
            if (d.data.startsWith("[DONE]")) {
              c = !0;
              continue;
            }
            if (d.event === null || !d.event.startsWith("thread.")) {
              let p;
              try {
                p = JSON.parse(d.data);
              } catch (f) {
                throw a.error("Could not parse message into JSON:", d.data), a.error("From chunk:", d.raw), f;
              }
              if (p && p.error) throw new me(void 0, p.error, void 0, t.headers);
              yield s ? {
                event: d.event,
                data: p
              } : p;
            } else {
              let p;
              try {
                p = JSON.parse(d.data);
              } catch (f) {
                throw console.error("Could not parse message into JSON:", d.data), console.error("From chunk:", d.raw), f;
              }
              if (d.event == "error") throw new me(void 0, p.error, p.message, void 0);
              yield {
                event: d.event,
                data: p
              };
            }
          }
        c = !0;
      } catch (d) {
        if (ci(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Yn(u, n, o);
  }
  static fromReadableStream(t, n, o) {
    let s = !1;
    async function* r() {
      const u = new Ws(), c = Rp(t);
      for await (const d of c) for (const p of u.decode(d)) yield p;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (s) throw new q("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let u = !1;
      try {
        for await (const c of r())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (ci(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Yn(a, n, o);
  }
  [(qn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), s = (r) => ({ next: () => {
      if (r.length === 0) {
        const a = o.next();
        t.push(a), n.push(a);
      }
      return r.shift();
    } });
    return [new Yn(() => s(t), this.controller, E(this, qn, "f")), new Yn(() => s(n), this.controller, E(this, qn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Ip({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: s, done: r } = await n.next();
          if (r) return o.close();
          const a = ea(JSON.stringify(s) + `
`);
          o.enqueue(a);
        } catch (s) {
          o.error(s);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* WC(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new q("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new q("Attempted to iterate over a response with no body");
  const n = new zC(), o = new Ws(), s = Rp(e.body);
  for await (const r of KC(s)) for (const a of o.decode(r)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const r of o.flush()) {
    const a = n.decode(r);
    a && (yield a);
  }
}
async function* KC(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? ea(n) : n;
    let s = new Uint8Array(t.length + o.length);
    s.set(t), s.set(o, t.length), t = s;
    let r;
    for (; (r = VC(t)) !== -1; )
      yield t.slice(0, r), t = t.slice(r);
  }
  t.length > 0 && (yield t);
}
var zC = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const s = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], s;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, o] = YC(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function YC(e, t) {
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
async function Dp(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: s, startTime: r } = t, a = await (async () => {
    if (t.options.stream)
      return fe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : mo.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Up(await n.json(), n) : await n.text();
  })();
  return fe(e).debug(`[${o}] response parsed`, Nt({
    retryOfRequestLogID: s,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - r
  })), a;
}
function Up(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Xn, Lp = class $p extends Promise {
  constructor(t, n, o = Dp) {
    super((s) => {
      s(null);
    }), this.responsePromise = n, this.parseResponse = o, Xn.set(this, void 0), G(this, Xn, t, "f");
  }
  _thenUnwrap(t) {
    return new $p(E(this, Xn, "f"), this.responsePromise, async (n, o) => Up(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(E(this, Xn, "f"), t))), this.parsedPromise;
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
Xn = /* @__PURE__ */ new WeakMap();
var Qo, ta = class {
  constructor(e, t, n, o) {
    Qo.set(this, void 0), G(this, Qo, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new q("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await E(this, Qo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Qo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, XC = class extends Lp {
  constructor(e, t, n) {
    super(e, t, async (o, s) => new n(o, s.response, await Dp(o, s), s.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Ks = class extends ta {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, te = class extends ta {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.has_more = n.has_more || !1;
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
        ...Cp(this.options.query),
        after: t
      }
    } : null;
  }
}, go = class extends ta {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.has_more = n.has_more || !1, this.last_id = n.last_id || "";
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
        ...Cp(this.options.query),
        after: e
      }
    } : null;
  }
}, QC = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, ZC = "urn:ietf:params:oauth:grant-type:token-exchange", jC = class {
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
    const e = await this.config.provider.getToken(), t = await this.fetch(this.tokenExchangeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: ZC,
        client_id: this.config.clientId,
        subject_token: e,
        subject_token_type: QC[this.config.provider.tokenType],
        identity_provider_id: this.config.identityProviderId,
        service_account_id: this.config.serviceAccountId
      })
    });
    if (!t.ok) {
      const r = await t.text();
      let a;
      try {
        a = JSON.parse(r);
      } catch {
      }
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new wp(t.status, a, t.headers) : me.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
    }
    const n = await t.json(), o = n.expires_in || 3600, s = Date.now() + o * 1e3;
    return this.cachedToken = {
      token: n.access_token,
      expiresAt: s
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
}, Fp = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function io(e, t, n) {
  return Fp(), new File(e, t ?? "unknown_file", n);
}
function cs(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var na = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", zs = async (e, t) => hi(e.body) ? {
  ...e,
  body: await Bp(e.body, t)
} : e, nt = async (e, t) => ({
  ...e,
  body: await Bp(e.body, t)
}), Rc = /* @__PURE__ */ new WeakMap();
function eA(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Rc.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const s = "Response" in t ? t.Response : (await t("data:,")).constructor, r = new FormData();
      return r.toString() !== await new s(r).text();
    } catch {
      return !0;
    }
  })();
  return Rc.set(t, o), o;
}
var Bp = async (e, t) => {
  if (!await eA(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, s]) => mi(n, o, s))), n;
}, qp = (e) => e instanceof Blob && "name" in e, tA = (e) => typeof e == "object" && e !== null && (e instanceof Response || na(e) || qp(e)), hi = (e) => {
  if (tA(e)) return !0;
  if (Array.isArray(e)) return e.some(hi);
  if (e && typeof e == "object") {
    for (const t in e) if (hi(e[t])) return !0;
  }
  return !1;
}, mi = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, io([await n.blob()], cs(n)));
    else if (na(n)) e.append(t, io([await new Response(bp(n)).blob()], cs(n)));
    else if (qp(n)) e.append(t, n, cs(n));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => mi(e, t + "[]", o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, s]) => mi(e, `${t}[${o}]`, s)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Gp = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", nA = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Gp(e), oA = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function sA(e, t, n) {
  if (Fp(), e = await e, nA(e))
    return e instanceof File ? e : io([await e.arrayBuffer()], e.name);
  if (oA(e)) {
    const s = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), io(await gi(s), t, n);
  }
  const o = await gi(e);
  if (t || (t = cs(e)), !n?.type) {
    const s = o.find((r) => typeof r == "object" && "type" in r && r.type);
    typeof s == "string" && (n = {
      ...n,
      type: s
    });
  }
  return io(o, t, n);
}
async function gi(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Gp(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (na(e)) for await (const n of e) t.push(...await gi(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${rA(e)}`);
  }
  return t;
}
function rA(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var B = class {
  constructor(e) {
    this._client = e;
  }
};
function Op(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Pc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), iA = (e = Op) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let s = !1;
  const r = [], a = n.reduce((p, f, h) => {
    /[?#]/.test(f) && (s = !0);
    const m = o[h];
    let g = (s ? encodeURIComponent : e)("" + m);
    return h !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Pc) ?? Pc)?.toString) && (g = m + "", r.push({
      start: p.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), p + f + (h === o.length ? "" : g);
  }, ""), u = a.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) r.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (r.sort((p, f) => p.start - f.start), r.length > 0) {
    let p = 0;
    const f = r.reduce((h, m) => {
      const g = " ".repeat(m.start - p), _ = "^".repeat(m.length);
      return p = m.start + m.length, h + g + _;
    }, "");
    throw new q(`Path parameters result in path with invalid segments:
${r.map((h) => h.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, R = /* @__PURE__ */ iA(Op), Hp = class extends B {
  list(e, t = {}, n) {
    return this._client.getAPIList(R`/chat/completions/${e}/messages`, te, {
      query: t,
      ...n
    });
  }
};
function Ps(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function oa(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function Io(e) {
  return e?.$brand === "auto-parseable-tool";
}
function aA(e, t) {
  return !t || !Vp(t) ? {
    ...e,
    choices: e.choices.map((n) => (Jp(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : sa(e, t);
}
function sa(e, t) {
  const n = e.choices.map((o) => {
    if (o.finish_reason === "length") throw new Tp();
    if (o.finish_reason === "content_filter") throw new Ep();
    return Jp(o.message.tool_calls), {
      ...o,
      message: {
        ...o.message,
        ...o.message.tool_calls ? { tool_calls: o.message.tool_calls?.map((s) => uA(t, s)) ?? void 0 } : void 0,
        parsed: o.message.content && !o.message.refusal ? lA(t, o.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function lA(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function uA(e, t) {
  const n = e.tools?.find((o) => Ps(o) && o.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: Io(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function cA(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((o) => Ps(o) && o.function?.name === t.function.name);
  return Ps(n) && (Io(n) || n?.function.strict || !1);
}
function Vp(e) {
  return oa(e.response_format) ? !0 : e.tools?.some((t) => Io(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function Jp(e) {
  for (const t of e || []) if (t.type !== "function") throw new q(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function dA(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new q(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new q(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var xs = (e) => e?.role === "assistant", Wp = (e) => e?.role === "tool", yi, ds, fs, Qn, Zn, ps, jn, ct, eo, Ms, Ns, tn, Kp, ra = class {
  constructor() {
    yi.add(this), this.controller = new AbortController(), ds.set(this, void 0), fs.set(this, () => {
    }), Qn.set(this, () => {
    }), Zn.set(this, void 0), ps.set(this, () => {
    }), jn.set(this, () => {
    }), ct.set(this, {}), eo.set(this, !1), Ms.set(this, !1), Ns.set(this, !1), tn.set(this, !1), G(this, ds, new Promise((e, t) => {
      G(this, fs, e, "f"), G(this, Qn, t, "f");
    }), "f"), G(this, Zn, new Promise((e, t) => {
      G(this, ps, e, "f"), G(this, jn, t, "f");
    }), "f"), E(this, ds, "f").catch(() => {
    }), E(this, Zn, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, E(this, yi, "m", Kp).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (E(this, fs, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return E(this, eo, "f");
  }
  get errored() {
    return E(this, Ms, "f");
  }
  get aborted() {
    return E(this, Ns, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (E(this, ct, "f")[e] || (E(this, ct, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = E(this, ct, "f")[e];
    if (!n) return this;
    const o = n.findIndex((s) => s.listener === t);
    return o >= 0 && n.splice(o, 1), this;
  }
  once(e, t) {
    return (E(this, ct, "f")[e] || (E(this, ct, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      G(this, tn, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    G(this, tn, !0, "f"), await E(this, Zn, "f");
  }
  _emit(e, ...t) {
    if (E(this, eo, "f")) return;
    e === "end" && (G(this, eo, !0, "f"), E(this, ps, "f").call(this));
    const n = E(this, ct, "f")[e];
    if (n && (E(this, ct, "f")[e] = n.filter((o) => !o.once), n.forEach(({ listener: o }) => o(...t))), e === "abort") {
      const o = t[0];
      !E(this, tn, "f") && !n?.length && Promise.reject(o), E(this, Qn, "f").call(this, o), E(this, jn, "f").call(this, o), this._emit("end");
      return;
    }
    if (e === "error") {
      const o = t[0];
      !E(this, tn, "f") && !n?.length && Promise.reject(o), E(this, Qn, "f").call(this, o), E(this, jn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
ds = /* @__PURE__ */ new WeakMap(), fs = /* @__PURE__ */ new WeakMap(), Qn = /* @__PURE__ */ new WeakMap(), Zn = /* @__PURE__ */ new WeakMap(), ps = /* @__PURE__ */ new WeakMap(), jn = /* @__PURE__ */ new WeakMap(), ct = /* @__PURE__ */ new WeakMap(), eo = /* @__PURE__ */ new WeakMap(), Ms = /* @__PURE__ */ new WeakMap(), Ns = /* @__PURE__ */ new WeakMap(), tn = /* @__PURE__ */ new WeakMap(), yi = /* @__PURE__ */ new WeakSet(), Kp = function(t) {
  if (G(this, Ms, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Oe()), t instanceof Oe)
    return G(this, Ns, !0, "f"), this._emit("abort", t);
  if (t instanceof q) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new q(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new q(String(t)));
};
function fA(e) {
  return typeof e.parse == "function";
}
var _e, _i, ks, vi, Si, Ti, zp, Yp, pA = 10, Xp = class extends ra {
  constructor() {
    super(...arguments), _e.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), Wp(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (xs(e) && e.tool_calls)
        for (const n of e.tool_calls) n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e) throw new q("stream ended without producing a ChatCompletion");
    return e;
  }
  async finalContent() {
    return await this.done(), E(this, _e, "m", _i).call(this);
  }
  async finalMessage() {
    return await this.done(), E(this, _e, "m", ks).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), E(this, _e, "m", vi).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), E(this, _e, "m", Si).call(this);
  }
  async totalUsage() {
    return await this.done(), E(this, _e, "m", Ti).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = E(this, _e, "m", ks).call(this);
    t && this._emit("finalMessage", t);
    const n = E(this, _e, "m", _i).call(this);
    n && this._emit("finalContent", n);
    const o = E(this, _e, "m", vi).call(this);
    o && this._emit("finalFunctionToolCall", o);
    const s = E(this, _e, "m", Si).call(this);
    s != null && this._emit("finalFunctionToolCallResult", s), this._chatCompletions.some((r) => r.usage) && this._emit("totalUsage", E(this, _e, "m", Ti).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), E(this, _e, "m", zp).call(this, t);
    const s = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(sa(s, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const o of t.messages) this._addMessage(o, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const o = "tool", { tool_choice: s = "auto", stream: r, ...a } = t, u = typeof s != "string" && s.type === "function" && s?.function?.name, { maxChatCompletions: c = pA } = n || {}, d = t.tools.map((h) => {
      if (Io(h)) {
        if (!h.$callback) throw new q("Tool given to `.runTools()` that does not have an associated function");
        return {
          type: "function",
          function: {
            function: h.$callback,
            name: h.function.name,
            description: h.function.description || "",
            parameters: h.function.parameters,
            parse: h.$parseRaw,
            strict: !0
          }
        };
      }
      return h;
    }), p = {};
    for (const h of d) h.type === "function" && (p[h.function.name || h.function.function.name] = h.function);
    const f = "tools" in t ? d.map((h) => h.type === "function" ? {
      type: "function",
      function: {
        name: h.function.name || h.function.function.name,
        parameters: h.function.parameters,
        description: h.function.description,
        strict: h.function.strict
      }
    } : h) : void 0;
    for (const h of t.messages) this._addMessage(h, !1);
    for (let h = 0; h < c; ++h) {
      const m = (await this._createChatCompletion(e, {
        ...a,
        tool_choice: s,
        tools: f,
        messages: [...this.messages]
      }, n)).choices[0]?.message;
      if (!m) throw new q("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const _ = g.id, { name: v, arguments: w } = g.function, A = p[v];
        if (A) {
          if (u && u !== v) {
            const C = `Invalid tool_call: ${JSON.stringify(v)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: o,
              tool_call_id: _,
              content: C
            });
            continue;
          }
        } else {
          const C = `Invalid tool_call: ${JSON.stringify(v)}. Available options are: ${Object.keys(p).map((L) => JSON.stringify(L)).join(", ")}. Please try again`;
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: C
          });
          continue;
        }
        let b;
        try {
          b = fA(A) ? await A.parse(w) : w;
        } catch (C) {
          const L = C instanceof Error ? C.message : String(C);
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: L
          });
          continue;
        }
        const x = await A.function(b, this), M = E(this, _e, "m", Yp).call(this, x);
        if (this._addMessage({
          role: o,
          tool_call_id: _,
          content: M
        }), u) return;
      }
    }
  }
};
_e = /* @__PURE__ */ new WeakSet(), _i = function() {
  return E(this, _e, "m", ks).call(this).content ?? null;
}, ks = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (xs(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new q("stream ended without producing a ChatCompletionMessage with role=assistant");
}, vi = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (xs(n) && n?.tool_calls?.length) return n.tool_calls.filter((o) => o.type === "function").at(-1)?.function;
  }
}, Si = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Wp(n) && n.content != null && typeof n.content == "string" && this.messages.some((o) => o.role === "assistant" && o.tool_calls?.some((s) => s.type === "function" && s.id === n.tool_call_id))) return n.content;
  }
}, Ti = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, zp = function(t) {
  if (t.n != null && t.n > 1) throw new q("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, Yp = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var hA = class Qp extends Xp {
  static runTools(t, n, o) {
    const s = new Qp(), r = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return s._run(() => s._runTools(t, n, r)), s;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), xs(t) && t.content && this._emit("content", t.content);
  }
}, mA = 1, Zp = 2, jp = 4, eh = 8, gA = 16, yA = 32, _A = 64, th = 128, nh = 256, vA = th | nh, SA = 496, xc = Zp | 497, Mc = jp | eh, ce = {
  STR: mA,
  NUM: Zp,
  ARR: jp,
  OBJ: eh,
  NULL: gA,
  BOOL: yA,
  NAN: _A,
  INFINITY: th,
  MINUS_INFINITY: nh,
  INF: vA,
  SPECIAL: SA,
  ATOM: xc,
  COLLECTION: Mc,
  ALL: xc | Mc
}, TA = class extends Error {
}, EA = class extends Error {
};
function wA(e, t = ce.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return CA(e.trim(), t);
}
var CA = (e, t) => {
  const n = e.length;
  let o = 0;
  const s = (h) => {
    throw new TA(`${h} at position ${o}`);
  }, r = (h) => {
    throw new EA(`${h} at position ${o}`);
  }, a = () => (f(), o >= n && s("Unexpected end of input"), e[o] === '"' ? u() : e[o] === "{" ? c() : e[o] === "[" ? d() : e.substring(o, o + 4) === "null" || ce.NULL & t && n - o < 4 && "null".startsWith(e.substring(o)) ? (o += 4, null) : e.substring(o, o + 4) === "true" || ce.BOOL & t && n - o < 4 && "true".startsWith(e.substring(o)) ? (o += 4, !0) : e.substring(o, o + 5) === "false" || ce.BOOL & t && n - o < 5 && "false".startsWith(e.substring(o)) ? (o += 5, !1) : e.substring(o, o + 8) === "Infinity" || ce.INFINITY & t && n - o < 8 && "Infinity".startsWith(e.substring(o)) ? (o += 8, 1 / 0) : e.substring(o, o + 9) === "-Infinity" || ce.MINUS_INFINITY & t && 1 < n - o && n - o < 9 && "-Infinity".startsWith(e.substring(o)) ? (o += 9, -1 / 0) : e.substring(o, o + 3) === "NaN" || ce.NAN & t && n - o < 3 && "NaN".startsWith(e.substring(o)) ? (o += 3, NaN) : p()), u = () => {
    const h = o;
    let m = !1;
    for (o++; o < n && (e[o] !== '"' || m && e[o - 1] === "\\"); )
      m = e[o] === "\\" ? !m : !1, o++;
    if (e.charAt(o) == '"') try {
      return JSON.parse(e.substring(h, ++o - Number(m)));
    } catch (g) {
      r(String(g));
    }
    else if (ce.STR & t) try {
      return JSON.parse(e.substring(h, o - Number(m)) + '"');
    } catch {
      return JSON.parse(e.substring(h, e.lastIndexOf("\\")) + '"');
    }
    s("Unterminated string literal");
  }, c = () => {
    o++, f();
    const h = {};
    try {
      for (; e[o] !== "}"; ) {
        if (f(), o >= n && ce.OBJ & t) return h;
        const m = u();
        f(), o++;
        try {
          const g = a();
          Object.defineProperty(h, m, {
            value: g,
            writable: !0,
            enumerable: !0,
            configurable: !0
          });
        } catch (g) {
          if (ce.OBJ & t) return h;
          throw g;
        }
        f(), e[o] === "," && o++;
      }
    } catch {
      if (ce.OBJ & t) return h;
      s("Expected '}' at end of object");
    }
    return o++, h;
  }, d = () => {
    o++;
    const h = [];
    try {
      for (; e[o] !== "]"; )
        h.push(a()), f(), e[o] === "," && o++;
    } catch {
      if (ce.ARR & t) return h;
      s("Expected ']' at end of array");
    }
    return o++, h;
  }, p = () => {
    if (o === 0) {
      e === "-" && ce.NUM & t && s("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (ce.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        r(String(m));
      }
    }
    const h = o;
    for (e[o] === "-" && o++; e[o] && !",]}".includes(e[o]); ) o++;
    o == n && !(ce.NUM & t) && s("Unterminated number literal");
    try {
      return JSON.parse(e.substring(h, o));
    } catch {
      e.substring(h, o) === "-" && ce.NUM & t && s("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(h, e.lastIndexOf("e")));
      } catch (g) {
        r(String(g));
      }
    }
  }, f = () => {
    for (; o < n && ` 
\r	`.includes(e[o]); ) o++;
  };
  return a();
}, Nc = (e) => wA(e, ce.ALL ^ ce.NUM), se, ut, zt, vt, br, Zo, Rr, Pr, xr, jo, Mr, kc, oh = class Ei extends Xp {
  constructor(t) {
    super(), se.add(this), ut.set(this, void 0), zt.set(this, void 0), vt.set(this, void 0), G(this, ut, t, "f"), G(this, zt, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return E(this, vt, "f");
  }
  static fromReadableStream(t) {
    const n = new Ei(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, o) {
    const s = new Ei(n);
    return s._run(() => s._runChatCompletion(t, {
      ...n,
      stream: !0
    }, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), s;
  }
  async _createChatCompletion(t, n, o) {
    super._createChatCompletion;
    const s = o?.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), E(this, se, "m", br).call(this);
    const r = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of r) E(this, se, "m", Rr).call(this, a);
    if (r.controller.signal?.aborted) throw new Oe();
    return this._addChatCompletion(E(this, se, "m", jo).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), E(this, se, "m", br).call(this), this._connected();
    const s = mo.fromReadableStream(t, this.controller);
    let r;
    for await (const a of s)
      r && r !== a.id && this._addChatCompletion(E(this, se, "m", jo).call(this)), E(this, se, "m", Rr).call(this, a), r = a.id;
    if (s.controller.signal?.aborted) throw new Oe();
    return this._addChatCompletion(E(this, se, "m", jo).call(this));
  }
  [(ut = /* @__PURE__ */ new WeakMap(), zt = /* @__PURE__ */ new WeakMap(), vt = /* @__PURE__ */ new WeakMap(), se = /* @__PURE__ */ new WeakSet(), br = function() {
    this.ended || G(this, vt, void 0, "f");
  }, Zo = function(n) {
    let o = E(this, zt, "f")[n.index];
    return o || (o = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, E(this, zt, "f")[n.index] = o, o);
  }, Rr = function(n) {
    if (this.ended) return;
    const o = E(this, se, "m", kc).call(this, n);
    this._emit("chunk", n, o);
    for (const s of n.choices) {
      const r = o.choices[s.index];
      s.delta.content != null && r.message?.role === "assistant" && r.message?.content && (this._emit("content", s.delta.content, r.message.content), this._emit("content.delta", {
        delta: s.delta.content,
        snapshot: r.message.content,
        parsed: r.message.parsed
      })), s.delta.refusal != null && r.message?.role === "assistant" && r.message?.refusal && this._emit("refusal.delta", {
        delta: s.delta.refusal,
        snapshot: r.message.refusal
      }), s.logprobs?.content != null && r.message?.role === "assistant" && this._emit("logprobs.content.delta", {
        content: s.logprobs?.content,
        snapshot: r.logprobs?.content ?? []
      }), s.logprobs?.refusal != null && r.message?.role === "assistant" && this._emit("logprobs.refusal.delta", {
        refusal: s.logprobs?.refusal,
        snapshot: r.logprobs?.refusal ?? []
      });
      const a = E(this, se, "m", Zo).call(this, r);
      r.finish_reason && (E(this, se, "m", xr).call(this, r), a.current_tool_call_index != null && E(this, se, "m", Pr).call(this, r, a.current_tool_call_index));
      for (const u of s.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (E(this, se, "m", xr).call(this, r), a.current_tool_call_index != null && E(this, se, "m", Pr).call(this, r, a.current_tool_call_index)), a.current_tool_call_index = u.index;
      for (const u of s.delta.tool_calls ?? []) {
        const c = r.message.tool_calls?.[u.index];
        c?.type && (c?.type === "function" ? this._emit("tool_calls.function.arguments.delta", {
          name: c.function?.name,
          index: u.index,
          arguments: c.function.arguments,
          parsed_arguments: c.function.parsed_arguments,
          arguments_delta: u.function?.arguments ?? ""
        }) : (c?.type, void 0));
      }
    }
  }, Pr = function(n, o) {
    if (E(this, se, "m", Zo).call(this, n).done_tool_calls.has(o)) return;
    const s = n.message.tool_calls?.[o];
    if (!s) throw new Error("no tool call snapshot");
    if (!s.type) throw new Error("tool call snapshot missing `type`");
    if (s.type === "function") {
      const r = E(this, ut, "f")?.tools?.find((a) => Ps(a) && a.function.name === s.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: s.function.name,
        index: o,
        arguments: s.function.arguments,
        parsed_arguments: Io(r) ? r.$parseRaw(s.function.arguments) : r?.function.strict ? JSON.parse(s.function.arguments) : null
      });
    } else s.type;
  }, xr = function(n) {
    const o = E(this, se, "m", Zo).call(this, n);
    if (n.message.content && !o.content_done) {
      o.content_done = !0;
      const s = E(this, se, "m", Mr).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: s ? s.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !o.refusal_done && (o.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !o.logprobs_content_done && (o.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !o.logprobs_refusal_done && (o.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, jo = function() {
    if (this.ended) throw new q("stream has ended, this shouldn't happen");
    const n = E(this, vt, "f");
    if (!n) throw new q("request ended without sending any chunks");
    return G(this, vt, void 0, "f"), G(this, zt, [], "f"), AA(n, E(this, ut, "f"));
  }, Mr = function() {
    const n = E(this, ut, "f")?.response_format;
    return oa(n) ? n : null;
  }, kc = function(n) {
    var o, s, r, a;
    let u = E(this, vt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = G(this, vt, {
      ...d,
      choices: []
    }, "f");
    for (const { delta: p, finish_reason: f, index: h, logprobs: m = null, ...g } of n.choices) {
      let _ = u.choices[h];
      if (_ || (_ = u.choices[h] = {
        finish_reason: f,
        index: h,
        message: {},
        logprobs: m,
        ...g
      }), m) if (!_.logprobs) _.logprobs = Object.assign({}, m);
      else {
        const { content: C, refusal: L, ...P } = m;
        Object.assign(_.logprobs, P), C && ((o = _.logprobs).content ?? (o.content = []), _.logprobs.content.push(...C)), L && ((s = _.logprobs).refusal ?? (s.refusal = []), _.logprobs.refusal.push(...L));
      }
      if (f && (_.finish_reason = f, E(this, ut, "f") && Vp(E(this, ut, "f")))) {
        if (f === "length") throw new Tp();
        if (f === "content_filter") throw new Ep();
      }
      if (Object.assign(_, g), !p) continue;
      const { content: v, refusal: w, function_call: A, role: b, tool_calls: x, ...M } = p;
      if (Object.assign(_.message, M), w && (_.message.refusal = (_.message.refusal || "") + w), b && (_.message.role = b), A && (_.message.function_call ? (A.name && (_.message.function_call.name = A.name), A.arguments && ((r = _.message.function_call).arguments ?? (r.arguments = ""), _.message.function_call.arguments += A.arguments)) : _.message.function_call = A), v && (_.message.content = (_.message.content || "") + v, !_.message.refusal && E(this, se, "m", Mr).call(this) && (_.message.parsed = Nc(_.message.content))), x) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: C, id: L, type: P, function: N, ...H } of x) {
          const z = (a = _.message.tool_calls)[C] ?? (a[C] = {});
          Object.assign(z, H), L && (z.id = L), P && (z.type = P), N && (z.function ?? (z.function = {
            name: N.name ?? "",
            arguments: ""
          })), N?.name && (z.function.name = N.name), N?.arguments && (z.function.arguments += N.arguments, cA(E(this, ut, "f"), z) && (z.function.parsed_arguments = Nc(z.function.arguments)));
        }
      }
    }
    return u;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("chunk", (s) => {
      const r = n.shift();
      r ? r.resolve(s) : t.push(s);
    }), this.on("end", () => {
      o = !0;
      for (const s of n) s.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (s) => {
      o = !0;
      for (const r of n) r.reject(s);
      n.length = 0;
    }), this.on("error", (s) => {
      o = !0;
      for (const r of n) r.reject(s);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((s, r) => n.push({
        resolve: s,
        reject: r
      })).then((s) => s ? {
        value: s,
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
    return new mo(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function AA(e, t) {
  const { id: n, choices: o, created: s, model: r, system_fingerprint: a, ...u } = e;
  return aA({
    ...u,
    id: n,
    choices: o.map(({ message: c, finish_reason: d, index: p, logprobs: f, ...h }) => {
      if (!d) throw new q(`missing finish_reason for choice ${p}`);
      const { content: m = null, function_call: g, tool_calls: _, ...v } = c, w = c.role;
      if (!w) throw new q(`missing role for choice ${p}`);
      if (g) {
        const { arguments: A, name: b } = g;
        if (A == null) throw new q(`missing function_call.arguments for choice ${p}`);
        if (!b) throw new q(`missing function_call.name for choice ${p}`);
        return {
          ...h,
          message: {
            content: m,
            function_call: {
              arguments: A,
              name: b
            },
            role: w,
            refusal: c.refusal ?? null
          },
          finish_reason: d,
          index: p,
          logprobs: f
        };
      }
      return _ ? {
        ...h,
        index: p,
        finish_reason: d,
        logprobs: f,
        message: {
          ...v,
          role: w,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: _.map((A, b) => {
            const { function: x, type: M, id: C, ...L } = A, { arguments: P, name: N, ...H } = x || {};
            if (C == null) throw new q(`missing choices[${p}].tool_calls[${b}].id
${es(e)}`);
            if (M == null) throw new q(`missing choices[${p}].tool_calls[${b}].type
${es(e)}`);
            if (N == null) throw new q(`missing choices[${p}].tool_calls[${b}].function.name
${es(e)}`);
            if (P == null) throw new q(`missing choices[${p}].tool_calls[${b}].function.arguments
${es(e)}`);
            return {
              ...L,
              id: C,
              type: M,
              function: {
                ...H,
                name: N,
                arguments: P
              }
            };
          })
        }
      } : {
        ...h,
        message: {
          ...v,
          content: m,
          role: w,
          refusal: c.refusal ?? null
        },
        finish_reason: d,
        index: p,
        logprobs: f
      };
    }),
    created: s,
    model: r,
    object: "chat.completion",
    ...a ? { system_fingerprint: a } : {}
  }, t);
}
function es(e) {
  return JSON.stringify(e);
}
var IA = class wi extends oh {
  static fromReadableStream(t) {
    const n = new wi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, o) {
    const s = new wi(n), r = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return s._run(() => s._runTools(t, n, r)), s;
  }
}, ia = class extends B {
  constructor() {
    super(...arguments), this.messages = new Hp(this._client);
  }
  create(e, t) {
    return this._client.post("/chat/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
  retrieve(e, t) {
    return this._client.get(R`/chat/completions/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(R`/chat/completions/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chat/completions", te, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(R`/chat/completions/${e}`, t);
  }
  parse(e, t) {
    return dA(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => sa(n, e));
  }
  runTools(e, t) {
    return e.stream ? IA.runTools(this._client, e, t) : hA.runTools(this._client, e, t);
  }
  stream(e, t) {
    return oh.createChatCompletion(this._client, e, t);
  }
};
ia.Messages = Hp;
var aa = class extends B {
  constructor() {
    super(...arguments), this.completions = new ia(this._client);
  }
};
aa.Completions = ia;
var sh = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* bA(e) {
  if (!e) return;
  if (sh in e) {
    const { values: o, nulls: s } = e;
    yield* o.entries();
    for (const r of s) yield [r, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : hc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const s = o[0];
    if (typeof s != "string") throw new TypeError("expected header name to be a string");
    const r = hc(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of r)
      u !== void 0 && (t && !a && (a = !0, yield [s, null]), yield [s, u]);
  }
}
var F = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const s = /* @__PURE__ */ new Set();
    for (const [r, a] of bA(o)) {
      const u = r.toLowerCase();
      s.has(u) || (t.delete(r), s.add(u)), a === null ? (t.delete(r), n.add(u)) : (t.append(r, a), n.delete(u));
    }
  }
  return {
    [sh]: !0,
    values: t,
    nulls: n
  };
}, rh = class extends B {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: F([{ Accept: "application/octet-stream" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, ih = class extends B {
  create(e, t) {
    return this._client.post("/audio/transcriptions", nt({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model }
    }, this._client));
  }
}, ah = class extends B {
  create(e, t) {
    return this._client.post("/audio/translations", nt({
      body: e,
      ...t,
      __metadata: { model: e.model }
    }, this._client));
  }
}, bo = class extends B {
  constructor() {
    super(...arguments), this.transcriptions = new ih(this._client), this.translations = new ah(this._client), this.speech = new rh(this._client);
  }
};
bo.Transcriptions = ih;
bo.Translations = ah;
bo.Speech = rh;
var lh = class extends B {
  create(e, t) {
    return this._client.post("/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(R`/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/batches", te, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(R`/batches/${e}/cancel`, t);
  }
}, uh = class extends B {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(R`/assistants/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(R`/assistants/${e}`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", te, {
      query: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(R`/assistants/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, ch = class extends B {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, dh = class extends B {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
}, Ys = class extends B {
  constructor() {
    super(...arguments), this.sessions = new ch(this._client), this.transcriptionSessions = new dh(this._client);
  }
};
Ys.Sessions = ch;
Ys.TranscriptionSessions = dh;
var fh = class extends B {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  cancel(e, t) {
    return this._client.post(R`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
}, ph = class extends B {
  retrieve(e, t) {
    return this._client.get(R`/chatkit/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", go, {
      query: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(R`/chatkit/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers])
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(R`/chatkit/threads/${e}/items`, go, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers])
    });
  }
}, Xs = class extends B {
  constructor() {
    super(...arguments), this.sessions = new fh(this._client), this.threads = new ph(this._client);
  }
};
Xs.Sessions = fh;
Xs.Threads = ph;
var hh = class extends B {
  create(e, t, n) {
    return this._client.post(R`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(R`/threads/${o}/messages/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(R`/threads/${o}/messages/${e}`, {
      body: s,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(R`/threads/${e}/messages`, te, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { thread_id: o } = t;
    return this._client.delete(R`/threads/${o}/messages/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, mh = class extends B {
  retrieve(e, t, n) {
    const { thread_id: o, run_id: s, ...r } = t;
    return this._client.get(R`/threads/${o}/runs/${s}/steps/${e}`, {
      query: r,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.getAPIList(R`/threads/${o}/runs/${e}/steps`, te, {
      query: s,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, RA = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, o = new Uint8Array(n);
    for (let s = 0; s < n; s++) o[s] = t.charCodeAt(s);
    return Array.from(new Float32Array(o.buffer));
  }
}, Yt = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() ?? void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim();
}, pe, Ft, Ci, et, hs, Je, Bt, an, Dt, Ds, Ne, ms, gs, ao, to, no, Dc, Uc, Lc, $c, Fc, Bc, qc, lo = class extends ra {
  constructor() {
    super(...arguments), pe.add(this), Ci.set(this, []), et.set(this, {}), hs.set(this, {}), Je.set(this, void 0), Bt.set(this, void 0), an.set(this, void 0), Dt.set(this, void 0), Ds.set(this, void 0), Ne.set(this, void 0), ms.set(this, void 0), gs.set(this, void 0), ao.set(this, void 0);
  }
  [(Ci = /* @__PURE__ */ new WeakMap(), et = /* @__PURE__ */ new WeakMap(), hs = /* @__PURE__ */ new WeakMap(), Je = /* @__PURE__ */ new WeakMap(), Bt = /* @__PURE__ */ new WeakMap(), an = /* @__PURE__ */ new WeakMap(), Dt = /* @__PURE__ */ new WeakMap(), Ds = /* @__PURE__ */ new WeakMap(), Ne = /* @__PURE__ */ new WeakMap(), ms = /* @__PURE__ */ new WeakMap(), gs = /* @__PURE__ */ new WeakMap(), ao = /* @__PURE__ */ new WeakMap(), pe = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const e = [], t = [];
    let n = !1;
    return this.on("event", (o) => {
      const s = t.shift();
      s ? s.resolve(o) : e.push(o);
    }), this.on("end", () => {
      n = !0;
      for (const o of t) o.resolve(void 0);
      t.length = 0;
    }), this.on("abort", (o) => {
      n = !0;
      for (const s of t) s.reject(o);
      t.length = 0;
    }), this.on("error", (o) => {
      n = !0;
      for (const s of t) s.reject(o);
      t.length = 0;
    }), {
      next: async () => e.length ? {
        value: e.shift(),
        done: !1
      } : n ? {
        value: void 0,
        done: !0
      } : new Promise((o, s) => t.push({
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
  static fromReadableStream(e) {
    const t = new Ft();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const o = mo.fromReadableStream(e, this.controller);
    for await (const s of o) E(this, pe, "m", to).call(this, s);
    if (o.controller.signal?.aborted) throw new Oe();
    return this._addRun(E(this, pe, "m", no).call(this));
  }
  toReadableStream() {
    return new mo(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, o) {
    const s = new Ft();
    return s._run(() => s._runToolAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), s;
  }
  async _createToolAssistantStream(e, t, n, o) {
    const s = o?.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort()));
    const r = {
      ...n,
      stream: !0
    }, a = await e.submitToolOutputs(t, r, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) E(this, pe, "m", to).call(this, u);
    if (a.controller.signal?.aborted) throw new Oe();
    return this._addRun(E(this, pe, "m", no).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const o = new Ft();
    return o._run(() => o._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  static createAssistantStream(e, t, n, o) {
    const s = new Ft();
    return s._run(() => s._runAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), s;
  }
  currentEvent() {
    return E(this, ms, "f");
  }
  currentRun() {
    return E(this, gs, "f");
  }
  currentMessageSnapshot() {
    return E(this, Je, "f");
  }
  currentRunStepSnapshot() {
    return E(this, ao, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(E(this, et, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(E(this, hs, "f"));
  }
  async finalRun() {
    if (await this.done(), !E(this, Bt, "f")) throw Error("Final run was not received.");
    return E(this, Bt, "f");
  }
  async _createThreadAssistantStream(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort()));
    const s = {
      ...t,
      stream: !0
    }, r = await e.createAndRun(s, {
      ...n,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of r) E(this, pe, "m", to).call(this, a);
    if (r.controller.signal?.aborted) throw new Oe();
    return this._addRun(E(this, pe, "m", no).call(this));
  }
  async _createAssistantStream(e, t, n, o) {
    const s = o?.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort()));
    const r = {
      ...n,
      stream: !0
    }, a = await e.create(t, r, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) E(this, pe, "m", to).call(this, u);
    if (a.controller.signal?.aborted) throw new Oe();
    return this._addRun(E(this, pe, "m", no).call(this));
  }
  static accumulateDelta(e, t) {
    for (const [n, o] of Object.entries(t)) {
      if (!e.hasOwnProperty(n)) {
        e[n] = o;
        continue;
      }
      let s = e[n];
      if (s == null) {
        e[n] = o;
        continue;
      }
      if (n === "index" || n === "type") {
        e[n] = o;
        continue;
      }
      if (typeof s == "string" && typeof o == "string") s += o;
      else if (typeof s == "number" && typeof o == "number") s += o;
      else if (Cr(s) && Cr(o)) s = this.accumulateDelta(s, o);
      else if (Array.isArray(s) && Array.isArray(o)) {
        if (s.every((r) => typeof r == "string" || typeof r == "number")) {
          s.push(...o);
          continue;
        }
        for (const r of o) {
          if (!Cr(r)) throw new Error(`Expected array delta entry to be an object but got: ${r}`);
          const a = r.index;
          if (a == null)
            throw console.error(r), new Error("Expected array delta entry to have an `index` property");
          if (typeof a != "number") throw new Error(`Expected array delta entry \`index\` property to be a number but got ${a}`);
          const u = s[a];
          u == null ? s.push(r) : s[a] = this.accumulateDelta(u, r);
        }
        continue;
      } else throw Error(`Unhandled record type: ${n}, deltaValue: ${o}, accValue: ${s}`);
      e[n] = s;
    }
    return e;
  }
  _addRun(e) {
    return e;
  }
  async _threadAssistantStream(e, t, n) {
    return await this._createThreadAssistantStream(t, e, n);
  }
  async _runAssistantStream(e, t, n, o) {
    return await this._createAssistantStream(t, e, n, o);
  }
  async _runToolAssistantStream(e, t, n, o) {
    return await this._createToolAssistantStream(t, e, n, o);
  }
};
Ft = lo, to = function(t) {
  if (!this.ended)
    switch (G(this, ms, t, "f"), E(this, pe, "m", Lc).call(this, t), t.event) {
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
        E(this, pe, "m", qc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        E(this, pe, "m", Uc).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        E(this, pe, "m", Dc).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, no = function() {
  if (this.ended) throw new q("stream has ended, this shouldn't happen");
  if (!E(this, Bt, "f")) throw Error("Final run has not been received");
  return E(this, Bt, "f");
}, Dc = function(t) {
  const [n, o] = E(this, pe, "m", Fc).call(this, t, E(this, Je, "f"));
  G(this, Je, n, "f"), E(this, hs, "f")[n.id] = n;
  for (const s of o) {
    const r = n.content[s.index];
    r?.type == "text" && this._emit("textCreated", r.text);
  }
  switch (t.event) {
    case "thread.message.created":
      this._emit("messageCreated", t.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      if (this._emit("messageDelta", t.data.delta, n), t.data.delta.content) for (const s of t.data.delta.content) {
        if (s.type == "text" && s.text) {
          let r = s.text, a = n.content[s.index];
          if (a && a.type == "text") this._emit("textDelta", r, a.text);
          else throw Error("The snapshot associated with this text delta is not text or missing");
        }
        if (s.index != E(this, an, "f")) {
          if (E(this, Dt, "f")) switch (E(this, Dt, "f").type) {
            case "text":
              this._emit("textDone", E(this, Dt, "f").text, E(this, Je, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", E(this, Dt, "f").image_file, E(this, Je, "f"));
              break;
          }
          G(this, an, s.index, "f");
        }
        G(this, Dt, n.content[s.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (E(this, an, "f") !== void 0) {
        const s = t.data.content[E(this, an, "f")];
        if (s) switch (s.type) {
          case "image_file":
            this._emit("imageFileDone", s.image_file, E(this, Je, "f"));
            break;
          case "text":
            this._emit("textDone", s.text, E(this, Je, "f"));
            break;
        }
      }
      E(this, Je, "f") && this._emit("messageDone", t.data), G(this, Je, void 0, "f");
  }
}, Uc = function(t) {
  const n = E(this, pe, "m", $c).call(this, t);
  switch (G(this, ao, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const o = t.data.delta;
      if (o.step_details && o.step_details.type == "tool_calls" && o.step_details.tool_calls && n.step_details.type == "tool_calls") for (const s of o.step_details.tool_calls) s.index == E(this, Ds, "f") ? this._emit("toolCallDelta", s, n.step_details.tool_calls[s.index]) : (E(this, Ne, "f") && this._emit("toolCallDone", E(this, Ne, "f")), G(this, Ds, s.index, "f"), G(this, Ne, n.step_details.tool_calls[s.index], "f"), E(this, Ne, "f") && this._emit("toolCallCreated", E(this, Ne, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      G(this, ao, void 0, "f"), t.data.step_details.type == "tool_calls" && E(this, Ne, "f") && (this._emit("toolCallDone", E(this, Ne, "f")), G(this, Ne, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Lc = function(t) {
  E(this, Ci, "f").push(t), this._emit("event", t);
}, $c = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return E(this, et, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = E(this, et, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let o = t.data;
      if (o.delta) {
        const s = Ft.accumulateDelta(n, o.delta);
        E(this, et, "f")[t.data.id] = s;
      }
      return E(this, et, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      E(this, et, "f")[t.data.id] = t.data;
      break;
  }
  if (E(this, et, "f")[t.data.id]) return E(this, et, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Fc = function(t, n) {
  let o = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, o];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let s = t.data;
      if (s.delta.content) for (const r of s.delta.content) if (r.index in n.content) {
        let a = n.content[r.index];
        n.content[r.index] = E(this, pe, "m", Bc).call(this, r, a);
      } else
        n.content[r.index] = r, o.push(r);
      return [n, o];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (n) return [n, o];
      throw Error("Received thread message event with no existing snapshot");
  }
  throw Error("Tried to accumulate a non-message event");
}, Bc = function(t, n) {
  return Ft.accumulateDelta(n, t);
}, qc = function(t) {
  switch (G(this, gs, t.data, "f"), t.event) {
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
      G(this, Bt, t.data, "f"), E(this, Ne, "f") && (this._emit("toolCallDone", E(this, Ne, "f")), G(this, Ne, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var la = class extends B {
  constructor() {
    super(...arguments), this.steps = new mh(this._client);
  }
  create(e, t, n) {
    const { include: o, ...s } = t;
    return this._client.post(R`/threads/${e}/runs`, {
      query: { include: o },
      body: s,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(R`/threads/${o}/runs/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(R`/threads/${o}/runs/${e}`, {
      body: s,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(R`/threads/${e}/runs`, te, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { thread_id: o } = t;
    return this._client.post(R`/threads/${o}/runs/${e}/cancel`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(o.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return lo.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const o = F([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: s, response: r } = await this.retrieve(e, t, {
        ...n,
        headers: {
          ...n?.headers,
          ...o
        }
      }).withResponse();
      switch (s.status) {
        case "queued":
        case "in_progress":
        case "cancelling":
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = r.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await Ao(a);
          break;
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return s;
      }
    }
  }
  stream(e, t, n) {
    return lo.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: o, ...s } = t;
    return this._client.post(R`/threads/${o}/runs/${e}/submit_tool_outputs`, {
      body: s,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async submitToolOutputsAndPoll(e, t, n) {
    const o = await this.submitToolOutputs(e, t, n);
    return await this.poll(o.id, t, n);
  }
  submitToolOutputsStream(e, t, n) {
    return lo.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
la.Steps = mh;
var Qs = class extends B {
  constructor() {
    super(...arguments), this.runs = new la(this._client), this.messages = new hh(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(R`/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(R`/threads/${e}`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(R`/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      stream: e.stream ?? !1,
      __synthesizeEventData: !0
    });
  }
  async createAndRunPoll(e, t) {
    const n = await this.createAndRun(e, t);
    return await this.runs.poll(n.id, { thread_id: n.thread_id }, t);
  }
  createAndRunStream(e, t) {
    return lo.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Qs.Runs = la;
Qs.Messages = hh;
var Sn = class extends B {
  constructor() {
    super(...arguments), this.realtime = new Ys(this._client), this.chatkit = new Xs(this._client), this.assistants = new uh(this._client), this.threads = new Qs(this._client);
  }
};
Sn.Realtime = Ys;
Sn.ChatKit = Xs;
Sn.Assistants = uh;
Sn.Threads = Qs;
var gh = class extends B {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
}, yh = class extends B {
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(R`/containers/${o}/files/${e}/content`, {
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, ua = class extends B {
  constructor() {
    super(...arguments), this.content = new yh(this._client);
  }
  create(e, t, n) {
    return this._client.post(R`/containers/${e}/files`, zs({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(R`/containers/${o}/files/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(R`/containers/${e}/files`, te, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { container_id: o } = t;
    return this._client.delete(R`/containers/${o}/files/${e}`, {
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers])
    });
  }
};
ua.Content = yh;
var ca = class extends B {
  constructor() {
    super(...arguments), this.files = new ua(this._client);
  }
  create(e, t) {
    return this._client.post("/containers", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(R`/containers/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", te, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(R`/containers/${e}`, {
      ...t,
      headers: F([{ Accept: "*/*" }, t?.headers])
    });
  }
};
ca.Files = ua;
var _h = class extends B {
  create(e, t, n) {
    const { include: o, ...s } = t;
    return this._client.post(R`/conversations/${e}/items`, {
      query: { include: o },
      body: s,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: o, ...s } = t;
    return this._client.get(R`/conversations/${o}/items/${e}`, {
      query: s,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(R`/conversations/${e}/items`, go, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { conversation_id: o } = t;
    return this._client.delete(R`/conversations/${o}/items/${e}`, n);
  }
}, da = class extends B {
  constructor() {
    super(...arguments), this.items = new _h(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/conversations", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(R`/conversations/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(R`/conversations/${e}`, {
      body: t,
      ...n
    });
  }
  delete(e, t) {
    return this._client.delete(R`/conversations/${e}`, t);
  }
};
da.Items = _h;
var vh = class extends B {
  create(e, t) {
    const n = !!e.encoding_format;
    let o = n ? e.encoding_format : "base64";
    n && fe(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const s = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: o
      },
      ...t
    });
    return n ? s : (fe(this._client).debug("embeddings/decoding base64 embeddings from base64"), s._thenUnwrap((r) => (r && r.data && r.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = RA(u);
    }), r)));
  }
}, Sh = class extends B {
  retrieve(e, t, n) {
    const { eval_id: o, run_id: s } = t;
    return this._client.get(R`/evals/${o}/runs/${s}/output_items/${e}`, n);
  }
  list(e, t, n) {
    const { eval_id: o, ...s } = t;
    return this._client.getAPIList(R`/evals/${o}/runs/${e}/output_items`, te, {
      query: s,
      ...n
    });
  }
}, fa = class extends B {
  constructor() {
    super(...arguments), this.outputItems = new Sh(this._client);
  }
  create(e, t, n) {
    return this._client.post(R`/evals/${e}/runs`, {
      body: t,
      ...n
    });
  }
  retrieve(e, t, n) {
    const { eval_id: o } = t;
    return this._client.get(R`/evals/${o}/runs/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(R`/evals/${e}/runs`, te, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { eval_id: o } = t;
    return this._client.delete(R`/evals/${o}/runs/${e}`, n);
  }
  cancel(e, t, n) {
    const { eval_id: o } = t;
    return this._client.post(R`/evals/${o}/runs/${e}`, n);
  }
};
fa.OutputItems = Sh;
var pa = class extends B {
  constructor() {
    super(...arguments), this.runs = new fa(this._client);
  }
  create(e, t) {
    return this._client.post("/evals", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(R`/evals/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(R`/evals/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/evals", te, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(R`/evals/${e}`, t);
  }
};
pa.Runs = fa;
var Th = class extends B {
  create(e, t) {
    return this._client.post("/files", nt({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(R`/files/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/files", te, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(R`/files/${e}`, t);
  }
  content(e, t) {
    return this._client.get(R`/files/${e}/content`, {
      ...t,
      headers: F([{ Accept: "application/binary" }, t?.headers]),
      __binaryResponse: !0
    });
  }
  async waitForProcessing(e, { pollInterval: t = 5e3, maxWait: n = 1800 * 1e3 } = {}) {
    const o = /* @__PURE__ */ new Set([
      "processed",
      "error",
      "deleted"
    ]), s = Date.now();
    let r = await this.retrieve(e);
    for (; !r.status || !o.has(r.status); )
      if (await Ao(t), r = await this.retrieve(e), Date.now() - s > n) throw new ji({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return r;
  }
}, Eh = class extends B {
}, wh = class extends B {
  run(e, t) {
    return this._client.post("/fine_tuning/alpha/graders/run", {
      body: e,
      ...t
    });
  }
  validate(e, t) {
    return this._client.post("/fine_tuning/alpha/graders/validate", {
      body: e,
      ...t
    });
  }
}, ha = class extends B {
  constructor() {
    super(...arguments), this.graders = new wh(this._client);
  }
};
ha.Graders = wh;
var Ch = class extends B {
  create(e, t, n) {
    return this._client.getAPIList(R`/fine_tuning/checkpoints/${e}/permissions`, Ks, {
      body: t,
      method: "post",
      ...n
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(R`/fine_tuning/checkpoints/${e}/permissions`, {
      query: t,
      ...n
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(R`/fine_tuning/checkpoints/${e}/permissions`, go, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: o } = t;
    return this._client.delete(R`/fine_tuning/checkpoints/${o}/permissions/${e}`, n);
  }
}, ma = class extends B {
  constructor() {
    super(...arguments), this.permissions = new Ch(this._client);
  }
};
ma.Permissions = Ch;
var Ah = class extends B {
  list(e, t = {}, n) {
    return this._client.getAPIList(R`/fine_tuning/jobs/${e}/checkpoints`, te, {
      query: t,
      ...n
    });
  }
}, ga = class extends B {
  constructor() {
    super(...arguments), this.checkpoints = new Ah(this._client);
  }
  create(e, t) {
    return this._client.post("/fine_tuning/jobs", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(R`/fine_tuning/jobs/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/fine_tuning/jobs", te, {
      query: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(R`/fine_tuning/jobs/${e}/cancel`, t);
  }
  listEvents(e, t = {}, n) {
    return this._client.getAPIList(R`/fine_tuning/jobs/${e}/events`, te, {
      query: t,
      ...n
    });
  }
  pause(e, t) {
    return this._client.post(R`/fine_tuning/jobs/${e}/pause`, t);
  }
  resume(e, t) {
    return this._client.post(R`/fine_tuning/jobs/${e}/resume`, t);
  }
};
ga.Checkpoints = Ah;
var Tn = class extends B {
  constructor() {
    super(...arguments), this.methods = new Eh(this._client), this.jobs = new ga(this._client), this.checkpoints = new ma(this._client), this.alpha = new ha(this._client);
  }
};
Tn.Methods = Eh;
Tn.Jobs = ga;
Tn.Checkpoints = ma;
Tn.Alpha = ha;
var Ih = class extends B {
}, ya = class extends B {
  constructor() {
    super(...arguments), this.graderModels = new Ih(this._client);
  }
};
ya.GraderModels = Ih;
var bh = class extends B {
  createVariation(e, t) {
    return this._client.post("/images/variations", nt({
      body: e,
      ...t
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", nt({
      body: e,
      ...t,
      stream: e.stream ?? !1
    }, this._client));
  }
  generate(e, t) {
    return this._client.post("/images/generations", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
}, Rh = class extends B {
  retrieve(e, t) {
    return this._client.get(R`/models/${e}`, t);
  }
  list(e) {
    return this._client.getAPIList("/models", Ks, e);
  }
  delete(e, t) {
    return this._client.delete(R`/models/${e}`, t);
  }
}, Ph = class extends B {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t
    });
  }
}, xh = class extends B {
  accept(e, t, n) {
    return this._client.post(R`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers])
    });
  }
  hangup(e, t) {
    return this._client.post(R`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: F([{ Accept: "*/*" }, t?.headers])
    });
  }
  refer(e, t, n) {
    return this._client.post(R`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers])
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(R`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: F([{ Accept: "*/*" }, n?.headers])
    });
  }
}, Mh = class extends B {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t
    });
  }
}, Zs = class extends B {
  constructor() {
    super(...arguments), this.clientSecrets = new Mh(this._client), this.calls = new xh(this._client);
  }
};
Zs.ClientSecrets = Mh;
Zs.Calls = xh;
function PA(e, t) {
  return !t || !MA(t) ? {
    ...e,
    output_parsed: null,
    output: e.output.map((n) => n.type === "function_call" ? {
      ...n,
      parsed_arguments: null
    } : n.type === "message" ? {
      ...n,
      content: n.content.map((o) => ({
        ...o,
        parsed: null
      }))
    } : n)
  } : Nh(e, t);
}
function Nh(e, t) {
  const n = e.output.map((s) => {
    if (s.type === "function_call") return {
      ...s,
      parsed_arguments: DA(t, s)
    };
    if (s.type === "message") {
      const r = s.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: xA(t, a.text)
      } : a);
      return {
        ...s,
        content: r
      };
    }
    return s;
  }), o = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || Ai(o), Object.defineProperty(o, "output_parsed", {
    enumerable: !0,
    get() {
      for (const s of o.output)
        if (s.type === "message") {
          for (const r of s.content) if (r.type === "output_text" && r.parsed !== null) return r.parsed;
        }
      return null;
    }
  }), o;
}
function xA(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function MA(e) {
  return !!oa(e.text?.format);
}
function NA(e) {
  return e?.$brand === "auto-parseable-tool";
}
function kA(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function DA(e, t) {
  const n = kA(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: NA(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function Ai(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const o of n.content) o.type === "output_text" && t.push(o.text);
  e.output_text = t.join("");
}
var Xt, ts, St, ns, Gc, Oc, Hc, Vc, UA = class kh extends ra {
  constructor(t) {
    super(), Xt.add(this), ts.set(this, void 0), St.set(this, void 0), ns.set(this, void 0), G(this, ts, t, "f");
  }
  static createResponse(t, n, o) {
    const s = new kh(n);
    return s._run(() => s._createOrRetrieveResponse(t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), s;
  }
  async _createOrRetrieveResponse(t, n, o) {
    const s = o?.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), E(this, Xt, "m", Gc).call(this);
    let r, a = null;
    "response_id" in n ? (r = await t.responses.retrieve(n.response_id, { stream: !0 }, {
      ...o,
      signal: this.controller.signal,
      stream: !0
    }), a = n.starting_after ?? null) : r = await t.responses.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    }), this._connected();
    for await (const u of r) E(this, Xt, "m", Oc).call(this, u, a);
    if (r.controller.signal?.aborted) throw new Oe();
    return E(this, Xt, "m", Hc).call(this);
  }
  [(ts = /* @__PURE__ */ new WeakMap(), St = /* @__PURE__ */ new WeakMap(), ns = /* @__PURE__ */ new WeakMap(), Xt = /* @__PURE__ */ new WeakSet(), Gc = function() {
    this.ended || G(this, St, void 0, "f");
  }, Oc = function(n, o) {
    if (this.ended) return;
    const s = (a, u) => {
      (o == null || u.sequence_number > o) && this._emit(a, u);
    }, r = E(this, Xt, "m", Vc).call(this, n);
    switch (s("event", n), n.type) {
      case "response.output_text.delta": {
        const a = r.output[n.output_index];
        if (!a) throw new q(`missing output at index ${n.output_index}`);
        if (a.type === "message") {
          const u = a.content[n.content_index];
          if (!u) throw new q(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new q(`expected content to be 'output_text', got ${u.type}`);
          s("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const a = r.output[n.output_index];
        if (!a) throw new q(`missing output at index ${n.output_index}`);
        a.type === "function_call" && s("response.function_call_arguments.delta", {
          ...n,
          snapshot: a.arguments
        });
        break;
      }
      default:
        s(n.type, n);
        break;
    }
  }, Hc = function() {
    if (this.ended) throw new q("stream has ended, this shouldn't happen");
    const n = E(this, St, "f");
    if (!n) throw new q("request ended without sending any events");
    G(this, St, void 0, "f");
    const o = LA(n, E(this, ts, "f"));
    return G(this, ns, o, "f"), o;
  }, Vc = function(n) {
    let o = E(this, St, "f");
    if (!o) {
      if (n.type !== "response.created") throw new q(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return o = G(this, St, n.response, "f"), o;
    }
    switch (n.type) {
      case "response.output_item.added":
        o.output.push(n.item);
        break;
      case "response.content_part.added": {
        const s = o.output[n.output_index];
        if (!s) throw new q(`missing output at index ${n.output_index}`);
        const r = s.type, a = n.part;
        r === "message" && a.type !== "reasoning_text" ? s.content.push(a) : r === "reasoning" && a.type === "reasoning_text" && (s.content || (s.content = []), s.content.push(a));
        break;
      }
      case "response.output_text.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new q(`missing output at index ${n.output_index}`);
        if (s.type === "message") {
          const r = s.content[n.content_index];
          if (!r) throw new q(`missing content at index ${n.content_index}`);
          if (r.type !== "output_text") throw new q(`expected content to be 'output_text', got ${r.type}`);
          r.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new q(`missing output at index ${n.output_index}`);
        s.type === "function_call" && (s.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const s = o.output[n.output_index];
        if (!s) throw new q(`missing output at index ${n.output_index}`);
        if (s.type === "reasoning") {
          const r = s.content?.[n.content_index];
          if (!r) throw new q(`missing content at index ${n.content_index}`);
          if (r.type !== "reasoning_text") throw new q(`expected content to be 'reasoning_text', got ${r.type}`);
          r.text += n.delta;
        }
        break;
      }
      case "response.completed":
        G(this, St, n.response, "f");
        break;
    }
    return o;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("event", (s) => {
      const r = n.shift();
      r ? r.resolve(s) : t.push(s);
    }), this.on("end", () => {
      o = !0;
      for (const s of n) s.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (s) => {
      o = !0;
      for (const r of n) r.reject(s);
      n.length = 0;
    }), this.on("error", (s) => {
      o = !0;
      for (const r of n) r.reject(s);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((s, r) => n.push({
        resolve: s,
        reject: r
      })).then((s) => s ? {
        value: s,
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
    const t = E(this, ns, "f");
    if (!t) throw new q("stream ended without producing a ChatCompletion");
    return t;
  }
};
function LA(e, t) {
  return PA(e, t);
}
var Dh = class extends B {
  list(e, t = {}, n) {
    return this._client.getAPIList(R`/responses/${e}/input_items`, te, {
      query: t,
      ...n
    });
  }
}, Uh = class extends B {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t
    });
  }
}, js = class extends B {
  constructor() {
    super(...arguments), this.inputItems = new Dh(this._client), this.inputTokens = new Uh(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && Ai(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(R`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1
    })._thenUnwrap((o) => ("object" in o && o.object === "response" && Ai(o), o));
  }
  delete(e, t) {
    return this._client.delete(R`/responses/${e}`, {
      ...t,
      headers: F([{ Accept: "*/*" }, t?.headers])
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Nh(n, e));
  }
  stream(e, t) {
    return UA.createResponse(this._client, e, t);
  }
  cancel(e, t) {
    return this._client.post(R`/responses/${e}/cancel`, t);
  }
  compact(e, t) {
    return this._client.post("/responses/compact", {
      body: e,
      ...t
    });
  }
};
js.InputItems = Dh;
js.InputTokens = Uh;
var Lh = class extends B {
  retrieve(e, t) {
    return this._client.get(R`/skills/${e}/content`, {
      ...t,
      headers: F([{ Accept: "application/binary" }, t?.headers]),
      __binaryResponse: !0
    });
  }
}, $h = class extends B {
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(R`/skills/${o}/versions/${e}/content`, {
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
}, _a = class extends B {
  constructor() {
    super(...arguments), this.content = new $h(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(R`/skills/${e}/versions`, zs({
      body: t,
      ...n
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(R`/skills/${o}/versions/${e}`, n);
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(R`/skills/${e}/versions`, te, {
      query: t,
      ...n
    });
  }
  delete(e, t, n) {
    const { skill_id: o } = t;
    return this._client.delete(R`/skills/${o}/versions/${e}`, n);
  }
};
_a.Content = $h;
var er = class extends B {
  constructor() {
    super(...arguments), this.content = new Lh(this._client), this.versions = new _a(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", zs({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(R`/skills/${e}`, t);
  }
  update(e, t, n) {
    return this._client.post(R`/skills/${e}`, {
      body: t,
      ...n
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/skills", te, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(R`/skills/${e}`, t);
  }
};
er.Content = Lh;
er.Versions = _a;
var Fh = class extends B {
  create(e, t, n) {
    return this._client.post(R`/uploads/${e}/parts`, nt({
      body: t,
      ...n
    }, this._client));
  }
}, va = class extends B {
  constructor() {
    super(...arguments), this.parts = new Fh(this._client);
  }
  create(e, t) {
    return this._client.post("/uploads", {
      body: e,
      ...t
    });
  }
  cancel(e, t) {
    return this._client.post(R`/uploads/${e}/cancel`, t);
  }
  complete(e, t, n) {
    return this._client.post(R`/uploads/${e}/complete`, {
      body: t,
      ...n
    });
  }
};
va.Parts = Fh;
var $A = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((s) => s.status === "rejected");
  if (n.length) {
    for (const s of n) console.error(s.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const o = [];
  for (const s of t) s.status === "fulfilled" && o.push(s.value);
  return o;
}, Bh = class extends B {
  create(e, t, n) {
    return this._client.post(R`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(R`/vector_stores/${o}/file_batches/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.post(R`/vector_stores/${o}/file_batches/${e}/cancel`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t);
    return await this.poll(e, o.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: o, ...s } = t;
    return this._client.getAPIList(R`/vector_stores/${o}/file_batches/${e}/files`, te, {
      query: s,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async poll(e, t, n) {
    const o = F([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: s, response: r } = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: o
      }).withResponse();
      switch (s.status) {
        case "in_progress":
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = r.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await Ao(a);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return s;
      }
    }
  }
  async uploadAndPoll(e, { files: t, fileIds: n = [] }, o) {
    if (t == null || t.length == 0) throw new Error("No `files` provided to process. If you've already uploaded files you should use `.createAndPoll()` instead");
    const s = o?.maxConcurrency ?? 5, r = Math.min(s, t.length), a = this._client, u = t.values(), c = [...n];
    async function d(p) {
      for (let f of p) {
        const h = await a.files.create({
          file: f,
          purpose: "assistants"
        }, o);
        c.push(h.id);
      }
    }
    return await $A(Array(r).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, qh = class extends B {
  create(e, t, n) {
    return this._client.post(R`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(R`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vector_store_id: o, ...s } = t;
    return this._client.post(R`/vector_stores/${o}/files/${e}`, {
      body: s,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(R`/vector_stores/${e}/files`, te, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.delete(R`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(e, o.id, n);
  }
  async poll(e, t, n) {
    const o = F([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const s = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: o
      }).withResponse(), r = s.data;
      switch (r.status) {
        case "in_progress":
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = s.response.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await Ao(a);
          break;
        case "failed":
        case "completed":
          return r;
      }
    }
  }
  async upload(e, t, n) {
    const o = await this._client.files.create({
      file: t,
      purpose: "assistants"
    }, n);
    return this.create(e, { file_id: o.id }, n);
  }
  async uploadAndPoll(e, t, n) {
    const o = await this.upload(e, t, n);
    return await this.poll(e, o.id, n);
  }
  content(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.getAPIList(R`/vector_stores/${o}/files/${e}/content`, Ks, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
}, tr = class extends B {
  constructor() {
    super(...arguments), this.files = new qh(this._client), this.fileBatches = new Bh(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  retrieve(e, t) {
    return this._client.get(R`/vector_stores/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  update(e, t, n) {
    return this._client.post(R`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", te, {
      query: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  delete(e, t) {
    return this._client.delete(R`/vector_stores/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers])
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(R`/vector_stores/${e}/search`, Ks, {
      body: t,
      method: "post",
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers])
    });
  }
};
tr.Files = qh;
tr.FileBatches = Bh;
var Gh = class extends B {
  create(e, t) {
    return this._client.post("/videos", nt({
      body: e,
      ...t
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(R`/videos/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/videos", go, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(R`/videos/${e}`, t);
  }
  createCharacter(e, t) {
    return this._client.post("/videos/characters", nt({
      body: e,
      ...t
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(R`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", nt({
      body: e,
      ...t
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", nt({
      body: e,
      ...t
    }, this._client));
  }
  getCharacter(e, t) {
    return this._client.get(R`/videos/characters/${e}`, t);
  }
  remix(e, t, n) {
    return this._client.post(R`/videos/${e}/remix`, zs({
      body: t,
      ...n
    }, this._client));
  }
}, nn, Oh, ys, Hh = class extends B {
  constructor() {
    super(...arguments), nn.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, o = 300) {
    return await this.verifySignature(e, t, n, o), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, o = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    E(this, nn, "m", Oh).call(this, n);
    const s = F([t]).values, r = E(this, nn, "m", ys).call(this, s, "webhook-signature"), a = E(this, nn, "m", ys).call(this, s, "webhook-timestamp"), u = E(this, nn, "m", ys).call(this, s, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new Kn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > o) throw new Kn("Webhook timestamp is too old");
    if (c > d + o) throw new Kn("Webhook timestamp is too new");
    const p = r.split(" ").map((g) => g.startsWith("v1,") ? g.substring(3) : g), f = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), h = u ? `${u}.${a}.${e}` : `${a}.${e}`, m = await crypto.subtle.importKey("raw", f, {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["verify"]);
    for (const g of p) try {
      const _ = Buffer.from(g, "base64");
      if (await crypto.subtle.verify("HMAC", m, _, new TextEncoder().encode(h))) return;
    } catch {
      continue;
    }
    throw new Kn("The given webhook signature does not match the expected signature");
  }
};
nn = /* @__PURE__ */ new WeakSet(), Oh = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, ys = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const o = t.get(n);
  if (o == null) throw new Error(`Missing required header: ${n}`);
  return o;
};
var Ii, Sa, _s, Vh, Nr = "workload-identity-auth", W = class {
  constructor({ baseURL: e = Yt("OPENAI_BASE_URL"), apiKey: t = Yt("OPENAI_API_KEY"), organization: n = Yt("OPENAI_ORG_ID") ?? null, project: o = Yt("OPENAI_PROJECT_ID") ?? null, webhookSecret: s = Yt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: r, ...a } = {}) {
    if (Ii.add(this), _s.set(this, void 0), this.completions = new gh(this), this.chat = new aa(this), this.embeddings = new vh(this), this.files = new Th(this), this.images = new bh(this), this.audio = new bo(this), this.moderations = new Ph(this), this.models = new Rh(this), this.fineTuning = new Tn(this), this.graders = new ya(this), this.vectorStores = new tr(this), this.webhooks = new Hh(this), this.beta = new Sn(this), this.batches = new lh(this), this.uploads = new va(this), this.responses = new js(this), this.realtime = new Zs(this), this.conversations = new da(this), this.evals = new pa(this), this.containers = new ca(this), this.skills = new er(this), this.videos = new Gh(this), r) {
      if (t && t !== Nr) throw new q("The `apiKey` and `workloadIdentity` arguments are mutually exclusive; only one can be passed at a time.");
      t = Nr;
    } else if (t === void 0) throw new q("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, or set the `OPENAI_API_KEY` environment variable.");
    const u = {
      apiKey: t,
      organization: n,
      project: o,
      webhookSecret: s,
      workloadIdentity: r,
      ...a,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (!u.dangerouslyAllowBrowser && xC()) throw new q(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = u.baseURL, this.timeout = u.timeout ?? Sa.DEFAULT_TIMEOUT, this.logger = u.logger ?? console;
    const c = "warn";
    this.logLevel = c, this.logLevel = Ic(u.logLevel, "ClientOptions.logLevel", this) ?? Ic(Yt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? c, this.fetchOptions = u.fetchOptions, this.maxRetries = u.maxRetries ?? 2, this.fetch = u.fetch ?? Ap(), G(this, _s, UC, "f"), this._options = u, r && (this._workloadIdentityAuth = new jC(r, this.fetch)), this.apiKey = typeof t == "string" ? t : "Missing Key", this.organization = n, this.project = o, this.webhookSecret = s;
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
  validateHeaders({ values: e, nulls: t }) {
  }
  async authHeaders(e) {
    return F([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  stringifyQuery(e) {
    return GC(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${en}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${fp()}`;
  }
  makeStatusError(e, t, n, o) {
    return me.generate(e, t, n, o);
  }
  async _callApiKey() {
    const e = this._options.apiKey;
    if (typeof e != "function") return !1;
    let t;
    try {
      t = await e();
    } catch (n) {
      throw n instanceof q ? n : new q(`Failed to get token from 'apiKey' function: ${n.message}`, { cause: n });
    }
    if (typeof t != "string" || !t) throw new q(`Expected 'apiKey' function argument to return a string but it returned ${t}`);
    return this.apiKey = t, !0;
  }
  buildURL(e, t, n) {
    const o = !E(this, Ii, "m", Vh).call(this) && n || this.baseURL, s = IC(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), r = this.defaultQuery(), a = Object.fromEntries(s.searchParams);
    return (!mc(r) || !mc(a)) && (t = {
      ...a,
      ...r,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (s.search = this.stringifyQuery(t)), s.toString();
  }
  async prepareOptions(e) {
    await this._callApiKey();
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
    return this.request(Promise.resolve(n).then((o) => ({
      method: e,
      path: t,
      ...o
    })));
  }
  request(e, t = null) {
    return new Lp(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, s = o.maxRetries ?? this.maxRetries;
    t == null && (t = s), await this.prepareOptions(o);
    const { req: r, url: a, timeout: u } = await this.buildRequest(o, { retryCount: s - t });
    await this.prepareRequest(r, {
      url: a,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, p = Date.now();
    if (fe(this).debug(`[${c}] sending request`, Nt({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: r.headers
    })), o.signal?.aborted) throw new Oe();
    const f = new AbortController(), h = await this.fetchWithAuth(a, r, u, f).catch(di), m = Date.now();
    if (h instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Oe();
      const v = ci(h) || /timed? ?out/i.test(String(h) + ("cause" in h ? String(h.cause) : ""));
      if (t)
        return fe(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${_}`), fe(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${_})`, Nt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - p,
          message: h.message
        })), this.retryRequest(o, t, n ?? c);
      throw fe(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), fe(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, Nt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - p,
        message: h.message
      })), h instanceof wp || h instanceof CC ? h : v ? new ji() : new Js({ cause: h });
    }
    const g = `[${c}${d}${[...h.headers.entries()].filter(([_]) => _ === "x-request-id").map(([_, v]) => ", " + _ + ": " + JSON.stringify(v)).join("")}] ${r.method} ${a} ${h.ok ? "succeeded" : "failed"} with status ${h.status} in ${m - p}ms`;
    if (!h.ok) {
      if (h.status === 401 && this._workloadIdentityAuth && !o.__metadata?.hasStreamingBody && !o.__metadata?.workloadIdentityTokenRefreshed)
        return await vc(h.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...o,
          __metadata: {
            ...o.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const _ = await this.shouldRetry(h);
      if (t && _) {
        const x = `retrying, ${t} attempts remaining`;
        return await vc(h.body), fe(this).info(`${g} - ${x}`), fe(this).debug(`[${c}] response error (${x})`, Nt({
          retryOfRequestLogID: n,
          url: h.url,
          status: h.status,
          headers: h.headers,
          durationMs: m - p
        })), this.retryRequest(o, t, n ?? c, h.headers);
      }
      const v = _ ? "error; no more retries left" : "error; not retryable";
      fe(this).info(`${g} - ${v}`);
      const w = await h.text().catch((x) => di(x).message), A = PC(w), b = A ? void 0 : w;
      throw fe(this).debug(`[${c}] response error (${v})`, Nt({
        retryOfRequestLogID: n,
        url: h.url,
        status: h.status,
        headers: h.headers,
        message: b,
        durationMs: Date.now() - p
      })), this.makeStatusError(h.status, A, b, h.headers);
    }
    return fe(this).info(g), fe(this).debug(`[${c}] response start`, Nt({
      retryOfRequestLogID: n,
      url: h.url,
      status: h.status,
      headers: h.headers,
      durationMs: m - p
    })), {
      response: h,
      options: o,
      controller: f,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: p
    };
  }
  getAPIList(e, t, n) {
    return this.requestAPIList(t, n && "then" in n ? n.then((o) => ({
      method: "get",
      path: e,
      ...o
    })) : {
      method: "get",
      path: e,
      ...n
    });
  }
  requestAPIList(e, t) {
    const n = this.makeRequest(t, null, void 0);
    return new XC(this, n, e);
  }
  async fetchWithAuth(e, t, n, o) {
    if (this._workloadIdentityAuth) {
      const s = t.headers, r = s.get("Authorization");
      if (!r || r === `Bearer ${Nr}`) {
        const a = await this._workloadIdentityAuth.getToken();
        s.set("Authorization", `Bearer ${a}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, o);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: s, method: r, ...a } = t || {}, u = this._makeAbort(o);
    s && s.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, p = {
      signal: o.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...a
    };
    r && (p.method = r.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, p);
    } finally {
      clearTimeout(c);
    }
  }
  async shouldRetry(e) {
    const t = e.headers.get("x-should-retry");
    return t === "true" ? !0 : t === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
  }
  async retryRequest(e, t, n, o) {
    let s;
    const r = o?.get("retry-after-ms");
    if (r) {
      const u = parseFloat(r);
      Number.isNaN(u) || (s = u);
    }
    const a = o?.get("retry-after");
    if (a && !s) {
      const u = parseFloat(a);
      Number.isNaN(u) ? s = Date.parse(a) - Date.now() : s = u * 1e3;
    }
    if (s === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      s = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await Ao(s), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const s = t - e;
    return Math.min(0.5 * Math.pow(2, s), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: s, query: r, defaultBaseURL: a } = n, u = this.buildURL(s, r, a);
    "timeout" in n && RC("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: c, body: d, isStreamingBody: p } = this.buildBody({ options: n });
    return p && (e.__metadata = {
      ...e.__metadata,
      hasStreamingBody: !0
    }), {
      req: {
        method: o,
        headers: await this.buildHeaders({
          options: e,
          method: o,
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
  async buildHeaders({ options: e, method: t, bodyHeaders: n, retryCount: o }) {
    let s = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), s[this.idempotencyHeader] = e.idempotencyKey);
    const r = F([
      s,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...DC(),
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project
      },
      await this.authHeaders(e),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(r), r.values;
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
    const n = F([t]), o = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, s = !o && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || o ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !s
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: bp(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...E(this, _s, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
Sa = W, _s = /* @__PURE__ */ new WeakMap(), Ii = /* @__PURE__ */ new WeakSet(), Vh = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
W.OpenAI = Sa;
W.DEFAULT_TIMEOUT = 6e5;
W.OpenAIError = q;
W.APIError = me;
W.APIConnectionError = Js;
W.APIConnectionTimeoutError = ji;
W.APIUserAbortError = Oe;
W.NotFoundError = gp;
W.ConflictError = yp;
W.RateLimitError = vp;
W.BadRequestError = pp;
W.AuthenticationError = hp;
W.InternalServerError = Sp;
W.PermissionDeniedError = mp;
W.UnprocessableEntityError = _p;
W.InvalidWebhookSignatureError = Kn;
W.toFile = sA;
W.Completions = gh;
W.Chat = aa;
W.Embeddings = vh;
W.Files = Th;
W.Images = bh;
W.Audio = bo;
W.Moderations = Ph;
W.Models = Rh;
W.FineTuning = Tn;
W.Graders = ya;
W.VectorStores = tr;
W.Webhooks = Hh;
W.Beta = Sn;
W.Batches = lh;
W.Uploads = va;
W.Responses = js;
W.Realtime = Zs;
W.Conversations = da;
W.Evals = pa;
W.Containers = ca;
W.Skills = er;
W.Videos = Gh;
function Jc(e = "", t = 0) {
  let n = 0;
  for (let o = t - 1; o >= 0 && e[o] === "\\"; o -= 1) n += 1;
  return n % 2 === 1;
}
function FA(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function BA(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function qA(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function GA(e = "") {
  const t = String(e ?? "");
  let n = "", o = 0;
  for (; o < t.length; ) {
    const s = t.slice(o, o + 2), r = t.slice(o + 2, o + 6);
    if (s !== "\\u" || Jc(t, o) || !FA(r)) {
      n += t[o] || "", o += 1;
      continue;
    }
    const a = o + 6, u = t.slice(a + 2, a + 6);
    if (BA(r) && t.slice(a, a + 2) === "\\u" && !Jc(t, a) && qA(u)) {
      const c = Number.parseInt(r, 16), d = Number.parseInt(u, 16), p = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(p), o += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(r, 16)), o += 6;
  }
  return n;
}
function OA(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), GA(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function HA(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Ta(e = "", t = "", n = 0) {
  const o = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${HA(t)}(?:\\\\?")?\\s*:`, "i"), s = String(e || "").slice(Math.max(0, n)).match(o);
  if (!s || s.index === void 0) return null;
  const r = s[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + s.index + r,
    end: Math.max(0, n) + s.index + s[0].length
  };
}
function VA(e = "", t = [], n = 0) {
  return t.map((o) => Ta(e, o, n)).filter(Boolean).sort((o, s) => o.index - s.index)[0] || null;
}
function tt(e = "", t = "", n = []) {
  const o = String(e || ""), s = Ta(o, t);
  if (!s) return;
  let r = s.end;
  for (; /\s/.test(o[r] || ""); ) r += 1;
  o[r] === '"' && (r += 1);
  const a = VA(o, n.filter((d) => d !== t), r);
  let u = a ? a.index : o.length;
  if (a) {
    const d = o.lastIndexOf(",", a.index);
    d >= r && (u = d);
  }
  let c = o.slice(r, u).trim();
  return a || (c = c.replace(/\}\s*$/, "").trimEnd()), OA(c);
}
function Tt(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var vs = {
  Read: [
    "filePath",
    "path",
    "scope",
    "fromLine",
    "toLine",
    "tail",
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
}, JA = [
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
  "startOrder",
  "endOrder",
  "full"
];
function Wc(e = "", t = [], n = []) {
  for (const o of t) {
    const s = tt(e, o, n);
    if (s !== void 0) return s;
  }
}
function WA(e = "", t = "") {
  if (t === "Write") {
    const n = {}, o = Wc(e, ["filePath", "path"], ["content"]), s = tt(e, "content", []);
    return o !== void 0 && (n.filePath = Tt(o)), s !== void 0 && (n.content = Tt(s)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, o = Wc(e, ["filePath", "path"], ["edits"]), s = tt(e, "edits", []);
    return o !== void 0 && (n.filePath = Tt(o)), s !== void 0 && (n.edits = Tt(s)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = vs.Grep, o = {};
    return n.forEach((s, r) => {
      const a = tt(e, s, n.slice(r + 1));
      a !== void 0 && (o[s] = Tt(a));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "MemoryGrep") {
    const n = vs.MemoryGrep, o = {};
    return n.forEach((s) => {
      const r = tt(e, s, n.filter((a) => a !== s));
      r !== void 0 && (o[s] = Tt(r));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  if (t === "ChatHistory") {
    const n = vs.ChatHistory, o = {};
    return n.forEach((s) => {
      const r = tt(e, s, n.filter((a) => a !== s));
      r !== void 0 && (o[s] = Tt(r));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  return null;
}
function KA(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const a = JSON.parse(n);
    if (a && typeof a == "object" && !Array.isArray(a)) return a;
  } catch {
  }
  const o = WA(n, t);
  if (o) return o;
  const s = vs[t] || JA, r = {};
  return s.forEach((a, u) => {
    const c = tt(n, a, s.slice(u + 1));
    c !== void 0 && (r[a] = Tt(c));
  }), Object.keys(r).length ? r : null;
}
function zA(e = "", t = "") {
  const n = KA(e, t);
  return n ? JSON.stringify(n) : "";
}
function Jh(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Ke(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function Ie(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function ge(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Wh(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function Kh(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : Wh(e);
  return zA(n, t) || JSON.stringify(Jh(n));
}
function YA(e = "") {
  const t = String(e || ""), n = Ta(t, "arguments");
  if (!n) return "";
  let o = n.end;
  for (; /\s/.test(t[o] || ""); ) o += 1;
  const s = t[o] || "";
  return s === "{" ? t.slice(o).replace(/\}\s*$/, "").trimEnd() : s === '"' ? t.slice(o + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(o).replace(/\}\s*$/, "").trimEnd();
}
function XA(e = "", t = 0) {
  const n = String(e || "").trim(), o = tt(n, "name", ["id", "arguments"]) || tt(n, "toolName", ["id", "arguments"]) || "", s = tt(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, r = YA(n);
  return !o || !r ? null : {
    id: s,
    name: o,
    arguments: Kh(r, o)
  };
}
function QA(e, t = 0, n = "openai-tool") {
  if (!ge(e)) return null;
  const o = ge(e.function) ? e.function : null, s = String(o?.name || "").trim();
  if (!s) return null;
  const r = Ie(e) || {};
  return delete r.index, r.id = String(r.id || `${n}-${t + 1}`), r.type = "function", r.function = {
    ...Ie(o) || {},
    name: s,
    arguments: Wh(o.arguments)
  }, r;
}
function qt(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, o) => QA(n, o, t)).filter(Boolean);
}
function Ea(e) {
  if (!ge(e)) return null;
  const t = Ie(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = Lt(Ut(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = qt(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function Et(e = [], t = "openai-tool") {
  return qt(e, t).map((n, o) => ({
    id: n.id || `${t}-${Date.now()}-${o + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function zh(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function Ut(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, o) => (Ke(t, "思考块", o), "")).trim(),
    thoughts: t
  };
}
function Lt(e = "") {
  const t = String(e || ""), n = t.search(/<tool_call\b/i);
  return n < 0 ? t.trim() : t.slice(0, n).trim();
}
function bi(e = "") {
  const t = String(e || "");
  return /<tool_call\b/i.test(t) ? [{
    id: "tagged-json-draft",
    name: t.match(/["']?name["']?\s*:\s*["']([^"']+)/i)?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }] : [];
}
function kt(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      Ke(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((o) => kt(e, o, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && Ke(e, n, t.text), typeof t.content == "string" && Ke(e, n, t.content), typeof t.reasoning_content == "string" && Ke(e, n, t.reasoning_content), typeof t.thinking == "string" && Ke(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((o) => {
      if (typeof o == "string") {
        Ke(e, "推理摘要", o);
        return;
      }
      o && typeof o == "object" && Ke(e, "推理摘要", o.text || o.content || "");
    }));
  }
}
function wt(e = {}, t = {}) {
  const n = [];
  return kt(n, e.reasoning_content, "推理文本"), kt(n, e.reasoning, "推理文本"), kt(n, e.reasoning_text, "推理文本"), kt(n, e.thinking, "思考块"), kt(n, t.reasoning_content, "推理文本"), kt(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        Ke(n, "推理文本", o.text);
        return;
      }
      if (o.type === "summary_text") {
        Ke(n, "推理摘要", o.text);
        return;
      }
      (o.type === "thinking" || o.type === "reasoning" || o.type === "reasoning_content") && Ke(n, "思考块", o.text || o.content || o.reasoning || "");
    }
  }), n;
}
function uo(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((o) => {
    [...e.matchAll(o)].forEach((s, r) => {
      try {
        const a = JSON.parse(s[1]);
        n.push({
          id: a.id || `tool-call-${r + 1}`,
          name: String(a.name || ""),
          arguments: Kh(a.arguments, a.name)
        });
      } catch {
        const a = XA(s[1], r);
        a && n.push(a);
      }
    });
  }), n.filter((o) => o.name);
}
function nr(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : Ea(t);
}
function ZA(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function jA(e) {
  if (qt(e?.tool_calls).length > 0) return !0;
  const t = nr(e);
  return Array.isArray(t?.tool_calls) && t.tool_calls.length > 0;
}
function eI(e = {}) {
  const t = qt(e?.tool_calls);
  if (t.length) return t;
  const n = qt(nr(e)?.tool_calls);
  return n.length ? n : [];
}
function tI(e = {}) {
  return qt(e?.tool_calls).length > 0;
}
function nI(e, t, n) {
  return e?.role !== "assistant" || t <= n ? !1 : jA(e);
}
function oI(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function Kc(e, t = "") {
  return !ge(e) || !oI(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var zc = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function sI(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((o) => Ie(o) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((o, s) => {
    const r = Ie(o) || {}, a = Number.isInteger(Number(o?.index)) ? Number(o.index) : s, u = n[a];
    n[a] = ge(u) ? Gt(u, r, "tool_call") : r;
  }), n.filter((o) => o !== void 0);
}
function Gt(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return Ie(t);
  if (t === null && zc.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return sI(e, t);
  if (typeof e == "string" && typeof t == "string")
    return zc.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : Ie(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(Ie(t) || []);
  if (ge(e) && ge(t)) {
    const o = { ...e };
    return Object.entries(t).forEach(([s, r]) => {
      o[s] = Gt(o[s], r, s);
    }), o;
  }
  return Ie(t);
}
function Us(e = {}, t = {}) {
  const n = ge(e) ? Ie(e) || {} : {}, o = ge(t) ? Ie(t) || {} : {};
  return delete o.message, delete o.finish_reason, delete o.index, delete o.logprobs, delete o.delta, Object.entries(o).forEach(([s, r]) => {
    n[s] = Gt(n[s], r, s);
  }), n.role || (n.role = "assistant"), Ea(n) || { role: "assistant" };
}
function co(e, t = {}) {
  const n = Ea(Us(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function rI(e = {}, t = {}) {
  return ge(e) ? ge(t) ? Gt(Ie(e) || {}, t, "") : Ie(e) : Ie(t);
}
function Ri(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], o = ZA(n), s = n.map((a, u) => {
    const c = qt(a?.tool_calls);
    if (nI(a, u, o)) {
      const p = nr(a);
      if (tI(p)) return Kc({
        ...p,
        ...c.length ? { tool_calls: c } : {}
      }, t);
    }
    const d = {
      role: a.role,
      content: a.content
    };
    return a.role === "tool" && a.tool_call_id && (d.tool_call_id = a.tool_call_id), a.role === "assistant" && c.length && (d.tool_calls = c), Kc(d, t);
  }), r = String(e.systemPrompt || "").trim();
  return r && s[0]?.role !== "system" && s.unshift({
    role: "system",
    content: r
  }), s;
}
function Yc(e) {
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
function Pi(e) {
  const t = /* @__PURE__ */ new Map(), n = [];
  return (Array.isArray(e.messages) ? e.messages : []).forEach((o) => {
    if (o.role === "assistant") {
      const s = eI(o);
      if (s.length) {
        const r = nr(o), a = typeof r?.content == "string" ? r.content : String(o.content || ""), u = s.map((c, d) => {
          const p = c.function?.name || "", f = c.id || `tool-call-${d + 1}`;
          return p && t.set(f, p), `<tool_call>${JSON.stringify({
            id: f,
            name: p,
            arguments: Jh(c.function?.arguments || "{}")
          })}</tool_call>`;
        }).join(`
`);
        n.push({
          role: "assistant",
          content: [a, u].filter(Boolean).join(`

`)
        });
        return;
      }
    }
    if (o.role === "tool") {
      const s = String(o.toolName || o.tool_name || "").trim() || t.get(o.tool_call_id || "") || "unknown_tool";
      o.tool_call_id && t.delete(o.tool_call_id);
      const r = String(o.content || "");
      n.push({
        role: "user",
        content: [
          "<tool_result>",
          "这是系统工具执行结果，不是用户新发言。",
          `name: ${s}`,
          "content:",
          r,
          "</tool_result>"
        ].join(`
`)
      });
      return;
    }
    n.push({
      role: o.role,
      content: o.content
    });
  }), !n.length || n[0].role !== "system" ? n.unshift({
    role: "system",
    content: Yc(e)
  }) : n[0] = {
    ...n[0],
    content: Yc({
      ...e,
      systemPrompt: n[0].content || e.systemPrompt
    })
  }, n;
}
function Xc(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Qc(e, t, n) {
  !e || !t || n === void 0 || (e[t] = Gt(e[t], n, t));
}
function iI(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const o = Number(n?.index ?? 0), s = { ...e.tool_calls[o] || {} };
    Object.entries(n || {}).forEach(([r, a]) => {
      if (r !== "index" && !(r === "function" && a == null)) {
        if (r === "function" && ge(a)) {
          s.function = ge(s.function) ? { ...s.function } : {}, Object.entries(a).forEach(([u, c]) => {
            s.function[u] = Gt(s.function[u], c, u);
          });
          return;
        }
        s[r] = Gt(s[r], a, r);
      }
    }), e.tool_calls[o] = s;
  }));
}
function xi(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([o, s]) => {
    o === "delta" || o === "finish_reason" || o === "index" || o === "logprobs" || Qc(e, o, s);
  });
  const n = ge(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([o, s]) => {
    if (o === "tool_calls") {
      iI(e, s);
      return;
    }
    Qc(e, o, s);
  });
}
function Mi(e, t = {}) {
  if (!e || !ge(t)) return;
  const n = Number(t.index ?? 0), o = e.toolCalls[n] || {
    id: "",
    type: "function",
    function: {
      name: "",
      arguments: ""
    }
  }, s = ge(t.function) ? t.function : {};
  e.toolCalls[n] = {
    ...o,
    id: t.id || o.id,
    type: t.type || o.type,
    function: {
      name: s.name || o.function?.name || "",
      arguments: `${o.function?.arguments || ""}${s.arguments || ""}`
    }
  };
}
async function aI(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("openai_compatible_stream_missing_body");
  const o = new TextDecoder();
  let s = "";
  const r = /\r?\n\r?\n/;
  for (; ; ) {
    const { done: u, value: c } = await n.read();
    if (u) break;
    for (s += o.decode(c, { stream: !0 }); ; ) {
      const d = s.match(r);
      if (!d || typeof d.index != "number") break;
      const p = d.index, f = s.slice(0, p);
      s = s.slice(p + d[0].length);
      const h = f.split(/\r?\n/).filter((m) => m.startsWith("data:")).map((m) => m.slice(5).trimStart()).join(`
`).trim();
      !h || h === "[DONE]" || t(JSON.parse(h));
    }
  }
  const a = s.trim();
  if (a && a !== "[DONE]") {
    const u = a.split(/\r?\n/).filter((c) => c.startsWith("data:")).map((c) => c.slice(5).trimStart()).join(`
`).trim();
    u && u !== "[DONE]" && t(JSON.parse(u));
  }
}
var lI = class {
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
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = !t && Array.isArray(e.tools) && e.tools.length ? e.tools : null, o = {
      model: this.config.model,
      messages: t ? Pi(e) : Ri(e, this.config.model),
      ...n ? {
        tools: n,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (o.temperature = e.temperature), e.reasoning?.enabled && (o.reasoning_effort = e.reasoning.effort), o;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = {
      ...t.body || this.buildRequestBody(e),
      ...n ? { stream: !0 } : {}
    }, s = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
    return ho({
      provider: "openai-compatible",
      model: this.config.model,
      transport: "openai-compatible",
      url: `${s}/chat/completions`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: o,
      sdk: n ? "client.chat.completions.create(..., { stream: true })" : "client.chat.completions.create"
    });
  }
  async streamNativeChatCompletions(e, t) {
    const n = `${String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`, o = await fetch(n, {
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
      const g = await o.text().catch(() => "");
      throw new Error(g || `openai_compatible_stream_http_${o.status}`);
    }
    const s = {
      content: "",
      toolCalls: []
    }, r = { role: "assistant" };
    let a = "stop", u = this.config.model;
    await aI(o, (g) => {
      u = g?.model || u;
      const _ = g?.choices?.[0], v = _?.delta || {};
      xi(r, _), _?.finish_reason && (a = _.finish_reason), typeof v.content == "string" && (s.content += v.content), Array.isArray(v.tool_calls) && v.tool_calls.forEach((x) => {
        Mi(s, x);
      });
      const w = Ut(s.content), A = s.toolCalls.filter((x) => x?.function?.name), b = A.length ? Et(s.toolCalls) : bi(w.cleaned);
      Xc(e, {
        text: A.length ? w.cleaned : Lt(w.cleaned),
        thoughts: wt(r, _).concat(w.thoughts),
        ...b.length ? { toolCalls: b } : {},
        ...!A.length && b.length ? { toolCallDraft: !0 } : {}
      });
    });
    const c = co(r), d = Et(s.toolCalls), p = Ut(s.content), f = wt(r, {});
    p.thoughts.forEach((g) => f.push(g));
    const h = d.length ? [] : uo(p.cleaned), m = [...d, ...h];
    return {
      text: d.length ? p.cleaned : Lt(p.cleaned),
      toolCalls: m,
      thoughts: f,
      finishReason: a,
      model: u,
      provider: "openai-compatible",
      providerPayload: c
    };
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = typeof e.onStreamProgress == "function", o = this.buildRequestBody(e), s = this.inspectRequest(e, { body: o });
    if (n) {
      if (!t) return {
        ...await this.streamNativeChatCompletions(e, o),
        requestInspection: s
      };
      const _ = await this.client.chat.completions.create({
        ...o,
        stream: !0
      }, { signal: e.signal }), v = {
        content: "",
        toolCalls: []
      }, w = { role: "assistant" };
      let A = "stop", b = this.config.model, x;
      for await (const j of _) {
        b = j.model || b;
        const ee = j.choices?.[0], Q = ee?.delta || {};
        xi(w, ee), ee?.finish_reason && (A = ee.finish_reason), typeof Q.content == "string" && (v.content += Q.content), Array.isArray(Q.tool_calls) && Q.tool_calls.forEach((Te) => {
          Mi(v, Te);
        });
        const X = Ut(v.content), he = v.toolCalls.filter((Te) => Te?.function?.name), $e = he.length ? Et(v.toolCalls) : bi(X.cleaned);
        Xc(e, {
          text: he.length ? X.cleaned : Lt(X.cleaned),
          thoughts: wt(w, ee).concat(X.thoughts),
          ...$e.length ? { toolCalls: $e } : {},
          ...!he.length && $e.length ? { toolCallDraft: !0 } : {}
        });
      }
      const M = (typeof _.finalChatCompletion == "function" ? await _.finalChatCompletion() : null)?.choices?.[0] || null, C = rI(w, Us(M?.message || w, M || {}));
      x = co(C);
      const L = Et(v.toolCalls), P = Ut(v.content), N = wt(C, M || {});
      P.thoughts.forEach((j) => N.push(j));
      const H = L.length ? [] : uo(P.cleaned), z = [...L, ...H];
      return {
        text: L.length ? P.cleaned : Lt(P.cleaned),
        toolCalls: z,
        thoughts: N,
        finishReason: A,
        model: b,
        provider: "openai-compatible",
        providerPayload: x,
        requestInspection: s
      };
    }
    const r = await this.client.chat.completions.create(o, { signal: e.signal }), a = r.choices?.[0] || {}, u = a.message || {}, c = wt(u, a), d = Et(u.tool_calls || []), p = Ut(zh(u.content));
    p.thoughts.forEach((_) => c.push(_));
    const f = d.length ? [] : uo(p.cleaned), h = [...d, ...f], m = d.length ? p.cleaned : Lt(p.cleaned), g = Us(u, a);
    return {
      text: m,
      toolCalls: h,
      thoughts: c,
      finishReason: a.finish_reason || "stop",
      model: r.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: co(g),
      requestInspection: s
    };
  }
};
function Yh(e, t) {
  return {
    type: "message",
    role: e,
    content: uI(t)
  };
}
function Ls(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function uI(e) {
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
function $s(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function Zc(e, t = [], n = {}) {
  (t || []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        $s(e, n.reasoning || "推理文本", o.text);
        return;
      }
      o.type === "summary_text" && $s(e, n.summary || "推理摘要", o.text);
    }
  });
}
function cI(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (Zc(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), Zc(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function dI(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function fI(e) {
  const t = e?.choices?.[0]?.message?.content;
  if (typeof t == "string" && t.trim()) return t.trim();
  if (typeof e?.output_text == "string" && e.output_text.trim()) return e.output_text.trim();
  const n = [];
  return (Array.isArray(e?.output) ? e.output : []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "message" && Array.isArray(o.content)) {
        o.content.forEach((s) => {
          if (!(!s || typeof s != "object")) {
            if (s.type === "output_text" && typeof s.text == "string" && s.text.trim()) {
              n.push(s.text.trim());
              return;
            }
            s.type === "refusal" && typeof s.refusal == "string" && s.refusal.trim() && n.push(s.refusal.trim());
          }
        });
        return;
      }
      typeof o.text == "string" && o.text.trim() && n.push(o.text.trim());
    }
  }), n.join(`
`).trim();
}
function pI(e) {
  const t = e?.choices?.[0], n = t?.message?.content, o = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const s = n.toLowerCase();
  return !s.includes("proxy error") || !s.includes("/responses") && !o.toLowerCase().includes("proxy error") ? null : n.trim();
}
function hI(e) {
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
        n.content?.trim() && t.push(Ls(n.content)), n.tool_calls.forEach((o, s) => {
          t.push({
            type: "function_call",
            call_id: o.id || `function_call_${s + 1}`,
            name: o.function?.name || "",
            arguments: o.function?.arguments || "{}",
            status: "completed"
          });
        });
        continue;
      }
      if (n.role === "assistant") {
        t.push(Ls(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? Yh(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function mI(e) {
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
      n.content?.trim() && t.push(Ls(n.content)), n.tool_calls.forEach((o, s) => {
        t.push({
          type: "function_call",
          call_id: o.id || `function_call_${s + 1}`,
          name: o.function?.name || "",
          arguments: o.function?.arguments || "{}",
          status: "completed"
        });
      });
      continue;
    }
    if (n.role === "assistant") {
      t.push(Ls(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? Yh(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function gI(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function yI(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function _I(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function kr(e, t) {
  const [n = "0", o = "0"] = String(e || "").split(":"), [s = "0", r = "0"] = String(t || "").split(":");
  return Number(n) - Number(s) || Number(o) - Number(r);
}
var vI = class {
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
      instructions: t ? void 0 : dI(e) || void 0,
      input: t ? mI(e) : hI(e),
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
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (n.temperature = e.temperature), e.reasoning?.enabled && (n.reasoning = {
      effort: e.reasoning.effort,
      summary: "detailed"
    }), n;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = t.legacySystemInInput === !0, s = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
    return ho({
      provider: "openai-responses",
      model: this.config.model,
      transport: "openai-responses",
      url: `${s}/responses`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: t.body || this.buildRequestBody(e, o),
      sdk: n ? "client.responses.stream" : "client.responses.create"
    });
  }
  async chat(e) {
    let t = this.inspectRequest(e);
    const n = (c) => {
      const d = pI(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const p = Array.isArray(c.output) ? c.output : [];
      return {
        output: p,
        thoughts: cI(p),
        toolCalls: p.filter((f) => f.type === "function_call" && f.name).map((f, h) => ({
          id: f.call_id || `response-tool-${h + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: fI(c)
      };
    }, o = async (c = !1) => {
      const d = this.buildRequestBody(e, c);
      return t = this.inspectRequest(e, {
        body: d,
        legacySystemInInput: c
      }), await this.client.responses.create(d, { signal: e.signal });
    }, s = async (c = !1) => {
      const d = this.buildRequestBody(e, c);
      t = this.inspectRequest(e, {
        body: d,
        legacySystemInInput: c
      });
      const p = this.client.responses.stream(d, { signal: e.signal }), f = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), g = () => {
        const _ = [];
        Array.from(h.entries()).sort(([v], [w]) => kr(v, w)).forEach(([, v]) => $s(_, "推理文本", v)), Array.from(m.entries()).sort(([v], [w]) => kr(v, w)).forEach(([, v]) => $s(_, "推理摘要", v)), _I(e, {
          text: Array.from(f.entries()).sort(([v], [w]) => kr(v, w)).map(([, v]) => v).join(`
`).trim(),
          thoughts: _
        });
      };
      return p.on("response.output_text.delta", (_) => {
        const v = `${_.output_index}:${_.content_index}`;
        f.set(v, `${f.get(v) || ""}${_.delta}`), g();
      }), p.on("response.reasoning_text.delta", (_) => {
        const v = `${_.output_index}:${_.content_index}`;
        h.set(v, `${h.get(v) || ""}${_.delta}`), g();
      }), p.on("response.reasoning_summary_text.delta", (_) => {
        const v = `${_.output_index}:${_.summary_index}`;
        m.set(v, `${m.get(v) || ""}${_.delta}`), g();
      }), await p.finalResponse();
    }, r = !gI(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await s(!1) : await o(!1), u = n(a), r && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await s(!0) : await o(!0), u = n(a));
    } catch (c) {
      if (!r || !yI(c)) throw c;
      a = typeof e.onStreamProgress == "function" ? await s(!0) : await o(!0), u = n(a);
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
async function SI(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("host_chat_completions_stream_missing_body");
  const o = new TextDecoder();
  let s = "";
  const r = /\r?\n\r?\n/, a = (c) => {
    const d = c.split(/\r?\n/).filter((p) => p.startsWith("data:")).map((p) => p.slice(5).trimStart()).join(`
`).trim();
    !d || d === "[DONE]" || t(JSON.parse(d));
  };
  for (; ; ) {
    const { done: c, value: d } = await n.read();
    if (c) break;
    for (s += o.decode(d, { stream: !0 }); ; ) {
      const p = s.match(r);
      if (!p || typeof p.index != "number") break;
      const f = s.slice(0, p.index);
      s = s.slice(p.index + p[0].length), a(f);
    }
  }
  const u = s.trim();
  u && a(u);
}
var En = "openai", wa = "claude", Ca = "makersuite", TI = "/api/backends/chat-completions/status", EI = "/api/backends/chat-completions/generate", Xh = Object.freeze({
  [wa]: "https://api.anthropic.com/v1",
  [Ca]: "https://generativelanguage.googleapis.com"
}), Qh = null;
function wI(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function CI(e, t) {
  const n = wI(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function AI(e) {
  Qh = typeof e == "function" ? e : null;
}
async function Zh() {
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(Qh?.() || {}),
    Accept: "application/json"
  };
}
function II(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, o]) => {
    t[n] = /authorization|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : o;
  }), t;
}
async function Ro(e = {}, t = !1) {
  const n = await Zh(), o = {
    url: EI,
    method: "POST",
    headers: II(n),
    body: {
      ...e,
      stream: !!t
    }
  };
  return Object.defineProperty(o, "rawHeaders", {
    value: n,
    enumerable: !1
  }), o;
}
function bI(e = "") {
  return /^\s*<!DOCTYPE\s+html/i.test(String(e || ""));
}
function RI(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function PI() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function pn(e = "", t = "") {
  return RI(e) || bI(e) ? PI() : String(e || t || "").trim();
}
function jh(e = {}, t = En) {
  const n = CI(e.baseUrl, t), o = String(e.apiKey || "").trim(), s = Xh[t] || "", r = n || (o ? s : ""), a = { chat_completion_source: t || "openai" };
  return r && (a.reverse_proxy = r), o && (a.proxy_password = o), a;
}
function xI(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function MI(e = {}, t = En) {
  return jh(e, t);
}
function Aa(e = {}, t = {}, n = [], o = !1, s = En) {
  return xI({
    ...jh(e, s),
    stream: !!o,
    messages: n,
    model: e.model,
    max_tokens: t.maxTokens,
    temperature: t.reasoning?.enabled ? void 0 : t.temperature,
    tools: Array.isArray(t.tools) && t.tools.length ? t.tools : void 0,
    tool_choice: Array.isArray(t.tools) && t.tools.length ? t.toolChoice || "auto" : void 0,
    use_sysprompt: s === "openai" ? void 0 : !0,
    reasoning_effort: t.reasoning?.enabled ? t.reasoning.effort : void 0,
    include_reasoning: s === "openai" ? void 0 : t.reasoning?.enabled ? !0 : void 0
  });
}
function NI(e = {}, t = {}, n = [], o = !1) {
  return Aa(e, t, n, o, En);
}
function kI(e = {}, t = {}, n = [], o = !1) {
  return Aa(e, t, n, o, wa);
}
function DI(e = {}, t = {}, n = [], o = !1) {
  return Aa(e, t, n, o, Ca);
}
async function UI(e = {}, t = En, n = {}) {
  const o = await fetch(TI, {
    method: "POST",
    headers: await Zh(),
    body: JSON.stringify(MI(e, t)),
    signal: n.signal
  }), s = await o.text();
  let r = null;
  try {
    r = s ? JSON.parse(s) : {};
  } catch (u) {
    throw new Error(`酒馆后端模型列表拉取失败：${pn(s, String(u?.message || u))}`);
  }
  if (!o.ok || r?.error) {
    const u = pn(r?.message || r?.error?.message || s, `HTTP ${o.status}`);
    throw new Error(`酒馆后端模型列表拉取失败：${u}`);
  }
  const a = Array.isArray(r?.data) ? r.data.map((u) => String(u?.id || u?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(a)];
}
async function Ia(e = {}, t = {}) {
  const n = await Ro(e, !1);
  typeof t.onRequest == "function" && t.onRequest(n);
  const o = await fetch(n.url, {
    method: n.method,
    headers: n.rawHeaders || n.headers,
    body: JSON.stringify(n.body),
    signal: t.signal
  }), s = await o.text();
  let r = null;
  try {
    r = s ? JSON.parse(s) : {};
  } catch (a) {
    throw new Error(`酒馆后端生成失败：${pn(s, String(a?.message || a))}`);
  }
  if (!o.ok || r?.error) {
    const a = pn(r?.error?.message || r?.message || s, `HTTP ${o.status}`);
    throw new Error(`酒馆后端生成失败：${a}`);
  }
  return r;
}
async function ba(e = {}, t, n = {}) {
  const o = await Ro(e, !0);
  typeof n.onRequest == "function" && n.onRequest(o);
  const s = await fetch(o.url, {
    method: o.method,
    headers: o.rawHeaders || o.headers,
    body: JSON.stringify(o.body),
    signal: n.signal
  });
  if (!s.ok) {
    const r = await s.text().catch(() => "");
    throw new Error(pn(r, `酒馆后端流式生成失败：HTTP ${s.status}`));
  }
  await SI(s, (r) => {
    if (r?.error) {
      const a = pn(r.error?.message || r.message || JSON.stringify(r.error), "酒馆后端流式生成失败");
      throw new Error(a);
    }
    t(r);
  });
}
function Ot(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function em(e = "") {
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
function LI(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const o = em(t.function.arguments || "{}");
    return {
      type: "tool_use",
      id: String(t.id || n),
      name: n,
      input: o.input,
      ...o.ok ? {} : {
        invalidInputJson: o.raw,
        inputParseError: o.error
      }
    };
  }).filter(Boolean);
}
function $I(e = []) {
  const t = Array.isArray(e) ? Ot(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function FI(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  return t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const s = Ot(o) || {}, r = $I(s?.providerPayload?.anthropicContent), a = LI(s.tool_calls);
    delete s.providerPayload, s.role === "assistant" && r && a.length ? (delete s.tool_calls, s.content = r.filter((u) => u?.type !== "tool_use").concat(a)) : s.role === "assistant" && r && (delete s.tool_calls, s.content = r), n.push(s);
  }), n;
}
function BI(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const o = em(t.inputJson);
        return {
          type: "tool_use",
          id: String(t.id || t.name),
          name: String(t.name),
          input: o.input,
          ...o.ok ? {} : {
            invalidInputJson: o.raw,
            inputParseError: o.error
          }
        };
      }
      const n = Ot(t.input);
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
    } : Ot(t) || null;
  }).filter(Boolean);
}
function qI(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: Ot(t.input) || {}
  } : Ot(t) || null).filter(Boolean);
}
function GI(e = []) {
  const t = Array.isArray(e) ? e : [], n = t.filter((r) => r?.type === "text").map((r) => r.text || "").join(`
`), o = t.filter((r) => r?.type === "thinking" || r?.type === "redacted_thinking").map((r) => ({
    label: r.type === "thinking" ? "思考块" : "已脱敏思考块",
    text: r.type === "thinking" ? r.thinking || "" : r.data || ""
  })).filter((r) => r.text), s = t.filter((r) => r?.type === "tool_use" && r.name).map((r, a) => ({
    id: r.id || `st-claude-tool-${a + 1}`,
    name: r.name,
    arguments: r.inputJson !== void 0 ? r.inputJson : JSON.stringify(r.input || {})
  }));
  return {
    text: n,
    thoughts: o,
    ...s.length ? {
      toolCalls: s,
      toolCallDraft: !0
    } : {}
  };
}
function tm(e = [], t = {}) {
  const n = BI(e), o = n.filter((s) => s.type === "tool_use" && s.name).map((s, r) => ({
    id: s.id || `st-claude-tool-${r + 1}`,
    name: s.name,
    arguments: s.invalidInputJson !== void 0 ? s.invalidInputJson : JSON.stringify(s.input || {})
  }));
  return {
    text: n.filter((s) => s.type === "text").map((s) => s.text || "").join(`
`),
    toolCalls: o,
    thoughts: n.filter((s) => s.type === "thinking" || s.type === "redacted_thinking").map((s) => ({
      label: s.type === "thinking" ? "思考块" : "已脱敏思考块",
      text: s.type === "thinking" ? s.thinking || "" : s.data || ""
    })).filter((s) => s.text),
    finishReason: t.finishReason || "stop",
    model: t.model || "",
    provider: "sillytavern-claude",
    providerPayload: n.length ? { anthropicContent: qI(n) } : void 0
  };
}
function OI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function HI(e, t = {}) {
  const n = [];
  let o = "stop", s = t.model || "";
  const r = (u, c = {}) => {
    const d = Number.isInteger(Number(u)) ? Number(u) : n.length;
    return n[d] ? n[d] = {
      ...n[d],
      ...c
    } : n[d] = { ...c }, n[d];
  }, a = () => {
    const u = GI(n);
    OI(e, {
      text: u.text,
      thoughts: u.thoughts,
      ...Array.isArray(u.toolCalls) ? { toolCalls: u.toolCalls } : {},
      ...u.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(u = {}) {
      if (u?.message?.model && (s = u.message.model), u.type === "content_block_start") {
        r(u.index, Ot(u.content_block) || {}), a();
        return;
      }
      if (u.type === "content_block_delta") {
        const c = r(u.index), d = u.delta || {};
        d.type === "text_delta" ? (c.type = c.type || "text", c.text = `${c.text || ""}${d.text || ""}`) : d.type === "input_json_delta" ? (c.type = c.type || "tool_use", c.inputJson = `${c.inputJson || ""}${d.partial_json || ""}`) : d.type === "thinking_delta" ? (c.type = c.type || "thinking", c.thinking = `${c.thinking || ""}${d.thinking || ""}`) : d.type === "signature_delta" && (c.signature = `${c.signature || ""}${d.signature || ""}`), a();
        return;
      }
      u.type === "message_delta" && (o = u.delta?.stop_reason || o);
    },
    result() {
      return tm(n, {
        finishReason: o,
        model: s
      });
    }
  };
}
var VI = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return FI(e);
  }
  buildPayload(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildMessages(e);
    return kI(this.config, e, n, t);
  }
  async inspectRequest(e, t = {}) {
    const n = await Ro(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n);
  }
  buildRequestInspection(e) {
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: fn(e)
    };
  }
  async chat(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildPayload(e);
    let o = null;
    const s = (r) => {
      o = this.buildRequestInspection(r);
    };
    try {
      if (t) {
        const a = HI(e, this.config);
        return await ba(n, (u) => {
          a.accept(u);
        }, {
          signal: e.signal,
          onRequest: s
        }), {
          ...a.result(),
          requestInspection: o
        };
      }
      const r = await Ia(n, {
        signal: e.signal,
        onRequest: s
      });
      return {
        ...tm(Array.isArray(r?.content) ? r.content : [{
          type: "text",
          text: r?.choices?.[0]?.message?.content || ""
        }], {
          finishReason: r?.stop_reason || r?.choices?.[0]?.finish_reason || "stop",
          model: r?.model || this.config.model
        }),
        requestInspection: o
      };
    } catch (r) {
      throw o && r && typeof r == "object" && (r.requestInspection = o), r;
    }
  }
};
function Ra(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function hn(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = Ra(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function JI(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((s) => hn(s)).filter((s) => Array.isArray(s.parts) && s.parts.length);
  const n = e?.providerPayload?.googleContent, o = hn(n);
  return o.parts.length ? [o] : [];
}
function WI(e = {}) {
  const t = String(e?.mimeType || "").trim(), n = String(e?.data || "").trim();
  if (!t || !n) return null;
  const o = `data:${t};base64,${n}`;
  return t.startsWith("image/") ? {
    type: "image_url",
    image_url: { url: o }
  } : t.startsWith("video/") ? {
    type: "video_url",
    video_url: { url: o }
  } : t.startsWith("audio/") ? {
    type: "audio_url",
    audio_url: { url: o }
  } : null;
}
function KI(e = {}, t = 0) {
  const n = hn(e);
  if (!n.parts.length) return null;
  const o = {
    role: n.role === "user" ? "user" : "assistant",
    content: []
  }, s = n.parts.find((a) => !a?.thought && typeof a?.text == "string" && typeof a?.thoughtSignature == "string" && a.thoughtSignature)?.thoughtSignature || "", r = [];
  return n.parts.forEach((a) => {
    if (!a || typeof a != "object") return;
    if (!a.thought && typeof a.text == "string" && a.text) {
      o.content.push({
        type: "text",
        text: a.text
      });
      return;
    }
    if (a.functionCall?.name) {
      r.push({
        id: String(a.functionCall.id || `st-google-tool-${t + 1}-${r.length + 1}`),
        type: "function",
        function: {
          name: String(a.functionCall.name || ""),
          arguments: JSON.stringify(a.functionCall.args || {})
        },
        ...typeof a.thoughtSignature == "string" && a.thoughtSignature ? { signature: a.thoughtSignature } : {}
      });
      return;
    }
    const u = WI(a.inlineData);
    u && o.content.push(u);
  }), r.length && o.content.push({
    type: "tool_calls",
    tool_calls: r
  }), s && o.content.some((a) => a?.type === "text") && (o.signature = s), o.content.length ? o : null;
}
function zI(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  return t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const s = JI(o);
    if (o.role === "assistant" && s.length) {
      s.forEach((a, u) => {
        const c = KI(a, u);
        c && n.push(c);
      });
      return;
    }
    const r = Ra(o) || {};
    delete r.providerPayload, n.push(r);
  }), n;
}
function nm(e = {}) {
  return hn(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function om(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function sm(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function rm(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function YI(e, t) {
  const n = String(t || ""), o = String(e || "");
  return n ? !o || n.startsWith(o) ? n : o.endsWith(n) ? o : `${o}${n}` : o;
}
function XI(e = [], t = []) {
  const n = Array.isArray(e) ? [...e] : [];
  return t.forEach((o) => {
    const s = [
      o.id || "",
      o.name || "",
      o.arguments || ""
    ].join("\0");
    n.some((r) => [
      r.id || "",
      r.name || "",
      r.arguments || ""
    ].join("\0") === s) || n.push(o);
  }), n;
}
function im(e) {
  const t = hn(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function QI(e = {}, t = {}) {
  const n = nm(e), o = e?.choices?.[0]?.message?.content || "";
  return {
    text: om(n) || o,
    toolCalls: rm(n),
    thoughts: sm(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: im(n)
  };
}
function ZI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function jI(e, t = {}) {
  let n = "", o = [], s = [], r = "STOP", a = t.model || "";
  const u = [];
  return {
    accept(c = {}) {
      a = c.model || c.modelVersion || a, r = c?.candidates?.[0]?.finishReason || r;
      const d = nm(c);
      d.parts.length && u.push(...Ra(d.parts) || []), n = YI(n, om(d)), o = XI(o, rm(d));
      const p = sm(d);
      p.length && (s = p), ZI(e, {
        text: n,
        thoughts: s,
        ...o.length ? {
          toolCalls: o,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const c = hn({
        role: "model",
        parts: u.length ? u : n ? [{ text: n }] : []
      });
      return {
        text: n,
        toolCalls: o,
        thoughts: s,
        finishReason: r,
        model: a,
        provider: "sillytavern-google",
        providerPayload: im(c)
      };
    }
  };
}
var e0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return zI(e);
  }
  buildPayload(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildMessages(e);
    return DI(this.config, e, n, t);
  }
  async inspectRequest(e, t = {}) {
    const n = await Ro(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n);
  }
  buildRequestInspection(e) {
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: fn(e)
    };
  }
  async chat(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildPayload(e);
    let o = null;
    const s = (r) => {
      o = this.buildRequestInspection(r);
    };
    try {
      if (t) {
        const r = jI(e, this.config);
        return await ba(n, (a) => {
          r.accept(a);
        }, {
          signal: e.signal,
          onRequest: s
        }), {
          ...r.result(),
          requestInspection: o
        };
      }
      return {
        ...QI(await Ia(n, {
          signal: e.signal,
          onRequest: s
        }), { model: this.config.model }),
        requestInspection: o
      };
    } catch (r) {
      throw o && r && typeof r == "object" && (r.requestInspection = o), r;
    }
  }
};
function t0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Dr(e, t = []) {
  const n = Ut(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : Lt(n.cleaned)
  };
}
function n0(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var o0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? Pi(e) : Ri(e, this.config.model);
  }
  buildPayload(e, t = !1) {
    const n = t ? Pi(e) : Ri(e, this.config.model);
    return NI(this.config, t ? {
      ...e,
      tools: void 0,
      toolChoice: void 0
    } : e, n, typeof e.onStreamProgress == "function");
  }
  async inspectRequest(e, t = {}) {
    const n = await Ro(t.payload || this.buildPayload(e, !!t.taggedMode), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n);
  }
  buildRequestInspection(e) {
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: fn(e)
    };
  }
  async streamChat(e, t, n = {}) {
    const o = {
      content: "",
      toolCalls: []
    }, s = { role: "assistant" };
    let r = "stop", a = this.config.model;
    await ba(t, (h) => {
      a = h?.model || a;
      const m = h?.choices?.[0] || {}, g = m.delta || {};
      xi(s, m), m.finish_reason && (r = m.finish_reason), typeof g.content == "string" && (o.content += g.content), Array.isArray(g.tool_calls) && g.tool_calls.forEach((b) => {
        Mi(o, b);
      });
      const _ = o.toolCalls.filter((b) => b?.function?.name), { thinkTagged: v, cleanedText: w } = Dr(o.content, _), A = _.length ? Et(o.toolCalls, "st-openai-tool") : bi(v.cleaned);
      t0(e, {
        text: w,
        thoughts: wt(s, m).concat(v.thoughts),
        ...A.length ? { toolCalls: A } : {},
        ...!_.length && A.length ? { toolCallDraft: !0 } : {}
      });
    }, {
      signal: e.signal,
      onRequest: n.onRequest
    });
    const u = Et(o.toolCalls, "st-openai-tool"), { thinkTagged: c, cleanedText: d } = Dr(o.content, u), p = wt(s, {});
    c.thoughts.forEach((h) => p.push(h));
    const f = u.length ? [] : uo(c.cleaned);
    return {
      text: d,
      toolCalls: [...u, ...f],
      thoughts: p,
      finishReason: r,
      model: a,
      provider: "sillytavern-openai-compatible",
      providerPayload: co(s)
    };
  }
  async nonStreamingChat(e, t, n = {}) {
    const o = await Ia(t, {
      signal: e.signal,
      onRequest: n.onRequest
    }), s = o.choices?.[0] || {}, r = s.message || {}, a = wt(r, s), u = Et(r.tool_calls || [], "st-openai-tool"), { thinkTagged: c, cleanedText: d } = Dr(zh(r.content), u);
    c.thoughts.forEach((h) => a.push(h));
    const p = u.length ? [] : uo(c.cleaned), f = Us(r, s);
    return {
      text: d,
      toolCalls: [...u, ...p],
      thoughts: a,
      finishReason: s.finish_reason || "stop",
      model: o.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: co(f)
    };
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = Array.isArray(e.tools) && e.tools.length > 0, o = async (r) => {
      let a = null;
      const u = (c) => {
        a = this.buildRequestInspection(c);
      };
      try {
        return {
          ...typeof e.onStreamProgress == "function" ? await this.streamChat(e, r, { onRequest: u }) : await this.nonStreamingChat(e, r, { onRequest: u }),
          requestInspection: a
        };
      } catch (c) {
        throw a && c && typeof c == "object" && (c.requestInspection = a), c;
      }
    }, s = this.buildPayload(e, t);
    try {
      return await o(s);
    } catch (r) {
      if (t || !n || !n0(r)) throw r;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await o(this.buildPayload(e, !0));
  }
}, jc = 900 * 1e3, ed = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), Ni = Object.freeze([
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
]), s0 = Object.freeze([
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
function td(e = "") {
  return e === "anthropic" || e === "sillytavern-claude";
}
function r0(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function ke(e = "") {
  return Ni.some((t) => t.value === e) ? e : "medium";
}
function De(e, t = 0.2) {
  const n = typeof e == "string" && !e.trim() ? t : e, o = Number(n);
  return Number.isFinite(o) ? Math.max(0, Math.min(2, o)) : De(t, 0.2);
}
function dn(e = {}) {
  return e.sendTemperature !== !1;
}
function nd(e = {}) {
  return dn(e) ? De(e.temperature, 0.2) : void 0;
}
function od(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : s0.find((n) => n.value === e)?.label || e || "未配置";
}
function i0(e = {}, t = {}) {
  const n = ss(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const c = n.delegateConfig.provider || "openai-compatible", d = (n.delegateConfig.modelConfigs || on())[c] || on()[c] || {};
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: c,
      baseUrl: String(d.baseUrl || ""),
      model: String(d.model || ""),
      apiKey: String(d.apiKey || ""),
      tavilyApiKey: Ur(n.tavilyApiKey),
      tavilyBaseUrl: Ge(n.tavilyBaseUrl),
      temperature: nd(d),
      sendTemperature: dn(d),
      maxTokens: td(c) ? 32e3 : null,
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: d.toolMode || "native",
      reasoningEnabled: !!d.reasoningEnabled,
      reasoningEffort: ke(d.reasoningEffort)
    };
  }
  const o = ne(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), s = n.presets?.[o] ? o : n.presets?.[n.currentPresetName] ? n.currentPresetName : Di, r = n.presets?.[s] || we(), a = r.provider || n.provider || "openai-compatible", u = (r.modelConfigs || n.modelConfigs || on())[a] || on()[a] || {};
  return {
    currentPresetName: String(s || ""),
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    tavilyApiKey: Ur(n.tavilyApiKey),
    tavilyBaseUrl: Ge(n.tavilyBaseUrl),
    temperature: nd(u),
    sendTemperature: dn(u),
    maxTokens: td(a) ? 32e3 : null,
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoningEnabled: !!u.reasoningEnabled,
    reasoningEffort: ke(u.reasoningEffort)
  };
}
function a0(e = {}, t = {}) {
  if (!e.apiKey && !r0(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (e.provider) {
    case "sillytavern-openai-compatible":
      return new o0(e);
    case "sillytavern-claude":
      return new VI(e);
    case "sillytavern-google":
      return new e0(e);
    case "openai-responses":
      return new vI(e);
    case "anthropic":
      return new bg(e);
    case "google":
      return new wC(e);
    default:
      return new lI(e);
  }
}
var l0 = { chat: { exclude: [
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
] } }, u0 = Object.freeze([
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
function je(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const o = document.createElement("option");
    o.value = "", o.textContent = n, e.appendChild(o);
  }
  t.forEach((o) => {
    const s = document.createElement("option");
    s.value = o.value, s.textContent = o.label, e.appendChild(s);
  });
}
function yo(e = []) {
  const t = [...new Set(e.filter(Boolean).map((s) => String(s).trim()).filter(Boolean))], n = l0.chat, o = t.filter((s) => {
    const r = s.toLowerCase();
    return !n.exclude.some((a) => r.includes(a));
  });
  return o.length ? o : t;
}
function os(e = "") {
  return e === "delegate" ? "delegate" : "main";
}
function mn(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function c0(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function Qt(e = "") {
  return e === "openai-compatible" || e === "sillytavern-openai-compatible";
}
function ki(e = "") {
  return e === "anthropic" || e === "sillytavern-claude";
}
function d0(e = "") {
  return e === "sillytavern-claude" ? wa : e === "sillytavern-google" ? Ca : En;
}
function _o(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function f0(e) {
  const t = mn(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return _o([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return _o([`${t}/v1/models`, `${t}/models`]);
}
function am(e) {
  const t = mn(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return _o([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return _o([`${t}/v1/models`, `${t}/models`]);
}
function p0(e, t) {
  const n = mn(e);
  if (!n) return [];
  const o = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return _o([
    `${n}/models?key=${encodeURIComponent(t)}`,
    `${n}/models`,
    `${o}/v1beta/models?key=${encodeURIComponent(t)}`,
    `${o}/v1beta/models`,
    `${o}/models?key=${encodeURIComponent(t)}`,
    `${o}/models`
  ]);
}
function h0(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((o) => typeof o == "string" && o.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function m0(e, t = {}) {
  const n = await fetch(e, t), o = await n.text();
  let s = null, r = null;
  try {
    s = o ? JSON.parse(o) : {};
  } catch (a) {
    r = a;
  }
  return {
    ok: n.ok,
    status: n.status,
    url: e,
    data: s,
    rawText: o,
    parseError: r,
    errorSnippet: h0(s, o)
  };
}
function g0(e) {
  return yo((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function lm(e) {
  return yo((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function y0(e) {
  return yo((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function Ss({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: o }) {
  let s = null;
  for (const r of e) for (const a of t) {
    const u = await m0(r, a);
    if (!u.ok) {
      s = u;
      continue;
    }
    if (u.parseError) {
      s = {
        ...u,
        errorSnippet: "返回的不是 JSON"
      };
      continue;
    }
    const c = n(u.data);
    if (c.length) return c;
    s = {
      ...u,
      errorSnippet: "返回成功，但模型列表为空"
    };
  }
  if (s) {
    const r = s.url ? ` (${s.url})` : "", a = s.errorSnippet ? `：${s.errorSnippet}` : "";
    throw new Error(`${o} 拉取模型失败：${s.status || "unknown"}${a}${r}`);
  }
  throw new Error(`${o} 拉取模型失败：未获取到模型列表。`);
}
async function _0(e) {
  const t = String(e.apiKey || "").trim(), n = mn(e.baseUrl || ""), o = mn(n || Xh.claude);
  if (t && o) try {
    return await Ss({
      urls: am(o),
      requestOptionsList: [{ headers: {
        "x-api-key": t,
        "anthropic-version": "2023-06-01",
        Accept: "application/json"
      } }],
      extractModels: lm,
      providerLabel: "Anthropic"
    });
  } catch (s) {
    if (n) throw s;
  }
  return [...u0];
}
async function sd(e) {
  const t = e.provider, n = mn(e.baseUrl || ""), o = String(e.apiKey || "").trim();
  if (t === "sillytavern-claude") return yo(await _0(e));
  if (c0(t)) return yo(await UI(e, d0(t)));
  if (!o) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await Ss({
    urls: p0(n, o),
    requestOptionsList: [
      { headers: {
        Accept: "application/json",
        "x-goog-api-key": o
      } },
      { headers: {
        Accept: "application/json",
        Authorization: `Bearer ${o}`
      } },
      { headers: { Accept: "application/json" } }
    ],
    extractModels: y0,
    providerLabel: "Google AI"
  }) : ki(t) ? await Ss({
    urls: am(n),
    requestOptionsList: [{ headers: {
      "x-api-key": o,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: lm,
    providerLabel: "Anthropic"
  }) : await Ss({
    urls: f0(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${o}`,
      Accept: "application/json"
    } }],
    extractModels: g0,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function v0(e) {
  return e instanceof Error ? e.message : String(e || "unknown_error");
}
function A0(e = {}) {
  const { state: t, render: n, showToast: o, createRequestId: s = (y = "req") => `${y}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, saveConfig: r, describeError: a = v0, getRuntimeSummaryText: u } = e;
  function c() {
    t.configFormSyncPending = !0;
  }
  function d(y, S = "main") {
    const I = String(y || "").trim() || "openai-compatible";
    return S === "delegate" ? `delegate:${I}` : I;
  }
  function p(y, S = "main") {
    return t.pullStateByProvider?.[d(y, S)] || {
      status: "idle",
      message: ""
    };
  }
  function f(y, S, I = "main") {
    t.pullStateByProvider = {
      ...t.pullStateByProvider || {},
      [d(y, I)]: S
    };
  }
  function h(y, S, I = "main") {
    t.modelOptionsByProvider = {
      ...t.modelOptionsByProvider || {},
      [d(y, I)]: Array.isArray(S) ? S : []
    };
  }
  function m(y, S = "main") {
    const I = d(y, S);
    return Array.isArray(t.modelOptionsByProvider?.[I]) ? t.modelOptionsByProvider[I] : [];
  }
  function g(y, S) {
    const I = t.config?.presets || {}, $ = ne(y || S || "默认");
    return I[$] ? $ : S && I[S] ? S : Object.keys(I)[0] || "默认";
  }
  function _(y, S) {
    const I = g(y, Di), $ = S && typeof S == "object" ? S : we(), K = $.provider || "openai-compatible", Z = Ue($.modelConfigs || {}), ue = Z[K] || {};
    return {
      delegatePresetName: I,
      delegateProvider: K,
      delegateModelConfigs: Z,
      delegateBaseUrl: String(ue.baseUrl || ""),
      delegateModel: String(ue.model || ""),
      delegateApiKey: String(ue.apiKey || ""),
      delegateTemperature: De(ue.temperature, 0.2),
      delegateSendTemperature: dn(ue),
      delegateReasoningEnabled: !!ue.reasoningEnabled,
      delegateReasoningEffort: ke(ue.reasoningEffort),
      delegateToolMode: ue.toolMode || "native"
    };
  }
  function v(y = "openai-compatible", S = {}) {
    const I = Ue(S || {})[y] || {};
    return {
      baseUrl: String(I.baseUrl || ""),
      model: String(I.model || ""),
      apiKey: String(I.apiKey || ""),
      temperature: De(I.temperature, 0.2),
      sendTemperature: dn(I),
      reasoningEnabled: !!I.reasoningEnabled,
      reasoningEffort: ke(I.reasoningEffort),
      toolMode: I.toolMode || "native"
    };
  }
  function w(y = "openai-compatible", S = {}) {
    const I = Ue(S || {})[y] || {};
    return {
      delegateBaseUrl: String(I.baseUrl || ""),
      delegateModel: String(I.model || ""),
      delegateApiKey: String(I.apiKey || ""),
      delegateTemperature: De(I.temperature, 0.2),
      delegateSendTemperature: dn(I),
      delegateReasoningEnabled: !!I.reasoningEnabled,
      delegateReasoningEffort: ke(I.reasoningEffort),
      delegateToolMode: I.toolMode || "native"
    };
  }
  function A(y, S, I = t.config) {
    const $ = ne(y || "默认"), K = S && typeof S == "object" ? S : we(), Z = K.provider || "openai-compatible", ue = Ue(K.modelConfigs || {}), rt = v(Z, ue), it = g(I?.delegatePresetName, $), or = _(it, I?.delegateConfig && typeof I.delegateConfig == "object" ? I.delegateConfig : (I?.presets || {})[it] || K);
    return {
      currentPresetName: $,
      presetDraftName: $,
      provider: Z,
      modelConfigs: ue,
      ...rt,
      tavilyApiKey: String(I?.tavilyApiKey || ""),
      tavilyBaseUrl: Ge(I?.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: sn(K.permissionMode),
      jsApiPermission: dt(I?.jsApiPermission),
      ...or
    };
  }
  function b() {
    if (t.configDraft) return t.configDraft;
    const y = ne(t.config?.currentPresetName || "默认");
    return t.configDraft = A(y, (t.config?.presets || {})[y] || we()), t.configDraft;
  }
  function x(y) {
    const S = b(), I = y.querySelector("#xb-assistant-provider")?.value || S.provider || "openai-compatible", $ = y.querySelector("#xb-assistant-delegate-provider")?.value || S.delegateProvider || "openai-compatible", K = {
      baseUrl: y.querySelector("#xb-assistant-base-url")?.value.trim() || "",
      model: y.querySelector("#xb-assistant-model")?.value.trim() || "",
      apiKey: y.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      temperature: De(y.querySelector("#xb-assistant-temperature")?.value, S.temperature ?? 0.2),
      sendTemperature: y.querySelector("#xb-assistant-send-temperature")?.checked ?? !!(S.sendTemperature ?? !0),
      reasoningEnabled: y.querySelector("#xb-assistant-reasoning-enabled")?.checked || !1,
      reasoningEffort: ke(y.querySelector("#xb-assistant-reasoning-effort")?.value),
      toolMode: Qt(I) ? y.querySelector("#xb-assistant-tool-mode")?.value || S.toolMode || "native" : void 0
    }, Z = {
      baseUrl: y.querySelector("#xb-assistant-delegate-base-url")?.value.trim() ?? S.delegateBaseUrl ?? "",
      model: y.querySelector("#xb-assistant-delegate-model")?.value.trim() ?? S.delegateModel ?? "",
      apiKey: y.querySelector("#xb-assistant-delegate-api-key")?.value.trim() ?? S.delegateApiKey ?? "",
      temperature: De(y.querySelector("#xb-assistant-delegate-temperature")?.value, S.delegateTemperature ?? 0.2),
      sendTemperature: y.querySelector("#xb-assistant-delegate-send-temperature")?.checked ?? !!(S.delegateSendTemperature ?? !0),
      reasoningEnabled: y.querySelector("#xb-assistant-delegate-reasoning-enabled")?.checked ?? !!S.delegateReasoningEnabled,
      reasoningEffort: ke(y.querySelector("#xb-assistant-delegate-reasoning-effort")?.value || S.delegateReasoningEffort),
      toolMode: Qt($) ? y.querySelector("#xb-assistant-delegate-tool-mode")?.value || S.delegateToolMode || "native" : void 0
    }, ue = {
      ...Ue(S.modelConfigs || {}),
      [I]: {
        ...Ue(S.modelConfigs || {})[I] || {},
        ...K
      }
    }, rt = {
      ...Ue(S.delegateModelConfigs || {}),
      [$]: {
        ...Ue(S.delegateModelConfigs || {})[$] || {},
        ...Z
      }
    };
    return {
      ...S,
      currentPresetName: S.currentPresetName,
      presetDraftName: ne(y.querySelector("#xb-assistant-preset-name")?.value),
      provider: I,
      modelConfigs: ue,
      baseUrl: K.baseUrl,
      model: K.model,
      apiKey: K.apiKey,
      temperature: K.temperature,
      sendTemperature: K.sendTemperature,
      reasoningEnabled: K.reasoningEnabled,
      reasoningEffort: K.reasoningEffort,
      toolMode: K.toolMode || S.toolMode || "native",
      tavilyApiKey: y.querySelector("#xb-assistant-tavily-api-key")?.value.trim() || "",
      tavilyBaseUrl: Ge(S.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: sn(y.querySelector("#xb-assistant-permission-mode")?.value || S.permissionMode),
      jsApiPermission: dt(y.querySelector("#xb-assistant-jsapi-permission")?.value || S.jsApiPermission),
      delegatePresetName: g(y.querySelector("#xb-assistant-delegate-preset-select")?.value || S.delegatePresetName, S.currentPresetName),
      delegateProvider: $,
      delegateModelConfigs: rt,
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
  function M(y) {
    return t.configDraft = x(y), t.configDraft;
  }
  function C(y = b()) {
    return ki(y.provider) ? 32e3 : null;
  }
  function L(y = b()) {
    return {
      baseUrl: String(y.baseUrl || ""),
      model: String(y.model || ""),
      apiKey: String(y.apiKey || ""),
      temperature: De(y.temperature, 0.2),
      sendTemperature: !!(y.sendTemperature ?? !0),
      reasoningEnabled: !!y.reasoningEnabled,
      reasoningEffort: ke(y.reasoningEffort),
      toolMode: Qt(y.provider) ? y.toolMode || "native" : void 0
    };
  }
  function P(y = b()) {
    return {
      baseUrl: String(y.delegateBaseUrl || ""),
      model: String(y.delegateModel || ""),
      apiKey: String(y.delegateApiKey || ""),
      temperature: De(y.delegateTemperature, 0.2),
      sendTemperature: !!(y.delegateSendTemperature ?? !0),
      reasoningEnabled: !!y.delegateReasoningEnabled,
      reasoningEffort: ke(y.delegateReasoningEffort),
      toolMode: Qt(y.delegateProvider) ? y.delegateToolMode || "native" : void 0
    };
  }
  function N(y = b()) {
    const S = y.delegateProvider || "openai-compatible", I = Ue(y.delegateModelConfigs || {});
    return {
      provider: S,
      modelConfigs: {
        ...I,
        [S]: {
          ...I[S] || {},
          ...P(y)
        }
      }
    };
  }
  function H(y = b()) {
    return {
      provider: y.provider || "openai-compatible",
      baseUrl: y.baseUrl || "",
      model: y.model || "",
      apiKey: y.apiKey || "",
      tavilyApiKey: y.tavilyApiKey || "",
      tavilyBaseUrl: Ge(y.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: y.sendTemperature === !1 ? void 0 : De(y.temperature, 0.2),
      sendTemperature: !!(y.sendTemperature ?? !0),
      maxTokens: C(y),
      timeoutMs: jc,
      toolMode: y.toolMode || "native",
      reasoningEnabled: !!y.reasoningEnabled,
      reasoningEffort: ke(y.reasoningEffort)
    };
  }
  function z(y = b()) {
    return {
      provider: y.delegateProvider || "openai-compatible",
      baseUrl: y.delegateBaseUrl || "",
      model: y.delegateModel || "",
      apiKey: y.delegateApiKey || "",
      tavilyApiKey: y.tavilyApiKey || "",
      tavilyBaseUrl: Ge(y.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: y.delegateSendTemperature === !1 ? void 0 : De(y.delegateTemperature, 0.2),
      sendTemperature: !!(y.delegateSendTemperature ?? !0),
      maxTokens: ki(y.delegateProvider) ? 32e3 : null,
      timeoutMs: jc,
      toolMode: y.delegateToolMode || "native",
      reasoningEnabled: !!y.delegateReasoningEnabled,
      reasoningEffort: ke(y.delegateReasoningEffort)
    };
  }
  function j(y = {}) {
    const S = (y.role === "delegate", b());
    return y.role === "delegate" ? z(S) : H(S);
  }
  function ee(y) {
    b(), t.configDraft = {
      ...t.configDraft,
      presetDraftName: ne(y.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function Q(y = b(), S = y.provider || "openai-compatible", I = "main") {
    const $ = p(S, I);
    return typeof u == "function" ? u({
      state: t,
      draft: y,
      provider: S,
      pullState: $,
      providerLabel: od(S)
    }) : `预设「${y.currentPresetName || "默认"}」 · ${od(S)}`;
  }
  function X(y, S, I) {
    const $ = y?.querySelector?.(S);
    if (!$) return;
    const K = String(I?.status || "idle"), Z = String(I?.message || "").trim();
    $.textContent = Z, $.hidden = !Z, $.classList.toggle("is-loading", K === "loading"), $.classList.toggle("is-success", K === "success"), $.classList.toggle("is-error", K === "error");
  }
  function he(y) {
    if (!y) return;
    const S = os(t.configPage);
    t.configPage = S, y.querySelectorAll("[data-config-page]").forEach((I) => {
      const $ = os(I?.dataset?.configPage) === S;
      I.classList.toggle("is-active", $), I.setAttribute("aria-selected", $ ? "true" : "false");
    }), y.querySelectorAll("[data-config-page-panel]").forEach((I) => {
      const $ = os(I?.dataset?.configPagePanel) === S;
      I.toggleAttribute("hidden", !$);
    }), y.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("hidden", S === "delegate");
  }
  function $e(y) {
    if (!t.config) return;
    he(y);
    const S = b(), I = S.provider || "openai-compatible", $ = m(I), K = S.delegateProvider || "openai-compatible", Z = m(K, "delegate"), ue = y.querySelector("#xb-assistant-tool-mode-wrap"), rt = y.querySelector("#xb-assistant-tool-mode"), it = y.querySelector("#xb-assistant-reasoning-enabled"), or = y.querySelector("#xb-assistant-reasoning-effort-wrap"), xa = y.querySelector("#xb-assistant-reasoning-effort"), sr = y.querySelector("#xb-assistant-permission-mode"), rr = y.querySelector("#xb-assistant-jsapi-permission"), Ma = y.querySelector("#xb-assistant-model-pulled"), ir = y.querySelector("#xb-assistant-preset-select"), Na = y.querySelector("#xb-assistant-preset-name"), ar = y.querySelector("#xb-assistant-delegate-preset-select"), ka = y.querySelector("#xb-assistant-delegate-provider"), Da = y.querySelector("#xb-assistant-delegate-base-url"), Ua = y.querySelector("#xb-assistant-delegate-model"), La = y.querySelector("#xb-assistant-delegate-api-key"), $a = y.querySelector("#xb-assistant-tavily-api-key"), lr = y.querySelector("#xb-assistant-delegate-model-pulled"), Fa = y.querySelector("#xb-assistant-delegate-tool-mode-wrap"), ur = y.querySelector("#xb-assistant-delegate-tool-mode"), Ba = y.querySelector("#xb-assistant-delegate-reasoning-enabled"), qa = y.querySelector("#xb-assistant-delegate-reasoning-effort-wrap"), cr = y.querySelector("#xb-assistant-delegate-reasoning-effort");
    if (!ir || !Na) return;
    const Ga = (t.config.presetNames || []).map((Fe) => ({
      value: Fe,
      label: Fe
    }));
    je(ir, Ga), ir.value = S.currentPresetName || t.config.currentPresetName || "默认", ar && (je(ar, Ga), ar.value = g(S.delegatePresetName, S.currentPresetName)), Na.value = S.presetDraftName || S.currentPresetName || "默认", y.querySelector("#xb-assistant-provider").value = I, y.querySelector("#xb-assistant-base-url").value = S.baseUrl || "", y.querySelector("#xb-assistant-model").value = S.model || "", y.querySelector("#xb-assistant-api-key").value = S.apiKey || "", y.querySelector("#xb-assistant-temperature").value = String(De(S.temperature, 0.2)), y.querySelector("#xb-assistant-send-temperature").checked = !!(S.sendTemperature ?? !0), $a && ($a.value = S.tavilyApiKey || ""), ue.style.display = Qt(I) ? "" : "none", je(rt, ed), rt.value = S.toolMode || "native", sr && (je(sr, Em), sr.value = sn(S.permissionMode)), rr && (je(rr, wm), rr.value = dt(S.jsApiPermission)), je(xa, Ni), it.checked = !!S.reasoningEnabled, xa.value = ke(S.reasoningEffort), or.style.display = it.checked ? "" : "none", je(Ma, $.map((Fe) => ({
      value: Fe,
      label: Fe
    })), "手动填写"), Ma.value = $.includes(S.model) ? S.model : "", ka && (ka.value = K), Da && (Da.value = S.delegateBaseUrl || ""), Ua && (Ua.value = S.delegateModel || ""), La && (La.value = S.delegateApiKey || "");
    const Oa = y.querySelector("#xb-assistant-delegate-temperature"), Ha = y.querySelector("#xb-assistant-delegate-send-temperature");
    Oa && (Oa.value = String(De(S.delegateTemperature, 0.2))), Ha && (Ha.checked = !!(S.delegateSendTemperature ?? !0)), Fa && (Fa.style.display = Qt(K) ? "" : "none"), ur && (je(ur, ed), ur.value = S.delegateToolMode || "native"), cr && (je(cr, Ni), cr.value = ke(S.delegateReasoningEffort)), Ba && (Ba.checked = !!S.delegateReasoningEnabled), qa && (qa.style.display = S.delegateReasoningEnabled ? "" : "none"), lr && (je(lr, Z.map((Fe) => ({
      value: Fe,
      label: Fe
    })), "手动填写"), lr.value = Z.includes(S.delegateModel) ? S.delegateModel : ""), X(y, "#xb-assistant-model-pull-status", p(I)), X(y, "#xb-assistant-delegate-model-pull-status", p(K, "delegate"));
    const Va = y.querySelector("#xb-assistant-runtime");
    if (Va) {
      const Fe = t.configPage === "delegate";
      Va.textContent = Q(Fe ? {
        ...S,
        currentPresetName: "分身",
        provider: K
      } : S, Fe ? K : I, Fe ? "delegate" : "main");
    }
  }
  function Te(y) {
    if (typeof r != "function") return;
    const S = r(y);
    S && typeof S.catch == "function" && S.catch((I) => {
      o?.(a(I));
    });
  }
  function ye(y, S, I) {
    y.querySelector(S)?.addEventListener("click", () => {
      const $ = y.querySelector(I);
      $ && ($.type = $.type === "password" ? "text" : "password");
    });
  }
  function Vt(y) {
    return {
      workspaceFileName: y?.workspaceFileName || "",
      jsApiPermission: dt(y?.jsApiPermission),
      tavilyApiKey: String(y?.tavilyApiKey || ""),
      tavilyBaseUrl: Ge(y?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: y?.currentPresetName || "默认",
      delegatePresetName: y?.delegatePresetName || y?.currentPresetName || "默认",
      delegateConfig: y?.delegateConfig || {},
      presets: y?.presets || {}
    };
  }
  function Po(y, S = {}) {
    const I = M(y), $ = ne(S.presetName || I.presetDraftName), K = ne(I.currentPresetName || t.config?.currentPresetName || "默认"), Z = (t.config?.presets || {})[K] || we(), ue = Ue(I.modelConfigs || Z.modelConfigs || {}), rt = {
      ...Z,
      provider: I.provider,
      permissionMode: sn(I.permissionMode),
      modelConfigs: {
        ...ue,
        [I.provider]: {
          ...ue[I.provider] || {},
          ...L(I)
        }
      }
    }, it = { ...t.config?.presets || {} };
    S.renameCurrentPreset && $ !== K && delete it[K], it[$] = rt, t.config = ss({
      ...t.config,
      jsApiPermission: dt(I.jsApiPermission),
      tavilyApiKey: String(I.tavilyApiKey || ""),
      tavilyBaseUrl: Ge(I.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: $,
      delegatePresetName: g(I.delegatePresetName, $),
      delegateConfig: N(I),
      presets: it
    }), t.configDraft = A($, rt, t.config), c(), Te({
      requestId: s(S.requestPrefix || "save-config"),
      config: t.config,
      payload: Vt(t.config)
    });
  }
  function Pa(y, S = "") {
    const I = ne(S || "默认"), $ = typeof window < "u" && typeof window.prompt == "function" ? window.prompt(y, I) : I;
    return $ === null ? "" : ne($);
  }
  function um(y) {
    const S = Pa("输入新预设名称：", `${M(y).currentPresetName || "默认"} 副本`);
    if (!S) {
      o?.("预设名称不能为空");
      return;
    }
    y.querySelector("#xb-assistant-preset-name").value = S, Po(y, {
      presetName: S,
      requestPrefix: "create-preset"
    });
  }
  function cm(y) {
    const S = M(y), I = ne(S.currentPresetName || t.config?.currentPresetName || "默认"), $ = Pa("输入预设名称：", S.presetDraftName || I);
    if (!$) {
      o?.("预设名称不能为空");
      return;
    }
    $ !== I && (y.querySelector("#xb-assistant-preset-name").value = $, Po(y, {
      presetName: $,
      renameCurrentPreset: !0,
      requestPrefix: "rename-preset"
    }));
  }
  function dm(y) {
    if (Object.keys(t.config?.presets || {}).length <= 1) {
      o?.("至少要保留一套预设");
      return;
    }
    const S = M(y), I = ne(t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), $ = { ...t.config?.presets || {} };
    delete $[I];
    const K = Object.keys($)[0] || "默认", Z = $[K] || we();
    t.config = ss({
      ...t.config,
      jsApiPermission: dt(S.jsApiPermission),
      tavilyApiKey: String(S.tavilyApiKey || t.config?.tavilyApiKey || ""),
      tavilyBaseUrl: Ge(S.tavilyBaseUrl || t.config?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: K,
      delegatePresetName: g(S.delegatePresetName, K),
      delegateConfig: N(S),
      presets: $
    }), t.configDraft = A(K, Z, t.config), c(), Te({
      requestId: s("delete-preset"),
      config: t.config,
      payload: Vt(t.config)
    }), n?.();
  }
  function fm(y) {
    y?.querySelector?.("#xb-assistant-provider") && (y.querySelector("#xb-assistant-provider").addEventListener("change", (S) => {
      const I = S.currentTarget.value, $ = M(y);
      t.configDraft = {
        ...$,
        provider: I,
        ...v(I, $.modelConfigs)
      }, c(), n?.();
    }), y.querySelector("#xb-assistant-preset-select").addEventListener("change", (S) => {
      const I = ne(S.currentTarget.value), $ = (t.config?.presets || {})[I] || we(), K = M(y);
      t.config = ss({
        ...t.config,
        jsApiPermission: dt(K.jsApiPermission),
        currentPresetName: I,
        delegatePresetName: g(K.delegatePresetName, I),
        delegateConfig: N(K)
      }), t.configDraft = A(I, $, t.config), c(), n?.();
    }), y.querySelector("#xb-assistant-preset-name")?.addEventListener("input", () => {
      ee(y);
    }), y.querySelector("#xb-assistant-base-url").addEventListener("input", () => {
      M(y);
    }), y.querySelector("#xb-assistant-model").addEventListener("input", () => {
      M(y);
    }), y.querySelector("#xb-assistant-api-key").addEventListener("input", () => {
      M(y);
    }), y.querySelector("#xb-assistant-temperature")?.addEventListener("input", () => {
      M(y);
    }), y.querySelector("#xb-assistant-send-temperature")?.addEventListener("change", () => {
      M(y);
    }), y.querySelector("#xb-assistant-tavily-api-key")?.addEventListener("input", () => {
      M(y);
    }), y.querySelector("#xb-assistant-model-pulled").addEventListener("change", (S) => {
      const I = S.currentTarget.value;
      I && (y.querySelector("#xb-assistant-model").value = I, M(y));
    }), ye(y, "#xb-assistant-toggle-key", "#xb-assistant-api-key"), ye(y, "#xb-assistant-toggle-tavily-key", "#xb-assistant-tavily-api-key"), y.querySelector("#xb-assistant-delegate-provider")?.addEventListener("change", (S) => {
      const I = M(y), $ = S.currentTarget.value;
      t.configDraft = {
        ...I,
        delegateProvider: $,
        ...w($, I.delegateModelConfigs)
      }, c(), n?.();
    }), y.querySelector("#xb-assistant-delegate-base-url")?.addEventListener("input", () => {
      M(y);
    }), y.querySelector("#xb-assistant-delegate-model")?.addEventListener("input", () => {
      M(y);
    }), y.querySelector("#xb-assistant-delegate-api-key")?.addEventListener("input", () => {
      M(y);
    }), y.querySelector("#xb-assistant-delegate-temperature")?.addEventListener("input", () => {
      M(y);
    }), y.querySelector("#xb-assistant-delegate-send-temperature")?.addEventListener("change", () => {
      M(y);
    }), y.querySelector("#xb-assistant-delegate-model-pulled")?.addEventListener("change", (S) => {
      const I = S.currentTarget.value;
      if (!I) return;
      const $ = y.querySelector("#xb-assistant-delegate-model");
      $ && ($.value = I), M(y);
    }), ye(y, "#xb-assistant-delegate-toggle-key", "#xb-assistant-delegate-api-key"), y.querySelector("#xb-assistant-reasoning-enabled").addEventListener("change", () => {
      M(y), c(), n?.();
    }), y.querySelector("#xb-assistant-reasoning-effort").addEventListener("change", () => {
      M(y);
    }), y.querySelector("#xb-assistant-tool-mode").addEventListener("change", () => {
      M(y);
    }), y.querySelector("#xb-assistant-delegate-reasoning-enabled")?.addEventListener("change", () => {
      M(y), c(), n?.();
    }), y.querySelector("#xb-assistant-delegate-reasoning-effort")?.addEventListener("change", () => {
      M(y);
    }), y.querySelector("#xb-assistant-delegate-tool-mode")?.addEventListener("change", () => {
      M(y);
    }), y.querySelector("#xb-assistant-permission-mode")?.addEventListener("change", () => {
      M(y);
    }), y.querySelector("#xb-assistant-jsapi-permission")?.addEventListener("change", () => {
      M(y);
    }), y.querySelector("#xb-assistant-delegate-preset-select")?.addEventListener("change", (S) => {
      const I = g(S.currentTarget?.value, t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), $ = (t.config?.presets || {})[I] || we();
      t.configDraft = {
        ...M(y),
        ..._(I, $)
      }, c(), n?.();
    }), y.querySelectorAll("[data-config-page]").forEach((S) => {
      S.addEventListener("click", (I) => {
        M(y), t.configPage = os(I.currentTarget?.dataset?.configPage), he(y), $e(y);
      });
    }), y.querySelector("#xb-assistant-pull-models").addEventListener("click", async () => {
      M(y), c();
      const S = j();
      f(S.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), n?.();
      try {
        const I = await sd(S);
        h(S.provider, I), f(S.provider, {
          status: "success",
          message: `已拉取 ${I.length} 个模型`
        });
      } catch (I) {
        h(S.provider, []), f(S.provider, {
          status: "error",
          message: a(I)
        });
      }
      c(), n?.();
    }), y.querySelector("#xb-assistant-delegate-pull-models")?.addEventListener("click", async () => {
      M(y), c();
      const S = j({ role: "delegate" });
      f(S.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }, "delegate"), n?.();
      try {
        const I = await sd(S);
        h(S.provider, I, "delegate"), f(S.provider, {
          status: "success",
          message: `已拉取 ${I.length} 个模型`
        }, "delegate");
      } catch (I) {
        h(S.provider, [], "delegate"), f(S.provider, {
          status: "error",
          message: a(I)
        }, "delegate");
      }
      c(), n?.();
    }), y.querySelector("#xb-assistant-new-preset")?.addEventListener("click", () => {
      um(y);
    }), y.querySelector("#xb-assistant-rename-preset")?.addEventListener("click", () => {
      cm(y);
    }), y.querySelector("#xb-assistant-save").addEventListener("click", () => {
      Po(y);
    }), y.querySelector("#xb-assistant-delegate-save")?.addEventListener("click", () => {
      Po(y, { requestPrefix: "save-delegate-config" });
    }), y.querySelector("#xb-assistant-delete-preset").addEventListener("click", () => {
      dm(y);
    }));
  }
  return {
    getActiveProviderConfig: j,
    syncConfigToForm: $e,
    bindSettingsPanelEvents: fm
  };
}
function Ts(e = "") {
  return String(e || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Gn(e) {
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
function S0(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? "saving" : t === "success" ? "success" : t === "error" ? "error" : "save";
}
function T0(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? {
    className: "xb-assistant-save-button is-saving",
    title: "正在保存配置"
  } : t === "success" ? {
    className: "xb-assistant-save-button is-success",
    title: "配置已保存"
  } : t === "error" ? {
    className: "xb-assistant-save-button is-error",
    title: Ts(e?.error || "保存失败")
  } : {
    className: "xb-assistant-save-button",
    title: "保存配置"
  };
}
function I0(e = {}) {
  const { configSave: t = {}, runtimeText: n = "", inlineToastText: o = "", showInlineToast: s = !0, showAssistantPermissions: r = !0, showDelegateSettings: a = !0, activePage: u = "main", delegatePresetHint: c = "DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。", isBusy: d = !1, canDeletePreset: p = !0 } = e, f = T0(t), h = S0(t), m = d || String(t?.status || "") === "saving" ? "disabled" : "", g = d || !p ? "disabled" : "", _ = u === "delegate" ? "delegate" : "main", v = _ === "main", w = _ === "delegate", A = r ? `
            <label>
                <span>斜杠命令权限</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>
            <label>
                <span>JavaScript API 权限</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>` : "", b = a ? `
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${v ? "is-active" : ""}" data-config-page="main" role="tab" aria-selected="${v ? "true" : "false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${w ? "is-active" : ""}" data-config-page="delegate" role="tab" aria-selected="${w ? "true" : "false"}">分身 API</button>
            </div>` : "", x = a ? `
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${w ? "" : "hidden"}>
                <p class="xb-assistant-config-note">${Ts(c)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${f.className}" title="${f.title}" aria-label="${f.title}" ${m}>${Gn(h)}</button>
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
            ${b}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${v ? "" : "hidden"}>
            <div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${d ? "disabled" : ""}>${Gn("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${d ? "disabled" : ""}>${Gn("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${f.className}" title="${f.title}" aria-label="${f.title}" ${m}>${Gn(h)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${g}>${Gn("delete")}</button>
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
            ${A}
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
            ${x}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${Ts(n)}</div>
            ${s ? `<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${Ts(o)}</div>` : ""}
        </section>
    `;
}
var E0 = [
  "你是小白X“四次元壁”的交流生成器。",
  "只完成本轮四次元壁回复，不调用工具，不编造外部事实。",
  "严格遵循后续提示词里的输出格式，优先输出可被解析的 <thinking> 与 <msg> 内容。"
].join(`
`);
function w0(e = {}) {
  return {
    msg1: String(e.msg1 || "").trim(),
    msg2: String(e.msg2 || "").trim(),
    msg3: String(e.msg3 || "").trim(),
    msg4: String(e.msg4 || "").trim()
  };
}
function C0(e = {}, t = {}) {
  const { msg1: n, msg2: o, msg3: s, msg4: r } = w0(e);
  return [
    n ? {
      role: "user",
      content: n
    } : null,
    o ? {
      role: "assistant",
      content: o
    } : null,
    s ? {
      role: "user",
      content: s
    } : null,
    r && !t.disableAssistantPrefill ? {
      role: "assistant",
      content: r
    } : null
  ].filter(Boolean);
}
function b0(e = {}) {
  AI(typeof e.requestHeadersProvider == "function" ? e.requestHeadersProvider : null);
}
async function R0(e = {}) {
  const t = i0(bm(e.config || {})), n = a0(t, { missingApiKeyMessage: "请先在小白agent的 API配置 里填写当前预设的 API Key。" }), o = !!e.stream && typeof e.onStreamProgress == "function", s = await n.chat({
    systemPrompt: E0,
    messages: C0(e.builtPrompt || {}, { disableAssistantPrefill: !!e.disableAssistantPrefill }),
    tools: [],
    temperature: t.temperature,
    maxTokens: t.maxTokens,
    reasoning: {
      enabled: t.reasoningEnabled,
      effort: t.reasoningEffort
    },
    signal: e.signal,
    onStreamProgress: o ? e.onStreamProgress : void 0
  });
  return {
    text: String(s?.text || ""),
    thoughts: Array.isArray(s?.thoughts) ? s.thoughts : [],
    provider: s?.provider || t.provider,
    model: s?.model || t.model,
    finishReason: s?.finishReason || ""
  };
}
export {
  I0 as buildAgentSettingsPanelMarkup,
  b0 as configureFourthWallAgent,
  A0 as createAgentSettingsPanel,
  R0 as generateFourthWallResponse,
  ss as normalizeAgentConfig
};
