var Gm = Object.create, od = Object.defineProperty, Bm = Object.getOwnPropertyDescriptor, qm = Object.getOwnPropertyNames, Hm = Object.getPrototypeOf, Vm = Object.prototype.hasOwnProperty, Or = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), Jm = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var r = qm(t), i = 0, s = r.length, u; i < s; i++)
      u = r[i], !Vm.call(e, u) && u !== n && od(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(o = Bm(t, u)) || o.enumerable
      });
  return e;
}, Km = (e, t, n) => (n = e != null ? Gm(Hm(e)) : {}, Jm(t || !e || !e.__esModule ? od(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), rd = "littlewhitebox-server", Jb = `/api/plugins/${rd}`, $s = Object.freeze([{
  id: "tavily",
  label: "Tavily",
  baseUrl: "https://api.tavily.com"
}, {
  id: "exa",
  label: "Exa",
  baseUrl: "https://api.exa.ai"
}]), id = "tavily", Kb = Object.freeze({
  provider: "联网渠道（全局）",
  key: "API Key",
  show: "显示",
  exaBackend: `Exa 官方接口需安装并启用 ${rd}。`
});
function Wm(e) {
  return $s.some((t) => t.id === e) ? e : id;
}
function sd(e = "") {
  return String(e || "").trim();
}
function On(e = "", t = id) {
  return String(e || "").trim().replace(/\/+$/, "") || $s.find((n) => n.id === t).baseUrl;
}
function yr(e = {}, t = {}) {
  return {
    webProvider: Wm(e.webProvider ?? t.webProvider),
    ...Object.fromEntries($s.flatMap(({ id: n }) => [[`${n}ApiKey`, sd(e[`${n}ApiKey`] ?? t[`${n}ApiKey`])], [`${n}BaseUrl`, On(e[`${n}BaseUrl`] ?? t[`${n}BaseUrl`], n)]]))
  };
}
var Wb = Object.freeze([
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
function zm(e = "") {
  return e === "on" || e === "off" ? e : "inherit";
}
function Ym(e) {
  return String(e ?? "").trim().toLowerCase() || void 0;
}
function Xm(e) {
  if (e == null || e === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? Math.floor(t) : void 0;
}
function Ls(e = {}) {
  const t = e && typeof e == "object" ? e : {}, n = Ym(t.effort), o = Xm(t.budgetTokens);
  return {
    mode: zm(t.mode),
    ...n ? { effort: n } : {},
    ...o !== void 0 ? { budgetTokens: o } : {}
  };
}
function z(e = {}) {
  return e?.mode !== "off" && e?.output === "show";
}
var Qm = "agent-core-no-auth";
function ad(e) {
  return String(e ?? "").trim();
}
function Gr(e, t) {
  const n = ad(t);
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
      apiKey: n || Qm,
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
var vr = "x-api-key", zb = Object.freeze([{
  value: vr,
  label: "x-api-key"
}, {
  value: "bearer",
  label: "Bearer"
}]);
function $i(e) {
  return e === "anthropic" || e === "sillytavern-claude";
}
function Zm(e) {
  return e === "bearer" ? e : vr;
}
var ld = "openai-compatible", Us = "默认", ud = "default", jm = "deny", rt = 32e3;
var Yb = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), Xb = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), Li = {
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
    modelListAuth: vr,
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
    modelListAuth: vr,
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
function jt() {
  return JSON.parse(JSON.stringify(Li));
}
function Et() {
  return {
    provider: ld,
    modelConfigs: jt(),
    permissionMode: ud
  };
}
function cd(e = Et()) {
  const t = e && typeof e == "object" ? e : Et();
  return {
    provider: Os(t.provider),
    modelConfigs: Fs(t.modelConfigs || {})
  };
}
function dd(e) {
  return e === "full" ? "full" : ud;
}
function fd(e) {
  return e === "allow" ? "allow" : jm;
}
function Gn(e, t = rt) {
  const n = Number(e);
  if (!Number.isFinite(n) || n <= 0) {
    const o = Number(t);
    return Number.isFinite(o) && o > 0 ? Math.floor(o) : rt;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}
function ut(e) {
  return String(e || "").trim() || "默认";
}
function Fs(e = {}) {
  const t = jt();
  return Object.keys(Li).forEach((n) => {
    const o = e && typeof e[n] == "object" ? e[n] : {}, r = Li[n];
    t[n] = {
      baseUrl: String(o.baseUrl ?? r.baseUrl ?? ""),
      model: String(o.model ?? r.model ?? ""),
      apiKey: ad(o.apiKey ?? r.apiKey),
      ...$i(n) ? { modelListAuth: Zm(o.modelListAuth) } : {},
      temperature: o.temperature ?? r.temperature,
      maxTokens: Gn(o.maxTokens, r.maxTokens),
      sendTemperature: typeof o.sendTemperature == "boolean" ? o.sendTemperature : r.sendTemperature,
      ..."toolMode" in r ? { toolMode: String(o.toolMode || r.toolMode || "native") } : {},
      reasoning: Ls(o.reasoning)
    };
  }), t;
}
function Os(e) {
  return typeof e == "string" && e.trim() ? e : ld;
}
function Gs(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function hd(e = {}, t) {
  const n = {}, o = Gs(e, t);
  return Object.entries(o).forEach(([r, i]) => {
    if (!i || typeof i != "object") return;
    const s = ut(r);
    n[s] = {
      provider: Os(i.provider),
      modelConfigs: Fs(i.modelConfigs || {}),
      permissionMode: dd(i.permissionMode)
    };
  }), Object.keys(n).length || (n[Us] = Et()), n;
}
function pd(e, t) {
  const n = ut(t);
  return e[n] ? n : Object.keys(e)[0];
}
function md(e, t, n) {
  const o = ut(t || n);
  return e[o] ? o : e[n] ? n : Object.keys(e)[0];
}
function Bs(e = {}, t = Et()) {
  const n = cd(t), o = e && typeof e == "object" ? e : {};
  return {
    provider: Os(o.provider || n.provider),
    modelConfigs: Fs(o.modelConfigs || n.modelConfigs)
  };
}
function gd(e = {}, t = {}, n = Us, o = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (o !== n) return !0;
  const r = e?.delegateConfig;
  if (!r || typeof r != "object" || Array.isArray(r) || !(typeof r.provider == "string" && r.provider.trim() || r.modelConfigs && typeof r.modelConfigs == "object" && Object.keys(r.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const i = t[n] || Et(), s = cd(i), u = Bs(r, i);
  return JSON.stringify(u) !== JSON.stringify(s);
}
function eg(e = {}, t, n, o, r) {
  const i = r(e?.[o]);
  if (i) return i;
  const s = Gs(e, t), u = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(s || {})
  ].map(ut), c = /* @__PURE__ */ new Set();
  for (const d of u) {
    if (c.has(d)) continue;
    c.add(d);
    const h = r(s?.[d]?.[o]);
    if (h) return h;
  }
  return r(e?.delegateConfig?.[o]);
}
function tg(e = {}, t, n) {
  const o = (u) => String(u || "").trim();
  if (o(e?.tavilyBaseUrl)) return On(e.tavilyBaseUrl);
  const r = Gs(e, t), i = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(r || {})
  ].map(ut), s = /* @__PURE__ */ new Set();
  for (const u of i) {
    if (s.has(u)) continue;
    s.add(u);
    const c = r?.[u]?.tavilyBaseUrl;
    if (o(c)) return On(c);
  }
  return o(e?.delegateConfig?.tavilyBaseUrl) ? On(e.delegateConfig.tavilyBaseUrl) : On();
}
function _d(e = {}, t, n) {
  return {
    tavilyApiKey: eg(e, t, n, "tavilyApiKey", sd),
    tavilyBaseUrl: tg(e, t, n)
  };
}
function Qb(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: o = (p) => String(p || "") } = t, r = ut(e.currentPresetName || e.presetName || "默认"), i = hd(e, r), s = pd(i, e.currentPresetName), u = md(i, e.delegatePresetName, s), c = i[u] || i[s] || Et(), d = Bs(e.delegateConfig, c), h = gd(e, i, s, u), f = yr(e, _d(e, r, s));
  return {
    workspaceFileName: o(e.workspaceFileName || n),
    jsApiPermission: fd(e.jsApiPermission),
    currentPresetName: s,
    delegatePresetName: u,
    delegateConfig: d,
    delegateConfigured: h,
    presets: i,
    ...f,
    updatedAt: Number(e.updatedAt) || 0,
    configVersion: 1
  };
}
function ng(e = {}) {
  const t = ut(e.currentPresetName || e.presetDraftName || "默认"), n = hd(e, t), o = pd(n, e.currentPresetName), r = md(n, e.delegatePresetName, o), i = n[o] || Et(), s = n[r] || i, u = Bs(e.delegateConfig, s), c = gd(e, n, o, r), d = yr(e, _d(e, t, o));
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    updatedAt: Number(e.updatedAt) || 0,
    jsApiPermission: fd(e.jsApiPermission),
    currentPresetName: o,
    delegatePresetName: r,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: ut(e.presetDraftName || o),
    presetNames: Object.keys(n),
    presets: n,
    provider: i.provider,
    modelConfigs: i.modelConfigs,
    permissionMode: dd(i.permissionMode),
    ...d
  };
}
function og(e = "") {
  return String(e || "").trim().toLowerCase();
}
function Br(e = "") {
  const t = og(e);
  return t.includes("deepseek") ? "deepseek" : t.includes("kimi") || t.includes("moonshot") ? "kimi" : t.includes("gemini") ? "gemini" : t.includes("claude") ? "claude" : /(?:^|[/_.-])gpt(?:\d|[/_.-]|$)/.test(t) || /(?:^|[/_.-])o\d+(?:[/_.-]|$)/.test(t) ? "openai" : "";
}
var rg = Object.freeze({
  minimal: "最小",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "超高",
  max: "最大",
  min: "最小"
});
function yd(e) {
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
  return yd({
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
var qs = yd({
  profileId: "unsupported",
  modes: ["inherit"],
  outputModes: ["hide"],
  intensity: { kind: "none" },
  unsupportedReason: "当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。"
}), go = Object.freeze(["on"]), Hs = Object.freeze([
  "inherit",
  "on",
  "off"
]), vd = Ze("openai-gpt-5.6", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "medium", { temperatureOmitModes: Hs }), ig = Ze("kimi-k3", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "max", { temperatureOmitModes: go }), sg = Ze("deepseek-thinking", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "high", { temperatureOmitModes: go }), ag = Ze("openai-compatible-gemini-latest", [
  "inherit",
  "on",
  "off"
], [
  "minimal",
  "low",
  "medium",
  "high"
], "high", { temperatureOmitModes: go }), lg = Ze("openai-compatible-claude-latest", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: go }), ug = Ze("openai-compatible-default", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high"
], "medium", { temperatureOmitModes: go }), cg = Ze("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: Hs }), dg = Ze("sillytavern-claude-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: Hs }), fg = Ze("google-gemini-3-flash", ["inherit", "on"], [
  "minimal",
  "low",
  "medium",
  "high"
], "high"), hg = Ze("sillytavern-google-3-flash", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high"
], "high");
function pg(e = "") {
  switch (Br(e)) {
    case "deepseek":
      return sg;
    case "kimi":
      return ig;
    case "gemini":
      return ag;
    case "claude":
      return lg;
    case "openai":
      return vd;
    default:
      return ug;
  }
}
function Vs(e = {}) {
  const t = String(e.provider || "").trim(), n = String(e.model || "").trim().toLowerCase();
  switch (t) {
    case "openai-responses":
      return vd;
    case "openai-compatible":
    case "sillytavern-openai-compatible":
      return pg(n);
    case "anthropic":
      return cg;
    case "sillytavern-claude":
      return dg;
    case "google":
      return fg;
    case "sillytavern-google":
      return hg;
    default:
      return qs;
  }
}
function Zb(e = qs) {
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
function jb(e = qs) {
  return e.intensity?.kind !== "effort" ? [] : e.intensity.values.map((t) => ({
    value: t,
    label: rg[t] || t
  }));
}
function ui(e, t, n, o = "REASONING_CAPABILITY_UNSUPPORTED") {
  return {
    ...e,
    profileId: t.profileId,
    valid: !1,
    error: n,
    code: o
  };
}
function mg(e, t) {
  const n = { ...e };
  return delete n.effort, delete n.budgetTokens, t.intensity?.kind === "effort" ? {
    ...n,
    ...e.effort ? { effort: e.effort } : {}
  } : n;
}
function Ar(e = {}, t = {}) {
  const n = Vs(e), o = Ls(t), r = t?.output === "show" || t?.output === "hide" ? t.output : null, i = mg({
    ...o,
    output: o.mode === "off" ? "hide" : r || (n.outputModes.includes("show") ? "show" : "hide")
  }, n);
  if (!n.outputModes.includes(i.output)) return ui(i, n, "当前任务要求返回 Reasoning 内容，但所选模型不支持。");
  if (!n.modes.includes(i.mode)) return ui(i, n, i.mode === "off" ? "当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。" : n.unsupportedReason || "当前模型不支持显式开启 Reasoning。");
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
    } : ui(i, n, `当前模型不支持 Reasoning 强度“${s}”。`, "REASONING_CONFIG_INVALID");
  }
  return {
    ...i,
    profileId: n.profileId,
    valid: !0
  };
}
var gg = class extends Error {
  constructor(e = {}) {
    super(e.error || "当前模型不支持所选 Reasoning 配置。"), this.name = "ReasoningCapabilityError", this.code = e.code || "REASONING_CAPABILITY_UNSUPPORTED", this.profileId = e.profileId || "unsupported", this.reasoning = e;
  }
};
function Ad(e = {}) {
  if (e.valid === !1) throw new gg(e);
  return e;
}
function j(e = "", t = {}, n = {}, o = {}) {
  return Ad(Ar({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model,
    maxTokens: o.maxTokens ?? t.maxTokens
  }, n));
}
function _o(e = {}, t = {}) {
  return Vs(e).temperatureOmitModes.includes(t.mode);
}
var eR = 900 * 1e3, tR = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), _g = Object.freeze([
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
function nR(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function Td(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, o = Number(n);
  return Number.isFinite(o) ? Math.max(0, Math.min(2, o)) : Td(t, 1);
}
function Ui(e = {}) {
  return e.sendTemperature !== !1;
}
function Ka(e = {}) {
  return Ui(e) ? Td(e.temperature, 1) : void 0;
}
function oR(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : _g.find((n) => n.value === e)?.label || e || "未配置";
}
function rR(e = {}) {
  const t = String(e.provider || "").trim();
  return t === "openai-compatible" || t === "sillytavern-openai-compatible" ? e.toolMode === "tagged-json" ? "Tagged JSON 兼容模式" : "原生 Tool Calling" : "Provider 原生工具";
}
function iR(e = {}, t = {}) {
  const n = ng(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const d = n.delegateConfig.provider || "openai-compatible", h = (n.delegateConfig.modelConfigs || jt())[d] || jt()[d] || {}, f = {
      provider: d,
      baseUrl: String(h.baseUrl || ""),
      model: String(h.model || ""),
      maxTokens: Gn(h.maxTokens)
    };
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: d,
      baseUrl: String(h.baseUrl || ""),
      model: String(h.model || ""),
      apiKey: String(h.apiKey || ""),
      ...$i(d) ? { modelListAuth: h.modelListAuth } : {},
      ...yr(n),
      temperature: Ka(h),
      sendTemperature: Ui(h),
      maxTokens: Gn(h.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: h.toolMode || "native",
      reasoning: Ar(f, h.reasoning)
    };
  }
  const o = ut(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), r = n.presets?.[o] ? o : n.presets?.[n.currentPresetName] ? n.currentPresetName : Us, i = n.presets?.[r] || Et(), s = i.provider || n.provider || "openai-compatible", u = (i.modelConfigs || n.modelConfigs || jt())[s] || jt()[s] || {}, c = {
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
    ...$i(s) ? { modelListAuth: u.modelListAuth } : {},
    ...yr(n),
    temperature: Ka(u),
    sendTemperature: Ui(u),
    maxTokens: Gn(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoning: Ar(c, u.reasoning)
  };
}
function D(e, t, n, o, r) {
  if (o === "m") throw new TypeError("Private method is not writable");
  if (o === "a" && !r) throw new TypeError("Private accessor was defined without a setter");
  if (typeof t == "function" ? e !== t || !r : !t.has(e)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return o === "a" ? r.call(e, n) : r ? r.value = n : t.set(e, n), n;
}
function T(e, t, n, o) {
  if (n === "a" && !o) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !o : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? o : n === "a" ? o.call(e) : o ? o.value : t.get(e);
}
var Sd = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Sd = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function lo(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Fi = (e) => {
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
}, be = class Oi extends B {
  constructor(t, n, o, r, i) {
    super(`${Oi.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new qr({
      message: o,
      cause: Fi(n)
    });
    const i = n, s = i?.error?.type;
    return t === 400 ? new Cd(t, i, o, r, s) : t === 401 ? new wd(t, i, o, r, s) : t === 403 ? new Id(t, i, o, r, s) : t === 404 ? new bd(t, i, o, r, s) : t === 409 ? new Rd(t, i, o, r, s) : t === 422 ? new Pd(t, i, o, r, s) : t === 429 ? new Md(t, i, o, r, s) : t >= 500 ? new Nd(t, i, o, r, s) : new Oi(t, i, o, r, s);
  }
}, Ve = class extends be {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, qr = class extends be {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Ed = class extends qr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Cd = class extends be {
}, wd = class extends be {
}, Id = class extends be {
}, bd = class extends be {
}, Rd = class extends be {
}, Pd = class extends be {
}, Md = class extends be {
}, Nd = class extends be {
}, yg = /^[a-z][a-z0-9+.-]*:/i, vg = (e) => yg.test(e), Gi = (e) => (Gi = Array.isArray, Gi(e)), Wa = Gi;
function Bi(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function za(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Ag(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Tg = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new B(`${e} must be an integer`);
  if (t < 0) throw new B(`${e} must be a positive integer`);
  return t;
}, xd = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Sg = (e) => new Promise((t) => setTimeout(t, e)), zt = "0.91.1", Eg = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Cg() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var wg = () => {
  const e = Cg();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": zt,
    "X-Stainless-OS": Xa(Deno.build.os),
    "X-Stainless-Arch": Ya(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": zt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": zt,
    "X-Stainless-OS": Xa(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Ya(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Ig();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": zt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": zt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Ig() {
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
var Ya = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Xa = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Qa, bg = () => Qa ?? (Qa = wg());
function Rg() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function kd(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Dd(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return kd({
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
function Js(e) {
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
async function Pg(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Mg = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Ng(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new B(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function xg(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Za;
function Ks(e) {
  let t;
  return (Za ?? (t = new globalThis.TextEncoder(), Za = t.encode.bind(t)))(e);
}
var ja;
function el(e) {
  let t;
  return (ja ?? (t = new globalThis.TextDecoder(), ja = t.decode.bind(t)))(e);
}
var Se, Ee, yo = class {
  constructor() {
    Se.set(this, void 0), Ee.set(this, void 0), D(this, Se, new Uint8Array(), "f"), D(this, Ee, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Ks(e) : e;
    D(this, Se, xg([T(this, Se, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = kg(T(this, Se, "f"), T(this, Ee, "f"))) != null; ) {
      if (o.carriage && T(this, Ee, "f") == null) {
        D(this, Ee, o.index, "f");
        continue;
      }
      if (T(this, Ee, "f") != null && (o.index !== T(this, Ee, "f") + 1 || o.carriage)) {
        n.push(el(T(this, Se, "f").subarray(0, T(this, Ee, "f") - 1))), D(this, Se, T(this, Se, "f").subarray(T(this, Ee, "f")), "f"), D(this, Ee, null, "f");
        continue;
      }
      const r = T(this, Ee, "f") !== null ? o.preceding - 1 : o.preceding, i = el(T(this, Se, "f").subarray(0, r));
      n.push(i), D(this, Se, T(this, Se, "f").subarray(o.index), "f"), D(this, Ee, null, "f");
    }
    return n;
  }
  flush() {
    return T(this, Se, "f").length ? this.decode(`
`) : [];
  }
};
Se = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new WeakMap();
yo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
yo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function kg(e, t) {
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
function Dg(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var Tr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, tl = (e, t, n) => {
  if (e) {
    if (Ag(Tr, e)) return e;
    he(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Tr))}`);
  }
};
function Bn() {
}
function Mo(e, t, n) {
  return !t || Tr[e] > Tr[n] ? Bn : t[e].bind(t);
}
var $g = {
  error: Bn,
  warn: Bn,
  info: Bn,
  debug: Bn
}, nl = /* @__PURE__ */ new WeakMap();
function he(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return $g;
  const o = nl.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: Mo("error", t, n),
    warn: Mo("warn", t, n),
    info: Mo("info", t, n),
    debug: Mo("debug", t, n)
  };
  return nl.set(t, [n, r]), r;
}
var Mt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), An, uo = class qn {
  constructor(t, n, o) {
    this.iterator = t, An.set(this, void 0), this.controller = n, D(this, An, o, "f");
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? he(o) : console;
    async function* s() {
      if (r) throw new B("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of Lg(t, n)) {
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
            const d = xd(c.data) ?? c.data, h = d?.error?.type;
            throw new be(void 0, d, void 0, t.headers, h);
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
      const u = new yo(), c = Js(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
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
    return [new qn(() => r(t), this.controller, T(this, An, "f")), new qn(() => r(n), this.controller, T(this, An, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return kd({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const s = Ks(JSON.stringify(r) + `
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
async function* Lg(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new B("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new B("Attempted to iterate over a response with no body");
  const n = new Fg(), o = new yo(), r = Js(e.body);
  for await (const i of Ug(r)) for (const s of o.decode(i)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const s = n.decode(i);
    s && (yield s);
  }
}
async function* Ug(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Ks(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = Dg(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Fg = class {
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
    let [t, n, o] = Og(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Og(e, t) {
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
async function $d(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, s = await (async () => {
    if (t.options.stream)
      return he(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : uo.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Ld(await n.json(), n) : await n.text();
  })();
  return he(e).debug(`[${o}] response parsed`, Mt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
function Ld(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var Hn, Ud = class Fd extends Promise {
  constructor(t, n, o = $d) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, Hn.set(this, void 0), D(this, Hn, t, "f");
  }
  _thenUnwrap(t) {
    return new Fd(T(this, Hn, "f"), this.responsePromise, async (n, o) => Ld(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(T(this, Hn, "f"), t))), this.parsedPromise;
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
var No, Od = class {
  constructor(e, t, n, o) {
    No.set(this, void 0), D(this, No, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new B("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await T(this, No, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(No = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Gg = class extends Ud {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await $d(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, vo = class extends Od {
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
          ...Bi(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Bi(this.options.query),
        after_id: e
      }
    } : null;
  }
}, Ae = class extends Od {
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
        ...Bi(this.options.query),
        page: e
      }
    } : null;
  }
}, Gd = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function ln(e, t, n) {
  return Gd(), new File(e, t ?? "unknown_file", n);
}
function rr(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Bd = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Ws = async (e, t, n = !0) => ({
  ...e,
  body: await qg(e.body, t, n)
}), ol = /* @__PURE__ */ new WeakMap();
function Bg(e) {
  const t = typeof e == "function" ? e : e.fetch, n = ol.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return ol.set(t, o), o;
}
var qg = async (e, t, n = !0) => {
  if (!await Bg(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const o = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, i]) => qi(o, r, i, n))), o;
}, Hg = (e) => e instanceof Blob && "name" in e, qi = async (e, t, n, o) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let r = {};
      const i = n.headers.get("Content-Type");
      i && (r = { type: i }), e.append(t, ln([await n.blob()], rr(n, o), r));
    } else if (Bd(n)) e.append(t, ln([await new Response(Dd(n)).blob()], rr(n, o)));
    else if (Hg(n)) e.append(t, ln([n], rr(n, o), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => qi(e, t + "[]", r, o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, i]) => qi(e, `${t}[${r}]`, i, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, qd = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Vg = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && qd(e), Jg = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Kg(e, t, n) {
  if (Gd(), e = await e, t || (t = rr(e, !0)), Vg(e))
    return e instanceof File && t == null && n == null ? e : ln([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (Jg(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), ln(await Hi(r), t, n);
  }
  const o = await Hi(e);
  if (!n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return ln(o, t, n);
}
async function Hi(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (qd(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Bd(e)) for await (const n of e) t.push(...await Hi(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Wg(e)}`);
  }
  return t;
}
function Wg(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Z = class {
  constructor(e) {
    this._client = e;
  }
}, Hd = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* zg(e) {
  if (!e) return;
  if (Hd in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Wa(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = Wa(o[1]) ? o[1] : [o[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [r, null]), yield [r, u]);
  }
}
var R = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, s] of zg(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [Hd]: !0,
    values: t,
    nulls: n
  };
};
function Vd(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var rl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Yg = (e = Vd) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], s = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? rl) ?? rl)?.toString) && (g = m + "", i.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === o.length ? "" : g);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
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
    throw new B(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${s}
${f}`);
  }
  return s;
}, U = /* @__PURE__ */ Yg(Vd), Jd = class extends Z {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/environments/${e}?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", Ae, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, no = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function ir(e) {
  return typeof e == "object" && e !== null && no in e;
}
function Kd(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const o of e) ir(o) && n.add(o[no]);
  if (t) {
    for (const o of t)
      if (ir(o) && n.add(o[no]), Array.isArray(o.content))
        for (const r of o.content) ir(r) && n.add(r[no]);
  }
  return Array.from(n);
}
function Wd(e, t) {
  const n = Kd(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function Xg(e) {
  return ir(e) ? { "x-stainless-helper": e[no] } : {};
}
var zd = class extends Z {
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", vo, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/files/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/files/${e}/content?beta=true`, {
      ...n,
      headers: R([{
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
      headers: R([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/files?beta=true", Ws({
      body: o,
      ...t,
      headers: R([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        Xg(o.file),
        t?.headers
      ])
    }, this._client));
  }
}, Yd = class extends Z {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/models/${e}?beta=true`, {
      ...n,
      headers: R([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", vo, {
      query: o,
      ...t,
      headers: R([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Xd = class extends Z {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/user_profiles?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/user_profiles/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/user_profiles/${e}?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/user_profiles?beta=true", Ae, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  createEnrollmentURL(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/user_profiles/${e}/enrollment_url?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
}, Qd = class extends Z {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/agents/${e}/versions?beta=true`, Ae, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, zs = class extends Z {
  constructor() {
    super(...arguments), this.versions = new Qd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.get(U`/v1/agents/${e}?beta=true`, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/agents/${e}?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", Ae, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
zs.Versions = Qd;
var Zd = class extends Z {
  create(e, t, n) {
    const { view: o, betas: r, ...i } = t;
    return this._client.post(U`/v1/memory_stores/${e}/memories?beta=true`, {
      query: { view: o },
      body: i,
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { memory_store_id: o, betas: r, ...i } = t;
    return this._client.get(U`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: i,
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { memory_store_id: o, view: r, betas: i, ...s } = t;
    return this._client.post(U`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: { view: r },
      body: s,
      ...n,
      headers: R([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/memory_stores/${e}/memories?beta=true`, Ae, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { memory_store_id: o, expected_content_sha256: r, betas: i } = t;
    return this._client.delete(U`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: { expected_content_sha256: r },
      ...n,
      headers: R([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, jd = class extends Z {
  retrieve(e, t, n) {
    const { memory_store_id: o, betas: r, ...i } = t;
    return this._client.get(U`/v1/memory_stores/${o}/memory_versions/${e}?beta=true`, {
      query: i,
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/memory_stores/${e}/memory_versions?beta=true`, Ae, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  redact(e, t, n) {
    const { memory_store_id: o, betas: r } = t;
    return this._client.post(U`/v1/memory_stores/${o}/memory_versions/${e}/redact?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Hr = class extends Z {
  constructor() {
    super(...arguments), this.memories = new Zd(this._client), this.memoryVersions = new jd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/memory_stores?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/memory_stores/${e}?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/memory_stores?beta=true", Ae, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/memory_stores/${e}/archive?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Hr.Memories = Zd;
Hr.MemoryVersions = jd;
var ef = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function tf(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function il(e, t, n) {
  const o = tf(t);
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
  } : nf(e, t, n);
}
function nf(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const s = Qg(t, i.text);
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
function Qg(e, t) {
  const n = tf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new B(`Failed to parse structured output: ${o}`);
  }
}
var Zg = (e) => {
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
}, Yt = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Yt(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Yt(e);
    case "string":
      let o = e[e.length - 2];
      if (o?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Yt(e);
      if (o?.type === "brace" && o.value === "{")
        return e = e.slice(0, e.length - 1), Yt(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Yt(e);
  }
  return e;
}, jg = (e) => {
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
}, e_ = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, of = (e) => JSON.parse(e_(jg(Yt(Zg(e))))), Me, pt, Ht, Tn, xo, Sn, En, ko, Cn, je, wn, Do, $o, bt, Lo, Uo, In, ci, sl, Fo, di, fi, hi, al, ll = "__json_buf";
function ul(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var t_ = class Vi {
  constructor(t, n) {
    Me.add(this), this.messages = [], this.receivedMessages = [], pt.set(this, void 0), Ht.set(this, null), this.controller = new AbortController(), Tn.set(this, void 0), xo.set(this, () => {
    }), Sn.set(this, () => {
    }), En.set(this, void 0), ko.set(this, () => {
    }), Cn.set(this, () => {
    }), je.set(this, {}), wn.set(this, !1), Do.set(this, !1), $o.set(this, !1), bt.set(this, !1), Lo.set(this, void 0), Uo.set(this, void 0), In.set(this, void 0), Fo.set(this, (o) => {
      if (D(this, Do, !0, "f"), lo(o) && (o = new Ve()), o instanceof Ve)
        return D(this, $o, !0, "f"), this._emit("abort", o);
      if (o instanceof B) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new B(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new B(String(o)));
    }), D(this, Tn, new Promise((o, r) => {
      D(this, xo, o, "f"), D(this, Sn, r, "f");
    }), "f"), D(this, En, new Promise((o, r) => {
      D(this, ko, o, "f"), D(this, Cn, r, "f");
    }), "f"), T(this, Tn, "f").catch(() => {
    }), T(this, En, "f").catch(() => {
    }), D(this, Ht, t, "f"), D(this, In, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, Lo, "f");
  }
  get request_id() {
    return T(this, Uo, "f");
  }
  async withResponse() {
    D(this, bt, !0, "f");
    const t = await T(this, Tn, "f");
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
    return D(i, Ht, {
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
    }, T(this, Fo, "f"));
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
      T(this, Me, "m", di).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) T(this, Me, "m", fi).call(this, c);
      if (u.controller.signal?.aborted) throw new Ve();
      T(this, Me, "m", hi).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (D(this, Lo, t, "f"), D(this, Uo, t?.headers.get("request-id"), "f"), T(this, xo, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, wn, "f");
  }
  get errored() {
    return T(this, Do, "f");
  }
  get aborted() {
    return T(this, $o, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (T(this, je, "f")[t] || (T(this, je, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = T(this, je, "f")[t];
    if (!o) return this;
    const r = o.findIndex((i) => i.listener === n);
    return r >= 0 && o.splice(r, 1), this;
  }
  once(t, n) {
    return (T(this, je, "f")[t] || (T(this, je, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      D(this, bt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    D(this, bt, !0, "f"), await T(this, En, "f");
  }
  get currentMessage() {
    return T(this, pt, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, Me, "m", ci).call(this);
  }
  async finalText() {
    return await this.done(), T(this, Me, "m", sl).call(this);
  }
  _emit(t, ...n) {
    if (T(this, wn, "f")) return;
    t === "end" && (D(this, wn, !0, "f"), T(this, ko, "f").call(this));
    const o = T(this, je, "f")[t];
    if (o && (T(this, je, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !T(this, bt, "f") && !o?.length && Promise.reject(r), T(this, Sn, "f").call(this, r), T(this, Cn, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !T(this, bt, "f") && !o?.length && Promise.reject(r), T(this, Sn, "f").call(this, r), T(this, Cn, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, Me, "m", ci).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      T(this, Me, "m", di).call(this), this._connected(null);
      const i = uo.fromReadableStream(t, this.controller);
      for await (const s of i) T(this, Me, "m", fi).call(this, s);
      if (i.controller.signal?.aborted) throw new Ve();
      T(this, Me, "m", hi).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(pt = /* @__PURE__ */ new WeakMap(), Ht = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), xo = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), ko = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), je = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), Do = /* @__PURE__ */ new WeakMap(), $o = /* @__PURE__ */ new WeakMap(), bt = /* @__PURE__ */ new WeakMap(), Lo = /* @__PURE__ */ new WeakMap(), Uo = /* @__PURE__ */ new WeakMap(), In = /* @__PURE__ */ new WeakMap(), Fo = /* @__PURE__ */ new WeakMap(), Me = /* @__PURE__ */ new WeakSet(), ci = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, sl = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new B("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, di = function() {
    this.ended || D(this, pt, void 0, "f");
  }, fi = function(n) {
    if (this.ended) return;
    const o = T(this, Me, "m", al).call(this, n);
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
            ul(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
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
        this._addMessageParam(o), this._addMessage(il(o, T(this, Ht, "f"), { logger: T(this, In, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        D(this, pt, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, hi = function() {
    if (this.ended) throw new B("stream has ended, this shouldn't happen");
    const n = T(this, pt, "f");
    if (!n) throw new B("request ended without sending any chunks");
    return D(this, pt, void 0, "f"), il(n, T(this, Ht, "f"), { logger: T(this, In, "f") });
  }, al = function(n) {
    let o = T(this, pt, "f");
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
            if (r && ul(r)) {
              let i = r[ll] || "";
              i += n.delta.partial_json;
              const s = { ...r };
              if (Object.defineProperty(s, ll, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                s.input = of(i);
              } catch (u) {
                const c = new B(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                T(this, Fo, "f").call(this, c);
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
}, rf = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var n_ = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, bn, Vt, Rt, ne, _e, Te, st, mt, Rn, cl, Ji;
function dl() {
  let e, t;
  return {
    promise: new Promise((n, o) => {
      e = n, t = o;
    }),
    resolve: e,
    reject: t
  };
}
var sf = class {
  constructor(e, t, n) {
    bn.add(this), this.client = e, Vt.set(this, !1), Rt.set(this, !1), ne.set(this, void 0), _e.set(this, void 0), Te.set(this, void 0), st.set(this, void 0), mt.set(this, void 0), Rn.set(this, 0), D(this, ne, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const o = ["BetaToolRunner", ...Kd(t.tools, t.messages)].join(", ");
    D(this, _e, {
      ...n,
      headers: R([{ "x-stainless-helper": o }, n?.headers])
    }, "f"), D(this, mt, dl(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Vt = /* @__PURE__ */ new WeakMap(), Rt = /* @__PURE__ */ new WeakMap(), ne = /* @__PURE__ */ new WeakMap(), _e = /* @__PURE__ */ new WeakMap(), Te = /* @__PURE__ */ new WeakMap(), st = /* @__PURE__ */ new WeakMap(), mt = /* @__PURE__ */ new WeakMap(), Rn = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakSet(), cl = async function() {
    const t = T(this, ne, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (T(this, Te, "f") !== void 0) try {
      const c = await T(this, Te, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const o = t.contextTokenThreshold ?? 1e5;
    if (n < o) return !1;
    const r = t.model ?? T(this, ne, "f").params.model, i = t.summaryPrompt ?? n_, s = T(this, ne, "f").params.messages;
    if (s[s.length - 1].role === "assistant") {
      const c = s[s.length - 1];
      if (Array.isArray(c.content)) {
        const d = c.content.filter((h) => h.type !== "tool_use");
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
      max_tokens: T(this, ne, "f").params.max_tokens
    }, {
      signal: T(this, _e, "f").signal,
      headers: R([T(this, _e, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new B("Expected text response for compaction");
    return T(this, ne, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (T(this, Vt, "f")) throw new B("Cannot iterate over a consumed stream");
    D(this, Vt, !0, "f"), D(this, Rt, !0, "f"), D(this, st, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (T(this, ne, "f").params.max_iterations && T(this, Rn, "f") >= T(this, ne, "f").params.max_iterations) break;
          D(this, Rt, !1, "f"), D(this, st, void 0, "f"), D(this, Rn, (e = T(this, Rn, "f"), e++, e), "f"), D(this, Te, void 0, "f");
          const { max_iterations: n, compactionControl: o, ...r } = T(this, ne, "f").params;
          if (r.stream ? (t = this.client.beta.messages.stream({ ...r }, T(this, _e, "f")), D(this, Te, t.finalMessage(), "f"), T(this, Te, "f").catch(() => {
          }), yield t) : (D(this, Te, this.client.beta.messages.create({
            ...r,
            stream: !1
          }, T(this, _e, "f")), "f"), yield T(this, Te, "f")), !await T(this, bn, "m", cl).call(this)) {
            if (!T(this, Rt, "f")) {
              const { role: s, content: u } = await T(this, Te, "f");
              T(this, ne, "f").params.messages.push({
                role: s,
                content: u
              });
            }
            const i = await T(this, bn, "m", Ji).call(this, T(this, ne, "f").params.messages.at(-1));
            if (i) T(this, ne, "f").params.messages.push(i);
            else if (!T(this, Rt, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!T(this, Te, "f")) throw new B("ToolRunner concluded without a message from the server");
      T(this, mt, "f").resolve(await T(this, Te, "f"));
    } catch (t) {
      throw D(this, Vt, !1, "f"), T(this, mt, "f").promise.catch(() => {
      }), T(this, mt, "f").reject(t), D(this, mt, dl(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? T(this, ne, "f").params = e(T(this, ne, "f").params) : T(this, ne, "f").params = e, D(this, Rt, !0, "f"), D(this, st, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? D(this, _e, e(T(this, _e, "f")), "f") : D(this, _e, {
      ...T(this, _e, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = T(this, _e, "f").signal) {
    const t = await T(this, Te, "f") ?? this.params.messages.at(-1);
    return t ? T(this, bn, "m", Ji).call(this, t, e) : null;
  }
  done() {
    return T(this, mt, "f").promise;
  }
  async runUntilDone() {
    if (!T(this, Vt, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return T(this, ne, "f").params;
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
Ji = async function(t, n = T(this, _e, "f").signal) {
  return T(this, st, "f") !== void 0 ? T(this, st, "f") : (D(this, st, o_(T(this, ne, "f").params, t, {
    ...T(this, _e, "f"),
    signal: n
  }), "f"), T(this, st, "f"));
};
async function o_(e, t = e.messages.at(-1), n) {
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
          content: s instanceof rf ? s.content : `Error: ${s instanceof Error ? s.message : String(s)}`,
          is_error: !0
        };
      }
    }))
  };
}
var af = class lf {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new yo();
    for await (const n of this.iterator) for (const o of t.decode(n)) yield JSON.parse(o);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new B("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new B("Attempted to iterate over a response with no body");
    return new lf(Js(t.body), n);
  }
}, uf = class extends Z {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", vo, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const o = await this.retrieve(e);
    if (!o.results_url) throw new B(`No batch \`results_url\`; Has it finished processing? ${o.processing_status} - ${o.id}`);
    const { betas: r } = t ?? {};
    return this._client.get(o.results_url, {
      ...n,
      headers: R([{
        "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, s) => af.fromResponse(s.response, s.controller));
  }
}, fl = {
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
}, r_ = ["claude-mythos-preview", "claude-opus-4-6"], Ao = class extends Z {
  constructor() {
    super(...arguments), this.batches = new uf(this._client);
  }
  create(e, t) {
    const n = hl(e), { betas: o, ...r } = n;
    r.model in fl && console.warn(`The model '${r.model}' is deprecated and will reach end-of-life on ${fl[r.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), r_.includes(r.model) && r.thinking && r.thinking.type === "enabled" && console.warn(`Using Claude with ${r.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!r.stream && i == null) {
      const u = ef[r.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(r.max_tokens, u);
    }
    const s = Wd(r.tools, r.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: r,
      timeout: i ?? 6e5,
      ...t,
      headers: R([
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
      headers: R([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => nf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return t_.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...o } = hl(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new sf(this._client, e, t);
  }
};
function hl(e) {
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
Ao.Batches = uf;
Ao.BetaToolRunner = sf;
Ao.ToolError = rf;
var cf = class extends Z {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/sessions/${e}/events?beta=true`, Ae, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/sessions/${e}/events?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, df = class extends Z {
  retrieve(e, t, n) {
    const { session_id: o, betas: r } = t;
    return this._client.get(U`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: o, betas: r, ...i } = t;
    return this._client.post(U`/v1/sessions/${o}/resources/${e}?beta=true`, {
      body: i,
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/sessions/${e}/resources?beta=true`, Ae, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: o, betas: r } = t;
    return this._client.delete(U`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/sessions/${e}/resources?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Vr = class extends Z {
  constructor() {
    super(...arguments), this.events = new cf(this._client), this.resources = new df(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/sessions/${e}?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", Ae, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Vr.Events = cf;
Vr.Resources = df;
var ff = class extends Z {
  create(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.post(U`/v1/skills/${e}/versions?beta=true`, Ws({
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o, betas: r } = t;
    return this._client.get(U`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/skills/${e}/versions?beta=true`, Ae, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: o, betas: r } = t;
    return this._client.delete(U`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, Ys = class extends Z {
  constructor() {
    super(...arguments), this.versions = new ff(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Ws({
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", Ae, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
Ys.Versions = ff;
var hf = class extends Z {
  create(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/vaults/${e}/credentials?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.get(U`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: o, betas: r, ...i } = t;
    return this._client.post(U`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      body: i,
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/vaults/${e}/credentials?beta=true`, Ae, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.delete(U`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.post(U`/v1/vaults/${o}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Xs = class extends Z {
  constructor() {
    super(...arguments), this.credentials = new hf(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(U`/v1/vaults/${e}?beta=true`, {
      body: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", Ae, {
      query: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(U`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(U`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Xs.Credentials = hf;
var $e = class extends Z {
  constructor() {
    super(...arguments), this.models = new Yd(this._client), this.messages = new Ao(this._client), this.agents = new zs(this._client), this.environments = new Jd(this._client), this.sessions = new Vr(this._client), this.vaults = new Xs(this._client), this.memoryStores = new Hr(this._client), this.files = new zd(this._client), this.skills = new Ys(this._client), this.userProfiles = new Xd(this._client);
  }
};
$e.Models = Yd;
$e.Messages = Ao;
$e.Agents = zs;
$e.Environments = Jd;
$e.Sessions = Vr;
$e.Vaults = Xs;
$e.MemoryStores = Hr;
$e.Files = zd;
$e.Skills = Ys;
$e.UserProfiles = Xd;
var pf = class extends Z {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/complete", {
      body: o,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: R([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function mf(e) {
  return e?.output_config?.format;
}
function pl(e, t, n) {
  const o = mf(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((r) => r.type === "text" ? Object.defineProperty({ ...r }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : r),
    parsed_output: null
  } : gf(e, t, n);
}
function gf(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const s = i_(t, i.text);
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
function i_(e, t) {
  const n = mf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new B(`Failed to parse structured output: ${o}`);
  }
}
var Ne, gt, Jt, Pn, Oo, Mn, Nn, Go, xn, et, kn, Bo, qo, Pt, Ho, Vo, Dn, pi, ml, mi, gi, _i, yi, gl, _l = "__json_buf";
function yl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var s_ = class Ki {
  constructor(t, n) {
    Ne.add(this), this.messages = [], this.receivedMessages = [], gt.set(this, void 0), Jt.set(this, null), this.controller = new AbortController(), Pn.set(this, void 0), Oo.set(this, () => {
    }), Mn.set(this, () => {
    }), Nn.set(this, void 0), Go.set(this, () => {
    }), xn.set(this, () => {
    }), et.set(this, {}), kn.set(this, !1), Bo.set(this, !1), qo.set(this, !1), Pt.set(this, !1), Ho.set(this, void 0), Vo.set(this, void 0), Dn.set(this, void 0), mi.set(this, (o) => {
      if (D(this, Bo, !0, "f"), lo(o) && (o = new Ve()), o instanceof Ve)
        return D(this, qo, !0, "f"), this._emit("abort", o);
      if (o instanceof B) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new B(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new B(String(o)));
    }), D(this, Pn, new Promise((o, r) => {
      D(this, Oo, o, "f"), D(this, Mn, r, "f");
    }), "f"), D(this, Nn, new Promise((o, r) => {
      D(this, Go, o, "f"), D(this, xn, r, "f");
    }), "f"), T(this, Pn, "f").catch(() => {
    }), T(this, Nn, "f").catch(() => {
    }), D(this, Jt, t, "f"), D(this, Dn, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, Ho, "f");
  }
  get request_id() {
    return T(this, Vo, "f");
  }
  async withResponse() {
    D(this, Pt, !0, "f");
    const t = await T(this, Pn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Ki(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: r } = {}) {
    const i = new Ki(n, { logger: r });
    for (const s of n.messages) i._addMessageParam(s);
    return D(i, Jt, {
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
    }, T(this, mi, "f"));
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
      T(this, Ne, "m", gi).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) T(this, Ne, "m", _i).call(this, c);
      if (u.controller.signal?.aborted) throw new Ve();
      T(this, Ne, "m", yi).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (D(this, Ho, t, "f"), D(this, Vo, t?.headers.get("request-id"), "f"), T(this, Oo, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, kn, "f");
  }
  get errored() {
    return T(this, Bo, "f");
  }
  get aborted() {
    return T(this, qo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (T(this, et, "f")[t] || (T(this, et, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = T(this, et, "f")[t];
    if (!o) return this;
    const r = o.findIndex((i) => i.listener === n);
    return r >= 0 && o.splice(r, 1), this;
  }
  once(t, n) {
    return (T(this, et, "f")[t] || (T(this, et, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      D(this, Pt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    D(this, Pt, !0, "f"), await T(this, Nn, "f");
  }
  get currentMessage() {
    return T(this, gt, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, Ne, "m", pi).call(this);
  }
  async finalText() {
    return await this.done(), T(this, Ne, "m", ml).call(this);
  }
  _emit(t, ...n) {
    if (T(this, kn, "f")) return;
    t === "end" && (D(this, kn, !0, "f"), T(this, Go, "f").call(this));
    const o = T(this, et, "f")[t];
    if (o && (T(this, et, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !T(this, Pt, "f") && !o?.length && Promise.reject(r), T(this, Mn, "f").call(this, r), T(this, xn, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !T(this, Pt, "f") && !o?.length && Promise.reject(r), T(this, Mn, "f").call(this, r), T(this, xn, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, Ne, "m", pi).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      T(this, Ne, "m", gi).call(this), this._connected(null);
      const i = uo.fromReadableStream(t, this.controller);
      for await (const s of i) T(this, Ne, "m", _i).call(this, s);
      if (i.controller.signal?.aborted) throw new Ve();
      T(this, Ne, "m", yi).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(gt = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakMap(), Pn = /* @__PURE__ */ new WeakMap(), Oo = /* @__PURE__ */ new WeakMap(), Mn = /* @__PURE__ */ new WeakMap(), Nn = /* @__PURE__ */ new WeakMap(), Go = /* @__PURE__ */ new WeakMap(), xn = /* @__PURE__ */ new WeakMap(), et = /* @__PURE__ */ new WeakMap(), kn = /* @__PURE__ */ new WeakMap(), Bo = /* @__PURE__ */ new WeakMap(), qo = /* @__PURE__ */ new WeakMap(), Pt = /* @__PURE__ */ new WeakMap(), Ho = /* @__PURE__ */ new WeakMap(), Vo = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap(), mi = /* @__PURE__ */ new WeakMap(), Ne = /* @__PURE__ */ new WeakSet(), pi = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, ml = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new B("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, gi = function() {
    this.ended || D(this, gt, void 0, "f");
  }, _i = function(n) {
    if (this.ended) return;
    const o = T(this, Ne, "m", gl).call(this, n);
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
            yl(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
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
        this._addMessageParam(o), this._addMessage(pl(o, T(this, Jt, "f"), { logger: T(this, Dn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        D(this, gt, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, yi = function() {
    if (this.ended) throw new B("stream has ended, this shouldn't happen");
    const n = T(this, gt, "f");
    if (!n) throw new B("request ended without sending any chunks");
    return D(this, gt, void 0, "f"), pl(n, T(this, Jt, "f"), { logger: T(this, Dn, "f") });
  }, gl = function(n) {
    let o = T(this, gt, "f");
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
            if (r && yl(r)) {
              let i = r[_l] || "";
              i += n.delta.partial_json;
              const s = { ...r };
              Object.defineProperty(s, _l, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (s.input = of(i)), o.content[n.index] = s;
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
}, _f = class extends Z {
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
    return this._client.getAPIList("/v1/messages/batches", vo, {
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
      headers: R([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, r) => af.fromResponse(r.response, r.controller));
  }
}, Qs = class extends Z {
  constructor() {
    super(...arguments), this.batches = new _f(this._client);
  }
  create(e, t) {
    e.model in vl && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${vl[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), a_.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const r = ef[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, r);
    }
    const o = Wd(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: R([o, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => gf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return s_.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
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
  "claude-3-7-sonnet-20250219": "February 19th, 2026",
  "claude-3-5-haiku-latest": "February 19th, 2026",
  "claude-3-5-haiku-20241022": "February 19th, 2026",
  "claude-opus-4-0": "June 15th, 2026",
  "claude-opus-4-20250514": "June 15th, 2026",
  "claude-sonnet-4-0": "June 15th, 2026",
  "claude-sonnet-4-20250514": "June 15th, 2026"
}, a_ = ["claude-mythos-preview", "claude-opus-4-6"];
Qs.Batches = _f;
var yf = class extends Z {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/models/${e}`, {
      ...n,
      headers: R([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models", vo, {
      query: o,
      ...t,
      headers: R([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Jo = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Wi, Zs, sr, vf, l_ = "\\n\\nHuman:", u_ = "\\n\\nAssistant:", ee = class {
  constructor({ baseURL: e = Jo("ANTHROPIC_BASE_URL"), apiKey: t = Jo("ANTHROPIC_API_KEY") ?? null, authToken: n = Jo("ANTHROPIC_AUTH_TOKEN") ?? null, ...o } = {}) {
    Wi.add(this), sr.set(this, void 0);
    const r = {
      apiKey: t,
      authToken: n,
      ...o,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!r.dangerouslyAllowBrowser && Eg()) throw new B(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = r.baseURL, this.timeout = r.timeout ?? Zs.DEFAULT_TIMEOUT, this.logger = r.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = tl(r.logLevel, "ClientOptions.logLevel", this) ?? tl(Jo("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = r.fetchOptions, this.maxRetries = r.maxRetries ?? 2, this.fetch = r.fetch ?? Rg(), D(this, sr, Mg, "f"), this._options = r, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return R([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return R([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return R([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return Ng(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${zt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Sd()}`;
  }
  makeStatusError(e, t, n, o) {
    return be.generate(e, t, n, o);
  }
  buildURL(e, t, n) {
    const o = !T(this, Wi, "m", vf).call(this) && n || this.baseURL, r = vg(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), s = Object.fromEntries(r.searchParams);
    return (!za(i) || !za(s)) && (t = {
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
    return new Ud(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, r = o.maxRetries ?? this.maxRetries;
    t == null && (t = r), await this.prepareOptions(o);
    const { req: i, url: s, timeout: u } = await this.buildRequest(o, { retryCount: r - t });
    await this.prepareRequest(i, {
      url: s,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (he(this).debug(`[${c}] sending request`, Mt({
      retryOfRequestLogID: n,
      method: o.method,
      url: s,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new Ve();
    const f = new AbortController(), p = await this.fetchWithTimeout(s, i, u, f).catch(Fi), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Ve();
      const y = lo(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return he(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - ${_}`), he(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (${_})`, Mt({
          retryOfRequestLogID: n,
          url: s,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(o, t, n ?? c);
      throw he(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - error; no more retries left`), he(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (error; no more retries left)`, Mt({
        retryOfRequestLogID: n,
        url: s,
        durationMs: m - h,
        message: p.message
      })), y ? new Ed() : new qr({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, y]) => ", " + _ + ": " + JSON.stringify(y)).join("")}] ${i.method} ${s} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const P = `retrying, ${t} attempts remaining`;
        return await Pg(p.body), he(this).info(`${g} - ${P}`), he(this).debug(`[${c}] response error (${P})`, Mt({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(o, t, n ?? c, p.headers);
      }
      const y = _ ? "error; no more retries left" : "error; not retryable";
      he(this).info(`${g} - ${y}`);
      const E = await p.text().catch((P) => Fi(P).message), A = xd(E), w = A ? void 0 : E;
      throw he(this).debug(`[${c}] response error (${y})`, Mt({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: w,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, A, w, p.headers);
    }
    return he(this).info(g), he(this).debug(`[${c}] response start`, Mt({
      retryOfRequestLogID: n,
      url: p.url,
      status: p.status,
      headers: p.headers,
      durationMs: m - h
    })), {
      response: p,
      options: o,
      controller: f,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: h
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
    return new Gg(this, n, e);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: r, method: i, ...s } = t || {}, u = this._makeAbort(o);
    r && r.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && s.body instanceof globalThis.ReadableStream || typeof s.body == "object" && s.body !== null && Symbol.asyncIterator in s.body, h = {
      signal: o.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...s
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
    return await Sg(r), this.makeRequest(e, t - 1, n);
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
    "timeout" in n && Tg("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const i = R([
      r,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...bg(),
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
    const n = R([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Dd(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : T(this, sr, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Zs = ee, sr = /* @__PURE__ */ new WeakMap(), Wi = /* @__PURE__ */ new WeakSet(), vf = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
ee.Anthropic = Zs;
ee.HUMAN_PROMPT = l_;
ee.AI_PROMPT = u_;
ee.DEFAULT_TIMEOUT = 6e5;
ee.AnthropicError = B;
ee.APIError = be;
ee.APIConnectionError = qr;
ee.APIConnectionTimeoutError = Ed;
ee.APIUserAbortError = Ve;
ee.NotFoundError = bd;
ee.ConflictError = Rd;
ee.RateLimitError = Md;
ee.BadRequestError = Cd;
ee.AuthenticationError = wd;
ee.InternalServerError = Nd;
ee.PermissionDeniedError = Id;
ee.UnprocessableEntityError = Pd;
ee.toFile = Kg;
var To = class extends ee {
  constructor() {
    super(...arguments), this.completions = new pf(this), this.messages = new Qs(this), this.models = new yf(this), this.beta = new $e(this);
  }
};
To.Completions = pf;
To.Messages = Qs;
To.Models = yf;
To.Beta = $e;
var c_ = {
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
  google: ["STOP"]
};
function at(e, t, n = !1, o = "") {
  if (!n && c_[e]?.includes(t)) return t;
  const r = [
    "length",
    "max_tokens",
    "max_output_tokens",
    "MAX_TOKENS"
  ].includes(t), i = /* @__PURE__ */ new Error(r ? "Model response reached its output limit." : "Model response did not complete normally.");
  throw i.code = r ? "AGENT_RESPONSE_TRUNCATED" : "AGENT_RESPONSE_INCOMPLETE", i.reason = t || "missing_completion", o && (i.partialResponse = {
    text: o,
    finishReason: t,
    truncated: r
  }), i;
}
function Ot(e) {
  if (Array.isArray(e)) return e.map((n) => Ot(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, o]) => {
    t[n] = /^(?:authorization|proxy[-_]?authorization|(?:x[-_])?csrf(?:[-_]?token)?|token|access[-_]?token|refresh[-_]?token|id[-_]?token|api[-_]?key|x[-_](?:goog[-_])?api[-_]?key|proxy[-_]?password|password|client[-_]?secret)$/i.test(n) ? o === "" ? "" : "[redacted]" : Ot(o);
  }), t;
}
function Ct(e = {}, t = {}) {
  const n = t.reasoning && typeof t.reasoning == "object" ? t.reasoning : {}, o = String(e.reasoning?.mode || "inherit"), r = e.reasoning?.output === "show" || e.reasoning?.output === "hide" ? e.reasoning.output : n.output === "show" ? "show" : "hide", i = String(n.mode || t.effectiveMode || o);
  return {
    reasoningRequestedMode: o,
    reasoningRequestedOutput: r,
    reasoningProfileId: String(n.profileId || t.profileId || e.reasoning?.profileId || "unsupported"),
    reasoningEffectiveMode: i,
    reasoningEffort: i === "on" ? String(t.effort ?? n.effort ?? e.reasoning?.effort ?? "") : "",
    reasoningBudgetTokens: i === "on" && Number.isFinite(Number(t.budgetTokens ?? n.budgetTokens ?? e.reasoning?.budgetTokens)) ? Number(t.budgetTokens ?? n.budgetTokens ?? e.reasoning?.budgetTokens) : null,
    reasoningControlFields: Ot(t.controlFields || {}),
    reasoningOutputVisible: i !== "off" && n.output === "show"
  };
}
function co(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: Ot({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    }),
    ...e.effectiveConfig ? { effectiveConfig: e.effectiveConfig } : {}
  };
}
var d_ = Object.freeze({ type: "ephemeral" }), f_ = /* @__PURE__ */ new Set([
  "text",
  "image",
  "tool_use",
  "tool_result"
]), h_ = "[AgentCore][AnthropicUsage]";
function p_(e) {
  e.system ? e.system = [{
    type: "text",
    text: e.system
  }] : delete e.system;
  const t = e.messages.flatMap((n) => n.content).filter((n) => f_.has(n.type) && (n.type !== "text" || n.text.trim())).at(-1);
  for (const n of [
    e.tools?.at(-1),
    e.system?.at(-1),
    t
  ]) n && (n.cache_control = { ...d_ });
}
function m_(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function g_(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function Af(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function __(e) {
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
      const o = g_(n.image_url.url);
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
function y_(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function v_(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && Af(t) || null;
}
function A_(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: Af(e.content) || [] } : void 0;
}
function Al(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function Tl(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: m_(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function T_(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const o = e[n];
    if (o.role !== "system") {
      if (o.role === "assistant") {
        const r = v_(o), i = Tl(o.tool_calls);
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
        const r = [Al(o)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, r.push(Al(e[n]));
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
          }] : [], ...Tl(o.tool_calls)]
        });
        continue;
      }
      t.push({
        role: o.role,
        content: __(o.content)
      });
    }
  }
  return t;
}
function Ko(e, t) {
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
function S_(e = "auto", t = []) {
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
var E_ = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function vi(e = {}, t = {}) {
  const n = Array.isArray(t.tools) ? t.tools : [], o = n.length ? S_(t.toolChoice, n) : void 0, r = t.reasoning?.output, i = {
    ...Ls(t.reasoning),
    ...r === "show" || r === "hide" ? { output: r } : {}
  }, s = Vs({
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
var C_ = class {
  constructor(e) {
    this.config = e, this.auth = Gr("anthropic", e.apiKey), this.client = new To({
      ...this.auth.sdkOptions,
      baseURL: Sl(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = vi(this.config, e)) {
    const n = t.effectiveReasoning, o = (Array.isArray(e.tools) ? e.tools : []).map((s) => ({
      name: s.function.name,
      description: s.function.description,
      input_schema: s.function.parameters
    })), r = y_(e), i = {
      model: this.config.model,
      system: r,
      messages: T_(e.messages),
      ...o.length ? {
        tools: o,
        tool_choice: t.toolChoice
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return Br(this.config.model) === "claude" && p_(i), !_o({
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
    const n = typeof e.onStreamProgress == "function", o = Sl(this.config.baseUrl), r = t.protocol || vi(this.config, e), i = t.body || this.buildRequestBody(e, r), s = r.effectiveReasoning;
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
        effectiveConfig: Ct(e, {
          reasoning: s,
          effort: i.output_config?.effort,
          budgetTokens: i.thinking?.budget_tokens,
          controlFields: {
            ...i.thinking ? { thinking: i.thinking } : {},
            ...i.output_config ? { output_config: i.output_config } : {}
          }
        })
      }),
      ...r.reasoningDisabledForForcedTool ? { notices: [E_] } : {}
    };
  }
  async chat(e) {
    const t = vi(this.config, e), n = t.effectiveReasoning, o = this.buildRequestBody(e, t), r = this.inspectRequest(e, {
      body: o,
      protocol: t
    });
    let i;
    if (typeof e.onStreamProgress == "function") {
      const f = this.client.messages.stream(o, { signal: e.signal }), p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map();
      let g = "";
      const _ = () => z(n) ? Array.from(p.entries()).sort(([A], [w]) => A.localeCompare(w)).map(([A, w]) => ({
        label: A.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: w
      })).filter((A) => A.text) : [], y = () => Array.from(m.entries()).sort(([A], [w]) => Number(A) - Number(w)).map(([, A]) => ({
        id: A.id || "anthropic-tool-draft",
        name: A.name || "工具调用",
        arguments: A.inputJson || "{}",
        draft: !0
      })).filter((A) => A.name), E = () => {
        const A = y();
        A.length && Ko(e, {
          text: g,
          thoughts: _(),
          toolCalls: A,
          toolCallDraft: !0
        });
      };
      f.on("text", (A, w) => {
        g = w || "", Ko(e, {
          text: g,
          thoughts: _(),
          ...y().length ? {
            toolCalls: y(),
            toolCallDraft: !0
          } : {}
        });
      }), f.on("thinking", (A, w) => {
        p.set("thinking:0", w || ""), Ko(e, {
          thoughts: _(),
          ...y().length ? {
            text: g,
            toolCalls: y(),
            toolCallDraft: !0
          } : {}
        });
      }), f.on("streamEvent", (A) => {
        if (A?.type === "content_block_start" && A.content_block?.type === "tool_use") {
          const w = A.content_block.input && typeof A.content_block.input == "object" ? A.content_block.input : {};
          m.set(A.index, {
            id: A.content_block.id || `anthropic-tool-draft-${A.index + 1}`,
            name: A.content_block.name || "工具调用",
            inputJson: Object.keys(w).length ? JSON.stringify(w) : ""
          }), E();
          return;
        }
        if (A?.type === "content_block_delta" && A.delta?.type === "input_json_delta") {
          const w = m.get(A.index) || {
            id: `anthropic-tool-draft-${A.index + 1}`,
            name: "工具调用",
            inputJson: ""
          };
          m.set(A.index, {
            ...w,
            inputJson: `${w.inputJson || ""}${A.delta.partial_json || ""}`
          }), E();
        }
      }), f.on("contentBlock", (A) => {
        A?.type === "redacted_thinking" && (p.set("redacted:0", A.data || ""), Ko(e, {
          thoughts: _(),
          ...y().length ? {
            text: g,
            toolCalls: y(),
            toolCallDraft: !0
          } : {}
        }));
      }), i = await f.finalMessage();
    } else i = await this.client.messages.create(o, { signal: e.signal });
    const s = (i.content || []).filter((f) => f.type === "tool_use" && f.name).map((f, p) => ({
      id: f.id || `anthropic-tool-${p + 1}`,
      name: f.name,
      arguments: JSON.stringify(f.input || {})
    })), u = (i.content || []).filter((f) => f.type === "text").map((f) => f.text || "").join(`
`), c = z(n) ? (i.content || []).filter((f) => f.type === "thinking" || f.type === "redacted_thinking").map((f) => ({
      label: f.type === "thinking" ? "思考块" : "已脱敏思考块",
      text: f.type === "thinking" ? f.thinking || "" : f.data || ""
    })).filter((f) => f.text) : [], d = at("anthropic", i.stop_reason, !1, u), h = i.usage;
    return console.info(h_, {
      messageId: i.id,
      model: i.model || this.config.model,
      usage: h
    }), {
      text: u,
      toolCalls: s,
      thoughts: c,
      finishReason: d,
      usage: h,
      model: i.model || this.config.model,
      provider: "anthropic",
      providerPayload: A_(i),
      requestInspection: r
    };
  }
}, w_ = /* @__PURE__ */ Or(((e, t) => {
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
})), I_ = /* @__PURE__ */ Or(((e) => {
  var t = w_();
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
      n[u] = function(h) {
        var f = e.operation(o), p = Array.prototype.slice.call(arguments, 1), m = p.pop();
        p.push(function(g) {
          f.retry(g) || (g && (arguments[0] = f.mainError()), m.apply(this, arguments));
        }), f.attempt(function() {
          h.apply(n, p);
        });
      }.bind(n, c), n[u].options = o;
    }
  };
})), b_ = /* @__PURE__ */ Or(((e, t) => {
  t.exports = I_();
})), R_ = /* @__PURE__ */ Or(((e, t) => {
  var n = b_(), o = [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "The Internet connection appears to be offline.",
    "Network request failed"
  ], r = class extends Error {
    constructor(c) {
      super(), c instanceof Error ? (this.originalError = c, { message: c } = c) : (this.originalError = new Error(c), this.originalError.stack = this.stack), this.name = "AbortError", this.message = c;
    }
  }, i = (c, d, h) => {
    const f = h.retries - (d - 1);
    return c.attemptNumber = d, c.retriesLeft = f, c;
  }, s = (c) => o.includes(c), u = (c, d) => new Promise((h, f) => {
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
        if (g instanceof r)
          p.stop(), f(g.originalError);
        else if (g instanceof TypeError && !s(g.message))
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
  t.exports = u, t.exports.default = u, t.exports.AbortError = r;
})), El = /* @__PURE__ */ Km(R_(), 1), P_ = void 0, M_ = void 0;
function N_() {
  return {
    geminiUrl: P_,
    vertexUrl: M_
  };
}
function x_(e, t, n, o) {
  var r, i;
  if (!e?.baseUrl) {
    const s = N_();
    return t ? (r = s.vertexUrl) !== null && r !== void 0 ? r : n : (i = s.geminiUrl) !== null && i !== void 0 ? i : o;
  }
  return e.baseUrl;
}
var dt = class {
};
function x(e, t) {
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
          const h = c[d];
          l(h, t.slice(i + 1), n[d]);
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
function k_(e, t) {
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
    zi(e, r, i, 0, s);
  }
}
function zi(e, t, n, o, r) {
  if (o >= t.length || typeof e != "object" || e === null) return;
  const i = t[o];
  if (i.endsWith("[]")) {
    const s = i.slice(0, -2), u = e;
    if (s in u && Array.isArray(u[s])) for (const c of u[s]) zi(c, t, n, o + 1, r);
  } else if (i === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const s = e, u = Object.keys(s).filter((d) => !d.startsWith("_") && !r.has(d)), c = {};
      for (const d of u) c[d] = s[d];
      for (const [d, h] of Object.entries(c)) {
        const f = [];
        for (const p of n.slice(o)) p === "*" ? f.push(d) : f.push(p);
        l(s, f, h);
      }
      for (const d of u) delete s[d];
    }
  } else {
    const s = e;
    i in s && zi(s[i], t, n, o + 1, r);
  }
}
function js(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function D_(e) {
  const t = {}, n = a(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const o = a(e, ["resourceName"]);
  return o != null && l(t, ["_url", "resourceName"], o), t;
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
  const s = a(e, ["response", "generateVideoResponse"]);
  return s != null && l(t, ["response"], U_(s)), t;
}
function L_(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], F_(s)), t;
}
function U_(e) {
  const t = {}, n = a(e, ["generatedSamples"]);
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
  const t = {}, n = a(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => G_(s))), l(t, ["generatedVideos"], i);
  }
  const o = a(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const r = a(e, ["raiMediaFilteredReasons"]);
  return r != null && l(t, ["raiMediaFilteredReasons"], r), t;
}
function O_(e) {
  const t = {}, n = a(e, ["video"]);
  return n != null && l(t, ["video"], K_(n)), t;
}
function G_(e) {
  const t = {}, n = a(e, ["_self"]);
  return n != null && l(t, ["video"], W_(n)), t;
}
function B_(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function q_(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function H_(e) {
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
function Tf(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], J_(s)), t;
}
function J_(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = a(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function K_(e) {
  const t = {}, n = a(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const o = a(e, ["encodedVideo"]);
  o != null && l(t, ["videoBytes"], js(o));
  const r = a(e, ["encoding"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function W_(e) {
  const t = {}, n = a(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const o = a(e, ["bytesBase64Encoded"]);
  o != null && l(t, ["videoBytes"], js(o));
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
var Cl;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(Cl || (Cl = {}));
var wl;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(wl || (wl = {}));
var Il;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(Il || (Il = {}));
var Tt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(Tt || (Tt = {}));
var bl;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(bl || (bl = {}));
var Rl;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(Rl || (Rl = {}));
var Pl;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(Pl || (Pl = {}));
var Ml;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(Ml || (Ml = {}));
var Nl;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(Nl || (Nl = {}));
var xl;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(xl || (xl = {}));
var kl;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(kl || (kl = {}));
var en;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(en || (en = {}));
var tn;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(tn || (tn = {}));
var Dl;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(Dl || (Dl = {}));
var $l;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})($l || ($l = {}));
var Ll;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Ll || (Ll = {}));
var Ul;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Fl || (Fl = {}));
var Ol;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Ol || (Ol = {}));
var Gl;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Gl || (Gl = {}));
var Bl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Bl || (Bl = {}));
var ql;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(ql || (ql = {}));
var Hl;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Hl || (Hl = {}));
var Vl;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Vl || (Vl = {}));
var Sr;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(Sr || (Sr = {}));
var Jl;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Jl || (Jl = {}));
var Kl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(Kl || (Kl = {}));
var Wl;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Wl || (Wl = {}));
var zl;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(zl || (zl = {}));
var Yi;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(Yi || (Yi = {}));
var Yl;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(Xl || (Xl = {}));
var Ql;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(Ql || (Ql = {}));
var Zl;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Zl || (Zl = {}));
var jl;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(jl || (jl = {}));
var eu;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(eu || (eu = {}));
var tu;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(tu || (tu = {}));
var Xi;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(Xi || (Xi = {}));
var nu;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(nu || (nu = {}));
var ou;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(ou || (ou = {}));
var Er;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(Er || (Er = {}));
var ru;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(ru || (ru = {}));
var iu;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(iu || (iu = {}));
var su;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(su || (su = {}));
var au;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(au || (au = {}));
var lu;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(lu || (lu = {}));
var uu;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(uu || (uu = {}));
var cu;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(cu || (cu = {}));
var du;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(du || (du = {}));
var fu;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(fu || (fu = {}));
var hu;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(hu || (hu = {}));
var pu;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(pu || (pu = {}));
var mu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(mu || (mu = {}));
var gu;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(gu || (gu = {}));
var _u;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(_u || (_u = {}));
var yu;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(yu || (yu = {}));
var vu;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(vu || (vu = {}));
var Au;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(Au || (Au = {}));
var Tu;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(Tu || (Tu = {}));
var Su;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(Su || (Su = {}));
var Eu;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(Eu || (Eu = {}));
var Cu;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(Cu || (Cu = {}));
var wu;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(wu || (wu = {}));
var Iu;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(Iu || (Iu = {}));
var nn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(nn || (nn = {}));
var Qi = class {
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
    const h = [];
    for (const f of (u = (s = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) !== null && u !== void 0 ? u : []) {
      for (const [p, m] of Object.entries(f)) p !== "text" && p !== "thought" && p !== "thoughtSignature" && (m !== null || m !== void 0) && h.push(p);
      if (typeof f.text == "string") {
        if (typeof f.thought == "boolean" && f.thought) continue;
        d = !0, c += f.text;
      }
    }
    return h.length > 0 && console.warn(`there are non-text parts ${h} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, o, r, i, s, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const h of (u = (s = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) !== null && u !== void 0 ? u : []) {
      for (const [f, p] of Object.entries(h)) f !== "inlineData" && (p !== null || p !== void 0) && d.push(f);
      h.inlineData && typeof h.inlineData.data == "string" && (c += atob(h.inlineData.data));
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
    const d = (u = (s = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.executableCode).map((h) => h.executableCode).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, o, r, i, s, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (s = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || s === void 0 ? void 0 : s.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.codeExecutionResult).map((h) => h.codeExecutionResult).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, bu = class {
}, Ru = class {
}, z_ = class {
}, Y_ = class {
}, X_ = class {
}, Q_ = class {
}, Pu = class {
}, Mu = class {
}, Nu = class {
}, Z_ = class {
}, xu = class Sf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Sf();
    let r;
    const i = t;
    return n ? r = L_(i) : r = $_(i), Object.assign(o, r), o;
  }
}, ku = class {
}, Du = class {
}, $u = class {
}, Lu = class {
}, j_ = class {
}, ey = class {
}, ty = class {
}, ny = class Ef {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Ef(), r = H_(t);
    return Object.assign(o, r), o;
  }
}, oy = class {
}, ry = class {
}, iy = class {
}, sy = class {
}, Uu = class {
}, ay = class {
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
}, ly = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, uy = class Cf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Cf(), r = Tf(t);
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
function wf(e, t) {
  const n = K(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function If(e) {
  return Array.isArray(e) ? e.map((t) => Cr(t)) : [Cr(e)];
}
function Cr(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function bf(e) {
  const t = Cr(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Rf(e) {
  const t = Cr(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Fu(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function Pf(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Fu(t)) : [Fu(e)];
}
function Zi(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Ou(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Gu(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function se(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return Zi(e) ? e : {
    role: "user",
    parts: Pf(e)
  };
}
function ea(e, t) {
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
    if (Ou(e) || Gu(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [se(e)];
  }
  const t = [], n = [], o = Zi(e[0]);
  for (const r of e) {
    const i = Zi(r);
    if (i != o) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(r);
    else {
      if (Ou(r) || Gu(r)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(r);
    }
  }
  return o || t.push({
    role: "user",
    parts: Pf(n)
  }), t;
}
function cy(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((o) => o !== "null");
  if (n.length === 1) t.type = Object.values(Tt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : Tt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const o of n) t.anyOf.push({ type: Object.values(Tt).includes(o.toUpperCase()) ? o.toUpperCase() : Tt.TYPE_UNSPECIFIED });
  }
}
function un(e) {
  const t = {}, n = ["items"], o = ["anyOf"], r = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && cy(e.type, t);
  for (const [s, u] of Object.entries(e))
    if (u != null)
      if (s == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(Tt).includes(u.toUpperCase()) ? u.toUpperCase() : Tt.TYPE_UNSPECIFIED;
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
        for (const [d, h] of Object.entries(u)) c[d] = un(h);
        t[s] = c;
      } else {
        if (s === "additionalProperties") continue;
        t[s] = u;
      }
  return t;
}
function ta(e) {
  return un(e);
}
function na(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function oa(e) {
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
function dy(e, t, n, o = 1) {
  const r = !t.startsWith(`${n}/`) && t.split("/").length === o;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : r ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : r ? `${n}/${t}` : t;
}
function ft(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return dy(e, t, "cachedContents");
}
function Mf(e) {
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
  return js(e);
}
function fy(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function hy(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function py(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function Nf(e) {
  var t;
  let n;
  if (fy(e) && (n = e.name), !(py(e) && (n = e.uri, n === void 0)) && !(hy(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const o = n.split("files/")[1].match(/[a-z0-9]+/);
      if (o === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = o[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function xf(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function kf(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (my(e, t)) return e[t];
  return [];
}
function my(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function gy(e, t = {}) {
  const n = e, o = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (o.responseJsonSchema = n.outputSchema), t.behavior && (o.behavior = t.behavior), { functionDeclarations: [o] };
}
function _y(e, t = {}) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = r.name;
    if (o.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    o.add(i);
    const s = gy(r, t);
    s.functionDeclarations && n.push(...s.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function Df(e, t) {
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
function yy(e) {
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
function $f(e) {
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
function Lf(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function vy(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function Ay(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Ty(e) {
  const t = {}, n = a(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const o = a(e, ["inlinedResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => tv(s))), l(t, ["inlinedResponses"], i);
  }
  const r = a(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function Sy(e) {
  const t = {}, n = a(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const o = a(e, ["gcsDestination", "outputUriPrefix"]);
  o != null && l(t, ["gcsUri"], o);
  const r = a(e, ["bigqueryDestination", "outputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function Ey(e) {
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
function ar(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata", "displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = a(e, ["metadata", "state"]);
  r != null && l(t, ["state"], Lf(r));
  const i = a(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const s = a(e, ["metadata", "endTime"]);
  s != null && l(t, ["endTime"], s);
  const u = a(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = a(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = a(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], Ty($f(d))), t;
}
function ji(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = a(e, ["state"]);
  r != null && l(t, ["state"], Lf(r));
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
  const h = a(e, ["model"]);
  h != null && l(t, ["model"], h);
  const f = a(e, ["inputConfig"]);
  f != null && l(t, ["src"], Cy(f));
  const p = a(e, ["outputConfig"]);
  p != null && l(t, ["dest"], Sy($f(p)));
  const m = a(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function Cy(e) {
  const t = {}, n = a(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const o = a(e, ["gcsSource", "uris"]);
  o != null && l(t, ["gcsUri"], o);
  const r = a(e, ["bigquerySource", "inputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function wy(e, t) {
  const n = {};
  if (a(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (a(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (a(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = a(t, ["fileName"]);
  o != null && l(n, ["fileName"], o);
  const r = a(t, ["inlinedRequests"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => ev(e, s))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function Iy(e) {
  const t = {}, n = a(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const o = a(e, ["gcsUri"]);
  o != null && l(t, ["gcsSource", "uris"], o);
  const r = a(e, ["bigqueryUri"]);
  if (r != null && l(t, ["bigquerySource", "inputUri"], r), a(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function by(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Ry(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], gn(e, o)), n;
}
function Py(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], gn(e, o)), n;
}
function My(e) {
  const t = {}, n = a(e, ["content"]);
  n != null && l(t, ["content"], n);
  const o = a(e, ["citationMetadata"]);
  o != null && l(t, ["citationMetadata"], Ny(o));
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
  const h = a(e, ["safetyRatings"]);
  if (h != null) {
    let p = h;
    Array.isArray(p) && (p = p.map((m) => m)), l(t, ["safetyRatings"], p);
  }
  const f = a(e, ["urlContextMetadata"]);
  return f != null && l(t, ["urlContextMetadata"], f), t;
}
function Ny(e) {
  const t = {}, n = a(e, ["citationSources"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["citations"], o);
  }
  return t;
}
function Uf(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => lv(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function xy(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  if (t !== void 0 && o != null && l(t, ["batch", "displayName"], o), a(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const r = a(e, ["webhookConfig"]);
  return t !== void 0 && r != null && l(t, ["batch", "webhookConfig"], r), n;
}
function ky(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const r = a(e, ["dest"]);
  if (t !== void 0 && r != null && l(t, ["outputConfig"], Ey(yy(r))), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Bu(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["_url", "model"], K(e, o));
  const r = a(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], wy(e, Df(e, r)));
  const i = a(t, ["config"]);
  return i != null && xy(i, n), n;
}
function Dy(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["model"], K(e, o));
  const r = a(t, ["src"]);
  r != null && l(n, ["inputConfig"], Iy(Df(e, r)));
  const i = a(t, ["config"]);
  return i != null && ky(i, n), n;
}
function $y(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["batch", "displayName"], o), n;
}
function Ly(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["_url", "model"], K(e, o));
  const r = a(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], Hy(e, r));
  const i = a(t, ["config"]);
  return i != null && $y(i, n), n;
}
function Uy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], gn(e, o)), n;
}
function Fy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], gn(e, o)), n;
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
function Gy(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function By(e, t) {
  const n = {}, o = a(t, ["contents"]);
  if (o != null) {
    let i = ea(e, o);
    Array.isArray(i) && (i = i.map((s) => s)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const r = a(t, ["config"]);
  return r != null && (l(n, ["_self"], qy(r, n)), k_(n, { "requests[].*": "requests[].request.*" })), n;
}
function qy(e, t) {
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
function Hy(e, t) {
  const n = {}, o = a(t, ["fileName"]);
  o != null && l(n, ["file_name"], o);
  const r = a(t, ["inlinedRequests"]);
  return r != null && l(n, ["requests"], By(e, r)), n;
}
function Vy(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Jy(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Ky(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = a(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Wy(e, t, n) {
  const o = {}, r = a(t, ["systemInstruction"]);
  n !== void 0 && r != null && l(n, ["systemInstruction"], Uf(se(r)));
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
  const h = a(t, ["stopSequences"]);
  h != null && l(o, ["stopSequences"], h);
  const f = a(t, ["responseLogprobs"]);
  f != null && l(o, ["responseLogprobs"], f);
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
  const E = a(t, ["responseSchema"]);
  E != null && l(o, ["responseSchema"], ta(E));
  const A = a(t, ["responseJsonSchema"]);
  if (A != null && l(o, ["responseJsonSchema"], A), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const w = a(t, ["safetySettings"]);
  if (n !== void 0 && w != null) {
    let V = w;
    Array.isArray(V) && (V = V.map((W) => uv(W))), l(n, ["safetySettings"], V);
  }
  const P = a(t, ["tools"]);
  if (n !== void 0 && P != null) {
    let V = mn(P);
    Array.isArray(V) && (V = V.map((W) => dv(pn(W)))), l(n, ["tools"], V);
  }
  const L = a(t, ["toolConfig"]);
  if (n !== void 0 && L != null && l(n, ["toolConfig"], cv(L)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const C = a(t, ["cachedContent"]);
  n !== void 0 && C != null && l(n, ["cachedContent"], ft(e, C));
  const k = a(t, ["responseModalities"]);
  k != null && l(o, ["responseModalities"], k);
  const I = a(t, ["mediaResolution"]);
  I != null && l(o, ["mediaResolution"], I);
  const N = a(t, ["speechConfig"]);
  if (N != null && l(o, ["speechConfig"], na(N)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const b = a(t, ["thinkingConfig"]);
  b != null && l(o, ["thinkingConfig"], b);
  const F = a(t, ["imageConfig"]);
  F != null && l(o, ["imageConfig"], jy(F));
  const X = a(t, ["enableEnhancedCivicAnswers"]);
  if (X != null && l(o, ["enableEnhancedCivicAnswers"], X), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const J = a(t, ["serviceTier"]);
  return n !== void 0 && J != null && l(n, ["serviceTier"], J), o;
}
function zy(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((h) => My(h))), l(t, ["candidates"], d);
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
function Yy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], gn(e, o)), n;
}
function Xy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], gn(e, o)), n;
}
function Qy(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Ay(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Zy(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function jy(e) {
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
function ev(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["request", "model"], K(e, o));
  const r = a(t, ["contents"]);
  if (r != null) {
    let u = ve(r);
    Array.isArray(u) && (u = u.map((c) => Uf(c))), l(n, ["request", "contents"], u);
  }
  const i = a(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const s = a(t, ["config"]);
  return s != null && l(n, ["request", "generationConfig"], Wy(e, s, a(n, ["request"], {}))), n;
}
function tv(e) {
  const t = {}, n = a(e, ["response"]);
  n != null && l(t, ["response"], zy(n));
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["error"]);
  return r != null && l(t, ["error"], r), t;
}
function nv(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  if (t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), a(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function ov(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  t !== void 0 && r != null && l(t, ["_query", "pageToken"], r);
  const i = a(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function rv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && nv(n, t), t;
}
function iv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && ov(n, t), t;
}
function sv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = a(e, ["operations"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => ar(s))), l(t, ["batchJobs"], i);
  }
  return t;
}
function av(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = a(e, ["batchPredictionJobs"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => ji(s))), l(t, ["batchJobs"], i);
  }
  return t;
}
function lv(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], Vy(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], Jy(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], by(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = a(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = a(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function uv(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = a(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function cv(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = a(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], Ky(o));
  const r = a(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function dv(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], Zy(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Qy(i));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = a(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
var ct;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(ct || (ct = {}));
var Bt = class {
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
}, fv = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Bt(ct.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Bu(this.apiClient, e), n = t._url, o = x("{model}:batchGenerateContent", n), r = t.batch.inputConfig.requests, i = r.requests, s = [];
    for (const u of i) {
      const c = Object.assign({}, u);
      if (c.systemInstruction) {
        const d = c.systemInstruction;
        delete c.systemInstruction;
        const h = c.request;
        h.systemInstruction = d, c.request = h;
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
      const c = Dy(this.apiClient, e);
      return s = x("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ji(d));
    } else {
      const c = Bu(this.apiClient, e);
      return s = x("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => ar(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = Ly(this.apiClient, e);
      return r = x("{model}:asyncBatchEmbedContent", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => ar(u));
    }
  }
  async get(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Xy(this.apiClient, e);
      return s = x("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ji(d));
    } else {
      const c = Yy(this.apiClient, e);
      return s = x("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => ar(d));
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const u = Py(this.apiClient, e);
      i = x("batchPredictionJobs/{name}:cancel", u._url), s = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = Ry(this.apiClient, e);
      i = x("batches/{name}:cancel", u._url), s = u._query, delete u._url, delete u._query, await this.apiClient.request({
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
      const c = iv(e);
      return s = x("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = av(d), f = new Uu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = rv(e);
      return s = x("batches", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = sv(d), f = new Uu();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Fy(this.apiClient, e);
      return s = x("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Gy(d));
    } else {
      const c = Uy(this.apiClient, e);
      return s = x("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Oy(d));
    }
  }
};
function hv(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function pv(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
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
function Hu(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Fv(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
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
    Array.isArray(h) && (h = h.map((f) => qu(f))), l(t, ["contents"], h);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], qu(se(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => Bv(f))), l(t, ["tools"], h);
  }
  const d = a(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], Ov(d)), a(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function gv(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  t !== void 0 && r != null && l(t, ["expireTime"], r);
  const i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let f = ve(s);
    Array.isArray(f) && (f = f.map((p) => Hu(p))), l(t, ["contents"], f);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Hu(se(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => qv(p))), l(t, ["tools"], f);
  }
  const d = a(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], Gv(d));
  const h = a(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function _v(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["model"], wf(e, o));
  const r = a(t, ["config"]);
  return r != null && mv(r, n), n;
}
function yv(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["model"], wf(e, o));
  const r = a(t, ["config"]);
  return r != null && gv(r, n), n;
}
function vv(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ft(e, o)), n;
}
function Av(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ft(e, o)), n;
}
function Tv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Sv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Ev(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Cv(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function wv(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = a(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Iv(e) {
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
function bv(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ft(e, o)), n;
}
function Rv(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ft(e, o)), n;
}
function Pv(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], hv(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Mv(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Nv(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function xv(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function kv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && Nv(n, t), t;
}
function Dv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && xv(n, t), t;
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
function Uv(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], Ev(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], Cv(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], pv(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = a(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = a(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function Fv(e) {
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
  const h = a(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = a(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function Ov(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = a(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], wv(o));
  const r = a(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function Gv(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = a(e, ["functionCallingConfig"]);
  if (o != null && l(t, ["functionCallingConfig"], o), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function Bv(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], Mv(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Pv(i));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = a(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function qv(e) {
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
    Array.isArray(p) && (p = p.map((m) => Iv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = a(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = a(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function Hv(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function Vv(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function Jv(e, t) {
  const n = {}, o = a(t, ["name"]);
  o != null && l(n, ["_url", "name"], ft(e, o));
  const r = a(t, ["config"]);
  return r != null && Hv(r, n), n;
}
function Kv(e, t) {
  const n = {}, o = a(t, ["name"]);
  o != null && l(n, ["_url", "name"], ft(e, o));
  const r = a(t, ["config"]);
  return r != null && Vv(r, n), n;
}
var Wv = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Bt(ct.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = yv(this.apiClient, e);
      return s = x("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = _v(this.apiClient, e);
      return s = x("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = Rv(this.apiClient, e);
      return s = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = bv(this.apiClient, e);
      return s = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = Av(this.apiClient, e);
      return s = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Sv(d), f = new $u();
        return Object.assign(f, h), f;
      });
    } else {
      const c = vv(this.apiClient, e);
      return s = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Tv(d), f = new $u();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Kv(this.apiClient, e);
      return s = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Jv(this.apiClient, e);
      return s = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const c = Dv(e);
      return s = x("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Lv(d), f = new Lu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = kv(e);
      return s = x("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = $v(d), f = new Lu();
        return Object.assign(f, h), f;
      });
    }
  }
};
function St(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++) t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
function Vu(e) {
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
function Je(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var o = n.apply(e, t || []), r, i = [];
  return r = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), u("next"), u("throw"), u("return", s), r[Symbol.asyncIterator] = function() {
    return this;
  }, r;
  function s(m) {
    return function(g) {
      return Promise.resolve(g).then(m, f);
    };
  }
  function u(m, g) {
    o[m] && (r[m] = function(_) {
      return new Promise(function(y, E) {
        i.push([
          m,
          _,
          y,
          E
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
    m.value instanceof q ? Promise.resolve(m.value.v).then(h, f) : p(i[0][2], m);
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
function Ke(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Vu == "function" ? Vu(e) : e[Symbol.iterator](), n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
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
function zv(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : Ff(n);
}
function Ff(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function Yv(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Ju(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let o = 0;
  for (; o < n; ) if (e[o].role === "user")
    t.push(e[o]), o++;
  else {
    const r = [];
    let i = !0;
    for (; o < n && e[o].role === "model"; )
      r.push(e[o]), i && !Ff(e[o]) && (i = !1), o++;
    i ? t.push(...r) : t.pop();
  }
  return t;
}
var Xv = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new Qv(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, Qv = class {
  constructor(e, t, n, o = {}, r = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = o, this.history = r, this.sendPromise = Promise.resolve(), Yv(r);
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
      const u = await o, c = (i = (r = u.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content, d = u.automaticFunctionCallingHistory, h = this.getHistory(!0).length;
      let f = [];
      d != null && (f = (s = d.slice(h)) !== null && s !== void 0 ? s : []);
      const p = c ? [c] : [];
      this.recordHistory(n, p, f);
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
    const t = e ? Ju(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return Je(this, arguments, function* () {
      var o, r, i, s, u, c;
      const d = [];
      try {
        for (var h = !0, f = Ke(e), p; p = yield q(f.next()), o = p.done, !o; h = !0) {
          s = p.value, h = !1;
          const m = s;
          if (zv(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield q(m);
        }
      } catch (m) {
        r = { error: m };
      } finally {
        try {
          !h && !o && (i = f.return) && (yield q(i.call(f)));
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
    }), n && n.length > 0 ? this.history.push(...Ju(n)) : this.history.push(e), this.history.push(...o);
  }
}, Of = class Gf extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Gf.prototype);
  }
};
function Zv(e) {
  const t = {}, n = a(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function jv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function eA(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Nf(n)), t;
}
function tA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function nA(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Nf(n)), t;
}
function oA(e) {
  const t = {}, n = a(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function rA(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function iA(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && rA(n, t), t;
}
function sA(e) {
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
function aA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["files"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(t, ["files"], r);
  }
  return t;
}
var lA = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Bt(ct.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const s = iA(e);
      return r = x("files", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
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
        const c = sA(u), d = new oy();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = Zv(e);
      return r = x("upload/v1beta/files", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = jv(u), d = new ry();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = nA(e);
      return r = x("files/{file}", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
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
      const s = eA(e);
      return r = x("files/{file}", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
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
        const c = tA(u), d = new iy();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = oA(e);
      return r = x("files:register", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = aA(u), d = new sy();
        return Object.assign(d, c), d;
      });
    }
  }
};
function Ku(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function uA(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function lr(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
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
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => RA(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function fA(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function hA(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function pA(e) {
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
function mA(e) {
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
  const h = a(e, ["mediaResolution"]);
  h != null && l(t, ["mediaResolution"], h);
  const f = a(e, ["presencePenalty"]);
  f != null && l(t, ["presencePenalty"], f);
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
  const E = a(e, ["seed"]);
  E != null && l(t, ["seed"], E);
  const A = a(e, ["speechConfig"]);
  A != null && l(t, ["speechConfig"], A);
  const w = a(e, ["stopSequences"]);
  w != null && l(t, ["stopSequences"], w);
  const P = a(e, ["temperature"]);
  P != null && l(t, ["temperature"], P);
  const L = a(e, ["thinkingConfig"]);
  L != null && l(t, ["thinkingConfig"], L);
  const C = a(e, ["topK"]);
  C != null && l(t, ["topK"], C);
  const k = a(e, ["topP"]);
  if (k != null && l(t, ["topP"], k), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function gA(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], uA(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function _A(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function yA(e, t) {
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
  const h = a(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = a(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], oa(f));
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
    let I = mn(_);
    Array.isArray(I) && (I = I.map((N) => NA(pn(N)))), l(t, ["setup", "tools"], I);
  }
  const y = a(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], MA(y));
  const E = a(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], Ku(E));
  const A = a(e, ["outputAudioTranscription"]);
  t !== void 0 && A != null && l(t, ["setup", "outputAudioTranscription"], Ku(A));
  const w = a(e, ["realtimeInputConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "realtimeInputConfig"], w);
  const P = a(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const L = a(e, ["proactivity"]);
  if (t !== void 0 && L != null && l(t, ["setup", "proactivity"], L), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const C = a(e, ["avatarConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "avatarConfig"], C);
  const k = a(e, ["safetySettings"]);
  if (t !== void 0 && k != null) {
    let I = k;
    Array.isArray(I) && (I = I.map((N) => PA(N))), l(t, ["setup", "safetySettings"], I);
  }
  return n;
}
function vA(e, t) {
  const n = {}, o = a(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], mA(o));
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
  const h = a(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = a(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], oa(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], dA(se(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let N = mn(_);
    Array.isArray(N) && (N = N.map((b) => xA(pn(b)))), l(t, ["setup", "tools"], N);
  }
  const y = a(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], y);
  const E = a(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], E);
  const A = a(e, ["outputAudioTranscription"]);
  t !== void 0 && A != null && l(t, ["setup", "outputAudioTranscription"], A);
  const w = a(e, ["realtimeInputConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "realtimeInputConfig"], w);
  const P = a(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const L = a(e, ["proactivity"]);
  t !== void 0 && L != null && l(t, ["setup", "proactivity"], L);
  const C = a(e, ["explicitVadSignal"]);
  t !== void 0 && C != null && l(t, ["setup", "explicitVadSignal"], C);
  const k = a(e, ["avatarConfig"]);
  t !== void 0 && k != null && l(t, ["setup", "avatarConfig"], k);
  const I = a(e, ["safetySettings"]);
  if (t !== void 0 && I != null) {
    let N = I;
    Array.isArray(N) && (N = N.map((b) => b)), l(t, ["setup", "safetySettings"], N);
  }
  return n;
}
function AA(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["setup", "model"], K(e, o));
  const r = a(t, ["config"]);
  return r != null && l(n, ["config"], yA(r, n)), n;
}
function TA(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["setup", "model"], K(e, o));
  const r = a(t, ["config"]);
  return r != null && l(n, ["config"], vA(r, n)), n;
}
function SA(e) {
  const t = {}, n = a(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function EA(e) {
  const t = {}, n = a(e, ["weightedPrompts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["weightedPrompts"], o);
  }
  return t;
}
function CA(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = If(n);
    Array.isArray(d) && (d = d.map((h) => lr(h))), l(t, ["mediaChunks"], d);
  }
  const o = a(e, ["audio"]);
  o != null && l(t, ["audio"], lr(Rf(o)));
  const r = a(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = a(e, ["video"]);
  i != null && l(t, ["video"], lr(bf(i)));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function wA(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = If(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const o = a(e, ["audio"]);
  o != null && l(t, ["audio"], Rf(o));
  const r = a(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = a(e, ["video"]);
  i != null && l(t, ["video"], bf(i));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function IA(e) {
  const t = {}, n = a(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const o = a(e, ["serverContent"]);
  o != null && l(t, ["serverContent"], o);
  const r = a(e, ["toolCall"]);
  r != null && l(t, ["toolCall"], r);
  const i = a(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const s = a(e, ["usageMetadata"]);
  s != null && l(t, ["usageMetadata"], kA(s));
  const u = a(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = a(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = a(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = a(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], DA(h)), t;
}
function bA(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], fA(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], hA(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], lr(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = a(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = a(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function RA(e) {
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
  const h = a(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = a(e, ["videoMetadata"]);
  if (p != null && l(t, ["videoMetadata"], p), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return t;
}
function PA(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = a(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function MA(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function NA(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], _A(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], gA(i));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = a(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function xA(e) {
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
    Array.isArray(p) && (p = p.map((m) => pA(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = a(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = a(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function kA(e) {
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
  const h = a(e, ["candidatesTokensDetails"]);
  if (h != null) {
    let m = h;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["responseTokensDetails"], m);
  }
  const f = a(e, ["toolUsePromptTokensDetails"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(t, ["toolUsePromptTokensDetails"], m);
  }
  const p = a(e, ["trafficType"]);
  return p != null && l(t, ["trafficType"], p), t;
}
function DA(e) {
  const t = {}, n = a(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function $A(e, t) {
  const n = {}, o = a(e, ["apiKey"]);
  if (o != null && l(n, ["apiKey"], o), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function LA(e, t) {
  const n = {}, o = a(e, ["data"]);
  if (o != null && l(n, ["data"], o), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function UA(e, t) {
  const n = {}, o = a(e, ["content"]);
  o != null && l(n, ["content"], o);
  const r = a(e, ["citationMetadata"]);
  r != null && l(n, ["citationMetadata"], FA(r));
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
  const h = a(e, ["logprobsResult"]);
  h != null && l(n, ["logprobsResult"], h);
  const f = a(e, ["safetyRatings"]);
  if (f != null) {
    let m = f;
    Array.isArray(m) && (m = m.map((g) => g)), l(n, ["safetyRatings"], m);
  }
  const p = a(e, ["urlContextMetadata"]);
  return p != null && l(n, ["urlContextMetadata"], p), n;
}
function FA(e, t) {
  const n = {}, o = a(e, ["citationSources"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(n, ["citations"], r);
  }
  return n;
}
function OA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let s = ve(i);
    Array.isArray(s) && (s = s.map((u) => _n(u))), l(o, ["contents"], s);
  }
  return o;
}
function GA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["tokensInfo"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function BA(e, t) {
  const n = {}, o = a(e, ["values"]);
  o != null && l(n, ["values"], o);
  const r = a(e, ["statistics"]);
  return r != null && l(n, ["statistics"], qA(r)), n;
}
function qA(e, t) {
  const n = {}, o = a(e, ["truncated"]);
  o != null && l(n, ["truncated"], o);
  const r = a(e, ["token_count"]);
  return r != null && l(n, ["tokenCount"], r), n;
}
function So(e, t) {
  const n = {}, o = a(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => QT(s))), l(n, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function _n(e, t) {
  const n = {}, o = a(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => ZT(s))), l(n, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function HA(e, t) {
  const n = {}, o = a(e, ["controlType"]);
  o != null && l(n, ["controlType"], o);
  const r = a(e, ["enableControlImageComputation"]);
  return r != null && l(n, ["computeControl"], r), n;
}
function VA(e, t) {
  const n = {};
  if (a(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (a(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (a(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function JA(e, t, n) {
  const o = {}, r = a(e, ["systemInstruction"]);
  t !== void 0 && r != null && l(t, ["systemInstruction"], _n(se(r)));
  const i = a(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => Vf(c))), l(t, ["tools"], u);
  }
  const s = a(e, ["generationConfig"]);
  return t !== void 0 && s != null && l(t, ["generationConfig"], LT(s)), o;
}
function KA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = ve(i);
    Array.isArray(u) && (u = u.map((c) => So(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && VA(s), o;
}
function WA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = ve(i);
    Array.isArray(u) && (u = u.map((c) => _n(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && JA(s, o), o;
}
function zA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["totalTokens"]);
  r != null && l(n, ["totalTokens"], r);
  const i = a(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function YA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["totalTokens"]);
  return r != null && l(n, ["totalTokens"], r), n;
}
function XA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], K(e, r)), o;
}
function QA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], K(e, r)), o;
}
function ZA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function jA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function eT(e, t, n) {
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
  const h = a(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && l(t, ["parameters", "safetySetting"], h);
  const f = a(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
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
  const E = a(e, ["addWatermark"]);
  t !== void 0 && E != null && l(t, ["parameters", "addWatermark"], E);
  const A = a(e, ["labels"]);
  t !== void 0 && A != null && l(t, ["labels"], A);
  const w = a(e, ["editMode"]);
  t !== void 0 && w != null && l(t, ["parameters", "editMode"], w);
  const P = a(e, ["baseSteps"]);
  return t !== void 0 && P != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], P), o;
}
function tT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["referenceImages"]);
  if (s != null) {
    let c = s;
    Array.isArray(c) && (c = c.map((d) => rS(d))), l(o, ["instances[0]", "referenceImages"], c);
  }
  const u = a(t, ["config"]);
  return u != null && eT(u, o), o;
}
function nT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => Jr(s))), l(n, ["generatedImages"], i);
  }
  return n;
}
function oT(e, t, n) {
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
function rT(e, t, n) {
  const o = {};
  let r = a(n, ["embeddingApiType"]);
  if (r === void 0 && (r = "PREDICT"), r === "PREDICT") {
    const f = a(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "task_type"], f);
  } else if (r === "EMBED_CONTENT") {
    const f = a(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "taskType"], f);
  }
  let i = a(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const f = a(e, ["title"]);
    t !== void 0 && f != null && l(t, ["instances[]", "title"], f);
  } else if (i === "EMBED_CONTENT") {
    const f = a(e, ["title"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "title"], f);
  }
  let s = a(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "PREDICT") {
    const f = a(e, ["outputDimensionality"]);
    t !== void 0 && f != null && l(t, ["parameters", "outputDimensionality"], f);
  } else if (s === "EMBED_CONTENT") {
    const f = a(e, ["outputDimensionality"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "outputDimensionality"], f);
  }
  let u = a(n, ["embeddingApiType"]);
  if (u === void 0 && (u = "PREDICT"), u === "PREDICT") {
    const f = a(e, ["mimeType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "mimeType"], f);
  }
  let c = a(n, ["embeddingApiType"]);
  if (c === void 0 && (c = "PREDICT"), c === "PREDICT") {
    const f = a(e, ["autoTruncate"]);
    t !== void 0 && f != null && l(t, ["parameters", "autoTruncate"], f);
  } else if (c === "EMBED_CONTENT") {
    const f = a(e, ["autoTruncate"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "autoTruncate"], f);
  }
  let d = a(n, ["embeddingApiType"]);
  if (d === void 0 && (d = "PREDICT"), d === "EMBED_CONTENT") {
    const f = a(e, ["documentOcr"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "documentOcr"], f);
  }
  let h = a(n, ["embeddingApiType"]);
  if (h === void 0 && (h = "PREDICT"), h === "EMBED_CONTENT") {
    const f = a(e, ["audioTrackExtraction"]);
    t !== void 0 && f != null && l(t, ["embedContentConfig", "audioTrackExtraction"], f);
  }
  return o;
}
function iT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let d = ea(e, i);
    Array.isArray(d) && (d = d.map((h) => h)), l(o, ["requests[]", "content"], d);
  }
  const s = a(t, ["content"]);
  s != null && So(se(s));
  const u = a(t, ["config"]);
  u != null && oT(u, o);
  const c = a(t, ["model"]);
  return c !== void 0 && l(o, ["requests[]", "model"], K(e, c)), o;
}
function sT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  let i = a(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = a(t, ["contents"]);
    if (c != null) {
      let d = ea(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(o, ["instances[]", "content"], d);
    }
  }
  let s = a(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "EMBED_CONTENT") {
    const c = a(t, ["content"]);
    c != null && l(o, ["content"], _n(se(c)));
  }
  const u = a(t, ["config"]);
  return u != null && rT(u, o, n), o;
}
function aT(e, t) {
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
function lT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions[]", "embeddings"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => BA(u))), l(n, ["embeddings"], s);
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
function uT(e, t) {
  const n = {}, o = a(e, ["endpoint"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["deployedModelId"]);
  return r != null && l(n, ["deployedModelId"], r), n;
}
function cT(e, t) {
  const n = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["fileUri"]);
  o != null && l(n, ["fileUri"], o);
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function dT(e, t) {
  const n = {}, o = a(e, ["id"]);
  o != null && l(n, ["id"], o);
  const r = a(e, ["args"]);
  r != null && l(n, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(n, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function fT(e, t) {
  const n = {}, o = a(e, ["allowedFunctionNames"]);
  o != null && l(n, ["allowedFunctionNames"], o);
  const r = a(e, ["mode"]);
  if (r != null && l(n, ["mode"], r), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function hT(e, t) {
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
function pT(e, t, n, o) {
  const r = {}, i = a(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], So(se(i)));
  const s = a(t, ["temperature"]);
  s != null && l(r, ["temperature"], s);
  const u = a(t, ["topP"]);
  u != null && l(r, ["topP"], u);
  const c = a(t, ["topK"]);
  c != null && l(r, ["topK"], c);
  const d = a(t, ["candidateCount"]);
  d != null && l(r, ["candidateCount"], d);
  const h = a(t, ["maxOutputTokens"]);
  h != null && l(r, ["maxOutputTokens"], h);
  const f = a(t, ["stopSequences"]);
  f != null && l(r, ["stopSequences"], f);
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
  const E = a(t, ["responseMimeType"]);
  E != null && l(r, ["responseMimeType"], E);
  const A = a(t, ["responseSchema"]);
  A != null && l(r, ["responseSchema"], ta(A));
  const w = a(t, ["responseJsonSchema"]);
  if (w != null && l(r, ["responseJsonSchema"], w), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = a(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let W = P;
    Array.isArray(W) && (W = W.map((ge) => iS(ge))), l(n, ["safetySettings"], W);
  }
  const L = a(t, ["tools"]);
  if (n !== void 0 && L != null) {
    let W = mn(L);
    Array.isArray(W) && (W = W.map((ge) => hS(pn(ge)))), l(n, ["tools"], W);
  }
  const C = a(t, ["toolConfig"]);
  if (n !== void 0 && C != null && l(n, ["toolConfig"], dS(C)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const k = a(t, ["cachedContent"]);
  n !== void 0 && k != null && l(n, ["cachedContent"], ft(e, k));
  const I = a(t, ["responseModalities"]);
  I != null && l(r, ["responseModalities"], I);
  const N = a(t, ["mediaResolution"]);
  N != null && l(r, ["mediaResolution"], N);
  const b = a(t, ["speechConfig"]);
  if (b != null && l(r, ["speechConfig"], na(b)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const F = a(t, ["thinkingConfig"]);
  F != null && l(r, ["thinkingConfig"], F);
  const X = a(t, ["imageConfig"]);
  X != null && l(r, ["imageConfig"], BT(X));
  const J = a(t, ["enableEnhancedCivicAnswers"]);
  if (J != null && l(r, ["enableEnhancedCivicAnswers"], J), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const V = a(t, ["serviceTier"]);
  return n !== void 0 && V != null && l(n, ["serviceTier"], V), r;
}
function mT(e, t, n, o) {
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
  const h = a(t, ["maxOutputTokens"]);
  h != null && l(r, ["maxOutputTokens"], h);
  const f = a(t, ["stopSequences"]);
  f != null && l(r, ["stopSequences"], f);
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
  const E = a(t, ["responseMimeType"]);
  E != null && l(r, ["responseMimeType"], E);
  const A = a(t, ["responseSchema"]);
  A != null && l(r, ["responseSchema"], ta(A));
  const w = a(t, ["responseJsonSchema"]);
  w != null && l(r, ["responseJsonSchema"], w);
  const P = a(t, ["routingConfig"]);
  P != null && l(r, ["routingConfig"], P);
  const L = a(t, ["modelSelectionConfig"]);
  L != null && l(r, ["modelConfig"], L);
  const C = a(t, ["safetySettings"]);
  if (n !== void 0 && C != null) {
    let Fe = C;
    Array.isArray(Fe) && (Fe = Fe.map((li) => li)), l(n, ["safetySettings"], Fe);
  }
  const k = a(t, ["tools"]);
  if (n !== void 0 && k != null) {
    let Fe = mn(k);
    Array.isArray(Fe) && (Fe = Fe.map((li) => Vf(pn(li)))), l(n, ["tools"], Fe);
  }
  const I = a(t, ["toolConfig"]);
  n !== void 0 && I != null && l(n, ["toolConfig"], fS(I));
  const N = a(t, ["labels"]);
  n !== void 0 && N != null && l(n, ["labels"], N);
  const b = a(t, ["cachedContent"]);
  n !== void 0 && b != null && l(n, ["cachedContent"], ft(e, b));
  const F = a(t, ["responseModalities"]);
  F != null && l(r, ["responseModalities"], F);
  const X = a(t, ["mediaResolution"]);
  X != null && l(r, ["mediaResolution"], X);
  const J = a(t, ["speechConfig"]);
  J != null && l(r, ["speechConfig"], na(J));
  const V = a(t, ["audioTimestamp"]);
  V != null && l(r, ["audioTimestamp"], V);
  const W = a(t, ["thinkingConfig"]);
  W != null && l(r, ["thinkingConfig"], W);
  const ge = a(t, ["imageConfig"]);
  if (ge != null && l(r, ["imageConfig"], qT(ge)), a(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const ze = a(t, ["modelArmorConfig"]);
  n !== void 0 && ze != null && l(n, ["modelArmorConfig"], ze);
  const Ue = a(t, ["serviceTier"]);
  return n !== void 0 && Ue != null && l(n, ["serviceTier"], Ue), r;
}
function Wu(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = ve(i);
    Array.isArray(u) && (u = u.map((c) => So(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(o, ["generationConfig"], pT(e, s, o)), o;
}
function zu(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = ve(i);
    Array.isArray(u) && (u = u.map((c) => _n(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(o, ["generationConfig"], mT(e, s, o)), o;
}
function Yu(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["candidates"]);
  if (r != null) {
    let h = r;
    Array.isArray(h) && (h = h.map((f) => UA(f))), l(n, ["candidates"], h);
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
function Xu(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["candidates"]);
  if (r != null) {
    let h = r;
    Array.isArray(h) && (h = h.map((f) => f)), l(n, ["candidates"], h);
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
function gT(e, t, n) {
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
  const h = a(e, ["includeRaiReason"]);
  t !== void 0 && h != null && l(t, ["parameters", "includeRaiReason"], h);
  const f = a(e, ["language"]);
  t !== void 0 && f != null && l(t, ["parameters", "language"], f);
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
function _T(e, t, n) {
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
  const h = a(e, ["safetyFilterLevel"]);
  t !== void 0 && h != null && l(t, ["parameters", "safetySetting"], h);
  const f = a(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
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
  const E = a(e, ["addWatermark"]);
  t !== void 0 && E != null && l(t, ["parameters", "addWatermark"], E);
  const A = a(e, ["labels"]);
  t !== void 0 && A != null && l(t, ["labels"], A);
  const w = a(e, ["imageSize"]);
  t !== void 0 && w != null && l(t, ["parameters", "sampleImageSize"], w);
  const P = a(e, ["enhancePrompt"]);
  return t !== void 0 && P != null && l(t, ["parameters", "enhancePrompt"], P), o;
}
function yT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["config"]);
  return s != null && gT(s, o), o;
}
function vT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["config"]);
  return s != null && _T(s, o), o;
}
function AT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => xT(u))), l(n, ["generatedImages"], s);
  }
  const i = a(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], qf(i)), n;
}
function TT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => Jr(u))), l(n, ["generatedImages"], s);
  }
  const i = a(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Hf(i)), n;
}
function ST(e, t, n) {
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
  const h = a(e, ["enhancePrompt"]);
  if (t !== void 0 && h != null && l(t, ["parameters", "enhancePrompt"], h), a(e, ["generateAudio"]) !== void 0) throw new Error("generateAudio parameter is not supported in Gemini API.");
  const f = a(e, ["lastFrame"]);
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Kr(f));
  const p = a(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => IS(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (a(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (a(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (a(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = a(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), o;
}
function ET(e, t, n) {
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
  const h = a(e, ["resolution"]);
  t !== void 0 && h != null && l(t, ["parameters", "resolution"], h);
  const f = a(e, ["personGeneration"]);
  t !== void 0 && f != null && l(t, ["parameters", "personGeneration"], f);
  const p = a(e, ["pubsubTopic"]);
  t !== void 0 && p != null && l(t, ["parameters", "pubsubTopic"], p);
  const m = a(e, ["negativePrompt"]);
  t !== void 0 && m != null && l(t, ["parameters", "negativePrompt"], m);
  const g = a(e, ["enhancePrompt"]);
  t !== void 0 && g != null && l(t, ["parameters", "enhancePrompt"], g);
  const _ = a(e, ["generateAudio"]);
  t !== void 0 && _ != null && l(t, ["parameters", "generateAudio"], _);
  const y = a(e, ["lastFrame"]);
  t !== void 0 && y != null && l(t, ["instances[0]", "lastFrame"], We(y));
  const E = a(e, ["referenceImages"]);
  if (t !== void 0 && E != null) {
    let L = E;
    Array.isArray(L) && (L = L.map((C) => bS(C))), l(t, ["instances[0]", "referenceImages"], L);
  }
  const A = a(e, ["mask"]);
  t !== void 0 && A != null && l(t, ["instances[0]", "mask"], wS(A));
  const w = a(e, ["compressionQuality"]);
  t !== void 0 && w != null && l(t, ["parameters", "compressionQuality"], w);
  const P = a(e, ["labels"]);
  if (t !== void 0 && P != null && l(t, ["labels"], P), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return o;
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
  const u = a(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], RT(u)), n;
}
function wT(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(n, ["done"], i);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response"]);
  return u != null && l(n, ["response"], PT(u)), n;
}
function IT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["image"]);
  s != null && l(o, ["instances[0]", "image"], Kr(s));
  const u = a(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], Jf(u));
  const c = a(t, ["source"]);
  c != null && MT(c, o);
  const d = a(t, ["config"]);
  return d != null && ST(d, o), o;
}
function bT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["image"]);
  s != null && l(o, ["instances[0]", "image"], We(s));
  const u = a(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], Kf(u));
  const c = a(t, ["source"]);
  c != null && NT(c, o);
  const d = a(t, ["config"]);
  return d != null && ET(d, o), o;
}
function RT(e, t) {
  const n = {}, o = a(e, ["generatedSamples"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => DT(u))), l(n, ["generatedVideos"], s);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function PT(e, t) {
  const n = {}, o = a(e, ["videos"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => $T(u))), l(n, ["generatedVideos"], s);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function MT(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Kr(i));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], Jf(s)), o;
}
function NT(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], We(i));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], Kf(s)), o;
}
function xT(e, t) {
  const n = {}, o = a(e, ["_self"]);
  o != null && l(n, ["image"], HT(o));
  const r = a(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = a(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], qf(i)), n;
}
function Jr(e, t) {
  const n = {}, o = a(e, ["_self"]);
  o != null && l(n, ["image"], Bf(o));
  const r = a(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = a(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], Hf(i));
  const s = a(e, ["prompt"]);
  return s != null && l(n, ["enhancedPrompt"], s), n;
}
function kT(e, t) {
  const n = {}, o = a(e, ["_self"]);
  o != null && l(n, ["mask"], Bf(o));
  const r = a(e, ["labels"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(n, ["labels"], i);
  }
  return n;
}
function DT(e, t) {
  const n = {}, o = a(e, ["video"]);
  return o != null && l(n, ["video"], ES(o)), n;
}
function $T(e, t) {
  const n = {}, o = a(e, ["_self"]);
  return o != null && l(n, ["video"], CS(o)), n;
}
function LT(e, t) {
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
  const h = a(e, ["maxOutputTokens"]);
  h != null && l(n, ["maxOutputTokens"], h);
  const f = a(e, ["mediaResolution"]);
  f != null && l(n, ["mediaResolution"], f);
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
  const E = a(e, ["routingConfig"]);
  E != null && l(n, ["routingConfig"], E);
  const A = a(e, ["seed"]);
  A != null && l(n, ["seed"], A);
  const w = a(e, ["speechConfig"]);
  w != null && l(n, ["speechConfig"], w);
  const P = a(e, ["stopSequences"]);
  P != null && l(n, ["stopSequences"], P);
  const L = a(e, ["temperature"]);
  L != null && l(n, ["temperature"], L);
  const C = a(e, ["thinkingConfig"]);
  C != null && l(n, ["thinkingConfig"], C);
  const k = a(e, ["topK"]);
  k != null && l(n, ["topK"], k);
  const I = a(e, ["topP"]);
  if (I != null && l(n, ["topP"], I), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function UT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], K(e, r)), o;
}
function FT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], K(e, r)), o;
}
function OT(e, t) {
  const n = {}, o = a(e, ["authConfig"]);
  o != null && l(n, ["authConfig"], $A(o));
  const r = a(e, ["enableWidget"]);
  return r != null && l(n, ["enableWidget"], r), n;
}
function GT(e, t) {
  const n = {}, o = a(e, ["searchTypes"]);
  if (o != null && l(n, ["searchTypes"], o), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(n, ["timeRangeFilter"], r), n;
}
function BT(e, t) {
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
function qT(e, t) {
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
function HT(e, t) {
  const n = {}, o = a(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], It(o));
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function Bf(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = a(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], It(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Kr(e, t) {
  const n = {};
  if (a(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const o = a(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], It(o));
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function We(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = a(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], It(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function VT(e, t, n, o) {
  const r = {}, i = a(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], xf(e, c)), r;
}
function JT(e, t, n, o) {
  const r = {}, i = a(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], xf(e, c)), r;
}
function KT(e, t, n) {
  const o = {}, r = a(t, ["config"]);
  return r != null && VT(e, r, o), o;
}
function WT(e, t, n) {
  const o = {}, r = a(t, ["config"]);
  return r != null && JT(e, r, o), o;
}
function zT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["_self"]);
  if (i != null) {
    let s = kf(i);
    Array.isArray(s) && (s = s.map((u) => es(u))), l(n, ["models"], s);
  }
  return n;
}
function YT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["_self"]);
  if (i != null) {
    let s = kf(i);
    Array.isArray(s) && (s = s.map((u) => ts(u))), l(n, ["models"], s);
  }
  return n;
}
function XT(e, t) {
  const n = {}, o = a(e, ["maskMode"]);
  o != null && l(n, ["maskMode"], o);
  const r = a(e, ["segmentationClasses"]);
  r != null && l(n, ["maskClasses"], r);
  const i = a(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function es(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["displayName"]);
  r != null && l(n, ["displayName"], r);
  const i = a(e, ["description"]);
  i != null && l(n, ["description"], i);
  const s = a(e, ["version"]);
  s != null && l(n, ["version"], s);
  const u = a(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], pS(u));
  const c = a(e, ["inputTokenLimit"]);
  c != null && l(n, ["inputTokenLimit"], c);
  const d = a(e, ["outputTokenLimit"]);
  d != null && l(n, ["outputTokenLimit"], d);
  const h = a(e, ["supportedGenerationMethods"]);
  h != null && l(n, ["supportedActions"], h);
  const f = a(e, ["temperature"]);
  f != null && l(n, ["temperature"], f);
  const p = a(e, ["maxTemperature"]);
  p != null && l(n, ["maxTemperature"], p);
  const m = a(e, ["topP"]);
  m != null && l(n, ["topP"], m);
  const g = a(e, ["topK"]);
  g != null && l(n, ["topK"], g);
  const _ = a(e, ["thinking"]);
  return _ != null && l(n, ["thinking"], _), n;
}
function ts(e, t) {
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
    Array.isArray(p) && (p = p.map((m) => uT(m))), l(n, ["endpoints"], p);
  }
  const c = a(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = a(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], mS(d));
  const h = a(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = a(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function QT(e, t) {
  const n = {}, o = a(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(n, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const s = a(e, ["fileData"]);
  s != null && l(n, ["fileData"], cT(s));
  const u = a(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], dT(u));
  const c = a(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = a(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], LA(d));
  const h = a(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = a(e, ["thought"]);
  f != null && l(n, ["thought"], f);
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
function ZT(e, t) {
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
  const h = a(e, ["text"]);
  h != null && l(n, ["text"], h);
  const f = a(e, ["thought"]);
  f != null && l(n, ["thought"], f);
  const p = a(e, ["thoughtSignature"]);
  p != null && l(n, ["thoughtSignature"], p);
  const m = a(e, ["videoMetadata"]);
  if (m != null && l(n, ["videoMetadata"], m), a(e, ["toolCall"]) !== void 0) throw new Error("toolCall parameter is not supported in Vertex AI.");
  if (a(e, ["toolResponse"]) !== void 0) throw new Error("toolResponse parameter is not supported in Vertex AI.");
  if (a(e, ["partMetadata"]) !== void 0) throw new Error("partMetadata parameter is not supported in Vertex AI.");
  return n;
}
function jT(e, t) {
  const n = {}, o = a(e, ["productImage"]);
  return o != null && l(n, ["image"], We(o)), n;
}
function eS(e, t, n) {
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
  const h = a(e, ["addWatermark"]);
  t !== void 0 && h != null && l(t, ["parameters", "addWatermark"], h);
  const f = a(e, ["outputMimeType"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "outputOptions",
    "mimeType"
  ], f);
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
function tS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["source"]);
  i != null && oS(i, o);
  const s = a(t, ["config"]);
  return s != null && eS(s, o), o;
}
function nS(e, t) {
  const n = {}, o = a(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => Jr(i))), l(n, ["generatedImages"], r);
  }
  return n;
}
function oS(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], We(i));
  const s = a(e, ["productImages"]);
  if (t !== void 0 && s != null) {
    let u = s;
    Array.isArray(u) && (u = u.map((c) => jT(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return o;
}
function rS(e, t) {
  const n = {}, o = a(e, ["referenceImage"]);
  o != null && l(n, ["referenceImage"], We(o));
  const r = a(e, ["referenceId"]);
  r != null && l(n, ["referenceId"], r);
  const i = a(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const s = a(e, ["maskImageConfig"]);
  s != null && l(n, ["maskImageConfig"], XT(s));
  const u = a(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], HA(u));
  const c = a(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = a(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function qf(e, t) {
  const n = {}, o = a(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = a(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = a(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function Hf(e, t) {
  const n = {}, o = a(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = a(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = a(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function iS(e, t) {
  const n = {}, o = a(e, ["category"]);
  if (o != null && l(n, ["category"], o), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(n, ["threshold"], r), n;
}
function sS(e, t) {
  const n = {}, o = a(e, ["image"]);
  return o != null && l(n, ["image"], We(o)), n;
}
function aS(e, t, n) {
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
function lS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["source"]);
  i != null && cS(i, o);
  const s = a(t, ["config"]);
  return s != null && aS(s, o), o;
}
function uS(e, t) {
  const n = {}, o = a(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => kT(i))), l(n, ["generatedMasks"], r);
  }
  return n;
}
function cS(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], We(i));
  const s = a(e, ["scribbleImage"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "scribble"], sS(s)), o;
}
function dS(e, t) {
  const n = {}, o = a(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = a(e, ["functionCallingConfig"]);
  r != null && l(n, ["functionCallingConfig"], fT(r));
  const i = a(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function fS(e, t) {
  const n = {}, o = a(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = a(e, ["functionCallingConfig"]);
  if (r != null && l(n, ["functionCallingConfig"], r), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function hS(e, t) {
  const n = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = a(e, ["computerUse"]);
  o != null && l(n, ["computerUse"], o);
  const r = a(e, ["fileSearch"]);
  r != null && l(n, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], GT(i));
  const s = a(e, ["googleMaps"]);
  s != null && l(n, ["googleMaps"], OT(s));
  const u = a(e, ["codeExecution"]);
  if (u != null && l(n, ["codeExecution"], u), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const c = a(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  if (d != null && l(n, ["googleSearchRetrieval"], d), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const h = a(e, ["urlContext"]);
  h != null && l(n, ["urlContext"], h);
  const f = a(e, ["mcpServers"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["mcpServers"], p);
  }
  return n;
}
function Vf(e, t) {
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
    Array.isArray(m) && (m = m.map((g) => hT(g))), l(n, ["functionDeclarations"], m);
  }
  const h = a(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = a(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = a(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function pS(e, t) {
  const n = {}, o = a(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = a(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function mS(e, t) {
  const n = {}, o = a(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = a(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
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
  const o = {}, r = a(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = a(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), o;
}
function yS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "name"], K(e, r));
  const i = a(t, ["config"]);
  return i != null && gS(i, o), o;
}
function vS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["config"]);
  return i != null && _S(i, o), o;
}
function AS(e, t, n) {
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
  const h = a(e, ["enhanceInputImage"]);
  t !== void 0 && h != null && l(t, [
    "parameters",
    "upscaleConfig",
    "enhanceInputImage"
  ], h);
  const f = a(e, ["imagePreservationFactor"]);
  t !== void 0 && f != null && l(t, [
    "parameters",
    "upscaleConfig",
    "imagePreservationFactor"
  ], f);
  const p = a(e, ["labels"]);
  t !== void 0 && p != null && l(t, ["labels"], p);
  const m = a(e, ["numberOfImages"]);
  t !== void 0 && m != null && l(t, ["parameters", "sampleCount"], m);
  const g = a(e, ["mode"]);
  return t !== void 0 && g != null && l(t, ["parameters", "mode"], g), o;
}
function TS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], K(e, r));
  const i = a(t, ["image"]);
  i != null && l(o, ["instances[0]", "image"], We(i));
  const s = a(t, ["upscaleFactor"]);
  s != null && l(o, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], s);
  const u = a(t, ["config"]);
  return u != null && AS(u, o), o;
}
function SS(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => Jr(s))), l(n, ["generatedImages"], i);
  }
  return n;
}
function ES(e, t) {
  const n = {}, o = a(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = a(e, ["encodedVideo"]);
  r != null && l(n, ["videoBytes"], It(r));
  const i = a(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function CS(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["uri"], o);
  const r = a(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["videoBytes"], It(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function wS(e, t) {
  const n = {}, o = a(e, ["image"]);
  o != null && l(n, ["_self"], We(o));
  const r = a(e, ["maskMode"]);
  return r != null && l(n, ["maskMode"], r), n;
}
function IS(e, t) {
  const n = {}, o = a(e, ["image"]);
  o != null && l(n, ["image"], Kr(o));
  const r = a(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function bS(e, t) {
  const n = {}, o = a(e, ["image"]);
  o != null && l(n, ["image"], We(o));
  const r = a(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function Jf(e, t) {
  const n = {}, o = a(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = a(e, ["videoBytes"]);
  r != null && l(n, ["encodedVideo"], It(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function Kf(e, t) {
  const n = {}, o = a(e, ["uri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = a(e, ["videoBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], It(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function RS(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["displayName"], o), n;
}
function PS(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && RS(n, t), t;
}
function MS(e, t) {
  const n = {}, o = a(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function NS(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = a(e, ["config"]);
  return o != null && MS(o, t), t;
}
function xS(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function kS(e, t) {
  const n = {}, o = a(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["customMetadata"], i);
  }
  const r = a(e, ["chunkingConfig"]);
  return t !== void 0 && r != null && l(t, ["chunkingConfig"], r), n;
}
function DS(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], LS(s)), t;
}
function $S(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = a(e, ["fileName"]);
  o != null && l(t, ["fileName"], o);
  const r = a(e, ["config"]);
  return r != null && kS(r, t), t;
}
function LS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = a(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function US(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function FS(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && US(n, t), t;
}
function OS(e) {
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
function Wf(e, t) {
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
function GS(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = a(e, ["config"]);
  return o != null && Wf(o, t), t;
}
function BS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var qS = "Content-Type", HS = "X-Server-Timeout", VS = "User-Agent", ns = "x-goog-api-client", JS = "google-genai-sdk/1.50.1", KS = "v1beta1", WS = "v1beta", zS = /* @__PURE__ */ new Set(["us", "eu"]), YS = 5, XS = [
  408,
  429,
  500,
  502,
  503,
  504
], QS = class {
  constructor(e) {
    var t, n, o;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const r = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (r.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? r.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && zS.has(this.clientOptions.location) ? r.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (r.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), r.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : KS;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), r.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : WS, r.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === Xi.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
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
    return t && t.extraBody !== null && ZS(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Qu(o), new Qi(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Qu(o), this.processStreamResponse(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  processStreamResponse(e) {
    return Je(this, arguments, function* () {
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
          const h = r.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(h);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, y = g.code, E = `got status: ${_}. ${JSON.stringify(m)}`;
              if (y >= 400 && y < 600) throw new Of({
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
            if (g.startsWith(s)) {
              const _ = g.substring(5).trim();
              try {
                yield yield q(new Qi(new Response(_, {
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
      throw XS.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new El.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, El.default)(r, { retries: ((n = o.attempts) !== null && n !== void 0 ? n : YS) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = JS + " " + this.clientOptions.userAgentExtra;
    return e[VS] = t, e[ns] = t, e[qS] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [o, r] of Object.entries(e.headers)) n.append(o, r);
      e.timeout && e.timeout > 0 && n.append(HS, String(Math.ceil(e.timeout / 1e3)));
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
    const u = { file: o }, c = this.getFileName(e), d = x("upload/v1beta/files", u._url), h = await this.fetchUploadUrl(d, o.sizeBytes, o.mimeType, c, u, t?.httpOptions);
    return r.upload(e, h, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var o;
    const r = this.clientOptions.uploader, i = await r.stat(t), s = String(i.size), u = (o = n?.mimeType) !== null && o !== void 0 ? o : i.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), h = {};
    n != null && Wf(n, h);
    const f = await this.fetchUploadUrl(c, s, u, d, h, n?.httpOptions);
    return r.uploadToFileSearchStore(t, f, this);
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
async function Qu(e) {
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
    throw n >= 400 && n < 600 ? new Of({
      message: r,
      status: n
    }) : new Error(r);
  }
}
function ZS(e, t) {
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
      const d = s[c], h = u[c];
      d && typeof d == "object" && !Array.isArray(d) && h && typeof h == "object" && !Array.isArray(h) ? u[c] = o(h, d) : (h && d && typeof h != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof h}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const r = o(n, t);
  e.body = JSON.stringify(r);
}
var jS = "mcp_used/unknown", eE = !1;
function zf(e) {
  for (const t of e)
    if (tE(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return eE;
}
function Yf(e) {
  var t;
  e[ns] = (((t = e[ns]) !== null && t !== void 0 ? t : "") + ` ${jS}`).trimStart();
}
function tE(e) {
  return e !== null && typeof e == "object" && e instanceof oE;
}
function nE(e) {
  return Je(this, arguments, function* (n, o = 100) {
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
var oE = class Xf {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Xf(t, n);
  }
  async initialize() {
    var t, n, o, r;
    if (this.mcpTools.length > 0) return;
    const i = {}, s = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, Ke(nE(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
        r = d.value, u = !1;
        const f = r;
        s.push(f);
        const p = f.name;
        if (i[p]) throw new Error(`Duplicate function name ${p} found in MCP tools. Please ensure function names are unique.`);
        i[p] = h;
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
    this.mcpTools = s, this.functionNameToMcpClient = i;
  }
  async tool() {
    return await this.initialize(), _y(this.mcpTools, this.config);
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
async function rE(e, t, n) {
  const o = new ly();
  let r;
  n.data instanceof Blob ? r = JSON.parse(await n.data.text()) : r = JSON.parse(n.data), Object.assign(o, r), t(o);
}
var iE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const o = this.apiClient.getWebsocketBaseUrl(), r = this.apiClient.getApiVersion(), i = lE(this.apiClient.getDefaultHeaders()), s = `${o}/ws/google.ai.generativelanguage.${r}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        rE(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(s, aE(i), p);
    m.connect(), await c;
    const g = { setup: { model: K(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new sE(m, this.apiClient);
  }
}, sE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = EA(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = SA(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(nn.PLAY);
  }
  pause() {
    this.sendPlaybackControl(nn.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(nn.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(nn.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function aE(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function lE(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var uE = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function cE(e, t, n) {
  const o = new ay();
  let r;
  n.data instanceof Blob ? r = await n.data.text() : n.data instanceof ArrayBuffer ? r = new TextDecoder().decode(n.data) : r = n.data;
  const i = JSON.parse(r);
  if (e.isVertexAI()) {
    const s = IA(i);
    Object.assign(o, s);
  } else Object.assign(o, i);
  t(o);
}
var dE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new iE(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, o, r, i, s;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && zf(e.config.tools) && Yf(h);
    const f = mE(h);
    if (this.apiClient.isVertexAI()) {
      const I = this.apiClient.getProject(), N = this.apiClient.getLocation(), b = this.apiClient.getApiKey(), F = !!I && !!N || !!b;
      this.apiClient.getCustomBaseUrl() && !F ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const I = this.apiClient.getApiKey();
      let N = "BidiGenerateContent", b = "key";
      I?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), N = "BidiGenerateContentConstrained", b = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${N}?${b}=${I}`;
    }
    let p = () => {
    };
    const m = new Promise((I) => {
      p = I;
    }), g = e.callbacks, _ = function() {
      var I;
      (I = g?.onopen) === null || I === void 0 || I.call(g), p({});
    }, y = this.apiClient, E = {
      onopen: _,
      onmessage: (I) => {
        cE(y, g.onmessage, I);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(I) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(I) {
      }
    }, A = this.webSocketFactory.create(d, pE(f), E);
    A.connect(), await m;
    let w = K(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && w.startsWith("publishers/")) {
      const I = this.apiClient.getProject(), N = this.apiClient.getLocation();
      I && N && (w = `projects/${I}/locations/${N}/` + w);
    }
    let P = {};
    this.apiClient.isVertexAI() && ((o = e.config) === null || o === void 0 ? void 0 : o.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [Sr.AUDIO] } : e.config.responseModalities = [Sr.AUDIO]), !((r = e.config) === null || r === void 0) && r.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const L = (s = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && s !== void 0 ? s : [], C = [];
    for (const I of L) if (this.isCallableTool(I)) {
      const N = I;
      C.push(await N.tool());
    } else C.push(I);
    C.length > 0 && (e.config.tools = C);
    const k = {
      model: w,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? P = TA(this.apiClient, k) : P = AA(this.apiClient, k), delete P.config, A.send(JSON.stringify(P)), new hE(A, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, fE = { turnComplete: !0 }, hE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = ve(t.turns), e.isVertexAI() || (n = n.map((o) => So(o)));
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
      if (!e.isVertexAI() && !("id" in o)) throw new Error(uE);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, fE), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: wA(e) } : t = { realtimeInput: CA(e) }, this.conn.send(JSON.stringify(t));
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
function pE(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function mE(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var Zu = 10;
function ju(e) {
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
function gE(e) {
  var t, n, o;
  return (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((r) => cn(r))) !== null && o !== void 0 ? o : !1;
}
function ec(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((o, r) => {
    if (cn(o)) return;
    const i = o;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(r);
  }), n;
}
function tc(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var _E = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = ve(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = ve(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const o = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: Er.EMBED_CONTENT
        });
        return await this.embedContentInternal(o);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: Er.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, o, r, i, s;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !gE(t) || ju(t.config)) return await this.generateContentInternal(u);
      const c = ec(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, h;
      const f = ve(u.contents), p = (r = (o = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && r !== void 0 ? r : Zu;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const y of (s = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && s !== void 0 ? s : []) if (cn(y)) {
          const E = await y.callTool(d.functionCalls);
          _.push(...E);
        }
        m++, h = {
          role: "user",
          parts: _
        }, u.contents = ve(u.contents), u.contents.push(g), u.contents.push(h), tc(u.config) && (f.push(g), f.push(h));
      }
      return tc(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, o, r, i, s;
      if (this.maybeMoveToResponseJsonSchem(t), ju(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = ec(t);
      if (u.length > 0) {
        const h = u.map((f) => `tools[${f}]`).join(", ");
        throw new Error(`Incompatible tools found at ${h}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
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
      return new Bt(ct.PAGED_ITEM_MODELS, (r) => this.listInternal(r), await this.listInternal(o), o);
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
    if (s.config.tools = i, e.config && e.config.tools && zf(e.config.tools)) {
      const u = (o = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && o !== void 0 ? o : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), Yf(c), s.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
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
    const r = (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && o !== void 0 ? o : Zu;
    let i = !1, s = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return Je(this, arguments, function* () {
        for (var f, p, m, g, _, y; s < r; ) {
          i && (s++, i = !1);
          const P = yield q(c.processParamsMaybeAddMcpUsage(h)), L = yield q(c.generateContentStreamInternal(P)), C = [], k = [];
          try {
            for (var E = !0, A = (p = void 0, Ke(L)), w; w = yield q(A.next()), f = w.done, !f; E = !0) {
              g = w.value, E = !1;
              const I = g;
              if (yield yield q(I), I.candidates && (!((_ = I.candidates[0]) === null || _ === void 0) && _.content)) {
                k.push(I.candidates[0].content);
                for (const N of (y = I.candidates[0].content.parts) !== null && y !== void 0 ? y : []) if (s < r && N.functionCall) {
                  if (!N.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(N.functionCall.name)) {
                    const b = yield q(d.get(N.functionCall.name).callTool([N.functionCall]));
                    C.push(...b);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${N.functionCall.name}`);
                }
              }
            }
          } catch (I) {
            p = { error: I };
          } finally {
            try {
              !E && !f && (m = A.return) && (yield q(m.call(A)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (C.length > 0) {
            i = !0;
            const I = new $n();
            I.candidates = [{ content: {
              role: "user",
              parts: C
            } }], yield yield q(I);
            const N = [];
            N.push(...k), N.push({
              role: "user",
              parts: C
            }), h.contents = ve(h.contents).concat(N);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = zu(this.apiClient, e);
      return s = x("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Xu(d), f = new $n();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Wu(this.apiClient, e);
      return s = x("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Yu(d), f = new $n();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = zu(this.apiClient, e);
      return s = x("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return Je(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = Ke(d), y; y = yield q(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const E = m, A = Xu(yield q(E.json()), e);
              A.sdkHttpResponse = { headers: E.headers };
              const w = new $n();
              Object.assign(w, A), yield yield q(w);
            }
          } catch (E) {
            f = { error: E };
          } finally {
            try {
              !g && !h && (p = _.return) && (yield q(p.call(_)));
            } finally {
              if (f) throw f.error;
            }
          }
        });
      });
    } else {
      const c = Wu(this.apiClient, e);
      return s = x("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }), i.then(function(d) {
        return Je(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = Ke(d), y; y = yield q(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const E = m, A = Yu(yield q(E.json()), e);
              A.sdkHttpResponse = { headers: E.headers };
              const w = new $n();
              Object.assign(w, A), yield yield q(w);
            }
          } catch (E) {
            f = { error: E };
          } finally {
            try {
              !g && !h && (p = _.return) && (yield q(p.call(_)));
            } finally {
              if (f) throw f.error;
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
      const c = sT(this.apiClient, e, e);
      return s = x(vy(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = lT(d, e), f = new bu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = iT(this.apiClient, e);
      return s = x("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = aT(d), f = new bu();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = vT(this.apiClient, e);
      return s = x("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = TT(d), f = new Ru();
        return Object.assign(f, h), f;
      });
    } else {
      const c = yT(this.apiClient, e);
      return s = x("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = AT(d), f = new Ru();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = tT(this.apiClient, e);
      return r = x("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
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
        const c = nT(u), d = new z_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = TS(this.apiClient, e);
      return r = x("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
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
        const c = SS(u), d = new Y_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = tS(this.apiClient, e);
      return r = x("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = nS(u), d = new X_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = lS(this.apiClient, e);
      return r = x("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = uS(u), d = new Q_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = FT(this.apiClient, e);
      return s = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ts(d));
    } else {
      const c = UT(this.apiClient, e);
      return s = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => es(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = WT(this.apiClient, e);
      return s = x("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = YT(d), f = new Pu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = KT(this.apiClient, e);
      return s = x("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = zT(d), f = new Pu();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = vS(this.apiClient, e);
      return s = x("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => ts(d));
    } else {
      const c = yS(this.apiClient, e);
      return s = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => es(d));
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = QA(this.apiClient, e);
      return s = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = jA(d), f = new Mu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = XA(this.apiClient, e);
      return s = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = ZA(d), f = new Mu();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = WA(this.apiClient, e);
      return s = x("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = YA(d), f = new Nu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = KA(this.apiClient, e);
      return s = x("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = zA(d), f = new Nu();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = OA(this.apiClient, e);
      return r = x("{model}:computeTokens", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
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
        const c = GA(u), d = new Z_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = bT(this.apiClient, e);
      return s = x("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = wT(d), f = new xu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = IT(this.apiClient, e);
      return s = x("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = CT(d), f = new xu();
        return Object.assign(f, h), f;
      });
    }
  }
}, yE = class extends dt {
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
      const c = q_(e);
      return s = x("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = B_(e);
      return s = x("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
      const s = D_(e);
      return r = x("{resourceName}:fetchPredictOperation", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
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
function nc(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function vE(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function AE(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function TE(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => ME(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function SE(e, t, n) {
  const o = {}, r = a(t, ["expireTime"]);
  n !== void 0 && r != null && l(n, ["expireTime"], r);
  const i = a(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const s = a(t, ["uses"]);
  n !== void 0 && s != null && l(n, ["uses"], s);
  const u = a(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], PE(e, u));
  const c = a(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), o;
}
function EE(e, t) {
  const n = {}, o = a(t, ["config"]);
  return o != null && l(n, ["config"], SE(e, o, n)), n;
}
function CE(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function wE(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function IE(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], vE(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function bE(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function RE(e, t) {
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
  const h = a(e, ["seed"]);
  t !== void 0 && h != null && l(t, [
    "setup",
    "generationConfig",
    "seed"
  ], h);
  const f = a(e, ["speechConfig"]);
  t !== void 0 && f != null && l(t, [
    "setup",
    "generationConfig",
    "speechConfig"
  ], oa(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], TE(se(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let I = mn(_);
    Array.isArray(I) && (I = I.map((N) => kE(pn(N)))), l(t, ["setup", "tools"], I);
  }
  const y = a(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], xE(y));
  const E = a(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], nc(E));
  const A = a(e, ["outputAudioTranscription"]);
  t !== void 0 && A != null && l(t, ["setup", "outputAudioTranscription"], nc(A));
  const w = a(e, ["realtimeInputConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "realtimeInputConfig"], w);
  const P = a(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const L = a(e, ["proactivity"]);
  if (t !== void 0 && L != null && l(t, ["setup", "proactivity"], L), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const C = a(e, ["avatarConfig"]);
  t !== void 0 && C != null && l(t, ["setup", "avatarConfig"], C);
  const k = a(e, ["safetySettings"]);
  if (t !== void 0 && k != null) {
    let I = k;
    Array.isArray(I) && (I = I.map((N) => NE(N))), l(t, ["setup", "safetySettings"], I);
  }
  return n;
}
function PE(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["setup", "model"], K(e, o));
  const r = a(t, ["config"]);
  return r != null && l(n, ["config"], RE(r, n)), n;
}
function ME(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], CE(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], wE(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], AE(c));
  const d = a(e, ["text"]);
  d != null && l(t, ["text"], d);
  const h = a(e, ["thought"]);
  h != null && l(t, ["thought"], h);
  const f = a(e, ["thoughtSignature"]);
  f != null && l(t, ["thoughtSignature"], f);
  const p = a(e, ["videoMetadata"]);
  p != null && l(t, ["videoMetadata"], p);
  const m = a(e, ["toolCall"]);
  m != null && l(t, ["toolCall"], m);
  const g = a(e, ["toolResponse"]);
  g != null && l(t, ["toolResponse"], g);
  const _ = a(e, ["partMetadata"]);
  return _ != null && l(t, ["partMetadata"], _), t;
}
function NE(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = a(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function xE(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function kE(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], bE(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], IE(i));
  const s = a(e, ["codeExecution"]);
  if (s != null && l(t, ["codeExecution"], s), a(e, ["enterpriseWebSearch"]) !== void 0) throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  const u = a(e, ["functionDeclarations"]);
  if (u != null) {
    let f = u;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["functionDeclarations"], f);
  }
  const c = a(e, ["googleSearchRetrieval"]);
  if (c != null && l(t, ["googleSearchRetrieval"], c), a(e, ["parallelAiSearch"]) !== void 0) throw new Error("parallelAiSearch parameter is not supported in Gemini API.");
  const d = a(e, ["urlContext"]);
  d != null && l(t, ["urlContext"], d);
  const h = a(e, ["mcpServers"]);
  if (h != null) {
    let f = h;
    Array.isArray(f) && (f = f.map((p) => p)), l(t, ["mcpServers"], f);
  }
  return t;
}
function DE(e) {
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
function $E(e, t) {
  let n = null;
  const o = e.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const i = o.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else o !== void 0 && delete e.bidiGenerateContentSetup;
  const r = e.fieldMask;
  if (n) {
    const i = DE(n);
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
var LE = class extends dt {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const s = EE(this.apiClient, e);
      r = x("auth_tokens", s._url), i = s._query, delete s.config, delete s._url, delete s._query;
      const u = $E(s, e.config);
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
function UE(e, t) {
  const n = {}, o = a(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function FE(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = a(e, ["config"]);
  return o != null && UE(o, t), t;
}
function OE(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function GE(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function BE(e) {
  const t = {}, n = a(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const o = a(e, ["config"]);
  return o != null && GE(o, t), t;
}
function qE(e) {
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
var HE = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Bt(ct.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = OE(e);
      return r = x("{name}", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
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
      const i = FE(e);
      o = x("{name}", i._url), r = i._query, delete i._url, delete i._query, await this.apiClient.request({
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
      const s = BE(e);
      return r = x("{parent}/documents", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = qE(u), d = new j_();
        return Object.assign(d, c), d;
      });
    }
  }
}, VE = class extends dt {
  constructor(e, t = new HE(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Bt(ct.PAGED_ITEM_FILE_SEARCH_STORES, (o) => this.listInternal(o), await this.listInternal(n), n);
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
      const s = PS(e);
      return r = x("fileSearchStores", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
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
      const s = xS(e);
      return r = x("{name}", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
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
      const i = NS(e);
      o = x("{name}", i._url), r = i._query, delete i._url, delete i._query, await this.apiClient.request({
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
      const s = FS(e);
      return r = x("fileSearchStores", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = OS(u), d = new ey();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = GS(e);
      return r = x("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = BS(u), d = new ty();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = $S(e);
      return r = x("{file_search_store_name}:importFile", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = DS(u), d = new ny();
        return Object.assign(d, c), d;
      });
    }
  }
}, Qf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Qf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
}, JE = () => Qf();
function os(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var rs = (e) => {
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
}, De = class extends Error {
}, Le = class is extends De {
  constructor(t, n, o, r) {
    super(`${is.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.error = n;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new Wr({
      message: o,
      cause: rs(n)
    });
    const i = n;
    return t === 400 ? new jf(t, i, o, r) : t === 401 ? new eh(t, i, o, r) : t === 403 ? new th(t, i, o, r) : t === 404 ? new nh(t, i, o, r) : t === 409 ? new oh(t, i, o, r) : t === 422 ? new rh(t, i, o, r) : t === 429 ? new ih(t, i, o, r) : t >= 500 ? new sh(t, i, o, r) : new is(t, i, o, r);
  }
}, ss = class extends Le {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Wr = class extends Le {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Zf = class extends Wr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, jf = class extends Le {
}, eh = class extends Le {
}, th = class extends Le {
}, nh = class extends Le {
}, oh = class extends Le {
}, rh = class extends Le {
}, ih = class extends Le {
}, sh = class extends Le {
}, KE = /^[a-z][a-z0-9+.-]*:/i, WE = (e) => KE.test(e), as = (e) => (as = Array.isArray, as(e)), oc = as;
function rc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function zE(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var YE = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new De(`${e} must be an integer`);
  if (t < 0) throw new De(`${e} must be a positive integer`);
  return t;
}, XE = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, QE = (e) => new Promise((t) => setTimeout(t, e));
function ZE() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function ah(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function jE(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return ah({
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
function lh(e) {
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
async function eC(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const o = e.getReader(), r = o.cancel();
  o.releaseLock(), await r;
}
var tC = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function nC(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new De(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var oC = "0.0.1", uh = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Ai(e, t, n) {
  return uh(), new File(e, t ?? "unknown_file", n);
}
function rC(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var iC = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", ch = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", sC = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && ch(e), aC = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function lC(e, t, n) {
  if (uh(), e = await e, sC(e))
    return e instanceof File ? e : Ai([await e.arrayBuffer()], e.name);
  if (aC(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Ai(await ls(r), t, n);
  }
  const o = await ls(e);
  if (t || (t = rC(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = Object.assign(Object.assign({}, n), { type: r }));
  }
  return Ai(o, t, n);
}
async function ls(e) {
  var t, n, o, r, i;
  let s = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) s.push(e);
  else if (ch(e)) s.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (iC(e)) try {
    for (var u = !0, c = Ke(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      r = d.value, u = !1;
      const h = r;
      s.push(...await ls(h));
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
  else {
    const h = (i = e?.constructor) === null || i === void 0 ? void 0 : i.name;
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${uC(e)}`);
  }
  return s;
}
function uC(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ra = class {
  constructor(e) {
    this._client = e;
  }
};
ra._key = [];
function dh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var ic = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), cC = (e = dh) => (function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], s = n.reduce((h, f, p) => {
    var m, g, _;
    /[?#]/.test(f) && (r = !0);
    const y = o[p];
    let E = (r ? encodeURIComponent : e)("" + y);
    return p !== o.length && (y == null || typeof y == "object" && y.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = y.hasOwnProperty) !== null && m !== void 0 ? m : ic)) !== null && g !== void 0 ? g : ic)) === null || _ === void 0 ? void 0 : _.toString)) && (E = y + "", i.push({
      start: h.length + f.length,
      length: E.length,
      error: `Value of type ${Object.prototype.toString.call(y).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === o.length ? "" : E);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
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
    throw new De(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${s}
${f}`);
  }
  return s;
}), Ge = /* @__PURE__ */ cC(dh), fh = class extends ra {
  create(e, t) {
    var n;
    const { api_version: o = this._client.apiVersion } = e, r = St(e, ["api_version"]);
    if ("model" in r && "agent_config" in r) throw new De("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in r && "generation_config" in r) throw new De("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(Ge`/${o}/interactions`, Object.assign(Object.assign({ body: r }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Ge`/${o}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.post(Ge`/${o}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var o;
    const r = t ?? {}, { api_version: i = this._client.apiVersion } = r, s = St(r, ["api_version"]);
    return this._client.get(Ge`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: s }, n), { stream: (o = t?.stream) !== null && o !== void 0 ? o : !1 }));
  }
};
fh._key = Object.freeze(["interactions"]);
var hh = class extends fh {
}, ph = class extends ra {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: o } = e, r = St(e, ["api_version", "webhook_id"]);
    return this._client.post(Ge`/${n}/webhooks`, Object.assign({
      query: { webhook_id: o },
      body: r
    }, t));
  }
  update(e, t, n) {
    const { api_version: o = this._client.apiVersion, update_mask: r } = t, i = St(t, ["api_version", "update_mask"]);
    return this._client.patch(Ge`/${o}/webhooks/${e}`, Object.assign({
      query: { update_mask: r },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: o = this._client.apiVersion } = n, r = St(n, ["api_version"]);
    return this._client.get(Ge`/${o}/webhooks`, Object.assign({ query: r }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Ge`/${o}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.get(Ge`/${o}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: o = this._client.apiVersion, body: r } = t ?? {};
    return this._client.post(Ge`/${o}/webhooks/${e}:ping`, Object.assign({ body: r }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const o = t ?? {}, { api_version: r = this._client.apiVersion } = o, i = St(o, ["api_version"]);
    return this._client.post(Ge`/${r}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
ph._key = Object.freeze(["webhooks"]);
var mh = class extends ph {
};
function dC(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Wo;
function ia(e) {
  let t;
  return (Wo ?? (t = new globalThis.TextEncoder(), Wo = t.encode.bind(t)))(e);
}
var zo;
function sc(e) {
  let t;
  return (zo ?? (t = new globalThis.TextDecoder(), zo = t.decode.bind(t)))(e);
}
var zr = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ia(e) : e;
    this.buffer = dC([this.buffer, n]);
    const o = [];
    let r;
    for (; (r = fC(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (r.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = r.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (r.index !== this.carriageReturnIndex + 1 || r.carriage)) {
        o.push(sc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? r.preceding - 1 : r.preceding, s = sc(this.buffer.subarray(0, i));
      o.push(s), this.buffer = this.buffer.subarray(r.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), o;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
zr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
zr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function fC(e, t) {
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
var wr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, ac = (e, t, n) => {
  if (e) {
    if (zE(wr, e)) return e;
    pe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(wr))}`);
  }
};
function Vn() {
}
function Yo(e, t, n) {
  return !t || wr[e] > wr[n] ? Vn : t[e].bind(t);
}
var hC = {
  error: Vn,
  warn: Vn,
  info: Vn,
  debug: Vn
}, lc = /* @__PURE__ */ new WeakMap();
function pe(e) {
  var t;
  const n = e.logger, o = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return hC;
  const r = lc.get(n);
  if (r && r[0] === o) return r[1];
  const i = {
    error: Yo("error", n, o),
    warn: Yo("warn", n, o),
    info: Yo("info", n, o),
    debug: Yo("debug", n, o)
  };
  return lc.set(n, [o, i]), i;
}
var Nt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), pC = class Jn {
  constructor(t, n, o) {
    this.iterator = t, this.controller = n, this.client = o;
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? pe(o) : console;
    function s() {
      return Je(this, arguments, function* () {
        var c, d, h, f;
        if (r) throw new De("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Ke(mC(t, n)), _; _ = yield q(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const y = f;
              if (!p)
                if (y.data.startsWith("[DONE]")) {
                  p = !0;
                  continue;
                } else try {
                  yield yield q(JSON.parse(y.data));
                } catch (E) {
                  throw i.error("Could not parse message into JSON:", y.data), i.error("From chunk:", y.raw), E;
                }
            }
          } catch (y) {
            d = { error: y };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield q(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (y) {
          if (os(y)) return yield q(void 0);
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
      return Je(this, arguments, function* () {
        var c, d, h, f;
        const p = new zr(), m = lh(t);
        try {
          for (var g = !0, _ = Ke(m), y; y = yield q(_.next()), c = y.done, !c; g = !0) {
            f = y.value, g = !1;
            const E = f;
            for (const A of p.decode(E)) yield yield q(A);
          }
        } catch (E) {
          d = { error: E };
        } finally {
          try {
            !g && !c && (h = _.return) && (yield q(h.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const E of p.flush()) yield yield q(E);
      });
    }
    function s() {
      return Je(this, arguments, function* () {
        var c, d, h, f;
        if (r) throw new De("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Ke(i()), _; _ = yield q(g.next()), c = _.done, !c; m = !0) {
              f = _.value, m = !1;
              const y = f;
              p || y && (yield yield q(JSON.parse(y)));
            }
          } catch (y) {
            d = { error: y };
          } finally {
            try {
              !m && !c && (h = g.return) && (yield q(h.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (y) {
          if (os(y)) return yield q(void 0);
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
    return ah({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const s = ia(JSON.stringify(r) + `
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
function mC(e, t) {
  return Je(this, arguments, function* () {
    var o, r, i, s;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new De("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new De("Attempted to iterate over a response with no body");
    const u = new _C(), c = new zr(), d = lh(e.body);
    try {
      for (var h = !0, f = Ke(gC(d)), p; p = yield q(f.next()), o = p.done, !o; h = !0) {
        s = p.value, h = !1;
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
        !h && !o && (i = f.return) && (yield q(i.call(f)));
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
function gC(e) {
  return Je(this, arguments, function* () {
    var n, o, r, i;
    try {
      for (var s = !0, u = Ke(e), c; c = yield q(u.next()), n = c.done, !n; s = !0) {
        i = c.value, s = !1;
        const d = i;
        d != null && (yield yield q(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? ia(d) : d));
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
var _C = class {
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
    let [t, n, o] = yC(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function yC(e, t) {
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
async function vC(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, s = await (async () => {
    var u;
    if (t.options.stream)
      return pe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : pC.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return pe(e).debug(`[${o}] response parsed`, Nt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
var AC = class gh extends Promise {
  constructor(t, n, o = vC) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, this.client = t;
  }
  _thenUnwrap(t) {
    return new gh(this.client, this.responsePromise, async (n, o) => t(await this.parseResponse(n, o), o));
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
}, _h = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* TC(e) {
  if (!e) return;
  if (_h in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : oc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = oc(o[1]) ? o[1] : [o[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [r, null]), yield [r, u]);
  }
}
var Ln = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, s] of TC(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [_h]: !0,
    values: t,
    nulls: n
  };
}, Ti = (e) => {
  var t, n, o, r, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (r = (o = globalThis.Deno.env) === null || o === void 0 ? void 0 : o.get) === null || r === void 0 ? void 0 : r.call(o, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, yh, vh = class Ah {
  constructor(t) {
    var n, o, r, i, s, u, c, { baseURL: d = Ti("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = Ti("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = St(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (o = m.timeout) !== null && o !== void 0 ? o : Ah.DEFAULT_TIMEOUT, this.logger = (r = m.logger) !== null && r !== void 0 ? r : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (s = (i = ac(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : ac(Ti("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && s !== void 0 ? s : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : ZE(), this.encoder = tC, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    return nC(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${oC}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${JE()}`;
  }
  makeStatusError(t, n, o, r) {
    return Le.generate(t, n, o, r);
  }
  buildURL(t, n, o) {
    const r = !this.baseURLOverridden() && o || this.baseURL, i = WE(t) ? new URL(t) : new URL(r + (r.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), s = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!rc(s) || !rc(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), s), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return new AC(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, o) {
    var r, i, s;
    const u = await t, c = (r = u.maxRetries) !== null && r !== void 0 ? r : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: h, timeout: f } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: h,
      options: u
    });
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = o === void 0 ? "" : `, retryOf: ${o}`, g = Date.now();
    if (pe(this).debug(`[${p}] sending request`, Nt({
      retryOfRequestLogID: o,
      method: u.method,
      url: h,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new ss();
    const _ = new AbortController(), y = await this.fetchWithTimeout(h, d, f, _).catch(rs), E = Date.now();
    if (y instanceof globalThis.Error) {
      const w = `retrying, ${n} attempts remaining`;
      if (!((s = u.signal) === null || s === void 0) && s.aborted) throw new ss();
      const P = os(y) || /timed? ?out/i.test(String(y) + ("cause" in y ? String(y.cause) : ""));
      if (n)
        return pe(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - ${w}`), pe(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (${w})`, Nt({
          retryOfRequestLogID: o,
          url: h,
          durationMs: E - g,
          message: y.message
        })), this.retryRequest(u, n, o ?? p);
      throw pe(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - error; no more retries left`), pe(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (error; no more retries left)`, Nt({
        retryOfRequestLogID: o,
        url: h,
        durationMs: E - g,
        message: y.message
      })), P ? new Zf() : new Wr({ cause: y });
    }
    const A = `[${p}${m}] ${d.method} ${h} ${y.ok ? "succeeded" : "failed"} with status ${y.status} in ${E - g}ms`;
    if (!y.ok) {
      const w = await this.shouldRetry(y);
      if (n && w) {
        const I = `retrying, ${n} attempts remaining`;
        return await eC(y.body), pe(this).info(`${A} - ${I}`), pe(this).debug(`[${p}] response error (${I})`, Nt({
          retryOfRequestLogID: o,
          url: y.url,
          status: y.status,
          headers: y.headers,
          durationMs: E - g
        })), this.retryRequest(u, n, o ?? p, y.headers);
      }
      const P = w ? "error; no more retries left" : "error; not retryable";
      pe(this).info(`${A} - ${P}`);
      const L = await y.text().catch((I) => rs(I).message), C = XE(L), k = C ? void 0 : L;
      throw pe(this).debug(`[${p}] response error (${P})`, Nt({
        retryOfRequestLogID: o,
        url: y.url,
        status: y.status,
        headers: y.headers,
        message: k,
        durationMs: Date.now() - g
      })), this.makeStatusError(y.status, C, k, y.headers);
    }
    return pe(this).info(A), pe(this).debug(`[${p}] response start`, Nt({
      retryOfRequestLogID: o,
      url: y.url,
      status: y.status,
      headers: y.headers,
      durationMs: E - g
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
    const i = n || {}, { signal: s, method: u } = i, c = St(i, ["signal", "method"]), d = this._makeAbort(r);
    s && s.addEventListener("abort", d, { once: !0 });
    const h = setTimeout(d, o), f = globalThis.ReadableStream && c.body instanceof globalThis.ReadableStream || typeof c.body == "object" && c.body !== null && Symbol.asyncIterator in c.body, p = Object.assign(Object.assign(Object.assign({ signal: r.signal }, f ? { duplex: "half" } : {}), { method: "GET" }), c);
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
    return await QE(s), this.makeRequest(t, n - 1, o);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var o, r, i;
    const s = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = s, f = this.buildURL(c, d, h);
    "timeout" in s && YE("timeout", s.timeout), s.timeout = (o = s.timeout) !== null && o !== void 0 ? o : this.timeout;
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
      url: f,
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
      body: jE(t)
    } : typeof t == "object" && o.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: o
    });
  }
};
vh.DEFAULT_TIMEOUT = 6e4;
var re = class extends vh {
  constructor() {
    super(...arguments), this.interactions = new hh(this), this.webhooks = new mh(this);
  }
};
yh = re;
re.GeminiNextGenAPIClient = yh;
re.GeminiNextGenAPIClientError = De;
re.APIError = Le;
re.APIConnectionError = Wr;
re.APIConnectionTimeoutError = Zf;
re.APIUserAbortError = ss;
re.NotFoundError = nh;
re.ConflictError = oh;
re.RateLimitError = ih;
re.BadRequestError = jf;
re.AuthenticationError = eh;
re.InternalServerError = sh;
re.PermissionDeniedError = th;
re.UnprocessableEntityError = rh;
re.toFile = lC;
re.Interactions = hh;
re.Webhooks = mh;
function SC(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function EC(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function CC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function wC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function IC(e, t, n) {
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
function bC(e, t, n) {
  const o = {};
  let r = a(n, ["config", "method"]);
  if (r === void 0 && (r = "SUPERVISED_FINE_TUNING"), r === "SUPERVISED_FINE_TUNING") {
    const C = a(e, ["validationDataset"]);
    t !== void 0 && C != null && l(t, ["supervisedTuningSpec"], Si(C));
  } else if (r === "PREFERENCE_TUNING") {
    const C = a(e, ["validationDataset"]);
    t !== void 0 && C != null && l(t, ["preferenceOptimizationSpec"], Si(C));
  } else if (r === "DISTILLATION") {
    const C = a(e, ["validationDataset"]);
    t !== void 0 && C != null && l(t, ["distillationSpec"], Si(C));
  }
  const i = a(e, ["tunedModelDisplayName"]);
  t !== void 0 && i != null && l(t, ["tunedModelDisplayName"], i);
  const s = a(e, ["description"]);
  t !== void 0 && s != null && l(t, ["description"], s);
  let u = a(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const C = a(e, ["epochCount"]);
    t !== void 0 && C != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], C);
  } else if (u === "PREFERENCE_TUNING") {
    const C = a(e, ["epochCount"]);
    t !== void 0 && C != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], C);
  } else if (u === "DISTILLATION") {
    const C = a(e, ["epochCount"]);
    t !== void 0 && C != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], C);
  }
  let c = a(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const C = a(e, ["learningRateMultiplier"]);
    t !== void 0 && C != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], C);
  } else if (c === "PREFERENCE_TUNING") {
    const C = a(e, ["learningRateMultiplier"]);
    t !== void 0 && C != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], C);
  } else if (c === "DISTILLATION") {
    const C = a(e, ["learningRateMultiplier"]);
    t !== void 0 && C != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], C);
  }
  let d = a(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const C = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && C != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], C);
  } else if (d === "PREFERENCE_TUNING") {
    const C = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && C != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], C);
  } else if (d === "DISTILLATION") {
    const C = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && C != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], C);
  }
  let h = a(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const C = a(e, ["adapterSize"]);
    t !== void 0 && C != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], C);
  } else if (h === "PREFERENCE_TUNING") {
    const C = a(e, ["adapterSize"]);
    t !== void 0 && C != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], C);
  } else if (h === "DISTILLATION") {
    const C = a(e, ["adapterSize"]);
    t !== void 0 && C != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], C);
  }
  let f = a(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const C = a(e, ["tuningMode"]);
    t !== void 0 && C != null && l(t, ["supervisedTuningSpec", "tuningMode"], C);
  } else if (f === "DISTILLATION") {
    const C = a(e, ["tuningMode"]);
    t !== void 0 && C != null && l(t, ["distillationSpec", "tuningMode"], C);
  }
  const p = a(e, ["customBaseModel"]);
  t !== void 0 && p != null && l(t, ["customBaseModel"], p);
  let m = a(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const C = a(e, ["batchSize"]);
    t !== void 0 && C != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], C);
  } else if (m === "DISTILLATION") {
    const C = a(e, ["batchSize"]);
    t !== void 0 && C != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], C);
  }
  let g = a(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const C = a(e, ["learningRate"]);
    t !== void 0 && C != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], C);
  } else if (g === "DISTILLATION") {
    const C = a(e, ["learningRate"]);
    t !== void 0 && C != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], C);
  }
  const _ = a(e, ["labels"]);
  t !== void 0 && _ != null && l(t, ["labels"], _);
  const y = a(e, ["beta"]);
  t !== void 0 && y != null && l(t, [
    "preferenceOptimizationSpec",
    "hyperParameters",
    "beta"
  ], y);
  const E = a(e, ["baseTeacherModel"]);
  t !== void 0 && E != null && l(t, ["distillationSpec", "baseTeacherModel"], E);
  const A = a(e, ["tunedTeacherModelSource"]);
  t !== void 0 && A != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], A);
  const w = a(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && w != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], w);
  const P = a(e, ["outputUri"]);
  t !== void 0 && P != null && l(t, ["outputUri"], P);
  const L = a(e, ["encryptionSpec"]);
  return t !== void 0 && L != null && l(t, ["encryptionSpec"], L), o;
}
function RC(e, t) {
  const n = {}, o = a(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = a(e, ["trainingDataset"]);
  i != null && OC(i);
  const s = a(e, ["config"]);
  return s != null && IC(s, n), n;
}
function PC(e, t) {
  const n = {}, o = a(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = a(e, ["trainingDataset"]);
  i != null && GC(i, n, t);
  const s = a(e, ["config"]);
  return s != null && bC(s, n, t), n;
}
function MC(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function NC(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function xC(e, t, n) {
  const o = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), o;
}
function kC(e, t, n) {
  const o = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), o;
}
function DC(e, t) {
  const n = {}, o = a(e, ["config"]);
  return o != null && xC(o, n), n;
}
function $C(e, t) {
  const n = {}, o = a(e, ["config"]);
  return o != null && kC(o, n), n;
}
function LC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["tunedModels"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => Th(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function UC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["tuningJobs"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => us(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function FC(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["model"], o);
  const r = a(e, ["name"]);
  return r != null && l(n, ["endpoint"], r), n;
}
function OC(e, t) {
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
function GC(e, t, n) {
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
function Th(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["state"]);
  i != null && l(n, ["state"], Mf(i));
  const s = a(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const u = a(e, ["tuningTask", "startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = a(e, ["tuningTask", "completeTime"]);
  c != null && l(n, ["endTime"], c);
  const d = a(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const h = a(e, ["description"]);
  h != null && l(n, ["description"], h);
  const f = a(e, ["baseModel"]);
  f != null && l(n, ["baseModel"], f);
  const p = a(e, ["_self"]);
  return p != null && l(n, ["tunedModel"], FC(p)), n;
}
function us(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["state"]);
  i != null && l(n, ["state"], Mf(i));
  const s = a(e, ["createTime"]);
  s != null && l(n, ["createTime"], s);
  const u = a(e, ["startTime"]);
  u != null && l(n, ["startTime"], u);
  const c = a(e, ["endTime"]);
  c != null && l(n, ["endTime"], c);
  const d = a(e, ["updateTime"]);
  d != null && l(n, ["updateTime"], d);
  const h = a(e, ["error"]);
  h != null && l(n, ["error"], h);
  const f = a(e, ["description"]);
  f != null && l(n, ["description"], f);
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
  const E = a(e, ["distillationSpec"]);
  E != null && l(n, ["distillationSpec"], E);
  const A = a(e, ["tuningDataStats"]);
  A != null && l(n, ["tuningDataStats"], A);
  const w = a(e, ["encryptionSpec"]);
  w != null && l(n, ["encryptionSpec"], w);
  const P = a(e, ["partnerModelTuningSpec"]);
  P != null && l(n, ["partnerModelTuningSpec"], P);
  const L = a(e, ["customBaseModel"]);
  L != null && l(n, ["customBaseModel"], L);
  const C = a(e, ["evaluateDatasetRuns"]);
  if (C != null) {
    let Ue = C;
    Array.isArray(Ue) && (Ue = Ue.map((Fe) => Fe)), l(n, ["evaluateDatasetRuns"], Ue);
  }
  const k = a(e, ["experiment"]);
  k != null && l(n, ["experiment"], k);
  const I = a(e, ["fullFineTuningSpec"]);
  I != null && l(n, ["fullFineTuningSpec"], I);
  const N = a(e, ["labels"]);
  N != null && l(n, ["labels"], N);
  const b = a(e, ["outputUri"]);
  b != null && l(n, ["outputUri"], b);
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
  const ze = a(e, ["tuningJobMetadata"]);
  return ze != null && l(n, ["tuningJobMetadata"], ze), n;
}
function BC(e, t) {
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
function Si(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["validationDatasetUri"], o);
  const r = a(e, ["vertexDatasetResource"]);
  return r != null && l(n, ["validationDatasetUri"], r), n;
}
var qC = class extends dt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Bt(ct.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: Yi.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = NC(e);
      return s = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => us(d));
    } else {
      const c = MC(e);
      return s = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Th(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $C(e);
      return s = x("tuningJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = UC(d), f = new ku();
        return Object.assign(f, h), f;
      });
    } else {
      const c = DC(e);
      return s = x("tunedModels", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = LC(d), f = new ku();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = EC(e);
      return s = x("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = wC(d), f = new Du();
        return Object.assign(f, h), f;
      });
    } else {
      const c = SC(e);
      return s = x("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = CC(d), f = new Du();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = PC(e, e);
      return r = x("tuningJobs", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => us(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = RC(e);
      return r = x("tunedModels", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => BC(u));
    }
  }
}, HC = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, VC = 1024 * 1024 * 8, JC = 3, KC = 1e3, WC = 2, Ir = "x-goog-upload-status";
async function zC(e, t, n, o) {
  var r;
  const i = await Sh(e, t, n, o), s = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[Ir]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return s.file;
}
async function YC(e, t, n, o) {
  var r;
  const i = await Sh(e, t, n, o), s = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[Ir]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = Tf(s), c = new uy();
  return Object.assign(c, u), c;
}
async function Sh(e, t, n, o) {
  var r, i, s;
  let u = t;
  const c = o?.baseUrl || ((r = n.clientOptions.httpOptions) === null || r === void 0 ? void 0 : r.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, h = 0, f = new Qi(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(VC, d - h), g = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, y = KC;
    for (; _ < JC; ) {
      const E = Object.assign(Object.assign({}, o?.headers || {}), {
        "X-Goog-Upload-Command": p,
        "X-Goog-Upload-Offset": String(h),
        "Content-Length": String(m)
      });
      if (f = await n.request({
        path: "",
        body: g,
        httpMethod: "POST",
        httpOptions: Object.assign(Object.assign({}, o), {
          apiVersion: "",
          baseUrl: u,
          headers: E
        })
      }), !((i = f?.headers) === null || i === void 0) && i[Ir]) break;
      _++, await QC(y), y = y * WC;
    }
    if (h += m, ((s = f?.headers) === null || s === void 0 ? void 0 : s[Ir]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function XC(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function QC(e) {
  return new Promise((t) => setTimeout(t, e));
}
var ZC = class {
  async upload(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await zC(e, t, n, o);
  }
  async uploadToFileSearchStore(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await YC(e, t, n, o);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await XC(e);
  }
}, jC = class {
  create(e, t, n) {
    return new ew(e, t, n);
  }
}, ew = class {
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
}, uc = "x-goog-api-key", tw = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(uc) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(uc, this.apiKey);
    }
  }
}, nw = class {
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
    const n = x_(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const o = new tw(this.apiKey);
    this.apiClient = new QS({
      auth: o,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new ZC(),
      downloader: new HC()
    }), this.models = new _E(this.apiClient), this.live = new dE(this.apiClient, o, new jC()), this.batches = new fv(this.apiClient), this.chats = new Xv(this.models, this.apiClient), this.caches = new Wv(this.apiClient), this.files = new lA(this.apiClient), this.operations = new yE(this.apiClient), this.authTokens = new LE(this.apiClient), this.tunings = new qC(this.apiClient), this.fileSearchStores = new VE(this.apiClient);
  }
};
function cc(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function br(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Lt(e) {
  return { text: String(e || "") };
}
function ow(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function rw(e) {
  if (typeof e == "string") return [Lt(e)];
  if (!Array.isArray(e)) return [Lt("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? Lt(n.text || "") : n.type === "image_url" && n.image_url?.url ? ow(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [Lt("")];
}
function dc() {
  return {
    role: "user",
    parts: [Lt("")]
  };
}
function Eo(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = br(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function iw(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function sw(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function fc(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const o = String(e.functionCall.id || "").trim();
  return o ? `id:${o}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function aw(e, t) {
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
function lw(e = [], t = "") {
  const n = e.map((h) => Eo(h, "model")).filter(Boolean);
  if (!n.length) return null;
  const o = [...n].reverse().find((h) => iw(h)) || null, r = [...n].reverse().find((h) => sw(h)) || null, i = o || r || n[n.length - 1], s = n.indexOf(i), u = br(i);
  if (!u?.parts?.length) return n[n.length - 1];
  if (r) {
    const h = /* @__PURE__ */ new Map(), f = [];
    n.forEach((m, g) => {
      m.parts.forEach((_, y) => {
        const E = fc(_, y, g);
        if (!E) return;
        h.has(E) || f.push(E);
        const A = h.get(E);
        A ? h.set(E, aw(A, _)) : h.set(E, br(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((m, g) => {
      const _ = fc(m, g, s);
      return _ ? (p.add(_), h.get(_) || m) : m;
    }), f.forEach((m) => {
      p.has(m) || (u.parts.push(h.get(m)), p.add(m));
    });
  }
  const c = String(t || ""), d = u.parts.filter((h) => !(typeof h?.text == "string" && !h?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function hc(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((o) => !o?.thought && typeof o?.text == "string" && o.text).map((o) => o.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function Eh(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((o) => o?.functionCall || o).filter((o) => o && o.name);
  return t.length ? t : n;
}
function Ch(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function pc(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function uw(e, t) {
  const n = pc(e), o = pc(t);
  return n && o ? JSON.stringify({
    ...n,
    ...o
  }) : String(t || "").trim() || String(e || "{}");
}
function cw(e, t = "google-tool") {
  return Eh(e).map((n, o) => {
    const r = String(n.id || "").trim();
    return {
      id: r || `${t}-${o + 1}`,
      name: n.name || "",
      arguments: Ch(n),
      ...r ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function dw(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let o = 0;
  function r(s, u, c, d) {
    return s.name = String(u.name || s.name || "").trim(), s.arguments = uw(s.arguments, d), c && (n.set(c, s), s.id !== c ? s.providerId = c : delete s.providerId), s;
  }
  function i(s) {
    return Eh(s).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), h = Ch(u);
      let f = d ? n.get(d) : null;
      f ? r(f, u, d, h) : (f = {
        id: d || `${e}-${++o}`,
        name: c,
        arguments: h,
        ...d ? {} : { providerId: "" }
      }, t.push(f)), d && n.set(d, f);
    }), t.map((u) => ({ ...u }));
  }
  return { append: i };
}
function fw(e = []) {
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
function hw(e) {
  switch (e) {
    case "minimal":
      return tn.MINIMAL;
    case "high":
      return tn.HIGH;
    case "medium":
      return tn.MEDIUM;
    default:
      return tn.LOW;
  }
}
function mc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function pw(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function mw(e) {
  const t = e?.providerPayload?.googleContent;
  return Eo(t, "model");
}
function gw(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = mw(e);
    return n ? [n] : [];
  }
  return t.map((n) => Eo(n, "model")).filter(Boolean);
}
function sa(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => Eo(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function _w(e) {
  const t = e?.candidates?.[0]?.content;
  return sa(t ? [t] : []);
}
function yw(e) {
  return sa(e ? [e] : []);
}
function wh(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? br(e.history) || [] : [];
}
function vw(e, t = 0) {
  return wh(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => Eo(n, "model")).filter(Boolean);
}
function Aw(e) {
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
        const h = r[d], f = String(h.tool_call_id || "").trim(), p = n.has(f) ? n.get(f) : f;
        c.push({ functionResponse: {
          ...p ? { id: p } : {},
          name: String(h.toolName || h.tool_name || "").trim() || t.get(f) || "tool_result",
          response: cc(h.content)
        } }), d += 1;
      }
      o.push({
        role: "user",
        parts: c
      }), s = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = gw(u);
      if (c.length) {
        o.push(...c);
        continue;
      }
    }
    if (u.role === "assistant" && Array.isArray(u.tool_calls) && u.tool_calls.length) {
      o.push({
        role: "model",
        parts: [...u.content ? [Lt(u.content)] : [], ...u.tool_calls.map((c) => ({ functionCall: {
          ...(() => {
            const d = Object.prototype.hasOwnProperty.call(c, "providerToolCallId") ? String(c.providerToolCallId || "").trim() : String(c.id || "").trim();
            return d ? { id: d } : {};
          })(),
          name: c.function.name,
          args: cc(c.function.arguments)
        } }))]
      });
      continue;
    }
    o.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: rw(u.content)
    });
  }
  if (!o.length) return {
    history: [],
    latestMessage: dc().parts
  };
  const i = o[o.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: o.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: o,
    latestMessage: dc().parts
  };
}
function Tw(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function gc(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var Sw = class {
  constructor(e) {
    this.config = e, this.auth = Gr("google", e.apiKey), this.supportsSessionToolLoop = !0, this.activeChat = null, this.sessionReasoning = null, this.toolCallResponseSequence = 0, this.client = new nw({
      ...this.auth.sdkOptions,
      httpOptions: {
        headers: this.auth.headers,
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e, t = j("google", this.config, e.reasoning)) {
    const n = t, o = Aw(e.messages), r = Array.isArray(e.tools) ? e.tools : [], i = pw(e), s = {
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
      thinkingLevel: hw(n.effort)
    } : z(n) && (s.thinkingConfig = { includeThoughts: !0 }), r.length && (s.tools = [{ functionDeclarations: r.map((u) => ({
      name: u.function.name,
      description: u.function.description,
      parameters: u.function.parameters
    })) }]), r.length) {
      const u = String(e.toolChoice || "auto").trim();
      s.toolConfig = { functionCallingConfig: u === "none" ? { mode: en.NONE } : u === "auto" ? { mode: en.AUTO } : u === "required" ? { mode: en.ANY } : {
        mode: en.ANY,
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
      effectiveConfig: Ct(e, {
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
      effectiveConfig: Ct(t, {
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
    const c = `google-tool-${++this.toolCallResponseSequence}`, d = dw(c);
    let h = null;
    const f = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, p = {
      ...t,
      ...f ? { config: f } : {}
    }, m = typeof n.onStreamProgress == "function";
    let g;
    const _ = wh(e).length;
    if (m) {
      const A = await e.sendMessageStream(p), w = /* @__PURE__ */ new Map();
      let P = "", L = null;
      const C = [];
      for await (const k of A) {
        L = k, k?.candidates?.[0]?.finishReason && (g = k.candidates[0].finishReason);
        const I = k?.candidates?.[0]?.content;
        I?.parts?.length && C.push(I), z(o) && mc(k).forEach((b, F) => {
          const X = `${b.label}:${F}`;
          w.set(X, gc(w.get(X) || "", b.text));
        }), u = d.append(k);
        const N = hc(k);
        P = gc(P, N), Tw(n, {
          text: P,
          thoughts: Array.from(w.values()).filter(Boolean).map((b, F) => ({
            label: `思考块 ${F + 1}`,
            text: b
          })),
          ...u.length ? {
            toolCalls: u,
            toolCallDraft: !0
          } : {}
        });
      }
      r = {
        ...L || {},
        functionCalls: u
      }, h = lw(C, P) || r?.candidates?.[0]?.content || null, i = Array.from(w.values()).filter(Boolean).map((k, I) => ({
        label: `思考块 ${I + 1}`,
        text: k
      })), s = P;
    } else
      r = await e.sendMessage(p), g = r?.candidates?.[0]?.finishReason, i = z(o) ? mc(r) : [], s = hc(r);
    const y = m ? u : cw(r, c), E = vw(e, _);
    return {
      text: s,
      toolCalls: y,
      thoughts: i,
      finishReason: at("google", g, !1, s),
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: sa(E) || yw(h) || _w(r)
    };
  }
  async chat(e) {
    const t = j("google", this.config, e.reasoning), n = (Array.isArray(e.toolResponses) && e.toolResponses.length || String(e.finalAnswerReminderText || "").trim()) && this.sessionReasoning ? this.sessionReasoning : t;
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const i = { message: fw(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, i, e, n),
        requestInspection: this.inspectSendRequest(i, e, n)
      };
    }
    const o = String(e.finalAnswerReminderText || "").trim();
    if (o) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const i = { message: [Lt(o)] };
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
var Ih = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Ih = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function cs(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ds = (e) => {
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
}, de = class fs extends O {
  constructor(t, n, o, r) {
    super(`${fs.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new Yr({
      message: o,
      cause: ds(n)
    });
    const i = n?.error;
    return t === 400 ? new bh(t, i, o, r) : t === 401 ? new Rh(t, i, o, r) : t === 403 ? new Ph(t, i, o, r) : t === 404 ? new Mh(t, i, o, r) : t === 409 ? new Nh(t, i, o, r) : t === 422 ? new xh(t, i, o, r) : t === 429 ? new kh(t, i, o, r) : t >= 500 ? new Dh(t, i, o, r) : new fs(t, i, o, r);
  }
}, ke = class extends de {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Yr = class extends de {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, aa = class extends Yr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, bh = class extends de {
}, Rh = class extends de {
}, Ph = class extends de {
}, Mh = class extends de {
}, Nh = class extends de {
}, xh = class extends de {
}, kh = class extends de {
}, Dh = class extends de {
}, $h = class extends O {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, Lh = class extends O {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Kn = class extends Error {
  constructor(e) {
    super(e);
  }
}, Uh = class extends de {
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
}, Ew = class extends O {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, Cw = /^[a-z][a-z0-9+.-]*:/i, ww = (e) => Cw.test(e), ye = (e) => (ye = Array.isArray, ye(e)), _c = ye;
function la(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function yc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Iw(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Ei(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var bw = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new O(`${e} must be an integer`);
  if (t < 0) throw new O(`${e} must be a positive integer`);
  return t;
}, Rw = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Co = (e) => new Promise((t) => setTimeout(t, e)), Xt = "6.44.0", Pw = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Mw() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Nw = () => {
  const e = Mw();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Xt,
    "X-Stainless-OS": Ac(Deno.build.os),
    "X-Stainless-Arch": vc(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Xt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Xt,
    "X-Stainless-OS": Ac(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": vc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = xw();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Xt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Xt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function xw() {
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
var vc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Ac = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Tc, kw = () => Tc ?? (Tc = Nw());
function Fh() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Oh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Gh(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Oh({
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
function Bh(e) {
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
async function Sc(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Dw = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), qh = "RFC3986", Hh = (e) => String(e), Ec = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Hh
};
var hs = (e, t) => (hs = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), hs(e, t)), Ye = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), Ci = 1024, $w = (e, t, n, o, r) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let s = "";
  for (let u = 0; u < i.length; u += Ci) {
    const c = i.length >= Ci ? i.slice(u, u + Ci) : i, d = [];
    for (let h = 0; h < c.length; ++h) {
      let f = c.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || r === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(h);
        continue;
      }
      if (f < 128) {
        d[d.length] = Ye[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = Ye[192 | f >> 6] + Ye[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = Ye[224 | f >> 12] + Ye[128 | f >> 6 & 63] + Ye[128 | f & 63];
        continue;
      }
      h += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(h) & 1023), d[d.length] = Ye[240 | f >> 18] + Ye[128 | f >> 12 & 63] + Ye[128 | f >> 6 & 63] + Ye[128 | f & 63];
    }
    s += d.join("");
  }
  return s;
};
function Lw(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function Cc(e, t) {
  if (ye(e)) {
    const n = [];
    for (let o = 0; o < e.length; o += 1) n.push(t(e[o]));
    return n;
  }
  return t(e);
}
var Vh = {
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
}, Jh = function(e, t) {
  Array.prototype.push.apply(e, ye(t) ? t : [t]);
}, wc, oe = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: $w,
  encodeValuesOnly: !1,
  format: qh,
  formatter: Hh,
  indices: !1,
  serializeDate(e) {
    return (wc ?? (wc = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function Uw(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var wi = {};
function Kh(e, t, n, o, r, i, s, u, c, d, h, f, p, m, g, _, y, E) {
  let A = e, w = E, P = 0, L = !1;
  for (; (w = w.get(wi)) !== void 0 && !L; ) {
    const b = w.get(e);
    if (P += 1, typeof b < "u") {
      if (b === P) throw new RangeError("Cyclic object value");
      L = !0;
    }
    typeof w.get(wi) > "u" && (P = 0);
  }
  if (typeof d == "function" ? A = d(t, A) : A instanceof Date ? A = p?.(A) : n === "comma" && ye(A) && (A = Cc(A, function(b) {
    return b instanceof Date ? p?.(b) : b;
  })), A === null) {
    if (i) return c && !_ ? c(t, oe.encoder, y, "key", m) : t;
    A = "";
  }
  if (Uw(A) || Lw(A)) {
    if (c) {
      const b = _ ? t : c(t, oe.encoder, y, "key", m);
      return [g?.(b) + "=" + g?.(c(A, oe.encoder, y, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(A))];
  }
  const C = [];
  if (typeof A > "u") return C;
  let k;
  if (n === "comma" && ye(A))
    _ && c && (A = Cc(A, c)), k = [{ value: A.length > 0 ? A.join(",") || null : void 0 }];
  else if (ye(d)) k = d;
  else {
    const b = Object.keys(A);
    k = h ? b.sort(h) : b;
  }
  const I = u ? String(t).replace(/\./g, "%2E") : String(t), N = o && ye(A) && A.length === 1 ? I + "[]" : I;
  if (r && ye(A) && A.length === 0) return N + "[]";
  for (let b = 0; b < k.length; ++b) {
    const F = k[b], X = typeof F == "object" && typeof F.value < "u" ? F.value : A[F];
    if (s && X === null) continue;
    const J = f && u ? F.replace(/\./g, "%2E") : F, V = ye(A) ? typeof n == "function" ? n(N, J) : N : N + (f ? "." + J : "[" + J + "]");
    E.set(e, P);
    const W = /* @__PURE__ */ new WeakMap();
    W.set(wi, E), Jh(C, Kh(X, V, n, o, r, i, s, u, n === "comma" && _ && ye(A) ? null : c, d, h, f, p, m, g, _, y, W));
  }
  return C;
}
function Fw(e = oe) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || oe.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = qh;
  if (typeof e.format < "u") {
    if (!hs(Ec, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const o = Ec[n];
  let r = oe.filter;
  (typeof e.filter == "function" || ye(e.filter)) && (r = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in Vh ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = oe.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
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
function Ow(e, t = {}) {
  let n = e;
  const o = Fw(t);
  let r, i;
  typeof o.filter == "function" ? (i = o.filter, n = i("", n)) : ye(o.filter) && (i = o.filter, r = i);
  const s = [];
  if (typeof n != "object" || n === null) return "";
  const u = Vh[o.arrayFormat], c = u === "comma" && o.commaRoundTrip;
  r || (r = Object.keys(n)), o.sort && r.sort(o.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < r.length; ++p) {
    const m = r[p];
    o.skipNulls && n[m] === null || Jh(s, Kh(n[m], m, u, c, o.allowEmptyArrays, o.strictNullHandling, o.skipNulls, o.encodeDotInKeys, o.encode ? o.encoder : null, o.filter, o.sort, o.allowDots, o.serializeDate, o.format, o.formatter, o.encodeValuesOnly, o.charset, d));
  }
  const h = s.join(o.delimiter);
  let f = o.addQueryPrefix === !0 ? "?" : "";
  return o.charsetSentinel && (o.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function Gw(e) {
  return Ow(e, { arrayFormat: "brackets" });
}
function Bw(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Ic;
function ua(e) {
  let t;
  return (Ic ?? (t = new globalThis.TextEncoder(), Ic = t.encode.bind(t)))(e);
}
var bc;
function Rc(e) {
  let t;
  return (bc ?? (t = new globalThis.TextDecoder(), bc = t.decode.bind(t)))(e);
}
var Ce, we, Xr = class {
  constructor() {
    Ce.set(this, void 0), we.set(this, void 0), G(this, Ce, new Uint8Array(), "f"), G(this, we, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ua(e) : e;
    G(this, Ce, Bw([S(this, Ce, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = qw(S(this, Ce, "f"), S(this, we, "f"))) != null; ) {
      if (o.carriage && S(this, we, "f") == null) {
        G(this, we, o.index, "f");
        continue;
      }
      if (S(this, we, "f") != null && (o.index !== S(this, we, "f") + 1 || o.carriage)) {
        n.push(Rc(S(this, Ce, "f").subarray(0, S(this, we, "f") - 1))), G(this, Ce, S(this, Ce, "f").subarray(S(this, we, "f")), "f"), G(this, we, null, "f");
        continue;
      }
      const r = S(this, we, "f") !== null ? o.preceding - 1 : o.preceding, i = Rc(S(this, Ce, "f").subarray(0, r));
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
Xr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Xr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function qw(e, t) {
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
function Hw(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var Rr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Pc = (e, t, n) => {
  if (e) {
    if (Iw(Rr, e)) return e;
    ae(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Rr))}`);
  }
};
function Wn() {
}
function Xo(e, t, n) {
  return !t || Rr[e] > Rr[n] ? Wn : t[e].bind(t);
}
var Vw = {
  error: Wn,
  warn: Wn,
  info: Wn,
  debug: Wn
}, Mc = /* @__PURE__ */ new WeakMap();
function ae(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Vw;
  const o = Mc.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: Xo("error", t, n),
    warn: Xo("warn", t, n),
    info: Xo("info", t, n),
    debug: Xo("debug", t, n)
  };
  return Mc.set(t, [n, r]), r;
}
var xt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Un, fo = class zn {
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
        for await (const d of Jw(t, n))
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
                throw s.error("Could not parse message into JSON:", d.data), s.error("From chunk:", d.raw), f;
              }
              if (h && h.error) throw new de(void 0, h.error, void 0, t.headers);
              yield r ? {
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
              if (d.event == "error") throw new de(void 0, h.error, h.message, void 0);
              yield {
                event: d.event,
                data: h
              };
            }
          }
        c = !0;
      } catch (d) {
        if (cs(d)) return;
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
      const u = new Xr(), c = Bh(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
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
        if (cs(c)) return;
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
    return Oh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const s = ua(JSON.stringify(r) + `
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
async function* Jw(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new O("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new O("Attempted to iterate over a response with no body");
  const n = new Ww(), o = new Xr(), r = Bh(e.body);
  for await (const i of Kw(r)) for (const s of o.decode(i)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const s = n.decode(i);
    s && (yield s);
  }
}
async function* Kw(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? ua(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = Hw(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Ww = class {
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
    let [t, n, o] = zw(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function zw(e, t) {
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
async function Wh(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, s = await (async () => {
    if (t.options.stream)
      return ae(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : fo.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : zh(await n.json(), n) : await n.text();
  })();
  return ae(e).debug(`[${o}] response parsed`, xt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
function zh(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Yn, Yh = class Xh extends Promise {
  constructor(t, n, o = Wh) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, Yn.set(this, void 0), G(this, Yn, t, "f");
  }
  _thenUnwrap(t) {
    return new Xh(S(this, Yn, "f"), this.responsePromise, async (n, o) => zh(t(await this.parseResponse(n, o), o), o.response));
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
var Qo, Qr = class {
  constructor(e, t, n, o) {
    Qo.set(this, void 0), G(this, Qo, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new O("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await S(this, Qo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Qo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Yw = class extends Yh {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await Wh(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, wt = class extends Qr {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, Q = class extends Qr {
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
        ...la(this.options.query),
        after: t
      }
    } : null;
  }
}, ce = class extends Qr {
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
        ...la(this.options.query),
        after: e
      }
    } : null;
  }
}, ht = class extends Qr {
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
        ...la(this.options.query),
        after: e
      }
    } : null;
  }
}, Xw = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, Qw = "urn:ietf:params:oauth:grant-type:token-exchange", Zw = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Fh();
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
      grant_type: Qw,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: Xw[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new Uh(t.status, s, t.headers) : de.generate(t.status, s, `Token exchange failed with status ${t.status}`, t.headers);
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
}, Qh = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function oo(e, t, n) {
  return Qh(), new File(e, t ?? "unknown_file", n);
}
function ur(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var ca = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Zr = async (e, t) => ps(e.body) ? {
  ...e,
  body: await Zh(e.body, t)
} : e, Qe = async (e, t) => ({
  ...e,
  body: await Zh(e.body, t)
}), Nc = /* @__PURE__ */ new WeakMap();
function jw(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Nc.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return Nc.set(t, o), o;
}
var Zh = async (e, t) => {
  if (!await jw(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, r]) => ms(n, o, r))), n;
}, jh = (e) => e instanceof Blob && "name" in e, eI = (e) => typeof e == "object" && e !== null && (e instanceof Response || ca(e) || jh(e)), ps = (e) => {
  if (eI(e)) return !0;
  if (Array.isArray(e)) return e.some(ps);
  if (e && typeof e == "object") {
    for (const t in e) if (ps(e[t])) return !0;
  }
  return !1;
}, ms = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, oo([await n.blob()], ur(n)));
    else if (ca(n)) e.append(t, oo([await new Response(Gh(n)).blob()], ur(n)));
    else if (jh(n)) e.append(t, n, ur(n));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => ms(e, t + "[]", o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, r]) => ms(e, `${t}[${o}]`, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, ep = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", tI = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && ep(e), nI = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function oI(e, t, n) {
  if (Qh(), e = await e, tI(e))
    return e instanceof File ? e : oo([await e.arrayBuffer()], e.name);
  if (nI(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), oo(await gs(r), t, n);
  }
  const o = await gs(e);
  if (t || (t = ur(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return oo(o, t, n);
}
async function gs(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (ep(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (ca(e)) for await (const n of e) t.push(...await gs(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${rI(e)}`);
  }
  return t;
}
function rI(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var M = class {
  constructor(e) {
    this._client = e;
  }
};
function tp(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var xc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), iI = (e = tp) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], s = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? xc) ?? xc)?.toString) && (g = m + "", i.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === o.length ? "" : g);
  }, ""), u = s.split(/[?#]/, 1)[0], c = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
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
${s}
${f}`);
  }
  return s;
}, v = /* @__PURE__ */ iI(tp), np = class extends M {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/chat/completions/${e}/messages`, Q, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function Pr(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function da(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function wo(e) {
  return e?.$brand === "auto-parseable-tool";
}
function sI(e, t) {
  return !t || !op(t) ? {
    ...e,
    choices: e.choices.map((n) => (rp(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : fa(e, t);
}
function fa(e, t) {
  const n = e.choices.map((o) => {
    if (o.finish_reason === "length") throw new $h();
    if (o.finish_reason === "content_filter") throw new Lh();
    return rp(o.message.tool_calls), {
      ...o,
      message: {
        ...o.message,
        ...o.message.tool_calls ? { tool_calls: o.message.tool_calls?.map((r) => lI(t, r)) ?? void 0 } : void 0,
        parsed: o.message.content && !o.message.refusal ? aI(t, o.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function aI(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function lI(e, t) {
  const n = e.tools?.find((o) => Pr(o) && o.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: wo(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function uI(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((o) => Pr(o) && o.function?.name === t.function.name);
  return Pr(n) && (wo(n) || n?.function.strict || !1);
}
function op(e) {
  return da(e.response_format) ? !0 : e.tools?.some((t) => wo(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function rp(e) {
  for (const t of e || []) if (t.type !== "function") throw new O(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function cI(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new O(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new O(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Mr = (e) => e?.role === "assistant", ip = (e) => e?.role === "tool", _s, cr, dr, Xn, Qn, fr, Zn, nt, jn, Nr, xr, Qt, sp, ha = class {
  constructor() {
    _s.add(this), this.controller = new AbortController(), cr.set(this, void 0), dr.set(this, () => {
    }), Xn.set(this, () => {
    }), Qn.set(this, void 0), fr.set(this, () => {
    }), Zn.set(this, () => {
    }), nt.set(this, {}), jn.set(this, !1), Nr.set(this, !1), xr.set(this, !1), Qt.set(this, !1), G(this, cr, new Promise((e, t) => {
      G(this, dr, e, "f"), G(this, Xn, t, "f");
    }), "f"), G(this, Qn, new Promise((e, t) => {
      G(this, fr, e, "f"), G(this, Zn, t, "f");
    }), "f"), S(this, cr, "f").catch(() => {
    }), S(this, Qn, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, S(this, _s, "m", sp).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (S(this, dr, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return S(this, jn, "f");
  }
  get errored() {
    return S(this, Nr, "f");
  }
  get aborted() {
    return S(this, xr, "f");
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
      G(this, Qt, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    G(this, Qt, !0, "f"), await S(this, Qn, "f");
  }
  _emit(e, ...t) {
    if (S(this, jn, "f")) return;
    e === "end" && (G(this, jn, !0, "f"), S(this, fr, "f").call(this));
    const n = S(this, nt, "f")[e];
    if (n && (S(this, nt, "f")[e] = n.filter((o) => !o.once), n.forEach(({ listener: o }) => o(...t))), e === "abort") {
      const o = t[0];
      !S(this, Qt, "f") && !n?.length && Promise.reject(o), S(this, Xn, "f").call(this, o), S(this, Zn, "f").call(this, o), this._emit("end");
      return;
    }
    if (e === "error") {
      const o = t[0];
      !S(this, Qt, "f") && !n?.length && Promise.reject(o), S(this, Xn, "f").call(this, o), S(this, Zn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
cr = /* @__PURE__ */ new WeakMap(), dr = /* @__PURE__ */ new WeakMap(), Xn = /* @__PURE__ */ new WeakMap(), Qn = /* @__PURE__ */ new WeakMap(), fr = /* @__PURE__ */ new WeakMap(), Zn = /* @__PURE__ */ new WeakMap(), nt = /* @__PURE__ */ new WeakMap(), jn = /* @__PURE__ */ new WeakMap(), Nr = /* @__PURE__ */ new WeakMap(), xr = /* @__PURE__ */ new WeakMap(), Qt = /* @__PURE__ */ new WeakMap(), _s = /* @__PURE__ */ new WeakSet(), sp = function(t) {
  if (G(this, Nr, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new ke()), t instanceof ke)
    return G(this, xr, !0, "f"), this._emit("abort", t);
  if (t instanceof O) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new O(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new O(String(t)));
};
function dI(e) {
  return typeof e.parse == "function";
}
var fe, ys, kr, vs, As, Ts, ap, lp, fI = 10, up = class extends ha {
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
      if (this._emit("message", e), ip(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (Mr(e) && e.tool_calls)
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
    return await this.done(), S(this, fe, "m", ys).call(this);
  }
  async finalMessage() {
    return await this.done(), S(this, fe, "m", kr).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), S(this, fe, "m", vs).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), S(this, fe, "m", As).call(this);
  }
  async totalUsage() {
    return await this.done(), S(this, fe, "m", Ts).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = S(this, fe, "m", kr).call(this);
    t && this._emit("finalMessage", t);
    const n = S(this, fe, "m", ys).call(this);
    n && this._emit("finalContent", n);
    const o = S(this, fe, "m", vs).call(this);
    o && this._emit("finalFunctionToolCall", o);
    const r = S(this, fe, "m", As).call(this);
    r != null && this._emit("finalFunctionToolCallResult", r), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", S(this, fe, "m", Ts).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), S(this, fe, "m", ap).call(this, t);
    const r = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(fa(r, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const o of t.messages) this._addMessage(o, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const o = "tool", { tool_choice: r = "auto", stream: i, ...s } = t, u = typeof r != "string" && r.type === "function" && r?.function?.name, { maxChatCompletions: c = fI } = n || {}, d = t.tools.map((p) => {
      if (wo(p)) {
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
        ...s,
        tool_choice: r,
        tools: f,
        messages: [...this.messages]
      }, n)).choices[0]?.message;
      if (!m) throw new O("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const _ = g.id, { name: y, arguments: E } = g.function, A = h[y];
        if (A) {
          if (u && u !== y) {
            const C = `Invalid tool_call: ${JSON.stringify(y)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: o,
              tool_call_id: _,
              content: C
            });
            continue;
          }
        } else {
          const C = `Invalid tool_call: ${JSON.stringify(y)}. Available options are: ${Object.keys(h).map((k) => JSON.stringify(k)).join(", ")}. Please try again`;
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: C
          });
          continue;
        }
        let w;
        try {
          w = dI(A) ? await A.parse(E) : E;
        } catch (C) {
          const k = C instanceof Error ? C.message : String(C);
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: k
          });
          continue;
        }
        const P = await A.function(w, this), L = S(this, fe, "m", lp).call(this, P);
        if (this._addMessage({
          role: o,
          tool_call_id: _,
          content: L
        }), u) return;
      }
    }
  }
};
fe = /* @__PURE__ */ new WeakSet(), ys = function() {
  return S(this, fe, "m", kr).call(this).content ?? null;
}, kr = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (Mr(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new O("stream ended without producing a ChatCompletionMessage with role=assistant");
}, vs = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Mr(n) && n?.tool_calls?.length) for (let o = n.tool_calls.length - 1; o >= 0; o--) {
      const r = n.tool_calls[o];
      if (r?.type === "function") return r.function;
    }
  }
}, As = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (ip(n) && n.content != null && typeof n.content == "string" && this.messages.some((o) => o.role === "assistant" && o.tool_calls?.some((r) => r.type === "function" && r.id === n.tool_call_id))) return n.content;
  }
}, Ts = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, ap = function(t) {
  if (t.n != null && t.n > 1) throw new O("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, lp = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var hI = class cp extends up {
  static runTools(t, n, o) {
    const r = new cp(), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), Mr(t) && t.content && this._emit("content", t.content);
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
}, pI = class extends Error {
}, mI = class extends Error {
};
function gI(e, t = ie.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return _I(e.trim(), t);
}
var _I = (e, t) => {
  const n = e.length;
  let o = 0;
  const r = (p) => {
    throw new pI(`${p} at position ${o}`);
  }, i = (p) => {
    throw new mI(`${p} at position ${o}`);
  }, s = () => (f(), o >= n && r("Unexpected end of input"), e[o] === '"' ? u() : e[o] === "{" ? c() : e[o] === "[" ? d() : e.substring(o, o + 4) === "null" || ie.NULL & t && n - o < 4 && "null".startsWith(e.substring(o)) ? (o += 4, null) : e.substring(o, o + 4) === "true" || ie.BOOL & t && n - o < 4 && "true".startsWith(e.substring(o)) ? (o += 4, !0) : e.substring(o, o + 5) === "false" || ie.BOOL & t && n - o < 5 && "false".startsWith(e.substring(o)) ? (o += 5, !1) : e.substring(o, o + 8) === "Infinity" || ie.INFINITY & t && n - o < 8 && "Infinity".startsWith(e.substring(o)) ? (o += 8, 1 / 0) : e.substring(o, o + 9) === "-Infinity" || ie.MINUS_INFINITY & t && 1 < n - o && n - o < 9 && "-Infinity".startsWith(e.substring(o)) ? (o += 9, -1 / 0) : e.substring(o, o + 3) === "NaN" || ie.NAN & t && n - o < 3 && "NaN".startsWith(e.substring(o)) ? (o += 3, NaN) : h()), u = () => {
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
    o++, f();
    const p = {};
    try {
      for (; e[o] !== "}"; ) {
        if (f(), o >= n && ie.OBJ & t) return p;
        const m = u();
        f(), o++;
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
        f(), e[o] === "," && o++;
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
        p.push(s()), f(), e[o] === "," && o++;
    } catch {
      if (ie.ARR & t) return p;
      r("Expected ']' at end of array");
    }
    return o++, p;
  }, h = () => {
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
  }, f = () => {
    for (; o < n && [
      32,
      10,
      13,
      9
    ].includes(e.charCodeAt(o)); ) o++;
  };
  return s();
}, kc = (e) => gI(e, ie.ALL ^ ie.NUM), te, tt, Kt, _t, Ii, Zo, bi, Ri, Pi, jo, Mi, Dc, dp = class Ss extends up {
  constructor(t) {
    super(), te.add(this), tt.set(this, void 0), Kt.set(this, void 0), _t.set(this, void 0), G(this, tt, t, "f"), G(this, Kt, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return S(this, _t, "f");
  }
  static fromReadableStream(t) {
    const n = new Ss(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, o) {
    const r = new Ss(n);
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
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), S(this, te, "m", Ii).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const s of i) S(this, te, "m", bi).call(this, s);
    if (i.controller.signal?.aborted) throw new ke();
    return this._addChatCompletion(S(this, te, "m", jo).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), S(this, te, "m", Ii).call(this), this._connected();
    const r = fo.fromReadableStream(t, this.controller);
    let i;
    for await (const s of r)
      i && i !== s.id && this._addChatCompletion(S(this, te, "m", jo).call(this)), S(this, te, "m", bi).call(this, s), i = s.id;
    if (r.controller.signal?.aborted) throw new ke();
    return this._addChatCompletion(S(this, te, "m", jo).call(this));
  }
  [(tt = /* @__PURE__ */ new WeakMap(), Kt = /* @__PURE__ */ new WeakMap(), _t = /* @__PURE__ */ new WeakMap(), te = /* @__PURE__ */ new WeakSet(), Ii = function() {
    this.ended || G(this, _t, void 0, "f");
  }, Zo = function(n) {
    let o = S(this, Kt, "f")[n.index];
    return o || (o = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, S(this, Kt, "f")[n.index] = o, o);
  }, bi = function(n) {
    if (this.ended) return;
    const o = S(this, te, "m", Dc).call(this, n);
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
      const s = S(this, te, "m", Zo).call(this, i);
      i.finish_reason && (S(this, te, "m", Pi).call(this, i), s.current_tool_call_index != null && S(this, te, "m", Ri).call(this, i, s.current_tool_call_index));
      for (const u of r.delta.tool_calls ?? [])
        s.current_tool_call_index !== u.index && (S(this, te, "m", Pi).call(this, i), s.current_tool_call_index != null && S(this, te, "m", Ri).call(this, i, s.current_tool_call_index)), s.current_tool_call_index = u.index;
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
  }, Ri = function(n, o) {
    if (S(this, te, "m", Zo).call(this, n).done_tool_calls.has(o)) return;
    const r = n.message.tool_calls?.[o];
    if (!r) throw new Error("no tool call snapshot");
    if (!r.type) throw new Error("tool call snapshot missing `type`");
    if (r.type === "function") {
      const i = S(this, tt, "f")?.tools?.find((s) => Pr(s) && s.function.name === r.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: r.function.name,
        index: o,
        arguments: r.function.arguments,
        parsed_arguments: wo(i) ? i.$parseRaw(r.function.arguments) : i?.function.strict ? JSON.parse(r.function.arguments) : null
      });
    } else r.type;
  }, Pi = function(n) {
    const o = S(this, te, "m", Zo).call(this, n);
    if (n.message.content && !o.content_done) {
      o.content_done = !0;
      const r = S(this, te, "m", Mi).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: r ? r.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !o.refusal_done && (o.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !o.logprobs_content_done && (o.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !o.logprobs_refusal_done && (o.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, jo = function() {
    if (this.ended) throw new O("stream has ended, this shouldn't happen");
    const n = S(this, _t, "f");
    if (!n) throw new O("request ended without sending any chunks");
    return G(this, _t, void 0, "f"), G(this, Kt, [], "f"), yI(n, S(this, tt, "f"));
  }, Mi = function() {
    const n = S(this, tt, "f")?.response_format;
    return da(n) ? n : null;
  }, Dc = function(n) {
    var o, r, i, s;
    let u = S(this, _t, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = G(this, _t, {
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
        const { content: C, refusal: k, ...I } = m;
        Object.assign(_.logprobs, I), C && ((o = _.logprobs).content ?? (o.content = []), _.logprobs.content.push(...C)), k && ((r = _.logprobs).refusal ?? (r.refusal = []), _.logprobs.refusal.push(...k));
      }
      if (f && (_.finish_reason = f, S(this, tt, "f") && op(S(this, tt, "f")))) {
        if (f === "length") throw new $h();
        if (f === "content_filter") throw new Lh();
      }
      if (Object.assign(_, g), !h) continue;
      const { content: y, refusal: E, function_call: A, role: w, tool_calls: P, ...L } = h;
      if (Object.assign(_.message, L), E && (_.message.refusal = (_.message.refusal || "") + E), w && (_.message.role = w), A && (_.message.function_call ? (A.name && (_.message.function_call.name = A.name), A.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += A.arguments)) : _.message.function_call = A), y && (_.message.content = (_.message.content || "") + y, !_.message.refusal && S(this, te, "m", Mi).call(this) && (_.message.parsed = kc(_.message.content))), P) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: C, id: k, type: I, function: N, ...b } of P) {
          const F = (s = _.message.tool_calls)[C] ?? (s[C] = {});
          Object.assign(F, b), k && (F.id = k), I && (F.type = I), N && (F.function ?? (F.function = {
            name: N.name ?? "",
            arguments: ""
          })), N?.name && (F.function.name = N.name), N?.arguments && (F.function.arguments += N.arguments, uI(S(this, tt, "f"), F) && (F.function.parsed_arguments = kc(F.function.arguments)));
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
function yI(e, t) {
  const { id: n, choices: o, created: r, model: i, system_fingerprint: s, ...u } = e;
  return sI({
    ...u,
    id: n,
    choices: o.map(({ message: c, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new O(`missing finish_reason for choice ${h}`);
      const { content: m = null, function_call: g, tool_calls: _, ...y } = c, E = c.role;
      if (!E) throw new O(`missing role for choice ${h}`);
      if (g) {
        const { arguments: A, name: w } = g;
        if (A == null) throw new O(`missing function_call.arguments for choice ${h}`);
        if (!w) throw new O(`missing function_call.name for choice ${h}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: A,
              name: w
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
          tool_calls: _.map((A, w) => {
            const { function: P, type: L, id: C, ...k } = A, { arguments: I, name: N, ...b } = P || {};
            if (C == null) throw new O(`missing choices[${h}].tool_calls[${w}].id
${er(e)}`);
            if (L == null) throw new O(`missing choices[${h}].tool_calls[${w}].type
${er(e)}`);
            if (N == null) throw new O(`missing choices[${h}].tool_calls[${w}].function.name
${er(e)}`);
            if (I == null) throw new O(`missing choices[${h}].tool_calls[${w}].function.arguments
${er(e)}`);
            return {
              ...k,
              id: C,
              type: L,
              function: {
                ...b,
                name: N,
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
          role: E,
          refusal: c.refusal ?? null
        },
        finish_reason: d,
        index: h,
        logprobs: f
      };
    }),
    created: r,
    model: i,
    object: "chat.completion",
    ...s ? { system_fingerprint: s } : {}
  }, t);
}
function er(e) {
  return JSON.stringify(e);
}
var vI = class Es extends dp {
  static fromReadableStream(t) {
    const n = new Es(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, o) {
    const r = new Es(n), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
}, pa = class extends M {
  constructor() {
    super(...arguments), this.messages = new np(this._client);
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
    return cI(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => fa(n, e));
  }
  runTools(e, t) {
    return e.stream ? vI.runTools(this._client, e, t) : hI.runTools(this._client, e, t);
  }
  stream(e, t) {
    return dp.createChatCompletion(this._client, e, t);
  }
};
pa.Messages = np;
var ma = class extends M {
  constructor() {
    super(...arguments), this.completions = new pa(this._client);
  }
};
ma.Completions = pa;
var fp = class extends M {
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
}, hp = class extends M {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", ce, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, pp = class extends M {
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
    return this._client.getAPIList("/organization/certificates/activate", wt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", wt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, mp = class extends M {
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
}, gp = class extends M {
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
}, _p = class extends M {
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
    return this._client.getAPIList("/organization/roles", ht, {
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
}, yp = class extends M {
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
}, vp = class extends M {
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
}, Ap = class extends M {
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
    return this._client.getAPIList(v`/organization/groups/${e}/roles`, ht, {
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
}, Tp = class extends M {
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
    return this._client.getAPIList(v`/organization/groups/${e}/users`, ht, {
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
}, jr = class extends M {
  constructor() {
    super(...arguments), this.users = new Tp(this._client), this.roles = new Ap(this._client);
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
    return this._client.getAPIList("/organization/groups", ht, {
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
jr.Users = Tp;
jr.Roles = Ap;
var Sp = class extends M {
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
}, Ep = class extends M {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates`, ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/activate`, wt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/deactivate`, wt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Cp = class extends M {
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
}, wp = class extends M {
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
}, Ip = class extends M {
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
}, bp = class extends M {
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
}, Rp = class extends M {
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
    return this._client.getAPIList(v`/projects/${e}/roles`, ht, {
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
}, Pp = class extends M {
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
}, Mp = class extends M {
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
}, Np = class extends M {
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
    return this._client.getAPIList(v`/projects/${o}/groups/${e}/roles`, ht, {
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
}, ga = class extends M {
  constructor() {
    super(...arguments), this.roles = new Np(this._client);
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
    return this._client.getAPIList(v`/organization/projects/${e}/groups`, ht, {
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
ga.Roles = Np;
var xp = class extends M {
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
    return this._client.getAPIList(v`/projects/${o}/users/${e}/roles`, ht, {
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
}, _a = class extends M {
  constructor() {
    super(...arguments), this.roles = new xp(this._client);
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
_a.Roles = xp;
var Re = class extends M {
  constructor() {
    super(...arguments), this.users = new _a(this._client), this.serviceAccounts = new Pp(this._client), this.apiKeys = new Sp(this._client), this.rateLimits = new bp(this._client), this.modelPermissions = new Ip(this._client), this.hostedToolPermissions = new wp(this._client), this.groups = new ga(this._client), this.roles = new Rp(this._client), this.dataRetention = new Cp(this._client), this.spendAlerts = new Mp(this._client), this.certificates = new Ep(this._client);
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
Re.Users = _a;
Re.ServiceAccounts = Pp;
Re.APIKeys = Sp;
Re.RateLimits = bp;
Re.ModelPermissions = Ip;
Re.HostedToolPermissions = wp;
Re.Groups = ga;
Re.Roles = Rp;
Re.DataRetention = Cp;
Re.SpendAlerts = Mp;
Re.Certificates = Ep;
var kp = class extends M {
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
    return this._client.getAPIList(v`/organization/users/${e}/roles`, ht, {
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
}, ya = class extends M {
  constructor() {
    super(...arguments), this.roles = new kp(this._client);
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
ya.Roles = kp;
var Pe = class extends M {
  constructor() {
    super(...arguments), this.auditLogs = new hp(this._client), this.adminAPIKeys = new fp(this._client), this.usage = new vp(this._client), this.invites = new gp(this._client), this.users = new ya(this._client), this.groups = new jr(this._client), this.roles = new _p(this._client), this.dataRetention = new mp(this._client), this.spendAlerts = new yp(this._client), this.certificates = new pp(this._client), this.projects = new Re(this._client);
  }
};
Pe.AuditLogs = hp;
Pe.AdminAPIKeys = fp;
Pe.Usage = vp;
Pe.Invites = gp;
Pe.Users = ya;
Pe.Groups = jr;
Pe.Roles = _p;
Pe.DataRetention = mp;
Pe.SpendAlerts = yp;
Pe.Certificates = pp;
Pe.Projects = Re;
var va = class extends M {
  constructor() {
    super(...arguments), this.organization = new Pe(this._client);
  }
};
va.Organization = Pe;
var Dp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* AI(e) {
  if (!e) return;
  if (Dp in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : _c(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = _c(o[1]) ? o[1] : [o[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [r, null]), yield [r, u]);
  }
}
var $ = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, s] of AI(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [Dp]: !0,
    values: t,
    nulls: n
  };
}, $p = class extends M {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: $([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Lp = class extends M {
  create(e, t) {
    return this._client.post("/audio/transcriptions", Qe({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Up = class extends M {
  create(e, t) {
    return this._client.post("/audio/translations", Qe({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Io = class extends M {
  constructor() {
    super(...arguments), this.transcriptions = new Lp(this._client), this.translations = new Up(this._client), this.speech = new $p(this._client);
  }
};
Io.Transcriptions = Lp;
Io.Translations = Up;
Io.Speech = $p;
var Fp = class extends M {
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
}, Op = class extends M {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/assistants/${e}`, {
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/assistants/${e}`, {
      body: t,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", Q, {
      query: e,
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/assistants/${e}`, {
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Gp = class extends M {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Bp = class extends M {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, ei = class extends M {
  constructor() {
    super(...arguments), this.sessions = new Gp(this._client), this.transcriptionSessions = new Bp(this._client);
  }
};
ei.Sessions = Gp;
ei.TranscriptionSessions = Bp;
var qp = class extends M {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: $([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(v`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: $([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Hp = class extends M {
  retrieve(e, t) {
    return this._client.get(v`/chatkit/threads/${e}`, {
      ...t,
      headers: $([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", ce, {
      query: e,
      ...t,
      headers: $([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/chatkit/threads/${e}`, {
      ...t,
      headers: $([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(v`/chatkit/threads/${e}/items`, ce, {
      query: t,
      ...n,
      headers: $([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, ti = class extends M {
  constructor() {
    super(...arguments), this.sessions = new qp(this._client), this.threads = new Hp(this._client);
  }
};
ti.Sessions = qp;
ti.Threads = Hp;
var Vp = class extends M {
  create(e, t, n) {
    return this._client.post(v`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(v`/threads/${o}/messages/${e}`, {
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/messages/${e}`, {
      body: r,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/threads/${e}/messages`, Q, {
      query: t,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { thread_id: o } = t;
    return this._client.delete(v`/threads/${o}/messages/${e}`, {
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Jp = class extends M {
  retrieve(e, t, n) {
    const { thread_id: o, run_id: r, ...i } = t;
    return this._client.get(v`/threads/${o}/runs/${r}/steps/${e}`, {
      query: i,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.getAPIList(v`/threads/${o}/runs/${e}/steps`, Q, {
      query: r,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, TI = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, o = new Uint8Array(n);
    for (let r = 0; r < n; r++) o[r] = t.charCodeAt(r);
    return Array.from(new Float32Array(o.buffer));
  }
}, yt = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, le, Ut, Cs, Xe, hr, Oe, Ft, on, Dt, Dr, Ie, pr, mr, ro, eo, to, $c, Lc, Uc, Fc, Oc, Gc, Bc, io = class extends ha {
  constructor() {
    super(...arguments), le.add(this), Cs.set(this, []), Xe.set(this, {}), hr.set(this, {}), Oe.set(this, void 0), Ft.set(this, void 0), on.set(this, void 0), Dt.set(this, void 0), Dr.set(this, void 0), Ie.set(this, void 0), pr.set(this, void 0), mr.set(this, void 0), ro.set(this, void 0);
  }
  [(Cs = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakMap(), hr = /* @__PURE__ */ new WeakMap(), Oe = /* @__PURE__ */ new WeakMap(), Ft = /* @__PURE__ */ new WeakMap(), on = /* @__PURE__ */ new WeakMap(), Dt = /* @__PURE__ */ new WeakMap(), Dr = /* @__PURE__ */ new WeakMap(), Ie = /* @__PURE__ */ new WeakMap(), pr = /* @__PURE__ */ new WeakMap(), mr = /* @__PURE__ */ new WeakMap(), ro = /* @__PURE__ */ new WeakMap(), le = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new Ut();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const o = fo.fromReadableStream(e, this.controller);
    for await (const r of o) S(this, le, "m", eo).call(this, r);
    if (o.controller.signal?.aborted) throw new ke();
    return this._addRun(S(this, le, "m", to).call(this));
  }
  toReadableStream() {
    return new fo(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, o) {
    const r = new Ut();
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
    if (s.controller.signal?.aborted) throw new ke();
    return this._addRun(S(this, le, "m", to).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const o = new Ut();
    return o._run(() => o._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  static createAssistantStream(e, t, n, o) {
    const r = new Ut();
    return r._run(() => r._runAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  currentEvent() {
    return S(this, pr, "f");
  }
  currentRun() {
    return S(this, mr, "f");
  }
  currentMessageSnapshot() {
    return S(this, Oe, "f");
  }
  currentRunStepSnapshot() {
    return S(this, ro, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(S(this, Xe, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(S(this, hr, "f"));
  }
  async finalRun() {
    if (await this.done(), !S(this, Ft, "f")) throw Error("Final run was not received.");
    return S(this, Ft, "f");
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
    if (i.controller.signal?.aborted) throw new ke();
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
    if (s.controller.signal?.aborted) throw new ke();
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
      else if (Ei(r) && Ei(o)) r = this.accumulateDelta(r, o);
      else if (Array.isArray(r) && Array.isArray(o)) {
        if (r.every((i) => typeof i == "string" || typeof i == "number")) {
          r.push(...o);
          continue;
        }
        for (const i of o) {
          if (!Ei(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
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
Ut = io, eo = function(t) {
  if (!this.ended)
    switch (G(this, pr, t, "f"), S(this, le, "m", Uc).call(this, t), t.event) {
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
        S(this, le, "m", Bc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        S(this, le, "m", Lc).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        S(this, le, "m", $c).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, to = function() {
  if (this.ended) throw new O("stream has ended, this shouldn't happen");
  if (!S(this, Ft, "f")) throw Error("Final run has not been received");
  return S(this, Ft, "f");
}, $c = function(t) {
  const [n, o] = S(this, le, "m", Oc).call(this, t, S(this, Oe, "f"));
  G(this, Oe, n, "f"), S(this, hr, "f")[n.id] = n;
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
        if (r.index != S(this, on, "f")) {
          if (S(this, Dt, "f")) switch (S(this, Dt, "f").type) {
            case "text":
              this._emit("textDone", S(this, Dt, "f").text, S(this, Oe, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", S(this, Dt, "f").image_file, S(this, Oe, "f"));
              break;
          }
          G(this, on, r.index, "f");
        }
        G(this, Dt, n.content[r.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (S(this, on, "f") !== void 0) {
        const r = t.data.content[S(this, on, "f")];
        if (r) switch (r.type) {
          case "image_file":
            this._emit("imageFileDone", r.image_file, S(this, Oe, "f"));
            break;
          case "text":
            this._emit("textDone", r.text, S(this, Oe, "f"));
            break;
        }
      }
      S(this, Oe, "f") && this._emit("messageDone", t.data), G(this, Oe, void 0, "f");
  }
}, Lc = function(t) {
  const n = S(this, le, "m", Fc).call(this, t);
  switch (G(this, ro, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const o = t.data.delta;
      if (o.step_details && o.step_details.type == "tool_calls" && o.step_details.tool_calls && n.step_details.type == "tool_calls") for (const r of o.step_details.tool_calls) r.index == S(this, Dr, "f") ? this._emit("toolCallDelta", r, n.step_details.tool_calls[r.index]) : (S(this, Ie, "f") && this._emit("toolCallDone", S(this, Ie, "f")), G(this, Dr, r.index, "f"), G(this, Ie, n.step_details.tool_calls[r.index], "f"), S(this, Ie, "f") && this._emit("toolCallCreated", S(this, Ie, "f")));
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
}, Uc = function(t) {
  S(this, Cs, "f").push(t), this._emit("event", t);
}, Fc = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return S(this, Xe, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = S(this, Xe, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let o = t.data;
      if (o.delta) {
        const r = Ut.accumulateDelta(n, o.delta);
        S(this, Xe, "f")[t.data.id] = r;
      }
      return S(this, Xe, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      S(this, Xe, "f")[t.data.id] = t.data;
      break;
  }
  if (S(this, Xe, "f")[t.data.id]) return S(this, Xe, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Oc = function(t, n) {
  let o = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, o];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let r = t.data;
      if (r.delta.content) for (const i of r.delta.content) if (i.index in n.content) {
        let s = n.content[i.index];
        n.content[i.index] = S(this, le, "m", Gc).call(this, i, s);
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
}, Gc = function(t, n) {
  return Ut.accumulateDelta(n, t);
}, Bc = function(t) {
  switch (G(this, mr, t.data, "f"), t.event) {
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
      G(this, Ft, t.data, "f"), S(this, Ie, "f") && (this._emit("toolCallDone", S(this, Ie, "f")), G(this, Ie, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Aa = class extends M {
  constructor() {
    super(...arguments), this.steps = new Jp(this._client);
  }
  create(e, t, n) {
    const { include: o, ...r } = t;
    return this._client.post(v`/threads/${e}/runs`, {
      query: { include: o },
      body: r,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(v`/threads/${o}/runs/${e}`, {
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/runs/${e}`, {
      body: r,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/threads/${e}/runs`, Q, {
      query: t,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { thread_id: o } = t;
    return this._client.post(v`/threads/${o}/runs/${e}/cancel`, {
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
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
    const o = $([n?.headers, {
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
          await Co(s);
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
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
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
Aa.Steps = Jp;
var ni = class extends M {
  constructor() {
    super(...arguments), this.runs = new Aa(this._client), this.messages = new Vp(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/threads/${e}`, {
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/threads/${e}`, {
      body: t,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/threads/${e}`, {
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
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
ni.Runs = Aa;
ni.Messages = Vp;
var yn = class extends M {
  constructor() {
    super(...arguments), this.realtime = new ei(this._client), this.chatkit = new ti(this._client), this.assistants = new Op(this._client), this.threads = new ni(this._client);
  }
};
yn.Realtime = ei;
yn.ChatKit = ti;
yn.Assistants = Op;
yn.Threads = ni;
var Kp = class extends M {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, Wp = class extends M {
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(v`/containers/${o}/files/${e}/content`, {
      ...n,
      headers: $([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Ta = class extends M {
  constructor() {
    super(...arguments), this.content = new Wp(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/containers/${e}/files`, Zr({
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
      headers: $([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Ta.Content = Wp;
var Sa = class extends M {
  constructor() {
    super(...arguments), this.files = new Ta(this._client);
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
      headers: $([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Sa.Files = Ta;
var zp = class extends M {
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
}, Ea = class extends M {
  constructor() {
    super(...arguments), this.items = new zp(this._client);
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
Ea.Items = zp;
var Yp = class extends M {
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
      s.embedding = TI(u);
    }), i)));
  }
}, Xp = class extends M {
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
}, Ca = class extends M {
  constructor() {
    super(...arguments), this.outputItems = new Xp(this._client);
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
Ca.OutputItems = Xp;
var wa = class extends M {
  constructor() {
    super(...arguments), this.runs = new Ca(this._client);
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
wa.Runs = Ca;
var Qp = class extends M {
  create(e, t) {
    return this._client.post("/files", Qe({
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
      headers: $([{ Accept: "application/binary" }, t?.headers]),
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
      if (await Co(t), i = await this.retrieve(e), Date.now() - r > n) throw new aa({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, Zp = class extends M {
}, jp = class extends M {
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
}, Ia = class extends M {
  constructor() {
    super(...arguments), this.graders = new jp(this._client);
  }
};
Ia.Graders = jp;
var em = class extends M {
  create(e, t, n) {
    return this._client.getAPIList(v`/fine_tuning/checkpoints/${e}/permissions`, wt, {
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
}, ba = class extends M {
  constructor() {
    super(...arguments), this.permissions = new em(this._client);
  }
};
ba.Permissions = em;
var tm = class extends M {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/fine_tuning/jobs/${e}/checkpoints`, Q, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Ra = class extends M {
  constructor() {
    super(...arguments), this.checkpoints = new tm(this._client);
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
Ra.Checkpoints = tm;
var vn = class extends M {
  constructor() {
    super(...arguments), this.methods = new Zp(this._client), this.jobs = new Ra(this._client), this.checkpoints = new ba(this._client), this.alpha = new Ia(this._client);
  }
};
vn.Methods = Zp;
vn.Jobs = Ra;
vn.Checkpoints = ba;
vn.Alpha = Ia;
var nm = class extends M {
}, Pa = class extends M {
  constructor() {
    super(...arguments), this.graderModels = new nm(this._client);
  }
};
Pa.GraderModels = nm;
var om = class extends M {
  createVariation(e, t) {
    return this._client.post("/images/variations", Qe({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", Qe({
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
}, rm = class extends M {
  retrieve(e, t) {
    return this._client.get(v`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", wt, {
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
}, im = class extends M {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, sm = class extends M {
  accept(e, t, n) {
    return this._client.post(v`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: $([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  hangup(e, t) {
    return this._client.post(v`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: $([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  refer(e, t, n) {
    return this._client.post(v`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: $([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(v`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: $([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, am = class extends M {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, oi = class extends M {
  constructor() {
    super(...arguments), this.clientSecrets = new am(this._client), this.calls = new sm(this._client);
  }
};
oi.ClientSecrets = am;
oi.Calls = sm;
function SI(e, t) {
  return !t || !CI(t) ? {
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
  } : lm(e, t);
}
function lm(e, t) {
  const n = e.output.map((r) => {
    if (r.type === "function_call") return {
      ...r,
      parsed_arguments: bI(t, r)
    };
    if (r.type === "message") {
      const i = r.content.map((s) => s.type === "output_text" ? {
        ...s,
        parsed: EI(t, s.text)
      } : s);
      return {
        ...r,
        content: i
      };
    }
    return r;
  }), o = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || ws(o), Object.defineProperty(o, "output_parsed", {
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
function EI(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function CI(e) {
  return !!da(e.text?.format);
}
function wI(e) {
  return e?.$brand === "auto-parseable-tool";
}
function II(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function bI(e, t) {
  const n = II(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: wI(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function ws(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const o of n.content) o.type === "output_text" && t.push(o.text);
  e.output_text = t.join("");
}
var Wt, tr, vt, nr, qc, Hc, Vc, Jc, RI = class um extends ha {
  constructor(t) {
    super(), Wt.add(this), tr.set(this, void 0), vt.set(this, void 0), nr.set(this, void 0), G(this, tr, t, "f");
  }
  static createResponse(t, n, o) {
    const r = new um(n);
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
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), S(this, Wt, "m", qc).call(this);
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
    for await (const u of i) S(this, Wt, "m", Hc).call(this, u, s);
    if (i.controller.signal?.aborted) throw new ke();
    return S(this, Wt, "m", Vc).call(this);
  }
  [(tr = /* @__PURE__ */ new WeakMap(), vt = /* @__PURE__ */ new WeakMap(), nr = /* @__PURE__ */ new WeakMap(), Wt = /* @__PURE__ */ new WeakSet(), qc = function() {
    this.ended || G(this, vt, void 0, "f");
  }, Hc = function(n, o) {
    if (this.ended) return;
    const r = (s, u) => {
      (o == null || u.sequence_number > o) && this._emit(s, u);
    }, i = S(this, Wt, "m", Jc).call(this, n);
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
  }, Vc = function() {
    if (this.ended) throw new O("stream has ended, this shouldn't happen");
    const n = S(this, vt, "f");
    if (!n) throw new O("request ended without sending any events");
    G(this, vt, void 0, "f");
    const o = PI(n, S(this, tr, "f"));
    return G(this, nr, o, "f"), o;
  }, Jc = function(n) {
    let o = S(this, vt, "f");
    if (!o) {
      if (n.type !== "response.created") throw new O(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return o = G(this, vt, n.response, "f"), o;
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
        G(this, vt, n.response, "f");
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
    const t = S(this, nr, "f");
    if (!t) throw new O("stream ended without producing a ChatCompletion");
    return t;
  }
};
function PI(e, t) {
  return SI(e, t);
}
var cm = class extends M {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/responses/${e}/input_items`, Q, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, dm = class extends M {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, ri = class extends M {
  constructor() {
    super(...arguments), this.inputItems = new cm(this._client), this.inputTokens = new dm(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && ws(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(v`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((o) => ("object" in o && o.object === "response" && ws(o), o));
  }
  delete(e, t) {
    return this._client.delete(v`/responses/${e}`, {
      ...t,
      headers: $([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => lm(n, e));
  }
  stream(e, t) {
    return RI.createResponse(this._client, e, t);
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
ri.InputItems = cm;
ri.InputTokens = dm;
var fm = class extends M {
  retrieve(e, t) {
    return this._client.get(v`/skills/${e}/content`, {
      ...t,
      headers: $([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, hm = class extends M {
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(v`/skills/${o}/versions/${e}/content`, {
      ...n,
      headers: $([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Ma = class extends M {
  constructor() {
    super(...arguments), this.content = new hm(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(v`/skills/${e}/versions`, Zr({
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
Ma.Content = hm;
var ii = class extends M {
  constructor() {
    super(...arguments), this.content = new fm(this._client), this.versions = new Ma(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", Zr({
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
ii.Content = fm;
ii.Versions = Ma;
var pm = class extends M {
  create(e, t, n) {
    return this._client.post(v`/uploads/${e}/parts`, Qe({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Na = class extends M {
  constructor() {
    super(...arguments), this.parts = new pm(this._client);
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
Na.Parts = pm;
var MI = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((r) => r.status === "rejected");
  if (n.length) {
    for (const r of n) console.error(r.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const o = [];
  for (const r of t) r.status === "fulfilled" && o.push(r.value);
  return o;
}, mm = class extends M {
  create(e, t, n) {
    return this._client.post(v`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(v`/vector_stores/${o}/file_batches/${e}`, {
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.post(v`/vector_stores/${o}/file_batches/${e}/cancel`, {
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
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
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async poll(e, t, n) {
    const o = $([n?.headers, {
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
          await Co(s);
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
    async function d(h) {
      for (let f of h) {
        const p = await s.files.create({
          file: f,
          purpose: "assistants"
        }, o);
        c.push(p.id);
      }
    }
    return await MI(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, gm = class extends M {
  create(e, t, n) {
    return this._client.post(v`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(v`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { vector_store_id: o, ...r } = t;
    return this._client.post(v`/vector_stores/${o}/files/${e}`, {
      body: r,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/vector_stores/${e}/files`, Q, {
      query: t,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.delete(v`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(e, o.id, n);
  }
  async poll(e, t, n) {
    const o = $([n?.headers, {
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
          await Co(s);
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
    return this._client.getAPIList(v`/vector_stores/${o}/files/${e}/content`, wt, {
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, si = class extends M {
  constructor() {
    super(...arguments), this.files = new gm(this._client), this.fileBatches = new mm(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/vector_stores/${e}`, {
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", Q, {
      query: e,
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/vector_stores/${e}`, {
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(v`/vector_stores/${e}/search`, wt, {
      body: t,
      method: "post",
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
si.Files = gm;
si.FileBatches = mm;
var _m = class extends M {
  create(e, t) {
    return this._client.post("/videos", Qe({
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
    return this._client.post("/videos/characters", Qe({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(v`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: $([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", Qe({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", Qe({
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
    return this._client.post(v`/videos/${e}/remix`, Zr({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Zt, ym, gr, vm = class extends M {
  constructor() {
    super(...arguments), Zt.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, o = 300) {
    return await this.verifySignature(e, t, n, o), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, o = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    S(this, Zt, "m", ym).call(this, n);
    const r = $([t]).values, i = S(this, Zt, "m", gr).call(this, r, "webhook-signature"), s = S(this, Zt, "m", gr).call(this, r, "webhook-timestamp"), u = S(this, Zt, "m", gr).call(this, r, "webhook-id"), c = parseInt(s, 10);
    if (isNaN(c)) throw new Kn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > o) throw new Kn("Webhook timestamp is too old");
    if (c > d + o) throw new Kn("Webhook timestamp is too new");
    const h = i.split(" ").map((g) => g.startsWith("v1,") ? g.substring(3) : g), f = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), p = u ? `${u}.${s}.${e}` : `${s}.${e}`, m = await crypto.subtle.importKey("raw", f, {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["verify"]);
    for (const g of h) try {
      const _ = Buffer.from(g, "base64");
      if (await crypto.subtle.verify("HMAC", m, _, new TextEncoder().encode(p))) return;
    } catch {
      continue;
    }
    throw new Kn("The given webhook signature does not match the expected signature");
  }
};
Zt = /* @__PURE__ */ new WeakSet(), ym = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, gr = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const o = t.get(n);
  if (o == null) throw new Error(`Missing required header: ${n}`);
  return o;
};
var Is, xa, _r, Am, NI = "workload-identity-auth", H = class {
  constructor({ baseURL: e = yt("OPENAI_BASE_URL"), apiKey: t = yt("OPENAI_API_KEY") ?? null, adminAPIKey: n = yt("OPENAI_ADMIN_KEY") ?? null, organization: o = yt("OPENAI_ORG_ID") ?? null, project: r = yt("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = yt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: s, ...u } = {}) {
    Is.add(this), _r.set(this, void 0), this.completions = new Kp(this), this.chat = new ma(this), this.embeddings = new Yp(this), this.files = new Qp(this), this.images = new om(this), this.audio = new Io(this), this.moderations = new im(this), this.models = new rm(this), this.fineTuning = new vn(this), this.graders = new Pa(this), this.vectorStores = new si(this), this.webhooks = new vm(this), this.beta = new yn(this), this.batches = new Fp(this), this.uploads = new Na(this), this.admin = new va(this), this.responses = new ri(this), this.realtime = new oi(this), this.conversations = new Ea(this), this.evals = new wa(this), this.containers = new Sa(this), this.skills = new ii(this), this.videos = new _m(this);
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
    if (!c.dangerouslyAllowBrowser && Pw()) throw new O(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? xa.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = Pc(c.logLevel, "ClientOptions.logLevel", this) ?? Pc(yt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? Fh(), G(this, _r, Dw, "f");
    const h = yt("OPENAI_CUSTOM_HEADERS");
    if (h) {
      const f = {};
      for (const p of h.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (f[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = $([f, c.defaultHeaders]);
    }
    this._options = c, s && (this._workloadIdentityAuth = new Zw(s, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = o, this.project = r, this.webhookSecret = i;
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
    return $([t.bearerAuth ? await this.bearerAuth(e) : null, t.adminAPIKeyAuth ? await this.adminAPIKeyAuth(e) : null]);
  }
  async bearerAuth(e) {
    if (this._workloadIdentityAuth) return $([{ Authorization: `Bearer ${await this._workloadIdentityAuth.getToken()}` }]);
    if (this.apiKey != null)
      return $([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  async adminAPIKeyAuth(e) {
    if (this.adminAPIKey != null)
      return $([{ Authorization: `Bearer ${this.adminAPIKey}` }]);
  }
  stringifyQuery(e) {
    return Gw(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Xt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Ih()}`;
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
    const o = !S(this, Is, "m", Am).call(this) && n || this.baseURL, r = ww(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), s = Object.fromEntries(r.searchParams);
    return (!yc(i) || !yc(s)) && (t = {
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
    return new Yh(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, r = o.maxRetries ?? this.maxRetries;
    t == null && (t = r), await this.prepareOptions(o);
    const { req: i, url: s, timeout: u } = await this.buildRequest(o, { retryCount: r - t });
    await this.prepareRequest(i, {
      url: s,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (ae(this).debug(`[${c}] sending request`, xt({
      retryOfRequestLogID: n,
      method: o.method,
      url: s,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new ke();
    const f = o.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(s, i, u, p, f).catch(ds), g = Date.now();
    if (m instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new ke();
      const E = cs(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return ae(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - ${y}`), ae(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (${y})`, xt({
          retryOfRequestLogID: n,
          url: s,
          durationMs: g - h,
          message: m.message
        })), this.retryRequest(o, t, n ?? c);
      throw ae(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - error; no more retries left`), ae(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (error; no more retries left)`, xt({
        retryOfRequestLogID: n,
        url: s,
        durationMs: g - h,
        message: m.message
      })), m instanceof Uh || m instanceof Ew ? m : E ? new aa() : new Yr({
        message: xI(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, E]) => ", " + y + ": " + JSON.stringify(E)).join("")}] ${i.method} ${s} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - h}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && f.bearerAuth && !o.__metadata?.hasStreamingBody && !o.__metadata?.workloadIdentityTokenRefreshed)
        return await Sc(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...o,
          __metadata: {
            ...o.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(m);
      if (t && y) {
        const L = `retrying, ${t} attempts remaining`;
        return await Sc(m.body), ae(this).info(`${_} - ${L}`), ae(this).debug(`[${c}] response error (${L})`, xt({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - h
        })), this.retryRequest(o, t, n ?? c, m.headers);
      }
      const E = y ? "error; no more retries left" : "error; not retryable";
      ae(this).info(`${_} - ${E}`);
      const A = await m.text().catch((L) => ds(L).message), w = Rw(A), P = w ? void 0 : A;
      throw ae(this).debug(`[${c}] response error (${E})`, xt({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: P,
        durationMs: Date.now() - h
      })), this.makeStatusError(m.status, w, P, m.headers);
    }
    return ae(this).info(_), ae(this).debug(`[${c}] response start`, xt({
      retryOfRequestLogID: n,
      url: m.url,
      status: m.status,
      headers: m.headers,
      durationMs: g - h
    })), {
      response: m,
      options: o,
      controller: p,
      requestLogID: c,
      retryOfRequestLogID: n,
      startTime: h
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
    return new Yw(this, n, e);
  }
  async fetchWithAuth(e, t, n, o, r = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && r.bearerAuth) {
      const i = t.headers, s = i.get("Authorization");
      if (!s || s === `Bearer ${NI}`) {
        const u = await this._workloadIdentityAuth.getToken();
        i.set("Authorization", `Bearer ${u}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, o);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: r, method: i, ...s } = t || {}, u = this._makeAbort(o);
    r && r.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && s.body instanceof globalThis.ReadableStream || typeof s.body == "object" && s.body !== null && Symbol.asyncIterator in s.body, h = {
      signal: o.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...s
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
    return await Co(r), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const r = t - e;
    return Math.min(0.5 * Math.pow(2, r), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: r, query: i, defaultBaseURL: s } = n, u = this.buildURL(r, i, s);
    "timeout" in n && bw("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: c, body: d, isStreamingBody: h } = this.buildBody({ options: n });
    return h && (e.__metadata = {
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
    const i = $([
      r,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...kw(),
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
    const n = $([t]), o = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, r = !o && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || o ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !r
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: Gh(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...S(this, _r, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
xa = H, _r = /* @__PURE__ */ new WeakMap(), Is = /* @__PURE__ */ new WeakSet(), Am = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
H.OpenAI = xa;
H.DEFAULT_TIMEOUT = 6e5;
H.OpenAIError = O;
H.APIError = de;
H.APIConnectionError = Yr;
H.APIConnectionTimeoutError = aa;
H.APIUserAbortError = ke;
H.NotFoundError = Mh;
H.ConflictError = Nh;
H.RateLimitError = kh;
H.BadRequestError = bh;
H.AuthenticationError = Rh;
H.InternalServerError = Dh;
H.PermissionDeniedError = Ph;
H.UnprocessableEntityError = xh;
H.InvalidWebhookSignatureError = Kn;
H.toFile = oI;
H.Completions = Kp;
H.Chat = ma;
H.Embeddings = Yp;
H.Files = Qp;
H.Images = om;
H.Audio = Io;
H.Moderations = im;
H.Models = rm;
H.FineTuning = vn;
H.Graders = Pa;
H.VectorStores = si;
H.Webhooks = vm;
H.Beta = yn;
H.Batches = Fp;
H.Uploads = Na;
H.Admin = va;
H.Responses = ri;
H.Realtime = oi;
H.Conversations = Ea;
H.Evals = wa;
H.Containers = Sa;
H.Skills = ii;
H.Videos = _m;
function xI(e) {
  if (kI(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function kI(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const o = t;
    if (o.code === "UND_ERR_INVALID_ARG" && typeof o.message == "string" && o.message.includes("invalid onRequestStart method")) return !0;
    t = o.cause;
  }
  return !1;
}
function DI(e = {}, t = [], n = Ar(e, e.reasoning)) {
  return e.provider === "openai-compatible" && e.toolMode !== "tagged-json" && Array.isArray(t) && t.length > 0 && n.profileId === "deepseek-thinking" && n.mode !== "off";
}
function $I(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function LI(e, t, n) {
  return t > n && Array.isArray(e?.tool_calls) && e.tool_calls.some((o) => String(o?.function?.name || "").trim());
}
function Kc(e = "", t = 0) {
  let n = 0;
  for (let o = t - 1; o >= 0 && e[o] === "\\"; o -= 1) n += 1;
  return n % 2 === 1;
}
function UI(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function FI(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function OI(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function GI(e = "") {
  const t = String(e ?? "");
  let n = "", o = 0;
  for (; o < t.length; ) {
    const r = t.slice(o, o + 2), i = t.slice(o + 2, o + 6);
    if (r !== "\\u" || Kc(t, o) || !UI(i)) {
      n += t[o] || "", o += 1;
      continue;
    }
    const s = o + 6, u = t.slice(s + 2, s + 6);
    if (FI(i) && t.slice(s, s + 2) === "\\u" && !Kc(t, s) && OI(u)) {
      const c = Number.parseInt(i, 16), d = Number.parseInt(u, 16), h = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(h), o += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(i, 16)), o += 6;
  }
  return n;
}
function BI(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), GI(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function qI(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ka(e = "", t = "", n = 0) {
  const o = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${qI(t)}(?:\\\\?")?\\s*:`, "i"), r = String(e || "").slice(Math.max(0, n)).match(o);
  if (!r || r.index === void 0) return null;
  const i = r[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + r.index + i,
    end: Math.max(0, n) + r.index + r[0].length
  };
}
function HI(e = "", t = [], n = 0) {
  return t.map((o) => ka(e, o, n)).filter(Boolean).sort((o, r) => o.index - r.index)[0] || null;
}
function He(e = "", t = "", n = []) {
  const o = String(e || ""), r = ka(o, t);
  if (!r) return;
  let i = r.end;
  for (; /\s/.test(o[i] || ""); ) i += 1;
  o[i] === '"' && (i += 1);
  const s = HI(o, n.filter((d) => d !== t), i);
  let u = s ? s.index : o.length;
  if (s) {
    const d = o.lastIndexOf(",", s.index);
    d >= i && (u = d);
  }
  let c = o.slice(i, u).trim();
  return s || (c = c.replace(/\}\s*$/, "").trimEnd()), BI(c);
}
function ot(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var rn = {
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
function Wc(e = "", t = [], n = []) {
  for (const o of t) {
    const r = He(e, o, n);
    if (r !== void 0) return r;
  }
}
function VI(e = "", t = "") {
  if (t === "Read") {
    const n = rn.Read, o = {};
    return n.forEach((r, i) => {
      const s = He(e, r, n.slice(i + 1));
      s !== void 0 && (o[r] = ot(s));
    }), o.filePath === void 0 && o.path !== void 0 && (o.filePath = o.path, delete o.path), o.filePath === void 0 && o.scope !== void 0 && (o.filePath = o.scope, delete o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "Write") {
    const n = {}, o = Wc(e, ["filePath", "path"], ["content"]), r = He(e, "content", []);
    return o !== void 0 && (n.filePath = ot(o)), r !== void 0 && (n.content = ot(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, o = Wc(e, ["filePath", "path"], ["edits"]), r = He(e, "edits", []);
    return o !== void 0 && (n.filePath = ot(o)), r !== void 0 && (n.edits = ot(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = rn.Grep, o = {};
    return n.forEach((r) => {
      const i = He(e, r, n.filter((s) => s !== r));
      i !== void 0 && (o[r] = ot(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "MemoryGrep") {
    const n = rn.MemoryGrep, o = {};
    return n.forEach((r) => {
      const i = He(e, r, n.filter((s) => s !== r));
      i !== void 0 && (o[r] = ot(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  if (t === "ChatHistory") {
    const n = rn.ChatHistory, o = {};
    return n.forEach((r) => {
      const i = He(e, r, n.filter((s) => s !== r));
      i !== void 0 && (o[r] = ot(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  return null;
}
function JI(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const s = JSON.parse(n);
    if (s && typeof s == "object" && !Array.isArray(s)) return s;
  } catch {
  }
  if (!Object.hasOwn(rn, t)) return null;
  const o = VI(n, t);
  if (o) return o;
  const r = rn[t], i = {};
  return r.forEach((s, u) => {
    const c = He(n, s, r.slice(u + 1));
    c !== void 0 && (i[s] = ot(c));
  }), Object.keys(i).length ? i : null;
}
function Tm(e = "", t = "") {
  const n = JI(e, t);
  return n ? JSON.stringify(n) : "";
}
var KI = /<tool_call\b|<\/?[｜|]+DSML[｜|]+\s*/gi, WI = /<[｜|]+DSML[｜|]+\s*invoke\s+name="([^"]+)"\s*>/iy, zI = /<\/[｜|]+DSML[｜|]+\s*invoke\s*>/iy, YI = /<[｜|]+DSML[｜|]+\s*(function_calls|calls)\s*>/iy, XI = /<\/[｜|]+DSML[｜|]+\s*(function_calls|calls)\s*>/iy, QI = /<[｜|]+DSML[｜|]+\s*parameter\s+name="([^"]+)"\s+string="(true|false)"\s*>/iy, ZI = /<(\/?)[｜|]+DSML[｜|]+\s*parameter\b/gi, jI = /<\/[｜|]+DSML[｜|]+\s*parameter\s*>/iy, Da = /<[^<>"']*(?:"[^"]*"[^<>"']*|'[^']*'[^<>"']*)*>/y;
function ue(e, t, n) {
  return e.lastIndex = n, e.exec(t);
}
function bo(e, t = 0) {
  return ue(KI, e, t);
}
function $a(e, t) {
  for (; t < e.length && /\s/.test(e[t]); ) t += 1;
  return t;
}
function Be(e, t) {
  const n = /* @__PURE__ */ new SyntaxError(`DSML 工具调用格式无效：${t}（位置 ${e}）。本轮工具未执行。`);
  throw n.code = "DSML_TOOL_CALL_INVALID", n.offset = e, n;
}
function lt(e, t) {
  const n = /* @__PURE__ */ new SyntaxError(`JSON 工具调用格式无效：${t}（位置 ${e}）。本轮工具未执行。`);
  throw n.code = "TAGGED_TOOL_CALL_INVALID", n.offset = e, n;
}
function zc(e, t) {
  const n = ue(WI, e, t), o = n?.[1].trim();
  o || Be(t, "缺少完整的 invoke 标签或工具名");
  let r = t + n[0].length;
  const i = /* @__PURE__ */ new Set(), s = [];
  for (; r < e.length; ) {
    r = $a(e, r);
    const u = ue(zI, e, r);
    if (u) return {
      end: r + u[0].length,
      calls: [{
        name: o,
        arguments: `{${s.join(",")}}`
      }]
    };
    const c = ue(QI, e, r);
    c || Be(r, "缺少完整的 parameter 标签或 invoke 结束标签");
    const d = c[1];
    i.has(d) && Be(r, "存在重复参数"), i.add(d);
    const h = r + c[0].length, f = ue(ZI, e, h);
    (!f || !f[1]) && Be(h, "参数未闭合或参数边界有歧义");
    const p = ue(jI, e, f.index);
    p || Be(f.index, "parameter 结束标签无效");
    const m = e.slice(h, f.index);
    let g = JSON.stringify(m);
    if (c[2].toLowerCase() === "false") {
      g = m.trim();
      try {
        JSON.parse(g);
      } catch {
        Be(h, "非字符串参数不是合法 JSON");
      }
    }
    s.push(`${JSON.stringify(d)}:${g}`), r = f.index + p[0].length;
  }
  Be(r, "invoke 未闭合");
}
function e0(e, t) {
  const n = ue(YI, e, t);
  if (!n) return zc(e, t);
  let o = t + n[0].length;
  const r = [];
  for (; o < e.length; ) {
    o = $a(e, o);
    const i = ue(XI, e, o);
    if (i)
      return i[1].toLowerCase() !== n[1].toLowerCase() && Be(o, "调用组结束标签不匹配"), {
        end: o + i[0].length,
        calls: r
      };
    const s = zc(e, o);
    r.push(...s.calls), o = s.end;
  }
  Be(o, "调用组未闭合");
}
function Sm(e, t) {
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
function Em(e, t, n) {
  if (e[t] !== "[" || n.end < 0 || n.nested) return !1;
  try {
    return JSON.parse(e.slice(t, n.end)), !1;
  } catch {
    return !0;
  }
}
function t0(e, t) {
  let n = t, o;
  for (; o = ue(/["<{[]/g, e, n); ) {
    if (n = o.index, o[0] === '"') {
      const i = La(e, n);
      i < 0 && lt(t, "JSON 前的说明文字引号未闭合"), n = i;
      continue;
    }
    if (o[0] === "<") {
      if (ue(/<\/tool_call>/iy, e, n)) return null;
      const i = ue(Da, e, n);
      n += i?.[0].length || 1;
      continue;
    }
    const r = Sm(e, n);
    if (Em(e, n, r)) {
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
function La(e, t) {
  for (let n = t + 1; n < e.length; n += 1) if (e[n] === "\\") n += 1;
  else if (e[n] === '"') return n + 1;
  return -1;
}
function Yc(e, t) {
  for (let n = 0; n < e.length; ) {
    const o = e[n], r = o === "<" ? ue(Da, e, n) : null;
    if (r) n += r[0].length;
    else if (o === '"') {
      const i = La(e, n);
      i < 0 && lt(t, "JSON 外的说明文字引号未闭合"), e[$a(e, i)] === ":" && lt(t, "完整 JSON 外出现字段，不能作为杂文剥离"), n = i;
    } else if (o === "{" || o === "[") {
      const i = Sm(e, n);
      Em(e, n, i) || lt(t, "同一工具块中存在多个 JSON 结构"), n = i.end;
    } else n += 1;
  }
}
function n0(e, t, n) {
  let o = t, r;
  for (; r = ue(/["<]/g, e, o); )
    if (o = r.index, r[0] === '"') {
      const i = La(e, o);
      i < 0 && lt(n, "JSON 外的说明文字引号未闭合"), o = i;
    } else {
      const i = ue(/<\/tool_call>/iy, e, o);
      if (i) return i;
      const s = ue(Da, e, o);
      o += s?.[0].length || 1;
    }
  return null;
}
function o0(e, t) {
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
  ].includes(o)) && lt(t, "工具封装中存在 id、name、arguments 之外的字段，无法确定参数边界");
}
function r0(e, t) {
  const n = ue(/<tool_call>/iy, e, t);
  if (!n) return null;
  const o = t + n[0].length, r = t0(e, o);
  r?.mismatched && lt(t, "JSON 括号不匹配，无法确定调用边界");
  const i = n0(e, r?.boundary ?? o, t);
  if (!i)
    return r && ue(/<\/tool_call>/gi, e, r.start) && lt(t, "未找到 JSON 字符串之外的 tool_call 结束标签"), /<\/[｜|]+DSML[｜|]+/i.test(e.slice(o)) && Be(t, "tool_call 开头与 DSML 结尾混用，无法确定调用边界"), null;
  let s = e.slice(o, i.index);
  const u = e.slice(o, r?.start ?? o), c = e.slice(r?.boundary ?? o, i.index), d = /<tool_call\b|<[｜|]+DSML[｜|]+\s*(?:invoke|function_calls|calls)\b/i;
  return (d.test(u) || d.test(c)) && lt(t, "同一工具块中出现另一条工具调用，不能作为杂文剥离"), r?.end >= 0 && (Yc(u, t), Yc(c, t), s = e.slice(r.start, r.end), o0(s, t)), {
    end: i.index + i[0].length,
    payload: s
  };
}
function i0(e) {
  const t = [];
  let n = 0, o;
  for (; o = bo(e, n); ) if (/^<tool_call/i.test(o[0])) {
    const i = r0(e, o.index);
    if (!i) break;
    t.push(i), n = i.end;
  } else {
    const i = e0(e, o.index);
    t.push(i), n = i.end;
  }
  const r = Cm(e);
  return r >= n && /^<\/?[｜|]/.test(e.slice(r)) && Be(r, "DSML 标记未输出完整"), t;
}
function Cm(e) {
  const t = e.lastIndexOf("<");
  if (t < 0) return -1;
  const n = e.slice(t).replace(/[｜|]+/g, "|").toLowerCase();
  return [
    "<tool_call",
    "<|dsml|",
    "</|dsml|"
  ].some((o) => o.startsWith(n)) ? t : -1;
}
function s0(e) {
  try {
    return JSON.parse(e);
  } catch {
    return e;
  }
}
function qe(e, t, n) {
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
function wm(e = "") {
  return !!bo(String(e || ""));
}
function Im(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function bm(e, t = "") {
  const n = Im(e);
  try {
    return JSON.parse(n), n;
  } catch {
    return Tm(n, t) || n;
  }
}
function a0(e = "") {
  const t = String(e || ""), n = ka(t, "arguments");
  if (!n) return "";
  let o = n.end;
  for (; /\s/.test(t[o] || ""); ) o += 1;
  const r = t[o] || "";
  return r === "{" ? t.slice(o).replace(/\}\s*$/, "").trimEnd() : r === '"' ? t.slice(o + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(o).replace(/\}\s*$/, "").trimEnd();
}
function l0(e = "") {
  const t = String(e || "").trim(), n = He(t, "name", ["id", "arguments"]) || He(t, "toolName", ["id", "arguments"]) || "", o = He(t, "id", [
    "name",
    "toolName",
    "arguments"
  ]), r = a0(t);
  return !n || !r ? null : {
    id: o,
    name: n,
    arguments: bm(r, n)
  };
}
function u0(e, t = 0, n = "openai-tool") {
  if (!Y(e)) return null;
  const o = Y(e.function) ? e.function : null, r = String(o?.name || "").trim();
  if (!r) return null;
  const i = me(e) || {};
  return delete i.index, i.id = String(i.id || `${n}-${t + 1}`), i.type = "function", i.function = {
    ...me(o) || {},
    name: r,
    arguments: Im(o.arguments)
  }, i;
}
function ho(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, o) => u0(n, o, t)).filter(Boolean);
}
function po(e, t) {
  return Array.isArray(e) ? e.some((n) => po(n, t)) : Y(e) ? Object.entries(e).some(([n, o]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(o) : (Array.isArray(o) || Y(o)) && po(o, t)) : !1;
}
function c0(e) {
  return po(e, (t) => typeof t == "string" && t.length > 0);
}
function bs(e) {
  return po(e, () => !0);
}
function d0(e) {
  return po(e, (t) => typeof t != "string" || t.length === 0);
}
function f0(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => c0(t));
}
var Xc = /* @__PURE__ */ new WeakSet();
function Ua(e) {
  if (!Y(e)) return null;
  const t = me(e) || {};
  if (typeof t.content == "string" && wm(t.content) && (t.content = $t(xe(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = ho(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function Fa(e = [], t = "openai-tool") {
  return ho(e, t).map((n, o) => ({
    id: n.id || `${t}-${Date.now()}-${o + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function mo(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function xe(e = "") {
  const t = [], n = String(e || "");
  let o = 0, r = "";
  for (const i of n.matchAll(/<think>([\s\S]*?)<\/think>/gi)) {
    const s = bo(n, o);
    if (s && s.index < i.index) break;
    r += n.slice(o, i.index), qe(t, "思考块", i[1]), o = i.index + i[0].length;
  }
  return r = (r + n.slice(o)).trim(), {
    cleaned: r,
    thoughts: t
  };
}
function $t(e = "", { streaming: t = !1 } = {}) {
  const n = String(e || ""), o = bo(n)?.index ?? (t ? Cm(n) : -1);
  return o < 0 ? n.trim() : n.slice(0, o).trim();
}
function Rs(e = "") {
  const t = String(e || "");
  if (!wm(t)) return [];
  const n = bo(t), o = t.slice(n.index);
  return [{
    id: "tagged-json-draft",
    name: (/^<tool_call/i.test(n[0]) ? o.match(/["']?name["']?\s*:\s*["']([^"']+)/i) : o.match(/<[｜|]+DSML[｜|]+\s*invoke\s+name="([^"]+)"/i))?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }];
}
function kt(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      qe(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((o) => kt(e, o, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && qe(e, n, t.text), typeof t.content == "string" && qe(e, n, t.content), typeof t.reasoning_content == "string" && qe(e, n, t.reasoning_content), typeof t.thinking == "string" && qe(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((o) => {
      if (typeof o == "string") {
        qe(e, "推理摘要", o);
        return;
      }
      o && typeof o == "object" && qe(e, "推理摘要", o.text || o.content || "");
    }));
  }
}
function At(e = {}, t = {}) {
  const n = [];
  return kt(n, e.reasoning_content, "推理文本"), kt(n, e.reasoning, "推理文本"), kt(n, e.reasoning_text, "推理文本"), kt(n, e.thinking, "思考块"), kt(n, t.reasoning_content, "推理文本"), kt(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        qe(n, "推理文本", o.text);
        return;
      }
      if (o.type === "summary_text") {
        qe(n, "推理摘要", o.text);
        return;
      }
      (o.type === "thinking" || o.type === "reasoning" || o.type === "reasoning_content") && qe(n, "思考块", o.text || o.content || o.reasoning || "");
    }
  }), n;
}
function h0(e = "") {
  const t = String(e || ""), n = [];
  i0(t).forEach((i) => {
    if (i.calls) {
      n.push(...i.calls);
      return;
    }
    try {
      const s = JSON.parse(i.payload);
      n.push({
        id: s.id,
        name: String(s.name || ""),
        arguments: bm(s.arguments, s.name)
      });
    } catch {
      const s = l0(i.payload);
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
    return h0(t);
  } catch (r) {
    throw Object.assign(r, dn(e, n)), o && (r.requestInspection = o), r;
  }
}
function Oa(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : Ua(t);
}
function p0(e = {}) {
  const t = ho(e?.tool_calls);
  if (t.length) return t;
  const n = ho(Oa(e)?.tool_calls);
  return n.length ? n : [];
}
function m0(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function g0(e = "") {
  return /claude/i.test(String(e || ""));
}
function _0(e = "") {
  return Br(e) === "openai";
}
function Rm(e = {}, t = {}) {
  return t.mode !== "on" && t.mode !== "off" ? e : t.profileId === "kimi-k3" ? (e.reasoning_effort = t.mode === "off" ? "off" : t.effort, e) : t.profileId === "deepseek-thinking" ? (e.thinking = { type: t.mode === "off" ? "disabled" : "enabled" }, t.mode === "on" && (e.reasoning_effort = t.effort), e) : (String(t.profileId || "").startsWith("openai-") && (e.reasoning_effort = t.mode === "off" ? "none" : t.effort), e);
}
function Pm(e = [], t = "") {
  if (!g0(t)) return e;
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
function Qc(e, t = "") {
  return !Y(e) || !m0(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var Ps = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function y0(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((o) => me(o) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((o, r) => {
    const i = me(o) || {}, s = Number.isInteger(Number(o?.index)) ? Number(o.index) : r, u = n[s];
    n[s] = Y(u) ? Ro(u, i, "tool_call") : i;
  }), n.filter((o) => o !== void 0);
}
function Ro(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return me(t);
  if (t === null && Ps.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return y0(e, t);
  if (typeof e == "string" && typeof t == "string")
    return Ps.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : me(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(me(t) || []);
  if (Y(e) && Y(t)) {
    const o = { ...e };
    return Object.entries(t).forEach(([r, i]) => {
      o[r] = Ro(o[r], i, r);
    }), o;
  }
  return me(t);
}
function $r(e = {}, t = {}) {
  const n = Y(e) ? me(e) || {} : {}, o = Y(t) ? me(t) || {} : {};
  return delete o.message, delete o.finish_reason, delete o.index, delete o.logprobs, delete o.delta, Object.entries(o).forEach(([r, i]) => {
    n[r] = Ro(n[r], i, r);
  }), n.role || (n.role = "assistant"), Ua(n) || { role: "assistant" };
}
function ao(e, t = {}) {
  const n = Ua($r(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function v0(e = {}, t = {}) {
  return Y(e) ? Y(t) ? Ro(me(e) || {}, t, "") : me(e) : me(t);
}
function Ms(e, t = "", { preserveReasoningContent: n = !1 } = {}) {
  const o = Array.isArray(e.messages) ? e.messages : [], r = $I(o), i = [];
  let s = !1;
  o.forEach((c, d) => {
    if (s) {
      if (c?.role === "tool") return;
      s = !1;
    }
    const h = c?.role === "assistant", f = h ? c?.providerPayload?.openaiCompatibleMessage : null, p = Nm(Array.isArray(f?.tool_calls) && f.tool_calls.some((A) => bs(A)) ? f.tool_calls : h && Array.isArray(c?.tool_calls) && c.tool_calls.some((A) => bs(A)) ? c.tool_calls : null);
    if (p) {
      const A = Y(f) ? f : c;
      (!Y(A) || !Xc.has(A)) && (Y(A) && Xc.add(A), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: p.index,
        toolName: p.toolName,
        reason: p.reason
      })), s = !0;
      return;
    }
    const m = h ? ho(c?.tool_calls) : [], g = h ? Oa(c) : null, _ = Array.isArray(g?.tool_calls) ? g.tool_calls : [], y = _.length > 0 && f0(g);
    if (LI(g, d, r)) {
      i.push(Qc({
        ...g,
        ...m.length && !y ? { tool_calls: m } : {}
      }, t));
      return;
    }
    const E = {
      role: c.role,
      content: c.content
    };
    n && typeof g?.reasoning_content == "string" && (E.reasoning_content = g.reasoning_content), c.role === "tool" && c.tool_call_id && (E.tool_call_id = c.tool_call_id), y ? E.tool_calls = _ : m.length && (E.tool_calls = m), i.push(Qc(E, t));
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
  return Pm(i, t);
}
function Zc(e) {
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
function Ns(e, t = "") {
  const n = /* @__PURE__ */ new Map(), o = [];
  if ((Array.isArray(e.messages) ? e.messages : []).forEach((r) => {
    if (r.role === "assistant") {
      const i = p0(r);
      if (i.length) {
        const s = Oa(r), u = typeof s?.content == "string" ? s.content : String(r.content || ""), c = i.map((d, h) => {
          const f = d.function?.name || "", p = d.id || `tool-call-${h + 1}`;
          return f && n.set(p, f), `<tool_call>${JSON.stringify({
            id: p,
            name: f,
            arguments: s0(d.function.arguments)
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
    content: Zc(e)
  });
  else {
    const r = String(o[0].content || "").trim(), i = String(e.systemPrompt || "").trim();
    o[0] = {
      ...o[0],
      content: [Zc(e), r === i ? "" : r].filter(Boolean).join(`

`)
    };
  }
  return Pm(o, t);
}
function jc(e, t, n) {
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
function Mm(e, t, n) {
  !e || !t || n === void 0 || (e[t] = Ro(e[t], n, t));
}
function Lr(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (Y(n)) {
      const o = Y(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([r, i]) => {
        Lr(o, r, i);
      }), e[t] = o;
      return;
    }
    if (typeof n == "string" && Ps.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || Mm(e, t, n);
  }
}
function A0(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const o = Number(n?.index ?? 0), r = { ...e.tool_calls[o] || {} };
    Object.entries(n || {}).forEach(([i, s]) => {
      if (i !== "index" && !(i === "function" && s == null)) {
        if (i === "function" && Y(s)) {
          r.function = Y(r.function) ? { ...r.function } : {}, Object.entries(s).forEach(([u, c]) => {
            Lr(r.function, u, c);
          });
          return;
        }
        Lr(r, i, s);
      }
    }), e.tool_calls[o] = r;
  }));
}
function xs(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([o, r]) => {
    o === "delta" || o === "finish_reason" || o === "index" || o === "logprobs" || Mm(e, o, r);
  });
  const n = Y(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([o, r]) => {
    if (o === "tool_calls") {
      A0(e, r);
      return;
    }
    Lr(e, o, r);
  });
}
function it(e = {}) {
  return mo(e?.content);
}
function sn(e = {}) {
  return Fa(e?.tool_calls || []);
}
function T0(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return Y(JSON.parse(e));
  } catch {
    return !1;
  }
}
function Nm(e) {
  if (!Array.isArray(e) || !e.some((t) => bs(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], o = Y(n?.function) ? n.function : null, r = String(o?.name || "").trim();
    let i = "";
    if (!Y(n) || !o ? i = "invalid_function_shape" : r ? T0(o.arguments) ? d0(n) && (i = "invalid_thought_signature") : i = "invalid_function_arguments" : i = "missing_function_name", i) return {
      index: t,
      toolName: r,
      reason: i
    };
  }
  return null;
}
function an(e = {}) {
  const t = Nm(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function S0(e, t) {
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
        const h = r.match(i);
        if (!h || typeof h.index != "number") break;
        const f = h.index, p = r.slice(0, f);
        r = r.slice(f + h[0].length), s(p);
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
function E0(e, t) {
  const n = String(e || "").trim();
  if (n && (n.startsWith("{") || n.startsWith("["))) try {
    const o = JSON.parse(n), r = o?.error?.message || o?.message;
    if (typeof r == "string" && r.trim()) return r.trim();
  } catch {
  }
  return n || `OpenAI 兼容流式请求失败（HTTP ${t}）`;
}
var C0 = class {
  constructor(e) {
    this.config = e, this.auth = Gr("openai-compatible", e.apiKey), this.client = new H({
      ...this.auth.sdkOptions,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = j("openai-compatible", this.config, e.reasoning)) {
    const n = t, o = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, r = !o && Array.isArray(e.tools) && e.tools.length ? e.tools : null, i = DI({
      ...this.config,
      provider: "openai-compatible"
    }, r, n), s = {
      model: this.config.model,
      messages: o ? Ns(e, this.config.model) : Ms(e, this.config.model, { preserveReasoningContent: i }),
      ...r ? {
        tools: r,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? _0(this.config.model) ? { max_completion_tokens: e.maxTokens } : { max_tokens: e.maxTokens } : {}
    };
    return i && (s.tool_choice === "required" || s.tool_choice?.type === "function") && (s.tool_choice = "auto"), !_o({
      ...this.config,
      provider: "openai-compatible"
    }, n) && typeof e.temperature == "number" && (s.temperature = e.temperature), Rm(s, n);
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
        ...Ct(e, {
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
      const g = await r.text().catch(() => ""), _ = new Error(E0(g, r.status));
      throw _.status = r.status, _.body = g, _;
    }
    const i = { role: "assistant" };
    let s, u = this.config.model;
    await S0(r, (g) => {
      if (g?.error) throw new H.APIError(void 0, g.error, void 0, r.headers);
      u = g?.model || u;
      const _ = g?.choices?.[0];
      xs(i, _), _?.finish_reason && (s = _.finish_reason);
      const y = xe(it(i)), E = sn(i), A = E.length ? E : Rs(y.cleaned);
      jc(e, {
        text: E.length ? y.cleaned : $t(y.cleaned, { streaming: !0 }),
        thoughts: Fn(n, At(i, _).concat(y.thoughts)),
        ...A.length ? { toolCalls: A } : {},
        ...!E.length && A.length ? { toolCallDraft: !0 } : {}
      }, n);
    }), at("openai", s, !!i.refusal, xe(it(i)).cleaned), an(i);
    const c = ao(i), d = sn(i), h = xe(it(i)), f = At(i, {});
    h.thoughts.forEach((g) => f.push(g));
    const p = d.length ? [] : so(e, h.cleaned, i), m = [...d, ...p];
    return {
      text: d.length ? h.cleaned : $t(h.cleaned),
      toolCalls: m,
      thoughts: Fn(n, f),
      finishReason: s,
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
    }), s = async (E) => {
      try {
        return await E(r);
      } catch (A) {
        throw A && typeof A == "object" && (A.requestInspection = i), A;
      }
    };
    if (o) {
      if (!n) return {
        ...await s((V) => this.streamNativeChatCompletions(e, V, t)),
        requestInspection: i
      };
      const E = await s((V) => this.client.chat.completions.create({
        ...V,
        stream: !0
      }, { signal: e.signal })), A = { role: "assistant" };
      let w, P = this.config.model, L;
      for await (const V of E) {
        P = V.model || P;
        const W = V.choices?.[0];
        xs(A, W), W?.finish_reason && (w = W.finish_reason);
        const ge = xe(it(A)), ze = sn(A), Ue = ze.length ? ze : Rs(ge.cleaned);
        jc(e, {
          text: ze.length ? ge.cleaned : $t(ge.cleaned, { streaming: !0 }),
          thoughts: Fn(t, At(A, W).concat(ge.thoughts)),
          ...Ue.length ? { toolCalls: Ue } : {},
          ...!ze.length && Ue.length ? { toolCallDraft: !0 } : {}
        }, t);
      }
      at("openai", w, !!A.refusal, xe(it(A)).cleaned);
      const C = (typeof E.finalChatCompletion == "function" ? await E.finalChatCompletion() : null)?.choices?.[0] || null, k = C?.message || A;
      an(k);
      const I = v0(A, $r(k, C || {}));
      an(I), L = ao(I);
      const N = sn(I), b = xe(it(I)), F = At(I, C || {});
      b.thoughts.forEach((V) => F.push(V));
      const X = N.length ? [] : so(e, b.cleaned, k, i), J = [...N, ...X];
      return {
        text: N.length ? b.cleaned : $t(b.cleaned),
        toolCalls: J,
        thoughts: Fn(t, F),
        finishReason: w,
        model: P,
        provider: "openai-compatible",
        providerPayload: L,
        requestInspection: i,
        ...dn(e, k)
      };
    }
    const u = await s((E) => this.client.chat.completions.create(E, { signal: e.signal })), c = u.choices?.[0] || {}, d = c.message || {};
    at("openai", c.finish_reason, !!d.refusal, xe(mo(d.content)).cleaned), an(d);
    const h = At(d, c), f = Fa(d.tool_calls || []), p = xe(mo(d.content));
    p.thoughts.forEach((E) => h.push(E));
    const m = f.length ? [] : so(e, p.cleaned, d, i), g = [...f, ...m], _ = f.length ? p.cleaned : $t(p.cleaned), y = $r(d, c);
    return {
      text: _,
      toolCalls: g,
      thoughts: Fn(t, h),
      finishReason: c.finish_reason,
      model: u.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: ao(y),
      requestInspection: i,
      ...dn(e, d)
    };
  }
};
function w0(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Ga(e) {
  const t = w0(Array.isArray(e) ? e : []);
  return Array.isArray(t) ? (t.forEach((n) => {
    !n || typeof n != "object" || Array.isArray(n) || (n.type === "function_call" && delete n.parsed_arguments, n.type === "message" && Array.isArray(n.content) && n.content.forEach((o) => {
      !o || typeof o != "object" || Array.isArray(o) || delete o.parsed;
    }));
  }), t) : [];
}
function xm(e, t) {
  return {
    type: "message",
    role: e,
    content: I0(t)
  };
}
function Ur(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function I0(e) {
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
function Fr(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function ed(e, t = [], n = {}) {
  (t || []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        Fr(e, n.reasoning || "推理文本", o.text);
        return;
      }
      o.type === "summary_text" && Fr(e, n.summary || "推理摘要", o.text);
    }
  });
}
function b0(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (ed(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), ed(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function R0(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function km(e) {
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
function Ni(e, t, n) {
  const o = /* @__PURE__ */ new Error(e === "incomplete" ? "Responses 回复未完整生成。" : e === "failed" ? "Responses 生成失败。" : "Responses 未确认生成完成。");
  o.name = "OpenAIResponsesTerminationError", o.code = e === "incomplete" ? "OPENAI_RESPONSES_INCOMPLETE" : e === "failed" ? "OPENAI_RESPONSES_FAILED" : "OPENAI_RESPONSES_UNFINISHED", o.reason = t;
  const r = km(n);
  return r && (o.partialResponse = {
    text: r,
    finishReason: t || e,
    truncated: t === "max_output_tokens"
  }), o;
}
function M0(e) {
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
        t.push(...Ga(n.providerPayload.openAIResponseOutput));
        continue;
      }
      if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
        n.content?.trim() && t.push(Ur(n.content)), n.tool_calls.forEach((o, r) => {
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
        t.push(Ur(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? xm(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function N0(e) {
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
      t.push(...Ga(n.providerPayload.openAIResponseOutput));
      continue;
    }
    if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
      n.content?.trim() && t.push(Ur(n.content)), n.tool_calls.forEach((o, r) => {
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
      t.push(Ur(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? xm(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function x0(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function k0(e) {
  if (e?.status === 401 || e?.status === 403) return !1;
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function D0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    activity: t.activity,
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft === !0 ? { toolCallDraft: !0 } : {}
  });
}
function xi(e, t) {
  const [n = "0", o = "0"] = String(e || "").split(":"), [r = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(r) || Number(o) - Number(i);
}
var $0 = class {
  constructor(e) {
    this.config = e, this.auth = Gr("openai-responses", e.apiKey), this.client = new H({
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
      instructions: t ? void 0 : R0(e) || void 0,
      input: t ? N0(e) : M0(e),
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
    return !_o({
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
      effectiveConfig: Ct(e, {
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
      if (P0(m), m.status !== "completed") throw Ni(m.status, m.incomplete_details?.reason, m);
      const g = m.output;
      return {
        output: g,
        thoughts: z(t) ? b0(g) : [],
        toolCalls: g.filter((_) => _.type === "function_call" && _.name).map((_, y) => ({
          id: _.call_id || `response-tool-${y + 1}`,
          name: _.name || "",
          arguments: _.arguments || "{}"
        })),
        text: km(m)
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
        const y = this.client.responses.stream(_, { signal: e.signal }), E = /* @__PURE__ */ new Map(), A = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map(), P = /* @__PURE__ */ new Map();
        let L = "waiting", C, k;
        for (const b of [
          "response.completed",
          "response.incomplete",
          "response.failed"
        ]) y.on(b, (F) => {
          k = F;
        });
        const I = (b, F) => {
          L = b, C = F;
          const X = [];
          z(t) && (Array.from(A.entries()).sort(([J], [V]) => xi(J, V)).forEach(([, J]) => Fr(X, "推理文本", J)), Array.from(w.entries()).sort(([J], [V]) => xi(J, V)).forEach(([, J]) => Fr(X, "推理摘要", J))), D0(e, {
            activity: L,
            text: Array.from(E.entries()).sort(([J], [V]) => xi(J, V)).map(([, J]) => J).join(`
`).trim(),
            thoughts: X,
            ...P.size ? {
              toolCalls: Array.from(P.entries()).sort(([J], [V]) => J - V).map(([, J]) => ({
                id: J.call_id,
                name: J.name,
                arguments: J.arguments
              })),
              toolCallDraft: !0
            } : {}
          });
        };
        y.on("response.output_item.added", (b) => {
          if (b.item.type === "reasoning") {
            I("thinking", b.output_index);
            return;
          }
          b.item.type === "function_call" && (P.set(b.output_index, { ...b.item }), I("tool-call", b.output_index));
        }), y.on("response.output_item.done", (b) => {
          b.item.type === "reasoning" && C === b.output_index && L === "thinking" && I("waiting", b.output_index);
        }), y.on("response.function_call_arguments.delta", (b) => {
          const F = P.get(b.output_index);
          F && (F.arguments += b.delta, I("tool-call", b.output_index));
        }), y.on("response.function_call_arguments.done", (b) => {
          const F = P.get(b.output_index);
          F && (F.arguments = b.arguments, I("tool-call", b.output_index));
        }), y.on("response.output_text.delta", (b) => {
          if (!b.delta) return;
          const F = `${b.output_index}:${b.content_index}`;
          E.set(F, `${E.get(F) || ""}${b.delta}`), I("replying", b.output_index);
        }), y.on("response.reasoning_text.delta", (b) => {
          if (!b.delta) return;
          const F = `${b.output_index}:${b.content_index}`;
          A.set(F, `${A.get(F) || ""}${b.delta}`), I("thinking", b.output_index);
        }), y.on("response.reasoning_summary_text.delta", (b) => {
          if (!b.delta) return;
          const F = `${b.output_index}:${b.summary_index}`;
          w.set(F, `${w.get(F) || ""}${b.delta}`), I("thinking", b.output_index);
        });
        const N = await y.finalResponse();
        if (k?.type !== "response.completed") throw Ni(k?.type?.slice(9), k?.response?.incomplete_details?.reason, N);
        if (N.status !== "completed") throw Ni(N.status, N.incomplete_details?.reason, N);
        return N;
      } catch (y) {
        throw r(y);
      }
    }, d = !x0(this.config.baseUrl), h = typeof e.onStreamProgress == "function" ? c : u;
    let f, p;
    try {
      f = await h(!1, "initial"), p = i(f);
    } catch (m) {
      if (!d || !k0(m)) throw r(m);
      f = await h(!0, "legacy_system_error");
      try {
        p = i(f);
      } catch (g) {
        throw r(g);
      }
    }
    if (d && n.length < 2 && !p.text && !p.toolCalls.length) {
      f = await h(!0, "empty_response");
      try {
        p = i(f);
      } catch (m) {
        throw r(m);
      }
    }
    return {
      text: p.text,
      toolCalls: p.toolCalls,
      thoughts: p.thoughts,
      finishReason: f.incomplete_details?.reason || f.status || "stop",
      refused: p.output.some((m) => m?.type === "message" && Array.isArray(m.content) && m.content.some((g) => g?.type === "refusal")),
      model: f.model || this.config.model,
      provider: "openai-responses",
      providerPayload: p.output.length ? { openAIResponseOutput: Ga(p.output) } : void 0,
      requestInspection: o()
    };
  }
};
async function L0(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("host_chat_completions_stream_missing_body");
  const o = new TextDecoder();
  let r = "";
  const i = /\r?\n\r?\n/, s = (c) => {
    const d = c.split(/\r?\n/).filter((h) => h.startsWith("data:")).map((h) => h.slice(5).trimStart()).join(`
`).trim();
    !d || d === "[DONE]" || t(JSON.parse(d));
  };
  for (; ; ) {
    const { done: c, value: d } = await n.read();
    if (c) break;
    for (r += o.decode(d, { stream: !0 }); ; ) {
      const h = r.match(i);
      if (!h || typeof h.index != "number") break;
      const f = r.slice(0, h.index);
      r = r.slice(h.index + h[0].length), s(f);
    }
  }
  const u = r.trim();
  u && s(u);
}
var ks = null;
function sR(e) {
  ks = typeof e == "function" ? e : null;
}
async function U0() {
  if (!ks) throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return await ks();
}
var qt = "openai", Dm = "claude", $m = "makersuite", F0 = "/api/backends/chat-completions/status", O0 = "/api/backends/chat-completions/generate", G0 = Object.freeze({
  [Dm]: "https://api.anthropic.com/v1",
  [$m]: "https://generativelanguage.googleapis.com"
}), Po = U0;
function B0(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function q0(e = "") {
  return Br(e) === "openai";
}
function H0(e, t) {
  const n = B0(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
async function Lm(e = Po) {
  if (typeof e != "function") throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(e() || {}),
    Accept: "application/json"
  };
}
function V0(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, o]) => {
    t[n] = /authorization|cookie|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : o;
  }), t;
}
async function Ba(e = {}, t = !1, n = Po) {
  const o = await Lm(n), r = {
    url: O0,
    method: "POST",
    headers: V0(o),
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
async function J0(e = {}, t = !1) {
  return await Ba(e, t);
}
function K0(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function W0(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function z0() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function td(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function nd(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => td(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => td(n));
}
function Y0(e = "") {
  const t = String(e || ""), n = nd((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), o = nd(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), r = n || o;
  return r.length > 240 ? `${r.slice(0, 237)}...` : r;
}
function X0(e = null) {
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
function Q0(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function Z0(e = "") {
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
  if (W0(e)) return z0();
  const o = X0(n);
  if (K0(e) || /\btext\/html\b/i.test(o.contentType)) {
    const r = Q0(o), i = Y0(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      r ? `（${r}）` : "",
      i ? `：${i}` : ""
    ].join("");
  }
  return Z0(e) || String(e || t || "").trim();
}
function Um(e = {}, t = qt) {
  const n = H0(e.baseUrl, t), o = String(e.apiKey || "").trim(), r = G0[t] || "", i = n || (o ? r : ""), s = { chat_completion_source: t || "openai" };
  return i && (s.reverse_proxy = i), o && (s.proxy_password = o), s;
}
function j0(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function eb(e = {}, t = qt) {
  return Um(e, t);
}
function qa(e = {}, t = {}, n = [], o = !1, r = qt) {
  const i = t.maxTokens, s = r === "openai" && q0(e.model);
  return j0({
    ...Um(e, r),
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
function tb(e = {}, t = {}, n = [], o = !1) {
  return qa(e, t, n, o, qt);
}
function nb(e = {}, t = {}, n = [], o = !1) {
  return qa(e, t, n, o, Dm);
}
function ob(e = {}, t = {}, n = [], o = !1) {
  return qa(e, t, n, o, $m);
}
function Ha(e) {
  const t = e || globalThis.fetch;
  if (typeof t != "function") throw new Error("当前运行环境没有可用的 fetch，无法调用酒馆后端。");
  return t;
}
async function rb(e = {}, t = qt, n = {}, o = {}) {
  const r = await Ha(o.fetch)(F0, {
    method: "POST",
    headers: await Lm(o.requestHeadersProvider),
    body: JSON.stringify(eb(e, t)),
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
async function Fm(e = {}, t = qt, n = {}) {
  return await rb(e, t, n, { requestHeadersProvider: Po });
}
async function ib(e = {}, t = {}) {
  return await Fm(e, qt, t);
}
async function sb(e = {}, t = {}, n = {}) {
  const o = await Ba(e, !1, n.requestHeadersProvider);
  typeof t.onRequest == "function" && t.onRequest(o);
  const r = await Ha(n.fetch)(o.url, {
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
async function ab(e = {}, t = {}) {
  return await sb(e, t, { requestHeadersProvider: Po });
}
async function lb(e = {}, t, n = {}, o = {}) {
  const r = await Ba(e, !0, o.requestHeadersProvider);
  typeof n.onRequest == "function" && n.onRequest(r);
  const i = await Ha(o.fetch)(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!i.ok) {
    const s = await i.text().catch(() => ""), u = new Error(fn(s, `酒馆后端流式生成失败：HTTP ${i.status}`, i));
    throw u.status = i.status, u.body = s, u;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await L0(i, (s) => {
    if (s?.error) {
      const u = fn(s.error?.message || s.message || JSON.stringify(s.error), "酒馆后端流式生成失败");
      throw new Error(u);
    }
    t(s);
  });
}
async function ub(e = {}, t, n = {}) {
  return await lb(e, t, n, { requestHeadersProvider: Po });
}
var cb = Object.freeze([
  "buildHostChatCompletionGenerateRequest",
  "createHostChatCompletion",
  "streamHostChatCompletion"
]);
function ai(e) {
  if (!e || !cb.every((t) => typeof e[t] == "function")) throw new TypeError("酒馆渠道必须注入有效的 Host Client。");
  return e;
}
var Va = Object.freeze({
  buildHostChatCompletionGenerateRequest: J0,
  fetchHostChatCompletionsModels: Fm,
  fetchHostOpenAICompatibleModels: ib,
  createHostChatCompletion: ab,
  streamHostChatCompletion: ub
});
function Gt(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function db(e) {
  const t = String(e || "").trim();
  if (!t || t === "auto") return "auto";
  if (t === "required") return "any";
  if (t === "none") return "none";
  throw new Error(`酒馆托管 Claude 不支持 tool_choice：${t}。仅支持 auto/required/none。`);
}
function fb(e = {}, t = {}, n = j("sillytavern-claude", e, t.reasoning)) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const o = db(t.toolChoice), r = n.profileId === "sillytavern-claude-manual" || n.profileId === "sillytavern-claude-adaptive-conditional";
  return {
    toolChoice: o,
    reasoningDisabledForForcedTool: o === "any" && n.mode === "on" && r
  };
}
var hb = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function or(e = {}, t = {}, n = {}, o) {
  const r = o || j("sillytavern-claude", e, t.reasoning);
  return n.reasoningDisabledForForcedTool ? {
    ...r,
    mode: "off",
    output: "hide"
  } : r;
}
function pb(e = {}, t = {}, n = {}) {
  return Ct(e, {
    reasoning: n,
    effort: n.mode === "on" ? n.effort : "",
    controlFields: t.controlFields || {}
  });
}
function mb(e = {}, t = {}) {
  return { toolChoice: String(t.toolChoice || "") };
}
function Om(e = "") {
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
function gb(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const o = Om(t.function.arguments || "{}");
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
function _b(e = []) {
  const t = Array.isArray(e) ? Gt(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function yb(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = Gt(r) || {}, s = _b(i?.providerPayload?.anthropicContent), u = gb(i.tool_calls);
    delete i.providerPayload, i.role === "assistant" && s && u.length ? (delete i.tool_calls, i.content = s.filter((c) => c?.type !== "tool_use").concat(u)) : i.role === "assistant" && s && (delete i.tool_calls, i.content = s), n.push(i);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function vb(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const o = Om(t.inputJson);
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
      const n = Gt(t.input);
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
    } : Gt(t) || null;
  }).filter(Boolean);
}
function Ab(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: Gt(t.input) || {}
  } : Gt(t) || null).filter(Boolean);
}
function Tb(e = []) {
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
function Sb(e = [], t = {}) {
  const n = vb(e), o = n.filter((i) => i.type === "tool_use" && i.name).map((i, s) => ({
    id: i.id || `st-claude-tool-${s + 1}`,
    name: i.name,
    arguments: i.invalidInputJson !== void 0 ? i.invalidInputJson : JSON.stringify(i.input || {})
  })), r = n.filter((i) => i.type === "text").map((i) => i.text || "").join(`
`);
  return {
    text: r,
    toolCalls: o,
    thoughts: t.includeReasoningOutput === !1 ? [] : n.filter((i) => i.type === "thinking" || i.type === "redacted_thinking").map((i) => ({
      label: i.type === "thinking" ? "思考块" : "已脱敏思考块",
      text: i.type === "thinking" ? i.thinking || "" : i.data || ""
    })).filter((i) => i.text),
    finishReason: at("anthropic", t.finishReason, !1, r),
    model: t.model || "",
    provider: "sillytavern-claude",
    providerPayload: n.length ? { anthropicContent: Ab(n) } : void 0
  };
}
function Eb(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Cb(e, t, n = {}) {
  const o = [];
  let r, i = !1, s = n.model || "";
  const u = (d, h = {}) => {
    const f = Number.isInteger(Number(d)) ? Number(d) : o.length;
    return o[f] ? o[f] = {
      ...o[f],
      ...h
    } : o[f] = { ...h }, o[f];
  }, c = () => {
    const d = Tb(o);
    Eb(e, {
      text: d.text,
      thoughts: z(t) ? d.thoughts : [],
      ...Array.isArray(d.toolCalls) ? { toolCalls: d.toolCalls } : {},
      ...d.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(d = {}) {
      if (d.type === "message_stop" && (i = !0), d?.message?.model && (s = d.message.model), d.type === "content_block_start") {
        u(d.index, Gt(d.content_block) || {}), c();
        return;
      }
      if (d.type === "content_block_delta") {
        const h = u(d.index), f = d.delta || {};
        f.type === "text_delta" ? (h.type = h.type || "text", h.text = `${h.text || ""}${f.text || ""}`) : f.type === "input_json_delta" ? (h.type = h.type || "tool_use", h.inputJson = `${h.inputJson || ""}${f.partial_json || ""}`) : f.type === "thinking_delta" ? (h.type = h.type || "thinking", h.thinking = `${h.thinking || ""}${f.thinking || ""}`) : f.type === "signature_delta" && (h.signature = `${h.signature || ""}${f.signature || ""}`), c();
        return;
      }
      d.type === "message_delta" && (r = d.delta?.stop_reason || r);
    },
    result() {
      return Sb(o, {
        finishReason: i ? r : void 0,
        model: s,
        includeReasoningOutput: z(t)
      });
    }
  };
}
var wb = class {
  constructor(e, t = Va) {
    this.config = e, this.hostClient = ai(t);
  }
  buildMessages(e) {
    return yb(e);
  }
  resolveToolProtocol(e, t) {
    return fb(this.config, e, t);
  }
  buildPayload(e, t = this.resolveToolProtocol(e), n = or(this.config, e, t)) {
    const r = this.buildMessages(e), i = {
      ...e,
      toolChoice: t.toolChoice,
      reasoning: n,
      temperature: _o({
        ...this.config,
        provider: "sillytavern-claude"
      }, n) ? void 0 : e.temperature
    }, s = nb(this.config, i, r, !0);
    return n.mode === "on" ? (s.reasoning_effort = n.effort, s.include_reasoning = z(n)) : n.mode === "off" ? (s.reasoning_effort = "auto", s.include_reasoning = !1) : (s.reasoning_effort = "auto", s.include_reasoning = z(n)), s;
  }
  async inspectRequest(e, t = {}) {
    const n = j("sillytavern-claude", this.config, e.reasoning), o = t.protocol || this.resolveToolProtocol(e, n), r = t.effectiveReasoning || or(this.config, e, o, n), i = t.payload || this.buildPayload(e, o, r), s = await this.hostClient.buildHostChatCompletionGenerateRequest(i, !0);
    return this.buildRequestInspection(s, o, e, r);
  }
  buildRequestInspection(e, t = {}, n = {}, o = or(this.config, n, t)) {
    const r = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Ot(e),
      effectiveConfig: {
        ...mb(n, t),
        ...pb(n, {
          ...t,
          controlFields: r
        }, o)
      },
      ...t.reasoningDisabledForForcedTool ? { notices: [hb] } : {}
    };
  }
  async chat(e) {
    const t = j("sillytavern-claude", this.config, e.reasoning), n = this.resolveToolProtocol(e, t), o = or(this.config, e, n, t), r = this.buildPayload(e, n, o);
    let i = null;
    const s = (u) => {
      i = this.buildRequestInspection(u, n, e, o);
    };
    try {
      const u = Cb(e, o, this.config);
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
function Ja(e) {
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
  const t = Ja(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function Ib(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((r) => hn(r)).filter((r) => Array.isArray(r.parts) && r.parts.length);
  const n = e?.providerPayload?.googleContent, o = hn(n);
  return o.parts.length ? [o] : [];
}
function bb(e = {}) {
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
function Rb(e = {}, t = 0) {
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
    const u = bb(s.inlineData);
    u && o.content.push(u);
  }), i.length && o.content.push({
    type: "tool_calls",
    tool_calls: i
  }), r && o.content.some((s) => s?.type === "text") && (o.signature = r), o.content.length ? o : null;
}
function Pb(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = Ib(r);
    if (r.role === "assistant" && i.length) {
      i.forEach((u, c) => {
        const d = Rb(u, c);
        d && n.push(d);
      });
      return;
    }
    const s = Ja(r) || {};
    delete s.providerPayload, n.push(s);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function Mb(e = {}) {
  return hn(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function Nb(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function xb(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function kb(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function Db(e, t) {
  const n = String(t || ""), o = String(e || "");
  return n ? !o || n.startsWith(o) ? n : o.endsWith(n) ? o : `${o}${n}` : o;
}
function $b(e = [], t = []) {
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
function Lb(e) {
  const t = hn(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function Ub(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Fb(e, t, n = {}) {
  let o = "", r = [], i = [], s, u = n.model || "";
  const c = [];
  return {
    accept(d = {}) {
      u = d.model || d.modelVersion || u, s = d?.candidates?.[0]?.finishReason || s;
      const h = Mb(d);
      h.parts.length && c.push(...Ja(h.parts) || []), o = Db(o, Nb(h)), r = $b(r, kb(h));
      const f = z(t) ? xb(h) : [];
      f.length && (i = f), Ub(e, {
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
        finishReason: at("google", s, !1, o),
        model: u,
        provider: "sillytavern-google",
        providerPayload: Lb(d)
      };
    }
  };
}
var Ob = class {
  constructor(e, t = Va) {
    this.config = e, this.hostClient = ai(t);
  }
  buildMessages(e) {
    return Pb(e);
  }
  buildPayload(e, t = j("sillytavern-google", this.config, e.reasoning)) {
    const n = t, o = !0, r = this.buildMessages(e), i = ob(this.config, e, r, o);
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
      request: Ot(e),
      effectiveConfig: Ct(t, {
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
      const i = Fb(e, t, this.config);
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
function Gb(e, t, n) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: z(n) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function ki(e, t = [], n = !1) {
  const o = xe(e);
  return {
    thinkTagged: o,
    cleanedText: t.length ? o.cleaned : $t(o.cleaned, { streaming: n })
  };
}
function Bb(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var qb = class {
  constructor(e, t = Va) {
    this.config = e, this.hostClient = ai(t);
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? Ns(e, this.config.model) : Ms(e, this.config.model);
  }
  buildPayload(e, t = !1, n = j("sillytavern-openai-compatible", this.config, e.reasoning)) {
    const o = n, r = t ? Ns(e, this.config.model) : Ms(e, this.config.model), i = {
      ...e,
      temperature: _o({
        ...this.config,
        provider: "sillytavern-openai-compatible"
      }, o) ? void 0 : e.temperature
    };
    return Rm(tb(this.config, t ? {
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
      request: Ot(e),
      effectiveConfig: {
        ...Ct(t, {
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
      xs(r, m), m.finish_reason && (i = m.finish_reason);
      const g = sn(r), { thinkTagged: _, cleanedText: y } = ki(it(r), g, !0), E = g.length ? g : Rs(_.cleaned);
      Gb(e, {
        text: y,
        thoughts: z(n) ? At(r, m).concat(_.thoughts) : [],
        ...E.length ? { toolCalls: E } : {},
        ...!g.length && E.length ? { toolCallDraft: !0 } : {}
      }, n);
    }, {
      signal: e.signal,
      onRequest: o.onRequest,
      onResponseAccepted: o.onResponseAccepted
    }), at("openai", i, !!r.refusal, xe(it(r)).cleaned), an(r);
    const u = sn(r), { thinkTagged: c, cleanedText: d } = ki(it(r), u), h = At(r, {});
    c.thoughts.forEach((p) => h.push(p));
    const f = u.length ? [] : so(e, c.cleaned, r);
    return {
      text: d,
      toolCalls: [...u, ...f],
      thoughts: z(n) ? h : [],
      finishReason: i,
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
    at("openai", i.finish_reason, !!s.refusal, xe(mo(s.content)).cleaned), an(s);
    const u = At(s, i), c = Fa(s.tool_calls || []), { thinkTagged: d, cleanedText: h } = ki(mo(s.content), c);
    d.thoughts.forEach((m) => u.push(m));
    const f = c.length ? [] : so(e, d.cleaned, s), p = $r(s, i);
    return {
      text: h,
      toolCalls: [...c, ...f],
      thoughts: z(n) ? u : [],
      finishReason: i.finish_reason,
      model: r.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: ao(p),
      ...dn(e, s)
    };
  }
  async chat(e) {
    const t = j("sillytavern-openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, o = Array.isArray(e.tools) && e.tools.length > 0, r = async (s, u = {}) => {
      let c = null;
      const d = (h) => {
        c = this.buildRequestInspection(h, e, t);
      };
      try {
        return {
          ...typeof e.onStreamProgress == "function" ? await this.streamChat(e, s, t, {
            onRequest: d,
            onResponseAccepted: u.onResponseAccepted
          }) : await this.nonStreamingChat(e, s, t, { onRequest: d }),
          requestInspection: c
        };
      } catch (h) {
        throw c && h && typeof h == "object" && (h.requestInspection = c), h;
      }
    }, i = this.buildPayload(e, n, t);
    try {
      return await r(i);
    } catch (s) {
      if (e.allowToolProtocolFallback === !1 || n || !o || !Bb(s)) throw s;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await r(this.buildPayload(e, !0, t));
  }
};
function Di(e, t, n) {
  return Object.hasOwn(n, "hostClient") ? new e(t, ai(n.hostClient)) : new e(t);
}
function aR(e = {}, t = {}) {
  switch (Ad(e.reasoning || {}), e.provider) {
    case "sillytavern-openai-compatible":
      return Di(qb, e, t);
    case "sillytavern-claude":
      return Di(wb, e, t);
    case "sillytavern-google":
      return Di(Ob, e, t);
    case "openai-responses":
      return new $0(e);
    case "anthropic":
      return new C_(e);
    case "google":
      return new Sw(e);
    default:
      return new C0(e);
  }
}
function Hb(e = {}) {
  const t = String(e?.name || "").trim();
  if (typeof e?.arguments == "string") {
    const n = e.arguments;
    try {
      return JSON.parse(n.trim() || "{}"), n;
    } catch {
      return Tm(n, t) || n;
    }
  }
  try {
    return JSON.stringify(e?.arguments || {});
  } catch {
    return "{}";
  }
}
function Ds(e = [], t = {}) {
  const n = String(t.fallbackPrefix || "agent-tool").trim() || "agent-tool", o = typeof t.createId == "function" ? t.createId : (r) => `${n}-${Date.now()}-${r + 1}`;
  return (Array.isArray(e) ? e : []).map((r, i) => {
    const s = Object.prototype.hasOwnProperty.call(r || {}, "providerId");
    return {
      id: String(r?.id || o(i) || `${n}-${i + 1}`),
      name: String(r?.name || "").trim(),
      arguments: Hb(r),
      ...s ? { providerId: String(r?.providerId || "") } : {}
    };
  }).filter((r) => r.name);
}
function Vb(e, t = {}) {
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
function lR(e = {}, t = {}, n = {}) {
  const o = Ds(e?.toolCalls, n);
  return o.length ? o : String(e?.provider || t?.provider || "").toLowerCase() !== "google" ? [] : Ds(Vb(e?.providerPayload, n), n);
}
function uR(e = {}, t = [], n = {}) {
  return {
    role: "assistant",
    content: Object.prototype.hasOwnProperty.call(n, "content") ? String(n.content || "") : String(e.text || ""),
    providerPayload: e.providerPayload,
    tool_calls: Ds(t, n).map((o) => ({
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
function cR(e = {}) {
  const t = String(e.toolName || e.tool_name || "").trim();
  return {
    role: "tool",
    tool_call_id: String(e.toolCallId || e.tool_call_id || ""),
    ...t ? { toolName: t } : {},
    content: String(e.content || "")
  };
}
export {
  eR as AGENT_REQUEST_TIMEOUT_MS,
  _g as PROVIDER_OPTIONS,
  Wb as REASONING_MODE_OPTIONS,
  uR as buildProviderAssistantToolCallMessage,
  cR as buildProviderToolResultMessage,
  aR as createAgentAdapter,
  oR as getProviderLabel,
  jb as getReasoningEffortOptions,
  Zb as getReasoningModeOptions,
  rR as getToolModeLabel,
  nR as isSillyTavernProvider,
  ng as normalizeAgentConfig,
  Qb as normalizeAgentSettings,
  Ls as normalizeReasoningConfig,
  Ot as redactRequestSecrets,
  iR as resolveActiveProviderConfig,
  Vs as resolveReasoningCapability,
  lR as resolveResultToolCalls,
  Ar as resolveRuntimeReasoning,
  sR as setHostChatCompletionsRequestHeadersProvider
};
