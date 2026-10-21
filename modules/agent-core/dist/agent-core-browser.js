var zm = Object.create, ud = Object.defineProperty, Ym = Object.getOwnPropertyDescriptor, Xm = Object.getOwnPropertyNames, Qm = Object.getPrototypeOf, Zm = Object.prototype.hasOwnProperty, Gr = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), jm = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var r = Xm(t), i = 0, s = r.length, u; i < s; i++)
      u = r[i], !Zm.call(e, u) && u !== n && ud(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(o = Ym(t, u)) || o.enumerable
      });
  return e;
}, eg = (e, t, n) => (n = e != null ? zm(Qm(e)) : {}, jm(t || !e || !e.__esModule ? ud(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), cd = "littlewhitebox-server", rR = `/api/plugins/${cd}`, Gs = Object.freeze([{
  id: "tavily",
  label: "Tavily",
  baseUrl: "https://api.tavily.com"
}, {
  id: "exa",
  label: "Exa",
  baseUrl: "https://api.exa.ai"
}]), dd = "tavily", iR = Object.freeze({
  provider: "联网渠道（全局）",
  key: "API Key",
  show: "显示",
  exaBackend: `Exa 官方接口需安装并启用 ${cd}。`
});
function tg(e) {
  return Gs.some((t) => t.id === e) ? e : dd;
}
function fd(e = "") {
  return String(e || "").trim();
}
function Bn(e = "", t = dd) {
  return String(e || "").trim().replace(/\/+$/, "") || Gs.find((n) => n.id === t).baseUrl;
}
function vr(e = {}, t = {}) {
  return {
    webProvider: tg(e.webProvider ?? t.webProvider),
    ...Object.fromEntries(Gs.flatMap(({ id: n }) => [[`${n}ApiKey`, fd(e[`${n}ApiKey`] ?? t[`${n}ApiKey`])], [`${n}BaseUrl`, Bn(e[`${n}BaseUrl`] ?? t[`${n}BaseUrl`], n)]]))
  };
}
var sR = Object.freeze([
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
function ng(e = "") {
  return e === "on" || e === "off" ? e : "inherit";
}
function og(e) {
  return String(e ?? "").trim().toLowerCase() || void 0;
}
function rg(e) {
  if (e == null || e === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? Math.floor(t) : void 0;
}
function Bs(e = {}) {
  const t = e && typeof e == "object" ? e : {}, n = og(t.effort), o = rg(t.budgetTokens);
  return {
    mode: ng(t.mode),
    ...n ? { effort: n } : {},
    ...o !== void 0 ? { budgetTokens: o } : {}
  };
}
function z(e = {}) {
  return e?.mode !== "off" && e?.output === "show";
}
var ig = "agent-core-no-auth";
function hd(e) {
  return String(e ?? "").trim();
}
function Br(e, t) {
  const n = hd(t);
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
      apiKey: n || ig,
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
var Ar = "x-api-key", aR = Object.freeze([{
  value: Ar,
  label: "x-api-key"
}, {
  value: "bearer",
  label: "Bearer"
}]);
function Ui(e) {
  return e === "anthropic" || e === "sillytavern-claude";
}
function sg(e) {
  return e === "bearer" ? e : Ar;
}
var pd = "openai-compatible", qs = "默认", md = "default", ag = "deny", st = 32e3;
var lR = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), uR = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), Fi = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: st,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: st,
    sendTemperature: !0,
    toolMode: "tagged-json"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: st,
    sendTemperature: !0,
    toolMode: "tagged-json"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    modelListAuth: Ar,
    temperature: 1,
    maxTokens: st,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: st,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    modelListAuth: Ar,
    temperature: 1,
    maxTokens: st,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: st,
    sendTemperature: !0
  }
};
function tn() {
  return JSON.parse(JSON.stringify(Fi));
}
function Ct() {
  return {
    provider: pd,
    modelConfigs: tn(),
    permissionMode: md
  };
}
function gd(e = Ct()) {
  const t = e && typeof e == "object" ? e : Ct();
  return {
    provider: Vs(t.provider),
    modelConfigs: Hs(t.modelConfigs || {})
  };
}
function _d(e) {
  return e === "full" ? "full" : md;
}
function yd(e) {
  return e === "allow" ? "allow" : ag;
}
function qn(e, t = st) {
  const n = Number(e);
  if (!Number.isFinite(n) || n <= 0) {
    const o = Number(t);
    return Number.isFinite(o) && o > 0 ? Math.floor(o) : st;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}
function ct(e) {
  return String(e || "").trim() || "默认";
}
function Hs(e = {}) {
  const t = tn();
  return Object.keys(Fi).forEach((n) => {
    const o = e && typeof e[n] == "object" ? e[n] : {}, r = Fi[n];
    t[n] = {
      baseUrl: String(o.baseUrl ?? r.baseUrl ?? ""),
      model: String(o.model ?? r.model ?? ""),
      apiKey: hd(o.apiKey ?? r.apiKey),
      ...Ui(n) ? { modelListAuth: sg(o.modelListAuth) } : {},
      temperature: o.temperature ?? r.temperature,
      maxTokens: qn(o.maxTokens, r.maxTokens),
      sendTemperature: typeof o.sendTemperature == "boolean" ? o.sendTemperature : r.sendTemperature,
      ..."toolMode" in r ? { toolMode: String(o.toolMode || r.toolMode || "native") } : {},
      reasoning: Bs(o.reasoning)
    };
  }), t;
}
function Vs(e) {
  return typeof e == "string" && e.trim() ? e : pd;
}
function Js(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function vd(e = {}, t) {
  const n = {}, o = Js(e, t);
  return Object.entries(o).forEach(([r, i]) => {
    if (!i || typeof i != "object") return;
    const s = ct(r);
    n[s] = {
      provider: Vs(i.provider),
      modelConfigs: Hs(i.modelConfigs || {}),
      permissionMode: _d(i.permissionMode)
    };
  }), Object.keys(n).length || (n[qs] = Ct()), n;
}
function Ad(e, t) {
  const n = ct(t);
  return e[n] ? n : Object.keys(e)[0];
}
function Td(e, t, n) {
  const o = ct(t || n);
  return e[o] ? o : e[n] ? n : Object.keys(e)[0];
}
function Ks(e = {}, t = Ct()) {
  const n = gd(t), o = e && typeof e == "object" ? e : {};
  return {
    provider: Vs(o.provider || n.provider),
    modelConfigs: Hs(o.modelConfigs || n.modelConfigs)
  };
}
function Sd(e = {}, t = {}, n = qs, o = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (o !== n) return !0;
  const r = e?.delegateConfig;
  if (!r || typeof r != "object" || Array.isArray(r) || !(typeof r.provider == "string" && r.provider.trim() || r.modelConfigs && typeof r.modelConfigs == "object" && Object.keys(r.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const i = t[n] || Ct(), s = gd(i), u = Ks(r, i);
  return JSON.stringify(u) !== JSON.stringify(s);
}
function lg(e = {}, t, n, o, r) {
  const i = r(e?.[o]);
  if (i) return i;
  const s = Js(e, t), u = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(s || {})
  ].map(ct), c = /* @__PURE__ */ new Set();
  for (const d of u) {
    if (c.has(d)) continue;
    c.add(d);
    const f = r(s?.[d]?.[o]);
    if (f) return f;
  }
  return r(e?.delegateConfig?.[o]);
}
function ug(e = {}, t, n) {
  const o = (u) => String(u || "").trim();
  if (o(e?.tavilyBaseUrl)) return Bn(e.tavilyBaseUrl);
  const r = Js(e, t), i = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(r || {})
  ].map(ct), s = /* @__PURE__ */ new Set();
  for (const u of i) {
    if (s.has(u)) continue;
    s.add(u);
    const c = r?.[u]?.tavilyBaseUrl;
    if (o(c)) return Bn(c);
  }
  return o(e?.delegateConfig?.tavilyBaseUrl) ? Bn(e.delegateConfig.tavilyBaseUrl) : Bn();
}
function Ed(e = {}, t, n) {
  return {
    tavilyApiKey: lg(e, t, n, "tavilyApiKey", fd),
    tavilyBaseUrl: ug(e, t, n)
  };
}
function cR(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: o = (p) => String(p || "") } = t, r = ct(e.currentPresetName || e.presetName || "默认"), i = vd(e, r), s = Ad(i, e.currentPresetName), u = Td(i, e.delegatePresetName, s), c = i[u] || i[s] || Ct(), d = Ks(e.delegateConfig, c), f = Sd(e, i, s, u), h = vr(e, Ed(e, r, s));
  return {
    workspaceFileName: o(e.workspaceFileName || n),
    jsApiPermission: yd(e.jsApiPermission),
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
function cg(e = {}) {
  const t = ct(e.currentPresetName || e.presetDraftName || "默认"), n = vd(e, t), o = Ad(n, e.currentPresetName), r = Td(n, e.delegatePresetName, o), i = n[o] || Ct(), s = n[r] || i, u = Ks(e.delegateConfig, s), c = Sd(e, n, o, r), d = vr(e, Ed(e, t, o));
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    updatedAt: Number(e.updatedAt) || 0,
    jsApiPermission: yd(e.jsApiPermission),
    currentPresetName: o,
    delegatePresetName: r,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: ct(e.presetDraftName || o),
    presetNames: Object.keys(n),
    presets: n,
    provider: i.provider,
    modelConfigs: i.modelConfigs,
    permissionMode: _d(i.permissionMode),
    ...d
  };
}
function dg(e = "") {
  return String(e || "").trim().toLowerCase();
}
function qr(e = "") {
  const t = dg(e);
  return t.includes("deepseek") ? "deepseek" : t.includes("kimi") || t.includes("moonshot") ? "kimi" : t.includes("gemini") ? "gemini" : t.includes("claude") ? "claude" : /(?:^|[/_.-])gpt(?:\d|[/_.-]|$)/.test(t) || /(?:^|[/_.-])o\d+(?:[/_.-]|$)/.test(t) ? "openai" : "";
}
var fg = Object.freeze({
  minimal: "最小",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "超高",
  max: "最大",
  min: "最小"
});
function Cd(e) {
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
function je(e, t, n, o, r = {}) {
  return Cd({
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
var Ws = Cd({
  profileId: "unsupported",
  modes: ["inherit"],
  outputModes: ["hide"],
  intensity: { kind: "none" },
  unsupportedReason: "当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。"
}), _o = Object.freeze(["on"]), zs = Object.freeze([
  "inherit",
  "on",
  "off"
]), wd = je("openai-gpt-5.6", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "medium", { temperatureOmitModes: zs }), hg = je("kimi-k3", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "max", { temperatureOmitModes: _o }), pg = je("deepseek-thinking", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "high", { temperatureOmitModes: _o }), mg = je("openai-compatible-gemini-latest", [
  "inherit",
  "on",
  "off"
], [
  "minimal",
  "low",
  "medium",
  "high"
], "high", { temperatureOmitModes: _o }), gg = je("openai-compatible-claude-latest", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: _o }), _g = je("openai-compatible-default", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high"
], "medium", { temperatureOmitModes: _o }), yg = je("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: zs }), vg = je("sillytavern-claude-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: zs }), Ag = je("google-gemini-3-flash", ["inherit", "on"], [
  "minimal",
  "low",
  "medium",
  "high"
], "high"), Tg = je("sillytavern-google-3-flash", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high"
], "high");
function Sg(e = "") {
  switch (qr(e)) {
    case "deepseek":
      return pg;
    case "kimi":
      return hg;
    case "gemini":
      return mg;
    case "claude":
      return gg;
    case "openai":
      return wd;
    default:
      return _g;
  }
}
function Ys(e = {}) {
  const t = String(e.provider || "").trim(), n = String(e.model || "").trim().toLowerCase();
  switch (t) {
    case "openai-responses":
      return wd;
    case "openai-compatible":
    case "sillytavern-openai-compatible":
      return Sg(n);
    case "anthropic":
      return yg;
    case "sillytavern-claude":
      return vg;
    case "google":
      return Ag;
    case "sillytavern-google":
      return Tg;
    default:
      return Ws;
  }
}
function dR(e = Ws) {
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
function fR(e = Ws) {
  return e.intensity?.kind !== "effort" ? [] : e.intensity.values.map((t) => ({
    value: t,
    label: fg[t] || t
  }));
}
function ci(e, t, n, o = "REASONING_CAPABILITY_UNSUPPORTED") {
  return {
    ...e,
    profileId: t.profileId,
    valid: !1,
    error: n,
    code: o
  };
}
function Eg(e, t) {
  const n = { ...e };
  return delete n.effort, delete n.budgetTokens, t.intensity?.kind === "effort" ? {
    ...n,
    ...e.effort ? { effort: e.effort } : {}
  } : n;
}
function Tr(e = {}, t = {}) {
  const n = Ys(e), o = Bs(t), r = t?.output === "show" || t?.output === "hide" ? t.output : null, i = Eg({
    ...o,
    output: o.mode === "off" ? "hide" : r || (n.outputModes.includes("show") ? "show" : "hide")
  }, n);
  if (!n.outputModes.includes(i.output)) return ci(i, n, "当前任务要求返回 Reasoning 内容，但所选模型不支持。");
  if (!n.modes.includes(i.mode)) return ci(i, n, i.mode === "off" ? "当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。" : n.unsupportedReason || "当前模型不支持显式开启 Reasoning。");
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
    } : ci(i, n, `当前模型不支持 Reasoning 强度“${s}”。`, "REASONING_CONFIG_INVALID");
  }
  return {
    ...i,
    profileId: n.profileId,
    valid: !0
  };
}
var Cg = class extends Error {
  constructor(e = {}) {
    super(e.error || "当前模型不支持所选 Reasoning 配置。"), this.name = "ReasoningCapabilityError", this.code = e.code || "REASONING_CAPABILITY_UNSUPPORTED", this.profileId = e.profileId || "unsupported", this.reasoning = e;
  }
};
function Id(e = {}) {
  if (e.valid === !1) throw new Cg(e);
  return e;
}
function j(e = "", t = {}, n = {}, o = {}) {
  return Id(Tr({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model,
    maxTokens: o.maxTokens ?? t.maxTokens
  }, n));
}
function yo(e = {}, t = {}) {
  return Ys(e).temperatureOmitModes.includes(t.mode);
}
var hR = 900 * 1e3, pR = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), wg = Object.freeze([
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
function mR(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function bd(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, o = Number(n);
  return Number.isFinite(o) ? Math.max(0, Math.min(2, o)) : bd(t, 1);
}
function Oi(e = {}) {
  return e.sendTemperature !== !1;
}
function Za(e = {}) {
  return Oi(e) ? bd(e.temperature, 1) : void 0;
}
function gR(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : wg.find((n) => n.value === e)?.label || e || "未配置";
}
function _R(e = {}) {
  const t = String(e.provider || "").trim();
  return t === "openai-compatible" || t === "sillytavern-openai-compatible" ? e.toolMode === "tagged-json" ? "Tagged JSON 兼容模式" : "原生 Tool Calling" : "Provider 原生工具";
}
function yR(e = {}, t = {}) {
  const n = cg(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const d = n.delegateConfig.provider || "openai-compatible", f = (n.delegateConfig.modelConfigs || tn())[d] || tn()[d] || {}, h = {
      provider: d,
      baseUrl: String(f.baseUrl || ""),
      model: String(f.model || ""),
      maxTokens: qn(f.maxTokens)
    };
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: d,
      baseUrl: String(f.baseUrl || ""),
      model: String(f.model || ""),
      apiKey: String(f.apiKey || ""),
      ...Ui(d) ? { modelListAuth: f.modelListAuth } : {},
      ...vr(n),
      temperature: Za(f),
      sendTemperature: Oi(f),
      maxTokens: qn(f.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: f.toolMode || "native",
      reasoning: Tr(h, f.reasoning)
    };
  }
  const o = ct(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), r = n.presets?.[o] ? o : n.presets?.[n.currentPresetName] ? n.currentPresetName : qs, i = n.presets?.[r] || Ct(), s = i.provider || n.provider || "openai-compatible", u = (i.modelConfigs || n.modelConfigs || tn())[s] || tn()[s] || {}, c = {
    provider: s,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    maxTokens: qn(u.maxTokens)
  };
  return {
    currentPresetName: String(r || ""),
    provider: s,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    ...Ui(s) ? { modelListAuth: u.modelListAuth } : {},
    ...vr(n),
    temperature: Za(u),
    sendTemperature: Oi(u),
    maxTokens: qn(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoning: Tr(c, u.reasoning)
  };
}
function D(e, t, n, o, r) {
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
var Rd = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Rd = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function co(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Gi = (e) => {
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
}, Re = class Bi extends B {
  constructor(t, n, o, r, i) {
    super(`${Bi.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new Hr({
      message: o,
      cause: Gi(n)
    });
    const i = n, s = i?.error?.type;
    return t === 400 ? new Md(t, i, o, r, s) : t === 401 ? new xd(t, i, o, r, s) : t === 403 ? new Nd(t, i, o, r, s) : t === 404 ? new kd(t, i, o, r, s) : t === 409 ? new Dd(t, i, o, r, s) : t === 422 ? new $d(t, i, o, r, s) : t === 429 ? new Ld(t, i, o, r, s) : t >= 500 ? new Ud(t, i, o, r, s) : new Bi(t, i, o, r, s);
  }
}, Ve = class extends Re {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Hr = class extends Re {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Pd = class extends Hr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Md = class extends Re {
}, xd = class extends Re {
}, Nd = class extends Re {
}, kd = class extends Re {
}, Dd = class extends Re {
}, $d = class extends Re {
}, Ld = class extends Re {
}, Ud = class extends Re {
}, Ig = /^[a-z][a-z0-9+.-]*:/i, bg = (e) => Ig.test(e), qi = (e) => (qi = Array.isArray, qi(e)), ja = qi;
function Hi(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function el(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Rg(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Pg = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new B(`${e} must be an integer`);
  if (t < 0) throw new B(`${e} must be a positive integer`);
  return t;
}, Fd = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Mg = (e) => new Promise((t) => setTimeout(t, e)), Xt = "0.91.1", xg = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function Ng() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var kg = () => {
  const e = Ng();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Xt,
    "X-Stainless-OS": nl(Deno.build.os),
    "X-Stainless-Arch": tl(Deno.build.arch),
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
    "X-Stainless-OS": nl(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": tl(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Dg();
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
function Dg() {
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
var tl = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", nl = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), ol, $g = () => ol ?? (ol = kg());
function Lg() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Od(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Gd(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Od({
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
function Xs(e) {
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
async function Ug(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Fg = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Og(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new B(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function Gg(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var rl;
function Qs(e) {
  let t;
  return (rl ?? (t = new globalThis.TextEncoder(), rl = t.encode.bind(t)))(e);
}
var il;
function sl(e) {
  let t;
  return (il ?? (t = new globalThis.TextDecoder(), il = t.decode.bind(t)))(e);
}
var Ee, Ce, vo = class {
  constructor() {
    Ee.set(this, void 0), Ce.set(this, void 0), D(this, Ee, new Uint8Array(), "f"), D(this, Ce, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Qs(e) : e;
    D(this, Ee, Gg([A(this, Ee, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = Bg(A(this, Ee, "f"), A(this, Ce, "f"))) != null; ) {
      if (o.carriage && A(this, Ce, "f") == null) {
        D(this, Ce, o.index, "f");
        continue;
      }
      if (A(this, Ce, "f") != null && (o.index !== A(this, Ce, "f") + 1 || o.carriage)) {
        n.push(sl(A(this, Ee, "f").subarray(0, A(this, Ce, "f") - 1))), D(this, Ee, A(this, Ee, "f").subarray(A(this, Ce, "f")), "f"), D(this, Ce, null, "f");
        continue;
      }
      const r = A(this, Ce, "f") !== null ? o.preceding - 1 : o.preceding, i = sl(A(this, Ee, "f").subarray(0, r));
      n.push(i), D(this, Ee, A(this, Ee, "f").subarray(o.index), "f"), D(this, Ce, null, "f");
    }
    return n;
  }
  flush() {
    return A(this, Ee, "f").length ? this.decode(`
`) : [];
  }
};
Ee = /* @__PURE__ */ new WeakMap(), Ce = /* @__PURE__ */ new WeakMap();
vo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
vo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Bg(e, t) {
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
function qg(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var Sr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, al = (e, t, n) => {
  if (e) {
    if (Rg(Sr, e)) return e;
    pe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Sr))}`);
  }
};
function Hn() {
}
function xo(e, t, n) {
  return !t || Sr[e] > Sr[n] ? Hn : t[e].bind(t);
}
var Hg = {
  error: Hn,
  warn: Hn,
  info: Hn,
  debug: Hn
}, ll = /* @__PURE__ */ new WeakMap();
function pe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Hg;
  const o = ll.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: xo("error", t, n),
    warn: xo("warn", t, n),
    info: xo("info", t, n),
    debug: xo("debug", t, n)
  };
  return ll.set(t, [n, r]), r;
}
var xt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Sn, fo = class Vn {
  constructor(t, n, o) {
    this.iterator = t, Sn.set(this, void 0), this.controller = n, D(this, Sn, o, "f");
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? pe(o) : console;
    async function* s() {
      if (r) throw new B("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of Vg(t, n)) {
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
            const d = Fd(c.data) ?? c.data, f = d?.error?.type;
            throw new Re(void 0, d, void 0, t.headers, f);
          }
        }
        u = !0;
      } catch (c) {
        if (co(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Vn(s, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    async function* i() {
      const u = new vo(), c = Xs(t);
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
        if (co(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Vn(s, n, o);
  }
  [(Sn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Vn(() => r(t), this.controller, A(this, Sn, "f")), new Vn(() => r(n), this.controller, A(this, Sn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Od({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const s = Qs(JSON.stringify(r) + `
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
async function* Vg(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new B("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new B("Attempted to iterate over a response with no body");
  const n = new Kg(), o = new vo(), r = Xs(e.body);
  for await (const i of Jg(r)) for (const s of o.decode(i)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const s = n.decode(i);
    s && (yield s);
  }
}
async function* Jg(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Qs(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = qg(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Kg = class {
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
    let [t, n, o] = Wg(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Wg(e, t) {
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
async function Bd(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, s = await (async () => {
    if (t.options.stream)
      return pe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : fo.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : qd(await n.json(), n) : await n.text();
  })();
  return pe(e).debug(`[${o}] response parsed`, xt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
function qd(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var Jn, Hd = class Vd extends Promise {
  constructor(t, n, o = Bd) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, Jn.set(this, void 0), D(this, Jn, t, "f");
  }
  _thenUnwrap(t) {
    return new Vd(A(this, Jn, "f"), this.responsePromise, async (n, o) => qd(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(A(this, Jn, "f"), t))), this.parsedPromise;
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
Jn = /* @__PURE__ */ new WeakMap();
var No, Jd = class {
  constructor(e, t, n, o) {
    No.set(this, void 0), D(this, No, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new B("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await A(this, No, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(No = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, zg = class extends Hd {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await Bd(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, Ao = class extends Jd {
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
          ...Hi(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Hi(this.options.query),
        after_id: e
      }
    } : null;
  }
}, Te = class extends Jd {
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
        ...Hi(this.options.query),
        page: e
      }
    } : null;
  }
}, Kd = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function un(e, t, n) {
  return Kd(), new File(e, t ?? "unknown_file", n);
}
function ir(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Wd = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Zs = async (e, t, n = !0) => ({
  ...e,
  body: await Xg(e.body, t, n)
}), ul = /* @__PURE__ */ new WeakMap();
function Yg(e) {
  const t = typeof e == "function" ? e : e.fetch, n = ul.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return ul.set(t, o), o;
}
var Xg = async (e, t, n = !0) => {
  if (!await Yg(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const o = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, i]) => Vi(o, r, i, n))), o;
}, Qg = (e) => e instanceof Blob && "name" in e, Vi = async (e, t, n, o) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let r = {};
      const i = n.headers.get("Content-Type");
      i && (r = { type: i }), e.append(t, un([await n.blob()], ir(n, o), r));
    } else if (Wd(n)) e.append(t, un([await new Response(Gd(n)).blob()], ir(n, o)));
    else if (Qg(n)) e.append(t, un([n], ir(n, o), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Vi(e, t + "[]", r, o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, i]) => Vi(e, `${t}[${r}]`, i, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, zd = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Zg = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && zd(e), jg = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function e_(e, t, n) {
  if (Kd(), e = await e, t || (t = ir(e, !0)), Zg(e))
    return e instanceof File && t == null && n == null ? e : un([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (jg(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), un(await Ji(r), t, n);
  }
  const o = await Ji(e);
  if (!n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return un(o, t, n);
}
async function Ji(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (zd(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Wd(e)) for await (const n of e) t.push(...await Ji(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${t_(e)}`);
  }
  return t;
}
function t_(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Z = class {
  constructor(e) {
    this._client = e;
  }
}, Yd = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* n_(e) {
  if (!e) return;
  if (Yd in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : ja(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = ja(o[1]) ? o[1] : [o[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [r, null]), yield [r, u]);
  }
}
var R = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, s] of n_(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [Yd]: !0,
    values: t,
    nulls: n
  };
};
function Xd(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var cl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), o_ = (e = Xd) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], s = n.reduce((f, h, p) => {
    /[?#]/.test(h) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? cl) ?? cl)?.toString) && (g = m + "", i.push({
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
}, U = /* @__PURE__ */ o_(Xd), Qd = class extends Z {
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
    return this._client.getAPIList("/v1/environments?beta=true", Te, {
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
}, ro = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function sr(e) {
  return typeof e == "object" && e !== null && ro in e;
}
function Zd(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const o of e) sr(o) && n.add(o[ro]);
  if (t) {
    for (const o of t)
      if (sr(o) && n.add(o[ro]), Array.isArray(o.content))
        for (const r of o.content) sr(r) && n.add(r[ro]);
  }
  return Array.from(n);
}
function jd(e, t) {
  const n = Zd(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function r_(e) {
  return sr(e) ? { "x-stainless-helper": e[ro] } : {};
}
var ef = class extends Z {
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", Ao, {
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
    return this._client.post("/v1/files?beta=true", Zs({
      body: o,
      ...t,
      headers: R([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        r_(o.file),
        t?.headers
      ])
    }, this._client));
  }
}, tf = class extends Z {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/models/${e}?beta=true`, {
      ...n,
      headers: R([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", Ao, {
      query: o,
      ...t,
      headers: R([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, nf = class extends Z {
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
    return this._client.getAPIList("/v1/user_profiles?beta=true", Te, {
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
}, of = class extends Z {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/agents/${e}/versions?beta=true`, Te, {
      query: r,
      ...n,
      headers: R([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, js = class extends Z {
  constructor() {
    super(...arguments), this.versions = new of(this._client);
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
    return this._client.getAPIList("/v1/agents?beta=true", Te, {
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
js.Versions = of;
var rf = class extends Z {
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
    return this._client.getAPIList(U`/v1/memory_stores/${e}/memories?beta=true`, Te, {
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
}, sf = class extends Z {
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
    return this._client.getAPIList(U`/v1/memory_stores/${e}/memory_versions?beta=true`, Te, {
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
}, Vr = class extends Z {
  constructor() {
    super(...arguments), this.memories = new rf(this._client), this.memoryVersions = new sf(this._client);
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
    return this._client.getAPIList("/v1/memory_stores?beta=true", Te, {
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
Vr.Memories = rf;
Vr.MemoryVersions = sf;
var af = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function lf(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function dl(e, t, n) {
  const o = lf(t);
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
  } : uf(e, t, n);
}
function uf(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const s = i_(t, i.text);
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
function i_(e, t) {
  const n = lf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new B(`Failed to parse structured output: ${o}`);
  }
}
var s_ = (e) => {
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
}, Qt = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Qt(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Qt(e);
    case "string":
      let o = e[e.length - 2];
      if (o?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Qt(e);
      if (o?.type === "brace" && o.value === "{")
        return e = e.slice(0, e.length - 1), Qt(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Qt(e);
  }
  return e;
}, a_ = (e) => {
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
}, l_ = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, cf = (e) => JSON.parse(l_(a_(Qt(s_(e))))), Ne, mt, Jt, En, ko, Cn, wn, Do, In, tt, bn, $o, Lo, Rt, Uo, Fo, Rn, di, fl, Oo, fi, hi, pi, hl, pl = "__json_buf";
function ml(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var u_ = class Ki {
  constructor(t, n) {
    Ne.add(this), this.messages = [], this.receivedMessages = [], mt.set(this, void 0), Jt.set(this, null), this.controller = new AbortController(), En.set(this, void 0), ko.set(this, () => {
    }), Cn.set(this, () => {
    }), wn.set(this, void 0), Do.set(this, () => {
    }), In.set(this, () => {
    }), tt.set(this, {}), bn.set(this, !1), $o.set(this, !1), Lo.set(this, !1), Rt.set(this, !1), Uo.set(this, void 0), Fo.set(this, void 0), Rn.set(this, void 0), Oo.set(this, (o) => {
      if (D(this, $o, !0, "f"), co(o) && (o = new Ve()), o instanceof Ve)
        return D(this, Lo, !0, "f"), this._emit("abort", o);
      if (o instanceof B) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new B(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new B(String(o)));
    }), D(this, En, new Promise((o, r) => {
      D(this, ko, o, "f"), D(this, Cn, r, "f");
    }), "f"), D(this, wn, new Promise((o, r) => {
      D(this, Do, o, "f"), D(this, In, r, "f");
    }), "f"), A(this, En, "f").catch(() => {
    }), A(this, wn, "f").catch(() => {
    }), D(this, Jt, t, "f"), D(this, Rn, n?.logger ?? console, "f");
  }
  get response() {
    return A(this, Uo, "f");
  }
  get request_id() {
    return A(this, Fo, "f");
  }
  async withResponse() {
    D(this, Rt, !0, "f");
    const t = await A(this, En, "f");
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
    }, A(this, Oo, "f"));
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
      A(this, Ne, "m", fi).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) A(this, Ne, "m", hi).call(this, c);
      if (u.controller.signal?.aborted) throw new Ve();
      A(this, Ne, "m", pi).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (D(this, Uo, t, "f"), D(this, Fo, t?.headers.get("request-id"), "f"), A(this, ko, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return A(this, bn, "f");
  }
  get errored() {
    return A(this, $o, "f");
  }
  get aborted() {
    return A(this, Lo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (A(this, tt, "f")[t] || (A(this, tt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = A(this, tt, "f")[t];
    if (!o) return this;
    const r = o.findIndex((i) => i.listener === n);
    return r >= 0 && o.splice(r, 1), this;
  }
  once(t, n) {
    return (A(this, tt, "f")[t] || (A(this, tt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      D(this, Rt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    D(this, Rt, !0, "f"), await A(this, wn, "f");
  }
  get currentMessage() {
    return A(this, mt, "f");
  }
  async finalMessage() {
    return await this.done(), A(this, Ne, "m", di).call(this);
  }
  async finalText() {
    return await this.done(), A(this, Ne, "m", fl).call(this);
  }
  _emit(t, ...n) {
    if (A(this, bn, "f")) return;
    t === "end" && (D(this, bn, !0, "f"), A(this, Do, "f").call(this));
    const o = A(this, tt, "f")[t];
    if (o && (A(this, tt, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !A(this, Rt, "f") && !o?.length && Promise.reject(r), A(this, Cn, "f").call(this, r), A(this, In, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !A(this, Rt, "f") && !o?.length && Promise.reject(r), A(this, Cn, "f").call(this, r), A(this, In, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", A(this, Ne, "m", di).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      A(this, Ne, "m", fi).call(this), this._connected(null);
      const i = fo.fromReadableStream(t, this.controller);
      for await (const s of i) A(this, Ne, "m", hi).call(this, s);
      if (i.controller.signal?.aborted) throw new Ve();
      A(this, Ne, "m", pi).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(mt = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), ko = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), Do = /* @__PURE__ */ new WeakMap(), In = /* @__PURE__ */ new WeakMap(), tt = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakMap(), $o = /* @__PURE__ */ new WeakMap(), Lo = /* @__PURE__ */ new WeakMap(), Rt = /* @__PURE__ */ new WeakMap(), Uo = /* @__PURE__ */ new WeakMap(), Fo = /* @__PURE__ */ new WeakMap(), Rn = /* @__PURE__ */ new WeakMap(), Oo = /* @__PURE__ */ new WeakMap(), Ne = /* @__PURE__ */ new WeakSet(), di = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, fl = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new B("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, fi = function() {
    this.ended || D(this, mt, void 0, "f");
  }, hi = function(n) {
    if (this.ended) return;
    const o = A(this, Ne, "m", hl).call(this, n);
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
            ml(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
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
        this._addMessageParam(o), this._addMessage(dl(o, A(this, Jt, "f"), { logger: A(this, Rn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        D(this, mt, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, pi = function() {
    if (this.ended) throw new B("stream has ended, this shouldn't happen");
    const n = A(this, mt, "f");
    if (!n) throw new B("request ended without sending any chunks");
    return D(this, mt, void 0, "f"), dl(n, A(this, Jt, "f"), { logger: A(this, Rn, "f") });
  }, hl = function(n) {
    let o = A(this, mt, "f");
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
            if (r && ml(r)) {
              let i = r[pl] || "";
              i += n.delta.partial_json;
              const s = { ...r };
              if (Object.defineProperty(s, pl, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                s.input = cf(i);
              } catch (u) {
                const c = new B(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                A(this, Oo, "f").call(this, c);
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
    return new fo(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, df = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var c_ = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, Pn, Kt, Pt, ne, ye, Se, at, gt, Mn, gl, Wi;
function _l() {
  let e, t;
  return {
    promise: new Promise((n, o) => {
      e = n, t = o;
    }),
    resolve: e,
    reject: t
  };
}
var ff = class {
  constructor(e, t, n) {
    Pn.add(this), this.client = e, Kt.set(this, !1), Pt.set(this, !1), ne.set(this, void 0), ye.set(this, void 0), Se.set(this, void 0), at.set(this, void 0), gt.set(this, void 0), Mn.set(this, 0), D(this, ne, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const o = ["BetaToolRunner", ...Zd(t.tools, t.messages)].join(", ");
    D(this, ye, {
      ...n,
      headers: R([{ "x-stainless-helper": o }, n?.headers])
    }, "f"), D(this, gt, _l(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Kt = /* @__PURE__ */ new WeakMap(), Pt = /* @__PURE__ */ new WeakMap(), ne = /* @__PURE__ */ new WeakMap(), ye = /* @__PURE__ */ new WeakMap(), Se = /* @__PURE__ */ new WeakMap(), at = /* @__PURE__ */ new WeakMap(), gt = /* @__PURE__ */ new WeakMap(), Mn = /* @__PURE__ */ new WeakMap(), Pn = /* @__PURE__ */ new WeakSet(), gl = async function() {
    const t = A(this, ne, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (A(this, Se, "f") !== void 0) try {
      const c = await A(this, Se, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const o = t.contextTokenThreshold ?? 1e5;
    if (n < o) return !1;
    const r = t.model ?? A(this, ne, "f").params.model, i = t.summaryPrompt ?? c_, s = A(this, ne, "f").params.messages;
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
      signal: A(this, ye, "f").signal,
      headers: R([A(this, ye, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new B("Expected text response for compaction");
    return A(this, ne, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (A(this, Kt, "f")) throw new B("Cannot iterate over a consumed stream");
    D(this, Kt, !0, "f"), D(this, Pt, !0, "f"), D(this, at, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (A(this, ne, "f").params.max_iterations && A(this, Mn, "f") >= A(this, ne, "f").params.max_iterations) break;
          D(this, Pt, !1, "f"), D(this, at, void 0, "f"), D(this, Mn, (e = A(this, Mn, "f"), e++, e), "f"), D(this, Se, void 0, "f");
          const { max_iterations: n, compactionControl: o, ...r } = A(this, ne, "f").params;
          if (r.stream ? (t = this.client.beta.messages.stream({ ...r }, A(this, ye, "f")), D(this, Se, t.finalMessage(), "f"), A(this, Se, "f").catch(() => {
          }), yield t) : (D(this, Se, this.client.beta.messages.create({
            ...r,
            stream: !1
          }, A(this, ye, "f")), "f"), yield A(this, Se, "f")), !await A(this, Pn, "m", gl).call(this)) {
            if (!A(this, Pt, "f")) {
              const { role: s, content: u } = await A(this, Se, "f");
              A(this, ne, "f").params.messages.push({
                role: s,
                content: u
              });
            }
            const i = await A(this, Pn, "m", Wi).call(this, A(this, ne, "f").params.messages.at(-1));
            if (i) A(this, ne, "f").params.messages.push(i);
            else if (!A(this, Pt, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!A(this, Se, "f")) throw new B("ToolRunner concluded without a message from the server");
      A(this, gt, "f").resolve(await A(this, Se, "f"));
    } catch (t) {
      throw D(this, Kt, !1, "f"), A(this, gt, "f").promise.catch(() => {
      }), A(this, gt, "f").reject(t), D(this, gt, _l(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? A(this, ne, "f").params = e(A(this, ne, "f").params) : A(this, ne, "f").params = e, D(this, Pt, !0, "f"), D(this, at, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? D(this, ye, e(A(this, ye, "f")), "f") : D(this, ye, {
      ...A(this, ye, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = A(this, ye, "f").signal) {
    const t = await A(this, Se, "f") ?? this.params.messages.at(-1);
    return t ? A(this, Pn, "m", Wi).call(this, t, e) : null;
  }
  done() {
    return A(this, gt, "f").promise;
  }
  async runUntilDone() {
    if (!A(this, Kt, "f")) for await (const e of this) ;
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
Wi = async function(t, n = A(this, ye, "f").signal) {
  return A(this, at, "f") !== void 0 ? A(this, at, "f") : (D(this, at, d_(A(this, ne, "f").params, t, {
    ...A(this, ye, "f"),
    signal: n
  }), "f"), A(this, at, "f"));
};
async function d_(e, t = e.messages.at(-1), n) {
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
          content: s instanceof df ? s.content : `Error: ${s instanceof Error ? s.message : String(s)}`,
          is_error: !0
        };
      }
    }))
  };
}
var hf = class pf {
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
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new B("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new B("Attempted to iterate over a response with no body");
    return new pf(Xs(t.body), n);
  }
}, mf = class extends Z {
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
    return this._client.getAPIList("/v1/messages/batches?beta=true", Ao, {
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
    })._thenUnwrap((i, s) => hf.fromResponse(s.response, s.controller));
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
  "claude-3-7-sonnet-20250219": "February 19th, 2026"
}, f_ = ["claude-mythos-preview", "claude-opus-4-6"], To = class extends Z {
  constructor() {
    super(...arguments), this.batches = new mf(this._client);
  }
  create(e, t) {
    const n = vl(e), { betas: o, ...r } = n;
    r.model in yl && console.warn(`The model '${r.model}' is deprecated and will reach end-of-life on ${yl[r.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), f_.includes(r.model) && r.thinking && r.thinking.type === "enabled" && console.warn(`Using Claude with ${r.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!r.stream && i == null) {
      const u = af[r.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(r.max_tokens, u);
    }
    const s = jd(r.tools, r.messages);
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
    }, this.create(e, t).then((n) => uf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return u_.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...o } = vl(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: o,
      ...t,
      headers: R([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new ff(this._client, e, t);
  }
};
function vl(e) {
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
To.Batches = mf;
To.BetaToolRunner = ff;
To.ToolError = df;
var gf = class extends Z {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(U`/v1/sessions/${e}/events?beta=true`, Te, {
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
}, _f = class extends Z {
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
    return this._client.getAPIList(U`/v1/sessions/${e}/resources?beta=true`, Te, {
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
}, Jr = class extends Z {
  constructor() {
    super(...arguments), this.events = new gf(this._client), this.resources = new _f(this._client);
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
    return this._client.getAPIList("/v1/sessions?beta=true", Te, {
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
Jr.Events = gf;
Jr.Resources = _f;
var yf = class extends Z {
  create(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.post(U`/v1/skills/${e}/versions?beta=true`, Zs({
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
    return this._client.getAPIList(U`/v1/skills/${e}/versions?beta=true`, Te, {
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
}, ea = class extends Z {
  constructor() {
    super(...arguments), this.versions = new yf(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Zs({
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
    return this._client.getAPIList("/v1/skills?beta=true", Te, {
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
ea.Versions = yf;
var vf = class extends Z {
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
    return this._client.getAPIList(U`/v1/vaults/${e}/credentials?beta=true`, Te, {
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
}, ta = class extends Z {
  constructor() {
    super(...arguments), this.credentials = new vf(this._client);
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
    return this._client.getAPIList("/v1/vaults?beta=true", Te, {
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
ta.Credentials = vf;
var Ue = class extends Z {
  constructor() {
    super(...arguments), this.models = new tf(this._client), this.messages = new To(this._client), this.agents = new js(this._client), this.environments = new Qd(this._client), this.sessions = new Jr(this._client), this.vaults = new ta(this._client), this.memoryStores = new Vr(this._client), this.files = new ef(this._client), this.skills = new ea(this._client), this.userProfiles = new nf(this._client);
  }
};
Ue.Models = tf;
Ue.Messages = To;
Ue.Agents = js;
Ue.Environments = Qd;
Ue.Sessions = Jr;
Ue.Vaults = ta;
Ue.MemoryStores = Vr;
Ue.Files = ef;
Ue.Skills = ea;
Ue.UserProfiles = nf;
var Af = class extends Z {
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
function Tf(e) {
  return e?.output_config?.format;
}
function Al(e, t, n) {
  const o = Tf(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((r) => r.type === "text" ? Object.defineProperty({ ...r }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : r),
    parsed_output: null
  } : Sf(e, t, n);
}
function Sf(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const s = h_(t, i.text);
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
function h_(e, t) {
  const n = Tf(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new B(`Failed to parse structured output: ${o}`);
  }
}
var ke, _t, Wt, xn, Go, Nn, kn, Bo, Dn, nt, $n, qo, Ho, Mt, Vo, Jo, Ln, mi, Tl, gi, _i, yi, vi, Sl, El = "__json_buf";
function Cl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var p_ = class zi {
  constructor(t, n) {
    ke.add(this), this.messages = [], this.receivedMessages = [], _t.set(this, void 0), Wt.set(this, null), this.controller = new AbortController(), xn.set(this, void 0), Go.set(this, () => {
    }), Nn.set(this, () => {
    }), kn.set(this, void 0), Bo.set(this, () => {
    }), Dn.set(this, () => {
    }), nt.set(this, {}), $n.set(this, !1), qo.set(this, !1), Ho.set(this, !1), Mt.set(this, !1), Vo.set(this, void 0), Jo.set(this, void 0), Ln.set(this, void 0), gi.set(this, (o) => {
      if (D(this, qo, !0, "f"), co(o) && (o = new Ve()), o instanceof Ve)
        return D(this, Ho, !0, "f"), this._emit("abort", o);
      if (o instanceof B) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new B(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new B(String(o)));
    }), D(this, xn, new Promise((o, r) => {
      D(this, Go, o, "f"), D(this, Nn, r, "f");
    }), "f"), D(this, kn, new Promise((o, r) => {
      D(this, Bo, o, "f"), D(this, Dn, r, "f");
    }), "f"), A(this, xn, "f").catch(() => {
    }), A(this, kn, "f").catch(() => {
    }), D(this, Wt, t, "f"), D(this, Ln, n?.logger ?? console, "f");
  }
  get response() {
    return A(this, Vo, "f");
  }
  get request_id() {
    return A(this, Jo, "f");
  }
  async withResponse() {
    D(this, Mt, !0, "f");
    const t = await A(this, xn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new zi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: r } = {}) {
    const i = new zi(n, { logger: r });
    for (const s of n.messages) i._addMessageParam(s);
    return D(i, Wt, {
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
    }, A(this, gi, "f"));
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
      A(this, ke, "m", _i).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) A(this, ke, "m", yi).call(this, c);
      if (u.controller.signal?.aborted) throw new Ve();
      A(this, ke, "m", vi).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (D(this, Vo, t, "f"), D(this, Jo, t?.headers.get("request-id"), "f"), A(this, Go, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return A(this, $n, "f");
  }
  get errored() {
    return A(this, qo, "f");
  }
  get aborted() {
    return A(this, Ho, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (A(this, nt, "f")[t] || (A(this, nt, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = A(this, nt, "f")[t];
    if (!o) return this;
    const r = o.findIndex((i) => i.listener === n);
    return r >= 0 && o.splice(r, 1), this;
  }
  once(t, n) {
    return (A(this, nt, "f")[t] || (A(this, nt, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      D(this, Mt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    D(this, Mt, !0, "f"), await A(this, kn, "f");
  }
  get currentMessage() {
    return A(this, _t, "f");
  }
  async finalMessage() {
    return await this.done(), A(this, ke, "m", mi).call(this);
  }
  async finalText() {
    return await this.done(), A(this, ke, "m", Tl).call(this);
  }
  _emit(t, ...n) {
    if (A(this, $n, "f")) return;
    t === "end" && (D(this, $n, !0, "f"), A(this, Bo, "f").call(this));
    const o = A(this, nt, "f")[t];
    if (o && (A(this, nt, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !A(this, Mt, "f") && !o?.length && Promise.reject(r), A(this, Nn, "f").call(this, r), A(this, Dn, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !A(this, Mt, "f") && !o?.length && Promise.reject(r), A(this, Nn, "f").call(this, r), A(this, Dn, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", A(this, ke, "m", mi).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      A(this, ke, "m", _i).call(this), this._connected(null);
      const i = fo.fromReadableStream(t, this.controller);
      for await (const s of i) A(this, ke, "m", yi).call(this, s);
      if (i.controller.signal?.aborted) throw new Ve();
      A(this, ke, "m", vi).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(_t = /* @__PURE__ */ new WeakMap(), Wt = /* @__PURE__ */ new WeakMap(), xn = /* @__PURE__ */ new WeakMap(), Go = /* @__PURE__ */ new WeakMap(), Nn = /* @__PURE__ */ new WeakMap(), kn = /* @__PURE__ */ new WeakMap(), Bo = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap(), nt = /* @__PURE__ */ new WeakMap(), $n = /* @__PURE__ */ new WeakMap(), qo = /* @__PURE__ */ new WeakMap(), Ho = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap(), Vo = /* @__PURE__ */ new WeakMap(), Jo = /* @__PURE__ */ new WeakMap(), Ln = /* @__PURE__ */ new WeakMap(), gi = /* @__PURE__ */ new WeakMap(), ke = /* @__PURE__ */ new WeakSet(), mi = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Tl = function() {
    if (this.receivedMessages.length === 0) throw new B("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new B("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, _i = function() {
    this.ended || D(this, _t, void 0, "f");
  }, yi = function(n) {
    if (this.ended) return;
    const o = A(this, ke, "m", Sl).call(this, n);
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
            Cl(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
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
        this._addMessageParam(o), this._addMessage(Al(o, A(this, Wt, "f"), { logger: A(this, Ln, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        D(this, _t, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, vi = function() {
    if (this.ended) throw new B("stream has ended, this shouldn't happen");
    const n = A(this, _t, "f");
    if (!n) throw new B("request ended without sending any chunks");
    return D(this, _t, void 0, "f"), Al(n, A(this, Wt, "f"), { logger: A(this, Ln, "f") });
  }, Sl = function(n) {
    let o = A(this, _t, "f");
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
            if (r && Cl(r)) {
              let i = r[El] || "";
              i += n.delta.partial_json;
              const s = { ...r };
              Object.defineProperty(s, El, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (s.input = cf(i)), o.content[n.index] = s;
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
    return new fo(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Ef = class extends Z {
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
    return this._client.getAPIList("/v1/messages/batches", Ao, {
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
    })._thenUnwrap((o, r) => hf.fromResponse(r.response, r.controller));
  }
}, na = class extends Z {
  constructor() {
    super(...arguments), this.batches = new Ef(this._client);
  }
  create(e, t) {
    e.model in wl && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${wl[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), m_.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const r = af[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, r);
    }
    const o = jd(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: R([o, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Sf(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return p_.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, wl = {
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
}, m_ = ["claude-mythos-preview", "claude-opus-4-6"];
na.Batches = Ef;
var Cf = class extends Z {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(U`/v1/models/${e}`, {
      ...n,
      headers: R([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models", Ao, {
      query: o,
      ...t,
      headers: R([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Ko = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Yi, oa, ar, wf, g_ = "\\n\\nHuman:", __ = "\\n\\nAssistant:", ee = class {
  constructor({ baseURL: e = Ko("ANTHROPIC_BASE_URL"), apiKey: t = Ko("ANTHROPIC_API_KEY") ?? null, authToken: n = Ko("ANTHROPIC_AUTH_TOKEN") ?? null, ...o } = {}) {
    Yi.add(this), ar.set(this, void 0);
    const r = {
      apiKey: t,
      authToken: n,
      ...o,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!r.dangerouslyAllowBrowser && xg()) throw new B(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = r.baseURL, this.timeout = r.timeout ?? oa.DEFAULT_TIMEOUT, this.logger = r.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = al(r.logLevel, "ClientOptions.logLevel", this) ?? al(Ko("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = r.fetchOptions, this.maxRetries = r.maxRetries ?? 2, this.fetch = r.fetch ?? Lg(), D(this, ar, Fg, "f"), this._options = r, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return Og(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Xt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Rd()}`;
  }
  makeStatusError(e, t, n, o) {
    return Re.generate(e, t, n, o);
  }
  buildURL(e, t, n) {
    const o = !A(this, Yi, "m", wf).call(this) && n || this.baseURL, r = bg(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), s = Object.fromEntries(r.searchParams);
    return (!el(i) || !el(s)) && (t = {
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
    return new Hd(this, this.makeRequest(e, t, void 0));
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
    if (pe(this).debug(`[${c}] sending request`, xt({
      retryOfRequestLogID: n,
      method: o.method,
      url: s,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new Ve();
    const h = new AbortController(), p = await this.fetchWithTimeout(s, i, u, h).catch(Gi), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Ve();
      const y = co(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return pe(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - ${_}`), pe(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (${_})`, xt({
          retryOfRequestLogID: n,
          url: s,
          durationMs: m - f,
          message: p.message
        })), this.retryRequest(o, t, n ?? c);
      throw pe(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - error; no more retries left`), pe(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (error; no more retries left)`, xt({
        retryOfRequestLogID: n,
        url: s,
        durationMs: m - f,
        message: p.message
      })), y ? new Pd() : new Hr({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, y]) => ", " + _ + ": " + JSON.stringify(y)).join("")}] ${i.method} ${s} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - f}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const I = `retrying, ${t} attempts remaining`;
        return await Ug(p.body), pe(this).info(`${g} - ${I}`), pe(this).debug(`[${c}] response error (${I})`, xt({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - f
        })), this.retryRequest(o, t, n ?? c, p.headers);
      }
      const y = _ ? "error; no more retries left" : "error; not retryable";
      pe(this).info(`${g} - ${y}`);
      const E = await p.text().catch((I) => Gi(I).message), C = Fd(E), T = C ? void 0 : E;
      throw pe(this).debug(`[${c}] response error (${y})`, xt({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: T,
        durationMs: Date.now() - f
      })), this.makeStatusError(p.status, C, T, p.headers);
    }
    return pe(this).info(g), pe(this).debug(`[${c}] response start`, xt({
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
    return new zg(this, n, e);
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
    return await Mg(r), this.makeRequest(e, t - 1, n);
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
    "timeout" in n && Pg("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
        ...$g(),
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
      body: Gd(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : A(this, ar, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
oa = ee, ar = /* @__PURE__ */ new WeakMap(), Yi = /* @__PURE__ */ new WeakSet(), wf = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
ee.Anthropic = oa;
ee.HUMAN_PROMPT = g_;
ee.AI_PROMPT = __;
ee.DEFAULT_TIMEOUT = 6e5;
ee.AnthropicError = B;
ee.APIError = Re;
ee.APIConnectionError = Hr;
ee.APIConnectionTimeoutError = Pd;
ee.APIUserAbortError = Ve;
ee.NotFoundError = kd;
ee.ConflictError = Dd;
ee.RateLimitError = Ld;
ee.BadRequestError = Md;
ee.AuthenticationError = xd;
ee.InternalServerError = Ud;
ee.PermissionDeniedError = Nd;
ee.UnprocessableEntityError = $d;
ee.toFile = e_;
var So = class extends ee {
  constructor() {
    super(...arguments), this.completions = new Af(this), this.messages = new na(this), this.models = new Cf(this), this.beta = new Ue(this);
  }
};
So.Completions = Af;
So.Messages = na;
So.Models = Cf;
So.Beta = Ue;
var y_ = {
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
function lt(e, t, n = !1, o = "", r = void 0) {
  if (!n && y_[e]?.includes(t)) return t;
  const i = [
    "length",
    "max_tokens",
    "max_output_tokens",
    "MAX_TOKENS"
  ].includes(t), s = /* @__PURE__ */ new Error(i ? "Model response reached its output limit." : "Model response did not complete normally.");
  throw s.code = i ? "AGENT_RESPONSE_TRUNCATED" : "AGENT_RESPONSE_INCOMPLETE", s.reason = t || "missing_completion", o && (s.partialResponse = {
    text: o,
    finishReason: t,
    truncated: i
  }), r && (s.responseInfo = r), s;
}
function ra(e, t) {
  return t && e && typeof e == "object" && !e.requestInspection && (e.requestInspection = t), e;
}
function Bt(e) {
  if (Array.isArray(e)) return e.map((n) => Bt(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, o]) => {
    t[n] = /^(?:authorization|proxy[-_]?authorization|(?:x[-_])?csrf(?:[-_]?token)?|token|access[-_]?token|refresh[-_]?token|id[-_]?token|api[-_]?key|x[-_](?:goog[-_])?api[-_]?key|proxy[-_]?password|password|client[-_]?secret)$/i.test(n) ? o === "" ? "" : "[redacted]" : Bt(o);
  }), t;
}
function wt(e = {}, t = {}) {
  const n = t.reasoning && typeof t.reasoning == "object" ? t.reasoning : {}, o = String(e.reasoning?.mode || "inherit"), r = e.reasoning?.output === "show" || e.reasoning?.output === "hide" ? e.reasoning.output : n.output === "show" ? "show" : "hide", i = String(n.mode || t.effectiveMode || o);
  return {
    reasoningRequestedMode: o,
    reasoningRequestedOutput: r,
    reasoningProfileId: String(n.profileId || t.profileId || e.reasoning?.profileId || "unsupported"),
    reasoningEffectiveMode: i,
    reasoningEffort: i === "on" ? String(t.effort ?? n.effort ?? e.reasoning?.effort ?? "") : "",
    reasoningBudgetTokens: i === "on" && Number.isFinite(Number(t.budgetTokens ?? n.budgetTokens ?? e.reasoning?.budgetTokens)) ? Number(t.budgetTokens ?? n.budgetTokens ?? e.reasoning?.budgetTokens) : null,
    reasoningControlFields: Bt(t.controlFields || {}),
    reasoningOutputVisible: i !== "off" && n.output === "show"
  };
}
function ho(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: Bt({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    }),
    ...e.effectiveConfig ? { effectiveConfig: e.effectiveConfig } : {}
  };
}
var Xi = "⁣XBDRAW_TOOL_PROTOCOL⁣", Qi = `

`, v_ = /* @__PURE__ */ new Set([
  "system",
  "user",
  "assistant"
]);
function If(e) {
  return !!e && typeof e == "object" && typeof e.content == "string" && e.content.includes("⁣XBDRAW_TOOL_PROTOCOL⁣");
}
function A_(e) {
  return Array.isArray(e) && e.some(If);
}
function bf(e) {
  let t = e, n = t.indexOf(Xi);
  for (; n !== -1; ) {
    const o = n + 22;
    t.startsWith(Qi, o) ? t = t.slice(0, n) + t.slice(o + 2) : n >= 2 && t.slice(n - 2, n) === Qi ? t = t.slice(0, n - 2) + t.slice(o) : t = t.slice(0, n) + t.slice(o), n = t.indexOf(Xi);
  }
  return t;
}
function T_(e, t) {
  const n = e.indexOf(Xi), o = n + 22;
  return e.slice(0, n) + t + bf(e.slice(o));
}
function S_(e, t) {
  return e.role === t.role && v_.has(e.role) && typeof e.content == "string" && typeof t.content == "string" && !e.tool_calls && !t.tool_calls;
}
function Rf(e, t = null) {
  if (!Array.isArray(e)) return {
    messages: [],
    found: !1
  };
  if (!A_(e)) return {
    messages: e.slice(),
    found: !1
  };
  let n = !1;
  const o = [];
  let r = !1;
  e.forEach((s) => {
    if (!If(s)) {
      i(s);
      return;
    }
    let u;
    if (!n && t !== null && t !== void 0) {
      const c = typeof t == "function" ? t() : t, d = typeof c == "string" ? c : "";
      d.trim() && (n = !0, u = T_(s.content, d));
    }
    if (u === void 0 && (u = bf(s.content)), !u.trim()) {
      r = !0;
      return;
    }
    i({
      ...s,
      content: u
    });
  });
  function i(s) {
    const u = o[o.length - 1];
    r && u && S_(u, s) ? o[o.length - 1] = {
      ...u,
      content: `${u.content}${Qi}${s.content}`
    } : o.push(s), r = !1;
  }
  return {
    messages: o,
    found: !0
  };
}
function et(e) {
  return Rf(e, null).messages;
}
var E_ = Object.freeze({ type: "ephemeral" }), C_ = /* @__PURE__ */ new Set([
  "text",
  "image",
  "tool_use",
  "tool_result"
]), w_ = "[AgentCore][AnthropicUsage]";
function I_(e) {
  e.system ? e.system = [{
    type: "text",
    text: e.system
  }] : delete e.system;
  const t = e.messages.flatMap((n) => n.content).filter((n) => C_.has(n.type) && (n.type !== "text" || n.text.trim())).at(-1);
  for (const n of [
    e.tools?.at(-1),
    e.system?.at(-1),
    t
  ]) n && (n.cache_control = { ...E_ });
}
function b_(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function R_(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function Pf(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function P_(e) {
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
      const o = R_(n.image_url.url);
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
function M_(e) {
  const t = [String(e.systemPrompt || "").trim(), ...et(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function x_(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && Pf(t) || null;
}
function N_(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: Pf(e.content) || [] } : void 0;
}
function Il(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function bl(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: b_(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function k_(e) {
  const t = et(e), n = [];
  for (let o = 0; o < t.length; o += 1) {
    const r = t[o];
    if (r.role !== "system") {
      if (r.role === "assistant") {
        const i = x_(r), s = bl(r.tool_calls);
        if (i && s.length) {
          n.push({
            role: "assistant",
            content: i.filter((u) => u?.type !== "tool_use").concat(s)
          });
          continue;
        }
        if (i) {
          n.push({
            role: "assistant",
            content: i
          });
          continue;
        }
      }
      if (r.role === "tool") {
        const i = [Il(r)];
        for (; t[o + 1]?.role === "tool"; )
          o += 1, i.push(Il(t[o]));
        n.push({
          role: "user",
          content: i
        });
        continue;
      }
      if (r.role === "assistant" && Array.isArray(r.tool_calls) && r.tool_calls.length) {
        n.push({
          role: "assistant",
          content: [...r.content ? [{
            type: "text",
            text: r.content
          }] : [], ...bl(r.tool_calls)]
        });
        continue;
      }
      n.push({
        role: r.role,
        content: P_(r.content)
      });
    }
  }
  return n;
}
function Wo(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Rl(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function D_(e = "auto", t = []) {
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
var $_ = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function Ai(e = {}, t = {}) {
  const n = Array.isArray(t.tools) ? t.tools : [], o = n.length ? D_(t.toolChoice, n) : void 0, r = t.reasoning?.output, i = {
    ...Bs(t.reasoning),
    ...r === "show" || r === "hide" ? { output: r } : {}
  }, s = Ys({
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
var L_ = class {
  constructor(e) {
    this.config = e, this.auth = Br("anthropic", e.apiKey), this.client = new So({
      ...this.auth.sdkOptions,
      baseURL: Rl(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = Ai(this.config, e)) {
    const n = t.effectiveReasoning, o = (Array.isArray(e.tools) ? e.tools : []).map((s) => ({
      name: s.function.name,
      description: s.function.description,
      input_schema: s.function.parameters
    })), r = M_(e), i = {
      model: this.config.model,
      system: r,
      messages: k_(e.messages),
      ...o.length ? {
        tools: o,
        tool_choice: t.toolChoice
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return qr(this.config.model) === "claude" && I_(i), !yo({
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
    const n = typeof e.onStreamProgress == "function", o = Rl(this.config.baseUrl), r = t.protocol || Ai(this.config, e), i = t.body || this.buildRequestBody(e, r), s = r.effectiveReasoning;
    return {
      ...ho({
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
        effectiveConfig: wt(e, {
          reasoning: s,
          effort: i.output_config?.effort,
          budgetTokens: i.thinking?.budget_tokens,
          controlFields: {
            ...i.thinking ? { thinking: i.thinking } : {},
            ...i.output_config ? { output_config: i.output_config } : {}
          }
        })
      }),
      ...r.reasoningDisabledForForcedTool ? { notices: [$_] } : {}
    };
  }
  async chat(e) {
    const t = {};
    try {
      return await this.runChat(e, t);
    } catch (n) {
      throw ra(n, t.requestInspection);
    }
  }
  async runChat(e, t) {
    const n = Ai(this.config, e), o = n.effectiveReasoning, r = this.buildRequestBody(e, n), i = this.inspectRequest(e, {
      body: r,
      protocol: n
    });
    t.requestInspection = i;
    let s;
    if (typeof e.onStreamProgress == "function") {
      const p = this.client.messages.stream(r, { signal: e.signal }), m = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map();
      let _ = "";
      const y = () => z(o) ? Array.from(m.entries()).sort(([T], [I]) => T.localeCompare(I)).map(([T, I]) => ({
        label: T.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: I
      })).filter((T) => T.text) : [], E = () => Array.from(g.entries()).sort(([T], [I]) => Number(T) - Number(I)).map(([, T]) => ({
        id: T.id || "anthropic-tool-draft",
        name: T.name || "工具调用",
        arguments: T.inputJson || "{}",
        draft: !0
      })).filter((T) => T.name), C = () => {
        const T = E();
        T.length && Wo(e, {
          text: _,
          thoughts: y(),
          toolCalls: T,
          toolCallDraft: !0
        });
      };
      p.on("text", (T, I) => {
        _ = I || "", Wo(e, {
          text: _,
          thoughts: y(),
          ...E().length ? {
            toolCalls: E(),
            toolCallDraft: !0
          } : {}
        });
      }), p.on("thinking", (T, I) => {
        m.set("thinking:0", I || ""), Wo(e, {
          thoughts: y(),
          ...E().length ? {
            text: _,
            toolCalls: E(),
            toolCallDraft: !0
          } : {}
        });
      }), p.on("streamEvent", (T) => {
        if (T?.type === "content_block_start" && T.content_block?.type === "tool_use") {
          const I = T.content_block.input && typeof T.content_block.input == "object" ? T.content_block.input : {};
          g.set(T.index, {
            id: T.content_block.id || `anthropic-tool-draft-${T.index + 1}`,
            name: T.content_block.name || "工具调用",
            inputJson: Object.keys(I).length ? JSON.stringify(I) : ""
          }), C();
          return;
        }
        if (T?.type === "content_block_delta" && T.delta?.type === "input_json_delta") {
          const I = g.get(T.index) || {
            id: `anthropic-tool-draft-${T.index + 1}`,
            name: "工具调用",
            inputJson: ""
          };
          g.set(T.index, {
            ...I,
            inputJson: `${I.inputJson || ""}${T.delta.partial_json || ""}`
          }), C();
        }
      }), p.on("contentBlock", (T) => {
        T?.type === "redacted_thinking" && (m.set("redacted:0", T.data || ""), Wo(e, {
          thoughts: y(),
          ...E().length ? {
            text: _,
            toolCalls: E(),
            toolCallDraft: !0
          } : {}
        }));
      }), s = await p.finalMessage();
    } else s = await this.client.messages.create(r, { signal: e.signal });
    const u = (s.content || []).filter((p) => p.type === "tool_use" && p.name).map((p, m) => ({
      id: p.id || `anthropic-tool-${m + 1}`,
      name: p.name,
      arguments: JSON.stringify(p.input || {})
    })), c = (s.content || []).filter((p) => p.type === "text").map((p) => p.text || "").join(`
`), d = z(o) ? (s.content || []).filter((p) => p.type === "thinking" || p.type === "redacted_thinking").map((p) => ({
      label: p.type === "thinking" ? "思考块" : "已脱敏思考块",
      text: p.type === "thinking" ? p.thinking || "" : p.data || ""
    })).filter((p) => p.text) : [], f = lt("anthropic", s.stop_reason, !1, c), h = s.usage;
    return console.info(w_, {
      messageId: s.id,
      model: s.model || this.config.model,
      usage: h
    }), {
      text: c,
      toolCalls: u,
      thoughts: d,
      finishReason: f,
      usage: h,
      model: s.model || this.config.model,
      provider: "anthropic",
      providerPayload: N_(s),
      requestInspection: i
    };
  }
}, U_ = /* @__PURE__ */ Gr(((e, t) => {
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
})), F_ = /* @__PURE__ */ Gr(((e) => {
  var t = U_();
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
})), O_ = /* @__PURE__ */ Gr(((e, t) => {
  t.exports = F_();
})), G_ = /* @__PURE__ */ Gr(((e, t) => {
  var n = O_(), o = [
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
})), Pl = /* @__PURE__ */ eg(G_(), 1), B_ = void 0, q_ = void 0;
function H_() {
  return {
    geminiUrl: B_,
    vertexUrl: q_
  };
}
function V_(e, t, n, o) {
  var r, i;
  if (!e?.baseUrl) {
    const s = H_();
    return t ? (r = s.vertexUrl) !== null && r !== void 0 ? r : n : (i = s.geminiUrl) !== null && i !== void 0 ? i : o;
  }
  return e.baseUrl;
}
var ft = class {
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
function J_(e, t) {
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
    Zi(e, r, i, 0, s);
  }
}
function Zi(e, t, n, o, r) {
  if (o >= t.length || typeof e != "object" || e === null) return;
  const i = t[o];
  if (i.endsWith("[]")) {
    const s = i.slice(0, -2), u = e;
    if (s in u && Array.isArray(u[s])) for (const c of u[s]) Zi(c, t, n, o + 1, r);
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
    i in s && Zi(s[i], t, n, o + 1, r);
  }
}
function ia(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function K_(e) {
  const t = {}, n = a(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const o = a(e, ["resourceName"]);
  return o != null && l(t, ["_url", "resourceName"], o), t;
}
function W_(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response", "generateVideoResponse"]);
  return s != null && l(t, ["response"], Y_(s)), t;
}
function z_(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], X_(s)), t;
}
function Y_(e) {
  const t = {}, n = a(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => Q_(s))), l(t, ["generatedVideos"], i);
  }
  const o = a(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const r = a(e, ["raiMediaFilteredReasons"]);
  return r != null && l(t, ["raiMediaFilteredReasons"], r), t;
}
function X_(e) {
  const t = {}, n = a(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => Z_(s))), l(t, ["generatedVideos"], i);
  }
  const o = a(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const r = a(e, ["raiMediaFilteredReasons"]);
  return r != null && l(t, ["raiMediaFilteredReasons"], r), t;
}
function Q_(e) {
  const t = {}, n = a(e, ["video"]);
  return n != null && l(t, ["video"], ry(n)), t;
}
function Z_(e) {
  const t = {}, n = a(e, ["_self"]);
  return n != null && l(t, ["video"], iy(n)), t;
}
function j_(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function ey(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function ty(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], ny(s)), t;
}
function ny(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = a(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function Mf(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], oy(s)), t;
}
function oy(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = a(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function ry(e) {
  const t = {}, n = a(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const o = a(e, ["encodedVideo"]);
  o != null && l(t, ["videoBytes"], ia(o));
  const r = a(e, ["encoding"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function iy(e) {
  const t = {}, n = a(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const o = a(e, ["bytesBase64Encoded"]);
  o != null && l(t, ["videoBytes"], ia(o));
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
var Ml;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(Ml || (Ml = {}));
var xl;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(xl || (xl = {}));
var Nl;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(Nl || (Nl = {}));
var St;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(St || (St = {}));
var kl;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(kl || (kl = {}));
var Dl;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(Dl || (Dl = {}));
var $l;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})($l || ($l = {}));
var Ll;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(Ll || (Ll = {}));
var Ul;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(Fl || (Fl = {}));
var Ol;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(Ol || (Ol = {}));
var nn;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(nn || (nn = {}));
var on;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(on || (on = {}));
var Gl;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(Gl || (Gl = {}));
var Bl;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Bl || (Bl = {}));
var ql;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(ql || (ql = {}));
var Hl;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Hl || (Hl = {}));
var Vl;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(Vl || (Vl = {}));
var Jl;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Jl || (Jl = {}));
var Kl;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Kl || (Kl = {}));
var Wl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Wl || (Wl = {}));
var zl;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(zl || (zl = {}));
var Yl;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Xl || (Xl = {}));
var Er;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(Er || (Er = {}));
var Ql;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Ql || (Ql = {}));
var Zl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(Zl || (Zl = {}));
var jl;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(jl || (jl = {}));
var eu;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(eu || (eu = {}));
var ji;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(ji || (ji = {}));
var tu;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(tu || (tu = {}));
var nu;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(nu || (nu = {}));
var ou;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(ou || (ou = {}));
var ru;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(ru || (ru = {}));
var iu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(iu || (iu = {}));
var su;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(su || (su = {}));
var au;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(au || (au = {}));
var es;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(es || (es = {}));
var lu;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(lu || (lu = {}));
var uu;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(uu || (uu = {}));
var Cr;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(Cr || (Cr = {}));
var cu;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(cu || (cu = {}));
var du;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(du || (du = {}));
var fu;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(fu || (fu = {}));
var hu;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(hu || (hu = {}));
var pu;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(pu || (pu = {}));
var mu;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(mu || (mu = {}));
var gu;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(gu || (gu = {}));
var _u;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(_u || (_u = {}));
var yu;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(yu || (yu = {}));
var vu;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(vu || (vu = {}));
var Au;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(Au || (Au = {}));
var Tu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(Tu || (Tu = {}));
var Su;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(Su || (Su = {}));
var Eu;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(Eu || (Eu = {}));
var Cu;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(Cu || (Cu = {}));
var wu;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(wu || (wu = {}));
var Iu;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(Iu || (Iu = {}));
var bu;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(bu || (bu = {}));
var Ru;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(Ru || (Ru = {}));
var Pu;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(Pu || (Pu = {}));
var Mu;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(Mu || (Mu = {}));
var xu;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(xu || (xu = {}));
var Nu;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(Nu || (Nu = {}));
var rn;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(rn || (rn = {}));
var ts = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Un = class {
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
}, ku = class {
}, Du = class {
}, sy = class {
}, ay = class {
}, ly = class {
}, uy = class {
}, $u = class {
}, Lu = class {
}, Uu = class {
}, cy = class {
}, Fu = class xf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new xf();
    let r;
    const i = t;
    return n ? r = z_(i) : r = W_(i), Object.assign(o, r), o;
  }
}, Ou = class {
}, Gu = class {
}, Bu = class {
}, qu = class {
}, dy = class {
}, fy = class {
}, hy = class {
}, py = class Nf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Nf(), r = ty(t);
    return Object.assign(o, r), o;
  }
}, my = class {
}, gy = class {
}, _y = class {
}, yy = class {
}, Hu = class {
}, vy = class {
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
}, Ay = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, Ty = class kf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new kf(), r = Mf(t);
    return Object.assign(o, r), o;
  }
};
function J(e, t) {
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
function Df(e, t) {
  const n = J(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function $f(e) {
  return Array.isArray(e) ? e.map((t) => wr(t)) : [wr(e)];
}
function wr(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function Lf(e) {
  const t = wr(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Uf(e) {
  const t = wr(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Vu(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function Ff(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Vu(t)) : [Vu(e)];
}
function ns(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Ju(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Ku(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function se(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return ns(e) ? e : {
    role: "user",
    parts: Ff(e)
  };
}
function sa(e, t) {
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
function Ae(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Ju(e) || Ku(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [se(e)];
  }
  const t = [], n = [], o = ns(e[0]);
  for (const r of e) {
    const i = ns(r);
    if (i != o) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(r);
    else {
      if (Ju(r) || Ku(r)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(r);
    }
  }
  return o || t.push({
    role: "user",
    parts: Ff(n)
  }), t;
}
function Sy(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((o) => o !== "null");
  if (n.length === 1) t.type = Object.values(St).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : St.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const o of n) t.anyOf.push({ type: Object.values(St).includes(o.toUpperCase()) ? o.toUpperCase() : St.TYPE_UNSPECIFIED });
  }
}
function cn(e) {
  const t = {}, n = ["items"], o = ["anyOf"], r = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && Sy(e.type, t);
  for (const [s, u] of Object.entries(e))
    if (u != null)
      if (s == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(St).includes(u.toUpperCase()) ? u.toUpperCase() : St.TYPE_UNSPECIFIED;
      } else if (n.includes(s)) t[s] = cn(u);
      else if (o.includes(s)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(cn(d));
        }
        t[s] = c;
      } else if (r.includes(s)) {
        const c = {};
        for (const [d, f] of Object.entries(u)) c[d] = cn(f);
        t[s] = c;
      } else {
        if (s === "additionalProperties") continue;
        t[s] = u;
      }
  return t;
}
function aa(e) {
  return cn(e);
}
function la(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function ua(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function gn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = cn(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = cn(t.response));
  return e;
}
function _n(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function Ey(e, t, n, o = 1) {
  const r = !t.startsWith(`${n}/`) && t.split("/").length === o;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : r ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : r ? `${n}/${t}` : t;
}
function ht(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return Ey(e, t, "cachedContents");
}
function Of(e) {
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
function bt(e) {
  return ia(e);
}
function Cy(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function wy(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function Iy(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function Gf(e) {
  var t;
  let n;
  if (Cy(e) && (n = e.name), !(Iy(e) && (n = e.uri, n === void 0)) && !(wy(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const o = n.split("files/")[1].match(/[a-z0-9]+/);
      if (o === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = o[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function Bf(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function qf(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (by(e, t)) return e[t];
  return [];
}
function by(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function Ry(e, t = {}) {
  const n = e, o = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (o.responseJsonSchema = n.outputSchema), t.behavior && (o.behavior = t.behavior), { functionDeclarations: [o] };
}
function Py(e, t = {}) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = r.name;
    if (o.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    o.add(i);
    const s = Ry(r, t);
    s.functionDeclarations && n.push(...s.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function Hf(e, t) {
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
function My(e) {
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
function Vf(e) {
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
function yn(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function Jf(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function xy(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function Ny(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function ky(e) {
  const t = {}, n = a(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const o = a(e, ["inlinedResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => hv(s))), l(t, ["inlinedResponses"], i);
  }
  const r = a(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function Dy(e) {
  const t = {}, n = a(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const o = a(e, ["gcsDestination", "outputUriPrefix"]);
  o != null && l(t, ["gcsUri"], o);
  const r = a(e, ["bigqueryDestination", "outputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function $y(e) {
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
function lr(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata", "displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = a(e, ["metadata", "state"]);
  r != null && l(t, ["state"], Jf(r));
  const i = a(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const s = a(e, ["metadata", "endTime"]);
  s != null && l(t, ["endTime"], s);
  const u = a(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = a(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = a(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], ky(Vf(d))), t;
}
function os(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = a(e, ["state"]);
  r != null && l(t, ["state"], Jf(r));
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
  h != null && l(t, ["src"], Ly(h));
  const p = a(e, ["outputConfig"]);
  p != null && l(t, ["dest"], Dy(Vf(p)));
  const m = a(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function Ly(e) {
  const t = {}, n = a(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const o = a(e, ["gcsSource", "uris"]);
  o != null && l(t, ["gcsUri"], o);
  const r = a(e, ["bigquerySource", "inputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function Uy(e, t) {
  const n = {};
  if (a(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (a(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (a(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = a(t, ["fileName"]);
  o != null && l(n, ["fileName"], o);
  const r = a(t, ["inlinedRequests"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => fv(e, s))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function Fy(e) {
  const t = {}, n = a(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const o = a(e, ["gcsUri"]);
  o != null && l(t, ["gcsSource", "uris"], o);
  const r = a(e, ["bigqueryUri"]);
  if (r != null && l(t, ["bigquerySource", "inputUri"], r), a(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function Oy(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Gy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], yn(e, o)), n;
}
function By(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], yn(e, o)), n;
}
function qy(e) {
  const t = {}, n = a(e, ["content"]);
  n != null && l(t, ["content"], n);
  const o = a(e, ["citationMetadata"]);
  o != null && l(t, ["citationMetadata"], Hy(o));
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
function Hy(e) {
  const t = {}, n = a(e, ["citationSources"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["citations"], o);
  }
  return t;
}
function Kf(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Av(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Vy(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  if (t !== void 0 && o != null && l(t, ["batch", "displayName"], o), a(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const r = a(e, ["webhookConfig"]);
  return t !== void 0 && r != null && l(t, ["batch", "webhookConfig"], r), n;
}
function Jy(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const r = a(e, ["dest"]);
  if (t !== void 0 && r != null && l(t, ["outputConfig"], $y(My(r))), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Wu(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["_url", "model"], J(e, o));
  const r = a(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], Uy(e, Hf(e, r)));
  const i = a(t, ["config"]);
  return i != null && Vy(i, n), n;
}
function Ky(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["model"], J(e, o));
  const r = a(t, ["src"]);
  r != null && l(n, ["inputConfig"], Fy(Hf(e, r)));
  const i = a(t, ["config"]);
  return i != null && Jy(i, n), n;
}
function Wy(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["batch", "displayName"], o), n;
}
function zy(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["_url", "model"], J(e, o));
  const r = a(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], tv(e, r));
  const i = a(t, ["config"]);
  return i != null && Wy(i, n), n;
}
function Yy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], yn(e, o)), n;
}
function Xy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], yn(e, o)), n;
}
function Qy(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function Zy(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function jy(e, t) {
  const n = {}, o = a(t, ["contents"]);
  if (o != null) {
    let i = sa(e, o);
    Array.isArray(i) && (i = i.map((s) => s)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const r = a(t, ["config"]);
  return r != null && (l(n, ["_self"], ev(r, n)), J_(n, { "requests[].*": "requests[].request.*" })), n;
}
function ev(e, t) {
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
function tv(e, t) {
  const n = {}, o = a(t, ["fileName"]);
  o != null && l(n, ["file_name"], o);
  const r = a(t, ["inlinedRequests"]);
  return r != null && l(n, ["requests"], jy(e, r)), n;
}
function nv(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function ov(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function rv(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = a(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function iv(e, t, n) {
  const o = {}, r = a(t, ["systemInstruction"]);
  n !== void 0 && r != null && l(n, ["systemInstruction"], Kf(se(r)));
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
  const E = a(t, ["responseSchema"]);
  E != null && l(o, ["responseSchema"], aa(E));
  const C = a(t, ["responseJsonSchema"]);
  if (C != null && l(o, ["responseJsonSchema"], C), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const T = a(t, ["safetySettings"]);
  if (n !== void 0 && T != null) {
    let W = T;
    Array.isArray(W) && (W = W.map((K) => Tv(K))), l(n, ["safetySettings"], W);
  }
  const I = a(t, ["tools"]);
  if (n !== void 0 && I != null) {
    let W = _n(I);
    Array.isArray(W) && (W = W.map((K) => Ev(gn(K)))), l(n, ["tools"], W);
  }
  const L = a(t, ["toolConfig"]);
  if (n !== void 0 && L != null && l(n, ["toolConfig"], Sv(L)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const w = a(t, ["cachedContent"]);
  n !== void 0 && w != null && l(n, ["cachedContent"], ht(e, w));
  const k = a(t, ["responseModalities"]);
  k != null && l(o, ["responseModalities"], k);
  const b = a(t, ["mediaResolution"]);
  b != null && l(o, ["mediaResolution"], b);
  const x = a(t, ["speechConfig"]);
  if (x != null && l(o, ["speechConfig"], la(x)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const P = a(t, ["thinkingConfig"]);
  P != null && l(o, ["thinkingConfig"], P);
  const F = a(t, ["imageConfig"]);
  F != null && l(o, ["imageConfig"], dv(F));
  const Y = a(t, ["enableEnhancedCivicAnswers"]);
  if (Y != null && l(o, ["enableEnhancedCivicAnswers"], Y), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const V = a(t, ["serviceTier"]);
  return n !== void 0 && V != null && l(n, ["serviceTier"], V), o;
}
function sv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((f) => qy(f))), l(t, ["candidates"], d);
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
function av(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], yn(e, o)), n;
}
function lv(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], yn(e, o)), n;
}
function uv(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Ny(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function cv(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function dv(e) {
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
function fv(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["request", "model"], J(e, o));
  const r = a(t, ["contents"]);
  if (r != null) {
    let u = Ae(r);
    Array.isArray(u) && (u = u.map((c) => Kf(c))), l(n, ["request", "contents"], u);
  }
  const i = a(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const s = a(t, ["config"]);
  return s != null && l(n, ["request", "generationConfig"], iv(e, s, a(n, ["request"], {}))), n;
}
function hv(e) {
  const t = {}, n = a(e, ["response"]);
  n != null && l(t, ["response"], sv(n));
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["error"]);
  return r != null && l(t, ["error"], r), t;
}
function pv(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  if (t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), a(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function mv(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  t !== void 0 && r != null && l(t, ["_query", "pageToken"], r);
  const i = a(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function gv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && pv(n, t), t;
}
function _v(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && mv(n, t), t;
}
function yv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = a(e, ["operations"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => lr(s))), l(t, ["batchJobs"], i);
  }
  return t;
}
function vv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = a(e, ["batchPredictionJobs"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => os(s))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Av(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], nv(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], ov(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Oy(c));
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
function Tv(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = a(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function Sv(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = a(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], rv(o));
  const r = a(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function Ev(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], cv(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], uv(i));
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
var dt;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(dt || (dt = {}));
var Ht = class {
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
}, Cv = class extends ft {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ht(dt.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Wu(this.apiClient, e), n = t._url, o = N("{model}:batchGenerateContent", n), r = t.batch.inputConfig.requests, i = r.requests, s = [];
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
      const c = Ky(this.apiClient, e);
      return s = N("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => os(d));
    } else {
      const c = Wu(this.apiClient, e);
      return s = N("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => lr(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = zy(this.apiClient, e);
      return r = N("{model}:asyncBatchEmbedContent", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => lr(u));
    }
  }
  async get(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = lv(this.apiClient, e);
      return s = N("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => os(d));
    } else {
      const c = av(this.apiClient, e);
      return s = N("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => lr(d));
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const u = By(this.apiClient, e);
      i = N("batchPredictionJobs/{name}:cancel", u._url), s = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = Gy(this.apiClient, e);
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
      const c = _v(e);
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
        const f = vv(d), h = new Hu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = gv(e);
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
        const f = yv(d), h = new Hu();
        return Object.assign(h, f), h;
      });
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Xy(this.apiClient, e);
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
      })), i.then((d) => Zy(d));
    } else {
      const c = Yy(this.apiClient, e);
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
      })), i.then((d) => Qy(d));
    }
  }
};
function wv(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Iv(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function zu(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Yv(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Yu(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Xv(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function bv(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  t !== void 0 && r != null && l(t, ["expireTime"], r);
  const i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let f = Ae(s);
    Array.isArray(f) && (f = f.map((h) => zu(h))), l(t, ["contents"], f);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], zu(se(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((h) => jv(h))), l(t, ["tools"], f);
  }
  const d = a(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], Qv(d)), a(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function Rv(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  t !== void 0 && r != null && l(t, ["expireTime"], r);
  const i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let h = Ae(s);
    Array.isArray(h) && (h = h.map((p) => Yu(p))), l(t, ["contents"], h);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Yu(se(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((p) => eA(p))), l(t, ["tools"], h);
  }
  const d = a(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], Zv(d));
  const f = a(e, ["kmsKeyName"]);
  return t !== void 0 && f != null && l(t, ["encryption_spec", "kmsKeyName"], f), n;
}
function Pv(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["model"], Df(e, o));
  const r = a(t, ["config"]);
  return r != null && bv(r, n), n;
}
function Mv(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["model"], Df(e, o));
  const r = a(t, ["config"]);
  return r != null && Rv(r, n), n;
}
function xv(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ht(e, o)), n;
}
function Nv(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ht(e, o)), n;
}
function kv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Dv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function $v(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Lv(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Uv(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = a(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Fv(e) {
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
function Ov(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ht(e, o)), n;
}
function Gv(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ht(e, o)), n;
}
function Bv(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], wv(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function qv(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Hv(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function Vv(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function Jv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && Hv(n, t), t;
}
function Kv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && Vv(n, t), t;
}
function Wv(e) {
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
function zv(e) {
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
function Yv(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], $v(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], Lv(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Iv(c));
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
function Xv(e) {
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
function Qv(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = a(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], Uv(o));
  const r = a(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function Zv(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = a(e, ["functionCallingConfig"]);
  if (o != null && l(t, ["functionCallingConfig"], o), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function jv(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], qv(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Bv(i));
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
function eA(e) {
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
    Array.isArray(p) && (p = p.map((m) => Fv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const f = a(e, ["parallelAiSearch"]);
  f != null && l(t, ["parallelAiSearch"], f);
  const h = a(e, ["urlContext"]);
  if (h != null && l(t, ["urlContext"], h), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function tA(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function nA(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function oA(e, t) {
  const n = {}, o = a(t, ["name"]);
  o != null && l(n, ["_url", "name"], ht(e, o));
  const r = a(t, ["config"]);
  return r != null && tA(r, n), n;
}
function rA(e, t) {
  const n = {}, o = a(t, ["name"]);
  o != null && l(n, ["_url", "name"], ht(e, o));
  const r = a(t, ["config"]);
  return r != null && nA(r, n), n;
}
var iA = class extends ft {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ht(dt.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Mv(this.apiClient, e);
      return s = N("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Pv(this.apiClient, e);
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
      const c = Gv(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Ov(this.apiClient, e);
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
      const c = Nv(this.apiClient, e);
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
        const f = Dv(d), h = new Bu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = xv(this.apiClient, e);
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
        const f = kv(d), h = new Bu();
        return Object.assign(h, f), h;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = rA(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = oA(this.apiClient, e);
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
      const c = Kv(e);
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
        const f = zv(d), h = new qu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = Jv(e);
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
        const f = Wv(d), h = new qu();
        return Object.assign(h, f), h;
      });
    }
  }
};
function Et(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++) t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
function Xu(e) {
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
      return Promise.resolve(g).then(m, h);
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
function Ke(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Xu == "function" ? Xu(e) : e[Symbol.iterator](), n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
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
function sA(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : Wf(n);
}
function Wf(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function aA(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Qu(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let o = 0;
  for (; o < n; ) if (e[o].role === "user")
    t.push(e[o]), o++;
  else {
    const r = [];
    let i = !0;
    for (; o < n && e[o].role === "model"; )
      r.push(e[o]), i && !Wf(e[o]) && (i = !1), o++;
    i ? t.push(...r) : t.pop();
  }
  return t;
}
var lA = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new uA(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, uA = class {
  constructor(e, t, n, o = {}, r = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = o, this.history = r, this.sendPromise = Promise.resolve(), aA(r);
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
    const t = e ? Qu(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return Je(this, arguments, function* () {
      var o, r, i, s, u, c;
      const d = [];
      try {
        for (var f = !0, h = Ke(e), p; p = yield q(h.next()), o = p.done, !o; f = !0) {
          s = p.value, f = !1;
          const m = s;
          if (sA(m)) {
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
    }), n && n.length > 0 ? this.history.push(...Qu(n)) : this.history.push(e), this.history.push(...o);
  }
}, zf = class Yf extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Yf.prototype);
  }
};
function cA(e) {
  const t = {}, n = a(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function dA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function fA(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Gf(n)), t;
}
function hA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function pA(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], Gf(n)), t;
}
function mA(e) {
  const t = {}, n = a(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function gA(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function _A(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && gA(n, t), t;
}
function yA(e) {
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
function vA(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["files"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(t, ["files"], r);
  }
  return t;
}
var AA = class extends ft {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ht(dt.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const s = _A(e);
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
        const c = yA(u), d = new my();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = cA(e);
      return r = N("upload/v1beta/files", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = dA(u), d = new gy();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = pA(e);
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
      const s = fA(e);
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
        const c = hA(u), d = new _y();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = mA(e);
      return r = N("files:register", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = vA(u), d = new yy();
        return Object.assign(d, c), d;
      });
    }
  }
};
function Zu(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function TA(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function ur(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function SA(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => OA(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function EA(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => GA(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function CA(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function wA(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function IA(e) {
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
function bA(e) {
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
  const E = a(e, ["seed"]);
  E != null && l(t, ["seed"], E);
  const C = a(e, ["speechConfig"]);
  C != null && l(t, ["speechConfig"], C);
  const T = a(e, ["stopSequences"]);
  T != null && l(t, ["stopSequences"], T);
  const I = a(e, ["temperature"]);
  I != null && l(t, ["temperature"], I);
  const L = a(e, ["thinkingConfig"]);
  L != null && l(t, ["thinkingConfig"], L);
  const w = a(e, ["topK"]);
  w != null && l(t, ["topK"], w);
  const k = a(e, ["topP"]);
  if (k != null && l(t, ["topP"], k), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function RA(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], TA(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function PA(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function MA(e, t) {
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
  ], ua(h));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], SA(se(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let b = _n(_);
    Array.isArray(b) && (b = b.map((x) => HA(gn(x)))), l(t, ["setup", "tools"], b);
  }
  const y = a(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], qA(y));
  const E = a(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], Zu(E));
  const C = a(e, ["outputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "outputAudioTranscription"], Zu(C));
  const T = a(e, ["realtimeInputConfig"]);
  t !== void 0 && T != null && l(t, ["setup", "realtimeInputConfig"], T);
  const I = a(e, ["contextWindowCompression"]);
  t !== void 0 && I != null && l(t, ["setup", "contextWindowCompression"], I);
  const L = a(e, ["proactivity"]);
  if (t !== void 0 && L != null && l(t, ["setup", "proactivity"], L), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const w = a(e, ["avatarConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "avatarConfig"], w);
  const k = a(e, ["safetySettings"]);
  if (t !== void 0 && k != null) {
    let b = k;
    Array.isArray(b) && (b = b.map((x) => BA(x))), l(t, ["setup", "safetySettings"], b);
  }
  return n;
}
function xA(e, t) {
  const n = {}, o = a(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], bA(o));
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
  ], ua(h));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], EA(se(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = _n(_);
    Array.isArray(x) && (x = x.map((P) => VA(gn(P)))), l(t, ["setup", "tools"], x);
  }
  const y = a(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], y);
  const E = a(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], E);
  const C = a(e, ["outputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "outputAudioTranscription"], C);
  const T = a(e, ["realtimeInputConfig"]);
  t !== void 0 && T != null && l(t, ["setup", "realtimeInputConfig"], T);
  const I = a(e, ["contextWindowCompression"]);
  t !== void 0 && I != null && l(t, ["setup", "contextWindowCompression"], I);
  const L = a(e, ["proactivity"]);
  t !== void 0 && L != null && l(t, ["setup", "proactivity"], L);
  const w = a(e, ["explicitVadSignal"]);
  t !== void 0 && w != null && l(t, ["setup", "explicitVadSignal"], w);
  const k = a(e, ["avatarConfig"]);
  t !== void 0 && k != null && l(t, ["setup", "avatarConfig"], k);
  const b = a(e, ["safetySettings"]);
  if (t !== void 0 && b != null) {
    let x = b;
    Array.isArray(x) && (x = x.map((P) => P)), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function NA(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["setup", "model"], J(e, o));
  const r = a(t, ["config"]);
  return r != null && l(n, ["config"], MA(r, n)), n;
}
function kA(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["setup", "model"], J(e, o));
  const r = a(t, ["config"]);
  return r != null && l(n, ["config"], xA(r, n)), n;
}
function DA(e) {
  const t = {}, n = a(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function $A(e) {
  const t = {}, n = a(e, ["weightedPrompts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["weightedPrompts"], o);
  }
  return t;
}
function LA(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = $f(n);
    Array.isArray(d) && (d = d.map((f) => ur(f))), l(t, ["mediaChunks"], d);
  }
  const o = a(e, ["audio"]);
  o != null && l(t, ["audio"], ur(Uf(o)));
  const r = a(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = a(e, ["video"]);
  i != null && l(t, ["video"], ur(Lf(i)));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function UA(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = $f(n);
    Array.isArray(d) && (d = d.map((f) => f)), l(t, ["mediaChunks"], d);
  }
  const o = a(e, ["audio"]);
  o != null && l(t, ["audio"], Uf(o));
  const r = a(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = a(e, ["video"]);
  i != null && l(t, ["video"], Lf(i));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function FA(e) {
  const t = {}, n = a(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const o = a(e, ["serverContent"]);
  o != null && l(t, ["serverContent"], o);
  const r = a(e, ["toolCall"]);
  r != null && l(t, ["toolCall"], r);
  const i = a(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const s = a(e, ["usageMetadata"]);
  s != null && l(t, ["usageMetadata"], JA(s));
  const u = a(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = a(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = a(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const f = a(e, ["voiceActivity"]);
  return f != null && l(t, ["voiceActivity"], KA(f)), t;
}
function OA(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], CA(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], wA(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], ur(c));
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
function GA(e) {
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
function BA(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = a(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function qA(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function HA(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], PA(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], RA(i));
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
function VA(e) {
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
    Array.isArray(p) && (p = p.map((m) => IA(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const f = a(e, ["parallelAiSearch"]);
  f != null && l(t, ["parallelAiSearch"], f);
  const h = a(e, ["urlContext"]);
  if (h != null && l(t, ["urlContext"], h), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function JA(e) {
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
function KA(e) {
  const t = {}, n = a(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function WA(e, t) {
  const n = {}, o = a(e, ["apiKey"]);
  if (o != null && l(n, ["apiKey"], o), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function zA(e, t) {
  const n = {}, o = a(e, ["data"]);
  if (o != null && l(n, ["data"], o), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function YA(e, t) {
  const n = {}, o = a(e, ["content"]);
  o != null && l(n, ["content"], o);
  const r = a(e, ["citationMetadata"]);
  r != null && l(n, ["citationMetadata"], XA(r));
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
function XA(e, t) {
  const n = {}, o = a(e, ["citationSources"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(n, ["citations"], r);
  }
  return n;
}
function QA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let s = Ae(i);
    Array.isArray(s) && (s = s.map((u) => vn(u))), l(o, ["contents"], s);
  }
  return o;
}
function ZA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["tokensInfo"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function jA(e, t) {
  const n = {}, o = a(e, ["values"]);
  o != null && l(n, ["values"], o);
  const r = a(e, ["statistics"]);
  return r != null && l(n, ["statistics"], eT(r)), n;
}
function eT(e, t) {
  const n = {}, o = a(e, ["truncated"]);
  o != null && l(n, ["truncated"], o);
  const r = a(e, ["token_count"]);
  return r != null && l(n, ["tokenCount"], r), n;
}
function Eo(e, t) {
  const n = {}, o = a(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => uS(s))), l(n, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function vn(e, t) {
  const n = {}, o = a(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => cS(s))), l(n, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function tT(e, t) {
  const n = {}, o = a(e, ["controlType"]);
  o != null && l(n, ["controlType"], o);
  const r = a(e, ["enableControlImageComputation"]);
  return r != null && l(n, ["computeControl"], r), n;
}
function nT(e, t) {
  const n = {};
  if (a(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (a(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (a(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function oT(e, t, n) {
  const o = {}, r = a(e, ["systemInstruction"]);
  t !== void 0 && r != null && l(t, ["systemInstruction"], vn(se(r)));
  const i = a(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => jf(c))), l(t, ["tools"], u);
  }
  const s = a(e, ["generationConfig"]);
  return t !== void 0 && s != null && l(t, ["generationConfig"], zT(s)), o;
}
function rT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = Ae(i);
    Array.isArray(u) && (u = u.map((c) => Eo(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && nT(s), o;
}
function iT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = Ae(i);
    Array.isArray(u) && (u = u.map((c) => vn(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && oT(s, o), o;
}
function sT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["totalTokens"]);
  r != null && l(n, ["totalTokens"], r);
  const i = a(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function aT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["totalTokens"]);
  return r != null && l(n, ["totalTokens"], r), n;
}
function lT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], J(e, r)), o;
}
function uT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], J(e, r)), o;
}
function cT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function dT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function fT(e, t, n) {
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
  const E = a(e, ["addWatermark"]);
  t !== void 0 && E != null && l(t, ["parameters", "addWatermark"], E);
  const C = a(e, ["labels"]);
  t !== void 0 && C != null && l(t, ["labels"], C);
  const T = a(e, ["editMode"]);
  t !== void 0 && T != null && l(t, ["parameters", "editMode"], T);
  const I = a(e, ["baseSteps"]);
  return t !== void 0 && I != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], I), o;
}
function hT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["referenceImages"]);
  if (s != null) {
    let c = s;
    Array.isArray(c) && (c = c.map((d) => gS(d))), l(o, ["instances[0]", "referenceImages"], c);
  }
  const u = a(t, ["config"]);
  return u != null && fT(u, o), o;
}
function pT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => Kr(s))), l(n, ["generatedImages"], i);
  }
  return n;
}
function mT(e, t, n) {
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
function gT(e, t, n) {
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
function _T(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let d = sa(e, i);
    Array.isArray(d) && (d = d.map((f) => f)), l(o, ["requests[]", "content"], d);
  }
  const s = a(t, ["content"]);
  s != null && Eo(se(s));
  const u = a(t, ["config"]);
  u != null && mT(u, o);
  const c = a(t, ["model"]);
  return c !== void 0 && l(o, ["requests[]", "model"], J(e, c)), o;
}
function yT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  let i = a(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = a(t, ["contents"]);
    if (c != null) {
      let d = sa(e, c);
      Array.isArray(d) && (d = d.map((f) => f)), l(o, ["instances[]", "content"], d);
    }
  }
  let s = a(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "EMBED_CONTENT") {
    const c = a(t, ["content"]);
    c != null && l(o, ["content"], vn(se(c)));
  }
  const u = a(t, ["config"]);
  return u != null && gT(u, o, n), o;
}
function vT(e, t) {
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
function AT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions[]", "embeddings"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => jA(u))), l(n, ["embeddings"], s);
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
function TT(e, t) {
  const n = {}, o = a(e, ["endpoint"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["deployedModelId"]);
  return r != null && l(n, ["deployedModelId"], r), n;
}
function ST(e, t) {
  const n = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["fileUri"]);
  o != null && l(n, ["fileUri"], o);
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function ET(e, t) {
  const n = {}, o = a(e, ["id"]);
  o != null && l(n, ["id"], o);
  const r = a(e, ["args"]);
  r != null && l(n, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(n, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function CT(e, t) {
  const n = {}, o = a(e, ["allowedFunctionNames"]);
  o != null && l(n, ["allowedFunctionNames"], o);
  const r = a(e, ["mode"]);
  if (r != null && l(n, ["mode"], r), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function wT(e, t) {
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
function IT(e, t, n, o) {
  const r = {}, i = a(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], Eo(se(i)));
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
  const E = a(t, ["responseMimeType"]);
  E != null && l(r, ["responseMimeType"], E);
  const C = a(t, ["responseSchema"]);
  C != null && l(r, ["responseSchema"], aa(C));
  const T = a(t, ["responseJsonSchema"]);
  if (T != null && l(r, ["responseJsonSchema"], T), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const I = a(t, ["safetySettings"]);
  if (n !== void 0 && I != null) {
    let K = I;
    Array.isArray(K) && (K = K.map((_e) => _S(_e))), l(n, ["safetySettings"], K);
  }
  const L = a(t, ["tools"]);
  if (n !== void 0 && L != null) {
    let K = _n(L);
    Array.isArray(K) && (K = K.map((_e) => wS(gn(_e)))), l(n, ["tools"], K);
  }
  const w = a(t, ["toolConfig"]);
  if (n !== void 0 && w != null && l(n, ["toolConfig"], ES(w)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const k = a(t, ["cachedContent"]);
  n !== void 0 && k != null && l(n, ["cachedContent"], ht(e, k));
  const b = a(t, ["responseModalities"]);
  b != null && l(r, ["responseModalities"], b);
  const x = a(t, ["mediaResolution"]);
  x != null && l(r, ["mediaResolution"], x);
  const P = a(t, ["speechConfig"]);
  if (P != null && l(r, ["speechConfig"], la(P)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const F = a(t, ["thinkingConfig"]);
  F != null && l(r, ["thinkingConfig"], F);
  const Y = a(t, ["imageConfig"]);
  Y != null && l(r, ["imageConfig"], jT(Y));
  const V = a(t, ["enableEnhancedCivicAnswers"]);
  if (V != null && l(r, ["enableEnhancedCivicAnswers"], V), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const W = a(t, ["serviceTier"]);
  return n !== void 0 && W != null && l(n, ["serviceTier"], W), r;
}
function bT(e, t, n, o) {
  const r = {}, i = a(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], vn(se(i)));
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
  const E = a(t, ["responseMimeType"]);
  E != null && l(r, ["responseMimeType"], E);
  const C = a(t, ["responseSchema"]);
  C != null && l(r, ["responseSchema"], aa(C));
  const T = a(t, ["responseJsonSchema"]);
  T != null && l(r, ["responseJsonSchema"], T);
  const I = a(t, ["routingConfig"]);
  I != null && l(r, ["routingConfig"], I);
  const L = a(t, ["modelSelectionConfig"]);
  L != null && l(r, ["modelConfig"], L);
  const w = a(t, ["safetySettings"]);
  if (n !== void 0 && w != null) {
    let fe = w;
    Array.isArray(fe) && (fe = fe.map((ui) => ui)), l(n, ["safetySettings"], fe);
  }
  const k = a(t, ["tools"]);
  if (n !== void 0 && k != null) {
    let fe = _n(k);
    Array.isArray(fe) && (fe = fe.map((ui) => jf(gn(ui)))), l(n, ["tools"], fe);
  }
  const b = a(t, ["toolConfig"]);
  n !== void 0 && b != null && l(n, ["toolConfig"], CS(b));
  const x = a(t, ["labels"]);
  n !== void 0 && x != null && l(n, ["labels"], x);
  const P = a(t, ["cachedContent"]);
  n !== void 0 && P != null && l(n, ["cachedContent"], ht(e, P));
  const F = a(t, ["responseModalities"]);
  F != null && l(r, ["responseModalities"], F);
  const Y = a(t, ["mediaResolution"]);
  Y != null && l(r, ["mediaResolution"], Y);
  const V = a(t, ["speechConfig"]);
  V != null && l(r, ["speechConfig"], la(V));
  const W = a(t, ["audioTimestamp"]);
  W != null && l(r, ["audioTimestamp"], W);
  const K = a(t, ["thinkingConfig"]);
  K != null && l(r, ["thinkingConfig"], K);
  const _e = a(t, ["imageConfig"]);
  if (_e != null && l(r, ["imageConfig"], eS(_e)), a(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const ze = a(t, ["modelArmorConfig"]);
  n !== void 0 && ze != null && l(n, ["modelArmorConfig"], ze);
  const xe = a(t, ["serviceTier"]);
  return n !== void 0 && xe != null && l(n, ["serviceTier"], xe), r;
}
function ju(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = Ae(i);
    Array.isArray(u) && (u = u.map((c) => Eo(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(o, ["generationConfig"], IT(e, s, o)), o;
}
function ec(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = Ae(i);
    Array.isArray(u) && (u = u.map((c) => vn(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(o, ["generationConfig"], bT(e, s, o)), o;
}
function tc(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["candidates"]);
  if (r != null) {
    let f = r;
    Array.isArray(f) && (f = f.map((h) => YA(h))), l(n, ["candidates"], f);
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
function nc(e, t) {
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
function RT(e, t, n) {
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
function PT(e, t, n) {
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
  const E = a(e, ["addWatermark"]);
  t !== void 0 && E != null && l(t, ["parameters", "addWatermark"], E);
  const C = a(e, ["labels"]);
  t !== void 0 && C != null && l(t, ["labels"], C);
  const T = a(e, ["imageSize"]);
  t !== void 0 && T != null && l(t, ["parameters", "sampleImageSize"], T);
  const I = a(e, ["enhancePrompt"]);
  return t !== void 0 && I != null && l(t, ["parameters", "enhancePrompt"], I), o;
}
function MT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["config"]);
  return s != null && RT(s, o), o;
}
function xT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["config"]);
  return s != null && PT(s, o), o;
}
function NT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => VT(u))), l(n, ["generatedImages"], s);
  }
  const i = a(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Qf(i)), n;
}
function kT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => Kr(u))), l(n, ["generatedImages"], s);
  }
  const i = a(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Zf(i)), n;
}
function DT(e, t, n) {
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
  t !== void 0 && h != null && l(t, ["instances[0]", "lastFrame"], Wr(h));
  const p = a(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => FS(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (a(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (a(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (a(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = a(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), o;
}
function $T(e, t, n) {
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
  t !== void 0 && y != null && l(t, ["instances[0]", "lastFrame"], We(y));
  const E = a(e, ["referenceImages"]);
  if (t !== void 0 && E != null) {
    let L = E;
    Array.isArray(L) && (L = L.map((w) => OS(w))), l(t, ["instances[0]", "referenceImages"], L);
  }
  const C = a(e, ["mask"]);
  t !== void 0 && C != null && l(t, ["instances[0]", "mask"], US(C));
  const T = a(e, ["compressionQuality"]);
  t !== void 0 && T != null && l(t, ["parameters", "compressionQuality"], T);
  const I = a(e, ["labels"]);
  if (t !== void 0 && I != null && l(t, ["labels"], I), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return o;
}
function LT(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(n, ["done"], i);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], GT(u)), n;
}
function UT(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(n, ["done"], i);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response"]);
  return u != null && l(n, ["response"], BT(u)), n;
}
function FT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["image"]);
  s != null && l(o, ["instances[0]", "image"], Wr(s));
  const u = a(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], eh(u));
  const c = a(t, ["source"]);
  c != null && qT(c, o);
  const d = a(t, ["config"]);
  return d != null && DT(d, o), o;
}
function OT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["image"]);
  s != null && l(o, ["instances[0]", "image"], We(s));
  const u = a(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], th(u));
  const c = a(t, ["source"]);
  c != null && HT(c, o);
  const d = a(t, ["config"]);
  return d != null && $T(d, o), o;
}
function GT(e, t) {
  const n = {}, o = a(e, ["generatedSamples"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => KT(u))), l(n, ["generatedVideos"], s);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function BT(e, t) {
  const n = {}, o = a(e, ["videos"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => WT(u))), l(n, ["generatedVideos"], s);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function qT(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Wr(i));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], eh(s)), o;
}
function HT(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], We(i));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], th(s)), o;
}
function VT(e, t) {
  const n = {}, o = a(e, ["_self"]);
  o != null && l(n, ["image"], tS(o));
  const r = a(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = a(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], Qf(i)), n;
}
function Kr(e, t) {
  const n = {}, o = a(e, ["_self"]);
  o != null && l(n, ["image"], Xf(o));
  const r = a(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = a(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], Zf(i));
  const s = a(e, ["prompt"]);
  return s != null && l(n, ["enhancedPrompt"], s), n;
}
function JT(e, t) {
  const n = {}, o = a(e, ["_self"]);
  o != null && l(n, ["mask"], Xf(o));
  const r = a(e, ["labels"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(n, ["labels"], i);
  }
  return n;
}
function KT(e, t) {
  const n = {}, o = a(e, ["video"]);
  return o != null && l(n, ["video"], $S(o)), n;
}
function WT(e, t) {
  const n = {}, o = a(e, ["_self"]);
  return o != null && l(n, ["video"], LS(o)), n;
}
function zT(e, t) {
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
  const E = a(e, ["routingConfig"]);
  E != null && l(n, ["routingConfig"], E);
  const C = a(e, ["seed"]);
  C != null && l(n, ["seed"], C);
  const T = a(e, ["speechConfig"]);
  T != null && l(n, ["speechConfig"], T);
  const I = a(e, ["stopSequences"]);
  I != null && l(n, ["stopSequences"], I);
  const L = a(e, ["temperature"]);
  L != null && l(n, ["temperature"], L);
  const w = a(e, ["thinkingConfig"]);
  w != null && l(n, ["thinkingConfig"], w);
  const k = a(e, ["topK"]);
  k != null && l(n, ["topK"], k);
  const b = a(e, ["topP"]);
  if (b != null && l(n, ["topP"], b), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function YT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], J(e, r)), o;
}
function XT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], J(e, r)), o;
}
function QT(e, t) {
  const n = {}, o = a(e, ["authConfig"]);
  o != null && l(n, ["authConfig"], WA(o));
  const r = a(e, ["enableWidget"]);
  return r != null && l(n, ["enableWidget"], r), n;
}
function ZT(e, t) {
  const n = {}, o = a(e, ["searchTypes"]);
  if (o != null && l(n, ["searchTypes"], o), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(n, ["timeRangeFilter"], r), n;
}
function jT(e, t) {
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
function eS(e, t) {
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
function tS(e, t) {
  const n = {}, o = a(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], bt(o));
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function Xf(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = a(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], bt(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Wr(e, t) {
  const n = {};
  if (a(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const o = a(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], bt(o));
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function We(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = a(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], bt(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function nS(e, t, n, o) {
  const r = {}, i = a(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], Bf(e, c)), r;
}
function oS(e, t, n, o) {
  const r = {}, i = a(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], Bf(e, c)), r;
}
function rS(e, t, n) {
  const o = {}, r = a(t, ["config"]);
  return r != null && nS(e, r, o), o;
}
function iS(e, t, n) {
  const o = {}, r = a(t, ["config"]);
  return r != null && oS(e, r, o), o;
}
function sS(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["_self"]);
  if (i != null) {
    let s = qf(i);
    Array.isArray(s) && (s = s.map((u) => rs(u))), l(n, ["models"], s);
  }
  return n;
}
function aS(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["_self"]);
  if (i != null) {
    let s = qf(i);
    Array.isArray(s) && (s = s.map((u) => is(u))), l(n, ["models"], s);
  }
  return n;
}
function lS(e, t) {
  const n = {}, o = a(e, ["maskMode"]);
  o != null && l(n, ["maskMode"], o);
  const r = a(e, ["segmentationClasses"]);
  r != null && l(n, ["maskClasses"], r);
  const i = a(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function rs(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["displayName"]);
  r != null && l(n, ["displayName"], r);
  const i = a(e, ["description"]);
  i != null && l(n, ["description"], i);
  const s = a(e, ["version"]);
  s != null && l(n, ["version"], s);
  const u = a(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], IS(u));
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
function is(e, t) {
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
    Array.isArray(p) && (p = p.map((m) => TT(m))), l(n, ["endpoints"], p);
  }
  const c = a(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = a(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], bS(d));
  const f = a(e, ["defaultCheckpointId"]);
  f != null && l(n, ["defaultCheckpointId"], f);
  const h = a(e, ["checkpoints"]);
  if (h != null) {
    let p = h;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function uS(e, t) {
  const n = {}, o = a(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(n, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const s = a(e, ["fileData"]);
  s != null && l(n, ["fileData"], ST(s));
  const u = a(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], ET(u));
  const c = a(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = a(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], zA(d));
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
function cS(e, t) {
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
function dS(e, t) {
  const n = {}, o = a(e, ["productImage"]);
  return o != null && l(n, ["image"], We(o)), n;
}
function fS(e, t, n) {
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
function hS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["source"]);
  i != null && mS(i, o);
  const s = a(t, ["config"]);
  return s != null && fS(s, o), o;
}
function pS(e, t) {
  const n = {}, o = a(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => Kr(i))), l(n, ["generatedImages"], r);
  }
  return n;
}
function mS(e, t, n) {
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
    Array.isArray(u) && (u = u.map((c) => dS(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return o;
}
function gS(e, t) {
  const n = {}, o = a(e, ["referenceImage"]);
  o != null && l(n, ["referenceImage"], We(o));
  const r = a(e, ["referenceId"]);
  r != null && l(n, ["referenceId"], r);
  const i = a(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const s = a(e, ["maskImageConfig"]);
  s != null && l(n, ["maskImageConfig"], lS(s));
  const u = a(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], tT(u));
  const c = a(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = a(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function Qf(e, t) {
  const n = {}, o = a(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = a(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = a(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function Zf(e, t) {
  const n = {}, o = a(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = a(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = a(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function _S(e, t) {
  const n = {}, o = a(e, ["category"]);
  if (o != null && l(n, ["category"], o), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(n, ["threshold"], r), n;
}
function yS(e, t) {
  const n = {}, o = a(e, ["image"]);
  return o != null && l(n, ["image"], We(o)), n;
}
function vS(e, t, n) {
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
function AS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["source"]);
  i != null && SS(i, o);
  const s = a(t, ["config"]);
  return s != null && vS(s, o), o;
}
function TS(e, t) {
  const n = {}, o = a(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => JT(i))), l(n, ["generatedMasks"], r);
  }
  return n;
}
function SS(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], We(i));
  const s = a(e, ["scribbleImage"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "scribble"], yS(s)), o;
}
function ES(e, t) {
  const n = {}, o = a(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = a(e, ["functionCallingConfig"]);
  r != null && l(n, ["functionCallingConfig"], CT(r));
  const i = a(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function CS(e, t) {
  const n = {}, o = a(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = a(e, ["functionCallingConfig"]);
  if (r != null && l(n, ["functionCallingConfig"], r), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function wS(e, t) {
  const n = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = a(e, ["computerUse"]);
  o != null && l(n, ["computerUse"], o);
  const r = a(e, ["fileSearch"]);
  r != null && l(n, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], ZT(i));
  const s = a(e, ["googleMaps"]);
  s != null && l(n, ["googleMaps"], QT(s));
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
function jf(e, t) {
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
    Array.isArray(m) && (m = m.map((g) => wT(g))), l(n, ["functionDeclarations"], m);
  }
  const f = a(e, ["googleSearchRetrieval"]);
  f != null && l(n, ["googleSearchRetrieval"], f);
  const h = a(e, ["parallelAiSearch"]);
  h != null && l(n, ["parallelAiSearch"], h);
  const p = a(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function IS(e, t) {
  const n = {}, o = a(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = a(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function bS(e, t) {
  const n = {}, o = a(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = a(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function RS(e, t, n) {
  const o = {}, r = a(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = a(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), o;
}
function PS(e, t, n) {
  const o = {}, r = a(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = a(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), o;
}
function MS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "name"], J(e, r));
  const i = a(t, ["config"]);
  return i != null && RS(i, o), o;
}
function xS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["config"]);
  return i != null && PS(i, o), o;
}
function NS(e, t, n) {
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
function kS(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], J(e, r));
  const i = a(t, ["image"]);
  i != null && l(o, ["instances[0]", "image"], We(i));
  const s = a(t, ["upscaleFactor"]);
  s != null && l(o, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], s);
  const u = a(t, ["config"]);
  return u != null && NS(u, o), o;
}
function DS(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => Kr(s))), l(n, ["generatedImages"], i);
  }
  return n;
}
function $S(e, t) {
  const n = {}, o = a(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = a(e, ["encodedVideo"]);
  r != null && l(n, ["videoBytes"], bt(r));
  const i = a(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function LS(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["uri"], o);
  const r = a(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["videoBytes"], bt(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function US(e, t) {
  const n = {}, o = a(e, ["image"]);
  o != null && l(n, ["_self"], We(o));
  const r = a(e, ["maskMode"]);
  return r != null && l(n, ["maskMode"], r), n;
}
function FS(e, t) {
  const n = {}, o = a(e, ["image"]);
  o != null && l(n, ["image"], Wr(o));
  const r = a(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function OS(e, t) {
  const n = {}, o = a(e, ["image"]);
  o != null && l(n, ["image"], We(o));
  const r = a(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function eh(e, t) {
  const n = {}, o = a(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = a(e, ["videoBytes"]);
  r != null && l(n, ["encodedVideo"], bt(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function th(e, t) {
  const n = {}, o = a(e, ["uri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = a(e, ["videoBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], bt(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function GS(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["displayName"], o), n;
}
function BS(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && GS(n, t), t;
}
function qS(e, t) {
  const n = {}, o = a(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function HS(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = a(e, ["config"]);
  return o != null && qS(o, t), t;
}
function VS(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function JS(e, t) {
  const n = {}, o = a(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["customMetadata"], i);
  }
  const r = a(e, ["chunkingConfig"]);
  return t !== void 0 && r != null && l(t, ["chunkingConfig"], r), n;
}
function KS(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], zS(s)), t;
}
function WS(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = a(e, ["fileName"]);
  o != null && l(t, ["fileName"], o);
  const r = a(e, ["config"]);
  return r != null && JS(r, t), t;
}
function zS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = a(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function YS(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function XS(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && YS(n, t), t;
}
function QS(e) {
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
function nh(e, t) {
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
function ZS(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = a(e, ["config"]);
  return o != null && nh(o, t), t;
}
function jS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var eE = "Content-Type", tE = "X-Server-Timeout", nE = "User-Agent", ss = "x-goog-api-client", oE = "google-genai-sdk/1.50.1", rE = "v1beta1", iE = "v1beta", sE = /* @__PURE__ */ new Set(["us", "eu"]), aE = 5, lE = [
  408,
  429,
  500,
  502,
  503,
  504
], uE = class {
  constructor(e) {
    var t, n, o;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const r = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (r.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? r.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && sE.has(this.clientOptions.location) ? r.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (r.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), r.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : rE;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), r.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : iE, r.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === es.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
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
    return t && t.extraBody !== null && cE(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await oc(o), new ts(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await oc(o), this.processStreamResponse(o))).catch((o) => {
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
          const f = r.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(f);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, y = g.code, E = `got status: ${_}. ${JSON.stringify(m)}`;
              if (y >= 400 && y < 600) throw new zf({
                message: E,
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
                yield yield q(new ts(new Response(_, {
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
      throw lE.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new Pl.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, Pl.default)(r, { retries: ((n = o.attempts) !== null && n !== void 0 ? n : aE) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = oE + " " + this.clientOptions.userAgentExtra;
    return e[nE] = t, e[ss] = t, e[eE] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [o, r] of Object.entries(e.headers)) n.append(o, r);
      e.timeout && e.timeout > 0 && n.append(tE, String(Math.ceil(e.timeout / 1e3)));
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
    n != null && nh(n, f);
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
async function oc(e) {
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
    throw n >= 400 && n < 600 ? new zf({
      message: r,
      status: n
    }) : new Error(r);
  }
}
function cE(e, t) {
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
var dE = "mcp_used/unknown", fE = !1;
function oh(e) {
  for (const t of e)
    if (hE(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return fE;
}
function rh(e) {
  var t;
  e[ss] = (((t = e[ss]) !== null && t !== void 0 ? t : "") + ` ${dE}`).trimStart();
}
function hE(e) {
  return e !== null && typeof e == "object" && e instanceof mE;
}
function pE(e) {
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
var mE = class ih {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new ih(t, n);
  }
  async initialize() {
    var t, n, o, r;
    if (this.mcpTools.length > 0) return;
    const i = {}, s = [];
    for (const f of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, Ke(pE(f))), d; d = await c.next(), t = d.done, !t; u = !0) {
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
    return await this.initialize(), Py(this.mcpTools, this.config);
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
async function gE(e, t, n) {
  const o = new Ay();
  let r;
  n.data instanceof Blob ? r = JSON.parse(await n.data.text()) : r = JSON.parse(n.data), Object.assign(o, r), t(o);
}
var _E = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const o = this.apiClient.getWebsocketBaseUrl(), r = this.apiClient.getApiVersion(), i = AE(this.apiClient.getDefaultHeaders()), s = `${o}/ws/google.ai.generativelanguage.${r}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, f = function() {
      u({});
    }, h = this.apiClient, p = {
      onopen: f,
      onmessage: (_) => {
        gE(h, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(s, vE(i), p);
    m.connect(), await c;
    const g = { setup: { model: J(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new yE(m, this.apiClient);
  }
}, yE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = $A(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = DA(e);
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
function vE(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function AE(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var TE = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function SE(e, t, n) {
  const o = new vy();
  let r;
  n.data instanceof Blob ? r = await n.data.text() : n.data instanceof ArrayBuffer ? r = new TextDecoder().decode(n.data) : r = n.data;
  const i = JSON.parse(r);
  if (e.isVertexAI()) {
    const s = FA(i);
    Object.assign(o, s);
  } else Object.assign(o, i);
  t(o);
}
var EE = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new _E(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, o, r, i, s;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const f = this.apiClient.getHeaders();
    e.config && e.config.tools && oh(e.config.tools) && rh(f);
    const h = bE(f);
    if (this.apiClient.isVertexAI()) {
      const b = this.apiClient.getProject(), x = this.apiClient.getLocation(), P = this.apiClient.getApiKey(), F = !!b && !!x || !!P;
      this.apiClient.getCustomBaseUrl() && !F ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(h, d));
    } else {
      const b = this.apiClient.getApiKey();
      let x = "BidiGenerateContent", P = "key";
      b?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), x = "BidiGenerateContentConstrained", P = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${x}?${P}=${b}`;
    }
    let p = () => {
    };
    const m = new Promise((b) => {
      p = b;
    }), g = e.callbacks, _ = function() {
      var b;
      (b = g?.onopen) === null || b === void 0 || b.call(g), p({});
    }, y = this.apiClient, E = {
      onopen: _,
      onmessage: (b) => {
        SE(y, g.onmessage, b);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(b) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(b) {
      }
    }, C = this.webSocketFactory.create(d, IE(h), E);
    C.connect(), await m;
    let T = J(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && T.startsWith("publishers/")) {
      const b = this.apiClient.getProject(), x = this.apiClient.getLocation();
      b && x && (T = `projects/${b}/locations/${x}/` + T);
    }
    let I = {};
    this.apiClient.isVertexAI() && ((o = e.config) === null || o === void 0 ? void 0 : o.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [Er.AUDIO] } : e.config.responseModalities = [Er.AUDIO]), !((r = e.config) === null || r === void 0) && r.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const L = (s = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && s !== void 0 ? s : [], w = [];
    for (const b of L) if (this.isCallableTool(b)) {
      const x = b;
      w.push(await x.tool());
    } else w.push(b);
    w.length > 0 && (e.config.tools = w);
    const k = {
      model: T,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? I = kA(this.apiClient, k) : I = NA(this.apiClient, k), delete I.config, C.send(JSON.stringify(I)), new wE(C, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, CE = { turnComplete: !0 }, wE = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = Ae(t.turns), e.isVertexAI() || (n = n.map((o) => Eo(o)));
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
      if (!e.isVertexAI() && !("id" in o)) throw new Error(TE);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, CE), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: UA(e) } : t = { realtimeInput: LA(e) }, this.conn.send(JSON.stringify(t));
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
function IE(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function bE(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var rc = 10;
function ic(e) {
  var t, n, o;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let r = !1;
  for (const s of (n = e?.tools) !== null && n !== void 0 ? n : []) if (dn(s)) {
    r = !0;
    break;
  }
  if (!r) return !0;
  const i = (o = e?.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function dn(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function RE(e) {
  var t, n, o;
  return (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((r) => dn(r))) !== null && o !== void 0 ? o : !1;
}
function sc(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((o, r) => {
    if (dn(o)) return;
    const i = o;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(r);
  }), n;
}
function ac(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var PE = class extends ft {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = Ae(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = Ae(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const o = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: Cr.EMBED_CONTENT
        });
        return await this.embedContentInternal(o);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: Cr.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, o, r, i, s;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !RE(t) || ic(t.config)) return await this.generateContentInternal(u);
      const c = sc(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, f;
      const h = Ae(u.contents), p = (r = (o = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && r !== void 0 ? r : rc;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const y of (s = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && s !== void 0 ? s : []) if (dn(y)) {
          const E = await y.callTool(d.functionCalls);
          _.push(...E);
        }
        m++, f = {
          role: "user",
          parts: _
        }, u.contents = Ae(u.contents), u.contents.push(g), u.contents.push(f), ac(u.config) && (h.push(g), h.push(f));
      }
      return ac(u.config) && (d.automaticFunctionCallingHistory = h), d;
    }, this.generateContentStream = async (t) => {
      var n, o, r, i, s;
      if (this.maybeMoveToResponseJsonSchem(t), ic(t.config)) {
        const f = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(f);
      }
      const u = sc(t);
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
      return new Ht(dt.PAGED_ITEM_MODELS, (r) => this.listInternal(r), await this.listInternal(o), o);
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
    const i = await Promise.all(r.map(async (u) => dn(u) ? await u.tool() : u)), s = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (s.config.tools = i, e.config && e.config.tools && oh(e.config.tools)) {
      const u = (o = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && o !== void 0 ? o : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), rh(c), s.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return s;
  }
  async initAfcToolsMap(e) {
    var t, n, o;
    const r = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (dn(i)) {
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
    const r = (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && o !== void 0 ? o : rc;
    let i = !1, s = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, f) {
      return Je(this, arguments, function* () {
        for (var h, p, m, g, _, y; s < r; ) {
          i && (s++, i = !1);
          const I = yield q(c.processParamsMaybeAddMcpUsage(f)), L = yield q(c.generateContentStreamInternal(I)), w = [], k = [];
          try {
            for (var E = !0, C = (p = void 0, Ke(L)), T; T = yield q(C.next()), h = T.done, !h; E = !0) {
              g = T.value, E = !1;
              const b = g;
              if (yield yield q(b), b.candidates && (!((_ = b.candidates[0]) === null || _ === void 0) && _.content)) {
                k.push(b.candidates[0].content);
                for (const x of (y = b.candidates[0].content.parts) !== null && y !== void 0 ? y : []) if (s < r && x.functionCall) {
                  if (!x.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(x.functionCall.name)) {
                    const P = yield q(d.get(x.functionCall.name).callTool([x.functionCall]));
                    w.push(...P);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${x.functionCall.name}`);
                }
              }
            }
          } catch (b) {
            p = { error: b };
          } finally {
            try {
              !E && !h && (m = C.return) && (yield q(m.call(C)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (w.length > 0) {
            i = !0;
            const b = new Un();
            b.candidates = [{ content: {
              role: "user",
              parts: w
            } }], yield yield q(b);
            const x = [];
            x.push(...k), x.push({
              role: "user",
              parts: w
            }), f.contents = Ae(f.contents).concat(x);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ec(this.apiClient, e);
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
        const f = nc(d), h = new Un();
        return Object.assign(h, f), h;
      });
    } else {
      const c = ju(this.apiClient, e);
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
        const f = tc(d), h = new Un();
        return Object.assign(h, f), h;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ec(this.apiClient, e);
      return s = N("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return Je(this, arguments, function* () {
          var f, h, p, m;
          try {
            for (var g = !0, _ = Ke(d), y; y = yield q(_.next()), f = y.done, !f; g = !0) {
              m = y.value, g = !1;
              const E = m, C = nc(yield q(E.json()), e);
              C.sdkHttpResponse = { headers: E.headers };
              const T = new Un();
              Object.assign(T, C), yield yield q(T);
            }
          } catch (E) {
            h = { error: E };
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
      const c = ju(this.apiClient, e);
      return s = N("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }), i.then(function(d) {
        return Je(this, arguments, function* () {
          var f, h, p, m;
          try {
            for (var g = !0, _ = Ke(d), y; y = yield q(_.next()), f = y.done, !f; g = !0) {
              m = y.value, g = !1;
              const E = m, C = tc(yield q(E.json()), e);
              C.sdkHttpResponse = { headers: E.headers };
              const T = new Un();
              Object.assign(T, C), yield yield q(T);
            }
          } catch (E) {
            h = { error: E };
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
      const c = yT(this.apiClient, e, e);
      return s = N(xy(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const f = AT(d, e), h = new ku();
        return Object.assign(h, f), h;
      });
    } else {
      const c = _T(this.apiClient, e);
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
        const f = vT(d), h = new ku();
        return Object.assign(h, f), h;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = xT(this.apiClient, e);
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
        const f = kT(d), h = new Du();
        return Object.assign(h, f), h;
      });
    } else {
      const c = MT(this.apiClient, e);
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
        const f = NT(d), h = new Du();
        return Object.assign(h, f), h;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = hT(this.apiClient, e);
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
        const c = pT(u), d = new sy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = kS(this.apiClient, e);
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
        const c = DS(u), d = new ay();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = hS(this.apiClient, e);
      return r = N("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = pS(u), d = new ly();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
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
      }).then((u) => u.json()), o.then((u) => {
        const c = TS(u), d = new uy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = XT(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => is(d));
    } else {
      const c = YT(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => rs(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = iS(this.apiClient, e);
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
        const f = aS(d), h = new $u();
        return Object.assign(h, f), h;
      });
    } else {
      const c = rS(this.apiClient, e);
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
        const f = sS(d), h = new $u();
        return Object.assign(h, f), h;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = xS(this.apiClient, e);
      return s = N("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => is(d));
    } else {
      const c = MS(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => rs(d));
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = uT(this.apiClient, e);
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
        const f = dT(d), h = new Lu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = lT(this.apiClient, e);
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
        const f = cT(d), h = new Lu();
        return Object.assign(h, f), h;
      });
    }
  }
  async countTokens(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = iT(this.apiClient, e);
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
        const f = aT(d), h = new Uu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = rT(this.apiClient, e);
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
        const f = sT(d), h = new Uu();
        return Object.assign(h, f), h;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = QA(this.apiClient, e);
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
        const c = ZA(u), d = new cy();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = OT(this.apiClient, e);
      return s = N("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const f = UT(d), h = new Fu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = FT(this.apiClient, e);
      return s = N("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const f = LT(d), h = new Fu();
        return Object.assign(h, f), h;
      });
    }
  }
}, ME = class extends ft {
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
      const c = ey(e);
      return s = N("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = j_(e);
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
      const s = K_(e);
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
function lc(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function xE(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function NE(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function kE(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => qE(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function DE(e, t, n) {
  const o = {}, r = a(t, ["expireTime"]);
  n !== void 0 && r != null && l(n, ["expireTime"], r);
  const i = a(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const s = a(t, ["uses"]);
  n !== void 0 && s != null && l(n, ["uses"], s);
  const u = a(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], BE(e, u));
  const c = a(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), o;
}
function $E(e, t) {
  const n = {}, o = a(t, ["config"]);
  return o != null && l(n, ["config"], DE(e, o, n)), n;
}
function LE(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function UE(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function FE(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], xE(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function OE(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function GE(e, t) {
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
  ], ua(h));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], kE(se(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let b = _n(_);
    Array.isArray(b) && (b = b.map((x) => JE(gn(x)))), l(t, ["setup", "tools"], b);
  }
  const y = a(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], VE(y));
  const E = a(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], lc(E));
  const C = a(e, ["outputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "outputAudioTranscription"], lc(C));
  const T = a(e, ["realtimeInputConfig"]);
  t !== void 0 && T != null && l(t, ["setup", "realtimeInputConfig"], T);
  const I = a(e, ["contextWindowCompression"]);
  t !== void 0 && I != null && l(t, ["setup", "contextWindowCompression"], I);
  const L = a(e, ["proactivity"]);
  if (t !== void 0 && L != null && l(t, ["setup", "proactivity"], L), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const w = a(e, ["avatarConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "avatarConfig"], w);
  const k = a(e, ["safetySettings"]);
  if (t !== void 0 && k != null) {
    let b = k;
    Array.isArray(b) && (b = b.map((x) => HE(x))), l(t, ["setup", "safetySettings"], b);
  }
  return n;
}
function BE(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["setup", "model"], J(e, o));
  const r = a(t, ["config"]);
  return r != null && l(n, ["config"], GE(r, n)), n;
}
function qE(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], LE(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], UE(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], NE(c));
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
function HE(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = a(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function VE(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function JE(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], OE(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], FE(i));
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
function KE(e) {
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
function WE(e, t) {
  let n = null;
  const o = e.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const i = o.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else o !== void 0 && delete e.bidiGenerateContentSetup;
  const r = e.fieldMask;
  if (n) {
    const i = KE(n);
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
var zE = class extends ft {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const s = $E(this.apiClient, e);
      r = N("auth_tokens", s._url), i = s._query, delete s.config, delete s._url, delete s._query;
      const u = WE(s, e.config);
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
function YE(e, t) {
  const n = {}, o = a(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function XE(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = a(e, ["config"]);
  return o != null && YE(o, t), t;
}
function QE(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function ZE(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function jE(e) {
  const t = {}, n = a(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const o = a(e, ["config"]);
  return o != null && ZE(o, t), t;
}
function eC(e) {
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
var tC = class extends ft {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Ht(dt.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = QE(e);
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
      const i = XE(e);
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
      const s = jE(e);
      return r = N("{parent}/documents", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = eC(u), d = new dy();
        return Object.assign(d, c), d;
      });
    }
  }
}, nC = class extends ft {
  constructor(e, t = new tC(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Ht(dt.PAGED_ITEM_FILE_SEARCH_STORES, (o) => this.listInternal(o), await this.listInternal(n), n);
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
      const s = BS(e);
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
      const s = VS(e);
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
      const i = HS(e);
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
      const s = XS(e);
      return r = N("fileSearchStores", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = QS(u), d = new fy();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = ZS(e);
      return r = N("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = jS(u), d = new hy();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = WS(e);
      return r = N("{file_search_store_name}:importFile", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = KS(u), d = new py();
        return Object.assign(d, c), d;
      });
    }
  }
}, sh = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return sh = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
}, oC = () => sh();
function as(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ls = (e) => {
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
}, Le = class extends Error {
}, Fe = class us extends Le {
  constructor(t, n, o, r) {
    super(`${us.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.error = n;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new zr({
      message: o,
      cause: ls(n)
    });
    const i = n;
    return t === 400 ? new lh(t, i, o, r) : t === 401 ? new uh(t, i, o, r) : t === 403 ? new ch(t, i, o, r) : t === 404 ? new dh(t, i, o, r) : t === 409 ? new fh(t, i, o, r) : t === 422 ? new hh(t, i, o, r) : t === 429 ? new ph(t, i, o, r) : t >= 500 ? new mh(t, i, o, r) : new us(t, i, o, r);
  }
}, cs = class extends Fe {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, zr = class extends Fe {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, ah = class extends zr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, lh = class extends Fe {
}, uh = class extends Fe {
}, ch = class extends Fe {
}, dh = class extends Fe {
}, fh = class extends Fe {
}, hh = class extends Fe {
}, ph = class extends Fe {
}, mh = class extends Fe {
}, rC = /^[a-z][a-z0-9+.-]*:/i, iC = (e) => rC.test(e), ds = (e) => (ds = Array.isArray, ds(e)), uc = ds;
function cc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function sC(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var aC = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new Le(`${e} must be an integer`);
  if (t < 0) throw new Le(`${e} must be a positive integer`);
  return t;
}, lC = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, uC = (e) => new Promise((t) => setTimeout(t, e));
function cC() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function gh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function dC(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return gh({
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
function _h(e) {
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
async function fC(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const o = e.getReader(), r = o.cancel();
  o.releaseLock(), await r;
}
var hC = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function pC(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new Le(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var mC = "0.0.1", yh = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Ti(e, t, n) {
  return yh(), new File(e, t ?? "unknown_file", n);
}
function gC(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var _C = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", vh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", yC = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && vh(e), vC = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function AC(e, t, n) {
  if (yh(), e = await e, yC(e))
    return e instanceof File ? e : Ti([await e.arrayBuffer()], e.name);
  if (vC(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Ti(await fs(r), t, n);
  }
  const o = await fs(e);
  if (t || (t = gC(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = Object.assign(Object.assign({}, n), { type: r }));
  }
  return Ti(o, t, n);
}
async function fs(e) {
  var t, n, o, r, i;
  let s = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) s.push(e);
  else if (vh(e)) s.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (_C(e)) try {
    for (var u = !0, c = Ke(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      r = d.value, u = !1;
      const f = r;
      s.push(...await fs(f));
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
    throw new Error(`Unexpected data type: ${typeof e}${f ? `; constructor: ${f}` : ""}${TC(e)}`);
  }
  return s;
}
function TC(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var ca = class {
  constructor(e) {
    this._client = e;
  }
};
ca._key = [];
function Ah(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var dc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), SC = (e = Ah) => (function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], s = n.reduce((f, h, p) => {
    var m, g, _;
    /[?#]/.test(h) && (r = !0);
    const y = o[p];
    let E = (r ? encodeURIComponent : e)("" + y);
    return p !== o.length && (y == null || typeof y == "object" && y.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = y.hasOwnProperty) !== null && m !== void 0 ? m : dc)) !== null && g !== void 0 ? g : dc)) === null || _ === void 0 ? void 0 : _.toString)) && (E = y + "", i.push({
      start: f.length + h.length,
      length: E.length,
      error: `Value of type ${Object.prototype.toString.call(y).slice(8, -1)} is not a valid path parameter`
    })), f + h + (p === o.length ? "" : E);
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
    throw new Le(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${s}
${h}`);
  }
  return s;
}), Ge = /* @__PURE__ */ SC(Ah), Th = class extends ca {
  create(e, t) {
    var n;
    const { api_version: o = this._client.apiVersion } = e, r = Et(e, ["api_version"]);
    if ("model" in r && "agent_config" in r) throw new Le("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in r && "generation_config" in r) throw new Le("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
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
    const r = t ?? {}, { api_version: i = this._client.apiVersion } = r, s = Et(r, ["api_version"]);
    return this._client.get(Ge`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: s }, n), { stream: (o = t?.stream) !== null && o !== void 0 ? o : !1 }));
  }
};
Th._key = Object.freeze(["interactions"]);
var Sh = class extends Th {
}, Eh = class extends ca {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: o } = e, r = Et(e, ["api_version", "webhook_id"]);
    return this._client.post(Ge`/${n}/webhooks`, Object.assign({
      query: { webhook_id: o },
      body: r
    }, t));
  }
  update(e, t, n) {
    const { api_version: o = this._client.apiVersion, update_mask: r } = t, i = Et(t, ["api_version", "update_mask"]);
    return this._client.patch(Ge`/${o}/webhooks/${e}`, Object.assign({
      query: { update_mask: r },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: o = this._client.apiVersion } = n, r = Et(n, ["api_version"]);
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
    const o = t ?? {}, { api_version: r = this._client.apiVersion } = o, i = Et(o, ["api_version"]);
    return this._client.post(Ge`/${r}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
Eh._key = Object.freeze(["webhooks"]);
var Ch = class extends Eh {
};
function EC(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var zo;
function da(e) {
  let t;
  return (zo ?? (t = new globalThis.TextEncoder(), zo = t.encode.bind(t)))(e);
}
var Yo;
function fc(e) {
  let t;
  return (Yo ?? (t = new globalThis.TextDecoder(), Yo = t.decode.bind(t)))(e);
}
var Yr = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? da(e) : e;
    this.buffer = EC([this.buffer, n]);
    const o = [];
    let r;
    for (; (r = CC(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (r.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = r.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (r.index !== this.carriageReturnIndex + 1 || r.carriage)) {
        o.push(fc(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? r.preceding - 1 : r.preceding, s = fc(this.buffer.subarray(0, i));
      o.push(s), this.buffer = this.buffer.subarray(r.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), o;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Yr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Yr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function CC(e, t) {
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
var Ir = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, hc = (e, t, n) => {
  if (e) {
    if (sC(Ir, e)) return e;
    me(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Ir))}`);
  }
};
function Kn() {
}
function Xo(e, t, n) {
  return !t || Ir[e] > Ir[n] ? Kn : t[e].bind(t);
}
var wC = {
  error: Kn,
  warn: Kn,
  info: Kn,
  debug: Kn
}, pc = /* @__PURE__ */ new WeakMap();
function me(e) {
  var t;
  const n = e.logger, o = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return wC;
  const r = pc.get(n);
  if (r && r[0] === o) return r[1];
  const i = {
    error: Xo("error", n, o),
    warn: Xo("warn", n, o),
    info: Xo("info", n, o),
    debug: Xo("debug", n, o)
  };
  return pc.set(n, [o, i]), i;
}
var Nt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), IC = class Wn {
  constructor(t, n, o) {
    this.iterator = t, this.controller = n, this.client = o;
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? me(o) : console;
    function s() {
      return Je(this, arguments, function* () {
        var c, d, f, h;
        if (r) throw new Le("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Ke(bC(t, n)), _; _ = yield q(g.next()), c = _.done, !c; m = !0) {
              h = _.value, m = !1;
              const y = h;
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
              !m && !c && (f = g.return) && (yield q(f.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (y) {
          if (as(y)) return yield q(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Wn(s, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    function i() {
      return Je(this, arguments, function* () {
        var c, d, f, h;
        const p = new Yr(), m = _h(t);
        try {
          for (var g = !0, _ = Ke(m), y; y = yield q(_.next()), c = y.done, !c; g = !0) {
            h = y.value, g = !1;
            const E = h;
            for (const C of p.decode(E)) yield yield q(C);
          }
        } catch (E) {
          d = { error: E };
        } finally {
          try {
            !g && !c && (f = _.return) && (yield q(f.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const E of p.flush()) yield yield q(E);
      });
    }
    function s() {
      return Je(this, arguments, function* () {
        var c, d, f, h;
        if (r) throw new Le("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Ke(i()), _; _ = yield q(g.next()), c = _.done, !c; m = !0) {
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
          if (as(y)) return yield q(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Wn(s, n, o);
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
    return [new Wn(() => r(t), this.controller, this.client), new Wn(() => r(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return gh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const s = da(JSON.stringify(r) + `
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
function bC(e, t) {
  return Je(this, arguments, function* () {
    var o, r, i, s;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new Le("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new Le("Attempted to iterate over a response with no body");
    const u = new PC(), c = new Yr(), d = _h(e.body);
    try {
      for (var f = !0, h = Ke(RC(d)), p; p = yield q(h.next()), o = p.done, !o; f = !0) {
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
function RC(e) {
  return Je(this, arguments, function* () {
    var n, o, r, i;
    try {
      for (var s = !0, u = Ke(e), c; c = yield q(u.next()), n = c.done, !n; s = !0) {
        i = c.value, s = !1;
        const d = i;
        d != null && (yield yield q(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? da(d) : d));
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
var PC = class {
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
    let [t, n, o] = MC(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function MC(e, t) {
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
async function xC(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, s = await (async () => {
    var u;
    if (t.options.stream)
      return me(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : IC.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return me(e).debug(`[${o}] response parsed`, Nt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
var NC = class wh extends Promise {
  constructor(t, n, o = xC) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, this.client = t;
  }
  _thenUnwrap(t) {
    return new wh(this.client, this.responsePromise, async (n, o) => t(await this.parseResponse(n, o), o));
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
}, Ih = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* kC(e) {
  if (!e) return;
  if (Ih in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : uc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = uc(o[1]) ? o[1] : [o[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [r, null]), yield [r, u]);
  }
}
var Fn = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, s] of kC(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [Ih]: !0,
    values: t,
    nulls: n
  };
}, Si = (e) => {
  var t, n, o, r, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (r = (o = globalThis.Deno.env) === null || o === void 0 ? void 0 : o.get) === null || r === void 0 ? void 0 : r.call(o, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, bh, Rh = class Ph {
  constructor(t) {
    var n, o, r, i, s, u, c, { baseURL: d = Si("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: f = (n = Si("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: h = "v1beta" } = t, p = Et(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: f,
      apiVersion: h
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (o = m.timeout) !== null && o !== void 0 ? o : Ph.DEFAULT_TIMEOUT, this.logger = (r = m.logger) !== null && r !== void 0 ? r : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (s = (i = hc(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : hc(Si("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && s !== void 0 ? s : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : cC(), this.encoder = hC, this._options = m, this.apiKey = f, this.apiVersion = h, this.clientAdapter = m.clientAdapter;
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
    const n = Fn([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return Fn([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return Fn([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return pC(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${mC}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${oC()}`;
  }
  makeStatusError(t, n, o, r) {
    return Fe.generate(t, n, o, r);
  }
  buildURL(t, n, o) {
    const r = !this.baseURLOverridden() && o || this.baseURL, i = iC(t) ? new URL(t) : new URL(r + (r.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), s = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!cc(s) || !cc(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), s), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return new NC(this, this.makeRequest(t, n, void 0));
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
    if (me(this).debug(`[${p}] sending request`, Nt({
      retryOfRequestLogID: o,
      method: u.method,
      url: f,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new cs();
    const _ = new AbortController(), y = await this.fetchWithTimeout(f, d, h, _).catch(ls), E = Date.now();
    if (y instanceof globalThis.Error) {
      const T = `retrying, ${n} attempts remaining`;
      if (!((s = u.signal) === null || s === void 0) && s.aborted) throw new cs();
      const I = as(y) || /timed? ?out/i.test(String(y) + ("cause" in y ? String(y.cause) : ""));
      if (n)
        return me(this).info(`[${p}] connection ${I ? "timed out" : "failed"} - ${T}`), me(this).debug(`[${p}] connection ${I ? "timed out" : "failed"} (${T})`, Nt({
          retryOfRequestLogID: o,
          url: f,
          durationMs: E - g,
          message: y.message
        })), this.retryRequest(u, n, o ?? p);
      throw me(this).info(`[${p}] connection ${I ? "timed out" : "failed"} - error; no more retries left`), me(this).debug(`[${p}] connection ${I ? "timed out" : "failed"} (error; no more retries left)`, Nt({
        retryOfRequestLogID: o,
        url: f,
        durationMs: E - g,
        message: y.message
      })), I ? new ah() : new zr({ cause: y });
    }
    const C = `[${p}${m}] ${d.method} ${f} ${y.ok ? "succeeded" : "failed"} with status ${y.status} in ${E - g}ms`;
    if (!y.ok) {
      const T = await this.shouldRetry(y);
      if (n && T) {
        const b = `retrying, ${n} attempts remaining`;
        return await fC(y.body), me(this).info(`${C} - ${b}`), me(this).debug(`[${p}] response error (${b})`, Nt({
          retryOfRequestLogID: o,
          url: y.url,
          status: y.status,
          headers: y.headers,
          durationMs: E - g
        })), this.retryRequest(u, n, o ?? p, y.headers);
      }
      const I = T ? "error; no more retries left" : "error; not retryable";
      me(this).info(`${C} - ${I}`);
      const L = await y.text().catch((b) => ls(b).message), w = lC(L), k = w ? void 0 : L;
      throw me(this).debug(`[${p}] response error (${I})`, Nt({
        retryOfRequestLogID: o,
        url: y.url,
        status: y.status,
        headers: y.headers,
        message: k,
        durationMs: Date.now() - g
      })), this.makeStatusError(y.status, w, k, y.headers);
    }
    return me(this).info(C), me(this).debug(`[${p}] response start`, Nt({
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
    const i = n || {}, { signal: s, method: u } = i, c = Et(i, ["signal", "method"]), d = this._makeAbort(r);
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
    return await uC(s), this.makeRequest(t, n - 1, o);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var o, r, i;
    const s = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: f } = s, h = this.buildURL(c, d, f);
    "timeout" in s && aC("timeout", s.timeout), s.timeout = (o = s.timeout) !== null && o !== void 0 ? o : this.timeout;
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
    let u = Fn([
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
    const o = Fn([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && o.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: dC(t)
    } : typeof t == "object" && o.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: o
    });
  }
};
Rh.DEFAULT_TIMEOUT = 6e4;
var re = class extends Rh {
  constructor() {
    super(...arguments), this.interactions = new Sh(this), this.webhooks = new Ch(this);
  }
};
bh = re;
re.GeminiNextGenAPIClient = bh;
re.GeminiNextGenAPIClientError = Le;
re.APIError = Fe;
re.APIConnectionError = zr;
re.APIConnectionTimeoutError = ah;
re.APIUserAbortError = cs;
re.NotFoundError = dh;
re.ConflictError = fh;
re.RateLimitError = ph;
re.BadRequestError = lh;
re.AuthenticationError = uh;
re.InternalServerError = mh;
re.PermissionDeniedError = ch;
re.UnprocessableEntityError = hh;
re.toFile = AC;
re.Interactions = Sh;
re.Webhooks = Ch;
function DC(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function $C(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function LC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function UC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function FC(e, t, n) {
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
function OC(e, t, n) {
  const o = {};
  let r = a(n, ["config", "method"]);
  if (r === void 0 && (r = "SUPERVISED_FINE_TUNING"), r === "SUPERVISED_FINE_TUNING") {
    const w = a(e, ["validationDataset"]);
    t !== void 0 && w != null && l(t, ["supervisedTuningSpec"], Ei(w));
  } else if (r === "PREFERENCE_TUNING") {
    const w = a(e, ["validationDataset"]);
    t !== void 0 && w != null && l(t, ["preferenceOptimizationSpec"], Ei(w));
  } else if (r === "DISTILLATION") {
    const w = a(e, ["validationDataset"]);
    t !== void 0 && w != null && l(t, ["distillationSpec"], Ei(w));
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
  const E = a(e, ["baseTeacherModel"]);
  t !== void 0 && E != null && l(t, ["distillationSpec", "baseTeacherModel"], E);
  const C = a(e, ["tunedTeacherModelSource"]);
  t !== void 0 && C != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], C);
  const T = a(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && T != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], T);
  const I = a(e, ["outputUri"]);
  t !== void 0 && I != null && l(t, ["outputUri"], I);
  const L = a(e, ["encryptionSpec"]);
  return t !== void 0 && L != null && l(t, ["encryptionSpec"], L), o;
}
function GC(e, t) {
  const n = {}, o = a(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = a(e, ["trainingDataset"]);
  i != null && QC(i);
  const s = a(e, ["config"]);
  return s != null && FC(s, n), n;
}
function BC(e, t) {
  const n = {}, o = a(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = a(e, ["trainingDataset"]);
  i != null && ZC(i, n, t);
  const s = a(e, ["config"]);
  return s != null && OC(s, n, t), n;
}
function qC(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function HC(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function VC(e, t, n) {
  const o = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), o;
}
function JC(e, t, n) {
  const o = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), o;
}
function KC(e, t) {
  const n = {}, o = a(e, ["config"]);
  return o != null && VC(o, n), n;
}
function WC(e, t) {
  const n = {}, o = a(e, ["config"]);
  return o != null && JC(o, n), n;
}
function zC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["tunedModels"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => Mh(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function YC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["tuningJobs"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => hs(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function XC(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["model"], o);
  const r = a(e, ["name"]);
  return r != null && l(n, ["endpoint"], r), n;
}
function QC(e, t) {
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
function ZC(e, t, n) {
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
function Mh(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["state"]);
  i != null && l(n, ["state"], Of(i));
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
  return p != null && l(n, ["tunedModel"], XC(p)), n;
}
function hs(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["state"]);
  i != null && l(n, ["state"], Of(i));
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
  const E = a(e, ["distillationSpec"]);
  E != null && l(n, ["distillationSpec"], E);
  const C = a(e, ["tuningDataStats"]);
  C != null && l(n, ["tuningDataStats"], C);
  const T = a(e, ["encryptionSpec"]);
  T != null && l(n, ["encryptionSpec"], T);
  const I = a(e, ["partnerModelTuningSpec"]);
  I != null && l(n, ["partnerModelTuningSpec"], I);
  const L = a(e, ["customBaseModel"]);
  L != null && l(n, ["customBaseModel"], L);
  const w = a(e, ["evaluateDatasetRuns"]);
  if (w != null) {
    let xe = w;
    Array.isArray(xe) && (xe = xe.map((fe) => fe)), l(n, ["evaluateDatasetRuns"], xe);
  }
  const k = a(e, ["experiment"]);
  k != null && l(n, ["experiment"], k);
  const b = a(e, ["fullFineTuningSpec"]);
  b != null && l(n, ["fullFineTuningSpec"], b);
  const x = a(e, ["labels"]);
  x != null && l(n, ["labels"], x);
  const P = a(e, ["outputUri"]);
  P != null && l(n, ["outputUri"], P);
  const F = a(e, ["pipelineJob"]);
  F != null && l(n, ["pipelineJob"], F);
  const Y = a(e, ["serviceAccount"]);
  Y != null && l(n, ["serviceAccount"], Y);
  const V = a(e, ["tunedModelDisplayName"]);
  V != null && l(n, ["tunedModelDisplayName"], V);
  const W = a(e, ["tuningJobState"]);
  W != null && l(n, ["tuningJobState"], W);
  const K = a(e, ["veoTuningSpec"]);
  K != null && l(n, ["veoTuningSpec"], K);
  const _e = a(e, ["distillationSamplingSpec"]);
  _e != null && l(n, ["distillationSamplingSpec"], _e);
  const ze = a(e, ["tuningJobMetadata"]);
  return ze != null && l(n, ["tuningJobMetadata"], ze), n;
}
function jC(e, t) {
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
function Ei(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["validationDatasetUri"], o);
  const r = a(e, ["vertexDatasetResource"]);
  return r != null && l(n, ["validationDatasetUri"], r), n;
}
var ew = class extends ft {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ht(dt.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: ji.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = HC(e);
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
      })), i.then((d) => hs(d));
    } else {
      const c = qC(e);
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
      })), i.then((d) => Mh(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = WC(e);
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
        const f = YC(d), h = new Ou();
        return Object.assign(h, f), h;
      });
    } else {
      const c = KC(e);
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
        const f = zC(d), h = new Ou();
        return Object.assign(h, f), h;
      });
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $C(e);
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
        const f = UC(d), h = new Gu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = DC(e);
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
        const f = LC(d), h = new Gu();
        return Object.assign(h, f), h;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = BC(e, e);
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
      })), o.then((u) => hs(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = GC(e);
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
      })), o.then((u) => jC(u));
    }
  }
}, tw = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, nw = 1024 * 1024 * 8, ow = 3, rw = 1e3, iw = 2, br = "x-goog-upload-status";
async function sw(e, t, n, o) {
  var r;
  const i = await xh(e, t, n, o), s = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[br]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return s.file;
}
async function aw(e, t, n, o) {
  var r;
  const i = await xh(e, t, n, o), s = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[br]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = Mf(s), c = new Ty();
  return Object.assign(c, u), c;
}
async function xh(e, t, n, o) {
  var r, i, s;
  let u = t;
  const c = o?.baseUrl || ((r = n.clientOptions.httpOptions) === null || r === void 0 ? void 0 : r.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, f = 0, h = new ts(new Response()), p = "upload";
  for (d = e.size; f < d; ) {
    const m = Math.min(nw, d - f), g = e.slice(f, f + m);
    f + m >= d && (p += ", finalize");
    let _ = 0, y = rw;
    for (; _ < ow; ) {
      const E = Object.assign(Object.assign({}, o?.headers || {}), {
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
          headers: E
        })
      }), !((i = h?.headers) === null || i === void 0) && i[br]) break;
      _++, await uw(y), y = y * iw;
    }
    if (f += m, ((s = h?.headers) === null || s === void 0 ? void 0 : s[br]) !== "active") break;
    if (d <= f) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return h;
}
async function lw(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function uw(e) {
  return new Promise((t) => setTimeout(t, e));
}
var cw = class {
  async upload(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await sw(e, t, n, o);
  }
  async uploadToFileSearchStore(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await aw(e, t, n, o);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await lw(e);
  }
}, dw = class {
  create(e, t, n) {
    return new fw(e, t, n);
  }
}, fw = class {
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
}, mc = "x-goog-api-key", hw = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(mc) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(mc, this.apiKey);
    }
  }
}, pw = class {
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
    const n = V_(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const o = new hw(this.apiKey);
    this.apiClient = new uE({
      auth: o,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new cw(),
      downloader: new tw()
    }), this.models = new PE(this.apiClient), this.live = new EE(this.apiClient, o, new dw()), this.batches = new Cv(this.apiClient), this.chats = new lA(this.models, this.apiClient), this.caches = new iA(this.apiClient), this.files = new AA(this.apiClient), this.operations = new ME(this.apiClient), this.authTokens = new zE(this.apiClient), this.tunings = new ew(this.apiClient), this.fileSearchStores = new nC(this.apiClient);
  }
};
function gc(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Rr(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Ut(e) {
  return { text: String(e || "") };
}
function mw(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function gw(e) {
  if (typeof e == "string") return [Ut(e)];
  if (!Array.isArray(e)) return [Ut("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? Ut(n.text || "") : n.type === "image_url" && n.image_url?.url ? mw(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [Ut("")];
}
function _c() {
  return {
    role: "user",
    parts: [Ut("")]
  };
}
function Co(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = Rr(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function _w(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function yw(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function yc(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const o = String(e.functionCall.id || "").trim();
  return o ? `id:${o}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function vw(e, t) {
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
function Aw(e = [], t = "") {
  const n = e.map((f) => Co(f, "model")).filter(Boolean);
  if (!n.length) return null;
  const o = [...n].reverse().find((f) => _w(f)) || null, r = [...n].reverse().find((f) => yw(f)) || null, i = o || r || n[n.length - 1], s = n.indexOf(i), u = Rr(i);
  if (!u?.parts?.length) return n[n.length - 1];
  if (r) {
    const f = /* @__PURE__ */ new Map(), h = [];
    n.forEach((m, g) => {
      m.parts.forEach((_, y) => {
        const E = yc(_, y, g);
        if (!E) return;
        f.has(E) || h.push(E);
        const C = f.get(E);
        C ? f.set(E, vw(C, _)) : f.set(E, Rr(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((m, g) => {
      const _ = yc(m, g, s);
      return _ ? (p.add(_), f.get(_) || m) : m;
    }), h.forEach((m) => {
      p.has(m) || (u.parts.push(f.get(m)), p.add(m));
    });
  }
  const c = String(t || ""), d = u.parts.filter((f) => !(typeof f?.text == "string" && !f?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function vc(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((o) => !o?.thought && typeof o?.text == "string" && o.text).map((o) => o.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function Nh(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((o) => o?.functionCall || o).filter((o) => o && o.name);
  return t.length ? t : n;
}
function kh(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function Ac(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function Tw(e, t) {
  const n = Ac(e), o = Ac(t);
  return n && o ? JSON.stringify({
    ...n,
    ...o
  }) : String(t || "").trim() || String(e || "{}");
}
function Sw(e, t = "google-tool") {
  return Nh(e).map((n, o) => {
    const r = String(n.id || "").trim();
    return {
      id: r || `${t}-${o + 1}`,
      name: n.name || "",
      arguments: kh(n),
      ...r ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function Ew(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let o = 0;
  function r(s, u, c, d) {
    return s.name = String(u.name || s.name || "").trim(), s.arguments = Tw(s.arguments, d), c && (n.set(c, s), s.id !== c ? s.providerId = c : delete s.providerId), s;
  }
  function i(s) {
    return Nh(s).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), f = kh(u);
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
function Cw(e = []) {
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
function ww(e) {
  switch (e) {
    case "minimal":
      return on.MINIMAL;
    case "high":
      return on.HIGH;
    case "medium":
      return on.MEDIUM;
    default:
      return on.LOW;
  }
}
function Tc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function Iw(e) {
  const t = [String(e.systemPrompt || "").trim(), ...et(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function bw(e) {
  const t = e?.providerPayload?.googleContent;
  return Co(t, "model");
}
function Rw(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = bw(e);
    return n ? [n] : [];
  }
  return t.map((n) => Co(n, "model")).filter(Boolean);
}
function fa(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => Co(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function Pw(e) {
  const t = e?.candidates?.[0]?.content;
  return fa(t ? [t] : []);
}
function Mw(e) {
  return fa(e ? [e] : []);
}
function Dh(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? Rr(e.history) || [] : [];
}
function xw(e, t = 0) {
  return Dh(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => Co(n, "model")).filter(Boolean);
}
function Nw(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = [], r = et(e || []).filter((s) => s.role === "user" || s.role === "assistant" || s.role === "tool");
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
          response: gc(f.content)
        } }), d += 1;
      }
      o.push({
        role: "user",
        parts: c
      }), s = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = Rw(u);
      if (c.length) {
        o.push(...c);
        continue;
      }
    }
    if (u.role === "assistant" && Array.isArray(u.tool_calls) && u.tool_calls.length) {
      o.push({
        role: "model",
        parts: [...u.content ? [Ut(u.content)] : [], ...u.tool_calls.map((c) => ({ functionCall: {
          ...(() => {
            const d = Object.prototype.hasOwnProperty.call(c, "providerToolCallId") ? String(c.providerToolCallId || "").trim() : String(c.id || "").trim();
            return d ? { id: d } : {};
          })(),
          name: c.function.name,
          args: gc(c.function.arguments)
        } }))]
      });
      continue;
    }
    o.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: gw(u.content)
    });
  }
  if (!o.length) return {
    history: [],
    latestMessage: _c().parts
  };
  const i = o[o.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: o.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: o,
    latestMessage: _c().parts
  };
}
function kw(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Sc(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var Dw = class {
  constructor(e) {
    this.config = e, this.auth = Br("google", e.apiKey), this.supportsSessionToolLoop = !0, this.activeChat = null, this.sessionReasoning = null, this.toolCallResponseSequence = 0, this.client = new pw({
      ...this.auth.sdkOptions,
      httpOptions: {
        headers: this.auth.headers,
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e, t = j("google", this.config, e.reasoning)) {
    const n = t, o = Nw(e.messages), r = Array.isArray(e.tools) ? e.tools : [], i = Iw(e), s = {
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
      thinkingLevel: ww(n.effort)
    } : z(n) && (s.thinkingConfig = { includeThoughts: !0 }), r.length && (s.tools = [{ functionDeclarations: r.map((u) => ({
      name: u.function.name,
      description: u.function.description,
      parameters: u.function.parameters
    })) }]), r.length) {
      const u = String(e.toolChoice || "auto").trim();
      s.toolConfig = { functionCallingConfig: u === "none" ? { mode: nn.NONE } : u === "auto" ? { mode: nn.AUTO } : u === "required" ? { mode: nn.ANY } : {
        mode: nn.ANY,
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
    return ho({
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
      effectiveConfig: wt(e, {
        reasoning: n,
        effort: o.createPayload.config?.thinkingConfig?.thinkingLevel,
        budgetTokens: o.createPayload.config?.thinkingConfig?.thinkingBudget,
        controlFields: o.createPayload.config?.thinkingConfig ? { thinkingConfig: o.createPayload.config.thinkingConfig } : {}
      })
    });
  }
  inspectSendRequest(e, t, n) {
    const o = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return ho({
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
      effectiveConfig: wt(t, {
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
    const c = `google-tool-${++this.toolCallResponseSequence}`, d = Ew(c);
    let f = null;
    const h = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, p = {
      ...t,
      ...h ? { config: h } : {}
    }, m = typeof n.onStreamProgress == "function";
    let g;
    const _ = Dh(e).length;
    if (m) {
      const C = await e.sendMessageStream(p), T = /* @__PURE__ */ new Map();
      let I = "", L = null;
      const w = [];
      for await (const k of C) {
        L = k, k?.candidates?.[0]?.finishReason && (g = k.candidates[0].finishReason);
        const b = k?.candidates?.[0]?.content;
        b?.parts?.length && w.push(b), z(o) && Tc(k).forEach((P, F) => {
          const Y = `${P.label}:${F}`;
          T.set(Y, Sc(T.get(Y) || "", P.text));
        }), u = d.append(k);
        const x = vc(k);
        I = Sc(I, x), kw(n, {
          text: I,
          thoughts: Array.from(T.values()).filter(Boolean).map((P, F) => ({
            label: `思考块 ${F + 1}`,
            text: P
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
      }, f = Aw(w, I) || r?.candidates?.[0]?.content || null, i = Array.from(T.values()).filter(Boolean).map((k, b) => ({
        label: `思考块 ${b + 1}`,
        text: k
      })), s = I;
    } else
      r = await e.sendMessage(p), g = r?.candidates?.[0]?.finishReason, i = z(o) ? Tc(r) : [], s = vc(r);
    const y = m ? u : Sw(r, c), E = xw(e, _);
    return {
      text: s,
      toolCalls: y,
      thoughts: i,
      finishReason: lt("google", g, !1, s),
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: fa(E) || Mw(f) || Pw(r)
    };
  }
  async sendTracked(e, t, n, o) {
    try {
      return {
        ...await this.sendThroughChat(this.activeChat, e, t, n),
        requestInspection: o
      };
    } catch (r) {
      throw ra(r, o);
    }
  }
  async chat(e) {
    const t = j("google", this.config, e.reasoning), n = (Array.isArray(e.toolResponses) && e.toolResponses.length || String(e.finalAnswerReminderText || "").trim()) && this.sessionReasoning ? this.sessionReasoning : t;
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const i = { message: Cw(e.toolResponses) };
      return this.sendTracked(i, e, n, this.inspectSendRequest(i, e, n));
    }
    const o = String(e.finalAnswerReminderText || "").trim();
    if (o) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const i = { message: [Ut(o)] };
      return this.sendTracked(i, e, n, this.inspectSendRequest(i, e, n));
    }
    const r = this.createChat(e, n);
    return this.activeChat = r.chat, this.sessionConfig = r.sessionConfig, this.sessionReasoning = n, this.sendTracked(r.sendPayload, e, n, r.requestInspection);
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
var $h = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return $h = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function ps(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ms = (e) => {
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
}, de = class gs extends O {
  constructor(t, n, o, r) {
    super(`${gs.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new Xr({
      message: o,
      cause: ms(n)
    });
    const i = n?.error;
    return t === 400 ? new Lh(t, i, o, r) : t === 401 ? new Uh(t, i, o, r) : t === 403 ? new Fh(t, i, o, r) : t === 404 ? new Oh(t, i, o, r) : t === 409 ? new Gh(t, i, o, r) : t === 422 ? new Bh(t, i, o, r) : t === 429 ? new qh(t, i, o, r) : t >= 500 ? new Hh(t, i, o, r) : new gs(t, i, o, r);
  }
}, $e = class extends de {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Xr = class extends de {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, ha = class extends Xr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Lh = class extends de {
}, Uh = class extends de {
}, Fh = class extends de {
}, Oh = class extends de {
}, Gh = class extends de {
}, Bh = class extends de {
}, qh = class extends de {
}, Hh = class extends de {
}, Vh = class extends O {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, Jh = class extends O {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, zn = class extends Error {
  constructor(e) {
    super(e);
  }
}, Kh = class extends de {
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
}, $w = class extends O {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, Lw = /^[a-z][a-z0-9+.-]*:/i, Uw = (e) => Lw.test(e), ve = (e) => (ve = Array.isArray, ve(e)), Ec = ve;
function pa(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Cc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Fw(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function Ci(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var Ow = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new O(`${e} must be an integer`);
  if (t < 0) throw new O(`${e} must be a positive integer`);
  return t;
}, Gw = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, wo = (e) => new Promise((t) => setTimeout(t, e)), Zt = "6.44.0", Bw = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function qw() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var Hw = () => {
  const e = qw();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Zt,
    "X-Stainless-OS": Ic(Deno.build.os),
    "X-Stainless-Arch": wc(Deno.build.arch),
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
    "X-Stainless-OS": Ic(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": wc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = Vw();
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
function Vw() {
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
var wc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Ic = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), bc, Jw = () => bc ?? (bc = Hw());
function Wh() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function zh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Yh(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return zh({
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
function Xh(e) {
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
async function Rc(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Kw = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Qh = "RFC3986", Zh = (e) => String(e), Pc = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Zh
};
var _s = (e, t) => (_s = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), _s(e, t)), Ye = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), wi = 1024, Ww = (e, t, n, o, r) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let s = "";
  for (let u = 0; u < i.length; u += wi) {
    const c = i.length >= wi ? i.slice(u, u + wi) : i, d = [];
    for (let f = 0; f < c.length; ++f) {
      let h = c.charCodeAt(f);
      if (h === 45 || h === 46 || h === 95 || h === 126 || h >= 48 && h <= 57 || h >= 65 && h <= 90 || h >= 97 && h <= 122 || r === "RFC1738" && (h === 40 || h === 41)) {
        d[d.length] = c.charAt(f);
        continue;
      }
      if (h < 128) {
        d[d.length] = Ye[h];
        continue;
      }
      if (h < 2048) {
        d[d.length] = Ye[192 | h >> 6] + Ye[128 | h & 63];
        continue;
      }
      if (h < 55296 || h >= 57344) {
        d[d.length] = Ye[224 | h >> 12] + Ye[128 | h >> 6 & 63] + Ye[128 | h & 63];
        continue;
      }
      f += 1, h = 65536 + ((h & 1023) << 10 | c.charCodeAt(f) & 1023), d[d.length] = Ye[240 | h >> 18] + Ye[128 | h >> 12 & 63] + Ye[128 | h >> 6 & 63] + Ye[128 | h & 63];
    }
    s += d.join("");
  }
  return s;
};
function zw(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function Mc(e, t) {
  if (ve(e)) {
    const n = [];
    for (let o = 0; o < e.length; o += 1) n.push(t(e[o]));
    return n;
  }
  return t(e);
}
var jh = {
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
}, ep = function(e, t) {
  Array.prototype.push.apply(e, ve(t) ? t : [t]);
}, xc, oe = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: Ww,
  encodeValuesOnly: !1,
  format: Qh,
  formatter: Zh,
  indices: !1,
  serializeDate(e) {
    return (xc ?? (xc = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function Yw(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var Ii = {};
function tp(e, t, n, o, r, i, s, u, c, d, f, h, p, m, g, _, y, E) {
  let C = e, T = E, I = 0, L = !1;
  for (; (T = T.get(Ii)) !== void 0 && !L; ) {
    const P = T.get(e);
    if (I += 1, typeof P < "u") {
      if (P === I) throw new RangeError("Cyclic object value");
      L = !0;
    }
    typeof T.get(Ii) > "u" && (I = 0);
  }
  if (typeof d == "function" ? C = d(t, C) : C instanceof Date ? C = p?.(C) : n === "comma" && ve(C) && (C = Mc(C, function(P) {
    return P instanceof Date ? p?.(P) : P;
  })), C === null) {
    if (i) return c && !_ ? c(t, oe.encoder, y, "key", m) : t;
    C = "";
  }
  if (Yw(C) || zw(C)) {
    if (c) {
      const P = _ ? t : c(t, oe.encoder, y, "key", m);
      return [g?.(P) + "=" + g?.(c(C, oe.encoder, y, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(C))];
  }
  const w = [];
  if (typeof C > "u") return w;
  let k;
  if (n === "comma" && ve(C))
    _ && c && (C = Mc(C, c)), k = [{ value: C.length > 0 ? C.join(",") || null : void 0 }];
  else if (ve(d)) k = d;
  else {
    const P = Object.keys(C);
    k = f ? P.sort(f) : P;
  }
  const b = u ? String(t).replace(/\./g, "%2E") : String(t), x = o && ve(C) && C.length === 1 ? b + "[]" : b;
  if (r && ve(C) && C.length === 0) return x + "[]";
  for (let P = 0; P < k.length; ++P) {
    const F = k[P], Y = typeof F == "object" && typeof F.value < "u" ? F.value : C[F];
    if (s && Y === null) continue;
    const V = h && u ? F.replace(/\./g, "%2E") : F, W = ve(C) ? typeof n == "function" ? n(x, V) : x : x + (h ? "." + V : "[" + V + "]");
    E.set(e, I);
    const K = /* @__PURE__ */ new WeakMap();
    K.set(Ii, E), ep(w, tp(Y, W, n, o, r, i, s, u, n === "comma" && _ && ve(C) ? null : c, d, f, h, p, m, g, _, y, K));
  }
  return w;
}
function Xw(e = oe) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || oe.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Qh;
  if (typeof e.format < "u") {
    if (!_s(Pc, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const o = Pc[n];
  let r = oe.filter;
  (typeof e.filter == "function" || ve(e.filter)) && (r = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in jh ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = oe.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
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
function Qw(e, t = {}) {
  let n = e;
  const o = Xw(t);
  let r, i;
  typeof o.filter == "function" ? (i = o.filter, n = i("", n)) : ve(o.filter) && (i = o.filter, r = i);
  const s = [];
  if (typeof n != "object" || n === null) return "";
  const u = jh[o.arrayFormat], c = u === "comma" && o.commaRoundTrip;
  r || (r = Object.keys(n)), o.sort && r.sort(o.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < r.length; ++p) {
    const m = r[p];
    o.skipNulls && n[m] === null || ep(s, tp(n[m], m, u, c, o.allowEmptyArrays, o.strictNullHandling, o.skipNulls, o.encodeDotInKeys, o.encode ? o.encoder : null, o.filter, o.sort, o.allowDots, o.serializeDate, o.format, o.formatter, o.encodeValuesOnly, o.charset, d));
  }
  const f = s.join(o.delimiter);
  let h = o.addQueryPrefix === !0 ? "?" : "";
  return o.charsetSentinel && (o.charset === "iso-8859-1" ? h += "utf8=%26%2310003%3B&" : h += "utf8=%E2%9C%93&"), f.length > 0 ? h + f : "";
}
function Zw(e) {
  return Qw(e, { arrayFormat: "brackets" });
}
function jw(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Nc;
function ma(e) {
  let t;
  return (Nc ?? (t = new globalThis.TextEncoder(), Nc = t.encode.bind(t)))(e);
}
var kc;
function Dc(e) {
  let t;
  return (kc ?? (t = new globalThis.TextDecoder(), kc = t.decode.bind(t)))(e);
}
var we, Ie, Qr = class {
  constructor() {
    we.set(this, void 0), Ie.set(this, void 0), G(this, we, new Uint8Array(), "f"), G(this, Ie, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ma(e) : e;
    G(this, we, jw([S(this, we, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = eI(S(this, we, "f"), S(this, Ie, "f"))) != null; ) {
      if (o.carriage && S(this, Ie, "f") == null) {
        G(this, Ie, o.index, "f");
        continue;
      }
      if (S(this, Ie, "f") != null && (o.index !== S(this, Ie, "f") + 1 || o.carriage)) {
        n.push(Dc(S(this, we, "f").subarray(0, S(this, Ie, "f") - 1))), G(this, we, S(this, we, "f").subarray(S(this, Ie, "f")), "f"), G(this, Ie, null, "f");
        continue;
      }
      const r = S(this, Ie, "f") !== null ? o.preceding - 1 : o.preceding, i = Dc(S(this, we, "f").subarray(0, r));
      n.push(i), G(this, we, S(this, we, "f").subarray(o.index), "f"), G(this, Ie, null, "f");
    }
    return n;
  }
  flush() {
    return S(this, we, "f").length ? this.decode(`
`) : [];
  }
};
we = /* @__PURE__ */ new WeakMap(), Ie = /* @__PURE__ */ new WeakMap();
Qr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Qr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function eI(e, t) {
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
function tI(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var Pr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, $c = (e, t, n) => {
  if (e) {
    if (Fw(Pr, e)) return e;
    ae(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Pr))}`);
  }
};
function Yn() {
}
function Qo(e, t, n) {
  return !t || Pr[e] > Pr[n] ? Yn : t[e].bind(t);
}
var nI = {
  error: Yn,
  warn: Yn,
  info: Yn,
  debug: Yn
}, Lc = /* @__PURE__ */ new WeakMap();
function ae(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return nI;
  const o = Lc.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: Qo("error", t, n),
    warn: Qo("warn", t, n),
    info: Qo("info", t, n),
    debug: Qo("debug", t, n)
  };
  return Lc.set(t, [n, r]), r;
}
var kt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), On, po = class Xn {
  constructor(t, n, o) {
    this.iterator = t, On.set(this, void 0), this.controller = n, G(this, On, o, "f");
  }
  static fromSSEResponse(t, n, o, r) {
    let i = !1;
    const s = o ? ae(o) : console;
    async function* u() {
      if (i) throw new O("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of oI(t, n))
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
        if (ps(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Xn(u, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    async function* i() {
      const u = new Qr(), c = Xh(t);
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
        if (ps(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Xn(s, n, o);
  }
  [(On = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Xn(() => r(t), this.controller, S(this, On, "f")), new Xn(() => r(n), this.controller, S(this, On, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return zh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const s = ma(JSON.stringify(r) + `
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
async function* oI(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new O("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new O("Attempted to iterate over a response with no body");
  const n = new iI(), o = new Qr(), r = Xh(e.body);
  for await (const i of rI(r)) for (const s of o.decode(i)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const s = n.decode(i);
    s && (yield s);
  }
}
async function* rI(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? ma(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = tI(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var iI = class {
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
    let [t, n, o] = sI(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function sI(e, t) {
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
async function np(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, s = await (async () => {
    if (t.options.stream)
      return ae(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : po.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : op(await n.json(), n) : await n.text();
  })();
  return ae(e).debug(`[${o}] response parsed`, kt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
function op(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Qn, rp = class ip extends Promise {
  constructor(t, n, o = np) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, Qn.set(this, void 0), G(this, Qn, t, "f");
  }
  _thenUnwrap(t) {
    return new ip(S(this, Qn, "f"), this.responsePromise, async (n, o) => op(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(S(this, Qn, "f"), t))), this.parsedPromise;
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
Qn = /* @__PURE__ */ new WeakMap();
var Zo, Zr = class {
  constructor(e, t, n, o) {
    Zo.set(this, void 0), G(this, Zo, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new O("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await S(this, Zo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Zo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, aI = class extends rp {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await np(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, It = class extends Zr {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, Q = class extends Zr {
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
        ...pa(this.options.query),
        after: t
      }
    } : null;
  }
}, ce = class extends Zr {
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
        ...pa(this.options.query),
        after: e
      }
    } : null;
  }
}, pt = class extends Zr {
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
        ...pa(this.options.query),
        after: e
      }
    } : null;
  }
}, lI = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, uI = "urn:ietf:params:oauth:grant-type:token-exchange", cI = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? Wh();
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
      grant_type: uI,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: lI[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new Kh(t.status, s, t.headers) : de.generate(t.status, s, `Token exchange failed with status ${t.status}`, t.headers);
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
}, sp = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function io(e, t, n) {
  return sp(), new File(e, t ?? "unknown_file", n);
}
function cr(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var ga = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", jr = async (e, t) => ys(e.body) ? {
  ...e,
  body: await ap(e.body, t)
} : e, Ze = async (e, t) => ({
  ...e,
  body: await ap(e.body, t)
}), Uc = /* @__PURE__ */ new WeakMap();
function dI(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Uc.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return Uc.set(t, o), o;
}
var ap = async (e, t) => {
  if (!await dI(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, r]) => vs(n, o, r))), n;
}, lp = (e) => e instanceof Blob && "name" in e, fI = (e) => typeof e == "object" && e !== null && (e instanceof Response || ga(e) || lp(e)), ys = (e) => {
  if (fI(e)) return !0;
  if (Array.isArray(e)) return e.some(ys);
  if (e && typeof e == "object") {
    for (const t in e) if (ys(e[t])) return !0;
  }
  return !1;
}, vs = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, io([await n.blob()], cr(n)));
    else if (ga(n)) e.append(t, io([await new Response(Yh(n)).blob()], cr(n)));
    else if (lp(n)) e.append(t, n, cr(n));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => vs(e, t + "[]", o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, r]) => vs(e, `${t}[${o}]`, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, up = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", hI = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && up(e), pI = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function mI(e, t, n) {
  if (sp(), e = await e, hI(e))
    return e instanceof File ? e : io([await e.arrayBuffer()], e.name);
  if (pI(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), io(await As(r), t, n);
  }
  const o = await As(e);
  if (t || (t = cr(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return io(o, t, n);
}
async function As(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (up(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (ga(e)) for await (const n of e) t.push(...await As(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${gI(e)}`);
  }
  return t;
}
function gI(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var M = class {
  constructor(e) {
    this._client = e;
  }
};
function cp(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Fc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), _I = (e = cp) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], s = n.reduce((f, h, p) => {
    /[?#]/.test(h) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Fc) ?? Fc)?.toString) && (g = m + "", i.push({
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
}, v = /* @__PURE__ */ _I(cp), dp = class extends M {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/chat/completions/${e}/messages`, Q, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function Mr(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function _a(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function Io(e) {
  return e?.$brand === "auto-parseable-tool";
}
function yI(e, t) {
  return !t || !fp(t) ? {
    ...e,
    choices: e.choices.map((n) => (hp(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : ya(e, t);
}
function ya(e, t) {
  const n = e.choices.map((o) => {
    if (o.finish_reason === "length") throw new Vh();
    if (o.finish_reason === "content_filter") throw new Jh();
    return hp(o.message.tool_calls), {
      ...o,
      message: {
        ...o.message,
        ...o.message.tool_calls ? { tool_calls: o.message.tool_calls?.map((r) => AI(t, r)) ?? void 0 } : void 0,
        parsed: o.message.content && !o.message.refusal ? vI(t, o.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function vI(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function AI(e, t) {
  const n = e.tools?.find((o) => Mr(o) && o.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: Io(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function TI(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((o) => Mr(o) && o.function?.name === t.function.name);
  return Mr(n) && (Io(n) || n?.function.strict || !1);
}
function fp(e) {
  return _a(e.response_format) ? !0 : e.tools?.some((t) => Io(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function hp(e) {
  for (const t of e || []) if (t.type !== "function") throw new O(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function SI(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new O(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new O(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var xr = (e) => e?.role === "assistant", pp = (e) => e?.role === "tool", Ts, dr, fr, Zn, jn, hr, eo, rt, to, Nr, kr, jt, mp, va = class {
  constructor() {
    Ts.add(this), this.controller = new AbortController(), dr.set(this, void 0), fr.set(this, () => {
    }), Zn.set(this, () => {
    }), jn.set(this, void 0), hr.set(this, () => {
    }), eo.set(this, () => {
    }), rt.set(this, {}), to.set(this, !1), Nr.set(this, !1), kr.set(this, !1), jt.set(this, !1), G(this, dr, new Promise((e, t) => {
      G(this, fr, e, "f"), G(this, Zn, t, "f");
    }), "f"), G(this, jn, new Promise((e, t) => {
      G(this, hr, e, "f"), G(this, eo, t, "f");
    }), "f"), S(this, dr, "f").catch(() => {
    }), S(this, jn, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, S(this, Ts, "m", mp).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (S(this, fr, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return S(this, to, "f");
  }
  get errored() {
    return S(this, Nr, "f");
  }
  get aborted() {
    return S(this, kr, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (S(this, rt, "f")[e] || (S(this, rt, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = S(this, rt, "f")[e];
    if (!n) return this;
    const o = n.findIndex((r) => r.listener === t);
    return o >= 0 && n.splice(o, 1), this;
  }
  once(e, t) {
    return (S(this, rt, "f")[e] || (S(this, rt, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      G(this, jt, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    G(this, jt, !0, "f"), await S(this, jn, "f");
  }
  _emit(e, ...t) {
    if (S(this, to, "f")) return;
    e === "end" && (G(this, to, !0, "f"), S(this, hr, "f").call(this));
    const n = S(this, rt, "f")[e];
    if (n && (S(this, rt, "f")[e] = n.filter((o) => !o.once), n.forEach(({ listener: o }) => o(...t))), e === "abort") {
      const o = t[0];
      !S(this, jt, "f") && !n?.length && Promise.reject(o), S(this, Zn, "f").call(this, o), S(this, eo, "f").call(this, o), this._emit("end");
      return;
    }
    if (e === "error") {
      const o = t[0];
      !S(this, jt, "f") && !n?.length && Promise.reject(o), S(this, Zn, "f").call(this, o), S(this, eo, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
dr = /* @__PURE__ */ new WeakMap(), fr = /* @__PURE__ */ new WeakMap(), Zn = /* @__PURE__ */ new WeakMap(), jn = /* @__PURE__ */ new WeakMap(), hr = /* @__PURE__ */ new WeakMap(), eo = /* @__PURE__ */ new WeakMap(), rt = /* @__PURE__ */ new WeakMap(), to = /* @__PURE__ */ new WeakMap(), Nr = /* @__PURE__ */ new WeakMap(), kr = /* @__PURE__ */ new WeakMap(), jt = /* @__PURE__ */ new WeakMap(), Ts = /* @__PURE__ */ new WeakSet(), mp = function(t) {
  if (G(this, Nr, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new $e()), t instanceof $e)
    return G(this, kr, !0, "f"), this._emit("abort", t);
  if (t instanceof O) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new O(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new O(String(t)));
};
function EI(e) {
  return typeof e.parse == "function";
}
var he, Ss, Dr, Es, Cs, ws, gp, _p, CI = 10, yp = class extends va {
  constructor() {
    super(...arguments), he.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), pp(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (xr(e) && e.tool_calls)
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
    return await this.done(), S(this, he, "m", Ss).call(this);
  }
  async finalMessage() {
    return await this.done(), S(this, he, "m", Dr).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), S(this, he, "m", Es).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), S(this, he, "m", Cs).call(this);
  }
  async totalUsage() {
    return await this.done(), S(this, he, "m", ws).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = S(this, he, "m", Dr).call(this);
    t && this._emit("finalMessage", t);
    const n = S(this, he, "m", Ss).call(this);
    n && this._emit("finalContent", n);
    const o = S(this, he, "m", Es).call(this);
    o && this._emit("finalFunctionToolCall", o);
    const r = S(this, he, "m", Cs).call(this);
    r != null && this._emit("finalFunctionToolCallResult", r), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", S(this, he, "m", ws).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), S(this, he, "m", gp).call(this, t);
    const r = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(ya(r, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const o of t.messages) this._addMessage(o, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const o = "tool", { tool_choice: r = "auto", stream: i, ...s } = t, u = typeof r != "string" && r.type === "function" && r?.function?.name, { maxChatCompletions: c = CI } = n || {}, d = t.tools.map((p) => {
      if (Io(p)) {
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
        const _ = g.id, { name: y, arguments: E } = g.function, C = f[y];
        if (C) {
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
          const w = `Invalid tool_call: ${JSON.stringify(y)}. Available options are: ${Object.keys(f).map((k) => JSON.stringify(k)).join(", ")}. Please try again`;
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: w
          });
          continue;
        }
        let T;
        try {
          T = EI(C) ? await C.parse(E) : E;
        } catch (w) {
          const k = w instanceof Error ? w.message : String(w);
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: k
          });
          continue;
        }
        const I = await C.function(T, this), L = S(this, he, "m", _p).call(this, I);
        if (this._addMessage({
          role: o,
          tool_call_id: _,
          content: L
        }), u) return;
      }
    }
  }
};
he = /* @__PURE__ */ new WeakSet(), Ss = function() {
  return S(this, he, "m", Dr).call(this).content ?? null;
}, Dr = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (xr(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new O("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Es = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (xr(n) && n?.tool_calls?.length) for (let o = n.tool_calls.length - 1; o >= 0; o--) {
      const r = n.tool_calls[o];
      if (r?.type === "function") return r.function;
    }
  }
}, Cs = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (pp(n) && n.content != null && typeof n.content == "string" && this.messages.some((o) => o.role === "assistant" && o.tool_calls?.some((r) => r.type === "function" && r.id === n.tool_call_id))) return n.content;
  }
}, ws = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, gp = function(t) {
  if (t.n != null && t.n > 1) throw new O("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, _p = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var wI = class vp extends yp {
  static runTools(t, n, o) {
    const r = new vp(), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), xr(t) && t.content && this._emit("content", t.content);
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
}, II = class extends Error {
}, bI = class extends Error {
};
function RI(e, t = ie.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return PI(e.trim(), t);
}
var PI = (e, t) => {
  const n = e.length;
  let o = 0;
  const r = (p) => {
    throw new II(`${p} at position ${o}`);
  }, i = (p) => {
    throw new bI(`${p} at position ${o}`);
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
}, Oc = (e) => RI(e, ie.ALL ^ ie.NUM), te, ot, zt, yt, bi, jo, Ri, Pi, Mi, er, xi, Gc, Ap = class Is extends yp {
  constructor(t) {
    super(), te.add(this), ot.set(this, void 0), zt.set(this, void 0), yt.set(this, void 0), G(this, ot, t, "f"), G(this, zt, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return S(this, yt, "f");
  }
  static fromReadableStream(t) {
    const n = new Is(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, o) {
    const r = new Is(n);
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
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), S(this, te, "m", bi).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const s of i) S(this, te, "m", Ri).call(this, s);
    if (i.controller.signal?.aborted) throw new $e();
    return this._addChatCompletion(S(this, te, "m", er).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), S(this, te, "m", bi).call(this), this._connected();
    const r = po.fromReadableStream(t, this.controller);
    let i;
    for await (const s of r)
      i && i !== s.id && this._addChatCompletion(S(this, te, "m", er).call(this)), S(this, te, "m", Ri).call(this, s), i = s.id;
    if (r.controller.signal?.aborted) throw new $e();
    return this._addChatCompletion(S(this, te, "m", er).call(this));
  }
  [(ot = /* @__PURE__ */ new WeakMap(), zt = /* @__PURE__ */ new WeakMap(), yt = /* @__PURE__ */ new WeakMap(), te = /* @__PURE__ */ new WeakSet(), bi = function() {
    this.ended || G(this, yt, void 0, "f");
  }, jo = function(n) {
    let o = S(this, zt, "f")[n.index];
    return o || (o = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, S(this, zt, "f")[n.index] = o, o);
  }, Ri = function(n) {
    if (this.ended) return;
    const o = S(this, te, "m", Gc).call(this, n);
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
      const s = S(this, te, "m", jo).call(this, i);
      i.finish_reason && (S(this, te, "m", Mi).call(this, i), s.current_tool_call_index != null && S(this, te, "m", Pi).call(this, i, s.current_tool_call_index));
      for (const u of r.delta.tool_calls ?? [])
        s.current_tool_call_index !== u.index && (S(this, te, "m", Mi).call(this, i), s.current_tool_call_index != null && S(this, te, "m", Pi).call(this, i, s.current_tool_call_index)), s.current_tool_call_index = u.index;
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
  }, Pi = function(n, o) {
    if (S(this, te, "m", jo).call(this, n).done_tool_calls.has(o)) return;
    const r = n.message.tool_calls?.[o];
    if (!r) throw new Error("no tool call snapshot");
    if (!r.type) throw new Error("tool call snapshot missing `type`");
    if (r.type === "function") {
      const i = S(this, ot, "f")?.tools?.find((s) => Mr(s) && s.function.name === r.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: r.function.name,
        index: o,
        arguments: r.function.arguments,
        parsed_arguments: Io(i) ? i.$parseRaw(r.function.arguments) : i?.function.strict ? JSON.parse(r.function.arguments) : null
      });
    } else r.type;
  }, Mi = function(n) {
    const o = S(this, te, "m", jo).call(this, n);
    if (n.message.content && !o.content_done) {
      o.content_done = !0;
      const r = S(this, te, "m", xi).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: r ? r.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !o.refusal_done && (o.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !o.logprobs_content_done && (o.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !o.logprobs_refusal_done && (o.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, er = function() {
    if (this.ended) throw new O("stream has ended, this shouldn't happen");
    const n = S(this, yt, "f");
    if (!n) throw new O("request ended without sending any chunks");
    return G(this, yt, void 0, "f"), G(this, zt, [], "f"), MI(n, S(this, ot, "f"));
  }, xi = function() {
    const n = S(this, ot, "f")?.response_format;
    return _a(n) ? n : null;
  }, Gc = function(n) {
    var o, r, i, s;
    let u = S(this, yt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = G(this, yt, {
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
        const { content: w, refusal: k, ...b } = m;
        Object.assign(_.logprobs, b), w && ((o = _.logprobs).content ?? (o.content = []), _.logprobs.content.push(...w)), k && ((r = _.logprobs).refusal ?? (r.refusal = []), _.logprobs.refusal.push(...k));
      }
      if (h && (_.finish_reason = h, S(this, ot, "f") && fp(S(this, ot, "f")))) {
        if (h === "length") throw new Vh();
        if (h === "content_filter") throw new Jh();
      }
      if (Object.assign(_, g), !f) continue;
      const { content: y, refusal: E, function_call: C, role: T, tool_calls: I, ...L } = f;
      if (Object.assign(_.message, L), E && (_.message.refusal = (_.message.refusal || "") + E), T && (_.message.role = T), C && (_.message.function_call ? (C.name && (_.message.function_call.name = C.name), C.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += C.arguments)) : _.message.function_call = C), y && (_.message.content = (_.message.content || "") + y, !_.message.refusal && S(this, te, "m", xi).call(this) && (_.message.parsed = Oc(_.message.content))), I) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: w, id: k, type: b, function: x, ...P } of I) {
          const F = (s = _.message.tool_calls)[w] ?? (s[w] = {});
          Object.assign(F, P), k && (F.id = k), b && (F.type = b), x && (F.function ?? (F.function = {
            name: x.name ?? "",
            arguments: ""
          })), x?.name && (F.function.name = x.name), x?.arguments && (F.function.arguments += x.arguments, TI(S(this, ot, "f"), F) && (F.function.parsed_arguments = Oc(F.function.arguments)));
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
    return new po(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function MI(e, t) {
  const { id: n, choices: o, created: r, model: i, system_fingerprint: s, ...u } = e;
  return yI({
    ...u,
    id: n,
    choices: o.map(({ message: c, finish_reason: d, index: f, logprobs: h, ...p }) => {
      if (!d) throw new O(`missing finish_reason for choice ${f}`);
      const { content: m = null, function_call: g, tool_calls: _, ...y } = c, E = c.role;
      if (!E) throw new O(`missing role for choice ${f}`);
      if (g) {
        const { arguments: C, name: T } = g;
        if (C == null) throw new O(`missing function_call.arguments for choice ${f}`);
        if (!T) throw new O(`missing function_call.name for choice ${f}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: C,
              name: T
            },
            role: E,
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
          role: E,
          content: m,
          refusal: c.refusal ?? null,
          tool_calls: _.map((C, T) => {
            const { function: I, type: L, id: w, ...k } = C, { arguments: b, name: x, ...P } = I || {};
            if (w == null) throw new O(`missing choices[${f}].tool_calls[${T}].id
${tr(e)}`);
            if (L == null) throw new O(`missing choices[${f}].tool_calls[${T}].type
${tr(e)}`);
            if (x == null) throw new O(`missing choices[${f}].tool_calls[${T}].function.name
${tr(e)}`);
            if (b == null) throw new O(`missing choices[${f}].tool_calls[${T}].function.arguments
${tr(e)}`);
            return {
              ...k,
              id: w,
              type: L,
              function: {
                ...P,
                name: x,
                arguments: b
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
function tr(e) {
  return JSON.stringify(e);
}
var xI = class bs extends Ap {
  static fromReadableStream(t) {
    const n = new bs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, o) {
    const r = new bs(n), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
}, Aa = class extends M {
  constructor() {
    super(...arguments), this.messages = new dp(this._client);
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
    return SI(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => ya(n, e));
  }
  runTools(e, t) {
    return e.stream ? xI.runTools(this._client, e, t) : wI.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Ap.createChatCompletion(this._client, e, t);
  }
};
Aa.Messages = dp;
var Ta = class extends M {
  constructor() {
    super(...arguments), this.completions = new Aa(this._client);
  }
};
Ta.Completions = Aa;
var Tp = class extends M {
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
}, Sp = class extends M {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", ce, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Ep = class extends M {
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
    return this._client.getAPIList("/organization/certificates/activate", It, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", It, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Cp = class extends M {
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
}, wp = class extends M {
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
}, Ip = class extends M {
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
    return this._client.getAPIList("/organization/roles", pt, {
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
}, bp = class extends M {
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
}, Rp = class extends M {
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
}, Pp = class extends M {
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
    return this._client.getAPIList(v`/organization/groups/${e}/roles`, pt, {
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
}, Mp = class extends M {
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
    return this._client.getAPIList(v`/organization/groups/${e}/users`, pt, {
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
}, ei = class extends M {
  constructor() {
    super(...arguments), this.users = new Mp(this._client), this.roles = new Pp(this._client);
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
    return this._client.getAPIList("/organization/groups", pt, {
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
ei.Users = Mp;
ei.Roles = Pp;
var xp = class extends M {
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
}, Np = class extends M {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates`, ce, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/activate`, It, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/deactivate`, It, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, kp = class extends M {
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
}, Dp = class extends M {
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
}, $p = class extends M {
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
}, Lp = class extends M {
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
}, Up = class extends M {
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
    return this._client.getAPIList(v`/projects/${e}/roles`, pt, {
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
}, Fp = class extends M {
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
}, Op = class extends M {
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
}, Gp = class extends M {
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
    return this._client.getAPIList(v`/projects/${o}/groups/${e}/roles`, pt, {
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
}, Sa = class extends M {
  constructor() {
    super(...arguments), this.roles = new Gp(this._client);
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
    return this._client.getAPIList(v`/organization/projects/${e}/groups`, pt, {
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
Sa.Roles = Gp;
var Bp = class extends M {
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
    return this._client.getAPIList(v`/projects/${o}/users/${e}/roles`, pt, {
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
}, Ea = class extends M {
  constructor() {
    super(...arguments), this.roles = new Bp(this._client);
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
Ea.Roles = Bp;
var Pe = class extends M {
  constructor() {
    super(...arguments), this.users = new Ea(this._client), this.serviceAccounts = new Fp(this._client), this.apiKeys = new xp(this._client), this.rateLimits = new Lp(this._client), this.modelPermissions = new $p(this._client), this.hostedToolPermissions = new Dp(this._client), this.groups = new Sa(this._client), this.roles = new Up(this._client), this.dataRetention = new kp(this._client), this.spendAlerts = new Op(this._client), this.certificates = new Np(this._client);
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
Pe.Users = Ea;
Pe.ServiceAccounts = Fp;
Pe.APIKeys = xp;
Pe.RateLimits = Lp;
Pe.ModelPermissions = $p;
Pe.HostedToolPermissions = Dp;
Pe.Groups = Sa;
Pe.Roles = Up;
Pe.DataRetention = kp;
Pe.SpendAlerts = Op;
Pe.Certificates = Np;
var qp = class extends M {
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
    return this._client.getAPIList(v`/organization/users/${e}/roles`, pt, {
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
}, Ca = class extends M {
  constructor() {
    super(...arguments), this.roles = new qp(this._client);
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
Ca.Roles = qp;
var Me = class extends M {
  constructor() {
    super(...arguments), this.auditLogs = new Sp(this._client), this.adminAPIKeys = new Tp(this._client), this.usage = new Rp(this._client), this.invites = new wp(this._client), this.users = new Ca(this._client), this.groups = new ei(this._client), this.roles = new Ip(this._client), this.dataRetention = new Cp(this._client), this.spendAlerts = new bp(this._client), this.certificates = new Ep(this._client), this.projects = new Pe(this._client);
  }
};
Me.AuditLogs = Sp;
Me.AdminAPIKeys = Tp;
Me.Usage = Rp;
Me.Invites = wp;
Me.Users = Ca;
Me.Groups = ei;
Me.Roles = Ip;
Me.DataRetention = Cp;
Me.SpendAlerts = bp;
Me.Certificates = Ep;
Me.Projects = Pe;
var wa = class extends M {
  constructor() {
    super(...arguments), this.organization = new Me(this._client);
  }
};
wa.Organization = Me;
var Hp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* NI(e) {
  if (!e) return;
  if (Hp in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Ec(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = Ec(o[1]) ? o[1] : [o[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [r, null]), yield [r, u]);
  }
}
var $ = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, s] of NI(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [Hp]: !0,
    values: t,
    nulls: n
  };
}, Vp = class extends M {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: $([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Jp = class extends M {
  create(e, t) {
    return this._client.post("/audio/transcriptions", Ze({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Kp = class extends M {
  create(e, t) {
    return this._client.post("/audio/translations", Ze({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, bo = class extends M {
  constructor() {
    super(...arguments), this.transcriptions = new Jp(this._client), this.translations = new Kp(this._client), this.speech = new Vp(this._client);
  }
};
bo.Transcriptions = Jp;
bo.Translations = Kp;
bo.Speech = Vp;
var Wp = class extends M {
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
}, zp = class extends M {
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
}, Yp = class extends M {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Xp = class extends M {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, ti = class extends M {
  constructor() {
    super(...arguments), this.sessions = new Yp(this._client), this.transcriptionSessions = new Xp(this._client);
  }
};
ti.Sessions = Yp;
ti.TranscriptionSessions = Xp;
var Qp = class extends M {
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
}, Zp = class extends M {
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
}, ni = class extends M {
  constructor() {
    super(...arguments), this.sessions = new Qp(this._client), this.threads = new Zp(this._client);
  }
};
ni.Sessions = Qp;
ni.Threads = Zp;
var jp = class extends M {
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
}, em = class extends M {
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
}, kI = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, o = new Uint8Array(n);
    for (let r = 0; r < n; r++) o[r] = t.charCodeAt(r);
    return Array.from(new Float32Array(o.buffer));
  }
}, vt = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, le, Ft, Rs, Xe, pr, Oe, Ot, sn, $t, $r, be, mr, gr, so, no, oo, Bc, qc, Hc, Vc, Jc, Kc, Wc, ao = class extends va {
  constructor() {
    super(...arguments), le.add(this), Rs.set(this, []), Xe.set(this, {}), pr.set(this, {}), Oe.set(this, void 0), Ot.set(this, void 0), sn.set(this, void 0), $t.set(this, void 0), $r.set(this, void 0), be.set(this, void 0), mr.set(this, void 0), gr.set(this, void 0), so.set(this, void 0);
  }
  [(Rs = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakMap(), pr = /* @__PURE__ */ new WeakMap(), Oe = /* @__PURE__ */ new WeakMap(), Ot = /* @__PURE__ */ new WeakMap(), sn = /* @__PURE__ */ new WeakMap(), $t = /* @__PURE__ */ new WeakMap(), $r = /* @__PURE__ */ new WeakMap(), be = /* @__PURE__ */ new WeakMap(), mr = /* @__PURE__ */ new WeakMap(), gr = /* @__PURE__ */ new WeakMap(), so = /* @__PURE__ */ new WeakMap(), le = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new Ft();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const o = po.fromReadableStream(e, this.controller);
    for await (const r of o) S(this, le, "m", no).call(this, r);
    if (o.controller.signal?.aborted) throw new $e();
    return this._addRun(S(this, le, "m", oo).call(this));
  }
  toReadableStream() {
    return new po(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, o) {
    const r = new Ft();
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
    for await (const u of s) S(this, le, "m", no).call(this, u);
    if (s.controller.signal?.aborted) throw new $e();
    return this._addRun(S(this, le, "m", oo).call(this));
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
    const r = new Ft();
    return r._run(() => r._runAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  currentEvent() {
    return S(this, mr, "f");
  }
  currentRun() {
    return S(this, gr, "f");
  }
  currentMessageSnapshot() {
    return S(this, Oe, "f");
  }
  currentRunStepSnapshot() {
    return S(this, so, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(S(this, Xe, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(S(this, pr, "f"));
  }
  async finalRun() {
    if (await this.done(), !S(this, Ot, "f")) throw Error("Final run was not received.");
    return S(this, Ot, "f");
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
    for await (const s of i) S(this, le, "m", no).call(this, s);
    if (i.controller.signal?.aborted) throw new $e();
    return this._addRun(S(this, le, "m", oo).call(this));
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
    for await (const u of s) S(this, le, "m", no).call(this, u);
    if (s.controller.signal?.aborted) throw new $e();
    return this._addRun(S(this, le, "m", oo).call(this));
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
      else if (Ci(r) && Ci(o)) r = this.accumulateDelta(r, o);
      else if (Array.isArray(r) && Array.isArray(o)) {
        if (r.every((i) => typeof i == "string" || typeof i == "number")) {
          r.push(...o);
          continue;
        }
        for (const i of o) {
          if (!Ci(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
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
Ft = ao, no = function(t) {
  if (!this.ended)
    switch (G(this, mr, t, "f"), S(this, le, "m", Hc).call(this, t), t.event) {
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
        S(this, le, "m", Wc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        S(this, le, "m", qc).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        S(this, le, "m", Bc).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, oo = function() {
  if (this.ended) throw new O("stream has ended, this shouldn't happen");
  if (!S(this, Ot, "f")) throw Error("Final run has not been received");
  return S(this, Ot, "f");
}, Bc = function(t) {
  const [n, o] = S(this, le, "m", Jc).call(this, t, S(this, Oe, "f"));
  G(this, Oe, n, "f"), S(this, pr, "f")[n.id] = n;
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
        if (r.index != S(this, sn, "f")) {
          if (S(this, $t, "f")) switch (S(this, $t, "f").type) {
            case "text":
              this._emit("textDone", S(this, $t, "f").text, S(this, Oe, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", S(this, $t, "f").image_file, S(this, Oe, "f"));
              break;
          }
          G(this, sn, r.index, "f");
        }
        G(this, $t, n.content[r.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (S(this, sn, "f") !== void 0) {
        const r = t.data.content[S(this, sn, "f")];
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
}, qc = function(t) {
  const n = S(this, le, "m", Vc).call(this, t);
  switch (G(this, so, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const o = t.data.delta;
      if (o.step_details && o.step_details.type == "tool_calls" && o.step_details.tool_calls && n.step_details.type == "tool_calls") for (const r of o.step_details.tool_calls) r.index == S(this, $r, "f") ? this._emit("toolCallDelta", r, n.step_details.tool_calls[r.index]) : (S(this, be, "f") && this._emit("toolCallDone", S(this, be, "f")), G(this, $r, r.index, "f"), G(this, be, n.step_details.tool_calls[r.index], "f"), S(this, be, "f") && this._emit("toolCallCreated", S(this, be, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      G(this, so, void 0, "f"), t.data.step_details.type == "tool_calls" && S(this, be, "f") && (this._emit("toolCallDone", S(this, be, "f")), G(this, be, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Hc = function(t) {
  S(this, Rs, "f").push(t), this._emit("event", t);
}, Vc = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return S(this, Xe, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = S(this, Xe, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let o = t.data;
      if (o.delta) {
        const r = Ft.accumulateDelta(n, o.delta);
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
}, Jc = function(t, n) {
  let o = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, o];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let r = t.data;
      if (r.delta.content) for (const i of r.delta.content) if (i.index in n.content) {
        let s = n.content[i.index];
        n.content[i.index] = S(this, le, "m", Kc).call(this, i, s);
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
}, Kc = function(t, n) {
  return Ft.accumulateDelta(n, t);
}, Wc = function(t) {
  switch (G(this, gr, t.data, "f"), t.event) {
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
      G(this, Ot, t.data, "f"), S(this, be, "f") && (this._emit("toolCallDone", S(this, be, "f")), G(this, be, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var Ia = class extends M {
  constructor() {
    super(...arguments), this.steps = new em(this._client);
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
    return ao.createAssistantStream(e, this._client.beta.threads.runs, t, n);
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
          await wo(s);
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
    return ao.createAssistantStream(e, this._client.beta.threads.runs, t, n);
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
    return ao.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
Ia.Steps = em;
var oi = class extends M {
  constructor() {
    super(...arguments), this.runs = new Ia(this._client), this.messages = new jp(this._client);
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
    return ao.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
oi.Runs = Ia;
oi.Messages = jp;
var An = class extends M {
  constructor() {
    super(...arguments), this.realtime = new ti(this._client), this.chatkit = new ni(this._client), this.assistants = new zp(this._client), this.threads = new oi(this._client);
  }
};
An.Realtime = ti;
An.ChatKit = ni;
An.Assistants = zp;
An.Threads = oi;
var tm = class extends M {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, nm = class extends M {
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(v`/containers/${o}/files/${e}/content`, {
      ...n,
      headers: $([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, ba = class extends M {
  constructor() {
    super(...arguments), this.content = new nm(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/containers/${e}/files`, jr({
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
ba.Content = nm;
var Ra = class extends M {
  constructor() {
    super(...arguments), this.files = new ba(this._client);
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
Ra.Files = ba;
var om = class extends M {
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
}, Pa = class extends M {
  constructor() {
    super(...arguments), this.items = new om(this._client);
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
Pa.Items = om;
var rm = class extends M {
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
      s.embedding = kI(u);
    }), i)));
  }
}, im = class extends M {
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
}, Ma = class extends M {
  constructor() {
    super(...arguments), this.outputItems = new im(this._client);
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
Ma.OutputItems = im;
var xa = class extends M {
  constructor() {
    super(...arguments), this.runs = new Ma(this._client);
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
xa.Runs = Ma;
var sm = class extends M {
  create(e, t) {
    return this._client.post("/files", Ze({
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
      if (await wo(t), i = await this.retrieve(e), Date.now() - r > n) throw new ha({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, am = class extends M {
}, lm = class extends M {
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
}, Na = class extends M {
  constructor() {
    super(...arguments), this.graders = new lm(this._client);
  }
};
Na.Graders = lm;
var um = class extends M {
  create(e, t, n) {
    return this._client.getAPIList(v`/fine_tuning/checkpoints/${e}/permissions`, It, {
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
}, ka = class extends M {
  constructor() {
    super(...arguments), this.permissions = new um(this._client);
  }
};
ka.Permissions = um;
var cm = class extends M {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/fine_tuning/jobs/${e}/checkpoints`, Q, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Da = class extends M {
  constructor() {
    super(...arguments), this.checkpoints = new cm(this._client);
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
Da.Checkpoints = cm;
var Tn = class extends M {
  constructor() {
    super(...arguments), this.methods = new am(this._client), this.jobs = new Da(this._client), this.checkpoints = new ka(this._client), this.alpha = new Na(this._client);
  }
};
Tn.Methods = am;
Tn.Jobs = Da;
Tn.Checkpoints = ka;
Tn.Alpha = Na;
var dm = class extends M {
}, $a = class extends M {
  constructor() {
    super(...arguments), this.graderModels = new dm(this._client);
  }
};
$a.GraderModels = dm;
var fm = class extends M {
  createVariation(e, t) {
    return this._client.post("/images/variations", Ze({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", Ze({
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
}, hm = class extends M {
  retrieve(e, t) {
    return this._client.get(v`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", It, {
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
}, pm = class extends M {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, mm = class extends M {
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
}, gm = class extends M {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, ri = class extends M {
  constructor() {
    super(...arguments), this.clientSecrets = new gm(this._client), this.calls = new mm(this._client);
  }
};
ri.ClientSecrets = gm;
ri.Calls = mm;
function DI(e, t) {
  return !t || !LI(t) ? {
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
  } : _m(e, t);
}
function _m(e, t) {
  const n = e.output.map((r) => {
    if (r.type === "function_call") return {
      ...r,
      parsed_arguments: OI(t, r)
    };
    if (r.type === "message") {
      const i = r.content.map((s) => s.type === "output_text" ? {
        ...s,
        parsed: $I(t, s.text)
      } : s);
      return {
        ...r,
        content: i
      };
    }
    return r;
  }), o = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || Ps(o), Object.defineProperty(o, "output_parsed", {
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
function $I(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function LI(e) {
  return !!_a(e.text?.format);
}
function UI(e) {
  return e?.$brand === "auto-parseable-tool";
}
function FI(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function OI(e, t) {
  const n = FI(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: UI(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function Ps(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const o of n.content) o.type === "output_text" && t.push(o.text);
  e.output_text = t.join("");
}
var Yt, nr, At, or, zc, Yc, Xc, Qc, GI = class ym extends va {
  constructor(t) {
    super(), Yt.add(this), nr.set(this, void 0), At.set(this, void 0), or.set(this, void 0), G(this, nr, t, "f");
  }
  static createResponse(t, n, o) {
    const r = new ym(n);
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
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), S(this, Yt, "m", zc).call(this);
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
    for await (const u of i) S(this, Yt, "m", Yc).call(this, u, s);
    if (i.controller.signal?.aborted) throw new $e();
    return S(this, Yt, "m", Xc).call(this);
  }
  [(nr = /* @__PURE__ */ new WeakMap(), At = /* @__PURE__ */ new WeakMap(), or = /* @__PURE__ */ new WeakMap(), Yt = /* @__PURE__ */ new WeakSet(), zc = function() {
    this.ended || G(this, At, void 0, "f");
  }, Yc = function(n, o) {
    if (this.ended) return;
    const r = (s, u) => {
      (o == null || u.sequence_number > o) && this._emit(s, u);
    }, i = S(this, Yt, "m", Qc).call(this, n);
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
  }, Xc = function() {
    if (this.ended) throw new O("stream has ended, this shouldn't happen");
    const n = S(this, At, "f");
    if (!n) throw new O("request ended without sending any events");
    G(this, At, void 0, "f");
    const o = BI(n, S(this, nr, "f"));
    return G(this, or, o, "f"), o;
  }, Qc = function(n) {
    let o = S(this, At, "f");
    if (!o) {
      if (n.type !== "response.created") throw new O(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return o = G(this, At, n.response, "f"), o;
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
        G(this, At, n.response, "f");
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
    const t = S(this, or, "f");
    if (!t) throw new O("stream ended without producing a ChatCompletion");
    return t;
  }
};
function BI(e, t) {
  return DI(e, t);
}
var vm = class extends M {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/responses/${e}/input_items`, Q, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Am = class extends M {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, ii = class extends M {
  constructor() {
    super(...arguments), this.inputItems = new vm(this._client), this.inputTokens = new Am(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && Ps(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(v`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((o) => ("object" in o && o.object === "response" && Ps(o), o));
  }
  delete(e, t) {
    return this._client.delete(v`/responses/${e}`, {
      ...t,
      headers: $([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => _m(n, e));
  }
  stream(e, t) {
    return GI.createResponse(this._client, e, t);
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
ii.InputItems = vm;
ii.InputTokens = Am;
var Tm = class extends M {
  retrieve(e, t) {
    return this._client.get(v`/skills/${e}/content`, {
      ...t,
      headers: $([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Sm = class extends M {
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(v`/skills/${o}/versions/${e}/content`, {
      ...n,
      headers: $([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, La = class extends M {
  constructor() {
    super(...arguments), this.content = new Sm(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(v`/skills/${e}/versions`, jr({
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
La.Content = Sm;
var si = class extends M {
  constructor() {
    super(...arguments), this.content = new Tm(this._client), this.versions = new La(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", jr({
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
si.Content = Tm;
si.Versions = La;
var Em = class extends M {
  create(e, t, n) {
    return this._client.post(v`/uploads/${e}/parts`, Ze({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Ua = class extends M {
  constructor() {
    super(...arguments), this.parts = new Em(this._client);
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
Ua.Parts = Em;
var qI = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((r) => r.status === "rejected");
  if (n.length) {
    for (const r of n) console.error(r.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const o = [];
  for (const r of t) r.status === "fulfilled" && o.push(r.value);
  return o;
}, Cm = class extends M {
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
          await wo(s);
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
    return await qI(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, wm = class extends M {
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
          await wo(s);
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
    return this._client.getAPIList(v`/vector_stores/${o}/files/${e}/content`, It, {
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, ai = class extends M {
  constructor() {
    super(...arguments), this.files = new wm(this._client), this.fileBatches = new Cm(this._client);
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
    return this._client.getAPIList(v`/vector_stores/${e}/search`, It, {
      body: t,
      method: "post",
      ...n,
      headers: $([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
ai.Files = wm;
ai.FileBatches = Cm;
var Im = class extends M {
  create(e, t) {
    return this._client.post("/videos", Ze({
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
    return this._client.post("/videos/characters", Ze({
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
    return this._client.post("/videos/edits", Ze({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", Ze({
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
    return this._client.post(v`/videos/${e}/remix`, jr({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, en, bm, _r, Rm = class extends M {
  constructor() {
    super(...arguments), en.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, o = 300) {
    return await this.verifySignature(e, t, n, o), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, o = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    S(this, en, "m", bm).call(this, n);
    const r = $([t]).values, i = S(this, en, "m", _r).call(this, r, "webhook-signature"), s = S(this, en, "m", _r).call(this, r, "webhook-timestamp"), u = S(this, en, "m", _r).call(this, r, "webhook-id"), c = parseInt(s, 10);
    if (isNaN(c)) throw new zn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > o) throw new zn("Webhook timestamp is too old");
    if (c > d + o) throw new zn("Webhook timestamp is too new");
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
    throw new zn("The given webhook signature does not match the expected signature");
  }
};
en = /* @__PURE__ */ new WeakSet(), bm = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, _r = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const o = t.get(n);
  if (o == null) throw new Error(`Missing required header: ${n}`);
  return o;
};
var Ms, Fa, yr, Pm, HI = "workload-identity-auth", H = class {
  constructor({ baseURL: e = vt("OPENAI_BASE_URL"), apiKey: t = vt("OPENAI_API_KEY") ?? null, adminAPIKey: n = vt("OPENAI_ADMIN_KEY") ?? null, organization: o = vt("OPENAI_ORG_ID") ?? null, project: r = vt("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = vt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: s, ...u } = {}) {
    Ms.add(this), yr.set(this, void 0), this.completions = new tm(this), this.chat = new Ta(this), this.embeddings = new rm(this), this.files = new sm(this), this.images = new fm(this), this.audio = new bo(this), this.moderations = new pm(this), this.models = new hm(this), this.fineTuning = new Tn(this), this.graders = new $a(this), this.vectorStores = new ai(this), this.webhooks = new Rm(this), this.beta = new An(this), this.batches = new Wp(this), this.uploads = new Ua(this), this.admin = new wa(this), this.responses = new ii(this), this.realtime = new ri(this), this.conversations = new Pa(this), this.evals = new xa(this), this.containers = new Ra(this), this.skills = new si(this), this.videos = new Im(this);
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
    if (!c.dangerouslyAllowBrowser && Bw()) throw new O(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? Fa.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = $c(c.logLevel, "ClientOptions.logLevel", this) ?? $c(vt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? Wh(), G(this, yr, Kw, "f");
    const f = vt("OPENAI_CUSTOM_HEADERS");
    if (f) {
      const h = {};
      for (const p of f.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (h[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = $([h, c.defaultHeaders]);
    }
    this._options = c, s && (this._workloadIdentityAuth = new cI(s, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = o, this.project = r, this.webhookSecret = i;
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
    return Zw(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Zt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${$h()}`;
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
    const o = !S(this, Ms, "m", Pm).call(this) && n || this.baseURL, r = Uw(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), s = Object.fromEntries(r.searchParams);
    return (!Cc(i) || !Cc(s)) && (t = {
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
    return new rp(this, this.makeRequest(e, t, void 0));
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
    if (ae(this).debug(`[${c}] sending request`, kt({
      retryOfRequestLogID: n,
      method: o.method,
      url: s,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new $e();
    const h = o.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(s, i, u, p, h).catch(ms), g = Date.now();
    if (m instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new $e();
      const E = ps(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return ae(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - ${y}`), ae(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (${y})`, kt({
          retryOfRequestLogID: n,
          url: s,
          durationMs: g - f,
          message: m.message
        })), this.retryRequest(o, t, n ?? c);
      throw ae(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - error; no more retries left`), ae(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (error; no more retries left)`, kt({
        retryOfRequestLogID: n,
        url: s,
        durationMs: g - f,
        message: m.message
      })), m instanceof Kh || m instanceof $w ? m : E ? new ha() : new Xr({
        message: VI(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, E]) => ", " + y + ": " + JSON.stringify(E)).join("")}] ${i.method} ${s} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - f}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && h.bearerAuth && !o.__metadata?.hasStreamingBody && !o.__metadata?.workloadIdentityTokenRefreshed)
        return await Rc(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...o,
          __metadata: {
            ...o.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(m);
      if (t && y) {
        const L = `retrying, ${t} attempts remaining`;
        return await Rc(m.body), ae(this).info(`${_} - ${L}`), ae(this).debug(`[${c}] response error (${L})`, kt({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - f
        })), this.retryRequest(o, t, n ?? c, m.headers);
      }
      const E = y ? "error; no more retries left" : "error; not retryable";
      ae(this).info(`${_} - ${E}`);
      const C = await m.text().catch((L) => ms(L).message), T = Gw(C), I = T ? void 0 : C;
      throw ae(this).debug(`[${c}] response error (${E})`, kt({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: I,
        durationMs: Date.now() - f
      })), this.makeStatusError(m.status, T, I, m.headers);
    }
    return ae(this).info(_), ae(this).debug(`[${c}] response start`, kt({
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
    return new aI(this, n, e);
  }
  async fetchWithAuth(e, t, n, o, r = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && r.bearerAuth) {
      const i = t.headers, s = i.get("Authorization");
      if (!s || s === `Bearer ${HI}`) {
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
    return await wo(r), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const r = t - e;
    return Math.min(0.5 * Math.pow(2, r), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: r, query: i, defaultBaseURL: s } = n, u = this.buildURL(r, i, s);
    "timeout" in n && Ow("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const i = $([
      r,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...Jw(),
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
      body: Yh(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...S(this, yr, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
Fa = H, yr = /* @__PURE__ */ new WeakMap(), Ms = /* @__PURE__ */ new WeakSet(), Pm = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
H.OpenAI = Fa;
H.DEFAULT_TIMEOUT = 6e5;
H.OpenAIError = O;
H.APIError = de;
H.APIConnectionError = Xr;
H.APIConnectionTimeoutError = ha;
H.APIUserAbortError = $e;
H.NotFoundError = Oh;
H.ConflictError = Gh;
H.RateLimitError = qh;
H.BadRequestError = Lh;
H.AuthenticationError = Uh;
H.InternalServerError = Hh;
H.PermissionDeniedError = Fh;
H.UnprocessableEntityError = Bh;
H.InvalidWebhookSignatureError = zn;
H.toFile = mI;
H.Completions = tm;
H.Chat = Ta;
H.Embeddings = rm;
H.Files = sm;
H.Images = fm;
H.Audio = bo;
H.Moderations = pm;
H.Models = hm;
H.FineTuning = Tn;
H.Graders = $a;
H.VectorStores = ai;
H.Webhooks = Rm;
H.Beta = An;
H.Batches = Wp;
H.Uploads = Ua;
H.Admin = wa;
H.Responses = ii;
H.Realtime = ri;
H.Conversations = Pa;
H.Evals = xa;
H.Containers = Ra;
H.Skills = si;
H.Videos = Im;
function VI(e) {
  if (JI(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function JI(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const o = t;
    if (o.code === "UND_ERR_INVALID_ARG" && typeof o.message == "string" && o.message.includes("invalid onRequestStart method")) return !0;
    t = o.cause;
  }
  return !1;
}
function KI(e = {}, t = [], n = Tr(e, e.reasoning)) {
  return e.provider === "openai-compatible" && e.toolMode !== "tagged-json" && Array.isArray(t) && t.length > 0 && n.profileId === "deepseek-thinking" && n.mode !== "off";
}
function WI(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function zI(e, t, n) {
  return t > n && Array.isArray(e?.tool_calls) && e.tool_calls.some((o) => String(o?.function?.name || "").trim());
}
function Zc(e = "", t = 0) {
  let n = 0;
  for (let o = t - 1; o >= 0 && e[o] === "\\"; o -= 1) n += 1;
  return n % 2 === 1;
}
function YI(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function XI(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function QI(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function ZI(e = "") {
  const t = String(e ?? "");
  let n = "", o = 0;
  for (; o < t.length; ) {
    const r = t.slice(o, o + 2), i = t.slice(o + 2, o + 6);
    if (r !== "\\u" || Zc(t, o) || !YI(i)) {
      n += t[o] || "", o += 1;
      continue;
    }
    const s = o + 6, u = t.slice(s + 2, s + 6);
    if (XI(i) && t.slice(s, s + 2) === "\\u" && !Zc(t, s) && QI(u)) {
      const c = Number.parseInt(i, 16), d = Number.parseInt(u, 16), f = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(f), o += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(i, 16)), o += 6;
  }
  return n;
}
function jI(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), ZI(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function e0(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Oa(e = "", t = "", n = 0) {
  const o = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${e0(t)}(?:\\\\?")?\\s*:`, "i"), r = String(e || "").slice(Math.max(0, n)).match(o);
  if (!r || r.index === void 0) return null;
  const i = r[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + r.index + i,
    end: Math.max(0, n) + r.index + r[0].length
  };
}
function t0(e = "", t = [], n = 0) {
  return t.map((o) => Oa(e, o, n)).filter(Boolean).sort((o, r) => o.index - r.index)[0] || null;
}
function He(e = "", t = "", n = []) {
  const o = String(e || ""), r = Oa(o, t);
  if (!r) return;
  let i = r.end;
  for (; /\s/.test(o[i] || ""); ) i += 1;
  o[i] === '"' && (i += 1);
  const s = t0(o, n.filter((d) => d !== t), i);
  let u = s ? s.index : o.length;
  if (s) {
    const d = o.lastIndexOf(",", s.index);
    d >= i && (u = d);
  }
  let c = o.slice(i, u).trim();
  return s || (c = c.replace(/\}\s*$/, "").trimEnd()), jI(c);
}
function it(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var an = {
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
function jc(e = "", t = [], n = []) {
  for (const o of t) {
    const r = He(e, o, n);
    if (r !== void 0) return r;
  }
}
function n0(e = "", t = "") {
  if (t === "Read") {
    const n = an.Read, o = {};
    return n.forEach((r, i) => {
      const s = He(e, r, n.slice(i + 1));
      s !== void 0 && (o[r] = it(s));
    }), o.filePath === void 0 && o.path !== void 0 && (o.filePath = o.path, delete o.path), o.filePath === void 0 && o.scope !== void 0 && (o.filePath = o.scope, delete o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "Write") {
    const n = {}, o = jc(e, ["filePath", "path"], ["content"]), r = He(e, "content", []);
    return o !== void 0 && (n.filePath = it(o)), r !== void 0 && (n.content = it(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, o = jc(e, ["filePath", "path"], ["edits"]), r = He(e, "edits", []);
    return o !== void 0 && (n.filePath = it(o)), r !== void 0 && (n.edits = it(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = an.Grep, o = {};
    return n.forEach((r) => {
      const i = He(e, r, n.filter((s) => s !== r));
      i !== void 0 && (o[r] = it(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "MemoryGrep") {
    const n = an.MemoryGrep, o = {};
    return n.forEach((r) => {
      const i = He(e, r, n.filter((s) => s !== r));
      i !== void 0 && (o[r] = it(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  if (t === "ChatHistory") {
    const n = an.ChatHistory, o = {};
    return n.forEach((r) => {
      const i = He(e, r, n.filter((s) => s !== r));
      i !== void 0 && (o[r] = it(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  return null;
}
function o0(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const s = JSON.parse(n);
    if (s && typeof s == "object" && !Array.isArray(s)) return s;
  } catch {
  }
  if (!Object.hasOwn(an, t)) return null;
  const o = n0(n, t);
  if (o) return o;
  const r = an[t], i = {};
  return r.forEach((s, u) => {
    const c = He(n, s, r.slice(u + 1));
    c !== void 0 && (i[s] = it(c));
  }), Object.keys(i).length ? i : null;
}
function Mm(e = "", t = "") {
  const n = o0(e, t);
  return n ? JSON.stringify(n) : "";
}
var r0 = /<tool_call\b|<\/?[｜|]+DSML[｜|]+\s*/gi, i0 = /<[｜|]+DSML[｜|]+\s*invoke\s+name="([^"]+)"\s*>/iy, s0 = /<\/[｜|]+DSML[｜|]+\s*invoke\s*>/iy, a0 = /<[｜|]+DSML[｜|]+\s*(function_calls|calls)\s*>/iy, l0 = /<\/[｜|]+DSML[｜|]+\s*(function_calls|calls)\s*>/iy, u0 = /<[｜|]+DSML[｜|]+\s*parameter\s+name="([^"]+)"\s+string="(true|false)"\s*>/iy, c0 = /<(\/?)[｜|]+DSML[｜|]+\s*parameter\b/gi, d0 = /<\/[｜|]+DSML[｜|]+\s*parameter\s*>/iy, Ga = /<[^<>"']*(?:"[^"]*"[^<>"']*|'[^']*'[^<>"']*)*>/y;
function ue(e, t, n) {
  return e.lastIndex = n, e.exec(t);
}
function Ro(e, t = 0) {
  return ue(r0, e, t);
}
function Ba(e, t) {
  for (; t < e.length && /\s/.test(e[t]); ) t += 1;
  return t;
}
function Be(e, t) {
  const n = /* @__PURE__ */ new SyntaxError(`DSML 工具调用格式无效：${t}（位置 ${e}）。本轮工具未执行。`);
  throw n.code = "DSML_TOOL_CALL_INVALID", n.offset = e, n;
}
function ut(e, t) {
  const n = /* @__PURE__ */ new SyntaxError(`JSON 工具调用格式无效：${t}（位置 ${e}）。本轮工具未执行。`);
  throw n.code = "TAGGED_TOOL_CALL_INVALID", n.offset = e, n;
}
function ed(e, t) {
  const n = ue(i0, e, t), o = n?.[1].trim();
  o || Be(t, "缺少完整的 invoke 标签或工具名");
  let r = t + n[0].length;
  const i = /* @__PURE__ */ new Set(), s = [];
  for (; r < e.length; ) {
    r = Ba(e, r);
    const u = ue(s0, e, r);
    if (u) return {
      end: r + u[0].length,
      calls: [{
        name: o,
        arguments: `{${s.join(",")}}`
      }]
    };
    const c = ue(u0, e, r);
    c || Be(r, "缺少完整的 parameter 标签或 invoke 结束标签");
    const d = c[1];
    i.has(d) && Be(r, "存在重复参数"), i.add(d);
    const f = r + c[0].length, h = ue(c0, e, f);
    (!h || !h[1]) && Be(f, "参数未闭合或参数边界有歧义");
    const p = ue(d0, e, h.index);
    p || Be(h.index, "parameter 结束标签无效");
    const m = e.slice(f, h.index);
    let g = JSON.stringify(m);
    if (c[2].toLowerCase() === "false") {
      g = m.trim();
      try {
        JSON.parse(g);
      } catch {
        Be(f, "非字符串参数不是合法 JSON");
      }
    }
    s.push(`${JSON.stringify(d)}:${g}`), r = h.index + p[0].length;
  }
  Be(r, "invoke 未闭合");
}
function f0(e, t) {
  const n = ue(a0, e, t);
  if (!n) return ed(e, t);
  let o = t + n[0].length;
  const r = [];
  for (; o < e.length; ) {
    o = Ba(e, o);
    const i = ue(l0, e, o);
    if (i)
      return i[1].toLowerCase() !== n[1].toLowerCase() && Be(o, "调用组结束标签不匹配"), {
        end: o + i[0].length,
        calls: r
      };
    const s = ed(e, o);
    r.push(...s.calls), o = s.end;
  }
  Be(o, "调用组未闭合");
}
function xm(e, t) {
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
function Nm(e, t, n) {
  if (e[t] !== "[" || n.end < 0 || n.nested) return !1;
  try {
    return JSON.parse(e.slice(t, n.end)), !1;
  } catch {
    return !0;
  }
}
function h0(e, t) {
  let n = t, o;
  for (; o = ue(/["<{[]/g, e, n); ) {
    if (n = o.index, o[0] === '"') {
      const i = qa(e, n);
      i < 0 && ut(t, "JSON 前的说明文字引号未闭合"), n = i;
      continue;
    }
    if (o[0] === "<") {
      if (ue(/<\/tool_call>/iy, e, n)) return null;
      const i = ue(Ga, e, n);
      n += i?.[0].length || 1;
      continue;
    }
    const r = xm(e, n);
    if (Nm(e, n, r)) {
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
function qa(e, t) {
  for (let n = t + 1; n < e.length; n += 1) if (e[n] === "\\") n += 1;
  else if (e[n] === '"') return n + 1;
  return -1;
}
function td(e, t) {
  for (let n = 0; n < e.length; ) {
    const o = e[n], r = o === "<" ? ue(Ga, e, n) : null;
    if (r) n += r[0].length;
    else if (o === '"') {
      const i = qa(e, n);
      i < 0 && ut(t, "JSON 外的说明文字引号未闭合"), e[Ba(e, i)] === ":" && ut(t, "完整 JSON 外出现字段，不能作为杂文剥离"), n = i;
    } else if (o === "{" || o === "[") {
      const i = xm(e, n);
      Nm(e, n, i) || ut(t, "同一工具块中存在多个 JSON 结构"), n = i.end;
    } else n += 1;
  }
}
function p0(e, t, n) {
  let o = t, r;
  for (; r = ue(/["<]/g, e, o); )
    if (o = r.index, r[0] === '"') {
      const i = qa(e, o);
      i < 0 && ut(n, "JSON 外的说明文字引号未闭合"), o = i;
    } else {
      const i = ue(/<\/tool_call>/iy, e, o);
      if (i) return i;
      const s = ue(Ga, e, o);
      o += s?.[0].length || 1;
    }
  return null;
}
function m0(e, t) {
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
  ].includes(o)) && ut(t, "工具封装中存在 id、name、arguments 之外的字段，无法确定参数边界");
}
function g0(e, t) {
  const n = ue(/<tool_call>/iy, e, t);
  if (!n) return null;
  const o = t + n[0].length, r = h0(e, o);
  r?.mismatched && ut(t, "JSON 括号不匹配，无法确定调用边界");
  const i = p0(e, r?.boundary ?? o, t);
  if (!i)
    return r && ue(/<\/tool_call>/gi, e, r.start) && ut(t, "未找到 JSON 字符串之外的 tool_call 结束标签"), /<\/[｜|]+DSML[｜|]+/i.test(e.slice(o)) && Be(t, "tool_call 开头与 DSML 结尾混用，无法确定调用边界"), null;
  let s = e.slice(o, i.index);
  const u = e.slice(o, r?.start ?? o), c = e.slice(r?.boundary ?? o, i.index), d = /<tool_call\b|<[｜|]+DSML[｜|]+\s*(?:invoke|function_calls|calls)\b/i;
  return (d.test(u) || d.test(c)) && ut(t, "同一工具块中出现另一条工具调用，不能作为杂文剥离"), r?.end >= 0 && (td(u, t), td(c, t), s = e.slice(r.start, r.end), m0(s, t)), {
    end: i.index + i[0].length,
    payload: s
  };
}
function _0(e) {
  const t = [];
  let n = 0, o;
  for (; o = Ro(e, n); ) if (/^<tool_call/i.test(o[0])) {
    const i = g0(e, o.index);
    if (!i) break;
    t.push(i), n = i.end;
  } else {
    const i = f0(e, o.index);
    t.push(i), n = i.end;
  }
  const r = km(e);
  return r >= n && /^<\/?[｜|]/.test(e.slice(r)) && Be(r, "DSML 标记未输出完整"), t;
}
function km(e) {
  const t = e.lastIndexOf("<");
  if (t < 0) return -1;
  const n = e.slice(t).replace(/[｜|]+/g, "|").toLowerCase();
  return [
    "<tool_call",
    "<|dsml|",
    "</|dsml|"
  ].some((o) => o.startsWith(n)) ? t : -1;
}
function y0(e) {
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
function ge(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function fn(e, t) {
  return e.captureRawAssistantMessage === !0 ? { rawAssistantMessage: ge(t) } : {};
}
function X(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Dm(e = "") {
  return !!Ro(String(e || ""));
}
function $m(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function Lm(e, t = "") {
  const n = $m(e);
  try {
    return JSON.parse(n), n;
  } catch {
    return Mm(n, t) || n;
  }
}
function v0(e = "") {
  const t = String(e || ""), n = Oa(t, "arguments");
  if (!n) return "";
  let o = n.end;
  for (; /\s/.test(t[o] || ""); ) o += 1;
  const r = t[o] || "";
  return r === "{" ? t.slice(o).replace(/\}\s*$/, "").trimEnd() : r === '"' ? t.slice(o + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(o).replace(/\}\s*$/, "").trimEnd();
}
function A0(e = "") {
  const t = String(e || "").trim(), n = He(t, "name", ["id", "arguments"]) || He(t, "toolName", ["id", "arguments"]) || "", o = He(t, "id", [
    "name",
    "toolName",
    "arguments"
  ]), r = v0(t);
  return !n || !r ? null : {
    id: o,
    name: n,
    arguments: Lm(r, n)
  };
}
function T0(e, t = 0, n = "openai-tool") {
  if (!X(e)) return null;
  const o = X(e.function) ? e.function : null, r = String(o?.name || "").trim();
  if (!r) return null;
  const i = ge(e) || {};
  return delete i.index, i.id = String(i.id || `${n}-${t + 1}`), i.type = "function", i.function = {
    ...ge(o) || {},
    name: r,
    arguments: $m(o.arguments)
  }, i;
}
function mo(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, o) => T0(n, o, t)).filter(Boolean);
}
function go(e, t) {
  return Array.isArray(e) ? e.some((n) => go(n, t)) : X(e) ? Object.entries(e).some(([n, o]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(o) : (Array.isArray(o) || X(o)) && go(o, t)) : !1;
}
function S0(e) {
  return go(e, (t) => typeof t == "string" && t.length > 0);
}
function xs(e) {
  return go(e, () => !0);
}
function E0(e) {
  return go(e, (t) => typeof t != "string" || t.length === 0);
}
function C0(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => S0(t));
}
var nd = /* @__PURE__ */ new WeakSet();
function Ha(e) {
  if (!X(e)) return null;
  const t = ge(e) || {};
  if (typeof t.content == "string" && Dm(t.content) && (t.content = Lt(De(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = mo(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function Va(e = [], t = "openai-tool") {
  return mo(e, t).map((n, o) => ({
    id: n.id || `${t}-${Date.now()}-${o + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function hn(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function De(e = "") {
  const t = [], n = String(e || "");
  let o = 0, r = "";
  for (const i of n.matchAll(/<think>([\s\S]*?)<\/think>/gi)) {
    const s = Ro(n, o);
    if (s && s.index < i.index) break;
    r += n.slice(o, i.index), qe(t, "思考块", i[1]), o = i.index + i[0].length;
  }
  return r = (r + n.slice(o)).trim(), {
    cleaned: r,
    thoughts: t
  };
}
function Lt(e = "", { streaming: t = !1 } = {}) {
  const n = String(e || ""), o = Ro(n)?.index ?? (t ? km(n) : -1);
  return o < 0 ? n.trim() : n.slice(0, o).trim();
}
function Ns(e = "") {
  const t = String(e || "");
  if (!Dm(t)) return [];
  const n = Ro(t), o = t.slice(n.index);
  return [{
    id: "tagged-json-draft",
    name: (/^<tool_call/i.test(n[0]) ? o.match(/["']?name["']?\s*:\s*["']([^"']+)/i) : o.match(/<[｜|]+DSML[｜|]+\s*invoke\s+name="([^"]+)"/i))?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }];
}
function Dt(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      qe(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((o) => Dt(e, o, n));
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
function Tt(e = {}, t = {}) {
  const n = [];
  return Dt(n, e.reasoning_content, "推理文本"), Dt(n, e.reasoning, "推理文本"), Dt(n, e.reasoning_text, "推理文本"), Dt(n, e.thinking, "思考块"), Dt(n, t.reasoning_content, "推理文本"), Dt(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((o) => {
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
function w0(e = "") {
  const t = String(e || ""), n = [];
  _0(t).forEach((i) => {
    if (i.calls) {
      n.push(...i.calls);
      return;
    }
    try {
      const s = JSON.parse(i.payload);
      n.push({
        id: s.id,
        name: String(s.name || ""),
        arguments: Lm(s.arguments, s.name)
      });
    } catch {
      const s = A0(i.payload);
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
function lo(e, t, n, o) {
  try {
    return w0(t);
  } catch (r) {
    throw Object.assign(r, fn(e, n)), o && (r.requestInspection = o), r;
  }
}
function Ja(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : Ha(t);
}
function I0(e = {}) {
  const t = mo(e?.tool_calls);
  if (t.length) return t;
  const n = mo(Ja(e)?.tool_calls);
  return n.length ? n : [];
}
function b0(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function R0(e = "") {
  return /claude/i.test(String(e || ""));
}
function P0(e = "") {
  return qr(e) === "openai";
}
function Um(e = {}, t = {}) {
  return t.mode !== "on" && t.mode !== "off" ? e : t.profileId === "kimi-k3" ? (e.reasoning_effort = t.mode === "off" ? "off" : t.effort, e) : t.profileId === "deepseek-thinking" ? (e.thinking = { type: t.mode === "off" ? "disabled" : "enabled" }, t.mode === "on" && (e.reasoning_effort = t.effort), e) : (String(t.profileId || "").startsWith("openai-") && (e.reasoning_effort = t.mode === "off" ? "none" : t.effort), e);
}
function ks(e = [], t = "") {
  if (!R0(t)) return e;
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
function od(e, t = "") {
  return !X(e) || !b0(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var Ds = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function M0(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((o) => ge(o) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((o, r) => {
    const i = ge(o) || {}, s = Number.isInteger(Number(o?.index)) ? Number(o.index) : r, u = n[s];
    n[s] = X(u) ? Po(u, i, "tool_call") : i;
  }), n.filter((o) => o !== void 0);
}
function Po(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return ge(t);
  if (t === null && Ds.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return M0(e, t);
  if (typeof e == "string" && typeof t == "string")
    return Ds.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : ge(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(ge(t) || []);
  if (X(e) && X(t)) {
    const o = { ...e };
    return Object.entries(t).forEach(([r, i]) => {
      o[r] = Po(o[r], i, r);
    }), o;
  }
  return ge(t);
}
function Lr(e = {}, t = {}) {
  const n = X(e) ? ge(e) || {} : {}, o = X(t) ? ge(t) || {} : {};
  return delete o.message, delete o.finish_reason, delete o.index, delete o.logprobs, delete o.delta, Object.entries(o).forEach(([r, i]) => {
    n[r] = Po(n[r], i, r);
  }), n.role || (n.role = "assistant"), Ha(n) || { role: "assistant" };
}
function uo(e, t = {}) {
  const n = Ha(Lr(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function x0(e = {}, t = {}) {
  return X(e) ? X(t) ? Po(ge(e) || {}, t, "") : ge(e) : ge(t);
}
function $s(e, t = "", { preserveReasoningContent: n = !1 } = {}) {
  const o = Array.isArray(e.messages) ? e.messages : [], r = WI(o), i = [];
  let s = !1;
  o.forEach((d, f) => {
    if (s) {
      if (d?.role === "tool") return;
      s = !1;
    }
    const h = d?.role === "assistant", p = h ? d?.providerPayload?.openaiCompatibleMessage : null, m = Om(Array.isArray(p?.tool_calls) && p.tool_calls.some((T) => xs(T)) ? p.tool_calls : h && Array.isArray(d?.tool_calls) && d.tool_calls.some((T) => xs(T)) ? d.tool_calls : null);
    if (m) {
      const T = X(p) ? p : d;
      (!X(T) || !nd.has(T)) && (X(T) && nd.add(T), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: m.index,
        toolName: m.toolName,
        reason: m.reason
      })), s = !0;
      return;
    }
    const g = h ? mo(d?.tool_calls) : [], _ = h ? Ja(d) : null, y = Array.isArray(_?.tool_calls) ? _.tool_calls : [], E = y.length > 0 && C0(_);
    if (zI(_, f, r)) {
      i.push(od({
        ..._,
        ...g.length && !E ? { tool_calls: g } : {}
      }, t));
      return;
    }
    const C = {
      role: d.role,
      content: d.content
    };
    n && typeof _?.reasoning_content == "string" && (C.reasoning_content = _.reasoning_content), d.role === "tool" && d.tool_call_id && (C.tool_call_id = d.tool_call_id), E ? C.tool_calls = y : g.length && (C.tool_calls = g), i.push(od(C, t));
  });
  const u = et(i), c = String(e.systemPrompt || "").trim();
  if (c) if (u[0]?.role === "system") {
    const d = String(u[0].content || "").trim();
    u[0] = {
      ...u[0],
      content: [c, d === c ? "" : d].filter(Boolean).join(`

`)
    };
  } else u.unshift({
    role: "system",
    content: c
  });
  return ks(u, t);
}
function Ni(e) {
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
function Ls(e, t = "") {
  const n = /* @__PURE__ */ new Map(), o = [];
  (Array.isArray(e.messages) ? e.messages : []).forEach((i) => {
    if (i.role === "assistant") {
      const s = I0(i);
      if (s.length) {
        const u = Ja(i), c = typeof u?.content == "string" ? u.content : String(i.content || ""), d = s.map((f, h) => {
          const p = f.function?.name || "", m = f.id || `tool-call-${h + 1}`;
          return p && n.set(m, p), `<tool_call>${JSON.stringify({
            id: m,
            name: p,
            arguments: y0(f.function.arguments)
          })}</tool_call>`;
        }).join(`
`);
        o.push({
          role: "assistant",
          content: [c, d].filter(Boolean).join(`

`)
        });
        return;
      }
    }
    if (i.role === "tool") {
      const s = String(i.toolName || i.tool_name || "").trim() || n.get(i.tool_call_id || "") || "unknown_tool";
      i.tool_call_id && n.delete(i.tool_call_id);
      const u = String(i.content || "");
      o.push({
        role: "user",
        content: [
          "<tool_result>",
          "这是系统工具执行结果，不是用户新发言。",
          `name: ${s}`,
          "content:",
          u,
          "</tool_result>"
        ].join(`
`)
      });
      return;
    }
    o.push({
      role: i.role,
      content: i.content
    });
  });
  const r = Rf(o, () => Ni({
    ...e,
    systemPrompt: ""
  }));
  if (r.found) return ks(r.messages, t);
  if (!o.length || o[0].role !== "system") o.unshift({
    role: "system",
    content: Ni(e)
  });
  else {
    const i = String(o[0].content || "").trim(), s = String(e.systemPrompt || "").trim();
    o[0] = {
      ...o[0],
      content: [Ni(e), i === s ? "" : i].filter(Boolean).join(`

`)
    };
  }
  return ks(o, t);
}
function rd(e, t, n) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: z(n) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Gn(e, t = []) {
  return z(e) ? t : [];
}
function Fm(e, t, n) {
  !e || !t || n === void 0 || (e[t] = Po(e[t], n, t));
}
function Ur(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (X(n)) {
      const o = X(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([r, i]) => {
        Ur(o, r, i);
      }), e[t] = o;
      return;
    }
    if (typeof n == "string" && Ds.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || Fm(e, t, n);
  }
}
function N0(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const o = Number(n?.index ?? 0), r = { ...e.tool_calls[o] || {} };
    Object.entries(n || {}).forEach(([i, s]) => {
      if (i !== "index" && !(i === "function" && s == null)) {
        if (i === "function" && X(s)) {
          r.function = X(r.function) ? { ...r.function } : {}, Object.entries(s).forEach(([u, c]) => {
            Ur(r.function, u, c);
          });
          return;
        }
        Ur(r, i, s);
      }
    }), e.tool_calls[o] = r;
  }));
}
function Us(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([o, r]) => {
    o === "delta" || o === "finish_reason" || o === "index" || o === "logprobs" || Fm(e, o, r);
  });
  const n = X(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([o, r]) => {
    if (o === "tool_calls") {
      N0(e, r);
      return;
    }
    Ur(e, o, r);
  });
}
function Qe(e = {}) {
  return hn(e?.content);
}
function Gt(e = {}) {
  return Va(e?.tool_calls || []);
}
function k0(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return X(JSON.parse(e));
  } catch {
    return !1;
  }
}
function Om(e) {
  if (!Array.isArray(e) || !e.some((t) => xs(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], o = X(n?.function) ? n.function : null, r = String(o?.name || "").trim();
    let i = "";
    if (!X(n) || !o ? i = "invalid_function_shape" : r ? k0(o.arguments) ? E0(n) && (i = "invalid_thought_signature") : i = "invalid_function_arguments" : i = "missing_function_name", i) return {
      index: t,
      toolName: r,
      reason: i
    };
  }
  return null;
}
function ln(e = {}) {
  const t = Om(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function D0(e, t) {
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
function $0(e, t) {
  const n = String(e || "").trim();
  if (n && (n.startsWith("{") || n.startsWith("["))) try {
    const o = JSON.parse(n), r = o?.error?.message || o?.message;
    if (typeof r == "string" && r.trim()) return r.trim();
  } catch {
  }
  return n || `OpenAI 兼容流式请求失败（HTTP ${t}）`;
}
function L0(e, t, n) {
  return {
    transport: "json",
    id: e?.id ?? null,
    model: e?.model ?? null,
    topLevelKeys: Object.keys(e || {}),
    choiceCount: Array.isArray(e?.choices) ? e.choices.length : 0,
    choiceKeys: Object.keys(t || {}),
    finishReason: t?.finish_reason ?? null,
    contentLength: hn(n?.content).length,
    toolCallCount: Array.isArray(n?.tool_calls) ? n.tool_calls.length : 0,
    refusal: n?.refusal ?? null,
    usage: e?.usage ?? null,
    error: e?.error ?? null
  };
}
function id(e, t, n) {
  return {
    transport: "stream",
    model: n ?? null,
    finishReason: t ?? null,
    contentLength: Qe(e).length,
    toolCallCount: Gt(e).length,
    refusal: e?.refusal ?? null
  };
}
var U0 = class {
  constructor(e) {
    this.config = e, this.auth = Br("openai-compatible", e.apiKey), this.client = new H({
      ...this.auth.sdkOptions,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = j("openai-compatible", this.config, e.reasoning)) {
    const n = t, o = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, r = !o && Array.isArray(e.tools) && e.tools.length ? e.tools : null, i = KI({
      ...this.config,
      provider: "openai-compatible"
    }, r, n), s = {
      model: this.config.model,
      messages: o ? Ls(e, this.config.model) : $s(e, this.config.model, { preserveReasoningContent: i }),
      ...r ? {
        tools: r,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? P0(this.config.model) ? { max_completion_tokens: e.maxTokens } : { max_tokens: e.maxTokens } : {}
    };
    return i && (s.tool_choice === "required" || s.tool_choice?.type === "function") && (s.tool_choice = "auto"), !yo({
      ...this.config,
      provider: "openai-compatible"
    }, n) && typeof e.temperature == "number" && (s.temperature = e.temperature), Um(s, n);
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = t.effectiveReasoning || j("openai-compatible", this.config, e.reasoning), r = {
      ...t.body || this.buildRequestBody(e, o),
      ...n ? { stream: !0 } : {}
    }, i = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), s = {
      ...Object.hasOwn(r, "reasoning_effort") ? { reasoning_effort: r.reasoning_effort } : {},
      ...Object.hasOwn(r, "thinking") ? { thinking: r.thinking } : {}
    };
    return { ...ho({
      provider: "openai-compatible",
      model: this.config.model,
      transport: "openai-compatible",
      url: `${i}/chat/completions`,
      headers: this.auth.requestHeaders,
      body: r,
      sdk: n ? "client.chat.completions.create(..., { stream: true })" : "client.chat.completions.create",
      effectiveConfig: {
        ...wt(e, {
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
      const g = await r.text().catch(() => ""), _ = new Error($0(g, r.status));
      throw _.status = r.status, _.body = g, _;
    }
    const i = { role: "assistant" };
    let s, u = this.config.model;
    await D0(r, (g) => {
      if (g?.error) throw new H.APIError(void 0, g.error, void 0, r.headers);
      u = g?.model || u;
      const _ = g?.choices?.[0];
      Us(i, _), _?.finish_reason && (s = _.finish_reason);
      const y = De(Qe(i)), E = Gt(i), C = E.length ? E : Ns(y.cleaned);
      rd(e, {
        text: E.length ? y.cleaned : Lt(y.cleaned, { streaming: !0 }),
        thoughts: Gn(n, Tt(i, _).concat(y.thoughts)),
        ...C.length ? { toolCalls: C } : {},
        ...!E.length && C.length ? { toolCallDraft: !0 } : {}
      }, n);
    }), lt("openai", s, !!i.refusal, De(Qe(i)).cleaned, id(i, s, u)), ln(i);
    const c = uo(i), d = Gt(i), f = De(Qe(i)), h = Tt(i, {});
    f.thoughts.forEach((g) => h.push(g));
    const p = d.length ? [] : lo(e, f.cleaned, i), m = [...d, ...p];
    return {
      text: d.length ? f.cleaned : Lt(f.cleaned),
      toolCalls: m,
      thoughts: Gn(n, h),
      finishReason: s,
      model: u,
      provider: "openai-compatible",
      providerPayload: c,
      ...fn(e, i)
    };
  }
  async chat(e) {
    const t = {};
    try {
      return await this.runChat(e, t);
    } catch (n) {
      throw ra(n, t.requestInspection);
    }
  }
  async runChat(e, t) {
    const n = j("openai-compatible", this.config, e.reasoning), o = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, r = typeof e.onStreamProgress == "function", i = this.buildRequestBody(e, n), s = this.inspectRequest(e, {
      body: i,
      effectiveReasoning: n
    });
    t.requestInspection = s;
    const u = async (C) => {
      try {
        return await C(i);
      } catch (T) {
        throw T && typeof T == "object" && (T.requestInspection = s), T;
      }
    };
    if (r) {
      if (!o) return {
        ...await u((K) => this.streamNativeChatCompletions(e, K, n)),
        requestInspection: s
      };
      const C = await u((K) => this.client.chat.completions.create({
        ...K,
        stream: !0
      }, { signal: e.signal })), T = { role: "assistant" };
      let I, L = this.config.model, w;
      for await (const K of C) {
        L = K.model || L;
        const _e = K.choices?.[0];
        Us(T, _e), _e?.finish_reason && (I = _e.finish_reason);
        const ze = De(Qe(T)), xe = Gt(T), fe = xe.length ? xe : Ns(ze.cleaned);
        rd(e, {
          text: xe.length ? ze.cleaned : Lt(ze.cleaned, { streaming: !0 }),
          thoughts: Gn(n, Tt(T, _e).concat(ze.thoughts)),
          ...fe.length ? { toolCalls: fe } : {},
          ...!xe.length && fe.length ? { toolCallDraft: !0 } : {}
        }, n);
      }
      lt("openai", I, !!T.refusal, De(Qe(T)).cleaned, id(T, I, L));
      const k = (typeof C.finalChatCompletion == "function" ? await C.finalChatCompletion() : null)?.choices?.[0] || null, b = k?.message || T;
      ln(b);
      const x = x0(T, Lr(b, k || {}));
      ln(x), w = uo(x);
      const P = Gt(x), F = De(Qe(x)), Y = Tt(x, k || {});
      F.thoughts.forEach((K) => Y.push(K));
      const V = P.length ? [] : lo(e, F.cleaned, b, s), W = [...P, ...V];
      return {
        text: P.length ? F.cleaned : Lt(F.cleaned),
        toolCalls: W,
        thoughts: Gn(n, Y),
        finishReason: I,
        model: L,
        provider: "openai-compatible",
        providerPayload: w,
        requestInspection: s,
        ...fn(e, b)
      };
    }
    const c = await u((C) => this.client.chat.completions.create(C, { signal: e.signal })), d = c.choices?.[0] || {}, f = d.message || {};
    lt("openai", d.finish_reason, !!f.refusal, De(hn(f.content)).cleaned, L0(c, d, f)), ln(f);
    const h = Tt(f, d), p = Va(f.tool_calls || []), m = De(hn(f.content));
    m.thoughts.forEach((C) => h.push(C));
    const g = p.length ? [] : lo(e, m.cleaned, f, s), _ = [...p, ...g], y = p.length ? m.cleaned : Lt(m.cleaned), E = Lr(f, d);
    return {
      text: y,
      toolCalls: _,
      thoughts: Gn(n, h),
      finishReason: d.finish_reason,
      model: c.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: uo(E),
      requestInspection: s,
      ...fn(e, f)
    };
  }
};
function F0(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Ka(e) {
  const t = F0(Array.isArray(e) ? e : []);
  return Array.isArray(t) ? (t.forEach((n) => {
    !n || typeof n != "object" || Array.isArray(n) || (n.type === "function_call" && delete n.parsed_arguments, n.type === "message" && Array.isArray(n.content) && n.content.forEach((o) => {
      !o || typeof o != "object" || Array.isArray(o) || delete o.parsed;
    }));
  }), t) : [];
}
function Gm(e, t) {
  return {
    type: "message",
    role: e,
    content: O0(t)
  };
}
function Fr(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function O0(e) {
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
function Or(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function sd(e, t = [], n = {}) {
  (t || []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        Or(e, n.reasoning || "推理文本", o.text);
        return;
      }
      o.type === "summary_text" && Or(e, n.summary || "推理摘要", o.text);
    }
  });
}
function G0(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (sd(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), sd(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function B0(e) {
  const t = [String(e.systemPrompt || "").trim(), ...et(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function Bm(e) {
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
function q0(e) {
  if (e && typeof e == "object" && !Array.isArray(e) && !Object.prototype.hasOwnProperty.call(e, "choices") && Array.isArray(e.output)) return;
  const t = /* @__PURE__ */ new Error("当前端点返回的不是 Responses API，请改用 OpenAI 兼容。");
  throw t.name = "OpenAIResponsesEndpointMismatchError", t.code = "OPENAI_RESPONSES_ENDPOINT_MISMATCH", t;
}
function ki(e, t, n) {
  const o = /* @__PURE__ */ new Error(e === "incomplete" ? "Responses 回复未完整生成。" : e === "failed" ? "Responses 生成失败。" : "Responses 未确认生成完成。");
  o.name = "OpenAIResponsesTerminationError", o.code = e === "incomplete" ? "OPENAI_RESPONSES_INCOMPLETE" : e === "failed" ? "OPENAI_RESPONSES_FAILED" : "OPENAI_RESPONSES_UNFINISHED", o.reason = t;
  const r = Bm(n);
  return r && (o.partialResponse = {
    text: r,
    finishReason: t || e,
    truncated: t === "max_output_tokens"
  }), o;
}
function H0(e) {
  const t = [];
  for (const n of et(e.messages || []))
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
        t.push(...Ka(n.providerPayload.openAIResponseOutput));
        continue;
      }
      if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
        n.content?.trim() && t.push(Fr(n.content)), n.tool_calls.forEach((o, r) => {
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
        t.push(Fr(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? Gm(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function V0(e) {
  const t = [];
  for (const n of et(e.messages || [])) {
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
      t.push(...Ka(n.providerPayload.openAIResponseOutput));
      continue;
    }
    if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
      n.content?.trim() && t.push(Fr(n.content)), n.tool_calls.forEach((o, r) => {
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
      t.push(Fr(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? Gm(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function J0(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function K0(e) {
  if (e?.status === 401 || e?.status === 403) return !1;
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function W0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    activity: t.activity,
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft === !0 ? { toolCallDraft: !0 } : {}
  });
}
function Di(e, t) {
  const [n = "0", o = "0"] = String(e || "").split(":"), [r = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(r) || Number(o) - Number(i);
}
var z0 = class {
  constructor(e) {
    this.config = e, this.auth = Br("openai-responses", e.apiKey), this.client = new H({
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
      instructions: t ? void 0 : B0(e) || void 0,
      input: t ? V0(e) : H0(e),
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
    return !yo({
      ...this.config,
      provider: "openai-responses"
    }, o) && typeof e.temperature == "number" && (r.temperature = e.temperature), o.mode === "on" || o.mode === "off" ? r.reasoning = {
      effort: o.mode === "off" ? "none" : o.effort,
      ...o.mode === "on" && z(o) ? { summary: "auto" } : {}
    } : z(o) && (r.reasoning = { summary: "auto" }), o.mode !== "off" && o.profileId.startsWith("openai-") && (r.include = ["reasoning.encrypted_content"]), r;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = t.legacySystemInInput === !0, r = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = t.effectiveReasoning || j("openai-responses", this.config, e.reasoning), s = t.body || this.buildRequestBody(e, o, i);
    return ho({
      provider: "openai-responses",
      model: this.config.model,
      transport: "openai-responses",
      url: `${r}/responses`,
      headers: this.auth.requestHeaders,
      body: s,
      sdk: n ? "client.responses.stream" : "client.responses.create",
      effectiveConfig: wt(e, {
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
      if (q0(m), m.status !== "completed") throw ki(m.status, m.incomplete_details?.reason, m);
      const g = m.output;
      return {
        output: g,
        thoughts: z(t) ? G0(g) : [],
        toolCalls: g.filter((_) => _.type === "function_call" && _.name).map((_, y) => ({
          id: _.call_id || `response-tool-${y + 1}`,
          name: _.name || "",
          arguments: _.arguments || "{}"
        })),
        text: Bm(m)
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
        const y = this.client.responses.stream(_, { signal: e.signal }), E = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map(), T = /* @__PURE__ */ new Map(), I = /* @__PURE__ */ new Map();
        let L = "waiting", w, k;
        for (const P of [
          "response.completed",
          "response.incomplete",
          "response.failed"
        ]) y.on(P, (F) => {
          k = F;
        });
        const b = (P, F) => {
          L = P, w = F;
          const Y = [];
          z(t) && (Array.from(C.entries()).sort(([V], [W]) => Di(V, W)).forEach(([, V]) => Or(Y, "推理文本", V)), Array.from(T.entries()).sort(([V], [W]) => Di(V, W)).forEach(([, V]) => Or(Y, "推理摘要", V))), W0(e, {
            activity: L,
            text: Array.from(E.entries()).sort(([V], [W]) => Di(V, W)).map(([, V]) => V).join(`
`).trim(),
            thoughts: Y,
            ...I.size ? {
              toolCalls: Array.from(I.entries()).sort(([V], [W]) => V - W).map(([, V]) => ({
                id: V.call_id,
                name: V.name,
                arguments: V.arguments
              })),
              toolCallDraft: !0
            } : {}
          });
        };
        y.on("response.output_item.added", (P) => {
          if (P.item.type === "reasoning") {
            b("thinking", P.output_index);
            return;
          }
          P.item.type === "function_call" && (I.set(P.output_index, { ...P.item }), b("tool-call", P.output_index));
        }), y.on("response.output_item.done", (P) => {
          P.item.type === "reasoning" && w === P.output_index && L === "thinking" && b("waiting", P.output_index);
        }), y.on("response.function_call_arguments.delta", (P) => {
          const F = I.get(P.output_index);
          F && (F.arguments += P.delta, b("tool-call", P.output_index));
        }), y.on("response.function_call_arguments.done", (P) => {
          const F = I.get(P.output_index);
          F && (F.arguments = P.arguments, b("tool-call", P.output_index));
        }), y.on("response.output_text.delta", (P) => {
          if (!P.delta) return;
          const F = `${P.output_index}:${P.content_index}`;
          E.set(F, `${E.get(F) || ""}${P.delta}`), b("replying", P.output_index);
        }), y.on("response.reasoning_text.delta", (P) => {
          if (!P.delta) return;
          const F = `${P.output_index}:${P.content_index}`;
          C.set(F, `${C.get(F) || ""}${P.delta}`), b("thinking", P.output_index);
        }), y.on("response.reasoning_summary_text.delta", (P) => {
          if (!P.delta) return;
          const F = `${P.output_index}:${P.summary_index}`;
          T.set(F, `${T.get(F) || ""}${P.delta}`), b("thinking", P.output_index);
        });
        const x = await y.finalResponse();
        if (k?.type !== "response.completed") throw ki(k?.type?.slice(9), k?.response?.incomplete_details?.reason, x);
        if (x.status !== "completed") throw ki(x.status, x.incomplete_details?.reason, x);
        return x;
      } catch (y) {
        throw r(y);
      }
    }, d = !J0(this.config.baseUrl), f = typeof e.onStreamProgress == "function" ? c : u;
    let h, p;
    try {
      h = await f(!1, "initial"), p = i(h);
    } catch (m) {
      if (!d || !K0(m)) throw r(m);
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
      finishReason: h.incomplete_details?.reason || h.status || "stop",
      refused: p.output.some((m) => m?.type === "message" && Array.isArray(m.content) && m.content.some((g) => g?.type === "refusal")),
      model: h.model || this.config.model,
      provider: "openai-responses",
      providerPayload: p.output.length ? { openAIResponseOutput: Ka(p.output) } : void 0,
      requestInspection: o()
    };
  }
};
async function Y0(e, t) {
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
var Fs = null;
function vR(e) {
  Fs = typeof e == "function" ? e : null;
}
async function X0() {
  if (!Fs) throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return await Fs();
}
var Vt = "openai", qm = "claude", Hm = "makersuite", Q0 = "/api/backends/chat-completions/status", Z0 = "/api/backends/chat-completions/generate", j0 = Object.freeze({
  [qm]: "https://api.anthropic.com/v1",
  [Hm]: "https://generativelanguage.googleapis.com"
}), Mo = X0;
function eb(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function tb(e = "") {
  return qr(e) === "openai";
}
function nb(e, t) {
  const n = eb(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
async function Vm(e = Mo) {
  if (typeof e != "function") throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(e() || {}),
    Accept: "application/json"
  };
}
function ob(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, o]) => {
    t[n] = /authorization|cookie|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : o;
  }), t;
}
async function Wa(e = {}, t = !1, n = Mo) {
  const o = await Vm(n), r = {
    url: Z0,
    method: "POST",
    headers: ob(o),
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
async function rb(e = {}, t = !1) {
  return await Wa(e, t);
}
function ib(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function sb(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function ab() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function ad(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function ld(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => ad(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => ad(n));
}
function lb(e = "") {
  const t = String(e || ""), n = ld((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), o = ld(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), r = n || o;
  return r.length > 240 ? `${r.slice(0, 237)}...` : r;
}
function ub(e = null) {
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
function cb(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function db(e = "") {
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
function pn(e = "", t = "", n = null) {
  if (sb(e)) return ab();
  const o = ub(n);
  if (ib(e) || /\btext\/html\b/i.test(o.contentType)) {
    const r = cb(o), i = lb(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      r ? `（${r}）` : "",
      i ? `：${i}` : ""
    ].join("");
  }
  return db(e) || String(e || t || "").trim();
}
function Jm(e = {}, t = Vt) {
  const n = nb(e.baseUrl, t), o = String(e.apiKey || "").trim(), r = j0[t] || "", i = n || (o ? r : ""), s = { chat_completion_source: t || "openai" };
  return i && (s.reverse_proxy = i), o && (s.proxy_password = o), s;
}
function fb(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function hb(e = {}, t = Vt) {
  return Jm(e, t);
}
function za(e = {}, t = {}, n = [], o = !1, r = Vt) {
  const i = t.maxTokens, s = r === "openai" && tb(e.model);
  return fb({
    ...Jm(e, r),
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
function pb(e = {}, t = {}, n = [], o = !1) {
  return za(e, t, n, o, Vt);
}
function mb(e = {}, t = {}, n = [], o = !1) {
  return za(e, t, n, o, qm);
}
function gb(e = {}, t = {}, n = [], o = !1) {
  return za(e, t, n, o, Hm);
}
function Ya(e) {
  const t = e || globalThis.fetch;
  if (typeof t != "function") throw new Error("当前运行环境没有可用的 fetch，无法调用酒馆后端。");
  return t;
}
async function _b(e = {}, t = Vt, n = {}, o = {}) {
  const r = await Ya(o.fetch)(Q0, {
    method: "POST",
    headers: await Vm(o.requestHeadersProvider),
    body: JSON.stringify(hb(e, t)),
    signal: n.signal
  }), i = await r.text();
  let s = null;
  try {
    s = i ? JSON.parse(i) : {};
  } catch (c) {
    throw new Error(`酒馆后端模型列表拉取失败：${pn(i, String(c?.message || c), r)}`);
  }
  if (!r.ok || s?.error) {
    const c = pn(s?.message || s?.error?.message || i, `HTTP ${r.status}`, r);
    throw new Error(`酒馆后端模型列表拉取失败：${c}`);
  }
  const u = Array.isArray(s?.data) ? s.data.map((c) => String(c?.id || c?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(u)];
}
async function Km(e = {}, t = Vt, n = {}) {
  return await _b(e, t, n, { requestHeadersProvider: Mo });
}
async function yb(e = {}, t = {}) {
  return await Km(e, Vt, t);
}
async function vb(e = {}, t = {}, n = {}) {
  const o = await Wa(e, !1, n.requestHeadersProvider);
  typeof t.onRequest == "function" && t.onRequest(o);
  const r = await Ya(n.fetch)(o.url, {
    method: o.method,
    headers: o.rawHeaders || o.headers,
    body: JSON.stringify(o.body),
    signal: t.signal
  }), i = await r.text();
  let s = null;
  try {
    s = i ? JSON.parse(i) : {};
  } catch (u) {
    const c = /* @__PURE__ */ new Error(`酒馆后端生成失败：${pn(i, String(u?.message || u), r)}`);
    throw c.status = r.status, c.body = i, c;
  }
  if (!r.ok || s?.error) {
    const u = pn(s?.error?.message || s?.message || i, `HTTP ${r.status}`, r), c = /* @__PURE__ */ new Error(`酒馆后端生成失败：${u}`);
    throw c.status = r.status, c.error = s?.error, c;
  }
  return s;
}
async function Ab(e = {}, t = {}) {
  return await vb(e, t, { requestHeadersProvider: Mo });
}
async function Tb(e = {}, t, n = {}, o = {}) {
  const r = await Wa(e, !0, o.requestHeadersProvider);
  typeof n.onRequest == "function" && n.onRequest(r);
  const i = await Ya(o.fetch)(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!i.ok) {
    const s = await i.text().catch(() => ""), u = new Error(pn(s, `酒馆后端流式生成失败：HTTP ${i.status}`, i));
    throw u.status = i.status, u.body = s, u;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await Y0(i, (s) => {
    if (s?.error) {
      const u = pn(s.error?.message || s.message || JSON.stringify(s.error), "酒馆后端流式生成失败");
      throw new Error(u);
    }
    t(s);
  });
}
async function Sb(e = {}, t, n = {}) {
  return await Tb(e, t, n, { requestHeadersProvider: Mo });
}
var Eb = Object.freeze([
  "buildHostChatCompletionGenerateRequest",
  "createHostChatCompletion",
  "streamHostChatCompletion"
]);
function li(e) {
  if (!e || !Eb.every((t) => typeof e[t] == "function")) throw new TypeError("酒馆渠道必须注入有效的 Host Client。");
  return e;
}
var Xa = Object.freeze({
  buildHostChatCompletionGenerateRequest: rb,
  fetchHostChatCompletionsModels: Km,
  fetchHostOpenAICompatibleModels: yb,
  createHostChatCompletion: Ab,
  streamHostChatCompletion: Sb
});
function qt(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Cb(e) {
  const t = String(e || "").trim();
  if (!t || t === "auto") return "auto";
  if (t === "required") return "any";
  if (t === "none") return "none";
  throw new Error(`酒馆托管 Claude 不支持 tool_choice：${t}。仅支持 auto/required/none。`);
}
function wb(e = {}, t = {}, n = j("sillytavern-claude", e, t.reasoning)) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const o = Cb(t.toolChoice), r = n.profileId === "sillytavern-claude-manual" || n.profileId === "sillytavern-claude-adaptive-conditional";
  return {
    toolChoice: o,
    reasoningDisabledForForcedTool: o === "any" && n.mode === "on" && r
  };
}
var Ib = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function rr(e = {}, t = {}, n = {}, o) {
  const r = o || j("sillytavern-claude", e, t.reasoning);
  return n.reasoningDisabledForForcedTool ? {
    ...r,
    mode: "off",
    output: "hide"
  } : r;
}
function bb(e = {}, t = {}, n = {}) {
  return wt(e, {
    reasoning: n,
    effort: n.mode === "on" ? n.effort : "",
    controlFields: t.controlFields || {}
  });
}
function Rb(e = {}, t = {}) {
  return { toolChoice: String(t.toolChoice || "") };
}
function Wm(e = "") {
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
function Pb(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const o = Wm(t.function.arguments || "{}");
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
function Mb(e = []) {
  const t = Array.isArray(e) ? qt(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function xb(e = {}) {
  const t = et(Array.isArray(e.messages) ? e.messages : []), n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = qt(r) || {}, s = Mb(i?.providerPayload?.anthropicContent), u = Pb(i.tool_calls);
    delete i.providerPayload, i.role === "assistant" && s && u.length ? (delete i.tool_calls, i.content = s.filter((c) => c?.type !== "tool_use").concat(u)) : i.role === "assistant" && s && (delete i.tool_calls, i.content = s), n.push(i);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function Nb(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const o = Wm(t.inputJson);
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
      const n = qt(t.input);
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
    } : qt(t) || null;
  }).filter(Boolean);
}
function kb(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: qt(t.input) || {}
  } : qt(t) || null).filter(Boolean);
}
function Db(e = []) {
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
function $b(e = [], t = {}) {
  const n = Nb(e), o = n.filter((i) => i.type === "tool_use" && i.name).map((i, s) => ({
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
    finishReason: lt("anthropic", t.finishReason, !1, r),
    model: t.model || "",
    provider: "sillytavern-claude",
    providerPayload: n.length ? { anthropicContent: kb(n) } : void 0
  };
}
function Lb(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Ub(e, t, n = {}) {
  const o = [];
  let r, i = !1, s = n.model || "";
  const u = (d, f = {}) => {
    const h = Number.isInteger(Number(d)) ? Number(d) : o.length;
    return o[h] ? o[h] = {
      ...o[h],
      ...f
    } : o[h] = { ...f }, o[h];
  }, c = () => {
    const d = Db(o);
    Lb(e, {
      text: d.text,
      thoughts: z(t) ? d.thoughts : [],
      ...Array.isArray(d.toolCalls) ? { toolCalls: d.toolCalls } : {},
      ...d.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(d = {}) {
      if (d.type === "message_stop" && (i = !0), d?.message?.model && (s = d.message.model), d.type === "content_block_start") {
        u(d.index, qt(d.content_block) || {}), c();
        return;
      }
      if (d.type === "content_block_delta") {
        const f = u(d.index), h = d.delta || {};
        h.type === "text_delta" ? (f.type = f.type || "text", f.text = `${f.text || ""}${h.text || ""}`) : h.type === "input_json_delta" ? (f.type = f.type || "tool_use", f.inputJson = `${f.inputJson || ""}${h.partial_json || ""}`) : h.type === "thinking_delta" ? (f.type = f.type || "thinking", f.thinking = `${f.thinking || ""}${h.thinking || ""}`) : h.type === "signature_delta" && (f.signature = `${f.signature || ""}${h.signature || ""}`), c();
        return;
      }
      d.type === "message_delta" && (r = d.delta?.stop_reason || r);
    },
    result() {
      return $b(o, {
        finishReason: i ? r : void 0,
        model: s,
        includeReasoningOutput: z(t)
      });
    }
  };
}
var Fb = class {
  constructor(e, t = Xa) {
    this.config = e, this.hostClient = li(t);
  }
  buildMessages(e) {
    return xb(e);
  }
  resolveToolProtocol(e, t) {
    return wb(this.config, e, t);
  }
  buildPayload(e, t = this.resolveToolProtocol(e), n = rr(this.config, e, t)) {
    const r = this.buildMessages(e), i = {
      ...e,
      toolChoice: t.toolChoice,
      reasoning: n,
      temperature: yo({
        ...this.config,
        provider: "sillytavern-claude"
      }, n) ? void 0 : e.temperature
    }, s = mb(this.config, i, r, !0);
    return n.mode === "on" ? (s.reasoning_effort = n.effort, s.include_reasoning = z(n)) : n.mode === "off" ? (s.reasoning_effort = "auto", s.include_reasoning = !1) : (s.reasoning_effort = "auto", s.include_reasoning = z(n)), s;
  }
  async inspectRequest(e, t = {}) {
    const n = j("sillytavern-claude", this.config, e.reasoning), o = t.protocol || this.resolveToolProtocol(e, n), r = t.effectiveReasoning || rr(this.config, e, o, n), i = t.payload || this.buildPayload(e, o, r), s = await this.hostClient.buildHostChatCompletionGenerateRequest(i, !0);
    return this.buildRequestInspection(s, o, e, r);
  }
  buildRequestInspection(e, t = {}, n = {}, o = rr(this.config, n, t)) {
    const r = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Bt(e),
      effectiveConfig: {
        ...Rb(n, t),
        ...bb(n, {
          ...t,
          controlFields: r
        }, o)
      },
      ...t.reasoningDisabledForForcedTool ? { notices: [Ib] } : {}
    };
  }
  async chat(e) {
    const t = j("sillytavern-claude", this.config, e.reasoning), n = this.resolveToolProtocol(e, t), o = rr(this.config, e, n, t), r = this.buildPayload(e, n, o);
    let i = null;
    const s = (u) => {
      i = this.buildRequestInspection(u, n, e, o);
    };
    try {
      const u = Ub(e, o, this.config);
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
function Qa(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function mn(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = Qa(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function Ob(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((r) => mn(r)).filter((r) => Array.isArray(r.parts) && r.parts.length);
  const n = e?.providerPayload?.googleContent, o = mn(n);
  return o.parts.length ? [o] : [];
}
function Gb(e = {}) {
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
function Bb(e = {}, t = 0) {
  const n = mn(e);
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
    const u = Gb(s.inlineData);
    u && o.content.push(u);
  }), i.length && o.content.push({
    type: "tool_calls",
    tool_calls: i
  }), r && o.content.some((s) => s?.type === "text") && (o.signature = r), o.content.length ? o : null;
}
function qb(e = {}) {
  const t = et(Array.isArray(e.messages) ? e.messages : []), n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = Ob(r);
    if (r.role === "assistant" && i.length) {
      i.forEach((u, c) => {
        const d = Bb(u, c);
        d && n.push(d);
      });
      return;
    }
    const s = Qa(r) || {};
    delete s.providerPayload, n.push(s);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function Hb(e = {}) {
  return mn(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function Vb(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function Jb(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function Kb(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function Wb(e, t) {
  const n = String(t || ""), o = String(e || "");
  return n ? !o || n.startsWith(o) ? n : o.endsWith(n) ? o : `${o}${n}` : o;
}
function zb(e = [], t = []) {
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
function Yb(e) {
  const t = mn(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function Xb(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Qb(e, t, n = {}) {
  let o = "", r = [], i = [], s, u = n.model || "";
  const c = [];
  return {
    accept(d = {}) {
      u = d.model || d.modelVersion || u, s = d?.candidates?.[0]?.finishReason || s;
      const f = Hb(d);
      f.parts.length && c.push(...Qa(f.parts) || []), o = Wb(o, Vb(f)), r = zb(r, Kb(f));
      const h = z(t) ? Jb(f) : [];
      h.length && (i = h), Xb(e, {
        text: o,
        thoughts: i,
        ...r.length ? {
          toolCalls: r,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const d = mn({
        role: "model",
        parts: c.length ? c : o ? [{ text: o }] : []
      });
      return {
        text: o,
        toolCalls: r,
        thoughts: i,
        finishReason: lt("google", s, !1, o),
        model: u,
        provider: "sillytavern-google",
        providerPayload: Yb(d)
      };
    }
  };
}
var Zb = class {
  constructor(e, t = Xa) {
    this.config = e, this.hostClient = li(t);
  }
  buildMessages(e) {
    return qb(e);
  }
  buildPayload(e, t = j("sillytavern-google", this.config, e.reasoning)) {
    const n = t, o = !0, r = this.buildMessages(e), i = gb(this.config, e, r, o);
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
      request: Bt(e),
      effectiveConfig: wt(t, {
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
      const i = Qb(e, t, this.config);
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
function jb(e, t, n) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: z(n) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function $i(e, t = [], n = !1) {
  const o = De(e);
  return {
    thinkTagged: o,
    cleanedText: t.length ? o.cleaned : Lt(o.cleaned, { streaming: n })
  };
}
function eR(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var tR = class {
  constructor(e, t = Xa) {
    this.config = e, this.hostClient = li(t);
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? Ls(e, this.config.model) : $s(e, this.config.model);
  }
  buildPayload(e, t = !1, n = j("sillytavern-openai-compatible", this.config, e.reasoning)) {
    const o = n, r = t ? Ls(e, this.config.model) : $s(e, this.config.model), i = {
      ...e,
      temperature: yo({
        ...this.config,
        provider: "sillytavern-openai-compatible"
      }, o) ? void 0 : e.temperature
    };
    return Um(pb(this.config, t ? {
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
      request: Bt(e),
      effectiveConfig: {
        ...wt(t, {
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
      Us(r, m), m.finish_reason && (i = m.finish_reason);
      const g = Gt(r), { thinkTagged: _, cleanedText: y } = $i(Qe(r), g, !0), E = g.length ? g : Ns(_.cleaned);
      jb(e, {
        text: y,
        thoughts: z(n) ? Tt(r, m).concat(_.thoughts) : [],
        ...E.length ? { toolCalls: E } : {},
        ...!g.length && E.length ? { toolCallDraft: !0 } : {}
      }, n);
    }, {
      signal: e.signal,
      onRequest: o.onRequest,
      onResponseAccepted: o.onResponseAccepted
    }), lt("openai", i, !!r.refusal, De(Qe(r)).cleaned), ln(r);
    const u = Gt(r), { thinkTagged: c, cleanedText: d } = $i(Qe(r), u), f = Tt(r, {});
    c.thoughts.forEach((p) => f.push(p));
    const h = u.length ? [] : lo(e, c.cleaned, r);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: z(n) ? f : [],
      finishReason: i,
      model: s,
      provider: "sillytavern-openai-compatible",
      providerPayload: uo(r),
      ...fn(e, r)
    };
  }
  async nonStreamingChat(e, t, n, o = {}) {
    const r = await this.hostClient.createHostChatCompletion(t, {
      signal: e.signal,
      onRequest: o.onRequest
    }), i = r.choices?.[0] || {}, s = i.message || {};
    lt("openai", i.finish_reason, !!s.refusal, De(hn(s.content)).cleaned), ln(s);
    const u = Tt(s, i), c = Va(s.tool_calls || []), { thinkTagged: d, cleanedText: f } = $i(hn(s.content), c);
    d.thoughts.forEach((m) => u.push(m));
    const h = c.length ? [] : lo(e, d.cleaned, s), p = Lr(s, i);
    return {
      text: f,
      toolCalls: [...c, ...h],
      thoughts: z(n) ? u : [],
      finishReason: i.finish_reason,
      model: r.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: uo(p),
      ...fn(e, s)
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
      if (e.allowToolProtocolFallback === !1 || n || !o || !eR(s)) throw s;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await r(this.buildPayload(e, !0, t));
  }
};
function Li(e, t, n) {
  return Object.hasOwn(n, "hostClient") ? new e(t, li(n.hostClient)) : new e(t);
}
function AR(e = {}, t = {}) {
  switch (Id(e.reasoning || {}), e.provider) {
    case "sillytavern-openai-compatible":
      return Li(tR, e, t);
    case "sillytavern-claude":
      return Li(Fb, e, t);
    case "sillytavern-google":
      return Li(Zb, e, t);
    case "openai-responses":
      return new z0(e);
    case "anthropic":
      return new L_(e);
    case "google":
      return new Dw(e);
    default:
      return new U0(e);
  }
}
function nR(e = {}) {
  const t = String(e?.name || "").trim();
  if (typeof e?.arguments == "string") {
    const n = e.arguments;
    try {
      return JSON.parse(n.trim() || "{}"), n;
    } catch {
      return Mm(n, t) || n;
    }
  }
  try {
    return JSON.stringify(e?.arguments || {});
  } catch {
    return "{}";
  }
}
function Os(e = [], t = {}) {
  const n = String(t.fallbackPrefix || "agent-tool").trim() || "agent-tool", o = typeof t.createId == "function" ? t.createId : (r) => `${n}-${Date.now()}-${r + 1}`;
  return (Array.isArray(e) ? e : []).map((r, i) => {
    const s = Object.prototype.hasOwnProperty.call(r || {}, "providerId");
    return {
      id: String(r?.id || o(i) || `${n}-${i + 1}`),
      name: String(r?.name || "").trim(),
      arguments: nR(r),
      ...s ? { providerId: String(r?.providerId || "") } : {}
    };
  }).filter((r) => r.name);
}
function oR(e, t = {}) {
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
function TR(e = {}, t = {}, n = {}) {
  const o = Os(e?.toolCalls, n);
  return o.length ? o : String(e?.provider || t?.provider || "").toLowerCase() !== "google" ? [] : Os(oR(e?.providerPayload, n), n);
}
function SR(e = {}, t = [], n = {}) {
  return {
    role: "assistant",
    content: Object.prototype.hasOwnProperty.call(n, "content") ? String(n.content || "") : String(e.text || ""),
    providerPayload: e.providerPayload,
    tool_calls: Os(t, n).map((o) => ({
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
function ER(e = {}) {
  const t = String(e.toolName || e.tool_name || "").trim();
  return {
    role: "tool",
    tool_call_id: String(e.toolCallId || e.tool_call_id || ""),
    ...t ? { toolName: t } : {},
    content: String(e.content || "")
  };
}
export {
  hR as AGENT_REQUEST_TIMEOUT_MS,
  wg as PROVIDER_OPTIONS,
  sR as REASONING_MODE_OPTIONS,
  Xi as TOOL_PROTOCOL_MARKER,
  SR as buildProviderAssistantToolCallMessage,
  ER as buildProviderToolResultMessage,
  AR as createAgentAdapter,
  gR as getProviderLabel,
  fR as getReasoningEffortOptions,
  dR as getReasoningModeOptions,
  _R as getToolModeLabel,
  mR as isSillyTavernProvider,
  cg as normalizeAgentConfig,
  cR as normalizeAgentSettings,
  Bs as normalizeReasoningConfig,
  Bt as redactRequestSecrets,
  yR as resolveActiveProviderConfig,
  Ys as resolveReasoningCapability,
  TR as resolveResultToolCalls,
  Tr as resolveRuntimeReasoning,
  vR as setHostChatCompletionsRequestHeadersProvider
};
