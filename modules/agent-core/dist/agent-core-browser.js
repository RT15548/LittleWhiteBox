var em = Object.create, Sc = Object.defineProperty, tm = Object.getOwnPropertyDescriptor, nm = Object.getOwnPropertyNames, rm = Object.getPrototypeOf, om = Object.prototype.hasOwnProperty, To = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), im = (e, t, n, r) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var o = nm(t), i = 0, a = o.length, u; i < a; i++)
      u = o[i], !om.call(e, u) && u !== n && Sc(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(r = tm(t, u)) || r.enumerable
      });
  return e;
}, sm = (e, t, n) => (n = e != null ? em(rm(e)) : {}, im(t || !e || !e.__esModule ? Sc(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), am = "https://api.tavily.com";
function ci(e = "") {
  return String(e || "").trim();
}
function Bn(e = "") {
  return String(e || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var Ec = "openai-compatible", us = "默认", wc = "default", lm = "deny", Qe = 32e3, n0 = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), r0 = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), di = {
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
function qt() {
  return JSON.parse(JSON.stringify(di));
}
function ht() {
  return {
    provider: Ec,
    modelConfigs: qt(),
    permissionMode: wc
  };
}
function Cc(e = ht()) {
  const t = e && typeof e == "object" ? e : ht();
  return {
    provider: ds(t.provider),
    modelConfigs: cs(t.modelConfigs || {})
  };
}
function Ic(e) {
  return e === "full" ? "full" : wc;
}
function bc(e) {
  return e === "allow" ? "allow" : lm;
}
function fi(e, t = Qe) {
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
function cs(e = {}) {
  const t = qt();
  return Object.keys(di).forEach((n) => {
    const r = e && typeof e[n] == "object" ? e[n] : {};
    t[n] = {
      ...di[n],
      ...r,
      maxTokens: fi(r.maxTokens)
    };
  }), t;
}
function ds(e) {
  return typeof e == "string" && e.trim() ? e : Ec;
}
function fs(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function Rc(e = {}, t) {
  const n = {}, r = fs(e, t);
  return Object.entries(r).forEach(([o, i]) => {
    if (!i || typeof i != "object") return;
    const a = je(o);
    n[a] = {
      provider: ds(i.provider),
      modelConfigs: cs(i.modelConfigs || {}),
      permissionMode: Ic(i.permissionMode)
    };
  }), Object.keys(n).length || (n[us] = ht()), n;
}
function Pc(e, t) {
  const n = je(t);
  return e[n] ? n : Object.keys(e)[0];
}
function Mc(e, t, n) {
  const r = je(t || n);
  return e[r] ? r : e[n] ? n : Object.keys(e)[0];
}
function hs(e = {}, t = ht()) {
  const n = Cc(t), r = e && typeof e == "object" ? e : {};
  return {
    provider: ds(r.provider || n.provider),
    modelConfigs: cs(r.modelConfigs || n.modelConfigs)
  };
}
function xc(e = {}, t = {}, n = us, r = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (r !== n) return !0;
  const o = e?.delegateConfig;
  if (!o || typeof o != "object" || Array.isArray(o) || !(typeof o.provider == "string" && o.provider.trim() || o.modelConfigs && typeof o.modelConfigs == "object" && Object.keys(o.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const i = t[n] || ht(), a = Cc(i), u = hs(o, i);
  return JSON.stringify(u) !== JSON.stringify(a);
}
function um(e = {}, t, n, r, o) {
  const i = o(e?.[r]);
  if (i) return i;
  const a = fs(e, t), u = [
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
function cm(e = {}, t, n) {
  const r = (u) => String(u || "").trim();
  if (r(e?.tavilyBaseUrl)) return Bn(e.tavilyBaseUrl);
  const o = fs(e, t), i = [
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
    if (r(c)) return Bn(c);
  }
  return r(e?.delegateConfig?.tavilyBaseUrl) ? Bn(e.delegateConfig.tavilyBaseUrl) : am;
}
function Nc(e = {}, t, n) {
  return {
    tavilyApiKey: um(e, t, n, "tavilyApiKey", ci),
    tavilyBaseUrl: cm(e, t, n)
  };
}
function o0(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: r = (p) => String(p || "") } = t, o = je(e.currentPresetName || e.presetName || "默认"), i = Rc(e, o), a = Pc(i, e.currentPresetName), u = Mc(i, e.delegatePresetName, a), c = i[u] || i[a] || ht(), d = hs(e.delegateConfig, c), h = xc(e, i, a, u), f = Nc(e, o, a);
  return {
    enabled: !!e.enabled,
    workspaceFileName: r(e.workspaceFileName || n),
    jsApiPermission: bc(e.jsApiPermission),
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
function dm(e = {}) {
  const t = je(e.currentPresetName || e.presetDraftName || "默认"), n = Rc(e, t), r = Pc(n, e.currentPresetName), o = Mc(n, e.delegatePresetName, r), i = n[r] || ht(), a = n[o] || i, u = hs(e.delegateConfig, a), c = xc(e, n, r, o), d = Nc(e, t, r);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    jsApiPermission: bc(e.jsApiPermission),
    currentPresetName: r,
    delegatePresetName: o,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: je(e.presetDraftName || r),
    presetNames: Object.keys(n),
    presets: n,
    provider: i.provider,
    modelConfigs: i.modelConfigs,
    permissionMode: Ic(i.permissionMode),
    tavilyApiKey: d.tavilyApiKey,
    tavilyBaseUrl: d.tavilyBaseUrl
  };
}
var i0 = 900 * 1e3, s0 = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), fm = Object.freeze([
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
]), hm = Object.freeze([
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
function pm(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function fa(e = "") {
  return fm.some((t) => t.value === e) ? e : "medium";
}
function Dc(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, r = Number(n);
  return Number.isFinite(r) ? Math.max(0, Math.min(2, r)) : Dc(t, 1);
}
function hi(e = {}) {
  return e.sendTemperature !== !1;
}
function ha(e = {}) {
  return hi(e) ? Dc(e.temperature, 1) : void 0;
}
function a0(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : hm.find((n) => n.value === e)?.label || e || "未配置";
}
function l0(e = {}) {
  const t = String(e.provider || "").trim();
  return t === "openai-compatible" || t === "sillytavern-openai-compatible" ? e.toolMode === "tagged-json" ? "Tagged JSON 兼容模式" : "原生 Tool Calling" : "Provider 原生工具";
}
function u0(e = {}, t = {}) {
  const n = dm(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const c = n.delegateConfig.provider || "openai-compatible", d = (n.delegateConfig.modelConfigs || qt())[c] || qt()[c] || {};
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: c,
      baseUrl: String(d.baseUrl || ""),
      model: String(d.model || ""),
      apiKey: String(d.apiKey || ""),
      tavilyApiKey: ci(n.tavilyApiKey),
      tavilyBaseUrl: Bn(n.tavilyBaseUrl),
      temperature: ha(d),
      sendTemperature: hi(d),
      maxTokens: fi(d.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: d.toolMode || "native",
      reasoningEnabled: !!d.reasoningEnabled,
      reasoningEffort: fa(d.reasoningEffort)
    };
  }
  const r = je(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), o = n.presets?.[r] ? r : n.presets?.[n.currentPresetName] ? n.currentPresetName : us, i = n.presets?.[o] || ht(), a = i.provider || n.provider || "openai-compatible", u = (i.modelConfigs || n.modelConfigs || qt())[a] || qt()[a] || {};
  return {
    currentPresetName: String(o || ""),
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    tavilyApiKey: ci(n.tavilyApiKey),
    tavilyBaseUrl: Bn(n.tavilyBaseUrl),
    temperature: ha(u),
    sendTemperature: hi(u),
    maxTokens: fi(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoningEnabled: !!u.reasoningEnabled,
    reasoningEffort: fa(u.reasoningEffort)
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
var kc = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return kc = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function Xn(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var pi = (e) => {
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
}, O = class extends Error {
}, we = class mi extends O {
  constructor(t, n, r, o, i) {
    super(`${mi.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new So({
      message: r,
      cause: pi(n)
    });
    const i = n, a = i?.error?.type;
    return t === 400 ? new Lc(t, i, r, o, a) : t === 401 ? new Uc(t, i, r, o, a) : t === 403 ? new Fc(t, i, r, o, a) : t === 404 ? new Gc(t, i, r, o, a) : t === 409 ? new Oc(t, i, r, o, a) : t === 422 ? new Bc(t, i, r, o, a) : t === 429 ? new qc(t, i, r, o, a) : t >= 500 ? new Hc(t, i, r, o, a) : new mi(t, i, r, o, a);
  }
}, Fe = class extends we {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, So = class extends we {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, $c = class extends So {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Lc = class extends we {
}, Uc = class extends we {
}, Fc = class extends we {
}, Gc = class extends we {
}, Oc = class extends we {
}, Bc = class extends we {
}, qc = class extends we {
}, Hc = class extends we {
}, mm = /^[a-z][a-z0-9+.-]*:/i, gm = (e) => mm.test(e), gi = (e) => (gi = Array.isArray, gi(e)), pa = gi;
function _i(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function ma(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function _m(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var ym = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new O(`${e} must be an integer`);
  if (t < 0) throw new O(`${e} must be a positive integer`);
  return t;
}, Vc = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, vm = (e) => new Promise((t) => setTimeout(t, e)), Ut = "0.91.1", Am = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Tm() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Sm = () => {
  const e = Tm();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ut,
    "X-Stainless-OS": _a(Deno.build.os),
    "X-Stainless-Arch": ga(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ut,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ut,
    "X-Stainless-OS": _a(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": ga(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Em();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ut,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ut,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Em() {
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
var ga = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", _a = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), ya, wm = () => ya ?? (ya = Sm());
function Cm() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Jc(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Kc(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Jc({
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
function ps(e) {
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
async function Im(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var bm = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Rm(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new O(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function Pm(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var va;
function ms(e) {
  let t;
  return (va ?? (t = new globalThis.TextEncoder(), va = t.encode.bind(t)))(e);
}
var Aa;
function Ta(e) {
  let t;
  return (Aa ?? (t = new globalThis.TextDecoder(), Aa = t.decode.bind(t)))(e);
}
var ve, Ae, nr = class {
  constructor() {
    ve.set(this, void 0), Ae.set(this, void 0), N(this, ve, new Uint8Array(), "f"), N(this, Ae, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ms(e) : e;
    N(this, ve, Pm([A(this, ve, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = Mm(A(this, ve, "f"), A(this, Ae, "f"))) != null; ) {
      if (r.carriage && A(this, Ae, "f") == null) {
        N(this, Ae, r.index, "f");
        continue;
      }
      if (A(this, Ae, "f") != null && (r.index !== A(this, Ae, "f") + 1 || r.carriage)) {
        n.push(Ta(A(this, ve, "f").subarray(0, A(this, Ae, "f") - 1))), N(this, ve, A(this, ve, "f").subarray(A(this, Ae, "f")), "f"), N(this, Ae, null, "f");
        continue;
      }
      const o = A(this, Ae, "f") !== null ? r.preceding - 1 : r.preceding, i = Ta(A(this, ve, "f").subarray(0, o));
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
nr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
nr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Mm(e, t) {
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
function xm(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var eo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Sa = (e, t, n) => {
  if (e) {
    if (_m(eo, e)) return e;
    ce(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(eo))}`);
  }
};
function Cn() {
}
function hr(e, t, n) {
  return !t || eo[e] > eo[n] ? Cn : t[e].bind(t);
}
var Nm = {
  error: Cn,
  warn: Cn,
  info: Cn,
  debug: Cn
}, Ea = /* @__PURE__ */ new WeakMap();
function ce(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Nm;
  const r = Ea.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: hr("error", t, n),
    warn: hr("warn", t, n),
    info: hr("info", t, n),
    debug: hr("debug", t, n)
  };
  return Ea.set(t, [n, o]), o;
}
var At = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), an, Qn = class In {
  constructor(t, n, r) {
    this.iterator = t, an.set(this, void 0), this.controller = n, N(this, an, r, "f");
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const i = r ? ce(r) : console;
    async function* a() {
      if (o) throw new O("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of Dm(t, n)) {
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
            const d = Vc(c.data) ?? c.data, h = d?.error?.type;
            throw new we(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (Xn(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new In(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* i() {
      const u = new nr(), c = ps(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (o) throw new O("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      o = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Xn(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new In(a, n, r);
  }
  [(an = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new In(() => o(t), this.controller, A(this, an, "f")), new In(() => o(n), this.controller, A(this, an, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Jc({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = ms(JSON.stringify(o) + `
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
async function* Dm(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new O("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new O("Attempted to iterate over a response with no body");
  const n = new $m(), r = new nr(), o = ps(e.body);
  for await (const i of km(o)) for (const a of r.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of r.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* km(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? ms(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let i;
    for (; (i = xm(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var $m = class {
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
    let [t, n, r] = Lm(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function Lm(e, t) {
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
async function Wc(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return ce(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : Qn.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : zc(await n.json(), n) : await n.text();
  })();
  return ce(e).debug(`[${r}] response parsed`, At({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function zc(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var bn, Yc = class Xc extends Promise {
  constructor(t, n, r = Wc) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, bn.set(this, void 0), N(this, bn, t, "f");
  }
  _thenUnwrap(t) {
    return new Xc(A(this, bn, "f"), this.responsePromise, async (n, r) => zc(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(A(this, bn, "f"), t))), this.parsedPromise;
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
bn = /* @__PURE__ */ new WeakMap();
var pr, Qc = class {
  constructor(e, t, n, r) {
    pr.set(this, void 0), N(this, pr, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new O("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await A(this, pr, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(pr = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Um = class extends Yc {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await Wc(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, rr = class extends Qc {
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
          ..._i(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ..._i(this.options.query),
        after_id: e
      }
    } : null;
  }
}, _e = class extends Qc {
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
        ..._i(this.options.query),
        page: e
      }
    } : null;
  }
}, Zc = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Yt(e, t, n) {
  return Zc(), new File(e, t ?? "unknown_file", n);
}
function Or(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var jc = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", gs = async (e, t, n = !0) => ({
  ...e,
  body: await Gm(e.body, t, n)
}), wa = /* @__PURE__ */ new WeakMap();
function Fm(e) {
  const t = typeof e == "function" ? e : e.fetch, n = wa.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new o(i).text();
    } catch {
      return !0;
    }
  })();
  return wa.set(t, r), r;
}
var Gm = async (e, t, n = !0) => {
  if (!await Fm(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, i]) => yi(r, o, i, n))), r;
}, Om = (e) => e instanceof Blob && "name" in e, yi = async (e, t, n, r) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let o = {};
      const i = n.headers.get("Content-Type");
      i && (o = { type: i }), e.append(t, Yt([await n.blob()], Or(n, r), o));
    } else if (jc(n)) e.append(t, Yt([await new Response(Kc(n)).blob()], Or(n, r)));
    else if (Om(n)) e.append(t, Yt([n], Or(n, r), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => yi(e, t + "[]", o, r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, i]) => yi(e, `${t}[${o}]`, i, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, ed = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Bm = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && ed(e), qm = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Hm(e, t, n) {
  if (Zc(), e = await e, t || (t = Or(e, !0)), Bm(e))
    return e instanceof File && t == null && n == null ? e : Yt([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (qm(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Yt(await vi(o), t, n);
  }
  const r = await vi(e);
  if (!n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return Yt(r, t, n);
}
async function vi(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (ed(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (jc(e)) for await (const n of e) t.push(...await vi(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Vm(e)}`);
  }
  return t;
}
function Vm(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var X = class {
  constructor(e) {
    this._client = e;
  }
}, td = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Jm(e) {
  if (!e) return;
  if (td in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : pa(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = pa(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var I = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of Jm(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [td]: !0,
    values: t,
    nulls: n
  };
};
function nd(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Ca = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Km = (e = nd) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let g = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Ca) ?? Ca)?.toString) && (g = m + "", i.push({
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
    throw new O(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}, $ = /* @__PURE__ */ Km(nd), rd = class extends X {
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
}, qn = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function Br(e) {
  return typeof e == "object" && e !== null && qn in e;
}
function od(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const r of e) Br(r) && n.add(r[qn]);
  if (t) {
    for (const r of t)
      if (Br(r) && n.add(r[qn]), Array.isArray(r.content))
        for (const o of r.content) Br(o) && n.add(o[qn]);
  }
  return Array.from(n);
}
function id(e, t) {
  const n = od(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function Wm(e) {
  return Br(e) ? { "x-stainless-helper": e[qn] } : {};
}
var sd = class extends X {
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", rr, {
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
    return this._client.post("/v1/files?beta=true", gs({
      body: r,
      ...t,
      headers: I([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        Wm(r.file),
        t?.headers
      ])
    }, this._client));
  }
}, ad = class extends X {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/models/${e}?beta=true`, {
      ...n,
      headers: I([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", rr, {
      query: r,
      ...t,
      headers: I([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, ld = class extends X {
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
}, ud = class extends X {
  list(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.getAPIList($`/v1/agents/${e}/versions?beta=true`, _e, {
      query: o,
      ...n,
      headers: I([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, _s = class extends X {
  constructor() {
    super(...arguments), this.versions = new ud(this._client);
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
_s.Versions = ud;
var cd = class extends X {
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
}, dd = class extends X {
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
}, Eo = class extends X {
  constructor() {
    super(...arguments), this.memories = new cd(this._client), this.memoryVersions = new dd(this._client);
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
Eo.Memories = cd;
Eo.MemoryVersions = dd;
var fd = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function hd(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function Ia(e, t, n) {
  const r = hd(t);
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
  } : pd(e, t, n);
}
function pd(e, t, n) {
  let r = null;
  const o = e.content.map((i) => {
    if (i.type === "text") {
      const a = zm(t, i.text);
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
function zm(e, t) {
  const n = hd(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new O(`Failed to parse structured output: ${r}`);
  }
}
var Ym = (e) => {
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
}, Ft = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Ft(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Ft(e);
    case "string":
      let r = e[e.length - 2];
      if (r?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Ft(e);
      if (r?.type === "brace" && r.value === "{")
        return e = e.slice(0, e.length - 1), Ft(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Ft(e);
  }
  return e;
}, Xm = (e) => {
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
}, Qm = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, md = (e) => JSON.parse(Qm(Xm(Ft(Ym(e))))), be, ot, Nt, ln, mr, un, cn, gr, dn, Ke, fn, _r, yr, _t, vr, Ar, hn, qo, ba, Tr, Ho, Vo, Jo, Ra, Pa = "__json_buf";
function Ma(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Zm = class Ai {
  constructor(t, n) {
    be.add(this), this.messages = [], this.receivedMessages = [], ot.set(this, void 0), Nt.set(this, null), this.controller = new AbortController(), ln.set(this, void 0), mr.set(this, () => {
    }), un.set(this, () => {
    }), cn.set(this, void 0), gr.set(this, () => {
    }), dn.set(this, () => {
    }), Ke.set(this, {}), fn.set(this, !1), _r.set(this, !1), yr.set(this, !1), _t.set(this, !1), vr.set(this, void 0), Ar.set(this, void 0), hn.set(this, void 0), Tr.set(this, (r) => {
      if (N(this, _r, !0, "f"), Xn(r) && (r = new Fe()), r instanceof Fe)
        return N(this, yr, !0, "f"), this._emit("abort", r);
      if (r instanceof O) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new O(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new O(String(r)));
    }), N(this, ln, new Promise((r, o) => {
      N(this, mr, r, "f"), N(this, un, o, "f");
    }), "f"), N(this, cn, new Promise((r, o) => {
      N(this, gr, r, "f"), N(this, dn, o, "f");
    }), "f"), A(this, ln, "f").catch(() => {
    }), A(this, cn, "f").catch(() => {
    }), N(this, Nt, t, "f"), N(this, hn, n?.logger ?? console, "f");
  }
  get response() {
    return A(this, vr, "f");
  }
  get request_id() {
    return A(this, Ar, "f");
  }
  async withResponse() {
    N(this, _t, !0, "f");
    const t = await A(this, ln, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Ai(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, r, { logger: o } = {}) {
    const i = new Ai(n, { logger: o });
    for (const a of n.messages) i._addMessageParam(a);
    return N(i, Nt, {
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
    }, A(this, Tr, "f"));
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
      A(this, be, "m", Ho).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) A(this, be, "m", Vo).call(this, c);
      if (u.controller.signal?.aborted) throw new Fe();
      A(this, be, "m", Jo).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (N(this, vr, t, "f"), N(this, Ar, t?.headers.get("request-id"), "f"), A(this, mr, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return A(this, fn, "f");
  }
  get errored() {
    return A(this, _r, "f");
  }
  get aborted() {
    return A(this, yr, "f");
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
    N(this, _t, !0, "f"), await A(this, cn, "f");
  }
  get currentMessage() {
    return A(this, ot, "f");
  }
  async finalMessage() {
    return await this.done(), A(this, be, "m", qo).call(this);
  }
  async finalText() {
    return await this.done(), A(this, be, "m", ba).call(this);
  }
  _emit(t, ...n) {
    if (A(this, fn, "f")) return;
    t === "end" && (N(this, fn, !0, "f"), A(this, gr, "f").call(this));
    const r = A(this, Ke, "f")[t];
    if (r && (A(this, Ke, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !A(this, _t, "f") && !r?.length && Promise.reject(o), A(this, un, "f").call(this, o), A(this, dn, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !A(this, _t, "f") && !r?.length && Promise.reject(o), A(this, un, "f").call(this, o), A(this, dn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", A(this, be, "m", qo).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      A(this, be, "m", Ho).call(this), this._connected(null);
      const i = Qn.fromReadableStream(t, this.controller);
      for await (const a of i) A(this, be, "m", Vo).call(this, a);
      if (i.controller.signal?.aborted) throw new Fe();
      A(this, be, "m", Jo).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(ot = /* @__PURE__ */ new WeakMap(), Nt = /* @__PURE__ */ new WeakMap(), ln = /* @__PURE__ */ new WeakMap(), mr = /* @__PURE__ */ new WeakMap(), un = /* @__PURE__ */ new WeakMap(), cn = /* @__PURE__ */ new WeakMap(), gr = /* @__PURE__ */ new WeakMap(), dn = /* @__PURE__ */ new WeakMap(), Ke = /* @__PURE__ */ new WeakMap(), fn = /* @__PURE__ */ new WeakMap(), _r = /* @__PURE__ */ new WeakMap(), yr = /* @__PURE__ */ new WeakMap(), _t = /* @__PURE__ */ new WeakMap(), vr = /* @__PURE__ */ new WeakMap(), Ar = /* @__PURE__ */ new WeakMap(), hn = /* @__PURE__ */ new WeakMap(), Tr = /* @__PURE__ */ new WeakMap(), be = /* @__PURE__ */ new WeakSet(), qo = function() {
    if (this.receivedMessages.length === 0) throw new O("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, ba = function() {
    if (this.receivedMessages.length === 0) throw new O("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new O("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Ho = function() {
    this.ended || N(this, ot, void 0, "f");
  }, Vo = function(n) {
    if (this.ended) return;
    const r = A(this, be, "m", Ra).call(this, n);
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
            Ma(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage(Ia(r, A(this, Nt, "f"), { logger: A(this, hn, "f") }), !0);
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
  }, Jo = function() {
    if (this.ended) throw new O("stream has ended, this shouldn't happen");
    const n = A(this, ot, "f");
    if (!n) throw new O("request ended without sending any chunks");
    return N(this, ot, void 0, "f"), Ia(n, A(this, Nt, "f"), { logger: A(this, hn, "f") });
  }, Ra = function(n) {
    let r = A(this, ot, "f");
    if (n.type === "message_start") {
      if (r) throw new O(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new O(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (o && Ma(o)) {
              let i = o[Pa] || "";
              i += n.delta.partial_json;
              const a = { ...o };
              if (Object.defineProperty(a, Pa, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                a.input = md(i);
              } catch (u) {
                const c = new O(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                A(this, Tr, "f").call(this, c);
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
    return new Qn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, gd = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var jm = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, pn, Dt, yt, j, he, ye, Ze, it, mn, xa, Ti;
function Na() {
  let e, t;
  return {
    promise: new Promise((n, r) => {
      e = n, t = r;
    }),
    resolve: e,
    reject: t
  };
}
var _d = class {
  constructor(e, t, n) {
    pn.add(this), this.client = e, Dt.set(this, !1), yt.set(this, !1), j.set(this, void 0), he.set(this, void 0), ye.set(this, void 0), Ze.set(this, void 0), it.set(this, void 0), mn.set(this, 0), N(this, j, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const r = ["BetaToolRunner", ...od(t.tools, t.messages)].join(", ");
    N(this, he, {
      ...n,
      headers: I([{ "x-stainless-helper": r }, n?.headers])
    }, "f"), N(this, it, Na(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Dt = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), j = /* @__PURE__ */ new WeakMap(), he = /* @__PURE__ */ new WeakMap(), ye = /* @__PURE__ */ new WeakMap(), Ze = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), mn = /* @__PURE__ */ new WeakMap(), pn = /* @__PURE__ */ new WeakSet(), xa = async function() {
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
    const o = t.model ?? A(this, j, "f").params.model, i = t.summaryPrompt ?? jm, a = A(this, j, "f").params.messages;
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
    if (u.content[0]?.type !== "text") throw new O("Expected text response for compaction");
    return A(this, j, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (A(this, Dt, "f")) throw new O("Cannot iterate over a consumed stream");
    N(this, Dt, !0, "f"), N(this, yt, !0, "f"), N(this, Ze, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (A(this, j, "f").params.max_iterations && A(this, mn, "f") >= A(this, j, "f").params.max_iterations) break;
          N(this, yt, !1, "f"), N(this, Ze, void 0, "f"), N(this, mn, (e = A(this, mn, "f"), e++, e), "f"), N(this, ye, void 0, "f");
          const { max_iterations: n, compactionControl: r, ...o } = A(this, j, "f").params;
          if (o.stream ? (t = this.client.beta.messages.stream({ ...o }, A(this, he, "f")), N(this, ye, t.finalMessage(), "f"), A(this, ye, "f").catch(() => {
          }), yield t) : (N(this, ye, this.client.beta.messages.create({
            ...o,
            stream: !1
          }, A(this, he, "f")), "f"), yield A(this, ye, "f")), !await A(this, pn, "m", xa).call(this)) {
            if (!A(this, yt, "f")) {
              const { role: a, content: u } = await A(this, ye, "f");
              A(this, j, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const i = await A(this, pn, "m", Ti).call(this, A(this, j, "f").params.messages.at(-1));
            if (i) A(this, j, "f").params.messages.push(i);
            else if (!A(this, yt, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!A(this, ye, "f")) throw new O("ToolRunner concluded without a message from the server");
      A(this, it, "f").resolve(await A(this, ye, "f"));
    } catch (t) {
      throw N(this, Dt, !1, "f"), A(this, it, "f").promise.catch(() => {
      }), A(this, it, "f").reject(t), N(this, it, Na(), "f"), t;
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
    return t ? A(this, pn, "m", Ti).call(this, t, e) : null;
  }
  done() {
    return A(this, it, "f").promise;
  }
  async runUntilDone() {
    if (!A(this, Dt, "f")) for await (const e of this) ;
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
Ti = async function(t, n = A(this, he, "f").signal) {
  return A(this, Ze, "f") !== void 0 ? A(this, Ze, "f") : (N(this, Ze, eg(A(this, j, "f").params, t, {
    ...A(this, he, "f"),
    signal: n
  }), "f"), A(this, Ze, "f"));
};
async function eg(e, t = e.messages.at(-1), n) {
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
          content: a instanceof gd ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var yd = class vd {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new nr();
    for await (const n of this.iterator) for (const r of t.decode(n)) yield JSON.parse(r);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new O("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new O("Attempted to iterate over a response with no body");
    return new vd(ps(t.body), n);
  }
}, Ad = class extends X {
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
    return this._client.getAPIList("/v1/messages/batches?beta=true", rr, {
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
    if (!r.results_url) throw new O(`No batch \`results_url\`; Has it finished processing? ${r.processing_status} - ${r.id}`);
    const { betas: o } = t ?? {};
    return this._client.get(r.results_url, {
      ...n,
      headers: I([{
        "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, a) => yd.fromResponse(a.response, a.controller));
  }
}, Da = {
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
}, tg = ["claude-mythos-preview", "claude-opus-4-6"], or = class extends X {
  constructor() {
    super(...arguments), this.batches = new Ad(this._client);
  }
  create(e, t) {
    const n = ka(e), { betas: r, ...o } = n;
    o.model in Da && console.warn(`The model '${o.model}' is deprecated and will reach end-of-life on ${Da[o.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), tg.includes(o.model) && o.thinking && o.thinking.type === "enabled" && console.warn(`Using Claude with ${o.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!o.stream && i == null) {
      const u = fd[o.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(o.max_tokens, u);
    }
    const a = id(o.tools, o.messages);
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
    }, this.create(e, t).then((n) => pd(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Zm.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...r } = ka(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: r,
      ...t,
      headers: I([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new _d(this._client, e, t);
  }
};
function ka(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new O("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
or.Batches = Ad;
or.BetaToolRunner = _d;
or.ToolError = gd;
var Td = class extends X {
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
}, Sd = class extends X {
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
}, wo = class extends X {
  constructor() {
    super(...arguments), this.events = new Td(this._client), this.resources = new Sd(this._client);
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
wo.Events = Td;
wo.Resources = Sd;
var Ed = class extends X {
  create(e, t = {}, n) {
    const { betas: r, ...o } = t ?? {};
    return this._client.post($`/v1/skills/${e}/versions?beta=true`, gs({
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
}, ys = class extends X {
  constructor() {
    super(...arguments), this.versions = new Ed(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.post("/v1/skills?beta=true", gs({
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
ys.Versions = Ed;
var wd = class extends X {
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
}, vs = class extends X {
  constructor() {
    super(...arguments), this.credentials = new wd(this._client);
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
vs.Credentials = wd;
var xe = class extends X {
  constructor() {
    super(...arguments), this.models = new ad(this._client), this.messages = new or(this._client), this.agents = new _s(this._client), this.environments = new rd(this._client), this.sessions = new wo(this._client), this.vaults = new vs(this._client), this.memoryStores = new Eo(this._client), this.files = new sd(this._client), this.skills = new ys(this._client), this.userProfiles = new ld(this._client);
  }
};
xe.Models = ad;
xe.Messages = or;
xe.Agents = _s;
xe.Environments = rd;
xe.Sessions = wo;
xe.Vaults = vs;
xe.MemoryStores = Eo;
xe.Files = sd;
xe.Skills = ys;
xe.UserProfiles = ld;
var Cd = class extends X {
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
function Id(e) {
  return e?.output_config?.format;
}
function $a(e, t, n) {
  const r = Id(t);
  return !t || !("parse" in (r ?? {})) ? {
    ...e,
    content: e.content.map((o) => o.type === "text" ? Object.defineProperty({ ...o }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : o),
    parsed_output: null
  } : bd(e, t, n);
}
function bd(e, t, n) {
  let r = null;
  const o = e.content.map((i) => {
    if (i.type === "text") {
      const a = ng(t, i.text);
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
function ng(e, t) {
  const n = Id(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (r) {
    throw new O(`Failed to parse structured output: ${r}`);
  }
}
var Re, st, kt, gn, Sr, _n, yn, Er, vn, We, An, wr, Cr, vt, Ir, br, Tn, Ko, La, Wo, zo, Yo, Xo, Ua, Fa = "__json_buf";
function Ga(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var rg = class Si {
  constructor(t, n) {
    Re.add(this), this.messages = [], this.receivedMessages = [], st.set(this, void 0), kt.set(this, null), this.controller = new AbortController(), gn.set(this, void 0), Sr.set(this, () => {
    }), _n.set(this, () => {
    }), yn.set(this, void 0), Er.set(this, () => {
    }), vn.set(this, () => {
    }), We.set(this, {}), An.set(this, !1), wr.set(this, !1), Cr.set(this, !1), vt.set(this, !1), Ir.set(this, void 0), br.set(this, void 0), Tn.set(this, void 0), Wo.set(this, (r) => {
      if (N(this, wr, !0, "f"), Xn(r) && (r = new Fe()), r instanceof Fe)
        return N(this, Cr, !0, "f"), this._emit("abort", r);
      if (r instanceof O) return this._emit("error", r);
      if (r instanceof Error) {
        const o = new O(r.message);
        return o.cause = r, this._emit("error", o);
      }
      return this._emit("error", new O(String(r)));
    }), N(this, gn, new Promise((r, o) => {
      N(this, Sr, r, "f"), N(this, _n, o, "f");
    }), "f"), N(this, yn, new Promise((r, o) => {
      N(this, Er, r, "f"), N(this, vn, o, "f");
    }), "f"), A(this, gn, "f").catch(() => {
    }), A(this, yn, "f").catch(() => {
    }), N(this, kt, t, "f"), N(this, Tn, n?.logger ?? console, "f");
  }
  get response() {
    return A(this, Ir, "f");
  }
  get request_id() {
    return A(this, br, "f");
  }
  async withResponse() {
    N(this, vt, !0, "f");
    const t = await A(this, gn, "f");
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
    return N(i, kt, {
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
    }, A(this, Wo, "f"));
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
      A(this, Re, "m", zo).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...r,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) A(this, Re, "m", Yo).call(this, c);
      if (u.controller.signal?.aborted) throw new Fe();
      A(this, Re, "m", Xo).call(this);
    } finally {
      o && i && o.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (N(this, Ir, t, "f"), N(this, br, t?.headers.get("request-id"), "f"), A(this, Sr, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return A(this, An, "f");
  }
  get errored() {
    return A(this, wr, "f");
  }
  get aborted() {
    return A(this, Cr, "f");
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
    N(this, vt, !0, "f"), await A(this, yn, "f");
  }
  get currentMessage() {
    return A(this, st, "f");
  }
  async finalMessage() {
    return await this.done(), A(this, Re, "m", Ko).call(this);
  }
  async finalText() {
    return await this.done(), A(this, Re, "m", La).call(this);
  }
  _emit(t, ...n) {
    if (A(this, An, "f")) return;
    t === "end" && (N(this, An, !0, "f"), A(this, Er, "f").call(this));
    const r = A(this, We, "f")[t];
    if (r && (A(this, We, "f")[t] = r.filter((o) => !o.once), r.forEach(({ listener: o }) => o(...n))), t === "abort") {
      const o = n[0];
      !A(this, vt, "f") && !r?.length && Promise.reject(o), A(this, _n, "f").call(this, o), A(this, vn, "f").call(this, o), this._emit("end");
      return;
    }
    if (t === "error") {
      const o = n[0];
      !A(this, vt, "f") && !r?.length && Promise.reject(o), A(this, _n, "f").call(this, o), A(this, vn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", A(this, Re, "m", Ko).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    let o;
    r && (r.aborted && this.controller.abort(), o = this.controller.abort.bind(this.controller), r.addEventListener("abort", o));
    try {
      A(this, Re, "m", zo).call(this), this._connected(null);
      const i = Qn.fromReadableStream(t, this.controller);
      for await (const a of i) A(this, Re, "m", Yo).call(this, a);
      if (i.controller.signal?.aborted) throw new Fe();
      A(this, Re, "m", Xo).call(this);
    } finally {
      r && o && r.removeEventListener("abort", o);
    }
  }
  [(st = /* @__PURE__ */ new WeakMap(), kt = /* @__PURE__ */ new WeakMap(), gn = /* @__PURE__ */ new WeakMap(), Sr = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), Er = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakMap(), We = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), wr = /* @__PURE__ */ new WeakMap(), Cr = /* @__PURE__ */ new WeakMap(), vt = /* @__PURE__ */ new WeakMap(), Ir = /* @__PURE__ */ new WeakMap(), br = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), Wo = /* @__PURE__ */ new WeakMap(), Re = /* @__PURE__ */ new WeakSet(), Ko = function() {
    if (this.receivedMessages.length === 0) throw new O("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, La = function() {
    if (this.receivedMessages.length === 0) throw new O("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((r) => r.type === "text").map((r) => r.text);
    if (n.length === 0) throw new O("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, zo = function() {
    this.ended || N(this, st, void 0, "f");
  }, Yo = function(n) {
    if (this.ended) return;
    const r = A(this, Re, "m", Ua).call(this, n);
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
            Ga(o) && o.input && this._emit("inputJson", n.delta.partial_json, o.input);
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
        this._addMessageParam(r), this._addMessage($a(r, A(this, kt, "f"), { logger: A(this, Tn, "f") }), !0);
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
  }, Xo = function() {
    if (this.ended) throw new O("stream has ended, this shouldn't happen");
    const n = A(this, st, "f");
    if (!n) throw new O("request ended without sending any chunks");
    return N(this, st, void 0, "f"), $a(n, A(this, kt, "f"), { logger: A(this, Tn, "f") });
  }, Ua = function(n) {
    let r = A(this, st, "f");
    if (n.type === "message_start") {
      if (r) throw new O(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!r) throw new O(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (o && Ga(o)) {
              let i = o[Fa] || "";
              i += n.delta.partial_json;
              const a = { ...o };
              Object.defineProperty(a, Fa, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (a.input = md(i)), r.content[n.index] = a;
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
    return new Qn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Rd = class extends X {
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
    return this._client.getAPIList("/v1/messages/batches", rr, {
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
    if (!n.results_url) throw new O(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: I([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((r, o) => yd.fromResponse(o.response, o.controller));
  }
}, As = class extends X {
  constructor() {
    super(...arguments), this.batches = new Rd(this._client);
  }
  create(e, t) {
    e.model in Oa && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${Oa[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), og.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const o = fd[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, o);
    }
    const r = id(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: I([r, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => bd(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return rg.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, Oa = {
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
}, og = ["claude-mythos-preview", "claude-opus-4-6"];
As.Batches = Rd;
var Pd = class extends X {
  retrieve(e, t = {}, n) {
    const { betas: r } = t ?? {};
    return this._client.get($`/v1/models/${e}`, {
      ...n,
      headers: I([{ ...r?.toString() != null ? { "anthropic-beta": r?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...r } = e ?? {};
    return this._client.getAPIList("/v1/models", rr, {
      query: r,
      ...t,
      headers: I([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Rr = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Ei, Ts, qr, Md, ig = "\\n\\nHuman:", sg = "\\n\\nAssistant:", Q = class {
  constructor({ baseURL: e = Rr("ANTHROPIC_BASE_URL"), apiKey: t = Rr("ANTHROPIC_API_KEY") ?? null, authToken: n = Rr("ANTHROPIC_AUTH_TOKEN") ?? null, ...r } = {}) {
    Ei.add(this), qr.set(this, void 0);
    const o = {
      apiKey: t,
      authToken: n,
      ...r,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!o.dangerouslyAllowBrowser && Am()) throw new O(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = o.baseURL, this.timeout = o.timeout ?? Ts.DEFAULT_TIMEOUT, this.logger = o.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = Sa(o.logLevel, "ClientOptions.logLevel", this) ?? Sa(Rr("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = o.fetchOptions, this.maxRetries = o.maxRetries ?? 2, this.fetch = o.fetch ?? Cm(), N(this, qr, bm, "f"), this._options = o, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return Rm(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Ut}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${kc()}`;
  }
  makeStatusError(e, t, n, r) {
    return we.generate(e, t, n, r);
  }
  buildURL(e, t, n) {
    const r = !A(this, Ei, "m", Md).call(this) && n || this.baseURL, o = gm(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!ma(i) || !ma(a)) && (t = {
      ...a,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (o.search = this.stringifyQuery(t)), o.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new O("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
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
    return new Yc(this, this.makeRequest(e, t, void 0));
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
    const f = new AbortController(), p = await this.fetchWithTimeout(a, i, u, f).catch(pi), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new Fe();
      const y = Xn(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
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
      })), y ? new $c() : new So({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, y]) => ", " + _ + ": " + JSON.stringify(y)).join("")}] ${i.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const P = `retrying, ${t} attempts remaining`;
        return await Im(p.body), ce(this).info(`${g} - ${P}`), ce(this).debug(`[${c}] response error (${P})`, At({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(r, t, n ?? c, p.headers);
      }
      const y = _ ? "error; no more retries left" : "error; not retryable";
      ce(this).info(`${g} - ${y}`);
      const S = await p.text().catch((P) => pi(P).message), w = Vc(S), b = w ? void 0 : S;
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
    return new Um(this, n, e);
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
    return await vm(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new O("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: i, defaultBaseURL: a } = n, u = this.buildURL(o, i, a);
    "timeout" in n && ym("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
        ...wm(),
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
      body: Kc(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : A(this, qr, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Ts = Q, qr = /* @__PURE__ */ new WeakMap(), Ei = /* @__PURE__ */ new WeakSet(), Md = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
Q.Anthropic = Ts;
Q.HUMAN_PROMPT = ig;
Q.AI_PROMPT = sg;
Q.DEFAULT_TIMEOUT = 6e5;
Q.AnthropicError = O;
Q.APIError = we;
Q.APIConnectionError = So;
Q.APIConnectionTimeoutError = $c;
Q.APIUserAbortError = Fe;
Q.NotFoundError = Gc;
Q.ConflictError = Oc;
Q.RateLimitError = qc;
Q.BadRequestError = Lc;
Q.AuthenticationError = Uc;
Q.InternalServerError = Hc;
Q.PermissionDeniedError = Fc;
Q.UnprocessableEntityError = Bc;
Q.toFile = Hm;
var ir = class extends Q {
  constructor() {
    super(...arguments), this.completions = new Cd(this), this.messages = new As(this), this.models = new Pd(this), this.beta = new xe(this);
  }
};
ir.Completions = Cd;
ir.Messages = As;
ir.Models = Pd;
ir.Beta = xe;
function Zt(e) {
  if (Array.isArray(e)) return e.map((n) => Zt(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key|proxy_password|password/i.test(n) ? "[redacted]" : Zt(r);
  }), t;
}
function Zn(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: Zt({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    })
  };
}
function ag(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function lg(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function xd(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function ug(e) {
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
      const r = lg(n.image_url.url);
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
function cg(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function dg(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && xd(t) || null;
}
function fg(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: xd(e.content) || [] } : void 0;
}
function Ba(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function qa(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: ag(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function hg(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const r = e[n];
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const o = dg(r), i = qa(r.tool_calls);
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
        const o = [Ba(r)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, o.push(Ba(e[n]));
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
          }] : [], ...qa(r.tool_calls)]
        });
        continue;
      }
      t.push({
        role: r.role,
        content: ug(r.content)
      });
    }
  }
  return t;
}
function Pr(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Ha(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function pg(e = "auto", t = []) {
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
var mg = class {
  constructor(e) {
    this.config = e, this.client = new ir({
      apiKey: e.apiKey,
      baseURL: Ha(e.baseUrl),
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
    })), r = cg(e), o = {
      model: this.config.model,
      system: r,
      messages: hg(e.messages),
      ...n.length ? {
        tools: n,
        tool_choice: pg(e.toolChoice, t)
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (o.temperature = e.temperature), e.reasoning?.enabled && (o.thinking = {
      type: "adaptive",
      display: "summarized"
    }), o;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", r = Ha(this.config.baseUrl);
    return Zn({
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
      const i = this.client.messages.stream(t, { signal: e.signal }), a = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
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
        p.length && Pr(e, {
          text: c,
          thoughts: d(),
          toolCalls: p,
          toolCallDraft: !0
        });
      };
      i.on("text", (p, m) => {
        c = m || "", Pr(e, {
          text: c,
          thoughts: d(),
          ...h().length ? {
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), i.on("thinking", (p, m) => {
        a.set("thinking:0", m || ""), Pr(e, {
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
        p?.type === "redacted_thinking" && (a.set("redacted:0", p.data || ""), Pr(e, {
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
      thoughts: (r.content || []).filter((i) => i.type === "thinking" || i.type === "redacted_thinking").map((i) => ({
        label: i.type === "thinking" ? "思考块" : "已脱敏思考块",
        text: i.type === "thinking" ? i.thinking || "" : i.data || ""
      })).filter((i) => i.text),
      finishReason: r.stop_reason || "stop",
      model: r.model || this.config.model,
      provider: "anthropic",
      providerPayload: fg(r),
      requestInspection: n
    };
  }
}, gg = /* @__PURE__ */ To(((e, t) => {
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
})), _g = /* @__PURE__ */ To(((e) => {
  var t = gg();
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
})), yg = /* @__PURE__ */ To(((e, t) => {
  t.exports = _g();
})), vg = /* @__PURE__ */ To(((e, t) => {
  var n = yg(), r = [
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
})), Va = /* @__PURE__ */ sm(vg(), 1), Ag = void 0, Tg = void 0;
function Sg() {
  return {
    geminiUrl: Ag,
    vertexUrl: Tg
  };
}
function Eg(e, t, n, r) {
  var o, i;
  if (!e?.baseUrl) {
    const a = Sg();
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
function wg(e, t) {
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
    wi(e, o, i, 0, a);
  }
}
function wi(e, t, n, r, o) {
  if (r >= t.length || typeof e != "object" || e === null) return;
  const i = t[r];
  if (i.endsWith("[]")) {
    const a = i.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) wi(c, t, n, r + 1, o);
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
    i in a && wi(a[i], t, n, r + 1, o);
  }
}
function Ss(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function Cg(e) {
  const t = {}, n = s(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const r = s(e, ["resourceName"]);
  return r != null && l(t, ["_url", "resourceName"], r), t;
}
function Ig(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], Rg(a)), t;
}
function bg(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], Pg(a)), t;
}
function Rg(e) {
  const t = {}, n = s(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => Mg(a))), l(t, ["generatedVideos"], i);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = s(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function Pg(e) {
  const t = {}, n = s(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => xg(a))), l(t, ["generatedVideos"], i);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(t, ["raiMediaFilteredCount"], r);
  const o = s(e, ["raiMediaFilteredReasons"]);
  return o != null && l(t, ["raiMediaFilteredReasons"], o), t;
}
function Mg(e) {
  const t = {}, n = s(e, ["video"]);
  return n != null && l(t, ["video"], Ug(n)), t;
}
function xg(e) {
  const t = {}, n = s(e, ["_self"]);
  return n != null && l(t, ["video"], Fg(n)), t;
}
function Ng(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function Dg(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function kg(e) {
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
function $g(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function Nd(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], Lg(a)), t;
}
function Lg(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function Ug(e) {
  const t = {}, n = s(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const r = s(e, ["encodedVideo"]);
  r != null && l(t, ["videoBytes"], Ss(r));
  const o = s(e, ["encoding"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Fg(e) {
  const t = {}, n = s(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const r = s(e, ["bytesBase64Encoded"]);
  r != null && l(t, ["videoBytes"], Ss(r));
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
var Ja;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(Ja || (Ja = {}));
var Ka;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(Ka || (Ka = {}));
var Wa;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(Wa || (Wa = {}));
var dt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(dt || (dt = {}));
var za;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(za || (za = {}));
var Ya;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(Ya || (Ya = {}));
var Xa;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(Xa || (Xa = {}));
var Qa;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(Qa || (Qa = {}));
var Za;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(Za || (Za = {}));
var ja;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(ja || (ja = {}));
var el;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(el || (el = {}));
var Ht;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(Ht || (Ht = {}));
var Hn;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Hn || (Hn = {}));
var tl;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(tl || (tl = {}));
var nl;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(nl || (nl = {}));
var rl;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(rl || (rl = {}));
var ol;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(ol || (ol = {}));
var il;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(il || (il = {}));
var sl;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(sl || (sl = {}));
var al;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(al || (al = {}));
var ll;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(ll || (ll = {}));
var ul;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(ul || (ul = {}));
var cl;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(cl || (cl = {}));
var dl;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(dl || (dl = {}));
var to;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(to || (to = {}));
var fl;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(fl || (fl = {}));
var hl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(hl || (hl = {}));
var pl;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(pl || (pl = {}));
var ml;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(ml || (ml = {}));
var Ci;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(Ci || (Ci = {}));
var gl;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(gl || (gl = {}));
var _l;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(_l || (_l = {}));
var yl;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(yl || (yl = {}));
var vl;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(vl || (vl = {}));
var Al;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Al || (Al = {}));
var Tl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(Tl || (Tl = {}));
var Sl;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(Sl || (Sl = {}));
var Ii;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(Ii || (Ii = {}));
var El;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(El || (El = {}));
var wl;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(wl || (wl = {}));
var no;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(no || (no = {}));
var Cl;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(Cl || (Cl = {}));
var Il;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(Il || (Il = {}));
var bl;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(bl || (bl = {}));
var Rl;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(Rl || (Rl = {}));
var Pl;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(Pl || (Pl = {}));
var Ml;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(Ml || (Ml = {}));
var xl;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(xl || (xl = {}));
var Nl;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(Nl || (Nl = {}));
var Dl;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(Dl || (Dl = {}));
var kl;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(kl || (kl = {}));
var $l;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})($l || ($l = {}));
var Ll;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(Ll || (Ll = {}));
var Ul;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(Fl || (Fl = {}));
var Gl;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(Gl || (Gl = {}));
var Ol;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(Ol || (Ol = {}));
var Bl;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(Bl || (Bl = {}));
var ql;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(ql || (ql = {}));
var Hl;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(Hl || (Hl = {}));
var Vl;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(Vl || (Vl = {}));
var Jl;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(Jl || (Jl = {}));
var Kl;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(Kl || (Kl = {}));
var Wl;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(Wl || (Wl = {}));
var Vt;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(Vt || (Vt = {}));
var bi = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Sn = class {
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
}, zl = class {
}, Yl = class {
}, Gg = class {
}, Og = class {
}, Bg = class {
}, qg = class {
}, Xl = class {
}, Ql = class {
}, Zl = class {
}, Hg = class {
}, jl = class Dd {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new Dd();
    let o;
    const i = t;
    return n ? o = bg(i) : o = Ig(i), Object.assign(r, o), r;
  }
}, eu = class {
}, tu = class {
}, nu = class {
}, ru = class {
}, Vg = class {
}, Jg = class {
}, Kg = class {
}, Wg = class kd {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new kd(), o = kg(t);
    return Object.assign(r, o), r;
  }
}, zg = class {
}, Yg = class {
}, Xg = class {
}, Qg = class {
}, ou = class {
}, Zg = class {
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
}, jg = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, e_ = class $d {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const r = new $d(), o = Nd(t);
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
function Ld(e, t) {
  const n = V(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function Ud(e) {
  return Array.isArray(e) ? e.map((t) => ro(t)) : [ro(e)];
}
function ro(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function Fd(e) {
  const t = ro(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Gd(e) {
  const t = ro(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function iu(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function Od(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => iu(t)) : [iu(e)];
}
function Ri(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function su(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function au(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function re(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return Ri(e) ? e : {
    role: "user",
    parts: Od(e)
  };
}
function Es(e, t) {
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
    if (su(e) || au(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [re(e)];
  }
  const t = [], n = [], r = Ri(e[0]);
  for (const o of e) {
    const i = Ri(o);
    if (i != r) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(o);
    else {
      if (su(o) || au(o)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(o);
    }
  }
  return r || t.push({
    role: "user",
    parts: Od(n)
  }), t;
}
function t_(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((r) => r !== "null");
  if (n.length === 1) t.type = Object.values(dt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : dt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const r of n) t.anyOf.push({ type: Object.values(dt).includes(r.toUpperCase()) ? r.toUpperCase() : dt.TYPE_UNSPECIFIED });
  }
}
function Xt(e) {
  const t = {}, n = ["items"], r = ["anyOf"], o = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && t_(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(dt).includes(u.toUpperCase()) ? u.toUpperCase() : dt.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = Xt(u);
      else if (r.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(Xt(d));
        }
        t[a] = c;
      } else if (o.includes(a)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = Xt(h);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function ws(e) {
  return Xt(e);
}
function Cs(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function Is(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function en(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = Xt(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = Xt(t.response));
  return e;
}
function tn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function n_(e, t, n, r = 1) {
  const o = !t.startsWith(`${n}/`) && t.split("/").length === r;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : o ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : o ? `${n}/${t}` : t;
}
function nt(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return n_(e, t, "cachedContents");
}
function Bd(e) {
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
  return Ss(e);
}
function r_(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function o_(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function i_(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function qd(e) {
  var t;
  let n;
  if (r_(e) && (n = e.name), !(i_(e) && (n = e.uri, n === void 0)) && !(o_(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const r = n.split("files/")[1].match(/[a-z0-9]+/);
      if (r === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = r[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function Hd(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function Vd(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (s_(e, t)) return e[t];
  return [];
}
function s_(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function a_(e, t = {}) {
  const n = e, r = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (r.responseJsonSchema = n.outputSchema), t.behavior && (r.behavior = t.behavior), { functionDeclarations: [r] };
}
function l_(e, t = {}) {
  const n = [], r = /* @__PURE__ */ new Set();
  for (const o of e) {
    const i = o.name;
    if (r.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    r.add(i);
    const a = a_(o, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function Jd(e, t) {
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
function u_(e) {
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
function Kd(e) {
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
function nn(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function Wd(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function c_(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function d_(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function f_(e) {
  const t = {}, n = s(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const r = s(e, ["inlinedResponses", "inlinedResponses"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => K_(a))), l(t, ["inlinedResponses"], i);
  }
  const o = s(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function h_(e) {
  const t = {}, n = s(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const r = s(e, ["gcsDestination", "outputUriPrefix"]);
  r != null && l(t, ["gcsUri"], r);
  const o = s(e, ["bigqueryDestination", "outputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function p_(e) {
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
function Hr(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata", "displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = s(e, ["metadata", "state"]);
  o != null && l(t, ["state"], Wd(o));
  const i = s(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const a = s(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = s(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = s(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = s(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], f_(Kd(d))), t;
}
function Pi(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["displayName"]);
  r != null && l(t, ["displayName"], r);
  const o = s(e, ["state"]);
  o != null && l(t, ["state"], Wd(o));
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
  f != null && l(t, ["src"], m_(f));
  const p = s(e, ["outputConfig"]);
  p != null && l(t, ["dest"], h_(Kd(p)));
  const m = s(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function m_(e) {
  const t = {}, n = s(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const r = s(e, ["gcsSource", "uris"]);
  r != null && l(t, ["gcsUri"], r);
  const o = s(e, ["bigquerySource", "inputUri"]);
  return o != null && l(t, ["bigqueryUri"], o), t;
}
function g_(e, t) {
  const n = {};
  if (s(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (s(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (s(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const r = s(t, ["fileName"]);
  r != null && l(n, ["fileName"], r);
  const o = s(t, ["inlinedRequests"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => J_(e, a))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function __(e) {
  const t = {}, n = s(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const r = s(e, ["gcsUri"]);
  r != null && l(t, ["gcsSource", "uris"], r);
  const o = s(e, ["bigqueryUri"]);
  if (o != null && l(t, ["bigquerySource", "inputUri"], o), s(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function y_(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function v_(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nn(e, r)), n;
}
function A_(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nn(e, r)), n;
}
function T_(e) {
  const t = {}, n = s(e, ["content"]);
  n != null && l(t, ["content"], n);
  const r = s(e, ["citationMetadata"]);
  r != null && l(t, ["citationMetadata"], S_(r));
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
function S_(e) {
  const t = {}, n = s(e, ["citationSources"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["citations"], r);
  }
  return t;
}
function zd(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => j_(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function E_(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  if (t !== void 0 && r != null && l(t, ["batch", "displayName"], r), s(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const o = s(e, ["webhookConfig"]);
  return t !== void 0 && o != null && l(t, ["batch", "webhookConfig"], o), n;
}
function w_(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const o = s(e, ["dest"]);
  if (t !== void 0 && o != null && l(t, ["outputConfig"], p_(u_(o))), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function lu(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["_url", "model"], V(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], g_(e, Jd(e, o)));
  const i = s(t, ["config"]);
  return i != null && E_(i, n), n;
}
function C_(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], V(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["inputConfig"], __(Jd(e, o)));
  const i = s(t, ["config"]);
  return i != null && w_(i, n), n;
}
function I_(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["batch", "displayName"], r), n;
}
function b_(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["_url", "model"], V(e, r));
  const o = s(t, ["src"]);
  o != null && l(n, ["batch", "inputConfig"], k_(e, o));
  const i = s(t, ["config"]);
  return i != null && I_(i, n), n;
}
function R_(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nn(e, r)), n;
}
function P_(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nn(e, r)), n;
}
function M_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function x_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["name"]);
  r != null && l(t, ["name"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function N_(e, t) {
  const n = {}, r = s(t, ["contents"]);
  if (r != null) {
    let i = Es(e, r);
    Array.isArray(i) && (i = i.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const o = s(t, ["config"]);
  return o != null && (l(n, ["_self"], D_(o, n)), wg(n, { "requests[].*": "requests[].request.*" })), n;
}
function D_(e, t) {
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
function k_(e, t) {
  const n = {}, r = s(t, ["fileName"]);
  r != null && l(n, ["file_name"], r);
  const o = s(t, ["inlinedRequests"]);
  return o != null && l(n, ["requests"], N_(e, o)), n;
}
function $_(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function L_(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function U_(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = s(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function F_(e, t, n) {
  const r = {}, o = s(t, ["systemInstruction"]);
  n !== void 0 && o != null && l(n, ["systemInstruction"], zd(re(o)));
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
  const S = s(t, ["responseSchema"]);
  S != null && l(r, ["responseSchema"], ws(S));
  const w = s(t, ["responseJsonSchema"]);
  if (w != null && l(r, ["responseJsonSchema"], w), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const b = s(t, ["safetySettings"]);
  if (n !== void 0 && b != null) {
    let J = b;
    Array.isArray(J) && (J = J.map((K) => ey(K))), l(n, ["safetySettings"], J);
  }
  const P = s(t, ["tools"]);
  if (n !== void 0 && P != null) {
    let J = tn(P);
    Array.isArray(J) && (J = J.map((K) => ny(en(K)))), l(n, ["tools"], J);
  }
  const k = s(t, ["toolConfig"]);
  if (n !== void 0 && k != null && l(n, ["toolConfig"], ty(k)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const E = s(t, ["cachedContent"]);
  n !== void 0 && E != null && l(n, ["cachedContent"], nt(e, E));
  const L = s(t, ["responseModalities"]);
  L != null && l(r, ["responseModalities"], L);
  const C = s(t, ["mediaResolution"]);
  C != null && l(r, ["mediaResolution"], C);
  const M = s(t, ["speechConfig"]);
  if (M != null && l(r, ["speechConfig"], Cs(M)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const F = s(t, ["thinkingConfig"]);
  F != null && l(r, ["thinkingConfig"], F);
  const H = s(t, ["imageConfig"]);
  H != null && l(r, ["imageConfig"], V_(H));
  const ae = s(t, ["enableEnhancedCivicAnswers"]);
  if (ae != null && l(r, ["enableEnhancedCivicAnswers"], ae), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const W = s(t, ["serviceTier"]);
  return n !== void 0 && W != null && l(n, ["serviceTier"], W), r;
}
function G_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["candidates"]);
  if (r != null) {
    let d = r;
    Array.isArray(d) && (d = d.map((h) => T_(h))), l(t, ["candidates"], d);
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
function O_(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nn(e, r)), n;
}
function B_(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nn(e, r)), n;
}
function q_(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], d_(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function H_(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function V_(e) {
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
function J_(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["request", "model"], V(e, r));
  const o = s(t, ["contents"]);
  if (o != null) {
    let u = me(o);
    Array.isArray(u) && (u = u.map((c) => zd(c))), l(n, ["request", "contents"], u);
  }
  const i = s(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = s(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], F_(e, a, s(n, ["request"], {}))), n;
}
function K_(e) {
  const t = {}, n = s(e, ["response"]);
  n != null && l(t, ["response"], G_(n));
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["error"]);
  return o != null && l(t, ["error"], o), t;
}
function W_(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  if (t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), s(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function z_(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  t !== void 0 && o != null && l(t, ["_query", "pageToken"], o);
  const i = s(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function Y_(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && W_(n, t), t;
}
function X_(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && z_(n, t), t;
}
function Q_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["operations"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Hr(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Z_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["nextPageToken"]);
  r != null && l(t, ["nextPageToken"], r);
  const o = s(e, ["batchPredictionJobs"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Pi(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function j_(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], $_(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], L_(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], y_(c));
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
function ey(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function ty(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], U_(r));
  const o = s(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function ny(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], H_(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], q_(i));
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
var xt = class {
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
}, ry = class extends tt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new xt(et.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = lu(this.apiClient, e), n = t._url, r = x("{model}:batchGenerateContent", n), o = t.batch.inputConfig.requests, i = o.requests, a = [];
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
      const c = C_(this.apiClient, e);
      return a = x("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Pi(d));
    } else {
      const c = lu(this.apiClient, e);
      return a = x("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Hr(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = b_(this.apiClient, e);
      return o = x("{model}:asyncBatchEmbedContent", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => Hr(u));
    }
  }
  async get(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = B_(this.apiClient, e);
      return a = x("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Pi(d));
    } else {
      const c = O_(this.apiClient, e);
      return a = x("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Hr(d));
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let i = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = A_(this.apiClient, e);
      i = x("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = v_(this.apiClient, e);
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
      const c = X_(e);
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
        const h = Z_(d), f = new ou();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Y_(e);
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
        const h = Q_(d), f = new ou();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = P_(this.apiClient, e);
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
      })), i.then((d) => x_(d));
    } else {
      const c = R_(this.apiClient, e);
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
      })), i.then((d) => M_(d));
    }
  }
};
function oy(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function iy(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function uu(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => Ry(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function cu(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => Py(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function sy(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let h = me(a);
    Array.isArray(h) && (h = h.map((f) => uu(f))), l(t, ["contents"], h);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], uu(re(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => Ny(f))), l(t, ["tools"], h);
  }
  const d = s(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], My(d)), s(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function ay(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  t !== void 0 && o != null && l(t, ["expireTime"], o);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = me(a);
    Array.isArray(f) && (f = f.map((p) => cu(p))), l(t, ["contents"], f);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], cu(re(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => Dy(p))), l(t, ["tools"], f);
  }
  const d = s(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], xy(d));
  const h = s(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function ly(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], Ld(e, r));
  const o = s(t, ["config"]);
  return o != null && sy(o, n), n;
}
function uy(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["model"], Ld(e, r));
  const o = s(t, ["config"]);
  return o != null && ay(o, n), n;
}
function cy(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nt(e, r)), n;
}
function dy(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nt(e, r)), n;
}
function fy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function hy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function py(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function my(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function gy(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const r = s(e, ["mode"]);
  if (r != null && l(t, ["mode"], r), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function _y(e) {
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
function yy(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nt(e, r)), n;
}
function vy(e, t) {
  const n = {}, r = s(t, ["name"]);
  return r != null && l(n, ["_url", "name"], nt(e, r)), n;
}
function Ay(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], oy(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function Ty(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function Sy(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function Ey(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function wy(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && Sy(n, t), t;
}
function Cy(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && Ey(n, t), t;
}
function Iy(e) {
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
function by(e) {
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
function Ry(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], py(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], my(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], iy(c));
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
function Py(e) {
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
function My(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  r != null && l(t, ["functionCallingConfig"], gy(r));
  const o = s(e, ["includeServerSideToolInvocations"]);
  return o != null && l(t, ["includeServerSideToolInvocations"], o), t;
}
function xy(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const r = s(e, ["functionCallingConfig"]);
  if (r != null && l(t, ["functionCallingConfig"], r), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function Ny(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], Ty(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Ay(i));
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
function Dy(e) {
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
    Array.isArray(p) && (p = p.map((m) => _y(m))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function ky(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function $y(e, t) {
  const n = {}, r = s(e, ["ttl"]);
  t !== void 0 && r != null && l(t, ["ttl"], r);
  const o = s(e, ["expireTime"]);
  return t !== void 0 && o != null && l(t, ["expireTime"], o), n;
}
function Ly(e, t) {
  const n = {}, r = s(t, ["name"]);
  r != null && l(n, ["_url", "name"], nt(e, r));
  const o = s(t, ["config"]);
  return o != null && ky(o, n), n;
}
function Uy(e, t) {
  const n = {}, r = s(t, ["name"]);
  r != null && l(n, ["_url", "name"], nt(e, r));
  const o = s(t, ["config"]);
  return o != null && $y(o, n), n;
}
var Fy = class extends tt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new xt(et.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = uy(this.apiClient, e);
      return a = x("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = ly(this.apiClient, e);
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
      const c = vy(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = yy(this.apiClient, e);
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
      const c = dy(this.apiClient, e);
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
        const h = hy(d), f = new nu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = cy(this.apiClient, e);
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
        const h = fy(d), f = new nu();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Uy(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Ly(this.apiClient, e);
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
      const c = Cy(e);
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
        const h = by(d), f = new ru();
        return Object.assign(f, h), f;
      });
    } else {
      const c = wy(e);
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
        const h = Iy(d), f = new ru();
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
function du(e) {
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
function Ge(e, t, n) {
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
      return new Promise(function(y, S) {
        i.push([
          m,
          _,
          y,
          S
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
function Oe(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof du == "function" ? du(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
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
function Gy(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : Yd(n);
}
function Yd(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function Oy(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function fu(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let r = 0;
  for (; r < n; ) if (e[r].role === "user")
    t.push(e[r]), r++;
  else {
    const o = [];
    let i = !0;
    for (; r < n && e[r].role === "model"; )
      o.push(e[r]), i && !Yd(e[r]) && (i = !1), r++;
    i ? t.push(...o) : t.pop();
  }
  return t;
}
var By = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new qy(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, qy = class {
  constructor(e, t, n, r = {}, o = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = r, this.history = o, this.sendPromise = Promise.resolve(), Oy(o);
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
    const t = e ? fu(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return Ge(this, arguments, function* () {
      var r, o, i, a, u, c;
      const d = [];
      try {
        for (var h = !0, f = Oe(e), p; p = yield B(f.next()), r = p.done, !r; h = !0) {
          a = p.value, h = !1;
          const m = a;
          if (Gy(m)) {
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
    }), n && n.length > 0 ? this.history.push(...fu(n)) : this.history.push(e), this.history.push(...r);
  }
}, Xd = class Qd extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Qd.prototype);
  }
};
function Hy(e) {
  const t = {}, n = s(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function Vy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Jy(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], qd(n)), t;
}
function Ky(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Wy(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], qd(n)), t;
}
function zy(e) {
  const t = {}, n = s(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function Yy(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function Xy(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && Yy(n, t), t;
}
function Qy(e) {
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
function Zy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["files"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(t, ["files"], o);
  }
  return t;
}
var jy = class extends tt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new xt(et.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const a = Xy(e);
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
        const c = Qy(u), d = new zg();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Hy(e);
      return o = x("upload/v1beta/files", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = Vy(u), d = new Yg();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Wy(e);
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
      const a = Jy(e);
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
        const c = Ky(u), d = new Xg();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = zy(e);
      return o = x("files:register", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = Zy(u), d = new Qg();
        return Object.assign(d, c), d;
      });
    }
  }
};
function hu(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function ev(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Vr(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function tv(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => yv(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function nv(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => vv(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function rv(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function ov(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function iv(e) {
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
function sv(e) {
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
  const S = s(e, ["seed"]);
  S != null && l(t, ["seed"], S);
  const w = s(e, ["speechConfig"]);
  w != null && l(t, ["speechConfig"], w);
  const b = s(e, ["stopSequences"]);
  b != null && l(t, ["stopSequences"], b);
  const P = s(e, ["temperature"]);
  P != null && l(t, ["temperature"], P);
  const k = s(e, ["thinkingConfig"]);
  k != null && l(t, ["thinkingConfig"], k);
  const E = s(e, ["topK"]);
  E != null && l(t, ["topK"], E);
  const L = s(e, ["topP"]);
  if (L != null && l(t, ["topP"], L), s(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function av(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], ev(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function lv(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function uv(e, t) {
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
  ], Is(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], tv(re(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let C = tn(_);
    Array.isArray(C) && (C = C.map((M) => Sv(en(M)))), l(t, ["setup", "tools"], C);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], Tv(y));
  const S = s(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], hu(S));
  const w = s(e, ["outputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "outputAudioTranscription"], hu(w));
  const b = s(e, ["realtimeInputConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "realtimeInputConfig"], b);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const k = s(e, ["proactivity"]);
  if (t !== void 0 && k != null && l(t, ["setup", "proactivity"], k), s(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const E = s(e, ["avatarConfig"]);
  t !== void 0 && E != null && l(t, ["setup", "avatarConfig"], E);
  const L = s(e, ["safetySettings"]);
  if (t !== void 0 && L != null) {
    let C = L;
    Array.isArray(C) && (C = C.map((M) => Av(M))), l(t, ["setup", "safetySettings"], C);
  }
  return n;
}
function cv(e, t) {
  const n = {}, r = s(e, ["generationConfig"]);
  t !== void 0 && r != null && l(t, ["setup", "generationConfig"], sv(r));
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
  ], Is(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], nv(re(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let M = tn(_);
    Array.isArray(M) && (M = M.map((F) => Ev(en(F)))), l(t, ["setup", "tools"], M);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], y);
  const S = s(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], S);
  const w = s(e, ["outputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "outputAudioTranscription"], w);
  const b = s(e, ["realtimeInputConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "realtimeInputConfig"], b);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const k = s(e, ["proactivity"]);
  t !== void 0 && k != null && l(t, ["setup", "proactivity"], k);
  const E = s(e, ["explicitVadSignal"]);
  t !== void 0 && E != null && l(t, ["setup", "explicitVadSignal"], E);
  const L = s(e, ["avatarConfig"]);
  t !== void 0 && L != null && l(t, ["setup", "avatarConfig"], L);
  const C = s(e, ["safetySettings"]);
  if (t !== void 0 && C != null) {
    let M = C;
    Array.isArray(M) && (M = M.map((F) => F)), l(t, ["setup", "safetySettings"], M);
  }
  return n;
}
function dv(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], V(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], uv(o, n)), n;
}
function fv(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], V(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], cv(o, n)), n;
}
function hv(e) {
  const t = {}, n = s(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function pv(e) {
  const t = {}, n = s(e, ["weightedPrompts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((o) => o)), l(t, ["weightedPrompts"], r);
  }
  return t;
}
function mv(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = Ud(n);
    Array.isArray(d) && (d = d.map((h) => Vr(h))), l(t, ["mediaChunks"], d);
  }
  const r = s(e, ["audio"]);
  r != null && l(t, ["audio"], Vr(Gd(r)));
  const o = s(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], Vr(Fd(i)));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function gv(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = Ud(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const r = s(e, ["audio"]);
  r != null && l(t, ["audio"], Gd(r));
  const o = s(e, ["audioStreamEnd"]);
  o != null && l(t, ["audioStreamEnd"], o);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], Fd(i));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function _v(e) {
  const t = {}, n = s(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const r = s(e, ["serverContent"]);
  r != null && l(t, ["serverContent"], r);
  const o = s(e, ["toolCall"]);
  o != null && l(t, ["toolCall"], o);
  const i = s(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const a = s(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], wv(a));
  const u = s(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = s(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = s(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = s(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], Cv(h)), t;
}
function yv(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], rv(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], ov(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Vr(c));
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
function vv(e) {
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
function Av(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function Tv(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function Sv(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], lv(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], av(i));
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
function Ev(e) {
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
    Array.isArray(p) && (p = p.map((m) => iv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function wv(e) {
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
function Cv(e) {
  const t = {}, n = s(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function Iv(e, t) {
  const n = {}, r = s(e, ["apiKey"]);
  if (r != null && l(n, ["apiKey"], r), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function bv(e, t) {
  const n = {}, r = s(e, ["data"]);
  if (r != null && l(n, ["data"], r), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function Rv(e, t) {
  const n = {}, r = s(e, ["content"]);
  r != null && l(n, ["content"], r);
  const o = s(e, ["citationMetadata"]);
  o != null && l(n, ["citationMetadata"], Pv(o));
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
function Pv(e, t) {
  const n = {}, r = s(e, ["citationSources"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => i)), l(n, ["citations"], o);
  }
  return n;
}
function Mv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let a = me(i);
    Array.isArray(a) && (a = a.map((u) => rn(u))), l(r, ["contents"], a);
  }
  return r;
}
function xv(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["tokensInfo"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function Nv(e, t) {
  const n = {}, r = s(e, ["values"]);
  r != null && l(n, ["values"], r);
  const o = s(e, ["statistics"]);
  return o != null && l(n, ["statistics"], Dv(o)), n;
}
function Dv(e, t) {
  const n = {}, r = s(e, ["truncated"]);
  r != null && l(n, ["truncated"], r);
  const o = s(e, ["token_count"]);
  return o != null && l(n, ["tokenCount"], o), n;
}
function sr(e, t) {
  const n = {}, r = s(e, ["parts"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => qA(a))), l(n, ["parts"], i);
  }
  const o = s(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function rn(e, t) {
  const n = {}, r = s(e, ["parts"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => HA(a))), l(n, ["parts"], i);
  }
  const o = s(e, ["role"]);
  return o != null && l(n, ["role"], o), n;
}
function kv(e, t) {
  const n = {}, r = s(e, ["controlType"]);
  r != null && l(n, ["controlType"], r);
  const o = s(e, ["enableControlImageComputation"]);
  return o != null && l(n, ["computeControl"], o), n;
}
function $v(e, t) {
  const n = {};
  if (s(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (s(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (s(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function Lv(e, t, n) {
  const r = {}, o = s(e, ["systemInstruction"]);
  t !== void 0 && o != null && l(t, ["systemInstruction"], rn(re(o)));
  const i = s(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => tf(c))), l(t, ["tools"], u);
  }
  const a = s(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], bA(a)), r;
}
function Uv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = me(i);
    Array.isArray(u) && (u = u.map((c) => sr(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && $v(a), r;
}
function Fv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = me(i);
    Array.isArray(u) && (u = u.map((c) => rn(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && Lv(a, r), r;
}
function Gv(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["totalTokens"]);
  o != null && l(n, ["totalTokens"], o);
  const i = s(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function Ov(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["totalTokens"]);
  return o != null && l(n, ["totalTokens"], o), n;
}
function Bv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], V(e, o)), r;
}
function qv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], V(e, o)), r;
}
function Hv(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function Vv(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function Jv(e, t, n) {
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
  const S = s(e, ["addWatermark"]);
  t !== void 0 && S != null && l(t, ["parameters", "addWatermark"], S);
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
function Kv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => YA(d))), l(r, ["instances[0]", "referenceImages"], c);
  }
  const u = s(t, ["config"]);
  return u != null && Jv(u, r), r;
}
function Wv(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Co(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function zv(e, t, n) {
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
function Yv(e, t, n) {
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
function Xv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let d = Es(e, i);
    Array.isArray(d) && (d = d.map((h) => h)), l(r, ["requests[]", "content"], d);
  }
  const a = s(t, ["content"]);
  a != null && sr(re(a));
  const u = s(t, ["config"]);
  u != null && zv(u, r);
  const c = s(t, ["model"]);
  return c !== void 0 && l(r, ["requests[]", "model"], V(e, c)), r;
}
function Qv(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  let i = s(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = s(t, ["contents"]);
    if (c != null) {
      let d = Es(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(r, ["instances[]", "content"], d);
    }
  }
  let a = s(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = s(t, ["content"]);
    c != null && l(r, ["content"], rn(re(c)));
  }
  const u = s(t, ["config"]);
  return u != null && Yv(u, r, n), r;
}
function Zv(e, t) {
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
function jv(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions[]", "embeddings"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => Nv(u))), l(n, ["embeddings"], a);
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
function eA(e, t) {
  const n = {}, r = s(e, ["endpoint"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["deployedModelId"]);
  return o != null && l(n, ["deployedModelId"], o), n;
}
function tA(e, t) {
  const n = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["fileUri"]);
  r != null && l(n, ["fileUri"], r);
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function nA(e, t) {
  const n = {}, r = s(e, ["id"]);
  r != null && l(n, ["id"], r);
  const o = s(e, ["args"]);
  o != null && l(n, ["args"], o);
  const i = s(e, ["name"]);
  if (i != null && l(n, ["name"], i), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function rA(e, t) {
  const n = {}, r = s(e, ["allowedFunctionNames"]);
  r != null && l(n, ["allowedFunctionNames"], r);
  const o = s(e, ["mode"]);
  if (o != null && l(n, ["mode"], o), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function oA(e, t) {
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
function iA(e, t, n, r) {
  const o = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], sr(re(i)));
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
  const S = s(t, ["responseMimeType"]);
  S != null && l(o, ["responseMimeType"], S);
  const w = s(t, ["responseSchema"]);
  w != null && l(o, ["responseSchema"], ws(w));
  const b = s(t, ["responseJsonSchema"]);
  if (b != null && l(o, ["responseJsonSchema"], b), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = s(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let K = P;
    Array.isArray(K) && (K = K.map((fe) => XA(fe))), l(n, ["safetySettings"], K);
  }
  const k = s(t, ["tools"]);
  if (n !== void 0 && k != null) {
    let K = tn(k);
    Array.isArray(K) && (K = K.map((fe) => oT(en(fe)))), l(n, ["tools"], K);
  }
  const E = s(t, ["toolConfig"]);
  if (n !== void 0 && E != null && l(n, ["toolConfig"], nT(E)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const L = s(t, ["cachedContent"]);
  n !== void 0 && L != null && l(n, ["cachedContent"], nt(e, L));
  const C = s(t, ["responseModalities"]);
  C != null && l(o, ["responseModalities"], C);
  const M = s(t, ["mediaResolution"]);
  M != null && l(o, ["mediaResolution"], M);
  const F = s(t, ["speechConfig"]);
  if (F != null && l(o, ["speechConfig"], Cs(F)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = s(t, ["thinkingConfig"]);
  H != null && l(o, ["thinkingConfig"], H);
  const ae = s(t, ["imageConfig"]);
  ae != null && l(o, ["imageConfig"], NA(ae));
  const W = s(t, ["enableEnhancedCivicAnswers"]);
  if (W != null && l(o, ["enableEnhancedCivicAnswers"], W), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const J = s(t, ["serviceTier"]);
  return n !== void 0 && J != null && l(n, ["serviceTier"], J), o;
}
function sA(e, t, n, r) {
  const o = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], rn(re(i)));
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
  const S = s(t, ["responseMimeType"]);
  S != null && l(o, ["responseMimeType"], S);
  const w = s(t, ["responseSchema"]);
  w != null && l(o, ["responseSchema"], ws(w));
  const b = s(t, ["responseJsonSchema"]);
  b != null && l(o, ["responseJsonSchema"], b);
  const P = s(t, ["routingConfig"]);
  P != null && l(o, ["routingConfig"], P);
  const k = s(t, ["modelSelectionConfig"]);
  k != null && l(o, ["modelConfig"], k);
  const E = s(t, ["safetySettings"]);
  if (n !== void 0 && E != null) {
    let De = E;
    Array.isArray(De) && (De = De.map((Bo) => Bo)), l(n, ["safetySettings"], De);
  }
  const L = s(t, ["tools"]);
  if (n !== void 0 && L != null) {
    let De = tn(L);
    Array.isArray(De) && (De = De.map((Bo) => tf(en(Bo)))), l(n, ["tools"], De);
  }
  const C = s(t, ["toolConfig"]);
  n !== void 0 && C != null && l(n, ["toolConfig"], rT(C));
  const M = s(t, ["labels"]);
  n !== void 0 && M != null && l(n, ["labels"], M);
  const F = s(t, ["cachedContent"]);
  n !== void 0 && F != null && l(n, ["cachedContent"], nt(e, F));
  const H = s(t, ["responseModalities"]);
  H != null && l(o, ["responseModalities"], H);
  const ae = s(t, ["mediaResolution"]);
  ae != null && l(o, ["mediaResolution"], ae);
  const W = s(t, ["speechConfig"]);
  W != null && l(o, ["speechConfig"], Cs(W));
  const J = s(t, ["audioTimestamp"]);
  J != null && l(o, ["audioTimestamp"], J);
  const K = s(t, ["thinkingConfig"]);
  K != null && l(o, ["thinkingConfig"], K);
  const fe = s(t, ["imageConfig"]);
  if (fe != null && l(o, ["imageConfig"], DA(fe)), s(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Je = s(t, ["modelArmorConfig"]);
  n !== void 0 && Je != null && l(n, ["modelArmorConfig"], Je);
  const gt = s(t, ["serviceTier"]);
  return n !== void 0 && gt != null && l(n, ["serviceTier"], gt), o;
}
function pu(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = me(i);
    Array.isArray(u) && (u = u.map((c) => sr(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(r, ["generationConfig"], iA(e, a, r)), r;
}
function mu(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = me(i);
    Array.isArray(u) && (u = u.map((c) => rn(c))), l(r, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(r, ["generationConfig"], sA(e, a, r)), r;
}
function gu(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["candidates"]);
  if (o != null) {
    let h = o;
    Array.isArray(h) && (h = h.map((f) => Rv(f))), l(n, ["candidates"], h);
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
function _u(e, t) {
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
function aA(e, t, n) {
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
function lA(e, t, n) {
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
  const S = s(e, ["addWatermark"]);
  t !== void 0 && S != null && l(t, ["parameters", "addWatermark"], S);
  const w = s(e, ["labels"]);
  t !== void 0 && w != null && l(t, ["labels"], w);
  const b = s(e, ["imageSize"]);
  t !== void 0 && b != null && l(t, ["parameters", "sampleImageSize"], b);
  const P = s(e, ["enhancePrompt"]);
  return t !== void 0 && P != null && l(t, ["parameters", "enhancePrompt"], P), r;
}
function uA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && aA(a, r), r;
}
function cA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && lA(a, r), r;
}
function dA(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => EA(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], jd(i)), n;
}
function fA(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => Co(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], ef(i)), n;
}
function hA(e, t, n) {
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
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Io(f));
  const p = s(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => _T(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (s(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (s(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = s(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), r;
}
function pA(e, t, n) {
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
  const S = s(e, ["referenceImages"]);
  if (t !== void 0 && S != null) {
    let k = S;
    Array.isArray(k) && (k = k.map((E) => yT(E))), l(t, ["instances[0]", "referenceImages"], k);
  }
  const w = s(e, ["mask"]);
  t !== void 0 && w != null && l(t, ["instances[0]", "mask"], gT(w));
  const b = s(e, ["compressionQuality"]);
  t !== void 0 && b != null && l(t, ["parameters", "compressionQuality"], b);
  const P = s(e, ["labels"]);
  if (t !== void 0 && P != null && l(t, ["labels"], P), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return r;
}
function mA(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], vA(u)), n;
}
function gA(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["metadata"]);
  o != null && l(n, ["metadata"], o);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response"]);
  return u != null && l(n, ["response"], AA(u)), n;
}
function _A(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], Io(a));
  const u = s(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], nf(u));
  const c = s(t, ["source"]);
  c != null && TA(c, r);
  const d = s(t, ["config"]);
  return d != null && hA(d, r), r;
}
function yA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["prompt"]);
  i != null && l(r, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(r, ["instances[0]", "image"], Be(a));
  const u = s(t, ["video"]);
  u != null && l(r, ["instances[0]", "video"], rf(u));
  const c = s(t, ["source"]);
  c != null && SA(c, r);
  const d = s(t, ["config"]);
  return d != null && pA(d, r), r;
}
function vA(e, t) {
  const n = {}, r = s(e, ["generatedSamples"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => CA(u))), l(n, ["generatedVideos"], a);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function AA(e, t) {
  const n = {}, r = s(e, ["videos"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => IA(u))), l(n, ["generatedVideos"], a);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(n, ["raiMediaFilteredCount"], o);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function TA(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Io(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], nf(a)), r;
}
function SA(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Be(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], rf(a)), r;
}
function EA(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["image"], kA(r));
  const o = s(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const i = s(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], jd(i)), n;
}
function Co(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["image"], Zd(r));
  const o = s(e, ["raiFilteredReason"]);
  o != null && l(n, ["raiFilteredReason"], o);
  const i = s(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], ef(i));
  const a = s(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function wA(e, t) {
  const n = {}, r = s(e, ["_self"]);
  r != null && l(n, ["mask"], Zd(r));
  const o = s(e, ["labels"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["labels"], i);
  }
  return n;
}
function CA(e, t) {
  const n = {}, r = s(e, ["video"]);
  return r != null && l(n, ["video"], pT(r)), n;
}
function IA(e, t) {
  const n = {}, r = s(e, ["_self"]);
  return r != null && l(n, ["video"], mT(r)), n;
}
function bA(e, t) {
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
  const S = s(e, ["routingConfig"]);
  S != null && l(n, ["routingConfig"], S);
  const w = s(e, ["seed"]);
  w != null && l(n, ["seed"], w);
  const b = s(e, ["speechConfig"]);
  b != null && l(n, ["speechConfig"], b);
  const P = s(e, ["stopSequences"]);
  P != null && l(n, ["stopSequences"], P);
  const k = s(e, ["temperature"]);
  k != null && l(n, ["temperature"], k);
  const E = s(e, ["thinkingConfig"]);
  E != null && l(n, ["thinkingConfig"], E);
  const L = s(e, ["topK"]);
  L != null && l(n, ["topK"], L);
  const C = s(e, ["topP"]);
  if (C != null && l(n, ["topP"], C), s(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function RA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], V(e, o)), r;
}
function PA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  return o != null && l(r, ["_url", "name"], V(e, o)), r;
}
function MA(e, t) {
  const n = {}, r = s(e, ["authConfig"]);
  r != null && l(n, ["authConfig"], Iv(r));
  const o = s(e, ["enableWidget"]);
  return o != null && l(n, ["enableWidget"], o), n;
}
function xA(e, t) {
  const n = {}, r = s(e, ["searchTypes"]);
  if (r != null && l(n, ["searchTypes"], r), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(n, ["timeRangeFilter"], o), n;
}
function NA(e, t) {
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
function DA(e, t) {
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
function kA(e, t) {
  const n = {}, r = s(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], mt(r));
  const o = s(e, ["mimeType"]);
  return o != null && l(n, ["mimeType"], o), n;
}
function Zd(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], mt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Io(e, t) {
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
function $A(e, t, n, r) {
  const o = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], Hd(e, c)), o;
}
function LA(e, t, n, r) {
  const o = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], Hd(e, c)), o;
}
function UA(e, t, n) {
  const r = {}, o = s(t, ["config"]);
  return o != null && $A(e, o, r), r;
}
function FA(e, t, n) {
  const r = {}, o = s(t, ["config"]);
  return o != null && LA(e, o, r), r;
}
function GA(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = Vd(i);
    Array.isArray(a) && (a = a.map((u) => Mi(u))), l(n, ["models"], a);
  }
  return n;
}
function OA(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = Vd(i);
    Array.isArray(a) && (a = a.map((u) => xi(u))), l(n, ["models"], a);
  }
  return n;
}
function BA(e, t) {
  const n = {}, r = s(e, ["maskMode"]);
  r != null && l(n, ["maskMode"], r);
  const o = s(e, ["segmentationClasses"]);
  o != null && l(n, ["maskClasses"], o);
  const i = s(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function Mi(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const o = s(e, ["displayName"]);
  o != null && l(n, ["displayName"], o);
  const i = s(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = s(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = s(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], iT(u));
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
function xi(e, t) {
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
    Array.isArray(p) && (p = p.map((m) => eA(m))), l(n, ["endpoints"], p);
  }
  const c = s(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = s(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], sT(d));
  const h = s(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = s(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function qA(e, t) {
  const n = {}, r = s(e, ["mediaResolution"]);
  r != null && l(n, ["mediaResolution"], r);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(n, ["codeExecutionResult"], o);
  const i = s(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = s(e, ["fileData"]);
  a != null && l(n, ["fileData"], tA(a));
  const u = s(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], nA(u));
  const c = s(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = s(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], bv(d));
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
function HA(e, t) {
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
function VA(e, t) {
  const n = {}, r = s(e, ["productImage"]);
  return r != null && l(n, ["image"], Be(r)), n;
}
function JA(e, t, n) {
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
function KA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["source"]);
  i != null && zA(i, r);
  const a = s(t, ["config"]);
  return a != null && JA(a, r), r;
}
function WA(e, t) {
  const n = {}, r = s(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => Co(i))), l(n, ["generatedImages"], o);
  }
  return n;
}
function zA(e, t, n) {
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
    Array.isArray(u) && (u = u.map((c) => VA(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return r;
}
function YA(e, t) {
  const n = {}, r = s(e, ["referenceImage"]);
  r != null && l(n, ["referenceImage"], Be(r));
  const o = s(e, ["referenceId"]);
  o != null && l(n, ["referenceId"], o);
  const i = s(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const a = s(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], BA(a));
  const u = s(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], kv(u));
  const c = s(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = s(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function jd(e, t) {
  const n = {}, r = s(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = s(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function ef(e, t) {
  const n = {}, r = s(e, ["safetyAttributes", "categories"]);
  r != null && l(n, ["categories"], r);
  const o = s(e, ["safetyAttributes", "scores"]);
  o != null && l(n, ["scores"], o);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function XA(e, t) {
  const n = {}, r = s(e, ["category"]);
  if (r != null && l(n, ["category"], r), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(n, ["threshold"], o), n;
}
function QA(e, t) {
  const n = {}, r = s(e, ["image"]);
  return r != null && l(n, ["image"], Be(r)), n;
}
function ZA(e, t, n) {
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
function jA(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["source"]);
  i != null && tT(i, r);
  const a = s(t, ["config"]);
  return a != null && ZA(a, r), r;
}
function eT(e, t) {
  const n = {}, r = s(e, ["predictions"]);
  if (r != null) {
    let o = r;
    Array.isArray(o) && (o = o.map((i) => wA(i))), l(n, ["generatedMasks"], o);
  }
  return n;
}
function tT(e, t, n) {
  const r = {}, o = s(e, ["prompt"]);
  t !== void 0 && o != null && l(t, ["instances[0]", "prompt"], o);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Be(i));
  const a = s(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], QA(a)), r;
}
function nT(e, t) {
  const n = {}, r = s(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = s(e, ["functionCallingConfig"]);
  o != null && l(n, ["functionCallingConfig"], rA(o));
  const i = s(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function rT(e, t) {
  const n = {}, r = s(e, ["retrievalConfig"]);
  r != null && l(n, ["retrievalConfig"], r);
  const o = s(e, ["functionCallingConfig"]);
  if (o != null && l(n, ["functionCallingConfig"], o), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function oT(e, t) {
  const n = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const r = s(e, ["computerUse"]);
  r != null && l(n, ["computerUse"], r);
  const o = s(e, ["fileSearch"]);
  o != null && l(n, ["fileSearch"], o);
  const i = s(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], xA(i));
  const a = s(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], MA(a));
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
function tf(e, t) {
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
    Array.isArray(m) && (m = m.map((g) => oA(g))), l(n, ["functionDeclarations"], m);
  }
  const h = s(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = s(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = s(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function iT(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function sT(e, t) {
  const n = {}, r = s(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["createTime"]);
  o != null && l(n, ["createTime"], o);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function aT(e, t, n) {
  const r = {}, o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function lT(e, t, n) {
  const r = {}, o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), r;
}
function uT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "name"], V(e, o));
  const i = s(t, ["config"]);
  return i != null && aT(i, r), r;
}
function cT(e, t, n) {
  const r = {}, o = s(t, ["model"]);
  o != null && l(r, ["_url", "model"], V(e, o));
  const i = s(t, ["config"]);
  return i != null && lT(i, r), r;
}
function dT(e, t, n) {
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
function fT(e, t, n) {
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
  return u != null && dT(u, r), r;
}
function hT(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["predictions"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Co(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function pT(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["encodedVideo"]);
  o != null && l(n, ["videoBytes"], mt(o));
  const i = s(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function mT(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["videoBytes"], mt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function gT(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["_self"], Be(r));
  const o = s(e, ["maskMode"]);
  return o != null && l(n, ["maskMode"], o), n;
}
function _T(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["image"], Io(r));
  const o = s(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function yT(e, t) {
  const n = {}, r = s(e, ["image"]);
  r != null && l(n, ["image"], Be(r));
  const o = s(e, ["referenceType"]);
  return o != null && l(n, ["referenceType"], o), n;
}
function nf(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["uri"], r);
  const o = s(e, ["videoBytes"]);
  o != null && l(n, ["encodedVideo"], mt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function rf(e, t) {
  const n = {}, r = s(e, ["uri"]);
  r != null && l(n, ["gcsUri"], r);
  const o = s(e, ["videoBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], mt(o));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function vT(e, t) {
  const n = {}, r = s(e, ["displayName"]);
  return t !== void 0 && r != null && l(t, ["displayName"], r), n;
}
function AT(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && vT(n, t), t;
}
function TT(e, t) {
  const n = {}, r = s(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function ST(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = s(e, ["config"]);
  return r != null && TT(r, t), t;
}
function ET(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function wT(e, t) {
  const n = {}, r = s(e, ["customMetadata"]);
  if (t !== void 0 && r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["customMetadata"], i);
  }
  const o = s(e, ["chunkingConfig"]);
  return t !== void 0 && o != null && l(t, ["chunkingConfig"], o), n;
}
function CT(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const r = s(e, ["metadata"]);
  r != null && l(t, ["metadata"], r);
  const o = s(e, ["done"]);
  o != null && l(t, ["done"], o);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], bT(a)), t;
}
function IT(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = s(e, ["fileName"]);
  r != null && l(t, ["fileName"], r);
  const o = s(e, ["config"]);
  return o != null && wT(o, t), t;
}
function bT(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const r = s(e, ["parent"]);
  r != null && l(t, ["parent"], r);
  const o = s(e, ["documentName"]);
  return o != null && l(t, ["documentName"], o), t;
}
function RT(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function PT(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && RT(n, t), t;
}
function MT(e) {
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
function of(e, t) {
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
function xT(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const r = s(e, ["config"]);
  return r != null && of(r, t), t;
}
function NT(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var DT = "Content-Type", kT = "X-Server-Timeout", $T = "User-Agent", Ni = "x-goog-api-client", LT = "google-genai-sdk/1.50.1", UT = "v1beta1", FT = "v1beta", GT = /* @__PURE__ */ new Set(["us", "eu"]), OT = 5, BT = [
  408,
  429,
  500,
  502,
  503,
  504
], qT = class {
  constructor(e) {
    var t, n, r;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const o = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (o.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? o.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && GT.has(this.clientOptions.location) ? o.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (o.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), o.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : UT;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), o.apiVersion = (r = this.clientOptions.apiVersion) !== null && r !== void 0 ? r : FT, o.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === Ii.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
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
    return t && t.extraBody !== null && HT(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await yu(r), new bi(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (r) => (await yu(r), this.processStreamResponse(r))).catch((r) => {
      throw r instanceof Error ? r : new Error(JSON.stringify(r));
    });
  }
  processStreamResponse(e) {
    return Ge(this, arguments, function* () {
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
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, y = g.code, S = `got status: ${_}. ${JSON.stringify(m)}`;
              if (y >= 400 && y < 600) throw new Xd({
                message: S,
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
                yield yield B(new bi(new Response(_, {
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
      throw BT.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new Va.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, Va.default)(o, { retries: ((n = r.attempts) !== null && n !== void 0 ? n : OT) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = LT + " " + this.clientOptions.userAgentExtra;
    return e[$T] = t, e[Ni] = t, e[DT] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [r, o] of Object.entries(e.headers)) n.append(r, o);
      e.timeout && e.timeout > 0 && n.append(kT, String(Math.ceil(e.timeout / 1e3)));
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
    n != null && of(n, h);
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
async function yu(e) {
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
    throw n >= 400 && n < 600 ? new Xd({
      message: o,
      status: n
    }) : new Error(o);
  }
}
function HT(e, t) {
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
var VT = "mcp_used/unknown", JT = !1;
function sf(e) {
  for (const t of e)
    if (KT(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return JT;
}
function af(e) {
  var t;
  e[Ni] = (((t = e[Ni]) !== null && t !== void 0 ? t : "") + ` ${VT}`).trimStart();
}
function KT(e) {
  return e !== null && typeof e == "object" && e instanceof zT;
}
function WT(e) {
  return Ge(this, arguments, function* (n, r = 100) {
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
var zT = class lf {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new lf(t, n);
  }
  async initialize() {
    var t, n, r, o;
    if (this.mcpTools.length > 0) return;
    const i = {}, a = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, Oe(WT(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
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
    return await this.initialize(), l_(this.mcpTools, this.config);
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
async function YT(e, t, n) {
  const r = new jg();
  let o;
  n.data instanceof Blob ? o = JSON.parse(await n.data.text()) : o = JSON.parse(n.data), Object.assign(r, o), t(r);
}
var XT = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const r = this.apiClient.getWebsocketBaseUrl(), o = this.apiClient.getApiVersion(), i = jT(this.apiClient.getDefaultHeaders()), a = `${r}/ws/google.ai.generativelanguage.${o}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        YT(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(a, ZT(i), p);
    m.connect(), await c;
    const g = { setup: { model: V(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new QT(m, this.apiClient);
  }
}, QT = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = pv(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = hv(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(Vt.PLAY);
  }
  pause() {
    this.sendPlaybackControl(Vt.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(Vt.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(Vt.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function ZT(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function jT(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var eS = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function tS(e, t, n) {
  const r = new Zg();
  let o;
  n.data instanceof Blob ? o = await n.data.text() : n.data instanceof ArrayBuffer ? o = new TextDecoder().decode(n.data) : o = n.data;
  const i = JSON.parse(o);
  if (e.isVertexAI()) {
    const a = _v(i);
    Object.assign(r, a);
  } else Object.assign(r, i);
  t(r);
}
var nS = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new XT(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, r, o, i, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && sf(e.config.tools) && af(h);
    const f = sS(h);
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
    }, y = this.apiClient, S = {
      onopen: _,
      onmessage: (C) => {
        tS(y, g.onmessage, C);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(C) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(C) {
      }
    }, w = this.webSocketFactory.create(d, iS(f), S);
    w.connect(), await m;
    let b = V(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && b.startsWith("publishers/")) {
      const C = this.apiClient.getProject(), M = this.apiClient.getLocation();
      C && M && (b = `projects/${C}/locations/${M}/` + b);
    }
    let P = {};
    this.apiClient.isVertexAI() && ((r = e.config) === null || r === void 0 ? void 0 : r.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [to.AUDIO] } : e.config.responseModalities = [to.AUDIO]), !((o = e.config) === null || o === void 0) && o.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const k = (a = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : [], E = [];
    for (const C of k) if (this.isCallableTool(C)) {
      const M = C;
      E.push(await M.tool());
    } else E.push(C);
    E.length > 0 && (e.config.tools = E);
    const L = {
      model: b,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? P = fv(this.apiClient, L) : P = dv(this.apiClient, L), delete P.config, w.send(JSON.stringify(P)), new oS(w, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, rS = { turnComplete: !0 }, oS = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = me(t.turns), e.isVertexAI() || (n = n.map((r) => sr(r)));
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
      if (!e.isVertexAI() && !("id" in r)) throw new Error(eS);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, rS), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: gv(e) } : t = { realtimeInput: mv(e) }, this.conn.send(JSON.stringify(t));
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
function iS(e) {
  const t = {};
  return e.forEach((n, r) => {
    t[r] = n;
  }), t;
}
function sS(e) {
  const t = new Headers();
  for (const [n, r] of Object.entries(e)) t.append(n, r);
  return t;
}
var vu = 10;
function Au(e) {
  var t, n, r;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let o = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (Qt(a)) {
    o = !0;
    break;
  }
  if (!o) return !0;
  const i = (r = e?.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function Qt(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function aS(e) {
  var t, n, r;
  return (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((o) => Qt(o))) !== null && r !== void 0 ? r : !1;
}
function Tu(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((r, o) => {
    if (Qt(r)) return;
    const i = r;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(o);
  }), n;
}
function Su(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var lS = class extends tt {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = me(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = me(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const r = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: no.EMBED_CONTENT
        });
        return await this.embedContentInternal(r);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: no.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, r, o, i, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !aS(t) || Au(t.config)) return await this.generateContentInternal(u);
      const c = Tu(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, h;
      const f = me(u.contents), p = (o = (r = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || r === void 0 ? void 0 : r.maximumRemoteCalls) !== null && o !== void 0 ? o : vu;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const y of (a = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : []) if (Qt(y)) {
          const S = await y.callTool(d.functionCalls);
          _.push(...S);
        }
        m++, h = {
          role: "user",
          parts: _
        }, u.contents = me(u.contents), u.contents.push(g), u.contents.push(h), Su(u.config) && (f.push(g), f.push(h));
      }
      return Su(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, r, o, i, a;
      if (this.maybeMoveToResponseJsonSchem(t), Au(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = Tu(t);
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
      return new xt(et.PAGED_ITEM_MODELS, (o) => this.listInternal(o), await this.listInternal(r), r);
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
    const i = await Promise.all(o.map(async (u) => Qt(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (a.config.tools = i, e.config && e.config.tools && sf(e.config.tools)) {
      const u = (r = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && r !== void 0 ? r : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), af(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, r;
    const o = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (Qt(i)) {
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
    const o = (r = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && r !== void 0 ? r : vu;
    let i = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return Ge(this, arguments, function* () {
        for (var f, p, m, g, _, y; a < o; ) {
          i && (a++, i = !1);
          const P = yield B(c.processParamsMaybeAddMcpUsage(h)), k = yield B(c.generateContentStreamInternal(P)), E = [], L = [];
          try {
            for (var S = !0, w = (p = void 0, Oe(k)), b; b = yield B(w.next()), f = b.done, !f; S = !0) {
              g = b.value, S = !1;
              const C = g;
              if (yield yield B(C), C.candidates && (!((_ = C.candidates[0]) === null || _ === void 0) && _.content)) {
                L.push(C.candidates[0].content);
                for (const M of (y = C.candidates[0].content.parts) !== null && y !== void 0 ? y : []) if (a < o && M.functionCall) {
                  if (!M.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(M.functionCall.name)) {
                    const F = yield B(d.get(M.functionCall.name).callTool([M.functionCall]));
                    E.push(...F);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${M.functionCall.name}`);
                }
              }
            }
          } catch (C) {
            p = { error: C };
          } finally {
            try {
              !S && !f && (m = w.return) && (yield B(m.call(w)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (E.length > 0) {
            i = !0;
            const C = new Sn();
            C.candidates = [{ content: {
              role: "user",
              parts: E
            } }], yield yield B(C);
            const M = [];
            M.push(...L), M.push({
              role: "user",
              parts: E
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
      const c = mu(this.apiClient, e);
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
        const h = _u(d), f = new Sn();
        return Object.assign(f, h), f;
      });
    } else {
      const c = pu(this.apiClient, e);
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
        const h = gu(d), f = new Sn();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = mu(this.apiClient, e);
      return a = x("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return Ge(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = Oe(d), y; y = yield B(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const S = m, w = _u(yield B(S.json()), e);
              w.sdkHttpResponse = { headers: S.headers };
              const b = new Sn();
              Object.assign(b, w), yield yield B(b);
            }
          } catch (S) {
            f = { error: S };
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
      const c = pu(this.apiClient, e);
      return a = x("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }), i.then(function(d) {
        return Ge(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = Oe(d), y; y = yield B(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const S = m, w = gu(yield B(S.json()), e);
              w.sdkHttpResponse = { headers: S.headers };
              const b = new Sn();
              Object.assign(b, w), yield yield B(b);
            }
          } catch (S) {
            f = { error: S };
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
      const c = Qv(this.apiClient, e, e);
      return a = x(c_(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = jv(d, e), f = new zl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Xv(this.apiClient, e);
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
        const h = Zv(d), f = new zl();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = cA(this.apiClient, e);
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
        const h = fA(d), f = new Yl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = uA(this.apiClient, e);
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
        const h = dA(d), f = new Yl();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = Kv(this.apiClient, e);
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
        const c = Wv(u), d = new Gg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = fT(this.apiClient, e);
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
        const c = hT(u), d = new Og();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = KA(this.apiClient, e);
      return o = x("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = WA(u), d = new Bg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = jA(this.apiClient, e);
      return o = x("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = eT(u), d = new qg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = PA(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => xi(d));
    } else {
      const c = RA(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Mi(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = FA(this.apiClient, e);
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
        const h = OA(d), f = new Xl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = UA(this.apiClient, e);
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
        const h = GA(d), f = new Xl();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = cT(this.apiClient, e);
      return a = x("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => xi(d));
    } else {
      const c = uT(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => Mi(d));
    }
  }
  async delete(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = qv(this.apiClient, e);
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
        const h = Vv(d), f = new Ql();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Bv(this.apiClient, e);
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
        const h = Hv(d), f = new Ql();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Fv(this.apiClient, e);
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
        const h = Ov(d), f = new Zl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Uv(this.apiClient, e);
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
        const h = Gv(d), f = new Zl();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = Mv(this.apiClient, e);
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
        const c = xv(u), d = new Hg();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = yA(this.apiClient, e);
      return a = x("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = gA(d), f = new jl();
        return Object.assign(f, h), f;
      });
    } else {
      const c = _A(this.apiClient, e);
      return a = x("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (r = e.config) === null || r === void 0 ? void 0 : r.httpOptions,
        abortSignal: (o = e.config) === null || o === void 0 ? void 0 : o.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = mA(d), f = new jl();
        return Object.assign(f, h), f;
      });
    }
  }
}, uS = class extends tt {
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
      const c = Dg(e);
      return a = x("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = Ng(e);
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
      const a = Cg(e);
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
function Eu(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function cS(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function dS(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function fS(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((i) => TS(i))), l(t, ["parts"], o);
  }
  const r = s(e, ["role"]);
  return r != null && l(t, ["role"], r), t;
}
function hS(e, t, n) {
  const r = {}, o = s(t, ["expireTime"]);
  n !== void 0 && o != null && l(n, ["expireTime"], o);
  const i = s(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const a = s(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = s(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], AS(e, u));
  const c = s(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), r;
}
function pS(e, t) {
  const n = {}, r = s(t, ["config"]);
  return r != null && l(n, ["config"], hS(e, r, n)), n;
}
function mS(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function gS(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const r = s(e, ["args"]);
  r != null && l(t, ["args"], r);
  const o = s(e, ["name"]);
  if (o != null && l(t, ["name"], o), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function _S(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], cS(n));
  const r = s(e, ["enableWidget"]);
  return r != null && l(t, ["enableWidget"], r), t;
}
function yS(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(t, ["timeRangeFilter"], r), t;
}
function vS(e, t) {
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
  ], Is(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], fS(re(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let C = tn(_);
    Array.isArray(C) && (C = C.map((M) => wS(en(M)))), l(t, ["setup", "tools"], C);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], ES(y));
  const S = s(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], Eu(S));
  const w = s(e, ["outputAudioTranscription"]);
  t !== void 0 && w != null && l(t, ["setup", "outputAudioTranscription"], Eu(w));
  const b = s(e, ["realtimeInputConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "realtimeInputConfig"], b);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const k = s(e, ["proactivity"]);
  if (t !== void 0 && k != null && l(t, ["setup", "proactivity"], k), s(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const E = s(e, ["avatarConfig"]);
  t !== void 0 && E != null && l(t, ["setup", "avatarConfig"], E);
  const L = s(e, ["safetySettings"]);
  if (t !== void 0 && L != null) {
    let C = L;
    Array.isArray(C) && (C = C.map((M) => SS(M))), l(t, ["setup", "safetySettings"], C);
  }
  return n;
}
function AS(e, t) {
  const n = {}, r = s(t, ["model"]);
  r != null && l(n, ["setup", "model"], V(e, r));
  const o = s(t, ["config"]);
  return o != null && l(n, ["config"], vS(o, n)), n;
}
function TS(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(t, ["codeExecutionResult"], r);
  const o = s(e, ["executableCode"]);
  o != null && l(t, ["executableCode"], o);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], mS(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], gS(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], dS(c));
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
function SS(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(t, ["threshold"], r), t;
}
function ES(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function wS(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const r = s(e, ["fileSearch"]);
  r != null && l(t, ["fileSearch"], r);
  const o = s(e, ["googleSearch"]);
  o != null && l(t, ["googleSearch"], yS(o));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], _S(i));
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
function CS(e) {
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
function IS(e, t) {
  let n = null;
  const r = e.bidiGenerateContentSetup;
  if (typeof r == "object" && r !== null && "setup" in r) {
    const i = r.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else r !== void 0 && delete e.bidiGenerateContentSetup;
  const o = e.fieldMask;
  if (n) {
    const i = CS(n);
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
var bS = class extends tt {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = pS(this.apiClient, e);
      o = x("auth_tokens", a._url), i = a._query, delete a.config, delete a._url, delete a._query;
      const u = IS(a, e.config);
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
function RS(e, t) {
  const n = {}, r = s(e, ["force"]);
  return t !== void 0 && r != null && l(t, ["_query", "force"], r), n;
}
function PS(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const r = s(e, ["config"]);
  return r != null && RS(r, t), t;
}
function MS(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function xS(e, t) {
  const n = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const o = s(e, ["pageToken"]);
  return t !== void 0 && o != null && l(t, ["_query", "pageToken"], o), n;
}
function NS(e) {
  const t = {}, n = s(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const r = s(e, ["config"]);
  return r != null && xS(r, t), t;
}
function DS(e) {
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
var kS = class extends tt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new xt(et.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = MS(e);
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
      const i = PS(e);
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
      const a = NS(e);
      return o = x("{parent}/documents", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = DS(u), d = new Vg();
        return Object.assign(d, c), d;
      });
    }
  }
}, $S = class extends tt {
  constructor(e, t = new kS(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new xt(et.PAGED_ITEM_FILE_SEARCH_STORES, (r) => this.listInternal(r), await this.listInternal(n), n);
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
      const a = AT(e);
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
      const a = ET(e);
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
      const i = ST(e);
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
      const a = PT(e);
      return o = x("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = MT(u), d = new Jg();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = xT(e);
      return o = x("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = NT(u), d = new Kg();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = IT(e);
      return o = x("{file_search_store_name}:importFile", a._url), i = a._query, delete a._url, delete a._query, r = this.apiClient.request({
        path: o,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), r.then((u) => {
        const c = CT(u), d = new Wg();
        return Object.assign(d, c), d;
      });
    }
  }
}, uf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return uf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
}, LS = () => uf();
function Di(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ki = (e) => {
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
}, Ne = class $i extends Me {
  constructor(t, n, r, o) {
    super(`${$i.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.error = n;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new bo({
      message: r,
      cause: ki(n)
    });
    const i = n;
    return t === 400 ? new df(t, i, r, o) : t === 401 ? new ff(t, i, r, o) : t === 403 ? new hf(t, i, r, o) : t === 404 ? new pf(t, i, r, o) : t === 409 ? new mf(t, i, r, o) : t === 422 ? new gf(t, i, r, o) : t === 429 ? new _f(t, i, r, o) : t >= 500 ? new yf(t, i, r, o) : new $i(t, i, r, o);
  }
}, Li = class extends Ne {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, bo = class extends Ne {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, cf = class extends bo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, df = class extends Ne {
}, ff = class extends Ne {
}, hf = class extends Ne {
}, pf = class extends Ne {
}, mf = class extends Ne {
}, gf = class extends Ne {
}, _f = class extends Ne {
}, yf = class extends Ne {
}, US = /^[a-z][a-z0-9+.-]*:/i, FS = (e) => US.test(e), Ui = (e) => (Ui = Array.isArray, Ui(e)), wu = Ui;
function Cu(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function GS(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var OS = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new Me(`${e} must be an integer`);
  if (t < 0) throw new Me(`${e} must be a positive integer`);
  return t;
}, BS = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, qS = (e) => new Promise((t) => setTimeout(t, e));
function HS() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function vf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function VS(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return vf({
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
function Af(e) {
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
async function JS(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const r = e.getReader(), o = r.cancel();
  r.releaseLock(), await o;
}
var KS = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function WS(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new Me(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var zS = "0.0.1", Tf = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Qo(e, t, n) {
  return Tf(), new File(e, t ?? "unknown_file", n);
}
function YS(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var XS = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Sf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", QS = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Sf(e), ZS = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function jS(e, t, n) {
  if (Tf(), e = await e, QS(e))
    return e instanceof File ? e : Qo([await e.arrayBuffer()], e.name);
  if (ZS(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Qo(await Fi(o), t, n);
  }
  const r = await Fi(e);
  if (t || (t = YS(e)), !n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = Object.assign(Object.assign({}, n), { type: o }));
  }
  return Qo(r, t, n);
}
async function Fi(e) {
  var t, n, r, o, i;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (Sf(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (XS(e)) try {
    for (var u = !0, c = Oe(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      o = d.value, u = !1;
      const h = o;
      a.push(...await Fi(h));
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
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${eE(e)}`);
  }
  return a;
}
function eE(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var bs = class {
  constructor(e) {
    this._client = e;
  }
};
bs._key = [];
function Ef(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Iu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), tE = (e = Ef) => (function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    var m, g, _;
    /[?#]/.test(f) && (o = !0);
    const y = r[p];
    let S = (o ? encodeURIComponent : e)("" + y);
    return p !== r.length && (y == null || typeof y == "object" && y.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = y.hasOwnProperty) !== null && m !== void 0 ? m : Iu)) !== null && g !== void 0 ? g : Iu)) === null || _ === void 0 ? void 0 : _.toString)) && (S = y + "", i.push({
      start: h.length + f.length,
      length: S.length,
      error: `Value of type ${Object.prototype.toString.call(y).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === r.length ? "" : S);
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
}), $e = /* @__PURE__ */ tE(Ef), wf = class extends bs {
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
wf._key = Object.freeze(["interactions"]);
var Cf = class extends wf {
}, If = class extends bs {
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
If._key = Object.freeze(["webhooks"]);
var bf = class extends If {
};
function nE(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var Mr;
function Rs(e) {
  let t;
  return (Mr ?? (t = new globalThis.TextEncoder(), Mr = t.encode.bind(t)))(e);
}
var xr;
function bu(e) {
  let t;
  return (xr ?? (t = new globalThis.TextDecoder(), xr = t.decode.bind(t)))(e);
}
var Ro = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Rs(e) : e;
    this.buffer = nE([this.buffer, n]);
    const r = [];
    let o;
    for (; (o = rE(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (o.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = o.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (o.index !== this.carriageReturnIndex + 1 || o.carriage)) {
        r.push(bu(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? o.preceding - 1 : o.preceding, a = bu(this.buffer.subarray(0, i));
      r.push(a), this.buffer = this.buffer.subarray(o.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), r;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Ro.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Ro.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function rE(e, t) {
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
var oo = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Ru = (e, t, n) => {
  if (e) {
    if (GS(oo, e)) return e;
    de(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(oo))}`);
  }
};
function Rn() {
}
function Nr(e, t, n) {
  return !t || oo[e] > oo[n] ? Rn : t[e].bind(t);
}
var oE = {
  error: Rn,
  warn: Rn,
  info: Rn,
  debug: Rn
}, Pu = /* @__PURE__ */ new WeakMap();
function de(e) {
  var t;
  const n = e.logger, r = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return oE;
  const o = Pu.get(n);
  if (o && o[0] === r) return o[1];
  const i = {
    error: Nr("error", n, r),
    warn: Nr("warn", n, r),
    info: Nr("info", n, r),
    debug: Nr("debug", n, r)
  };
  return Pu.set(n, [r, i]), i;
}
var Tt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), iE = class Pn {
  constructor(t, n, r) {
    this.iterator = t, this.controller = n, this.client = r;
  }
  static fromSSEResponse(t, n, r) {
    let o = !1;
    const i = r ? de(r) : console;
    function a() {
      return Ge(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new Me("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Oe(sE(t, n)), _; _ = yield B(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const y = f;
              if (!p)
                if (y.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield B(JSON.parse(y.data));
                } catch (S) {
                  throw i.error("Could not parse message into JSON:", y.data), i.error("From chunk:", y.raw), S;
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
          if (Di(y)) return yield B(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Pn(a, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    function i() {
      return Ge(this, arguments, function* () {
        var c, d, h, f;
        const p = new Ro(), m = Af(t);
        try {
          for (var g = !0, _ = Oe(m), y; y = yield B(_.next()), c = y.done, !c; g = !0) {
            f = y.value, g = !1;
            const S = f;
            for (const w of p.decode(S)) yield yield B(w);
          }
        } catch (S) {
          d = { error: S };
        } finally {
          try {
            !g && !c && (h = _.return) && (yield B(h.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const S of p.flush()) yield yield B(S);
      });
    }
    function a() {
      return Ge(this, arguments, function* () {
        var c, d, h, f;
        if (o) throw new Me("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        o = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Oe(i()), _; _ = yield B(g.next()), c = _.done, !c; m = !0) {
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
          if (Di(y)) return yield B(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Pn(a, n, r);
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
    return [new Pn(() => o(t), this.controller, this.client), new Pn(() => o(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return vf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = Rs(JSON.stringify(o) + `
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
function sE(e, t) {
  return Ge(this, arguments, function* () {
    var r, o, i, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new Me("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new Me("Attempted to iterate over a response with no body");
    const u = new lE(), c = new Ro(), d = Af(e.body);
    try {
      for (var h = !0, f = Oe(aE(d)), p; p = yield B(f.next()), r = p.done, !r; h = !0) {
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
function aE(e) {
  return Ge(this, arguments, function* () {
    var n, r, o, i;
    try {
      for (var a = !0, u = Oe(e), c; c = yield B(u.next()), n = c.done, !n; a = !0) {
        i = c.value, a = !1;
        const d = i;
        d != null && (yield yield B(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? Rs(d) : d));
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
var lE = class {
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
    let [t, n, r] = uE(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function uE(e, t) {
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
async function cE(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return de(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : iE.fromSSEResponse(n, t.controller, e);
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
var dE = class Rf extends Promise {
  constructor(t, n, r = cE) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, this.client = t;
  }
  _thenUnwrap(t) {
    return new Rf(this.client, this.responsePromise, async (n, r) => t(await this.parseResponse(n, r), r));
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
}, Pf = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* fE(e) {
  if (!e) return;
  if (Pf in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : wu(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = wu(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var En = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of fE(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [Pf]: !0,
    values: t,
    nulls: n
  };
}, Zo = (e) => {
  var t, n, r, o, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (o = (r = globalThis.Deno.env) === null || r === void 0 ? void 0 : r.get) === null || o === void 0 ? void 0 : o.call(r, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, Mf, xf = class Nf {
  constructor(t) {
    var n, r, o, i, a, u, c, { baseURL: d = Zo("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = Zo("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = ft(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (r = m.timeout) !== null && r !== void 0 ? r : Nf.DEFAULT_TIMEOUT, this.logger = (o = m.logger) !== null && o !== void 0 ? o : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (a = (i = Ru(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : Ru(Zo("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : HS(), this.encoder = KS, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = En([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return En([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return En([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return WS(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${zS}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${LS()}`;
  }
  makeStatusError(t, n, r, o) {
    return Ne.generate(t, n, r, o);
  }
  buildURL(t, n, r) {
    const o = !this.baseURLOverridden() && r || this.baseURL, i = FS(t) ? new URL(t) : new URL(o + (o.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!Cu(a) || !Cu(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return new dE(this, this.makeRequest(t, n, void 0));
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
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new Li();
    const _ = new AbortController(), y = await this.fetchWithTimeout(h, d, f, _).catch(ki), S = Date.now();
    if (y instanceof globalThis.Error) {
      const b = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new Li();
      const P = Di(y) || /timed? ?out/i.test(String(y) + ("cause" in y ? String(y.cause) : ""));
      if (n)
        return de(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - ${b}`), de(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (${b})`, Tt({
          retryOfRequestLogID: r,
          url: h,
          durationMs: S - g,
          message: y.message
        })), this.retryRequest(u, n, r ?? p);
      throw de(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - error; no more retries left`), de(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (error; no more retries left)`, Tt({
        retryOfRequestLogID: r,
        url: h,
        durationMs: S - g,
        message: y.message
      })), P ? new cf() : new bo({ cause: y });
    }
    const w = `[${p}${m}] ${d.method} ${h} ${y.ok ? "succeeded" : "failed"} with status ${y.status} in ${S - g}ms`;
    if (!y.ok) {
      const b = await this.shouldRetry(y);
      if (n && b) {
        const C = `retrying, ${n} attempts remaining`;
        return await JS(y.body), de(this).info(`${w} - ${C}`), de(this).debug(`[${p}] response error (${C})`, Tt({
          retryOfRequestLogID: r,
          url: y.url,
          status: y.status,
          headers: y.headers,
          durationMs: S - g
        })), this.retryRequest(u, n, r ?? p, y.headers);
      }
      const P = b ? "error; no more retries left" : "error; not retryable";
      de(this).info(`${w} - ${P}`);
      const k = await y.text().catch((C) => ki(C).message), E = BS(k), L = E ? void 0 : k;
      throw de(this).debug(`[${p}] response error (${P})`, Tt({
        retryOfRequestLogID: r,
        url: y.url,
        status: y.status,
        headers: y.headers,
        message: L,
        durationMs: Date.now() - g
      })), this.makeStatusError(y.status, E, L, y.headers);
    }
    return de(this).info(w), de(this).debug(`[${p}] response start`, Tt({
      retryOfRequestLogID: r,
      url: y.url,
      status: y.status,
      headers: y.headers,
      durationMs: S - g
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
    return await qS(a), this.makeRequest(t, n - 1, r);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var r, o, i;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = a, f = this.buildURL(c, d, h);
    "timeout" in a && OS("timeout", a.timeout), a.timeout = (r = a.timeout) !== null && r !== void 0 ? r : this.timeout;
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
    let u = En([
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
    const r = En([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && r.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: VS(t)
    } : typeof t == "object" && r.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: r
    });
  }
};
xf.DEFAULT_TIMEOUT = 6e4;
var te = class extends xf {
  constructor() {
    super(...arguments), this.interactions = new Cf(this), this.webhooks = new bf(this);
  }
};
Mf = te;
te.GeminiNextGenAPIClient = Mf;
te.GeminiNextGenAPIClientError = Me;
te.APIError = Ne;
te.APIConnectionError = bo;
te.APIConnectionTimeoutError = cf;
te.APIUserAbortError = Li;
te.NotFoundError = pf;
te.ConflictError = mf;
te.RateLimitError = _f;
te.BadRequestError = df;
te.AuthenticationError = ff;
te.InternalServerError = yf;
te.PermissionDeniedError = hf;
te.UnprocessableEntityError = gf;
te.toFile = jS;
te.Interactions = Cf;
te.Webhooks = bf;
function hE(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function pE(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function mE(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function gE(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  return r != null && l(n, ["sdkHttpResponse"], r), n;
}
function _E(e, t, n) {
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
function yE(e, t, n) {
  const r = {};
  let o = s(n, ["config", "method"]);
  if (o === void 0 && (o = "SUPERVISED_FINE_TUNING"), o === "SUPERVISED_FINE_TUNING") {
    const E = s(e, ["validationDataset"]);
    t !== void 0 && E != null && l(t, ["supervisedTuningSpec"], jo(E));
  } else if (o === "PREFERENCE_TUNING") {
    const E = s(e, ["validationDataset"]);
    t !== void 0 && E != null && l(t, ["preferenceOptimizationSpec"], jo(E));
  } else if (o === "DISTILLATION") {
    const E = s(e, ["validationDataset"]);
    t !== void 0 && E != null && l(t, ["distillationSpec"], jo(E));
  }
  const i = s(e, ["tunedModelDisplayName"]);
  t !== void 0 && i != null && l(t, ["tunedModelDisplayName"], i);
  const a = s(e, ["description"]);
  t !== void 0 && a != null && l(t, ["description"], a);
  let u = s(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const E = s(e, ["epochCount"]);
    t !== void 0 && E != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], E);
  } else if (u === "PREFERENCE_TUNING") {
    const E = s(e, ["epochCount"]);
    t !== void 0 && E != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], E);
  } else if (u === "DISTILLATION") {
    const E = s(e, ["epochCount"]);
    t !== void 0 && E != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], E);
  }
  let c = s(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const E = s(e, ["learningRateMultiplier"]);
    t !== void 0 && E != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], E);
  } else if (c === "PREFERENCE_TUNING") {
    const E = s(e, ["learningRateMultiplier"]);
    t !== void 0 && E != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], E);
  } else if (c === "DISTILLATION") {
    const E = s(e, ["learningRateMultiplier"]);
    t !== void 0 && E != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], E);
  }
  let d = s(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const E = s(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && E != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], E);
  } else if (d === "PREFERENCE_TUNING") {
    const E = s(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && E != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], E);
  } else if (d === "DISTILLATION") {
    const E = s(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && E != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], E);
  }
  let h = s(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const E = s(e, ["adapterSize"]);
    t !== void 0 && E != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], E);
  } else if (h === "PREFERENCE_TUNING") {
    const E = s(e, ["adapterSize"]);
    t !== void 0 && E != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], E);
  } else if (h === "DISTILLATION") {
    const E = s(e, ["adapterSize"]);
    t !== void 0 && E != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], E);
  }
  let f = s(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const E = s(e, ["tuningMode"]);
    t !== void 0 && E != null && l(t, ["supervisedTuningSpec", "tuningMode"], E);
  } else if (f === "DISTILLATION") {
    const E = s(e, ["tuningMode"]);
    t !== void 0 && E != null && l(t, ["distillationSpec", "tuningMode"], E);
  }
  const p = s(e, ["customBaseModel"]);
  t !== void 0 && p != null && l(t, ["customBaseModel"], p);
  let m = s(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const E = s(e, ["batchSize"]);
    t !== void 0 && E != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], E);
  } else if (m === "DISTILLATION") {
    const E = s(e, ["batchSize"]);
    t !== void 0 && E != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], E);
  }
  let g = s(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const E = s(e, ["learningRate"]);
    t !== void 0 && E != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], E);
  } else if (g === "DISTILLATION") {
    const E = s(e, ["learningRate"]);
    t !== void 0 && E != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], E);
  }
  const _ = s(e, ["labels"]);
  t !== void 0 && _ != null && l(t, ["labels"], _);
  const y = s(e, ["beta"]);
  t !== void 0 && y != null && l(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], y);
  const S = s(e, ["baseTeacherModel"]);
  t !== void 0 && S != null && l(t, ["distillationSpec", "baseTeacherModel"], S);
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
function vE(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const i = s(e, ["trainingDataset"]);
  i != null && ME(i);
  const a = s(e, ["config"]);
  return a != null && _E(a, n), n;
}
function AE(e, t) {
  const n = {}, r = s(e, ["baseModel"]);
  r != null && l(n, ["baseModel"], r);
  const o = s(e, ["preTunedModel"]);
  o != null && l(n, ["preTunedModel"], o);
  const i = s(e, ["trainingDataset"]);
  i != null && xE(i, n, t);
  const a = s(e, ["config"]);
  return a != null && yE(a, n, t), n;
}
function TE(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function SE(e, t) {
  const n = {}, r = s(e, ["name"]);
  return r != null && l(n, ["_url", "name"], r), n;
}
function EE(e, t, n) {
  const r = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function wE(e, t, n) {
  const r = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), r;
}
function CE(e, t) {
  const n = {}, r = s(e, ["config"]);
  return r != null && EE(r, n), n;
}
function IE(e, t) {
  const n = {}, r = s(e, ["config"]);
  return r != null && wE(r, n), n;
}
function bE(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["nextPageToken"]);
  o != null && l(n, ["nextPageToken"], o);
  const i = s(e, ["tunedModels"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => Df(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function RE(e, t) {
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
function PE(e, t) {
  const n = {}, r = s(e, ["name"]);
  r != null && l(n, ["model"], r);
  const o = s(e, ["name"]);
  return o != null && l(n, ["endpoint"], o), n;
}
function ME(e, t) {
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
function xE(e, t, n) {
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
function Df(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], Bd(i));
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
  return p != null && l(n, ["tunedModel"], PE(p)), n;
}
function Gi(e, t) {
  const n = {}, r = s(e, ["sdkHttpResponse"]);
  r != null && l(n, ["sdkHttpResponse"], r);
  const o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], Bd(i));
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
  const S = s(e, ["distillationSpec"]);
  S != null && l(n, ["distillationSpec"], S);
  const w = s(e, ["tuningDataStats"]);
  w != null && l(n, ["tuningDataStats"], w);
  const b = s(e, ["encryptionSpec"]);
  b != null && l(n, ["encryptionSpec"], b);
  const P = s(e, ["partnerModelTuningSpec"]);
  P != null && l(n, ["partnerModelTuningSpec"], P);
  const k = s(e, ["customBaseModel"]);
  k != null && l(n, ["customBaseModel"], k);
  const E = s(e, ["evaluateDatasetRuns"]);
  if (E != null) {
    let gt = E;
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
function NE(e, t) {
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
function jo(e, t) {
  const n = {}, r = s(e, ["gcsUri"]);
  r != null && l(n, ["validationDatasetUri"], r);
  const o = s(e, ["vertexDatasetResource"]);
  return o != null && l(n, ["validationDatasetUri"], o), n;
}
var DE = class extends tt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new xt(et.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: Ci.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = SE(e);
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
      const c = TE(e);
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
      })), i.then((d) => Df(d));
    }
  }
  async listInternal(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = IE(e);
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
        const h = RE(d), f = new eu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = CE(e);
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
        const h = bE(d), f = new eu();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, r, o;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = pE(e);
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
        const h = gE(d), f = new tu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = hE(e);
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
        const h = mE(d), f = new tu();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let r, o = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = AE(e, e);
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
      const a = vE(e);
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
      })), r.then((u) => NE(u));
    }
  }
}, kE = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, $E = 1024 * 1024 * 8, LE = 3, UE = 1e3, FE = 2, io = "x-goog-upload-status";
async function GE(e, t, n, r) {
  var o;
  const i = await kf(e, t, n, r), a = await i?.json();
  if (((o = i?.headers) === null || o === void 0 ? void 0 : o[io]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function OE(e, t, n, r) {
  var o;
  const i = await kf(e, t, n, r), a = await i?.json();
  if (((o = i?.headers) === null || o === void 0 ? void 0 : o[io]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = Nd(a), c = new e_();
  return Object.assign(c, u), c;
}
async function kf(e, t, n, r) {
  var o, i, a;
  let u = t;
  const c = r?.baseUrl || ((o = n.clientOptions.httpOptions) === null || o === void 0 ? void 0 : o.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, h = 0, f = new bi(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min($E, d - h), g = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, y = UE;
    for (; _ < LE; ) {
      const S = Object.assign(Object.assign({}, r?.headers || {}), {
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
          headers: S
        })
      }), !((i = f?.headers) === null || i === void 0) && i[io]) break;
      _++, await qE(y), y = y * FE;
    }
    if (h += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[io]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function BE(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function qE(e) {
  return new Promise((t) => setTimeout(t, e));
}
var HE = class {
  async upload(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await GE(e, t, n, r);
  }
  async uploadToFileSearchStore(e, t, n, r) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await OE(e, t, n, r);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await BE(e);
  }
}, VE = class {
  create(e, t, n) {
    return new JE(e, t, n);
  }
}, JE = class {
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
}, Mu = "x-goog-api-key", KE = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(Mu) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(Mu, this.apiKey);
    }
  }
}, WE = class {
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
    const n = Eg(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const r = new KE(this.apiKey);
    this.apiClient = new qT({
      auth: r,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new HE(),
      downloader: new kE()
    }), this.models = new lS(this.apiClient), this.live = new nS(this.apiClient, r, new VE()), this.batches = new ry(this.apiClient), this.chats = new By(this.models, this.apiClient), this.caches = new Fy(this.apiClient), this.files = new jy(this.apiClient), this.operations = new uS(this.apiClient), this.authTokens = new bS(this.apiClient), this.tunings = new DE(this.apiClient), this.fileSearchStores = new $S(this.apiClient);
  }
};
function xu(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function so(e) {
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
function zE(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function YE(e) {
  if (typeof e == "string") return [bt(e)];
  if (!Array.isArray(e)) return [bt("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? bt(n.text || "") : n.type === "image_url" && n.image_url?.url ? zE(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [bt("")];
}
function Nu() {
  return {
    role: "user",
    parts: [bt("")]
  };
}
function ar(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = so(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function XE(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function QE(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function Du(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const r = String(e.functionCall.id || "").trim();
  return r ? `id:${r}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function ZE(e, t) {
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
function jE(e = [], t = "") {
  const n = e.map((h) => ar(h, "model")).filter(Boolean);
  if (!n.length) return null;
  const r = [...n].reverse().find((h) => XE(h)) || null, o = [...n].reverse().find((h) => QE(h)) || null, i = r || o || n[n.length - 1], a = n.indexOf(i), u = so(i);
  if (!u?.parts?.length) return n[n.length - 1];
  if (o) {
    const h = /* @__PURE__ */ new Map(), f = [];
    n.forEach((m, g) => {
      m.parts.forEach((_, y) => {
        const S = Du(_, y, g);
        if (!S) return;
        h.has(S) || f.push(S);
        const w = h.get(S);
        w ? h.set(S, ZE(w, _)) : h.set(S, so(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((m, g) => {
      const _ = Du(m, g, a);
      return _ ? (p.add(_), h.get(_) || m) : m;
    }), f.forEach((m) => {
      p.has(m) || (u.parts.push(h.get(m)), p.add(m));
    });
  }
  const c = String(t || ""), d = u.parts.filter((h) => !(typeof h?.text == "string" && !h?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function ku(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((r) => !r?.thought && typeof r?.text == "string" && r.text).map((r) => r.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function $f(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((r) => r?.functionCall || r).filter((r) => r && r.name);
  return t.length ? t : n;
}
function Lf(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function $u(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function ew(e, t) {
  const n = $u(e), r = $u(t);
  return n && r ? JSON.stringify({
    ...n,
    ...r
  }) : String(t || "").trim() || String(e || "{}");
}
function tw(e, t = "google-tool") {
  return $f(e).map((n, r) => {
    const o = String(n.id || "").trim();
    return {
      id: o || `${t}-${r + 1}`,
      name: n.name || "",
      arguments: Lf(n),
      ...o ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function nw(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let r = 0;
  function o(a, u, c, d) {
    return a.name = String(u.name || a.name || "").trim(), a.arguments = ew(a.arguments, d), c && (n.set(c, a), a.id !== c ? a.providerId = c : delete a.providerId), a;
  }
  function i(a) {
    return $f(a).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), h = Lf(u);
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
function rw(e = []) {
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
function ow(e) {
  switch (e) {
    case "high":
      return Hn.HIGH;
    case "medium":
      return Hn.MEDIUM;
    default:
      return Hn.LOW;
  }
}
function Lu(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function iw(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function sw(e) {
  const t = e?.providerPayload?.googleContent;
  return ar(t, "model");
}
function aw(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = sw(e);
    return n ? [n] : [];
  }
  return t.map((n) => ar(n, "model")).filter(Boolean);
}
function Ps(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => ar(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function lw(e) {
  const t = e?.candidates?.[0]?.content;
  return Ps(t ? [t] : []);
}
function uw(e) {
  return Ps(e ? [e] : []);
}
function Uf(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? so(e.history) || [] : [];
}
function cw(e, t = 0) {
  return Uf(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => ar(n, "model")).filter(Boolean);
}
function dw(e) {
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
          response: xu(h.content)
        } }), d += 1;
      }
      r.push({
        role: "user",
        parts: c
      }), a = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = aw(u);
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
          args: xu(c.function.arguments)
        } }))]
      });
      continue;
    }
    r.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: YE(u.content)
    });
  }
  if (!r.length) return {
    history: [],
    latestMessage: Nu().parts
  };
  const i = r[r.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: r.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: r,
    latestMessage: Nu().parts
  };
}
function fw(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Uu(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var hw = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.toolCallResponseSequence = 0, this.client = new WE({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e) {
    const t = dw(e.messages), n = Array.isArray(e.tools) ? e.tools : [], r = iw(e), o = {
      ...r ? { systemInstruction: r } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    if (e.reasoning?.enabled && (o.thinkingConfig = {
      includeThoughts: !0,
      thinkingLevel: ow(e.reasoning.effort)
    }), n.length && (o.tools = [{ functionDeclarations: n.map((i) => ({
      name: i.function.name,
      description: i.function.description,
      parameters: i.function.parameters
    })) }]), n.length) {
      const i = String(e.toolChoice || "auto").trim();
      o.toolConfig = { functionCallingConfig: i === "none" ? { mode: Ht.NONE } : i === "auto" ? { mode: Ht.AUTO } : i === "required" ? { mode: Ht.ANY } : {
        mode: Ht.ANY,
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
    return Zn({
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
    return Zn({
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
    let r, o, i, a = [];
    const u = `google-tool-${++this.toolCallResponseSequence}`, c = nw(u);
    let d = null;
    const h = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, f = {
      ...t,
      ...h ? { config: h } : {}
    }, p = typeof n.onStreamProgress == "function", m = Uf(e).length;
    if (p) {
      const y = await e.sendMessageStream(f), S = /* @__PURE__ */ new Map();
      let w = "", b = null;
      const P = [];
      for await (const k of y) {
        b = k;
        const E = k?.candidates?.[0]?.content;
        E?.parts?.length && P.push(E), Lu(k).forEach((C, M) => {
          const F = `${C.label}:${M}`;
          S.set(F, Uu(S.get(F) || "", C.text));
        }), a = c.append(k);
        const L = ku(k);
        w = Uu(w, L), fw(n, {
          text: w,
          thoughts: Array.from(S.values()).filter(Boolean).map((C, M) => ({
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
      }, d = jE(P, w) || r?.candidates?.[0]?.content || null, o = Array.from(S.values()).filter(Boolean).map((k, E) => ({
        label: `思考块 ${E + 1}`,
        text: k
      })), i = w;
    } else
      r = await e.sendMessage(f), o = Lu(r), i = ku(r);
    const g = p ? a : tw(r, u), _ = cw(e, m);
    return {
      text: i,
      toolCalls: g,
      thoughts: o,
      finishReason: r.candidates?.[0]?.finishReason || "STOP",
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: Ps(_) || uw(d) || lw(r)
    };
  }
  async chat(e) {
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const r = { message: rw(e.toolResponses) };
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
function G(e, t, n, r, o) {
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
var Ff = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Ff = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (r) => (+r ^ n() & 15 >> +r / 4).toString(16));
};
function Oi(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Bi = (e) => {
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
}, le = class qi extends U {
  constructor(t, n, r, o) {
    super(`${qi.makeMessage(t, n, r)}`), this.status = t, this.headers = o, this.requestID = o?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, r) {
    const o = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : r;
    return t && o ? `${t} ${o}` : t ? `${t} status code (no body)` : o || "(no status code or body)";
  }
  static generate(t, n, r, o) {
    if (!t || !o) return new Po({
      message: r,
      cause: Bi(n)
    });
    const i = n?.error;
    return t === 400 ? new Gf(t, i, r, o) : t === 401 ? new Of(t, i, r, o) : t === 403 ? new Bf(t, i, r, o) : t === 404 ? new qf(t, i, r, o) : t === 409 ? new Hf(t, i, r, o) : t === 422 ? new Vf(t, i, r, o) : t === 429 ? new Jf(t, i, r, o) : t >= 500 ? new Kf(t, i, r, o) : new qi(t, i, r, o);
  }
}, Pe = class extends le {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Po = class extends le {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Ms = class extends Po {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Gf = class extends le {
}, Of = class extends le {
}, Bf = class extends le {
}, qf = class extends le {
}, Hf = class extends le {
}, Vf = class extends le {
}, Jf = class extends le {
}, Kf = class extends le {
}, Wf = class extends U {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, zf = class extends U {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Mn = class extends Error {
  constructor(e) {
    super(e);
  }
}, Yf = class extends le {
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
}, pw = class extends U {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, mw = /^[a-z][a-z0-9+.-]*:/i, gw = (e) => mw.test(e), pe = (e) => (pe = Array.isArray, pe(e)), Fu = pe;
function xs(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Gu(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function _w(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function ei(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var yw = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new U(`${e} must be an integer`);
  if (t < 0) throw new U(`${e} must be a positive integer`);
  return t;
}, vw = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, lr = (e) => new Promise((t) => setTimeout(t, e)), Gt = "6.44.0", Aw = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Tw() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Sw = () => {
  const e = Tw();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Gt,
    "X-Stainless-OS": Bu(Deno.build.os),
    "X-Stainless-Arch": Ou(Deno.build.arch),
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
    "X-Stainless-OS": Bu(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Ou(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Ew();
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
function Ew() {
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
var Ou = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Bu = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), qu, ww = () => qu ?? (qu = Sw());
function Xf() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Qf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Zf(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Qf({
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
function jf(e) {
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
async function Hu(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Cw = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), eh = "RFC3986", th = (e) => String(e), Vu = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: th
};
var Hi = (e, t) => (Hi = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Hi(e, t)), qe = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), ti = 1024, Iw = (e, t, n, r, o) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < i.length; u += ti) {
    const c = i.length >= ti ? i.slice(u, u + ti) : i, d = [];
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
function bw(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function Ju(e, t) {
  if (pe(e)) {
    const n = [];
    for (let r = 0; r < e.length; r += 1) n.push(t(e[r]));
    return n;
  }
  return t(e);
}
var nh = {
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
}, rh = function(e, t) {
  Array.prototype.push.apply(e, pe(t) ? t : [t]);
}, Ku, ee = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: Iw,
  encodeValuesOnly: !1,
  format: eh,
  formatter: th,
  indices: !1,
  serializeDate(e) {
    return (Ku ?? (Ku = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function Rw(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var ni = {};
function oh(e, t, n, r, o, i, a, u, c, d, h, f, p, m, g, _, y, S) {
  let w = e, b = S, P = 0, k = !1;
  for (; (b = b.get(ni)) !== void 0 && !k; ) {
    const F = b.get(e);
    if (P += 1, typeof F < "u") {
      if (F === P) throw new RangeError("Cyclic object value");
      k = !0;
    }
    typeof b.get(ni) > "u" && (P = 0);
  }
  if (typeof d == "function" ? w = d(t, w) : w instanceof Date ? w = p?.(w) : n === "comma" && pe(w) && (w = Ju(w, function(F) {
    return F instanceof Date ? p?.(F) : F;
  })), w === null) {
    if (i) return c && !_ ? c(t, ee.encoder, y, "key", m) : t;
    w = "";
  }
  if (Rw(w) || bw(w)) {
    if (c) {
      const F = _ ? t : c(t, ee.encoder, y, "key", m);
      return [g?.(F) + "=" + g?.(c(w, ee.encoder, y, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(w))];
  }
  const E = [];
  if (typeof w > "u") return E;
  let L;
  if (n === "comma" && pe(w))
    _ && c && (w = Ju(w, c)), L = [{ value: w.length > 0 ? w.join(",") || null : void 0 }];
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
    S.set(e, P);
    const K = /* @__PURE__ */ new WeakMap();
    K.set(ni, S), rh(E, oh(ae, J, n, r, o, i, a, u, n === "comma" && _ && pe(w) ? null : c, d, h, f, p, m, g, _, y, K));
  }
  return E;
}
function Pw(e = ee) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || ee.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = eh;
  if (typeof e.format < "u") {
    if (!Hi(Vu, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const r = Vu[n];
  let o = ee.filter;
  (typeof e.filter == "function" || pe(e.filter)) && (o = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in nh ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = ee.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
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
function Mw(e, t = {}) {
  let n = e;
  const r = Pw(t);
  let o, i;
  typeof r.filter == "function" ? (i = r.filter, n = i("", n)) : pe(r.filter) && (i = r.filter, o = i);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = nh[r.arrayFormat], c = u === "comma" && r.commaRoundTrip;
  o || (o = Object.keys(n)), r.sort && o.sort(r.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < o.length; ++p) {
    const m = o[p];
    r.skipNulls && n[m] === null || rh(a, oh(n[m], m, u, c, r.allowEmptyArrays, r.strictNullHandling, r.skipNulls, r.encodeDotInKeys, r.encode ? r.encoder : null, r.filter, r.sort, r.allowDots, r.serializeDate, r.format, r.formatter, r.encodeValuesOnly, r.charset, d));
  }
  const h = a.join(r.delimiter);
  let f = r.addQueryPrefix === !0 ? "?" : "";
  return r.charsetSentinel && (r.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function xw(e) {
  return Mw(e, { arrayFormat: "brackets" });
}
function Nw(e) {
  let t = 0;
  for (const o of e) t += o.length;
  const n = new Uint8Array(t);
  let r = 0;
  for (const o of e)
    n.set(o, r), r += o.length;
  return n;
}
var Wu;
function Ns(e) {
  let t;
  return (Wu ?? (t = new globalThis.TextEncoder(), Wu = t.encode.bind(t)))(e);
}
var zu;
function Yu(e) {
  let t;
  return (zu ?? (t = new globalThis.TextDecoder(), zu = t.decode.bind(t)))(e);
}
var Te, Se, Mo = class {
  constructor() {
    Te.set(this, void 0), Se.set(this, void 0), G(this, Te, new Uint8Array(), "f"), G(this, Se, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Ns(e) : e;
    G(this, Te, Nw([T(this, Te, "f"), t]), "f");
    const n = [];
    let r;
    for (; (r = Dw(T(this, Te, "f"), T(this, Se, "f"))) != null; ) {
      if (r.carriage && T(this, Se, "f") == null) {
        G(this, Se, r.index, "f");
        continue;
      }
      if (T(this, Se, "f") != null && (r.index !== T(this, Se, "f") + 1 || r.carriage)) {
        n.push(Yu(T(this, Te, "f").subarray(0, T(this, Se, "f") - 1))), G(this, Te, T(this, Te, "f").subarray(T(this, Se, "f")), "f"), G(this, Se, null, "f");
        continue;
      }
      const o = T(this, Se, "f") !== null ? r.preceding - 1 : r.preceding, i = Yu(T(this, Te, "f").subarray(0, o));
      n.push(i), G(this, Te, T(this, Te, "f").subarray(r.index), "f"), G(this, Se, null, "f");
    }
    return n;
  }
  flush() {
    return T(this, Te, "f").length ? this.decode(`
`) : [];
  }
};
Te = /* @__PURE__ */ new WeakMap(), Se = /* @__PURE__ */ new WeakMap();
Mo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Mo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Dw(e, t) {
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
function kw(e) {
  for (let r = 0; r < e.length - 1; r++) {
    if (e[r] === 10 && e[r + 1] === 10 || e[r] === 13 && e[r + 1] === 13) return r + 2;
    if (e[r] === 13 && e[r + 1] === 10 && r + 3 < e.length && e[r + 2] === 13 && e[r + 3] === 10) return r + 4;
  }
  return -1;
}
var ao = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Xu = (e, t, n) => {
  if (e) {
    if (_w(ao, e)) return e;
    oe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(ao))}`);
  }
};
function xn() {
}
function Dr(e, t, n) {
  return !t || ao[e] > ao[n] ? xn : t[e].bind(t);
}
var $w = {
  error: xn,
  warn: xn,
  info: xn,
  debug: xn
}, Qu = /* @__PURE__ */ new WeakMap();
function oe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return $w;
  const r = Qu.get(t);
  if (r && r[0] === n) return r[1];
  const o = {
    error: Dr("error", t, n),
    warn: Dr("warn", t, n),
    info: Dr("info", t, n),
    debug: Dr("debug", t, n)
  };
  return Qu.set(t, [n, o]), o;
}
var St = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), wn, jn = class Nn {
  constructor(t, n, r) {
    this.iterator = t, wn.set(this, void 0), this.controller = n, G(this, wn, r, "f");
  }
  static fromSSEResponse(t, n, r, o) {
    let i = !1;
    const a = r ? oe(r) : console;
    async function* u() {
      if (i) throw new U("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of Lw(t, n))
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
        if (Oi(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Nn(u, n, r);
  }
  static fromReadableStream(t, n, r) {
    let o = !1;
    async function* i() {
      const u = new Mo(), c = jf(t);
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
        if (Oi(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Nn(a, n, r);
  }
  [(wn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Nn(() => o(t), this.controller, T(this, wn, "f")), new Nn(() => o(n), this.controller, T(this, wn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Qf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(r) {
        try {
          const { value: o, done: i } = await n.next();
          if (i) return r.close();
          const a = Ns(JSON.stringify(o) + `
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
async function* Lw(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new U("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new U("Attempted to iterate over a response with no body");
  const n = new Fw(), r = new Mo(), o = jf(e.body);
  for await (const i of Uw(o)) for (const a of r.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of r.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* Uw(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const r = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Ns(n) : n;
    let o = new Uint8Array(t.length + r.length);
    o.set(t), o.set(r, t.length), t = o;
    let i;
    for (; (i = kw(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Fw = class {
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
    let [t, n, r] = Gw(e, ":");
    return r.startsWith(" ") && (r = r.substring(1)), t === "event" ? this.event = r : t === "data" && this.data.push(r), null;
  }
};
function Gw(e, t) {
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
async function ih(e, t) {
  const { response: n, requestLogID: r, retryOfRequestLogID: o, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return oe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : jn.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : sh(await n.json(), n) : await n.text();
  })();
  return oe(e).debug(`[${r}] response parsed`, St({
    retryOfRequestLogID: o,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function sh(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Dn, ah = class lh extends Promise {
  constructor(t, n, r = ih) {
    super((o) => {
      o(null);
    }), this.responsePromise = n, this.parseResponse = r, Dn.set(this, void 0), G(this, Dn, t, "f");
  }
  _thenUnwrap(t) {
    return new lh(T(this, Dn, "f"), this.responsePromise, async (n, r) => sh(t(await this.parseResponse(n, r), r), r.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(T(this, Dn, "f"), t))), this.parsedPromise;
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
Dn = /* @__PURE__ */ new WeakMap();
var kr, xo = class {
  constructor(e, t, n, r) {
    kr.set(this, void 0), G(this, kr, e, "f"), this.options = r, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new U("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await T(this, kr, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(kr = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Ow = class extends ah {
  constructor(e, t, n) {
    super(e, t, async (r, o) => new n(r, o.response, await ih(r, o), o.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, pt = class extends xo {
  constructor(e, t, n, r) {
    super(e, t, n, r), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, Y = class extends xo {
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
        ...xs(this.options.query),
        after: t
      }
    } : null;
  }
}, se = class extends xo {
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
        ...xs(this.options.query),
        after: e
      }
    } : null;
  }
}, rt = class extends xo {
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
        ...xs(this.options.query),
        after: e
      }
    } : null;
  }
}, Bw = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, qw = "urn:ietf:params:oauth:grant-type:token-exchange", Hw = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Xf();
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
      grant_type: qw,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: Bw[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new Yf(t.status, a, t.headers) : le.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
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
}, uh = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Vn(e, t, n) {
  return uh(), new File(e, t ?? "unknown_file", n);
}
function Jr(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Ds = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", No = async (e, t) => Vi(e.body) ? {
  ...e,
  body: await ch(e.body, t)
} : e, Ve = async (e, t) => ({
  ...e,
  body: await ch(e.body, t)
}), Zu = /* @__PURE__ */ new WeakMap();
function Vw(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Zu.get(t);
  if (n) return n;
  const r = (async () => {
    try {
      const o = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new o(i).text();
    } catch {
      return !0;
    }
  })();
  return Zu.set(t, r), r;
}
var ch = async (e, t) => {
  if (!await Vw(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, o]) => Ji(n, r, o))), n;
}, dh = (e) => e instanceof Blob && "name" in e, Jw = (e) => typeof e == "object" && e !== null && (e instanceof Response || Ds(e) || dh(e)), Vi = (e) => {
  if (Jw(e)) return !0;
  if (Array.isArray(e)) return e.some(Vi);
  if (e && typeof e == "object") {
    for (const t in e) if (Vi(e[t])) return !0;
  }
  return !1;
}, Ji = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, Vn([await n.blob()], Jr(n)));
    else if (Ds(n)) e.append(t, Vn([await new Response(Zf(n)).blob()], Jr(n)));
    else if (dh(n)) e.append(t, n, Jr(n));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Ji(e, t + "[]", r)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, o]) => Ji(e, `${t}[${r}]`, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, fh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Kw = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && fh(e), Ww = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function zw(e, t, n) {
  if (uh(), e = await e, Kw(e))
    return e instanceof File ? e : Vn([await e.arrayBuffer()], e.name);
  if (Ww(e)) {
    const o = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Vn(await Ki(o), t, n);
  }
  const r = await Ki(e);
  if (t || (t = Jr(e)), !n?.type) {
    const o = r.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof o == "string" && (n = {
      ...n,
      type: o
    });
  }
  return Vn(r, t, n);
}
async function Ki(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (fh(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Ds(e)) for await (const n of e) t.push(...await Ki(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Yw(e)}`);
  }
  return t;
}
function Yw(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var R = class {
  constructor(e) {
    this._client = e;
  }
};
function hh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var ju = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Xw = (e = hh) => function(n, ...r) {
  if (n.length === 1) return n[0];
  let o = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (o = !0);
    const m = r[p];
    let g = (o ? encodeURIComponent : e)("" + m);
    return p !== r.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? ju) ?? ju)?.toString) && (g = m + "", i.push({
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
}, v = /* @__PURE__ */ Xw(hh), ph = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/chat/completions/${e}/messages`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function lo(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function ks(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function ur(e) {
  return e?.$brand === "auto-parseable-tool";
}
function Qw(e, t) {
  return !t || !mh(t) ? {
    ...e,
    choices: e.choices.map((n) => (gh(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : $s(e, t);
}
function $s(e, t) {
  const n = e.choices.map((r) => {
    if (r.finish_reason === "length") throw new Wf();
    if (r.finish_reason === "content_filter") throw new zf();
    return gh(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        ...r.message.tool_calls ? { tool_calls: r.message.tool_calls?.map((o) => jw(t, o)) ?? void 0 } : void 0,
        parsed: r.message.content && !r.message.refusal ? Zw(t, r.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function Zw(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function jw(e, t) {
  const n = e.tools?.find((r) => lo(r) && r.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: ur(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function eC(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((r) => lo(r) && r.function?.name === t.function.name);
  return lo(n) && (ur(n) || n?.function.strict || !1);
}
function mh(e) {
  return ks(e.response_format) ? !0 : e.tools?.some((t) => ur(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function gh(e) {
  for (const t of e || []) if (t.type !== "function") throw new U(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function tC(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new U(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new U(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var uo = (e) => e?.role === "assistant", _h = (e) => e?.role === "tool", Wi, Kr, Wr, kn, $n, zr, Ln, Ye, Un, co, fo, Ot, yh, Ls = class {
  constructor() {
    Wi.add(this), this.controller = new AbortController(), Kr.set(this, void 0), Wr.set(this, () => {
    }), kn.set(this, () => {
    }), $n.set(this, void 0), zr.set(this, () => {
    }), Ln.set(this, () => {
    }), Ye.set(this, {}), Un.set(this, !1), co.set(this, !1), fo.set(this, !1), Ot.set(this, !1), G(this, Kr, new Promise((e, t) => {
      G(this, Wr, e, "f"), G(this, kn, t, "f");
    }), "f"), G(this, $n, new Promise((e, t) => {
      G(this, zr, e, "f"), G(this, Ln, t, "f");
    }), "f"), T(this, Kr, "f").catch(() => {
    }), T(this, $n, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, T(this, Wi, "m", yh).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (T(this, Wr, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return T(this, Un, "f");
  }
  get errored() {
    return T(this, co, "f");
  }
  get aborted() {
    return T(this, fo, "f");
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
      G(this, Ot, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    G(this, Ot, !0, "f"), await T(this, $n, "f");
  }
  _emit(e, ...t) {
    if (T(this, Un, "f")) return;
    e === "end" && (G(this, Un, !0, "f"), T(this, zr, "f").call(this));
    const n = T(this, Ye, "f")[e];
    if (n && (T(this, Ye, "f")[e] = n.filter((r) => !r.once), n.forEach(({ listener: r }) => r(...t))), e === "abort") {
      const r = t[0];
      !T(this, Ot, "f") && !n?.length && Promise.reject(r), T(this, kn, "f").call(this, r), T(this, Ln, "f").call(this, r), this._emit("end");
      return;
    }
    if (e === "error") {
      const r = t[0];
      !T(this, Ot, "f") && !n?.length && Promise.reject(r), T(this, kn, "f").call(this, r), T(this, Ln, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
Kr = /* @__PURE__ */ new WeakMap(), Wr = /* @__PURE__ */ new WeakMap(), kn = /* @__PURE__ */ new WeakMap(), $n = /* @__PURE__ */ new WeakMap(), zr = /* @__PURE__ */ new WeakMap(), Ln = /* @__PURE__ */ new WeakMap(), Ye = /* @__PURE__ */ new WeakMap(), Un = /* @__PURE__ */ new WeakMap(), co = /* @__PURE__ */ new WeakMap(), fo = /* @__PURE__ */ new WeakMap(), Ot = /* @__PURE__ */ new WeakMap(), Wi = /* @__PURE__ */ new WeakSet(), yh = function(t) {
  if (G(this, co, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Pe()), t instanceof Pe)
    return G(this, fo, !0, "f"), this._emit("abort", t);
  if (t instanceof U) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new U(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new U(String(t)));
};
function nC(e) {
  return typeof e.parse == "function";
}
var ue, zi, ho, Yi, Xi, Qi, vh, Ah, rC = 10, Th = class extends Ls {
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
      if (this._emit("message", e), _h(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (uo(e) && e.tool_calls)
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
    return await this.done(), T(this, ue, "m", zi).call(this);
  }
  async finalMessage() {
    return await this.done(), T(this, ue, "m", ho).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), T(this, ue, "m", Yi).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), T(this, ue, "m", Xi).call(this);
  }
  async totalUsage() {
    return await this.done(), T(this, ue, "m", Qi).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = T(this, ue, "m", ho).call(this);
    t && this._emit("finalMessage", t);
    const n = T(this, ue, "m", zi).call(this);
    n && this._emit("finalContent", n);
    const r = T(this, ue, "m", Yi).call(this);
    r && this._emit("finalFunctionToolCall", r);
    const o = T(this, ue, "m", Xi).call(this);
    o != null && this._emit("finalFunctionToolCallResult", o), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", T(this, ue, "m", Qi).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), T(this, ue, "m", vh).call(this, t);
    const o = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion($s(o, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const r of t.messages) this._addMessage(r, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const r = "tool", { tool_choice: o = "auto", stream: i, ...a } = t, u = typeof o != "string" && o.type === "function" && o?.function?.name, { maxChatCompletions: c = rC } = n || {}, d = t.tools.map((p) => {
      if (ur(p)) {
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
        const _ = g.id, { name: y, arguments: S } = g.function, w = h[y];
        if (w) {
          if (u && u !== y) {
            const E = `Invalid tool_call: ${JSON.stringify(y)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: r,
              tool_call_id: _,
              content: E
            });
            continue;
          }
        } else {
          const E = `Invalid tool_call: ${JSON.stringify(y)}. Available options are: ${Object.keys(h).map((L) => JSON.stringify(L)).join(", ")}. Please try again`;
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: E
          });
          continue;
        }
        let b;
        try {
          b = nC(w) ? await w.parse(S) : S;
        } catch (E) {
          const L = E instanceof Error ? E.message : String(E);
          this._addMessage({
            role: r,
            tool_call_id: _,
            content: L
          });
          continue;
        }
        const P = await w.function(b, this), k = T(this, ue, "m", Ah).call(this, P);
        if (this._addMessage({
          role: r,
          tool_call_id: _,
          content: k
        }), u) return;
      }
    }
  }
};
ue = /* @__PURE__ */ new WeakSet(), zi = function() {
  return T(this, ue, "m", ho).call(this).content ?? null;
}, ho = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (uo(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new U("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Yi = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (uo(n) && n?.tool_calls?.length) for (let r = n.tool_calls.length - 1; r >= 0; r--) {
      const o = n.tool_calls[r];
      if (o?.type === "function") return o.function;
    }
  }
}, Xi = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (_h(n) && n.content != null && typeof n.content == "string" && this.messages.some((r) => r.role === "assistant" && r.tool_calls?.some((o) => o.type === "function" && o.id === n.tool_call_id))) return n.content;
  }
}, Qi = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, vh = function(t) {
  if (t.n != null && t.n > 1) throw new U("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, Ah = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var oC = class Sh extends Th {
  static runTools(t, n, r) {
    const o = new Sh(), i = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, i)), o;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), uo(t) && t.content && this._emit("content", t.content);
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
}, iC = class extends Error {
}, sC = class extends Error {
};
function aC(e, t = ne.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return lC(e.trim(), t);
}
var lC = (e, t) => {
  const n = e.length;
  let r = 0;
  const o = (p) => {
    throw new iC(`${p} at position ${r}`);
  }, i = (p) => {
    throw new sC(`${p} at position ${r}`);
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
}, ec = (e) => aC(e, ne.ALL ^ ne.NUM), Z, ze, $t, at, ri, $r, oi, ii, si, Lr, ai, tc, Eh = class Zi extends Th {
  constructor(t) {
    super(), Z.add(this), ze.set(this, void 0), $t.set(this, void 0), at.set(this, void 0), G(this, ze, t, "f"), G(this, $t, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return T(this, at, "f");
  }
  static fromReadableStream(t) {
    const n = new Zi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, r) {
    const o = new Zi(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), T(this, Z, "m", ri).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...r,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) T(this, Z, "m", oi).call(this, a);
    if (i.controller.signal?.aborted) throw new Pe();
    return this._addChatCompletion(T(this, Z, "m", Lr).call(this));
  }
  async _fromReadableStream(t, n) {
    const r = n?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), T(this, Z, "m", ri).call(this), this._connected();
    const o = jn.fromReadableStream(t, this.controller);
    let i;
    for await (const a of o)
      i && i !== a.id && this._addChatCompletion(T(this, Z, "m", Lr).call(this)), T(this, Z, "m", oi).call(this, a), i = a.id;
    if (o.controller.signal?.aborted) throw new Pe();
    return this._addChatCompletion(T(this, Z, "m", Lr).call(this));
  }
  [(ze = /* @__PURE__ */ new WeakMap(), $t = /* @__PURE__ */ new WeakMap(), at = /* @__PURE__ */ new WeakMap(), Z = /* @__PURE__ */ new WeakSet(), ri = function() {
    this.ended || G(this, at, void 0, "f");
  }, $r = function(n) {
    let r = T(this, $t, "f")[n.index];
    return r || (r = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, T(this, $t, "f")[n.index] = r, r);
  }, oi = function(n) {
    if (this.ended) return;
    const r = T(this, Z, "m", tc).call(this, n);
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
      const a = T(this, Z, "m", $r).call(this, i);
      i.finish_reason && (T(this, Z, "m", si).call(this, i), a.current_tool_call_index != null && T(this, Z, "m", ii).call(this, i, a.current_tool_call_index));
      for (const u of o.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (T(this, Z, "m", si).call(this, i), a.current_tool_call_index != null && T(this, Z, "m", ii).call(this, i, a.current_tool_call_index)), a.current_tool_call_index = u.index;
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
  }, ii = function(n, r) {
    if (T(this, Z, "m", $r).call(this, n).done_tool_calls.has(r)) return;
    const o = n.message.tool_calls?.[r];
    if (!o) throw new Error("no tool call snapshot");
    if (!o.type) throw new Error("tool call snapshot missing `type`");
    if (o.type === "function") {
      const i = T(this, ze, "f")?.tools?.find((a) => lo(a) && a.function.name === o.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: o.function.name,
        index: r,
        arguments: o.function.arguments,
        parsed_arguments: ur(i) ? i.$parseRaw(o.function.arguments) : i?.function.strict ? JSON.parse(o.function.arguments) : null
      });
    } else o.type;
  }, si = function(n) {
    const r = T(this, Z, "m", $r).call(this, n);
    if (n.message.content && !r.content_done) {
      r.content_done = !0;
      const o = T(this, Z, "m", ai).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: o ? o.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !r.refusal_done && (r.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !r.logprobs_content_done && (r.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !r.logprobs_refusal_done && (r.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Lr = function() {
    if (this.ended) throw new U("stream has ended, this shouldn't happen");
    const n = T(this, at, "f");
    if (!n) throw new U("request ended without sending any chunks");
    return G(this, at, void 0, "f"), G(this, $t, [], "f"), uC(n, T(this, ze, "f"));
  }, ai = function() {
    const n = T(this, ze, "f")?.response_format;
    return ks(n) ? n : null;
  }, tc = function(n) {
    var r, o, i, a;
    let u = T(this, at, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = G(this, at, {
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
        const { content: E, refusal: L, ...C } = m;
        Object.assign(_.logprobs, C), E && ((r = _.logprobs).content ?? (r.content = []), _.logprobs.content.push(...E)), L && ((o = _.logprobs).refusal ?? (o.refusal = []), _.logprobs.refusal.push(...L));
      }
      if (f && (_.finish_reason = f, T(this, ze, "f") && mh(T(this, ze, "f")))) {
        if (f === "length") throw new Wf();
        if (f === "content_filter") throw new zf();
      }
      if (Object.assign(_, g), !h) continue;
      const { content: y, refusal: S, function_call: w, role: b, tool_calls: P, ...k } = h;
      if (Object.assign(_.message, k), S && (_.message.refusal = (_.message.refusal || "") + S), b && (_.message.role = b), w && (_.message.function_call ? (w.name && (_.message.function_call.name = w.name), w.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += w.arguments)) : _.message.function_call = w), y && (_.message.content = (_.message.content || "") + y, !_.message.refusal && T(this, Z, "m", ai).call(this) && (_.message.parsed = ec(_.message.content))), P) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: E, id: L, type: C, function: M, ...F } of P) {
          const H = (a = _.message.tool_calls)[E] ?? (a[E] = {});
          Object.assign(H, F), L && (H.id = L), C && (H.type = C), M && (H.function ?? (H.function = {
            name: M.name ?? "",
            arguments: ""
          })), M?.name && (H.function.name = M.name), M?.arguments && (H.function.arguments += M.arguments, eC(T(this, ze, "f"), H) && (H.function.parsed_arguments = ec(H.function.arguments)));
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
    return new jn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function uC(e, t) {
  const { id: n, choices: r, created: o, model: i, system_fingerprint: a, ...u } = e;
  return Qw({
    ...u,
    id: n,
    choices: r.map(({ message: c, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new U(`missing finish_reason for choice ${h}`);
      const { content: m = null, function_call: g, tool_calls: _, ...y } = c, S = c.role;
      if (!S) throw new U(`missing role for choice ${h}`);
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
            role: S,
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
          role: S,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: _.map((w, b) => {
            const { function: P, type: k, id: E, ...L } = w, { arguments: C, name: M, ...F } = P || {};
            if (E == null) throw new U(`missing choices[${h}].tool_calls[${b}].id
${Ur(e)}`);
            if (k == null) throw new U(`missing choices[${h}].tool_calls[${b}].type
${Ur(e)}`);
            if (M == null) throw new U(`missing choices[${h}].tool_calls[${b}].function.name
${Ur(e)}`);
            if (C == null) throw new U(`missing choices[${h}].tool_calls[${b}].function.arguments
${Ur(e)}`);
            return {
              ...L,
              id: E,
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
          role: S,
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
function Ur(e) {
  return JSON.stringify(e);
}
var cC = class ji extends Eh {
  static fromReadableStream(t) {
    const n = new ji(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, r) {
    const o = new ji(n), i = {
      ...r,
      headers: {
        ...r?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return o._run(() => o._runTools(t, n, i)), o;
  }
}, Us = class extends R {
  constructor() {
    super(...arguments), this.messages = new ph(this._client);
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
    return tC(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => $s(n, e));
  }
  runTools(e, t) {
    return e.stream ? cC.runTools(this._client, e, t) : oC.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Eh.createChatCompletion(this._client, e, t);
  }
};
Us.Messages = ph;
var Fs = class extends R {
  constructor() {
    super(...arguments), this.completions = new Us(this._client);
  }
};
Fs.Completions = Us;
var wh = class extends R {
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
}, Ch = class extends R {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", se, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ih = class extends R {
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
}, bh = class extends R {
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
}, Rh = class extends R {
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
}, Ph = class extends R {
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
}, Mh = class extends R {
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
}, xh = class extends R {
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
}, Nh = class extends R {
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
}, Dh = class extends R {
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
}, Do = class extends R {
  constructor() {
    super(...arguments), this.users = new Dh(this._client), this.roles = new Nh(this._client);
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
Do.Users = Dh;
Do.Roles = Nh;
var kh = class extends R {
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
}, $h = class extends R {
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
}, Lh = class extends R {
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
}, Uh = class extends R {
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
}, Fh = class extends R {
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
}, Gh = class extends R {
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
}, Oh = class extends R {
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
}, Bh = class extends R {
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
}, qh = class extends R {
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
}, Hh = class extends R {
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
}, Gs = class extends R {
  constructor() {
    super(...arguments), this.roles = new Hh(this._client);
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
Gs.Roles = Hh;
var Vh = class extends R {
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
}, Os = class extends R {
  constructor() {
    super(...arguments), this.roles = new Vh(this._client);
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
Os.Roles = Vh;
var Ce = class extends R {
  constructor() {
    super(...arguments), this.users = new Os(this._client), this.serviceAccounts = new Bh(this._client), this.apiKeys = new kh(this._client), this.rateLimits = new Gh(this._client), this.modelPermissions = new Fh(this._client), this.hostedToolPermissions = new Uh(this._client), this.groups = new Gs(this._client), this.roles = new Oh(this._client), this.dataRetention = new Lh(this._client), this.spendAlerts = new qh(this._client), this.certificates = new $h(this._client);
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
Ce.Users = Os;
Ce.ServiceAccounts = Bh;
Ce.APIKeys = kh;
Ce.RateLimits = Gh;
Ce.ModelPermissions = Fh;
Ce.HostedToolPermissions = Uh;
Ce.Groups = Gs;
Ce.Roles = Oh;
Ce.DataRetention = Lh;
Ce.SpendAlerts = qh;
Ce.Certificates = $h;
var Jh = class extends R {
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
}, Bs = class extends R {
  constructor() {
    super(...arguments), this.roles = new Jh(this._client);
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
Bs.Roles = Jh;
var Ie = class extends R {
  constructor() {
    super(...arguments), this.auditLogs = new Ch(this._client), this.adminAPIKeys = new wh(this._client), this.usage = new xh(this._client), this.invites = new Rh(this._client), this.users = new Bs(this._client), this.groups = new Do(this._client), this.roles = new Ph(this._client), this.dataRetention = new bh(this._client), this.spendAlerts = new Mh(this._client), this.certificates = new Ih(this._client), this.projects = new Ce(this._client);
  }
};
Ie.AuditLogs = Ch;
Ie.AdminAPIKeys = wh;
Ie.Usage = xh;
Ie.Invites = Rh;
Ie.Users = Bs;
Ie.Groups = Do;
Ie.Roles = Ph;
Ie.DataRetention = bh;
Ie.SpendAlerts = Mh;
Ie.Certificates = Ih;
Ie.Projects = Ce;
var qs = class extends R {
  constructor() {
    super(...arguments), this.organization = new Ie(this._client);
  }
};
qs.Organization = Ie;
var Kh = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* dC(e) {
  if (!e) return;
  if (Kh in e) {
    const { values: r, nulls: o } = e;
    yield* r.entries();
    for (const i of o) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Fu(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let r of n) {
    const o = r[0];
    if (typeof o != "string") throw new TypeError("expected header name to be a string");
    const i = Fu(r[1]) ? r[1] : [r[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [o, null]), yield [o, u]);
  }
}
var D = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const r of e) {
    const o = /* @__PURE__ */ new Set();
    for (const [i, a] of dC(r)) {
      const u = i.toLowerCase();
      o.has(u) || (t.delete(i), o.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [Kh]: !0,
    values: t,
    nulls: n
  };
}, Wh = class extends R {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: D([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, zh = class extends R {
  create(e, t) {
    return this._client.post("/audio/transcriptions", Ve({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Yh = class extends R {
  create(e, t) {
    return this._client.post("/audio/translations", Ve({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, cr = class extends R {
  constructor() {
    super(...arguments), this.transcriptions = new zh(this._client), this.translations = new Yh(this._client), this.speech = new Wh(this._client);
  }
};
cr.Transcriptions = zh;
cr.Translations = Yh;
cr.Speech = Wh;
var Xh = class extends R {
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
}, Qh = class extends R {
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
}, Zh = class extends R {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, jh = class extends R {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, ko = class extends R {
  constructor() {
    super(...arguments), this.sessions = new Zh(this._client), this.transcriptionSessions = new jh(this._client);
  }
};
ko.Sessions = Zh;
ko.TranscriptionSessions = jh;
var ep = class extends R {
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
}, tp = class extends R {
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
}, $o = class extends R {
  constructor() {
    super(...arguments), this.sessions = new ep(this._client), this.threads = new tp(this._client);
  }
};
$o.Sessions = ep;
$o.Threads = tp;
var np = class extends R {
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
}, rp = class extends R {
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
}, fC = (e) => {
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
}, ie, Rt, es, He, Yr, ke, Pt, Jt, wt, po, Ee, Xr, Qr, Jn, Fn, Gn, nc, rc, oc, ic, sc, ac, lc, Kn = class extends Ls {
  constructor() {
    super(...arguments), ie.add(this), es.set(this, []), He.set(this, {}), Yr.set(this, {}), ke.set(this, void 0), Pt.set(this, void 0), Jt.set(this, void 0), wt.set(this, void 0), po.set(this, void 0), Ee.set(this, void 0), Xr.set(this, void 0), Qr.set(this, void 0), Jn.set(this, void 0);
  }
  [(es = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ new WeakMap(), Yr = /* @__PURE__ */ new WeakMap(), ke = /* @__PURE__ */ new WeakMap(), Pt = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakMap(), wt = /* @__PURE__ */ new WeakMap(), po = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new WeakMap(), Xr = /* @__PURE__ */ new WeakMap(), Qr = /* @__PURE__ */ new WeakMap(), Jn = /* @__PURE__ */ new WeakMap(), ie = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const r = jn.fromReadableStream(e, this.controller);
    for await (const o of r) T(this, ie, "m", Fn).call(this, o);
    if (r.controller.signal?.aborted) throw new Pe();
    return this._addRun(T(this, ie, "m", Gn).call(this));
  }
  toReadableStream() {
    return new jn(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
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
    for await (const u of a) T(this, ie, "m", Fn).call(this, u);
    if (a.controller.signal?.aborted) throw new Pe();
    return this._addRun(T(this, ie, "m", Gn).call(this));
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
    return T(this, Xr, "f");
  }
  currentRun() {
    return T(this, Qr, "f");
  }
  currentMessageSnapshot() {
    return T(this, ke, "f");
  }
  currentRunStepSnapshot() {
    return T(this, Jn, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(T(this, He, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(T(this, Yr, "f"));
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
    for await (const a of i) T(this, ie, "m", Fn).call(this, a);
    if (i.controller.signal?.aborted) throw new Pe();
    return this._addRun(T(this, ie, "m", Gn).call(this));
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
    for await (const u of a) T(this, ie, "m", Fn).call(this, u);
    if (a.controller.signal?.aborted) throw new Pe();
    return this._addRun(T(this, ie, "m", Gn).call(this));
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
      else if (ei(o) && ei(r)) o = this.accumulateDelta(o, r);
      else if (Array.isArray(o) && Array.isArray(r)) {
        if (o.every((i) => typeof i == "string" || typeof i == "number")) {
          o.push(...r);
          continue;
        }
        for (const i of r) {
          if (!ei(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
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
Rt = Kn, Fn = function(t) {
  if (!this.ended)
    switch (G(this, Xr, t, "f"), T(this, ie, "m", oc).call(this, t), t.event) {
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
        T(this, ie, "m", lc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        T(this, ie, "m", rc).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        T(this, ie, "m", nc).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, Gn = function() {
  if (this.ended) throw new U("stream has ended, this shouldn't happen");
  if (!T(this, Pt, "f")) throw Error("Final run has not been received");
  return T(this, Pt, "f");
}, nc = function(t) {
  const [n, r] = T(this, ie, "m", sc).call(this, t, T(this, ke, "f"));
  G(this, ke, n, "f"), T(this, Yr, "f")[n.id] = n;
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
        if (o.index != T(this, Jt, "f")) {
          if (T(this, wt, "f")) switch (T(this, wt, "f").type) {
            case "text":
              this._emit("textDone", T(this, wt, "f").text, T(this, ke, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", T(this, wt, "f").image_file, T(this, ke, "f"));
              break;
          }
          G(this, Jt, o.index, "f");
        }
        G(this, wt, n.content[o.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (T(this, Jt, "f") !== void 0) {
        const o = t.data.content[T(this, Jt, "f")];
        if (o) switch (o.type) {
          case "image_file":
            this._emit("imageFileDone", o.image_file, T(this, ke, "f"));
            break;
          case "text":
            this._emit("textDone", o.text, T(this, ke, "f"));
            break;
        }
      }
      T(this, ke, "f") && this._emit("messageDone", t.data), G(this, ke, void 0, "f");
  }
}, rc = function(t) {
  const n = T(this, ie, "m", ic).call(this, t);
  switch (G(this, Jn, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const r = t.data.delta;
      if (r.step_details && r.step_details.type == "tool_calls" && r.step_details.tool_calls && n.step_details.type == "tool_calls") for (const o of r.step_details.tool_calls) o.index == T(this, po, "f") ? this._emit("toolCallDelta", o, n.step_details.tool_calls[o.index]) : (T(this, Ee, "f") && this._emit("toolCallDone", T(this, Ee, "f")), G(this, po, o.index, "f"), G(this, Ee, n.step_details.tool_calls[o.index], "f"), T(this, Ee, "f") && this._emit("toolCallCreated", T(this, Ee, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      G(this, Jn, void 0, "f"), t.data.step_details.type == "tool_calls" && T(this, Ee, "f") && (this._emit("toolCallDone", T(this, Ee, "f")), G(this, Ee, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, oc = function(t) {
  T(this, es, "f").push(t), this._emit("event", t);
}, ic = function(t) {
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
}, sc = function(t, n) {
  let r = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, r];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let o = t.data;
      if (o.delta.content) for (const i of o.delta.content) if (i.index in n.content) {
        let a = n.content[i.index];
        n.content[i.index] = T(this, ie, "m", ac).call(this, i, a);
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
}, ac = function(t, n) {
  return Rt.accumulateDelta(n, t);
}, lc = function(t) {
  switch (G(this, Qr, t.data, "f"), t.event) {
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
      G(this, Pt, t.data, "f"), T(this, Ee, "f") && (this._emit("toolCallDone", T(this, Ee, "f")), G(this, Ee, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Hs = class extends R {
  constructor() {
    super(...arguments), this.steps = new rp(this._client);
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
    return Kn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
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
          await lr(a);
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
    return Kn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
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
    return Kn.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
Hs.Steps = rp;
var Lo = class extends R {
  constructor() {
    super(...arguments), this.runs = new Hs(this._client), this.messages = new np(this._client);
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
    return Kn.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Lo.Runs = Hs;
Lo.Messages = np;
var on = class extends R {
  constructor() {
    super(...arguments), this.realtime = new ko(this._client), this.chatkit = new $o(this._client), this.assistants = new Qh(this._client), this.threads = new Lo(this._client);
  }
};
on.Realtime = ko;
on.ChatKit = $o;
on.Assistants = Qh;
on.Threads = Lo;
var op = class extends R {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, ip = class extends R {
  retrieve(e, t, n) {
    const { container_id: r } = t;
    return this._client.get(v`/containers/${r}/files/${e}/content`, {
      ...n,
      headers: D([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Vs = class extends R {
  constructor() {
    super(...arguments), this.content = new ip(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/containers/${e}/files`, No({
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
Vs.Content = ip;
var Js = class extends R {
  constructor() {
    super(...arguments), this.files = new Vs(this._client);
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
Js.Files = Vs;
var sp = class extends R {
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
}, Ks = class extends R {
  constructor() {
    super(...arguments), this.items = new sp(this._client);
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
Ks.Items = sp;
var ap = class extends R {
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
      a.embedding = fC(u);
    }), i)));
  }
}, lp = class extends R {
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
}, Ws = class extends R {
  constructor() {
    super(...arguments), this.outputItems = new lp(this._client);
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
Ws.OutputItems = lp;
var zs = class extends R {
  constructor() {
    super(...arguments), this.runs = new Ws(this._client);
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
zs.Runs = Ws;
var up = class extends R {
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
      if (await lr(t), i = await this.retrieve(e), Date.now() - o > n) throw new Ms({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, cp = class extends R {
}, dp = class extends R {
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
}, Ys = class extends R {
  constructor() {
    super(...arguments), this.graders = new dp(this._client);
  }
};
Ys.Graders = dp;
var fp = class extends R {
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
}, Xs = class extends R {
  constructor() {
    super(...arguments), this.permissions = new fp(this._client);
  }
};
Xs.Permissions = fp;
var hp = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/fine_tuning/jobs/${e}/checkpoints`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Qs = class extends R {
  constructor() {
    super(...arguments), this.checkpoints = new hp(this._client);
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
Qs.Checkpoints = hp;
var sn = class extends R {
  constructor() {
    super(...arguments), this.methods = new cp(this._client), this.jobs = new Qs(this._client), this.checkpoints = new Xs(this._client), this.alpha = new Ys(this._client);
  }
};
sn.Methods = cp;
sn.Jobs = Qs;
sn.Checkpoints = Xs;
sn.Alpha = Ys;
var pp = class extends R {
}, Zs = class extends R {
  constructor() {
    super(...arguments), this.graderModels = new pp(this._client);
  }
};
Zs.GraderModels = pp;
var mp = class extends R {
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
}, gp = class extends R {
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
}, _p = class extends R {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, yp = class extends R {
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
}, vp = class extends R {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Uo = class extends R {
  constructor() {
    super(...arguments), this.clientSecrets = new vp(this._client), this.calls = new yp(this._client);
  }
};
Uo.ClientSecrets = vp;
Uo.Calls = yp;
function hC(e, t) {
  return !t || !mC(t) ? {
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
  } : Ap(e, t);
}
function Ap(e, t) {
  const n = e.output.map((o) => {
    if (o.type === "function_call") return {
      ...o,
      parsed_arguments: yC(t, o)
    };
    if (o.type === "message") {
      const i = o.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: pC(t, a.text)
      } : a);
      return {
        ...o,
        content: i
      };
    }
    return o;
  }), r = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || ts(r), Object.defineProperty(r, "output_parsed", {
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
function pC(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function mC(e) {
  return !!ks(e.text?.format);
}
function gC(e) {
  return e?.$brand === "auto-parseable-tool";
}
function _C(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function yC(e, t) {
  const n = _C(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: gC(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function ts(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const r of n.content) r.type === "output_text" && t.push(r.text);
  e.output_text = t.join("");
}
var Lt, Fr, ut, Gr, uc, cc, dc, fc, vC = class Tp extends Ls {
  constructor(t) {
    super(), Lt.add(this), Fr.set(this, void 0), ut.set(this, void 0), Gr.set(this, void 0), G(this, Fr, t, "f");
  }
  static createResponse(t, n, r) {
    const o = new Tp(n);
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
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), T(this, Lt, "m", uc).call(this);
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
    for await (const u of i) T(this, Lt, "m", cc).call(this, u, a);
    if (i.controller.signal?.aborted) throw new Pe();
    return T(this, Lt, "m", dc).call(this);
  }
  [(Fr = /* @__PURE__ */ new WeakMap(), ut = /* @__PURE__ */ new WeakMap(), Gr = /* @__PURE__ */ new WeakMap(), Lt = /* @__PURE__ */ new WeakSet(), uc = function() {
    this.ended || G(this, ut, void 0, "f");
  }, cc = function(n, r) {
    if (this.ended) return;
    const o = (a, u) => {
      (r == null || u.sequence_number > r) && this._emit(a, u);
    }, i = T(this, Lt, "m", fc).call(this, n);
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
  }, dc = function() {
    if (this.ended) throw new U("stream has ended, this shouldn't happen");
    const n = T(this, ut, "f");
    if (!n) throw new U("request ended without sending any events");
    G(this, ut, void 0, "f");
    const r = AC(n, T(this, Fr, "f"));
    return G(this, Gr, r, "f"), r;
  }, fc = function(n) {
    let r = T(this, ut, "f");
    if (!r) {
      if (n.type !== "response.created") throw new U(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return r = G(this, ut, n.response, "f"), r;
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
        G(this, ut, n.response, "f");
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
function AC(e, t) {
  return hC(e, t);
}
var Sp = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/responses/${e}/input_items`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Ep = class extends R {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Fo = class extends R {
  constructor() {
    super(...arguments), this.inputItems = new Sp(this._client), this.inputTokens = new Ep(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && ts(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(v`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((r) => ("object" in r && r.object === "response" && ts(r), r));
  }
  delete(e, t) {
    return this._client.delete(v`/responses/${e}`, {
      ...t,
      headers: D([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Ap(n, e));
  }
  stream(e, t) {
    return vC.createResponse(this._client, e, t);
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
Fo.InputItems = Sp;
Fo.InputTokens = Ep;
var wp = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/skills/${e}/content`, {
      ...t,
      headers: D([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Cp = class extends R {
  retrieve(e, t, n) {
    const { skill_id: r } = t;
    return this._client.get(v`/skills/${r}/versions/${e}/content`, {
      ...n,
      headers: D([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, js = class extends R {
  constructor() {
    super(...arguments), this.content = new Cp(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(v`/skills/${e}/versions`, No({
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
js.Content = Cp;
var Go = class extends R {
  constructor() {
    super(...arguments), this.content = new wp(this._client), this.versions = new js(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", No({
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
Go.Content = wp;
Go.Versions = js;
var Ip = class extends R {
  create(e, t, n) {
    return this._client.post(v`/uploads/${e}/parts`, Ve({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, ea = class extends R {
  constructor() {
    super(...arguments), this.parts = new Ip(this._client);
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
ea.Parts = Ip;
var TC = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((o) => o.status === "rejected");
  if (n.length) {
    for (const o of n) console.error(o.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const r = [];
  for (const o of t) o.status === "fulfilled" && r.push(o.value);
  return r;
}, bp = class extends R {
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
          await lr(a);
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
    return await TC(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, Rp = class extends R {
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
          await lr(a);
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
}, Oo = class extends R {
  constructor() {
    super(...arguments), this.files = new Rp(this._client), this.fileBatches = new bp(this._client);
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
Oo.Files = Rp;
Oo.FileBatches = bp;
var Pp = class extends R {
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
    return this._client.post(v`/videos/${e}/remix`, No({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Bt, Mp, Zr, xp = class extends R {
  constructor() {
    super(...arguments), Bt.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, r = 300) {
    return await this.verifySignature(e, t, n, r), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, r = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    T(this, Bt, "m", Mp).call(this, n);
    const o = D([t]).values, i = T(this, Bt, "m", Zr).call(this, o, "webhook-signature"), a = T(this, Bt, "m", Zr).call(this, o, "webhook-timestamp"), u = T(this, Bt, "m", Zr).call(this, o, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new Mn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > r) throw new Mn("Webhook timestamp is too old");
    if (c > d + r) throw new Mn("Webhook timestamp is too new");
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
    throw new Mn("The given webhook signature does not match the expected signature");
  }
};
Bt = /* @__PURE__ */ new WeakSet(), Mp = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, Zr = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const r = t.get(n);
  if (r == null) throw new Error(`Missing required header: ${n}`);
  return r;
};
var ns, ta, jr, Np, SC = "workload-identity-auth", q = class {
  constructor({ baseURL: e = lt("OPENAI_BASE_URL"), apiKey: t = lt("OPENAI_API_KEY") ?? null, adminAPIKey: n = lt("OPENAI_ADMIN_KEY") ?? null, organization: r = lt("OPENAI_ORG_ID") ?? null, project: o = lt("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = lt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: a, ...u } = {}) {
    ns.add(this), jr.set(this, void 0), this.completions = new op(this), this.chat = new Fs(this), this.embeddings = new ap(this), this.files = new up(this), this.images = new mp(this), this.audio = new cr(this), this.moderations = new _p(this), this.models = new gp(this), this.fineTuning = new sn(this), this.graders = new Zs(this), this.vectorStores = new Oo(this), this.webhooks = new xp(this), this.beta = new on(this), this.batches = new Xh(this), this.uploads = new ea(this), this.admin = new qs(this), this.responses = new Fo(this), this.realtime = new Uo(this), this.conversations = new Ks(this), this.evals = new zs(this), this.containers = new Js(this), this.skills = new Go(this), this.videos = new Pp(this);
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
    if (!c.dangerouslyAllowBrowser && Aw()) throw new U(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? ta.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = Xu(c.logLevel, "ClientOptions.logLevel", this) ?? Xu(lt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? Xf(), G(this, jr, Cw, "f");
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
    this._options = c, a && (this._workloadIdentityAuth = new Hw(a, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = r, this.project = o, this.webhookSecret = i;
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
    return xw(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Gt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Ff()}`;
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
    const r = !T(this, ns, "m", Np).call(this) && n || this.baseURL, o = gw(e) ? new URL(e) : new URL(r + (r.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(o.searchParams);
    return (!Gu(i) || !Gu(a)) && (t = {
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
    return new ah(this, this.makeRequest(e, t, void 0));
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
    if (oe(this).debug(`[${c}] sending request`, St({
      retryOfRequestLogID: n,
      method: r.method,
      url: a,
      options: r,
      headers: i.headers
    })), r.signal?.aborted) throw new Pe();
    const f = r.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(a, i, u, p, f).catch(Bi), g = Date.now();
    if (m instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (r.signal?.aborted) throw new Pe();
      const S = Oi(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return oe(this).info(`[${c}] connection ${S ? "timed out" : "failed"} - ${y}`), oe(this).debug(`[${c}] connection ${S ? "timed out" : "failed"} (${y})`, St({
          retryOfRequestLogID: n,
          url: a,
          durationMs: g - h,
          message: m.message
        })), this.retryRequest(r, t, n ?? c);
      throw oe(this).info(`[${c}] connection ${S ? "timed out" : "failed"} - error; no more retries left`), oe(this).debug(`[${c}] connection ${S ? "timed out" : "failed"} (error; no more retries left)`, St({
        retryOfRequestLogID: n,
        url: a,
        durationMs: g - h,
        message: m.message
      })), m instanceof Yf || m instanceof pw ? m : S ? new Ms() : new Po({
        message: EC(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, S]) => ", " + y + ": " + JSON.stringify(S)).join("")}] ${i.method} ${a} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - h}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && f.bearerAuth && !r.__metadata?.hasStreamingBody && !r.__metadata?.workloadIdentityTokenRefreshed)
        return await Hu(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...r,
          __metadata: {
            ...r.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(m);
      if (t && y) {
        const k = `retrying, ${t} attempts remaining`;
        return await Hu(m.body), oe(this).info(`${_} - ${k}`), oe(this).debug(`[${c}] response error (${k})`, St({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - h
        })), this.retryRequest(r, t, n ?? c, m.headers);
      }
      const S = y ? "error; no more retries left" : "error; not retryable";
      oe(this).info(`${_} - ${S}`);
      const w = await m.text().catch((k) => Bi(k).message), b = vw(w), P = b ? void 0 : w;
      throw oe(this).debug(`[${c}] response error (${S})`, St({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: P,
        durationMs: Date.now() - h
      })), this.makeStatusError(m.status, b, P, m.headers);
    }
    return oe(this).info(_), oe(this).debug(`[${c}] response start`, St({
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
    return new Ow(this, n, e);
  }
  async fetchWithAuth(e, t, n, r, o = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && o.bearerAuth) {
      const i = t.headers, a = i.get("Authorization");
      if (!a || a === `Bearer ${SC}`) {
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
    return await lr(o), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e;
    return Math.min(0.5 * Math.pow(2, o), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: r, path: o, query: i, defaultBaseURL: a } = n, u = this.buildURL(o, i, a);
    "timeout" in n && yw("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
        ...ww(),
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
      body: Zf(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...T(this, jr, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
ta = q, jr = /* @__PURE__ */ new WeakMap(), ns = /* @__PURE__ */ new WeakSet(), Np = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
q.OpenAI = ta;
q.DEFAULT_TIMEOUT = 6e5;
q.OpenAIError = U;
q.APIError = le;
q.APIConnectionError = Po;
q.APIConnectionTimeoutError = Ms;
q.APIUserAbortError = Pe;
q.NotFoundError = qf;
q.ConflictError = Hf;
q.RateLimitError = Jf;
q.BadRequestError = Gf;
q.AuthenticationError = Of;
q.InternalServerError = Kf;
q.PermissionDeniedError = Bf;
q.UnprocessableEntityError = Vf;
q.InvalidWebhookSignatureError = Mn;
q.toFile = zw;
q.Completions = op;
q.Chat = Fs;
q.Embeddings = ap;
q.Files = up;
q.Images = mp;
q.Audio = cr;
q.Moderations = _p;
q.Models = gp;
q.FineTuning = sn;
q.Graders = Zs;
q.VectorStores = Oo;
q.Webhooks = xp;
q.Beta = on;
q.Batches = Xh;
q.Uploads = ea;
q.Admin = qs;
q.Responses = Fo;
q.Realtime = Uo;
q.Conversations = Ks;
q.Evals = zs;
q.Containers = Js;
q.Skills = Go;
q.Videos = Pp;
function EC(e) {
  if (wC(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function wC(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const r = t;
    if (r.code === "UND_ERR_INVALID_ARG" && typeof r.message == "string" && r.message.includes("invalid onRequestStart method")) return !0;
    t = r.cause;
  }
  return !1;
}
function hc(e = "", t = 0) {
  let n = 0;
  for (let r = t - 1; r >= 0 && e[r] === "\\"; r -= 1) n += 1;
  return n % 2 === 1;
}
function CC(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function IC(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function bC(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function RC(e = "") {
  const t = String(e ?? "");
  let n = "", r = 0;
  for (; r < t.length; ) {
    const o = t.slice(r, r + 2), i = t.slice(r + 2, r + 6);
    if (o !== "\\u" || hc(t, r) || !CC(i)) {
      n += t[r] || "", r += 1;
      continue;
    }
    const a = r + 6, u = t.slice(a + 2, a + 6);
    if (IC(i) && t.slice(a, a + 2) === "\\u" && !hc(t, a) && bC(u)) {
      const c = Number.parseInt(i, 16), d = Number.parseInt(u, 16), h = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(h), r += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(i, 16)), r += 6;
  }
  return n;
}
function PC(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), RC(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function MC(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function na(e = "", t = "", n = 0) {
  const r = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${MC(t)}(?:\\\\?")?\\s*:`, "i"), o = String(e || "").slice(Math.max(0, n)).match(r);
  if (!o || o.index === void 0) return null;
  const i = o[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + o.index + i,
    end: Math.max(0, n) + o.index + o[0].length
  };
}
function xC(e = "", t = [], n = 0) {
  return t.map((r) => na(e, r, n)).filter(Boolean).sort((r, o) => r.index - o.index)[0] || null;
}
function Ue(e = "", t = "", n = []) {
  const r = String(e || ""), o = na(r, t);
  if (!o) return;
  let i = o.end;
  for (; /\s/.test(r[i] || ""); ) i += 1;
  r[i] === '"' && (i += 1);
  const a = xC(r, n.filter((d) => d !== t), i);
  let u = a ? a.index : r.length;
  if (a) {
    const d = r.lastIndexOf(",", a.index);
    d >= i && (u = d);
  }
  let c = r.slice(i, u).trim();
  return a || (c = c.replace(/\}\s*$/, "").trimEnd()), PC(c);
}
function Xe(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var On = {
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
}, NC = [
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
function pc(e = "", t = [], n = []) {
  for (const r of t) {
    const o = Ue(e, r, n);
    if (o !== void 0) return o;
  }
}
function DC(e = "", t = "") {
  if (t === "Read") {
    const n = On.Read, r = {};
    return n.forEach((o, i) => {
      const a = Ue(e, o, n.slice(i + 1));
      a !== void 0 && (r[o] = Xe(a));
    }), r.filePath === void 0 && r.path !== void 0 && (r.filePath = r.path, delete r.path), r.filePath === void 0 && r.scope !== void 0 && (r.filePath = r.scope, delete r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "Write") {
    const n = {}, r = pc(e, ["filePath", "path"], ["content"]), o = Ue(e, "content", []);
    return r !== void 0 && (n.filePath = Xe(r)), o !== void 0 && (n.content = Xe(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, r = pc(e, ["filePath", "path"], ["edits"]), o = Ue(e, "edits", []);
    return r !== void 0 && (n.filePath = Xe(r)), o !== void 0 && (n.edits = Xe(o)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = On.Grep, r = {};
    return n.forEach((o) => {
      const i = Ue(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = Xe(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), Object.keys(r).length ? r : null;
  }
  if (t === "MemoryGrep") {
    const n = On.MemoryGrep, r = {};
    return n.forEach((o) => {
      const i = Ue(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = Xe(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.path === void 0 && r.scope !== void 0 && (r.path = r.scope), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  if (t === "ChatHistory") {
    const n = On.ChatHistory, r = {};
    return n.forEach((o) => {
      const i = Ue(e, o, n.filter((a) => a !== o));
      i !== void 0 && (r[o] = Xe(i));
    }), r.pattern === void 0 && r.query !== void 0 && (r.pattern = r.query), r.regex === void 0 && r.useRegex !== void 0 && (r.regex = r.useRegex), Object.keys(r).length ? r : null;
  }
  return null;
}
function kC(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const a = JSON.parse(n);
    if (a && typeof a == "object" && !Array.isArray(a)) return a;
  } catch {
  }
  const r = DC(n, t);
  if (r) return r;
  const o = On[t] || NC, i = {};
  return o.forEach((a, u) => {
    const c = Ue(n, a, o.slice(u + 1));
    c !== void 0 && (i[a] = Xe(c));
  }), Object.keys(i).length ? i : null;
}
function $C(e = "", t = "") {
  const n = kC(e, t);
  return n ? JSON.stringify(n) : "";
}
function Dp(e) {
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
function kp(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function $p(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : kp(e);
  return $C(n, t) || JSON.stringify(Dp(n));
}
function LC(e = "") {
  const t = String(e || ""), n = na(t, "arguments");
  if (!n) return "";
  let r = n.end;
  for (; /\s/.test(t[r] || ""); ) r += 1;
  const o = t[r] || "";
  return o === "{" ? t.slice(r).replace(/\}\s*$/, "").trimEnd() : o === '"' ? t.slice(r + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(r).replace(/\}\s*$/, "").trimEnd();
}
function UC(e = "", t = 0) {
  const n = String(e || "").trim(), r = Ue(n, "name", ["id", "arguments"]) || Ue(n, "toolName", ["id", "arguments"]) || "", o = Ue(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, i = LC(n);
  return !r || !i ? null : {
    id: o,
    name: r,
    arguments: $p(i, r)
  };
}
function FC(e, t = 0, n = "openai-tool") {
  if (!z(e)) return null;
  const r = z(e.function) ? e.function : null, o = String(r?.name || "").trim();
  if (!o) return null;
  const i = ge(e) || {};
  return delete i.index, i.id = String(i.id || `${n}-${t + 1}`), i.type = "function", i.function = {
    ...ge(r) || {},
    name: o,
    arguments: kp(r.arguments)
  }, i;
}
function er(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, r) => FC(n, r, t)).filter(Boolean);
}
function tr(e, t) {
  return Array.isArray(e) ? e.some((n) => tr(n, t)) : z(e) ? Object.entries(e).some(([n, r]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(r) : (Array.isArray(r) || z(r)) && tr(r, t)) : !1;
}
function GC(e) {
  return tr(e, (t) => typeof t == "string" && t.length > 0);
}
function rs(e) {
  return tr(e, () => !0);
}
function OC(e) {
  return tr(e, (t) => typeof t != "string" || t.length === 0);
}
function BC(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => GC(t));
}
var mc = /* @__PURE__ */ new WeakSet();
function ra(e) {
  if (!z(e)) return null;
  const t = ge(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = It(Ct(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = er(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function oa(e = [], t = "openai-tool") {
  return er(e, t).map((n, r) => ({
    id: n.id || `${t}-${Date.now()}-${r + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function ia(e) {
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
function os(e = "") {
  const t = String(e || "");
  return /<tool_call\b/i.test(t) ? [{
    id: "tagged-json-draft",
    name: t.match(/["']?name["']?\s*:\s*["']([^"']+)/i)?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }] : [];
}
function Et(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      Le(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((r) => Et(e, r, n));
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
  return Et(n, e.reasoning_content, "推理文本"), Et(n, e.reasoning, "推理文本"), Et(n, e.reasoning_text, "推理文本"), Et(n, e.thinking, "思考块"), Et(n, t.reasoning_content, "推理文本"), Et(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((r) => {
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
function Wn(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((r) => {
    [...e.matchAll(r)].forEach((o, i) => {
      try {
        const a = JSON.parse(o[1]);
        n.push({
          id: a.id || `tool-call-${i + 1}`,
          name: String(a.name || ""),
          arguments: $p(a.arguments, a.name)
        });
      } catch {
        const a = UC(o[1], i);
        a && n.push(a);
      }
    });
  }), n.filter((r) => r.name);
}
function sa(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : ra(t);
}
function qC(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function HC(e = {}) {
  const t = er(e?.tool_calls);
  if (t.length) return t;
  const n = er(sa(e)?.tool_calls);
  return n.length ? n : [];
}
function VC(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function JC(e = "") {
  return /claude/i.test(String(e || ""));
}
function Lp(e = [], t = "") {
  if (!JC(t)) return e;
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
function gc(e, t = "") {
  return !z(e) || !VC(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var is = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function KC(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((r) => ge(r) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((r, o) => {
    const i = ge(r) || {}, a = Number.isInteger(Number(r?.index)) ? Number(r.index) : o, u = n[a];
    n[a] = z(u) ? dr(u, i, "tool_call") : i;
  }), n.filter((r) => r !== void 0);
}
function dr(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return ge(t);
  if (t === null && is.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return KC(e, t);
  if (typeof e == "string" && typeof t == "string")
    return is.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : ge(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(ge(t) || []);
  if (z(e) && z(t)) {
    const r = { ...e };
    return Object.entries(t).forEach(([o, i]) => {
      r[o] = dr(r[o], i, o);
    }), r;
  }
  return ge(t);
}
function mo(e = {}, t = {}) {
  const n = z(e) ? ge(e) || {} : {}, r = z(t) ? ge(t) || {} : {};
  return delete r.message, delete r.finish_reason, delete r.index, delete r.logprobs, delete r.delta, Object.entries(r).forEach(([o, i]) => {
    n[o] = dr(n[o], i, o);
  }), n.role || (n.role = "assistant"), ra(n) || { role: "assistant" };
}
function zn(e, t = {}) {
  const n = ra(mo(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function WC(e = {}, t = {}) {
  return z(e) ? z(t) ? dr(ge(e) || {}, t, "") : ge(e) : ge(t);
}
function ss(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], r = qC(n), o = [];
  let i = !1;
  n.forEach((u, c) => {
    if (i) {
      if (u?.role === "tool") return;
      i = !1;
    }
    const d = u?.role === "assistant", h = d ? u?.providerPayload?.openaiCompatibleMessage : null, f = Fp(Array.isArray(h?.tool_calls) && h.tool_calls.some((S) => rs(S)) ? h.tool_calls : d && Array.isArray(u?.tool_calls) && u.tool_calls.some((S) => rs(S)) ? u.tool_calls : null);
    if (f) {
      const S = z(h) ? h : u;
      (!z(S) || !mc.has(S)) && (z(S) && mc.add(S), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: f.index,
        toolName: f.toolName,
        reason: f.reason
      })), i = !0;
      return;
    }
    const p = d ? er(u?.tool_calls) : [], m = d ? sa(u) : null, g = Array.isArray(m?.tool_calls) ? m.tool_calls : [], _ = g.length > 0 && BC(m);
    if (g.length && c > r) {
      o.push(gc({
        ...m,
        ...p.length && !_ ? { tool_calls: p } : {}
      }, t));
      return;
    }
    const y = {
      role: u.role,
      content: u.content
    };
    u.role === "tool" && u.tool_call_id && (y.tool_call_id = u.tool_call_id), _ ? y.tool_calls = g : p.length && (y.tool_calls = p), o.push(gc(y, t));
  });
  const a = String(e.systemPrompt || "").trim();
  return a && o[0]?.role !== "system" && o.unshift({
    role: "system",
    content: a
  }), Lp(o, t);
}
function _c(e) {
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
function as(e, t = "") {
  const n = /* @__PURE__ */ new Map(), r = [];
  return (Array.isArray(e.messages) ? e.messages : []).forEach((o) => {
    if (o.role === "assistant") {
      const i = HC(o);
      if (i.length) {
        const a = sa(o), u = typeof a?.content == "string" ? a.content : String(o.content || ""), c = i.map((d, h) => {
          const f = d.function?.name || "", p = d.id || `tool-call-${h + 1}`;
          return f && n.set(p, f), `<tool_call>${JSON.stringify({
            id: p,
            name: f,
            arguments: Dp(d.function?.arguments || "{}")
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
    content: _c(e)
  }) : r[0] = {
    ...r[0],
    content: _c({
      ...e,
      systemPrompt: r[0].content || e.systemPrompt
    })
  }, Lp(r, t);
}
function yc(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Up(e, t, n) {
  !e || !t || n === void 0 || (e[t] = dr(e[t], n, t));
}
function go(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (z(n)) {
      const r = z(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([o, i]) => {
        go(r, o, i);
      }), e[t] = r;
      return;
    }
    if (typeof n == "string" && is.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || Up(e, t, n);
  }
}
function zC(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const r = Number(n?.index ?? 0), o = { ...e.tool_calls[r] || {} };
    Object.entries(n || {}).forEach(([i, a]) => {
      if (i !== "index" && !(i === "function" && a == null)) {
        if (i === "function" && z(a)) {
          o.function = z(o.function) ? { ...o.function } : {}, Object.entries(a).forEach(([u, c]) => {
            go(o.function, u, c);
          });
          return;
        }
        go(o, i, a);
      }
    }), e.tool_calls[r] = o;
  }));
}
function ls(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([r, o]) => {
    r === "delta" || r === "finish_reason" || r === "index" || r === "logprobs" || Up(e, r, o);
  });
  const n = z(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([r, o]) => {
    if (r === "tool_calls") {
      zC(e, o);
      return;
    }
    go(e, r, o);
  });
}
function Kt(e = {}) {
  return ia(e?.content);
}
function Wt(e = {}) {
  return oa(e?.tool_calls || []);
}
function YC(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return z(JSON.parse(e));
  } catch {
    return !1;
  }
}
function Fp(e) {
  if (!Array.isArray(e) || !e.some((t) => rs(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], r = z(n?.function) ? n.function : null, o = String(r?.name || "").trim();
    let i = "";
    if (!z(n) || !r ? i = "invalid_function_shape" : o ? YC(r.arguments) ? OC(n) && (i = "invalid_thought_signature") : i = "invalid_function_arguments" : i = "missing_function_name", i) return {
      index: t,
      toolName: o,
      reason: i
    };
  }
  return null;
}
function zt(e = {}) {
  const t = Fp(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function XC(e, t) {
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
var QC = 600 * 1e3, Yn = /* @__PURE__ */ new Map();
function Gp(e = {}) {
  return `${String(e.baseUrl || "https://api.openai.com/v1").trim().replace(/\/+$/, "")}\0${String(e.model || "").trim()}`;
}
function Op(e = {}) {
  const t = Gp(e), n = Yn.get(t);
  return Number.isFinite(n) ? n > Date.now() ? !0 : (Yn.delete(t), !1) : !1;
}
function Bp(e = {}) {
  const t = Date.now();
  Yn.forEach((n, r) => {
    (!Number.isFinite(n) || n <= t) && Yn.delete(r);
  }), Yn.set(Gp(e), t + QC);
}
function _o(e, t, n = /* @__PURE__ */ new Set()) {
  if (e != null) {
    if (typeof e == "string") {
      t.push(e);
      const r = e.trim();
      if (r.startsWith("{") && r.endsWith("}") || r.startsWith("[") && r.endsWith("]")) try {
        _o(JSON.parse(r), t, n);
      } catch {
      }
      return;
    }
    typeof e != "object" || n.has(e) || (n.add(e), Object.values(e).forEach((r) => {
      _o(r, t, n);
    }));
  }
}
function qp(e) {
  const t = Number(e?.status ?? e?.response?.status ?? 0);
  if (t !== 400 && t !== 422) return !1;
  const n = [
    e?.message,
    e?.code,
    e?.param
  ].filter(Boolean);
  _o(e?.error, n), _o(e?.body, n);
  const r = n.join(" ").toLowerCase();
  if (!/reasoning[_ -]?effort/.test(r)) return !1;
  const o = String(e?.code || e?.error?.code || "").toLowerCase(), i = String(e?.param || e?.error?.param || "").toLowerCase();
  return /reasoning[_ -]?effort/.test(i) && /(unsupported_parameter|unknown_parameter|unrecognized_parameter|extra_forbidden)/.test(o) ? !0 : /(?:unsupported|unknown|unrecognized|unexpected|invalid)\s+(?:request\s+)?(?:parameter|field|argument)(?:\s+supplied)?\s*:?\s*['"]?reasoning[_ -]?effort/.test(r) || /(?:parameter|field|argument)\s*['"]?reasoning[_ -]?effort['"]?\s+(?:is\s+)?(?:not supported|not allowed|not permitted)/.test(r) || /reasoning[_ -]?effort['"]?\s+(?:is\s+)?(?:an?\s+)?(?:unsupported|unknown|unrecognized|unexpected)\s+(?:parameter|field|argument)/.test(r) || /reasoning[_ -]?effort[\s\S]*extra inputs?[\s\S]*(?:not permitted|forbidden)/.test(r) || /extra inputs?[\s\S]*(?:not permitted|forbidden)[\s\S]*reasoning[_ -]?effort/.test(r) || /unknown name\s*['"]?reasoning[_ -]?effort['"]?/.test(r) || /reasoning[_ -]?effort['"]?\s*:?\s*cannot find field/.test(r);
}
var ZC = class {
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
      messages: t ? as(e, this.config.model) : ss(e, this.config.model),
      ...n ? {
        tools: n,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !e.reasoning?.enabled && typeof e.temperature == "number" && (r.temperature = e.temperature), e.reasoning?.enabled && !Op(this.config) && (r.reasoning_effort = e.reasoning.effort), r;
  }
  async requestWithReasoningEffortFallback(e, t, n, r = {}) {
    try {
      return {
        result: await n(t),
        body: t
      };
    } catch (o) {
      if (e.signal?.aborted || typeof r.canRetry == "function" && !r.canRetry() || !Object.prototype.hasOwnProperty.call(t, "reasoning_effort") || !qp(o)) throw o;
      Bp(this.config);
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
    }, o = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = !!e.reasoning?.enabled && !Object.prototype.hasOwnProperty.call(r, "reasoning_effort");
    return {
      ...Zn({
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
    await XC(o, (g) => {
      u = g?.model || u;
      const _ = g?.choices?.[0];
      ls(i, _), _?.finish_reason && (a = _.finish_reason);
      const y = Ct(Kt(i)), S = Wt(i), w = S.length ? S : os(y.cleaned);
      yc(e, {
        text: S.length ? y.cleaned : It(y.cleaned),
        thoughts: ct(i, _).concat(y.thoughts),
        ...w.length ? { toolCalls: w } : {},
        ...!S.length && w.length ? { toolCallDraft: !0 } : {}
      });
    }), zt(i);
    const c = zn(i), d = Wt(i), h = Ct(Kt(i)), f = ct(i, {});
    h.thoughts.forEach((g) => f.push(g));
    const p = d.length ? [] : Wn(h.cleaned), m = [...d, ...p];
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
    const i = async (y, S = {}) => {
      const w = await this.requestWithReasoningEffortFallback(e, r, y, S);
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
      }, { signal: e.signal })), S = { role: "assistant" };
      let w = "stop", b = this.config.model, P;
      for await (const W of y) {
        b = W.model || b;
        const J = W.choices?.[0];
        ls(S, J), J?.finish_reason && (w = J.finish_reason);
        const K = Ct(Kt(S)), fe = Wt(S), Je = fe.length ? fe : os(K.cleaned);
        yc(e, {
          text: fe.length ? K.cleaned : It(K.cleaned),
          thoughts: ct(S, J).concat(K.thoughts),
          ...Je.length ? { toolCalls: Je } : {},
          ...!fe.length && Je.length ? { toolCallDraft: !0 } : {}
        });
      }
      const k = (typeof y.finalChatCompletion == "function" ? await y.finalChatCompletion() : null)?.choices?.[0] || null, E = k?.message || S;
      zt(E);
      const L = WC(S, mo(E, k || {}));
      zt(L), P = zn(L);
      const C = Wt(L), M = Ct(Kt(L)), F = ct(L, k || {});
      M.thoughts.forEach((W) => F.push(W));
      const H = C.length ? [] : Wn(M.cleaned), ae = [...C, ...H];
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
    zt(c);
    const d = ct(c, u), h = oa(c.tool_calls || []), f = Ct(ia(c.content));
    f.thoughts.forEach((y) => d.push(y));
    const p = h.length ? [] : Wn(f.cleaned), m = [...h, ...p], g = h.length ? f.cleaned : It(f.cleaned), _ = mo(c, u);
    return {
      text: g,
      toolCalls: m,
      thoughts: d,
      finishReason: u.finish_reason || "stop",
      model: a.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: zn(_),
      requestInspection: o
    };
  }
};
function Hp(e, t) {
  return {
    type: "message",
    role: e,
    content: jC(t)
  };
}
function yo(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function jC(e) {
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
function vo(e, t, n) {
  const r = String(n || "").trim();
  r && e.push({
    label: t,
    text: r
  });
}
function vc(e, t = [], n = {}) {
  (t || []).forEach((r) => {
    if (!(!r || typeof r != "object")) {
      if (r.type === "reasoning_text") {
        vo(e, n.reasoning || "推理文本", r.text);
        return;
      }
      r.type === "summary_text" && vo(e, n.summary || "推理摘要", r.text);
    }
  });
}
function eI(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (vc(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), vc(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function tI(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function nI(e) {
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
function rI(e) {
  const t = e?.choices?.[0], n = t?.message?.content, r = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const o = n.toLowerCase();
  return !o.includes("proxy error") || !o.includes("/responses") && !r.toLowerCase().includes("proxy error") ? null : n.trim();
}
function oI(e) {
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
        n.content?.trim() && t.push(yo(n.content)), n.tool_calls.forEach((r, o) => {
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
        t.push(yo(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? Hp(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function iI(e) {
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
      n.content?.trim() && t.push(yo(n.content)), n.tool_calls.forEach((r, o) => {
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
      t.push(yo(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? Hp(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function sI(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function aI(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function lI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function li(e, t) {
  const [n = "0", r = "0"] = String(e || "").split(":"), [o = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(o) || Number(r) - Number(i);
}
var uI = class {
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
      instructions: t ? void 0 : tI(e) || void 0,
      input: t ? iI(e) : oI(e),
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
    return Zn({
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
      const d = rI(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const h = Array.isArray(c.output) ? c.output : [];
      return {
        output: h,
        thoughts: eI(h),
        toolCalls: h.filter((f) => f.type === "function_call" && f.name).map((f, p) => ({
          id: f.call_id || `response-tool-${p + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: nI(c)
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
        Array.from(p.entries()).sort(([y], [S]) => li(y, S)).forEach(([, y]) => vo(_, "推理文本", y)), Array.from(m.entries()).sort(([y], [S]) => li(y, S)).forEach(([, y]) => vo(_, "推理摘要", y)), lI(e, {
          text: Array.from(f.entries()).sort(([y], [S]) => li(y, S)).map(([, y]) => y).join(`
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
    }, i = !sI(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await o(!1) : await r(!1), u = n(a), i && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await o(!0) : await r(!0), u = n(a));
    } catch (c) {
      if (!i || !aI(c)) throw c;
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
async function cI(e, t) {
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
var aa = "openai", Vp = "claude", Jp = "makersuite", dI = "/api/backends/chat-completions/generate", fI = Object.freeze({
  [Vp]: "https://api.anthropic.com/v1",
  [Jp]: "https://generativelanguage.googleapis.com"
}), Kp = null;
function hI(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function pI(e, t) {
  const n = hI(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function c0(e) {
  Kp = typeof e == "function" ? e : null;
}
async function mI() {
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(Kp?.() || {}),
    Accept: "application/json"
  };
}
function gI(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, r]) => {
    t[n] = /authorization|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : r;
  }), t;
}
async function fr(e = {}, t = !1) {
  const n = await mI(), r = {
    url: dI,
    method: "POST",
    headers: gI(n),
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
function _I(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function yI(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function vI() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function Ac(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function Tc(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => Ac(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => Ac(n));
}
function AI(e = "") {
  const t = String(e || ""), n = Tc((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), r = Tc(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), o = n || r;
  return o.length > 240 ? `${o.slice(0, 237)}...` : o;
}
function TI(e = null) {
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
function SI(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function Ao(e = "", t = "", n = null) {
  if (yI(e)) return vI();
  const r = TI(n);
  if (_I(e) || /\btext\/html\b/i.test(r.contentType)) {
    const o = SI(r), i = AI(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      o ? `（${o}）` : "",
      i ? `：${i}` : ""
    ].join("");
  }
  return String(e || t || "").trim();
}
function EI(e = {}, t = aa) {
  const n = pI(e.baseUrl, t), r = String(e.apiKey || "").trim(), o = fI[t] || "", i = n || (r ? o : ""), a = { chat_completion_source: t || "openai" };
  return i && (a.reverse_proxy = i), r && (a.proxy_password = r), a;
}
function wI(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function la(e = {}, t = {}, n = [], r = !1, o = aa) {
  return wI({
    ...EI(e, o),
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
function CI(e = {}, t = {}, n = [], r = !1) {
  return la(e, t, n, r, aa);
}
function II(e = {}, t = {}, n = [], r = !1) {
  return la(e, t, n, r, Vp);
}
function bI(e = {}, t = {}, n = [], r = !1) {
  return la(e, t, n, r, Jp);
}
async function ua(e = {}, t = {}) {
  const n = await fr(e, !1);
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
    const u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${Ao(o, String(a?.message || a), r)}`);
    throw u.status = r.status, u.body = o, u;
  }
  if (!r.ok || i?.error) {
    const a = Ao(i?.error?.message || i?.message || o, `HTTP ${r.status}`, r), u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${a}`);
    throw u.status = r.status, u.error = i?.error, u;
  }
  return i;
}
async function ca(e = {}, t, n = {}) {
  const r = await fr(e, !0);
  typeof n.onRequest == "function" && n.onRequest(r);
  const o = await fetch(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!o.ok) {
    const i = await o.text().catch(() => ""), a = new Error(Ao(i, `酒馆后端流式生成失败：HTTP ${o.status}`, o));
    throw a.status = o.status, a.body = i, a;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await cI(o, (i) => {
    if (i?.error) {
      const a = Ao(i.error?.message || i.message || JSON.stringify(i.error), "酒馆后端流式生成失败");
      throw new Error(a);
    }
    t(i);
  });
}
function Mt(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function RI(e) {
  const t = String(e || "").trim();
  if (!t || t === "auto") return "auto";
  if (t === "required") return "any";
  if (t === "none") return "none";
  throw new Error(`酒馆托管 Claude 不支持 tool_choice：${t}。仅支持 auto/required/none。`);
}
var PI = /^claude-(3-7|opus-4|sonnet-4|haiku-4-5|opus-4-5|opus-4-6|sonnet-4-6|opus-4-7)/, MI = /^claude-opus-4-7/;
function xI(e = {}, t = {}) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const n = RI(t.toolChoice), r = String(e.model || "").trim(), o = PI.test(r) && !MI.test(r);
  return {
    toolChoice: n,
    reasoningDisabledForForcedTool: n === "any" && t.reasoning?.enabled === !0 && o
  };
}
var NI = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function DI(e = {}, t = {}) {
  const n = e.reasoning?.enabled === !0 && t.reasoningDisabledForForcedTool !== !0;
  return {
    toolChoice: String(t.toolChoice || ""),
    reasoningEnabled: n,
    reasoningEffort: n ? String(e.reasoning?.effort || "") : ""
  };
}
function Wp(e = "") {
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
function kI(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const r = Wp(t.function.arguments || "{}");
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
function $I(e = []) {
  const t = Array.isArray(e) ? Mt(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function LI(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const i = Mt(o) || {}, a = $I(i?.providerPayload?.anthropicContent), u = kI(i.tool_calls);
    delete i.providerPayload, i.role === "assistant" && a && u.length ? (delete i.tool_calls, i.content = a.filter((c) => c?.type !== "tool_use").concat(u)) : i.role === "assistant" && a && (delete i.tool_calls, i.content = a), n.push(i);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function UI(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const r = Wp(t.inputJson);
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
      const n = Mt(t.input);
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
    } : Mt(t) || null;
  }).filter(Boolean);
}
function FI(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: Mt(t.input) || {}
  } : Mt(t) || null).filter(Boolean);
}
function GI(e = []) {
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
function zp(e = [], t = {}) {
  const n = UI(e), r = n.filter((o) => o.type === "tool_use" && o.name).map((o, i) => ({
    id: o.id || `st-claude-tool-${i + 1}`,
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
    providerPayload: n.length ? { anthropicContent: FI(n) } : void 0
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
function BI(e, t = {}) {
  const n = [];
  let r = "stop", o = t.model || "";
  const i = (u, c = {}) => {
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
      if (u?.message?.model && (o = u.message.model), u.type === "content_block_start") {
        i(u.index, Mt(u.content_block) || {}), a();
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
      return zp(n, {
        finishReason: r,
        model: o
      });
    }
  };
}
var qI = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return LI(e);
  }
  resolveToolProtocol(e) {
    return xI(this.config, e);
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
    return II(this.config, o, r, n);
  }
  async inspectRequest(e, t = {}) {
    const n = this.resolveToolProtocol(e), r = await fr(t.payload || this.buildPayload(e, n), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(r, n, e);
  }
  buildRequestInspection(e, t = {}, n = {}) {
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Zt(e),
      effectiveConfig: DI(n, t),
      ...t.reasoningDisabledForForcedTool ? { notices: [NI] } : {}
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
        const u = BI(e, this.config);
        return await ca(r, (c) => {
          u.accept(c);
        }, {
          signal: e.signal,
          onRequest: i
        }), {
          ...u.result(),
          requestInspection: o
        };
      }
      const a = await ua(r, {
        signal: e.signal,
        onRequest: i
      });
      return {
        ...zp(Array.isArray(a?.content) ? a.content : [{
          type: "text",
          text: a?.choices?.[0]?.message?.content || ""
        }], {
          finishReason: a?.stop_reason || a?.choices?.[0]?.finish_reason || "stop",
          model: a?.model || this.config.model
        }),
        requestInspection: o
      };
    } catch (a) {
      throw o && a && typeof a == "object" && (a.requestInspection = o), a;
    }
  }
};
function da(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function jt(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = da(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function HI(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((o) => jt(o)).filter((o) => Array.isArray(o.parts) && o.parts.length);
  const n = e?.providerPayload?.googleContent, r = jt(n);
  return r.parts.length ? [r] : [];
}
function VI(e = {}) {
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
function JI(e = {}, t = 0) {
  const n = jt(e);
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
    const u = VI(a.inlineData);
    u && r.content.push(u);
  }), i.length && r.content.push({
    type: "tool_calls",
    tool_calls: i
  }), o && r.content.some((a) => a?.type === "text") && (r.signature = o), r.content.length ? r : null;
}
function KI(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((o) => {
    if (!o || typeof o != "object") return;
    const i = HI(o);
    if (o.role === "assistant" && i.length) {
      i.forEach((u, c) => {
        const d = JI(u, c);
        d && n.push(d);
      });
      return;
    }
    const a = da(o) || {};
    delete a.providerPayload, n.push(a);
  });
  const r = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return r.trim() && !(n[0]?.role === "system" && n[0]?.content === r) && n.unshift({
    role: "system",
    content: r
  }), n;
}
function Yp(e = {}) {
  return jt(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function Xp(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function Qp(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function Zp(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function WI(e, t) {
  const n = String(t || ""), r = String(e || "");
  return n ? !r || n.startsWith(r) ? n : r.endsWith(n) ? r : `${r}${n}` : r;
}
function zI(e = [], t = []) {
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
function jp(e) {
  const t = jt(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function YI(e = {}, t = {}) {
  const n = Yp(e), r = e?.choices?.[0]?.message?.content || "";
  return {
    text: Xp(n) || r,
    toolCalls: Zp(n),
    thoughts: Qp(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: jp(n)
  };
}
function XI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function QI(e, t = {}) {
  let n = "", r = [], o = [], i = "STOP", a = t.model || "";
  const u = [];
  return {
    accept(c = {}) {
      a = c.model || c.modelVersion || a, i = c?.candidates?.[0]?.finishReason || i;
      const d = Yp(c);
      d.parts.length && u.push(...da(d.parts) || []), n = WI(n, Xp(d)), r = zI(r, Zp(d));
      const h = Qp(d);
      h.length && (o = h), XI(e, {
        text: n,
        thoughts: o,
        ...r.length ? {
          toolCalls: r,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const c = jt({
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
        providerPayload: jp(c)
      };
    }
  };
}
var ZI = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return KI(e);
  }
  buildPayload(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildMessages(e);
    return bI(this.config, e, n, t);
  }
  async inspectRequest(e, t = {}) {
    const n = await fr(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n);
  }
  buildRequestInspection(e) {
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Zt(e)
    };
  }
  async chat(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildPayload(e);
    let r = null;
    const o = (i) => {
      r = this.buildRequestInspection(i);
    };
    try {
      if (t) {
        const i = QI(e, this.config);
        return await ca(n, (a) => {
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
        ...YI(await ua(n, {
          signal: e.signal,
          onRequest: o
        }), { model: this.config.model }),
        requestInspection: r
      };
    } catch (i) {
      throw r && i && typeof i == "object" && (i.requestInspection = r), i;
    }
  }
};
function jI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function ui(e, t = []) {
  const n = Ct(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : It(n.cleaned)
  };
}
function e0(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var t0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? as(e, this.config.model) : ss(e, this.config.model);
  }
  buildPayload(e, t = !1) {
    const n = t ? as(e, this.config.model) : ss(e, this.config.model), r = CI(this.config, t ? {
      ...e,
      tools: void 0,
      toolChoice: void 0
    } : e, n, typeof e.onStreamProgress == "function");
    return e.reasoning?.enabled && Op(this.config) && delete r.reasoning_effort, r;
  }
  async inspectRequest(e, t = {}) {
    const n = await fr(t.payload || this.buildPayload(e, !!t.taggedMode), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = !!t.reasoning?.enabled && !Object.prototype.hasOwnProperty.call(e?.body || {}, "reasoning_effort");
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Zt(e),
      ...n ? { degraded: ["reasoning_effort_unsupported"] } : {}
    };
  }
  async streamChat(e, t, n = {}) {
    const r = { role: "assistant" };
    let o = "stop", i = this.config.model;
    await ca(t, (f) => {
      i = f?.model || i;
      const p = f?.choices?.[0] || {};
      ls(r, p), p.finish_reason && (o = p.finish_reason);
      const m = Wt(r), { thinkTagged: g, cleanedText: _ } = ui(Kt(r), m), y = m.length ? m : os(g.cleaned);
      jI(e, {
        text: _,
        thoughts: ct(r, p).concat(g.thoughts),
        ...y.length ? { toolCalls: y } : {},
        ...!m.length && y.length ? { toolCallDraft: !0 } : {}
      });
    }, {
      signal: e.signal,
      onRequest: n.onRequest,
      onResponseAccepted: n.onResponseAccepted
    }), zt(r);
    const a = Wt(r), { thinkTagged: u, cleanedText: c } = ui(Kt(r), a), d = ct(r, {});
    u.thoughts.forEach((f) => d.push(f));
    const h = a.length ? [] : Wn(u.cleaned);
    return {
      text: c,
      toolCalls: [...a, ...h],
      thoughts: d,
      finishReason: o,
      model: i,
      provider: "sillytavern-openai-compatible",
      providerPayload: zn(r)
    };
  }
  async nonStreamingChat(e, t, n = {}) {
    const r = await ua(t, {
      signal: e.signal,
      onRequest: n.onRequest
    }), o = r.choices?.[0] || {}, i = o.message || {};
    zt(i);
    const a = ct(i, o), u = oa(i.tool_calls || []), { thinkTagged: c, cleanedText: d } = ui(ia(i.content), u);
    c.thoughts.forEach((p) => a.push(p));
    const h = u.length ? [] : Wn(c.cleaned), f = mo(i, o);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: a,
      finishReason: o.finish_reason || "stop",
      model: r.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: zn(f)
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
        if (e.signal?.aborted || u || !Object.prototype.hasOwnProperty.call(a, "reasoning_effort") || !qp(c)) throw c;
        Bp(this.config);
        const d = { ...a };
        return delete d.reasoning_effort, await r(d);
      }
    }, i = this.buildPayload(e, t);
    try {
      return await o(i);
    } catch (a) {
      if (e.allowToolProtocolFallback === !1 || t || !n || !e0(a)) throw a;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await o(this.buildPayload(e, !0));
  }
};
function d0(e = {}, t = {}) {
  if (!e.apiKey && !pm(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (e.provider) {
    case "sillytavern-openai-compatible":
      return new t0(e);
    case "sillytavern-claude":
      return new qI(e);
    case "sillytavern-google":
      return new ZI(e);
    case "openai-responses":
      return new uI(e);
    case "anthropic":
      return new mg(e);
    case "google":
      return new hw(e);
    default:
      return new ZC(e);
  }
}
export {
  i0 as AGENT_REQUEST_TIMEOUT_MS,
  hm as PROVIDER_OPTIONS,
  d0 as createAgentAdapter,
  a0 as getProviderLabel,
  l0 as getToolModeLabel,
  pm as isSillyTavernProvider,
  dm as normalizeAgentConfig,
  o0 as normalizeAgentSettings,
  Zt as redactRequestSecrets,
  u0 as resolveActiveProviderConfig,
  c0 as setHostChatCompletionsRequestHeadersProvider
};
