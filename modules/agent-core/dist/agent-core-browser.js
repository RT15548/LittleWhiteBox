var im = Object.create, wc = Object.defineProperty, sm = Object.getOwnPropertyDescriptor, am = Object.getOwnPropertyNames, lm = Object.getPrototypeOf, um = Object.prototype.hasOwnProperty, Eo = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), cm = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var o = am(t), i = 0, a = o.length, u; i < a; i++)
      u = o[i], !um.call(e, u) && u !== n && wc(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(r = sm(t, u)) || r.enumerable
      });
  return e;
}, dm = (e, t, n) => (n = e != null ? im(lm(e)) : {}, cm(t || !e || !e.__esModule ? wc(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), fm = "https://api.tavily.com";
function di(e = "") {
  return String(e || "").trim();
}
function Hn(e = "") {
  return String(e || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var l0 = Object.freeze({
  min: "最小",
  low: "低",
  medium: "中",
  high: "高",
  max: "最大"
}), Cc = Object.freeze({
  efforts: Object.freeze([
    "min",
    "low",
    "medium",
    "high",
    "max"
  ]),
  includeOutput: !1
}), hm = Object.freeze({
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
  "openai-compatible": Cc,
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
function Ic(e = "") {
  return hm[String(e || "").trim()] || Cc;
}
function cs(e = "", t = "") {
  const n = e === "minimal" ? "min" : e === "xhigh" ? "max" : e;
  return Ic(t).efforts.includes(n) ? n : "medium";
}
function pm(e = "", t = "") {
  const n = String(e || "").trim(), r = cs(t, n);
  if (n === "openai-responses" || n === "openai-compatible") {
    if (r === "min") return "minimal";
    if (r === "max") return "xhigh";
  }
  return n === "google" && r === "min" ? "minimal" : r;
}
function bc(e, t = "") {
  return Ic(t).includeOutput && e !== !1;
}
function pa(e = "", t = {}) {
  const n = cs(t.reasoningEffort, e), r = t.reasoningEnabled === !0;
  return {
    reasoningEnabled: r,
    reasoningRequestedEffort: n,
    reasoningEffort: pm(e, n),
    reasoningIncludeOutput: r && bc(t.reasoningIncludeOutput, e)
  };
}
var Rc = "openai-compatible", ds = "默认", Pc = "default", mm = "deny", Qe = 32e3, u0 = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), c0 = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), fi = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: Qe,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: Qe,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: Qe,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: Qe,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: Qe,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: Qe,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: Qe,
    sendTemperature: !0
  }
};
function Ht() {
  return JSON.parse(JSON.stringify(fi));
}
function ht() {
  return {
    provider: Rc,
    modelConfigs: Ht(),
    permissionMode: Pc
  };
}
function Mc(e = ht()) {
  const t = e && typeof e == "object" ? e : ht();
  return {
    provider: hs(t.provider),
    modelConfigs: fs(t.modelConfigs || {})
  };
}
function xc(e) {
  return e === "full" ? "full" : Pc;
}
function Nc(e) {
  return e === "allow" ? "allow" : mm;
}
function hi(e, t = Qe) {
  const n = Number(e);
  if (!Number.isFinite(n) || n <= 0) {
    const r = Number(t);
    return Number.isFinite(r) && r > 0 ? Math.floor(r) : Qe;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}
function je(e) {
  return String(e || "").trim() || "默认";
}
function fs(e = {}) {
  const t = Ht();
  return Object.keys(fi).forEach((n) => {
    const r = e && typeof e[n] == "object" ? e[n] : {};
    t[n] = {
      ...fi[n],
      ...r,
      maxTokens: hi(r.maxTokens),
      reasoningEnabled: r.reasoningEnabled === !0,
      reasoningEffort: cs(r.reasoningEffort, n),
      reasoningIncludeOutput: bc(r.reasoningIncludeOutput, n)
    };
  }), t;
}
function hs(e) {
  return typeof e == "string" && e.trim() ? e : Rc;
}
function ps(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function Dc(e = {}, t) {
  const n = {}, r = ps(e, t);
  return Object.entries(r).forEach(([o, i]) => {
    if (!i || typeof i != "object") return;
    const a = je(o);
    n[a] = {
      provider: hs(i.provider),
      modelConfigs: fs(i.modelConfigs || {}),
      permissionMode: xc(i.permissionMode)
    };
  }), Object.keys(n).length || (n[ds] = ht()), n;
}
function kc(e, t) {
  const n = je(t);
  return e[n] ? n : Object.keys(e)[0];
}
function $c(e, t, n) {
  const r = je(t || n);
  return e[r] ? r : e[n] ? n : Object.keys(e)[0];
}
function ms(e = {}, t = ht()) {
  const n = Mc(t), r = e && typeof e == "object" ? e : {};
  return {
    provider: hs(r.provider || n.provider),
    modelConfigs: fs(r.modelConfigs || n.modelConfigs)
  };
}
function Lc(e = {}, t = {}, n = ds, r = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (r !== n) return !0;
  const o = e?.delegateConfig;
  if (!o || typeof o != "object" || Array.isArray(o) || !(typeof o.provider == "string" && o.provider.trim() || o.modelConfigs && typeof o.modelConfigs == "object" && Object.keys(o.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const i = t[n] || ht(), a = Mc(i), u = ms(o, i);
  return JSON.stringify(u) !== JSON.stringify(a);
}
function gm(e = {}, t, n, r, o) {
  const i = o(e?.[r]);
  if (i) return i;
  const a = ps(e, t), u = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(a || {})
  ].map(je), c = /* @__PURE__ */ new Set();
  for (const d of u) {
    if (c.has(d)) continue;
    c.add(d);
    const h = o(a?.[d]?.[r]);
    if (h) return h;
  }
  return o(e?.delegateConfig?.[r]);
}
function _m(e = {}, t, n) {
  const r = (u) => String(u || "").trim();
  if (r(e?.tavilyBaseUrl)) return Hn(e.tavilyBaseUrl);
  const o = ps(e, t), i = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(o || {})
  ].map(je), a = /* @__PURE__ */ new Set();
  for (const u of i) {
    if (a.has(u)) continue;
    a.add(u);
    const c = o?.[u]?.tavilyBaseUrl;
    if (r(c)) return Hn(c);
  }
  return r(e?.delegateConfig?.tavilyBaseUrl) ? Hn(e.delegateConfig.tavilyBaseUrl) : fm;
}
function Uc(e = {}, t, n) {
  return {
    tavilyApiKey: gm(e, t, n, "tavilyApiKey", di),
    tavilyBaseUrl: _m(e, t, n)
  };
}
function d0(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: r = (p) => String(p || "") } = t, o = je(e.currentPresetName || e.presetName || "默认"), i = Dc(e, o), a = kc(i, e.currentPresetName), u = $c(i, e.delegatePresetName, a), c = i[u] || i[a] || ht(), d = ms(e.delegateConfig, c), h = Lc(e, i, a, u), f = Uc(e, o, a);
  return {
    enabled: !!e.enabled,
    workspaceFileName: r(e.workspaceFileName || n),
    jsApiPermission: Nc(e.jsApiPermission),
    currentPresetName: a,
    delegatePresetName: u,
    delegateConfig: d,
    delegateConfigured: h,
    presets: i,
    tavilyApiKey: f.tavilyApiKey,
    tavilyBaseUrl: f.tavilyBaseUrl,
    updatedAt: Number(e.updatedAt) || 0,
    configVersion: Number(e.configVersion) || 0
  };
}
function ym(e = {}) {
  const t = je(e.currentPresetName || e.presetDraftName || "默认"), n = Dc(e, t), r = kc(n, e.currentPresetName), o = $c(n, e.delegatePresetName, r), i = n[r] || ht(), a = n[o] || i, u = ms(e.delegateConfig, a), c = Lc(e, n, r, o), d = Uc(e, t, r);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    updatedAt: Number(e.updatedAt) || 0,
    jsApiPermission: Nc(e.jsApiPermission),
    currentPresetName: r,
    delegatePresetName: o,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: je(e.presetDraftName || r),
    presetNames: Object.keys(n),
    presets: n,
    provider: i.provider,
    modelConfigs: i.modelConfigs,
    permissionMode: xc(i.permissionMode),
    tavilyApiKey: d.tavilyApiKey,
    tavilyBaseUrl: d.tavilyBaseUrl
  };
}
var f0 = 900 * 1e3, h0 = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), vm = Object.freeze([
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
function Am(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function Fc(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, r = Number(n);
  return Number.isFinite(r) ? Math.max(0, Math.min(2, r)) : Fc(t, 1);
}
function pi(e = {}) {
  return e.sendTemperature !== !1;
}
function ma(e = {}) {
  return pi(e) ? Fc(e.temperature, 1) : void 0;
}
function p0(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : vm.find((n) => n.value === e)?.label || e || "未配置";
}
function m0(e = {}) {
  const t = String(e.provider || "").trim();
  return t === "openai-compatible" || t === "sillytavern-openai-compatible" ? e.toolMode === "tagged-json" ? "Tagged JSON 兼容模式" : "原生 Tool Calling" : "Provider 原生工具";
}
function g0(e = {}, t = {}) {
  const n = ym(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const c = n.delegateConfig.provider || "openai-compatible", d = (n.delegateConfig.modelConfigs || Ht())[c] || Ht()[c] || {};
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: c,
      baseUrl: String(d.baseUrl || ""),
      model: String(d.model || ""),
      apiKey: String(d.apiKey || ""),
      tavilyApiKey: di(n.tavilyApiKey),
      tavilyBaseUrl: Hn(n.tavilyBaseUrl),
      temperature: ma(d),
      sendTemperature: pi(d),
      maxTokens: hi(d.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: d.toolMode || "native",
      ...pa(c, d)
    };
  }
  const r = je(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), o = n.presets?.[r] ? r : n.presets?.[n.currentPresetName] ? n.currentPresetName : ds, i = n.presets?.[o] || ht(), a = i.provider || n.provider || "openai-compatible", u = (i.modelConfigs || n.modelConfigs || Ht())[a] || Ht()[a] || {};
  return {
    currentPresetName: String(o || ""),
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    tavilyApiKey: di(n.tavilyApiKey),
    tavilyBaseUrl: Hn(n.tavilyBaseUrl),
    temperature: ma(u),
    sendTemperature: pi(u),
    maxTokens: hi(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    ...pa(a, u)
  };
}
function N(e, t, n, r, o) {
  if (r === "m") throw new TypeError("Private method is not writable");
  if (r === "a" && !o) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? o.call(e, n) : o ? o.value = n : t.set(e, n), n;
}
function A(e, t, n, r) {
  if (n === "a" && !r) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(e) : r ? r.value : t.get(e);
}
var Oc = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Oc = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function Qn(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var mi = (e) => {
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
}, we = class gi extends G {
  constructor(t, n, r, o, i) {
    super(`${gi.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new So({
      message: r,
      cause: mi(n)
    });
    const i = n, a = i?.error?.type;
    return t === 400 ? new Bc(t, i, r, o, a) : t === 401 ? new qc(t, i, r, o, a) : t === 403 ? new Hc(t, i, r, o, a) : t === 404 ? new Vc(t, i, r, o, a) : t === 409 ? new Jc(t, i, r, o, a) : t === 422 ? new Kc(t, i, r, o, a) : t === 429 ? new Wc(t, i, r, o, a) : t >= 500 ? new zc(t, i, r, o, a) : new gi(t, i, r, o, a);
  }
}, Fe = class extends we {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, So = class extends we {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Gc = class extends So {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Bc = class extends we {
}, qc = class extends we {
}, Hc = class extends we {
}, Vc = class extends we {
}, Jc = class extends we {
}, Kc = class extends we {
}, Wc = class extends we {
}, zc = class extends we {
}, Tm = /^[a-z][a-z0-9+.-]*:/i, Em = (e) => Tm.test(e), _i = (e) => (_i = Array.isArray, _i(e)), ga = _i;
function yi(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function _a(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Sm(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var wm = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new G(`${e} must be an integer`);
  if (t < 0) throw new G(`${e} must be a positive integer`);
  return t;
}, Yc = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Cm = (e) => new Promise((t) => setTimeout(t, e)), Ft = "0.91.1", Im = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function bm() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Rm = () => {
  const e = bm();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ft,
    "X-Stainless-OS": va(Deno.build.os),
    "X-Stainless-Arch": ya(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ft,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ft,
    "X-Stainless-OS": va(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": ya(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Pm();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ft,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ft,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Pm() {
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
var ya = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", va = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Aa, Mm = () => Aa ?? (Aa = Rm());
function xm() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Xc(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Qc(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Xc({
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
function gs(e) {
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
async function Nm(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Dm = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function km(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new G(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function $m(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var Ta;
function _s(e) {
  let t;
  return (Ta ?? (t = new globalThis.TextEncoder(), Ta = t.encode.bind(t)))(e);
}
var Ea;
function Sa(e) {
  let t;
  return (Ea ?? (t = new globalThis.TextDecoder(), Ea = t.decode.bind(t)))(e);
}
var ve, Ae, rr = class {
  constructor() {
    ve.set(this, void 0), Ae.set(this, void 0), N(this, ve, new Uint8Array(), "f"), N(this, Ae, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? _s(e) : e;
    N(this, ve, $m([A(this, ve, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = Lm(A(this, ve, "f"), A(this, Ae, "f"))) != null; ) {
      if (r.carriage && A(this, Ae, "f") == null) {
        N(this, Ae, r.index, "f");
        continue;
      }
      if (A(this, Ae, "f") != null && (r.index !== A(this, Ae, "f") + 1 || r.carriage)) {
        n.push(Sa(A(this, ve, "f").subarray(0, A(this, Ae, "f") - 1))), N(this, ve, A(this, ve, "f").subarray(A(this, Ae, "f")), "f"), N(this, Ae, null, "f");
        continue;
      }
      const o = A(this, Ae, "f") !== null ? r.preceding - 1 : r.preceding, i = Sa(A(this, ve, "f").subarray(0, o));
      n.push(i), N(this, ve, A(this, ve, "f").subarray(r.index), "f"), N(this, Ae, null, "f");
    }
    return n;
  }
  flush() {
    return A(this, ve, "f").length ? this.decode(`
`) : [];
  }
};
ve = /* @__PURE__ */ new WeakMap(), Ae = /* @__PURE__ */ new WeakMap();
rr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
rr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Lm(e, t) {
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
function Um(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var to = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, wa = (e, t, n) => {
  if (e) {
    if (Sm(to, e)) return e;
    ce(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(to))}`);
  }
};
function bn() {
}
function pr(e, t, n) {
  return !t || to[e] > to[n] ? bn : t[e].bind(t);
}
var Fm = {
  error: bn,
  warn: bn,
  info: bn,
  debug: bn
}, Ca = /* @__PURE__ */ new WeakMap();
function ce(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Fm;
  const r = Ca.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: pr("error", t, n),
    warn: pr("warn", t, n),
    info: pr("info", t, n),
    debug: pr("debug", t, n)
  };
  return Ca.set(t, [n, o]), o;
}
var At = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), un, Zn = class Rn {
  constructor(t, n, r) {
    this.iterator = t, un.set(this, void 0), this.controller = n, N(this, un, r, "f");
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const i = r ? ce(r) : console;
    async function* a() {
      if (o) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of Om(t, n)) {
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
            const d = Yc(c.data) ?? c.data, h = d?.error?.type;
            throw new we(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (Qn(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Rn(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* i() {
      const u = new rr(), c = gs(t);
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
        if (Qn(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Rn(a, n, r);
  }
  [(un = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Rn(() => o(t), this.controller, A(this, un, "f")), new Rn(() => o(n), this.controller, A(this, un, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Xc({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = _s(JSON.stringify(o) + `
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
async function* Om(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
  const n = new Bm(), r = new rr(), o = gs(e.body);
  for await (const i of Gm(o)) for (const a of r.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of r.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* Gm(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? _s(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let i;
    for (; (i = Um(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Bm = class {
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
    let [t, n, r] = qm(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function qm(e, t) {
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
async function Zc(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return ce(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : Zn.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : jc(await n.json(), n) : await n.text();
  })();
  return ce(e).debug(`[${r}] response parsed`, At({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function jc(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var Pn, ed = class td extends Promise {
  constructor(t, n, r = Zc) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, Pn.set(this, void 0), N(this, Pn, t, "f");
  }
  _thenUnwrap(t) {
    return new td(A(this, Pn, "f"), this.responsePromise, async (n, r) => jc(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(A(this, Pn, "f"), t))), this.parsedPromise;
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
Pn = /* @__PURE__ */ new WeakMap();
var mr, nd = class {
  constructor(e, t, n, r) {
    mr.set(this, void 0), N(this, mr, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new G("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await A(this, mr, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(mr = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Hm = class extends ed {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await Zc(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, or = class extends nd {
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
          ...yi(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...yi(this.options.query),
        after_id: e
      }
    } : null;
  }
}, _e = class extends nd {
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
        ...yi(this.options.query),
        page: e
      }
    } : null;
  }
}, rd = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Qt(e, t, n) {
  return rd(), new File(e, t ?? "unknown_file", n);
}
function Br(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var od = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", ys = async (e, t, n = !0) => ({
  ...e,
  body: await Jm(e.body, t, n)
}), Ia = /* @__PURE__ */ new WeakMap();
function Vm(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Ia.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new o(i).text();
    } catch {
      return !0;
    }
  })();
  return Ia.set(t, r), r;
}
var Jm = async (e, t, n = !0) => {
  if (!await Vm(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, i]) => vi(r, o, i, n))), r;
}, Km = (e) => e instanceof Blob && "name" in e, vi = async (e, t, n, r) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let o = {};
      const i = n.headers.get("Content-Type");
      i && (o = { type: i }), e.append(t, Qt([await n.blob()], Br(n, r), o));
    } else if (od(n)) e.append(t, Qt([await new Response(Qc(n)).blob()], Br(n, r)));
    else if (Km(n)) e.append(t, Qt([n], Br(n, r), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => vi(e, t + "[]", o, r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, i]) => vi(e, `${t}[${o}]`, i, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, id = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Wm = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && id(e), zm = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Ym(e, t, n) {
  if (rd(), e = await e, t || (t = Br(e, !0)), Wm(e))
    return e instanceof File && t == null && n == null ? e : Qt([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (zm(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Qt(await Ai(o), t, n);
  }
  const r = await Ai(e);
  if (!n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return Qt(r, t, n);
}
async function Ai(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (id(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (od(e)) for await (const n of e) t.push(...await Ai(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Xm(e)}`);
  }
  return t;
}
function Xm(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var X = class {
  constructor(e) {
    this._client = e;
  }
}, sd = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Qm(e) {
  if (!e) return;
  if (sd in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : ga(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = ga(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var I = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of Qm(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [sd]: !0,
    values: t,
    nulls: n
  };
};
function ad(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var ba = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Zm = (e = ad) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let g = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? ba) ?? ba)?.toString) && (g = m + "", i.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : g);
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
      const g = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + g + _;
    }, "");
    throw new G(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, $ = /* @__PURE__ */ Zm(ad), ld = class extends X {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post($`/v1/environments/${e}?beta=true`, {
      body: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", _e, {
      query: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete($`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post($`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Vn = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function qr(e) {
  return typeof e == "object" && e !== null && Vn in e;
}
function ud(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const r of e) qr(r) && n.add(r[Vn]);
  if (t) {
    for (const r of t)
      if (qr(r) && n.add(r[Vn]), Array.isArray(r.content))
        for (const o of r.content) qr(o) && n.add(o[Vn]);
  }
  return Array.from(n);
}
function cd(e, t) {
  const n = ud(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function jm(e) {
  return qr(e) ? { "x-stainless-helper": e[Vn] } : {};
}
var dd = class extends X {
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", or, {
      query: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete($`/v1/files/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/files/${e}/content?beta=true`, {
      ...n,
      headers: I([{
        "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/files/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/files?beta=true", ys({
      body: r,
      ...t,
      headers: I([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        jm(r.file),
        t?.headers
      ])
    }, this._client));
  }
}, fd = class extends X {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/models/${e}?beta=true`, {
      ...n,
      headers: I([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", or, {
      query: r,
      ...t,
      headers: I([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, hd = class extends X {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/user_profiles?beta=true", {
      body: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/user_profiles/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post($`/v1/user_profiles/${e}?beta=true`, {
      body: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/user_profiles?beta=true", _e, {
      query: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  createEnrollmentURL(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post($`/v1/user_profiles/${e}/enrollment_url?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
}, pd = class extends X {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList($`/v1/agents/${e}/versions?beta=true`, _e, {
      query: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, vs = class extends X {
  constructor() {
    super(...arguments), this.versions = new pd(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.get($`/v1/agents/${e}?beta=true`, {
      query: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post($`/v1/agents/${e}?beta=true`, {
      body: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", _e, {
      query: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post($`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
vs.Versions = pd;
var md = class extends X {
  create(e, t, n) {
    const { view: r, betas: o, ...i } = t;
    return this._client.post($`/v1/memory_stores/${e}/memories?beta=true`, {
      query: { view: r },
      body: i,
      ...n,
      headers: I([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { memory_store_id: r, betas: o, ...i } = t;
    return this._client.get($`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: i,
      ...n,
      headers: I([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { memory_store_id: r, view: o, betas: i, ...a } = t;
    return this._client.post($`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: { view: o },
      body: a,
      ...n,
      headers: I([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList($`/v1/memory_stores/${e}/memories?beta=true`, _e, {
      query: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { memory_store_id: r, expected_content_sha256: o, betas: i } = t;
    return this._client.delete($`/v1/memory_stores/${r}/memories/${e}?beta=true`, {
      query: { expected_content_sha256: o },
      ...n,
      headers: I([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, gd = class extends X {
  retrieve(e, t, n) {
    const { memory_store_id: r, betas: o, ...i } = t;
    return this._client.get($`/v1/memory_stores/${r}/memory_versions/${e}?beta=true`, {
      query: i,
      ...n,
      headers: I([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList($`/v1/memory_stores/${e}/memory_versions?beta=true`, _e, {
      query: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  redact(e, t, n) {
    const { memory_store_id: r, betas: o } = t;
    return this._client.post($`/v1/memory_stores/${r}/memory_versions/${e}/redact?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, wo = class extends X {
  constructor() {
    super(...arguments), this.memories = new md(this._client), this.memoryVersions = new gd(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/memory_stores?beta=true", {
      body: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post($`/v1/memory_stores/${e}?beta=true`, {
      body: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/memory_stores?beta=true", _e, {
      query: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete($`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post($`/v1/memory_stores/${e}/archive?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
wo.Memories = md;
wo.MemoryVersions = gd;
var _d = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function yd(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function Ra(e, t, n) {
  const r = yd(t);
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
  } : vd(e, t, n);
}
function vd(e, t, n) {
  let r = null;
  const o = e.content.map((i) => {
    if (i.type === "text") {
      const a = eg(t, i.text);
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
function eg(e, t) {
  const n = yd(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new G(`Failed to parse structured output: ${r}`);
  }
}
var tg = (e) => {
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
}, Ot = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Ot(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Ot(e);
    case "string":
      let r = e[e.length - 2];
      if (r?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Ot(e);
      if (r?.type === "brace" && r.value === "{")
        return e = e.slice(0, e.length - 1), Ot(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Ot(e);
  }
  return e;
}, ng = (e) => {
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
}, rg = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, Ad = (e) => JSON.parse(rg(ng(Ot(tg(e))))), be, ot, Dt, cn, gr, dn, fn, _r, hn, Ke, pn, yr, vr, _t, Ar, Tr, mn, Ho, Pa, Er, Vo, Jo, Ko, Ma, xa = "__json_buf";
function Na(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var og = class Ti {
  constructor(t, n) {
    be.add(this), this.messages = [], this.receivedMessages = [], ot.set(this, void 0), Dt.set(this, null), this.controller = new AbortController(), cn.set(this, void 0), gr.set(this, () => {
    }), dn.set(this, () => {
    }), fn.set(this, void 0), _r.set(this, () => {
    }), hn.set(this, () => {
    }), Ke.set(this, {}), pn.set(this, !1), yr.set(this, !1), vr.set(this, !1), _t.set(this, !1), Ar.set(this, void 0), Tr.set(this, void 0), mn.set(this, void 0), Er.set(this, (r) => {
      if (N(this, yr, !0, "f"), Qn(r) && (r = new Fe()), r instanceof Fe)
        return N(this, vr, !0, "f"), this._emit("abort", r);
      if (r instanceof G) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new G(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new G(String(r)));
    }), N(this, cn, new Promise((r, o) => {
      N(this, gr, r, "f"), N(this, dn, o, "f");
    }), "f"), N(this, fn, new Promise((r, o) => {
      N(this, _r, r, "f"), N(this, hn, o, "f");
    }), "f"), A(this, cn, "f").catch(() => {
    }), A(this, fn, "f").catch(() => {
    }), N(this, Dt, t, "f"), N(this, mn, n?.logger ?? console, "f");
  }
  get response() {
    return A(this, Ar, "f");
  }
  get request_id() {
    return A(this, Tr, "f");
  }
  async withResponse() {
    N(this, _t, !0, "f");
    const t = await A(this, cn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Ti(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const i = new Ti(n, { logger: o });
    for (const a of n.messages) i._addMessageParam(a);
    return N(i, Dt, {
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
    }, A(this, Er, "f"));
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
      A(this, be, "m", Vo).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) A(this, be, "m", Jo).call(this, c);
      if (u.controller.signal?.aborted) throw new Fe();
      A(this, be, "m", Ko).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (N(this, Ar, t, "f"), N(this, Tr, t?.headers.get("request-id"), "f"), A(this, gr, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return A(this, pn, "f");
  }
  get errored() {
    return A(this, yr, "f");
  }
  get aborted() {
    return A(this, vr, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (A(this, Ke, "f")[t] || (A(this, Ke, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = A(this, Ke, "f")[t];
    if (!r) return this;
    const o = r.findIndex((i) => i.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (A(this, Ke, "f")[t] || (A(this, Ke, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      N(this, _t, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    N(this, _t, !0, "f"), await A(this, fn, "f");
  }
  get currentMessage() {
    return A(this, ot, "f");
  }
  async finalMessage() {
    return await this.done(), A(this, be, "m", Ho).call(this);
  }
  async finalText() {
    return await this.done(), A(this, be, "m", Pa).call(this);
  }
  _emit(t, ...n) {
    if (A(this, pn, "f")) return;
    t === "end" && (N(this, pn, !0, "f"), A(this, _r, "f").call(this));
    const r = A(this, Ke, "f")[t];
    if (r && (A(this, Ke, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !A(this, _t, "f") && !r?.length && Promise.reject(o), A(this, dn, "f").call(this, o), A(this, hn, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !A(this, _t, "f") && !r?.length && Promise.reject(o), A(this, dn, "f").call(this, o), A(this, hn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", A(this, be, "m", Ho).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      A(this, be, "m", Vo).call(this), this._connected(null);
      const i = Zn.fromReadableStream(t, this.controller);
      for await (const a of i) A(this, be, "m", Jo).call(this, a);
      if (i.controller.signal?.aborted) throw new Fe();
      A(this, be, "m", Ko).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(ot = /* @__PURE__ */ new WeakMap(), Dt = /* @__PURE__ */ new WeakMap(), cn = /* @__PURE__ */ new WeakMap(), gr = /* @__PURE__ */ new WeakMap(), dn = /* @__PURE__ */ new WeakMap(), fn = /* @__PURE__ */ new WeakMap(), _r = /* @__PURE__ */ new WeakMap(), hn = /* @__PURE__ */ new WeakMap(), Ke = /* @__PURE__ */ new WeakMap(), pn = /* @__PURE__ */ new WeakMap(), yr = /* @__PURE__ */ new WeakMap(), vr = /* @__PURE__ */ new WeakMap(), _t = /* @__PURE__ */ new WeakMap(), Ar = /* @__PURE__ */ new WeakMap(), Tr = /* @__PURE__ */ new WeakMap(), mn = /* @__PURE__ */ new WeakMap(), Er = /* @__PURE__ */ new WeakMap(), be = /* @__PURE__ */ new WeakSet(), Ho = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Pa = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new G("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Vo = function() {
    this.ended || N(this, ot, void 0, "f");
  }, Jo = function(n) {
    if (this.ended) return;
    const r = A(this, be, "m", Ma).call(this, n);
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
            Na(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage(Ra(r, A(this, Dt, "f"), { logger: A(this, mn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        N(this, ot, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Ko = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = A(this, ot, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return N(this, ot, void 0, "f"), Ra(n, A(this, Dt, "f"), { logger: A(this, mn, "f") });
  }, Ma = function(n) {
    let r = A(this, ot, "f");
    if (n.type === "message_start") {
      if (r) throw new G(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new G(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (o && Na(o)) {
              let i = o[xa] || "";
              i += n.delta.partial_json;
              const a = { ...o };
              if (Object.defineProperty(a, xa, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                a.input = Ad(i);
              } catch (u) {
                const c = new G(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                A(this, Er, "f").call(this, c);
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
    return new Zn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Td = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var ig = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, gn, kt, yt, j, he, ye, Ze, it, _n, Da, Ei;
function ka() {
  let e, t;
  return {
    promise: new Promise((n, r) => {
      e = n, t = r;
    }),
    resolve: e,
    reject: t
  };
}
var Ed = class {
  constructor(e, t, n) {
    gn.add(this), this.client = e, kt.set(this, !1), yt.set(this, !1), j.set(this, void 0), he.set(this, void 0), ye.set(this, void 0), Ze.set(this, void 0), it.set(this, void 0), _n.set(this, 0), N(this, j, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const r = ["BetaToolRunner", ...ud(t.tools, t.messages)].join(", ");
    N(this, he, {
      ...n,
      headers: I([{ "x-stainless-helper": r }, n?.headers])
    }, "f"), N(this, it, ka(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(kt = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), j = /* @__PURE__ */ new WeakMap(), he = /* @__PURE__ */ new WeakMap(), ye = /* @__PURE__ */ new WeakMap(), Ze = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakMap(), gn = /* @__PURE__ */ new WeakSet(), Da = async function() {
    const t = A(this, j, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (A(this, ye, "f") !== void 0) try {
      const c = await A(this, ye, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const r = t.contextTokenThreshold ?? 1e5;
    if (n < r) return !1;
    const o = t.model ?? A(this, j, "f").params.model, i = t.summaryPrompt ?? ig, a = A(this, j, "f").params.messages;
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
      max_tokens: A(this, j, "f").params.max_tokens
    }, {
      signal: A(this, he, "f").signal,
      headers: I([A(this, he, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new G("Expected text response for compaction");
    return A(this, j, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (A(this, kt, "f")) throw new G("Cannot iterate over a consumed stream");
    N(this, kt, !0, "f"), N(this, yt, !0, "f"), N(this, Ze, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (A(this, j, "f").params.max_iterations && A(this, _n, "f") >= A(this, j, "f").params.max_iterations) break;
          N(this, yt, !1, "f"), N(this, Ze, void 0, "f"), N(this, _n, (e = A(this, _n, "f"), e++, e), "f"), N(this, ye, void 0, "f");
          const { max_iterations: n, compactionControl: r, ...o } = A(this, j, "f").params;
          if (o.stream ? (t = this.client.beta.messages.stream({ ...o }, A(this, he, "f")), N(this, ye, t.finalMessage(), "f"), A(this, ye, "f").catch(() => {
          }), yield t) : (N(this, ye, this.client.beta.messages.create({
            ...o,
            stream: !1
          }, A(this, he, "f")), "f"), yield A(this, ye, "f")), !await A(this, gn, "m", Da).call(this)) {
            if (!A(this, yt, "f")) {
              const { role: a, content: u } = await A(this, ye, "f");
              A(this, j, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const i = await A(this, gn, "m", Ei).call(this, A(this, j, "f").params.messages.at(-1));
            if (i) A(this, j, "f").params.messages.push(i);
            else if (!A(this, yt, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!A(this, ye, "f")) throw new G("ToolRunner concluded without a message from the server");
      A(this, it, "f").resolve(await A(this, ye, "f"));
    } catch (t) {
      throw N(this, kt, !1, "f"), A(this, it, "f").promise.catch(() => {
      }), A(this, it, "f").reject(t), N(this, it, ka(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? A(this, j, "f").params = e(A(this, j, "f").params) : A(this, j, "f").params = e, N(this, yt, !0, "f"), N(this, Ze, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? N(this, he, e(A(this, he, "f")), "f") : N(this, he, {
      ...A(this, he, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = A(this, he, "f").signal) {
    const t = await A(this, ye, "f") ?? this.params.messages.at(-1);
    return t ? A(this, gn, "m", Ei).call(this, t, e) : null;
  }
  done() {
    return A(this, it, "f").promise;
  }
  async runUntilDone() {
    if (!A(this, kt, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return A(this, j, "f").params;
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
Ei = async function(t, n = A(this, he, "f").signal) {
  return A(this, Ze, "f") !== void 0 ? A(this, Ze, "f") : (N(this, Ze, sg(A(this, j, "f").params, t, {
    ...A(this, he, "f"),
    signal: n
  }), "f"), A(this, Ze, "f"));
};
async function sg(e, t = e.messages.at(-1), n) {
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
          content: a instanceof Td ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var Sd = class wd {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new rr();
    for await (const n of this.iterator) for (const r of t.decode(n)) yield JSON.parse(r);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
    return new wd(gs(t.body), n);
  }
}, Cd = class extends X {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", or, {
      query: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete($`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post($`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const r = await this.retrieve(e);
    if (!r.results_url) throw new G(`No batch \`results_url\`; Has it finished processing? ${r.processing_status} - ${r.id}`);
    const { betas: o } = t ?? {};
    return this._client.get(r.results_url, {
      ...n,
      headers: I([{
        "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, a) => Sd.fromResponse(a.response, a.controller));
  }
}, $a = {
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
}, ag = ["claude-mythos-preview", "claude-opus-4-6"], ir = class extends X {
  constructor() {
    super(...arguments), this.batches = new Cd(this._client);
  }
  create(e, t) {
    const n = La(e), { betas: r, ...o } = n;
    o.model in $a && console.warn(`The model '${o.model}' is deprecated and will reach end-of-life on ${$a[o.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), ag.includes(o.model) && o.thinking && o.thinking.type === "enabled" && console.warn(`Using Claude with ${o.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!o.stream && i == null) {
      const u = _d[o.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(o.max_tokens, u);
    }
    const a = cd(o.tools, o.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: o,
      timeout: i ?? 6e5,
      ...t,
      headers: I([
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
      headers: I([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => vd(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return og.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...r } = La(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new Ed(this._client, e, t);
  }
};
function La(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new G("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
ir.Batches = Cd;
ir.BetaToolRunner = Ed;
ir.ToolError = Td;
var Id = class extends X {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList($`/v1/sessions/${e}/events?beta=true`, _e, {
      query: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post($`/v1/sessions/${e}/events?beta=true`, {
      body: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, bd = class extends X {
  retrieve(e, t, n) {
    const { session_id: r, betas: o } = t;
    return this._client.get($`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: r, betas: o, ...i } = t;
    return this._client.post($`/v1/sessions/${r}/resources/${e}?beta=true`, {
      body: i,
      ...n,
      headers: I([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList($`/v1/sessions/${e}/resources?beta=true`, _e, {
      query: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: r, betas: o } = t;
    return this._client.delete($`/v1/sessions/${r}/resources/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post($`/v1/sessions/${e}/resources?beta=true`, {
      body: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Co = class extends X {
  constructor() {
    super(...arguments), this.events = new Id(this._client), this.resources = new bd(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post($`/v1/sessions/${e}?beta=true`, {
      body: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", _e, {
      query: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete($`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post($`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Co.Events = Id;
Co.Resources = bd;
var Rd = class extends X {
  create(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.post($`/v1/skills/${e}/versions?beta=true`, ys({
      body: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r, betas: o } = t;
    return this._client.get($`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList($`/v1/skills/${e}/versions?beta=true`, _e, {
      query: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: r, betas: o } = t;
    return this._client.delete($`/v1/skills/${r}/versions/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, As = class extends X {
  constructor() {
    super(...arguments), this.versions = new Rd(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.post("/v1/skills?beta=true", ys({
      body: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", _e, {
      query: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete($`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
As.Versions = Rd;
var Pd = class extends X {
  create(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post($`/v1/vaults/${e}/credentials?beta=true`, {
      body: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.get($`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: r, betas: o, ...i } = t;
    return this._client.post($`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      body: i,
      ...n,
      headers: I([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList($`/v1/vaults/${e}/credentials?beta=true`, _e, {
      query: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.delete($`/v1/vaults/${r}/credentials/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: r, betas: o } = t;
    return this._client.post($`/v1/vaults/${r}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ts = class extends X {
  constructor() {
    super(...arguments), this.credentials = new Pd(this._client);
  }
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: r, ...o } = t;
    return this._client.post($`/v1/vaults/${e}?beta=true`, {
      body: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", _e, {
      query: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.delete($`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.post($`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Ts.Credentials = Pd;
var xe = class extends X {
  constructor() {
    super(...arguments), this.models = new fd(this._client), this.messages = new ir(this._client), this.agents = new vs(this._client), this.environments = new ld(this._client), this.sessions = new Co(this._client), this.vaults = new Ts(this._client), this.memoryStores = new wo(this._client), this.files = new dd(this._client), this.skills = new As(this._client), this.userProfiles = new hd(this._client);
  }
};
xe.Models = fd;
xe.Messages = ir;
xe.Agents = vs;
xe.Environments = ld;
xe.Sessions = Co;
xe.Vaults = Ts;
xe.MemoryStores = wo;
xe.Files = dd;
xe.Skills = As;
xe.UserProfiles = hd;
var Md = class extends X {
  create(e, t) {
    const { betas: n, ...r } = e;
    return this._client.post("/v1/complete", {
      body: r,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: I([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function xd(e) {
  return e?.output_config?.format;
}
function Ua(e, t, n) {
  const r = xd(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((o) => o.type === "text" ? Object.defineProperty({ ...o }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : o),
    parsed_output: null
  } : Nd(e, t, n);
}
function Nd(e, t, n) {
  let r = null;
  const o = e.content.map((i) => {
    if (i.type === "text") {
      const a = lg(t, i.text);
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
function lg(e, t) {
  const n = xd(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new G(`Failed to parse structured output: ${r}`);
  }
}
var Re, st, $t, yn, Sr, vn, An, wr, Tn, We, En, Cr, Ir, vt, br, Rr, Sn, Wo, Fa, zo, Yo, Xo, Qo, Oa, Ga = "__json_buf";
function Ba(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var ug = class Si {
  constructor(t, n) {
    Re.add(this), this.messages = [], this.receivedMessages = [], st.set(this, void 0), $t.set(this, null), this.controller = new AbortController(), yn.set(this, void 0), Sr.set(this, () => {
    }), vn.set(this, () => {
    }), An.set(this, void 0), wr.set(this, () => {
    }), Tn.set(this, () => {
    }), We.set(this, {}), En.set(this, !1), Cr.set(this, !1), Ir.set(this, !1), vt.set(this, !1), br.set(this, void 0), Rr.set(this, void 0), Sn.set(this, void 0), zo.set(this, (r) => {
      if (N(this, Cr, !0, "f"), Qn(r) && (r = new Fe()), r instanceof Fe)
        return N(this, Ir, !0, "f"), this._emit("abort", r);
      if (r instanceof G) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new G(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new G(String(r)));
    }), N(this, yn, new Promise((r, o) => {
      N(this, Sr, r, "f"), N(this, vn, o, "f");
    }), "f"), N(this, An, new Promise((r, o) => {
      N(this, wr, r, "f"), N(this, Tn, o, "f");
    }), "f"), A(this, yn, "f").catch(() => {
    }), A(this, An, "f").catch(() => {
    }), N(this, $t, t, "f"), N(this, Sn, n?.logger ?? console, "f");
  }
  get response() {
    return A(this, br, "f");
  }
  get request_id() {
    return A(this, Rr, "f");
  }
  async withResponse() {
    N(this, vt, !0, "f");
    const t = await A(this, yn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Si(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const i = new Si(n, { logger: o });
    for (const a of n.messages) i._addMessageParam(a);
    return N(i, $t, {
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
    }, A(this, zo, "f"));
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
      A(this, Re, "m", Yo).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) A(this, Re, "m", Xo).call(this, c);
      if (u.controller.signal?.aborted) throw new Fe();
      A(this, Re, "m", Qo).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (N(this, br, t, "f"), N(this, Rr, t?.headers.get("request-id"), "f"), A(this, Sr, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return A(this, En, "f");
  }
  get errored() {
    return A(this, Cr, "f");
  }
  get aborted() {
    return A(this, Ir, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (A(this, We, "f")[t] || (A(this, We, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const r = A(this, We, "f")[t];
    if (!r) return this;
    const o = r.findIndex((i) => i.listener === n);
    return o >= 0 && r.splice(o, 1), this;
  }
  once(t, n) {
    return (A(this, We, "f")[t] || (A(this, We, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, r) => {
      N(this, vt, !0, "f"), t !== "error" && this.once("error", r), this.once(t, n);
    });
  }
  async done() {
    N(this, vt, !0, "f"), await A(this, An, "f");
  }
  get currentMessage() {
    return A(this, st, "f");
  }
  async finalMessage() {
    return await this.done(), A(this, Re, "m", Wo).call(this);
  }
  async finalText() {
    return await this.done(), A(this, Re, "m", Fa).call(this);
  }
  _emit(t, ...n) {
    if (A(this, En, "f")) return;
    t === "end" && (N(this, En, !0, "f"), A(this, wr, "f").call(this));
    const r = A(this, We, "f")[t];
    if (r && (A(this, We, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !A(this, vt, "f") && !r?.length && Promise.reject(o), A(this, vn, "f").call(this, o), A(this, Tn, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !A(this, vt, "f") && !r?.length && Promise.reject(o), A(this, vn, "f").call(this, o), A(this, Tn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", A(this, Re, "m", Wo).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      A(this, Re, "m", Yo).call(this), this._connected(null);
      const i = Zn.fromReadableStream(t, this.controller);
      for await (const a of i) A(this, Re, "m", Xo).call(this, a);
      if (i.controller.signal?.aborted) throw new Fe();
      A(this, Re, "m", Qo).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(st = /* @__PURE__ */ new WeakMap(), $t = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), Sr = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), wr = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), We = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), Cr = /* @__PURE__ */ new WeakMap(), Ir = /* @__PURE__ */ new WeakMap(), vt = /* @__PURE__ */ new WeakMap(), br = /* @__PURE__ */ new WeakMap(), Rr = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakMap(), zo = /* @__PURE__ */ new WeakMap(), Re = /* @__PURE__ */ new WeakSet(), Wo = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Fa = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new G("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Yo = function() {
    this.ended || N(this, st, void 0, "f");
  }, Xo = function(n) {
    if (this.ended) return;
    const r = A(this, Re, "m", Oa).call(this, n);
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
            Ba(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage(Ua(r, A(this, $t, "f"), { logger: A(this, Sn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", r.content.at(-1));
        break;
      case "message_start":
        N(this, st, r, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Qo = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = A(this, st, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return N(this, st, void 0, "f"), Ua(n, A(this, $t, "f"), { logger: A(this, Sn, "f") });
  }, Oa = function(n) {
    let r = A(this, st, "f");
    if (n.type === "message_start") {
      if (r) throw new G(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new G(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (o && Ba(o)) {
              let i = o[Ga] || "";
              i += n.delta.partial_json;
              const a = { ...o };
              Object.defineProperty(a, Ga, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (a.input = Ad(i)), r.content[n.index] = a;
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
    return new Zn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Dd = class extends X {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get($`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", or, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete($`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post($`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new G(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: I([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((r, o) => Sd.fromResponse(o.response, o.controller));
  }
}, Es = class extends X {
  constructor() {
    super(...arguments), this.batches = new Dd(this._client);
  }
  create(e, t) {
    e.model in qa && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${qa[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), cg.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const o = _d[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, o);
    }
    const r = cd(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: I([r, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Nd(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return ug.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, qa = {
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
}, cg = ["claude-mythos-preview", "claude-opus-4-6"];
Es.Batches = Dd;
var kd = class extends X {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/models/${e}`, {
      ...n,
      headers: I([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models", or, {
      query: r,
      ...t,
      headers: I([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Pr = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, wi, Ss, Hr, $d, dg = "\\n\\nHuman:", fg = "\\n\\nAssistant:", Q = class {
  constructor({ baseURL: e = Pr("ANTHROPIC_BASE_URL"), apiKey: t = Pr("ANTHROPIC_API_KEY") ?? null, authToken: n = Pr("ANTHROPIC_AUTH_TOKEN") ?? null, ...r } = {}) {
    wi.add(this), Hr.set(this, void 0);
    const o = {
      apiKey: t,
      authToken: n,
      ...r,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!o.dangerouslyAllowBrowser && Im()) throw new G(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = o.baseURL, this.timeout = o.timeout ?? Ss.DEFAULT_TIMEOUT, this.logger = o.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = wa(o.logLevel, "ClientOptions.logLevel", this) ?? wa(Pr("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = o.fetchOptions, this.maxRetries = o.maxRetries ?? 2, this.fetch = o.fetch ?? xm(), N(this, Hr, Dm, "f"), this._options = o, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return I([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return I([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return I([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return km(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Ft}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Oc()}`;
  }
  makeStatusError(e, t, n, r) {
    return we.generate(e, t, n, r);
  }
  buildURL(e, t, n) {
    const r = !A(this, wi, "m", $d).call(this) && n || this.baseURL, o = Em(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!_a(i) || !_a(a)) && (t = {
      ...a,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (o.search = this.stringifyQuery(t)), o.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new G("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
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
    return new ed(this, this.makeRequest(e, t, void 0));
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
    if (ce(this).debug(`[${c}] sending request`, At({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: i.headers
    })), r.signal?.aborted) throw new Fe();
    const f = new AbortController(), p = await this.fetchWithTimeout(a, i, u, f).catch(mi), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new Fe();
      const y = Qn(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return ce(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - ${_}`), ce(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (${_})`, At({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(r, t, n ?? c);
      throw ce(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - error; no more retries left`), ce(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (error; no more retries left)`, At({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - h,
        message: p.message
      })), y ? new Gc() : new So({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, y]) => ", " + _ + ": " + JSON.stringify(y)).join("")}] ${i.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const P = `retrying, ${t} attempts remaining`;
        return await Nm(p.body), ce(this).info(`${g} - ${P}`), ce(this).debug(`[${c}] response error (${P})`, At({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(r, t, n ?? c, p.headers);
      }
      const y = _ ? "error; no more retries left" : "error; not retryable";
      ce(this).info(`${g} - ${y}`);
      const E = await p.text().catch((P) => mi(P).message), w = Yc(E), b = w ? void 0 : E;
      throw ce(this).debug(`[${c}] response error (${y})`, At({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: b,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, w, b, p.headers);
    }
    return ce(this).info(g), ce(this).debug(`[${c}] response start`, At({
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
    return new Hm(this, n, e);
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
    return await Cm(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new G("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: i, defaultBaseURL: a } = n, u = this.buildURL(o, i, a);
    "timeout" in n && wm("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const i = I([
      o,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...Mm(),
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
    const n = I([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Qc(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : A(this, Hr, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Ss = Q, Hr = /* @__PURE__ */ new WeakMap(), wi = /* @__PURE__ */ new WeakSet(), $d = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
Q.Anthropic = Ss;
Q.HUMAN_PROMPT = dg;
Q.AI_PROMPT = fg;
Q.DEFAULT_TIMEOUT = 6e5;
Q.AnthropicError = G;
Q.APIError = we;
Q.APIConnectionError = So;
Q.APIConnectionTimeoutError = Gc;
Q.APIUserAbortError = Fe;
Q.NotFoundError = Vc;
Q.ConflictError = Jc;
Q.RateLimitError = Wc;
Q.BadRequestError = Bc;
Q.AuthenticationError = qc;
Q.InternalServerError = zc;
Q.PermissionDeniedError = Hc;
Q.UnprocessableEntityError = Kc;
Q.toFile = Ym;
var sr = class extends Q {
  constructor() {
    super(...arguments), this.completions = new Md(this), this.messages = new Es(this), this.models = new kd(this), this.beta = new xe(this);
  }
};
sr.Completions = Md;
sr.Messages = Es;
sr.Models = kd;
sr.Beta = xe;
function en(e) {
  if (Array.isArray(e)) return e.map((n) => en(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key|proxy_password|password/i.test(n) ? "[redacted]" : en(r);
  }), t;
}
function Mt(e = {}, t = {}) {
  const n = typeof t.enabled == "boolean" ? t.enabled : e.reasoning?.enabled === !0, r = n && (typeof t.includeOutput == "boolean" ? t.includeOutput : e.reasoning?.includeOutput !== !1);
  return {
    reasoningEnabled: n,
    reasoningEffort: n ? String(t.effort ?? e.reasoning?.effort ?? "") : "",
    reasoningIncludeOutput: r
  };
}
function jn(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: en({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    }),
    ...e.effectiveConfig ? { effectiveConfig: e.effectiveConfig } : {}
  };
}
function hg(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function pg(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function Ld(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function mg(e) {
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
      const r = pg(n.image_url.url);
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
function gg(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function _g(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && Ld(t) || null;
}
function yg(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: Ld(e.content) || [] } : void 0;
}
function Ha(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function Va(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: hg(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function vg(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const r = e[n];
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const o = _g(r), i = Va(r.tool_calls);
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
        const o = [Ha(r)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, o.push(Ha(e[n]));
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
          }] : [], ...Va(r.tool_calls)]
        });
        continue;
      }
      t.push({
        role: r.role,
        content: mg(r.content)
      });
    }
  }
  return t;
}
function Mr(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Ja(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function Ag(e = "auto", t = []) {
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
var Tg = class {
  constructor(e) {
    this.config = e, this.client = new sr({
      apiKey: e.apiKey,
      baseURL: Ja(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e) {
    const t = Array.isArray(e.tools) ? e.tools : [], n = t.map((i) => ({
      name: i.function.name,
      description: i.function.description,
      input_schema: i.function.parameters
    })), r = gg(e), o = {
      model: this.config.model,
      system: r,
      messages: vg(e.messages),
      ...n.length ? {
        tools: n,
        tool_choice: Ag(e.toolChoice, t)
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (o.temperature = e.temperature), e.reasoning?.enabled && (o.thinking = {
      type: "adaptive",
      display: e.reasoning.includeOutput !== !1 ? "summarized" : "omitted"
    }, o.output_config = { effort: e.reasoning.effort }), o;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = Ja(this.config.baseUrl), o = t.body || this.buildRequestBody(e);
    return jn({
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
      effectiveConfig: Mt(e, {
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
      const i = this.client.messages.stream(t, { signal: e.signal }), a = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
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
        p.length && Mr(e, {
          text: c,
          thoughts: d(),
          toolCalls: p,
          toolCallDraft: !0
        });
      };
      i.on("text", (p, m) => {
        c = m || "", Mr(e, {
          text: c,
          thoughts: d(),
          ...h().length ? {
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), i.on("thinking", (p, m) => {
        a.set("thinking:0", m || ""), Mr(e, {
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
        p?.type === "redacted_thinking" && (a.set("redacted:0", p.data || ""), Mr(e, {
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
      thoughts: e.reasoning?.includeOutput === !1 ? [] : (r.content || []).filter((i) => i.type === "thinking" || i.type === "redacted_thinking").map((i) => ({
        label: i.type === "thinking" ? "思考块" : "已脱敏思考块",
        text: i.type === "thinking" ? i.thinking || "" : i.data || ""
      })).filter((i) => i.text),
      finishReason: r.stop_reason || "stop",
      model: r.model || this.config.model,
      provider: "anthropic",
      providerPayload: yg(r),
      requestInspection: n
    };
  }
}, Eg = /* @__PURE__ */ Eo(((e, t) => {
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
})), Sg = /* @__PURE__ */ Eo(((e) => {
  var t = Eg();
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
        p.push(function(g) {
          f.retry(g) || (g && (arguments[0] = f.mainError()), m.apply(this, arguments));
        }), f.attempt(function() {
          h.apply(n, p);
        });
      }.bind(n, c), n[u].options = r;
    }
  };
})), wg = /* @__PURE__ */ Eo(((e, t) => {
  t.exports = Sg();
})), Cg = /* @__PURE__ */ Eo(((e, t) => {
  var n = wg(), r = [
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
          i(g, m, d);
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
})), Ka = /* @__PURE__ */ dm(Cg(), 1), Ig = void 0, bg = void 0;
function Rg() {
  return {
    geminiUrl: Ig,
    vertexUrl: bg
  };
}
function Pg(e, t, n, r) {
  var o, i;
  if (!e?.baseUrl) {
    const a = Rg();
    return t ? (o = a.vertexUrl) !== null && o !== void 0 ? o : n : (i = a.geminiUrl) !== null && i !== void 0 ? i : r;
  }
  return e.baseUrl;
}
var tt = class {
};
function x(e, t) {
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
function Mg(e, t) {
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
    Ci(e, o, i, 0, a);
  }
}
function Ci(e, t, n, r, o) {
  if (r >= t.length || typeof e != "object" || e === null) return;
  const i = t[r];
  if (i.endsWith("[]")) {
    const a = i.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) Ci(c, t, n, r + 1, o);
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
    i in a && Ci(a[i], t, n, r + 1, o);
  }
}
function ws(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function xg(e) {
  const t = {}, n = s(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const r = s(e, ["resourceName"]);
  return r != null && l(t, ["_url", "resourceName"], r), t;
}
function Ng(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], kg(a)), t;
}
function Dg(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], $g(a)), t;
}
function kg(e) {
  const t = {}, n = s(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => Lg(a))), l(t, ["generatedVideos"], i);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = s(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function $g(e) {
  const t = {}, n = s(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => Ug(a))), l(t, ["generatedVideos"], i);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = s(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function Lg(e) {
  const t = {}, n = s(e, ["video"]);
  return n != null && l(t, ["video"], Hg(n)), t;
}
function Ug(e) {
  const t = {}, n = s(e, ["_self"]);
  return n != null && l(t, ["video"], Vg(n)), t;
}
function Fg(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Og(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Gg(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], Bg(a)), t;
}
function Bg(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function Ud(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], qg(a)), t;
}
function qg(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function Hg(e) {
  const t = {}, n = s(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const r = s(e, ["encodedVideo"]);
  r != null && l(t, ["videoBytes"], ws(r));
  const o = s(e, ["encoding"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Vg(e) {
  const t = {}, n = s(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const r = s(e, ["bytesBase64Encoded"]);
  r != null && l(t, ["videoBytes"], ws(r));
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
var Wa;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(Wa || (Wa = {}));
var za;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(za || (za = {}));
var Ya;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(Ya || (Ya = {}));
var dt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(dt || (dt = {}));
var Xa;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(Xa || (Xa = {}));
var Qa;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(Qa || (Qa = {}));
var Za;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(Za || (Za = {}));
var ja;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(ja || (ja = {}));
var el;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(el || (el = {}));
var tl;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(tl || (tl = {}));
var nl;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(nl || (nl = {}));
var Vt;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(Vt || (Vt = {}));
var Jt;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Jt || (Jt = {}));
var rl;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(rl || (rl = {}));
var ol;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(ol || (ol = {}));
var il;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(il || (il = {}));
var sl;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(sl || (sl = {}));
var al;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(al || (al = {}));
var ll;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(ll || (ll = {}));
var ul;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(ul || (ul = {}));
var cl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(cl || (cl = {}));
var dl;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(dl || (dl = {}));
var fl;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(fl || (fl = {}));
var hl;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(hl || (hl = {}));
var no;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(no || (no = {}));
var pl;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(pl || (pl = {}));
var ml;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(ml || (ml = {}));
var gl;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(gl || (gl = {}));
var _l;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(_l || (_l = {}));
var Ii;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(Ii || (Ii = {}));
var yl;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(yl || (yl = {}));
var vl;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(vl || (vl = {}));
var Al;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(Al || (Al = {}));
var Tl;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Tl || (Tl = {}));
var El;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(El || (El = {}));
var Sl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(Sl || (Sl = {}));
var wl;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(wl || (wl = {}));
var bi;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(bi || (bi = {}));
var Cl;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(Cl || (Cl = {}));
var Il;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(Il || (Il = {}));
var ro;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(ro || (ro = {}));
var bl;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(bl || (bl = {}));
var Rl;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(Rl || (Rl = {}));
var Pl;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(Pl || (Pl = {}));
var Ml;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(Ml || (Ml = {}));
var xl;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(xl || (xl = {}));
var Nl;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(Nl || (Nl = {}));
var Dl;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(Dl || (Dl = {}));
var kl;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(kl || (kl = {}));
var $l;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})($l || ($l = {}));
var Ll;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(Ll || (Ll = {}));
var Ul;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(Fl || (Fl = {}));
var Ol;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(Ol || (Ol = {}));
var Gl;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(Gl || (Gl = {}));
var Bl;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(Bl || (Bl = {}));
var ql;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(ql || (ql = {}));
var Hl;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(Hl || (Hl = {}));
var Vl;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(Vl || (Vl = {}));
var Jl;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(Jl || (Jl = {}));
var Kl;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(Kl || (Kl = {}));
var Wl;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(Wl || (Wl = {}));
var zl;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(zl || (zl = {}));
var Yl;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(Yl || (Yl = {}));
var Kt;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(Kt || (Kt = {}));
var Ri = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, wn = class {
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
}, Xl = class {
}, Ql = class {
}, Jg = class {
}, Kg = class {
}, Wg = class {
}, zg = class {
}, Zl = class {
}, jl = class {
}, eu = class {
}, Yg = class {
}, tu = class Fd {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new Fd();
    let o;
    const i = t;
    return n ? o = Dg(i) : o = Ng(i), Object.assign(r, o), r;
  }
}, nu = class {
}, ru = class {
}, ou = class {
}, iu = class {
}, Xg = class {
}, Qg = class {
}, Zg = class {
}, jg = class Od {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new Od(), o = Gg(t);
    return Object.assign(r, o), r;
  }
}, e_ = class {
}, t_ = class {
}, n_ = class {
}, r_ = class {
}, su = class {
}, o_ = class {
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
}, i_ = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, s_ = class Gd {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new Gd(), o = Ud(t);
    return Object.assign(r, o), r;
  }
};
function V(e, t) {
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
function Bd(e, t) {
  const n = V(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function qd(e) {
  return Array.isArray(e) ? e.map((t) => oo(t)) : [oo(e)];
}
function oo(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function Hd(e) {
  const t = oo(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Vd(e) {
  const t = oo(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function au(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function Jd(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => au(t)) : [au(e)];
}
function Pi(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function lu(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function uu(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function re(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return Pi(e) ? e : {
    role: "user",
    parts: Jd(e)
  };
}
function Cs(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const r = re(n);
    return r.parts && r.parts.length > 0 && r.parts[0].text !== void 0 ? [r.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = re(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => re(n)) : [re(t)];
}
function me(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (lu(e) || uu(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [re(e)];
  }
  const t = [], n = [], r = Pi(e[0]);
  for (const o of e) {
    const i = Pi(o);
    if (i != r) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(o);
    else {
      if (lu(o) || uu(o)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(o);
    }
  }
  return r || t.push({
    role: "user",
    parts: Jd(n)
  }), t;
}
function a_(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((r) => r !== "null");
  if (n.length === 1) t.type = Object.values(dt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : dt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const r of n) t.anyOf.push({ type: Object.values(dt).includes(r.toUpperCase()) ? r.toUpperCase() : dt.TYPE_UNSPECIFIED });
  }
}
function Zt(e) {
  const t = {}, n = ["items"], r = ["anyOf"], o = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && a_(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(dt).includes(u.toUpperCase()) ? u.toUpperCase() : dt.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = Zt(u);
      else if (r.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(Zt(d));
        }
        t[a] = c;
      } else if (o.includes(a)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = Zt(h);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function Is(e) {
  return Zt(e);
}
function bs(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function Rs(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function nn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = Zt(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = Zt(t.response));
  return e;
}
function rn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function l_(e, t, n, r = 1) {
  const o = !t.startsWith(`${n}/`) && t.split("/").length === r;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : o ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : o ? `${n}/${t}` : t;
}
function nt(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return l_(e, t, "cachedContents");
}
function Kd(e) {
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
function mt(e) {
  return ws(e);
}
function u_(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function c_(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function d_(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function Wd(e) {
  var t;
  let n;
  if (u_(e) && (n = e.name), !(d_(e) && (n = e.uri, n === void 0)) && !(c_(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const r = n.split("files/")[1].match(/[a-z0-9]+/);
      if (r === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = r[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function zd(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function Yd(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (f_(e, t)) return e[t];
  return [];
}
function f_(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function h_(e, t = {}) {
  const n = e, r = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (r.responseJsonSchema = n.outputSchema), t.behavior && (r.behavior = t.behavior), { functionDeclarations: [r] };
}
function p_(e, t = {}) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const o of e) {
    const i = o.name;
    if (r.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    r.add(i);
    const a = h_(o, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function Xd(e, t) {
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
function m_(e) {
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
function Qd(e) {
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
function on(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function Zd(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function g_(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function __(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function y_(e) {
  const t = {}, n = s(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const r = s(e, ["inlinedResponses", "inlinedResponses"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => Z_(a))), l(t, ["inlinedResponses"], i);
  }
  const o = s(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function v_(e) {
  const t = {}, n = s(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const r = s(e, ["gcsDestination", "outputUriPrefix"]);
  r != null && l(t, ["gcsUri"], r);
  const o = s(e, ["bigqueryDestination", "outputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function A_(e) {
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
function Vr(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata", "displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = s(e, ["metadata", "state"]);
  o != null && l(t, ["state"], Zd(o));
  const i = s(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const a = s(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = s(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = s(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = s(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], y_(Qd(d))), t;
}
function Mi(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = s(e, ["state"]);
  o != null && l(t, ["state"], Zd(o));
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
  f != null && l(t, ["src"], T_(f));
  const p = s(e, ["outputConfig"]);
  p != null && l(t, ["dest"], v_(Qd(p)));
  const m = s(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function T_(e) {
  const t = {}, n = s(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const r = s(e, ["gcsSource", "uris"]);
  r != null && l(t, ["gcsUri"], r);
  const o = s(e, ["bigquerySource", "inputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function E_(e, t) {
  const n = {};
  if (s(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (s(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (s(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const r = s(t, ["fileName"]);
  r != null && l(n, ["fileName"], r);
  const o = s(t, ["inlinedRequests"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Q_(e, a))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function S_(e) {
  const t = {}, n = s(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const r = s(e, ["gcsUri"]);
  r != null && l(t, ["gcsSource", "uris"], r);
  const o = s(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigquerySource", "inputUri"], o), s(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function w_(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function C_(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], on(e, r)), n;
}
function I_(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], on(e, r)), n;
}
function b_(e) {
  const t = {}, n = s(e, ["content"]);
  n != null && l(t, ["content"], n);
  const r = s(e, ["citationMetadata"]);
  r != null && l(t, ["citationMetadata"], R_(r));
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
function R_(e) {
  const t = {}, n = s(e, ["citationSources"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["citations"], r);
  }
  return t;
}
function jd(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => iy(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function P_(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  if (t !== void 0 && r != null && l(t, ["batch", "displayName"], r), s(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const o = s(e, ["webhookConfig"]);
  return t !== void 0 && o != null && l(t, ["batch", "webhookConfig"], o), n;
}
function M_(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const o = s(e, ["dest"]);
  if (t !== void 0 && o != null && l(t, ["outputConfig"], A_(m_(o))), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function cu(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["_url", "model"], V(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], E_(e, Xd(e, o)));
  const i = s(t, ["config"]);
  return i != null && P_(i, n), n;
}
function x_(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], V(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["inputConfig"], S_(Xd(e, o)));
  const i = s(t, ["config"]);
  return i != null && M_(i, n), n;
}
function N_(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["batch", "displayName"], r), n;
}
function D_(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["_url", "model"], V(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], G_(e, o));
  const i = s(t, ["config"]);
  return i != null && N_(i, n), n;
}
function k_(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], on(e, r)), n;
}
function $_(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], on(e, r)), n;
}
function L_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function U_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function F_(e, t) {
  const n = {}, r = s(t, ["contents"]);
  if (r != null) {
    let i = Cs(e, r);
    Array.isArray(i) && (i = i.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const o = s(t, ["config"]);
  return o != null && (l(n, ["_self"], O_(o, n)), Mg(n, { "requests[].*": "requests[].request.*" })), n;
}
function O_(e, t) {
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
function G_(e, t) {
  const n = {}, r = s(t, ["fileName"]);
  r != null && l(n, ["file_name"], r);
  const o = s(t, ["inlinedRequests"]);
  return o != null && l(n, ["requests"], F_(e, o)), n;
}
function B_(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function q_(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function H_(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = s(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function V_(e, t, n) {
  const r = {}, o = s(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], jd(re(o)));
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
  const g = s(t, ["frequencyPenalty"]);
  g != null && l(r, ["frequencyPenalty"], g);
  const _ = s(t, ["seed"]);
  _ != null && l(r, ["seed"], _);
  const y = s(t, ["responseMimeType"]);
  y != null && l(r, ["responseMimeType"], y);
  const E = s(t, ["responseSchema"]);
  E != null && l(r, ["responseSchema"], Is(E));
  const w = s(t, ["responseJsonSchema"]);
  if (w != null && l(r, ["responseJsonSchema"], w), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const b = s(t, ["safetySettings"]);
  if (n !== void 0 && b != null) {
    let J = b;
    Array.isArray(J) && (J = J.map((K) => sy(K))), l(n, ["safetySettings"], J);
  }
  const P = s(t, ["tools"]);
  if (n !== void 0 && P != null) {
    let J = rn(P);
    Array.isArray(J) && (J = J.map((K) => ly(nn(K)))), l(n, ["tools"], J);
  }
  const k = s(t, ["toolConfig"]);
  if (n !== void 0 && k != null && l(n, ["toolConfig"], ay(k)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const S = s(t, ["cachedContent"]);
  n !== void 0 && S != null && l(n, ["cachedContent"], nt(e, S));
  const L = s(t, ["responseModalities"]);
  L != null && l(r, ["responseModalities"], L);
  const C = s(t, ["mediaResolution"]);
  C != null && l(r, ["mediaResolution"], C);
  const M = s(t, ["speechConfig"]);
  if (M != null && l(r, ["speechConfig"], bs(M)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const F = s(t, ["thinkingConfig"]);
  F != null && l(r, ["thinkingConfig"], F);
  const H = s(t, ["imageConfig"]);
  H != null && l(r, ["imageConfig"], X_(H));
  const ae = s(t, ["enableEnhancedCivicAnswers"]);
  if (ae != null && l(r, ["enableEnhancedCivicAnswers"], ae), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const W = s(t, ["serviceTier"]);
  return n !== void 0 && W != null && l(n, ["serviceTier"], W), r;
}
function J_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["candidates"]);
  if (r != null) {
    let d = r;
    Array.isArray(d) && (d = d.map((h) => b_(h))), l(t, ["candidates"], d);
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
function K_(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], on(e, r)), n;
}
function W_(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], on(e, r)), n;
}
function z_(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], __(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function Y_(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function X_(e) {
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
function Q_(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["request", "model"], V(e, r));
  const o = s(t, ["contents"]);
  if (o != null) {
    let u = me(o);
    Array.isArray(u) && (u = u.map((c) => jd(c))), l(n, ["request", "contents"], u);
  }
  const i = s(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = s(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], V_(e, a, s(n, ["request"], {}))), n;
}
function Z_(e) {
  const t = {}, n = s(e, ["response"]);
  n != null && l(t, ["response"], J_(n));
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function j_(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  if (t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), s(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function ey(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const i = s(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function ty(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && j_(n, t), t;
}
function ny(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && ey(n, t), t;
}
function ry(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["operations"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Vr(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function oy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["batchPredictionJobs"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Mi(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function iy(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], B_(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], q_(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], w_(c));
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
  const g = s(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function sy(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function ay(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], H_(r));
  const o = s(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function ly(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], Y_(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], z_(i));
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
var et;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(et || (et = {}));
var Nt = class {
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
}, uy = class extends tt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Nt(et.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = cu(this.apiClient, e), n = t._url, r = x("{model}:batchGenerateContent", n), o = t.batch.inputConfig.requests, i = o.requests, a = [];
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
      const c = x_(this.apiClient, e);
      return a = x("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Mi(d));
    } else {
      const c = cu(this.apiClient, e);
      return a = x("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Vr(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = D_(this.apiClient, e);
      return o = x("{model}:asyncBatchEmbedContent", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => Vr(u));
    }
  }
  async get(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = W_(this.apiClient, e);
      return a = x("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Mi(d));
    } else {
      const c = K_(this.apiClient, e);
      return a = x("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Vr(d));
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let i = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = I_(this.apiClient, e);
      i = x("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = C_(this.apiClient, e);
      i = x("batches/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
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
      const c = ny(e);
      return a = x("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = oy(d), f = new su();
        return Object.assign(f, h), f;
      });
    } else {
      const c = ty(e);
      return a = x("batches", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = ry(d), f = new su();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $_(this.apiClient, e);
      return a = x("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => U_(d));
    } else {
      const c = k_(this.apiClient, e);
      return a = x("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => L_(d));
    }
  }
};
function cy(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function dy(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function du(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => ky(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function fu(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => $y(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function fy(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let h = me(a);
    Array.isArray(h) && (h = h.map((f) => du(f))), l(t, ["contents"], h);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], du(re(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => Fy(f))), l(t, ["tools"], h);
  }
  const d = s(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], Ly(d)), s(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function hy(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = me(a);
    Array.isArray(f) && (f = f.map((p) => fu(p))), l(t, ["contents"], f);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], fu(re(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => Oy(p))), l(t, ["tools"], f);
  }
  const d = s(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], Uy(d));
  const h = s(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function py(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], Bd(e, r));
  const o = s(t, ["config"]);
  return o != null && fy(o, n), n;
}
function my(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], Bd(e, r));
  const o = s(t, ["config"]);
  return o != null && hy(o, n), n;
}
function gy(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nt(e, r)), n;
}
function _y(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nt(e, r)), n;
}
function yy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function vy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Ay(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function Ty(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Ey(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = s(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Sy(e) {
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
function wy(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nt(e, r)), n;
}
function Cy(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nt(e, r)), n;
}
function Iy(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], cy(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function by(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function Ry(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function Py(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function My(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && Ry(n, t), t;
}
function xy(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && Py(n, t), t;
}
function Ny(e) {
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
function Dy(e) {
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
function ky(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], Ay(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Ty(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], dy(c));
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
  const g = s(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function $y(e) {
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
function Ly(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], Ey(r));
  const o = s(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function Uy(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  if (r != null && l(t, ["functionCallingConfig"], r), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function Fy(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], by(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Iy(i));
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
function Oy(e) {
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
    Array.isArray(p) && (p = p.map((m) => Sy(m))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function Gy(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function By(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function qy(e, t) {
  const n = {}, r = s(t, ["name"]);
  r != null && l(n, ["_url", "name"], nt(e, r));
  const o = s(t, ["config"]);
  return o != null && Gy(o, n), n;
}
function Hy(e, t) {
  const n = {}, r = s(t, ["name"]);
  r != null && l(n, ["_url", "name"], nt(e, r));
  const o = s(t, ["config"]);
  return o != null && By(o, n), n;
}
var Vy = class extends tt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Nt(et.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = my(this.apiClient, e);
      return a = x("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = py(this.apiClient, e);
      return a = x("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = Cy(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = wy(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = _y(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = vy(d), f = new ou();
        return Object.assign(f, h), f;
      });
    } else {
      const c = gy(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = yy(d), f = new ou();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Hy(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = qy(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = xy(e);
      return a = x("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = Dy(d), f = new iu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = My(e);
      return a = x("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = Ny(d), f = new iu();
        return Object.assign(f, h), f;
      });
    }
  }
};
function ft(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, r = Object.getOwnPropertySymbols(e); o < r.length; o++) t.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[o]) && (n[r[o]] = e[r[o]]);
  return n;
}
function hu(e) {
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
function B(e) {
  return this instanceof B ? (this.v = e, this) : new B(e);
}
function Oe(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var r = n.apply(e, t || []), o, i = [];
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
      return new Promise(function(y, E) {
        i.push([
          m,
          _,
          y,
          E
        ]) > 1 || c(m, _);
      });
    }, g && (o[m] = g(o[m])));
  }
  function c(m, g) {
    try {
      d(r[m](g));
    } catch (_) {
      p(i[0][3], _);
    }
  }
  function d(m) {
    m.value instanceof B ? Promise.resolve(m.value.v).then(h, f) : p(i[0][2], m);
  }
  function h(m) {
    c("next", m);
  }
  function f(m) {
    c("throw", m);
  }
  function p(m, g) {
    m(g), i.shift(), i.length && c(i[0][0], i[0][1]);
  }
}
function Ge(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof hu == "function" ? hu(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
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
function Jy(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : ef(n);
}
function ef(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function Ky(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function pu(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let r = 0;
  for (; r < n; ) if (e[r].role === "user")
    t.push(e[r]), r++;
  else {
    const o = [];
    let i = !0;
    for (; r < n && e[r].role === "model"; )
      o.push(e[r]), i && !ef(e[r]) && (i = !1), r++;
    i ? t.push(...o) : t.pop();
  }
  return t;
}
var Wy = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new zy(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, zy = class {
  constructor(e, t, n, r = {}, o = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = r, this.history = o, this.sendPromise = Promise.resolve(), Ky(o);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = re(e.message), r = this.modelsModule.generateContent({
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
    const n = re(e.message), r = this.modelsModule.generateContentStream({
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
    const t = e ? pu(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return Oe(this, arguments, function* () {
      var r, o, i, a, u, c;
      const d = [];
      try {
        for (var h = !0, f = Ge(e), p; p = yield B(f.next()), r = p.done, !r; h = !0) {
          a = p.value, h = !1;
          const m = a;
          if (Jy(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield B(m);
        }
      } catch (m) {
        o = { error: m };
      } finally {
        try {
          !h && !r && (i = f.return) && (yield B(i.call(f)));
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
    }), n && n.length > 0 ? this.history.push(...pu(n)) : this.history.push(e), this.history.push(...r);
  }
}, tf = class nf extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, nf.prototype);
  }
};
function Yy(e) {
  const t = {}, n = s(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function Xy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Qy(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Wd(n)), t;
}
function Zy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function jy(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Wd(n)), t;
}
function ev(e) {
  const t = {}, n = s(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function tv(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function nv(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && tv(n, t), t;
}
function rv(e) {
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
function ov(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["files"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(t, ["files"], o);
  }
  return t;
}
var iv = class extends tt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Nt(et.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const a = nv(e);
      return o = x("files", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
        const c = rv(u), d = new e_();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Yy(e);
      return o = x("upload/v1beta/files", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = Xy(u), d = new t_();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = jy(e);
      return o = x("files/{file}", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
      const a = Qy(e);
      return o = x("files/{file}", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
        const c = Zy(u), d = new n_();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = ev(e);
      return o = x("files:register", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = ov(u), d = new r_();
        return Object.assign(d, c), d;
      });
    }
  }
};
function mu(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function sv(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Jr(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function av(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => wv(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function lv(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => Cv(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function uv(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function cv(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function dv(e) {
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
function fv(e) {
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
  const g = s(e, ["responseModalities"]);
  g != null && l(t, ["responseModalities"], g);
  const _ = s(e, ["responseSchema"]);
  _ != null && l(t, ["responseSchema"], _);
  const y = s(e, ["routingConfig"]);
  y != null && l(t, ["routingConfig"], y);
  const E = s(e, ["seed"]);
  E != null && l(t, ["seed"], E);
  const w = s(e, ["speechConfig"]);
  w != null && l(t, ["speechConfig"], w);
  const b = s(e, ["stopSequences"]);
  b != null && l(t, ["stopSequences"], b);
  const P = s(e, ["temperature"]);
  P != null && l(t, ["temperature"], P);
  const k = s(e, ["thinkingConfig"]);
  k != null && l(t, ["thinkingConfig"], k);
  const S = s(e, ["topK"]);
  S != null && l(t, ["topK"], S);
  const L = s(e, ["topP"]);
  if (L != null && l(t, ["topP"], L), s(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function hv(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], sv(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function pv(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function mv(e, t) {
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
  ], Rs(f));
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
  const g = s(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], av(re(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let C = rn(_);
    Array.isArray(C) && (C = C.map((M) => Rv(nn(M)))), l(t, ["setup", "tools"], C);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], bv(y));
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], mu(E));
  const w = s(e, ["outputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "outputAudioTranscription"], mu(w));
  const b = s(e, ["realtimeInputConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "realtimeInputConfig"], b);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const k = s(e, ["proactivity"]);
  if (t !== void 0 && k != null && l(t, ["setup", "proactivity"], k), s(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = s(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const L = s(e, ["safetySettings"]);
  if (t !== void 0 && L != null) {
    let C = L;
    Array.isArray(C) && (C = C.map((M) => Iv(M))), l(t, ["setup", "safetySettings"], C);
  }
  return n;
}
function gv(e, t) {
  const n = {}, r = s(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], fv(r));
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
  ], Rs(f));
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
  const g = s(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], lv(re(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let M = rn(_);
    Array.isArray(M) && (M = M.map((F) => Pv(nn(F)))), l(t, ["setup", "tools"], M);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], y);
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], E);
  const w = s(e, ["outputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "outputAudioTranscription"], w);
  const b = s(e, ["realtimeInputConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "realtimeInputConfig"], b);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const k = s(e, ["proactivity"]);
  t !== void 0 && k != null && l(t, ["setup", "proactivity"], k);
  const S = s(e, ["explicitVadSignal"]);
  t !== void 0 && S != null && l(t, ["setup", "explicitVadSignal"], S);
  const L = s(e, ["avatarConfig"]);
  t !== void 0 && L != null && l(t, ["setup", "avatarConfig"], L);
  const C = s(e, ["safetySettings"]);
  if (t !== void 0 && C != null) {
    let M = C;
    Array.isArray(M) && (M = M.map((F) => F)), l(t, ["setup", "safetySettings"], M);
  }
  return n;
}
function _v(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], V(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], mv(o, n)), n;
}
function yv(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], V(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], gv(o, n)), n;
}
function vv(e) {
  const t = {}, n = s(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function Av(e) {
  const t = {}, n = s(e, ["weightedPrompts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["weightedPrompts"], r);
  }
  return t;
}
function Tv(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = qd(n);
    Array.isArray(d) && (d = d.map((h) => Jr(h))), l(t, ["mediaChunks"], d);
  }
  const r = s(e, ["audio"]);
  r != null && l(t, ["audio"], Jr(Vd(r)));
  const o = s(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], Jr(Hd(i)));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function Ev(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = qd(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const r = s(e, ["audio"]);
  r != null && l(t, ["audio"], Vd(r));
  const o = s(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], Hd(i));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function Sv(e) {
  const t = {}, n = s(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const r = s(e, ["serverContent"]);
  r != null && l(t, ["serverContent"], r);
  const o = s(e, ["toolCall"]);
  o != null && l(t, ["toolCall"], o);
  const i = s(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const a = s(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], Mv(a));
  const u = s(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = s(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = s(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = s(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], xv(h)), t;
}
function wv(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], uv(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], cv(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Jr(c));
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
  const g = s(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function Cv(e) {
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
function Iv(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function bv(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function Rv(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], pv(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], hv(i));
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
function Pv(e) {
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
    Array.isArray(p) && (p = p.map((m) => dv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function Mv(e) {
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
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["promptTokensDetails"], m);
  }
  const d = s(e, ["cacheTokensDetails"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["cacheTokensDetails"], m);
  }
  const h = s(e, ["candidatesTokensDetails"]);
  if (h != null) {
    let m = h;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["responseTokensDetails"], m);
  }
  const f = s(e, ["toolUsePromptTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["toolUsePromptTokensDetails"], m);
  }
  const p = s(e, ["trafficType"]);
  return p != null && l(t, ["trafficType"], p), t;
}
function xv(e) {
  const t = {}, n = s(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function Nv(e, t) {
  const n = {}, r = s(e, ["apiKey"]);
  if (r != null && l(n, ["apiKey"], r), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function Dv(e, t) {
  const n = {}, r = s(e, ["data"]);
  if (r != null && l(n, ["data"], r), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function kv(e, t) {
  const n = {}, r = s(e, ["content"]);
  r != null && l(n, ["content"], r);
  const o = s(e, ["citationMetadata"]);
  o != null && l(n, ["citationMetadata"], $v(o));
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
    Array.isArray(m) && (m = m.map((g) => g)), l(n, ["safetyRatings"], m);
  }
  const p = s(e, ["urlContextMetadata"]);
  return p != null && l(n, ["urlContextMetadata"], p), n;
}
function $v(e, t) {
  const n = {}, r = s(e, ["citationSources"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(n, ["citations"], o);
  }
  return n;
}
function Lv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let a = me(i);
    Array.isArray(a) && (a = a.map((u) => sn(u))), l(r, ["contents"], a);
  }
  return r;
}
function Uv(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["tokensInfo"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function Fv(e, t) {
  const n = {}, r = s(e, ["values"]);
  r != null && l(n, ["values"], r);
  const o = s(e, ["statistics"]);
  return o != null && l(n, ["statistics"], Ov(o)), n;
}
function Ov(e, t) {
  const n = {}, r = s(e, ["truncated"]);
  r != null && l(n, ["truncated"], r);
  const o = s(e, ["token_count"]);
  return o != null && l(n, ["tokenCount"], o), n;
}
function ar(e, t) {
  const n = {}, r = s(e, ["parts"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => zA(a))), l(n, ["parts"], i);
  }
  const o = s(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function sn(e, t) {
  const n = {}, r = s(e, ["parts"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => YA(a))), l(n, ["parts"], i);
  }
  const o = s(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function Gv(e, t) {
  const n = {}, r = s(e, ["controlType"]);
  r != null && l(n, ["controlType"], r);
  const o = s(e, ["enableControlImageComputation"]);
  return o != null && l(n, ["computeControl"], o), n;
}
function Bv(e, t) {
  const n = {};
  if (s(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (s(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (s(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function qv(e, t, n) {
  const r = {}, o = s(e, ["systemInstruction"]);
  t !== void 0 && o != null && l(t, ["systemInstruction"], sn(re(o)));
  const i = s(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => af(c))), l(t, ["tools"], u);
  }
  const a = s(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], DA(a)), r;
}
function Hv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = me(i);
    Array.isArray(u) && (u = u.map((c) => ar(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && Bv(a), r;
}
function Vv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = me(i);
    Array.isArray(u) && (u = u.map((c) => sn(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && qv(a, r), r;
}
function Jv(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["totalTokens"]);
  o != null && l(n, ["totalTokens"], o);
  const i = s(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function Kv(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["totalTokens"]);
  return o != null && l(n, ["totalTokens"], o), n;
}
function Wv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], V(e, o)), r;
}
function zv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], V(e, o)), r;
}
function Yv(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function Xv(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function Qv(e, t, n) {
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
  const g = s(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const _ = s(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const y = s(e, ["outputCompressionQuality"]);
  t !== void 0 && y != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], y);
  const E = s(e, ["addWatermark"]);
  t !== void 0 && E != null && l(t, ["parameters", "addWatermark"], E);
  const w = s(e, ["labels"]);
  t !== void 0 && w != null && l(t, ["labels"], w);
  const b = s(e, ["editMode"]);
  t !== void 0 && b != null && l(t, ["parameters", "editMode"], b);
  const P = s(e, ["baseSteps"]);
  return t !== void 0 && P != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], P), r;
}
function Zv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => tT(d))), l(r, ["instances[0]", "referenceImages"], c);
  }
  const u = s(t, ["config"]);
  return u != null && Qv(u, r), r;
}
function jv(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Io(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function eA(e, t, n) {
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
function tA(e, t, n) {
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
function nA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let d = Cs(e, i);
    Array.isArray(d) && (d = d.map((h) => h)), l(r, ["requests[]", "content"], d);
  }
  const a = s(t, ["content"]);
  a != null && ar(re(a));
  const u = s(t, ["config"]);
  u != null && eA(u, r);
  const c = s(t, ["model"]);
  return c !== void 0 && l(r, ["requests[]", "model"], V(e, c)), r;
}
function rA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  let i = s(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = s(t, ["contents"]);
    if (c != null) {
      let d = Cs(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(r, ["instances[]", "content"], d);
    }
  }
  let a = s(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = s(t, ["content"]);
    c != null && l(r, ["content"], sn(re(c)));
  }
  const u = s(t, ["config"]);
  return u != null && tA(u, r, n), r;
}
function oA(e, t) {
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
function iA(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions[]", "embeddings"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => Fv(u))), l(n, ["embeddings"], a);
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
function sA(e, t) {
  const n = {}, r = s(e, ["endpoint"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["deployedModelId"]);
  return o != null && l(n, ["deployedModelId"], o), n;
}
function aA(e, t) {
  const n = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["fileUri"]);
  r != null && l(n, ["fileUri"], r);
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function lA(e, t) {
  const n = {}, r = s(e, ["id"]);
  r != null && l(n, ["id"], r);
  const o = s(e, ["args"]);
  o != null && l(n, ["args"], o);
  const i = s(e, ["name"]);
  if (i != null && l(n, ["name"], i), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function uA(e, t) {
  const n = {}, r = s(e, ["allowedFunctionNames"]);
  r != null && l(n, ["allowedFunctionNames"], r);
  const o = s(e, ["mode"]);
  if (o != null && l(n, ["mode"], o), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function cA(e, t) {
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
function dA(e, t, n, r) {
  const o = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], ar(re(i)));
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
  const g = s(t, ["presencePenalty"]);
  g != null && l(o, ["presencePenalty"], g);
  const _ = s(t, ["frequencyPenalty"]);
  _ != null && l(o, ["frequencyPenalty"], _);
  const y = s(t, ["seed"]);
  y != null && l(o, ["seed"], y);
  const E = s(t, ["responseMimeType"]);
  E != null && l(o, ["responseMimeType"], E);
  const w = s(t, ["responseSchema"]);
  w != null && l(o, ["responseSchema"], Is(w));
  const b = s(t, ["responseJsonSchema"]);
  if (b != null && l(o, ["responseJsonSchema"], b), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = s(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let K = P;
    Array.isArray(K) && (K = K.map((fe) => nT(fe))), l(n, ["safetySettings"], K);
  }
  const k = s(t, ["tools"]);
  if (n !== void 0 && k != null) {
    let K = rn(k);
    Array.isArray(K) && (K = K.map((fe) => cT(nn(fe)))), l(n, ["tools"], K);
  }
  const S = s(t, ["toolConfig"]);
  if (n !== void 0 && S != null && l(n, ["toolConfig"], lT(S)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const L = s(t, ["cachedContent"]);
  n !== void 0 && L != null && l(n, ["cachedContent"], nt(e, L));
  const C = s(t, ["responseModalities"]);
  C != null && l(o, ["responseModalities"], C);
  const M = s(t, ["mediaResolution"]);
  M != null && l(o, ["mediaResolution"], M);
  const F = s(t, ["speechConfig"]);
  if (F != null && l(o, ["speechConfig"], bs(F)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = s(t, ["thinkingConfig"]);
  H != null && l(o, ["thinkingConfig"], H);
  const ae = s(t, ["imageConfig"]);
  ae != null && l(o, ["imageConfig"], FA(ae));
  const W = s(t, ["enableEnhancedCivicAnswers"]);
  if (W != null && l(o, ["enableEnhancedCivicAnswers"], W), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const J = s(t, ["serviceTier"]);
  return n !== void 0 && J != null && l(n, ["serviceTier"], J), o;
}
function fA(e, t, n, r) {
  const o = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], sn(re(i)));
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
  const g = s(t, ["presencePenalty"]);
  g != null && l(o, ["presencePenalty"], g);
  const _ = s(t, ["frequencyPenalty"]);
  _ != null && l(o, ["frequencyPenalty"], _);
  const y = s(t, ["seed"]);
  y != null && l(o, ["seed"], y);
  const E = s(t, ["responseMimeType"]);
  E != null && l(o, ["responseMimeType"], E);
  const w = s(t, ["responseSchema"]);
  w != null && l(o, ["responseSchema"], Is(w));
  const b = s(t, ["responseJsonSchema"]);
  b != null && l(o, ["responseJsonSchema"], b);
  const P = s(t, ["routingConfig"]);
  P != null && l(o, ["routingConfig"], P);
  const k = s(t, ["modelSelectionConfig"]);
  k != null && l(o, ["modelConfig"], k);
  const S = s(t, ["safetySettings"]);
  if (n !== void 0 && S != null) {
    let De = S;
    Array.isArray(De) && (De = De.map((qo) => qo)), l(n, ["safetySettings"], De);
  }
  const L = s(t, ["tools"]);
  if (n !== void 0 && L != null) {
    let De = rn(L);
    Array.isArray(De) && (De = De.map((qo) => af(nn(qo)))), l(n, ["tools"], De);
  }
  const C = s(t, ["toolConfig"]);
  n !== void 0 && C != null && l(n, ["toolConfig"], uT(C));
  const M = s(t, ["labels"]);
  n !== void 0 && M != null && l(n, ["labels"], M);
  const F = s(t, ["cachedContent"]);
  n !== void 0 && F != null && l(n, ["cachedContent"], nt(e, F));
  const H = s(t, ["responseModalities"]);
  H != null && l(o, ["responseModalities"], H);
  const ae = s(t, ["mediaResolution"]);
  ae != null && l(o, ["mediaResolution"], ae);
  const W = s(t, ["speechConfig"]);
  W != null && l(o, ["speechConfig"], bs(W));
  const J = s(t, ["audioTimestamp"]);
  J != null && l(o, ["audioTimestamp"], J);
  const K = s(t, ["thinkingConfig"]);
  K != null && l(o, ["thinkingConfig"], K);
  const fe = s(t, ["imageConfig"]);
  if (fe != null && l(o, ["imageConfig"], OA(fe)), s(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Je = s(t, ["modelArmorConfig"]);
  n !== void 0 && Je != null && l(n, ["modelArmorConfig"], Je);
  const gt = s(t, ["serviceTier"]);
  return n !== void 0 && gt != null && l(n, ["serviceTier"], gt), o;
}
function gu(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = me(i);
    Array.isArray(u) && (u = u.map((c) => ar(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(r, ["generationConfig"], dA(e, a, r)), r;
}
function _u(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = me(i);
    Array.isArray(u) && (u = u.map((c) => sn(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(r, ["generationConfig"], fA(e, a, r)), r;
}
function yu(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["candidates"]);
  if (o != null) {
    let h = o;
    Array.isArray(h) && (h = h.map((f) => kv(f))), l(n, ["candidates"], h);
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
function vu(e, t) {
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
function hA(e, t, n) {
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
  const g = s(e, ["imageSize"]);
  if (t !== void 0 && g != null && l(t, ["parameters", "sampleImageSize"], g), s(e, ["enhancePrompt"]) !== void 0) throw new Error("enhancePrompt parameter is not supported in Gemini API.");
  return r;
}
function pA(e, t, n) {
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
  const g = s(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const _ = s(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const y = s(e, ["outputCompressionQuality"]);
  t !== void 0 && y != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], y);
  const E = s(e, ["addWatermark"]);
  t !== void 0 && E != null && l(t, ["parameters", "addWatermark"], E);
  const w = s(e, ["labels"]);
  t !== void 0 && w != null && l(t, ["labels"], w);
  const b = s(e, ["imageSize"]);
  t !== void 0 && b != null && l(t, ["parameters", "sampleImageSize"], b);
  const P = s(e, ["enhancePrompt"]);
  return t !== void 0 && P != null && l(t, ["parameters", "enhancePrompt"], P), r;
}
function mA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && hA(a, r), r;
}
function gA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && pA(a, r), r;
}
function _A(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => PA(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], of(i)), n;
}
function yA(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => Io(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], sf(i)), n;
}
function vA(e, t, n) {
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
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], bo(f));
  const p = s(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => ST(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (s(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (s(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = s(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), r;
}
function AA(e, t, n) {
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
  const g = s(e, ["enhancePrompt"]);
  t !== void 0 && g != null && l(t, ["parameters", "enhancePrompt"], g);
  const _ = s(e, ["generateAudio"]);
  t !== void 0 && _ != null && l(t, ["parameters", "generateAudio"], _);
  const y = s(e, ["lastFrame"]);
  t !== void 0 && y != null && l(t, ["instances[0]", "lastFrame"], Be(y));
  const E = s(e, ["referenceImages"]);
  if (t !== void 0 && E != null) {
    let k = E;
    Array.isArray(k) && (k = k.map((S) => wT(S))), l(t, ["instances[0]", "referenceImages"], k);
  }
  const w = s(e, ["mask"]);
  t !== void 0 && w != null && l(t, ["instances[0]", "mask"], ET(w));
  const b = s(e, ["compressionQuality"]);
  t !== void 0 && b != null && l(t, ["parameters", "compressionQuality"], b);
  const P = s(e, ["labels"]);
  if (t !== void 0 && P != null && l(t, ["labels"], P), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return r;
}
function TA(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], CA(u)), n;
}
function EA(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response"]);
  return u != null && l(n, ["response"], IA(u)), n;
}
function SA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], bo(a));
  const u = s(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], lf(u));
  const c = s(t, ["source"]);
  c != null && bA(c, r);
  const d = s(t, ["config"]);
  return d != null && vA(d, r), r;
}
function wA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], Be(a));
  const u = s(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], uf(u));
  const c = s(t, ["source"]);
  c != null && RA(c, r);
  const d = s(t, ["config"]);
  return d != null && AA(d, r), r;
}
function CA(e, t) {
  const n = {}, r = s(e, ["generatedSamples"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => xA(u))), l(n, ["generatedVideos"], a);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function IA(e, t) {
  const n = {}, r = s(e, ["videos"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => NA(u))), l(n, ["generatedVideos"], a);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function bA(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], bo(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], lf(a)), r;
}
function RA(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Be(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], uf(a)), r;
}
function PA(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["image"], GA(r));
  const o = s(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const i = s(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], of(i)), n;
}
function Io(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["image"], rf(r));
  const o = s(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const i = s(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], sf(i));
  const a = s(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function MA(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["mask"], rf(r));
  const o = s(e, ["labels"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["labels"], i);
  }
  return n;
}
function xA(e, t) {
  const n = {}, r = s(e, ["video"]);
  return r != null && l(n, ["video"], AT(r)), n;
}
function NA(e, t) {
  const n = {}, r = s(e, ["_self"]);
  return r != null && l(n, ["video"], TT(r)), n;
}
function DA(e, t) {
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
  const g = s(e, ["responseMimeType"]);
  g != null && l(n, ["responseMimeType"], g);
  const _ = s(e, ["responseModalities"]);
  _ != null && l(n, ["responseModalities"], _);
  const y = s(e, ["responseSchema"]);
  y != null && l(n, ["responseSchema"], y);
  const E = s(e, ["routingConfig"]);
  E != null && l(n, ["routingConfig"], E);
  const w = s(e, ["seed"]);
  w != null && l(n, ["seed"], w);
  const b = s(e, ["speechConfig"]);
  b != null && l(n, ["speechConfig"], b);
  const P = s(e, ["stopSequences"]);
  P != null && l(n, ["stopSequences"], P);
  const k = s(e, ["temperature"]);
  k != null && l(n, ["temperature"], k);
  const S = s(e, ["thinkingConfig"]);
  S != null && l(n, ["thinkingConfig"], S);
  const L = s(e, ["topK"]);
  L != null && l(n, ["topK"], L);
  const C = s(e, ["topP"]);
  if (C != null && l(n, ["topP"], C), s(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function kA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], V(e, o)), r;
}
function $A(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], V(e, o)), r;
}
function LA(e, t) {
  const n = {}, r = s(e, ["authConfig"]);
  r != null && l(n, ["authConfig"], Nv(r));
  const o = s(e, ["enableWidget"]);
  return o != null && l(n, ["enableWidget"], o), n;
}
function UA(e, t) {
  const n = {}, r = s(e, ["searchTypes"]);
  if (r != null && l(n, ["searchTypes"], r), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(n, ["timeRangeFilter"], o), n;
}
function FA(e, t) {
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
function OA(e, t) {
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
function GA(e, t) {
  const n = {}, r = s(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], mt(r));
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function rf(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], mt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function bo(e, t) {
  const n = {};
  if (s(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const r = s(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], mt(r));
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function Be(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], mt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function BA(e, t, n, r) {
  const o = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], zd(e, c)), o;
}
function qA(e, t, n, r) {
  const o = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], zd(e, c)), o;
}
function HA(e, t, n) {
  const r = {}, o = s(t, ["config"]);
  return o != null && BA(e, o, r), r;
}
function VA(e, t, n) {
  const r = {}, o = s(t, ["config"]);
  return o != null && qA(e, o, r), r;
}
function JA(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = Yd(i);
    Array.isArray(a) && (a = a.map((u) => xi(u))), l(n, ["models"], a);
  }
  return n;
}
function KA(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = Yd(i);
    Array.isArray(a) && (a = a.map((u) => Ni(u))), l(n, ["models"], a);
  }
  return n;
}
function WA(e, t) {
  const n = {}, r = s(e, ["maskMode"]);
  r != null && l(n, ["maskMode"], r);
  const o = s(e, ["segmentationClasses"]);
  o != null && l(n, ["maskClasses"], o);
  const i = s(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function xi(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const i = s(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = s(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = s(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], dT(u));
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
  const g = s(e, ["topK"]);
  g != null && l(n, ["topK"], g);
  const _ = s(e, ["thinking"]);
  return _ != null && l(n, ["thinking"], _), n;
}
function Ni(e, t) {
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
    Array.isArray(p) && (p = p.map((m) => sA(m))), l(n, ["endpoints"], p);
  }
  const c = s(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = s(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], fT(d));
  const h = s(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = s(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function zA(e, t) {
  const n = {}, r = s(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const i = s(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = s(e, ["fileData"]);
  a != null && l(n, ["fileData"], aA(a));
  const u = s(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], lA(u));
  const c = s(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = s(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], Dv(d));
  const h = s(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = s(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = s(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = s(e, ["videoMetadata"]);
  m != null && l(n, ["videoMetadata"], m);
  const g = s(e, ["toolCall"]);
  g != null && l(n, ["toolCall"], g);
  const _ = s(e, ["toolResponse"]);
  _ != null && l(n, ["toolResponse"], _);
  const y = s(e, ["partMetadata"]);
  return y != null && l(n, ["partMetadata"], y), n;
}
function YA(e, t) {
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
function XA(e, t) {
  const n = {}, r = s(e, ["productImage"]);
  return r != null && l(n, ["image"], Be(r)), n;
}
function QA(e, t, n) {
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
  const g = s(e, ["labels"]);
  return t !== void 0 && g != null && l(t, ["labels"], g), r;
}
function ZA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["source"]);
  i != null && eT(i, r);
  const a = s(t, ["config"]);
  return a != null && QA(a, r), r;
}
function jA(e, t) {
  const n = {}, r = s(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => Io(i))), l(n, ["generatedImages"], o);
  }
  return n;
}
function eT(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], Be(i));
  const a = s(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => XA(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return r;
}
function tT(e, t) {
  const n = {}, r = s(e, ["referenceImage"]);
  r != null && l(n, ["referenceImage"], Be(r));
  const o = s(e, ["referenceId"]);
  o != null && l(n, ["referenceId"], o);
  const i = s(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const a = s(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], WA(a));
  const u = s(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], Gv(u));
  const c = s(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = s(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function of(e, t) {
  const n = {}, r = s(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = s(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function sf(e, t) {
  const n = {}, r = s(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = s(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function nT(e, t) {
  const n = {}, r = s(e, ["category"]);
  if (r != null && l(n, ["category"], r), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(n, ["threshold"], o), n;
}
function rT(e, t) {
  const n = {}, r = s(e, ["image"]);
  return r != null && l(n, ["image"], Be(r)), n;
}
function oT(e, t, n) {
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
function iT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["source"]);
  i != null && aT(i, r);
  const a = s(t, ["config"]);
  return a != null && oT(a, r), r;
}
function sT(e, t) {
  const n = {}, r = s(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => MA(i))), l(n, ["generatedMasks"], o);
  }
  return n;
}
function aT(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Be(i));
  const a = s(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], rT(a)), r;
}
function lT(e, t) {
  const n = {}, r = s(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = s(e, ["functionCallingConfig"]);
  o != null && l(n, ["functionCallingConfig"], uA(o));
  const i = s(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function uT(e, t) {
  const n = {}, r = s(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = s(e, ["functionCallingConfig"]);
  if (o != null && l(n, ["functionCallingConfig"], o), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function cT(e, t) {
  const n = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const r = s(e, ["computerUse"]);
  r != null && l(n, ["computerUse"], r);
  const o = s(e, ["fileSearch"]);
  o != null && l(n, ["fileSearch"], o);
  const i = s(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], UA(i));
  const a = s(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], LA(a));
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
function af(e, t) {
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
    Array.isArray(m) && (m = m.map((g) => cA(g))), l(n, ["functionDeclarations"], m);
  }
  const h = s(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = s(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = s(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function dT(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function fT(e, t) {
  const n = {}, r = s(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function hT(e, t, n) {
  const r = {}, o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function pT(e, t, n) {
  const r = {}, o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function mT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "name"], V(e, o));
  const i = s(t, ["config"]);
  return i != null && hT(i, r), r;
}
function gT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["config"]);
  return i != null && pT(i, r), r;
}
function _T(e, t, n) {
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
  const g = s(e, ["mode"]);
  return t !== void 0 && g != null && l(t, ["parameters", "mode"], g), r;
}
function yT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["image"]);
  i != null && l(r, ["instances[0]", "image"], Be(i));
  const a = s(t, ["upscaleFactor"]);
  a != null && l(r, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = s(t, ["config"]);
  return u != null && _T(u, r), r;
}
function vT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Io(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function AT(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["encodedVideo"]);
  o != null && l(n, ["videoBytes"], mt(o));
  const i = s(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function TT(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["videoBytes"], mt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function ET(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["_self"], Be(r));
  const o = s(e, ["maskMode"]);
  return o != null && l(n, ["maskMode"], o), n;
}
function ST(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["image"], bo(r));
  const o = s(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function wT(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["image"], Be(r));
  const o = s(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function lf(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["videoBytes"]);
  o != null && l(n, ["encodedVideo"], mt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function uf(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["videoBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], mt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function CT(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["displayName"], r), n;
}
function IT(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && CT(n, t), t;
}
function bT(e, t) {
  const n = {}, r = s(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function RT(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = s(e, ["config"]);
  return r != null && bT(r, t), t;
}
function PT(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function MT(e, t) {
  const n = {}, r = s(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["customMetadata"], i);
  }
  const o = s(e, ["chunkingConfig"]);
  return t !== void 0 && o != null && l(t, ["chunkingConfig"], o), n;
}
function xT(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], DT(a)), t;
}
function NT(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = s(e, ["fileName"]);
  r != null && l(t, ["fileName"], r);
  const o = s(e, ["config"]);
  return o != null && MT(o, t), t;
}
function DT(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function kT(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function $T(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && kT(n, t), t;
}
function LT(e) {
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
function cf(e, t) {
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
function UT(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = s(e, ["config"]);
  return r != null && cf(r, t), t;
}
function FT(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var OT = "Content-Type", GT = "X-Server-Timeout", BT = "User-Agent", Di = "x-goog-api-client", qT = "google-genai-sdk/1.50.1", HT = "v1beta1", VT = "v1beta", JT = /* @__PURE__ */ new Set(["us", "eu"]), KT = 5, WT = [
  408,
  429,
  500,
  502,
  503,
  504
], zT = class {
  constructor(e) {
    var t, n, r;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const o = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (o.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? o.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && JT.has(this.clientOptions.location) ? o.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (o.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), o.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : HT;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), o.apiVersion = (r = this.clientOptions.apiVersion) !== null && r !== void 0 ? r : VT, o.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === bi.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
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
    return t && t.extraBody !== null && YT(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Au(r), new Ri(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await Au(r), this.processStreamResponse(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  processStreamResponse(e) {
    return Oe(this, arguments, function* () {
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
          const { done: c, value: d } = yield B(r.read());
          if (c) {
            if (i.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const h = o.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(h);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, y = g.code, E = `got status: ${_}. ${JSON.stringify(m)}`;
              if (y >= 400 && y < 600) throw new tf({
                message: E,
                status: y
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
              const y = i.indexOf(_);
              y !== -1 && (f === -1 || y < f) && (f = y, p = _.length);
            }
            if (f === -1) break;
            const m = i.substring(0, f);
            i = i.substring(f + p);
            const g = m.trim();
            if (g.startsWith(a)) {
              const _ = g.substring(5).trim();
              try {
                yield yield B(new Ri(new Response(_, {
                  headers: e?.headers,
                  status: e?.status,
                  statusText: e?.statusText
                })));
              } catch (y) {
                throw new Error(`exception parsing stream chunk ${_}. ${y}`);
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
      throw WT.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new Ka.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, Ka.default)(o, { retries: ((n = r.attempts) !== null && n !== void 0 ? n : KT) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = qT + " " + this.clientOptions.userAgentExtra;
    return e[BT] = t, e[Di] = t, e[OT] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [r, o] of Object.entries(e.headers)) n.append(r, o);
      e.timeout && e.timeout > 0 && n.append(GT, String(Math.ceil(e.timeout / 1e3)));
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
    const u = { file: r }, c = this.getFileName(e), d = x("upload/v1beta/files", u._url), h = await this.fetchUploadUrl(d, r.sizeBytes, r.mimeType, c, u, t?.httpOptions);
    return o.upload(e, h, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var r;
    const o = this.clientOptions.uploader, i = await o.stat(t), a = String(i.size), u = (r = n?.mimeType) !== null && r !== void 0 ? r : i.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), h = {};
    n != null && cf(n, h);
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
async function Au(e) {
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
    throw n >= 400 && n < 600 ? new tf({
      message: o,
      status: n
    }) : new Error(o);
  }
}
function YT(e, t) {
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
var XT = "mcp_used/unknown", QT = !1;
function df(e) {
  for (const t of e)
    if (ZT(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return QT;
}
function ff(e) {
  var t;
  e[Di] = (((t = e[Di]) !== null && t !== void 0 ? t : "") + ` ${XT}`).trimStart();
}
function ZT(e) {
  return e !== null && typeof e == "object" && e instanceof eE;
}
function jT(e) {
  return Oe(this, arguments, function* (n, r = 100) {
    let o, i = 0;
    for (; i < r; ) {
      const a = yield B(n.listTools({ cursor: o }));
      for (const u of a.tools)
        yield yield B(u), i++;
      if (!a.nextCursor) break;
      o = a.nextCursor;
    }
  });
}
var eE = class hf {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new hf(t, n);
  }
  async initialize() {
    var t, n, r, o;
    if (this.mcpTools.length > 0) return;
    const i = {}, a = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, Ge(jT(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
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
    return await this.initialize(), p_(this.mcpTools, this.config);
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
async function tE(e, t, n) {
  const r = new i_();
  let o;
  n.data instanceof Blob ? o = JSON.parse(await n.data.text()) : o = JSON.parse(n.data), Object.assign(r, o), t(r);
}
var nE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), o = this.apiClient.getApiVersion(), i = iE(this.apiClient.getDefaultHeaders()), a = `${r}/ws/google.ai.generativelanguage.${o}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        tE(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(a, oE(i), p);
    m.connect(), await c;
    const g = { setup: { model: V(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new rE(m, this.apiClient);
  }
}, rE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = Av(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = vv(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(Kt.PLAY);
  }
  pause() {
    this.sendPlaybackControl(Kt.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(Kt.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(Kt.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function oE(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function iE(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var sE = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function aE(e, t, n) {
  const r = new o_();
  let o;
  n.data instanceof Blob ? o = await n.data.text() : n.data instanceof ArrayBuffer ? o = new TextDecoder().decode(n.data) : o = n.data;
  const i = JSON.parse(o);
  if (e.isVertexAI()) {
    const a = Sv(i);
    Object.assign(r, a);
  } else Object.assign(r, i);
  t(r);
}
var lE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new nE(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, r, o, i, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && df(e.config.tools) && ff(h);
    const f = fE(h);
    if (this.apiClient.isVertexAI()) {
      const C = this.apiClient.getProject(), M = this.apiClient.getLocation(), F = this.apiClient.getApiKey(), H = !!C && !!M || !!F;
      this.apiClient.getCustomBaseUrl() && !H ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const C = this.apiClient.getApiKey();
      let M = "BidiGenerateContent", F = "key";
      C?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), M = "BidiGenerateContentConstrained", F = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${M}?${F}=${C}`;
    }
    let p = () => {
    };
    const m = new Promise((C) => {
      p = C;
    }), g = e.callbacks, _ = function() {
      var C;
      (C = g?.onopen) === null || C === void 0 || C.call(g), p({});
    }, y = this.apiClient, E = {
      onopen: _,
      onmessage: (C) => {
        aE(y, g.onmessage, C);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(C) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(C) {
      }
    }, w = this.webSocketFactory.create(d, dE(f), E);
    w.connect(), await m;
    let b = V(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && b.startsWith("publishers/")) {
      const C = this.apiClient.getProject(), M = this.apiClient.getLocation();
      C && M && (b = `projects/${C}/locations/${M}/` + b);
    }
    let P = {};
    this.apiClient.isVertexAI() && ((r = e.config) === null || r === void 0 ? void 0 : r.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [no.AUDIO] } : e.config.responseModalities = [no.AUDIO]), !((o = e.config) === null || o === void 0) && o.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const k = (a = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : [], S = [];
    for (const C of k) if (this.isCallableTool(C)) {
      const M = C;
      S.push(await M.tool());
    } else S.push(C);
    S.length > 0 && (e.config.tools = S);
    const L = {
      model: b,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? P = yv(this.apiClient, L) : P = _v(this.apiClient, L), delete P.config, w.send(JSON.stringify(P)), new cE(w, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, uE = { turnComplete: !0 }, cE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = me(t.turns), e.isVertexAI() || (n = n.map((r) => ar(r)));
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
      if (!e.isVertexAI() && !("id" in r)) throw new Error(sE);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, uE), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: Ev(e) } : t = { realtimeInput: Tv(e) }, this.conn.send(JSON.stringify(t));
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
function dE(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function fE(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var Tu = 10;
function Eu(e) {
  var t, n, r;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let o = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (jt(a)) {
    o = !0;
    break;
  }
  if (!o) return !0;
  const i = (r = e?.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function jt(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function hE(e) {
  var t, n, r;
  return (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((o) => jt(o))) !== null && r !== void 0 ? r : !1;
}
function Su(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((r, o) => {
    if (jt(r)) return;
    const i = r;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(o);
  }), n;
}
function wu(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var pE = class extends tt {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = me(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = me(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const r = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: ro.EMBED_CONTENT
        });
        return await this.embedContentInternal(r);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: ro.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, r, o, i, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !hE(t) || Eu(t.config)) return await this.generateContentInternal(u);
      const c = Su(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, h;
      const f = me(u.contents), p = (o = (r = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && o !== void 0 ? o : Tu;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const y of (a = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : []) if (jt(y)) {
          const E = await y.callTool(d.functionCalls);
          _.push(...E);
        }
        m++, h = {
          role: "user",
          parts: _
        }, u.contents = me(u.contents), u.contents.push(g), u.contents.push(h), wu(u.config) && (f.push(g), f.push(h));
      }
      return wu(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, r, o, i, a;
      if (this.maybeMoveToResponseJsonSchem(t), Eu(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = Su(t);
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
      return new Nt(et.PAGED_ITEM_MODELS, (o) => this.listInternal(o), await this.listInternal(r), r);
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
    const i = await Promise.all(o.map(async (u) => jt(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (a.config.tools = i, e.config && e.config.tools && df(e.config.tools)) {
      const u = (r = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && r !== void 0 ? r : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), ff(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, r;
    const o = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (jt(i)) {
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
    const o = (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && r !== void 0 ? r : Tu;
    let i = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return Oe(this, arguments, function* () {
        for (var f, p, m, g, _, y; a < o; ) {
          i && (a++, i = !1);
          const P = yield B(c.processParamsMaybeAddMcpUsage(h)), k = yield B(c.generateContentStreamInternal(P)), S = [], L = [];
          try {
            for (var E = !0, w = (p = void 0, Ge(k)), b; b = yield B(w.next()), f = b.done, !f; E = !0) {
              g = b.value, E = !1;
              const C = g;
              if (yield yield B(C), C.candidates && (!((_ = C.candidates[0]) === null || _ === void 0) && _.content)) {
                L.push(C.candidates[0].content);
                for (const M of (y = C.candidates[0].content.parts) !== null && y !== void 0 ? y : []) if (a < o && M.functionCall) {
                  if (!M.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(M.functionCall.name)) {
                    const F = yield B(d.get(M.functionCall.name).callTool([M.functionCall]));
                    S.push(...F);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${M.functionCall.name}`);
                }
              }
            }
          } catch (C) {
            p = { error: C };
          } finally {
            try {
              !E && !f && (m = w.return) && (yield B(m.call(w)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (S.length > 0) {
            i = !0;
            const C = new wn();
            C.candidates = [{ content: {
              role: "user",
              parts: S
            } }], yield yield B(C);
            const M = [];
            M.push(...L), M.push({
              role: "user",
              parts: S
            }), h.contents = me(h.contents).concat(M);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = _u(this.apiClient, e);
      return a = x("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = vu(d), f = new wn();
        return Object.assign(f, h), f;
      });
    } else {
      const c = gu(this.apiClient, e);
      return a = x("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = yu(d), f = new wn();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = _u(this.apiClient, e);
      return a = x("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return Oe(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = Ge(d), y; y = yield B(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const E = m, w = vu(yield B(E.json()), e);
              w.sdkHttpResponse = { headers: E.headers };
              const b = new wn();
              Object.assign(b, w), yield yield B(b);
            }
          } catch (E) {
            f = { error: E };
          } finally {
            try {
              !g && !h && (p = _.return) && (yield B(p.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = gu(this.apiClient, e);
      return a = x("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }), i.then(function(d) {
        return Oe(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = Ge(d), y; y = yield B(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const E = m, w = yu(yield B(E.json()), e);
              w.sdkHttpResponse = { headers: E.headers };
              const b = new wn();
              Object.assign(b, w), yield yield B(b);
            }
          } catch (E) {
            f = { error: E };
          } finally {
            try {
              !g && !h && (p = _.return) && (yield B(p.call(_)));
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
      const c = rA(this.apiClient, e, e);
      return a = x(g_(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = iA(d, e), f = new Xl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = nA(this.apiClient, e);
      return a = x("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = oA(d), f = new Xl();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = gA(this.apiClient, e);
      return a = x("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = yA(d), f = new Ql();
        return Object.assign(f, h), f;
      });
    } else {
      const c = mA(this.apiClient, e);
      return a = x("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = _A(d), f = new Ql();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = Zv(this.apiClient, e);
      return o = x("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
        const c = jv(u), d = new Jg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = yT(this.apiClient, e);
      return o = x("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
        const c = vT(u), d = new Kg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = ZA(this.apiClient, e);
      return o = x("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = jA(u), d = new Wg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = iT(this.apiClient, e);
      return o = x("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = sT(u), d = new zg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $A(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ni(d));
    } else {
      const c = kA(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => xi(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = VA(this.apiClient, e);
      return a = x("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = KA(d), f = new Zl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = HA(this.apiClient, e);
      return a = x("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = JA(d), f = new Zl();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = gT(this.apiClient, e);
      return a = x("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ni(d));
    } else {
      const c = mT(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => xi(d));
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = zv(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = Xv(d), f = new jl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Wv(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = Yv(d), f = new jl();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Vv(this.apiClient, e);
      return a = x("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = Kv(d), f = new eu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Hv(this.apiClient, e);
      return a = x("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = Jv(d), f = new eu();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = Lv(this.apiClient, e);
      return o = x("{model}:computeTokens", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
        const c = Uv(u), d = new Yg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = wA(this.apiClient, e);
      return a = x("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = EA(d), f = new tu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = SA(this.apiClient, e);
      return a = x("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = TA(d), f = new tu();
        return Object.assign(f, h), f;
      });
    }
  }
}, mE = class extends tt {
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
      const c = Og(e);
      return a = x("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = Fg(e);
      return a = x("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const a = xg(e);
      return o = x("{resourceName}:fetchPredictOperation", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
function Cu(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function gE(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function _E(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function yE(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => bE(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function vE(e, t, n) {
  const r = {}, o = s(t, ["expireTime"]);
  n !== void 0 && o != null && l(n, ["expireTime"], o);
  const i = s(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const a = s(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = s(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], IE(e, u));
  const c = s(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), r;
}
function AE(e, t) {
  const n = {}, r = s(t, ["config"]);
  return r != null && l(n, ["config"], vE(e, r, n)), n;
}
function TE(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function EE(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function SE(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], gE(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function wE(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function CE(e, t) {
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
  ], Rs(f));
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
  const g = s(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], yE(re(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let C = rn(_);
    Array.isArray(C) && (C = C.map((M) => ME(nn(M)))), l(t, ["setup", "tools"], C);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], PE(y));
  const E = s(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], Cu(E));
  const w = s(e, ["outputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "outputAudioTranscription"], Cu(w));
  const b = s(e, ["realtimeInputConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "realtimeInputConfig"], b);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const k = s(e, ["proactivity"]);
  if (t !== void 0 && k != null && l(t, ["setup", "proactivity"], k), s(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const S = s(e, ["avatarConfig"]);
  t !== void 0 && S != null && l(t, ["setup", "avatarConfig"], S);
  const L = s(e, ["safetySettings"]);
  if (t !== void 0 && L != null) {
    let C = L;
    Array.isArray(C) && (C = C.map((M) => RE(M))), l(t, ["setup", "safetySettings"], C);
  }
  return n;
}
function IE(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], V(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], CE(o, n)), n;
}
function bE(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], TE(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], EE(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], _E(c));
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
  const g = s(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = s(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function RE(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function PE(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function ME(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], wE(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], SE(i));
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
function xE(e) {
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
function NE(e, t) {
  let n = null;
  const r = e.bidiGenerateContentSetup;
  if (typeof r == "object" && r !== null && "setup" in r) {
    const i = r.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else r !== void 0 && delete e.bidiGenerateContentSetup;
  const o = e.fieldMask;
  if (n) {
    const i = xE(n);
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
var DE = class extends tt {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = AE(this.apiClient, e);
      o = x("auth_tokens", a._url), i = a._query, delete a.config, delete a._url, delete a._query;
      const u = NE(a, e.config);
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
function kE(e, t) {
  const n = {}, r = s(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function $E(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = s(e, ["config"]);
  return r != null && kE(r, t), t;
}
function LE(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function UE(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function FE(e) {
  const t = {}, n = s(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const r = s(e, ["config"]);
  return r != null && UE(r, t), t;
}
function OE(e) {
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
var GE = class extends tt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Nt(et.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = LE(e);
      return o = x("{name}", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
      const i = $E(e);
      r = x("{name}", i._url), o = i._query, delete i._url, delete i._query, await this.apiClient.request({
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
      const a = FE(e);
      return o = x("{parent}/documents", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = OE(u), d = new Xg();
        return Object.assign(d, c), d;
      });
    }
  }
}, BE = class extends tt {
  constructor(e, t = new GE(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Nt(et.PAGED_ITEM_FILE_SEARCH_STORES, (r) => this.listInternal(r), await this.listInternal(n), n);
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
      const a = IT(e);
      return o = x("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
      const a = PT(e);
      return o = x("{name}", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
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
      const i = RT(e);
      r = x("{name}", i._url), o = i._query, delete i._url, delete i._query, await this.apiClient.request({
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
      const a = $T(e);
      return o = x("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = LT(u), d = new Qg();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = UT(e);
      return o = x("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = FT(u), d = new Zg();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = NT(e);
      return o = x("{file_search_store_name}:importFile", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = xT(u), d = new jg();
        return Object.assign(d, c), d;
      });
    }
  }
}, pf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return pf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
}, qE = () => pf();
function ki(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var $i = (e) => {
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
}, Me = class extends Error {
}, Ne = class Li extends Me {
  constructor(t, n, r, o) {
    super(`${Li.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.error = n;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Ro({
      message: r,
      cause: $i(n)
    });
    const i = n;
    return t === 400 ? new gf(t, i, r, o) : t === 401 ? new _f(t, i, r, o) : t === 403 ? new yf(t, i, r, o) : t === 404 ? new vf(t, i, r, o) : t === 409 ? new Af(t, i, r, o) : t === 422 ? new Tf(t, i, r, o) : t === 429 ? new Ef(t, i, r, o) : t >= 500 ? new Sf(t, i, r, o) : new Li(t, i, r, o);
  }
}, Ui = class extends Ne {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Ro = class extends Ne {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, mf = class extends Ro {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, gf = class extends Ne {
}, _f = class extends Ne {
}, yf = class extends Ne {
}, vf = class extends Ne {
}, Af = class extends Ne {
}, Tf = class extends Ne {
}, Ef = class extends Ne {
}, Sf = class extends Ne {
}, HE = /^[a-z][a-z0-9+.-]*:/i, VE = (e) => HE.test(e), Fi = (e) => (Fi = Array.isArray, Fi(e)), Iu = Fi;
function bu(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function JE(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var KE = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new Me(`${e} must be an integer`);
  if (t < 0) throw new Me(`${e} must be a positive integer`);
  return t;
}, WE = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, zE = (e) => new Promise((t) => setTimeout(t, e));
function YE() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function wf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function XE(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return wf({
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
function Cf(e) {
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
async function QE(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const r = e.getReader(), o = r.cancel();
  r.releaseLock(), await o;
}
var ZE = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function jE(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new Me(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var eS = "0.0.1", If = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Zo(e, t, n) {
  return If(), new File(e, t ?? "unknown_file", n);
}
function tS(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var nS = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", bf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", rS = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && bf(e), oS = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function iS(e, t, n) {
  if (If(), e = await e, rS(e))
    return e instanceof File ? e : Zo([await e.arrayBuffer()], e.name);
  if (oS(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Zo(await Oi(o), t, n);
  }
  const r = await Oi(e);
  if (t || (t = tS(e)), !n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = Object.assign(Object.assign({}, n), { type: o }));
  }
  return Zo(r, t, n);
}
async function Oi(e) {
  var t, n, r, o, i;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (bf(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (nS(e)) try {
    for (var u = !0, c = Ge(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      o = d.value, u = !1;
      const h = o;
      a.push(...await Oi(h));
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
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${sS(e)}`);
  }
  return a;
}
function sS(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Ps = class {
  constructor(e) {
    this._client = e;
  }
};
Ps._key = [];
function Rf(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Ru = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), aS = (e = Rf) => (function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    var m, g, _;
    /[?#]/.test(f) && (o = !0);
    const y = r[p];
    let E = (o ? encodeURIComponent : e)("" + y);
    return p !== r.length && (y == null || typeof y == "object" && y.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = y.hasOwnProperty) !== null && m !== void 0 ? m : Ru)) !== null && g !== void 0 ? g : Ru)) === null || _ === void 0 ? void 0 : _.toString)) && (E = y + "", i.push({
      start: h.length + f.length,
      length: E.length,
      error: `Value of type ${Object.prototype.toString.call(y).slice(8, -1)} is not a valid path parameter`
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
      const g = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + g + _;
    }, "");
    throw new Me(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), $e = /* @__PURE__ */ aS(Rf), Pf = class extends Ps {
  create(e, t) {
    var n;
    const { api_version: r = this._client.apiVersion } = e, o = ft(e, ["api_version"]);
    if ("model" in o && "agent_config" in o) throw new Me("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in o && "generation_config" in o) throw new Me("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post($e`/${r}/interactions`, Object.assign(Object.assign({ body: o }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete($e`/${r}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.post($e`/${r}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var r;
    const o = t ?? {}, { api_version: i = this._client.apiVersion } = o, a = ft(o, ["api_version"]);
    return this._client.get($e`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (r = t?.stream) !== null && r !== void 0 ? r : !1 }));
  }
};
Pf._key = Object.freeze(["interactions"]);
var Mf = class extends Pf {
}, xf = class extends Ps {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: r } = e, o = ft(e, ["api_version", "webhook_id"]);
    return this._client.post($e`/${n}/webhooks`, Object.assign({
      query: { webhook_id: r },
      body: o
    }, t));
  }
  update(e, t, n) {
    const { api_version: r = this._client.apiVersion, update_mask: o } = t, i = ft(t, ["api_version", "update_mask"]);
    return this._client.patch($e`/${r}/webhooks/${e}`, Object.assign({
      query: { update_mask: o },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: r = this._client.apiVersion } = n, o = ft(n, ["api_version"]);
    return this._client.get($e`/${r}/webhooks`, Object.assign({ query: o }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.delete($e`/${r}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: r = this._client.apiVersion } = t ?? {};
    return this._client.get($e`/${r}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: r = this._client.apiVersion, body: o } = t ?? {};
    return this._client.post($e`/${r}/webhooks/${e}:ping`, Object.assign({ body: o }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const r = t ?? {}, { api_version: o = this._client.apiVersion } = r, i = ft(r, ["api_version"]);
    return this._client.post($e`/${o}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
xf._key = Object.freeze(["webhooks"]);
var Nf = class extends xf {
};
function lS(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var xr;
function Ms(e) {
  let t;
  return (xr ?? (t = new globalThis.TextEncoder(), xr = t.encode.bind(t)))(e);
}
var Nr;
function Pu(e) {
  let t;
  return (Nr ?? (t = new globalThis.TextDecoder(), Nr = t.decode.bind(t)))(e);
}
var Po = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Ms(e) : e;
    this.buffer = lS([this.buffer, n]);
    const r = [];
    let o;
    for (; (o = uS(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (o.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = o.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (o.index !== this.carriageReturnIndex + 1 || o.carriage)) {
        r.push(Pu(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? o.preceding - 1 : o.preceding, a = Pu(this.buffer.subarray(0, i));
      r.push(a), this.buffer = this.buffer.subarray(o.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), r;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Po.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Po.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function uS(e, t) {
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
var io = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Mu = (e, t, n) => {
  if (e) {
    if (JE(io, e)) return e;
    de(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(io))}`);
  }
};
function Mn() {
}
function Dr(e, t, n) {
  return !t || io[e] > io[n] ? Mn : t[e].bind(t);
}
var cS = {
  error: Mn,
  warn: Mn,
  info: Mn,
  debug: Mn
}, xu = /* @__PURE__ */ new WeakMap();
function de(e) {
  var t;
  const n = e.logger, r = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return cS;
  const o = xu.get(n);
  if (o && o[0] === r) return o[1];
  const i = {
    error: Dr("error", n, r),
    warn: Dr("warn", n, r),
    info: Dr("info", n, r),
    debug: Dr("debug", n, r)
  };
  return xu.set(n, [r, i]), i;
}
var Tt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), dS = class xn {
  constructor(t, n, r) {
    this.iterator = t, this.controller = n, this.client = r;
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const i = r ? de(r) : console;
    function a() {
      return Oe(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new Me("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Ge(fS(t, n)), _; _ = yield B(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const y = f;
              if (!p)
                if (y.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield B(JSON.parse(y.data));
                } catch (E) {
                  throw i.error("Could not parse message into JSON:", y.data), i.error("From chunk:", y.raw), E;
                }
            }
          } catch (y) {
            d = { error: y };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield B(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (y) {
          if (ki(y)) return yield B(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new xn(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    function i() {
      return Oe(this, arguments, function* () {
        var c, d, h, f;
        const p = new Po(), m = Cf(t);
        try {
          for (var g = !0, _ = Ge(m), y; y = yield B(_.next()), c = y.done, !c; g = !0) {
            f = y.value, g = !1;
            const E = f;
            for (const w of p.decode(E)) yield yield B(w);
          }
        } catch (E) {
          d = { error: E };
        } finally {
          try {
            !g && !c && (h = _.return) && (yield B(h.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const E of p.flush()) yield yield B(E);
      });
    }
    function a() {
      return Oe(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new Me("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Ge(i()), _; _ = yield B(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const y = f;
              p || y && (yield yield B(JSON.parse(y)));
            }
          } catch (y) {
            d = { error: y };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield B(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (y) {
          if (ki(y)) return yield B(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new xn(a, n, r);
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
    return [new xn(() => o(t), this.controller, this.client), new xn(() => o(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return wf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = Ms(JSON.stringify(o) + `
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
function fS(e, t) {
  return Oe(this, arguments, function* () {
    var r, o, i, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new Me("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new Me("Attempted to iterate over a response with no body");
    const u = new pS(), c = new Po(), d = Cf(e.body);
    try {
      for (var h = !0, f = Ge(hS(d)), p; p = yield B(f.next()), r = p.done, !r; h = !0) {
        a = p.value, h = !1;
        const m = a;
        for (const g of c.decode(m)) {
          const _ = u.decode(g);
          _ && (yield yield B(_));
        }
      }
    } catch (m) {
      o = { error: m };
    } finally {
      try {
        !h && !r && (i = f.return) && (yield B(i.call(f)));
      } finally {
        if (o) throw o.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield B(g));
    }
  });
}
function hS(e) {
  return Oe(this, arguments, function* () {
    var n, r, o, i;
    try {
      for (var a = !0, u = Ge(e), c; c = yield B(u.next()), n = c.done, !n; a = !0) {
        i = c.value, a = !1;
        const d = i;
        d != null && (yield yield B(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? Ms(d) : d));
      }
    } catch (d) {
      r = { error: d };
    } finally {
      try {
        !a && !n && (o = u.return) && (yield B(o.call(u)));
      } finally {
        if (r) throw r.error;
      }
    }
  });
}
var pS = class {
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
    let [t, n, r] = mS(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function mS(e, t) {
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
async function gS(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return de(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : dS.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return de(e).debug(`[${r}] response parsed`, Tt({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
var _S = class Df extends Promise {
  constructor(t, n, r = gS) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, this.client = t;
  }
  _thenUnwrap(t) {
    return new Df(this.client, this.responsePromise, async (n, r) => t(await this.parseResponse(n, r), r));
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
}, kf = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* yS(e) {
  if (!e) return;
  if (kf in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Iu(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = Iu(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var Cn = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of yS(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [kf]: !0,
    values: t,
    nulls: n
  };
}, jo = (e) => {
  var t, n, r, o, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (o = (r = globalThis.Deno.env) === null || r === void 0 ? void 0 : r.get) === null || o === void 0 ? void 0 : o.call(r, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, $f, Lf = class Uf {
  constructor(t) {
    var n, r, o, i, a, u, c, { baseURL: d = jo("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = jo("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = ft(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (r = m.timeout) !== null && r !== void 0 ? r : Uf.DEFAULT_TIMEOUT, this.logger = (o = m.logger) !== null && o !== void 0 ? o : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (a = (i = Mu(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : Mu(jo("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : YE(), this.encoder = ZE, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = Cn([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return Cn([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return Cn([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return jE(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${eS}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${qE()}`;
  }
  makeStatusError(t, n, r, o) {
    return Ne.generate(t, n, r, o);
  }
  buildURL(t, n, r) {
    const o = !this.baseURLOverridden() && r || this.baseURL, i = VE(t) ? new URL(t) : new URL(o + (o.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!bu(a) || !bu(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return new _S(this, this.makeRequest(t, n, void 0));
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
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = r === void 0 ? "" : `, retryOf: ${r}`, g = Date.now();
    if (de(this).debug(`[${p}] sending request`, Tt({
      retryOfRequestLogID: r,
      method: u.method,
      url: h,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new Ui();
    const _ = new AbortController(), y = await this.fetchWithTimeout(h, d, f, _).catch($i), E = Date.now();
    if (y instanceof globalThis.Error) {
      const b = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new Ui();
      const P = ki(y) || /timed? ?out/i.test(String(y) + ("cause" in y ? String(y.cause) : ""));
      if (n)
        return de(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - ${b}`), de(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (${b})`, Tt({
          retryOfRequestLogID: r,
          url: h,
          durationMs: E - g,
          message: y.message
        })), this.retryRequest(u, n, r ?? p);
      throw de(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - error; no more retries left`), de(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (error; no more retries left)`, Tt({
        retryOfRequestLogID: r,
        url: h,
        durationMs: E - g,
        message: y.message
      })), P ? new mf() : new Ro({ cause: y });
    }
    const w = `[${p}${m}] ${d.method} ${h} ${y.ok ? "succeeded" : "failed"} with status ${y.status} in ${E - g}ms`;
    if (!y.ok) {
      const b = await this.shouldRetry(y);
      if (n && b) {
        const C = `retrying, ${n} attempts remaining`;
        return await QE(y.body), de(this).info(`${w} - ${C}`), de(this).debug(`[${p}] response error (${C})`, Tt({
          retryOfRequestLogID: r,
          url: y.url,
          status: y.status,
          headers: y.headers,
          durationMs: E - g
        })), this.retryRequest(u, n, r ?? p, y.headers);
      }
      const P = b ? "error; no more retries left" : "error; not retryable";
      de(this).info(`${w} - ${P}`);
      const k = await y.text().catch((C) => $i(C).message), S = WE(k), L = S ? void 0 : k;
      throw de(this).debug(`[${p}] response error (${P})`, Tt({
        retryOfRequestLogID: r,
        url: y.url,
        status: y.status,
        headers: y.headers,
        message: L,
        durationMs: Date.now() - g
      })), this.makeStatusError(y.status, S, L, y.headers);
    }
    return de(this).info(w), de(this).debug(`[${p}] response start`, Tt({
      retryOfRequestLogID: r,
      url: y.url,
      status: y.status,
      headers: y.headers,
      durationMs: E - g
    })), {
      response: y,
      options: u,
      controller: _,
      requestLogID: p,
      retryOfRequestLogID: r,
      startTime: g
    };
  }
  async fetchWithTimeout(t, n, r, o) {
    const i = n || {}, { signal: a, method: u } = i, c = ft(i, ["signal", "method"]), d = this._makeAbort(o);
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
    return await zE(a), this.makeRequest(t, n - 1, r);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var r, o, i;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = a, f = this.buildURL(c, d, h);
    "timeout" in a && KE("timeout", a.timeout), a.timeout = (r = a.timeout) !== null && r !== void 0 ? r : this.timeout;
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
      }, a.signal && { signal: a.signal }), globalThis.ReadableStream && m instanceof globalThis.ReadableStream && { duplex: "half" }), m && { body: m }), (o = this.fetchOptions) !== null && o !== void 0 ? o : {}), (i = a.fetchOptions) !== null && i !== void 0 ? i : {}),
      url: f,
      timeout: a.timeout
    };
  }
  async buildHeaders({ options: t, method: n, bodyHeaders: r, retryCount: o }) {
    let i = {};
    this.idempotencyHeader && n !== "get" && (t.idempotencyKey || (t.idempotencyKey = this.defaultIdempotencyKey()), i[this.idempotencyHeader] = t.idempotencyKey);
    const a = await this.authHeaders(t);
    let u = Cn([
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
    const r = Cn([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: XE(t)
    } : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: r
    });
  }
};
Lf.DEFAULT_TIMEOUT = 6e4;
var te = class extends Lf {
  constructor() {
    super(...arguments), this.interactions = new Mf(this), this.webhooks = new Nf(this);
  }
};
$f = te;
te.GeminiNextGenAPIClient = $f;
te.GeminiNextGenAPIClientError = Me;
te.APIError = Ne;
te.APIConnectionError = Ro;
te.APIConnectionTimeoutError = mf;
te.APIUserAbortError = Ui;
te.NotFoundError = vf;
te.ConflictError = Af;
te.RateLimitError = Ef;
te.BadRequestError = gf;
te.AuthenticationError = _f;
te.InternalServerError = Sf;
te.PermissionDeniedError = yf;
te.UnprocessableEntityError = Tf;
te.toFile = iS;
te.Interactions = Mf;
te.Webhooks = Nf;
function vS(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function AS(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function TS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function ES(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function SS(e, t, n) {
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
function wS(e, t, n) {
  const r = {};
  let o = s(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["supervisedTuningSpec"], ei(S));
  } else if (o === "PREFERENCE_TUNING") {
    const S = s(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["preferenceOptimizationSpec"], ei(S));
  } else if (o === "DISTILLATION") {
    const S = s(e, ["validationDataset"]);
    t !== void 0 && S != null && l(t, ["distillationSpec"], ei(S));
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
  let g = s(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const S = s(e, ["learningRate"]);
    t !== void 0 && S != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], S);
  } else if (g === "DISTILLATION") {
    const S = s(e, ["learningRate"]);
    t !== void 0 && S != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], S);
  }
  const _ = s(e, ["labels"]);
  t !== void 0 && _ != null && l(t, ["labels"], _);
  const y = s(e, ["beta"]);
  t !== void 0 && y != null && l(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], y);
  const E = s(e, ["baseTeacherModel"]);
  t !== void 0 && E != null && l(t, ["distillationSpec", "baseTeacherModel"], E);
  const w = s(e, ["tunedTeacherModelSource"]);
  t !== void 0 && w != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], w);
  const b = s(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && b != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], b);
  const P = s(e, ["outputUri"]);
  t !== void 0 && P != null && l(t, ["outputUri"], P);
  const k = s(e, ["encryptionSpec"]);
  return t !== void 0 && k != null && l(t, ["encryptionSpec"], k), r;
}
function CS(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const i = s(e, ["trainingDataset"]);
  i != null && LS(i);
  const a = s(e, ["config"]);
  return a != null && SS(a, n), n;
}
function IS(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const i = s(e, ["trainingDataset"]);
  i != null && US(i, n, t);
  const a = s(e, ["config"]);
  return a != null && wS(a, n, t), n;
}
function bS(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function RS(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function PS(e, t, n) {
  const r = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function MS(e, t, n) {
  const r = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function xS(e, t) {
  const n = {}, r = s(e, ["config"]);
  return r != null && PS(r, n), n;
}
function NS(e, t) {
  const n = {}, r = s(e, ["config"]);
  return r != null && MS(r, n), n;
}
function DS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["tunedModels"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => Ff(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function kS(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["tuningJobs"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => Gi(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function $S(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["model"], r);
  const o = s(e, ["name"]);
  return o != null && l(n, ["endpoint"], o), n;
}
function LS(e, t) {
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
function US(e, t, n) {
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
function Ff(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], Kd(i));
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
  return p != null && l(n, ["tunedModel"], $S(p)), n;
}
function Gi(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], Kd(i));
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
  const g = s(e, ["preTunedModel"]);
  g != null && l(n, ["preTunedModel"], g);
  const _ = s(e, ["supervisedTuningSpec"]);
  _ != null && l(n, ["supervisedTuningSpec"], _);
  const y = s(e, ["preferenceOptimizationSpec"]);
  y != null && l(n, ["preferenceOptimizationSpec"], y);
  const E = s(e, ["distillationSpec"]);
  E != null && l(n, ["distillationSpec"], E);
  const w = s(e, ["tuningDataStats"]);
  w != null && l(n, ["tuningDataStats"], w);
  const b = s(e, ["encryptionSpec"]);
  b != null && l(n, ["encryptionSpec"], b);
  const P = s(e, ["partnerModelTuningSpec"]);
  P != null && l(n, ["partnerModelTuningSpec"], P);
  const k = s(e, ["customBaseModel"]);
  k != null && l(n, ["customBaseModel"], k);
  const S = s(e, ["evaluateDatasetRuns"]);
  if (S != null) {
    let gt = S;
    Array.isArray(gt) && (gt = gt.map((De) => De)), l(n, ["evaluateDatasetRuns"], gt);
  }
  const L = s(e, ["experiment"]);
  L != null && l(n, ["experiment"], L);
  const C = s(e, ["fullFineTuningSpec"]);
  C != null && l(n, ["fullFineTuningSpec"], C);
  const M = s(e, ["labels"]);
  M != null && l(n, ["labels"], M);
  const F = s(e, ["outputUri"]);
  F != null && l(n, ["outputUri"], F);
  const H = s(e, ["pipelineJob"]);
  H != null && l(n, ["pipelineJob"], H);
  const ae = s(e, ["serviceAccount"]);
  ae != null && l(n, ["serviceAccount"], ae);
  const W = s(e, ["tunedModelDisplayName"]);
  W != null && l(n, ["tunedModelDisplayName"], W);
  const J = s(e, ["tuningJobState"]);
  J != null && l(n, ["tuningJobState"], J);
  const K = s(e, ["veoTuningSpec"]);
  K != null && l(n, ["veoTuningSpec"], K);
  const fe = s(e, ["distillationSamplingSpec"]);
  fe != null && l(n, ["distillationSamplingSpec"], fe);
  const Je = s(e, ["tuningJobMetadata"]);
  return Je != null && l(n, ["tuningJobMetadata"], Je), n;
}
function FS(e, t) {
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
function ei(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["validationDatasetUri"], r);
  const o = s(e, ["vertexDatasetResource"]);
  return o != null && l(n, ["validationDatasetUri"], o), n;
}
var OS = class extends tt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Nt(et.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: Ii.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = RS(e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Gi(d));
    } else {
      const c = bS(e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Ff(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = NS(e);
      return a = x("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = kS(d), f = new nu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = xS(e);
      return a = x("tunedModels", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = DS(d), f = new nu();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = AS(e);
      return a = x("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = ES(d), f = new ru();
        return Object.assign(f, h), f;
      });
    } else {
      const c = vS(e);
      return a = x("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = TS(d), f = new ru();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = IS(e, e);
      return o = x("tuningJobs", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => Gi(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = CS(e);
      return o = x("tunedModels", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), r.then((u) => FS(u));
    }
  }
}, GS = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, BS = 1024 * 1024 * 8, qS = 3, HS = 1e3, VS = 2, so = "x-goog-upload-status";
async function JS(e, t, n, r) {
  var o;
  const i = await Of(e, t, n, r), a = await i?.json();
  if (((o = i?.headers) === null || o === void 0 ? void 0 : o[so]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function KS(e, t, n, r) {
  var o;
  const i = await Of(e, t, n, r), a = await i?.json();
  if (((o = i?.headers) === null || o === void 0 ? void 0 : o[so]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = Ud(a), c = new s_();
  return Object.assign(c, u), c;
}
async function Of(e, t, n, r) {
  var o, i, a;
  let u = t;
  const c = r?.baseUrl || ((o = n.clientOptions.httpOptions) === null || o === void 0 ? void 0 : o.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, h = 0, f = new Ri(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(BS, d - h), g = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, y = HS;
    for (; _ < qS; ) {
      const E = Object.assign(Object.assign({}, r?.headers || {}), {
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
          headers: E
        })
      }), !((i = f?.headers) === null || i === void 0) && i[so]) break;
      _++, await zS(y), y = y * VS;
    }
    if (h += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[so]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function WS(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function zS(e) {
  return new Promise((t) => setTimeout(t, e));
}
var YS = class {
  async upload(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await JS(e, t, n, r);
  }
  async uploadToFileSearchStore(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await KS(e, t, n, r);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await WS(e);
  }
}, XS = class {
  create(e, t, n) {
    return new QS(e, t, n);
  }
}, QS = class {
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
}, Nu = "x-goog-api-key", ZS = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(Nu) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(Nu, this.apiKey);
    }
  }
}, jS = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new te({
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
    const n = Pg(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const r = new ZS(this.apiKey);
    this.apiClient = new zT({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new YS(),
      downloader: new GS()
    }), this.models = new pE(this.apiClient), this.live = new lE(this.apiClient, r, new XS()), this.batches = new uy(this.apiClient), this.chats = new Wy(this.models, this.apiClient), this.caches = new Vy(this.apiClient), this.files = new iv(this.apiClient), this.operations = new mE(this.apiClient), this.authTokens = new DE(this.apiClient), this.tunings = new OS(this.apiClient), this.fileSearchStores = new BE(this.apiClient);
  }
};
function Du(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function ao(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function bt(e) {
  return { text: String(e || "") };
}
function ew(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function tw(e) {
  if (typeof e == "string") return [bt(e)];
  if (!Array.isArray(e)) return [bt("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? bt(n.text || "") : n.type === "image_url" && n.image_url?.url ? ew(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [bt("")];
}
function ku() {
  return {
    role: "user",
    parts: [bt("")]
  };
}
function lr(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = ao(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function nw(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function rw(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function $u(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const r = String(e.functionCall.id || "").trim();
  return r ? `id:${r}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function ow(e, t) {
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
function iw(e = [], t = "") {
  const n = e.map((h) => lr(h, "model")).filter(Boolean);
  if (!n.length) return null;
  const r = [...n].reverse().find((h) => nw(h)) || null, o = [...n].reverse().find((h) => rw(h)) || null, i = r || o || n[n.length - 1], a = n.indexOf(i), u = ao(i);
  if (!u?.parts?.length) return n[n.length - 1];
  if (o) {
    const h = /* @__PURE__ */ new Map(), f = [];
    n.forEach((m, g) => {
      m.parts.forEach((_, y) => {
        const E = $u(_, y, g);
        if (!E) return;
        h.has(E) || f.push(E);
        const w = h.get(E);
        w ? h.set(E, ow(w, _)) : h.set(E, ao(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((m, g) => {
      const _ = $u(m, g, a);
      return _ ? (p.add(_), h.get(_) || m) : m;
    }), f.forEach((m) => {
      p.has(m) || (u.parts.push(h.get(m)), p.add(m));
    });
  }
  const c = String(t || ""), d = u.parts.filter((h) => !(typeof h?.text == "string" && !h?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function Lu(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((r) => !r?.thought && typeof r?.text == "string" && r.text).map((r) => r.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function Gf(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((r) => r?.functionCall || r).filter((r) => r && r.name);
  return t.length ? t : n;
}
function Bf(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function Uu(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function sw(e, t) {
  const n = Uu(e), r = Uu(t);
  return n && r ? JSON.stringify({
    ...n,
    ...r
  }) : String(t || "").trim() || String(e || "{}");
}
function aw(e, t = "google-tool") {
  return Gf(e).map((n, r) => {
    const o = String(n.id || "").trim();
    return {
      id: o || `${t}-${r + 1}`,
      name: n.name || "",
      arguments: Bf(n),
      ...o ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function lw(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let r = 0;
  function o(a, u, c, d) {
    return a.name = String(u.name || a.name || "").trim(), a.arguments = sw(a.arguments, d), c && (n.set(c, a), a.id !== c ? a.providerId = c : delete a.providerId), a;
  }
  function i(a) {
    return Gf(a).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), h = Bf(u);
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
function uw(e = []) {
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
function cw(e) {
  switch (e) {
    case "minimal":
      return Jt.MINIMAL;
    case "high":
      return Jt.HIGH;
    case "medium":
      return Jt.MEDIUM;
    default:
      return Jt.LOW;
  }
}
function Fu(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function dw(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function fw(e) {
  const t = e?.providerPayload?.googleContent;
  return lr(t, "model");
}
function hw(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = fw(e);
    return n ? [n] : [];
  }
  return t.map((n) => lr(n, "model")).filter(Boolean);
}
function xs(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => lr(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function pw(e) {
  const t = e?.candidates?.[0]?.content;
  return xs(t ? [t] : []);
}
function mw(e) {
  return xs(e ? [e] : []);
}
function qf(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? ao(e.history) || [] : [];
}
function gw(e, t = 0) {
  return qf(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => lr(n, "model")).filter(Boolean);
}
function _w(e) {
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
          response: Du(h.content)
        } }), d += 1;
      }
      r.push({
        role: "user",
        parts: c
      }), a = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = hw(u);
      if (c.length) {
        r.push(...c);
        continue;
      }
    }
    if (u.role === "assistant" && Array.isArray(u.tool_calls) && u.tool_calls.length) {
      r.push({
        role: "model",
        parts: [...u.content ? [bt(u.content)] : [], ...u.tool_calls.map((c) => ({ functionCall: {
          ...(() => {
            const d = Object.prototype.hasOwnProperty.call(c, "providerToolCallId") ? String(c.providerToolCallId || "").trim() : String(c.id || "").trim();
            return d ? { id: d } : {};
          })(),
          name: c.function.name,
          args: Du(c.function.arguments)
        } }))]
      });
      continue;
    }
    r.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: tw(u.content)
    });
  }
  if (!r.length) return {
    history: [],
    latestMessage: ku().parts
  };
  const i = r[r.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: r.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: r,
    latestMessage: ku().parts
  };
}
function yw(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Ou(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var vw = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.toolCallResponseSequence = 0, this.client = new jS({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e) {
    const t = _w(e.messages), n = Array.isArray(e.tools) ? e.tools : [], r = dw(e), o = {
      ...r ? { systemInstruction: r } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    if (e.reasoning?.enabled && (o.thinkingConfig = {
      includeThoughts: e.reasoning.includeOutput !== !1,
      thinkingLevel: cw(e.reasoning.effort)
    }), n.length && (o.tools = [{ functionDeclarations: n.map((i) => ({
      name: i.function.name,
      description: i.function.description,
      parameters: i.function.parameters
    })) }]), n.length) {
      const i = String(e.toolChoice || "auto").trim();
      o.toolConfig = { functionCallingConfig: i === "none" ? { mode: Vt.NONE } : i === "auto" ? { mode: Vt.AUTO } : i === "required" ? { mode: Vt.ANY } : {
        mode: Vt.ANY,
        allowedFunctionNames: [i]
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
    return jn({
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
      effectiveConfig: Mt(e, {
        enabled: !!n.createPayload.config?.thinkingConfig,
        effort: n.createPayload.config?.thinkingConfig?.thinkingLevel,
        includeOutput: n.createPayload.config?.thinkingConfig?.includeThoughts === !0
      })
    });
  }
  inspectSendRequest(e, t) {
    const n = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return jn({
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
      effectiveConfig: Mt(t, {
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
    let r, o, i, a = [];
    const u = `google-tool-${++this.toolCallResponseSequence}`, c = lw(u);
    let d = null;
    const h = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, f = {
      ...t,
      ...h ? { config: h } : {}
    }, p = typeof n.onStreamProgress == "function", m = qf(e).length;
    if (p) {
      const y = await e.sendMessageStream(f), E = /* @__PURE__ */ new Map();
      let w = "", b = null;
      const P = [];
      for await (const k of y) {
        b = k;
        const S = k?.candidates?.[0]?.content;
        S?.parts?.length && P.push(S), n.reasoning?.includeOutput !== !1 && Fu(k).forEach((C, M) => {
          const F = `${C.label}:${M}`;
          E.set(F, Ou(E.get(F) || "", C.text));
        }), a = c.append(k);
        const L = Lu(k);
        w = Ou(w, L), yw(n, {
          text: w,
          thoughts: Array.from(E.values()).filter(Boolean).map((C, M) => ({
            label: `思考块 ${M + 1}`,
            text: C
          })),
          ...a.length ? {
            toolCalls: a,
            toolCallDraft: !0
          } : {}
        });
      }
      r = {
        ...b || {},
        functionCalls: a
      }, d = iw(P, w) || r?.candidates?.[0]?.content || null, o = Array.from(E.values()).filter(Boolean).map((k, S) => ({
        label: `思考块 ${S + 1}`,
        text: k
      })), i = w;
    } else
      r = await e.sendMessage(f), o = n.reasoning?.includeOutput === !1 ? [] : Fu(r), i = Lu(r);
    const g = p ? a : aw(r, u), _ = gw(e, m);
    return {
      text: i,
      toolCalls: g,
      thoughts: o,
      finishReason: r.candidates?.[0]?.finishReason || "STOP",
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: xs(_) || mw(d) || pw(r)
    };
  }
  async chat(e) {
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: uw(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, r, e),
        requestInspection: this.inspectSendRequest(r, e)
      };
    }
    const t = String(e.finalAnswerReminderText || "").trim();
    if (t) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: [bt(t)] };
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
function O(e, t, n, r, o) {
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
var Hf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Hf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function Bi(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var qi = (e) => {
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
}, U = class extends Error {
}, le = class Hi extends U {
  constructor(t, n, r, o) {
    super(`${Hi.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Mo({
      message: r,
      cause: qi(n)
    });
    const i = n?.error;
    return t === 400 ? new Vf(t, i, r, o) : t === 401 ? new Jf(t, i, r, o) : t === 403 ? new Kf(t, i, r, o) : t === 404 ? new Wf(t, i, r, o) : t === 409 ? new zf(t, i, r, o) : t === 422 ? new Yf(t, i, r, o) : t === 429 ? new Xf(t, i, r, o) : t >= 500 ? new Qf(t, i, r, o) : new Hi(t, i, r, o);
  }
}, Pe = class extends le {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Mo = class extends le {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Ns = class extends Mo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Vf = class extends le {
}, Jf = class extends le {
}, Kf = class extends le {
}, Wf = class extends le {
}, zf = class extends le {
}, Yf = class extends le {
}, Xf = class extends le {
}, Qf = class extends le {
}, Zf = class extends U {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, jf = class extends U {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Nn = class extends Error {
  constructor(e) {
    super(e);
  }
}, eh = class extends le {
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
}, Aw = class extends U {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, Tw = /^[a-z][a-z0-9+.-]*:/i, Ew = (e) => Tw.test(e), pe = (e) => (pe = Array.isArray, pe(e)), Gu = pe;
function Ds(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Bu(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Sw(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function ti(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var ww = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new U(`${e} must be an integer`);
  if (t < 0) throw new U(`${e} must be a positive integer`);
  return t;
}, Cw = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, ur = (e) => new Promise((t) => setTimeout(t, e)), Gt = "6.44.0", Iw = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function bw() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Rw = () => {
  const e = bw();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Gt,
    "X-Stainless-OS": Hu(Deno.build.os),
    "X-Stainless-Arch": qu(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Gt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Gt,
    "X-Stainless-OS": Hu(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": qu(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Pw();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Gt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Gt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Pw() {
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
var qu = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Hu = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Vu, Mw = () => Vu ?? (Vu = Rw());
function th() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function nh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function rh(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return nh({
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
function oh(e) {
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
async function Ju(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var xw = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), ih = "RFC3986", sh = (e) => String(e), Ku = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: sh
};
var Vi = (e, t) => (Vi = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Vi(e, t)), qe = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), ni = 1024, Nw = (e, t, n, r, o) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < i.length; u += ni) {
    const c = i.length >= ni ? i.slice(u, u + ni) : i, d = [];
    for (let h = 0; h < c.length; ++h) {
      let f = c.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || o === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(h);
        continue;
      }
      if (f < 128) {
        d[d.length] = qe[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = qe[192 | f >> 6] + qe[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = qe[224 | f >> 12] + qe[128 | f >> 6 & 63] + qe[128 | f & 63];
        continue;
      }
      h += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(h) & 1023), d[d.length] = qe[240 | f >> 18] + qe[128 | f >> 12 & 63] + qe[128 | f >> 6 & 63] + qe[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function Dw(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function Wu(e, t) {
  if (pe(e)) {
    const n = [];
    for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
    return n;
  }
  return t(e);
}
var ah = {
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
}, lh = function(e, t) {
  Array.prototype.push.apply(e, pe(t) ? t : [t]);
}, zu, ee = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: Nw,
  encodeValuesOnly: !1,
  format: ih,
  formatter: sh,
  indices: !1,
  serializeDate(e) {
    return (zu ?? (zu = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function kw(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var ri = {};
function uh(e, t, n, r, o, i, a, u, c, d, h, f, p, m, g, _, y, E) {
  let w = e, b = E, P = 0, k = !1;
  for (; (b = b.get(ri)) !== void 0 && !k; ) {
    const F = b.get(e);
    if (P += 1, typeof F < "u") {
      if (F === P) throw new RangeError("Cyclic object value");
      k = !0;
    }
    typeof b.get(ri) > "u" && (P = 0);
  }
  if (typeof d == "function" ? w = d(t, w) : w instanceof Date ? w = p?.(w) : n === "comma" && pe(w) && (w = Wu(w, function(F) {
    return F instanceof Date ? p?.(F) : F;
  })), w === null) {
    if (i) return c && !_ ? c(t, ee.encoder, y, "key", m) : t;
    w = "";
  }
  if (kw(w) || Dw(w)) {
    if (c) {
      const F = _ ? t : c(t, ee.encoder, y, "key", m);
      return [g?.(F) + "=" + g?.(c(w, ee.encoder, y, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(w))];
  }
  const S = [];
  if (typeof w > "u") return S;
  let L;
  if (n === "comma" && pe(w))
    _ && c && (w = Wu(w, c)), L = [{ value: w.length > 0 ? w.join(",") || null : void 0 }];
  else if (pe(d)) L = d;
  else {
    const F = Object.keys(w);
    L = h ? F.sort(h) : F;
  }
  const C = u ? String(t).replace(/\./g, "%2E") : String(t), M = r && pe(w) && w.length === 1 ? C + "[]" : C;
  if (o && pe(w) && w.length === 0) return M + "[]";
  for (let F = 0; F < L.length; ++F) {
    const H = L[F], ae = typeof H == "object" && typeof H.value < "u" ? H.value : w[H];
    if (a && ae === null) continue;
    const W = f && u ? H.replace(/\./g, "%2E") : H, J = pe(w) ? typeof n == "function" ? n(M, W) : M : M + (f ? "." + W : "[" + W + "]");
    E.set(e, P);
    const K = /* @__PURE__ */ new WeakMap();
    K.set(ri, E), lh(S, uh(ae, J, n, r, o, i, a, u, n === "comma" && _ && pe(w) ? null : c, d, h, f, p, m, g, _, y, K));
  }
  return S;
}
function $w(e = ee) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || ee.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = ih;
  if (typeof e.format < "u") {
    if (!Vi(Ku, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const r = Ku[n];
  let o = ee.filter;
  (typeof e.filter == "function" || pe(e.filter)) && (o = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in ah ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = ee.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : ee.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : ee.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : ee.allowEmptyArrays,
    arrayFormat: i,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : ee.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? ee.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : ee.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : ee.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : ee.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : ee.encodeValuesOnly,
    filter: o,
    format: n,
    formatter: r,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : ee.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : ee.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : ee.strictNullHandling
  };
}
function Lw(e, t = {}) {
  let n = e;
  const r = $w(t);
  let o, i;
  typeof r.filter == "function" ? (i = r.filter, n = i("", n)) : pe(r.filter) && (i = r.filter, o = i);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = ah[r.arrayFormat], c = u === "comma" && r.commaRoundTrip;
  o || (o = Object.keys(n)), r.sort && o.sort(r.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < o.length; ++p) {
    const m = o[p];
    r.skipNulls && n[m] === null || lh(a, uh(n[m], m, u, c, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, d));
  }
  const h = a.join(r.delimiter);
  let f = r.addQueryPrefix === !0 ? "?" : "";
  return r.charsetSentinel && (r.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function Uw(e) {
  return Lw(e, { arrayFormat: "brackets" });
}
function Fw(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var Yu;
function ks(e) {
  let t;
  return (Yu ?? (t = new globalThis.TextEncoder(), Yu = t.encode.bind(t)))(e);
}
var Xu;
function Qu(e) {
  let t;
  return (Xu ?? (t = new globalThis.TextDecoder(), Xu = t.decode.bind(t)))(e);
}
var Te, Ee, xo = class {
  constructor() {
    Te.set(this, void 0), Ee.set(this, void 0), O(this, Te, new Uint8Array(), "f"), O(this, Ee, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ks(e) : e;
    O(this, Te, Fw([T(this, Te, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = Ow(T(this, Te, "f"), T(this, Ee, "f"))) != null; ) {
      if (r.carriage && T(this, Ee, "f") == null) {
        O(this, Ee, r.index, "f");
        continue;
      }
      if (T(this, Ee, "f") != null && (r.index !== T(this, Ee, "f") + 1 || r.carriage)) {
        n.push(Qu(T(this, Te, "f").subarray(0, T(this, Ee, "f") - 1))), O(this, Te, T(this, Te, "f").subarray(T(this, Ee, "f")), "f"), O(this, Ee, null, "f");
        continue;
      }
      const o = T(this, Ee, "f") !== null ? r.preceding - 1 : r.preceding, i = Qu(T(this, Te, "f").subarray(0, o));
      n.push(i), O(this, Te, T(this, Te, "f").subarray(r.index), "f"), O(this, Ee, null, "f");
    }
    return n;
  }
  flush() {
    return T(this, Te, "f").length ? this.decode(`
`) : [];
  }
};
Te = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new WeakMap();
xo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
xo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Ow(e, t) {
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
function Gw(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var lo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Zu = (e, t, n) => {
  if (e) {
    if (Sw(lo, e)) return e;
    oe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(lo))}`);
  }
};
function Dn() {
}
function kr(e, t, n) {
  return !t || lo[e] > lo[n] ? Dn : t[e].bind(t);
}
var Bw = {
  error: Dn,
  warn: Dn,
  info: Dn,
  debug: Dn
}, ju = /* @__PURE__ */ new WeakMap();
function oe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Bw;
  const r = ju.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: kr("error", t, n),
    warn: kr("warn", t, n),
    info: kr("info", t, n),
    debug: kr("debug", t, n)
  };
  return ju.set(t, [n, o]), o;
}
var Et = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), In, er = class kn {
  constructor(t, n, r) {
    this.iterator = t, In.set(this, void 0), this.controller = n, O(this, In, r, "f");
  }
  static fromSSEResponse(t, n, r, o) {
    let i = !1;
    const a = r ? oe(r) : console;
    async function* u() {
      if (i) throw new U("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of qw(t, n))
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
              if (h && h.error) throw new le(void 0, h.error, void 0, t.headers);
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
              if (d.event == "error") throw new le(void 0, h.error, h.message, void 0);
              yield {
                event: d.event,
                data: h
              };
            }
          }
        c = !0;
      } catch (d) {
        if (Bi(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new kn(u, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* i() {
      const u = new xo(), c = oh(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (o) throw new U("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Bi(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new kn(a, n, r);
  }
  [(In = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new kn(() => o(t), this.controller, T(this, In, "f")), new kn(() => o(n), this.controller, T(this, In, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return nh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = ks(JSON.stringify(o) + `
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
async function* qw(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new U("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new U("Attempted to iterate over a response with no body");
  const n = new Vw(), r = new xo(), o = oh(e.body);
  for await (const i of Hw(o)) for (const a of r.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of r.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* Hw(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? ks(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let i;
    for (; (i = Gw(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Vw = class {
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
    let [t, n, r] = Jw(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function Jw(e, t) {
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
async function ch(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return oe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : er.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : dh(await n.json(), n) : await n.text();
  })();
  return oe(e).debug(`[${r}] response parsed`, Et({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function dh(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var $n, fh = class hh extends Promise {
  constructor(t, n, r = ch) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, $n.set(this, void 0), O(this, $n, t, "f");
  }
  _thenUnwrap(t) {
    return new hh(T(this, $n, "f"), this.responsePromise, async (n, r) => dh(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(T(this, $n, "f"), t))), this.parsedPromise;
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
$n = /* @__PURE__ */ new WeakMap();
var $r, No = class {
  constructor(e, t, n, r) {
    $r.set(this, void 0), O(this, $r, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new U("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
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
}, Kw = class extends fh {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await ch(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, pt = class extends No {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, Y = class extends No {
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
        ...Ds(this.options.query),
        after: t
      }
    } : null;
  }
}, se = class extends No {
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
        ...Ds(this.options.query),
        after: e
      }
    } : null;
  }
}, rt = class extends No {
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
        ...Ds(this.options.query),
        after: e
      }
    } : null;
  }
}, Ww = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, zw = "urn:ietf:params:oauth:grant-type:token-exchange", Yw = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? th();
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
      grant_type: zw,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: Ww[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new eh(t.status, a, t.headers) : le.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
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
}, ph = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Jn(e, t, n) {
  return ph(), new File(e, t ?? "unknown_file", n);
}
function Kr(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var $s = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Do = async (e, t) => Ji(e.body) ? {
  ...e,
  body: await mh(e.body, t)
} : e, Ve = async (e, t) => ({
  ...e,
  body: await mh(e.body, t)
}), ec = /* @__PURE__ */ new WeakMap();
function Xw(e) {
  const t = typeof e == "function" ? e : e.fetch, n = ec.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new o(i).text();
    } catch {
      return !0;
    }
  })();
  return ec.set(t, r), r;
}
var mh = async (e, t) => {
  if (!await Xw(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, o]) => Ki(n, r, o))), n;
}, gh = (e) => e instanceof Blob && "name" in e, Qw = (e) => typeof e == "object" && e !== null && (e instanceof Response || $s(e) || gh(e)), Ji = (e) => {
  if (Qw(e)) return !0;
  if (Array.isArray(e)) return e.some(Ji);
  if (e && typeof e == "object") {
    for (const t in e) if (Ji(e[t])) return !0;
  }
  return !1;
}, Ki = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, Jn([await n.blob()], Kr(n)));
    else if ($s(n)) e.append(t, Jn([await new Response(rh(n)).blob()], Kr(n)));
    else if (gh(n)) e.append(t, n, Kr(n));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Ki(e, t + "[]", r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, o]) => Ki(e, `${t}[${r}]`, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, _h = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Zw = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && _h(e), jw = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function eC(e, t, n) {
  if (ph(), e = await e, Zw(e))
    return e instanceof File ? e : Jn([await e.arrayBuffer()], e.name);
  if (jw(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Jn(await Wi(o), t, n);
  }
  const r = await Wi(e);
  if (t || (t = Kr(e)), !n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return Jn(r, t, n);
}
async function Wi(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (_h(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if ($s(e)) for await (const n of e) t.push(...await Wi(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${tC(e)}`);
  }
  return t;
}
function tC(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var R = class {
  constructor(e) {
    this._client = e;
  }
};
function yh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var tc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), nC = (e = yh) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let g = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? tc) ?? tc)?.toString) && (g = m + "", i.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : g);
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
      const g = " ".repeat(m.start - h), _ = "^".repeat(m.length);
      return h = m.start + m.length, p + g + _;
    }, "");
    throw new U(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, v = /* @__PURE__ */ nC(yh), vh = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/chat/completions/${e}/messages`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function uo(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Ls(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function cr(e) {
  return e?.$brand === "auto-parseable-tool";
}
function rC(e, t) {
  return !t || !Ah(t) ? {
    ...e,
    choices: e.choices.map((n) => (Th(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : Us(e, t);
}
function Us(e, t) {
  const n = e.choices.map((r) => {
    if (r.finish_reason === "length") throw new Zf();
    if (r.finish_reason === "content_filter") throw new jf();
    return Th(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        ...r.message.tool_calls ? { tool_calls: r.message.tool_calls?.map((o) => iC(t, o)) ?? void 0 } : void 0,
        parsed: r.message.content && !r.message.refusal ? oC(t, r.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function oC(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function iC(e, t) {
  const n = e.tools?.find((r) => uo(r) && r.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: cr(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function sC(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((r) => uo(r) && r.function?.name === t.function.name);
  return uo(n) && (cr(n) || n?.function.strict || !1);
}
function Ah(e) {
  return Ls(e.response_format) ? !0 : e.tools?.some((t) => cr(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function Th(e) {
  for (const t of e || []) if (t.type !== "function") throw new U(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function aC(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new U(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new U(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var co = (e) => e?.role === "assistant", Eh = (e) => e?.role === "tool", zi, Wr, zr, Ln, Un, Yr, Fn, Ye, On, fo, ho, Bt, Sh, Fs = class {
  constructor() {
    zi.add(this), this.controller = new AbortController(), Wr.set(this, void 0), zr.set(this, () => {
    }), Ln.set(this, () => {
    }), Un.set(this, void 0), Yr.set(this, () => {
    }), Fn.set(this, () => {
    }), Ye.set(this, {}), On.set(this, !1), fo.set(this, !1), ho.set(this, !1), Bt.set(this, !1), O(this, Wr, new Promise((e, t) => {
      O(this, zr, e, "f"), O(this, Ln, t, "f");
    }), "f"), O(this, Un, new Promise((e, t) => {
      O(this, Yr, e, "f"), O(this, Fn, t, "f");
    }), "f"), T(this, Wr, "f").catch(() => {
    }), T(this, Un, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, T(this, zi, "m", Sh).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (T(this, zr, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return T(this, On, "f");
  }
  get errored() {
    return T(this, fo, "f");
  }
  get aborted() {
    return T(this, ho, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (T(this, Ye, "f")[e] || (T(this, Ye, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = T(this, Ye, "f")[e];
    if (!n) return this;
    const r = n.findIndex((o) => o.listener === t);
    return r >= 0 && n.splice(r, 1), this;
  }
  once(e, t) {
    return (T(this, Ye, "f")[e] || (T(this, Ye, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      O(this, Bt, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    O(this, Bt, !0, "f"), await T(this, Un, "f");
  }
  _emit(e, ...t) {
    if (T(this, On, "f")) return;
    e === "end" && (O(this, On, !0, "f"), T(this, Yr, "f").call(this));
    const n = T(this, Ye, "f")[e];
    if (n && (T(this, Ye, "f")[e] = n.filter((r) => !r.once), n.forEach(({ listener: r }) => r(...t))), e === "abort") {
      const r = t[0];
      !T(this, Bt, "f") && !n?.length && Promise.reject(r), T(this, Ln, "f").call(this, r), T(this, Fn, "f").call(this, r), this._emit("end");
      return;
    }
    if (e === "error") {
      const r = t[0];
      !T(this, Bt, "f") && !n?.length && Promise.reject(r), T(this, Ln, "f").call(this, r), T(this, Fn, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
Wr = /* @__PURE__ */ new WeakMap(), zr = /* @__PURE__ */ new WeakMap(), Ln = /* @__PURE__ */ new WeakMap(), Un = /* @__PURE__ */ new WeakMap(), Yr = /* @__PURE__ */ new WeakMap(), Fn = /* @__PURE__ */ new WeakMap(), Ye = /* @__PURE__ */ new WeakMap(), On = /* @__PURE__ */ new WeakMap(), fo = /* @__PURE__ */ new WeakMap(), ho = /* @__PURE__ */ new WeakMap(), Bt = /* @__PURE__ */ new WeakMap(), zi = /* @__PURE__ */ new WeakSet(), Sh = function(t) {
  if (O(this, fo, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Pe()), t instanceof Pe)
    return O(this, ho, !0, "f"), this._emit("abort", t);
  if (t instanceof U) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new U(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new U(String(t)));
};
function lC(e) {
  return typeof e.parse == "function";
}
var ue, Yi, po, Xi, Qi, Zi, wh, Ch, uC = 10, Ih = class extends Fs {
  constructor() {
    super(...arguments), ue.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), Eh(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (co(e) && e.tool_calls)
        for (const n of e.tool_calls) n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e) throw new U("stream ended without producing a ChatCompletion");
    return e;
  }
  async finalContent() {
    return await this.done(), T(this, ue, "m", Yi).call(this);
  }
  async finalMessage() {
    return await this.done(), T(this, ue, "m", po).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), T(this, ue, "m", Xi).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), T(this, ue, "m", Qi).call(this);
  }
  async totalUsage() {
    return await this.done(), T(this, ue, "m", Zi).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = T(this, ue, "m", po).call(this);
    t && this._emit("finalMessage", t);
    const n = T(this, ue, "m", Yi).call(this);
    n && this._emit("finalContent", n);
    const r = T(this, ue, "m", Xi).call(this);
    r && this._emit("finalFunctionToolCall", r);
    const o = T(this, ue, "m", Qi).call(this);
    o != null && this._emit("finalFunctionToolCallResult", o), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", T(this, ue, "m", Zi).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), T(this, ue, "m", wh).call(this, t);
    const o = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(Us(o, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const r of t.messages) this._addMessage(r, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const r = "tool", { tool_choice: o = "auto", stream: i, ...a } = t, u = typeof o != "string" && o.type === "function" && o?.function?.name, { maxChatCompletions: c = uC } = n || {}, d = t.tools.map((p) => {
      if (cr(p)) {
        if (!p.$callback) throw new U("Tool given to `.runTools()` that does not have an associated function");
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
      if (!m) throw new U("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const _ = g.id, { name: y, arguments: E } = g.function, w = h[y];
        if (w) {
          if (u && u !== y) {
            const S = `Invalid tool_call: ${JSON.stringify(y)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: r,
              tool_call_id: _,
              content: S
            });
            continue;
          }
        } else {
          const S = `Invalid tool_call: ${JSON.stringify(y)}. Available options are: ${Object.keys(h).map((L) => JSON.stringify(L)).join(", ")}. Please try again`;
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: S
          });
          continue;
        }
        let b;
        try {
          b = lC(w) ? await w.parse(E) : E;
        } catch (S) {
          const L = S instanceof Error ? S.message : String(S);
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: L
          });
          continue;
        }
        const P = await w.function(b, this), k = T(this, ue, "m", Ch).call(this, P);
        if (this._addMessage({
          role: r,
          tool_call_id: _,
          content: k
        }), u) return;
      }
    }
  }
};
ue = /* @__PURE__ */ new WeakSet(), Yi = function() {
  return T(this, ue, "m", po).call(this).content ?? null;
}, po = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (co(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new U("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Xi = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (co(n) && n?.tool_calls?.length) for (let r = n.tool_calls.length - 1; r >= 0; r--) {
      const o = n.tool_calls[r];
      if (o?.type === "function") return o.function;
    }
  }
}, Qi = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Eh(n) && n.content != null && typeof n.content == "string" && this.messages.some((r) => r.role === "assistant" && r.tool_calls?.some((o) => o.type === "function" && o.id === n.tool_call_id))) return n.content;
  }
}, Zi = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, wh = function(t) {
  if (t.n != null && t.n > 1) throw new U("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, Ch = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var cC = class bh extends Ih {
  static runTools(t, n, r) {
    const o = new bh(), i = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, i)), o;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), co(t) && t.content && this._emit("content", t.content);
  }
}, ne = {
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
}, dC = class extends Error {
}, fC = class extends Error {
};
function hC(e, t = ne.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return pC(e.trim(), t);
}
var pC = (e, t) => {
  const n = e.length;
  let r = 0;
  const o = (p) => {
    throw new dC(`${p} at position ${r}`);
  }, i = (p) => {
    throw new fC(`${p} at position ${r}`);
  }, a = () => (f(), r >= n && o("Unexpected end of input"), e[r] === '"' ? u() : e[r] === "{" ? c() : e[r] === "[" ? d() : e.substring(r, r + 4) === "null" || ne.NULL & t && n - r < 4 && "null".startsWith(e.substring(r)) ? (r += 4, null) : e.substring(r, r + 4) === "true" || ne.BOOL & t && n - r < 4 && "true".startsWith(e.substring(r)) ? (r += 4, !0) : e.substring(r, r + 5) === "false" || ne.BOOL & t && n - r < 5 && "false".startsWith(e.substring(r)) ? (r += 5, !1) : e.substring(r, r + 8) === "Infinity" || ne.INFINITY & t && n - r < 8 && "Infinity".startsWith(e.substring(r)) ? (r += 8, 1 / 0) : e.substring(r, r + 9) === "-Infinity" || ne.MINUS_INFINITY & t && 1 < n - r && n - r < 9 && "-Infinity".startsWith(e.substring(r)) ? (r += 9, -1 / 0) : e.substring(r, r + 3) === "NaN" || ne.NAN & t && n - r < 3 && "NaN".startsWith(e.substring(r)) ? (r += 3, NaN) : h()), u = () => {
    const p = r;
    let m = !1;
    for (r++; r < n && (e[r] !== '"' || m && e[r - 1] === "\\"); )
      m = e[r] === "\\" ? !m : !1, r++;
    if (e.charAt(r) == '"') try {
      return JSON.parse(e.substring(p, ++r - Number(m)));
    } catch (g) {
      i(String(g));
    }
    else if (ne.STR & t) try {
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
        if (f(), r >= n && ne.OBJ & t) return p;
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
          if (ne.OBJ & t) return p;
          throw g;
        }
        f(), e[r] === "," && r++;
      }
    } catch {
      if (ne.OBJ & t) return p;
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
      if (ne.ARR & t) return p;
      o("Expected ']' at end of array");
    }
    return r++, p;
  }, h = () => {
    if (r === 0) {
      e === "-" && ne.NUM & t && o("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (ne.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        i(String(m));
      }
    }
    const p = r;
    for (e[r] === "-" && r++; e[r] && !",]}".includes(e[r]); ) r++;
    r == n && !(ne.NUM & t) && o("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, r));
    } catch {
      e.substring(p, r) === "-" && ne.NUM & t && o("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(p, e.lastIndexOf("e")));
      } catch (g) {
        i(String(g));
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
}, nc = (e) => hC(e, ne.ALL ^ ne.NUM), Z, ze, Lt, at, oi, Lr, ii, si, ai, Ur, li, rc, Rh = class ji extends Ih {
  constructor(t) {
    super(), Z.add(this), ze.set(this, void 0), Lt.set(this, void 0), at.set(this, void 0), O(this, ze, t, "f"), O(this, Lt, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return T(this, at, "f");
  }
  static fromReadableStream(t) {
    const n = new ji(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, r) {
    const o = new ji(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), T(this, Z, "m", oi).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) T(this, Z, "m", ii).call(this, a);
    if (i.controller.signal?.aborted) throw new Pe();
    return this._addChatCompletion(T(this, Z, "m", Ur).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), T(this, Z, "m", oi).call(this), this._connected();
    const o = er.fromReadableStream(t, this.controller);
    let i;
    for await (const a of o)
      i && i !== a.id && this._addChatCompletion(T(this, Z, "m", Ur).call(this)), T(this, Z, "m", ii).call(this, a), i = a.id;
    if (o.controller.signal?.aborted) throw new Pe();
    return this._addChatCompletion(T(this, Z, "m", Ur).call(this));
  }
  [(ze = /* @__PURE__ */ new WeakMap(), Lt = /* @__PURE__ */ new WeakMap(), at = /* @__PURE__ */ new WeakMap(), Z = /* @__PURE__ */ new WeakSet(), oi = function() {
    this.ended || O(this, at, void 0, "f");
  }, Lr = function(n) {
    let r = T(this, Lt, "f")[n.index];
    return r || (r = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, T(this, Lt, "f")[n.index] = r, r);
  }, ii = function(n) {
    if (this.ended) return;
    const r = T(this, Z, "m", rc).call(this, n);
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
      const a = T(this, Z, "m", Lr).call(this, i);
      i.finish_reason && (T(this, Z, "m", ai).call(this, i), a.current_tool_call_index != null && T(this, Z, "m", si).call(this, i, a.current_tool_call_index));
      for (const u of o.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (T(this, Z, "m", ai).call(this, i), a.current_tool_call_index != null && T(this, Z, "m", si).call(this, i, a.current_tool_call_index)), a.current_tool_call_index = u.index;
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
  }, si = function(n, r) {
    if (T(this, Z, "m", Lr).call(this, n).done_tool_calls.has(r)) return;
    const o = n.message.tool_calls?.[r];
    if (!o) throw new Error("no tool call snapshot");
    if (!o.type) throw new Error("tool call snapshot missing `type`");
    if (o.type === "function") {
      const i = T(this, ze, "f")?.tools?.find((a) => uo(a) && a.function.name === o.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: o.function.name,
        index: r,
        arguments: o.function.arguments,
        parsed_arguments: cr(i) ? i.$parseRaw(o.function.arguments) : i?.function.strict ? JSON.parse(o.function.arguments) : null
      });
    } else o.type;
  }, ai = function(n) {
    const r = T(this, Z, "m", Lr).call(this, n);
    if (n.message.content && !r.content_done) {
      r.content_done = !0;
      const o = T(this, Z, "m", li).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: o ? o.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !r.refusal_done && (r.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !r.logprobs_content_done && (r.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !r.logprobs_refusal_done && (r.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Ur = function() {
    if (this.ended) throw new U("stream has ended, this shouldn't happen");
    const n = T(this, at, "f");
    if (!n) throw new U("request ended without sending any chunks");
    return O(this, at, void 0, "f"), O(this, Lt, [], "f"), mC(n, T(this, ze, "f"));
  }, li = function() {
    const n = T(this, ze, "f")?.response_format;
    return Ls(n) ? n : null;
  }, rc = function(n) {
    var r, o, i, a;
    let u = T(this, at, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = O(this, at, {
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
        const { content: S, refusal: L, ...C } = m;
        Object.assign(_.logprobs, C), S && ((r = _.logprobs).content ?? (r.content = []), _.logprobs.content.push(...S)), L && ((o = _.logprobs).refusal ?? (o.refusal = []), _.logprobs.refusal.push(...L));
      }
      if (f && (_.finish_reason = f, T(this, ze, "f") && Ah(T(this, ze, "f")))) {
        if (f === "length") throw new Zf();
        if (f === "content_filter") throw new jf();
      }
      if (Object.assign(_, g), !h) continue;
      const { content: y, refusal: E, function_call: w, role: b, tool_calls: P, ...k } = h;
      if (Object.assign(_.message, k), E && (_.message.refusal = (_.message.refusal || "") + E), b && (_.message.role = b), w && (_.message.function_call ? (w.name && (_.message.function_call.name = w.name), w.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += w.arguments)) : _.message.function_call = w), y && (_.message.content = (_.message.content || "") + y, !_.message.refusal && T(this, Z, "m", li).call(this) && (_.message.parsed = nc(_.message.content))), P) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: S, id: L, type: C, function: M, ...F } of P) {
          const H = (a = _.message.tool_calls)[S] ?? (a[S] = {});
          Object.assign(H, F), L && (H.id = L), C && (H.type = C), M && (H.function ?? (H.function = {
            name: M.name ?? "",
            arguments: ""
          })), M?.name && (H.function.name = M.name), M?.arguments && (H.function.arguments += M.arguments, sC(T(this, ze, "f"), H) && (H.function.parsed_arguments = nc(H.function.arguments)));
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
    return new er(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function mC(e, t) {
  const { id: n, choices: r, created: o, model: i, system_fingerprint: a, ...u } = e;
  return rC({
    ...u,
    id: n,
    choices: r.map(({ message: c, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new U(`missing finish_reason for choice ${h}`);
      const { content: m = null, function_call: g, tool_calls: _, ...y } = c, E = c.role;
      if (!E) throw new U(`missing role for choice ${h}`);
      if (g) {
        const { arguments: w, name: b } = g;
        if (w == null) throw new U(`missing function_call.arguments for choice ${h}`);
        if (!b) throw new U(`missing function_call.name for choice ${h}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: w,
              name: b
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
          ...y,
          role: E,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: _.map((w, b) => {
            const { function: P, type: k, id: S, ...L } = w, { arguments: C, name: M, ...F } = P || {};
            if (S == null) throw new U(`missing choices[${h}].tool_calls[${b}].id
${Fr(e)}`);
            if (k == null) throw new U(`missing choices[${h}].tool_calls[${b}].type
${Fr(e)}`);
            if (M == null) throw new U(`missing choices[${h}].tool_calls[${b}].function.name
${Fr(e)}`);
            if (C == null) throw new U(`missing choices[${h}].tool_calls[${b}].function.arguments
${Fr(e)}`);
            return {
              ...L,
              id: S,
              type: k,
              function: {
                ...F,
                name: M,
                arguments: C
              }
            };
          })
        }
      } : {
        ...p,
        message: {
          ...y,
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
function Fr(e) {
  return JSON.stringify(e);
}
var gC = class es extends Rh {
  static fromReadableStream(t) {
    const n = new es(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, r) {
    const o = new es(n), i = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, i)), o;
  }
}, Os = class extends R {
  constructor() {
    super(...arguments), this.messages = new vh(this._client);
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
    return this._client.get(v`/chat/completions/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/chat/completions/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chat/completions", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/chat/completions/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return aC(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => Us(n, e));
  }
  runTools(e, t) {
    return e.stream ? gC.runTools(this._client, e, t) : cC.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Rh.createChatCompletion(this._client, e, t);
  }
};
Os.Messages = vh;
var Gs = class extends R {
  constructor() {
    super(...arguments), this.completions = new Os(this._client);
  }
};
Gs.Completions = Os;
var Ph = class extends R {
  create(e, t) {
    return this._client.post("/organization/admin_api_keys", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/admin_api_keys/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/admin_api_keys", Y, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/admin_api_keys/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Mh = class extends R {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", se, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, xh = class extends R {
  create(e, t) {
    return this._client.post("/organization/certificates", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(v`/organization/certificates/${e}`, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/certificates/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/certificates", se, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/certificates/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t) {
    return this._client.getAPIList("/organization/certificates/activate", pt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", pt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Nh = class extends R {
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
}, Dh = class extends R {
  create(e, t) {
    return this._client.post("/organization/invites", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/invites/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/invites", se, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/invites/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, kh = class extends R {
  create(e, t) {
    return this._client.post("/organization/roles", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/roles/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/roles/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/roles", rt, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/roles/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, $h = class extends R {
  create(e, t) {
    return this._client.post("/organization/spend_alerts", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/spend_alerts/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/spend_alerts/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/spend_alerts", se, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/spend_alerts/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Lh = class extends R {
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
}, Uh = class extends R {
  create(e, t, n) {
    return this._client.post(v`/organization/groups/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { group_id: r } = t;
    return this._client.get(v`/organization/groups/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/groups/${e}/roles`, rt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { group_id: r } = t;
    return this._client.delete(v`/organization/groups/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Fh = class extends R {
  create(e, t, n) {
    return this._client.post(v`/organization/groups/${e}/users`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { group_id: r } = t;
    return this._client.get(v`/organization/groups/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/groups/${e}/users`, rt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { group_id: r } = t;
    return this._client.delete(v`/organization/groups/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, ko = class extends R {
  constructor() {
    super(...arguments), this.users = new Fh(this._client), this.roles = new Uh(this._client);
  }
  create(e, t) {
    return this._client.post("/organization/groups", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/groups/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/groups/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/groups", rt, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/groups/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
ko.Users = Fh;
ko.Roles = Uh;
var Oh = class extends R {
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(v`/organization/projects/${r}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/api_keys`, se, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(v`/organization/projects/${r}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Gh = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates`, se, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/activate`, pt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/deactivate`, pt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Bh = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/organization/projects/${e}/data_retention`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/data_retention`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, qh = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/organization/projects/${e}/hosted_tool_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/hosted_tool_permissions`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Hh = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/organization/projects/${e}/model_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/model_permissions`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/projects/${e}/model_permissions`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Vh = class extends R {
  listRateLimits(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/rate_limits`, se, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  updateRateLimit(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(v`/organization/projects/${r}/rate_limits/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Jh = class extends R {
  create(e, t, n) {
    return this._client.post(v`/projects/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(v`/projects/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(v`/projects/${r}/roles/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/projects/${e}/roles`, rt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(v`/projects/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Kh = class extends R {
  create(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/service_accounts`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(v`/organization/projects/${r}/service_accounts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(v`/organization/projects/${r}/service_accounts/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/service_accounts`, se, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(v`/organization/projects/${r}/service_accounts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Wh = class extends R {
  create(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/spend_alerts`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(v`/organization/projects/${r}/spend_alerts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(v`/organization/projects/${r}/spend_alerts/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/spend_alerts`, se, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(v`/organization/projects/${r}/spend_alerts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, zh = class extends R {
  create(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(v`/projects/${r}/groups/${e}/roles`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r, group_id: o } = t;
    return this._client.get(v`/projects/${r}/groups/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.getAPIList(v`/projects/${r}/groups/${e}/roles`, rt, {
      query: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r, group_id: o } = t;
    return this._client.delete(v`/projects/${r}/groups/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Bs = class extends R {
  constructor() {
    super(...arguments), this.roles = new zh(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/groups`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.get(v`/organization/projects/${r}/groups/${e}`, {
      query: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/groups`, rt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(v`/organization/projects/${r}/groups/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Bs.Roles = zh;
var Yh = class extends R {
  create(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(v`/projects/${r}/users/${e}/roles`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r, user_id: o } = t;
    return this._client.get(v`/projects/${r}/users/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.getAPIList(v`/projects/${r}/users/${e}/roles`, rt, {
      query: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r, user_id: o } = t;
    return this._client.delete(v`/projects/${r}/users/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, qs = class extends R {
  constructor() {
    super(...arguments), this.roles = new Yh(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/users`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: r } = t;
    return this._client.get(v`/organization/projects/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: r, ...o } = t;
    return this._client.post(v`/organization/projects/${r}/users/${e}`, {
      body: o,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/users`, se, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: r } = t;
    return this._client.delete(v`/organization/projects/${r}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
qs.Roles = Yh;
var Ce = class extends R {
  constructor() {
    super(...arguments), this.users = new qs(this._client), this.serviceAccounts = new Kh(this._client), this.apiKeys = new Oh(this._client), this.rateLimits = new Vh(this._client), this.modelPermissions = new Hh(this._client), this.hostedToolPermissions = new qh(this._client), this.groups = new Bs(this._client), this.roles = new Jh(this._client), this.dataRetention = new Bh(this._client), this.spendAlerts = new Wh(this._client), this.certificates = new Gh(this._client);
  }
  create(e, t) {
    return this._client.post("/organization/projects", {
      body: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/projects/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/projects/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/projects", se, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  archive(e, t) {
    return this._client.post(v`/organization/projects/${e}/archive`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Ce.Users = qs;
Ce.ServiceAccounts = Kh;
Ce.APIKeys = Oh;
Ce.RateLimits = Vh;
Ce.ModelPermissions = Hh;
Ce.HostedToolPermissions = qh;
Ce.Groups = Bs;
Ce.Roles = Jh;
Ce.DataRetention = Bh;
Ce.SpendAlerts = Wh;
Ce.Certificates = Gh;
var Xh = class extends R {
  create(e, t, n) {
    return this._client.post(v`/organization/users/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { user_id: r } = t;
    return this._client.get(v`/organization/users/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/users/${e}/roles`, rt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { user_id: r } = t;
    return this._client.delete(v`/organization/users/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Hs = class extends R {
  constructor() {
    super(...arguments), this.roles = new Xh(this._client);
  }
  retrieve(e, t) {
    return this._client.get(v`/organization/users/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/organization/users/${e}`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/organization/users", se, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/organization/users/${e}`, {
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
Hs.Roles = Xh;
var Ie = class extends R {
  constructor() {
    super(...arguments), this.auditLogs = new Mh(this._client), this.adminAPIKeys = new Ph(this._client), this.usage = new Lh(this._client), this.invites = new Dh(this._client), this.users = new Hs(this._client), this.groups = new ko(this._client), this.roles = new kh(this._client), this.dataRetention = new Nh(this._client), this.spendAlerts = new $h(this._client), this.certificates = new xh(this._client), this.projects = new Ce(this._client);
  }
};
Ie.AuditLogs = Mh;
Ie.AdminAPIKeys = Ph;
Ie.Usage = Lh;
Ie.Invites = Dh;
Ie.Users = Hs;
Ie.Groups = ko;
Ie.Roles = kh;
Ie.DataRetention = Nh;
Ie.SpendAlerts = $h;
Ie.Certificates = xh;
Ie.Projects = Ce;
var Vs = class extends R {
  constructor() {
    super(...arguments), this.organization = new Ie(this._client);
  }
};
Vs.Organization = Ie;
var Qh = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* _C(e) {
  if (!e) return;
  if (Qh in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Gu(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = Gu(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var D = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of _C(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [Qh]: !0,
    values: t,
    nulls: n
  };
}, Zh = class extends R {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: D([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, jh = class extends R {
  create(e, t) {
    return this._client.post("/audio/transcriptions", Ve({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, ep = class extends R {
  create(e, t) {
    return this._client.post("/audio/translations", Ve({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, dr = class extends R {
  constructor() {
    super(...arguments), this.transcriptions = new jh(this._client), this.translations = new ep(this._client), this.speech = new Zh(this._client);
  }
};
dr.Transcriptions = jh;
dr.Translations = ep;
dr.Speech = Zh;
var tp = class extends R {
  create(e, t) {
    return this._client.post("/batches", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/batches/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/batches", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(v`/batches/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, np = class extends R {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/assistants/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/assistants/${e}`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", Y, {
      query: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/assistants/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, rp = class extends R {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, op = class extends R {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, $o = class extends R {
  constructor() {
    super(...arguments), this.sessions = new rp(this._client), this.transcriptionSessions = new op(this._client);
  }
};
$o.Sessions = rp;
$o.TranscriptionSessions = op;
var ip = class extends R {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(v`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, sp = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/chatkit/threads/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", se, {
      query: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/chatkit/threads/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(v`/chatkit/threads/${e}/items`, se, {
      query: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Lo = class extends R {
  constructor() {
    super(...arguments), this.sessions = new ip(this._client), this.threads = new sp(this._client);
  }
};
Lo.Sessions = ip;
Lo.Threads = sp;
var ap = class extends R {
  create(e, t, n) {
    return this._client.post(v`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(v`/threads/${r}/messages/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(v`/threads/${r}/messages/${e}`, {
      body: o,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/threads/${e}/messages`, Y, {
      query: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { thread_id: r } = t;
    return this._client.delete(v`/threads/${r}/messages/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, lp = class extends R {
  retrieve(e, t, n) {
    const { thread_id: r, run_id: o, ...i } = t;
    return this._client.get(v`/threads/${r}/runs/${o}/steps/${e}`, {
      query: i,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.getAPIList(v`/threads/${r}/runs/${e}/steps`, Y, {
      query: o,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, yC = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, r = new Uint8Array(n);
    for (let o = 0; o < n; o++) r[o] = t.charCodeAt(o);
    return Array.from(new Float32Array(r.buffer));
  }
}, lt = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, ie, Rt, ts, He, Xr, ke, Pt, Wt, wt, mo, Se, Qr, Zr, Kn, Gn, Bn, oc, ic, sc, ac, lc, uc, cc, Wn = class extends Fs {
  constructor() {
    super(...arguments), ie.add(this), ts.set(this, []), He.set(this, {}), Xr.set(this, {}), ke.set(this, void 0), Pt.set(this, void 0), Wt.set(this, void 0), wt.set(this, void 0), mo.set(this, void 0), Se.set(this, void 0), Qr.set(this, void 0), Zr.set(this, void 0), Kn.set(this, void 0);
  }
  [(ts = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ new WeakMap(), Xr = /* @__PURE__ */ new WeakMap(), ke = /* @__PURE__ */ new WeakMap(), Pt = /* @__PURE__ */ new WeakMap(), Wt = /* @__PURE__ */ new WeakMap(), wt = /* @__PURE__ */ new WeakMap(), mo = /* @__PURE__ */ new WeakMap(), Se = /* @__PURE__ */ new WeakMap(), Qr = /* @__PURE__ */ new WeakMap(), Zr = /* @__PURE__ */ new WeakMap(), Kn = /* @__PURE__ */ new WeakMap(), ie = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new Rt();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const r = er.fromReadableStream(e, this.controller);
    for await (const o of r) T(this, ie, "m", Gn).call(this, o);
    if (r.controller.signal?.aborted) throw new Pe();
    return this._addRun(T(this, ie, "m", Bn).call(this));
  }
  toReadableStream() {
    return new er(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, r) {
    const o = new Rt();
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
    for await (const u of a) T(this, ie, "m", Gn).call(this, u);
    if (a.controller.signal?.aborted) throw new Pe();
    return this._addRun(T(this, ie, "m", Bn).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const r = new Rt();
    return r._run(() => r._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  static createAssistantStream(e, t, n, r) {
    const o = new Rt();
    return o._run(() => o._runAssistantStream(e, t, n, {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  currentEvent() {
    return T(this, Qr, "f");
  }
  currentRun() {
    return T(this, Zr, "f");
  }
  currentMessageSnapshot() {
    return T(this, ke, "f");
  }
  currentRunStepSnapshot() {
    return T(this, Kn, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(T(this, He, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(T(this, Xr, "f"));
  }
  async finalRun() {
    if (await this.done(), !T(this, Pt, "f")) throw Error("Final run was not received.");
    return T(this, Pt, "f");
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
    for await (const a of i) T(this, ie, "m", Gn).call(this, a);
    if (i.controller.signal?.aborted) throw new Pe();
    return this._addRun(T(this, ie, "m", Bn).call(this));
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
    for await (const u of a) T(this, ie, "m", Gn).call(this, u);
    if (a.controller.signal?.aborted) throw new Pe();
    return this._addRun(T(this, ie, "m", Bn).call(this));
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
      else if (ti(o) && ti(r)) o = this.accumulateDelta(o, r);
      else if (Array.isArray(o) && Array.isArray(r)) {
        if (o.every((i) => typeof i == "string" || typeof i == "number")) {
          o.push(...r);
          continue;
        }
        for (const i of r) {
          if (!ti(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
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
Rt = Wn, Gn = function(t) {
  if (!this.ended)
    switch (O(this, Qr, t, "f"), T(this, ie, "m", sc).call(this, t), t.event) {
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
        T(this, ie, "m", cc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        T(this, ie, "m", ic).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        T(this, ie, "m", oc).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, Bn = function() {
  if (this.ended) throw new U("stream has ended, this shouldn't happen");
  if (!T(this, Pt, "f")) throw Error("Final run has not been received");
  return T(this, Pt, "f");
}, oc = function(t) {
  const [n, r] = T(this, ie, "m", lc).call(this, t, T(this, ke, "f"));
  O(this, ke, n, "f"), T(this, Xr, "f")[n.id] = n;
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
        if (o.index != T(this, Wt, "f")) {
          if (T(this, wt, "f")) switch (T(this, wt, "f").type) {
            case "text":
              this._emit("textDone", T(this, wt, "f").text, T(this, ke, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", T(this, wt, "f").image_file, T(this, ke, "f"));
              break;
          }
          O(this, Wt, o.index, "f");
        }
        O(this, wt, n.content[o.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (T(this, Wt, "f") !== void 0) {
        const o = t.data.content[T(this, Wt, "f")];
        if (o) switch (o.type) {
          case "image_file":
            this._emit("imageFileDone", o.image_file, T(this, ke, "f"));
            break;
          case "text":
            this._emit("textDone", o.text, T(this, ke, "f"));
            break;
        }
      }
      T(this, ke, "f") && this._emit("messageDone", t.data), O(this, ke, void 0, "f");
  }
}, ic = function(t) {
  const n = T(this, ie, "m", ac).call(this, t);
  switch (O(this, Kn, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const r = t.data.delta;
      if (r.step_details && r.step_details.type == "tool_calls" && r.step_details.tool_calls && n.step_details.type == "tool_calls") for (const o of r.step_details.tool_calls) o.index == T(this, mo, "f") ? this._emit("toolCallDelta", o, n.step_details.tool_calls[o.index]) : (T(this, Se, "f") && this._emit("toolCallDone", T(this, Se, "f")), O(this, mo, o.index, "f"), O(this, Se, n.step_details.tool_calls[o.index], "f"), T(this, Se, "f") && this._emit("toolCallCreated", T(this, Se, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      O(this, Kn, void 0, "f"), t.data.step_details.type == "tool_calls" && T(this, Se, "f") && (this._emit("toolCallDone", T(this, Se, "f")), O(this, Se, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, sc = function(t) {
  T(this, ts, "f").push(t), this._emit("event", t);
}, ac = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return T(this, He, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = T(this, He, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let r = t.data;
      if (r.delta) {
        const o = Rt.accumulateDelta(n, r.delta);
        T(this, He, "f")[t.data.id] = o;
      }
      return T(this, He, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      T(this, He, "f")[t.data.id] = t.data;
      break;
  }
  if (T(this, He, "f")[t.data.id]) return T(this, He, "f")[t.data.id];
  throw new Error("No snapshot available");
}, lc = function(t, n) {
  let r = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, r];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let o = t.data;
      if (o.delta.content) for (const i of o.delta.content) if (i.index in n.content) {
        let a = n.content[i.index];
        n.content[i.index] = T(this, ie, "m", uc).call(this, i, a);
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
}, uc = function(t, n) {
  return Rt.accumulateDelta(n, t);
}, cc = function(t) {
  switch (O(this, Zr, t.data, "f"), t.event) {
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
      O(this, Pt, t.data, "f"), T(this, Se, "f") && (this._emit("toolCallDone", T(this, Se, "f")), O(this, Se, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Js = class extends R {
  constructor() {
    super(...arguments), this.steps = new lp(this._client);
  }
  create(e, t, n) {
    const { include: r, ...o } = t;
    return this._client.post(v`/threads/${e}/runs`, {
      query: { include: r },
      body: o,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: r } = t;
    return this._client.get(v`/threads/${r}/runs/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(v`/threads/${r}/runs/${e}`, {
      body: o,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/threads/${e}/runs`, Y, {
      query: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { thread_id: r } = t;
    return this._client.post(v`/threads/${r}/runs/${e}/cancel`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(r.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return Wn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const r = D([n?.headers, {
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
          await ur(a);
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
    return Wn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: r, ...o } = t;
    return this._client.post(v`/threads/${r}/runs/${e}/submit_tool_outputs`, {
      body: o,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
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
    return Wn.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
Js.Steps = lp;
var Uo = class extends R {
  constructor() {
    super(...arguments), this.runs = new Js(this._client), this.messages = new ap(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/threads/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/threads/${e}`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/threads/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
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
    return Wn.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Uo.Runs = Js;
Uo.Messages = ap;
var an = class extends R {
  constructor() {
    super(...arguments), this.realtime = new $o(this._client), this.chatkit = new Lo(this._client), this.assistants = new np(this._client), this.threads = new Uo(this._client);
  }
};
an.Realtime = $o;
an.ChatKit = Lo;
an.Assistants = np;
an.Threads = Uo;
var up = class extends R {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, cp = class extends R {
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(v`/containers/${r}/files/${e}/content`, {
      ...n,
      headers: D([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Ks = class extends R {
  constructor() {
    super(...arguments), this.content = new cp(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/containers/${e}/files`, Do({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(v`/containers/${r}/files/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/containers/${e}/files`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { container_id: r } = t;
    return this._client.delete(v`/containers/${r}/files/${e}`, {
      ...n,
      headers: D([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Ks.Content = cp;
var Ws = class extends R {
  constructor() {
    super(...arguments), this.files = new Ks(this._client);
  }
  create(e, t) {
    return this._client.post("/containers", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/containers/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/containers/${e}`, {
      ...t,
      headers: D([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Ws.Files = Ks;
var dp = class extends R {
  create(e, t, n) {
    const { include: r, ...o } = t;
    return this._client.post(v`/conversations/${e}/items`, {
      query: { include: r },
      body: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: r, ...o } = t;
    return this._client.get(v`/conversations/${r}/items/${e}`, {
      query: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/conversations/${e}/items`, se, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { conversation_id: r } = t;
    return this._client.delete(v`/conversations/${r}/items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, zs = class extends R {
  constructor() {
    super(...arguments), this.items = new dp(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/conversations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/conversations/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/conversations/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/conversations/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
zs.Items = dp;
var fp = class extends R {
  create(e, t) {
    const n = !!e.encoding_format;
    let r = n ? e.encoding_format : "base64";
    n && oe(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const o = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: r
      },
      ...t,
      __security: { bearerAuth: !0 }
    });
    return n ? o : (oe(this._client).debug("embeddings/decoding base64 embeddings from base64"), o._thenUnwrap((i) => (i && i.data && i.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = yC(u);
    }), i)));
  }
}, hp = class extends R {
  retrieve(e, t, n) {
    const { eval_id: r, run_id: o } = t;
    return this._client.get(v`/evals/${r}/runs/${o}/output_items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { eval_id: r, ...o } = t;
    return this._client.getAPIList(v`/evals/${r}/runs/${e}/output_items`, Y, {
      query: o,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Ys = class extends R {
  constructor() {
    super(...arguments), this.outputItems = new hp(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/evals/${e}/runs`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { eval_id: r } = t;
    return this._client.get(v`/evals/${r}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/evals/${e}/runs`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { eval_id: r } = t;
    return this._client.delete(v`/evals/${r}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { eval_id: r } = t;
    return this._client.post(v`/evals/${r}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
Ys.OutputItems = hp;
var Xs = class extends R {
  constructor() {
    super(...arguments), this.runs = new Ys(this._client);
  }
  create(e, t) {
    return this._client.post("/evals", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/evals/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/evals/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/evals", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/evals/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
Xs.Runs = Ys;
var pp = class extends R {
  create(e, t) {
    return this._client.post("/files", Ve({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(v`/files/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/files", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/files/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  content(e, t) {
    return this._client.get(v`/files/${e}/content`, {
      ...t,
      headers: D([{ Accept: "application/binary" }, t?.headers]),
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
      if (await ur(t), i = await this.retrieve(e), Date.now() - o > n) throw new Ns({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, mp = class extends R {
}, gp = class extends R {
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
}, Qs = class extends R {
  constructor() {
    super(...arguments), this.graders = new gp(this._client);
  }
};
Qs.Graders = gp;
var _p = class extends R {
  create(e, t, n) {
    return this._client.getAPIList(v`/fine_tuning/checkpoints/${e}/permissions`, pt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t = {}, n) {
    return this._client.get(v`/fine_tuning/checkpoints/${e}/permissions`, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/fine_tuning/checkpoints/${e}/permissions`, se, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: r } = t;
    return this._client.delete(v`/fine_tuning/checkpoints/${r}/permissions/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Zs = class extends R {
  constructor() {
    super(...arguments), this.permissions = new _p(this._client);
  }
};
Zs.Permissions = _p;
var yp = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/fine_tuning/jobs/${e}/checkpoints`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, js = class extends R {
  constructor() {
    super(...arguments), this.checkpoints = new yp(this._client);
  }
  create(e, t) {
    return this._client.post("/fine_tuning/jobs", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/fine_tuning/jobs/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/fine_tuning/jobs", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(v`/fine_tuning/jobs/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  listEvents(e, t = {}, n) {
    return this._client.getAPIList(v`/fine_tuning/jobs/${e}/events`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  pause(e, t) {
    return this._client.post(v`/fine_tuning/jobs/${e}/pause`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  resume(e, t) {
    return this._client.post(v`/fine_tuning/jobs/${e}/resume`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
js.Checkpoints = yp;
var ln = class extends R {
  constructor() {
    super(...arguments), this.methods = new mp(this._client), this.jobs = new js(this._client), this.checkpoints = new Zs(this._client), this.alpha = new Qs(this._client);
  }
};
ln.Methods = mp;
ln.Jobs = js;
ln.Checkpoints = Zs;
ln.Alpha = Qs;
var vp = class extends R {
}, ea = class extends R {
  constructor() {
    super(...arguments), this.graderModels = new vp(this._client);
  }
};
ea.GraderModels = vp;
var Ap = class extends R {
  createVariation(e, t) {
    return this._client.post("/images/variations", Ve({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", Ve({
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
}, Tp = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", pt, {
      ...e,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Ep = class extends R {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Sp = class extends R {
  accept(e, t, n) {
    return this._client.post(v`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: D([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  hangup(e, t) {
    return this._client.post(v`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: D([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  refer(e, t, n) {
    return this._client.post(v`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: D([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(v`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: D([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, wp = class extends R {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Fo = class extends R {
  constructor() {
    super(...arguments), this.clientSecrets = new wp(this._client), this.calls = new Sp(this._client);
  }
};
Fo.ClientSecrets = wp;
Fo.Calls = Sp;
function vC(e, t) {
  return !t || !TC(t) ? {
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
  } : Cp(e, t);
}
function Cp(e, t) {
  const n = e.output.map((o) => {
    if (o.type === "function_call") return {
      ...o,
      parsed_arguments: wC(t, o)
    };
    if (o.type === "message") {
      const i = o.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: AC(t, a.text)
      } : a);
      return {
        ...o,
        content: i
      };
    }
    return o;
  }), r = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || ns(r), Object.defineProperty(r, "output_parsed", {
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
function AC(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function TC(e) {
  return !!Ls(e.text?.format);
}
function EC(e) {
  return e?.$brand === "auto-parseable-tool";
}
function SC(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function wC(e, t) {
  const n = SC(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: EC(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function ns(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const r of n.content) r.type === "output_text" && t.push(r.text);
  e.output_text = t.join("");
}
var Ut, Or, ut, Gr, dc, fc, hc, pc, CC = class Ip extends Fs {
  constructor(t) {
    super(), Ut.add(this), Or.set(this, void 0), ut.set(this, void 0), Gr.set(this, void 0), O(this, Or, t, "f");
  }
  static createResponse(t, n, r) {
    const o = new Ip(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), T(this, Ut, "m", dc).call(this);
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
    for await (const u of i) T(this, Ut, "m", fc).call(this, u, a);
    if (i.controller.signal?.aborted) throw new Pe();
    return T(this, Ut, "m", hc).call(this);
  }
  [(Or = /* @__PURE__ */ new WeakMap(), ut = /* @__PURE__ */ new WeakMap(), Gr = /* @__PURE__ */ new WeakMap(), Ut = /* @__PURE__ */ new WeakSet(), dc = function() {
    this.ended || O(this, ut, void 0, "f");
  }, fc = function(n, r) {
    if (this.ended) return;
    const o = (a, u) => {
      (r == null || u.sequence_number > r) && this._emit(a, u);
    }, i = T(this, Ut, "m", pc).call(this, n);
    switch (o("event", n), n.type) {
      case "response.output_text.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new U(`missing output at index ${n.output_index}`);
        if (a.type === "message") {
          const u = a.content[n.content_index];
          if (!u) throw new U(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new U(`expected content to be 'output_text', got ${u.type}`);
          o("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new U(`missing output at index ${n.output_index}`);
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
  }, hc = function() {
    if (this.ended) throw new U("stream has ended, this shouldn't happen");
    const n = T(this, ut, "f");
    if (!n) throw new U("request ended without sending any events");
    O(this, ut, void 0, "f");
    const r = IC(n, T(this, Or, "f"));
    return O(this, Gr, r, "f"), r;
  }, pc = function(n) {
    let r = T(this, ut, "f");
    if (!r) {
      if (n.type !== "response.created") throw new U(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return r = O(this, ut, n.response, "f"), r;
    }
    switch (n.type) {
      case "response.output_item.added":
        r.output.push(n.item);
        break;
      case "response.content_part.added": {
        const o = r.output[n.output_index];
        if (!o) throw new U(`missing output at index ${n.output_index}`);
        const i = o.type, a = n.part;
        i === "message" && a.type !== "reasoning_text" ? o.content.push(a) : i === "reasoning" && a.type === "reasoning_text" && (o.content || (o.content = []), o.content.push(a));
        break;
      }
      case "response.output_text.delta": {
        const o = r.output[n.output_index];
        if (!o) throw new U(`missing output at index ${n.output_index}`);
        if (o.type === "message") {
          const i = o.content[n.content_index];
          if (!i) throw new U(`missing content at index ${n.content_index}`);
          if (i.type !== "output_text") throw new U(`expected content to be 'output_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const o = r.output[n.output_index];
        if (!o) throw new U(`missing output at index ${n.output_index}`);
        o.type === "function_call" && (o.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const o = r.output[n.output_index];
        if (!o) throw new U(`missing output at index ${n.output_index}`);
        if (o.type === "reasoning") {
          const i = o.content?.[n.content_index];
          if (!i) throw new U(`missing content at index ${n.content_index}`);
          if (i.type !== "reasoning_text") throw new U(`expected content to be 'reasoning_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.completed":
        O(this, ut, n.response, "f");
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
    const t = T(this, Gr, "f");
    if (!t) throw new U("stream ended without producing a ChatCompletion");
    return t;
  }
};
function IC(e, t) {
  return vC(e, t);
}
var bp = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/responses/${e}/input_items`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Rp = class extends R {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Oo = class extends R {
  constructor() {
    super(...arguments), this.inputItems = new bp(this._client), this.inputTokens = new Rp(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && ns(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(v`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((r) => ("object" in r && r.object === "response" && ns(r), r));
  }
  delete(e, t) {
    return this._client.delete(v`/responses/${e}`, {
      ...t,
      headers: D([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Cp(n, e));
  }
  stream(e, t) {
    return CC.createResponse(this._client, e, t);
  }
  cancel(e, t) {
    return this._client.post(v`/responses/${e}/cancel`, {
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
Oo.InputItems = bp;
Oo.InputTokens = Rp;
var Pp = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/skills/${e}/content`, {
      ...t,
      headers: D([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Mp = class extends R {
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(v`/skills/${r}/versions/${e}/content`, {
      ...n,
      headers: D([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, ta = class extends R {
  constructor() {
    super(...arguments), this.content = new Mp(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(v`/skills/${e}/versions`, Do({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(v`/skills/${r}/versions/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/skills/${e}/versions`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { skill_id: r } = t;
    return this._client.delete(v`/skills/${r}/versions/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
ta.Content = Mp;
var Go = class extends R {
  constructor() {
    super(...arguments), this.content = new Pp(this._client), this.versions = new ta(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", Do({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(v`/skills/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/skills/${e}`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/skills", Y, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/skills/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
};
Go.Content = Pp;
Go.Versions = ta;
var xp = class extends R {
  create(e, t, n) {
    return this._client.post(v`/uploads/${e}/parts`, Ve({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, na = class extends R {
  constructor() {
    super(...arguments), this.parts = new xp(this._client);
  }
  create(e, t) {
    return this._client.post("/uploads", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(v`/uploads/${e}/cancel`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  complete(e, t, n) {
    return this._client.post(v`/uploads/${e}/complete`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
na.Parts = xp;
var bC = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((o) => o.status === "rejected");
  if (n.length) {
    for (const o of n) console.error(o.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const r = [];
  for (const o of t) o.status === "fulfilled" && r.push(o.value);
  return r;
}, Np = class extends R {
  create(e, t, n) {
    return this._client.post(v`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(v`/vector_stores/${r}/file_batches/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.post(v`/vector_stores/${r}/file_batches/${e}/cancel`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t);
    return await this.poll(e, r.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: r, ...o } = t;
    return this._client.getAPIList(v`/vector_stores/${r}/file_batches/${e}/files`, Y, {
      query: o,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async poll(e, t, n) {
    const r = D([n?.headers, {
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
          await ur(a);
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
    return await bC(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, Dp = class extends R {
  create(e, t, n) {
    return this._client.post(v`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.get(v`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { vector_store_id: r, ...o } = t;
    return this._client.post(v`/vector_stores/${r}/files/${e}`, {
      body: o,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/vector_stores/${e}/files`, Y, {
      query: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { vector_store_id: r } = t;
    return this._client.delete(v`/vector_stores/${r}/files/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const r = await this.create(e, t, n);
    return await this.poll(e, r.id, n);
  }
  async poll(e, t, n) {
    const r = D([n?.headers, {
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
          await ur(a);
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
    return this._client.getAPIList(v`/vector_stores/${r}/files/${e}/content`, pt, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Bo = class extends R {
  constructor() {
    super(...arguments), this.files = new Dp(this._client), this.fileBatches = new Np(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/vector_stores/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", Y, {
      query: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/vector_stores/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(v`/vector_stores/${e}/search`, pt, {
      body: t,
      method: "post",
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Bo.Files = Dp;
Bo.FileBatches = Np;
var kp = class extends R {
  create(e, t) {
    return this._client.post("/videos", Ve({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t) {
    return this._client.get(v`/videos/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/videos", se, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/videos/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  createCharacter(e, t) {
    return this._client.post("/videos/characters", Ve({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(v`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: D([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", Ve({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", Ve({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  getCharacter(e, t) {
    return this._client.get(v`/videos/characters/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  remix(e, t, n) {
    return this._client.post(v`/videos/${e}/remix`, Do({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, qt, $p, jr, Lp = class extends R {
  constructor() {
    super(...arguments), qt.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
    return await this.verifySignature(e, t, n, r), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    T(this, qt, "m", $p).call(this, n);
    const o = D([t]).values, i = T(this, qt, "m", jr).call(this, o, "webhook-signature"), a = T(this, qt, "m", jr).call(this, o, "webhook-timestamp"), u = T(this, qt, "m", jr).call(this, o, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new Nn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > r) throw new Nn("Webhook timestamp is too old");
    if (c > d + r) throw new Nn("Webhook timestamp is too new");
    const h = i.split(" ").map((g) => g.startsWith("v1,") ? g.substring(3) : g), f = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), p = u ? `${u}.${a}.${e}` : `${a}.${e}`, m = await crypto.subtle.importKey("raw", f, {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["verify"]);
    for (const g of h) try {
      const _ = Buffer.from(g, "base64");
      if (await crypto.subtle.verify("HMAC", m, _, new TextEncoder().encode(p))) return;
    } catch {
      continue;
    }
    throw new Nn("The given webhook signature does not match the expected signature");
  }
};
qt = /* @__PURE__ */ new WeakSet(), $p = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, jr = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const r = t.get(n);
  if (r == null) throw new Error(`Missing required header: ${n}`);
  return r;
};
var rs, ra, eo, Up, RC = "workload-identity-auth", q = class {
  constructor({ baseURL: e = lt("OPENAI_BASE_URL"), apiKey: t = lt("OPENAI_API_KEY") ?? null, adminAPIKey: n = lt("OPENAI_ADMIN_KEY") ?? null, organization: r = lt("OPENAI_ORG_ID") ?? null, project: o = lt("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = lt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: a, ...u } = {}) {
    rs.add(this), eo.set(this, void 0), this.completions = new up(this), this.chat = new Gs(this), this.embeddings = new fp(this), this.files = new pp(this), this.images = new Ap(this), this.audio = new dr(this), this.moderations = new Ep(this), this.models = new Tp(this), this.fineTuning = new ln(this), this.graders = new ea(this), this.vectorStores = new Bo(this), this.webhooks = new Lp(this), this.beta = new an(this), this.batches = new tp(this), this.uploads = new na(this), this.admin = new Vs(this), this.responses = new Oo(this), this.realtime = new Fo(this), this.conversations = new zs(this), this.evals = new Xs(this), this.containers = new Ws(this), this.skills = new Go(this), this.videos = new kp(this);
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
    if (t && a) throw new U("The `apiKey` and `workloadIdentity` options are mutually exclusive");
    if (!t && !n && !a) throw new U("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, `adminAPIKey`, or set the `OPENAI_API_KEY` or `OPENAI_ADMIN_KEY` environment variable.");
    if (!c.dangerouslyAllowBrowser && Iw()) throw new U(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? ra.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = Zu(c.logLevel, "ClientOptions.logLevel", this) ?? Zu(lt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? th(), O(this, eo, xw, "f");
    const h = lt("OPENAI_CUSTOM_HEADERS");
    if (h) {
      const f = {};
      for (const p of h.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (f[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = D([f, c.defaultHeaders]);
    }
    this._options = c, a && (this._workloadIdentityAuth = new Yw(a, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = r, this.project = o, this.webhookSecret = i;
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
    return D([t.bearerAuth ? await this.bearerAuth(e) : null, t.adminAPIKeyAuth ? await this.adminAPIKeyAuth(e) : null]);
  }
  async bearerAuth(e) {
    if (this._workloadIdentityAuth) return D([{ Authorization: `Bearer ${await this._workloadIdentityAuth.getToken()}` }]);
    if (this.apiKey != null)
      return D([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  async adminAPIKeyAuth(e) {
    if (this.adminAPIKey != null)
      return D([{ Authorization: `Bearer ${this.adminAPIKey}` }]);
  }
  stringifyQuery(e) {
    return Uw(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Gt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Hf()}`;
  }
  makeStatusError(e, t, n, r) {
    return le.generate(e, t, n, r);
  }
  async _callApiKey() {
    const e = this._options.apiKey;
    if (typeof e != "function") return !1;
    let t;
    try {
      t = await e();
    } catch (n) {
      throw n instanceof U ? n : new U(`Failed to get token from 'apiKey' function: ${n.message}`, { cause: n });
    }
    if (typeof t != "string" || !t) throw new U(`Expected 'apiKey' function argument to return a string but it returned ${t}`);
    return this.apiKey = t, !0;
  }
  buildURL(e, t, n) {
    const r = !T(this, rs, "m", Up).call(this) && n || this.baseURL, o = Ew(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!Bu(i) || !Bu(a)) && (t = {
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
    return new fh(this, this.makeRequest(e, t, void 0));
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
    if (oe(this).debug(`[${c}] sending request`, Et({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: i.headers
    })), r.signal?.aborted) throw new Pe();
    const f = r.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(a, i, u, p, f).catch(qi), g = Date.now();
    if (m instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new Pe();
      const E = Bi(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return oe(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - ${y}`), oe(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (${y})`, Et({
          retryOfRequestLogID: n,
          url: a,
          durationMs: g - h,
          message: m.message
        })), this.retryRequest(r, t, n ?? c);
      throw oe(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - error; no more retries left`), oe(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (error; no more retries left)`, Et({
        retryOfRequestLogID: n,
        url: a,
        durationMs: g - h,
        message: m.message
      })), m instanceof eh || m instanceof Aw ? m : E ? new Ns() : new Mo({
        message: PC(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, E]) => ", " + y + ": " + JSON.stringify(E)).join("")}] ${i.method} ${a} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - h}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && f.bearerAuth && !r.__metadata?.hasStreamingBody && !r.__metadata?.workloadIdentityTokenRefreshed)
        return await Ju(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...r,
          __metadata: {
            ...r.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(m);
      if (t && y) {
        const k = `retrying, ${t} attempts remaining`;
        return await Ju(m.body), oe(this).info(`${_} - ${k}`), oe(this).debug(`[${c}] response error (${k})`, Et({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - h
        })), this.retryRequest(r, t, n ?? c, m.headers);
      }
      const E = y ? "error; no more retries left" : "error; not retryable";
      oe(this).info(`${_} - ${E}`);
      const w = await m.text().catch((k) => qi(k).message), b = Cw(w), P = b ? void 0 : w;
      throw oe(this).debug(`[${c}] response error (${E})`, Et({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: P,
        durationMs: Date.now() - h
      })), this.makeStatusError(m.status, b, P, m.headers);
    }
    return oe(this).info(_), oe(this).debug(`[${c}] response start`, Et({
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
    return new Kw(this, n, e);
  }
  async fetchWithAuth(e, t, n, r, o = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && o.bearerAuth) {
      const i = t.headers, a = i.get("Authorization");
      if (!a || a === `Bearer ${RC}`) {
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
    return await ur(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: i, defaultBaseURL: a } = n, u = this.buildURL(o, i, a);
    "timeout" in n && ww("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const i = D([
      o,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(r),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...Mw(),
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
    const n = D([t]), r = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, o = !r && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || r ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !o
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: rh(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...T(this, eo, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
ra = q, eo = /* @__PURE__ */ new WeakMap(), rs = /* @__PURE__ */ new WeakSet(), Up = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
q.OpenAI = ra;
q.DEFAULT_TIMEOUT = 6e5;
q.OpenAIError = U;
q.APIError = le;
q.APIConnectionError = Mo;
q.APIConnectionTimeoutError = Ns;
q.APIUserAbortError = Pe;
q.NotFoundError = Wf;
q.ConflictError = zf;
q.RateLimitError = Xf;
q.BadRequestError = Vf;
q.AuthenticationError = Jf;
q.InternalServerError = Qf;
q.PermissionDeniedError = Kf;
q.UnprocessableEntityError = Yf;
q.InvalidWebhookSignatureError = Nn;
q.toFile = eC;
q.Completions = up;
q.Chat = Gs;
q.Embeddings = fp;
q.Files = pp;
q.Images = Ap;
q.Audio = dr;
q.Moderations = Ep;
q.Models = Tp;
q.FineTuning = ln;
q.Graders = ea;
q.VectorStores = Bo;
q.Webhooks = Lp;
q.Beta = an;
q.Batches = tp;
q.Uploads = na;
q.Admin = Vs;
q.Responses = Oo;
q.Realtime = Fo;
q.Conversations = zs;
q.Evals = Xs;
q.Containers = Ws;
q.Skills = Go;
q.Videos = kp;
function PC(e) {
  if (MC(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function MC(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const r = t;
    if (r.code === "UND_ERR_INVALID_ARG" && typeof r.message == "string" && r.message.includes("invalid onRequestStart method")) return !0;
    t = r.cause;
  }
  return !1;
}
function mc(e = "", t = 0) {
  let n = 0;
  for (let r = t - 1; r >= 0 && e[r] === "\\"; r -= 1) n += 1;
  return n % 2 === 1;
}
function xC(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function NC(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function DC(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function kC(e = "") {
  const t = String(e ?? "");
  let n = "", r = 0;
  for (; r < t.length; ) {
    const o = t.slice(r, r + 2), i = t.slice(r + 2, r + 6);
    if (o !== "\\u" || mc(t, r) || !xC(i)) {
      n += t[r] || "", r += 1;
      continue;
    }
    const a = r + 6, u = t.slice(a + 2, a + 6);
    if (NC(i) && t.slice(a, a + 2) === "\\u" && !mc(t, a) && DC(u)) {
      const c = Number.parseInt(i, 16), d = Number.parseInt(u, 16), h = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(h), r += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(i, 16)), r += 6;
  }
  return n;
}
function $C(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), kC(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function LC(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function oa(e = "", t = "", n = 0) {
  const r = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${LC(t)}(?:\\\\?")?\\s*:`, "i"), o = String(e || "").slice(Math.max(0, n)).match(r);
  if (!o || o.index === void 0) return null;
  const i = o[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + o.index + i,
    end: Math.max(0, n) + o.index + o[0].length
  };
}
function UC(e = "", t = [], n = 0) {
  return t.map((r) => oa(e, r, n)).filter(Boolean).sort((r, o) => r.index - o.index)[0] || null;
}
function Ue(e = "", t = "", n = []) {
  const r = String(e || ""), o = oa(r, t);
  if (!o) return;
  let i = o.end;
  for (; /\s/.test(r[i] || ""); ) i += 1;
  r[i] === '"' && (i += 1);
  const a = UC(r, n.filter((d) => d !== t), i);
  let u = a ? a.index : r.length;
  if (a) {
    const d = r.lastIndexOf(",", a.index);
    d >= i && (u = d);
  }
  let c = r.slice(i, u).trim();
  return a || (c = c.replace(/\}\s*$/, "").trimEnd()), $C(c);
}
function Xe(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var qn = {
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
}, FC = [
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
function gc(e = "", t = [], n = []) {
  for (const r of t) {
    const o = Ue(e, r, n);
    if (o !== void 0) return o;
  }
}
function OC(e = "", t = "") {
  if (t === "Read") {
    const n = qn.Read, r = {};
    return n.forEach((o, i) => {
      const a = Ue(e, o, n.slice(i + 1));
      a !== void 0 && (r[o] = Xe(a));
    }), r.filePath === void 0 && r.path !== void 0 && (r.filePath = r.path, delete r.path), r.filePath === void 0 && r.scope !== void 0 && (r.filePath = r.scope, delete r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "Write") {
    const n = {}, r = gc(e, ["filePath", "path"], ["content"]), o = Ue(e, "content", []);
    return r !== void 0 && (n.filePath = Xe(r)), o !== void 0 && (n.content = Xe(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, r = gc(e, ["filePath", "path"], ["edits"]), o = Ue(e, "edits", []);
    return r !== void 0 && (n.filePath = Xe(r)), o !== void 0 && (n.edits = Xe(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = qn.Grep, r = {};
    return n.forEach((o) => {
      const i = Ue(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = Xe(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "MemoryGrep") {
    const n = qn.MemoryGrep, r = {};
    return n.forEach((o) => {
      const i = Ue(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = Xe(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  if (t === "ChatHistory") {
    const n = qn.ChatHistory, r = {};
    return n.forEach((o) => {
      const i = Ue(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = Xe(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  return null;
}
function GC(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const a = JSON.parse(n);
    if (a && typeof a == "object" && !Array.isArray(a)) return a;
  } catch {
  }
  const r = OC(n, t);
  if (r) return r;
  const o = qn[t] || FC, i = {};
  return o.forEach((a, u) => {
    const c = Ue(n, a, o.slice(u + 1));
    c !== void 0 && (i[a] = Xe(c));
  }), Object.keys(i).length ? i : null;
}
function BC(e = "", t = "") {
  const n = GC(e, t);
  return n ? JSON.stringify(n) : "";
}
function Fp(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Le(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function ge(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function z(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Op(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function Gp(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : Op(e);
  return BC(n, t) || JSON.stringify(Fp(n));
}
function qC(e = "") {
  const t = String(e || ""), n = oa(t, "arguments");
  if (!n) return "";
  let r = n.end;
  for (; /\s/.test(t[r] || ""); ) r += 1;
  const o = t[r] || "";
  return o === "{" ? t.slice(r).replace(/\}\s*$/, "").trimEnd() : o === '"' ? t.slice(r + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(r).replace(/\}\s*$/, "").trimEnd();
}
function HC(e = "", t = 0) {
  const n = String(e || "").trim(), r = Ue(n, "name", ["id", "arguments"]) || Ue(n, "toolName", ["id", "arguments"]) || "", o = Ue(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, i = qC(n);
  return !r || !i ? null : {
    id: o,
    name: r,
    arguments: Gp(i, r)
  };
}
function VC(e, t = 0, n = "openai-tool") {
  if (!z(e)) return null;
  const r = z(e.function) ? e.function : null, o = String(r?.name || "").trim();
  if (!o) return null;
  const i = ge(e) || {};
  return delete i.index, i.id = String(i.id || `${n}-${t + 1}`), i.type = "function", i.function = {
    ...ge(r) || {},
    name: o,
    arguments: Op(r.arguments)
  }, i;
}
function tr(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, r) => VC(n, r, t)).filter(Boolean);
}
function nr(e, t) {
  return Array.isArray(e) ? e.some((n) => nr(n, t)) : z(e) ? Object.entries(e).some(([n, r]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(r) : (Array.isArray(r) || z(r)) && nr(r, t)) : !1;
}
function JC(e) {
  return nr(e, (t) => typeof t == "string" && t.length > 0);
}
function os(e) {
  return nr(e, () => !0);
}
function KC(e) {
  return nr(e, (t) => typeof t != "string" || t.length === 0);
}
function WC(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => JC(t));
}
var _c = /* @__PURE__ */ new WeakSet();
function ia(e) {
  if (!z(e)) return null;
  const t = ge(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = It(Ct(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = tr(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function sa(e = [], t = "openai-tool") {
  return tr(e, t).map((n, r) => ({
    id: n.id || `${t}-${Date.now()}-${r + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function aa(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function Ct(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, r) => (Le(t, "思考块", r), "")).trim(),
    thoughts: t
  };
}
function It(e = "") {
  const t = String(e || ""), n = t.search(/<tool_call\b/i);
  return n < 0 ? t.trim() : t.slice(0, n).trim();
}
function is(e = "") {
  const t = String(e || "");
  return /<tool_call\b/i.test(t) ? [{
    id: "tagged-json-draft",
    name: t.match(/["']?name["']?\s*:\s*["']([^"']+)/i)?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }] : [];
}
function St(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      Le(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((r) => St(e, r, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && Le(e, n, t.text), typeof t.content == "string" && Le(e, n, t.content), typeof t.reasoning_content == "string" && Le(e, n, t.reasoning_content), typeof t.thinking == "string" && Le(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((r) => {
      if (typeof r == "string") {
        Le(e, "推理摘要", r);
        return;
      }
      r && typeof r == "object" && Le(e, "推理摘要", r.text || r.content || "");
    }));
  }
}
function ct(e = {}, t = {}) {
  const n = [];
  return St(n, e.reasoning_content, "推理文本"), St(n, e.reasoning, "推理文本"), St(n, e.reasoning_text, "推理文本"), St(n, e.thinking, "思考块"), St(n, t.reasoning_content, "推理文本"), St(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        Le(n, "推理文本", r.text);
        return;
      }
      if (r.type === "summary_text") {
        Le(n, "推理摘要", r.text);
        return;
      }
      (r.type === "thinking" || r.type === "reasoning" || r.type === "reasoning_content") && Le(n, "思考块", r.text || r.content || r.reasoning || "");
    }
  }), n;
}
function zn(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((r) => {
    [...e.matchAll(r)].forEach((o, i) => {
      try {
        const a = JSON.parse(o[1]);
        n.push({
          id: a.id || `tool-call-${i + 1}`,
          name: String(a.name || ""),
          arguments: Gp(a.arguments, a.name)
        });
      } catch {
        const a = HC(o[1], i);
        a && n.push(a);
      }
    });
  }), n.filter((r) => r.name);
}
function la(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : ia(t);
}
function zC(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function YC(e = {}) {
  const t = tr(e?.tool_calls);
  if (t.length) return t;
  const n = tr(la(e)?.tool_calls);
  return n.length ? n : [];
}
function XC(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function QC(e = "") {
  return /claude/i.test(String(e || ""));
}
function Bp(e = [], t = "") {
  if (!QC(t)) return e;
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
function yc(e, t = "") {
  return !z(e) || !XC(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var ss = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function ZC(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((r) => ge(r) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((r, o) => {
    const i = ge(r) || {}, a = Number.isInteger(Number(r?.index)) ? Number(r.index) : o, u = n[a];
    n[a] = z(u) ? fr(u, i, "tool_call") : i;
  }), n.filter((r) => r !== void 0);
}
function fr(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return ge(t);
  if (t === null && ss.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return ZC(e, t);
  if (typeof e == "string" && typeof t == "string")
    return ss.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : ge(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(ge(t) || []);
  if (z(e) && z(t)) {
    const r = { ...e };
    return Object.entries(t).forEach(([o, i]) => {
      r[o] = fr(r[o], i, o);
    }), r;
  }
  return ge(t);
}
function go(e = {}, t = {}) {
  const n = z(e) ? ge(e) || {} : {}, r = z(t) ? ge(t) || {} : {};
  return delete r.message, delete r.finish_reason, delete r.index, delete r.logprobs, delete r.delta, Object.entries(r).forEach(([o, i]) => {
    n[o] = fr(n[o], i, o);
  }), n.role || (n.role = "assistant"), ia(n) || { role: "assistant" };
}
function Yn(e, t = {}) {
  const n = ia(go(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function jC(e = {}, t = {}) {
  return z(e) ? z(t) ? fr(ge(e) || {}, t, "") : ge(e) : ge(t);
}
function as(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], r = zC(n), o = [];
  let i = !1;
  n.forEach((u, c) => {
    if (i) {
      if (u?.role === "tool") return;
      i = !1;
    }
    const d = u?.role === "assistant", h = d ? u?.providerPayload?.openaiCompatibleMessage : null, f = Hp(Array.isArray(h?.tool_calls) && h.tool_calls.some((E) => os(E)) ? h.tool_calls : d && Array.isArray(u?.tool_calls) && u.tool_calls.some((E) => os(E)) ? u.tool_calls : null);
    if (f) {
      const E = z(h) ? h : u;
      (!z(E) || !_c.has(E)) && (z(E) && _c.add(E), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: f.index,
        toolName: f.toolName,
        reason: f.reason
      })), i = !0;
      return;
    }
    const p = d ? tr(u?.tool_calls) : [], m = d ? la(u) : null, g = Array.isArray(m?.tool_calls) ? m.tool_calls : [], _ = g.length > 0 && WC(m);
    if (g.length && c > r) {
      o.push(yc({
        ...m,
        ...p.length && !_ ? { tool_calls: p } : {}
      }, t));
      return;
    }
    const y = {
      role: u.role,
      content: u.content
    };
    u.role === "tool" && u.tool_call_id && (y.tool_call_id = u.tool_call_id), _ ? y.tool_calls = g : p.length && (y.tool_calls = p), o.push(yc(y, t));
  });
  const a = String(e.systemPrompt || "").trim();
  return a && o[0]?.role !== "system" && o.unshift({
    role: "system",
    content: a
  }), Bp(o, t);
}
function vc(e) {
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
function ls(e, t = "") {
  const n = /* @__PURE__ */ new Map(), r = [];
  return (Array.isArray(e.messages) ? e.messages : []).forEach((o) => {
    if (o.role === "assistant") {
      const i = YC(o);
      if (i.length) {
        const a = la(o), u = typeof a?.content == "string" ? a.content : String(o.content || ""), c = i.map((d, h) => {
          const f = d.function?.name || "", p = d.id || `tool-call-${h + 1}`;
          return f && n.set(p, f), `<tool_call>${JSON.stringify({
            id: p,
            name: f,
            arguments: Fp(d.function?.arguments || "{}")
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
    content: vc(e)
  }) : r[0] = {
    ...r[0],
    content: vc({
      ...e,
      systemPrompt: r[0].content || e.systemPrompt
    })
  }, Bp(r, t);
}
function Ac(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function qp(e, t, n) {
  !e || !t || n === void 0 || (e[t] = fr(e[t], n, t));
}
function _o(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (z(n)) {
      const r = z(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([o, i]) => {
        _o(r, o, i);
      }), e[t] = r;
      return;
    }
    if (typeof n == "string" && ss.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || qp(e, t, n);
  }
}
function eI(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const r = Number(n?.index ?? 0), o = { ...e.tool_calls[r] || {} };
    Object.entries(n || {}).forEach(([i, a]) => {
      if (i !== "index" && !(i === "function" && a == null)) {
        if (i === "function" && z(a)) {
          o.function = z(o.function) ? { ...o.function } : {}, Object.entries(a).forEach(([u, c]) => {
            _o(o.function, u, c);
          });
          return;
        }
        _o(o, i, a);
      }
    }), e.tool_calls[r] = o;
  }));
}
function us(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([r, o]) => {
    r === "delta" || r === "finish_reason" || r === "index" || r === "logprobs" || qp(e, r, o);
  });
  const n = z(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([r, o]) => {
    if (r === "tool_calls") {
      eI(e, o);
      return;
    }
    _o(e, r, o);
  });
}
function zt(e = {}) {
  return aa(e?.content);
}
function Yt(e = {}) {
  return sa(e?.tool_calls || []);
}
function tI(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return z(JSON.parse(e));
  } catch {
    return !1;
  }
}
function Hp(e) {
  if (!Array.isArray(e) || !e.some((t) => os(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], r = z(n?.function) ? n.function : null, o = String(r?.name || "").trim();
    let i = "";
    if (!z(n) || !r ? i = "invalid_function_shape" : o ? tI(r.arguments) ? KC(n) && (i = "invalid_thought_signature") : i = "invalid_function_arguments" : i = "missing_function_name", i) return {
      index: t,
      toolName: o,
      reason: i
    };
  }
  return null;
}
function Xt(e = {}) {
  const t = Hp(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function nI(e, t) {
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
var rI = 600 * 1e3, Xn = /* @__PURE__ */ new Map();
function Vp(e = {}) {
  return `${String(e.baseUrl || "https://api.openai.com/v1").trim().replace(/\/+$/, "")}\0${String(e.model || "").trim()}`;
}
function Jp(e = {}) {
  const t = Vp(e), n = Xn.get(t);
  return Number.isFinite(n) ? n > Date.now() ? !0 : (Xn.delete(t), !1) : !1;
}
function Kp(e = {}) {
  const t = Date.now();
  Xn.forEach((n, r) => {
    (!Number.isFinite(n) || n <= t) && Xn.delete(r);
  }), Xn.set(Vp(e), t + rI);
}
function yo(e, t, n = /* @__PURE__ */ new Set()) {
  if (e != null) {
    if (typeof e == "string") {
      t.push(e);
      const r = e.trim();
      if (r.startsWith("{") && r.endsWith("}") || r.startsWith("[") && r.endsWith("]")) try {
        yo(JSON.parse(r), t, n);
      } catch {
      }
      return;
    }
    typeof e != "object" || n.has(e) || (n.add(e), Object.values(e).forEach((r) => {
      yo(r, t, n);
    }));
  }
}
function Wp(e) {
  const t = Number(e?.status ?? e?.response?.status ?? 0);
  if (t !== 400 && t !== 422) return !1;
  const n = [
    e?.message,
    e?.code,
    e?.param
  ].filter(Boolean);
  yo(e?.error, n), yo(e?.body, n);
  const r = n.join(" ").toLowerCase();
  if (!/reasoning[_ -]?effort/.test(r)) return !1;
  const o = String(e?.code || e?.error?.code || "").toLowerCase(), i = String(e?.param || e?.error?.param || "").toLowerCase();
  return /reasoning[_ -]?effort/.test(i) && /(unsupported_parameter|unknown_parameter|unrecognized_parameter|extra_forbidden)/.test(o) ? !0 : /(?:unsupported|unknown|unrecognized|unexpected|invalid)\s+(?:request\s+)?(?:parameter|field|argument)(?:\s+supplied)?\s*:?\s*['"]?reasoning[_ -]?effort/.test(r) || /(?:parameter|field|argument)\s*['"]?reasoning[_ -]?effort['"]?\s+(?:is\s+)?(?:not supported|not allowed|not permitted)/.test(r) || /reasoning[_ -]?effort['"]?\s+(?:is\s+)?(?:an?\s+)?(?:unsupported|unknown|unrecognized|unexpected)\s+(?:parameter|field|argument)/.test(r) || /reasoning[_ -]?effort[\s\S]*extra inputs?[\s\S]*(?:not permitted|forbidden)/.test(r) || /extra inputs?[\s\S]*(?:not permitted|forbidden)[\s\S]*reasoning[_ -]?effort/.test(r) || /unknown name\s*['"]?reasoning[_ -]?effort['"]?/.test(r) || /reasoning[_ -]?effort['"]?\s*:?\s*cannot find field/.test(r);
}
var oI = class {
  constructor(e) {
    this.config = e, this.client = new q({
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
      messages: t ? ls(e, this.config.model) : as(e, this.config.model),
      ...n ? {
        tools: n,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (r.temperature = e.temperature), e.reasoning?.enabled && !Jp(this.config) && (r.reasoning_effort = e.reasoning.effort), r;
  }
  async requestWithReasoningEffortFallback(e, t, n, r = {}) {
    try {
      return {
        result: await n(t),
        body: t
      };
    } catch (o) {
      if (e.signal?.aborted || typeof r.canRetry == "function" && !r.canRetry() || !Object.prototype.hasOwnProperty.call(t, "reasoning_effort") || !Wp(o)) throw o;
      Kp(this.config);
      const i = { ...t };
      return delete i.reasoning_effort, {
        result: await n(i),
        body: i
      };
    }
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = {
      ...t.body || this.buildRequestBody(e),
      ...n ? { stream: !0 } : {}
    }, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = !!e.reasoning?.enabled && !Object.prototype.hasOwnProperty.call(r, "reasoning_effort"), a = Object.prototype.hasOwnProperty.call(r, "reasoning_effort");
    return {
      ...jn({
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
        effectiveConfig: Mt(e, {
          enabled: a,
          effort: r.reasoning_effort,
          includeOutput: !1
        })
      }),
      ...i ? { degraded: ["reasoning_effort_unsupported"] } : {}
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
      const g = await o.text().catch(() => ""), _ = new Error(g || `openai_compatible_stream_http_${o.status}`);
      throw _.status = o.status, _;
    }
    typeof n.onResponseAccepted == "function" && n.onResponseAccepted();
    const i = { role: "assistant" };
    let a = "stop", u = this.config.model;
    await nI(o, (g) => {
      u = g?.model || u;
      const _ = g?.choices?.[0];
      us(i, _), _?.finish_reason && (a = _.finish_reason);
      const y = Ct(zt(i)), E = Yt(i), w = E.length ? E : is(y.cleaned);
      Ac(e, {
        text: E.length ? y.cleaned : It(y.cleaned),
        thoughts: ct(i, _).concat(y.thoughts),
        ...w.length ? { toolCalls: w } : {},
        ...!E.length && w.length ? { toolCallDraft: !0 } : {}
      });
    }), Xt(i);
    const c = Yn(i), d = Yt(i), h = Ct(zt(i)), f = ct(i, {});
    h.thoughts.forEach((g) => f.push(g));
    const p = d.length ? [] : zn(h.cleaned), m = [...d, ...p];
    return {
      text: d.length ? h.cleaned : It(h.cleaned),
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
    const i = async (y, E = {}) => {
      const w = await this.requestWithReasoningEffortFallback(e, r, y, E);
      return o = this.inspectRequest(e, { body: w.body }), w.result;
    };
    if (n) {
      if (!t) {
        let W = !1;
        return {
          ...await i((J) => this.streamNativeChatCompletions(e, J, { onResponseAccepted: () => {
            W = !0;
          } }), { canRetry: () => !W }),
          requestInspection: o
        };
      }
      const y = await i((W) => this.client.chat.completions.create({
        ...W,
        stream: !0
      }, { signal: e.signal })), E = { role: "assistant" };
      let w = "stop", b = this.config.model, P;
      for await (const W of y) {
        b = W.model || b;
        const J = W.choices?.[0];
        us(E, J), J?.finish_reason && (w = J.finish_reason);
        const K = Ct(zt(E)), fe = Yt(E), Je = fe.length ? fe : is(K.cleaned);
        Ac(e, {
          text: fe.length ? K.cleaned : It(K.cleaned),
          thoughts: ct(E, J).concat(K.thoughts),
          ...Je.length ? { toolCalls: Je } : {},
          ...!fe.length && Je.length ? { toolCallDraft: !0 } : {}
        });
      }
      const k = (typeof y.finalChatCompletion == "function" ? await y.finalChatCompletion() : null)?.choices?.[0] || null, S = k?.message || E;
      Xt(S);
      const L = jC(E, go(S, k || {}));
      Xt(L), P = Yn(L);
      const C = Yt(L), M = Ct(zt(L)), F = ct(L, k || {});
      M.thoughts.forEach((W) => F.push(W));
      const H = C.length ? [] : zn(M.cleaned), ae = [...C, ...H];
      return {
        text: C.length ? M.cleaned : It(M.cleaned),
        toolCalls: ae,
        thoughts: F,
        finishReason: w,
        model: b,
        provider: "openai-compatible",
        providerPayload: P,
        requestInspection: o
      };
    }
    const a = await i((y) => this.client.chat.completions.create(y, { signal: e.signal })), u = a.choices?.[0] || {}, c = u.message || {};
    Xt(c);
    const d = ct(c, u), h = sa(c.tool_calls || []), f = Ct(aa(c.content));
    f.thoughts.forEach((y) => d.push(y));
    const p = h.length ? [] : zn(f.cleaned), m = [...h, ...p], g = h.length ? f.cleaned : It(f.cleaned), _ = go(c, u);
    return {
      text: g,
      toolCalls: m,
      thoughts: d,
      finishReason: u.finish_reason || "stop",
      model: a.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: Yn(_),
      requestInspection: o
    };
  }
};
function zp(e, t) {
  return {
    type: "message",
    role: e,
    content: iI(t)
  };
}
function vo(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function iI(e) {
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
function Ao(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function Tc(e, t = [], n = {}) {
  (t || []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        Ao(e, n.reasoning || "推理文本", r.text);
        return;
      }
      r.type === "summary_text" && Ao(e, n.summary || "推理摘要", r.text);
    }
  });
}
function sI(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (Tc(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), Tc(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function aI(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function lI(e) {
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
function uI(e) {
  const t = e?.choices?.[0], n = t?.message?.content, r = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const o = n.toLowerCase();
  return !o.includes("proxy error") || !o.includes("/responses") && !r.toLowerCase().includes("proxy error") ? null : n.trim();
}
function cI(e) {
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
        n.content?.trim() && t.push(vo(n.content)), n.tool_calls.forEach((r, o) => {
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
        t.push(vo(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? zp(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function dI(e) {
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
      n.content?.trim() && t.push(vo(n.content)), n.tool_calls.forEach((r, o) => {
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
      t.push(vo(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? zp(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function fI(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function hI(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function pI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function ui(e, t) {
  const [n = "0", r = "0"] = String(e || "").split(":"), [o = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(o) || Number(r) - Number(i);
}
var mI = class {
  constructor(e) {
    this.config = e, this.client = new q({
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
      instructions: t ? void 0 : aI(e) || void 0,
      input: t ? dI(e) : cI(e),
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
    const n = typeof e.onStreamProgress == "function", r = t.legacySystemInInput === !0, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = t.body || this.buildRequestBody(e, r);
    return jn({
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
      effectiveConfig: Mt(e, {
        enabled: !!i.reasoning,
        effort: i.reasoning?.effort,
        includeOutput: !!i.reasoning?.summary
      })
    });
  }
  async chat(e) {
    let t = this.inspectRequest(e);
    const n = (c) => {
      const d = uI(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const h = Array.isArray(c.output) ? c.output : [];
      return {
        output: h,
        thoughts: e.reasoning?.includeOutput === !1 ? [] : sI(h),
        toolCalls: h.filter((f) => f.type === "function_call" && f.name).map((f, p) => ({
          id: f.call_id || `response-tool-${p + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: lI(c)
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
        e.reasoning?.includeOutput !== !1 && (Array.from(p.entries()).sort(([y], [E]) => ui(y, E)).forEach(([, y]) => Ao(_, "推理文本", y)), Array.from(m.entries()).sort(([y], [E]) => ui(y, E)).forEach(([, y]) => Ao(_, "推理摘要", y))), pI(e, {
          text: Array.from(f.entries()).sort(([y], [E]) => ui(y, E)).map(([, y]) => y).join(`
`).trim(),
          thoughts: _
        });
      };
      return h.on("response.output_text.delta", (_) => {
        const y = `${_.output_index}:${_.content_index}`;
        f.set(y, `${f.get(y) || ""}${_.delta}`), g();
      }), h.on("response.reasoning_text.delta", (_) => {
        const y = `${_.output_index}:${_.content_index}`;
        p.set(y, `${p.get(y) || ""}${_.delta}`), g();
      }), h.on("response.reasoning_summary_text.delta", (_) => {
        const y = `${_.output_index}:${_.summary_index}`;
        m.set(y, `${m.get(y) || ""}${_.delta}`), g();
      }), await h.finalResponse();
    }, i = !fI(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await o(!1) : await r(!1), u = n(a), i && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), u = n(a));
    } catch (c) {
      if (!i || !hI(c)) throw c;
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
async function gI(e, t) {
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
var ua = "openai", Yp = "claude", Xp = "makersuite", _I = "/api/backends/chat-completions/generate", yI = Object.freeze({
  [Yp]: "https://api.anthropic.com/v1",
  [Xp]: "https://generativelanguage.googleapis.com"
}), Qp = null;
function vI(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function AI(e, t) {
  const n = vI(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function _0(e) {
  Qp = typeof e == "function" ? e : null;
}
async function TI() {
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(Qp?.() || {}),
    Accept: "application/json"
  };
}
function EI(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : r;
  }), t;
}
async function hr(e = {}, t = !1) {
  const n = await TI(), r = {
    url: _I,
    method: "POST",
    headers: EI(n),
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
function SI(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function wI(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function CI() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function Ec(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function Sc(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => Ec(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => Ec(n));
}
function II(e = "") {
  const t = String(e || ""), n = Sc((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), r = Sc(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), o = n || r;
  return o.length > 240 ? `${o.slice(0, 237)}...` : o;
}
function bI(e = null) {
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
function RI(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function To(e = "", t = "", n = null) {
  if (wI(e)) return CI();
  const r = bI(n);
  if (SI(e) || /\btext\/html\b/i.test(r.contentType)) {
    const o = RI(r), i = II(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      o ? `（${o}）` : "",
      i ? `：${i}` : ""
    ].join("");
  }
  return String(e || t || "").trim();
}
function PI(e = {}, t = ua) {
  const n = AI(e.baseUrl, t), r = String(e.apiKey || "").trim(), o = yI[t] || "", i = n || (r ? o : ""), a = { chat_completion_source: t || "openai" };
  return i && (a.reverse_proxy = i), r && (a.proxy_password = r), a;
}
function MI(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function ca(e = {}, t = {}, n = [], r = !1, o = ua) {
  return MI({
    ...PI(e, o),
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
function xI(e = {}, t = {}, n = [], r = !1) {
  return ca(e, t, n, r, ua);
}
function NI(e = {}, t = {}, n = [], r = !1) {
  return ca(e, t, n, r, Yp);
}
function DI(e = {}, t = {}, n = [], r = !1) {
  return ca(e, t, n, r, Xp);
}
async function da(e = {}, t = {}) {
  const n = await hr(e, !1);
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
    const u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${To(o, String(a?.message || a), r)}`);
    throw u.status = r.status, u.body = o, u;
  }
  if (!r.ok || i?.error) {
    const a = To(i?.error?.message || i?.message || o, `HTTP ${r.status}`, r), u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${a}`);
    throw u.status = r.status, u.error = i?.error, u;
  }
  return i;
}
async function fa(e = {}, t, n = {}) {
  const r = await hr(e, !0);
  typeof n.onRequest == "function" && n.onRequest(r);
  const o = await fetch(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!o.ok) {
    const i = await o.text().catch(() => ""), a = new Error(To(i, `酒馆后端流式生成失败：HTTP ${o.status}`, o));
    throw a.status = o.status, a.body = i, a;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await gI(o, (i) => {
    if (i?.error) {
      const a = To(i.error?.message || i.message || JSON.stringify(i.error), "酒馆后端流式生成失败");
      throw new Error(a);
    }
    t(i);
  });
}
function xt(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function kI(e) {
  const t = String(e || "").trim();
  if (!t || t === "auto") return "auto";
  if (t === "required") return "any";
  if (t === "none") return "none";
  throw new Error(`酒馆托管 Claude 不支持 tool_choice：${t}。仅支持 auto/required/none。`);
}
var $I = /^claude-(3-7|opus-4|sonnet-4|haiku-4-5|opus-4-5|opus-4-6|sonnet-4-6|opus-4-7)/, LI = /^claude-opus-4-7/;
function UI(e = {}, t = {}) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const n = kI(t.toolChoice), r = String(e.model || "").trim(), o = $I.test(r) && !LI.test(r);
  return {
    toolChoice: n,
    reasoningDisabledForForcedTool: n === "any" && t.reasoning?.enabled === !0 && o
  };
}
var FI = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function OI(e = {}, t = {}) {
  const n = e.reasoning?.enabled === !0 && t.reasoningDisabledForForcedTool !== !0;
  return {
    toolChoice: String(t.toolChoice || ""),
    reasoningEnabled: n,
    reasoningEffort: n ? String(e.reasoning?.effort || "") : "",
    reasoningIncludeOutput: n && e.reasoning?.includeOutput !== !1
  };
}
function Zp(e = "") {
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
function GI(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const r = Zp(t.function.arguments || "{}");
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
function BI(e = []) {
  const t = Array.isArray(e) ? xt(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function qI(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const i = xt(o) || {}, a = BI(i?.providerPayload?.anthropicContent), u = GI(i.tool_calls);
    delete i.providerPayload, i.role === "assistant" && a && u.length ? (delete i.tool_calls, i.content = a.filter((c) => c?.type !== "tool_use").concat(u)) : i.role === "assistant" && a && (delete i.tool_calls, i.content = a), n.push(i);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function HI(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const r = Zp(t.inputJson);
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
      const n = xt(t.input);
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
    } : xt(t) || null;
  }).filter(Boolean);
}
function VI(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: xt(t.input) || {}
  } : xt(t) || null).filter(Boolean);
}
function JI(e = []) {
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
function jp(e = [], t = {}) {
  const n = HI(e), r = n.filter((o) => o.type === "tool_use" && o.name).map((o, i) => ({
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
    providerPayload: n.length ? { anthropicContent: VI(n) } : void 0
  };
}
function KI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function WI(e, t = {}) {
  const n = [];
  let r = "stop", o = t.model || "";
  const i = (u, c = {}) => {
    const d = Number.isInteger(Number(u)) ? Number(u) : n.length;
    return n[d] ? n[d] = {
      ...n[d],
      ...c
    } : n[d] = { ...c }, n[d];
  }, a = () => {
    const u = JI(n);
    KI(e, {
      text: u.text,
      thoughts: e.reasoning?.includeOutput === !1 ? [] : u.thoughts,
      ...Array.isArray(u.toolCalls) ? { toolCalls: u.toolCalls } : {},
      ...u.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(u = {}) {
      if (u?.message?.model && (o = u.message.model), u.type === "content_block_start") {
        i(u.index, xt(u.content_block) || {}), a();
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
      return jp(n, {
        finishReason: r,
        model: o,
        includeReasoningOutput: e.reasoning?.includeOutput !== !1
      });
    }
  };
}
var zI = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return qI(e);
  }
  resolveToolProtocol(e) {
    return UI(this.config, e);
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
    return NI(this.config, o, r, n);
  }
  async inspectRequest(e, t = {}) {
    const n = this.resolveToolProtocol(e), r = await hr(t.payload || this.buildPayload(e, n), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(r, n, e);
  }
  buildRequestInspection(e, t = {}, n = {}) {
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: en(e),
      effectiveConfig: OI(n, t),
      ...t.reasoningDisabledForForcedTool ? { notices: [FI] } : {}
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
        const u = WI(e, this.config);
        return await fa(r, (c) => {
          u.accept(c);
        }, {
          signal: e.signal,
          onRequest: i
        }), {
          ...u.result(),
          requestInspection: o
        };
      }
      const a = await da(r, {
        signal: e.signal,
        onRequest: i
      });
      return {
        ...jp(Array.isArray(a?.content) ? a.content : [{
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
function ha(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function tn(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = ha(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function YI(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((o) => tn(o)).filter((o) => Array.isArray(o.parts) && o.parts.length);
  const n = e?.providerPayload?.googleContent, r = tn(n);
  return r.parts.length ? [r] : [];
}
function XI(e = {}) {
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
function QI(e = {}, t = 0) {
  const n = tn(e);
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
    const u = XI(a.inlineData);
    u && r.content.push(u);
  }), i.length && r.content.push({
    type: "tool_calls",
    tool_calls: i
  }), o && r.content.some((a) => a?.type === "text") && (r.signature = o), r.content.length ? r : null;
}
function ZI(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const i = YI(o);
    if (o.role === "assistant" && i.length) {
      i.forEach((u, c) => {
        const d = QI(u, c);
        d && n.push(d);
      });
      return;
    }
    const a = ha(o) || {};
    delete a.providerPayload, n.push(a);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function em(e = {}) {
  return tn(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function tm(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function nm(e = {}) {
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
function jI(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
function e0(e = [], t = []) {
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
function om(e) {
  const t = tn(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function t0(e = {}, t = {}) {
  const n = em(e), r = e?.choices?.[0]?.message?.content || "";
  return {
    text: tm(n) || r,
    toolCalls: rm(n),
    thoughts: t.includeReasoningOutput === !1 ? [] : nm(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: om(n)
  };
}
function n0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function r0(e, t = {}) {
  let n = "", r = [], o = [], i = "STOP", a = t.model || "";
  const u = [];
  return {
    accept(c = {}) {
      a = c.model || c.modelVersion || a, i = c?.candidates?.[0]?.finishReason || i;
      const d = em(c);
      d.parts.length && u.push(...ha(d.parts) || []), n = jI(n, tm(d)), r = e0(r, rm(d));
      const h = e.reasoning?.includeOutput === !1 ? [] : nm(d);
      h.length && (o = h), n0(e, {
        text: n,
        thoughts: o,
        ...r.length ? {
          toolCalls: r,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const c = tn({
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
        providerPayload: om(c)
      };
    }
  };
}
var o0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return ZI(e);
  }
  buildPayload(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildMessages(e);
    return DI(this.config, e, n, t);
  }
  async inspectRequest(e, t = {}) {
    const n = await hr(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = Object.prototype.hasOwnProperty.call(e?.body || {}, "reasoning_effort");
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: en(e),
      effectiveConfig: Mt(t, {
        enabled: n,
        effort: e?.body?.reasoning_effort,
        includeOutput: e?.body?.include_reasoning === !0
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
        const i = r0(e, this.config);
        return await fa(n, (a) => {
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
        ...t0(await da(n, {
          signal: e.signal,
          onRequest: o
        }), {
          model: this.config.model,
          includeReasoningOutput: e.reasoning?.includeOutput !== !1
        }),
        requestInspection: r
      };
    } catch (i) {
      throw r && i && typeof i == "object" && (i.requestInspection = r), i;
    }
  }
};
function i0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function ci(e, t = []) {
  const n = Ct(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : It(n.cleaned)
  };
}
function s0(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var a0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? ls(e, this.config.model) : as(e, this.config.model);
  }
  buildPayload(e, t = !1) {
    const n = t ? ls(e, this.config.model) : as(e, this.config.model), r = xI(this.config, t ? {
      ...e,
      tools: void 0,
      toolChoice: void 0
    } : e, n, typeof e.onStreamProgress == "function");
    return e.reasoning?.enabled && Jp(this.config) && delete r.reasoning_effort, r;
  }
  async inspectRequest(e, t = {}) {
    const n = await hr(t.payload || this.buildPayload(e, !!t.taggedMode), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = !!t.reasoning?.enabled && !Object.prototype.hasOwnProperty.call(e?.body || {}, "reasoning_effort"), r = Object.prototype.hasOwnProperty.call(e?.body || {}, "reasoning_effort");
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: en(e),
      effectiveConfig: Mt(t, {
        enabled: r,
        effort: e?.body?.reasoning_effort,
        includeOutput: !1
      }),
      ...n ? { degraded: ["reasoning_effort_unsupported"] } : {}
    };
  }
  async streamChat(e, t, n = {}) {
    const r = { role: "assistant" };
    let o = "stop", i = this.config.model;
    await fa(t, (f) => {
      i = f?.model || i;
      const p = f?.choices?.[0] || {};
      us(r, p), p.finish_reason && (o = p.finish_reason);
      const m = Yt(r), { thinkTagged: g, cleanedText: _ } = ci(zt(r), m), y = m.length ? m : is(g.cleaned);
      i0(e, {
        text: _,
        thoughts: ct(r, p).concat(g.thoughts),
        ...y.length ? { toolCalls: y } : {},
        ...!m.length && y.length ? { toolCallDraft: !0 } : {}
      });
    }, {
      signal: e.signal,
      onRequest: n.onRequest,
      onResponseAccepted: n.onResponseAccepted
    }), Xt(r);
    const a = Yt(r), { thinkTagged: u, cleanedText: c } = ci(zt(r), a), d = ct(r, {});
    u.thoughts.forEach((f) => d.push(f));
    const h = a.length ? [] : zn(u.cleaned);
    return {
      text: c,
      toolCalls: [...a, ...h],
      thoughts: d,
      finishReason: o,
      model: i,
      provider: "sillytavern-openai-compatible",
      providerPayload: Yn(r)
    };
  }
  async nonStreamingChat(e, t, n = {}) {
    const r = await da(t, {
      signal: e.signal,
      onRequest: n.onRequest
    }), o = r.choices?.[0] || {}, i = o.message || {};
    Xt(i);
    const a = ct(i, o), u = sa(i.tool_calls || []), { thinkTagged: c, cleanedText: d } = ci(aa(i.content), u);
    c.thoughts.forEach((p) => a.push(p));
    const h = u.length ? [] : zn(c.cleaned), f = go(i, o);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: a,
      finishReason: o.finish_reason || "stop",
      model: r.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: Yn(f)
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
        if (e.signal?.aborted || u || !Object.prototype.hasOwnProperty.call(a, "reasoning_effort") || !Wp(c)) throw c;
        Kp(this.config);
        const d = { ...a };
        return delete d.reasoning_effort, await r(d);
      }
    }, i = this.buildPayload(e, t);
    try {
      return await o(i);
    } catch (a) {
      if (e.allowToolProtocolFallback === !1 || t || !n || !s0(a)) throw a;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await o(this.buildPayload(e, !0));
  }
};
function y0(e = {}, t = {}) {
  if (!e.apiKey && !Am(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (e.provider) {
    case "sillytavern-openai-compatible":
      return new a0(e);
    case "sillytavern-claude":
      return new zI(e);
    case "sillytavern-google":
      return new o0(e);
    case "openai-responses":
      return new mI(e);
    case "anthropic":
      return new Tg(e);
    case "google":
      return new vw(e);
    default:
      return new oI(e);
  }
}
export {
  f0 as AGENT_REQUEST_TIMEOUT_MS,
  vm as PROVIDER_OPTIONS,
  y0 as createAgentAdapter,
  p0 as getProviderLabel,
  m0 as getToolModeLabel,
  Am as isSillyTavernProvider,
  ym as normalizeAgentConfig,
  d0 as normalizeAgentSettings,
  en as redactRequestSecrets,
  g0 as resolveActiveProviderConfig,
  _0 as setHostChatCompletionsRequestHeadersProvider
};
