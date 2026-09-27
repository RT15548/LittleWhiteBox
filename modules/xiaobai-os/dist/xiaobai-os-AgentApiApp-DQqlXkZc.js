/* eslint-disable */
import { $ as _t, E as It, F as Ne, G as $t, J as Dt, M as Rt, O as Bt, Y as ye, Z as st, _ as qe, g as Lt, m as w, p as we, s as Kt, tt as Oe, x as jt } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { a as ce, i as xe, n as Ft, o as Ht, r as ct, t as zt } from "./xiaobai-os-reasoning-capabilities-jekAYzl_.js";
var Jt = "https://api.tavily.com";
function Gt(t = "") {
  return String(t || "").trim();
}
function j(t = "") {
  return String(t || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var Vt = "agent-core-no-auth";
function pt(t) {
  return String(t ?? "").trim();
}
function _e(t, a) {
  const n = pt(a);
  if (t === "google") return {
    apiKey: n,
    headers: { "x-goog-api-key": n },
    sdkOptions: {
      apiKey: n,
      vertexai: !1
    }
  };
  if (t === "anthropic") return {
    apiKey: n,
    headers: n ? { "x-api-key": n } : {},
    sdkOptions: {
      apiKey: n,
      authToken: null,
      ...n ? {} : { defaultHeaders: {
        "X-Api-Key": null,
        Authorization: null
      } }
    }
  };
  const i = n ? { Authorization: `Bearer ${n}` } : {}, o = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...i
  };
  return {
    apiKey: n,
    headers: i,
    requestHeaders: o,
    sdkOptions: {
      apiKey: n || Vt,
      adminAPIKey: null,
      defaultHeaders: {
        Authorization: null,
        "api-key": null,
        ...o
      },
      fetch: (d, u) => globalThis.fetch(d, {
        ...u,
        headers: o
      })
    }
  };
}
var gt = "openai-compatible", $e = "默认", mt = "default", Wt = "deny", z = 32e3, Yt = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), Xt = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), Ie = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: z,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: z,
    sendTemperature: !0,
    toolMode: "tagged-json"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: z,
    sendTemperature: !0,
    toolMode: "tagged-json"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: z,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: z,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: z,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: z,
    sendTemperature: !0
  }
};
function ft() {
  return JSON.parse(JSON.stringify(Ie));
}
function _() {
  return {
    provider: gt,
    modelConfigs: ft(),
    permissionMode: mt
  };
}
function bt(t = _()) {
  const a = t && typeof t == "object" ? t : _();
  return {
    provider: De(a.provider),
    modelConfigs: U(a.modelConfigs || {})
  };
}
function ie(t) {
  return t === "full" ? "full" : mt;
}
function W(t) {
  return t === "allow" ? "allow" : Wt;
}
function N(t, a = z) {
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) {
    const i = Number(a);
    return Number.isFinite(i) && i > 0 ? Math.floor(i) : z;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}
function P(t) {
  return String(t || "").trim() || "默认";
}
function U(t = {}) {
  const a = ft();
  return Object.keys(Ie).forEach((n) => {
    const i = t && typeof t[n] == "object" ? t[n] : {}, o = Ie[n];
    a[n] = {
      baseUrl: String(i.baseUrl ?? o.baseUrl ?? ""),
      model: String(i.model ?? o.model ?? ""),
      apiKey: pt(i.apiKey ?? o.apiKey),
      temperature: i.temperature ?? o.temperature,
      maxTokens: N(i.maxTokens, o.maxTokens),
      sendTemperature: typeof i.sendTemperature == "boolean" ? i.sendTemperature : o.sendTemperature,
      ..."toolMode" in o ? { toolMode: String(i.toolMode || o.toolMode || "native") } : {},
      reasoning: ce(i.reasoning)
    };
  }), a;
}
function De(t) {
  return typeof t == "string" && t.trim() ? t : gt;
}
function Re(t = {}, a) {
  return t && typeof t.presets == "object" && t.presets ? t.presets : t?.modelConfigs ? { [a]: {
    provider: t.provider || "openai-compatible",
    modelConfigs: t.modelConfigs,
    permissionMode: t.permissionMode
  } } : {};
}
function Zt(t = {}, a) {
  const n = {}, i = Re(t, a);
  return Object.entries(i).forEach(([o, d]) => {
    if (!d || typeof d != "object") return;
    const u = P(o);
    n[u] = {
      provider: De(d.provider),
      modelConfigs: U(d.modelConfigs || {}),
      permissionMode: ie(d.permissionMode)
    };
  }), Object.keys(n).length || (n[$e] = _()), n;
}
function Qt(t, a) {
  const n = P(a);
  return t[n] ? n : Object.keys(t)[0];
}
function ea(t, a, n) {
  const i = P(a || n);
  return t[i] ? i : t[n] ? n : Object.keys(t)[0];
}
function vt(t = {}, a = _()) {
  const n = bt(a), i = t && typeof t == "object" ? t : {};
  return {
    provider: De(i.provider || n.provider),
    modelConfigs: U(i.modelConfigs || n.modelConfigs)
  };
}
function ta(t = {}, a = {}, n = $e, i = n) {
  if (t?.delegateConfigured === !1) return !1;
  if (i !== n) return !0;
  const o = t?.delegateConfig;
  if (!o || typeof o != "object" || Array.isArray(o) || !(typeof o.provider == "string" && o.provider.trim() || o.modelConfigs && typeof o.modelConfigs == "object" && Object.keys(o.modelConfigs).length)) return !1;
  if (t?.delegateConfigured === !0) return !0;
  const d = a[n] || _(), u = bt(d), p = vt(o, d);
  return JSON.stringify(p) !== JSON.stringify(u);
}
function aa(t = {}, a, n, i, o) {
  const d = o(t?.[i]);
  if (d) return d;
  const u = Re(t, a), p = [
    n,
    a,
    t?.currentPresetName,
    t?.delegatePresetName,
    ...Object.keys(u || {})
  ].map(P), m = /* @__PURE__ */ new Set();
  for (const v of p) {
    if (m.has(v)) continue;
    m.add(v);
    const g = o(u?.[v]?.[i]);
    if (g) return g;
  }
  return o(t?.delegateConfig?.[i]);
}
function sa(t = {}, a, n) {
  const i = (p) => String(p || "").trim();
  if (i(t?.tavilyBaseUrl)) return j(t.tavilyBaseUrl);
  const o = Re(t, a), d = [
    n,
    a,
    t?.currentPresetName,
    t?.delegatePresetName,
    ...Object.keys(o || {})
  ].map(P), u = /* @__PURE__ */ new Set();
  for (const p of d) {
    if (u.has(p)) continue;
    u.add(p);
    const m = o?.[p]?.tavilyBaseUrl;
    if (i(m)) return j(m);
  }
  return i(t?.delegateConfig?.tavilyBaseUrl) ? j(t.delegateConfig.tavilyBaseUrl) : Jt;
}
function na(t = {}, a, n) {
  return {
    tavilyApiKey: aa(t, a, n, "tavilyApiKey", Gt),
    tavilyBaseUrl: sa(t, a, n)
  };
}
function ke(t = {}) {
  const a = P(t.currentPresetName || t.presetDraftName || "默认"), n = Zt(t, a), i = Qt(n, t.currentPresetName), o = ea(n, t.delegatePresetName, i), d = n[i] || _(), u = n[o] || d, p = vt(t.delegateConfig, u), m = ta(t, n, i, o), v = na(t, a, i);
  return {
    workspaceFileName: String(t.workspaceFileName || ""),
    updatedAt: Number(t.updatedAt) || 0,
    jsApiPermission: W(t.jsApiPermission),
    currentPresetName: i,
    delegatePresetName: o,
    delegateConfig: p,
    delegateConfigured: m,
    presetDraftName: P(t.presetDraftName || i),
    presetNames: Object.keys(n),
    presets: n,
    provider: d.provider,
    modelConfigs: d.modelConfigs,
    permissionMode: ie(d.permissionMode),
    tavilyApiKey: v.tavilyApiKey,
    tavilyBaseUrl: v.tavilyBaseUrl
  };
}
async function ra(t, a) {
  const n = t.body?.getReader?.();
  if (!n) throw new Error("host_chat_completions_stream_missing_body");
  const i = new TextDecoder();
  let o = "";
  const d = /\r?\n\r?\n/, u = (m) => {
    const v = m.split(/\r?\n/).filter((g) => g.startsWith("data:")).map((g) => g.slice(5).trimStart()).join(`
`).trim();
    !v || v === "[DONE]" || a(JSON.parse(v));
  };
  for (; ; ) {
    const { done: m, value: v } = await n.read();
    if (m) break;
    for (o += i.decode(v, { stream: !0 }); ; ) {
      const g = o.match(d);
      if (!g || typeof g.index != "number") break;
      const D = o.slice(0, g.index);
      o = o.slice(g.index + g[0].length), u(D);
    }
  }
  const p = o.trim();
  p && u(p);
}
var de = "openai", yt = "claude", xt = "makersuite", ia = "/api/backends/chat-completions/status", oa = "/api/backends/chat-completions/generate", St = Object.freeze({
  [yt]: "https://api.anthropic.com/v1",
  [xt]: "https://generativelanguage.googleapis.com"
}), me = Ht;
function la(t) {
  return String(t || "").trim().replace(/\/+$/, "");
}
function da(t, a) {
  const n = la(t);
  return a === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : a === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
async function Tt(t = me) {
  if (typeof t != "function") throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(t() || {}),
    Accept: "application/json"
  };
}
function ua(t = {}) {
  const a = {};
  return Object.entries(t || {}).forEach(([n, i]) => {
    a[n] = /authorization|cookie|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : i;
  }), a;
}
async function Be(t = {}, a = !1, n = me) {
  const i = await Tt(n), o = {
    url: oa,
    method: "POST",
    headers: ua(i),
    body: {
      ...t,
      stream: !!a
    }
  };
  return Object.defineProperty(o, "rawHeaders", {
    value: i,
    enumerable: !1
  }), o;
}
async function ca(t = {}, a = !1) {
  return await Be(t, a);
}
function pa(t = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(t || ""));
}
function ga(t = "") {
  return /invalid csrf token/i.test(String(t || ""));
}
function ma() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function nt(t = "", a = 10) {
  const n = Number.parseInt(String(t || ""), a);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function rt(t = "") {
  return String(t || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (a, n) => nt(n, 16)).replace(/&#([0-9]+);?/g, (a, n) => nt(n));
}
function fa(t = "") {
  const a = String(t || ""), n = rt((a.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), i = rt(a.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), o = n || i;
  return o.length > 240 ? `${o.slice(0, 237)}...` : o;
}
function ba(t = null) {
  const a = Number(t?.status), n = String(t?.statusText || "").trim();
  let i = "";
  try {
    i = String(t?.headers?.get?.("content-type") || "").trim();
  } catch {
    i = "";
  }
  return {
    status: Number.isFinite(a) && a > 0 ? a : 0,
    statusText: n,
    contentType: i
  };
}
function va(t = {}) {
  return t.status ? `HTTP ${t.status}${t.statusText ? ` ${t.statusText}` : ""}` : "";
}
function ya(t = "") {
  const a = String(t || "").trim();
  if (!a || a[0] !== "{" && a[0] !== "[") return "";
  try {
    const n = JSON.parse(a), i = n?.error?.message;
    if (typeof i == "string" && i.trim()) return i.trim();
    if (typeof n?.message == "string" && n.message.trim()) return n.message.trim();
  } catch {
    return "";
  }
  return "";
}
function oe(t = "", a = "", n = null) {
  if (ga(t)) return ma();
  const i = ba(n);
  if (pa(t) || /\btext\/html\b/i.test(i.contentType)) {
    const o = va(i), d = fa(t);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      o ? `（${o}）` : "",
      d ? `：${d}` : ""
    ].join("");
  }
  return ya(t) || String(t || a || "").trim();
}
function xa(t = {}, a = de) {
  const n = da(t.baseUrl, a), i = String(t.apiKey || "").trim(), o = St[a] || "", d = n || (i ? o : ""), u = { chat_completion_source: a || "openai" };
  return d && (u.reverse_proxy = d), i && (u.proxy_password = i), u;
}
function Sa(t = {}, a = de) {
  return xa(t, a);
}
function Le(t) {
  const a = t || globalThis.fetch;
  if (typeof a != "function") throw new Error("当前运行环境没有可用的 fetch，无法调用酒馆后端。");
  return a;
}
async function Ta(t = {}, a = de, n = {}, i = {}) {
  const o = await Le(i.fetch)(ia, {
    method: "POST",
    headers: await Tt(i.requestHeadersProvider),
    body: JSON.stringify(Sa(t, a)),
    signal: n.signal
  }), d = await o.text();
  let u = null;
  try {
    u = d ? JSON.parse(d) : {};
  } catch (m) {
    throw new Error(`酒馆后端模型列表拉取失败：${oe(d, String(m?.message || m), o)}`);
  }
  if (!o.ok || u?.error) {
    const m = oe(u?.message || u?.error?.message || d, `HTTP ${o.status}`, o);
    throw new Error(`酒馆后端模型列表拉取失败：${m}`);
  }
  const p = Array.isArray(u?.data) ? u.data.map((m) => String(m?.id || m?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(p)];
}
async function Ke(t = {}, a = de, n = {}) {
  return await Ta(t, a, n, { requestHeadersProvider: me });
}
async function ha(t = {}, a = {}) {
  return await Ke(t, de, a);
}
async function Pa(t = {}, a = {}, n = {}) {
  const i = await Be(t, !1, n.requestHeadersProvider);
  typeof a.onRequest == "function" && a.onRequest(i);
  const o = await Le(n.fetch)(i.url, {
    method: i.method,
    headers: i.rawHeaders || i.headers,
    body: JSON.stringify(i.body),
    signal: a.signal
  }), d = await o.text();
  let u = null;
  try {
    u = d ? JSON.parse(d) : {};
  } catch (p) {
    const m = /* @__PURE__ */ new Error(`酒馆后端生成失败：${oe(d, String(p?.message || p), o)}`);
    throw m.status = o.status, m.body = d, m;
  }
  if (!o.ok || u?.error) {
    const p = oe(u?.error?.message || u?.message || d, `HTTP ${o.status}`, o), m = /* @__PURE__ */ new Error(`酒馆后端生成失败：${p}`);
    throw m.status = o.status, m.error = u?.error, m;
  }
  return u;
}
async function ka(t = {}, a = {}) {
  return await Pa(t, a, { requestHeadersProvider: me });
}
async function Aa(t = {}, a, n = {}, i = {}) {
  const o = await Be(t, !0, i.requestHeadersProvider);
  typeof n.onRequest == "function" && n.onRequest(o);
  const d = await Le(i.fetch)(o.url, {
    method: o.method,
    headers: o.rawHeaders || o.headers,
    body: JSON.stringify(o.body),
    signal: n.signal
  });
  if (!d.ok) {
    const u = await d.text().catch(() => ""), p = new Error(oe(u, `酒馆后端流式生成失败：HTTP ${d.status}`, d));
    throw p.status = d.status, p.body = u, p;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await ra(d, (u) => {
    if (u?.error) {
      const p = oe(u.error?.message || u.message || JSON.stringify(u.error), "酒馆后端流式生成失败");
      throw new Error(p);
    }
    a(u);
  });
}
async function Ca(t = {}, a, n = {}) {
  return await Aa(t, a, n, { requestHeadersProvider: me });
}
var ss = Object.freeze([
  "buildHostChatCompletionGenerateRequest",
  "createHostChatCompletion",
  "streamHostChatCompletion"
]), ns = Object.freeze({
  buildHostChatCompletionGenerateRequest: ca,
  fetchHostChatCompletionsModels: Ke,
  fetchHostOpenAICompatibleModels: ha,
  createHostChatCompletion: ka,
  streamHostChatCompletion: Ca
}), it = 900 * 1e3, ot = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), Ma = Object.freeze([
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
function Ea(t = "") {
  return t === "sillytavern-openai-compatible" || t === "sillytavern-claude" || t === "sillytavern-google";
}
function $(t, a = 1) {
  const n = typeof t == "string" && !t.trim() ? a : t, i = Number(n);
  return Number.isFinite(i) ? Math.max(0, Math.min(2, i)) : $(a, 1);
}
function Ue(t = {}) {
  return t.sendTemperature !== !1;
}
function lt(t = "", a = {}) {
  return a && typeof a == "object" && a[t] ? a[t] : Ma.find((n) => n.value === t)?.label || t || "未配置";
}
var Na = { chat: { exclude: [
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
] } }, qa = Object.freeze([
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
function K(t, a, n = "") {
  if (t.replaceChildren(), n) {
    const i = document.createElement("option");
    i.value = "", i.textContent = n, t.appendChild(i);
  }
  a.forEach((i) => {
    const o = document.createElement("option");
    o.value = i.value, o.textContent = i.label, o.disabled = i.disabled === !0, t.appendChild(o);
  });
}
function Se(t = "", a = {}) {
  const n = ce(a.reasoning), i = ct({
    provider: t,
    baseUrl: a.baseUrl,
    model: a.model
  }), o = {
    reasoningMode: n.mode,
    reasoningEffort: "",
    reasoningBudgetTokens: void 0
  };
  if (i.intensity.kind === "effort") o.reasoningEffort = i.intensity.values.includes(n.effort) ? n.effort : i.intensity.defaultValue;
  else if (i.intensity.kind === "budget") {
    const d = n.budgetTokens, u = i.intensity.allowAuto && d === -1, p = Number.isInteger(d) && d >= i.intensity.min && d <= i.intensity.max;
    o.reasoningBudgetTokens = u || p ? d : i.intensity.defaultValue;
  }
  return o;
}
function dt(t = {}) {
  return ce(t);
}
function pe(t = []) {
  const a = [...new Set(t.filter(Boolean).map((o) => String(o).trim()).filter(Boolean))], n = Na.chat, i = a.filter((o) => {
    const d = o.toLowerCase();
    return !n.exclude.some((u) => d.includes(u));
  });
  return i.length ? i : a;
}
function Te(t = "") {
  return t === "delegate" ? "delegate" : "main";
}
function le(t) {
  return String(t || "").trim().replace(/\/+$/, "");
}
function re(t = "") {
  return t === "openai-compatible" || t === "sillytavern-openai-compatible";
}
function wa(t = "") {
  return t === "anthropic" || t === "sillytavern-claude";
}
function Oa(t = "") {
  return t === "sillytavern-claude" ? yt : t === "sillytavern-google" ? xt : de;
}
function ge(t = []) {
  return [...new Set(t.filter(Boolean).map((a) => String(a).trim()).filter(Boolean))];
}
function Ua(t) {
  const a = le(t);
  if (!a) return [];
  if (a.endsWith("/v1")) {
    const n = a.slice(0, -3);
    return ge([
      `${a}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return ge([`${a}/v1/models`, `${a}/models`]);
}
function ht(t) {
  const a = le(t);
  if (!a) return [];
  if (a.endsWith("/v1")) {
    const n = a.slice(0, -3);
    return ge([
      `${a}/models`,
      `${n}/v1/models`,
      `${n}/models`
    ]);
  }
  return ge([`${a}/v1/models`, `${a}/models`]);
}
function _a(t, a) {
  const n = le(t);
  if (!n) return [];
  const i = n.endsWith("/v1beta") ? n.slice(0, -7) : n, o = a ? `?key=${encodeURIComponent(a)}` : "";
  return ge([
    `${n}/models${o}`,
    `${n}/models`,
    `${i}/v1beta/models${o}`,
    `${i}/v1beta/models`,
    `${i}/models${o}`,
    `${i}/models`
  ]);
}
function Ia(t, a) {
  const n = [
    t?.error?.message,
    t?.message,
    t?.detail,
    t?.details,
    t?.error
  ].find((i) => typeof i == "string" && i.trim());
  return n ? n.trim() : String(a || "").trim().slice(0, 160);
}
async function $a(t, a = {}) {
  const n = await fetch(t, a), i = await n.text();
  let o = null, d = null;
  try {
    o = i ? JSON.parse(i) : {};
  } catch (u) {
    d = u;
  }
  return {
    ok: n.ok,
    status: n.status,
    url: t,
    data: o,
    rawText: i,
    parseError: d,
    errorSnippet: Ia(o, i)
  };
}
function Da(t) {
  return pe((t?.data || []).map((a) => String(a?.id || "").trim()).filter(Boolean));
}
function Pt(t) {
  return pe((t?.data || []).map((a) => String(a?.id || "").trim()).filter(Boolean));
}
function Ra(t) {
  return pe((t?.models || t?.data || []).map((a) => String(a?.id || a?.name || "")).map((a) => a.split("/").pop() || "").filter(Boolean));
}
async function he({ urls: t, requestOptionsList: a, extractModels: n, providerLabel: i }) {
  let o = null;
  e: for (const d of t) for (const u of a) {
    const p = await $a(d, u);
    if (!p.ok) {
      if (o = p, p.status === 401 || p.status === 403) break e;
      continue;
    }
    if (p.parseError) {
      o = {
        ...p,
        errorSnippet: "返回的不是 JSON"
      };
      continue;
    }
    const m = n(p.data);
    if (m.length) return m;
    o = {
      ...p,
      errorSnippet: "返回成功，但模型列表为空"
    };
  }
  if (o) {
    const d = o.url ? ` (${o.url})` : "", u = o.errorSnippet ? `：${o.errorSnippet}` : "";
    throw new Error(`${i} 拉取模型失败：${o.status || "unknown"}${u}${d}`);
  }
  throw new Error(`${i} 拉取模型失败：未获取到模型列表。`);
}
async function Ba(t, a = {}) {
  const n = _e("anthropic", t.apiKey), i = le(t.baseUrl || ""), o = le(i || St.claude);
  if (o && (n.apiKey || i)) try {
    return await he({
      urls: ht(o),
      requestOptionsList: [{
        headers: {
          ...n.headers,
          "anthropic-version": "2023-06-01",
          Accept: "application/json"
        },
        signal: a.signal
      }],
      extractModels: Pt,
      providerLabel: "Anthropic"
    });
  } catch (d) {
    if (i) throw d;
  }
  return [...qa];
}
async function La(t, a = {}) {
  const n = t.provider, i = le(t.baseUrl || ""), o = _e(n, t.apiKey), { apiKey: d } = o;
  if (n === "sillytavern-claude") return pe(await Ba(t, a));
  if (Ea(n)) return pe(await Ke(t, Oa(n), { signal: a.signal }));
  if (!i) throw new Error("请先填写 Base URL。");
  return n === "google" ? await he({
    urls: _a(i, d),
    requestOptionsList: [{
      headers: {
        Accept: "application/json",
        ...o.headers
      },
      signal: a.signal
    }, ...d ? [{
      headers: {
        Accept: "application/json",
        ..._e("openai-compatible", d).headers
      },
      signal: a.signal
    }] : []],
    extractModels: Ra,
    providerLabel: "Google AI"
  }) : wa(n) ? await he({
    urls: ht(i),
    requestOptionsList: [{
      headers: {
        ...o.headers,
        "anthropic-version": "2023-06-01",
        Accept: "application/json"
      },
      signal: a.signal
    }],
    extractModels: Pt,
    providerLabel: "Anthropic"
  }) : await he({
    urls: Ua(i),
    requestOptionsList: [{
      headers: {
        ...o.headers,
        Accept: "application/json"
      },
      signal: a.signal
    }],
    extractModels: Da,
    providerLabel: n === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function Ka(t) {
  return t instanceof Error ? t.message : String(t || "unknown_error");
}
function ja(t = {}) {
  const { state: a, render: n, showToast: i, createRequestId: o = (e = "req") => `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, saveConfig: d, pullModels: u = La, describeError: p = Ka, getRuntimeSummaryText: m } = t;
  function v() {
    a.configFormSyncPending = !0;
  }
  function g(e, r = "main") {
    const s = String(e || "").trim() || "openai-compatible";
    return r === "delegate" ? `delegate:${s}` : s;
  }
  function D(e, r = "main") {
    return a.pullStateByProvider?.[g(e, r)] || {
      status: "idle",
      message: ""
    };
  }
  function B(e, r, s = "main") {
    a.pullStateByProvider = {
      ...a.pullStateByProvider || {},
      [g(e, s)]: r
    };
  }
  function I(e, r, s = "main") {
    a.modelOptionsByProvider = {
      ...a.modelOptionsByProvider || {},
      [g(e, s)]: Array.isArray(r) ? r : []
    };
  }
  function q(e, r = "main") {
    const s = g(e, r);
    return Array.isArray(a.modelOptionsByProvider?.[s]) ? a.modelOptionsByProvider[s] : [];
  }
  function O(e, r) {
    const s = a.config?.presets || {}, l = P(e || r || "默认");
    return s[l] ? l : r && s[r] ? r : Object.keys(s)[0] || "默认";
  }
  function Y(e, r) {
    const s = O(e, $e), l = r && typeof r == "object" ? r : _(), c = l.provider || "openai-compatible", S = U(l.modelConfigs || {}), x = S[c] || {}, k = Se(c, x);
    return {
      delegatePresetName: s,
      delegateProvider: c,
      delegateModelConfigs: S,
      delegateBaseUrl: String(x.baseUrl || ""),
      delegateModel: String(x.model || ""),
      delegateApiKey: String(x.apiKey || ""),
      delegateTemperature: $(x.temperature, 1),
      delegateMaxTokens: N(x.maxTokens),
      delegateSendTemperature: Ue(x),
      delegateReasoningMode: k.reasoningMode,
      delegateReasoningEffort: k.reasoningEffort,
      delegateReasoningBudgetTokens: k.reasoningBudgetTokens,
      delegateToolMode: x.toolMode || "native"
    };
  }
  function Q(e = "openai-compatible", r = {}) {
    const s = U(r || {})[e] || {}, l = Se(e, s);
    return {
      baseUrl: String(s.baseUrl || ""),
      model: String(s.model || ""),
      apiKey: String(s.apiKey || ""),
      temperature: $(s.temperature, 1),
      maxTokens: N(s.maxTokens),
      sendTemperature: Ue(s),
      ...l,
      toolMode: s.toolMode || "native"
    };
  }
  function ee(e = "openai-compatible", r = {}) {
    const s = U(r || {})[e] || {}, l = Se(e, s);
    return {
      delegateBaseUrl: String(s.baseUrl || ""),
      delegateModel: String(s.model || ""),
      delegateApiKey: String(s.apiKey || ""),
      delegateTemperature: $(s.temperature, 1),
      delegateMaxTokens: N(s.maxTokens),
      delegateSendTemperature: Ue(s),
      delegateReasoningMode: l.reasoningMode,
      delegateReasoningEffort: l.reasoningEffort,
      delegateReasoningBudgetTokens: l.reasoningBudgetTokens,
      delegateToolMode: s.toolMode || "native"
    };
  }
  function R(e, r, s = a.config) {
    const l = P(e || "默认"), c = r && typeof r == "object" ? r : _(), S = c.provider || "openai-compatible", x = U(c.modelConfigs || {}), k = Q(S, x), A = O(s?.delegatePresetName, l), h = Y(A, s?.delegateConfig && typeof s.delegateConfig == "object" ? s.delegateConfig : (s?.presets || {})[A] || c);
    return {
      currentPresetName: l,
      presetDraftName: l,
      provider: S,
      modelConfigs: x,
      ...k,
      tavilyApiKey: String(s?.tavilyApiKey || ""),
      tavilyBaseUrl: j(s?.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: ie(c.permissionMode),
      jsApiPermission: W(s?.jsApiPermission),
      ...h
    };
  }
  function y() {
    if (a.configDraft) return a.configDraft;
    const e = P(a.config?.currentPresetName || "默认");
    return a.configDraft = R(e, (a.config?.presets || {})[e] || _()), a.configDraft;
  }
  function J(e, r = {}) {
    const s = y(), l = r.provider || e.querySelector("#xb-assistant-provider")?.value || s.provider || "openai-compatible", c = r.delegateProvider || e.querySelector("#xb-assistant-delegate-provider")?.value || s.delegateProvider || "openai-compatible", S = e.querySelector("#xb-assistant-base-url")?.value.trim() || "", x = e.querySelector("#xb-assistant-model")?.value.trim() || "", k = e.querySelector("#xb-assistant-delegate-base-url")?.value.trim() ?? s.delegateBaseUrl ?? "", A = e.querySelector("#xb-assistant-delegate-model")?.value.trim() ?? s.delegateModel ?? "", h = dt({
      mode: e.querySelector("#xb-assistant-reasoning-mode")?.value || s.reasoningMode,
      effort: e.querySelector("#xb-assistant-reasoning-effort")?.value || s.reasoningEffort,
      budgetTokens: e.querySelector("#xb-assistant-reasoning-budget")?.value ?? s.reasoningBudgetTokens
    }), G = dt({
      mode: e.querySelector("#xb-assistant-delegate-reasoning-mode")?.value || s.delegateReasoningMode,
      effort: e.querySelector("#xb-assistant-delegate-reasoning-effort")?.value || s.delegateReasoningEffort,
      budgetTokens: e.querySelector("#xb-assistant-delegate-reasoning-budget")?.value ?? s.delegateReasoningBudgetTokens
    }), C = {
      baseUrl: S,
      model: x,
      apiKey: e.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      temperature: $(e.querySelector("#xb-assistant-temperature")?.value, s.temperature ?? 1),
      maxTokens: N(e.querySelector("#xb-assistant-max-tokens")?.value, s.maxTokens),
      sendTemperature: e.querySelector("#xb-assistant-send-temperature")?.checked ?? !!(s.sendTemperature ?? !0),
      reasoning: h,
      toolMode: re(l) ? e.querySelector("#xb-assistant-tool-mode")?.value || s.toolMode || "native" : void 0
    }, E = {
      baseUrl: k,
      model: A,
      apiKey: e.querySelector("#xb-assistant-delegate-api-key")?.value.trim() ?? s.delegateApiKey ?? "",
      temperature: $(e.querySelector("#xb-assistant-delegate-temperature")?.value, s.delegateTemperature ?? 1),
      maxTokens: N(e.querySelector("#xb-assistant-delegate-max-tokens")?.value, s.delegateMaxTokens),
      sendTemperature: e.querySelector("#xb-assistant-delegate-send-temperature")?.checked ?? !!(s.delegateSendTemperature ?? !0),
      reasoning: G,
      toolMode: re(c) ? e.querySelector("#xb-assistant-delegate-tool-mode")?.value || s.delegateToolMode || "native" : void 0
    }, X = {
      ...U(s.modelConfigs || {}),
      [l]: {
        ...U(s.modelConfigs || {})[l] || {},
        ...C
      }
    }, H = {
      ...U(s.delegateModelConfigs || {}),
      [c]: {
        ...U(s.delegateModelConfigs || {})[c] || {},
        ...E
      }
    };
    return {
      ...s,
      currentPresetName: s.currentPresetName,
      presetDraftName: P(e.querySelector("#xb-assistant-preset-name")?.value),
      provider: l,
      modelConfigs: X,
      baseUrl: C.baseUrl,
      model: C.model,
      apiKey: C.apiKey,
      temperature: C.temperature,
      maxTokens: C.maxTokens,
      sendTemperature: C.sendTemperature,
      reasoningMode: C.reasoning.mode,
      reasoningEffort: C.reasoning.effort || "",
      reasoningBudgetTokens: C.reasoning.budgetTokens,
      toolMode: C.toolMode || s.toolMode || "native",
      tavilyApiKey: e.querySelector("#xb-assistant-tavily-api-key")?.value.trim() ?? s.tavilyApiKey ?? "",
      tavilyBaseUrl: j(s.tavilyBaseUrl || "https://api.tavily.com"),
      permissionMode: ie(e.querySelector("#xb-assistant-permission-mode")?.value || s.permissionMode),
      jsApiPermission: W(e.querySelector("#xb-assistant-jsapi-permission")?.value || s.jsApiPermission),
      delegatePresetName: O(e.querySelector("#xb-assistant-delegate-preset-select")?.value || s.delegatePresetName, s.currentPresetName),
      delegateProvider: c,
      delegateModelConfigs: H,
      delegateBaseUrl: E.baseUrl,
      delegateModel: E.model,
      delegateApiKey: E.apiKey,
      delegateTemperature: E.temperature,
      delegateMaxTokens: E.maxTokens,
      delegateSendTemperature: E.sendTemperature,
      delegateReasoningMode: E.reasoning.mode,
      delegateReasoningEffort: E.reasoning.effort || "",
      delegateReasoningBudgetTokens: E.reasoning.budgetTokens,
      delegateToolMode: E.toolMode || s.delegateToolMode || "native"
    };
  }
  function f(e, r = {}) {
    return a.configDraft = J(e, r), a.configDirty = !0, a.configDraft;
  }
  function b(e = y()) {
    return {
      baseUrl: String(e.baseUrl || ""),
      model: String(e.model || ""),
      apiKey: String(e.apiKey || ""),
      temperature: $(e.temperature, 1),
      maxTokens: N(e.maxTokens),
      sendTemperature: !!(e.sendTemperature ?? !0),
      reasoning: ce({
        mode: e.reasoningMode,
        effort: e.reasoningEffort,
        budgetTokens: e.reasoningBudgetTokens
      }),
      toolMode: re(e.provider) ? e.toolMode || "native" : void 0
    };
  }
  function T(e = y()) {
    return {
      baseUrl: String(e.delegateBaseUrl || ""),
      model: String(e.delegateModel || ""),
      apiKey: String(e.delegateApiKey || ""),
      temperature: $(e.delegateTemperature, 1),
      maxTokens: N(e.delegateMaxTokens),
      sendTemperature: !!(e.delegateSendTemperature ?? !0),
      reasoning: ce({
        mode: e.delegateReasoningMode,
        effort: e.delegateReasoningEffort,
        budgetTokens: e.delegateReasoningBudgetTokens
      }),
      toolMode: re(e.delegateProvider) ? e.delegateToolMode || "native" : void 0
    };
  }
  function M(e = y()) {
    const r = e.delegateProvider || "openai-compatible", s = U(e.delegateModelConfigs || {});
    return {
      provider: r,
      modelConfigs: {
        ...s,
        [r]: {
          ...s[r] || {},
          ...T(e)
        }
      }
    };
  }
  function fe(e = y()) {
    return {
      provider: e.provider || "openai-compatible",
      baseUrl: e.baseUrl || "",
      model: e.model || "",
      apiKey: e.apiKey || "",
      tavilyApiKey: e.tavilyApiKey || "",
      tavilyBaseUrl: j(e.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: e.sendTemperature === !1 ? void 0 : $(e.temperature, 1),
      sendTemperature: !!(e.sendTemperature ?? !0),
      maxTokens: N(e.maxTokens),
      timeoutMs: it,
      toolMode: e.toolMode || "native",
      reasoning: xe({
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
  function kt(e = y()) {
    return {
      provider: e.delegateProvider || "openai-compatible",
      baseUrl: e.delegateBaseUrl || "",
      model: e.delegateModel || "",
      apiKey: e.delegateApiKey || "",
      tavilyApiKey: e.tavilyApiKey || "",
      tavilyBaseUrl: j(e.tavilyBaseUrl || "https://api.tavily.com"),
      temperature: e.delegateSendTemperature === !1 ? void 0 : $(e.delegateTemperature, 1),
      sendTemperature: !!(e.delegateSendTemperature ?? !0),
      maxTokens: N(e.delegateMaxTokens),
      timeoutMs: it,
      toolMode: e.delegateToolMode || "native",
      reasoning: xe({
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
  function At(e = {}) {
    const r = [];
    Object.entries(e.presets || {}).forEach(([S, x]) => {
      const k = x?.provider || "openai-compatible", A = x?.modelConfigs?.[k] || {}, h = xe({
        provider: k,
        baseUrl: A.baseUrl,
        model: A.model,
        maxTokens: N(A.maxTokens)
      }, A.reasoning);
      h.valid === !1 && r.push(`预设“${S}”：${h.error}`);
    });
    const s = e.delegateConfig?.provider || "openai-compatible", l = e.delegateConfig?.modelConfigs?.[s] || {}, c = xe({
      provider: s,
      baseUrl: l.baseUrl,
      model: l.model,
      maxTokens: N(l.maxTokens)
    }, l.reasoning);
    return c.valid === !1 && r.push(`分身模型：${c.error}`), r;
  }
  function be(e = {}) {
    const r = (e.role === "delegate", y());
    return e.role === "delegate" ? kt(r) : fe(r);
  }
  function Ct(e) {
    y(), a.configDraft = {
      ...a.configDraft,
      presetDraftName: P(e.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function Mt(e = y(), r = e.provider || "openai-compatible", s = "main") {
    const l = D(r, s);
    return typeof m == "function" ? m({
      state: a,
      draft: e,
      provider: r,
      pullState: l,
      providerLabel: lt(r)
    }) : `预设「${e.currentPresetName || "默认"}」 · ${lt(r)}`;
  }
  function je(e, r, s) {
    const l = e?.querySelector?.(r);
    if (!l) return;
    const c = String(s?.status || "idle"), S = String(s?.message || "").trim();
    l.textContent = S, l.hidden = !S, l.classList.toggle("is-loading", c === "loading"), l.classList.toggle("is-success", c === "success"), l.classList.toggle("is-error", c === "error");
  }
  function Fe(e) {
    if (!e) return;
    const r = Te(a.configPage);
    a.configPage = r, e.querySelectorAll("[data-config-page]").forEach((s) => {
      const l = Te(s?.dataset?.configPage) === r;
      s.classList.toggle("is-active", l), s.setAttribute("aria-selected", l ? "true" : "false");
    }), e.querySelectorAll("[data-config-page-panel]").forEach((s) => {
      const l = Te(s?.dataset?.configPagePanel) === r;
      s.toggleAttribute("hidden", !l);
    }), e.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("hidden", r === "delegate");
  }
  function L(e, r = "main") {
    const s = y(), l = r === "delegate", c = l ? "#xb-assistant-delegate-reasoning" : "#xb-assistant-reasoning", S = l ? s.delegateProvider : s.provider, x = l ? s.delegateBaseUrl : s.baseUrl, k = l ? s.delegateModel : s.model, A = {
      mode: l ? s.delegateReasoningMode : s.reasoningMode,
      effort: l ? s.delegateReasoningEffort : s.reasoningEffort,
      budgetTokens: l ? s.delegateReasoningBudgetTokens : s.reasoningBudgetTokens
    }, h = ct({
      provider: S,
      baseUrl: x,
      model: k
    }), G = Se(S, {
      baseUrl: x,
      model: k,
      reasoning: A
    }), C = G.reasoningMode, E = G.reasoningEffort, X = G.reasoningBudgetTokens, H = e.querySelector(`${c}-mode`), te = e.querySelector(`${c}-capability`), ae = e.querySelector(`${c}-effort-wrap`), se = e.querySelector(`${c}-effort`), ne = e.querySelector(`${c}-budget-wrap`), Z = e.querySelector(`${c}-budget`);
    H && (K(H, Ft(h)), H.value = C), te && (te.textContent = h.unsupportedReason || `能力配置：${h.profileId}`), se && (K(se, zt(h)), se.value = E), ae && (ae.style.display = C === "on" && h.intensity.kind === "effort" ? "" : "none"), Z && h.intensity.kind === "budget" && (Z.min = h.intensity.allowAuto ? "-1" : String(h.intensity.min), Z.max = String(h.intensity.max), Z.value = String(X)), ne && (ne.style.display = C === "on" && h.intensity.kind === "budget" ? "" : "none");
  }
  function F(e) {
    const r = e.querySelector("#xb-assistant-runtime");
    if (!r) return;
    const s = y(), l = a.configPage === "delegate", c = l ? s.delegateProvider : s.provider;
    r.textContent = Mt(l ? {
      ...s,
      currentPresetName: "分身",
      provider: c
    } : s, c || "openai-compatible", l ? "delegate" : "main");
  }
  function He(e) {
    if (!a.config) return;
    Fe(e);
    const r = y(), s = r.provider || "openai-compatible", l = q(s), c = r.delegateProvider || "openai-compatible", S = q(c, "delegate"), x = e.querySelector("#xb-assistant-provider"), k = e.querySelector("#xb-assistant-base-url"), A = e.querySelector("#xb-assistant-model"), h = e.querySelector("#xb-assistant-api-key"), G = e.querySelector("#xb-assistant-temperature"), C = e.querySelector("#xb-assistant-send-temperature"), E = e.querySelector("#xb-assistant-tool-mode-wrap"), X = e.querySelector("#xb-assistant-tool-mode"), H = e.querySelector("#xb-assistant-permission-mode"), te = e.querySelector("#xb-assistant-jsapi-permission"), ae = e.querySelector("#xb-assistant-model-pulled"), se = e.querySelector("#xb-assistant-max-tokens"), ne = e.querySelector("#xb-assistant-preset-select"), Z = e.querySelector("#xb-assistant-preset-name"), Ce = e.querySelector("#xb-assistant-delegate-preset-select"), Ge = e.querySelector("#xb-assistant-delegate-provider"), Ve = e.querySelector("#xb-assistant-delegate-base-url"), We = e.querySelector("#xb-assistant-delegate-model"), Ye = e.querySelector("#xb-assistant-delegate-api-key"), Xe = e.querySelector("#xb-assistant-tavily-api-key"), Me = e.querySelector("#xb-assistant-delegate-model-pulled"), Ze = e.querySelector("#xb-assistant-delegate-max-tokens"), Qe = e.querySelector("#xb-assistant-delegate-tool-mode-wrap"), Ee = e.querySelector("#xb-assistant-delegate-tool-mode");
    if (!ne || !Z) return;
    const et = (a.config.presetNames || []).map((V) => ({
      value: V,
      label: V
    }));
    K(ne, et), ne.value = r.currentPresetName || a.config.currentPresetName || "默认", Ce && (K(Ce, et), Ce.value = O(r.delegatePresetName, r.currentPresetName)), Z.value = r.presetDraftName || r.currentPresetName || "默认", x && (x.value = s), k && (k.value = r.baseUrl || ""), A && (A.value = r.model || ""), h && (h.value = r.apiKey || ""), se && (se.value = String(N(r.maxTokens))), G && (G.value = String($(r.temperature, 1))), C && (C.checked = !!(r.sendTemperature ?? !0)), Xe && (Xe.value = r.tavilyApiKey || ""), E && (E.style.display = re(s) ? "" : "none"), X && (K(X, ot), X.value = r.toolMode || "native"), H && (K(H, Yt), H.value = ie(r.permissionMode)), te && (K(te, Xt), te.value = W(r.jsApiPermission)), L(e), ae && (K(ae, l.map((V) => ({
      value: V,
      label: V
    })), "手动填写"), ae.value = l.includes(r.model) ? r.model : ""), Ge && (Ge.value = c), Ve && (Ve.value = r.delegateBaseUrl || ""), We && (We.value = r.delegateModel || ""), Ye && (Ye.value = r.delegateApiKey || "");
    const tt = e.querySelector("#xb-assistant-delegate-temperature"), at = e.querySelector("#xb-assistant-delegate-send-temperature");
    Ze && (Ze.value = String(N(r.delegateMaxTokens))), tt && (tt.value = String($(r.delegateTemperature, 1))), at && (at.checked = !!(r.delegateSendTemperature ?? !0)), Qe && (Qe.style.display = re(c) ? "" : "none"), Ee && (K(Ee, ot), Ee.value = r.delegateToolMode || "native"), L(e, "delegate"), Me && (K(Me, S.map((V) => ({
      value: V,
      label: V
    })), "手动填写"), Me.value = S.includes(r.delegateModel) ? r.delegateModel : ""), je(e, "#xb-assistant-model-pull-status", D(s)), je(e, "#xb-assistant-delegate-model-pull-status", D(c, "delegate")), F(e);
  }
  function Et(e) {
    if (typeof d != "function") return;
    const r = d(e);
    r && typeof r.catch == "function" && r.catch((s) => {
      i?.(p(s));
    });
  }
  function Ae(e, r, s) {
    e.querySelector(r)?.addEventListener("click", () => {
      const l = e.querySelector(s);
      l && (l.type = l.type === "password" ? "text" : "password");
    });
  }
  function Nt(e) {
    return {
      workspaceFileName: e?.workspaceFileName || "",
      jsApiPermission: W(e?.jsApiPermission),
      tavilyApiKey: String(e?.tavilyApiKey || ""),
      tavilyBaseUrl: j(e?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: e?.currentPresetName || "默认",
      delegatePresetName: e?.delegatePresetName || e?.currentPresetName || "默认",
      delegateConfig: e?.delegateConfig || {},
      delegateConfigured: e?.delegateConfigured === !0,
      presets: e?.presets || {}
    };
  }
  function ze(e, r = {}) {
    const s = ke(e), l = At(s);
    if (l.length)
      return i?.(l[0]), !1;
    a.config = s;
    const c = P(r.presetName || s.currentPresetName || "默认");
    return a.configDraft = R(c, s.presets?.[c] || _(), s), v(), Et({
      requestId: o(r.requestPrefix || "save-config"),
      config: s,
      payload: Nt(s)
    }), !0;
  }
  function ve(e, r = {}) {
    const s = f(e), l = P(r.presetName || s.presetDraftName), c = P(s.currentPresetName || a.config?.currentPresetName || "默认"), S = (a.config?.presets || {})[c] || _(), x = U(s.modelConfigs || S.modelConfigs || {}), k = {
      ...S,
      provider: s.provider,
      permissionMode: ie(s.permissionMode),
      modelConfigs: {
        ...x,
        [s.provider]: {
          ...x[s.provider] || {},
          ...b(s)
        }
      }
    }, A = { ...a.config?.presets || {} };
    r.renameCurrentPreset && l !== c && delete A[c], A[l] = k, ze({
      ...a.config,
      jsApiPermission: W(s.jsApiPermission),
      tavilyApiKey: String(s.tavilyApiKey || ""),
      tavilyBaseUrl: j(s.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: l,
      delegatePresetName: O(s.delegatePresetName, l),
      delegateConfig: M(s),
      delegateConfigured: r.configureDelegate === !0 || a.config?.delegateConfigured === !0,
      presets: A
    }, {
      presetName: l,
      requestPrefix: r.requestPrefix
    });
  }
  function Je(e, r = "") {
    const s = P(r || "默认"), l = typeof window < "u" && typeof window.prompt == "function" ? window.prompt(e, s) : s;
    return l === null ? "" : P(l);
  }
  function qt(e) {
    const r = Je("输入新预设名称：", `${f(e).currentPresetName || "默认"} 副本`);
    if (!r) {
      i?.("预设名称不能为空");
      return;
    }
    const s = e.querySelector("#xb-assistant-preset-name");
    s && (s.value = r, ve(e, {
      presetName: r,
      requestPrefix: "create-preset"
    }));
  }
  function wt(e) {
    const r = f(e), s = P(r.currentPresetName || a.config?.currentPresetName || "默认"), l = Je("输入预设名称：", r.presetDraftName || s);
    if (!l) {
      i?.("预设名称不能为空");
      return;
    }
    if (l === s) return;
    const c = e.querySelector("#xb-assistant-preset-name");
    c && (c.value = l, ve(e, {
      presetName: l,
      renameCurrentPreset: !0,
      requestPrefix: "rename-preset"
    }));
  }
  function Ot(e) {
    if (Object.keys(a.config?.presets || {}).length <= 1) {
      i?.("至少要保留一套预设");
      return;
    }
    const r = f(e), s = P(a.configDraft?.currentPresetName || a.config?.currentPresetName || "默认"), l = { ...a.config?.presets || {} };
    delete l[s];
    const c = Object.keys(l)[0] || "默认";
    ze({
      ...a.config,
      jsApiPermission: W(r.jsApiPermission),
      tavilyApiKey: String(r.tavilyApiKey || a.config?.tavilyApiKey || ""),
      tavilyBaseUrl: j(r.tavilyBaseUrl || a.config?.tavilyBaseUrl || "https://api.tavily.com"),
      currentPresetName: c,
      delegatePresetName: O(r.delegatePresetName, c),
      delegateConfig: M(r),
      presets: l
    }, {
      presetName: c,
      requestPrefix: "delete-preset"
    }) && n?.();
  }
  function Ut(e) {
    e?.querySelector?.("#xb-assistant-provider") && (e.querySelector("#xb-assistant-provider")?.addEventListener("change", (r) => {
      const s = r.currentTarget.value, l = y().provider, c = f(e, { provider: l });
      a.configDraft = {
        ...c,
        provider: s,
        ...Q(s, c.modelConfigs)
      }, v(), n?.();
    }), e.querySelector("#xb-assistant-preset-select")?.addEventListener("change", (r) => {
      const s = P(r.currentTarget.value), l = (a.config?.presets || {})[s] || _(), c = f(e);
      a.config = ke({
        ...a.config,
        jsApiPermission: W(c.jsApiPermission),
        currentPresetName: s,
        delegatePresetName: O(c.delegatePresetName, s),
        delegateConfig: M(c)
      }), a.configDraft = R(s, l, a.config), v(), n?.();
    }), e.querySelector("#xb-assistant-preset-name")?.addEventListener("input", () => {
      Ct(e);
    }), e.querySelector("#xb-assistant-base-url")?.addEventListener("input", () => {
      f(e), L(e), F(e);
    }), e.querySelector("#xb-assistant-model")?.addEventListener("input", () => {
      f(e), L(e), F(e);
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
      const s = r.currentTarget.value;
      if (!s) return;
      const l = e.querySelector("#xb-assistant-model");
      l && (l.value = s), f(e), L(e), F(e);
    }), Ae(e, "#xb-assistant-toggle-key", "#xb-assistant-api-key"), Ae(e, "#xb-assistant-toggle-tavily-key", "#xb-assistant-tavily-api-key"), e.querySelector("#xb-assistant-delegate-provider")?.addEventListener("change", (r) => {
      const s = r.currentTarget.value, l = y().delegateProvider, c = f(e, { delegateProvider: l });
      a.configDraft = {
        ...c,
        delegateProvider: s,
        ...ee(s, c.delegateModelConfigs)
      }, v(), n?.();
    }), e.querySelector("#xb-assistant-delegate-base-url")?.addEventListener("input", () => {
      f(e), L(e, "delegate"), F(e);
    }), e.querySelector("#xb-assistant-delegate-model")?.addEventListener("input", () => {
      f(e), L(e, "delegate"), F(e);
    }), e.querySelector("#xb-assistant-delegate-api-key")?.addEventListener("input", () => {
      f(e);
    }), e.querySelector("#xb-assistant-delegate-max-tokens")?.addEventListener("input", () => {
      f(e);
    }), e.querySelector("#xb-assistant-delegate-temperature")?.addEventListener("input", () => {
      f(e);
    }), e.querySelector("#xb-assistant-delegate-send-temperature")?.addEventListener("change", () => {
      f(e);
    }), e.querySelector("#xb-assistant-delegate-model-pulled")?.addEventListener("change", (r) => {
      const s = r.currentTarget.value;
      if (!s) return;
      const l = e.querySelector("#xb-assistant-delegate-model");
      l && (l.value = s), f(e), L(e, "delegate"), F(e);
    }), Ae(e, "#xb-assistant-delegate-toggle-key", "#xb-assistant-delegate-api-key"), e.querySelector("#xb-assistant-reasoning-mode")?.addEventListener("change", () => {
      f(e), L(e), F(e);
    }), e.querySelector("#xb-assistant-reasoning-effort")?.addEventListener("change", () => {
      f(e);
    }), e.querySelector("#xb-assistant-reasoning-budget")?.addEventListener("input", () => {
      f(e);
    }), e.querySelector("#xb-assistant-tool-mode")?.addEventListener("change", () => {
      f(e);
    }), e.querySelector("#xb-assistant-delegate-reasoning-mode")?.addEventListener("change", () => {
      f(e), L(e, "delegate"), F(e);
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
      const s = O(r.currentTarget?.value, a.configDraft?.currentPresetName || a.config?.currentPresetName || "默认"), l = (a.config?.presets || {})[s] || _();
      a.configDraft = {
        ...f(e),
        ...Y(s, l)
      }, v(), n?.();
    }), e.querySelectorAll("[data-config-page]").forEach((r) => {
      r.addEventListener("click", (s) => {
        f(e), a.configPage = Te(s.currentTarget?.dataset?.configPage), Fe(e), He(e);
      });
    }), e.querySelector("#xb-assistant-pull-models")?.addEventListener("click", async () => {
      f(e), v();
      const r = be();
      B(r.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }), n?.();
      try {
        const s = await u(r);
        I(r.provider, s), B(r.provider, {
          status: "success",
          message: `已拉取 ${s.length} 个模型`
        });
      } catch (s) {
        I(r.provider, []), B(r.provider, {
          status: "error",
          message: p(s)
        });
      }
      v(), n?.();
    }), e.querySelector("#xb-assistant-delegate-pull-models")?.addEventListener("click", async () => {
      f(e), v();
      const r = be({ role: "delegate" });
      B(r.provider, {
        status: "loading",
        message: "正在拉取模型列表…"
      }, "delegate"), n?.();
      try {
        const s = await u(r);
        I(r.provider, s, "delegate"), B(r.provider, {
          status: "success",
          message: `已拉取 ${s.length} 个模型`
        }, "delegate");
      } catch (s) {
        I(r.provider, [], "delegate"), B(r.provider, {
          status: "error",
          message: p(s)
        }, "delegate");
      }
      v(), n?.();
    }), e.querySelector("#xb-assistant-new-preset")?.addEventListener("click", () => {
      qt(e);
    }), e.querySelector("#xb-assistant-rename-preset")?.addEventListener("click", () => {
      wt(e);
    }), e.querySelector("#xb-assistant-save")?.addEventListener("click", () => {
      ve(e);
    }), e.querySelector("#xb-assistant-delegate-save")?.addEventListener("click", () => {
      ve(e, {
        requestPrefix: "save-delegate-config",
        configureDelegate: !0
      });
    }), e.querySelector("#xb-assistant-delete-preset")?.addEventListener("click", () => {
      Ot(e);
    }));
  }
  return {
    getActiveProviderConfig: be,
    getActiveProviderConfigFromForm(e, r = {}) {
      return a.configDraft = J(e), be(r);
    },
    syncConfigToForm: He,
    bindSettingsPanelEvents: Ut
  };
}
function Pe(t = "") {
  return String(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function ue(t) {
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
function Fa(t = {}) {
  const a = String(t?.status || "idle");
  return a === "saving" ? "saving" : a === "success" ? "success" : a === "error" ? "error" : "save";
}
function Ha(t = {}) {
  const a = String(t?.status || "idle");
  return a === "saving" ? {
    className: "xb-assistant-save-button is-saving",
    title: "正在保存配置"
  } : a === "success" ? {
    className: "xb-assistant-save-button is-success",
    title: "配置已保存"
  } : a === "error" ? {
    className: "xb-assistant-save-button is-error",
    title: Pe(t?.error || "保存失败")
  } : {
    className: "xb-assistant-save-button",
    title: "保存配置"
  };
}
function za(t = {}) {
  const { configSave: a = {}, runtimeText: n = "", inlineToastText: i = "", showInlineToast: o = !0, showAssistantPermissions: d = !0, showDelegateSettings: u = !0, showTavilySettings: p = !0, activePage: m = "main", delegatePresetHint: v = "DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。", isBusy: g = !1, canDeletePreset: D = !0, configLoadError: B = "" } = t, I = String(B || "").trim(), q = Ha(a), O = Fa(a), Y = g || I || String(a?.status || "") === "saving" ? "disabled" : "", Q = g || !D ? "disabled" : "", ee = m === "delegate" ? "delegate" : "main", R = ee === "main", y = ee === "delegate", J = d ? `
            <label>
                <span>斜杠命令权限</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>
            <label>
                <span>JavaScript API 权限</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>` : "", f = u ? `
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${R ? "is-active" : ""}" data-config-page="main" role="tab" aria-selected="${R ? "true" : "false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${y ? "is-active" : ""}" data-config-page="delegate" role="tab" aria-selected="${y ? "true" : "false"}">分身 API</button>
            </div>` : "", b = u ? `
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${y ? "" : "hidden"}>
                <p class="xb-assistant-config-note">${Pe(v)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${q.className}" title="${q.title}" aria-label="${q.title}" ${Y}>${ue(O)}</button>
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
                    <button id="xb-assistant-delegate-pull-models" type="button" class="secondary" ${g ? "disabled" : ""}>拉取模型</button>
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
            <fieldset class="xb-assistant-config-fields" data-xb-agent-config-fields ${I ? "disabled" : ""}>
            ${f}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${R ? "" : "hidden"}>
            <div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${g ? "disabled" : ""}>${ue("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${g ? "disabled" : ""}>${ue("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${q.className}" title="${q.title}" aria-label="${q.title}" ${Y}>${ue(O)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${Q}>${ue("delete")}</button>
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
                <button id="xb-assistant-pull-models" type="button" class="secondary" ${g ? "disabled" : ""}>拉取模型</button>
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
            ${p ? `<label>
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
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${Pe(n)}</div>
            </fieldset>
            ${o ? `<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${Pe(I || i)}</div>` : ""}
        </section>
    `;
}
var Ja = { class: "agent-api-app" }, Ga = { class: "agent-api-scroll" }, Va = { class: "agent-api-content" }, Wa = {
  key: 0,
  class: "agent-api-state",
  "aria-live": "polite"
}, Ya = {
  key: 1,
  class: "agent-api-state is-error",
  role: "alert"
}, Xa = {
  class: "agent-api-panel xb-agent-settings-surface",
  "aria-label": "API 设置"
}, Za = { "aria-live": "polite" }, Qa = ["disabled"], ut = 13e4, es = /* @__PURE__ */ jt({
  __name: "AgentApiApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(t) {
    const a = t, n = structuredClone(st(a.initialState)), i = ye(n), o = ye(null), d = ye("idle"), u = ye("连接尚未测试");
    let p = () => {
    }, m = null, v = 0;
    const g = Dt({
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
    }), D = we(() => i.value.status === "ready" && g.config !== null), B = we(() => Object.keys(g.config?.presets || {}).length), I = we(() => d.value === "testing");
    function q(b) {
      const T = b instanceof Error ? b.message : String(b || "unknown_error");
      return T === "host_request_timeout" ? "暂时没收到结果，请检查网络后重试。" : T === "app_inactive" ? "页面已经关闭。" : T;
    }
    function O() {
      m && clearTimeout(m), m = setTimeout(() => {
        g.configSave = {
          status: "idle",
          requestId: "",
          error: ""
        }, g.inlineToastText = "", y();
      }, 1800);
    }
    async function Y(b) {
      const T = b.payload || {};
      g.configSave = {
        status: "saving",
        requestId: "",
        error: ""
      }, g.inlineToastText = "正在保存设置…", y();
      try {
        const M = (await a.bridge.request("agent-api/save", { patch: T }, 35e3)).result;
        if (M.ok !== !0 || !M.config) throw new Error(M.error || "模型设置保存失败");
        g.config = ke(M.config), g.configDraft = null, g.configDirty = !1, g.configFormSyncPending = !0, g.configSave = {
          status: "success",
          requestId: "",
          error: ""
        }, g.inlineToastText = "设置已保存";
      } catch (M) {
        const fe = q(M);
        g.configSave = {
          status: "error",
          requestId: "",
          error: fe
        }, g.inlineToastText = fe;
      }
      y(), O();
    }
    async function Q() {
      const b = ++v;
      try {
        const T = await a.bridge.request("agent-api/reload", {}, 35e3);
        if (b !== v) return;
        J(T.result);
      } catch (T) {
        if (b !== v) return;
        i.value = {
          status: "error",
          config: null,
          message: q(T)
        }, y();
      }
    }
    async function ee(b) {
      return (await a.bridge.request("agent-api/pull-models", { providerConfig: b }, ut)).result.models;
    }
    const R = ja({
      state: g,
      render: y,
      saveConfig: Y,
      pullModels: ee,
      describeError: q
    });
    function y() {
      const b = o.value;
      !b || !g.config || (b.innerHTML = za({
        configSave: g.configSave,
        inlineToastText: g.inlineToastText,
        showAssistantPermissions: !1,
        showDelegateSettings: !1,
        showTavilySettings: !0,
        canDeletePreset: B.value > 1
      }), R.syncConfigToForm(b), R.bindSettingsPanelEvents(b));
    }
    function J(b) {
      i.value = structuredClone(b), b.status === "ready" && b.config && (g.config = ke(b.config), g.configDraft = null, g.configDirty = !1, g.configFormSyncPending = !0), It(y);
    }
    async function f() {
      const b = o.value;
      if (!b || !D.value || I.value) return;
      const T = R.getActiveProviderConfigFromForm(b);
      d.value = "testing", u.value = "正在测试当前填写的连接…";
      try {
        const M = (await a.bridge.request("agent-api/test-connection", { providerConfig: structuredClone(st(T)) }, ut)).result;
        d.value = "success", u.value = `${M.provider || "当前服务"} · ${M.model || "当前模型"} · ${M.latencyMs} 毫秒`;
      } catch (M) {
        d.value = "error", u.value = q(M);
      }
    }
    return Rt(() => {
      p = a.bridge.subscribe((b) => {
        b.type === "agent-api/state" && J(b.payload.state);
      }), J(n);
    }), Bt(() => {
      v += 1, p(), m && clearTimeout(m);
    }), (b, T) => (Ne(), qe("main", Ja, [w("div", Ga, [w("div", Va, [
      T[2] || (T[2] = w("header", { class: "agent-api-header" }, [w("h1", null, "API 设置"), w("p", null, "与小白助手等功能共用主预设")], -1)),
      i.value.status === "loading" ? (Ne(), qe("section", Wa, " 正在加载设置 ")) : i.value.status === "error" ? (Ne(), qe("section", Ya, [w("div", null, [T[1] || (T[1] = w("strong", null, "设置暂时无法加载", -1)), w("span", null, Oe(i.value.message), 1)]), w("button", {
        type: "button",
        onClick: T[0] || (T[0] = (M) => Q())
      }, "重新加载")])) : Lt("", !0),
      $t(w("section", Xa, [w("div", {
        ref_key: "panelRoot",
        ref: o
      }, null, 512), w("div", { class: _t(["agent-api-connection", `is-${d.value}`]) }, [w("p", Za, Oe(u.value), 1), w("button", {
        type: "button",
        disabled: !D.value || I.value,
        onClick: f
      }, Oe(I.value ? "测试中…" : "测试当前连接"), 9, Qa)], 2)], 512), [[Kt, D.value]])
    ])])]));
  }
}), rs = es;
export {
  rs as default
};
