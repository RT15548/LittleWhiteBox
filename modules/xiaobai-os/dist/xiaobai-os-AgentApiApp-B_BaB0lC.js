/* eslint-disable */
import { D as $t, H as xe, J as we, K as Bt, T as jt, V as Ft, W as lt, b as Kt, f as qe, g as Ie, h as zt, k as _e, p as w, s as Ht, w as Gt, z as Jt } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
var Vt = "https://api.tavily.com";
function Wt(t = "") {
  return String(t || "").trim();
}
function F(t = "") {
  return String(t || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var Pa = Object.freeze([
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
]);
function Yt(t = "") {
  return t === "on" || t === "off" ? t : "inherit";
}
function Xt(t) {
  return String(t ?? "").trim().toLowerCase() || void 0;
}
function Zt(t) {
  if (t == null || t === "") return;
  const n = Number(t);
  return Number.isFinite(n) ? Math.floor(n) : void 0;
}
function le(t = {}) {
  const n = t && typeof t == "object" ? t : {}, s = Xt(n.effort), i = Zt(n.budgetTokens);
  return {
    mode: Yt(n.mode),
    ...s ? { effort: s } : {},
    ...i !== void 0 ? { budgetTokens: i } : {}
  };
}
var bt = "openai-compatible", De = "默认", vt = "default", Qt = "deny", G = 32e3, en = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), tn = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), Le = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: G,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: G,
    sendTemperature: !0,
    toolMode: "tagged-json"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: G,
    sendTemperature: !0,
    toolMode: "tagged-json"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: G,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: G,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: G,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: G,
    sendTemperature: !0
  }
};
function yt() {
  return JSON.parse(JSON.stringify(Le));
}
function _() {
  return {
    provider: bt,
    modelConfigs: yt(),
    permissionMode: vt
  };
}
function St(t = _()) {
  const n = t && typeof t == "object" ? t : _();
  return {
    provider: $e(n.provider),
    modelConfigs: I(n.modelConfigs || {})
  };
}
function oe(t) {
  return t === "full" ? "full" : vt;
}
function Y(t) {
  return t === "allow" ? "allow" : Qt;
}
function N(t, n = G) {
  const s = Number(t);
  if (!Number.isFinite(s) || s <= 0) {
    const i = Number(n);
    return Number.isFinite(i) && i > 0 ? Math.floor(i) : G;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(s));
}
function P(t) {
  return String(t || "").trim() || "默认";
}
function I(t = {}) {
  const n = yt();
  return Object.keys(Le).forEach((s) => {
    const i = t && typeof t[s] == "object" ? t[s] : {}, o = Le[s];
    n[s] = {
      baseUrl: String(i.baseUrl ?? o.baseUrl ?? ""),
      model: String(i.model ?? o.model ?? ""),
      apiKey: String(i.apiKey ?? o.apiKey ?? ""),
      temperature: i.temperature ?? o.temperature,
      maxTokens: N(i.maxTokens, o.maxTokens),
      sendTemperature: typeof i.sendTemperature == "boolean" ? i.sendTemperature : o.sendTemperature,
      ..."toolMode" in o ? { toolMode: String(i.toolMode || o.toolMode || "native") } : {},
      reasoning: le(i.reasoning)
    };
  }), n;
}
function $e(t) {
  return typeof t == "string" && t.trim() ? t : bt;
}
function Be(t = {}, n) {
  return t && typeof t.presets == "object" && t.presets ? t.presets : t?.modelConfigs ? { [n]: {
    provider: t.provider || "openai-compatible",
    modelConfigs: t.modelConfigs,
    permissionMode: t.permissionMode
  } } : {};
}
function nn(t = {}, n) {
  const s = {}, i = Be(t, n);
  return Object.entries(i).forEach(([o, d]) => {
    if (!d || typeof d != "object") return;
    const u = P(o);
    s[u] = {
      provider: $e(d.provider),
      modelConfigs: I(d.modelConfigs || {}),
      permissionMode: oe(d.permissionMode)
    };
  }), Object.keys(s).length || (s[De] = _()), s;
}
function an(t, n) {
  const s = P(n);
  return t[s] ? s : Object.keys(t)[0];
}
function sn(t, n, s) {
  const i = P(n || s);
  return t[i] ? i : t[s] ? s : Object.keys(t)[0];
}
function xt(t = {}, n = _()) {
  const s = St(n), i = t && typeof t == "object" ? t : {};
  return {
    provider: $e(i.provider || s.provider),
    modelConfigs: I(i.modelConfigs || s.modelConfigs)
  };
}
function rn(t = {}, n = {}, s = De, i = s) {
  if (t?.delegateConfigured === !1) return !1;
  if (i !== s) return !0;
  const o = t?.delegateConfig;
  if (!o || typeof o != "object" || Array.isArray(o) || !(typeof o.provider == "string" && o.provider.trim() || o.modelConfigs && typeof o.modelConfigs == "object" && Object.keys(o.modelConfigs).length)) return !1;
  if (t?.delegateConfigured === !0) return !0;
  const d = n[s] || _(), u = St(d), g = xt(o, d);
  return JSON.stringify(g) !== JSON.stringify(u);
}
function on(t = {}, n, s, i, o) {
  const d = o(t?.[i]);
  if (d) return d;
  const u = Be(t, n), g = [
    s,
    n,
    t?.currentPresetName,
    t?.delegatePresetName,
    ...Object.keys(u || {})
  ].map(P), m = /* @__PURE__ */ new Set();
  for (const v of g) {
    if (m.has(v)) continue;
    m.add(v);
    const p = o(u?.[v]?.[i]);
    if (p) return p;
  }
  return o(t?.delegateConfig?.[i]);
}
function ln(t = {}, n, s) {
  const i = (g) => String(g || "").trim();
  if (i(t?.tavilyBaseUrl)) return F(t.tavilyBaseUrl);
  const o = Be(t, n), d = [
    s,
    n,
    t?.currentPresetName,
    t?.delegatePresetName,
    ...Object.keys(o || {})
  ].map(P), u = /* @__PURE__ */ new Set();
  for (const g of d) {
    if (u.has(g)) continue;
    u.add(g);
    const m = o?.[g]?.tavilyBaseUrl;
    if (i(m)) return F(m);
  }
  return i(t?.delegateConfig?.tavilyBaseUrl) ? F(t.delegateConfig.tavilyBaseUrl) : Vt;
}
function dn(t = {}, n, s) {
  return {
    tavilyApiKey: on(t, n, s, "tavilyApiKey", Wt),
    tavilyBaseUrl: ln(t, n, s)
  };
}
function ke(t = {}) {
  const n = P(t.currentPresetName || t.presetDraftName || "默认"), s = nn(t, n), i = an(s, t.currentPresetName), o = sn(s, t.delegatePresetName, i), d = s[i] || _(), u = s[o] || d, g = xt(t.delegateConfig, u), m = rn(t, s, i, o), v = dn(t, n, i);
  return {
    workspaceFileName: String(t.workspaceFileName || ""),
    updatedAt: Number(t.updatedAt) || 0,
    jsApiPermission: Y(t.jsApiPermission),
    currentPresetName: i,
    delegatePresetName: o,
    delegateConfig: g,
    delegateConfigured: m,
    presetDraftName: P(t.presetDraftName || i),
    presetNames: Object.keys(s),
    presets: s,
    provider: d.provider,
    modelConfigs: d.modelConfigs,
    permissionMode: oe(d.permissionMode),
    tavilyApiKey: v.tavilyApiKey,
    tavilyBaseUrl: v.tavilyBaseUrl
  };
}
async function un(t, n) {
  const s = t.body?.getReader?.();
  if (!s) throw new Error("host_chat_completions_stream_missing_body");
  const i = new TextDecoder();
  let o = "";
  const d = /\r?\n\r?\n/, u = (m) => {
    const v = m.split(/\r?\n/).filter((p) => p.startsWith("data:")).map((p) => p.slice(5).trimStart()).join(`
`).trim();
    !v || v === "[DONE]" || n(JSON.parse(v));
  };
  for (; ; ) {
    const { done: m, value: v } = await s.read();
    if (m) break;
    for (o += i.decode(v, { stream: !0 }); ; ) {
      const p = o.match(d);
      if (!p || typeof p.index != "number") break;
      const L = o.slice(0, p.index);
      o = o.slice(p.index + p[0].length), u(L);
    }
  }
  const g = o.trim();
  g && u(g);
}
function cn(t = "") {
  return String(t || "").trim().toLowerCase();
}
function pn(t = "") {
  const n = cn(t);
  return n.includes("deepseek") ? "deepseek" : n.includes("kimi") || n.includes("moonshot") ? "kimi" : n.includes("gemini") ? "gemini" : n.includes("claude") ? "claude" : /(?:^|[/_.-])gpt(?:\d|[/_.-]|$)/.test(n) || /(?:^|[/_.-])o\d+(?:[/_.-]|$)/.test(n) ? "openai" : "";
}
var ce = "openai", ht = "claude", Tt = "makersuite", gn = "/api/backends/chat-completions/status", mn = "/api/backends/chat-completions/generate", Pt = Object.freeze({
  [ht]: "https://api.anthropic.com/v1",
  [Tt]: "https://generativelanguage.googleapis.com"
}), fe = null;
function fn(t) {
  return String(t || "").trim().replace(/\/+$/, "");
}
function bn(t, n) {
  const s = fn(t);
  return n === "claude" ? !s || /\/v\d[\w.-]*$/i.test(s) ? s : `${s}/v1` : n === "makersuite" ? s.replace(/\/v\d[\w.-]*$/i, "") : s;
}
async function Mt(t = fe) {
  if (typeof t != "function") throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(t() || {}),
    Accept: "application/json"
  };
}
function vn(t = {}) {
  const n = {};
  return Object.entries(t || {}).forEach(([s, i]) => {
    n[s] = /authorization|cookie|csrf|token|api[-_]?key/i.test(s) ? "[redacted]" : i;
  }), n;
}
async function je(t = {}, n = !1, s = fe) {
  const i = await Mt(s), o = {
    url: mn,
    method: "POST",
    headers: vn(i),
    body: {
      ...t,
      stream: !!n
    }
  };
  return Object.defineProperty(o, "rawHeaders", {
    value: i,
    enumerable: !1
  }), o;
}
async function yn(t = {}, n = !1) {
  return await je(t, n);
}
function Sn(t = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(t || ""));
}
function xn(t = "") {
  return /invalid csrf token/i.test(String(t || ""));
}
function hn() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function dt(t = "", n = 10) {
  const s = Number.parseInt(String(t || ""), n);
  return Number.isInteger(s) && s >= 0 && s <= 1114111 ? String.fromCodePoint(s) : "";
}
function ut(t = "") {
  return String(t || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (n, s) => dt(s, 16)).replace(/&#([0-9]+);?/g, (n, s) => dt(s));
}
function Tn(t = "") {
  const n = String(t || ""), s = ut((n.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), i = ut(n.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), o = s || i;
  return o.length > 240 ? `${o.slice(0, 237)}...` : o;
}
function Pn(t = null) {
  const n = Number(t?.status), s = String(t?.statusText || "").trim();
  let i = "";
  try {
    i = String(t?.headers?.get?.("content-type") || "").trim();
  } catch {
    i = "";
  }
  return {
    status: Number.isFinite(n) && n > 0 ? n : 0,
    statusText: s,
    contentType: i
  };
}
function Mn(t = {}) {
  return t.status ? `HTTP ${t.status}${t.statusText ? ` ${t.statusText}` : ""}` : "";
}
function An(t = "") {
  const n = String(t || "").trim();
  if (!n || n[0] !== "{" && n[0] !== "[") return "";
  try {
    const s = JSON.parse(n), i = s?.error?.message;
    if (typeof i == "string" && i.trim()) return i.trim();
    if (typeof s?.message == "string" && s.message.trim()) return s.message.trim();
  } catch {
    return "";
  }
  return "";
}
function de(t = "", n = "", s = null) {
  if (xn(t)) return hn();
  const i = Pn(s);
  if (Sn(t) || /\btext\/html\b/i.test(i.contentType)) {
    const o = Mn(i), d = Tn(t);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      o ? `（${o}）` : "",
      d ? `：${d}` : ""
    ].join("");
  }
  return An(t) || String(t || n || "").trim();
}
function kn(t = {}, n = ce) {
  const s = bn(t.baseUrl, n), i = String(t.apiKey || "").trim(), o = Pt[n] || "", d = s || (i ? o : ""), u = { chat_completion_source: n || "openai" };
  return d && (u.reverse_proxy = d), i && (u.proxy_password = i), u;
}
function En(t = {}, n = ce) {
  return kn(t, n);
}
function Fe(t) {
  const n = t || globalThis.fetch;
  if (typeof n != "function") throw new Error("当前运行环境没有可用的 fetch，无法调用酒馆后端。");
  return n;
}
async function Cn(t = {}, n = ce, s = {}, i = {}) {
  const o = await Fe(i.fetch)(gn, {
    method: "POST",
    headers: await Mt(i.requestHeadersProvider),
    body: JSON.stringify(En(t, n)),
    signal: s.signal
  }), d = await o.text();
  let u = null;
  try {
    u = d ? JSON.parse(d) : {};
  } catch (m) {
    throw new Error(`酒馆后端模型列表拉取失败：${de(d, String(m?.message || m), o)}`);
  }
  if (!o.ok || u?.error) {
    const m = de(u?.message || u?.error?.message || d, `HTTP ${o.status}`, o);
    throw new Error(`酒馆后端模型列表拉取失败：${m}`);
  }
  const g = Array.isArray(u?.data) ? u.data.map((m) => String(m?.id || m?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(g)];
}
async function Ke(t = {}, n = ce, s = {}) {
  return await Cn(t, n, s, { requestHeadersProvider: fe });
}
async function Nn(t = {}, n = {}) {
  return await Ke(t, ce, n);
}
async function On(t = {}, n = {}, s = {}) {
  const i = await je(t, !1, s.requestHeadersProvider);
  typeof n.onRequest == "function" && n.onRequest(i);
  const o = await Fe(s.fetch)(i.url, {
    method: i.method,
    headers: i.rawHeaders || i.headers,
    body: JSON.stringify(i.body),
    signal: n.signal
  }), d = await o.text();
  let u = null;
  try {
    u = d ? JSON.parse(d) : {};
  } catch (g) {
    const m = /* @__PURE__ */ new Error(`酒馆后端生成失败：${de(d, String(g?.message || g), o)}`);
    throw m.status = o.status, m.body = d, m;
  }
  if (!o.ok || u?.error) {
    const g = de(u?.error?.message || u?.message || d, `HTTP ${o.status}`, o), m = /* @__PURE__ */ new Error(`酒馆后端生成失败：${g}`);
    throw m.status = o.status, m.error = u?.error, m;
  }
  return u;
}
async function wn(t = {}, n = {}) {
  return await On(t, n, { requestHeadersProvider: fe });
}
async function qn(t = {}, n, s = {}, i = {}) {
  const o = await je(t, !0, i.requestHeadersProvider);
  typeof s.onRequest == "function" && s.onRequest(o);
  const d = await Fe(i.fetch)(o.url, {
    method: o.method,
    headers: o.rawHeaders || o.headers,
    body: JSON.stringify(o.body),
    signal: s.signal
  });
  if (!d.ok) {
    const u = await d.text().catch(() => ""), g = new Error(de(u, `酒馆后端流式生成失败：HTTP ${d.status}`, d));
    throw g.status = d.status, g.body = u, g;
  }
  typeof s.onResponseAccepted == "function" && s.onResponseAccepted(), await un(d, (u) => {
    if (u?.error) {
      const g = de(u.error?.message || u.message || JSON.stringify(u.error), "酒馆后端流式生成失败");
      throw new Error(g);
    }
    n(u);
  });
}
async function In(t = {}, n, s = {}) {
  return await qn(t, n, s, { requestHeadersProvider: fe });
}
var Ma = Object.freeze([
  "buildHostChatCompletionGenerateRequest",
  "createHostChatCompletion",
  "streamHostChatCompletion"
]), Aa = Object.freeze({
  buildHostChatCompletionGenerateRequest: yn,
  fetchHostChatCompletionsModels: Ke,
  fetchHostOpenAICompatibleModels: Nn,
  createHostChatCompletion: wn,
  streamHostChatCompletion: In
}), _n = Object.freeze({
  minimal: "最小",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "超高",
  max: "最大",
  min: "最小"
});
function At(t) {
  const n = t.intensity || { kind: "none" };
  return Object.freeze({
    ...t,
    modes: Object.freeze([...t.modes || ["inherit"]]),
    outputModes: Object.freeze([...t.outputModes || ["hide", "show"]]),
    temperatureOmitModes: Object.freeze([...t.temperatureOmitModes || []]),
    intensity: Object.freeze({
      ...n,
      ...Array.isArray(n.values) ? { values: Object.freeze([...n.values]) } : {}
    })
  });
}
function K(t, n, s, i, o = {}) {
  return At({
    profileId: t,
    modes: n,
    intensity: {
      kind: "effort",
      values: s,
      defaultValue: i
    },
    outputModes: o.outputModes,
    temperatureOmitModes: o.temperatureOmitModes
  });
}
var ze = At({
  profileId: "unsupported",
  modes: ["inherit"],
  outputModes: ["hide"],
  intensity: { kind: "none" },
  unsupportedReason: "当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。"
}), be = Object.freeze(["on"]), He = Object.freeze([
  "inherit",
  "on",
  "off"
]), kt = K("openai-gpt-5.6", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "medium", { temperatureOmitModes: He }), Rn = K("kimi-k3", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "max", { temperatureOmitModes: be }), Un = K("deepseek-thinking", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "high", { temperatureOmitModes: be }), Ln = K("openai-compatible-gemini-latest", [
  "inherit",
  "on",
  "off"
], [
  "minimal",
  "low",
  "medium",
  "high"
], "high", { temperatureOmitModes: be }), Dn = K("openai-compatible-claude-latest", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: be }), $n = K("openai-compatible-default", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high"
], "medium", { temperatureOmitModes: be }), Bn = K("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: He }), jn = K("sillytavern-claude-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: He }), Fn = K("google-gemini-3-flash", ["inherit", "on"], [
  "minimal",
  "low",
  "medium",
  "high"
], "high"), Kn = K("sillytavern-google-3-flash", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high"
], "high");
function zn(t = "") {
  switch (pn(t)) {
    case "deepseek":
      return Un;
    case "kimi":
      return Rn;
    case "gemini":
      return Ln;
    case "claude":
      return Dn;
    case "openai":
      return kt;
    default:
      return $n;
  }
}
function Ge(t = {}) {
  const n = String(t.provider || "").trim(), s = String(t.model || "").trim().toLowerCase();
  switch (n) {
    case "openai-responses":
      return kt;
    case "openai-compatible":
    case "sillytavern-openai-compatible":
      return zn(s);
    case "anthropic":
      return Bn;
    case "sillytavern-claude":
      return jn;
    case "google":
      return Fn;
    case "sillytavern-google":
      return Kn;
    default:
      return ze;
  }
}
function Hn(t = ze) {
  const n = new Set(t.modes || ["inherit"]);
  return [
    {
      value: "inherit",
      label: "跟随模型默认",
      disabled: !1
    },
    {
      value: "on",
      label: "开启",
      disabled: !n.has("on")
    },
    {
      value: "off",
      label: "关闭",
      disabled: !n.has("off")
    }
  ];
}
function Gn(t = ze) {
  return t.intensity?.kind !== "effort" ? [] : t.intensity.values.map((n) => ({
    value: n,
    label: _n[n] || n
  }));
}
function Re(t, n, s, i = "REASONING_CAPABILITY_UNSUPPORTED") {
  return {
    ...t,
    profileId: n.profileId,
    valid: !1,
    error: s,
    code: i
  };
}
function Jn(t, n) {
  const s = { ...t };
  return delete s.effort, delete s.budgetTokens, n.intensity?.kind === "effort" ? {
    ...s,
    ...t.effort ? { effort: t.effort } : {}
  } : s;
}
function he(t = {}, n = {}) {
  const s = Ge(t), i = le(n), o = n?.output === "show" || n?.output === "hide" ? n.output : null, d = Jn({
    ...i,
    output: i.mode === "off" ? "hide" : o || (s.outputModes.includes("show") ? "show" : "hide")
  }, s);
  if (!s.outputModes.includes(d.output)) return Re(d, s, "当前任务要求返回 Reasoning 内容，但所选模型不支持。");
  if (!s.modes.includes(d.mode)) return Re(d, s, d.mode === "off" ? "当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。" : s.unsupportedReason || "当前模型不支持显式开启 Reasoning。");
  if (d.mode !== "on") return {
    ...d,
    profileId: s.profileId,
    valid: !0
  };
  if (s.intensity.kind === "effort") {
    const u = d.effort || s.intensity.defaultValue;
    return s.intensity.values.includes(u) ? {
      ...d,
      effort: u,
      profileId: s.profileId,
      valid: !0
    } : Re(d, s, `当前模型不支持 Reasoning 强度“${u}”。`, "REASONING_CONFIG_INVALID");
  }
  return {
    ...d,
    profileId: s.profileId,
    valid: !0
  };
}
var ct = 900 * 1e3, pt = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), Vn = Object.freeze([
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
function U(t, n = 1) {
  const s = typeof t == "string" && !t.trim() ? n : t, i = Number(s);
  return Number.isFinite(i) ? Math.max(0, Math.min(2, i)) : U(n, 1);
}
function Ue(t = {}) {
  return t.sendTemperature !== !1;
}
function gt(t = "", n = {}) {
  return n && typeof n == "object" && n[t] ? n[t] : Vn.find((s) => s.value === t)?.label || t || "未配置";
}
var Wn = { chat: { exclude: [
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
] } }, Yn = Object.freeze([
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
function j(t, n, s = "") {
  if (t.replaceChildren(), s) {
    const i = document.createElement("option");
    i.value = "", i.textContent = s, t.appendChild(i);
  }
  n.forEach((i) => {
    const o = document.createElement("option");
    o.value = i.value, o.textContent = i.label, o.disabled = i.disabled === !0, t.appendChild(o);
  });
}
function Te(t = "", n = {}) {
  const s = le(n.reasoning), i = Ge({
    provider: t,
    baseUrl: n.baseUrl,
    model: n.model
  }), o = {
    reasoningMode: s.mode,
    reasoningEffort: "",
    reasoningBudgetTokens: void 0
  };
  if (i.intensity.kind === "effort") o.reasoningEffort = i.intensity.values.includes(s.effort) ? s.effort : i.intensity.defaultValue;
  else if (i.intensity.kind === "budget") {
    const d = s.budgetTokens, u = i.intensity.allowAuto && d === -1, g = Number.isInteger(d) && d >= i.intensity.min && d <= i.intensity.max;
    o.reasoningBudgetTokens = u || g ? d : i.intensity.defaultValue;
  }
  return o;
}
function mt(t = {}) {
  return le(t);
}
function ge(t = []) {
  const n = [...new Set(t.filter(Boolean).map((o) => String(o).trim()).filter(Boolean))], s = Wn.chat, i = n.filter((o) => {
    const d = o.toLowerCase();
    return !s.exclude.some((u) => d.includes(u));
  });
  return i.length ? i : n;
}
function Pe(t = "") {
  return t === "delegate" ? "delegate" : "main";
}
function ue(t) {
  return String(t || "").trim().replace(/\/+$/, "");
}
function Xn(t = "") {
  return t === "sillytavern-openai-compatible" || t === "sillytavern-claude" || t === "sillytavern-google";
}
function ie(t = "") {
  return t === "openai-compatible" || t === "sillytavern-openai-compatible";
}
function Zn(t = "") {
  return t === "anthropic" || t === "sillytavern-claude";
}
function Qn(t = "") {
  return t === "sillytavern-claude" ? ht : t === "sillytavern-google" ? Tt : ce;
}
function me(t = []) {
  return [...new Set(t.filter(Boolean).map((n) => String(n).trim()).filter(Boolean))];
}
function ea(t) {
  const n = ue(t);
  if (!n) return [];
  if (n.endsWith("/v1")) {
    const s = n.slice(0, -3);
    return me([
      `${n}/models`,
      `${s}/v1/models`,
      `${s}/models`
    ]);
  }
  return me([`${n}/v1/models`, `${n}/models`]);
}
function Et(t) {
  const n = ue(t);
  if (!n) return [];
  if (n.endsWith("/v1")) {
    const s = n.slice(0, -3);
    return me([
      `${n}/models`,
      `${s}/v1/models`,
      `${s}/models`
    ]);
  }
  return me([`${n}/v1/models`, `${n}/models`]);
}
function ta(t, n) {
  const s = ue(t);
  if (!s) return [];
  const i = s.endsWith("/v1beta") ? s.slice(0, -7) : s;
  return me([
    `${s}/models?key=${encodeURIComponent(n)}`,
    `${s}/models`,
    `${i}/v1beta/models?key=${encodeURIComponent(n)}`,
    `${i}/v1beta/models`,
    `${i}/models?key=${encodeURIComponent(n)}`,
    `${i}/models`
  ]);
}
function na(t, n) {
  const s = [
    t?.error?.message,
    t?.message,
    t?.detail,
    t?.details,
    t?.error
  ].find((i) => typeof i == "string" && i.trim());
  return s ? s.trim() : String(n || "").trim().slice(0, 160);
}
async function aa(t, n = {}) {
  const s = await fetch(t, n), i = await s.text();
  let o = null, d = null;
  try {
    o = i ? JSON.parse(i) : {};
  } catch (u) {
    d = u;
  }
  return {
    ok: s.ok,
    status: s.status,
    url: t,
    data: o,
    rawText: i,
    parseError: d,
    errorSnippet: na(o, i)
  };
}
function sa(t) {
  return ge((t?.data || []).map((n) => String(n?.id || "").trim()).filter(Boolean));
}
function Ct(t) {
  return ge((t?.data || []).map((n) => String(n?.id || "").trim()).filter(Boolean));
}
function ra(t) {
  return ge((t?.models || t?.data || []).map((n) => String(n?.id || n?.name || "")).map((n) => n.split("/").pop() || "").filter(Boolean));
}
async function Me({ urls: t, requestOptionsList: n, extractModels: s, providerLabel: i }) {
  let o = null;
  for (const d of t) for (const u of n) {
    const g = await aa(d, u);
    if (!g.ok) {
      o = g;
      continue;
    }
    if (g.parseError) {
      o = {
        ...g,
        errorSnippet: "返回的不是 JSON"
      };
      continue;
    }
    const m = s(g.data);
    if (m.length) return m;
    o = {
      ...g,
      errorSnippet: "返回成功，但模型列表为空"
    };
  }
  if (o) {
    const d = o.url ? ` (${o.url})` : "", u = o.errorSnippet ? `：${o.errorSnippet}` : "";
    throw new Error(`${i} 拉取模型失败：${o.status || "unknown"}${u}${d}`);
  }
  throw new Error(`${i} 拉取模型失败：未获取到模型列表。`);
}
async function ia(t, n = {}) {
  const s = String(t.apiKey || "").trim(), i = ue(t.baseUrl || ""), o = ue(i || Pt.claude);
  if (s && o) try {
    return await Me({
      urls: Et(o),
      requestOptionsList: [{
        headers: {
          "x-api-key": s,
          "anthropic-version": "2023-06-01",
          Accept: "application/json"
        },
        signal: n.signal
      }],
      extractModels: Ct,
      providerLabel: "Anthropic"
    });
  } catch (d) {
    if (i) throw d;
  }
  return [...Yn];
}
async function oa(t, n = {}) {
  const s = t.provider, i = ue(t.baseUrl || ""), o = String(t.apiKey || "").trim();
  if (s === "sillytavern-claude") return ge(await ia(t, n));
  if (Xn(s)) return ge(await Ke(t, Qn(s), { signal: n.signal }));
  if (!o) throw new Error("请先填写 API Key。");
  if (!i) throw new Error("请先填写 Base URL。");
  return s === "google" ? await Me({
    urls: ta(i, o),
    requestOptionsList: [
      {
        headers: {
          Accept: "application/json",
          "x-goog-api-key": o
        },
        signal: n.signal
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${o}`
        },
        signal: n.signal
      },
      {
        headers: { Accept: "application/json" },
        signal: n.signal
      }
    ],
    extractModels: ra,
    providerLabel: "Google AI"
  }) : Zn(s) ? await Me({
    urls: Et(i),
    requestOptionsList: [{
      headers: {
        "x-api-key": o,
        "anthropic-version": "2023-06-01",
        Accept: "application/json"
      },
      signal: n.signal
    }],
    extractModels: Ct,
    providerLabel: "Anthropic"
  }) : await Me({
    urls: ea(i),
    requestOptionsList: [{
      headers: {
        Authorization: `Bearer ${o}`,
        Accept: "application/json"
      },
      signal: n.signal
    }],
    extractModels: sa,
    providerLabel: s === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function la(t) {
  return t instanceof Error ? t.message : String(t || "unknown_error");
}
function da(t = {}) {
  const { state: n, render: s, showToast: i, createRequestId: o = (e = "req") => `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, saveConfig: d, pullModels: u = oa, describeError: g = la, getRuntimeSummaryText: m } = t;
  function v() {
    n.configFormSyncPending = !0;
  }
  function p(e, r = "main") {
    const a = String(e || "").trim() || "openai-compatible";
    return r === "delegate" ? `delegate:${a}` : a;
  }
  function L(e, r = "main") {
    return n.pullStateByProvider?.[p(e, r)] || {
      status: "idle",
      message: ""
    };
  }
  function $(e, r, a = "main") {
    n.pullStateByProvider = {
      ...n.pullStateByProvider || {},
      [p(e, a)]: r
    };
  }
  function R(e, r, a = "main") {
    n.modelOptionsByProvider = {
      ...n.modelOptionsByProvider || {},
      [p(e, a)]: Array.isArray(r) ? r : []
    };
  }
  function O(e, r = "main") {
    const a = p(e, r);
    return Array.isArray(n.modelOptionsByProvider?.[a]) ? n.modelOptionsByProvider[a] : [];
  }
  function q(e, r) {
    const a = n.config?.presets || {}, l = P(e || r || "默认");
    return a[l] ? l : r && a[r] ? r : Object.keys(a)[0] || "默认";
  }
  function X(e, r) {
    const a = q(e, De), l = r && typeof r == "object" ? r : _(), c = l.provider || "openai-compatible", x = I(l.modelConfigs || {}), S = x[c] || {}, M = Te(c, S);
    return {
      delegatePresetName: a,
      delegateProvider: c,
      delegateModelConfigs: x,
      delegateBaseUrl: String(S.baseUrl || ""),
      delegateModel: String(S.model || ""),
      delegateApiKey: String(S.apiKey || ""),
      delegateTemperature: U(S.temperature, 1),
      delegateMaxTokens: N(S.maxTokens),
      delegateSendTemperature: Ue(S),
      delegateReasoningMode: M.reasoningMode,
      delegateReasoningEffort: M.reasoningEffort,
      delegateReasoningBudgetTokens: M.reasoningBudgetTokens,
      delegateToolMode: S.toolMode || "native"
    };
  }
  function ee(e = "openai-compatible", r = {}) {
    const a = I(r || {})[e] || {}, l = Te(e, a);
    return {
      baseUrl: String(a.baseUrl || ""),
      model: String(a.model || ""),
      apiKey: String(a.apiKey || ""),
      temperature: U(a.temperature, 1),
      maxTokens: N(a.maxTokens),
      sendTemperature: Ue(a),
      ...l,
      toolMode: a.toolMode || "native"
    };
  }
  function te(e = "openai-compatible", r = {}) {
    const a = I(r || {})[e] || {}, l = Te(e, a);
    return {
      delegateBaseUrl: String(a.baseUrl || ""),
      delegateModel: String(a.model || ""),
      delegateApiKey: String(a.apiKey || ""),
      delegateTemperature: U(a.temperature, 1),
      delegateMaxTokens: N(a.maxTokens),
      delegateSendTemperature: Ue(a),
      delegateReasoningMode: l.reasoningMode,
      delegateReasoningEffort: l.reasoningEffort,
      delegateReasoningBudgetTokens: l.reasoningBudgetTokens,
      delegateToolMode: a.toolMode || "native"
    };
  }
  function D(e, r, a = n.config) {
    const l = P(e || "默认"), c = r && typeof r == "object" ? r : _(), x = c.provider || "openai-compatible", S = I(c.modelConfigs || {}), M = ee(x, S), A = q(a?.delegatePresetName, l), T = X(A, a?.delegateConfig && typeof a.delegateConfig == "object" ? a.delegateConfig : (a?.presets || {})[A] || c);
    return {
      currentPresetName: l,
      presetDraftName: l,
      provider: x,
      modelConfigs: S,
      ...M,
      tavilyApiKey: String(a?.tavilyApiKey || ""),
      tavilyBaseUrl: F(a?.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: oe(c.permissionMode),
      jsApiPermission: Y(a?.jsApiPermission),
      ...T
    };
  }
  function y() {
    if (n.configDraft) return n.configDraft;
    const e = P(n.config?.currentPresetName || "默认");
    return n.configDraft = D(e, (n.config?.presets || {})[e] || _()), n.configDraft;
  }
  function J(e, r = {}) {
    const a = y(), l = r.provider || e.querySelector("#xb-assistant-provider")?.value || a.provider || "openai-compatible", c = r.delegateProvider || e.querySelector("#xb-assistant-delegate-provider")?.value || a.delegateProvider || "openai-compatible", x = e.querySelector("#xb-assistant-base-url")?.value.trim() || "", S = e.querySelector("#xb-assistant-model")?.value.trim() || "", M = e.querySelector("#xb-assistant-delegate-base-url")?.value.trim() ?? a.delegateBaseUrl ?? "", A = e.querySelector("#xb-assistant-delegate-model")?.value.trim() ?? a.delegateModel ?? "", T = mt({
      mode: e.querySelector("#xb-assistant-reasoning-mode")?.value || a.reasoningMode,
      effort: e.querySelector("#xb-assistant-reasoning-effort")?.value || a.reasoningEffort,
      budgetTokens: e.querySelector("#xb-assistant-reasoning-budget")?.value ?? a.reasoningBudgetTokens
    }), V = mt({
      mode: e.querySelector("#xb-assistant-delegate-reasoning-mode")?.value || a.delegateReasoningMode,
      effort: e.querySelector("#xb-assistant-delegate-reasoning-effort")?.value || a.delegateReasoningEffort,
      budgetTokens: e.querySelector("#xb-assistant-delegate-reasoning-budget")?.value ?? a.delegateReasoningBudgetTokens
    }), k = {
      baseUrl: x,
      model: S,
      apiKey: e.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      temperature: U(e.querySelector("#xb-assistant-temperature")?.value, a.temperature ?? 1),
      maxTokens: N(e.querySelector("#xb-assistant-max-tokens")?.value, a.maxTokens),
      sendTemperature: e.querySelector("#xb-assistant-send-temperature")?.checked ?? !!(a.sendTemperature ?? !0),
      reasoning: T,
      toolMode: ie(l) ? e.querySelector("#xb-assistant-tool-mode")?.value || a.toolMode || "native" : void 0
    }, C = {
      baseUrl: M,
      model: A,
      apiKey: e.querySelector("#xb-assistant-delegate-api-key")?.value.trim() ?? a.delegateApiKey ?? "",
      temperature: U(e.querySelector("#xb-assistant-delegate-temperature")?.value, a.delegateTemperature ?? 1),
      maxTokens: N(e.querySelector("#xb-assistant-delegate-max-tokens")?.value, a.delegateMaxTokens),
      sendTemperature: e.querySelector("#xb-assistant-delegate-send-temperature")?.checked ?? !!(a.delegateSendTemperature ?? !0),
      reasoning: V,
      toolMode: ie(c) ? e.querySelector("#xb-assistant-delegate-tool-mode")?.value || a.delegateToolMode || "native" : void 0
    }, Z = {
      ...I(a.modelConfigs || {}),
      [l]: {
        ...I(a.modelConfigs || {})[l] || {},
        ...k
      }
    }, H = {
      ...I(a.delegateModelConfigs || {}),
      [c]: {
        ...I(a.delegateModelConfigs || {})[c] || {},
        ...C
      }
    };
    return {
      ...a,
      currentPresetName: a.currentPresetName,
      presetDraftName: P(e.querySelector("#xb-assistant-preset-name")?.value),
      provider: l,
      modelConfigs: Z,
      baseUrl: k.baseUrl,
      model: k.model,
      apiKey: k.apiKey,
      temperature: k.temperature,
      maxTokens: k.maxTokens,
      sendTemperature: k.sendTemperature,
      reasoningMode: k.reasoning.mode,
      reasoningEffort: k.reasoning.effort || "",
      reasoningBudgetTokens: k.reasoning.budgetTokens,
      toolMode: k.toolMode || a.toolMode || "native",
      tavilyApiKey: e.querySelector("#xb-assistant-tavily-api-key")?.value.trim() ?? a.tavilyApiKey ?? "",
      tavilyBaseUrl: F(a.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: oe(e.querySelector("#xb-assistant-permission-mode")?.value || a.permissionMode),
      jsApiPermission: Y(e.querySelector("#xb-assistant-jsapi-permission")?.value || a.jsApiPermission),
      delegatePresetName: q(e.querySelector("#xb-assistant-delegate-preset-select")?.value || a.delegatePresetName, a.currentPresetName),
      delegateProvider: c,
      delegateModelConfigs: H,
      delegateBaseUrl: C.baseUrl,
      delegateModel: C.model,
      delegateApiKey: C.apiKey,
      delegateTemperature: C.temperature,
      delegateMaxTokens: C.maxTokens,
      delegateSendTemperature: C.sendTemperature,
      delegateReasoningMode: C.reasoning.mode,
      delegateReasoningEffort: C.reasoning.effort || "",
      delegateReasoningBudgetTokens: C.reasoning.budgetTokens,
      delegateToolMode: C.toolMode || a.delegateToolMode || "native"
    };
  }
  function f(e, r = {}) {
    return n.configDraft = J(e, r), n.configDirty = !0, n.configDraft;
  }
  function b(e = y()) {
    return {
      baseUrl: String(e.baseUrl || ""),
      model: String(e.model || ""),
      apiKey: String(e.apiKey || ""),
      temperature: U(e.temperature, 1),
      maxTokens: N(e.maxTokens),
      sendTemperature: !!(e.sendTemperature ?? !0),
      reasoning: le({
        mode: e.reasoningMode,
        effort: e.reasoningEffort,
        budgetTokens: e.reasoningBudgetTokens
      }),
      toolMode: ie(e.provider) ? e.toolMode || "native" : void 0
    };
  }
  function h(e = y()) {
    return {
      baseUrl: String(e.delegateBaseUrl || ""),
      model: String(e.delegateModel || ""),
      apiKey: String(e.delegateApiKey || ""),
      temperature: U(e.delegateTemperature, 1),
      maxTokens: N(e.delegateMaxTokens),
      sendTemperature: !!(e.delegateSendTemperature ?? !0),
      reasoning: le({
        mode: e.delegateReasoningMode,
        effort: e.delegateReasoningEffort,
        budgetTokens: e.delegateReasoningBudgetTokens
      }),
      toolMode: ie(e.delegateProvider) ? e.delegateToolMode || "native" : void 0
    };
  }
  function E(e = y()) {
    const r = e.delegateProvider || "openai-compatible", a = I(e.delegateModelConfigs || {});
    return {
      provider: r,
      modelConfigs: {
        ...a,
        [r]: {
          ...a[r] || {},
          ...h(e)
        }
      }
    };
  }
  function ve(e = y()) {
    return {
      provider: e.provider || "openai-compatible",
      baseUrl: e.baseUrl || "",
      model: e.model || "",
      apiKey: e.apiKey || "",
      tavilyApiKey: e.tavilyApiKey || "",
      tavilyBaseUrl: F(e.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: e.sendTemperature === !1 ? void 0 : U(e.temperature, 1),
      sendTemperature: !!(e.sendTemperature ?? !0),
      maxTokens: N(e.maxTokens),
      timeoutMs: ct,
      toolMode: e.toolMode || "native",
      reasoning: he({
        provider: e.provider,
        baseUrl: e.baseUrl,
        model: e.model,
        maxTokens: N(e.maxTokens)
      }, {
        mode: e.reasoningMode,
        effort: e.reasoningEffort,
        budgetTokens: e.reasoningBudgetTokens
      })
    };
  }
  function Nt(e = y()) {
    return {
      provider: e.delegateProvider || "openai-compatible",
      baseUrl: e.delegateBaseUrl || "",
      model: e.delegateModel || "",
      apiKey: e.delegateApiKey || "",
      tavilyApiKey: e.tavilyApiKey || "",
      tavilyBaseUrl: F(e.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: e.delegateSendTemperature === !1 ? void 0 : U(e.delegateTemperature, 1),
      sendTemperature: !!(e.delegateSendTemperature ?? !0),
      maxTokens: N(e.delegateMaxTokens),
      timeoutMs: ct,
      toolMode: e.delegateToolMode || "native",
      reasoning: he({
        provider: e.delegateProvider,
        baseUrl: e.delegateBaseUrl,
        model: e.delegateModel,
        maxTokens: N(e.delegateMaxTokens)
      }, {
        mode: e.delegateReasoningMode,
        effort: e.delegateReasoningEffort,
        budgetTokens: e.delegateReasoningBudgetTokens
      })
    };
  }
  function Ot(e = {}) {
    const r = [];
    Object.entries(e.presets || {}).forEach(([x, S]) => {
      const M = S?.provider || "openai-compatible", A = S?.modelConfigs?.[M] || {}, T = he({
        provider: M,
        baseUrl: A.baseUrl,
        model: A.model,
        maxTokens: N(A.maxTokens)
      }, A.reasoning);
      T.valid === !1 && r.push(`预设“${x}”：${T.error}`);
    });
    const a = e.delegateConfig?.provider || "openai-compatible", l = e.delegateConfig?.modelConfigs?.[a] || {}, c = he({
      provider: a,
      baseUrl: l.baseUrl,
      model: l.model,
      maxTokens: N(l.maxTokens)
    }, l.reasoning);
    return c.valid === !1 && r.push(`分身模型：${c.error}`), r;
  }
  function ye(e = {}) {
    const r = (e.role === "delegate", y());
    return e.role === "delegate" ? Nt(r) : ve(r);
  }
  function wt(e) {
    y(), n.configDraft = {
      ...n.configDraft,
      presetDraftName: P(e.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function qt(e = y(), r = e.provider || "openai-compatible", a = "main") {
    const l = L(r, a);
    return typeof m == "function" ? m({
      state: n,
      draft: e,
      provider: r,
      pullState: l,
      providerLabel: gt(r)
    }) : `预设「${e.currentPresetName || "默认"}」 · ${gt(r)}`;
  }
  function Je(e, r, a) {
    const l = e?.querySelector?.(r);
    if (!l) return;
    const c = String(a?.status || "idle"), x = String(a?.message || "").trim();
    l.textContent = x, l.hidden = !x, l.classList.toggle("is-loading", c === "loading"), l.classList.toggle("is-success", c === "success"), l.classList.toggle("is-error", c === "error");
  }
  function Ve(e) {
    if (!e) return;
    const r = Pe(n.configPage);
    n.configPage = r, e.querySelectorAll("[data-config-page]").forEach((a) => {
      const l = Pe(a?.dataset?.configPage) === r;
      a.classList.toggle("is-active", l), a.setAttribute("aria-selected", l ? "true" : "false");
    }), e.querySelectorAll("[data-config-page-panel]").forEach((a) => {
      const l = Pe(a?.dataset?.configPagePanel) === r;
      a.toggleAttribute("hidden", !l);
    }), e.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("hidden", r === "delegate");
  }
  function B(e, r = "main") {
    const a = y(), l = r === "delegate", c = l ? "#xb-assistant-delegate-reasoning" : "#xb-assistant-reasoning", x = l ? a.delegateProvider : a.provider, S = l ? a.delegateBaseUrl : a.baseUrl, M = l ? a.delegateModel : a.model, A = {
      mode: l ? a.delegateReasoningMode : a.reasoningMode,
      effort: l ? a.delegateReasoningEffort : a.reasoningEffort,
      budgetTokens: l ? a.delegateReasoningBudgetTokens : a.reasoningBudgetTokens
    }, T = Ge({
      provider: x,
      baseUrl: S,
      model: M
    }), V = Te(x, {
      baseUrl: S,
      model: M,
      reasoning: A
    }), k = V.reasoningMode, C = V.reasoningEffort, Z = V.reasoningBudgetTokens, H = e.querySelector(`${c}-mode`), ne = e.querySelector(`${c}-capability`), ae = e.querySelector(`${c}-effort-wrap`), se = e.querySelector(`${c}-effort`), re = e.querySelector(`${c}-budget-wrap`), Q = e.querySelector(`${c}-budget`);
    H && (j(H, Hn(T)), H.value = k), ne && (ne.textContent = T.unsupportedReason || `能力配置：${T.profileId}`), se && (j(se, Gn(T)), se.value = C), ae && (ae.style.display = k === "on" && T.intensity.kind === "effort" ? "" : "none"), Q && T.intensity.kind === "budget" && (Q.min = T.intensity.allowAuto ? "-1" : String(T.intensity.min), Q.max = String(T.intensity.max), Q.value = String(Z)), re && (re.style.display = k === "on" && T.intensity.kind === "budget" ? "" : "none");
  }
  function z(e) {
    const r = e.querySelector("#xb-assistant-runtime");
    if (!r) return;
    const a = y(), l = n.configPage === "delegate", c = l ? a.delegateProvider : a.provider;
    r.textContent = qt(l ? {
      ...a,
      currentPresetName: "分身",
      provider: c
    } : a, c || "openai-compatible", l ? "delegate" : "main");
  }
  function We(e) {
    if (!n.config) return;
    Ve(e);
    const r = y(), a = r.provider || "openai-compatible", l = O(a), c = r.delegateProvider || "openai-compatible", x = O(c, "delegate"), S = e.querySelector("#xb-assistant-provider"), M = e.querySelector("#xb-assistant-base-url"), A = e.querySelector("#xb-assistant-model"), T = e.querySelector("#xb-assistant-api-key"), V = e.querySelector("#xb-assistant-temperature"), k = e.querySelector("#xb-assistant-send-temperature"), C = e.querySelector("#xb-assistant-tool-mode-wrap"), Z = e.querySelector("#xb-assistant-tool-mode"), H = e.querySelector("#xb-assistant-permission-mode"), ne = e.querySelector("#xb-assistant-jsapi-permission"), ae = e.querySelector("#xb-assistant-model-pulled"), se = e.querySelector("#xb-assistant-max-tokens"), re = e.querySelector("#xb-assistant-preset-select"), Q = e.querySelector("#xb-assistant-preset-name"), Ce = e.querySelector("#xb-assistant-delegate-preset-select"), Ze = e.querySelector("#xb-assistant-delegate-provider"), Qe = e.querySelector("#xb-assistant-delegate-base-url"), et = e.querySelector("#xb-assistant-delegate-model"), tt = e.querySelector("#xb-assistant-delegate-api-key"), nt = e.querySelector("#xb-assistant-tavily-api-key"), Ne = e.querySelector("#xb-assistant-delegate-model-pulled"), at = e.querySelector("#xb-assistant-delegate-max-tokens"), st = e.querySelector("#xb-assistant-delegate-tool-mode-wrap"), Oe = e.querySelector("#xb-assistant-delegate-tool-mode");
    if (!re || !Q) return;
    const rt = (n.config.presetNames || []).map((W) => ({
      value: W,
      label: W
    }));
    j(re, rt), re.value = r.currentPresetName || n.config.currentPresetName || "默认", Ce && (j(Ce, rt), Ce.value = q(r.delegatePresetName, r.currentPresetName)), Q.value = r.presetDraftName || r.currentPresetName || "默认", S && (S.value = a), M && (M.value = r.baseUrl || ""), A && (A.value = r.model || ""), T && (T.value = r.apiKey || ""), se && (se.value = String(N(r.maxTokens))), V && (V.value = String(U(r.temperature, 1))), k && (k.checked = !!(r.sendTemperature ?? !0)), nt && (nt.value = r.tavilyApiKey || ""), C && (C.style.display = ie(a) ? "" : "none"), Z && (j(Z, pt), Z.value = r.toolMode || "native"), H && (j(H, en), H.value = oe(r.permissionMode)), ne && (j(ne, tn), ne.value = Y(r.jsApiPermission)), B(e), ae && (j(ae, l.map((W) => ({
      value: W,
      label: W
    })), "手动填写"), ae.value = l.includes(r.model) ? r.model : ""), Ze && (Ze.value = c), Qe && (Qe.value = r.delegateBaseUrl || ""), et && (et.value = r.delegateModel || ""), tt && (tt.value = r.delegateApiKey || "");
    const it = e.querySelector("#xb-assistant-delegate-temperature"), ot = e.querySelector("#xb-assistant-delegate-send-temperature");
    at && (at.value = String(N(r.delegateMaxTokens))), it && (it.value = String(U(r.delegateTemperature, 1))), ot && (ot.checked = !!(r.delegateSendTemperature ?? !0)), st && (st.style.display = ie(c) ? "" : "none"), Oe && (j(Oe, pt), Oe.value = r.delegateToolMode || "native"), B(e, "delegate"), Ne && (j(Ne, x.map((W) => ({
      value: W,
      label: W
    })), "手动填写"), Ne.value = x.includes(r.delegateModel) ? r.delegateModel : ""), Je(e, "#xb-assistant-model-pull-status", L(a)), Je(e, "#xb-assistant-delegate-model-pull-status", L(c, "delegate")), z(e);
  }
  function It(e) {
    if (typeof d != "function") return;
    const r = d(e);
    r && typeof r.catch == "function" && r.catch((a) => {
      i?.(g(a));
    });
  }
  function Ee(e, r, a) {
    e.querySelector(r)?.addEventListener("click", () => {
      const l = e.querySelector(a);
      l && (l.type = l.type === "password" ? "text" : "password");
    });
  }
  function _t(e) {
    return {
      workspaceFileName: e?.workspaceFileName || "",
      jsApiPermission: Y(e?.jsApiPermission),
      tavilyApiKey: String(e?.tavilyApiKey || ""),
      tavilyBaseUrl: F(e?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: e?.currentPresetName || "默认",
      delegatePresetName: e?.delegatePresetName || e?.currentPresetName || "默认",
      delegateConfig: e?.delegateConfig || {},
      delegateConfigured: e?.delegateConfigured === !0,
      presets: e?.presets || {}
    };
  }
  function Ye(e, r = {}) {
    const a = ke(e), l = Ot(a);
    if (l.length)
      return i?.(l[0]), !1;
    n.config = a;
    const c = P(r.presetName || a.currentPresetName || "默认");
    return n.configDraft = D(c, a.presets?.[c] || _(), a), v(), It({
      requestId: o(r.requestPrefix || "save-config"),
      config: a,
      payload: _t(a)
    }), !0;
  }
  function Se(e, r = {}) {
    const a = f(e), l = P(r.presetName || a.presetDraftName), c = P(a.currentPresetName || n.config?.currentPresetName || "默认"), x = (n.config?.presets || {})[c] || _(), S = I(a.modelConfigs || x.modelConfigs || {}), M = {
      ...x,
      provider: a.provider,
      permissionMode: oe(a.permissionMode),
      modelConfigs: {
        ...S,
        [a.provider]: {
          ...S[a.provider] || {},
          ...b(a)
        }
      }
    }, A = { ...n.config?.presets || {} };
    r.renameCurrentPreset && l !== c && delete A[c], A[l] = M, Ye({
      ...n.config,
      jsApiPermission: Y(a.jsApiPermission),
      tavilyApiKey: String(a.tavilyApiKey || ""),
      tavilyBaseUrl: F(a.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: l,
      delegatePresetName: q(a.delegatePresetName, l),
      delegateConfig: E(a),
      delegateConfigured: r.configureDelegate === !0 || n.config?.delegateConfigured === !0,
      presets: A
    }, {
      presetName: l,
      requestPrefix: r.requestPrefix
    });
  }
  function Xe(e, r = "") {
    const a = P(r || "默认"), l = typeof window < "u" && typeof window.prompt == "function" ? window.prompt(e, a) : a;
    return l === null ? "" : P(l);
  }
  function Rt(e) {
    const r = Xe("输入新预设名称：", `${f(e).currentPresetName || "默认"} 副本`);
    if (!r) {
      i?.("预设名称不能为空");
      return;
    }
    const a = e.querySelector("#xb-assistant-preset-name");
    a && (a.value = r, Se(e, {
      presetName: r,
      requestPrefix: "create-preset"
    }));
  }
  function Ut(e) {
    const r = f(e), a = P(r.currentPresetName || n.config?.currentPresetName || "默认"), l = Xe("输入预设名称：", r.presetDraftName || a);
    if (!l) {
      i?.("预设名称不能为空");
      return;
    }
    if (l === a) return;
    const c = e.querySelector("#xb-assistant-preset-name");
    c && (c.value = l, Se(e, {
      presetName: l,
      renameCurrentPreset: !0,
      requestPrefix: "rename-preset"
    }));
  }
  function Lt(e) {
    if (Object.keys(n.config?.presets || {}).length <= 1) {
      i?.("至少要保留一套预设");
      return;
    }
    const r = f(e), a = P(n.configDraft?.currentPresetName || n.config?.currentPresetName || "默认"), l = { ...n.config?.presets || {} };
    delete l[a];
    const c = Object.keys(l)[0] || "默认";
    Ye({
      ...n.config,
      jsApiPermission: Y(r.jsApiPermission),
      tavilyApiKey: String(r.tavilyApiKey || n.config?.tavilyApiKey || ""),
      tavilyBaseUrl: F(r.tavilyBaseUrl || n.config?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: c,
      delegatePresetName: q(r.delegatePresetName, c),
      delegateConfig: E(r),
      presets: l
    }, {
      presetName: c,
      requestPrefix: "delete-preset"
    }) && s?.();
  }
  function Dt(e) {
    e?.querySelector?.("#xb-assistant-provider") && (e.querySelector("#xb-assistant-provider")?.addEventListener("change", (r) => {
      const a = r.currentTarget.value, l = y().provider, c = f(e, { provider: l });
      n.configDraft = {
        ...c,
        provider: a,
        ...ee(a, c.modelConfigs)
      }, v(), s?.();
    }), e.querySelector("#xb-assistant-preset-select")?.addEventListener("change", (r) => {
      const a = P(r.currentTarget.value), l = (n.config?.presets || {})[a] || _(), c = f(e);
      n.config = ke({
        ...n.config,
        jsApiPermission: Y(c.jsApiPermission),
        currentPresetName: a,
        delegatePresetName: q(c.delegatePresetName, a),
        delegateConfig: E(c)
      }), n.configDraft = D(a, l, n.config), v(), s?.();
    }), e.querySelector("#xb-assistant-preset-name")?.addEventListener("input", () => {
      wt(e);
    }), e.querySelector("#xb-assistant-base-url")?.addEventListener("input", () => {
      f(e), B(e), z(e);
    }), e.querySelector("#xb-assistant-model")?.addEventListener("input", () => {
      f(e), B(e), z(e);
    }), e.querySelector("#xb-assistant-api-key")?.addEventListener("input", () => {
      f(e);
    }), e.querySelector("#xb-assistant-max-tokens")?.addEventListener("input", () => {
      f(e);
    }), e.querySelector("#xb-assistant-temperature")?.addEventListener("input", () => {
      f(e);
    }), e.querySelector("#xb-assistant-send-temperature")?.addEventListener("change", () => {
      f(e);
    }), e.querySelector("#xb-assistant-tavily-api-key")?.addEventListener("input", () => {
      f(e);
    }), e.querySelector("#xb-assistant-model-pulled")?.addEventListener("change", (r) => {
      const a = r.currentTarget.value;
      if (!a) return;
      const l = e.querySelector("#xb-assistant-model");
      l && (l.value = a), f(e), B(e), z(e);
    }), Ee(e, "#xb-assistant-toggle-key", "#xb-assistant-api-key"), Ee(e, "#xb-assistant-toggle-tavily-key", "#xb-assistant-tavily-api-key"), e.querySelector("#xb-assistant-delegate-provider")?.addEventListener("change", (r) => {
      const a = r.currentTarget.value, l = y().delegateProvider, c = f(e, { delegateProvider: l });
      n.configDraft = {
        ...c,
        delegateProvider: a,
        ...te(a, c.delegateModelConfigs)
      }, v(), s?.();
    }), e.querySelector("#xb-assistant-delegate-base-url")?.addEventListener("input", () => {
      f(e), B(e, "delegate"), z(e);
    }), e.querySelector("#xb-assistant-delegate-model")?.addEventListener("input", () => {
      f(e), B(e, "delegate"), z(e);
    }), e.querySelector("#xb-assistant-delegate-api-key")?.addEventListener("input", () => {
      f(e);
    }), e.querySelector("#xb-assistant-delegate-max-tokens")?.addEventListener("input", () => {
      f(e);
    }), e.querySelector("#xb-assistant-delegate-temperature")?.addEventListener("input", () => {
      f(e);
    }), e.querySelector("#xb-assistant-delegate-send-temperature")?.addEventListener("change", () => {
      f(e);
    }), e.querySelector("#xb-assistant-delegate-model-pulled")?.addEventListener("change", (r) => {
      const a = r.currentTarget.value;
      if (!a) return;
      const l = e.querySelector("#xb-assistant-delegate-model");
      l && (l.value = a), f(e), B(e, "delegate"), z(e);
    }), Ee(e, "#xb-assistant-delegate-toggle-key", "#xb-assistant-delegate-api-key"), e.querySelector("#xb-assistant-reasoning-mode")?.addEventListener("change", () => {
      f(e), B(e), z(e);
    }), e.querySelector("#xb-assistant-reasoning-effort")?.addEventListener("change", () => {
      f(e);
    }), e.querySelector("#xb-assistant-reasoning-budget")?.addEventListener("input", () => {
      f(e);
    }), e.querySelector("#xb-assistant-tool-mode")?.addEventListener("change", () => {
      f(e);
    }), e.querySelector("#xb-assistant-delegate-reasoning-mode")?.addEventListener("change", () => {
      f(e), B(e, "delegate"), z(e);
    }), e.querySelector("#xb-assistant-delegate-reasoning-effort")?.addEventListener("change", () => {
      f(e);
    }), e.querySelector("#xb-assistant-delegate-reasoning-budget")?.addEventListener("input", () => {
      f(e);
    }), e.querySelector("#xb-assistant-delegate-tool-mode")?.addEventListener("change", () => {
      f(e);
    }), e.querySelector("#xb-assistant-permission-mode")?.addEventListener("change", () => {
      f(e);
    }), e.querySelector("#xb-assistant-jsapi-permission")?.addEventListener("change", () => {
      f(e);
    }), e.querySelector("#xb-assistant-delegate-preset-select")?.addEventListener("change", (r) => {
      const a = q(r.currentTarget?.value, n.configDraft?.currentPresetName || n.config?.currentPresetName || "默认"), l = (n.config?.presets || {})[a] || _();
      n.configDraft = {
        ...f(e),
        ...X(a, l)
      }, v(), s?.();
    }), e.querySelectorAll("[data-config-page]").forEach((r) => {
      r.addEventListener("click", (a) => {
        f(e), n.configPage = Pe(a.currentTarget?.dataset?.configPage), Ve(e), We(e);
      });
    }), e.querySelector("#xb-assistant-pull-models")?.addEventListener("click", async () => {
      f(e), v();
      const r = ye();
      $(r.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), s?.();
      try {
        const a = await u(r);
        R(r.provider, a), $(r.provider, {
          status: "success",
          message: `已拉取 ${a.length} 个模型`
        });
      } catch (a) {
        R(r.provider, []), $(r.provider, {
          status: "error",
          message: g(a)
        });
      }
      v(), s?.();
    }), e.querySelector("#xb-assistant-delegate-pull-models")?.addEventListener("click", async () => {
      f(e), v();
      const r = ye({ role: "delegate" });
      $(r.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }, "delegate"), s?.();
      try {
        const a = await u(r);
        R(r.provider, a, "delegate"), $(r.provider, {
          status: "success",
          message: `已拉取 ${a.length} 个模型`
        }, "delegate");
      } catch (a) {
        R(r.provider, [], "delegate"), $(r.provider, {
          status: "error",
          message: g(a)
        }, "delegate");
      }
      v(), s?.();
    }), e.querySelector("#xb-assistant-new-preset")?.addEventListener("click", () => {
      Rt(e);
    }), e.querySelector("#xb-assistant-rename-preset")?.addEventListener("click", () => {
      Ut(e);
    }), e.querySelector("#xb-assistant-save")?.addEventListener("click", () => {
      Se(e);
    }), e.querySelector("#xb-assistant-delegate-save")?.addEventListener("click", () => {
      Se(e, {
        requestPrefix: "save-delegate-config",
        configureDelegate: !0
      });
    }), e.querySelector("#xb-assistant-delete-preset")?.addEventListener("click", () => {
      Lt(e);
    }));
  }
  return {
    getActiveProviderConfig: ye,
    getActiveProviderConfigFromForm(e, r = {}) {
      return n.configDraft = J(e), ye(r);
    },
    syncConfigToForm: We,
    bindSettingsPanelEvents: Dt
  };
}
function Ae(t = "") {
  return String(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function pe(t) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${{
    add: '<path d="M12 5v14" /><path d="M5 12h14" />',
    rename: '<path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />',
    save: '<path d="M5 21h14a1 1 0 0 0 1-1V7.5L16.5 4H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z" /><path d="M8 21v-7h8v7" /><path d="M8 4v5h7" />',
    saving: '<path class="xb-assistant-save-spinner" d="M12 3a9 9 0 1 1-8.2 5.3" />',
    success: '<path d="M20 6 9 17l-5-5" />',
    error: '<path d="M18 6 6 18" /><path d="M6 6l12 12" />',
    delete: '<path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />'
  }[t] || ""}</svg>`;
}
function ua(t = {}) {
  const n = String(t?.status || "idle");
  return n === "saving" ? "saving" : n === "success" ? "success" : n === "error" ? "error" : "save";
}
function ca(t = {}) {
  const n = String(t?.status || "idle");
  return n === "saving" ? {
    className: "xb-assistant-save-button is-saving",
    title: "正在保存配置"
  } : n === "success" ? {
    className: "xb-assistant-save-button is-success",
    title: "配置已保存"
  } : n === "error" ? {
    className: "xb-assistant-save-button is-error",
    title: Ae(t?.error || "保存失败")
  } : {
    className: "xb-assistant-save-button",
    title: "保存配置"
  };
}
function pa(t = {}) {
  const { configSave: n = {}, runtimeText: s = "", inlineToastText: i = "", showInlineToast: o = !0, showAssistantPermissions: d = !0, showDelegateSettings: u = !0, showTavilySettings: g = !0, activePage: m = "main", delegatePresetHint: v = "DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。", isBusy: p = !1, canDeletePreset: L = !0, configLoadError: $ = "" } = t, R = String($ || "").trim(), O = ca(n), q = ua(n), X = p || R || String(n?.status || "") === "saving" ? "disabled" : "", ee = p || !L ? "disabled" : "", te = m === "delegate" ? "delegate" : "main", D = te === "main", y = te === "delegate", J = d ? `
            <label>
                <span>斜杠命令权限</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>
            <label>
                <span>JavaScript API 权限</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>` : "", f = u ? `
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${D ? "is-active" : ""}" data-config-page="main" role="tab" aria-selected="${D ? "true" : "false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${y ? "is-active" : ""}" data-config-page="delegate" role="tab" aria-selected="${y ? "true" : "false"}">分身 API</button>
            </div>` : "", b = u ? `
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${y ? "" : "hidden"}>
                <p class="xb-assistant-config-note">${Ae(v)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${O.className}" title="${O.title}" aria-label="${O.title}" ${X}>${pe(q)}</button>
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
                    <button id="xb-assistant-delegate-pull-models" type="button" class="secondary" ${p ? "disabled" : ""}>拉取模型</button>
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
            </div>` : "";
  return `
        <section class="xb-assistant-config">
            <fieldset class="xb-assistant-config-fields" data-xb-agent-config-fields ${R ? "disabled" : ""}>
            ${f}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${D ? "" : "hidden"}>
            <div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${p ? "disabled" : ""}>${pe("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${p ? "disabled" : ""}>${pe("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${O.className}" title="${O.title}" aria-label="${O.title}" ${X}>${pe(q)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${ee}>${pe("delete")}</button>
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
                <button id="xb-assistant-pull-models" type="button" class="secondary" ${p ? "disabled" : ""}>拉取模型</button>
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
            ${g ? `<label>
                <span>Tavily API Key（全局）</span>
                <div class="xb-assistant-inline-input">
                    <input id="xb-assistant-tavily-api-key" type="password" />
                    <button id="xb-assistant-toggle-tavily-key" type="button" class="secondary ghost">显示</button>
                </div>
            </label>` : ""}
            <label id="xb-assistant-tool-mode-wrap">
                <span>Tool 调用格式</span>
                <select id="xb-assistant-tool-mode"></select>
            </label>
            ${J}
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
            </div>
            ${b}
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${Ae(s)}</div>
            </fieldset>
            ${o ? `<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${Ae(R || i)}</div>` : ""}
        </section>
    `;
}
var ga = { class: "agent-api-app" }, ma = { class: "agent-api-scroll" }, fa = { class: "agent-api-content" }, ba = {
  key: 0,
  class: "agent-api-state",
  "aria-live": "polite"
}, va = {
  key: 1,
  class: "agent-api-state is-error",
  role: "alert"
}, ya = {
  class: "agent-api-panel xb-agent-settings-surface",
  "aria-label": "Agent API 配置"
}, Sa = { "aria-live": "polite" }, xa = ["disabled"], ft = 13e4, ha = /* @__PURE__ */ Kt({
  __name: "AgentApiApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(t) {
    const n = t, s = structuredClone(lt(n.initialState)), i = xe(s), o = xe(null), d = xe("idle"), u = xe("连接尚未测试");
    let g = () => {
    }, m = null, v = 0;
    const p = Ft({
      config: null,
      configDraft: null,
      configDirty: !1,
      configFormSyncPending: !0,
      configPage: "main",
      configSave: {
        status: "idle",
        requestId: "",
        error: ""
      },
      modelOptionsByProvider: {},
      pullStateByProvider: {},
      inlineToastText: ""
    }), L = qe(() => i.value.status === "ready" && p.config !== null), $ = qe(() => Object.keys(p.config?.presets || {}).length), R = qe(() => d.value === "testing");
    function O(b) {
      const h = b instanceof Error ? b.message : String(b || "unknown_error");
      return h === "host_request_timeout" ? "请求等待超时，请检查网络后重试。" : h === "app_inactive" ? "页面已经关闭。" : h;
    }
    function q() {
      m && clearTimeout(m), m = setTimeout(() => {
        p.configSave = {
          status: "idle",
          requestId: "",
          error: ""
        }, p.inlineToastText = "", y();
      }, 1800);
    }
    async function X(b) {
      const h = b.payload || {};
      p.configSave = {
        status: "saving",
        requestId: "",
        error: ""
      }, p.inlineToastText = "正在保存配置…", y();
      try {
        const E = (await n.bridge.request("agent-api/save", { patch: h }, 35e3)).result;
        if (E.ok !== !0 || !E.config) throw new Error(E.error || "共享 Agent API 配置保存失败");
        p.config = ke(E.config), p.configDraft = null, p.configDirty = !1, p.configFormSyncPending = !0, p.configSave = {
          status: "success",
          requestId: "",
          error: ""
        }, p.inlineToastText = "配置已保存";
      } catch (E) {
        const ve = O(E);
        p.configSave = {
          status: "error",
          requestId: "",
          error: ve
        }, p.inlineToastText = ve;
      }
      y(), q();
    }
    async function ee() {
      const b = ++v;
      try {
        const h = await n.bridge.request("agent-api/reload", {}, 35e3);
        if (b !== v) return;
        J(h.result);
      } catch (h) {
        if (b !== v) return;
        i.value = {
          status: "error",
          config: null,
          message: O(h)
        }, y();
      }
    }
    async function te(b) {
      return (await n.bridge.request("agent-api/pull-models", { providerConfig: b }, ft)).result.models;
    }
    const D = da({
      state: p,
      render: y,
      saveConfig: X,
      pullModels: te,
      describeError: O
    });
    function y() {
      const b = o.value;
      !b || !p.config || (b.innerHTML = pa({
        configSave: p.configSave,
        inlineToastText: p.inlineToastText,
        showAssistantPermissions: !1,
        showDelegateSettings: !1,
        showTavilySettings: !0,
        canDeletePreset: $.value > 1
      }), D.syncConfigToForm(b), D.bindSettingsPanelEvents(b));
    }
    function J(b) {
      i.value = structuredClone(b), b.status === "ready" && b.config && (p.config = ke(b.config), p.configDraft = null, p.configDirty = !1, p.configFormSyncPending = !0), Gt(y);
    }
    async function f() {
      const b = o.value;
      if (!b || !L.value || R.value) return;
      const h = D.getActiveProviderConfigFromForm(b);
      d.value = "testing", u.value = "正在测试当前表单中的连接…";
      try {
        const E = (await n.bridge.request("agent-api/test-connection", { providerConfig: structuredClone(lt(h)) }, ft)).result;
        d.value = "success", u.value = `${E.provider || "当前服务"} · ${E.model || "当前模型"} · ${E.latencyMs} 毫秒`;
      } catch (E) {
        d.value = "error", u.value = O(E);
      }
    }
    return $t(() => {
      g = n.bridge.subscribe((b) => {
        b.type === "agent-api/state" && J(b.payload.state);
      }), J(s);
    }), jt(() => {
      v += 1, g(), m && clearTimeout(m);
    }), (b, h) => (_e(), Ie("main", ga, [w("div", ma, [w("div", fa, [
      h[2] || (h[2] = w("header", { class: "agent-api-header" }, [w("h1", null, "Agent API 配置"), w("p", null, "共享 Agent 主预设")], -1)),
      i.value.status === "loading" ? (_e(), Ie("section", ba, " 正在读取配置 ")) : i.value.status === "error" ? (_e(), Ie("section", va, [w("div", null, [h[1] || (h[1] = w("strong", null, "配置暂时无法读取", -1)), w("span", null, we(i.value.message), 1)]), w("button", {
        type: "button",
        onClick: h[0] || (h[0] = (E) => ee())
      }, "重新读取")])) : zt("", !0),
      Jt(w("section", ya, [w("div", {
        ref_key: "panelRoot",
        ref: o
      }, null, 512), w("div", { class: Bt(["agent-api-connection", `is-${d.value}`]) }, [w("p", Sa, we(u.value), 1), w("button", {
        type: "button",
        disabled: !L.value || R.value,
        onClick: f
      }, we(R.value ? "测试中…" : "测试当前连接"), 9, xa)], 2)], 512), [[Ht, L.value]])
    ])])]));
  }
}), ka = ha;
export {
  ka as default
};
