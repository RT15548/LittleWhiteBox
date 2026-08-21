var wg = Object.create, qd = Object.defineProperty, Ig = Object.getOwnPropertyDescriptor, bg = Object.getOwnPropertyNames, Pg = Object.getPrototypeOf, Rg = Object.prototype.hasOwnProperty, yi = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), xg = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var o = bg(t), i = 0, a = o.length, u; i < a; i++)
      u = o[i], !Rg.call(e, u) && u !== n && qd(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(r = Ig(t, u)) || r.enumerable
      });
  return e;
}, Mg = (e, t, n) => (n = e != null ? wg(Pg(e)) : {}, xg(t || !e || !e.__esModule ? qd(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), Ng = "https://api.tavily.com";
function ds(e = "") {
  return String(e || "").trim();
}
function Qe(e = "") {
  return String(e || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var gP = Object.freeze([
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
]), yP = Object.freeze([Object.freeze({
  value: "hide",
  label: "隐藏"
}), Object.freeze({
  value: "show",
  label: "显示"
})]);
function kg(e = "") {
  return e === "on" || e === "off" ? e : "inherit";
}
function Bd(e = "") {
  return e === "show" ? "show" : "hide";
}
function Dg(e) {
  return String(e ?? "").trim().toLowerCase() || void 0;
}
function $g(e) {
  if (e == null || e === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? Math.floor(t) : void 0;
}
function an(e = {}) {
  const t = e && typeof e == "object" ? e : {}, n = Dg(t.effort), r = $g(t.budgetTokens);
  return {
    mode: kg(t.mode),
    output: Bd(t.output),
    ...n ? { effort: n } : {},
    ...r !== void 0 ? { budgetTokens: r } : {}
  };
}
function Z(e = {}) {
  return Bd(e?.output) === "show";
}
var Gd = "openai-compatible", _i = "默认", Hd = "default", Lg = "deny", Tt = 32e3;
var Ug = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), Fg = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), fs = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: Tt,
    sendTemperature: !0
  }
};
function wn() {
  return JSON.parse(JSON.stringify(fs));
}
function xe() {
  return {
    provider: Gd,
    modelConfigs: wn(),
    permissionMode: Hd
  };
}
function Vd(e = xe()) {
  const t = e && typeof e == "object" ? e : xe();
  return {
    provider: ua(t.provider),
    modelConfigs: Ve(t.modelConfigs || {})
  };
}
function In(e) {
  return e === "full" ? "full" : Hd;
}
function St(e) {
  return e === "allow" ? "allow" : Lg;
}
function le(e, t = Tt) {
  const n = Number(e);
  if (!Number.isFinite(n) || n <= 0) {
    const r = Number(t);
    return Number.isFinite(r) && r > 0 ? Math.floor(r) : Tt;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}
function oe(e) {
  return String(e || "").trim() || "默认";
}
function Ve(e = {}) {
  const t = wn();
  return Object.keys(fs).forEach((n) => {
    const r = e && typeof e[n] == "object" ? e[n] : {}, o = fs[n];
    t[n] = {
      baseUrl: String(r.baseUrl ?? o.baseUrl ?? ""),
      model: String(r.model ?? o.model ?? ""),
      apiKey: String(r.apiKey ?? o.apiKey ?? ""),
      temperature: r.temperature ?? o.temperature,
      maxTokens: le(r.maxTokens, o.maxTokens),
      sendTemperature: typeof r.sendTemperature == "boolean" ? r.sendTemperature : o.sendTemperature,
      ..."toolMode" in o ? { toolMode: String(r.toolMode || o.toolMode || "native") } : {},
      reasoning: an(r.reasoning)
    };
  }), t;
}
function ua(e) {
  return typeof e == "string" && e.trim() ? e : Gd;
}
function ca(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function Jd(e = {}, t) {
  const n = {}, r = ca(e, t);
  return Object.entries(r).forEach(([o, i]) => {
    if (!i || typeof i != "object") return;
    const a = oe(o);
    n[a] = {
      provider: ua(i.provider),
      modelConfigs: Ve(i.modelConfigs || {}),
      permissionMode: In(i.permissionMode)
    };
  }), Object.keys(n).length || (n[_i] = xe()), n;
}
function Kd(e, t) {
  const n = oe(t);
  return e[n] ? n : Object.keys(e)[0];
}
function Wd(e, t, n) {
  const r = oe(t || n);
  return e[r] ? r : e[n] ? n : Object.keys(e)[0];
}
function da(e = {}, t = xe()) {
  const n = Vd(t), r = e && typeof e == "object" ? e : {};
  return {
    provider: ua(r.provider || n.provider),
    modelConfigs: Ve(r.modelConfigs || n.modelConfigs)
  };
}
function zd(e = {}, t = {}, n = _i, r = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (r !== n) return !0;
  const o = e?.delegateConfig;
  if (!o || typeof o != "object" || Array.isArray(o) || !(typeof o.provider == "string" && o.provider.trim() || o.modelConfigs && typeof o.modelConfigs == "object" && Object.keys(o.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const i = t[n] || xe(), a = Vd(i), u = da(o, i);
  return JSON.stringify(u) !== JSON.stringify(a);
}
function Og(e = {}, t, n, r, o) {
  const i = o(e?.[r]);
  if (i) return i;
  const a = ca(e, t), u = [
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
function qg(e = {}, t, n) {
  const r = (u) => String(u || "").trim();
  if (r(e?.tavilyBaseUrl)) return Qe(e.tavilyBaseUrl);
  const o = ca(e, t), i = [
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
    if (r(c)) return Qe(c);
  }
  return r(e?.delegateConfig?.tavilyBaseUrl) ? Qe(e.delegateConfig.tavilyBaseUrl) : Ng;
}
function Yd(e = {}, t, n) {
  return {
    tavilyApiKey: Og(e, t, n, "tavilyApiKey", ds),
    tavilyBaseUrl: qg(e, t, n)
  };
}
function Bg(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: r = (p) => String(p || "") } = t, o = oe(e.currentPresetName || e.presetName || "默认"), i = Jd(e, o), a = Kd(i, e.currentPresetName), u = Wd(i, e.delegatePresetName, a), c = i[u] || i[a] || xe(), d = da(e.delegateConfig, c), h = zd(e, i, a, u), f = Yd(e, o, a);
  return {
    enabled: !!e.enabled,
    workspaceFileName: r(e.workspaceFileName || n),
    jsApiPermission: St(e.jsApiPermission),
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
function hs(e = {}) {
  const t = oe(e.currentPresetName || e.presetDraftName || "默认"), n = Jd(e, t), r = Kd(n, e.currentPresetName), o = Wd(n, e.delegatePresetName, r), i = n[r] || xe(), a = n[o] || i, u = da(e.delegateConfig, a), c = zd(e, n, r, o), d = Yd(e, t, r);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    updatedAt: Number(e.updatedAt) || 0,
    jsApiPermission: St(e.jsApiPermission),
    currentPresetName: r,
    delegatePresetName: o,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: oe(e.presetDraftName || r),
    presetNames: Object.keys(n),
    presets: n,
    provider: i.provider,
    modelConfigs: i.modelConfigs,
    permissionMode: In(i.permissionMode),
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
function C(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var Xd = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Xd = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function Or(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ps = (e) => {
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
}, Je = class ms extends J {
  constructor(t, n, r, o, i) {
    super(`${ms.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new vi({
      message: r,
      cause: ps(n)
    });
    const i = n, a = i?.error?.type;
    return t === 400 ? new Zd(t, i, r, o, a) : t === 401 ? new jd(t, i, r, o, a) : t === 403 ? new ef(t, i, r, o, a) : t === 404 ? new tf(t, i, r, o, a) : t === 409 ? new nf(t, i, r, o, a) : t === 422 ? new rf(t, i, r, o, a) : t === 429 ? new of(t, i, r, o, a) : t >= 500 ? new sf(t, i, r, o, a) : new ms(t, i, r, o, a);
  }
}, at = class extends Je {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, vi = class extends Je {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Qd = class extends vi {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Zd = class extends Je {
}, jd = class extends Je {
}, ef = class extends Je {
}, tf = class extends Je {
}, nf = class extends Je {
}, rf = class extends Je {
}, of = class extends Je {
}, sf = class extends Je {
}, Gg = /^[a-z][a-z0-9+.-]*:/i, Hg = (e) => Gg.test(e), gs = (e) => (gs = Array.isArray, gs(e)), wl = gs;
function ys(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Il(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Vg(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Jg = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new J(`${e} must be an integer`);
  if (t < 0) throw new J(`${e} must be a positive integer`);
  return t;
}, af = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Kg = (e) => new Promise((t) => setTimeout(t, e)), An = "0.91.1", Wg = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function zg() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Yg = () => {
  const e = zg();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": An,
    "X-Stainless-OS": Pl(Deno.build.os),
    "X-Stainless-Arch": bl(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": An,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": An,
    "X-Stainless-OS": Pl(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": bl(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Xg();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": An,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": An,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Xg() {
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
var bl = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Pl = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Rl, Qg = () => Rl ?? (Rl = Yg());
function Zg() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function lf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function uf(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return lf({
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
function fa(e) {
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
async function jg(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var ey = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function ty(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new J(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function ny(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var xl;
function ha(e) {
  let t;
  return (xl ?? (t = new globalThis.TextEncoder(), xl = t.encode.bind(t)))(e);
}
var Ml;
function Nl(e) {
  let t;
  return (Ml ?? (t = new globalThis.TextDecoder(), Ml = t.decode.bind(t)))(e);
}
var Fe, Oe, Wr = class {
  constructor() {
    Fe.set(this, void 0), Oe.set(this, void 0), U(this, Fe, new Uint8Array(), "f"), U(this, Oe, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ha(e) : e;
    U(this, Fe, ny([C(this, Fe, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = ry(C(this, Fe, "f"), C(this, Oe, "f"))) != null; ) {
      if (r.carriage && C(this, Oe, "f") == null) {
        U(this, Oe, r.index, "f");
        continue;
      }
      if (C(this, Oe, "f") != null && (r.index !== C(this, Oe, "f") + 1 || r.carriage)) {
        n.push(Nl(C(this, Fe, "f").subarray(0, C(this, Oe, "f") - 1))), U(this, Fe, C(this, Fe, "f").subarray(C(this, Oe, "f")), "f"), U(this, Oe, null, "f");
        continue;
      }
      const o = C(this, Oe, "f") !== null ? r.preceding - 1 : r.preceding, i = Nl(C(this, Fe, "f").subarray(0, o));
      n.push(i), U(this, Fe, C(this, Fe, "f").subarray(r.index), "f"), U(this, Oe, null, "f");
    }
    return n;
  }
  flush() {
    return C(this, Fe, "f").length ? this.decode(`
`) : [];
  }
};
Fe = /* @__PURE__ */ new WeakMap(), Oe = /* @__PURE__ */ new WeakMap();
Wr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Wr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function ry(e, t) {
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
function oy(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var jo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, kl = (e, t, n) => {
  if (e) {
    if (Vg(jo, e)) return e;
    Pe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(jo))}`);
  }
};
function gr() {
}
function lo(e, t, n) {
  return !t || jo[e] > jo[n] ? gr : t[e].bind(t);
}
var iy = {
  error: gr,
  warn: gr,
  info: gr,
  debug: gr
}, Dl = /* @__PURE__ */ new WeakMap();
function Pe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return iy;
  const r = Dl.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: lo("error", t, n),
    warn: lo("warn", t, n),
    info: lo("info", t, n),
    debug: lo("debug", t, n)
  };
  return Dl.set(t, [n, o]), o;
}
var Yt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Xn, qr = class yr {
  constructor(t, n, r) {
    this.iterator = t, Xn.set(this, void 0), this.controller = n, U(this, Xn, r, "f");
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const i = r ? Pe(r) : console;
    async function* a() {
      if (o) throw new J("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of sy(t, n)) {
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
            const d = af(c.data) ?? c.data, h = d?.error?.type;
            throw new Je(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (Or(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new yr(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* i() {
      const u = new Wr(), c = fa(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (o) throw new J("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Or(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new yr(a, n, r);
  }
  [(Xn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new yr(() => o(t), this.controller, C(this, Xn, "f")), new yr(() => o(n), this.controller, C(this, Xn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return lf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = ha(JSON.stringify(o) + `
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
async function* sy(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new J("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new J("Attempted to iterate over a response with no body");
  const n = new ly(), r = new Wr(), o = fa(e.body);
  for await (const i of ay(o)) for (const a of r.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of r.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* ay(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? ha(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let i;
    for (; (i = oy(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var ly = class {
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
    let [t, n, r] = uy(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function uy(e, t) {
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
async function cf(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return Pe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : qr.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : df(await n.json(), n) : await n.text();
  })();
  return Pe(e).debug(`[${r}] response parsed`, Yt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function df(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var _r, ff = class hf extends Promise {
  constructor(t, n, r = cf) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, _r.set(this, void 0), U(this, _r, t, "f");
  }
  _thenUnwrap(t) {
    return new hf(C(this, _r, "f"), this.responsePromise, async (n, r) => df(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(C(this, _r, "f"), t))), this.parsedPromise;
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
_r = /* @__PURE__ */ new WeakMap();
var uo, pf = class {
  constructor(e, t, n, r) {
    uo.set(this, void 0), U(this, uo, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new J("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await C(this, uo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(uo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, cy = class extends ff {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await cf(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, zr = class extends pf {
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
          ...ys(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...ys(this.options.query),
        after_id: e
      }
    } : null;
  }
}, Le = class extends pf {
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
        ...ys(this.options.query),
        page: e
      }
    } : null;
  }
}, mf = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Dn(e, t, n) {
  return mf(), new File(e, t ?? "unknown_file", n);
}
function Fo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var gf = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", pa = async (e, t, n = !0) => ({
  ...e,
  body: await fy(e.body, t, n)
}), $l = /* @__PURE__ */ new WeakMap();
function dy(e) {
  const t = typeof e == "function" ? e : e.fetch, n = $l.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new o(i).text();
    } catch {
      return !0;
    }
  })();
  return $l.set(t, r), r;
}
var fy = async (e, t, n = !0) => {
  if (!await dy(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, i]) => _s(r, o, i, n))), r;
}, hy = (e) => e instanceof Blob && "name" in e, _s = async (e, t, n, r) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let o = {};
      const i = n.headers.get("Content-Type");
      i && (o = { type: i }), e.append(t, Dn([await n.blob()], Fo(n, r), o));
    } else if (gf(n)) e.append(t, Dn([await new Response(uf(n)).blob()], Fo(n, r)));
    else if (hy(n)) e.append(t, Dn([n], Fo(n, r), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => _s(e, t + "[]", o, r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, i]) => _s(e, `${t}[${o}]`, i, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, yf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", py = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && yf(e), my = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function gy(e, t, n) {
  if (mf(), e = await e, t || (t = Fo(e, !0)), py(e))
    return e instanceof File && t == null && n == null ? e : Dn([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (my(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Dn(await vs(o), t, n);
  }
  const r = await vs(e);
  if (!n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return Dn(r, t, n);
}
async function vs(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (yf(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (gf(e)) for await (const n of e) t.push(...await vs(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${yy(e)}`);
  }
  return t;
}
function yy(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var re = class {
  constructor(e) {
    this._client = e;
  }
}, _f = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* _y(e) {
  if (!e) return;
  if (_f in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : wl(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = wl(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var N = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of _y(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [_f]: !0,
    values: t,
    nulls: n
  };
};
function vf(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Ll = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), vy = (e = vf) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let y = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Ll) ?? Ll)?.toString) && (y = m + "", i.push({
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
    throw new J(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, q = /* @__PURE__ */ vy(vf), Af = class extends re {
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
    return this._client.getAPIList("/v1/environments?beta=true", Le, {
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
}, kr = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function Oo(e) {
  return typeof e == "object" && e !== null && kr in e;
}
function Tf(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const r of e) Oo(r) && n.add(r[kr]);
  if (t) {
    for (const r of t)
      if (Oo(r) && n.add(r[kr]), Array.isArray(r.content))
        for (const o of r.content) Oo(o) && n.add(o[kr]);
  }
  return Array.from(n);
}
function Sf(e, t) {
  const n = Tf(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function Ay(e) {
  return Oo(e) ? { "x-stainless-helper": e[kr] } : {};
}
var Ef = class extends re {
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", zr, {
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
    return this._client.post("/v1/files?beta=true", pa({
      body: r,
      ...t,
      headers: N([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        Ay(r.file),
        t?.headers
      ])
    }, this._client));
  }
}, Cf = class extends re {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/models/${e}?beta=true`, {
      ...n,
      headers: N([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", zr, {
      query: r,
      ...t,
      headers: N([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, wf = class extends re {
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
    return this._client.getAPIList("/v1/user_profiles?beta=true", Le, {
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
}, If = class extends re {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/agents/${e}/versions?beta=true`, Le, {
      query: o,
      ...n,
      headers: N([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, ma = class extends re {
  constructor() {
    super(...arguments), this.versions = new If(this._client);
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
    return this._client.getAPIList("/v1/agents?beta=true", Le, {
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
ma.Versions = If;
var bf = class extends re {
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
    return this._client.getAPIList(q`/v1/memory_stores/${e}/memories?beta=true`, Le, {
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
}, Pf = class extends re {
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
    return this._client.getAPIList(q`/v1/memory_stores/${e}/memory_versions?beta=true`, Le, {
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
}, Ai = class extends re {
  constructor() {
    super(...arguments), this.memories = new bf(this._client), this.memoryVersions = new Pf(this._client);
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
    return this._client.getAPIList("/v1/memory_stores?beta=true", Le, {
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
Ai.Memories = bf;
Ai.MemoryVersions = Pf;
var Rf = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function xf(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function Ul(e, t, n) {
  const r = xf(t);
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
  } : Mf(e, t, n);
}
function Mf(e, t, n) {
  let r = null;
  const o = e.content.map((i) => {
    if (i.type === "text") {
      const a = Ty(t, i.text);
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
function Ty(e, t) {
  const n = xf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new J(`Failed to parse structured output: ${r}`);
  }
}
var Sy = (e) => {
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
}, Tn = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Tn(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Tn(e);
    case "string":
      let r = e[e.length - 2];
      if (r?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Tn(e);
      if (r?.type === "brace" && r.value === "{")
        return e = e.slice(0, e.length - 1), Tn(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Tn(e);
  }
  return e;
}, Ey = (e) => {
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
}, Cy = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, Nf = (e) => JSON.parse(Cy(Ey(Tn(Sy(e))))), Ye, xt, pn, Qn, co, Zn, jn, fo, er, gt, tr, ho, po, Kt, mo, go, nr, Gi, Fl, yo, Hi, Vi, Ji, Ol, ql = "__json_buf";
function Bl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var wy = class As {
  constructor(t, n) {
    Ye.add(this), this.messages = [], this.receivedMessages = [], xt.set(this, void 0), pn.set(this, null), this.controller = new AbortController(), Qn.set(this, void 0), co.set(this, () => {
    }), Zn.set(this, () => {
    }), jn.set(this, void 0), fo.set(this, () => {
    }), er.set(this, () => {
    }), gt.set(this, {}), tr.set(this, !1), ho.set(this, !1), po.set(this, !1), Kt.set(this, !1), mo.set(this, void 0), go.set(this, void 0), nr.set(this, void 0), yo.set(this, (r) => {
      if (U(this, ho, !0, "f"), Or(r) && (r = new at()), r instanceof at)
        return U(this, po, !0, "f"), this._emit("abort", r);
      if (r instanceof J) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new J(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new J(String(r)));
    }), U(this, Qn, new Promise((r, o) => {
      U(this, co, r, "f"), U(this, Zn, o, "f");
    }), "f"), U(this, jn, new Promise((r, o) => {
      U(this, fo, r, "f"), U(this, er, o, "f");
    }), "f"), C(this, Qn, "f").catch(() => {
    }), C(this, jn, "f").catch(() => {
    }), U(this, pn, t, "f"), U(this, nr, n?.logger ?? console, "f");
  }
  get response() {
    return C(this, mo, "f");
  }
  get request_id() {
    return C(this, go, "f");
  }
  async withResponse() {
    U(this, Kt, !0, "f");
    const t = await C(this, Qn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new As(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const i = new As(n, { logger: o });
    for (const a of n.messages) i._addMessageParam(a);
    return U(i, pn, {
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
    }, C(this, yo, "f"));
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
      C(this, Ye, "m", Hi).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) C(this, Ye, "m", Vi).call(this, c);
      if (u.controller.signal?.aborted) throw new at();
      C(this, Ye, "m", Ji).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (U(this, mo, t, "f"), U(this, go, t?.headers.get("request-id"), "f"), C(this, co, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return C(this, tr, "f");
  }
  get errored() {
    return C(this, ho, "f");
  }
  get aborted() {
    return C(this, po, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (C(this, gt, "f")[t] || (C(this, gt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = C(this, gt, "f")[t];
    if (!r) return this;
    const o = r.findIndex((i) => i.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (C(this, gt, "f")[t] || (C(this, gt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      U(this, Kt, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    U(this, Kt, !0, "f"), await C(this, jn, "f");
  }
  get currentMessage() {
    return C(this, xt, "f");
  }
  async finalMessage() {
    return await this.done(), C(this, Ye, "m", Gi).call(this);
  }
  async finalText() {
    return await this.done(), C(this, Ye, "m", Fl).call(this);
  }
  _emit(t, ...n) {
    if (C(this, tr, "f")) return;
    t === "end" && (U(this, tr, !0, "f"), C(this, fo, "f").call(this));
    const r = C(this, gt, "f")[t];
    if (r && (C(this, gt, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !C(this, Kt, "f") && !r?.length && Promise.reject(o), C(this, Zn, "f").call(this, o), C(this, er, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !C(this, Kt, "f") && !r?.length && Promise.reject(o), C(this, Zn, "f").call(this, o), C(this, er, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", C(this, Ye, "m", Gi).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      C(this, Ye, "m", Hi).call(this), this._connected(null);
      const i = qr.fromReadableStream(t, this.controller);
      for await (const a of i) C(this, Ye, "m", Vi).call(this, a);
      if (i.controller.signal?.aborted) throw new at();
      C(this, Ye, "m", Ji).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(xt = /* @__PURE__ */ new WeakMap(), pn = /* @__PURE__ */ new WeakMap(), Qn = /* @__PURE__ */ new WeakMap(), co = /* @__PURE__ */ new WeakMap(), Zn = /* @__PURE__ */ new WeakMap(), jn = /* @__PURE__ */ new WeakMap(), fo = /* @__PURE__ */ new WeakMap(), er = /* @__PURE__ */ new WeakMap(), gt = /* @__PURE__ */ new WeakMap(), tr = /* @__PURE__ */ new WeakMap(), ho = /* @__PURE__ */ new WeakMap(), po = /* @__PURE__ */ new WeakMap(), Kt = /* @__PURE__ */ new WeakMap(), mo = /* @__PURE__ */ new WeakMap(), go = /* @__PURE__ */ new WeakMap(), nr = /* @__PURE__ */ new WeakMap(), yo = /* @__PURE__ */ new WeakMap(), Ye = /* @__PURE__ */ new WeakSet(), Gi = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Fl = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new J("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Hi = function() {
    this.ended || U(this, xt, void 0, "f");
  }, Vi = function(n) {
    if (this.ended) return;
    const r = C(this, Ye, "m", Ol).call(this, n);
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
            Bl(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage(Ul(r, C(this, pn, "f"), { logger: C(this, nr, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        U(this, xt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Ji = function() {
    if (this.ended) throw new J("stream has ended, this shouldn't happen");
    const n = C(this, xt, "f");
    if (!n) throw new J("request ended without sending any chunks");
    return U(this, xt, void 0, "f"), Ul(n, C(this, pn, "f"), { logger: C(this, nr, "f") });
  }, Ol = function(n) {
    let r = C(this, xt, "f");
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
            if (o && Bl(o)) {
              let i = o[ql] || "";
              i += n.delta.partial_json;
              const a = { ...o };
              if (Object.defineProperty(a, ql, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                a.input = Nf(i);
              } catch (u) {
                const c = new J(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                C(this, yo, "f").call(this, c);
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
    return new qr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, kf = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var Iy = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, rr, mn, Wt, he, Ne, Ue, Et, Mt, or, Gl, Ts;
function Hl() {
  let e, t;
  return {
    promise: new Promise((n, r) => {
      e = n, t = r;
    }),
    resolve: e,
    reject: t
  };
}
var Df = class {
  constructor(e, t, n) {
    rr.add(this), this.client = e, mn.set(this, !1), Wt.set(this, !1), he.set(this, void 0), Ne.set(this, void 0), Ue.set(this, void 0), Et.set(this, void 0), Mt.set(this, void 0), or.set(this, 0), U(this, he, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const r = ["BetaToolRunner", ...Tf(t.tools, t.messages)].join(", ");
    U(this, Ne, {
      ...n,
      headers: N([{ "x-stainless-helper": r }, n?.headers])
    }, "f"), U(this, Mt, Hl(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(mn = /* @__PURE__ */ new WeakMap(), Wt = /* @__PURE__ */ new WeakMap(), he = /* @__PURE__ */ new WeakMap(), Ne = /* @__PURE__ */ new WeakMap(), Ue = /* @__PURE__ */ new WeakMap(), Et = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap(), or = /* @__PURE__ */ new WeakMap(), rr = /* @__PURE__ */ new WeakSet(), Gl = async function() {
    const t = C(this, he, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (C(this, Ue, "f") !== void 0) try {
      const c = await C(this, Ue, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const r = t.contextTokenThreshold ?? 1e5;
    if (n < r) return !1;
    const o = t.model ?? C(this, he, "f").params.model, i = t.summaryPrompt ?? Iy, a = C(this, he, "f").params.messages;
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
      max_tokens: C(this, he, "f").params.max_tokens
    }, {
      signal: C(this, Ne, "f").signal,
      headers: N([C(this, Ne, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new J("Expected text response for compaction");
    return C(this, he, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (C(this, mn, "f")) throw new J("Cannot iterate over a consumed stream");
    U(this, mn, !0, "f"), U(this, Wt, !0, "f"), U(this, Et, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (C(this, he, "f").params.max_iterations && C(this, or, "f") >= C(this, he, "f").params.max_iterations) break;
          U(this, Wt, !1, "f"), U(this, Et, void 0, "f"), U(this, or, (e = C(this, or, "f"), e++, e), "f"), U(this, Ue, void 0, "f");
          const { max_iterations: n, compactionControl: r, ...o } = C(this, he, "f").params;
          if (o.stream ? (t = this.client.beta.messages.stream({ ...o }, C(this, Ne, "f")), U(this, Ue, t.finalMessage(), "f"), C(this, Ue, "f").catch(() => {
          }), yield t) : (U(this, Ue, this.client.beta.messages.create({
            ...o,
            stream: !1
          }, C(this, Ne, "f")), "f"), yield C(this, Ue, "f")), !await C(this, rr, "m", Gl).call(this)) {
            if (!C(this, Wt, "f")) {
              const { role: a, content: u } = await C(this, Ue, "f");
              C(this, he, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const i = await C(this, rr, "m", Ts).call(this, C(this, he, "f").params.messages.at(-1));
            if (i) C(this, he, "f").params.messages.push(i);
            else if (!C(this, Wt, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!C(this, Ue, "f")) throw new J("ToolRunner concluded without a message from the server");
      C(this, Mt, "f").resolve(await C(this, Ue, "f"));
    } catch (t) {
      throw U(this, mn, !1, "f"), C(this, Mt, "f").promise.catch(() => {
      }), C(this, Mt, "f").reject(t), U(this, Mt, Hl(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? C(this, he, "f").params = e(C(this, he, "f").params) : C(this, he, "f").params = e, U(this, Wt, !0, "f"), U(this, Et, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? U(this, Ne, e(C(this, Ne, "f")), "f") : U(this, Ne, {
      ...C(this, Ne, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = C(this, Ne, "f").signal) {
    const t = await C(this, Ue, "f") ?? this.params.messages.at(-1);
    return t ? C(this, rr, "m", Ts).call(this, t, e) : null;
  }
  done() {
    return C(this, Mt, "f").promise;
  }
  async runUntilDone() {
    if (!C(this, mn, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return C(this, he, "f").params;
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
Ts = async function(t, n = C(this, Ne, "f").signal) {
  return C(this, Et, "f") !== void 0 ? C(this, Et, "f") : (U(this, Et, by(C(this, he, "f").params, t, {
    ...C(this, Ne, "f"),
    signal: n
  }), "f"), C(this, Et, "f"));
};
async function by(e, t = e.messages.at(-1), n) {
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
          content: a instanceof kf ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var $f = class Lf {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new Wr();
    for await (const n of this.iterator) for (const r of t.decode(n)) yield JSON.parse(r);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new J("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new J("Attempted to iterate over a response with no body");
    return new Lf(fa(t.body), n);
  }
}, Uf = class extends re {
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
    return this._client.getAPIList("/v1/messages/batches?beta=true", zr, {
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
    if (!r.results_url) throw new J(`No batch \`results_url\`; Has it finished processing? ${r.processing_status} - ${r.id}`);
    const { betas: o } = t ?? {};
    return this._client.get(r.results_url, {
      ...n,
      headers: N([{
        "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, a) => $f.fromResponse(a.response, a.controller));
  }
}, Vl = {
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
}, Py = ["claude-mythos-preview", "claude-opus-4-6"], Yr = class extends re {
  constructor() {
    super(...arguments), this.batches = new Uf(this._client);
  }
  create(e, t) {
    const n = Jl(e), { betas: r, ...o } = n;
    o.model in Vl && console.warn(`The model '${o.model}' is deprecated and will reach end-of-life on ${Vl[o.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Py.includes(o.model) && o.thinking && o.thinking.type === "enabled" && console.warn(`Using Claude with ${o.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!o.stream && i == null) {
      const u = Rf[o.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(o.max_tokens, u);
    }
    const a = Sf(o.tools, o.messages);
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
    }, this.create(e, t).then((n) => Mf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return wy.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...r } = Jl(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: r,
      ...t,
      headers: N([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new Df(this._client, e, t);
  }
};
function Jl(e) {
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
Yr.Batches = Uf;
Yr.BetaToolRunner = Df;
Yr.ToolError = kf;
var Ff = class extends re {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList(q`/v1/sessions/${e}/events?beta=true`, Le, {
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
}, Of = class extends re {
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
    return this._client.getAPIList(q`/v1/sessions/${e}/resources?beta=true`, Le, {
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
}, Ti = class extends re {
  constructor() {
    super(...arguments), this.events = new Ff(this._client), this.resources = new Of(this._client);
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
    return this._client.getAPIList("/v1/sessions?beta=true", Le, {
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
Ti.Events = Ff;
Ti.Resources = Of;
var qf = class extends re {
  create(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.post(q`/v1/skills/${e}/versions?beta=true`, pa({
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
    return this._client.getAPIList(q`/v1/skills/${e}/versions?beta=true`, Le, {
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
}, ga = class extends re {
  constructor() {
    super(...arguments), this.versions = new qf(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.post("/v1/skills?beta=true", pa({
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
    return this._client.getAPIList("/v1/skills?beta=true", Le, {
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
ga.Versions = qf;
var Bf = class extends re {
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
    return this._client.getAPIList(q`/v1/vaults/${e}/credentials?beta=true`, Le, {
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
}, ya = class extends re {
  constructor() {
    super(...arguments), this.credentials = new Bf(this._client);
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
    return this._client.getAPIList("/v1/vaults?beta=true", Le, {
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
ya.Credentials = Bf;
var et = class extends re {
  constructor() {
    super(...arguments), this.models = new Cf(this._client), this.messages = new Yr(this._client), this.agents = new ma(this._client), this.environments = new Af(this._client), this.sessions = new Ti(this._client), this.vaults = new ya(this._client), this.memoryStores = new Ai(this._client), this.files = new Ef(this._client), this.skills = new ga(this._client), this.userProfiles = new wf(this._client);
  }
};
et.Models = Cf;
et.Messages = Yr;
et.Agents = ma;
et.Environments = Af;
et.Sessions = Ti;
et.Vaults = ya;
et.MemoryStores = Ai;
et.Files = Ef;
et.Skills = ga;
et.UserProfiles = wf;
var Gf = class extends re {
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
function Hf(e) {
  return e?.output_config?.format;
}
function Kl(e, t, n) {
  const r = Hf(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((o) => o.type === "text" ? Object.defineProperty({ ...o }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : o),
    parsed_output: null
  } : Vf(e, t, n);
}
function Vf(e, t, n) {
  let r = null;
  const o = e.content.map((i) => {
    if (i.type === "text") {
      const a = Ry(t, i.text);
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
function Ry(e, t) {
  const n = Hf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new J(`Failed to parse structured output: ${r}`);
  }
}
var Xe, Nt, gn, ir, _o, sr, ar, vo, lr, yt, ur, Ao, To, zt, So, Eo, cr, Ki, Wl, Wi, zi, Yi, Xi, zl, Yl = "__json_buf";
function Xl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var xy = class Ss {
  constructor(t, n) {
    Xe.add(this), this.messages = [], this.receivedMessages = [], Nt.set(this, void 0), gn.set(this, null), this.controller = new AbortController(), ir.set(this, void 0), _o.set(this, () => {
    }), sr.set(this, () => {
    }), ar.set(this, void 0), vo.set(this, () => {
    }), lr.set(this, () => {
    }), yt.set(this, {}), ur.set(this, !1), Ao.set(this, !1), To.set(this, !1), zt.set(this, !1), So.set(this, void 0), Eo.set(this, void 0), cr.set(this, void 0), Wi.set(this, (r) => {
      if (U(this, Ao, !0, "f"), Or(r) && (r = new at()), r instanceof at)
        return U(this, To, !0, "f"), this._emit("abort", r);
      if (r instanceof J) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new J(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new J(String(r)));
    }), U(this, ir, new Promise((r, o) => {
      U(this, _o, r, "f"), U(this, sr, o, "f");
    }), "f"), U(this, ar, new Promise((r, o) => {
      U(this, vo, r, "f"), U(this, lr, o, "f");
    }), "f"), C(this, ir, "f").catch(() => {
    }), C(this, ar, "f").catch(() => {
    }), U(this, gn, t, "f"), U(this, cr, n?.logger ?? console, "f");
  }
  get response() {
    return C(this, So, "f");
  }
  get request_id() {
    return C(this, Eo, "f");
  }
  async withResponse() {
    U(this, zt, !0, "f");
    const t = await C(this, ir, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Ss(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const i = new Ss(n, { logger: o });
    for (const a of n.messages) i._addMessageParam(a);
    return U(i, gn, {
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
    }, C(this, Wi, "f"));
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
      C(this, Xe, "m", zi).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) C(this, Xe, "m", Yi).call(this, c);
      if (u.controller.signal?.aborted) throw new at();
      C(this, Xe, "m", Xi).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (U(this, So, t, "f"), U(this, Eo, t?.headers.get("request-id"), "f"), C(this, _o, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return C(this, ur, "f");
  }
  get errored() {
    return C(this, Ao, "f");
  }
  get aborted() {
    return C(this, To, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (C(this, yt, "f")[t] || (C(this, yt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = C(this, yt, "f")[t];
    if (!r) return this;
    const o = r.findIndex((i) => i.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (C(this, yt, "f")[t] || (C(this, yt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      U(this, zt, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    U(this, zt, !0, "f"), await C(this, ar, "f");
  }
  get currentMessage() {
    return C(this, Nt, "f");
  }
  async finalMessage() {
    return await this.done(), C(this, Xe, "m", Ki).call(this);
  }
  async finalText() {
    return await this.done(), C(this, Xe, "m", Wl).call(this);
  }
  _emit(t, ...n) {
    if (C(this, ur, "f")) return;
    t === "end" && (U(this, ur, !0, "f"), C(this, vo, "f").call(this));
    const r = C(this, yt, "f")[t];
    if (r && (C(this, yt, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !C(this, zt, "f") && !r?.length && Promise.reject(o), C(this, sr, "f").call(this, o), C(this, lr, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !C(this, zt, "f") && !r?.length && Promise.reject(o), C(this, sr, "f").call(this, o), C(this, lr, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", C(this, Xe, "m", Ki).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      C(this, Xe, "m", zi).call(this), this._connected(null);
      const i = qr.fromReadableStream(t, this.controller);
      for await (const a of i) C(this, Xe, "m", Yi).call(this, a);
      if (i.controller.signal?.aborted) throw new at();
      C(this, Xe, "m", Xi).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(Nt = /* @__PURE__ */ new WeakMap(), gn = /* @__PURE__ */ new WeakMap(), ir = /* @__PURE__ */ new WeakMap(), _o = /* @__PURE__ */ new WeakMap(), sr = /* @__PURE__ */ new WeakMap(), ar = /* @__PURE__ */ new WeakMap(), vo = /* @__PURE__ */ new WeakMap(), lr = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), ur = /* @__PURE__ */ new WeakMap(), Ao = /* @__PURE__ */ new WeakMap(), To = /* @__PURE__ */ new WeakMap(), zt = /* @__PURE__ */ new WeakMap(), So = /* @__PURE__ */ new WeakMap(), Eo = /* @__PURE__ */ new WeakMap(), cr = /* @__PURE__ */ new WeakMap(), Wi = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakSet(), Ki = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Wl = function() {
    if (this.receivedMessages.length === 0) throw new J("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new J("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, zi = function() {
    this.ended || U(this, Nt, void 0, "f");
  }, Yi = function(n) {
    if (this.ended) return;
    const r = C(this, Xe, "m", zl).call(this, n);
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
            Xl(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage(Kl(r, C(this, gn, "f"), { logger: C(this, cr, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        U(this, Nt, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Xi = function() {
    if (this.ended) throw new J("stream has ended, this shouldn't happen");
    const n = C(this, Nt, "f");
    if (!n) throw new J("request ended without sending any chunks");
    return U(this, Nt, void 0, "f"), Kl(n, C(this, gn, "f"), { logger: C(this, cr, "f") });
  }, zl = function(n) {
    let r = C(this, Nt, "f");
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
            if (o && Xl(o)) {
              let i = o[Yl] || "";
              i += n.delta.partial_json;
              const a = { ...o };
              Object.defineProperty(a, Yl, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (a.input = Nf(i)), r.content[n.index] = a;
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
    return new qr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Jf = class extends re {
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
    return this._client.getAPIList("/v1/messages/batches", zr, {
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
      headers: N([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((r, o) => $f.fromResponse(o.response, o.controller));
  }
}, _a = class extends re {
  constructor() {
    super(...arguments), this.batches = new Jf(this._client);
  }
  create(e, t) {
    e.model in Ql && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${Ql[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), My.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const o = Rf[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, o);
    }
    const r = Sf(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: N([r, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Vf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return xy.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, Ql = {
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
}, My = ["claude-mythos-preview", "claude-opus-4-6"];
_a.Batches = Jf;
var Kf = class extends re {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get(q`/v1/models/${e}`, {
      ...n,
      headers: N([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models", zr, {
      query: r,
      ...t,
      headers: N([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Co = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Es, va, qo, Wf, Ny = "\\n\\nHuman:", ky = "\\n\\nAssistant:", ue = class {
  constructor({ baseURL: e = Co("ANTHROPIC_BASE_URL"), apiKey: t = Co("ANTHROPIC_API_KEY") ?? null, authToken: n = Co("ANTHROPIC_AUTH_TOKEN") ?? null, ...r } = {}) {
    Es.add(this), qo.set(this, void 0);
    const o = {
      apiKey: t,
      authToken: n,
      ...r,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!o.dangerouslyAllowBrowser && Wg()) throw new J(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = o.baseURL, this.timeout = o.timeout ?? va.DEFAULT_TIMEOUT, this.logger = o.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = kl(o.logLevel, "ClientOptions.logLevel", this) ?? kl(Co("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = o.fetchOptions, this.maxRetries = o.maxRetries ?? 2, this.fetch = o.fetch ?? Zg(), U(this, qo, ey, "f"), this._options = o, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return ty(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${An}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Xd()}`;
  }
  makeStatusError(e, t, n, r) {
    return Je.generate(e, t, n, r);
  }
  buildURL(e, t, n) {
    const r = !C(this, Es, "m", Wf).call(this) && n || this.baseURL, o = Hg(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!Il(i) || !Il(a)) && (t = {
      ...a,
      ...i,
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
    return new ff(this, this.makeRequest(e, t, void 0));
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
    if (Pe(this).debug(`[${c}] sending request`, Yt({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: i.headers
    })), r.signal?.aborted) throw new at();
    const f = new AbortController(), p = await this.fetchWithTimeout(a, i, u, f).catch(ps), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new at();
      const v = Or(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return Pe(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - ${_}`), Pe(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (${_})`, Yt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(r, t, n ?? c);
      throw Pe(this).info(`[${c}] connection ${v ? "timed out" : "failed"} - error; no more retries left`), Pe(this).debug(`[${c}] connection ${v ? "timed out" : "failed"} (error; no more retries left)`, Yt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - h,
        message: p.message
      })), v ? new Qd() : new vi({ cause: p });
    }
    const y = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, v]) => ", " + _ + ": " + JSON.stringify(v)).join("")}] ${i.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const P = `retrying, ${t} attempts remaining`;
        return await jg(p.body), Pe(this).info(`${y} - ${P}`), Pe(this).debug(`[${c}] response error (${P})`, Yt({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(r, t, n ?? c, p.headers);
      }
      const v = _ ? "error; no more retries left" : "error; not retryable";
      Pe(this).info(`${y} - ${v}`);
      const E = await p.text().catch((P) => ps(P).message), b = af(E), R = b ? void 0 : E;
      throw Pe(this).debug(`[${c}] response error (${v})`, Yt({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: R,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, b, R, p.headers);
    }
    return Pe(this).info(y), Pe(this).debug(`[${c}] response start`, Yt({
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
    return new cy(this, n, e);
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
    return await Kg(o), this.makeRequest(e, t - 1, n);
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
    const n = { ...e }, { method: r, path: o, query: i, defaultBaseURL: a } = n, u = this.buildURL(o, i, a);
    "timeout" in n && Jg("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
        ...Qg(),
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
      body: uf(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : C(this, qo, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
va = ue, qo = /* @__PURE__ */ new WeakMap(), Es = /* @__PURE__ */ new WeakSet(), Wf = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
ue.Anthropic = va;
ue.HUMAN_PROMPT = Ny;
ue.AI_PROMPT = ky;
ue.DEFAULT_TIMEOUT = 6e5;
ue.AnthropicError = J;
ue.APIError = Je;
ue.APIConnectionError = vi;
ue.APIConnectionTimeoutError = Qd;
ue.APIUserAbortError = at;
ue.NotFoundError = tf;
ue.ConflictError = nf;
ue.RateLimitError = of;
ue.BadRequestError = Zd;
ue.AuthenticationError = jd;
ue.InternalServerError = sf;
ue.PermissionDeniedError = ef;
ue.UnprocessableEntityError = rf;
ue.toFile = gy;
var Xr = class extends ue {
  constructor() {
    super(...arguments), this.completions = new Gf(this), this.messages = new _a(this), this.models = new Kf(this), this.beta = new et(this);
  }
};
Xr.Completions = Gf;
Xr.Messages = _a;
Xr.Models = Kf;
Xr.Beta = et;
function ln(e) {
  if (Array.isArray(e)) return e.map((n) => ln(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, r]) => {
    t[n] = /^(?:authorization|proxy[-_]?authorization|(?:x[-_])?csrf(?:[-_]?token)?|token|access[-_]?token|refresh[-_]?token|id[-_]?token|api[-_]?key|x[-_](?:goog[-_])?api[-_]?key|proxy[-_]?password|password|client[-_]?secret)$/i.test(n) ? "[redacted]" : ln(r);
  }), t;
}
function Ot(e = {}, t = {}) {
  const n = String(e.reasoning?.mode || "inherit"), r = e.reasoning?.output === "show" ? "show" : "hide", o = String(t.effectiveMode || n);
  return {
    reasoningRequestedMode: n,
    reasoningRequestedOutput: r,
    reasoningProfileId: String(t.profileId || e.reasoning?.profileId || "unsupported"),
    reasoningEffectiveMode: o,
    reasoningEffort: o === "on" ? String(t.effort ?? e.reasoning?.effort ?? "") : "",
    reasoningBudgetTokens: o === "on" && Number.isFinite(Number(t.budgetTokens ?? e.reasoning?.budgetTokens)) ? Number(t.budgetTokens ?? e.reasoning?.budgetTokens) : null,
    reasoningControlFields: ln(t.controlFields || {}),
    reasoningOutputVisible: o !== "off" && r === "show"
  };
}
function Br(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: ln({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    }),
    ...e.effectiveConfig ? { effectiveConfig: e.effectiveConfig } : {}
  };
}
function Dy(e = "") {
  return String(e || "").trim().toLowerCase();
}
function Aa(e = "") {
  const t = Dy(e);
  return t.includes("deepseek") ? "deepseek" : t.includes("kimi") || t.includes("moonshot") ? "kimi" : t.includes("gemini") ? "gemini" : t.includes("claude") ? "claude" : /(?:^|[/_.-])gpt(?:\d|[/_.-]|$)/.test(t) || /(?:^|[/_.-])o\d+(?:[/_.-]|$)/.test(t) ? "openai" : "";
}
var $y = Object.freeze({
  minimal: "最小",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "超高",
  max: "最大",
  min: "最小"
});
function zf(e) {
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
function pt(e, t, n, r, o = {}) {
  return zf({
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
var Si = zf({
  profileId: "unsupported",
  modes: ["inherit"],
  outputModes: ["hide"],
  intensity: { kind: "none" },
  unsupportedReason: "当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。"
}), Qr = Object.freeze(["on"]), Ta = Object.freeze([
  "inherit",
  "on",
  "off"
]), Yf = pt("openai-gpt-5.6", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "medium", { temperatureOmitModes: Ta }), Ly = pt("kimi-k3", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "max", { temperatureOmitModes: Qr }), Uy = pt("deepseek-thinking", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "high", { temperatureOmitModes: Qr }), Fy = pt("openai-compatible-gemini-latest", [
  "inherit",
  "on",
  "off"
], [
  "minimal",
  "low",
  "medium",
  "high"
], "high", { temperatureOmitModes: Qr }), Oy = pt("openai-compatible-claude-latest", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: Qr }), qy = pt("openai-compatible-default", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high"
], "medium", { temperatureOmitModes: Qr }), By = pt("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: Ta }), Gy = pt("sillytavern-claude-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: Ta }), Hy = pt("google-gemini-3-flash", ["inherit", "on"], [
  "minimal",
  "low",
  "medium",
  "high"
], "high"), Vy = pt("sillytavern-google-3-flash", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high"
], "high");
function Jy(e = "") {
  switch (Aa(e)) {
    case "deepseek":
      return Uy;
    case "kimi":
      return Ly;
    case "gemini":
      return Fy;
    case "claude":
      return Oy;
    case "openai":
      return Yf;
    default:
      return qy;
  }
}
function Zr(e = {}) {
  const t = String(e.provider || "").trim(), n = String(e.model || "").trim().toLowerCase();
  switch (t) {
    case "openai-responses":
      return Yf;
    case "openai-compatible":
    case "sillytavern-openai-compatible":
      return Jy(n);
    case "anthropic":
      return By;
    case "sillytavern-claude":
      return Gy;
    case "google":
      return Hy;
    case "sillytavern-google":
      return Vy;
    default:
      return Si;
  }
}
function Ky(e = Si) {
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
function Wy(e = Si) {
  return e.intensity?.kind !== "effort" ? [] : e.intensity.values.map((t) => ({
    value: t,
    label: $y[t] || t
  }));
}
function zy(e = Si) {
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
function Qi(e, t, n, r = "REASONING_CAPABILITY_UNSUPPORTED") {
  return {
    ...e,
    profileId: t.profileId,
    valid: !1,
    error: n,
    code: r
  };
}
function Yy(e, t) {
  const n = { ...e };
  return delete n.effort, delete n.budgetTokens, t.intensity?.kind === "effort" ? {
    ...n,
    ...e.effort ? { effort: e.effort } : {}
  } : n;
}
function nn(e = {}, t = {}) {
  const n = Zr(e), r = Yy(an(t), n);
  if (!n.outputModes.includes(r.output)) return Qi(r, n, "当前模型不支持返回 Reasoning 内容，请选择“隐藏”。");
  if (!n.modes.includes(r.mode)) return Qi(r, n, r.mode === "off" ? "当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。" : n.unsupportedReason || "当前模型不支持显式开启 Reasoning。");
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
    } : Qi(r, n, `当前模型不支持 Reasoning 强度“${o}”。`, "REASONING_CONFIG_INVALID");
  }
  return {
    ...r,
    profileId: n.profileId,
    valid: !0
  };
}
var Xy = class extends Error {
  constructor(e = {}) {
    super(e.error || "当前模型不支持所选 Reasoning 配置。"), this.name = "ReasoningCapabilityError", this.code = e.code || "REASONING_CAPABILITY_UNSUPPORTED", this.profileId = e.profileId || "unsupported", this.reasoning = e;
  }
};
function Xf(e = {}) {
  if (e.valid === !1) throw new Xy(e);
  return e;
}
function Me(e = "", t = {}, n = {}, r = {}) {
  return Xf(nn({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model,
    maxTokens: r.maxTokens ?? t.maxTokens
  }, n));
}
function jr(e = {}, t = {}) {
  return Zr(e).temperatureOmitModes.includes(t.mode);
}
function Qy(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Zy(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function Qf(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function jy(e) {
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
      const r = Zy(n.image_url.url);
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
function e_(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function t_(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && Qf(t) || null;
}
function n_(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: Qf(e.content) || [] } : void 0;
}
function Zl(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function jl(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: Qy(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function r_(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const r = e[n];
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const o = t_(r), i = jl(r.tool_calls);
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
        const o = [Zl(r)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, o.push(Zl(e[n]));
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
          }] : [], ...jl(r.tool_calls)]
        });
        continue;
      }
      t.push({
        role: r.role,
        content: jy(r.content)
      });
    }
  }
  return t;
}
function wo(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function eu(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function o_(e = "auto", t = []) {
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
var i_ = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function tu(e = {}, t = {}) {
  const n = Array.isArray(t.tools) ? t.tools : [], r = n.length ? o_(t.toolChoice, n) : void 0, o = an(t.reasoning), i = Zr({
    provider: "anthropic",
    baseUrl: e.baseUrl,
    model: e.model
  }), a = o.mode === "on" && i.profileId === "anthropic-manual" && (r?.type === "any" || r?.type === "tool"), u = Me("anthropic", e, {
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
var s_ = class {
  constructor(e) {
    this.config = e, this.client = new Xr({
      apiKey: e.apiKey,
      baseURL: eu(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e) {
    const t = tu(this.config, e), n = t.effectiveReasoning, r = (Array.isArray(e.tools) ? e.tools : []).map((a) => ({
      name: a.function.name,
      description: a.function.description,
      input_schema: a.function.parameters
    })), o = e_(e), i = {
      model: this.config.model,
      system: o,
      messages: r_(e.messages),
      ...r.length ? {
        tools: r,
        tool_choice: t.toolChoice
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !jr({
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
    const n = typeof e.onStreamProgress == "function", r = eu(this.config.baseUrl), o = t.body || this.buildRequestBody(e), i = tu(this.config, e), a = i.effectiveReasoning;
    return {
      ...Br({
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
        effectiveConfig: Ot(e, {
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
      ...i.reasoningDisabledForForcedTool ? { notices: [i_] } : {}
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
        p.length && wo(e, {
          text: c,
          thoughts: d(),
          toolCalls: p,
          toolCallDraft: !0
        });
      };
      i.on("text", (p, m) => {
        c = m || "", wo(e, {
          text: c,
          thoughts: d(),
          ...h().length ? {
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), i.on("thinking", (p, m) => {
        a.set("thinking:0", m || ""), wo(e, {
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
        p?.type === "redacted_thinking" && (a.set("redacted:0", p.data || ""), wo(e, {
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
      providerPayload: n_(r),
      requestInspection: n
    };
  }
}, a_ = /* @__PURE__ */ yi(((e, t) => {
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
})), l_ = /* @__PURE__ */ yi(((e) => {
  var t = a_();
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
})), u_ = /* @__PURE__ */ yi(((e, t) => {
  t.exports = l_();
})), c_ = /* @__PURE__ */ yi(((e, t) => {
  var n = u_(), r = [
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
})), nu = /* @__PURE__ */ Mg(c_(), 1), d_ = void 0, f_ = void 0;
function h_() {
  return {
    geminiUrl: d_,
    vertexUrl: f_
  };
}
function p_(e, t, n, r) {
  var o, i;
  if (!e?.baseUrl) {
    const a = h_();
    return t ? (o = a.vertexUrl) !== null && o !== void 0 ? o : n : (i = a.geminiUrl) !== null && i !== void 0 ? i : r;
  }
  return e.baseUrl;
}
var wt = class {
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
function m_(e, t) {
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
    Cs(e, o, i, 0, a);
  }
}
function Cs(e, t, n, r, o) {
  if (r >= t.length || typeof e != "object" || e === null) return;
  const i = t[r];
  if (i.endsWith("[]")) {
    const a = i.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) Cs(c, t, n, r + 1, o);
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
    i in a && Cs(a[i], t, n, r + 1, o);
  }
}
function Sa(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function g_(e) {
  const t = {}, n = s(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const r = s(e, ["resourceName"]);
  return r != null && l(t, ["_url", "resourceName"], r), t;
}
function y_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], v_(a)), t;
}
function __(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], A_(a)), t;
}
function v_(e) {
  const t = {}, n = s(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => T_(a))), l(t, ["generatedVideos"], i);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = s(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function A_(e) {
  const t = {}, n = s(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => S_(a))), l(t, ["generatedVideos"], i);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = s(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function T_(e) {
  const t = {}, n = s(e, ["video"]);
  return n != null && l(t, ["video"], P_(n)), t;
}
function S_(e) {
  const t = {}, n = s(e, ["_self"]);
  return n != null && l(t, ["video"], R_(n)), t;
}
function E_(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function C_(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function w_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], I_(a)), t;
}
function I_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function Zf(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], b_(a)), t;
}
function b_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function P_(e) {
  const t = {}, n = s(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const r = s(e, ["encodedVideo"]);
  r != null && l(t, ["videoBytes"], Sa(r));
  const o = s(e, ["encoding"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function R_(e) {
  const t = {}, n = s(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const r = s(e, ["bytesBase64Encoded"]);
  r != null && l(t, ["videoBytes"], Sa(r));
  const o = s(e, ["mimeType"]);
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
var iu;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(iu || (iu = {}));
var Ut;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(Ut || (Ut = {}));
var su;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(su || (su = {}));
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
var bn;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(bn || (bn = {}));
var Pn;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Pn || (Pn = {}));
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
var Tu;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Tu || (Tu = {}));
var Su;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Su || (Su = {}));
var Eu;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Eu || (Eu = {}));
var ei;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(ei || (ei = {}));
var Cu;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Cu || (Cu = {}));
var wu;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(wu || (wu = {}));
var Iu;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Iu || (Iu = {}));
var bu;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(bu || (bu = {}));
var ws;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(ws || (ws = {}));
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
var Is;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(Is || (Is = {}));
var $u;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})($u || ($u = {}));
var Lu;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(Lu || (Lu = {}));
var ti;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(ti || (ti = {}));
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
var ic;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(ic || (ic = {}));
var Rn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(Rn || (Rn = {}));
var bs = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, dr = class {
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
}, sc = class {
}, ac = class {
}, x_ = class {
}, M_ = class {
}, N_ = class {
}, k_ = class {
}, lc = class {
}, uc = class {
}, cc = class {
}, D_ = class {
}, dc = class jf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new jf();
    let o;
    const i = t;
    return n ? o = __(i) : o = y_(i), Object.assign(r, o), r;
  }
}, fc = class {
}, hc = class {
}, pc = class {
}, mc = class {
}, $_ = class {
}, L_ = class {
}, U_ = class {
}, F_ = class eh {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new eh(), o = w_(t);
    return Object.assign(r, o), r;
  }
}, O_ = class {
}, q_ = class {
}, B_ = class {
}, G_ = class {
}, gc = class {
}, H_ = class {
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
}, V_ = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, J_ = class th {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new th(), o = Zf(t);
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
function nh(e, t) {
  const n = Y(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function rh(e) {
  return Array.isArray(e) ? e.map((t) => ni(t)) : [ni(e)];
}
function ni(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function oh(e) {
  const t = ni(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function ih(e) {
  const t = ni(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function yc(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function sh(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => yc(t)) : [yc(e)];
}
function Ps(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function _c(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function vc(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function Ae(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return Ps(e) ? e : {
    role: "user",
    parts: sh(e)
  };
}
function Ea(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const r = Ae(n);
    return r.parts && r.parts.length > 0 && r.parts[0].text !== void 0 ? [r.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = Ae(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => Ae(n)) : [Ae(t)];
}
function De(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (_c(e) || vc(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [Ae(e)];
  }
  const t = [], n = [], r = Ps(e[0]);
  for (const o of e) {
    const i = Ps(o);
    if (i != r) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(o);
    else {
      if (_c(o) || vc(o)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(o);
    }
  }
  return r || t.push({
    role: "user",
    parts: sh(n)
  }), t;
}
function K_(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((r) => r !== "null");
  if (n.length === 1) t.type = Object.values(Ut).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : Ut.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const r of n) t.anyOf.push({ type: Object.values(Ut).includes(r.toUpperCase()) ? r.toUpperCase() : Ut.TYPE_UNSPECIFIED });
  }
}
function $n(e) {
  const t = {}, n = ["items"], r = ["anyOf"], o = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && K_(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(Ut).includes(u.toUpperCase()) ? u.toUpperCase() : Ut.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = $n(u);
      else if (r.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push($n(d));
        }
        t[a] = c;
      } else if (o.includes(a)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = $n(h);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function Ca(e) {
  return $n(e);
}
function wa(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function Ia(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function Bn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = $n(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = $n(t.response));
  return e;
}
function Gn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function W_(e, t, n, r = 1) {
  const o = !t.startsWith(`${n}/`) && t.split("/").length === r;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : o ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : o ? `${n}/${t}` : t;
}
function It(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return W_(e, t, "cachedContents");
}
function ah(e) {
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
function Bt(e) {
  return Sa(e);
}
function z_(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function Y_(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function X_(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function lh(e) {
  var t;
  let n;
  if (z_(e) && (n = e.name), !(X_(e) && (n = e.uri, n === void 0)) && !(Y_(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const r = n.split("files/")[1].match(/[a-z0-9]+/);
      if (r === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = r[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function uh(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function ch(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (Q_(e, t)) return e[t];
  return [];
}
function Q_(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function Z_(e, t = {}) {
  const n = e, r = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (r.responseJsonSchema = n.outputSchema), t.behavior && (r.behavior = t.behavior), { functionDeclarations: [r] };
}
function j_(e, t = {}) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const o of e) {
    const i = o.name;
    if (r.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    r.add(i);
    const a = Z_(o, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function dh(e, t) {
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
function ev(e) {
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
function fh(e) {
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
function Hn(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function hh(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function tv(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function nv(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function rv(e) {
  const t = {}, n = s(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const r = s(e, ["inlinedResponses", "inlinedResponses"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => Uv(a))), l(t, ["inlinedResponses"], i);
  }
  const o = s(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function ov(e) {
  const t = {}, n = s(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const r = s(e, ["gcsDestination", "outputUriPrefix"]);
  r != null && l(t, ["gcsUri"], r);
  const o = s(e, ["bigqueryDestination", "outputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function iv(e) {
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
function Bo(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata", "displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = s(e, ["metadata", "state"]);
  o != null && l(t, ["state"], hh(o));
  const i = s(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const a = s(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = s(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = s(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = s(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], rv(fh(d))), t;
}
function Rs(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = s(e, ["state"]);
  o != null && l(t, ["state"], hh(o));
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
  f != null && l(t, ["src"], sv(f));
  const p = s(e, ["outputConfig"]);
  p != null && l(t, ["dest"], ov(fh(p)));
  const m = s(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function sv(e) {
  const t = {}, n = s(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const r = s(e, ["gcsSource", "uris"]);
  r != null && l(t, ["gcsUri"], r);
  const o = s(e, ["bigquerySource", "inputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function av(e, t) {
  const n = {};
  if (s(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (s(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (s(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const r = s(t, ["fileName"]);
  r != null && l(n, ["fileName"], r);
  const o = s(t, ["inlinedRequests"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Lv(e, a))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function lv(e) {
  const t = {}, n = s(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const r = s(e, ["gcsUri"]);
  r != null && l(t, ["gcsSource", "uris"], r);
  const o = s(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigquerySource", "inputUri"], o), s(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function uv(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function cv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Hn(e, r)), n;
}
function dv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Hn(e, r)), n;
}
function fv(e) {
  const t = {}, n = s(e, ["content"]);
  n != null && l(t, ["content"], n);
  const r = s(e, ["citationMetadata"]);
  r != null && l(t, ["citationMetadata"], hv(r));
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
function hv(e) {
  const t = {}, n = s(e, ["citationSources"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["citations"], r);
  }
  return t;
}
function ph(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => Vv(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function pv(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  if (t !== void 0 && r != null && l(t, ["batch", "displayName"], r), s(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const o = s(e, ["webhookConfig"]);
  return t !== void 0 && o != null && l(t, ["batch", "webhookConfig"], o), n;
}
function mv(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const o = s(e, ["dest"]);
  if (t !== void 0 && o != null && l(t, ["outputConfig"], iv(ev(o))), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Ac(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], av(e, dh(e, o)));
  const i = s(t, ["config"]);
  return i != null && pv(i, n), n;
}
function gv(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], Y(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["inputConfig"], lv(dh(e, o)));
  const i = s(t, ["config"]);
  return i != null && mv(i, n), n;
}
function yv(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["batch", "displayName"], r), n;
}
function _v(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["_url", "model"], Y(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], wv(e, o));
  const i = s(t, ["config"]);
  return i != null && yv(i, n), n;
}
function vv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Hn(e, r)), n;
}
function Av(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Hn(e, r)), n;
}
function Tv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function Sv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function Ev(e, t) {
  const n = {}, r = s(t, ["contents"]);
  if (r != null) {
    let i = Ea(e, r);
    Array.isArray(i) && (i = i.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const o = s(t, ["config"]);
  return o != null && (l(n, ["_self"], Cv(o, n)), m_(n, { "requests[].*": "requests[].request.*" })), n;
}
function Cv(e, t) {
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
function wv(e, t) {
  const n = {}, r = s(t, ["fileName"]);
  r != null && l(n, ["file_name"], r);
  const o = s(t, ["inlinedRequests"]);
  return o != null && l(n, ["requests"], Ev(e, o)), n;
}
function Iv(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function bv(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Pv(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = s(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Rv(e, t, n) {
  const r = {}, o = s(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], ph(Ae(o)));
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
  E != null && l(r, ["responseSchema"], Ca(E));
  const b = s(t, ["responseJsonSchema"]);
  if (b != null && l(r, ["responseJsonSchema"], b), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const R = s(t, ["safetySettings"]);
  if (n !== void 0 && R != null) {
    let j = R;
    Array.isArray(j) && (j = j.map((X) => Jv(X))), l(n, ["safetySettings"], j);
  }
  const P = s(t, ["tools"]);
  if (n !== void 0 && P != null) {
    let j = Gn(P);
    Array.isArray(j) && (j = j.map((X) => Wv(Bn(X)))), l(n, ["tools"], j);
  }
  const L = s(t, ["toolConfig"]);
  if (n !== void 0 && L != null && l(n, ["toolConfig"], Kv(L)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const S = s(t, ["cachedContent"]);
  n !== void 0 && S != null && l(n, ["cachedContent"], It(e, S));
  const O = s(t, ["responseModalities"]);
  O != null && l(r, ["responseModalities"], O);
  const x = s(t, ["mediaResolution"]);
  x != null && l(r, ["mediaResolution"], x);
  const D = s(t, ["speechConfig"]);
  if (D != null && l(r, ["speechConfig"], wa(D)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = s(t, ["thinkingConfig"]);
  H != null && l(r, ["thinkingConfig"], H);
  const z = s(t, ["imageConfig"]);
  z != null && l(r, ["imageConfig"], $v(z));
  const ge = s(t, ["enableEnhancedCivicAnswers"]);
  if (ge != null && l(r, ["enableEnhancedCivicAnswers"], ge), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const Q = s(t, ["serviceTier"]);
  return n !== void 0 && Q != null && l(n, ["serviceTier"], Q), r;
}
function xv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["candidates"]);
  if (r != null) {
    let d = r;
    Array.isArray(d) && (d = d.map((h) => fv(h))), l(t, ["candidates"], d);
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
function Mv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Hn(e, r)), n;
}
function Nv(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], Hn(e, r)), n;
}
function kv(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], nv(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function Dv(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function $v(e) {
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
function Lv(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["request", "model"], Y(e, r));
  const o = s(t, ["contents"]);
  if (o != null) {
    let u = De(o);
    Array.isArray(u) && (u = u.map((c) => ph(c))), l(n, ["request", "contents"], u);
  }
  const i = s(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = s(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], Rv(e, a, s(n, ["request"], {}))), n;
}
function Uv(e) {
  const t = {}, n = s(e, ["response"]);
  n != null && l(t, ["response"], xv(n));
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function Fv(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  if (t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), s(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function Ov(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const i = s(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function qv(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && Fv(n, t), t;
}
function Bv(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && Ov(n, t), t;
}
function Gv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["operations"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Bo(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Hv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["batchPredictionJobs"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Rs(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Vv(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], Iv(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], bv(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], uv(c));
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
function Jv(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function Kv(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], Pv(r));
  const o = s(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function Wv(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], Dv(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], kv(i));
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
var Ct;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(Ct || (Ct = {}));
var cn = class {
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
}, zv = class extends wt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new cn(Ct.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Ac(this.apiClient, e), n = t._url, r = $("{model}:batchGenerateContent", n), o = t.batch.inputConfig.requests, i = o.requests, a = [];
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
      const c = gv(this.apiClient, e);
      return a = $("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Rs(d));
    } else {
      const c = Ac(this.apiClient, e);
      return a = $("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Bo(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = _v(this.apiClient, e);
      return o = $("{model}:asyncBatchEmbedContent", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => Bo(u));
    }
  }
  async get(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Nv(this.apiClient, e);
      return a = $("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Rs(d));
    } else {
      const c = Mv(this.apiClient, e);
      return a = $("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Bo(d));
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let i = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = dv(this.apiClient, e);
      i = $("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = cv(this.apiClient, e);
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
      const c = Bv(e);
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
        const h = Hv(d), f = new gc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = qv(e);
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
        const h = Gv(d), f = new gc();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Av(this.apiClient, e);
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
      })), i.then((d) => Sv(d));
    } else {
      const c = vv(this.apiClient, e);
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
      })), i.then((d) => Tv(d));
    }
  }
};
function Yv(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Xv(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Tc(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => vA(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Sc(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => AA(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function Qv(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let h = De(a);
    Array.isArray(h) && (h = h.map((f) => Tc(f))), l(t, ["contents"], h);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Tc(Ae(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => EA(f))), l(t, ["tools"], h);
  }
  const d = s(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], TA(d)), s(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function Zv(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = De(a);
    Array.isArray(f) && (f = f.map((p) => Sc(p))), l(t, ["contents"], f);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Sc(Ae(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => CA(p))), l(t, ["tools"], f);
  }
  const d = s(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], SA(d));
  const h = s(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function jv(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], nh(e, r));
  const o = s(t, ["config"]);
  return o != null && Qv(o, n), n;
}
function eA(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], nh(e, r));
  const o = s(t, ["config"]);
  return o != null && Zv(o, n), n;
}
function tA(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], It(e, r)), n;
}
function nA(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], It(e, r)), n;
}
function rA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function oA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function iA(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function sA(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function aA(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = s(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function lA(e) {
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
function uA(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], It(e, r)), n;
}
function cA(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], It(e, r)), n;
}
function dA(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Yv(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function fA(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function hA(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function pA(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function mA(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && hA(n, t), t;
}
function gA(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && pA(n, t), t;
}
function yA(e) {
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
function _A(e) {
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
function vA(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], iA(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], sA(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Xv(c));
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
function AA(e) {
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
function TA(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], aA(r));
  const o = s(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function SA(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  if (r != null && l(t, ["functionCallingConfig"], r), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function EA(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], fA(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], dA(i));
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
function CA(e) {
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
    Array.isArray(p) && (p = p.map((m) => lA(m))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function wA(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function IA(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function bA(e, t) {
  const n = {}, r = s(t, ["name"]);
  r != null && l(n, ["_url", "name"], It(e, r));
  const o = s(t, ["config"]);
  return o != null && wA(o, n), n;
}
function PA(e, t) {
  const n = {}, r = s(t, ["name"]);
  r != null && l(n, ["_url", "name"], It(e, r));
  const o = s(t, ["config"]);
  return o != null && IA(o, n), n;
}
var RA = class extends wt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new cn(Ct.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = eA(this.apiClient, e);
      return a = $("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = jv(this.apiClient, e);
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
      const c = cA(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = uA(this.apiClient, e);
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
      const c = nA(this.apiClient, e);
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
        const h = oA(d), f = new pc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = tA(this.apiClient, e);
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
        const h = rA(d), f = new pc();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = PA(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = bA(this.apiClient, e);
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
      const c = gA(e);
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
        const h = _A(d), f = new mc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = mA(e);
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
        const h = yA(d), f = new mc();
        return Object.assign(f, h), f;
      });
    }
  }
};
function Ft(e, t) {
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
function lt(e, t, n) {
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
    m.value instanceof K ? Promise.resolve(m.value.v).then(h, f) : p(i[0][2], m);
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
function ut(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Ec == "function" ? Ec(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
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
function xA(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : mh(n);
}
function mh(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function MA(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Cc(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let r = 0;
  for (; r < n; ) if (e[r].role === "user")
    t.push(e[r]), r++;
  else {
    const o = [];
    let i = !0;
    for (; r < n && e[r].role === "model"; )
      o.push(e[r]), i && !mh(e[r]) && (i = !1), r++;
    i ? t.push(...o) : t.pop();
  }
  return t;
}
var NA = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new kA(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, kA = class {
  constructor(e, t, n, r = {}, o = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = r, this.history = o, this.sendPromise = Promise.resolve(), MA(o);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = Ae(e.message), r = this.modelsModule.generateContent({
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
    const n = Ae(e.message), r = this.modelsModule.generateContentStream({
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
    const t = e ? Cc(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return lt(this, arguments, function* () {
      var r, o, i, a, u, c;
      const d = [];
      try {
        for (var h = !0, f = ut(e), p; p = yield K(f.next()), r = p.done, !r; h = !0) {
          a = p.value, h = !1;
          const m = a;
          if (xA(m)) {
            const y = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            y !== void 0 && d.push(y);
          }
          yield yield K(m);
        }
      } catch (m) {
        o = { error: m };
      } finally {
        try {
          !h && !r && (i = f.return) && (yield K(i.call(f)));
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
    }), n && n.length > 0 ? this.history.push(...Cc(n)) : this.history.push(e), this.history.push(...r);
  }
}, gh = class yh extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, yh.prototype);
  }
};
function DA(e) {
  const t = {}, n = s(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function $A(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function LA(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], lh(n)), t;
}
function UA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function FA(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], lh(n)), t;
}
function OA(e) {
  const t = {}, n = s(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function qA(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function BA(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && qA(n, t), t;
}
function GA(e) {
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
function HA(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["files"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(t, ["files"], o);
  }
  return t;
}
var VA = class extends wt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new cn(Ct.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const a = BA(e);
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
        const c = GA(u), d = new O_();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = DA(e);
      return o = $("upload/v1beta/files", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = $A(u), d = new q_();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = FA(e);
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
      const a = LA(e);
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
        const c = UA(u), d = new B_();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = OA(e);
      return o = $("files:register", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = HA(u), d = new G_();
        return Object.assign(d, c), d;
      });
    }
  }
};
function wc(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function JA(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Go(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function KA(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => uT(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function WA(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => cT(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function zA(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function YA(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function XA(e) {
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
function QA(e) {
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
function ZA(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], JA(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function jA(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function eT(e, t) {
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
  ], Ia(f));
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
  t !== void 0 && y != null && l(t, ["setup", "systemInstruction"], KA(Ae(y)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = Gn(_);
    Array.isArray(x) && (x = x.map((D) => hT(Bn(D)))), l(t, ["setup", "tools"], x);
  }
  const v = s(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], fT(v));
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], wc(E));
  const b = s(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], wc(b));
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
    Array.isArray(x) && (x = x.map((D) => dT(D))), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function tT(e, t) {
  const n = {}, r = s(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], QA(r));
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
  ], Ia(f));
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
  t !== void 0 && y != null && l(t, ["setup", "systemInstruction"], WA(Ae(y)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let D = Gn(_);
    Array.isArray(D) && (D = D.map((H) => pT(Bn(H)))), l(t, ["setup", "tools"], D);
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
function nT(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], eT(o, n)), n;
}
function rT(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], tT(o, n)), n;
}
function oT(e) {
  const t = {}, n = s(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function iT(e) {
  const t = {}, n = s(e, ["weightedPrompts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["weightedPrompts"], r);
  }
  return t;
}
function sT(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = rh(n);
    Array.isArray(d) && (d = d.map((h) => Go(h))), l(t, ["mediaChunks"], d);
  }
  const r = s(e, ["audio"]);
  r != null && l(t, ["audio"], Go(ih(r)));
  const o = s(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], Go(oh(i)));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function aT(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = rh(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const r = s(e, ["audio"]);
  r != null && l(t, ["audio"], ih(r));
  const o = s(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], oh(i));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function lT(e) {
  const t = {}, n = s(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const r = s(e, ["serverContent"]);
  r != null && l(t, ["serverContent"], r);
  const o = s(e, ["toolCall"]);
  o != null && l(t, ["toolCall"], o);
  const i = s(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const a = s(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], mT(a));
  const u = s(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = s(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = s(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = s(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], gT(h)), t;
}
function uT(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], zA(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], YA(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Go(c));
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
function cT(e) {
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
function dT(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function fT(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function hT(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], jA(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], ZA(i));
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
function pT(e) {
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
    Array.isArray(p) && (p = p.map((m) => XA(m))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function mT(e) {
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
function gT(e) {
  const t = {}, n = s(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function yT(e, t) {
  const n = {}, r = s(e, ["apiKey"]);
  if (r != null && l(n, ["apiKey"], r), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function _T(e, t) {
  const n = {}, r = s(e, ["data"]);
  if (r != null && l(n, ["data"], r), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function vT(e, t) {
  const n = {}, r = s(e, ["content"]);
  r != null && l(n, ["content"], r);
  const o = s(e, ["citationMetadata"]);
  o != null && l(n, ["citationMetadata"], AT(o));
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
function AT(e, t) {
  const n = {}, r = s(e, ["citationSources"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(n, ["citations"], o);
  }
  return n;
}
function TT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let a = De(i);
    Array.isArray(a) && (a = a.map((u) => Vn(u))), l(r, ["contents"], a);
  }
  return r;
}
function ST(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["tokensInfo"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function ET(e, t) {
  const n = {}, r = s(e, ["values"]);
  r != null && l(n, ["values"], r);
  const o = s(e, ["statistics"]);
  return o != null && l(n, ["statistics"], CT(o)), n;
}
function CT(e, t) {
  const n = {}, r = s(e, ["truncated"]);
  r != null && l(n, ["truncated"], r);
  const o = s(e, ["token_count"]);
  return o != null && l(n, ["tokenCount"], o), n;
}
function eo(e, t) {
  const n = {}, r = s(e, ["parts"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => kS(a))), l(n, ["parts"], i);
  }
  const o = s(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function Vn(e, t) {
  const n = {}, r = s(e, ["parts"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => DS(a))), l(n, ["parts"], i);
  }
  const o = s(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function wT(e, t) {
  const n = {}, r = s(e, ["controlType"]);
  r != null && l(n, ["controlType"], r);
  const o = s(e, ["enableControlImageComputation"]);
  return o != null && l(n, ["computeControl"], o), n;
}
function IT(e, t) {
  const n = {};
  if (s(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (s(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (s(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function bT(e, t, n) {
  const r = {}, o = s(e, ["systemInstruction"]);
  t !== void 0 && o != null && l(t, ["systemInstruction"], Vn(Ae(o)));
  const i = s(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => Th(c))), l(t, ["tools"], u);
  }
  const a = s(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], _S(a)), r;
}
function PT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = De(i);
    Array.isArray(u) && (u = u.map((c) => eo(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && IT(a), r;
}
function RT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = De(i);
    Array.isArray(u) && (u = u.map((c) => Vn(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && bT(a, r), r;
}
function xT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["totalTokens"]);
  o != null && l(n, ["totalTokens"], o);
  const i = s(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function MT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["totalTokens"]);
  return o != null && l(n, ["totalTokens"], o), n;
}
function NT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function kT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function DT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function $T(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function LT(e, t, n) {
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
function UT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => qS(d))), l(r, ["instances[0]", "referenceImages"], c);
  }
  const u = s(t, ["config"]);
  return u != null && LT(u, r), r;
}
function FT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Ei(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function OT(e, t, n) {
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
function qT(e, t, n) {
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
function BT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let d = Ea(e, i);
    Array.isArray(d) && (d = d.map((h) => h)), l(r, ["requests[]", "content"], d);
  }
  const a = s(t, ["content"]);
  a != null && eo(Ae(a));
  const u = s(t, ["config"]);
  u != null && OT(u, r);
  const c = s(t, ["model"]);
  return c !== void 0 && l(r, ["requests[]", "model"], Y(e, c)), r;
}
function GT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  let i = s(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = s(t, ["contents"]);
    if (c != null) {
      let d = Ea(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(r, ["instances[]", "content"], d);
    }
  }
  let a = s(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = s(t, ["content"]);
    c != null && l(r, ["content"], Vn(Ae(c)));
  }
  const u = s(t, ["config"]);
  return u != null && qT(u, r, n), r;
}
function HT(e, t) {
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
function VT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions[]", "embeddings"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => ET(u))), l(n, ["embeddings"], a);
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
function JT(e, t) {
  const n = {}, r = s(e, ["endpoint"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["deployedModelId"]);
  return o != null && l(n, ["deployedModelId"], o), n;
}
function KT(e, t) {
  const n = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["fileUri"]);
  r != null && l(n, ["fileUri"], r);
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function WT(e, t) {
  const n = {}, r = s(e, ["id"]);
  r != null && l(n, ["id"], r);
  const o = s(e, ["args"]);
  o != null && l(n, ["args"], o);
  const i = s(e, ["name"]);
  if (i != null && l(n, ["name"], i), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function zT(e, t) {
  const n = {}, r = s(e, ["allowedFunctionNames"]);
  r != null && l(n, ["allowedFunctionNames"], r);
  const o = s(e, ["mode"]);
  if (o != null && l(n, ["mode"], o), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function YT(e, t) {
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
function XT(e, t, n, r) {
  const o = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], eo(Ae(i)));
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
  b != null && l(o, ["responseSchema"], Ca(b));
  const R = s(t, ["responseJsonSchema"]);
  if (R != null && l(o, ["responseJsonSchema"], R), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = s(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let X = P;
    Array.isArray(X) && (X = X.map((Te) => BS(Te))), l(n, ["safetySettings"], X);
  }
  const L = s(t, ["tools"]);
  if (n !== void 0 && L != null) {
    let X = Gn(L);
    Array.isArray(X) && (X = X.map((Te) => YS(Bn(Te)))), l(n, ["tools"], X);
  }
  const S = s(t, ["toolConfig"]);
  if (n !== void 0 && S != null && l(n, ["toolConfig"], WS(S)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const O = s(t, ["cachedContent"]);
  n !== void 0 && O != null && l(n, ["cachedContent"], It(e, O));
  const x = s(t, ["responseModalities"]);
  x != null && l(o, ["responseModalities"], x);
  const D = s(t, ["mediaResolution"]);
  D != null && l(o, ["mediaResolution"], D);
  const H = s(t, ["speechConfig"]);
  if (H != null && l(o, ["speechConfig"], wa(H)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const z = s(t, ["thinkingConfig"]);
  z != null && l(o, ["thinkingConfig"], z);
  const ge = s(t, ["imageConfig"]);
  ge != null && l(o, ["imageConfig"], ES(ge));
  const Q = s(t, ["enableEnhancedCivicAnswers"]);
  if (Q != null && l(o, ["enableEnhancedCivicAnswers"], Q), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const j = s(t, ["serviceTier"]);
  return n !== void 0 && j != null && l(n, ["serviceTier"], j), o;
}
function QT(e, t, n, r) {
  const o = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], Vn(Ae(i)));
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
  b != null && l(o, ["responseSchema"], Ca(b));
  const R = s(t, ["responseJsonSchema"]);
  R != null && l(o, ["responseJsonSchema"], R);
  const P = s(t, ["routingConfig"]);
  P != null && l(o, ["routingConfig"], P);
  const L = s(t, ["modelSelectionConfig"]);
  L != null && l(o, ["modelConfig"], L);
  const S = s(t, ["safetySettings"]);
  if (n !== void 0 && S != null) {
    let ie = S;
    Array.isArray(ie) && (ie = ie.map((dn) => dn)), l(n, ["safetySettings"], ie);
  }
  const O = s(t, ["tools"]);
  if (n !== void 0 && O != null) {
    let ie = Gn(O);
    Array.isArray(ie) && (ie = ie.map((dn) => Th(Bn(dn)))), l(n, ["tools"], ie);
  }
  const x = s(t, ["toolConfig"]);
  n !== void 0 && x != null && l(n, ["toolConfig"], zS(x));
  const D = s(t, ["labels"]);
  n !== void 0 && D != null && l(n, ["labels"], D);
  const H = s(t, ["cachedContent"]);
  n !== void 0 && H != null && l(n, ["cachedContent"], It(e, H));
  const z = s(t, ["responseModalities"]);
  z != null && l(o, ["responseModalities"], z);
  const ge = s(t, ["mediaResolution"]);
  ge != null && l(o, ["mediaResolution"], ge);
  const Q = s(t, ["speechConfig"]);
  Q != null && l(o, ["speechConfig"], wa(Q));
  const j = s(t, ["audioTimestamp"]);
  j != null && l(o, ["audioTimestamp"], j);
  const X = s(t, ["thinkingConfig"]);
  X != null && l(o, ["thinkingConfig"], X);
  const Te = s(t, ["imageConfig"]);
  if (Te != null && l(o, ["imageConfig"], CS(Te)), s(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const ze = s(t, ["modelArmorConfig"]);
  n !== void 0 && ze != null && l(n, ["modelArmorConfig"], ze);
  const ye = s(t, ["serviceTier"]);
  return n !== void 0 && ye != null && l(n, ["serviceTier"], ye), o;
}
function Ic(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = De(i);
    Array.isArray(u) && (u = u.map((c) => eo(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(r, ["generationConfig"], XT(e, a, r)), r;
}
function bc(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = De(i);
    Array.isArray(u) && (u = u.map((c) => Vn(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(r, ["generationConfig"], QT(e, a, r)), r;
}
function Pc(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["candidates"]);
  if (o != null) {
    let h = o;
    Array.isArray(h) && (h = h.map((f) => vT(f))), l(n, ["candidates"], h);
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
function Rc(e, t) {
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
function ZT(e, t, n) {
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
  const R = s(e, ["imageSize"]);
  t !== void 0 && R != null && l(t, ["parameters", "sampleImageSize"], R);
  const P = s(e, ["enhancePrompt"]);
  return t !== void 0 && P != null && l(t, ["parameters", "enhancePrompt"], P), r;
}
function eS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && ZT(a, r), r;
}
function tS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && jT(a, r), r;
}
function nS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => pS(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], vh(i)), n;
}
function rS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => Ei(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Ah(i)), n;
}
function oS(e, t, n) {
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
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Ci(f));
  const p = s(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let y = p;
    Array.isArray(y) && (y = y.map((_) => lE(_))), l(t, ["instances[0]", "referenceImages"], y);
  }
  if (s(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (s(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = s(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), r;
}
function iS(e, t, n) {
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
  t !== void 0 && v != null && l(t, ["instances[0]", "lastFrame"], ct(v));
  const E = s(e, ["referenceImages"]);
  if (t !== void 0 && E != null) {
    let L = E;
    Array.isArray(L) && (L = L.map((S) => uE(S))), l(t, ["instances[0]", "referenceImages"], L);
  }
  const b = s(e, ["mask"]);
  t !== void 0 && b != null && l(t, ["instances[0]", "mask"], aE(b));
  const R = s(e, ["compressionQuality"]);
  t !== void 0 && R != null && l(t, ["parameters", "compressionQuality"], R);
  const P = s(e, ["labels"]);
  if (t !== void 0 && P != null && l(t, ["labels"], P), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return r;
}
function sS(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], cS(u)), n;
}
function aS(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response"]);
  return u != null && l(n, ["response"], dS(u)), n;
}
function lS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], Ci(a));
  const u = s(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], Sh(u));
  const c = s(t, ["source"]);
  c != null && fS(c, r);
  const d = s(t, ["config"]);
  return d != null && oS(d, r), r;
}
function uS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], ct(a));
  const u = s(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], Eh(u));
  const c = s(t, ["source"]);
  c != null && hS(c, r);
  const d = s(t, ["config"]);
  return d != null && iS(d, r), r;
}
function cS(e, t) {
  const n = {}, r = s(e, ["generatedSamples"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => gS(u))), l(n, ["generatedVideos"], a);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function dS(e, t) {
  const n = {}, r = s(e, ["videos"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => yS(u))), l(n, ["generatedVideos"], a);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function fS(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Ci(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Sh(a)), r;
}
function hS(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], ct(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Eh(a)), r;
}
function pS(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["image"], wS(r));
  const o = s(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const i = s(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], vh(i)), n;
}
function Ei(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["image"], _h(r));
  const o = s(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const i = s(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], Ah(i));
  const a = s(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function mS(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["mask"], _h(r));
  const o = s(e, ["labels"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["labels"], i);
  }
  return n;
}
function gS(e, t) {
  const n = {}, r = s(e, ["video"]);
  return r != null && l(n, ["video"], iE(r)), n;
}
function yS(e, t) {
  const n = {}, r = s(e, ["_self"]);
  return r != null && l(n, ["video"], sE(r)), n;
}
function _S(e, t) {
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
function vS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function AS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], Y(e, o)), r;
}
function TS(e, t) {
  const n = {}, r = s(e, ["authConfig"]);
  r != null && l(n, ["authConfig"], yT(r));
  const o = s(e, ["enableWidget"]);
  return o != null && l(n, ["enableWidget"], o), n;
}
function SS(e, t) {
  const n = {}, r = s(e, ["searchTypes"]);
  if (r != null && l(n, ["searchTypes"], r), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(n, ["timeRangeFilter"], o), n;
}
function ES(e, t) {
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
function CS(e, t) {
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
function wS(e, t) {
  const n = {}, r = s(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], Bt(r));
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function _h(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], Bt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Ci(e, t) {
  const n = {};
  if (s(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const r = s(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], Bt(r));
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function ct(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Bt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function IS(e, t, n, r) {
  const o = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], uh(e, c)), o;
}
function bS(e, t, n, r) {
  const o = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], uh(e, c)), o;
}
function PS(e, t, n) {
  const r = {}, o = s(t, ["config"]);
  return o != null && IS(e, o, r), r;
}
function RS(e, t, n) {
  const r = {}, o = s(t, ["config"]);
  return o != null && bS(e, o, r), r;
}
function xS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = ch(i);
    Array.isArray(a) && (a = a.map((u) => xs(u))), l(n, ["models"], a);
  }
  return n;
}
function MS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = ch(i);
    Array.isArray(a) && (a = a.map((u) => Ms(u))), l(n, ["models"], a);
  }
  return n;
}
function NS(e, t) {
  const n = {}, r = s(e, ["maskMode"]);
  r != null && l(n, ["maskMode"], r);
  const o = s(e, ["segmentationClasses"]);
  o != null && l(n, ["maskClasses"], o);
  const i = s(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function xs(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const i = s(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = s(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = s(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], XS(u));
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
function Ms(e, t) {
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
    Array.isArray(p) && (p = p.map((m) => JT(m))), l(n, ["endpoints"], p);
  }
  const c = s(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = s(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], QS(d));
  const h = s(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = s(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function kS(e, t) {
  const n = {}, r = s(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const i = s(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = s(e, ["fileData"]);
  a != null && l(n, ["fileData"], KT(a));
  const u = s(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], WT(u));
  const c = s(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = s(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], _T(d));
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
function DS(e, t) {
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
function $S(e, t) {
  const n = {}, r = s(e, ["productImage"]);
  return r != null && l(n, ["image"], ct(r)), n;
}
function LS(e, t, n) {
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
function US(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["source"]);
  i != null && OS(i, r);
  const a = s(t, ["config"]);
  return a != null && LS(a, r), r;
}
function FS(e, t) {
  const n = {}, r = s(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => Ei(i))), l(n, ["generatedImages"], o);
  }
  return n;
}
function OS(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], ct(i));
  const a = s(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => $S(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return r;
}
function qS(e, t) {
  const n = {}, r = s(e, ["referenceImage"]);
  r != null && l(n, ["referenceImage"], ct(r));
  const o = s(e, ["referenceId"]);
  o != null && l(n, ["referenceId"], o);
  const i = s(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const a = s(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], NS(a));
  const u = s(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], wT(u));
  const c = s(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = s(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function vh(e, t) {
  const n = {}, r = s(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = s(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function Ah(e, t) {
  const n = {}, r = s(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = s(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function BS(e, t) {
  const n = {}, r = s(e, ["category"]);
  if (r != null && l(n, ["category"], r), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(n, ["threshold"], o), n;
}
function GS(e, t) {
  const n = {}, r = s(e, ["image"]);
  return r != null && l(n, ["image"], ct(r)), n;
}
function HS(e, t, n) {
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
function VS(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["source"]);
  i != null && KS(i, r);
  const a = s(t, ["config"]);
  return a != null && HS(a, r), r;
}
function JS(e, t) {
  const n = {}, r = s(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => mS(i))), l(n, ["generatedMasks"], o);
  }
  return n;
}
function KS(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], ct(i));
  const a = s(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], GS(a)), r;
}
function WS(e, t) {
  const n = {}, r = s(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = s(e, ["functionCallingConfig"]);
  o != null && l(n, ["functionCallingConfig"], zT(o));
  const i = s(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function zS(e, t) {
  const n = {}, r = s(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = s(e, ["functionCallingConfig"]);
  if (o != null && l(n, ["functionCallingConfig"], o), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function YS(e, t) {
  const n = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const r = s(e, ["computerUse"]);
  r != null && l(n, ["computerUse"], r);
  const o = s(e, ["fileSearch"]);
  o != null && l(n, ["fileSearch"], o);
  const i = s(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], SS(i));
  const a = s(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], TS(a));
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
function Th(e, t) {
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
    Array.isArray(m) && (m = m.map((y) => YT(y))), l(n, ["functionDeclarations"], m);
  }
  const h = s(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = s(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = s(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function XS(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function QS(e, t) {
  const n = {}, r = s(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function ZS(e, t, n) {
  const r = {}, o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function jS(e, t, n) {
  const r = {}, o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function eE(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "name"], Y(e, o));
  const i = s(t, ["config"]);
  return i != null && ZS(i, r), r;
}
function tE(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["config"]);
  return i != null && jS(i, r), r;
}
function nE(e, t, n) {
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
function rE(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], Y(e, o));
  const i = s(t, ["image"]);
  i != null && l(r, ["instances[0]", "image"], ct(i));
  const a = s(t, ["upscaleFactor"]);
  a != null && l(r, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = s(t, ["config"]);
  return u != null && nE(u, r), r;
}
function oE(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Ei(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function iE(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["encodedVideo"]);
  o != null && l(n, ["videoBytes"], Bt(o));
  const i = s(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function sE(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["videoBytes"], Bt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function aE(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["_self"], ct(r));
  const o = s(e, ["maskMode"]);
  return o != null && l(n, ["maskMode"], o), n;
}
function lE(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["image"], Ci(r));
  const o = s(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function uE(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["image"], ct(r));
  const o = s(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function Sh(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["videoBytes"]);
  o != null && l(n, ["encodedVideo"], Bt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function Eh(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["videoBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Bt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function cE(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["displayName"], r), n;
}
function dE(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && cE(n, t), t;
}
function fE(e, t) {
  const n = {}, r = s(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function hE(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = s(e, ["config"]);
  return r != null && fE(r, t), t;
}
function pE(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function mE(e, t) {
  const n = {}, r = s(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["customMetadata"], i);
  }
  const o = s(e, ["chunkingConfig"]);
  return t !== void 0 && o != null && l(t, ["chunkingConfig"], o), n;
}
function gE(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], _E(a)), t;
}
function yE(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = s(e, ["fileName"]);
  r != null && l(t, ["fileName"], r);
  const o = s(e, ["config"]);
  return o != null && mE(o, t), t;
}
function _E(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function vE(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function AE(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && vE(n, t), t;
}
function TE(e) {
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
function Ch(e, t) {
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
function SE(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = s(e, ["config"]);
  return r != null && Ch(r, t), t;
}
function EE(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var CE = "Content-Type", wE = "X-Server-Timeout", IE = "User-Agent", Ns = "x-goog-api-client", bE = "google-genai-sdk/1.50.1", PE = "v1beta1", RE = "v1beta", xE = /* @__PURE__ */ new Set(["us", "eu"]), ME = 5, NE = [
  408,
  429,
  500,
  502,
  503,
  504
], kE = class {
  constructor(e) {
    var t, n, r;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const o = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (o.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? o.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && xE.has(this.clientOptions.location) ? o.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (o.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), o.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : PE;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), o.apiVersion = (r = this.clientOptions.apiVersion) !== null && r !== void 0 ? r : RE, o.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === Is.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
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
    return t && t.extraBody !== null && DE(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await xc(r), new bs(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await xc(r), this.processStreamResponse(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  processStreamResponse(e) {
    return lt(this, arguments, function* () {
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
          const { done: c, value: d } = yield K(r.read());
          if (c) {
            if (i.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const h = o.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(h);
            if ("error" in m) {
              const y = JSON.parse(JSON.stringify(m.error)), _ = y.status, v = y.code, E = `got status: ${_}. ${JSON.stringify(m)}`;
              if (v >= 400 && v < 600) throw new gh({
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
                yield yield K(new bs(new Response(_, {
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
      throw NE.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new nu.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, nu.default)(o, { retries: ((n = r.attempts) !== null && n !== void 0 ? n : ME) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = bE + " " + this.clientOptions.userAgentExtra;
    return e[IE] = t, e[Ns] = t, e[CE] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [r, o] of Object.entries(e.headers)) n.append(r, o);
      e.timeout && e.timeout > 0 && n.append(wE, String(Math.ceil(e.timeout / 1e3)));
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
    n != null && Ch(n, h);
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
    throw n >= 400 && n < 600 ? new gh({
      message: o,
      status: n
    }) : new Error(o);
  }
}
function DE(e, t) {
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
var $E = "mcp_used/unknown", LE = !1;
function wh(e) {
  for (const t of e)
    if (UE(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return LE;
}
function Ih(e) {
  var t;
  e[Ns] = (((t = e[Ns]) !== null && t !== void 0 ? t : "") + ` ${$E}`).trimStart();
}
function UE(e) {
  return e !== null && typeof e == "object" && e instanceof OE;
}
function FE(e) {
  return lt(this, arguments, function* (n, r = 100) {
    let o, i = 0;
    for (; i < r; ) {
      const a = yield K(n.listTools({ cursor: o }));
      for (const u of a.tools)
        yield yield K(u), i++;
      if (!a.nextCursor) break;
      o = a.nextCursor;
    }
  });
}
var OE = class bh {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new bh(t, n);
  }
  async initialize() {
    var t, n, r, o;
    if (this.mcpTools.length > 0) return;
    const i = {}, a = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, ut(FE(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
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
    return await this.initialize(), j_(this.mcpTools, this.config);
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
async function qE(e, t, n) {
  const r = new V_();
  let o;
  n.data instanceof Blob ? o = JSON.parse(await n.data.text()) : o = JSON.parse(n.data), Object.assign(r, o), t(r);
}
var BE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), o = this.apiClient.getApiVersion(), i = VE(this.apiClient.getDefaultHeaders()), a = `${r}/ws/google.ai.generativelanguage.${o}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        qE(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(a, HE(i), p);
    m.connect(), await c;
    const y = { setup: { model: Y(this.apiClient, e.model) } };
    return m.send(JSON.stringify(y)), new GE(m, this.apiClient);
  }
}, GE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = iT(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = oT(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(Rn.PLAY);
  }
  pause() {
    this.sendPlaybackControl(Rn.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(Rn.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(Rn.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function HE(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function VE(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var JE = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function KE(e, t, n) {
  const r = new H_();
  let o;
  n.data instanceof Blob ? o = await n.data.text() : n.data instanceof ArrayBuffer ? o = new TextDecoder().decode(n.data) : o = n.data;
  const i = JSON.parse(o);
  if (e.isVertexAI()) {
    const a = lT(i);
    Object.assign(r, a);
  } else Object.assign(r, i);
  t(r);
}
var WE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new BE(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, r, o, i, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && wh(e.config.tools) && Ih(h);
    const f = QE(h);
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
        KE(v, y.onmessage, x);
      },
      onerror: (t = y?.onerror) !== null && t !== void 0 ? t : function(x) {
      },
      onclose: (n = y?.onclose) !== null && n !== void 0 ? n : function(x) {
      }
    }, b = this.webSocketFactory.create(d, XE(f), E);
    b.connect(), await m;
    let R = Y(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && R.startsWith("publishers/")) {
      const x = this.apiClient.getProject(), D = this.apiClient.getLocation();
      x && D && (R = `projects/${x}/locations/${D}/` + R);
    }
    let P = {};
    this.apiClient.isVertexAI() && ((r = e.config) === null || r === void 0 ? void 0 : r.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [ei.AUDIO] } : e.config.responseModalities = [ei.AUDIO]), !((o = e.config) === null || o === void 0) && o.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
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
    return this.apiClient.isVertexAI() ? P = rT(this.apiClient, O) : P = nT(this.apiClient, O), delete P.config, b.send(JSON.stringify(P)), new YE(b, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, zE = { turnComplete: !0 }, YE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = De(t.turns), e.isVertexAI() || (n = n.map((r) => eo(r)));
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
      if (!e.isVertexAI() && !("id" in r)) throw new Error(JE);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, zE), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: aT(e) } : t = { realtimeInput: sT(e) }, this.conn.send(JSON.stringify(t));
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
function XE(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function QE(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var Mc = 10;
function Nc(e) {
  var t, n, r;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let o = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (Ln(a)) {
    o = !0;
    break;
  }
  if (!o) return !0;
  const i = (r = e?.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function Ln(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function ZE(e) {
  var t, n, r;
  return (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((o) => Ln(o))) !== null && r !== void 0 ? r : !1;
}
function kc(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((r, o) => {
    if (Ln(r)) return;
    const i = r;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(o);
  }), n;
}
function Dc(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var jE = class extends wt {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = De(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = De(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const r = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: ti.EMBED_CONTENT
        });
        return await this.embedContentInternal(r);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: ti.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, r, o, i, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !ZE(t) || Nc(t.config)) return await this.generateContentInternal(u);
      const c = kc(t);
      if (c.length > 0) {
        const y = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${y}.`);
      }
      let d, h;
      const f = De(u.contents), p = (o = (r = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && o !== void 0 ? o : Mc;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const y = d.candidates[0].content, _ = [];
        for (const v of (a = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : []) if (Ln(v)) {
          const E = await v.callTool(d.functionCalls);
          _.push(...E);
        }
        m++, h = {
          role: "user",
          parts: _
        }, u.contents = De(u.contents), u.contents.push(y), u.contents.push(h), Dc(u.config) && (f.push(y), f.push(h));
      }
      return Dc(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, r, o, i, a;
      if (this.maybeMoveToResponseJsonSchem(t), Nc(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = kc(t);
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
      return new cn(Ct.PAGED_ITEM_MODELS, (o) => this.listInternal(o), await this.listInternal(r), r);
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
    const i = await Promise.all(o.map(async (u) => Ln(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (a.config.tools = i, e.config && e.config.tools && wh(e.config.tools)) {
      const u = (r = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && r !== void 0 ? r : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), Ih(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, r;
    const o = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (Ln(i)) {
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
    const o = (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && r !== void 0 ? r : Mc;
    let i = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return lt(this, arguments, function* () {
        for (var f, p, m, y, _, v; a < o; ) {
          i && (a++, i = !1);
          const P = yield K(c.processParamsMaybeAddMcpUsage(h)), L = yield K(c.generateContentStreamInternal(P)), S = [], O = [];
          try {
            for (var E = !0, b = (p = void 0, ut(L)), R; R = yield K(b.next()), f = R.done, !f; E = !0) {
              y = R.value, E = !1;
              const x = y;
              if (yield yield K(x), x.candidates && (!((_ = x.candidates[0]) === null || _ === void 0) && _.content)) {
                O.push(x.candidates[0].content);
                for (const D of (v = x.candidates[0].content.parts) !== null && v !== void 0 ? v : []) if (a < o && D.functionCall) {
                  if (!D.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(D.functionCall.name)) {
                    const H = yield K(d.get(D.functionCall.name).callTool([D.functionCall]));
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
              !E && !f && (m = b.return) && (yield K(m.call(b)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (S.length > 0) {
            i = !0;
            const x = new dr();
            x.candidates = [{ content: {
              role: "user",
              parts: S
            } }], yield yield K(x);
            const D = [];
            D.push(...O), D.push({
              role: "user",
              parts: S
            }), h.contents = De(h.contents).concat(D);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = bc(this.apiClient, e);
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
        const h = Rc(d), f = new dr();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Ic(this.apiClient, e);
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
        const h = Pc(d), f = new dr();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = bc(this.apiClient, e);
      return a = $("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return lt(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var y = !0, _ = ut(d), v; v = yield K(_.next()), h = v.done, !h; y = !0) {
              m = v.value, y = !1;
              const E = m, b = Rc(yield K(E.json()), e);
              b.sdkHttpResponse = { headers: E.headers };
              const R = new dr();
              Object.assign(R, b), yield yield K(R);
            }
          } catch (E) {
            f = { error: E };
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
      return a = $("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }), i.then(function(d) {
        return lt(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var y = !0, _ = ut(d), v; v = yield K(_.next()), h = v.done, !h; y = !0) {
              m = v.value, y = !1;
              const E = m, b = Pc(yield K(E.json()), e);
              b.sdkHttpResponse = { headers: E.headers };
              const R = new dr();
              Object.assign(R, b), yield yield K(R);
            }
          } catch (E) {
            f = { error: E };
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
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = GT(this.apiClient, e, e);
      return a = $(tv(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = VT(d, e), f = new sc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = BT(this.apiClient, e);
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
        const h = HT(d), f = new sc();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = tS(this.apiClient, e);
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
        const h = rS(d), f = new ac();
        return Object.assign(f, h), f;
      });
    } else {
      const c = eS(this.apiClient, e);
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
        const h = nS(d), f = new ac();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = UT(this.apiClient, e);
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
        const c = FT(u), d = new x_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = rE(this.apiClient, e);
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
        const c = oE(u), d = new M_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = US(this.apiClient, e);
      return o = $("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = FS(u), d = new N_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = VS(this.apiClient, e);
      return o = $("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = JS(u), d = new k_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = AS(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ms(d));
    } else {
      const c = vS(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => xs(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = RS(this.apiClient, e);
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
        const h = MS(d), f = new lc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = PS(this.apiClient, e);
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
        const h = xS(d), f = new lc();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = tE(this.apiClient, e);
      return a = $("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ms(d));
    } else {
      const c = eE(this.apiClient, e);
      return a = $("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => xs(d));
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = kT(this.apiClient, e);
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
        const h = $T(d), f = new uc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = NT(this.apiClient, e);
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
        const h = DT(d), f = new uc();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = RT(this.apiClient, e);
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
        const h = MT(d), f = new cc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = PT(this.apiClient, e);
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
        const h = xT(d), f = new cc();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = TT(this.apiClient, e);
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
        const c = ST(u), d = new D_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = uS(this.apiClient, e);
      return a = $("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = aS(d), f = new dc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = lS(this.apiClient, e);
      return a = $("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = sS(d), f = new dc();
        return Object.assign(f, h), f;
      });
    }
  }
}, eC = class extends wt {
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
      const c = C_(e);
      return a = $("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = E_(e);
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
      const a = g_(e);
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
function $c(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function tC(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function nC(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function rC(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => fC(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function oC(e, t, n) {
  const r = {}, o = s(t, ["expireTime"]);
  n !== void 0 && o != null && l(n, ["expireTime"], o);
  const i = s(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const a = s(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = s(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], dC(e, u));
  const c = s(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), r;
}
function iC(e, t) {
  const n = {}, r = s(t, ["config"]);
  return r != null && l(n, ["config"], oC(e, r, n)), n;
}
function sC(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function aC(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function lC(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], tC(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function uC(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function cC(e, t) {
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
  ], Ia(f));
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
  t !== void 0 && y != null && l(t, ["setup", "systemInstruction"], rC(Ae(y)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = Gn(_);
    Array.isArray(x) && (x = x.map((D) => mC(Bn(D)))), l(t, ["setup", "tools"], x);
  }
  const v = s(e, ["sessionResumption"]);
  t !== void 0 && v != null && l(t, ["setup", "sessionResumption"], pC(v));
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], $c(E));
  const b = s(e, ["outputAudioTranscription"]);
  t !== void 0 && b != null && l(t, ["setup", "outputAudioTranscription"], $c(b));
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
    Array.isArray(x) && (x = x.map((D) => hC(D))), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function dC(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], Y(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], cC(o, n)), n;
}
function fC(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], sC(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], aC(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], nC(c));
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
function hC(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function pC(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function mC(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], uC(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], lC(i));
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
function gC(e) {
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
function yC(e, t) {
  let n = null;
  const r = e.bidiGenerateContentSetup;
  if (typeof r == "object" && r !== null && "setup" in r) {
    const i = r.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else r !== void 0 && delete e.bidiGenerateContentSetup;
  const o = e.fieldMask;
  if (n) {
    const i = gC(n);
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
var _C = class extends wt {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = iC(this.apiClient, e);
      o = $("auth_tokens", a._url), i = a._query, delete a.config, delete a._url, delete a._query;
      const u = yC(a, e.config);
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
function vC(e, t) {
  const n = {}, r = s(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function AC(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = s(e, ["config"]);
  return r != null && vC(r, t), t;
}
function TC(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function SC(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function EC(e) {
  const t = {}, n = s(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const r = s(e, ["config"]);
  return r != null && SC(r, t), t;
}
function CC(e) {
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
var wC = class extends wt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new cn(Ct.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = TC(e);
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
      const i = AC(e);
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
      const a = EC(e);
      return o = $("{parent}/documents", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = CC(u), d = new $_();
        return Object.assign(d, c), d;
      });
    }
  }
}, IC = class extends wt {
  constructor(e, t = new wC(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new cn(Ct.PAGED_ITEM_FILE_SEARCH_STORES, (r) => this.listInternal(r), await this.listInternal(n), n);
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
      const a = dE(e);
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
      const a = pE(e);
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
      const i = hE(e);
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
      const a = AE(e);
      return o = $("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = TE(u), d = new L_();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = SE(e);
      return o = $("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = EE(u), d = new U_();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = yE(e);
      return o = $("{file_search_store_name}:importFile", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = gE(u), d = new F_();
        return Object.assign(d, c), d;
      });
    }
  }
}, Ph = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Ph = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
}, bC = () => Ph();
function ks(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ds = (e) => {
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
}, je = class extends Error {
}, tt = class $s extends je {
  constructor(t, n, r, o) {
    super(`${$s.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.error = n;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new wi({
      message: r,
      cause: Ds(n)
    });
    const i = n;
    return t === 400 ? new xh(t, i, r, o) : t === 401 ? new Mh(t, i, r, o) : t === 403 ? new Nh(t, i, r, o) : t === 404 ? new kh(t, i, r, o) : t === 409 ? new Dh(t, i, r, o) : t === 422 ? new $h(t, i, r, o) : t === 429 ? new Lh(t, i, r, o) : t >= 500 ? new Uh(t, i, r, o) : new $s(t, i, r, o);
  }
}, Ls = class extends tt {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, wi = class extends tt {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Rh = class extends wi {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, xh = class extends tt {
}, Mh = class extends tt {
}, Nh = class extends tt {
}, kh = class extends tt {
}, Dh = class extends tt {
}, $h = class extends tt {
}, Lh = class extends tt {
}, Uh = class extends tt {
}, PC = /^[a-z][a-z0-9+.-]*:/i, RC = (e) => PC.test(e), Us = (e) => (Us = Array.isArray, Us(e)), Lc = Us;
function Uc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function xC(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var MC = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new je(`${e} must be an integer`);
  if (t < 0) throw new je(`${e} must be a positive integer`);
  return t;
}, NC = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, kC = (e) => new Promise((t) => setTimeout(t, e));
function DC() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Fh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function $C(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Fh({
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
function Oh(e) {
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
async function LC(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const r = e.getReader(), o = r.cancel();
  r.releaseLock(), await o;
}
var UC = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function FC(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new je(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var OC = "0.0.1", qh = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Zi(e, t, n) {
  return qh(), new File(e, t ?? "unknown_file", n);
}
function qC(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var BC = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Bh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", GC = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Bh(e), HC = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function VC(e, t, n) {
  if (qh(), e = await e, GC(e))
    return e instanceof File ? e : Zi([await e.arrayBuffer()], e.name);
  if (HC(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Zi(await Fs(o), t, n);
  }
  const r = await Fs(e);
  if (t || (t = qC(e)), !n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = Object.assign(Object.assign({}, n), { type: o }));
  }
  return Zi(r, t, n);
}
async function Fs(e) {
  var t, n, r, o, i;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (Bh(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (BC(e)) try {
    for (var u = !0, c = ut(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      o = d.value, u = !1;
      const h = o;
      a.push(...await Fs(h));
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
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${JC(e)}`);
  }
  return a;
}
function JC(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ba = class {
  constructor(e) {
    this._client = e;
  }
};
ba._key = [];
function Gh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Fc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), KC = (e = Gh) => (function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    var m, y, _;
    /[?#]/.test(f) && (o = !0);
    const v = r[p];
    let E = (o ? encodeURIComponent : e)("" + v);
    return p !== r.length && (v == null || typeof v == "object" && v.toString === ((_ = Object.getPrototypeOf((y = Object.getPrototypeOf((m = v.hasOwnProperty) !== null && m !== void 0 ? m : Fc)) !== null && y !== void 0 ? y : Fc)) === null || _ === void 0 ? void 0 : _.toString)) && (E = v + "", i.push({
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
    throw new je(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), ot = /* @__PURE__ */ KC(Gh), Hh = class extends ba {
  create(e, t) {
    var n;
    const { api_version: r = this._client.apiVersion } = e, o = Ft(e, ["api_version"]);
    if ("model" in o && "agent_config" in o) throw new je("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in o && "generation_config" in o) throw new je("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(ot`/${r}/interactions`, Object.assign(Object.assign({ body: o }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(ot`/${r}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.post(ot`/${r}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var r;
    const o = t ?? {}, { api_version: i = this._client.apiVersion } = o, a = Ft(o, ["api_version"]);
    return this._client.get(ot`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (r = t?.stream) !== null && r !== void 0 ? r : !1 }));
  }
};
Hh._key = Object.freeze(["interactions"]);
var Vh = class extends Hh {
}, Jh = class extends ba {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: r } = e, o = Ft(e, ["api_version", "webhook_id"]);
    return this._client.post(ot`/${n}/webhooks`, Object.assign({
      query: { webhook_id: r },
      body: o
    }, t));
  }
  update(e, t, n) {
    const { api_version: r = this._client.apiVersion, update_mask: o } = t, i = Ft(t, ["api_version", "update_mask"]);
    return this._client.patch(ot`/${r}/webhooks/${e}`, Object.assign({
      query: { update_mask: o },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: r = this._client.apiVersion } = n, o = Ft(n, ["api_version"]);
    return this._client.get(ot`/${r}/webhooks`, Object.assign({ query: o }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete(ot`/${r}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.get(ot`/${r}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: r = this._client.apiVersion, body: o } = t ?? {};
    return this._client.post(ot`/${r}/webhooks/${e}:ping`, Object.assign({ body: o }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const r = t ?? {}, { api_version: o = this._client.apiVersion } = r, i = Ft(r, ["api_version"]);
    return this._client.post(ot`/${o}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
Jh._key = Object.freeze(["webhooks"]);
var Kh = class extends Jh {
};
function WC(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var Io;
function Pa(e) {
  let t;
  return (Io ?? (t = new globalThis.TextEncoder(), Io = t.encode.bind(t)))(e);
}
var bo;
function Oc(e) {
  let t;
  return (bo ?? (t = new globalThis.TextDecoder(), bo = t.decode.bind(t)))(e);
}
var Ii = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Pa(e) : e;
    this.buffer = WC([this.buffer, n]);
    const r = [];
    let o;
    for (; (o = zC(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (o.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = o.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (o.index !== this.carriageReturnIndex + 1 || o.carriage)) {
        r.push(Oc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? o.preceding - 1 : o.preceding, a = Oc(this.buffer.subarray(0, i));
      r.push(a), this.buffer = this.buffer.subarray(o.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), r;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Ii.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Ii.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function zC(e, t) {
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
var ri = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, qc = (e, t, n) => {
  if (e) {
    if (xC(ri, e)) return e;
    Re(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(ri))}`);
  }
};
function vr() {
}
function Po(e, t, n) {
  return !t || ri[e] > ri[n] ? vr : t[e].bind(t);
}
var YC = {
  error: vr,
  warn: vr,
  info: vr,
  debug: vr
}, Bc = /* @__PURE__ */ new WeakMap();
function Re(e) {
  var t;
  const n = e.logger, r = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return YC;
  const o = Bc.get(n);
  if (o && o[0] === r) return o[1];
  const i = {
    error: Po("error", n, r),
    warn: Po("warn", n, r),
    info: Po("info", n, r),
    debug: Po("debug", n, r)
  };
  return Bc.set(n, [r, i]), i;
}
var Xt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), XC = class Ar {
  constructor(t, n, r) {
    this.iterator = t, this.controller = n, this.client = r;
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const i = r ? Re(r) : console;
    function a() {
      return lt(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new je("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, y = ut(QC(t, n)), _; _ = yield K(y.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const v = f;
              if (!p)
                if (v.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield K(JSON.parse(v.data));
                } catch (E) {
                  throw i.error("Could not parse message into JSON:", v.data), i.error("From chunk:", v.raw), E;
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
          if (ks(v)) return yield K(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Ar(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    function i() {
      return lt(this, arguments, function* () {
        var c, d, h, f;
        const p = new Ii(), m = Oh(t);
        try {
          for (var y = !0, _ = ut(m), v; v = yield K(_.next()), c = v.done, !c; y = !0) {
            f = v.value, y = !1;
            const E = f;
            for (const b of p.decode(E)) yield yield K(b);
          }
        } catch (E) {
          d = { error: E };
        } finally {
          try {
            !y && !c && (h = _.return) && (yield K(h.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const E of p.flush()) yield yield K(E);
      });
    }
    function a() {
      return lt(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new je("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, y = ut(i()), _; _ = yield K(y.next()), c = _.done, !c; m = !0) {
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
          if (ks(v)) return yield K(void 0);
          throw v;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Ar(a, n, r);
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
    return [new Ar(() => o(t), this.controller, this.client), new Ar(() => o(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Fh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = Pa(JSON.stringify(o) + `
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
function QC(e, t) {
  return lt(this, arguments, function* () {
    var r, o, i, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new je("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new je("Attempted to iterate over a response with no body");
    const u = new jC(), c = new Ii(), d = Oh(e.body);
    try {
      for (var h = !0, f = ut(ZC(d)), p; p = yield K(f.next()), r = p.done, !r; h = !0) {
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
        !h && !r && (i = f.return) && (yield K(i.call(f)));
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
function ZC(e) {
  return lt(this, arguments, function* () {
    var n, r, o, i;
    try {
      for (var a = !0, u = ut(e), c; c = yield K(u.next()), n = c.done, !n; a = !0) {
        i = c.value, a = !1;
        const d = i;
        d != null && (yield yield K(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? Pa(d) : d));
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
var jC = class {
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
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return Re(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : XC.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return Re(e).debug(`[${r}] response parsed`, Xt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
var nw = class Wh extends Promise {
  constructor(t, n, r = tw) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, this.client = t;
  }
  _thenUnwrap(t) {
    return new Wh(this.client, this.responsePromise, async (n, r) => t(await this.parseResponse(n, r), r));
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
}, zh = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* rw(e) {
  if (!e) return;
  if (zh in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Lc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = Lc(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var fr = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of rw(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [zh]: !0,
    values: t,
    nulls: n
  };
}, ji = (e) => {
  var t, n, r, o, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (o = (r = globalThis.Deno.env) === null || r === void 0 ? void 0 : r.get) === null || o === void 0 ? void 0 : o.call(r, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, Yh, Xh = class Qh {
  constructor(t) {
    var n, r, o, i, a, u, c, { baseURL: d = ji("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = ji("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = Ft(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (r = m.timeout) !== null && r !== void 0 ? r : Qh.DEFAULT_TIMEOUT, this.logger = (o = m.logger) !== null && o !== void 0 ? o : console;
    const y = "warn";
    this.logLevel = y, this.logLevel = (a = (i = qc(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : qc(ji("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : y, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : DC(), this.encoder = UC, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = fr([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return fr([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return fr([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return FC(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${OC}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${bC()}`;
  }
  makeStatusError(t, n, r, o) {
    return tt.generate(t, n, r, o);
  }
  buildURL(t, n, r) {
    const o = !this.baseURLOverridden() && r || this.baseURL, i = RC(t) ? new URL(t) : new URL(o + (o.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!Uc(a) || !Uc(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    var o, i, a;
    const u = await t, c = (o = u.maxRetries) !== null && o !== void 0 ? o : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: h, timeout: f } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: h,
      options: u
    });
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = r === void 0 ? "" : `, retryOf: ${r}`, y = Date.now();
    if (Re(this).debug(`[${p}] sending request`, Xt({
      retryOfRequestLogID: r,
      method: u.method,
      url: h,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new Ls();
    const _ = new AbortController(), v = await this.fetchWithTimeout(h, d, f, _).catch(Ds), E = Date.now();
    if (v instanceof globalThis.Error) {
      const R = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new Ls();
      const P = ks(v) || /timed? ?out/i.test(String(v) + ("cause" in v ? String(v.cause) : ""));
      if (n)
        return Re(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - ${R}`), Re(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (${R})`, Xt({
          retryOfRequestLogID: r,
          url: h,
          durationMs: E - y,
          message: v.message
        })), this.retryRequest(u, n, r ?? p);
      throw Re(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - error; no more retries left`), Re(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (error; no more retries left)`, Xt({
        retryOfRequestLogID: r,
        url: h,
        durationMs: E - y,
        message: v.message
      })), P ? new Rh() : new wi({ cause: v });
    }
    const b = `[${p}${m}] ${d.method} ${h} ${v.ok ? "succeeded" : "failed"} with status ${v.status} in ${E - y}ms`;
    if (!v.ok) {
      const R = await this.shouldRetry(v);
      if (n && R) {
        const x = `retrying, ${n} attempts remaining`;
        return await LC(v.body), Re(this).info(`${b} - ${x}`), Re(this).debug(`[${p}] response error (${x})`, Xt({
          retryOfRequestLogID: r,
          url: v.url,
          status: v.status,
          headers: v.headers,
          durationMs: E - y
        })), this.retryRequest(u, n, r ?? p, v.headers);
      }
      const P = R ? "error; no more retries left" : "error; not retryable";
      Re(this).info(`${b} - ${P}`);
      const L = await v.text().catch((x) => Ds(x).message), S = NC(L), O = S ? void 0 : L;
      throw Re(this).debug(`[${p}] response error (${P})`, Xt({
        retryOfRequestLogID: r,
        url: v.url,
        status: v.status,
        headers: v.headers,
        message: O,
        durationMs: Date.now() - y
      })), this.makeStatusError(v.status, S, O, v.headers);
    }
    return Re(this).info(b), Re(this).debug(`[${p}] response start`, Xt({
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
    const i = n || {}, { signal: a, method: u } = i, c = Ft(i, ["signal", "method"]), d = this._makeAbort(o);
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
    return await kC(a), this.makeRequest(t, n - 1, r);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var r, o, i;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = a, f = this.buildURL(c, d, h);
    "timeout" in a && MC("timeout", a.timeout), a.timeout = (r = a.timeout) !== null && r !== void 0 ? r : this.timeout;
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
    let u = fr([
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
    const r = fr([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: $C(t)
    } : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: r
    });
  }
};
Xh.DEFAULT_TIMEOUT = 6e4;
var me = class extends Xh {
  constructor() {
    super(...arguments), this.interactions = new Vh(this), this.webhooks = new Kh(this);
  }
};
Yh = me;
me.GeminiNextGenAPIClient = Yh;
me.GeminiNextGenAPIClientError = je;
me.APIError = tt;
me.APIConnectionError = wi;
me.APIConnectionTimeoutError = Rh;
me.APIUserAbortError = Ls;
me.NotFoundError = kh;
me.ConflictError = Dh;
me.RateLimitError = Lh;
me.BadRequestError = xh;
me.AuthenticationError = Mh;
me.InternalServerError = Uh;
me.PermissionDeniedError = Nh;
me.UnprocessableEntityError = $h;
me.toFile = VC;
me.Interactions = Vh;
me.Webhooks = Kh;
function ow(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function iw(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function sw(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function aw(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function lw(e, t, n) {
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
function uw(e, t, n) {
  const r = {};
  let o = s(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec"], es(S));
  } else if (o === "PREFERENCE_TUNING") {
    const S = s(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["preferenceOptimizationSpec"], es(S));
  } else if (o === "DISTILLATION") {
    const S = s(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["distillationSpec"], es(S));
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
function cw(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const i = s(e, ["trainingDataset"]);
  i != null && Tw(i);
  const a = s(e, ["config"]);
  return a != null && lw(a, n), n;
}
function dw(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const i = s(e, ["trainingDataset"]);
  i != null && Sw(i, n, t);
  const a = s(e, ["config"]);
  return a != null && uw(a, n, t), n;
}
function fw(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function hw(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function pw(e, t, n) {
  const r = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function mw(e, t, n) {
  const r = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function gw(e, t) {
  const n = {}, r = s(e, ["config"]);
  return r != null && pw(r, n), n;
}
function yw(e, t) {
  const n = {}, r = s(e, ["config"]);
  return r != null && mw(r, n), n;
}
function _w(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["tunedModels"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => Zh(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function vw(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["tuningJobs"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => Os(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function Aw(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["model"], r);
  const o = s(e, ["name"]);
  return o != null && l(n, ["endpoint"], o), n;
}
function Tw(e, t) {
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
function Sw(e, t, n) {
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
function Zh(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], ah(i));
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
  return p != null && l(n, ["tunedModel"], Aw(p)), n;
}
function Os(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], ah(i));
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
    let ye = S;
    Array.isArray(ye) && (ye = ye.map((ie) => ie)), l(n, ["evaluateDatasetRuns"], ye);
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
  const ge = s(e, ["serviceAccount"]);
  ge != null && l(n, ["serviceAccount"], ge);
  const Q = s(e, ["tunedModelDisplayName"]);
  Q != null && l(n, ["tunedModelDisplayName"], Q);
  const j = s(e, ["tuningJobState"]);
  j != null && l(n, ["tuningJobState"], j);
  const X = s(e, ["veoTuningSpec"]);
  X != null && l(n, ["veoTuningSpec"], X);
  const Te = s(e, ["distillationSamplingSpec"]);
  Te != null && l(n, ["distillationSamplingSpec"], Te);
  const ze = s(e, ["tuningJobMetadata"]);
  return ze != null && l(n, ["tuningJobMetadata"], ze), n;
}
function Ew(e, t) {
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
function es(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["validationDatasetUri"], r);
  const o = s(e, ["vertexDatasetResource"]);
  return o != null && l(n, ["validationDatasetUri"], o), n;
}
var Cw = class extends wt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new cn(Ct.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: ws.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = hw(e);
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
      })), i.then((d) => Os(d));
    } else {
      const c = fw(e);
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
      })), i.then((d) => Zh(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = yw(e);
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
        const h = vw(d), f = new fc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = gw(e);
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
        const h = _w(d), f = new fc();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = iw(e);
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
        const h = aw(d), f = new hc();
        return Object.assign(f, h), f;
      });
    } else {
      const c = ow(e);
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
        const h = sw(d), f = new hc();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = dw(e, e);
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
      })), r.then((u) => Os(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = cw(e);
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
      })), r.then((u) => Ew(u));
    }
  }
}, ww = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, Iw = 1024 * 1024 * 8, bw = 3, Pw = 1e3, Rw = 2, oi = "x-goog-upload-status";
async function xw(e, t, n, r) {
  var o;
  const i = await jh(e, t, n, r), a = await i?.json();
  if (((o = i?.headers) === null || o === void 0 ? void 0 : o[oi]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function Mw(e, t, n, r) {
  var o;
  const i = await jh(e, t, n, r), a = await i?.json();
  if (((o = i?.headers) === null || o === void 0 ? void 0 : o[oi]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = Zf(a), c = new J_();
  return Object.assign(c, u), c;
}
async function jh(e, t, n, r) {
  var o, i, a;
  let u = t;
  const c = r?.baseUrl || ((o = n.clientOptions.httpOptions) === null || o === void 0 ? void 0 : o.baseUrl);
  if (c) {
    const m = new URL(c), y = new URL(t);
    y.protocol = m.protocol, y.host = m.host, y.port = m.port, u = y.toString();
  }
  let d = 0, h = 0, f = new bs(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(Iw, d - h), y = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, v = Pw;
    for (; _ < bw; ) {
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
      }), !((i = f?.headers) === null || i === void 0) && i[oi]) break;
      _++, await kw(v), v = v * Rw;
    }
    if (h += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[oi]) !== "active") break;
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
}, Gc = "x-goog-api-key", Uw = class {
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
}, Fw = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new me({
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
    const n = p_(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const r = new Uw(this.apiKey);
    this.apiClient = new kE({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new Dw(),
      downloader: new ww()
    }), this.models = new jE(this.apiClient), this.live = new WE(this.apiClient, r, new $w()), this.batches = new zv(this.apiClient), this.chats = new NA(this.models, this.apiClient), this.caches = new RA(this.apiClient), this.files = new VA(this.apiClient), this.operations = new eC(this.apiClient), this.authTokens = new _C(this.apiClient), this.tunings = new Cw(this.apiClient), this.fileSearchStores = new IC(this.apiClient);
  }
};
function Hc(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function ii(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function rn(e) {
  return { text: String(e || "") };
}
function Ow(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function qw(e) {
  if (typeof e == "string") return [rn(e)];
  if (!Array.isArray(e)) return [rn("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? rn(n.text || "") : n.type === "image_url" && n.image_url?.url ? Ow(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [rn("")];
}
function Vc() {
  return {
    role: "user",
    parts: [rn("")]
  };
}
function to(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = ii(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function Bw(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function Gw(e) {
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
function Hw(e, t) {
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
function Vw(e = [], t = "") {
  const n = e.map((h) => to(h, "model")).filter(Boolean);
  if (!n.length) return null;
  const r = [...n].reverse().find((h) => Bw(h)) || null, o = [...n].reverse().find((h) => Gw(h)) || null, i = r || o || n[n.length - 1], a = n.indexOf(i), u = ii(i);
  if (!u?.parts?.length) return n[n.length - 1];
  if (o) {
    const h = /* @__PURE__ */ new Map(), f = [];
    n.forEach((m, y) => {
      m.parts.forEach((_, v) => {
        const E = Jc(_, v, y);
        if (!E) return;
        h.has(E) || f.push(E);
        const b = h.get(E);
        b ? h.set(E, Hw(b, _)) : h.set(E, ii(_));
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
function ep(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((r) => r?.functionCall || r).filter((r) => r && r.name);
  return t.length ? t : n;
}
function tp(e) {
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
function Jw(e, t) {
  const n = Wc(e), r = Wc(t);
  return n && r ? JSON.stringify({
    ...n,
    ...r
  }) : String(t || "").trim() || String(e || "{}");
}
function Kw(e, t = "google-tool") {
  return ep(e).map((n, r) => {
    const o = String(n.id || "").trim();
    return {
      id: o || `${t}-${r + 1}`,
      name: n.name || "",
      arguments: tp(n),
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
  function i(a) {
    return ep(a).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), h = tp(u);
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
    case "minimal":
      return Pn.MINIMAL;
    case "high":
      return Pn.HIGH;
    case "medium":
      return Pn.MEDIUM;
    default:
      return Pn.LOW;
  }
}
function zc(e) {
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
  return to(t, "model");
}
function Zw(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = Qw(e);
    return n ? [n] : [];
  }
  return t.map((n) => to(n, "model")).filter(Boolean);
}
function Ra(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => to(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function jw(e) {
  const t = e?.candidates?.[0]?.content;
  return Ra(t ? [t] : []);
}
function eI(e) {
  return Ra(e ? [e] : []);
}
function np(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? ii(e.history) || [] : [];
}
function tI(e, t = 0) {
  return np(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => to(n, "model")).filter(Boolean);
}
function nI(e) {
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
      const c = Zw(u);
      if (c.length) {
        r.push(...c);
        continue;
      }
    }
    if (u.role === "assistant" && Array.isArray(u.tool_calls) && u.tool_calls.length) {
      r.push({
        role: "model",
        parts: [...u.content ? [rn(u.content)] : [], ...u.tool_calls.map((c) => ({ functionCall: {
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
      parts: qw(u.content)
    });
  }
  if (!r.length) return {
    history: [],
    latestMessage: Vc().parts
  };
  const i = r[r.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: r.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: r,
    latestMessage: Vc().parts
  };
}
function rI(e, t) {
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
var oI = class {
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
    const t = Me("google", this.config, e.reasoning), n = nI(e.messages), r = Array.isArray(e.tools) ? e.tools : [], o = Xw(e), i = {
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
      thinkingLevel: Yw(t.effort)
    } : Z(t) && (i.thinkingConfig = { includeThoughts: !0 }), r.length && (i.tools = [{ functionDeclarations: r.map((a) => ({
      name: a.function.name,
      description: a.function.description,
      parameters: a.function.parameters
    })) }]), r.length) {
      const a = String(e.toolChoice || "auto").trim();
      i.toolConfig = { functionCallingConfig: a === "none" ? { mode: bn.NONE } : a === "auto" ? { mode: bn.AUTO } : a === "required" ? { mode: bn.ANY } : {
        mode: bn.ANY,
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
    const n = t.payload || this.buildChatPayload(e), r = Me("google", this.config, e.reasoning), o = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return Br({
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
      effectiveConfig: Ot(e, {
        profileId: r.profileId,
        effectiveMode: r.mode,
        effort: n.createPayload.config?.thinkingConfig?.thinkingLevel,
        budgetTokens: n.createPayload.config?.thinkingConfig?.thinkingBudget,
        controlFields: n.createPayload.config?.thinkingConfig ? { thinkingConfig: n.createPayload.config.thinkingConfig } : {}
      })
    });
  }
  inspectSendRequest(e, t) {
    const n = Me("google", this.config, t.reasoning), r = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return Br({
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
      effectiveConfig: Ot(t, {
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
    const u = `google-tool-${++this.toolCallResponseSequence}`, c = Ww(u);
    let d = null;
    const h = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, f = {
      ...t,
      ...h ? { config: h } : {}
    }, p = typeof n.onStreamProgress == "function", m = np(e).length;
    if (p) {
      const v = await e.sendMessageStream(f), E = /* @__PURE__ */ new Map();
      let b = "", R = null;
      const P = [];
      for await (const L of v) {
        R = L;
        const S = L?.candidates?.[0]?.content;
        S?.parts?.length && P.push(S), Z(n.reasoning) && zc(L).forEach((x, D) => {
          const H = `${x.label}:${D}`;
          E.set(H, Yc(E.get(H) || "", x.text));
        }), a = c.append(L);
        const O = Kc(L);
        b = Yc(b, O), rI(n, {
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
      }, d = Vw(P, b) || r?.candidates?.[0]?.content || null, o = Array.from(E.values()).filter(Boolean).map((L, S) => ({
        label: `思考块 ${S + 1}`,
        text: L
      })), i = b;
    } else
      r = await e.sendMessage(f), o = Z(n.reasoning) ? zc(r) : [], i = Kc(r);
    const y = p ? a : Kw(r, u), _ = tI(e, m);
    return {
      text: i,
      toolCalls: y,
      thoughts: o,
      finishReason: r.candidates?.[0]?.finishReason || "STOP",
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: Ra(_) || eI(d) || jw(r)
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
      const r = { message: [rn(t)] };
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
function w(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var rp = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return rp = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function qs(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Bs = (e) => {
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
}, Ie = class Gs extends G {
  constructor(t, n, r, o) {
    super(`${Gs.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new bi({
      message: r,
      cause: Bs(n)
    });
    const i = n?.error;
    return t === 400 ? new op(t, i, r, o) : t === 401 ? new ip(t, i, r, o) : t === 403 ? new sp(t, i, r, o) : t === 404 ? new ap(t, i, r, o) : t === 409 ? new lp(t, i, r, o) : t === 422 ? new up(t, i, r, o) : t === 429 ? new cp(t, i, r, o) : t >= 500 ? new dp(t, i, r, o) : new Gs(t, i, r, o);
  }
}, Ze = class extends Ie {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, bi = class extends Ie {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, xa = class extends bi {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, op = class extends Ie {
}, ip = class extends Ie {
}, sp = class extends Ie {
}, ap = class extends Ie {
}, lp = class extends Ie {
}, up = class extends Ie {
}, cp = class extends Ie {
}, dp = class extends Ie {
}, fp = class extends G {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, hp = class extends G {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Tr = class extends Error {
  constructor(e) {
    super(e);
  }
}, pp = class extends Ie {
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
}, iI = class extends G {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, sI = /^[a-z][a-z0-9+.-]*:/i, aI = (e) => sI.test(e), ke = (e) => (ke = Array.isArray, ke(e)), Xc = ke;
function Ma(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Qc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function lI(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function ts(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var uI = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new G(`${e} must be an integer`);
  if (t < 0) throw new G(`${e} must be a positive integer`);
  return t;
}, cI = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, no = (e) => new Promise((t) => setTimeout(t, e)), Sn = "6.44.0", dI = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function fI() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var hI = () => {
  const e = fI();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Sn,
    "X-Stainless-OS": jc(Deno.build.os),
    "X-Stainless-Arch": Zc(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Sn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Sn,
    "X-Stainless-OS": jc(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Zc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = pI();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Sn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Sn,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function pI() {
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
var Zc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", jc = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), ed, mI = () => ed ?? (ed = hI());
function mp() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function gp(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function yp(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return gp({
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
function _p(e) {
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
var gI = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), vp = "RFC3986", Ap = (e) => String(e), nd = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Ap
};
var Hs = (e, t) => (Hs = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Hs(e, t)), dt = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), ns = 1024, yI = (e, t, n, r, o) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < i.length; u += ns) {
    const c = i.length >= ns ? i.slice(u, u + ns) : i, d = [];
    for (let h = 0; h < c.length; ++h) {
      let f = c.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || o === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(h);
        continue;
      }
      if (f < 128) {
        d[d.length] = dt[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = dt[192 | f >> 6] + dt[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = dt[224 | f >> 12] + dt[128 | f >> 6 & 63] + dt[128 | f & 63];
        continue;
      }
      h += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(h) & 1023), d[d.length] = dt[240 | f >> 18] + dt[128 | f >> 12 & 63] + dt[128 | f >> 6 & 63] + dt[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function _I(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function rd(e, t) {
  if (ke(e)) {
    const n = [];
    for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
    return n;
  }
  return t(e);
}
var Tp = {
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
}, Sp = function(e, t) {
  Array.prototype.push.apply(e, ke(t) ? t : [t]);
}, od, pe = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: yI,
  encodeValuesOnly: !1,
  format: vp,
  formatter: Ap,
  indices: !1,
  serializeDate(e) {
    return (od ?? (od = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function vI(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var rs = {};
function Ep(e, t, n, r, o, i, a, u, c, d, h, f, p, m, y, _, v, E) {
  let b = e, R = E, P = 0, L = !1;
  for (; (R = R.get(rs)) !== void 0 && !L; ) {
    const H = R.get(e);
    if (P += 1, typeof H < "u") {
      if (H === P) throw new RangeError("Cyclic object value");
      L = !0;
    }
    typeof R.get(rs) > "u" && (P = 0);
  }
  if (typeof d == "function" ? b = d(t, b) : b instanceof Date ? b = p?.(b) : n === "comma" && ke(b) && (b = rd(b, function(H) {
    return H instanceof Date ? p?.(H) : H;
  })), b === null) {
    if (i) return c && !_ ? c(t, pe.encoder, v, "key", m) : t;
    b = "";
  }
  if (vI(b) || _I(b)) {
    if (c) {
      const H = _ ? t : c(t, pe.encoder, v, "key", m);
      return [y?.(H) + "=" + y?.(c(b, pe.encoder, v, "value", m))];
    }
    return [y?.(t) + "=" + y?.(String(b))];
  }
  const S = [];
  if (typeof b > "u") return S;
  let O;
  if (n === "comma" && ke(b))
    _ && c && (b = rd(b, c)), O = [{ value: b.length > 0 ? b.join(",") || null : void 0 }];
  else if (ke(d)) O = d;
  else {
    const H = Object.keys(b);
    O = h ? H.sort(h) : H;
  }
  const x = u ? String(t).replace(/\./g, "%2E") : String(t), D = r && ke(b) && b.length === 1 ? x + "[]" : x;
  if (o && ke(b) && b.length === 0) return D + "[]";
  for (let H = 0; H < O.length; ++H) {
    const z = O[H], ge = typeof z == "object" && typeof z.value < "u" ? z.value : b[z];
    if (a && ge === null) continue;
    const Q = f && u ? z.replace(/\./g, "%2E") : z, j = ke(b) ? typeof n == "function" ? n(D, Q) : D : D + (f ? "." + Q : "[" + Q + "]");
    E.set(e, P);
    const X = /* @__PURE__ */ new WeakMap();
    X.set(rs, E), Sp(S, Ep(ge, j, n, r, o, i, a, u, n === "comma" && _ && ke(b) ? null : c, d, h, f, p, m, y, _, v, X));
  }
  return S;
}
function AI(e = pe) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || pe.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = vp;
  if (typeof e.format < "u") {
    if (!Hs(nd, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const r = nd[n];
  let o = pe.filter;
  (typeof e.filter == "function" || ke(e.filter)) && (o = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in Tp ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = pe.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : pe.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : pe.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : pe.allowEmptyArrays,
    arrayFormat: i,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : pe.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? pe.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : pe.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : pe.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : pe.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : pe.encodeValuesOnly,
    filter: o,
    format: n,
    formatter: r,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : pe.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : pe.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : pe.strictNullHandling
  };
}
function TI(e, t = {}) {
  let n = e;
  const r = AI(t);
  let o, i;
  typeof r.filter == "function" ? (i = r.filter, n = i("", n)) : ke(r.filter) && (i = r.filter, o = i);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = Tp[r.arrayFormat], c = u === "comma" && r.commaRoundTrip;
  o || (o = Object.keys(n)), r.sort && o.sort(r.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < o.length; ++p) {
    const m = o[p];
    r.skipNulls && n[m] === null || Sp(a, Ep(n[m], m, u, c, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, d));
  }
  const h = a.join(r.delimiter);
  let f = r.addQueryPrefix === !0 ? "?" : "";
  return r.charsetSentinel && (r.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function SI(e) {
  return TI(e, { arrayFormat: "brackets" });
}
function EI(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var id;
function Na(e) {
  let t;
  return (id ?? (t = new globalThis.TextEncoder(), id = t.encode.bind(t)))(e);
}
var sd;
function ad(e) {
  let t;
  return (sd ?? (t = new globalThis.TextDecoder(), sd = t.decode.bind(t)))(e);
}
var qe, Be, Pi = class {
  constructor() {
    qe.set(this, void 0), Be.set(this, void 0), V(this, qe, new Uint8Array(), "f"), V(this, Be, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Na(e) : e;
    V(this, qe, EI([w(this, qe, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = CI(w(this, qe, "f"), w(this, Be, "f"))) != null; ) {
      if (r.carriage && w(this, Be, "f") == null) {
        V(this, Be, r.index, "f");
        continue;
      }
      if (w(this, Be, "f") != null && (r.index !== w(this, Be, "f") + 1 || r.carriage)) {
        n.push(ad(w(this, qe, "f").subarray(0, w(this, Be, "f") - 1))), V(this, qe, w(this, qe, "f").subarray(w(this, Be, "f")), "f"), V(this, Be, null, "f");
        continue;
      }
      const o = w(this, Be, "f") !== null ? r.preceding - 1 : r.preceding, i = ad(w(this, qe, "f").subarray(0, o));
      n.push(i), V(this, qe, w(this, qe, "f").subarray(r.index), "f"), V(this, Be, null, "f");
    }
    return n;
  }
  flush() {
    return w(this, qe, "f").length ? this.decode(`
`) : [];
  }
};
qe = /* @__PURE__ */ new WeakMap(), Be = /* @__PURE__ */ new WeakMap();
Pi.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Pi.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function CI(e, t) {
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
function wI(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var si = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, ld = (e, t, n) => {
  if (e) {
    if (lI(si, e)) return e;
    Ee(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(si))}`);
  }
};
function Sr() {
}
function Ro(e, t, n) {
  return !t || si[e] > si[n] ? Sr : t[e].bind(t);
}
var II = {
  error: Sr,
  warn: Sr,
  info: Sr,
  debug: Sr
}, ud = /* @__PURE__ */ new WeakMap();
function Ee(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return II;
  const r = ud.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: Ro("error", t, n),
    warn: Ro("warn", t, n),
    info: Ro("info", t, n),
    debug: Ro("debug", t, n)
  };
  return ud.set(t, [n, o]), o;
}
var Qt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), hr, Gr = class Er {
  constructor(t, n, r) {
    this.iterator = t, hr.set(this, void 0), this.controller = n, V(this, hr, r, "f");
  }
  static fromSSEResponse(t, n, r, o) {
    let i = !1;
    const a = r ? Ee(r) : console;
    async function* u() {
      if (i) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of bI(t, n))
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
              if (h && h.error) throw new Ie(void 0, h.error, void 0, t.headers);
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
              if (d.event == "error") throw new Ie(void 0, h.error, h.message, void 0);
              yield {
                event: d.event,
                data: h
              };
            }
          }
        c = !0;
      } catch (d) {
        if (qs(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Er(u, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* i() {
      const u = new Pi(), c = _p(t);
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
        if (qs(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Er(a, n, r);
  }
  [(hr = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Er(() => o(t), this.controller, w(this, hr, "f")), new Er(() => o(n), this.controller, w(this, hr, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return gp({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = Na(JSON.stringify(o) + `
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
async function* bI(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
  const n = new RI(), r = new Pi(), o = _p(e.body);
  for await (const i of PI(o)) for (const a of r.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of r.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* PI(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Na(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let i;
    for (; (i = wI(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var RI = class {
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
    let [t, n, r] = xI(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function xI(e, t) {
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
async function Cp(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return Ee(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : Gr.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : wp(await n.json(), n) : await n.text();
  })();
  return Ee(e).debug(`[${r}] response parsed`, Qt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function wp(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Cr, Ip = class bp extends Promise {
  constructor(t, n, r = Cp) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, Cr.set(this, void 0), V(this, Cr, t, "f");
  }
  _thenUnwrap(t) {
    return new bp(w(this, Cr, "f"), this.responsePromise, async (n, r) => wp(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(w(this, Cr, "f"), t))), this.parsedPromise;
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
Cr = /* @__PURE__ */ new WeakMap();
var xo, Ri = class {
  constructor(e, t, n, r) {
    xo.set(this, void 0), V(this, xo, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new G("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await w(this, xo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(xo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, MI = class extends Ip {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await Cp(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, qt = class extends Ri {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, ne = class extends Ri {
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
        ...Ma(this.options.query),
        after: t
      }
    } : null;
  }
}, we = class extends Ri {
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
        ...Ma(this.options.query),
        after: e
      }
    } : null;
  }
}, bt = class extends Ri {
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
        ...Ma(this.options.query),
        after: e
      }
    } : null;
  }
}, NI = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, kI = "urn:ietf:params:oauth:grant-type:token-exchange", DI = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? mp();
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
      grant_type: kI,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: NI[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new pp(t.status, a, t.headers) : Ie.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
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
}, Pp = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Dr(e, t, n) {
  return Pp(), new File(e, t ?? "unknown_file", n);
}
function Ho(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var ka = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", xi = async (e, t) => Vs(e.body) ? {
  ...e,
  body: await Rp(e.body, t)
} : e, ht = async (e, t) => ({
  ...e,
  body: await Rp(e.body, t)
}), cd = /* @__PURE__ */ new WeakMap();
function $I(e) {
  const t = typeof e == "function" ? e : e.fetch, n = cd.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new o(i).text();
    } catch {
      return !0;
    }
  })();
  return cd.set(t, r), r;
}
var Rp = async (e, t) => {
  if (!await $I(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, o]) => Js(n, r, o))), n;
}, xp = (e) => e instanceof Blob && "name" in e, LI = (e) => typeof e == "object" && e !== null && (e instanceof Response || ka(e) || xp(e)), Vs = (e) => {
  if (LI(e)) return !0;
  if (Array.isArray(e)) return e.some(Vs);
  if (e && typeof e == "object") {
    for (const t in e) if (Vs(e[t])) return !0;
  }
  return !1;
}, Js = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, Dr([await n.blob()], Ho(n)));
    else if (ka(n)) e.append(t, Dr([await new Response(yp(n)).blob()], Ho(n)));
    else if (xp(n)) e.append(t, n, Ho(n));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Js(e, t + "[]", r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, o]) => Js(e, `${t}[${r}]`, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Mp = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", UI = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Mp(e), FI = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function OI(e, t, n) {
  if (Pp(), e = await e, UI(e))
    return e instanceof File ? e : Dr([await e.arrayBuffer()], e.name);
  if (FI(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Dr(await Ks(o), t, n);
  }
  const r = await Ks(e);
  if (t || (t = Ho(e)), !n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return Dr(r, t, n);
}
async function Ks(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Mp(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (ka(e)) for await (const n of e) t.push(...await Ks(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${qI(e)}`);
  }
  return t;
}
function qI(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var k = class {
  constructor(e) {
    this._client = e;
  }
};
function Np(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var dd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), BI = (e = Np) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let y = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? dd) ?? dd)?.toString) && (y = m + "", i.push({
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
}, T = /* @__PURE__ */ BI(Np), kp = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/chat/completions/${e}/messages`, ne, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function ai(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Da(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function ro(e) {
  return e?.$brand === "auto-parseable-tool";
}
function GI(e, t) {
  return !t || !Dp(t) ? {
    ...e,
    choices: e.choices.map((n) => ($p(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : $a(e, t);
}
function $a(e, t) {
  const n = e.choices.map((r) => {
    if (r.finish_reason === "length") throw new fp();
    if (r.finish_reason === "content_filter") throw new hp();
    return $p(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        ...r.message.tool_calls ? { tool_calls: r.message.tool_calls?.map((o) => VI(t, o)) ?? void 0 } : void 0,
        parsed: r.message.content && !r.message.refusal ? HI(t, r.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function HI(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function VI(e, t) {
  const n = e.tools?.find((r) => ai(r) && r.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: ro(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function JI(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((r) => ai(r) && r.function?.name === t.function.name);
  return ai(n) && (ro(n) || n?.function.strict || !1);
}
function Dp(e) {
  return Da(e.response_format) ? !0 : e.tools?.some((t) => ro(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function $p(e) {
  for (const t of e || []) if (t.type !== "function") throw new G(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function KI(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new G(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new G(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var li = (e) => e?.role === "assistant", Lp = (e) => e?.role === "tool", Ws, Vo, Jo, wr, Ir, Ko, br, vt, Pr, ui, ci, En, Up, La = class {
  constructor() {
    Ws.add(this), this.controller = new AbortController(), Vo.set(this, void 0), Jo.set(this, () => {
    }), wr.set(this, () => {
    }), Ir.set(this, void 0), Ko.set(this, () => {
    }), br.set(this, () => {
    }), vt.set(this, {}), Pr.set(this, !1), ui.set(this, !1), ci.set(this, !1), En.set(this, !1), V(this, Vo, new Promise((e, t) => {
      V(this, Jo, e, "f"), V(this, wr, t, "f");
    }), "f"), V(this, Ir, new Promise((e, t) => {
      V(this, Ko, e, "f"), V(this, br, t, "f");
    }), "f"), w(this, Vo, "f").catch(() => {
    }), w(this, Ir, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, w(this, Ws, "m", Up).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (w(this, Jo, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return w(this, Pr, "f");
  }
  get errored() {
    return w(this, ui, "f");
  }
  get aborted() {
    return w(this, ci, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (w(this, vt, "f")[e] || (w(this, vt, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = w(this, vt, "f")[e];
    if (!n) return this;
    const r = n.findIndex((o) => o.listener === t);
    return r >= 0 && n.splice(r, 1), this;
  }
  once(e, t) {
    return (w(this, vt, "f")[e] || (w(this, vt, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      V(this, En, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    V(this, En, !0, "f"), await w(this, Ir, "f");
  }
  _emit(e, ...t) {
    if (w(this, Pr, "f")) return;
    e === "end" && (V(this, Pr, !0, "f"), w(this, Ko, "f").call(this));
    const n = w(this, vt, "f")[e];
    if (n && (w(this, vt, "f")[e] = n.filter((r) => !r.once), n.forEach(({ listener: r }) => r(...t))), e === "abort") {
      const r = t[0];
      !w(this, En, "f") && !n?.length && Promise.reject(r), w(this, wr, "f").call(this, r), w(this, br, "f").call(this, r), this._emit("end");
      return;
    }
    if (e === "error") {
      const r = t[0];
      !w(this, En, "f") && !n?.length && Promise.reject(r), w(this, wr, "f").call(this, r), w(this, br, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
Vo = /* @__PURE__ */ new WeakMap(), Jo = /* @__PURE__ */ new WeakMap(), wr = /* @__PURE__ */ new WeakMap(), Ir = /* @__PURE__ */ new WeakMap(), Ko = /* @__PURE__ */ new WeakMap(), br = /* @__PURE__ */ new WeakMap(), vt = /* @__PURE__ */ new WeakMap(), Pr = /* @__PURE__ */ new WeakMap(), ui = /* @__PURE__ */ new WeakMap(), ci = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), Ws = /* @__PURE__ */ new WeakSet(), Up = function(t) {
  if (V(this, ui, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Ze()), t instanceof Ze)
    return V(this, ci, !0, "f"), this._emit("abort", t);
  if (t instanceof G) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new G(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new G(String(t)));
};
function WI(e) {
  return typeof e.parse == "function";
}
var be, zs, di, Ys, Xs, Qs, Fp, Op, zI = 10, qp = class extends La {
  constructor() {
    super(...arguments), be.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), Lp(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (li(e) && e.tool_calls)
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
    return await this.done(), w(this, be, "m", zs).call(this);
  }
  async finalMessage() {
    return await this.done(), w(this, be, "m", di).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), w(this, be, "m", Ys).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), w(this, be, "m", Xs).call(this);
  }
  async totalUsage() {
    return await this.done(), w(this, be, "m", Qs).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = w(this, be, "m", di).call(this);
    t && this._emit("finalMessage", t);
    const n = w(this, be, "m", zs).call(this);
    n && this._emit("finalContent", n);
    const r = w(this, be, "m", Ys).call(this);
    r && this._emit("finalFunctionToolCall", r);
    const o = w(this, be, "m", Xs).call(this);
    o != null && this._emit("finalFunctionToolCallResult", o), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", w(this, be, "m", Qs).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), w(this, be, "m", Fp).call(this, t);
    const o = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion($a(o, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const r of t.messages) this._addMessage(r, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const r = "tool", { tool_choice: o = "auto", stream: i, ...a } = t, u = typeof o != "string" && o.type === "function" && o?.function?.name, { maxChatCompletions: c = zI } = n || {}, d = t.tools.map((p) => {
      if (ro(p)) {
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
          R = WI(b) ? await b.parse(E) : E;
        } catch (S) {
          const O = S instanceof Error ? S.message : String(S);
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: O
          });
          continue;
        }
        const P = await b.function(R, this), L = w(this, be, "m", Op).call(this, P);
        if (this._addMessage({
          role: r,
          tool_call_id: _,
          content: L
        }), u) return;
      }
    }
  }
};
be = /* @__PURE__ */ new WeakSet(), zs = function() {
  return w(this, be, "m", di).call(this).content ?? null;
}, di = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (li(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new G("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Ys = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (li(n) && n?.tool_calls?.length) for (let r = n.tool_calls.length - 1; r >= 0; r--) {
      const o = n.tool_calls[r];
      if (o?.type === "function") return o.function;
    }
  }
}, Xs = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Lp(n) && n.content != null && typeof n.content == "string" && this.messages.some((r) => r.role === "assistant" && r.tool_calls?.some((o) => o.type === "function" && o.id === n.tool_call_id))) return n.content;
  }
}, Qs = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, Fp = function(t) {
  if (t.n != null && t.n > 1) throw new G("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, Op = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var YI = class Bp extends qp {
  static runTools(t, n, r) {
    const o = new Bp(), i = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, i)), o;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), li(t) && t.content && this._emit("content", t.content);
  }
}, ve = {
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
}, XI = class extends Error {
}, QI = class extends Error {
};
function ZI(e, t = ve.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return jI(e.trim(), t);
}
var jI = (e, t) => {
  const n = e.length;
  let r = 0;
  const o = (p) => {
    throw new XI(`${p} at position ${r}`);
  }, i = (p) => {
    throw new QI(`${p} at position ${r}`);
  }, a = () => (f(), r >= n && o("Unexpected end of input"), e[r] === '"' ? u() : e[r] === "{" ? c() : e[r] === "[" ? d() : e.substring(r, r + 4) === "null" || ve.NULL & t && n - r < 4 && "null".startsWith(e.substring(r)) ? (r += 4, null) : e.substring(r, r + 4) === "true" || ve.BOOL & t && n - r < 4 && "true".startsWith(e.substring(r)) ? (r += 4, !0) : e.substring(r, r + 5) === "false" || ve.BOOL & t && n - r < 5 && "false".startsWith(e.substring(r)) ? (r += 5, !1) : e.substring(r, r + 8) === "Infinity" || ve.INFINITY & t && n - r < 8 && "Infinity".startsWith(e.substring(r)) ? (r += 8, 1 / 0) : e.substring(r, r + 9) === "-Infinity" || ve.MINUS_INFINITY & t && 1 < n - r && n - r < 9 && "-Infinity".startsWith(e.substring(r)) ? (r += 9, -1 / 0) : e.substring(r, r + 3) === "NaN" || ve.NAN & t && n - r < 3 && "NaN".startsWith(e.substring(r)) ? (r += 3, NaN) : h()), u = () => {
    const p = r;
    let m = !1;
    for (r++; r < n && (e[r] !== '"' || m && e[r - 1] === "\\"); )
      m = e[r] === "\\" ? !m : !1, r++;
    if (e.charAt(r) == '"') try {
      return JSON.parse(e.substring(p, ++r - Number(m)));
    } catch (y) {
      i(String(y));
    }
    else if (ve.STR & t) try {
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
        if (f(), r >= n && ve.OBJ & t) return p;
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
          if (ve.OBJ & t) return p;
          throw y;
        }
        f(), e[r] === "," && r++;
      }
    } catch {
      if (ve.OBJ & t) return p;
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
      if (ve.ARR & t) return p;
      o("Expected ']' at end of array");
    }
    return r++, p;
  }, h = () => {
    if (r === 0) {
      e === "-" && ve.NUM & t && o("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (ve.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        i(String(m));
      }
    }
    const p = r;
    for (e[r] === "-" && r++; e[r] && !",]}".includes(e[r]); ) r++;
    r == n && !(ve.NUM & t) && o("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, r));
    } catch {
      e.substring(p, r) === "-" && ve.NUM & t && o("Not sure what '-' is");
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
}, fd = (e) => ZI(e, ve.ALL ^ ve.NUM), fe, _t, yn, kt, os, Mo, is, ss, as, No, ls, hd, Gp = class Zs extends qp {
  constructor(t) {
    super(), fe.add(this), _t.set(this, void 0), yn.set(this, void 0), kt.set(this, void 0), V(this, _t, t, "f"), V(this, yn, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return w(this, kt, "f");
  }
  static fromReadableStream(t) {
    const n = new Zs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, r) {
    const o = new Zs(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), w(this, fe, "m", os).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) w(this, fe, "m", is).call(this, a);
    if (i.controller.signal?.aborted) throw new Ze();
    return this._addChatCompletion(w(this, fe, "m", No).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), w(this, fe, "m", os).call(this), this._connected();
    const o = Gr.fromReadableStream(t, this.controller);
    let i;
    for await (const a of o)
      i && i !== a.id && this._addChatCompletion(w(this, fe, "m", No).call(this)), w(this, fe, "m", is).call(this, a), i = a.id;
    if (o.controller.signal?.aborted) throw new Ze();
    return this._addChatCompletion(w(this, fe, "m", No).call(this));
  }
  [(_t = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), kt = /* @__PURE__ */ new WeakMap(), fe = /* @__PURE__ */ new WeakSet(), os = function() {
    this.ended || V(this, kt, void 0, "f");
  }, Mo = function(n) {
    let r = w(this, yn, "f")[n.index];
    return r || (r = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, w(this, yn, "f")[n.index] = r, r);
  }, is = function(n) {
    if (this.ended) return;
    const r = w(this, fe, "m", hd).call(this, n);
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
      const a = w(this, fe, "m", Mo).call(this, i);
      i.finish_reason && (w(this, fe, "m", as).call(this, i), a.current_tool_call_index != null && w(this, fe, "m", ss).call(this, i, a.current_tool_call_index));
      for (const u of o.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (w(this, fe, "m", as).call(this, i), a.current_tool_call_index != null && w(this, fe, "m", ss).call(this, i, a.current_tool_call_index)), a.current_tool_call_index = u.index;
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
  }, ss = function(n, r) {
    if (w(this, fe, "m", Mo).call(this, n).done_tool_calls.has(r)) return;
    const o = n.message.tool_calls?.[r];
    if (!o) throw new Error("no tool call snapshot");
    if (!o.type) throw new Error("tool call snapshot missing `type`");
    if (o.type === "function") {
      const i = w(this, _t, "f")?.tools?.find((a) => ai(a) && a.function.name === o.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: o.function.name,
        index: r,
        arguments: o.function.arguments,
        parsed_arguments: ro(i) ? i.$parseRaw(o.function.arguments) : i?.function.strict ? JSON.parse(o.function.arguments) : null
      });
    } else o.type;
  }, as = function(n) {
    const r = w(this, fe, "m", Mo).call(this, n);
    if (n.message.content && !r.content_done) {
      r.content_done = !0;
      const o = w(this, fe, "m", ls).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: o ? o.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !r.refusal_done && (r.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !r.logprobs_content_done && (r.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !r.logprobs_refusal_done && (r.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, No = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = w(this, kt, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return V(this, kt, void 0, "f"), V(this, yn, [], "f"), eb(n, w(this, _t, "f"));
  }, ls = function() {
    const n = w(this, _t, "f")?.response_format;
    return Da(n) ? n : null;
  }, hd = function(n) {
    var r, o, i, a;
    let u = w(this, kt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = V(this, kt, {
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
      if (f && (_.finish_reason = f, w(this, _t, "f") && Dp(w(this, _t, "f")))) {
        if (f === "length") throw new fp();
        if (f === "content_filter") throw new hp();
      }
      if (Object.assign(_, y), !h) continue;
      const { content: v, refusal: E, function_call: b, role: R, tool_calls: P, ...L } = h;
      if (Object.assign(_.message, L), E && (_.message.refusal = (_.message.refusal || "") + E), R && (_.message.role = R), b && (_.message.function_call ? (b.name && (_.message.function_call.name = b.name), b.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += b.arguments)) : _.message.function_call = b), v && (_.message.content = (_.message.content || "") + v, !_.message.refusal && w(this, fe, "m", ls).call(this) && (_.message.parsed = fd(_.message.content))), P) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: S, id: O, type: x, function: D, ...H } of P) {
          const z = (a = _.message.tool_calls)[S] ?? (a[S] = {});
          Object.assign(z, H), O && (z.id = O), x && (z.type = x), D && (z.function ?? (z.function = {
            name: D.name ?? "",
            arguments: ""
          })), D?.name && (z.function.name = D.name), D?.arguments && (z.function.arguments += D.arguments, JI(w(this, _t, "f"), z) && (z.function.parsed_arguments = fd(z.function.arguments)));
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
    return new Gr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function eb(e, t) {
  const { id: n, choices: r, created: o, model: i, system_fingerprint: a, ...u } = e;
  return GI({
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
${ko(e)}`);
            if (L == null) throw new G(`missing choices[${h}].tool_calls[${R}].type
${ko(e)}`);
            if (D == null) throw new G(`missing choices[${h}].tool_calls[${R}].function.name
${ko(e)}`);
            if (x == null) throw new G(`missing choices[${h}].tool_calls[${R}].function.arguments
${ko(e)}`);
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
function ko(e) {
  return JSON.stringify(e);
}
var tb = class js extends Gp {
  static fromReadableStream(t) {
    const n = new js(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, r) {
    const o = new js(n), i = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, i)), o;
  }
}, Ua = class extends k {
  constructor() {
    super(...arguments), this.messages = new kp(this._client);
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
    return KI(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => $a(n, e));
  }
  runTools(e, t) {
    return e.stream ? tb.runTools(this._client, e, t) : YI.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Gp.createChatCompletion(this._client, e, t);
  }
};
Ua.Messages = kp;
var Fa = class extends k {
  constructor() {
    super(...arguments), this.completions = new Ua(this._client);
  }
};
Fa.Completions = Ua;
var Hp = class extends k {
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
}, Vp = class extends k {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", we, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Jp = class extends k {
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
    return this._client.getAPIList("/organization/certificates", we, {
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
    return this._client.getAPIList("/organization/certificates/activate", qt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", qt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Kp = class extends k {
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
}, Wp = class extends k {
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
    return this._client.getAPIList("/organization/invites", we, {
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
}, zp = class extends k {
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
    return this._client.getAPIList("/organization/roles", bt, {
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
}, Yp = class extends k {
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
    return this._client.getAPIList("/organization/spend_alerts", we, {
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
}, Xp = class extends k {
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
}, Qp = class extends k {
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
    return this._client.getAPIList(T`/organization/groups/${e}/roles`, bt, {
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
}, Zp = class extends k {
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
    return this._client.getAPIList(T`/organization/groups/${e}/users`, bt, {
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
}, Mi = class extends k {
  constructor() {
    super(...arguments), this.users = new Zp(this._client), this.roles = new Qp(this._client);
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
    return this._client.getAPIList("/organization/groups", bt, {
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
Mi.Users = Zp;
Mi.Roles = Qp;
var jp = class extends k {
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(T`/organization/projects/${r}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/api_keys`, we, {
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
}, em = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/certificates`, we, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/certificates/activate`, qt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/certificates/deactivate`, qt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, tm = class extends k {
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
}, nm = class extends k {
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
}, rm = class extends k {
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
}, om = class extends k {
  listRateLimits(e, t = {}, n) {
    return this._client.getAPIList(T`/organization/projects/${e}/rate_limits`, we, {
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
}, im = class extends k {
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
    return this._client.getAPIList(T`/projects/${e}/roles`, bt, {
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
}, sm = class extends k {
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
    return this._client.getAPIList(T`/organization/projects/${e}/service_accounts`, we, {
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
}, am = class extends k {
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
    return this._client.getAPIList(T`/organization/projects/${e}/spend_alerts`, we, {
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
}, lm = class extends k {
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
    return this._client.getAPIList(T`/projects/${r}/groups/${e}/roles`, bt, {
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
}, Oa = class extends k {
  constructor() {
    super(...arguments), this.roles = new lm(this._client);
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
    return this._client.getAPIList(T`/organization/projects/${e}/groups`, bt, {
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
Oa.Roles = lm;
var um = class extends k {
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
    return this._client.getAPIList(T`/projects/${r}/users/${e}/roles`, bt, {
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
}, qa = class extends k {
  constructor() {
    super(...arguments), this.roles = new um(this._client);
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
    return this._client.getAPIList(T`/organization/projects/${e}/users`, we, {
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
qa.Roles = um;
var Ke = class extends k {
  constructor() {
    super(...arguments), this.users = new qa(this._client), this.serviceAccounts = new sm(this._client), this.apiKeys = new jp(this._client), this.rateLimits = new om(this._client), this.modelPermissions = new rm(this._client), this.hostedToolPermissions = new nm(this._client), this.groups = new Oa(this._client), this.roles = new im(this._client), this.dataRetention = new tm(this._client), this.spendAlerts = new am(this._client), this.certificates = new em(this._client);
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
    return this._client.getAPIList("/organization/projects", we, {
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
Ke.Users = qa;
Ke.ServiceAccounts = sm;
Ke.APIKeys = jp;
Ke.RateLimits = om;
Ke.ModelPermissions = rm;
Ke.HostedToolPermissions = nm;
Ke.Groups = Oa;
Ke.Roles = im;
Ke.DataRetention = tm;
Ke.SpendAlerts = am;
Ke.Certificates = em;
var cm = class extends k {
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
    return this._client.getAPIList(T`/organization/users/${e}/roles`, bt, {
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
}, Ba = class extends k {
  constructor() {
    super(...arguments), this.roles = new cm(this._client);
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
    return this._client.getAPIList("/organization/users", we, {
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
Ba.Roles = cm;
var We = class extends k {
  constructor() {
    super(...arguments), this.auditLogs = new Vp(this._client), this.adminAPIKeys = new Hp(this._client), this.usage = new Xp(this._client), this.invites = new Wp(this._client), this.users = new Ba(this._client), this.groups = new Mi(this._client), this.roles = new zp(this._client), this.dataRetention = new Kp(this._client), this.spendAlerts = new Yp(this._client), this.certificates = new Jp(this._client), this.projects = new Ke(this._client);
  }
};
We.AuditLogs = Vp;
We.AdminAPIKeys = Hp;
We.Usage = Xp;
We.Invites = Wp;
We.Users = Ba;
We.Groups = Mi;
We.Roles = zp;
We.DataRetention = Kp;
We.SpendAlerts = Yp;
We.Certificates = Jp;
We.Projects = Ke;
var Ga = class extends k {
  constructor() {
    super(...arguments), this.organization = new We(this._client);
  }
};
Ga.Organization = We;
var dm = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* nb(e) {
  if (!e) return;
  if (dm in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Xc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = Xc(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var F = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of nb(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [dm]: !0,
    values: t,
    nulls: n
  };
}, fm = class extends k {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: F([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, hm = class extends k {
  create(e, t) {
    return this._client.post("/audio/transcriptions", ht({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, pm = class extends k {
  create(e, t) {
    return this._client.post("/audio/translations", ht({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, oo = class extends k {
  constructor() {
    super(...arguments), this.transcriptions = new hm(this._client), this.translations = new pm(this._client), this.speech = new fm(this._client);
  }
};
oo.Transcriptions = hm;
oo.Translations = pm;
oo.Speech = fm;
var mm = class extends k {
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
}, gm = class extends k {
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
}, ym = class extends k {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, _m = class extends k {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Ni = class extends k {
  constructor() {
    super(...arguments), this.sessions = new ym(this._client), this.transcriptionSessions = new _m(this._client);
  }
};
Ni.Sessions = ym;
Ni.TranscriptionSessions = _m;
var vm = class extends k {
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
}, Am = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/chatkit/threads/${e}`, {
      ...t,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", we, {
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
    return this._client.getAPIList(T`/chatkit/threads/${e}/items`, we, {
      query: t,
      ...n,
      headers: F([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, ki = class extends k {
  constructor() {
    super(...arguments), this.sessions = new vm(this._client), this.threads = new Am(this._client);
  }
};
ki.Sessions = vm;
ki.Threads = Am;
var Tm = class extends k {
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
}, Sm = class extends k {
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
}, rb = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, r = new Uint8Array(n);
    for (let o = 0; o < n; o++) r[o] = t.charCodeAt(o);
    return Array.from(new Float32Array(r.buffer));
  }
}, Dt = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Ce, on, ea, ft, Wo, rt, sn, xn, jt, fi, Ge, zo, Yo, $r, Rr, xr, pd, md, gd, yd, _d, vd, Ad, Lr = class extends La {
  constructor() {
    super(...arguments), Ce.add(this), ea.set(this, []), ft.set(this, {}), Wo.set(this, {}), rt.set(this, void 0), sn.set(this, void 0), xn.set(this, void 0), jt.set(this, void 0), fi.set(this, void 0), Ge.set(this, void 0), zo.set(this, void 0), Yo.set(this, void 0), $r.set(this, void 0);
  }
  [(ea = /* @__PURE__ */ new WeakMap(), ft = /* @__PURE__ */ new WeakMap(), Wo = /* @__PURE__ */ new WeakMap(), rt = /* @__PURE__ */ new WeakMap(), sn = /* @__PURE__ */ new WeakMap(), xn = /* @__PURE__ */ new WeakMap(), jt = /* @__PURE__ */ new WeakMap(), fi = /* @__PURE__ */ new WeakMap(), Ge = /* @__PURE__ */ new WeakMap(), zo = /* @__PURE__ */ new WeakMap(), Yo = /* @__PURE__ */ new WeakMap(), $r = /* @__PURE__ */ new WeakMap(), Ce = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new on();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const r = Gr.fromReadableStream(e, this.controller);
    for await (const o of r) w(this, Ce, "m", Rr).call(this, o);
    if (r.controller.signal?.aborted) throw new Ze();
    return this._addRun(w(this, Ce, "m", xr).call(this));
  }
  toReadableStream() {
    return new Gr(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, r) {
    const o = new on();
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
    for await (const u of a) w(this, Ce, "m", Rr).call(this, u);
    if (a.controller.signal?.aborted) throw new Ze();
    return this._addRun(w(this, Ce, "m", xr).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const r = new on();
    return r._run(() => r._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  static createAssistantStream(e, t, n, r) {
    const o = new on();
    return o._run(() => o._runAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  currentEvent() {
    return w(this, zo, "f");
  }
  currentRun() {
    return w(this, Yo, "f");
  }
  currentMessageSnapshot() {
    return w(this, rt, "f");
  }
  currentRunStepSnapshot() {
    return w(this, $r, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(w(this, ft, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(w(this, Wo, "f"));
  }
  async finalRun() {
    if (await this.done(), !w(this, sn, "f")) throw Error("Final run was not received.");
    return w(this, sn, "f");
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
    for await (const a of i) w(this, Ce, "m", Rr).call(this, a);
    if (i.controller.signal?.aborted) throw new Ze();
    return this._addRun(w(this, Ce, "m", xr).call(this));
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
    for await (const u of a) w(this, Ce, "m", Rr).call(this, u);
    if (a.controller.signal?.aborted) throw new Ze();
    return this._addRun(w(this, Ce, "m", xr).call(this));
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
      else if (ts(o) && ts(r)) o = this.accumulateDelta(o, r);
      else if (Array.isArray(o) && Array.isArray(r)) {
        if (o.every((i) => typeof i == "string" || typeof i == "number")) {
          o.push(...r);
          continue;
        }
        for (const i of r) {
          if (!ts(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
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
on = Lr, Rr = function(t) {
  if (!this.ended)
    switch (V(this, zo, t, "f"), w(this, Ce, "m", gd).call(this, t), t.event) {
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
        w(this, Ce, "m", Ad).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        w(this, Ce, "m", md).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        w(this, Ce, "m", pd).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, xr = function() {
  if (this.ended) throw new G("stream has ended, this shouldn't happen");
  if (!w(this, sn, "f")) throw Error("Final run has not been received");
  return w(this, sn, "f");
}, pd = function(t) {
  const [n, r] = w(this, Ce, "m", _d).call(this, t, w(this, rt, "f"));
  V(this, rt, n, "f"), w(this, Wo, "f")[n.id] = n;
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
        if (o.index != w(this, xn, "f")) {
          if (w(this, jt, "f")) switch (w(this, jt, "f").type) {
            case "text":
              this._emit("textDone", w(this, jt, "f").text, w(this, rt, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", w(this, jt, "f").image_file, w(this, rt, "f"));
              break;
          }
          V(this, xn, o.index, "f");
        }
        V(this, jt, n.content[o.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (w(this, xn, "f") !== void 0) {
        const o = t.data.content[w(this, xn, "f")];
        if (o) switch (o.type) {
          case "image_file":
            this._emit("imageFileDone", o.image_file, w(this, rt, "f"));
            break;
          case "text":
            this._emit("textDone", o.text, w(this, rt, "f"));
            break;
        }
      }
      w(this, rt, "f") && this._emit("messageDone", t.data), V(this, rt, void 0, "f");
  }
}, md = function(t) {
  const n = w(this, Ce, "m", yd).call(this, t);
  switch (V(this, $r, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const r = t.data.delta;
      if (r.step_details && r.step_details.type == "tool_calls" && r.step_details.tool_calls && n.step_details.type == "tool_calls") for (const o of r.step_details.tool_calls) o.index == w(this, fi, "f") ? this._emit("toolCallDelta", o, n.step_details.tool_calls[o.index]) : (w(this, Ge, "f") && this._emit("toolCallDone", w(this, Ge, "f")), V(this, fi, o.index, "f"), V(this, Ge, n.step_details.tool_calls[o.index], "f"), w(this, Ge, "f") && this._emit("toolCallCreated", w(this, Ge, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      V(this, $r, void 0, "f"), t.data.step_details.type == "tool_calls" && w(this, Ge, "f") && (this._emit("toolCallDone", w(this, Ge, "f")), V(this, Ge, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, gd = function(t) {
  w(this, ea, "f").push(t), this._emit("event", t);
}, yd = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return w(this, ft, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = w(this, ft, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let r = t.data;
      if (r.delta) {
        const o = on.accumulateDelta(n, r.delta);
        w(this, ft, "f")[t.data.id] = o;
      }
      return w(this, ft, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      w(this, ft, "f")[t.data.id] = t.data;
      break;
  }
  if (w(this, ft, "f")[t.data.id]) return w(this, ft, "f")[t.data.id];
  throw new Error("No snapshot available");
}, _d = function(t, n) {
  let r = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, r];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let o = t.data;
      if (o.delta.content) for (const i of o.delta.content) if (i.index in n.content) {
        let a = n.content[i.index];
        n.content[i.index] = w(this, Ce, "m", vd).call(this, i, a);
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
}, vd = function(t, n) {
  return on.accumulateDelta(n, t);
}, Ad = function(t) {
  switch (V(this, Yo, t.data, "f"), t.event) {
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
      V(this, sn, t.data, "f"), w(this, Ge, "f") && (this._emit("toolCallDone", w(this, Ge, "f")), V(this, Ge, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Ha = class extends k {
  constructor() {
    super(...arguments), this.steps = new Sm(this._client);
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
    return Lr.createAssistantStream(e, this._client.beta.threads.runs, t, n);
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
          await no(a);
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
    return Lr.createAssistantStream(e, this._client.beta.threads.runs, t, n);
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
    return Lr.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
Ha.Steps = Sm;
var Di = class extends k {
  constructor() {
    super(...arguments), this.runs = new Ha(this._client), this.messages = new Tm(this._client);
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
    return Lr.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Di.Runs = Ha;
Di.Messages = Tm;
var Jn = class extends k {
  constructor() {
    super(...arguments), this.realtime = new Ni(this._client), this.chatkit = new ki(this._client), this.assistants = new gm(this._client), this.threads = new Di(this._client);
  }
};
Jn.Realtime = Ni;
Jn.ChatKit = ki;
Jn.Assistants = gm;
Jn.Threads = Di;
var Em = class extends k {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, Cm = class extends k {
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(T`/containers/${r}/files/${e}/content`, {
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Va = class extends k {
  constructor() {
    super(...arguments), this.content = new Cm(this._client);
  }
  create(e, t, n) {
    return this._client.post(T`/containers/${e}/files`, xi({
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
Va.Content = Cm;
var Ja = class extends k {
  constructor() {
    super(...arguments), this.files = new Va(this._client);
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
Ja.Files = Va;
var wm = class extends k {
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
    return this._client.getAPIList(T`/conversations/${e}/items`, we, {
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
}, Ka = class extends k {
  constructor() {
    super(...arguments), this.items = new wm(this._client);
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
Ka.Items = wm;
var Im = class extends k {
  create(e, t) {
    const n = !!e.encoding_format;
    let r = n ? e.encoding_format : "base64";
    n && Ee(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const o = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: r
      },
      ...t,
      __security: { bearerAuth: !0 }
    });
    return n ? o : (Ee(this._client).debug("embeddings/decoding base64 embeddings from base64"), o._thenUnwrap((i) => (i && i.data && i.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = rb(u);
    }), i)));
  }
}, bm = class extends k {
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
}, Wa = class extends k {
  constructor() {
    super(...arguments), this.outputItems = new bm(this._client);
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
Wa.OutputItems = bm;
var za = class extends k {
  constructor() {
    super(...arguments), this.runs = new Wa(this._client);
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
za.Runs = Wa;
var Pm = class extends k {
  create(e, t) {
    return this._client.post("/files", ht({
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
      if (await no(t), i = await this.retrieve(e), Date.now() - o > n) throw new xa({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, Rm = class extends k {
}, xm = class extends k {
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
}, Ya = class extends k {
  constructor() {
    super(...arguments), this.graders = new xm(this._client);
  }
};
Ya.Graders = xm;
var Mm = class extends k {
  create(e, t, n) {
    return this._client.getAPIList(T`/fine_tuning/checkpoints/${e}/permissions`, qt, {
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
    return this._client.getAPIList(T`/fine_tuning/checkpoints/${e}/permissions`, we, {
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
}, Xa = class extends k {
  constructor() {
    super(...arguments), this.permissions = new Mm(this._client);
  }
};
Xa.Permissions = Mm;
var Nm = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/fine_tuning/jobs/${e}/checkpoints`, ne, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Qa = class extends k {
  constructor() {
    super(...arguments), this.checkpoints = new Nm(this._client);
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
Qa.Checkpoints = Nm;
var Kn = class extends k {
  constructor() {
    super(...arguments), this.methods = new Rm(this._client), this.jobs = new Qa(this._client), this.checkpoints = new Xa(this._client), this.alpha = new Ya(this._client);
  }
};
Kn.Methods = Rm;
Kn.Jobs = Qa;
Kn.Checkpoints = Xa;
Kn.Alpha = Ya;
var km = class extends k {
}, Za = class extends k {
  constructor() {
    super(...arguments), this.graderModels = new km(this._client);
  }
};
Za.GraderModels = km;
var Dm = class extends k {
  createVariation(e, t) {
    return this._client.post("/images/variations", ht({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", ht({
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
}, $m = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", qt, {
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
}, Lm = class extends k {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Um = class extends k {
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
}, Fm = class extends k {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, $i = class extends k {
  constructor() {
    super(...arguments), this.clientSecrets = new Fm(this._client), this.calls = new Um(this._client);
  }
};
$i.ClientSecrets = Fm;
$i.Calls = Um;
function ob(e, t) {
  return !t || !sb(t) ? {
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
  } : Om(e, t);
}
function Om(e, t) {
  const n = e.output.map((o) => {
    if (o.type === "function_call") return {
      ...o,
      parsed_arguments: ub(t, o)
    };
    if (o.type === "message") {
      const i = o.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: ib(t, a.text)
      } : a);
      return {
        ...o,
        content: i
      };
    }
    return o;
  }), r = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || ta(r), Object.defineProperty(r, "output_parsed", {
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
function ib(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function sb(e) {
  return !!Da(e.text?.format);
}
function ab(e) {
  return e?.$brand === "auto-parseable-tool";
}
function lb(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function ub(e, t) {
  const n = lb(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: ab(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function ta(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const r of n.content) r.type === "output_text" && t.push(r.text);
  e.output_text = t.join("");
}
var _n, Do, $t, $o, Td, Sd, Ed, Cd, cb = class qm extends La {
  constructor(t) {
    super(), _n.add(this), Do.set(this, void 0), $t.set(this, void 0), $o.set(this, void 0), V(this, Do, t, "f");
  }
  static createResponse(t, n, r) {
    const o = new qm(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), w(this, _n, "m", Td).call(this);
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
    for await (const u of i) w(this, _n, "m", Sd).call(this, u, a);
    if (i.controller.signal?.aborted) throw new Ze();
    return w(this, _n, "m", Ed).call(this);
  }
  [(Do = /* @__PURE__ */ new WeakMap(), $t = /* @__PURE__ */ new WeakMap(), $o = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakSet(), Td = function() {
    this.ended || V(this, $t, void 0, "f");
  }, Sd = function(n, r) {
    if (this.ended) return;
    const o = (a, u) => {
      (r == null || u.sequence_number > r) && this._emit(a, u);
    }, i = w(this, _n, "m", Cd).call(this, n);
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
  }, Ed = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = w(this, $t, "f");
    if (!n) throw new G("request ended without sending any events");
    V(this, $t, void 0, "f");
    const r = db(n, w(this, Do, "f"));
    return V(this, $o, r, "f"), r;
  }, Cd = function(n) {
    let r = w(this, $t, "f");
    if (!r) {
      if (n.type !== "response.created") throw new G(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return r = V(this, $t, n.response, "f"), r;
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
        V(this, $t, n.response, "f");
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
    const t = w(this, $o, "f");
    if (!t) throw new G("stream ended without producing a ChatCompletion");
    return t;
  }
};
function db(e, t) {
  return ob(e, t);
}
var Bm = class extends k {
  list(e, t = {}, n) {
    return this._client.getAPIList(T`/responses/${e}/input_items`, ne, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Gm = class extends k {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Li = class extends k {
  constructor() {
    super(...arguments), this.inputItems = new Bm(this._client), this.inputTokens = new Gm(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && ta(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(T`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((r) => ("object" in r && r.object === "response" && ta(r), r));
  }
  delete(e, t) {
    return this._client.delete(T`/responses/${e}`, {
      ...t,
      headers: F([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Om(n, e));
  }
  stream(e, t) {
    return cb.createResponse(this._client, e, t);
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
Li.InputItems = Bm;
Li.InputTokens = Gm;
var Hm = class extends k {
  retrieve(e, t) {
    return this._client.get(T`/skills/${e}/content`, {
      ...t,
      headers: F([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Vm = class extends k {
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(T`/skills/${r}/versions/${e}/content`, {
      ...n,
      headers: F([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, ja = class extends k {
  constructor() {
    super(...arguments), this.content = new Vm(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(T`/skills/${e}/versions`, xi({
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
ja.Content = Vm;
var Ui = class extends k {
  constructor() {
    super(...arguments), this.content = new Hm(this._client), this.versions = new ja(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", xi({
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
Ui.Content = Hm;
Ui.Versions = ja;
var Jm = class extends k {
  create(e, t, n) {
    return this._client.post(T`/uploads/${e}/parts`, ht({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, el = class extends k {
  constructor() {
    super(...arguments), this.parts = new Jm(this._client);
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
el.Parts = Jm;
var fb = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((o) => o.status === "rejected");
  if (n.length) {
    for (const o of n) console.error(o.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const r = [];
  for (const o of t) o.status === "fulfilled" && r.push(o.value);
  return r;
}, Km = class extends k {
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
          await no(a);
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
    return await fb(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, Wm = class extends k {
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
          await no(a);
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
    return this._client.getAPIList(T`/vector_stores/${r}/files/${e}/content`, qt, {
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Fi = class extends k {
  constructor() {
    super(...arguments), this.files = new Wm(this._client), this.fileBatches = new Km(this._client);
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
    return this._client.getAPIList(T`/vector_stores/${e}/search`, qt, {
      body: t,
      method: "post",
      ...n,
      headers: F([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Fi.Files = Wm;
Fi.FileBatches = Km;
var zm = class extends k {
  create(e, t) {
    return this._client.post("/videos", ht({
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
    return this._client.getAPIList("/videos", we, {
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
    return this._client.post("/videos/characters", ht({
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
    return this._client.post("/videos/edits", ht({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", ht({
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
    return this._client.post(T`/videos/${e}/remix`, xi({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Cn, Ym, Xo, Xm = class extends k {
  constructor() {
    super(...arguments), Cn.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
    return await this.verifySignature(e, t, n, r), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    w(this, Cn, "m", Ym).call(this, n);
    const o = F([t]).values, i = w(this, Cn, "m", Xo).call(this, o, "webhook-signature"), a = w(this, Cn, "m", Xo).call(this, o, "webhook-timestamp"), u = w(this, Cn, "m", Xo).call(this, o, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new Tr("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > r) throw new Tr("Webhook timestamp is too old");
    if (c > d + r) throw new Tr("Webhook timestamp is too new");
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
    throw new Tr("The given webhook signature does not match the expected signature");
  }
};
Cn = /* @__PURE__ */ new WeakSet(), Ym = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, Xo = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const r = t.get(n);
  if (r == null) throw new Error(`Missing required header: ${n}`);
  return r;
};
var na, tl, Qo, Qm, hb = "workload-identity-auth", W = class {
  constructor({ baseURL: e = Dt("OPENAI_BASE_URL"), apiKey: t = Dt("OPENAI_API_KEY") ?? null, adminAPIKey: n = Dt("OPENAI_ADMIN_KEY") ?? null, organization: r = Dt("OPENAI_ORG_ID") ?? null, project: o = Dt("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = Dt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: a, ...u } = {}) {
    na.add(this), Qo.set(this, void 0), this.completions = new Em(this), this.chat = new Fa(this), this.embeddings = new Im(this), this.files = new Pm(this), this.images = new Dm(this), this.audio = new oo(this), this.moderations = new Lm(this), this.models = new $m(this), this.fineTuning = new Kn(this), this.graders = new Za(this), this.vectorStores = new Fi(this), this.webhooks = new Xm(this), this.beta = new Jn(this), this.batches = new mm(this), this.uploads = new el(this), this.admin = new Ga(this), this.responses = new Li(this), this.realtime = new $i(this), this.conversations = new Ka(this), this.evals = new za(this), this.containers = new Ja(this), this.skills = new Ui(this), this.videos = new zm(this);
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
    if (!c.dangerouslyAllowBrowser && dI()) throw new G(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? tl.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = ld(c.logLevel, "ClientOptions.logLevel", this) ?? ld(Dt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? mp(), V(this, Qo, gI, "f");
    const h = Dt("OPENAI_CUSTOM_HEADERS");
    if (h) {
      const f = {};
      for (const p of h.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (f[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = F([f, c.defaultHeaders]);
    }
    this._options = c, a && (this._workloadIdentityAuth = new DI(a, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = r, this.project = o, this.webhookSecret = i;
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
    return SI(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Sn}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${rp()}`;
  }
  makeStatusError(e, t, n, r) {
    return Ie.generate(e, t, n, r);
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
    const r = !w(this, na, "m", Qm).call(this) && n || this.baseURL, o = aI(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!Qc(i) || !Qc(a)) && (t = {
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
    return new Ip(this, this.makeRequest(e, t, void 0));
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
    if (Ee(this).debug(`[${c}] sending request`, Qt({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: i.headers
    })), r.signal?.aborted) throw new Ze();
    const f = r.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(a, i, u, p, f).catch(Bs), y = Date.now();
    if (m instanceof globalThis.Error) {
      const v = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new Ze();
      const E = qs(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return Ee(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - ${v}`), Ee(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (${v})`, Qt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: y - h,
          message: m.message
        })), this.retryRequest(r, t, n ?? c);
      throw Ee(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - error; no more retries left`), Ee(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (error; no more retries left)`, Qt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: y - h,
        message: m.message
      })), m instanceof pp || m instanceof iI ? m : E ? new xa() : new bi({
        message: pb(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([v]) => v === "x-request-id").map(([v, E]) => ", " + v + ": " + JSON.stringify(E)).join("")}] ${i.method} ${a} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${y - h}ms`;
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
        const L = `retrying, ${t} attempts remaining`;
        return await td(m.body), Ee(this).info(`${_} - ${L}`), Ee(this).debug(`[${c}] response error (${L})`, Qt({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: y - h
        })), this.retryRequest(r, t, n ?? c, m.headers);
      }
      const E = v ? "error; no more retries left" : "error; not retryable";
      Ee(this).info(`${_} - ${E}`);
      const b = await m.text().catch((L) => Bs(L).message), R = cI(b), P = R ? void 0 : b;
      throw Ee(this).debug(`[${c}] response error (${E})`, Qt({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: P,
        durationMs: Date.now() - h
      })), this.makeStatusError(m.status, R, P, m.headers);
    }
    return Ee(this).info(_), Ee(this).debug(`[${c}] response start`, Qt({
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
    return new MI(this, n, e);
  }
  async fetchWithAuth(e, t, n, r, o = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && o.bearerAuth) {
      const i = t.headers, a = i.get("Authorization");
      if (!a || a === `Bearer ${hb}`) {
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
    return await no(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: i, defaultBaseURL: a } = n, u = this.buildURL(o, i, a);
    "timeout" in n && uI("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
        ...mI(),
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
      body: yp(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...w(this, Qo, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
tl = W, Qo = /* @__PURE__ */ new WeakMap(), na = /* @__PURE__ */ new WeakSet(), Qm = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
W.OpenAI = tl;
W.DEFAULT_TIMEOUT = 6e5;
W.OpenAIError = G;
W.APIError = Ie;
W.APIConnectionError = bi;
W.APIConnectionTimeoutError = xa;
W.APIUserAbortError = Ze;
W.NotFoundError = ap;
W.ConflictError = lp;
W.RateLimitError = cp;
W.BadRequestError = op;
W.AuthenticationError = ip;
W.InternalServerError = dp;
W.PermissionDeniedError = sp;
W.UnprocessableEntityError = up;
W.InvalidWebhookSignatureError = Tr;
W.toFile = OI;
W.Completions = Em;
W.Chat = Fa;
W.Embeddings = Im;
W.Files = Pm;
W.Images = Dm;
W.Audio = oo;
W.Moderations = Lm;
W.Models = $m;
W.FineTuning = Kn;
W.Graders = Za;
W.VectorStores = Fi;
W.Webhooks = Xm;
W.Beta = Jn;
W.Batches = mm;
W.Uploads = el;
W.Admin = Ga;
W.Responses = Li;
W.Realtime = $i;
W.Conversations = Ka;
W.Evals = za;
W.Containers = Ja;
W.Skills = Ui;
W.Videos = zm;
function pb(e) {
  if (mb(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function mb(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const r = t;
    if (r.code === "UND_ERR_INVALID_ARG" && typeof r.message == "string" && r.message.includes("invalid onRequestStart method")) return !0;
    t = r.cause;
  }
  return !1;
}
function wd(e = "", t = 0) {
  let n = 0;
  for (let r = t - 1; r >= 0 && e[r] === "\\"; r -= 1) n += 1;
  return n % 2 === 1;
}
function gb(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function yb(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function _b(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function vb(e = "") {
  const t = String(e ?? "");
  let n = "", r = 0;
  for (; r < t.length; ) {
    const o = t.slice(r, r + 2), i = t.slice(r + 2, r + 6);
    if (o !== "\\u" || wd(t, r) || !gb(i)) {
      n += t[r] || "", r += 1;
      continue;
    }
    const a = r + 6, u = t.slice(a + 2, a + 6);
    if (yb(i) && t.slice(a, a + 2) === "\\u" && !wd(t, a) && _b(u)) {
      const c = Number.parseInt(i, 16), d = Number.parseInt(u, 16), h = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(h), r += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(i, 16)), r += 6;
  }
  return n;
}
function Ab(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), vb(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function Tb(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function nl(e = "", t = "", n = 0) {
  const r = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${Tb(t)}(?:\\\\?")?\\s*:`, "i"), o = String(e || "").slice(Math.max(0, n)).match(r);
  if (!o || o.index === void 0) return null;
  const i = o[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + o.index + i,
    end: Math.max(0, n) + o.index + o[0].length
  };
}
function Sb(e = "", t = [], n = 0) {
  return t.map((r) => nl(e, r, n)).filter(Boolean).sort((r, o) => r.index - o.index)[0] || null;
}
function st(e = "", t = "", n = []) {
  const r = String(e || ""), o = nl(r, t);
  if (!o) return;
  let i = o.end;
  for (; /\s/.test(r[i] || ""); ) i += 1;
  r[i] === '"' && (i += 1);
  const a = Sb(r, n.filter((d) => d !== t), i);
  let u = a ? a.index : r.length;
  if (a) {
    const d = r.lastIndexOf(",", a.index);
    d >= i && (u = d);
  }
  let c = r.slice(i, u).trim();
  return a || (c = c.replace(/\}\s*$/, "").trimEnd()), Ab(c);
}
function At(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var Mr = {
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
}, Eb = [
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
    const o = st(e, r, n);
    if (o !== void 0) return o;
  }
}
function Cb(e = "", t = "") {
  if (t === "Read") {
    const n = Mr.Read, r = {};
    return n.forEach((o, i) => {
      const a = st(e, o, n.slice(i + 1));
      a !== void 0 && (r[o] = At(a));
    }), r.filePath === void 0 && r.path !== void 0 && (r.filePath = r.path, delete r.path), r.filePath === void 0 && r.scope !== void 0 && (r.filePath = r.scope, delete r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "Write") {
    const n = {}, r = Id(e, ["filePath", "path"], ["content"]), o = st(e, "content", []);
    return r !== void 0 && (n.filePath = At(r)), o !== void 0 && (n.content = At(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, r = Id(e, ["filePath", "path"], ["edits"]), o = st(e, "edits", []);
    return r !== void 0 && (n.filePath = At(r)), o !== void 0 && (n.edits = At(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = Mr.Grep, r = {};
    return n.forEach((o) => {
      const i = st(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = At(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "MemoryGrep") {
    const n = Mr.MemoryGrep, r = {};
    return n.forEach((o) => {
      const i = st(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = At(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  if (t === "ChatHistory") {
    const n = Mr.ChatHistory, r = {};
    return n.forEach((o) => {
      const i = st(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = At(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  return null;
}
function wb(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const a = JSON.parse(n);
    if (a && typeof a == "object" && !Array.isArray(a)) return a;
  } catch {
  }
  const r = Cb(n, t);
  if (r) return r;
  const o = Mr[t] || Eb, i = {};
  return o.forEach((a, u) => {
    const c = st(n, a, o.slice(u + 1));
    c !== void 0 && (i[a] = At(c));
  }), Object.keys(i).length ? i : null;
}
function Ib(e = "", t = "") {
  const n = wb(e, t);
  return n ? JSON.stringify(n) : "";
}
function Zm(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function it(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function $e(e) {
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
function jm(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function eg(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : jm(e);
  return Ib(n, t) || JSON.stringify(Zm(n));
}
function bb(e = "") {
  const t = String(e || ""), n = nl(t, "arguments");
  if (!n) return "";
  let r = n.end;
  for (; /\s/.test(t[r] || ""); ) r += 1;
  const o = t[r] || "";
  return o === "{" ? t.slice(r).replace(/\}\s*$/, "").trimEnd() : o === '"' ? t.slice(r + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(r).replace(/\}\s*$/, "").trimEnd();
}
function Pb(e = "", t = 0) {
  const n = String(e || "").trim(), r = st(n, "name", ["id", "arguments"]) || st(n, "toolName", ["id", "arguments"]) || "", o = st(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, i = bb(n);
  return !r || !i ? null : {
    id: o,
    name: r,
    arguments: eg(i, r)
  };
}
function Rb(e, t = 0, n = "openai-tool") {
  if (!te(e)) return null;
  const r = te(e.function) ? e.function : null, o = String(r?.name || "").trim();
  if (!o) return null;
  const i = $e(e) || {};
  return delete i.index, i.id = String(i.id || `${n}-${t + 1}`), i.type = "function", i.function = {
    ...$e(r) || {},
    name: o,
    arguments: jm(r.arguments)
  }, i;
}
function Hr(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, r) => Rb(n, r, t)).filter(Boolean);
}
function Vr(e, t) {
  return Array.isArray(e) ? e.some((n) => Vr(n, t)) : te(e) ? Object.entries(e).some(([n, r]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(r) : (Array.isArray(r) || te(r)) && Vr(r, t)) : !1;
}
function xb(e) {
  return Vr(e, (t) => typeof t == "string" && t.length > 0);
}
function ra(e) {
  return Vr(e, () => !0);
}
function Mb(e) {
  return Vr(e, (t) => typeof t != "string" || t.length === 0);
}
function Nb(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => xb(t));
}
var bd = /* @__PURE__ */ new WeakSet();
function rl(e) {
  if (!te(e)) return null;
  const t = $e(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = tn(en(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = Hr(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function ol(e = [], t = "openai-tool") {
  return Hr(e, t).map((n, r) => ({
    id: n.id || `${t}-${Date.now()}-${r + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function il(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function en(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, r) => (it(t, "思考块", r), "")).trim(),
    thoughts: t
  };
}
function tn(e = "") {
  const t = String(e || ""), n = t.search(/<tool_call\b/i);
  return n < 0 ? t.trim() : t.slice(0, n).trim();
}
function oa(e = "") {
  const t = String(e || "");
  return /<tool_call\b/i.test(t) ? [{
    id: "tagged-json-draft",
    name: t.match(/["']?name["']?\s*:\s*["']([^"']+)/i)?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }] : [];
}
function Zt(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      it(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((r) => Zt(e, r, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && it(e, n, t.text), typeof t.content == "string" && it(e, n, t.content), typeof t.reasoning_content == "string" && it(e, n, t.reasoning_content), typeof t.thinking == "string" && it(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((r) => {
      if (typeof r == "string") {
        it(e, "推理摘要", r);
        return;
      }
      r && typeof r == "object" && it(e, "推理摘要", r.text || r.content || "");
    }));
  }
}
function Lt(e = {}, t = {}) {
  const n = [];
  return Zt(n, e.reasoning_content, "推理文本"), Zt(n, e.reasoning, "推理文本"), Zt(n, e.reasoning_text, "推理文本"), Zt(n, e.thinking, "思考块"), Zt(n, t.reasoning_content, "推理文本"), Zt(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        it(n, "推理文本", r.text);
        return;
      }
      if (r.type === "summary_text") {
        it(n, "推理摘要", r.text);
        return;
      }
      (r.type === "thinking" || r.type === "reasoning" || r.type === "reasoning_content") && it(n, "思考块", r.text || r.content || r.reasoning || "");
    }
  }), n;
}
function Ur(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((r) => {
    [...e.matchAll(r)].forEach((o, i) => {
      try {
        const a = JSON.parse(o[1]);
        n.push({
          id: a.id || `tool-call-${i + 1}`,
          name: String(a.name || ""),
          arguments: eg(a.arguments, a.name)
        });
      } catch {
        const a = Pb(o[1], i);
        a && n.push(a);
      }
    });
  }), n.filter((r) => r.name);
}
function sl(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : rl(t);
}
function kb(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function Db(e = {}) {
  const t = Hr(e?.tool_calls);
  if (t.length) return t;
  const n = Hr(sl(e)?.tool_calls);
  return n.length ? n : [];
}
function $b(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function Lb(e = "") {
  return /claude/i.test(String(e || ""));
}
function Ub(e = "") {
  return Aa(e) === "openai";
}
function tg(e = {}, t = {}) {
  return t.mode !== "on" && t.mode !== "off" ? e : t.profileId === "kimi-k3" ? (e.reasoning_effort = t.mode === "off" ? "off" : t.effort, e) : t.profileId === "deepseek-thinking" ? (e.thinking = { type: t.mode === "off" ? "disabled" : "enabled" }, t.mode === "on" && (e.reasoning_effort = t.effort), e) : (String(t.profileId || "").startsWith("openai-") && (e.reasoning_effort = t.mode === "off" ? "none" : t.effort), e);
}
function ng(e = [], t = "") {
  if (!Lb(t)) return e;
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
function Pd(e, t = "") {
  return !te(e) || !$b(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var ia = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function Fb(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((r) => $e(r) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((r, o) => {
    const i = $e(r) || {}, a = Number.isInteger(Number(r?.index)) ? Number(r.index) : o, u = n[a];
    n[a] = te(u) ? io(u, i, "tool_call") : i;
  }), n.filter((r) => r !== void 0);
}
function io(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return $e(t);
  if (t === null && ia.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return Fb(e, t);
  if (typeof e == "string" && typeof t == "string")
    return ia.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : $e(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat($e(t) || []);
  if (te(e) && te(t)) {
    const r = { ...e };
    return Object.entries(t).forEach(([o, i]) => {
      r[o] = io(r[o], i, o);
    }), r;
  }
  return $e(t);
}
function hi(e = {}, t = {}) {
  const n = te(e) ? $e(e) || {} : {}, r = te(t) ? $e(t) || {} : {};
  return delete r.message, delete r.finish_reason, delete r.index, delete r.logprobs, delete r.delta, Object.entries(r).forEach(([o, i]) => {
    n[o] = io(n[o], i, o);
  }), n.role || (n.role = "assistant"), rl(n) || { role: "assistant" };
}
function Fr(e, t = {}) {
  const n = rl(hi(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function Ob(e = {}, t = {}) {
  return te(e) ? te(t) ? io($e(e) || {}, t, "") : $e(e) : $e(t);
}
function sa(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], r = kb(n), o = [];
  let i = !1;
  n.forEach((u, c) => {
    if (i) {
      if (u?.role === "tool") return;
      i = !1;
    }
    const d = u?.role === "assistant", h = d ? u?.providerPayload?.openaiCompatibleMessage : null, f = og(Array.isArray(h?.tool_calls) && h.tool_calls.some((E) => ra(E)) ? h.tool_calls : d && Array.isArray(u?.tool_calls) && u.tool_calls.some((E) => ra(E)) ? u.tool_calls : null);
    if (f) {
      const E = te(h) ? h : u;
      (!te(E) || !bd.has(E)) && (te(E) && bd.add(E), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: f.index,
        toolName: f.toolName,
        reason: f.reason
      })), i = !0;
      return;
    }
    const p = d ? Hr(u?.tool_calls) : [], m = d ? sl(u) : null, y = Array.isArray(m?.tool_calls) ? m.tool_calls : [], _ = y.length > 0 && Nb(m);
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
  }), ng(o, t);
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
function aa(e, t = "") {
  const n = /* @__PURE__ */ new Map(), r = [];
  return (Array.isArray(e.messages) ? e.messages : []).forEach((o) => {
    if (o.role === "assistant") {
      const i = Db(o);
      if (i.length) {
        const a = sl(o), u = typeof a?.content == "string" ? a.content : String(o.content || ""), c = i.map((d, h) => {
          const f = d.function?.name || "", p = d.id || `tool-call-${h + 1}`;
          return f && n.set(p, f), `<tool_call>${JSON.stringify({
            id: p,
            name: f,
            arguments: Zm(d.function?.arguments || "{}")
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
    content: Rd(e)
  }) : r[0] = {
    ...r[0],
    content: Rd({
      ...e,
      systemPrompt: r[0].content || e.systemPrompt
    })
  }, ng(r, t);
}
function xd(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: Z(e.reasoning) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function pr(e, t = []) {
  return Z(e.reasoning) ? t : [];
}
function rg(e, t, n) {
  !e || !t || n === void 0 || (e[t] = io(e[t], n, t));
}
function pi(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (te(n)) {
      const r = te(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([o, i]) => {
        pi(r, o, i);
      }), e[t] = r;
      return;
    }
    if (typeof n == "string" && ia.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || rg(e, t, n);
  }
}
function qb(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const r = Number(n?.index ?? 0), o = { ...e.tool_calls[r] || {} };
    Object.entries(n || {}).forEach(([i, a]) => {
      if (i !== "index" && !(i === "function" && a == null)) {
        if (i === "function" && te(a)) {
          o.function = te(o.function) ? { ...o.function } : {}, Object.entries(a).forEach(([u, c]) => {
            pi(o.function, u, c);
          });
          return;
        }
        pi(o, i, a);
      }
    }), e.tool_calls[r] = o;
  }));
}
function la(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([r, o]) => {
    r === "delta" || r === "finish_reason" || r === "index" || r === "logprobs" || rg(e, r, o);
  });
  const n = te(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([r, o]) => {
    if (r === "tool_calls") {
      qb(e, o);
      return;
    }
    pi(e, r, o);
  });
}
function Mn(e = {}) {
  return il(e?.content);
}
function Nn(e = {}) {
  return ol(e?.tool_calls || []);
}
function Bb(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return te(JSON.parse(e));
  } catch {
    return !1;
  }
}
function og(e) {
  if (!Array.isArray(e) || !e.some((t) => ra(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], r = te(n?.function) ? n.function : null, o = String(r?.name || "").trim();
    let i = "";
    if (!te(n) || !r ? i = "invalid_function_shape" : o ? Bb(r.arguments) ? Mb(n) && (i = "invalid_thought_signature") : i = "invalid_function_arguments" : i = "missing_function_name", i) return {
      index: t,
      toolName: o,
      reason: i
    };
  }
  return null;
}
function kn(e = {}) {
  const t = og(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function Gb(e, t) {
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
var Hb = class {
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
    const t = Me("openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, r = !n && Array.isArray(e.tools) && e.tools.length ? e.tools : null, o = {
      model: this.config.model,
      messages: n ? aa(e, this.config.model) : sa(e, this.config.model),
      ...r ? {
        tools: r,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? Ub(this.config.model) ? { max_completion_tokens: e.maxTokens } : { max_tokens: e.maxTokens } : {}
    };
    return !jr({
      ...this.config,
      provider: "openai-compatible"
    }, t) && typeof e.temperature == "number" && (o.temperature = e.temperature), tg(o, t);
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = {
      ...t.body || this.buildRequestBody(e),
      ...n ? { stream: !0 } : {}
    }, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = Me("openai-compatible", this.config, e.reasoning), a = {
      ...Object.hasOwn(r, "reasoning_effort") ? { reasoning_effort: r.reasoning_effort } : {},
      ...Object.hasOwn(r, "thinking") ? { thinking: r.thinking } : {}
    };
    return { ...Br({
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
      effectiveConfig: Ot(e, {
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
    await Gb(r, (m) => {
      a = m?.model || a;
      const y = m?.choices?.[0];
      la(o, y), y?.finish_reason && (i = y.finish_reason);
      const _ = en(Mn(o)), v = Nn(o), E = v.length ? v : oa(_.cleaned);
      xd(e, {
        text: v.length ? _.cleaned : tn(_.cleaned),
        thoughts: pr(e, Lt(o, y).concat(_.thoughts)),
        ...E.length ? { toolCalls: E } : {},
        ...!v.length && E.length ? { toolCallDraft: !0 } : {}
      });
    }), kn(o);
    const u = Fr(o), c = Nn(o), d = en(Mn(o)), h = Lt(o, {});
    d.thoughts.forEach((m) => h.push(m));
    const f = c.length ? [] : Ur(d.cleaned), p = [...c, ...f];
    return {
      text: c.length ? d.cleaned : tn(d.cleaned),
      toolCalls: p,
      thoughts: pr(e, h),
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
        la(E, j), j?.finish_reason && (b = j.finish_reason);
        const X = en(Mn(E)), Te = Nn(E), ze = Te.length ? Te : oa(X.cleaned);
        xd(e, {
          text: Te.length ? X.cleaned : tn(X.cleaned),
          thoughts: pr(e, Lt(E, j).concat(X.thoughts)),
          ...ze.length ? { toolCalls: ze } : {},
          ...!Te.length && ze.length ? { toolCallDraft: !0 } : {}
        });
      }
      const L = (typeof v.finalChatCompletion == "function" ? await v.finalChatCompletion() : null)?.choices?.[0] || null, S = L?.message || E;
      kn(S);
      const O = Ob(E, hi(S, L || {}));
      kn(O), P = Fr(O);
      const x = Nn(O), D = en(Mn(O)), H = Lt(O, L || {});
      D.thoughts.forEach((Q) => H.push(Q));
      const z = x.length ? [] : Ur(D.cleaned), ge = [...x, ...z];
      return {
        text: x.length ? D.cleaned : tn(D.cleaned),
        toolCalls: ge,
        thoughts: pr(e, H),
        finishReason: b,
        model: R,
        provider: "openai-compatible",
        providerPayload: P,
        requestInspection: o
      };
    }
    const a = await i((v) => this.client.chat.completions.create(v, { signal: e.signal })), u = a.choices?.[0] || {}, c = u.message || {};
    kn(c);
    const d = Lt(c, u), h = ol(c.tool_calls || []), f = en(il(c.content));
    f.thoughts.forEach((v) => d.push(v));
    const p = h.length ? [] : Ur(f.cleaned), m = [...h, ...p], y = h.length ? f.cleaned : tn(f.cleaned), _ = hi(c, u);
    return {
      text: y,
      toolCalls: m,
      thoughts: pr(e, d),
      finishReason: u.finish_reason || "stop",
      model: a.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: Fr(_),
      requestInspection: o
    };
  }
};
function al(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function ig(e, t) {
  return {
    type: "message",
    role: e,
    content: Vb(t)
  };
}
function mi(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function Vb(e) {
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
function gi(e, t, n) {
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
        gi(e, n.reasoning || "推理文本", r.text);
        return;
      }
      r.type === "summary_text" && gi(e, n.summary || "推理摘要", r.text);
    }
  });
}
function Jb(e = []) {
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
function Kb(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function Wb(e) {
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
function zb(e) {
  const t = e?.choices?.[0], n = t?.message?.content, r = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const o = n.toLowerCase();
  return !o.includes("proxy error") || !o.includes("/responses") && !r.toLowerCase().includes("proxy error") ? null : n.trim();
}
function Yb(e) {
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
        t.push(...al(n.providerPayload.openAIResponseOutput) || []);
        continue;
      }
      if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
        n.content?.trim() && t.push(mi(n.content)), n.tool_calls.forEach((r, o) => {
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
        t.push(mi(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? ig(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function Xb(e) {
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
      t.push(...al(n.providerPayload.openAIResponseOutput) || []);
      continue;
    }
    if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
      n.content?.trim() && t.push(mi(n.content)), n.tool_calls.forEach((r, o) => {
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
      t.push(mi(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? ig(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function Qb(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function Zb(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function jb(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function us(e, t) {
  const [n = "0", r = "0"] = String(e || "").split(":"), [o = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(o) || Number(r) - Number(i);
}
var e0 = class {
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
    const n = Me("openai-responses", this.config, e.reasoning), r = {
      model: this.config.model,
      instructions: t ? void 0 : Kb(e) || void 0,
      input: t ? Xb(e) : Yb(e),
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
    return !jr({
      ...this.config,
      provider: "openai-responses"
    }, n) && typeof e.temperature == "number" && (r.temperature = e.temperature), n.mode === "on" || n.mode === "off" ? r.reasoning = {
      effort: n.mode === "off" ? "none" : n.effort,
      ...n.mode === "on" && Z(n) ? { summary: "auto" } : {}
    } : Z(n) && (r.reasoning = { summary: "auto" }), n.mode !== "off" && n.profileId.startsWith("openai-") && (r.include = ["reasoning.encrypted_content"]), r;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = t.legacySystemInInput === !0, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = t.body || this.buildRequestBody(e, r), a = Me("openai-responses", this.config, e.reasoning);
    return Br({
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
      effectiveConfig: Ot(e, {
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
      const d = zb(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const h = Array.isArray(c.output) ? c.output : [];
      return {
        output: h,
        thoughts: Z(e.reasoning) ? Jb(h) : [],
        toolCalls: h.filter((f) => f.type === "function_call" && f.name).map((f, p) => ({
          id: f.call_id || `response-tool-${p + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: Wb(c)
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
        Z(e.reasoning) && (Array.from(p.entries()).sort(([v], [E]) => us(v, E)).forEach(([, v]) => gi(_, "推理文本", v)), Array.from(m.entries()).sort(([v], [E]) => us(v, E)).forEach(([, v]) => gi(_, "推理摘要", v))), jb(e, {
          text: Array.from(f.entries()).sort(([v], [E]) => us(v, E)).map(([, v]) => v).join(`
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
    }, i = !Qb(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await o(!1) : await r(!1), u = n(a), i && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), u = n(a));
    } catch (c) {
      if (!i || !Zb(c)) throw c;
      a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), u = n(a);
    }
    return {
      text: u.text,
      toolCalls: u.toolCalls,
      thoughts: u.thoughts,
      finishReason: a.incomplete_details?.reason || a.status || "stop",
      model: a.model || this.config.model,
      provider: "openai-responses",
      providerPayload: u.output.length ? { openAIResponseOutput: al(u.output) || [] } : void 0,
      requestInspection: t
    };
  }
};
async function t0(e, t) {
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
var Wn = "openai", ll = "claude", ul = "makersuite", n0 = "/api/backends/chat-completions/status", r0 = "/api/backends/chat-completions/generate", sg = Object.freeze({
  [ll]: "https://api.anthropic.com/v1",
  [ul]: "https://generativelanguage.googleapis.com"
}), ag = null;
function o0(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function i0(e = "") {
  return Aa(e) === "openai";
}
function s0(e, t) {
  const n = o0(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function a0(e) {
  ag = typeof e == "function" ? e : null;
}
async function lg() {
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(ag?.() || {}),
    Accept: "application/json"
  };
}
function l0(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : r;
  }), t;
}
async function so(e = {}, t = !1) {
  const n = await lg(), r = {
    url: r0,
    method: "POST",
    headers: l0(n),
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
function u0(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function c0(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function d0() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function Nd(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function kd(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => Nd(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => Nd(n));
}
function f0(e = "") {
  const t = String(e || ""), n = kd((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), r = kd(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), o = n || r;
  return o.length > 240 ? `${o.slice(0, 237)}...` : o;
}
function h0(e = null) {
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
function p0(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function Fn(e = "", t = "", n = null) {
  if (c0(e)) return d0();
  const r = h0(n);
  if (u0(e) || /\btext\/html\b/i.test(r.contentType)) {
    const o = p0(r), i = f0(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      o ? `（${o}）` : "",
      i ? `：${i}` : ""
    ].join("");
  }
  return String(e || t || "").trim();
}
function ug(e = {}, t = Wn) {
  const n = s0(e.baseUrl, t), r = String(e.apiKey || "").trim(), o = sg[t] || "", i = n || (r ? o : ""), a = { chat_completion_source: t || "openai" };
  return i && (a.reverse_proxy = i), r && (a.proxy_password = r), a;
}
function m0(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function g0(e = {}, t = Wn) {
  return ug(e, t);
}
function cl(e = {}, t = {}, n = [], r = !1, o = Wn) {
  const i = t.maxTokens, a = o === "openai" && i0(e.model);
  return m0({
    ...ug(e, o),
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
function y0(e = {}, t = {}, n = [], r = !1) {
  return cl(e, t, n, r, Wn);
}
function _0(e = {}, t = {}, n = [], r = !1) {
  return cl(e, t, n, r, ll);
}
function v0(e = {}, t = {}, n = [], r = !1) {
  return cl(e, t, n, r, ul);
}
async function A0(e = {}, t = Wn, n = {}) {
  const r = await fetch(n0, {
    method: "POST",
    headers: await lg(),
    body: JSON.stringify(g0(e, t)),
    signal: n.signal
  }), o = await r.text();
  let i = null;
  try {
    i = o ? JSON.parse(o) : {};
  } catch (u) {
    throw new Error(`酒馆后端模型列表拉取失败：${Fn(o, String(u?.message || u), r)}`);
  }
  if (!r.ok || i?.error) {
    const u = Fn(i?.message || i?.error?.message || o, `HTTP ${r.status}`, r);
    throw new Error(`酒馆后端模型列表拉取失败：${u}`);
  }
  const a = Array.isArray(i?.data) ? i.data.map((u) => String(u?.id || u?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(a)];
}
async function dl(e = {}, t = {}) {
  const n = await so(e, !1);
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
    const u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${Fn(o, String(a?.message || a), r)}`);
    throw u.status = r.status, u.body = o, u;
  }
  if (!r.ok || i?.error) {
    const a = Fn(i?.error?.message || i?.message || o, `HTTP ${r.status}`, r), u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${a}`);
    throw u.status = r.status, u.error = i?.error, u;
  }
  return i;
}
async function fl(e = {}, t, n = {}) {
  const r = await so(e, !0);
  typeof n.onRequest == "function" && n.onRequest(r);
  const o = await fetch(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!o.ok) {
    const i = await o.text().catch(() => ""), a = new Error(Fn(i, `酒馆后端流式生成失败：HTTP ${o.status}`, o));
    throw a.status = o.status, a.body = i, a;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await t0(o, (i) => {
    if (i?.error) {
      const a = Fn(i.error?.message || i.message || JSON.stringify(i.error), "酒馆后端流式生成失败");
      throw new Error(a);
    }
    t(i);
  });
}
function un(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function T0(e) {
  const t = String(e || "").trim();
  if (!t || t === "auto") return "auto";
  if (t === "required") return "any";
  if (t === "none") return "none";
  throw new Error(`酒馆托管 Claude 不支持 tool_choice：${t}。仅支持 auto/required/none。`);
}
function S0(e = {}, t = {}) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const n = T0(t.toolChoice), r = Me("sillytavern-claude", e, t.reasoning), o = r.profileId === "sillytavern-claude-manual" || r.profileId === "sillytavern-claude-adaptive-conditional";
  return {
    toolChoice: n,
    reasoningDisabledForForcedTool: n === "any" && r.mode === "on" && o
  };
}
var E0 = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function C0(e = {}, t = {}, n = {}) {
  const r = Me("sillytavern-claude", e, t.reasoning), o = n.reasoningDisabledForForcedTool ? "off" : r.mode;
  return Ot(t, {
    profileId: r.profileId,
    effectiveMode: o,
    effort: o === "on" ? r.effort : "",
    controlFields: n.controlFields || {}
  });
}
function w0(e = {}, t = {}) {
  return { toolChoice: String(t.toolChoice || "") };
}
function cg(e = "") {
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
function I0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const r = cg(t.function.arguments || "{}");
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
function b0(e = []) {
  const t = Array.isArray(e) ? un(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function P0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const i = un(o) || {}, a = b0(i?.providerPayload?.anthropicContent), u = I0(i.tool_calls);
    delete i.providerPayload, i.role === "assistant" && a && u.length ? (delete i.tool_calls, i.content = a.filter((c) => c?.type !== "tool_use").concat(u)) : i.role === "assistant" && a && (delete i.tool_calls, i.content = a), n.push(i);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function R0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const r = cg(t.inputJson);
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
      const n = un(t.input);
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
    } : un(t) || null;
  }).filter(Boolean);
}
function x0(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: un(t.input) || {}
  } : un(t) || null).filter(Boolean);
}
function M0(e = []) {
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
function dg(e = [], t = {}) {
  const n = R0(e), r = n.filter((o) => o.type === "tool_use" && o.name).map((o, i) => ({
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
    providerPayload: n.length ? { anthropicContent: x0(n) } : void 0
  };
}
function N0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function k0(e, t = {}) {
  const n = [];
  let r = "stop", o = t.model || "";
  const i = (u, c = {}) => {
    const d = Number.isInteger(Number(u)) ? Number(u) : n.length;
    return n[d] ? n[d] = {
      ...n[d],
      ...c
    } : n[d] = { ...c }, n[d];
  }, a = () => {
    const u = M0(n);
    N0(e, {
      text: u.text,
      thoughts: Z(e.reasoning) ? u.thoughts : [],
      ...Array.isArray(u.toolCalls) ? { toolCalls: u.toolCalls } : {},
      ...u.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(u = {}) {
      if (u?.message?.model && (o = u.message.model), u.type === "content_block_start") {
        i(u.index, un(u.content_block) || {}), a();
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
      return dg(n, {
        finishReason: r,
        model: o,
        includeReasoningOutput: Z(e.reasoning)
      });
    }
  };
}
var D0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return P0(e);
  }
  resolveToolProtocol(e) {
    return S0(this.config, e);
  }
  buildPayload(e, t = this.resolveToolProtocol(e)) {
    const n = Me("sillytavern-claude", this.config, e.reasoning), r = typeof e.onStreamProgress == "function", o = this.buildMessages(e), i = t.reasoningDisabledForForcedTool ? {
      ...n,
      mode: "off"
    } : n, a = {
      ...e,
      toolChoice: t.toolChoice,
      reasoning: i,
      temperature: jr({
        ...this.config,
        provider: "sillytavern-claude"
      }, i) ? void 0 : e.temperature
    }, u = _0(this.config, a, o, r);
    return i.mode === "on" ? (u.reasoning_effort = i.effort, u.include_reasoning = Z(i)) : i.mode === "off" ? (u.reasoning_effort = "auto", u.include_reasoning = !1) : (u.reasoning_effort = "auto", u.include_reasoning = Z(i)), u;
  }
  async inspectRequest(e, t = {}) {
    const n = this.resolveToolProtocol(e), r = await so(t.payload || this.buildPayload(e, n), typeof e.onStreamProgress == "function");
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
      request: ln(e),
      effectiveConfig: {
        ...w0(n, t),
        ...C0(this.config, n, {
          ...t,
          controlFields: r
        })
      },
      ...t.reasoningDisabledForForcedTool ? { notices: [E0] } : {}
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
        const u = k0(e, this.config);
        return await fl(r, (c) => {
          u.accept(c);
        }, {
          signal: e.signal,
          onRequest: i
        }), {
          ...u.result(),
          requestInspection: o
        };
      }
      const a = await dl(r, {
        signal: e.signal,
        onRequest: i
      });
      return {
        ...dg(Array.isArray(a?.content) ? a.content : [{
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
function hl(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function On(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = hl(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function $0(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((o) => On(o)).filter((o) => Array.isArray(o.parts) && o.parts.length);
  const n = e?.providerPayload?.googleContent, r = On(n);
  return r.parts.length ? [r] : [];
}
function L0(e = {}) {
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
function U0(e = {}, t = 0) {
  const n = On(e);
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
    const u = L0(a.inlineData);
    u && r.content.push(u);
  }), i.length && r.content.push({
    type: "tool_calls",
    tool_calls: i
  }), o && r.content.some((a) => a?.type === "text") && (r.signature = o), r.content.length ? r : null;
}
function F0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const i = $0(o);
    if (o.role === "assistant" && i.length) {
      i.forEach((u, c) => {
        const d = U0(u, c);
        d && n.push(d);
      });
      return;
    }
    const a = hl(o) || {};
    delete a.providerPayload, n.push(a);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function fg(e = {}) {
  return On(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function hg(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function pg(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function mg(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function O0(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
function q0(e = [], t = []) {
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
function gg(e) {
  const t = On(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function B0(e = {}, t = {}) {
  const n = fg(e), r = e?.choices?.[0]?.message?.content || "";
  return {
    text: hg(n) || r,
    toolCalls: mg(n),
    thoughts: t.includeReasoningOutput === !1 ? [] : pg(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: gg(n)
  };
}
function G0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function H0(e, t = {}) {
  let n = "", r = [], o = [], i = "STOP", a = t.model || "";
  const u = [];
  return {
    accept(c = {}) {
      a = c.model || c.modelVersion || a, i = c?.candidates?.[0]?.finishReason || i;
      const d = fg(c);
      d.parts.length && u.push(...hl(d.parts) || []), n = O0(n, hg(d)), r = q0(r, mg(d));
      const h = Z(e.reasoning) ? pg(d) : [];
      h.length && (o = h), G0(e, {
        text: n,
        thoughts: o,
        ...r.length ? {
          toolCalls: r,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const c = On({
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
        providerPayload: gg(c)
      };
    }
  };
}
var V0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return F0(e);
  }
  buildPayload(e) {
    const t = Me("sillytavern-google", this.config, e.reasoning), n = typeof e.onStreamProgress == "function", r = this.buildMessages(e), o = v0(this.config, e, r, n);
    return t.mode === "on" ? (o.reasoning_effort = t.effort, o.include_reasoning = Z(t)) : t.mode === "off" ? (o.reasoning_effort = "min", o.include_reasoning = !1) : (o.reasoning_effort = "auto", o.include_reasoning = Z(t)), o;
  }
  async inspectRequest(e, t = {}) {
    const n = await so(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = Me("sillytavern-google", this.config, t.reasoning), r = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: ln(e),
      effectiveConfig: Ot(t, {
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
        const i = H0(e, this.config);
        return await fl(n, (a) => {
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
        ...B0(await dl(n, {
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
function J0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: Z(e.reasoning) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function cs(e, t = []) {
  const n = en(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : tn(n.cleaned)
  };
}
function K0(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var W0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? aa(e, this.config.model) : sa(e, this.config.model);
  }
  buildPayload(e, t = !1) {
    const n = Me("sillytavern-openai-compatible", this.config, e.reasoning), r = t ? aa(e, this.config.model) : sa(e, this.config.model), o = {
      ...e,
      temperature: jr({
        ...this.config,
        provider: "sillytavern-openai-compatible"
      }, n) ? void 0 : e.temperature
    };
    return tg(y0(this.config, t ? {
      ...o,
      tools: void 0,
      toolChoice: void 0
    } : o, r, typeof e.onStreamProgress == "function"), n);
  }
  async inspectRequest(e, t = {}) {
    const n = await so(t.payload || this.buildPayload(e, !!t.taggedMode), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = Me("sillytavern-openai-compatible", this.config, t.reasoning), r = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "thinking") ? { thinking: e.body.thinking } : {}
    };
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: ln(e),
      effectiveConfig: Ot(t, {
        profileId: n.profileId,
        effectiveMode: n.mode,
        effort: e?.body?.reasoning_effort,
        controlFields: r
      })
    };
  }
  async streamChat(e, t, n = {}) {
    const r = { role: "assistant" };
    let o = "stop", i = this.config.model;
    await fl(t, (f) => {
      i = f?.model || i;
      const p = f?.choices?.[0] || {};
      la(r, p), p.finish_reason && (o = p.finish_reason);
      const m = Nn(r), { thinkTagged: y, cleanedText: _ } = cs(Mn(r), m), v = m.length ? m : oa(y.cleaned);
      J0(e, {
        text: _,
        thoughts: Z(e.reasoning) ? Lt(r, p).concat(y.thoughts) : [],
        ...v.length ? { toolCalls: v } : {},
        ...!m.length && v.length ? { toolCallDraft: !0 } : {}
      });
    }, {
      signal: e.signal,
      onRequest: n.onRequest,
      onResponseAccepted: n.onResponseAccepted
    }), kn(r);
    const a = Nn(r), { thinkTagged: u, cleanedText: c } = cs(Mn(r), a), d = Lt(r, {});
    u.thoughts.forEach((f) => d.push(f));
    const h = a.length ? [] : Ur(u.cleaned);
    return {
      text: c,
      toolCalls: [...a, ...h],
      thoughts: Z(e.reasoning) ? d : [],
      finishReason: o,
      model: i,
      provider: "sillytavern-openai-compatible",
      providerPayload: Fr(r)
    };
  }
  async nonStreamingChat(e, t, n = {}) {
    const r = await dl(t, {
      signal: e.signal,
      onRequest: n.onRequest
    }), o = r.choices?.[0] || {}, i = o.message || {};
    kn(i);
    const a = Lt(i, o), u = ol(i.tool_calls || []), { thinkTagged: c, cleanedText: d } = cs(il(i.content), u);
    c.thoughts.forEach((p) => a.push(p));
    const h = u.length ? [] : Ur(c.cleaned), f = hi(i, o);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: Z(e.reasoning) ? a : [],
      finishReason: o.finish_reason || "stop",
      model: r.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: Fr(f)
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
      if (e.allowToolProtocolFallback === !1 || t || !n || !K0(i)) throw i;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await r(this.buildPayload(e, !0));
  }
}, Dd = 900 * 1e3, $d = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), z0 = Object.freeze([
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
function Y0(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function He(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, r = Number(n);
  return Number.isFinite(r) ? Math.max(0, Math.min(2, r)) : He(t, 1);
}
function Un(e = {}) {
  return e.sendTemperature !== !1;
}
function Ld(e = {}) {
  return Un(e) ? He(e.temperature, 1) : void 0;
}
function Ud(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : z0.find((n) => n.value === e)?.label || e || "未配置";
}
function X0(e = {}, t = {}) {
  const n = hs(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const d = n.delegateConfig.provider || "openai-compatible", h = (n.delegateConfig.modelConfigs || wn())[d] || wn()[d] || {}, f = {
      provider: d,
      baseUrl: String(h.baseUrl || ""),
      model: String(h.model || ""),
      maxTokens: le(h.maxTokens)
    };
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: d,
      baseUrl: String(h.baseUrl || ""),
      model: String(h.model || ""),
      apiKey: String(h.apiKey || ""),
      tavilyApiKey: ds(n.tavilyApiKey),
      tavilyBaseUrl: Qe(n.tavilyBaseUrl),
      temperature: Ld(h),
      sendTemperature: Un(h),
      maxTokens: le(h.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: h.toolMode || "native",
      reasoning: nn(f, h.reasoning)
    };
  }
  const r = oe(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), o = n.presets?.[r] ? r : n.presets?.[n.currentPresetName] ? n.currentPresetName : _i, i = n.presets?.[o] || xe(), a = i.provider || n.provider || "openai-compatible", u = (i.modelConfigs || n.modelConfigs || wn())[a] || wn()[a] || {}, c = {
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    maxTokens: le(u.maxTokens)
  };
  return {
    currentPresetName: String(o || ""),
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    tavilyApiKey: ds(n.tavilyApiKey),
    tavilyBaseUrl: Qe(n.tavilyBaseUrl),
    temperature: Ld(u),
    sendTemperature: Un(u),
    maxTokens: le(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoning: nn(c, u.reasoning)
  };
}
function Q0(e = {}, t = {}) {
  if (!e.apiKey && !Y0(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (Xf(e.reasoning || {}), e.provider) {
    case "sillytavern-openai-compatible":
      return new W0(e);
    case "sillytavern-claude":
      return new D0(e);
    case "sillytavern-google":
      return new V0(e);
    case "openai-responses":
      return new e0(e);
    case "anthropic":
      return new s_(e);
    case "google":
      return new oI(e);
    default:
      return new Hb(e);
  }
}
var Z0 = { chat: { exclude: [
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
] } }, j0 = Object.freeze([
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
function nt(e, t, n = "") {
  if (e.replaceChildren(), n) {
    const r = document.createElement("option");
    r.value = "", r.textContent = n, e.appendChild(r);
  }
  t.forEach((r) => {
    const o = document.createElement("option");
    o.value = r.value, o.textContent = r.label, o.disabled = r.disabled === !0, e.appendChild(o);
  });
}
function Lo(e = "", t = {}) {
  const n = an(t.reasoning), r = Zr({
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
function Fd(e = {}) {
  return an(e);
}
function Jr(e = []) {
  const t = [...new Set(e.filter(Boolean).map((o) => String(o).trim()).filter(Boolean))], n = Z0.chat, r = t.filter((o) => {
    const i = o.toLowerCase();
    return !n.exclude.some((a) => i.includes(a));
  });
  return r.length ? r : t;
}
function Uo(e = "") {
  return e === "delegate" ? "delegate" : "main";
}
function qn(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function eP(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function vn(e = "") {
  return e === "openai-compatible" || e === "sillytavern-openai-compatible";
}
function tP(e = "") {
  return e === "anthropic" || e === "sillytavern-claude";
}
function nP(e = "") {
  return e === "sillytavern-claude" ? ll : e === "sillytavern-google" ? ul : Wn;
}
function Kr(e = []) {
  return [...new Set(e.filter(Boolean).map((t) => String(t).trim()).filter(Boolean))];
}
function rP(e) {
  const t = qn(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return Kr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return Kr([`${t}/v1/models`, `${t}/models`]);
}
function yg(e) {
  const t = qn(e);
  if (!t) return [];
  if (t.endsWith("/v1")) {
    const n = t.slice(0, -3);
    return Kr([
      `${t}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return Kr([`${t}/v1/models`, `${t}/models`]);
}
function oP(e, t) {
  const n = qn(e);
  if (!n) return [];
  const r = n.endsWith("/v1beta") ? n.slice(0, -7) : n;
  return Kr([
    `${n}/models?key=${encodeURIComponent(t)}`,
    `${n}/models`,
    `${r}/v1beta/models?key=${encodeURIComponent(t)}`,
    `${r}/v1beta/models`,
    `${r}/models?key=${encodeURIComponent(t)}`,
    `${r}/models`
  ]);
}
function iP(e, t) {
  const n = [
    e?.error?.message,
    e?.message,
    e?.detail,
    e?.details,
    e?.error
  ].find((r) => typeof r == "string" && r.trim());
  return n ? n.trim() : String(t || "").trim().slice(0, 160);
}
async function sP(e, t = {}) {
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
    errorSnippet: iP(o, r)
  };
}
function aP(e) {
  return Jr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function _g(e) {
  return Jr((e?.data || []).map((t) => String(t?.id || "").trim()).filter(Boolean));
}
function lP(e) {
  return Jr((e?.models || e?.data || []).map((t) => String(t?.id || t?.name || "")).map((t) => t.split("/").pop() || "").filter(Boolean));
}
async function Zo({ urls: e, requestOptionsList: t, extractModels: n, providerLabel: r }) {
  let o = null;
  for (const i of e) for (const a of t) {
    const u = await sP(i, a);
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
async function uP(e) {
  const t = String(e.apiKey || "").trim(), n = qn(e.baseUrl || ""), r = qn(n || sg.claude);
  if (t && r) try {
    return await Zo({
      urls: yg(r),
      requestOptionsList: [{ headers: {
        "x-api-key": t,
        "anthropic-version": "2023-06-01",
        Accept: "application/json"
      } }],
      extractModels: _g,
      providerLabel: "Anthropic"
    });
  } catch (o) {
    if (n) throw o;
  }
  return [...j0];
}
async function Od(e) {
  const t = e.provider, n = qn(e.baseUrl || ""), r = String(e.apiKey || "").trim();
  if (t === "sillytavern-claude") return Jr(await uP(e));
  if (eP(t)) return Jr(await A0(e, nP(t)));
  if (!r) throw new Error("请先填写 API Key。");
  if (!n) throw new Error("请先填写 Base URL。");
  return t === "google" ? await Zo({
    urls: oP(n, r),
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
    extractModels: lP,
    providerLabel: "Google AI"
  }) : tP(t) ? await Zo({
    urls: yg(n),
    requestOptionsList: [{ headers: {
      "x-api-key": r,
      "anthropic-version": "2023-06-01",
      Accept: "application/json"
    } }],
    extractModels: _g,
    providerLabel: "Anthropic"
  }) : await Zo({
    urls: rP(n),
    requestOptionsList: [{ headers: {
      Authorization: `Bearer ${r}`,
      Accept: "application/json"
    } }],
    extractModels: aP,
    providerLabel: t === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function cP(e) {
  return e instanceof Error ? e.message : String(e || "unknown_error");
}
function _P(e = {}) {
  const { state: t, render: n, showToast: r, createRequestId: o = (g = "req") => `${g}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, saveConfig: i, reloadConfig: a, describeError: u = cP, getRuntimeSummaryText: c } = e;
  function d() {
    t.configFormSyncPending = !0;
  }
  function h(g, I = "main") {
    const A = String(g || "").trim() || "openai-compatible";
    return I === "delegate" ? `delegate:${A}` : A;
  }
  function f(g, I = "main") {
    return t.pullStateByProvider?.[h(g, I)] || {
      status: "idle",
      message: ""
    };
  }
  function p(g, I, A = "main") {
    t.pullStateByProvider = {
      ...t.pullStateByProvider || {},
      [h(g, A)]: I
    };
  }
  function m(g, I, A = "main") {
    t.modelOptionsByProvider = {
      ...t.modelOptionsByProvider || {},
      [h(g, A)]: Array.isArray(I) ? I : []
    };
  }
  function y(g, I = "main") {
    const A = h(g, I);
    return Array.isArray(t.modelOptionsByProvider?.[A]) ? t.modelOptionsByProvider[A] : [];
  }
  function _(g, I) {
    const A = t.config?.presets || {}, M = oe(g || I || "默认");
    return A[M] ? M : I && A[I] ? I : Object.keys(A)[0] || "默认";
  }
  function v(g, I) {
    const A = _(g, _i), M = I && typeof I == "object" ? I : xe(), B = M.provider || "openai-compatible", se = Ve(M.modelConfigs || {}), ee = se[B] || {}, ce = Lo(B, ee);
    return {
      delegatePresetName: A,
      delegateProvider: B,
      delegateModelConfigs: se,
      delegateBaseUrl: String(ee.baseUrl || ""),
      delegateModel: String(ee.model || ""),
      delegateApiKey: String(ee.apiKey || ""),
      delegateTemperature: He(ee.temperature, 1),
      delegateMaxTokens: le(ee.maxTokens),
      delegateSendTemperature: Un(ee),
      delegateReasoningMode: ce.reasoningMode,
      delegateReasoningOutput: ce.reasoningOutput,
      delegateReasoningEffort: ce.reasoningEffort,
      delegateReasoningBudgetTokens: ce.reasoningBudgetTokens,
      delegateToolMode: ee.toolMode || "native"
    };
  }
  function E(g = "openai-compatible", I = {}) {
    const A = Ve(I || {})[g] || {}, M = Lo(g, A);
    return {
      baseUrl: String(A.baseUrl || ""),
      model: String(A.model || ""),
      apiKey: String(A.apiKey || ""),
      temperature: He(A.temperature, 1),
      maxTokens: le(A.maxTokens),
      sendTemperature: Un(A),
      ...M,
      toolMode: A.toolMode || "native"
    };
  }
  function b(g = "openai-compatible", I = {}) {
    const A = Ve(I || {})[g] || {}, M = Lo(g, A);
    return {
      delegateBaseUrl: String(A.baseUrl || ""),
      delegateModel: String(A.model || ""),
      delegateApiKey: String(A.apiKey || ""),
      delegateTemperature: He(A.temperature, 1),
      delegateMaxTokens: le(A.maxTokens),
      delegateSendTemperature: Un(A),
      delegateReasoningMode: M.reasoningMode,
      delegateReasoningOutput: M.reasoningOutput,
      delegateReasoningEffort: M.reasoningEffort,
      delegateReasoningBudgetTokens: M.reasoningBudgetTokens,
      delegateToolMode: A.toolMode || "native"
    };
  }
  function R(g, I, A = t.config) {
    const M = oe(g || "默认"), B = I && typeof I == "object" ? I : xe(), se = B.provider || "openai-compatible", ee = Ve(B.modelConfigs || {}), ce = E(se, ee), _e = _(A?.delegatePresetName, M), ae = v(_e, A?.delegateConfig && typeof A.delegateConfig == "object" ? A.delegateConfig : (A?.presets || {})[_e] || B);
    return {
      currentPresetName: M,
      presetDraftName: M,
      provider: se,
      modelConfigs: ee,
      ...ce,
      tavilyApiKey: String(A?.tavilyApiKey || ""),
      tavilyBaseUrl: Qe(A?.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: In(B.permissionMode),
      jsApiPermission: St(A?.jsApiPermission),
      ...ae
    };
  }
  function P() {
    if (t.configDraft) return t.configDraft;
    const g = oe(t.config?.currentPresetName || "默认");
    return t.configDraft = R(g, (t.config?.presets || {})[g] || xe()), t.configDraft;
  }
  function L(g, I = {}) {
    const A = P(), M = I.provider || g.querySelector("#xb-assistant-provider")?.value || A.provider || "openai-compatible", B = I.delegateProvider || g.querySelector("#xb-assistant-delegate-provider")?.value || A.delegateProvider || "openai-compatible", se = g.querySelector("#xb-assistant-base-url")?.value.trim() || "", ee = g.querySelector("#xb-assistant-model")?.value.trim() || "", ce = g.querySelector("#xb-assistant-delegate-base-url")?.value.trim() ?? A.delegateBaseUrl ?? "", _e = g.querySelector("#xb-assistant-delegate-model")?.value.trim() ?? A.delegateModel ?? "", ae = Fd({
      mode: g.querySelector("#xb-assistant-reasoning-mode")?.value || A.reasoningMode,
      output: g.querySelector("#xb-assistant-reasoning-output")?.value || A.reasoningOutput,
      effort: g.querySelector("#xb-assistant-reasoning-effort")?.value || A.reasoningEffort,
      budgetTokens: g.querySelector("#xb-assistant-reasoning-budget")?.value ?? A.reasoningBudgetTokens
    }), mt = Fd({
      mode: g.querySelector("#xb-assistant-delegate-reasoning-mode")?.value || A.delegateReasoningMode,
      output: g.querySelector("#xb-assistant-delegate-reasoning-output")?.value || A.delegateReasoningOutput,
      effort: g.querySelector("#xb-assistant-delegate-reasoning-effort")?.value || A.delegateReasoningEffort,
      budgetTokens: g.querySelector("#xb-assistant-delegate-reasoning-budget")?.value ?? A.delegateReasoningBudgetTokens
    }), de = {
      baseUrl: se,
      model: ee,
      apiKey: g.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      temperature: He(g.querySelector("#xb-assistant-temperature")?.value, A.temperature ?? 1),
      maxTokens: le(g.querySelector("#xb-assistant-max-tokens")?.value, A.maxTokens),
      sendTemperature: g.querySelector("#xb-assistant-send-temperature")?.checked ?? !!(A.sendTemperature ?? !0),
      reasoning: ae,
      toolMode: vn(M) ? g.querySelector("#xb-assistant-tool-mode")?.value || A.toolMode || "native" : void 0
    }, Se = {
      baseUrl: ce,
      model: _e,
      apiKey: g.querySelector("#xb-assistant-delegate-api-key")?.value.trim() ?? A.delegateApiKey ?? "",
      temperature: He(g.querySelector("#xb-assistant-delegate-temperature")?.value, A.delegateTemperature ?? 1),
      maxTokens: le(g.querySelector("#xb-assistant-delegate-max-tokens")?.value, A.delegateMaxTokens),
      sendTemperature: g.querySelector("#xb-assistant-delegate-send-temperature")?.checked ?? !!(A.delegateSendTemperature ?? !0),
      reasoning: mt,
      toolMode: vn(B) ? g.querySelector("#xb-assistant-delegate-tool-mode")?.value || A.delegateToolMode || "native" : void 0
    }, Gt = {
      ...Ve(A.modelConfigs || {}),
      [M]: {
        ...Ve(A.modelConfigs || {})[M] || {},
        ...de
      }
    }, Ht = {
      ...Ve(A.delegateModelConfigs || {}),
      [B]: {
        ...Ve(A.delegateModelConfigs || {})[B] || {},
        ...Se
      }
    };
    return {
      ...A,
      currentPresetName: A.currentPresetName,
      presetDraftName: oe(g.querySelector("#xb-assistant-preset-name")?.value),
      provider: M,
      modelConfigs: Gt,
      baseUrl: de.baseUrl,
      model: de.model,
      apiKey: de.apiKey,
      temperature: de.temperature,
      maxTokens: de.maxTokens,
      sendTemperature: de.sendTemperature,
      reasoningMode: de.reasoning.mode,
      reasoningOutput: de.reasoning.output,
      reasoningEffort: de.reasoning.effort || "",
      reasoningBudgetTokens: de.reasoning.budgetTokens,
      toolMode: de.toolMode || A.toolMode || "native",
      tavilyApiKey: g.querySelector("#xb-assistant-tavily-api-key")?.value.trim() || "",
      tavilyBaseUrl: Qe(A.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: In(g.querySelector("#xb-assistant-permission-mode")?.value || A.permissionMode),
      jsApiPermission: St(g.querySelector("#xb-assistant-jsapi-permission")?.value || A.jsApiPermission),
      delegatePresetName: _(g.querySelector("#xb-assistant-delegate-preset-select")?.value || A.delegatePresetName, A.currentPresetName),
      delegateProvider: B,
      delegateModelConfigs: Ht,
      delegateBaseUrl: Se.baseUrl,
      delegateModel: Se.model,
      delegateApiKey: Se.apiKey,
      delegateTemperature: Se.temperature,
      delegateMaxTokens: Se.maxTokens,
      delegateSendTemperature: Se.sendTemperature,
      delegateReasoningMode: Se.reasoning.mode,
      delegateReasoningOutput: Se.reasoning.output,
      delegateReasoningEffort: Se.reasoning.effort || "",
      delegateReasoningBudgetTokens: Se.reasoning.budgetTokens,
      delegateToolMode: Se.toolMode || A.delegateToolMode || "native"
    };
  }
  function S(g, I = {}) {
    return t.configDraft = L(g, I), t.configDirty = !0, t.configDraft;
  }
  function O(g = P()) {
    return {
      baseUrl: String(g.baseUrl || ""),
      model: String(g.model || ""),
      apiKey: String(g.apiKey || ""),
      temperature: He(g.temperature, 1),
      maxTokens: le(g.maxTokens),
      sendTemperature: !!(g.sendTemperature ?? !0),
      reasoning: an({
        mode: g.reasoningMode,
        output: g.reasoningOutput,
        effort: g.reasoningEffort,
        budgetTokens: g.reasoningBudgetTokens
      }),
      toolMode: vn(g.provider) ? g.toolMode || "native" : void 0
    };
  }
  function x(g = P()) {
    return {
      baseUrl: String(g.delegateBaseUrl || ""),
      model: String(g.delegateModel || ""),
      apiKey: String(g.delegateApiKey || ""),
      temperature: He(g.delegateTemperature, 1),
      maxTokens: le(g.delegateMaxTokens),
      sendTemperature: !!(g.delegateSendTemperature ?? !0),
      reasoning: an({
        mode: g.delegateReasoningMode,
        output: g.delegateReasoningOutput,
        effort: g.delegateReasoningEffort,
        budgetTokens: g.delegateReasoningBudgetTokens
      }),
      toolMode: vn(g.delegateProvider) ? g.delegateToolMode || "native" : void 0
    };
  }
  function D(g = P()) {
    const I = g.delegateProvider || "openai-compatible", A = Ve(g.delegateModelConfigs || {});
    return {
      provider: I,
      modelConfigs: {
        ...A,
        [I]: {
          ...A[I] || {},
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
      tavilyBaseUrl: Qe(g.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: g.sendTemperature === !1 ? void 0 : He(g.temperature, 1),
      sendTemperature: !!(g.sendTemperature ?? !0),
      maxTokens: le(g.maxTokens),
      timeoutMs: Dd,
      toolMode: g.toolMode || "native",
      reasoning: nn({
        provider: g.provider,
        baseUrl: g.baseUrl,
        model: g.model,
        maxTokens: le(g.maxTokens)
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
      tavilyBaseUrl: Qe(g.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: g.delegateSendTemperature === !1 ? void 0 : He(g.delegateTemperature, 1),
      sendTemperature: !!(g.delegateSendTemperature ?? !0),
      maxTokens: le(g.delegateMaxTokens),
      timeoutMs: Dd,
      toolMode: g.delegateToolMode || "native",
      reasoning: nn({
        provider: g.delegateProvider,
        baseUrl: g.delegateBaseUrl,
        model: g.delegateModel,
        maxTokens: le(g.delegateMaxTokens)
      }, {
        mode: g.delegateReasoningMode,
        output: g.delegateReasoningOutput,
        effort: g.delegateReasoningEffort,
        budgetTokens: g.delegateReasoningBudgetTokens
      })
    };
  }
  function ge(g = {}) {
    const I = [];
    Object.entries(g.presets || {}).forEach(([se, ee]) => {
      const ce = ee?.provider || "openai-compatible", _e = ee?.modelConfigs?.[ce] || {}, ae = nn({
        provider: ce,
        baseUrl: _e.baseUrl,
        model: _e.model,
        maxTokens: le(_e.maxTokens)
      }, _e.reasoning);
      ae.valid === !1 && I.push(`预设“${se}”：${ae.error}`);
    });
    const A = g.delegateConfig?.provider || "openai-compatible", M = g.delegateConfig?.modelConfigs?.[A] || {}, B = nn({
      provider: A,
      baseUrl: M.baseUrl,
      model: M.model,
      maxTokens: le(M.maxTokens)
    }, M.reasoning);
    return B.valid === !1 && I.push(`分身模型：${B.error}`), I;
  }
  function Q(g = {}) {
    const I = (g.role === "delegate", P());
    return g.role === "delegate" ? z(I) : H(I);
  }
  function j(g) {
    P(), t.configDraft = {
      ...t.configDraft,
      presetDraftName: oe(g.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function X(g = P(), I = g.provider || "openai-compatible", A = "main") {
    const M = f(I, A);
    return typeof c == "function" ? c({
      state: t,
      draft: g,
      provider: I,
      pullState: M,
      providerLabel: Ud(I)
    }) : `预设「${g.currentPresetName || "默认"}」 · ${Ud(I)}`;
  }
  function Te(g, I, A) {
    const M = g?.querySelector?.(I);
    if (!M) return;
    const B = String(A?.status || "idle"), se = String(A?.message || "").trim();
    M.textContent = se, M.hidden = !se, M.classList.toggle("is-loading", B === "loading"), M.classList.toggle("is-success", B === "success"), M.classList.toggle("is-error", B === "error");
  }
  function ze(g) {
    if (!g) return;
    const I = Uo(t.configPage);
    t.configPage = I, g.querySelectorAll("[data-config-page]").forEach((A) => {
      const M = Uo(A?.dataset?.configPage) === I;
      A.classList.toggle("is-active", M), A.setAttribute("aria-selected", M ? "true" : "false");
    }), g.querySelectorAll("[data-config-page-panel]").forEach((A) => {
      const M = Uo(A?.dataset?.configPagePanel) === I;
      A.toggleAttribute("hidden", !M);
    }), g.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("hidden", I === "delegate");
  }
  function ye(g, I = "main") {
    const A = P(), M = I === "delegate", B = M ? "#xb-assistant-delegate-reasoning" : "#xb-assistant-reasoning", se = M ? A.delegateProvider : A.provider, ee = M ? A.delegateBaseUrl : A.baseUrl, ce = M ? A.delegateModel : A.model, _e = {
      mode: M ? A.delegateReasoningMode : A.reasoningMode,
      output: M ? A.delegateReasoningOutput : A.reasoningOutput,
      effort: M ? A.delegateReasoningEffort : A.reasoningEffort,
      budgetTokens: M ? A.delegateReasoningBudgetTokens : A.reasoningBudgetTokens
    }, ae = Zr({
      provider: se,
      baseUrl: ee,
      model: ce
    }), mt = Lo(se, {
      baseUrl: ee,
      model: ce,
      reasoning: _e
    }), de = mt.reasoningMode, Se = mt.reasoningOutput, Gt = mt.reasoningEffort, Ht = mt.reasoningBudgetTokens, Vt = g.querySelector(`${B}-mode`), fn = g.querySelector(`${B}-capability`), zn = g.querySelector(`${B}-effort-wrap`), Jt = g.querySelector(`${B}-effort`), Yn = g.querySelector(`${B}-budget-wrap`), Pt = g.querySelector(`${B}-budget`), hn = g.querySelector(`${B}-output`);
    Vt && (nt(Vt, Ky(ae)), Vt.value = de), fn && (fn.textContent = ae.unsupportedReason || `能力配置：${ae.profileId}`), Jt && (nt(Jt, Wy(ae)), Jt.value = Gt), zn && (zn.style.display = de === "on" && ae.intensity.kind === "effort" ? "" : "none"), Pt && ae.intensity.kind === "budget" && (Pt.min = ae.intensity.allowAuto ? "-1" : String(ae.intensity.min), Pt.max = String(ae.intensity.max), Pt.value = String(Ht)), Yn && (Yn.style.display = de === "on" && ae.intensity.kind === "budget" ? "" : "none"), hn && (nt(hn, zy(ae)), hn.value = Se);
  }
  function ie(g) {
    const I = g.querySelector("#xb-assistant-runtime");
    if (!I) return;
    const A = P(), M = t.configPage === "delegate", B = M ? A.delegateProvider : A.provider;
    I.textContent = X(M ? {
      ...A,
      currentPresetName: "分身",
      provider: B
    } : A, B || "openai-compatible", M ? "delegate" : "main");
  }
  function dn(g) {
    if (!t.config) return;
    ze(g);
    const I = P(), A = I.provider || "openai-compatible", M = y(A), B = I.delegateProvider || "openai-compatible", se = y(B, "delegate"), ee = g.querySelector("#xb-assistant-provider"), ce = g.querySelector("#xb-assistant-base-url"), _e = g.querySelector("#xb-assistant-model"), ae = g.querySelector("#xb-assistant-api-key"), mt = g.querySelector("#xb-assistant-temperature"), de = g.querySelector("#xb-assistant-send-temperature"), Se = g.querySelector("#xb-assistant-tool-mode-wrap"), Gt = g.querySelector("#xb-assistant-tool-mode"), Ht = g.querySelector("#xb-assistant-permission-mode"), Vt = g.querySelector("#xb-assistant-jsapi-permission"), fn = g.querySelector("#xb-assistant-model-pulled"), zn = g.querySelector("#xb-assistant-max-tokens"), Jt = g.querySelector("#xb-assistant-preset-select"), Yn = g.querySelector("#xb-assistant-preset-name"), Pt = g.querySelector("#xb-assistant-delegate-preset-select"), hn = g.querySelector("#xb-assistant-delegate-provider"), gl = g.querySelector("#xb-assistant-delegate-base-url"), yl = g.querySelector("#xb-assistant-delegate-model"), _l = g.querySelector("#xb-assistant-delegate-api-key"), vl = g.querySelector("#xb-assistant-tavily-api-key"), qi = g.querySelector("#xb-assistant-delegate-model-pulled"), Al = g.querySelector("#xb-assistant-delegate-max-tokens"), Tl = g.querySelector("#xb-assistant-delegate-tool-mode-wrap"), Bi = g.querySelector("#xb-assistant-delegate-tool-mode");
    if (!Jt || !Yn) return;
    const Sl = (t.config.presetNames || []).map((Rt) => ({
      value: Rt,
      label: Rt
    }));
    nt(Jt, Sl), Jt.value = I.currentPresetName || t.config.currentPresetName || "默认", Pt && (nt(Pt, Sl), Pt.value = _(I.delegatePresetName, I.currentPresetName)), Yn.value = I.presetDraftName || I.currentPresetName || "默认", ee && (ee.value = A), ce && (ce.value = I.baseUrl || ""), _e && (_e.value = I.model || ""), ae && (ae.value = I.apiKey || ""), zn && (zn.value = String(le(I.maxTokens))), mt && (mt.value = String(He(I.temperature, 1))), de && (de.checked = !!(I.sendTemperature ?? !0)), vl && (vl.value = I.tavilyApiKey || ""), Se && (Se.style.display = vn(A) ? "" : "none"), Gt && (nt(Gt, $d), Gt.value = I.toolMode || "native"), Ht && (nt(Ht, Ug), Ht.value = In(I.permissionMode)), Vt && (nt(Vt, Fg), Vt.value = St(I.jsApiPermission)), ye(g), fn && (nt(fn, M.map((Rt) => ({
      value: Rt,
      label: Rt
    })), "手动填写"), fn.value = M.includes(I.model) ? I.model : ""), hn && (hn.value = B), gl && (gl.value = I.delegateBaseUrl || ""), yl && (yl.value = I.delegateModel || ""), _l && (_l.value = I.delegateApiKey || "");
    const El = g.querySelector("#xb-assistant-delegate-temperature"), Cl = g.querySelector("#xb-assistant-delegate-send-temperature");
    Al && (Al.value = String(le(I.delegateMaxTokens))), El && (El.value = String(He(I.delegateTemperature, 1))), Cl && (Cl.checked = !!(I.delegateSendTemperature ?? !0)), Tl && (Tl.style.display = vn(B) ? "" : "none"), Bi && (nt(Bi, $d), Bi.value = I.delegateToolMode || "native"), ye(g, "delegate"), qi && (nt(qi, se.map((Rt) => ({
      value: Rt,
      label: Rt
    })), "手动填写"), qi.value = se.includes(I.delegateModel) ? I.delegateModel : ""), Te(g, "#xb-assistant-model-pull-status", f(A)), Te(g, "#xb-assistant-delegate-model-pull-status", f(B, "delegate")), ie(g);
  }
  function vg(g) {
    if (typeof i != "function") return;
    const I = i(g);
    I && typeof I.catch == "function" && I.catch((A) => {
      r?.(u(A));
    });
  }
  function Oi(g, I, A) {
    g.querySelector(I)?.addEventListener("click", () => {
      const M = g.querySelector(A);
      M && (M.type = M.type === "password" ? "text" : "password");
    });
  }
  function Ag(g) {
    return {
      expectedUpdatedAt: Number(g?.updatedAt) || 0,
      workspaceFileName: g?.workspaceFileName || "",
      jsApiPermission: St(g?.jsApiPermission),
      tavilyApiKey: String(g?.tavilyApiKey || ""),
      tavilyBaseUrl: Qe(g?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: g?.currentPresetName || "默认",
      delegatePresetName: g?.delegatePresetName || g?.currentPresetName || "默认",
      delegateConfig: g?.delegateConfig || {},
      delegateConfigured: g?.delegateConfigured === !0,
      presets: g?.presets || {}
    };
  }
  function pl(g, I = {}) {
    const A = hs(g), M = ge(A);
    if (M.length)
      return r?.(M[0]), !1;
    t.config = A;
    const B = oe(I.presetName || A.currentPresetName || "默认");
    return t.configDraft = R(B, A.presets?.[B] || xe(), A), d(), vg({
      requestId: o(I.requestPrefix || "save-config"),
      config: A,
      payload: Ag(A)
    }), !0;
  }
  function ao(g, I = {}) {
    const A = S(g), M = oe(I.presetName || A.presetDraftName), B = oe(A.currentPresetName || t.config?.currentPresetName || "默认"), se = (t.config?.presets || {})[B] || xe(), ee = Ve(A.modelConfigs || se.modelConfigs || {}), ce = {
      ...se,
      provider: A.provider,
      permissionMode: In(A.permissionMode),
      modelConfigs: {
        ...ee,
        [A.provider]: {
          ...ee[A.provider] || {},
          ...O(A)
        }
      }
    }, _e = { ...t.config?.presets || {} };
    I.renameCurrentPreset && M !== B && delete _e[B], _e[M] = ce, pl({
      ...t.config,
      jsApiPermission: St(A.jsApiPermission),
      tavilyApiKey: String(A.tavilyApiKey || ""),
      tavilyBaseUrl: Qe(A.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: M,
      delegatePresetName: _(A.delegatePresetName, M),
      delegateConfig: D(A),
      delegateConfigured: I.configureDelegate === !0 || t.config?.delegateConfigured === !0,
      presets: _e
    }, {
      presetName: M,
      requestPrefix: I.requestPrefix
    });
  }
  function ml(g, I = "") {
    const A = oe(I || "默认"), M = typeof window < "u" && typeof window.prompt == "function" ? window.prompt(g, A) : A;
    return M === null ? "" : oe(M);
  }
  function Tg(g) {
    const I = ml("输入新预设名称：", `${S(g).currentPresetName || "默认"} 副本`);
    if (!I) {
      r?.("预设名称不能为空");
      return;
    }
    const A = g.querySelector("#xb-assistant-preset-name");
    A && (A.value = I, ao(g, {
      presetName: I,
      requestPrefix: "create-preset"
    }));
  }
  function Sg(g) {
    const I = S(g), A = oe(I.currentPresetName || t.config?.currentPresetName || "默认"), M = ml("输入预设名称：", I.presetDraftName || A);
    if (!M) {
      r?.("预设名称不能为空");
      return;
    }
    if (M === A) return;
    const B = g.querySelector("#xb-assistant-preset-name");
    B && (B.value = M, ao(g, {
      presetName: M,
      renameCurrentPreset: !0,
      requestPrefix: "rename-preset"
    }));
  }
  function Eg(g) {
    if (Object.keys(t.config?.presets || {}).length <= 1) {
      r?.("至少要保留一套预设");
      return;
    }
    const I = S(g), A = oe(t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), M = { ...t.config?.presets || {} };
    delete M[A];
    const B = Object.keys(M)[0] || "默认";
    pl({
      ...t.config,
      jsApiPermission: St(I.jsApiPermission),
      tavilyApiKey: String(I.tavilyApiKey || t.config?.tavilyApiKey || ""),
      tavilyBaseUrl: Qe(I.tavilyBaseUrl || t.config?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: B,
      delegatePresetName: _(I.delegatePresetName, B),
      delegateConfig: D(I),
      presets: M
    }, {
      presetName: B,
      requestPrefix: "delete-preset"
    }) && n?.();
  }
  function Cg(g) {
    g?.querySelector?.("[data-xb-agent-config-retry]")?.addEventListener("click", () => {
      a?.();
    }), g?.querySelector?.("[data-xb-agent-config-reload]")?.addEventListener("click", () => {
      t.configDraft = null, t.configDirty = !1, t.configExternalChangePending = !1, d(), n?.();
    }), g?.querySelector?.("#xb-assistant-provider") && (g.querySelector("#xb-assistant-provider")?.addEventListener("change", (I) => {
      const A = I.currentTarget.value, M = P().provider, B = S(g, { provider: M });
      t.configDraft = {
        ...B,
        provider: A,
        ...E(A, B.modelConfigs)
      }, d(), n?.();
    }), g.querySelector("#xb-assistant-preset-select")?.addEventListener("change", (I) => {
      const A = oe(I.currentTarget.value), M = (t.config?.presets || {})[A] || xe(), B = S(g);
      t.config = hs({
        ...t.config,
        jsApiPermission: St(B.jsApiPermission),
        currentPresetName: A,
        delegatePresetName: _(B.delegatePresetName, A),
        delegateConfig: D(B)
      }), t.configDraft = R(A, M, t.config), d(), n?.();
    }), g.querySelector("#xb-assistant-preset-name")?.addEventListener("input", () => {
      j(g);
    }), g.querySelector("#xb-assistant-base-url")?.addEventListener("input", () => {
      S(g), ye(g), ie(g);
    }), g.querySelector("#xb-assistant-model")?.addEventListener("input", () => {
      S(g), ye(g), ie(g);
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
    }), g.querySelector("#xb-assistant-model-pulled")?.addEventListener("change", (I) => {
      const A = I.currentTarget.value;
      if (!A) return;
      const M = g.querySelector("#xb-assistant-model");
      M && (M.value = A), S(g), ye(g), ie(g);
    }), Oi(g, "#xb-assistant-toggle-key", "#xb-assistant-api-key"), Oi(g, "#xb-assistant-toggle-tavily-key", "#xb-assistant-tavily-api-key"), g.querySelector("#xb-assistant-delegate-provider")?.addEventListener("change", (I) => {
      const A = I.currentTarget.value, M = P().delegateProvider, B = S(g, { delegateProvider: M });
      t.configDraft = {
        ...B,
        delegateProvider: A,
        ...b(A, B.delegateModelConfigs)
      }, d(), n?.();
    }), g.querySelector("#xb-assistant-delegate-base-url")?.addEventListener("input", () => {
      S(g), ye(g, "delegate"), ie(g);
    }), g.querySelector("#xb-assistant-delegate-model")?.addEventListener("input", () => {
      S(g), ye(g, "delegate"), ie(g);
    }), g.querySelector("#xb-assistant-delegate-api-key")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-max-tokens")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-temperature")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-send-temperature")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-model-pulled")?.addEventListener("change", (I) => {
      const A = I.currentTarget.value;
      if (!A) return;
      const M = g.querySelector("#xb-assistant-delegate-model");
      M && (M.value = A), S(g), ye(g, "delegate"), ie(g);
    }), Oi(g, "#xb-assistant-delegate-toggle-key", "#xb-assistant-delegate-api-key"), g.querySelector("#xb-assistant-reasoning-mode")?.addEventListener("change", () => {
      S(g), ye(g), ie(g);
    }), g.querySelector("#xb-assistant-reasoning-effort")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-reasoning-budget")?.addEventListener("input", () => {
      S(g);
    }), g.querySelector("#xb-assistant-reasoning-output")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-tool-mode")?.addEventListener("change", () => {
      S(g);
    }), g.querySelector("#xb-assistant-delegate-reasoning-mode")?.addEventListener("change", () => {
      S(g), ye(g, "delegate"), ie(g);
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
    }), g.querySelector("#xb-assistant-delegate-preset-select")?.addEventListener("change", (I) => {
      const A = _(I.currentTarget?.value, t.configDraft?.currentPresetName || t.config?.currentPresetName || "默认"), M = (t.config?.presets || {})[A] || xe();
      t.configDraft = {
        ...S(g),
        ...v(A, M)
      }, d(), n?.();
    }), g.querySelectorAll("[data-config-page]").forEach((I) => {
      I.addEventListener("click", (A) => {
        S(g), t.configPage = Uo(A.currentTarget?.dataset?.configPage), ze(g), dn(g);
      });
    }), g.querySelector("#xb-assistant-pull-models")?.addEventListener("click", async () => {
      S(g), d();
      const I = Q();
      p(I.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), n?.();
      try {
        const A = await Od(I);
        m(I.provider, A), p(I.provider, {
          status: "success",
          message: `已拉取 ${A.length} 个模型`
        });
      } catch (A) {
        m(I.provider, []), p(I.provider, {
          status: "error",
          message: u(A)
        });
      }
      d(), n?.();
    }), g.querySelector("#xb-assistant-delegate-pull-models")?.addEventListener("click", async () => {
      S(g), d();
      const I = Q({ role: "delegate" });
      p(I.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }, "delegate"), n?.();
      try {
        const A = await Od(I);
        m(I.provider, A, "delegate"), p(I.provider, {
          status: "success",
          message: `已拉取 ${A.length} 个模型`
        }, "delegate");
      } catch (A) {
        m(I.provider, [], "delegate"), p(I.provider, {
          status: "error",
          message: u(A)
        }, "delegate");
      }
      d(), n?.();
    }), g.querySelector("#xb-assistant-new-preset")?.addEventListener("click", () => {
      Tg(g);
    }), g.querySelector("#xb-assistant-rename-preset")?.addEventListener("click", () => {
      Sg(g);
    }), g.querySelector("#xb-assistant-save")?.addEventListener("click", () => {
      ao(g);
    }), g.querySelector("#xb-assistant-delegate-save")?.addEventListener("click", () => {
      ao(g, {
        requestPrefix: "save-delegate-config",
        configureDelegate: !0
      });
    }), g.querySelector("#xb-assistant-delete-preset")?.addEventListener("click", () => {
      Eg(g);
    }));
  }
  return {
    getActiveProviderConfig: Q,
    syncConfigToForm: dn,
    bindSettingsPanelEvents: Cg
  };
}
function Nr(e = "") {
  return String(e || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function mr(e) {
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
function dP(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? "saving" : t === "success" ? "success" : t === "error" ? "error" : "save";
}
function fP(e = {}) {
  const t = String(e?.status || "idle");
  return t === "saving" ? {
    className: "xb-assistant-save-button is-saving",
    title: "正在保存配置"
  } : t === "success" ? {
    className: "xb-assistant-save-button is-success",
    title: "配置已保存"
  } : t === "error" ? {
    className: "xb-assistant-save-button is-error",
    title: Nr(e?.error || "保存失败")
  } : {
    className: "xb-assistant-save-button",
    title: "保存配置"
  };
}
function vP(e = {}) {
  const { configSave: t = {}, runtimeText: n = "", inlineToastText: r = "", showInlineToast: o = !0, showAssistantPermissions: i = !0, showDelegateSettings: a = !0, activePage: u = "main", delegatePresetHint: c = "DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。", isBusy: d = !1, canDeletePreset: h = !0, configLoadError: f = "", configExternalChangePending: p = !1 } = e, m = String(f || "").trim(), y = fP(t), _ = dP(t), v = d || m || String(t?.status || "") === "saving" ? "disabled" : "", E = d || !h ? "disabled" : "", b = u === "delegate" ? "delegate" : "main", R = b === "main", P = b === "delegate", L = i ? `
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
                <p class="xb-assistant-config-note">${Nr(c)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${y.className}" title="${y.title}" aria-label="${y.title}" ${v}>${mr(_)}</button>
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
                <span data-xb-agent-config-load-error-message>${Nr(m)}</span>
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
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${d ? "disabled" : ""}>${mr("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${d ? "disabled" : ""}>${mr("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${y.className}" title="${y.title}" aria-label="${y.title}" ${v}>${mr(_)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${E}>${mr("delete")}</button>
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
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${Nr(n)}</div>
            </fieldset>
            ${o ? `<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${Nr(r)}</div>` : ""}
        </section>
    `;
}
var hP = [
  "你是小白X“四次元壁”的交流生成器。",
  "只完成本轮四次元壁回复，不调用工具，不编造外部事实。",
  "严格遵循后续提示词里的输出格式，优先输出可被解析的 <thinking> 与 <msg> 内容。"
].join(`
`);
function pP(e = {}) {
  return {
    msg1: String(e.msg1 || "").trim(),
    msg2: String(e.msg2 || "").trim(),
    msg3: String(e.msg3 || "").trim(),
    msg4: String(e.msg4 || "").trim()
  };
}
function mP(e = {}, t = {}) {
  const { msg1: n, msg2: r, msg3: o, msg4: i } = pP(e);
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
function AP(e = {}) {
  a0(typeof e.requestHeadersProvider == "function" ? e.requestHeadersProvider : null);
}
async function TP(e = {}) {
  const t = X0(Bg(e.config || {})), n = Q0(t, { missingApiKeyMessage: "请先在小白agent的 API配置 里填写当前预设的 API Key。" }), r = !!e.stream && typeof e.onStreamProgress == "function", o = await n.chat({
    systemPrompt: hP,
    messages: mP(e.builtPrompt || {}, { disableAssistantPrefill: !!e.disableAssistantPrefill }),
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
  vP as buildAgentSettingsPanelMarkup,
  AP as configureFourthWallAgent,
  _P as createAgentSettingsPanel,
  TP as generateFourthWallResponse,
  hs as normalizeAgentConfig
};
