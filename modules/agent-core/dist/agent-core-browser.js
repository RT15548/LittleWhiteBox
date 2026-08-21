var gm = Object.create, Lc = Object.defineProperty, _m = Object.getOwnPropertyDescriptor, ym = Object.getOwnPropertyNames, vm = Object.getPrototypeOf, Am = Object.prototype.hasOwnProperty, br = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), Tm = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var r = ym(t), i = 0, a = r.length, u; i < a; i++)
      u = r[i], !Am.call(e, u) && u !== n && Lc(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(o = _m(t, u)) || o.enumerable
      });
  return e;
}, Sm = (e, t, n) => (n = e != null ? gm(vm(e)) : {}, Tm(t || !e || !e.__esModule ? Lc(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), Em = "https://api.tavily.com";
function _i(e = "") {
  return String(e || "").trim();
}
function zn(e = "") {
  return String(e || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var L0 = Object.freeze([
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
]), U0 = Object.freeze([Object.freeze({
  value: "hide",
  label: "隐藏"
}), Object.freeze({
  value: "show",
  label: "显示"
})]);
function Im(e = "") {
  return e === "on" || e === "off" ? e : "inherit";
}
function Uc(e = "") {
  return e === "show" ? "show" : "hide";
}
function wm(e) {
  return String(e ?? "").trim().toLowerCase() || void 0;
}
function Cm(e) {
  if (e == null || e === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? Math.floor(t) : void 0;
}
function _s(e = {}) {
  const t = e && typeof e == "object" ? e : {}, n = wm(t.effort), o = Cm(t.budgetTokens);
  return {
    mode: Im(t.mode),
    output: Uc(t.output),
    ...n ? { effort: n } : {},
    ...o !== void 0 ? { budgetTokens: o } : {}
  };
}
function J(e = {}) {
  return Uc(e?.output) === "show";
}
var Fc = "openai-compatible", ys = "默认", Oc = "default", bm = "deny", et = 32e3;
var F0 = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), O0 = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), yi = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: et,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: et,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: et,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: et,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: et,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: et,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: et,
    sendTemperature: !0
  }
};
function Wt() {
  return JSON.parse(JSON.stringify(yi));
}
function gt() {
  return {
    provider: Fc,
    modelConfigs: Wt(),
    permissionMode: Oc
  };
}
function Gc(e = gt()) {
  const t = e && typeof e == "object" ? e : gt();
  return {
    provider: As(t.provider),
    modelConfigs: vs(t.modelConfigs || {})
  };
}
function Bc(e) {
  return e === "full" ? "full" : Oc;
}
function qc(e) {
  return e === "allow" ? "allow" : bm;
}
function xn(e, t = et) {
  const n = Number(e);
  if (!Number.isFinite(n) || n <= 0) {
    const o = Number(t);
    return Number.isFinite(o) && o > 0 ? Math.floor(o) : et;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}
function nt(e) {
  return String(e || "").trim() || "默认";
}
function vs(e = {}) {
  const t = Wt();
  return Object.keys(yi).forEach((n) => {
    const o = e && typeof e[n] == "object" ? e[n] : {}, r = yi[n];
    t[n] = {
      baseUrl: String(o.baseUrl ?? r.baseUrl ?? ""),
      model: String(o.model ?? r.model ?? ""),
      apiKey: String(o.apiKey ?? r.apiKey ?? ""),
      temperature: o.temperature ?? r.temperature,
      maxTokens: xn(o.maxTokens, r.maxTokens),
      sendTemperature: typeof o.sendTemperature == "boolean" ? o.sendTemperature : r.sendTemperature,
      ..."toolMode" in r ? { toolMode: String(o.toolMode || r.toolMode || "native") } : {},
      reasoning: _s(o.reasoning)
    };
  }), t;
}
function As(e) {
  return typeof e == "string" && e.trim() ? e : Fc;
}
function Ts(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function Hc(e = {}, t) {
  const n = {}, o = Ts(e, t);
  return Object.entries(o).forEach(([r, i]) => {
    if (!i || typeof i != "object") return;
    const a = nt(r);
    n[a] = {
      provider: As(i.provider),
      modelConfigs: vs(i.modelConfigs || {}),
      permissionMode: Bc(i.permissionMode)
    };
  }), Object.keys(n).length || (n[ys] = gt()), n;
}
function Vc(e, t) {
  const n = nt(t);
  return e[n] ? n : Object.keys(e)[0];
}
function Jc(e, t, n) {
  const o = nt(t || n);
  return e[o] ? o : e[n] ? n : Object.keys(e)[0];
}
function Ss(e = {}, t = gt()) {
  const n = Gc(t), o = e && typeof e == "object" ? e : {};
  return {
    provider: As(o.provider || n.provider),
    modelConfigs: vs(o.modelConfigs || n.modelConfigs)
  };
}
function Kc(e = {}, t = {}, n = ys, o = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (o !== n) return !0;
  const r = e?.delegateConfig;
  if (!r || typeof r != "object" || Array.isArray(r) || !(typeof r.provider == "string" && r.provider.trim() || r.modelConfigs && typeof r.modelConfigs == "object" && Object.keys(r.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const i = t[n] || gt(), a = Gc(i), u = Ss(r, i);
  return JSON.stringify(u) !== JSON.stringify(a);
}
function Rm(e = {}, t, n, o, r) {
  const i = r(e?.[o]);
  if (i) return i;
  const a = Ts(e, t), u = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(a || {})
  ].map(nt), c = /* @__PURE__ */ new Set();
  for (const d of u) {
    if (c.has(d)) continue;
    c.add(d);
    const h = r(a?.[d]?.[o]);
    if (h) return h;
  }
  return r(e?.delegateConfig?.[o]);
}
function Pm(e = {}, t, n) {
  const o = (u) => String(u || "").trim();
  if (o(e?.tavilyBaseUrl)) return zn(e.tavilyBaseUrl);
  const r = Ts(e, t), i = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(r || {})
  ].map(nt), a = /* @__PURE__ */ new Set();
  for (const u of i) {
    if (a.has(u)) continue;
    a.add(u);
    const c = r?.[u]?.tavilyBaseUrl;
    if (o(c)) return zn(c);
  }
  return o(e?.delegateConfig?.tavilyBaseUrl) ? zn(e.delegateConfig.tavilyBaseUrl) : Em;
}
function Wc(e = {}, t, n) {
  return {
    tavilyApiKey: Rm(e, t, n, "tavilyApiKey", _i),
    tavilyBaseUrl: Pm(e, t, n)
  };
}
function G0(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: o = (p) => String(p || "") } = t, r = nt(e.currentPresetName || e.presetName || "默认"), i = Hc(e, r), a = Vc(i, e.currentPresetName), u = Jc(i, e.delegatePresetName, a), c = i[u] || i[a] || gt(), d = Ss(e.delegateConfig, c), h = Kc(e, i, a, u), f = Wc(e, r, a);
  return {
    enabled: !!e.enabled,
    workspaceFileName: o(e.workspaceFileName || n),
    jsApiPermission: qc(e.jsApiPermission),
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
function Mm(e = {}) {
  const t = nt(e.currentPresetName || e.presetDraftName || "默认"), n = Hc(e, t), o = Vc(n, e.currentPresetName), r = Jc(n, e.delegatePresetName, o), i = n[o] || gt(), a = n[r] || i, u = Ss(e.delegateConfig, a), c = Kc(e, n, o, r), d = Wc(e, t, o);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    updatedAt: Number(e.updatedAt) || 0,
    jsApiPermission: qc(e.jsApiPermission),
    currentPresetName: o,
    delegatePresetName: r,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: nt(e.presetDraftName || o),
    presetNames: Object.keys(n),
    presets: n,
    provider: i.provider,
    modelConfigs: i.modelConfigs,
    permissionMode: Bc(i.permissionMode),
    tavilyApiKey: d.tavilyApiKey,
    tavilyBaseUrl: d.tavilyBaseUrl
  };
}
function xm(e = "") {
  return String(e || "").trim().toLowerCase();
}
function Es(e = "") {
  const t = xm(e);
  return t.includes("deepseek") ? "deepseek" : t.includes("kimi") || t.includes("moonshot") ? "kimi" : t.includes("gemini") ? "gemini" : t.includes("claude") ? "claude" : /(?:^|[/_.-])gpt(?:\d|[/_.-]|$)/.test(t) || /(?:^|[/_.-])o\d+(?:[/_.-]|$)/.test(t) ? "openai" : "";
}
var Nm = Object.freeze({
  minimal: "最小",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "超高",
  max: "最大",
  min: "最小"
});
function zc(e) {
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
function We(e, t, n, o, r = {}) {
  return zc({
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
var Is = zc({
  profileId: "unsupported",
  modes: ["inherit"],
  outputModes: ["hide"],
  intensity: { kind: "none" },
  unsupportedReason: "当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。"
}), ao = Object.freeze(["on"]), ws = Object.freeze([
  "inherit",
  "on",
  "off"
]), Yc = We("openai-gpt-5.6", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "medium", { temperatureOmitModes: ws }), km = We("kimi-k3", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "max", { temperatureOmitModes: ao }), Dm = We("deepseek-thinking", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "high", { temperatureOmitModes: ao }), $m = We("openai-compatible-gemini-latest", [
  "inherit",
  "on",
  "off"
], [
  "minimal",
  "low",
  "medium",
  "high"
], "high", { temperatureOmitModes: ao }), Lm = We("openai-compatible-claude-latest", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: ao }), Um = We("openai-compatible-default", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high"
], "medium", { temperatureOmitModes: ao }), Fm = We("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: ws }), Om = We("sillytavern-claude-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: ws }), Gm = We("google-gemini-3-flash", ["inherit", "on"], [
  "minimal",
  "low",
  "medium",
  "high"
], "high"), Bm = We("sillytavern-google-3-flash", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high"
], "high");
function qm(e = "") {
  switch (Es(e)) {
    case "deepseek":
      return Dm;
    case "kimi":
      return km;
    case "gemini":
      return $m;
    case "claude":
      return Lm;
    case "openai":
      return Yc;
    default:
      return Um;
  }
}
function Cs(e = {}) {
  const t = String(e.provider || "").trim(), n = String(e.model || "").trim().toLowerCase();
  switch (t) {
    case "openai-responses":
      return Yc;
    case "openai-compatible":
    case "sillytavern-openai-compatible":
      return qm(n);
    case "anthropic":
      return Fm;
    case "sillytavern-claude":
      return Om;
    case "google":
      return Gm;
    case "sillytavern-google":
      return Bm;
    default:
      return Is;
  }
}
function B0(e = Is) {
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
function q0(e = Is) {
  return e.intensity?.kind !== "effort" ? [] : e.intensity.values.map((t) => ({
    value: t,
    label: Nm[t] || t
  }));
}
function zr(e, t, n, o = "REASONING_CAPABILITY_UNSUPPORTED") {
  return {
    ...e,
    profileId: t.profileId,
    valid: !1,
    error: n,
    code: o
  };
}
function Hm(e, t) {
  const n = { ...e };
  return delete n.effort, delete n.budgetTokens, t.intensity?.kind === "effort" ? {
    ...n,
    ...e.effort ? { effort: e.effort } : {}
  } : n;
}
function vi(e = {}, t = {}) {
  const n = Cs(e), o = Hm(_s(t), n);
  if (!n.outputModes.includes(o.output)) return zr(o, n, "当前模型不支持返回 Reasoning 内容，请选择“隐藏”。");
  if (!n.modes.includes(o.mode)) return zr(o, n, o.mode === "off" ? "当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。" : n.unsupportedReason || "当前模型不支持显式开启 Reasoning。");
  if (o.mode !== "on") return {
    ...o,
    profileId: n.profileId,
    valid: !0
  };
  if (n.intensity.kind === "effort") {
    const r = o.effort || n.intensity.defaultValue;
    return n.intensity.values.includes(r) ? {
      ...o,
      effort: r,
      profileId: n.profileId,
      valid: !0
    } : zr(o, n, `当前模型不支持 Reasoning 强度“${r}”。`, "REASONING_CONFIG_INVALID");
  }
  return {
    ...o,
    profileId: n.profileId,
    valid: !0
  };
}
var Vm = class extends Error {
  constructor(e = {}) {
    super(e.error || "当前模型不支持所选 Reasoning 配置。"), this.name = "ReasoningCapabilityError", this.code = e.code || "REASONING_CAPABILITY_UNSUPPORTED", this.profileId = e.profileId || "unsupported", this.reasoning = e;
  }
};
function Xc(e = {}) {
  if (e.valid === !1) throw new Vm(e);
  return e;
}
function he(e = "", t = {}, n = {}, o = {}) {
  return Xc(vi({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model,
    maxTokens: o.maxTokens ?? t.maxTokens
  }, n));
}
function lo(e = {}, t = {}) {
  return Cs(e).temperatureOmitModes.includes(t.mode);
}
var H0 = 900 * 1e3, V0 = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), Jm = Object.freeze([
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
function Km(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function Qc(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, o = Number(n);
  return Number.isFinite(o) ? Math.max(0, Math.min(2, o)) : Qc(t, 1);
}
function Ai(e = {}) {
  return e.sendTemperature !== !1;
}
function Ca(e = {}) {
  return Ai(e) ? Qc(e.temperature, 1) : void 0;
}
function J0(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : Jm.find((n) => n.value === e)?.label || e || "未配置";
}
function K0(e = {}) {
  const t = String(e.provider || "").trim();
  return t === "openai-compatible" || t === "sillytavern-openai-compatible" ? e.toolMode === "tagged-json" ? "Tagged JSON 兼容模式" : "原生 Tool Calling" : "Provider 原生工具";
}
function W0(e = {}, t = {}) {
  const n = Mm(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const d = n.delegateConfig.provider || "openai-compatible", h = (n.delegateConfig.modelConfigs || Wt())[d] || Wt()[d] || {}, f = {
      provider: d,
      baseUrl: String(h.baseUrl || ""),
      model: String(h.model || ""),
      maxTokens: xn(h.maxTokens)
    };
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: d,
      baseUrl: String(h.baseUrl || ""),
      model: String(h.model || ""),
      apiKey: String(h.apiKey || ""),
      tavilyApiKey: _i(n.tavilyApiKey),
      tavilyBaseUrl: zn(n.tavilyBaseUrl),
      temperature: Ca(h),
      sendTemperature: Ai(h),
      maxTokens: xn(h.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: h.toolMode || "native",
      reasoning: vi(f, h.reasoning)
    };
  }
  const o = nt(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), r = n.presets?.[o] ? o : n.presets?.[n.currentPresetName] ? n.currentPresetName : ys, i = n.presets?.[r] || gt(), a = i.provider || n.provider || "openai-compatible", u = (i.modelConfigs || n.modelConfigs || Wt())[a] || Wt()[a] || {}, c = {
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    maxTokens: xn(u.maxTokens)
  };
  return {
    currentPresetName: String(r || ""),
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    tavilyApiKey: _i(n.tavilyApiKey),
    tavilyBaseUrl: zn(n.tavilyBaseUrl),
    temperature: Ca(u),
    sendTemperature: Ai(u),
    maxTokens: xn(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoning: vi(c, u.reasoning)
  };
}
function N(e, t, n, o, r) {
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
var Zc = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Zc = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function to(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ti = (e) => {
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
}, Ce = class Si extends G {
  constructor(t, n, o, r, i) {
    super(`${Si.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new Rr({
      message: o,
      cause: Ti(n)
    });
    const i = n, a = i?.error?.type;
    return t === 400 ? new ed(t, i, o, r, a) : t === 401 ? new td(t, i, o, r, a) : t === 403 ? new nd(t, i, o, r, a) : t === 404 ? new od(t, i, o, r, a) : t === 409 ? new rd(t, i, o, r, a) : t === 422 ? new id(t, i, o, r, a) : t === 429 ? new sd(t, i, o, r, a) : t >= 500 ? new ad(t, i, o, r, a) : new Si(t, i, o, r, a);
  }
}, Ge = class extends Ce {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Rr = class extends Ce {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, jc = class extends Rr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, ed = class extends Ce {
}, td = class extends Ce {
}, nd = class extends Ce {
}, od = class extends Ce {
}, rd = class extends Ce {
}, id = class extends Ce {
}, sd = class extends Ce {
}, ad = class extends Ce {
}, Wm = /^[a-z][a-z0-9+.-]*:/i, zm = (e) => Wm.test(e), Ei = (e) => (Ei = Array.isArray, Ei(e)), ba = Ei;
function Ii(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Ra(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function Ym(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var Xm = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new G(`${e} must be an integer`);
  if (t < 0) throw new G(`${e} must be a positive integer`);
  return t;
}, ld = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, Qm = (e) => new Promise((t) => setTimeout(t, e)), qt = "0.91.1", Zm = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function jm() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var eg = () => {
  const e = jm();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qt,
    "X-Stainless-OS": Ma(Deno.build.os),
    "X-Stainless-Arch": Pa(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qt,
    "X-Stainless-OS": Ma(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Pa(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = tg();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": qt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function tg() {
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
var Pa = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", Ma = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), xa, ng = () => xa ?? (xa = eg());
function og() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function ud(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function cd(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return ud({
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
function bs(e) {
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
async function rg(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var ig = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function sg(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new G(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function ag(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Na;
function Rs(e) {
  let t;
  return (Na ?? (t = new globalThis.TextEncoder(), Na = t.encode.bind(t)))(e);
}
var ka;
function Da(e) {
  let t;
  return (ka ?? (t = new globalThis.TextDecoder(), ka = t.decode.bind(t)))(e);
}
var Te, Se, uo = class {
  constructor() {
    Te.set(this, void 0), Se.set(this, void 0), N(this, Te, new Uint8Array(), "f"), N(this, Se, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Rs(e) : e;
    N(this, Te, ag([A(this, Te, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = lg(A(this, Te, "f"), A(this, Se, "f"))) != null; ) {
      if (o.carriage && A(this, Se, "f") == null) {
        N(this, Se, o.index, "f");
        continue;
      }
      if (A(this, Se, "f") != null && (o.index !== A(this, Se, "f") + 1 || o.carriage)) {
        n.push(Da(A(this, Te, "f").subarray(0, A(this, Se, "f") - 1))), N(this, Te, A(this, Te, "f").subarray(A(this, Se, "f")), "f"), N(this, Se, null, "f");
        continue;
      }
      const r = A(this, Se, "f") !== null ? o.preceding - 1 : o.preceding, i = Da(A(this, Te, "f").subarray(0, r));
      n.push(i), N(this, Te, A(this, Te, "f").subarray(o.index), "f"), N(this, Se, null, "f");
    }
    return n;
  }
  flush() {
    return A(this, Te, "f").length ? this.decode(`
`) : [];
  }
};
Te = /* @__PURE__ */ new WeakMap(), Se = /* @__PURE__ */ new WeakMap();
uo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
uo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function lg(e, t) {
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
function ug(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var lr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, $a = (e, t, n) => {
  if (e) {
    if (Ym(lr, e)) return e;
    de(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(lr))}`);
  }
};
function Nn() {
}
function To(e, t, n) {
  return !t || lr[e] > lr[n] ? Nn : t[e].bind(t);
}
var cg = {
  error: Nn,
  warn: Nn,
  info: Nn,
  debug: Nn
}, La = /* @__PURE__ */ new WeakMap();
function de(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return cg;
  const o = La.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: To("error", t, n),
    warn: To("warn", t, n),
    info: To("info", t, n),
    debug: To("debug", t, n)
  };
  return La.set(t, [n, r]), r;
}
var It = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), fn, no = class kn {
  constructor(t, n, o) {
    this.iterator = t, fn.set(this, void 0), this.controller = n, N(this, fn, o, "f");
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? de(o) : console;
    async function* a() {
      if (r) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of dg(t, n)) {
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
            const d = ld(c.data) ?? c.data, h = d?.error?.type;
            throw new Ce(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (to(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new kn(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    async function* i() {
      const u = new uo(), c = bs(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (r) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (to(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new kn(a, n, o);
  }
  [(fn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), r = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = o.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new kn(() => r(t), this.controller, A(this, fn, "f")), new kn(() => r(n), this.controller, A(this, fn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return ud({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const a = Rs(JSON.stringify(r) + `
`);
          o.enqueue(a);
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
async function* dg(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
  const n = new hg(), o = new uo(), r = bs(e.body);
  for await (const i of fg(r)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* fg(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Rs(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = ug(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var hg = class {
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
    let [t, n, o] = pg(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function pg(e, t) {
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
async function dd(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return de(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : no.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : fd(await n.json(), n) : await n.text();
  })();
  return de(e).debug(`[${o}] response parsed`, It({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function fd(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var Dn, hd = class pd extends Promise {
  constructor(t, n, o = dd) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, Dn.set(this, void 0), N(this, Dn, t, "f");
  }
  _thenUnwrap(t) {
    return new pd(A(this, Dn, "f"), this.responsePromise, async (n, o) => fd(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(A(this, Dn, "f"), t))), this.parsedPromise;
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
var So, md = class {
  constructor(e, t, n, o) {
    So.set(this, void 0), N(this, So, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new G("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await A(this, So, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(So = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, mg = class extends hd {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await dd(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, co = class extends md {
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
          ...Ii(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Ii(this.options.query),
        after_id: e
      }
    } : null;
  }
}, ve = class extends md {
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
        ...Ii(this.options.query),
        page: e
      }
    } : null;
  }
}, gd = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function tn(e, t, n) {
  return gd(), new File(e, t ?? "unknown_file", n);
}
function zo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var _d = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Ps = async (e, t, n = !0) => ({
  ...e,
  body: await _g(e.body, t, n)
}), Ua = /* @__PURE__ */ new WeakMap();
function gg(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Ua.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return Ua.set(t, o), o;
}
var _g = async (e, t, n = !0) => {
  if (!await gg(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const o = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, i]) => wi(o, r, i, n))), o;
}, yg = (e) => e instanceof Blob && "name" in e, wi = async (e, t, n, o) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let r = {};
      const i = n.headers.get("Content-Type");
      i && (r = { type: i }), e.append(t, tn([await n.blob()], zo(n, o), r));
    } else if (_d(n)) e.append(t, tn([await new Response(cd(n)).blob()], zo(n, o)));
    else if (yg(n)) e.append(t, tn([n], zo(n, o), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => wi(e, t + "[]", r, o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, i]) => wi(e, `${t}[${r}]`, i, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, yd = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", vg = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && yd(e), Ag = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Tg(e, t, n) {
  if (gd(), e = await e, t || (t = zo(e, !0)), vg(e))
    return e instanceof File && t == null && n == null ? e : tn([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (Ag(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), tn(await Ci(r), t, n);
  }
  const o = await Ci(e);
  if (!n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return tn(o, t, n);
}
async function Ci(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (yd(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (_d(e)) for await (const n of e) t.push(...await Ci(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Sg(e)}`);
  }
  return t;
}
function Sg(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Q = class {
  constructor(e) {
    this._client = e;
  }
}, vd = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Eg(e) {
  if (!e) return;
  if (vd in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : ba(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = ba(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [r, null]), yield [r, u]);
  }
}
var C = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, a] of Eg(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [vd]: !0,
    values: t,
    nulls: n
  };
};
function Ad(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Fa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Ig = (e = Ad) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Fa) ?? Fa)?.toString) && (g = m + "", i.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === o.length ? "" : g);
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
}, $ = /* @__PURE__ */ Ig(Ad), Td = class extends Q {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post($`/v1/environments/${e}?beta=true`, {
      body: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", ve, {
      query: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete($`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post($`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Yn = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function Yo(e) {
  return typeof e == "object" && e !== null && Yn in e;
}
function Sd(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const o of e) Yo(o) && n.add(o[Yn]);
  if (t) {
    for (const o of t)
      if (Yo(o) && n.add(o[Yn]), Array.isArray(o.content))
        for (const r of o.content) Yo(r) && n.add(r[Yn]);
  }
  return Array.from(n);
}
function Ed(e, t) {
  const n = Sd(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function wg(e) {
  return Yo(e) ? { "x-stainless-helper": e[Yn] } : {};
}
var Id = class extends Q {
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", co, {
      query: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete($`/v1/files/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/files/${e}/content?beta=true`, {
      ...n,
      headers: C([{
        "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/files/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/files?beta=true", Ps({
      body: o,
      ...t,
      headers: C([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        wg(o.file),
        t?.headers
      ])
    }, this._client));
  }
}, wd = class extends Q {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/models/${e}?beta=true`, {
      ...n,
      headers: C([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", co, {
      query: o,
      ...t,
      headers: C([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Cd = class extends Q {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/user_profiles?beta=true", {
      body: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/user_profiles/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post($`/v1/user_profiles/${e}?beta=true`, {
      body: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/user_profiles?beta=true", ve, {
      query: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  createEnrollmentURL(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post($`/v1/user_profiles/${e}/enrollment_url?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
}, bd = class extends Q {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList($`/v1/agents/${e}/versions?beta=true`, ve, {
      query: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ms = class extends Q {
  constructor() {
    super(...arguments), this.versions = new bd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.get($`/v1/agents/${e}?beta=true`, {
      query: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post($`/v1/agents/${e}?beta=true`, {
      body: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", ve, {
      query: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post($`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Ms.Versions = bd;
var Rd = class extends Q {
  create(e, t, n) {
    const { view: o, betas: r, ...i } = t;
    return this._client.post($`/v1/memory_stores/${e}/memories?beta=true`, {
      query: { view: o },
      body: i,
      ...n,
      headers: C([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { memory_store_id: o, betas: r, ...i } = t;
    return this._client.get($`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: i,
      ...n,
      headers: C([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { memory_store_id: o, view: r, betas: i, ...a } = t;
    return this._client.post($`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: { view: r },
      body: a,
      ...n,
      headers: C([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList($`/v1/memory_stores/${e}/memories?beta=true`, ve, {
      query: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { memory_store_id: o, expected_content_sha256: r, betas: i } = t;
    return this._client.delete($`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: { expected_content_sha256: r },
      ...n,
      headers: C([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Pd = class extends Q {
  retrieve(e, t, n) {
    const { memory_store_id: o, betas: r, ...i } = t;
    return this._client.get($`/v1/memory_stores/${o}/memory_versions/${e}?beta=true`, {
      query: i,
      ...n,
      headers: C([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList($`/v1/memory_stores/${e}/memory_versions?beta=true`, ve, {
      query: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  redact(e, t, n) {
    const { memory_store_id: o, betas: r } = t;
    return this._client.post($`/v1/memory_stores/${o}/memory_versions/${e}/redact?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Pr = class extends Q {
  constructor() {
    super(...arguments), this.memories = new Rd(this._client), this.memoryVersions = new Pd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/memory_stores?beta=true", {
      body: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post($`/v1/memory_stores/${e}?beta=true`, {
      body: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/memory_stores?beta=true", ve, {
      query: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete($`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post($`/v1/memory_stores/${e}/archive?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Pr.Memories = Rd;
Pr.MemoryVersions = Pd;
var Md = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function xd(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function Oa(e, t, n) {
  const o = xd(t);
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
  } : Nd(e, t, n);
}
function Nd(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const a = Cg(t, i.text);
      o === null && (o = a);
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
    content: r,
    parsed_output: o
  };
}
function Cg(e, t) {
  const n = xd(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new G(`Failed to parse structured output: ${o}`);
  }
}
var bg = (e) => {
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
    let r = /[0-9]/;
    if (o && r.test(o) || o === "-" || o === ".") {
      let a = "";
      for (o === "-" && (a += o, o = e[++t]); o && r.test(o) || o === "."; )
        a += o, o = e[++t];
      n.push({
        type: "number",
        value: a
      });
      continue;
    }
    let i = /[a-z]/i;
    if (o && i.test(o)) {
      let a = "";
      for (; o && i.test(o) && t !== e.length; )
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
}, Ht = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Ht(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Ht(e);
    case "string":
      let o = e[e.length - 2];
      if (o?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Ht(e);
      if (o?.type === "brace" && o.value === "{")
        return e = e.slice(0, e.length - 1), Ht(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Ht(e);
  }
  return e;
}, Rg = (e) => {
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
}, Pg = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, kd = (e) => JSON.parse(Pg(Rg(Ht(bg(e))))), Pe, at, Ut, hn, Eo, pn, mn, Io, gn, Ye, _n, wo, Co, Tt, bo, Ro, yn, Yr, Ga, Po, Xr, Qr, Zr, Ba, qa = "__json_buf";
function Ha(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Mg = class bi {
  constructor(t, n) {
    Pe.add(this), this.messages = [], this.receivedMessages = [], at.set(this, void 0), Ut.set(this, null), this.controller = new AbortController(), hn.set(this, void 0), Eo.set(this, () => {
    }), pn.set(this, () => {
    }), mn.set(this, void 0), Io.set(this, () => {
    }), gn.set(this, () => {
    }), Ye.set(this, {}), _n.set(this, !1), wo.set(this, !1), Co.set(this, !1), Tt.set(this, !1), bo.set(this, void 0), Ro.set(this, void 0), yn.set(this, void 0), Po.set(this, (o) => {
      if (N(this, wo, !0, "f"), to(o) && (o = new Ge()), o instanceof Ge)
        return N(this, Co, !0, "f"), this._emit("abort", o);
      if (o instanceof G) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new G(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new G(String(o)));
    }), N(this, hn, new Promise((o, r) => {
      N(this, Eo, o, "f"), N(this, pn, r, "f");
    }), "f"), N(this, mn, new Promise((o, r) => {
      N(this, Io, o, "f"), N(this, gn, r, "f");
    }), "f"), A(this, hn, "f").catch(() => {
    }), A(this, mn, "f").catch(() => {
    }), N(this, Ut, t, "f"), N(this, yn, n?.logger ?? console, "f");
  }
  get response() {
    return A(this, bo, "f");
  }
  get request_id() {
    return A(this, Ro, "f");
  }
  async withResponse() {
    N(this, Tt, !0, "f");
    const t = await A(this, hn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new bi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: r } = {}) {
    const i = new bi(n, { logger: r });
    for (const a of n.messages) i._addMessageParam(a);
    return N(i, Ut, {
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
    }, A(this, Po, "f"));
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
      A(this, Pe, "m", Xr).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) A(this, Pe, "m", Qr).call(this, c);
      if (u.controller.signal?.aborted) throw new Ge();
      A(this, Pe, "m", Zr).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (N(this, bo, t, "f"), N(this, Ro, t?.headers.get("request-id"), "f"), A(this, Eo, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return A(this, _n, "f");
  }
  get errored() {
    return A(this, wo, "f");
  }
  get aborted() {
    return A(this, Co, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (A(this, Ye, "f")[t] || (A(this, Ye, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = A(this, Ye, "f")[t];
    if (!o) return this;
    const r = o.findIndex((i) => i.listener === n);
    return r >= 0 && o.splice(r, 1), this;
  }
  once(t, n) {
    return (A(this, Ye, "f")[t] || (A(this, Ye, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      N(this, Tt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    N(this, Tt, !0, "f"), await A(this, mn, "f");
  }
  get currentMessage() {
    return A(this, at, "f");
  }
  async finalMessage() {
    return await this.done(), A(this, Pe, "m", Yr).call(this);
  }
  async finalText() {
    return await this.done(), A(this, Pe, "m", Ga).call(this);
  }
  _emit(t, ...n) {
    if (A(this, _n, "f")) return;
    t === "end" && (N(this, _n, !0, "f"), A(this, Io, "f").call(this));
    const o = A(this, Ye, "f")[t];
    if (o && (A(this, Ye, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !A(this, Tt, "f") && !o?.length && Promise.reject(r), A(this, pn, "f").call(this, r), A(this, gn, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !A(this, Tt, "f") && !o?.length && Promise.reject(r), A(this, pn, "f").call(this, r), A(this, gn, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", A(this, Pe, "m", Yr).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      A(this, Pe, "m", Xr).call(this), this._connected(null);
      const i = no.fromReadableStream(t, this.controller);
      for await (const a of i) A(this, Pe, "m", Qr).call(this, a);
      if (i.controller.signal?.aborted) throw new Ge();
      A(this, Pe, "m", Zr).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(at = /* @__PURE__ */ new WeakMap(), Ut = /* @__PURE__ */ new WeakMap(), hn = /* @__PURE__ */ new WeakMap(), Eo = /* @__PURE__ */ new WeakMap(), pn = /* @__PURE__ */ new WeakMap(), mn = /* @__PURE__ */ new WeakMap(), Io = /* @__PURE__ */ new WeakMap(), gn = /* @__PURE__ */ new WeakMap(), Ye = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakMap(), wo = /* @__PURE__ */ new WeakMap(), Co = /* @__PURE__ */ new WeakMap(), Tt = /* @__PURE__ */ new WeakMap(), bo = /* @__PURE__ */ new WeakMap(), Ro = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), Po = /* @__PURE__ */ new WeakMap(), Pe = /* @__PURE__ */ new WeakSet(), Yr = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Ga = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new G("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, Xr = function() {
    this.ended || N(this, at, void 0, "f");
  }, Qr = function(n) {
    if (this.ended) return;
    const o = A(this, Pe, "m", Ba).call(this, n);
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
            Ha(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
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
        this._addMessageParam(o), this._addMessage(Oa(o, A(this, Ut, "f"), { logger: A(this, yn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        N(this, at, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, Zr = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = A(this, at, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return N(this, at, void 0, "f"), Oa(n, A(this, Ut, "f"), { logger: A(this, yn, "f") });
  }, Ba = function(n) {
    let o = A(this, at, "f");
    if (n.type === "message_start") {
      if (o) throw new G(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new G(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (r && Ha(r)) {
              let i = r[qa] || "";
              i += n.delta.partial_json;
              const a = { ...r };
              if (Object.defineProperty(a, qa, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                a.input = kd(i);
              } catch (u) {
                const c = new G(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                A(this, Po, "f").call(this, c);
              }
              o.content[n.index] = a;
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
    return new no(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Dd = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var xg = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, vn, Ft, St, ee, me, Ae, tt, lt, An, Va, Ri;
function Ja() {
  let e, t;
  return {
    promise: new Promise((n, o) => {
      e = n, t = o;
    }),
    resolve: e,
    reject: t
  };
}
var $d = class {
  constructor(e, t, n) {
    vn.add(this), this.client = e, Ft.set(this, !1), St.set(this, !1), ee.set(this, void 0), me.set(this, void 0), Ae.set(this, void 0), tt.set(this, void 0), lt.set(this, void 0), An.set(this, 0), N(this, ee, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const o = ["BetaToolRunner", ...Sd(t.tools, t.messages)].join(", ");
    N(this, me, {
      ...n,
      headers: C([{ "x-stainless-helper": o }, n?.headers])
    }, "f"), N(this, lt, Ja(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Ft = /* @__PURE__ */ new WeakMap(), St = /* @__PURE__ */ new WeakMap(), ee = /* @__PURE__ */ new WeakMap(), me = /* @__PURE__ */ new WeakMap(), Ae = /* @__PURE__ */ new WeakMap(), tt = /* @__PURE__ */ new WeakMap(), lt = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakSet(), Va = async function() {
    const t = A(this, ee, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (A(this, Ae, "f") !== void 0) try {
      const c = await A(this, Ae, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const o = t.contextTokenThreshold ?? 1e5;
    if (n < o) return !1;
    const r = t.model ?? A(this, ee, "f").params.model, i = t.summaryPrompt ?? xg, a = A(this, ee, "f").params.messages;
    if (a[a.length - 1].role === "assistant") {
      const c = a[a.length - 1];
      if (Array.isArray(c.content)) {
        const d = c.content.filter((h) => h.type !== "tool_use");
        d.length === 0 ? a.pop() : c.content = d;
      }
    }
    const u = await this.client.beta.messages.create({
      model: r,
      messages: [...a, {
        role: "user",
        content: [{
          type: "text",
          text: i
        }]
      }],
      max_tokens: A(this, ee, "f").params.max_tokens
    }, {
      signal: A(this, me, "f").signal,
      headers: C([A(this, me, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new G("Expected text response for compaction");
    return A(this, ee, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (A(this, Ft, "f")) throw new G("Cannot iterate over a consumed stream");
    N(this, Ft, !0, "f"), N(this, St, !0, "f"), N(this, tt, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (A(this, ee, "f").params.max_iterations && A(this, An, "f") >= A(this, ee, "f").params.max_iterations) break;
          N(this, St, !1, "f"), N(this, tt, void 0, "f"), N(this, An, (e = A(this, An, "f"), e++, e), "f"), N(this, Ae, void 0, "f");
          const { max_iterations: n, compactionControl: o, ...r } = A(this, ee, "f").params;
          if (r.stream ? (t = this.client.beta.messages.stream({ ...r }, A(this, me, "f")), N(this, Ae, t.finalMessage(), "f"), A(this, Ae, "f").catch(() => {
          }), yield t) : (N(this, Ae, this.client.beta.messages.create({
            ...r,
            stream: !1
          }, A(this, me, "f")), "f"), yield A(this, Ae, "f")), !await A(this, vn, "m", Va).call(this)) {
            if (!A(this, St, "f")) {
              const { role: a, content: u } = await A(this, Ae, "f");
              A(this, ee, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const i = await A(this, vn, "m", Ri).call(this, A(this, ee, "f").params.messages.at(-1));
            if (i) A(this, ee, "f").params.messages.push(i);
            else if (!A(this, St, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!A(this, Ae, "f")) throw new G("ToolRunner concluded without a message from the server");
      A(this, lt, "f").resolve(await A(this, Ae, "f"));
    } catch (t) {
      throw N(this, Ft, !1, "f"), A(this, lt, "f").promise.catch(() => {
      }), A(this, lt, "f").reject(t), N(this, lt, Ja(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? A(this, ee, "f").params = e(A(this, ee, "f").params) : A(this, ee, "f").params = e, N(this, St, !0, "f"), N(this, tt, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? N(this, me, e(A(this, me, "f")), "f") : N(this, me, {
      ...A(this, me, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = A(this, me, "f").signal) {
    const t = await A(this, Ae, "f") ?? this.params.messages.at(-1);
    return t ? A(this, vn, "m", Ri).call(this, t, e) : null;
  }
  done() {
    return A(this, lt, "f").promise;
  }
  async runUntilDone() {
    if (!A(this, Ft, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return A(this, ee, "f").params;
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
Ri = async function(t, n = A(this, me, "f").signal) {
  return A(this, tt, "f") !== void 0 ? A(this, tt, "f") : (N(this, tt, Ng(A(this, ee, "f").params, t, {
    ...A(this, me, "f"),
    signal: n
  }), "f"), A(this, tt, "f"));
};
async function Ng(e, t = e.messages.at(-1), n) {
  if (!t || t.role !== "assistant" || !t.content || typeof t.content == "string") return null;
  const o = t.content.filter((r) => r.type === "tool_use");
  return o.length === 0 ? null : {
    role: "user",
    content: await Promise.all(o.map(async (r) => {
      const i = e.tools.find((a) => ("name" in a ? a.name : a.mcp_server_name) === r.name);
      if (!i || !("run" in i)) return {
        type: "tool_result",
        tool_use_id: r.id,
        content: `Error: Tool '${r.name}' not found`,
        is_error: !0
      };
      try {
        let a = r.input;
        "parse" in i && i.parse && (a = i.parse(a));
        const u = await i.run(a, {
          toolUseBlock: r,
          signal: n?.signal
        });
        return {
          type: "tool_result",
          tool_use_id: r.id,
          content: u
        };
      } catch (a) {
        return {
          type: "tool_result",
          tool_use_id: r.id,
          content: a instanceof Dd ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var Ld = class Ud {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new uo();
    for await (const n of this.iterator) for (const o of t.decode(n)) yield JSON.parse(o);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
    return new Ud(bs(t.body), n);
  }
}, Fd = class extends Q {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", co, {
      query: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete($`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post($`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const o = await this.retrieve(e);
    if (!o.results_url) throw new G(`No batch \`results_url\`; Has it finished processing? ${o.processing_status} - ${o.id}`);
    const { betas: r } = t ?? {};
    return this._client.get(o.results_url, {
      ...n,
      headers: C([{
        "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, a) => Ld.fromResponse(a.response, a.controller));
  }
}, Ka = {
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
}, kg = ["claude-mythos-preview", "claude-opus-4-6"], fo = class extends Q {
  constructor() {
    super(...arguments), this.batches = new Fd(this._client);
  }
  create(e, t) {
    const n = Wa(e), { betas: o, ...r } = n;
    r.model in Ka && console.warn(`The model '${r.model}' is deprecated and will reach end-of-life on ${Ka[r.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), kg.includes(r.model) && r.thinking && r.thinking.type === "enabled" && console.warn(`Using Claude with ${r.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!r.stream && i == null) {
      const u = Md[r.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(r.max_tokens, u);
    }
    const a = Ed(r.tools, r.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: r,
      timeout: i ?? 6e5,
      ...t,
      headers: C([
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
      headers: C([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => Nd(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Mg.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...o } = Wa(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new $d(this._client, e, t);
  }
};
function Wa(e) {
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
fo.Batches = Fd;
fo.BetaToolRunner = $d;
fo.ToolError = Dd;
var Od = class extends Q {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList($`/v1/sessions/${e}/events?beta=true`, ve, {
      query: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post($`/v1/sessions/${e}/events?beta=true`, {
      body: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, Gd = class extends Q {
  retrieve(e, t, n) {
    const { session_id: o, betas: r } = t;
    return this._client.get($`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: o, betas: r, ...i } = t;
    return this._client.post($`/v1/sessions/${o}/resources/${e}?beta=true`, {
      body: i,
      ...n,
      headers: C([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList($`/v1/sessions/${e}/resources?beta=true`, ve, {
      query: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: o, betas: r } = t;
    return this._client.delete($`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post($`/v1/sessions/${e}/resources?beta=true`, {
      body: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Mr = class extends Q {
  constructor() {
    super(...arguments), this.events = new Od(this._client), this.resources = new Gd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post($`/v1/sessions/${e}?beta=true`, {
      body: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", ve, {
      query: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete($`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post($`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Mr.Events = Od;
Mr.Resources = Gd;
var Bd = class extends Q {
  create(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.post($`/v1/skills/${e}/versions?beta=true`, Ps({
      body: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o, betas: r } = t;
    return this._client.get($`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList($`/v1/skills/${e}/versions?beta=true`, ve, {
      query: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: o, betas: r } = t;
    return this._client.delete($`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, xs = class extends Q {
  constructor() {
    super(...arguments), this.versions = new Bd(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Ps({
      body: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", ve, {
      query: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete($`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
xs.Versions = Bd;
var qd = class extends Q {
  create(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post($`/v1/vaults/${e}/credentials?beta=true`, {
      body: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.get($`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: o, betas: r, ...i } = t;
    return this._client.post($`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      body: i,
      ...n,
      headers: C([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList($`/v1/vaults/${e}/credentials?beta=true`, ve, {
      query: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.delete($`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.post($`/v1/vaults/${o}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ns = class extends Q {
  constructor() {
    super(...arguments), this.credentials = new qd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post($`/v1/vaults/${e}?beta=true`, {
      body: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", ve, {
      query: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete($`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post($`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Ns.Credentials = qd;
var ke = class extends Q {
  constructor() {
    super(...arguments), this.models = new wd(this._client), this.messages = new fo(this._client), this.agents = new Ms(this._client), this.environments = new Td(this._client), this.sessions = new Mr(this._client), this.vaults = new Ns(this._client), this.memoryStores = new Pr(this._client), this.files = new Id(this._client), this.skills = new xs(this._client), this.userProfiles = new Cd(this._client);
  }
};
ke.Models = wd;
ke.Messages = fo;
ke.Agents = Ms;
ke.Environments = Td;
ke.Sessions = Mr;
ke.Vaults = Ns;
ke.MemoryStores = Pr;
ke.Files = Id;
ke.Skills = xs;
ke.UserProfiles = Cd;
var Hd = class extends Q {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/complete", {
      body: o,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: C([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function Vd(e) {
  return e?.output_config?.format;
}
function za(e, t, n) {
  const o = Vd(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((r) => r.type === "text" ? Object.defineProperty({ ...r }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : r),
    parsed_output: null
  } : Jd(e, t, n);
}
function Jd(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const a = Dg(t, i.text);
      return o === null && (o = a), Object.defineProperty({ ...i }, "parsed_output", {
        value: a,
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
function Dg(e, t) {
  const n = Vd(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new G(`Failed to parse structured output: ${o}`);
  }
}
var Me, ut, Ot, Tn, Mo, Sn, En, xo, In, Xe, wn, No, ko, Et, Do, $o, Cn, jr, Ya, ei, ti, ni, oi, Xa, Qa = "__json_buf";
function Za(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var $g = class Pi {
  constructor(t, n) {
    Me.add(this), this.messages = [], this.receivedMessages = [], ut.set(this, void 0), Ot.set(this, null), this.controller = new AbortController(), Tn.set(this, void 0), Mo.set(this, () => {
    }), Sn.set(this, () => {
    }), En.set(this, void 0), xo.set(this, () => {
    }), In.set(this, () => {
    }), Xe.set(this, {}), wn.set(this, !1), No.set(this, !1), ko.set(this, !1), Et.set(this, !1), Do.set(this, void 0), $o.set(this, void 0), Cn.set(this, void 0), ei.set(this, (o) => {
      if (N(this, No, !0, "f"), to(o) && (o = new Ge()), o instanceof Ge)
        return N(this, ko, !0, "f"), this._emit("abort", o);
      if (o instanceof G) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new G(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new G(String(o)));
    }), N(this, Tn, new Promise((o, r) => {
      N(this, Mo, o, "f"), N(this, Sn, r, "f");
    }), "f"), N(this, En, new Promise((o, r) => {
      N(this, xo, o, "f"), N(this, In, r, "f");
    }), "f"), A(this, Tn, "f").catch(() => {
    }), A(this, En, "f").catch(() => {
    }), N(this, Ot, t, "f"), N(this, Cn, n?.logger ?? console, "f");
  }
  get response() {
    return A(this, Do, "f");
  }
  get request_id() {
    return A(this, $o, "f");
  }
  async withResponse() {
    N(this, Et, !0, "f");
    const t = await A(this, Tn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Pi(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: r } = {}) {
    const i = new Pi(n, { logger: r });
    for (const a of n.messages) i._addMessageParam(a);
    return N(i, Ot, {
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
    }, A(this, ei, "f"));
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
      A(this, Me, "m", ti).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) A(this, Me, "m", ni).call(this, c);
      if (u.controller.signal?.aborted) throw new Ge();
      A(this, Me, "m", oi).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (N(this, Do, t, "f"), N(this, $o, t?.headers.get("request-id"), "f"), A(this, Mo, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return A(this, wn, "f");
  }
  get errored() {
    return A(this, No, "f");
  }
  get aborted() {
    return A(this, ko, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (A(this, Xe, "f")[t] || (A(this, Xe, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = A(this, Xe, "f")[t];
    if (!o) return this;
    const r = o.findIndex((i) => i.listener === n);
    return r >= 0 && o.splice(r, 1), this;
  }
  once(t, n) {
    return (A(this, Xe, "f")[t] || (A(this, Xe, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      N(this, Et, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    N(this, Et, !0, "f"), await A(this, En, "f");
  }
  get currentMessage() {
    return A(this, ut, "f");
  }
  async finalMessage() {
    return await this.done(), A(this, Me, "m", jr).call(this);
  }
  async finalText() {
    return await this.done(), A(this, Me, "m", Ya).call(this);
  }
  _emit(t, ...n) {
    if (A(this, wn, "f")) return;
    t === "end" && (N(this, wn, !0, "f"), A(this, xo, "f").call(this));
    const o = A(this, Xe, "f")[t];
    if (o && (A(this, Xe, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !A(this, Et, "f") && !o?.length && Promise.reject(r), A(this, Sn, "f").call(this, r), A(this, In, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !A(this, Et, "f") && !o?.length && Promise.reject(r), A(this, Sn, "f").call(this, r), A(this, In, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", A(this, Me, "m", jr).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      A(this, Me, "m", ti).call(this), this._connected(null);
      const i = no.fromReadableStream(t, this.controller);
      for await (const a of i) A(this, Me, "m", ni).call(this, a);
      if (i.controller.signal?.aborted) throw new Ge();
      A(this, Me, "m", oi).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(ut = /* @__PURE__ */ new WeakMap(), Ot = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), Mo = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), xo = /* @__PURE__ */ new WeakMap(), In = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), No = /* @__PURE__ */ new WeakMap(), ko = /* @__PURE__ */ new WeakMap(), Et = /* @__PURE__ */ new WeakMap(), Do = /* @__PURE__ */ new WeakMap(), $o = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), ei = /* @__PURE__ */ new WeakMap(), Me = /* @__PURE__ */ new WeakSet(), jr = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Ya = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new G("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, ti = function() {
    this.ended || N(this, ut, void 0, "f");
  }, ni = function(n) {
    if (this.ended) return;
    const o = A(this, Me, "m", Xa).call(this, n);
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
            Za(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
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
        this._addMessageParam(o), this._addMessage(za(o, A(this, Ot, "f"), { logger: A(this, Cn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        N(this, ut, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, oi = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = A(this, ut, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return N(this, ut, void 0, "f"), za(n, A(this, Ot, "f"), { logger: A(this, Cn, "f") });
  }, Xa = function(n) {
    let o = A(this, ut, "f");
    if (n.type === "message_start") {
      if (o) throw new G(`Unexpected event order, got ${n.type} before receiving "message_stop"`);
      return n.message;
    }
    if (!o) throw new G(`Unexpected event order, got ${n.type} before "message_start"`);
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
            if (r && Za(r)) {
              let i = r[Qa] || "";
              i += n.delta.partial_json;
              const a = { ...r };
              Object.defineProperty(a, Qa, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (a.input = kd(i)), o.content[n.index] = a;
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
    return new no(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Kd = class extends Q {
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
    return this._client.getAPIList("/v1/messages/batches", co, {
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
      headers: C([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, r) => Ld.fromResponse(r.response, r.controller));
  }
}, ks = class extends Q {
  constructor() {
    super(...arguments), this.batches = new Kd(this._client);
  }
  create(e, t) {
    e.model in ja && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${ja[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Lg.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const r = Md[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, r);
    }
    const o = Ed(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: C([o, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Jd(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return $g.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, ja = {
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
}, Lg = ["claude-mythos-preview", "claude-opus-4-6"];
ks.Batches = Kd;
var Wd = class extends Q {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/models/${e}`, {
      ...n,
      headers: C([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models", co, {
      query: o,
      ...t,
      headers: C([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Lo = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Mi, Ds, Xo, zd, Ug = "\\n\\nHuman:", Fg = "\\n\\nAssistant:", Z = class {
  constructor({ baseURL: e = Lo("ANTHROPIC_BASE_URL"), apiKey: t = Lo("ANTHROPIC_API_KEY") ?? null, authToken: n = Lo("ANTHROPIC_AUTH_TOKEN") ?? null, ...o } = {}) {
    Mi.add(this), Xo.set(this, void 0);
    const r = {
      apiKey: t,
      authToken: n,
      ...o,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!r.dangerouslyAllowBrowser && Zm()) throw new G(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = r.baseURL, this.timeout = r.timeout ?? Ds.DEFAULT_TIMEOUT, this.logger = r.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = $a(r.logLevel, "ClientOptions.logLevel", this) ?? $a(Lo("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = r.fetchOptions, this.maxRetries = r.maxRetries ?? 2, this.fetch = r.fetch ?? og(), N(this, Xo, ig, "f"), this._options = r, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return C([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return C([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return C([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return sg(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${qt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Zc()}`;
  }
  makeStatusError(e, t, n, o) {
    return Ce.generate(e, t, n, o);
  }
  buildURL(e, t, n) {
    const o = !A(this, Mi, "m", zd).call(this) && n || this.baseURL, r = zm(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(r.searchParams);
    return (!Ra(i) || !Ra(a)) && (t = {
      ...a,
      ...i,
      ...t
    }), typeof t == "object" && t && !Array.isArray(t) && (r.search = this.stringifyQuery(t)), r.toString();
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
    return this.request(Promise.resolve(n).then((o) => ({
      method: e,
      path: t,
      ...o
    })));
  }
  request(e, t = null) {
    return new hd(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, r = o.maxRetries ?? this.maxRetries;
    t == null && (t = r), await this.prepareOptions(o);
    const { req: i, url: a, timeout: u } = await this.buildRequest(o, { retryCount: r - t });
    await this.prepareRequest(i, {
      url: a,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (de(this).debug(`[${c}] sending request`, It({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new Ge();
    const f = new AbortController(), p = await this.fetchWithTimeout(a, i, u, f).catch(Ti), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Ge();
      const y = to(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return de(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - ${_}`), de(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (${_})`, It({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(o, t, n ?? c);
      throw de(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - error; no more retries left`), de(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (error; no more retries left)`, It({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - h,
        message: p.message
      })), y ? new jc() : new Rr({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, y]) => ", " + _ + ": " + JSON.stringify(y)).join("")}] ${i.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const P = `retrying, ${t} attempts remaining`;
        return await rg(p.body), de(this).info(`${g} - ${P}`), de(this).debug(`[${c}] response error (${P})`, It({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(o, t, n ?? c, p.headers);
      }
      const y = _ ? "error; no more retries left" : "error; not retryable";
      de(this).info(`${g} - ${y}`);
      const S = await p.text().catch((P) => Ti(P).message), I = ld(S), b = I ? void 0 : S;
      throw de(this).debug(`[${c}] response error (${y})`, It({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: b,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, I, b, p.headers);
    }
    return de(this).info(g), de(this).debug(`[${c}] response start`, It({
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
    return new mg(this, n, e);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: r, method: i, ...a } = t || {}, u = this._makeAbort(o);
    r && r.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, h = {
      signal: o.signal,
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
  async retryRequest(e, t, n, o) {
    let r;
    const i = o?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (r = u);
    }
    const a = o?.get("retry-after");
    if (a && !r) {
      const u = parseFloat(a);
      Number.isNaN(u) ? r = Date.parse(a) - Date.now() : r = u * 1e3;
    }
    if (r === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      r = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await Qm(r), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const r = t - e;
    return Math.min(0.5 * Math.pow(2, r), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  calculateNonstreamingTimeout(e, t) {
    if (36e5 * e / 128e3 > 6e5 || t != null && e > t) throw new G("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
    return 6e5;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: r, query: i, defaultBaseURL: a } = n, u = this.buildURL(r, i, a);
    "timeout" in n && Xm("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const i = C([
      r,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...ng(),
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
    const n = C([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: cd(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : A(this, Xo, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Ds = Z, Xo = /* @__PURE__ */ new WeakMap(), Mi = /* @__PURE__ */ new WeakSet(), zd = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
Z.Anthropic = Ds;
Z.HUMAN_PROMPT = Ug;
Z.AI_PROMPT = Fg;
Z.DEFAULT_TIMEOUT = 6e5;
Z.AnthropicError = G;
Z.APIError = Ce;
Z.APIConnectionError = Rr;
Z.APIConnectionTimeoutError = jc;
Z.APIUserAbortError = Ge;
Z.NotFoundError = od;
Z.ConflictError = rd;
Z.RateLimitError = sd;
Z.BadRequestError = ed;
Z.AuthenticationError = td;
Z.InternalServerError = ad;
Z.PermissionDeniedError = nd;
Z.UnprocessableEntityError = id;
Z.toFile = Tg;
var ho = class extends Z {
  constructor() {
    super(...arguments), this.completions = new Hd(this), this.messages = new ks(this), this.models = new Wd(this), this.beta = new ke(this);
  }
};
ho.Completions = Hd;
ho.Messages = ks;
ho.Models = Wd;
ho.Beta = ke;
function Dt(e) {
  if (Array.isArray(e)) return e.map((n) => Dt(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, o]) => {
    t[n] = /^(?:authorization|proxy[-_]?authorization|(?:x[-_])?csrf(?:[-_]?token)?|token|access[-_]?token|refresh[-_]?token|id[-_]?token|api[-_]?key|x[-_](?:goog[-_])?api[-_]?key|proxy[-_]?password|password|client[-_]?secret)$/i.test(n) ? "[redacted]" : Dt(o);
  }), t;
}
function _t(e = {}, t = {}) {
  const n = String(e.reasoning?.mode || "inherit"), o = e.reasoning?.output === "show" ? "show" : "hide", r = String(t.effectiveMode || n);
  return {
    reasoningRequestedMode: n,
    reasoningRequestedOutput: o,
    reasoningProfileId: String(t.profileId || e.reasoning?.profileId || "unsupported"),
    reasoningEffectiveMode: r,
    reasoningEffort: r === "on" ? String(t.effort ?? e.reasoning?.effort ?? "") : "",
    reasoningBudgetTokens: r === "on" && Number.isFinite(Number(t.budgetTokens ?? e.reasoning?.budgetTokens)) ? Number(t.budgetTokens ?? e.reasoning?.budgetTokens) : null,
    reasoningControlFields: Dt(t.controlFields || {}),
    reasoningOutputVisible: r !== "off" && o === "show"
  };
}
function oo(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: Dt({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    }),
    ...e.effectiveConfig ? { effectiveConfig: e.effectiveConfig } : {}
  };
}
function Og(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Gg(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function Yd(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Bg(e) {
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
      const o = Gg(n.image_url.url);
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
function qg(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function Hg(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && Yd(t) || null;
}
function Vg(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: Yd(e.content) || [] } : void 0;
}
function el(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function tl(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: Og(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function Jg(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const o = e[n];
    if (o.role !== "system") {
      if (o.role === "assistant") {
        const r = Hg(o), i = tl(o.tool_calls);
        if (r && i.length) {
          t.push({
            role: "assistant",
            content: r.filter((a) => a?.type !== "tool_use").concat(i)
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
        const r = [el(o)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, r.push(el(e[n]));
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
          }] : [], ...tl(o.tool_calls)]
        });
        continue;
      }
      t.push({
        role: o.role,
        content: Bg(o.content)
      });
    }
  }
  return t;
}
function Uo(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function nl(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function Kg(e = "auto", t = []) {
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
var Wg = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function ol(e = {}, t = {}) {
  const n = Array.isArray(t.tools) ? t.tools : [], o = n.length ? Kg(t.toolChoice, n) : void 0, r = _s(t.reasoning), i = Cs({
    provider: "anthropic",
    baseUrl: e.baseUrl,
    model: e.model
  }), a = r.mode === "on" && i.profileId === "anthropic-manual" && (o?.type === "any" || o?.type === "tool"), u = he("anthropic", e, {
    ...r,
    ...a ? { mode: "off" } : {}
  }, { maxTokens: t.maxTokens });
  return {
    toolChoice: o,
    reasoning: a ? {
      ...r,
      profileId: i.profileId
    } : u,
    effectiveReasoning: u,
    reasoningDisabledForForcedTool: a
  };
}
var zg = class {
  constructor(e) {
    this.config = e, this.client = new ho({
      apiKey: e.apiKey,
      baseURL: nl(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e) {
    const t = ol(this.config, e), n = t.effectiveReasoning, o = (Array.isArray(e.tools) ? e.tools : []).map((a) => ({
      name: a.function.name,
      description: a.function.description,
      input_schema: a.function.parameters
    })), r = qg(e), i = {
      model: this.config.model,
      system: r,
      messages: Jg(e.messages),
      ...o.length ? {
        tools: o,
        tool_choice: t.toolChoice
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !lo({
      ...this.config,
      provider: "anthropic"
    }, n) && typeof e.temperature == "number" && (i.temperature = e.temperature), n.mode === "off" ? i.thinking = { type: "disabled" } : n.mode === "on" && n.profileId === "anthropic-adaptive" ? (i.thinking = {
      type: "adaptive",
      display: J(n) ? "summarized" : "omitted"
    }, i.output_config = { effort: n.effort }) : n.mode === "on" && n.profileId === "anthropic-manual" && (i.thinking = {
      type: "enabled",
      budget_tokens: n.budgetTokens,
      display: J(n) ? "summarized" : "omitted"
    }), i;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = nl(this.config.baseUrl), r = t.body || this.buildRequestBody(e), i = ol(this.config, e), a = i.effectiveReasoning;
    return {
      ...oo({
        provider: "anthropic",
        model: this.config.model,
        transport: "anthropic-sdk",
        url: `${o}/v1/messages`,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey || ""
        },
        body: r,
        sdk: n ? "client.messages.stream" : "client.messages.create",
        effectiveConfig: _t(e, {
          profileId: i.reasoning.profileId,
          effectiveMode: a.mode,
          effort: r.output_config?.effort,
          budgetTokens: r.thinking?.budget_tokens,
          controlFields: {
            ...r.thinking ? { thinking: r.thinking } : {},
            ...r.output_config ? { output_config: r.output_config } : {}
          }
        })
      }),
      ...i.reasoningDisabledForForcedTool ? { notices: [Wg] } : {}
    };
  }
  async chat(e) {
    const t = this.buildRequestBody(e), n = this.inspectRequest(e, { body: t });
    let o;
    if (typeof e.onStreamProgress == "function") {
      const i = this.client.messages.stream(t, { signal: e.signal }), a = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
      let c = "";
      const d = () => J(e.reasoning) ? Array.from(a.entries()).sort(([p], [m]) => p.localeCompare(m)).map(([p, m]) => ({
        label: p.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: m
      })).filter((p) => p.text) : [], h = () => Array.from(u.entries()).sort(([p], [m]) => Number(p) - Number(m)).map(([, p]) => ({
        id: p.id || "anthropic-tool-draft",
        name: p.name || "工具调用",
        arguments: p.inputJson || "{}",
        draft: !0
      })).filter((p) => p.name), f = () => {
        const p = h();
        p.length && Uo(e, {
          text: c,
          thoughts: d(),
          toolCalls: p,
          toolCallDraft: !0
        });
      };
      i.on("text", (p, m) => {
        c = m || "", Uo(e, {
          text: c,
          thoughts: d(),
          ...h().length ? {
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), i.on("thinking", (p, m) => {
        a.set("thinking:0", m || ""), Uo(e, {
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
        p?.type === "redacted_thinking" && (a.set("redacted:0", p.data || ""), Uo(e, {
          thoughts: d(),
          ...h().length ? {
            text: c,
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        }));
      }), o = await i.finalMessage();
    } else o = await this.client.messages.create(t, { signal: e.signal });
    const r = (o.content || []).filter((i) => i.type === "tool_use" && i.name).map((i, a) => ({
      id: i.id || `anthropic-tool-${a + 1}`,
      name: i.name,
      arguments: JSON.stringify(i.input || {})
    }));
    return {
      text: (o.content || []).filter((i) => i.type === "text").map((i) => i.text || "").join(`
`),
      toolCalls: r,
      thoughts: J(e.reasoning) ? (o.content || []).filter((i) => i.type === "thinking" || i.type === "redacted_thinking").map((i) => ({
        label: i.type === "thinking" ? "思考块" : "已脱敏思考块",
        text: i.type === "thinking" ? i.thinking || "" : i.data || ""
      })).filter((i) => i.text) : [],
      finishReason: o.stop_reason || "stop",
      model: o.model || this.config.model,
      provider: "anthropic",
      providerPayload: Vg(o),
      requestInspection: n
    };
  }
}, Yg = /* @__PURE__ */ br(((e, t) => {
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
    var a = this;
    return this._timer = setTimeout(function() {
      a._attempts++, a._operationTimeoutCb && (a._timeout = setTimeout(function() {
        a._operationTimeoutCb(a._attempts);
      }, a._operationTimeout), a._options.unref && a._timeout.unref()), a._fn(a._attempts);
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
    for (var o = {}, r = null, i = 0, a = 0; a < this._errors.length; a++) {
      var u = this._errors[a], c = u.message, d = (o[c] || 0) + 1;
      o[c] = d, d >= i && (r = u, i = d);
    }
    return r;
  };
})), Xg = /* @__PURE__ */ br(((e) => {
  var t = Yg();
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
    for (var i = [], a = 0; a < o.retries; a++) i.push(this.createTimeout(a, o));
    return n && n.forever && !i.length && i.push(this.createTimeout(a, o)), i.sort(function(u, c) {
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
    for (var a = 0; a < r.length; a++) {
      var u = r[a], c = n[u];
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
})), Qg = /* @__PURE__ */ br(((e, t) => {
  t.exports = Xg();
})), Zg = /* @__PURE__ */ br(((e, t) => {
  var n = Qg(), o = [
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
  }, a = (c) => o.includes(c), u = (c, d) => new Promise((h, f) => {
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
  t.exports = u, t.exports.default = u, t.exports.AbortError = r;
})), rl = /* @__PURE__ */ Sm(Zg(), 1), jg = void 0, e_ = void 0;
function t_() {
  return {
    geminiUrl: jg,
    vertexUrl: e_
  };
}
function n_(e, t, n, o) {
  var r, i;
  if (!e?.baseUrl) {
    const a = t_();
    return t ? (r = a.vertexUrl) !== null && r !== void 0 ? r : n : (i = a.geminiUrl) !== null && i !== void 0 ? i : o;
  }
  return e.baseUrl;
}
var rt = class {
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
  const o = t[t.length - 1], r = e[o];
  if (r !== void 0) {
    if (!n || typeof n == "object" && Object.keys(n).length === 0 || n === r) return;
    if (typeof r == "object" && typeof n == "object" && r !== null && n !== null) Object.assign(r, n);
    else throw new Error(`Cannot set value for an existing key. Key: ${o}`);
  } else o === "_self" && typeof n == "object" && n !== null && !Array.isArray(n) ? Object.assign(e, n) : e[o] = n;
}
function s(e, t, n = void 0) {
  try {
    if (t.length === 1 && t[0] === "_self") return e;
    for (let o = 0; o < t.length; o++) {
      if (typeof e != "object" || e === null) return n;
      const r = t[o];
      if (r.endsWith("[]")) {
        const i = r.slice(0, -2);
        if (i in e) {
          const a = e[i];
          return Array.isArray(a) ? a.map((u) => s(u, t.slice(o + 1), n)) : n;
        } else return n;
      } else e = e[r];
    }
    return e;
  } catch (o) {
    if (o instanceof TypeError) return n;
    throw o;
  }
}
function o_(e, t) {
  for (const [n, o] of Object.entries(t)) {
    const r = n.split("."), i = o.split("."), a = /* @__PURE__ */ new Set();
    let u = -1;
    for (let c = 0; c < r.length; c++) if (r[c] === "*") {
      u = c;
      break;
    }
    if (u !== -1 && i.length > u) for (let c = u; c < i.length; c++) {
      const d = i[c];
      d !== "*" && !d.endsWith("[]") && !d.endsWith("[0]") && a.add(d);
    }
    xi(e, r, i, 0, a);
  }
}
function xi(e, t, n, o, r) {
  if (o >= t.length || typeof e != "object" || e === null) return;
  const i = t[o];
  if (i.endsWith("[]")) {
    const a = i.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) xi(c, t, n, o + 1, r);
  } else if (i === "*") {
    if (typeof e == "object" && e !== null && !Array.isArray(e)) {
      const a = e, u = Object.keys(a).filter((d) => !d.startsWith("_") && !r.has(d)), c = {};
      for (const d of u) c[d] = a[d];
      for (const [d, h] of Object.entries(c)) {
        const f = [];
        for (const p of n.slice(o)) p === "*" ? f.push(d) : f.push(p);
        l(a, f, h);
      }
      for (const d of u) delete a[d];
    }
  } else {
    const a = e;
    i in a && xi(a[i], t, n, o + 1, r);
  }
}
function $s(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function r_(e) {
  const t = {}, n = s(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const o = s(e, ["resourceName"]);
  return o != null && l(t, ["_url", "resourceName"], o), t;
}
function i_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], a_(a)), t;
}
function s_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], l_(a)), t;
}
function a_(e) {
  const t = {}, n = s(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => u_(a))), l(t, ["generatedVideos"], i);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const r = s(e, ["raiMediaFilteredReasons"]);
  return r != null && l(t, ["raiMediaFilteredReasons"], r), t;
}
function l_(e) {
  const t = {}, n = s(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => c_(a))), l(t, ["generatedVideos"], i);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const r = s(e, ["raiMediaFilteredReasons"]);
  return r != null && l(t, ["raiMediaFilteredReasons"], r), t;
}
function u_(e) {
  const t = {}, n = s(e, ["video"]);
  return n != null && l(t, ["video"], g_(n)), t;
}
function c_(e) {
  const t = {}, n = s(e, ["_self"]);
  return n != null && l(t, ["video"], __(n)), t;
}
function d_(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function f_(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function h_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], p_(a)), t;
}
function p_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = s(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function Xd(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], m_(a)), t;
}
function m_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = s(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function g_(e) {
  const t = {}, n = s(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const o = s(e, ["encodedVideo"]);
  o != null && l(t, ["videoBytes"], $s(o));
  const r = s(e, ["encoding"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function __(e) {
  const t = {}, n = s(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const o = s(e, ["bytesBase64Encoded"]);
  o != null && l(t, ["videoBytes"], $s(o));
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
var il;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(il || (il = {}));
var sl;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(sl || (sl = {}));
var al;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(al || (al = {}));
var pt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(pt || (pt = {}));
var ll;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(ll || (ll = {}));
var ul;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(ul || (ul = {}));
var cl;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(cl || (cl = {}));
var dl;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(dl || (dl = {}));
var fl;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(fl || (fl = {}));
var hl;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(hl || (hl = {}));
var pl;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(pl || (pl = {}));
var zt;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(zt || (zt = {}));
var Yt;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Yt || (Yt = {}));
var ml;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(ml || (ml = {}));
var gl;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(gl || (gl = {}));
var _l;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(_l || (_l = {}));
var yl;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(yl || (yl = {}));
var vl;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(vl || (vl = {}));
var Al;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Al || (Al = {}));
var Tl;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Tl || (Tl = {}));
var Sl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Sl || (Sl = {}));
var El;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(El || (El = {}));
var Il;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Il || (Il = {}));
var wl;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(wl || (wl = {}));
var ur;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(ur || (ur = {}));
var Cl;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Cl || (Cl = {}));
var bl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(bl || (bl = {}));
var Rl;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Rl || (Rl = {}));
var Pl;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(Pl || (Pl = {}));
var Ni;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(Ni || (Ni = {}));
var Ml;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Ml || (Ml = {}));
var xl;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(xl || (xl = {}));
var Nl;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(Nl || (Nl = {}));
var kl;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(kl || (kl = {}));
var Dl;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Dl || (Dl = {}));
var $l;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})($l || ($l = {}));
var Ll;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(Ll || (Ll = {}));
var ki;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(ki || (ki = {}));
var Ul;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(Fl || (Fl = {}));
var cr;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(cr || (cr = {}));
var Ol;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(Ol || (Ol = {}));
var Gl;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(Gl || (Gl = {}));
var Bl;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(Bl || (Bl = {}));
var ql;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(ql || (ql = {}));
var Hl;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(Hl || (Hl = {}));
var Vl;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(Vl || (Vl = {}));
var Jl;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(Jl || (Jl = {}));
var Kl;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(Kl || (Kl = {}));
var Wl;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(Wl || (Wl = {}));
var zl;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(zl || (zl = {}));
var Yl;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(Xl || (Xl = {}));
var Ql;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(Ql || (Ql = {}));
var Zl;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(Zl || (Zl = {}));
var jl;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(jl || (jl = {}));
var eu;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(eu || (eu = {}));
var tu;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(tu || (tu = {}));
var nu;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(nu || (nu = {}));
var ou;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(ou || (ou = {}));
var ru;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(ru || (ru = {}));
var iu;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(iu || (iu = {}));
var su;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(su || (su = {}));
var au;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(au || (au = {}));
var Xt;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(Xt || (Xt = {}));
var Di = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, bn = class {
  get text() {
    var e, t, n, o, r, i, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning text from the first one.");
    let c = "", d = !1;
    const h = [];
    for (const f of (u = (a = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [p, m] of Object.entries(f)) p !== "text" && p !== "thought" && p !== "thoughtSignature" && (m !== null || m !== void 0) && h.push(p);
      if (typeof f.text == "string") {
        if (typeof f.thought == "boolean" && f.thought) continue;
        d = !0, c += f.text;
      }
    }
    return h.length > 0 && console.warn(`there are non-text parts ${h} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), d ? c : void 0;
  }
  get data() {
    var e, t, n, o, r, i, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning data from the first one.");
    let c = "";
    const d = [];
    for (const h of (u = (a = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) !== null && u !== void 0 ? u : []) {
      for (const [f, p] of Object.entries(h)) f !== "inlineData" && (p !== null || p !== void 0) && d.push(f);
      h.inlineData && typeof h.inlineData.data == "string" && (c += atob(h.inlineData.data));
    }
    return d.length > 0 && console.warn(`there are non-data parts ${d} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), c.length > 0 ? btoa(c) : void 0;
  }
  get functionCalls() {
    var e, t, n, o, r, i, a, u;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    const c = (u = (a = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((d) => d.functionCall).map((d) => d.functionCall).filter((d) => d !== void 0);
    if (c?.length !== 0)
      return c;
  }
  get executableCode() {
    var e, t, n, o, r, i, a, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    const d = (u = (a = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.executableCode).map((h) => h.executableCode).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.code;
  }
  get codeExecutionResult() {
    var e, t, n, o, r, i, a, u, c;
    if (((o = (n = (t = (e = this.candidates) === null || e === void 0 ? void 0 : e[0]) === null || t === void 0 ? void 0 : t.content) === null || n === void 0 ? void 0 : n.parts) === null || o === void 0 ? void 0 : o.length) === 0) return;
    this.candidates && this.candidates.length > 1 && console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    const d = (u = (a = (i = (r = this.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content) === null || a === void 0 ? void 0 : a.parts) === null || u === void 0 ? void 0 : u.filter((h) => h.codeExecutionResult).map((h) => h.codeExecutionResult).filter((h) => h !== void 0);
    if (d?.length !== 0)
      return (c = d?.[0]) === null || c === void 0 ? void 0 : c.output;
  }
}, lu = class {
}, uu = class {
}, y_ = class {
}, v_ = class {
}, A_ = class {
}, T_ = class {
}, cu = class {
}, du = class {
}, fu = class {
}, S_ = class {
}, hu = class Qd {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Qd();
    let r;
    const i = t;
    return n ? r = s_(i) : r = i_(i), Object.assign(o, r), o;
  }
}, pu = class {
}, mu = class {
}, gu = class {
}, _u = class {
}, E_ = class {
}, I_ = class {
}, w_ = class {
}, C_ = class Zd {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new Zd(), r = h_(t);
    return Object.assign(o, r), o;
  }
}, b_ = class {
}, R_ = class {
}, P_ = class {
}, M_ = class {
}, yu = class {
}, x_ = class {
  get text() {
    var e, t, n;
    let o = "", r = !1;
    const i = [];
    for (const a of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [u, c] of Object.entries(a)) u !== "text" && u !== "thought" && c !== null && i.push(u);
      if (typeof a.text == "string") {
        if (typeof a.thought == "boolean" && a.thought) continue;
        r = !0, o += a.text;
      }
    }
    return i.length > 0 && console.warn(`there are non-text parts ${i} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`), r ? o : void 0;
  }
  get data() {
    var e, t, n;
    let o = "";
    const r = [];
    for (const i of (n = (t = (e = this.serverContent) === null || e === void 0 ? void 0 : e.modelTurn) === null || t === void 0 ? void 0 : t.parts) !== null && n !== void 0 ? n : []) {
      for (const [a, u] of Object.entries(i)) a !== "inlineData" && u !== null && r.push(a);
      i.inlineData && typeof i.inlineData.data == "string" && (o += atob(i.inlineData.data));
    }
    return r.length > 0 && console.warn(`there are non-data parts ${r} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`), o.length > 0 ? btoa(o) : void 0;
  }
}, N_ = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, k_ = class jd {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new jd(), r = Xd(t);
    return Object.assign(o, r), o;
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
function ef(e, t) {
  const n = V(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function tf(e) {
  return Array.isArray(e) ? e.map((t) => dr(t)) : [dr(e)];
}
function dr(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function nf(e) {
  const t = dr(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function of(e) {
  const t = dr(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function vu(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function rf(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => vu(t)) : [vu(e)];
}
function $i(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Au(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function Tu(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function re(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return $i(e) ? e : {
    role: "user",
    parts: rf(e)
  };
}
function Ls(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const o = re(n);
    return o.parts && o.parts.length > 0 && o.parts[0].text !== void 0 ? [o.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = re(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => re(n)) : [re(t)];
}
function _e(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Au(e) || Tu(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [re(e)];
  }
  const t = [], n = [], o = $i(e[0]);
  for (const r of e) {
    const i = $i(r);
    if (i != o) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(r);
    else {
      if (Au(r) || Tu(r)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(r);
    }
  }
  return o || t.push({
    role: "user",
    parts: rf(n)
  }), t;
}
function D_(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((o) => o !== "null");
  if (n.length === 1) t.type = Object.values(pt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : pt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const o of n) t.anyOf.push({ type: Object.values(pt).includes(o.toUpperCase()) ? o.toUpperCase() : pt.TYPE_UNSPECIFIED });
  }
}
function nn(e) {
  const t = {}, n = ["items"], o = ["anyOf"], r = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && D_(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(pt).includes(u.toUpperCase()) ? u.toUpperCase() : pt.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = nn(u);
      else if (o.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(nn(d));
        }
        t[a] = c;
      } else if (r.includes(a)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = nn(h);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function Us(e) {
  return nn(e);
}
function Fs(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function Os(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function sn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = nn(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = nn(t.response));
  return e;
}
function an(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function $_(e, t, n, o = 1) {
  const r = !t.startsWith(`${n}/`) && t.split("/").length === o;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : r ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : r ? `${n}/${t}` : t;
}
function it(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return $_(e, t, "cachedContents");
}
function sf(e) {
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
function vt(e) {
  return $s(e);
}
function L_(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function U_(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function F_(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function af(e) {
  var t;
  let n;
  if (L_(e) && (n = e.name), !(F_(e) && (n = e.uri, n === void 0)) && !(U_(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const o = n.split("files/")[1].match(/[a-z0-9]+/);
      if (o === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = o[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function lf(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function uf(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (O_(e, t)) return e[t];
  return [];
}
function O_(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function G_(e, t = {}) {
  const n = e, o = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (o.responseJsonSchema = n.outputSchema), t.behavior && (o.behavior = t.behavior), { functionDeclarations: [o] };
}
function B_(e, t = {}) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = r.name;
    if (o.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    o.add(i);
    const a = G_(r, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function cf(e, t) {
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
function q_(e) {
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
function df(e) {
  if (typeof e != "object" || e === null) return {};
  const t = e, n = t.inlinedResponses;
  if (typeof n != "object" || n === null) return e;
  const o = n.inlinedResponses;
  if (!Array.isArray(o) || o.length === 0) return e;
  let r = !1;
  for (const i of o) {
    if (typeof i != "object" || i === null) continue;
    const a = i.response;
    if (!(typeof a != "object" || a === null) && a.embedding !== void 0) {
      r = !0;
      break;
    }
  }
  return r && (t.inlinedEmbedContentResponses = t.inlinedResponses, delete t.inlinedResponses), e;
}
function ln(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function ff(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function H_(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function V_(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function J_(e) {
  const t = {}, n = s(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const o = s(e, ["inlinedResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => wy(a))), l(t, ["inlinedResponses"], i);
  }
  const r = s(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function K_(e) {
  const t = {}, n = s(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const o = s(e, ["gcsDestination", "outputUriPrefix"]);
  o != null && l(t, ["gcsUri"], o);
  const r = s(e, ["bigqueryDestination", "outputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function W_(e) {
  const t = {}, n = s(e, ["format"]);
  n != null && l(t, ["predictionsFormat"], n);
  const o = s(e, ["gcsUri"]);
  o != null && l(t, ["gcsDestination", "outputUriPrefix"], o);
  const r = s(e, ["bigqueryUri"]);
  if (r != null && l(t, ["bigqueryDestination", "outputUri"], r), s(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedResponses"]) !== void 0) throw new Error("inlinedResponses parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedEmbedContentResponses"]) !== void 0) throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");
  return t;
}
function Qo(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata", "displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = s(e, ["metadata", "state"]);
  r != null && l(t, ["state"], ff(r));
  const i = s(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const a = s(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = s(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = s(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = s(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], J_(df(d))), t;
}
function Li(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = s(e, ["state"]);
  r != null && l(t, ["state"], ff(r));
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
  f != null && l(t, ["src"], z_(f));
  const p = s(e, ["outputConfig"]);
  p != null && l(t, ["dest"], K_(df(p)));
  const m = s(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function z_(e) {
  const t = {}, n = s(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const o = s(e, ["gcsSource", "uris"]);
  o != null && l(t, ["gcsUri"], o);
  const r = s(e, ["bigquerySource", "inputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function Y_(e, t) {
  const n = {};
  if (s(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (s(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (s(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = s(t, ["fileName"]);
  o != null && l(n, ["fileName"], o);
  const r = s(t, ["inlinedRequests"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => Iy(e, a))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function X_(e) {
  const t = {}, n = s(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const o = s(e, ["gcsUri"]);
  o != null && l(t, ["gcsSource", "uris"], o);
  const r = s(e, ["bigqueryUri"]);
  if (r != null && l(t, ["bigquerySource", "inputUri"], r), s(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function Q_(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Z_(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ln(e, o)), n;
}
function j_(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ln(e, o)), n;
}
function ey(e) {
  const t = {}, n = s(e, ["content"]);
  n != null && l(t, ["content"], n);
  const o = s(e, ["citationMetadata"]);
  o != null && l(t, ["citationMetadata"], ty(o));
  const r = s(e, ["tokenCount"]);
  r != null && l(t, ["tokenCount"], r);
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
function ty(e) {
  const t = {}, n = s(e, ["citationSources"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["citations"], o);
  }
  return t;
}
function hf(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Ny(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function ny(e, t) {
  const n = {}, o = s(e, ["displayName"]);
  if (t !== void 0 && o != null && l(t, ["batch", "displayName"], o), s(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const r = s(e, ["webhookConfig"]);
  return t !== void 0 && r != null && l(t, ["batch", "webhookConfig"], r), n;
}
function oy(e, t) {
  const n = {}, o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const r = s(e, ["dest"]);
  if (t !== void 0 && r != null && l(t, ["outputConfig"], W_(q_(r))), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Su(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["_url", "model"], V(e, o));
  const r = s(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], Y_(e, cf(e, r)));
  const i = s(t, ["config"]);
  return i != null && ny(i, n), n;
}
function ry(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["model"], V(e, o));
  const r = s(t, ["src"]);
  r != null && l(n, ["inputConfig"], X_(cf(e, r)));
  const i = s(t, ["config"]);
  return i != null && oy(i, n), n;
}
function iy(e, t) {
  const n = {}, o = s(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["batch", "displayName"], o), n;
}
function sy(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["_url", "model"], V(e, o));
  const r = s(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], hy(e, r));
  const i = s(t, ["config"]);
  return i != null && iy(i, n), n;
}
function ay(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ln(e, o)), n;
}
function ly(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ln(e, o)), n;
}
function uy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function cy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function dy(e, t) {
  const n = {}, o = s(t, ["contents"]);
  if (o != null) {
    let i = Ls(e, o);
    Array.isArray(i) && (i = i.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const r = s(t, ["config"]);
  return r != null && (l(n, ["_self"], fy(r, n)), o_(n, { "requests[].*": "requests[].request.*" })), n;
}
function fy(e, t) {
  const n = {}, o = s(e, ["taskType"]);
  t !== void 0 && o != null && l(t, ["requests[]", "taskType"], o);
  const r = s(e, ["title"]);
  t !== void 0 && r != null && l(t, ["requests[]", "title"], r);
  const i = s(e, ["outputDimensionality"]);
  if (t !== void 0 && i != null && l(t, ["requests[]", "outputDimensionality"], i), s(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (s(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (s(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (s(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return n;
}
function hy(e, t) {
  const n = {}, o = s(t, ["fileName"]);
  o != null && l(n, ["file_name"], o);
  const r = s(t, ["inlinedRequests"]);
  return r != null && l(n, ["requests"], dy(e, r)), n;
}
function py(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function my(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = s(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = s(e, ["name"]);
  if (r != null && l(t, ["name"], r), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function gy(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = s(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function _y(e, t, n) {
  const o = {}, r = s(t, ["systemInstruction"]);
  n !== void 0 && r != null && l(n, ["systemInstruction"], hf(re(r)));
  const i = s(t, ["temperature"]);
  i != null && l(o, ["temperature"], i);
  const a = s(t, ["topP"]);
  a != null && l(o, ["topP"], a);
  const u = s(t, ["topK"]);
  u != null && l(o, ["topK"], u);
  const c = s(t, ["candidateCount"]);
  c != null && l(o, ["candidateCount"], c);
  const d = s(t, ["maxOutputTokens"]);
  d != null && l(o, ["maxOutputTokens"], d);
  const h = s(t, ["stopSequences"]);
  h != null && l(o, ["stopSequences"], h);
  const f = s(t, ["responseLogprobs"]);
  f != null && l(o, ["responseLogprobs"], f);
  const p = s(t, ["logprobs"]);
  p != null && l(o, ["logprobs"], p);
  const m = s(t, ["presencePenalty"]);
  m != null && l(o, ["presencePenalty"], m);
  const g = s(t, ["frequencyPenalty"]);
  g != null && l(o, ["frequencyPenalty"], g);
  const _ = s(t, ["seed"]);
  _ != null && l(o, ["seed"], _);
  const y = s(t, ["responseMimeType"]);
  y != null && l(o, ["responseMimeType"], y);
  const S = s(t, ["responseSchema"]);
  S != null && l(o, ["responseSchema"], Us(S));
  const I = s(t, ["responseJsonSchema"]);
  if (I != null && l(o, ["responseJsonSchema"], I), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const b = s(t, ["safetySettings"]);
  if (n !== void 0 && b != null) {
    let W = b;
    Array.isArray(W) && (W = W.map((K) => ky(K))), l(n, ["safetySettings"], W);
  }
  const P = s(t, ["tools"]);
  if (n !== void 0 && P != null) {
    let W = an(P);
    Array.isArray(W) && (W = W.map((K) => $y(sn(K)))), l(n, ["tools"], W);
  }
  const D = s(t, ["toolConfig"]);
  if (n !== void 0 && D != null && l(n, ["toolConfig"], Dy(D)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const E = s(t, ["cachedContent"]);
  n !== void 0 && E != null && l(n, ["cachedContent"], it(e, E));
  const L = s(t, ["responseModalities"]);
  L != null && l(o, ["responseModalities"], L);
  const w = s(t, ["mediaResolution"]);
  w != null && l(o, ["mediaResolution"], w);
  const M = s(t, ["speechConfig"]);
  if (M != null && l(o, ["speechConfig"], Fs(M)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const F = s(t, ["thinkingConfig"]);
  F != null && l(o, ["thinkingConfig"], F);
  const H = s(t, ["imageConfig"]);
  H != null && l(o, ["imageConfig"], Ey(H));
  const le = s(t, ["enableEnhancedCivicAnswers"]);
  if (le != null && l(o, ["enableEnhancedCivicAnswers"], le), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const z = s(t, ["serviceTier"]);
  return n !== void 0 && z != null && l(n, ["serviceTier"], z), o;
}
function yy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((h) => ey(h))), l(t, ["candidates"], d);
  }
  const r = s(e, ["modelVersion"]);
  r != null && l(t, ["modelVersion"], r);
  const i = s(e, ["promptFeedback"]);
  i != null && l(t, ["promptFeedback"], i);
  const a = s(e, ["responseId"]);
  a != null && l(t, ["responseId"], a);
  const u = s(e, ["usageMetadata"]);
  u != null && l(t, ["usageMetadata"], u);
  const c = s(e, ["modelStatus"]);
  return c != null && l(t, ["modelStatus"], c), t;
}
function vy(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ln(e, o)), n;
}
function Ay(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], ln(e, o)), n;
}
function Ty(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], V_(n));
  const o = s(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Sy(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Ey(e) {
  const t = {}, n = s(e, ["aspectRatio"]);
  n != null && l(t, ["aspectRatio"], n);
  const o = s(e, ["imageSize"]);
  if (o != null && l(t, ["imageSize"], o), s(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (s(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (s(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (s(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return t;
}
function Iy(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["request", "model"], V(e, o));
  const r = s(t, ["contents"]);
  if (r != null) {
    let u = _e(r);
    Array.isArray(u) && (u = u.map((c) => hf(c))), l(n, ["request", "contents"], u);
  }
  const i = s(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = s(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], _y(e, a, s(n, ["request"], {}))), n;
}
function wy(e) {
  const t = {}, n = s(e, ["response"]);
  n != null && l(t, ["response"], yy(n));
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["error"]);
  return r != null && l(t, ["error"], r), t;
}
function Cy(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  if (t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), s(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function by(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  t !== void 0 && r != null && l(t, ["_query", "pageToken"], r);
  const i = s(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function Ry(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && Cy(n, t), t;
}
function Py(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && by(n, t), t;
}
function My(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["operations"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => Qo(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function xy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["batchPredictionJobs"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => Li(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Ny(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], py(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], my(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Q_(c));
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
function ky(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function Dy(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = s(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], gy(o));
  const r = s(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function $y(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = s(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], Sy(r));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Ty(i));
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
var ot;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(ot || (ot = {}));
var Lt = class {
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
}, Ly = class extends rt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Lt(ot.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Su(this.apiClient, e), n = t._url, o = x("{model}:batchGenerateContent", n), r = t.batch.inputConfig.requests, i = r.requests, a = [];
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
    return r.requests = a, delete t.config, delete t._url, delete t._query, {
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
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ry(this.apiClient, e);
      return a = x("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Li(d));
    } else {
      const c = Su(this.apiClient, e);
      return a = x("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => Qo(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = sy(this.apiClient, e);
      return r = x("{model}:asyncBatchEmbedContent", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => Qo(u));
    }
  }
  async get(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Ay(this.apiClient, e);
      return a = x("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Li(d));
    } else {
      const c = vy(this.apiClient, e);
      return a = x("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => Qo(d));
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = j_(this.apiClient, e);
      i = x("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = Z_(this.apiClient, e);
      i = x("batches/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      });
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Py(e);
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
        const h = xy(d), f = new yu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Ry(e);
      return a = x("batches", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = My(d), f = new yu();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ly(this.apiClient, e);
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
      })), i.then((d) => cy(d));
    } else {
      const c = ay(this.apiClient, e);
      return a = x("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => uy(d));
    }
  }
};
function Uy(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Fy(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Eu(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => av(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Iu(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => lv(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Oy(e, t) {
  const n = {}, o = s(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = s(e, ["expireTime"]);
  t !== void 0 && r != null && l(t, ["expireTime"], r);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let h = _e(a);
    Array.isArray(h) && (h = h.map((f) => Eu(f))), l(t, ["contents"], h);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Eu(re(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => dv(f))), l(t, ["tools"], h);
  }
  const d = s(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], uv(d)), s(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function Gy(e, t) {
  const n = {}, o = s(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = s(e, ["expireTime"]);
  t !== void 0 && r != null && l(t, ["expireTime"], r);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = _e(a);
    Array.isArray(f) && (f = f.map((p) => Iu(p))), l(t, ["contents"], f);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Iu(re(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => fv(p))), l(t, ["tools"], f);
  }
  const d = s(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], cv(d));
  const h = s(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function By(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["model"], ef(e, o));
  const r = s(t, ["config"]);
  return r != null && Oy(r, n), n;
}
function qy(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["model"], ef(e, o));
  const r = s(t, ["config"]);
  return r != null && Gy(r, n), n;
}
function Hy(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], it(e, o)), n;
}
function Vy(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], it(e, o)), n;
}
function Jy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Ky(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Wy(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function zy(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = s(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = s(e, ["name"]);
  if (r != null && l(t, ["name"], r), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Yy(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = s(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Xy(e) {
  const t = {}, n = s(e, ["description"]);
  n != null && l(t, ["description"], n);
  const o = s(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = s(e, ["parameters"]);
  r != null && l(t, ["parameters"], r);
  const i = s(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const a = s(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = s(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), s(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function Qy(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], it(e, o)), n;
}
function Zy(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], it(e, o)), n;
}
function jy(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Uy(n));
  const o = s(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function ev(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function tv(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function nv(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function ov(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && tv(n, t), t;
}
function rv(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && nv(n, t), t;
}
function iv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["cachedContents"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["cachedContents"], i);
  }
  return t;
}
function sv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["cachedContents"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["cachedContents"], i);
  }
  return t;
}
function av(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], Wy(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], zy(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Fy(c));
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
function lv(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
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
function uv(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = s(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], Yy(o));
  const r = s(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function cv(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = s(e, ["functionCallingConfig"]);
  if (o != null && l(t, ["functionCallingConfig"], o), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function dv(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = s(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], ev(r));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], jy(i));
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
function fv(e) {
  const t = {}, n = s(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const o = s(e, ["computerUse"]);
  if (o != null && l(t, ["computerUse"], o), s(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], r);
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const a = s(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = s(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = s(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => Xy(m))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function hv(e, t) {
  const n = {}, o = s(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = s(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function pv(e, t) {
  const n = {}, o = s(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = s(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function mv(e, t) {
  const n = {}, o = s(t, ["name"]);
  o != null && l(n, ["_url", "name"], it(e, o));
  const r = s(t, ["config"]);
  return r != null && hv(r, n), n;
}
function gv(e, t) {
  const n = {}, o = s(t, ["name"]);
  o != null && l(n, ["_url", "name"], it(e, o));
  const r = s(t, ["config"]);
  return r != null && pv(r, n), n;
}
var _v = class extends rt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Lt(ot.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = qy(this.apiClient, e);
      return a = x("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = By(this.apiClient, e);
      return a = x("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
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
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Zy(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Qy(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
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
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Vy(this.apiClient, e);
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
        const h = Ky(d), f = new gu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Hy(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Jy(d), f = new gu();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = gv(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = mv(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
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
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = rv(e);
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
        const h = sv(d), f = new _u();
        return Object.assign(f, h), f;
      });
    } else {
      const c = ov(e);
      return a = x("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = iv(d), f = new _u();
        return Object.assign(f, h), f;
      });
    }
  }
};
function mt(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++) t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
function wu(e) {
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
function B(e) {
  return this instanceof B ? (this.v = e, this) : new B(e);
}
function Be(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var o = n.apply(e, t || []), r, i = [];
  return r = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), u("next"), u("throw"), u("return", a), r[Symbol.asyncIterator] = function() {
    return this;
  }, r;
  function a(m) {
    return function(g) {
      return Promise.resolve(g).then(m, f);
    };
  }
  function u(m, g) {
    o[m] && (r[m] = function(_) {
      return new Promise(function(y, S) {
        i.push([
          m,
          _,
          y,
          S
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
function qe(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof wu == "function" ? wu(e) : e[Symbol.iterator](), n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function o(i) {
    n[i] = e[i] && function(a) {
      return new Promise(function(u, c) {
        a = e[i](a), r(u, c, a.done, a.value);
      });
    };
  }
  function r(i, a, u, c) {
    Promise.resolve(c).then(function(d) {
      i({
        value: d,
        done: u
      });
    }, a);
  }
}
function yv(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : pf(n);
}
function pf(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function vv(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Cu(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let o = 0;
  for (; o < n; ) if (e[o].role === "user")
    t.push(e[o]), o++;
  else {
    const r = [];
    let i = !0;
    for (; o < n && e[o].role === "model"; )
      r.push(e[o]), i && !pf(e[o]) && (i = !1), o++;
    i ? t.push(...r) : t.pop();
  }
  return t;
}
var Av = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new Tv(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, Tv = class {
  constructor(e, t, n, o = {}, r = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = o, this.history = r, this.sendPromise = Promise.resolve(), vv(r);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = re(e.message), o = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(!0).concat(n),
      config: (t = e.config) !== null && t !== void 0 ? t : this.config
    });
    return this.sendPromise = (async () => {
      var r, i, a;
      const u = await o, c = (i = (r = u.candidates) === null || r === void 0 ? void 0 : r[0]) === null || i === void 0 ? void 0 : i.content, d = u.automaticFunctionCallingHistory, h = this.getHistory(!0).length;
      let f = [];
      d != null && (f = (a = d.slice(h)) !== null && a !== void 0 ? a : []);
      const p = c ? [c] : [];
      this.recordHistory(n, p, f);
    })(), await this.sendPromise.catch(() => {
      this.sendPromise = Promise.resolve();
    }), o;
  }
  async sendMessageStream(e) {
    var t;
    await this.sendPromise;
    const n = re(e.message), o = this.modelsModule.generateContentStream({
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
    const t = e ? Cu(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return Be(this, arguments, function* () {
      var o, r, i, a, u, c;
      const d = [];
      try {
        for (var h = !0, f = qe(e), p; p = yield B(f.next()), o = p.done, !o; h = !0) {
          a = p.value, h = !1;
          const m = a;
          if (yv(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield B(m);
        }
      } catch (m) {
        r = { error: m };
      } finally {
        try {
          !h && !o && (i = f.return) && (yield B(i.call(f)));
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
    }), n && n.length > 0 ? this.history.push(...Cu(n)) : this.history.push(e), this.history.push(...o);
  }
}, mf = class gf extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, gf.prototype);
  }
};
function Sv(e) {
  const t = {}, n = s(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function Ev(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Iv(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], af(n)), t;
}
function wv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Cv(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], af(n)), t;
}
function bv(e) {
  const t = {}, n = s(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function Rv(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function Pv(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && Rv(n, t), t;
}
function Mv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["files"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["files"], i);
  }
  return t;
}
function xv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["files"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(t, ["files"], r);
  }
  return t;
}
var Nv = class extends rt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Lt(ot.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const a = Pv(e);
      return r = x("files", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = Mv(u), d = new b_();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Sv(e);
      return r = x("upload/v1beta/files", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = Ev(u), d = new R_();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Cv(e);
      return r = x("files/{file}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
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
      const a = Iv(e);
      return r = x("files/{file}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "DELETE",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = wv(u), d = new P_();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = bv(e);
      return r = x("files:register", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = xv(u), d = new M_();
        return Object.assign(d, c), d;
      });
    }
  }
};
function bu(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function kv(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Zo(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Dv(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Qv(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function $v(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Zv(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Lv(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Uv(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = s(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = s(e, ["name"]);
  if (r != null && l(t, ["name"], r), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Fv(e) {
  const t = {}, n = s(e, ["description"]);
  n != null && l(t, ["description"], n);
  const o = s(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = s(e, ["parameters"]);
  r != null && l(t, ["parameters"], r);
  const i = s(e, ["parametersJsonSchema"]);
  i != null && l(t, ["parametersJsonSchema"], i);
  const a = s(e, ["response"]);
  a != null && l(t, ["response"], a);
  const u = s(e, ["responseJsonSchema"]);
  if (u != null && l(t, ["responseJsonSchema"], u), s(e, ["behavior"]) !== void 0) throw new Error("behavior parameter is not supported in Vertex AI.");
  return t;
}
function Ov(e) {
  const t = {}, n = s(e, ["modelSelectionConfig"]);
  n != null && l(t, ["modelConfig"], n);
  const o = s(e, ["responseJsonSchema"]);
  o != null && l(t, ["responseJsonSchema"], o);
  const r = s(e, ["audioTimestamp"]);
  r != null && l(t, ["audioTimestamp"], r);
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
  const I = s(e, ["speechConfig"]);
  I != null && l(t, ["speechConfig"], I);
  const b = s(e, ["stopSequences"]);
  b != null && l(t, ["stopSequences"], b);
  const P = s(e, ["temperature"]);
  P != null && l(t, ["temperature"], P);
  const D = s(e, ["thinkingConfig"]);
  D != null && l(t, ["thinkingConfig"], D);
  const E = s(e, ["topK"]);
  E != null && l(t, ["topK"], E);
  const L = s(e, ["topP"]);
  if (L != null && l(t, ["topP"], L), s(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function Gv(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], kv(n));
  const o = s(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Bv(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function qv(e, t) {
  const n = {}, o = s(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], o);
  const r = s(e, ["responseModalities"]);
  t !== void 0 && r != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], r);
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
  ], Os(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Dv(re(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let w = an(_);
    Array.isArray(w) && (w = w.map((M) => tA(sn(M)))), l(t, ["setup", "tools"], w);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], eA(y));
  const S = s(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], bu(S));
  const I = s(e, ["outputAudioTranscription"]);
  t !== void 0 && I != null && l(t, ["setup", "outputAudioTranscription"], bu(I));
  const b = s(e, ["realtimeInputConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "realtimeInputConfig"], b);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const D = s(e, ["proactivity"]);
  if (t !== void 0 && D != null && l(t, ["setup", "proactivity"], D), s(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const E = s(e, ["avatarConfig"]);
  t !== void 0 && E != null && l(t, ["setup", "avatarConfig"], E);
  const L = s(e, ["safetySettings"]);
  if (t !== void 0 && L != null) {
    let w = L;
    Array.isArray(w) && (w = w.map((M) => jv(M))), l(t, ["setup", "safetySettings"], w);
  }
  return n;
}
function Hv(e, t) {
  const n = {}, o = s(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], Ov(o));
  const r = s(e, ["responseModalities"]);
  t !== void 0 && r != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], r);
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
  ], Os(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], $v(re(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let M = an(_);
    Array.isArray(M) && (M = M.map((F) => nA(sn(F)))), l(t, ["setup", "tools"], M);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], y);
  const S = s(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], S);
  const I = s(e, ["outputAudioTranscription"]);
  t !== void 0 && I != null && l(t, ["setup", "outputAudioTranscription"], I);
  const b = s(e, ["realtimeInputConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "realtimeInputConfig"], b);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const D = s(e, ["proactivity"]);
  t !== void 0 && D != null && l(t, ["setup", "proactivity"], D);
  const E = s(e, ["explicitVadSignal"]);
  t !== void 0 && E != null && l(t, ["setup", "explicitVadSignal"], E);
  const L = s(e, ["avatarConfig"]);
  t !== void 0 && L != null && l(t, ["setup", "avatarConfig"], L);
  const w = s(e, ["safetySettings"]);
  if (t !== void 0 && w != null) {
    let M = w;
    Array.isArray(M) && (M = M.map((F) => F)), l(t, ["setup", "safetySettings"], M);
  }
  return n;
}
function Vv(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["setup", "model"], V(e, o));
  const r = s(t, ["config"]);
  return r != null && l(n, ["config"], qv(r, n)), n;
}
function Jv(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["setup", "model"], V(e, o));
  const r = s(t, ["config"]);
  return r != null && l(n, ["config"], Hv(r, n)), n;
}
function Kv(e) {
  const t = {}, n = s(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function Wv(e) {
  const t = {}, n = s(e, ["weightedPrompts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["weightedPrompts"], o);
  }
  return t;
}
function zv(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = tf(n);
    Array.isArray(d) && (d = d.map((h) => Zo(h))), l(t, ["mediaChunks"], d);
  }
  const o = s(e, ["audio"]);
  o != null && l(t, ["audio"], Zo(of(o)));
  const r = s(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], Zo(nf(i)));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function Yv(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = tf(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const o = s(e, ["audio"]);
  o != null && l(t, ["audio"], of(o));
  const r = s(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], nf(i));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function Xv(e) {
  const t = {}, n = s(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const o = s(e, ["serverContent"]);
  o != null && l(t, ["serverContent"], o);
  const r = s(e, ["toolCall"]);
  r != null && l(t, ["toolCall"], r);
  const i = s(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const a = s(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], oA(a));
  const u = s(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = s(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = s(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = s(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], rA(h)), t;
}
function Qv(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], Lv(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Uv(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Zo(c));
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
function Zv(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
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
function jv(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function eA(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function tA(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = s(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], Bv(r));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Gv(i));
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
function nA(e) {
  const t = {}, n = s(e, ["retrieval"]);
  n != null && l(t, ["retrieval"], n);
  const o = s(e, ["computerUse"]);
  if (o != null && l(t, ["computerUse"], o), s(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], r);
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], i);
  const a = s(e, ["codeExecution"]);
  a != null && l(t, ["codeExecution"], a);
  const u = s(e, ["enterpriseWebSearch"]);
  u != null && l(t, ["enterpriseWebSearch"], u);
  const c = s(e, ["functionDeclarations"]);
  if (c != null) {
    let p = c;
    Array.isArray(p) && (p = p.map((m) => Fv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function oA(e) {
  const t = {}, n = s(e, ["promptTokenCount"]);
  n != null && l(t, ["promptTokenCount"], n);
  const o = s(e, ["cachedContentTokenCount"]);
  o != null && l(t, ["cachedContentTokenCount"], o);
  const r = s(e, ["candidatesTokenCount"]);
  r != null && l(t, ["responseTokenCount"], r);
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
function rA(e) {
  const t = {}, n = s(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function iA(e, t) {
  const n = {}, o = s(e, ["apiKey"]);
  if (o != null && l(n, ["apiKey"], o), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function sA(e, t) {
  const n = {}, o = s(e, ["data"]);
  if (o != null && l(n, ["data"], o), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function aA(e, t) {
  const n = {}, o = s(e, ["content"]);
  o != null && l(n, ["content"], o);
  const r = s(e, ["citationMetadata"]);
  r != null && l(n, ["citationMetadata"], lA(r));
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
function lA(e, t) {
  const n = {}, o = s(e, ["citationSources"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(n, ["citations"], r);
  }
  return n;
}
function uA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let a = _e(i);
    Array.isArray(a) && (a = a.map((u) => un(u))), l(o, ["contents"], a);
  }
  return o;
}
function cA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["tokensInfo"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function dA(e, t) {
  const n = {}, o = s(e, ["values"]);
  o != null && l(n, ["values"], o);
  const r = s(e, ["statistics"]);
  return r != null && l(n, ["statistics"], fA(r)), n;
}
function fA(e, t) {
  const n = {}, o = s(e, ["truncated"]);
  o != null && l(n, ["truncated"], o);
  const r = s(e, ["token_count"]);
  return r != null && l(n, ["tokenCount"], r), n;
}
function po(e, t) {
  const n = {}, o = s(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => TT(a))), l(n, ["parts"], i);
  }
  const r = s(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function un(e, t) {
  const n = {}, o = s(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => ST(a))), l(n, ["parts"], i);
  }
  const r = s(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function hA(e, t) {
  const n = {}, o = s(e, ["controlType"]);
  o != null && l(n, ["controlType"], o);
  const r = s(e, ["enableControlImageComputation"]);
  return r != null && l(n, ["computeControl"], r), n;
}
function pA(e, t) {
  const n = {};
  if (s(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (s(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (s(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function mA(e, t, n) {
  const o = {}, r = s(e, ["systemInstruction"]);
  t !== void 0 && r != null && l(t, ["systemInstruction"], un(re(r)));
  const i = s(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => Af(c))), l(t, ["tools"], u);
  }
  const a = s(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], sT(a)), o;
}
function gA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = _e(i);
    Array.isArray(u) && (u = u.map((c) => po(c))), l(o, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && pA(a), o;
}
function _A(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = _e(i);
    Array.isArray(u) && (u = u.map((c) => un(c))), l(o, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && mA(a, o), o;
}
function yA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["totalTokens"]);
  r != null && l(n, ["totalTokens"], r);
  const i = s(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function vA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["totalTokens"]);
  return r != null && l(n, ["totalTokens"], r), n;
}
function AA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function TA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function SA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function EA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function IA(e, t, n) {
  const o = {}, r = s(e, ["outputGcsUri"]);
  t !== void 0 && r != null && l(t, ["parameters", "storageUri"], r);
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
  const I = s(e, ["labels"]);
  t !== void 0 && I != null && l(t, ["labels"], I);
  const b = s(e, ["editMode"]);
  t !== void 0 && b != null && l(t, ["parameters", "editMode"], b);
  const P = s(e, ["baseSteps"]);
  return t !== void 0 && P != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], P), o;
}
function wA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => RT(d))), l(o, ["instances[0]", "referenceImages"], c);
  }
  const u = s(t, ["config"]);
  return u != null && IA(u, o), o;
}
function CA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => xr(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function bA(e, t, n) {
  const o = {}, r = s(e, ["taskType"]);
  t !== void 0 && r != null && l(t, ["requests[]", "taskType"], r);
  const i = s(e, ["title"]);
  t !== void 0 && i != null && l(t, ["requests[]", "title"], i);
  const a = s(e, ["outputDimensionality"]);
  if (t !== void 0 && a != null && l(t, ["requests[]", "outputDimensionality"], a), s(e, ["mimeType"]) !== void 0) throw new Error("mimeType parameter is not supported in Gemini API.");
  if (s(e, ["autoTruncate"]) !== void 0) throw new Error("autoTruncate parameter is not supported in Gemini API.");
  if (s(e, ["documentOcr"]) !== void 0) throw new Error("documentOcr parameter is not supported in Gemini API.");
  if (s(e, ["audioTrackExtraction"]) !== void 0) throw new Error("audioTrackExtraction parameter is not supported in Gemini API.");
  return o;
}
function RA(e, t, n) {
  const o = {};
  let r = s(n, ["embeddingApiType"]);
  if (r === void 0 && (r = "PREDICT"), r === "PREDICT") {
    const f = s(e, ["taskType"]);
    t !== void 0 && f != null && l(t, ["instances[]", "task_type"], f);
  } else if (r === "EMBED_CONTENT") {
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
  return o;
}
function PA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let d = Ls(e, i);
    Array.isArray(d) && (d = d.map((h) => h)), l(o, ["requests[]", "content"], d);
  }
  const a = s(t, ["content"]);
  a != null && po(re(a));
  const u = s(t, ["config"]);
  u != null && bA(u, o);
  const c = s(t, ["model"]);
  return c !== void 0 && l(o, ["requests[]", "model"], V(e, c)), o;
}
function MA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  let i = s(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = s(t, ["contents"]);
    if (c != null) {
      let d = Ls(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(o, ["instances[]", "content"], d);
    }
  }
  let a = s(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = s(t, ["content"]);
    c != null && l(o, ["content"], un(re(c)));
  }
  const u = s(t, ["config"]);
  return u != null && RA(u, o, n), o;
}
function xA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["embeddings"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => u)), l(n, ["embeddings"], a);
  }
  const i = s(e, ["metadata"]);
  return i != null && l(n, ["metadata"], i), n;
}
function NA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions[]", "embeddings"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => dA(u))), l(n, ["embeddings"], a);
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
function kA(e, t) {
  const n = {}, o = s(e, ["endpoint"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["deployedModelId"]);
  return r != null && l(n, ["deployedModelId"], r), n;
}
function DA(e, t) {
  const n = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["fileUri"]);
  o != null && l(n, ["fileUri"], o);
  const r = s(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function $A(e, t) {
  const n = {}, o = s(e, ["id"]);
  o != null && l(n, ["id"], o);
  const r = s(e, ["args"]);
  r != null && l(n, ["args"], r);
  const i = s(e, ["name"]);
  if (i != null && l(n, ["name"], i), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function LA(e, t) {
  const n = {}, o = s(e, ["allowedFunctionNames"]);
  o != null && l(n, ["allowedFunctionNames"], o);
  const r = s(e, ["mode"]);
  if (r != null && l(n, ["mode"], r), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function UA(e, t) {
  const n = {}, o = s(e, ["description"]);
  o != null && l(n, ["description"], o);
  const r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
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
function FA(e, t, n, o) {
  const r = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], po(re(i)));
  const a = s(t, ["temperature"]);
  a != null && l(r, ["temperature"], a);
  const u = s(t, ["topP"]);
  u != null && l(r, ["topP"], u);
  const c = s(t, ["topK"]);
  c != null && l(r, ["topK"], c);
  const d = s(t, ["candidateCount"]);
  d != null && l(r, ["candidateCount"], d);
  const h = s(t, ["maxOutputTokens"]);
  h != null && l(r, ["maxOutputTokens"], h);
  const f = s(t, ["stopSequences"]);
  f != null && l(r, ["stopSequences"], f);
  const p = s(t, ["responseLogprobs"]);
  p != null && l(r, ["responseLogprobs"], p);
  const m = s(t, ["logprobs"]);
  m != null && l(r, ["logprobs"], m);
  const g = s(t, ["presencePenalty"]);
  g != null && l(r, ["presencePenalty"], g);
  const _ = s(t, ["frequencyPenalty"]);
  _ != null && l(r, ["frequencyPenalty"], _);
  const y = s(t, ["seed"]);
  y != null && l(r, ["seed"], y);
  const S = s(t, ["responseMimeType"]);
  S != null && l(r, ["responseMimeType"], S);
  const I = s(t, ["responseSchema"]);
  I != null && l(r, ["responseSchema"], Us(I));
  const b = s(t, ["responseJsonSchema"]);
  if (b != null && l(r, ["responseJsonSchema"], b), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = s(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let K = P;
    Array.isArray(K) && (K = K.map((pe) => PT(pe))), l(n, ["safetySettings"], K);
  }
  const D = s(t, ["tools"]);
  if (n !== void 0 && D != null) {
    let K = an(D);
    Array.isArray(K) && (K = K.map((pe) => UT(sn(pe)))), l(n, ["tools"], K);
  }
  const E = s(t, ["toolConfig"]);
  if (n !== void 0 && E != null && l(n, ["toolConfig"], $T(E)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const L = s(t, ["cachedContent"]);
  n !== void 0 && L != null && l(n, ["cachedContent"], it(e, L));
  const w = s(t, ["responseModalities"]);
  w != null && l(r, ["responseModalities"], w);
  const M = s(t, ["mediaResolution"]);
  M != null && l(r, ["mediaResolution"], M);
  const F = s(t, ["speechConfig"]);
  if (F != null && l(r, ["speechConfig"], Fs(F)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = s(t, ["thinkingConfig"]);
  H != null && l(r, ["thinkingConfig"], H);
  const le = s(t, ["imageConfig"]);
  le != null && l(r, ["imageConfig"], dT(le));
  const z = s(t, ["enableEnhancedCivicAnswers"]);
  if (z != null && l(r, ["enableEnhancedCivicAnswers"], z), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const W = s(t, ["serviceTier"]);
  return n !== void 0 && W != null && l(n, ["serviceTier"], W), r;
}
function OA(e, t, n, o) {
  const r = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], un(re(i)));
  const a = s(t, ["temperature"]);
  a != null && l(r, ["temperature"], a);
  const u = s(t, ["topP"]);
  u != null && l(r, ["topP"], u);
  const c = s(t, ["topK"]);
  c != null && l(r, ["topK"], c);
  const d = s(t, ["candidateCount"]);
  d != null && l(r, ["candidateCount"], d);
  const h = s(t, ["maxOutputTokens"]);
  h != null && l(r, ["maxOutputTokens"], h);
  const f = s(t, ["stopSequences"]);
  f != null && l(r, ["stopSequences"], f);
  const p = s(t, ["responseLogprobs"]);
  p != null && l(r, ["responseLogprobs"], p);
  const m = s(t, ["logprobs"]);
  m != null && l(r, ["logprobs"], m);
  const g = s(t, ["presencePenalty"]);
  g != null && l(r, ["presencePenalty"], g);
  const _ = s(t, ["frequencyPenalty"]);
  _ != null && l(r, ["frequencyPenalty"], _);
  const y = s(t, ["seed"]);
  y != null && l(r, ["seed"], y);
  const S = s(t, ["responseMimeType"]);
  S != null && l(r, ["responseMimeType"], S);
  const I = s(t, ["responseSchema"]);
  I != null && l(r, ["responseSchema"], Us(I));
  const b = s(t, ["responseJsonSchema"]);
  b != null && l(r, ["responseJsonSchema"], b);
  const P = s(t, ["routingConfig"]);
  P != null && l(r, ["routingConfig"], P);
  const D = s(t, ["modelSelectionConfig"]);
  D != null && l(r, ["modelConfig"], D);
  const E = s(t, ["safetySettings"]);
  if (n !== void 0 && E != null) {
    let $e = E;
    Array.isArray($e) && ($e = $e.map((Wr) => Wr)), l(n, ["safetySettings"], $e);
  }
  const L = s(t, ["tools"]);
  if (n !== void 0 && L != null) {
    let $e = an(L);
    Array.isArray($e) && ($e = $e.map((Wr) => Af(sn(Wr)))), l(n, ["tools"], $e);
  }
  const w = s(t, ["toolConfig"]);
  n !== void 0 && w != null && l(n, ["toolConfig"], LT(w));
  const M = s(t, ["labels"]);
  n !== void 0 && M != null && l(n, ["labels"], M);
  const F = s(t, ["cachedContent"]);
  n !== void 0 && F != null && l(n, ["cachedContent"], it(e, F));
  const H = s(t, ["responseModalities"]);
  H != null && l(r, ["responseModalities"], H);
  const le = s(t, ["mediaResolution"]);
  le != null && l(r, ["mediaResolution"], le);
  const z = s(t, ["speechConfig"]);
  z != null && l(r, ["speechConfig"], Fs(z));
  const W = s(t, ["audioTimestamp"]);
  W != null && l(r, ["audioTimestamp"], W);
  const K = s(t, ["thinkingConfig"]);
  K != null && l(r, ["thinkingConfig"], K);
  const pe = s(t, ["imageConfig"]);
  if (pe != null && l(r, ["imageConfig"], fT(pe)), s(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const ze = s(t, ["modelArmorConfig"]);
  n !== void 0 && ze != null && l(n, ["modelArmorConfig"], ze);
  const At = s(t, ["serviceTier"]);
  return n !== void 0 && At != null && l(n, ["serviceTier"], At), r;
}
function Ru(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = _e(i);
    Array.isArray(u) && (u = u.map((c) => po(c))), l(o, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(o, ["generationConfig"], FA(e, a, o)), o;
}
function Pu(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = _e(i);
    Array.isArray(u) && (u = u.map((c) => un(c))), l(o, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(o, ["generationConfig"], OA(e, a, o)), o;
}
function Mu(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["candidates"]);
  if (r != null) {
    let h = r;
    Array.isArray(h) && (h = h.map((f) => aA(f))), l(n, ["candidates"], h);
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
function xu(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["candidates"]);
  if (r != null) {
    let h = r;
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
function GA(e, t, n) {
  const o = {};
  if (s(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  if (s(e, ["negativePrompt"]) !== void 0) throw new Error("negativePrompt parameter is not supported in Gemini API.");
  const r = s(e, ["numberOfImages"]);
  t !== void 0 && r != null && l(t, ["parameters", "sampleCount"], r);
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
  return o;
}
function BA(e, t, n) {
  const o = {}, r = s(e, ["outputGcsUri"]);
  t !== void 0 && r != null && l(t, ["parameters", "storageUri"], r);
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
  const I = s(e, ["labels"]);
  t !== void 0 && I != null && l(t, ["labels"], I);
  const b = s(e, ["imageSize"]);
  t !== void 0 && b != null && l(t, ["parameters", "sampleImageSize"], b);
  const P = s(e, ["enhancePrompt"]);
  return t !== void 0 && P != null && l(t, ["parameters", "enhancePrompt"], P), o;
}
function qA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && GA(a, o), o;
}
function HA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && BA(a, o), o;
}
function VA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => nT(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], yf(i)), n;
}
function JA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => xr(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], vf(i)), n;
}
function KA(e, t, n) {
  const o = {}, r = s(e, ["numberOfVideos"]);
  if (t !== void 0 && r != null && l(t, ["parameters", "sampleCount"], r), s(e, ["outputGcsUri"]) !== void 0) throw new Error("outputGcsUri parameter is not supported in Gemini API.");
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
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Nr(f));
  const p = s(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => XT(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (s(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (s(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = s(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), o;
}
function WA(e, t, n) {
  const o = {}, r = s(e, ["numberOfVideos"]);
  t !== void 0 && r != null && l(t, ["parameters", "sampleCount"], r);
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
  t !== void 0 && y != null && l(t, ["instances[0]", "lastFrame"], He(y));
  const S = s(e, ["referenceImages"]);
  if (t !== void 0 && S != null) {
    let D = S;
    Array.isArray(D) && (D = D.map((E) => QT(E))), l(t, ["instances[0]", "referenceImages"], D);
  }
  const I = s(e, ["mask"]);
  t !== void 0 && I != null && l(t, ["instances[0]", "mask"], YT(I));
  const b = s(e, ["compressionQuality"]);
  t !== void 0 && b != null && l(t, ["parameters", "compressionQuality"], b);
  const P = s(e, ["labels"]);
  if (t !== void 0 && P != null && l(t, ["labels"], P), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return o;
}
function zA(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], ZA(u)), n;
}
function YA(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response"]);
  return u != null && l(n, ["response"], jA(u)), n;
}
function XA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], Nr(a));
  const u = s(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], Tf(u));
  const c = s(t, ["source"]);
  c != null && eT(c, o);
  const d = s(t, ["config"]);
  return d != null && KA(d, o), o;
}
function QA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], He(a));
  const u = s(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], Sf(u));
  const c = s(t, ["source"]);
  c != null && tT(c, o);
  const d = s(t, ["config"]);
  return d != null && WA(d, o), o;
}
function ZA(e, t) {
  const n = {}, o = s(e, ["generatedSamples"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => rT(u))), l(n, ["generatedVideos"], a);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function jA(e, t) {
  const n = {}, o = s(e, ["videos"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => iT(u))), l(n, ["generatedVideos"], a);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function eT(e, t, n) {
  const o = {}, r = s(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Nr(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Tf(a)), o;
}
function tT(e, t, n) {
  const o = {}, r = s(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], He(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Sf(a)), o;
}
function nT(e, t) {
  const n = {}, o = s(e, ["_self"]);
  o != null && l(n, ["image"], hT(o));
  const r = s(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = s(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], yf(i)), n;
}
function xr(e, t) {
  const n = {}, o = s(e, ["_self"]);
  o != null && l(n, ["image"], _f(o));
  const r = s(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = s(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], vf(i));
  const a = s(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function oT(e, t) {
  const n = {}, o = s(e, ["_self"]);
  o != null && l(n, ["mask"], _f(o));
  const r = s(e, ["labels"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["labels"], i);
  }
  return n;
}
function rT(e, t) {
  const n = {}, o = s(e, ["video"]);
  return o != null && l(n, ["video"], WT(o)), n;
}
function iT(e, t) {
  const n = {}, o = s(e, ["_self"]);
  return o != null && l(n, ["video"], zT(o)), n;
}
function sT(e, t) {
  const n = {}, o = s(e, ["modelSelectionConfig"]);
  o != null && l(n, ["modelConfig"], o);
  const r = s(e, ["responseJsonSchema"]);
  r != null && l(n, ["responseJsonSchema"], r);
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
  const I = s(e, ["seed"]);
  I != null && l(n, ["seed"], I);
  const b = s(e, ["speechConfig"]);
  b != null && l(n, ["speechConfig"], b);
  const P = s(e, ["stopSequences"]);
  P != null && l(n, ["stopSequences"], P);
  const D = s(e, ["temperature"]);
  D != null && l(n, ["temperature"], D);
  const E = s(e, ["thinkingConfig"]);
  E != null && l(n, ["thinkingConfig"], E);
  const L = s(e, ["topK"]);
  L != null && l(n, ["topK"], L);
  const w = s(e, ["topP"]);
  if (w != null && l(n, ["topP"], w), s(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function aT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function lT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function uT(e, t) {
  const n = {}, o = s(e, ["authConfig"]);
  o != null && l(n, ["authConfig"], iA(o));
  const r = s(e, ["enableWidget"]);
  return r != null && l(n, ["enableWidget"], r), n;
}
function cT(e, t) {
  const n = {}, o = s(e, ["searchTypes"]);
  if (o != null && l(n, ["searchTypes"], o), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(n, ["timeRangeFilter"], r), n;
}
function dT(e, t) {
  const n = {}, o = s(e, ["aspectRatio"]);
  o != null && l(n, ["aspectRatio"], o);
  const r = s(e, ["imageSize"]);
  if (r != null && l(n, ["imageSize"], r), s(e, ["personGeneration"]) !== void 0) throw new Error("personGeneration parameter is not supported in Gemini API.");
  if (s(e, ["prominentPeople"]) !== void 0) throw new Error("prominentPeople parameter is not supported in Gemini API.");
  if (s(e, ["outputMimeType"]) !== void 0) throw new Error("outputMimeType parameter is not supported in Gemini API.");
  if (s(e, ["outputCompressionQuality"]) !== void 0) throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["imageOutputOptions"]) !== void 0) throw new Error("imageOutputOptions parameter is not supported in Gemini API.");
  return n;
}
function fT(e, t) {
  const n = {}, o = s(e, ["aspectRatio"]);
  o != null && l(n, ["aspectRatio"], o);
  const r = s(e, ["imageSize"]);
  r != null && l(n, ["imageSize"], r);
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
function hT(e, t) {
  const n = {}, o = s(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], vt(o));
  const r = s(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function _f(e, t) {
  const n = {}, o = s(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = s(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], vt(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Nr(e, t) {
  const n = {};
  if (s(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const o = s(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], vt(o));
  const r = s(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function He(e, t) {
  const n = {}, o = s(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = s(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], vt(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function pT(e, t, n, o) {
  const r = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], lf(e, c)), r;
}
function mT(e, t, n, o) {
  const r = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], lf(e, c)), r;
}
function gT(e, t, n) {
  const o = {}, r = s(t, ["config"]);
  return r != null && pT(e, r, o), o;
}
function _T(e, t, n) {
  const o = {}, r = s(t, ["config"]);
  return r != null && mT(e, r, o), o;
}
function yT(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = uf(i);
    Array.isArray(a) && (a = a.map((u) => Ui(u))), l(n, ["models"], a);
  }
  return n;
}
function vT(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = uf(i);
    Array.isArray(a) && (a = a.map((u) => Fi(u))), l(n, ["models"], a);
  }
  return n;
}
function AT(e, t) {
  const n = {}, o = s(e, ["maskMode"]);
  o != null && l(n, ["maskMode"], o);
  const r = s(e, ["segmentationClasses"]);
  r != null && l(n, ["maskClasses"], r);
  const i = s(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function Ui(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["displayName"]);
  r != null && l(n, ["displayName"], r);
  const i = s(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = s(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = s(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], FT(u));
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
function Fi(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["displayName"]);
  r != null && l(n, ["displayName"], r);
  const i = s(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = s(e, ["versionId"]);
  a != null && l(n, ["version"], a);
  const u = s(e, ["deployedModels"]);
  if (u != null) {
    let p = u;
    Array.isArray(p) && (p = p.map((m) => kA(m))), l(n, ["endpoints"], p);
  }
  const c = s(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = s(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], OT(d));
  const h = s(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = s(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function TT(e, t) {
  const n = {}, o = s(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(n, ["codeExecutionResult"], r);
  const i = s(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = s(e, ["fileData"]);
  a != null && l(n, ["fileData"], DA(a));
  const u = s(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], $A(u));
  const c = s(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = s(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], sA(d));
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
function ST(e, t) {
  const n = {}, o = s(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(n, ["codeExecutionResult"], r);
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
function ET(e, t) {
  const n = {}, o = s(e, ["productImage"]);
  return o != null && l(n, ["image"], He(o)), n;
}
function IT(e, t, n) {
  const o = {}, r = s(e, ["numberOfImages"]);
  t !== void 0 && r != null && l(t, ["parameters", "sampleCount"], r);
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
  return t !== void 0 && g != null && l(t, ["labels"], g), o;
}
function wT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["source"]);
  i != null && bT(i, o);
  const a = s(t, ["config"]);
  return a != null && IT(a, o), o;
}
function CT(e, t) {
  const n = {}, o = s(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => xr(i))), l(n, ["generatedImages"], r);
  }
  return n;
}
function bT(e, t, n) {
  const o = {}, r = s(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = s(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], He(i));
  const a = s(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => ET(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return o;
}
function RT(e, t) {
  const n = {}, o = s(e, ["referenceImage"]);
  o != null && l(n, ["referenceImage"], He(o));
  const r = s(e, ["referenceId"]);
  r != null && l(n, ["referenceId"], r);
  const i = s(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const a = s(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], AT(a));
  const u = s(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], hA(u));
  const c = s(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = s(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function yf(e, t) {
  const n = {}, o = s(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = s(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function vf(e, t) {
  const n = {}, o = s(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = s(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function PT(e, t) {
  const n = {}, o = s(e, ["category"]);
  if (o != null && l(n, ["category"], o), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(n, ["threshold"], r), n;
}
function MT(e, t) {
  const n = {}, o = s(e, ["image"]);
  return o != null && l(n, ["image"], He(o)), n;
}
function xT(e, t, n) {
  const o = {}, r = s(e, ["mode"]);
  t !== void 0 && r != null && l(t, ["parameters", "mode"], r);
  const i = s(e, ["maxPredictions"]);
  t !== void 0 && i != null && l(t, ["parameters", "maxPredictions"], i);
  const a = s(e, ["confidenceThreshold"]);
  t !== void 0 && a != null && l(t, ["parameters", "confidenceThreshold"], a);
  const u = s(e, ["maskDilation"]);
  t !== void 0 && u != null && l(t, ["parameters", "maskDilation"], u);
  const c = s(e, ["binaryColorThreshold"]);
  t !== void 0 && c != null && l(t, ["parameters", "binaryColorThreshold"], c);
  const d = s(e, ["labels"]);
  return t !== void 0 && d != null && l(t, ["labels"], d), o;
}
function NT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["source"]);
  i != null && DT(i, o);
  const a = s(t, ["config"]);
  return a != null && xT(a, o), o;
}
function kT(e, t) {
  const n = {}, o = s(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => oT(i))), l(n, ["generatedMasks"], r);
  }
  return n;
}
function DT(e, t, n) {
  const o = {}, r = s(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], He(i));
  const a = s(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], MT(a)), o;
}
function $T(e, t) {
  const n = {}, o = s(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = s(e, ["functionCallingConfig"]);
  r != null && l(n, ["functionCallingConfig"], LA(r));
  const i = s(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function LT(e, t) {
  const n = {}, o = s(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = s(e, ["functionCallingConfig"]);
  if (r != null && l(n, ["functionCallingConfig"], r), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function UT(e, t) {
  const n = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = s(e, ["computerUse"]);
  o != null && l(n, ["computerUse"], o);
  const r = s(e, ["fileSearch"]);
  r != null && l(n, ["fileSearch"], r);
  const i = s(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], cT(i));
  const a = s(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], uT(a));
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
function Af(e, t) {
  const n = {}, o = s(e, ["retrieval"]);
  o != null && l(n, ["retrieval"], o);
  const r = s(e, ["computerUse"]);
  if (r != null && l(n, ["computerUse"], r), s(e, ["fileSearch"]) !== void 0) throw new Error("fileSearch parameter is not supported in Vertex AI.");
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
    Array.isArray(m) && (m = m.map((g) => UA(g))), l(n, ["functionDeclarations"], m);
  }
  const h = s(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = s(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = s(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function FT(e, t) {
  const n = {}, o = s(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = s(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function OT(e, t) {
  const n = {}, o = s(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  o != null && l(n, ["baseModel"], o);
  const r = s(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function GT(e, t, n) {
  const o = {}, r = s(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function BT(e, t, n) {
  const o = {}, r = s(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function qT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "name"], V(e, r));
  const i = s(t, ["config"]);
  return i != null && GT(i, o), o;
}
function HT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["config"]);
  return i != null && BT(i, o), o;
}
function VT(e, t, n) {
  const o = {}, r = s(e, ["outputGcsUri"]);
  t !== void 0 && r != null && l(t, ["parameters", "storageUri"], r);
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
  return t !== void 0 && g != null && l(t, ["parameters", "mode"], g), o;
}
function JT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["image"]);
  i != null && l(o, ["instances[0]", "image"], He(i));
  const a = s(t, ["upscaleFactor"]);
  a != null && l(o, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = s(t, ["config"]);
  return u != null && VT(u, o), o;
}
function KT(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => xr(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function WT(e, t) {
  const n = {}, o = s(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = s(e, ["encodedVideo"]);
  r != null && l(n, ["videoBytes"], vt(r));
  const i = s(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function zT(e, t) {
  const n = {}, o = s(e, ["gcsUri"]);
  o != null && l(n, ["uri"], o);
  const r = s(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["videoBytes"], vt(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function YT(e, t) {
  const n = {}, o = s(e, ["image"]);
  o != null && l(n, ["_self"], He(o));
  const r = s(e, ["maskMode"]);
  return r != null && l(n, ["maskMode"], r), n;
}
function XT(e, t) {
  const n = {}, o = s(e, ["image"]);
  o != null && l(n, ["image"], Nr(o));
  const r = s(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function QT(e, t) {
  const n = {}, o = s(e, ["image"]);
  o != null && l(n, ["image"], He(o));
  const r = s(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function Tf(e, t) {
  const n = {}, o = s(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = s(e, ["videoBytes"]);
  r != null && l(n, ["encodedVideo"], vt(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function Sf(e, t) {
  const n = {}, o = s(e, ["uri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = s(e, ["videoBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], vt(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function ZT(e, t) {
  const n = {}, o = s(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["displayName"], o), n;
}
function jT(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && ZT(n, t), t;
}
function eS(e, t) {
  const n = {}, o = s(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function tS(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = s(e, ["config"]);
  return o != null && eS(o, t), t;
}
function nS(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function oS(e, t) {
  const n = {}, o = s(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["customMetadata"], i);
  }
  const r = s(e, ["chunkingConfig"]);
  return t !== void 0 && r != null && l(t, ["chunkingConfig"], r), n;
}
function rS(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], sS(a)), t;
}
function iS(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = s(e, ["fileName"]);
  o != null && l(t, ["fileName"], o);
  const r = s(e, ["config"]);
  return r != null && oS(r, t), t;
}
function sS(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = s(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function aS(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function lS(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && aS(n, t), t;
}
function uS(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["fileSearchStores"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["fileSearchStores"], i);
  }
  return t;
}
function Ef(e, t) {
  const n = {}, o = s(e, ["mimeType"]);
  t !== void 0 && o != null && l(t, ["mimeType"], o);
  const r = s(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = s(e, ["customMetadata"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => c)), l(t, ["customMetadata"], u);
  }
  const a = s(e, ["chunkingConfig"]);
  return t !== void 0 && a != null && l(t, ["chunkingConfig"], a), n;
}
function cS(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = s(e, ["config"]);
  return o != null && Ef(o, t), t;
}
function dS(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var fS = "Content-Type", hS = "X-Server-Timeout", pS = "User-Agent", Oi = "x-goog-api-client", mS = "google-genai-sdk/1.50.1", gS = "v1beta1", _S = "v1beta", yS = /* @__PURE__ */ new Set(["us", "eu"]), vS = 5, AS = [
  408,
  429,
  500,
  502,
  503,
  504
], TS = class {
  constructor(e) {
    var t, n, o;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const r = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (r.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? r.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && yS.has(this.clientOptions.location) ? r.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (r.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), r.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : gS;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), r.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : _S, r.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === ki.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
  }
  async request(e) {
    let t = this.clientOptions.httpOptions;
    e.httpOptions && (t = this.patchHttpOptions(this.clientOptions.httpOptions, e.httpOptions));
    const n = this.shouldPrependVertexProjectPath(e, t), o = this.constructUrl(e.path, t, n);
    if (e.queryParams) for (const [i, a] of Object.entries(e.queryParams)) o.searchParams.append(i, String(a));
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
        const a = setTimeout(() => r.abort(), t.timeout);
        a && typeof a.unref == "function" && a.unref();
      }
      o && o.addEventListener("abort", () => {
        r.abort();
      }), e.signal = i;
    }
    return t && t.extraBody !== null && SS(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Nu(o), new Di(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Nu(o), this.processStreamResponse(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  processStreamResponse(e) {
    return Be(this, arguments, function* () {
      var n;
      const o = (n = e?.body) === null || n === void 0 ? void 0 : n.getReader(), r = new TextDecoder("utf-8");
      if (!o) throw new Error("Response body is empty");
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
          const { done: c, value: d } = yield B(o.read());
          if (c) {
            if (i.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const h = r.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(h);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, y = g.code, S = `got status: ${_}. ${JSON.stringify(m)}`;
              if (y >= 400 && y < 600) throw new mf({
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
                yield yield B(new Di(new Response(_, {
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
      throw AS.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new rl.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, rl.default)(r, { retries: ((n = o.attempts) !== null && n !== void 0 ? n : vS) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = mS + " " + this.clientOptions.userAgentExtra;
    return e[pS] = t, e[Oi] = t, e[fS] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [o, r] of Object.entries(e.headers)) n.append(o, r);
      e.timeout && e.timeout > 0 && n.append(hS, String(Math.ceil(e.timeout / 1e3)));
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
    const a = (n = t?.mimeType) !== null && n !== void 0 ? n : i.type;
    if (a === void 0 || a === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    o.mimeType = a;
    const u = { file: o }, c = this.getFileName(e), d = x("upload/v1beta/files", u._url), h = await this.fetchUploadUrl(d, o.sizeBytes, o.mimeType, c, u, t?.httpOptions);
    return r.upload(e, h, this);
  }
  async uploadFileToFileSearchStore(e, t, n) {
    var o;
    const r = this.clientOptions.uploader, i = await r.stat(t), a = String(i.size), u = (o = n?.mimeType) !== null && o !== void 0 ? o : i.type;
    if (u === void 0 || u === "") throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    const c = `upload/v1beta/${e}:uploadToFileSearchStore`, d = this.getFileName(t), h = {};
    n != null && Ef(n, h);
    const f = await this.fetchUploadUrl(c, a, u, d, h, n?.httpOptions);
    return r.uploadToFileSearchStore(t, f, this);
  }
  async downloadFile(e) {
    await this.clientOptions.downloader.download(e, this);
  }
  async fetchUploadUrl(e, t, n, o, r, i) {
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
      }, o ? { "X-Goog-Upload-File-Name": o } : {})
    };
    const c = await this.request({
      path: e,
      body: JSON.stringify(r),
      httpMethod: "POST",
      httpOptions: u
    });
    if (!c || !c?.headers) throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
    const d = (a = c?.headers) === null || a === void 0 ? void 0 : a["x-goog-upload-url"];
    if (d === void 0) throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
    return d;
  }
};
async function Nu(e) {
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
    throw n >= 400 && n < 600 ? new mf({
      message: r,
      status: n
    }) : new Error(r);
  }
}
function SS(e, t) {
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
  function o(i, a) {
    const u = Object.assign({}, i);
    for (const c in a) if (Object.prototype.hasOwnProperty.call(a, c)) {
      const d = a[c], h = u[c];
      d && typeof d == "object" && !Array.isArray(d) && h && typeof h == "object" && !Array.isArray(h) ? u[c] = o(h, d) : (h && d && typeof h != typeof d && console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${c}". Original type: ${typeof h}, New type: ${typeof d}. Overwriting.`), u[c] = d);
    }
    return u;
  }
  const r = o(n, t);
  e.body = JSON.stringify(r);
}
var ES = "mcp_used/unknown", IS = !1;
function If(e) {
  for (const t of e)
    if (wS(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return IS;
}
function wf(e) {
  var t;
  e[Oi] = (((t = e[Oi]) !== null && t !== void 0 ? t : "") + ` ${ES}`).trimStart();
}
function wS(e) {
  return e !== null && typeof e == "object" && e instanceof bS;
}
function CS(e) {
  return Be(this, arguments, function* (n, o = 100) {
    let r, i = 0;
    for (; i < o; ) {
      const a = yield B(n.listTools({ cursor: r }));
      for (const u of a.tools)
        yield yield B(u), i++;
      if (!a.nextCursor) break;
      r = a.nextCursor;
    }
  });
}
var bS = class Cf {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Cf(t, n);
  }
  async initialize() {
    var t, n, o, r;
    if (this.mcpTools.length > 0) return;
    const i = {}, a = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, qe(CS(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
        r = d.value, u = !1;
        const f = r;
        a.push(f);
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
    this.mcpTools = a, this.functionNameToMcpClient = i;
  }
  async tool() {
    return await this.initialize(), B_(this.mcpTools, this.config);
  }
  async callTool(t) {
    await this.initialize();
    const n = [];
    for (const o of t) if (o.name in this.functionNameToMcpClient) {
      const r = this.functionNameToMcpClient[o.name];
      let i;
      this.config.timeout && (i = { timeout: this.config.timeout });
      const a = await r.callTool({
        name: o.name,
        arguments: o.args
      }, void 0, i);
      n.push({ functionResponse: {
        name: o.name,
        response: a.isError ? { error: a } : a
      } });
    }
    return n;
  }
};
async function RS(e, t, n) {
  const o = new N_();
  let r;
  n.data instanceof Blob ? r = JSON.parse(await n.data.text()) : r = JSON.parse(n.data), Object.assign(o, r), t(o);
}
var PS = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const o = this.apiClient.getWebsocketBaseUrl(), r = this.apiClient.getApiVersion(), i = NS(this.apiClient.getDefaultHeaders()), a = `${o}/ws/google.ai.generativelanguage.${r}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        RS(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(a, xS(i), p);
    m.connect(), await c;
    const g = { setup: { model: V(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new MS(m, this.apiClient);
  }
}, MS = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = Wv(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = Kv(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(Xt.PLAY);
  }
  pause() {
    this.sendPlaybackControl(Xt.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(Xt.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(Xt.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function xS(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function NS(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var kS = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function DS(e, t, n) {
  const o = new x_();
  let r;
  n.data instanceof Blob ? r = await n.data.text() : n.data instanceof ArrayBuffer ? r = new TextDecoder().decode(n.data) : r = n.data;
  const i = JSON.parse(r);
  if (e.isVertexAI()) {
    const a = Xv(i);
    Object.assign(o, a);
  } else Object.assign(o, i);
  t(o);
}
var $S = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new PS(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, o, r, i, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && If(e.config.tools) && wf(h);
    const f = OS(h);
    if (this.apiClient.isVertexAI()) {
      const w = this.apiClient.getProject(), M = this.apiClient.getLocation(), F = this.apiClient.getApiKey(), H = !!w && !!M || !!F;
      this.apiClient.getCustomBaseUrl() && !H ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(f, d));
    } else {
      const w = this.apiClient.getApiKey();
      let M = "BidiGenerateContent", F = "key";
      w?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), M = "BidiGenerateContentConstrained", F = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${M}?${F}=${w}`;
    }
    let p = () => {
    };
    const m = new Promise((w) => {
      p = w;
    }), g = e.callbacks, _ = function() {
      var w;
      (w = g?.onopen) === null || w === void 0 || w.call(g), p({});
    }, y = this.apiClient, S = {
      onopen: _,
      onmessage: (w) => {
        DS(y, g.onmessage, w);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(w) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(w) {
      }
    }, I = this.webSocketFactory.create(d, FS(f), S);
    I.connect(), await m;
    let b = V(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && b.startsWith("publishers/")) {
      const w = this.apiClient.getProject(), M = this.apiClient.getLocation();
      w && M && (b = `projects/${w}/locations/${M}/` + b);
    }
    let P = {};
    this.apiClient.isVertexAI() && ((o = e.config) === null || o === void 0 ? void 0 : o.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [ur.AUDIO] } : e.config.responseModalities = [ur.AUDIO]), !((r = e.config) === null || r === void 0) && r.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const D = (a = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : [], E = [];
    for (const w of D) if (this.isCallableTool(w)) {
      const M = w;
      E.push(await M.tool());
    } else E.push(w);
    E.length > 0 && (e.config.tools = E);
    const L = {
      model: b,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? P = Jv(this.apiClient, L) : P = Vv(this.apiClient, L), delete P.config, I.send(JSON.stringify(P)), new US(I, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, LS = { turnComplete: !0 }, US = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = _e(t.turns), e.isVertexAI() || (n = n.map((o) => po(o)));
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
      if (!e.isVertexAI() && !("id" in o)) throw new Error(kS);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, LS), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: Yv(e) } : t = { realtimeInput: zv(e) }, this.conn.send(JSON.stringify(t));
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
function FS(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function OS(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var ku = 10;
function Du(e) {
  var t, n, o;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let r = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (on(a)) {
    r = !0;
    break;
  }
  if (!r) return !0;
  const i = (o = e?.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function on(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function GS(e) {
  var t, n, o;
  return (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((r) => on(r))) !== null && o !== void 0 ? o : !1;
}
function $u(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((o, r) => {
    if (on(o)) return;
    const i = o;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(r);
  }), n;
}
function Lu(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var BS = class extends rt {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = _e(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = _e(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const o = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: cr.EMBED_CONTENT
        });
        return await this.embedContentInternal(o);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: cr.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, o, r, i, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !GS(t) || Du(t.config)) return await this.generateContentInternal(u);
      const c = $u(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, h;
      const f = _e(u.contents), p = (r = (o = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && r !== void 0 ? r : ku;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const y of (a = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : []) if (on(y)) {
          const S = await y.callTool(d.functionCalls);
          _.push(...S);
        }
        m++, h = {
          role: "user",
          parts: _
        }, u.contents = _e(u.contents), u.contents.push(g), u.contents.push(h), Lu(u.config) && (f.push(g), f.push(h));
      }
      return Lu(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, o, r, i, a;
      if (this.maybeMoveToResponseJsonSchem(t), Du(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = $u(t);
      if (u.length > 0) {
        const h = u.map((f) => `tools[${f}]`).join(", ");
        throw new Error(`Incompatible tools found at ${h}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
      }
      const c = (r = (o = (n = t?.config) === null || n === void 0 ? void 0 : n.toolConfig) === null || o === void 0 ? void 0 : o.functionCallingConfig) === null || r === void 0 ? void 0 : r.streamFunctionCallArguments, d = (a = (i = t?.config) === null || i === void 0 ? void 0 : i.automaticFunctionCalling) === null || a === void 0 ? void 0 : a.disable;
      if (c && !d) throw new Error("Running in streaming mode with 'streamFunctionCallArguments' enabled, this feature is not compatible with automatic function calling (AFC). Please set 'config.automaticFunctionCalling.disable' to true to disable AFC or leave 'config.toolConfig.functionCallingConfig.streamFunctionCallArguments' to be undefined or set to false to disable streaming function call arguments feature.");
      return await this.processAfcStream(t);
    }, this.generateImages = async (t) => await this.generateImagesInternal(t).then((n) => {
      var o;
      let r;
      const i = [];
      if (n?.generatedImages) for (const u of n.generatedImages) u && u?.safetyAttributes && ((o = u?.safetyAttributes) === null || o === void 0 ? void 0 : o.contentType) === "Positive Prompt" ? r = u?.safetyAttributes : i.push(u);
      let a;
      return r ? a = {
        generatedImages: i,
        positivePromptSafetyAttributes: r,
        sdkHttpResponse: n.sdkHttpResponse
      } : a = {
        generatedImages: i,
        sdkHttpResponse: n.sdkHttpResponse
      }, a;
    }), this.list = async (t) => {
      var n;
      const o = { config: Object.assign(Object.assign({}, { queryBase: !0 }), t?.config) };
      if (this.apiClient.isVertexAI() && !o.config.queryBase) {
        if (!((n = o.config) === null || n === void 0) && n.filter) throw new Error("Filtering tuned models list for Vertex AI is not currently supported");
        o.config.filter = "labels.tune-type:*";
      }
      return new Lt(ot.PAGED_ITEM_MODELS, (r) => this.listInternal(r), await this.listInternal(o), o);
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
      var n, o, r, i, a, u;
      if ((t.prompt || t.image || t.video) && t.source) throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      return this.apiClient.isVertexAI() || (!((n = t.video) === null || n === void 0) && n.uri && (!((o = t.video) === null || o === void 0) && o.videoBytes) ? t.video = {
        uri: t.video.uri,
        mimeType: t.video.mimeType
      } : !((i = (r = t.source) === null || r === void 0 ? void 0 : r.video) === null || i === void 0) && i.uri && (!((u = (a = t.source) === null || a === void 0 ? void 0 : a.video) === null || u === void 0) && u.videoBytes) && (t.source.video = {
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
    const i = await Promise.all(r.map(async (u) => on(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (a.config.tools = i, e.config && e.config.tools && If(e.config.tools)) {
      const u = (o = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && o !== void 0 ? o : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), wf(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, o;
    const r = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (on(i)) {
      const a = i, u = await a.tool();
      for (const c of (o = u.functionDeclarations) !== null && o !== void 0 ? o : []) {
        if (!c.name) throw new Error("Function declaration name is required.");
        if (r.has(c.name)) throw new Error(`Duplicate tool declaration name: ${c.name}`);
        r.set(c.name, a);
      }
    }
    return r;
  }
  async processAfcStream(e) {
    var t, n, o;
    const r = (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && o !== void 0 ? o : ku;
    let i = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return Be(this, arguments, function* () {
        for (var f, p, m, g, _, y; a < r; ) {
          i && (a++, i = !1);
          const P = yield B(c.processParamsMaybeAddMcpUsage(h)), D = yield B(c.generateContentStreamInternal(P)), E = [], L = [];
          try {
            for (var S = !0, I = (p = void 0, qe(D)), b; b = yield B(I.next()), f = b.done, !f; S = !0) {
              g = b.value, S = !1;
              const w = g;
              if (yield yield B(w), w.candidates && (!((_ = w.candidates[0]) === null || _ === void 0) && _.content)) {
                L.push(w.candidates[0].content);
                for (const M of (y = w.candidates[0].content.parts) !== null && y !== void 0 ? y : []) if (a < r && M.functionCall) {
                  if (!M.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(M.functionCall.name)) {
                    const F = yield B(d.get(M.functionCall.name).callTool([M.functionCall]));
                    E.push(...F);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${M.functionCall.name}`);
                }
              }
            }
          } catch (w) {
            p = { error: w };
          } finally {
            try {
              !S && !f && (m = I.return) && (yield B(m.call(I)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (E.length > 0) {
            i = !0;
            const w = new bn();
            w.candidates = [{ content: {
              role: "user",
              parts: E
            } }], yield yield B(w);
            const M = [];
            M.push(...L), M.push({
              role: "user",
              parts: E
            }), h.contents = _e(h.contents).concat(M);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Pu(this.apiClient, e);
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
        const h = xu(d), f = new bn();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Ru(this.apiClient, e);
      return a = x("{model}:generateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = Mu(d), f = new bn();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Pu(this.apiClient, e);
      return a = x("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return Be(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = qe(d), y; y = yield B(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const S = m, I = xu(yield B(S.json()), e);
              I.sdkHttpResponse = { headers: S.headers };
              const b = new bn();
              Object.assign(b, I), yield yield B(b);
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
      const c = Ru(this.apiClient, e);
      return a = x("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }), i.then(function(d) {
        return Be(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = qe(d), y; y = yield B(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const S = m, I = Mu(yield B(S.json()), e);
              I.sdkHttpResponse = { headers: S.headers };
              const b = new bn();
              Object.assign(b, I), yield yield B(b);
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
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = MA(this.apiClient, e, e);
      return a = x(H_(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = NA(d, e), f = new lu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = PA(this.apiClient, e);
      return a = x("{model}:batchEmbedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = xA(d), f = new lu();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = HA(this.apiClient, e);
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
        const h = JA(d), f = new uu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = qA(this.apiClient, e);
      return a = x("{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = VA(d), f = new uu();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = wA(this.apiClient, e);
      return r = x("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = CA(u), d = new y_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = JT(this.apiClient, e);
      return r = x("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = KT(u), d = new v_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = wT(this.apiClient, e);
      return r = x("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = CT(u), d = new A_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = NT(this.apiClient, e);
      return r = x("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = kT(u), d = new T_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = lT(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Fi(d));
    } else {
      const c = aT(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => Ui(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = _T(this.apiClient, e);
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
        const h = vT(d), f = new cu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = gT(this.apiClient, e);
      return a = x("{models_url}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = yT(d), f = new cu();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = HT(this.apiClient, e);
      return a = x("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Fi(d));
    } else {
      const c = qT(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => Ui(d));
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = TA(this.apiClient, e);
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
        const h = EA(d), f = new du();
        return Object.assign(f, h), f;
      });
    } else {
      const c = AA(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "DELETE",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = SA(d), f = new du();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = _A(this.apiClient, e);
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
        const h = vA(d), f = new fu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = gA(this.apiClient, e);
      return a = x("{model}:countTokens", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = yA(d), f = new fu();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = uA(this.apiClient, e);
      return r = x("{model}:computeTokens", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => {
        const c = cA(u), d = new S_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = QA(this.apiClient, e);
      return a = x("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = YA(d), f = new hu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = XA(this.apiClient, e);
      return a = x("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = zA(d), f = new hu();
        return Object.assign(f, h), f;
      });
    }
  }
}, qS = class extends rt {
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
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = f_(e);
      return a = x("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = d_(e);
      return a = x("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
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
      const a = r_(e);
      return r = x("{resourceName}:fetchPredictOperation", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o;
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
};
function Uu(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function HS(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function VS(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function JS(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => eE(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function KS(e, t, n) {
  const o = {}, r = s(t, ["expireTime"]);
  n !== void 0 && r != null && l(n, ["expireTime"], r);
  const i = s(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const a = s(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = s(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], jS(e, u));
  const c = s(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), o;
}
function WS(e, t) {
  const n = {}, o = s(t, ["config"]);
  return o != null && l(n, ["config"], KS(e, o, n)), n;
}
function zS(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function YS(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = s(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = s(e, ["name"]);
  if (r != null && l(t, ["name"], r), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function XS(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], HS(n));
  const o = s(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function QS(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function ZS(e, t) {
  const n = {}, o = s(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], o);
  const r = s(e, ["responseModalities"]);
  t !== void 0 && r != null && l(t, [
    "setup",
    "generationConfig",
    "responseModalities"
  ], r);
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
  ], Os(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], JS(re(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let w = an(_);
    Array.isArray(w) && (w = w.map((M) => oE(sn(M)))), l(t, ["setup", "tools"], w);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], nE(y));
  const S = s(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], Uu(S));
  const I = s(e, ["outputAudioTranscription"]);
  t !== void 0 && I != null && l(t, ["setup", "outputAudioTranscription"], Uu(I));
  const b = s(e, ["realtimeInputConfig"]);
  t !== void 0 && b != null && l(t, ["setup", "realtimeInputConfig"], b);
  const P = s(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const D = s(e, ["proactivity"]);
  if (t !== void 0 && D != null && l(t, ["setup", "proactivity"], D), s(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const E = s(e, ["avatarConfig"]);
  t !== void 0 && E != null && l(t, ["setup", "avatarConfig"], E);
  const L = s(e, ["safetySettings"]);
  if (t !== void 0 && L != null) {
    let w = L;
    Array.isArray(w) && (w = w.map((M) => tE(M))), l(t, ["setup", "safetySettings"], w);
  }
  return n;
}
function jS(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["setup", "model"], V(e, o));
  const r = s(t, ["config"]);
  return r != null && l(n, ["config"], ZS(r, n)), n;
}
function eE(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], zS(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], YS(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], VS(c));
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
function tE(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function nE(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function oE(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = s(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], QS(r));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], XS(i));
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
function rE(e) {
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
function iE(e, t) {
  let n = null;
  const o = e.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const i = o.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else o !== void 0 && delete e.bidiGenerateContentSetup;
  const r = e.fieldMask;
  if (n) {
    const i = rE(n);
    if (Array.isArray(t?.lockAdditionalFields) && t?.lockAdditionalFields.length === 0) i ? e.fieldMask = i : delete e.fieldMask;
    else if (t?.lockAdditionalFields && t.lockAdditionalFields.length > 0 && r !== null && Array.isArray(r) && r.length > 0) {
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
      r.length > 0 && (u = r.map((d) => a.includes(d) ? `generationConfig.${d}` : d));
      const c = [];
      i && c.push(i), u.length > 0 && c.push(...u), c.length > 0 ? e.fieldMask = c.join(",") : delete e.fieldMask;
    } else delete e.fieldMask;
  } else r !== null && Array.isArray(r) && r.length > 0 ? e.fieldMask = r.join(",") : delete e.fieldMask;
  return e;
}
var sE = class extends rt {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = WS(this.apiClient, e);
      r = x("auth_tokens", a._url), i = a._query, delete a.config, delete a._url, delete a._query;
      const u = iE(a, e.config);
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
function aE(e, t) {
  const n = {}, o = s(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function lE(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = s(e, ["config"]);
  return o != null && aE(o, t), t;
}
function uE(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function cE(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function dE(e) {
  const t = {}, n = s(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const o = s(e, ["config"]);
  return o != null && cE(o, t), t;
}
function fE(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["documents"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["documents"], i);
  }
  return t;
}
var hE = class extends rt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Lt(ot.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = uE(e);
      return r = x("{name}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
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
      const i = lE(e);
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
      const a = dE(e);
      return r = x("{parent}/documents", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = fE(u), d = new E_();
        return Object.assign(d, c), d;
      });
    }
  }
}, pE = class extends rt {
  constructor(e, t = new hE(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Lt(ot.PAGED_ITEM_FILE_SEARCH_STORES, (o) => this.listInternal(o), await this.listInternal(n), n);
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
      const a = jT(e);
      return r = x("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
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
      const a = nS(e);
      return r = x("{name}", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
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
      const i = tS(e);
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
      const a = lS(e);
      return r = x("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = uS(u), d = new I_();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = cS(e);
      return r = x("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = dS(u), d = new w_();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = iS(e);
      return r = x("{file_search_store_name}:importFile", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = rS(u), d = new C_();
        return Object.assign(d, c), d;
      });
    }
  }
}, bf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return bf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
}, mE = () => bf();
function Gi(e) {
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
}, Ne = class extends Error {
}, De = class qi extends Ne {
  constructor(t, n, o, r) {
    super(`${qi.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.error = n;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new kr({
      message: o,
      cause: Bi(n)
    });
    const i = n;
    return t === 400 ? new Pf(t, i, o, r) : t === 401 ? new Mf(t, i, o, r) : t === 403 ? new xf(t, i, o, r) : t === 404 ? new Nf(t, i, o, r) : t === 409 ? new kf(t, i, o, r) : t === 422 ? new Df(t, i, o, r) : t === 429 ? new $f(t, i, o, r) : t >= 500 ? new Lf(t, i, o, r) : new qi(t, i, o, r);
  }
}, Hi = class extends De {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, kr = class extends De {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Rf = class extends kr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Pf = class extends De {
}, Mf = class extends De {
}, xf = class extends De {
}, Nf = class extends De {
}, kf = class extends De {
}, Df = class extends De {
}, $f = class extends De {
}, Lf = class extends De {
}, gE = /^[a-z][a-z0-9+.-]*:/i, _E = (e) => gE.test(e), Vi = (e) => (Vi = Array.isArray, Vi(e)), Fu = Vi;
function Ou(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function yE(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var vE = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new Ne(`${e} must be an integer`);
  if (t < 0) throw new Ne(`${e} must be a positive integer`);
  return t;
}, AE = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, TE = (e) => new Promise((t) => setTimeout(t, e));
function SE() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Uf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function EE(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Uf({
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
function Ff(e) {
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
async function IE(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const o = e.getReader(), r = o.cancel();
  o.releaseLock(), await r;
}
var wE = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function CE(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new Ne(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var bE = "0.0.1", Of = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function ri(e, t, n) {
  return Of(), new File(e, t ?? "unknown_file", n);
}
function RE(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var PE = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Gf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", ME = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Gf(e), xE = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function NE(e, t, n) {
  if (Of(), e = await e, ME(e))
    return e instanceof File ? e : ri([await e.arrayBuffer()], e.name);
  if (xE(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), ri(await Ji(r), t, n);
  }
  const o = await Ji(e);
  if (t || (t = RE(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = Object.assign(Object.assign({}, n), { type: r }));
  }
  return ri(o, t, n);
}
async function Ji(e) {
  var t, n, o, r, i;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (Gf(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (PE(e)) try {
    for (var u = !0, c = qe(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      r = d.value, u = !1;
      const h = r;
      a.push(...await Ji(h));
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
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${kE(e)}`);
  }
  return a;
}
function kE(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Gs = class {
  constructor(e) {
    this._client = e;
  }
};
Gs._key = [];
function Bf(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Gu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), DE = (e = Bf) => (function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], a = n.reduce((h, f, p) => {
    var m, g, _;
    /[?#]/.test(f) && (r = !0);
    const y = o[p];
    let S = (r ? encodeURIComponent : e)("" + y);
    return p !== o.length && (y == null || typeof y == "object" && y.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = y.hasOwnProperty) !== null && m !== void 0 ? m : Gu)) !== null && g !== void 0 ? g : Gu)) === null || _ === void 0 ? void 0 : _.toString)) && (S = y + "", i.push({
      start: h.length + f.length,
      length: S.length,
      error: `Value of type ${Object.prototype.toString.call(y).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === o.length ? "" : S);
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
    throw new Ne(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), Ue = /* @__PURE__ */ DE(Bf), qf = class extends Gs {
  create(e, t) {
    var n;
    const { api_version: o = this._client.apiVersion } = e, r = mt(e, ["api_version"]);
    if ("model" in r && "agent_config" in r) throw new Ne("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in r && "generation_config" in r) throw new Ne("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(Ue`/${o}/interactions`, Object.assign(Object.assign({ body: r }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Ue`/${o}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.post(Ue`/${o}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var o;
    const r = t ?? {}, { api_version: i = this._client.apiVersion } = r, a = mt(r, ["api_version"]);
    return this._client.get(Ue`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (o = t?.stream) !== null && o !== void 0 ? o : !1 }));
  }
};
qf._key = Object.freeze(["interactions"]);
var Hf = class extends qf {
}, Vf = class extends Gs {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: o } = e, r = mt(e, ["api_version", "webhook_id"]);
    return this._client.post(Ue`/${n}/webhooks`, Object.assign({
      query: { webhook_id: o },
      body: r
    }, t));
  }
  update(e, t, n) {
    const { api_version: o = this._client.apiVersion, update_mask: r } = t, i = mt(t, ["api_version", "update_mask"]);
    return this._client.patch(Ue`/${o}/webhooks/${e}`, Object.assign({
      query: { update_mask: r },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: o = this._client.apiVersion } = n, r = mt(n, ["api_version"]);
    return this._client.get(Ue`/${o}/webhooks`, Object.assign({ query: r }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Ue`/${o}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.get(Ue`/${o}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: o = this._client.apiVersion, body: r } = t ?? {};
    return this._client.post(Ue`/${o}/webhooks/${e}:ping`, Object.assign({ body: r }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const o = t ?? {}, { api_version: r = this._client.apiVersion } = o, i = mt(o, ["api_version"]);
    return this._client.post(Ue`/${r}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
Vf._key = Object.freeze(["webhooks"]);
var Jf = class extends Vf {
};
function $E(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Fo;
function Bs(e) {
  let t;
  return (Fo ?? (t = new globalThis.TextEncoder(), Fo = t.encode.bind(t)))(e);
}
var Oo;
function Bu(e) {
  let t;
  return (Oo ?? (t = new globalThis.TextDecoder(), Oo = t.decode.bind(t)))(e);
}
var Dr = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Bs(e) : e;
    this.buffer = $E([this.buffer, n]);
    const o = [];
    let r;
    for (; (r = LE(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (r.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = r.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (r.index !== this.carriageReturnIndex + 1 || r.carriage)) {
        o.push(Bu(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? r.preceding - 1 : r.preceding, a = Bu(this.buffer.subarray(0, i));
      o.push(a), this.buffer = this.buffer.subarray(r.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), o;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Dr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Dr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function LE(e, t) {
  const r = t ?? 0, i = e.indexOf(10, r), a = e.indexOf(13, r);
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
var fr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, qu = (e, t, n) => {
  if (e) {
    if (yE(fr, e)) return e;
    fe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(fr))}`);
  }
};
function $n() {
}
function Go(e, t, n) {
  return !t || fr[e] > fr[n] ? $n : t[e].bind(t);
}
var UE = {
  error: $n,
  warn: $n,
  info: $n,
  debug: $n
}, Hu = /* @__PURE__ */ new WeakMap();
function fe(e) {
  var t;
  const n = e.logger, o = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return UE;
  const r = Hu.get(n);
  if (r && r[0] === o) return r[1];
  const i = {
    error: Go("error", n, o),
    warn: Go("warn", n, o),
    info: Go("info", n, o),
    debug: Go("debug", n, o)
  };
  return Hu.set(n, [o, i]), i;
}
var wt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), FE = class Ln {
  constructor(t, n, o) {
    this.iterator = t, this.controller = n, this.client = o;
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? fe(o) : console;
    function a() {
      return Be(this, arguments, function* () {
        var c, d, h, f;
        if (r) throw new Ne("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = qe(OE(t, n)), _; _ = yield B(g.next()), c = _.done, !c; m = !0) {
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
          if (Gi(y)) return yield B(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Ln(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    function i() {
      return Be(this, arguments, function* () {
        var c, d, h, f;
        const p = new Dr(), m = Ff(t);
        try {
          for (var g = !0, _ = qe(m), y; y = yield B(_.next()), c = y.done, !c; g = !0) {
            f = y.value, g = !1;
            const S = f;
            for (const I of p.decode(S)) yield yield B(I);
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
      return Be(this, arguments, function* () {
        var c, d, h, f;
        if (r) throw new Ne("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = qe(i()), _; _ = yield B(g.next()), c = _.done, !c; m = !0) {
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
          if (Gi(y)) return yield B(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Ln(a, n, o);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), r = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = o.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new Ln(() => r(t), this.controller, this.client), new Ln(() => r(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Uf({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const a = Bs(JSON.stringify(r) + `
`);
          o.enqueue(a);
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
function OE(e, t) {
  return Be(this, arguments, function* () {
    var o, r, i, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new Ne("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new Ne("Attempted to iterate over a response with no body");
    const u = new BE(), c = new Dr(), d = Ff(e.body);
    try {
      for (var h = !0, f = qe(GE(d)), p; p = yield B(f.next()), o = p.done, !o; h = !0) {
        a = p.value, h = !1;
        const m = a;
        for (const g of c.decode(m)) {
          const _ = u.decode(g);
          _ && (yield yield B(_));
        }
      }
    } catch (m) {
      r = { error: m };
    } finally {
      try {
        !h && !o && (i = f.return) && (yield B(i.call(f)));
      } finally {
        if (r) throw r.error;
      }
    }
    for (const m of c.flush()) {
      const g = u.decode(m);
      g && (yield yield B(g));
    }
  });
}
function GE(e) {
  return Be(this, arguments, function* () {
    var n, o, r, i;
    try {
      for (var a = !0, u = qe(e), c; c = yield B(u.next()), n = c.done, !n; a = !0) {
        i = c.value, a = !1;
        const d = i;
        d != null && (yield yield B(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? Bs(d) : d));
      }
    } catch (d) {
      o = { error: d };
    } finally {
      try {
        !a && !n && (r = u.return) && (yield B(r.call(u)));
      } finally {
        if (o) throw o.error;
      }
    }
  });
}
var BE = class {
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
    let [t, n, o] = qE(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function qE(e, t) {
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
async function HE(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return fe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : FE.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return fe(e).debug(`[${o}] response parsed`, wt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
var VE = class Kf extends Promise {
  constructor(t, n, o = HE) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, this.client = t;
  }
  _thenUnwrap(t) {
    return new Kf(this.client, this.responsePromise, async (n, o) => t(await this.parseResponse(n, o), o));
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
}, Wf = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* JE(e) {
  if (!e) return;
  if (Wf in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Fu(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = Fu(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [r, null]), yield [r, u]);
  }
}
var Rn = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, a] of JE(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [Wf]: !0,
    values: t,
    nulls: n
  };
}, ii = (e) => {
  var t, n, o, r, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (r = (o = globalThis.Deno.env) === null || o === void 0 ? void 0 : o.get) === null || r === void 0 ? void 0 : r.call(o, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, zf, Yf = class Xf {
  constructor(t) {
    var n, o, r, i, a, u, c, { baseURL: d = ii("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = ii("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = mt(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (o = m.timeout) !== null && o !== void 0 ? o : Xf.DEFAULT_TIMEOUT, this.logger = (r = m.logger) !== null && r !== void 0 ? r : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (a = (i = qu(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : qu(ii("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : SE(), this.encoder = wE, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = Rn([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return Rn([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return Rn([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return CE(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${bE}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${mE()}`;
  }
  makeStatusError(t, n, o, r) {
    return De.generate(t, n, o, r);
  }
  buildURL(t, n, o) {
    const r = !this.baseURLOverridden() && o || this.baseURL, i = _E(t) ? new URL(t) : new URL(r + (r.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!Ou(a) || !Ou(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return new VE(this, this.makeRequest(t, n, void 0));
  }
  async makeRequest(t, n, o) {
    var r, i, a;
    const u = await t, c = (r = u.maxRetries) !== null && r !== void 0 ? r : this.maxRetries;
    n == null && (n = c), await this.prepareOptions(u);
    const { req: d, url: h, timeout: f } = await this.buildRequest(u, { retryCount: c - n });
    await this.prepareRequest(d, {
      url: h,
      options: u
    });
    const p = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), m = o === void 0 ? "" : `, retryOf: ${o}`, g = Date.now();
    if (fe(this).debug(`[${p}] sending request`, wt({
      retryOfRequestLogID: o,
      method: u.method,
      url: h,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new Hi();
    const _ = new AbortController(), y = await this.fetchWithTimeout(h, d, f, _).catch(Bi), S = Date.now();
    if (y instanceof globalThis.Error) {
      const b = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new Hi();
      const P = Gi(y) || /timed? ?out/i.test(String(y) + ("cause" in y ? String(y.cause) : ""));
      if (n)
        return fe(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - ${b}`), fe(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (${b})`, wt({
          retryOfRequestLogID: o,
          url: h,
          durationMs: S - g,
          message: y.message
        })), this.retryRequest(u, n, o ?? p);
      throw fe(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - error; no more retries left`), fe(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (error; no more retries left)`, wt({
        retryOfRequestLogID: o,
        url: h,
        durationMs: S - g,
        message: y.message
      })), P ? new Rf() : new kr({ cause: y });
    }
    const I = `[${p}${m}] ${d.method} ${h} ${y.ok ? "succeeded" : "failed"} with status ${y.status} in ${S - g}ms`;
    if (!y.ok) {
      const b = await this.shouldRetry(y);
      if (n && b) {
        const w = `retrying, ${n} attempts remaining`;
        return await IE(y.body), fe(this).info(`${I} - ${w}`), fe(this).debug(`[${p}] response error (${w})`, wt({
          retryOfRequestLogID: o,
          url: y.url,
          status: y.status,
          headers: y.headers,
          durationMs: S - g
        })), this.retryRequest(u, n, o ?? p, y.headers);
      }
      const P = b ? "error; no more retries left" : "error; not retryable";
      fe(this).info(`${I} - ${P}`);
      const D = await y.text().catch((w) => Bi(w).message), E = AE(D), L = E ? void 0 : D;
      throw fe(this).debug(`[${p}] response error (${P})`, wt({
        retryOfRequestLogID: o,
        url: y.url,
        status: y.status,
        headers: y.headers,
        message: L,
        durationMs: Date.now() - g
      })), this.makeStatusError(y.status, E, L, y.headers);
    }
    return fe(this).info(I), fe(this).debug(`[${p}] response start`, wt({
      retryOfRequestLogID: o,
      url: y.url,
      status: y.status,
      headers: y.headers,
      durationMs: S - g
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
    const i = n || {}, { signal: a, method: u } = i, c = mt(i, ["signal", "method"]), d = this._makeAbort(r);
    a && a.addEventListener("abort", d, { once: !0 });
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
    let a;
    const u = r?.get("retry-after-ms");
    if (u) {
      const d = parseFloat(u);
      Number.isNaN(d) || (a = d);
    }
    const c = r?.get("retry-after");
    if (c && !a) {
      const d = parseFloat(c);
      Number.isNaN(d) ? a = Date.parse(c) - Date.now() : a = d * 1e3;
    }
    if (a === void 0) {
      const d = (i = t.maxRetries) !== null && i !== void 0 ? i : this.maxRetries;
      a = this.calculateDefaultRetryTimeoutMillis(n, d);
    }
    return await TE(a), this.makeRequest(t, n - 1, o);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var o, r, i;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = a, f = this.buildURL(c, d, h);
    "timeout" in a && vE("timeout", a.timeout), a.timeout = (o = a.timeout) !== null && o !== void 0 ? o : this.timeout;
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
      }, a.signal && { signal: a.signal }), globalThis.ReadableStream && m instanceof globalThis.ReadableStream && { duplex: "half" }), m && { body: m }), (r = this.fetchOptions) !== null && r !== void 0 ? r : {}), (i = a.fetchOptions) !== null && i !== void 0 ? i : {}),
      url: f,
      timeout: a.timeout
    };
  }
  async buildHeaders({ options: t, method: n, bodyHeaders: o, retryCount: r }) {
    let i = {};
    this.idempotencyHeader && n !== "get" && (t.idempotencyKey || (t.idempotencyKey = this.defaultIdempotencyKey()), i[this.idempotencyHeader] = t.idempotencyKey);
    const a = await this.authHeaders(t);
    let u = Rn([
      i,
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
    const o = Rn([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && o.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: EE(t)
    } : typeof t == "object" && o.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: o
    });
  }
};
Yf.DEFAULT_TIMEOUT = 6e4;
var ne = class extends Yf {
  constructor() {
    super(...arguments), this.interactions = new Hf(this), this.webhooks = new Jf(this);
  }
};
zf = ne;
ne.GeminiNextGenAPIClient = zf;
ne.GeminiNextGenAPIClientError = Ne;
ne.APIError = De;
ne.APIConnectionError = kr;
ne.APIConnectionTimeoutError = Rf;
ne.APIUserAbortError = Hi;
ne.NotFoundError = Nf;
ne.ConflictError = kf;
ne.RateLimitError = $f;
ne.BadRequestError = Pf;
ne.AuthenticationError = Mf;
ne.InternalServerError = Lf;
ne.PermissionDeniedError = xf;
ne.UnprocessableEntityError = Df;
ne.toFile = NE;
ne.Interactions = Hf;
ne.Webhooks = Jf;
function KE(e, t) {
  const n = {}, o = s(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function WE(e, t) {
  const n = {}, o = s(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function zE(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function YE(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function XE(e, t, n) {
  const o = {};
  if (s(e, ["validationDataset"]) !== void 0) throw new Error("validationDataset parameter is not supported in Gemini API.");
  const r = s(e, ["tunedModelDisplayName"]);
  if (t !== void 0 && r != null && l(t, ["displayName"], r), s(e, ["description"]) !== void 0) throw new Error("description parameter is not supported in Gemini API.");
  const i = s(e, ["epochCount"]);
  t !== void 0 && i != null && l(t, [
    "tuningTask",
    "hyperparameters",
    "epochCount"
  ], i);
  const a = s(e, ["learningRateMultiplier"]);
  if (a != null && l(o, [
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
  return o;
}
function QE(e, t, n) {
  const o = {};
  let r = s(n, ["config", "method"]);
  if (r === void 0 && (r = "SUPERVISED_FINE_TUNING"), r === "SUPERVISED_FINE_TUNING") {
    const E = s(e, ["validationDataset"]);
    t !== void 0 && E != null && l(t, ["supervisedTuningSpec"], si(E));
  } else if (r === "PREFERENCE_TUNING") {
    const E = s(e, ["validationDataset"]);
    t !== void 0 && E != null && l(t, ["preferenceOptimizationSpec"], si(E));
  } else if (r === "DISTILLATION") {
    const E = s(e, ["validationDataset"]);
    t !== void 0 && E != null && l(t, ["distillationSpec"], si(E));
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
  const I = s(e, ["tunedTeacherModelSource"]);
  t !== void 0 && I != null && l(t, ["distillationSpec", "tunedTeacherModelSource"], I);
  const b = s(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && b != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], b);
  const P = s(e, ["outputUri"]);
  t !== void 0 && P != null && l(t, ["outputUri"], P);
  const D = s(e, ["encryptionSpec"]);
  return t !== void 0 && D != null && l(t, ["encryptionSpec"], D), o;
}
function ZE(e, t) {
  const n = {}, o = s(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = s(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = s(e, ["trainingDataset"]);
  i != null && uI(i);
  const a = s(e, ["config"]);
  return a != null && XE(a, n), n;
}
function jE(e, t) {
  const n = {}, o = s(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = s(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = s(e, ["trainingDataset"]);
  i != null && cI(i, n, t);
  const a = s(e, ["config"]);
  return a != null && QE(a, n, t), n;
}
function eI(e, t) {
  const n = {}, o = s(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function tI(e, t) {
  const n = {}, o = s(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function nI(e, t, n) {
  const o = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function oI(e, t, n) {
  const o = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function rI(e, t) {
  const n = {}, o = s(e, ["config"]);
  return o != null && nI(o, n), n;
}
function iI(e, t) {
  const n = {}, o = s(e, ["config"]);
  return o != null && oI(o, n), n;
}
function sI(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = s(e, ["tunedModels"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => Qf(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function aI(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = s(e, ["tuningJobs"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => Ki(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function lI(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["model"], o);
  const r = s(e, ["name"]);
  return r != null && l(n, ["endpoint"], r), n;
}
function uI(e, t) {
  const n = {};
  if (s(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (s(e, ["vertexDatasetResource"]) !== void 0) throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");
  const o = s(e, ["examples"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(n, ["examples", "examples"], r);
  }
  return n;
}
function cI(e, t, n) {
  const o = {};
  let r = s(n, ["config", "method"]);
  if (r === void 0 && (r = "SUPERVISED_FINE_TUNING"), r === "SUPERVISED_FINE_TUNING") {
    const a = s(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["supervisedTuningSpec", "trainingDatasetUri"], a);
  } else if (r === "PREFERENCE_TUNING") {
    const a = s(e, ["gcsUri"]);
    t !== void 0 && a != null && l(t, ["preferenceOptimizationSpec", "trainingDatasetUri"], a);
  } else if (r === "DISTILLATION") {
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
  return o;
}
function Qf(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], sf(i));
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
  return p != null && l(n, ["tunedModel"], lI(p)), n;
}
function Ki(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], sf(i));
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
  const I = s(e, ["tuningDataStats"]);
  I != null && l(n, ["tuningDataStats"], I);
  const b = s(e, ["encryptionSpec"]);
  b != null && l(n, ["encryptionSpec"], b);
  const P = s(e, ["partnerModelTuningSpec"]);
  P != null && l(n, ["partnerModelTuningSpec"], P);
  const D = s(e, ["customBaseModel"]);
  D != null && l(n, ["customBaseModel"], D);
  const E = s(e, ["evaluateDatasetRuns"]);
  if (E != null) {
    let At = E;
    Array.isArray(At) && (At = At.map(($e) => $e)), l(n, ["evaluateDatasetRuns"], At);
  }
  const L = s(e, ["experiment"]);
  L != null && l(n, ["experiment"], L);
  const w = s(e, ["fullFineTuningSpec"]);
  w != null && l(n, ["fullFineTuningSpec"], w);
  const M = s(e, ["labels"]);
  M != null && l(n, ["labels"], M);
  const F = s(e, ["outputUri"]);
  F != null && l(n, ["outputUri"], F);
  const H = s(e, ["pipelineJob"]);
  H != null && l(n, ["pipelineJob"], H);
  const le = s(e, ["serviceAccount"]);
  le != null && l(n, ["serviceAccount"], le);
  const z = s(e, ["tunedModelDisplayName"]);
  z != null && l(n, ["tunedModelDisplayName"], z);
  const W = s(e, ["tuningJobState"]);
  W != null && l(n, ["tuningJobState"], W);
  const K = s(e, ["veoTuningSpec"]);
  K != null && l(n, ["veoTuningSpec"], K);
  const pe = s(e, ["distillationSamplingSpec"]);
  pe != null && l(n, ["distillationSamplingSpec"], pe);
  const ze = s(e, ["tuningJobMetadata"]);
  return ze != null && l(n, ["tuningJobMetadata"], ze), n;
}
function dI(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = s(e, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = s(e, ["done"]);
  a != null && l(n, ["done"], a);
  const u = s(e, ["error"]);
  return u != null && l(n, ["error"], u), n;
}
function si(e, t) {
  const n = {}, o = s(e, ["gcsUri"]);
  o != null && l(n, ["validationDatasetUri"], o);
  const r = s(e, ["vertexDatasetResource"]);
  return r != null && l(n, ["validationDatasetUri"], r), n;
}
var fI = class extends rt {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Lt(ot.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: Ni.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = tI(e);
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
      })), i.then((d) => Ki(d));
    } else {
      const c = eI(e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => Qf(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = iI(e);
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
        const h = aI(d), f = new pu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = rI(e);
      return a = x("tunedModels", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = sI(d), f = new pu();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = WE(e);
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
        const h = YE(d), f = new mu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = KE(e);
      return a = x("{name}:cancel", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json().then((h) => {
        const f = h;
        return f.sdkHttpResponse = { headers: d.headers }, f;
      })), i.then((d) => {
        const h = zE(d), f = new mu();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = jE(e, e);
      return r = x("tuningJobs", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => Ki(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = ZE(e);
      return r = x("tunedModels", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json().then((c) => {
        const d = c;
        return d.sdkHttpResponse = { headers: u.headers }, d;
      })), o.then((u) => dI(u));
    }
  }
}, hI = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, pI = 1024 * 1024 * 8, mI = 3, gI = 1e3, _I = 2, hr = "x-goog-upload-status";
async function yI(e, t, n, o) {
  var r;
  const i = await Zf(e, t, n, o), a = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[hr]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function vI(e, t, n, o) {
  var r;
  const i = await Zf(e, t, n, o), a = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[hr]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = Xd(a), c = new k_();
  return Object.assign(c, u), c;
}
async function Zf(e, t, n, o) {
  var r, i, a;
  let u = t;
  const c = o?.baseUrl || ((r = n.clientOptions.httpOptions) === null || r === void 0 ? void 0 : r.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, h = 0, f = new Di(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(pI, d - h), g = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, y = gI;
    for (; _ < mI; ) {
      const S = Object.assign(Object.assign({}, o?.headers || {}), {
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
          headers: S
        })
      }), !((i = f?.headers) === null || i === void 0) && i[hr]) break;
      _++, await TI(y), y = y * _I;
    }
    if (h += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[hr]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function AI(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function TI(e) {
  return new Promise((t) => setTimeout(t, e));
}
var SI = class {
  async upload(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await yI(e, t, n, o);
  }
  async uploadToFileSearchStore(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await vI(e, t, n, o);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await AI(e);
  }
}, EI = class {
  create(e, t, n) {
    return new II(e, t, n);
  }
}, II = class {
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
}, Vu = "x-goog-api-key", wI = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(Vu) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(Vu, this.apiKey);
    }
  }
}, CI = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new ne({
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
    const n = n_(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const o = new wI(this.apiKey);
    this.apiClient = new TS({
      auth: o,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new SI(),
      downloader: new hI()
    }), this.models = new BS(this.apiClient), this.live = new $S(this.apiClient, o, new EI()), this.batches = new Ly(this.apiClient), this.chats = new Av(this.models, this.apiClient), this.caches = new _v(this.apiClient), this.files = new Nv(this.apiClient), this.operations = new qS(this.apiClient), this.authTokens = new sE(this.apiClient), this.tunings = new fI(this.apiClient), this.fileSearchStores = new pE(this.apiClient);
  }
};
function Ju(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function pr(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function xt(e) {
  return { text: String(e || "") };
}
function bI(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function RI(e) {
  if (typeof e == "string") return [xt(e)];
  if (!Array.isArray(e)) return [xt("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? xt(n.text || "") : n.type === "image_url" && n.image_url?.url ? bI(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [xt("")];
}
function Ku() {
  return {
    role: "user",
    parts: [xt("")]
  };
}
function mo(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = pr(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function PI(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function MI(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function Wu(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const o = String(e.functionCall.id || "").trim();
  return o ? `id:${o}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function xI(e, t) {
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
function NI(e = [], t = "") {
  const n = e.map((h) => mo(h, "model")).filter(Boolean);
  if (!n.length) return null;
  const o = [...n].reverse().find((h) => PI(h)) || null, r = [...n].reverse().find((h) => MI(h)) || null, i = o || r || n[n.length - 1], a = n.indexOf(i), u = pr(i);
  if (!u?.parts?.length) return n[n.length - 1];
  if (r) {
    const h = /* @__PURE__ */ new Map(), f = [];
    n.forEach((m, g) => {
      m.parts.forEach((_, y) => {
        const S = Wu(_, y, g);
        if (!S) return;
        h.has(S) || f.push(S);
        const I = h.get(S);
        I ? h.set(S, xI(I, _)) : h.set(S, pr(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((m, g) => {
      const _ = Wu(m, g, a);
      return _ ? (p.add(_), h.get(_) || m) : m;
    }), f.forEach((m) => {
      p.has(m) || (u.parts.push(h.get(m)), p.add(m));
    });
  }
  const c = String(t || ""), d = u.parts.filter((h) => !(typeof h?.text == "string" && !h?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function zu(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((o) => !o?.thought && typeof o?.text == "string" && o.text).map((o) => o.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function jf(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((o) => o?.functionCall || o).filter((o) => o && o.name);
  return t.length ? t : n;
}
function eh(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function Yu(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function kI(e, t) {
  const n = Yu(e), o = Yu(t);
  return n && o ? JSON.stringify({
    ...n,
    ...o
  }) : String(t || "").trim() || String(e || "{}");
}
function DI(e, t = "google-tool") {
  return jf(e).map((n, o) => {
    const r = String(n.id || "").trim();
    return {
      id: r || `${t}-${o + 1}`,
      name: n.name || "",
      arguments: eh(n),
      ...r ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function $I(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let o = 0;
  function r(a, u, c, d) {
    return a.name = String(u.name || a.name || "").trim(), a.arguments = kI(a.arguments, d), c && (n.set(c, a), a.id !== c ? a.providerId = c : delete a.providerId), a;
  }
  function i(a) {
    return jf(a).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), h = eh(u);
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
function LI(e = []) {
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
function UI(e) {
  switch (e) {
    case "minimal":
      return Yt.MINIMAL;
    case "high":
      return Yt.HIGH;
    case "medium":
      return Yt.MEDIUM;
    default:
      return Yt.LOW;
  }
}
function Xu(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function FI(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function OI(e) {
  const t = e?.providerPayload?.googleContent;
  return mo(t, "model");
}
function GI(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = OI(e);
    return n ? [n] : [];
  }
  return t.map((n) => mo(n, "model")).filter(Boolean);
}
function qs(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => mo(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function BI(e) {
  const t = e?.candidates?.[0]?.content;
  return qs(t ? [t] : []);
}
function qI(e) {
  return qs(e ? [e] : []);
}
function th(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? pr(e.history) || [] : [];
}
function HI(e, t = 0) {
  return th(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => mo(n, "model")).filter(Boolean);
}
function VI(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = [], r = (e || []).filter((a) => a.role === "user" || a.role === "assistant" || a.role === "tool");
  r.forEach((a) => {
    (a.tool_calls || []).forEach((u) => {
      u.id && u.function?.name && t.set(u.id, u.function.name), u.id && Object.prototype.hasOwnProperty.call(u, "providerToolCallId") && n.set(u.id, String(u.providerToolCallId || "").trim());
    });
  });
  for (let a = 0; a < r.length; a += 1) {
    const u = r[a];
    if (u.role === "tool") {
      const c = [];
      let d = a;
      for (; d < r.length && r[d].role === "tool"; ) {
        const h = r[d], f = String(h.tool_call_id || "").trim(), p = n.has(f) ? n.get(f) : f;
        c.push({ functionResponse: {
          ...p ? { id: p } : {},
          name: String(h.toolName || h.tool_name || "").trim() || t.get(f) || "tool_result",
          response: Ju(h.content)
        } }), d += 1;
      }
      o.push({
        role: "user",
        parts: c
      }), a = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = GI(u);
      if (c.length) {
        o.push(...c);
        continue;
      }
    }
    if (u.role === "assistant" && Array.isArray(u.tool_calls) && u.tool_calls.length) {
      o.push({
        role: "model",
        parts: [...u.content ? [xt(u.content)] : [], ...u.tool_calls.map((c) => ({ functionCall: {
          ...(() => {
            const d = Object.prototype.hasOwnProperty.call(c, "providerToolCallId") ? String(c.providerToolCallId || "").trim() : String(c.id || "").trim();
            return d ? { id: d } : {};
          })(),
          name: c.function.name,
          args: Ju(c.function.arguments)
        } }))]
      });
      continue;
    }
    o.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: RI(u.content)
    });
  }
  if (!o.length) return {
    history: [],
    latestMessage: Ku().parts
  };
  const i = o[o.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: o.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: o,
    latestMessage: Ku().parts
  };
}
function JI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Qu(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var KI = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.toolCallResponseSequence = 0, this.client = new CI({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e) {
    const t = he("google", this.config, e.reasoning), n = VI(e.messages), o = Array.isArray(e.tools) ? e.tools : [], r = FI(e), i = {
      ...r ? { systemInstruction: r } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    if (t.mode === "off" ? i.thinkingConfig = {
      includeThoughts: !1,
      thinkingBudget: 0
    } : t.mode === "on" && t.profileId.startsWith("google-gemini-2.5-") ? i.thinkingConfig = {
      includeThoughts: J(t),
      thinkingBudget: t.budgetTokens
    } : t.mode === "on" ? i.thinkingConfig = {
      includeThoughts: J(t),
      thinkingLevel: UI(t.effort)
    } : J(t) && (i.thinkingConfig = { includeThoughts: !0 }), o.length && (i.tools = [{ functionDeclarations: o.map((a) => ({
      name: a.function.name,
      description: a.function.description,
      parameters: a.function.parameters
    })) }]), o.length) {
      const a = String(e.toolChoice || "auto").trim();
      i.toolConfig = { functionCallingConfig: a === "none" ? { mode: zt.NONE } : a === "auto" ? { mode: zt.AUTO } : a === "required" ? { mode: zt.ANY } : {
        mode: zt.ANY,
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
    const n = t.payload || this.buildChatPayload(e), o = he("google", this.config, e.reasoning), r = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return oo({
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
      effectiveConfig: _t(e, {
        profileId: o.profileId,
        effectiveMode: o.mode,
        effort: n.createPayload.config?.thinkingConfig?.thinkingLevel,
        budgetTokens: n.createPayload.config?.thinkingConfig?.thinkingBudget,
        controlFields: n.createPayload.config?.thinkingConfig ? { thinkingConfig: n.createPayload.config.thinkingConfig } : {}
      })
    });
  }
  inspectSendRequest(e, t) {
    const n = he("google", this.config, t.reasoning), o = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return oo({
      provider: "google",
      model: this.config.model,
      transport: "google-genai-sdk",
      url: `${o}/models/${encodeURIComponent(this.config.model || "")}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.config.apiKey || ""
      },
      body: {
        sendMessage: e,
        stream: typeof t.onStreamProgress == "function"
      },
      sdk: typeof t.onStreamProgress == "function" ? "activeChat.sendMessageStream" : "activeChat.sendMessage",
      effectiveConfig: _t(t, {
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
    let o, r, i, a = [];
    const u = `google-tool-${++this.toolCallResponseSequence}`, c = $I(u);
    let d = null;
    const h = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, f = {
      ...t,
      ...h ? { config: h } : {}
    }, p = typeof n.onStreamProgress == "function", m = th(e).length;
    if (p) {
      const y = await e.sendMessageStream(f), S = /* @__PURE__ */ new Map();
      let I = "", b = null;
      const P = [];
      for await (const D of y) {
        b = D;
        const E = D?.candidates?.[0]?.content;
        E?.parts?.length && P.push(E), J(n.reasoning) && Xu(D).forEach((w, M) => {
          const F = `${w.label}:${M}`;
          S.set(F, Qu(S.get(F) || "", w.text));
        }), a = c.append(D);
        const L = zu(D);
        I = Qu(I, L), JI(n, {
          text: I,
          thoughts: Array.from(S.values()).filter(Boolean).map((w, M) => ({
            label: `思考块 ${M + 1}`,
            text: w
          })),
          ...a.length ? {
            toolCalls: a,
            toolCallDraft: !0
          } : {}
        });
      }
      o = {
        ...b || {},
        functionCalls: a
      }, d = NI(P, I) || o?.candidates?.[0]?.content || null, r = Array.from(S.values()).filter(Boolean).map((D, E) => ({
        label: `思考块 ${E + 1}`,
        text: D
      })), i = I;
    } else
      o = await e.sendMessage(f), r = J(n.reasoning) ? Xu(o) : [], i = zu(o);
    const g = p ? a : DI(o, u), _ = HI(e, m);
    return {
      text: i,
      toolCalls: g,
      thoughts: r,
      finishReason: o.candidates?.[0]?.finishReason || "STOP",
      model: o.modelVersion || this.config.model,
      provider: "google",
      providerPayload: qs(_) || qI(d) || BI(o)
    };
  }
  async chat(e) {
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const o = { message: LI(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, o, e),
        requestInspection: this.inspectSendRequest(o, e)
      };
    }
    const t = String(e.finalAnswerReminderText || "").trim();
    if (t) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const o = { message: [xt(t)] };
      return {
        ...await this.sendThroughChat(this.activeChat, o, e),
        requestInspection: this.inspectSendRequest(o, e)
      };
    }
    const n = this.createChat(e);
    return this.activeChat = n.chat, this.sessionConfig = n.sessionConfig, {
      ...await this.sendThroughChat(this.activeChat, n.sendPayload, e),
      requestInspection: n.requestInspection
    };
  }
};
function O(e, t, n, o, r) {
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
var nh = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return nh = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function Wi(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var zi = (e) => {
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
}, ue = class Yi extends U {
  constructor(t, n, o, r) {
    super(`${Yi.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new $r({
      message: o,
      cause: zi(n)
    });
    const i = n?.error;
    return t === 400 ? new oh(t, i, o, r) : t === 401 ? new rh(t, i, o, r) : t === 403 ? new ih(t, i, o, r) : t === 404 ? new sh(t, i, o, r) : t === 409 ? new ah(t, i, o, r) : t === 422 ? new lh(t, i, o, r) : t === 429 ? new uh(t, i, o, r) : t >= 500 ? new ch(t, i, o, r) : new Yi(t, i, o, r);
  }
}, xe = class extends ue {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, $r = class extends ue {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Hs = class extends $r {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, oh = class extends ue {
}, rh = class extends ue {
}, ih = class extends ue {
}, sh = class extends ue {
}, ah = class extends ue {
}, lh = class extends ue {
}, uh = class extends ue {
}, ch = class extends ue {
}, dh = class extends U {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, fh = class extends U {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Un = class extends Error {
  constructor(e) {
    super(e);
  }
}, hh = class extends ue {
  constructor(e, t, n) {
    let o = "OAuth2 authentication error", r;
    if (t && typeof t == "object") {
      const i = t;
      r = i.error;
      const a = i.error_description;
      a && typeof a == "string" ? o = a : r && (o = r);
    }
    super(e, t, o, n), this.error_code = r;
  }
}, WI = class extends U {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, zI = /^[a-z][a-z0-9+.-]*:/i, YI = (e) => zI.test(e), ge = (e) => (ge = Array.isArray, ge(e)), Zu = ge;
function Vs(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function ju(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function XI(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function ai(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var QI = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new U(`${e} must be an integer`);
  if (t < 0) throw new U(`${e} must be a positive integer`);
  return t;
}, ZI = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, go = (e) => new Promise((t) => setTimeout(t, e)), Vt = "6.44.0", jI = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function ew() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var tw = () => {
  const e = ew();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Vt,
    "X-Stainless-OS": tc(Deno.build.os),
    "X-Stainless-Arch": ec(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Vt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Vt,
    "X-Stainless-OS": tc(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": ec(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = nw();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Vt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Vt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function nw() {
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
var ec = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", tc = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), nc, ow = () => nc ?? (nc = tw());
function ph() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function mh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function gh(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return mh({
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
async function oc(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var rw = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), yh = "RFC3986", vh = (e) => String(e), rc = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: vh
};
var Xi = (e, t) => (Xi = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Xi(e, t)), Ve = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), li = 1024, iw = (e, t, n, o, r) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < i.length; u += li) {
    const c = i.length >= li ? i.slice(u, u + li) : i, d = [];
    for (let h = 0; h < c.length; ++h) {
      let f = c.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || r === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(h);
        continue;
      }
      if (f < 128) {
        d[d.length] = Ve[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = Ve[192 | f >> 6] + Ve[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = Ve[224 | f >> 12] + Ve[128 | f >> 6 & 63] + Ve[128 | f & 63];
        continue;
      }
      h += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(h) & 1023), d[d.length] = Ve[240 | f >> 18] + Ve[128 | f >> 12 & 63] + Ve[128 | f >> 6 & 63] + Ve[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function sw(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function ic(e, t) {
  if (ge(e)) {
    const n = [];
    for (let o = 0; o < e.length; o += 1) n.push(t(e[o]));
    return n;
  }
  return t(e);
}
var Ah = {
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
}, Th = function(e, t) {
  Array.prototype.push.apply(e, ge(t) ? t : [t]);
}, sc, te = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: iw,
  encodeValuesOnly: !1,
  format: yh,
  formatter: vh,
  indices: !1,
  serializeDate(e) {
    return (sc ?? (sc = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function aw(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var ui = {};
function Sh(e, t, n, o, r, i, a, u, c, d, h, f, p, m, g, _, y, S) {
  let I = e, b = S, P = 0, D = !1;
  for (; (b = b.get(ui)) !== void 0 && !D; ) {
    const F = b.get(e);
    if (P += 1, typeof F < "u") {
      if (F === P) throw new RangeError("Cyclic object value");
      D = !0;
    }
    typeof b.get(ui) > "u" && (P = 0);
  }
  if (typeof d == "function" ? I = d(t, I) : I instanceof Date ? I = p?.(I) : n === "comma" && ge(I) && (I = ic(I, function(F) {
    return F instanceof Date ? p?.(F) : F;
  })), I === null) {
    if (i) return c && !_ ? c(t, te.encoder, y, "key", m) : t;
    I = "";
  }
  if (aw(I) || sw(I)) {
    if (c) {
      const F = _ ? t : c(t, te.encoder, y, "key", m);
      return [g?.(F) + "=" + g?.(c(I, te.encoder, y, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(I))];
  }
  const E = [];
  if (typeof I > "u") return E;
  let L;
  if (n === "comma" && ge(I))
    _ && c && (I = ic(I, c)), L = [{ value: I.length > 0 ? I.join(",") || null : void 0 }];
  else if (ge(d)) L = d;
  else {
    const F = Object.keys(I);
    L = h ? F.sort(h) : F;
  }
  const w = u ? String(t).replace(/\./g, "%2E") : String(t), M = o && ge(I) && I.length === 1 ? w + "[]" : w;
  if (r && ge(I) && I.length === 0) return M + "[]";
  for (let F = 0; F < L.length; ++F) {
    const H = L[F], le = typeof H == "object" && typeof H.value < "u" ? H.value : I[H];
    if (a && le === null) continue;
    const z = f && u ? H.replace(/\./g, "%2E") : H, W = ge(I) ? typeof n == "function" ? n(M, z) : M : M + (f ? "." + z : "[" + z + "]");
    S.set(e, P);
    const K = /* @__PURE__ */ new WeakMap();
    K.set(ui, S), Th(E, Sh(le, W, n, o, r, i, a, u, n === "comma" && _ && ge(I) ? null : c, d, h, f, p, m, g, _, y, K));
  }
  return E;
}
function lw(e = te) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || te.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = yh;
  if (typeof e.format < "u") {
    if (!Xi(rc, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const o = rc[n];
  let r = te.filter;
  (typeof e.filter == "function" || ge(e.filter)) && (r = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in Ah ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = te.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : te.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : te.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : te.allowEmptyArrays,
    arrayFormat: i,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : te.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? te.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : te.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : te.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : te.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : te.encodeValuesOnly,
    filter: r,
    format: n,
    formatter: o,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : te.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : te.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : te.strictNullHandling
  };
}
function uw(e, t = {}) {
  let n = e;
  const o = lw(t);
  let r, i;
  typeof o.filter == "function" ? (i = o.filter, n = i("", n)) : ge(o.filter) && (i = o.filter, r = i);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = Ah[o.arrayFormat], c = u === "comma" && o.commaRoundTrip;
  r || (r = Object.keys(n)), o.sort && r.sort(o.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < r.length; ++p) {
    const m = r[p];
    o.skipNulls && n[m] === null || Th(a, Sh(n[m], m, u, c, o.allowEmptyArrays, o.strictNullHandling, o.skipNulls, o.encodeDotInKeys, o.encode ? o.encoder : null, o.filter, o.sort, o.allowDots, o.serializeDate, o.format, o.formatter, o.encodeValuesOnly, o.charset, d));
  }
  const h = a.join(o.delimiter);
  let f = o.addQueryPrefix === !0 ? "?" : "";
  return o.charsetSentinel && (o.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function cw(e) {
  return uw(e, { arrayFormat: "brackets" });
}
function dw(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var ac;
function Js(e) {
  let t;
  return (ac ?? (t = new globalThis.TextEncoder(), ac = t.encode.bind(t)))(e);
}
var lc;
function uc(e) {
  let t;
  return (lc ?? (t = new globalThis.TextDecoder(), lc = t.decode.bind(t)))(e);
}
var Ee, Ie, Lr = class {
  constructor() {
    Ee.set(this, void 0), Ie.set(this, void 0), O(this, Ee, new Uint8Array(), "f"), O(this, Ie, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Js(e) : e;
    O(this, Ee, dw([T(this, Ee, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = fw(T(this, Ee, "f"), T(this, Ie, "f"))) != null; ) {
      if (o.carriage && T(this, Ie, "f") == null) {
        O(this, Ie, o.index, "f");
        continue;
      }
      if (T(this, Ie, "f") != null && (o.index !== T(this, Ie, "f") + 1 || o.carriage)) {
        n.push(uc(T(this, Ee, "f").subarray(0, T(this, Ie, "f") - 1))), O(this, Ee, T(this, Ee, "f").subarray(T(this, Ie, "f")), "f"), O(this, Ie, null, "f");
        continue;
      }
      const r = T(this, Ie, "f") !== null ? o.preceding - 1 : o.preceding, i = uc(T(this, Ee, "f").subarray(0, r));
      n.push(i), O(this, Ee, T(this, Ee, "f").subarray(o.index), "f"), O(this, Ie, null, "f");
    }
    return n;
  }
  flush() {
    return T(this, Ee, "f").length ? this.decode(`
`) : [];
  }
};
Ee = /* @__PURE__ */ new WeakMap(), Ie = /* @__PURE__ */ new WeakMap();
Lr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Lr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function fw(e, t) {
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
function hw(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var mr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, cc = (e, t, n) => {
  if (e) {
    if (XI(mr, e)) return e;
    ie(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(mr))}`);
  }
};
function Fn() {
}
function Bo(e, t, n) {
  return !t || mr[e] > mr[n] ? Fn : t[e].bind(t);
}
var pw = {
  error: Fn,
  warn: Fn,
  info: Fn,
  debug: Fn
}, dc = /* @__PURE__ */ new WeakMap();
function ie(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return pw;
  const o = dc.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: Bo("error", t, n),
    warn: Bo("warn", t, n),
    info: Bo("info", t, n),
    debug: Bo("debug", t, n)
  };
  return dc.set(t, [n, r]), r;
}
var Ct = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Pn, ro = class On {
  constructor(t, n, o) {
    this.iterator = t, Pn.set(this, void 0), this.controller = n, O(this, Pn, o, "f");
  }
  static fromSSEResponse(t, n, o, r) {
    let i = !1;
    const a = o ? ie(o) : console;
    async function* u() {
      if (i) throw new U("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of mw(t, n))
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
              if (h && h.error) throw new ue(void 0, h.error, void 0, t.headers);
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
              if (d.event == "error") throw new ue(void 0, h.error, h.message, void 0);
              yield {
                event: d.event,
                data: h
              };
            }
          }
        c = !0;
      } catch (d) {
        if (Wi(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new On(u, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    async function* i() {
      const u = new Lr(), c = _h(t);
      for await (const d of c) for (const h of u.decode(d)) yield h;
      for (const d of u.flush()) yield d;
    }
    async function* a() {
      if (r) throw new U("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Wi(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new On(a, n, o);
  }
  [(Pn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  tee() {
    const t = [], n = [], o = this.iterator(), r = (i) => ({ next: () => {
      if (i.length === 0) {
        const a = o.next();
        t.push(a), n.push(a);
      }
      return i.shift();
    } });
    return [new On(() => r(t), this.controller, T(this, Pn, "f")), new On(() => r(n), this.controller, T(this, Pn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return mh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const a = Js(JSON.stringify(r) + `
`);
          o.enqueue(a);
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
async function* mw(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new U("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new U("Attempted to iterate over a response with no body");
  const n = new _w(), o = new Lr(), r = _h(e.body);
  for await (const i of gw(r)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* gw(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Js(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = hw(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var _w = class {
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
    let [t, n, o] = yw(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function yw(e, t) {
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
async function Eh(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return ie(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : ro.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Ih(await n.json(), n) : await n.text();
  })();
  return ie(e).debug(`[${o}] response parsed`, Ct({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function Ih(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Gn, wh = class Ch extends Promise {
  constructor(t, n, o = Eh) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, Gn.set(this, void 0), O(this, Gn, t, "f");
  }
  _thenUnwrap(t) {
    return new Ch(T(this, Gn, "f"), this.responsePromise, async (n, o) => Ih(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(T(this, Gn, "f"), t))), this.parsedPromise;
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
Gn = /* @__PURE__ */ new WeakMap();
var qo, Ur = class {
  constructor(e, t, n, o) {
    qo.set(this, void 0), O(this, qo, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new U("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await T(this, qo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(qo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, vw = class extends wh {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await Eh(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, yt = class extends Ur {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, X = class extends Ur {
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
        ...Vs(this.options.query),
        after: t
      }
    } : null;
  }
}, ae = class extends Ur {
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
        ...Vs(this.options.query),
        after: e
      }
    } : null;
  }
}, st = class extends Ur {
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
        ...Vs(this.options.query),
        after: e
      }
    } : null;
  }
}, Aw = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, Tw = "urn:ietf:params:oauth:grant-type:token-exchange", Sw = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? ph();
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
      grant_type: Tw,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: Aw[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new hh(t.status, a, t.headers) : ue.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
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
}, bh = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function Xn(e, t, n) {
  return bh(), new File(e, t ?? "unknown_file", n);
}
function jo(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Ks = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Fr = async (e, t) => Qi(e.body) ? {
  ...e,
  body: await Rh(e.body, t)
} : e, Ke = async (e, t) => ({
  ...e,
  body: await Rh(e.body, t)
}), fc = /* @__PURE__ */ new WeakMap();
function Ew(e) {
  const t = typeof e == "function" ? e : e.fetch, n = fc.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return fc.set(t, o), o;
}
var Rh = async (e, t) => {
  if (!await Ew(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, r]) => Zi(n, o, r))), n;
}, Ph = (e) => e instanceof Blob && "name" in e, Iw = (e) => typeof e == "object" && e !== null && (e instanceof Response || Ks(e) || Ph(e)), Qi = (e) => {
  if (Iw(e)) return !0;
  if (Array.isArray(e)) return e.some(Qi);
  if (e && typeof e == "object") {
    for (const t in e) if (Qi(e[t])) return !0;
  }
  return !1;
}, Zi = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, Xn([await n.blob()], jo(n)));
    else if (Ks(n)) e.append(t, Xn([await new Response(gh(n)).blob()], jo(n)));
    else if (Ph(n)) e.append(t, n, jo(n));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => Zi(e, t + "[]", o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, r]) => Zi(e, `${t}[${o}]`, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Mh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", ww = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Mh(e), Cw = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function bw(e, t, n) {
  if (bh(), e = await e, ww(e))
    return e instanceof File ? e : Xn([await e.arrayBuffer()], e.name);
  if (Cw(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), Xn(await ji(r), t, n);
  }
  const o = await ji(e);
  if (t || (t = jo(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return Xn(o, t, n);
}
async function ji(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Mh(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Ks(e)) for await (const n of e) t.push(...await ji(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Rw(e)}`);
  }
  return t;
}
function Rw(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var R = class {
  constructor(e) {
    this._client = e;
  }
};
function xh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var hc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Pw = (e = xh) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? hc) ?? hc)?.toString) && (g = m + "", i.push({
      start: h.length + f.length,
      length: g.length,
      error: `Value of type ${Object.prototype.toString.call(m).slice(8, -1)} is not a valid path parameter`
    })), h + f + (p === o.length ? "" : g);
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
}, v = /* @__PURE__ */ Pw(xh), Nh = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/chat/completions/${e}/messages`, X, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function gr(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Ws(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function _o(e) {
  return e?.$brand === "auto-parseable-tool";
}
function Mw(e, t) {
  return !t || !kh(t) ? {
    ...e,
    choices: e.choices.map((n) => (Dh(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : zs(e, t);
}
function zs(e, t) {
  const n = e.choices.map((o) => {
    if (o.finish_reason === "length") throw new dh();
    if (o.finish_reason === "content_filter") throw new fh();
    return Dh(o.message.tool_calls), {
      ...o,
      message: {
        ...o.message,
        ...o.message.tool_calls ? { tool_calls: o.message.tool_calls?.map((r) => Nw(t, r)) ?? void 0 } : void 0,
        parsed: o.message.content && !o.message.refusal ? xw(t, o.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function xw(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function Nw(e, t) {
  const n = e.tools?.find((o) => gr(o) && o.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: _o(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function kw(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((o) => gr(o) && o.function?.name === t.function.name);
  return gr(n) && (_o(n) || n?.function.strict || !1);
}
function kh(e) {
  return Ws(e.response_format) ? !0 : e.tools?.some((t) => _o(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function Dh(e) {
  for (const t of e || []) if (t.type !== "function") throw new U(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function Dw(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new U(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new U(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var _r = (e) => e?.role === "assistant", $h = (e) => e?.role === "tool", es, er, tr, Bn, qn, nr, Hn, Ze, Vn, yr, vr, Jt, Lh, Ys = class {
  constructor() {
    es.add(this), this.controller = new AbortController(), er.set(this, void 0), tr.set(this, () => {
    }), Bn.set(this, () => {
    }), qn.set(this, void 0), nr.set(this, () => {
    }), Hn.set(this, () => {
    }), Ze.set(this, {}), Vn.set(this, !1), yr.set(this, !1), vr.set(this, !1), Jt.set(this, !1), O(this, er, new Promise((e, t) => {
      O(this, tr, e, "f"), O(this, Bn, t, "f");
    }), "f"), O(this, qn, new Promise((e, t) => {
      O(this, nr, e, "f"), O(this, Hn, t, "f");
    }), "f"), T(this, er, "f").catch(() => {
    }), T(this, qn, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, T(this, es, "m", Lh).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (T(this, tr, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return T(this, Vn, "f");
  }
  get errored() {
    return T(this, yr, "f");
  }
  get aborted() {
    return T(this, vr, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (T(this, Ze, "f")[e] || (T(this, Ze, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = T(this, Ze, "f")[e];
    if (!n) return this;
    const o = n.findIndex((r) => r.listener === t);
    return o >= 0 && n.splice(o, 1), this;
  }
  once(e, t) {
    return (T(this, Ze, "f")[e] || (T(this, Ze, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      O(this, Jt, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    O(this, Jt, !0, "f"), await T(this, qn, "f");
  }
  _emit(e, ...t) {
    if (T(this, Vn, "f")) return;
    e === "end" && (O(this, Vn, !0, "f"), T(this, nr, "f").call(this));
    const n = T(this, Ze, "f")[e];
    if (n && (T(this, Ze, "f")[e] = n.filter((o) => !o.once), n.forEach(({ listener: o }) => o(...t))), e === "abort") {
      const o = t[0];
      !T(this, Jt, "f") && !n?.length && Promise.reject(o), T(this, Bn, "f").call(this, o), T(this, Hn, "f").call(this, o), this._emit("end");
      return;
    }
    if (e === "error") {
      const o = t[0];
      !T(this, Jt, "f") && !n?.length && Promise.reject(o), T(this, Bn, "f").call(this, o), T(this, Hn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
er = /* @__PURE__ */ new WeakMap(), tr = /* @__PURE__ */ new WeakMap(), Bn = /* @__PURE__ */ new WeakMap(), qn = /* @__PURE__ */ new WeakMap(), nr = /* @__PURE__ */ new WeakMap(), Hn = /* @__PURE__ */ new WeakMap(), Ze = /* @__PURE__ */ new WeakMap(), Vn = /* @__PURE__ */ new WeakMap(), yr = /* @__PURE__ */ new WeakMap(), vr = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakMap(), es = /* @__PURE__ */ new WeakSet(), Lh = function(t) {
  if (O(this, yr, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new xe()), t instanceof xe)
    return O(this, vr, !0, "f"), this._emit("abort", t);
  if (t instanceof U) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new U(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new U(String(t)));
};
function $w(e) {
  return typeof e.parse == "function";
}
var ce, ts, Ar, ns, os, rs, Uh, Fh, Lw = 10, Oh = class extends Ys {
  constructor() {
    super(...arguments), ce.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), $h(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (_r(e) && e.tool_calls)
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
    return await this.done(), T(this, ce, "m", ts).call(this);
  }
  async finalMessage() {
    return await this.done(), T(this, ce, "m", Ar).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), T(this, ce, "m", ns).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), T(this, ce, "m", os).call(this);
  }
  async totalUsage() {
    return await this.done(), T(this, ce, "m", rs).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = T(this, ce, "m", Ar).call(this);
    t && this._emit("finalMessage", t);
    const n = T(this, ce, "m", ts).call(this);
    n && this._emit("finalContent", n);
    const o = T(this, ce, "m", ns).call(this);
    o && this._emit("finalFunctionToolCall", o);
    const r = T(this, ce, "m", os).call(this);
    r != null && this._emit("finalFunctionToolCallResult", r), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", T(this, ce, "m", rs).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), T(this, ce, "m", Uh).call(this, t);
    const r = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(zs(r, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const o of t.messages) this._addMessage(o, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const o = "tool", { tool_choice: r = "auto", stream: i, ...a } = t, u = typeof r != "string" && r.type === "function" && r?.function?.name, { maxChatCompletions: c = Lw } = n || {}, d = t.tools.map((p) => {
      if (_o(p)) {
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
        tool_choice: r,
        tools: f,
        messages: [...this.messages]
      }, n)).choices[0]?.message;
      if (!m) throw new U("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const _ = g.id, { name: y, arguments: S } = g.function, I = h[y];
        if (I) {
          if (u && u !== y) {
            const E = `Invalid tool_call: ${JSON.stringify(y)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: o,
              tool_call_id: _,
              content: E
            });
            continue;
          }
        } else {
          const E = `Invalid tool_call: ${JSON.stringify(y)}. Available options are: ${Object.keys(h).map((L) => JSON.stringify(L)).join(", ")}. Please try again`;
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: E
          });
          continue;
        }
        let b;
        try {
          b = $w(I) ? await I.parse(S) : S;
        } catch (E) {
          const L = E instanceof Error ? E.message : String(E);
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: L
          });
          continue;
        }
        const P = await I.function(b, this), D = T(this, ce, "m", Fh).call(this, P);
        if (this._addMessage({
          role: o,
          tool_call_id: _,
          content: D
        }), u) return;
      }
    }
  }
};
ce = /* @__PURE__ */ new WeakSet(), ts = function() {
  return T(this, ce, "m", Ar).call(this).content ?? null;
}, Ar = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (_r(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new U("stream ended without producing a ChatCompletionMessage with role=assistant");
}, ns = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (_r(n) && n?.tool_calls?.length) for (let o = n.tool_calls.length - 1; o >= 0; o--) {
      const r = n.tool_calls[o];
      if (r?.type === "function") return r.function;
    }
  }
}, os = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if ($h(n) && n.content != null && typeof n.content == "string" && this.messages.some((o) => o.role === "assistant" && o.tool_calls?.some((r) => r.type === "function" && r.id === n.tool_call_id))) return n.content;
  }
}, rs = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, Uh = function(t) {
  if (t.n != null && t.n > 1) throw new U("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, Fh = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var Uw = class Gh extends Oh {
  static runTools(t, n, o) {
    const r = new Gh(), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), _r(t) && t.content && this._emit("content", t.content);
  }
}, oe = {
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
}, Fw = class extends Error {
}, Ow = class extends Error {
};
function Gw(e, t = oe.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return Bw(e.trim(), t);
}
var Bw = (e, t) => {
  const n = e.length;
  let o = 0;
  const r = (p) => {
    throw new Fw(`${p} at position ${o}`);
  }, i = (p) => {
    throw new Ow(`${p} at position ${o}`);
  }, a = () => (f(), o >= n && r("Unexpected end of input"), e[o] === '"' ? u() : e[o] === "{" ? c() : e[o] === "[" ? d() : e.substring(o, o + 4) === "null" || oe.NULL & t && n - o < 4 && "null".startsWith(e.substring(o)) ? (o += 4, null) : e.substring(o, o + 4) === "true" || oe.BOOL & t && n - o < 4 && "true".startsWith(e.substring(o)) ? (o += 4, !0) : e.substring(o, o + 5) === "false" || oe.BOOL & t && n - o < 5 && "false".startsWith(e.substring(o)) ? (o += 5, !1) : e.substring(o, o + 8) === "Infinity" || oe.INFINITY & t && n - o < 8 && "Infinity".startsWith(e.substring(o)) ? (o += 8, 1 / 0) : e.substring(o, o + 9) === "-Infinity" || oe.MINUS_INFINITY & t && 1 < n - o && n - o < 9 && "-Infinity".startsWith(e.substring(o)) ? (o += 9, -1 / 0) : e.substring(o, o + 3) === "NaN" || oe.NAN & t && n - o < 3 && "NaN".startsWith(e.substring(o)) ? (o += 3, NaN) : h()), u = () => {
    const p = o;
    let m = !1;
    for (o++; o < n && (e[o] !== '"' || m && e[o - 1] === "\\"); )
      m = e[o] === "\\" ? !m : !1, o++;
    if (e.charAt(o) == '"') try {
      return JSON.parse(e.substring(p, ++o - Number(m)));
    } catch (g) {
      i(String(g));
    }
    else if (oe.STR & t) try {
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
        if (f(), o >= n && oe.OBJ & t) return p;
        const m = u();
        f(), o++;
        try {
          const g = a();
          Object.defineProperty(p, m, {
            value: g,
            writable: !0,
            enumerable: !0,
            configurable: !0
          });
        } catch (g) {
          if (oe.OBJ & t) return p;
          throw g;
        }
        f(), e[o] === "," && o++;
      }
    } catch {
      if (oe.OBJ & t) return p;
      r("Expected '}' at end of object");
    }
    return o++, p;
  }, d = () => {
    o++;
    const p = [];
    try {
      for (; e[o] !== "]"; )
        p.push(a()), f(), e[o] === "," && o++;
    } catch {
      if (oe.ARR & t) return p;
      r("Expected ']' at end of array");
    }
    return o++, p;
  }, h = () => {
    if (o === 0) {
      e === "-" && oe.NUM & t && r("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (oe.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        i(String(m));
      }
    }
    const p = o;
    for (e[o] === "-" && o++; e[o] && !",]}".includes(e[o]); ) o++;
    o == n && !(oe.NUM & t) && r("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, o));
    } catch {
      e.substring(p, o) === "-" && oe.NUM & t && r("Not sure what '-' is");
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
  return a();
}, pc = (e) => Gw(e, oe.ALL ^ oe.NUM), j, Qe, Gt, ct, ci, Ho, di, fi, hi, Vo, pi, mc, Bh = class is extends Oh {
  constructor(t) {
    super(), j.add(this), Qe.set(this, void 0), Gt.set(this, void 0), ct.set(this, void 0), O(this, Qe, t, "f"), O(this, Gt, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return T(this, ct, "f");
  }
  static fromReadableStream(t) {
    const n = new is(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, o) {
    const r = new is(n);
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
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), T(this, j, "m", ci).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) T(this, j, "m", di).call(this, a);
    if (i.controller.signal?.aborted) throw new xe();
    return this._addChatCompletion(T(this, j, "m", Vo).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), T(this, j, "m", ci).call(this), this._connected();
    const r = ro.fromReadableStream(t, this.controller);
    let i;
    for await (const a of r)
      i && i !== a.id && this._addChatCompletion(T(this, j, "m", Vo).call(this)), T(this, j, "m", di).call(this, a), i = a.id;
    if (r.controller.signal?.aborted) throw new xe();
    return this._addChatCompletion(T(this, j, "m", Vo).call(this));
  }
  [(Qe = /* @__PURE__ */ new WeakMap(), Gt = /* @__PURE__ */ new WeakMap(), ct = /* @__PURE__ */ new WeakMap(), j = /* @__PURE__ */ new WeakSet(), ci = function() {
    this.ended || O(this, ct, void 0, "f");
  }, Ho = function(n) {
    let o = T(this, Gt, "f")[n.index];
    return o || (o = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, T(this, Gt, "f")[n.index] = o, o);
  }, di = function(n) {
    if (this.ended) return;
    const o = T(this, j, "m", mc).call(this, n);
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
      const a = T(this, j, "m", Ho).call(this, i);
      i.finish_reason && (T(this, j, "m", hi).call(this, i), a.current_tool_call_index != null && T(this, j, "m", fi).call(this, i, a.current_tool_call_index));
      for (const u of r.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (T(this, j, "m", hi).call(this, i), a.current_tool_call_index != null && T(this, j, "m", fi).call(this, i, a.current_tool_call_index)), a.current_tool_call_index = u.index;
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
  }, fi = function(n, o) {
    if (T(this, j, "m", Ho).call(this, n).done_tool_calls.has(o)) return;
    const r = n.message.tool_calls?.[o];
    if (!r) throw new Error("no tool call snapshot");
    if (!r.type) throw new Error("tool call snapshot missing `type`");
    if (r.type === "function") {
      const i = T(this, Qe, "f")?.tools?.find((a) => gr(a) && a.function.name === r.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: r.function.name,
        index: o,
        arguments: r.function.arguments,
        parsed_arguments: _o(i) ? i.$parseRaw(r.function.arguments) : i?.function.strict ? JSON.parse(r.function.arguments) : null
      });
    } else r.type;
  }, hi = function(n) {
    const o = T(this, j, "m", Ho).call(this, n);
    if (n.message.content && !o.content_done) {
      o.content_done = !0;
      const r = T(this, j, "m", pi).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: r ? r.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !o.refusal_done && (o.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !o.logprobs_content_done && (o.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !o.logprobs_refusal_done && (o.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Vo = function() {
    if (this.ended) throw new U("stream has ended, this shouldn't happen");
    const n = T(this, ct, "f");
    if (!n) throw new U("request ended without sending any chunks");
    return O(this, ct, void 0, "f"), O(this, Gt, [], "f"), qw(n, T(this, Qe, "f"));
  }, pi = function() {
    const n = T(this, Qe, "f")?.response_format;
    return Ws(n) ? n : null;
  }, mc = function(n) {
    var o, r, i, a;
    let u = T(this, ct, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = O(this, ct, {
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
        const { content: E, refusal: L, ...w } = m;
        Object.assign(_.logprobs, w), E && ((o = _.logprobs).content ?? (o.content = []), _.logprobs.content.push(...E)), L && ((r = _.logprobs).refusal ?? (r.refusal = []), _.logprobs.refusal.push(...L));
      }
      if (f && (_.finish_reason = f, T(this, Qe, "f") && kh(T(this, Qe, "f")))) {
        if (f === "length") throw new dh();
        if (f === "content_filter") throw new fh();
      }
      if (Object.assign(_, g), !h) continue;
      const { content: y, refusal: S, function_call: I, role: b, tool_calls: P, ...D } = h;
      if (Object.assign(_.message, D), S && (_.message.refusal = (_.message.refusal || "") + S), b && (_.message.role = b), I && (_.message.function_call ? (I.name && (_.message.function_call.name = I.name), I.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += I.arguments)) : _.message.function_call = I), y && (_.message.content = (_.message.content || "") + y, !_.message.refusal && T(this, j, "m", pi).call(this) && (_.message.parsed = pc(_.message.content))), P) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: E, id: L, type: w, function: M, ...F } of P) {
          const H = (a = _.message.tool_calls)[E] ?? (a[E] = {});
          Object.assign(H, F), L && (H.id = L), w && (H.type = w), M && (H.function ?? (H.function = {
            name: M.name ?? "",
            arguments: ""
          })), M?.name && (H.function.name = M.name), M?.arguments && (H.function.arguments += M.arguments, kw(T(this, Qe, "f"), H) && (H.function.parsed_arguments = pc(H.function.arguments)));
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
    return new ro(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function qw(e, t) {
  const { id: n, choices: o, created: r, model: i, system_fingerprint: a, ...u } = e;
  return Mw({
    ...u,
    id: n,
    choices: o.map(({ message: c, finish_reason: d, index: h, logprobs: f, ...p }) => {
      if (!d) throw new U(`missing finish_reason for choice ${h}`);
      const { content: m = null, function_call: g, tool_calls: _, ...y } = c, S = c.role;
      if (!S) throw new U(`missing role for choice ${h}`);
      if (g) {
        const { arguments: I, name: b } = g;
        if (I == null) throw new U(`missing function_call.arguments for choice ${h}`);
        if (!b) throw new U(`missing function_call.name for choice ${h}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: I,
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
          tool_calls: _.map((I, b) => {
            const { function: P, type: D, id: E, ...L } = I, { arguments: w, name: M, ...F } = P || {};
            if (E == null) throw new U(`missing choices[${h}].tool_calls[${b}].id
${Jo(e)}`);
            if (D == null) throw new U(`missing choices[${h}].tool_calls[${b}].type
${Jo(e)}`);
            if (M == null) throw new U(`missing choices[${h}].tool_calls[${b}].function.name
${Jo(e)}`);
            if (w == null) throw new U(`missing choices[${h}].tool_calls[${b}].function.arguments
${Jo(e)}`);
            return {
              ...L,
              id: E,
              type: D,
              function: {
                ...F,
                name: M,
                arguments: w
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
    created: r,
    model: i,
    object: "chat.completion",
    ...a ? { system_fingerprint: a } : {}
  }, t);
}
function Jo(e) {
  return JSON.stringify(e);
}
var Hw = class ss extends Bh {
  static fromReadableStream(t) {
    const n = new ss(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, o) {
    const r = new ss(n), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
}, Xs = class extends R {
  constructor() {
    super(...arguments), this.messages = new Nh(this._client);
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
    return this._client.getAPIList("/chat/completions", X, {
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
    return Dw(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => zs(n, e));
  }
  runTools(e, t) {
    return e.stream ? Hw.runTools(this._client, e, t) : Uw.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Bh.createChatCompletion(this._client, e, t);
  }
};
Xs.Messages = Nh;
var Qs = class extends R {
  constructor() {
    super(...arguments), this.completions = new Xs(this._client);
  }
};
Qs.Completions = Xs;
var qh = class extends R {
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
    return this._client.getAPIList("/organization/admin_api_keys", X, {
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
}, Hh = class extends R {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", ae, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Vh = class extends R {
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
    return this._client.getAPIList("/organization/certificates", ae, {
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
    return this._client.getAPIList("/organization/certificates/activate", yt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", yt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Jh = class extends R {
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
}, Kh = class extends R {
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
    return this._client.getAPIList("/organization/invites", ae, {
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
}, Wh = class extends R {
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
    return this._client.getAPIList("/organization/roles", st, {
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
}, zh = class extends R {
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
    return this._client.getAPIList("/organization/spend_alerts", ae, {
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
}, Yh = class extends R {
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
}, Xh = class extends R {
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
    return this._client.getAPIList(v`/organization/groups/${e}/roles`, st, {
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
}, Qh = class extends R {
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
    return this._client.getAPIList(v`/organization/groups/${e}/users`, st, {
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
}, Or = class extends R {
  constructor() {
    super(...arguments), this.users = new Qh(this._client), this.roles = new Xh(this._client);
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
    return this._client.getAPIList("/organization/groups", st, {
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
Or.Users = Qh;
Or.Roles = Xh;
var Zh = class extends R {
  retrieve(e, t, n) {
    const { project_id: o } = t;
    return this._client.get(v`/organization/projects/${o}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/api_keys`, ae, {
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
}, jh = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates`, ae, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/activate`, yt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/deactivate`, yt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, ep = class extends R {
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
}, tp = class extends R {
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
}, np = class extends R {
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
}, op = class extends R {
  listRateLimits(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/rate_limits`, ae, {
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
}, rp = class extends R {
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
    return this._client.getAPIList(v`/projects/${e}/roles`, st, {
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
}, ip = class extends R {
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
    return this._client.getAPIList(v`/organization/projects/${e}/service_accounts`, ae, {
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
}, sp = class extends R {
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
    return this._client.getAPIList(v`/organization/projects/${e}/spend_alerts`, ae, {
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
}, ap = class extends R {
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
    return this._client.getAPIList(v`/projects/${o}/groups/${e}/roles`, st, {
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
}, Zs = class extends R {
  constructor() {
    super(...arguments), this.roles = new ap(this._client);
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
    return this._client.getAPIList(v`/organization/projects/${e}/groups`, st, {
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
Zs.Roles = ap;
var lp = class extends R {
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
    return this._client.getAPIList(v`/projects/${o}/users/${e}/roles`, st, {
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
}, js = class extends R {
  constructor() {
    super(...arguments), this.roles = new lp(this._client);
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
    return this._client.getAPIList(v`/organization/projects/${e}/users`, ae, {
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
js.Roles = lp;
var be = class extends R {
  constructor() {
    super(...arguments), this.users = new js(this._client), this.serviceAccounts = new ip(this._client), this.apiKeys = new Zh(this._client), this.rateLimits = new op(this._client), this.modelPermissions = new np(this._client), this.hostedToolPermissions = new tp(this._client), this.groups = new Zs(this._client), this.roles = new rp(this._client), this.dataRetention = new ep(this._client), this.spendAlerts = new sp(this._client), this.certificates = new jh(this._client);
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
    return this._client.getAPIList("/organization/projects", ae, {
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
be.Users = js;
be.ServiceAccounts = ip;
be.APIKeys = Zh;
be.RateLimits = op;
be.ModelPermissions = np;
be.HostedToolPermissions = tp;
be.Groups = Zs;
be.Roles = rp;
be.DataRetention = ep;
be.SpendAlerts = sp;
be.Certificates = jh;
var up = class extends R {
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
    return this._client.getAPIList(v`/organization/users/${e}/roles`, st, {
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
}, ea = class extends R {
  constructor() {
    super(...arguments), this.roles = new up(this._client);
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
    return this._client.getAPIList("/organization/users", ae, {
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
ea.Roles = up;
var Re = class extends R {
  constructor() {
    super(...arguments), this.auditLogs = new Hh(this._client), this.adminAPIKeys = new qh(this._client), this.usage = new Yh(this._client), this.invites = new Kh(this._client), this.users = new ea(this._client), this.groups = new Or(this._client), this.roles = new Wh(this._client), this.dataRetention = new Jh(this._client), this.spendAlerts = new zh(this._client), this.certificates = new Vh(this._client), this.projects = new be(this._client);
  }
};
Re.AuditLogs = Hh;
Re.AdminAPIKeys = qh;
Re.Usage = Yh;
Re.Invites = Kh;
Re.Users = ea;
Re.Groups = Or;
Re.Roles = Wh;
Re.DataRetention = Jh;
Re.SpendAlerts = zh;
Re.Certificates = Vh;
Re.Projects = be;
var ta = class extends R {
  constructor() {
    super(...arguments), this.organization = new Re(this._client);
  }
};
ta.Organization = Re;
var cp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* Vw(e) {
  if (!e) return;
  if (cp in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Zu(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = Zu(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [r, null]), yield [r, u]);
  }
}
var k = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, a] of Vw(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [cp]: !0,
    values: t,
    nulls: n
  };
}, dp = class extends R {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: k([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, fp = class extends R {
  create(e, t) {
    return this._client.post("/audio/transcriptions", Ke({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, hp = class extends R {
  create(e, t) {
    return this._client.post("/audio/translations", Ke({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, yo = class extends R {
  constructor() {
    super(...arguments), this.transcriptions = new fp(this._client), this.translations = new hp(this._client), this.speech = new dp(this._client);
  }
};
yo.Transcriptions = fp;
yo.Translations = hp;
yo.Speech = dp;
var pp = class extends R {
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
    return this._client.getAPIList("/batches", X, {
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
}, mp = class extends R {
  create(e, t) {
    return this._client.post("/assistants", {
      body: e,
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/assistants/${e}`, {
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/assistants/${e}`, {
      body: t,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/assistants", X, {
      query: e,
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/assistants/${e}`, {
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, gp = class extends R {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, _p = class extends R {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Gr = class extends R {
  constructor() {
    super(...arguments), this.sessions = new gp(this._client), this.transcriptionSessions = new _p(this._client);
  }
};
Gr.Sessions = gp;
Gr.TranscriptionSessions = _p;
var yp = class extends R {
  create(e, t) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...t,
      headers: k([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t) {
    return this._client.post(v`/chatkit/sessions/${e}/cancel`, {
      ...t,
      headers: k([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, vp = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/chatkit/threads/${e}`, {
      ...t,
      headers: k([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", ae, {
      query: e,
      ...t,
      headers: k([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/chatkit/threads/${e}`, {
      ...t,
      headers: k([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  listItems(e, t = {}, n) {
    return this._client.getAPIList(v`/chatkit/threads/${e}/items`, ae, {
      query: t,
      ...n,
      headers: k([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Br = class extends R {
  constructor() {
    super(...arguments), this.sessions = new yp(this._client), this.threads = new vp(this._client);
  }
};
Br.Sessions = yp;
Br.Threads = vp;
var Ap = class extends R {
  create(e, t, n) {
    return this._client.post(v`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(v`/threads/${o}/messages/${e}`, {
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/messages/${e}`, {
      body: r,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/threads/${e}/messages`, X, {
      query: t,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { thread_id: o } = t;
    return this._client.delete(v`/threads/${o}/messages/${e}`, {
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Tp = class extends R {
  retrieve(e, t, n) {
    const { thread_id: o, run_id: r, ...i } = t;
    return this._client.get(v`/threads/${o}/runs/${r}/steps/${e}`, {
      query: i,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.getAPIList(v`/threads/${o}/runs/${e}/steps`, X, {
      query: r,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Jw = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, o = new Uint8Array(n);
    for (let r = 0; r < n; r++) o[r] = t.charCodeAt(r);
    return Array.from(new Float32Array(o.buffer));
  }
}, dt = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, se, Nt, as, Je, or, Le, kt, Qt, Rt, Tr, we, rr, ir, Qn, Jn, Kn, gc, _c, yc, vc, Ac, Tc, Sc, Zn = class extends Ys {
  constructor() {
    super(...arguments), se.add(this), as.set(this, []), Je.set(this, {}), or.set(this, {}), Le.set(this, void 0), kt.set(this, void 0), Qt.set(this, void 0), Rt.set(this, void 0), Tr.set(this, void 0), we.set(this, void 0), rr.set(this, void 0), ir.set(this, void 0), Qn.set(this, void 0);
  }
  [(as = /* @__PURE__ */ new WeakMap(), Je = /* @__PURE__ */ new WeakMap(), or = /* @__PURE__ */ new WeakMap(), Le = /* @__PURE__ */ new WeakMap(), kt = /* @__PURE__ */ new WeakMap(), Qt = /* @__PURE__ */ new WeakMap(), Rt = /* @__PURE__ */ new WeakMap(), Tr = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakMap(), rr = /* @__PURE__ */ new WeakMap(), ir = /* @__PURE__ */ new WeakMap(), Qn = /* @__PURE__ */ new WeakMap(), se = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new Nt();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const o = ro.fromReadableStream(e, this.controller);
    for await (const r of o) T(this, se, "m", Jn).call(this, r);
    if (o.controller.signal?.aborted) throw new xe();
    return this._addRun(T(this, se, "m", Kn).call(this));
  }
  toReadableStream() {
    return new ro(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, o) {
    const r = new Nt();
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
    }, a = await e.submitToolOutputs(t, i, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) T(this, se, "m", Jn).call(this, u);
    if (a.controller.signal?.aborted) throw new xe();
    return this._addRun(T(this, se, "m", Kn).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const o = new Nt();
    return o._run(() => o._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  static createAssistantStream(e, t, n, o) {
    const r = new Nt();
    return r._run(() => r._runAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  currentEvent() {
    return T(this, rr, "f");
  }
  currentRun() {
    return T(this, ir, "f");
  }
  currentMessageSnapshot() {
    return T(this, Le, "f");
  }
  currentRunStepSnapshot() {
    return T(this, Qn, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(T(this, Je, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(T(this, or, "f"));
  }
  async finalRun() {
    if (await this.done(), !T(this, kt, "f")) throw Error("Final run was not received.");
    return T(this, kt, "f");
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
    for await (const a of i) T(this, se, "m", Jn).call(this, a);
    if (i.controller.signal?.aborted) throw new xe();
    return this._addRun(T(this, se, "m", Kn).call(this));
  }
  async _createAssistantStream(e, t, n, o) {
    const r = o?.signal;
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort()));
    const i = {
      ...n,
      stream: !0
    }, a = await e.create(t, i, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of a) T(this, se, "m", Jn).call(this, u);
    if (a.controller.signal?.aborted) throw new xe();
    return this._addRun(T(this, se, "m", Kn).call(this));
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
      else if (ai(r) && ai(o)) r = this.accumulateDelta(r, o);
      else if (Array.isArray(r) && Array.isArray(o)) {
        if (r.every((i) => typeof i == "string" || typeof i == "number")) {
          r.push(...o);
          continue;
        }
        for (const i of o) {
          if (!ai(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
          const a = i.index;
          if (a == null)
            throw console.error(i), new Error("Expected array delta entry to have an `index` property");
          if (typeof a != "number") throw new Error(`Expected array delta entry \`index\` property to be a number but got ${a}`);
          const u = r[a];
          u == null ? r.push(i) : r[a] = this.accumulateDelta(u, i);
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
Nt = Zn, Jn = function(t) {
  if (!this.ended)
    switch (O(this, rr, t, "f"), T(this, se, "m", yc).call(this, t), t.event) {
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
        T(this, se, "m", Sc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        T(this, se, "m", _c).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        T(this, se, "m", gc).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, Kn = function() {
  if (this.ended) throw new U("stream has ended, this shouldn't happen");
  if (!T(this, kt, "f")) throw Error("Final run has not been received");
  return T(this, kt, "f");
}, gc = function(t) {
  const [n, o] = T(this, se, "m", Ac).call(this, t, T(this, Le, "f"));
  O(this, Le, n, "f"), T(this, or, "f")[n.id] = n;
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
          let i = r.text, a = n.content[r.index];
          if (a && a.type == "text") this._emit("textDelta", i, a.text);
          else throw Error("The snapshot associated with this text delta is not text or missing");
        }
        if (r.index != T(this, Qt, "f")) {
          if (T(this, Rt, "f")) switch (T(this, Rt, "f").type) {
            case "text":
              this._emit("textDone", T(this, Rt, "f").text, T(this, Le, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", T(this, Rt, "f").image_file, T(this, Le, "f"));
              break;
          }
          O(this, Qt, r.index, "f");
        }
        O(this, Rt, n.content[r.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (T(this, Qt, "f") !== void 0) {
        const r = t.data.content[T(this, Qt, "f")];
        if (r) switch (r.type) {
          case "image_file":
            this._emit("imageFileDone", r.image_file, T(this, Le, "f"));
            break;
          case "text":
            this._emit("textDone", r.text, T(this, Le, "f"));
            break;
        }
      }
      T(this, Le, "f") && this._emit("messageDone", t.data), O(this, Le, void 0, "f");
  }
}, _c = function(t) {
  const n = T(this, se, "m", vc).call(this, t);
  switch (O(this, Qn, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const o = t.data.delta;
      if (o.step_details && o.step_details.type == "tool_calls" && o.step_details.tool_calls && n.step_details.type == "tool_calls") for (const r of o.step_details.tool_calls) r.index == T(this, Tr, "f") ? this._emit("toolCallDelta", r, n.step_details.tool_calls[r.index]) : (T(this, we, "f") && this._emit("toolCallDone", T(this, we, "f")), O(this, Tr, r.index, "f"), O(this, we, n.step_details.tool_calls[r.index], "f"), T(this, we, "f") && this._emit("toolCallCreated", T(this, we, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      O(this, Qn, void 0, "f"), t.data.step_details.type == "tool_calls" && T(this, we, "f") && (this._emit("toolCallDone", T(this, we, "f")), O(this, we, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, yc = function(t) {
  T(this, as, "f").push(t), this._emit("event", t);
}, vc = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return T(this, Je, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = T(this, Je, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let o = t.data;
      if (o.delta) {
        const r = Nt.accumulateDelta(n, o.delta);
        T(this, Je, "f")[t.data.id] = r;
      }
      return T(this, Je, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      T(this, Je, "f")[t.data.id] = t.data;
      break;
  }
  if (T(this, Je, "f")[t.data.id]) return T(this, Je, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Ac = function(t, n) {
  let o = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, o];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let r = t.data;
      if (r.delta.content) for (const i of r.delta.content) if (i.index in n.content) {
        let a = n.content[i.index];
        n.content[i.index] = T(this, se, "m", Tc).call(this, i, a);
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
}, Tc = function(t, n) {
  return Nt.accumulateDelta(n, t);
}, Sc = function(t) {
  switch (O(this, ir, t.data, "f"), t.event) {
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
      O(this, kt, t.data, "f"), T(this, we, "f") && (this._emit("toolCallDone", T(this, we, "f")), O(this, we, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var na = class extends R {
  constructor() {
    super(...arguments), this.steps = new Tp(this._client);
  }
  create(e, t, n) {
    const { include: o, ...r } = t;
    return this._client.post(v`/threads/${e}/runs`, {
      query: { include: o },
      body: r,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(v`/threads/${o}/runs/${e}`, {
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/runs/${e}`, {
      body: r,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/threads/${e}/runs`, X, {
      query: t,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { thread_id: o } = t;
    return this._client.post(v`/threads/${o}/runs/${e}/cancel`, {
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(o.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return Zn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const o = k([n?.headers, {
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
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = i.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await go(a);
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
    return Zn.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/runs/${e}/submit_tool_outputs`, {
      body: r,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
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
    return Zn.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
na.Steps = Tp;
var qr = class extends R {
  constructor() {
    super(...arguments), this.runs = new na(this._client), this.messages = new Ap(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/threads", {
      body: e,
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/threads/${e}`, {
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/threads/${e}`, {
      body: t,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/threads/${e}`, {
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  createAndRun(e, t) {
    return this._client.post("/threads/runs", {
      body: e,
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
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
    return Zn.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
qr.Runs = na;
qr.Messages = Ap;
var cn = class extends R {
  constructor() {
    super(...arguments), this.realtime = new Gr(this._client), this.chatkit = new Br(this._client), this.assistants = new mp(this._client), this.threads = new qr(this._client);
  }
};
cn.Realtime = Gr;
cn.ChatKit = Br;
cn.Assistants = mp;
cn.Threads = qr;
var Sp = class extends R {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, Ep = class extends R {
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(v`/containers/${o}/files/${e}/content`, {
      ...n,
      headers: k([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, oa = class extends R {
  constructor() {
    super(...arguments), this.content = new Ep(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/containers/${e}/files`, Fr({
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
    return this._client.getAPIList(v`/containers/${e}/files`, X, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { container_id: o } = t;
    return this._client.delete(v`/containers/${o}/files/${e}`, {
      ...n,
      headers: k([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
oa.Content = Ep;
var ra = class extends R {
  constructor() {
    super(...arguments), this.files = new oa(this._client);
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
    return this._client.getAPIList("/containers", X, {
      query: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/containers/${e}`, {
      ...t,
      headers: k([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
ra.Files = oa;
var Ip = class extends R {
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
    return this._client.getAPIList(v`/conversations/${e}/items`, ae, {
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
}, ia = class extends R {
  constructor() {
    super(...arguments), this.items = new Ip(this._client);
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
ia.Items = Ip;
var wp = class extends R {
  create(e, t) {
    const n = !!e.encoding_format;
    let o = n ? e.encoding_format : "base64";
    n && ie(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const r = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: o
      },
      ...t,
      __security: { bearerAuth: !0 }
    });
    return n ? r : (ie(this._client).debug("embeddings/decoding base64 embeddings from base64"), r._thenUnwrap((i) => (i && i.data && i.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = Jw(u);
    }), i)));
  }
}, Cp = class extends R {
  retrieve(e, t, n) {
    const { eval_id: o, run_id: r } = t;
    return this._client.get(v`/evals/${o}/runs/${r}/output_items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { eval_id: o, ...r } = t;
    return this._client.getAPIList(v`/evals/${o}/runs/${e}/output_items`, X, {
      query: r,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, sa = class extends R {
  constructor() {
    super(...arguments), this.outputItems = new Cp(this._client);
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
    return this._client.getAPIList(v`/evals/${e}/runs`, X, {
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
sa.OutputItems = Cp;
var aa = class extends R {
  constructor() {
    super(...arguments), this.runs = new sa(this._client);
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
    return this._client.getAPIList("/evals", X, {
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
aa.Runs = sa;
var bp = class extends R {
  create(e, t) {
    return this._client.post("/files", Ke({
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
    return this._client.getAPIList("/files", X, {
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
      headers: k([{ Accept: "application/binary" }, t?.headers]),
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
      if (await go(t), i = await this.retrieve(e), Date.now() - r > n) throw new Hs({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, Rp = class extends R {
}, Pp = class extends R {
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
}, la = class extends R {
  constructor() {
    super(...arguments), this.graders = new Pp(this._client);
  }
};
la.Graders = Pp;
var Mp = class extends R {
  create(e, t, n) {
    return this._client.getAPIList(v`/fine_tuning/checkpoints/${e}/permissions`, yt, {
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
    return this._client.getAPIList(v`/fine_tuning/checkpoints/${e}/permissions`, ae, {
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
}, ua = class extends R {
  constructor() {
    super(...arguments), this.permissions = new Mp(this._client);
  }
};
ua.Permissions = Mp;
var xp = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/fine_tuning/jobs/${e}/checkpoints`, X, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, ca = class extends R {
  constructor() {
    super(...arguments), this.checkpoints = new xp(this._client);
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
    return this._client.getAPIList("/fine_tuning/jobs", X, {
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
    return this._client.getAPIList(v`/fine_tuning/jobs/${e}/events`, X, {
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
ca.Checkpoints = xp;
var dn = class extends R {
  constructor() {
    super(...arguments), this.methods = new Rp(this._client), this.jobs = new ca(this._client), this.checkpoints = new ua(this._client), this.alpha = new la(this._client);
  }
};
dn.Methods = Rp;
dn.Jobs = ca;
dn.Checkpoints = ua;
dn.Alpha = la;
var Np = class extends R {
}, da = class extends R {
  constructor() {
    super(...arguments), this.graderModels = new Np(this._client);
  }
};
da.GraderModels = Np;
var kp = class extends R {
  createVariation(e, t) {
    return this._client.post("/images/variations", Ke({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", Ke({
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
}, Dp = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", yt, {
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
}, $p = class extends R {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Lp = class extends R {
  accept(e, t, n) {
    return this._client.post(v`/realtime/calls/${e}/accept`, {
      body: t,
      ...n,
      headers: k([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  hangup(e, t) {
    return this._client.post(v`/realtime/calls/${e}/hangup`, {
      ...t,
      headers: k([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  refer(e, t, n) {
    return this._client.post(v`/realtime/calls/${e}/refer`, {
      body: t,
      ...n,
      headers: k([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  reject(e, t = {}, n) {
    return this._client.post(v`/realtime/calls/${e}/reject`, {
      body: t,
      ...n,
      headers: k([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Up = class extends R {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Hr = class extends R {
  constructor() {
    super(...arguments), this.clientSecrets = new Up(this._client), this.calls = new Lp(this._client);
  }
};
Hr.ClientSecrets = Up;
Hr.Calls = Lp;
function Kw(e, t) {
  return !t || !zw(t) ? {
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
  } : Fp(e, t);
}
function Fp(e, t) {
  const n = e.output.map((r) => {
    if (r.type === "function_call") return {
      ...r,
      parsed_arguments: Qw(t, r)
    };
    if (r.type === "message") {
      const i = r.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: Ww(t, a.text)
      } : a);
      return {
        ...r,
        content: i
      };
    }
    return r;
  }), o = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || ls(o), Object.defineProperty(o, "output_parsed", {
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
function Ww(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function zw(e) {
  return !!Ws(e.text?.format);
}
function Yw(e) {
  return e?.$brand === "auto-parseable-tool";
}
function Xw(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function Qw(e, t) {
  const n = Xw(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: Yw(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function ls(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const o of n.content) o.type === "output_text" && t.push(o.text);
  e.output_text = t.join("");
}
var Bt, Ko, ft, Wo, Ec, Ic, wc, Cc, Zw = class Op extends Ys {
  constructor(t) {
    super(), Bt.add(this), Ko.set(this, void 0), ft.set(this, void 0), Wo.set(this, void 0), O(this, Ko, t, "f");
  }
  static createResponse(t, n, o) {
    const r = new Op(n);
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
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), T(this, Bt, "m", Ec).call(this);
    let i, a = null;
    "response_id" in n ? (i = await t.responses.retrieve(n.response_id, { stream: !0 }, {
      ...o,
      signal: this.controller.signal,
      stream: !0
    }), a = n.starting_after ?? null) : i = await t.responses.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    }), this._connected();
    for await (const u of i) T(this, Bt, "m", Ic).call(this, u, a);
    if (i.controller.signal?.aborted) throw new xe();
    return T(this, Bt, "m", wc).call(this);
  }
  [(Ko = /* @__PURE__ */ new WeakMap(), ft = /* @__PURE__ */ new WeakMap(), Wo = /* @__PURE__ */ new WeakMap(), Bt = /* @__PURE__ */ new WeakSet(), Ec = function() {
    this.ended || O(this, ft, void 0, "f");
  }, Ic = function(n, o) {
    if (this.ended) return;
    const r = (a, u) => {
      (o == null || u.sequence_number > o) && this._emit(a, u);
    }, i = T(this, Bt, "m", Cc).call(this, n);
    switch (r("event", n), n.type) {
      case "response.output_text.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new U(`missing output at index ${n.output_index}`);
        if (a.type === "message") {
          const u = a.content[n.content_index];
          if (!u) throw new U(`missing content at index ${n.content_index}`);
          if (u.type !== "output_text") throw new U(`expected content to be 'output_text', got ${u.type}`);
          r("response.output_text.delta", {
            ...n,
            snapshot: u.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const a = i.output[n.output_index];
        if (!a) throw new U(`missing output at index ${n.output_index}`);
        a.type === "function_call" && r("response.function_call_arguments.delta", {
          ...n,
          snapshot: a.arguments
        });
        break;
      }
      default:
        r(n.type, n);
        break;
    }
  }, wc = function() {
    if (this.ended) throw new U("stream has ended, this shouldn't happen");
    const n = T(this, ft, "f");
    if (!n) throw new U("request ended without sending any events");
    O(this, ft, void 0, "f");
    const o = jw(n, T(this, Ko, "f"));
    return O(this, Wo, o, "f"), o;
  }, Cc = function(n) {
    let o = T(this, ft, "f");
    if (!o) {
      if (n.type !== "response.created") throw new U(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return o = O(this, ft, n.response, "f"), o;
    }
    switch (n.type) {
      case "response.output_item.added":
        o.output.push(n.item);
        break;
      case "response.content_part.added": {
        const r = o.output[n.output_index];
        if (!r) throw new U(`missing output at index ${n.output_index}`);
        const i = r.type, a = n.part;
        i === "message" && a.type !== "reasoning_text" ? r.content.push(a) : i === "reasoning" && a.type === "reasoning_text" && (r.content || (r.content = []), r.content.push(a));
        break;
      }
      case "response.output_text.delta": {
        const r = o.output[n.output_index];
        if (!r) throw new U(`missing output at index ${n.output_index}`);
        if (r.type === "message") {
          const i = r.content[n.content_index];
          if (!i) throw new U(`missing content at index ${n.content_index}`);
          if (i.type !== "output_text") throw new U(`expected content to be 'output_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const r = o.output[n.output_index];
        if (!r) throw new U(`missing output at index ${n.output_index}`);
        r.type === "function_call" && (r.arguments += n.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const r = o.output[n.output_index];
        if (!r) throw new U(`missing output at index ${n.output_index}`);
        if (r.type === "reasoning") {
          const i = r.content?.[n.content_index];
          if (!i) throw new U(`missing content at index ${n.content_index}`);
          if (i.type !== "reasoning_text") throw new U(`expected content to be 'reasoning_text', got ${i.type}`);
          i.text += n.delta;
        }
        break;
      }
      case "response.completed":
        O(this, ft, n.response, "f");
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
    const t = T(this, Wo, "f");
    if (!t) throw new U("stream ended without producing a ChatCompletion");
    return t;
  }
};
function jw(e, t) {
  return Kw(e, t);
}
var Gp = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/responses/${e}/input_items`, X, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Bp = class extends R {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Vr = class extends R {
  constructor() {
    super(...arguments), this.inputItems = new Gp(this._client), this.inputTokens = new Bp(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && ls(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(v`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((o) => ("object" in o && o.object === "response" && ls(o), o));
  }
  delete(e, t) {
    return this._client.delete(v`/responses/${e}`, {
      ...t,
      headers: k([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Fp(n, e));
  }
  stream(e, t) {
    return Zw.createResponse(this._client, e, t);
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
Vr.InputItems = Gp;
Vr.InputTokens = Bp;
var qp = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/skills/${e}/content`, {
      ...t,
      headers: k([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Hp = class extends R {
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(v`/skills/${o}/versions/${e}/content`, {
      ...n,
      headers: k([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, fa = class extends R {
  constructor() {
    super(...arguments), this.content = new Hp(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(v`/skills/${e}/versions`, Fr({
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
    return this._client.getAPIList(v`/skills/${e}/versions`, X, {
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
fa.Content = Hp;
var Jr = class extends R {
  constructor() {
    super(...arguments), this.content = new qp(this._client), this.versions = new fa(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", Fr({
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
    return this._client.getAPIList("/skills", X, {
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
Jr.Content = qp;
Jr.Versions = fa;
var Vp = class extends R {
  create(e, t, n) {
    return this._client.post(v`/uploads/${e}/parts`, Ke({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, ha = class extends R {
  constructor() {
    super(...arguments), this.parts = new Vp(this._client);
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
ha.Parts = Vp;
var eC = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((r) => r.status === "rejected");
  if (n.length) {
    for (const r of n) console.error(r.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const o = [];
  for (const r of t) r.status === "fulfilled" && o.push(r.value);
  return o;
}, Jp = class extends R {
  create(e, t, n) {
    return this._client.post(v`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(v`/vector_stores/${o}/file_batches/${e}`, {
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.post(v`/vector_stores/${o}/file_batches/${e}/cancel`, {
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t);
    return await this.poll(e, o.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: o, ...r } = t;
    return this._client.getAPIList(v`/vector_stores/${o}/file_batches/${e}/files`, X, {
      query: r,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async poll(e, t, n) {
    const o = k([n?.headers, {
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
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = i.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await go(a);
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
    const r = o?.maxConcurrency ?? 5, i = Math.min(r, t.length), a = this._client, u = t.values(), c = [...n];
    async function d(h) {
      for (let f of h) {
        const p = await a.files.create({
          file: f,
          purpose: "assistants"
        }, o);
        c.push(p.id);
      }
    }
    return await eC(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, Kp = class extends R {
  create(e, t, n) {
    return this._client.post(v`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(v`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { vector_store_id: o, ...r } = t;
    return this._client.post(v`/vector_stores/${o}/files/${e}`, {
      body: r,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/vector_stores/${e}/files`, X, {
      query: t,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.delete(v`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(e, o.id, n);
  }
  async poll(e, t, n) {
    const o = k([n?.headers, {
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
          let a = 5e3;
          if (n?.pollIntervalMs) a = n.pollIntervalMs;
          else {
            const u = r.response.headers.get("openai-poll-after-ms");
            if (u) {
              const c = parseInt(u);
              isNaN(c) || (a = c);
            }
          }
          await go(a);
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
    return this._client.getAPIList(v`/vector_stores/${o}/files/${e}/content`, yt, {
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Kr = class extends R {
  constructor() {
    super(...arguments), this.files = new Kp(this._client), this.fileBatches = new Jp(this._client);
  }
  create(e, t) {
    return this._client.post("/vector_stores", {
      body: e,
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t) {
    return this._client.get(v`/vector_stores/${e}`, {
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    return this._client.post(v`/vector_stores/${e}`, {
      body: t,
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/vector_stores", X, {
      query: e,
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t) {
    return this._client.delete(v`/vector_stores/${e}`, {
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  search(e, t, n) {
    return this._client.getAPIList(v`/vector_stores/${e}/search`, yt, {
      body: t,
      method: "post",
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
Kr.Files = Kp;
Kr.FileBatches = Jp;
var Wp = class extends R {
  create(e, t) {
    return this._client.post("/videos", Ke({
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
    return this._client.getAPIList("/videos", ae, {
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
    return this._client.post("/videos/characters", Ke({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  downloadContent(e, t = {}, n) {
    return this._client.get(v`/videos/${e}/content`, {
      query: t,
      ...n,
      headers: k([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
  edit(e, t) {
    return this._client.post("/videos/edits", Ke({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", Ke({
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
    return this._client.post(v`/videos/${e}/remix`, Fr({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Kt, zp, sr, Yp = class extends R {
  constructor() {
    super(...arguments), Kt.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, o = 300) {
    return await this.verifySignature(e, t, n, o), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, o = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    T(this, Kt, "m", zp).call(this, n);
    const r = k([t]).values, i = T(this, Kt, "m", sr).call(this, r, "webhook-signature"), a = T(this, Kt, "m", sr).call(this, r, "webhook-timestamp"), u = T(this, Kt, "m", sr).call(this, r, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new Un("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > o) throw new Un("Webhook timestamp is too old");
    if (c > d + o) throw new Un("Webhook timestamp is too new");
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
    throw new Un("The given webhook signature does not match the expected signature");
  }
};
Kt = /* @__PURE__ */ new WeakSet(), zp = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, sr = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const o = t.get(n);
  if (o == null) throw new Error(`Missing required header: ${n}`);
  return o;
};
var us, pa, ar, Xp, tC = "workload-identity-auth", q = class {
  constructor({ baseURL: e = dt("OPENAI_BASE_URL"), apiKey: t = dt("OPENAI_API_KEY") ?? null, adminAPIKey: n = dt("OPENAI_ADMIN_KEY") ?? null, organization: o = dt("OPENAI_ORG_ID") ?? null, project: r = dt("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = dt("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: a, ...u } = {}) {
    us.add(this), ar.set(this, void 0), this.completions = new Sp(this), this.chat = new Qs(this), this.embeddings = new wp(this), this.files = new bp(this), this.images = new kp(this), this.audio = new yo(this), this.moderations = new $p(this), this.models = new Dp(this), this.fineTuning = new dn(this), this.graders = new da(this), this.vectorStores = new Kr(this), this.webhooks = new Yp(this), this.beta = new cn(this), this.batches = new pp(this), this.uploads = new ha(this), this.admin = new ta(this), this.responses = new Vr(this), this.realtime = new Hr(this), this.conversations = new ia(this), this.evals = new aa(this), this.containers = new ra(this), this.skills = new Jr(this), this.videos = new Wp(this);
    const c = {
      apiKey: t,
      adminAPIKey: n,
      organization: o,
      project: r,
      webhookSecret: i,
      workloadIdentity: a,
      ...u,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (t && a) throw new U("The `apiKey` and `workloadIdentity` options are mutually exclusive");
    if (!t && !n && !a) throw new U("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, `adminAPIKey`, or set the `OPENAI_API_KEY` or `OPENAI_ADMIN_KEY` environment variable.");
    if (!c.dangerouslyAllowBrowser && jI()) throw new U(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? pa.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = cc(c.logLevel, "ClientOptions.logLevel", this) ?? cc(dt("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? ph(), O(this, ar, rw, "f");
    const h = dt("OPENAI_CUSTOM_HEADERS");
    if (h) {
      const f = {};
      for (const p of h.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (f[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = k([f, c.defaultHeaders]);
    }
    this._options = c, a && (this._workloadIdentityAuth = new Sw(a, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = o, this.project = r, this.webhookSecret = i;
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
    return k([t.bearerAuth ? await this.bearerAuth(e) : null, t.adminAPIKeyAuth ? await this.adminAPIKeyAuth(e) : null]);
  }
  async bearerAuth(e) {
    if (this._workloadIdentityAuth) return k([{ Authorization: `Bearer ${await this._workloadIdentityAuth.getToken()}` }]);
    if (this.apiKey != null)
      return k([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  async adminAPIKeyAuth(e) {
    if (this.adminAPIKey != null)
      return k([{ Authorization: `Bearer ${this.adminAPIKey}` }]);
  }
  stringifyQuery(e) {
    return cw(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Vt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${nh()}`;
  }
  makeStatusError(e, t, n, o) {
    return ue.generate(e, t, n, o);
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
    const o = !T(this, us, "m", Xp).call(this) && n || this.baseURL, r = YI(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(r.searchParams);
    return (!ju(i) || !ju(a)) && (t = {
      ...a,
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
    return new wh(this, this.makeRequest(e, t, void 0));
  }
  async makeRequest(e, t, n) {
    const o = await e, r = o.maxRetries ?? this.maxRetries;
    t == null && (t = r), await this.prepareOptions(o);
    const { req: i, url: a, timeout: u } = await this.buildRequest(o, { retryCount: r - t });
    await this.prepareRequest(i, {
      url: a,
      options: o
    });
    const c = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), d = n === void 0 ? "" : `, retryOf: ${n}`, h = Date.now();
    if (ie(this).debug(`[${c}] sending request`, Ct({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new xe();
    const f = o.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(a, i, u, p, f).catch(zi), g = Date.now();
    if (m instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new xe();
      const S = Wi(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return ie(this).info(`[${c}] connection ${S ? "timed out" : "failed"} - ${y}`), ie(this).debug(`[${c}] connection ${S ? "timed out" : "failed"} (${y})`, Ct({
          retryOfRequestLogID: n,
          url: a,
          durationMs: g - h,
          message: m.message
        })), this.retryRequest(o, t, n ?? c);
      throw ie(this).info(`[${c}] connection ${S ? "timed out" : "failed"} - error; no more retries left`), ie(this).debug(`[${c}] connection ${S ? "timed out" : "failed"} (error; no more retries left)`, Ct({
        retryOfRequestLogID: n,
        url: a,
        durationMs: g - h,
        message: m.message
      })), m instanceof hh || m instanceof WI ? m : S ? new Hs() : new $r({
        message: nC(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, S]) => ", " + y + ": " + JSON.stringify(S)).join("")}] ${i.method} ${a} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - h}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && f.bearerAuth && !o.__metadata?.hasStreamingBody && !o.__metadata?.workloadIdentityTokenRefreshed)
        return await oc(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...o,
          __metadata: {
            ...o.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(m);
      if (t && y) {
        const D = `retrying, ${t} attempts remaining`;
        return await oc(m.body), ie(this).info(`${_} - ${D}`), ie(this).debug(`[${c}] response error (${D})`, Ct({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - h
        })), this.retryRequest(o, t, n ?? c, m.headers);
      }
      const S = y ? "error; no more retries left" : "error; not retryable";
      ie(this).info(`${_} - ${S}`);
      const I = await m.text().catch((D) => zi(D).message), b = ZI(I), P = b ? void 0 : I;
      throw ie(this).debug(`[${c}] response error (${S})`, Ct({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: P,
        durationMs: Date.now() - h
      })), this.makeStatusError(m.status, b, P, m.headers);
    }
    return ie(this).info(_), ie(this).debug(`[${c}] response start`, Ct({
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
    return new vw(this, n, e);
  }
  async fetchWithAuth(e, t, n, o, r = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && r.bearerAuth) {
      const i = t.headers, a = i.get("Authorization");
      if (!a || a === `Bearer ${tC}`) {
        const u = await this._workloadIdentityAuth.getToken();
        i.set("Authorization", `Bearer ${u}`);
      }
    }
    return await this.fetchWithTimeout(e, t, n, o);
  }
  async fetchWithTimeout(e, t, n, o) {
    const { signal: r, method: i, ...a } = t || {}, u = this._makeAbort(o);
    r && r.addEventListener("abort", u, { once: !0 });
    const c = setTimeout(u, n), d = globalThis.ReadableStream && a.body instanceof globalThis.ReadableStream || typeof a.body == "object" && a.body !== null && Symbol.asyncIterator in a.body, h = {
      signal: o.signal,
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
  async retryRequest(e, t, n, o) {
    let r;
    const i = o?.get("retry-after-ms");
    if (i) {
      const u = parseFloat(i);
      Number.isNaN(u) || (r = u);
    }
    const a = o?.get("retry-after");
    if (a && !r) {
      const u = parseFloat(a);
      Number.isNaN(u) ? r = Date.parse(a) - Date.now() : r = u * 1e3;
    }
    if (r === void 0) {
      const u = e.maxRetries ?? this.maxRetries;
      r = this.calculateDefaultRetryTimeoutMillis(t, u);
    }
    return await go(r), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const r = t - e;
    return Math.min(0.5 * Math.pow(2, r), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: r, query: i, defaultBaseURL: a } = n, u = this.buildURL(r, i, a);
    "timeout" in n && QI("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const i = k([
      r,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...ow(),
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
    const n = k([t]), o = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, r = !o && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || o ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !r
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: gh(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...T(this, ar, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
pa = q, ar = /* @__PURE__ */ new WeakMap(), us = /* @__PURE__ */ new WeakSet(), Xp = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
q.OpenAI = pa;
q.DEFAULT_TIMEOUT = 6e5;
q.OpenAIError = U;
q.APIError = ue;
q.APIConnectionError = $r;
q.APIConnectionTimeoutError = Hs;
q.APIUserAbortError = xe;
q.NotFoundError = sh;
q.ConflictError = ah;
q.RateLimitError = uh;
q.BadRequestError = oh;
q.AuthenticationError = rh;
q.InternalServerError = ch;
q.PermissionDeniedError = ih;
q.UnprocessableEntityError = lh;
q.InvalidWebhookSignatureError = Un;
q.toFile = bw;
q.Completions = Sp;
q.Chat = Qs;
q.Embeddings = wp;
q.Files = bp;
q.Images = kp;
q.Audio = yo;
q.Moderations = $p;
q.Models = Dp;
q.FineTuning = dn;
q.Graders = da;
q.VectorStores = Kr;
q.Webhooks = Yp;
q.Beta = cn;
q.Batches = pp;
q.Uploads = ha;
q.Admin = ta;
q.Responses = Vr;
q.Realtime = Hr;
q.Conversations = ia;
q.Evals = aa;
q.Containers = ra;
q.Skills = Jr;
q.Videos = Wp;
function nC(e) {
  if (oC(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function oC(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const o = t;
    if (o.code === "UND_ERR_INVALID_ARG" && typeof o.message == "string" && o.message.includes("invalid onRequestStart method")) return !0;
    t = o.cause;
  }
  return !1;
}
function bc(e = "", t = 0) {
  let n = 0;
  for (let o = t - 1; o >= 0 && e[o] === "\\"; o -= 1) n += 1;
  return n % 2 === 1;
}
function rC(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function iC(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function sC(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function aC(e = "") {
  const t = String(e ?? "");
  let n = "", o = 0;
  for (; o < t.length; ) {
    const r = t.slice(o, o + 2), i = t.slice(o + 2, o + 6);
    if (r !== "\\u" || bc(t, o) || !rC(i)) {
      n += t[o] || "", o += 1;
      continue;
    }
    const a = o + 6, u = t.slice(a + 2, a + 6);
    if (iC(i) && t.slice(a, a + 2) === "\\u" && !bc(t, a) && sC(u)) {
      const c = Number.parseInt(i, 16), d = Number.parseInt(u, 16), h = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(h), o += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(i, 16)), o += 6;
  }
  return n;
}
function lC(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), aC(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function uC(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ma(e = "", t = "", n = 0) {
  const o = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${uC(t)}(?:\\\\?")?\\s*:`, "i"), r = String(e || "").slice(Math.max(0, n)).match(o);
  if (!r || r.index === void 0) return null;
  const i = r[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + r.index + i,
    end: Math.max(0, n) + r.index + r[0].length
  };
}
function cC(e = "", t = [], n = 0) {
  return t.map((o) => ma(e, o, n)).filter(Boolean).sort((o, r) => o.index - r.index)[0] || null;
}
function Oe(e = "", t = "", n = []) {
  const o = String(e || ""), r = ma(o, t);
  if (!r) return;
  let i = r.end;
  for (; /\s/.test(o[i] || ""); ) i += 1;
  o[i] === '"' && (i += 1);
  const a = cC(o, n.filter((d) => d !== t), i);
  let u = a ? a.index : o.length;
  if (a) {
    const d = o.lastIndexOf(",", a.index);
    d >= i && (u = d);
  }
  let c = o.slice(i, u).trim();
  return a || (c = c.replace(/\}\s*$/, "").trimEnd()), lC(c);
}
function je(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var Wn = {
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
}, dC = [
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
function Rc(e = "", t = [], n = []) {
  for (const o of t) {
    const r = Oe(e, o, n);
    if (r !== void 0) return r;
  }
}
function fC(e = "", t = "") {
  if (t === "Read") {
    const n = Wn.Read, o = {};
    return n.forEach((r, i) => {
      const a = Oe(e, r, n.slice(i + 1));
      a !== void 0 && (o[r] = je(a));
    }), o.filePath === void 0 && o.path !== void 0 && (o.filePath = o.path, delete o.path), o.filePath === void 0 && o.scope !== void 0 && (o.filePath = o.scope, delete o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "Write") {
    const n = {}, o = Rc(e, ["filePath", "path"], ["content"]), r = Oe(e, "content", []);
    return o !== void 0 && (n.filePath = je(o)), r !== void 0 && (n.content = je(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, o = Rc(e, ["filePath", "path"], ["edits"]), r = Oe(e, "edits", []);
    return o !== void 0 && (n.filePath = je(o)), r !== void 0 && (n.edits = je(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = Wn.Grep, o = {};
    return n.forEach((r) => {
      const i = Oe(e, r, n.filter((a) => a !== r));
      i !== void 0 && (o[r] = je(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "MemoryGrep") {
    const n = Wn.MemoryGrep, o = {};
    return n.forEach((r) => {
      const i = Oe(e, r, n.filter((a) => a !== r));
      i !== void 0 && (o[r] = je(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  if (t === "ChatHistory") {
    const n = Wn.ChatHistory, o = {};
    return n.forEach((r) => {
      const i = Oe(e, r, n.filter((a) => a !== r));
      i !== void 0 && (o[r] = je(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  return null;
}
function hC(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const a = JSON.parse(n);
    if (a && typeof a == "object" && !Array.isArray(a)) return a;
  } catch {
  }
  const o = fC(n, t);
  if (o) return o;
  const r = Wn[t] || dC, i = {};
  return r.forEach((a, u) => {
    const c = Oe(n, a, r.slice(u + 1));
    c !== void 0 && (i[a] = je(c));
  }), Object.keys(i).length ? i : null;
}
function Qp(e = "", t = "") {
  const n = hC(e, t);
  return n ? JSON.stringify(n) : "";
}
function Zp(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Fe(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function ye(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Y(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function jp(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function em(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : jp(e);
  return Qp(n, t) || JSON.stringify(Zp(n));
}
function pC(e = "") {
  const t = String(e || ""), n = ma(t, "arguments");
  if (!n) return "";
  let o = n.end;
  for (; /\s/.test(t[o] || ""); ) o += 1;
  const r = t[o] || "";
  return r === "{" ? t.slice(o).replace(/\}\s*$/, "").trimEnd() : r === '"' ? t.slice(o + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(o).replace(/\}\s*$/, "").trimEnd();
}
function mC(e = "", t = 0) {
  const n = String(e || "").trim(), o = Oe(n, "name", ["id", "arguments"]) || Oe(n, "toolName", ["id", "arguments"]) || "", r = Oe(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, i = pC(n);
  return !o || !i ? null : {
    id: r,
    name: o,
    arguments: em(i, o)
  };
}
function gC(e, t = 0, n = "openai-tool") {
  if (!Y(e)) return null;
  const o = Y(e.function) ? e.function : null, r = String(o?.name || "").trim();
  if (!r) return null;
  const i = ye(e) || {};
  return delete i.index, i.id = String(i.id || `${n}-${t + 1}`), i.type = "function", i.function = {
    ...ye(o) || {},
    name: r,
    arguments: jp(o.arguments)
  }, i;
}
function io(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, o) => gC(n, o, t)).filter(Boolean);
}
function so(e, t) {
  return Array.isArray(e) ? e.some((n) => so(n, t)) : Y(e) ? Object.entries(e).some(([n, o]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(o) : (Array.isArray(o) || Y(o)) && so(o, t)) : !1;
}
function _C(e) {
  return so(e, (t) => typeof t == "string" && t.length > 0);
}
function cs(e) {
  return so(e, () => !0);
}
function yC(e) {
  return so(e, (t) => typeof t != "string" || t.length === 0);
}
function vC(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => _C(t));
}
var Pc = /* @__PURE__ */ new WeakSet();
function ga(e) {
  if (!Y(e)) return null;
  const t = ye(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = Mt(Pt(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = io(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function _a(e = [], t = "openai-tool") {
  return io(e, t).map((n, o) => ({
    id: n.id || `${t}-${Date.now()}-${o + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function ya(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function Pt(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, o) => (Fe(t, "思考块", o), "")).trim(),
    thoughts: t
  };
}
function Mt(e = "") {
  const t = String(e || ""), n = t.search(/<tool_call\b/i);
  return n < 0 ? t.trim() : t.slice(0, n).trim();
}
function ds(e = "") {
  const t = String(e || "");
  return /<tool_call\b/i.test(t) ? [{
    id: "tagged-json-draft",
    name: t.match(/["']?name["']?\s*:\s*["']([^"']+)/i)?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }] : [];
}
function bt(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      Fe(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((o) => bt(e, o, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && Fe(e, n, t.text), typeof t.content == "string" && Fe(e, n, t.content), typeof t.reasoning_content == "string" && Fe(e, n, t.reasoning_content), typeof t.thinking == "string" && Fe(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((o) => {
      if (typeof o == "string") {
        Fe(e, "推理摘要", o);
        return;
      }
      o && typeof o == "object" && Fe(e, "推理摘要", o.text || o.content || "");
    }));
  }
}
function ht(e = {}, t = {}) {
  const n = [];
  return bt(n, e.reasoning_content, "推理文本"), bt(n, e.reasoning, "推理文本"), bt(n, e.reasoning_text, "推理文本"), bt(n, e.thinking, "思考块"), bt(n, t.reasoning_content, "推理文本"), bt(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        Fe(n, "推理文本", o.text);
        return;
      }
      if (o.type === "summary_text") {
        Fe(n, "推理摘要", o.text);
        return;
      }
      (o.type === "thinking" || o.type === "reasoning" || o.type === "reasoning_content") && Fe(n, "思考块", o.text || o.content || o.reasoning || "");
    }
  }), n;
}
function jn(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((o) => {
    [...e.matchAll(o)].forEach((r, i) => {
      try {
        const a = JSON.parse(r[1]);
        n.push({
          id: a.id || `tool-call-${i + 1}`,
          name: String(a.name || ""),
          arguments: em(a.arguments, a.name)
        });
      } catch {
        const a = mC(r[1], i);
        a && n.push(a);
      }
    });
  }), n.filter((o) => o.name);
}
function va(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : ga(t);
}
function AC(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function TC(e = {}) {
  const t = io(e?.tool_calls);
  if (t.length) return t;
  const n = io(va(e)?.tool_calls);
  return n.length ? n : [];
}
function SC(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function EC(e = "") {
  return /claude/i.test(String(e || ""));
}
function IC(e = "") {
  return Es(e) === "openai";
}
function tm(e = {}, t = {}) {
  return t.mode !== "on" && t.mode !== "off" ? e : t.profileId === "kimi-k3" ? (e.reasoning_effort = t.mode === "off" ? "off" : t.effort, e) : t.profileId === "deepseek-thinking" ? (e.thinking = { type: t.mode === "off" ? "disabled" : "enabled" }, t.mode === "on" && (e.reasoning_effort = t.effort), e) : (String(t.profileId || "").startsWith("openai-") && (e.reasoning_effort = t.mode === "off" ? "none" : t.effort), e);
}
function nm(e = [], t = "") {
  if (!EC(t)) return e;
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
function Mc(e, t = "") {
  return !Y(e) || !SC(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var fs = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function wC(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((o) => ye(o) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((o, r) => {
    const i = ye(o) || {}, a = Number.isInteger(Number(o?.index)) ? Number(o.index) : r, u = n[a];
    n[a] = Y(u) ? vo(u, i, "tool_call") : i;
  }), n.filter((o) => o !== void 0);
}
function vo(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return ye(t);
  if (t === null && fs.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return wC(e, t);
  if (typeof e == "string" && typeof t == "string")
    return fs.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : ye(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(ye(t) || []);
  if (Y(e) && Y(t)) {
    const o = { ...e };
    return Object.entries(t).forEach(([r, i]) => {
      o[r] = vo(o[r], i, r);
    }), o;
  }
  return ye(t);
}
function Sr(e = {}, t = {}) {
  const n = Y(e) ? ye(e) || {} : {}, o = Y(t) ? ye(t) || {} : {};
  return delete o.message, delete o.finish_reason, delete o.index, delete o.logprobs, delete o.delta, Object.entries(o).forEach(([r, i]) => {
    n[r] = vo(n[r], i, r);
  }), n.role || (n.role = "assistant"), ga(n) || { role: "assistant" };
}
function eo(e, t = {}) {
  const n = ga(Sr(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function CC(e = {}, t = {}) {
  return Y(e) ? Y(t) ? vo(ye(e) || {}, t, "") : ye(e) : ye(t);
}
function hs(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], o = AC(n), r = [];
  let i = !1;
  n.forEach((u, c) => {
    if (i) {
      if (u?.role === "tool") return;
      i = !1;
    }
    const d = u?.role === "assistant", h = d ? u?.providerPayload?.openaiCompatibleMessage : null, f = rm(Array.isArray(h?.tool_calls) && h.tool_calls.some((S) => cs(S)) ? h.tool_calls : d && Array.isArray(u?.tool_calls) && u.tool_calls.some((S) => cs(S)) ? u.tool_calls : null);
    if (f) {
      const S = Y(h) ? h : u;
      (!Y(S) || !Pc.has(S)) && (Y(S) && Pc.add(S), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: f.index,
        toolName: f.toolName,
        reason: f.reason
      })), i = !0;
      return;
    }
    const p = d ? io(u?.tool_calls) : [], m = d ? va(u) : null, g = Array.isArray(m?.tool_calls) ? m.tool_calls : [], _ = g.length > 0 && vC(m);
    if (g.length && c > o) {
      r.push(Mc({
        ...m,
        ...p.length && !_ ? { tool_calls: p } : {}
      }, t));
      return;
    }
    const y = {
      role: u.role,
      content: u.content
    };
    u.role === "tool" && u.tool_call_id && (y.tool_call_id = u.tool_call_id), _ ? y.tool_calls = g : p.length && (y.tool_calls = p), r.push(Mc(y, t));
  });
  const a = String(e.systemPrompt || "").trim();
  return a && r[0]?.role !== "system" && r.unshift({
    role: "system",
    content: a
  }), nm(r, t);
}
function xc(e) {
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
function ps(e, t = "") {
  const n = /* @__PURE__ */ new Map(), o = [];
  return (Array.isArray(e.messages) ? e.messages : []).forEach((r) => {
    if (r.role === "assistant") {
      const i = TC(r);
      if (i.length) {
        const a = va(r), u = typeof a?.content == "string" ? a.content : String(r.content || ""), c = i.map((d, h) => {
          const f = d.function?.name || "", p = d.id || `tool-call-${h + 1}`;
          return f && n.set(p, f), `<tool_call>${JSON.stringify({
            id: p,
            name: f,
            arguments: Zp(d.function?.arguments || "{}")
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
      const a = String(r.content || "");
      o.push({
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
    o.push({
      role: r.role,
      content: r.content
    });
  }), !o.length || o[0].role !== "system" ? o.unshift({
    role: "system",
    content: xc(e)
  }) : o[0] = {
    ...o[0],
    content: xc({
      ...e,
      systemPrompt: o[0].content || e.systemPrompt
    })
  }, nm(o, t);
}
function Nc(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: J(e.reasoning) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Mn(e, t = []) {
  return J(e.reasoning) ? t : [];
}
function om(e, t, n) {
  !e || !t || n === void 0 || (e[t] = vo(e[t], n, t));
}
function Er(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (Y(n)) {
      const o = Y(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([r, i]) => {
        Er(o, r, i);
      }), e[t] = o;
      return;
    }
    if (typeof n == "string" && fs.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || om(e, t, n);
  }
}
function bC(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const o = Number(n?.index ?? 0), r = { ...e.tool_calls[o] || {} };
    Object.entries(n || {}).forEach(([i, a]) => {
      if (i !== "index" && !(i === "function" && a == null)) {
        if (i === "function" && Y(a)) {
          r.function = Y(r.function) ? { ...r.function } : {}, Object.entries(a).forEach(([u, c]) => {
            Er(r.function, u, c);
          });
          return;
        }
        Er(r, i, a);
      }
    }), e.tool_calls[o] = r;
  }));
}
function ms(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([o, r]) => {
    o === "delta" || o === "finish_reason" || o === "index" || o === "logprobs" || om(e, o, r);
  });
  const n = Y(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([o, r]) => {
    if (o === "tool_calls") {
      bC(e, r);
      return;
    }
    Er(e, o, r);
  });
}
function Zt(e = {}) {
  return ya(e?.content);
}
function jt(e = {}) {
  return _a(e?.tool_calls || []);
}
function RC(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return Y(JSON.parse(e));
  } catch {
    return !1;
  }
}
function rm(e) {
  if (!Array.isArray(e) || !e.some((t) => cs(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], o = Y(n?.function) ? n.function : null, r = String(o?.name || "").trim();
    let i = "";
    if (!Y(n) || !o ? i = "invalid_function_shape" : r ? RC(o.arguments) ? yC(n) && (i = "invalid_thought_signature") : i = "invalid_function_arguments" : i = "missing_function_name", i) return {
      index: t,
      toolName: r,
      reason: i
    };
  }
  return null;
}
function en(e = {}) {
  const t = rm(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function PC(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("openai_compatible_stream_missing_body");
  const o = new TextDecoder();
  let r = "";
  const i = /\r?\n\r?\n/;
  for (; ; ) {
    const { done: u, value: c } = await n.read();
    if (u) break;
    for (r += o.decode(c, { stream: !0 }); ; ) {
      const d = r.match(i);
      if (!d || typeof d.index != "number") break;
      const h = d.index, f = r.slice(0, h);
      r = r.slice(h + d[0].length);
      const p = f.split(/\r?\n/).filter((m) => m.startsWith("data:")).map((m) => m.slice(5).trimStart()).join(`
`).trim();
      !p || p === "[DONE]" || t(JSON.parse(p));
    }
  }
  const a = r.trim();
  if (a && a !== "[DONE]") {
    const u = a.split(/\r?\n/).filter((c) => c.startsWith("data:")).map((c) => c.slice(5).trimStart()).join(`
`).trim();
    u && u !== "[DONE]" && t(JSON.parse(u));
  }
}
var MC = class {
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
    const t = he("openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, o = !n && Array.isArray(e.tools) && e.tools.length ? e.tools : null, r = {
      model: this.config.model,
      messages: n ? ps(e, this.config.model) : hs(e, this.config.model),
      ...o ? {
        tools: o,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? IC(this.config.model) ? { max_completion_tokens: e.maxTokens } : { max_tokens: e.maxTokens } : {}
    };
    return !lo({
      ...this.config,
      provider: "openai-compatible"
    }, t) && typeof e.temperature == "number" && (r.temperature = e.temperature), tm(r, t);
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = {
      ...t.body || this.buildRequestBody(e),
      ...n ? { stream: !0 } : {}
    }, r = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = he("openai-compatible", this.config, e.reasoning), a = {
      ...Object.hasOwn(o, "reasoning_effort") ? { reasoning_effort: o.reasoning_effort } : {},
      ...Object.hasOwn(o, "thinking") ? { thinking: o.thinking } : {}
    };
    return { ...oo({
      provider: "openai-compatible",
      model: this.config.model,
      transport: "openai-compatible",
      url: `${r}/chat/completions`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: o,
      sdk: n ? "client.chat.completions.create(..., { stream: true })" : "client.chat.completions.create",
      effectiveConfig: _t(e, {
        profileId: i.profileId,
        effectiveMode: i.mode,
        effort: o.reasoning_effort,
        controlFields: a
      })
    }) };
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
      const m = await o.text().catch(() => ""), g = new Error(m || `openai_compatible_stream_http_${o.status}`);
      throw g.status = o.status, g;
    }
    const r = { role: "assistant" };
    let i = "stop", a = this.config.model;
    await PC(o, (m) => {
      a = m?.model || a;
      const g = m?.choices?.[0];
      ms(r, g), g?.finish_reason && (i = g.finish_reason);
      const _ = Pt(Zt(r)), y = jt(r), S = y.length ? y : ds(_.cleaned);
      Nc(e, {
        text: y.length ? _.cleaned : Mt(_.cleaned),
        thoughts: Mn(e, ht(r, g).concat(_.thoughts)),
        ...S.length ? { toolCalls: S } : {},
        ...!y.length && S.length ? { toolCallDraft: !0 } : {}
      });
    }), en(r);
    const u = eo(r), c = jt(r), d = Pt(Zt(r)), h = ht(r, {});
    d.thoughts.forEach((m) => h.push(m));
    const f = c.length ? [] : jn(d.cleaned), p = [...c, ...f];
    return {
      text: c.length ? d.cleaned : Mt(d.cleaned),
      toolCalls: p,
      thoughts: Mn(e, h),
      finishReason: i,
      model: a,
      provider: "openai-compatible",
      providerPayload: u
    };
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = typeof e.onStreamProgress == "function", o = this.buildRequestBody(e), r = this.inspectRequest(e, { body: o }), i = async (y) => {
      try {
        return await y(o);
      } catch (S) {
        throw S && typeof S == "object" && (S.requestInspection = r), S;
      }
    };
    if (n) {
      if (!t) return {
        ...await i((z) => this.streamNativeChatCompletions(e, z)),
        requestInspection: r
      };
      const y = await i((z) => this.client.chat.completions.create({
        ...z,
        stream: !0
      }, { signal: e.signal })), S = { role: "assistant" };
      let I = "stop", b = this.config.model, P;
      for await (const z of y) {
        b = z.model || b;
        const W = z.choices?.[0];
        ms(S, W), W?.finish_reason && (I = W.finish_reason);
        const K = Pt(Zt(S)), pe = jt(S), ze = pe.length ? pe : ds(K.cleaned);
        Nc(e, {
          text: pe.length ? K.cleaned : Mt(K.cleaned),
          thoughts: Mn(e, ht(S, W).concat(K.thoughts)),
          ...ze.length ? { toolCalls: ze } : {},
          ...!pe.length && ze.length ? { toolCallDraft: !0 } : {}
        });
      }
      const D = (typeof y.finalChatCompletion == "function" ? await y.finalChatCompletion() : null)?.choices?.[0] || null, E = D?.message || S;
      en(E);
      const L = CC(S, Sr(E, D || {}));
      en(L), P = eo(L);
      const w = jt(L), M = Pt(Zt(L)), F = ht(L, D || {});
      M.thoughts.forEach((z) => F.push(z));
      const H = w.length ? [] : jn(M.cleaned), le = [...w, ...H];
      return {
        text: w.length ? M.cleaned : Mt(M.cleaned),
        toolCalls: le,
        thoughts: Mn(e, F),
        finishReason: I,
        model: b,
        provider: "openai-compatible",
        providerPayload: P,
        requestInspection: r
      };
    }
    const a = await i((y) => this.client.chat.completions.create(y, { signal: e.signal })), u = a.choices?.[0] || {}, c = u.message || {};
    en(c);
    const d = ht(c, u), h = _a(c.tool_calls || []), f = Pt(ya(c.content));
    f.thoughts.forEach((y) => d.push(y));
    const p = h.length ? [] : jn(f.cleaned), m = [...h, ...p], g = h.length ? f.cleaned : Mt(f.cleaned), _ = Sr(c, u);
    return {
      text: g,
      toolCalls: m,
      thoughts: Mn(e, d),
      finishReason: u.finish_reason || "stop",
      model: a.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: eo(_),
      requestInspection: r
    };
  }
};
function Aa(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function im(e, t) {
  return {
    type: "message",
    role: e,
    content: xC(t)
  };
}
function Ir(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function xC(e) {
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
function wr(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function kc(e, t = [], n = {}) {
  (t || []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        wr(e, n.reasoning || "推理文本", o.text);
        return;
      }
      o.type === "summary_text" && wr(e, n.summary || "推理摘要", o.text);
    }
  });
}
function NC(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (kc(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), kc(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function kC(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function DC(e) {
  const t = e?.choices?.[0]?.message?.content;
  if (typeof t == "string" && t.trim()) return t.trim();
  if (typeof e?.output_text == "string" && e.output_text.trim()) return e.output_text.trim();
  const n = [];
  return (Array.isArray(e?.output) ? e.output : []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "message" && Array.isArray(o.content)) {
        o.content.forEach((r) => {
          if (!(!r || typeof r != "object")) {
            if (r.type === "output_text" && typeof r.text == "string" && r.text.trim()) {
              n.push(r.text.trim());
              return;
            }
            r.type === "refusal" && typeof r.refusal == "string" && r.refusal.trim() && n.push(r.refusal.trim());
          }
        });
        return;
      }
      typeof o.text == "string" && o.text.trim() && n.push(o.text.trim());
    }
  }), n.join(`
`).trim();
}
function $C(e) {
  const t = e?.choices?.[0], n = t?.message?.content, o = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const r = n.toLowerCase();
  return !r.includes("proxy error") || !r.includes("/responses") && !o.toLowerCase().includes("proxy error") ? null : n.trim();
}
function LC(e) {
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
        t.push(...Aa(n.providerPayload.openAIResponseOutput) || []);
        continue;
      }
      if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
        n.content?.trim() && t.push(Ir(n.content)), n.tool_calls.forEach((o, r) => {
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
        t.push(Ir(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? im(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function UC(e) {
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
      t.push(...Aa(n.providerPayload.openAIResponseOutput) || []);
      continue;
    }
    if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
      n.content?.trim() && t.push(Ir(n.content)), n.tool_calls.forEach((o, r) => {
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
      t.push(Ir(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? im(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function FC(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function OC(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function GC(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function mi(e, t) {
  const [n = "0", o = "0"] = String(e || "").split(":"), [r = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(r) || Number(o) - Number(i);
}
var BC = class {
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
    const n = he("openai-responses", this.config, e.reasoning), o = {
      model: this.config.model,
      instructions: t ? void 0 : kC(e) || void 0,
      input: t ? UC(e) : LC(e),
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
    return !lo({
      ...this.config,
      provider: "openai-responses"
    }, n) && typeof e.temperature == "number" && (o.temperature = e.temperature), n.mode === "on" || n.mode === "off" ? o.reasoning = {
      effort: n.mode === "off" ? "none" : n.effort,
      ...n.mode === "on" && J(n) ? { summary: "auto" } : {}
    } : J(n) && (o.reasoning = { summary: "auto" }), n.mode !== "off" && n.profileId.startsWith("openai-") && (o.include = ["reasoning.encrypted_content"]), o;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = t.legacySystemInInput === !0, r = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = t.body || this.buildRequestBody(e, o), a = he("openai-responses", this.config, e.reasoning);
    return oo({
      provider: "openai-responses",
      model: this.config.model,
      transport: "openai-responses",
      url: `${r}/responses`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: i,
      sdk: n ? "client.responses.stream" : "client.responses.create",
      effectiveConfig: _t(e, {
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
      const d = $C(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const h = Array.isArray(c.output) ? c.output : [];
      return {
        output: h,
        thoughts: J(e.reasoning) ? NC(h) : [],
        toolCalls: h.filter((f) => f.type === "function_call" && f.name).map((f, p) => ({
          id: f.call_id || `response-tool-${p + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: DC(c)
      };
    }, o = async (c = !1) => {
      const d = this.buildRequestBody(e, c);
      return t = this.inspectRequest(e, {
        body: d,
        legacySystemInInput: c
      }), await this.client.responses.create(d, { signal: e.signal });
    }, r = async (c = !1) => {
      const d = this.buildRequestBody(e, c);
      t = this.inspectRequest(e, {
        body: d,
        legacySystemInInput: c
      });
      const h = this.client.responses.stream(d, { signal: e.signal }), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), g = () => {
        const _ = [];
        J(e.reasoning) && (Array.from(p.entries()).sort(([y], [S]) => mi(y, S)).forEach(([, y]) => wr(_, "推理文本", y)), Array.from(m.entries()).sort(([y], [S]) => mi(y, S)).forEach(([, y]) => wr(_, "推理摘要", y))), GC(e, {
          text: Array.from(f.entries()).sort(([y], [S]) => mi(y, S)).map(([, y]) => y).join(`
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
    }, i = !FC(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await r(!1) : await o(!1), u = n(a), i && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await r(!0) : await o(!0), u = n(a));
    } catch (c) {
      if (!i || !OC(c)) throw c;
      a = typeof e.onStreamProgress == "function" ? await r(!0) : await o(!0), u = n(a);
    }
    return {
      text: u.text,
      toolCalls: u.toolCalls,
      thoughts: u.thoughts,
      finishReason: a.incomplete_details?.reason || a.status || "stop",
      model: a.model || this.config.model,
      provider: "openai-responses",
      providerPayload: u.output.length ? { openAIResponseOutput: Aa(u.output) || [] } : void 0,
      requestInspection: t
    };
  }
};
async function qC(e, t) {
  const n = e.body?.getReader?.();
  if (!n) throw new Error("host_chat_completions_stream_missing_body");
  const o = new TextDecoder();
  let r = "";
  const i = /\r?\n\r?\n/, a = (c) => {
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
      r = r.slice(h.index + h[0].length), a(f);
    }
  }
  const u = r.trim();
  u && a(u);
}
var Ta = "openai", sm = "claude", am = "makersuite", HC = "/api/backends/chat-completions/generate", VC = Object.freeze({
  [sm]: "https://api.anthropic.com/v1",
  [am]: "https://generativelanguage.googleapis.com"
}), lm = null;
function JC(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function KC(e = "") {
  return Es(e) === "openai";
}
function WC(e, t) {
  const n = JC(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function z0(e) {
  lm = typeof e == "function" ? e : null;
}
async function zC() {
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(lm?.() || {}),
    Accept: "application/json"
  };
}
function YC(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, o]) => {
    t[n] = /authorization|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : o;
  }), t;
}
async function Ao(e = {}, t = !1) {
  const n = await zC(), o = {
    url: HC,
    method: "POST",
    headers: YC(n),
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
function XC(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function QC(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function ZC() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function Dc(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function $c(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => Dc(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => Dc(n));
}
function jC(e = "") {
  const t = String(e || ""), n = $c((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), o = $c(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), r = n || o;
  return r.length > 240 ? `${r.slice(0, 237)}...` : r;
}
function e0(e = null) {
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
function t0(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function Cr(e = "", t = "", n = null) {
  if (QC(e)) return ZC();
  const o = e0(n);
  if (XC(e) || /\btext\/html\b/i.test(o.contentType)) {
    const r = t0(o), i = jC(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      r ? `（${r}）` : "",
      i ? `：${i}` : ""
    ].join("");
  }
  return String(e || t || "").trim();
}
function n0(e = {}, t = Ta) {
  const n = WC(e.baseUrl, t), o = String(e.apiKey || "").trim(), r = VC[t] || "", i = n || (o ? r : ""), a = { chat_completion_source: t || "openai" };
  return i && (a.reverse_proxy = i), o && (a.proxy_password = o), a;
}
function o0(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function Sa(e = {}, t = {}, n = [], o = !1, r = Ta) {
  const i = t.maxTokens, a = r === "openai" && KC(e.model);
  return o0({
    ...n0(e, r),
    stream: !!o,
    messages: n,
    model: e.model,
    max_tokens: a ? void 0 : i,
    max_completion_tokens: a ? i : void 0,
    temperature: t.temperature,
    tools: Array.isArray(t.tools) && t.tools.length ? t.tools : void 0,
    tool_choice: Array.isArray(t.tools) && t.tools.length ? t.toolChoice || "auto" : void 0,
    use_sysprompt: r === "openai" ? void 0 : !0
  });
}
function r0(e = {}, t = {}, n = [], o = !1) {
  return Sa(e, t, n, o, Ta);
}
function i0(e = {}, t = {}, n = [], o = !1) {
  return Sa(e, t, n, o, sm);
}
function s0(e = {}, t = {}, n = [], o = !1) {
  return Sa(e, t, n, o, am);
}
async function Ea(e = {}, t = {}) {
  const n = await Ao(e, !1);
  typeof t.onRequest == "function" && t.onRequest(n);
  const o = await fetch(n.url, {
    method: n.method,
    headers: n.rawHeaders || n.headers,
    body: JSON.stringify(n.body),
    signal: t.signal
  }), r = await o.text();
  let i = null;
  try {
    i = r ? JSON.parse(r) : {};
  } catch (a) {
    const u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${Cr(r, String(a?.message || a), o)}`);
    throw u.status = o.status, u.body = r, u;
  }
  if (!o.ok || i?.error) {
    const a = Cr(i?.error?.message || i?.message || r, `HTTP ${o.status}`, o), u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${a}`);
    throw u.status = o.status, u.error = i?.error, u;
  }
  return i;
}
async function Ia(e = {}, t, n = {}) {
  const o = await Ao(e, !0);
  typeof n.onRequest == "function" && n.onRequest(o);
  const r = await fetch(o.url, {
    method: o.method,
    headers: o.rawHeaders || o.headers,
    body: JSON.stringify(o.body),
    signal: n.signal
  });
  if (!r.ok) {
    const i = await r.text().catch(() => ""), a = new Error(Cr(i, `酒馆后端流式生成失败：HTTP ${r.status}`, r));
    throw a.status = r.status, a.body = i, a;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await qC(r, (i) => {
    if (i?.error) {
      const a = Cr(i.error?.message || i.message || JSON.stringify(i.error), "酒馆后端流式生成失败");
      throw new Error(a);
    }
    t(i);
  });
}
function $t(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function a0(e) {
  const t = String(e || "").trim();
  if (!t || t === "auto") return "auto";
  if (t === "required") return "any";
  if (t === "none") return "none";
  throw new Error(`酒馆托管 Claude 不支持 tool_choice：${t}。仅支持 auto/required/none。`);
}
function l0(e = {}, t = {}) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const n = a0(t.toolChoice), o = he("sillytavern-claude", e, t.reasoning), r = o.profileId === "sillytavern-claude-manual" || o.profileId === "sillytavern-claude-adaptive-conditional";
  return {
    toolChoice: n,
    reasoningDisabledForForcedTool: n === "any" && o.mode === "on" && r
  };
}
var u0 = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function c0(e = {}, t = {}, n = {}) {
  const o = he("sillytavern-claude", e, t.reasoning), r = n.reasoningDisabledForForcedTool ? "off" : o.mode;
  return _t(t, {
    profileId: o.profileId,
    effectiveMode: r,
    effort: r === "on" ? o.effort : "",
    controlFields: n.controlFields || {}
  });
}
function d0(e = {}, t = {}) {
  return { toolChoice: String(t.toolChoice || "") };
}
function um(e = "") {
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
function f0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const o = um(t.function.arguments || "{}");
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
function h0(e = []) {
  const t = Array.isArray(e) ? $t(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function p0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = $t(r) || {}, a = h0(i?.providerPayload?.anthropicContent), u = f0(i.tool_calls);
    delete i.providerPayload, i.role === "assistant" && a && u.length ? (delete i.tool_calls, i.content = a.filter((c) => c?.type !== "tool_use").concat(u)) : i.role === "assistant" && a && (delete i.tool_calls, i.content = a), n.push(i);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function m0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const o = um(t.inputJson);
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
      const n = $t(t.input);
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
    } : $t(t) || null;
  }).filter(Boolean);
}
function g0(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: $t(t.input) || {}
  } : $t(t) || null).filter(Boolean);
}
function _0(e = []) {
  const t = Array.isArray(e) ? e : [], n = t.filter((i) => i?.type === "text").map((i) => i.text || "").join(`
`), o = t.filter((i) => i?.type === "thinking" || i?.type === "redacted_thinking").map((i) => ({
    label: i.type === "thinking" ? "思考块" : "已脱敏思考块",
    text: i.type === "thinking" ? i.thinking || "" : i.data || ""
  })).filter((i) => i.text), r = t.filter((i) => i?.type === "tool_use" && i.name).map((i, a) => ({
    id: i.id || `st-claude-tool-${a + 1}`,
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
function cm(e = [], t = {}) {
  const n = m0(e), o = n.filter((r) => r.type === "tool_use" && r.name).map((r, i) => ({
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
    finishReason: t.finishReason || "stop",
    model: t.model || "",
    provider: "sillytavern-claude",
    providerPayload: n.length ? { anthropicContent: g0(n) } : void 0
  };
}
function y0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function v0(e, t = {}) {
  const n = [];
  let o = "stop", r = t.model || "";
  const i = (u, c = {}) => {
    const d = Number.isInteger(Number(u)) ? Number(u) : n.length;
    return n[d] ? n[d] = {
      ...n[d],
      ...c
    } : n[d] = { ...c }, n[d];
  }, a = () => {
    const u = _0(n);
    y0(e, {
      text: u.text,
      thoughts: J(e.reasoning) ? u.thoughts : [],
      ...Array.isArray(u.toolCalls) ? { toolCalls: u.toolCalls } : {},
      ...u.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(u = {}) {
      if (u?.message?.model && (r = u.message.model), u.type === "content_block_start") {
        i(u.index, $t(u.content_block) || {}), a();
        return;
      }
      if (u.type === "content_block_delta") {
        const c = i(u.index), d = u.delta || {};
        d.type === "text_delta" ? (c.type = c.type || "text", c.text = `${c.text || ""}${d.text || ""}`) : d.type === "input_json_delta" ? (c.type = c.type || "tool_use", c.inputJson = `${c.inputJson || ""}${d.partial_json || ""}`) : d.type === "thinking_delta" ? (c.type = c.type || "thinking", c.thinking = `${c.thinking || ""}${d.thinking || ""}`) : d.type === "signature_delta" && (c.signature = `${c.signature || ""}${d.signature || ""}`), a();
        return;
      }
      u.type === "message_delta" && (o = u.delta?.stop_reason || o);
    },
    result() {
      return cm(n, {
        finishReason: o,
        model: r,
        includeReasoningOutput: J(e.reasoning)
      });
    }
  };
}
var A0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return p0(e);
  }
  resolveToolProtocol(e) {
    return l0(this.config, e);
  }
  buildPayload(e, t = this.resolveToolProtocol(e)) {
    const n = he("sillytavern-claude", this.config, e.reasoning), o = typeof e.onStreamProgress == "function", r = this.buildMessages(e), i = t.reasoningDisabledForForcedTool ? {
      ...n,
      mode: "off"
    } : n, a = {
      ...e,
      toolChoice: t.toolChoice,
      reasoning: i,
      temperature: lo({
        ...this.config,
        provider: "sillytavern-claude"
      }, i) ? void 0 : e.temperature
    }, u = i0(this.config, a, r, o);
    return i.mode === "on" ? (u.reasoning_effort = i.effort, u.include_reasoning = J(i)) : i.mode === "off" ? (u.reasoning_effort = "auto", u.include_reasoning = !1) : (u.reasoning_effort = "auto", u.include_reasoning = J(i)), u;
  }
  async inspectRequest(e, t = {}) {
    const n = this.resolveToolProtocol(e), o = await Ao(t.payload || this.buildPayload(e, n), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(o, n, e);
  }
  buildRequestInspection(e, t = {}, n = {}) {
    const o = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Dt(e),
      effectiveConfig: {
        ...d0(n, t),
        ...c0(this.config, n, {
          ...t,
          controlFields: o
        })
      },
      ...t.reasoningDisabledForForcedTool ? { notices: [u0] } : {}
    };
  }
  async chat(e) {
    const t = typeof e.onStreamProgress == "function", n = this.resolveToolProtocol(e), o = this.buildPayload(e, n);
    let r = null;
    const i = (a) => {
      r = this.buildRequestInspection(a, n, e);
    };
    try {
      if (t) {
        const u = v0(e, this.config);
        return await Ia(o, (c) => {
          u.accept(c);
        }, {
          signal: e.signal,
          onRequest: i
        }), {
          ...u.result(),
          requestInspection: r
        };
      }
      const a = await Ea(o, {
        signal: e.signal,
        onRequest: i
      });
      return {
        ...cm(Array.isArray(a?.content) ? a.content : [{
          type: "text",
          text: a?.choices?.[0]?.message?.content || ""
        }], {
          finishReason: a?.stop_reason || a?.choices?.[0]?.finish_reason || "stop",
          model: a?.model || this.config.model,
          includeReasoningOutput: J(e.reasoning)
        }),
        requestInspection: r
      };
    } catch (a) {
      throw r && a && typeof a == "object" && (a.requestInspection = r), a;
    }
  }
};
function wa(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function rn(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = wa(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function T0(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((r) => rn(r)).filter((r) => Array.isArray(r.parts) && r.parts.length);
  const n = e?.providerPayload?.googleContent, o = rn(n);
  return o.parts.length ? [o] : [];
}
function S0(e = {}) {
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
function E0(e = {}, t = 0) {
  const n = rn(e);
  if (!n.parts.length) return null;
  const o = {
    role: n.role === "user" ? "user" : "assistant",
    content: []
  }, r = n.parts.find((a) => !a?.thought && typeof a?.text == "string" && typeof a?.thoughtSignature == "string" && a.thoughtSignature)?.thoughtSignature || "", i = [];
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
    const u = S0(a.inlineData);
    u && o.content.push(u);
  }), i.length && o.content.push({
    type: "tool_calls",
    tool_calls: i
  }), r && o.content.some((a) => a?.type === "text") && (o.signature = r), o.content.length ? o : null;
}
function I0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = T0(r);
    if (r.role === "assistant" && i.length) {
      i.forEach((u, c) => {
        const d = E0(u, c);
        d && n.push(d);
      });
      return;
    }
    const a = wa(r) || {};
    delete a.providerPayload, n.push(a);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function dm(e = {}) {
  return rn(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function fm(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function hm(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function pm(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function w0(e, t) {
  const n = String(t || ""), o = String(e || "");
  return n ? !o || n.startsWith(o) ? n : o.endsWith(n) ? o : `${o}${n}` : o;
}
function C0(e = [], t = []) {
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
function mm(e) {
  const t = rn(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function b0(e = {}, t = {}) {
  const n = dm(e), o = e?.choices?.[0]?.message?.content || "";
  return {
    text: fm(n) || o,
    toolCalls: pm(n),
    thoughts: t.includeReasoningOutput === !1 ? [] : hm(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: mm(n)
  };
}
function R0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function P0(e, t = {}) {
  let n = "", o = [], r = [], i = "STOP", a = t.model || "";
  const u = [];
  return {
    accept(c = {}) {
      a = c.model || c.modelVersion || a, i = c?.candidates?.[0]?.finishReason || i;
      const d = dm(c);
      d.parts.length && u.push(...wa(d.parts) || []), n = w0(n, fm(d)), o = C0(o, pm(d));
      const h = J(e.reasoning) ? hm(d) : [];
      h.length && (r = h), R0(e, {
        text: n,
        thoughts: r,
        ...o.length ? {
          toolCalls: o,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const c = rn({
        role: "model",
        parts: u.length ? u : n ? [{ text: n }] : []
      });
      return {
        text: n,
        toolCalls: o,
        thoughts: r,
        finishReason: i,
        model: a,
        provider: "sillytavern-google",
        providerPayload: mm(c)
      };
    }
  };
}
var M0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return I0(e);
  }
  buildPayload(e) {
    const t = he("sillytavern-google", this.config, e.reasoning), n = typeof e.onStreamProgress == "function", o = this.buildMessages(e), r = s0(this.config, e, o, n);
    return t.mode === "on" ? (r.reasoning_effort = t.effort, r.include_reasoning = J(t)) : t.mode === "off" ? (r.reasoning_effort = "min", r.include_reasoning = !1) : (r.reasoning_effort = "auto", r.include_reasoning = J(t)), r;
  }
  async inspectRequest(e, t = {}) {
    const n = await Ao(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = he("sillytavern-google", this.config, t.reasoning), o = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Dt(e),
      effectiveConfig: _t(t, {
        profileId: n.profileId,
        effectiveMode: n.mode,
        effort: e?.body?.reasoning_effort,
        controlFields: o
      })
    };
  }
  async chat(e) {
    const t = typeof e.onStreamProgress == "function", n = this.buildPayload(e);
    let o = null;
    const r = (i) => {
      o = this.buildRequestInspection(i, e);
    };
    try {
      if (t) {
        const i = P0(e, this.config);
        return await Ia(n, (a) => {
          i.accept(a);
        }, {
          signal: e.signal,
          onRequest: r
        }), {
          ...i.result(),
          requestInspection: o
        };
      }
      return {
        ...b0(await Ea(n, {
          signal: e.signal,
          onRequest: r
        }), {
          model: this.config.model,
          includeReasoningOutput: J(e.reasoning)
        }),
        requestInspection: o
      };
    } catch (i) {
      throw o && i && typeof i == "object" && (i.requestInspection = o), i;
    }
  }
};
function x0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: J(e.reasoning) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function gi(e, t = []) {
  const n = Pt(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : Mt(n.cleaned)
  };
}
function N0(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var k0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? ps(e, this.config.model) : hs(e, this.config.model);
  }
  buildPayload(e, t = !1) {
    const n = he("sillytavern-openai-compatible", this.config, e.reasoning), o = t ? ps(e, this.config.model) : hs(e, this.config.model), r = {
      ...e,
      temperature: lo({
        ...this.config,
        provider: "sillytavern-openai-compatible"
      }, n) ? void 0 : e.temperature
    };
    return tm(r0(this.config, t ? {
      ...r,
      tools: void 0,
      toolChoice: void 0
    } : r, o, typeof e.onStreamProgress == "function"), n);
  }
  async inspectRequest(e, t = {}) {
    const n = await Ao(t.payload || this.buildPayload(e, !!t.taggedMode), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = he("sillytavern-openai-compatible", this.config, t.reasoning), o = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "thinking") ? { thinking: e.body.thinking } : {}
    };
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Dt(e),
      effectiveConfig: _t(t, {
        profileId: n.profileId,
        effectiveMode: n.mode,
        effort: e?.body?.reasoning_effort,
        controlFields: o
      })
    };
  }
  async streamChat(e, t, n = {}) {
    const o = { role: "assistant" };
    let r = "stop", i = this.config.model;
    await Ia(t, (f) => {
      i = f?.model || i;
      const p = f?.choices?.[0] || {};
      ms(o, p), p.finish_reason && (r = p.finish_reason);
      const m = jt(o), { thinkTagged: g, cleanedText: _ } = gi(Zt(o), m), y = m.length ? m : ds(g.cleaned);
      x0(e, {
        text: _,
        thoughts: J(e.reasoning) ? ht(o, p).concat(g.thoughts) : [],
        ...y.length ? { toolCalls: y } : {},
        ...!m.length && y.length ? { toolCallDraft: !0 } : {}
      });
    }, {
      signal: e.signal,
      onRequest: n.onRequest,
      onResponseAccepted: n.onResponseAccepted
    }), en(o);
    const a = jt(o), { thinkTagged: u, cleanedText: c } = gi(Zt(o), a), d = ht(o, {});
    u.thoughts.forEach((f) => d.push(f));
    const h = a.length ? [] : jn(u.cleaned);
    return {
      text: c,
      toolCalls: [...a, ...h],
      thoughts: J(e.reasoning) ? d : [],
      finishReason: r,
      model: i,
      provider: "sillytavern-openai-compatible",
      providerPayload: eo(o)
    };
  }
  async nonStreamingChat(e, t, n = {}) {
    const o = await Ea(t, {
      signal: e.signal,
      onRequest: n.onRequest
    }), r = o.choices?.[0] || {}, i = r.message || {};
    en(i);
    const a = ht(i, r), u = _a(i.tool_calls || []), { thinkTagged: c, cleanedText: d } = gi(ya(i.content), u);
    c.thoughts.forEach((p) => a.push(p));
    const h = u.length ? [] : jn(c.cleaned), f = Sr(i, r);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: J(e.reasoning) ? a : [],
      finishReason: r.finish_reason || "stop",
      model: o.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: eo(f)
    };
  }
  async chat(e) {
    const t = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, n = Array.isArray(e.tools) && e.tools.length > 0, o = async (i, a = {}) => {
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
    }, r = this.buildPayload(e, t);
    try {
      return await o(r);
    } catch (i) {
      if (e.allowToolProtocolFallback === !1 || t || !n || !N0(i)) throw i;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await o(this.buildPayload(e, !0));
  }
};
function Y0(e = {}, t = {}) {
  if (!e.apiKey && !Km(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (Xc(e.reasoning || {}), e.provider) {
    case "sillytavern-openai-compatible":
      return new k0(e);
    case "sillytavern-claude":
      return new A0(e);
    case "sillytavern-google":
      return new M0(e);
    case "openai-responses":
      return new BC(e);
    case "anthropic":
      return new zg(e);
    case "google":
      return new KI(e);
    default:
      return new MC(e);
  }
}
function D0(e = {}) {
  const t = String(e?.name || "").trim();
  if (typeof e?.arguments == "string") {
    const n = e.arguments;
    try {
      return JSON.parse(n.trim() || "{}"), n;
    } catch {
      return Qp(n, t) || n;
    }
  }
  try {
    return JSON.stringify(e?.arguments || {});
  } catch {
    return "{}";
  }
}
function gs(e = [], t = {}) {
  const n = String(t.fallbackPrefix || "agent-tool").trim() || "agent-tool", o = typeof t.createId == "function" ? t.createId : (r) => `${n}-${Date.now()}-${r + 1}`;
  return (Array.isArray(e) ? e : []).map((r, i) => {
    const a = Object.prototype.hasOwnProperty.call(r || {}, "providerId");
    return {
      id: String(r?.id || o(i) || `${n}-${i + 1}`),
      name: String(r?.name || "").trim(),
      arguments: D0(r),
      ...a ? { providerId: String(r?.providerId || "") } : {}
    };
  }).filter((r) => r.name);
}
function $0(e, t = {}) {
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
function X0(e = {}, t = {}, n = {}) {
  const o = gs(e?.toolCalls, n);
  return o.length ? o : String(e?.provider || t?.provider || "").toLowerCase() !== "google" ? [] : gs($0(e?.providerPayload, n), n);
}
function Q0(e = {}, t = [], n = {}) {
  return {
    role: "assistant",
    content: Object.prototype.hasOwnProperty.call(n, "content") ? String(n.content || "") : String(e.text || ""),
    providerPayload: e.providerPayload,
    tool_calls: gs(t, n).map((o) => ({
      id: o.id,
      type: "function",
      ...Object.prototype.hasOwnProperty.call(o, "providerId") ? { providerToolCallId: o.providerId } : {},
      function: {
        name: o.name,
        arguments: o.arguments || "{}"
      }
    }))
  };
}
function Z0(e = {}) {
  const t = String(e.toolName || e.tool_name || "").trim();
  return {
    role: "tool",
    tool_call_id: String(e.toolCallId || e.tool_call_id || ""),
    ...t ? { toolName: t } : {},
    content: String(e.content || "")
  };
}
export {
  H0 as AGENT_REQUEST_TIMEOUT_MS,
  Jm as PROVIDER_OPTIONS,
  L0 as REASONING_MODE_OPTIONS,
  U0 as REASONING_OUTPUT_OPTIONS,
  Q0 as buildProviderAssistantToolCallMessage,
  Z0 as buildProviderToolResultMessage,
  Y0 as createAgentAdapter,
  J0 as getProviderLabel,
  q0 as getReasoningEffortOptions,
  B0 as getReasoningModeOptions,
  K0 as getToolModeLabel,
  Km as isSillyTavernProvider,
  Mm as normalizeAgentConfig,
  G0 as normalizeAgentSettings,
  _s as normalizeReasoningConfig,
  Dt as redactRequestSecrets,
  W0 as resolveActiveProviderConfig,
  Cs as resolveReasoningCapability,
  X0 as resolveResultToolCalls,
  vi as resolveRuntimeReasoning,
  z0 as setHostChatCompletionsRequestHeadersProvider
};
