/* eslint-disable */
import { $ as Vt, D as Yt, M as Xt, P as Qt, R as Zt, S as De, V as Ue, f as es, ft as Be, nt as ts, ot as mt, rt as Te, ut as ss, v as je, x as as, y as w } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { a as be, i as ke, n as ns, o as rs, r as kt, t as is } from "./xiaobai-os-reasoning-capabilities-jekAYzl_.js";
import { t as At } from "./xiaobai-os-constants-CDXgazQ7.js";
var ue = "littlewhitebox-server", ka = `/api/plugins/${ue}`, Q = Object.freeze([{
  id: "tavily",
  label: "Tavily",
  baseUrl: "https://api.tavily.com"
}, {
  id: "exa",
  label: "Exa",
  baseUrl: "https://api.exa.ai"
}]), Mt = "tavily", Ae = Object.freeze({
  provider: "联网渠道（全局）",
  key: "API Key",
  show: "显示",
  exaBackend: `Exa 官方接口需安装并启用 ${ue}。`
});
function os(t) {
  return Q.some((s) => s.id === t) ? t : Mt;
}
function Et(t = "") {
  return String(t || "").trim();
}
function fe(t = "", s = Mt) {
  return String(t || "").trim().replace(/\/+$/, "") || Q.find((a) => a.id === s).baseUrl;
}
function K(t = {}, s = {}) {
  return {
    webProvider: os(t.webProvider ?? s.webProvider),
    ...Object.fromEntries(Q.flatMap(({ id: a }) => [[`${a}ApiKey`, Et(t[`${a}ApiKey`] ?? s[`${a}ApiKey`])], [`${a}BaseUrl`, fe(t[`${a}BaseUrl`] ?? s[`${a}BaseUrl`], a)]]))
  };
}
var ls = "agent-core-no-auth";
function Ct(t) {
  return String(t ?? "").trim();
}
function we(t, s) {
  const a = Ct(s);
  if (t === "google") return {
    apiKey: a,
    headers: { "x-goog-api-key": a },
    sdkOptions: {
      apiKey: a,
      vertexai: !1
    }
  };
  if (t === "anthropic") return {
    apiKey: a,
    headers: a ? { "x-api-key": a } : {},
    sdkOptions: {
      apiKey: a,
      authToken: null,
      ...a ? {} : { defaultHeaders: {
        "X-Api-Key": null,
        Authorization: null
      } }
    }
  };
  const i = a ? { Authorization: `Bearer ${a}` } : {}, o = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...i
  };
  return {
    apiKey: a,
    headers: i,
    requestHeaders: o,
    sdkOptions: {
      apiKey: a || ls,
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
var $e = "x-api-key", ds = Object.freeze([{
  value: $e,
  label: "x-api-key"
}, {
  value: "bearer",
  label: "Bearer"
}]);
function G(t) {
  return t === "anthropic" || t === "sillytavern-claude";
}
function R(t) {
  return t === "bearer" ? t : $e;
}
var qt = "openai-compatible", We = "默认", Nt = "default", us = "deny", W = 32e3, cs = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), gs = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), ze = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: W,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: W,
    sendTemperature: !0,
    toolMode: "tagged-json"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: W,
    sendTemperature: !0,
    toolMode: "tagged-json"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    modelListAuth: $e,
    temperature: 1,
    maxTokens: W,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: W,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    modelListAuth: $e,
    temperature: 1,
    maxTokens: W,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: W,
    sendTemperature: !0
  }
};
function wt() {
  return JSON.parse(JSON.stringify(ze));
}
function L() {
  return {
    provider: qt,
    modelConfigs: wt(),
    permissionMode: Nt
  };
}
function $t(t = L()) {
  const s = t && typeof t == "object" ? t : L();
  return {
    provider: Je(s.provider),
    modelConfigs: O(s.modelConfigs || {})
  };
}
function de(t) {
  return t === "full" ? "full" : Nt;
}
function X(t) {
  return t === "allow" ? "allow" : us;
}
function q(t, s = W) {
  const a = Number(t);
  if (!Number.isFinite(a) || a <= 0) {
    const i = Number(s);
    return Number.isFinite(i) && i > 0 ? Math.floor(i) : W;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(a));
}
function T(t) {
  return String(t || "").trim() || "默认";
}
function O(t = {}) {
  const s = wt();
  return Object.keys(ze).forEach((a) => {
    const i = t && typeof t[a] == "object" ? t[a] : {}, o = ze[a];
    s[a] = {
      baseUrl: String(i.baseUrl ?? o.baseUrl ?? ""),
      model: String(i.model ?? o.model ?? ""),
      apiKey: Ct(i.apiKey ?? o.apiKey),
      ...G(a) ? { modelListAuth: R(i.modelListAuth) } : {},
      temperature: i.temperature ?? o.temperature,
      maxTokens: q(i.maxTokens, o.maxTokens),
      sendTemperature: typeof i.sendTemperature == "boolean" ? i.sendTemperature : o.sendTemperature,
      ..."toolMode" in o ? { toolMode: String(i.toolMode || o.toolMode || "native") } : {},
      reasoning: be(i.reasoning)
    };
  }), s;
}
function Je(t) {
  return typeof t == "string" && t.trim() ? t : qt;
}
function Ve(t = {}, s) {
  return t && typeof t.presets == "object" && t.presets ? t.presets : t?.modelConfigs ? { [s]: {
    provider: t.provider || "openai-compatible",
    modelConfigs: t.modelConfigs,
    permissionMode: t.permissionMode
  } } : {};
}
function ps(t = {}, s) {
  const a = {}, i = Ve(t, s);
  return Object.entries(i).forEach(([o, d]) => {
    if (!d || typeof d != "object") return;
    const u = T(o);
    a[u] = {
      provider: Je(d.provider),
      modelConfigs: O(d.modelConfigs || {}),
      permissionMode: de(d.permissionMode)
    };
  }), Object.keys(a).length || (a[We] = L()), a;
}
function ms(t, s) {
  const a = T(s);
  return t[a] ? a : Object.keys(t)[0];
}
function fs(t, s, a) {
  const i = T(s || a);
  return t[i] ? i : t[a] ? a : Object.keys(t)[0];
}
function Ot(t = {}, s = L()) {
  const a = $t(s), i = t && typeof t == "object" ? t : {};
  return {
    provider: Je(i.provider || a.provider),
    modelConfigs: O(i.modelConfigs || a.modelConfigs)
  };
}
function bs(t = {}, s = {}, a = We, i = a) {
  if (t?.delegateConfigured === !1) return !1;
  if (i !== a) return !0;
  const o = t?.delegateConfig;
  if (!o || typeof o != "object" || Array.isArray(o) || !(typeof o.provider == "string" && o.provider.trim() || o.modelConfigs && typeof o.modelConfigs == "object" && Object.keys(o.modelConfigs).length)) return !1;
  if (t?.delegateConfigured === !0) return !0;
  const d = s[a] || L(), u = $t(d), g = Ot(o, d);
  return JSON.stringify(g) !== JSON.stringify(u);
}
function vs(t = {}, s, a, i, o) {
  const d = o(t?.[i]);
  if (d) return d;
  const u = Ve(t, s), g = [
    a,
    s,
    t?.currentPresetName,
    t?.delegatePresetName,
    ...Object.keys(u || {})
  ].map(T), m = /* @__PURE__ */ new Set();
  for (const y of g) {
    if (m.has(y)) continue;
    m.add(y);
    const p = o(u?.[y]?.[i]);
    if (p) return p;
  }
  return o(t?.delegateConfig?.[i]);
}
function ys(t = {}, s, a) {
  const i = (g) => String(g || "").trim();
  if (i(t?.tavilyBaseUrl)) return fe(t.tavilyBaseUrl);
  const o = Ve(t, s), d = [
    a,
    s,
    t?.currentPresetName,
    t?.delegatePresetName,
    ...Object.keys(o || {})
  ].map(T), u = /* @__PURE__ */ new Set();
  for (const g of d) {
    if (u.has(g)) continue;
    u.add(g);
    const m = o?.[g]?.tavilyBaseUrl;
    if (i(m)) return fe(m);
  }
  return i(t?.delegateConfig?.tavilyBaseUrl) ? fe(t.delegateConfig.tavilyBaseUrl) : fe();
}
function xs(t = {}, s, a) {
  return {
    tavilyApiKey: vs(t, s, a, "tavilyApiKey", Et),
    tavilyBaseUrl: ys(t, s, a)
  };
}
function Oe(t = {}) {
  const s = T(t.currentPresetName || t.presetDraftName || "默认"), a = ps(t, s), i = ms(a, t.currentPresetName), o = fs(a, t.delegatePresetName, i), d = a[i] || L(), u = a[o] || d, g = Ot(t.delegateConfig, u), m = bs(t, a, i, o), y = K(t, xs(t, s, i));
  return {
    workspaceFileName: String(t.workspaceFileName || ""),
    updatedAt: Number(t.updatedAt) || 0,
    jsApiPermission: X(t.jsApiPermission),
    currentPresetName: i,
    delegatePresetName: o,
    delegateConfig: g,
    delegateConfigured: m,
    presetDraftName: T(t.presetDraftName || i),
    presetNames: Object.keys(a),
    presets: a,
    provider: d.provider,
    modelConfigs: d.modelConfigs,
    permissionMode: de(d.permissionMode),
    ...y
  };
}
async function Ss(t, s) {
  const a = t.body?.getReader?.();
  if (!a) throw new Error("host_chat_completions_stream_missing_body");
  const i = new TextDecoder();
  let o = "";
  const d = /\r?\n\r?\n/, u = (m) => {
    const y = m.split(/\r?\n/).filter((p) => p.startsWith("data:")).map((p) => p.slice(5).trimStart()).join(`
`).trim();
    !y || y === "[DONE]" || s(JSON.parse(y));
  };
  for (; ; ) {
    const { done: m, value: y } = await a.read();
    if (m) break;
    for (o += i.decode(y, { stream: !0 }); ; ) {
      const p = o.match(d);
      if (!p || typeof p.index != "number") break;
      const D = o.slice(0, p.index);
      o = o.slice(p.index + p[0].length), u(D);
    }
  }
  const g = o.trim();
  g && u(g);
}
var pe = "openai", Lt = "claude", _t = "makersuite", hs = "/api/backends/chat-completions/status", Ps = "/api/backends/chat-completions/generate", It = Object.freeze({
  [Lt]: "https://api.anthropic.com/v1",
  [_t]: "https://generativelanguage.googleapis.com"
}), xe = rs;
function Ts(t) {
  return String(t || "").trim().replace(/\/+$/, "");
}
function ks(t, s) {
  const a = Ts(t);
  return s === "claude" ? !a || /\/v\d[\w.-]*$/i.test(a) ? a : `${a}/v1` : s === "makersuite" ? a.replace(/\/v\d[\w.-]*$/i, "") : a;
}
async function Rt(t = xe) {
  if (typeof t != "function") throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(t() || {}),
    Accept: "application/json"
  };
}
function As(t = {}) {
  const s = {};
  return Object.entries(t || {}).forEach(([a, i]) => {
    s[a] = /authorization|cookie|csrf|token|api[-_]?key/i.test(a) ? "[redacted]" : i;
  }), s;
}
async function Ye(t = {}, s = !1, a = xe) {
  const i = await Rt(a), o = {
    url: Ps,
    method: "POST",
    headers: As(i),
    body: {
      ...t,
      stream: !!s
    }
  };
  return Object.defineProperty(o, "rawHeaders", {
    value: i,
    enumerable: !1
  }), o;
}
async function Ms(t = {}, s = !1) {
  return await Ye(t, s);
}
function Es(t = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(t || ""));
}
function Cs(t = "") {
  return /invalid csrf token/i.test(String(t || ""));
}
function qs() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function ft(t = "", s = 10) {
  const a = Number.parseInt(String(t || ""), s);
  return Number.isInteger(a) && a >= 0 && a <= 1114111 ? String.fromCodePoint(a) : "";
}
function bt(t = "") {
  return String(t || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (s, a) => ft(a, 16)).replace(/&#([0-9]+);?/g, (s, a) => ft(a));
}
function Ns(t = "") {
  const s = String(t || ""), a = bt((s.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), i = bt(s.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), o = a || i;
  return o.length > 240 ? `${o.slice(0, 237)}...` : o;
}
function ws(t = null) {
  const s = Number(t?.status), a = String(t?.statusText || "").trim();
  let i = "";
  try {
    i = String(t?.headers?.get?.("content-type") || "").trim();
  } catch {
    i = "";
  }
  return {
    status: Number.isFinite(s) && s > 0 ? s : 0,
    statusText: a,
    contentType: i
  };
}
function $s(t = {}) {
  return t.status ? `HTTP ${t.status}${t.statusText ? ` ${t.statusText}` : ""}` : "";
}
function Os(t = "") {
  const s = String(t || "").trim();
  if (!s || s[0] !== "{" && s[0] !== "[") return "";
  try {
    const a = JSON.parse(s), i = a?.error?.message;
    if (typeof i == "string" && i.trim()) return i.trim();
    if (typeof a?.message == "string" && a.message.trim()) return a.message.trim();
  } catch {
    return "";
  }
  return "";
}
function ce(t = "", s = "", a = null) {
  if (Cs(t)) return qs();
  const i = ws(a);
  if (Es(t) || /\btext\/html\b/i.test(i.contentType)) {
    const o = $s(i), d = Ns(t);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      o ? `（${o}）` : "",
      d ? `：${d}` : ""
    ].join("");
  }
  return Os(t) || String(t || s || "").trim();
}
function Ls(t = {}, s = pe) {
  const a = ks(t.baseUrl, s), i = String(t.apiKey || "").trim(), o = It[s] || "", d = a || (i ? o : ""), u = { chat_completion_source: s || "openai" };
  return d && (u.reverse_proxy = d), i && (u.proxy_password = i), u;
}
function _s(t = {}, s = pe) {
  return Ls(t, s);
}
function Xe(t) {
  const s = t || globalThis.fetch;
  if (typeof s != "function") throw new Error("当前运行环境没有可用的 fetch，无法调用酒馆后端。");
  return s;
}
async function Is(t = {}, s = pe, a = {}, i = {}) {
  const o = await Xe(i.fetch)(hs, {
    method: "POST",
    headers: await Rt(i.requestHeadersProvider),
    body: JSON.stringify(_s(t, s)),
    signal: a.signal
  }), d = await o.text();
  let u = null;
  try {
    u = d ? JSON.parse(d) : {};
  } catch (m) {
    throw new Error(`酒馆后端模型列表拉取失败：${ce(d, String(m?.message || m), o)}`);
  }
  if (!o.ok || u?.error) {
    const m = ce(u?.message || u?.error?.message || d, `HTTP ${o.status}`, o);
    throw new Error(`酒馆后端模型列表拉取失败：${m}`);
  }
  const g = Array.isArray(u?.data) ? u.data.map((m) => String(m?.id || m?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(g)];
}
async function Qe(t = {}, s = pe, a = {}) {
  return await Is(t, s, a, { requestHeadersProvider: xe });
}
async function Rs(t = {}, s = {}) {
  return await Qe(t, pe, s);
}
async function Ds(t = {}, s = {}, a = {}) {
  const i = await Ye(t, !1, a.requestHeadersProvider);
  typeof s.onRequest == "function" && s.onRequest(i);
  const o = await Xe(a.fetch)(i.url, {
    method: i.method,
    headers: i.rawHeaders || i.headers,
    body: JSON.stringify(i.body),
    signal: s.signal
  }), d = await o.text();
  let u = null;
  try {
    u = d ? JSON.parse(d) : {};
  } catch (g) {
    const m = /* @__PURE__ */ new Error(`酒馆后端生成失败：${ce(d, String(g?.message || g), o)}`);
    throw m.status = o.status, m.body = d, m;
  }
  if (!o.ok || u?.error) {
    const g = ce(u?.error?.message || u?.message || d, `HTTP ${o.status}`, o), m = /* @__PURE__ */ new Error(`酒馆后端生成失败：${g}`);
    throw m.status = o.status, m.error = u?.error, m;
  }
  return u;
}
async function Us(t = {}, s = {}) {
  return await Ds(t, s, { requestHeadersProvider: xe });
}
async function Bs(t = {}, s, a = {}, i = {}) {
  const o = await Ye(t, !0, i.requestHeadersProvider);
  typeof a.onRequest == "function" && a.onRequest(o);
  const d = await Xe(i.fetch)(o.url, {
    method: o.method,
    headers: o.rawHeaders || o.headers,
    body: JSON.stringify(o.body),
    signal: a.signal
  });
  if (!d.ok) {
    const u = await d.text().catch(() => ""), g = new Error(ce(u, `酒馆后端流式生成失败：HTTP ${d.status}`, d));
    throw g.status = d.status, g.body = u, g;
  }
  typeof a.onResponseAccepted == "function" && a.onResponseAccepted(), await Ss(d, (u) => {
    if (u?.error) {
      const g = ce(u.error?.message || u.message || JSON.stringify(u.error), "酒馆后端流式生成失败");
      throw new Error(g);
    }
    s(u);
  });
}
async function js(t = {}, s, a = {}) {
  return await Bs(t, s, a, { requestHeadersProvider: xe });
}
var Aa = Object.freeze([
  "buildHostChatCompletionGenerateRequest",
  "createHostChatCompletion",
  "streamHostChatCompletion"
]), Ma = Object.freeze({
  buildHostChatCompletionGenerateRequest: Ms,
  fetchHostChatCompletionsModels: Qe,
  fetchHostOpenAICompatibleModels: Rs,
  createHostChatCompletion: Us,
  streamHostChatCompletion: js
}), vt = 900 * 1e3, yt = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), Fs = Object.freeze([
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
function Ks(t = "") {
  return t === "sillytavern-openai-compatible" || t === "sillytavern-claude" || t === "sillytavern-google";
}
function I(t, s = 1) {
  const a = typeof t == "string" && !t.trim() ? s : t, i = Number(a);
  return Number.isFinite(i) ? Math.max(0, Math.min(2, i)) : I(s, 1);
}
function Fe(t = {}) {
  return t.sendTemperature !== !1;
}
function xt(t = "", s = {}) {
  return s && typeof s == "object" && s[t] ? s[t] : Fs.find((a) => a.value === t)?.label || t || "未配置";
}
var Ke = `server-plugin/${ue}`, Ce = "SillyTavern/plugins", Hs = `${Ce}/${ue}`, He = Object.freeze({
  sourceDirectory: Ke,
  installRoot: Ce,
  installDirectory: Hs,
  install: `请将扩展内的 ${Ke} 整个文件夹复制到 ${Ce}/，在 config.yaml 设置 enableServerPlugins: true，然后重启酒馆。`,
  update: `请将扩展内的 ${Ke} 整个文件夹复制到 ${Ce}/，同名文件全部替换，然后重启酒馆。`
}), qe = Object.freeze({
  open: "安装指引",
  close: "关闭",
  title: `${ue} 安装指引`,
  steps: [
    { text: "等正在运行的任务完成并保存结果，然后关闭酒馆。" },
    {
      text: `打开 ${He.installRoot}/。如果有下面这两个旧文件夹，删除它们；没有就跳过。`,
      code: `littlewhitebox-image-jobs
littlewhitebox-nai`
    },
    {
      text: "找到下面这个文件夹：",
      code: `SillyTavern/public/${At}/${He.sourceDirectory}/`
    },
    {
      text: `把 ${ue} 整个文件夹复制到下面的位置，里面的文件全部一起复制。提示有同名文件时，选择“全部替换”。`,
      code: `${He.installRoot}/`
    },
    {
      text: "用文本编辑器打开 SillyTavern/config.yaml，把 enableServerPlugins 改成下面这样；没有就新增一行：",
      code: "enableServerPlugins: true"
    },
    { text: "重新启动酒馆，再刷新当前页面。" }
  ]
});
function zs() {
  return `<link rel="stylesheet" href="/${encodeURI(At)}/modules/agent-core/ui/web-settings.css">
    <div class="xb-assistant-web-settings"><label><span>${Ae.provider}</span>
        <select id="xb-assistant-web-provider">${Q.map(({ id: t, label: s }) => `<option value="${t}">${s}</option>`).join("")}</select>
    </label>${Q.map(({ id: t, label: s }) => `<label id="xb-assistant-${t}-key-wrap">
        <span>${s} ${Ae.key}</span>
        <div class="xb-assistant-inline-input">
            <input id="xb-assistant-${t}-api-key" type="password" autocomplete="off" />
            <button id="xb-assistant-toggle-${t}-key" type="button" class="secondary ghost">${Ae.show}</button>
        </div>
    </label>`).join("")}<div id="xb-assistant-exa-backend-note" class="xb-web-backend-note" hidden>
        <small>${Ae.exaBackend}</small>
        <button id="xb-assistant-exa-install-guide" class="xb-web-guide-button" type="button" aria-haspopup="dialog">${qe.open}</button>
    </div>
    <dialog id="xb-assistant-exa-install-dialog" class="xb-web-install-dialog" aria-labelledby="xb-assistant-exa-install-title">
        <header><h3 id="xb-assistant-exa-install-title">${qe.title}</h3>
            <button type="button" id="xb-assistant-exa-install-close" class="xb-web-guide-button" autofocus>${qe.close}</button></header>
        <ol id="xb-assistant-exa-install-steps"></ol>
    </dialog></div>`;
}
function Gs(t) {
  const s = t.querySelector("#xb-assistant-exa-install-dialog");
  if (!s) return;
  const a = s.ownerDocument;
  t.querySelector("#xb-assistant-exa-install-steps").replaceChildren(...qe.steps.map((i) => {
    const o = a.createElement("li");
    if (o.textContent = i.text, i.code) {
      const d = a.createElement("code");
      d.textContent = i.code, o.append(d);
    }
    return o;
  })), t.querySelector("#xb-assistant-exa-install-guide").addEventListener("click", () => s.showModal()), t.querySelector("#xb-assistant-exa-install-close").addEventListener("click", () => s.close());
}
function Ws(t, s) {
  return K({
    webProvider: t.querySelector("#xb-assistant-web-provider")?.value,
    ...Object.fromEntries(Q.map(({ id: a }) => [`${a}ApiKey`, t.querySelector(`#xb-assistant-${a}-api-key`)?.value]))
  }, s);
}
function St(t, s) {
  const a = K(s), i = t.querySelector("#xb-assistant-web-provider");
  i && (i.value = a.webProvider);
  const o = t.querySelector("#xb-assistant-exa-backend-note");
  o && (o.hidden = a.webProvider !== "exa");
  const d = t.querySelector("#xb-assistant-exa-install-dialog");
  a.webProvider !== "exa" && d?.open && d.close();
  for (const { id: u } of Q) {
    const g = t.querySelector(`#xb-assistant-${u}-key-wrap`), m = t.querySelector(`#xb-assistant-${u}-api-key`);
    g && (g.style.display = a.webProvider === u ? "" : "none"), m && (m.value = a[`${u}ApiKey`]);
  }
}
var Js = { chat: { exclude: [
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
] } }, Vs = Object.freeze([
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
function B(t, s, a = "") {
  if (t.replaceChildren(), a) {
    const i = document.createElement("option");
    i.value = "", i.textContent = a, t.appendChild(i);
  }
  s.forEach((i) => {
    const o = document.createElement("option");
    o.value = i.value, o.textContent = i.label, o.disabled = i.disabled === !0, t.appendChild(o);
  });
}
function Me(t = "", s = {}) {
  const a = be(s.reasoning), i = kt({
    provider: t,
    baseUrl: s.baseUrl,
    model: s.model
  }), o = {
    reasoningMode: a.mode,
    reasoningEffort: "",
    reasoningBudgetTokens: void 0
  };
  if (i.intensity.kind === "effort") o.reasoningEffort = i.intensity.values.includes(a.effort) ? a.effort : i.intensity.defaultValue;
  else if (i.intensity.kind === "budget") {
    const d = a.budgetTokens, u = i.intensity.allowAuto && d === -1, g = Number.isInteger(d) && d >= i.intensity.min && d <= i.intensity.max;
    o.reasoningBudgetTokens = u || g ? d : i.intensity.defaultValue;
  }
  return o;
}
function ht(t = {}) {
  return be(t);
}
function ve(t = []) {
  const s = [...new Set(t.filter(Boolean).map((o) => String(o).trim()).filter(Boolean))], a = Js.chat, i = s.filter((o) => {
    const d = o.toLowerCase();
    return !a.exclude.some((u) => d.includes(u));
  });
  return i.length ? i : s;
}
function Ee(t = "") {
  return t === "delegate" ? "delegate" : "main";
}
function ge(t) {
  return String(t || "").trim().replace(/\/+$/, "");
}
function le(t = "") {
  return t === "openai-compatible" || t === "sillytavern-openai-compatible";
}
function Ys(t = "") {
  return t === "sillytavern-claude" ? Lt : t === "sillytavern-google" ? _t : pe;
}
function ye(t = []) {
  return [...new Set(t.filter(Boolean).map((s) => String(s).trim()).filter(Boolean))];
}
function Xs(t) {
  const s = ge(t);
  if (!s) return [];
  if (s.endsWith("/v1")) {
    const a = s.slice(0, -3);
    return ye([
      `${s}/models`,
      `${a}/v1/models`,
      `${a}/models`
    ]);
  }
  return ye([`${s}/v1/models`, `${s}/models`]);
}
function Qs(t) {
  const s = ge(t);
  if (!s) return [];
  if (s.endsWith("/v1")) {
    const a = s.slice(0, -3);
    return ye([
      `${s}/models`,
      `${a}/v1/models`,
      `${a}/models`
    ]);
  }
  return ye([`${s}/v1/models`, `${s}/models`]);
}
function Zs(t, s) {
  const a = ge(t);
  if (!a) return [];
  const i = a.endsWith("/v1beta") ? a.slice(0, -7) : a, o = s ? `?key=${encodeURIComponent(s)}` : "";
  return ye([
    `${a}/models${o}`,
    `${a}/models`,
    `${i}/v1beta/models${o}`,
    `${i}/v1beta/models`,
    `${i}/models${o}`,
    `${i}/models`
  ]);
}
function ea(t, s) {
  const a = [
    t?.error?.message,
    t?.message,
    t?.detail,
    t?.details,
    t?.error
  ].find((i) => typeof i == "string" && i.trim());
  return a ? a.trim() : String(s || "").trim().slice(0, 160);
}
async function ta(t, s = {}) {
  const a = await fetch(t, s), i = await a.text();
  let o = null, d = null;
  try {
    o = i ? JSON.parse(i) : {};
  } catch (u) {
    d = u;
  }
  return {
    ok: a.ok,
    status: a.status,
    url: t,
    data: o,
    rawText: i,
    parseError: d,
    errorSnippet: ea(o, i)
  };
}
function sa(t) {
  return ve((t?.data || []).map((s) => String(s?.id || "").trim()).filter(Boolean));
}
function aa(t) {
  return ve((t?.data || []).map((s) => String(s?.id || "").trim()).filter(Boolean));
}
function na(t) {
  return ve((t?.models || t?.data || []).map((s) => String(s?.id || s?.name || "")).map((s) => s.split("/").pop() || "").filter(Boolean));
}
async function Ge({ urls: t, requestOptionsList: s, extractModels: a, providerLabel: i }) {
  let o = null;
  e: for (const d of t) for (const u of s) {
    const g = await ta(d, u);
    if (!g.ok) {
      if (o = g, g.status === 401 || g.status === 403) break e;
      continue;
    }
    if (g.parseError) {
      o = {
        ...g,
        errorSnippet: "返回的不是 JSON"
      };
      continue;
    }
    const m = a(g.data);
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
async function Dt(t, s, a = {}) {
  const i = R(s.modelListAuth) === "bearer" ? "openai-compatible" : "anthropic";
  return await Ge({
    urls: Qs(t),
    requestOptionsList: [{
      headers: {
        ...we(i, s.apiKey).headers,
        "anthropic-version": "2023-06-01",
        Accept: "application/json"
      },
      signal: a.signal
    }],
    extractModels: aa,
    providerLabel: "Anthropic"
  });
}
async function ra(t, s = {}) {
  const a = we("anthropic", t.apiKey), i = ge(t.baseUrl || ""), o = ge(i || It.claude);
  if (o && (a.apiKey || i)) try {
    return await Dt(o, t, s);
  } catch (d) {
    if (i) throw d;
  }
  return [...Vs];
}
async function ia(t, s = {}) {
  const a = t.provider, i = ge(t.baseUrl || ""), o = we(a, t.apiKey), { apiKey: d } = o;
  if (a === "sillytavern-claude") return ve(await ra(t, s));
  if (Ks(a)) return ve(await Qe(t, Ys(a), { signal: s.signal }));
  if (!i) throw new Error("请先填写 Base URL。");
  return a === "google" ? await Ge({
    urls: Zs(i, d),
    requestOptionsList: [{
      headers: {
        Accept: "application/json",
        ...o.headers
      },
      signal: s.signal
    }, ...d ? [{
      headers: {
        Accept: "application/json",
        ...we("openai-compatible", d).headers
      },
      signal: s.signal
    }] : []],
    extractModels: na,
    providerLabel: "Google AI"
  }) : G(a) ? await Dt(i, t, s) : await Ge({
    urls: Xs(i),
    requestOptionsList: [{
      headers: {
        ...o.headers,
        Accept: "application/json"
      },
      signal: s.signal
    }],
    extractModels: sa,
    providerLabel: a === "openai-responses" ? "OpenAI Responses" : "OpenAI-Compatible"
  });
}
function oa(t) {
  return t instanceof Error ? t.message : String(t || "unknown_error");
}
function la(t = {}) {
  const { state: s, render: a, showToast: i, createRequestId: o = (e = "req") => `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, saveConfig: d, pullModels: u = ia, describeError: g = oa, getRuntimeSummaryText: m } = t;
  function y() {
    s.configFormSyncPending = !0;
  }
  function p(e, r = "main") {
    const n = String(e || "").trim() || "openai-compatible";
    return r === "delegate" ? `delegate:${n}` : n;
  }
  function D(e, r = "main") {
    return s.pullStateByProvider?.[p(e, r)] || {
      status: "idle",
      message: ""
    };
  }
  function j(e, r, n = "main") {
    s.pullStateByProvider = {
      ...s.pullStateByProvider || {},
      [p(e, n)]: r
    };
  }
  function _(e, r, n = "main") {
    s.modelOptionsByProvider = {
      ...s.modelOptionsByProvider || {},
      [p(e, n)]: Array.isArray(r) ? r : []
    };
  }
  function N(e, r = "main") {
    const n = p(e, r);
    return Array.isArray(s.modelOptionsByProvider?.[n]) ? s.modelOptionsByProvider[n] : [];
  }
  function $(e, r) {
    const n = s.config?.presets || {}, l = T(e || r || "默认");
    return n[l] ? l : r && n[r] ? r : Object.keys(n)[0] || "默认";
  }
  function Z(e, r) {
    const n = $(e, We), l = r && typeof r == "object" ? r : L(), c = l.provider || "openai-compatible", S = O(l.modelConfigs || {}), v = S[c] || {}, A = Me(c, v);
    return {
      delegatePresetName: n,
      delegateProvider: c,
      delegateModelConfigs: S,
      delegateBaseUrl: String(v.baseUrl || ""),
      delegateModel: String(v.model || ""),
      delegateApiKey: String(v.apiKey || ""),
      delegateModelListAuth: R(v.modelListAuth),
      delegateTemperature: I(v.temperature, 1),
      delegateMaxTokens: q(v.maxTokens),
      delegateSendTemperature: Fe(v),
      delegateReasoningMode: A.reasoningMode,
      delegateReasoningEffort: A.reasoningEffort,
      delegateReasoningBudgetTokens: A.reasoningBudgetTokens,
      delegateToolMode: v.toolMode || "native"
    };
  }
  function se(e = "openai-compatible", r = {}) {
    const n = O(r || {})[e] || {}, l = Me(e, n);
    return {
      baseUrl: String(n.baseUrl || ""),
      model: String(n.model || ""),
      apiKey: String(n.apiKey || ""),
      modelListAuth: R(n.modelListAuth),
      temperature: I(n.temperature, 1),
      maxTokens: q(n.maxTokens),
      sendTemperature: Fe(n),
      ...l,
      toolMode: n.toolMode || "native"
    };
  }
  function ae(e = "openai-compatible", r = {}) {
    const n = O(r || {})[e] || {}, l = Me(e, n);
    return {
      delegateBaseUrl: String(n.baseUrl || ""),
      delegateModel: String(n.model || ""),
      delegateApiKey: String(n.apiKey || ""),
      delegateModelListAuth: R(n.modelListAuth),
      delegateTemperature: I(n.temperature, 1),
      delegateMaxTokens: q(n.maxTokens),
      delegateSendTemperature: Fe(n),
      delegateReasoningMode: l.reasoningMode,
      delegateReasoningEffort: l.reasoningEffort,
      delegateReasoningBudgetTokens: l.reasoningBudgetTokens,
      delegateToolMode: n.toolMode || "native"
    };
  }
  function U(e, r, n = s.config) {
    const l = T(e || "默认"), c = r && typeof r == "object" ? r : L(), S = c.provider || "openai-compatible", v = O(c.modelConfigs || {}), A = se(S, v), M = $(n?.delegatePresetName, l), P = Z(M, n?.delegateConfig && typeof n.delegateConfig == "object" ? n.delegateConfig : (n?.presets || {})[M] || c);
    return {
      currentPresetName: l,
      presetDraftName: l,
      provider: S,
      modelConfigs: v,
      ...A,
      ...K(n),
      permissionMode: de(c.permissionMode),
      jsApiPermission: X(n?.jsApiPermission),
      ...P
    };
  }
  function x() {
    if (s.configDraft) return s.configDraft;
    const e = T(s.config?.currentPresetName || "默认");
    return s.configDraft = U(e, (s.config?.presets || {})[e] || L()), s.configDraft;
  }
  function J(e, r = {}) {
    const n = x(), l = r.provider || e.querySelector("#xb-assistant-provider")?.value || n.provider || "openai-compatible", c = r.delegateProvider || e.querySelector("#xb-assistant-delegate-provider")?.value || n.delegateProvider || "openai-compatible", S = e.querySelector("#xb-assistant-base-url")?.value.trim() || "", v = e.querySelector("#xb-assistant-model")?.value.trim() || "", A = e.querySelector("#xb-assistant-delegate-base-url")?.value.trim() ?? n.delegateBaseUrl ?? "", M = e.querySelector("#xb-assistant-delegate-model")?.value.trim() ?? n.delegateModel ?? "", P = ht({
      mode: e.querySelector("#xb-assistant-reasoning-mode")?.value || n.reasoningMode,
      effort: e.querySelector("#xb-assistant-reasoning-effort")?.value || n.reasoningEffort,
      budgetTokens: e.querySelector("#xb-assistant-reasoning-budget")?.value ?? n.reasoningBudgetTokens
    }), V = ht({
      mode: e.querySelector("#xb-assistant-delegate-reasoning-mode")?.value || n.delegateReasoningMode,
      effort: e.querySelector("#xb-assistant-delegate-reasoning-effort")?.value || n.delegateReasoningEffort,
      budgetTokens: e.querySelector("#xb-assistant-delegate-reasoning-budget")?.value ?? n.delegateReasoningBudgetTokens
    }), k = {
      baseUrl: S,
      model: v,
      apiKey: e.querySelector("#xb-assistant-api-key")?.value.trim() || "",
      ...G(l) ? { modelListAuth: R(e.querySelector("#xb-assistant-model-list-auth")?.value ?? n.modelListAuth) } : {},
      temperature: I(e.querySelector("#xb-assistant-temperature")?.value, n.temperature ?? 1),
      maxTokens: q(e.querySelector("#xb-assistant-max-tokens")?.value, n.maxTokens),
      sendTemperature: e.querySelector("#xb-assistant-send-temperature")?.checked ?? !!(n.sendTemperature ?? !0),
      reasoning: P,
      toolMode: le(l) ? e.querySelector("#xb-assistant-tool-mode")?.value || n.toolMode || "native" : void 0
    }, C = {
      baseUrl: A,
      model: M,
      apiKey: e.querySelector("#xb-assistant-delegate-api-key")?.value.trim() ?? n.delegateApiKey ?? "",
      ...G(c) ? { modelListAuth: R(e.querySelector("#xb-assistant-delegate-model-list-auth")?.value ?? n.delegateModelListAuth) } : {},
      temperature: I(e.querySelector("#xb-assistant-delegate-temperature")?.value, n.delegateTemperature ?? 1),
      maxTokens: q(e.querySelector("#xb-assistant-delegate-max-tokens")?.value, n.delegateMaxTokens),
      sendTemperature: e.querySelector("#xb-assistant-delegate-send-temperature")?.checked ?? !!(n.delegateSendTemperature ?? !0),
      reasoning: V,
      toolMode: le(c) ? e.querySelector("#xb-assistant-delegate-tool-mode")?.value || n.delegateToolMode || "native" : void 0
    }, ee = {
      ...O(n.modelConfigs || {}),
      [l]: {
        ...O(n.modelConfigs || {})[l] || {},
        ...k
      }
    }, z = {
      ...O(n.delegateModelConfigs || {}),
      [c]: {
        ...O(n.delegateModelConfigs || {})[c] || {},
        ...C
      }
    };
    return {
      ...n,
      currentPresetName: n.currentPresetName,
      presetDraftName: T(e.querySelector("#xb-assistant-preset-name")?.value),
      provider: l,
      modelConfigs: ee,
      baseUrl: k.baseUrl,
      model: k.model,
      apiKey: k.apiKey,
      modelListAuth: k.modelListAuth,
      temperature: k.temperature,
      maxTokens: k.maxTokens,
      sendTemperature: k.sendTemperature,
      reasoningMode: k.reasoning.mode,
      reasoningEffort: k.reasoning.effort || "",
      reasoningBudgetTokens: k.reasoning.budgetTokens,
      toolMode: k.toolMode || n.toolMode || "native",
      ...Ws(e, n),
      permissionMode: de(e.querySelector("#xb-assistant-permission-mode")?.value || n.permissionMode),
      jsApiPermission: X(e.querySelector("#xb-assistant-jsapi-permission")?.value || n.jsApiPermission),
      delegatePresetName: $(e.querySelector("#xb-assistant-delegate-preset-select")?.value || n.delegatePresetName, n.currentPresetName),
      delegateProvider: c,
      delegateModelConfigs: z,
      delegateBaseUrl: C.baseUrl,
      delegateModel: C.model,
      delegateApiKey: C.apiKey,
      delegateModelListAuth: C.modelListAuth,
      delegateTemperature: C.temperature,
      delegateMaxTokens: C.maxTokens,
      delegateSendTemperature: C.sendTemperature,
      delegateReasoningMode: C.reasoning.mode,
      delegateReasoningEffort: C.reasoning.effort || "",
      delegateReasoningBudgetTokens: C.reasoning.budgetTokens,
      delegateToolMode: C.toolMode || n.delegateToolMode || "native"
    };
  }
  function f(e, r = {}) {
    return s.configDraft = J(e, r), s.configDirty = !0, s.configDraft;
  }
  function b(e = x()) {
    return {
      baseUrl: String(e.baseUrl || ""),
      model: String(e.model || ""),
      apiKey: String(e.apiKey || ""),
      ...G(e.provider) ? { modelListAuth: R(e.modelListAuth) } : {},
      temperature: I(e.temperature, 1),
      maxTokens: q(e.maxTokens),
      sendTemperature: !!(e.sendTemperature ?? !0),
      reasoning: be({
        mode: e.reasoningMode,
        effort: e.reasoningEffort,
        budgetTokens: e.reasoningBudgetTokens
      }),
      toolMode: le(e.provider) ? e.toolMode || "native" : void 0
    };
  }
  function h(e = x()) {
    return {
      baseUrl: String(e.delegateBaseUrl || ""),
      model: String(e.delegateModel || ""),
      apiKey: String(e.delegateApiKey || ""),
      ...G(e.delegateProvider) ? { modelListAuth: R(e.delegateModelListAuth) } : {},
      temperature: I(e.delegateTemperature, 1),
      maxTokens: q(e.delegateMaxTokens),
      sendTemperature: !!(e.delegateSendTemperature ?? !0),
      reasoning: be({
        mode: e.delegateReasoningMode,
        effort: e.delegateReasoningEffort,
        budgetTokens: e.delegateReasoningBudgetTokens
      }),
      toolMode: le(e.delegateProvider) ? e.delegateToolMode || "native" : void 0
    };
  }
  function E(e = x()) {
    const r = e.delegateProvider || "openai-compatible", n = O(e.delegateModelConfigs || {});
    return {
      provider: r,
      modelConfigs: {
        ...n,
        [r]: {
          ...n[r] || {},
          ...h(e)
        }
      }
    };
  }
  function Se(e = x()) {
    return {
      provider: e.provider || "openai-compatible",
      baseUrl: e.baseUrl || "",
      model: e.model || "",
      apiKey: e.apiKey || "",
      ...G(e.provider) ? { modelListAuth: R(e.modelListAuth) } : {},
      ...K(e),
      temperature: e.sendTemperature === !1 ? void 0 : I(e.temperature, 1),
      sendTemperature: !!(e.sendTemperature ?? !0),
      maxTokens: q(e.maxTokens),
      timeoutMs: vt,
      toolMode: e.toolMode || "native",
      reasoning: ke({
        provider: e.provider,
        baseUrl: e.baseUrl,
        model: e.model,
        maxTokens: q(e.maxTokens)
      }, {
        mode: e.reasoningMode,
        effort: e.reasoningEffort,
        budgetTokens: e.reasoningBudgetTokens
      })
    };
  }
  function Ut(e = x()) {
    return {
      provider: e.delegateProvider || "openai-compatible",
      baseUrl: e.delegateBaseUrl || "",
      model: e.delegateModel || "",
      apiKey: e.delegateApiKey || "",
      ...G(e.delegateProvider) ? { modelListAuth: R(e.delegateModelListAuth) } : {},
      ...K(e),
      temperature: e.delegateSendTemperature === !1 ? void 0 : I(e.delegateTemperature, 1),
      sendTemperature: !!(e.delegateSendTemperature ?? !0),
      maxTokens: q(e.delegateMaxTokens),
      timeoutMs: vt,
      toolMode: e.delegateToolMode || "native",
      reasoning: ke({
        provider: e.delegateProvider,
        baseUrl: e.delegateBaseUrl,
        model: e.delegateModel,
        maxTokens: q(e.delegateMaxTokens)
      }, {
        mode: e.delegateReasoningMode,
        effort: e.delegateReasoningEffort,
        budgetTokens: e.delegateReasoningBudgetTokens
      })
    };
  }
  function Bt(e = {}) {
    const r = [];
    Object.entries(e.presets || {}).forEach(([S, v]) => {
      const A = v?.provider || "openai-compatible", M = v?.modelConfigs?.[A] || {}, P = ke({
        provider: A,
        baseUrl: M.baseUrl,
        model: M.model,
        maxTokens: q(M.maxTokens)
      }, M.reasoning);
      P.valid === !1 && r.push(`预设“${S}”：${P.error}`);
    });
    const n = e.delegateConfig?.provider || "openai-compatible", l = e.delegateConfig?.modelConfigs?.[n] || {}, c = ke({
      provider: n,
      baseUrl: l.baseUrl,
      model: l.model,
      maxTokens: q(l.maxTokens)
    }, l.reasoning);
    return c.valid === !1 && r.push(`分身模型：${c.error}`), r;
  }
  function he(e = {}) {
    const r = (e.role === "delegate", x());
    return e.role === "delegate" ? Ut(r) : Se(r);
  }
  function jt(e) {
    x(), s.configDraft = {
      ...s.configDraft,
      presetDraftName: T(e.querySelector("#xb-assistant-preset-name")?.value)
    };
  }
  function Ft(e = x(), r = e.provider || "openai-compatible", n = "main") {
    const l = D(r, n);
    return typeof m == "function" ? m({
      state: s,
      draft: e,
      provider: r,
      pullState: l,
      providerLabel: xt(r)
    }) : `预设「${e.currentPresetName || "默认"}」 · ${xt(r)}`;
  }
  function Ze(e, r, n) {
    const l = e?.querySelector?.(r);
    if (!l) return;
    const c = String(n?.status || "idle"), S = String(n?.message || "").trim();
    l.textContent = S, l.hidden = !S, l.classList.toggle("is-loading", c === "loading"), l.classList.toggle("is-success", c === "success"), l.classList.toggle("is-error", c === "error");
  }
  function et(e) {
    if (!e) return;
    const r = Ee(s.configPage);
    s.configPage = r, e.querySelectorAll("[data-config-page]").forEach((n) => {
      const l = Ee(n?.dataset?.configPage) === r;
      n.classList.toggle("is-active", l), n.setAttribute("aria-selected", l ? "true" : "false");
    }), e.querySelectorAll("[data-config-page-panel]").forEach((n) => {
      const l = Ee(n?.dataset?.configPagePanel) === r;
      n.toggleAttribute("hidden", !l);
    }), e.querySelector("#xb-assistant-delete-preset")?.toggleAttribute("hidden", r === "delegate");
  }
  function F(e, r = "main") {
    const n = x(), l = r === "delegate", c = l ? "#xb-assistant-delegate-reasoning" : "#xb-assistant-reasoning", S = l ? n.delegateProvider : n.provider, v = l ? n.delegateBaseUrl : n.baseUrl, A = l ? n.delegateModel : n.model, M = {
      mode: l ? n.delegateReasoningMode : n.reasoningMode,
      effort: l ? n.delegateReasoningEffort : n.reasoningEffort,
      budgetTokens: l ? n.delegateReasoningBudgetTokens : n.reasoningBudgetTokens
    }, P = kt({
      provider: S,
      baseUrl: v,
      model: A
    }), V = Me(S, {
      baseUrl: v,
      model: A,
      reasoning: M
    }), k = V.reasoningMode, C = V.reasoningEffort, ee = V.reasoningBudgetTokens, z = e.querySelector(`${c}-mode`), ne = e.querySelector(`${c}-capability`), re = e.querySelector(`${c}-effort-wrap`), ie = e.querySelector(`${c}-effort`), oe = e.querySelector(`${c}-budget-wrap`), te = e.querySelector(`${c}-budget`);
    z && (B(z, ns(P)), z.value = k), ne && (ne.textContent = P.unsupportedReason || `能力配置：${P.profileId}`), ie && (B(ie, is(P)), ie.value = C), re && (re.style.display = k === "on" && P.intensity.kind === "effort" ? "" : "none"), te && P.intensity.kind === "budget" && (te.min = P.intensity.allowAuto ? "-1" : String(P.intensity.min), te.max = String(P.intensity.max), te.value = String(ee)), oe && (oe.style.display = k === "on" && P.intensity.kind === "budget" ? "" : "none");
  }
  function H(e) {
    const r = e.querySelector("#xb-assistant-runtime");
    if (!r) return;
    const n = x(), l = s.configPage === "delegate", c = l ? n.delegateProvider : n.provider;
    r.textContent = Ft(l ? {
      ...n,
      currentPresetName: "分身",
      provider: c
    } : n, c || "openai-compatible", l ? "delegate" : "main");
  }
  function tt(e, r, n, l = "main") {
    const c = l === "delegate" ? "#xb-assistant-delegate" : "#xb-assistant", S = e.querySelector(`${c}-model-list-auth-wrap`), v = e.querySelector(`${c}-model-list-auth`);
    S && (S.style.display = G(r) ? "" : "none"), v && (B(v, ds), v.value = R(n));
  }
  function st(e) {
    if (!s.config) return;
    et(e);
    const r = x(), n = r.provider || "openai-compatible", l = N(n), c = r.delegateProvider || "openai-compatible", S = N(c, "delegate"), v = e.querySelector("#xb-assistant-provider"), A = e.querySelector("#xb-assistant-base-url"), M = e.querySelector("#xb-assistant-model"), P = e.querySelector("#xb-assistant-api-key"), V = e.querySelector("#xb-assistant-temperature"), k = e.querySelector("#xb-assistant-send-temperature"), C = e.querySelector("#xb-assistant-tool-mode-wrap"), ee = e.querySelector("#xb-assistant-tool-mode"), z = e.querySelector("#xb-assistant-permission-mode"), ne = e.querySelector("#xb-assistant-jsapi-permission"), re = e.querySelector("#xb-assistant-model-pulled"), ie = e.querySelector("#xb-assistant-max-tokens"), oe = e.querySelector("#xb-assistant-preset-select"), te = e.querySelector("#xb-assistant-preset-name"), _e = e.querySelector("#xb-assistant-delegate-preset-select"), rt = e.querySelector("#xb-assistant-delegate-provider"), it = e.querySelector("#xb-assistant-delegate-base-url"), ot = e.querySelector("#xb-assistant-delegate-model"), lt = e.querySelector("#xb-assistant-delegate-api-key"), Ie = e.querySelector("#xb-assistant-delegate-model-pulled"), dt = e.querySelector("#xb-assistant-delegate-max-tokens"), ut = e.querySelector("#xb-assistant-delegate-tool-mode-wrap"), Re = e.querySelector("#xb-assistant-delegate-tool-mode");
    if (!oe || !te) return;
    const ct = (s.config.presetNames || []).map((Y) => ({
      value: Y,
      label: Y
    }));
    B(oe, ct), oe.value = r.currentPresetName || s.config.currentPresetName || "默认", _e && (B(_e, ct), _e.value = $(r.delegatePresetName, r.currentPresetName)), te.value = r.presetDraftName || r.currentPresetName || "默认", v && (v.value = n), A && (A.value = r.baseUrl || ""), M && (M.value = r.model || ""), P && (P.value = r.apiKey || ""), tt(e, n, r.modelListAuth), ie && (ie.value = String(q(r.maxTokens))), V && (V.value = String(I(r.temperature, 1))), k && (k.checked = !!(r.sendTemperature ?? !0)), St(e, r), C && (C.style.display = le(n) ? "" : "none"), ee && (B(ee, yt), ee.value = r.toolMode || "native"), z && (B(z, cs), z.value = de(r.permissionMode)), ne && (B(ne, gs), ne.value = X(r.jsApiPermission)), F(e), re && (B(re, l.map((Y) => ({
      value: Y,
      label: Y
    })), "手动填写"), re.value = l.includes(r.model) ? r.model : ""), rt && (rt.value = c), it && (it.value = r.delegateBaseUrl || ""), ot && (ot.value = r.delegateModel || ""), lt && (lt.value = r.delegateApiKey || ""), tt(e, c, r.delegateModelListAuth, "delegate");
    const gt = e.querySelector("#xb-assistant-delegate-temperature"), pt = e.querySelector("#xb-assistant-delegate-send-temperature");
    dt && (dt.value = String(q(r.delegateMaxTokens))), gt && (gt.value = String(I(r.delegateTemperature, 1))), pt && (pt.checked = !!(r.delegateSendTemperature ?? !0)), ut && (ut.style.display = le(c) ? "" : "none"), Re && (B(Re, yt), Re.value = r.delegateToolMode || "native"), F(e, "delegate"), Ie && (B(Ie, S.map((Y) => ({
      value: Y,
      label: Y
    })), "手动填写"), Ie.value = S.includes(r.delegateModel) ? r.delegateModel : ""), Ze(e, "#xb-assistant-model-pull-status", D(n)), Ze(e, "#xb-assistant-delegate-model-pull-status", D(c, "delegate")), H(e);
  }
  function Kt(e) {
    if (typeof d != "function") return;
    const r = d(e);
    r && typeof r.catch == "function" && r.catch((n) => {
      i?.(g(n));
    });
  }
  function Le(e, r, n) {
    e.querySelector(r)?.addEventListener("click", () => {
      const l = e.querySelector(n);
      l && (l.type = l.type === "password" ? "text" : "password");
    });
  }
  function Ht(e) {
    return {
      workspaceFileName: e?.workspaceFileName || "",
      jsApiPermission: X(e?.jsApiPermission),
      ...K(e),
      currentPresetName: e?.currentPresetName || "默认",
      delegatePresetName: e?.delegatePresetName || e?.currentPresetName || "默认",
      delegateConfig: e?.delegateConfig || {},
      delegateConfigured: e?.delegateConfigured === !0,
      presets: e?.presets || {}
    };
  }
  function at(e, r = {}) {
    const n = Oe(e), l = Bt(n);
    if (l.length)
      return i?.(l[0]), !1;
    s.config = n;
    const c = T(r.presetName || n.currentPresetName || "默认");
    return s.configDraft = U(c, n.presets?.[c] || L(), n), y(), Kt({
      requestId: o(r.requestPrefix || "save-config"),
      config: n,
      payload: Ht(n)
    }), !0;
  }
  function Pe(e, r = {}) {
    const n = f(e), l = T(r.presetName || n.presetDraftName), c = T(n.currentPresetName || s.config?.currentPresetName || "默认"), S = (s.config?.presets || {})[c] || L(), v = O(n.modelConfigs || S.modelConfigs || {}), A = {
      ...S,
      provider: n.provider,
      permissionMode: de(n.permissionMode),
      modelConfigs: {
        ...v,
        [n.provider]: {
          ...v[n.provider] || {},
          ...b(n)
        }
      }
    }, M = { ...s.config?.presets || {} };
    r.renameCurrentPreset && l !== c && delete M[c], M[l] = A, at({
      ...s.config,
      jsApiPermission: X(n.jsApiPermission),
      ...K(n),
      currentPresetName: l,
      delegatePresetName: $(n.delegatePresetName, l),
      delegateConfig: E(n),
      delegateConfigured: r.configureDelegate === !0 || s.config?.delegateConfigured === !0,
      presets: M
    }, {
      presetName: l,
      requestPrefix: r.requestPrefix
    });
  }
  function nt(e, r = "") {
    const n = T(r || "默认"), l = typeof window < "u" && typeof window.prompt == "function" ? window.prompt(e, n) : n;
    return l === null ? "" : T(l);
  }
  function zt(e) {
    const r = nt("输入新预设名称：", `${f(e).currentPresetName || "默认"} 副本`);
    if (!r) {
      i?.("预设名称不能为空");
      return;
    }
    const n = e.querySelector("#xb-assistant-preset-name");
    n && (n.value = r, Pe(e, {
      presetName: r,
      requestPrefix: "create-preset"
    }));
  }
  function Gt(e) {
    const r = f(e), n = T(r.currentPresetName || s.config?.currentPresetName || "默认"), l = nt("输入预设名称：", r.presetDraftName || n);
    if (!l) {
      i?.("预设名称不能为空");
      return;
    }
    if (l === n) return;
    const c = e.querySelector("#xb-assistant-preset-name");
    c && (c.value = l, Pe(e, {
      presetName: l,
      renameCurrentPreset: !0,
      requestPrefix: "rename-preset"
    }));
  }
  function Wt(e) {
    if (Object.keys(s.config?.presets || {}).length <= 1) {
      i?.("至少要保留一套预设");
      return;
    }
    const r = f(e), n = T(s.configDraft?.currentPresetName || s.config?.currentPresetName || "默认"), l = { ...s.config?.presets || {} };
    delete l[n];
    const c = Object.keys(l)[0] || "默认";
    at({
      ...s.config,
      jsApiPermission: X(r.jsApiPermission),
      ...K(r),
      currentPresetName: c,
      delegatePresetName: $(r.delegatePresetName, c),
      delegateConfig: E(r),
      presets: l
    }, {
      presetName: c,
      requestPrefix: "delete-preset"
    }) && a?.();
  }
  function Jt(e) {
    if (e?.querySelector?.("#xb-assistant-provider")) {
      e.querySelector("#xb-assistant-provider")?.addEventListener("change", (r) => {
        const n = r.currentTarget.value, l = x().provider, c = f(e, { provider: l });
        s.configDraft = {
          ...c,
          provider: n,
          ...se(n, c.modelConfigs)
        }, y(), a?.();
      }), e.querySelector("#xb-assistant-preset-select")?.addEventListener("change", (r) => {
        const n = T(r.currentTarget.value), l = (s.config?.presets || {})[n] || L(), c = f(e);
        s.config = Oe({
          ...s.config,
          ...K(c),
          jsApiPermission: X(c.jsApiPermission),
          currentPresetName: n,
          delegatePresetName: $(c.delegatePresetName, n),
          delegateConfig: E(c)
        }), s.configDraft = U(n, l, s.config), y(), a?.();
      }), e.querySelector("#xb-assistant-preset-name")?.addEventListener("input", () => {
        jt(e);
      }), e.querySelector("#xb-assistant-base-url")?.addEventListener("input", () => {
        f(e), F(e), H(e);
      }), e.querySelector("#xb-assistant-model")?.addEventListener("input", () => {
        f(e), F(e), H(e);
      }), e.querySelector("#xb-assistant-api-key")?.addEventListener("input", () => {
        f(e);
      });
      for (const r of ["#xb-assistant", "#xb-assistant-delegate"]) e.querySelector(`${r}-model-list-auth`)?.addEventListener("change", () => {
        f(e);
      });
      e.querySelector("#xb-assistant-max-tokens")?.addEventListener("input", () => {
        f(e);
      }), e.querySelector("#xb-assistant-temperature")?.addEventListener("input", () => {
        f(e);
      }), e.querySelector("#xb-assistant-send-temperature")?.addEventListener("change", () => {
        f(e);
      }), Gs(e), e.querySelector("#xb-assistant-web-provider")?.addEventListener("change", () => {
        St(e, f(e));
      });
      for (const { id: r } of Q)
        e.querySelector(`#xb-assistant-${r}-api-key`)?.addEventListener("input", () => f(e)), Le(e, `#xb-assistant-toggle-${r}-key`, `#xb-assistant-${r}-api-key`);
      e.querySelector("#xb-assistant-model-pulled")?.addEventListener("change", (r) => {
        const n = r.currentTarget.value;
        if (!n) return;
        const l = e.querySelector("#xb-assistant-model");
        l && (l.value = n), f(e), F(e), H(e);
      }), Le(e, "#xb-assistant-toggle-key", "#xb-assistant-api-key"), e.querySelector("#xb-assistant-delegate-provider")?.addEventListener("change", (r) => {
        const n = r.currentTarget.value, l = x().delegateProvider, c = f(e, { delegateProvider: l });
        s.configDraft = {
          ...c,
          delegateProvider: n,
          ...ae(n, c.delegateModelConfigs)
        }, y(), a?.();
      }), e.querySelector("#xb-assistant-delegate-base-url")?.addEventListener("input", () => {
        f(e), F(e, "delegate"), H(e);
      }), e.querySelector("#xb-assistant-delegate-model")?.addEventListener("input", () => {
        f(e), F(e, "delegate"), H(e);
      }), e.querySelector("#xb-assistant-delegate-api-key")?.addEventListener("input", () => {
        f(e);
      }), e.querySelector("#xb-assistant-delegate-max-tokens")?.addEventListener("input", () => {
        f(e);
      }), e.querySelector("#xb-assistant-delegate-temperature")?.addEventListener("input", () => {
        f(e);
      }), e.querySelector("#xb-assistant-delegate-send-temperature")?.addEventListener("change", () => {
        f(e);
      }), e.querySelector("#xb-assistant-delegate-model-pulled")?.addEventListener("change", (r) => {
        const n = r.currentTarget.value;
        if (!n) return;
        const l = e.querySelector("#xb-assistant-delegate-model");
        l && (l.value = n), f(e), F(e, "delegate"), H(e);
      }), Le(e, "#xb-assistant-delegate-toggle-key", "#xb-assistant-delegate-api-key"), e.querySelector("#xb-assistant-reasoning-mode")?.addEventListener("change", () => {
        f(e), F(e), H(e);
      }), e.querySelector("#xb-assistant-reasoning-effort")?.addEventListener("change", () => {
        f(e);
      }), e.querySelector("#xb-assistant-reasoning-budget")?.addEventListener("input", () => {
        f(e);
      }), e.querySelector("#xb-assistant-tool-mode")?.addEventListener("change", () => {
        f(e);
      }), e.querySelector("#xb-assistant-delegate-reasoning-mode")?.addEventListener("change", () => {
        f(e), F(e, "delegate"), H(e);
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
        const n = $(r.currentTarget?.value, s.configDraft?.currentPresetName || s.config?.currentPresetName || "默认"), l = (s.config?.presets || {})[n] || L();
        s.configDraft = {
          ...f(e),
          ...Z(n, l)
        }, y(), a?.();
      }), e.querySelectorAll("[data-config-page]").forEach((r) => {
        r.addEventListener("click", (n) => {
          f(e), s.configPage = Ee(n.currentTarget?.dataset?.configPage), et(e), st(e);
        });
      }), e.querySelector("#xb-assistant-pull-models")?.addEventListener("click", async () => {
        f(e), y();
        const r = he();
        j(r.provider, {
          status: "loading",
          message: "正在拉取模型列表…"
        }), a?.();
        try {
          const n = await u(r);
          _(r.provider, n), j(r.provider, {
            status: "success",
            message: `已拉取 ${n.length} 个模型`
          });
        } catch (n) {
          _(r.provider, []), j(r.provider, {
            status: "error",
            message: g(n)
          });
        }
        y(), a?.();
      }), e.querySelector("#xb-assistant-delegate-pull-models")?.addEventListener("click", async () => {
        f(e), y();
        const r = he({ role: "delegate" });
        j(r.provider, {
          status: "loading",
          message: "正在拉取模型列表…"
        }, "delegate"), a?.();
        try {
          const n = await u(r);
          _(r.provider, n, "delegate"), j(r.provider, {
            status: "success",
            message: `已拉取 ${n.length} 个模型`
          }, "delegate");
        } catch (n) {
          _(r.provider, [], "delegate"), j(r.provider, {
            status: "error",
            message: g(n)
          }, "delegate");
        }
        y(), a?.();
      }), e.querySelector("#xb-assistant-new-preset")?.addEventListener("click", () => {
        zt(e);
      }), e.querySelector("#xb-assistant-rename-preset")?.addEventListener("click", () => {
        Gt(e);
      }), e.querySelector("#xb-assistant-save")?.addEventListener("click", () => {
        Pe(e);
      }), e.querySelector("#xb-assistant-delegate-save")?.addEventListener("click", () => {
        Pe(e, {
          requestPrefix: "save-delegate-config",
          configureDelegate: !0
        });
      }), e.querySelector("#xb-assistant-delete-preset")?.addEventListener("click", () => {
        Wt(e);
      });
    }
  }
  return {
    getActiveProviderConfig: he,
    getActiveProviderConfigFromForm(e, r = {}) {
      return s.configDraft = J(e), he(r);
    },
    syncConfigToForm: st,
    bindSettingsPanelEvents: Jt
  };
}
function Ne(t = "") {
  return String(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Pt(t = "main") {
  const s = t === "delegate" ? "xb-assistant-delegate" : "xb-assistant";
  return `<label id="${s}-model-list-auth-wrap" style="display: none">
        <span>模型列表鉴权</span>
        <select id="${s}-model-list-auth"></select>
    </label>`;
}
function me(t) {
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
function da(t = {}) {
  const s = String(t?.status || "idle");
  return s === "saving" ? "saving" : s === "success" ? "success" : s === "error" ? "error" : "save";
}
function ua(t = {}) {
  const s = String(t?.status || "idle");
  return s === "saving" ? {
    className: "xb-assistant-save-button is-saving",
    title: "正在保存配置"
  } : s === "success" ? {
    className: "xb-assistant-save-button is-success",
    title: "配置已保存"
  } : s === "error" ? {
    className: "xb-assistant-save-button is-error",
    title: Ne(t?.error || "保存失败")
  } : {
    className: "xb-assistant-save-button",
    title: "保存配置"
  };
}
function ca(t = {}) {
  const { configSave: s = {}, runtimeText: a = "", inlineToastText: i = "", showInlineToast: o = !0, showAssistantPermissions: d = !0, showDelegateSettings: u = !0, showWebSettings: g = !0, activePage: m = "main", delegatePresetHint: y = "DelegateRun 分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。", isBusy: p = !1, canDeletePreset: D = !0, configLoadError: j = "" } = t, _ = String(j || "").trim(), N = ua(s), $ = da(s), Z = p || _ || String(s?.status || "") === "saving" ? "disabled" : "", se = p || !D ? "disabled" : "", ae = m === "delegate" ? "delegate" : "main", U = ae === "main", x = ae === "delegate", J = d ? `
            <label>
                <span>斜杠命令权限</span>
                <select id="xb-assistant-permission-mode"></select>
            </label>
            <label>
                <span>JavaScript API 权限</span>
                <select id="xb-assistant-jsapi-permission"></select>
            </label>` : "", f = u ? `
            <div class="xb-assistant-config-tabs" role="tablist" aria-label="API 配置分页">
                <button id="xb-assistant-config-tab-main" type="button" class="xb-assistant-config-tab ${U ? "is-active" : ""}" data-config-page="main" role="tab" aria-selected="${U ? "true" : "false"}">主助手 API</button>
                <button id="xb-assistant-config-tab-delegate" type="button" class="xb-assistant-config-tab ${x ? "is-active" : ""}" data-config-page="delegate" role="tab" aria-selected="${x ? "true" : "false"}">分身 API</button>
            </div>` : "", b = u ? `
            <div class="xb-assistant-config-page" data-config-page-panel="delegate" ${x ? "" : "hidden"}>
                <p class="xb-assistant-config-note">${Ne(y)}</p>
                <div class="xb-assistant-preset-row">
                    <select id="xb-assistant-delegate-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                    <div class="xb-assistant-preset-tools is-single" aria-label="分身 API 预设操作">
                        <button id="xb-assistant-delegate-save" type="button" class="xb-assistant-icon-button ${N.className}" title="${N.title}" aria-label="${N.title}" ${Z}>${me($)}</button>
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
                ${Pt("delegate")}
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
            <fieldset class="xb-assistant-config-fields" data-xb-agent-config-fields ${_ ? "disabled" : ""}>
            ${f}
            <div class="xb-assistant-config-page" data-config-page-panel="main" ${U ? "" : "hidden"}>
            <div class="xb-assistant-preset-row">
                <select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"></select>
                <input id="xb-assistant-preset-name" type="hidden" />
                <div class="xb-assistant-preset-tools" aria-label="API 预设操作">
                    <button id="xb-assistant-new-preset" type="button" class="xb-assistant-icon-button" title="新增预设" aria-label="新增预设" ${p ? "disabled" : ""}>${me("add")}</button>
                    <button id="xb-assistant-rename-preset" type="button" class="xb-assistant-icon-button" title="重命名预设" aria-label="重命名预设" ${p ? "disabled" : ""}>${me("rename")}</button>
                    <button id="xb-assistant-save" type="button" class="xb-assistant-icon-button ${N.className}" title="${N.title}" aria-label="${N.title}" ${Z}>${me($)}</button>
                    <button id="xb-assistant-delete-preset" type="button" class="xb-assistant-icon-button" title="删除预设" aria-label="删除预设" ${se}>${me("delete")}</button>
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
            ${Pt()}
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
            ${g ? zs() : ""}
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
            <div class="xb-assistant-runtime" id="xb-assistant-runtime">${Ne(a)}</div>
            </fieldset>
            ${o ? `<div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite">${Ne(_ || i)}</div>` : ""}
        </section>
    `;
}
var ga = { class: "agent-api-app" }, pa = { class: "agent-api-scroll" }, ma = { class: "agent-api-content" }, fa = {
  key: 0,
  class: "agent-api-state",
  "aria-live": "polite"
}, ba = {
  key: 1,
  class: "agent-api-state is-error",
  role: "alert"
}, va = {
  class: "agent-api-panel xb-agent-settings-surface",
  "aria-label": "API 设置"
}, ya = { "aria-live": "polite" }, xa = ["disabled"], Tt = 13e4, Sa = /* @__PURE__ */ Yt({
  __name: "AgentApiApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(t) {
    const s = t, a = structuredClone(mt(s.initialState)), i = Te(a), o = Te(null), d = Te("idle"), u = Te("连接尚未测试");
    let g = () => {
    }, m = null, y = 0;
    const p = ts({
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
    }), D = je(() => i.value.status === "ready" && p.config !== null), j = je(() => Object.keys(p.config?.presets || {}).length), _ = je(() => d.value === "testing");
    function N(b) {
      const h = b instanceof Error ? b.message : String(b || "unknown_error");
      return h === "host_request_timeout" ? "暂时没收到结果，请检查网络后重试。" : h === "app_inactive" ? "页面已经关闭。" : h;
    }
    function $() {
      m && clearTimeout(m), m = setTimeout(() => {
        p.configSave = {
          status: "idle",
          requestId: "",
          error: ""
        }, p.inlineToastText = "", x();
      }, 1800);
    }
    async function Z(b) {
      const h = b.payload || {};
      p.configSave = {
        status: "saving",
        requestId: "",
        error: ""
      }, p.inlineToastText = "正在保存设置…", x();
      try {
        const E = (await s.bridge.request("agent-api/save", { patch: h }, 35e3)).result;
        if (E.ok !== !0 || !E.config) throw new Error(E.error || "模型设置保存失败");
        p.config = Oe(E.config), p.configDraft = null, p.configDirty = !1, p.configFormSyncPending = !0, p.configSave = {
          status: "success",
          requestId: "",
          error: ""
        }, p.inlineToastText = "设置已保存";
      } catch (E) {
        const Se = N(E);
        p.configSave = {
          status: "error",
          requestId: "",
          error: Se
        }, p.inlineToastText = Se;
      }
      x(), $();
    }
    async function se() {
      const b = ++y;
      try {
        const h = await s.bridge.request("agent-api/reload", {}, 35e3);
        if (b !== y) return;
        J(h.result);
      } catch (h) {
        if (b !== y) return;
        i.value = {
          status: "error",
          config: null,
          message: N(h)
        }, x();
      }
    }
    async function ae(b) {
      return (await s.bridge.request("agent-api/pull-models", { providerConfig: b }, Tt)).result.models;
    }
    const U = la({
      state: p,
      render: x,
      saveConfig: Z,
      pullModels: ae,
      describeError: N
    });
    function x() {
      const b = o.value;
      !b || !p.config || (b.innerHTML = ca({
        configSave: p.configSave,
        inlineToastText: p.inlineToastText,
        showAssistantPermissions: !1,
        showDelegateSettings: !1,
        showWebSettings: !0,
        canDeletePreset: j.value > 1
      }), U.syncConfigToForm(b), U.bindSettingsPanelEvents(b));
    }
    function J(b) {
      i.value = structuredClone(b), b.status === "ready" && b.config && (p.config = Oe(b.config), p.configDraft = null, p.configDirty = !1, p.configFormSyncPending = !0), Xt(x);
    }
    async function f() {
      const b = o.value;
      if (!b || !D.value || _.value) return;
      const h = U.getActiveProviderConfigFromForm(b);
      d.value = "testing", u.value = "正在测试当前填写的连接…";
      try {
        const E = (await s.bridge.request("agent-api/test-connection", { providerConfig: structuredClone(mt(h)) }, Tt)).result;
        d.value = "success", u.value = `${E.provider || "当前服务"} · ${E.model || "当前模型"} · ${E.latencyMs} 毫秒`;
      } catch (E) {
        d.value = "error", u.value = N(E);
      }
    }
    return Zt(() => {
      g = s.bridge.subscribe((b) => {
        b.type === "agent-api/state" && J(b.payload.state);
      }), J(a);
    }), Qt(() => {
      y += 1, g(), m && clearTimeout(m);
    }), (b, h) => (Ue(), De("main", ga, [w("div", pa, [w("div", ma, [
      h[2] || (h[2] = w("header", { class: "agent-api-header" }, [w("h1", null, "API 设置"), w("p", null, "与小白助手等功能共用主预设")], -1)),
      i.value.status === "loading" ? (Ue(), De("section", fa, " 正在加载设置 ")) : i.value.status === "error" ? (Ue(), De("section", ba, [w("div", null, [h[1] || (h[1] = w("strong", null, "设置暂时无法加载", -1)), w("span", null, Be(i.value.message), 1)]), w("button", {
        type: "button",
        onClick: h[0] || (h[0] = (E) => se())
      }, "重新加载")])) : as("", !0),
      Vt(w("section", va, [w("div", {
        ref_key: "panelRoot",
        ref: o
      }, null, 512), w("div", { class: ss(["agent-api-connection", `is-${d.value}`]) }, [w("p", ya, Be(u.value), 1), w("button", {
        type: "button",
        disabled: !D.value || _.value,
        onClick: f
      }, Be(_.value ? "测试中…" : "测试当前连接"), 9, xa)], 2)], 512), [[es, D.value]])
    ])])]));
  }
}), Ea = Sa;
export {
  Ea as default
};
