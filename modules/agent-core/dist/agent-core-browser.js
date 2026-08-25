var Tm = Object.create, Gc = Object.defineProperty, Sm = Object.getOwnPropertyDescriptor, Em = Object.getOwnPropertyNames, Cm = Object.getPrototypeOf, wm = Object.prototype.hasOwnProperty, Pr = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), Im = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var r = Em(t), i = 0, s = r.length, u; i < s; i++)
      u = r[i], !wm.call(e, u) && u !== n && Gc(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(o = Sm(t, u)) || o.enumerable
      });
  return e;
}, bm = (e, t, n) => (n = e != null ? Tm(Cm(e)) : {}, Im(t || !e || !e.__esModule ? Gc(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), Rm = "https://api.tavily.com";
function Si(e = "") {
  return String(e || "").trim();
}
function Qn(e = "") {
  return String(e || "").trim().replace(/\/+$/, "") || "https://api.tavily.com";
}
var X0 = Object.freeze([
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
function Pm(e = "") {
  return e === "on" || e === "off" ? e : "inherit";
}
function Mm(e) {
  return String(e ?? "").trim().toLowerCase() || void 0;
}
function xm(e) {
  if (e == null || e === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? Math.floor(t) : void 0;
}
function Ss(e = {}) {
  const t = e && typeof e == "object" ? e : {}, n = Mm(t.effort), o = xm(t.budgetTokens);
  return {
    mode: Pm(t.mode),
    ...n ? { effort: n } : {},
    ...o !== void 0 ? { budgetTokens: o } : {}
  };
}
function K(e = {}) {
  return e?.mode !== "off" && e?.output === "show";
}
var Bc = "openai-compatible", Es = "默认", qc = "default", Nm = "deny", tt = 32e3;
var Q0 = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), Z0 = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), Ei = {
  "openai-responses": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: tt,
    sendTemperature: !0
  },
  "openai-compatible": {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: tt,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-openai-compatible": {
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKey: "",
    temperature: 1,
    maxTokens: tt,
    sendTemperature: !0,
    toolMode: "native"
  },
  "sillytavern-claude": {
    baseUrl: "",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: tt,
    sendTemperature: !0
  },
  "sillytavern-google": {
    baseUrl: "",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: tt,
    sendTemperature: !0
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-0",
    apiKey: "",
    temperature: 1,
    maxTokens: tt,
    sendTemperature: !0
  },
  google: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-pro",
    apiKey: "",
    temperature: 1,
    maxTokens: tt,
    sendTemperature: !0
  }
};
function zt() {
  return JSON.parse(JSON.stringify(Ei));
}
function _t() {
  return {
    provider: Bc,
    modelConfigs: zt(),
    permissionMode: qc
  };
}
function Hc(e = _t()) {
  const t = e && typeof e == "object" ? e : _t();
  return {
    provider: ws(t.provider),
    modelConfigs: Cs(t.modelConfigs || {})
  };
}
function Vc(e) {
  return e === "full" ? "full" : qc;
}
function Jc(e) {
  return e === "allow" ? "allow" : Nm;
}
function Dn(e, t = tt) {
  const n = Number(e);
  if (!Number.isFinite(n) || n <= 0) {
    const o = Number(t);
    return Number.isFinite(o) && o > 0 ? Math.floor(o) : tt;
  }
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
}
function ot(e) {
  return String(e || "").trim() || "默认";
}
function Cs(e = {}) {
  const t = zt();
  return Object.keys(Ei).forEach((n) => {
    const o = e && typeof e[n] == "object" ? e[n] : {}, r = Ei[n];
    t[n] = {
      baseUrl: String(o.baseUrl ?? r.baseUrl ?? ""),
      model: String(o.model ?? r.model ?? ""),
      apiKey: String(o.apiKey ?? r.apiKey ?? ""),
      temperature: o.temperature ?? r.temperature,
      maxTokens: Dn(o.maxTokens, r.maxTokens),
      sendTemperature: typeof o.sendTemperature == "boolean" ? o.sendTemperature : r.sendTemperature,
      ..."toolMode" in r ? { toolMode: String(o.toolMode || r.toolMode || "native") } : {},
      reasoning: Ss(o.reasoning)
    };
  }), t;
}
function ws(e) {
  return typeof e == "string" && e.trim() ? e : Bc;
}
function Is(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function Kc(e = {}, t) {
  const n = {}, o = Is(e, t);
  return Object.entries(o).forEach(([r, i]) => {
    if (!i || typeof i != "object") return;
    const s = ot(r);
    n[s] = {
      provider: ws(i.provider),
      modelConfigs: Cs(i.modelConfigs || {}),
      permissionMode: Vc(i.permissionMode)
    };
  }), Object.keys(n).length || (n[Es] = _t()), n;
}
function Wc(e, t) {
  const n = ot(t);
  return e[n] ? n : Object.keys(e)[0];
}
function zc(e, t, n) {
  const o = ot(t || n);
  return e[o] ? o : e[n] ? n : Object.keys(e)[0];
}
function bs(e = {}, t = _t()) {
  const n = Hc(t), o = e && typeof e == "object" ? e : {};
  return {
    provider: ws(o.provider || n.provider),
    modelConfigs: Cs(o.modelConfigs || n.modelConfigs)
  };
}
function Yc(e = {}, t = {}, n = Es, o = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (o !== n) return !0;
  const r = e?.delegateConfig;
  if (!r || typeof r != "object" || Array.isArray(r) || !(typeof r.provider == "string" && r.provider.trim() || r.modelConfigs && typeof r.modelConfigs == "object" && Object.keys(r.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const i = t[n] || _t(), s = Hc(i), u = bs(r, i);
  return JSON.stringify(u) !== JSON.stringify(s);
}
function km(e = {}, t, n, o, r) {
  const i = r(e?.[o]);
  if (i) return i;
  const s = Is(e, t), u = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(s || {})
  ].map(ot), c = /* @__PURE__ */ new Set();
  for (const d of u) {
    if (c.has(d)) continue;
    c.add(d);
    const f = r(s?.[d]?.[o]);
    if (f) return f;
  }
  return r(e?.delegateConfig?.[o]);
}
function Dm(e = {}, t, n) {
  const o = (u) => String(u || "").trim();
  if (o(e?.tavilyBaseUrl)) return Qn(e.tavilyBaseUrl);
  const r = Is(e, t), i = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(r || {})
  ].map(ot), s = /* @__PURE__ */ new Set();
  for (const u of i) {
    if (s.has(u)) continue;
    s.add(u);
    const c = r?.[u]?.tavilyBaseUrl;
    if (o(c)) return Qn(c);
  }
  return o(e?.delegateConfig?.tavilyBaseUrl) ? Qn(e.delegateConfig.tavilyBaseUrl) : Rm;
}
function Xc(e = {}, t, n) {
  return {
    tavilyApiKey: km(e, t, n, "tavilyApiKey", Si),
    tavilyBaseUrl: Dm(e, t, n)
  };
}
function j0(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: o = (p) => String(p || "") } = t, r = ot(e.currentPresetName || e.presetName || "默认"), i = Kc(e, r), s = Wc(i, e.currentPresetName), u = zc(i, e.delegatePresetName, s), c = i[u] || i[s] || _t(), d = bs(e.delegateConfig, c), f = Yc(e, i, s, u), h = Xc(e, r, s);
  return {
    enabled: !!e.enabled,
    workspaceFileName: o(e.workspaceFileName || n),
    jsApiPermission: Jc(e.jsApiPermission),
    currentPresetName: s,
    delegatePresetName: u,
    delegateConfig: d,
    delegateConfigured: f,
    presets: i,
    tavilyApiKey: h.tavilyApiKey,
    tavilyBaseUrl: h.tavilyBaseUrl,
    updatedAt: Number(e.updatedAt) || 0,
    configVersion: 1
  };
}
function $m(e = {}) {
  const t = ot(e.currentPresetName || e.presetDraftName || "默认"), n = Kc(e, t), o = Wc(n, e.currentPresetName), r = zc(n, e.delegatePresetName, o), i = n[o] || _t(), s = n[r] || i, u = bs(e.delegateConfig, s), c = Yc(e, n, o, r), d = Xc(e, t, o);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    updatedAt: Number(e.updatedAt) || 0,
    jsApiPermission: Jc(e.jsApiPermission),
    currentPresetName: o,
    delegatePresetName: r,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: ot(e.presetDraftName || o),
    presetNames: Object.keys(n),
    presets: n,
    provider: i.provider,
    modelConfigs: i.modelConfigs,
    permissionMode: Vc(i.permissionMode),
    tavilyApiKey: d.tavilyApiKey,
    tavilyBaseUrl: d.tavilyBaseUrl
  };
}
function Lm(e = "") {
  return String(e || "").trim().toLowerCase();
}
function Rs(e = "") {
  const t = Lm(e);
  return t.includes("deepseek") ? "deepseek" : t.includes("kimi") || t.includes("moonshot") ? "kimi" : t.includes("gemini") ? "gemini" : t.includes("claude") ? "claude" : /(?:^|[/_.-])gpt(?:\d|[/_.-]|$)/.test(t) || /(?:^|[/_.-])o\d+(?:[/_.-]|$)/.test(t) ? "openai" : "";
}
var Um = Object.freeze({
  minimal: "最小",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "超高",
  max: "最大",
  min: "最小"
});
function Qc(e) {
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
function Ye(e, t, n, o, r = {}) {
  return Qc({
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
var Ps = Qc({
  profileId: "unsupported",
  modes: ["inherit"],
  outputModes: ["hide"],
  intensity: { kind: "none" },
  unsupportedReason: "当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。"
}), co = Object.freeze(["on"]), Ms = Object.freeze([
  "inherit",
  "on",
  "off"
]), Zc = Ye("openai-gpt-5.6", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "medium", { temperatureOmitModes: Ms }), Fm = Ye("kimi-k3", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "max", { temperatureOmitModes: co }), Om = Ye("deepseek-thinking", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "high", { temperatureOmitModes: co }), Gm = Ye("openai-compatible-gemini-latest", [
  "inherit",
  "on",
  "off"
], [
  "minimal",
  "low",
  "medium",
  "high"
], "high", { temperatureOmitModes: co }), Bm = Ye("openai-compatible-claude-latest", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: co }), qm = Ye("openai-compatible-default", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high"
], "medium", { temperatureOmitModes: co }), Hm = Ye("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: Ms }), Vm = Ye("sillytavern-claude-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: Ms }), Jm = Ye("google-gemini-3-flash", ["inherit", "on"], [
  "minimal",
  "low",
  "medium",
  "high"
], "high"), Km = Ye("sillytavern-google-3-flash", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high"
], "high");
function Wm(e = "") {
  switch (Rs(e)) {
    case "deepseek":
      return Om;
    case "kimi":
      return Fm;
    case "gemini":
      return Gm;
    case "claude":
      return Bm;
    case "openai":
      return Zc;
    default:
      return qm;
  }
}
function xs(e = {}) {
  const t = String(e.provider || "").trim(), n = String(e.model || "").trim().toLowerCase();
  switch (t) {
    case "openai-responses":
      return Zc;
    case "openai-compatible":
    case "sillytavern-openai-compatible":
      return Wm(n);
    case "anthropic":
      return Hm;
    case "sillytavern-claude":
      return Vm;
    case "google":
      return Jm;
    case "sillytavern-google":
      return Km;
    default:
      return Ps;
  }
}
function eb(e = Ps) {
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
function tb(e = Ps) {
  return e.intensity?.kind !== "effort" ? [] : e.intensity.values.map((t) => ({
    value: t,
    label: Um[t] || t
  }));
}
function Qr(e, t, n, o = "REASONING_CAPABILITY_UNSUPPORTED") {
  return {
    ...e,
    profileId: t.profileId,
    valid: !1,
    error: n,
    code: o
  };
}
function zm(e, t) {
  const n = { ...e };
  return delete n.effort, delete n.budgetTokens, t.intensity?.kind === "effort" ? {
    ...n,
    ...e.effort ? { effort: e.effort } : {}
  } : n;
}
function Ci(e = {}, t = {}) {
  const n = xs(e), o = Ss(t), r = t?.output === "show" || t?.output === "hide" ? t.output : null, i = zm({
    ...o,
    output: o.mode === "off" ? "hide" : r || (n.outputModes.includes("show") ? "show" : "hide")
  }, n);
  if (!n.outputModes.includes(i.output)) return Qr(i, n, "当前任务要求返回 Reasoning 内容，但所选模型不支持。");
  if (!n.modes.includes(i.mode)) return Qr(i, n, i.mode === "off" ? "当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。" : n.unsupportedReason || "当前模型不支持显式开启 Reasoning。");
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
    } : Qr(i, n, `当前模型不支持 Reasoning 强度“${s}”。`, "REASONING_CONFIG_INVALID");
  }
  return {
    ...i,
    profileId: n.profileId,
    valid: !0
  };
}
var Ym = class extends Error {
  constructor(e = {}) {
    super(e.error || "当前模型不支持所选 Reasoning 配置。"), this.name = "ReasoningCapabilityError", this.code = e.code || "REASONING_CAPABILITY_UNSUPPORTED", this.profileId = e.profileId || "unsupported", this.reasoning = e;
  }
};
function jc(e = {}) {
  if (e.valid === !1) throw new Ym(e);
  return e;
}
function Q(e = "", t = {}, n = {}, o = {}) {
  return jc(Ci({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model,
    maxTokens: o.maxTokens ?? t.maxTokens
  }, n));
}
function fo(e = {}, t = {}) {
  return xs(e).temperatureOmitModes.includes(t.mode);
}
var nb = 900 * 1e3, ob = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), Xm = Object.freeze([
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
function Qm(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function ed(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, o = Number(n);
  return Number.isFinite(o) ? Math.max(0, Math.min(2, o)) : ed(t, 1);
}
function wi(e = {}) {
  return e.sendTemperature !== !1;
}
function xa(e = {}) {
  return wi(e) ? ed(e.temperature, 1) : void 0;
}
function rb(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : Xm.find((n) => n.value === e)?.label || e || "未配置";
}
function ib(e = {}) {
  const t = String(e.provider || "").trim();
  return t === "openai-compatible" || t === "sillytavern-openai-compatible" ? e.toolMode === "tagged-json" ? "Tagged JSON 兼容模式" : "原生 Tool Calling" : "Provider 原生工具";
}
function sb(e = {}, t = {}) {
  const n = $m(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const d = n.delegateConfig.provider || "openai-compatible", f = (n.delegateConfig.modelConfigs || zt())[d] || zt()[d] || {}, h = {
      provider: d,
      baseUrl: String(f.baseUrl || ""),
      model: String(f.model || ""),
      maxTokens: Dn(f.maxTokens)
    };
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: d,
      baseUrl: String(f.baseUrl || ""),
      model: String(f.model || ""),
      apiKey: String(f.apiKey || ""),
      tavilyApiKey: Si(n.tavilyApiKey),
      tavilyBaseUrl: Qn(n.tavilyBaseUrl),
      temperature: xa(f),
      sendTemperature: wi(f),
      maxTokens: Dn(f.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: f.toolMode || "native",
      reasoning: Ci(h, f.reasoning)
    };
  }
  const o = ot(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), r = n.presets?.[o] ? o : n.presets?.[n.currentPresetName] ? n.currentPresetName : Es, i = n.presets?.[r] || _t(), s = i.provider || n.provider || "openai-compatible", u = (i.modelConfigs || n.modelConfigs || zt())[s] || zt()[s] || {}, c = {
    provider: s,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    maxTokens: Dn(u.maxTokens)
  };
  return {
    currentPresetName: String(r || ""),
    provider: s,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    tavilyApiKey: Si(n.tavilyApiKey),
    tavilyBaseUrl: Qn(n.tavilyBaseUrl),
    temperature: xa(u),
    sendTemperature: wi(u),
    maxTokens: Dn(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoning: Ci(c, u.reasoning)
  };
}
function k(e, t, n, o, r) {
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
var td = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return td = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function ro(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ii = (e) => {
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
}, Ie = class bi extends G {
  constructor(t, n, o, r, i) {
    super(`${bi.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new Mr({
      message: o,
      cause: Ii(n)
    });
    const i = n, s = i?.error?.type;
    return t === 400 ? new od(t, i, o, r, s) : t === 401 ? new rd(t, i, o, r, s) : t === 403 ? new id(t, i, o, r, s) : t === 404 ? new sd(t, i, o, r, s) : t === 409 ? new ad(t, i, o, r, s) : t === 422 ? new ld(t, i, o, r, s) : t === 429 ? new ud(t, i, o, r, s) : t >= 500 ? new cd(t, i, o, r, s) : new bi(t, i, o, r, s);
  }
}, Be = class extends Ie {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Mr = class extends Ie {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, nd = class extends Mr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, od = class extends Ie {
}, rd = class extends Ie {
}, id = class extends Ie {
}, sd = class extends Ie {
}, ad = class extends Ie {
}, ld = class extends Ie {
}, ud = class extends Ie {
}, cd = class extends Ie {
}, Zm = /^[a-z][a-z0-9+.-]*:/i, jm = (e) => Zm.test(e), Ri = (e) => (Ri = Array.isArray, Ri(e)), Na = Ri;
function Pi(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function ka(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function eg(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var tg = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new G(`${e} must be an integer`);
  if (t < 0) throw new G(`${e} must be a positive integer`);
  return t;
}, dd = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, ng = (e) => new Promise((t) => setTimeout(t, e)), Ht = "0.91.1", og = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function rg() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var ig = () => {
  const e = rg();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ht,
    "X-Stainless-OS": $a(Deno.build.os),
    "X-Stainless-Arch": Da(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ht,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ht,
    "X-Stainless-OS": $a(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": Da(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = sg();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ht,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Ht,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function sg() {
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
var Da = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", $a = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), La, ag = () => La ?? (La = ig());
function lg() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function fd(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function hd(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return fd({
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
function Ns(e) {
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
async function ug(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var cg = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function dg(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new G(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function fg(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Ua;
function ks(e) {
  let t;
  return (Ua ?? (t = new globalThis.TextEncoder(), Ua = t.encode.bind(t)))(e);
}
var Fa;
function Oa(e) {
  let t;
  return (Fa ?? (t = new globalThis.TextDecoder(), Fa = t.decode.bind(t)))(e);
}
var Te, Se, ho = class {
  constructor() {
    Te.set(this, void 0), Se.set(this, void 0), k(this, Te, new Uint8Array(), "f"), k(this, Se, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? ks(e) : e;
    k(this, Te, fg([T(this, Te, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = hg(T(this, Te, "f"), T(this, Se, "f"))) != null; ) {
      if (o.carriage && T(this, Se, "f") == null) {
        k(this, Se, o.index, "f");
        continue;
      }
      if (T(this, Se, "f") != null && (o.index !== T(this, Se, "f") + 1 || o.carriage)) {
        n.push(Oa(T(this, Te, "f").subarray(0, T(this, Se, "f") - 1))), k(this, Te, T(this, Te, "f").subarray(T(this, Se, "f")), "f"), k(this, Se, null, "f");
        continue;
      }
      const r = T(this, Se, "f") !== null ? o.preceding - 1 : o.preceding, i = Oa(T(this, Te, "f").subarray(0, r));
      n.push(i), k(this, Te, T(this, Te, "f").subarray(o.index), "f"), k(this, Se, null, "f");
    }
    return n;
  }
  flush() {
    return T(this, Te, "f").length ? this.decode(`
`) : [];
  }
};
Te = /* @__PURE__ */ new WeakMap(), Se = /* @__PURE__ */ new WeakMap();
ho.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
ho.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function hg(e, t) {
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
function pg(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var dr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Ga = (e, t, n) => {
  if (e) {
    if (eg(dr, e)) return e;
    fe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(dr))}`);
  }
};
function $n() {
}
function Eo(e, t, n) {
  return !t || dr[e] > dr[n] ? $n : t[e].bind(t);
}
var mg = {
  error: $n,
  warn: $n,
  info: $n,
  debug: $n
}, Ba = /* @__PURE__ */ new WeakMap();
function fe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return mg;
  const o = Ba.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: Eo("error", t, n),
    warn: Eo("warn", t, n),
    info: Eo("info", t, n),
    debug: Eo("debug", t, n)
  };
  return Ba.set(t, [n, r]), r;
}
var Ct = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), mn, io = class Ln {
  constructor(t, n, o) {
    this.iterator = t, mn.set(this, void 0), this.controller = n, k(this, mn, o, "f");
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? fe(o) : console;
    async function* s() {
      if (r) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of gg(t, n)) {
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
            const d = dd(c.data) ?? c.data, f = d?.error?.type;
            throw new Ie(void 0, d, void 0, t.headers, f);
          }
        }
        u = !0;
      } catch (c) {
        if (ro(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Ln(s, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    async function* i() {
      const u = new ho(), c = Ns(t);
      for await (const d of c) for (const f of u.decode(d)) yield f;
      for (const d of u.flush()) yield d;
    }
    async function* s() {
      if (r) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (ro(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Ln(s, n, o);
  }
  [(mn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Ln(() => r(t), this.controller, T(this, mn, "f")), new Ln(() => r(n), this.controller, T(this, mn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return fd({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const s = ks(JSON.stringify(r) + `
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
async function* gg(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
  const n = new yg(), o = new ho(), r = Ns(e.body);
  for await (const i of _g(r)) for (const s of o.decode(i)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const s = n.decode(i);
    s && (yield s);
  }
}
async function* _g(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? ks(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = pg(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var yg = class {
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
    let [t, n, o] = vg(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function vg(e, t) {
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
async function pd(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, s = await (async () => {
    if (t.options.stream)
      return fe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : io.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : md(await n.json(), n) : await n.text();
  })();
  return fe(e).debug(`[${o}] response parsed`, Ct({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
function md(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var Un, gd = class _d extends Promise {
  constructor(t, n, o = pd) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, Un.set(this, void 0), k(this, Un, t, "f");
  }
  _thenUnwrap(t) {
    return new _d(T(this, Un, "f"), this.responsePromise, async (n, o) => md(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(T(this, Un, "f"), t))), this.parsedPromise;
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
Un = /* @__PURE__ */ new WeakMap();
var Co, yd = class {
  constructor(e, t, n, o) {
    Co.set(this, void 0), k(this, Co, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new G("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await T(this, Co, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Co = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Ag = class extends gd {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await pd(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, po = class extends yd {
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
          ...Pi(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Pi(this.options.query),
        after_id: e
      }
    } : null;
  }
}, ve = class extends yd {
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
        ...Pi(this.options.query),
        page: e
      }
    } : null;
  }
}, vd = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function nn(e, t, n) {
  return vd(), new File(e, t ?? "unknown_file", n);
}
function Qo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Ad = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Ds = async (e, t, n = !0) => ({
  ...e,
  body: await Sg(e.body, t, n)
}), qa = /* @__PURE__ */ new WeakMap();
function Tg(e) {
  const t = typeof e == "function" ? e : e.fetch, n = qa.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return qa.set(t, o), o;
}
var Sg = async (e, t, n = !0) => {
  if (!await Tg(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const o = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, i]) => Mi(o, r, i, n))), o;
}, Eg = (e) => e instanceof Blob && "name" in e, Mi = async (e, t, n, o) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let r = {};
      const i = n.headers.get("Content-Type");
      i && (r = { type: i }), e.append(t, nn([await n.blob()], Qo(n, o), r));
    } else if (Ad(n)) e.append(t, nn([await new Response(hd(n)).blob()], Qo(n, o)));
    else if (Eg(n)) e.append(t, nn([n], Qo(n, o), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Mi(e, t + "[]", r, o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, i]) => Mi(e, `${t}[${r}]`, i, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Td = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Cg = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Td(e), wg = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Ig(e, t, n) {
  if (vd(), e = await e, t || (t = Qo(e, !0)), Cg(e))
    return e instanceof File && t == null && n == null ? e : nn([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if (wg(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), nn(await xi(r), t, n);
  }
  const o = await xi(e);
  if (!n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return nn(o, t, n);
}
async function xi(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Td(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Ad(e)) for await (const n of e) t.push(...await xi(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${bg(e)}`);
  }
  return t;
}
function bg(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var X = class {
  constructor(e) {
    this._client = e;
  }
}, Sd = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Rg(e) {
  if (!e) return;
  if (Sd in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Na(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = Na(o[1]) ? o[1] : [o[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [r, null]), yield [r, u]);
  }
}
var b = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, s] of Rg(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [Sd]: !0,
    values: t,
    nulls: n
  };
};
function Ed(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Ha = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Pg = (e = Ed) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], s = n.reduce((f, h, p) => {
    /[?#]/.test(h) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Ha) ?? Ha)?.toString) && (g = m + "", i.push({
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
    throw new G(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${s}
${h}`);
  }
  return s;
}, L = /* @__PURE__ */ Pg(Ed), Cd = class extends X {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/environments?beta=true", {
      body: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/environments/${e}?beta=true`, {
      body: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/environments?beta=true", ve, {
      query: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/environments/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/environments/${e}/archive?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Zn = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function Zo(e) {
  return typeof e == "object" && e !== null && Zn in e;
}
function wd(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const o of e) Zo(o) && n.add(o[Zn]);
  if (t) {
    for (const o of t)
      if (Zo(o) && n.add(o[Zn]), Array.isArray(o.content))
        for (const r of o.content) Zo(r) && n.add(r[Zn]);
  }
  return Array.from(n);
}
function Id(e, t) {
  const n = wd(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function Mg(e) {
  return Zo(e) ? { "x-stainless-helper": e[Zn] } : {};
}
var bd = class extends X {
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", po, {
      query: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/files/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  download(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/files/${e}/content?beta=true`, {
      ...n,
      headers: b([{
        "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      __binaryResponse: !0
    });
  }
  retrieveMetadata(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/files/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "files-api-2025-04-14"].toString() }, n?.headers])
    });
  }
  upload(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/files?beta=true", Ds({
      body: o,
      ...t,
      headers: b([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        Mg(o.file),
        t?.headers
      ])
    }, this._client));
  }
}, Rd = class extends X {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/models/${e}?beta=true`, {
      ...n,
      headers: b([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", po, {
      query: o,
      ...t,
      headers: b([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Pd = class extends X {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/user_profiles?beta=true", {
      body: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/user_profiles/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/user_profiles/${e}?beta=true`, {
      body: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/user_profiles?beta=true", ve, {
      query: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "user-profiles-2026-03-24"].toString() }, t?.headers])
    });
  }
  createEnrollmentURL(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/user_profiles/${e}/enrollment_url?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "user-profiles-2026-03-24"].toString() }, n?.headers])
    });
  }
}, Md = class extends X {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/agents/${e}/versions?beta=true`, ve, {
      query: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, $s = class extends X {
  constructor() {
    super(...arguments), this.versions = new Md(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/agents?beta=true", {
      body: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.get(L`/v1/agents/${e}?beta=true`, {
      query: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/agents/${e}?beta=true`, {
      body: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/agents?beta=true", ve, {
      query: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/agents/${e}/archive?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
$s.Versions = Md;
var xd = class extends X {
  create(e, t, n) {
    const { view: o, betas: r, ...i } = t;
    return this._client.post(L`/v1/memory_stores/${e}/memories?beta=true`, {
      query: { view: o },
      body: i,
      ...n,
      headers: b([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { memory_store_id: o, betas: r, ...i } = t;
    return this._client.get(L`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: i,
      ...n,
      headers: b([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { memory_store_id: o, view: r, betas: i, ...s } = t;
    return this._client.post(L`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: { view: r },
      body: s,
      ...n,
      headers: b([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/memory_stores/${e}/memories?beta=true`, ve, {
      query: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { memory_store_id: o, expected_content_sha256: r, betas: i } = t;
    return this._client.delete(L`/v1/memory_stores/${o}/memories/${e}?beta=true`, {
      query: { expected_content_sha256: r },
      ...n,
      headers: b([{ "anthropic-beta": [...i ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Nd = class extends X {
  retrieve(e, t, n) {
    const { memory_store_id: o, betas: r, ...i } = t;
    return this._client.get(L`/v1/memory_stores/${o}/memory_versions/${e}?beta=true`, {
      query: i,
      ...n,
      headers: b([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/memory_stores/${e}/memory_versions?beta=true`, ve, {
      query: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  redact(e, t, n) {
    const { memory_store_id: o, betas: r } = t;
    return this._client.post(L`/v1/memory_stores/${o}/memory_versions/${e}/redact?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, xr = class extends X {
  constructor() {
    super(...arguments), this.memories = new xd(this._client), this.memoryVersions = new Nd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/memory_stores?beta=true", {
      body: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/memory_stores/${e}?beta=true`, {
      body: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/memory_stores?beta=true", ve, {
      query: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/memory_stores/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/memory_stores/${e}/archive?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
xr.Memories = xd;
xr.MemoryVersions = Nd;
var kd = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function Dd(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function Va(e, t, n) {
  const o = Dd(t);
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
  } : $d(e, t, n);
}
function $d(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const s = xg(t, i.text);
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
function xg(e, t) {
  const n = Dd(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new G(`Failed to parse structured output: ${o}`);
  }
}
var Ng = (e) => {
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
}, Vt = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Vt(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Vt(e);
    case "string":
      let o = e[e.length - 2];
      if (o?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Vt(e);
      if (o?.type === "brace" && o.value === "{")
        return e = e.slice(0, e.length - 1), Vt(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Vt(e);
  }
  return e;
}, kg = (e) => {
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
}, Dg = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, Ld = (e) => JSON.parse(Dg(kg(Vt(Ng(e))))), Pe, lt, Ft, gn, wo, _n, yn, Io, vn, Xe, An, bo, Ro, Tt, Po, Mo, Tn, Zr, Ja, xo, jr, ei, ti, Ka, Wa = "__json_buf";
function za(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var $g = class Ni {
  constructor(t, n) {
    Pe.add(this), this.messages = [], this.receivedMessages = [], lt.set(this, void 0), Ft.set(this, null), this.controller = new AbortController(), gn.set(this, void 0), wo.set(this, () => {
    }), _n.set(this, () => {
    }), yn.set(this, void 0), Io.set(this, () => {
    }), vn.set(this, () => {
    }), Xe.set(this, {}), An.set(this, !1), bo.set(this, !1), Ro.set(this, !1), Tt.set(this, !1), Po.set(this, void 0), Mo.set(this, void 0), Tn.set(this, void 0), xo.set(this, (o) => {
      if (k(this, bo, !0, "f"), ro(o) && (o = new Be()), o instanceof Be)
        return k(this, Ro, !0, "f"), this._emit("abort", o);
      if (o instanceof G) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new G(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new G(String(o)));
    }), k(this, gn, new Promise((o, r) => {
      k(this, wo, o, "f"), k(this, _n, r, "f");
    }), "f"), k(this, yn, new Promise((o, r) => {
      k(this, Io, o, "f"), k(this, vn, r, "f");
    }), "f"), T(this, gn, "f").catch(() => {
    }), T(this, yn, "f").catch(() => {
    }), k(this, Ft, t, "f"), k(this, Tn, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, Po, "f");
  }
  get request_id() {
    return T(this, Mo, "f");
  }
  async withResponse() {
    k(this, Tt, !0, "f");
    const t = await T(this, gn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Ni(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: r } = {}) {
    const i = new Ni(n, { logger: r });
    for (const s of n.messages) i._addMessageParam(s);
    return k(i, Ft, {
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
    }, T(this, xo, "f"));
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
      T(this, Pe, "m", jr).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) T(this, Pe, "m", ei).call(this, c);
      if (u.controller.signal?.aborted) throw new Be();
      T(this, Pe, "m", ti).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (k(this, Po, t, "f"), k(this, Mo, t?.headers.get("request-id"), "f"), T(this, wo, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, An, "f");
  }
  get errored() {
    return T(this, bo, "f");
  }
  get aborted() {
    return T(this, Ro, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (T(this, Xe, "f")[t] || (T(this, Xe, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = T(this, Xe, "f")[t];
    if (!o) return this;
    const r = o.findIndex((i) => i.listener === n);
    return r >= 0 && o.splice(r, 1), this;
  }
  once(t, n) {
    return (T(this, Xe, "f")[t] || (T(this, Xe, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      k(this, Tt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    k(this, Tt, !0, "f"), await T(this, yn, "f");
  }
  get currentMessage() {
    return T(this, lt, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, Pe, "m", Zr).call(this);
  }
  async finalText() {
    return await this.done(), T(this, Pe, "m", Ja).call(this);
  }
  _emit(t, ...n) {
    if (T(this, An, "f")) return;
    t === "end" && (k(this, An, !0, "f"), T(this, Io, "f").call(this));
    const o = T(this, Xe, "f")[t];
    if (o && (T(this, Xe, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !T(this, Tt, "f") && !o?.length && Promise.reject(r), T(this, _n, "f").call(this, r), T(this, vn, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !T(this, Tt, "f") && !o?.length && Promise.reject(r), T(this, _n, "f").call(this, r), T(this, vn, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, Pe, "m", Zr).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      T(this, Pe, "m", jr).call(this), this._connected(null);
      const i = io.fromReadableStream(t, this.controller);
      for await (const s of i) T(this, Pe, "m", ei).call(this, s);
      if (i.controller.signal?.aborted) throw new Be();
      T(this, Pe, "m", ti).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(lt = /* @__PURE__ */ new WeakMap(), Ft = /* @__PURE__ */ new WeakMap(), gn = /* @__PURE__ */ new WeakMap(), wo = /* @__PURE__ */ new WeakMap(), _n = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), Io = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), bo = /* @__PURE__ */ new WeakMap(), Ro = /* @__PURE__ */ new WeakMap(), Tt = /* @__PURE__ */ new WeakMap(), Po = /* @__PURE__ */ new WeakMap(), Mo = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), xo = /* @__PURE__ */ new WeakMap(), Pe = /* @__PURE__ */ new WeakSet(), Zr = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Ja = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new G("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, jr = function() {
    this.ended || k(this, lt, void 0, "f");
  }, ei = function(n) {
    if (this.ended) return;
    const o = T(this, Pe, "m", Ka).call(this, n);
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
            za(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
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
        this._addMessageParam(o), this._addMessage(Va(o, T(this, Ft, "f"), { logger: T(this, Tn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        k(this, lt, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, ti = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = T(this, lt, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return k(this, lt, void 0, "f"), Va(n, T(this, Ft, "f"), { logger: T(this, Tn, "f") });
  }, Ka = function(n) {
    let o = T(this, lt, "f");
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
            if (r && za(r)) {
              let i = r[Wa] || "";
              i += n.delta.partial_json;
              const s = { ...r };
              if (Object.defineProperty(s, Wa, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                s.input = Ld(i);
              } catch (u) {
                const c = new G(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                T(this, xo, "f").call(this, c);
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
    return new io(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Ud = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var Lg = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, Sn, Ot, St, ee, me, Ae, nt, ut, En, Ya, ki;
function Xa() {
  let e, t;
  return {
    promise: new Promise((n, o) => {
      e = n, t = o;
    }),
    resolve: e,
    reject: t
  };
}
var Fd = class {
  constructor(e, t, n) {
    Sn.add(this), this.client = e, Ot.set(this, !1), St.set(this, !1), ee.set(this, void 0), me.set(this, void 0), Ae.set(this, void 0), nt.set(this, void 0), ut.set(this, void 0), En.set(this, 0), k(this, ee, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const o = ["BetaToolRunner", ...wd(t.tools, t.messages)].join(", ");
    k(this, me, {
      ...n,
      headers: b([{ "x-stainless-helper": o }, n?.headers])
    }, "f"), k(this, ut, Xa(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(Ot = /* @__PURE__ */ new WeakMap(), St = /* @__PURE__ */ new WeakMap(), ee = /* @__PURE__ */ new WeakMap(), me = /* @__PURE__ */ new WeakMap(), Ae = /* @__PURE__ */ new WeakMap(), nt = /* @__PURE__ */ new WeakMap(), ut = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakSet(), Ya = async function() {
    const t = T(this, ee, "f").params.compactionControl;
    if (!t || !t.enabled) return !1;
    let n = 0;
    if (T(this, Ae, "f") !== void 0) try {
      const c = await T(this, Ae, "f");
      n = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0) + c.usage.output_tokens;
    } catch {
      return !1;
    }
    const o = t.contextTokenThreshold ?? 1e5;
    if (n < o) return !1;
    const r = t.model ?? T(this, ee, "f").params.model, i = t.summaryPrompt ?? Lg, s = T(this, ee, "f").params.messages;
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
      max_tokens: T(this, ee, "f").params.max_tokens
    }, {
      signal: T(this, me, "f").signal,
      headers: b([T(this, me, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new G("Expected text response for compaction");
    return T(this, ee, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (T(this, Ot, "f")) throw new G("Cannot iterate over a consumed stream");
    k(this, Ot, !0, "f"), k(this, St, !0, "f"), k(this, nt, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (T(this, ee, "f").params.max_iterations && T(this, En, "f") >= T(this, ee, "f").params.max_iterations) break;
          k(this, St, !1, "f"), k(this, nt, void 0, "f"), k(this, En, (e = T(this, En, "f"), e++, e), "f"), k(this, Ae, void 0, "f");
          const { max_iterations: n, compactionControl: o, ...r } = T(this, ee, "f").params;
          if (r.stream ? (t = this.client.beta.messages.stream({ ...r }, T(this, me, "f")), k(this, Ae, t.finalMessage(), "f"), T(this, Ae, "f").catch(() => {
          }), yield t) : (k(this, Ae, this.client.beta.messages.create({
            ...r,
            stream: !1
          }, T(this, me, "f")), "f"), yield T(this, Ae, "f")), !await T(this, Sn, "m", Ya).call(this)) {
            if (!T(this, St, "f")) {
              const { role: s, content: u } = await T(this, Ae, "f");
              T(this, ee, "f").params.messages.push({
                role: s,
                content: u
              });
            }
            const i = await T(this, Sn, "m", ki).call(this, T(this, ee, "f").params.messages.at(-1));
            if (i) T(this, ee, "f").params.messages.push(i);
            else if (!T(this, St, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!T(this, Ae, "f")) throw new G("ToolRunner concluded without a message from the server");
      T(this, ut, "f").resolve(await T(this, Ae, "f"));
    } catch (t) {
      throw k(this, Ot, !1, "f"), T(this, ut, "f").promise.catch(() => {
      }), T(this, ut, "f").reject(t), k(this, ut, Xa(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? T(this, ee, "f").params = e(T(this, ee, "f").params) : T(this, ee, "f").params = e, k(this, St, !0, "f"), k(this, nt, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? k(this, me, e(T(this, me, "f")), "f") : k(this, me, {
      ...T(this, me, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = T(this, me, "f").signal) {
    const t = await T(this, Ae, "f") ?? this.params.messages.at(-1);
    return t ? T(this, Sn, "m", ki).call(this, t, e) : null;
  }
  done() {
    return T(this, ut, "f").promise;
  }
  async runUntilDone() {
    if (!T(this, Ot, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return T(this, ee, "f").params;
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
ki = async function(t, n = T(this, me, "f").signal) {
  return T(this, nt, "f") !== void 0 ? T(this, nt, "f") : (k(this, nt, Ug(T(this, ee, "f").params, t, {
    ...T(this, me, "f"),
    signal: n
  }), "f"), T(this, nt, "f"));
};
async function Ug(e, t = e.messages.at(-1), n) {
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
          content: s instanceof Ud ? s.content : `Error: ${s instanceof Error ? s.message : String(s)}`,
          is_error: !0
        };
      }
    }))
  };
}
var Od = class Gd {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new ho();
    for await (const n of this.iterator) for (const o of t.decode(n)) yield JSON.parse(o);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
    return new Gd(Ns(t.body), n);
  }
}, Bd = class extends X {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/messages/batches?beta=true", {
      body: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/messages/batches?beta=true", po, {
      query: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "message-batches-2024-09-24"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/messages/batches/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  cancel(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/messages/batches/${e}/cancel?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "message-batches-2024-09-24"].toString() }, n?.headers])
    });
  }
  async results(e, t = {}, n) {
    const o = await this.retrieve(e);
    if (!o.results_url) throw new G(`No batch \`results_url\`; Has it finished processing? ${o.processing_status} - ${o.id}`);
    const { betas: r } = t ?? {};
    return this._client.get(o.results_url, {
      ...n,
      headers: b([{
        "anthropic-beta": [...r ?? [], "message-batches-2024-09-24"].toString(),
        Accept: "application/binary"
      }, n?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((i, s) => Od.fromResponse(s.response, s.controller));
  }
}, Qa = {
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
}, Fg = ["claude-mythos-preview", "claude-opus-4-6"], mo = class extends X {
  constructor() {
    super(...arguments), this.batches = new Bd(this._client);
  }
  create(e, t) {
    const n = Za(e), { betas: o, ...r } = n;
    r.model in Qa && console.warn(`The model '${r.model}' is deprecated and will reach end-of-life on ${Qa[r.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Fg.includes(r.model) && r.thinking && r.thinking.type === "enabled" && console.warn(`Using Claude with ${r.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!r.stream && i == null) {
      const u = kd[r.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(r.max_tokens, u);
    }
    const s = Id(r.tools, r.messages);
    return this._client.post("/v1/messages?beta=true", {
      body: r,
      timeout: i ?? 6e5,
      ...t,
      headers: b([
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
      headers: b([{ "anthropic-beta": [...e.betas ?? [], "structured-outputs-2025-12-15"].toString() }, t?.headers])
    }, this.create(e, t).then((n) => $d(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return $g.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...o } = Za(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new Fd(this._client, e, t);
  }
};
function Za(e) {
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
mo.Batches = Bd;
mo.BetaToolRunner = Fd;
mo.ToolError = Ud;
var qd = class extends X {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/sessions/${e}/events?beta=true`, ve, {
      query: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  send(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/sessions/${e}/events?beta=true`, {
      body: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  stream(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/sessions/${e}/events/stream?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers]),
      stream: !0
    });
  }
}, Hd = class extends X {
  retrieve(e, t, n) {
    const { session_id: o, betas: r } = t;
    return this._client.get(L`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { session_id: o, betas: r, ...i } = t;
    return this._client.post(L`/v1/sessions/${o}/resources/${e}?beta=true`, {
      body: i,
      ...n,
      headers: b([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/sessions/${e}/resources?beta=true`, ve, {
      query: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { session_id: o, betas: r } = t;
    return this._client.delete(L`/v1/sessions/${o}/resources/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  add(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/sessions/${e}/resources?beta=true`, {
      body: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Nr = class extends X {
  constructor() {
    super(...arguments), this.events = new qd(this._client), this.resources = new Hd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/sessions?beta=true", {
      body: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/sessions/${e}?beta=true`, {
      body: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/sessions?beta=true", ve, {
      query: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/sessions/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/sessions/${e}/archive?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Nr.Events = qd;
Nr.Resources = Hd;
var Vd = class extends X {
  create(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.post(L`/v1/skills/${e}/versions?beta=true`, Ds({
      body: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    }, this._client));
  }
  retrieve(e, t, n) {
    const { skill_id: o, betas: r } = t;
    return this._client.get(L`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/skills/${e}/versions?beta=true`, ve, {
      query: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { skill_id: o, betas: r } = t;
    return this._client.delete(L`/v1/skills/${o}/versions/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...r ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
}, Ls = class extends X {
  constructor() {
    super(...arguments), this.versions = new Vd(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.post("/v1/skills?beta=true", Ds({
      body: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    }, this._client, !1));
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/skills?beta=true", ve, {
      query: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "skills-2025-10-02"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/skills/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "skills-2025-10-02"].toString() }, n?.headers])
    });
  }
};
Ls.Versions = Vd;
var Jd = class extends X {
  create(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/vaults/${e}/credentials?beta=true`, {
      body: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  retrieve(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.get(L`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { vault_id: o, betas: r, ...i } = t;
    return this._client.post(L`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      body: i,
      ...n,
      headers: b([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList(L`/v1/vaults/${e}/credentials?beta=true`, ve, {
      query: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  delete(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.delete(L`/v1/vaults/${o}/credentials/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t, n) {
    const { vault_id: o, betas: r } = t;
    return this._client.post(L`/v1/vaults/${o}/credentials/${e}/archive?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...r ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Us = class extends X {
  constructor() {
    super(...arguments), this.credentials = new Jd(this._client);
  }
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/vaults?beta=true", {
      body: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  update(e, t, n) {
    const { betas: o, ...r } = t;
    return this._client.post(L`/v1/vaults/${e}?beta=true`, {
      body: r,
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/vaults?beta=true", ve, {
      query: o,
      ...t,
      headers: b([{ "anthropic-beta": [...n ?? [], "managed-agents-2026-04-01"].toString() }, t?.headers])
    });
  }
  delete(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.delete(L`/v1/vaults/${e}?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
  archive(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.post(L`/v1/vaults/${e}/archive?beta=true`, {
      ...n,
      headers: b([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
};
Us.Credentials = Jd;
var ke = class extends X {
  constructor() {
    super(...arguments), this.models = new Rd(this._client), this.messages = new mo(this._client), this.agents = new $s(this._client), this.environments = new Cd(this._client), this.sessions = new Nr(this._client), this.vaults = new Us(this._client), this.memoryStores = new xr(this._client), this.files = new bd(this._client), this.skills = new Ls(this._client), this.userProfiles = new Pd(this._client);
  }
};
ke.Models = Rd;
ke.Messages = mo;
ke.Agents = $s;
ke.Environments = Cd;
ke.Sessions = Nr;
ke.Vaults = Us;
ke.MemoryStores = xr;
ke.Files = bd;
ke.Skills = Ls;
ke.UserProfiles = Pd;
var Kd = class extends X {
  create(e, t) {
    const { betas: n, ...o } = e;
    return this._client.post("/v1/complete", {
      body: o,
      timeout: this._client._options.timeout ?? 6e5,
      ...t,
      headers: b([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers]),
      stream: e.stream ?? !1
    });
  }
};
function Wd(e) {
  return e?.output_config?.format;
}
function ja(e, t, n) {
  const o = Wd(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((r) => r.type === "text" ? Object.defineProperty({ ...r }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : r),
    parsed_output: null
  } : zd(e, t, n);
}
function zd(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const s = Og(t, i.text);
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
function Og(e, t) {
  const n = Wd(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new G(`Failed to parse structured output: ${o}`);
  }
}
var Me, ct, Gt, Cn, No, wn, In, ko, bn, Qe, Rn, Do, $o, Et, Lo, Uo, Pn, ni, el, oi, ri, ii, si, tl, nl = "__json_buf";
function ol(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var Gg = class Di {
  constructor(t, n) {
    Me.add(this), this.messages = [], this.receivedMessages = [], ct.set(this, void 0), Gt.set(this, null), this.controller = new AbortController(), Cn.set(this, void 0), No.set(this, () => {
    }), wn.set(this, () => {
    }), In.set(this, void 0), ko.set(this, () => {
    }), bn.set(this, () => {
    }), Qe.set(this, {}), Rn.set(this, !1), Do.set(this, !1), $o.set(this, !1), Et.set(this, !1), Lo.set(this, void 0), Uo.set(this, void 0), Pn.set(this, void 0), oi.set(this, (o) => {
      if (k(this, Do, !0, "f"), ro(o) && (o = new Be()), o instanceof Be)
        return k(this, $o, !0, "f"), this._emit("abort", o);
      if (o instanceof G) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new G(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new G(String(o)));
    }), k(this, Cn, new Promise((o, r) => {
      k(this, No, o, "f"), k(this, wn, r, "f");
    }), "f"), k(this, In, new Promise((o, r) => {
      k(this, ko, o, "f"), k(this, bn, r, "f");
    }), "f"), T(this, Cn, "f").catch(() => {
    }), T(this, In, "f").catch(() => {
    }), k(this, Gt, t, "f"), k(this, Pn, n?.logger ?? console, "f");
  }
  get response() {
    return T(this, Lo, "f");
  }
  get request_id() {
    return T(this, Uo, "f");
  }
  async withResponse() {
    k(this, Et, !0, "f");
    const t = await T(this, Cn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Di(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: r } = {}) {
    const i = new Di(n, { logger: r });
    for (const s of n.messages) i._addMessageParam(s);
    return k(i, Gt, {
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
    }, T(this, oi, "f"));
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
      T(this, Me, "m", ri).call(this);
      const { response: s, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(s);
      for await (const c of u) T(this, Me, "m", ii).call(this, c);
      if (u.controller.signal?.aborted) throw new Be();
      T(this, Me, "m", si).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (k(this, Lo, t, "f"), k(this, Uo, t?.headers.get("request-id"), "f"), T(this, No, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return T(this, Rn, "f");
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
    return (T(this, Qe, "f")[t] || (T(this, Qe, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = T(this, Qe, "f")[t];
    if (!o) return this;
    const r = o.findIndex((i) => i.listener === n);
    return r >= 0 && o.splice(r, 1), this;
  }
  once(t, n) {
    return (T(this, Qe, "f")[t] || (T(this, Qe, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      k(this, Et, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    k(this, Et, !0, "f"), await T(this, In, "f");
  }
  get currentMessage() {
    return T(this, ct, "f");
  }
  async finalMessage() {
    return await this.done(), T(this, Me, "m", ni).call(this);
  }
  async finalText() {
    return await this.done(), T(this, Me, "m", el).call(this);
  }
  _emit(t, ...n) {
    if (T(this, Rn, "f")) return;
    t === "end" && (k(this, Rn, !0, "f"), T(this, ko, "f").call(this));
    const o = T(this, Qe, "f")[t];
    if (o && (T(this, Qe, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !T(this, Et, "f") && !o?.length && Promise.reject(r), T(this, wn, "f").call(this, r), T(this, bn, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !T(this, Et, "f") && !o?.length && Promise.reject(r), T(this, wn, "f").call(this, r), T(this, bn, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", T(this, Me, "m", ni).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      T(this, Me, "m", ri).call(this), this._connected(null);
      const i = io.fromReadableStream(t, this.controller);
      for await (const s of i) T(this, Me, "m", ii).call(this, s);
      if (i.controller.signal?.aborted) throw new Be();
      T(this, Me, "m", si).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(ct = /* @__PURE__ */ new WeakMap(), Gt = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), No = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), In = /* @__PURE__ */ new WeakMap(), ko = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakMap(), Qe = /* @__PURE__ */ new WeakMap(), Rn = /* @__PURE__ */ new WeakMap(), Do = /* @__PURE__ */ new WeakMap(), $o = /* @__PURE__ */ new WeakMap(), Et = /* @__PURE__ */ new WeakMap(), Lo = /* @__PURE__ */ new WeakMap(), Uo = /* @__PURE__ */ new WeakMap(), Pn = /* @__PURE__ */ new WeakMap(), oi = /* @__PURE__ */ new WeakMap(), Me = /* @__PURE__ */ new WeakSet(), ni = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, el = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new G("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, ri = function() {
    this.ended || k(this, ct, void 0, "f");
  }, ii = function(n) {
    if (this.ended) return;
    const o = T(this, Me, "m", tl).call(this, n);
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
            ol(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
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
        this._addMessageParam(o), this._addMessage(ja(o, T(this, Gt, "f"), { logger: T(this, Pn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        k(this, ct, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, si = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = T(this, ct, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return k(this, ct, void 0, "f"), ja(n, T(this, Gt, "f"), { logger: T(this, Pn, "f") });
  }, tl = function(n) {
    let o = T(this, ct, "f");
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
            if (r && ol(r)) {
              let i = r[nl] || "";
              i += n.delta.partial_json;
              const s = { ...r };
              Object.defineProperty(s, nl, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (s.input = Ld(i)), o.content[n.index] = s;
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
    return new io(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Yd = class extends X {
  create(e, t) {
    return this._client.post("/v1/messages/batches", {
      body: e,
      ...t
    });
  }
  retrieve(e, t) {
    return this._client.get(L`/v1/messages/batches/${e}`, t);
  }
  list(e = {}, t) {
    return this._client.getAPIList("/v1/messages/batches", po, {
      query: e,
      ...t
    });
  }
  delete(e, t) {
    return this._client.delete(L`/v1/messages/batches/${e}`, t);
  }
  cancel(e, t) {
    return this._client.post(L`/v1/messages/batches/${e}/cancel`, t);
  }
  async results(e, t) {
    const n = await this.retrieve(e);
    if (!n.results_url) throw new G(`No batch \`results_url\`; Has it finished processing? ${n.processing_status} - ${n.id}`);
    return this._client.get(n.results_url, {
      ...t,
      headers: b([{ Accept: "application/binary" }, t?.headers]),
      stream: !0,
      __binaryResponse: !0
    })._thenUnwrap((o, r) => Od.fromResponse(r.response, r.controller));
  }
}, Fs = class extends X {
  constructor() {
    super(...arguments), this.batches = new Yd(this._client);
  }
  create(e, t) {
    e.model in rl && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${rl[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Bg.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const r = kd[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, r);
    }
    const o = Id(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: b([o, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => zd(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Gg.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, rl = {
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
}, Bg = ["claude-mythos-preview", "claude-opus-4-6"];
Fs.Batches = Yd;
var Xd = class extends X {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get(L`/v1/models/${e}`, {
      ...n,
      headers: b([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models", po, {
      query: o,
      ...t,
      headers: b([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Fo = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, $i, Os, jo, Qd, qg = "\\n\\nHuman:", Hg = "\\n\\nAssistant:", Z = class {
  constructor({ baseURL: e = Fo("ANTHROPIC_BASE_URL"), apiKey: t = Fo("ANTHROPIC_API_KEY") ?? null, authToken: n = Fo("ANTHROPIC_AUTH_TOKEN") ?? null, ...o } = {}) {
    $i.add(this), jo.set(this, void 0);
    const r = {
      apiKey: t,
      authToken: n,
      ...o,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!r.dangerouslyAllowBrowser && og()) throw new G(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = r.baseURL, this.timeout = r.timeout ?? Os.DEFAULT_TIMEOUT, this.logger = r.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = Ga(r.logLevel, "ClientOptions.logLevel", this) ?? Ga(Fo("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = r.fetchOptions, this.maxRetries = r.maxRetries ?? 2, this.fetch = r.fetch ?? lg(), k(this, jo, cg, "f"), this._options = r, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return b([await this.apiKeyAuth(e), await this.bearerAuth(e)]);
  }
  async apiKeyAuth(e) {
    if (this.apiKey != null)
      return b([{ "X-Api-Key": this.apiKey }]);
  }
  async bearerAuth(e) {
    if (this.authToken != null)
      return b([{ Authorization: `Bearer ${this.authToken}` }]);
  }
  stringifyQuery(e) {
    return dg(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Ht}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${td()}`;
  }
  makeStatusError(e, t, n, o) {
    return Ie.generate(e, t, n, o);
  }
  buildURL(e, t, n) {
    const o = !T(this, $i, "m", Qd).call(this) && n || this.baseURL, r = jm(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), s = Object.fromEntries(r.searchParams);
    return (!ka(i) || !ka(s)) && (t = {
      ...s,
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
    return new gd(this, this.makeRequest(e, t, void 0));
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
    if (fe(this).debug(`[${c}] sending request`, Ct({
      retryOfRequestLogID: n,
      method: o.method,
      url: s,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new Be();
    const h = new AbortController(), p = await this.fetchWithTimeout(s, i, u, h).catch(Ii), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Be();
      const y = ro(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return fe(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - ${_}`), fe(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (${_})`, Ct({
          retryOfRequestLogID: n,
          url: s,
          durationMs: m - f,
          message: p.message
        })), this.retryRequest(o, t, n ?? c);
      throw fe(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - error; no more retries left`), fe(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (error; no more retries left)`, Ct({
        retryOfRequestLogID: n,
        url: s,
        durationMs: m - f,
        message: p.message
      })), y ? new nd() : new Mr({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, y]) => ", " + _ + ": " + JSON.stringify(y)).join("")}] ${i.method} ${s} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - f}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const P = `retrying, ${t} attempts remaining`;
        return await ug(p.body), fe(this).info(`${g} - ${P}`), fe(this).debug(`[${c}] response error (${P})`, Ct({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - f
        })), this.retryRequest(o, t, n ?? c, p.headers);
      }
      const y = _ ? "error; no more retries left" : "error; not retryable";
      fe(this).info(`${g} - ${y}`);
      const E = await p.text().catch((P) => Ii(P).message), C = dd(E), w = C ? void 0 : E;
      throw fe(this).debug(`[${c}] response error (${y})`, Ct({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: w,
        durationMs: Date.now() - f
      })), this.makeStatusError(p.status, C, w, p.headers);
    }
    return fe(this).info(g), fe(this).debug(`[${c}] response start`, Ct({
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
    return new Ag(this, n, e);
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
    return await ng(r), this.makeRequest(e, t - 1, n);
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
    const n = { ...e }, { method: o, path: r, query: i, defaultBaseURL: s } = n, u = this.buildURL(r, i, s);
    "timeout" in n && tg("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const i = b([
      r,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...ag(),
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
    const n = b([t]);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: e
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: hd(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : T(this, jo, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Os = Z, jo = /* @__PURE__ */ new WeakMap(), $i = /* @__PURE__ */ new WeakSet(), Qd = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
Z.Anthropic = Os;
Z.HUMAN_PROMPT = qg;
Z.AI_PROMPT = Hg;
Z.DEFAULT_TIMEOUT = 6e5;
Z.AnthropicError = G;
Z.APIError = Ie;
Z.APIConnectionError = Mr;
Z.APIConnectionTimeoutError = nd;
Z.APIUserAbortError = Be;
Z.NotFoundError = sd;
Z.ConflictError = ad;
Z.RateLimitError = ud;
Z.BadRequestError = od;
Z.AuthenticationError = rd;
Z.InternalServerError = cd;
Z.PermissionDeniedError = id;
Z.UnprocessableEntityError = ld;
Z.toFile = Ig;
var go = class extends Z {
  constructor() {
    super(...arguments), this.completions = new Kd(this), this.messages = new Fs(this), this.models = new Xd(this), this.beta = new ke(this);
  }
};
go.Completions = Kd;
go.Messages = Fs;
go.Models = Xd;
go.Beta = ke;
function Dt(e) {
  if (Array.isArray(e)) return e.map((n) => Dt(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, o]) => {
    t[n] = /^(?:authorization|proxy[-_]?authorization|(?:x[-_])?csrf(?:[-_]?token)?|token|access[-_]?token|refresh[-_]?token|id[-_]?token|api[-_]?key|x[-_](?:goog[-_])?api[-_]?key|proxy[-_]?password|password|client[-_]?secret)$/i.test(n) ? "[redacted]" : Dt(o);
  }), t;
}
function yt(e = {}, t = {}) {
  const n = t.reasoning && typeof t.reasoning == "object" ? t.reasoning : {}, o = String(e.reasoning?.mode || "inherit"), r = e.reasoning?.output === "show" || e.reasoning?.output === "hide" ? e.reasoning.output : n.output === "show" ? "show" : "hide", i = String(n.mode || t.effectiveMode || o);
  return {
    reasoningRequestedMode: o,
    reasoningRequestedOutput: r,
    reasoningProfileId: String(n.profileId || t.profileId || e.reasoning?.profileId || "unsupported"),
    reasoningEffectiveMode: i,
    reasoningEffort: i === "on" ? String(t.effort ?? n.effort ?? e.reasoning?.effort ?? "") : "",
    reasoningBudgetTokens: i === "on" && Number.isFinite(Number(t.budgetTokens ?? n.budgetTokens ?? e.reasoning?.budgetTokens)) ? Number(t.budgetTokens ?? n.budgetTokens ?? e.reasoning?.budgetTokens) : null,
    reasoningControlFields: Dt(t.controlFields || {}),
    reasoningOutputVisible: i !== "off" && n.output === "show"
  };
}
function so(e = {}) {
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
function Vg(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Jg(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function Zd(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function Kg(e) {
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
      const o = Jg(n.image_url.url);
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
function Wg(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function zg(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && Zd(t) || null;
}
function Yg(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: Zd(e.content) || [] } : void 0;
}
function il(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function sl(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: Vg(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function Xg(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const o = e[n];
    if (o.role !== "system") {
      if (o.role === "assistant") {
        const r = zg(o), i = sl(o.tool_calls);
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
        const r = [il(o)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, r.push(il(e[n]));
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
          }] : [], ...sl(o.tool_calls)]
        });
        continue;
      }
      t.push({
        role: o.role,
        content: Kg(o.content)
      });
    }
  }
  return t;
}
function Oo(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function al(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function Qg(e = "auto", t = []) {
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
var Zg = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function ai(e = {}, t = {}) {
  const n = Array.isArray(t.tools) ? t.tools : [], o = n.length ? Qg(t.toolChoice, n) : void 0, r = t.reasoning?.output, i = {
    ...Ss(t.reasoning),
    ...r === "show" || r === "hide" ? { output: r } : {}
  }, s = xs({
    provider: "anthropic",
    baseUrl: e.baseUrl,
    model: e.model
  }), u = i.mode === "on" && s.profileId === "anthropic-manual" && (o?.type === "any" || o?.type === "tool");
  return {
    toolChoice: o,
    effectiveReasoning: Q("anthropic", e, {
      ...i,
      ...u ? { mode: "off" } : {}
    }, { maxTokens: t.maxTokens }),
    reasoningDisabledForForcedTool: u
  };
}
var jg = class {
  constructor(e) {
    this.config = e, this.client = new go({
      apiKey: e.apiKey,
      baseURL: al(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = ai(this.config, e)) {
    const n = t.effectiveReasoning, o = (Array.isArray(e.tools) ? e.tools : []).map((s) => ({
      name: s.function.name,
      description: s.function.description,
      input_schema: s.function.parameters
    })), r = Wg(e), i = {
      model: this.config.model,
      system: r,
      messages: Xg(e.messages),
      ...o.length ? {
        tools: o,
        tool_choice: t.toolChoice
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !fo({
      ...this.config,
      provider: "anthropic"
    }, n) && typeof e.temperature == "number" && (i.temperature = e.temperature), n.mode === "off" ? i.thinking = { type: "disabled" } : n.mode === "on" && n.profileId === "anthropic-adaptive" ? (i.thinking = {
      type: "adaptive",
      display: K(n) ? "summarized" : "omitted"
    }, i.output_config = { effort: n.effort }) : n.mode === "on" && n.profileId === "anthropic-manual" && (i.thinking = {
      type: "enabled",
      budget_tokens: n.budgetTokens,
      display: K(n) ? "summarized" : "omitted"
    }), i;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = al(this.config.baseUrl), r = t.protocol || ai(this.config, e), i = t.body || this.buildRequestBody(e, r), s = r.effectiveReasoning;
    return {
      ...so({
        provider: "anthropic",
        model: this.config.model,
        transport: "anthropic-sdk",
        url: `${o}/v1/messages`,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey || ""
        },
        body: i,
        sdk: n ? "client.messages.stream" : "client.messages.create",
        effectiveConfig: yt(e, {
          reasoning: s,
          effort: i.output_config?.effort,
          budgetTokens: i.thinking?.budget_tokens,
          controlFields: {
            ...i.thinking ? { thinking: i.thinking } : {},
            ...i.output_config ? { output_config: i.output_config } : {}
          }
        })
      }),
      ...r.reasoningDisabledForForcedTool ? { notices: [Zg] } : {}
    };
  }
  async chat(e) {
    const t = ai(this.config, e), n = t.effectiveReasoning, o = this.buildRequestBody(e, t), r = this.inspectRequest(e, {
      body: o,
      protocol: t
    });
    let i;
    if (typeof e.onStreamProgress == "function") {
      const u = this.client.messages.stream(o, { signal: e.signal }), c = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map();
      let f = "";
      const h = () => K(n) ? Array.from(c.entries()).sort(([g], [_]) => g.localeCompare(_)).map(([g, _]) => ({
        label: g.startsWith("redacted:") ? "已脱敏思考块" : "思考块",
        text: _
      })).filter((g) => g.text) : [], p = () => Array.from(d.entries()).sort(([g], [_]) => Number(g) - Number(_)).map(([, g]) => ({
        id: g.id || "anthropic-tool-draft",
        name: g.name || "工具调用",
        arguments: g.inputJson || "{}",
        draft: !0
      })).filter((g) => g.name), m = () => {
        const g = p();
        g.length && Oo(e, {
          text: f,
          thoughts: h(),
          toolCalls: g,
          toolCallDraft: !0
        });
      };
      u.on("text", (g, _) => {
        f = _ || "", Oo(e, {
          text: f,
          thoughts: h(),
          ...p().length ? {
            toolCalls: p(),
            toolCallDraft: !0
          } : {}
        });
      }), u.on("thinking", (g, _) => {
        c.set("thinking:0", _ || ""), Oo(e, {
          thoughts: h(),
          ...p().length ? {
            text: f,
            toolCalls: p(),
            toolCallDraft: !0
          } : {}
        });
      }), u.on("streamEvent", (g) => {
        if (g?.type === "content_block_start" && g.content_block?.type === "tool_use") {
          const _ = g.content_block.input && typeof g.content_block.input == "object" ? g.content_block.input : {};
          d.set(g.index, {
            id: g.content_block.id || `anthropic-tool-draft-${g.index + 1}`,
            name: g.content_block.name || "工具调用",
            inputJson: Object.keys(_).length ? JSON.stringify(_) : ""
          }), m();
          return;
        }
        if (g?.type === "content_block_delta" && g.delta?.type === "input_json_delta") {
          const _ = d.get(g.index) || {
            id: `anthropic-tool-draft-${g.index + 1}`,
            name: "工具调用",
            inputJson: ""
          };
          d.set(g.index, {
            ..._,
            inputJson: `${_.inputJson || ""}${g.delta.partial_json || ""}`
          }), m();
        }
      }), u.on("contentBlock", (g) => {
        g?.type === "redacted_thinking" && (c.set("redacted:0", g.data || ""), Oo(e, {
          thoughts: h(),
          ...p().length ? {
            text: f,
            toolCalls: p(),
            toolCallDraft: !0
          } : {}
        }));
      }), i = await u.finalMessage();
    } else i = await this.client.messages.create(o, { signal: e.signal });
    const s = (i.content || []).filter((u) => u.type === "tool_use" && u.name).map((u, c) => ({
      id: u.id || `anthropic-tool-${c + 1}`,
      name: u.name,
      arguments: JSON.stringify(u.input || {})
    }));
    return {
      text: (i.content || []).filter((u) => u.type === "text").map((u) => u.text || "").join(`
`),
      toolCalls: s,
      thoughts: K(n) ? (i.content || []).filter((u) => u.type === "thinking" || u.type === "redacted_thinking").map((u) => ({
        label: u.type === "thinking" ? "思考块" : "已脱敏思考块",
        text: u.type === "thinking" ? u.thinking || "" : u.data || ""
      })).filter((u) => u.text) : [],
      finishReason: i.stop_reason || "stop",
      model: i.model || this.config.model,
      provider: "anthropic",
      providerPayload: Yg(i),
      requestInspection: r
    };
  }
}, e_ = /* @__PURE__ */ Pr(((e, t) => {
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
})), t_ = /* @__PURE__ */ Pr(((e) => {
  var t = e_();
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
})), n_ = /* @__PURE__ */ Pr(((e, t) => {
  t.exports = t_();
})), o_ = /* @__PURE__ */ Pr(((e, t) => {
  var n = n_(), o = [
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
})), ll = /* @__PURE__ */ bm(o_(), 1), r_ = void 0, i_ = void 0;
function s_() {
  return {
    geminiUrl: r_,
    vertexUrl: i_
  };
}
function a_(e, t, n, o) {
  var r, i;
  if (!e?.baseUrl) {
    const s = s_();
    return t ? (r = s.vertexUrl) !== null && r !== void 0 ? r : n : (i = s.geminiUrl) !== null && i !== void 0 ? i : o;
  }
  return e.baseUrl;
}
var it = class {
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
function l_(e, t) {
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
    Li(e, r, i, 0, s);
  }
}
function Li(e, t, n, o, r) {
  if (o >= t.length || typeof e != "object" || e === null) return;
  const i = t[o];
  if (i.endsWith("[]")) {
    const s = i.slice(0, -2), u = e;
    if (s in u && Array.isArray(u[s])) for (const c of u[s]) Li(c, t, n, o + 1, r);
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
    i in s && Li(s[i], t, n, o + 1, r);
  }
}
function Gs(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function u_(e) {
  const t = {}, n = a(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const o = a(e, ["resourceName"]);
  return o != null && l(t, ["_url", "resourceName"], o), t;
}
function c_(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response", "generateVideoResponse"]);
  return s != null && l(t, ["response"], f_(s)), t;
}
function d_(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], h_(s)), t;
}
function f_(e) {
  const t = {}, n = a(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => p_(s))), l(t, ["generatedVideos"], i);
  }
  const o = a(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const r = a(e, ["raiMediaFilteredReasons"]);
  return r != null && l(t, ["raiMediaFilteredReasons"], r), t;
}
function h_(e) {
  const t = {}, n = a(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((s) => m_(s))), l(t, ["generatedVideos"], i);
  }
  const o = a(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const r = a(e, ["raiMediaFilteredReasons"]);
  return r != null && l(t, ["raiMediaFilteredReasons"], r), t;
}
function p_(e) {
  const t = {}, n = a(e, ["video"]);
  return n != null && l(t, ["video"], T_(n)), t;
}
function m_(e) {
  const t = {}, n = a(e, ["_self"]);
  return n != null && l(t, ["video"], S_(n)), t;
}
function g_(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function __(e) {
  const t = {}, n = a(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function y_(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], v_(s)), t;
}
function v_(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = a(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function jd(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], A_(s)), t;
}
function A_(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = a(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function T_(e) {
  const t = {}, n = a(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const o = a(e, ["encodedVideo"]);
  o != null && l(t, ["videoBytes"], Gs(o));
  const r = a(e, ["encoding"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function S_(e) {
  const t = {}, n = a(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const o = a(e, ["bytesBase64Encoded"]);
  o != null && l(t, ["videoBytes"], Gs(o));
  const r = a(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
var ul;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(ul || (ul = {}));
var cl;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(cl || (cl = {}));
var dl;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(dl || (dl = {}));
var mt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(mt || (mt = {}));
var fl;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(fl || (fl = {}));
var hl;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(hl || (hl = {}));
var pl;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(pl || (pl = {}));
var ml;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(ml || (ml = {}));
var gl;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(gl || (gl = {}));
var _l;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(_l || (_l = {}));
var yl;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(yl || (yl = {}));
var Yt;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(Yt || (Yt = {}));
var Xt;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(Xt || (Xt = {}));
var vl;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(vl || (vl = {}));
var Al;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Al || (Al = {}));
var Tl;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(Tl || (Tl = {}));
var Sl;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Sl || (Sl = {}));
var El;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(El || (El = {}));
var Cl;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Cl || (Cl = {}));
var wl;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(wl || (wl = {}));
var Il;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Il || (Il = {}));
var bl;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(bl || (bl = {}));
var Rl;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Rl || (Rl = {}));
var Pl;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(Pl || (Pl = {}));
var fr;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(fr || (fr = {}));
var Ml;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Ml || (Ml = {}));
var xl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(xl || (xl = {}));
var Nl;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Nl || (Nl = {}));
var kl;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})(kl || (kl = {}));
var Ui;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(Ui || (Ui = {}));
var Dl;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Dl || (Dl = {}));
var $l;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})($l || ($l = {}));
var Ll;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(Ll || (Ll = {}));
var Ul;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Fl || (Fl = {}));
var Ol;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(Ol || (Ol = {}));
var Gl;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(Gl || (Gl = {}));
var Fi;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(Fi || (Fi = {}));
var Bl;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(Bl || (Bl = {}));
var ql;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(ql || (ql = {}));
var hr;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(hr || (hr = {}));
var Hl;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(Hl || (Hl = {}));
var Vl;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(Vl || (Vl = {}));
var Jl;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(Jl || (Jl = {}));
var Kl;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(Kl || (Kl = {}));
var Wl;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(Wl || (Wl = {}));
var zl;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(zl || (zl = {}));
var Yl;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(Xl || (Xl = {}));
var Ql;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(Ql || (Ql = {}));
var Zl;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(Zl || (Zl = {}));
var jl;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(jl || (jl = {}));
var eu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(eu || (eu = {}));
var tu;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(tu || (tu = {}));
var nu;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(nu || (nu = {}));
var ou;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(ou || (ou = {}));
var ru;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(ru || (ru = {}));
var iu;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(iu || (iu = {}));
var su;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(su || (su = {}));
var au;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(au || (au = {}));
var lu;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(lu || (lu = {}));
var uu;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(uu || (uu = {}));
var cu;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(cu || (cu = {}));
var du;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(du || (du = {}));
var Qt;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(Qt || (Qt = {}));
var Oi = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Mn = class {
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
}, fu = class {
}, hu = class {
}, E_ = class {
}, C_ = class {
}, w_ = class {
}, I_ = class {
}, pu = class {
}, mu = class {
}, gu = class {
}, b_ = class {
}, _u = class ef {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new ef();
    let r;
    const i = t;
    return n ? r = d_(i) : r = c_(i), Object.assign(o, r), o;
  }
}, yu = class {
}, vu = class {
}, Au = class {
}, Tu = class {
}, R_ = class {
}, P_ = class {
}, M_ = class {
}, x_ = class tf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new tf(), r = y_(t);
    return Object.assign(o, r), o;
  }
}, N_ = class {
}, k_ = class {
}, D_ = class {
}, $_ = class {
}, Su = class {
}, L_ = class {
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
}, U_ = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, F_ = class nf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new nf(), r = jd(t);
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
function of(e, t) {
  const n = V(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function rf(e) {
  return Array.isArray(e) ? e.map((t) => pr(t)) : [pr(e)];
}
function pr(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function sf(e) {
  const t = pr(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function af(e) {
  const t = pr(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function Eu(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function lf(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => Eu(t)) : [Eu(e)];
}
function Gi(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Cu(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function wu(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function re(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return Gi(e) ? e : {
    role: "user",
    parts: lf(e)
  };
}
function Bs(e, t) {
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
    if (Cu(e) || wu(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [re(e)];
  }
  const t = [], n = [], o = Gi(e[0]);
  for (const r of e) {
    const i = Gi(r);
    if (i != o) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(r);
    else {
      if (Cu(r) || wu(r)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(r);
    }
  }
  return o || t.push({
    role: "user",
    parts: lf(n)
  }), t;
}
function O_(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((o) => o !== "null");
  if (n.length === 1) t.type = Object.values(mt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : mt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const o of n) t.anyOf.push({ type: Object.values(mt).includes(o.toUpperCase()) ? o.toUpperCase() : mt.TYPE_UNSPECIFIED });
  }
}
function on(e) {
  const t = {}, n = ["items"], o = ["anyOf"], r = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && O_(e.type, t);
  for (const [s, u] of Object.entries(e))
    if (u != null)
      if (s == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(mt).includes(u.toUpperCase()) ? u.toUpperCase() : mt.TYPE_UNSPECIFIED;
      } else if (n.includes(s)) t[s] = on(u);
      else if (o.includes(s)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(on(d));
        }
        t[s] = c;
      } else if (r.includes(s)) {
        const c = {};
        for (const [d, f] of Object.entries(u)) c[d] = on(f);
        t[s] = c;
      } else {
        if (s === "additionalProperties") continue;
        t[s] = u;
      }
  return t;
}
function qs(e) {
  return on(e);
}
function Hs(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function Vs(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function ln(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = on(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = on(t.response));
  return e;
}
function un(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function G_(e, t, n, o = 1) {
  const r = !t.startsWith(`${n}/`) && t.split("/").length === o;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : r ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : r ? `${n}/${t}` : t;
}
function st(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return G_(e, t, "cachedContents");
}
function uf(e) {
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
function At(e) {
  return Gs(e);
}
function B_(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function q_(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function H_(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function cf(e) {
  var t;
  let n;
  if (B_(e) && (n = e.name), !(H_(e) && (n = e.uri, n === void 0)) && !(q_(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const o = n.split("files/")[1].match(/[a-z0-9]+/);
      if (o === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = o[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function df(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function ff(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (V_(e, t)) return e[t];
  return [];
}
function V_(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function J_(e, t = {}) {
  const n = e, o = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (o.responseJsonSchema = n.outputSchema), t.behavior && (o.behavior = t.behavior), { functionDeclarations: [o] };
}
function K_(e, t = {}) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = r.name;
    if (o.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    o.add(i);
    const s = J_(r, t);
    s.functionDeclarations && n.push(...s.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function hf(e, t) {
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
function W_(e) {
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
function pf(e) {
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
function cn(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function mf(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function z_(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function Y_(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function X_(e) {
  const t = {}, n = a(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const o = a(e, ["inlinedResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => My(s))), l(t, ["inlinedResponses"], i);
  }
  const r = a(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function Q_(e) {
  const t = {}, n = a(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const o = a(e, ["gcsDestination", "outputUriPrefix"]);
  o != null && l(t, ["gcsUri"], o);
  const r = a(e, ["bigqueryDestination", "outputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function Z_(e) {
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
function er(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata", "displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = a(e, ["metadata", "state"]);
  r != null && l(t, ["state"], mf(r));
  const i = a(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const s = a(e, ["metadata", "endTime"]);
  s != null && l(t, ["endTime"], s);
  const u = a(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = a(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = a(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], X_(pf(d))), t;
}
function Bi(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = a(e, ["state"]);
  r != null && l(t, ["state"], mf(r));
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
  h != null && l(t, ["src"], j_(h));
  const p = a(e, ["outputConfig"]);
  p != null && l(t, ["dest"], Q_(pf(p)));
  const m = a(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function j_(e) {
  const t = {}, n = a(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const o = a(e, ["gcsSource", "uris"]);
  o != null && l(t, ["gcsUri"], o);
  const r = a(e, ["bigquerySource", "inputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function ey(e, t) {
  const n = {};
  if (a(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (a(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (a(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = a(t, ["fileName"]);
  o != null && l(n, ["fileName"], o);
  const r = a(t, ["inlinedRequests"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => Py(e, s))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function ty(e) {
  const t = {}, n = a(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const o = a(e, ["gcsUri"]);
  o != null && l(t, ["gcsSource", "uris"], o);
  const r = a(e, ["bigqueryUri"]);
  if (r != null && l(t, ["bigquerySource", "inputUri"], r), a(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (a(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function ny(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function oy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], cn(e, o)), n;
}
function ry(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], cn(e, o)), n;
}
function iy(e) {
  const t = {}, n = a(e, ["content"]);
  n != null && l(t, ["content"], n);
  const o = a(e, ["citationMetadata"]);
  o != null && l(t, ["citationMetadata"], sy(o));
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
function sy(e) {
  const t = {}, n = a(e, ["citationSources"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["citations"], o);
  }
  return t;
}
function gf(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Uy(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function ay(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  if (t !== void 0 && o != null && l(t, ["batch", "displayName"], o), a(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const r = a(e, ["webhookConfig"]);
  return t !== void 0 && r != null && l(t, ["batch", "webhookConfig"], r), n;
}
function ly(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const r = a(e, ["dest"]);
  if (t !== void 0 && r != null && l(t, ["outputConfig"], Z_(W_(r))), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Iu(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["_url", "model"], V(e, o));
  const r = a(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], ey(e, hf(e, r)));
  const i = a(t, ["config"]);
  return i != null && ay(i, n), n;
}
function uy(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["model"], V(e, o));
  const r = a(t, ["src"]);
  r != null && l(n, ["inputConfig"], ty(hf(e, r)));
  const i = a(t, ["config"]);
  return i != null && ly(i, n), n;
}
function cy(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["batch", "displayName"], o), n;
}
function dy(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["_url", "model"], V(e, o));
  const r = a(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], yy(e, r));
  const i = a(t, ["config"]);
  return i != null && cy(i, n), n;
}
function fy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], cn(e, o)), n;
}
function hy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], cn(e, o)), n;
}
function py(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function my(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function gy(e, t) {
  const n = {}, o = a(t, ["contents"]);
  if (o != null) {
    let i = Bs(e, o);
    Array.isArray(i) && (i = i.map((s) => s)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const r = a(t, ["config"]);
  return r != null && (l(n, ["_self"], _y(r, n)), l_(n, { "requests[].*": "requests[].request.*" })), n;
}
function _y(e, t) {
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
function yy(e, t) {
  const n = {}, o = a(t, ["fileName"]);
  o != null && l(n, ["file_name"], o);
  const r = a(t, ["inlinedRequests"]);
  return r != null && l(n, ["requests"], gy(e, r)), n;
}
function vy(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Ay(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Ty(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = a(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Sy(e, t, n) {
  const o = {}, r = a(t, ["systemInstruction"]);
  n !== void 0 && r != null && l(n, ["systemInstruction"], gf(re(r)));
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
  E != null && l(o, ["responseSchema"], qs(E));
  const C = a(t, ["responseJsonSchema"]);
  if (C != null && l(o, ["responseJsonSchema"], C), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const w = a(t, ["safetySettings"]);
  if (n !== void 0 && w != null) {
    let J = w;
    Array.isArray(J) && (J = J.map((W) => Fy(W))), l(n, ["safetySettings"], J);
  }
  const P = a(t, ["tools"]);
  if (n !== void 0 && P != null) {
    let J = un(P);
    Array.isArray(J) && (J = J.map((W) => Gy(ln(W)))), l(n, ["tools"], J);
  }
  const M = a(t, ["toolConfig"]);
  if (n !== void 0 && M != null && l(n, ["toolConfig"], Oy(M)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const A = a(t, ["cachedContent"]);
  n !== void 0 && A != null && l(n, ["cachedContent"], st(e, A));
  const $ = a(t, ["responseModalities"]);
  $ != null && l(o, ["responseModalities"], $);
  const I = a(t, ["mediaResolution"]);
  I != null && l(o, ["mediaResolution"], I);
  const x = a(t, ["speechConfig"]);
  if (x != null && l(o, ["speechConfig"], Hs(x)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const F = a(t, ["thinkingConfig"]);
  F != null && l(o, ["thinkingConfig"], F);
  const H = a(t, ["imageConfig"]);
  H != null && l(o, ["imageConfig"], Ry(H));
  const ue = a(t, ["enableEnhancedCivicAnswers"]);
  if (ue != null && l(o, ["enableEnhancedCivicAnswers"], ue), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const ie = a(t, ["serviceTier"]);
  return n !== void 0 && ie != null && l(n, ["serviceTier"], ie), o;
}
function Ey(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((f) => iy(f))), l(t, ["candidates"], d);
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
function Cy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], cn(e, o)), n;
}
function wy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], cn(e, o)), n;
}
function Iy(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Y_(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function by(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Ry(e) {
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
function Py(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["request", "model"], V(e, o));
  const r = a(t, ["contents"]);
  if (r != null) {
    let u = _e(r);
    Array.isArray(u) && (u = u.map((c) => gf(c))), l(n, ["request", "contents"], u);
  }
  const i = a(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const s = a(t, ["config"]);
  return s != null && l(n, ["request", "generationConfig"], Sy(e, s, a(n, ["request"], {}))), n;
}
function My(e) {
  const t = {}, n = a(e, ["response"]);
  n != null && l(t, ["response"], Ey(n));
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["error"]);
  return r != null && l(t, ["error"], r), t;
}
function xy(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  if (t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), a(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function Ny(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  t !== void 0 && r != null && l(t, ["_query", "pageToken"], r);
  const i = a(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function ky(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && xy(n, t), t;
}
function Dy(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && Ny(n, t), t;
}
function $y(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = a(e, ["operations"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => er(s))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Ly(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = a(e, ["batchPredictionJobs"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => Bi(s))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Uy(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], vy(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], Ay(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], ny(c));
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
function Fy(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = a(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function Oy(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = a(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], Ty(o));
  const r = a(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function Gy(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], by(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Iy(i));
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
var rt;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(rt || (rt = {}));
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
}, By = class extends it {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Lt(rt.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Iu(this.apiClient, e), n = t._url, o = N("{model}:batchGenerateContent", n), r = t.batch.inputConfig.requests, i = r.requests, s = [];
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
      const c = uy(this.apiClient, e);
      return s = N("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Bi(d));
    } else {
      const c = Iu(this.apiClient, e);
      return s = N("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => er(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = dy(this.apiClient, e);
      return r = N("{model}:asyncBatchEmbedContent", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => er(u));
    }
  }
  async get(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = wy(this.apiClient, e);
      return s = N("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Bi(d));
    } else {
      const c = Cy(this.apiClient, e);
      return s = N("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => er(d));
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i = "", s = {};
    if (this.apiClient.isVertexAI()) {
      const u = ry(this.apiClient, e);
      i = N("batchPredictionJobs/{name}:cancel", u._url), s = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: s,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = oy(this.apiClient, e);
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
      const c = Dy(e);
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
        const f = Ly(d), h = new Su();
        return Object.assign(h, f), h;
      });
    } else {
      const c = ky(e);
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
        const f = $y(d), h = new Su();
        return Object.assign(h, f), h;
      });
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = hy(this.apiClient, e);
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
      })), i.then((d) => my(d));
    } else {
      const c = fy(this.apiClient, e);
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
      })), i.then((d) => py(d));
    }
  }
};
function qy(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function Hy(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function bu(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => fv(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Ru(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => hv(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Vy(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  t !== void 0 && r != null && l(t, ["expireTime"], r);
  const i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let f = _e(s);
    Array.isArray(f) && (f = f.map((h) => bu(h))), l(t, ["contents"], f);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], bu(re(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((h) => gv(h))), l(t, ["tools"], f);
  }
  const d = a(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], pv(d)), a(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function Jy(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  t !== void 0 && r != null && l(t, ["expireTime"], r);
  const i = a(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const s = a(e, ["contents"]);
  if (t !== void 0 && s != null) {
    let h = _e(s);
    Array.isArray(h) && (h = h.map((p) => Ru(p))), l(t, ["contents"], h);
  }
  const u = a(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Ru(re(u)));
  const c = a(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((p) => _v(p))), l(t, ["tools"], h);
  }
  const d = a(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], mv(d));
  const f = a(e, ["kmsKeyName"]);
  return t !== void 0 && f != null && l(t, ["encryption_spec", "kmsKeyName"], f), n;
}
function Ky(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["model"], of(e, o));
  const r = a(t, ["config"]);
  return r != null && Vy(r, n), n;
}
function Wy(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["model"], of(e, o));
  const r = a(t, ["config"]);
  return r != null && Jy(r, n), n;
}
function zy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], st(e, o)), n;
}
function Yy(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], st(e, o)), n;
}
function Xy(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Qy(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Zy(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function jy(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function ev(e) {
  const t = {}, n = a(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = a(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function tv(e) {
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
function nv(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], st(e, o)), n;
}
function ov(e, t) {
  const n = {}, o = a(t, ["name"]);
  return o != null && l(n, ["_url", "name"], st(e, o)), n;
}
function rv(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], qy(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function iv(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function sv(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function av(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function lv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && sv(n, t), t;
}
function uv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && av(n, t), t;
}
function cv(e) {
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
function dv(e) {
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
function fv(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], Zy(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], jy(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], Hy(c));
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
function hv(e) {
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
function pv(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = a(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], ev(o));
  const r = a(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function mv(e) {
  const t = {}, n = a(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = a(e, ["functionCallingConfig"]);
  if (o != null && l(t, ["functionCallingConfig"], o), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function gv(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], iv(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], rv(i));
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
function _v(e) {
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
    Array.isArray(p) && (p = p.map((m) => tv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const f = a(e, ["parallelAiSearch"]);
  f != null && l(t, ["parallelAiSearch"], f);
  const h = a(e, ["urlContext"]);
  if (h != null && l(t, ["urlContext"], h), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function yv(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function vv(e, t) {
  const n = {}, o = a(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = a(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function Av(e, t) {
  const n = {}, o = a(t, ["name"]);
  o != null && l(n, ["_url", "name"], st(e, o));
  const r = a(t, ["config"]);
  return r != null && yv(r, n), n;
}
function Tv(e, t) {
  const n = {}, o = a(t, ["name"]);
  o != null && l(n, ["_url", "name"], st(e, o));
  const r = a(t, ["config"]);
  return r != null && vv(r, n), n;
}
var Sv = class extends it {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Lt(rt.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Wy(this.apiClient, e);
      return s = N("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Ky(this.apiClient, e);
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
      const c = ov(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = nv(this.apiClient, e);
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
      const c = Yy(this.apiClient, e);
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
        const f = Qy(d), h = new Au();
        return Object.assign(h, f), h;
      });
    } else {
      const c = zy(this.apiClient, e);
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
        const f = Xy(d), h = new Au();
        return Object.assign(h, f), h;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Tv(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Av(this.apiClient, e);
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
      const c = uv(e);
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
        const f = dv(d), h = new Tu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = lv(e);
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
        const f = cv(d), h = new Tu();
        return Object.assign(h, f), h;
      });
    }
  }
};
function gt(e, t) {
  var n = {};
  for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, o = Object.getOwnPropertySymbols(e); r < o.length; r++) t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]);
  return n;
}
function Pu(e) {
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
function qe(e, t, n) {
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
    m.value instanceof B ? Promise.resolve(m.value.v).then(f, h) : p(i[0][2], m);
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
function He(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof Pu == "function" ? Pu(e) : e[Symbol.iterator](), n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
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
function Ev(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : _f(n);
}
function _f(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function Cv(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Mu(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let o = 0;
  for (; o < n; ) if (e[o].role === "user")
    t.push(e[o]), o++;
  else {
    const r = [];
    let i = !0;
    for (; o < n && e[o].role === "model"; )
      r.push(e[o]), i && !_f(e[o]) && (i = !1), o++;
    i ? t.push(...r) : t.pop();
  }
  return t;
}
var wv = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new Iv(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, Iv = class {
  constructor(e, t, n, o = {}, r = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = o, this.history = r, this.sendPromise = Promise.resolve(), Cv(r);
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
    const t = e ? Mu(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return qe(this, arguments, function* () {
      var o, r, i, s, u, c;
      const d = [];
      try {
        for (var f = !0, h = He(e), p; p = yield B(h.next()), o = p.done, !o; f = !0) {
          s = p.value, f = !1;
          const m = s;
          if (Ev(m)) {
            const g = (c = (u = m.candidates) === null || u === void 0 ? void 0 : u[0]) === null || c === void 0 ? void 0 : c.content;
            g !== void 0 && d.push(g);
          }
          yield yield B(m);
        }
      } catch (m) {
        r = { error: m };
      } finally {
        try {
          !f && !o && (i = h.return) && (yield B(i.call(h)));
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
    }), n && n.length > 0 ? this.history.push(...Mu(n)) : this.history.push(e), this.history.push(...o);
  }
}, yf = class vf extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, vf.prototype);
  }
};
function bv(e) {
  const t = {}, n = a(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function Rv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Pv(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], cf(n)), t;
}
function Mv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function xv(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "file"], cf(n)), t;
}
function Nv(e) {
  const t = {}, n = a(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function kv(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function Dv(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && kv(n, t), t;
}
function $v(e) {
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
function Lv(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["files"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(t, ["files"], r);
  }
  return t;
}
var Uv = class extends it {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Lt(rt.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const s = Dv(e);
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
        const c = $v(u), d = new N_();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = bv(e);
      return r = N("upload/v1beta/files", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = Rv(u), d = new k_();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = xv(e);
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
      const s = Pv(e);
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
        const c = Mv(u), d = new D_();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = Nv(e);
      return r = N("files:register", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = Lv(u), d = new $_();
        return Object.assign(d, c), d;
      });
    }
  }
};
function xu(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function Fv(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function tr(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Ov(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => nA(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Gv(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => oA(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Bv(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function qv(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function Hv(e) {
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
function Vv(e) {
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
  const w = a(e, ["stopSequences"]);
  w != null && l(t, ["stopSequences"], w);
  const P = a(e, ["temperature"]);
  P != null && l(t, ["temperature"], P);
  const M = a(e, ["thinkingConfig"]);
  M != null && l(t, ["thinkingConfig"], M);
  const A = a(e, ["topK"]);
  A != null && l(t, ["topK"], A);
  const $ = a(e, ["topP"]);
  if ($ != null && l(t, ["topP"], $), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return t;
}
function Jv(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Fv(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Kv(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Wv(e, t) {
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
  ], Vs(h));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Ov(re(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let I = un(_);
    Array.isArray(I) && (I = I.map((x) => sA(ln(x)))), l(t, ["setup", "tools"], I);
  }
  const y = a(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], iA(y));
  const E = a(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], xu(E));
  const C = a(e, ["outputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "outputAudioTranscription"], xu(C));
  const w = a(e, ["realtimeInputConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "realtimeInputConfig"], w);
  const P = a(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const M = a(e, ["proactivity"]);
  if (t !== void 0 && M != null && l(t, ["setup", "proactivity"], M), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const A = a(e, ["avatarConfig"]);
  t !== void 0 && A != null && l(t, ["setup", "avatarConfig"], A);
  const $ = a(e, ["safetySettings"]);
  if (t !== void 0 && $ != null) {
    let I = $;
    Array.isArray(I) && (I = I.map((x) => rA(x))), l(t, ["setup", "safetySettings"], I);
  }
  return n;
}
function zv(e, t) {
  const n = {}, o = a(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], Vv(o));
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
  ], Vs(h));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Gv(re(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let x = un(_);
    Array.isArray(x) && (x = x.map((F) => aA(ln(F)))), l(t, ["setup", "tools"], x);
  }
  const y = a(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], y);
  const E = a(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], E);
  const C = a(e, ["outputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "outputAudioTranscription"], C);
  const w = a(e, ["realtimeInputConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "realtimeInputConfig"], w);
  const P = a(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const M = a(e, ["proactivity"]);
  t !== void 0 && M != null && l(t, ["setup", "proactivity"], M);
  const A = a(e, ["explicitVadSignal"]);
  t !== void 0 && A != null && l(t, ["setup", "explicitVadSignal"], A);
  const $ = a(e, ["avatarConfig"]);
  t !== void 0 && $ != null && l(t, ["setup", "avatarConfig"], $);
  const I = a(e, ["safetySettings"]);
  if (t !== void 0 && I != null) {
    let x = I;
    Array.isArray(x) && (x = x.map((F) => F)), l(t, ["setup", "safetySettings"], x);
  }
  return n;
}
function Yv(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["setup", "model"], V(e, o));
  const r = a(t, ["config"]);
  return r != null && l(n, ["config"], Wv(r, n)), n;
}
function Xv(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["setup", "model"], V(e, o));
  const r = a(t, ["config"]);
  return r != null && l(n, ["config"], zv(r, n)), n;
}
function Qv(e) {
  const t = {}, n = a(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function Zv(e) {
  const t = {}, n = a(e, ["weightedPrompts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["weightedPrompts"], o);
  }
  return t;
}
function jv(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = rf(n);
    Array.isArray(d) && (d = d.map((f) => tr(f))), l(t, ["mediaChunks"], d);
  }
  const o = a(e, ["audio"]);
  o != null && l(t, ["audio"], tr(af(o)));
  const r = a(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = a(e, ["video"]);
  i != null && l(t, ["video"], tr(sf(i)));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function eA(e) {
  const t = {}, n = a(e, ["media"]);
  if (n != null) {
    let d = rf(n);
    Array.isArray(d) && (d = d.map((f) => f)), l(t, ["mediaChunks"], d);
  }
  const o = a(e, ["audio"]);
  o != null && l(t, ["audio"], af(o));
  const r = a(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = a(e, ["video"]);
  i != null && l(t, ["video"], sf(i));
  const s = a(e, ["text"]);
  s != null && l(t, ["text"], s);
  const u = a(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = a(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function tA(e) {
  const t = {}, n = a(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const o = a(e, ["serverContent"]);
  o != null && l(t, ["serverContent"], o);
  const r = a(e, ["toolCall"]);
  r != null && l(t, ["toolCall"], r);
  const i = a(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const s = a(e, ["usageMetadata"]);
  s != null && l(t, ["usageMetadata"], lA(s));
  const u = a(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = a(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = a(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const f = a(e, ["voiceActivity"]);
  return f != null && l(t, ["voiceActivity"], uA(f)), t;
}
function nA(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], Bv(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], qv(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], tr(c));
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
function oA(e) {
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
function rA(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = a(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function iA(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function sA(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], Kv(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Jv(i));
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
function aA(e) {
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
    Array.isArray(p) && (p = p.map((m) => Hv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = a(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const f = a(e, ["parallelAiSearch"]);
  f != null && l(t, ["parallelAiSearch"], f);
  const h = a(e, ["urlContext"]);
  if (h != null && l(t, ["urlContext"], h), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function lA(e) {
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
function uA(e) {
  const t = {}, n = a(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function cA(e, t) {
  const n = {}, o = a(e, ["apiKey"]);
  if (o != null && l(n, ["apiKey"], o), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function dA(e, t) {
  const n = {}, o = a(e, ["data"]);
  if (o != null && l(n, ["data"], o), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function fA(e, t) {
  const n = {}, o = a(e, ["content"]);
  o != null && l(n, ["content"], o);
  const r = a(e, ["citationMetadata"]);
  r != null && l(n, ["citationMetadata"], hA(r));
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
function hA(e, t) {
  const n = {}, o = a(e, ["citationSources"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(n, ["citations"], r);
  }
  return n;
}
function pA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let s = _e(i);
    Array.isArray(s) && (s = s.map((u) => dn(u))), l(o, ["contents"], s);
  }
  return o;
}
function mA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["tokensInfo"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function gA(e, t) {
  const n = {}, o = a(e, ["values"]);
  o != null && l(n, ["values"], o);
  const r = a(e, ["statistics"]);
  return r != null && l(n, ["statistics"], _A(r)), n;
}
function _A(e, t) {
  const n = {}, o = a(e, ["truncated"]);
  o != null && l(n, ["truncated"], o);
  const r = a(e, ["token_count"]);
  return r != null && l(n, ["tokenCount"], r), n;
}
function _o(e, t) {
  const n = {}, o = a(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => IT(s))), l(n, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function dn(e, t) {
  const n = {}, o = a(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => bT(s))), l(n, ["parts"], i);
  }
  const r = a(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function yA(e, t) {
  const n = {}, o = a(e, ["controlType"]);
  o != null && l(n, ["controlType"], o);
  const r = a(e, ["enableControlImageComputation"]);
  return r != null && l(n, ["computeControl"], r), n;
}
function vA(e, t) {
  const n = {};
  if (a(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (a(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (a(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function AA(e, t, n) {
  const o = {}, r = a(e, ["systemInstruction"]);
  t !== void 0 && r != null && l(t, ["systemInstruction"], dn(re(r)));
  const i = a(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => Ef(c))), l(t, ["tools"], u);
  }
  const s = a(e, ["generationConfig"]);
  return t !== void 0 && s != null && l(t, ["generationConfig"], dT(s)), o;
}
function TA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = _e(i);
    Array.isArray(u) && (u = u.map((c) => _o(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && vA(s), o;
}
function SA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = _e(i);
    Array.isArray(u) && (u = u.map((c) => dn(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && AA(s, o), o;
}
function EA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["totalTokens"]);
  r != null && l(n, ["totalTokens"], r);
  const i = a(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function CA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["totalTokens"]);
  return r != null && l(n, ["totalTokens"], r), n;
}
function wA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function IA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function bA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function RA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function PA(e, t, n) {
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
  const w = a(e, ["editMode"]);
  t !== void 0 && w != null && l(t, ["parameters", "editMode"], w);
  const P = a(e, ["baseSteps"]);
  return t !== void 0 && P != null && l(t, [
    "parameters",
    "editConfig",
    "baseSteps"
  ], P), o;
}
function MA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["referenceImages"]);
  if (s != null) {
    let c = s;
    Array.isArray(c) && (c = c.map((d) => kT(d))), l(o, ["instances[0]", "referenceImages"], c);
  }
  const u = a(t, ["config"]);
  return u != null && PA(u, o), o;
}
function xA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => kr(s))), l(n, ["generatedImages"], i);
  }
  return n;
}
function NA(e, t, n) {
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
function kA(e, t, n) {
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
function DA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let d = Bs(e, i);
    Array.isArray(d) && (d = d.map((f) => f)), l(o, ["requests[]", "content"], d);
  }
  const s = a(t, ["content"]);
  s != null && _o(re(s));
  const u = a(t, ["config"]);
  u != null && NA(u, o);
  const c = a(t, ["model"]);
  return c !== void 0 && l(o, ["requests[]", "model"], V(e, c)), o;
}
function $A(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  let i = a(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = a(t, ["contents"]);
    if (c != null) {
      let d = Bs(e, c);
      Array.isArray(d) && (d = d.map((f) => f)), l(o, ["instances[]", "content"], d);
    }
  }
  let s = a(n, ["embeddingApiType"]);
  if (s === void 0 && (s = "PREDICT"), s === "EMBED_CONTENT") {
    const c = a(t, ["content"]);
    c != null && l(o, ["content"], dn(re(c)));
  }
  const u = a(t, ["config"]);
  return u != null && kA(u, o, n), o;
}
function LA(e, t) {
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
function UA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions[]", "embeddings"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => gA(u))), l(n, ["embeddings"], s);
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
function FA(e, t) {
  const n = {}, o = a(e, ["endpoint"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["deployedModelId"]);
  return r != null && l(n, ["deployedModelId"], r), n;
}
function OA(e, t) {
  const n = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["fileUri"]);
  o != null && l(n, ["fileUri"], o);
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function GA(e, t) {
  const n = {}, o = a(e, ["id"]);
  o != null && l(n, ["id"], o);
  const r = a(e, ["args"]);
  r != null && l(n, ["args"], r);
  const i = a(e, ["name"]);
  if (i != null && l(n, ["name"], i), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function BA(e, t) {
  const n = {}, o = a(e, ["allowedFunctionNames"]);
  o != null && l(n, ["allowedFunctionNames"], o);
  const r = a(e, ["mode"]);
  if (r != null && l(n, ["mode"], r), a(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function qA(e, t) {
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
function HA(e, t, n, o) {
  const r = {}, i = a(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], _o(re(i)));
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
  C != null && l(r, ["responseSchema"], qs(C));
  const w = a(t, ["responseJsonSchema"]);
  if (w != null && l(r, ["responseJsonSchema"], w), a(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (a(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = a(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let W = P;
    Array.isArray(W) && (W = W.map((pe) => DT(pe))), l(n, ["safetySettings"], W);
  }
  const M = a(t, ["tools"]);
  if (n !== void 0 && M != null) {
    let W = un(M);
    Array.isArray(W) && (W = W.map((pe) => qT(ln(pe)))), l(n, ["tools"], W);
  }
  const A = a(t, ["toolConfig"]);
  if (n !== void 0 && A != null && l(n, ["toolConfig"], GT(A)), a(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const $ = a(t, ["cachedContent"]);
  n !== void 0 && $ != null && l(n, ["cachedContent"], st(e, $));
  const I = a(t, ["responseModalities"]);
  I != null && l(r, ["responseModalities"], I);
  const x = a(t, ["mediaResolution"]);
  x != null && l(r, ["mediaResolution"], x);
  const F = a(t, ["speechConfig"]);
  if (F != null && l(r, ["speechConfig"], Hs(F)), a(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = a(t, ["thinkingConfig"]);
  H != null && l(r, ["thinkingConfig"], H);
  const ue = a(t, ["imageConfig"]);
  ue != null && l(r, ["imageConfig"], gT(ue));
  const ie = a(t, ["enableEnhancedCivicAnswers"]);
  if (ie != null && l(r, ["enableEnhancedCivicAnswers"], ie), a(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const J = a(t, ["serviceTier"]);
  return n !== void 0 && J != null && l(n, ["serviceTier"], J), r;
}
function VA(e, t, n, o) {
  const r = {}, i = a(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], dn(re(i)));
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
  C != null && l(r, ["responseSchema"], qs(C));
  const w = a(t, ["responseJsonSchema"]);
  w != null && l(r, ["responseJsonSchema"], w);
  const P = a(t, ["routingConfig"]);
  P != null && l(r, ["routingConfig"], P);
  const M = a(t, ["modelSelectionConfig"]);
  M != null && l(r, ["modelConfig"], M);
  const A = a(t, ["safetySettings"]);
  if (n !== void 0 && A != null) {
    let Le = A;
    Array.isArray(Le) && (Le = Le.map((Xr) => Xr)), l(n, ["safetySettings"], Le);
  }
  const $ = a(t, ["tools"]);
  if (n !== void 0 && $ != null) {
    let Le = un($);
    Array.isArray(Le) && (Le = Le.map((Xr) => Ef(ln(Xr)))), l(n, ["tools"], Le);
  }
  const I = a(t, ["toolConfig"]);
  n !== void 0 && I != null && l(n, ["toolConfig"], BT(I));
  const x = a(t, ["labels"]);
  n !== void 0 && x != null && l(n, ["labels"], x);
  const F = a(t, ["cachedContent"]);
  n !== void 0 && F != null && l(n, ["cachedContent"], st(e, F));
  const H = a(t, ["responseModalities"]);
  H != null && l(r, ["responseModalities"], H);
  const ue = a(t, ["mediaResolution"]);
  ue != null && l(r, ["mediaResolution"], ue);
  const ie = a(t, ["speechConfig"]);
  ie != null && l(r, ["speechConfig"], Hs(ie));
  const J = a(t, ["audioTimestamp"]);
  J != null && l(r, ["audioTimestamp"], J);
  const W = a(t, ["thinkingConfig"]);
  W != null && l(r, ["thinkingConfig"], W);
  const pe = a(t, ["imageConfig"]);
  if (pe != null && l(r, ["imageConfig"], _T(pe)), a(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Je = a(t, ["modelArmorConfig"]);
  n !== void 0 && Je != null && l(n, ["modelArmorConfig"], Je);
  const $e = a(t, ["serviceTier"]);
  return n !== void 0 && $e != null && l(n, ["serviceTier"], $e), r;
}
function Nu(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = _e(i);
    Array.isArray(u) && (u = u.map((c) => _o(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(o, ["generationConfig"], HA(e, s, o)), o;
}
function ku(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["contents"]);
  if (i != null) {
    let u = _e(i);
    Array.isArray(u) && (u = u.map((c) => dn(c))), l(o, ["contents"], u);
  }
  const s = a(t, ["config"]);
  return s != null && l(o, ["generationConfig"], VA(e, s, o)), o;
}
function Du(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["candidates"]);
  if (r != null) {
    let f = r;
    Array.isArray(f) && (f = f.map((h) => fA(h))), l(n, ["candidates"], f);
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
function $u(e, t) {
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
function JA(e, t, n) {
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
function KA(e, t, n) {
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
  const w = a(e, ["imageSize"]);
  t !== void 0 && w != null && l(t, ["parameters", "sampleImageSize"], w);
  const P = a(e, ["enhancePrompt"]);
  return t !== void 0 && P != null && l(t, ["parameters", "enhancePrompt"], P), o;
}
function WA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["config"]);
  return s != null && JA(s, o), o;
}
function zA(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["config"]);
  return s != null && KA(s, o), o;
}
function YA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => aT(u))), l(n, ["generatedImages"], s);
  }
  const i = a(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Tf(i)), n;
}
function XA(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let s = r;
    Array.isArray(s) && (s = s.map((u) => kr(u))), l(n, ["generatedImages"], s);
  }
  const i = a(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Sf(i)), n;
}
function QA(e, t, n) {
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
  t !== void 0 && h != null && l(t, ["instances[0]", "lastFrame"], Dr(h));
  const p = a(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => tS(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (a(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (a(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (a(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = a(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), o;
}
function ZA(e, t, n) {
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
  t !== void 0 && y != null && l(t, ["instances[0]", "lastFrame"], Ve(y));
  const E = a(e, ["referenceImages"]);
  if (t !== void 0 && E != null) {
    let M = E;
    Array.isArray(M) && (M = M.map((A) => nS(A))), l(t, ["instances[0]", "referenceImages"], M);
  }
  const C = a(e, ["mask"]);
  t !== void 0 && C != null && l(t, ["instances[0]", "mask"], eS(C));
  const w = a(e, ["compressionQuality"]);
  t !== void 0 && w != null && l(t, ["parameters", "compressionQuality"], w);
  const P = a(e, ["labels"]);
  if (t !== void 0 && P != null && l(t, ["labels"], P), a(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return o;
}
function jA(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(n, ["done"], i);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], oT(u)), n;
}
function eT(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const i = a(e, ["done"]);
  i != null && l(n, ["done"], i);
  const s = a(e, ["error"]);
  s != null && l(n, ["error"], s);
  const u = a(e, ["response"]);
  return u != null && l(n, ["response"], rT(u)), n;
}
function tT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["image"]);
  s != null && l(o, ["instances[0]", "image"], Dr(s));
  const u = a(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], Cf(u));
  const c = a(t, ["source"]);
  c != null && iT(c, o);
  const d = a(t, ["config"]);
  return d != null && QA(d, o), o;
}
function nT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const s = a(t, ["image"]);
  s != null && l(o, ["instances[0]", "image"], Ve(s));
  const u = a(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], wf(u));
  const c = a(t, ["source"]);
  c != null && sT(c, o);
  const d = a(t, ["config"]);
  return d != null && ZA(d, o), o;
}
function oT(e, t) {
  const n = {}, o = a(e, ["generatedSamples"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => uT(u))), l(n, ["generatedVideos"], s);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function rT(e, t) {
  const n = {}, o = a(e, ["videos"]);
  if (o != null) {
    let s = o;
    Array.isArray(s) && (s = s.map((u) => cT(u))), l(n, ["generatedVideos"], s);
  }
  const r = a(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = a(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function iT(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Dr(i));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], Cf(s)), o;
}
function sT(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Ve(i));
  const s = a(e, ["video"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "video"], wf(s)), o;
}
function aT(e, t) {
  const n = {}, o = a(e, ["_self"]);
  o != null && l(n, ["image"], yT(o));
  const r = a(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = a(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], Tf(i)), n;
}
function kr(e, t) {
  const n = {}, o = a(e, ["_self"]);
  o != null && l(n, ["image"], Af(o));
  const r = a(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = a(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], Sf(i));
  const s = a(e, ["prompt"]);
  return s != null && l(n, ["enhancedPrompt"], s), n;
}
function lT(e, t) {
  const n = {}, o = a(e, ["_self"]);
  o != null && l(n, ["mask"], Af(o));
  const r = a(e, ["labels"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => s)), l(n, ["labels"], i);
  }
  return n;
}
function uT(e, t) {
  const n = {}, o = a(e, ["video"]);
  return o != null && l(n, ["video"], ZT(o)), n;
}
function cT(e, t) {
  const n = {}, o = a(e, ["_self"]);
  return o != null && l(n, ["video"], jT(o)), n;
}
function dT(e, t) {
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
  const w = a(e, ["speechConfig"]);
  w != null && l(n, ["speechConfig"], w);
  const P = a(e, ["stopSequences"]);
  P != null && l(n, ["stopSequences"], P);
  const M = a(e, ["temperature"]);
  M != null && l(n, ["temperature"], M);
  const A = a(e, ["thinkingConfig"]);
  A != null && l(n, ["thinkingConfig"], A);
  const $ = a(e, ["topK"]);
  $ != null && l(n, ["topK"], $);
  const I = a(e, ["topP"]);
  if (I != null && l(n, ["topP"], I), a(e, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  return n;
}
function fT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function hT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function pT(e, t) {
  const n = {}, o = a(e, ["authConfig"]);
  o != null && l(n, ["authConfig"], cA(o));
  const r = a(e, ["enableWidget"]);
  return r != null && l(n, ["enableWidget"], r), n;
}
function mT(e, t) {
  const n = {}, o = a(e, ["searchTypes"]);
  if (o != null && l(n, ["searchTypes"], o), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = a(e, ["timeRangeFilter"]);
  return r != null && l(n, ["timeRangeFilter"], r), n;
}
function gT(e, t) {
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
function _T(e, t) {
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
function yT(e, t) {
  const n = {}, o = a(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], At(o));
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function Af(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = a(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], At(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Dr(e, t) {
  const n = {};
  if (a(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const o = a(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], At(o));
  const r = a(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function Ve(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = a(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], At(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function vT(e, t, n, o) {
  const r = {}, i = a(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], df(e, c)), r;
}
function AT(e, t, n, o) {
  const r = {}, i = a(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const s = a(t, ["pageToken"]);
  n !== void 0 && s != null && l(n, ["_query", "pageToken"], s);
  const u = a(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = a(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], df(e, c)), r;
}
function TT(e, t, n) {
  const o = {}, r = a(t, ["config"]);
  return r != null && vT(e, r, o), o;
}
function ST(e, t, n) {
  const o = {}, r = a(t, ["config"]);
  return r != null && AT(e, r, o), o;
}
function ET(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["_self"]);
  if (i != null) {
    let s = ff(i);
    Array.isArray(s) && (s = s.map((u) => qi(u))), l(n, ["models"], s);
  }
  return n;
}
function CT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["_self"]);
  if (i != null) {
    let s = ff(i);
    Array.isArray(s) && (s = s.map((u) => Hi(u))), l(n, ["models"], s);
  }
  return n;
}
function wT(e, t) {
  const n = {}, o = a(e, ["maskMode"]);
  o != null && l(n, ["maskMode"], o);
  const r = a(e, ["segmentationClasses"]);
  r != null && l(n, ["maskClasses"], r);
  const i = a(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function qi(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = a(e, ["displayName"]);
  r != null && l(n, ["displayName"], r);
  const i = a(e, ["description"]);
  i != null && l(n, ["description"], i);
  const s = a(e, ["version"]);
  s != null && l(n, ["version"], s);
  const u = a(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], HT(u));
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
function Hi(e, t) {
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
    Array.isArray(p) && (p = p.map((m) => FA(m))), l(n, ["endpoints"], p);
  }
  const c = a(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = a(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], VT(d));
  const f = a(e, ["defaultCheckpointId"]);
  f != null && l(n, ["defaultCheckpointId"], f);
  const h = a(e, ["checkpoints"]);
  if (h != null) {
    let p = h;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function IT(e, t) {
  const n = {}, o = a(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const r = a(e, ["codeExecutionResult"]);
  r != null && l(n, ["codeExecutionResult"], r);
  const i = a(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const s = a(e, ["fileData"]);
  s != null && l(n, ["fileData"], OA(s));
  const u = a(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], GA(u));
  const c = a(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = a(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], dA(d));
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
function bT(e, t) {
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
function RT(e, t) {
  const n = {}, o = a(e, ["productImage"]);
  return o != null && l(n, ["image"], Ve(o)), n;
}
function PT(e, t, n) {
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
function MT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["source"]);
  i != null && NT(i, o);
  const s = a(t, ["config"]);
  return s != null && PT(s, o), o;
}
function xT(e, t) {
  const n = {}, o = a(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => kr(i))), l(n, ["generatedImages"], r);
  }
  return n;
}
function NT(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], Ve(i));
  const s = a(e, ["productImages"]);
  if (t !== void 0 && s != null) {
    let u = s;
    Array.isArray(u) && (u = u.map((c) => RT(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return o;
}
function kT(e, t) {
  const n = {}, o = a(e, ["referenceImage"]);
  o != null && l(n, ["referenceImage"], Ve(o));
  const r = a(e, ["referenceId"]);
  r != null && l(n, ["referenceId"], r);
  const i = a(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const s = a(e, ["maskImageConfig"]);
  s != null && l(n, ["maskImageConfig"], wT(s));
  const u = a(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], yA(u));
  const c = a(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = a(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function Tf(e, t) {
  const n = {}, o = a(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = a(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = a(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function Sf(e, t) {
  const n = {}, o = a(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = a(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = a(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function DT(e, t) {
  const n = {}, o = a(e, ["category"]);
  if (o != null && l(n, ["category"], o), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = a(e, ["threshold"]);
  return r != null && l(n, ["threshold"], r), n;
}
function $T(e, t) {
  const n = {}, o = a(e, ["image"]);
  return o != null && l(n, ["image"], Ve(o)), n;
}
function LT(e, t, n) {
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
function UT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["source"]);
  i != null && OT(i, o);
  const s = a(t, ["config"]);
  return s != null && LT(s, o), o;
}
function FT(e, t) {
  const n = {}, o = a(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => lT(i))), l(n, ["generatedMasks"], r);
  }
  return n;
}
function OT(e, t, n) {
  const o = {}, r = a(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = a(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Ve(i));
  const s = a(e, ["scribbleImage"]);
  return t !== void 0 && s != null && l(t, ["instances[0]", "scribble"], $T(s)), o;
}
function GT(e, t) {
  const n = {}, o = a(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = a(e, ["functionCallingConfig"]);
  r != null && l(n, ["functionCallingConfig"], BA(r));
  const i = a(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function BT(e, t) {
  const n = {}, o = a(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = a(e, ["functionCallingConfig"]);
  if (r != null && l(n, ["functionCallingConfig"], r), a(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function qT(e, t) {
  const n = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = a(e, ["computerUse"]);
  o != null && l(n, ["computerUse"], o);
  const r = a(e, ["fileSearch"]);
  r != null && l(n, ["fileSearch"], r);
  const i = a(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], mT(i));
  const s = a(e, ["googleMaps"]);
  s != null && l(n, ["googleMaps"], pT(s));
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
function Ef(e, t) {
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
    Array.isArray(m) && (m = m.map((g) => qA(g))), l(n, ["functionDeclarations"], m);
  }
  const f = a(e, ["googleSearchRetrieval"]);
  f != null && l(n, ["googleSearchRetrieval"], f);
  const h = a(e, ["parallelAiSearch"]);
  h != null && l(n, ["parallelAiSearch"], h);
  const p = a(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), a(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function HT(e, t) {
  const n = {}, o = a(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = a(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function VT(e, t) {
  const n = {}, o = a(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = a(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function JT(e, t, n) {
  const o = {}, r = a(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = a(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), o;
}
function KT(e, t, n) {
  const o = {}, r = a(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = a(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const s = a(e, ["defaultCheckpointId"]);
  return t !== void 0 && s != null && l(t, ["defaultCheckpointId"], s), o;
}
function WT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "name"], V(e, r));
  const i = a(t, ["config"]);
  return i != null && JT(i, o), o;
}
function zT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["config"]);
  return i != null && KT(i, o), o;
}
function YT(e, t, n) {
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
function XT(e, t, n) {
  const o = {}, r = a(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = a(t, ["image"]);
  i != null && l(o, ["instances[0]", "image"], Ve(i));
  const s = a(t, ["upscaleFactor"]);
  s != null && l(o, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], s);
  const u = a(t, ["config"]);
  return u != null && YT(u, o), o;
}
function QT(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((s) => kr(s))), l(n, ["generatedImages"], i);
  }
  return n;
}
function ZT(e, t) {
  const n = {}, o = a(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = a(e, ["encodedVideo"]);
  r != null && l(n, ["videoBytes"], At(r));
  const i = a(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function jT(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["uri"], o);
  const r = a(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["videoBytes"], At(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function eS(e, t) {
  const n = {}, o = a(e, ["image"]);
  o != null && l(n, ["_self"], Ve(o));
  const r = a(e, ["maskMode"]);
  return r != null && l(n, ["maskMode"], r), n;
}
function tS(e, t) {
  const n = {}, o = a(e, ["image"]);
  o != null && l(n, ["image"], Dr(o));
  const r = a(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function nS(e, t) {
  const n = {}, o = a(e, ["image"]);
  o != null && l(n, ["image"], Ve(o));
  const r = a(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function Cf(e, t) {
  const n = {}, o = a(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = a(e, ["videoBytes"]);
  r != null && l(n, ["encodedVideo"], At(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function wf(e, t) {
  const n = {}, o = a(e, ["uri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = a(e, ["videoBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], At(r));
  const i = a(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function oS(e, t) {
  const n = {}, o = a(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["displayName"], o), n;
}
function rS(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && oS(n, t), t;
}
function iS(e, t) {
  const n = {}, o = a(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function sS(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = a(e, ["config"]);
  return o != null && iS(o, t), t;
}
function aS(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function lS(e, t) {
  const n = {}, o = a(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((s) => s)), l(t, ["customMetadata"], i);
  }
  const r = a(e, ["chunkingConfig"]);
  return t !== void 0 && r != null && l(t, ["chunkingConfig"], r), n;
}
function uS(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = a(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = a(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = a(e, ["error"]);
  i != null && l(t, ["error"], i);
  const s = a(e, ["response"]);
  return s != null && l(t, ["response"], dS(s)), t;
}
function cS(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = a(e, ["fileName"]);
  o != null && l(t, ["fileName"], o);
  const r = a(e, ["config"]);
  return r != null && lS(r, t), t;
}
function dS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = a(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = a(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function fS(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function hS(e) {
  const t = {}, n = a(e, ["config"]);
  return n != null && fS(n, t), t;
}
function pS(e) {
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
function If(e, t) {
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
function mS(e) {
  const t = {}, n = a(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = a(e, ["config"]);
  return o != null && If(o, t), t;
}
function gS(e) {
  const t = {}, n = a(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var _S = "Content-Type", yS = "X-Server-Timeout", vS = "User-Agent", Vi = "x-goog-api-client", AS = "google-genai-sdk/1.50.1", TS = "v1beta1", SS = "v1beta", ES = /* @__PURE__ */ new Set(["us", "eu"]), CS = 5, wS = [
  408,
  429,
  500,
  502,
  503,
  504
], IS = class {
  constructor(e) {
    var t, n, o;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const r = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (r.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? r.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && ES.has(this.clientOptions.location) ? r.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (r.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), r.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : TS;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), r.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : SS, r.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === Fi.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
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
    return t && t.extraBody !== null && bS(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Lu(o), new Oi(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Lu(o), this.processStreamResponse(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  processStreamResponse(e) {
    return qe(this, arguments, function* () {
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
          const { done: c, value: d } = yield B(o.read());
          if (c) {
            if (i.trim().length > 0) throw new Error("Incomplete JSON segment at the end");
            break;
          }
          const f = r.decode(d, { stream: !0 });
          try {
            const m = JSON.parse(f);
            if ("error" in m) {
              const g = JSON.parse(JSON.stringify(m.error)), _ = g.status, y = g.code, E = `got status: ${_}. ${JSON.stringify(m)}`;
              if (y >= 400 && y < 600) throw new yf({
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
                yield yield B(new Oi(new Response(_, {
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
      throw wS.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new ll.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, ll.default)(r, { retries: ((n = o.attempts) !== null && n !== void 0 ? n : CS) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = AS + " " + this.clientOptions.userAgentExtra;
    return e[vS] = t, e[Vi] = t, e[_S] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [o, r] of Object.entries(e.headers)) n.append(o, r);
      e.timeout && e.timeout > 0 && n.append(yS, String(Math.ceil(e.timeout / 1e3)));
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
    n != null && If(n, f);
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
async function Lu(e) {
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
    throw n >= 400 && n < 600 ? new yf({
      message: r,
      status: n
    }) : new Error(r);
  }
}
function bS(e, t) {
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
var RS = "mcp_used/unknown", PS = !1;
function bf(e) {
  for (const t of e)
    if (MS(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return PS;
}
function Rf(e) {
  var t;
  e[Vi] = (((t = e[Vi]) !== null && t !== void 0 ? t : "") + ` ${RS}`).trimStart();
}
function MS(e) {
  return e !== null && typeof e == "object" && e instanceof NS;
}
function xS(e) {
  return qe(this, arguments, function* (n, o = 100) {
    let r, i = 0;
    for (; i < o; ) {
      const s = yield B(n.listTools({ cursor: r }));
      for (const u of s.tools)
        yield yield B(u), i++;
      if (!s.nextCursor) break;
      r = s.nextCursor;
    }
  });
}
var NS = class Pf {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Pf(t, n);
  }
  async initialize() {
    var t, n, o, r;
    if (this.mcpTools.length > 0) return;
    const i = {}, s = [];
    for (const f of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, He(xS(f))), d; d = await c.next(), t = d.done, !t; u = !0) {
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
    return await this.initialize(), K_(this.mcpTools, this.config);
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
async function kS(e, t, n) {
  const o = new U_();
  let r;
  n.data instanceof Blob ? r = JSON.parse(await n.data.text()) : r = JSON.parse(n.data), Object.assign(o, r), t(o);
}
var DS = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const o = this.apiClient.getWebsocketBaseUrl(), r = this.apiClient.getApiVersion(), i = US(this.apiClient.getDefaultHeaders()), s = `${o}/ws/google.ai.generativelanguage.${r}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, f = function() {
      u({});
    }, h = this.apiClient, p = {
      onopen: f,
      onmessage: (_) => {
        kS(h, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(s, LS(i), p);
    m.connect(), await c;
    const g = { setup: { model: V(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new $S(m, this.apiClient);
  }
}, $S = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = Zv(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = Qv(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(Qt.PLAY);
  }
  pause() {
    this.sendPlaybackControl(Qt.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(Qt.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(Qt.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function LS(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function US(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var FS = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function OS(e, t, n) {
  const o = new L_();
  let r;
  n.data instanceof Blob ? r = await n.data.text() : n.data instanceof ArrayBuffer ? r = new TextDecoder().decode(n.data) : r = n.data;
  const i = JSON.parse(r);
  if (e.isVertexAI()) {
    const s = tA(i);
    Object.assign(o, s);
  } else Object.assign(o, i);
  t(o);
}
var GS = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new DS(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, o, r, i, s;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const f = this.apiClient.getHeaders();
    e.config && e.config.tools && bf(e.config.tools) && Rf(f);
    const h = VS(f);
    if (this.apiClient.isVertexAI()) {
      const I = this.apiClient.getProject(), x = this.apiClient.getLocation(), F = this.apiClient.getApiKey(), H = !!I && !!x || !!F;
      this.apiClient.getCustomBaseUrl() && !H ? d = u : (d = `${u}/ws/google.cloud.aiplatform.${c}.LlmBidiService/BidiGenerateContent`, await this.auth.addAuthHeaders(h, d));
    } else {
      const I = this.apiClient.getApiKey();
      let x = "BidiGenerateContent", F = "key";
      I?.startsWith("auth_tokens/") && (console.warn("Warning: Ephemeral token support is experimental and may change in future versions."), c !== "v1alpha" && console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection."), x = "BidiGenerateContentConstrained", F = "access_token"), d = `${u}/ws/google.ai.generativelanguage.${c}.GenerativeService.${x}?${F}=${I}`;
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
        OS(y, g.onmessage, I);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(I) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(I) {
      }
    }, C = this.webSocketFactory.create(d, HS(h), E);
    C.connect(), await m;
    let w = V(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && w.startsWith("publishers/")) {
      const I = this.apiClient.getProject(), x = this.apiClient.getLocation();
      I && x && (w = `projects/${I}/locations/${x}/` + w);
    }
    let P = {};
    this.apiClient.isVertexAI() && ((o = e.config) === null || o === void 0 ? void 0 : o.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [fr.AUDIO] } : e.config.responseModalities = [fr.AUDIO]), !((r = e.config) === null || r === void 0) && r.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    const M = (s = (i = e.config) === null || i === void 0 ? void 0 : i.tools) !== null && s !== void 0 ? s : [], A = [];
    for (const I of M) if (this.isCallableTool(I)) {
      const x = I;
      A.push(await x.tool());
    } else A.push(I);
    A.length > 0 && (e.config.tools = A);
    const $ = {
      model: w,
      config: e.config,
      callbacks: e.callbacks
    };
    return this.apiClient.isVertexAI() ? P = Xv(this.apiClient, $) : P = Yv(this.apiClient, $), delete P.config, C.send(JSON.stringify(P)), new qS(C, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, BS = { turnComplete: !0 }, qS = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = _e(t.turns), e.isVertexAI() || (n = n.map((o) => _o(o)));
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
      if (!e.isVertexAI() && !("id" in o)) throw new Error(FS);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, BS), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: eA(e) } : t = { realtimeInput: jv(e) }, this.conn.send(JSON.stringify(t));
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
function HS(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function VS(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var Uu = 10;
function Fu(e) {
  var t, n, o;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let r = !1;
  for (const s of (n = e?.tools) !== null && n !== void 0 ? n : []) if (rn(s)) {
    r = !0;
    break;
  }
  if (!r) return !0;
  const i = (o = e?.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function rn(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function JS(e) {
  var t, n, o;
  return (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((r) => rn(r))) !== null && o !== void 0 ? o : !1;
}
function Ou(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((o, r) => {
    if (rn(o)) return;
    const i = o;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(r);
  }), n;
}
function Gu(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var KS = class extends it {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = _e(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = _e(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const o = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: hr.EMBED_CONTENT
        });
        return await this.embedContentInternal(o);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: hr.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, o, r, i, s;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !JS(t) || Fu(t.config)) return await this.generateContentInternal(u);
      const c = Ou(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, f;
      const h = _e(u.contents), p = (r = (o = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && r !== void 0 ? r : Uu;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const y of (s = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && s !== void 0 ? s : []) if (rn(y)) {
          const E = await y.callTool(d.functionCalls);
          _.push(...E);
        }
        m++, f = {
          role: "user",
          parts: _
        }, u.contents = _e(u.contents), u.contents.push(g), u.contents.push(f), Gu(u.config) && (h.push(g), h.push(f));
      }
      return Gu(u.config) && (d.automaticFunctionCallingHistory = h), d;
    }, this.generateContentStream = async (t) => {
      var n, o, r, i, s;
      if (this.maybeMoveToResponseJsonSchem(t), Fu(t.config)) {
        const f = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(f);
      }
      const u = Ou(t);
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
      return new Lt(rt.PAGED_ITEM_MODELS, (r) => this.listInternal(r), await this.listInternal(o), o);
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
    const i = await Promise.all(r.map(async (u) => rn(u) ? await u.tool() : u)), s = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (s.config.tools = i, e.config && e.config.tools && bf(e.config.tools)) {
      const u = (o = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && o !== void 0 ? o : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), Rf(c), s.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return s;
  }
  async initAfcToolsMap(e) {
    var t, n, o;
    const r = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (rn(i)) {
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
    const r = (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && o !== void 0 ? o : Uu;
    let i = !1, s = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, f) {
      return qe(this, arguments, function* () {
        for (var h, p, m, g, _, y; s < r; ) {
          i && (s++, i = !1);
          const P = yield B(c.processParamsMaybeAddMcpUsage(f)), M = yield B(c.generateContentStreamInternal(P)), A = [], $ = [];
          try {
            for (var E = !0, C = (p = void 0, He(M)), w; w = yield B(C.next()), h = w.done, !h; E = !0) {
              g = w.value, E = !1;
              const I = g;
              if (yield yield B(I), I.candidates && (!((_ = I.candidates[0]) === null || _ === void 0) && _.content)) {
                $.push(I.candidates[0].content);
                for (const x of (y = I.candidates[0].content.parts) !== null && y !== void 0 ? y : []) if (s < r && x.functionCall) {
                  if (!x.functionCall.name) throw new Error("Function call name was not returned by the model.");
                  if (d.has(x.functionCall.name)) {
                    const F = yield B(d.get(x.functionCall.name).callTool([x.functionCall]));
                    A.push(...F);
                  } else
                    throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${d.keys()}, mising tool: ${x.functionCall.name}`);
                }
              }
            }
          } catch (I) {
            p = { error: I };
          } finally {
            try {
              !E && !h && (m = C.return) && (yield B(m.call(C)));
            } finally {
              if (p) throw p.error;
            }
          }
          if (A.length > 0) {
            i = !0;
            const I = new Mn();
            I.candidates = [{ content: {
              role: "user",
              parts: A
            } }], yield yield B(I);
            const x = [];
            x.push(...$), x.push({
              role: "user",
              parts: A
            }), f.contents = _e(f.contents).concat(x);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ku(this.apiClient, e);
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
        const f = $u(d), h = new Mn();
        return Object.assign(h, f), h;
      });
    } else {
      const c = Nu(this.apiClient, e);
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
        const f = Du(d), h = new Mn();
        return Object.assign(h, f), h;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ku(this.apiClient, e);
      return s = N("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return qe(this, arguments, function* () {
          var f, h, p, m;
          try {
            for (var g = !0, _ = He(d), y; y = yield B(_.next()), f = y.done, !f; g = !0) {
              m = y.value, g = !1;
              const E = m, C = $u(yield B(E.json()), e);
              C.sdkHttpResponse = { headers: E.headers };
              const w = new Mn();
              Object.assign(w, C), yield yield B(w);
            }
          } catch (E) {
            h = { error: E };
          } finally {
            try {
              !g && !f && (p = _.return) && (yield B(p.call(_)));
            } finally {
              if (h) throw h.error;
            }
          }
        });
      });
    } else {
      const c = Nu(this.apiClient, e);
      return s = N("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }), i.then(function(d) {
        return qe(this, arguments, function* () {
          var f, h, p, m;
          try {
            for (var g = !0, _ = He(d), y; y = yield B(_.next()), f = y.done, !f; g = !0) {
              m = y.value, g = !1;
              const E = m, C = Du(yield B(E.json()), e);
              C.sdkHttpResponse = { headers: E.headers };
              const w = new Mn();
              Object.assign(w, C), yield yield B(w);
            }
          } catch (E) {
            h = { error: E };
          } finally {
            try {
              !g && !f && (p = _.return) && (yield B(p.call(_)));
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
      const c = $A(this.apiClient, e, e);
      return s = N(z_(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const f = UA(d, e), h = new fu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = DA(this.apiClient, e);
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
        const f = LA(d), h = new fu();
        return Object.assign(h, f), h;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = zA(this.apiClient, e);
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
        const f = XA(d), h = new hu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = WA(this.apiClient, e);
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
        const f = YA(d), h = new hu();
        return Object.assign(h, f), h;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = MA(this.apiClient, e);
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
        const c = xA(u), d = new E_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = XT(this.apiClient, e);
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
        const c = QT(u), d = new C_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = MT(this.apiClient, e);
      return r = N("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = xT(u), d = new w_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = UT(this.apiClient, e);
      return r = N("{model}:predict", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = FT(u), d = new I_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = hT(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Hi(d));
    } else {
      const c = fT(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => qi(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ST(this.apiClient, e);
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
        const f = CT(d), h = new pu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = TT(this.apiClient, e);
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
        const f = ET(d), h = new pu();
        return Object.assign(h, f), h;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = zT(this.apiClient, e);
      return s = N("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Hi(d));
    } else {
      const c = WT(this.apiClient, e);
      return s = N("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => qi(d));
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = IA(this.apiClient, e);
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
        const f = RA(d), h = new mu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = wA(this.apiClient, e);
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
        const f = bA(d), h = new mu();
        return Object.assign(h, f), h;
      });
    }
  }
  async countTokens(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = SA(this.apiClient, e);
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
        const f = CA(d), h = new gu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = TA(this.apiClient, e);
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
        const f = EA(d), h = new gu();
        return Object.assign(h, f), h;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = pA(this.apiClient, e);
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
        const c = mA(u), d = new b_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = nT(this.apiClient, e);
      return s = N("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const f = eT(d), h = new _u();
        return Object.assign(h, f), h;
      });
    } else {
      const c = tT(this.apiClient, e);
      return s = N("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const f = jA(d), h = new _u();
        return Object.assign(h, f), h;
      });
    }
  }
}, WS = class extends it {
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
      const c = __(e);
      return s = N("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: s,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = g_(e);
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
      const s = u_(e);
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
function Bu(e) {
  const t = {};
  if (a(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function zS(e) {
  const t = {}, n = a(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), a(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (a(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (a(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (a(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (a(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function YS(e) {
  const t = {}, n = a(e, ["data"]);
  if (n != null && l(t, ["data"], n), a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function XS(e) {
  const t = {}, n = a(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => iE(i))), l(t, ["parts"], r);
  }
  const o = a(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function QS(e, t, n) {
  const o = {}, r = a(t, ["expireTime"]);
  n !== void 0 && r != null && l(n, ["expireTime"], r);
  const i = a(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const s = a(t, ["uses"]);
  n !== void 0 && s != null && l(n, ["uses"], s);
  const u = a(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], rE(e, u));
  const c = a(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), o;
}
function ZS(e, t) {
  const n = {}, o = a(t, ["config"]);
  return o != null && l(n, ["config"], QS(e, o, n)), n;
}
function jS(e) {
  const t = {};
  if (a(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = a(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = a(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function eE(e) {
  const t = {}, n = a(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = a(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = a(e, ["name"]);
  if (r != null && l(t, ["name"], r), a(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (a(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function tE(e) {
  const t = {}, n = a(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], zS(n));
  const o = a(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function nE(e) {
  const t = {}, n = a(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), a(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (a(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = a(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function oE(e, t) {
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
  ], Vs(h));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], XS(re(g)));
  const _ = a(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let I = un(_);
    Array.isArray(I) && (I = I.map((x) => lE(ln(x)))), l(t, ["setup", "tools"], I);
  }
  const y = a(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], aE(y));
  const E = a(e, ["inputAudioTranscription"]);
  t !== void 0 && E != null && l(t, ["setup", "inputAudioTranscription"], Bu(E));
  const C = a(e, ["outputAudioTranscription"]);
  t !== void 0 && C != null && l(t, ["setup", "outputAudioTranscription"], Bu(C));
  const w = a(e, ["realtimeInputConfig"]);
  t !== void 0 && w != null && l(t, ["setup", "realtimeInputConfig"], w);
  const P = a(e, ["contextWindowCompression"]);
  t !== void 0 && P != null && l(t, ["setup", "contextWindowCompression"], P);
  const M = a(e, ["proactivity"]);
  if (t !== void 0 && M != null && l(t, ["setup", "proactivity"], M), a(e, ["explicitVadSignal"]) !== void 0) throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  const A = a(e, ["avatarConfig"]);
  t !== void 0 && A != null && l(t, ["setup", "avatarConfig"], A);
  const $ = a(e, ["safetySettings"]);
  if (t !== void 0 && $ != null) {
    let I = $;
    Array.isArray(I) && (I = I.map((x) => sE(x))), l(t, ["setup", "safetySettings"], I);
  }
  return n;
}
function rE(e, t) {
  const n = {}, o = a(t, ["model"]);
  o != null && l(n, ["setup", "model"], V(e, o));
  const r = a(t, ["config"]);
  return r != null && l(n, ["config"], oE(r, n)), n;
}
function iE(e) {
  const t = {}, n = a(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = a(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = a(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = a(e, ["fileData"]);
  i != null && l(t, ["fileData"], jS(i));
  const s = a(e, ["functionCall"]);
  s != null && l(t, ["functionCall"], eE(s));
  const u = a(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = a(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], YS(c));
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
function sE(e) {
  const t = {}, n = a(e, ["category"]);
  if (n != null && l(t, ["category"], n), a(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = a(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function aE(e) {
  const t = {}, n = a(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), a(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function lE(e) {
  const t = {};
  if (a(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = a(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = a(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = a(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], nE(r));
  const i = a(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], tE(i));
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
function uE(e) {
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
function cE(e, t) {
  let n = null;
  const o = e.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const i = o.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else o !== void 0 && delete e.bidiGenerateContentSetup;
  const r = e.fieldMask;
  if (n) {
    const i = uE(n);
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
var dE = class extends it {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const s = ZS(this.apiClient, e);
      r = N("auth_tokens", s._url), i = s._query, delete s.config, delete s._url, delete s._query;
      const u = cE(s, e.config);
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
function fE(e, t) {
  const n = {}, o = a(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function hE(e) {
  const t = {}, n = a(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = a(e, ["config"]);
  return o != null && fE(o, t), t;
}
function pE(e) {
  const t = {}, n = a(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function mE(e, t) {
  const n = {}, o = a(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = a(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function gE(e) {
  const t = {}, n = a(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const o = a(e, ["config"]);
  return o != null && mE(o, t), t;
}
function _E(e) {
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
var yE = class extends it {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Lt(rt.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = pE(e);
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
      const i = hE(e);
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
      const s = gE(e);
      return r = N("{parent}/documents", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = _E(u), d = new R_();
        return Object.assign(d, c), d;
      });
    }
  }
}, vE = class extends it {
  constructor(e, t = new yE(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Lt(rt.PAGED_ITEM_FILE_SEARCH_STORES, (o) => this.listInternal(o), await this.listInternal(n), n);
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
      const s = rS(e);
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
      const s = aS(e);
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
      const i = sS(e);
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
      const s = hS(e);
      return r = N("fileSearchStores", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = pS(u), d = new P_();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = mS(e);
      return r = N("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = gS(u), d = new M_();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = cS(e);
      return r = N("{file_search_store_name}:importFile", s._url), i = s._query, delete s._url, delete s._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(s),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = uS(u), d = new x_();
        return Object.assign(d, c), d;
      });
    }
  }
}, Mf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return Mf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
}, AE = () => Mf();
function Ji(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ki = (e) => {
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
}, De = class Wi extends Ne {
  constructor(t, n, o, r) {
    super(`${Wi.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.error = n;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new $r({
      message: o,
      cause: Ki(n)
    });
    const i = n;
    return t === 400 ? new Nf(t, i, o, r) : t === 401 ? new kf(t, i, o, r) : t === 403 ? new Df(t, i, o, r) : t === 404 ? new $f(t, i, o, r) : t === 409 ? new Lf(t, i, o, r) : t === 422 ? new Uf(t, i, o, r) : t === 429 ? new Ff(t, i, o, r) : t >= 500 ? new Of(t, i, o, r) : new Wi(t, i, o, r);
  }
}, zi = class extends De {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, $r = class extends De {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, xf = class extends $r {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, Nf = class extends De {
}, kf = class extends De {
}, Df = class extends De {
}, $f = class extends De {
}, Lf = class extends De {
}, Uf = class extends De {
}, Ff = class extends De {
}, Of = class extends De {
}, TE = /^[a-z][a-z0-9+.-]*:/i, SE = (e) => TE.test(e), Yi = (e) => (Yi = Array.isArray, Yi(e)), qu = Yi;
function Hu(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function EE(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var CE = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new Ne(`${e} must be an integer`);
  if (t < 0) throw new Ne(`${e} must be a positive integer`);
  return t;
}, wE = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, IE = (e) => new Promise((t) => setTimeout(t, e));
function bE() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Gf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function RE(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Gf({
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
function Bf(e) {
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
async function PE(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const o = e.getReader(), r = o.cancel();
  o.releaseLock(), await r;
}
var ME = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function xE(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new Ne(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var NE = "0.0.1", qf = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function li(e, t, n) {
  return qf(), new File(e, t ?? "unknown_file", n);
}
function kE(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var DE = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Hf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", $E = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Hf(e), LE = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function UE(e, t, n) {
  if (qf(), e = await e, $E(e))
    return e instanceof File ? e : li([await e.arrayBuffer()], e.name);
  if (LE(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), li(await Xi(r), t, n);
  }
  const o = await Xi(e);
  if (t || (t = kE(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = Object.assign(Object.assign({}, n), { type: r }));
  }
  return li(o, t, n);
}
async function Xi(e) {
  var t, n, o, r, i;
  let s = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) s.push(e);
  else if (Hf(e)) s.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (DE(e)) try {
    for (var u = !0, c = He(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      r = d.value, u = !1;
      const f = r;
      s.push(...await Xi(f));
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
    throw new Error(`Unexpected data type: ${typeof e}${f ? `; constructor: ${f}` : ""}${FE(e)}`);
  }
  return s;
}
function FE(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Js = class {
  constructor(e) {
    this._client = e;
  }
};
Js._key = [];
function Vf(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Vu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), OE = (e = Vf) => (function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], s = n.reduce((f, h, p) => {
    var m, g, _;
    /[?#]/.test(h) && (r = !0);
    const y = o[p];
    let E = (r ? encodeURIComponent : e)("" + y);
    return p !== o.length && (y == null || typeof y == "object" && y.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = y.hasOwnProperty) !== null && m !== void 0 ? m : Vu)) !== null && g !== void 0 ? g : Vu)) === null || _ === void 0 ? void 0 : _.toString)) && (E = y + "", i.push({
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
    throw new Ne(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${s}
${h}`);
  }
  return s;
}), Fe = /* @__PURE__ */ OE(Vf), Jf = class extends Js {
  create(e, t) {
    var n;
    const { api_version: o = this._client.apiVersion } = e, r = gt(e, ["api_version"]);
    if ("model" in r && "agent_config" in r) throw new Ne("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in r && "generation_config" in r) throw new Ne("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
    return this._client.post(Fe`/${o}/interactions`, Object.assign(Object.assign({ body: r }, t), { stream: (n = e.stream) !== null && n !== void 0 ? n : !1 }));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Fe`/${o}/interactions/${e}`, n);
  }
  cancel(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.post(Fe`/${o}/interactions/${e}/cancel`, n);
  }
  get(e, t = {}, n) {
    var o;
    const r = t ?? {}, { api_version: i = this._client.apiVersion } = r, s = gt(r, ["api_version"]);
    return this._client.get(Fe`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: s }, n), { stream: (o = t?.stream) !== null && o !== void 0 ? o : !1 }));
  }
};
Jf._key = Object.freeze(["interactions"]);
var Kf = class extends Jf {
}, Wf = class extends Js {
  create(e, t) {
    const { api_version: n = this._client.apiVersion, webhook_id: o } = e, r = gt(e, ["api_version", "webhook_id"]);
    return this._client.post(Fe`/${n}/webhooks`, Object.assign({
      query: { webhook_id: o },
      body: r
    }, t));
  }
  update(e, t, n) {
    const { api_version: o = this._client.apiVersion, update_mask: r } = t, i = gt(t, ["api_version", "update_mask"]);
    return this._client.patch(Fe`/${o}/webhooks/${e}`, Object.assign({
      query: { update_mask: r },
      body: i
    }, n));
  }
  list(e = {}, t) {
    const n = e ?? {}, { api_version: o = this._client.apiVersion } = n, r = gt(n, ["api_version"]);
    return this._client.get(Fe`/${o}/webhooks`, Object.assign({ query: r }, t));
  }
  delete(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.delete(Fe`/${o}/webhooks/${e}`, n);
  }
  get(e, t = {}, n) {
    const { api_version: o = this._client.apiVersion } = t ?? {};
    return this._client.get(Fe`/${o}/webhooks/${e}`, n);
  }
  ping(e, t = void 0, n) {
    const { api_version: o = this._client.apiVersion, body: r } = t ?? {};
    return this._client.post(Fe`/${o}/webhooks/${e}:ping`, Object.assign({ body: r }, n));
  }
  rotateSigningSecret(e, t = {}, n) {
    const o = t ?? {}, { api_version: r = this._client.apiVersion } = o, i = gt(o, ["api_version"]);
    return this._client.post(Fe`/${r}/webhooks/${e}:rotateSigningSecret`, Object.assign({ body: i }, n));
  }
};
Wf._key = Object.freeze(["webhooks"]);
var zf = class extends Wf {
};
function GE(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Go;
function Ks(e) {
  let t;
  return (Go ?? (t = new globalThis.TextEncoder(), Go = t.encode.bind(t)))(e);
}
var Bo;
function Ju(e) {
  let t;
  return (Bo ?? (t = new globalThis.TextDecoder(), Bo = t.decode.bind(t)))(e);
}
var Lr = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Ks(e) : e;
    this.buffer = GE([this.buffer, n]);
    const o = [];
    let r;
    for (; (r = BE(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (r.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = r.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (r.index !== this.carriageReturnIndex + 1 || r.carriage)) {
        o.push(Ju(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? r.preceding - 1 : r.preceding, s = Ju(this.buffer.subarray(0, i));
      o.push(s), this.buffer = this.buffer.subarray(r.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), o;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Lr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Lr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function BE(e, t) {
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
var mr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Ku = (e, t, n) => {
  if (e) {
    if (EE(mr, e)) return e;
    he(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(mr))}`);
  }
};
function Fn() {
}
function qo(e, t, n) {
  return !t || mr[e] > mr[n] ? Fn : t[e].bind(t);
}
var qE = {
  error: Fn,
  warn: Fn,
  info: Fn,
  debug: Fn
}, Wu = /* @__PURE__ */ new WeakMap();
function he(e) {
  var t;
  const n = e.logger, o = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return qE;
  const r = Wu.get(n);
  if (r && r[0] === o) return r[1];
  const i = {
    error: qo("error", n, o),
    warn: qo("warn", n, o),
    info: qo("info", n, o),
    debug: qo("debug", n, o)
  };
  return Wu.set(n, [o, i]), i;
}
var wt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), HE = class On {
  constructor(t, n, o) {
    this.iterator = t, this.controller = n, this.client = o;
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? he(o) : console;
    function s() {
      return qe(this, arguments, function* () {
        var c, d, f, h;
        if (r) throw new Ne("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = He(VE(t, n)), _; _ = yield B(g.next()), c = _.done, !c; m = !0) {
              h = _.value, m = !1;
              const y = h;
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
              !m && !c && (f = g.return) && (yield B(f.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (y) {
          if (Ji(y)) return yield B(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new On(s, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    function i() {
      return qe(this, arguments, function* () {
        var c, d, f, h;
        const p = new Lr(), m = Bf(t);
        try {
          for (var g = !0, _ = He(m), y; y = yield B(_.next()), c = y.done, !c; g = !0) {
            h = y.value, g = !1;
            const E = h;
            for (const C of p.decode(E)) yield yield B(C);
          }
        } catch (E) {
          d = { error: E };
        } finally {
          try {
            !g && !c && (f = _.return) && (yield B(f.call(_)));
          } finally {
            if (d) throw d.error;
          }
        }
        for (const E of p.flush()) yield yield B(E);
      });
    }
    function s() {
      return qe(this, arguments, function* () {
        var c, d, f, h;
        if (r) throw new Ne("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = He(i()), _; _ = yield B(g.next()), c = _.done, !c; m = !0) {
              h = _.value, m = !1;
              const y = h;
              p || y && (yield yield B(JSON.parse(y)));
            }
          } catch (y) {
            d = { error: y };
          } finally {
            try {
              !m && !c && (f = g.return) && (yield B(f.call(g)));
            } finally {
              if (d) throw d.error;
            }
          }
          p = !0;
        } catch (y) {
          if (Ji(y)) return yield B(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new On(s, n, o);
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
    return [new On(() => r(t), this.controller, this.client), new On(() => r(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Gf({
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
        var o;
        await ((o = n.return) === null || o === void 0 ? void 0 : o.call(n));
      }
    });
  }
};
function VE(e, t) {
  return qe(this, arguments, function* () {
    var o, r, i, s;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new Ne("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new Ne("Attempted to iterate over a response with no body");
    const u = new KE(), c = new Lr(), d = Bf(e.body);
    try {
      for (var f = !0, h = He(JE(d)), p; p = yield B(h.next()), o = p.done, !o; f = !0) {
        s = p.value, f = !1;
        const m = s;
        for (const g of c.decode(m)) {
          const _ = u.decode(g);
          _ && (yield yield B(_));
        }
      }
    } catch (m) {
      r = { error: m };
    } finally {
      try {
        !f && !o && (i = h.return) && (yield B(i.call(h)));
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
function JE(e) {
  return qe(this, arguments, function* () {
    var n, o, r, i;
    try {
      for (var s = !0, u = He(e), c; c = yield B(u.next()), n = c.done, !n; s = !0) {
        i = c.value, s = !1;
        const d = i;
        d != null && (yield yield B(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? Ks(d) : d));
      }
    } catch (d) {
      o = { error: d };
    } finally {
      try {
        !s && !n && (r = u.return) && (yield B(r.call(u)));
      } finally {
        if (o) throw o.error;
      }
    }
  });
}
var KE = class {
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
    let [t, n, o] = WE(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function WE(e, t) {
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
async function zE(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, s = await (async () => {
    var u;
    if (t.options.stream)
      return he(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : HE.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return he(e).debug(`[${o}] response parsed`, wt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
var YE = class Yf extends Promise {
  constructor(t, n, o = zE) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, this.client = t;
  }
  _thenUnwrap(t) {
    return new Yf(this.client, this.responsePromise, async (n, o) => t(await this.parseResponse(n, o), o));
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
}, Xf = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* XE(e) {
  if (!e) return;
  if (Xf in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : qu(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = qu(o[1]) ? o[1] : [o[1]];
    let s = !1;
    for (const u of i)
      u !== void 0 && (t && !s && (s = !0, yield [r, null]), yield [r, u]);
  }
}
var xn = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, s] of XE(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [Xf]: !0,
    values: t,
    nulls: n
  };
}, ui = (e) => {
  var t, n, o, r, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (r = (o = globalThis.Deno.env) === null || o === void 0 ? void 0 : o.get) === null || r === void 0 ? void 0 : r.call(o, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, Qf, Zf = class jf {
  constructor(t) {
    var n, o, r, i, s, u, c, { baseURL: d = ui("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: f = (n = ui("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: h = "v1beta" } = t, p = gt(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: f,
      apiVersion: h
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (o = m.timeout) !== null && o !== void 0 ? o : jf.DEFAULT_TIMEOUT, this.logger = (r = m.logger) !== null && r !== void 0 ? r : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (s = (i = Ku(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : Ku(ui("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && s !== void 0 ? s : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : bE(), this.encoder = ME, this._options = m, this.apiKey = f, this.apiVersion = h, this.clientAdapter = m.clientAdapter;
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
    const n = xn([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return xn([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return xn([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return xE(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${NE}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${AE()}`;
  }
  makeStatusError(t, n, o, r) {
    return De.generate(t, n, o, r);
  }
  buildURL(t, n, o) {
    const r = !this.baseURLOverridden() && o || this.baseURL, i = SE(t) ? new URL(t) : new URL(r + (r.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), s = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!Hu(s) || !Hu(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), s), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return new YE(this, this.makeRequest(t, n, void 0));
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
    if (he(this).debug(`[${p}] sending request`, wt({
      retryOfRequestLogID: o,
      method: u.method,
      url: f,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new zi();
    const _ = new AbortController(), y = await this.fetchWithTimeout(f, d, h, _).catch(Ki), E = Date.now();
    if (y instanceof globalThis.Error) {
      const w = `retrying, ${n} attempts remaining`;
      if (!((s = u.signal) === null || s === void 0) && s.aborted) throw new zi();
      const P = Ji(y) || /timed? ?out/i.test(String(y) + ("cause" in y ? String(y.cause) : ""));
      if (n)
        return he(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - ${w}`), he(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (${w})`, wt({
          retryOfRequestLogID: o,
          url: f,
          durationMs: E - g,
          message: y.message
        })), this.retryRequest(u, n, o ?? p);
      throw he(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - error; no more retries left`), he(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (error; no more retries left)`, wt({
        retryOfRequestLogID: o,
        url: f,
        durationMs: E - g,
        message: y.message
      })), P ? new xf() : new $r({ cause: y });
    }
    const C = `[${p}${m}] ${d.method} ${f} ${y.ok ? "succeeded" : "failed"} with status ${y.status} in ${E - g}ms`;
    if (!y.ok) {
      const w = await this.shouldRetry(y);
      if (n && w) {
        const I = `retrying, ${n} attempts remaining`;
        return await PE(y.body), he(this).info(`${C} - ${I}`), he(this).debug(`[${p}] response error (${I})`, wt({
          retryOfRequestLogID: o,
          url: y.url,
          status: y.status,
          headers: y.headers,
          durationMs: E - g
        })), this.retryRequest(u, n, o ?? p, y.headers);
      }
      const P = w ? "error; no more retries left" : "error; not retryable";
      he(this).info(`${C} - ${P}`);
      const M = await y.text().catch((I) => Ki(I).message), A = wE(M), $ = A ? void 0 : M;
      throw he(this).debug(`[${p}] response error (${P})`, wt({
        retryOfRequestLogID: o,
        url: y.url,
        status: y.status,
        headers: y.headers,
        message: $,
        durationMs: Date.now() - g
      })), this.makeStatusError(y.status, A, $, y.headers);
    }
    return he(this).info(C), he(this).debug(`[${p}] response start`, wt({
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
    const i = n || {}, { signal: s, method: u } = i, c = gt(i, ["signal", "method"]), d = this._makeAbort(r);
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
    return await IE(s), this.makeRequest(t, n - 1, o);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var o, r, i;
    const s = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: f } = s, h = this.buildURL(c, d, f);
    "timeout" in s && CE("timeout", s.timeout), s.timeout = (o = s.timeout) !== null && o !== void 0 ? o : this.timeout;
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
    let u = xn([
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
    const o = xn([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && o.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: RE(t)
    } : typeof t == "object" && o.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: o
    });
  }
};
Zf.DEFAULT_TIMEOUT = 6e4;
var ne = class extends Zf {
  constructor() {
    super(...arguments), this.interactions = new Kf(this), this.webhooks = new zf(this);
  }
};
Qf = ne;
ne.GeminiNextGenAPIClient = Qf;
ne.GeminiNextGenAPIClientError = Ne;
ne.APIError = De;
ne.APIConnectionError = $r;
ne.APIConnectionTimeoutError = xf;
ne.APIUserAbortError = zi;
ne.NotFoundError = $f;
ne.ConflictError = Lf;
ne.RateLimitError = Ff;
ne.BadRequestError = Nf;
ne.AuthenticationError = kf;
ne.InternalServerError = Of;
ne.PermissionDeniedError = Df;
ne.UnprocessableEntityError = Uf;
ne.toFile = UE;
ne.Interactions = Kf;
ne.Webhooks = zf;
function QE(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function ZE(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function jE(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function eC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function tC(e, t, n) {
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
function nC(e, t, n) {
  const o = {};
  let r = a(n, ["config", "method"]);
  if (r === void 0 && (r = "SUPERVISED_FINE_TUNING"), r === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["validationDataset"]);
    t !== void 0 && A != null && l(t, ["supervisedTuningSpec"], ci(A));
  } else if (r === "PREFERENCE_TUNING") {
    const A = a(e, ["validationDataset"]);
    t !== void 0 && A != null && l(t, ["preferenceOptimizationSpec"], ci(A));
  } else if (r === "DISTILLATION") {
    const A = a(e, ["validationDataset"]);
    t !== void 0 && A != null && l(t, ["distillationSpec"], ci(A));
  }
  const i = a(e, ["tunedModelDisplayName"]);
  t !== void 0 && i != null && l(t, ["tunedModelDisplayName"], i);
  const s = a(e, ["description"]);
  t !== void 0 && s != null && l(t, ["description"], s);
  let u = a(n, ["config", "method"]);
  if (u === void 0 && (u = "SUPERVISED_FINE_TUNING"), u === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["epochCount"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "epochCount"
    ], A);
  } else if (u === "PREFERENCE_TUNING") {
    const A = a(e, ["epochCount"]);
    t !== void 0 && A != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "epochCount"
    ], A);
  } else if (u === "DISTILLATION") {
    const A = a(e, ["epochCount"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "epochCount"
    ], A);
  }
  let c = a(n, ["config", "method"]);
  if (c === void 0 && (c = "SUPERVISED_FINE_TUNING"), c === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["learningRateMultiplier"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], A);
  } else if (c === "PREFERENCE_TUNING") {
    const A = a(e, ["learningRateMultiplier"]);
    t !== void 0 && A != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], A);
  } else if (c === "DISTILLATION") {
    const A = a(e, ["learningRateMultiplier"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRateMultiplier"
    ], A);
  }
  let d = a(n, ["config", "method"]);
  if (d === void 0 && (d = "SUPERVISED_FINE_TUNING"), d === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && A != null && l(t, ["supervisedTuningSpec", "exportLastCheckpointOnly"], A);
  } else if (d === "PREFERENCE_TUNING") {
    const A = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && A != null && l(t, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], A);
  } else if (d === "DISTILLATION") {
    const A = a(e, ["exportLastCheckpointOnly"]);
    t !== void 0 && A != null && l(t, ["distillationSpec", "exportLastCheckpointOnly"], A);
  }
  let f = a(n, ["config", "method"]);
  if (f === void 0 && (f = "SUPERVISED_FINE_TUNING"), f === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["adapterSize"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "adapterSize"
    ], A);
  } else if (f === "PREFERENCE_TUNING") {
    const A = a(e, ["adapterSize"]);
    t !== void 0 && A != null && l(t, [
      "preferenceOptimizationSpec",
      "hyperParameters",
      "adapterSize"
    ], A);
  } else if (f === "DISTILLATION") {
    const A = a(e, ["adapterSize"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "adapterSize"
    ], A);
  }
  let h = a(n, ["config", "method"]);
  if (h === void 0 && (h = "SUPERVISED_FINE_TUNING"), h === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["tuningMode"]);
    t !== void 0 && A != null && l(t, ["supervisedTuningSpec", "tuningMode"], A);
  } else if (h === "DISTILLATION") {
    const A = a(e, ["tuningMode"]);
    t !== void 0 && A != null && l(t, ["distillationSpec", "tuningMode"], A);
  }
  const p = a(e, ["customBaseModel"]);
  t !== void 0 && p != null && l(t, ["customBaseModel"], p);
  let m = a(n, ["config", "method"]);
  if (m === void 0 && (m = "SUPERVISED_FINE_TUNING"), m === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["batchSize"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "batchSize"
    ], A);
  } else if (m === "DISTILLATION") {
    const A = a(e, ["batchSize"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "batchSize"
    ], A);
  }
  let g = a(n, ["config", "method"]);
  if (g === void 0 && (g = "SUPERVISED_FINE_TUNING"), g === "SUPERVISED_FINE_TUNING") {
    const A = a(e, ["learningRate"]);
    t !== void 0 && A != null && l(t, [
      "supervisedTuningSpec",
      "hyperParameters",
      "learningRate"
    ], A);
  } else if (g === "DISTILLATION") {
    const A = a(e, ["learningRate"]);
    t !== void 0 && A != null && l(t, [
      "distillationSpec",
      "hyperParameters",
      "learningRate"
    ], A);
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
  const w = a(e, ["sftLossWeightMultiplier"]);
  t !== void 0 && w != null && l(t, [
    "distillationSpec",
    "hyperParameters",
    "sftLossWeightMultiplier"
  ], w);
  const P = a(e, ["outputUri"]);
  t !== void 0 && P != null && l(t, ["outputUri"], P);
  const M = a(e, ["encryptionSpec"]);
  return t !== void 0 && M != null && l(t, ["encryptionSpec"], M), o;
}
function oC(e, t) {
  const n = {}, o = a(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = a(e, ["trainingDataset"]);
  i != null && pC(i);
  const s = a(e, ["config"]);
  return s != null && tC(s, n), n;
}
function rC(e, t) {
  const n = {}, o = a(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = a(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = a(e, ["trainingDataset"]);
  i != null && mC(i, n, t);
  const s = a(e, ["config"]);
  return s != null && nC(s, n, t), n;
}
function iC(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function sC(e, t) {
  const n = {}, o = a(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function aC(e, t, n) {
  const o = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), o;
}
function lC(e, t, n) {
  const o = {}, r = a(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = a(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const s = a(e, ["filter"]);
  return t !== void 0 && s != null && l(t, ["_query", "filter"], s), o;
}
function uC(e, t) {
  const n = {}, o = a(e, ["config"]);
  return o != null && aC(o, n), n;
}
function cC(e, t) {
  const n = {}, o = a(e, ["config"]);
  return o != null && lC(o, n), n;
}
function dC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["tunedModels"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => eh(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function fC(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = a(e, ["tuningJobs"]);
  if (i != null) {
    let s = i;
    Array.isArray(s) && (s = s.map((u) => Qi(u))), l(n, ["tuningJobs"], s);
  }
  return n;
}
function hC(e, t) {
  const n = {}, o = a(e, ["name"]);
  o != null && l(n, ["model"], o);
  const r = a(e, ["name"]);
  return r != null && l(n, ["endpoint"], r), n;
}
function pC(e, t) {
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
function mC(e, t, n) {
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
function eh(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["state"]);
  i != null && l(n, ["state"], uf(i));
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
  return p != null && l(n, ["tunedModel"], hC(p)), n;
}
function Qi(e, t) {
  const n = {}, o = a(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = a(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = a(e, ["state"]);
  i != null && l(n, ["state"], uf(i));
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
  const w = a(e, ["encryptionSpec"]);
  w != null && l(n, ["encryptionSpec"], w);
  const P = a(e, ["partnerModelTuningSpec"]);
  P != null && l(n, ["partnerModelTuningSpec"], P);
  const M = a(e, ["customBaseModel"]);
  M != null && l(n, ["customBaseModel"], M);
  const A = a(e, ["evaluateDatasetRuns"]);
  if (A != null) {
    let $e = A;
    Array.isArray($e) && ($e = $e.map((Le) => Le)), l(n, ["evaluateDatasetRuns"], $e);
  }
  const $ = a(e, ["experiment"]);
  $ != null && l(n, ["experiment"], $);
  const I = a(e, ["fullFineTuningSpec"]);
  I != null && l(n, ["fullFineTuningSpec"], I);
  const x = a(e, ["labels"]);
  x != null && l(n, ["labels"], x);
  const F = a(e, ["outputUri"]);
  F != null && l(n, ["outputUri"], F);
  const H = a(e, ["pipelineJob"]);
  H != null && l(n, ["pipelineJob"], H);
  const ue = a(e, ["serviceAccount"]);
  ue != null && l(n, ["serviceAccount"], ue);
  const ie = a(e, ["tunedModelDisplayName"]);
  ie != null && l(n, ["tunedModelDisplayName"], ie);
  const J = a(e, ["tuningJobState"]);
  J != null && l(n, ["tuningJobState"], J);
  const W = a(e, ["veoTuningSpec"]);
  W != null && l(n, ["veoTuningSpec"], W);
  const pe = a(e, ["distillationSamplingSpec"]);
  pe != null && l(n, ["distillationSamplingSpec"], pe);
  const Je = a(e, ["tuningJobMetadata"]);
  return Je != null && l(n, ["tuningJobMetadata"], Je), n;
}
function gC(e, t) {
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
function ci(e, t) {
  const n = {}, o = a(e, ["gcsUri"]);
  o != null && l(n, ["validationDatasetUri"], o);
  const r = a(e, ["vertexDatasetResource"]);
  return r != null && l(n, ["validationDatasetUri"], r), n;
}
var _C = class extends it {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Lt(rt.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: Ui.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = sC(e);
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
      })), i.then((d) => Qi(d));
    } else {
      const c = iC(e);
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
      })), i.then((d) => eh(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = cC(e);
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
        const f = fC(d), h = new yu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = uC(e);
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
        const f = dC(d), h = new yu();
        return Object.assign(h, f), h;
      });
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i, s = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ZE(e);
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
        const f = eC(d), h = new vu();
        return Object.assign(h, f), h;
      });
    } else {
      const c = QE(e);
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
        const f = jE(d), h = new vu();
        return Object.assign(h, f), h;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const s = rC(e, e);
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
      })), o.then((u) => Qi(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const s = oC(e);
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
      })), o.then((u) => gC(u));
    }
  }
}, yC = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, vC = 1024 * 1024 * 8, AC = 3, TC = 1e3, SC = 2, gr = "x-goog-upload-status";
async function EC(e, t, n, o) {
  var r;
  const i = await th(e, t, n, o), s = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[gr]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return s.file;
}
async function CC(e, t, n, o) {
  var r;
  const i = await th(e, t, n, o), s = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[gr]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = jd(s), c = new F_();
  return Object.assign(c, u), c;
}
async function th(e, t, n, o) {
  var r, i, s;
  let u = t;
  const c = o?.baseUrl || ((r = n.clientOptions.httpOptions) === null || r === void 0 ? void 0 : r.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, f = 0, h = new Oi(new Response()), p = "upload";
  for (d = e.size; f < d; ) {
    const m = Math.min(vC, d - f), g = e.slice(f, f + m);
    f + m >= d && (p += ", finalize");
    let _ = 0, y = TC;
    for (; _ < AC; ) {
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
      }), !((i = h?.headers) === null || i === void 0) && i[gr]) break;
      _++, await IC(y), y = y * SC;
    }
    if (f += m, ((s = h?.headers) === null || s === void 0 ? void 0 : s[gr]) !== "active") break;
    if (d <= f) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return h;
}
async function wC(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function IC(e) {
  return new Promise((t) => setTimeout(t, e));
}
var bC = class {
  async upload(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await EC(e, t, n, o);
  }
  async uploadToFileSearchStore(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await CC(e, t, n, o);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await wC(e);
  }
}, RC = class {
  create(e, t, n) {
    return new PC(e, t, n);
  }
}, PC = class {
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
}, zu = "x-goog-api-key", MC = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(zu) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(zu, this.apiKey);
    }
  }
}, xC = class {
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
    const n = a_(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const o = new MC(this.apiKey);
    this.apiClient = new IS({
      auth: o,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new bC(),
      downloader: new yC()
    }), this.models = new KS(this.apiClient), this.live = new GS(this.apiClient, o, new RC()), this.batches = new By(this.apiClient), this.chats = new wv(this.models, this.apiClient), this.caches = new Sv(this.apiClient), this.files = new Uv(this.apiClient), this.operations = new WS(this.apiClient), this.authTokens = new dE(this.apiClient), this.tunings = new _C(this.apiClient), this.fileSearchStores = new vE(this.apiClient);
  }
};
function Yu(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function _r(e) {
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
function NC(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function kC(e) {
  if (typeof e == "string") return [xt(e)];
  if (!Array.isArray(e)) return [xt("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? xt(n.text || "") : n.type === "image_url" && n.image_url?.url ? NC(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [xt("")];
}
function Xu() {
  return {
    role: "user",
    parts: [xt("")]
  };
}
function yo(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = _r(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function DC(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function $C(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function Qu(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const o = String(e.functionCall.id || "").trim();
  return o ? `id:${o}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function LC(e, t) {
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
function UC(e = [], t = "") {
  const n = e.map((f) => yo(f, "model")).filter(Boolean);
  if (!n.length) return null;
  const o = [...n].reverse().find((f) => DC(f)) || null, r = [...n].reverse().find((f) => $C(f)) || null, i = o || r || n[n.length - 1], s = n.indexOf(i), u = _r(i);
  if (!u?.parts?.length) return n[n.length - 1];
  if (r) {
    const f = /* @__PURE__ */ new Map(), h = [];
    n.forEach((m, g) => {
      m.parts.forEach((_, y) => {
        const E = Qu(_, y, g);
        if (!E) return;
        f.has(E) || h.push(E);
        const C = f.get(E);
        C ? f.set(E, LC(C, _)) : f.set(E, _r(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((m, g) => {
      const _ = Qu(m, g, s);
      return _ ? (p.add(_), f.get(_) || m) : m;
    }), h.forEach((m) => {
      p.has(m) || (u.parts.push(f.get(m)), p.add(m));
    });
  }
  const c = String(t || ""), d = u.parts.filter((f) => !(typeof f?.text == "string" && !f?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function Zu(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((o) => !o?.thought && typeof o?.text == "string" && o.text).map((o) => o.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function nh(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((o) => o?.functionCall || o).filter((o) => o && o.name);
  return t.length ? t : n;
}
function oh(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function ju(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function FC(e, t) {
  const n = ju(e), o = ju(t);
  return n && o ? JSON.stringify({
    ...n,
    ...o
  }) : String(t || "").trim() || String(e || "{}");
}
function OC(e, t = "google-tool") {
  return nh(e).map((n, o) => {
    const r = String(n.id || "").trim();
    return {
      id: r || `${t}-${o + 1}`,
      name: n.name || "",
      arguments: oh(n),
      ...r ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function GC(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let o = 0;
  function r(s, u, c, d) {
    return s.name = String(u.name || s.name || "").trim(), s.arguments = FC(s.arguments, d), c && (n.set(c, s), s.id !== c ? s.providerId = c : delete s.providerId), s;
  }
  function i(s) {
    return nh(s).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), f = oh(u);
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
function BC(e = []) {
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
function qC(e) {
  switch (e) {
    case "minimal":
      return Xt.MINIMAL;
    case "high":
      return Xt.HIGH;
    case "medium":
      return Xt.MEDIUM;
    default:
      return Xt.LOW;
  }
}
function ec(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function HC(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function VC(e) {
  const t = e?.providerPayload?.googleContent;
  return yo(t, "model");
}
function JC(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = VC(e);
    return n ? [n] : [];
  }
  return t.map((n) => yo(n, "model")).filter(Boolean);
}
function Ws(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => yo(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function KC(e) {
  const t = e?.candidates?.[0]?.content;
  return Ws(t ? [t] : []);
}
function WC(e) {
  return Ws(e ? [e] : []);
}
function rh(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? _r(e.history) || [] : [];
}
function zC(e, t = 0) {
  return rh(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => yo(n, "model")).filter(Boolean);
}
function YC(e) {
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
          response: Yu(f.content)
        } }), d += 1;
      }
      o.push({
        role: "user",
        parts: c
      }), s = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = JC(u);
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
          args: Yu(c.function.arguments)
        } }))]
      });
      continue;
    }
    o.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: kC(u.content)
    });
  }
  if (!o.length) return {
    history: [],
    latestMessage: Xu().parts
  };
  const i = o[o.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: o.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: o,
    latestMessage: Xu().parts
  };
}
function XC(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function tc(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var QC = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.sessionReasoning = null, this.toolCallResponseSequence = 0, this.client = new xC({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e, t = Q("google", this.config, e.reasoning)) {
    const n = t, o = YC(e.messages), r = Array.isArray(e.tools) ? e.tools : [], i = HC(e), s = {
      ...i ? { systemInstruction: i } : {},
      temperature: e.temperature,
      ...e.maxTokens ? { maxOutputTokens: e.maxTokens } : {}
    };
    if (n.mode === "off" ? s.thinkingConfig = {
      includeThoughts: !1,
      thinkingBudget: 0
    } : n.mode === "on" && n.profileId.startsWith("google-gemini-2.5-") ? s.thinkingConfig = {
      includeThoughts: K(n),
      thinkingBudget: n.budgetTokens
    } : n.mode === "on" ? s.thinkingConfig = {
      includeThoughts: K(n),
      thinkingLevel: qC(n.effort)
    } : K(n) && (s.thinkingConfig = { includeThoughts: !0 }), r.length && (s.tools = [{ functionDeclarations: r.map((u) => ({
      name: u.function.name,
      description: u.function.description,
      parameters: u.function.parameters
    })) }]), r.length) {
      const u = String(e.toolChoice || "auto").trim();
      s.toolConfig = { functionCallingConfig: u === "none" ? { mode: Yt.NONE } : u === "auto" ? { mode: Yt.AUTO } : u === "required" ? { mode: Yt.ANY } : {
        mode: Yt.ANY,
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
    const n = t.effectiveReasoning || Q("google", this.config, e.reasoning), o = t.payload || this.buildChatPayload(e, n), r = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return so({
      provider: "google",
      model: this.config.model,
      transport: "google-genai-sdk",
      url: `${r}/models/${encodeURIComponent(this.config.model || "")}:generateContent`,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.config.apiKey || ""
      },
      body: {
        chatCreate: o.createPayload,
        sendMessage: o.sendPayload,
        stream: typeof e.onStreamProgress == "function"
      },
      sdk: typeof e.onStreamProgress == "function" ? "client.chats.create(...).sendMessageStream" : "client.chats.create(...).sendMessage",
      effectiveConfig: yt(e, {
        reasoning: n,
        effort: o.createPayload.config?.thinkingConfig?.thinkingLevel,
        budgetTokens: o.createPayload.config?.thinkingConfig?.thinkingBudget,
        controlFields: o.createPayload.config?.thinkingConfig ? { thinkingConfig: o.createPayload.config.thinkingConfig } : {}
      })
    });
  }
  inspectSendRequest(e, t, n) {
    const o = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return so({
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
      effectiveConfig: yt(t, {
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
    const c = `google-tool-${++this.toolCallResponseSequence}`, d = GC(c);
    let f = null;
    const h = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, p = {
      ...t,
      ...h ? { config: h } : {}
    }, m = typeof n.onStreamProgress == "function", g = rh(e).length;
    if (m) {
      const E = await e.sendMessageStream(p), C = /* @__PURE__ */ new Map();
      let w = "", P = null;
      const M = [];
      for await (const A of E) {
        P = A;
        const $ = A?.candidates?.[0]?.content;
        $?.parts?.length && M.push($), K(o) && ec(A).forEach((x, F) => {
          const H = `${x.label}:${F}`;
          C.set(H, tc(C.get(H) || "", x.text));
        }), u = d.append(A);
        const I = Zu(A);
        w = tc(w, I), XC(n, {
          text: w,
          thoughts: Array.from(C.values()).filter(Boolean).map((x, F) => ({
            label: `思考块 ${F + 1}`,
            text: x
          })),
          ...u.length ? {
            toolCalls: u,
            toolCallDraft: !0
          } : {}
        });
      }
      r = {
        ...P || {},
        functionCalls: u
      }, f = UC(M, w) || r?.candidates?.[0]?.content || null, i = Array.from(C.values()).filter(Boolean).map((A, $) => ({
        label: `思考块 ${$ + 1}`,
        text: A
      })), s = w;
    } else
      r = await e.sendMessage(p), i = K(o) ? ec(r) : [], s = Zu(r);
    const _ = m ? u : OC(r, c), y = zC(e, g);
    return {
      text: s,
      toolCalls: _,
      thoughts: i,
      finishReason: r.candidates?.[0]?.finishReason || "STOP",
      model: r.modelVersion || this.config.model,
      provider: "google",
      providerPayload: Ws(y) || WC(f) || KC(r)
    };
  }
  async chat(e) {
    const t = Q("google", this.config, e.reasoning), n = (Array.isArray(e.toolResponses) && e.toolResponses.length || String(e.finalAnswerReminderText || "").trim()) && this.sessionReasoning ? this.sessionReasoning : t;
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const i = { message: BC(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, i, e, n),
        requestInspection: this.inspectSendRequest(i, e, n)
      };
    }
    const o = String(e.finalAnswerReminderText || "").trim();
    if (o) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const i = { message: [xt(o)] };
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
function O(e, t, n, o, r) {
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
var ih = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return ih = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function Zi(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ji = (e) => {
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
}, ce = class es extends U {
  constructor(t, n, o, r) {
    super(`${es.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new Ur({
      message: o,
      cause: ji(n)
    });
    const i = n?.error;
    return t === 400 ? new sh(t, i, o, r) : t === 401 ? new ah(t, i, o, r) : t === 403 ? new lh(t, i, o, r) : t === 404 ? new uh(t, i, o, r) : t === 409 ? new ch(t, i, o, r) : t === 422 ? new dh(t, i, o, r) : t === 429 ? new fh(t, i, o, r) : t >= 500 ? new hh(t, i, o, r) : new es(t, i, o, r);
  }
}, xe = class extends ce {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Ur = class extends ce {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, zs = class extends Ur {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, sh = class extends ce {
}, ah = class extends ce {
}, lh = class extends ce {
}, uh = class extends ce {
}, ch = class extends ce {
}, dh = class extends ce {
}, fh = class extends ce {
}, hh = class extends ce {
}, ph = class extends U {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, mh = class extends U {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, Gn = class extends Error {
  constructor(e) {
    super(e);
  }
}, gh = class extends ce {
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
}, ZC = class extends U {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, jC = /^[a-z][a-z0-9+.-]*:/i, ew = (e) => jC.test(e), ge = (e) => (ge = Array.isArray, ge(e)), nc = ge;
function Ys(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function oc(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function tw(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function di(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var nw = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new U(`${e} must be an integer`);
  if (t < 0) throw new U(`${e} must be a positive integer`);
  return t;
}, ow = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, vo = (e) => new Promise((t) => setTimeout(t, e)), Jt = "6.44.0", rw = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function iw() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var sw = () => {
  const e = iw();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Jt,
    "X-Stainless-OS": ic(Deno.build.os),
    "X-Stainless-Arch": rc(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Jt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Jt,
    "X-Stainless-OS": ic(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": rc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = aw();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Jt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Jt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function aw() {
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
var rc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", ic = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), sc, lw = () => sc ?? (sc = sw());
function _h() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function yh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function vh(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return yh({
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
function Ah(e) {
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
async function ac(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var uw = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Th = "RFC3986", Sh = (e) => String(e), lc = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Sh
};
var ts = (e, t) => (ts = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), ts(e, t)), Ke = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), fi = 1024, cw = (e, t, n, o, r) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let s = "";
  for (let u = 0; u < i.length; u += fi) {
    const c = i.length >= fi ? i.slice(u, u + fi) : i, d = [];
    for (let f = 0; f < c.length; ++f) {
      let h = c.charCodeAt(f);
      if (h === 45 || h === 46 || h === 95 || h === 126 || h >= 48 && h <= 57 || h >= 65 && h <= 90 || h >= 97 && h <= 122 || r === "RFC1738" && (h === 40 || h === 41)) {
        d[d.length] = c.charAt(f);
        continue;
      }
      if (h < 128) {
        d[d.length] = Ke[h];
        continue;
      }
      if (h < 2048) {
        d[d.length] = Ke[192 | h >> 6] + Ke[128 | h & 63];
        continue;
      }
      if (h < 55296 || h >= 57344) {
        d[d.length] = Ke[224 | h >> 12] + Ke[128 | h >> 6 & 63] + Ke[128 | h & 63];
        continue;
      }
      f += 1, h = 65536 + ((h & 1023) << 10 | c.charCodeAt(f) & 1023), d[d.length] = Ke[240 | h >> 18] + Ke[128 | h >> 12 & 63] + Ke[128 | h >> 6 & 63] + Ke[128 | h & 63];
    }
    s += d.join("");
  }
  return s;
};
function dw(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function uc(e, t) {
  if (ge(e)) {
    const n = [];
    for (let o = 0; o < e.length; o += 1) n.push(t(e[o]));
    return n;
  }
  return t(e);
}
var Eh = {
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
}, Ch = function(e, t) {
  Array.prototype.push.apply(e, ge(t) ? t : [t]);
}, cc, te = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: cw,
  encodeValuesOnly: !1,
  format: Th,
  formatter: Sh,
  indices: !1,
  serializeDate(e) {
    return (cc ?? (cc = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function fw(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var hi = {};
function wh(e, t, n, o, r, i, s, u, c, d, f, h, p, m, g, _, y, E) {
  let C = e, w = E, P = 0, M = !1;
  for (; (w = w.get(hi)) !== void 0 && !M; ) {
    const F = w.get(e);
    if (P += 1, typeof F < "u") {
      if (F === P) throw new RangeError("Cyclic object value");
      M = !0;
    }
    typeof w.get(hi) > "u" && (P = 0);
  }
  if (typeof d == "function" ? C = d(t, C) : C instanceof Date ? C = p?.(C) : n === "comma" && ge(C) && (C = uc(C, function(F) {
    return F instanceof Date ? p?.(F) : F;
  })), C === null) {
    if (i) return c && !_ ? c(t, te.encoder, y, "key", m) : t;
    C = "";
  }
  if (fw(C) || dw(C)) {
    if (c) {
      const F = _ ? t : c(t, te.encoder, y, "key", m);
      return [g?.(F) + "=" + g?.(c(C, te.encoder, y, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(C))];
  }
  const A = [];
  if (typeof C > "u") return A;
  let $;
  if (n === "comma" && ge(C))
    _ && c && (C = uc(C, c)), $ = [{ value: C.length > 0 ? C.join(",") || null : void 0 }];
  else if (ge(d)) $ = d;
  else {
    const F = Object.keys(C);
    $ = f ? F.sort(f) : F;
  }
  const I = u ? String(t).replace(/\./g, "%2E") : String(t), x = o && ge(C) && C.length === 1 ? I + "[]" : I;
  if (r && ge(C) && C.length === 0) return x + "[]";
  for (let F = 0; F < $.length; ++F) {
    const H = $[F], ue = typeof H == "object" && typeof H.value < "u" ? H.value : C[H];
    if (s && ue === null) continue;
    const ie = h && u ? H.replace(/\./g, "%2E") : H, J = ge(C) ? typeof n == "function" ? n(x, ie) : x : x + (h ? "." + ie : "[" + ie + "]");
    E.set(e, P);
    const W = /* @__PURE__ */ new WeakMap();
    W.set(hi, E), Ch(A, wh(ue, J, n, o, r, i, s, u, n === "comma" && _ && ge(C) ? null : c, d, f, h, p, m, g, _, y, W));
  }
  return A;
}
function hw(e = te) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || te.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Th;
  if (typeof e.format < "u") {
    if (!ts(lc, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const o = lc[n];
  let r = te.filter;
  (typeof e.filter == "function" || ge(e.filter)) && (r = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in Eh ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = te.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const s = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : te.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : te.addQueryPrefix,
    allowDots: s,
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
function pw(e, t = {}) {
  let n = e;
  const o = hw(t);
  let r, i;
  typeof o.filter == "function" ? (i = o.filter, n = i("", n)) : ge(o.filter) && (i = o.filter, r = i);
  const s = [];
  if (typeof n != "object" || n === null) return "";
  const u = Eh[o.arrayFormat], c = u === "comma" && o.commaRoundTrip;
  r || (r = Object.keys(n)), o.sort && r.sort(o.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < r.length; ++p) {
    const m = r[p];
    o.skipNulls && n[m] === null || Ch(s, wh(n[m], m, u, c, o.allowEmptyArrays, o.strictNullHandling, o.skipNulls, o.encodeDotInKeys, o.encode ? o.encoder : null, o.filter, o.sort, o.allowDots, o.serializeDate, o.format, o.formatter, o.encodeValuesOnly, o.charset, d));
  }
  const f = s.join(o.delimiter);
  let h = o.addQueryPrefix === !0 ? "?" : "";
  return o.charsetSentinel && (o.charset === "iso-8859-1" ? h += "utf8=%26%2310003%3B&" : h += "utf8=%E2%9C%93&"), f.length > 0 ? h + f : "";
}
function mw(e) {
  return pw(e, { arrayFormat: "brackets" });
}
function gw(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var dc;
function Xs(e) {
  let t;
  return (dc ?? (t = new globalThis.TextEncoder(), dc = t.encode.bind(t)))(e);
}
var fc;
function hc(e) {
  let t;
  return (fc ?? (t = new globalThis.TextDecoder(), fc = t.decode.bind(t)))(e);
}
var Ee, Ce, Fr = class {
  constructor() {
    Ee.set(this, void 0), Ce.set(this, void 0), O(this, Ee, new Uint8Array(), "f"), O(this, Ce, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Xs(e) : e;
    O(this, Ee, gw([S(this, Ee, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = _w(S(this, Ee, "f"), S(this, Ce, "f"))) != null; ) {
      if (o.carriage && S(this, Ce, "f") == null) {
        O(this, Ce, o.index, "f");
        continue;
      }
      if (S(this, Ce, "f") != null && (o.index !== S(this, Ce, "f") + 1 || o.carriage)) {
        n.push(hc(S(this, Ee, "f").subarray(0, S(this, Ce, "f") - 1))), O(this, Ee, S(this, Ee, "f").subarray(S(this, Ce, "f")), "f"), O(this, Ce, null, "f");
        continue;
      }
      const r = S(this, Ce, "f") !== null ? o.preceding - 1 : o.preceding, i = hc(S(this, Ee, "f").subarray(0, r));
      n.push(i), O(this, Ee, S(this, Ee, "f").subarray(o.index), "f"), O(this, Ce, null, "f");
    }
    return n;
  }
  flush() {
    return S(this, Ee, "f").length ? this.decode(`
`) : [];
  }
};
Ee = /* @__PURE__ */ new WeakMap(), Ce = /* @__PURE__ */ new WeakMap();
Fr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Fr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function _w(e, t) {
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
function yw(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var yr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, pc = (e, t, n) => {
  if (e) {
    if (tw(yr, e)) return e;
    se(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(yr))}`);
  }
};
function Bn() {
}
function Ho(e, t, n) {
  return !t || yr[e] > yr[n] ? Bn : t[e].bind(t);
}
var vw = {
  error: Bn,
  warn: Bn,
  info: Bn,
  debug: Bn
}, mc = /* @__PURE__ */ new WeakMap();
function se(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return vw;
  const o = mc.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: Ho("error", t, n),
    warn: Ho("warn", t, n),
    info: Ho("info", t, n),
    debug: Ho("debug", t, n)
  };
  return mc.set(t, [n, r]), r;
}
var It = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Nn, ao = class qn {
  constructor(t, n, o) {
    this.iterator = t, Nn.set(this, void 0), this.controller = n, O(this, Nn, o, "f");
  }
  static fromSSEResponse(t, n, o, r) {
    let i = !1;
    const s = o ? se(o) : console;
    async function* u() {
      if (i) throw new U("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of Aw(t, n))
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
              if (f && f.error) throw new ce(void 0, f.error, void 0, t.headers);
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
              if (d.event == "error") throw new ce(void 0, f.error, f.message, void 0);
              yield {
                event: d.event,
                data: f
              };
            }
          }
        c = !0;
      } catch (d) {
        if (Zi(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new qn(u, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    async function* i() {
      const u = new Fr(), c = Ah(t);
      for await (const d of c) for (const f of u.decode(d)) yield f;
      for (const d of u.flush()) yield d;
    }
    async function* s() {
      if (r) throw new U("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of i())
          u || c && (yield JSON.parse(c));
        u = !0;
      } catch (c) {
        if (Zi(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new qn(s, n, o);
  }
  [(Nn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new qn(() => r(t), this.controller, S(this, Nn, "f")), new qn(() => r(n), this.controller, S(this, Nn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return yh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const s = Xs(JSON.stringify(r) + `
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
async function* Aw(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new U("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new U("Attempted to iterate over a response with no body");
  const n = new Sw(), o = new Fr(), r = Ah(e.body);
  for await (const i of Tw(r)) for (const s of o.decode(i)) {
    const u = n.decode(s);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const s = n.decode(i);
    s && (yield s);
  }
}
async function* Tw(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Xs(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = yw(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Sw = class {
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
    let [t, n, o] = Ew(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Ew(e, t) {
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
async function Ih(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, s = await (async () => {
    if (t.options.stream)
      return se(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : ao.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : bh(await n.json(), n) : await n.text();
  })();
  return se(e).debug(`[${o}] response parsed`, It({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: s,
    durationMs: Date.now() - i
  })), s;
}
function bh(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Hn, Rh = class Ph extends Promise {
  constructor(t, n, o = Ih) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, Hn.set(this, void 0), O(this, Hn, t, "f");
  }
  _thenUnwrap(t) {
    return new Ph(S(this, Hn, "f"), this.responsePromise, async (n, o) => bh(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(S(this, Hn, "f"), t))), this.parsedPromise;
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
var Vo, Or = class {
  constructor(e, t, n, o) {
    Vo.set(this, void 0), O(this, Vo, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new U("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await S(this, Vo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Vo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Cw = class extends Rh {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await Ih(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, vt = class extends Or {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, Y = class extends Or {
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
        ...Ys(this.options.query),
        after: t
      }
    } : null;
  }
}, le = class extends Or {
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
        ...Ys(this.options.query),
        after: e
      }
    } : null;
  }
}, at = class extends Or {
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
        ...Ys(this.options.query),
        after: e
      }
    } : null;
  }
}, ww = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, Iw = "urn:ietf:params:oauth:grant-type:token-exchange", bw = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? _h();
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
      grant_type: Iw,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: ww[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new gh(t.status, s, t.headers) : ce.generate(t.status, s, `Token exchange failed with status ${t.status}`, t.headers);
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
}, Mh = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function jn(e, t, n) {
  return Mh(), new File(e, t ?? "unknown_file", n);
}
function nr(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Qs = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Gr = async (e, t) => ns(e.body) ? {
  ...e,
  body: await xh(e.body, t)
} : e, ze = async (e, t) => ({
  ...e,
  body: await xh(e.body, t)
}), gc = /* @__PURE__ */ new WeakMap();
function Rw(e) {
  const t = typeof e == "function" ? e : e.fetch, n = gc.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return gc.set(t, o), o;
}
var xh = async (e, t) => {
  if (!await Rw(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, r]) => os(n, o, r))), n;
}, Nh = (e) => e instanceof Blob && "name" in e, Pw = (e) => typeof e == "object" && e !== null && (e instanceof Response || Qs(e) || Nh(e)), ns = (e) => {
  if (Pw(e)) return !0;
  if (Array.isArray(e)) return e.some(ns);
  if (e && typeof e == "object") {
    for (const t in e) if (ns(e[t])) return !0;
  }
  return !1;
}, os = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, jn([await n.blob()], nr(n)));
    else if (Qs(n)) e.append(t, jn([await new Response(vh(n)).blob()], nr(n)));
    else if (Nh(n)) e.append(t, n, nr(n));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => os(e, t + "[]", o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, r]) => os(e, `${t}[${o}]`, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, kh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Mw = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && kh(e), xw = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Nw(e, t, n) {
  if (Mh(), e = await e, Mw(e))
    return e instanceof File ? e : jn([await e.arrayBuffer()], e.name);
  if (xw(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), jn(await rs(r), t, n);
  }
  const o = await rs(e);
  if (t || (t = nr(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return jn(o, t, n);
}
async function rs(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (kh(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Qs(e)) for await (const n of e) t.push(...await rs(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${kw(e)}`);
  }
  return t;
}
function kw(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var R = class {
  constructor(e) {
    this._client = e;
  }
};
function Dh(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var _c = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Dw = (e = Dh) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], s = n.reduce((f, h, p) => {
    /[?#]/.test(h) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? _c) ?? _c)?.toString) && (g = m + "", i.push({
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
    throw new U(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${s}
${h}`);
  }
  return s;
}, v = /* @__PURE__ */ Dw(Dh), $h = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/chat/completions/${e}/messages`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function vr(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Zs(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function Ao(e) {
  return e?.$brand === "auto-parseable-tool";
}
function $w(e, t) {
  return !t || !Lh(t) ? {
    ...e,
    choices: e.choices.map((n) => (Uh(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : js(e, t);
}
function js(e, t) {
  const n = e.choices.map((o) => {
    if (o.finish_reason === "length") throw new ph();
    if (o.finish_reason === "content_filter") throw new mh();
    return Uh(o.message.tool_calls), {
      ...o,
      message: {
        ...o.message,
        ...o.message.tool_calls ? { tool_calls: o.message.tool_calls?.map((r) => Uw(t, r)) ?? void 0 } : void 0,
        parsed: o.message.content && !o.message.refusal ? Lw(t, o.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function Lw(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function Uw(e, t) {
  const n = e.tools?.find((o) => vr(o) && o.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: Ao(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function Fw(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((o) => vr(o) && o.function?.name === t.function.name);
  return vr(n) && (Ao(n) || n?.function.strict || !1);
}
function Lh(e) {
  return Zs(e.response_format) ? !0 : e.tools?.some((t) => Ao(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function Uh(e) {
  for (const t of e || []) if (t.type !== "function") throw new U(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function Ow(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new U(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new U(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Ar = (e) => e?.role === "assistant", Fh = (e) => e?.role === "tool", is, or, rr, Vn, Jn, ir, Kn, je, Wn, Tr, Sr, Kt, Oh, ea = class {
  constructor() {
    is.add(this), this.controller = new AbortController(), or.set(this, void 0), rr.set(this, () => {
    }), Vn.set(this, () => {
    }), Jn.set(this, void 0), ir.set(this, () => {
    }), Kn.set(this, () => {
    }), je.set(this, {}), Wn.set(this, !1), Tr.set(this, !1), Sr.set(this, !1), Kt.set(this, !1), O(this, or, new Promise((e, t) => {
      O(this, rr, e, "f"), O(this, Vn, t, "f");
    }), "f"), O(this, Jn, new Promise((e, t) => {
      O(this, ir, e, "f"), O(this, Kn, t, "f");
    }), "f"), S(this, or, "f").catch(() => {
    }), S(this, Jn, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, S(this, is, "m", Oh).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (S(this, rr, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return S(this, Wn, "f");
  }
  get errored() {
    return S(this, Tr, "f");
  }
  get aborted() {
    return S(this, Sr, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (S(this, je, "f")[e] || (S(this, je, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = S(this, je, "f")[e];
    if (!n) return this;
    const o = n.findIndex((r) => r.listener === t);
    return o >= 0 && n.splice(o, 1), this;
  }
  once(e, t) {
    return (S(this, je, "f")[e] || (S(this, je, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      O(this, Kt, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    O(this, Kt, !0, "f"), await S(this, Jn, "f");
  }
  _emit(e, ...t) {
    if (S(this, Wn, "f")) return;
    e === "end" && (O(this, Wn, !0, "f"), S(this, ir, "f").call(this));
    const n = S(this, je, "f")[e];
    if (n && (S(this, je, "f")[e] = n.filter((o) => !o.once), n.forEach(({ listener: o }) => o(...t))), e === "abort") {
      const o = t[0];
      !S(this, Kt, "f") && !n?.length && Promise.reject(o), S(this, Vn, "f").call(this, o), S(this, Kn, "f").call(this, o), this._emit("end");
      return;
    }
    if (e === "error") {
      const o = t[0];
      !S(this, Kt, "f") && !n?.length && Promise.reject(o), S(this, Vn, "f").call(this, o), S(this, Kn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
or = /* @__PURE__ */ new WeakMap(), rr = /* @__PURE__ */ new WeakMap(), Vn = /* @__PURE__ */ new WeakMap(), Jn = /* @__PURE__ */ new WeakMap(), ir = /* @__PURE__ */ new WeakMap(), Kn = /* @__PURE__ */ new WeakMap(), je = /* @__PURE__ */ new WeakMap(), Wn = /* @__PURE__ */ new WeakMap(), Tr = /* @__PURE__ */ new WeakMap(), Sr = /* @__PURE__ */ new WeakMap(), Kt = /* @__PURE__ */ new WeakMap(), is = /* @__PURE__ */ new WeakSet(), Oh = function(t) {
  if (O(this, Tr, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new xe()), t instanceof xe)
    return O(this, Sr, !0, "f"), this._emit("abort", t);
  if (t instanceof U) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new U(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new U(String(t)));
};
function Gw(e) {
  return typeof e.parse == "function";
}
var de, ss, Er, as, ls, us, Gh, Bh, Bw = 10, qh = class extends ea {
  constructor() {
    super(...arguments), de.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const t = e.choices[0]?.message;
    return t && this._addMessage(t), e;
  }
  _addMessage(e, t = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), t) {
      if (this._emit("message", e), Fh(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (Ar(e) && e.tool_calls)
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
    return await this.done(), S(this, de, "m", ss).call(this);
  }
  async finalMessage() {
    return await this.done(), S(this, de, "m", Er).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), S(this, de, "m", as).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), S(this, de, "m", ls).call(this);
  }
  async totalUsage() {
    return await this.done(), S(this, de, "m", us).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = S(this, de, "m", Er).call(this);
    t && this._emit("finalMessage", t);
    const n = S(this, de, "m", ss).call(this);
    n && this._emit("finalContent", n);
    const o = S(this, de, "m", as).call(this);
    o && this._emit("finalFunctionToolCall", o);
    const r = S(this, de, "m", ls).call(this);
    r != null && this._emit("finalFunctionToolCallResult", r), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", S(this, de, "m", us).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), S(this, de, "m", Gh).call(this, t);
    const r = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(js(r, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const o of t.messages) this._addMessage(o, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const o = "tool", { tool_choice: r = "auto", stream: i, ...s } = t, u = typeof r != "string" && r.type === "function" && r?.function?.name, { maxChatCompletions: c = Bw } = n || {}, d = t.tools.map((p) => {
      if (Ao(p)) {
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
      if (!m) throw new U("missing message in ChatCompletion response");
      if (!m.tool_calls?.length) return;
      for (const g of m.tool_calls) {
        if (g.type !== "function") continue;
        const _ = g.id, { name: y, arguments: E } = g.function, C = f[y];
        if (C) {
          if (u && u !== y) {
            const A = `Invalid tool_call: ${JSON.stringify(y)}. ${JSON.stringify(u)} requested. Please try again`;
            this._addMessage({
              role: o,
              tool_call_id: _,
              content: A
            });
            continue;
          }
        } else {
          const A = `Invalid tool_call: ${JSON.stringify(y)}. Available options are: ${Object.keys(f).map(($) => JSON.stringify($)).join(", ")}. Please try again`;
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: A
          });
          continue;
        }
        let w;
        try {
          w = Gw(C) ? await C.parse(E) : E;
        } catch (A) {
          const $ = A instanceof Error ? A.message : String(A);
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: $
          });
          continue;
        }
        const P = await C.function(w, this), M = S(this, de, "m", Bh).call(this, P);
        if (this._addMessage({
          role: o,
          tool_call_id: _,
          content: M
        }), u) return;
      }
    }
  }
};
de = /* @__PURE__ */ new WeakSet(), ss = function() {
  return S(this, de, "m", Er).call(this).content ?? null;
}, Er = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (Ar(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new U("stream ended without producing a ChatCompletionMessage with role=assistant");
}, as = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Ar(n) && n?.tool_calls?.length) for (let o = n.tool_calls.length - 1; o >= 0; o--) {
      const r = n.tool_calls[o];
      if (r?.type === "function") return r.function;
    }
  }
}, ls = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Fh(n) && n.content != null && typeof n.content == "string" && this.messages.some((o) => o.role === "assistant" && o.tool_calls?.some((r) => r.type === "function" && r.id === n.tool_call_id))) return n.content;
  }
}, us = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, Gh = function(t) {
  if (t.n != null && t.n > 1) throw new U("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, Bh = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var qw = class Hh extends qh {
  static runTools(t, n, o) {
    const r = new Hh(), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), Ar(t) && t.content && this._emit("content", t.content);
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
}, Hw = class extends Error {
}, Vw = class extends Error {
};
function Jw(e, t = oe.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return Kw(e.trim(), t);
}
var Kw = (e, t) => {
  const n = e.length;
  let o = 0;
  const r = (p) => {
    throw new Hw(`${p} at position ${o}`);
  }, i = (p) => {
    throw new Vw(`${p} at position ${o}`);
  }, s = () => (h(), o >= n && r("Unexpected end of input"), e[o] === '"' ? u() : e[o] === "{" ? c() : e[o] === "[" ? d() : e.substring(o, o + 4) === "null" || oe.NULL & t && n - o < 4 && "null".startsWith(e.substring(o)) ? (o += 4, null) : e.substring(o, o + 4) === "true" || oe.BOOL & t && n - o < 4 && "true".startsWith(e.substring(o)) ? (o += 4, !0) : e.substring(o, o + 5) === "false" || oe.BOOL & t && n - o < 5 && "false".startsWith(e.substring(o)) ? (o += 5, !1) : e.substring(o, o + 8) === "Infinity" || oe.INFINITY & t && n - o < 8 && "Infinity".startsWith(e.substring(o)) ? (o += 8, 1 / 0) : e.substring(o, o + 9) === "-Infinity" || oe.MINUS_INFINITY & t && 1 < n - o && n - o < 9 && "-Infinity".startsWith(e.substring(o)) ? (o += 9, -1 / 0) : e.substring(o, o + 3) === "NaN" || oe.NAN & t && n - o < 3 && "NaN".startsWith(e.substring(o)) ? (o += 3, NaN) : f()), u = () => {
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
    o++, h();
    const p = {};
    try {
      for (; e[o] !== "}"; ) {
        if (h(), o >= n && oe.OBJ & t) return p;
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
          if (oe.OBJ & t) return p;
          throw g;
        }
        h(), e[o] === "," && o++;
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
        p.push(s()), h(), e[o] === "," && o++;
    } catch {
      if (oe.ARR & t) return p;
      r("Expected ']' at end of array");
    }
    return o++, p;
  }, f = () => {
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
  }, h = () => {
    for (; o < n && [
      32,
      10,
      13,
      9
    ].includes(e.charCodeAt(o)); ) o++;
  };
  return s();
}, yc = (e) => Jw(e, oe.ALL ^ oe.NUM), j, Ze, Bt, dt, pi, Jo, mi, gi, _i, Ko, yi, vc, Vh = class cs extends qh {
  constructor(t) {
    super(), j.add(this), Ze.set(this, void 0), Bt.set(this, void 0), dt.set(this, void 0), O(this, Ze, t, "f"), O(this, Bt, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return S(this, dt, "f");
  }
  static fromReadableStream(t) {
    const n = new cs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, o) {
    const r = new cs(n);
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
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), S(this, j, "m", pi).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const s of i) S(this, j, "m", mi).call(this, s);
    if (i.controller.signal?.aborted) throw new xe();
    return this._addChatCompletion(S(this, j, "m", Ko).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), S(this, j, "m", pi).call(this), this._connected();
    const r = ao.fromReadableStream(t, this.controller);
    let i;
    for await (const s of r)
      i && i !== s.id && this._addChatCompletion(S(this, j, "m", Ko).call(this)), S(this, j, "m", mi).call(this, s), i = s.id;
    if (r.controller.signal?.aborted) throw new xe();
    return this._addChatCompletion(S(this, j, "m", Ko).call(this));
  }
  [(Ze = /* @__PURE__ */ new WeakMap(), Bt = /* @__PURE__ */ new WeakMap(), dt = /* @__PURE__ */ new WeakMap(), j = /* @__PURE__ */ new WeakSet(), pi = function() {
    this.ended || O(this, dt, void 0, "f");
  }, Jo = function(n) {
    let o = S(this, Bt, "f")[n.index];
    return o || (o = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, S(this, Bt, "f")[n.index] = o, o);
  }, mi = function(n) {
    if (this.ended) return;
    const o = S(this, j, "m", vc).call(this, n);
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
      const s = S(this, j, "m", Jo).call(this, i);
      i.finish_reason && (S(this, j, "m", _i).call(this, i), s.current_tool_call_index != null && S(this, j, "m", gi).call(this, i, s.current_tool_call_index));
      for (const u of r.delta.tool_calls ?? [])
        s.current_tool_call_index !== u.index && (S(this, j, "m", _i).call(this, i), s.current_tool_call_index != null && S(this, j, "m", gi).call(this, i, s.current_tool_call_index)), s.current_tool_call_index = u.index;
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
  }, gi = function(n, o) {
    if (S(this, j, "m", Jo).call(this, n).done_tool_calls.has(o)) return;
    const r = n.message.tool_calls?.[o];
    if (!r) throw new Error("no tool call snapshot");
    if (!r.type) throw new Error("tool call snapshot missing `type`");
    if (r.type === "function") {
      const i = S(this, Ze, "f")?.tools?.find((s) => vr(s) && s.function.name === r.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: r.function.name,
        index: o,
        arguments: r.function.arguments,
        parsed_arguments: Ao(i) ? i.$parseRaw(r.function.arguments) : i?.function.strict ? JSON.parse(r.function.arguments) : null
      });
    } else r.type;
  }, _i = function(n) {
    const o = S(this, j, "m", Jo).call(this, n);
    if (n.message.content && !o.content_done) {
      o.content_done = !0;
      const r = S(this, j, "m", yi).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: r ? r.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !o.refusal_done && (o.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !o.logprobs_content_done && (o.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !o.logprobs_refusal_done && (o.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Ko = function() {
    if (this.ended) throw new U("stream has ended, this shouldn't happen");
    const n = S(this, dt, "f");
    if (!n) throw new U("request ended without sending any chunks");
    return O(this, dt, void 0, "f"), O(this, Bt, [], "f"), Ww(n, S(this, Ze, "f"));
  }, yi = function() {
    const n = S(this, Ze, "f")?.response_format;
    return Zs(n) ? n : null;
  }, vc = function(n) {
    var o, r, i, s;
    let u = S(this, dt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = O(this, dt, {
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
        const { content: A, refusal: $, ...I } = m;
        Object.assign(_.logprobs, I), A && ((o = _.logprobs).content ?? (o.content = []), _.logprobs.content.push(...A)), $ && ((r = _.logprobs).refusal ?? (r.refusal = []), _.logprobs.refusal.push(...$));
      }
      if (h && (_.finish_reason = h, S(this, Ze, "f") && Lh(S(this, Ze, "f")))) {
        if (h === "length") throw new ph();
        if (h === "content_filter") throw new mh();
      }
      if (Object.assign(_, g), !f) continue;
      const { content: y, refusal: E, function_call: C, role: w, tool_calls: P, ...M } = f;
      if (Object.assign(_.message, M), E && (_.message.refusal = (_.message.refusal || "") + E), w && (_.message.role = w), C && (_.message.function_call ? (C.name && (_.message.function_call.name = C.name), C.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += C.arguments)) : _.message.function_call = C), y && (_.message.content = (_.message.content || "") + y, !_.message.refusal && S(this, j, "m", yi).call(this) && (_.message.parsed = yc(_.message.content))), P) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: A, id: $, type: I, function: x, ...F } of P) {
          const H = (s = _.message.tool_calls)[A] ?? (s[A] = {});
          Object.assign(H, F), $ && (H.id = $), I && (H.type = I), x && (H.function ?? (H.function = {
            name: x.name ?? "",
            arguments: ""
          })), x?.name && (H.function.name = x.name), x?.arguments && (H.function.arguments += x.arguments, Fw(S(this, Ze, "f"), H) && (H.function.parsed_arguments = yc(H.function.arguments)));
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
    return new ao(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function Ww(e, t) {
  const { id: n, choices: o, created: r, model: i, system_fingerprint: s, ...u } = e;
  return $w({
    ...u,
    id: n,
    choices: o.map(({ message: c, finish_reason: d, index: f, logprobs: h, ...p }) => {
      if (!d) throw new U(`missing finish_reason for choice ${f}`);
      const { content: m = null, function_call: g, tool_calls: _, ...y } = c, E = c.role;
      if (!E) throw new U(`missing role for choice ${f}`);
      if (g) {
        const { arguments: C, name: w } = g;
        if (C == null) throw new U(`missing function_call.arguments for choice ${f}`);
        if (!w) throw new U(`missing function_call.name for choice ${f}`);
        return {
          ...p,
          message: {
            content: m,
            function_call: {
              arguments: C,
              name: w
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
          tool_calls: _.map((C, w) => {
            const { function: P, type: M, id: A, ...$ } = C, { arguments: I, name: x, ...F } = P || {};
            if (A == null) throw new U(`missing choices[${f}].tool_calls[${w}].id
${Wo(e)}`);
            if (M == null) throw new U(`missing choices[${f}].tool_calls[${w}].type
${Wo(e)}`);
            if (x == null) throw new U(`missing choices[${f}].tool_calls[${w}].function.name
${Wo(e)}`);
            if (I == null) throw new U(`missing choices[${f}].tool_calls[${w}].function.arguments
${Wo(e)}`);
            return {
              ...$,
              id: A,
              type: M,
              function: {
                ...F,
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
function Wo(e) {
  return JSON.stringify(e);
}
var zw = class ds extends Vh {
  static fromReadableStream(t) {
    const n = new ds(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, o) {
    const r = new ds(n), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
}, ta = class extends R {
  constructor() {
    super(...arguments), this.messages = new $h(this._client);
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
    return Ow(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => js(n, e));
  }
  runTools(e, t) {
    return e.stream ? zw.runTools(this._client, e, t) : qw.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Vh.createChatCompletion(this._client, e, t);
  }
};
ta.Messages = $h;
var na = class extends R {
  constructor() {
    super(...arguments), this.completions = new ta(this._client);
  }
};
na.Completions = ta;
var Jh = class extends R {
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
}, Kh = class extends R {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", le, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, Wh = class extends R {
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
    return this._client.getAPIList("/organization/certificates", le, {
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
    return this._client.getAPIList("/organization/certificates/activate", vt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t) {
    return this._client.getAPIList("/organization/certificates/deactivate", vt, {
      body: e,
      method: "post",
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, zh = class extends R {
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
}, Yh = class extends R {
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
    return this._client.getAPIList("/organization/invites", le, {
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
}, Xh = class extends R {
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
    return this._client.getAPIList("/organization/roles", at, {
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
}, Qh = class extends R {
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
    return this._client.getAPIList("/organization/spend_alerts", le, {
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
}, Zh = class extends R {
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
}, jh = class extends R {
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
    return this._client.getAPIList(v`/organization/groups/${e}/roles`, at, {
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
}, ep = class extends R {
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
    return this._client.getAPIList(v`/organization/groups/${e}/users`, at, {
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
}, Br = class extends R {
  constructor() {
    super(...arguments), this.users = new ep(this._client), this.roles = new jh(this._client);
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
    return this._client.getAPIList("/organization/groups", at, {
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
Br.Users = ep;
Br.Roles = jh;
var tp = class extends R {
  retrieve(e, t, n) {
    const { project_id: o } = t;
    return this._client.get(v`/organization/projects/${o}/api_keys/${e}`, {
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/api_keys`, le, {
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
}, np = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates`, le, {
      query: t,
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  activate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/activate`, vt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
  deactivate(e, t, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/certificates/deactivate`, vt, {
      body: t,
      method: "post",
      ...n,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, op = class extends R {
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
}, rp = class extends R {
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
}, ip = class extends R {
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
}, sp = class extends R {
  listRateLimits(e, t = {}, n) {
    return this._client.getAPIList(v`/organization/projects/${e}/rate_limits`, le, {
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
}, ap = class extends R {
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
    return this._client.getAPIList(v`/projects/${e}/roles`, at, {
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
}, lp = class extends R {
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
    return this._client.getAPIList(v`/organization/projects/${e}/service_accounts`, le, {
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
}, up = class extends R {
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
    return this._client.getAPIList(v`/organization/projects/${e}/spend_alerts`, le, {
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
}, cp = class extends R {
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
    return this._client.getAPIList(v`/projects/${o}/groups/${e}/roles`, at, {
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
}, oa = class extends R {
  constructor() {
    super(...arguments), this.roles = new cp(this._client);
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
    return this._client.getAPIList(v`/organization/projects/${e}/groups`, at, {
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
oa.Roles = cp;
var dp = class extends R {
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
    return this._client.getAPIList(v`/projects/${o}/users/${e}/roles`, at, {
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
}, ra = class extends R {
  constructor() {
    super(...arguments), this.roles = new dp(this._client);
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
    return this._client.getAPIList(v`/organization/projects/${e}/users`, le, {
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
ra.Roles = dp;
var be = class extends R {
  constructor() {
    super(...arguments), this.users = new ra(this._client), this.serviceAccounts = new lp(this._client), this.apiKeys = new tp(this._client), this.rateLimits = new sp(this._client), this.modelPermissions = new ip(this._client), this.hostedToolPermissions = new rp(this._client), this.groups = new oa(this._client), this.roles = new ap(this._client), this.dataRetention = new op(this._client), this.spendAlerts = new up(this._client), this.certificates = new np(this._client);
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
    return this._client.getAPIList("/organization/projects", le, {
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
be.Users = ra;
be.ServiceAccounts = lp;
be.APIKeys = tp;
be.RateLimits = sp;
be.ModelPermissions = ip;
be.HostedToolPermissions = rp;
be.Groups = oa;
be.Roles = ap;
be.DataRetention = op;
be.SpendAlerts = up;
be.Certificates = np;
var fp = class extends R {
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
    return this._client.getAPIList(v`/organization/users/${e}/roles`, at, {
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
}, ia = class extends R {
  constructor() {
    super(...arguments), this.roles = new fp(this._client);
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
    return this._client.getAPIList("/organization/users", le, {
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
ia.Roles = fp;
var Re = class extends R {
  constructor() {
    super(...arguments), this.auditLogs = new Kh(this._client), this.adminAPIKeys = new Jh(this._client), this.usage = new Zh(this._client), this.invites = new Yh(this._client), this.users = new ia(this._client), this.groups = new Br(this._client), this.roles = new Xh(this._client), this.dataRetention = new zh(this._client), this.spendAlerts = new Qh(this._client), this.certificates = new Wh(this._client), this.projects = new be(this._client);
  }
};
Re.AuditLogs = Kh;
Re.AdminAPIKeys = Jh;
Re.Usage = Zh;
Re.Invites = Yh;
Re.Users = ia;
Re.Groups = Br;
Re.Roles = Xh;
Re.DataRetention = zh;
Re.SpendAlerts = Qh;
Re.Certificates = Wh;
Re.Projects = be;
var sa = class extends R {
  constructor() {
    super(...arguments), this.organization = new Re(this._client);
  }
};
sa.Organization = Re;
var hp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* Yw(e) {
  if (!e) return;
  if (hp in e) {
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
var D = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, s] of Yw(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), s === null ? (t.delete(i), n.add(u)) : (t.append(i, s), n.delete(u));
    }
  }
  return {
    [hp]: !0,
    values: t,
    nulls: n
  };
}, pp = class extends R {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: D([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, mp = class extends R {
  create(e, t) {
    return this._client.post("/audio/transcriptions", ze({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, gp = class extends R {
  create(e, t) {
    return this._client.post("/audio/translations", ze({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, To = class extends R {
  constructor() {
    super(...arguments), this.transcriptions = new mp(this._client), this.translations = new gp(this._client), this.speech = new pp(this._client);
  }
};
To.Transcriptions = mp;
To.Translations = gp;
To.Speech = pp;
var _p = class extends R {
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
}, yp = class extends R {
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
}, vp = class extends R {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Ap = class extends R {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, qr = class extends R {
  constructor() {
    super(...arguments), this.sessions = new vp(this._client), this.transcriptionSessions = new Ap(this._client);
  }
};
qr.Sessions = vp;
qr.TranscriptionSessions = Ap;
var Tp = class extends R {
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
}, Sp = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/chatkit/threads/${e}`, {
      ...t,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", le, {
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
    return this._client.getAPIList(v`/chatkit/threads/${e}/items`, le, {
      query: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Hr = class extends R {
  constructor() {
    super(...arguments), this.sessions = new Tp(this._client), this.threads = new Sp(this._client);
  }
};
Hr.Sessions = Tp;
Hr.Threads = Sp;
var Ep = class extends R {
  create(e, t, n) {
    return this._client.post(v`/threads/${e}/messages`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(v`/threads/${o}/messages/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/messages/${e}`, {
      body: r,
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
    const { thread_id: o } = t;
    return this._client.delete(v`/threads/${o}/messages/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Cp = class extends R {
  retrieve(e, t, n) {
    const { thread_id: o, run_id: r, ...i } = t;
    return this._client.get(v`/threads/${o}/runs/${r}/steps/${e}`, {
      query: i,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.getAPIList(v`/threads/${o}/runs/${e}/steps`, Y, {
      query: r,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Xw = (e) => {
  if (typeof Buffer < "u") {
    const t = Buffer.from(e, "base64");
    return Array.from(new Float32Array(t.buffer, t.byteOffset, t.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const t = atob(e), n = t.length, o = new Uint8Array(n);
    for (let r = 0; r < n; r++) o[r] = t.charCodeAt(r);
    return Array.from(new Float32Array(o.buffer));
  }
}, ft = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, ae, Nt, fs, We, sr, Ue, kt, Zt, Rt, Cr, we, ar, lr, eo, zn, Yn, Ac, Tc, Sc, Ec, Cc, wc, Ic, to = class extends ea {
  constructor() {
    super(...arguments), ae.add(this), fs.set(this, []), We.set(this, {}), sr.set(this, {}), Ue.set(this, void 0), kt.set(this, void 0), Zt.set(this, void 0), Rt.set(this, void 0), Cr.set(this, void 0), we.set(this, void 0), ar.set(this, void 0), lr.set(this, void 0), eo.set(this, void 0);
  }
  [(fs = /* @__PURE__ */ new WeakMap(), We = /* @__PURE__ */ new WeakMap(), sr = /* @__PURE__ */ new WeakMap(), Ue = /* @__PURE__ */ new WeakMap(), kt = /* @__PURE__ */ new WeakMap(), Zt = /* @__PURE__ */ new WeakMap(), Rt = /* @__PURE__ */ new WeakMap(), Cr = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakMap(), ar = /* @__PURE__ */ new WeakMap(), lr = /* @__PURE__ */ new WeakMap(), eo = /* @__PURE__ */ new WeakMap(), ae = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const o = ao.fromReadableStream(e, this.controller);
    for await (const r of o) S(this, ae, "m", zn).call(this, r);
    if (o.controller.signal?.aborted) throw new xe();
    return this._addRun(S(this, ae, "m", Yn).call(this));
  }
  toReadableStream() {
    return new ao(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
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
    }, s = await e.submitToolOutputs(t, i, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const u of s) S(this, ae, "m", zn).call(this, u);
    if (s.controller.signal?.aborted) throw new xe();
    return this._addRun(S(this, ae, "m", Yn).call(this));
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
    return S(this, ar, "f");
  }
  currentRun() {
    return S(this, lr, "f");
  }
  currentMessageSnapshot() {
    return S(this, Ue, "f");
  }
  currentRunStepSnapshot() {
    return S(this, eo, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(S(this, We, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(S(this, sr, "f"));
  }
  async finalRun() {
    if (await this.done(), !S(this, kt, "f")) throw Error("Final run was not received.");
    return S(this, kt, "f");
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
    for await (const s of i) S(this, ae, "m", zn).call(this, s);
    if (i.controller.signal?.aborted) throw new xe();
    return this._addRun(S(this, ae, "m", Yn).call(this));
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
    for await (const u of s) S(this, ae, "m", zn).call(this, u);
    if (s.controller.signal?.aborted) throw new xe();
    return this._addRun(S(this, ae, "m", Yn).call(this));
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
      else if (di(r) && di(o)) r = this.accumulateDelta(r, o);
      else if (Array.isArray(r) && Array.isArray(o)) {
        if (r.every((i) => typeof i == "string" || typeof i == "number")) {
          r.push(...o);
          continue;
        }
        for (const i of o) {
          if (!di(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
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
Nt = to, zn = function(t) {
  if (!this.ended)
    switch (O(this, ar, t, "f"), S(this, ae, "m", Sc).call(this, t), t.event) {
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
        S(this, ae, "m", Ic).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        S(this, ae, "m", Tc).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        S(this, ae, "m", Ac).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, Yn = function() {
  if (this.ended) throw new U("stream has ended, this shouldn't happen");
  if (!S(this, kt, "f")) throw Error("Final run has not been received");
  return S(this, kt, "f");
}, Ac = function(t) {
  const [n, o] = S(this, ae, "m", Cc).call(this, t, S(this, Ue, "f"));
  O(this, Ue, n, "f"), S(this, sr, "f")[n.id] = n;
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
        if (r.index != S(this, Zt, "f")) {
          if (S(this, Rt, "f")) switch (S(this, Rt, "f").type) {
            case "text":
              this._emit("textDone", S(this, Rt, "f").text, S(this, Ue, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", S(this, Rt, "f").image_file, S(this, Ue, "f"));
              break;
          }
          O(this, Zt, r.index, "f");
        }
        O(this, Rt, n.content[r.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (S(this, Zt, "f") !== void 0) {
        const r = t.data.content[S(this, Zt, "f")];
        if (r) switch (r.type) {
          case "image_file":
            this._emit("imageFileDone", r.image_file, S(this, Ue, "f"));
            break;
          case "text":
            this._emit("textDone", r.text, S(this, Ue, "f"));
            break;
        }
      }
      S(this, Ue, "f") && this._emit("messageDone", t.data), O(this, Ue, void 0, "f");
  }
}, Tc = function(t) {
  const n = S(this, ae, "m", Ec).call(this, t);
  switch (O(this, eo, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const o = t.data.delta;
      if (o.step_details && o.step_details.type == "tool_calls" && o.step_details.tool_calls && n.step_details.type == "tool_calls") for (const r of o.step_details.tool_calls) r.index == S(this, Cr, "f") ? this._emit("toolCallDelta", r, n.step_details.tool_calls[r.index]) : (S(this, we, "f") && this._emit("toolCallDone", S(this, we, "f")), O(this, Cr, r.index, "f"), O(this, we, n.step_details.tool_calls[r.index], "f"), S(this, we, "f") && this._emit("toolCallCreated", S(this, we, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      O(this, eo, void 0, "f"), t.data.step_details.type == "tool_calls" && S(this, we, "f") && (this._emit("toolCallDone", S(this, we, "f")), O(this, we, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Sc = function(t) {
  S(this, fs, "f").push(t), this._emit("event", t);
}, Ec = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return S(this, We, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = S(this, We, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let o = t.data;
      if (o.delta) {
        const r = Nt.accumulateDelta(n, o.delta);
        S(this, We, "f")[t.data.id] = r;
      }
      return S(this, We, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      S(this, We, "f")[t.data.id] = t.data;
      break;
  }
  if (S(this, We, "f")[t.data.id]) return S(this, We, "f")[t.data.id];
  throw new Error("No snapshot available");
}, Cc = function(t, n) {
  let o = [];
  switch (t.event) {
    case "thread.message.created":
      return [t.data, o];
    case "thread.message.delta":
      if (!n) throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let r = t.data;
      if (r.delta.content) for (const i of r.delta.content) if (i.index in n.content) {
        let s = n.content[i.index];
        n.content[i.index] = S(this, ae, "m", wc).call(this, i, s);
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
}, wc = function(t, n) {
  return Nt.accumulateDelta(n, t);
}, Ic = function(t) {
  switch (O(this, lr, t.data, "f"), t.event) {
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
      O(this, kt, t.data, "f"), S(this, we, "f") && (this._emit("toolCallDone", S(this, we, "f")), O(this, we, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var aa = class extends R {
  constructor() {
    super(...arguments), this.steps = new Cp(this._client);
  }
  create(e, t, n) {
    const { include: o, ...r } = t;
    return this._client.post(v`/threads/${e}/runs`, {
      query: { include: o },
      body: r,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      stream: t.stream ?? !1,
      __synthesizeEventData: !0,
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { thread_id: o } = t;
    return this._client.get(v`/threads/${o}/runs/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/runs/${e}`, {
      body: r,
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
    const { thread_id: o } = t;
    return this._client.post(v`/threads/${o}/runs/${e}/cancel`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(o.id, { thread_id: e }, n);
  }
  createAndStream(e, t, n) {
    return to.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  async poll(e, t, n) {
    const o = D([n?.headers, {
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
          await vo(s);
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
    return to.createAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
  submitToolOutputs(e, t, n) {
    const { thread_id: o, ...r } = t;
    return this._client.post(v`/threads/${o}/runs/${e}/submit_tool_outputs`, {
      body: r,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
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
    return to.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
aa.Steps = Cp;
var Vr = class extends R {
  constructor() {
    super(...arguments), this.runs = new aa(this._client), this.messages = new Ep(this._client);
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
    return to.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Vr.Runs = aa;
Vr.Messages = Ep;
var fn = class extends R {
  constructor() {
    super(...arguments), this.realtime = new qr(this._client), this.chatkit = new Hr(this._client), this.assistants = new yp(this._client), this.threads = new Vr(this._client);
  }
};
fn.Realtime = qr;
fn.ChatKit = Hr;
fn.Assistants = yp;
fn.Threads = Vr;
var wp = class extends R {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, Ip = class extends R {
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(v`/containers/${o}/files/${e}/content`, {
      ...n,
      headers: D([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, la = class extends R {
  constructor() {
    super(...arguments), this.content = new Ip(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/containers/${e}/files`, Gr({
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
    return this._client.getAPIList(v`/containers/${e}/files`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  delete(e, t, n) {
    const { container_id: o } = t;
    return this._client.delete(v`/containers/${o}/files/${e}`, {
      ...n,
      headers: D([{ Accept: "*/*" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
la.Content = Ip;
var ua = class extends R {
  constructor() {
    super(...arguments), this.files = new la(this._client);
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
ua.Files = la;
var bp = class extends R {
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
    return this._client.getAPIList(v`/conversations/${e}/items`, le, {
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
}, ca = class extends R {
  constructor() {
    super(...arguments), this.items = new bp(this._client);
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
ca.Items = bp;
var Rp = class extends R {
  create(e, t) {
    const n = !!e.encoding_format;
    let o = n ? e.encoding_format : "base64";
    n && se(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const r = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: o
      },
      ...t,
      __security: { bearerAuth: !0 }
    });
    return n ? r : (se(this._client).debug("embeddings/decoding base64 embeddings from base64"), r._thenUnwrap((i) => (i && i.data && i.data.forEach((s) => {
      const u = s.embedding;
      s.embedding = Xw(u);
    }), i)));
  }
}, Pp = class extends R {
  retrieve(e, t, n) {
    const { eval_id: o, run_id: r } = t;
    return this._client.get(v`/evals/${o}/runs/${r}/output_items/${e}`, {
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
  list(e, t, n) {
    const { eval_id: o, ...r } = t;
    return this._client.getAPIList(v`/evals/${o}/runs/${e}/output_items`, Y, {
      query: r,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, da = class extends R {
  constructor() {
    super(...arguments), this.outputItems = new Pp(this._client);
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
    return this._client.getAPIList(v`/evals/${e}/runs`, Y, {
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
da.OutputItems = Pp;
var fa = class extends R {
  constructor() {
    super(...arguments), this.runs = new da(this._client);
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
fa.Runs = da;
var Mp = class extends R {
  create(e, t) {
    return this._client.post("/files", ze({
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
    const o = /* @__PURE__ */ new Set([
      "processed",
      "error",
      "deleted"
    ]), r = Date.now();
    let i = await this.retrieve(e);
    for (; !i.status || !o.has(i.status); )
      if (await vo(t), i = await this.retrieve(e), Date.now() - r > n) throw new zs({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, xp = class extends R {
}, Np = class extends R {
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
}, ha = class extends R {
  constructor() {
    super(...arguments), this.graders = new Np(this._client);
  }
};
ha.Graders = Np;
var kp = class extends R {
  create(e, t, n) {
    return this._client.getAPIList(v`/fine_tuning/checkpoints/${e}/permissions`, vt, {
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
    return this._client.getAPIList(v`/fine_tuning/checkpoints/${e}/permissions`, le, {
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
}, pa = class extends R {
  constructor() {
    super(...arguments), this.permissions = new kp(this._client);
  }
};
pa.Permissions = kp;
var Dp = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/fine_tuning/jobs/${e}/checkpoints`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, ma = class extends R {
  constructor() {
    super(...arguments), this.checkpoints = new Dp(this._client);
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
ma.Checkpoints = Dp;
var hn = class extends R {
  constructor() {
    super(...arguments), this.methods = new xp(this._client), this.jobs = new ma(this._client), this.checkpoints = new pa(this._client), this.alpha = new ha(this._client);
  }
};
hn.Methods = xp;
hn.Jobs = ma;
hn.Checkpoints = pa;
hn.Alpha = ha;
var $p = class extends R {
}, ga = class extends R {
  constructor() {
    super(...arguments), this.graderModels = new $p(this._client);
  }
};
ga.GraderModels = $p;
var Lp = class extends R {
  createVariation(e, t) {
    return this._client.post("/images/variations", ze({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  edit(e, t) {
    return this._client.post("/images/edits", ze({
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
}, Up = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/models/${e}`, {
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
  list(e) {
    return this._client.getAPIList("/models", vt, {
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
}, Fp = class extends R {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Op = class extends R {
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
}, Gp = class extends R {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Jr = class extends R {
  constructor() {
    super(...arguments), this.clientSecrets = new Gp(this._client), this.calls = new Op(this._client);
  }
};
Jr.ClientSecrets = Gp;
Jr.Calls = Op;
function Qw(e, t) {
  return !t || !jw(t) ? {
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
  } : Bp(e, t);
}
function Bp(e, t) {
  const n = e.output.map((r) => {
    if (r.type === "function_call") return {
      ...r,
      parsed_arguments: nI(t, r)
    };
    if (r.type === "message") {
      const i = r.content.map((s) => s.type === "output_text" ? {
        ...s,
        parsed: Zw(t, s.text)
      } : s);
      return {
        ...r,
        content: i
      };
    }
    return r;
  }), o = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || hs(o), Object.defineProperty(o, "output_parsed", {
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
function Zw(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function jw(e) {
  return !!Zs(e.text?.format);
}
function eI(e) {
  return e?.$brand === "auto-parseable-tool";
}
function tI(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function nI(e, t) {
  const n = tI(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: eI(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function hs(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const o of n.content) o.type === "output_text" && t.push(o.text);
  e.output_text = t.join("");
}
var qt, zo, ht, Yo, bc, Rc, Pc, Mc, oI = class qp extends ea {
  constructor(t) {
    super(), qt.add(this), zo.set(this, void 0), ht.set(this, void 0), Yo.set(this, void 0), O(this, zo, t, "f");
  }
  static createResponse(t, n, o) {
    const r = new qp(n);
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
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), S(this, qt, "m", bc).call(this);
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
    for await (const u of i) S(this, qt, "m", Rc).call(this, u, s);
    if (i.controller.signal?.aborted) throw new xe();
    return S(this, qt, "m", Pc).call(this);
  }
  [(zo = /* @__PURE__ */ new WeakMap(), ht = /* @__PURE__ */ new WeakMap(), Yo = /* @__PURE__ */ new WeakMap(), qt = /* @__PURE__ */ new WeakSet(), bc = function() {
    this.ended || O(this, ht, void 0, "f");
  }, Rc = function(n, o) {
    if (this.ended) return;
    const r = (s, u) => {
      (o == null || u.sequence_number > o) && this._emit(s, u);
    }, i = S(this, qt, "m", Mc).call(this, n);
    switch (r("event", n), n.type) {
      case "response.output_text.delta": {
        const s = i.output[n.output_index];
        if (!s) throw new U(`missing output at index ${n.output_index}`);
        if (s.type === "message") {
          const u = s.content[n.content_index];
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
        const s = i.output[n.output_index];
        if (!s) throw new U(`missing output at index ${n.output_index}`);
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
  }, Pc = function() {
    if (this.ended) throw new U("stream has ended, this shouldn't happen");
    const n = S(this, ht, "f");
    if (!n) throw new U("request ended without sending any events");
    O(this, ht, void 0, "f");
    const o = rI(n, S(this, zo, "f"));
    return O(this, Yo, o, "f"), o;
  }, Mc = function(n) {
    let o = S(this, ht, "f");
    if (!o) {
      if (n.type !== "response.created") throw new U(`When snapshot hasn't been set yet, expected 'response.created' event, got ${n.type}`);
      return o = O(this, ht, n.response, "f"), o;
    }
    switch (n.type) {
      case "response.output_item.added":
        o.output.push(n.item);
        break;
      case "response.content_part.added": {
        const r = o.output[n.output_index];
        if (!r) throw new U(`missing output at index ${n.output_index}`);
        const i = r.type, s = n.part;
        i === "message" && s.type !== "reasoning_text" ? r.content.push(s) : i === "reasoning" && s.type === "reasoning_text" && (r.content || (r.content = []), r.content.push(s));
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
        O(this, ht, n.response, "f");
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
    const t = S(this, Yo, "f");
    if (!t) throw new U("stream ended without producing a ChatCompletion");
    return t;
  }
};
function rI(e, t) {
  return Qw(e, t);
}
var Hp = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/responses/${e}/input_items`, Y, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Vp = class extends R {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Kr = class extends R {
  constructor() {
    super(...arguments), this.inputItems = new Hp(this._client), this.inputTokens = new Vp(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && hs(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(v`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((o) => ("object" in o && o.object === "response" && hs(o), o));
  }
  delete(e, t) {
    return this._client.delete(v`/responses/${e}`, {
      ...t,
      headers: D([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => Bp(n, e));
  }
  stream(e, t) {
    return oI.createResponse(this._client, e, t);
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
Kr.InputItems = Hp;
Kr.InputTokens = Vp;
var Jp = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/skills/${e}/content`, {
      ...t,
      headers: D([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Kp = class extends R {
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(v`/skills/${o}/versions/${e}/content`, {
      ...n,
      headers: D([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, _a = class extends R {
  constructor() {
    super(...arguments), this.content = new Kp(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(v`/skills/${e}/versions`, Gr({
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
    return this._client.getAPIList(v`/skills/${e}/versions`, Y, {
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
_a.Content = Kp;
var Wr = class extends R {
  constructor() {
    super(...arguments), this.content = new Jp(this._client), this.versions = new _a(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", Gr({
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
Wr.Content = Jp;
Wr.Versions = _a;
var Wp = class extends R {
  create(e, t, n) {
    return this._client.post(v`/uploads/${e}/parts`, ze({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, ya = class extends R {
  constructor() {
    super(...arguments), this.parts = new Wp(this._client);
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
ya.Parts = Wp;
var iI = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((r) => r.status === "rejected");
  if (n.length) {
    for (const r of n) console.error(r.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const o = [];
  for (const r of t) r.status === "fulfilled" && o.push(r.value);
  return o;
}, zp = class extends R {
  create(e, t, n) {
    return this._client.post(v`/vector_stores/${e}/file_batches`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(v`/vector_stores/${o}/file_batches/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  cancel(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.post(v`/vector_stores/${o}/file_batches/${e}/cancel`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t);
    return await this.poll(e, o.id, n);
  }
  listFiles(e, t, n) {
    const { vector_store_id: o, ...r } = t;
    return this._client.getAPIList(v`/vector_stores/${o}/file_batches/${e}/files`, Y, {
      query: r,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async poll(e, t, n) {
    const o = D([n?.headers, {
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
          await vo(s);
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
    return await iI(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, Yp = class extends R {
  create(e, t, n) {
    return this._client.post(v`/vector_stores/${e}/files`, {
      body: t,
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  retrieve(e, t, n) {
    const { vector_store_id: o } = t;
    return this._client.get(v`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  update(e, t, n) {
    const { vector_store_id: o, ...r } = t;
    return this._client.post(v`/vector_stores/${o}/files/${e}`, {
      body: r,
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
    const { vector_store_id: o } = t;
    return this._client.delete(v`/vector_stores/${o}/files/${e}`, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  async createAndPoll(e, t, n) {
    const o = await this.create(e, t, n);
    return await this.poll(e, o.id, n);
  }
  async poll(e, t, n) {
    const o = D([n?.headers, {
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
          await vo(s);
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
    return this._client.getAPIList(v`/vector_stores/${o}/files/${e}/content`, vt, {
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, zr = class extends R {
  constructor() {
    super(...arguments), this.files = new Yp(this._client), this.fileBatches = new zp(this._client);
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
    return this._client.getAPIList(v`/vector_stores/${e}/search`, vt, {
      body: t,
      method: "post",
      ...n,
      headers: D([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
zr.Files = Yp;
zr.FileBatches = zp;
var Xp = class extends R {
  create(e, t) {
    return this._client.post("/videos", ze({
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
    return this._client.getAPIList("/videos", le, {
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
    return this._client.post("/videos/characters", ze({
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
    return this._client.post("/videos/edits", ze({
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
  extend(e, t) {
    return this._client.post("/videos/extensions", ze({
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
    return this._client.post(v`/videos/${e}/remix`, Gr({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Wt, Qp, ur, Zp = class extends R {
  constructor() {
    super(...arguments), Wt.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, o = 300) {
    return await this.verifySignature(e, t, n, o), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, o = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    S(this, Wt, "m", Qp).call(this, n);
    const r = D([t]).values, i = S(this, Wt, "m", ur).call(this, r, "webhook-signature"), s = S(this, Wt, "m", ur).call(this, r, "webhook-timestamp"), u = S(this, Wt, "m", ur).call(this, r, "webhook-id"), c = parseInt(s, 10);
    if (isNaN(c)) throw new Gn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > o) throw new Gn("Webhook timestamp is too old");
    if (c > d + o) throw new Gn("Webhook timestamp is too new");
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
    throw new Gn("The given webhook signature does not match the expected signature");
  }
};
Wt = /* @__PURE__ */ new WeakSet(), Qp = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, ur = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const o = t.get(n);
  if (o == null) throw new Error(`Missing required header: ${n}`);
  return o;
};
var ps, va, cr, jp, sI = "workload-identity-auth", q = class {
  constructor({ baseURL: e = ft("OPENAI_BASE_URL"), apiKey: t = ft("OPENAI_API_KEY") ?? null, adminAPIKey: n = ft("OPENAI_ADMIN_KEY") ?? null, organization: o = ft("OPENAI_ORG_ID") ?? null, project: r = ft("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = ft("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: s, ...u } = {}) {
    ps.add(this), cr.set(this, void 0), this.completions = new wp(this), this.chat = new na(this), this.embeddings = new Rp(this), this.files = new Mp(this), this.images = new Lp(this), this.audio = new To(this), this.moderations = new Fp(this), this.models = new Up(this), this.fineTuning = new hn(this), this.graders = new ga(this), this.vectorStores = new zr(this), this.webhooks = new Zp(this), this.beta = new fn(this), this.batches = new _p(this), this.uploads = new ya(this), this.admin = new sa(this), this.responses = new Kr(this), this.realtime = new Jr(this), this.conversations = new ca(this), this.evals = new fa(this), this.containers = new ua(this), this.skills = new Wr(this), this.videos = new Xp(this);
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
    if (t && s) throw new U("The `apiKey` and `workloadIdentity` options are mutually exclusive");
    if (!t && !n && !s) throw new U("Missing credentials. Please pass an `apiKey`, `workloadIdentity`, `adminAPIKey`, or set the `OPENAI_API_KEY` or `OPENAI_ADMIN_KEY` environment variable.");
    if (!c.dangerouslyAllowBrowser && rw()) throw new U(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? va.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = pc(c.logLevel, "ClientOptions.logLevel", this) ?? pc(ft("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? _h(), O(this, cr, uw, "f");
    const f = ft("OPENAI_CUSTOM_HEADERS");
    if (f) {
      const h = {};
      for (const p of f.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (h[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = D([h, c.defaultHeaders]);
    }
    this._options = c, s && (this._workloadIdentityAuth = new bw(s, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = o, this.project = r, this.webhookSecret = i;
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
    return mw(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Jt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${ih()}`;
  }
  makeStatusError(e, t, n, o) {
    return ce.generate(e, t, n, o);
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
    const o = !S(this, ps, "m", jp).call(this) && n || this.baseURL, r = ew(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), s = Object.fromEntries(r.searchParams);
    return (!oc(i) || !oc(s)) && (t = {
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
    return new Rh(this, this.makeRequest(e, t, void 0));
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
    if (se(this).debug(`[${c}] sending request`, It({
      retryOfRequestLogID: n,
      method: o.method,
      url: s,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new xe();
    const h = o.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(s, i, u, p, h).catch(ji), g = Date.now();
    if (m instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new xe();
      const E = Zi(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return se(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - ${y}`), se(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (${y})`, It({
          retryOfRequestLogID: n,
          url: s,
          durationMs: g - f,
          message: m.message
        })), this.retryRequest(o, t, n ?? c);
      throw se(this).info(`[${c}] connection ${E ? "timed out" : "failed"} - error; no more retries left`), se(this).debug(`[${c}] connection ${E ? "timed out" : "failed"} (error; no more retries left)`, It({
        retryOfRequestLogID: n,
        url: s,
        durationMs: g - f,
        message: m.message
      })), m instanceof gh || m instanceof ZC ? m : E ? new zs() : new Ur({
        message: aI(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, E]) => ", " + y + ": " + JSON.stringify(E)).join("")}] ${i.method} ${s} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - f}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && h.bearerAuth && !o.__metadata?.hasStreamingBody && !o.__metadata?.workloadIdentityTokenRefreshed)
        return await ac(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...o,
          __metadata: {
            ...o.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(m);
      if (t && y) {
        const M = `retrying, ${t} attempts remaining`;
        return await ac(m.body), se(this).info(`${_} - ${M}`), se(this).debug(`[${c}] response error (${M})`, It({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - f
        })), this.retryRequest(o, t, n ?? c, m.headers);
      }
      const E = y ? "error; no more retries left" : "error; not retryable";
      se(this).info(`${_} - ${E}`);
      const C = await m.text().catch((M) => ji(M).message), w = ow(C), P = w ? void 0 : C;
      throw se(this).debug(`[${c}] response error (${E})`, It({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: P,
        durationMs: Date.now() - f
      })), this.makeStatusError(m.status, w, P, m.headers);
    }
    return se(this).info(_), se(this).debug(`[${c}] response start`, It({
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
    return new Cw(this, n, e);
  }
  async fetchWithAuth(e, t, n, o, r = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && r.bearerAuth) {
      const i = t.headers, s = i.get("Authorization");
      if (!s || s === `Bearer ${sI}`) {
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
    return await vo(r), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const r = t - e;
    return Math.min(0.5 * Math.pow(2, r), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: r, query: i, defaultBaseURL: s } = n, u = this.buildURL(r, i, s);
    "timeout" in n && nw("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
    const i = D([
      r,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(o),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...lw(),
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
    const n = D([t]), o = typeof globalThis.ReadableStream < "u" && e instanceof globalThis.ReadableStream, r = !o && (typeof e == "string" || e instanceof ArrayBuffer || ArrayBuffer.isView(e) || typeof globalThis.Blob < "u" && e instanceof globalThis.Blob || e instanceof URLSearchParams || e instanceof FormData);
    return ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && n.values.has("content-type") || globalThis.Blob && e instanceof globalThis.Blob || e instanceof FormData || e instanceof URLSearchParams || o ? {
      bodyHeaders: void 0,
      body: e,
      isStreamingBody: !r
    } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? {
      bodyHeaders: void 0,
      body: vh(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...S(this, cr, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
va = q, cr = /* @__PURE__ */ new WeakMap(), ps = /* @__PURE__ */ new WeakSet(), jp = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
q.OpenAI = va;
q.DEFAULT_TIMEOUT = 6e5;
q.OpenAIError = U;
q.APIError = ce;
q.APIConnectionError = Ur;
q.APIConnectionTimeoutError = zs;
q.APIUserAbortError = xe;
q.NotFoundError = uh;
q.ConflictError = ch;
q.RateLimitError = fh;
q.BadRequestError = sh;
q.AuthenticationError = ah;
q.InternalServerError = hh;
q.PermissionDeniedError = lh;
q.UnprocessableEntityError = dh;
q.InvalidWebhookSignatureError = Gn;
q.toFile = Nw;
q.Completions = wp;
q.Chat = na;
q.Embeddings = Rp;
q.Files = Mp;
q.Images = Lp;
q.Audio = To;
q.Moderations = Fp;
q.Models = Up;
q.FineTuning = hn;
q.Graders = ga;
q.VectorStores = zr;
q.Webhooks = Zp;
q.Beta = fn;
q.Batches = _p;
q.Uploads = ya;
q.Admin = sa;
q.Responses = Kr;
q.Realtime = Jr;
q.Conversations = ca;
q.Evals = fa;
q.Containers = ua;
q.Skills = Wr;
q.Videos = Xp;
function aI(e) {
  if (lI(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function lI(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const o = t;
    if (o.code === "UND_ERR_INVALID_ARG" && typeof o.message == "string" && o.message.includes("invalid onRequestStart method")) return !0;
    t = o.cause;
  }
  return !1;
}
function xc(e = "", t = 0) {
  let n = 0;
  for (let o = t - 1; o >= 0 && e[o] === "\\"; o -= 1) n += 1;
  return n % 2 === 1;
}
function uI(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function cI(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function dI(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function fI(e = "") {
  const t = String(e ?? "");
  let n = "", o = 0;
  for (; o < t.length; ) {
    const r = t.slice(o, o + 2), i = t.slice(o + 2, o + 6);
    if (r !== "\\u" || xc(t, o) || !uI(i)) {
      n += t[o] || "", o += 1;
      continue;
    }
    const s = o + 6, u = t.slice(s + 2, s + 6);
    if (cI(i) && t.slice(s, s + 2) === "\\u" && !xc(t, s) && dI(u)) {
      const c = Number.parseInt(i, 16), d = Number.parseInt(u, 16), f = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(f), o += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(i, 16)), o += 6;
  }
  return n;
}
function hI(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), fI(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function pI(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Aa(e = "", t = "", n = 0) {
  const o = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${pI(t)}(?:\\\\?")?\\s*:`, "i"), r = String(e || "").slice(Math.max(0, n)).match(o);
  if (!r || r.index === void 0) return null;
  const i = r[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + r.index + i,
    end: Math.max(0, n) + r.index + r[0].length
  };
}
function mI(e = "", t = [], n = 0) {
  return t.map((o) => Aa(e, o, n)).filter(Boolean).sort((o, r) => o.index - r.index)[0] || null;
}
function Ge(e = "", t = "", n = []) {
  const o = String(e || ""), r = Aa(o, t);
  if (!r) return;
  let i = r.end;
  for (; /\s/.test(o[i] || ""); ) i += 1;
  o[i] === '"' && (i += 1);
  const s = mI(o, n.filter((d) => d !== t), i);
  let u = s ? s.index : o.length;
  if (s) {
    const d = o.lastIndexOf(",", s.index);
    d >= i && (u = d);
  }
  let c = o.slice(i, u).trim();
  return s || (c = c.replace(/\}\s*$/, "").trimEnd()), hI(c);
}
function et(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var Xn = {
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
}, gI = [
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
function Nc(e = "", t = [], n = []) {
  for (const o of t) {
    const r = Ge(e, o, n);
    if (r !== void 0) return r;
  }
}
function _I(e = "", t = "") {
  if (t === "Read") {
    const n = Xn.Read, o = {};
    return n.forEach((r, i) => {
      const s = Ge(e, r, n.slice(i + 1));
      s !== void 0 && (o[r] = et(s));
    }), o.filePath === void 0 && o.path !== void 0 && (o.filePath = o.path, delete o.path), o.filePath === void 0 && o.scope !== void 0 && (o.filePath = o.scope, delete o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "Write") {
    const n = {}, o = Nc(e, ["filePath", "path"], ["content"]), r = Ge(e, "content", []);
    return o !== void 0 && (n.filePath = et(o)), r !== void 0 && (n.content = et(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, o = Nc(e, ["filePath", "path"], ["edits"]), r = Ge(e, "edits", []);
    return o !== void 0 && (n.filePath = et(o)), r !== void 0 && (n.edits = et(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = Xn.Grep, o = {};
    return n.forEach((r) => {
      const i = Ge(e, r, n.filter((s) => s !== r));
      i !== void 0 && (o[r] = et(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "MemoryGrep") {
    const n = Xn.MemoryGrep, o = {};
    return n.forEach((r) => {
      const i = Ge(e, r, n.filter((s) => s !== r));
      i !== void 0 && (o[r] = et(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  if (t === "ChatHistory") {
    const n = Xn.ChatHistory, o = {};
    return n.forEach((r) => {
      const i = Ge(e, r, n.filter((s) => s !== r));
      i !== void 0 && (o[r] = et(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  return null;
}
function yI(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const s = JSON.parse(n);
    if (s && typeof s == "object" && !Array.isArray(s)) return s;
  } catch {
  }
  const o = _I(n, t);
  if (o) return o;
  const r = Xn[t] || gI, i = {};
  return r.forEach((s, u) => {
    const c = Ge(n, s, r.slice(u + 1));
    c !== void 0 && (i[s] = et(c));
  }), Object.keys(i).length ? i : null;
}
function em(e = "", t = "") {
  const n = yI(e, t);
  return n ? JSON.stringify(n) : "";
}
function tm(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function Oe(e, t, n) {
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
function z(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function nm(e) {
  if (typeof e == "string") return e;
  if (e == null) return "{}";
  try {
    return JSON.stringify(e);
  } catch {
    return "{}";
  }
}
function om(e, t = "") {
  if (e && typeof e == "object" && !Array.isArray(e)) return JSON.stringify(e);
  const n = typeof e == "string" ? e : nm(e);
  return em(n, t) || JSON.stringify(tm(n));
}
function vI(e = "") {
  const t = String(e || ""), n = Aa(t, "arguments");
  if (!n) return "";
  let o = n.end;
  for (; /\s/.test(t[o] || ""); ) o += 1;
  const r = t[o] || "";
  return r === "{" ? t.slice(o).replace(/\}\s*$/, "").trimEnd() : r === '"' ? t.slice(o + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(o).replace(/\}\s*$/, "").trimEnd();
}
function AI(e = "", t = 0) {
  const n = String(e || "").trim(), o = Ge(n, "name", ["id", "arguments"]) || Ge(n, "toolName", ["id", "arguments"]) || "", r = Ge(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, i = vI(n);
  return !o || !i ? null : {
    id: r,
    name: o,
    arguments: om(i, o)
  };
}
function TI(e, t = 0, n = "openai-tool") {
  if (!z(e)) return null;
  const o = z(e.function) ? e.function : null, r = String(o?.name || "").trim();
  if (!r) return null;
  const i = ye(e) || {};
  return delete i.index, i.id = String(i.id || `${n}-${t + 1}`), i.type = "function", i.function = {
    ...ye(o) || {},
    name: r,
    arguments: nm(o.arguments)
  }, i;
}
function lo(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, o) => TI(n, o, t)).filter(Boolean);
}
function uo(e, t) {
  return Array.isArray(e) ? e.some((n) => uo(n, t)) : z(e) ? Object.entries(e).some(([n, o]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(o) : (Array.isArray(o) || z(o)) && uo(o, t)) : !1;
}
function SI(e) {
  return uo(e, (t) => typeof t == "string" && t.length > 0);
}
function ms(e) {
  return uo(e, () => !0);
}
function EI(e) {
  return uo(e, (t) => typeof t != "string" || t.length === 0);
}
function CI(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => SI(t));
}
var kc = /* @__PURE__ */ new WeakSet();
function Ta(e) {
  if (!z(e)) return null;
  const t = ye(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = Mt(Pt(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = lo(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function Sa(e = [], t = "openai-tool") {
  return lo(e, t).map((n, o) => ({
    id: n.id || `${t}-${Date.now()}-${o + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function Ea(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function Pt(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, o) => (Oe(t, "思考块", o), "")).trim(),
    thoughts: t
  };
}
function Mt(e = "") {
  const t = String(e || ""), n = t.search(/<tool_call\b/i);
  return n < 0 ? t.trim() : t.slice(0, n).trim();
}
function gs(e = "") {
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
      Oe(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((o) => bt(e, o, n));
      return;
    }
    typeof t == "object" && (typeof t.text == "string" && Oe(e, n, t.text), typeof t.content == "string" && Oe(e, n, t.content), typeof t.reasoning_content == "string" && Oe(e, n, t.reasoning_content), typeof t.thinking == "string" && Oe(e, n, t.thinking), Array.isArray(t.summary) && t.summary.forEach((o) => {
      if (typeof o == "string") {
        Oe(e, "推理摘要", o);
        return;
      }
      o && typeof o == "object" && Oe(e, "推理摘要", o.text || o.content || "");
    }));
  }
}
function pt(e = {}, t = {}) {
  const n = [];
  return bt(n, e.reasoning_content, "推理文本"), bt(n, e.reasoning, "推理文本"), bt(n, e.reasoning_text, "推理文本"), bt(n, e.thinking, "思考块"), bt(n, t.reasoning_content, "推理文本"), bt(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        Oe(n, "推理文本", o.text);
        return;
      }
      if (o.type === "summary_text") {
        Oe(n, "推理摘要", o.text);
        return;
      }
      (o.type === "thinking" || o.type === "reasoning" || o.type === "reasoning_content") && Oe(n, "思考块", o.text || o.content || o.reasoning || "");
    }
  }), n;
}
function no(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((o) => {
    [...e.matchAll(o)].forEach((r, i) => {
      try {
        const s = JSON.parse(r[1]);
        n.push({
          id: s.id || `tool-call-${i + 1}`,
          name: String(s.name || ""),
          arguments: om(s.arguments, s.name)
        });
      } catch {
        const s = AI(r[1], i);
        s && n.push(s);
      }
    });
  }), n.filter((o) => o.name);
}
function Ca(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : Ta(t);
}
function wI(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function II(e = {}) {
  const t = lo(e?.tool_calls);
  if (t.length) return t;
  const n = lo(Ca(e)?.tool_calls);
  return n.length ? n : [];
}
function bI(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function RI(e = "") {
  return /claude/i.test(String(e || ""));
}
function PI(e = "") {
  return Rs(e) === "openai";
}
function rm(e = {}, t = {}) {
  return t.mode !== "on" && t.mode !== "off" ? e : t.profileId === "kimi-k3" ? (e.reasoning_effort = t.mode === "off" ? "off" : t.effort, e) : t.profileId === "deepseek-thinking" ? (e.thinking = { type: t.mode === "off" ? "disabled" : "enabled" }, t.mode === "on" && (e.reasoning_effort = t.effort), e) : (String(t.profileId || "").startsWith("openai-") && (e.reasoning_effort = t.mode === "off" ? "none" : t.effort), e);
}
function im(e = [], t = "") {
  if (!RI(t)) return e;
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
function Dc(e, t = "") {
  return !z(e) || !bI(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var _s = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function MI(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((o) => ye(o) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((o, r) => {
    const i = ye(o) || {}, s = Number.isInteger(Number(o?.index)) ? Number(o.index) : r, u = n[s];
    n[s] = z(u) ? So(u, i, "tool_call") : i;
  }), n.filter((o) => o !== void 0);
}
function So(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return ye(t);
  if (t === null && _s.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return MI(e, t);
  if (typeof e == "string" && typeof t == "string")
    return _s.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : ye(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(ye(t) || []);
  if (z(e) && z(t)) {
    const o = { ...e };
    return Object.entries(t).forEach(([r, i]) => {
      o[r] = So(o[r], i, r);
    }), o;
  }
  return ye(t);
}
function wr(e = {}, t = {}) {
  const n = z(e) ? ye(e) || {} : {}, o = z(t) ? ye(t) || {} : {};
  return delete o.message, delete o.finish_reason, delete o.index, delete o.logprobs, delete o.delta, Object.entries(o).forEach(([r, i]) => {
    n[r] = So(n[r], i, r);
  }), n.role || (n.role = "assistant"), Ta(n) || { role: "assistant" };
}
function oo(e, t = {}) {
  const n = Ta(wr(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function xI(e = {}, t = {}) {
  return z(e) ? z(t) ? So(ye(e) || {}, t, "") : ye(e) : ye(t);
}
function ys(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], o = wI(n), r = [];
  let i = !1;
  n.forEach((u, c) => {
    if (i) {
      if (u?.role === "tool") return;
      i = !1;
    }
    const d = u?.role === "assistant", f = d ? u?.providerPayload?.openaiCompatibleMessage : null, h = am(Array.isArray(f?.tool_calls) && f.tool_calls.some((E) => ms(E)) ? f.tool_calls : d && Array.isArray(u?.tool_calls) && u.tool_calls.some((E) => ms(E)) ? u.tool_calls : null);
    if (h) {
      const E = z(f) ? f : u;
      (!z(E) || !kc.has(E)) && (z(E) && kc.add(E), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: h.index,
        toolName: h.toolName,
        reason: h.reason
      })), i = !0;
      return;
    }
    const p = d ? lo(u?.tool_calls) : [], m = d ? Ca(u) : null, g = Array.isArray(m?.tool_calls) ? m.tool_calls : [], _ = g.length > 0 && CI(m);
    if (g.length && c > o) {
      r.push(Dc({
        ...m,
        ...p.length && !_ ? { tool_calls: p } : {}
      }, t));
      return;
    }
    const y = {
      role: u.role,
      content: u.content
    };
    u.role === "tool" && u.tool_call_id && (y.tool_call_id = u.tool_call_id), _ ? y.tool_calls = g : p.length && (y.tool_calls = p), r.push(Dc(y, t));
  });
  const s = String(e.systemPrompt || "").trim();
  return s && r[0]?.role !== "system" && r.unshift({
    role: "system",
    content: s
  }), im(r, t);
}
function $c(e) {
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
function vs(e, t = "") {
  const n = /* @__PURE__ */ new Map(), o = [];
  return (Array.isArray(e.messages) ? e.messages : []).forEach((r) => {
    if (r.role === "assistant") {
      const i = II(r);
      if (i.length) {
        const s = Ca(r), u = typeof s?.content == "string" ? s.content : String(r.content || ""), c = i.map((d, f) => {
          const h = d.function?.name || "", p = d.id || `tool-call-${f + 1}`;
          return h && n.set(p, h), `<tool_call>${JSON.stringify({
            id: p,
            name: h,
            arguments: tm(d.function?.arguments || "{}")
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
  }), !o.length || o[0].role !== "system" ? o.unshift({
    role: "system",
    content: $c(e)
  }) : o[0] = {
    ...o[0],
    content: $c({
      ...e,
      systemPrompt: o[0].content || e.systemPrompt
    })
  }, im(o, t);
}
function Lc(e, t, n) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: K(n) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function kn(e, t = []) {
  return K(e) ? t : [];
}
function sm(e, t, n) {
  !e || !t || n === void 0 || (e[t] = So(e[t], n, t));
}
function Ir(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (z(n)) {
      const o = z(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([r, i]) => {
        Ir(o, r, i);
      }), e[t] = o;
      return;
    }
    if (typeof n == "string" && _s.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || sm(e, t, n);
  }
}
function NI(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const o = Number(n?.index ?? 0), r = { ...e.tool_calls[o] || {} };
    Object.entries(n || {}).forEach(([i, s]) => {
      if (i !== "index" && !(i === "function" && s == null)) {
        if (i === "function" && z(s)) {
          r.function = z(r.function) ? { ...r.function } : {}, Object.entries(s).forEach(([u, c]) => {
            Ir(r.function, u, c);
          });
          return;
        }
        Ir(r, i, s);
      }
    }), e.tool_calls[o] = r;
  }));
}
function As(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([o, r]) => {
    o === "delta" || o === "finish_reason" || o === "index" || o === "logprobs" || sm(e, o, r);
  });
  const n = z(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([o, r]) => {
    if (o === "tool_calls") {
      NI(e, r);
      return;
    }
    Ir(e, o, r);
  });
}
function jt(e = {}) {
  return Ea(e?.content);
}
function en(e = {}) {
  return Sa(e?.tool_calls || []);
}
function kI(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return z(JSON.parse(e));
  } catch {
    return !1;
  }
}
function am(e) {
  if (!Array.isArray(e) || !e.some((t) => ms(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], o = z(n?.function) ? n.function : null, r = String(o?.name || "").trim();
    let i = "";
    if (!z(n) || !o ? i = "invalid_function_shape" : r ? kI(o.arguments) ? EI(n) && (i = "invalid_thought_signature") : i = "invalid_function_arguments" : i = "missing_function_name", i) return {
      index: t,
      toolName: r,
      reason: i
    };
  }
  return null;
}
function tn(e = {}) {
  const t = am(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function DI(e, t) {
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
      const f = d.index, h = r.slice(0, f);
      r = r.slice(f + d[0].length);
      const p = h.split(/\r?\n/).filter((m) => m.startsWith("data:")).map((m) => m.slice(5).trimStart()).join(`
`).trim();
      !p || p === "[DONE]" || t(JSON.parse(p));
    }
  }
  const s = r.trim();
  if (s && s !== "[DONE]") {
    const u = s.split(/\r?\n/).filter((c) => c.startsWith("data:")).map((c) => c.slice(5).trimStart()).join(`
`).trim();
    u && u !== "[DONE]" && t(JSON.parse(u));
  }
}
var $I = class {
  constructor(e) {
    this.config = e, this.client = new q({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = Q("openai-compatible", this.config, e.reasoning)) {
    const n = t, o = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, r = !o && Array.isArray(e.tools) && e.tools.length ? e.tools : null, i = {
      model: this.config.model,
      messages: o ? vs(e, this.config.model) : ys(e, this.config.model),
      ...r ? {
        tools: r,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? PI(this.config.model) ? { max_completion_tokens: e.maxTokens } : { max_tokens: e.maxTokens } : {}
    };
    return !fo({
      ...this.config,
      provider: "openai-compatible"
    }, n) && typeof e.temperature == "number" && (i.temperature = e.temperature), rm(i, n);
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = t.effectiveReasoning || Q("openai-compatible", this.config, e.reasoning), r = {
      ...t.body || this.buildRequestBody(e, o),
      ...n ? { stream: !0 } : {}
    }, i = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), s = {
      ...Object.hasOwn(r, "reasoning_effort") ? { reasoning_effort: r.reasoning_effort } : {},
      ...Object.hasOwn(r, "thinking") ? { thinking: r.thinking } : {}
    };
    return { ...so({
      provider: "openai-compatible",
      model: this.config.model,
      transport: "openai-compatible",
      url: `${i}/chat/completions`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: r,
      sdk: n ? "client.chat.completions.create(..., { stream: true })" : "client.chat.completions.create",
      effectiveConfig: yt(e, {
        reasoning: o,
        effort: r.reasoning_effort,
        controlFields: s
      })
    }) };
  }
  async streamNativeChatCompletions(e, t, n) {
    const o = `${String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`, r = await fetch(o, {
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
      const g = await r.text().catch(() => ""), _ = new Error(g || `openai_compatible_stream_http_${r.status}`);
      throw _.status = r.status, _;
    }
    const i = { role: "assistant" };
    let s = "stop", u = this.config.model;
    await DI(r, (g) => {
      u = g?.model || u;
      const _ = g?.choices?.[0];
      As(i, _), _?.finish_reason && (s = _.finish_reason);
      const y = Pt(jt(i)), E = en(i), C = E.length ? E : gs(y.cleaned);
      Lc(e, {
        text: E.length ? y.cleaned : Mt(y.cleaned),
        thoughts: kn(n, pt(i, _).concat(y.thoughts)),
        ...C.length ? { toolCalls: C } : {},
        ...!E.length && C.length ? { toolCallDraft: !0 } : {}
      }, n);
    }), tn(i);
    const c = oo(i), d = en(i), f = Pt(jt(i)), h = pt(i, {});
    f.thoughts.forEach((g) => h.push(g));
    const p = d.length ? [] : no(f.cleaned), m = [...d, ...p];
    return {
      text: d.length ? f.cleaned : Mt(f.cleaned),
      toolCalls: m,
      thoughts: kn(n, h),
      finishReason: s,
      model: u,
      provider: "openai-compatible",
      providerPayload: c
    };
  }
  async chat(e) {
    const t = Q("openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, o = typeof e.onStreamProgress == "function", r = this.buildRequestBody(e, t), i = this.inspectRequest(e, {
      body: r,
      effectiveReasoning: t
    }), s = async (E) => {
      try {
        return await E(r);
      } catch (C) {
        throw C && typeof C == "object" && (C.requestInspection = i), C;
      }
    };
    if (o) {
      if (!n) return {
        ...await s((J) => this.streamNativeChatCompletions(e, J, t)),
        requestInspection: i
      };
      const E = await s((J) => this.client.chat.completions.create({
        ...J,
        stream: !0
      }, { signal: e.signal })), C = { role: "assistant" };
      let w = "stop", P = this.config.model, M;
      for await (const J of E) {
        P = J.model || P;
        const W = J.choices?.[0];
        As(C, W), W?.finish_reason && (w = W.finish_reason);
        const pe = Pt(jt(C)), Je = en(C), $e = Je.length ? Je : gs(pe.cleaned);
        Lc(e, {
          text: Je.length ? pe.cleaned : Mt(pe.cleaned),
          thoughts: kn(t, pt(C, W).concat(pe.thoughts)),
          ...$e.length ? { toolCalls: $e } : {},
          ...!Je.length && $e.length ? { toolCallDraft: !0 } : {}
        }, t);
      }
      const A = (typeof E.finalChatCompletion == "function" ? await E.finalChatCompletion() : null)?.choices?.[0] || null, $ = A?.message || C;
      tn($);
      const I = xI(C, wr($, A || {}));
      tn(I), M = oo(I);
      const x = en(I), F = Pt(jt(I)), H = pt(I, A || {});
      F.thoughts.forEach((J) => H.push(J));
      const ue = x.length ? [] : no(F.cleaned), ie = [...x, ...ue];
      return {
        text: x.length ? F.cleaned : Mt(F.cleaned),
        toolCalls: ie,
        thoughts: kn(t, H),
        finishReason: w,
        model: P,
        provider: "openai-compatible",
        providerPayload: M,
        requestInspection: i
      };
    }
    const u = await s((E) => this.client.chat.completions.create(E, { signal: e.signal })), c = u.choices?.[0] || {}, d = c.message || {};
    tn(d);
    const f = pt(d, c), h = Sa(d.tool_calls || []), p = Pt(Ea(d.content));
    p.thoughts.forEach((E) => f.push(E));
    const m = h.length ? [] : no(p.cleaned), g = [...h, ...m], _ = h.length ? p.cleaned : Mt(p.cleaned), y = wr(d, c);
    return {
      text: _,
      toolCalls: g,
      thoughts: kn(t, f),
      finishReason: c.finish_reason || "stop",
      model: u.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: oo(y),
      requestInspection: i
    };
  }
};
function LI(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function wa(e) {
  const t = LI(Array.isArray(e) ? e : []);
  return Array.isArray(t) ? (t.forEach((n) => {
    !n || typeof n != "object" || Array.isArray(n) || (n.type === "function_call" && delete n.parsed_arguments, n.type === "message" && Array.isArray(n.content) && n.content.forEach((o) => {
      !o || typeof o != "object" || Array.isArray(o) || delete o.parsed;
    }));
  }), t) : [];
}
function lm(e, t) {
  return {
    type: "message",
    role: e,
    content: UI(t)
  };
}
function br(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function UI(e) {
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
function Rr(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function Uc(e, t = [], n = {}) {
  (t || []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        Rr(e, n.reasoning || "推理文本", o.text);
        return;
      }
      o.type === "summary_text" && Rr(e, n.summary || "推理摘要", o.text);
    }
  });
}
function FI(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (Uc(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), Uc(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function OI(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function GI(e) {
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
function BI(e) {
  if (e && typeof e == "object" && !Array.isArray(e) && !Object.prototype.hasOwnProperty.call(e, "choices") && Array.isArray(e.output)) return;
  const t = /* @__PURE__ */ new Error("当前端点返回的不是 Responses API，请改用 OpenAI 兼容。");
  throw t.name = "OpenAIResponsesEndpointMismatchError", t.code = "OPENAI_RESPONSES_ENDPOINT_MISMATCH", t;
}
function qI(e) {
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
        t.push(...wa(n.providerPayload.openAIResponseOutput));
        continue;
      }
      if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
        n.content?.trim() && t.push(br(n.content)), n.tool_calls.forEach((o, r) => {
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
        t.push(br(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? lm(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function HI(e) {
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
      t.push(...wa(n.providerPayload.openAIResponseOutput));
      continue;
    }
    if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
      n.content?.trim() && t.push(br(n.content)), n.tool_calls.forEach((o, r) => {
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
      t.push(br(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? lm(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function VI(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function JI(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function KI(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function vi(e, t) {
  const [n = "0", o = "0"] = String(e || "").split(":"), [r = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(r) || Number(o) - Number(i);
}
var WI = class {
  constructor(e) {
    this.config = e, this.client = new q({
      apiKey: e.apiKey,
      baseURL: String(e.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e, t = !1, n = Q("openai-responses", this.config, e.reasoning)) {
    const o = n, r = {
      model: this.config.model,
      instructions: t ? void 0 : OI(e) || void 0,
      input: t ? HI(e) : qI(e),
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
    return !fo({
      ...this.config,
      provider: "openai-responses"
    }, o) && typeof e.temperature == "number" && (r.temperature = e.temperature), o.mode === "on" || o.mode === "off" ? r.reasoning = {
      effort: o.mode === "off" ? "none" : o.effort,
      ...o.mode === "on" && K(o) ? { summary: "auto" } : {}
    } : K(o) && (r.reasoning = { summary: "auto" }), o.mode !== "off" && o.profileId.startsWith("openai-") && (r.include = ["reasoning.encrypted_content"]), r;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = t.legacySystemInInput === !0, r = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = t.effectiveReasoning || Q("openai-responses", this.config, e.reasoning), s = t.body || this.buildRequestBody(e, o, i);
    return so({
      provider: "openai-responses",
      model: this.config.model,
      transport: "openai-responses",
      url: `${r}/responses`,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : ""
      },
      body: s,
      sdk: n ? "client.responses.stream" : "client.responses.create",
      effectiveConfig: yt(e, {
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
    const t = Q("openai-responses", this.config, e.reasoning), n = [], o = () => ({
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
      BI(m);
      const g = m.output;
      return {
        output: g,
        thoughts: K(t) ? FI(g) : [],
        toolCalls: g.filter((_) => _.type === "function_call" && _.name).map((_, y) => ({
          id: _.call_id || `response-tool-${y + 1}`,
          name: _.name || "",
          arguments: _.arguments || "{}"
        })),
        text: GI(m)
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
        const y = this.client.responses.stream(_, { signal: e.signal }), E = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map(), P = () => {
          const M = [];
          K(t) && (Array.from(C.entries()).sort(([A], [$]) => vi(A, $)).forEach(([, A]) => Rr(M, "推理文本", A)), Array.from(w.entries()).sort(([A], [$]) => vi(A, $)).forEach(([, A]) => Rr(M, "推理摘要", A))), KI(e, {
            text: Array.from(E.entries()).sort(([A], [$]) => vi(A, $)).map(([, A]) => A).join(`
`).trim(),
            thoughts: M
          });
        };
        return y.on("response.output_text.delta", (M) => {
          const A = `${M.output_index}:${M.content_index}`;
          E.set(A, `${E.get(A) || ""}${M.delta}`), P();
        }), y.on("response.reasoning_text.delta", (M) => {
          const A = `${M.output_index}:${M.content_index}`;
          C.set(A, `${C.get(A) || ""}${M.delta}`), P();
        }), y.on("response.reasoning_summary_text.delta", (M) => {
          const A = `${M.output_index}:${M.summary_index}`;
          w.set(A, `${w.get(A) || ""}${M.delta}`), P();
        }), await y.finalResponse();
      } catch (y) {
        throw r(y);
      }
    }, d = !VI(this.config.baseUrl), f = typeof e.onStreamProgress == "function" ? c : u;
    let h, p;
    try {
      h = await f(!1, "initial"), p = i(h);
    } catch (m) {
      if (!d || !JI(m)) throw r(m);
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
      model: h.model || this.config.model,
      provider: "openai-responses",
      providerPayload: p.output.length ? { openAIResponseOutput: wa(p.output) } : void 0,
      requestInspection: o()
    };
  }
};
async function zI(e, t) {
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
var Ut = "openai", um = "claude", cm = "makersuite", YI = "/api/backends/chat-completions/status", XI = "/api/backends/chat-completions/generate", QI = Object.freeze({
  [um]: "https://api.anthropic.com/v1",
  [cm]: "https://generativelanguage.googleapis.com"
}), pn = null;
function ZI(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function jI(e = "") {
  return Rs(e) === "openai";
}
function e0(e, t) {
  const n = ZI(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function ab(e) {
  pn = typeof e == "function" ? e : null;
}
async function dm(e = pn) {
  if (typeof e != "function") throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(e() || {}),
    Accept: "application/json"
  };
}
function t0(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, o]) => {
    t[n] = /authorization|cookie|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : o;
  }), t;
}
async function Ia(e = {}, t = !1, n = pn) {
  const o = await dm(n), r = {
    url: XI,
    method: "POST",
    headers: t0(o),
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
async function n0(e = {}, t = !1) {
  return await Ia(e, t);
}
function o0(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function r0(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function i0() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function Fc(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function Oc(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => Fc(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => Fc(n));
}
function s0(e = "") {
  const t = String(e || ""), n = Oc((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), o = Oc(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), r = n || o;
  return r.length > 240 ? `${r.slice(0, 237)}...` : r;
}
function a0(e = null) {
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
function l0(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function sn(e = "", t = "", n = null) {
  if (r0(e)) return i0();
  const o = a0(n);
  if (o0(e) || /\btext\/html\b/i.test(o.contentType)) {
    const r = l0(o), i = s0(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      r ? `（${r}）` : "",
      i ? `：${i}` : ""
    ].join("");
  }
  return String(e || t || "").trim();
}
function fm(e = {}, t = Ut) {
  const n = e0(e.baseUrl, t), o = String(e.apiKey || "").trim(), r = QI[t] || "", i = n || (o ? r : ""), s = { chat_completion_source: t || "openai" };
  return i && (s.reverse_proxy = i), o && (s.proxy_password = o), s;
}
function u0(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function c0(e = {}, t = Ut) {
  return fm(e, t);
}
function ba(e = {}, t = {}, n = [], o = !1, r = Ut) {
  const i = t.maxTokens, s = r === "openai" && jI(e.model);
  return u0({
    ...fm(e, r),
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
function d0(e = {}, t = {}, n = [], o = !1) {
  return ba(e, t, n, o, Ut);
}
function f0(e = {}, t = {}, n = [], o = !1) {
  return ba(e, t, n, o, um);
}
function h0(e = {}, t = {}, n = [], o = !1) {
  return ba(e, t, n, o, cm);
}
function Ra(e) {
  const t = e || globalThis.fetch;
  if (typeof t != "function") throw new Error("当前运行环境没有可用的 fetch，无法调用酒馆后端。");
  return t;
}
async function p0(e = {}, t = Ut, n = {}, o = {}) {
  const r = await Ra(o.fetch)(YI, {
    method: "POST",
    headers: await dm(o.requestHeadersProvider),
    body: JSON.stringify(c0(e, t)),
    signal: n.signal
  }), i = await r.text();
  let s = null;
  try {
    s = i ? JSON.parse(i) : {};
  } catch (c) {
    throw new Error(`酒馆后端模型列表拉取失败：${sn(i, String(c?.message || c), r)}`);
  }
  if (!r.ok || s?.error) {
    const c = sn(s?.message || s?.error?.message || i, `HTTP ${r.status}`, r);
    throw new Error(`酒馆后端模型列表拉取失败：${c}`);
  }
  const u = Array.isArray(s?.data) ? s.data.map((c) => String(c?.id || c?.name || "").trim()).filter(Boolean) : [];
  return [...new Set(u)];
}
async function hm(e = {}, t = Ut, n = {}) {
  return await p0(e, t, n, { requestHeadersProvider: pn });
}
async function m0(e = {}, t = {}) {
  return await hm(e, Ut, t);
}
async function g0(e = {}, t = {}, n = {}) {
  const o = await Ia(e, !1, n.requestHeadersProvider);
  typeof t.onRequest == "function" && t.onRequest(o);
  const r = await Ra(n.fetch)(o.url, {
    method: o.method,
    headers: o.rawHeaders || o.headers,
    body: JSON.stringify(o.body),
    signal: t.signal
  }), i = await r.text();
  let s = null;
  try {
    s = i ? JSON.parse(i) : {};
  } catch (u) {
    const c = /* @__PURE__ */ new Error(`酒馆后端生成失败：${sn(i, String(u?.message || u), r)}`);
    throw c.status = r.status, c.body = i, c;
  }
  if (!r.ok || s?.error) {
    const u = sn(s?.error?.message || s?.message || i, `HTTP ${r.status}`, r), c = /* @__PURE__ */ new Error(`酒馆后端生成失败：${u}`);
    throw c.status = r.status, c.error = s?.error, c;
  }
  return s;
}
async function _0(e = {}, t = {}) {
  return await g0(e, t, { requestHeadersProvider: pn });
}
async function y0(e = {}, t, n = {}, o = {}) {
  const r = await Ia(e, !0, o.requestHeadersProvider);
  typeof n.onRequest == "function" && n.onRequest(r);
  const i = await Ra(o.fetch)(r.url, {
    method: r.method,
    headers: r.rawHeaders || r.headers,
    body: JSON.stringify(r.body),
    signal: n.signal
  });
  if (!i.ok) {
    const s = await i.text().catch(() => ""), u = new Error(sn(s, `酒馆后端流式生成失败：HTTP ${i.status}`, i));
    throw u.status = i.status, u.body = s, u;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await zI(i, (s) => {
    if (s?.error) {
      const u = sn(s.error?.message || s.message || JSON.stringify(s.error), "酒馆后端流式生成失败");
      throw new Error(u);
    }
    t(s);
  });
}
async function v0(e = {}, t, n = {}) {
  return await y0(e, t, n, { requestHeadersProvider: pn });
}
var A0 = Object.freeze([
  "buildHostChatCompletionGenerateRequest",
  "createHostChatCompletion",
  "streamHostChatCompletion"
]);
function Yr(e) {
  if (!e || !A0.every((t) => typeof e[t] == "function")) throw new TypeError("酒馆渠道必须注入有效的 Host Client。");
  return e;
}
var Pa = Object.freeze({
  buildHostChatCompletionGenerateRequest: n0,
  fetchHostChatCompletionsModels: hm,
  fetchHostOpenAICompatibleModels: m0,
  createHostChatCompletion: _0,
  streamHostChatCompletion: v0
});
function $t(e) {
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
function S0(e = {}, t = {}, n = Q("sillytavern-claude", e, t.reasoning)) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const o = T0(t.toolChoice), r = n.profileId === "sillytavern-claude-manual" || n.profileId === "sillytavern-claude-adaptive-conditional";
  return {
    toolChoice: o,
    reasoningDisabledForForcedTool: o === "any" && n.mode === "on" && r
  };
}
var E0 = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function Xo(e = {}, t = {}, n = {}, o) {
  const r = o || Q("sillytavern-claude", e, t.reasoning);
  return n.reasoningDisabledForForcedTool ? {
    ...r,
    mode: "off",
    output: "hide"
  } : r;
}
function C0(e = {}, t = {}, n = {}) {
  return yt(e, {
    reasoning: n,
    effort: n.mode === "on" ? n.effort : "",
    controlFields: t.controlFields || {}
  });
}
function w0(e = {}, t = {}) {
  return { toolChoice: String(t.toolChoice || "") };
}
function pm(e = "") {
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
    const o = pm(t.function.arguments || "{}");
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
function b0(e = []) {
  const t = Array.isArray(e) ? $t(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function R0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = $t(r) || {}, s = b0(i?.providerPayload?.anthropicContent), u = I0(i.tool_calls);
    delete i.providerPayload, i.role === "assistant" && s && u.length ? (delete i.tool_calls, i.content = s.filter((c) => c?.type !== "tool_use").concat(u)) : i.role === "assistant" && s && (delete i.tool_calls, i.content = s), n.push(i);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function P0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const o = pm(t.inputJson);
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
function M0(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: $t(t.input) || {}
  } : $t(t) || null).filter(Boolean);
}
function x0(e = []) {
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
function mm(e = [], t = {}) {
  const n = P0(e), o = n.filter((r) => r.type === "tool_use" && r.name).map((r, i) => ({
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
    providerPayload: n.length ? { anthropicContent: M0(n) } : void 0
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
function k0(e, t, n = {}) {
  const o = [];
  let r = "stop", i = n.model || "";
  const s = (c, d = {}) => {
    const f = Number.isInteger(Number(c)) ? Number(c) : o.length;
    return o[f] ? o[f] = {
      ...o[f],
      ...d
    } : o[f] = { ...d }, o[f];
  }, u = () => {
    const c = x0(o);
    N0(e, {
      text: c.text,
      thoughts: K(t) ? c.thoughts : [],
      ...Array.isArray(c.toolCalls) ? { toolCalls: c.toolCalls } : {},
      ...c.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(c = {}) {
      if (c?.message?.model && (i = c.message.model), c.type === "content_block_start") {
        s(c.index, $t(c.content_block) || {}), u();
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
      return mm(o, {
        finishReason: r,
        model: i,
        includeReasoningOutput: K(t)
      });
    }
  };
}
var D0 = class {
  constructor(e, t = Pa) {
    this.config = e, this.hostClient = Yr(t);
  }
  buildMessages(e) {
    return R0(e);
  }
  resolveToolProtocol(e, t) {
    return S0(this.config, e, t);
  }
  buildPayload(e, t = this.resolveToolProtocol(e), n = Xo(this.config, e, t)) {
    const o = typeof e.onStreamProgress == "function", r = this.buildMessages(e), i = {
      ...e,
      toolChoice: t.toolChoice,
      reasoning: n,
      temperature: fo({
        ...this.config,
        provider: "sillytavern-claude"
      }, n) ? void 0 : e.temperature
    }, s = f0(this.config, i, r, o);
    return n.mode === "on" ? (s.reasoning_effort = n.effort, s.include_reasoning = K(n)) : n.mode === "off" ? (s.reasoning_effort = "auto", s.include_reasoning = !1) : (s.reasoning_effort = "auto", s.include_reasoning = K(n)), s;
  }
  async inspectRequest(e, t = {}) {
    const n = Q("sillytavern-claude", this.config, e.reasoning), o = t.protocol || this.resolveToolProtocol(e, n), r = t.effectiveReasoning || Xo(this.config, e, o, n), i = t.payload || this.buildPayload(e, o, r), s = await this.hostClient.buildHostChatCompletionGenerateRequest(i, typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(s, o, e, r);
  }
  buildRequestInspection(e, t = {}, n = {}, o = Xo(this.config, n, t)) {
    const r = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-claude",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Dt(e),
      effectiveConfig: {
        ...w0(n, t),
        ...C0(n, {
          ...t,
          controlFields: r
        }, o)
      },
      ...t.reasoningDisabledForForcedTool ? { notices: [E0] } : {}
    };
  }
  async chat(e) {
    const t = Q("sillytavern-claude", this.config, e.reasoning), n = typeof e.onStreamProgress == "function", o = this.resolveToolProtocol(e, t), r = Xo(this.config, e, o, t), i = this.buildPayload(e, o, r);
    let s = null;
    const u = (c) => {
      s = this.buildRequestInspection(c, o, e, r);
    };
    try {
      if (n) {
        const d = k0(e, r, this.config);
        return await this.hostClient.streamHostChatCompletion(i, (f) => {
          d.accept(f);
        }, {
          signal: e.signal,
          onRequest: u
        }), {
          ...d.result(),
          requestInspection: s
        };
      }
      const c = await this.hostClient.createHostChatCompletion(i, {
        signal: e.signal,
        onRequest: u
      });
      return {
        ...mm(Array.isArray(c?.content) ? c.content : [{
          type: "text",
          text: c?.choices?.[0]?.message?.content || ""
        }], {
          finishReason: c?.stop_reason || c?.choices?.[0]?.finish_reason || "stop",
          model: c?.model || this.config.model,
          includeReasoningOutput: K(r)
        }),
        requestInspection: s
      };
    } catch (c) {
      throw s && c && typeof c == "object" && (c.requestInspection = s), c;
    }
  }
};
function Ma(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function an(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = Ma(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function $0(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((r) => an(r)).filter((r) => Array.isArray(r.parts) && r.parts.length);
  const n = e?.providerPayload?.googleContent, o = an(n);
  return o.parts.length ? [o] : [];
}
function L0(e = {}) {
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
function U0(e = {}, t = 0) {
  const n = an(e);
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
    const u = L0(s.inlineData);
    u && o.content.push(u);
  }), i.length && o.content.push({
    type: "tool_calls",
    tool_calls: i
  }), r && o.content.some((s) => s?.type === "text") && (o.signature = r), o.content.length ? o : null;
}
function F0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = $0(r);
    if (r.role === "assistant" && i.length) {
      i.forEach((u, c) => {
        const d = U0(u, c);
        d && n.push(d);
      });
      return;
    }
    const s = Ma(r) || {};
    delete s.providerPayload, n.push(s);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function gm(e = {}) {
  return an(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function _m(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function ym(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function vm(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function O0(e, t) {
  const n = String(t || ""), o = String(e || "");
  return n ? !o || n.startsWith(o) ? n : o.endsWith(n) ? o : `${o}${n}` : o;
}
function G0(e = [], t = []) {
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
function Am(e) {
  const t = an(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function B0(e = {}, t = {}) {
  const n = gm(e), o = e?.choices?.[0]?.message?.content || "";
  return {
    text: _m(n) || o,
    toolCalls: vm(n),
    thoughts: t.includeReasoningOutput === !1 ? [] : ym(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: Am(n)
  };
}
function q0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function H0(e, t, n = {}) {
  let o = "", r = [], i = [], s = "STOP", u = n.model || "";
  const c = [];
  return {
    accept(d = {}) {
      u = d.model || d.modelVersion || u, s = d?.candidates?.[0]?.finishReason || s;
      const f = gm(d);
      f.parts.length && c.push(...Ma(f.parts) || []), o = O0(o, _m(f)), r = G0(r, vm(f));
      const h = K(t) ? ym(f) : [];
      h.length && (i = h), q0(e, {
        text: o,
        thoughts: i,
        ...r.length ? {
          toolCalls: r,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const d = an({
        role: "model",
        parts: c.length ? c : o ? [{ text: o }] : []
      });
      return {
        text: o,
        toolCalls: r,
        thoughts: i,
        finishReason: s,
        model: u,
        provider: "sillytavern-google",
        providerPayload: Am(d)
      };
    }
  };
}
var V0 = class {
  constructor(e, t = Pa) {
    this.config = e, this.hostClient = Yr(t);
  }
  buildMessages(e) {
    return F0(e);
  }
  buildPayload(e, t = Q("sillytavern-google", this.config, e.reasoning)) {
    const n = t, o = typeof e.onStreamProgress == "function", r = this.buildMessages(e), i = h0(this.config, e, r, o);
    return n.mode === "on" ? (i.reasoning_effort = n.effort, i.include_reasoning = K(n)) : n.mode === "off" ? (i.reasoning_effort = "min", i.include_reasoning = !1) : (i.reasoning_effort = "auto", i.include_reasoning = K(n)), i;
  }
  async inspectRequest(e, t = {}) {
    const n = t.effectiveReasoning || Q("sillytavern-google", this.config, e.reasoning), o = t.payload || this.buildPayload(e, n), r = await this.hostClient.buildHostChatCompletionGenerateRequest(o, typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(r, e, n);
  }
  buildRequestInspection(e, t = {}, n = Q("sillytavern-google", this.config, t.reasoning)) {
    const o = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Dt(e),
      effectiveConfig: yt(t, {
        reasoning: n,
        effort: e?.body?.reasoning_effort,
        controlFields: o
      })
    };
  }
  async chat(e) {
    const t = Q("sillytavern-google", this.config, e.reasoning), n = typeof e.onStreamProgress == "function", o = this.buildPayload(e, t);
    let r = null;
    const i = (s) => {
      r = this.buildRequestInspection(s, e, t);
    };
    try {
      if (n) {
        const s = H0(e, t, this.config);
        return await this.hostClient.streamHostChatCompletion(o, (u) => {
          s.accept(u);
        }, {
          signal: e.signal,
          onRequest: i
        }), {
          ...s.result(),
          requestInspection: r
        };
      }
      return {
        ...B0(await this.hostClient.createHostChatCompletion(o, {
          signal: e.signal,
          onRequest: i
        }), {
          model: this.config.model,
          includeReasoningOutput: K(t)
        }),
        requestInspection: r
      };
    } catch (s) {
      throw r && s && typeof s == "object" && (s.requestInspection = r), s;
    }
  }
};
function J0(e, t, n) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: K(n) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Ai(e, t = []) {
  const n = Pt(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : Mt(n.cleaned)
  };
}
function K0(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var W0 = class {
  constructor(e, t = Pa) {
    this.config = e, this.hostClient = Yr(t);
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? vs(e, this.config.model) : ys(e, this.config.model);
  }
  buildPayload(e, t = !1, n = Q("sillytavern-openai-compatible", this.config, e.reasoning)) {
    const o = n, r = t ? vs(e, this.config.model) : ys(e, this.config.model), i = {
      ...e,
      temperature: fo({
        ...this.config,
        provider: "sillytavern-openai-compatible"
      }, o) ? void 0 : e.temperature
    };
    return rm(d0(this.config, t ? {
      ...i,
      tools: void 0,
      toolChoice: void 0
    } : i, r, typeof e.onStreamProgress == "function"), o);
  }
  async inspectRequest(e, t = {}) {
    const n = t.effectiveReasoning || Q("sillytavern-openai-compatible", this.config, e.reasoning), o = t.payload || this.buildPayload(e, !!t.taggedMode, n), r = await this.hostClient.buildHostChatCompletionGenerateRequest(o, typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(r, e, n);
  }
  buildRequestInspection(e, t = {}, n = Q("sillytavern-openai-compatible", this.config, t.reasoning)) {
    const o = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "thinking") ? { thinking: e.body.thinking } : {}
    };
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Dt(e),
      effectiveConfig: yt(t, {
        reasoning: n,
        effort: e?.body?.reasoning_effort,
        controlFields: o
      })
    };
  }
  async streamChat(e, t, n, o = {}) {
    const r = { role: "assistant" };
    let i = "stop", s = this.config.model;
    await this.hostClient.streamHostChatCompletion(t, (p) => {
      s = p?.model || s;
      const m = p?.choices?.[0] || {};
      As(r, m), m.finish_reason && (i = m.finish_reason);
      const g = en(r), { thinkTagged: _, cleanedText: y } = Ai(jt(r), g), E = g.length ? g : gs(_.cleaned);
      J0(e, {
        text: y,
        thoughts: K(n) ? pt(r, m).concat(_.thoughts) : [],
        ...E.length ? { toolCalls: E } : {},
        ...!g.length && E.length ? { toolCallDraft: !0 } : {}
      }, n);
    }, {
      signal: e.signal,
      onRequest: o.onRequest,
      onResponseAccepted: o.onResponseAccepted
    }), tn(r);
    const u = en(r), { thinkTagged: c, cleanedText: d } = Ai(jt(r), u), f = pt(r, {});
    c.thoughts.forEach((p) => f.push(p));
    const h = u.length ? [] : no(c.cleaned);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: K(n) ? f : [],
      finishReason: i,
      model: s,
      provider: "sillytavern-openai-compatible",
      providerPayload: oo(r)
    };
  }
  async nonStreamingChat(e, t, n, o = {}) {
    const r = await this.hostClient.createHostChatCompletion(t, {
      signal: e.signal,
      onRequest: o.onRequest
    }), i = r.choices?.[0] || {}, s = i.message || {};
    tn(s);
    const u = pt(s, i), c = Sa(s.tool_calls || []), { thinkTagged: d, cleanedText: f } = Ai(Ea(s.content), c);
    d.thoughts.forEach((m) => u.push(m));
    const h = c.length ? [] : no(d.cleaned), p = wr(s, i);
    return {
      text: f,
      toolCalls: [...c, ...h],
      thoughts: K(n) ? u : [],
      finishReason: i.finish_reason || "stop",
      model: r.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: oo(p)
    };
  }
  async chat(e) {
    const t = Q("sillytavern-openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, o = Array.isArray(e.tools) && e.tools.length > 0, r = async (s, u = {}) => {
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
      if (e.allowToolProtocolFallback === !1 || n || !o || !K0(s)) throw s;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await r(this.buildPayload(e, !0, t));
  }
};
function Ti(e, t, n) {
  return Object.hasOwn(n, "hostClient") ? new e(t, Yr(n.hostClient)) : new e(t);
}
function lb(e = {}, t = {}) {
  if (!e.apiKey && !Qm(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (jc(e.reasoning || {}), e.provider) {
    case "sillytavern-openai-compatible":
      return Ti(W0, e, t);
    case "sillytavern-claude":
      return Ti(D0, e, t);
    case "sillytavern-google":
      return Ti(V0, e, t);
    case "openai-responses":
      return new WI(e);
    case "anthropic":
      return new jg(e);
    case "google":
      return new QC(e);
    default:
      return new $I(e);
  }
}
function z0(e = {}) {
  const t = String(e?.name || "").trim();
  if (typeof e?.arguments == "string") {
    const n = e.arguments;
    try {
      return JSON.parse(n.trim() || "{}"), n;
    } catch {
      return em(n, t) || n;
    }
  }
  try {
    return JSON.stringify(e?.arguments || {});
  } catch {
    return "{}";
  }
}
function Ts(e = [], t = {}) {
  const n = String(t.fallbackPrefix || "agent-tool").trim() || "agent-tool", o = typeof t.createId == "function" ? t.createId : (r) => `${n}-${Date.now()}-${r + 1}`;
  return (Array.isArray(e) ? e : []).map((r, i) => {
    const s = Object.prototype.hasOwnProperty.call(r || {}, "providerId");
    return {
      id: String(r?.id || o(i) || `${n}-${i + 1}`),
      name: String(r?.name || "").trim(),
      arguments: z0(r),
      ...s ? { providerId: String(r?.providerId || "") } : {}
    };
  }).filter((r) => r.name);
}
function Y0(e, t = {}) {
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
function ub(e = {}, t = {}, n = {}) {
  const o = Ts(e?.toolCalls, n);
  return o.length ? o : String(e?.provider || t?.provider || "").toLowerCase() !== "google" ? [] : Ts(Y0(e?.providerPayload, n), n);
}
function cb(e = {}, t = [], n = {}) {
  return {
    role: "assistant",
    content: Object.prototype.hasOwnProperty.call(n, "content") ? String(n.content || "") : String(e.text || ""),
    providerPayload: e.providerPayload,
    tool_calls: Ts(t, n).map((o) => ({
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
function db(e = {}) {
  const t = String(e.toolName || e.tool_name || "").trim();
  return {
    role: "tool",
    tool_call_id: String(e.toolCallId || e.tool_call_id || ""),
    ...t ? { toolName: t } : {},
    content: String(e.content || "")
  };
}
export {
  nb as AGENT_REQUEST_TIMEOUT_MS,
  Xm as PROVIDER_OPTIONS,
  X0 as REASONING_MODE_OPTIONS,
  cb as buildProviderAssistantToolCallMessage,
  db as buildProviderToolResultMessage,
  lb as createAgentAdapter,
  rb as getProviderLabel,
  tb as getReasoningEffortOptions,
  eb as getReasoningModeOptions,
  ib as getToolModeLabel,
  Qm as isSillyTavernProvider,
  $m as normalizeAgentConfig,
  j0 as normalizeAgentSettings,
  Ss as normalizeReasoningConfig,
  Dt as redactRequestSecrets,
  sb as resolveActiveProviderConfig,
  xs as resolveReasoningCapability,
  ub as resolveResultToolCalls,
  Ci as resolveRuntimeReasoning,
  ab as setHostChatCompletionsRequestHeadersProvider
};
