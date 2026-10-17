var Fm = Object.create, nd = Object.defineProperty, Om = Object.getOwnPropertyDescriptor, Gm = Object.getOwnPropertyNames, Bm = Object.getPrototypeOf, qm = Object.prototype.hasOwnProperty, Fr = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), Hm = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var r = Gm(t), i = 0, s = r.length, u; i < s; i++)
      u = r[i], !qm.call(e, u) && u !== n && nd(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(o = Om(t, u)) || o.enumerable
      });
  return e;
}, Vm = (e, t, n) => (n = e != null ? Fm(Bm(e)) : {}, Hm(t || !e || !e.__esModule ? nd(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), od = "littlewhitebox-server", Kb = `/api/plugins/${od}`, ks = Object.freeze([{
  id: "tavily",
  label: "Tavily",
  baseUrl: "https://api.tavily.com"
}, {
  id: "exa",
  label: "Exa",
  baseUrl: "https://api.exa.ai"
}]), rd = "tavily", Wb = Object.freeze({
  provider: "联网渠道（全局）",
  key: "API Key",
  show: "显示",
  exaBackend: `Exa 官方接口需安装并启用 ${od}。`
});
function Jm(e) {
  return ks.some((t) => t.id === e) ? e : rd;
}
function id(e = "") {
  return String(e || "").trim();
}
function On(e = "", t = rd) {
  return String(e || "").trim().replace(/\/+$/, "") || ks.find((n) => n.id === t).baseUrl;
}
function _r(e = {}, t = {}) {
  return {
    webProvider: Jm(e.webProvider ?? t.webProvider),
    ...Object.fromEntries(ks.flatMap(({ id: n }) => [[`${n}ApiKey`, id(e[`${n}ApiKey`] ?? t[`${n}ApiKey`])], [`${n}BaseUrl`, On(e[`${n}BaseUrl`] ?? t[`${n}BaseUrl`], n)]]))
  };
}
var zb = Object.freeze([
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
function Km(e = "") {
  return e === "on" || e === "off" ? e : "inherit";
}
function Wm(e) {
  return String(e ?? "").trim().toLowerCase() || void 0;
}
function zm(e) {
  if (e == null || e === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? Math.floor(t) : void 0;
}
function Ds(e = {}) {
  const t = e && typeof e == "object" ? e : {}, n = Wm(t.effort), o = zm(t.budgetTokens);
  return {
    mode: Km(t.mode),
    ...n ? { effort: n } : {},
    ...o !== void 0 ? { budgetTokens: o } : {}
  };
}
function z(e = {}) {
  return e?.mode !== "off" && e?.output === "show";
}
var Ym = "agent-core-no-auth";
function sd(e) {
  return String(e ?? "").trim();
}
function Or(e, t) {
  const n = sd(t);
  if (e === "google") return {
    apiKey: n,
    headers: { "x-goog-api-key": n },
    sdkOptions: {
      apiKey: n,
      vertexai: !1
    }
  };
  if (e === "anthropic") return {
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
  const o = n ? { Authorization: `Bearer ${n}` } : {}, r = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...o
  };
  return {
    apiKey: n,
    headers: o,
    requestHeaders: r,
    sdkOptions: {
      apiKey: n || Ym,
      adminAPIKey: null,
      defaultHeaders: {
        Authorization: null,
        "api-key": null,
        ...r
      },
      fetch: (i, s) => globalThis.fetch(i, {
        ...s,
        headers: r
      })
    }
  };
}
var yr = "x-api-key", Yb = Object.freeze([{
  value: yr,
  label: "x-api-key"
}, {
  value: "bearer",
  label: "Bearer"
}]);
function ki(e) {
  return e === "anthropic" || e === "sillytavern-claude";
}
function Xm(e) {
  return e === "bearer" ? e : yr;
}
var ad = "openai-compatible", $s = "默认", ld = "default", Qm = "deny", rt = 32e3;
var Xb = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), Qb = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), Di = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: rt,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: rt,
    sendTemperature: !0,
    toolMode: "tagged-json"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: rt,
    sendTemperature: !0,
    toolMode: "tagged-json"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    modelListAuth: yr,
    temperature: 1,
    maxTokens: rt,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: rt,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    modelListAuth: yr,
    temperature: 1,
    maxTokens: rt,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: rt,
    sendTemperature: !0
  }
};
function Zt() {
  return JSON.parse(JSON.stringify(Di));
}
function Tt() {
  return {
    provider: ad,
    modelConfigs: Zt(),
    permissionMode: ld
  };
}
function ud(e = Tt()) {
  const t = e && typeof e == "object" ? e : Tt();
  return {
    provider: Us(t.provider),
    modelConfigs: Ls(t.modelConfigs || {})
  };
}
function cd(e) {
  return e === "full" ? "full" : ld;
}
function dd(e) {
  return e === "allow" ? "allow" : Qm;
}
function Gn(e, t = rt) {
  const n = Number(e);
  if (!Number.isFinite(n) || n <= 0) {
    const o = Number(t);
    return Number.isFinite(o) && o > 0 ? Math.floor(o) : rt;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}
function at(e) {
  return String(e || "").trim() || "默认";
}
function Ls(e = {}) {
  const t = Zt();
  return Object.keys(Di).forEach((n) => {
    const o = e && typeof e[n] == "object" ? e[n] : {}, r = Di[n];
    t[n] = {
      baseUrl: String(o.baseUrl ?? r.baseUrl ?? ""),
      model: String(o.model ?? r.model ?? ""),
      apiKey: sd(o.apiKey ?? r.apiKey),
      ...ki(n) ? { modelListAuth: Xm(o.modelListAuth) } : {},
      temperature: o.temperature ?? r.temperature,
      maxTokens: Gn(o.maxTokens, r.maxTokens),
      sendTemperature: typeof o.sendTemperature == "boolean" ? o.sendTemperature : r.sendTemperature,
      ..."toolMode" in r ? { toolMode: String(o.toolMode || r.toolMode || "native") } : {},
      reasoning: Ds(o.reasoning)
    };
  }), t;
}
function Us(e) {
  return typeof e == "string" && e.trim() ? e : ad;
}
function Fs(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function fd(e = {}, t) {
  const n = {}, o = Fs(e, t);
  return Object.entries(o).forEach(([r, i]) => {
    if (!i || typeof i != "object") return;
    const s = at(r);
    n[s] = {
      provider: Us(i.provider),
      modelConfigs: Ls(i.modelConfigs || {}),
      permissionMode: cd(i.permissionMode)
    };
  }), Object.keys(n).length || (n[$s] = Tt()), n;
}
function hd(e, t) {
  const n = at(t);
  return e[n] ? n : Object.keys(e)[0];
}
function pd(e, t, n) {
  const o = at(t || n);
  return e[o] ? o : e[n] ? n : Object.keys(e)[0];
}
function Os(e = {}, t = Tt()) {
  const n = ud(t), o = e && typeof e == "object" ? e : {};
  return {
    provider: Us(o.provider || n.provider),
    modelConfigs: Ls(o.modelConfigs || n.modelConfigs)
  };
}
function md(e = {}, t = {}, n = $s, o = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (o !== n) return !0;
  const r = e?.delegateConfig;
  if (!r || typeof r != "object" || Array.isArray(r) || !(typeof r.provider == "string" && r.provider.trim() || r.modelConfigs && typeof r.modelConfigs == "object" && Object.keys(r.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const i = t[n] || Tt(), s = ud(i), u = Os(r, i);
  return JSON.stringify(u) !== JSON.stringify(s);
}
function Zm(e = {}, t, n, o, r) {
  const i = r(e?.[o]);
  if (i) return i;
  const s = Fs(e, t), u = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(s || {})
  ].map(at), c = /* @__PURE__ */ new Set();
  for (const d of u) {
    if (c.has(d)) continue;
    c.add(d);
    const f = r(s?.[d]?.[o]);
    if (f) return f;
  }
  return r(e?.delegateConfig?.[o]);
}
function jm(e = {}, t, n) {
  const o = (u) => String(u || "").trim();
  if (o(e?.tavilyBaseUrl)) return On(e.tavilyBaseUrl);
  const r = Fs(e, t), i = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(r || {})
  ].map(at), s = /* @__PURE__ */ new Set();
  for (const u of i) {
    if (s.has(u)) continue;
    s.add(u);
    const c = r?.[u]?.tavilyBaseUrl;
    if (o(c)) return On(c);
  }
  return o(e?.delegateConfig?.tavilyBaseUrl) ? On(e.delegateConfig.tavilyBaseUrl) : On();
}
function gd(e = {}, t, n) {
  return {
    tavilyApiKey: Zm(e, t, n, "tavilyApiKey", id),
    tavilyBaseUrl: jm(e, t, n)
  };
}
function Zb(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: o = (p) => String(p || "") } = t, r = at(e.currentPresetName || e.presetName || "默认"), i = fd(e, r), s = hd(i, e.currentPresetName), u = pd(i, e.delegatePresetName, s), c = i[u] || i[s] || Tt(), d = Os(e.delegateConfig, c), f = md(e, i, s, u), h = _r(e, gd(e, r, s));
  return {
    workspaceFileName: o(e.workspaceFileName || n),
    jsApiPermission: dd(e.jsApiPermission),
    currentPresetName: s,
    delegatePresetName: u,
    delegateConfig: d,
    delegateConfigured: f,
    presets: i,
    ...h,
    updatedAt: Number(e.updatedAt) || 0,
    configVersion: 1
  };
}
function eg(e = {}) {
  const t = at(e.currentPresetName || e.presetDraftName || "默认"), n = fd(e, t), o = hd(n, e.currentPresetName), r = pd(n, e.delegatePresetName, o), i = n[o] || Tt(), s = n[r] || i, u = Os(e.delegateConfig, s), c = md(e, n, o, r), d = _r(e, gd(e, t, o));
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    updatedAt: Number(e.updatedAt) || 0,
    jsApiPermission: dd(e.jsApiPermission),
    currentPresetName: o,
    delegatePresetName: r,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: at(e.presetDraftName || o),
    presetNames: Object.keys(n),
    presets: n,
    provider: i.provider,
    modelConfigs: i.modelConfigs,
    permissionMode: cd(i.permissionMode),
    ...d
  };
}
function tg(e = "") {
  return String(e || "").trim().toLowerCase();
}
function Gr(e = "") {
  const t = tg(e);
  return t.includes("deepseek") ? "deepseek" : t.includes("kimi") || t.includes("moonshot") ? "kimi" : t.includes("gemini") ? "gemini" : t.includes("claude") ? "claude" : /(?:^|[/_.-])gpt(?:\d|[/_.-]|$)/.test(t) || /(?:^|[/_.-])o\d+(?:[/_.-]|$)/.test(t) ? "openai" : "";
}
var ng = Object.freeze({
  minimal: "最小",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "超高",
  max: "最大",
  min: "最小"
});
function _d(e) {
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
function Ze(e, t, n, o, r = {}) {
  return _d({
    profileId: e,
    modes: t,
    intensity: {
      kind: "effort",
      values: n,
      defaultValue: o
    },
    outputModes: r.outputModes,
    temperatureOmitModes: r.temperatureOmitModes
  });
}
var Gs = _d({
  profileId: "unsupported",
  modes: ["inherit"],
  outputModes: ["hide"],
  intensity: { kind: "none" },
  unsupportedReason: "当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。"
}), mo = Object.freeze(["on"]), Bs = Object.freeze([
  "inherit",
  "on",
  "off"
]), yd = Ze("openai-gpt-5.6", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "medium", { temperatureOmitModes: Bs }), og = Ze("kimi-k3", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "max", { temperatureOmitModes: mo }), rg = Ze("deepseek-thinking", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "high", { temperatureOmitModes: mo }), ig = Ze("openai-compatible-gemini-latest", [
  "inherit",
  "on",
  "off"
], [
  "minimal",
  "low",
  "medium",
  "high"
], "high", { temperatureOmitModes: mo }), sg = Ze("openai-compatible-claude-latest", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: mo }), ag = Ze("openai-compatible-default", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high"
], "medium", { temperatureOmitModes: mo }), lg = Ze("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: Bs }), ug = Ze("sillytavern-claude-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: Bs }), cg = Ze("google-gemini-3-flash", ["inherit", "on"], [
  "minimal",
  "low",
  "medium",
  "high"
], "high"), dg = Ze("sillytavern-google-3-flash", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high"
], "high");
function fg(e = "") {
  switch (Gr(e)) {
    case "deepseek":
      return rg;
    case "kimi":
      return og;
    case "gemini":
      return ig;
    case "claude":
      return sg;
    case "openai":
      return yd;
    default:
      return ag;
  }
}
function qs(e = {}) {
  const t = String(e.provider || "").trim(), n = String(e.model || "").trim().toLowerCase();
  switch (t) {
    case "openai-responses":
      return yd;
    case "openai-compatible":
    case "sillytavern-openai-compatible":
      return fg(n);
    case "anthropic":
      return lg;
    case "sillytavern-claude":
      return ug;
    case "google":
      return cg;
    case "sillytavern-google":
      return dg;
    default:
      return Gs;
  }
}
function jb(e = Gs) {
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
function eR(e = Gs) {
  return e.intensity?.kind !== "effort" ? [] : e.intensity.values.map((t) => ({
    value: t,
    label: ng[t] || t
  }));
}
function li(e, t, n, o = "REASONING_CAPABILITY_UNSUPPORTED") {
  return {
    ...e,
    profileId: t.profileId,
    valid: !1,
    error: n,
    code: o
  };
}
function hg(e, t) {
  const n = { ...e };
  return delete n.effort, delete n.budgetTokens, t.intensity?.kind === "effort" ? {
    ...n,
    ...e.effort ? { effort: e.effort } : {}
  } : n;
}
function vr(e = {}, t = {}) {
  const n = qs(e), o = Ds(t), r = t?.output === "show" || t?.output === "hide" ? t.output : null, i = hg({
    ...o,
    output: o.mode === "off" ? "hide" : r || (n.outputModes.includes("show") ? "show" : "hide")
  }, n);
  if (!n.outputModes.includes(i.output)) return li(i, n, "当前任务要求返回 Reasoning 内容，但所选模型不支持。");
  if (!n.modes.includes(i.mode)) return li(i, n, i.mode === "off" ? "当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。" : n.unsupportedReason || "当前模型不支持显式开启 Reasoning。");
  if (i.mode !== "on") return {
    ...i,
    profileId: n.profileId,
    valid: !0
  };
  if (n.intensity.kind === "effort") {
    const s = i.effort || n.intensity.defaultValue;
    return n.intensity.values.includes(s) ? {
      ...i,
      effort: s,
      profileId: n.profileId,
      valid: !0
    } : li(i, n, `当前模型不支持 Reasoning 强度“${s}”。`, "REASONING_CONFIG_INVALID");
  }
  return {
    ...i,
    profileId: n.profileId,
    valid: !0
  };
}
var pg = class extends Error {
  constructor(e = {}) {
    super(e.error || "当前模型不支持所选 Reasoning 配置。"), this.name = "ReasoningCapabilityError", this.code = e.code || "REASONING_CAPABILITY_UNSUPPORTED", this.profileId = e.profileId || "unsupported", this.reasoning = e;
  }
};
function vd(e = {}) {
  if (e.valid === !1) throw new pg(e);
  return e;
}
function j(e = "", t = {}, n = {}, o = {}) {
  return vd(vr({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model,
    maxTokens: o.maxTokens ?? t.maxTokens
  }, n));
}
function go(e = {}, t = {}) {
  return qs(e).temperatureOmitModes.includes(t.mode);
}
var tR = 900 * 1e3, nR = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), mg = Object.freeze([
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
function oR(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function Ad(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, o = Number(n);
  return Number.isFinite(o) ? Math.max(0, Math.min(2, o)) : Ad(t, 1);
}
function $i(e = {}) {
  return e.sendTemperature !== !1;
}
function Ja(e = {}) {
  return $i(e) ? Ad(e.temperature, 1) : void 0;
}
function rR(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : mg.find((n) => n.value === e)?.label || e || "未配置";
}
function iR(e = {}) {
  const t = String(e.provider || "").trim();
  return t === "openai-compatible" || t === "sillytavern-openai-compatible" ? e.toolMode === "tagged-json" ? "Tagged JSON 兼容模式" : "原生 Tool Calling" : "Provider 原生工具";
}
function sR(e = {}, t = {}) {
  const n = eg(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const d = n.delegateConfig.provider || "openai-compatible", f = (n.delegateConfig.modelConfigs || Zt())[d] || Zt()[d] || {}, h = {
      provider: d,
      baseUrl: String(f.baseUrl || ""),
      model: String(f.model || ""),
      maxTokens: Gn(f.maxTokens)
    };
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: d,
      baseUrl: String(f.baseUrl || ""),
      model: String(f.model || ""),
      apiKey: String(f.apiKey || ""),
      ...ki(d) ? { modelListAuth: f.modelListAuth } : {},
      ..._r(n),
      temperature: Ja(f),
      sendTemperature: $i(f),
      maxTokens: Gn(f.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: f.toolMode || "native",
      reasoning: vr(h, f.reasoning)
    };
  }
  const o = at(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), r = n.presets?.[o] ? o : n.presets?.[n.currentPresetName] ? n.currentPresetName : $s, i = n.presets?.[r] || Tt(), s = i.provider || n.provider || "openai-compatible", u = (i.modelConfigs || n.modelConfigs || Zt())[s] || Zt()[s] || {}, c = {
    provider: s,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    maxTokens: Gn(u.maxTokens)
  };
  return {
    currentPresetName: String(r || ""),
    provider: s,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    ...ki(s) ? { modelListAuth: u.modelListAuth } : {},
    ..._r(n),
    temperature: Ja(u),
    sendTemperature: $i(u),
    maxTokens: Gn(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoning: vr(c, u.reasoning)
  };
}
function $(e, t, n, o, r) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !r) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? r.call(e, n) : r ? r.value = n : t.set(e, n), n;
}
function A(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var Td = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Td = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function lo(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Li = (e) => {
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
}, B = class extends Error {
}, be = class Ui extends B {
  constructor(t, n, o, r, i) {
    super(`${Ui.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new Br({
      message: o,
      cause: Li(n)
    });
    const i = n, s = i?.error?.type;
    return t === 400 ? new Ed(t, i, o, r, s) : t === 401 ? new Cd(t, i, o, r, s) : t === 403 ? new wd(t, i, o, r, s) : t === 404 ? new Id(t, i, o, r, s) : t === 409 ? new bd(t, i, o, r, s) : t === 422 ? new Rd(t, i, o, r, s) : t === 429 ? new Pd(t, i, o, r, s) : t >= 500 ? new Md(t, i, o, r, s) : new Ui(t, i, o, r, s);
  }
}, He = class extends be {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Br = class extends be {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Sd = class extends Br {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Ed = class extends be {
}, Cd = class extends be {
}, wd = class extends be {
}, Id = class extends be {
}, bd = class extends be {
}, Rd = class extends be {
}, Pd = class extends be {
}, Md = class extends be {
}, gg = /^[a-z][a-z0-9+.-]*:/i, _g = (e) => gg.test(e), Fi = (e) => (Fi = Array.isArray, Fi(e)), Ka = Fi;
function Oi(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Wa(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function yg(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var vg = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new B(`${e} must be an integer`);
  if (t < 0) throw new B(`${e} must be a positive integer`);
  return t;
}, Nd = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Ag = (e) => new Promise((t) => setTimeout(t, e)), Wt = "0.91.1", Tg = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Sg() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Eg = () => {
  const e = Sg();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Wt,
    "X-Stainless-OS": Ya(Deno.build.os),
    "X-Stainless-Arch": za(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Wt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Wt,
    "X-Stainless-OS": Ya(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": za(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Cg();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Wt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Wt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Cg() {
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
var za = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Ya = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Xa, wg = () => Xa ?? (Xa = Eg());
function Ig() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function xd(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function kd(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return xd({
    start() {
    },
    async pull(n) {
      const { done: o, value: r } = await t.next();
      o ? n.close() : n.enqueue(r);
    },
    async cancel() {
      await t.return?.();
    }
  });
}
function Hs(e) {
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
async function bg(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Rg = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Pg(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new B(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function Mg(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Qa;
function Vs(e) {
  let t;
  return (Qa ?? (t = new globalThis.TextEncoder(), Qa = t.encode.bind(t)))(e);
}
var Za;
function ja(e) {
  let t;
  return (Za ?? (t = new globalThis.TextDecoder(), Za = t.decode.bind(t)))(e);
}
var Se, Ee, _o = class {
  constructor() {
    Se.set(this, void 0), Ee.set(this, void 0), $(this, Se, new Uint8Array(), "f"), $(this, Ee, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Vs(e) : e;
    $(this, Se, Mg([A(this, Se, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = Ng(A(this, Se, "f"), A(this, Ee, "f"))) != null; ) {
      if (o.carriage && A(this, Ee, "f") == null) {
        $(this, Ee, o.index, "f");
        continue;
      }
      if (A(this, Ee, "f") != null && (o.index !== A(this, Ee, "f") + 1 || o.carriage)) {
        n.push(ja(A(this, Se, "f").subarray(0, A(this, Ee, "f") - 1))), $(this, Se, A(this, Se, "f").subarray(A(this, Ee, "f")), "f"), $(this, Ee, null, "f");
        continue;
      }
      const r = A(this, Ee, "f") !== null ? o.preceding - 1 : o.preceding, i = ja(A(this, Se, "f").subarray(0, r));
      n.push(i), $(this, Se, A(this, Se, "f").subarray(o.index), "f"), $(this, Ee, null, "f");
    }
    return n;
  }
  flush() {
    return A(this, Se, "f").length ? this.decode(`
`) : [];
  }
};
Se = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new WeakMap();
_o.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
_o.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Ng(e, t) {
  for (let r = t ?? 0; r < e.length; r++) {
    if (e[r] === 10) return {
      preceding: r,
      index: r + 1,
      carriage: !1
    };
    if (e[r] === 13) return {
      preceding: r,
      index: r + 1,
      carriage: !0
    };
  }
  return null;
}
function xg(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var Ar = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, el = (e, t, n) => {
  if (e) {
    if (yg(Ar, e)) return e;
    he(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Ar))}`);
  }
};
function Bn() {
}
function Po(e, t, n) {
  return !t || Ar[e] > Ar[n] ? Bn : t[e].bind(t);
}
var kg = {
  error: Bn,
  warn: Bn,
  info: Bn,
  debug: Bn
}, tl = /* @__PURE__ */ new WeakMap();
function he(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return kg;
  const o = tl.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: Po("error", t, n),
    warn: Po("warn", t, n),
    info: Po("info", t, n),
    debug: Po("debug", t, n)
  };
  return tl.set(t, [n, r]), r;
}
var Rt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), An, uo = class qn {
  constructor(t, n, o) {
    this.iterator = t, An.set(this, void 0), this.controller = n, $(this, An, o, "f");
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? he(o) : console;
    async function* s() {
      if (r) throw new B("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of Dg(t, n)) {
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
            const d = Nd(c.data) ?? c.data, f = d?.error?.type;
            throw new be(void 0, d, void 0, t.headers, f);
          }
        }
        u = !0;
      } catch (c) {
        if (lo(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new qn(s, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    async function* i() {
      const u = new _o(), c = Hs(t);
      for await (const d of c) for (const f of u.decode(d)) yield f;
      for (const d of u.flush()) yield d;
    }
    async function* s() {
      if (r) throw new B("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (lo(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new qn(s, n, o);
  }
  [(An = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), r = (i) => ({ next: () => {
      if (i.length === 0) {
        const s = o.next();
        t.push(s), n.push(s);
      }
      return i.shift();
    } });
    return [new qn(() => r(t), this.controller, A(this, An, "f")), new qn(() => r(n), this.controller, A(this, An, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return xd({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const s = Vs(JSON.stringify(r) + `
`);
          o.enqueue(s);
        } catch (r) {
          o.error(r);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* Dg(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new B("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new B("Attempted to iterate over a response with no body");
  const n = new Lg(), o = new _o(), r = Hs(e.body);
  for await (const i of $g(r)) for (const s of o.decode(i)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const s = n.decode(i);
    s && (yield s);
  }
}
async function* $g(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Vs(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = xg(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Lg = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const r = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], r;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, o] = Ug(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Ug(e, t) {
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
async function Dd(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, s = await (async () => {
    if (t.options.stream)
      return he(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : uo.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : $d(await n.json(), n) : await n.text();
  })();
  return he(e).debug(`[${o}] response parsed`, Rt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
function $d(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var Hn, Ld = class Ud extends Promise {
  constructor(t, n, o = Dd) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, Hn.set(this, void 0), $(this, Hn, t, "f");
  }
  _thenUnwrap(t) {
    return new Ud(A(this, Hn, "f"), this.responsePromise, async (n, o) => $d(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(A(this, Hn, "f"), t))), this.parsedPromise;
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
Hn = /* @__PURE__ */ new WeakMap();
var Mo, Fd = class {
  constructor(e, t, n, o) {
    Mo.set(this, void 0), $(this, Mo, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new B("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await A(this, Mo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Mo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Fg = class extends Ld {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await Dd(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, yo = class extends Fd {
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
          ...Oi(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Oi(this.options.query),
        after_id: e
      }
    } : null;
  }
}, Ae = class extends Fd {
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
        ...Oi(this.options.query),
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
function ln(e, t, n) {
  return Od(), new File(e, t ?? "unknown_file", n);
}
function or(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Gd = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Js = async (e, t, n = !0) => ({
  ...e,
  body: await Gg(e.body, t, n)
}), nl = /* @__PURE__ */ new WeakMap();
function Og(e) {
  const t = typeof e == "function" ? e : e.fetch, n = nl.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return nl.set(t, o), o;
}
var Gg = async (e, t, n = !0) => {
  if (!await Og(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const o = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, i]) => Gi(o, r, i, n))), o;
}, Bg = (e) => e instanceof Blob && "name" in e, Gi = async (e, t, n, o) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let r = {};
      const i = n.headers.get("Content-Type");
      i && (r = { type: i }), e.append(t, ln([await n.blob()], or(n, o), r));
    } else if (Gd(n)) e.append(t, ln([await new Response(kd(n)).blob()], or(n, o)));
    else if (Bg(n)) e.append(t, ln([n], or(n, o), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Gi(e, t + "[]", r, o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, i]) => Gi(e, `${t}[${r}]`, i, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Bd = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", qg = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Bd(e), Hg = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Vg(e, t, n) {
  if (Od(), e = await e, t || (t = or(e, !0)), qg(e))
    return e instanceof File && t == null && n == null ? e : ln([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (Hg(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), ln(await Bi(r), t, n);
  }
  const o = await Bi(e);
  if (!n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return ln(o, t, n);
}
async function Bi(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Bd(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Gd(e)) for await (const n of e) t.push(...await Bi(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Jg(e)}`);
  }
  return t;
}
function Jg(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Z = class {
  constructor(e) {
    this._client = e;
  }
}, qd = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Kg(e) {
  if (!e) return;
  if (qd in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Ka(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = Ka(o[1]) ? o[1] : [o[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [r, null]), yield [r, u]);
  }
}
var P = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, s] of Kg(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [qd]: !0,
    values: t,
    nulls: n
  };
};
function Hd(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var ol = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Wg = (e = Hd) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], s = n.reduce((f, h, p) => {
    /[?#]/.test(h) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? ol) ?? ol)?.toString) && (g = m + "", i.push({
      start: f.length + h.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), f + h + (p === o.length ? "" : g);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) i.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (i.sort((f, h) => f.start - h.start), i.length > 0) {
    let f = 0;
    const h = i.reduce((p, m) => {
      const g = " ".repeat(m.start - f), _ = "^".repeat(m.length);
      return f = m.start + m.length, p + g + _;
    }, "");
    throw new B(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${s}
${h}`);
  }
  return s;
}, U = /* @__PURE__ */ Wg(Hd), Vd = class extends Z {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/environments/${e}?beta=true`, {
      body: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", Ae, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, no = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function rr(e) {
  return typeof e == "object" && e !== null && no in e;
}
function Jd(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const o of e) rr(o) && n.add(o[no]);
  if (t) {
    for (const o of t)
      if (rr(o) && n.add(o[no]), Array.isArray(o.content))
        for (const r of o.content) rr(r) && n.add(r[no]);
  }
  return Array.from(n);
}
function Kd(e, t) {
  const n = Jd(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function zg(e) {
  return rr(e) ? { "x-stainless-helper": e[no] } : {};
}
var Wd = class extends Z {
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", yo, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/files/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/files/${e}/content?beta=true`, {
      ...n,
      headers: P([{
        "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/files/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/files?beta=true", Js({
      body: o,
      ...t,
      headers: P([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        zg(o.file),
        t?.headers
      ])
    }, this._client));
  }
}, zd = class extends Z {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/models/${e}?beta=true`, {
      ...n,
      headers: P([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", yo, {
      query: o,
      ...t,
      headers: P([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Yd = class extends Z {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/user_profiles?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/user_profiles/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/user_profiles/${e}?beta=true`, {
      body: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/user_profiles?beta=true", Ae, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  createEnrollmentURL(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/user_profiles/${e}/enrollment_url?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
}, Xd = class extends Z {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/agents/${e}/versions?beta=true`, Ae, {
      query: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ks = class extends Z {
  constructor() {
    super(...arguments), this.versions = new Xd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.get(U`/v1/agents/${e}?beta=true`, {
      query: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/agents/${e}?beta=true`, {
      body: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", Ae, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Ks.Versions = Xd;
var Qd = class extends Z {
  create(e, t, n) {
    const { view: o, betas: r, ...i } = t;
    return this._client.post(U`/v1/memory_stores/${e}/memories?beta=true`, {
      query: { view: o },
      body: i,
      ...n,
      headers: P([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { memory_store_id: o, betas: r, ...i } = t;
    return this._client.get(U`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: i,
      ...n,
      headers: P([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { memory_store_id: o, view: r, betas: i, ...s } = t;
    return this._client.post(U`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: { view: r },
      body: s,
      ...n,
      headers: P([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/memory_stores/${e}/memories?beta=true`, Ae, {
      query: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { memory_store_id: o, expected_content_sha256: r, betas: i } = t;
    return this._client.delete(U`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: { expected_content_sha256: r },
      ...n,
      headers: P([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Zd = class extends Z {
  retrieve(e, t, n) {
    const { memory_store_id: o, betas: r, ...i } = t;
    return this._client.get(U`/v1/memory_stores/${o}/memory_versions/${e}?beta=true`, {
      query: i,
      ...n,
      headers: P([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/memory_stores/${e}/memory_versions?beta=true`, Ae, {
      query: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  redact(e, t, n) {
    const { memory_store_id: o, betas: r } = t;
    return this._client.post(U`/v1/memory_stores/${o}/memory_versions/${e}/redact?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, qr = class extends Z {
  constructor() {
    super(...arguments), this.memories = new Qd(this._client), this.memoryVersions = new Zd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/memory_stores?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/memory_stores/${e}?beta=true`, {
      body: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/memory_stores?beta=true", Ae, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/memory_stores/${e}/archive?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
qr.Memories = Qd;
qr.MemoryVersions = Zd;
var jd = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function ef(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function rl(e, t, n) {
  const o = ef(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((r) => {
      if (r.type === "text") {
        const i = Object.defineProperty({ ...r }, "parsed_output", {
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
      return r;
    }),
    parsed_output: null
  } : tf(e, t, n);
}
function tf(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const s = Yg(t, i.text);
      o === null && (o = s);
      const u = Object.defineProperty({ ...i }, "parsed_output", {
        value: s,
        enumerable: !1
      });
      return Object.defineProperty(u, "parsed", {
        get() {
          return n.logger.warn("The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead."), s;
        },
        enumerable: !1
      });
    }
    return i;
  });
  return {
    ...e,
    content: r,
    parsed_output: o
  };
}
function Yg(e, t) {
  const n = ef(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new B(`Failed to parse structured output: ${o}`);
  }
}
var Xg = (e) => {
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
      let s = "", u = !1;
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
          s += o + e[t], o = e[++t];
        } else
          s += o, o = e[++t];
      }
      o = e[++t], u || n.push({
        type: "string",
        value: s
      });
      continue;
    }
    if (o && /\s/.test(o)) {
      t++;
      continue;
    }
    let r = /[0-9]/;
    if (o && r.test(o) || o === "-" || o === ".") {
      let s = "";
      for (o === "-" && (s += o, o = e[++t]); o && r.test(o) || o === "."; )
        s += o, o = e[++t];
      n.push({
        type: "number",
        value: s
      });
      continue;
    }
    let i = /[a-z]/i;
    if (o && i.test(o)) {
      let s = "";
      for (; o && i.test(o) && t !== e.length; )
        s += o, o = e[++t];
      if (s == "true" || s == "false" || s === "null") n.push({
        type: "name",
        value: s
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
}, zt = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), zt(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), zt(e);
    case "string":
      let o = e[e.length - 2];
      if (o?.type === "delimiter")
        return e = e.slice(0, e.length - 1), zt(e);
      if (o?.type === "brace" && o.value === "{")
        return e = e.slice(0, e.length - 1), zt(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), zt(e);
  }
  return e;
}, Qg = (e) => {
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
}, Zg = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, nf = (e) => JSON.parse(Zg(Qg(zt(Xg(e))))), Me, ft, qt, Tn, No, Sn, En, xo, Cn, je, wn, ko, Do, wt, $o, Lo, In, ui, il, Uo, ci, di, fi, sl, al = "__json_buf";
function ll(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var jg = class qi {
  constructor(t, n) {
    Me.add(this), this.messages = [], this.receivedMessages = [], ft.set(this, void 0), qt.set(this, null), this.controller = new AbortController(), Tn.set(this, void 0), No.set(this, () => {
    }), Sn.set(this, () => {
    }), En.set(this, void 0), xo.set(this, () => {
    }), Cn.set(this, () => {
    }), je.set(this, {}), wn.set(this, !1), ko.set(this, !1), Do.set(this, !1), wt.set(this, !1), $o.set(this, void 0), Lo.set(this, void 0), In.set(this, void 0), Uo.set(this, (o) => {
      if ($(this, ko, !0, "f"), lo(o) && (o = new He()), o instanceof He)
        return $(this, Do, !0, "f"), this._emit("abort", o);
      if (o instanceof B) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new B(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new B(String(o)));
    }), $(this, Tn, new Promise((o, r) => {
      $(this, No, o, "f"), $(this, Sn, r, "f");
    }), "f"), $(this, En, new Promise((o, r) => {
      $(this, xo, o, "f"), $(this, Cn, r, "f");
    }), "f"), A(this, Tn, "f").catch(() => {
    }), A(this, En, "f").catch(() => {
    }), $(this, qt, t, "f"), $(this, In, n?.logger ?? console, "f");
  }
  get response() {
    return A(this, $o, "f");
  }
  get request_id() {
    return A(this, Lo, "f");
  }
  async withResponse() {
    $(this, wt, !0, "f");
    const t = await A(this, Tn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new qi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: r } = {}) {
    const i = new qi(n, { logger: r });
    for (const s of n.messages) i._addMessageParam(s);
    return $(i, qt, {
      ...n,
      stream: !0
    }, "f"), i._run(() => i._createMessage(t, {
      ...n,
      stream: !0
    }, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, A(this, Uo, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, o) {
    const r = o?.signal;
    let i;
    r && (r.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), r.addEventListener("abort", i));
    try {
      A(this, Me, "m", ci).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) A(this, Me, "m", di).call(this, c);
      if (u.controller.signal?.aborted) throw new He();
      A(this, Me, "m", fi).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || ($(this, $o, t, "f"), $(this, Lo, t?.headers.get("request-id"), "f"), A(this, No, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return A(this, wn, "f");
  }
  get errored() {
    return A(this, ko, "f");
  }
  get aborted() {
    return A(this, Do, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (A(this, je, "f")[t] || (A(this, je, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = A(this, je, "f")[t];
    if (!o) return this;
    const r = o.findIndex((i) => i.listener === n);
    return r >= 0 && o.splice(r, 1), this;
  }
  once(t, n) {
    return (A(this, je, "f")[t] || (A(this, je, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      $(this, wt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    $(this, wt, !0, "f"), await A(this, En, "f");
  }
  get currentMessage() {
    return A(this, ft, "f");
  }
  async finalMessage() {
    return await this.done(), A(this, Me, "m", ui).call(this);
  }
  async finalText() {
    return await this.done(), A(this, Me, "m", il).call(this);
  }
  _emit(t, ...n) {
    if (A(this, wn, "f")) return;
    t === "end" && ($(this, wn, !0, "f"), A(this, xo, "f").call(this));
    const o = A(this, je, "f")[t];
    if (o && (A(this, je, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !A(this, wt, "f") && !o?.length && Promise.reject(r), A(this, Sn, "f").call(this, r), A(this, Cn, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !A(this, wt, "f") && !o?.length && Promise.reject(r), A(this, Sn, "f").call(this, r), A(this, Cn, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", A(this, Me, "m", ui).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      A(this, Me, "m", ci).call(this), this._connected(null);
      const i = uo.fromReadableStream(t, this.controller);
      for await (const s of i) A(this, Me, "m", di).call(this, s);
      if (i.controller.signal?.aborted) throw new He();
      A(this, Me, "m", fi).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(ft = /* @__PURE__ */ new WeakMap(), qt = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), No = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), xo = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), je = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), ko = /* @__PURE__ */ new WeakMap(), Do = /* @__PURE__ */ new WeakMap(), wt = /* @__PURE__ */ new WeakMap(), $o = /* @__PURE__ */ new WeakMap(), Lo = /* @__PURE__ */ new WeakMap(), In = /* @__PURE__ */ new WeakMap(), Uo = /* @__PURE__ */ new WeakMap(), Me = /* @__PURE__ */ new WeakSet(), ui = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, il = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new B("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, ci = function() {
    this.ended || $(this, ft, void 0, "f");
  }, di = function(n) {
    if (this.ended) return;
    const o = A(this, Me, "m", sl).call(this, n);
    switch (this._emit("streamEvent", n, o), n.type) {
      case "content_block_delta": {
        const r = o.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            r.type === "text" && this._emit("text", n.delta.text, r.text || "");
            break;
          case "citations_delta":
            r.type === "text" && this._emit("citation", n.delta.citation, r.citations ?? []);
            break;
          case "input_json_delta":
            ll(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
            break;
          case "thinking_delta":
            r.type === "thinking" && this._emit("thinking", n.delta.thinking, r.thinking);
            break;
          case "signature_delta":
            r.type === "thinking" && this._emit("signature", r.signature);
            break;
          case "compaction_delta":
            r.type === "compaction" && r.content && this._emit("compaction", r.content);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(o), this._addMessage(rl(o, A(this, qt, "f"), { logger: A(this, In, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        $(this, ft, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, fi = function() {
    if (this.ended) throw new B("stream has ended, this shouldn't happen");
    const n = A(this, ft, "f");
    if (!n) throw new B("request ended without sending any chunks");
    return $(this, ft, void 0, "f"), rl(n, A(this, qt, "f"), { logger: A(this, In, "f") });
  }, sl = function(n) {
    let o = A(this, ft, "f");
    if (n.type === "message_start") {
      if (o) throw new B(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new B(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return o;
      case "message_delta":
        return o.container = n.delta.container, o.stop_reason = n.delta.stop_reason, o.stop_sequence = n.delta.stop_sequence, o.usage.output_tokens = n.usage.output_tokens, o.context_management = n.context_management, n.usage.input_tokens != null && (o.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (o.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (o.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (o.usage.server_tool_use = n.usage.server_tool_use), n.usage.iterations != null && (o.usage.iterations = n.usage.iterations), o;
      case "content_block_start":
        return o.content.push(n.content_block), o;
      case "content_block_delta": {
        const r = o.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            r?.type === "text" && (o.content[n.index] = {
              ...r,
              text: (r.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            r?.type === "text" && (o.content[n.index] = {
              ...r,
              citations: [...r.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (r && ll(r)) {
              let i = r[al] || "";
              i += n.delta.partial_json;
              const s = { ...r };
              if (Object.defineProperty(s, al, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                s.input = nf(i);
              } catch (u) {
                const c = new B(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                A(this, Uo, "f").call(this, c);
              }
              o.content[n.index] = s;
            }
            break;
          case "thinking_delta":
            r?.type === "thinking" && (o.content[n.index] = {
              ...r,
              thinking: r.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            r?.type === "thinking" && (o.content[n.index] = {
              ...r,
              signature: n.delta.signature
            });
            break;
          case "compaction_delta":
            r?.type === "compaction" && (o.content[n.index] = {
              ...r,
              content: (r.content || "") + n.delta.content
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
    return this.on("streamEvent", (r) => {
      const i = n.shift();
      i ? i.resolve(r) : t.push(r);
    }), this.on("end", () => {
      o = !0;
      for (const r of n) r.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), this.on("error", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((r, i) => n.push({
        resolve: r,
        reject: i
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
  toReadableStream() {
    return new uo(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, of = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var e_ = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, bn, Ht, It, ne, _e, Te, it, ht, Rn, ul, Hi;
function cl() {
  let e, t;
  return {
    promise: new Promise((n, o) => {
      e = n, t = o;
    }),
    resolve: e,
    reject: t
  };
}
var rf = class {
  constructor(e, t, n) {
    bn.add(this), this.client = e, Ht.set(this, !1), It.set(this, !1), ne.set(this, void 0), _e.set(this, void 0), Te.set(this, void 0), it.set(this, void 0), ht.set(this, void 0), Rn.set(this, 0), $(this, ne, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const o = ["BetaToolRunner", ...Jd(t.tools, t.messages)].join(", ");
    $(this, _e, {
      ...n,
      headers: P([{ "x-stainless-helper": o }, n?.headers])
    }, "f"), $(this, ht, cl(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Ht = /* @__PURE__ */ new WeakMap(), It = /* @__PURE__ */ new WeakMap(), ne = /* @__PURE__ */ new WeakMap(), _e = /* @__PURE__ */ new WeakMap(), Te = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), ht = /* @__PURE__ */ new WeakMap(), Rn = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakSet(), ul = async function() {
    const t = A(this, ne, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (A(this, Te, "f") !== void 0) try {
      const c = await A(this, Te, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const o = t.contextTokenThreshold ?? 1e5;
    if (n < o) return !1;
    const r = t.model ?? A(this, ne, "f").params.model, i = t.summaryPrompt ?? e_, s = A(this, ne, "f").params.messages;
    if (s[s.length - 1].role === "assistant") {
      const c = s[s.length - 1];
      if (Array.isArray(c.content)) {
        const d = c.content.filter((f) => f.type !== "tool_use");
        d.length === 0 ? s.pop() : c.content = d;
      }
    }
    const u = await this.client.beta.messages.create({
      model: r,
      messages: [...s, {
        role: "user",
        content: [{
          type: "text",
          text: i
        }]
      }],
      max_tokens: A(this, ne, "f").params.max_tokens
    }, {
      signal: A(this, _e, "f").signal,
      headers: P([A(this, _e, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new B("Expected text response for compaction");
    return A(this, ne, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (A(this, Ht, "f")) throw new B("Cannot iterate over a consumed stream");
    $(this, Ht, !0, "f"), $(this, It, !0, "f"), $(this, it, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (A(this, ne, "f").params.max_iterations && A(this, Rn, "f") >= A(this, ne, "f").params.max_iterations) break;
          $(this, It, !1, "f"), $(this, it, void 0, "f"), $(this, Rn, (e = A(this, Rn, "f"), e++, e), "f"), $(this, Te, void 0, "f");
          const { max_iterations: n, compactionControl: o, ...r } = A(this, ne, "f").params;
          if (r.stream ? (t = this.client.beta.messages.stream({ ...r }, A(this, _e, "f")), $(this, Te, t.finalMessage(), "f"), A(this, Te, "f").catch(() => {
          }), yield t) : ($(this, Te, this.client.beta.messages.create({
            ...r,
            stream: !1
          }, A(this, _e, "f")), "f"), yield A(this, Te, "f")), !await A(this, bn, "m", ul).call(this)) {
            if (!A(this, It, "f")) {
              const { role: s, content: u } = await A(this, Te, "f");
              A(this, ne, "f").params.messages.push({
                role: s,
                content: u
              });
            }
            const i = await A(this, bn, "m", Hi).call(this, A(this, ne, "f").params.messages.at(-1));
            if (i) A(this, ne, "f").params.messages.push(i);
            else if (!A(this, It, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!A(this, Te, "f")) throw new B("ToolRunner concluded without a message from the server");
      A(this, ht, "f").resolve(await A(this, Te, "f"));
    } catch (t) {
      throw $(this, Ht, !1, "f"), A(this, ht, "f").promise.catch(() => {
      }), A(this, ht, "f").reject(t), $(this, ht, cl(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? A(this, ne, "f").params = e(A(this, ne, "f").params) : A(this, ne, "f").params = e, $(this, It, !0, "f"), $(this, it, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? $(this, _e, e(A(this, _e, "f")), "f") : $(this, _e, {
      ...A(this, _e, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = A(this, _e, "f").signal) {
    const t = await A(this, Te, "f") ?? this.params.messages.at(-1);
    return t ? A(this, bn, "m", Hi).call(this, t, e) : null;
  }
  done() {
    return A(this, ht, "f").promise;
  }
  async runUntilDone() {
    if (!A(this, Ht, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return A(this, ne, "f").params;
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
Hi = async function(t, n = A(this, _e, "f").signal) {
  return A(this, it, "f") !== void 0 ? A(this, it, "f") : ($(this, it, t_(A(this, ne, "f").params, t, {
    ...A(this, _e, "f"),
    signal: n
  }), "f"), A(this, it, "f"));
};
async function t_(e, t = e.messages.at(-1), n) {
  if (!t || t.role !== "assistant" || !t.content || typeof t.content == "string") return null;
  const o = t.content.filter((r) => r.type === "tool_use");
  return o.length === 0 ? null : {
    role: "user",
    content: await Promise.all(o.map(async (r) => {
      const i = e.tools.find((s) => ("name" in s ? s.name : s.mcp_server_name) === r.name);
      if (!i || !("run" in i)) return {
        type: "tool_result",
        tool_use_id: r.id,
        content: `Error: Tool '${r.name}' not found`,
        is_error: !0
      };
      try {
        let s = r.input;
        "parse" in i && i.parse && (s = i.parse(s));
        const u = await i.run(s, {
          toolUseBlock: r,
          signal: n?.signal
        });
        return {
          type: "tool_result",
          tool_use_id: r.id,
          content: u
        };
      } catch (s) {
        return {
          type: "tool_result",
          tool_use_id: r.id,
          content: s instanceof of ? s.content : `Error: ${s instanceof Error ? s.message : String(s)}`,
          is_error: !0
        };
      }
    }))
  };
}
var sf = class af {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new _o();
    for await (const n of this.iterator) for (const o of t.decode(n)) yield JSON.parse(o);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new B("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new B("Attempted to iterate over a response with no body");
    return new af(Hs(t.body), n);
  }
}, lf = class extends Z {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", yo, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const o = await this.retrieve(e);
    if (!o.results_url) throw new B(`No batch \`results_url\`; Has it finished processing? ${o.processing_status} - ${o.id}`);
    const { betas: r } = t ?? {};
    return this._client.get(o.results_url, {
      ...n,
      headers: P([{
        "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, s) => sf.fromResponse(s.response, s.controller));
  }
}, dl = {
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
}, n_ = ["claude-mythos-preview", "claude-opus-4-6"], vo = class extends Z {
  constructor() {
    super(...arguments), this.batches = new lf(this._client);
  }
  create(e, t) {
    const n = fl(e), { betas: o, ...r } = n;
    r.model in dl && console.warn(`The model '${r.model}' is deprecated and will reach end-of-life on ${dl[r.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), n_.includes(r.model) && r.thinking && r.thinking.type === "enabled" && console.warn(`Using Claude with ${r.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!r.stream && i == null) {
      const u = jd[r.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(r.max_tokens, u);
    }
    const s = Kd(r.tools, r.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: r,
      timeout: i ?? 6e5,
      ...t,
      headers: P([
        { ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 },
        s,
        t?.headers
      ]),
      stream: n.stream ?? !1
    });
  }
  parse(e, t) {
    return t = {
      ...t,
      headers: P([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => tf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return jg.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...o } = fl(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new rf(this._client, e, t);
  }
};
function fl(e) {
  if (!e.output_format) return e;
  if (e.output_config?.format) throw new B("Both output_format and output_config.format were provided. Please use only output_config.format (output_format is deprecated).");
  const { output_format: t, ...n } = e;
  return {
    ...n,
    output_config: {
      ...e.output_config,
      format: t
    }
  };
}
vo.Batches = lf;
vo.BetaToolRunner = rf;
vo.ToolError = of;
var uf = class extends Z {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/sessions/${e}/events?beta=true`, Ae, {
      query: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/sessions/${e}/events?beta=true`, {
      body: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, cf = class extends Z {
  retrieve(e, t, n) {
    const { session_id: o, betas: r } = t;
    return this._client.get(U`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: o, betas: r, ...i } = t;
    return this._client.post(U`/v1/sessions/${o}/resources/${e}?beta=true`, {
      body: i,
      ...n,
      headers: P([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/sessions/${e}/resources?beta=true`, Ae, {
      query: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: o, betas: r } = t;
    return this._client.delete(U`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/sessions/${e}/resources?beta=true`, {
      body: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Hr = class extends Z {
  constructor() {
    super(...arguments), this.events = new uf(this._client), this.resources = new cf(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/sessions/${e}?beta=true`, {
      body: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", Ae, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Hr.Events = uf;
Hr.Resources = cf;
var df = class extends Z {
  create(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.post(U`/v1/skills/${e}/versions?beta=true`, Js({
      body: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o, betas: r } = t;
    return this._client.get(U`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/skills/${e}/versions?beta=true`, Ae, {
      query: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: o, betas: r } = t;
    return this._client.delete(U`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, Ws = class extends Z {
  constructor() {
    super(...arguments), this.versions = new df(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Js({
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", Ae, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
Ws.Versions = df;
var ff = class extends Z {
  create(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/vaults/${e}/credentials?beta=true`, {
      body: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.get(U`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: o, betas: r, ...i } = t;
    return this._client.post(U`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      body: i,
      ...n,
      headers: P([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/vaults/${e}/credentials?beta=true`, Ae, {
      query: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.delete(U`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.post(U`/v1/vaults/${o}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, zs = class extends Z {
  constructor() {
    super(...arguments), this.credentials = new ff(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/vaults/${e}?beta=true`, {
      body: r,
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", Ae, {
      query: o,
      ...t,
      headers: P([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: P([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
zs.Credentials = ff;
var De = class extends Z {
  constructor() {
    super(...arguments), this.models = new zd(this._client), this.messages = new vo(this._client), this.agents = new Ks(this._client), this.environments = new Vd(this._client), this.sessions = new Hr(this._client), this.vaults = new zs(this._client), this.memoryStores = new qr(this._client), this.files = new Wd(this._client), this.skills = new Ws(this._client), this.userProfiles = new Yd(this._client);
  }
};
De.Models = zd;
De.Messages = vo;
De.Agents = Ks;
De.Environments = Vd;
De.Sessions = Hr;
De.Vaults = zs;
De.MemoryStores = qr;
De.Files = Wd;
De.Skills = Ws;
De.UserProfiles = Yd;
var hf = class extends Z {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/complete", {
      body: o,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: P([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function pf(e) {
  return e?.output_config?.format;
}
function hl(e, t, n) {
  const o = pf(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((r) => r.type === "text" ? Object.defineProperty({ ...r }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : r),
    parsed_output: null
  } : mf(e, t, n);
}
function mf(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const s = o_(t, i.text);
      return o === null && (o = s), Object.defineProperty({ ...i }, "parsed_output", {
        value: s,
        enumerable: !1
      });
    }
    return i;
  });
  return {
    ...e,
    content: r,
    parsed_output: o
  };
}
function o_(e, t) {
  const n = pf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new B(`Failed to parse structured output: ${o}`);
  }
}
var Ne, pt, Vt, Pn, Fo, Mn, Nn, Oo, xn, et, kn, Go, Bo, bt, qo, Ho, Dn, hi, pl, pi, mi, gi, _i, ml, gl = "__json_buf";
function _l(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var r_ = class Vi {
  constructor(t, n) {
    Ne.add(this), this.messages = [], this.receivedMessages = [], pt.set(this, void 0), Vt.set(this, null), this.controller = new AbortController(), Pn.set(this, void 0), Fo.set(this, () => {
    }), Mn.set(this, () => {
    }), Nn.set(this, void 0), Oo.set(this, () => {
    }), xn.set(this, () => {
    }), et.set(this, {}), kn.set(this, !1), Go.set(this, !1), Bo.set(this, !1), bt.set(this, !1), qo.set(this, void 0), Ho.set(this, void 0), Dn.set(this, void 0), pi.set(this, (o) => {
      if ($(this, Go, !0, "f"), lo(o) && (o = new He()), o instanceof He)
        return $(this, Bo, !0, "f"), this._emit("abort", o);
      if (o instanceof B) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new B(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new B(String(o)));
    }), $(this, Pn, new Promise((o, r) => {
      $(this, Fo, o, "f"), $(this, Mn, r, "f");
    }), "f"), $(this, Nn, new Promise((o, r) => {
      $(this, Oo, o, "f"), $(this, xn, r, "f");
    }), "f"), A(this, Pn, "f").catch(() => {
    }), A(this, Nn, "f").catch(() => {
    }), $(this, Vt, t, "f"), $(this, Dn, n?.logger ?? console, "f");
  }
  get response() {
    return A(this, qo, "f");
  }
  get request_id() {
    return A(this, Ho, "f");
  }
  async withResponse() {
    $(this, bt, !0, "f");
    const t = await A(this, Pn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Vi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: r } = {}) {
    const i = new Vi(n, { logger: r });
    for (const s of n.messages) i._addMessageParam(s);
    return $(i, Vt, {
      ...n,
      stream: !0
    }, "f"), i._run(() => i._createMessage(t, {
      ...n,
      stream: !0
    }, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), i;
  }
  _run(t) {
    t().then(() => {
      this._emitFinal(), this._emit("end");
    }, A(this, pi, "f"));
  }
  _addMessageParam(t) {
    this.messages.push(t);
  }
  _addMessage(t, n = !0) {
    this.receivedMessages.push(t), n && this._emit("message", t);
  }
  async _createMessage(t, n, o) {
    const r = o?.signal;
    let i;
    r && (r.aborted && this.controller.abort(), i = this.controller.abort.bind(this.controller), r.addEventListener("abort", i));
    try {
      A(this, Ne, "m", mi).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) A(this, Ne, "m", gi).call(this, c);
      if (u.controller.signal?.aborted) throw new He();
      A(this, Ne, "m", _i).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || ($(this, qo, t, "f"), $(this, Ho, t?.headers.get("request-id"), "f"), A(this, Fo, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return A(this, kn, "f");
  }
  get errored() {
    return A(this, Go, "f");
  }
  get aborted() {
    return A(this, Bo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (A(this, et, "f")[t] || (A(this, et, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = A(this, et, "f")[t];
    if (!o) return this;
    const r = o.findIndex((i) => i.listener === n);
    return r >= 0 && o.splice(r, 1), this;
  }
  once(t, n) {
    return (A(this, et, "f")[t] || (A(this, et, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      $(this, bt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    $(this, bt, !0, "f"), await A(this, Nn, "f");
  }
  get currentMessage() {
    return A(this, pt, "f");
  }
  async finalMessage() {
    return await this.done(), A(this, Ne, "m", hi).call(this);
  }
  async finalText() {
    return await this.done(), A(this, Ne, "m", pl).call(this);
  }
  _emit(t, ...n) {
    if (A(this, kn, "f")) return;
    t === "end" && ($(this, kn, !0, "f"), A(this, Oo, "f").call(this));
    const o = A(this, et, "f")[t];
    if (o && (A(this, et, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !A(this, bt, "f") && !o?.length && Promise.reject(r), A(this, Mn, "f").call(this, r), A(this, xn, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !A(this, bt, "f") && !o?.length && Promise.reject(r), A(this, Mn, "f").call(this, r), A(this, xn, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", A(this, Ne, "m", hi).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      A(this, Ne, "m", mi).call(this), this._connected(null);
      const i = uo.fromReadableStream(t, this.controller);
      for await (const s of i) A(this, Ne, "m", gi).call(this, s);
      if (i.controller.signal?.aborted) throw new He();
      A(this, Ne, "m", _i).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(pt = /* @__PURE__ */ new WeakMap(), Vt = /* @__PURE__ */ new WeakMap(), Pn = /* @__PURE__ */ new WeakMap(), Fo = /* @__PURE__ */ new WeakMap(), Mn = /* @__PURE__ */ new WeakMap(), Nn = /* @__PURE__ */ new WeakMap(), Oo = /* @__PURE__ */ new WeakMap(), xn = /* @__PURE__ */ new WeakMap(), et = /* @__PURE__ */ new WeakMap(), kn = /* @__PURE__ */ new WeakMap(), Go = /* @__PURE__ */ new WeakMap(), Bo = /* @__PURE__ */ new WeakMap(), bt = /* @__PURE__ */ new WeakMap(), qo = /* @__PURE__ */ new WeakMap(), Ho = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap(), pi = /* @__PURE__ */ new WeakMap(), Ne = /* @__PURE__ */ new WeakSet(), hi = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, pl = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new B("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, mi = function() {
    this.ended || $(this, pt, void 0, "f");
  }, gi = function(n) {
    if (this.ended) return;
    const o = A(this, Ne, "m", ml).call(this, n);
    switch (this._emit("streamEvent", n, o), n.type) {
      case "content_block_delta": {
        const r = o.content.at(-1);
        switch (n.delta.type) {
          case "text_delta":
            r.type === "text" && this._emit("text", n.delta.text, r.text || "");
            break;
          case "citations_delta":
            r.type === "text" && this._emit("citation", n.delta.citation, r.citations ?? []);
            break;
          case "input_json_delta":
            _l(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
            break;
          case "thinking_delta":
            r.type === "thinking" && this._emit("thinking", n.delta.thinking, r.thinking);
            break;
          case "signature_delta":
            r.type === "thinking" && this._emit("signature", r.signature);
            break;
          default:
            n.delta;
        }
        break;
      }
      case "message_stop":
        this._addMessageParam(o), this._addMessage(hl(o, A(this, Vt, "f"), { logger: A(this, Dn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        $(this, pt, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, _i = function() {
    if (this.ended) throw new B("stream has ended, this shouldn't happen");
    const n = A(this, pt, "f");
    if (!n) throw new B("request ended without sending any chunks");
    return $(this, pt, void 0, "f"), hl(n, A(this, Vt, "f"), { logger: A(this, Dn, "f") });
  }, ml = function(n) {
    let o = A(this, pt, "f");
    if (n.type === "message_start") {
      if (o) throw new B(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new B(`Unexpected event order, got ${n.type} before "message_start"`);
    switch (n.type) {
      case "message_stop":
        return o;
      case "message_delta":
        return o.stop_reason = n.delta.stop_reason, o.stop_sequence = n.delta.stop_sequence, o.usage.output_tokens = n.usage.output_tokens, n.usage.input_tokens != null && (o.usage.input_tokens = n.usage.input_tokens), n.usage.cache_creation_input_tokens != null && (o.usage.cache_creation_input_tokens = n.usage.cache_creation_input_tokens), n.usage.cache_read_input_tokens != null && (o.usage.cache_read_input_tokens = n.usage.cache_read_input_tokens), n.usage.server_tool_use != null && (o.usage.server_tool_use = n.usage.server_tool_use), o;
      case "content_block_start":
        return o.content.push({ ...n.content_block }), o;
      case "content_block_delta": {
        const r = o.content.at(n.index);
        switch (n.delta.type) {
          case "text_delta":
            r?.type === "text" && (o.content[n.index] = {
              ...r,
              text: (r.text || "") + n.delta.text
            });
            break;
          case "citations_delta":
            r?.type === "text" && (o.content[n.index] = {
              ...r,
              citations: [...r.citations ?? [], n.delta.citation]
            });
            break;
          case "input_json_delta":
            if (r && _l(r)) {
              let i = r[gl] || "";
              i += n.delta.partial_json;
              const s = { ...r };
              Object.defineProperty(s, gl, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (s.input = nf(i)), o.content[n.index] = s;
            }
            break;
          case "thinking_delta":
            r?.type === "thinking" && (o.content[n.index] = {
              ...r,
              thinking: r.thinking + n.delta.thinking
            });
            break;
          case "signature_delta":
            r?.type === "thinking" && (o.content[n.index] = {
              ...r,
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
    return this.on("streamEvent", (r) => {
      const i = n.shift();
      i ? i.resolve(r) : t.push(r);
    }), this.on("end", () => {
      o = !0;
      for (const r of n) r.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), this.on("error", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((r, i) => n.push({
        resolve: r,
        reject: i
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
  toReadableStream() {
    return new uo(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, gf = class extends Z {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(U`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", yo, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(U`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(U`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new B(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: P([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, r) => sf.fromResponse(r.response, r.controller));
  }
}, Ys = class extends Z {
  constructor() {
    super(...arguments), this.batches = new gf(this._client);
  }
  create(e, t) {
    e.model in yl && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${yl[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), i_.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const r = jd[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, r);
    }
    const o = Kd(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: P([o, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => mf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return r_.createMessage(this, e, t, { logger: this._client.logger ?? console });
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
}, i_ = ["claude-mythos-preview", "claude-opus-4-6"];
Ys.Batches = gf;
var _f = class extends Z {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/models/${e}`, {
      ...n,
      headers: P([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models", yo, {
      query: o,
      ...t,
      headers: P([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Vo = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Ji, Xs, ir, yf, s_ = "\\n\\nHuman:", a_ = "\\n\\nAssistant:", ee = class {
  constructor({ baseURL: e = Vo("ANTHROPIC_BASE_URL"), apiKey: t = Vo("ANTHROPIC_API_KEY") ?? null, authToken: n = Vo("ANTHROPIC_AUTH_TOKEN") ?? null, ...o } = {}) {
    Ji.add(this), ir.set(this, void 0);
    const r = {
      apiKey: t,
      authToken: n,
      ...o,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!r.dangerouslyAllowBrowser && Tg()) throw new B(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = r.baseURL, this.timeout = r.timeout ?? Xs.DEFAULT_TIMEOUT, this.logger = r.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = el(r.logLevel, "ClientOptions.logLevel", this) ?? el(Vo("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = r.fetchOptions, this.maxRetries = r.maxRetries ?? 2, this.fetch = r.fetch ?? Ig(), $(this, ir, Rg, "f"), this._options = r, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return P([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return P([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return P([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return Pg(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Wt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Td()}`;
  }
  makeStatusError(e, t, n, o) {
    return be.generate(e, t, n, o);
  }
  buildURL(e, t, n) {
    const o = !A(this, Ji, "m", yf).call(this) && n || this.baseURL, r = _g(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), s = Object.fromEntries(r.searchParams);
    return (!Wa(i) || !Wa(s)) && (t = {
      ...s,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (r.search = this.stringifyQuery(t)), r.toString();
  }
  _calculateNonstreamingTimeout(e) {
    if (3600 * e / 128e3 > 600) throw new B("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
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
    return new Ld(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, r = o.maxRetries ?? this.maxRetries;
    t == null && (t = r), await this.prepareOptions(o);
    const { req: i, url: s, timeout: u } = await this.buildRequest(o, { retryCount: r - t });
    await this.prepareRequest(i, {
      url: s,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, f = Date.now();
    if (he(this).debug(`[${c}] sending request`, Rt({
      retryOfRequestLogID: n,
      method: o.method,
      url: s,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new He();
    const h = new AbortController(), p = await this.fetchWithTimeout(s, i, u, h).catch(Li), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new He();
      const y = lo(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return he(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - ${_}`), he(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (${_})`, Rt({
          retryOfRequestLogID: n,
          url: s,
          durationMs: m - f,
          message: p.message
        })), this.retryRequest(o, t, n ?? c);
      throw he(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - error; no more retries left`), he(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (error; no more retries left)`, Rt({
        retryOfRequestLogID: n,
        url: s,
        durationMs: m - f,
        message: p.message
      })), y ? new Sd() : new Br({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, y]) => ", " + _ + ": " + JSON.stringify(y)).join("")}] ${i.method} ${s} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - f}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const b = `retrying, ${t} attempts remaining`;
        return await bg(p.body), he(this).info(`${g} - ${b}`), he(this).debug(`[${c}] response error (${b})`, Rt({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - f
        })), this.retryRequest(o, t, n ?? c, p.headers);
      }
      const y = _ ? "error; no more retries left" : "error; not retryable";
      he(this).info(`${g} - ${y}`);
      const T = await p.text().catch((b) => Li(b).message), E = Nd(T), C = E ? void 0 : T;
      throw he(this).debug(`[${c}] response error (${y})`, Rt({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: C,
        durationMs: Date.now() - f
      })), this.makeStatusError(p.status, E, C, p.headers);
    }
    return he(this).info(g), he(this).debug(`[${c}] response start`, Rt({
      retryOfRequestLogID: n,
      url: p.url,
      status: p.status,
      headers: p.headers,
      durationMs: m - f
    })), {
      response: p,
      options: o,
      controller: h,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: f
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
    return new Fg(this, n, e);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: r, method: i, ...s } = t || {}, u = this._makeAbort(o);
    r && r.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && s.body instanceof globalThis.ReadableStream || typeof s.body == "object" && s.body !== null && Symbol.asyncIterator in s.body, f = {
      signal: o.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...s
    };
    i && (f.method = i.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, f);
    } finally {
      clearTimeout(c);
    }
  }
  async shouldRetry(e) {
    const t = e.headers.get("x-should-retry");
    return t === "true" ? !0 : t === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
  }
  async retryRequest(e, t, n, o) {
    let r;
    const i = o?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (r = u);
    }
    const s = o?.get("retry-after");
    if (s && !r) {
      const u = parseFloat(s);
      Number.isNaN(u) ? r = Date.parse(s) - Date.now() : r = u * 1e3;
    }
    if (r === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      r = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await Ag(r), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const r = t - e;
    return Math.min(0.5 * Math.pow(2, r), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new B("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: r, query: i, defaultBaseURL: s } = n, u = this.buildURL(r, i, s);
    "timeout" in n && vg("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    let r = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), r[this.idempotencyHeader] = e.idempotencyKey);
    const i = P([
      r,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...wg(),
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
    const n = P([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: kd(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : A(this, ir, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Xs = ee, ir = /* @__PURE__ */ new WeakMap(), Ji = /* @__PURE__ */ new WeakSet(), yf = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
ee.Anthropic = Xs;
ee.HUMAN_PROMPT = s_;
ee.AI_PROMPT = a_;
ee.DEFAULT_TIMEOUT = 6e5;
ee.AnthropicError = B;
ee.APIError = be;
ee.APIConnectionError = Br;
ee.APIConnectionTimeoutError = Sd;
ee.APIUserAbortError = He;
ee.NotFoundError = Id;
ee.ConflictError = bd;
ee.RateLimitError = Pd;
ee.BadRequestError = Ed;
ee.AuthenticationError = Cd;
ee.InternalServerError = Md;
ee.PermissionDeniedError = wd;
ee.UnprocessableEntityError = Rd;
ee.toFile = Vg;
var Ao = class extends ee {
  constructor() {
    super(...arguments), this.completions = new hf(this), this.messages = new Ys(this), this.models = new _f(this), this.beta = new De(this);
  }
};
Ao.Completions = hf;
Ao.Messages = Ys;
Ao.Models = _f;
Ao.Beta = De;
var l_ = {
  openai: [
    "stop",
    "tool_calls",
    "function_call"
  ],
  anthropic: [
    "end_turn",
    "stop_sequence",
    "tool_use"
  ],
  google: ["STOP"],
  responses: ["completed"]
}, u_ = {
  openai: ["content_filter"],
  anthropic: ["refusal"],
  google: [
    "SAFETY",
    "RECITATION",
    "BLOCKLIST",
    "PROHIBITED_CONTENT",
    "SPII",
    "IMAGE_SAFETY",
    "IMAGE_PROHIBITED_CONTENT",
    "IMAGE_RECITATION"
  ],
  responses: ["content_filter"]
};
function Qe(e, t, n = !1) {
  if (n || u_[e]?.includes(t)) {
    const o = /* @__PURE__ */ new Error("Model response was refused.");
    throw o.code = "AGENT_RESPONSE_REFUSED", o.reason = t, o;
  }
  return {
    finishReason: t,
    completion: l_[e]?.includes(t) ? "complete" : "incomplete",
    truncated: [
      "length",
      "max_tokens",
      "max_output_tokens",
      "MAX_TOKENS"
    ].includes(t)
  };
}
function Ft(e) {
  if (Array.isArray(e)) return e.map((n) => Ft(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, o]) => {
    t[n] = /^(?:authorization|proxy[-_]?authorization|(?:x[-_])?csrf(?:[-_]?token)?|token|access[-_]?token|refresh[-_]?token|id[-_]?token|api[-_]?key|x[-_](?:goog[-_])?api[-_]?key|proxy[-_]?password|password|client[-_]?secret)$/i.test(n) ? o === "" ? "" : "[redacted]" : Ft(o);
  }), t;
}
function St(e = {}, t = {}) {
  const n = t.reasoning && typeof t.reasoning == "object" ? t.reasoning : {}, o = String(e.reasoning?.mode || "inherit"), r = e.reasoning?.output === "show" || e.reasoning?.output === "hide" ? e.reasoning.output : n.output === "show" ? "show" : "hide", i = String(n.mode || t.effectiveMode || o);
  return {
    reasoningRequestedMode: o,
    reasoningRequestedOutput: r,
    reasoningProfileId: String(n.profileId || t.profileId || e.reasoning?.profileId || "unsupported"),
    reasoningEffectiveMode: i,
    reasoningEffort: i === "on" ? String(t.effort ?? n.effort ?? e.reasoning?.effort ?? "") : "",
    reasoningBudgetTokens: i === "on" && Number.isFinite(Number(t.budgetTokens ?? n.budgetTokens ?? e.reasoning?.budgetTokens)) ? Number(t.budgetTokens ?? n.budgetTokens ?? e.reasoning?.budgetTokens) : null,
    reasoningControlFields: Ft(t.controlFields || {}),
    reasoningOutputVisible: i !== "off" && n.output === "show"
  };
}
function co(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: Ft({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    }),
    ...e.effectiveConfig ? { effectiveConfig: e.effectiveConfig } : {}
  };
}
var c_ = Object.freeze({ type: "ephemeral" }), d_ = /* @__PURE__ */ new Set([
  "text",
  "image",
  "tool_use",
  "tool_result"
]), f_ = "[AgentCore][AnthropicUsage]";
function h_(e) {
  e.system ? e.system = [{
    type: "text",
    text: e.system
  }] : delete e.system;
  const t = e.messages.flatMap((n) => n.content).filter((n) => d_.has(n.type) && (n.type !== "text" || n.text.trim())).at(-1);
  for (const n of [
    e.tools?.at(-1),
    e.system?.at(-1),
    t
  ]) n && (n.cache_control = { ...c_ });
}
function p_(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function m_(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function vf(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function g_(e) {
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
      const o = m_(n.image_url.url);
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
function __(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function y_(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && vf(t) || null;
}
function v_(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: vf(e.content) || [] } : void 0;
}
function vl(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function Al(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: p_(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function A_(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const o = e[n];
    if (o.role !== "system") {
      if (o.role === "assistant") {
        const r = y_(o), i = Al(o.tool_calls);
        if (r && i.length) {
          t.push({
            role: "assistant",
            content: r.filter((s) => s?.type !== "tool_use").concat(i)
          });
          continue;
        }
        if (r) {
          t.push({
            role: "assistant",
            content: r
          });
          continue;
        }
      }
      if (o.role === "tool") {
        const r = [vl(o)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, r.push(vl(e[n]));
        t.push({
          role: "user",
          content: r
        });
        continue;
      }
      if (o.role === "assistant" && Array.isArray(o.tool_calls) && o.tool_calls.length) {
        t.push({
          role: "assistant",
          content: [...o.content ? [{
            type: "text",
            text: o.content
          }] : [], ...Al(o.tool_calls)]
        });
        continue;
      }
      t.push({
        role: o.role,
        content: g_(o.content)
      });
    }
  }
  return t;
}
function Jo(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Tl(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function T_(e = "auto", t = []) {
  const n = new Set((Array.isArray(t) ? t : []).map((r) => String(r?.function?.name || "").trim()).filter(Boolean)), o = String(e || "auto").trim() || "auto";
  if (o === "auto") return { type: "auto" };
  if (o === "required") return { type: "any" };
  if (o === "none") return { type: "none" };
  if (!n.has(o)) throw new Error(`Anthropic toolChoice 指定了不存在的工具：${o}`);
  return {
    type: "tool",
    name: o
  };
}
var S_ = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function yi(e = {}, t = {}) {
  const n = Array.isArray(t.tools) ? t.tools : [], o = n.length ? T_(t.toolChoice, n) : void 0, r = t.reasoning?.output, i = {
    ...Ds(t.reasoning),
    ...r === "show" || r === "hide" ? { output: r } : {}
  }, s = qs({
    provider: "anthropic",
    baseUrl: e.baseUrl,
    model: e.model
  }), u = i.mode === "on" && s.profileId === "anthropic-manual" && (o?.type === "any" || o?.type === "tool");
  return {
    toolChoice: o,
    effectiveReasoning: j("anthropic", e, {
      ...i,
      ...u ? { mode: "off" } : {}
    }, { maxTokens: t.maxTokens }),
    reasoningDisabledForForcedTool: u
  };
}
var E_ = class {
  constructor(e) {
    this.config = e, this.auth = Or("anthropic", e.apiKey), this.client = new Ao({
      ...this.auth.sdkOptions,
      baseURL: Tl(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = yi(this.config, e)) {
    const n = t.effectiveReasoning, o = (Array.isArray(e.tools) ? e.tools : []).map((s) => ({
      name: s.function.name,
      description: s.function.description,
      input_schema: s.function.parameters
    })), r = __(e), i = {
      model: this.config.model,
      system: r,
      messages: A_(e.messages),
      ...o.length ? {
        tools: o,
        tool_choice: t.toolChoice
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return Gr(this.config.model) === "claude" && h_(i), !go({
      ...this.config,
      provider: "anthropic"
    }, n) && typeof e.temperature == "number" && (i.temperature = e.temperature), n.mode === "off" ? i.thinking = { type: "disabled" } : n.mode === "on" && n.profileId === "anthropic-adaptive" ? (i.thinking = {
      type: "adaptive",
      display: z(n) ? "summarized" : "omitted"
    }, i.output_config = { effort: n.effort }) : n.mode === "on" && n.profileId === "anthropic-manual" && (i.thinking = {
      type: "enabled",
      budget_tokens: n.budgetTokens,
      display: z(n) ? "summarized" : "omitted"
    }), i;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = Tl(this.config.baseUrl), r = t.protocol || yi(this.config, e), i = t.body || this.buildRequestBody(e, r), s = r.effectiveReasoning;
    return {
      ...co({
        provider: "anthropic",
        model: this.config.model,
        transport: "anthropic-sdk",
        url: `${o}/v1/messages`,
        headers: {
          "Content-Type": "application/json",
          ...this.auth.headers
        },
        body: i,
        sdk: n ? "client.messages.stream" : "client.messages.create",
        effectiveConfig: St(e, {
          reasoning: s,
          effort: i.output_config?.effort,
          budgetTokens: i.thinking?.budget_tokens,
          controlFields: {
            ...i.thinking ? { thinking: i.thinking } : {},
            ...i.output_config ? { output_config: i.output_config } : {}
          }
        })
      }),
      ...r.reasoningDisabledForForcedTool ? { notices: [S_] } : {}
    };
  }
  async chat(e) {
    const t = yi(this.config, e), n = t.effectiveReasoning, o = this.buildRequestBody(e, t), r = this.inspectRequest(e, {
      body: o,
      protocol: t
    });
    let i;
    const s = /* @__PURE__ */ new Map();
    if (typeof e.onStreamProgress == "function") {
      const p = this.client.messages.stream(o, { signal: e.signal }), m = /* @__PURE__ */ new Map();
      let g, _ = "";
      const y = () => z(n) ? Array.from(m.entries()).sort(([C], [b]) => C.localeCompare(b)).map(([C, b]) => ({
        label: C.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: b
      })).filter((C) => C.text) : [], T = () => Array.from(s.entries()).sort(([C], [b]) => Number(C) - Number(b)).map(([, C]) => ({
        id: C.id || "anthropic-tool-draft",
        name: C.name || "工具调用",
        arguments: C.inputJson || "{}",
        draft: !0
      })).filter((C) => C.name), E = () => {
        const C = T();
        C.length && Jo(e, {
          text: _,
          thoughts: y(),
          toolCalls: C,
          toolCallDraft: !0
        });
      };
      p.on("text", (C, b) => {
        _ = b || "", Jo(e, {
          text: _,
          thoughts: y(),
          ...T().length ? {
            toolCalls: T(),
            toolCallDraft: !0
          } : {}
        });
      }), p.on("thinking", (C, b) => {
        m.set("thinking:0", b || ""), Jo(e, {
          thoughts: y(),
          ...T().length ? {
            text: _,
            toolCalls: T(),
            toolCallDraft: !0
          } : {}
        });
      }), p.on("streamEvent", (C, b) => {
        if (g = b, C?.type === "content_block_start" && C.content_block?.type === "tool_use") {
          const k = C.content_block.input && typeof C.content_block.input == "object" ? C.content_block.input : {};
          s.set(C.index, {
            id: C.content_block.id || `anthropic-tool-draft-${C.index + 1}`,
            name: C.content_block.name || "工具调用",
            inputJson: Object.keys(k).length ? JSON.stringify(k) : ""
          }), E();
          return;
        }
        if (C?.type === "content_block_delta" && C.delta?.type === "input_json_delta") {
          const k = s.get(C.index) || {
            id: `anthropic-tool-draft-${C.index + 1}`,
            name: "工具调用",
            inputJson: ""
          };
          s.set(C.index, {
            ...k,
            inputJson: `${k.inputJson || ""}${C.delta.partial_json || ""}`
          }), E();
        }
      }), p.on("contentBlock", (C) => {
        C?.type === "redacted_thinking" && (m.set("redacted:0", C.data || ""), Jo(e, {
          thoughts: y(),
          ...T().length ? {
            text: _,
            toolCalls: T(),
            toolCallDraft: !0
          } : {}
        }));
      });
      try {
        i = await p.finalMessage();
      } catch (C) {
        if (await p.done(), !g) throw C;
        i = g;
      }
    } else i = await this.client.messages.create(o, { signal: e.signal });
    const u = Qe("anthropic", i.stop_reason), c = (i.content || []).filter((p) => p.type === "tool_use" && p.name).map((p, m) => {
      const g = s.get(i.content.indexOf(p))?.inputJson;
      return {
        id: p.id || `anthropic-tool-${m + 1}`,
        name: p.name,
        arguments: u.completion === "incomplete" ? g ?? JSON.stringify(p.input || {}) : g || JSON.stringify(p.input || {})
      };
    }), d = (i.content || []).filter((p) => p.type === "text").map((p) => p.text || "").join(`
`), f = z(n) ? (i.content || []).filter((p) => p.type === "thinking" || p.type === "redacted_thinking").map((p) => ({
      label: p.type === "thinking" ? "思考块" : "已脱敏思考块",
      text: p.type === "thinking" ? p.thinking || "" : p.data || ""
    })).filter((p) => p.text) : [], h = i.usage;
    return console.info(f_, {
      messageId: i.id,
      model: i.model || this.config.model,
      usage: h
    }), {
      text: d,
      toolCalls: c,
      thoughts: f,
      ...u,
      usage: h,
      model: i.model || this.config.model,
      provider: "anthropic",
      providerPayload: v_(i),
      requestInspection: r
    };
  }
}, C_ = /* @__PURE__ */ Fr(((e, t) => {
  function n(o, r) {
    typeof r == "boolean" && (r = { forever: r }), this._originalTimeouts = JSON.parse(JSON.stringify(o)), this._timeouts = o, this._options = r || {}, this._maxRetryTime = r && r.maxRetryTime || 1 / 0, this._fn = null, this._errors = [], this._attempts = 1, this._operationTimeout = null, this._operationTimeoutCb = null, this._timeout = null, this._operationStart = null, this._timer = null, this._options.forever && (this._cachedTimeouts = this._timeouts.slice(0));
  }
  t.exports = n, n.prototype.reset = function() {
    this._attempts = 1, this._timeouts = this._originalTimeouts.slice(0);
  }, n.prototype.stop = function() {
    this._timeout && clearTimeout(this._timeout), this._timer && clearTimeout(this._timer), this._timeouts = [], this._cachedTimeouts = null;
  }, n.prototype.retry = function(o) {
    if (this._timeout && clearTimeout(this._timeout), !o) return !1;
    var r = (/* @__PURE__ */ new Date()).getTime();
    if (o && r - this._operationStart >= this._maxRetryTime)
      return this._errors.push(o), this._errors.unshift(/* @__PURE__ */ new Error("RetryOperation timeout occurred")), !1;
    this._errors.push(o);
    var i = this._timeouts.shift();
    if (i === void 0) if (this._cachedTimeouts)
      this._errors.splice(0, this._errors.length - 1), i = this._cachedTimeouts.slice(-1);
    else return !1;
    var s = this;
    return this._timer = setTimeout(function() {
      s._attempts++, s._operationTimeoutCb && (s._timeout = setTimeout(function() {
        s._operationTimeoutCb(s._attempts);
      }, s._operationTimeout), s._options.unref && s._timeout.unref()), s._fn(s._attempts);
    }, i), this._options.unref && this._timer.unref(), !0;
  }, n.prototype.attempt = function(o, r) {
    this._fn = o, r && (r.timeout && (this._operationTimeout = r.timeout), r.cb && (this._operationTimeoutCb = r.cb));
    var i = this;
    this._operationTimeoutCb && (this._timeout = setTimeout(function() {
      i._operationTimeoutCb();
    }, i._operationTimeout)), this._operationStart = (/* @__PURE__ */ new Date()).getTime(), this._fn(this._attempts);
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
    for (var o = {}, r = null, i = 0, s = 0; s < this._errors.length; s++) {
      var u = this._errors[s], c = u.message, d = (o[c] || 0) + 1;
      o[c] = d, d >= i && (r = u, i = d);
    }
    return r;
  };
})), w_ = /* @__PURE__ */ Fr(((e) => {
  var t = C_();
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
    for (var r in n) o[r] = n[r];
    if (o.minTimeout > o.maxTimeout) throw new Error("minTimeout is greater than maxTimeout");
    for (var i = [], s = 0; s < o.retries; s++) i.push(this.createTimeout(s, o));
    return n && n.forever && !i.length && i.push(this.createTimeout(s, o)), i.sort(function(u, c) {
      return u - c;
    }), i;
  }, e.createTimeout = function(n, o) {
    var r = o.randomize ? Math.random() + 1 : 1, i = Math.round(r * Math.max(o.minTimeout, 1) * Math.pow(o.factor, n));
    return i = Math.min(i, o.maxTimeout), i;
  }, e.wrap = function(n, o, r) {
    if (o instanceof Array && (r = o, o = null), !r) {
      r = [];
      for (var i in n) typeof n[i] == "function" && r.push(i);
    }
    for (var s = 0; s < r.length; s++) {
      var u = r[s], c = n[u];
      n[u] = function(f) {
        var h = e.operation(o), p = Array.prototype.slice.call(arguments, 1), m = p.pop();
        p.push(function(g) {
          h.retry(g) || (g && (arguments[0] = h.mainError()), m.apply(this, arguments));
        }), h.attempt(function() {
          f.apply(n, p);
        });
      }.bind(n, c), n[u].options = o;
    }
  };
})), I_ = /* @__PURE__ */ Fr(((e, t) => {
  t.exports = w_();
})), b_ = /* @__PURE__ */ Fr(((e, t) => {
  var n = I_(), o = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], r = class extends Error {
    constructor(c) {
      super(), c instanceof Error ? (this.originalError = c, { message: c } = c) : (this.originalError = new Error(c), this.originalError.stack = this.stack), this.name = "AbortError", this.message = c;
    }
  }, i = (c, d, f) => {
    const h = f.retries - (d - 1);
    return c.attemptNumber = d, c.retriesLeft = h, c;
  }, s = (c) => o.includes(c), u = (c, d) => new Promise((f, h) => {
    d = {
      onFailedAttempt: () => {
      },
      retries: 10,
      ...d
    };
    const p = n.operation(d);
    p.attempt(async (m) => {
      try {
        f(await c(m));
      } catch (g) {
        if (!(g instanceof Error)) {
          h(/* @__PURE__ */ new TypeError(`Non-error was thrown: "${g}". You should only throw errors.`));
          return;
        }
        if (g instanceof r)
          p.stop(), h(g.originalError);
        else if (g instanceof TypeError && !s(g.message))
          p.stop(), h(g);
        else {
          i(g, m, d);
          try {
            await d.onFailedAttempt(g);
          } catch (_) {
            h(_);
            return;
          }
          p.retry(g) || h(p.mainError());
        }
      }
    });
  });
  t.exports = u, t.exports.default = u, t.exports.AbortError = r;
})), Sl = /* @__PURE__ */ Vm(b_(), 1), R_ = void 0, P_ = void 0;
function M_() {
  return {
    geminiUrl: R_,
    vertexUrl: P_
  };
}
function N_(e, t, n, o) {
  var r, i;
  if (!e?.baseUrl) {
    const s = M_();
    return t ? (r = s.vertexUrl) !== null && r !== void 0 ? r : n : (i = s.geminiUrl) !== null && i !== void 0 ? i : o;
  }
  return e.baseUrl;
}
var ut = class {
};
function N(e, t) {
  return e.replace(/\{([^}]+)\}/g, (n, o) => {
    if (Object.prototype.hasOwnProperty.call(t, o)) {
      const r = t[o];
      return r != null ? String(r) : "";
    } else throw new Error(`Key '${o}' not found in valueMap.`);
  });
}
function l(e, t, n) {
  for (let i = 0; i < t.length - 1; i++) {
    const s = t[i];
    if (s.endsWith("[]")) {
      const u = s.slice(0, -2);
      if (!(u in e)) if (Array.isArray(n)) e[u] = Array.from({ length: n.length }, () => ({}));
      else throw new Error(`Value must be a list given an array path ${s}`);
      if (Array.isArray(e[u])) {
        const c = e[u];
        if (Array.isArray(n)) for (let d = 0; d < c.length; d++) {
          const f = c[d];
          l(f, t.slice(i + 1), n[d]);
        }
        else for (const d of c) l(d, t.slice(i + 1), n);
      }
      return;
    } else if (s.endsWith("[0]")) {
      const u = s.slice(0, -3);
      u in e || (e[u] = [{}]);
      const c = e[u];
      l(c[0], t.slice(i + 1), n);
      return;
    }
    (!e[s] || typeof e[s] != "object") && (e[s] = {}), e = e[s];
  }
  const o = t[t.length - 1], r = e[o];
  if (r !== void 0) {
    if (!n || typeof n == "object" && Object.keys(n).length === 0 || n === r) return;
    if (typeof r == "object" && typeof n == "object" && r !== null && n !== null) Object.assign(r, n);
    else throw new Error(`Cannot set value for an existing key. Key: ${o}`);
  } else o === "_self" && typeof n == "object" && n !== null && !Array.isArray(n) ? Object.assign(e, n) : e[o] = n;
}
function a(e, t, n = void 0) {
  try {
    if (t.length === 1 && t[0] === "_self") return e;
    for (let o = 0; o < t.length; o++) {
      if (typeof e != "object" || e === null) return n;
      const r = t[o];
      if (r.endsWith("[]")) {
        const i = r.slice(0, -2);
        if (i in e) {
          const s = e[i];
          return Array.isArray(s) ? s.map((u) => a(u, t.slice(o + 1), n)) : n;
        } else return n;
      } else e = e[r];
    }
    return e;
  } catch (o) {
    if (o instanceof TypeError) return n;
    throw o;
  }
}
function x_(e, t) {
  for (const [n, o] of Object.entries(t)) {
    const r = n.split("."), i = o.split("."), s = /* @__PURE__ */ new Set();
    let u = -1;
    for (let c = 0; c < r.length; c++) if (r[c] === "*") {
      u = c;
      break;
    }
    if (u !== -1 && i.length > u) for (let c = u; c < i.length; c++) {
      const d = i[c];
      d !== "*" && !d.endsWith("[]") && !d.endsWith("[0]") && s.add(d);
    }
    Ki(e, r, i, 0, s);
  }
}
function Ki(e, t, n, o, r) {
  if (o >= t.length || typeof e != "object" || e === null) return;
  const i = t[o];
  if (i.endsWith("[]")) {
    const s = i.slice(0, -2), u = e;
    if (s in u && Array.isArray(u[s])) for (const c of u[s]) Ki(c, t, n, o + 1, r);
  } else if (i === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const s = e, u = Object.keys(s).filter((d) => !d.startsWith("_") && !r.has(d)), c = {};
      for (const d of u) c[d] = s[d];
      for (const [d, f] of Object.entries(c)) {
        const h = [];
        for (const p of n.slice(o)) p === "*" ? h.push(d) : h.push(p);
        l(s, h, f);
      }
      for (const d of u) delete s[d];
    }
  } else {
    const s = e;
    i in s && Ki(s[i], t, n, o + 1, r);
  }
}
function Qs(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function k_(e) {
  const t = {}, n = a(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const o = a(e, ["resourceName"]);
  return o != null && l(t, ["_url", "resourceName"], o), t;
}
function D_(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response", "generateVideoResponse"]);
  return s != null && l(t, ["response"], L_(s)), t;
}
function $_(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], U_(s)), t;
}
function L_(e) {
  const t = {}, n = a(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => F_(s))), l(t, ["generatedVideos"], i);
  }
  const o = a(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const r = a(e, ["raiMediaFilteredReasons"]);
  return r != null && l(t, ["raiMediaFilteredReasons"], r), t;
}
function U_(e) {
  const t = {}, n = a(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => O_(s))), l(t, ["generatedVideos"], i);
  }
  const o = a(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const r = a(e, ["raiMediaFilteredReasons"]);
  return r != null && l(t, ["raiMediaFilteredReasons"], r), t;
}
function F_(e) {
  const t = {}, n = a(e, ["video"]);
  return n != null && l(t, ["video"], J_(n)), t;
}
function O_(e) {
  const t = {}, n = a(e, ["_self"]);
  return n != null && l(t, ["video"], K_(n)), t;
}
function G_(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function B_(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function q_(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], H_(s)), t;
}
function H_(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = a(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function Af(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], V_(s)), t;
}
function V_(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = a(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function J_(e) {
  const t = {}, n = a(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const o = a(e, ["encodedVideo"]);
  o != null && l(t, ["videoBytes"], Qs(o));
  const r = a(e, ["encoding"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function K_(e) {
  const t = {}, n = a(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const o = a(e, ["bytesBase64Encoded"]);
  o != null && l(t, ["videoBytes"], Qs(o));
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
var El;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(El || (El = {}));
var Cl;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(Cl || (Cl = {}));
var wl;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(wl || (wl = {}));
var vt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(vt || (vt = {}));
var Il;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(Il || (Il = {}));
var bl;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(bl || (bl = {}));
var Rl;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(Rl || (Rl = {}));
var Pl;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(Pl || (Pl = {}));
var Ml;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(Ml || (Ml = {}));
var Nl;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(Nl || (Nl = {}));
var xl;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(xl || (xl = {}));
var jt;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(jt || (jt = {}));
var en;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(en || (en = {}));
var kl;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(kl || (kl = {}));
var Dl;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Dl || (Dl = {}));
var $l;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})($l || ($l = {}));
var Ll;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Ll || (Ll = {}));
var Ul;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Fl || (Fl = {}));
var Ol;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Ol || (Ol = {}));
var Gl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Gl || (Gl = {}));
var Bl;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Bl || (Bl = {}));
var ql;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(ql || (ql = {}));
var Hl;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Hl || (Hl = {}));
var Tr;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(Tr || (Tr = {}));
var Vl;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Vl || (Vl = {}));
var Jl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(Jl || (Jl = {}));
var Kl;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Kl || (Kl = {}));
var Wl;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(Wl || (Wl = {}));
var Wi;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(Wi || (Wi = {}));
var zl;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(zl || (zl = {}));
var Yl;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(Xl || (Xl = {}));
var Ql;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Ql || (Ql = {}));
var Zl;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Zl || (Zl = {}));
var jl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(jl || (jl = {}));
var eu;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(eu || (eu = {}));
var zi;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(zi || (zi = {}));
var tu;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(tu || (tu = {}));
var nu;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(nu || (nu = {}));
var Sr;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(Sr || (Sr = {}));
var ou;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(ou || (ou = {}));
var ru;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(ru || (ru = {}));
var iu;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(iu || (iu = {}));
var su;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(su || (su = {}));
var au;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(au || (au = {}));
var lu;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(lu || (lu = {}));
var uu;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(uu || (uu = {}));
var cu;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(cu || (cu = {}));
var du;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(du || (du = {}));
var fu;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(fu || (fu = {}));
var hu;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(hu || (hu = {}));
var pu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(pu || (pu = {}));
var mu;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(mu || (mu = {}));
var gu;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(gu || (gu = {}));
var _u;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(_u || (_u = {}));
var yu;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(yu || (yu = {}));
var vu;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(vu || (vu = {}));
var Au;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(Au || (Au = {}));
var Tu;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(Tu || (Tu = {}));
var Su;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(Su || (Su = {}));
var Eu;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(Eu || (Eu = {}));
var Cu;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(Cu || (Cu = {}));
var wu;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(wu || (wu = {}));
var tn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(tn || (tn = {}));
var Yi = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, $n = class {
  get text() {
    var e, t, n, o, r, i, s, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let c = "", d = !1;
    const f = [];
    for (const h of (u = (s = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) !== null && u !== void 0 ? u : []) {
      for (const [p, m] of Object.entries(h)) p !== "text" && p !== "thought" && p !== "thoughtSignature" && (m !== null || m !== void 0) && f.push(p);
      if (typeof h.text == "string") {
        if (typeof h.thought == "boolean" && h.thought) continue;
        d = !0, c += h.text;
      }
    }
    return f.length > 0 && console.warn(`there are non-text parts ${f} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, o, r, i, s, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const f of (u = (s = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) !== null && u !== void 0 ? u : []) {
      for (const [h, p] of Object.entries(f)) h !== "inlineData" && (p !== null || p !== void 0) && d.push(h);
      f.inlineData && typeof f.inlineData.data == "string" && (c += atob(f.inlineData.data));
    }
    return d.length > 0 && console.warn(`there are non-data parts ${d} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), c.length > 0 ? btoa(c) : void 0;
  }
  get functionCalls() {
    var e, t, n, o, r, i, s, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    const c = (u = (s = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) === null || u === void 0 ? void 0 : u.filter((d) => d.functionCall).map((d) => d.functionCall).filter((d) => d !== void 0);
    if (c?.length !== 0)
      return c;
  }
  get executableCode() {
    var e, t, n, o, r, i, s, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    const d = (u = (s = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) === null || u === void 0 ? void 0 : u.filter((f) => f.executableCode).map((f) => f.executableCode).filter((f) => f !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, o, r, i, s, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (s = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) === null || u === void 0 ? void 0 : u.filter((f) => f.codeExecutionResult).map((f) => f.codeExecutionResult).filter((f) => f !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, Iu = class {
}, bu = class {
}, W_ = class {
}, z_ = class {
}, Y_ = class {
}, X_ = class {
}, Ru = class {
}, Pu = class {
}, Mu = class {
}, Q_ = class {
}, Nu = class Tf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Tf();
    let r;
    const i = t;
    return n ? r = $_(i) : r = D_(i), Object.assign(o, r), o;
  }
}, xu = class {
}, ku = class {
}, Du = class {
}, $u = class {
}, Z_ = class {
}, j_ = class {
}, ey = class {
}, ty = class Sf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Sf(), r = q_(t);
    return Object.assign(o, r), o;
  }
}, ny = class {
}, oy = class {
}, ry = class {
}, iy = class {
}, Lu = class {
}, sy = class {
  get text() {
    var e, t, n;
    let o = "", r = !1;
    const i = [];
    for (const s of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [u, c] of Object.entries(s)) u !== "text" && u !== "thought" && c !== null && i.push(u);
      if (typeof s.text == "string") {
        if (typeof s.thought == "boolean" && s.thought) continue;
        r = !0, o += s.text;
      }
    }
    return i.length > 0 && console.warn(`there are non-text parts ${i} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), r ? o : void 0;
  }
  get data() {
    var e, t, n;
    let o = "";
    const r = [];
    for (const i of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [s, u] of Object.entries(i)) s !== "inlineData" && u !== null && r.push(s);
      i.inlineData && typeof i.inlineData.data == "string" && (o += atob(i.inlineData.data));
    }
    return r.length > 0 && console.warn(`there are non-data parts ${r} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), o.length > 0 ? btoa(o) : void 0;
  }
}, ay = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, ly = class Ef {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Ef(), r = Af(t);
    return Object.assign(o, r), o;
  }
};
function K(e, t) {
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
function Cf(e, t) {
  const n = K(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function wf(e) {
  return Array.isArray(e) ? e.map((t) => Er(t)) : [Er(e)];
}
function Er(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function If(e) {
  const t = Er(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function bf(e) {
  const t = Er(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Uu(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function Rf(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Uu(t)) : [Uu(e)];
}
function Xi(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Fu(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Ou(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function se(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return Xi(e) ? e : {
    role: "user",
    parts: Rf(e)
  };
}
function Zs(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const o = se(n);
    return o.parts && o.parts.length > 0 && o.parts[0].text !== void 0 ? [o.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = se(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => se(n)) : [se(t)];
}
function ve(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Fu(e) || Ou(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [se(e)];
  }
  const t = [], n = [], o = Xi(e[0]);
  for (const r of e) {
    const i = Xi(r);
    if (i != o) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(r);
    else {
      if (Fu(r) || Ou(r)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(r);
    }
  }
  return o || t.push({
    role: "user",
    parts: Rf(n)
  }), t;
}
function uy(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((o) => o !== "null");
  if (n.length === 1) t.type = Object.values(vt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : vt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const o of n) t.anyOf.push({ type: Object.values(vt).includes(o.toUpperCase()) ? o.toUpperCase() : vt.TYPE_UNSPECIFIED });
  }
}
function un(e) {
  const t = {}, n = ["items"], o = ["anyOf"], r = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && uy(e.type, t);
  for (const [s, u] of Object.entries(e))
    if (u != null)
      if (s == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(vt).includes(u.toUpperCase()) ? u.toUpperCase() : vt.TYPE_UNSPECIFIED;
      } else if (n.includes(s)) t[s] = un(u);
      else if (o.includes(s)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(un(d));
        }
        t[s] = c;
      } else if (r.includes(s)) {
        const c = {};
        for (const [d, f] of Object.entries(u)) c[d] = un(f);
        t[s] = c;
      } else {
        if (s === "additionalProperties") continue;
        t[s] = u;
      }
  return t;
}
function js(e) {
  return un(e);
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
function pn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = un(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = un(t.response));
  return e;
}
function mn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function cy(e, t, n, o = 1) {
  const r = !t.startsWith(`${n}/`) && t.split("/").length === o;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : r ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : r ? `${n}/${t}` : t;
}
function ct(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return cy(e, t, "cachedContents");
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
function Ct(e) {
  return Qs(e);
}
function dy(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function fy(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function hy(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function Mf(e) {
  var t;
  let n;
  if (dy(e) && (n = e.name), !(hy(e) && (n = e.uri, n === void 0)) && !(fy(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const o = n.split("files/")[1].match(/[a-z0-9]+/);
      if (o === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = o[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function Nf(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function xf(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (py(e, t)) return e[t];
  return [];
}
function py(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function my(e, t = {}) {
  const n = e, o = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (o.responseJsonSchema = n.outputSchema), t.behavior && (o.behavior = t.behavior), { functionDeclarations: [o] };
}
function gy(e, t = {}) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = r.name;
    if (o.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    o.add(i);
    const s = my(r, t);
    s.functionDeclarations && n.push(...s.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function kf(e, t) {
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
  const o = [n.gcsUri, n.bigqueryUri].filter(Boolean).length, r = [n.inlinedRequests, n.fileName].filter(Boolean).length;
  if (e.isVertexAI()) {
    if (r > 0 || o !== 1) throw new Error("Exactly one of `gcsUri` or `bigqueryUri` must be set for Vertex AI.");
  } else if (o > 0 || r !== 1) throw new Error("Exactly one of `inlinedRequests`, `fileName`, must be set for Gemini API.");
  return n;
}
function _y(e) {
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
function Df(e) {
  if (typeof e != "object" || e === null) return {};
  const t = e, n = t.inlinedResponses;
  if (typeof n != "object" || n === null) return e;
  const o = n.inlinedResponses;
  if (!Array.isArray(o) || o.length === 0) return e;
  let r = !1;
  for (const i of o) {
    if (typeof i != "object" || i === null) continue;
    const s = i.response;
    if (!(typeof s != "object" || s === null) && s.embedding !== void 0) {
      r = !0;
      break;
    }
  }
  return r && (t.inlinedEmbedContentResponses = t.inlinedResponses, delete t.inlinedResponses), e;
}
function gn(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function $f(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function yy(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function vy(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Ay(e) {
  const t = {}, n = a(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const o = a(e, ["inlinedResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => ev(s))), l(t, ["inlinedResponses"], i);
  }
  const r = a(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function Ty(e) {
  const t = {}, n = a(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const o = a(e, ["gcsDestination", "outputUriPrefix"]);
  o != null && l(t, ["gcsUri"], o);
  const r = a(e, ["bigqueryDestination", "outputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function Sy(e) {
  const t = {}, n = a(e, ["format"]);
  n != null && l(t, ["predictionsFormat"], n);
  const o = a(e, ["gcsUri"]);
  o != null && l(t, ["gcsDestination", "outputUriPrefix"], o);
  const r = a(e, ["bigqueryUri"]);
  if (r != null && l(t, ["bigqueryDestination", "outputUri"], r), a(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedResponses"]) !== void 0) throw new Error("inlinedResponses parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedEmbedContentResponses"]) !== void 0) throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");
  return t;
}
function sr(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata", "displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = a(e, ["metadata", "state"]);
  r != null && l(t, ["state"], $f(r));
  const i = a(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const s = a(e, ["metadata", "endTime"]);
  s != null && l(t, ["endTime"], s);
  const u = a(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = a(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = a(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], Ay(Df(d))), t;
}
function Qi(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = a(e, ["state"]);
  r != null && l(t, ["state"], $f(r));
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["createTime"]);
  s != null && l(t, ["createTime"], s);
  const u = a(e, ["startTime"]);
  u != null && l(t, ["startTime"], u);
  const c = a(e, ["endTime"]);
  c != null && l(t, ["endTime"], c);
  const d = a(e, ["updateTime"]);
  d != null && l(t, ["updateTime"], d);
  const f = a(e, ["model"]);
  f != null && l(t, ["model"], f);
  const h = a(e, ["inputConfig"]);
  h != null && l(t, ["src"], Ey(h));
  const p = a(e, ["outputConfig"]);
  p != null && l(t, ["dest"], Ty(Df(p)));
  const m = a(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function Ey(e) {
  const t = {}, n = a(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const o = a(e, ["gcsSource", "uris"]);
  o != null && l(t, ["gcsUri"], o);
  const r = a(e, ["bigquerySource", "inputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function Cy(e, t) {
  const n = {};
  if (a(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (a(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (a(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = a(t, ["fileName"]);
  o != null && l(n, ["fileName"], o);
  const r = a(t, ["inlinedRequests"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => jy(e, s))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function wy(e) {
  const t = {}, n = a(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const o = a(e, ["gcsUri"]);
  o != null && l(t, ["gcsSource", "uris"], o);
  const r = a(e, ["bigqueryUri"]);
  if (r != null && l(t, ["bigquerySource", "inputUri"], r), a(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function Iy(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function by(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], gn(e, o)), n;
}
function Ry(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], gn(e, o)), n;
}
function Py(e) {
  const t = {}, n = a(e, ["content"]);
  n != null && l(t, ["content"], n);
  const o = a(e, ["citationMetadata"]);
  o != null && l(t, ["citationMetadata"], My(o));
  const r = a(e, ["tokenCount"]);
  r != null && l(t, ["tokenCount"], r);
  const i = a(e, ["finishReason"]);
  i != null && l(t, ["finishReason"], i);
  const s = a(e, ["groundingMetadata"]);
  s != null && l(t, ["groundingMetadata"], s);
  const u = a(e, ["avgLogprobs"]);
  u != null && l(t, ["avgLogprobs"], u);
  const c = a(e, ["index"]);
  c != null && l(t, ["index"], c);
  const d = a(e, ["logprobsResult"]);
  d != null && l(t, ["logprobsResult"], d);
  const f = a(e, ["safetyRatings"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(t, ["safetyRatings"], p);
  }
  const h = a(e, ["urlContextMetadata"]);
  return h != null && l(t, ["urlContextMetadata"], h), t;
}
function My(e) {
  const t = {}, n = a(e, ["citationSources"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["citations"], o);
  }
  return t;
}
function Lf(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => av(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Ny(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  if (t !== void 0 && o != null && l(t, ["batch", "displayName"], o), a(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const r = a(e, ["webhookConfig"]);
  return t !== void 0 && r != null && l(t, ["batch", "webhookConfig"], r), n;
}
function xy(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const r = a(e, ["dest"]);
  if (t !== void 0 && r != null && l(t, ["outputConfig"], Sy(_y(r))), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Gu(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["_url", "model"], K(e, o));
  const r = a(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], Cy(e, kf(e, r)));
  const i = a(t, ["config"]);
  return i != null && Ny(i, n), n;
}
function ky(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["model"], K(e, o));
  const r = a(t, ["src"]);
  r != null && l(n, ["inputConfig"], wy(kf(e, r)));
  const i = a(t, ["config"]);
  return i != null && xy(i, n), n;
}
function Dy(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["batch", "displayName"], o), n;
}
function $y(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["_url", "model"], K(e, o));
  const r = a(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], qy(e, r));
  const i = a(t, ["config"]);
  return i != null && Dy(i, n), n;
}
function Ly(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], gn(e, o)), n;
}
function Uy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], gn(e, o)), n;
}
function Fy(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function Oy(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function Gy(e, t) {
  const n = {}, o = a(t, ["contents"]);
  if (o != null) {
    let i = Zs(e, o);
    Array.isArray(i) && (i = i.map((s) => s)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const r = a(t, ["config"]);
  return r != null && (l(n, ["_self"], By(r, n)), x_(n, { "requests[].*": "requests[].request.*" })), n;
}
function By(e, t) {
  const n = {}, o = a(e, ["taskType"]);
  t !== void 0 && o != null && l(t, ["requests[]", "taskType"], o);
  const r = a(e, ["title"]);
  t !== void 0 && r != null && l(t, ["requests[]", "title"], r);
  const i = a(e, ["outputDimensionality"]);
  if (t !== void 0 && i != null && l(t, ["requests[]", "outputDimensionality"], i), a(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (a(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (a(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (a(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return n;
}
function qy(e, t) {
  const n = {}, o = a(t, ["fileName"]);
  o != null && l(n, ["file_name"], o);
  const r = a(t, ["inlinedRequests"]);
  return r != null && l(n, ["requests"], Gy(e, r)), n;
}
function Hy(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Vy(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Jy(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = a(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Ky(e, t, n) {
  const o = {}, r = a(t, ["systemInstruction"]);
  n !== void 0 && r != null && l(n, ["systemInstruction"], Lf(se(r)));
  const i = a(t, ["temperature"]);
  i != null && l(o, ["temperature"], i);
  const s = a(t, ["topP"]);
  s != null && l(o, ["topP"], s);
  const u = a(t, ["topK"]);
  u != null && l(o, ["topK"], u);
  const c = a(t, ["candidateCount"]);
  c != null && l(o, ["candidateCount"], c);
  const d = a(t, ["maxOutputTokens"]);
  d != null && l(o, ["maxOutputTokens"], d);
  const f = a(t, ["stopSequences"]);
  f != null && l(o, ["stopSequences"], f);
  const h = a(t, ["responseLogprobs"]);
  h != null && l(o, ["responseLogprobs"], h);
  const p = a(t, ["logprobs"]);
  p != null && l(o, ["logprobs"], p);
  const m = a(t, ["presencePenalty"]);
  m != null && l(o, ["presencePenalty"], m);
  const g = a(t, ["frequencyPenalty"]);
  g != null && l(o, ["frequencyPenalty"], g);
  const _ = a(t, ["seed"]);
  _ != null && l(o, ["seed"], _);
  const y = a(t, ["responseMimeType"]);
  y != null && l(o, ["responseMimeType"], y);
  const T = a(t, ["responseSchema"]);
  T != null && l(o, ["responseSchema"], js(T));
  const E = a(t, ["responseJsonSchema"]);
  if (E != null && l(o, ["responseJsonSchema"], E), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const C = a(t, ["safetySettings"]);
  if (n !== void 0 && C != null) {
    let V = C;
    Array.isArray(V) && (V = V.map((W) => lv(W))), l(n, ["safetySettings"], V);
  }
  const b = a(t, ["tools"]);
  if (n !== void 0 && b != null) {
    let V = mn(b);
    Array.isArray(V) && (V = V.map((W) => cv(pn(W)))), l(n, ["tools"], V);
  }
  const k = a(t, ["toolConfig"]);
  if (n !== void 0 && k != null && l(n, ["toolConfig"], uv(k)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const w = a(t, ["cachedContent"]);
  n !== void 0 && w != null && l(n, ["cachedContent"], ct(e, w));
  const D = a(t, ["responseModalities"]);
  D != null && l(o, ["responseModalities"], D);
  const I = a(t, ["mediaResolution"]);
  I != null && l(o, ["mediaResolution"], I);
  const x = a(t, ["speechConfig"]);
  if (x != null && l(o, ["speechConfig"], ea(x)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const R = a(t, ["thinkingConfig"]);
  R != null && l(o, ["thinkingConfig"], R);
  const F = a(t, ["imageConfig"]);
  F != null && l(o, ["imageConfig"], Zy(F));
  const X = a(t, ["enableEnhancedCivicAnswers"]);
  if (X != null && l(o, ["enableEnhancedCivicAnswers"], X), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const J = a(t, ["serviceTier"]);
  return n !== void 0 && J != null && l(n, ["serviceTier"], J), o;
}
function Wy(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((f) => Py(f))), l(t, ["candidates"], d);
  }
  const r = a(e, ["modelVersion"]);
  r != null && l(t, ["modelVersion"], r);
  const i = a(e, ["promptFeedback"]);
  i != null && l(t, ["promptFeedback"], i);
  const s = a(e, ["responseId"]);
  s != null && l(t, ["responseId"], s);
  const u = a(e, ["usageMetadata"]);
  u != null && l(t, ["usageMetadata"], u);
  const c = a(e, ["modelStatus"]);
  return c != null && l(t, ["modelStatus"], c), t;
}
function zy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], gn(e, o)), n;
}
function Yy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], gn(e, o)), n;
}
function Xy(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], vy(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Qy(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Zy(e) {
  const t = {}, n = a(e, ["aspectRatio"]);
  n != null && l(t, ["aspectRatio"], n);
  const o = a(e, ["imageSize"]);
  if (o != null && l(t, ["imageSize"], o), a(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (a(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (a(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (a(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (a(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return t;
}
function jy(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["request", "model"], K(e, o));
  const r = a(t, ["contents"]);
  if (r != null) {
    let u = ve(r);
    Array.isArray(u) && (u = u.map((c) => Lf(c))), l(n, ["request", "contents"], u);
  }
  const i = a(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const s = a(t, ["config"]);
  return s != null && l(n, ["request", "generationConfig"], Ky(e, s, a(n, ["request"], {}))), n;
}
function ev(e) {
  const t = {}, n = a(e, ["response"]);
  n != null && l(t, ["response"], Wy(n));
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["error"]);
  return r != null && l(t, ["error"], r), t;
}
function tv(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  if (t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), a(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function nv(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  t !== void 0 && r != null && l(t, ["_query", "pageToken"], r);
  const i = a(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function ov(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && tv(n, t), t;
}
function rv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && nv(n, t), t;
}
function iv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = a(e, ["operations"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => sr(s))), l(t, ["batchJobs"], i);
  }
  return t;
}
function sv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = a(e, ["batchPredictionJobs"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => Qi(s))), l(t, ["batchJobs"], i);
  }
  return t;
}
function av(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], Hy(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], Vy(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Iy(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const f = a(e, ["thought"]);
  f != null && l(t, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(t, ["thoughtSignature"], h);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = a(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function lv(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = a(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function uv(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = a(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], Jy(o));
  const r = a(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function cv(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], Qy(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Xy(i));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let h = u;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["functionDeclarations"], h);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const f = a(e, ["mcpServers"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["mcpServers"], h);
  }
  return t;
}
var lt;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(lt || (lt = {}));
var Gt = class {
  constructor(e, t, n, o) {
    this.pageInternal = [], this.paramsInternal = {}, this.requestInternal = t, this.init(e, n, o);
  }
  init(e, t, n) {
    var o, r;
    this.nameInternal = e, this.pageInternal = t[this.nameInternal] || [], this.sdkHttpResponseInternal = t?.sdkHttpResponse, this.idxInternal = 0;
    let i = { config: {} };
    !n || Object.keys(n).length === 0 ? i = { config: {} } : typeof n == "object" ? i = Object.assign({}, n) : i = n, i.config && (i.config.pageToken = t.nextPageToken), this.paramsInternal = i, this.pageInternalSize = (r = (o = i.config) === null || o === void 0 ? void 0 : o.pageSize) !== null && r !== void 0 ? r : this.pageInternal.length;
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
}, dv = class extends ut {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Gt(lt.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Gu(this.apiClient, e), n = t._url, o = N("{model}:batchGenerateContent", n), r = t.batch.inputConfig.requests, i = r.requests, s = [];
    for (const u of i) {
      const c = Object.assign({}, u);
      if (c.systemInstruction) {
        const d = c.systemInstruction;
        delete c.systemInstruction;
        const f = c.request;
        f.systemInstruction = d, c.request = f;
      }
      s.push(c);
    }
    return r.requests = s, delete t.config, delete t._url, delete t._query, {
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
      const r = this.getGcsUri(e), i = this.getBigqueryUri(e);
      if (r) r.endsWith(".jsonl") ? n.dest = `${r.slice(0, -6)}/dest` : n.dest = `${r}_dest_${o}`;
      else if (i) n.dest = `${i}_dest_${o}`;
      else throw new Error("Unsupported source for Vertex AI: No GCS or BigQuery URI found.");
    }
    return n;
  }
  async createInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ky(this.apiClient, e);
      return s = N("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Qi(d));
    } else {
      const c = Gu(this.apiClient, e);
      return s = N("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => sr(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = $y(this.apiClient, e);
      return r = N("{model}:asyncBatchEmbedContent", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => sr(u));
    }
  }
  async get(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Yy(this.apiClient, e);
      return s = N("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Qi(d));
    } else {
      const c = zy(this.apiClient, e);
      return s = N("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => sr(d));
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const u = Ry(this.apiClient, e);
      i = N("batchPredictionJobs/{name}:cancel", u._url), s = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = by(this.apiClient, e);
      i = N("batches/{name}:cancel", u._url), s = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = rv(e);
      return s = N("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = sv(d), h = new Lu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = ov(e);
      return s = N("batches", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = iv(d), h = new Lu();
        return Object.assign(h, f), h;
      });
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Uy(this.apiClient, e);
      return s = N("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => Oy(d));
    } else {
      const c = Ly(this.apiClient, e);
      return s = N("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => Fy(d));
    }
  }
};
function fv(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function hv(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Bu(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Lv(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function qu(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Uv(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function pv(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  t !== void 0 && r != null && l(t, ["expireTime"], r);
  const i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let f = ve(s);
    Array.isArray(f) && (f = f.map((h) => Bu(h))), l(t, ["contents"], f);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Bu(se(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((h) => Gv(h))), l(t, ["tools"], f);
  }
  const d = a(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], Fv(d)), a(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function mv(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  t !== void 0 && r != null && l(t, ["expireTime"], r);
  const i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let h = ve(s);
    Array.isArray(h) && (h = h.map((p) => qu(p))), l(t, ["contents"], h);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], qu(se(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((p) => Bv(p))), l(t, ["tools"], h);
  }
  const d = a(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], Ov(d));
  const f = a(e, ["kmsKeyName"]);
  return t !== void 0 && f != null && l(t, ["encryption_spec", "kmsKeyName"], f), n;
}
function gv(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["model"], Cf(e, o));
  const r = a(t, ["config"]);
  return r != null && pv(r, n), n;
}
function _v(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["model"], Cf(e, o));
  const r = a(t, ["config"]);
  return r != null && mv(r, n), n;
}
function yv(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ct(e, o)), n;
}
function vv(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ct(e, o)), n;
}
function Av(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Tv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Sv(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Ev(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Cv(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = a(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function wv(e) {
  const t = {}, n = a(e, ["description"]);
  n != null && l(t, ["description"], n);
  const o = a(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = a(e, ["parameters"]);
  r != null && l(t, ["parameters"], r);
  const i = a(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const s = a(e, ["response"]);
  s != null && l(t, ["response"], s);
  const u = a(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), a(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function Iv(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ct(e, o)), n;
}
function bv(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ct(e, o)), n;
}
function Rv(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], fv(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Pv(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Mv(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function Nv(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function xv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && Mv(n, t), t;
}
function kv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && Nv(n, t), t;
}
function Dv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = a(e, ["cachedContents"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["cachedContents"], i);
  }
  return t;
}
function $v(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = a(e, ["cachedContents"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["cachedContents"], i);
  }
  return t;
}
function Lv(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], Sv(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], Ev(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], hv(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const f = a(e, ["thought"]);
  f != null && l(t, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(t, ["thoughtSignature"], h);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = a(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function Uv(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], i);
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], s);
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const f = a(e, ["thought"]);
  f != null && l(t, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(t, ["thoughtSignature"], h);
  const p = a(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function Fv(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = a(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], Cv(o));
  const r = a(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function Ov(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = a(e, ["functionCallingConfig"]);
  if (o != null && l(t, ["functionCallingConfig"], o), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function Gv(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], Pv(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Rv(i));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let h = u;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["functionDeclarations"], h);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const f = a(e, ["mcpServers"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["mcpServers"], h);
  }
  return t;
}
function Bv(e) {
  const t = {}, n = a(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const o = a(e, ["computerUse"]);
  if (o != null && l(t, ["computerUse"], o), a(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], r);
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const s = a(e, ["codeExecution"]);
  s != null && l(t, ["codeExecution"], s);
  const u = a(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = a(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => wv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const f = a(e, ["parallelAiSearch"]);
  f != null && l(t, ["parallelAiSearch"], f);
  const h = a(e, ["urlContext"]);
  if (h != null && l(t, ["urlContext"], h), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function qv(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function Hv(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function Vv(e, t) {
  const n = {}, o = a(t, ["name"]);
  o != null && l(n, ["_url", "name"], ct(e, o));
  const r = a(t, ["config"]);
  return r != null && qv(r, n), n;
}
function Jv(e, t) {
  const n = {}, o = a(t, ["name"]);
  o != null && l(n, ["_url", "name"], ct(e, o));
  const r = a(t, ["config"]);
  return r != null && Hv(r, n), n;
}
var Kv = class extends ut {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Gt(lt.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = _v(this.apiClient, e);
      return s = N("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = gv(this.apiClient, e);
      return s = N("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async get(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = bv(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Iv(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = vv(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = Tv(d), h = new Du();
        return Object.assign(h, f), h;
      });
    } else {
      const c = yv(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = Av(d), h = new Du();
        return Object.assign(h, f), h;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Jv(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Vv(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = kv(e);
      return s = N("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = $v(d), h = new $u();
        return Object.assign(h, f), h;
      });
    } else {
      const c = xv(e);
      return s = N("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = Dv(d), h = new $u();
        return Object.assign(h, f), h;
      });
    }
  }
};
function At(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++) t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
function Hu(e) {
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
function q(e) {
  return this instanceof q ? (this.v = e, this) : new q(e);
}
function Ve(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var o = n.apply(e, t || []), r, i = [];
  return r = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), u("next"), u("throw"), u("return", s), r[Symbol.asyncIterator] = function() {
    return this;
  }, r;
  function s(m) {
    return function(g) {
      return Promise.resolve(g).then(m, h);
    };
  }
  function u(m, g) {
    o[m] && (r[m] = function(_) {
      return new Promise(function(y, T) {
        i.push([
          m,
          _,
          y,
          T
        ]) > 1 || c(m, _);
      });
    }, g && (r[m] = g(r[m])));
  }
  function c(m, g) {
    try {
      d(o[m](g));
    } catch (_) {
      p(i[0][3], _);
    }
  }
  function d(m) {
    m.value instanceof q ? Promise.resolve(m.value.v).then(f, h) : p(i[0][2], m);
  }
  function f(m) {
    c("next", m);
  }
  function h(m) {
    c("throw", m);
  }
  function p(m, g) {
    m(g), i.shift(), i.length && c(i[0][0], i[0][1]);
  }
}
function Je(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Hu == "function" ? Hu(e) : e[Symbol.iterator](), n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function o(i) {
    n[i] = e[i] && function(s) {
      return new Promise(function(u, c) {
        s = e[i](s), r(u, c, s.done, s.value);
      });
    };
  }
  function r(i, s, u, c) {
    Promise.resolve(c).then(function(d) {
      i({
        value: d,
        done: u
      });
    }, s);
  }
}
function Wv(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : Uf(n);
}
function Uf(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function zv(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Vu(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let o = 0;
  for (; o < n; ) if (e[o].role === "user")
    t.push(e[o]), o++;
  else {
    const r = [];
    let i = !0;
    for (; o < n && e[o].role === "model"; )
      r.push(e[o]), i && !Uf(e[o]) && (i = !1), o++;
    i ? t.push(...r) : t.pop();
  }
  return t;
}
var Yv = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new Xv(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, Xv = class {
  constructor(e, t, n, o = {}, r = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = o, this.history = r, this.sendPromise = Promise.resolve(), zv(r);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = se(e.message), o = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var r, i, s;
      const u = await o, c = (i = (r = u.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content, d = u.automaticFunctionCallingHistory, f = this.getHistory(!0).length;
      let h = [];
      d != null && (h = (s = d.slice(f)) !== null && s !== void 0 ? s : []);
      const p = c ? [c] : [];
      this.recordHistory(n, p, h);
    })(), await this.sendPromise.catch(() => {
      this.sendPromise = Promise.resolve();
    }), o;
  }
  async sendMessageStream(e) {
    var t;
    await this.sendPromise;
    const n = se(e.message), o = this.modelsModule.generateContentStream({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    this.sendPromise = o.then(() => {
    }).catch(() => {
    });
    const r = await o;
    return this.processStreamResponse(r, n);
  }
  getHistory(e = !1) {
    const t = e ? Vu(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return Ve(this, arguments, function* () {
      var o, r, i, s, u, c;
      const d = [];
      try {
        for (var f = !0, h = Je(e), p; p = yield q(h.next()), o = p.done, !o; f = !0) {
          s = p.value, f = !1;
          const m = s;
          if (Wv(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield q(m);
        }
      } catch (m) {
        r = { error: m };
      } finally {
        try {
          !f && !o && (i = h.return) && (yield q(i.call(h)));
        } finally {
          if (r) throw r.error;
        }
      }
      this.recordHistory(t, d);
    });
  }
  recordHistory(e, t, n) {
    let o = [];
    t.length > 0 && t.every((r) => r.role !== void 0) ? o = t : o.push({
      role: "model",
      parts: []
    }), n && n.length > 0 ? this.history.push(...Vu(n)) : this.history.push(e), this.history.push(...o);
  }
}, Ff = class Of extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Of.prototype);
  }
};
function Qv(e) {
  const t = {}, n = a(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function Zv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function jv(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Mf(n)), t;
}
function eA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function tA(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Mf(n)), t;
}
function nA(e) {
  const t = {}, n = a(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function oA(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function rA(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && oA(n, t), t;
}
function iA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = a(e, ["files"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["files"], i);
  }
  return t;
}
function sA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["files"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(t, ["files"], r);
  }
  return t;
}
var aA = class extends ut {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Gt(lt.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = rA(e);
      return r = N("files", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = iA(u), d = new ny();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = Qv(e);
      return r = N("upload/v1beta/files", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = Zv(u), d = new oy();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = tA(e);
      return r = N("files/{file}", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = jv(e);
      return r = N("files/{file}", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = eA(u), d = new ry();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = nA(e);
      return r = N("files:register", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = sA(u), d = new iy();
        return Object.assign(d, c), d;
      });
    }
  }
};
function Ju(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function lA(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function ar(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function uA(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => IA(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function cA(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => bA(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function dA(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function fA(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function hA(e) {
  const t = {}, n = a(e, ["description"]);
  n != null && l(t, ["description"], n);
  const o = a(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = a(e, ["parameters"]);
  r != null && l(t, ["parameters"], r);
  const i = a(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const s = a(e, ["response"]);
  s != null && l(t, ["response"], s);
  const u = a(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), a(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function pA(e) {
  const t = {}, n = a(e, ["modelSelectionConfig"]);
  n != null && l(t, ["modelConfig"], n);
  const o = a(e, ["responseJsonSchema"]);
  o != null && l(t, ["responseJsonSchema"], o);
  const r = a(e, ["audioTimestamp"]);
  r != null && l(t, ["audioTimestamp"], r);
  const i = a(e, ["candidateCount"]);
  i != null && l(t, ["candidateCount"], i);
  const s = a(e, ["enableAffectiveDialog"]);
  s != null && l(t, ["enableAffectiveDialog"], s);
  const u = a(e, ["frequencyPenalty"]);
  u != null && l(t, ["frequencyPenalty"], u);
  const c = a(e, ["logprobs"]);
  c != null && l(t, ["logprobs"], c);
  const d = a(e, ["maxOutputTokens"]);
  d != null && l(t, ["maxOutputTokens"], d);
  const f = a(e, ["mediaResolution"]);
  f != null && l(t, ["mediaResolution"], f);
  const h = a(e, ["presencePenalty"]);
  h != null && l(t, ["presencePenalty"], h);
  const p = a(e, ["responseLogprobs"]);
  p != null && l(t, ["responseLogprobs"], p);
  const m = a(e, ["responseMimeType"]);
  m != null && l(t, ["responseMimeType"], m);
  const g = a(e, ["responseModalities"]);
  g != null && l(t, ["responseModalities"], g);
  const _ = a(e, ["responseSchema"]);
  _ != null && l(t, ["responseSchema"], _);
  const y = a(e, ["routingConfig"]);
  y != null && l(t, ["routingConfig"], y);
  const T = a(e, ["seed"]);
  T != null && l(t, ["seed"], T);
  const E = a(e, ["speechConfig"]);
  E != null && l(t, ["speechConfig"], E);
  const C = a(e, ["stopSequences"]);
  C != null && l(t, ["stopSequences"], C);
  const b = a(e, ["temperature"]);
  b != null && l(t, ["temperature"], b);
  const k = a(e, ["thinkingConfig"]);
  k != null && l(t, ["thinkingConfig"], k);
  const w = a(e, ["topK"]);
  w != null && l(t, ["topK"], w);
  const D = a(e, ["topP"]);
  if (D != null && l(t, ["topP"], D), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function mA(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], lA(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function gA(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function _A(e, t) {
  const n = {}, o = a(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], o);
  const r = a(e, ["responseModalities"]);
  t !== void 0 && r != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], r);
  const i = a(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
  const s = a(e, ["topP"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], s);
  const u = a(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = a(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = a(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const f = a(e, ["seed"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], f);
  const h = a(e, ["speechConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], ta(h));
  const p = a(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = a(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = a(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], uA(se(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let I = mn(_);
    Array.isArray(I) && (I = I.map((x) => MA(pn(x)))), l(t, ["setup", "tools"], I);
  }
  const y = a(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], PA(y));
  const T = a(e, ["inputAudioTranscription"]);
  t !== void 0 && T != null && l(t, ["setup", "inputAudioTranscription"], Ju(T));
  const E = a(e, ["outputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "outputAudioTranscription"], Ju(E));
  const C = a(e, ["realtimeInputConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "realtimeInputConfig"], C);
  const b = a(e, ["contextWindowCompression"]);
  t !== void 0 && b != null && l(t, ["setup", "contextWindowCompression"], b);
  const k = a(e, ["proactivity"]);
  if (t !== void 0 && k != null && l(t, ["setup", "proactivity"], k), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const w = a(e, ["avatarConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "avatarConfig"], w);
  const D = a(e, ["safetySettings"]);
  if (t !== void 0 && D != null) {
    let I = D;
    Array.isArray(I) && (I = I.map((x) => RA(x))), l(t, ["setup", "safetySettings"], I);
  }
  return n;
}
function yA(e, t) {
  const n = {}, o = a(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], pA(o));
  const r = a(e, ["responseModalities"]);
  t !== void 0 && r != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], r);
  const i = a(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
  const s = a(e, ["topP"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], s);
  const u = a(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = a(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = a(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const f = a(e, ["seed"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], f);
  const h = a(e, ["speechConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], ta(h));
  const p = a(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = a(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = a(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], cA(se(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = mn(_);
    Array.isArray(x) && (x = x.map((R) => NA(pn(R)))), l(t, ["setup", "tools"], x);
  }
  const y = a(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], y);
  const T = a(e, ["inputAudioTranscription"]);
  t !== void 0 && T != null && l(t, ["setup", "inputAudioTranscription"], T);
  const E = a(e, ["outputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "outputAudioTranscription"], E);
  const C = a(e, ["realtimeInputConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "realtimeInputConfig"], C);
  const b = a(e, ["contextWindowCompression"]);
  t !== void 0 && b != null && l(t, ["setup", "contextWindowCompression"], b);
  const k = a(e, ["proactivity"]);
  t !== void 0 && k != null && l(t, ["setup", "proactivity"], k);
  const w = a(e, ["explicitVadSignal"]);
  t !== void 0 && w != null && l(t, ["setup", "explicitVadSignal"], w);
  const D = a(e, ["avatarConfig"]);
  t !== void 0 && D != null && l(t, ["setup", "avatarConfig"], D);
  const I = a(e, ["safetySettings"]);
  if (t !== void 0 && I != null) {
    let x = I;
    Array.isArray(x) && (x = x.map((R) => R)), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function vA(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["setup", "model"], K(e, o));
  const r = a(t, ["config"]);
  return r != null && l(n, ["config"], _A(r, n)), n;
}
function AA(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["setup", "model"], K(e, o));
  const r = a(t, ["config"]);
  return r != null && l(n, ["config"], yA(r, n)), n;
}
function TA(e) {
  const t = {}, n = a(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function SA(e) {
  const t = {}, n = a(e, ["weightedPrompts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["weightedPrompts"], o);
  }
  return t;
}
function EA(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = wf(n);
    Array.isArray(d) && (d = d.map((f) => ar(f))), l(t, ["mediaChunks"], d);
  }
  const o = a(e, ["audio"]);
  o != null && l(t, ["audio"], ar(bf(o)));
  const r = a(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = a(e, ["video"]);
  i != null && l(t, ["video"], ar(If(i)));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function CA(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = wf(n);
    Array.isArray(d) && (d = d.map((f) => f)), l(t, ["mediaChunks"], d);
  }
  const o = a(e, ["audio"]);
  o != null && l(t, ["audio"], bf(o));
  const r = a(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = a(e, ["video"]);
  i != null && l(t, ["video"], If(i));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function wA(e) {
  const t = {}, n = a(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const o = a(e, ["serverContent"]);
  o != null && l(t, ["serverContent"], o);
  const r = a(e, ["toolCall"]);
  r != null && l(t, ["toolCall"], r);
  const i = a(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const s = a(e, ["usageMetadata"]);
  s != null && l(t, ["usageMetadata"], xA(s));
  const u = a(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = a(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = a(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const f = a(e, ["voiceActivity"]);
  return f != null && l(t, ["voiceActivity"], kA(f)), t;
}
function IA(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], dA(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], fA(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], ar(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const f = a(e, ["thought"]);
  f != null && l(t, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(t, ["thoughtSignature"], h);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = a(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function bA(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], i);
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], s);
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], c);
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const f = a(e, ["thought"]);
  f != null && l(t, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(t, ["thoughtSignature"], h);
  const p = a(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function RA(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = a(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function PA(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function MA(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], gA(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], mA(i));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let h = u;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["functionDeclarations"], h);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const f = a(e, ["mcpServers"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["mcpServers"], h);
  }
  return t;
}
function NA(e) {
  const t = {}, n = a(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const o = a(e, ["computerUse"]);
  if (o != null && l(t, ["computerUse"], o), a(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], r);
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const s = a(e, ["codeExecution"]);
  s != null && l(t, ["codeExecution"], s);
  const u = a(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = a(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => hA(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const f = a(e, ["parallelAiSearch"]);
  f != null && l(t, ["parallelAiSearch"], f);
  const h = a(e, ["urlContext"]);
  if (h != null && l(t, ["urlContext"], h), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function xA(e) {
  const t = {}, n = a(e, ["promptTokenCount"]);
  n != null && l(t, ["promptTokenCount"], n);
  const o = a(e, ["cachedContentTokenCount"]);
  o != null && l(t, ["cachedContentTokenCount"], o);
  const r = a(e, ["candidatesTokenCount"]);
  r != null && l(t, ["responseTokenCount"], r);
  const i = a(e, ["toolUsePromptTokenCount"]);
  i != null && l(t, ["toolUsePromptTokenCount"], i);
  const s = a(e, ["thoughtsTokenCount"]);
  s != null && l(t, ["thoughtsTokenCount"], s);
  const u = a(e, ["totalTokenCount"]);
  u != null && l(t, ["totalTokenCount"], u);
  const c = a(e, ["promptTokensDetails"]);
  if (c != null) {
    let m = c;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["promptTokensDetails"], m);
  }
  const d = a(e, ["cacheTokensDetails"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["cacheTokensDetails"], m);
  }
  const f = a(e, ["candidatesTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["responseTokensDetails"], m);
  }
  const h = a(e, ["toolUsePromptTokensDetails"]);
  if (h != null) {
    let m = h;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["toolUsePromptTokensDetails"], m);
  }
  const p = a(e, ["trafficType"]);
  return p != null && l(t, ["trafficType"], p), t;
}
function kA(e) {
  const t = {}, n = a(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function DA(e, t) {
  const n = {}, o = a(e, ["apiKey"]);
  if (o != null && l(n, ["apiKey"], o), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function $A(e, t) {
  const n = {}, o = a(e, ["data"]);
  if (o != null && l(n, ["data"], o), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function LA(e, t) {
  const n = {}, o = a(e, ["content"]);
  o != null && l(n, ["content"], o);
  const r = a(e, ["citationMetadata"]);
  r != null && l(n, ["citationMetadata"], UA(r));
  const i = a(e, ["tokenCount"]);
  i != null && l(n, ["tokenCount"], i);
  const s = a(e, ["finishReason"]);
  s != null && l(n, ["finishReason"], s);
  const u = a(e, ["groundingMetadata"]);
  u != null && l(n, ["groundingMetadata"], u);
  const c = a(e, ["avgLogprobs"]);
  c != null && l(n, ["avgLogprobs"], c);
  const d = a(e, ["index"]);
  d != null && l(n, ["index"], d);
  const f = a(e, ["logprobsResult"]);
  f != null && l(n, ["logprobsResult"], f);
  const h = a(e, ["safetyRatings"]);
  if (h != null) {
    let m = h;
    Array.isArray(m) && (m = m.map((g) => g)), l(n, ["safetyRatings"], m);
  }
  const p = a(e, ["urlContextMetadata"]);
  return p != null && l(n, ["urlContextMetadata"], p), n;
}
function UA(e, t) {
  const n = {}, o = a(e, ["citationSources"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(n, ["citations"], r);
  }
  return n;
}
function FA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let s = ve(i);
    Array.isArray(s) && (s = s.map((u) => _n(u))), l(o, ["contents"], s);
  }
  return o;
}
function OA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["tokensInfo"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function GA(e, t) {
  const n = {}, o = a(e, ["values"]);
  o != null && l(n, ["values"], o);
  const r = a(e, ["statistics"]);
  return r != null && l(n, ["statistics"], BA(r)), n;
}
function BA(e, t) {
  const n = {}, o = a(e, ["truncated"]);
  o != null && l(n, ["truncated"], o);
  const r = a(e, ["token_count"]);
  return r != null && l(n, ["tokenCount"], r), n;
}
function To(e, t) {
  const n = {}, o = a(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => XT(s))), l(n, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function _n(e, t) {
  const n = {}, o = a(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => QT(s))), l(n, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function qA(e, t) {
  const n = {}, o = a(e, ["controlType"]);
  o != null && l(n, ["controlType"], o);
  const r = a(e, ["enableControlImageComputation"]);
  return r != null && l(n, ["computeControl"], r), n;
}
function HA(e, t) {
  const n = {};
  if (a(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (a(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (a(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function VA(e, t, n) {
  const o = {}, r = a(e, ["systemInstruction"]);
  t !== void 0 && r != null && l(t, ["systemInstruction"], _n(se(r)));
  const i = a(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => Hf(c))), l(t, ["tools"], u);
  }
  const s = a(e, ["generationConfig"]);
  return t !== void 0 && s != null && l(t, ["generationConfig"], $T(s)), o;
}
function JA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = ve(i);
    Array.isArray(u) && (u = u.map((c) => To(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && HA(s), o;
}
function KA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = ve(i);
    Array.isArray(u) && (u = u.map((c) => _n(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && VA(s, o), o;
}
function WA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["totalTokens"]);
  r != null && l(n, ["totalTokens"], r);
  const i = a(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function zA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["totalTokens"]);
  return r != null && l(n, ["totalTokens"], r), n;
}
function YA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], K(e, r)), o;
}
function XA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], K(e, r)), o;
}
function QA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function ZA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function jA(e, t, n) {
  const o = {}, r = a(e, ["outputGcsUri"]);
  t !== void 0 && r != null && l(t, ["parameters", "storageUri"], r);
  const i = a(e, ["negativePrompt"]);
  t !== void 0 && i != null && l(t, ["parameters", "negativePrompt"], i);
  const s = a(e, ["numberOfImages"]);
  t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s);
  const u = a(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = a(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = a(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const f = a(e, ["safetyFilterLevel"]);
  t !== void 0 && f != null && l(t, ["parameters", "safetySetting"], f);
  const h = a(e, ["personGeneration"]);
  t !== void 0 && h != null && l(t, ["parameters", "personGeneration"], h);
  const p = a(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = a(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const g = a(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const _ = a(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const y = a(e, ["outputCompressionQuality"]);
  t !== void 0 && y != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], y);
  const T = a(e, ["addWatermark"]);
  t !== void 0 && T != null && l(t, ["parameters", "addWatermark"], T);
  const E = a(e, ["labels"]);
  t !== void 0 && E != null && l(t, ["labels"], E);
  const C = a(e, ["editMode"]);
  t !== void 0 && C != null && l(t, ["parameters", "editMode"], C);
  const b = a(e, ["baseSteps"]);
  return t !== void 0 && b != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], b), o;
}
function eT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["referenceImages"]);
  if (s != null) {
    let c = s;
    Array.isArray(c) && (c = c.map((d) => oS(d))), l(o, ["instances[0]", "referenceImages"], c);
  }
  const u = a(t, ["config"]);
  return u != null && jA(u, o), o;
}
function tT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => Vr(s))), l(n, ["generatedImages"], i);
  }
  return n;
}
function nT(e, t, n) {
  const o = {}, r = a(e, ["taskType"]);
  t !== void 0 && r != null && l(t, ["requests[]", "taskType"], r);
  const i = a(e, ["title"]);
  t !== void 0 && i != null && l(t, ["requests[]", "title"], i);
  const s = a(e, ["outputDimensionality"]);
  if (t !== void 0 && s != null && l(t, ["requests[]", "outputDimensionality"], s), a(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (a(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (a(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (a(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return o;
}
function oT(e, t, n) {
  const o = {};
  let r = a(n, ["embeddingApiType"]);
  if (r === void 0 && (r = "PREDICT"), r === "PREDICT") {
    const h = a(e, ["taskType"]);
    t !== void 0 && h != null && l(t, ["instances[]", "task_type"], h);
  } else if (r === "EMBED_CONTENT") {
    const h = a(e, ["taskType"]);
    t !== void 0 && h != null && l(t, ["embedContentConfig", "taskType"], h);
  }
  let i = a(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const h = a(e, ["title"]);
    t !== void 0 && h != null && l(t, ["instances[]", "title"], h);
  } else if (i === "EMBED_CONTENT") {
    const h = a(e, ["title"]);
    t !== void 0 && h != null && l(t, ["embedContentConfig", "title"], h);
  }
  let s = a(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "PREDICT") {
    const h = a(e, ["outputDimensionality"]);
    t !== void 0 && h != null && l(t, ["parameters", "outputDimensionality"], h);
  } else if (s === "EMBED_CONTENT") {
    const h = a(e, ["outputDimensionality"]);
    t !== void 0 && h != null && l(t, ["embedContentConfig", "outputDimensionality"], h);
  }
  let u = a(n, ["embeddingApiType"]);
  if (u === void 0 && (u = "PREDICT"), u === "PREDICT") {
    const h = a(e, ["mimeType"]);
    t !== void 0 && h != null && l(t, ["instances[]", "mimeType"], h);
  }
  let c = a(n, ["embeddingApiType"]);
  if (c === void 0 && (c = "PREDICT"), c === "PREDICT") {
    const h = a(e, ["autoTruncate"]);
    t !== void 0 && h != null && l(t, ["parameters", "autoTruncate"], h);
  } else if (c === "EMBED_CONTENT") {
    const h = a(e, ["autoTruncate"]);
    t !== void 0 && h != null && l(t, ["embedContentConfig", "autoTruncate"], h);
  }
  let d = a(n, ["embeddingApiType"]);
  if (d === void 0 && (d = "PREDICT"), d === "EMBED_CONTENT") {
    const h = a(e, ["documentOcr"]);
    t !== void 0 && h != null && l(t, ["embedContentConfig", "documentOcr"], h);
  }
  let f = a(n, ["embeddingApiType"]);
  if (f === void 0 && (f = "PREDICT"), f === "EMBED_CONTENT") {
    const h = a(e, ["audioTrackExtraction"]);
    t !== void 0 && h != null && l(t, ["embedContentConfig", "audioTrackExtraction"], h);
  }
  return o;
}
function rT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let d = Zs(e, i);
    Array.isArray(d) && (d = d.map((f) => f)), l(o, ["requests[]", "content"], d);
  }
  const s = a(t, ["content"]);
  s != null && To(se(s));
  const u = a(t, ["config"]);
  u != null && nT(u, o);
  const c = a(t, ["model"]);
  return c !== void 0 && l(o, ["requests[]", "model"], K(e, c)), o;
}
function iT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  let i = a(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = a(t, ["contents"]);
    if (c != null) {
      let d = Zs(e, c);
      Array.isArray(d) && (d = d.map((f) => f)), l(o, ["instances[]", "content"], d);
    }
  }
  let s = a(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "EMBED_CONTENT") {
    const c = a(t, ["content"]);
    c != null && l(o, ["content"], _n(se(c)));
  }
  const u = a(t, ["config"]);
  return u != null && oT(u, o, n), o;
}
function sT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["embeddings"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => u)), l(n, ["embeddings"], s);
  }
  const i = a(e, ["metadata"]);
  return i != null && l(n, ["metadata"], i), n;
}
function aT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions[]", "embeddings"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => GA(u))), l(n, ["embeddings"], s);
  }
  const i = a(e, ["metadata"]);
  if (i != null && l(n, ["metadata"], i), t && a(t, ["embeddingApiType"]) === "EMBED_CONTENT") {
    const s = a(e, ["embedding"]), u = a(e, ["usageMetadata"]), c = a(e, ["truncated"]);
    if (s) {
      const d = {};
      u && u.promptTokenCount && (d.tokenCount = u.promptTokenCount), c && (d.truncated = c), s.statistics = d, l(n, ["embeddings"], [s]);
    }
  }
  return n;
}
function lT(e, t) {
  const n = {}, o = a(e, ["endpoint"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["deployedModelId"]);
  return r != null && l(n, ["deployedModelId"], r), n;
}
function uT(e, t) {
  const n = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["fileUri"]);
  o != null && l(n, ["fileUri"], o);
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function cT(e, t) {
  const n = {}, o = a(e, ["id"]);
  o != null && l(n, ["id"], o);
  const r = a(e, ["args"]);
  r != null && l(n, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(n, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function dT(e, t) {
  const n = {}, o = a(e, ["allowedFunctionNames"]);
  o != null && l(n, ["allowedFunctionNames"], o);
  const r = a(e, ["mode"]);
  if (r != null && l(n, ["mode"], r), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function fT(e, t) {
  const n = {}, o = a(e, ["description"]);
  o != null && l(n, ["description"], o);
  const r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["parameters"]);
  i != null && l(n, ["parameters"], i);
  const s = a(e, ["parametersJsonSchema"]);
  s != null && l(n, ["parametersJsonSchema"], s);
  const u = a(e, ["response"]);
  u != null && l(n, ["response"], u);
  const c = a(e, ["responseJsonSchema"]);
  if (c != null && l(n, ["responseJsonSchema"], c), a(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return n;
}
function hT(e, t, n, o) {
  const r = {}, i = a(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], To(se(i)));
  const s = a(t, ["temperature"]);
  s != null && l(r, ["temperature"], s);
  const u = a(t, ["topP"]);
  u != null && l(r, ["topP"], u);
  const c = a(t, ["topK"]);
  c != null && l(r, ["topK"], c);
  const d = a(t, ["candidateCount"]);
  d != null && l(r, ["candidateCount"], d);
  const f = a(t, ["maxOutputTokens"]);
  f != null && l(r, ["maxOutputTokens"], f);
  const h = a(t, ["stopSequences"]);
  h != null && l(r, ["stopSequences"], h);
  const p = a(t, ["responseLogprobs"]);
  p != null && l(r, ["responseLogprobs"], p);
  const m = a(t, ["logprobs"]);
  m != null && l(r, ["logprobs"], m);
  const g = a(t, ["presencePenalty"]);
  g != null && l(r, ["presencePenalty"], g);
  const _ = a(t, ["frequencyPenalty"]);
  _ != null && l(r, ["frequencyPenalty"], _);
  const y = a(t, ["seed"]);
  y != null && l(r, ["seed"], y);
  const T = a(t, ["responseMimeType"]);
  T != null && l(r, ["responseMimeType"], T);
  const E = a(t, ["responseSchema"]);
  E != null && l(r, ["responseSchema"], js(E));
  const C = a(t, ["responseJsonSchema"]);
  if (C != null && l(r, ["responseJsonSchema"], C), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const b = a(t, ["safetySettings"]);
  if (n !== void 0 && b != null) {
    let W = b;
    Array.isArray(W) && (W = W.map((ge) => rS(ge))), l(n, ["safetySettings"], W);
  }
  const k = a(t, ["tools"]);
  if (n !== void 0 && k != null) {
    let W = mn(k);
    Array.isArray(W) && (W = W.map((ge) => fS(pn(ge)))), l(n, ["tools"], W);
  }
  const w = a(t, ["toolConfig"]);
  if (n !== void 0 && w != null && l(n, ["toolConfig"], cS(w)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const D = a(t, ["cachedContent"]);
  n !== void 0 && D != null && l(n, ["cachedContent"], ct(e, D));
  const I = a(t, ["responseModalities"]);
  I != null && l(r, ["responseModalities"], I);
  const x = a(t, ["mediaResolution"]);
  x != null && l(r, ["mediaResolution"], x);
  const R = a(t, ["speechConfig"]);
  if (R != null && l(r, ["speechConfig"], ea(R)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const F = a(t, ["thinkingConfig"]);
  F != null && l(r, ["thinkingConfig"], F);
  const X = a(t, ["imageConfig"]);
  X != null && l(r, ["imageConfig"], GT(X));
  const J = a(t, ["enableEnhancedCivicAnswers"]);
  if (J != null && l(r, ["enableEnhancedCivicAnswers"], J), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const V = a(t, ["serviceTier"]);
  return n !== void 0 && V != null && l(n, ["serviceTier"], V), r;
}
function pT(e, t, n, o) {
  const r = {}, i = a(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], _n(se(i)));
  const s = a(t, ["temperature"]);
  s != null && l(r, ["temperature"], s);
  const u = a(t, ["topP"]);
  u != null && l(r, ["topP"], u);
  const c = a(t, ["topK"]);
  c != null && l(r, ["topK"], c);
  const d = a(t, ["candidateCount"]);
  d != null && l(r, ["candidateCount"], d);
  const f = a(t, ["maxOutputTokens"]);
  f != null && l(r, ["maxOutputTokens"], f);
  const h = a(t, ["stopSequences"]);
  h != null && l(r, ["stopSequences"], h);
  const p = a(t, ["responseLogprobs"]);
  p != null && l(r, ["responseLogprobs"], p);
  const m = a(t, ["logprobs"]);
  m != null && l(r, ["logprobs"], m);
  const g = a(t, ["presencePenalty"]);
  g != null && l(r, ["presencePenalty"], g);
  const _ = a(t, ["frequencyPenalty"]);
  _ != null && l(r, ["frequencyPenalty"], _);
  const y = a(t, ["seed"]);
  y != null && l(r, ["seed"], y);
  const T = a(t, ["responseMimeType"]);
  T != null && l(r, ["responseMimeType"], T);
  const E = a(t, ["responseSchema"]);
  E != null && l(r, ["responseSchema"], js(E));
  const C = a(t, ["responseJsonSchema"]);
  C != null && l(r, ["responseJsonSchema"], C);
  const b = a(t, ["routingConfig"]);
  b != null && l(r, ["routingConfig"], b);
  const k = a(t, ["modelSelectionConfig"]);
  k != null && l(r, ["modelConfig"], k);
  const w = a(t, ["safetySettings"]);
  if (n !== void 0 && w != null) {
    let Ue = w;
    Array.isArray(Ue) && (Ue = Ue.map((ai) => ai)), l(n, ["safetySettings"], Ue);
  }
  const D = a(t, ["tools"]);
  if (n !== void 0 && D != null) {
    let Ue = mn(D);
    Array.isArray(Ue) && (Ue = Ue.map((ai) => Hf(pn(ai)))), l(n, ["tools"], Ue);
  }
  const I = a(t, ["toolConfig"]);
  n !== void 0 && I != null && l(n, ["toolConfig"], dS(I));
  const x = a(t, ["labels"]);
  n !== void 0 && x != null && l(n, ["labels"], x);
  const R = a(t, ["cachedContent"]);
  n !== void 0 && R != null && l(n, ["cachedContent"], ct(e, R));
  const F = a(t, ["responseModalities"]);
  F != null && l(r, ["responseModalities"], F);
  const X = a(t, ["mediaResolution"]);
  X != null && l(r, ["mediaResolution"], X);
  const J = a(t, ["speechConfig"]);
  J != null && l(r, ["speechConfig"], ea(J));
  const V = a(t, ["audioTimestamp"]);
  V != null && l(r, ["audioTimestamp"], V);
  const W = a(t, ["thinkingConfig"]);
  W != null && l(r, ["thinkingConfig"], W);
  const ge = a(t, ["imageConfig"]);
  if (ge != null && l(r, ["imageConfig"], BT(ge)), a(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const We = a(t, ["modelArmorConfig"]);
  n !== void 0 && We != null && l(n, ["modelArmorConfig"], We);
  const Le = a(t, ["serviceTier"]);
  return n !== void 0 && Le != null && l(n, ["serviceTier"], Le), r;
}
function Ku(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = ve(i);
    Array.isArray(u) && (u = u.map((c) => To(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(o, ["generationConfig"], hT(e, s, o)), o;
}
function Wu(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = ve(i);
    Array.isArray(u) && (u = u.map((c) => _n(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(o, ["generationConfig"], pT(e, s, o)), o;
}
function zu(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["candidates"]);
  if (r != null) {
    let f = r;
    Array.isArray(f) && (f = f.map((h) => LA(h))), l(n, ["candidates"], f);
  }
  const i = a(e, ["modelVersion"]);
  i != null && l(n, ["modelVersion"], i);
  const s = a(e, ["promptFeedback"]);
  s != null && l(n, ["promptFeedback"], s);
  const u = a(e, ["responseId"]);
  u != null && l(n, ["responseId"], u);
  const c = a(e, ["usageMetadata"]);
  c != null && l(n, ["usageMetadata"], c);
  const d = a(e, ["modelStatus"]);
  return d != null && l(n, ["modelStatus"], d), n;
}
function Yu(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["candidates"]);
  if (r != null) {
    let f = r;
    Array.isArray(f) && (f = f.map((h) => h)), l(n, ["candidates"], f);
  }
  const i = a(e, ["createTime"]);
  i != null && l(n, ["createTime"], i);
  const s = a(e, ["modelVersion"]);
  s != null && l(n, ["modelVersion"], s);
  const u = a(e, ["promptFeedback"]);
  u != null && l(n, ["promptFeedback"], u);
  const c = a(e, ["responseId"]);
  c != null && l(n, ["responseId"], c);
  const d = a(e, ["usageMetadata"]);
  return d != null && l(n, ["usageMetadata"], d), n;
}
function mT(e, t, n) {
  const o = {};
  if (a(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (a(e, ["negativePrompt"]) !== void 0) throw new Error("negativePrompt parameter is not supported in Gemini API.");
  const r = a(e, ["numberOfImages"]);
  t !== void 0 && r != null && l(t, ["parameters", "sampleCount"], r);
  const i = a(e, ["aspectRatio"]);
  t !== void 0 && i != null && l(t, ["parameters", "aspectRatio"], i);
  const s = a(e, ["guidanceScale"]);
  if (t !== void 0 && s != null && l(t, ["parameters", "guidanceScale"], s), a(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const u = a(e, ["safetyFilterLevel"]);
  t !== void 0 && u != null && l(t, ["parameters", "safetySetting"], u);
  const c = a(e, ["personGeneration"]);
  t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c);
  const d = a(e, ["includeSafetyAttributes"]);
  t !== void 0 && d != null && l(t, ["parameters", "includeSafetyAttributes"], d);
  const f = a(e, ["includeRaiReason"]);
  t !== void 0 && f != null && l(t, ["parameters", "includeRaiReason"], f);
  const h = a(e, ["language"]);
  t !== void 0 && h != null && l(t, ["parameters", "language"], h);
  const p = a(e, ["outputMimeType"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], p);
  const m = a(e, ["outputCompressionQuality"]);
  if (t !== void 0 && m != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], m), a(e, ["addWatermark"]) !== void 0) throw new Error("addWatermark parameter is not supported in Gemini API.");
  if (a(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const g = a(e, ["imageSize"]);
  if (t !== void 0 && g != null && l(t, ["parameters", "sampleImageSize"], g), a(e, ["enhancePrompt"]) !== void 0) throw new Error("enhancePrompt parameter is not supported in Gemini API.");
  return o;
}
function gT(e, t, n) {
  const o = {}, r = a(e, ["outputGcsUri"]);
  t !== void 0 && r != null && l(t, ["parameters", "storageUri"], r);
  const i = a(e, ["negativePrompt"]);
  t !== void 0 && i != null && l(t, ["parameters", "negativePrompt"], i);
  const s = a(e, ["numberOfImages"]);
  t !== void 0 && s != null && l(t, ["parameters", "sampleCount"], s);
  const u = a(e, ["aspectRatio"]);
  t !== void 0 && u != null && l(t, ["parameters", "aspectRatio"], u);
  const c = a(e, ["guidanceScale"]);
  t !== void 0 && c != null && l(t, ["parameters", "guidanceScale"], c);
  const d = a(e, ["seed"]);
  t !== void 0 && d != null && l(t, ["parameters", "seed"], d);
  const f = a(e, ["safetyFilterLevel"]);
  t !== void 0 && f != null && l(t, ["parameters", "safetySetting"], f);
  const h = a(e, ["personGeneration"]);
  t !== void 0 && h != null && l(t, ["parameters", "personGeneration"], h);
  const p = a(e, ["includeSafetyAttributes"]);
  t !== void 0 && p != null && l(t, ["parameters", "includeSafetyAttributes"], p);
  const m = a(e, ["includeRaiReason"]);
  t !== void 0 && m != null && l(t, ["parameters", "includeRaiReason"], m);
  const g = a(e, ["language"]);
  t !== void 0 && g != null && l(t, ["parameters", "language"], g);
  const _ = a(e, ["outputMimeType"]);
  t !== void 0 && _ != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], _);
  const y = a(e, ["outputCompressionQuality"]);
  t !== void 0 && y != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], y);
  const T = a(e, ["addWatermark"]);
  t !== void 0 && T != null && l(t, ["parameters", "addWatermark"], T);
  const E = a(e, ["labels"]);
  t !== void 0 && E != null && l(t, ["labels"], E);
  const C = a(e, ["imageSize"]);
  t !== void 0 && C != null && l(t, ["parameters", "sampleImageSize"], C);
  const b = a(e, ["enhancePrompt"]);
  return t !== void 0 && b != null && l(t, ["parameters", "enhancePrompt"], b), o;
}
function _T(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["config"]);
  return s != null && mT(s, o), o;
}
function yT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["config"]);
  return s != null && gT(s, o), o;
}
function vT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => NT(u))), l(n, ["generatedImages"], s);
  }
  const i = a(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Bf(i)), n;
}
function AT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => Vr(u))), l(n, ["generatedImages"], s);
  }
  const i = a(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], qf(i)), n;
}
function TT(e, t, n) {
  const o = {}, r = a(e, ["numberOfVideos"]);
  if (t !== void 0 && r != null && l(t, ["parameters", "sampleCount"], r), a(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (a(e, ["fps"]) !== void 0) throw new Error("fps parameter is not supported in Gemini API.");
  const i = a(e, ["durationSeconds"]);
  if (t !== void 0 && i != null && l(t, ["parameters", "durationSeconds"], i), a(e, ["seed"]) !== void 0) throw new Error("seed parameter is not supported in Gemini API.");
  const s = a(e, ["aspectRatio"]);
  t !== void 0 && s != null && l(t, ["parameters", "aspectRatio"], s);
  const u = a(e, ["resolution"]);
  t !== void 0 && u != null && l(t, ["parameters", "resolution"], u);
  const c = a(e, ["personGeneration"]);
  if (t !== void 0 && c != null && l(t, ["parameters", "personGeneration"], c), a(e, ["pubsubTopic"]) !== void 0) throw new Error("pubsubTopic parameter is not supported in Gemini API.");
  const d = a(e, ["negativePrompt"]);
  t !== void 0 && d != null && l(t, ["parameters", "negativePrompt"], d);
  const f = a(e, ["enhancePrompt"]);
  if (t !== void 0 && f != null && l(t, ["parameters", "enhancePrompt"], f), a(e, ["generateAudio"]) !== void 0) throw new Error("generateAudio parameter is not supported in Gemini API.");
  const h = a(e, ["lastFrame"]);
  t !== void 0 && h != null && l(t, ["instances[0]", "lastFrame"], Jr(h));
  const p = a(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => wS(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (a(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (a(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (a(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = a(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), o;
}
function ST(e, t, n) {
  const o = {}, r = a(e, ["numberOfVideos"]);
  t !== void 0 && r != null && l(t, ["parameters", "sampleCount"], r);
  const i = a(e, ["outputGcsUri"]);
  t !== void 0 && i != null && l(t, ["parameters", "storageUri"], i);
  const s = a(e, ["fps"]);
  t !== void 0 && s != null && l(t, ["parameters", "fps"], s);
  const u = a(e, ["durationSeconds"]);
  t !== void 0 && u != null && l(t, ["parameters", "durationSeconds"], u);
  const c = a(e, ["seed"]);
  t !== void 0 && c != null && l(t, ["parameters", "seed"], c);
  const d = a(e, ["aspectRatio"]);
  t !== void 0 && d != null && l(t, ["parameters", "aspectRatio"], d);
  const f = a(e, ["resolution"]);
  t !== void 0 && f != null && l(t, ["parameters", "resolution"], f);
  const h = a(e, ["personGeneration"]);
  t !== void 0 && h != null && l(t, ["parameters", "personGeneration"], h);
  const p = a(e, ["pubsubTopic"]);
  t !== void 0 && p != null && l(t, ["parameters", "pubsubTopic"], p);
  const m = a(e, ["negativePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "negativePrompt"], m);
  const g = a(e, ["enhancePrompt"]);
  t !== void 0 && g != null && l(t, ["parameters", "enhancePrompt"], g);
  const _ = a(e, ["generateAudio"]);
  t !== void 0 && _ != null && l(t, ["parameters", "generateAudio"], _);
  const y = a(e, ["lastFrame"]);
  t !== void 0 && y != null && l(t, ["instances[0]", "lastFrame"], Ke(y));
  const T = a(e, ["referenceImages"]);
  if (t !== void 0 && T != null) {
    let k = T;
    Array.isArray(k) && (k = k.map((w) => IS(w))), l(t, ["instances[0]", "referenceImages"], k);
  }
  const E = a(e, ["mask"]);
  t !== void 0 && E != null && l(t, ["instances[0]", "mask"], CS(E));
  const C = a(e, ["compressionQuality"]);
  t !== void 0 && C != null && l(t, ["parameters", "compressionQuality"], C);
  const b = a(e, ["labels"]);
  if (t !== void 0 && b != null && l(t, ["labels"], b), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return o;
}
function ET(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(n, ["done"], i);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], bT(u)), n;
}
function CT(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(n, ["done"], i);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response"]);
  return u != null && l(n, ["response"], RT(u)), n;
}
function wT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["image"]);
  s != null && l(o, ["instances[0]", "image"], Jr(s));
  const u = a(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], Vf(u));
  const c = a(t, ["source"]);
  c != null && PT(c, o);
  const d = a(t, ["config"]);
  return d != null && TT(d, o), o;
}
function IT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["image"]);
  s != null && l(o, ["instances[0]", "image"], Ke(s));
  const u = a(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], Jf(u));
  const c = a(t, ["source"]);
  c != null && MT(c, o);
  const d = a(t, ["config"]);
  return d != null && ST(d, o), o;
}
function bT(e, t) {
  const n = {}, o = a(e, ["generatedSamples"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => kT(u))), l(n, ["generatedVideos"], s);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function RT(e, t) {
  const n = {}, o = a(e, ["videos"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => DT(u))), l(n, ["generatedVideos"], s);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function PT(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Jr(i));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], Vf(s)), o;
}
function MT(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Ke(i));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], Jf(s)), o;
}
function NT(e, t) {
  const n = {}, o = a(e, ["_self"]);
  o != null && l(n, ["image"], qT(o));
  const r = a(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = a(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], Bf(i)), n;
}
function Vr(e, t) {
  const n = {}, o = a(e, ["_self"]);
  o != null && l(n, ["image"], Gf(o));
  const r = a(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = a(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], qf(i));
  const s = a(e, ["prompt"]);
  return s != null && l(n, ["enhancedPrompt"], s), n;
}
function xT(e, t) {
  const n = {}, o = a(e, ["_self"]);
  o != null && l(n, ["mask"], Gf(o));
  const r = a(e, ["labels"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(n, ["labels"], i);
  }
  return n;
}
function kT(e, t) {
  const n = {}, o = a(e, ["video"]);
  return o != null && l(n, ["video"], SS(o)), n;
}
function DT(e, t) {
  const n = {}, o = a(e, ["_self"]);
  return o != null && l(n, ["video"], ES(o)), n;
}
function $T(e, t) {
  const n = {}, o = a(e, ["modelSelectionConfig"]);
  o != null && l(n, ["modelConfig"], o);
  const r = a(e, ["responseJsonSchema"]);
  r != null && l(n, ["responseJsonSchema"], r);
  const i = a(e, ["audioTimestamp"]);
  i != null && l(n, ["audioTimestamp"], i);
  const s = a(e, ["candidateCount"]);
  s != null && l(n, ["candidateCount"], s);
  const u = a(e, ["enableAffectiveDialog"]);
  u != null && l(n, ["enableAffectiveDialog"], u);
  const c = a(e, ["frequencyPenalty"]);
  c != null && l(n, ["frequencyPenalty"], c);
  const d = a(e, ["logprobs"]);
  d != null && l(n, ["logprobs"], d);
  const f = a(e, ["maxOutputTokens"]);
  f != null && l(n, ["maxOutputTokens"], f);
  const h = a(e, ["mediaResolution"]);
  h != null && l(n, ["mediaResolution"], h);
  const p = a(e, ["presencePenalty"]);
  p != null && l(n, ["presencePenalty"], p);
  const m = a(e, ["responseLogprobs"]);
  m != null && l(n, ["responseLogprobs"], m);
  const g = a(e, ["responseMimeType"]);
  g != null && l(n, ["responseMimeType"], g);
  const _ = a(e, ["responseModalities"]);
  _ != null && l(n, ["responseModalities"], _);
  const y = a(e, ["responseSchema"]);
  y != null && l(n, ["responseSchema"], y);
  const T = a(e, ["routingConfig"]);
  T != null && l(n, ["routingConfig"], T);
  const E = a(e, ["seed"]);
  E != null && l(n, ["seed"], E);
  const C = a(e, ["speechConfig"]);
  C != null && l(n, ["speechConfig"], C);
  const b = a(e, ["stopSequences"]);
  b != null && l(n, ["stopSequences"], b);
  const k = a(e, ["temperature"]);
  k != null && l(n, ["temperature"], k);
  const w = a(e, ["thinkingConfig"]);
  w != null && l(n, ["thinkingConfig"], w);
  const D = a(e, ["topK"]);
  D != null && l(n, ["topK"], D);
  const I = a(e, ["topP"]);
  if (I != null && l(n, ["topP"], I), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function LT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], K(e, r)), o;
}
function UT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], K(e, r)), o;
}
function FT(e, t) {
  const n = {}, o = a(e, ["authConfig"]);
  o != null && l(n, ["authConfig"], DA(o));
  const r = a(e, ["enableWidget"]);
  return r != null && l(n, ["enableWidget"], r), n;
}
function OT(e, t) {
  const n = {}, o = a(e, ["searchTypes"]);
  if (o != null && l(n, ["searchTypes"], o), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(n, ["timeRangeFilter"], r), n;
}
function GT(e, t) {
  const n = {}, o = a(e, ["aspectRatio"]);
  o != null && l(n, ["aspectRatio"], o);
  const r = a(e, ["imageSize"]);
  if (r != null && l(n, ["imageSize"], r), a(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (a(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (a(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (a(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (a(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return n;
}
function BT(e, t) {
  const n = {}, o = a(e, ["aspectRatio"]);
  o != null && l(n, ["aspectRatio"], o);
  const r = a(e, ["imageSize"]);
  r != null && l(n, ["imageSize"], r);
  const i = a(e, ["personGeneration"]);
  i != null && l(n, ["personGeneration"], i);
  const s = a(e, ["prominentPeople"]);
  s != null && l(n, ["prominentPeople"], s);
  const u = a(e, ["outputMimeType"]);
  u != null && l(n, ["imageOutputOptions", "mimeType"], u);
  const c = a(e, ["outputCompressionQuality"]);
  c != null && l(n, ["imageOutputOptions", "compressionQuality"], c);
  const d = a(e, ["imageOutputOptions"]);
  return d != null && l(n, ["imageOutputOptions"], d), n;
}
function qT(e, t) {
  const n = {}, o = a(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], Ct(o));
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function Gf(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = a(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], Ct(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Jr(e, t) {
  const n = {};
  if (a(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const o = a(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], Ct(o));
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function Ke(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = a(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], Ct(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function HT(e, t, n, o) {
  const r = {}, i = a(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], Nf(e, c)), r;
}
function VT(e, t, n, o) {
  const r = {}, i = a(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], Nf(e, c)), r;
}
function JT(e, t, n) {
  const o = {}, r = a(t, ["config"]);
  return r != null && HT(e, r, o), o;
}
function KT(e, t, n) {
  const o = {}, r = a(t, ["config"]);
  return r != null && VT(e, r, o), o;
}
function WT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["_self"]);
  if (i != null) {
    let s = xf(i);
    Array.isArray(s) && (s = s.map((u) => Zi(u))), l(n, ["models"], s);
  }
  return n;
}
function zT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["_self"]);
  if (i != null) {
    let s = xf(i);
    Array.isArray(s) && (s = s.map((u) => ji(u))), l(n, ["models"], s);
  }
  return n;
}
function YT(e, t) {
  const n = {}, o = a(e, ["maskMode"]);
  o != null && l(n, ["maskMode"], o);
  const r = a(e, ["segmentationClasses"]);
  r != null && l(n, ["maskClasses"], r);
  const i = a(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function Zi(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["displayName"]);
  r != null && l(n, ["displayName"], r);
  const i = a(e, ["description"]);
  i != null && l(n, ["description"], i);
  const s = a(e, ["version"]);
  s != null && l(n, ["version"], s);
  const u = a(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], hS(u));
  const c = a(e, ["inputTokenLimit"]);
  c != null && l(n, ["inputTokenLimit"], c);
  const d = a(e, ["outputTokenLimit"]);
  d != null && l(n, ["outputTokenLimit"], d);
  const f = a(e, ["supportedGenerationMethods"]);
  f != null && l(n, ["supportedActions"], f);
  const h = a(e, ["temperature"]);
  h != null && l(n, ["temperature"], h);
  const p = a(e, ["maxTemperature"]);
  p != null && l(n, ["maxTemperature"], p);
  const m = a(e, ["topP"]);
  m != null && l(n, ["topP"], m);
  const g = a(e, ["topK"]);
  g != null && l(n, ["topK"], g);
  const _ = a(e, ["thinking"]);
  return _ != null && l(n, ["thinking"], _), n;
}
function ji(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["displayName"]);
  r != null && l(n, ["displayName"], r);
  const i = a(e, ["description"]);
  i != null && l(n, ["description"], i);
  const s = a(e, ["versionId"]);
  s != null && l(n, ["version"], s);
  const u = a(e, ["deployedModels"]);
  if (u != null) {
    let p = u;
    Array.isArray(p) && (p = p.map((m) => lT(m))), l(n, ["endpoints"], p);
  }
  const c = a(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = a(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], pS(d));
  const f = a(e, ["defaultCheckpointId"]);
  f != null && l(n, ["defaultCheckpointId"], f);
  const h = a(e, ["checkpoints"]);
  if (h != null) {
    let p = h;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function XT(e, t) {
  const n = {}, o = a(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(n, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const s = a(e, ["fileData"]);
  s != null && l(n, ["fileData"], uT(s));
  const u = a(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], cT(u));
  const c = a(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = a(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], $A(d));
  const f = a(e, ["text"]);
  f != null && l(n, ["text"], f);
  const h = a(e, ["thought"]);
  h != null && l(n, ["thought"], h);
  const p = a(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = a(e, ["videoMetadata"]);
  m != null && l(n, ["videoMetadata"], m);
  const g = a(e, ["toolCall"]);
  g != null && l(n, ["toolCall"], g);
  const _ = a(e, ["toolResponse"]);
  _ != null && l(n, ["toolResponse"], _);
  const y = a(e, ["partMetadata"]);
  return y != null && l(n, ["partMetadata"], y), n;
}
function QT(e, t) {
  const n = {}, o = a(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(n, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const s = a(e, ["fileData"]);
  s != null && l(n, ["fileData"], s);
  const u = a(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], u);
  const c = a(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = a(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], d);
  const f = a(e, ["text"]);
  f != null && l(n, ["text"], f);
  const h = a(e, ["thought"]);
  h != null && l(n, ["thought"], h);
  const p = a(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = a(e, ["videoMetadata"]);
  if (m != null && l(n, ["videoMetadata"], m), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return n;
}
function ZT(e, t) {
  const n = {}, o = a(e, ["productImage"]);
  return o != null && l(n, ["image"], Ke(o)), n;
}
function jT(e, t, n) {
  const o = {}, r = a(e, ["numberOfImages"]);
  t !== void 0 && r != null && l(t, ["parameters", "sampleCount"], r);
  const i = a(e, ["baseSteps"]);
  t !== void 0 && i != null && l(t, ["parameters", "baseSteps"], i);
  const s = a(e, ["outputGcsUri"]);
  t !== void 0 && s != null && l(t, ["parameters", "storageUri"], s);
  const u = a(e, ["seed"]);
  t !== void 0 && u != null && l(t, ["parameters", "seed"], u);
  const c = a(e, ["safetyFilterLevel"]);
  t !== void 0 && c != null && l(t, ["parameters", "safetySetting"], c);
  const d = a(e, ["personGeneration"]);
  t !== void 0 && d != null && l(t, ["parameters", "personGeneration"], d);
  const f = a(e, ["addWatermark"]);
  t !== void 0 && f != null && l(t, ["parameters", "addWatermark"], f);
  const h = a(e, ["outputMimeType"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], h);
  const p = a(e, ["outputCompressionQuality"]);
  t !== void 0 && p != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], p);
  const m = a(e, ["enhancePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "enhancePrompt"], m);
  const g = a(e, ["labels"]);
  return t !== void 0 && g != null && l(t, ["labels"], g), o;
}
function eS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["source"]);
  i != null && nS(i, o);
  const s = a(t, ["config"]);
  return s != null && jT(s, o), o;
}
function tS(e, t) {
  const n = {}, o = a(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => Vr(i))), l(n, ["generatedImages"], r);
  }
  return n;
}
function nS(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], Ke(i));
  const s = a(e, ["productImages"]);
  if (t !== void 0 && s != null) {
    let u = s;
    Array.isArray(u) && (u = u.map((c) => ZT(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return o;
}
function oS(e, t) {
  const n = {}, o = a(e, ["referenceImage"]);
  o != null && l(n, ["referenceImage"], Ke(o));
  const r = a(e, ["referenceId"]);
  r != null && l(n, ["referenceId"], r);
  const i = a(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const s = a(e, ["maskImageConfig"]);
  s != null && l(n, ["maskImageConfig"], YT(s));
  const u = a(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], qA(u));
  const c = a(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = a(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function Bf(e, t) {
  const n = {}, o = a(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = a(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = a(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function qf(e, t) {
  const n = {}, o = a(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = a(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = a(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function rS(e, t) {
  const n = {}, o = a(e, ["category"]);
  if (o != null && l(n, ["category"], o), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(n, ["threshold"], r), n;
}
function iS(e, t) {
  const n = {}, o = a(e, ["image"]);
  return o != null && l(n, ["image"], Ke(o)), n;
}
function sS(e, t, n) {
  const o = {}, r = a(e, ["mode"]);
  t !== void 0 && r != null && l(t, ["parameters", "mode"], r);
  const i = a(e, ["maxPredictions"]);
  t !== void 0 && i != null && l(t, ["parameters", "maxPredictions"], i);
  const s = a(e, ["confidenceThreshold"]);
  t !== void 0 && s != null && l(t, ["parameters", "confidenceThreshold"], s);
  const u = a(e, ["maskDilation"]);
  t !== void 0 && u != null && l(t, ["parameters", "maskDilation"], u);
  const c = a(e, ["binaryColorThreshold"]);
  t !== void 0 && c != null && l(t, ["parameters", "binaryColorThreshold"], c);
  const d = a(e, ["labels"]);
  return t !== void 0 && d != null && l(t, ["labels"], d), o;
}
function aS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["source"]);
  i != null && uS(i, o);
  const s = a(t, ["config"]);
  return s != null && sS(s, o), o;
}
function lS(e, t) {
  const n = {}, o = a(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => xT(i))), l(n, ["generatedMasks"], r);
  }
  return n;
}
function uS(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Ke(i));
  const s = a(e, ["scribbleImage"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "scribble"], iS(s)), o;
}
function cS(e, t) {
  const n = {}, o = a(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = a(e, ["functionCallingConfig"]);
  r != null && l(n, ["functionCallingConfig"], dT(r));
  const i = a(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function dS(e, t) {
  const n = {}, o = a(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = a(e, ["functionCallingConfig"]);
  if (r != null && l(n, ["functionCallingConfig"], r), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function fS(e, t) {
  const n = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = a(e, ["computerUse"]);
  o != null && l(n, ["computerUse"], o);
  const r = a(e, ["fileSearch"]);
  r != null && l(n, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], OT(i));
  const s = a(e, ["googleMaps"]);
  s != null && l(n, ["googleMaps"], FT(s));
  const u = a(e, ["codeExecution"]);
  if (u != null && l(n, ["codeExecution"], u), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = a(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  if (d != null && l(n, ["googleSearchRetrieval"], d), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const f = a(e, ["urlContext"]);
  f != null && l(n, ["urlContext"], f);
  const h = a(e, ["mcpServers"]);
  if (h != null) {
    let p = h;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["mcpServers"], p);
  }
  return n;
}
function Hf(e, t) {
  const n = {}, o = a(e, ["retrieval"]);
  o != null && l(n, ["retrieval"], o);
  const r = a(e, ["computerUse"]);
  if (r != null && l(n, ["computerUse"], r), a(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const i = a(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], i);
  const s = a(e, ["googleMaps"]);
  s != null && l(n, ["googleMaps"], s);
  const u = a(e, ["codeExecution"]);
  u != null && l(n, ["codeExecution"], u);
  const c = a(e, ["enterpriseWebSearch"]);
  c != null && l(n, ["enterpriseWebSearch"], c);
  const d = a(e, ["functionDeclarations"]);
  if (d != null) {
    let m = d;
    Array.isArray(m) && (m = m.map((g) => fT(g))), l(n, ["functionDeclarations"], m);
  }
  const f = a(e, ["googleSearchRetrieval"]);
  f != null && l(n, ["googleSearchRetrieval"], f);
  const h = a(e, ["parallelAiSearch"]);
  h != null && l(n, ["parallelAiSearch"], h);
  const p = a(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function hS(e, t) {
  const n = {}, o = a(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = a(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function pS(e, t) {
  const n = {}, o = a(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = a(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function mS(e, t, n) {
  const o = {}, r = a(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = a(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), o;
}
function gS(e, t, n) {
  const o = {}, r = a(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = a(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), o;
}
function _S(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "name"], K(e, r));
  const i = a(t, ["config"]);
  return i != null && mS(i, o), o;
}
function yS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["config"]);
  return i != null && gS(i, o), o;
}
function vS(e, t, n) {
  const o = {}, r = a(e, ["outputGcsUri"]);
  t !== void 0 && r != null && l(t, ["parameters", "storageUri"], r);
  const i = a(e, ["safetyFilterLevel"]);
  t !== void 0 && i != null && l(t, ["parameters", "safetySetting"], i);
  const s = a(e, ["personGeneration"]);
  t !== void 0 && s != null && l(t, ["parameters", "personGeneration"], s);
  const u = a(e, ["includeRaiReason"]);
  t !== void 0 && u != null && l(t, ["parameters", "includeRaiReason"], u);
  const c = a(e, ["outputMimeType"]);
  t !== void 0 && c != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], c);
  const d = a(e, ["outputCompressionQuality"]);
  t !== void 0 && d != null && l(t, [
    "parameters",
    "outputOptions",
    "compressionQuality"
  ], d);
  const f = a(e, ["enhanceInputImage"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "upscaleConfig",
    "enhanceInputImage"
  ], f);
  const h = a(e, ["imagePreservationFactor"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "upscaleConfig",
    "imagePreservationFactor"
  ], h);
  const p = a(e, ["labels"]);
  t !== void 0 && p != null && l(t, ["labels"], p);
  const m = a(e, ["numberOfImages"]);
  t !== void 0 && m != null && l(t, ["parameters", "sampleCount"], m);
  const g = a(e, ["mode"]);
  return t !== void 0 && g != null && l(t, ["parameters", "mode"], g), o;
}
function AS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["image"]);
  i != null && l(o, ["instances[0]", "image"], Ke(i));
  const s = a(t, ["upscaleFactor"]);
  s != null && l(o, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], s);
  const u = a(t, ["config"]);
  return u != null && vS(u, o), o;
}
function TS(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => Vr(s))), l(n, ["generatedImages"], i);
  }
  return n;
}
function SS(e, t) {
  const n = {}, o = a(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = a(e, ["encodedVideo"]);
  r != null && l(n, ["videoBytes"], Ct(r));
  const i = a(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function ES(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["uri"], o);
  const r = a(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["videoBytes"], Ct(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function CS(e, t) {
  const n = {}, o = a(e, ["image"]);
  o != null && l(n, ["_self"], Ke(o));
  const r = a(e, ["maskMode"]);
  return r != null && l(n, ["maskMode"], r), n;
}
function wS(e, t) {
  const n = {}, o = a(e, ["image"]);
  o != null && l(n, ["image"], Jr(o));
  const r = a(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function IS(e, t) {
  const n = {}, o = a(e, ["image"]);
  o != null && l(n, ["image"], Ke(o));
  const r = a(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function Vf(e, t) {
  const n = {}, o = a(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = a(e, ["videoBytes"]);
  r != null && l(n, ["encodedVideo"], Ct(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function Jf(e, t) {
  const n = {}, o = a(e, ["uri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = a(e, ["videoBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], Ct(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function bS(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["displayName"], o), n;
}
function RS(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && bS(n, t), t;
}
function PS(e, t) {
  const n = {}, o = a(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function MS(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = a(e, ["config"]);
  return o != null && PS(o, t), t;
}
function NS(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function xS(e, t) {
  const n = {}, o = a(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["customMetadata"], i);
  }
  const r = a(e, ["chunkingConfig"]);
  return t !== void 0 && r != null && l(t, ["chunkingConfig"], r), n;
}
function kS(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], $S(s)), t;
}
function DS(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = a(e, ["fileName"]);
  o != null && l(t, ["fileName"], o);
  const r = a(e, ["config"]);
  return r != null && xS(r, t), t;
}
function $S(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = a(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function LS(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function US(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && LS(n, t), t;
}
function FS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = a(e, ["fileSearchStores"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["fileSearchStores"], i);
  }
  return t;
}
function Kf(e, t) {
  const n = {}, o = a(e, ["mimeType"]);
  t !== void 0 && o != null && l(t, ["mimeType"], o);
  const r = a(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = a(e, ["customMetadata"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => c)), l(t, ["customMetadata"], u);
  }
  const s = a(e, ["chunkingConfig"]);
  return t !== void 0 && s != null && l(t, ["chunkingConfig"], s), n;
}
function OS(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = a(e, ["config"]);
  return o != null && Kf(o, t), t;
}
function GS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var BS = "Content-Type", qS = "X-Server-Timeout", HS = "User-Agent", es = "x-goog-api-client", VS = "google-genai-sdk/1.50.1", JS = "v1beta1", KS = "v1beta", WS = /* @__PURE__ */ new Set(["us", "eu"]), zS = 5, YS = [
  408,
  429,
  500,
  502,
  503,
  504
], XS = class {
  constructor(e) {
    var t, n, o;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const r = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (r.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? r.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && WS.has(this.clientOptions.location) ? r.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (r.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), r.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : JS;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), r.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : KS, r.baseUrl = "https://generativelanguage.googleapis.com/";
    r.headers = this.getDefaultHeaders(), this.clientOptions.httpOptions = r, e.httpOptions && (this.clientOptions.httpOptions = this.patchHttpOptions(r, e.httpOptions));
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
    return !(t.baseUrl && t.baseUrlResourceScope === zi.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
  }
  async request(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), o = this.constructUrl(e.path, t, n);
    if (e.queryParams) for (const [i, s] of Object.entries(e.queryParams)) o.searchParams.append(i, String(s));
    let r = {};
    if (e.httpMethod === "GET") {
      if (e.body && e.body !== "{}") throw new Error("Request body should be empty for GET request, but got non empty request body");
    } else r.body = e.body;
    return r = await this.includeExtraHttpOptionsToRequestInit(r, t, o.toString(), e.abortSignal), this.unaryApiCall(o, r, e.httpMethod);
  }
  patchHttpOptions(e, t) {
    const n = JSON.parse(JSON.stringify(e));
    for (const [o, r] of Object.entries(t)) typeof r == "object" ? n[o] = Object.assign(Object.assign({}, n[o]), r) : r !== void 0 && (n[o] = r);
    return n;
  }
  async requestStream(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), o = this.constructUrl(e.path, t, n);
    (!o.searchParams.has("alt") || o.searchParams.get("alt") !== "sse") && o.searchParams.set("alt", "sse");
    let r = {};
    return r.body = e.body, r = await this.includeExtraHttpOptionsToRequestInit(r, t, o.toString(), e.abortSignal), this.streamApiCall(o, r, e.httpMethod);
  }
  async includeExtraHttpOptionsToRequestInit(e, t, n, o) {
    if (t && t.timeout || o) {
      const r = new AbortController(), i = r.signal;
      if (t.timeout && t?.timeout > 0) {
        const s = setTimeout(() => r.abort(), t.timeout);
        s && typeof s.unref == "function" && s.unref();
      }
      o && o.addEventListener("abort", () => {
        r.abort();
      }), e.signal = i;
    }
    return t && t.extraBody !== null && QS(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Xu(o), new Yi(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Xu(o), this.processStreamResponse(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  processStreamResponse(e) {
    return Ve(this, arguments, function* () {
      var n;
      const o = (n = e?.body) === null || n === void 0 ? void 0 : n.getReader(), r = new TextDecoder("utf-8");
      if (!o) throw new Error("Response body is empty");
      try {
        let i = "";
        const s = "data:", u = [
          `

`,
          "\r\r",
          `\r
\r
`
        ];
        for (; ; ) {
          const { done: c, value: d } = yield q(o.read());
          if (c) {
            if (i.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const f = r.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(f);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, y = g.code, T = `got status: ${_}. ${JSON.stringify(m)}`;
              if (y >= 400 && y < 600) throw new Ff({
                message: T,
                status: y
              });
            }
          } catch (m) {
            if (m.name === "ApiError") throw m;
          }
          i += f;
          let h = -1, p = 0;
          for (; ; ) {
            h = -1, p = 0;
            for (const _ of u) {
              const y = i.indexOf(_);
              y !== -1 && (h === -1 || y < h) && (h = y, p = _.length);
            }
            if (h === -1) break;
            const m = i.substring(0, h);
            i = i.substring(h + p);
            const g = m.trim();
            if (g.startsWith(s)) {
              const _ = g.substring(5).trim();
              try {
                yield yield q(new Yi(new Response(_, {
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
        o.releaseLock();
      }
    });
  }
  async apiCall(e, t) {
    var n;
    if (!this.clientOptions.httpOptions || !this.clientOptions.httpOptions.retryOptions) return fetch(e, t);
    const o = this.clientOptions.httpOptions.retryOptions, r = async () => {
      const i = await fetch(e, t);
      if (i.ok) return i;
      throw YS.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new Sl.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, Sl.default)(r, { retries: ((n = o.attempts) !== null && n !== void 0 ? n : zS) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = VS + " " + this.clientOptions.userAgentExtra;
    return e[HS] = t, e[es] = t, e[BS] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [o, r] of Object.entries(e.headers)) n.append(o, r);
      e.timeout && e.timeout > 0 && n.append(qS, String(Math.ceil(e.timeout / 1e3)));
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
    const r = this.clientOptions.uploader, i = await r.stat(e);
    o.sizeBytes = String(i.size);
    const s = (n = t?.mimeType) !== null && n !== void 0 ? n : i.type;
    if (s === void 0 || s === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    o.mimeType = s;
    const u = { file: o }, c = this.getFileName(e), d = N("upload/v1beta/files", u._url), f = await this.fetchUploadUrl(d, o.sizeBytes, o.mimeType, c, u, t?.httpOptions);
    return r.upload(e, f, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var o;
    const r = this.clientOptions.uploader, i = await r.stat(t), s = String(i.size), u = (o = n?.mimeType) !== null && o !== void 0 ? o : i.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), f = {};
    n != null && Kf(n, f);
    const h = await this.fetchUploadUrl(c, s, u, d, f, n?.httpOptions);
    return r.uploadToFileSearchStore(t, h, this);
  }
  async downloadFile(e) {
    await this.clientOptions.downloader.download(e, this);
  }
  async fetchUploadUrl(e, t, n, o, r, i) {
    var s;
    let u = {};
    i ? u = i : u = {
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
      body: JSON.stringify(r),
      httpMethod: "POST",
      httpOptions: u
    });
    if (!c || !c?.headers) throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
    const d = (s = c?.headers) === null || s === void 0 ? void 0 : s["x-goog-upload-url"];
    if (d === void 0) throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
    return d;
  }
};
async function Xu(e) {
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
    const r = JSON.stringify(o);
    throw n >= 400 && n < 600 ? new Ff({
      message: r,
      status: n
    }) : new Error(r);
  }
}
function QS(e, t) {
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
  function o(i, s) {
    const u = Object.assign({}, i);
    for (const c in s) if (Object.prototype.hasOwnProperty.call(s, c)) {
      const d = s[c], f = u[c];
      d && typeof d == "object" && !Array.isArray(d) && f && typeof f == "object" && !Array.isArray(f) ? u[c] = o(f, d) : (f && d && typeof f != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof f}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const r = o(n, t);
  e.body = JSON.stringify(r);
}
var ZS = "mcp_used/unknown", jS = !1;
function Wf(e) {
  for (const t of e)
    if (eE(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return jS;
}
function zf(e) {
  var t;
  e[es] = (((t = e[es]) !== null && t !== void 0 ? t : "") + ` ${ZS}`).trimStart();
}
function eE(e) {
  return e !== null && typeof e == "object" && e instanceof nE;
}
function tE(e) {
  return Ve(this, arguments, function* (n, o = 100) {
    let r, i = 0;
    for (; i < o; ) {
      const s = yield q(n.listTools({ cursor: r }));
      for (const u of s.tools)
        yield yield q(u), i++;
      if (!s.nextCursor) break;
      r = s.nextCursor;
    }
  });
}
var nE = class Yf {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Yf(t, n);
  }
  async initialize() {
    var t, n, o, r;
    if (this.mcpTools.length > 0) return;
    const i = {}, s = [];
    for (const f of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, Je(tE(f))), d; d = await c.next(), t = d.done, !t; u = !0) {
        r = d.value, u = !1;
        const h = r;
        s.push(h);
        const p = h.name;
        if (i[p]) throw new Error(`Duplicate function name ${p} found in MCP tools. Please ensure function names are unique.`);
        i[p] = f;
      }
    } catch (h) {
      n = { error: h };
    } finally {
      try {
        !u && !t && (o = c.return) && await o.call(c);
      } finally {
        if (n) throw n.error;
      }
    }
    this.mcpTools = s, this.functionNameToMcpClient = i;
  }
  async tool() {
    return await this.initialize(), gy(this.mcpTools, this.config);
  }
  async callTool(t) {
    await this.initialize();
    const n = [];
    for (const o of t) if (o.name in this.functionNameToMcpClient) {
      const r = this.functionNameToMcpClient[o.name];
      let i;
      this.config.timeout && (i = { timeout: this.config.timeout });
      const s = await r.callTool({
        name: o.name,
        arguments: o.args
      }, void 0, i);
      n.push({ functionResponse: {
        name: o.name,
        response: s.isError ? { error: s } : s
      } });
    }
    return n;
  }
};
async function oE(e, t, n) {
  const o = new ay();
  let r;
  n.data instanceof Blob ? r = JSON.parse(await n.data.text()) : r = JSON.parse(n.data), Object.assign(o, r), t(o);
}
var rE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const o = this.apiClient.getWebsocketBaseUrl(), r = this.apiClient.getApiVersion(), i = aE(this.apiClient.getDefaultHeaders()), s = `${o}/ws/google.ai.generativelanguage.${r}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, f = function() {
      u({});
    }, h = this.apiClient, p = {
      onopen: f,
      onmessage: (_) => {
        oE(h, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(s, sE(i), p);
    m.connect(), await c;
    const g = { setup: { model: K(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new iE(m, this.apiClient);
  }
}, iE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = SA(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = TA(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(tn.PLAY);
  }
  pause() {
    this.sendPlaybackControl(tn.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(tn.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(tn.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function sE(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function aE(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var lE = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function uE(e, t, n) {
  const o = new sy();
  let r;
  n.data instanceof Blob ? r = await n.data.text() : n.data instanceof ArrayBuffer ? r = new TextDecoder().decode(n.data) : r = n.data;
  const i = JSON.parse(r);
  if (e.isVertexAI()) {
    const s = wA(i);
    Object.assign(o, s);
  } else Object.assign(o, i);
  t(o);
}
var cE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new rE(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, o, r, i, s;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const f = this.apiClient.getHeaders();
    e.config && e.config.tools && Wf(e.config.tools) && zf(f);
    const h = pE(f);
    if (this.apiClient.isVertexAI()) {
      const I = this.apiClient.getProject(), x = this.apiClient.getLocation(), R = this.apiClient.getApiKey(), F = !!I && !!x || !!R;
      this.apiClient.getCustomBaseUrl() && !F ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(h, d));
    } else {
      const I = this.apiClient.getApiKey();
      let x = "BidiGenerateContent", R = "key";
      I?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), x = "BidiGenerateContentConstrained", R = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${x}?${R}=${I}`;
    }
    let p = () => {
    };
    const m = new Promise((I) => {
      p = I;
    }), g = e.callbacks, _ = function() {
      var I;
      (I = g?.onopen) === null || I === void 0 || I.call(g), p({});
    }, y = this.apiClient, T = {
      onopen: _,
      onmessage: (I) => {
        uE(y, g.onmessage, I);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(I) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(I) {
      }
    }, E = this.webSocketFactory.create(d, hE(h), T);
    E.connect(), await m;
    let C = K(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && C.startsWith("publishers/")) {
      const I = this.apiClient.getProject(), x = this.apiClient.getLocation();
      I && x && (C = `projects/${I}/locations/${x}/` + C);
    }
    let b = {};
    this.apiClient.isVertexAI() && ((o = e.config) === null || o === void 0 ? void 0 : o.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [Tr.AUDIO] } : e.config.responseModalities = [Tr.AUDIO]), !((r = e.config) === null || r === void 0) && r.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const k = (s = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && s !== void 0 ? s : [], w = [];
    for (const I of k) if (this.isCallableTool(I)) {
      const x = I;
      w.push(await x.tool());
    } else w.push(I);
    w.length > 0 && (e.config.tools = w);
    const D = {
      model: C,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? b = AA(this.apiClient, D) : b = vA(this.apiClient, D), delete b.config, E.send(JSON.stringify(b)), new fE(E, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, dE = { turnComplete: !0 }, fE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = ve(t.turns), e.isVertexAI() || (n = n.map((o) => To(o)));
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
      if (!e.isVertexAI() && !("id" in o)) throw new Error(lE);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, dE), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: CA(e) } : t = { realtimeInput: EA(e) }, this.conn.send(JSON.stringify(t));
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
function hE(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function pE(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var Qu = 10;
function Zu(e) {
  var t, n, o;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let r = !1;
  for (const s of (n = e?.tools) !== null && n !== void 0 ? n : []) if (cn(s)) {
    r = !0;
    break;
  }
  if (!r) return !0;
  const i = (o = e?.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function cn(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function mE(e) {
  var t, n, o;
  return (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((r) => cn(r))) !== null && o !== void 0 ? o : !1;
}
function ju(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((o, r) => {
    if (cn(o)) return;
    const i = o;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(r);
  }), n;
}
function ec(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var gE = class extends ut {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = ve(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = ve(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const o = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: Sr.EMBED_CONTENT
        });
        return await this.embedContentInternal(o);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: Sr.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, o, r, i, s;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !mE(t) || Zu(t.config)) return await this.generateContentInternal(u);
      const c = ju(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, f;
      const h = ve(u.contents), p = (r = (o = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && r !== void 0 ? r : Qu;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const y of (s = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && s !== void 0 ? s : []) if (cn(y)) {
          const T = await y.callTool(d.functionCalls);
          _.push(...T);
        }
        m++, f = {
          role: "user",
          parts: _
        }, u.contents = ve(u.contents), u.contents.push(g), u.contents.push(f), ec(u.config) && (h.push(g), h.push(f));
      }
      return ec(u.config) && (d.automaticFunctionCallingHistory = h), d;
    }, this.generateContentStream = async (t) => {
      var n, o, r, i, s;
      if (this.maybeMoveToResponseJsonSchem(t), Zu(t.config)) {
        const f = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(f);
      }
      const u = ju(t);
      if (u.length > 0) {
        const f = u.map((h) => `tools[${h}]`).join(", ");
        throw new Error(`Incompatible tools found at ${f}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
      }
      const c = (r = (o = (n = t?.config) === null || n === void 0 ? void 0 : n.toolConfig) === null || o === void 0 ? void 0 : o.functionCallingConfig) === null || r === void 0 ? void 0 : r.streamFunctionCallArguments, d = (s = (i = t?.config) === null || i === void 0 ? void 0 : i.automaticFunctionCalling) === null || s === void 0 ? void 0 : s.disable;
      if (c && !d) throw new Error("Running in streaming mode with 'streamFunctionCallArguments' enabled, this feature is not compatible with automatic function calling (AFC). Please set 'config.automaticFunctionCalling.disable' to true to disable AFC or leave 'config.toolConfig.functionCallingConfig.streamFunctionCallArguments' to be undefined or set to false to disable streaming function call arguments feature.");
      return await this.processAfcStream(t);
    }, this.generateImages = async (t) => await this.generateImagesInternal(t).then((n) => {
      var o;
      let r;
      const i = [];
      if (n?.generatedImages) for (const u of n.generatedImages) u && u?.safetyAttributes && ((o = u?.safetyAttributes) === null || o === void 0 ? void 0 : o.contentType) === "Positive Prompt" ? r = u?.safetyAttributes : i.push(u);
      let s;
      return r ? s = {
        generatedImages: i,
        positivePromptSafetyAttributes: r,
        sdkHttpResponse: n.sdkHttpResponse
      } : s = {
        generatedImages: i,
        sdkHttpResponse: n.sdkHttpResponse
      }, s;
    }), this.list = async (t) => {
      var n;
      const o = { config: Object.assign(Object.assign({}, { queryBase: !0 }), t?.config) };
      if (this.apiClient.isVertexAI() && !o.config.queryBase) {
        if (!((n = o.config) === null || n === void 0) && n.filter) throw new Error("Filtering tuned models list for Vertex AI is not currently supported");
        o.config.filter = "labels.tune-type:*";
      }
      return new Gt(lt.PAGED_ITEM_MODELS, (r) => this.listInternal(r), await this.listInternal(o), o);
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
      var n, o, r, i, s, u;
      if ((t.prompt || t.image || t.video) && t.source) throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      return this.apiClient.isVertexAI() || (!((n = t.video) === null || n === void 0) && n.uri && (!((o = t.video) === null || o === void 0) && o.videoBytes) ? t.video = {
        uri: t.video.uri,
        mimeType: t.video.mimeType
      } : !((i = (r = t.source) === null || r === void 0 ? void 0 : r.video) === null || i === void 0) && i.uri && (!((u = (s = t.source) === null || s === void 0 ? void 0 : s.video) === null || u === void 0) && u.videoBytes) && (t.source.video = {
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
    const r = (t = e.config) === null || t === void 0 ? void 0 : t.tools;
    if (!r) return e;
    const i = await Promise.all(r.map(async (u) => cn(u) ? await u.tool() : u)), s = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (s.config.tools = i, e.config && e.config.tools && Wf(e.config.tools)) {
      const u = (o = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && o !== void 0 ? o : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), zf(c), s.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return s;
  }
  async initAfcToolsMap(e) {
    var t, n, o;
    const r = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (cn(i)) {
      const s = i, u = await s.tool();
      for (const c of (o = u.functionDeclarations) !== null && o !== void 0 ? o : []) {
        if (!c.name) throw new Error("Function declaration name is required.");
        if (r.has(c.name)) throw new Error(`Duplicate tool declaration name: ${c.name}`);
        r.set(c.name, s);
      }
    }
    return r;
  }
  async processAfcStream(e) {
    var t, n, o;
    const r = (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && o !== void 0 ? o : Qu;
    let i = !1, s = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, f) {
      return Ve(this, arguments, function* () {
        for (var h, p, m, g, _, y; s < r; ) {
          i && (s++, i = !1);
          const b = yield q(c.processParamsMaybeAddMcpUsage(f)), k = yield q(c.generateContentStreamInternal(b)), w = [], D = [];
          try {
            for (var T = !0, E = (p = void 0, Je(k)), C; C = yield q(E.next()), h = C.done, !h; T = !0) {
              g = C.value, T = !1;
              const I = g;
              if (yield yield q(I), I.candidates && (!((_ = I.candidates[0]) === null || _ === void 0) && _.content)) {
                D.push(I.candidates[0].content);
                for (const x of (y = I.candidates[0].content.parts) !== null && y !== void 0 ? y : []) if (s < r && x.functionCall) {
                  if (!x.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(x.functionCall.name)) {
                    const R = yield q(d.get(x.functionCall.name).callTool([x.functionCall]));
                    w.push(...R);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${x.functionCall.name}`);
                }
              }
            }
          } catch (I) {
            p = { error: I };
          } finally {
            try {
              !T && !h && (m = E.return) && (yield q(m.call(E)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (w.length > 0) {
            i = !0;
            const I = new $n();
            I.candidates = [{ content: {
              role: "user",
              parts: w
            } }], yield yield q(I);
            const x = [];
            x.push(...D), x.push({
              role: "user",
              parts: w
            }), f.contents = ve(f.contents).concat(x);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Wu(this.apiClient, e);
      return s = N("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = Yu(d), h = new $n();
        return Object.assign(h, f), h;
      });
    } else {
      const c = Ku(this.apiClient, e);
      return s = N("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = zu(d), h = new $n();
        return Object.assign(h, f), h;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Wu(this.apiClient, e);
      return s = N("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return Ve(this, arguments, function* () {
          var f, h, p, m;
          try {
            for (var g = !0, _ = Je(d), y; y = yield q(_.next()), f = y.done, !f; g = !0) {
              m = y.value, g = !1;
              const T = m, E = Yu(yield q(T.json()), e);
              E.sdkHttpResponse = { headers: T.headers };
              const C = new $n();
              Object.assign(C, E), yield yield q(C);
            }
          } catch (T) {
            h = { error: T };
          } finally {
            try {
              !g && !f && (p = _.return) && (yield q(p.call(_)));
            } finally {
              if (h) throw h.error;
            }
          }
        });
      });
    } else {
      const c = Ku(this.apiClient, e);
      return s = N("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }), i.then(function(d) {
        return Ve(this, arguments, function* () {
          var f, h, p, m;
          try {
            for (var g = !0, _ = Je(d), y; y = yield q(_.next()), f = y.done, !f; g = !0) {
              m = y.value, g = !1;
              const T = m, E = zu(yield q(T.json()), e);
              E.sdkHttpResponse = { headers: T.headers };
              const C = new $n();
              Object.assign(C, E), yield yield q(C);
            }
          } catch (T) {
            h = { error: T };
          } finally {
            try {
              !g && !f && (p = _.return) && (yield q(p.call(_)));
            } finally {
              if (h) throw h.error;
            }
          }
        });
      });
    }
  }
  async embedContentInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = iT(this.apiClient, e, e);
      return s = N(yy(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = aT(d, e), h = new Iu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = rT(this.apiClient, e);
      return s = N("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = sT(d), h = new Iu();
        return Object.assign(h, f), h;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = yT(this.apiClient, e);
      return s = N("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = AT(d), h = new bu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = _T(this.apiClient, e);
      return s = N("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = vT(d), h = new bu();
        return Object.assign(h, f), h;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = eT(this.apiClient, e);
      return r = N("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = tT(u), d = new W_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = AS(this.apiClient, e);
      return r = N("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = TS(u), d = new z_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = eS(this.apiClient, e);
      return r = N("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = tS(u), d = new Y_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = aS(this.apiClient, e);
      return r = N("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = lS(u), d = new X_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = UT(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ji(d));
    } else {
      const c = LT(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => Zi(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = KT(this.apiClient, e);
      return s = N("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = zT(d), h = new Ru();
        return Object.assign(h, f), h;
      });
    } else {
      const c = JT(this.apiClient, e);
      return s = N("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = WT(d), h = new Ru();
        return Object.assign(h, f), h;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = yS(this.apiClient, e);
      return s = N("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ji(d));
    } else {
      const c = _S(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => Zi(d));
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = XA(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = ZA(d), h = new Pu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = YA(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = QA(d), h = new Pu();
        return Object.assign(h, f), h;
      });
    }
  }
  async countTokens(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = KA(this.apiClient, e);
      return s = N("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = zA(d), h = new Mu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = JA(this.apiClient, e);
      return s = N("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = WA(d), h = new Mu();
        return Object.assign(h, f), h;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = FA(this.apiClient, e);
      return r = N("{model}:computeTokens", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = OA(u), d = new Q_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = IT(this.apiClient, e);
      return s = N("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const f = CT(d), h = new Nu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = wT(this.apiClient, e);
      return s = N("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const f = ET(d), h = new Nu();
        return Object.assign(h, f), h;
      });
    }
  }
}, _E = class extends ut {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async getVideosOperation(e) {
    const t = e.operation, n = e.config;
    if (t.name === void 0 || t.name === "") throw new Error("Operation name is required.");
    if (this.apiClient.isVertexAI()) {
      const o = t.name.split("/operations/")[0];
      let r;
      n && "httpOptions" in n && (r = n.httpOptions);
      const i = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: o,
        config: { httpOptions: r }
      });
      return t._fromAPIResponse({
        apiResponse: i,
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
      let r;
      n && "httpOptions" in n && (r = n.httpOptions);
      const i = await this.fetchPredictVideosOperationInternal({
        operationName: t.name,
        resourceName: o,
        config: { httpOptions: r }
      });
      return t._fromAPIResponse({
        apiResponse: i,
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
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = B_(e);
      return s = N("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = G_(e);
      return s = N("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i;
    }
  }
  async fetchPredictVideosOperationInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = k_(e);
      return r = N("{resourceName}:fetchPredictOperation", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o;
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
};
function tc(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function yE(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function vE(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function AE(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => PE(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function TE(e, t, n) {
  const o = {}, r = a(t, ["expireTime"]);
  n !== void 0 && r != null && l(n, ["expireTime"], r);
  const i = a(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const s = a(t, ["uses"]);
  n !== void 0 && s != null && l(n, ["uses"], s);
  const u = a(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], RE(e, u));
  const c = a(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), o;
}
function SE(e, t) {
  const n = {}, o = a(t, ["config"]);
  return o != null && l(n, ["config"], TE(e, o, n)), n;
}
function EE(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function CE(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function wE(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], yE(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function IE(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function bE(e, t) {
  const n = {}, o = a(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], o);
  const r = a(e, ["responseModalities"]);
  t !== void 0 && r != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], r);
  const i = a(e, ["temperature"]);
  t !== void 0 && i != null && l(t, [
    "setup",
    "generationConfig",
    "temperature"
  ], i);
  const s = a(e, ["topP"]);
  t !== void 0 && s != null && l(t, [
    "setup",
    "generationConfig",
    "topP"
  ], s);
  const u = a(e, ["topK"]);
  t !== void 0 && u != null && l(t, [
    "setup",
    "generationConfig",
    "topK"
  ], u);
  const c = a(e, ["maxOutputTokens"]);
  t !== void 0 && c != null && l(t, [
    "setup",
    "generationConfig",
    "maxOutputTokens"
  ], c);
  const d = a(e, ["mediaResolution"]);
  t !== void 0 && d != null && l(t, [
    "setup",
    "generationConfig",
    "mediaResolution"
  ], d);
  const f = a(e, ["seed"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], f);
  const h = a(e, ["speechConfig"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], ta(h));
  const p = a(e, ["thinkingConfig"]);
  t !== void 0 && p != null && l(t, [
    "setup",
    "generationConfig",
    "thinkingConfig"
  ], p);
  const m = a(e, ["enableAffectiveDialog"]);
  t !== void 0 && m != null && l(t, [
    "setup",
    "generationConfig",
    "enableAffectiveDialog"
  ], m);
  const g = a(e, ["systemInstruction"]);
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], AE(se(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let I = mn(_);
    Array.isArray(I) && (I = I.map((x) => xE(pn(x)))), l(t, ["setup", "tools"], I);
  }
  const y = a(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], NE(y));
  const T = a(e, ["inputAudioTranscription"]);
  t !== void 0 && T != null && l(t, ["setup", "inputAudioTranscription"], tc(T));
  const E = a(e, ["outputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "outputAudioTranscription"], tc(E));
  const C = a(e, ["realtimeInputConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "realtimeInputConfig"], C);
  const b = a(e, ["contextWindowCompression"]);
  t !== void 0 && b != null && l(t, ["setup", "contextWindowCompression"], b);
  const k = a(e, ["proactivity"]);
  if (t !== void 0 && k != null && l(t, ["setup", "proactivity"], k), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const w = a(e, ["avatarConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "avatarConfig"], w);
  const D = a(e, ["safetySettings"]);
  if (t !== void 0 && D != null) {
    let I = D;
    Array.isArray(I) && (I = I.map((x) => ME(x))), l(t, ["setup", "safetySettings"], I);
  }
  return n;
}
function RE(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["setup", "model"], K(e, o));
  const r = a(t, ["config"]);
  return r != null && l(n, ["config"], bE(r, n)), n;
}
function PE(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], EE(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], CE(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], vE(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const f = a(e, ["thought"]);
  f != null && l(t, ["thought"], f);
  const h = a(e, ["thoughtSignature"]);
  h != null && l(t, ["thoughtSignature"], h);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = a(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function ME(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = a(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function NE(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function xE(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], IE(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], wE(i));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let h = u;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["functionDeclarations"], h);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const f = a(e, ["mcpServers"]);
  if (f != null) {
    let h = f;
    Array.isArray(h) && (h = h.map((p) => p)), l(t, ["mcpServers"], h);
  }
  return t;
}
function kE(e) {
  const t = [];
  for (const n in e) if (Object.prototype.hasOwnProperty.call(e, n)) {
    const o = e[n];
    if (typeof o == "object" && o != null && Object.keys(o).length > 0) {
      const r = Object.keys(o).map((i) => `${n}.${i}`);
      t.push(...r);
    } else t.push(n);
  }
  return t.join(",");
}
function DE(e, t) {
  let n = null;
  const o = e.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const i = o.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else o !== void 0 && delete e.bidiGenerateContentSetup;
  const r = e.fieldMask;
  if (n) {
    const i = kE(n);
    if (Array.isArray(t?.lockAdditionalFields) && t?.lockAdditionalFields.length === 0) i ? e.fieldMask = i : delete e.fieldMask;
    else if (t?.lockAdditionalFields && t.lockAdditionalFields.length > 0 && r !== null && Array.isArray(r) && r.length > 0) {
      const s = [
        "temperature",
        "topK",
        "topP",
        "maxOutputTokens",
        "responseModalities",
        "seed",
        "speechConfig"
      ];
      let u = [];
      r.length > 0 && (u = r.map((d) => s.includes(d) ? `generationConfig.${d}` : d));
      const c = [];
      i && c.push(i), u.length > 0 && c.push(...u), c.length > 0 ? e.fieldMask = c.join(",") : delete e.fieldMask;
    } else delete e.fieldMask;
  } else r !== null && Array.isArray(r) && r.length > 0 ? e.fieldMask = r.join(",") : delete e.fieldMask;
  return e;
}
var $E = class extends ut {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const s = SE(this.apiClient, e);
      r = N("auth_tokens", s._url), i = s._query, delete s.config, delete s._url, delete s._query;
      const u = DE(s, e.config);
      return o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((c) => c.json()), o.then((c) => c);
    }
  }
};
function LE(e, t) {
  const n = {}, o = a(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function UE(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = a(e, ["config"]);
  return o != null && LE(o, t), t;
}
function FE(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function OE(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function GE(e) {
  const t = {}, n = a(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const o = a(e, ["config"]);
  return o != null && OE(o, t), t;
}
function BE(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = a(e, ["documents"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["documents"], i);
  }
  return t;
}
var qE = class extends ut {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Gt(lt.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = FE(e);
      return r = N("{name}", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let o = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const i = UE(e);
      o = N("{name}", i._url), r = i._query, delete i._url, delete i._query, await this.apiClient.request({
        path: o,
        queryParams: r,
        body: JSON.stringify(i),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = GE(e);
      return r = N("{parent}/documents", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = BE(u), d = new Z_();
        return Object.assign(d, c), d;
      });
    }
  }
}, HE = class extends ut {
  constructor(e, t = new qE(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Gt(lt.PAGED_ITEM_FILE_SEARCH_STORES, (o) => this.listInternal(o), await this.listInternal(n), n);
  }
  async uploadToFileSearchStore(e) {
    if (this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support uploading files to a file search store.");
    return this.apiClient.uploadFileToFileSearchStore(e.fileSearchStoreName, e.file, e.config);
  }
  async create(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = RS(e);
      return r = N("fileSearchStores", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = NS(e);
      return r = N("{name}", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => u);
    }
  }
  async delete(e) {
    var t, n;
    let o = "", r = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const i = MS(e);
      o = N("{name}", i._url), r = i._query, delete i._url, delete i._query, await this.apiClient.request({
        path: o,
        queryParams: r,
        body: JSON.stringify(i),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = US(e);
      return r = N("fileSearchStores", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = FS(u), d = new j_();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = OS(e);
      return r = N("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = GS(u), d = new ey();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = DS(e);
      return r = N("{file_search_store_name}:importFile", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = kS(u), d = new ty();
        return Object.assign(d, c), d;
      });
    }
  }
}, Xf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Xf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
}, VE = () => Xf();
function ts(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ns = (e) => {
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
}, ke = class extends Error {
}, $e = class os extends ke {
  constructor(t, n, o, r) {
    super(`${os.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.error = n;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new Kr({
      message: o,
      cause: ns(n)
    });
    const i = n;
    return t === 400 ? new Zf(t, i, o, r) : t === 401 ? new jf(t, i, o, r) : t === 403 ? new eh(t, i, o, r) : t === 404 ? new th(t, i, o, r) : t === 409 ? new nh(t, i, o, r) : t === 422 ? new oh(t, i, o, r) : t === 429 ? new rh(t, i, o, r) : t >= 500 ? new ih(t, i, o, r) : new os(t, i, o, r);
  }
}, rs = class extends $e {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Kr = class extends $e {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Qf = class extends Kr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Zf = class extends $e {
}, jf = class extends $e {
}, eh = class extends $e {
}, th = class extends $e {
}, nh = class extends $e {
}, oh = class extends $e {
}, rh = class extends $e {
}, ih = class extends $e {
}, JE = /^[a-z][a-z0-9+.-]*:/i, KE = (e) => JE.test(e), is = (e) => (is = Array.isArray, is(e)), nc = is;
function oc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function WE(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var zE = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new ke(`${e} must be an integer`);
  if (t < 0) throw new ke(`${e} must be a positive integer`);
  return t;
}, YE = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, XE = (e) => new Promise((t) => setTimeout(t, e));
function QE() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function sh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function ZE(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return sh({
    start() {
    },
    async pull(n) {
      const { done: o, value: r } = await t.next();
      o ? n.close() : n.enqueue(r);
    },
    async cancel() {
      var n;
      await ((n = t.return) === null || n === void 0 ? void 0 : n.call(t));
    }
  });
}
function ah(e) {
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
async function jE(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const o = e.getReader(), r = o.cancel();
  o.releaseLock(), await r;
}
var eC = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function tC(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new ke(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var nC = "0.0.1", lh = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function vi(e, t, n) {
  return lh(), new File(e, t ?? "unknown_file", n);
}
function oC(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var rC = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", uh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", iC = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && uh(e), sC = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function aC(e, t, n) {
  if (lh(), e = await e, iC(e))
    return e instanceof File ? e : vi([await e.arrayBuffer()], e.name);
  if (sC(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), vi(await ss(r), t, n);
  }
  const o = await ss(e);
  if (t || (t = oC(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = Object.assign(Object.assign({}, n), { type: r }));
  }
  return vi(o, t, n);
}
async function ss(e) {
  var t, n, o, r, i;
  let s = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) s.push(e);
  else if (uh(e)) s.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (rC(e)) try {
    for (var u = !0, c = Je(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      r = d.value, u = !1;
      const f = r;
      s.push(...await ss(f));
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
  else {
    const f = (i = e?.constructor) === null || i === void 0 ? void 0 : i.name;
    throw new Error(`Unexpected data type: ${typeof e}${f ? `; constructor: ${f}` : ""}${lC(e)}`);
  }
  return s;
}
function lC(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var na = class {
  constructor(e) {
    this._client = e;
  }
};
na._key = [];
function ch(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var rc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), uC = (e = ch) => (function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], s = n.reduce((f, h, p) => {
    var m, g, _;
    /[?#]/.test(h) && (r = !0);
    const y = o[p];
    let T = (r ? encodeURIComponent : e)("" + y);
    return p !== o.length && (y == null || typeof y == "object" && y.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = y.hasOwnProperty) !== null && m !== void 0 ? m : rc)) !== null && g !== void 0 ? g : rc)) === null || _ === void 0 ? void 0 : _.toString)) && (T = y + "", i.push({
      start: f.length + h.length,
      length: T.length,
      error: `Value of type ${Object.prototype.toString.call(y).slice(8, -1)} is not a valid path parameter`
    })), f + h + (p === o.length ? "" : T);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) {
    const f = d[0].startsWith("/"), h = f ? 1 : 0, p = f ? d[0].slice(1) : d[0];
    i.push({
      start: d.index + h,
      length: p.length,
      error: `Value "${p}" can't be safely passed as a path parameter`
    });
  }
  if (i.sort((f, h) => f.start - h.start), i.length > 0) {
    let f = 0;
    const h = i.reduce((p, m) => {
      const g = " ".repeat(m.start - f), _ = "^".repeat(m.length);
      return f = m.start + m.length, p + g + _;
    }, "");
    throw new ke(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${s}
${h}`);
  }
  return s;
}), Oe = /* @__PURE__ */ uC(ch), dh = class extends na {
  create(e, t) {
    var n;
    const { api_version: o = this._client.apiVersion } = e, r = At(e, ["api_version"]);
    if ("model" in r && "agent_config" in r) throw new ke("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in r && "generation_config" in r) throw new ke("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(Oe`/${o}/interactions`, Object.assign(Object.assign({ body: r }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Oe`/${o}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.post(Oe`/${o}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var o;
    const r = t ?? {}, { api_version: i = this._client.apiVersion } = r, s = At(r, ["api_version"]);
    return this._client.get(Oe`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: s }, n), { stream: (o = t?.stream) !== null && o !== void 0 ? o : !1 }));
  }
};
dh._key = Object.freeze(["interactions"]);
var fh = class extends dh {
}, hh = class extends na {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: o } = e, r = At(e, ["api_version", "webhook_id"]);
    return this._client.post(Oe`/${n}/webhooks`, Object.assign({
      query: { webhook_id: o },
      body: r
    }, t));
  }
  update(e, t, n) {
    const { api_version: o = this._client.apiVersion, update_mask: r } = t, i = At(t, ["api_version", "update_mask"]);
    return this._client.patch(Oe`/${o}/webhooks/${e}`, Object.assign({
      query: { update_mask: r },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: o = this._client.apiVersion } = n, r = At(n, ["api_version"]);
    return this._client.get(Oe`/${o}/webhooks`, Object.assign({ query: r }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Oe`/${o}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.get(Oe`/${o}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: o = this._client.apiVersion, body: r } = t ?? {};
    return this._client.post(Oe`/${o}/webhooks/${e}:ping`, Object.assign({ body: r }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const o = t ?? {}, { api_version: r = this._client.apiVersion } = o, i = At(o, ["api_version"]);
    return this._client.post(Oe`/${r}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
hh._key = Object.freeze(["webhooks"]);
var ph = class extends hh {
};
function cC(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Ko;
function oa(e) {
  let t;
  return (Ko ?? (t = new globalThis.TextEncoder(), Ko = t.encode.bind(t)))(e);
}
var Wo;
function ic(e) {
  let t;
  return (Wo ?? (t = new globalThis.TextDecoder(), Wo = t.decode.bind(t)))(e);
}
var Wr = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? oa(e) : e;
    this.buffer = cC([this.buffer, n]);
    const o = [];
    let r;
    for (; (r = dC(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (r.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = r.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (r.index !== this.carriageReturnIndex + 1 || r.carriage)) {
        o.push(ic(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? r.preceding - 1 : r.preceding, s = ic(this.buffer.subarray(0, i));
      o.push(s), this.buffer = this.buffer.subarray(r.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), o;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Wr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Wr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function dC(e, t) {
  const r = t ?? 0, i = e.indexOf(10, r), s = e.indexOf(13, r);
  if (i === -1 && s === -1) return null;
  let u;
  return i !== -1 && s !== -1 ? u = Math.min(i, s) : u = i !== -1 ? i : s, e[u] === 10 ? {
    preceding: u,
    index: u + 1,
    carriage: !1
  } : {
    preceding: u,
    index: u + 1,
    carriage: !0
  };
}
var Cr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, sc = (e, t, n) => {
  if (e) {
    if (WE(Cr, e)) return e;
    pe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Cr))}`);
  }
};
function Vn() {
}
function zo(e, t, n) {
  return !t || Cr[e] > Cr[n] ? Vn : t[e].bind(t);
}
var fC = {
  error: Vn,
  warn: Vn,
  info: Vn,
  debug: Vn
}, ac = /* @__PURE__ */ new WeakMap();
function pe(e) {
  var t;
  const n = e.logger, o = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return fC;
  const r = ac.get(n);
  if (r && r[0] === o) return r[1];
  const i = {
    error: zo("error", n, o),
    warn: zo("warn", n, o),
    info: zo("info", n, o),
    debug: zo("debug", n, o)
  };
  return ac.set(n, [o, i]), i;
}
var Pt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), hC = class Jn {
  constructor(t, n, o) {
    this.iterator = t, this.controller = n, this.client = o;
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? pe(o) : console;
    function s() {
      return Ve(this, arguments, function* () {
        var c, d, f, h;
        if (r) throw new ke("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Je(pC(t, n)), _; _ = yield q(g.next()), c = _.done, !c; m = !0) {
              h = _.value, m = !1;
              const y = h;
              if (!p)
                if (y.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield q(JSON.parse(y.data));
                } catch (T) {
                  throw i.error("Could not parse message into JSON:", y.data), i.error("From chunk:", y.raw), T;
                }
            }
          } catch (y) {
            d = { error: y };
          } finally {
            try {
              !m && !c && (f = g.return) && (yield q(f.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (y) {
          if (ts(y)) return yield q(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Jn(s, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    function i() {
      return Ve(this, arguments, function* () {
        var c, d, f, h;
        const p = new Wr(), m = ah(t);
        try {
          for (var g = !0, _ = Je(m), y; y = yield q(_.next()), c = y.done, !c; g = !0) {
            h = y.value, g = !1;
            const T = h;
            for (const E of p.decode(T)) yield yield q(E);
          }
        } catch (T) {
          d = { error: T };
        } finally {
          try {
            !g && !c && (f = _.return) && (yield q(f.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const T of p.flush()) yield yield q(T);
      });
    }
    function s() {
      return Ve(this, arguments, function* () {
        var c, d, f, h;
        if (r) throw new ke("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Je(i()), _; _ = yield q(g.next()), c = _.done, !c; m = !0) {
              h = _.value, m = !1;
              const y = h;
              p || y && (yield yield q(JSON.parse(y)));
            }
          } catch (y) {
            d = { error: y };
          } finally {
            try {
              !m && !c && (f = g.return) && (yield q(f.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (y) {
          if (ts(y)) return yield q(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Jn(s, n, o);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), r = (i) => ({ next: () => {
      if (i.length === 0) {
        const s = o.next();
        t.push(s), n.push(s);
      }
      return i.shift();
    } });
    return [new Jn(() => r(t), this.controller, this.client), new Jn(() => r(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return sh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const s = oa(JSON.stringify(r) + `
`);
          o.enqueue(s);
        } catch (r) {
          o.error(r);
        }
      },
      async cancel() {
        var o;
        await ((o = n.return) === null || o === void 0 ? void 0 : o.call(n));
      }
    });
  }
};
function pC(e, t) {
  return Ve(this, arguments, function* () {
    var o, r, i, s;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new ke("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new ke("Attempted to iterate over a response with no body");
    const u = new gC(), c = new Wr(), d = ah(e.body);
    try {
      for (var f = !0, h = Je(mC(d)), p; p = yield q(h.next()), o = p.done, !o; f = !0) {
        s = p.value, f = !1;
        const m = s;
        for (const g of c.decode(m)) {
          const _ = u.decode(g);
          _ && (yield yield q(_));
        }
      }
    } catch (m) {
      r = { error: m };
    } finally {
      try {
        !f && !o && (i = h.return) && (yield q(i.call(h)));
      } finally {
        if (r) throw r.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield q(g));
    }
  });
}
function mC(e) {
  return Ve(this, arguments, function* () {
    var n, o, r, i;
    try {
      for (var s = !0, u = Je(e), c; c = yield q(u.next()), n = c.done, !n; s = !0) {
        i = c.value, s = !1;
        const d = i;
        d != null && (yield yield q(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? oa(d) : d));
      }
    } catch (d) {
      o = { error: d };
    } finally {
      try {
        !s && !n && (r = u.return) && (yield q(r.call(u)));
      } finally {
        if (o) throw o.error;
      }
    }
  });
}
var gC = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const r = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], r;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, o] = _C(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function _C(e, t) {
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
async function yC(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, s = await (async () => {
    var u;
    if (t.options.stream)
      return pe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : hC.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return pe(e).debug(`[${o}] response parsed`, Pt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
var vC = class mh extends Promise {
  constructor(t, n, o = yC) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, this.client = t;
  }
  _thenUnwrap(t) {
    return new mh(this.client, this.responsePromise, async (n, o) => t(await this.parseResponse(n, o), o));
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
}, gh = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* AC(e) {
  if (!e) return;
  if (gh in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : nc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = nc(o[1]) ? o[1] : [o[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [r, null]), yield [r, u]);
  }
}
var Ln = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, s] of AC(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [gh]: !0,
    values: t,
    nulls: n
  };
}, Ai = (e) => {
  var t, n, o, r, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (r = (o = globalThis.Deno.env) === null || o === void 0 ? void 0 : o.get) === null || r === void 0 ? void 0 : r.call(o, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, _h, yh = class vh {
  constructor(t) {
    var n, o, r, i, s, u, c, { baseURL: d = Ai("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: f = (n = Ai("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: h = "v1beta" } = t, p = At(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: f,
      apiVersion: h
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (o = m.timeout) !== null && o !== void 0 ? o : vh.DEFAULT_TIMEOUT, this.logger = (r = m.logger) !== null && r !== void 0 ? r : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (s = (i = sc(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : sc(Ai("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && s !== void 0 ? s : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : QE(), this.encoder = eC, this._options = m, this.apiKey = f, this.apiVersion = h, this.clientAdapter = m.clientAdapter;
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
    const n = Ln([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return Ln([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return Ln([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return tC(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${nC}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${VE()}`;
  }
  makeStatusError(t, n, o, r) {
    return $e.generate(t, n, o, r);
  }
  buildURL(t, n, o) {
    const r = !this.baseURLOverridden() && o || this.baseURL, i = KE(t) ? new URL(t) : new URL(r + (r.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), s = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!oc(s) || !oc(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), s), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return this.request(Promise.resolve(o).then((r) => Object.assign({
      method: t,
      path: n
    }, r)));
  }
  request(t, n = null) {
    return new vC(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, o) {
    var r, i, s;
    const u = await t, c = (r = u.maxRetries) !== null && r !== void 0 ? r : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: f, timeout: h } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: f,
      options: u
    });
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = o === void 0 ? "" : `, retryOf: ${o}`, g = Date.now();
    if (pe(this).debug(`[${p}] sending request`, Pt({
      retryOfRequestLogID: o,
      method: u.method,
      url: f,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new rs();
    const _ = new AbortController(), y = await this.fetchWithTimeout(f, d, h, _).catch(ns), T = Date.now();
    if (y instanceof globalThis.Error) {
      const C = `retrying, ${n} attempts remaining`;
      if (!((s = u.signal) === null || s === void 0) && s.aborted) throw new rs();
      const b = ts(y) || /timed? ?out/i.test(String(y) + ("cause" in y ? String(y.cause) : ""));
      if (n)
        return pe(this).info(`[${p}] connection ${b ? "timed out" : "failed"} - ${C}`), pe(this).debug(`[${p}] connection ${b ? "timed out" : "failed"} (${C})`, Pt({
          retryOfRequestLogID: o,
          url: f,
          durationMs: T - g,
          message: y.message
        })), this.retryRequest(u, n, o ?? p);
      throw pe(this).info(`[${p}] connection ${b ? "timed out" : "failed"} - error; no more retries left`), pe(this).debug(`[${p}] connection ${b ? "timed out" : "failed"} (error; no more retries left)`, Pt({
        retryOfRequestLogID: o,
        url: f,
        durationMs: T - g,
        message: y.message
      })), b ? new Qf() : new Kr({ cause: y });
    }
    const E = `[${p}${m}] ${d.method} ${f} ${y.ok ? "succeeded" : "failed"} with status ${y.status} in ${T - g}ms`;
    if (!y.ok) {
      const C = await this.shouldRetry(y);
      if (n && C) {
        const I = `retrying, ${n} attempts remaining`;
        return await jE(y.body), pe(this).info(`${E} - ${I}`), pe(this).debug(`[${p}] response error (${I})`, Pt({
          retryOfRequestLogID: o,
          url: y.url,
          status: y.status,
          headers: y.headers,
          durationMs: T - g
        })), this.retryRequest(u, n, o ?? p, y.headers);
      }
      const b = C ? "error; no more retries left" : "error; not retryable";
      pe(this).info(`${E} - ${b}`);
      const k = await y.text().catch((I) => ns(I).message), w = YE(k), D = w ? void 0 : k;
      throw pe(this).debug(`[${p}] response error (${b})`, Pt({
        retryOfRequestLogID: o,
        url: y.url,
        status: y.status,
        headers: y.headers,
        message: D,
        durationMs: Date.now() - g
      })), this.makeStatusError(y.status, w, D, y.headers);
    }
    return pe(this).info(E), pe(this).debug(`[${p}] response start`, Pt({
      retryOfRequestLogID: o,
      url: y.url,
      status: y.status,
      headers: y.headers,
      durationMs: T - g
    })), {
      response: y,
      options: u,
      controller: _,
      requestLogID: p,
      retryOfRequestLogID: o,
      startTime: g
    };
  }
  async fetchWithTimeout(t, n, o, r) {
    const i = n || {}, { signal: s, method: u } = i, c = At(i, ["signal", "method"]), d = this._makeAbort(r);
    s && s.addEventListener("abort", d, { once: !0 });
    const f = setTimeout(d, o), h = globalThis.ReadableStream && c.body instanceof globalThis.ReadableStream || typeof c.body == "object" && c.body !== null && Symbol.asyncIterator in c.body, p = Object.assign(Object.assign(Object.assign({ signal: r.signal }, h ? { duplex: "half" } : {}), { method: "GET" }), c);
    u && (p.method = u.toUpperCase());
    try {
      return await this.fetch.call(void 0, t, p);
    } finally {
      clearTimeout(f);
    }
  }
  async shouldRetry(t) {
    const n = t.headers.get("x-should-retry");
    return n === "true" ? !0 : n === "false" ? !1 : t.status === 408 || t.status === 409 || t.status === 429 || t.status >= 500;
  }
  async retryRequest(t, n, o, r) {
    var i;
    let s;
    const u = r?.get("retry-after-ms");
    if (u) {
      const d = parseFloat(u);
      Number.isNaN(d) || (s = d);
    }
    const c = r?.get("retry-after");
    if (c && !s) {
      const d = parseFloat(c);
      Number.isNaN(d) ? s = Date.parse(c) - Date.now() : s = d * 1e3;
    }
    if (s === void 0) {
      const d = (i = t.maxRetries) !== null && i !== void 0 ? i : this.maxRetries;
      s = this.calculateDefaultRetryTimeoutMillis(n, d);
    }
    return await XE(s), this.makeRequest(t, n - 1, o);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var o, r, i;
    const s = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: f } = s, h = this.buildURL(c, d, f);
    "timeout" in s && zE("timeout", s.timeout), s.timeout = (o = s.timeout) !== null && o !== void 0 ? o : this.timeout;
    const { bodyHeaders: p, body: m } = this.buildBody({ options: s }), g = await this.buildHeaders({
      options: t,
      method: u,
      bodyHeaders: p,
      retryCount: n
    });
    return {
      req: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
        method: u,
        headers: g
      }, s.signal && { signal: s.signal }), globalThis.ReadableStream && m instanceof globalThis.ReadableStream && { duplex: "half" }), m && { body: m }), (r = this.fetchOptions) !== null && r !== void 0 ? r : {}), (i = s.fetchOptions) !== null && i !== void 0 ? i : {}),
      url: h,
      timeout: s.timeout
    };
  }
  async buildHeaders({ options: t, method: n, bodyHeaders: o, retryCount: r }) {
    let i = {};
    this.idempotencyHeader && n !== "get" && (t.idempotencyKey || (t.idempotencyKey = this.defaultIdempotencyKey()), i[this.idempotencyHeader] = t.idempotencyKey);
    const s = await this.authHeaders(t);
    let u = Ln([
      i,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent()
      },
      this._options.defaultHeaders,
      o,
      t.headers,
      s
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
    const o = Ln([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && o.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: ZE(t)
    } : typeof t == "object" && o.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: o
    });
  }
};
yh.DEFAULT_TIMEOUT = 6e4;
var re = class extends yh {
  constructor() {
    super(...arguments), this.interactions = new fh(this), this.webhooks = new ph(this);
  }
};
_h = re;
re.GeminiNextGenAPIClient = _h;
re.GeminiNextGenAPIClientError = ke;
re.APIError = $e;
re.APIConnectionError = Kr;
re.APIConnectionTimeoutError = Qf;
re.APIUserAbortError = rs;
re.NotFoundError = th;
re.ConflictError = nh;
re.RateLimitError = rh;
re.BadRequestError = Zf;
re.AuthenticationError = jf;
re.InternalServerError = ih;
re.PermissionDeniedError = eh;
re.UnprocessableEntityError = oh;
re.toFile = aC;
re.Interactions = fh;
re.Webhooks = ph;
function TC(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function SC(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function EC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function CC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function wC(e, t, n) {
  const o = {};
  if (a(e, ["validationDataset"]) !== void 0) throw new Error("validationDataset parameter is not supported in Gemini API.");
  const r = a(e, ["tunedModelDisplayName"]);
  if (t !== void 0 && r != null && l(t, ["displayName"], r), a(e, ["description"]) !== void 0) throw new Error("description parameter is not supported in Gemini API.");
  const i = a(e, ["epochCount"]);
  t !== void 0 && i != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "epochCount"
  ], i);
  const s = a(e, ["learningRateMultiplier"]);
  if (s != null && l(o, [
    "tuningTask",
    "hyperparameters",
    "learningRateMultiplier"
  ], s), a(e, ["exportLastCheckpointOnly"]) !== void 0) throw new Error("exportLastCheckpointOnly parameter is not supported in Gemini API.");
  if (a(e, ["preTunedModelCheckpointId"]) !== void 0) throw new Error("preTunedModelCheckpointId parameter is not supported in Gemini API.");
  if (a(e, ["adapterSize"]) !== void 0) throw new Error("adapterSize parameter is not supported in Gemini API.");
  if (a(e, ["tuningMode"]) !== void 0) throw new Error("tuningMode parameter is not supported in Gemini API.");
  if (a(e, ["customBaseModel"]) !== void 0) throw new Error("customBaseModel parameter is not supported in Gemini API.");
  const u = a(e, ["batchSize"]);
  t !== void 0 && u != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "batchSize"
  ], u);
  const c = a(e, ["learningRate"]);
  if (t !== void 0 && c != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "learningRate"
  ], c), a(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  if (a(e, ["beta"]) !== void 0) throw new Error("beta parameter is not supported in Gemini API.");
  if (a(e, ["baseTeacherModel"]) !== void 0) throw new Error("baseTeacherModel parameter is not supported in Gemini API.");
  if (a(e, ["tunedTeacherModelSource"]) !== void 0) throw new Error("tunedTeacherModelSource parameter is not supported in Gemini API.");
  if (a(e, ["sftLossWeightMultiplier"]) !== void 0) throw new Error("sftLossWeightMultiplier parameter is not supported in Gemini API.");
  if (a(e, ["outputUri"]) !== void 0) throw new Error("outputUri parameter is not supported in Gemini API.");
  if (a(e, ["encryptionSpec"]) !== void 0) throw new Error("encryptionSpec parameter is not supported in Gemini API.");
  return o;
}
function IC(e, t, n) {
  const o = {};
  let r = a(n, ["config", "method"]);
  if (r === void 0 && (r = "SUPERVISED_FINE_TUNING"), r === "SUPERVISED_FINE_TUNING") {
    const w = a(e, ["validationDataset"]);
    t !== void 0 && w != null && l(t, ["supervisedTuningSpec"], Ti(w));
  } else if (r === "PREFERENCE_TUNING") {
    const w = a(e, ["validationDataset"]);
    t !== void 0 && w != null && l(t, ["preferenceOptimizationSpec"], Ti(w));
  } else if (r === "DISTILLATION") {
    const w = a(e, ["validationDataset"]);
    t !== void 0 && w != null && l(t, ["distillationSpec"], Ti(w));
  }
  const i = a(e, ["tunedModelDisplayName"]);
  t !== void 0 && i != null && l(t, ["tunedModelDisplayName"], i);
  const s = a(e, ["description"]);
  t !== void 0 && s != null && l(t, ["description"], s);
  let u = a(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const w = a(e, ["epochCount"]);
    t !== void 0 && w != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], w);
  } else if (u === "PREFERENCE_TUNING") {
    const w = a(e, ["epochCount"]);
    t !== void 0 && w != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], w);
  } else if (u === "DISTILLATION") {
    const w = a(e, ["epochCount"]);
    t !== void 0 && w != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], w);
  }
  let c = a(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const w = a(e, ["learningRateMultiplier"]);
    t !== void 0 && w != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], w);
  } else if (c === "PREFERENCE_TUNING") {
    const w = a(e, ["learningRateMultiplier"]);
    t !== void 0 && w != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], w);
  } else if (c === "DISTILLATION") {
    const w = a(e, ["learningRateMultiplier"]);
    t !== void 0 && w != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], w);
  }
  let d = a(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const w = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && w != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], w);
  } else if (d === "PREFERENCE_TUNING") {
    const w = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && w != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], w);
  } else if (d === "DISTILLATION") {
    const w = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && w != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], w);
  }
  let f = a(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const w = a(e, ["adapterSize"]);
    t !== void 0 && w != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], w);
  } else if (f === "PREFERENCE_TUNING") {
    const w = a(e, ["adapterSize"]);
    t !== void 0 && w != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], w);
  } else if (f === "DISTILLATION") {
    const w = a(e, ["adapterSize"]);
    t !== void 0 && w != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], w);
  }
  let h = a(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const w = a(e, ["tuningMode"]);
    t !== void 0 && w != null && l(t, ["supervisedTuningSpec", "tuningMode"], w);
  } else if (h === "DISTILLATION") {
    const w = a(e, ["tuningMode"]);
    t !== void 0 && w != null && l(t, ["distillationSpec", "tuningMode"], w);
  }
  const p = a(e, ["customBaseModel"]);
  t !== void 0 && p != null && l(t, ["customBaseModel"], p);
  let m = a(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const w = a(e, ["batchSize"]);
    t !== void 0 && w != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], w);
  } else if (m === "DISTILLATION") {
    const w = a(e, ["batchSize"]);
    t !== void 0 && w != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], w);
  }
  let g = a(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const w = a(e, ["learningRate"]);
    t !== void 0 && w != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], w);
  } else if (g === "DISTILLATION") {
    const w = a(e, ["learningRate"]);
    t !== void 0 && w != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], w);
  }
  const _ = a(e, ["labels"]);
  t !== void 0 && _ != null && l(t, ["labels"], _);
  const y = a(e, ["beta"]);
  t !== void 0 && y != null && l(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], y);
  const T = a(e, ["baseTeacherModel"]);
  t !== void 0 && T != null && l(t, ["distillationSpec", "baseTeacherModel"], T);
  const E = a(e, ["tunedTeacherModelSource"]);
  t !== void 0 && E != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], E);
  const C = a(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && C != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], C);
  const b = a(e, ["outputUri"]);
  t !== void 0 && b != null && l(t, ["outputUri"], b);
  const k = a(e, ["encryptionSpec"]);
  return t !== void 0 && k != null && l(t, ["encryptionSpec"], k), o;
}
function bC(e, t) {
  const n = {}, o = a(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = a(e, ["trainingDataset"]);
  i != null && FC(i);
  const s = a(e, ["config"]);
  return s != null && wC(s, n), n;
}
function RC(e, t) {
  const n = {}, o = a(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = a(e, ["trainingDataset"]);
  i != null && OC(i, n, t);
  const s = a(e, ["config"]);
  return s != null && IC(s, n, t), n;
}
function PC(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function MC(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function NC(e, t, n) {
  const o = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), o;
}
function xC(e, t, n) {
  const o = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), o;
}
function kC(e, t) {
  const n = {}, o = a(e, ["config"]);
  return o != null && NC(o, n), n;
}
function DC(e, t) {
  const n = {}, o = a(e, ["config"]);
  return o != null && xC(o, n), n;
}
function $C(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["tunedModels"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => Ah(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function LC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["tuningJobs"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => as(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function UC(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["model"], o);
  const r = a(e, ["name"]);
  return r != null && l(n, ["endpoint"], r), n;
}
function FC(e, t) {
  const n = {};
  if (a(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (a(e, ["vertexDatasetResource"]) !== void 0) throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");
  const o = a(e, ["examples"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(n, ["examples", "examples"], r);
  }
  return n;
}
function OC(e, t, n) {
  const o = {};
  let r = a(n, ["config", "method"]);
  if (r === void 0 && (r = "SUPERVISED_FINE_TUNING"), r === "SUPERVISED_FINE_TUNING") {
    const s = a(e, ["gcsUri"]);
    t !== void 0 && s != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], s);
  } else if (r === "PREFERENCE_TUNING") {
    const s = a(e, ["gcsUri"]);
    t !== void 0 && s != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], s);
  } else if (r === "DISTILLATION") {
    const s = a(e, ["gcsUri"]);
    t !== void 0 && s != null && l(t, ["distillationSpec", "promptDatasetUri"], s);
  }
  let i = a(n, ["config", "method"]);
  if (i === void 0 && (i = "SUPERVISED_FINE_TUNING"), i === "SUPERVISED_FINE_TUNING") {
    const s = a(e, ["vertexDatasetResource"]);
    t !== void 0 && s != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], s);
  } else if (i === "PREFERENCE_TUNING") {
    const s = a(e, ["vertexDatasetResource"]);
    t !== void 0 && s != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], s);
  } else if (i === "DISTILLATION") {
    const s = a(e, ["vertexDatasetResource"]);
    t !== void 0 && s != null && l(t, ["distillationSpec", "promptDatasetUri"], s);
  }
  if (a(e, ["examples"]) !== void 0) throw new Error("examples parameter is not supported in Vertex AI.");
  return o;
}
function Ah(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["state"]);
  i != null && l(n, ["state"], Pf(i));
  const s = a(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const u = a(e, ["tuningTask", "startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = a(e, ["tuningTask", "completeTime"]);
  c != null && l(n, ["endTime"], c);
  const d = a(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const f = a(e, ["description"]);
  f != null && l(n, ["description"], f);
  const h = a(e, ["baseModel"]);
  h != null && l(n, ["baseModel"], h);
  const p = a(e, ["_self"]);
  return p != null && l(n, ["tunedModel"], UC(p)), n;
}
function as(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["state"]);
  i != null && l(n, ["state"], Pf(i));
  const s = a(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const u = a(e, ["startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = a(e, ["endTime"]);
  c != null && l(n, ["endTime"], c);
  const d = a(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const f = a(e, ["error"]);
  f != null && l(n, ["error"], f);
  const h = a(e, ["description"]);
  h != null && l(n, ["description"], h);
  const p = a(e, ["baseModel"]);
  p != null && l(n, ["baseModel"], p);
  const m = a(e, ["tunedModel"]);
  m != null && l(n, ["tunedModel"], m);
  const g = a(e, ["preTunedModel"]);
  g != null && l(n, ["preTunedModel"], g);
  const _ = a(e, ["supervisedTuningSpec"]);
  _ != null && l(n, ["supervisedTuningSpec"], _);
  const y = a(e, ["preferenceOptimizationSpec"]);
  y != null && l(n, ["preferenceOptimizationSpec"], y);
  const T = a(e, ["distillationSpec"]);
  T != null && l(n, ["distillationSpec"], T);
  const E = a(e, ["tuningDataStats"]);
  E != null && l(n, ["tuningDataStats"], E);
  const C = a(e, ["encryptionSpec"]);
  C != null && l(n, ["encryptionSpec"], C);
  const b = a(e, ["partnerModelTuningSpec"]);
  b != null && l(n, ["partnerModelTuningSpec"], b);
  const k = a(e, ["customBaseModel"]);
  k != null && l(n, ["customBaseModel"], k);
  const w = a(e, ["evaluateDatasetRuns"]);
  if (w != null) {
    let Le = w;
    Array.isArray(Le) && (Le = Le.map((Ue) => Ue)), l(n, ["evaluateDatasetRuns"], Le);
  }
  const D = a(e, ["experiment"]);
  D != null && l(n, ["experiment"], D);
  const I = a(e, ["fullFineTuningSpec"]);
  I != null && l(n, ["fullFineTuningSpec"], I);
  const x = a(e, ["labels"]);
  x != null && l(n, ["labels"], x);
  const R = a(e, ["outputUri"]);
  R != null && l(n, ["outputUri"], R);
  const F = a(e, ["pipelineJob"]);
  F != null && l(n, ["pipelineJob"], F);
  const X = a(e, ["serviceAccount"]);
  X != null && l(n, ["serviceAccount"], X);
  const J = a(e, ["tunedModelDisplayName"]);
  J != null && l(n, ["tunedModelDisplayName"], J);
  const V = a(e, ["tuningJobState"]);
  V != null && l(n, ["tuningJobState"], V);
  const W = a(e, ["veoTuningSpec"]);
  W != null && l(n, ["veoTuningSpec"], W);
  const ge = a(e, ["distillationSamplingSpec"]);
  ge != null && l(n, ["distillationSamplingSpec"], ge);
  const We = a(e, ["tuningJobMetadata"]);
  return We != null && l(n, ["tuningJobMetadata"], We), n;
}
function GC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const s = a(e, ["done"]);
  s != null && l(n, ["done"], s);
  const u = a(e, ["error"]);
  return u != null && l(n, ["error"], u), n;
}
function Ti(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["validationDatasetUri"], o);
  const r = a(e, ["vertexDatasetResource"]);
  return r != null && l(n, ["validationDatasetUri"], r), n;
}
var BC = class extends ut {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Gt(lt.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
      var n;
      if (this.apiClient.isVertexAI()) if (t.baseModel.startsWith("projects/")) {
        const o = { tunedModelName: t.baseModel };
        !((n = t.config) === null || n === void 0) && n.preTunedModelCheckpointId && (o.checkpointId = t.config.preTunedModelCheckpointId);
        const r = Object.assign(Object.assign({}, t), { preTunedModel: o });
        return r.baseModel = void 0, await this.tuneInternal(r);
      } else {
        const o = Object.assign({}, t);
        return await this.tuneInternal(o);
      }
      else {
        const o = Object.assign({}, t), r = await this.tuneMldevInternal(o);
        let i = "";
        return r.metadata !== void 0 && r.metadata.tunedModel !== void 0 ? i = r.metadata.tunedModel : r.name !== void 0 && r.name.includes("/operations/") && (i = r.name.split("/operations/")[0]), {
          name: i,
          state: Wi.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = MC(e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => as(d));
    } else {
      const c = PC(e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => Ah(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = DC(e);
      return s = N("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = LC(d), h = new xu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = kC(e);
      return s = N("tunedModels", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = $C(d), h = new xu();
        return Object.assign(h, f), h;
      });
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = SC(e);
      return s = N("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = CC(d), h = new ku();
        return Object.assign(h, f), h;
      });
    } else {
      const c = TC(e);
      return s = N("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((f) => {
        const h = f;
        return h.sdkHttpResponse = { headers: d.headers }, h;
      })), i.then((d) => {
        const f = EC(d), h = new ku();
        return Object.assign(h, f), h;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = RC(e, e);
      return r = N("tuningJobs", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => as(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = bC(e);
      return r = N("tunedModels", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => GC(u));
    }
  }
}, qC = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, HC = 1024 * 1024 * 8, VC = 3, JC = 1e3, KC = 2, wr = "x-goog-upload-status";
async function WC(e, t, n, o) {
  var r;
  const i = await Th(e, t, n, o), s = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[wr]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return s.file;
}
async function zC(e, t, n, o) {
  var r;
  const i = await Th(e, t, n, o), s = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[wr]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = Af(s), c = new ly();
  return Object.assign(c, u), c;
}
async function Th(e, t, n, o) {
  var r, i, s;
  let u = t;
  const c = o?.baseUrl || ((r = n.clientOptions.httpOptions) === null || r === void 0 ? void 0 : r.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, f = 0, h = new Yi(new Response()), p = "upload";
  for (d = e.size; f < d; ) {
    const m = Math.min(HC, d - f), g = e.slice(f, f + m);
    f + m >= d && (p += ", finalize");
    let _ = 0, y = JC;
    for (; _ < VC; ) {
      const T = Object.assign(Object.assign({}, o?.headers || {}), {
        "X-Goog-Upload-Command": p,
        "X-Goog-Upload-Offset": String(f),
        "Content-Length": String(m)
      });
      if (h = await n.request({
        path: "",
        body: g,
        httpMethod: "POST",
        httpOptions: Object.assign(Object.assign({}, o), {
          apiVersion: "",
          baseUrl: u,
          headers: T
        })
      }), !((i = h?.headers) === null || i === void 0) && i[wr]) break;
      _++, await XC(y), y = y * KC;
    }
    if (f += m, ((s = h?.headers) === null || s === void 0 ? void 0 : s[wr]) !== "active") break;
    if (d <= f) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return h;
}
async function YC(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function XC(e) {
  return new Promise((t) => setTimeout(t, e));
}
var QC = class {
  async upload(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await WC(e, t, n, o);
  }
  async uploadToFileSearchStore(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await zC(e, t, n, o);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await YC(e);
  }
}, ZC = class {
  create(e, t, n) {
    return new jC(e, t, n);
  }
}, jC = class {
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
}, lc = "x-goog-api-key", ew = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(lc) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(lc, this.apiKey);
    }
  }
}, tw = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new re({
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
    const n = N_(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const o = new ew(this.apiKey);
    this.apiClient = new XS({
      auth: o,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new QC(),
      downloader: new qC()
    }), this.models = new gE(this.apiClient), this.live = new cE(this.apiClient, o, new ZC()), this.batches = new dv(this.apiClient), this.chats = new Yv(this.models, this.apiClient), this.caches = new Kv(this.apiClient), this.files = new aA(this.apiClient), this.operations = new _E(this.apiClient), this.authTokens = new $E(this.apiClient), this.tunings = new BC(this.apiClient), this.fileSearchStores = new HE(this.apiClient);
  }
};
function uc(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Ir(e) {
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
function nw(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function ow(e) {
  if (typeof e == "string") return [$t(e)];
  if (!Array.isArray(e)) return [$t("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? $t(n.text || "") : n.type === "image_url" && n.image_url?.url ? nw(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [$t("")];
}
function cc() {
  return {
    role: "user",
    parts: [$t("")]
  };
}
function So(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = Ir(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function rw(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function iw(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function dc(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const o = String(e.functionCall.id || "").trim();
  return o ? `id:${o}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function sw(e, t) {
  const n = e?.functionCall || {}, o = t?.functionCall || {}, r = n.args && typeof n.args == "object" && !Array.isArray(n.args) ? n.args : {}, i = o.args && typeof o.args == "object" && !Array.isArray(o.args) ? o.args : {};
  return {
    ...e,
    ...t,
    ...e?.thoughtSignature && !t?.thoughtSignature ? { thoughtSignature: e.thoughtSignature } : {},
    functionCall: {
      ...n,
      ...o,
      args: {
        ...r,
        ...i
      }
    }
  };
}
function aw(e = [], t = "") {
  const n = e.map((f) => So(f, "model")).filter(Boolean);
  if (!n.length) return null;
  const o = [...n].reverse().find((f) => rw(f)) || null, r = [...n].reverse().find((f) => iw(f)) || null, i = o || r || n[n.length - 1], s = n.indexOf(i), u = Ir(i);
  if (!u?.parts?.length) return n[n.length - 1];
  if (r) {
    const f = /* @__PURE__ */ new Map(), h = [];
    n.forEach((m, g) => {
      m.parts.forEach((_, y) => {
        const T = dc(_, y, g);
        if (!T) return;
        f.has(T) || h.push(T);
        const E = f.get(T);
        E ? f.set(T, sw(E, _)) : f.set(T, Ir(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((m, g) => {
      const _ = dc(m, g, s);
      return _ ? (p.add(_), f.get(_) || m) : m;
    }), h.forEach((m) => {
      p.has(m) || (u.parts.push(f.get(m)), p.add(m));
    });
  }
  const c = String(t || ""), d = u.parts.filter((f) => !(typeof f?.text == "string" && !f?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function fc(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((o) => !o?.thought && typeof o?.text == "string" && o.text).map((o) => o.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function Sh(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((o) => o?.functionCall || o).filter((o) => o && o.name);
  return t.length ? t : n;
}
function Eh(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function hc(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function lw(e, t) {
  const n = hc(e), o = hc(t);
  return n && o ? JSON.stringify({
    ...n,
    ...o
  }) : String(t || "").trim() || String(e || "{}");
}
function uw(e, t = "google-tool") {
  return Sh(e).map((n, o) => {
    const r = String(n.id || "").trim();
    return {
      id: r || `${t}-${o + 1}`,
      name: n.name || "",
      arguments: Eh(n),
      ...r ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function cw(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let o = 0;
  function r(s, u, c, d) {
    return s.name = String(u.name || s.name || "").trim(), s.arguments = lw(s.arguments, d), c && (n.set(c, s), s.id !== c ? s.providerId = c : delete s.providerId), s;
  }
  function i(s) {
    return Sh(s).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), f = Eh(u);
      let h = d ? n.get(d) : null;
      h ? r(h, u, d, f) : (h = {
        id: d || `${e}-${++o}`,
        name: c,
        arguments: f,
        ...d ? {} : { providerId: "" }
      }, t.push(h)), d && n.set(d, h);
    }), t.map((u) => ({ ...u }));
  }
  return { append: i };
}
function dw(e = []) {
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
function fw(e) {
  switch (e) {
    case "minimal":
      return en.MINIMAL;
    case "high":
      return en.HIGH;
    case "medium":
      return en.MEDIUM;
    default:
      return en.LOW;
  }
}
function pc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function hw(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function pw(e) {
  const t = e?.providerPayload?.googleContent;
  return So(t, "model");
}
function mw(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = pw(e);
    return n ? [n] : [];
  }
  return t.map((n) => So(n, "model")).filter(Boolean);
}
function ra(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => So(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function gw(e) {
  const t = e?.candidates?.[0]?.content;
  return ra(t ? [t] : []);
}
function _w(e) {
  return ra(e ? [e] : []);
}
function Ch(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? Ir(e.history) || [] : [];
}
function yw(e, t = 0) {
  return Ch(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => So(n, "model")).filter(Boolean);
}
function vw(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = [], r = (e || []).filter((s) => s.role === "user" || s.role === "assistant" || s.role === "tool");
  r.forEach((s) => {
    (s.tool_calls || []).forEach((u) => {
      u.id && u.function?.name && t.set(u.id, u.function.name), u.id && Object.prototype.hasOwnProperty.call(u, "providerToolCallId") && n.set(u.id, String(u.providerToolCallId || "").trim());
    });
  });
  for (let s = 0; s < r.length; s += 1) {
    const u = r[s];
    if (u.role === "tool") {
      const c = [];
      let d = s;
      for (; d < r.length && r[d].role === "tool"; ) {
        const f = r[d], h = String(f.tool_call_id || "").trim(), p = n.has(h) ? n.get(h) : h;
        c.push({ functionResponse: {
          ...p ? { id: p } : {},
          name: String(f.toolName || f.tool_name || "").trim() || t.get(h) || "tool_result",
          response: uc(f.content)
        } }), d += 1;
      }
      o.push({
        role: "user",
        parts: c
      }), s = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = mw(u);
      if (c.length) {
        o.push(...c);
        continue;
      }
    }
    if (u.role === "assistant" && Array.isArray(u.tool_calls) && u.tool_calls.length) {
      o.push({
        role: "model",
        parts: [...u.content ? [$t(u.content)] : [], ...u.tool_calls.map((c) => ({ functionCall: {
          ...(() => {
            const d = Object.prototype.hasOwnProperty.call(c, "providerToolCallId") ? String(c.providerToolCallId || "").trim() : String(c.id || "").trim();
            return d ? { id: d } : {};
          })(),
          name: c.function.name,
          args: uc(c.function.arguments)
        } }))]
      });
      continue;
    }
    o.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: ow(u.content)
    });
  }
  if (!o.length) return {
    history: [],
    latestMessage: cc().parts
  };
  const i = o[o.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: o.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: o,
    latestMessage: cc().parts
  };
}
function Aw(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function mc(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var Tw = class {
  constructor(e) {
    this.config = e, this.auth = Or("google", e.apiKey), this.supportsSessionToolLoop = !0, this.activeChat = null, this.sessionReasoning = null, this.toolCallResponseSequence = 0, this.client = new tw({
      ...this.auth.sdkOptions,
      httpOptions: {
        headers: this.auth.headers,
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e, t = j("google", this.config, e.reasoning)) {
    const n = t, o = vw(e.messages), r = Array.isArray(e.tools) ? e.tools : [], i = hw(e), s = {
      ...i ? { systemInstruction: i } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    if (n.mode === "off" ? s.thinkingConfig = {
      includeThoughts: !1,
      thinkingBudget: 0
    } : n.mode === "on" && n.profileId.startsWith("google-gemini-2.5-") ? s.thinkingConfig = {
      includeThoughts: z(n),
      thinkingBudget: n.budgetTokens
    } : n.mode === "on" ? s.thinkingConfig = {
      includeThoughts: z(n),
      thinkingLevel: fw(n.effort)
    } : z(n) && (s.thinkingConfig = { includeThoughts: !0 }), r.length && (s.tools = [{ functionDeclarations: r.map((u) => ({
      name: u.function.name,
      description: u.function.description,
      parameters: u.function.parameters
    })) }]), r.length) {
      const u = String(e.toolChoice || "auto").trim();
      s.toolConfig = { functionCallingConfig: u === "none" ? { mode: jt.NONE } : u === "auto" ? { mode: jt.AUTO } : u === "required" ? { mode: jt.ANY } : {
        mode: jt.ANY,
        allowedFunctionNames: [u]
      } };
    }
    return {
      createPayload: {
        model: this.config.model,
        history: o.history,
        config: s
      },
      sendPayload: { message: o.latestMessage }
    };
  }
  inspectRequest(e, t = {}) {
    const n = t.effectiveReasoning || j("google", this.config, e.reasoning), o = t.payload || this.buildChatPayload(e, n), r = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return co({
      provider: "google",
      model: this.config.model,
      transport: "google-genai-sdk",
      url: `${r}/models/${encodeURIComponent(this.config.model || "")}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        ...this.auth.headers
      },
      body: {
        chatCreate: o.createPayload,
        sendMessage: o.sendPayload,
        stream: typeof e.onStreamProgress == "function"
      },
      sdk: typeof e.onStreamProgress == "function" ? "client.chats.create(...).sendMessageStream" : "client.chats.create(...).sendMessage",
      effectiveConfig: St(e, {
        reasoning: n,
        effort: o.createPayload.config?.thinkingConfig?.thinkingLevel,
        budgetTokens: o.createPayload.config?.thinkingConfig?.thinkingBudget,
        controlFields: o.createPayload.config?.thinkingConfig ? { thinkingConfig: o.createPayload.config.thinkingConfig } : {}
      })
    });
  }
  inspectSendRequest(e, t, n) {
    const o = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return co({
      provider: "google",
      model: this.config.model,
      transport: "google-genai-sdk",
      url: `${o}/models/${encodeURIComponent(this.config.model || "")}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        ...this.auth.headers
      },
      body: {
        sendMessage: e,
        stream: typeof t.onStreamProgress == "function"
      },
      sdk: typeof t.onStreamProgress == "function" ? "activeChat.sendMessageStream" : "activeChat.sendMessage",
      effectiveConfig: St(t, {
        reasoning: n,
        effort: this.sessionConfig?.thinkingConfig?.thinkingLevel,
        budgetTokens: this.sessionConfig?.thinkingConfig?.thinkingBudget,
        controlFields: this.sessionConfig?.thinkingConfig ? { thinkingConfig: this.sessionConfig.thinkingConfig } : {}
      })
    });
  }
  createChat(e, t) {
    const n = this.buildChatPayload(e, t);
    return {
      chat: this.client.chats.create(n.createPayload),
      sessionConfig: n.createPayload.config,
      sendPayload: n.sendPayload,
      requestInspection: this.inspectRequest(e, {
        payload: n,
        effectiveReasoning: t
      })
    };
  }
  async sendThroughChat(e, t, n, o) {
    let r, i, s, u = [];
    const c = `google-tool-${++this.toolCallResponseSequence}`, d = cw(c);
    let f = null;
    const h = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, p = {
      ...t,
      ...h ? { config: h } : {}
    }, m = typeof n.onStreamProgress == "function";
    let g;
    const _ = Ch(e).length;
    if (m) {
      const E = await e.sendMessageStream(p), C = /* @__PURE__ */ new Map();
      let b = "", k = null;
      const w = [];
      for await (const D of E) {
        k = D, D?.candidates?.[0]?.finishReason && (g = D.candidates[0].finishReason);
        const I = D?.candidates?.[0]?.content;
        I?.parts?.length && w.push(I), z(o) && pc(D).forEach((R, F) => {
          const X = `${R.label}:${F}`;
          C.set(X, mc(C.get(X) || "", R.text));
        }), u = d.append(D);
        const x = fc(D);
        b = mc(b, x), Aw(n, {
          text: b,
          thoughts: Array.from(C.values()).filter(Boolean).map((R, F) => ({
            label: `思考块 ${F + 1}`,
            text: R
          })),
          ...u.length ? {
            toolCalls: u,
            toolCallDraft: !0
          } : {}
        });
      }
      r = {
        ...k || {},
        functionCalls: u
      }, f = aw(w, b) || r?.candidates?.[0]?.content || null, i = Array.from(C.values()).filter(Boolean).map((D, I) => ({
        label: `思考块 ${I + 1}`,
        text: D
      })), s = b;
    } else
      r = await e.sendMessage(p), g = r?.candidates?.[0]?.finishReason, i = z(o) ? pc(r) : [], s = fc(r);
    const y = m ? u : uw(r, c), T = yw(e, _);
    return {
      text: s,
      toolCalls: y,
      thoughts: i,
      ...Qe("google", g),
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: ra(T) || _w(f) || gw(r)
    };
  }
  async chat(e) {
    const t = j("google", this.config, e.reasoning), n = (Array.isArray(e.toolResponses) && e.toolResponses.length || String(e.finalAnswerReminderText || "").trim()) && this.sessionReasoning ? this.sessionReasoning : t;
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const i = { message: dw(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, i, e, n),
        requestInspection: this.inspectSendRequest(i, e, n)
      };
    }
    const o = String(e.finalAnswerReminderText || "").trim();
    if (o) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const i = { message: [$t(o)] };
      return {
        ...await this.sendThroughChat(this.activeChat, i, e, n),
        requestInspection: this.inspectSendRequest(i, e, n)
      };
    }
    const r = this.createChat(e, n);
    return this.activeChat = r.chat, this.sessionConfig = r.sessionConfig, this.sessionReasoning = n, {
      ...await this.sendThroughChat(this.activeChat, r.sendPayload, e, n),
      requestInspection: r.requestInspection
    };
  }
};
function G(e, t, n, o, r) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !r) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? r.call(e, n) : r ? r.value = n : t.set(e, n), n;
}
function S(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var wh = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return wh = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function ls(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var us = (e) => {
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
}, de = class cs extends O {
  constructor(t, n, o, r) {
    super(`${cs.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new zr({
      message: o,
      cause: us(n)
    });
    const i = n?.error;
    return t === 400 ? new Ih(t, i, o, r) : t === 401 ? new bh(t, i, o, r) : t === 403 ? new Rh(t, i, o, r) : t === 404 ? new Ph(t, i, o, r) : t === 409 ? new Mh(t, i, o, r) : t === 422 ? new Nh(t, i, o, r) : t === 429 ? new xh(t, i, o, r) : t >= 500 ? new kh(t, i, o, r) : new cs(t, i, o, r);
  }
}, xe = class extends de {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, zr = class extends de {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, ia = class extends zr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Ih = class extends de {
}, bh = class extends de {
}, Rh = class extends de {
}, Ph = class extends de {
}, Mh = class extends de {
}, Nh = class extends de {
}, xh = class extends de {
}, kh = class extends de {
}, Dh = class extends O {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, $h = class extends O {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Kn = class extends Error {
  constructor(e) {
    super(e);
  }
}, Lh = class extends de {
  constructor(e, t, n) {
    let o = "OAuth2 authentication error", r;
    if (t && typeof t == "object") {
      const i = t;
      r = i.error;
      const s = i.error_description;
      s && typeof s == "string" ? o = s : r && (o = r);
    }
    super(e, t, o, n), this.error_code = r;
  }
}, Sw = class extends O {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, Ew = /^[a-z][a-z0-9+.-]*:/i, Cw = (e) => Ew.test(e), ye = (e) => (ye = Array.isArray, ye(e)), gc = ye;
function sa(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function _c(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function ww(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Si(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var Iw = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new O(`${e} must be an integer`);
  if (t < 0) throw new O(`${e} must be a positive integer`);
  return t;
}, bw = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Eo = (e) => new Promise((t) => setTimeout(t, e)), Yt = "6.44.0", Rw = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Pw() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Mw = () => {
  const e = Pw();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Yt,
    "X-Stainless-OS": vc(Deno.build.os),
    "X-Stainless-Arch": yc(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Yt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Yt,
    "X-Stainless-OS": vc(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": yc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Nw();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Yt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Yt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Nw() {
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
var yc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", vc = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Ac, xw = () => Ac ?? (Ac = Mw());
function Uh() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Fh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Oh(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Fh({
    start() {
    },
    async pull(n) {
      const { done: o, value: r } = await t.next();
      o ? n.close() : n.enqueue(r);
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
async function Tc(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var kw = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Bh = "RFC3986", qh = (e) => String(e), Sc = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: qh
};
var ds = (e, t) => (ds = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), ds(e, t)), ze = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), Ei = 1024, Dw = (e, t, n, o, r) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let s = "";
  for (let u = 0; u < i.length; u += Ei) {
    const c = i.length >= Ei ? i.slice(u, u + Ei) : i, d = [];
    for (let f = 0; f < c.length; ++f) {
      let h = c.charCodeAt(f);
      if (h === 45 || h === 46 || h === 95 || h === 126 || h >= 48 && h <= 57 || h >= 65 && h <= 90 || h >= 97 && h <= 122 || r === "RFC1738" && (h === 40 || h === 41)) {
        d[d.length] = c.charAt(f);
        continue;
      }
      if (h < 128) {
        d[d.length] = ze[h];
        continue;
      }
      if (h < 2048) {
        d[d.length] = ze[192 | h >> 6] + ze[128 | h & 63];
        continue;
      }
      if (h < 55296 || h >= 57344) {
        d[d.length] = ze[224 | h >> 12] + ze[128 | h >> 6 & 63] + ze[128 | h & 63];
        continue;
      }
      f += 1, h = 65536 + ((h & 1023) << 10 | c.charCodeAt(f) & 1023), d[d.length] = ze[240 | h >> 18] + ze[128 | h >> 12 & 63] + ze[128 | h >> 6 & 63] + ze[128 | h & 63];
    }
    s += d.join("");
  }
  return s;
};
function $w(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function Ec(e, t) {
  if (ye(e)) {
    const n = [];
    for (let o = 0; o < e.length; o += 1) n.push(t(e[o]));
    return n;
  }
  return t(e);
}
var Hh = {
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
}, Vh = function(e, t) {
  Array.prototype.push.apply(e, ye(t) ? t : [t]);
}, Cc, oe = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: Dw,
  encodeValuesOnly: !1,
  format: Bh,
  formatter: qh,
  indices: !1,
  serializeDate(e) {
    return (Cc ?? (Cc = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function Lw(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var Ci = {};
function Jh(e, t, n, o, r, i, s, u, c, d, f, h, p, m, g, _, y, T) {
  let E = e, C = T, b = 0, k = !1;
  for (; (C = C.get(Ci)) !== void 0 && !k; ) {
    const R = C.get(e);
    if (b += 1, typeof R < "u") {
      if (R === b) throw new RangeError("Cyclic object value");
      k = !0;
    }
    typeof C.get(Ci) > "u" && (b = 0);
  }
  if (typeof d == "function" ? E = d(t, E) : E instanceof Date ? E = p?.(E) : n === "comma" && ye(E) && (E = Ec(E, function(R) {
    return R instanceof Date ? p?.(R) : R;
  })), E === null) {
    if (i) return c && !_ ? c(t, oe.encoder, y, "key", m) : t;
    E = "";
  }
  if (Lw(E) || $w(E)) {
    if (c) {
      const R = _ ? t : c(t, oe.encoder, y, "key", m);
      return [g?.(R) + "=" + g?.(c(E, oe.encoder, y, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(E))];
  }
  const w = [];
  if (typeof E > "u") return w;
  let D;
  if (n === "comma" && ye(E))
    _ && c && (E = Ec(E, c)), D = [{ value: E.length > 0 ? E.join(",") || null : void 0 }];
  else if (ye(d)) D = d;
  else {
    const R = Object.keys(E);
    D = f ? R.sort(f) : R;
  }
  const I = u ? String(t).replace(/\./g, "%2E") : String(t), x = o && ye(E) && E.length === 1 ? I + "[]" : I;
  if (r && ye(E) && E.length === 0) return x + "[]";
  for (let R = 0; R < D.length; ++R) {
    const F = D[R], X = typeof F == "object" && typeof F.value < "u" ? F.value : E[F];
    if (s && X === null) continue;
    const J = h && u ? F.replace(/\./g, "%2E") : F, V = ye(E) ? typeof n == "function" ? n(x, J) : x : x + (h ? "." + J : "[" + J + "]");
    T.set(e, b);
    const W = /* @__PURE__ */ new WeakMap();
    W.set(Ci, T), Vh(w, Jh(X, V, n, o, r, i, s, u, n === "comma" && _ && ye(E) ? null : c, d, f, h, p, m, g, _, y, W));
  }
  return w;
}
function Uw(e = oe) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || oe.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Bh;
  if (typeof e.format < "u") {
    if (!ds(Sc, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const o = Sc[n];
  let r = oe.filter;
  (typeof e.filter == "function" || ye(e.filter)) && (r = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in Hh ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = oe.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const s = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : oe.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : oe.addQueryPrefix,
    allowDots: s,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : oe.allowEmptyArrays,
    arrayFormat: i,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : oe.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? oe.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : oe.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : oe.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : oe.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : oe.encodeValuesOnly,
    filter: r,
    format: n,
    formatter: o,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : oe.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : oe.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : oe.strictNullHandling
  };
}
function Fw(e, t = {}) {
  let n = e;
  const o = Uw(t);
  let r, i;
  typeof o.filter == "function" ? (i = o.filter, n = i("", n)) : ye(o.filter) && (i = o.filter, r = i);
  const s = [];
  if (typeof n != "object" || n === null) return "";
  const u = Hh[o.arrayFormat], c = u === "comma" && o.commaRoundTrip;
  r || (r = Object.keys(n)), o.sort && r.sort(o.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < r.length; ++p) {
    const m = r[p];
    o.skipNulls && n[m] === null || Vh(s, Jh(n[m], m, u, c, o.allowEmptyArrays, o.strictNullHandling, o.skipNulls, o.encodeDotInKeys, o.encode ? o.encoder : null, o.filter, o.sort, o.allowDots, o.serializeDate, o.format, o.formatter, o.encodeValuesOnly, o.charset, d));
  }
  const f = s.join(o.delimiter);
  let h = o.addQueryPrefix === !0 ? "?" : "";
  return o.charsetSentinel && (o.charset === "iso-8859-1" ? h += "utf8=%26%2310003%3B&" : h += "utf8=%E2%9C%93&"), f.length > 0 ? h + f : "";
}
function Ow(e) {
  return Fw(e, { arrayFormat: "brackets" });
}
function Gw(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var wc;
function aa(e) {
  let t;
  return (wc ?? (t = new globalThis.TextEncoder(), wc = t.encode.bind(t)))(e);
}
var Ic;
function bc(e) {
  let t;
  return (Ic ?? (t = new globalThis.TextDecoder(), Ic = t.decode.bind(t)))(e);
}
var Ce, we, Yr = class {
  constructor() {
    Ce.set(this, void 0), we.set(this, void 0), G(this, Ce, new Uint8Array(), "f"), G(this, we, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? aa(e) : e;
    G(this, Ce, Gw([S(this, Ce, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = Bw(S(this, Ce, "f"), S(this, we, "f"))) != null; ) {
      if (o.carriage && S(this, we, "f") == null) {
        G(this, we, o.index, "f");
        continue;
      }
      if (S(this, we, "f") != null && (o.index !== S(this, we, "f") + 1 || o.carriage)) {
        n.push(bc(S(this, Ce, "f").subarray(0, S(this, we, "f") - 1))), G(this, Ce, S(this, Ce, "f").subarray(S(this, we, "f")), "f"), G(this, we, null, "f");
        continue;
      }
      const r = S(this, we, "f") !== null ? o.preceding - 1 : o.preceding, i = bc(S(this, Ce, "f").subarray(0, r));
      n.push(i), G(this, Ce, S(this, Ce, "f").subarray(o.index), "f"), G(this, we, null, "f");
    }
    return n;
  }
  flush() {
    return S(this, Ce, "f").length ? this.decode(`
`) : [];
  }
};
Ce = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakMap();
Yr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Yr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Bw(e, t) {
  for (let r = t ?? 0; r < e.length; r++) {
    if (e[r] === 10) return {
      preceding: r,
      index: r + 1,
      carriage: !1
    };
    if (e[r] === 13) return {
      preceding: r,
      index: r + 1,
      carriage: !0
    };
  }
  return null;
}
function qw(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var br = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Rc = (e, t, n) => {
  if (e) {
    if (ww(br, e)) return e;
    ae(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(br))}`);
  }
};
function Wn() {
}
function Yo(e, t, n) {
  return !t || br[e] > br[n] ? Wn : t[e].bind(t);
}
var Hw = {
  error: Wn,
  warn: Wn,
  info: Wn,
  debug: Wn
}, Pc = /* @__PURE__ */ new WeakMap();
function ae(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Hw;
  const o = Pc.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: Yo("error", t, n),
    warn: Yo("warn", t, n),
    info: Yo("info", t, n),
    debug: Yo("debug", t, n)
  };
  return Pc.set(t, [n, r]), r;
}
var Mt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Un, fo = class zn {
  constructor(t, n, o) {
    this.iterator = t, Un.set(this, void 0), this.controller = n, G(this, Un, o, "f");
  }
  static fromSSEResponse(t, n, o, r) {
    let i = !1;
    const s = o ? ae(o) : console;
    async function* u() {
      if (i) throw new O("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of Vw(t, n))
          if (!c) {
            if (d.data.startsWith("[DONE]")) {
              c = !0;
              continue;
            }
            if (d.event === null || !d.event.startsWith("thread.")) {
              let f;
              try {
                f = JSON.parse(d.data);
              } catch (h) {
                throw s.error("Could not parse message into JSON:", d.data), s.error("From chunk:", d.raw), h;
              }
              if (f && f.error) throw new de(void 0, f.error, void 0, t.headers);
              yield r ? {
                event: d.event,
                data: f
              } : f;
            } else {
              let f;
              try {
                f = JSON.parse(d.data);
              } catch (h) {
                throw console.error("Could not parse message into JSON:", d.data), console.error("From chunk:", d.raw), h;
              }
              if (d.event == "error") throw new de(void 0, f.error, f.message, void 0);
              yield {
                event: d.event,
                data: f
              };
            }
          }
        c = !0;
      } catch (d) {
        if (ls(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new zn(u, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    async function* i() {
      const u = new Yr(), c = Gh(t);
      for await (const d of c) for (const f of u.decode(d)) yield f;
      for (const d of u.flush()) yield d;
    }
    async function* s() {
      if (r) throw new O("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (ls(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new zn(s, n, o);
  }
  [(Un = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), r = (i) => ({ next: () => {
      if (i.length === 0) {
        const s = o.next();
        t.push(s), n.push(s);
      }
      return i.shift();
    } });
    return [new zn(() => r(t), this.controller, S(this, Un, "f")), new zn(() => r(n), this.controller, S(this, Un, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Fh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const s = aa(JSON.stringify(r) + `
`);
          o.enqueue(s);
        } catch (r) {
          o.error(r);
        }
      },
      async cancel() {
        await n.return?.();
      }
    });
  }
};
async function* Vw(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new O("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new O("Attempted to iterate over a response with no body");
  const n = new Kw(), o = new Yr(), r = Gh(e.body);
  for await (const i of Jw(r)) for (const s of o.decode(i)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const s = n.decode(i);
    s && (yield s);
  }
}
async function* Jw(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? aa(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = qw(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Kw = class {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length) return null;
      const r = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], r;
    }
    if (this.chunks.push(e), e.startsWith(":")) return null;
    let [t, n, o] = Ww(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Ww(e, t) {
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
async function Kh(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, s = await (async () => {
    if (t.options.stream)
      return ae(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : fo.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Wh(await n.json(), n) : await n.text();
  })();
  return ae(e).debug(`[${o}] response parsed`, Mt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
function Wh(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Yn, zh = class Yh extends Promise {
  constructor(t, n, o = Kh) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, Yn.set(this, void 0), G(this, Yn, t, "f");
  }
  _thenUnwrap(t) {
    return new Yh(S(this, Yn, "f"), this.responsePromise, async (n, o) => Wh(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(S(this, Yn, "f"), t))), this.parsedPromise;
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
var Xo, Xr = class {
  constructor(e, t, n, o) {
    Xo.set(this, void 0), G(this, Xo, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new O("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await S(this, Xo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Xo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, zw = class extends zh {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await Kh(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Et = class extends Xr {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, Q = class extends Xr {
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
        ...sa(this.options.query),
        after: t
      }
    } : null;
  }
}, ce = class extends Xr {
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
        ...sa(this.options.query),
        after: e
      }
    } : null;
  }
}, dt = class extends Xr {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.has_more = n.has_more || !1, this.next = n.next || null;
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
}, Yw = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, Xw = "urn:ietf:params:oauth:grant-type:token-exchange", Qw = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Uh();
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
      grant_type: Xw,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: Yw[this.config.provider.tokenType],
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
      let s;
      try {
        s = JSON.parse(i);
      } catch {
      }
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new Lh(t.status, s, t.headers) : de.generate(t.status, s, `Token exchange failed with status ${t.status}`, t.headers);
    }
    const n = await t.json(), o = n.expires_in || 3600, r = Date.now() + o * 1e3;
    return this.cachedToken = {
      token: n.access_token,
      expiresAt: r
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
}, Xh = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function oo(e, t, n) {
  return Xh(), new File(e, t ?? "unknown_file", n);
}
function lr(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var la = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Qr = async (e, t) => fs(e.body) ? {
  ...e,
  body: await Qh(e.body, t)
} : e, Xe = async (e, t) => ({
  ...e,
  body: await Qh(e.body, t)
}), Mc = /* @__PURE__ */ new WeakMap();
function Zw(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Mc.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return Mc.set(t, o), o;
}
var Qh = async (e, t) => {
  if (!await Zw(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, r]) => hs(n, o, r))), n;
}, Zh = (e) => e instanceof Blob && "name" in e, jw = (e) => typeof e == "object" && e !== null && (e instanceof Response || la(e) || Zh(e)), fs = (e) => {
  if (jw(e)) return !0;
  if (Array.isArray(e)) return e.some(fs);
  if (e && typeof e == "object") {
    for (const t in e) if (fs(e[t])) return !0;
  }
  return !1;
}, hs = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, oo([await n.blob()], lr(n)));
    else if (la(n)) e.append(t, oo([await new Response(Oh(n)).blob()], lr(n)));
    else if (Zh(n)) e.append(t, n, lr(n));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => hs(e, t + "[]", o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, r]) => hs(e, `${t}[${o}]`, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, jh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", eI = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && jh(e), tI = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function nI(e, t, n) {
  if (Xh(), e = await e, eI(e))
    return e instanceof File ? e : oo([await e.arrayBuffer()], e.name);
  if (tI(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), oo(await ps(r), t, n);
  }
  const o = await ps(e);
  if (t || (t = lr(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return oo(o, t, n);
}
async function ps(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (jh(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (la(e)) for await (const n of e) t.push(...await ps(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${oI(e)}`);
  }
  return t;
}
function oI(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var M = class {
  constructor(e) {
    this._client = e;
  }
};
function ep(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Nc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), rI = (e = ep) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], s = n.reduce((f, h, p) => {
    /[?#]/.test(h) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Nc) ?? Nc)?.toString) && (g = m + "", i.push({
      start: f.length + h.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), f + h + (p === o.length ? "" : g);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let d;
  for (; (d = c.exec(u)) !== null; ) i.push({
    start: d.index,
    length: d[0].length,
    error: `Value "${d[0]}" can't be safely passed as a path parameter`
  });
  if (i.sort((f, h) => f.start - h.start), i.length > 0) {
    let f = 0;
    const h = i.reduce((p, m) => {
      const g = " ".repeat(m.start - f), _ = "^".repeat(m.length);
      return f = m.start + m.length, p + g + _;
    }, "");
    throw new O(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${s}
${h}`);
  }
  return s;
}, v = /* @__PURE__ */ rI(ep), tp = class extends M {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/chat/completions/${e}/messages`, Q, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function Rr(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function ua(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function Co(e) {
  return e?.$brand === "auto-parseable-tool";
}
function iI(e, t) {
  return !t || !np(t) ? {
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
  const n = e.choices.map((o) => {
    if (o.finish_reason === "length") throw new Dh();
    if (o.finish_reason === "content_filter") throw new $h();
    return op(o.message.tool_calls), {
      ...o,
      message: {
        ...o.message,
        ...o.message.tool_calls ? { tool_calls: o.message.tool_calls?.map((r) => aI(t, r)) ?? void 0 } : void 0,
        parsed: o.message.content && !o.message.refusal ? sI(t, o.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function sI(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function aI(e, t) {
  const n = e.tools?.find((o) => Rr(o) && o.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: Co(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function lI(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((o) => Rr(o) && o.function?.name === t.function.name);
  return Rr(n) && (Co(n) || n?.function.strict || !1);
}
function np(e) {
  return ua(e.response_format) ? !0 : e.tools?.some((t) => Co(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function op(e) {
  for (const t of e || []) if (t.type !== "function") throw new O(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function uI(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new O(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new O(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Pr = (e) => e?.role === "assistant", rp = (e) => e?.role === "tool", ms, ur, cr, Xn, Qn, dr, Zn, nt, jn, Mr, Nr, Xt, ip, da = class {
  constructor() {
    ms.add(this), this.controller = new AbortController(), ur.set(this, void 0), cr.set(this, () => {
    }), Xn.set(this, () => {
    }), Qn.set(this, void 0), dr.set(this, () => {
    }), Zn.set(this, () => {
    }), nt.set(this, {}), jn.set(this, !1), Mr.set(this, !1), Nr.set(this, !1), Xt.set(this, !1), G(this, ur, new Promise((e, t) => {
      G(this, cr, e, "f"), G(this, Xn, t, "f");
    }), "f"), G(this, Qn, new Promise((e, t) => {
      G(this, dr, e, "f"), G(this, Zn, t, "f");
    }), "f"), S(this, ur, "f").catch(() => {
    }), S(this, Qn, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, S(this, ms, "m", ip).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (S(this, cr, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return S(this, jn, "f");
  }
  get errored() {
    return S(this, Mr, "f");
  }
  get aborted() {
    return S(this, Nr, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (S(this, nt, "f")[e] || (S(this, nt, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = S(this, nt, "f")[e];
    if (!n) return this;
    const o = n.findIndex((r) => r.listener === t);
    return o >= 0 && n.splice(o, 1), this;
  }
  once(e, t) {
    return (S(this, nt, "f")[e] || (S(this, nt, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      G(this, Xt, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    G(this, Xt, !0, "f"), await S(this, Qn, "f");
  }
  _emit(e, ...t) {
    if (S(this, jn, "f")) return;
    e === "end" && (G(this, jn, !0, "f"), S(this, dr, "f").call(this));
    const n = S(this, nt, "f")[e];
    if (n && (S(this, nt, "f")[e] = n.filter((o) => !o.once), n.forEach(({ listener: o }) => o(...t))), e === "abort") {
      const o = t[0];
      !S(this, Xt, "f") && !n?.length && Promise.reject(o), S(this, Xn, "f").call(this, o), S(this, Zn, "f").call(this, o), this._emit("end");
      return;
    }
    if (e === "error") {
      const o = t[0];
      !S(this, Xt, "f") && !n?.length && Promise.reject(o), S(this, Xn, "f").call(this, o), S(this, Zn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
ur = /* @__PURE__ */ new WeakMap(), cr = /* @__PURE__ */ new WeakMap(), Xn = /* @__PURE__ */ new WeakMap(), Qn = /* @__PURE__ */ new WeakMap(), dr = /* @__PURE__ */ new WeakMap(), Zn = /* @__PURE__ */ new WeakMap(), nt = /* @__PURE__ */ new WeakMap(), jn = /* @__PURE__ */ new WeakMap(), Mr = /* @__PURE__ */ new WeakMap(), Nr = /* @__PURE__ */ new WeakMap(), Xt = /* @__PURE__ */ new WeakMap(), ms = /* @__PURE__ */ new WeakSet(), ip = function(t) {
  if (G(this, Mr, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new xe()), t instanceof xe)
    return G(this, Nr, !0, "f"), this._emit("abort", t);
  if (t instanceof O) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new O(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new O(String(t)));
};
function cI(e) {
  return typeof e.parse == "function";
}
var fe, gs, xr, _s, ys, vs, sp, ap, dI = 10, lp = class extends da {
  constructor() {
    super(...arguments), fe.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), rp(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (Pr(e) && e.tool_calls)
        for (const n of e.tool_calls) n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e) throw new O("stream ended without producing a ChatCompletion");
    return e;
  }
  async finalContent() {
    return await this.done(), S(this, fe, "m", gs).call(this);
  }
  async finalMessage() {
    return await this.done(), S(this, fe, "m", xr).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), S(this, fe, "m", _s).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), S(this, fe, "m", ys).call(this);
  }
  async totalUsage() {
    return await this.done(), S(this, fe, "m", vs).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = S(this, fe, "m", xr).call(this);
    t && this._emit("finalMessage", t);
    const n = S(this, fe, "m", gs).call(this);
    n && this._emit("finalContent", n);
    const o = S(this, fe, "m", _s).call(this);
    o && this._emit("finalFunctionToolCall", o);
    const r = S(this, fe, "m", ys).call(this);
    r != null && this._emit("finalFunctionToolCallResult", r), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", S(this, fe, "m", vs).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), S(this, fe, "m", sp).call(this, t);
    const r = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(ca(r, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const o of t.messages) this._addMessage(o, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const o = "tool", { tool_choice: r = "auto", stream: i, ...s } = t, u = typeof r != "string" && r.type === "function" && r?.function?.name, { maxChatCompletions: c = dI } = n || {}, d = t.tools.map((p) => {
      if (Co(p)) {
        if (!p.$callback) throw new O("Tool given to `.runTools()` that does not have an associated function");
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
    }), f = {};
    for (const p of d) p.type === "function" && (f[p.function.name || p.function.function.name] = p.function);
    const h = "tools" in t ? d.map((p) => p.type === "function" ? {
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
        ...s,
        tool_choice: r,
        tools: h,
        messages: [...this.messages]
      }, n)).choices[0]?.message;
      if (!m) throw new O("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const _ = g.id, { name: y, arguments: T } = g.function, E = f[y];
        if (E) {
          if (u && u !== y) {
            const w = `Invalid tool_call: ${JSON.stringify(y)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: o,
              tool_call_id: _,
              content: w
            });
            continue;
          }
        } else {
          const w = `Invalid tool_call: ${JSON.stringify(y)}. Available options are: ${Object.keys(f).map((D) => JSON.stringify(D)).join(", ")}. Please try again`;
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: w
          });
          continue;
        }
        let C;
        try {
          C = cI(E) ? await E.parse(T) : T;
        } catch (w) {
          const D = w instanceof Error ? w.message : String(w);
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: D
          });
          continue;
        }
        const b = await E.function(C, this), k = S(this, fe, "m", ap).call(this, b);
        if (this._addMessage({
          role: o,
          tool_call_id: _,
          content: k
        }), u) return;
      }
    }
  }
};
fe = /* @__PURE__ */ new WeakSet(), gs = function() {
  return S(this, fe, "m", xr).call(this).content ?? null;
}, xr = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (Pr(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new O("stream ended without producing a ChatCompletionMessage with role=assistant");
}, _s = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Pr(n) && n?.tool_calls?.length) for (let o = n.tool_calls.length - 1; o >= 0; o--) {
      const r = n.tool_calls[o];
      if (r?.type === "function") return r.function;
    }
  }
}, ys = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (rp(n) && n.content != null && typeof n.content == "string" && this.messages.some((o) => o.role === "assistant" && o.tool_calls?.some((r) => r.type === "function" && r.id === n.tool_call_id))) return n.content;
  }
}, vs = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, sp = function(t) {
  if (t.n != null && t.n > 1) throw new O("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, ap = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var fI = class up extends lp {
  static runTools(t, n, o) {
    const r = new up(), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), Pr(t) && t.content && this._emit("content", t.content);
  }
}, ie = {
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
}, hI = class extends Error {
}, pI = class extends Error {
};
function mI(e, t = ie.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return gI(e.trim(), t);
}
var gI = (e, t) => {
  const n = e.length;
  let o = 0;
  const r = (p) => {
    throw new hI(`${p} at position ${o}`);
  }, i = (p) => {
    throw new pI(`${p} at position ${o}`);
  }, s = () => (h(), o >= n && r("Unexpected end of input"), e[o] === '"' ? u() : e[o] === "{" ? c() : e[o] === "[" ? d() : e.substring(o, o + 4) === "null" || ie.NULL & t && n - o < 4 && "null".startsWith(e.substring(o)) ? (o += 4, null) : e.substring(o, o + 4) === "true" || ie.BOOL & t && n - o < 4 && "true".startsWith(e.substring(o)) ? (o += 4, !0) : e.substring(o, o + 5) === "false" || ie.BOOL & t && n - o < 5 && "false".startsWith(e.substring(o)) ? (o += 5, !1) : e.substring(o, o + 8) === "Infinity" || ie.INFINITY & t && n - o < 8 && "Infinity".startsWith(e.substring(o)) ? (o += 8, 1 / 0) : e.substring(o, o + 9) === "-Infinity" || ie.MINUS_INFINITY & t && 1 < n - o && n - o < 9 && "-Infinity".startsWith(e.substring(o)) ? (o += 9, -1 / 0) : e.substring(o, o + 3) === "NaN" || ie.NAN & t && n - o < 3 && "NaN".startsWith(e.substring(o)) ? (o += 3, NaN) : f()), u = () => {
    const p = o;
    let m = !1;
    for (o++; o < n && (e[o] !== '"' || m && e[o - 1] === "\\"); )
      m = e[o] === "\\" ? !m : !1, o++;
    if (e.charAt(o) == '"') try {
      return JSON.parse(e.substring(p, ++o - Number(m)));
    } catch (g) {
      i(String(g));
    }
    else if (ie.STR & t) try {
      return JSON.parse(e.substring(p, o - Number(m)) + '"');
    } catch {
      return JSON.parse(e.substring(p, e.lastIndexOf("\\")) + '"');
    }
    r("Unterminated string literal");
  }, c = () => {
    o++, h();
    const p = {};
    try {
      for (; e[o] !== "}"; ) {
        if (h(), o >= n && ie.OBJ & t) return p;
        const m = u();
        h(), o++;
        try {
          const g = s();
          Object.defineProperty(p, m, {
            value: g,
            writable: !0,
            enumerable: !0,
            configurable: !0
          });
        } catch (g) {
          if (ie.OBJ & t) return p;
          throw g;
        }
        h(), e[o] === "," && o++;
      }
    } catch {
      if (ie.OBJ & t) return p;
      r("Expected '}' at end of object");
    }
    return o++, p;
  }, d = () => {
    o++;
    const p = [];
    try {
      for (; e[o] !== "]"; )
        p.push(s()), h(), e[o] === "," && o++;
    } catch {
      if (ie.ARR & t) return p;
      r("Expected ']' at end of array");
    }
    return o++, p;
  }, f = () => {
    if (o === 0) {
      e === "-" && ie.NUM & t && r("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (ie.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        i(String(m));
      }
    }
    const p = o;
    for (e[o] === "-" && o++; e[o] && !",]}".includes(e[o]); ) o++;
    o == n && !(ie.NUM & t) && r("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, o));
    } catch {
      e.substring(p, o) === "-" && ie.NUM & t && r("Not sure what '-' is");
      try {
        return JSON.parse(e.substring(p, e.lastIndexOf("e")));
      } catch (g) {
        i(String(g));
      }
    }
  }, h = () => {
    for (; o < n && [
      32,
      10,
      13,
      9
    ].includes(e.charCodeAt(o)); ) o++;
  };
  return s();
}, xc = (e) => mI(e, ie.ALL ^ ie.NUM), te, tt, Jt, mt, wi, Qo, Ii, bi, Ri, Zo, Pi, kc, cp = class As extends lp {
  constructor(t) {
    super(), te.add(this), tt.set(this, void 0), Jt.set(this, void 0), mt.set(this, void 0), G(this, tt, t, "f"), G(this, Jt, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return S(this, mt, "f");
  }
  static fromReadableStream(t) {
    const n = new As(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, o) {
    const r = new As(n);
    return r._run(() => r._runChatCompletion(t, {
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
  async _createChatCompletion(t, n, o) {
    super._createChatCompletion;
    const r = o?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), S(this, te, "m", wi).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const s of i) S(this, te, "m", Ii).call(this, s);
    if (i.controller.signal?.aborted) throw new xe();
    return this._addChatCompletion(S(this, te, "m", Zo).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), S(this, te, "m", wi).call(this), this._connected();
    const r = fo.fromReadableStream(t, this.controller);
    let i;
    for await (const s of r)
      i && i !== s.id && this._addChatCompletion(S(this, te, "m", Zo).call(this)), S(this, te, "m", Ii).call(this, s), i = s.id;
    if (r.controller.signal?.aborted) throw new xe();
    return this._addChatCompletion(S(this, te, "m", Zo).call(this));
  }
  [(tt = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakMap(), mt = /* @__PURE__ */ new WeakMap(), te = /* @__PURE__ */ new WeakSet(), wi = function() {
    this.ended || G(this, mt, void 0, "f");
  }, Qo = function(n) {
    let o = S(this, Jt, "f")[n.index];
    return o || (o = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, S(this, Jt, "f")[n.index] = o, o);
  }, Ii = function(n) {
    if (this.ended) return;
    const o = S(this, te, "m", kc).call(this, n);
    this._emit("chunk", n, o);
    for (const r of n.choices) {
      const i = o.choices[r.index];
      r.delta.content != null && i.message?.role === "assistant" && i.message?.content && (this._emit("content", r.delta.content, i.message.content), this._emit("content.delta", {
        delta: r.delta.content,
        snapshot: i.message.content,
        parsed: i.message.parsed
      })), r.delta.refusal != null && i.message?.role === "assistant" && i.message?.refusal && this._emit("refusal.delta", {
        delta: r.delta.refusal,
        snapshot: i.message.refusal
      }), r.logprobs?.content != null && i.message?.role === "assistant" && this._emit("logprobs.content.delta", {
        content: r.logprobs?.content,
        snapshot: i.logprobs?.content ?? []
      }), r.logprobs?.refusal != null && i.message?.role === "assistant" && this._emit("logprobs.refusal.delta", {
        refusal: r.logprobs?.refusal,
        snapshot: i.logprobs?.refusal ?? []
      });
      const s = S(this, te, "m", Qo).call(this, i);
      i.finish_reason && (S(this, te, "m", Ri).call(this, i), s.current_tool_call_index != null && S(this, te, "m", bi).call(this, i, s.current_tool_call_index));
      for (const u of r.delta.tool_calls ?? [])
        s.current_tool_call_index !== u.index && (S(this, te, "m", Ri).call(this, i), s.current_tool_call_index != null && S(this, te, "m", bi).call(this, i, s.current_tool_call_index)), s.current_tool_call_index = u.index;
      for (const u of r.delta.tool_calls ?? []) {
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
  }, bi = function(n, o) {
    if (S(this, te, "m", Qo).call(this, n).done_tool_calls.has(o)) return;
    const r = n.message.tool_calls?.[o];
    if (!r) throw new Error("no tool call snapshot");
    if (!r.type) throw new Error("tool call snapshot missing `type`");
    if (r.type === "function") {
      const i = S(this, tt, "f")?.tools?.find((s) => Rr(s) && s.function.name === r.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: r.function.name,
        index: o,
        arguments: r.function.arguments,
        parsed_arguments: Co(i) ? i.$parseRaw(r.function.arguments) : i?.function.strict ? JSON.parse(r.function.arguments) : null
      });
    } else r.type;
  }, Ri = function(n) {
    const o = S(this, te, "m", Qo).call(this, n);
    if (n.message.content && !o.content_done) {
      o.content_done = !0;
      const r = S(this, te, "m", Pi).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: r ? r.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !o.refusal_done && (o.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !o.logprobs_content_done && (o.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !o.logprobs_refusal_done && (o.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Zo = function() {
    if (this.ended) throw new O("stream has ended, this shouldn't happen");
    const n = S(this, mt, "f");
    if (!n) throw new O("request ended without sending any chunks");
    return G(this, mt, void 0, "f"), G(this, Jt, [], "f"), _I(n, S(this, tt, "f"));
  }, Pi = function() {
    const n = S(this, tt, "f")?.response_format;
    return ua(n) ? n : null;
  }, kc = function(n) {
    var o, r, i, s;
    let u = S(this, mt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = G(this, mt, {
      ...d,
      choices: []
    }, "f");
    for (const { delta: f, finish_reason: h, index: p, logprobs: m = null, ...g } of n.choices) {
      let _ = u.choices[p];
      if (_ || (_ = u.choices[p] = {
        finish_reason: h,
        index: p,
        message: {},
        logprobs: m,
        ...g
      }), m) if (!_.logprobs) _.logprobs = Object.assign({}, m);
      else {
        const { content: w, refusal: D, ...I } = m;
        Object.assign(_.logprobs, I), w && ((o = _.logprobs).content ?? (o.content = []), _.logprobs.content.push(...w)), D && ((r = _.logprobs).refusal ?? (r.refusal = []), _.logprobs.refusal.push(...D));
      }
      if (h && (_.finish_reason = h, S(this, tt, "f") && np(S(this, tt, "f")))) {
        if (h === "length") throw new Dh();
        if (h === "content_filter") throw new $h();
      }
      if (Object.assign(_, g), !f) continue;
      const { content: y, refusal: T, function_call: E, role: C, tool_calls: b, ...k } = f;
      if (Object.assign(_.message, k), T && (_.message.refusal = (_.message.refusal || "") + T), C && (_.message.role = C), E && (_.message.function_call ? (E.name && (_.message.function_call.name = E.name), E.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += E.arguments)) : _.message.function_call = E), y && (_.message.content = (_.message.content || "") + y, !_.message.refusal && S(this, te, "m", Pi).call(this) && (_.message.parsed = xc(_.message.content))), b) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: w, id: D, type: I, function: x, ...R } of b) {
          const F = (s = _.message.tool_calls)[w] ?? (s[w] = {});
          Object.assign(F, R), D && (F.id = D), I && (F.type = I), x && (F.function ?? (F.function = {
            name: x.name ?? "",
            arguments: ""
          })), x?.name && (F.function.name = x.name), x?.arguments && (F.function.arguments += x.arguments, lI(S(this, tt, "f"), F) && (F.function.parsed_arguments = xc(F.function.arguments)));
        }
      }
    }
    return u;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("chunk", (r) => {
      const i = n.shift();
      i ? i.resolve(r) : t.push(r);
    }), this.on("end", () => {
      o = !0;
      for (const r of n) r.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), this.on("error", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((r, i) => n.push({
        resolve: r,
        reject: i
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
  toReadableStream() {
    return new fo(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function _I(e, t) {
  const { id: n, choices: o, created: r, model: i, system_fingerprint: s, ...u } = e;
  return iI({
    ...u,
    id: n,
    choices: o.map(({ message: c, finish_reason: d, index: f, logprobs: h, ...p }) => {
      if (!d) throw new O(`missing finish_reason for choice ${f}`);
      const { content: m = null, function_call: g, tool_calls: _, ...y } = c, T = c.role;
      if (!T) throw new O(`missing role for choice ${f}`);
      if (g) {
        const { arguments: E, name: C } = g;
        if (E == null) throw new O(`missing function_call.arguments for choice ${f}`);
        if (!C) throw new O(`missing function_call.name for choice ${f}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: E,
              name: C
            },
            role: T,
            refusal: c.refusal ?? null
          },
          finish_reason: d,
          index: f,
          logprobs: h
        };
      }
      return _ ? {
        ...p,
        index: f,
        finish_reason: d,
        logprobs: h,
        message: {
          ...y,
          role: T,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: _.map((E, C) => {
            const { function: b, type: k, id: w, ...D } = E, { arguments: I, name: x, ...R } = b || {};
            if (w == null) throw new O(`missing choices[${f}].tool_calls[${C}].id
${jo(e)}`);
            if (k == null) throw new O(`missing choices[${f}].tool_calls[${C}].type
${jo(e)}`);
            if (x == null) throw new O(`missing choices[${f}].tool_calls[${C}].function.name
${jo(e)}`);
            if (I == null) throw new O(`missing choices[${f}].tool_calls[${C}].function.arguments
${jo(e)}`);
            return {
              ...D,
              id: w,
              type: k,
              function: {
                ...R,
                name: x,
                arguments: I
              }
            };
          })
        }
      } : {
        ...p,
        message: {
          ...y,
          content: m,
          role: T,
          refusal: c.refusal ?? null
        },
        finish_reason: d,
        index: f,
        logprobs: h
      };
    }),
    created: r,
    model: i,
    object: "chat.completion",
    ...s ? { system_fingerprint: s } : {}
  }, t);
}
function jo(e) {
  return JSON.stringify(e);
}
var yI = class Ts extends cp {
  static fromReadableStream(t) {
    const n = new Ts(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, o) {
    const r = new Ts(n), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
}, fa = class extends M {
  constructor() {
    super(...arguments), this.messages = new tp(this._client);
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
    return this._client.getAPIList("/chat/completions", Q, {
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
    return uI(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => ca(n, e));
  }
  runTools(e, t) {
    return e.stream ? yI.runTools(this._client, e, t) : fI.runTools(this._client, e, t);
  }
  stream(e, t) {
    return cp.createChatCompletion(this._client, e, t);
  }
};
fa.Messages = tp;
var ha = class extends M {
  constructor() {
    super(...arguments), this.completions = new fa(this._client);
  }
};
ha.Completions = fa;
var dp = class extends M {
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
    return this._client.getAPIList("/organization/admin_api_keys", Q, {
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
}, fp = class extends M {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", ce, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, hp = class extends M {
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
    return this._client.getAPIList("/organization/certificates", ce, {
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
    return this._client.getAPIList("/organization/certificates/activate", Et, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", Et, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, pp = class extends M {
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
}, mp = class extends M {
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
    return this._client.getAPIList("/organization/invites", ce, {
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
}, gp = class extends M {
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
    return this._client.getAPIList("/organization/roles", dt, {
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
}, _p = class extends M {
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
    return this._client.getAPIList("/organization/spend_alerts", ce, {
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
}, yp = class extends M {
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
}, vp = class extends M {
  create(e, t, n) {
    return this._client.post(v`/organization/groups/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { group_id: o } = t;
    return this._client.get(v`/organization/groups/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/groups/${e}/roles`, dt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { group_id: o } = t;
    return this._client.delete(v`/organization/groups/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ap = class extends M {
  create(e, t, n) {
    return this._client.post(v`/organization/groups/${e}/users`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { group_id: o } = t;
    return this._client.get(v`/organization/groups/${o}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/groups/${e}/users`, dt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { group_id: o } = t;
    return this._client.delete(v`/organization/groups/${o}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Zr = class extends M {
  constructor() {
    super(...arguments), this.users = new Ap(this._client), this.roles = new vp(this._client);
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
    return this._client.getAPIList("/organization/groups", dt, {
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
Zr.Users = Ap;
Zr.Roles = vp;
var Tp = class extends M {
  retrieve(e, t, n) {
    const { project_id: o } = t;
    return this._client.get(v`/organization/projects/${o}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/api_keys`, ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o } = t;
    return this._client.delete(v`/organization/projects/${o}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Sp = class extends M {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates`, ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/activate`, Et, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/deactivate`, Et, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ep = class extends M {
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
}, Cp = class extends M {
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
}, wp = class extends M {
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
}, Ip = class extends M {
  listRateLimits(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/rate_limits`, ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  updateRateLimit(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/organization/projects/${o}/rate_limits/${e}`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, bp = class extends M {
  create(e, t, n) {
    return this._client.post(v`/projects/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o } = t;
    return this._client.get(v`/projects/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/projects/${o}/roles/${e}`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/projects/${e}/roles`, dt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o } = t;
    return this._client.delete(v`/projects/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Rp = class extends M {
  create(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/service_accounts`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o } = t;
    return this._client.get(v`/organization/projects/${o}/service_accounts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/organization/projects/${o}/service_accounts/${e}`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/service_accounts`, ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o } = t;
    return this._client.delete(v`/organization/projects/${o}/service_accounts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Pp = class extends M {
  create(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/spend_alerts`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o } = t;
    return this._client.get(v`/organization/projects/${o}/spend_alerts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/organization/projects/${o}/spend_alerts/${e}`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/spend_alerts`, ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o } = t;
    return this._client.delete(v`/organization/projects/${o}/spend_alerts/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Mp = class extends M {
  create(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/projects/${o}/groups/${e}/roles`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o, group_id: r } = t;
    return this._client.get(v`/projects/${o}/groups/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.getAPIList(v`/projects/${o}/groups/${e}/roles`, dt, {
      query: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o, group_id: r } = t;
    return this._client.delete(v`/projects/${o}/groups/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, pa = class extends M {
  constructor() {
    super(...arguments), this.roles = new Mp(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/groups`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.get(v`/organization/projects/${o}/groups/${e}`, {
      query: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/groups`, dt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o } = t;
    return this._client.delete(v`/organization/projects/${o}/groups/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
pa.Roles = Mp;
var Np = class extends M {
  create(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/projects/${o}/users/${e}/roles`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o, user_id: r } = t;
    return this._client.get(v`/projects/${o}/users/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.getAPIList(v`/projects/${o}/users/${e}/roles`, dt, {
      query: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o, user_id: r } = t;
    return this._client.delete(v`/projects/${o}/users/${r}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, ma = class extends M {
  constructor() {
    super(...arguments), this.roles = new Np(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/organization/projects/${e}/users`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { project_id: o } = t;
    return this._client.get(v`/organization/projects/${o}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  update(e, t, n) {
    const { project_id: o, ...r } = t;
    return this._client.post(v`/organization/projects/${o}/users/${e}`, {
      body: r,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/users`, ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { project_id: o } = t;
    return this._client.delete(v`/organization/projects/${o}/users/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
};
ma.Roles = Np;
var Re = class extends M {
  constructor() {
    super(...arguments), this.users = new ma(this._client), this.serviceAccounts = new Rp(this._client), this.apiKeys = new Tp(this._client), this.rateLimits = new Ip(this._client), this.modelPermissions = new wp(this._client), this.hostedToolPermissions = new Cp(this._client), this.groups = new pa(this._client), this.roles = new bp(this._client), this.dataRetention = new Ep(this._client), this.spendAlerts = new Pp(this._client), this.certificates = new Sp(this._client);
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
    return this._client.getAPIList("/organization/projects", ce, {
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
Re.Users = ma;
Re.ServiceAccounts = Rp;
Re.APIKeys = Tp;
Re.RateLimits = Ip;
Re.ModelPermissions = wp;
Re.HostedToolPermissions = Cp;
Re.Groups = pa;
Re.Roles = bp;
Re.DataRetention = Ep;
Re.SpendAlerts = Pp;
Re.Certificates = Sp;
var xp = class extends M {
  create(e, t, n) {
    return this._client.post(v`/organization/users/${e}/roles`, {
      body: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { user_id: o } = t;
    return this._client.get(v`/organization/users/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/users/${e}/roles`, dt, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { user_id: o } = t;
    return this._client.delete(v`/organization/users/${o}/roles/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, ga = class extends M {
  constructor() {
    super(...arguments), this.roles = new xp(this._client);
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
    return this._client.getAPIList("/organization/users", ce, {
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
ga.Roles = xp;
var Pe = class extends M {
  constructor() {
    super(...arguments), this.auditLogs = new fp(this._client), this.adminAPIKeys = new dp(this._client), this.usage = new yp(this._client), this.invites = new mp(this._client), this.users = new ga(this._client), this.groups = new Zr(this._client), this.roles = new gp(this._client), this.dataRetention = new pp(this._client), this.spendAlerts = new _p(this._client), this.certificates = new hp(this._client), this.projects = new Re(this._client);
  }
};
Pe.AuditLogs = fp;
Pe.AdminAPIKeys = dp;
Pe.Usage = yp;
Pe.Invites = mp;
Pe.Users = ga;
Pe.Groups = Zr;
Pe.Roles = gp;
Pe.DataRetention = pp;
Pe.SpendAlerts = _p;
Pe.Certificates = hp;
Pe.Projects = Re;
var _a = class extends M {
  constructor() {
    super(...arguments), this.organization = new Pe(this._client);
  }
};
_a.Organization = Pe;
var kp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* vI(e) {
  if (!e) return;
  if (kp in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : gc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = gc(o[1]) ? o[1] : [o[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [r, null]), yield [r, u]);
  }
}
var L = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, s] of vI(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [kp]: !0,
    values: t,
    nulls: n
  };
}, Dp = class extends M {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: L([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, $p = class extends M {
  create(e, t) {
    return this._client.post("/audio/transcriptions", Xe({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Lp = class extends M {
  create(e, t) {
    return this._client.post("/audio/translations", Xe({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, wo = class extends M {
  constructor() {
    super(...arguments), this.transcriptions = new $p(this._client), this.translations = new Lp(this._client), this.speech = new Dp(this._client);
  }
};
wo.Transcriptions = $p;
wo.Translations = Lp;
wo.Speech = Dp;
var Up = class extends M {
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
    return this._client.getAPIList("/batches", Q, {
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
}, Fp = class extends M {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/assistants/${e}`, {
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/assistants/${e}`, {
      body: t,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", Q, {
      query: e,
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/assistants/${e}`, {
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Op = class extends M {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Gp = class extends M {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, jr = class extends M {
  constructor() {
    super(...arguments), this.sessions = new Op(this._client), this.transcriptionSessions = new Gp(this._client);
  }
};
jr.Sessions = Op;
jr.TranscriptionSessions = Gp;
var Bp = class extends M {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: L([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(v`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: L([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, qp = class extends M {
  retrieve(e, t) {
    return this._client.get(v`/chatkit/threads/${e}`, {
      ...t,
      headers: L([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", ce, {
      query: e,
      ...t,
      headers: L([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/chatkit/threads/${e}`, {
      ...t,
      headers: L([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(v`/chatkit/threads/${e}/items`, ce, {
      query: t,
      ...n,
      headers: L([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, ei = class extends M {
  constructor() {
    super(...arguments), this.sessions = new Bp(this._client), this.threads = new qp(this._client);
  }
};
ei.Sessions = Bp;
ei.Threads = qp;
var Hp = class extends M {
  create(e, t, n) {
    return this._client.post(v`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(v`/threads/${o}/messages/${e}`, {
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/messages/${e}`, {
      body: r,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/threads/${e}/messages`, Q, {
      query: t,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { thread_id: o } = t;
    return this._client.delete(v`/threads/${o}/messages/${e}`, {
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Vp = class extends M {
  retrieve(e, t, n) {
    const { thread_id: o, run_id: r, ...i } = t;
    return this._client.get(v`/threads/${o}/runs/${r}/steps/${e}`, {
      query: i,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.getAPIList(v`/threads/${o}/runs/${e}/steps`, Q, {
      query: r,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, AI = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, o = new Uint8Array(n);
    for (let r = 0; r < n; r++) o[r] = t.charCodeAt(r);
    return Array.from(new Float32Array(o.buffer));
  }
}, gt = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, le, Lt, Ss, Ye, fr, Fe, Ut, nn, xt, kr, Ie, hr, pr, ro, eo, to, Dc, $c, Lc, Uc, Fc, Oc, Gc, io = class extends da {
  constructor() {
    super(...arguments), le.add(this), Ss.set(this, []), Ye.set(this, {}), fr.set(this, {}), Fe.set(this, void 0), Ut.set(this, void 0), nn.set(this, void 0), xt.set(this, void 0), kr.set(this, void 0), Ie.set(this, void 0), hr.set(this, void 0), pr.set(this, void 0), ro.set(this, void 0);
  }
  [(Ss = /* @__PURE__ */ new WeakMap(), Ye = /* @__PURE__ */ new WeakMap(), fr = /* @__PURE__ */ new WeakMap(), Fe = /* @__PURE__ */ new WeakMap(), Ut = /* @__PURE__ */ new WeakMap(), nn = /* @__PURE__ */ new WeakMap(), xt = /* @__PURE__ */ new WeakMap(), kr = /* @__PURE__ */ new WeakMap(), Ie = /* @__PURE__ */ new WeakMap(), hr = /* @__PURE__ */ new WeakMap(), pr = /* @__PURE__ */ new WeakMap(), ro = /* @__PURE__ */ new WeakMap(), le = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const e = [], t = [];
    let n = !1;
    return this.on("event", (o) => {
      const r = t.shift();
      r ? r.resolve(o) : e.push(o);
    }), this.on("end", () => {
      n = !0;
      for (const o of t) o.resolve(void 0);
      t.length = 0;
    }), this.on("abort", (o) => {
      n = !0;
      for (const r of t) r.reject(o);
      t.length = 0;
    }), this.on("error", (o) => {
      n = !0;
      for (const r of t) r.reject(o);
      t.length = 0;
    }), {
      next: async () => e.length ? {
        value: e.shift(),
        done: !1
      } : n ? {
        value: void 0,
        done: !0
      } : new Promise((o, r) => t.push({
        resolve: o,
        reject: r
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
    const t = new Lt();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const o = fo.fromReadableStream(e, this.controller);
    for await (const r of o) S(this, le, "m", eo).call(this, r);
    if (o.controller.signal?.aborted) throw new xe();
    return this._addRun(S(this, le, "m", to).call(this));
  }
  toReadableStream() {
    return new fo(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, o) {
    const r = new Lt();
    return r._run(() => r._runToolAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  async _createToolAssistantStream(e, t, n, o) {
    const r = o?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...n,
      stream: !0
    }, s = await e.submitToolOutputs(t, i, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of s) S(this, le, "m", eo).call(this, u);
    if (s.controller.signal?.aborted) throw new xe();
    return this._addRun(S(this, le, "m", to).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const o = new Lt();
    return o._run(() => o._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  static createAssistantStream(e, t, n, o) {
    const r = new Lt();
    return r._run(() => r._runAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  currentEvent() {
    return S(this, hr, "f");
  }
  currentRun() {
    return S(this, pr, "f");
  }
  currentMessageSnapshot() {
    return S(this, Fe, "f");
  }
  currentRunStepSnapshot() {
    return S(this, ro, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(S(this, Ye, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(S(this, fr, "f"));
  }
  async finalRun() {
    if (await this.done(), !S(this, Ut, "f")) throw Error("Final run was not received.");
    return S(this, Ut, "f");
  }
  async _createThreadAssistantStream(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort()));
    const r = {
      ...t,
      stream: !0
    }, i = await e.createAndRun(r, {
      ...n,
      signal: this.controller.signal
    });
    this._connected();
    for await (const s of i) S(this, le, "m", eo).call(this, s);
    if (i.controller.signal?.aborted) throw new xe();
    return this._addRun(S(this, le, "m", to).call(this));
  }
  async _createAssistantStream(e, t, n, o) {
    const r = o?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...n,
      stream: !0
    }, s = await e.create(t, i, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of s) S(this, le, "m", eo).call(this, u);
    if (s.controller.signal?.aborted) throw new xe();
    return this._addRun(S(this, le, "m", to).call(this));
  }
  static accumulateDelta(e, t) {
    for (const [n, o] of Object.entries(t)) {
      if (!e.hasOwnProperty(n)) {
        e[n] = o;
        continue;
      }
      let r = e[n];
      if (r == null) {
        e[n] = o;
        continue;
      }
      if (n === "index" || n === "type") {
        e[n] = o;
        continue;
      }
      if (typeof r == "string" && typeof o == "string") r += o;
      else if (typeof r == "number" && typeof o == "number") r += o;
      else if (Si(r) && Si(o)) r = this.accumulateDelta(r, o);
      else if (Array.isArray(r) && Array.isArray(o)) {
        if (r.every((i) => typeof i == "string" || typeof i == "number")) {
          r.push(...o);
          continue;
        }
        for (const i of o) {
          if (!Si(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
          const s = i.index;
          if (s == null)
            throw console.error(i), new Error("Expected array delta entry to have an `index` property");
          if (typeof s != "number") throw new Error(`Expected array delta entry \`index\` property to be a number but got ${s}`);
          const u = r[s];
          u == null ? r.push(i) : r[s] = this.accumulateDelta(u, i);
        }
        continue;
      } else throw Error(`Unhandled record type: ${n}, deltaValue: ${o}, accValue: ${r}`);
      e[n] = r;
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
Lt = io, eo = function(t) {
  if (!this.ended)
    switch (G(this, hr, t, "f"), S(this, le, "m", Lc).call(this, t), t.event) {
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
        S(this, le, "m", Gc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        S(this, le, "m", $c).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        S(this, le, "m", Dc).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, to = function() {
  if (this.ended) throw new O("stream has ended, this shouldn't happen");
  if (!S(this, Ut, "f")) throw Error("Final run has not been received");
  return S(this, Ut, "f");
}, Dc = function(t) {
  const [n, o] = S(this, le, "m", Fc).call(this, t, S(this, Fe, "f"));
  G(this, Fe, n, "f"), S(this, fr, "f")[n.id] = n;
  for (const r of o) {
    const i = n.content[r.index];
    i?.type == "text" && this._emit("textCreated", i.text);
  }
  switch (t.event) {
    case "thread.message.created":
      this._emit("messageCreated", t.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      if (this._emit("messageDelta", t.data.delta, n), t.data.delta.content) for (const r of t.data.delta.content) {
        if (r.type == "text" && r.text) {
          let i = r.text, s = n.content[r.index];
          if (s && s.type == "text") this._emit("textDelta", i, s.text);
          else throw Error("The snapshot associated with this text delta is not text or missing");
        }
        if (r.index != S(this, nn, "f")) {
          if (S(this, xt, "f")) switch (S(this, xt, "f").type) {
            case "text":
              this._emit("textDone", S(this, xt, "f").text, S(this, Fe, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", S(this, xt, "f").image_file, S(this, Fe, "f"));
              break;
          }
          G(this, nn, r.index, "f");
        }
        G(this, xt, n.content[r.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (S(this, nn, "f") !== void 0) {
        const r = t.data.content[S(this, nn, "f")];
        if (r) switch (r.type) {
          case "image_file":
            this._emit("imageFileDone", r.image_file, S(this, Fe, "f"));
            break;
          case "text":
            this._emit("textDone", r.text, S(this, Fe, "f"));
            break;
        }
      }
      S(this, Fe, "f") && this._emit("messageDone", t.data), G(this, Fe, void 0, "f");
  }
}, $c = function(t) {
  const n = S(this, le, "m", Uc).call(this, t);
  switch (G(this, ro, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const o = t.data.delta;
      if (o.step_details && o.step_details.type == "tool_calls" && o.step_details.tool_calls && n.step_details.type == "tool_calls") for (const r of o.step_details.tool_calls) r.index == S(this, kr, "f") ? this._emit("toolCallDelta", r, n.step_details.tool_calls[r.index]) : (S(this, Ie, "f") && this._emit("toolCallDone", S(this, Ie, "f")), G(this, kr, r.index, "f"), G(this, Ie, n.step_details.tool_calls[r.index], "f"), S(this, Ie, "f") && this._emit("toolCallCreated", S(this, Ie, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      G(this, ro, void 0, "f"), t.data.step_details.type == "tool_calls" && S(this, Ie, "f") && (this._emit("toolCallDone", S(this, Ie, "f")), G(this, Ie, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Lc = function(t) {
  S(this, Ss, "f").push(t), this._emit("event", t);
}, Uc = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return S(this, Ye, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = S(this, Ye, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let o = t.data;
      if (o.delta) {
        const r = Lt.accumulateDelta(n, o.delta);
        S(this, Ye, "f")[t.data.id] = r;
      }
      return S(this, Ye, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      S(this, Ye, "f")[t.data.id] = t.data;
      break;
  }
  if (S(this, Ye, "f")[t.data.id]) return S(this, Ye, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Fc = function(t, n) {
  let o = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, o];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let r = t.data;
      if (r.delta.content) for (const i of r.delta.content) if (i.index in n.content) {
        let s = n.content[i.index];
        n.content[i.index] = S(this, le, "m", Oc).call(this, i, s);
      } else
        n.content[i.index] = i, o.push(i);
      return [n, o];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (n) return [n, o];
      throw Error("Received thread message event with no existing snapshot");
  }
  throw Error("Tried to accumulate a non-message event");
}, Oc = function(t, n) {
  return Lt.accumulateDelta(n, t);
}, Gc = function(t) {
  switch (G(this, pr, t.data, "f"), t.event) {
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
      G(this, Ut, t.data, "f"), S(this, Ie, "f") && (this._emit("toolCallDone", S(this, Ie, "f")), G(this, Ie, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var ya = class extends M {
  constructor() {
    super(...arguments), this.steps = new Vp(this._client);
  }
  create(e, t, n) {
    const { include: o, ...r } = t;
    return this._client.post(v`/threads/${e}/runs`, {
      query: { include: o },
      body: r,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(v`/threads/${o}/runs/${e}`, {
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/runs/${e}`, {
      body: r,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/threads/${e}/runs`, Q, {
      query: t,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { thread_id: o } = t;
    return this._client.post(v`/threads/${o}/runs/${e}/cancel`, {
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(o.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return io.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const o = L([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: r, response: i } = await this.retrieve(e, t, {
        ...n,
        headers: {
          ...n?.headers,
          ...o
        }
      }).withResponse();
      switch (r.status) {
        case "queued":
        case "in_progress":
        case "cancelling":
          let s = 5e3;
          if (n?.pollIntervalMs) s = n.pollIntervalMs;
          else {
            const u = i.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (s = c);
            }
          }
          await Eo(s);
          break;
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return r;
      }
    }
  }
  stream(e, t, n) {
    return io.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/runs/${e}/submit_tool_outputs`, {
      body: r,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  async submitToolOutputsAndPoll(e, t, n) {
    const o = await this.submitToolOutputs(e, t, n);
    return await this.poll(o.id, t, n);
  }
  submitToolOutputsStream(e, t, n) {
    return io.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
ya.Steps = Vp;
var ti = class extends M {
  constructor() {
    super(...arguments), this.runs = new ya(this._client), this.messages = new Hp(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/threads/${e}`, {
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/threads/${e}`, {
      body: t,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/threads/${e}`, {
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
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
    return io.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
ti.Runs = ya;
ti.Messages = Hp;
var yn = class extends M {
  constructor() {
    super(...arguments), this.realtime = new jr(this._client), this.chatkit = new ei(this._client), this.assistants = new Fp(this._client), this.threads = new ti(this._client);
  }
};
yn.Realtime = jr;
yn.ChatKit = ei;
yn.Assistants = Fp;
yn.Threads = ti;
var Jp = class extends M {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, Kp = class extends M {
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(v`/containers/${o}/files/${e}/content`, {
      ...n,
      headers: L([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, va = class extends M {
  constructor() {
    super(...arguments), this.content = new Kp(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/containers/${e}/files`, Qr({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(v`/containers/${o}/files/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/containers/${e}/files`, Q, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { container_id: o } = t;
    return this._client.delete(v`/containers/${o}/files/${e}`, {
      ...n,
      headers: L([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
va.Content = Kp;
var Aa = class extends M {
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
    return this._client.get(v`/containers/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/containers", Q, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/containers/${e}`, {
      ...t,
      headers: L([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Aa.Files = va;
var Wp = class extends M {
  create(e, t, n) {
    const { include: o, ...r } = t;
    return this._client.post(v`/conversations/${e}/items`, {
      query: { include: o },
      body: r,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { conversation_id: o, ...r } = t;
    return this._client.get(v`/conversations/${o}/items/${e}`, {
      query: r,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/conversations/${e}/items`, ce, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { conversation_id: o } = t;
    return this._client.delete(v`/conversations/${o}/items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Ta = class extends M {
  constructor() {
    super(...arguments), this.items = new Wp(this._client);
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
Ta.Items = Wp;
var zp = class extends M {
  create(e, t) {
    const n = !!e.encoding_format;
    let o = n ? e.encoding_format : "base64";
    n && ae(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const r = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: o
      },
      ...t,
      __security: { bearerAuth: !0 }
    });
    return n ? r : (ae(this._client).debug("embeddings/decoding base64 embeddings from base64"), r._thenUnwrap((i) => (i && i.data && i.data.forEach((s) => {
      const u = s.embedding;
      s.embedding = AI(u);
    }), i)));
  }
}, Yp = class extends M {
  retrieve(e, t, n) {
    const { eval_id: o, run_id: r } = t;
    return this._client.get(v`/evals/${o}/runs/${r}/output_items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { eval_id: o, ...r } = t;
    return this._client.getAPIList(v`/evals/${o}/runs/${e}/output_items`, Q, {
      query: r,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Sa = class extends M {
  constructor() {
    super(...arguments), this.outputItems = new Yp(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/evals/${e}/runs`, {
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { eval_id: o } = t;
    return this._client.get(v`/evals/${o}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/evals/${e}/runs`, Q, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { eval_id: o } = t;
    return this._client.delete(v`/evals/${o}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { eval_id: o } = t;
    return this._client.post(v`/evals/${o}/runs/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
Sa.OutputItems = Yp;
var Ea = class extends M {
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
    return this._client.getAPIList("/evals", Q, {
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
Ea.Runs = Sa;
var Xp = class extends M {
  create(e, t) {
    return this._client.post("/files", Xe({
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
    return this._client.getAPIList("/files", Q, {
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
      headers: L([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  async waitForProcessing(e, { pollInterval: t = 5e3, maxWait: n = 1800 * 1e3 } = {}) {
    const o = /* @__PURE__ */ new Set([
      "processed",
      "error",
      "deleted"
    ]), r = Date.now();
    let i = await this.retrieve(e);
    for (; !i.status || !o.has(i.status); )
      if (await Eo(t), i = await this.retrieve(e), Date.now() - r > n) throw new ia({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, Qp = class extends M {
}, Zp = class extends M {
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
}, Ca = class extends M {
  constructor() {
    super(...arguments), this.graders = new Zp(this._client);
  }
};
Ca.Graders = Zp;
var jp = class extends M {
  create(e, t, n) {
    return this._client.getAPIList(v`/fine_tuning/checkpoints/${e}/permissions`, Et, {
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
    return this._client.getAPIList(v`/fine_tuning/checkpoints/${e}/permissions`, ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { fine_tuned_model_checkpoint: o } = t;
    return this._client.delete(v`/fine_tuning/checkpoints/${o}/permissions/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, wa = class extends M {
  constructor() {
    super(...arguments), this.permissions = new jp(this._client);
  }
};
wa.Permissions = jp;
var em = class extends M {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/fine_tuning/jobs/${e}/checkpoints`, Q, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Ia = class extends M {
  constructor() {
    super(...arguments), this.checkpoints = new em(this._client);
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
    return this._client.getAPIList("/fine_tuning/jobs", Q, {
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
    return this._client.getAPIList(v`/fine_tuning/jobs/${e}/events`, Q, {
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
Ia.Checkpoints = em;
var vn = class extends M {
  constructor() {
    super(...arguments), this.methods = new Qp(this._client), this.jobs = new Ia(this._client), this.checkpoints = new wa(this._client), this.alpha = new Ca(this._client);
  }
};
vn.Methods = Qp;
vn.Jobs = Ia;
vn.Checkpoints = wa;
vn.Alpha = Ca;
var tm = class extends M {
}, ba = class extends M {
  constructor() {
    super(...arguments), this.graderModels = new tm(this._client);
  }
};
ba.GraderModels = tm;
var nm = class extends M {
  createVariation(e, t) {
    return this._client.post("/images/variations", Xe({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", Xe({
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
}, om = class extends M {
  retrieve(e, t) {
    return this._client.get(v`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", Et, {
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
}, rm = class extends M {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, im = class extends M {
  accept(e, t, n) {
    return this._client.post(v`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: L([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  hangup(e, t) {
    return this._client.post(v`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: L([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  refer(e, t, n) {
    return this._client.post(v`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: L([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(v`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: L([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, sm = class extends M {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, ni = class extends M {
  constructor() {
    super(...arguments), this.clientSecrets = new sm(this._client), this.calls = new im(this._client);
  }
};
ni.ClientSecrets = sm;
ni.Calls = im;
function TI(e, t) {
  return !t || !EI(t) ? {
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
  } : am(e, t);
}
function am(e, t) {
  const n = e.output.map((r) => {
    if (r.type === "function_call") return {
      ...r,
      parsed_arguments: II(t, r)
    };
    if (r.type === "message") {
      const i = r.content.map((s) => s.type === "output_text" ? {
        ...s,
        parsed: SI(t, s.text)
      } : s);
      return {
        ...r,
        content: i
      };
    }
    return r;
  }), o = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || Es(o), Object.defineProperty(o, "output_parsed", {
    enumerable: !0,
    get() {
      for (const r of o.output)
        if (r.type === "message") {
          for (const i of r.content) if (i.type === "output_text" && i.parsed !== null) return i.parsed;
        }
      return null;
    }
  }), o;
}
function SI(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function EI(e) {
  return !!ua(e.text?.format);
}
function CI(e) {
  return e?.$brand === "auto-parseable-tool";
}
function wI(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function II(e, t) {
  const n = wI(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: CI(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function Es(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const o of n.content) o.type === "output_text" && t.push(o.text);
  e.output_text = t.join("");
}
var Kt, er, _t, tr, Bc, qc, Hc, Vc, bI = class lm extends da {
  constructor(t) {
    super(), Kt.add(this), er.set(this, void 0), _t.set(this, void 0), tr.set(this, void 0), G(this, er, t, "f");
  }
  static createResponse(t, n, o) {
    const r = new lm(n);
    return r._run(() => r._createOrRetrieveResponse(t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  async _createOrRetrieveResponse(t, n, o) {
    const r = o?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), S(this, Kt, "m", Bc).call(this);
    let i, s = null;
    "response_id" in n ? (i = await t.responses.retrieve(n.response_id, { stream: !0 }, {
      ...o,
      signal: this.controller.signal,
      stream: !0
    }), s = n.starting_after ?? null) : i = await t.responses.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    }), this._connected();
    for await (const u of i) S(this, Kt, "m", qc).call(this, u, s);
    if (i.controller.signal?.aborted) throw new xe();
    return S(this, Kt, "m", Hc).call(this);
  }
  [(er = /* @__PURE__ */ new WeakMap(), _t = /* @__PURE__ */ new WeakMap(), tr = /* @__PURE__ */ new WeakMap(), Kt = /* @__PURE__ */ new WeakSet(), Bc = function() {
    this.ended || G(this, _t, void 0, "f");
  }, qc = function(n, o) {
    if (this.ended) return;
    const r = (s, u) => {
      (o == null || u.sequence_number > o) && this._emit(s, u);
    }, i = S(this, Kt, "m", Vc).call(this, n);
    switch (r("event", n), n.type) {
      case "response.output_text.delta": {
        const s = i.output[n.output_index];
        if (!s) throw new O(`missing output at index ${n.output_index}`);
        if (s.type === "message") {
          const u = s.content[n.content_index];
          if (!u) throw new O(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new O(`expected content to be 'output_text', got ${u.type}`);
          r("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const s = i.output[n.output_index];
        if (!s) throw new O(`missing output at index ${n.output_index}`);
        s.type === "function_call" && r("response.function_call_arguments.delta", {
          ...n,
          snapshot: s.arguments
        });
        break;
      }
      default:
        r(n.type, n);
        break;
    }
  }, Hc = function() {
    if (this.ended) throw new O("stream has ended, this shouldn't happen");
    const n = S(this, _t, "f");
    if (!n) throw new O("request ended without sending any events");
    G(this, _t, void 0, "f");
    const o = RI(n, S(this, er, "f"));
    return G(this, tr, o, "f"), o;
  }, Vc = function(n) {
    let o = S(this, _t, "f");
    if (!o) {
      if (n.type !== "response.created") throw new O(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return o = G(this, _t, n.response, "f"), o;
    }
    switch (n.type) {
      case "response.output_item.added":
        o.output.push(n.item);
        break;
      case "response.content_part.added": {
        const r = o.output[n.output_index];
        if (!r) throw new O(`missing output at index ${n.output_index}`);
        const i = r.type, s = n.part;
        i === "message" && s.type !== "reasoning_text" ? r.content.push(s) : i === "reasoning" && s.type === "reasoning_text" && (r.content || (r.content = []), r.content.push(s));
        break;
      }
      case "response.output_text.delta": {
        const r = o.output[n.output_index];
        if (!r) throw new O(`missing output at index ${n.output_index}`);
        if (r.type === "message") {
          const i = r.content[n.content_index];
          if (!i) throw new O(`missing content at index ${n.content_index}`);
          if (i.type !== "output_text") throw new O(`expected content to be 'output_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const r = o.output[n.output_index];
        if (!r) throw new O(`missing output at index ${n.output_index}`);
        r.type === "function_call" && (r.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const r = o.output[n.output_index];
        if (!r) throw new O(`missing output at index ${n.output_index}`);
        if (r.type === "reasoning") {
          const i = r.content?.[n.content_index];
          if (!i) throw new O(`missing content at index ${n.content_index}`);
          if (i.type !== "reasoning_text") throw new O(`expected content to be 'reasoning_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.completed":
        G(this, _t, n.response, "f");
        break;
    }
    return o;
  }, Symbol.asyncIterator)]() {
    const t = [], n = [];
    let o = !1;
    return this.on("event", (r) => {
      const i = n.shift();
      i ? i.resolve(r) : t.push(r);
    }), this.on("end", () => {
      o = !0;
      for (const r of n) r.resolve(void 0);
      n.length = 0;
    }), this.on("abort", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), this.on("error", (r) => {
      o = !0;
      for (const i of n) i.reject(r);
      n.length = 0;
    }), {
      next: async () => t.length ? {
        value: t.shift(),
        done: !1
      } : o ? {
        value: void 0,
        done: !0
      } : new Promise((r, i) => n.push({
        resolve: r,
        reject: i
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
  async finalResponse() {
    await this.done();
    const t = S(this, tr, "f");
    if (!t) throw new O("stream ended without producing a ChatCompletion");
    return t;
  }
};
function RI(e, t) {
  return TI(e, t);
}
var um = class extends M {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/responses/${e}/input_items`, Q, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, cm = class extends M {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, oi = class extends M {
  constructor() {
    super(...arguments), this.inputItems = new um(this._client), this.inputTokens = new cm(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && Es(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(v`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((o) => ("object" in o && o.object === "response" && Es(o), o));
  }
  delete(e, t) {
    return this._client.delete(v`/responses/${e}`, {
      ...t,
      headers: L([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => am(n, e));
  }
  stream(e, t) {
    return bI.createResponse(this._client, e, t);
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
oi.InputItems = um;
oi.InputTokens = cm;
var dm = class extends M {
  retrieve(e, t) {
    return this._client.get(v`/skills/${e}/content`, {
      ...t,
      headers: L([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, fm = class extends M {
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(v`/skills/${o}/versions/${e}/content`, {
      ...n,
      headers: L([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Ra = class extends M {
  constructor() {
    super(...arguments), this.content = new fm(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(v`/skills/${e}/versions`, Qr({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(v`/skills/${o}/versions/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/skills/${e}/versions`, Q, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { skill_id: o } = t;
    return this._client.delete(v`/skills/${o}/versions/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
Ra.Content = fm;
var ri = class extends M {
  constructor() {
    super(...arguments), this.content = new dm(this._client), this.versions = new Ra(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", Qr({
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
    return this._client.getAPIList("/skills", Q, {
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
ri.Content = dm;
ri.Versions = Ra;
var hm = class extends M {
  create(e, t, n) {
    return this._client.post(v`/uploads/${e}/parts`, Xe({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Pa = class extends M {
  constructor() {
    super(...arguments), this.parts = new hm(this._client);
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
Pa.Parts = hm;
var PI = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((r) => r.status === "rejected");
  if (n.length) {
    for (const r of n) console.error(r.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const o = [];
  for (const r of t) r.status === "fulfilled" && o.push(r.value);
  return o;
}, pm = class extends M {
  create(e, t, n) {
    return this._client.post(v`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(v`/vector_stores/${o}/file_batches/${e}`, {
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.post(v`/vector_stores/${o}/file_batches/${e}/cancel`, {
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t);
    return await this.poll(e, o.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: o, ...r } = t;
    return this._client.getAPIList(v`/vector_stores/${o}/file_batches/${e}/files`, Q, {
      query: r,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async poll(e, t, n) {
    const o = L([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const { data: r, response: i } = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: o
      }).withResponse();
      switch (r.status) {
        case "in_progress":
          let s = 5e3;
          if (n?.pollIntervalMs) s = n.pollIntervalMs;
          else {
            const u = i.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (s = c);
            }
          }
          await Eo(s);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return r;
      }
    }
  }
  async uploadAndPoll(e, { files: t, fileIds: n = [] }, o) {
    if (t == null || t.length == 0) throw new Error("No `files` provided to process. If you've already uploaded files you should use `.createAndPoll()` instead");
    const r = o?.maxConcurrency ?? 5, i = Math.min(r, t.length), s = this._client, u = t.values(), c = [...n];
    async function d(f) {
      for (let h of f) {
        const p = await s.files.create({
          file: h,
          purpose: "assistants"
        }, o);
        c.push(p.id);
      }
    }
    return await PI(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, mm = class extends M {
  create(e, t, n) {
    return this._client.post(v`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(v`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { vector_store_id: o, ...r } = t;
    return this._client.post(v`/vector_stores/${o}/files/${e}`, {
      body: r,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/vector_stores/${e}/files`, Q, {
      query: t,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.delete(v`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(e, o.id, n);
  }
  async poll(e, t, n) {
    const o = L([n?.headers, {
      "X-Stainless-Poll-Helper": "true",
      "X-Stainless-Custom-Poll-Interval": n?.pollIntervalMs?.toString() ?? void 0
    }]);
    for (; ; ) {
      const r = await this.retrieve(t, { vector_store_id: e }, {
        ...n,
        headers: o
      }).withResponse(), i = r.data;
      switch (i.status) {
        case "in_progress":
          let s = 5e3;
          if (n?.pollIntervalMs) s = n.pollIntervalMs;
          else {
            const u = r.response.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (s = c);
            }
          }
          await Eo(s);
          break;
        case "failed":
        case "completed":
          return i;
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
    return this._client.getAPIList(v`/vector_stores/${o}/files/${e}/content`, Et, {
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, ii = class extends M {
  constructor() {
    super(...arguments), this.files = new mm(this._client), this.fileBatches = new pm(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/vector_stores/${e}`, {
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", Q, {
      query: e,
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/vector_stores/${e}`, {
      ...t,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(v`/vector_stores/${e}/search`, Et, {
      body: t,
      method: "post",
      ...n,
      headers: L([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
ii.Files = mm;
ii.FileBatches = pm;
var gm = class extends M {
  create(e, t) {
    return this._client.post("/videos", Xe({
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
    return this._client.getAPIList("/videos", ce, {
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
    return this._client.post("/videos/characters", Xe({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(v`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: L([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", Xe({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", Xe({
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
    return this._client.post(v`/videos/${e}/remix`, Qr({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Qt, _m, mr, ym = class extends M {
  constructor() {
    super(...arguments), Qt.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, o = 300) {
    return await this.verifySignature(e, t, n, o), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, o = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    S(this, Qt, "m", _m).call(this, n);
    const r = L([t]).values, i = S(this, Qt, "m", mr).call(this, r, "webhook-signature"), s = S(this, Qt, "m", mr).call(this, r, "webhook-timestamp"), u = S(this, Qt, "m", mr).call(this, r, "webhook-id"), c = parseInt(s, 10);
    if (isNaN(c)) throw new Kn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > o) throw new Kn("Webhook timestamp is too old");
    if (c > d + o) throw new Kn("Webhook timestamp is too new");
    const f = i.split(" ").map((g) => g.startsWith("v1,") ? g.substring(3) : g), h = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), p = u ? `${u}.${s}.${e}` : `${s}.${e}`, m = await crypto.subtle.importKey("raw", h, {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["verify"]);
    for (const g of f) try {
      const _ = Buffer.from(g, "base64");
      if (await crypto.subtle.verify("HMAC", m, _, new TextEncoder().encode(p))) return;
    } catch {
      continue;
    }
    throw new Kn("The given webhook signature does not match the expected signature");
  }
};
Qt = /* @__PURE__ */ new WeakSet(), _m = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, mr = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const o = t.get(n);
  if (o == null) throw new Error(`Missing required header: ${n}`);
  return o;
};
var Cs, Ma, gr, vm, MI = "workload-identity-auth", H = class {
  constructor({ baseURL: e = gt("OPENAI_BASE_URL"), apiKey: t = gt("OPENAI_API_KEY") ?? null, adminAPIKey: n = gt("OPENAI_ADMIN_KEY") ?? null, organization: o = gt("OPENAI_ORG_ID") ?? null, project: r = gt("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = gt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: s, ...u } = {}) {
    Cs.add(this), gr.set(this, void 0), this.completions = new Jp(this), this.chat = new ha(this), this.embeddings = new zp(this), this.files = new Xp(this), this.images = new nm(this), this.audio = new wo(this), this.moderations = new rm(this), this.models = new om(this), this.fineTuning = new vn(this), this.graders = new ba(this), this.vectorStores = new ii(this), this.webhooks = new ym(this), this.beta = new yn(this), this.batches = new Up(this), this.uploads = new Pa(this), this.admin = new _a(this), this.responses = new oi(this), this.realtime = new ni(this), this.conversations = new Ta(this), this.evals = new Ea(this), this.containers = new Aa(this), this.skills = new ri(this), this.videos = new gm(this);
    const c = {
      apiKey: t,
      adminAPIKey: n,
      organization: o,
      project: r,
      webhookSecret: i,
      workloadIdentity: s,
      ...u,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (t && s) throw new O("The `apiKey` and `workloadIdentity` options are mutually exclusive");
    if (!t && !n && !s) throw new O("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, `adminAPIKey`, or set the `OPENAI_API_KEY` or `OPENAI_ADMIN_KEY` environment variable.");
    if (!c.dangerouslyAllowBrowser && Rw()) throw new O(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? Ma.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = Rc(c.logLevel, "ClientOptions.logLevel", this) ?? Rc(gt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? Uh(), G(this, gr, kw, "f");
    const f = gt("OPENAI_CUSTOM_HEADERS");
    if (f) {
      const h = {};
      for (const p of f.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (h[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = L([h, c.defaultHeaders]);
    }
    this._options = c, s && (this._workloadIdentityAuth = new Qw(s, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = o, this.project = r, this.webhookSecret = i;
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
    return L([t.bearerAuth ? await this.bearerAuth(e) : null, t.adminAPIKeyAuth ? await this.adminAPIKeyAuth(e) : null]);
  }
  async bearerAuth(e) {
    if (this._workloadIdentityAuth) return L([{ Authorization: `Bearer ${await this._workloadIdentityAuth.getToken()}` }]);
    if (this.apiKey != null)
      return L([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  async adminAPIKeyAuth(e) {
    if (this.adminAPIKey != null)
      return L([{ Authorization: `Bearer ${this.adminAPIKey}` }]);
  }
  stringifyQuery(e) {
    return Ow(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Yt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${wh()}`;
  }
  makeStatusError(e, t, n, o) {
    return de.generate(e, t, n, o);
  }
  async _callApiKey() {
    const e = this._options.apiKey;
    if (typeof e != "function") return !1;
    let t;
    try {
      t = await e();
    } catch (n) {
      throw n instanceof O ? n : new O(`Failed to get token from 'apiKey' function: ${n.message}`, { cause: n });
    }
    if (typeof t != "string" || !t) throw new O(`Expected 'apiKey' function argument to return a string but it returned ${t}`);
    return this.apiKey = t, !0;
  }
  buildURL(e, t, n) {
    const o = !S(this, Cs, "m", vm).call(this) && n || this.baseURL, r = Cw(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), s = Object.fromEntries(r.searchParams);
    return (!_c(i) || !_c(s)) && (t = {
      ...s,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (r.search = this.stringifyQuery(t)), r.toString();
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
    return this.request(Promise.resolve(n).then((o) => ({
      method: e,
      path: t,
      ...o
    })));
  }
  request(e, t = null) {
    return new zh(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, r = o.maxRetries ?? this.maxRetries;
    t == null && (t = r), await this.prepareOptions(o);
    const { req: i, url: s, timeout: u } = await this.buildRequest(o, { retryCount: r - t });
    await this.prepareRequest(i, {
      url: s,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, f = Date.now();
    if (ae(this).debug(`[${c}] sending request`, Mt({
      retryOfRequestLogID: n,
      method: o.method,
      url: s,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new xe();
    const h = o.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(s, i, u, p, h).catch(us), g = Date.now();
    if (m instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new xe();
      const T = ls(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return ae(this).info(`[${c}] connection ${T ? "timed out" : "failed"} - ${y}`), ae(this).debug(`[${c}] connection ${T ? "timed out" : "failed"} (${y})`, Mt({
          retryOfRequestLogID: n,
          url: s,
          durationMs: g - f,
          message: m.message
        })), this.retryRequest(o, t, n ?? c);
      throw ae(this).info(`[${c}] connection ${T ? "timed out" : "failed"} - error; no more retries left`), ae(this).debug(`[${c}] connection ${T ? "timed out" : "failed"} (error; no more retries left)`, Mt({
        retryOfRequestLogID: n,
        url: s,
        durationMs: g - f,
        message: m.message
      })), m instanceof Lh || m instanceof Sw ? m : T ? new ia() : new zr({
        message: NI(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, T]) => ", " + y + ": " + JSON.stringify(T)).join("")}] ${i.method} ${s} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - f}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && h.bearerAuth && !o.__metadata?.hasStreamingBody && !o.__metadata?.workloadIdentityTokenRefreshed)
        return await Tc(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...o,
          __metadata: {
            ...o.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(m);
      if (t && y) {
        const k = `retrying, ${t} attempts remaining`;
        return await Tc(m.body), ae(this).info(`${_} - ${k}`), ae(this).debug(`[${c}] response error (${k})`, Mt({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - f
        })), this.retryRequest(o, t, n ?? c, m.headers);
      }
      const T = y ? "error; no more retries left" : "error; not retryable";
      ae(this).info(`${_} - ${T}`);
      const E = await m.text().catch((k) => us(k).message), C = bw(E), b = C ? void 0 : E;
      throw ae(this).debug(`[${c}] response error (${T})`, Mt({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: b,
        durationMs: Date.now() - f
      })), this.makeStatusError(m.status, C, b, m.headers);
    }
    return ae(this).info(_), ae(this).debug(`[${c}] response start`, Mt({
      retryOfRequestLogID: n,
      url: m.url,
      status: m.status,
      headers: m.headers,
      durationMs: g - f
    })), {
      response: m,
      options: o,
      controller: p,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: f
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
    return new zw(this, n, e);
  }
  async fetchWithAuth(e, t, n, o, r = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && r.bearerAuth) {
      const i = t.headers, s = i.get("Authorization");
      if (!s || s === `Bearer ${MI}`) {
        const u = await this._workloadIdentityAuth.getToken();
        i.set("Authorization", `Bearer ${u}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, o);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: r, method: i, ...s } = t || {}, u = this._makeAbort(o);
    r && r.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && s.body instanceof globalThis.ReadableStream || typeof s.body == "object" && s.body !== null && Symbol.asyncIterator in s.body, f = {
      signal: o.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...s
    };
    i && (f.method = i.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, f);
    } finally {
      clearTimeout(c);
    }
  }
  async shouldRetry(e) {
    const t = e.headers.get("x-should-retry");
    return t === "true" ? !0 : t === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
  }
  async retryRequest(e, t, n, o) {
    let r;
    const i = o?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (r = u);
    }
    const s = o?.get("retry-after");
    if (s && !r) {
      const u = parseFloat(s);
      Number.isNaN(u) ? r = Date.parse(s) - Date.now() : r = u * 1e3;
    }
    if (r === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      r = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await Eo(r), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const r = t - e;
    return Math.min(0.5 * Math.pow(2, r), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: r, query: i, defaultBaseURL: s } = n, u = this.buildURL(r, i, s);
    "timeout" in n && Iw("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: c, body: d, isStreamingBody: f } = this.buildBody({ options: n });
    return f && (e.__metadata = {
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
    let r = {};
    this.idempotencyHeader && t !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), r[this.idempotencyHeader] = e.idempotencyKey);
    const i = L([
      r,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...xw(),
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
    const n = L([t]), o = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, r = !o && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || o ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !r
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Oh(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...S(this, gr, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
Ma = H, gr = /* @__PURE__ */ new WeakMap(), Cs = /* @__PURE__ */ new WeakSet(), vm = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
H.OpenAI = Ma;
H.DEFAULT_TIMEOUT = 6e5;
H.OpenAIError = O;
H.APIError = de;
H.APIConnectionError = zr;
H.APIConnectionTimeoutError = ia;
H.APIUserAbortError = xe;
H.NotFoundError = Ph;
H.ConflictError = Mh;
H.RateLimitError = xh;
H.BadRequestError = Ih;
H.AuthenticationError = bh;
H.InternalServerError = kh;
H.PermissionDeniedError = Rh;
H.UnprocessableEntityError = Nh;
H.InvalidWebhookSignatureError = Kn;
H.toFile = nI;
H.Completions = Jp;
H.Chat = ha;
H.Embeddings = zp;
H.Files = Xp;
H.Images = nm;
H.Audio = wo;
H.Moderations = rm;
H.Models = om;
H.FineTuning = vn;
H.Graders = ba;
H.VectorStores = ii;
H.Webhooks = ym;
H.Beta = yn;
H.Batches = Up;
H.Uploads = Pa;
H.Admin = _a;
H.Responses = oi;
H.Realtime = ni;
H.Conversations = Ta;
H.Evals = Ea;
H.Containers = Aa;
H.Skills = ri;
H.Videos = gm;
function NI(e) {
  if (xI(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function xI(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const o = t;
    if (o.code === "UND_ERR_INVALID_ARG" && typeof o.message == "string" && o.message.includes("invalid onRequestStart method")) return !0;
    t = o.cause;
  }
  return !1;
}
function kI(e = {}, t = [], n = vr(e, e.reasoning)) {
  return e.provider === "openai-compatible" && e.toolMode !== "tagged-json" && Array.isArray(t) && t.length > 0 && n.profileId === "deepseek-thinking" && n.mode !== "off";
}
function DI(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function $I(e, t, n) {
  return t > n && Array.isArray(e?.tool_calls) && e.tool_calls.some((o) => String(o?.function?.name || "").trim());
}
function Jc(e = "", t = 0) {
  let n = 0;
  for (let o = t - 1; o >= 0 && e[o] === "\\"; o -= 1) n += 1;
  return n % 2 === 1;
}
function LI(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function UI(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function FI(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function OI(e = "") {
  const t = String(e ?? "");
  let n = "", o = 0;
  for (; o < t.length; ) {
    const r = t.slice(o, o + 2), i = t.slice(o + 2, o + 6);
    if (r !== "\\u" || Jc(t, o) || !LI(i)) {
      n += t[o] || "", o += 1;
      continue;
    }
    const s = o + 6, u = t.slice(s + 2, s + 6);
    if (UI(i) && t.slice(s, s + 2) === "\\u" && !Jc(t, s) && FI(u)) {
      const c = Number.parseInt(i, 16), d = Number.parseInt(u, 16), f = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(f), o += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(i, 16)), o += 6;
  }
  return n;
}
function GI(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), OI(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function BI(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Na(e = "", t = "", n = 0) {
  const o = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${BI(t)}(?:\\\\?")?\\s*:`, "i"), r = String(e || "").slice(Math.max(0, n)).match(o);
  if (!r || r.index === void 0) return null;
  const i = r[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + r.index + i,
    end: Math.max(0, n) + r.index + r[0].length
  };
}
function qI(e = "", t = [], n = 0) {
  return t.map((o) => Na(e, o, n)).filter(Boolean).sort((o, r) => o.index - r.index)[0] || null;
}
function qe(e = "", t = "", n = []) {
  const o = String(e || ""), r = Na(o, t);
  if (!r) return;
  let i = r.end;
  for (; /\s/.test(o[i] || ""); ) i += 1;
  o[i] === '"' && (i += 1);
  const s = qI(o, n.filter((d) => d !== t), i);
  let u = s ? s.index : o.length;
  if (s) {
    const d = o.lastIndexOf(",", s.index);
    d >= i && (u = d);
  }
  let c = o.slice(i, u).trim();
  return s || (c = c.replace(/\}\s*$/, "").trimEnd()), GI(c);
}
function ot(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var on = {
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
};
function Kc(e = "", t = [], n = []) {
  for (const o of t) {
    const r = qe(e, o, n);
    if (r !== void 0) return r;
  }
}
function HI(e = "", t = "") {
  if (t === "Read") {
    const n = on.Read, o = {};
    return n.forEach((r, i) => {
      const s = qe(e, r, n.slice(i + 1));
      s !== void 0 && (o[r] = ot(s));
    }), o.filePath === void 0 && o.path !== void 0 && (o.filePath = o.path, delete o.path), o.filePath === void 0 && o.scope !== void 0 && (o.filePath = o.scope, delete o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "Write") {
    const n = {}, o = Kc(e, ["filePath", "path"], ["content"]), r = qe(e, "content", []);
    return o !== void 0 && (n.filePath = ot(o)), r !== void 0 && (n.content = ot(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, o = Kc(e, ["filePath", "path"], ["edits"]), r = qe(e, "edits", []);
    return o !== void 0 && (n.filePath = ot(o)), r !== void 0 && (n.edits = ot(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = on.Grep, o = {};
    return n.forEach((r) => {
      const i = qe(e, r, n.filter((s) => s !== r));
      i !== void 0 && (o[r] = ot(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "MemoryGrep") {
    const n = on.MemoryGrep, o = {};
    return n.forEach((r) => {
      const i = qe(e, r, n.filter((s) => s !== r));
      i !== void 0 && (o[r] = ot(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  if (t === "ChatHistory") {
    const n = on.ChatHistory, o = {};
    return n.forEach((r) => {
      const i = qe(e, r, n.filter((s) => s !== r));
      i !== void 0 && (o[r] = ot(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  return null;
}
function VI(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const s = JSON.parse(n);
    if (s && typeof s == "object" && !Array.isArray(s)) return s;
  } catch {
  }
  if (!Object.hasOwn(on, t)) return null;
  const o = HI(n, t);
  if (o) return o;
  const r = on[t], i = {};
  return r.forEach((s, u) => {
    const c = qe(n, s, r.slice(u + 1));
    c !== void 0 && (i[s] = ot(c));
  }), Object.keys(i).length ? i : null;
}
function Am(e = "", t = "") {
  const n = VI(e, t);
  return n ? JSON.stringify(n) : "";
}
var JI = /<tool_call\b|<\/?[｜|]+DSML[｜|]+\s*/gi, KI = /<[｜|]+DSML[｜|]+\s*invoke\s+name="([^"]+)"\s*>/iy, WI = /<\/[｜|]+DSML[｜|]+\s*invoke\s*>/iy, zI = /<[｜|]+DSML[｜|]+\s*(function_calls|calls)\s*>/iy, YI = /<\/[｜|]+DSML[｜|]+\s*(function_calls|calls)\s*>/iy, XI = /<[｜|]+DSML[｜|]+\s*parameter\s+name="([^"]+)"\s+string="(true|false)"\s*>/iy, QI = /<(\/?)[｜|]+DSML[｜|]+\s*parameter\b/gi, ZI = /<\/[｜|]+DSML[｜|]+\s*parameter\s*>/iy, xa = /<[^<>"']*(?:"[^"]*"[^<>"']*|'[^']*'[^<>"']*)*>/y;
function ue(e, t, n) {
  return e.lastIndex = n, e.exec(t);
}
function Io(e, t = 0) {
  return ue(JI, e, t);
}
function ka(e, t) {
  for (; t < e.length && /\s/.test(e[t]); ) t += 1;
  return t;
}
function Ge(e, t) {
  const n = /* @__PURE__ */ new SyntaxError(`DSML 工具调用格式无效：${t}（位置 ${e}）。本轮工具未执行。`);
  throw n.code = "DSML_TOOL_CALL_INVALID", n.offset = e, n;
}
function st(e, t) {
  const n = /* @__PURE__ */ new SyntaxError(`JSON 工具调用格式无效：${t}（位置 ${e}）。本轮工具未执行。`);
  throw n.code = "TAGGED_TOOL_CALL_INVALID", n.offset = e, n;
}
function Wc(e, t) {
  const n = ue(KI, e, t), o = n?.[1].trim();
  o || Ge(t, "缺少完整的 invoke 标签或工具名");
  let r = t + n[0].length;
  const i = /* @__PURE__ */ new Set(), s = [];
  for (; r < e.length; ) {
    r = ka(e, r);
    const u = ue(WI, e, r);
    if (u) return {
      end: r + u[0].length,
      calls: [{
        name: o,
        arguments: `{${s.join(",")}}`
      }]
    };
    const c = ue(XI, e, r);
    c || Ge(r, "缺少完整的 parameter 标签或 invoke 结束标签");
    const d = c[1];
    i.has(d) && Ge(r, "存在重复参数"), i.add(d);
    const f = r + c[0].length, h = ue(QI, e, f);
    (!h || !h[1]) && Ge(f, "参数未闭合或参数边界有歧义");
    const p = ue(ZI, e, h.index);
    p || Ge(h.index, "parameter 结束标签无效");
    const m = e.slice(f, h.index);
    let g = JSON.stringify(m);
    if (c[2].toLowerCase() === "false") {
      g = m.trim();
      try {
        JSON.parse(g);
      } catch {
        Ge(f, "非字符串参数不是合法 JSON");
      }
    }
    s.push(`${JSON.stringify(d)}:${g}`), r = h.index + p[0].length;
  }
  Ge(r, "invoke 未闭合");
}
function jI(e, t) {
  const n = ue(zI, e, t);
  if (!n) return Wc(e, t);
  let o = t + n[0].length;
  const r = [];
  for (; o < e.length; ) {
    o = ka(e, o);
    const i = ue(YI, e, o);
    if (i)
      return i[1].toLowerCase() !== n[1].toLowerCase() && Ge(o, "调用组结束标签不匹配"), {
        end: o + i[0].length,
        calls: r
      };
    const s = Wc(e, o);
    r.push(...s.calls), o = s.end;
  }
  Ge(o, "调用组未闭合");
}
function Tm(e, t) {
  const n = [];
  let o = !1, r = !1;
  for (let i = t; i < e.length; i += 1) {
    const s = e[i];
    if (o)
      s === "\\" ? i += 1 : s === '"' && (o = !1);
    else if (s === '"') o = !0;
    else if (s === "{" || s === "[")
      n.length && (r = !0), n.push(s === "{" ? "}" : "]");
    else if (s === "}" || s === "]") {
      if (n.pop() !== s) return {
        end: -1,
        boundary: i,
        mismatched: !0
      };
      if (!n.length) return {
        end: i + 1,
        boundary: i + 1,
        nested: r
      };
    } else if (s === "<") return {
      end: -1,
      boundary: i
    };
  }
  return {
    end: -1,
    boundary: e.length
  };
}
function Sm(e, t, n) {
  if (e[t] !== "[" || n.end < 0 || n.nested) return !1;
  try {
    return JSON.parse(e.slice(t, n.end)), !1;
  } catch {
    return !0;
  }
}
function e0(e, t) {
  let n = t, o;
  for (; o = ue(/["<{[]/g, e, n); ) {
    if (n = o.index, o[0] === '"') {
      const i = Da(e, n);
      i < 0 && st(t, "JSON 前的说明文字引号未闭合"), n = i;
      continue;
    }
    if (o[0] === "<") {
      if (ue(/<\/tool_call>/iy, e, n)) return null;
      const i = ue(xa, e, n);
      n += i?.[0].length || 1;
      continue;
    }
    const r = Tm(e, n);
    if (Sm(e, n, r)) {
      n = r.end;
      continue;
    }
    return {
      start: n,
      ...r
    };
  }
  return null;
}
function Da(e, t) {
  for (let n = t + 1; n < e.length; n += 1) if (e[n] === "\\") n += 1;
  else if (e[n] === '"') return n + 1;
  return -1;
}
function zc(e, t) {
  for (let n = 0; n < e.length; ) {
    const o = e[n], r = o === "<" ? ue(xa, e, n) : null;
    if (r) n += r[0].length;
    else if (o === '"') {
      const i = Da(e, n);
      i < 0 && st(t, "JSON 外的说明文字引号未闭合"), e[ka(e, i)] === ":" && st(t, "完整 JSON 外出现字段，不能作为杂文剥离"), n = i;
    } else if (o === "{" || o === "[") {
      const i = Tm(e, n);
      Sm(e, n, i) || st(t, "同一工具块中存在多个 JSON 结构"), n = i.end;
    } else n += 1;
  }
}
function t0(e, t, n) {
  let o = t, r;
  for (; r = ue(/["<]/g, e, o); )
    if (o = r.index, r[0] === '"') {
      const i = Da(e, o);
      i < 0 && st(n, "JSON 外的说明文字引号未闭合"), o = i;
    } else {
      const i = ue(/<\/tool_call>/iy, e, o);
      if (i) return i;
      const s = ue(xa, e, o);
      o += s?.[0].length || 1;
    }
  return null;
}
function n0(e, t) {
  let n;
  try {
    n = JSON.parse(e);
  } catch {
    return;
  }
  n && typeof n == "object" && !Array.isArray(n) && Object.keys(n).some((o) => ![
    "id",
    "name",
    "arguments"
  ].includes(o)) && st(t, "工具封装中存在 id、name、arguments 之外的字段，无法确定参数边界");
}
function o0(e, t) {
  const n = ue(/<tool_call>/iy, e, t);
  if (!n) return null;
  const o = t + n[0].length, r = e0(e, o);
  r?.mismatched && st(t, "JSON 括号不匹配，无法确定调用边界");
  const i = t0(e, r?.boundary ?? o, t);
  if (!i)
    return r && ue(/<\/tool_call>/gi, e, r.start) && st(t, "未找到 JSON 字符串之外的 tool_call 结束标签"), /<\/[｜|]+DSML[｜|]+/i.test(e.slice(o)) && Ge(t, "tool_call 开头与 DSML 结尾混用，无法确定调用边界"), null;
  let s = e.slice(o, i.index);
  const u = e.slice(o, r?.start ?? o), c = e.slice(r?.boundary ?? o, i.index), d = /<tool_call\b|<[｜|]+DSML[｜|]+\s*(?:invoke|function_calls|calls)\b/i;
  return (d.test(u) || d.test(c)) && st(t, "同一工具块中出现另一条工具调用，不能作为杂文剥离"), r?.end >= 0 && (zc(u, t), zc(c, t), s = e.slice(r.start, r.end), n0(s, t)), {
    end: i.index + i[0].length,
    payload: s
  };
}
function r0(e) {
  const t = [];
  let n = 0, o;
  for (; o = Io(e, n); ) if (/^<tool_call/i.test(o[0])) {
    const i = o0(e, o.index);
    if (!i) break;
    t.push(i), n = i.end;
  } else {
    const i = jI(e, o.index);
    t.push(i), n = i.end;
  }
  const r = Em(e);
  return r >= n && /^<\/?[｜|]/.test(e.slice(r)) && Ge(r, "DSML 标记未输出完整"), t;
}
function Em(e) {
  const t = e.lastIndexOf("<");
  if (t < 0) return -1;
  const n = e.slice(t).replace(/[｜|]+/g, "|").toLowerCase();
  return [
    "<tool_call",
    "<|dsml|",
    "</|dsml|"
  ].some((o) => o.startsWith(n)) ? t : -1;
}
function i0(e) {
  try {
    return JSON.parse(e);
  } catch {
    return e;
  }
}
function Be(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function me(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function dn(e, t) {
  return e.captureRawAssistantMessage === !0 ? { rawAssistantMessage: me(t) } : {};
}
function Y(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Cm(e = "") {
  return !!Io(String(e || ""));
}
function wm(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function Im(e, t = "") {
  const n = wm(e);
  try {
    return JSON.parse(n), n;
  } catch {
    return Am(n, t) || n;
  }
}
function s0(e = "") {
  const t = String(e || ""), n = Na(t, "arguments");
  if (!n) return "";
  let o = n.end;
  for (; /\s/.test(t[o] || ""); ) o += 1;
  const r = t[o] || "";
  return r === "{" ? t.slice(o).replace(/\}\s*$/, "").trimEnd() : r === '"' ? t.slice(o + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(o).replace(/\}\s*$/, "").trimEnd();
}
function a0(e = "") {
  const t = String(e || "").trim(), n = qe(t, "name", ["id", "arguments"]) || qe(t, "toolName", ["id", "arguments"]) || "", o = qe(t, "id", [
    "name",
    "toolName",
    "arguments"
  ]), r = s0(t);
  return !n || !r ? null : {
    id: o,
    name: n,
    arguments: Im(r, n)
  };
}
function l0(e, t = 0, n = "openai-tool") {
  if (!Y(e)) return null;
  const o = Y(e.function) ? e.function : null, r = String(o?.name || "").trim();
  if (!r) return null;
  const i = me(e) || {};
  return delete i.index, i.id = String(i.id || `${n}-${t + 1}`), i.type = "function", i.function = {
    ...me(o) || {},
    name: r,
    arguments: o.arguments === void 0 ? "" : wm(o.arguments)
  }, i;
}
function ho(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, o) => l0(n, o, t)).filter(Boolean);
}
function po(e, t) {
  return Array.isArray(e) ? e.some((n) => po(n, t)) : Y(e) ? Object.entries(e).some(([n, o]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(o) : (Array.isArray(o) || Y(o)) && po(o, t)) : !1;
}
function u0(e) {
  return po(e, (t) => typeof t == "string" && t.length > 0);
}
function ws(e) {
  return po(e, () => !0);
}
function c0(e) {
  return po(e, (t) => typeof t != "string" || t.length === 0);
}
function d0(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => u0(t));
}
var Yc = /* @__PURE__ */ new WeakSet();
function $a(e) {
  if (!Y(e)) return null;
  const t = me(e) || {};
  if (typeof t.content == "string" && Cm(t.content) && (t.content = Dt(kt(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = ho(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function La(e = [], t = "openai-tool") {
  return ho(e, t).map((n, o) => ({
    id: n.id || `${t}-${Date.now()}-${o + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function Ua(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function kt(e = "") {
  const t = [], n = String(e || "");
  let o = 0, r = "";
  for (const i of n.matchAll(/<think>([\s\S]*?)<\/think>/gi)) {
    const s = Io(n, o);
    if (s && s.index < i.index) break;
    r += n.slice(o, i.index), Be(t, "思考块", i[1]), o = i.index + i[0].length;
  }
  return r = (r + n.slice(o)).trim(), {
    cleaned: r,
    thoughts: t
  };
}
function Dt(e = "", { streaming: t = !1 } = {}) {
  const n = String(e || ""), o = Io(n)?.index ?? (t ? Em(n) : -1);
  return o < 0 ? n.trim() : n.slice(0, o).trim();
}
function Is(e = "") {
  const t = String(e || "");
  if (!Cm(t)) return [];
  const n = Io(t), o = t.slice(n.index);
  return [{
    id: "tagged-json-draft",
    name: (/^<tool_call/i.test(n[0]) ? o.match(/["']?name["']?\s*:\s*["']([^"']+)/i) : o.match(/<[｜|]+DSML[｜|]+\s*invoke\s+name="([^"]+)"/i))?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }];
}
function Nt(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      Be(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((o) => Nt(e, o, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && Be(e, n, t.text), typeof t.content == "string" && Be(e, n, t.content), typeof t.reasoning_content == "string" && Be(e, n, t.reasoning_content), typeof t.thinking == "string" && Be(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((o) => {
      if (typeof o == "string") {
        Be(e, "推理摘要", o);
        return;
      }
      o && typeof o == "object" && Be(e, "推理摘要", o.text || o.content || "");
    }));
  }
}
function yt(e = {}, t = {}) {
  const n = [];
  return Nt(n, e.reasoning_content, "推理文本"), Nt(n, e.reasoning, "推理文本"), Nt(n, e.reasoning_text, "推理文本"), Nt(n, e.thinking, "思考块"), Nt(n, t.reasoning_content, "推理文本"), Nt(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        Be(n, "推理文本", o.text);
        return;
      }
      if (o.type === "summary_text") {
        Be(n, "推理摘要", o.text);
        return;
      }
      (o.type === "thinking" || o.type === "reasoning" || o.type === "reasoning_content") && Be(n, "思考块", o.text || o.content || o.reasoning || "");
    }
  }), n;
}
function f0(e = "") {
  const t = String(e || ""), n = [];
  r0(t).forEach((i) => {
    if (i.calls) {
      n.push(...i.calls);
      return;
    }
    try {
      const s = JSON.parse(i.payload);
      n.push({
        id: s.id,
        name: String(s.name || ""),
        arguments: Im(s.arguments, s.name)
      });
    } catch {
      const s = a0(i.payload);
      s && n.push(s);
    }
  });
  const o = n.filter((i) => i.name), r = new Set(o.filter((i) => i.id).map((i) => String(i.id)));
  return o.map((i, s) => {
    if (i.id) return i;
    let u = s + 1;
    for (; r.has(`tool-call-${u}`); ) u += 1;
    const c = `tool-call-${u}`;
    return r.add(c), {
      ...i,
      id: c
    };
  });
}
function so(e, t, n, o) {
  try {
    return f0(t);
  } catch (r) {
    throw Object.assign(r, dn(e, n)), o && (r.requestInspection = o), r;
  }
}
function Fa(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : $a(t);
}
function h0(e = {}) {
  const t = ho(e?.tool_calls);
  if (t.length) return t;
  const n = ho(Fa(e)?.tool_calls);
  return n.length ? n : [];
}
function p0(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function m0(e = "") {
  return /claude/i.test(String(e || ""));
}
function g0(e = "") {
  return Gr(e) === "openai";
}
function bm(e = {}, t = {}) {
  return t.mode !== "on" && t.mode !== "off" ? e : t.profileId === "kimi-k3" ? (e.reasoning_effort = t.mode === "off" ? "off" : t.effort, e) : t.profileId === "deepseek-thinking" ? (e.thinking = { type: t.mode === "off" ? "disabled" : "enabled" }, t.mode === "on" && (e.reasoning_effort = t.effort), e) : (String(t.profileId || "").startsWith("openai-") && (e.reasoning_effort = t.mode === "off" ? "none" : t.effort), e);
}
function Rm(e = [], t = "") {
  if (!m0(t)) return e;
  let n = -1;
  for (let r = e.length - 1; r >= 0; r -= 1) if (typeof e[r]?.role == "string") {
    n = r;
    break;
  }
  const o = e[n]?.role;
  return n < 0 || o === "user" || o !== "system" && o !== "assistant" ? e : e.map((r, i) => i === n ? {
    ...r,
    role: "user"
  } : r);
}
function Xc(e, t = "") {
  return !Y(e) || !p0(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var bs = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function _0(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((o) => me(o) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((o, r) => {
    const i = me(o) || {}, s = Number.isInteger(Number(o?.index)) ? Number(o.index) : r, u = n[s];
    n[s] = Y(u) ? bo(u, i, "tool_call") : i;
  }), n.filter((o) => o !== void 0);
}
function bo(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return me(t);
  if (t === null && bs.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return _0(e, t);
  if (typeof e == "string" && typeof t == "string")
    return bs.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : me(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(me(t) || []);
  if (Y(e) && Y(t)) {
    const o = { ...e };
    return Object.entries(t).forEach(([r, i]) => {
      o[r] = bo(o[r], i, r);
    }), o;
  }
  return me(t);
}
function Dr(e = {}, t = {}) {
  const n = Y(e) ? me(e) || {} : {}, o = Y(t) ? me(t) || {} : {};
  return delete o.message, delete o.finish_reason, delete o.index, delete o.logprobs, delete o.delta, Object.entries(o).forEach(([r, i]) => {
    n[r] = bo(n[r], i, r);
  }), n.role || (n.role = "assistant"), $a(n) || { role: "assistant" };
}
function ao(e, t = {}) {
  const n = $a(Dr(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function y0(e = {}, t = {}) {
  return Y(e) ? Y(t) ? bo(me(e) || {}, t, "") : me(e) : me(t);
}
function Rs(e, t = "", { preserveReasoningContent: n = !1 } = {}) {
  const o = Array.isArray(e.messages) ? e.messages : [], r = DI(o), i = [];
  let s = !1;
  o.forEach((c, d) => {
    if (s) {
      if (c?.role === "tool") return;
      s = !1;
    }
    const f = c?.role === "assistant", h = f ? c?.providerPayload?.openaiCompatibleMessage : null, p = Mm(Array.isArray(h?.tool_calls) && h.tool_calls.some((E) => ws(E)) ? h.tool_calls : f && Array.isArray(c?.tool_calls) && c.tool_calls.some((E) => ws(E)) ? c.tool_calls : null);
    if (p) {
      const E = Y(h) ? h : c;
      (!Y(E) || !Yc.has(E)) && (Y(E) && Yc.add(E), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: p.index,
        toolName: p.toolName,
        reason: p.reason
      })), s = !0;
      return;
    }
    const m = f ? ho(c?.tool_calls) : [], g = f ? Fa(c) : null, _ = Array.isArray(g?.tool_calls) ? g.tool_calls : [], y = _.length > 0 && d0(g);
    if ($I(g, d, r)) {
      i.push(Xc({
        ...g,
        ...m.length && !y ? { tool_calls: m } : {}
      }, t));
      return;
    }
    const T = {
      role: c.role,
      content: c.content
    };
    n && typeof g?.reasoning_content == "string" && (T.reasoning_content = g.reasoning_content), c.role === "tool" && c.tool_call_id && (T.tool_call_id = c.tool_call_id), y ? T.tool_calls = _ : m.length && (T.tool_calls = m), i.push(Xc(T, t));
  });
  const u = String(e.systemPrompt || "").trim();
  if (u) if (i[0]?.role === "system") {
    const c = String(i[0].content || "").trim();
    i[0] = {
      ...i[0],
      content: [u, c === u ? "" : c].filter(Boolean).join(`

`)
    };
  } else i.unshift({
    role: "system",
    content: u
  });
  return Rm(i, t);
}
function Qc(e) {
  const t = (e.tools || []).map((r) => [`- ${r.function.name}: ${r.function.description || ""}`.trim(), `  参数 JSON Schema: ${JSON.stringify(r.function.parameters || {})}`].join(`
`)).join(`
`), n = String(e.toolChoice || "auto").trim() || "auto", o = n === "required" ? "本轮必须调用工具，不得只返回正文。" : n === "none" ? "本轮不得调用工具，不得输出 <tool_call> 标签。" : n === "auto" ? "请根据任务判断是否需要调用工具。" : `本轮必须调用工具 ${n}，不得调用其他工具，也不得只返回正文。`;
  return [
    e.systemPrompt || "",
    "如果你需要调用工具，不要使用原生 tool calling 字段。",
    o,
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
function Ps(e, t = "") {
  const n = /* @__PURE__ */ new Map(), o = [];
  if ((Array.isArray(e.messages) ? e.messages : []).forEach((r) => {
    if (r.role === "assistant") {
      const i = h0(r);
      if (i.length) {
        const s = Fa(r), u = typeof s?.content == "string" ? s.content : String(r.content || ""), c = i.map((d, f) => {
          const h = d.function?.name || "", p = d.id || `tool-call-${f + 1}`;
          return h && n.set(p, h), `<tool_call>${JSON.stringify({
            id: p,
            name: h,
            arguments: i0(d.function.arguments)
          })}</tool_call>`;
        }).join(`
`);
        o.push({
          role: "assistant",
          content: [u, c].filter(Boolean).join(`

`)
        });
        return;
      }
    }
    if (r.role === "tool") {
      const i = String(r.toolName || r.tool_name || "").trim() || n.get(r.tool_call_id || "") || "unknown_tool";
      r.tool_call_id && n.delete(r.tool_call_id);
      const s = String(r.content || "");
      o.push({
        role: "user",
        content: [
          "<tool_result>",
          "这是系统工具执行结果，不是用户新发言。",
          `name: ${i}`,
          "content:",
          s,
          "</tool_result>"
        ].join(`
`)
      });
      return;
    }
    o.push({
      role: r.role,
      content: r.content
    });
  }), !o.length || o[0].role !== "system") o.unshift({
    role: "system",
    content: Qc(e)
  });
  else {
    const r = String(o[0].content || "").trim(), i = String(e.systemPrompt || "").trim();
    o[0] = {
      ...o[0],
      content: [Qc(e), r === i ? "" : r].filter(Boolean).join(`

`)
    };
  }
  return Rm(o, t);
}
function Zc(e, t, n) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: z(n) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Fn(e, t = []) {
  return z(e) ? t : [];
}
function Pm(e, t, n) {
  !e || !t || n === void 0 || (e[t] = bo(e[t], n, t));
}
function $r(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (Y(n)) {
      const o = Y(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([r, i]) => {
        $r(o, r, i);
      }), e[t] = o;
      return;
    }
    if (typeof n == "string" && bs.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || Pm(e, t, n);
  }
}
function v0(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const o = Number(n?.index ?? 0), r = { ...e.tool_calls[o] || {} };
    Object.entries(n || {}).forEach(([i, s]) => {
      if (i !== "index" && !(i === "function" && s == null)) {
        if (i === "function" && Y(s)) {
          r.function = Y(r.function) ? { ...r.function } : {}, Object.entries(s).forEach(([u, c]) => {
            $r(r.function, u, c);
          });
          return;
        }
        $r(r, i, s);
      }
    }), e.tool_calls[o] = r;
  }));
}
function Ms(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([o, r]) => {
    o === "delta" || o === "finish_reason" || o === "index" || o === "logprobs" || Pm(e, o, r);
  });
  const n = Y(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([o, r]) => {
    if (o === "tool_calls") {
      v0(e, r);
      return;
    }
    $r(e, o, r);
  });
}
function rn(e = {}) {
  return Ua(e?.content);
}
function sn(e = {}) {
  return La(e?.tool_calls || []);
}
function A0(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return Y(JSON.parse(e));
  } catch {
    return !1;
  }
}
function Mm(e) {
  if (!Array.isArray(e) || !e.some((t) => ws(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], o = Y(n?.function) ? n.function : null, r = String(o?.name || "").trim();
    let i = "";
    if (!Y(n) || !o ? i = "invalid_function_shape" : r ? A0(o.arguments) ? c0(n) && (i = "invalid_thought_signature") : i = "invalid_function_arguments" : i = "missing_function_name", i) return {
      index: t,
      toolName: r,
      reason: i
    };
  }
  return null;
}
function an(e = {}) {
  const t = Mm(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function T0(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("openai_compatible_stream_missing_body");
  const o = new TextDecoder();
  let r = "";
  const i = /\r?\n\r?\n/, s = (u) => {
    const c = u.split(/\r?\n/).filter((d) => d.startsWith("data:")).map((d) => d.slice(5).trimStart()).join(`
`).trim();
    c && c !== "[DONE]" && t(JSON.parse(c));
  };
  try {
    for (; ; ) {
      const { done: c, value: d } = await n.read();
      if (c) break;
      for (r += o.decode(d, { stream: !0 }); ; ) {
        const f = r.match(i);
        if (!f || typeof f.index != "number") break;
        const h = f.index, p = r.slice(0, h);
        r = r.slice(h + f[0].length), s(p);
      }
    }
    const u = r.trim();
    u && s(u);
  } catch (u) {
    try {
      await n.cancel();
    } catch {
    }
    throw u;
  } finally {
    n.releaseLock();
  }
}
function S0(e, t) {
  const n = String(e || "").trim();
  if (n && (n.startsWith("{") || n.startsWith("["))) try {
    const o = JSON.parse(n), r = o?.error?.message || o?.message;
    if (typeof r == "string" && r.trim()) return r.trim();
  } catch {
  }
  return n || `OpenAI 兼容流式请求失败（HTTP ${t}）`;
}
var E0 = class {
  constructor(e) {
    this.config = e, this.auth = Or("openai-compatible", e.apiKey), this.client = new H({
      ...this.auth.sdkOptions,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = j("openai-compatible", this.config, e.reasoning)) {
    const n = t, o = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, r = !o && Array.isArray(e.tools) && e.tools.length ? e.tools : null, i = kI({
      ...this.config,
      provider: "openai-compatible"
    }, r, n), s = {
      model: this.config.model,
      messages: o ? Ps(e, this.config.model) : Rs(e, this.config.model, { preserveReasoningContent: i }),
      ...r ? {
        tools: r,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? g0(this.config.model) ? { max_completion_tokens: e.maxTokens } : { max_tokens: e.maxTokens } : {}
    };
    return i && (s.tool_choice === "required" || s.tool_choice?.type === "function") && (s.tool_choice = "auto"), !go({
      ...this.config,
      provider: "openai-compatible"
    }, n) && typeof e.temperature == "number" && (s.temperature = e.temperature), bm(s, n);
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = t.effectiveReasoning || j("openai-compatible", this.config, e.reasoning), r = {
      ...t.body || this.buildRequestBody(e, o),
      ...n ? { stream: !0 } : {}
    }, i = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), s = {
      ...Object.hasOwn(r, "reasoning_effort") ? { reasoning_effort: r.reasoning_effort } : {},
      ...Object.hasOwn(r, "thinking") ? { thinking: r.thinking } : {}
    };
    return { ...co({
      provider: "openai-compatible",
      model: this.config.model,
      transport: "openai-compatible",
      url: `${i}/chat/completions`,
      headers: this.auth.requestHeaders,
      body: r,
      sdk: n ? "client.chat.completions.create(..., { stream: true })" : "client.chat.completions.create",
      effectiveConfig: {
        ...St(e, {
          reasoning: o,
          effort: r.reasoning_effort,
          controlFields: s
        }),
        ...r.tool_choice !== void 0 ? { toolChoice: r.tool_choice } : {}
      }
    }) };
  }
  async streamNativeChatCompletions(e, t, n) {
    const o = `${String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`, r = await fetch(o, {
      method: "POST",
      headers: this.auth.requestHeaders,
      body: JSON.stringify({
        ...t,
        stream: !0
      }),
      signal: e.signal
    });
    if (!r.ok) {
      const g = await r.text().catch(() => ""), _ = new Error(S0(g, r.status));
      throw _.status = r.status, _.body = g, _;
    }
    const i = { role: "assistant" };
    let s, u = this.config.model;
    await T0(r, (g) => {
      if (g?.error) throw new H.APIError(void 0, g.error, void 0, r.headers);
      u = g?.model || u;
      const _ = g?.choices?.[0];
      Ms(i, _), _?.finish_reason && (s = _.finish_reason);
      const y = kt(rn(i)), T = sn(i), E = T.length ? T : Is(y.cleaned);
      Zc(e, {
        text: T.length ? y.cleaned : Dt(y.cleaned, { streaming: !0 }),
        thoughts: Fn(n, yt(i, _).concat(y.thoughts)),
        ...E.length ? { toolCalls: E } : {},
        ...!T.length && E.length ? { toolCallDraft: !0 } : {}
      }, n);
    }), an(i);
    const c = ao(i), d = sn(i), f = kt(rn(i)), h = yt(i, {});
    f.thoughts.forEach((g) => h.push(g));
    const p = d.length ? [] : so(e, f.cleaned, i), m = [...d, ...p];
    return {
      text: d.length ? f.cleaned : Dt(f.cleaned),
      toolCalls: m,
      thoughts: Fn(n, h),
      ...Qe("openai", s, !!i.refusal),
      model: u,
      provider: "openai-compatible",
      providerPayload: c,
      ...dn(e, i)
    };
  }
  async chat(e) {
    const t = j("openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, o = typeof e.onStreamProgress == "function", r = this.buildRequestBody(e, t), i = this.inspectRequest(e, {
      body: r,
      effectiveReasoning: t
    }), s = async (T) => {
      try {
        return await T(r);
      } catch (E) {
        throw E && typeof E == "object" && (E.requestInspection = i), E;
      }
    };
    if (o) {
      if (!n) return {
        ...await s((V) => this.streamNativeChatCompletions(e, V, t)),
        requestInspection: i
      };
      const T = await s((V) => this.client.chat.completions.create({
        ...V,
        stream: !0
      }, { signal: e.signal })), E = { role: "assistant" };
      let C, b = this.config.model, k;
      for await (const V of T) {
        b = V.model || b;
        const W = V.choices?.[0];
        Ms(E, W), W?.finish_reason && (C = W.finish_reason);
        const ge = kt(rn(E)), We = sn(E), Le = We.length ? We : Is(ge.cleaned);
        Zc(e, {
          text: We.length ? ge.cleaned : Dt(ge.cleaned, { streaming: !0 }),
          thoughts: Fn(t, yt(E, W).concat(ge.thoughts)),
          ...Le.length ? { toolCalls: Le } : {},
          ...!We.length && Le.length ? { toolCallDraft: !0 } : {}
        }, t);
      }
      const w = (typeof T.finalChatCompletion == "function" ? await T.finalChatCompletion() : null)?.choices?.[0] || null, D = w?.message || E;
      an(D);
      const I = y0(E, Dr(D, w || {}));
      an(I), k = ao(I);
      const x = sn(I), R = kt(rn(I)), F = yt(I, w || {});
      R.thoughts.forEach((V) => F.push(V));
      const X = x.length ? [] : so(e, R.cleaned, D, i), J = [...x, ...X];
      return {
        text: x.length ? R.cleaned : Dt(R.cleaned),
        toolCalls: J,
        thoughts: Fn(t, F),
        ...Qe("openai", C, !!D.refusal),
        model: b,
        provider: "openai-compatible",
        providerPayload: k,
        requestInspection: i,
        ...dn(e, D)
      };
    }
    const u = await s((T) => this.client.chat.completions.create(T, { signal: e.signal })), c = u.choices?.[0] || {}, d = c.message || {};
    an(d);
    const f = yt(d, c), h = La(d.tool_calls || []), p = kt(Ua(d.content));
    p.thoughts.forEach((T) => f.push(T));
    const m = h.length ? [] : so(e, p.cleaned, d, i), g = [...h, ...m], _ = h.length ? p.cleaned : Dt(p.cleaned), y = Dr(d, c);
    return {
      text: _,
      toolCalls: g,
      thoughts: Fn(t, f),
      ...Qe("openai", c.finish_reason, !!d.refusal),
      model: u.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: ao(y),
      requestInspection: i,
      ...dn(e, d)
    };
  }
};
function C0(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Oa(e) {
  const t = C0(Array.isArray(e) ? e : []);
  return Array.isArray(t) ? (t.forEach((n) => {
    !n || typeof n != "object" || Array.isArray(n) || (n.type === "function_call" && delete n.parsed_arguments, n.type === "message" && Array.isArray(n.content) && n.content.forEach((o) => {
      !o || typeof o != "object" || Array.isArray(o) || delete o.parsed;
    }));
  }), t) : [];
}
function Nm(e, t) {
  return {
    type: "message",
    role: e,
    content: w0(t)
  };
}
function Lr(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function w0(e) {
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
function Ur(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function jc(e, t = [], n = {}) {
  (t || []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        Ur(e, n.reasoning || "推理文本", o.text);
        return;
      }
      o.type === "summary_text" && Ur(e, n.summary || "推理摘要", o.text);
    }
  });
}
function I0(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (jc(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), jc(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function b0(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function R0(e) {
  if (typeof e?.output_text == "string" && e.output_text.trim()) return e.output_text.trim();
  const t = [];
  return (Array.isArray(e?.output) ? e.output : []).forEach((n) => {
    if (!(!n || typeof n != "object")) {
      if (n.type === "message" && Array.isArray(n.content)) {
        n.content.forEach((o) => {
          if (!(!o || typeof o != "object")) {
            if (o.type === "output_text" && typeof o.text == "string" && o.text.trim()) {
              t.push(o.text.trim());
              return;
            }
            o.type === "refusal" && typeof o.refusal == "string" && o.refusal.trim() && t.push(o.refusal.trim());
          }
        });
        return;
      }
      typeof n.text == "string" && n.text.trim() && t.push(n.text.trim());
    }
  }), t.join(`
`).trim();
}
function P0(e) {
  if (e && typeof e == "object" && !Array.isArray(e) && !Object.prototype.hasOwnProperty.call(e, "choices") && Array.isArray(e.output)) return;
  const t = /* @__PURE__ */ new Error("当前端点返回的不是 Responses API，请改用 OpenAI 兼容。");
  throw t.name = "OpenAIResponsesEndpointMismatchError", t.code = "OPENAI_RESPONSES_ENDPOINT_MISMATCH", t;
}
function M0(e, t) {
  const n = /* @__PURE__ */ new Error(e === "failed" ? "Responses 生成失败。" : "Responses 生成已取消。");
  return n.name = "OpenAIResponsesTerminationError", n.code = e === "failed" ? "OPENAI_RESPONSES_FAILED" : "OPENAI_RESPONSES_CANCELLED", n.reason = t, n;
}
function N0(e) {
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
        t.push(...Oa(n.providerPayload.openAIResponseOutput));
        continue;
      }
      if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
        n.content?.trim() && t.push(Lr(n.content)), n.tool_calls.forEach((o, r) => {
          t.push({
            type: "function_call",
            call_id: o.id || `function_call_${r + 1}`,
            name: o.function?.name || "",
            arguments: o.function?.arguments || "{}",
            status: "completed"
          });
        });
        continue;
      }
      if (n.role === "assistant") {
        t.push(Lr(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? Nm(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function x0(e) {
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
      t.push(...Oa(n.providerPayload.openAIResponseOutput));
      continue;
    }
    if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
      n.content?.trim() && t.push(Lr(n.content)), n.tool_calls.forEach((o, r) => {
        t.push({
          type: "function_call",
          call_id: o.id || `function_call_${r + 1}`,
          name: o.function?.name || "",
          arguments: o.function?.arguments || "{}",
          status: "completed"
        });
      });
      continue;
    }
    if (n.role === "assistant") {
      t.push(Lr(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? Nm(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function k0(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function D0(e) {
  if (e?.status === 401 || e?.status === 403) return !1;
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function $0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    activity: t.activity,
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft === !0 ? { toolCallDraft: !0 } : {}
  });
}
function Mi(e, t) {
  const [n = "0", o = "0"] = String(e || "").split(":"), [r = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(r) || Number(o) - Number(i);
}
var L0 = class {
  constructor(e) {
    this.config = e, this.auth = Or("openai-responses", e.apiKey), this.client = new H({
      ...this.auth.sdkOptions,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = !1, n = j("openai-responses", this.config, e.reasoning)) {
    const o = n, r = {
      model: this.config.model,
      instructions: t ? void 0 : b0(e) || void 0,
      input: t ? x0(e) : N0(e),
      ...Array.isArray(e.tools) && e.tools.length ? {
        tools: e.tools.map((i) => ({
          type: "function",
          name: i.function.name,
          description: i.function.description,
          parameters: i.function.parameters
        })),
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? { max_output_tokens: e.maxTokens } : {}
    };
    return !go({
      ...this.config,
      provider: "openai-responses"
    }, o) && typeof e.temperature == "number" && (r.temperature = e.temperature), o.mode === "on" || o.mode === "off" ? r.reasoning = {
      effort: o.mode === "off" ? "none" : o.effort,
      ...o.mode === "on" && z(o) ? { summary: "auto" } : {}
    } : z(o) && (r.reasoning = { summary: "auto" }), o.mode !== "off" && o.profileId.startsWith("openai-") && (r.include = ["reasoning.encrypted_content"]), r;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = t.legacySystemInInput === !0, r = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = t.effectiveReasoning || j("openai-responses", this.config, e.reasoning), s = t.body || this.buildRequestBody(e, o, i);
    return co({
      provider: "openai-responses",
      model: this.config.model,
      transport: "openai-responses",
      url: `${r}/responses`,
      headers: this.auth.requestHeaders,
      body: s,
      sdk: n ? "client.responses.stream" : "client.responses.create",
      effectiveConfig: St(e, {
        reasoning: i,
        effort: s.reasoning?.effort,
        controlFields: {
          ...s.reasoning ? { reasoning: s.reasoning } : {},
          ...s.include ? { include: s.include } : {}
        }
      })
    });
  }
  async chat(e) {
    const t = j("openai-responses", this.config, e.reasoning), n = [], o = () => ({
      ...n.at(-1)?.inspection || {},
      requestCount: n.length,
      fallbackCount: Math.max(0, n.length - 1),
      requests: n.map(({ reason: m, inspection: g }, _) => ({
        index: _ + 1,
        reason: m,
        request: g.request,
        effectiveConfig: g.effectiveConfig
      }))
    }), r = (m) => (m && typeof m == "object" && (m.requestInspection = o()), m), i = (m) => {
      if (P0(m), m.status === "failed" || m.status === "cancelled") throw M0(m.status, m.error?.code);
      const g = m.output;
      return {
        output: g,
        thoughts: z(t) ? I0(g) : [],
        toolCalls: g.filter((_) => _.type === "function_call" && _.name).map((_, y) => ({
          id: _.call_id || `response-tool-${y + 1}`,
          name: _.name || "",
          arguments: _.arguments ?? ""
        })),
        text: R0(m)
      };
    }, s = (m, g, _) => {
      const y = this.inspectRequest(e, {
        body: m,
        legacySystemInInput: g,
        effectiveReasoning: t
      });
      n.push({
        reason: _,
        inspection: y
      });
    }, u = async (m = !1, g = "initial") => {
      const _ = this.buildRequestBody(e, m, t);
      s(_, m, g);
      try {
        return await this.client.responses.create(_, { signal: e.signal });
      } catch (y) {
        throw r(y);
      }
    }, c = async (m = !1, g = "initial") => {
      const _ = this.buildRequestBody(e, m, t);
      s(_, m, g);
      try {
        const y = this.client.responses.stream(_, { signal: e.signal }), T = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map();
        let k = "waiting", w, D;
        for (const R of [
          "response.completed",
          "response.incomplete",
          "response.failed"
        ]) y.on(R, (F) => {
          D = F;
        });
        const I = (R, F) => {
          k = R, w = F;
          const X = [];
          z(t) && (Array.from(E.entries()).sort(([J], [V]) => Mi(J, V)).forEach(([, J]) => Ur(X, "推理文本", J)), Array.from(C.entries()).sort(([J], [V]) => Mi(J, V)).forEach(([, J]) => Ur(X, "推理摘要", J))), $0(e, {
            activity: k,
            text: Array.from(T.entries()).sort(([J], [V]) => Mi(J, V)).map(([, J]) => J).join(`
`).trim(),
            thoughts: X,
            ...b.size ? {
              toolCalls: Array.from(b.entries()).sort(([J], [V]) => J - V).map(([, J]) => ({
                id: J.call_id,
                name: J.name,
                arguments: J.arguments
              })),
              toolCallDraft: !0
            } : {}
          });
        };
        y.on("response.output_item.added", (R) => {
          if (R.item.type === "reasoning") {
            I("thinking", R.output_index);
            return;
          }
          R.item.type === "function_call" && (b.set(R.output_index, { ...R.item }), I("tool-call", R.output_index));
        }), y.on("response.output_item.done", (R) => {
          R.item.type === "reasoning" && w === R.output_index && k === "thinking" && I("waiting", R.output_index);
        }), y.on("response.function_call_arguments.delta", (R) => {
          const F = b.get(R.output_index);
          F && (F.arguments += R.delta, I("tool-call", R.output_index));
        }), y.on("response.function_call_arguments.done", (R) => {
          const F = b.get(R.output_index);
          F && (F.arguments = R.arguments, I("tool-call", R.output_index));
        }), y.on("response.output_text.delta", (R) => {
          if (!R.delta) return;
          const F = `${R.output_index}:${R.content_index}`;
          T.set(F, `${T.get(F) || ""}${R.delta}`), I("replying", R.output_index);
        }), y.on("response.reasoning_text.delta", (R) => {
          if (!R.delta) return;
          const F = `${R.output_index}:${R.content_index}`;
          E.set(F, `${E.get(F) || ""}${R.delta}`), I("thinking", R.output_index);
        }), y.on("response.reasoning_summary_text.delta", (R) => {
          if (!R.delta) return;
          const F = `${R.output_index}:${R.summary_index}`;
          C.set(F, `${C.get(F) || ""}${R.delta}`), I("thinking", R.output_index);
        });
        const x = await y.finalResponse();
        return D?.response || x;
      } catch (y) {
        throw r(y);
      }
    }, d = !k0(this.config.baseUrl), f = typeof e.onStreamProgress == "function" ? c : u;
    let h, p;
    try {
      h = await f(!1, "initial"), p = i(h);
    } catch (m) {
      if (!d || !D0(m)) throw r(m);
      h = await f(!0, "legacy_system_error");
      try {
        p = i(h);
      } catch (g) {
        throw r(g);
      }
    }
    if (d && n.length < 2 && !p.text && !p.toolCalls.length) {
      h = await f(!0, "empty_response");
      try {
        p = i(h);
      } catch (m) {
        throw r(m);
      }
    }
    return {
      text: p.text,
      toolCalls: p.toolCalls,
      thoughts: p.thoughts,
      ...Qe("responses", h.incomplete_details?.reason || h.status, p.output.some((m) => m?.type === "message" && Array.isArray(m.content) && m.content.some((g) => g?.type === "refusal"))),
      refused: p.output.some((m) => m?.type === "message" && Array.isArray(m.content) && m.content.some((g) => g?.type === "refusal")),
      model: h.model || this.config.model,
      provider: "openai-responses",
      providerPayload: p.output.length ? { openAIResponseOutput: Oa(p.output) } : void 0,
      requestInspection: o()
    };
  }
};
async function U0(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("host_chat_completions_stream_missing_body");
  const o = new TextDecoder();
  let r = "";
  const i = /\r?\n\r?\n/, s = (c) => {
    const d = c.split(/\r?\n/).filter((f) => f.startsWith("data:")).map((f) => f.slice(5).trimStart()).join(`
`).trim();
    !d || d === "[DONE]" || t(JSON.parse(d));
  };
  for (; ; ) {
    const { done: c, value: d } = await n.read();
    if (c) break;
    for (r += o.decode(d, { stream: !0 }); ; ) {
      const f = r.match(i);
      if (!f || typeof f.index != "number") break;
      const h = r.slice(0, f.index);
      r = r.slice(f.index + f[0].length), s(h);
    }
  }
  const u = r.trim();
  u && s(u);
}
var Ns = null;
function aR(e) {
  Ns = typeof e == "function" ? e : null;
}
async function F0() {
  if (!Ns) throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return await Ns();
}
var Bt = "openai", xm = "claude", km = "makersuite", O0 = "/api/backends/chat-completions/status", G0 = "/api/backends/chat-completions/generate", B0 = Object.freeze({
  [xm]: "https://api.anthropic.com/v1",
  [km]: "https://generativelanguage.googleapis.com"
}), Ro = F0;
function q0(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function H0(e = "") {
  return Gr(e) === "openai";
}
function V0(e, t) {
  const n = q0(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
async function Dm(e = Ro) {
  if (typeof e != "function") throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(e() || {}),
    Accept: "application/json"
  };
}
function J0(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, o]) => {
    t[n] = /authorization|cookie|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : o;
  }), t;
}
async function Ga(e = {}, t = !1, n = Ro) {
  const o = await Dm(n), r = {
    url: G0,
    method: "POST",
    headers: J0(o),
    body: {
      ...e,
      stream: !!t
    }
  };
  return Object.defineProperty(r, "rawHeaders", {
    value: o,
    enumerable: !1
  }), r;
}
async function K0(e = {}, t = !1) {
  return await Ga(e, t);
}
function W0(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function z0(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function Y0() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function ed(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function td(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => ed(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => ed(n));
}
function X0(e = "") {
  const t = String(e || ""), n = td((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), o = td(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), r = n || o;
  return r.length > 240 ? `${r.slice(0, 237)}...` : r;
}
function Q0(e = null) {
  const t = Number(e?.status), n = String(e?.statusText || "").trim();
  let o = "";
  try {
    o = String(e?.headers?.get?.("content-type") || "").trim();
  } catch {
    o = "";
  }
  return {
    status: Number.isFinite(t) && t > 0 ? t : 0,
    statusText: n,
    contentType: o
  };
}
function Z0(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function j0(e = "") {
  const t = String(e || "").trim();
  if (!t || t[0] !== "{" && t[0] !== "[") return "";
  try {
    const n = JSON.parse(t), o = n?.error?.message;
    if (typeof o == "string" && o.trim()) return o.trim();
    if (typeof n?.message == "string" && n.message.trim()) return n.message.trim();
  } catch {
    return "";
  }
  return "";
}
function fn(e = "", t = "", n = null) {
  if (z0(e)) return Y0();
  const o = Q0(n);
  if (W0(e) || /\btext\/html\b/i.test(o.contentType)) {
    const r = Z0(o), i = X0(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      r ? `（${r}）` : "",
      i ? `：${i}` : ""
    ].join("");
  }
  return j0(e) || String(e || t || "").trim();
}
function $m(e = {}, t = Bt) {
  const n = V0(e.baseUrl, t), o = String(e.apiKey || "").trim(), r = B0[t] || "", i = n || (o ? r : ""), s = { chat_completion_source: t || "openai" };
  return i && (s.reverse_proxy = i), o && (s.proxy_password = o), s;
}
function eb(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function tb(e = {}, t = Bt) {
  return $m(e, t);
}
function Ba(e = {}, t = {}, n = [], o = !1, r = Bt) {
  const i = t.maxTokens, s = r === "openai" && H0(e.model);
  return eb({
    ...$m(e, r),
    stream: !!o,
    messages: n,
    model: e.model,
    max_tokens: s ? void 0 : i,
    max_completion_tokens: s ? i : void 0,
    temperature: t.temperature,
    tools: Array.isArray(t.tools) && t.tools.length ? t.tools : void 0,
    tool_choice: Array.isArray(t.tools) && t.tools.length ? t.toolChoice || "auto" : void 0,
    use_sysprompt: r === "openai" ? void 0 : !0
  });
}
function nb(e = {}, t = {}, n = [], o = !1) {
  return Ba(e, t, n, o, Bt);
}
function ob(e = {}, t = {}, n = [], o = !1) {
  return Ba(e, t, n, o, xm);
}
function rb(e = {}, t = {}, n = [], o = !1) {
  return Ba(e, t, n, o, km);
}
function qa(e) {
  const t = e || globalThis.fetch;
  if (typeof t != "function") throw new Error("当前运行环境没有可用的 fetch，无法调用酒馆后端。");
  return t;
}
async function ib(e = {}, t = Bt, n = {}, o = {}) {
  const r = await qa(o.fetch)(O0, {
    method: "POST",
    headers: await Dm(o.requestHeadersProvider),
    body: JSON.stringify(tb(e, t)),
    signal: n.signal
  }), i = await r.text();
  let s = null;
  try {
    s = i ? JSON.parse(i) : {};
  } catch (c) {
    throw new Error(`酒馆后端模型列表拉取失败：${fn(i, String(c?.message || c), r)}`);
  }
  if (!r.ok || s?.error) {
    const c = fn(s?.message || s?.error?.message || i, `HTTP ${r.status}`, r);
    throw new Error(`酒馆后端模型列表拉取失败：${c}`);
  }
  const u = Array.isArray(s?.data) ? s.data.map((c) => String(c?.id || c?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(u)];
}
async function Lm(e = {}, t = Bt, n = {}) {
  return await ib(e, t, n, { requestHeadersProvider: Ro });
}
async function sb(e = {}, t = {}) {
  return await Lm(e, Bt, t);
}
async function ab(e = {}, t = {}, n = {}) {
  const o = await Ga(e, !1, n.requestHeadersProvider);
  typeof t.onRequest == "function" && t.onRequest(o);
  const r = await qa(n.fetch)(o.url, {
    method: o.method,
    headers: o.rawHeaders || o.headers,
    body: JSON.stringify(o.body),
    signal: t.signal
  }), i = await r.text();
  let s = null;
  try {
    s = i ? JSON.parse(i) : {};
  } catch (u) {
    const c = /* @__PURE__ */ new Error(`酒馆后端生成失败：${fn(i, String(u?.message || u), r)}`);
    throw c.status = r.status, c.body = i, c;
  }
  if (!r.ok || s?.error) {
    const u = fn(s?.error?.message || s?.message || i, `HTTP ${r.status}`, r), c = /* @__PURE__ */ new Error(`酒馆后端生成失败：${u}`);
    throw c.status = r.status, c.error = s?.error, c;
  }
  return s;
}
async function lb(e = {}, t = {}) {
  return await ab(e, t, { requestHeadersProvider: Ro });
}
async function ub(e = {}, t, n = {}, o = {}) {
  const r = await Ga(e, !0, o.requestHeadersProvider);
  typeof n.onRequest == "function" && n.onRequest(r);
  const i = await qa(o.fetch)(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!i.ok) {
    const s = await i.text().catch(() => ""), u = new Error(fn(s, `酒馆后端流式生成失败：HTTP ${i.status}`, i));
    throw u.status = i.status, u.body = s, u;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await U0(i, (s) => {
    if (s?.error) {
      const u = fn(s.error?.message || s.message || JSON.stringify(s.error), "酒馆后端流式生成失败");
      throw new Error(u);
    }
    t(s);
  });
}
async function cb(e = {}, t, n = {}) {
  return await ub(e, t, n, { requestHeadersProvider: Ro });
}
var db = Object.freeze([
  "buildHostChatCompletionGenerateRequest",
  "createHostChatCompletion",
  "streamHostChatCompletion"
]);
function si(e) {
  if (!e || !db.every((t) => typeof e[t] == "function")) throw new TypeError("酒馆渠道必须注入有效的 Host Client。");
  return e;
}
var Ha = Object.freeze({
  buildHostChatCompletionGenerateRequest: K0,
  fetchHostChatCompletionsModels: Lm,
  fetchHostOpenAICompatibleModels: sb,
  createHostChatCompletion: lb,
  streamHostChatCompletion: cb
});
function Ot(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function fb(e) {
  const t = String(e || "").trim();
  if (!t || t === "auto") return "auto";
  if (t === "required") return "any";
  if (t === "none") return "none";
  throw new Error(`酒馆托管 Claude 不支持 tool_choice：${t}。仅支持 auto/required/none。`);
}
function hb(e = {}, t = {}, n = j("sillytavern-claude", e, t.reasoning)) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const o = fb(t.toolChoice), r = n.profileId === "sillytavern-claude-manual" || n.profileId === "sillytavern-claude-adaptive-conditional";
  return {
    toolChoice: o,
    reasoningDisabledForForcedTool: o === "any" && n.mode === "on" && r
  };
}
var pb = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function nr(e = {}, t = {}, n = {}, o) {
  const r = o || j("sillytavern-claude", e, t.reasoning);
  return n.reasoningDisabledForForcedTool ? {
    ...r,
    mode: "off",
    output: "hide"
  } : r;
}
function mb(e = {}, t = {}, n = {}) {
  return St(e, {
    reasoning: n,
    effort: n.mode === "on" ? n.effort : "",
    controlFields: t.controlFields || {}
  });
}
function gb(e = {}, t = {}) {
  return { toolChoice: String(t.toolChoice || "") };
}
function Um(e = "") {
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
    const o = Um(t.function.arguments || "{}");
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
function yb(e = []) {
  const t = Array.isArray(e) ? Ot(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function vb(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = Ot(r) || {}, s = yb(i?.providerPayload?.anthropicContent), u = _b(i.tool_calls);
    delete i.providerPayload, i.role === "assistant" && s && u.length ? (delete i.tool_calls, i.content = s.filter((c) => c?.type !== "tool_use").concat(u)) : i.role === "assistant" && s && (delete i.tool_calls, i.content = s), n.push(i);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function Ab(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const o = Um(t.inputJson);
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
      thinking: String(t.thinking || t.text || ""),
      ...typeof t.signature == "string" ? { signature: t.signature } : {}
    } : t.type === "redacted_thinking" ? {
      type: "redacted_thinking",
      data: String(t.data || "")
    } : Ot(t) || null;
  }).filter(Boolean);
}
function Tb(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: Ot(t.input) || {}
  } : Ot(t) || null).filter(Boolean);
}
function Sb(e = []) {
  const t = Array.isArray(e) ? e : [], n = t.filter((i) => i?.type === "text").map((i) => i.text || "").join(`
`), o = t.filter((i) => i?.type === "thinking" || i?.type === "redacted_thinking").map((i) => ({
    label: i.type === "thinking" ? "思考块" : "已脱敏思考块",
    text: i.type === "thinking" ? i.thinking || "" : i.data || ""
  })).filter((i) => i.text), r = t.filter((i) => i?.type === "tool_use" && i.name).map((i, s) => ({
    id: i.id || `st-claude-tool-${s + 1}`,
    name: i.name,
    arguments: i.inputJson !== void 0 ? i.inputJson : JSON.stringify(i.input || {})
  }));
  return {
    text: n,
    thoughts: o,
    ...r.length ? {
      toolCalls: r,
      toolCallDraft: !0
    } : {}
  };
}
function Eb(e = [], t = {}) {
  const n = Ab(e), o = n.filter((r) => r.type === "tool_use" && r.name).map((r, i) => ({
    id: r.id || `st-claude-tool-${i + 1}`,
    name: r.name,
    arguments: r.invalidInputJson !== void 0 ? r.invalidInputJson : JSON.stringify(r.input || {})
  }));
  return {
    text: n.filter((r) => r.type === "text").map((r) => r.text || "").join(`
`),
    toolCalls: o,
    thoughts: t.includeReasoningOutput === !1 ? [] : n.filter((r) => r.type === "thinking" || r.type === "redacted_thinking").map((r) => ({
      label: r.type === "thinking" ? "思考块" : "已脱敏思考块",
      text: r.type === "thinking" ? r.thinking || "" : r.data || ""
    })).filter((r) => r.text),
    ...Qe("anthropic", t.finishReason),
    model: t.model || "",
    provider: "sillytavern-claude",
    providerPayload: n.length ? { anthropicContent: Tb(n) } : void 0
  };
}
function Cb(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function wb(e, t, n = {}) {
  const o = [];
  let r, i = n.model || "";
  const s = (c, d = {}) => {
    const f = Number.isInteger(Number(c)) ? Number(c) : o.length;
    return o[f] ? o[f] = {
      ...o[f],
      ...d
    } : o[f] = { ...d }, o[f];
  }, u = () => {
    const c = Sb(o);
    Cb(e, {
      text: c.text,
      thoughts: z(t) ? c.thoughts : [],
      ...Array.isArray(c.toolCalls) ? { toolCalls: c.toolCalls } : {},
      ...c.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(c = {}) {
      if (c?.message?.model && (i = c.message.model), c.type === "content_block_start") {
        s(c.index, Ot(c.content_block) || {}), u();
        return;
      }
      if (c.type === "content_block_delta") {
        const d = s(c.index), f = c.delta || {};
        f.type === "text_delta" ? (d.type = d.type || "text", d.text = `${d.text || ""}${f.text || ""}`) : f.type === "input_json_delta" ? (d.type = d.type || "tool_use", d.inputJson = `${d.inputJson || ""}${f.partial_json || ""}`) : f.type === "thinking_delta" ? (d.type = d.type || "thinking", d.thinking = `${d.thinking || ""}${f.thinking || ""}`) : f.type === "signature_delta" && (d.signature = `${d.signature || ""}${f.signature || ""}`), u();
        return;
      }
      c.type === "message_delta" && (r = c.delta?.stop_reason || r);
    },
    result() {
      return Eb(o, {
        finishReason: r,
        model: i,
        includeReasoningOutput: z(t)
      });
    }
  };
}
var Ib = class {
  constructor(e, t = Ha) {
    this.config = e, this.hostClient = si(t);
  }
  buildMessages(e) {
    return vb(e);
  }
  resolveToolProtocol(e, t) {
    return hb(this.config, e, t);
  }
  buildPayload(e, t = this.resolveToolProtocol(e), n = nr(this.config, e, t)) {
    const r = this.buildMessages(e), i = {
      ...e,
      toolChoice: t.toolChoice,
      reasoning: n,
      temperature: go({
        ...this.config,
        provider: "sillytavern-claude"
      }, n) ? void 0 : e.temperature
    }, s = ob(this.config, i, r, !0);
    return n.mode === "on" ? (s.reasoning_effort = n.effort, s.include_reasoning = z(n)) : n.mode === "off" ? (s.reasoning_effort = "auto", s.include_reasoning = !1) : (s.reasoning_effort = "auto", s.include_reasoning = z(n)), s;
  }
  async inspectRequest(e, t = {}) {
    const n = j("sillytavern-claude", this.config, e.reasoning), o = t.protocol || this.resolveToolProtocol(e, n), r = t.effectiveReasoning || nr(this.config, e, o, n), i = t.payload || this.buildPayload(e, o, r), s = await this.hostClient.buildHostChatCompletionGenerateRequest(i, !0);
    return this.buildRequestInspection(s, o, e, r);
  }
  buildRequestInspection(e, t = {}, n = {}, o = nr(this.config, n, t)) {
    const r = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Ft(e),
      effectiveConfig: {
        ...gb(n, t),
        ...mb(n, {
          ...t,
          controlFields: r
        }, o)
      },
      ...t.reasoningDisabledForForcedTool ? { notices: [pb] } : {}
    };
  }
  async chat(e) {
    const t = j("sillytavern-claude", this.config, e.reasoning), n = this.resolveToolProtocol(e, t), o = nr(this.config, e, n, t), r = this.buildPayload(e, n, o);
    let i = null;
    const s = (u) => {
      i = this.buildRequestInspection(u, n, e, o);
    };
    try {
      const u = wb(e, o, this.config);
      return await this.hostClient.streamHostChatCompletion(r, (c) => u.accept(c), {
        signal: e.signal,
        onRequest: s
      }), {
        ...u.result(),
        requestInspection: i
      };
    } catch (u) {
      throw i && u && typeof u == "object" && (u.requestInspection = i), u;
    }
  }
};
function Va(e) {
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
  const t = Va(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function bb(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((r) => hn(r)).filter((r) => Array.isArray(r.parts) && r.parts.length);
  const n = e?.providerPayload?.googleContent, o = hn(n);
  return o.parts.length ? [o] : [];
}
function Rb(e = {}) {
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
function Pb(e = {}, t = 0) {
  const n = hn(e);
  if (!n.parts.length) return null;
  const o = {
    role: n.role === "user" ? "user" : "assistant",
    content: []
  }, r = n.parts.find((s) => !s?.thought && typeof s?.text == "string" && typeof s?.thoughtSignature == "string" && s.thoughtSignature)?.thoughtSignature || "", i = [];
  return n.parts.forEach((s) => {
    if (!s || typeof s != "object") return;
    if (!s.thought && typeof s.text == "string" && s.text) {
      o.content.push({
        type: "text",
        text: s.text
      });
      return;
    }
    if (s.functionCall?.name) {
      i.push({
        id: String(s.functionCall.id || `st-google-tool-${t + 1}-${i.length + 1}`),
        type: "function",
        function: {
          name: String(s.functionCall.name || ""),
          arguments: JSON.stringify(s.functionCall.args || {})
        },
        ...typeof s.thoughtSignature == "string" && s.thoughtSignature ? { signature: s.thoughtSignature } : {}
      });
      return;
    }
    const u = Rb(s.inlineData);
    u && o.content.push(u);
  }), i.length && o.content.push({
    type: "tool_calls",
    tool_calls: i
  }), r && o.content.some((s) => s?.type === "text") && (o.signature = r), o.content.length ? o : null;
}
function Mb(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = bb(r);
    if (r.role === "assistant" && i.length) {
      i.forEach((u, c) => {
        const d = Pb(u, c);
        d && n.push(d);
      });
      return;
    }
    const s = Va(r) || {};
    delete s.providerPayload, n.push(s);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function Nb(e = {}) {
  return hn(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function xb(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function kb(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function Db(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function $b(e, t) {
  const n = String(t || ""), o = String(e || "");
  return n ? !o || n.startsWith(o) ? n : o.endsWith(n) ? o : `${o}${n}` : o;
}
function Lb(e = [], t = []) {
  const n = Array.isArray(e) ? [...e] : [];
  return t.forEach((o) => {
    const r = [
      o.id || "",
      o.name || "",
      o.arguments || ""
    ].join("\0");
    n.some((i) => [
      i.id || "",
      i.name || "",
      i.arguments || ""
    ].join("\0") === r) || n.push(o);
  }), n;
}
function Ub(e) {
  const t = hn(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function Fb(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Ob(e, t, n = {}) {
  let o = "", r = [], i = [], s, u = n.model || "";
  const c = [];
  return {
    accept(d = {}) {
      u = d.model || d.modelVersion || u, s = d?.candidates?.[0]?.finishReason || s;
      const f = Nb(d);
      f.parts.length && c.push(...Va(f.parts) || []), o = $b(o, xb(f)), r = Lb(r, Db(f));
      const h = z(t) ? kb(f) : [];
      h.length && (i = h), Fb(e, {
        text: o,
        thoughts: i,
        ...r.length ? {
          toolCalls: r,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const d = hn({
        role: "model",
        parts: c.length ? c : o ? [{ text: o }] : []
      });
      return {
        text: o,
        toolCalls: r,
        thoughts: i,
        ...Qe("google", s),
        model: u,
        provider: "sillytavern-google",
        providerPayload: Ub(d)
      };
    }
  };
}
var Gb = class {
  constructor(e, t = Ha) {
    this.config = e, this.hostClient = si(t);
  }
  buildMessages(e) {
    return Mb(e);
  }
  buildPayload(e, t = j("sillytavern-google", this.config, e.reasoning)) {
    const n = t, o = !0, r = this.buildMessages(e), i = rb(this.config, e, r, o);
    return n.mode === "on" ? (i.reasoning_effort = n.effort, i.include_reasoning = z(n)) : n.mode === "off" ? (i.reasoning_effort = "min", i.include_reasoning = !1) : (i.reasoning_effort = "auto", i.include_reasoning = z(n)), i;
  }
  async inspectRequest(e, t = {}) {
    const n = t.effectiveReasoning || j("sillytavern-google", this.config, e.reasoning), o = t.payload || this.buildPayload(e, n), r = await this.hostClient.buildHostChatCompletionGenerateRequest(o, !0);
    return this.buildRequestInspection(r, e, n);
  }
  buildRequestInspection(e, t = {}, n = j("sillytavern-google", this.config, t.reasoning)) {
    const o = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Ft(e),
      effectiveConfig: St(t, {
        reasoning: n,
        effort: e?.body?.reasoning_effort,
        controlFields: o
      })
    };
  }
  async chat(e) {
    const t = j("sillytavern-google", this.config, e.reasoning), n = this.buildPayload(e, t);
    let o = null;
    const r = (i) => {
      o = this.buildRequestInspection(i, e, t);
    };
    try {
      const i = Ob(e, t, this.config);
      return await this.hostClient.streamHostChatCompletion(n, (s) => i.accept(s), {
        signal: e.signal,
        onRequest: r
      }), {
        ...i.result(),
        requestInspection: o
      };
    } catch (i) {
      throw o && i && typeof i == "object" && (i.requestInspection = o), i;
    }
  }
};
function Bb(e, t, n) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: z(n) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Ni(e, t = [], n = !1) {
  const o = kt(e);
  return {
    thinkTagged: o,
    cleanedText: t.length ? o.cleaned : Dt(o.cleaned, { streaming: n })
  };
}
function qb(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var Hb = class {
  constructor(e, t = Ha) {
    this.config = e, this.hostClient = si(t);
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? Ps(e, this.config.model) : Rs(e, this.config.model);
  }
  buildPayload(e, t = !1, n = j("sillytavern-openai-compatible", this.config, e.reasoning)) {
    const o = n, r = t ? Ps(e, this.config.model) : Rs(e, this.config.model), i = {
      ...e,
      temperature: go({
        ...this.config,
        provider: "sillytavern-openai-compatible"
      }, o) ? void 0 : e.temperature
    };
    return bm(nb(this.config, t ? {
      ...i,
      tools: void 0,
      toolChoice: void 0
    } : i, r, typeof e.onStreamProgress == "function"), o);
  }
  async inspectRequest(e, t = {}) {
    const n = t.effectiveReasoning || j("sillytavern-openai-compatible", this.config, e.reasoning), o = t.payload || this.buildPayload(e, !!t.taggedMode, n), r = await this.hostClient.buildHostChatCompletionGenerateRequest(o, typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(r, e, n);
  }
  buildRequestInspection(e, t = {}, n = j("sillytavern-openai-compatible", this.config, t.reasoning)) {
    const o = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "thinking") ? { thinking: e.body.thinking } : {}
    };
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Ft(e),
      effectiveConfig: {
        ...St(t, {
          reasoning: n,
          effort: e?.body?.reasoning_effort,
          controlFields: o
        }),
        ...e?.body?.tool_choice !== void 0 ? { toolChoice: e.body.tool_choice } : {}
      }
    };
  }
  async streamChat(e, t, n, o = {}) {
    const r = { role: "assistant" };
    let i, s = this.config.model;
    await this.hostClient.streamHostChatCompletion(t, (p) => {
      s = p?.model || s;
      const m = p?.choices?.[0] || {};
      Ms(r, m), m.finish_reason && (i = m.finish_reason);
      const g = sn(r), { thinkTagged: _, cleanedText: y } = Ni(rn(r), g, !0), T = g.length ? g : Is(_.cleaned);
      Bb(e, {
        text: y,
        thoughts: z(n) ? yt(r, m).concat(_.thoughts) : [],
        ...T.length ? { toolCalls: T } : {},
        ...!g.length && T.length ? { toolCallDraft: !0 } : {}
      }, n);
    }, {
      signal: e.signal,
      onRequest: o.onRequest,
      onResponseAccepted: o.onResponseAccepted
    }), an(r);
    const u = sn(r), { thinkTagged: c, cleanedText: d } = Ni(rn(r), u), f = yt(r, {});
    c.thoughts.forEach((p) => f.push(p));
    const h = u.length ? [] : so(e, c.cleaned, r);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: z(n) ? f : [],
      ...Qe("openai", i, !!r.refusal),
      model: s,
      provider: "sillytavern-openai-compatible",
      providerPayload: ao(r),
      ...dn(e, r)
    };
  }
  async nonStreamingChat(e, t, n, o = {}) {
    const r = await this.hostClient.createHostChatCompletion(t, {
      signal: e.signal,
      onRequest: o.onRequest
    }), i = r.choices?.[0] || {}, s = i.message || {};
    an(s);
    const u = yt(s, i), c = La(s.tool_calls || []), { thinkTagged: d, cleanedText: f } = Ni(Ua(s.content), c);
    d.thoughts.forEach((m) => u.push(m));
    const h = c.length ? [] : so(e, d.cleaned, s), p = Dr(s, i);
    return {
      text: f,
      toolCalls: [...c, ...h],
      thoughts: z(n) ? u : [],
      ...Qe("openai", i.finish_reason, !!s.refusal),
      model: r.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: ao(p),
      ...dn(e, s)
    };
  }
  async chat(e) {
    const t = j("sillytavern-openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, o = Array.isArray(e.tools) && e.tools.length > 0, r = async (s, u = {}) => {
      let c = null;
      const d = (f) => {
        c = this.buildRequestInspection(f, e, t);
      };
      try {
        return {
          ...typeof e.onStreamProgress == "function" ? await this.streamChat(e, s, t, {
            onRequest: d,
            onResponseAccepted: u.onResponseAccepted
          }) : await this.nonStreamingChat(e, s, t, { onRequest: d }),
          requestInspection: c
        };
      } catch (f) {
        throw c && f && typeof f == "object" && (f.requestInspection = c), f;
      }
    }, i = this.buildPayload(e, n, t);
    try {
      return await r(i);
    } catch (s) {
      if (e.allowToolProtocolFallback === !1 || n || !o || !qb(s)) throw s;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await r(this.buildPayload(e, !0, t));
  }
};
function xi(e, t, n) {
  return Object.hasOwn(n, "hostClient") ? new e(t, si(n.hostClient)) : new e(t);
}
function lR(e = {}, t = {}) {
  switch (vd(e.reasoning || {}), e.provider) {
    case "sillytavern-openai-compatible":
      return xi(Hb, e, t);
    case "sillytavern-claude":
      return xi(Ib, e, t);
    case "sillytavern-google":
      return xi(Gb, e, t);
    case "openai-responses":
      return new L0(e);
    case "anthropic":
      return new E_(e);
    case "google":
      return new Tw(e);
    default:
      return new E0(e);
  }
}
function Vb(e = {}) {
  const t = String(e?.name || "").trim();
  if (typeof e?.arguments == "string") {
    const n = e.arguments;
    try {
      return JSON.parse(n.trim() || "{}"), n;
    } catch {
      return Am(n, t) || n;
    }
  }
  try {
    return JSON.stringify(e?.arguments || {});
  } catch {
    return "{}";
  }
}
function xs(e = [], t = {}) {
  const n = String(t.fallbackPrefix || "agent-tool").trim() || "agent-tool", o = typeof t.createId == "function" ? t.createId : (r) => `${n}-${Date.now()}-${r + 1}`;
  return (Array.isArray(e) ? e : []).map((r, i) => {
    const s = Object.prototype.hasOwnProperty.call(r || {}, "providerId");
    return {
      id: String(r?.id || o(i) || `${n}-${i + 1}`),
      name: String(r?.name || "").trim(),
      arguments: Vb(r),
      ...s ? { providerId: String(r?.providerId || "") } : {}
    };
  }).filter((r) => r.name);
}
function Jb(e, t = {}) {
  return (Array.isArray(e?.googleContent?.parts) ? e.googleContent.parts : []).filter((n) => n?.functionCall?.name).map((n, o) => {
    const r = String(n.functionCall.id || "").trim();
    return {
      id: r || `${t.fallbackPrefix || "google-tool"}-${o + 1}`,
      name: String(n.functionCall.name || ""),
      arguments: JSON.stringify(n.functionCall.args || {}),
      ...r ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function uR(e = {}, t = {}, n = {}) {
  if (e.completion === "incomplete") for (const r of Array.isArray(e.toolCalls) ? e.toolCalls : []) try {
    const i = typeof r.arguments == "string" ? JSON.parse(r.arguments) : r.arguments;
    if (!i || typeof i != "object" || Array.isArray(i)) throw new TypeError("Expected an argument object");
  } catch (i) {
    const s = new Error("Model tool arguments are incomplete or invalid.", { cause: i });
    throw s.code = "AGENT_TOOL_ARGUMENTS_INVALID", s.toolCallId = r.id, s;
  }
  const o = xs(e?.toolCalls, n);
  return o.length ? o : String(e?.provider || t?.provider || "").toLowerCase() !== "google" ? [] : xs(Jb(e?.providerPayload, n), n);
}
function cR(e = {}, t = [], n = {}) {
  return {
    role: "assistant",
    content: Object.prototype.hasOwnProperty.call(n, "content") ? String(n.content || "") : String(e.text || ""),
    providerPayload: e.providerPayload,
    tool_calls: xs(t, n).map((o) => ({
      id: o.id,
      type: "function",
      ...Object.prototype.hasOwnProperty.call(o, "providerId") ? { providerToolCallId: o.providerId } : {},
      function: {
        name: o.name,
        arguments: o.arguments
      }
    }))
  };
}
function dR(e = {}) {
  const t = String(e.toolName || e.tool_name || "").trim();
  return {
    role: "tool",
    tool_call_id: String(e.toolCallId || e.tool_call_id || ""),
    ...t ? { toolName: t } : {},
    content: String(e.content || "")
  };
}
export {
  tR as AGENT_REQUEST_TIMEOUT_MS,
  mg as PROVIDER_OPTIONS,
  zb as REASONING_MODE_OPTIONS,
  cR as buildProviderAssistantToolCallMessage,
  dR as buildProviderToolResultMessage,
  lR as createAgentAdapter,
  rR as getProviderLabel,
  eR as getReasoningEffortOptions,
  jb as getReasoningModeOptions,
  iR as getToolModeLabel,
  oR as isSillyTavernProvider,
  eg as normalizeAgentConfig,
  Zb as normalizeAgentSettings,
  Ds as normalizeReasoningConfig,
  Ft as redactRequestSecrets,
  sR as resolveActiveProviderConfig,
  qs as resolveReasoningCapability,
  uR as resolveResultToolCalls,
  vr as resolveRuntimeReasoning,
  aR as setHostChatCompletionsRequestHeadersProvider
};
