var ym = Object.create, qc = Object.defineProperty, vm = Object.getOwnPropertyDescriptor, Am = Object.getOwnPropertyNames, Tm = Object.getPrototypeOf, Sm = Object.prototype.hasOwnProperty, Nr = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), Em = (e, t, n, o) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (var r = Am(t), i = 0, a = r.length, u; i < a; i++)
      u = r[i], !Sm.call(e, u) && u !== n && qc(e, u, {
        get: ((c) => t[c]).bind(null, u),
        enumerable: !(o = vm(t, u)) || o.enumerable
      });
  return e;
}, Im = (e, t, n) => (n = e != null ? ym(Tm(e)) : {}, Em(t || !e || !e.__esModule ? qc(n, "default", {
  value: e,
  enumerable: !0
}) : n, e)), wm = "https://api.tavily.com";
function Ei(e = "") {
  return String(e || "").trim();
}
function jn(e = "") {
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
]), Q0 = Object.freeze([Object.freeze({
  value: "hide",
  label: "隐藏"
}), Object.freeze({
  value: "show",
  label: "显示"
})]);
function Cm(e = "") {
  return e === "on" || e === "off" ? e : "inherit";
}
function Hc(e = "") {
  return e === "show" ? "show" : "hide";
}
function bm(e) {
  return String(e ?? "").trim().toLowerCase() || void 0;
}
function Rm(e) {
  if (e == null || e === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? Math.floor(t) : void 0;
}
function Es(e = {}) {
  const t = e && typeof e == "object" ? e : {}, n = bm(t.effort), o = Rm(t.budgetTokens);
  return {
    mode: Cm(t.mode),
    output: Hc(t.output),
    ...n ? { effort: n } : {},
    ...o !== void 0 ? { budgetTokens: o } : {}
  };
}
function J(e = {}) {
  return Hc(e?.output) === "show";
}
var Vc = "openai-compatible", Is = "默认", Jc = "default", Pm = "deny", tt = 32e3;
var Z0 = Object.freeze([{
  value: "default",
  label: "默认权限"
}, {
  value: "full",
  label: "完全权限"
}]), j0 = Object.freeze([{
  value: "deny",
  label: "禁止"
}, {
  value: "allow",
  label: "允许"
}]), Ii = {
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
function Qt() {
  return JSON.parse(JSON.stringify(Ii));
}
function _t() {
  return {
    provider: Vc,
    modelConfigs: Qt(),
    permissionMode: Jc
  };
}
function Kc(e = _t()) {
  const t = e && typeof e == "object" ? e : _t();
  return {
    provider: Cs(t.provider),
    modelConfigs: ws(t.modelConfigs || {})
  };
}
function Wc(e) {
  return e === "full" ? "full" : Jc;
}
function zc(e) {
  return e === "allow" ? "allow" : Pm;
}
function Ln(e, t = tt) {
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
function ws(e = {}) {
  const t = Qt();
  return Object.keys(Ii).forEach((n) => {
    const o = e && typeof e[n] == "object" ? e[n] : {}, r = Ii[n];
    t[n] = {
      baseUrl: String(o.baseUrl ?? r.baseUrl ?? ""),
      model: String(o.model ?? r.model ?? ""),
      apiKey: String(o.apiKey ?? r.apiKey ?? ""),
      temperature: o.temperature ?? r.temperature,
      maxTokens: Ln(o.maxTokens, r.maxTokens),
      sendTemperature: typeof o.sendTemperature == "boolean" ? o.sendTemperature : r.sendTemperature,
      ..."toolMode" in r ? { toolMode: String(o.toolMode || r.toolMode || "native") } : {},
      reasoning: Es(o.reasoning)
    };
  }), t;
}
function Cs(e) {
  return typeof e == "string" && e.trim() ? e : Vc;
}
function bs(e = {}, t) {
  return e && typeof e.presets == "object" && e.presets ? e.presets : e?.modelConfigs ? { [t]: {
    provider: e.provider || "openai-compatible",
    modelConfigs: e.modelConfigs,
    permissionMode: e.permissionMode
  } } : {};
}
function Yc(e = {}, t) {
  const n = {}, o = bs(e, t);
  return Object.entries(o).forEach(([r, i]) => {
    if (!i || typeof i != "object") return;
    const a = ot(r);
    n[a] = {
      provider: Cs(i.provider),
      modelConfigs: ws(i.modelConfigs || {}),
      permissionMode: Wc(i.permissionMode)
    };
  }), Object.keys(n).length || (n[Is] = _t()), n;
}
function Xc(e, t) {
  const n = ot(t);
  return e[n] ? n : Object.keys(e)[0];
}
function Qc(e, t, n) {
  const o = ot(t || n);
  return e[o] ? o : e[n] ? n : Object.keys(e)[0];
}
function Rs(e = {}, t = _t()) {
  const n = Kc(t), o = e && typeof e == "object" ? e : {};
  return {
    provider: Cs(o.provider || n.provider),
    modelConfigs: ws(o.modelConfigs || n.modelConfigs)
  };
}
function Zc(e = {}, t = {}, n = Is, o = n) {
  if (e?.delegateConfigured === !1) return !1;
  if (o !== n) return !0;
  const r = e?.delegateConfig;
  if (!r || typeof r != "object" || Array.isArray(r) || !(typeof r.provider == "string" && r.provider.trim() || r.modelConfigs && typeof r.modelConfigs == "object" && Object.keys(r.modelConfigs).length)) return !1;
  if (e?.delegateConfigured === !0) return !0;
  const i = t[n] || _t(), a = Kc(i), u = Rs(r, i);
  return JSON.stringify(u) !== JSON.stringify(a);
}
function Mm(e = {}, t, n, o, r) {
  const i = r(e?.[o]);
  if (i) return i;
  const a = bs(e, t), u = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(a || {})
  ].map(ot), c = /* @__PURE__ */ new Set();
  for (const d of u) {
    if (c.has(d)) continue;
    c.add(d);
    const h = r(a?.[d]?.[o]);
    if (h) return h;
  }
  return r(e?.delegateConfig?.[o]);
}
function xm(e = {}, t, n) {
  const o = (u) => String(u || "").trim();
  if (o(e?.tavilyBaseUrl)) return jn(e.tavilyBaseUrl);
  const r = bs(e, t), i = [
    n,
    t,
    e?.currentPresetName,
    e?.delegatePresetName,
    ...Object.keys(r || {})
  ].map(ot), a = /* @__PURE__ */ new Set();
  for (const u of i) {
    if (a.has(u)) continue;
    a.add(u);
    const c = r?.[u]?.tavilyBaseUrl;
    if (o(c)) return jn(c);
  }
  return o(e?.delegateConfig?.tavilyBaseUrl) ? jn(e.delegateConfig.tavilyBaseUrl) : wm;
}
function jc(e = {}, t, n) {
  return {
    tavilyApiKey: Mm(e, t, n, "tavilyApiKey", Ei),
    tavilyBaseUrl: xm(e, t, n)
  };
}
function eb(e = {}, t = {}) {
  const { defaultWorkspaceFileName: n = "", normalizeWorkspaceName: o = (p) => String(p || "") } = t, r = ot(e.currentPresetName || e.presetName || "默认"), i = Yc(e, r), a = Xc(i, e.currentPresetName), u = Qc(i, e.delegatePresetName, a), c = i[u] || i[a] || _t(), d = Rs(e.delegateConfig, c), h = Zc(e, i, a, u), f = jc(e, r, a);
  return {
    enabled: !!e.enabled,
    workspaceFileName: o(e.workspaceFileName || n),
    jsApiPermission: zc(e.jsApiPermission),
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
function Nm(e = {}) {
  const t = ot(e.currentPresetName || e.presetDraftName || "默认"), n = Yc(e, t), o = Xc(n, e.currentPresetName), r = Qc(n, e.delegatePresetName, o), i = n[o] || _t(), a = n[r] || i, u = Rs(e.delegateConfig, a), c = Zc(e, n, o, r), d = jc(e, t, o);
  return {
    workspaceFileName: String(e.workspaceFileName || ""),
    updatedAt: Number(e.updatedAt) || 0,
    jsApiPermission: zc(e.jsApiPermission),
    currentPresetName: o,
    delegatePresetName: r,
    delegateConfig: u,
    delegateConfigured: c,
    presetDraftName: ot(e.presetDraftName || o),
    presetNames: Object.keys(n),
    presets: n,
    provider: i.provider,
    modelConfigs: i.modelConfigs,
    permissionMode: Wc(i.permissionMode),
    tavilyApiKey: d.tavilyApiKey,
    tavilyBaseUrl: d.tavilyBaseUrl
  };
}
var km = Object.freeze({
  minimal: "最小",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "超高",
  max: "最大",
  min: "最小"
});
function kr(e) {
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
function Z(e, t, n, o, r = {}) {
  return kr({
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
function Dr(e, t, n, o = {}) {
  return kr({
    profileId: e,
    modes: t,
    intensity: {
      kind: "budget",
      min: n.min,
      max: n.max,
      defaultValue: n.defaultValue,
      allowAuto: n.allowAuto === !0
    },
    outputModes: o.outputModes,
    temperatureOmitModes: o.temperatureOmitModes
  });
}
function Dm(e, t, n = {}) {
  return kr({
    profileId: e,
    modes: t,
    intensity: { kind: "none" },
    outputModes: n.outputModes,
    temperatureOmitModes: n.temperatureOmitModes
  });
}
var Be = kr({
  profileId: "unsupported",
  modes: ["inherit"],
  outputModes: ["hide"],
  intensity: { kind: "none" },
  unsupportedReason: "当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。"
}), Ft = Object.freeze(["on"]), Gt = Object.freeze(["inherit", "on"]), Ps = Object.freeze([
  "inherit",
  "on",
  "off"
]), St = Object.freeze({
  latest: Z("openai-gpt-5.6", [
    "inherit",
    "on",
    "off"
  ], [
    "low",
    "medium",
    "high",
    "xhigh",
    "max"
  ], "medium", { temperatureOmitModes: Ps }),
  gpt55: Z("openai-gpt-5.5", [
    "inherit",
    "on",
    "off"
  ], [
    "low",
    "medium",
    "high",
    "xhigh"
  ], "medium", { temperatureOmitModes: Gt }),
  gpt52To54: Z("openai-gpt-5.2-5.4", [
    "inherit",
    "on",
    "off"
  ], [
    "low",
    "medium",
    "high",
    "xhigh"
  ], "medium", { temperatureOmitModes: Gt }),
  gpt51: Z("openai-gpt-5.1", [
    "inherit",
    "on",
    "off"
  ], [
    "low",
    "medium",
    "high"
  ], "medium", { temperatureOmitModes: Gt }),
  fixedMedium: Z("openai-gpt-5.3-chat", ["inherit", "on"], ["medium"], "medium", { temperatureOmitModes: Gt }),
  gpt5: Z("openai-gpt-5", ["inherit", "on"], [
    "minimal",
    "low",
    "medium",
    "high"
  ], "medium", { temperatureOmitModes: Gt }),
  oSeries: Z("openai-o-series", ["inherit", "on"], [
    "low",
    "medium",
    "high"
  ], "medium", { temperatureOmitModes: Gt })
}), $m = Object.freeze([
  "o1",
  "o3-mini",
  "o3-mini-2025-01-31",
  "o4-mini",
  "o4-mini-2025-04-16",
  "o3",
  "o3-2025-04-16",
  "gpt-5",
  "gpt-5-2025-08-07",
  "gpt-5-mini",
  "gpt-5-mini-2025-08-07",
  "gpt-5-nano",
  "gpt-5-nano-2025-08-07",
  "gpt-5.1",
  "gpt-5.1-2025-11-13",
  "gpt-5.1-chat-latest",
  "gpt-5.2",
  "gpt-5.2-2025-12-11",
  "gpt-5.2-chat-latest",
  "gpt-5.3-chat-latest",
  "gpt-5.4",
  "gpt-5.4-2026-03-05",
  "gpt-5.4-mini",
  "gpt-5.4-mini-2026-03-17",
  "gpt-5.4-nano",
  "gpt-5.4-nano-2026-03-17",
  "gpt-5.5",
  "gpt-5.5-2026-04-23"
]), Lm = new Set($m), Um = /* @__PURE__ */ new Set([
  "o1",
  "o1-2024-12-17",
  "o3-mini",
  "o3-mini-2025-01-31",
  "o3",
  "o3-2025-04-16",
  "o4-mini",
  "o4-mini-2025-04-16"
]), Fm = Z("kimi-k3", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "max", { temperatureOmitModes: Ft }), Om = Dm("kimi-k2.5-k2.6", [
  "inherit",
  "on",
  "off"
], { temperatureOmitModes: Ft }), Gm = Z("deepseek-thinking", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "high", { temperatureOmitModes: Ft }), Bm = Z("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: Ft }), qm = Z("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: Ps }), Hm = Dr("anthropic-manual", [
  "inherit",
  "on",
  "off"
], {
  min: 1024,
  max: 128e3,
  defaultValue: 8192
}, { temperatureOmitModes: Ft }), Vm = Z("sillytavern-claude-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: Ps }), Jm = Z("sillytavern-claude-adaptive-conditional", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: Ft }), Km = Z("sillytavern-claude-manual", [
  "inherit",
  "on",
  "off"
], [
  "min",
  "low",
  "medium",
  "high",
  "max"
], "medium", { temperatureOmitModes: Ft }), Wm = Dr("google-gemini-2.5-flash", [
  "inherit",
  "on",
  "off"
], {
  min: 1,
  max: 24576,
  defaultValue: -1,
  allowAuto: !0
}), zm = Dr("google-gemini-2.5-flash-lite", [
  "inherit",
  "on",
  "off"
], {
  min: 512,
  max: 24576,
  defaultValue: -1,
  allowAuto: !0
}), Ym = Dr("google-gemini-2.5-pro", ["inherit", "on"], {
  min: 128,
  max: 32768,
  defaultValue: -1,
  allowAuto: !0
}), Xm = Z("google-gemini-3-flash", ["inherit", "on"], [
  "minimal",
  "low",
  "medium",
  "high"
], "high"), Qm = Z("google-gemini-3-pro", ["inherit", "on"], ["low", "high"], "high"), Zm = Z("sillytavern-google-2.5-flash", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "medium"), jm = Z("sillytavern-google-2.5-flash-lite", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "medium"), eg = Z("sillytavern-google-2.5-pro", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high",
  "max"
], "medium"), tg = Z("sillytavern-google-3-flash", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high"
], "high"), ng = Z("sillytavern-google-3-pro", ["inherit", "on"], ["low", "high"], "high");
function ho(e = "") {
  return String(e || "").trim().toLowerCase();
}
function wi(e = "") {
  const t = ho(e);
  return /^gpt-5\.6(?:[-.]|$)/.test(t) ? St.latest : /^gpt-5\.5(?:[-.]|$)/.test(t) ? St.gpt55 : /^gpt-5\.3-chat-latest(?:[-.]|$)/.test(t) ? St.fixedMedium : /^gpt-5\.(?:2|4)(?:[-.]|$)/.test(t) ? St.gpt52To54 : /^gpt-5\.1(?:[-.]|$)/.test(t) ? St.gpt51 : /^gpt-5(?:-(?:mini|nano))?(?:-|$)/.test(t) ? St.gpt5 : Um.has(t) ? St.oSeries : null;
}
function og(e = "", t = "") {
  const n = ho(t), o = String(e || "").trim().toLowerCase();
  return /^kimi-k3(?:[.-]|$)/.test(n) ? Fm : /^kimi-k2[.-](?:5|6)(?:[.-]|$)/.test(n) ? Om : /^kimi-k2[.-]7(?:[.-]|$)/.test(n) ? Be : /^deepseek-(?:chat|reasoner|v3)/.test(n) || o.includes("api.deepseek.com") && n.startsWith("deepseek-") ? Gm : wi(n) || Be;
}
function Ma(e = "", t = !1) {
  const n = ho(e);
  return /^claude-opus-4-7/.test(n) ? t ? Vm : qm : /^claude-(?:opus-4-6|sonnet-4-6)/.test(n) ? t ? Jm : Bm : /^claude-(?:3-7|opus-4|sonnet-4|haiku-4-5)/.test(n) ? t ? Km : Hm : Be;
}
function xa(e = "", t = !1) {
  const n = ho(e);
  return n.includes("image") ? Be : /^gemini-2\.5-flash-lite/.test(n) ? t ? jm : zm : /^gemini-2\.5-flash/.test(n) ? t ? Zm : Wm : /^gemini-2\.5-pro/.test(n) ? t ? eg : Ym : /^gemini-3(?:[.\d]*)?-flash/.test(n) ? t ? tg : Xm : /^gemini-3(?:[.\d]*)?-pro/.test(n) ? t ? ng : Qm : Be;
}
function Ms(e = {}) {
  const t = String(e.provider || "").trim(), n = ho(e.model);
  switch (t) {
    case "openai-responses":
      return wi(n) || Be;
    case "openai-compatible":
      return og(e.baseUrl, n);
    case "sillytavern-openai-compatible":
      return Lm.has(n) && wi(n) || Be;
    case "anthropic":
      return Ma(n, !1);
    case "sillytavern-claude":
      return Ma(n, !0);
    case "google":
      return xa(n, !1);
    case "sillytavern-google":
      return xa(n, !0);
    default:
      return Be;
  }
}
function tb(e = Be) {
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
function nb(e = Be) {
  return e.intensity?.kind !== "effort" ? [] : e.intensity.values.map((t) => ({
    value: t,
    label: km[t] || t
  }));
}
function gn(e, t, n, o = "REASONING_CAPABILITY_UNSUPPORTED") {
  return {
    ...e,
    profileId: t.profileId,
    valid: !1,
    error: n,
    code: o
  };
}
function rg(e, t) {
  const n = { ...e };
  return delete n.effort, delete n.budgetTokens, t.intensity?.kind === "effort" ? {
    ...n,
    ...e.effort ? { effort: e.effort } : {}
  } : t.intensity?.kind === "budget" ? {
    ...n,
    ...e.budgetTokens !== void 0 ? { budgetTokens: e.budgetTokens } : {}
  } : n;
}
function Ci(e = {}, t = {}) {
  const n = Ms(e), o = rg(Es(t), n);
  if (!n.outputModes.includes(o.output)) return gn(o, n, "当前模型不支持返回 Reasoning 内容，请选择“隐藏”。");
  if (!n.modes.includes(o.mode)) return gn(o, n, o.mode === "off" ? "当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。" : n.unsupportedReason || "当前模型不支持显式开启 Reasoning。");
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
    } : gn(o, n, `当前模型不支持 Reasoning 强度“${r}”。`, "REASONING_CONFIG_INVALID");
  }
  if (n.intensity.kind === "budget") {
    const r = o.budgetTokens ?? n.intensity.defaultValue;
    if (!(n.intensity.allowAuto && r === -1) && (!Number.isInteger(r) || r < n.intensity.min || r > n.intensity.max)) return gn(o, n, `Reasoning Token 预算必须在 ${n.intensity.min}–${n.intensity.max} 之间${n.intensity.allowAuto ? "，或填写 -1 使用自动预算" : ""}。`, "REASONING_CONFIG_INVALID");
    const i = Number(e.maxTokens);
    return n.profileId === "anthropic-manual" && Number.isFinite(i) && i > 0 && r >= Math.floor(i) ? gn(o, n, "Anthropic 手动 thinking 的 Token 预算必须小于最大输出 Token。", "REASONING_CONFIG_INVALID") : {
      ...o,
      budgetTokens: r,
      profileId: n.profileId,
      valid: !0
    };
  }
  return {
    ...o,
    profileId: n.profileId,
    valid: !0
  };
}
var ig = class extends Error {
  constructor(e = {}) {
    super(e.error || "当前模型不支持所选 Reasoning 配置。"), this.name = "ReasoningCapabilityError", this.code = e.code || "REASONING_CAPABILITY_UNSUPPORTED", this.profileId = e.profileId || "unsupported", this.reasoning = e;
  }
};
function ed(e = {}) {
  if (e.valid === !1) throw new ig(e);
  return e;
}
function pe(e = "", t = {}, n = {}, o = {}) {
  return ed(Ci({
    provider: e,
    baseUrl: t.baseUrl,
    model: t.model,
    maxTokens: o.maxTokens ?? t.maxTokens
  }, n));
}
function po(e = {}, t = {}) {
  return Ms(e).temperatureOmitModes.includes(t.mode);
}
var ob = 900 * 1e3, rb = Object.freeze([{
  value: "native",
  label: "原生 Tool Calling"
}, {
  value: "tagged-json",
  label: "Tagged JSON 兼容模式"
}]), sg = Object.freeze([
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
function ag(e = "") {
  return e === "sillytavern-openai-compatible" || e === "sillytavern-claude" || e === "sillytavern-google";
}
function td(e, t = 1) {
  const n = typeof e == "string" && !e.trim() ? t : e, o = Number(n);
  return Number.isFinite(o) ? Math.max(0, Math.min(2, o)) : td(t, 1);
}
function bi(e = {}) {
  return e.sendTemperature !== !1;
}
function Na(e = {}) {
  return bi(e) ? td(e.temperature, 1) : void 0;
}
function ib(e = "", t = {}) {
  return t && typeof t == "object" && t[e] ? t[e] : sg.find((n) => n.value === e)?.label || e || "未配置";
}
function sb(e = {}) {
  const t = String(e.provider || "").trim();
  return t === "openai-compatible" || t === "sillytavern-openai-compatible" ? e.toolMode === "tagged-json" ? "Tagged JSON 兼容模式" : "原生 Tool Calling" : "Provider 原生工具";
}
function ab(e = {}, t = {}) {
  const n = Nm(e || {});
  if (t.role === "delegate" && n.delegateConfig) {
    const d = n.delegateConfig.provider || "openai-compatible", h = (n.delegateConfig.modelConfigs || Qt())[d] || Qt()[d] || {}, f = {
      provider: d,
      baseUrl: String(h.baseUrl || ""),
      model: String(h.model || ""),
      maxTokens: Ln(h.maxTokens)
    };
    return {
      currentPresetName: String(n.delegatePresetName || n.currentPresetName || ""),
      provider: d,
      baseUrl: String(h.baseUrl || ""),
      model: String(h.model || ""),
      apiKey: String(h.apiKey || ""),
      tavilyApiKey: Ei(n.tavilyApiKey),
      tavilyBaseUrl: jn(n.tavilyBaseUrl),
      temperature: Na(h),
      sendTemperature: bi(h),
      maxTokens: Ln(h.maxTokens),
      timeoutMs: Number(t.timeoutMs) || 9e5,
      toolMode: h.toolMode || "native",
      reasoning: Ci(f, h.reasoning)
    };
  }
  const o = ot(t.presetName || (t.role === "delegate" ? n.delegatePresetName : n.currentPresetName) || "默认"), r = n.presets?.[o] ? o : n.presets?.[n.currentPresetName] ? n.currentPresetName : Is, i = n.presets?.[r] || _t(), a = i.provider || n.provider || "openai-compatible", u = (i.modelConfigs || n.modelConfigs || Qt())[a] || Qt()[a] || {}, c = {
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    maxTokens: Ln(u.maxTokens)
  };
  return {
    currentPresetName: String(r || ""),
    provider: a,
    baseUrl: String(u.baseUrl || ""),
    model: String(u.model || ""),
    apiKey: String(u.apiKey || ""),
    tavilyApiKey: Ei(n.tavilyApiKey),
    tavilyBaseUrl: jn(n.tavilyBaseUrl),
    temperature: Na(u),
    sendTemperature: bi(u),
    maxTokens: Ln(u.maxTokens),
    timeoutMs: Number(t.timeoutMs) || 9e5,
    toolMode: u.toolMode || "native",
    reasoning: Ci(c, u.reasoning)
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
var nd = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return nd = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function so(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var Ri = (e) => {
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
}, be = class Pi extends G {
  constructor(t, n, o, r, i) {
    super(`${Pi.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("request-id"), this.error = n, this.type = i ?? null;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new $r({
      message: o,
      cause: Ri(n)
    });
    const i = n, a = i?.error?.type;
    return t === 400 ? new rd(t, i, o, r, a) : t === 401 ? new id(t, i, o, r, a) : t === 403 ? new sd(t, i, o, r, a) : t === 404 ? new ad(t, i, o, r, a) : t === 409 ? new ld(t, i, o, r, a) : t === 422 ? new ud(t, i, o, r, a) : t === 429 ? new cd(t, i, o, r, a) : t >= 500 ? new dd(t, i, o, r, a) : new Pi(t, i, o, r, a);
  }
}, qe = class extends be {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, $r = class extends be {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, od = class extends $r {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, rd = class extends be {
}, id = class extends be {
}, sd = class extends be {
}, ad = class extends be {
}, ld = class extends be {
}, ud = class extends be {
}, cd = class extends be {
}, dd = class extends be {
}, lg = /^[a-z][a-z0-9+.-]*:/i, ug = (e) => lg.test(e), Mi = (e) => (Mi = Array.isArray, Mi(e)), ka = Mi;
function xi(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function Da(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function cg(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var dg = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new G(`${e} must be an integer`);
  if (t < 0) throw new G(`${e} must be a positive integer`);
  return t;
}, fd = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, fg = (e) => new Promise((t) => setTimeout(t, e)), Kt = "0.91.1", hg = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function pg() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var mg = () => {
  const e = pg();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kt,
    "X-Stainless-OS": La(Deno.build.os),
    "X-Stainless-Arch": $a(Deno.build.arch),
    "X-Stainless-Runtime": "deno",
    "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
  };
  if (typeof EdgeRuntime < "u") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": `other:${EdgeRuntime}`,
    "X-Stainless-Runtime": "edge",
    "X-Stainless-Runtime-Version": globalThis.process.version
  };
  if (e === "node") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kt,
    "X-Stainless-OS": La(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": $a(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = gg();
  return t ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${t.browser}`,
    "X-Stainless-Runtime-Version": t.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": Kt,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function gg() {
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
var $a = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", La = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), Ua, _g = () => Ua ?? (Ua = mg());
function yg() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function hd(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function pd(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return hd({
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
function xs(e) {
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
async function vg(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var Ag = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function Tg(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new G(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
function Sg(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Fa;
function Ns(e) {
  let t;
  return (Fa ?? (t = new globalThis.TextEncoder(), Fa = t.encode.bind(t)))(e);
}
var Oa;
function Ga(e) {
  let t;
  return (Oa ?? (t = new globalThis.TextDecoder(), Oa = t.decode.bind(t)))(e);
}
var Se, Ee, mo = class {
  constructor() {
    Se.set(this, void 0), Ee.set(this, void 0), N(this, Se, new Uint8Array(), "f"), N(this, Ee, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Ns(e) : e;
    N(this, Se, Sg([A(this, Se, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = Eg(A(this, Se, "f"), A(this, Ee, "f"))) != null; ) {
      if (o.carriage && A(this, Ee, "f") == null) {
        N(this, Ee, o.index, "f");
        continue;
      }
      if (A(this, Ee, "f") != null && (o.index !== A(this, Ee, "f") + 1 || o.carriage)) {
        n.push(Ga(A(this, Se, "f").subarray(0, A(this, Ee, "f") - 1))), N(this, Se, A(this, Se, "f").subarray(A(this, Ee, "f")), "f"), N(this, Ee, null, "f");
        continue;
      }
      const r = A(this, Ee, "f") !== null ? o.preceding - 1 : o.preceding, i = Ga(A(this, Se, "f").subarray(0, r));
      n.push(i), N(this, Se, A(this, Se, "f").subarray(o.index), "f"), N(this, Ee, null, "f");
    }
    return n;
  }
  flush() {
    return A(this, Se, "f").length ? this.decode(`
`) : [];
  }
};
Se = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new WeakMap();
mo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
mo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function Eg(e, t) {
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
function Ig(e) {
  for (let o = 0; o < e.length - 1; o++) {
    if (e[o] === 10 && e[o + 1] === 10 || e[o] === 13 && e[o + 1] === 13) return o + 2;
    if (e[o] === 13 && e[o + 1] === 10 && o + 3 < e.length && e[o + 2] === 13 && e[o + 3] === 10) return o + 4;
  }
  return -1;
}
var hr = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, Ba = (e, t, n) => {
  if (e) {
    if (cg(hr, e)) return e;
    fe(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(hr))}`);
  }
};
function Un() {
}
function Co(e, t, n) {
  return !t || hr[e] > hr[n] ? Un : t[e].bind(t);
}
var wg = {
  error: Un,
  warn: Un,
  info: Un,
  debug: Un
}, qa = /* @__PURE__ */ new WeakMap();
function fe(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return wg;
  const o = qa.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: Co("error", t, n),
    warn: Co("warn", t, n),
    info: Co("info", t, n),
    debug: Co("debug", t, n)
  };
  return qa.set(t, [n, r]), r;
}
var Ct = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), _n, ao = class Fn {
  constructor(t, n, o) {
    this.iterator = t, _n.set(this, void 0), this.controller = n, N(this, _n, o, "f");
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? fe(o) : console;
    async function* a() {
      if (r) throw new G("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      r = !0;
      let u = !1;
      try {
        for await (const c of Cg(t, n)) {
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
            const d = fd(c.data) ?? c.data, h = d?.error?.type;
            throw new be(void 0, d, void 0, t.headers, h);
          }
        }
        u = !0;
      } catch (c) {
        if (so(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Fn(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    async function* i() {
      const u = new mo(), c = xs(t);
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
        if (so(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Fn(a, n, o);
  }
  [(_n = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Fn(() => r(t), this.controller, A(this, _n, "f")), new Fn(() => r(n), this.controller, A(this, _n, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return hd({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const a = Ns(JSON.stringify(r) + `
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
async function* Cg(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
  const n = new Rg(), o = new mo(), r = xs(e.body);
  for await (const i of bg(r)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* bg(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Ns(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = Ig(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Rg = class {
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
    let [t, n, o] = Pg(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function Pg(e, t) {
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
async function md(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return fe(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller) : ao.fromSSEResponse(n, t.controller);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : gd(await n.json(), n) : await n.text();
  })();
  return fe(e).debug(`[${o}] response parsed`, Ct({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function gd(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("request-id"),
    enumerable: !1
  });
}
var On, _d = class yd extends Promise {
  constructor(t, n, o = md) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, On.set(this, void 0), N(this, On, t, "f");
  }
  _thenUnwrap(t) {
    return new yd(A(this, On, "f"), this.responsePromise, async (n, o) => gd(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(A(this, On, "f"), t))), this.parsedPromise;
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
On = /* @__PURE__ */ new WeakMap();
var bo, vd = class {
  constructor(e, t, n, o) {
    bo.set(this, void 0), N(this, bo, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new G("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await A(this, bo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(bo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Mg = class extends _d {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await md(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, go = class extends vd {
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
          ...xi(this.options.query),
          before_id: t
        }
      } : null;
    }
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...xi(this.options.query),
        after_id: e
      }
    } : null;
  }
}, Ae = class extends vd {
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
        ...xi(this.options.query),
        page: e
      }
    } : null;
  }
}, Ad = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function sn(e, t, n) {
  return Ad(), new File(e, t ?? "unknown_file", n);
}
function jo(e, t) {
  const n = typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "";
  return t ? n.split(/[\\/]/).pop() || void 0 : n;
}
var Td = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", ks = async (e, t, n = !0) => ({
  ...e,
  body: await Ng(e.body, t, n)
}), Ha = /* @__PURE__ */ new WeakMap();
function xg(e) {
  const t = typeof e == "function" ? e : e.fetch, n = Ha.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return Ha.set(t, o), o;
}
var Ng = async (e, t, n = !0) => {
  if (!await xg(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const o = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([r, i]) => Ni(o, r, i, n))), o;
}, kg = (e) => e instanceof Blob && "name" in e, Ni = async (e, t, n, o) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) {
      let r = {};
      const i = n.headers.get("Content-Type");
      i && (r = { type: i }), e.append(t, sn([await n.blob()], jo(n, o), r));
    } else if (Td(n)) e.append(t, sn([await new Response(pd(n)).blob()], jo(n, o)));
    else if (kg(n)) e.append(t, sn([n], jo(n, o), { type: n.type }));
    else if (Array.isArray(n)) await Promise.all(n.map((r) => Ni(e, t + "[]", r, o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([r, i]) => Ni(e, `${t}[${r}]`, i, o)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Sd = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Dg = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Sd(e), $g = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function Lg(e, t, n) {
  if (Ad(), e = await e, t || (t = jo(e, !0)), Dg(e))
    return e instanceof File && t == null && n == null ? e : sn([await e.arrayBuffer()], t ?? e.name, {
      type: e.type,
      lastModified: e.lastModified,
      ...n
    });
  if ($g(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), sn(await ki(r), t, n);
  }
  const o = await ki(e);
  if (!n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return sn(o, t, n);
}
async function ki(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Sd(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Td(e)) for await (const n of e) t.push(...await ki(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Ug(e)}`);
  }
  return t;
}
function Ug(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Q = class {
  constructor(e) {
    this._client = e;
  }
}, Ed = /* @__PURE__ */ Symbol.for("brand.privateNullableHeaders");
function* Fg(e) {
  if (!e) return;
  if (Ed in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : ka(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = ka(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [r, null]), yield [r, u]);
  }
}
var C = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, a] of Fg(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [Ed]: !0,
    values: t,
    nulls: n
  };
};
function Id(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Va = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Og = (e = Id) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? Va) ?? Va)?.toString) && (g = m + "", i.push({
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
}, $ = /* @__PURE__ */ Og(Id), wd = class extends Q {
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
    return this._client.getAPIList("/v1/environments?beta=true", Ae, {
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
}, eo = /* @__PURE__ */ Symbol("anthropic.sdk.stainlessHelper");
function er(e) {
  return typeof e == "object" && e !== null && eo in e;
}
function Cd(e, t) {
  const n = /* @__PURE__ */ new Set();
  if (e)
    for (const o of e) er(o) && n.add(o[eo]);
  if (t) {
    for (const o of t)
      if (er(o) && n.add(o[eo]), Array.isArray(o.content))
        for (const r of o.content) er(r) && n.add(r[eo]);
  }
  return Array.from(n);
}
function bd(e, t) {
  const n = Cd(e, t);
  return n.length === 0 ? {} : { "x-stainless-helper": n.join(", ") };
}
function Gg(e) {
  return er(e) ? { "x-stainless-helper": e[eo] } : {};
}
var Rd = class extends Q {
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/files?beta=true", go, {
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
    return this._client.post("/v1/files?beta=true", ks({
      body: o,
      ...t,
      headers: C([
        { "anthropic-beta": [...n ?? [], "files-api-2025-04-14"].toString() },
        Gg(o.file),
        t?.headers
      ])
    }, this._client));
  }
}, Pd = class extends Q {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/models/${e}?beta=true`, {
      ...n,
      headers: C([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models?beta=true", go, {
      query: o,
      ...t,
      headers: C([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Md = class extends Q {
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
    return this._client.getAPIList("/v1/user_profiles?beta=true", Ae, {
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
}, xd = class extends Q {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList($`/v1/agents/${e}/versions?beta=true`, Ae, {
      query: r,
      ...n,
      headers: C([{ "anthropic-beta": [...o ?? [], "managed-agents-2026-04-01"].toString() }, n?.headers])
    });
  }
}, Ds = class extends Q {
  constructor() {
    super(...arguments), this.versions = new xd(this._client);
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
    return this._client.getAPIList("/v1/agents?beta=true", Ae, {
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
Ds.Versions = xd;
var Nd = class extends Q {
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
    return this._client.getAPIList($`/v1/memory_stores/${e}/memories?beta=true`, Ae, {
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
}, kd = class extends Q {
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
    return this._client.getAPIList($`/v1/memory_stores/${e}/memory_versions?beta=true`, Ae, {
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
}, Lr = class extends Q {
  constructor() {
    super(...arguments), this.memories = new Nd(this._client), this.memoryVersions = new kd(this._client);
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
    return this._client.getAPIList("/v1/memory_stores?beta=true", Ae, {
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
Lr.Memories = Nd;
Lr.MemoryVersions = kd;
var Dd = {
  "claude-opus-4-20250514": 8192,
  "claude-opus-4-0": 8192,
  "claude-4-opus-20250514": 8192,
  "anthropic.claude-opus-4-20250514-v1:0": 8192,
  "claude-opus-4@20250514": 8192,
  "claude-opus-4-1-20250805": 8192,
  "anthropic.claude-opus-4-1-20250805-v1:0": 8192,
  "claude-opus-4-1@20250805": 8192
};
function $d(e) {
  return e?.output_format ?? e?.output_config?.format;
}
function Ja(e, t, n) {
  const o = $d(t);
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
  } : Ld(e, t, n);
}
function Ld(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const a = Bg(t, i.text);
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
function Bg(e, t) {
  const n = $d(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new G(`Failed to parse structured output: ${o}`);
  }
}
var qg = (e) => {
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
}, Wt = (e) => {
  if (e.length === 0) return e;
  let t = e[e.length - 1];
  switch (t.type) {
    case "separator":
      return e = e.slice(0, e.length - 1), Wt(e);
    case "number":
      let n = t.value[t.value.length - 1];
      if (n === "." || n === "-")
        return e = e.slice(0, e.length - 1), Wt(e);
    case "string":
      let o = e[e.length - 2];
      if (o?.type === "delimiter")
        return e = e.slice(0, e.length - 1), Wt(e);
      if (o?.type === "brace" && o.value === "{")
        return e = e.slice(0, e.length - 1), Wt(e);
      break;
    case "delimiter":
      return e = e.slice(0, e.length - 1), Wt(e);
  }
  return e;
}, Hg = (e) => {
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
}, Vg = (e) => {
  let t = "";
  return e.map((n) => {
    n.type === "string" ? t += '"' + n.value + '"' : t += n.value;
  }), t;
}, Ud = (e) => JSON.parse(Vg(Hg(Wt(qg(e))))), Me, lt, Bt, yn, Ro, vn, An, Po, Tn, Xe, Sn, Mo, xo, Et, No, ko, En, ti, Ka, Do, ni, oi, ri, Wa, za = "__json_buf";
function Ya(e) {
  return e.type === "tool_use" || e.type === "server_tool_use" || e.type === "mcp_tool_use";
}
var Jg = class Di {
  constructor(t, n) {
    Me.add(this), this.messages = [], this.receivedMessages = [], lt.set(this, void 0), Bt.set(this, null), this.controller = new AbortController(), yn.set(this, void 0), Ro.set(this, () => {
    }), vn.set(this, () => {
    }), An.set(this, void 0), Po.set(this, () => {
    }), Tn.set(this, () => {
    }), Xe.set(this, {}), Sn.set(this, !1), Mo.set(this, !1), xo.set(this, !1), Et.set(this, !1), No.set(this, void 0), ko.set(this, void 0), En.set(this, void 0), Do.set(this, (o) => {
      if (N(this, Mo, !0, "f"), so(o) && (o = new qe()), o instanceof qe)
        return N(this, xo, !0, "f"), this._emit("abort", o);
      if (o instanceof G) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new G(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new G(String(o)));
    }), N(this, yn, new Promise((o, r) => {
      N(this, Ro, o, "f"), N(this, vn, r, "f");
    }), "f"), N(this, An, new Promise((o, r) => {
      N(this, Po, o, "f"), N(this, Tn, r, "f");
    }), "f"), A(this, yn, "f").catch(() => {
    }), A(this, An, "f").catch(() => {
    }), N(this, Bt, t, "f"), N(this, En, n?.logger ?? console, "f");
  }
  get response() {
    return A(this, No, "f");
  }
  get request_id() {
    return A(this, ko, "f");
  }
  async withResponse() {
    N(this, Et, !0, "f");
    const t = await A(this, yn, "f");
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
    for (const a of n.messages) i._addMessageParam(a);
    return N(i, Bt, {
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
    }, A(this, Do, "f"));
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
      A(this, Me, "m", ni).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) A(this, Me, "m", oi).call(this, c);
      if (u.controller.signal?.aborted) throw new qe();
      A(this, Me, "m", ri).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (N(this, No, t, "f"), N(this, ko, t?.headers.get("request-id"), "f"), A(this, Ro, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return A(this, Sn, "f");
  }
  get errored() {
    return A(this, Mo, "f");
  }
  get aborted() {
    return A(this, xo, "f");
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
    N(this, Et, !0, "f"), await A(this, An, "f");
  }
  get currentMessage() {
    return A(this, lt, "f");
  }
  async finalMessage() {
    return await this.done(), A(this, Me, "m", ti).call(this);
  }
  async finalText() {
    return await this.done(), A(this, Me, "m", Ka).call(this);
  }
  _emit(t, ...n) {
    if (A(this, Sn, "f")) return;
    t === "end" && (N(this, Sn, !0, "f"), A(this, Po, "f").call(this));
    const o = A(this, Xe, "f")[t];
    if (o && (A(this, Xe, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !A(this, Et, "f") && !o?.length && Promise.reject(r), A(this, vn, "f").call(this, r), A(this, Tn, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !A(this, Et, "f") && !o?.length && Promise.reject(r), A(this, vn, "f").call(this, r), A(this, Tn, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", A(this, Me, "m", ti).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      A(this, Me, "m", ni).call(this), this._connected(null);
      const i = ao.fromReadableStream(t, this.controller);
      for await (const a of i) A(this, Me, "m", oi).call(this, a);
      if (i.controller.signal?.aborted) throw new qe();
      A(this, Me, "m", ri).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(lt = /* @__PURE__ */ new WeakMap(), Bt = /* @__PURE__ */ new WeakMap(), yn = /* @__PURE__ */ new WeakMap(), Ro = /* @__PURE__ */ new WeakMap(), vn = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), Po = /* @__PURE__ */ new WeakMap(), Tn = /* @__PURE__ */ new WeakMap(), Xe = /* @__PURE__ */ new WeakMap(), Sn = /* @__PURE__ */ new WeakMap(), Mo = /* @__PURE__ */ new WeakMap(), xo = /* @__PURE__ */ new WeakMap(), Et = /* @__PURE__ */ new WeakMap(), No = /* @__PURE__ */ new WeakMap(), ko = /* @__PURE__ */ new WeakMap(), En = /* @__PURE__ */ new WeakMap(), Do = /* @__PURE__ */ new WeakMap(), Me = /* @__PURE__ */ new WeakSet(), ti = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, Ka = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new G("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, ni = function() {
    this.ended || N(this, lt, void 0, "f");
  }, oi = function(n) {
    if (this.ended) return;
    const o = A(this, Me, "m", Wa).call(this, n);
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
            Ya(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
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
        this._addMessageParam(o), this._addMessage(Ja(o, A(this, Bt, "f"), { logger: A(this, En, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        N(this, lt, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, ri = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = A(this, lt, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return N(this, lt, void 0, "f"), Ja(n, A(this, Bt, "f"), { logger: A(this, En, "f") });
  }, Wa = function(n) {
    let o = A(this, lt, "f");
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
            if (r && Ya(r)) {
              let i = r[za] || "";
              i += n.delta.partial_json;
              const a = { ...r };
              if (Object.defineProperty(a, za, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i) try {
                a.input = Ud(i);
              } catch (u) {
                const c = new G(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${u}. JSON: ${i}`);
                A(this, Do, "f").call(this, c);
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
    return new ao(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Fd = class extends Error {
  constructor(e) {
    const t = typeof e == "string" ? e : e.map((n) => n.type === "text" ? n.text : `[${n.type}]`).join(" ");
    super(t), this.name = "ToolError", this.content = e;
  }
};
var Kg = `You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:
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
Wrap your summary in <summary></summary> tags.`, In, qt, It, te, ge, Te, nt, ut, wn, Xa, $i;
function Qa() {
  let e, t;
  return {
    promise: new Promise((n, o) => {
      e = n, t = o;
    }),
    resolve: e,
    reject: t
  };
}
var Od = class {
  constructor(e, t, n) {
    In.add(this), this.client = e, qt.set(this, !1), It.set(this, !1), te.set(this, void 0), ge.set(this, void 0), Te.set(this, void 0), nt.set(this, void 0), ut.set(this, void 0), wn.set(this, 0), N(this, te, { params: {
      ...t,
      messages: structuredClone(t.messages)
    } }, "f");
    const o = ["BetaToolRunner", ...Cd(t.tools, t.messages)].join(", ");
    N(this, ge, {
      ...n,
      headers: C([{ "x-stainless-helper": o }, n?.headers])
    }, "f"), N(this, ut, Qa(), "f"), t.compactionControl?.enabled && console.warn('Anthropic: The `compactionControl` parameter is deprecated and will be removed in a future version. Use server-side compaction instead by passing `edits: [{ type: "compact_20260112" }]` in the params passed to `toolRunner()`. See https://platform.claude.com/docs/en/build-with-claude/compaction');
  }
  async *[(qt = /* @__PURE__ */ new WeakMap(), It = /* @__PURE__ */ new WeakMap(), te = /* @__PURE__ */ new WeakMap(), ge = /* @__PURE__ */ new WeakMap(), Te = /* @__PURE__ */ new WeakMap(), nt = /* @__PURE__ */ new WeakMap(), ut = /* @__PURE__ */ new WeakMap(), wn = /* @__PURE__ */ new WeakMap(), In = /* @__PURE__ */ new WeakSet(), Xa = async function() {
    const t = A(this, te, "f").params.compactionControl;
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
    const r = t.model ?? A(this, te, "f").params.model, i = t.summaryPrompt ?? Kg, a = A(this, te, "f").params.messages;
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
      max_tokens: A(this, te, "f").params.max_tokens
    }, {
      signal: A(this, ge, "f").signal,
      headers: C([A(this, ge, "f").headers, { "x-stainless-helper": "compaction" }])
    });
    if (u.content[0]?.type !== "text") throw new G("Expected text response for compaction");
    return A(this, te, "f").params.messages = [{
      role: "user",
      content: u.content
    }], !0;
  }, Symbol.asyncIterator)]() {
    var e;
    if (A(this, qt, "f")) throw new G("Cannot iterate over a consumed stream");
    N(this, qt, !0, "f"), N(this, It, !0, "f"), N(this, nt, void 0, "f");
    try {
      for (; ; ) {
        let t;
        try {
          if (A(this, te, "f").params.max_iterations && A(this, wn, "f") >= A(this, te, "f").params.max_iterations) break;
          N(this, It, !1, "f"), N(this, nt, void 0, "f"), N(this, wn, (e = A(this, wn, "f"), e++, e), "f"), N(this, Te, void 0, "f");
          const { max_iterations: n, compactionControl: o, ...r } = A(this, te, "f").params;
          if (r.stream ? (t = this.client.beta.messages.stream({ ...r }, A(this, ge, "f")), N(this, Te, t.finalMessage(), "f"), A(this, Te, "f").catch(() => {
          }), yield t) : (N(this, Te, this.client.beta.messages.create({
            ...r,
            stream: !1
          }, A(this, ge, "f")), "f"), yield A(this, Te, "f")), !await A(this, In, "m", Xa).call(this)) {
            if (!A(this, It, "f")) {
              const { role: a, content: u } = await A(this, Te, "f");
              A(this, te, "f").params.messages.push({
                role: a,
                content: u
              });
            }
            const i = await A(this, In, "m", $i).call(this, A(this, te, "f").params.messages.at(-1));
            if (i) A(this, te, "f").params.messages.push(i);
            else if (!A(this, It, "f")) break;
          }
        } finally {
          t && t.abort();
        }
      }
      if (!A(this, Te, "f")) throw new G("ToolRunner concluded without a message from the server");
      A(this, ut, "f").resolve(await A(this, Te, "f"));
    } catch (t) {
      throw N(this, qt, !1, "f"), A(this, ut, "f").promise.catch(() => {
      }), A(this, ut, "f").reject(t), N(this, ut, Qa(), "f"), t;
    }
  }
  setMessagesParams(e) {
    typeof e == "function" ? A(this, te, "f").params = e(A(this, te, "f").params) : A(this, te, "f").params = e, N(this, It, !0, "f"), N(this, nt, void 0, "f");
  }
  setRequestOptions(e) {
    typeof e == "function" ? N(this, ge, e(A(this, ge, "f")), "f") : N(this, ge, {
      ...A(this, ge, "f"),
      ...e
    }, "f");
  }
  async generateToolResponse(e = A(this, ge, "f").signal) {
    const t = await A(this, Te, "f") ?? this.params.messages.at(-1);
    return t ? A(this, In, "m", $i).call(this, t, e) : null;
  }
  done() {
    return A(this, ut, "f").promise;
  }
  async runUntilDone() {
    if (!A(this, qt, "f")) for await (const e of this) ;
    return this.done();
  }
  get params() {
    return A(this, te, "f").params;
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
$i = async function(t, n = A(this, ge, "f").signal) {
  return A(this, nt, "f") !== void 0 ? A(this, nt, "f") : (N(this, nt, Wg(A(this, te, "f").params, t, {
    ...A(this, ge, "f"),
    signal: n
  }), "f"), A(this, nt, "f"));
};
async function Wg(e, t = e.messages.at(-1), n) {
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
          content: a instanceof Fd ? a.content : `Error: ${a instanceof Error ? a.message : String(a)}`,
          is_error: !0
        };
      }
    }))
  };
}
var Gd = class Bd {
  constructor(t, n) {
    this.iterator = t, this.controller = n;
  }
  async *decoder() {
    const t = new mo();
    for await (const n of this.iterator) for (const o of t.decode(n)) yield JSON.parse(o);
    for (const n of t.flush()) yield JSON.parse(n);
  }
  [Symbol.asyncIterator]() {
    return this.decoder();
  }
  static fromResponse(t, n) {
    if (!t.body)
      throw n.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new G("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new G("Attempted to iterate over a response with no body");
    return new Bd(xs(t.body), n);
  }
}, qd = class extends Q {
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
    return this._client.getAPIList("/v1/messages/batches?beta=true", go, {
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
    })._thenUnwrap((i, a) => Gd.fromResponse(a.response, a.controller));
  }
}, Za = {
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
}, zg = ["claude-mythos-preview", "claude-opus-4-6"], _o = class extends Q {
  constructor() {
    super(...arguments), this.batches = new qd(this._client);
  }
  create(e, t) {
    const n = ja(e), { betas: o, ...r } = n;
    r.model in Za && console.warn(`The model '${r.model}' is deprecated and will reach end-of-life on ${Za[r.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), zg.includes(r.model) && r.thinking && r.thinking.type === "enabled" && console.warn(`Using Claude with ${r.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let i = this._client._options.timeout;
    if (!r.stream && i == null) {
      const u = Dd[r.model] ?? void 0;
      i = this._client.calculateNonstreamingTimeout(r.max_tokens, u);
    }
    const a = bd(r.tools, r.messages);
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
    }, this.create(e, t).then((n) => Ld(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Jg.createMessage(this, e, t);
  }
  countTokens(e, t) {
    const { betas: n, ...o } = ja(e);
    return this._client.post("/v1/messages/count_tokens?beta=true", {
      body: o,
      ...t,
      headers: C([{ "anthropic-beta": [...n ?? [], "token-counting-2024-11-01"].toString() }, t?.headers])
    });
  }
  toolRunner(e, t) {
    return new Od(this._client, e, t);
  }
};
function ja(e) {
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
_o.Batches = qd;
_o.BetaToolRunner = Od;
_o.ToolError = Fd;
var Hd = class extends Q {
  list(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.getAPIList($`/v1/sessions/${e}/events?beta=true`, Ae, {
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
}, Vd = class extends Q {
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
    return this._client.getAPIList($`/v1/sessions/${e}/resources?beta=true`, Ae, {
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
}, Ur = class extends Q {
  constructor() {
    super(...arguments), this.events = new Hd(this._client), this.resources = new Vd(this._client);
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
    return this._client.getAPIList("/v1/sessions?beta=true", Ae, {
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
Ur.Events = Hd;
Ur.Resources = Vd;
var Jd = class extends Q {
  create(e, t = {}, n) {
    const { betas: o, ...r } = t ?? {};
    return this._client.post($`/v1/skills/${e}/versions?beta=true`, ks({
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
    return this._client.getAPIList($`/v1/skills/${e}/versions?beta=true`, Ae, {
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
}, $s = class extends Q {
  constructor() {
    super(...arguments), this.versions = new Jd(this._client);
  }
  create(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.post("/v1/skills?beta=true", ks({
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
    return this._client.getAPIList("/v1/skills?beta=true", Ae, {
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
$s.Versions = Jd;
var Kd = class extends Q {
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
    return this._client.getAPIList($`/v1/vaults/${e}/credentials?beta=true`, Ae, {
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
}, Ls = class extends Q {
  constructor() {
    super(...arguments), this.credentials = new Kd(this._client);
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
    return this._client.getAPIList("/v1/vaults?beta=true", Ae, {
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
Ls.Credentials = Kd;
var De = class extends Q {
  constructor() {
    super(...arguments), this.models = new Pd(this._client), this.messages = new _o(this._client), this.agents = new Ds(this._client), this.environments = new wd(this._client), this.sessions = new Ur(this._client), this.vaults = new Ls(this._client), this.memoryStores = new Lr(this._client), this.files = new Rd(this._client), this.skills = new $s(this._client), this.userProfiles = new Md(this._client);
  }
};
De.Models = Pd;
De.Messages = _o;
De.Agents = Ds;
De.Environments = wd;
De.Sessions = Ur;
De.Vaults = Ls;
De.MemoryStores = Lr;
De.Files = Rd;
De.Skills = $s;
De.UserProfiles = Md;
var Wd = class extends Q {
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
function zd(e) {
  return e?.output_config?.format;
}
function el(e, t, n) {
  const o = zd(t);
  return !t || !("parse" in (o ?? {})) ? {
    ...e,
    content: e.content.map((r) => r.type === "text" ? Object.defineProperty({ ...r }, "parsed_output", {
      value: null,
      enumerable: !1
    }) : r),
    parsed_output: null
  } : Yd(e, t, n);
}
function Yd(e, t, n) {
  let o = null;
  const r = e.content.map((i) => {
    if (i.type === "text") {
      const a = Yg(t, i.text);
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
function Yg(e, t) {
  const n = zd(e);
  if (n?.type !== "json_schema") return null;
  try {
    return "parse" in n ? n.parse(t) : JSON.parse(t);
  } catch (o) {
    throw new G(`Failed to parse structured output: ${o}`);
  }
}
var xe, ct, Ht, Cn, $o, bn, Rn, Lo, Pn, Qe, Mn, Uo, Fo, wt, Oo, Go, xn, ii, tl, si, ai, li, ui, nl, ol = "__json_buf";
function rl(e) {
  return e.type === "tool_use" || e.type === "server_tool_use";
}
var Xg = class Li {
  constructor(t, n) {
    xe.add(this), this.messages = [], this.receivedMessages = [], ct.set(this, void 0), Ht.set(this, null), this.controller = new AbortController(), Cn.set(this, void 0), $o.set(this, () => {
    }), bn.set(this, () => {
    }), Rn.set(this, void 0), Lo.set(this, () => {
    }), Pn.set(this, () => {
    }), Qe.set(this, {}), Mn.set(this, !1), Uo.set(this, !1), Fo.set(this, !1), wt.set(this, !1), Oo.set(this, void 0), Go.set(this, void 0), xn.set(this, void 0), si.set(this, (o) => {
      if (N(this, Uo, !0, "f"), so(o) && (o = new qe()), o instanceof qe)
        return N(this, Fo, !0, "f"), this._emit("abort", o);
      if (o instanceof G) return this._emit("error", o);
      if (o instanceof Error) {
        const r = new G(o.message);
        return r.cause = o, this._emit("error", r);
      }
      return this._emit("error", new G(String(o)));
    }), N(this, Cn, new Promise((o, r) => {
      N(this, $o, o, "f"), N(this, bn, r, "f");
    }), "f"), N(this, Rn, new Promise((o, r) => {
      N(this, Lo, o, "f"), N(this, Pn, r, "f");
    }), "f"), A(this, Cn, "f").catch(() => {
    }), A(this, Rn, "f").catch(() => {
    }), N(this, Ht, t, "f"), N(this, xn, n?.logger ?? console, "f");
  }
  get response() {
    return A(this, Oo, "f");
  }
  get request_id() {
    return A(this, Go, "f");
  }
  async withResponse() {
    N(this, wt, !0, "f");
    const t = await A(this, Cn, "f");
    if (!t) throw new Error("Could not resolve a `Response` object");
    return {
      data: this,
      response: t,
      request_id: t.headers.get("request-id")
    };
  }
  static fromReadableStream(t) {
    const n = new Li(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createMessage(t, n, o, { logger: r } = {}) {
    const i = new Li(n, { logger: r });
    for (const a of n.messages) i._addMessageParam(a);
    return N(i, Ht, {
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
    }, A(this, si, "f"));
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
      A(this, xe, "m", ai).call(this);
      const { response: a, data: u } = await t.create({
        ...n,
        stream: !0
      }, {
        ...o,
        signal: this.controller.signal
      }).withResponse();
      this._connected(a);
      for await (const c of u) A(this, xe, "m", li).call(this, c);
      if (u.controller.signal?.aborted) throw new qe();
      A(this, xe, "m", ui).call(this);
    } finally {
      r && i && r.removeEventListener("abort", i);
    }
  }
  _connected(t) {
    this.ended || (N(this, Oo, t, "f"), N(this, Go, t?.headers.get("request-id"), "f"), A(this, $o, "f").call(this, t), this._emit("connect"));
  }
  get ended() {
    return A(this, Mn, "f");
  }
  get errored() {
    return A(this, Uo, "f");
  }
  get aborted() {
    return A(this, Fo, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(t, n) {
    return (A(this, Qe, "f")[t] || (A(this, Qe, "f")[t] = [])).push({ listener: n }), this;
  }
  off(t, n) {
    const o = A(this, Qe, "f")[t];
    if (!o) return this;
    const r = o.findIndex((i) => i.listener === n);
    return r >= 0 && o.splice(r, 1), this;
  }
  once(t, n) {
    return (A(this, Qe, "f")[t] || (A(this, Qe, "f")[t] = [])).push({
      listener: n,
      once: !0
    }), this;
  }
  emitted(t) {
    return new Promise((n, o) => {
      N(this, wt, !0, "f"), t !== "error" && this.once("error", o), this.once(t, n);
    });
  }
  async done() {
    N(this, wt, !0, "f"), await A(this, Rn, "f");
  }
  get currentMessage() {
    return A(this, ct, "f");
  }
  async finalMessage() {
    return await this.done(), A(this, xe, "m", ii).call(this);
  }
  async finalText() {
    return await this.done(), A(this, xe, "m", tl).call(this);
  }
  _emit(t, ...n) {
    if (A(this, Mn, "f")) return;
    t === "end" && (N(this, Mn, !0, "f"), A(this, Lo, "f").call(this));
    const o = A(this, Qe, "f")[t];
    if (o && (A(this, Qe, "f")[t] = o.filter((r) => !r.once), o.forEach(({ listener: r }) => r(...n))), t === "abort") {
      const r = n[0];
      !A(this, wt, "f") && !o?.length && Promise.reject(r), A(this, bn, "f").call(this, r), A(this, Pn, "f").call(this, r), this._emit("end");
      return;
    }
    if (t === "error") {
      const r = n[0];
      !A(this, wt, "f") && !o?.length && Promise.reject(r), A(this, bn, "f").call(this, r), A(this, Pn, "f").call(this, r), this._emit("end");
    }
  }
  _emitFinal() {
    this.receivedMessages.at(-1) && this._emit("finalMessage", A(this, xe, "m", ii).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    let r;
    o && (o.aborted && this.controller.abort(), r = this.controller.abort.bind(this.controller), o.addEventListener("abort", r));
    try {
      A(this, xe, "m", ai).call(this), this._connected(null);
      const i = ao.fromReadableStream(t, this.controller);
      for await (const a of i) A(this, xe, "m", li).call(this, a);
      if (i.controller.signal?.aborted) throw new qe();
      A(this, xe, "m", ui).call(this);
    } finally {
      o && r && o.removeEventListener("abort", r);
    }
  }
  [(ct = /* @__PURE__ */ new WeakMap(), Ht = /* @__PURE__ */ new WeakMap(), Cn = /* @__PURE__ */ new WeakMap(), $o = /* @__PURE__ */ new WeakMap(), bn = /* @__PURE__ */ new WeakMap(), Rn = /* @__PURE__ */ new WeakMap(), Lo = /* @__PURE__ */ new WeakMap(), Pn = /* @__PURE__ */ new WeakMap(), Qe = /* @__PURE__ */ new WeakMap(), Mn = /* @__PURE__ */ new WeakMap(), Uo = /* @__PURE__ */ new WeakMap(), Fo = /* @__PURE__ */ new WeakMap(), wt = /* @__PURE__ */ new WeakMap(), Oo = /* @__PURE__ */ new WeakMap(), Go = /* @__PURE__ */ new WeakMap(), xn = /* @__PURE__ */ new WeakMap(), si = /* @__PURE__ */ new WeakMap(), xe = /* @__PURE__ */ new WeakSet(), ii = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    return this.receivedMessages.at(-1);
  }, tl = function() {
    if (this.receivedMessages.length === 0) throw new G("stream ended without producing a Message with role=assistant");
    const n = this.receivedMessages.at(-1).content.filter((o) => o.type === "text").map((o) => o.text);
    if (n.length === 0) throw new G("stream ended without producing a content block with type=text");
    return n.join(" ");
  }, ai = function() {
    this.ended || N(this, ct, void 0, "f");
  }, li = function(n) {
    if (this.ended) return;
    const o = A(this, xe, "m", nl).call(this, n);
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
            rl(r) && r.input && this._emit("inputJson", n.delta.partial_json, r.input);
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
        this._addMessageParam(o), this._addMessage(el(o, A(this, Ht, "f"), { logger: A(this, xn, "f") }), !0);
        break;
      case "content_block_stop":
        this._emit("contentBlock", o.content.at(-1));
        break;
      case "message_start":
        N(this, ct, o, "f");
        break;
      case "content_block_start":
      case "message_delta":
        break;
    }
  }, ui = function() {
    if (this.ended) throw new G("stream has ended, this shouldn't happen");
    const n = A(this, ct, "f");
    if (!n) throw new G("request ended without sending any chunks");
    return N(this, ct, void 0, "f"), el(n, A(this, Ht, "f"), { logger: A(this, xn, "f") });
  }, nl = function(n) {
    let o = A(this, ct, "f");
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
            if (r && rl(r)) {
              let i = r[ol] || "";
              i += n.delta.partial_json;
              const a = { ...r };
              Object.defineProperty(a, ol, {
                value: i,
                enumerable: !1,
                writable: !0
              }), i && (a.input = Ud(i)), o.content[n.index] = a;
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
    return new ao(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}, Xd = class extends Q {
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
    return this._client.getAPIList("/v1/messages/batches", go, {
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
    })._thenUnwrap((o, r) => Gd.fromResponse(r.response, r.controller));
  }
}, Us = class extends Q {
  constructor() {
    super(...arguments), this.batches = new Xd(this._client);
  }
  create(e, t) {
    e.model in il && console.warn(`The model '${e.model}' is deprecated and will reach end-of-life on ${il[e.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`), Qg.includes(e.model) && e.thinking && e.thinking.type === "enabled" && console.warn(`Using Claude with ${e.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
    let n = this._client._options.timeout;
    if (!e.stream && n == null) {
      const r = Dd[e.model] ?? void 0;
      n = this._client.calculateNonstreamingTimeout(e.max_tokens, r);
    }
    const o = bd(e.tools, e.messages);
    return this._client.post("/v1/messages", {
      body: e,
      timeout: n ?? 6e5,
      ...t,
      headers: C([o, t?.headers]),
      stream: e.stream ?? !1
    });
  }
  parse(e, t) {
    return this.create(e, t).then((n) => Yd(n, e, { logger: this._client.logger ?? console }));
  }
  stream(e, t) {
    return Xg.createMessage(this, e, t, { logger: this._client.logger ?? console });
  }
  countTokens(e, t) {
    return this._client.post("/v1/messages/count_tokens", {
      body: e,
      ...t
    });
  }
}, il = {
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
}, Qg = ["claude-mythos-preview", "claude-opus-4-6"];
Us.Batches = Xd;
var Qd = class extends Q {
  retrieve(e, t = {}, n) {
    const { betas: o } = t ?? {};
    return this._client.get($`/v1/models/${e}`, {
      ...n,
      headers: C([{ ...o?.toString() != null ? { "anthropic-beta": o?.toString() } : void 0 }, n?.headers])
    });
  }
  list(e = {}, t) {
    const { betas: n, ...o } = e ?? {};
    return this._client.getAPIList("/v1/models", go, {
      query: o,
      ...t,
      headers: C([{ ...n?.toString() != null ? { "anthropic-beta": n?.toString() } : void 0 }, t?.headers])
    });
  }
}, Bo = (e) => {
  if (typeof globalThis.process < "u") return globalThis.process.env?.[e]?.trim() || void 0;
  if (typeof globalThis.Deno < "u") return globalThis.Deno.env?.get?.(e)?.trim() || void 0;
}, Ui, Fs, tr, Zd, Zg = "\\n\\nHuman:", jg = "\\n\\nAssistant:", j = class {
  constructor({ baseURL: e = Bo("ANTHROPIC_BASE_URL"), apiKey: t = Bo("ANTHROPIC_API_KEY") ?? null, authToken: n = Bo("ANTHROPIC_AUTH_TOKEN") ?? null, ...o } = {}) {
    Ui.add(this), tr.set(this, void 0);
    const r = {
      apiKey: t,
      authToken: n,
      ...o,
      baseURL: e || "https://api.anthropic.com"
    };
    if (!r.dangerouslyAllowBrowser && hg()) throw new G(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
`);
    this.baseURL = r.baseURL, this.timeout = r.timeout ?? Fs.DEFAULT_TIMEOUT, this.logger = r.logger ?? console;
    const i = "warn";
    this.logLevel = i, this.logLevel = Ba(r.logLevel, "ClientOptions.logLevel", this) ?? Ba(Bo("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", this) ?? i, this.fetchOptions = r.fetchOptions, this.maxRetries = r.maxRetries ?? 2, this.fetch = r.fetch ?? yg(), N(this, tr, Ag, "f"), this._options = r, this.apiKey = typeof t == "string" ? t : null, this.authToken = n;
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
    return Tg(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${Kt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${nd()}`;
  }
  makeStatusError(e, t, n, o) {
    return be.generate(e, t, n, o);
  }
  buildURL(e, t, n) {
    const o = !A(this, Ui, "m", Zd).call(this) && n || this.baseURL, r = ug(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(r.searchParams);
    return (!Da(i) || !Da(a)) && (t = {
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
    return new _d(this, this.makeRequest(e, t, void 0));
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
    if (fe(this).debug(`[${c}] sending request`, Ct({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new qe();
    const f = new AbortController(), p = await this.fetchWithTimeout(a, i, u, f).catch(Ri), m = Date.now();
    if (p instanceof globalThis.Error) {
      const _ = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new qe();
      const y = so(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (t)
        return fe(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - ${_}`), fe(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (${_})`, Ct({
          retryOfRequestLogID: n,
          url: a,
          durationMs: m - h,
          message: p.message
        })), this.retryRequest(o, t, n ?? c);
      throw fe(this).info(`[${c}] connection ${y ? "timed out" : "failed"} - error; no more retries left`), fe(this).debug(`[${c}] connection ${y ? "timed out" : "failed"} (error; no more retries left)`, Ct({
        retryOfRequestLogID: n,
        url: a,
        durationMs: m - h,
        message: p.message
      })), y ? new od() : new $r({ cause: p });
    }
    const g = `[${c}${d}${[...p.headers.entries()].filter(([_]) => _ === "request-id").map(([_, y]) => ", " + _ + ": " + JSON.stringify(y)).join("")}] ${i.method} ${a} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${m - h}ms`;
    if (!p.ok) {
      const _ = await this.shouldRetry(p);
      if (t && _) {
        const P = `retrying, ${t} attempts remaining`;
        return await vg(p.body), fe(this).info(`${g} - ${P}`), fe(this).debug(`[${c}] response error (${P})`, Ct({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: m - h
        })), this.retryRequest(o, t, n ?? c, p.headers);
      }
      const y = _ ? "error; no more retries left" : "error; not retryable";
      fe(this).info(`${g} - ${y}`);
      const S = await p.text().catch((P) => Ri(P).message), I = fd(S), b = I ? void 0 : S;
      throw fe(this).debug(`[${c}] response error (${y})`, Ct({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: b,
        durationMs: Date.now() - h
      })), this.makeStatusError(p.status, I, b, p.headers);
    }
    return fe(this).info(g), fe(this).debug(`[${c}] response start`, Ct({
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
    return new Mg(this, n, e);
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
    return await fg(r), this.makeRequest(e, t - 1, n);
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
    "timeout" in n && dg("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
        ..._g(),
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
      body: pd(e)
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e)
    } : A(this, tr, "f").call(this, {
      body: e,
      headers: n
    });
  }
};
Fs = j, tr = /* @__PURE__ */ new WeakMap(), Ui = /* @__PURE__ */ new WeakSet(), Zd = function() {
  return this.baseURL !== "https://api.anthropic.com";
};
j.Anthropic = Fs;
j.HUMAN_PROMPT = Zg;
j.AI_PROMPT = jg;
j.DEFAULT_TIMEOUT = 6e5;
j.AnthropicError = G;
j.APIError = be;
j.APIConnectionError = $r;
j.APIConnectionTimeoutError = od;
j.APIUserAbortError = qe;
j.NotFoundError = ad;
j.ConflictError = ld;
j.RateLimitError = cd;
j.BadRequestError = rd;
j.AuthenticationError = id;
j.InternalServerError = dd;
j.PermissionDeniedError = sd;
j.UnprocessableEntityError = ud;
j.toFile = Lg;
var yo = class extends j {
  constructor() {
    super(...arguments), this.completions = new Wd(this), this.messages = new Us(this), this.models = new Qd(this), this.beta = new De(this);
  }
};
yo.Completions = Wd;
yo.Messages = Us;
yo.Models = Qd;
yo.Beta = De;
function Lt(e) {
  if (Array.isArray(e)) return e.map((n) => Lt(n));
  if (!e || typeof e != "object") return e;
  const t = {};
  return Object.entries(e).forEach(([n, o]) => {
    t[n] = /^(?:authorization|proxy[-_]?authorization|(?:x[-_])?csrf(?:[-_]?token)?|token|access[-_]?token|refresh[-_]?token|id[-_]?token|api[-_]?key|x[-_](?:goog[-_])?api[-_]?key|proxy[-_]?password|password|client[-_]?secret)$/i.test(n) ? "[redacted]" : Lt(o);
  }), t;
}
function yt(e = {}, t = {}) {
  const n = String(e.reasoning?.mode || "inherit"), o = e.reasoning?.output === "show" ? "show" : "hide", r = String(t.effectiveMode || n);
  return {
    reasoningRequestedMode: n,
    reasoningRequestedOutput: o,
    reasoningProfileId: String(t.profileId || e.reasoning?.profileId || "unsupported"),
    reasoningEffectiveMode: r,
    reasoningEffort: r === "on" ? String(t.effort ?? e.reasoning?.effort ?? "") : "",
    reasoningBudgetTokens: r === "on" && Number.isFinite(Number(t.budgetTokens ?? e.reasoning?.budgetTokens)) ? Number(t.budgetTokens ?? e.reasoning?.budgetTokens) : null,
    reasoningControlFields: Lt(t.controlFields || {}),
    reasoningOutputVisible: r !== "off" && o === "show"
  };
}
function lo(e = {}) {
  return {
    provider: e.provider || "",
    model: e.model || "",
    transport: e.transport || "sdk",
    request: Lt({
      url: e.url || "",
      method: e.method || "POST",
      headers: e.headers || {},
      body: e.body || {},
      sdk: e.sdk || void 0
    }),
    ...e.effectiveConfig ? { effectiveConfig: e.effectiveConfig } : {}
  };
}
function e_(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function t_(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? {
    mediaType: t[1],
    data: t[2]
  } : {
    mediaType: "",
    data: ""
  };
}
function jd(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function n_(e) {
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
      const o = t_(n.image_url.url);
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
function o_(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function r_(e) {
  const t = e?.providerPayload?.anthropicContent;
  return Array.isArray(t) && t.length && jd(t) || null;
}
function i_(e) {
  return Array.isArray(e?.content) && e.content.length ? { anthropicContent: jd(e.content) || [] } : void 0;
}
function sl(e = {}) {
  return {
    type: "tool_result",
    tool_use_id: e.tool_call_id,
    content: e.content
  };
}
function al(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    return n ? {
      type: "tool_use",
      id: t.id,
      name: n,
      input: e_(t.function.arguments)
    } : null;
  }).filter(Boolean);
}
function s_(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const o = e[n];
    if (o.role !== "system") {
      if (o.role === "assistant") {
        const r = r_(o), i = al(o.tool_calls);
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
        const r = [sl(o)];
        for (; e[n + 1]?.role === "tool"; )
          n += 1, r.push(sl(e[n]));
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
          }] : [], ...al(o.tool_calls)]
        });
        continue;
      }
      t.push({
        role: o.role,
        content: n_(o.content)
      });
    }
  }
  return t;
}
function qo(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function ll(e = "") {
  return String(e || "https://api.anthropic.com").trim().replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function a_(e = "auto", t = []) {
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
var l_ = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function ul(e = {}, t = {}) {
  const n = Array.isArray(t.tools) ? t.tools : [], o = n.length ? a_(t.toolChoice, n) : void 0, r = Es(t.reasoning), i = Ms({
    provider: "anthropic",
    baseUrl: e.baseUrl,
    model: e.model
  }), a = r.mode === "on" && i.profileId === "anthropic-manual" && (o?.type === "any" || o?.type === "tool"), u = pe("anthropic", e, {
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
var u_ = class {
  constructor(e) {
    this.config = e, this.client = new yo({
      apiKey: e.apiKey,
      baseURL: ll(e.baseUrl),
      timeout: Number(e.timeoutMs) || 900 * 1e3,
      maxRetries: 0,
      dangerouslyAllowBrowser: !0
    });
  }
  buildRequestBody(e) {
    const t = ul(this.config, e), n = t.effectiveReasoning, o = (Array.isArray(e.tools) ? e.tools : []).map((a) => ({
      name: a.function.name,
      description: a.function.description,
      input_schema: a.function.parameters
    })), r = o_(e), i = {
      model: this.config.model,
      system: r,
      messages: s_(e.messages),
      ...o.length ? {
        tools: o,
        tool_choice: t.toolChoice
      } : {},
      ...e.maxTokens ? { max_tokens: e.maxTokens } : {}
    };
    return !po({
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
    const n = typeof e.onStreamProgress == "function", o = ll(this.config.baseUrl), r = t.body || this.buildRequestBody(e), i = ul(this.config, e), a = i.effectiveReasoning;
    return {
      ...lo({
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
        effectiveConfig: yt(e, {
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
      ...i.reasoningDisabledForForcedTool ? { notices: [l_] } : {}
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
        p.length && qo(e, {
          text: c,
          thoughts: d(),
          toolCalls: p,
          toolCallDraft: !0
        });
      };
      i.on("text", (p, m) => {
        c = m || "", qo(e, {
          text: c,
          thoughts: d(),
          ...h().length ? {
            toolCalls: h(),
            toolCallDraft: !0
          } : {}
        });
      }), i.on("thinking", (p, m) => {
        a.set("thinking:0", m || ""), qo(e, {
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
        p?.type === "redacted_thinking" && (a.set("redacted:0", p.data || ""), qo(e, {
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
      providerPayload: i_(o),
      requestInspection: n
    };
  }
}, c_ = /* @__PURE__ */ Nr(((e, t) => {
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
})), d_ = /* @__PURE__ */ Nr(((e) => {
  var t = c_();
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
})), f_ = /* @__PURE__ */ Nr(((e, t) => {
  t.exports = d_();
})), h_ = /* @__PURE__ */ Nr(((e, t) => {
  var n = f_(), o = [
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
})), cl = /* @__PURE__ */ Im(h_(), 1), p_ = void 0, m_ = void 0;
function g_() {
  return {
    geminiUrl: p_,
    vertexUrl: m_
  };
}
function __(e, t, n, o) {
  var r, i;
  if (!e?.baseUrl) {
    const a = g_();
    return t ? (r = a.vertexUrl) !== null && r !== void 0 ? r : n : (i = a.geminiUrl) !== null && i !== void 0 ? i : o;
  }
  return e.baseUrl;
}
var it = class {
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
function y_(e, t) {
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
    Fi(e, r, i, 0, a);
  }
}
function Fi(e, t, n, o, r) {
  if (o >= t.length || typeof e != "object" || e === null) return;
  const i = t[o];
  if (i.endsWith("[]")) {
    const a = i.slice(0, -2), u = e;
    if (a in u && Array.isArray(u[a])) for (const c of u[a]) Fi(c, t, n, o + 1, r);
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
    i in a && Fi(a[i], t, n, o + 1, r);
  }
}
function Os(e) {
  if (typeof e != "string") throw new Error("fromImageBytes must be a string");
  return e;
}
function v_(e) {
  const t = {}, n = s(e, ["operationName"]);
  n != null && l(t, ["operationName"], n);
  const o = s(e, ["resourceName"]);
  return o != null && l(t, ["_url", "resourceName"], o), t;
}
function A_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response", "generateVideoResponse"]);
  return a != null && l(t, ["response"], S_(a)), t;
}
function T_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], E_(a)), t;
}
function S_(e) {
  const t = {}, n = s(e, ["generatedSamples"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => I_(a))), l(t, ["generatedVideos"], i);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const r = s(e, ["raiMediaFilteredReasons"]);
  return r != null && l(t, ["raiMediaFilteredReasons"], r), t;
}
function E_(e) {
  const t = {}, n = s(e, ["videos"]);
  if (n != null) {
    let i = n;
    Array.isArray(i) && (i = i.map((a) => w_(a))), l(t, ["generatedVideos"], i);
  }
  const o = s(e, ["raiMediaFilteredCount"]);
  o != null && l(t, ["raiMediaFilteredCount"], o);
  const r = s(e, ["raiMediaFilteredReasons"]);
  return r != null && l(t, ["raiMediaFilteredReasons"], r), t;
}
function I_(e) {
  const t = {}, n = s(e, ["video"]);
  return n != null && l(t, ["video"], x_(n)), t;
}
function w_(e) {
  const t = {}, n = s(e, ["_self"]);
  return n != null && l(t, ["video"], N_(n)), t;
}
function C_(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function b_(e) {
  const t = {}, n = s(e, ["operationName"]);
  return n != null && l(t, ["_url", "operationName"], n), t;
}
function R_(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], P_(a)), t;
}
function P_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = s(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function ef(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], M_(a)), t;
}
function M_(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = s(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function x_(e) {
  const t = {}, n = s(e, ["uri"]);
  n != null && l(t, ["uri"], n);
  const o = s(e, ["encodedVideo"]);
  o != null && l(t, ["videoBytes"], Os(o));
  const r = s(e, ["encoding"]);
  return r != null && l(t, ["mimeType"], r), t;
}
function N_(e) {
  const t = {}, n = s(e, ["gcsUri"]);
  n != null && l(t, ["uri"], n);
  const o = s(e, ["bytesBase64Encoded"]);
  o != null && l(t, ["videoBytes"], Os(o));
  const r = s(e, ["mimeType"]);
  return r != null && l(t, ["mimeType"], r), t;
}
var dl;
(function(e) {
  e.LANGUAGE_UNSPECIFIED = "LANGUAGE_UNSPECIFIED", e.PYTHON = "PYTHON";
})(dl || (dl = {}));
var fl;
(function(e) {
  e.OUTCOME_UNSPECIFIED = "OUTCOME_UNSPECIFIED", e.OUTCOME_OK = "OUTCOME_OK", e.OUTCOME_FAILED = "OUTCOME_FAILED", e.OUTCOME_DEADLINE_EXCEEDED = "OUTCOME_DEADLINE_EXCEEDED";
})(fl || (fl = {}));
var hl;
(function(e) {
  e.SCHEDULING_UNSPECIFIED = "SCHEDULING_UNSPECIFIED", e.SILENT = "SILENT", e.WHEN_IDLE = "WHEN_IDLE", e.INTERRUPT = "INTERRUPT";
})(hl || (hl = {}));
var mt;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.STRING = "STRING", e.NUMBER = "NUMBER", e.INTEGER = "INTEGER", e.BOOLEAN = "BOOLEAN", e.ARRAY = "ARRAY", e.OBJECT = "OBJECT", e.NULL = "NULL";
})(mt || (mt = {}));
var pl;
(function(e) {
  e.ENVIRONMENT_UNSPECIFIED = "ENVIRONMENT_UNSPECIFIED", e.ENVIRONMENT_BROWSER = "ENVIRONMENT_BROWSER";
})(pl || (pl = {}));
var ml;
(function(e) {
  e.AUTH_TYPE_UNSPECIFIED = "AUTH_TYPE_UNSPECIFIED", e.NO_AUTH = "NO_AUTH", e.API_KEY_AUTH = "API_KEY_AUTH", e.HTTP_BASIC_AUTH = "HTTP_BASIC_AUTH", e.GOOGLE_SERVICE_ACCOUNT_AUTH = "GOOGLE_SERVICE_ACCOUNT_AUTH", e.OAUTH = "OAUTH", e.OIDC_AUTH = "OIDC_AUTH";
})(ml || (ml = {}));
var gl;
(function(e) {
  e.HTTP_IN_UNSPECIFIED = "HTTP_IN_UNSPECIFIED", e.HTTP_IN_QUERY = "HTTP_IN_QUERY", e.HTTP_IN_HEADER = "HTTP_IN_HEADER", e.HTTP_IN_PATH = "HTTP_IN_PATH", e.HTTP_IN_BODY = "HTTP_IN_BODY", e.HTTP_IN_COOKIE = "HTTP_IN_COOKIE";
})(gl || (gl = {}));
var _l;
(function(e) {
  e.API_SPEC_UNSPECIFIED = "API_SPEC_UNSPECIFIED", e.SIMPLE_SEARCH = "SIMPLE_SEARCH", e.ELASTIC_SEARCH = "ELASTIC_SEARCH";
})(_l || (_l = {}));
var yl;
(function(e) {
  e.PHISH_BLOCK_THRESHOLD_UNSPECIFIED = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_HIGH_AND_ABOVE = "BLOCK_HIGH_AND_ABOVE", e.BLOCK_HIGHER_AND_ABOVE = "BLOCK_HIGHER_AND_ABOVE", e.BLOCK_VERY_HIGH_AND_ABOVE = "BLOCK_VERY_HIGH_AND_ABOVE", e.BLOCK_ONLY_EXTREMELY_HIGH = "BLOCK_ONLY_EXTREMELY_HIGH";
})(yl || (yl = {}));
var vl;
(function(e) {
  e.UNSPECIFIED = "UNSPECIFIED", e.BLOCKING = "BLOCKING", e.NON_BLOCKING = "NON_BLOCKING";
})(vl || (vl = {}));
var Al;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.MODE_DYNAMIC = "MODE_DYNAMIC";
})(Al || (Al = {}));
var Zt;
(function(e) {
  e.MODE_UNSPECIFIED = "MODE_UNSPECIFIED", e.AUTO = "AUTO", e.ANY = "ANY", e.NONE = "NONE", e.VALIDATED = "VALIDATED";
})(Zt || (Zt = {}));
var jt;
(function(e) {
  e.THINKING_LEVEL_UNSPECIFIED = "THINKING_LEVEL_UNSPECIFIED", e.MINIMAL = "MINIMAL", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(jt || (jt = {}));
var Tl;
(function(e) {
  e.DONT_ALLOW = "DONT_ALLOW", e.ALLOW_ADULT = "ALLOW_ADULT", e.ALLOW_ALL = "ALLOW_ALL";
})(Tl || (Tl = {}));
var Sl;
(function(e) {
  e.PROMINENT_PEOPLE_UNSPECIFIED = "PROMINENT_PEOPLE_UNSPECIFIED", e.ALLOW_PROMINENT_PEOPLE = "ALLOW_PROMINENT_PEOPLE", e.BLOCK_PROMINENT_PEOPLE = "BLOCK_PROMINENT_PEOPLE";
})(Sl || (Sl = {}));
var El;
(function(e) {
  e.HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED", e.HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT", e.HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH", e.HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT", e.HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY", e.HARM_CATEGORY_IMAGE_HATE = "HARM_CATEGORY_IMAGE_HATE", e.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", e.HARM_CATEGORY_IMAGE_HARASSMENT = "HARM_CATEGORY_IMAGE_HARASSMENT", e.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", e.HARM_CATEGORY_JAILBREAK = "HARM_CATEGORY_JAILBREAK";
})(El || (El = {}));
var Il;
(function(e) {
  e.HARM_BLOCK_METHOD_UNSPECIFIED = "HARM_BLOCK_METHOD_UNSPECIFIED", e.SEVERITY = "SEVERITY", e.PROBABILITY = "PROBABILITY";
})(Il || (Il = {}));
var wl;
(function(e) {
  e.HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED", e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE", e.OFF = "OFF";
})(wl || (wl = {}));
var Cl;
(function(e) {
  e.FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED", e.STOP = "STOP", e.MAX_TOKENS = "MAX_TOKENS", e.SAFETY = "SAFETY", e.RECITATION = "RECITATION", e.LANGUAGE = "LANGUAGE", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.SPII = "SPII", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.UNEXPECTED_TOOL_CALL = "UNEXPECTED_TOOL_CALL", e.IMAGE_PROHIBITED_CONTENT = "IMAGE_PROHIBITED_CONTENT", e.NO_IMAGE = "NO_IMAGE", e.IMAGE_RECITATION = "IMAGE_RECITATION", e.IMAGE_OTHER = "IMAGE_OTHER";
})(Cl || (Cl = {}));
var bl;
(function(e) {
  e.HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED", e.NEGLIGIBLE = "NEGLIGIBLE", e.LOW = "LOW", e.MEDIUM = "MEDIUM", e.HIGH = "HIGH";
})(bl || (bl = {}));
var Rl;
(function(e) {
  e.HARM_SEVERITY_UNSPECIFIED = "HARM_SEVERITY_UNSPECIFIED", e.HARM_SEVERITY_NEGLIGIBLE = "HARM_SEVERITY_NEGLIGIBLE", e.HARM_SEVERITY_LOW = "HARM_SEVERITY_LOW", e.HARM_SEVERITY_MEDIUM = "HARM_SEVERITY_MEDIUM", e.HARM_SEVERITY_HIGH = "HARM_SEVERITY_HIGH";
})(Rl || (Rl = {}));
var Pl;
(function(e) {
  e.URL_RETRIEVAL_STATUS_UNSPECIFIED = "URL_RETRIEVAL_STATUS_UNSPECIFIED", e.URL_RETRIEVAL_STATUS_SUCCESS = "URL_RETRIEVAL_STATUS_SUCCESS", e.URL_RETRIEVAL_STATUS_ERROR = "URL_RETRIEVAL_STATUS_ERROR", e.URL_RETRIEVAL_STATUS_PAYWALL = "URL_RETRIEVAL_STATUS_PAYWALL", e.URL_RETRIEVAL_STATUS_UNSAFE = "URL_RETRIEVAL_STATUS_UNSAFE";
})(Pl || (Pl = {}));
var Ml;
(function(e) {
  e.BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED", e.SAFETY = "SAFETY", e.OTHER = "OTHER", e.BLOCKLIST = "BLOCKLIST", e.PROHIBITED_CONTENT = "PROHIBITED_CONTENT", e.IMAGE_SAFETY = "IMAGE_SAFETY", e.MODEL_ARMOR = "MODEL_ARMOR", e.JAILBREAK = "JAILBREAK";
})(Ml || (Ml = {}));
var xl;
(function(e) {
  e.TRAFFIC_TYPE_UNSPECIFIED = "TRAFFIC_TYPE_UNSPECIFIED", e.ON_DEMAND = "ON_DEMAND", e.ON_DEMAND_PRIORITY = "ON_DEMAND_PRIORITY", e.ON_DEMAND_FLEX = "ON_DEMAND_FLEX", e.PROVISIONED_THROUGHPUT = "PROVISIONED_THROUGHPUT";
})(xl || (xl = {}));
var pr;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.AUDIO = "AUDIO", e.VIDEO = "VIDEO";
})(pr || (pr = {}));
var Nl;
(function(e) {
  e.MODEL_STAGE_UNSPECIFIED = "MODEL_STAGE_UNSPECIFIED", e.UNSTABLE_EXPERIMENTAL = "UNSTABLE_EXPERIMENTAL", e.EXPERIMENTAL = "EXPERIMENTAL", e.PREVIEW = "PREVIEW", e.STABLE = "STABLE", e.LEGACY = "LEGACY", e.DEPRECATED = "DEPRECATED", e.RETIRED = "RETIRED";
})(Nl || (Nl = {}));
var kl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH";
})(kl || (kl = {}));
var Dl;
(function(e) {
  e.TUNING_MODE_UNSPECIFIED = "TUNING_MODE_UNSPECIFIED", e.TUNING_MODE_FULL = "TUNING_MODE_FULL", e.TUNING_MODE_PEFT_ADAPTER = "TUNING_MODE_PEFT_ADAPTER";
})(Dl || (Dl = {}));
var $l;
(function(e) {
  e.ADAPTER_SIZE_UNSPECIFIED = "ADAPTER_SIZE_UNSPECIFIED", e.ADAPTER_SIZE_ONE = "ADAPTER_SIZE_ONE", e.ADAPTER_SIZE_TWO = "ADAPTER_SIZE_TWO", e.ADAPTER_SIZE_FOUR = "ADAPTER_SIZE_FOUR", e.ADAPTER_SIZE_EIGHT = "ADAPTER_SIZE_EIGHT", e.ADAPTER_SIZE_SIXTEEN = "ADAPTER_SIZE_SIXTEEN", e.ADAPTER_SIZE_THIRTY_TWO = "ADAPTER_SIZE_THIRTY_TWO";
})($l || ($l = {}));
var Oi;
(function(e) {
  e.JOB_STATE_UNSPECIFIED = "JOB_STATE_UNSPECIFIED", e.JOB_STATE_QUEUED = "JOB_STATE_QUEUED", e.JOB_STATE_PENDING = "JOB_STATE_PENDING", e.JOB_STATE_RUNNING = "JOB_STATE_RUNNING", e.JOB_STATE_SUCCEEDED = "JOB_STATE_SUCCEEDED", e.JOB_STATE_FAILED = "JOB_STATE_FAILED", e.JOB_STATE_CANCELLING = "JOB_STATE_CANCELLING", e.JOB_STATE_CANCELLED = "JOB_STATE_CANCELLED", e.JOB_STATE_PAUSED = "JOB_STATE_PAUSED", e.JOB_STATE_EXPIRED = "JOB_STATE_EXPIRED", e.JOB_STATE_UPDATING = "JOB_STATE_UPDATING", e.JOB_STATE_PARTIALLY_SUCCEEDED = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(Oi || (Oi = {}));
var Ll;
(function(e) {
  e.TUNING_JOB_STATE_UNSPECIFIED = "TUNING_JOB_STATE_UNSPECIFIED", e.TUNING_JOB_STATE_WAITING_FOR_QUOTA = "TUNING_JOB_STATE_WAITING_FOR_QUOTA", e.TUNING_JOB_STATE_PROCESSING_DATASET = "TUNING_JOB_STATE_PROCESSING_DATASET", e.TUNING_JOB_STATE_WAITING_FOR_CAPACITY = "TUNING_JOB_STATE_WAITING_FOR_CAPACITY", e.TUNING_JOB_STATE_TUNING = "TUNING_JOB_STATE_TUNING", e.TUNING_JOB_STATE_POST_PROCESSING = "TUNING_JOB_STATE_POST_PROCESSING";
})(Ll || (Ll = {}));
var Ul;
(function(e) {
  e.AGGREGATION_METRIC_UNSPECIFIED = "AGGREGATION_METRIC_UNSPECIFIED", e.AVERAGE = "AVERAGE", e.MODE = "MODE", e.STANDARD_DEVIATION = "STANDARD_DEVIATION", e.VARIANCE = "VARIANCE", e.MINIMUM = "MINIMUM", e.MAXIMUM = "MAXIMUM", e.MEDIAN = "MEDIAN", e.PERCENTILE_P90 = "PERCENTILE_P90", e.PERCENTILE_P95 = "PERCENTILE_P95", e.PERCENTILE_P99 = "PERCENTILE_P99";
})(Ul || (Ul = {}));
var Fl;
(function(e) {
  e.PAIRWISE_CHOICE_UNSPECIFIED = "PAIRWISE_CHOICE_UNSPECIFIED", e.BASELINE = "BASELINE", e.CANDIDATE = "CANDIDATE", e.TIE = "TIE";
})(Fl || (Fl = {}));
var Ol;
(function(e) {
  e.TUNING_TASK_UNSPECIFIED = "TUNING_TASK_UNSPECIFIED", e.TUNING_TASK_I2V = "TUNING_TASK_I2V", e.TUNING_TASK_T2V = "TUNING_TASK_T2V", e.TUNING_TASK_R2V = "TUNING_TASK_R2V";
})(Ol || (Ol = {}));
var Gl;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.STATE_PENDING = "STATE_PENDING", e.STATE_ACTIVE = "STATE_ACTIVE", e.STATE_FAILED = "STATE_FAILED";
})(Gl || (Gl = {}));
var Bl;
(function(e) {
  e.MEDIA_RESOLUTION_UNSPECIFIED = "MEDIA_RESOLUTION_UNSPECIFIED", e.MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW", e.MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM", e.MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH", e.MEDIA_RESOLUTION_ULTRA_HIGH = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(Bl || (Bl = {}));
var ql;
(function(e) {
  e.TOOL_TYPE_UNSPECIFIED = "TOOL_TYPE_UNSPECIFIED", e.GOOGLE_SEARCH_WEB = "GOOGLE_SEARCH_WEB", e.GOOGLE_SEARCH_IMAGE = "GOOGLE_SEARCH_IMAGE", e.URL_CONTEXT = "URL_CONTEXT", e.GOOGLE_MAPS = "GOOGLE_MAPS", e.FILE_SEARCH = "FILE_SEARCH";
})(ql || (ql = {}));
var Gi;
(function(e) {
  e.COLLECTION = "COLLECTION";
})(Gi || (Gi = {}));
var Hl;
(function(e) {
  e.UNSPECIFIED = "unspecified", e.FLEX = "flex", e.STANDARD = "standard", e.PRIORITY = "priority";
})(Hl || (Hl = {}));
var Vl;
(function(e) {
  e.FEATURE_SELECTION_PREFERENCE_UNSPECIFIED = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED", e.PRIORITIZE_QUALITY = "PRIORITIZE_QUALITY", e.BALANCED = "BALANCED", e.PRIORITIZE_COST = "PRIORITIZE_COST";
})(Vl || (Vl = {}));
var mr;
(function(e) {
  e.PREDICT = "PREDICT", e.EMBED_CONTENT = "EMBED_CONTENT";
})(mr || (mr = {}));
var Jl;
(function(e) {
  e.BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE", e.BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE", e.BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH", e.BLOCK_NONE = "BLOCK_NONE";
})(Jl || (Jl = {}));
var Kl;
(function(e) {
  e.auto = "auto", e.en = "en", e.ja = "ja", e.ko = "ko", e.hi = "hi", e.zh = "zh", e.pt = "pt", e.es = "es";
})(Kl || (Kl = {}));
var Wl;
(function(e) {
  e.MASK_MODE_DEFAULT = "MASK_MODE_DEFAULT", e.MASK_MODE_USER_PROVIDED = "MASK_MODE_USER_PROVIDED", e.MASK_MODE_BACKGROUND = "MASK_MODE_BACKGROUND", e.MASK_MODE_FOREGROUND = "MASK_MODE_FOREGROUND", e.MASK_MODE_SEMANTIC = "MASK_MODE_SEMANTIC";
})(Wl || (Wl = {}));
var zl;
(function(e) {
  e.CONTROL_TYPE_DEFAULT = "CONTROL_TYPE_DEFAULT", e.CONTROL_TYPE_CANNY = "CONTROL_TYPE_CANNY", e.CONTROL_TYPE_SCRIBBLE = "CONTROL_TYPE_SCRIBBLE", e.CONTROL_TYPE_FACE_MESH = "CONTROL_TYPE_FACE_MESH";
})(zl || (zl = {}));
var Yl;
(function(e) {
  e.SUBJECT_TYPE_DEFAULT = "SUBJECT_TYPE_DEFAULT", e.SUBJECT_TYPE_PERSON = "SUBJECT_TYPE_PERSON", e.SUBJECT_TYPE_ANIMAL = "SUBJECT_TYPE_ANIMAL", e.SUBJECT_TYPE_PRODUCT = "SUBJECT_TYPE_PRODUCT";
})(Yl || (Yl = {}));
var Xl;
(function(e) {
  e.EDIT_MODE_DEFAULT = "EDIT_MODE_DEFAULT", e.EDIT_MODE_INPAINT_REMOVAL = "EDIT_MODE_INPAINT_REMOVAL", e.EDIT_MODE_INPAINT_INSERTION = "EDIT_MODE_INPAINT_INSERTION", e.EDIT_MODE_OUTPAINT = "EDIT_MODE_OUTPAINT", e.EDIT_MODE_CONTROLLED_EDITING = "EDIT_MODE_CONTROLLED_EDITING", e.EDIT_MODE_STYLE = "EDIT_MODE_STYLE", e.EDIT_MODE_BGSWAP = "EDIT_MODE_BGSWAP", e.EDIT_MODE_PRODUCT_IMAGE = "EDIT_MODE_PRODUCT_IMAGE";
})(Xl || (Xl = {}));
var Ql;
(function(e) {
  e.FOREGROUND = "FOREGROUND", e.BACKGROUND = "BACKGROUND", e.PROMPT = "PROMPT", e.SEMANTIC = "SEMANTIC", e.INTERACTIVE = "INTERACTIVE";
})(Ql || (Ql = {}));
var Zl;
(function(e) {
  e.ASSET = "ASSET", e.STYLE = "STYLE";
})(Zl || (Zl = {}));
var jl;
(function(e) {
  e.INSERT = "INSERT", e.REMOVE = "REMOVE", e.REMOVE_STATIC = "REMOVE_STATIC", e.OUTPAINT = "OUTPAINT";
})(jl || (jl = {}));
var eu;
(function(e) {
  e.OPTIMIZED = "OPTIMIZED", e.LOSSLESS = "LOSSLESS";
})(eu || (eu = {}));
var tu;
(function(e) {
  e.SUPERVISED_FINE_TUNING = "SUPERVISED_FINE_TUNING", e.PREFERENCE_TUNING = "PREFERENCE_TUNING", e.DISTILLATION = "DISTILLATION";
})(tu || (tu = {}));
var nu;
(function(e) {
  e.STATE_UNSPECIFIED = "STATE_UNSPECIFIED", e.PROCESSING = "PROCESSING", e.ACTIVE = "ACTIVE", e.FAILED = "FAILED";
})(nu || (nu = {}));
var ou;
(function(e) {
  e.SOURCE_UNSPECIFIED = "SOURCE_UNSPECIFIED", e.UPLOADED = "UPLOADED", e.GENERATED = "GENERATED", e.REGISTERED = "REGISTERED";
})(ou || (ou = {}));
var ru;
(function(e) {
  e.TURN_COMPLETE_REASON_UNSPECIFIED = "TURN_COMPLETE_REASON_UNSPECIFIED", e.MALFORMED_FUNCTION_CALL = "MALFORMED_FUNCTION_CALL", e.RESPONSE_REJECTED = "RESPONSE_REJECTED", e.NEED_MORE_INPUT = "NEED_MORE_INPUT", e.PROHIBITED_INPUT_CONTENT = "PROHIBITED_INPUT_CONTENT", e.IMAGE_PROHIBITED_INPUT_CONTENT = "IMAGE_PROHIBITED_INPUT_CONTENT", e.INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED = "INPUT_TEXT_CONTAIN_PROMINENT_PERSON_PROHIBITED", e.INPUT_IMAGE_CELEBRITY = "INPUT_IMAGE_CELEBRITY", e.INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED = "INPUT_IMAGE_PHOTO_REALISTIC_CHILD_PROHIBITED", e.INPUT_TEXT_NCII_PROHIBITED = "INPUT_TEXT_NCII_PROHIBITED", e.INPUT_OTHER = "INPUT_OTHER", e.INPUT_IP_PROHIBITED = "INPUT_IP_PROHIBITED", e.BLOCKLIST = "BLOCKLIST", e.UNSAFE_PROMPT_FOR_IMAGE_GENERATION = "UNSAFE_PROMPT_FOR_IMAGE_GENERATION", e.GENERATED_IMAGE_SAFETY = "GENERATED_IMAGE_SAFETY", e.GENERATED_CONTENT_SAFETY = "GENERATED_CONTENT_SAFETY", e.GENERATED_AUDIO_SAFETY = "GENERATED_AUDIO_SAFETY", e.GENERATED_VIDEO_SAFETY = "GENERATED_VIDEO_SAFETY", e.GENERATED_CONTENT_PROHIBITED = "GENERATED_CONTENT_PROHIBITED", e.GENERATED_CONTENT_BLOCKLIST = "GENERATED_CONTENT_BLOCKLIST", e.GENERATED_IMAGE_PROHIBITED = "GENERATED_IMAGE_PROHIBITED", e.GENERATED_IMAGE_CELEBRITY = "GENERATED_IMAGE_CELEBRITY", e.GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER = "GENERATED_IMAGE_PROMINENT_PEOPLE_DETECTED_BY_REWRITER", e.GENERATED_IMAGE_IDENTIFIABLE_PEOPLE = "GENERATED_IMAGE_IDENTIFIABLE_PEOPLE", e.GENERATED_IMAGE_MINORS = "GENERATED_IMAGE_MINORS", e.OUTPUT_IMAGE_IP_PROHIBITED = "OUTPUT_IMAGE_IP_PROHIBITED", e.GENERATED_OTHER = "GENERATED_OTHER", e.MAX_REGENERATION_REACHED = "MAX_REGENERATION_REACHED";
})(ru || (ru = {}));
var iu;
(function(e) {
  e.MODALITY_UNSPECIFIED = "MODALITY_UNSPECIFIED", e.TEXT = "TEXT", e.IMAGE = "IMAGE", e.VIDEO = "VIDEO", e.AUDIO = "AUDIO", e.DOCUMENT = "DOCUMENT";
})(iu || (iu = {}));
var su;
(function(e) {
  e.VAD_SIGNAL_TYPE_UNSPECIFIED = "VAD_SIGNAL_TYPE_UNSPECIFIED", e.VAD_SIGNAL_TYPE_SOS = "VAD_SIGNAL_TYPE_SOS", e.VAD_SIGNAL_TYPE_EOS = "VAD_SIGNAL_TYPE_EOS";
})(su || (su = {}));
var au;
(function(e) {
  e.TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED", e.ACTIVITY_START = "ACTIVITY_START", e.ACTIVITY_END = "ACTIVITY_END";
})(au || (au = {}));
var lu;
(function(e) {
  e.START_SENSITIVITY_UNSPECIFIED = "START_SENSITIVITY_UNSPECIFIED", e.START_SENSITIVITY_HIGH = "START_SENSITIVITY_HIGH", e.START_SENSITIVITY_LOW = "START_SENSITIVITY_LOW";
})(lu || (lu = {}));
var uu;
(function(e) {
  e.END_SENSITIVITY_UNSPECIFIED = "END_SENSITIVITY_UNSPECIFIED", e.END_SENSITIVITY_HIGH = "END_SENSITIVITY_HIGH", e.END_SENSITIVITY_LOW = "END_SENSITIVITY_LOW";
})(uu || (uu = {}));
var cu;
(function(e) {
  e.ACTIVITY_HANDLING_UNSPECIFIED = "ACTIVITY_HANDLING_UNSPECIFIED", e.START_OF_ACTIVITY_INTERRUPTS = "START_OF_ACTIVITY_INTERRUPTS", e.NO_INTERRUPTION = "NO_INTERRUPTION";
})(cu || (cu = {}));
var du;
(function(e) {
  e.TURN_COVERAGE_UNSPECIFIED = "TURN_COVERAGE_UNSPECIFIED", e.TURN_INCLUDES_ONLY_ACTIVITY = "TURN_INCLUDES_ONLY_ACTIVITY", e.TURN_INCLUDES_ALL_INPUT = "TURN_INCLUDES_ALL_INPUT", e.TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO = "TURN_INCLUDES_AUDIO_ACTIVITY_AND_ALL_VIDEO";
})(du || (du = {}));
var fu;
(function(e) {
  e.SCALE_UNSPECIFIED = "SCALE_UNSPECIFIED", e.C_MAJOR_A_MINOR = "C_MAJOR_A_MINOR", e.D_FLAT_MAJOR_B_FLAT_MINOR = "D_FLAT_MAJOR_B_FLAT_MINOR", e.D_MAJOR_B_MINOR = "D_MAJOR_B_MINOR", e.E_FLAT_MAJOR_C_MINOR = "E_FLAT_MAJOR_C_MINOR", e.E_MAJOR_D_FLAT_MINOR = "E_MAJOR_D_FLAT_MINOR", e.F_MAJOR_D_MINOR = "F_MAJOR_D_MINOR", e.G_FLAT_MAJOR_E_FLAT_MINOR = "G_FLAT_MAJOR_E_FLAT_MINOR", e.G_MAJOR_E_MINOR = "G_MAJOR_E_MINOR", e.A_FLAT_MAJOR_F_MINOR = "A_FLAT_MAJOR_F_MINOR", e.A_MAJOR_G_FLAT_MINOR = "A_MAJOR_G_FLAT_MINOR", e.B_FLAT_MAJOR_G_MINOR = "B_FLAT_MAJOR_G_MINOR", e.B_MAJOR_A_FLAT_MINOR = "B_MAJOR_A_FLAT_MINOR";
})(fu || (fu = {}));
var hu;
(function(e) {
  e.MUSIC_GENERATION_MODE_UNSPECIFIED = "MUSIC_GENERATION_MODE_UNSPECIFIED", e.QUALITY = "QUALITY", e.DIVERSITY = "DIVERSITY", e.VOCALIZATION = "VOCALIZATION";
})(hu || (hu = {}));
var en;
(function(e) {
  e.PLAYBACK_CONTROL_UNSPECIFIED = "PLAYBACK_CONTROL_UNSPECIFIED", e.PLAY = "PLAY", e.PAUSE = "PAUSE", e.STOP = "STOP", e.RESET_CONTEXT = "RESET_CONTEXT";
})(en || (en = {}));
var Bi = class {
  constructor(e) {
    const t = {};
    for (const n of e.headers.entries()) t[n[0]] = n[1];
    this.headers = t, this.responseInternal = e;
  }
  json() {
    return this.responseInternal.json();
  }
}, Nn = class {
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
}, pu = class {
}, mu = class {
}, k_ = class {
}, D_ = class {
}, $_ = class {
}, L_ = class {
}, gu = class {
}, _u = class {
}, yu = class {
}, U_ = class {
}, vu = class tf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new tf();
    let r;
    const i = t;
    return n ? r = T_(i) : r = A_(i), Object.assign(o, r), o;
  }
}, Au = class {
}, Tu = class {
}, Su = class {
}, Eu = class {
}, F_ = class {
}, O_ = class {
}, G_ = class {
}, B_ = class nf {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new nf(), r = R_(t);
    return Object.assign(o, r), o;
  }
}, q_ = class {
}, H_ = class {
}, V_ = class {
}, J_ = class {
}, Iu = class {
}, K_ = class {
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
}, W_ = class {
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) return this.serverContent.audioChunks[0];
  }
}, z_ = class of {
  _fromAPIResponse({ apiResponse: t, _isVertexAI: n }) {
    const o = new of(), r = ef(t);
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
function rf(e, t) {
  const n = V(e, t);
  return n ? n.startsWith("publishers/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}` : n.startsWith("models/") && e.isVertexAI() ? `projects/${e.getProject()}/locations/${e.getLocation()}/publishers/google/${n}` : n : "";
}
function sf(e) {
  return Array.isArray(e) ? e.map((t) => gr(t)) : [gr(e)];
}
function gr(e) {
  if (typeof e == "object" && e !== null) return e;
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof e}`);
}
function af(e) {
  const t = gr(e);
  if (t.mimeType && t.mimeType.startsWith("image/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function lf(e) {
  const t = gr(e);
  if (t.mimeType && t.mimeType.startsWith("audio/")) return t;
  throw new Error(`Unsupported mime type: ${t.mimeType}`);
}
function wu(e) {
  if (e == null) throw new Error("PartUnion is required");
  if (typeof e == "object") return e;
  if (typeof e == "string") return { text: e };
  throw new Error(`Unsupported part type: ${typeof e}`);
}
function uf(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("PartListUnion is required");
  return Array.isArray(e) ? e.map((t) => wu(t)) : [wu(e)];
}
function qi(e) {
  return e != null && typeof e == "object" && "parts" in e && Array.isArray(e.parts);
}
function Cu(e) {
  return e != null && typeof e == "object" && "functionCall" in e;
}
function bu(e) {
  return e != null && typeof e == "object" && "functionResponse" in e;
}
function ie(e) {
  if (e == null) throw new Error("ContentUnion is required");
  return qi(e) ? e : {
    role: "user",
    parts: uf(e)
  };
}
function Gs(e, t) {
  if (!t) return [];
  if (e.isVertexAI() && Array.isArray(t)) return t.flatMap((n) => {
    const o = ie(n);
    return o.parts && o.parts.length > 0 && o.parts[0].text !== void 0 ? [o.parts[0].text] : [];
  });
  if (e.isVertexAI()) {
    const n = ie(t);
    return n.parts && n.parts.length > 0 && n.parts[0].text !== void 0 ? [n.parts[0].text] : [];
  }
  return Array.isArray(t) ? t.map((n) => ie(n)) : [ie(t)];
}
function ye(e) {
  if (e == null || Array.isArray(e) && e.length === 0) throw new Error("contents are required");
  if (!Array.isArray(e)) {
    if (Cu(e) || bu(e)) throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    return [ie(e)];
  }
  const t = [], n = [], o = qi(e[0]);
  for (const r of e) {
    const i = qi(r);
    if (i != o) throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    if (i) t.push(r);
    else {
      if (Cu(r) || bu(r)) throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
      n.push(r);
    }
  }
  return o || t.push({
    role: "user",
    parts: uf(n)
  }), t;
}
function Y_(e, t) {
  e.includes("null") && (t.nullable = !0);
  const n = e.filter((o) => o !== "null");
  if (n.length === 1) t.type = Object.values(mt).includes(n[0].toUpperCase()) ? n[0].toUpperCase() : mt.TYPE_UNSPECIFIED;
  else {
    t.anyOf = [];
    for (const o of n) t.anyOf.push({ type: Object.values(mt).includes(o.toUpperCase()) ? o.toUpperCase() : mt.TYPE_UNSPECIFIED });
  }
}
function an(e) {
  const t = {}, n = ["items"], o = ["anyOf"], r = ["properties"];
  if (e.type && e.anyOf) throw new Error("type and anyOf cannot be both populated.");
  const i = e.anyOf;
  i != null && i.length == 2 && (i[0].type === "null" ? (t.nullable = !0, e = i[1]) : i[1].type === "null" && (t.nullable = !0, e = i[0])), e.type instanceof Array && Y_(e.type, t);
  for (const [a, u] of Object.entries(e))
    if (u != null)
      if (a == "type") {
        if (u === "null") throw new Error("type: null can not be the only possible type for the field.");
        if (u instanceof Array) continue;
        t.type = Object.values(mt).includes(u.toUpperCase()) ? u.toUpperCase() : mt.TYPE_UNSPECIFIED;
      } else if (n.includes(a)) t[a] = an(u);
      else if (o.includes(a)) {
        const c = [];
        for (const d of u) {
          if (d.type == "null") {
            t.nullable = !0;
            continue;
          }
          c.push(an(d));
        }
        t[a] = c;
      } else if (r.includes(a)) {
        const c = {};
        for (const [d, h] of Object.entries(u)) c[d] = an(h);
        t[a] = c;
      } else {
        if (a === "additionalProperties") continue;
        t[a] = u;
      }
  return t;
}
function Bs(e) {
  return an(e);
}
function qs(e) {
  if (typeof e == "object") return e;
  if (typeof e == "string") return { voiceConfig: { prebuiltVoiceConfig: { voiceName: e } } };
  throw new Error(`Unsupported speechConfig type: ${typeof e}`);
}
function Hs(e) {
  if ("multiSpeakerVoiceConfig" in e) throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  return e;
}
function cn(e) {
  if (e.functionDeclarations) for (const t of e.functionDeclarations)
    t.parameters && (Object.keys(t.parameters).includes("$schema") ? t.parametersJsonSchema || (t.parametersJsonSchema = t.parameters, delete t.parameters) : t.parameters = an(t.parameters)), t.response && (Object.keys(t.response).includes("$schema") ? t.responseJsonSchema || (t.responseJsonSchema = t.response, delete t.response) : t.response = an(t.response));
  return e;
}
function dn(e) {
  if (e == null) throw new Error("tools is required");
  if (!Array.isArray(e)) throw new Error("tools is required and must be an array of Tools");
  const t = [];
  for (const n of e) t.push(n);
  return t;
}
function X_(e, t, n, o = 1) {
  const r = !t.startsWith(`${n}/`) && t.split("/").length === o;
  return e.isVertexAI() ? t.startsWith("projects/") ? t : t.startsWith("locations/") ? `projects/${e.getProject()}/${t}` : t.startsWith(`${n}/`) ? `projects/${e.getProject()}/locations/${e.getLocation()}/${t}` : r ? `projects/${e.getProject()}/locations/${e.getLocation()}/${n}/${t}` : t : r ? `${n}/${t}` : t;
}
function st(e, t) {
  if (typeof t != "string") throw new Error("name must be a string");
  return X_(e, t, "cachedContents");
}
function cf(e) {
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
  return Os(e);
}
function Q_(e) {
  return e != null && typeof e == "object" && "name" in e;
}
function Z_(e) {
  return e != null && typeof e == "object" && "video" in e;
}
function j_(e) {
  return e != null && typeof e == "object" && "uri" in e;
}
function df(e) {
  var t;
  let n;
  if (Q_(e) && (n = e.name), !(j_(e) && (n = e.uri, n === void 0)) && !(Z_(e) && (n = (t = e.video) === null || t === void 0 ? void 0 : t.uri, n === void 0))) {
    if (typeof e == "string" && (n = e), n === void 0) throw new Error("Could not extract file name from the provided input.");
    if (n.startsWith("https://")) {
      const o = n.split("files/")[1].match(/[a-z0-9]+/);
      if (o === null) throw new Error(`Could not extract file name from URI ${n}`);
      n = o[0];
    } else n.startsWith("files/") && (n = n.split("files/")[1]);
    return n;
  }
}
function ff(e, t) {
  let n;
  return e.isVertexAI() ? n = t ? "publishers/google/models" : "models" : n = t ? "models" : "tunedModels", n;
}
function hf(e) {
  for (const t of [
    "models",
    "tunedModels",
    "publisherModels"
  ]) if (ey(e, t)) return e[t];
  return [];
}
function ey(e, t) {
  return e !== null && typeof e == "object" && t in e;
}
function ty(e, t = {}) {
  const n = e, o = {
    name: n.name,
    description: n.description,
    parametersJsonSchema: n.inputSchema
  };
  return n.outputSchema && (o.responseJsonSchema = n.outputSchema), t.behavior && (o.behavior = t.behavior), { functionDeclarations: [o] };
}
function ny(e, t = {}) {
  const n = [], o = /* @__PURE__ */ new Set();
  for (const r of e) {
    const i = r.name;
    if (o.has(i)) throw new Error(`Duplicate function name ${i} found in MCP tools. Please ensure function names are unique.`);
    o.add(i);
    const a = ty(r, t);
    a.functionDeclarations && n.push(...a.functionDeclarations);
  }
  return { functionDeclarations: n };
}
function pf(e, t) {
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
function oy(e) {
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
function mf(e) {
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
function fn(e, t) {
  const n = t;
  if (!e.isVertexAI()) {
    if (/batches\/[^/]+$/.test(n)) return n.split("/").pop();
    throw new Error(`Invalid batch job name: ${n}.`);
  }
  if (/^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/.test(n)) return n.split("/").pop();
  if (/^\d+$/.test(n)) return n;
  throw new Error(`Invalid batch job name: ${n}.`);
}
function gf(e) {
  const t = e;
  return t === "BATCH_STATE_UNSPECIFIED" ? "JOB_STATE_UNSPECIFIED" : t === "BATCH_STATE_PENDING" ? "JOB_STATE_PENDING" : t === "BATCH_STATE_RUNNING" ? "JOB_STATE_RUNNING" : t === "BATCH_STATE_SUCCEEDED" ? "JOB_STATE_SUCCEEDED" : t === "BATCH_STATE_FAILED" ? "JOB_STATE_FAILED" : t === "BATCH_STATE_CANCELLED" ? "JOB_STATE_CANCELLED" : t === "BATCH_STATE_EXPIRED" ? "JOB_STATE_EXPIRED" : t;
}
function ry(e) {
  return e.includes("gemini") && e !== "gemini-embedding-001" || e.includes("maas");
}
function iy(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function sy(e) {
  const t = {}, n = s(e, ["responsesFile"]);
  n != null && l(t, ["fileName"], n);
  const o = s(e, ["inlinedResponses", "inlinedResponses"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => Gy(a))), l(t, ["inlinedResponses"], i);
  }
  const r = s(e, ["inlinedEmbedContentResponses", "inlinedResponses"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["inlinedEmbedContentResponses"], i);
  }
  return t;
}
function ay(e) {
  const t = {}, n = s(e, ["predictionsFormat"]);
  n != null && l(t, ["format"], n);
  const o = s(e, ["gcsDestination", "outputUriPrefix"]);
  o != null && l(t, ["gcsUri"], o);
  const r = s(e, ["bigqueryDestination", "outputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function ly(e) {
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
function nr(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata", "displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = s(e, ["metadata", "state"]);
  r != null && l(t, ["state"], gf(r));
  const i = s(e, ["metadata", "createTime"]);
  i != null && l(t, ["createTime"], i);
  const a = s(e, ["metadata", "endTime"]);
  a != null && l(t, ["endTime"], a);
  const u = s(e, ["metadata", "updateTime"]);
  u != null && l(t, ["updateTime"], u);
  const c = s(e, ["metadata", "model"]);
  c != null && l(t, ["model"], c);
  const d = s(e, ["metadata", "output"]);
  return d != null && l(t, ["dest"], sy(mf(d))), t;
}
function Hi(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["displayName"]);
  o != null && l(t, ["displayName"], o);
  const r = s(e, ["state"]);
  r != null && l(t, ["state"], gf(r));
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
  f != null && l(t, ["src"], uy(f));
  const p = s(e, ["outputConfig"]);
  p != null && l(t, ["dest"], ay(mf(p)));
  const m = s(e, ["completionStats"]);
  return m != null && l(t, ["completionStats"], m), t;
}
function uy(e) {
  const t = {}, n = s(e, ["instancesFormat"]);
  n != null && l(t, ["format"], n);
  const o = s(e, ["gcsSource", "uris"]);
  o != null && l(t, ["gcsUri"], o);
  const r = s(e, ["bigquerySource", "inputUri"]);
  return r != null && l(t, ["bigqueryUri"], r), t;
}
function cy(e, t) {
  const n = {};
  if (s(t, ["format"]) !== void 0) throw new Error("format parameter is not supported in Gemini API.");
  if (s(t, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  if (s(t, ["bigqueryUri"]) !== void 0) throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  const o = s(t, ["fileName"]);
  o != null && l(n, ["fileName"], o);
  const r = s(t, ["inlinedRequests"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => Oy(e, a))), l(n, ["requests", "requests"], i);
  }
  return n;
}
function dy(e) {
  const t = {}, n = s(e, ["format"]);
  n != null && l(t, ["instancesFormat"], n);
  const o = s(e, ["gcsUri"]);
  o != null && l(t, ["gcsSource", "uris"], o);
  const r = s(e, ["bigqueryUri"]);
  if (r != null && l(t, ["bigquerySource", "inputUri"], r), s(e, ["fileName"]) !== void 0) throw new Error("fileName parameter is not supported in Vertex AI.");
  if (s(e, ["inlinedRequests"]) !== void 0) throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  return t;
}
function fy(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function hy(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], fn(e, o)), n;
}
function py(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], fn(e, o)), n;
}
function my(e) {
  const t = {}, n = s(e, ["content"]);
  n != null && l(t, ["content"], n);
  const o = s(e, ["citationMetadata"]);
  o != null && l(t, ["citationMetadata"], gy(o));
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
function gy(e) {
  const t = {}, n = s(e, ["citationSources"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["citations"], o);
  }
  return t;
}
function _f(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Wy(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function _y(e, t) {
  const n = {}, o = s(e, ["displayName"]);
  if (t !== void 0 && o != null && l(t, ["batch", "displayName"], o), s(e, ["dest"]) !== void 0) throw new Error("dest parameter is not supported in Gemini API.");
  const r = s(e, ["webhookConfig"]);
  return t !== void 0 && r != null && l(t, ["batch", "webhookConfig"], r), n;
}
function yy(e, t) {
  const n = {}, o = s(e, ["displayName"]);
  t !== void 0 && o != null && l(t, ["displayName"], o);
  const r = s(e, ["dest"]);
  if (t !== void 0 && r != null && l(t, ["outputConfig"], ly(oy(r))), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return n;
}
function Ru(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["_url", "model"], V(e, o));
  const r = s(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], cy(e, pf(e, r)));
  const i = s(t, ["config"]);
  return i != null && _y(i, n), n;
}
function vy(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["model"], V(e, o));
  const r = s(t, ["src"]);
  r != null && l(n, ["inputConfig"], dy(pf(e, r)));
  const i = s(t, ["config"]);
  return i != null && yy(i, n), n;
}
function Ay(e, t) {
  const n = {}, o = s(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["batch", "displayName"], o), n;
}
function Ty(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["_url", "model"], V(e, o));
  const r = s(t, ["src"]);
  r != null && l(n, ["batch", "inputConfig"], Ry(e, r));
  const i = s(t, ["config"]);
  return i != null && Ay(i, n), n;
}
function Sy(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], fn(e, o)), n;
}
function Ey(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], fn(e, o)), n;
}
function Iy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function wy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["name"]);
  o != null && l(t, ["name"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  return i != null && l(t, ["error"], i), t;
}
function Cy(e, t) {
  const n = {}, o = s(t, ["contents"]);
  if (o != null) {
    let i = Gs(e, o);
    Array.isArray(i) && (i = i.map((a) => a)), l(n, [
      "requests[]",
      "request",
      "content"
    ], i);
  }
  const r = s(t, ["config"]);
  return r != null && (l(n, ["_self"], by(r, n)), y_(n, { "requests[].*": "requests[].request.*" })), n;
}
function by(e, t) {
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
function Ry(e, t) {
  const n = {}, o = s(t, ["fileName"]);
  o != null && l(n, ["file_name"], o);
  const r = s(t, ["inlinedRequests"]);
  return r != null && l(n, ["requests"], Cy(e, r)), n;
}
function Py(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function My(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = s(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = s(e, ["name"]);
  if (r != null && l(t, ["name"], r), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function xy(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = s(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function Ny(e, t, n) {
  const o = {}, r = s(t, ["systemInstruction"]);
  n !== void 0 && r != null && l(n, ["systemInstruction"], _f(ie(r)));
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
  S != null && l(o, ["responseSchema"], Bs(S));
  const I = s(t, ["responseJsonSchema"]);
  if (I != null && l(o, ["responseJsonSchema"], I), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const b = s(t, ["safetySettings"]);
  if (n !== void 0 && b != null) {
    let W = b;
    Array.isArray(W) && (W = W.map((K) => zy(K))), l(n, ["safetySettings"], W);
  }
  const P = s(t, ["tools"]);
  if (n !== void 0 && P != null) {
    let W = dn(P);
    Array.isArray(W) && (W = W.map((K) => Xy(cn(K)))), l(n, ["tools"], W);
  }
  const D = s(t, ["toolConfig"]);
  if (n !== void 0 && D != null && l(n, ["toolConfig"], Yy(D)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const E = s(t, ["cachedContent"]);
  n !== void 0 && E != null && l(n, ["cachedContent"], st(e, E));
  const L = s(t, ["responseModalities"]);
  L != null && l(o, ["responseModalities"], L);
  const w = s(t, ["mediaResolution"]);
  w != null && l(o, ["mediaResolution"], w);
  const M = s(t, ["speechConfig"]);
  if (M != null && l(o, ["speechConfig"], qs(M)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const F = s(t, ["thinkingConfig"]);
  F != null && l(o, ["thinkingConfig"], F);
  const H = s(t, ["imageConfig"]);
  H != null && l(o, ["imageConfig"], Fy(H));
  const ue = s(t, ["enableEnhancedCivicAnswers"]);
  if (ue != null && l(o, ["enableEnhancedCivicAnswers"], ue), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const z = s(t, ["serviceTier"]);
  return n !== void 0 && z != null && l(n, ["serviceTier"], z), o;
}
function ky(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["candidates"]);
  if (o != null) {
    let d = o;
    Array.isArray(d) && (d = d.map((h) => my(h))), l(t, ["candidates"], d);
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
function Dy(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], fn(e, o)), n;
}
function $y(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], fn(e, o)), n;
}
function Ly(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], iy(n));
  const o = s(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function Uy(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function Fy(e) {
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
function Oy(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["request", "model"], V(e, o));
  const r = s(t, ["contents"]);
  if (r != null) {
    let u = ye(r);
    Array.isArray(u) && (u = u.map((c) => _f(c))), l(n, ["request", "contents"], u);
  }
  const i = s(t, ["metadata"]);
  i != null && l(n, ["metadata"], i);
  const a = s(t, ["config"]);
  return a != null && l(n, ["request", "generationConfig"], Ny(e, a, s(n, ["request"], {}))), n;
}
function Gy(e) {
  const t = {}, n = s(e, ["response"]);
  n != null && l(t, ["response"], ky(n));
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["error"]);
  return r != null && l(t, ["error"], r), t;
}
function By(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  if (t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), s(e, ["filter"]) !== void 0) throw new Error("filter parameter is not supported in Gemini API.");
  return n;
}
function qy(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  t !== void 0 && r != null && l(t, ["_query", "pageToken"], r);
  const i = s(e, ["filter"]);
  return t !== void 0 && i != null && l(t, ["_query", "filter"], i), n;
}
function Hy(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && By(n, t), t;
}
function Vy(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && qy(n, t), t;
}
function Jy(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["operations"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => nr(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Ky(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["nextPageToken"]);
  o != null && l(t, ["nextPageToken"], o);
  const r = s(e, ["batchPredictionJobs"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => Hi(a))), l(t, ["batchJobs"], i);
  }
  return t;
}
function Wy(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], Py(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], My(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], fy(c));
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
function zy(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function Yy(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = s(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], xy(o));
  const r = s(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function Xy(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = s(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], Uy(r));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], Ly(i));
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
var rt;
(function(e) {
  e.PAGED_ITEM_BATCH_JOBS = "batchJobs", e.PAGED_ITEM_MODELS = "models", e.PAGED_ITEM_TUNING_JOBS = "tuningJobs", e.PAGED_ITEM_FILES = "files", e.PAGED_ITEM_CACHED_CONTENTS = "cachedContents", e.PAGED_ITEM_FILE_SEARCH_STORES = "fileSearchStores", e.PAGED_ITEM_DOCUMENTS = "documents";
})(rt || (rt = {}));
var Ot = class {
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
}, Qy = class extends it {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ot(rt.PAGED_ITEM_BATCH_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.create = async (t) => (this.apiClient.isVertexAI() && (t.config = this.formatDestination(t.src, t.config)), this.createInternal(t)), this.createEmbeddings = async (t) => {
      if (console.warn("batches.createEmbeddings() is experimental and may change without notice."), this.apiClient.isVertexAI()) throw new Error("Vertex AI does not support batches.createEmbeddings.");
      return this.createEmbeddingsInternal(t);
    };
  }
  createInlinedGenerateContentRequest(e) {
    const t = Ru(this.apiClient, e), n = t._url, o = x("{model}:batchGenerateContent", n), r = t.batch.inputConfig.requests, i = r.requests, a = [];
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
      const c = vy(this.apiClient, e);
      return a = x("batchPredictionJobs", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Hi(d));
    } else {
      const c = Ru(this.apiClient, e);
      return a = x("{model}:batchGenerateContent", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => nr(d));
    }
  }
  async createEmbeddingsInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Ty(this.apiClient, e);
      return r = x("{model}:asyncBatchEmbedContent", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => nr(u));
    }
  }
  async get(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $y(this.apiClient, e);
      return a = x("batchPredictionJobs/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Hi(d));
    } else {
      const c = Dy(this.apiClient, e);
      return a = x("batches/{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => nr(d));
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i = "", a = {};
    if (this.apiClient.isVertexAI()) {
      const u = py(this.apiClient, e);
      i = x("batchPredictionJobs/{name}:cancel", u._url), a = u._query, delete u._url, delete u._query, await this.apiClient.request({
        path: i,
        queryParams: a,
        body: JSON.stringify(u),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      });
    } else {
      const u = hy(this.apiClient, e);
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
      const c = Vy(e);
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
        const h = Ky(d), f = new Iu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Hy(e);
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
        const h = Jy(d), f = new Iu();
        return Object.assign(f, h), f;
      });
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = Ey(this.apiClient, e);
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
      })), i.then((d) => wy(d));
    } else {
      const c = Sy(this.apiClient, e);
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
      })), i.then((d) => Iy(d));
    }
  }
};
function Zy(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function jy(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Pu(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Sv(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Mu(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => Ev(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function ev(e, t) {
  const n = {}, o = s(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = s(e, ["expireTime"]);
  t !== void 0 && r != null && l(t, ["expireTime"], r);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let h = ye(a);
    Array.isArray(h) && (h = h.map((f) => Pu(f))), l(t, ["contents"], h);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Pu(ie(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let h = c;
    Array.isArray(h) && (h = h.map((f) => Cv(f))), l(t, ["tools"], h);
  }
  const d = s(e, ["toolConfig"]);
  if (t !== void 0 && d != null && l(t, ["toolConfig"], Iv(d)), s(e, ["kmsKeyName"]) !== void 0) throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  return n;
}
function tv(e, t) {
  const n = {}, o = s(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = s(e, ["expireTime"]);
  t !== void 0 && r != null && l(t, ["expireTime"], r);
  const i = s(e, ["displayName"]);
  t !== void 0 && i != null && l(t, ["displayName"], i);
  const a = s(e, ["contents"]);
  if (t !== void 0 && a != null) {
    let f = ye(a);
    Array.isArray(f) && (f = f.map((p) => Mu(p))), l(t, ["contents"], f);
  }
  const u = s(e, ["systemInstruction"]);
  t !== void 0 && u != null && l(t, ["systemInstruction"], Mu(ie(u)));
  const c = s(e, ["tools"]);
  if (t !== void 0 && c != null) {
    let f = c;
    Array.isArray(f) && (f = f.map((p) => bv(p))), l(t, ["tools"], f);
  }
  const d = s(e, ["toolConfig"]);
  t !== void 0 && d != null && l(t, ["toolConfig"], wv(d));
  const h = s(e, ["kmsKeyName"]);
  return t !== void 0 && h != null && l(t, ["encryption_spec", "kmsKeyName"], h), n;
}
function nv(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["model"], rf(e, o));
  const r = s(t, ["config"]);
  return r != null && ev(r, n), n;
}
function ov(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["model"], rf(e, o));
  const r = s(t, ["config"]);
  return r != null && tv(r, n), n;
}
function rv(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], st(e, o)), n;
}
function iv(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], st(e, o)), n;
}
function sv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function av(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function lv(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function uv(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = s(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = s(e, ["name"]);
  if (r != null && l(t, ["name"], r), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function cv(e) {
  const t = {}, n = s(e, ["allowedFunctionNames"]);
  n != null && l(t, ["allowedFunctionNames"], n);
  const o = s(e, ["mode"]);
  if (o != null && l(t, ["mode"], o), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return t;
}
function dv(e) {
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
function fv(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], st(e, o)), n;
}
function hv(e, t) {
  const n = {}, o = s(t, ["name"]);
  return o != null && l(n, ["_url", "name"], st(e, o)), n;
}
function pv(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], Zy(n));
  const o = s(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function mv(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function gv(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function _v(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function yv(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && gv(n, t), t;
}
function vv(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && _v(n, t), t;
}
function Av(e) {
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
function Tv(e) {
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
function Sv(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], lv(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], uv(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], jy(c));
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
function Ev(e) {
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
function Iv(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = s(e, ["functionCallingConfig"]);
  o != null && l(t, ["functionCallingConfig"], cv(o));
  const r = s(e, ["includeServerSideToolInvocations"]);
  return r != null && l(t, ["includeServerSideToolInvocations"], r), t;
}
function wv(e) {
  const t = {}, n = s(e, ["retrievalConfig"]);
  n != null && l(t, ["retrievalConfig"], n);
  const o = s(e, ["functionCallingConfig"]);
  if (o != null && l(t, ["functionCallingConfig"], o), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return t;
}
function Cv(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = s(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], mv(r));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], pv(i));
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
function bv(e) {
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
function Rv(e, t) {
  const n = {}, o = s(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = s(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function Pv(e, t) {
  const n = {}, o = s(e, ["ttl"]);
  t !== void 0 && o != null && l(t, ["ttl"], o);
  const r = s(e, ["expireTime"]);
  return t !== void 0 && r != null && l(t, ["expireTime"], r), n;
}
function Mv(e, t) {
  const n = {}, o = s(t, ["name"]);
  o != null && l(n, ["_url", "name"], st(e, o));
  const r = s(t, ["config"]);
  return r != null && Rv(r, n), n;
}
function xv(e, t) {
  const n = {}, o = s(t, ["name"]);
  o != null && l(n, ["_url", "name"], st(e, o));
  const r = s(t, ["config"]);
  return r != null && Pv(r, n), n;
}
var Nv = class extends it {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ot(rt.PAGED_ITEM_CACHED_CONTENTS, (n) => this.listInternal(n), await this.listInternal(t), t);
  }
  async create(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ov(this.apiClient, e);
      return a = x("cachedContents", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = nv(this.apiClient, e);
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
      const c = hv(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = fv(this.apiClient, e);
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
      const c = iv(this.apiClient, e);
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
        const h = av(d), f = new Su();
        return Object.assign(f, h), f;
      });
    } else {
      const c = rv(this.apiClient, e);
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
        const h = sv(d), f = new Su();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = xv(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => d);
    } else {
      const c = Mv(this.apiClient, e);
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
      const c = vv(e);
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
        const h = Tv(d), f = new Eu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = yv(e);
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
        const h = Av(d), f = new Eu();
        return Object.assign(f, h), f;
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
function xu(e) {
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
function He(e, t, n) {
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
function Ve(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = e[Symbol.asyncIterator], n;
  return t ? t.call(e) : (e = typeof xu == "function" ? xu(e) : e[Symbol.iterator](), n = {}, o("next"), o("throw"), o("return"), n[Symbol.asyncIterator] = function() {
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
function kv(e) {
  var t;
  if (e.candidates == null || e.candidates.length === 0) return !1;
  const n = (t = e.candidates[0]) === null || t === void 0 ? void 0 : t.content;
  return n === void 0 ? !1 : yf(n);
}
function yf(e) {
  if (e.parts === void 0 || e.parts.length === 0) return !1;
  for (const t of e.parts) if (t === void 0 || Object.keys(t).length === 0) return !1;
  return !0;
}
function Dv(e) {
  if (e.length !== 0) {
    for (const t of e) if (t.role !== "user" && t.role !== "model") throw new Error(`Role must be user or model, but got ${t.role}.`);
  }
}
function Nu(e) {
  if (e === void 0 || e.length === 0) return [];
  const t = [], n = e.length;
  let o = 0;
  for (; o < n; ) if (e[o].role === "user")
    t.push(e[o]), o++;
  else {
    const r = [];
    let i = !0;
    for (; o < n && e[o].role === "model"; )
      r.push(e[o]), i && !yf(e[o]) && (i = !1), o++;
    i ? t.push(...r) : t.pop();
  }
  return t;
}
var $v = class {
  constructor(e, t) {
    this.modelsModule = e, this.apiClient = t;
  }
  create(e) {
    return new Lv(this.apiClient, this.modelsModule, e.model, e.config, structuredClone(e.history));
  }
}, Lv = class {
  constructor(e, t, n, o = {}, r = []) {
    this.apiClient = e, this.modelsModule = t, this.model = n, this.config = o, this.history = r, this.sendPromise = Promise.resolve(), Dv(r);
  }
  async sendMessage(e) {
    var t;
    await this.sendPromise;
    const n = ie(e.message), o = this.modelsModule.generateContent({
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
    const n = ie(e.message), o = this.modelsModule.generateContentStream({
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
    const t = e ? Nu(this.history) : this.history;
    return structuredClone(t);
  }
  processStreamResponse(e, t) {
    return He(this, arguments, function* () {
      var o, r, i, a, u, c;
      const d = [];
      try {
        for (var h = !0, f = Ve(e), p; p = yield B(f.next()), o = p.done, !o; h = !0) {
          a = p.value, h = !1;
          const m = a;
          if (kv(m)) {
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
    }), n && n.length > 0 ? this.history.push(...Nu(n)) : this.history.push(e), this.history.push(...o);
  }
}, vf = class Af extends Error {
  constructor(t) {
    super(t.message), this.name = "ApiError", this.status = t.status, Object.setPrototypeOf(this, Af.prototype);
  }
};
function Uv(e) {
  const t = {}, n = s(e, ["file"]);
  return n != null && l(t, ["file"], n), t;
}
function Fv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Ov(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], df(n)), t;
}
function Gv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
function Bv(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "file"], df(n)), t;
}
function qv(e) {
  const t = {}, n = s(e, ["uris"]);
  return n != null && l(t, ["uris"], n), t;
}
function Hv(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function Vv(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && Hv(n, t), t;
}
function Jv(e) {
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
function Kv(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["files"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(t, ["files"], r);
  }
  return t;
}
var Wv = class extends it {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ot(rt.PAGED_ITEM_FILES, (n) => this.listInternal(n), await this.listInternal(t), t);
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
      const a = Vv(e);
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
        const c = Jv(u), d = new q_();
        return Object.assign(d, c), d;
      });
    }
  }
  async createInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Uv(e);
      return r = x("upload/v1beta/files", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = Fv(u), d = new H_();
        return Object.assign(d, c), d;
      });
    }
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = Bv(e);
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
      const a = Ov(e);
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
        const c = Gv(u), d = new V_();
        return Object.assign(d, c), d;
      });
    }
  }
  async registerFilesInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = qv(e);
      return r = x("files:register", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = Kv(u), d = new J_();
        return Object.assign(d, c), d;
      });
    }
  }
};
function ku(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function zv(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function or(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Yv(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => fA(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Xv(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => hA(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function Qv(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function Zv(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = s(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = s(e, ["name"]);
  if (r != null && l(t, ["name"], r), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function jv(e) {
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
function eA(e) {
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
function tA(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], zv(n));
  const o = s(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function nA(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function oA(e, t) {
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
  ], Hs(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Yv(ie(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let w = dn(_);
    Array.isArray(w) && (w = w.map((M) => gA(cn(M)))), l(t, ["setup", "tools"], w);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], mA(y));
  const S = s(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], ku(S));
  const I = s(e, ["outputAudioTranscription"]);
  t !== void 0 && I != null && l(t, ["setup", "outputAudioTranscription"], ku(I));
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
    Array.isArray(w) && (w = w.map((M) => pA(M))), l(t, ["setup", "safetySettings"], w);
  }
  return n;
}
function rA(e, t) {
  const n = {}, o = s(e, ["generationConfig"]);
  t !== void 0 && o != null && l(t, ["setup", "generationConfig"], eA(o));
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
  ], Hs(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], Xv(ie(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let M = dn(_);
    Array.isArray(M) && (M = M.map((F) => _A(cn(F)))), l(t, ["setup", "tools"], M);
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
function iA(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["setup", "model"], V(e, o));
  const r = s(t, ["config"]);
  return r != null && l(n, ["config"], oA(r, n)), n;
}
function sA(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["setup", "model"], V(e, o));
  const r = s(t, ["config"]);
  return r != null && l(n, ["config"], rA(r, n)), n;
}
function aA(e) {
  const t = {}, n = s(e, ["musicGenerationConfig"]);
  return n != null && l(t, ["musicGenerationConfig"], n), t;
}
function lA(e) {
  const t = {}, n = s(e, ["weightedPrompts"]);
  if (n != null) {
    let o = n;
    Array.isArray(o) && (o = o.map((r) => r)), l(t, ["weightedPrompts"], o);
  }
  return t;
}
function uA(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = sf(n);
    Array.isArray(d) && (d = d.map((h) => or(h))), l(t, ["mediaChunks"], d);
  }
  const o = s(e, ["audio"]);
  o != null && l(t, ["audio"], or(lf(o)));
  const r = s(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], or(af(i)));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function cA(e) {
  const t = {}, n = s(e, ["media"]);
  if (n != null) {
    let d = sf(n);
    Array.isArray(d) && (d = d.map((h) => h)), l(t, ["mediaChunks"], d);
  }
  const o = s(e, ["audio"]);
  o != null && l(t, ["audio"], lf(o));
  const r = s(e, ["audioStreamEnd"]);
  r != null && l(t, ["audioStreamEnd"], r);
  const i = s(e, ["video"]);
  i != null && l(t, ["video"], af(i));
  const a = s(e, ["text"]);
  a != null && l(t, ["text"], a);
  const u = s(e, ["activityStart"]);
  u != null && l(t, ["activityStart"], u);
  const c = s(e, ["activityEnd"]);
  return c != null && l(t, ["activityEnd"], c), t;
}
function dA(e) {
  const t = {}, n = s(e, ["setupComplete"]);
  n != null && l(t, ["setupComplete"], n);
  const o = s(e, ["serverContent"]);
  o != null && l(t, ["serverContent"], o);
  const r = s(e, ["toolCall"]);
  r != null && l(t, ["toolCall"], r);
  const i = s(e, ["toolCallCancellation"]);
  i != null && l(t, ["toolCallCancellation"], i);
  const a = s(e, ["usageMetadata"]);
  a != null && l(t, ["usageMetadata"], yA(a));
  const u = s(e, ["goAway"]);
  u != null && l(t, ["goAway"], u);
  const c = s(e, ["sessionResumptionUpdate"]);
  c != null && l(t, ["sessionResumptionUpdate"], c);
  const d = s(e, ["voiceActivityDetectionSignal"]);
  d != null && l(t, ["voiceActivityDetectionSignal"], d);
  const h = s(e, ["voiceActivity"]);
  return h != null && l(t, ["voiceActivity"], vA(h)), t;
}
function fA(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], Qv(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], Zv(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], or(c));
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
function hA(e) {
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
function pA(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function mA(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function gA(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = s(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], nA(r));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], tA(i));
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
function _A(e) {
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
    Array.isArray(p) && (p = p.map((m) => jv(m))), l(t, ["functionDeclarations"], p);
  }
  const d = s(e, ["googleSearchRetrieval"]);
  d != null && l(t, ["googleSearchRetrieval"], d);
  const h = s(e, ["parallelAiSearch"]);
  h != null && l(t, ["parallelAiSearch"], h);
  const f = s(e, ["urlContext"]);
  if (f != null && l(t, ["urlContext"], f), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return t;
}
function yA(e) {
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
function vA(e) {
  const t = {}, n = s(e, ["type"]);
  return n != null && l(t, ["voiceActivityType"], n), t;
}
function AA(e, t) {
  const n = {}, o = s(e, ["apiKey"]);
  if (o != null && l(n, ["apiKey"], o), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return n;
}
function TA(e, t) {
  const n = {}, o = s(e, ["data"]);
  if (o != null && l(n, ["data"], o), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const r = s(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function SA(e, t) {
  const n = {}, o = s(e, ["content"]);
  o != null && l(n, ["content"], o);
  const r = s(e, ["citationMetadata"]);
  r != null && l(n, ["citationMetadata"], EA(r));
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
function EA(e, t) {
  const n = {}, o = s(e, ["citationSources"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => i)), l(n, ["citations"], r);
  }
  return n;
}
function IA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let a = ye(i);
    Array.isArray(a) && (a = a.map((u) => hn(u))), l(o, ["contents"], a);
  }
  return o;
}
function wA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["tokensInfo"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["tokensInfo"], i);
  }
  return n;
}
function CA(e, t) {
  const n = {}, o = s(e, ["values"]);
  o != null && l(n, ["values"], o);
  const r = s(e, ["statistics"]);
  return r != null && l(n, ["statistics"], bA(r)), n;
}
function bA(e, t) {
  const n = {}, o = s(e, ["truncated"]);
  o != null && l(n, ["truncated"], o);
  const r = s(e, ["token_count"]);
  return r != null && l(n, ["tokenCount"], r), n;
}
function vo(e, t) {
  const n = {}, o = s(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => LT(a))), l(n, ["parts"], i);
  }
  const r = s(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function hn(e, t) {
  const n = {}, o = s(e, ["parts"]);
  if (o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => UT(a))), l(n, ["parts"], i);
  }
  const r = s(e, ["role"]);
  return r != null && l(n, ["role"], r), n;
}
function RA(e, t) {
  const n = {}, o = s(e, ["controlType"]);
  o != null && l(n, ["controlType"], o);
  const r = s(e, ["enableControlImageComputation"]);
  return r != null && l(n, ["computeControl"], r), n;
}
function PA(e, t) {
  const n = {};
  if (s(e, ["systemInstruction"]) !== void 0) throw new Error("systemInstruction parameter is not supported in Gemini API.");
  if (s(e, ["tools"]) !== void 0) throw new Error("tools parameter is not supported in Gemini API.");
  if (s(e, ["generationConfig"]) !== void 0) throw new Error("generationConfig parameter is not supported in Gemini API.");
  return n;
}
function MA(e, t, n) {
  const o = {}, r = s(e, ["systemInstruction"]);
  t !== void 0 && r != null && l(t, ["systemInstruction"], hn(ie(r)));
  const i = s(e, ["tools"]);
  if (t !== void 0 && i != null) {
    let u = i;
    Array.isArray(u) && (u = u.map((c) => If(c))), l(t, ["tools"], u);
  }
  const a = s(e, ["generationConfig"]);
  return t !== void 0 && a != null && l(t, ["generationConfig"], TT(a)), o;
}
function xA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = ye(i);
    Array.isArray(u) && (u = u.map((c) => vo(c))), l(o, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && PA(a), o;
}
function NA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = ye(i);
    Array.isArray(u) && (u = u.map((c) => hn(c))), l(o, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && MA(a, o), o;
}
function kA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["totalTokens"]);
  r != null && l(n, ["totalTokens"], r);
  const i = s(e, ["cachedContentTokenCount"]);
  return i != null && l(n, ["cachedContentTokenCount"], i), n;
}
function DA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["totalTokens"]);
  return r != null && l(n, ["totalTokens"], r), n;
}
function $A(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function LA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function UA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function FA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function OA(e, t, n) {
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
function GA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["referenceImages"]);
  if (a != null) {
    let c = a;
    Array.isArray(c) && (c = c.map((d) => HT(d))), l(o, ["instances[0]", "referenceImages"], c);
  }
  const u = s(t, ["config"]);
  return u != null && OA(u, o), o;
}
function BA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => Fr(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function qA(e, t, n) {
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
function HA(e, t, n) {
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
function VA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let d = Gs(e, i);
    Array.isArray(d) && (d = d.map((h) => h)), l(o, ["requests[]", "content"], d);
  }
  const a = s(t, ["content"]);
  a != null && vo(ie(a));
  const u = s(t, ["config"]);
  u != null && qA(u, o);
  const c = s(t, ["model"]);
  return c !== void 0 && l(o, ["requests[]", "model"], V(e, c)), o;
}
function JA(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  let i = s(n, ["embeddingApiType"]);
  if (i === void 0 && (i = "PREDICT"), i === "PREDICT") {
    const c = s(t, ["contents"]);
    if (c != null) {
      let d = Gs(e, c);
      Array.isArray(d) && (d = d.map((h) => h)), l(o, ["instances[]", "content"], d);
    }
  }
  let a = s(n, ["embeddingApiType"]);
  if (a === void 0 && (a = "PREDICT"), a === "EMBED_CONTENT") {
    const c = s(t, ["content"]);
    c != null && l(o, ["content"], hn(ie(c)));
  }
  const u = s(t, ["config"]);
  return u != null && HA(u, o, n), o;
}
function KA(e, t) {
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
function WA(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions[]", "embeddings"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => CA(u))), l(n, ["embeddings"], a);
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
function zA(e, t) {
  const n = {}, o = s(e, ["endpoint"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["deployedModelId"]);
  return r != null && l(n, ["deployedModelId"], r), n;
}
function YA(e, t) {
  const n = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["fileUri"]);
  o != null && l(n, ["fileUri"], o);
  const r = s(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function XA(e, t) {
  const n = {}, o = s(e, ["id"]);
  o != null && l(n, ["id"], o);
  const r = s(e, ["args"]);
  r != null && l(n, ["args"], r);
  const i = s(e, ["name"]);
  if (i != null && l(n, ["name"], i), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return n;
}
function QA(e, t) {
  const n = {}, o = s(e, ["allowedFunctionNames"]);
  o != null && l(n, ["allowedFunctionNames"], o);
  const r = s(e, ["mode"]);
  if (r != null && l(n, ["mode"], r), s(e, ["streamFunctionCallArguments"]) !== void 0) throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  return n;
}
function ZA(e, t) {
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
function jA(e, t, n, o) {
  const r = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], vo(ie(i)));
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
  I != null && l(r, ["responseSchema"], Bs(I));
  const b = s(t, ["responseJsonSchema"]);
  if (b != null && l(r, ["responseJsonSchema"], b), s(t, ["routingConfig"]) !== void 0) throw new Error("routingConfig parameter is not supported in Gemini API.");
  if (s(t, ["modelSelectionConfig"]) !== void 0) throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  const P = s(t, ["safetySettings"]);
  if (n !== void 0 && P != null) {
    let K = P;
    Array.isArray(K) && (K = K.map((me) => VT(me))), l(n, ["safetySettings"], K);
  }
  const D = s(t, ["tools"]);
  if (n !== void 0 && D != null) {
    let K = dn(D);
    Array.isArray(K) && (K = K.map((me) => ZT(cn(me)))), l(n, ["tools"], K);
  }
  const E = s(t, ["toolConfig"]);
  if (n !== void 0 && E != null && l(n, ["toolConfig"], XT(E)), s(t, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const L = s(t, ["cachedContent"]);
  n !== void 0 && L != null && l(n, ["cachedContent"], st(e, L));
  const w = s(t, ["responseModalities"]);
  w != null && l(r, ["responseModalities"], w);
  const M = s(t, ["mediaResolution"]);
  M != null && l(r, ["mediaResolution"], M);
  const F = s(t, ["speechConfig"]);
  if (F != null && l(r, ["speechConfig"], qs(F)), s(t, ["audioTimestamp"]) !== void 0) throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  const H = s(t, ["thinkingConfig"]);
  H != null && l(r, ["thinkingConfig"], H);
  const ue = s(t, ["imageConfig"]);
  ue != null && l(r, ["imageConfig"], CT(ue));
  const z = s(t, ["enableEnhancedCivicAnswers"]);
  if (z != null && l(r, ["enableEnhancedCivicAnswers"], z), s(t, ["modelArmorConfig"]) !== void 0) throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  const W = s(t, ["serviceTier"]);
  return n !== void 0 && W != null && l(n, ["serviceTier"], W), r;
}
function eT(e, t, n, o) {
  const r = {}, i = s(t, ["systemInstruction"]);
  n !== void 0 && i != null && l(n, ["systemInstruction"], hn(ie(i)));
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
  I != null && l(r, ["responseSchema"], Bs(I));
  const b = s(t, ["responseJsonSchema"]);
  b != null && l(r, ["responseJsonSchema"], b);
  const P = s(t, ["routingConfig"]);
  P != null && l(r, ["routingConfig"], P);
  const D = s(t, ["modelSelectionConfig"]);
  D != null && l(r, ["modelConfig"], D);
  const E = s(t, ["safetySettings"]);
  if (n !== void 0 && E != null) {
    let Le = E;
    Array.isArray(Le) && (Le = Le.map((ei) => ei)), l(n, ["safetySettings"], Le);
  }
  const L = s(t, ["tools"]);
  if (n !== void 0 && L != null) {
    let Le = dn(L);
    Array.isArray(Le) && (Le = Le.map((ei) => If(cn(ei)))), l(n, ["tools"], Le);
  }
  const w = s(t, ["toolConfig"]);
  n !== void 0 && w != null && l(n, ["toolConfig"], QT(w));
  const M = s(t, ["labels"]);
  n !== void 0 && M != null && l(n, ["labels"], M);
  const F = s(t, ["cachedContent"]);
  n !== void 0 && F != null && l(n, ["cachedContent"], st(e, F));
  const H = s(t, ["responseModalities"]);
  H != null && l(r, ["responseModalities"], H);
  const ue = s(t, ["mediaResolution"]);
  ue != null && l(r, ["mediaResolution"], ue);
  const z = s(t, ["speechConfig"]);
  z != null && l(r, ["speechConfig"], qs(z));
  const W = s(t, ["audioTimestamp"]);
  W != null && l(r, ["audioTimestamp"], W);
  const K = s(t, ["thinkingConfig"]);
  K != null && l(r, ["thinkingConfig"], K);
  const me = s(t, ["imageConfig"]);
  if (me != null && l(r, ["imageConfig"], bT(me)), s(t, ["enableEnhancedCivicAnswers"]) !== void 0) throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  const Ye = s(t, ["modelArmorConfig"]);
  n !== void 0 && Ye != null && l(n, ["modelArmorConfig"], Ye);
  const Tt = s(t, ["serviceTier"]);
  return n !== void 0 && Tt != null && l(n, ["serviceTier"], Tt), r;
}
function Du(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = ye(i);
    Array.isArray(u) && (u = u.map((c) => vo(c))), l(o, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(o, ["generationConfig"], jA(e, a, o)), o;
}
function $u(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["contents"]);
  if (i != null) {
    let u = ye(i);
    Array.isArray(u) && (u = u.map((c) => hn(c))), l(o, ["contents"], u);
  }
  const a = s(t, ["config"]);
  return a != null && l(o, ["generationConfig"], eT(e, a, o)), o;
}
function Lu(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["candidates"]);
  if (r != null) {
    let h = r;
    Array.isArray(h) && (h = h.map((f) => SA(f))), l(n, ["candidates"], h);
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
function Uu(e, t) {
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
function tT(e, t, n) {
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
function nT(e, t, n) {
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
function oT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && tT(a, o), o;
}
function rT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["config"]);
  return a != null && nT(a, o), o;
}
function iT(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => _T(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Sf(i)), n;
}
function sT(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions"]);
  if (r != null) {
    let a = r;
    Array.isArray(a) && (a = a.map((u) => Fr(u))), l(n, ["generatedImages"], a);
  }
  const i = s(e, ["positivePromptSafetyAttributes"]);
  return i != null && l(n, ["positivePromptSafetyAttributes"], Ef(i)), n;
}
function aT(e, t, n) {
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
  t !== void 0 && f != null && l(t, ["instances[0]", "lastFrame"], Or(f));
  const p = s(e, ["referenceImages"]);
  if (t !== void 0 && p != null) {
    let g = p;
    Array.isArray(g) && (g = g.map((_) => dS(_))), l(t, ["instances[0]", "referenceImages"], g);
  }
  if (s(e, ["mask"]) !== void 0) throw new Error("mask parameter is not supported in Gemini API.");
  if (s(e, ["compressionQuality"]) !== void 0) throw new Error("compressionQuality parameter is not supported in Gemini API.");
  if (s(e, ["labels"]) !== void 0) throw new Error("labels parameter is not supported in Gemini API.");
  const m = s(e, ["webhookConfig"]);
  return t !== void 0 && m != null && l(t, ["webhookConfig"], m), o;
}
function lT(e, t, n) {
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
  t !== void 0 && y != null && l(t, ["instances[0]", "lastFrame"], Je(y));
  const S = s(e, ["referenceImages"]);
  if (t !== void 0 && S != null) {
    let D = S;
    Array.isArray(D) && (D = D.map((E) => fS(E))), l(t, ["instances[0]", "referenceImages"], D);
  }
  const I = s(e, ["mask"]);
  t !== void 0 && I != null && l(t, ["instances[0]", "mask"], cS(I));
  const b = s(e, ["compressionQuality"]);
  t !== void 0 && b != null && l(t, ["parameters", "compressionQuality"], b);
  const P = s(e, ["labels"]);
  if (t !== void 0 && P != null && l(t, ["labels"], P), s(e, ["webhookConfig"]) !== void 0) throw new Error("webhookConfig parameter is not supported in Vertex AI.");
  return o;
}
function uT(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response", "generateVideoResponse"]);
  return u != null && l(n, ["response"], hT(u)), n;
}
function cT(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["metadata"]);
  r != null && l(n, ["metadata"], r);
  const i = s(e, ["done"]);
  i != null && l(n, ["done"], i);
  const a = s(e, ["error"]);
  a != null && l(n, ["error"], a);
  const u = s(e, ["response"]);
  return u != null && l(n, ["response"], pT(u)), n;
}
function dT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], Or(a));
  const u = s(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], wf(u));
  const c = s(t, ["source"]);
  c != null && mT(c, o);
  const d = s(t, ["config"]);
  return d != null && aT(d, o), o;
}
function fT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["prompt"]);
  i != null && l(o, ["instances[0]", "prompt"], i);
  const a = s(t, ["image"]);
  a != null && l(o, ["instances[0]", "image"], Je(a));
  const u = s(t, ["video"]);
  u != null && l(o, ["instances[0]", "video"], Cf(u));
  const c = s(t, ["source"]);
  c != null && gT(c, o);
  const d = s(t, ["config"]);
  return d != null && lT(d, o), o;
}
function hT(e, t) {
  const n = {}, o = s(e, ["generatedSamples"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => vT(u))), l(n, ["generatedVideos"], a);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function pT(e, t) {
  const n = {}, o = s(e, ["videos"]);
  if (o != null) {
    let a = o;
    Array.isArray(a) && (a = a.map((u) => AT(u))), l(n, ["generatedVideos"], a);
  }
  const r = s(e, ["raiMediaFilteredCount"]);
  r != null && l(n, ["raiMediaFilteredCount"], r);
  const i = s(e, ["raiMediaFilteredReasons"]);
  return i != null && l(n, ["raiMediaFilteredReasons"], i), n;
}
function mT(e, t, n) {
  const o = {}, r = s(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Or(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], wf(a)), o;
}
function gT(e, t, n) {
  const o = {}, r = s(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Je(i));
  const a = s(e, ["video"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "video"], Cf(a)), o;
}
function _T(e, t) {
  const n = {}, o = s(e, ["_self"]);
  o != null && l(n, ["image"], RT(o));
  const r = s(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = s(e, ["_self"]);
  return i != null && l(n, ["safetyAttributes"], Sf(i)), n;
}
function Fr(e, t) {
  const n = {}, o = s(e, ["_self"]);
  o != null && l(n, ["image"], Tf(o));
  const r = s(e, ["raiFilteredReason"]);
  r != null && l(n, ["raiFilteredReason"], r);
  const i = s(e, ["_self"]);
  i != null && l(n, ["safetyAttributes"], Ef(i));
  const a = s(e, ["prompt"]);
  return a != null && l(n, ["enhancedPrompt"], a), n;
}
function yT(e, t) {
  const n = {}, o = s(e, ["_self"]);
  o != null && l(n, ["mask"], Tf(o));
  const r = s(e, ["labels"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => a)), l(n, ["labels"], i);
  }
  return n;
}
function vT(e, t) {
  const n = {}, o = s(e, ["video"]);
  return o != null && l(n, ["video"], lS(o)), n;
}
function AT(e, t) {
  const n = {}, o = s(e, ["_self"]);
  return o != null && l(n, ["video"], uS(o)), n;
}
function TT(e, t) {
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
function ST(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function ET(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  return r != null && l(o, ["_url", "name"], V(e, r)), o;
}
function IT(e, t) {
  const n = {}, o = s(e, ["authConfig"]);
  o != null && l(n, ["authConfig"], AA(o));
  const r = s(e, ["enableWidget"]);
  return r != null && l(n, ["enableWidget"], r), n;
}
function wT(e, t) {
  const n = {}, o = s(e, ["searchTypes"]);
  if (o != null && l(n, ["searchTypes"], o), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const r = s(e, ["timeRangeFilter"]);
  return r != null && l(n, ["timeRangeFilter"], r), n;
}
function CT(e, t) {
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
function bT(e, t) {
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
function RT(e, t) {
  const n = {}, o = s(e, ["bytesBase64Encoded"]);
  o != null && l(n, ["imageBytes"], At(o));
  const r = s(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function Tf(e, t) {
  const n = {}, o = s(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = s(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["imageBytes"], At(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function Or(e, t) {
  const n = {};
  if (s(e, ["gcsUri"]) !== void 0) throw new Error("gcsUri parameter is not supported in Gemini API.");
  const o = s(e, ["imageBytes"]);
  o != null && l(n, ["bytesBase64Encoded"], At(o));
  const r = s(e, ["mimeType"]);
  return r != null && l(n, ["mimeType"], r), n;
}
function Je(e, t) {
  const n = {}, o = s(e, ["gcsUri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = s(e, ["imageBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], At(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function PT(e, t, n, o) {
  const r = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], ff(e, c)), r;
}
function MT(e, t, n, o) {
  const r = {}, i = s(t, ["pageSize"]);
  n !== void 0 && i != null && l(n, ["_query", "pageSize"], i);
  const a = s(t, ["pageToken"]);
  n !== void 0 && a != null && l(n, ["_query", "pageToken"], a);
  const u = s(t, ["filter"]);
  n !== void 0 && u != null && l(n, ["_query", "filter"], u);
  const c = s(t, ["queryBase"]);
  return n !== void 0 && c != null && l(n, ["_url", "models_url"], ff(e, c)), r;
}
function xT(e, t, n) {
  const o = {}, r = s(t, ["config"]);
  return r != null && PT(e, r, o), o;
}
function NT(e, t, n) {
  const o = {}, r = s(t, ["config"]);
  return r != null && MT(e, r, o), o;
}
function kT(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = hf(i);
    Array.isArray(a) && (a = a.map((u) => Vi(u))), l(n, ["models"], a);
  }
  return n;
}
function DT(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = s(e, ["_self"]);
  if (i != null) {
    let a = hf(i);
    Array.isArray(a) && (a = a.map((u) => Ji(u))), l(n, ["models"], a);
  }
  return n;
}
function $T(e, t) {
  const n = {}, o = s(e, ["maskMode"]);
  o != null && l(n, ["maskMode"], o);
  const r = s(e, ["segmentationClasses"]);
  r != null && l(n, ["maskClasses"], r);
  const i = s(e, ["maskDilation"]);
  return i != null && l(n, ["dilation"], i), n;
}
function Vi(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["name"], o);
  const r = s(e, ["displayName"]);
  r != null && l(n, ["displayName"], r);
  const i = s(e, ["description"]);
  i != null && l(n, ["description"], i);
  const a = s(e, ["version"]);
  a != null && l(n, ["version"], a);
  const u = s(e, ["_self"]);
  u != null && l(n, ["tunedModelInfo"], jT(u));
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
function Ji(e, t) {
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
    Array.isArray(p) && (p = p.map((m) => zA(m))), l(n, ["endpoints"], p);
  }
  const c = s(e, ["labels"]);
  c != null && l(n, ["labels"], c);
  const d = s(e, ["_self"]);
  d != null && l(n, ["tunedModelInfo"], eS(d));
  const h = s(e, ["defaultCheckpointId"]);
  h != null && l(n, ["defaultCheckpointId"], h);
  const f = s(e, ["checkpoints"]);
  if (f != null) {
    let p = f;
    Array.isArray(p) && (p = p.map((m) => m)), l(n, ["checkpoints"], p);
  }
  return n;
}
function LT(e, t) {
  const n = {}, o = s(e, ["mediaResolution"]);
  o != null && l(n, ["mediaResolution"], o);
  const r = s(e, ["codeExecutionResult"]);
  r != null && l(n, ["codeExecutionResult"], r);
  const i = s(e, ["executableCode"]);
  i != null && l(n, ["executableCode"], i);
  const a = s(e, ["fileData"]);
  a != null && l(n, ["fileData"], YA(a));
  const u = s(e, ["functionCall"]);
  u != null && l(n, ["functionCall"], XA(u));
  const c = s(e, ["functionResponse"]);
  c != null && l(n, ["functionResponse"], c);
  const d = s(e, ["inlineData"]);
  d != null && l(n, ["inlineData"], TA(d));
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
function UT(e, t) {
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
function FT(e, t) {
  const n = {}, o = s(e, ["productImage"]);
  return o != null && l(n, ["image"], Je(o)), n;
}
function OT(e, t, n) {
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
function GT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["source"]);
  i != null && qT(i, o);
  const a = s(t, ["config"]);
  return a != null && OT(a, o), o;
}
function BT(e, t) {
  const n = {}, o = s(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => Fr(i))), l(n, ["generatedImages"], r);
  }
  return n;
}
function qT(e, t, n) {
  const o = {}, r = s(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = s(e, ["personImage"]);
  t !== void 0 && i != null && l(t, [
    "instances[0]",
    "personImage",
    "image"
  ], Je(i));
  const a = s(e, ["productImages"]);
  if (t !== void 0 && a != null) {
    let u = a;
    Array.isArray(u) && (u = u.map((c) => FT(c))), l(t, ["instances[0]", "productImages"], u);
  }
  return o;
}
function HT(e, t) {
  const n = {}, o = s(e, ["referenceImage"]);
  o != null && l(n, ["referenceImage"], Je(o));
  const r = s(e, ["referenceId"]);
  r != null && l(n, ["referenceId"], r);
  const i = s(e, ["referenceType"]);
  i != null && l(n, ["referenceType"], i);
  const a = s(e, ["maskImageConfig"]);
  a != null && l(n, ["maskImageConfig"], $T(a));
  const u = s(e, ["controlImageConfig"]);
  u != null && l(n, ["controlImageConfig"], RA(u));
  const c = s(e, ["styleImageConfig"]);
  c != null && l(n, ["styleImageConfig"], c);
  const d = s(e, ["subjectImageConfig"]);
  return d != null && l(n, ["subjectImageConfig"], d), n;
}
function Sf(e, t) {
  const n = {}, o = s(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = s(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function Ef(e, t) {
  const n = {}, o = s(e, ["safetyAttributes", "categories"]);
  o != null && l(n, ["categories"], o);
  const r = s(e, ["safetyAttributes", "scores"]);
  r != null && l(n, ["scores"], r);
  const i = s(e, ["contentType"]);
  return i != null && l(n, ["contentType"], i), n;
}
function VT(e, t) {
  const n = {}, o = s(e, ["category"]);
  if (o != null && l(n, ["category"], o), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const r = s(e, ["threshold"]);
  return r != null && l(n, ["threshold"], r), n;
}
function JT(e, t) {
  const n = {}, o = s(e, ["image"]);
  return o != null && l(n, ["image"], Je(o)), n;
}
function KT(e, t, n) {
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
function WT(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["source"]);
  i != null && YT(i, o);
  const a = s(t, ["config"]);
  return a != null && KT(a, o), o;
}
function zT(e, t) {
  const n = {}, o = s(e, ["predictions"]);
  if (o != null) {
    let r = o;
    Array.isArray(r) && (r = r.map((i) => yT(i))), l(n, ["generatedMasks"], r);
  }
  return n;
}
function YT(e, t, n) {
  const o = {}, r = s(e, ["prompt"]);
  t !== void 0 && r != null && l(t, ["instances[0]", "prompt"], r);
  const i = s(e, ["image"]);
  t !== void 0 && i != null && l(t, ["instances[0]", "image"], Je(i));
  const a = s(e, ["scribbleImage"]);
  return t !== void 0 && a != null && l(t, ["instances[0]", "scribble"], JT(a)), o;
}
function XT(e, t) {
  const n = {}, o = s(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = s(e, ["functionCallingConfig"]);
  r != null && l(n, ["functionCallingConfig"], QA(r));
  const i = s(e, ["includeServerSideToolInvocations"]);
  return i != null && l(n, ["includeServerSideToolInvocations"], i), n;
}
function QT(e, t) {
  const n = {}, o = s(e, ["retrievalConfig"]);
  o != null && l(n, ["retrievalConfig"], o);
  const r = s(e, ["functionCallingConfig"]);
  if (r != null && l(n, ["functionCallingConfig"], r), s(e, ["includeServerSideToolInvocations"]) !== void 0) throw new Error("includeServerSideToolInvocations parameter is not supported in Vertex AI.");
  return n;
}
function ZT(e, t) {
  const n = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const o = s(e, ["computerUse"]);
  o != null && l(n, ["computerUse"], o);
  const r = s(e, ["fileSearch"]);
  r != null && l(n, ["fileSearch"], r);
  const i = s(e, ["googleSearch"]);
  i != null && l(n, ["googleSearch"], wT(i));
  const a = s(e, ["googleMaps"]);
  a != null && l(n, ["googleMaps"], IT(a));
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
function If(e, t) {
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
    Array.isArray(m) && (m = m.map((g) => ZA(g))), l(n, ["functionDeclarations"], m);
  }
  const h = s(e, ["googleSearchRetrieval"]);
  h != null && l(n, ["googleSearchRetrieval"], h);
  const f = s(e, ["parallelAiSearch"]);
  f != null && l(n, ["parallelAiSearch"], f);
  const p = s(e, ["urlContext"]);
  if (p != null && l(n, ["urlContext"], p), s(e, ["mcpServers"]) !== void 0) throw new Error("mcpServers parameter is not supported in Vertex AI.");
  return n;
}
function jT(e, t) {
  const n = {}, o = s(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = s(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function eS(e, t) {
  const n = {}, o = s(e, ["labels", "google-vertex-llm-tuning-base-model-id"]);
  o != null && l(n, ["baseModel"], o);
  const r = s(e, ["createTime"]);
  r != null && l(n, ["createTime"], r);
  const i = s(e, ["updateTime"]);
  return i != null && l(n, ["updateTime"], i), n;
}
function tS(e, t, n) {
  const o = {}, r = s(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function nS(e, t, n) {
  const o = {}, r = s(e, ["displayName"]);
  t !== void 0 && r != null && l(t, ["displayName"], r);
  const i = s(e, ["description"]);
  t !== void 0 && i != null && l(t, ["description"], i);
  const a = s(e, ["defaultCheckpointId"]);
  return t !== void 0 && a != null && l(t, ["defaultCheckpointId"], a), o;
}
function oS(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "name"], V(e, r));
  const i = s(t, ["config"]);
  return i != null && tS(i, o), o;
}
function rS(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["config"]);
  return i != null && nS(i, o), o;
}
function iS(e, t, n) {
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
function sS(e, t, n) {
  const o = {}, r = s(t, ["model"]);
  r != null && l(o, ["_url", "model"], V(e, r));
  const i = s(t, ["image"]);
  i != null && l(o, ["instances[0]", "image"], Je(i));
  const a = s(t, ["upscaleFactor"]);
  a != null && l(o, [
    "parameters",
    "upscaleConfig",
    "upscaleFactor"
  ], a);
  const u = s(t, ["config"]);
  return u != null && iS(u, o), o;
}
function aS(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["predictions"]);
  if (r != null) {
    let i = r;
    Array.isArray(i) && (i = i.map((a) => Fr(a))), l(n, ["generatedImages"], i);
  }
  return n;
}
function lS(e, t) {
  const n = {}, o = s(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = s(e, ["encodedVideo"]);
  r != null && l(n, ["videoBytes"], At(r));
  const i = s(e, ["encoding"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function uS(e, t) {
  const n = {}, o = s(e, ["gcsUri"]);
  o != null && l(n, ["uri"], o);
  const r = s(e, ["bytesBase64Encoded"]);
  r != null && l(n, ["videoBytes"], At(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function cS(e, t) {
  const n = {}, o = s(e, ["image"]);
  o != null && l(n, ["_self"], Je(o));
  const r = s(e, ["maskMode"]);
  return r != null && l(n, ["maskMode"], r), n;
}
function dS(e, t) {
  const n = {}, o = s(e, ["image"]);
  o != null && l(n, ["image"], Or(o));
  const r = s(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function fS(e, t) {
  const n = {}, o = s(e, ["image"]);
  o != null && l(n, ["image"], Je(o));
  const r = s(e, ["referenceType"]);
  return r != null && l(n, ["referenceType"], r), n;
}
function wf(e, t) {
  const n = {}, o = s(e, ["uri"]);
  o != null && l(n, ["uri"], o);
  const r = s(e, ["videoBytes"]);
  r != null && l(n, ["encodedVideo"], At(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["encoding"], i), n;
}
function Cf(e, t) {
  const n = {}, o = s(e, ["uri"]);
  o != null && l(n, ["gcsUri"], o);
  const r = s(e, ["videoBytes"]);
  r != null && l(n, ["bytesBase64Encoded"], At(r));
  const i = s(e, ["mimeType"]);
  return i != null && l(n, ["mimeType"], i), n;
}
function hS(e, t) {
  const n = {}, o = s(e, ["displayName"]);
  return t !== void 0 && o != null && l(t, ["displayName"], o), n;
}
function pS(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && hS(n, t), t;
}
function mS(e, t) {
  const n = {}, o = s(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function gS(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = s(e, ["config"]);
  return o != null && mS(o, t), t;
}
function _S(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function yS(e, t) {
  const n = {}, o = s(e, ["customMetadata"]);
  if (t !== void 0 && o != null) {
    let i = o;
    Array.isArray(i) && (i = i.map((a) => a)), l(t, ["customMetadata"], i);
  }
  const r = s(e, ["chunkingConfig"]);
  return t !== void 0 && r != null && l(t, ["chunkingConfig"], r), n;
}
function vS(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["name"], n);
  const o = s(e, ["metadata"]);
  o != null && l(t, ["metadata"], o);
  const r = s(e, ["done"]);
  r != null && l(t, ["done"], r);
  const i = s(e, ["error"]);
  i != null && l(t, ["error"], i);
  const a = s(e, ["response"]);
  return a != null && l(t, ["response"], TS(a)), t;
}
function AS(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = s(e, ["fileName"]);
  o != null && l(t, ["fileName"], o);
  const r = s(e, ["config"]);
  return r != null && yS(r, t), t;
}
function TS(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  n != null && l(t, ["sdkHttpResponse"], n);
  const o = s(e, ["parent"]);
  o != null && l(t, ["parent"], o);
  const r = s(e, ["documentName"]);
  return r != null && l(t, ["documentName"], r), t;
}
function SS(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function ES(e) {
  const t = {}, n = s(e, ["config"]);
  return n != null && SS(n, t), t;
}
function IS(e) {
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
function bf(e, t) {
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
function wS(e) {
  const t = {}, n = s(e, ["fileSearchStoreName"]);
  n != null && l(t, ["_url", "file_search_store_name"], n);
  const o = s(e, ["config"]);
  return o != null && bf(o, t), t;
}
function CS(e) {
  const t = {}, n = s(e, ["sdkHttpResponse"]);
  return n != null && l(t, ["sdkHttpResponse"], n), t;
}
var bS = "Content-Type", RS = "X-Server-Timeout", PS = "User-Agent", Ki = "x-goog-api-client", MS = "google-genai-sdk/1.50.1", xS = "v1beta1", NS = "v1beta", kS = /* @__PURE__ */ new Set(["us", "eu"]), DS = 5, $S = [
  408,
  429,
  500,
  502,
  503,
  504
], LS = class {
  constructor(e) {
    var t, n, o;
    this.clientOptions = Object.assign({}, e), this.customBaseUrl = (t = e.httpOptions) === null || t === void 0 ? void 0 : t.baseUrl, this.clientOptions.vertexai && (this.clientOptions.project && this.clientOptions.location ? this.clientOptions.apiKey = void 0 : this.clientOptions.apiKey && (this.clientOptions.project = void 0, this.clientOptions.location = void 0));
    const r = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl && (this.clientOptions.location = "global"), !(this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey) && !this.customBaseUrl) throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      const i = e.project && e.location || !!e.apiKey;
      this.customBaseUrl && !i ? (r.baseUrl = this.customBaseUrl, this.clientOptions.project = void 0, this.clientOptions.location = void 0) : this.clientOptions.apiKey || this.clientOptions.location === "global" ? r.baseUrl = "https://aiplatform.googleapis.com/" : this.clientOptions.project && this.clientOptions.location && kS.has(this.clientOptions.location) ? r.baseUrl = `https://aiplatform.${this.clientOptions.location}.rep.googleapis.com/` : this.clientOptions.project && this.clientOptions.location && (r.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`), r.apiVersion = (n = this.clientOptions.apiVersion) !== null && n !== void 0 ? n : xS;
    } else
      this.clientOptions.apiKey || console.warn("API key should be set when using the Gemini API."), r.apiVersion = (o = this.clientOptions.apiVersion) !== null && o !== void 0 ? o : NS, r.baseUrl = "https://generativelanguage.googleapis.com/";
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
    return !(t.baseUrl && t.baseUrlResourceScope === Gi.COLLECTION || this.clientOptions.apiKey || !this.clientOptions.vertexai || e.path.startsWith("projects/") || e.httpMethod === "GET" && e.path.startsWith("publishers/google/models"));
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
    return t && t.extraBody !== null && US(e, t.extraBody), e.headers = await this.getHeadersInternal(t, n), e;
  }
  async unaryApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Fu(o), new Bi(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  async streamApiCall(e, t, n) {
    return this.apiCall(e.toString(), Object.assign(Object.assign({}, t), { method: n })).then(async (o) => (await Fu(o), this.processStreamResponse(o))).catch((o) => {
      throw o instanceof Error ? o : new Error(JSON.stringify(o));
    });
  }
  processStreamResponse(e) {
    return He(this, arguments, function* () {
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
              if (y >= 400 && y < 600) throw new vf({
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
                yield yield B(new Bi(new Response(_, {
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
      throw $S.includes(i.status) ? new Error(`Retryable HTTP Error: ${i.statusText}`) : new cl.AbortError(`Non-retryable exception ${i.statusText} sending request`);
    };
    return (0, cl.default)(r, { retries: ((n = o.attempts) !== null && n !== void 0 ? n : DS) - 1 });
  }
  getDefaultHeaders() {
    const e = {}, t = MS + " " + this.clientOptions.userAgentExtra;
    return e[PS] = t, e[Ki] = t, e[bS] = "application/json", e;
  }
  async getHeadersInternal(e, t) {
    const n = new Headers();
    if (e && e.headers) {
      for (const [o, r] of Object.entries(e.headers)) n.append(o, r);
      e.timeout && e.timeout > 0 && n.append(RS, String(Math.ceil(e.timeout / 1e3)));
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
    n != null && bf(n, h);
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
async function Fu(e) {
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
    throw n >= 400 && n < 600 ? new vf({
      message: r,
      status: n
    }) : new Error(r);
  }
}
function US(e, t) {
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
var FS = "mcp_used/unknown", OS = !1;
function Rf(e) {
  for (const t of e)
    if (GS(t) || typeof t == "object" && "inputSchema" in t) return !0;
  return OS;
}
function Pf(e) {
  var t;
  e[Ki] = (((t = e[Ki]) !== null && t !== void 0 ? t : "") + ` ${FS}`).trimStart();
}
function GS(e) {
  return e !== null && typeof e == "object" && e instanceof qS;
}
function BS(e) {
  return He(this, arguments, function* (n, o = 100) {
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
var qS = class Mf {
  constructor(t = [], n) {
    this.mcpTools = [], this.functionNameToMcpClient = {}, this.mcpClients = t, this.config = n;
  }
  static create(t, n) {
    return new Mf(t, n);
  }
  async initialize() {
    var t, n, o, r;
    if (this.mcpTools.length > 0) return;
    const i = {}, a = [];
    for (const h of this.mcpClients) try {
      for (var u = !0, c = (n = void 0, Ve(BS(h))), d; d = await c.next(), t = d.done, !t; u = !0) {
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
    return await this.initialize(), ny(this.mcpTools, this.config);
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
async function HS(e, t, n) {
  const o = new W_();
  let r;
  n.data instanceof Blob ? r = JSON.parse(await n.data.text()) : r = JSON.parse(n.data), Object.assign(o, r), t(o);
}
var VS = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n;
  }
  async connect(e) {
    var t, n;
    if (this.apiClient.isVertexAI()) throw new Error("Live music is not supported for Vertex AI.");
    console.warn("Live music generation is experimental and may change in future versions.");
    const o = this.apiClient.getWebsocketBaseUrl(), r = this.apiClient.getApiVersion(), i = WS(this.apiClient.getDefaultHeaders()), a = `${o}/ws/google.ai.generativelanguage.${r}.GenerativeService.BidiGenerateMusic?key=${this.apiClient.getApiKey()}`;
    let u = () => {
    };
    const c = new Promise((_) => {
      u = _;
    }), d = e.callbacks, h = function() {
      u({});
    }, f = this.apiClient, p = {
      onopen: h,
      onmessage: (_) => {
        HS(f, d.onmessage, _);
      },
      onerror: (t = d?.onerror) !== null && t !== void 0 ? t : function(_) {
      },
      onclose: (n = d?.onclose) !== null && n !== void 0 ? n : function(_) {
      }
    }, m = this.webSocketFactory.create(a, KS(i), p);
    m.connect(), await c;
    const g = { setup: { model: V(this.apiClient, e.model) } };
    return m.send(JSON.stringify(g)), new JS(m, this.apiClient);
  }
}, JS = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  async setWeightedPrompts(e) {
    if (!e.weightedPrompts || Object.keys(e.weightedPrompts).length === 0) throw new Error("Weighted prompts must be set and contain at least one entry.");
    const t = lA(e);
    this.conn.send(JSON.stringify({ clientContent: t }));
  }
  async setMusicGenerationConfig(e) {
    e.musicGenerationConfig || (e.musicGenerationConfig = {});
    const t = aA(e);
    this.conn.send(JSON.stringify(t));
  }
  sendPlaybackControl(e) {
    const t = { playbackControl: e };
    this.conn.send(JSON.stringify(t));
  }
  play() {
    this.sendPlaybackControl(en.PLAY);
  }
  pause() {
    this.sendPlaybackControl(en.PAUSE);
  }
  stop() {
    this.sendPlaybackControl(en.STOP);
  }
  resetContext() {
    this.sendPlaybackControl(en.RESET_CONTEXT);
  }
  close() {
    this.conn.close();
  }
};
function KS(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function WS(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var zS = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function YS(e, t, n) {
  const o = new K_();
  let r;
  n.data instanceof Blob ? r = await n.data.text() : n.data instanceof ArrayBuffer ? r = new TextDecoder().decode(n.data) : r = n.data;
  const i = JSON.parse(r);
  if (e.isVertexAI()) {
    const a = dA(i);
    Object.assign(o, a);
  } else Object.assign(o, i);
  t(o);
}
var XS = class {
  constructor(e, t, n) {
    this.apiClient = e, this.auth = t, this.webSocketFactory = n, this.music = new VS(this.apiClient, this.auth, this.webSocketFactory);
  }
  async connect(e) {
    var t, n, o, r, i, a;
    if (e.config && e.config.httpOptions) throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    const u = this.apiClient.getWebsocketBaseUrl(), c = this.apiClient.getApiVersion();
    let d;
    const h = this.apiClient.getHeaders();
    e.config && e.config.tools && Rf(e.config.tools) && Pf(h);
    const f = eE(h);
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
        YS(y, g.onmessage, w);
      },
      onerror: (t = g?.onerror) !== null && t !== void 0 ? t : function(w) {
      },
      onclose: (n = g?.onclose) !== null && n !== void 0 ? n : function(w) {
      }
    }, I = this.webSocketFactory.create(d, jS(f), S);
    I.connect(), await m;
    let b = V(this.apiClient, e.model);
    if (this.apiClient.isVertexAI() && b.startsWith("publishers/")) {
      const w = this.apiClient.getProject(), M = this.apiClient.getLocation();
      w && M && (b = `projects/${w}/locations/${M}/` + b);
    }
    let P = {};
    this.apiClient.isVertexAI() && ((o = e.config) === null || o === void 0 ? void 0 : o.responseModalities) === void 0 && (e.config === void 0 ? e.config = { responseModalities: [pr.AUDIO] } : e.config.responseModalities = [pr.AUDIO]), !((r = e.config) === null || r === void 0) && r.generationConfig && console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
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
    return this.apiClient.isVertexAI() ? P = sA(this.apiClient, L) : P = iA(this.apiClient, L), delete P.config, I.send(JSON.stringify(P)), new ZS(I, this.apiClient);
  }
  isCallableTool(e) {
    return "callTool" in e && typeof e.callTool == "function";
  }
}, QS = { turnComplete: !0 }, ZS = class {
  constructor(e, t) {
    this.conn = e, this.apiClient = t;
  }
  tLiveClientContent(e, t) {
    if (t.turns !== null && t.turns !== void 0) {
      let n = [];
      try {
        n = ye(t.turns), e.isVertexAI() || (n = n.map((o) => vo(o)));
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
      if (!e.isVertexAI() && !("id" in o)) throw new Error(zS);
    }
    return { toolResponse: { functionResponses: n } };
  }
  sendClientContent(e) {
    e = Object.assign(Object.assign({}, QS), e);
    const t = this.tLiveClientContent(this.apiClient, e);
    this.conn.send(JSON.stringify(t));
  }
  sendRealtimeInput(e) {
    let t = {};
    this.apiClient.isVertexAI() ? t = { realtimeInput: cA(e) } : t = { realtimeInput: uA(e) }, this.conn.send(JSON.stringify(t));
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
function jS(e) {
  const t = {};
  return e.forEach((n, o) => {
    t[o] = n;
  }), t;
}
function eE(e) {
  const t = new Headers();
  for (const [n, o] of Object.entries(e)) t.append(n, o);
  return t;
}
var Ou = 10;
function Gu(e) {
  var t, n, o;
  if (!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.disable) return !0;
  let r = !1;
  for (const a of (n = e?.tools) !== null && n !== void 0 ? n : []) if (ln(a)) {
    r = !0;
    break;
  }
  if (!r) return !0;
  const i = (o = e?.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls;
  return i && (i < 0 || !Number.isInteger(i)) || i == 0 ? (console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", i), !0) : !1;
}
function ln(e) {
  return "callTool" in e && typeof e.callTool == "function";
}
function tE(e) {
  var t, n, o;
  return (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) === null || n === void 0 ? void 0 : n.some((r) => ln(r))) !== null && o !== void 0 ? o : !1;
}
function Bu(e) {
  var t;
  const n = [];
  return !((t = e?.config) === null || t === void 0) && t.tools && e.config.tools.forEach((o, r) => {
    if (ln(o)) return;
    const i = o;
    i.functionDeclarations && i.functionDeclarations.length > 0 && n.push(r);
  }), n;
}
function qu(e) {
  var t;
  return !(!((t = e?.automaticFunctionCalling) === null || t === void 0) && t.ignoreCallHistory);
}
var nE = class extends it {
  constructor(e) {
    super(), this.apiClient = e, this.embedContent = async (t) => {
      if (!this.apiClient.isVertexAI())
        return t.model.includes("gemini-embedding-2") && (t.contents = ye(t.contents)), await this.embedContentInternal(t);
      if (t.model.includes("gemini") && t.model !== "gemini-embedding-001" || t.model.includes("maas")) {
        const n = ye(t.contents);
        if (n.length > 1) throw new Error("The embedContent API for this model only supports one content at a time.");
        const o = Object.assign(Object.assign({}, t), {
          content: n[0],
          embeddingApiType: mr.EMBED_CONTENT
        });
        return await this.embedContentInternal(o);
      } else {
        const n = Object.assign(Object.assign({}, t), { embeddingApiType: mr.PREDICT });
        return await this.embedContentInternal(n);
      }
    }, this.generateContent = async (t) => {
      var n, o, r, i, a;
      const u = await this.processParamsMaybeAddMcpUsage(t);
      if (this.maybeMoveToResponseJsonSchem(t), !tE(t) || Gu(t.config)) return await this.generateContentInternal(u);
      const c = Bu(t);
      if (c.length > 0) {
        const g = c.map((_) => `tools[${_}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${g}.`);
      }
      let d, h;
      const f = ye(u.contents), p = (r = (o = (n = u.config) === null || n === void 0 ? void 0 : n.automaticFunctionCalling) === null || o === void 0 ? void 0 : o.maximumRemoteCalls) !== null && r !== void 0 ? r : Ou;
      let m = 0;
      for (; m < p && (d = await this.generateContentInternal(u), !(!d.functionCalls || d.functionCalls.length === 0)); ) {
        const g = d.candidates[0].content, _ = [];
        for (const y of (a = (i = t.config) === null || i === void 0 ? void 0 : i.tools) !== null && a !== void 0 ? a : []) if (ln(y)) {
          const S = await y.callTool(d.functionCalls);
          _.push(...S);
        }
        m++, h = {
          role: "user",
          parts: _
        }, u.contents = ye(u.contents), u.contents.push(g), u.contents.push(h), qu(u.config) && (f.push(g), f.push(h));
      }
      return qu(u.config) && (d.automaticFunctionCallingHistory = f), d;
    }, this.generateContentStream = async (t) => {
      var n, o, r, i, a;
      if (this.maybeMoveToResponseJsonSchem(t), Gu(t.config)) {
        const h = await this.processParamsMaybeAddMcpUsage(t);
        return await this.generateContentStreamInternal(h);
      }
      const u = Bu(t);
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
      return new Ot(rt.PAGED_ITEM_MODELS, (r) => this.listInternal(r), await this.listInternal(o), o);
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
    const i = await Promise.all(r.map(async (u) => ln(u) ? await u.tool() : u)), a = {
      model: e.model,
      contents: e.contents,
      config: Object.assign(Object.assign({}, e.config), { tools: i })
    };
    if (a.config.tools = i, e.config && e.config.tools && Rf(e.config.tools)) {
      const u = (o = (n = e.config.httpOptions) === null || n === void 0 ? void 0 : n.headers) !== null && o !== void 0 ? o : {};
      let c = Object.assign({}, u);
      Object.keys(c).length === 0 && (c = this.apiClient.getDefaultHeaders()), Pf(c), a.config.httpOptions = Object.assign(Object.assign({}, e.config.httpOptions), { headers: c });
    }
    return a;
  }
  async initAfcToolsMap(e) {
    var t, n, o;
    const r = /* @__PURE__ */ new Map();
    for (const i of (n = (t = e.config) === null || t === void 0 ? void 0 : t.tools) !== null && n !== void 0 ? n : []) if (ln(i)) {
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
    const r = (o = (n = (t = e.config) === null || t === void 0 ? void 0 : t.automaticFunctionCalling) === null || n === void 0 ? void 0 : n.maximumRemoteCalls) !== null && o !== void 0 ? o : Ou;
    let i = !1, a = 0;
    const u = await this.initAfcToolsMap(e);
    return (function(c, d, h) {
      return He(this, arguments, function* () {
        for (var f, p, m, g, _, y; a < r; ) {
          i && (a++, i = !1);
          const P = yield B(c.processParamsMaybeAddMcpUsage(h)), D = yield B(c.generateContentStreamInternal(P)), E = [], L = [];
          try {
            for (var S = !0, I = (p = void 0, Ve(D)), b; b = yield B(I.next()), f = b.done, !f; S = !0) {
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
            const w = new Nn();
            w.candidates = [{ content: {
              role: "user",
              parts: E
            } }], yield yield B(w);
            const M = [];
            M.push(...L), M.push({
              role: "user",
              parts: E
            }), h.contents = ye(h.contents).concat(M);
          } else break;
        }
      });
    })(this, u, e);
  }
  async generateContentInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $u(this.apiClient, e);
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
        const h = Uu(d), f = new Nn();
        return Object.assign(f, h), f;
      });
    } else {
      const c = Du(this.apiClient, e);
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
        const h = Lu(d), f = new Nn();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateContentStreamInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = $u(this.apiClient, e);
      return a = x("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }), i.then(function(d) {
        return He(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = Ve(d), y; y = yield B(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const S = m, I = Uu(yield B(S.json()), e);
              I.sdkHttpResponse = { headers: S.headers };
              const b = new Nn();
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
      const c = Du(this.apiClient, e);
      return a = x("{model}:streamGenerateContent?alt=sse", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.requestStream({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }), i.then(function(d) {
        return He(this, arguments, function* () {
          var h, f, p, m;
          try {
            for (var g = !0, _ = Ve(d), y; y = yield B(_.next()), h = y.done, !h; g = !0) {
              m = y.value, g = !1;
              const S = m, I = Lu(yield B(S.json()), e);
              I.sdkHttpResponse = { headers: S.headers };
              const b = new Nn();
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
      const c = JA(this.apiClient, e, e);
      return a = x(ry(e.model) ? "{model}:embedContent" : "{model}:predict", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
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
        const h = WA(d, e), f = new pu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = VA(this.apiClient, e);
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
        const h = KA(d), f = new pu();
        return Object.assign(f, h), f;
      });
    }
  }
  async generateImagesInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = rT(this.apiClient, e);
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
        const h = sT(d), f = new mu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = oT(this.apiClient, e);
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
        const h = iT(d), f = new mu();
        return Object.assign(f, h), f;
      });
    }
  }
  async editImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = GA(this.apiClient, e);
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
        const c = BA(u), d = new k_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async upscaleImageInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = sS(this.apiClient, e);
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
        const c = aS(u), d = new D_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async recontextImage(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = GT(this.apiClient, e);
      return r = x("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = BT(u), d = new $_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async segmentImage(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = WT(this.apiClient, e);
      return r = x("{model}:predict", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = zT(u), d = new L_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async get(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = ET(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ji(d));
    } else {
      const c = ST(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => Vi(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = NT(this.apiClient, e);
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
        const h = DT(d), f = new gu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = xT(this.apiClient, e);
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
        const h = kT(d), f = new gu();
        return Object.assign(f, h), f;
      });
    }
  }
  async update(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = rS(this.apiClient, e);
      return a = x("{model}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => Ji(d));
    } else {
      const c = oS(this.apiClient, e);
      return a = x("{name}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "PATCH",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => Vi(d));
    }
  }
  async delete(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = LA(this.apiClient, e);
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
        const h = FA(d), f = new _u();
        return Object.assign(f, h), f;
      });
    } else {
      const c = $A(this.apiClient, e);
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
        const h = UA(d), f = new _u();
        return Object.assign(f, h), f;
      });
    }
  }
  async countTokens(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = NA(this.apiClient, e);
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
        const h = DA(d), f = new yu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = xA(this.apiClient, e);
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
        const h = kA(d), f = new yu();
        return Object.assign(f, h), f;
      });
    }
  }
  async computeTokens(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = IA(this.apiClient, e);
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
        const c = wA(u), d = new U_();
        return Object.assign(d, c), d;
      });
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async generateVideosInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = fT(this.apiClient, e);
      return a = x("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = cT(d), f = new vu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = dT(this.apiClient, e);
      return a = x("{model}:predictLongRunning", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "POST",
        httpOptions: (o = e.config) === null || o === void 0 ? void 0 : o.httpOptions,
        abortSignal: (r = e.config) === null || r === void 0 ? void 0 : r.abortSignal
      }).then((d) => d.json()), i.then((d) => {
        const h = uT(d), f = new vu();
        return Object.assign(f, h), f;
      });
    }
  }
}, oE = class extends it {
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
      const c = b_(e);
      return a = x("{operationName}", c._url), u = c._query, delete c._url, delete c._query, i = this.apiClient.request({
        path: a,
        queryParams: u,
        body: JSON.stringify(c),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((d) => d.json()), i;
    } else {
      const c = C_(e);
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
      const a = v_(e);
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
function Hu(e) {
  const t = {};
  if (s(e, ["languageCodes"]) !== void 0) throw new Error("languageCodes parameter is not supported in Gemini API.");
  return t;
}
function rE(e) {
  const t = {}, n = s(e, ["apiKey"]);
  if (n != null && l(t, ["apiKey"], n), s(e, ["apiKeyConfig"]) !== void 0) throw new Error("apiKeyConfig parameter is not supported in Gemini API.");
  if (s(e, ["authType"]) !== void 0) throw new Error("authType parameter is not supported in Gemini API.");
  if (s(e, ["googleServiceAccountConfig"]) !== void 0) throw new Error("googleServiceAccountConfig parameter is not supported in Gemini API.");
  if (s(e, ["httpBasicAuthConfig"]) !== void 0) throw new Error("httpBasicAuthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oauthConfig"]) !== void 0) throw new Error("oauthConfig parameter is not supported in Gemini API.");
  if (s(e, ["oidcConfig"]) !== void 0) throw new Error("oidcConfig parameter is not supported in Gemini API.");
  return t;
}
function iE(e) {
  const t = {}, n = s(e, ["data"]);
  if (n != null && l(t, ["data"], n), s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function sE(e) {
  const t = {}, n = s(e, ["parts"]);
  if (n != null) {
    let r = n;
    Array.isArray(r) && (r = r.map((i) => mE(i))), l(t, ["parts"], r);
  }
  const o = s(e, ["role"]);
  return o != null && l(t, ["role"], o), t;
}
function aE(e, t, n) {
  const o = {}, r = s(t, ["expireTime"]);
  n !== void 0 && r != null && l(n, ["expireTime"], r);
  const i = s(t, ["newSessionExpireTime"]);
  n !== void 0 && i != null && l(n, ["newSessionExpireTime"], i);
  const a = s(t, ["uses"]);
  n !== void 0 && a != null && l(n, ["uses"], a);
  const u = s(t, ["liveConnectConstraints"]);
  n !== void 0 && u != null && l(n, ["bidiGenerateContentSetup"], pE(e, u));
  const c = s(t, ["lockAdditionalFields"]);
  return n !== void 0 && c != null && l(n, ["fieldMask"], c), o;
}
function lE(e, t) {
  const n = {}, o = s(t, ["config"]);
  return o != null && l(n, ["config"], aE(e, o, n)), n;
}
function uE(e) {
  const t = {};
  if (s(e, ["displayName"]) !== void 0) throw new Error("displayName parameter is not supported in Gemini API.");
  const n = s(e, ["fileUri"]);
  n != null && l(t, ["fileUri"], n);
  const o = s(e, ["mimeType"]);
  return o != null && l(t, ["mimeType"], o), t;
}
function cE(e) {
  const t = {}, n = s(e, ["id"]);
  n != null && l(t, ["id"], n);
  const o = s(e, ["args"]);
  o != null && l(t, ["args"], o);
  const r = s(e, ["name"]);
  if (r != null && l(t, ["name"], r), s(e, ["partialArgs"]) !== void 0) throw new Error("partialArgs parameter is not supported in Gemini API.");
  if (s(e, ["willContinue"]) !== void 0) throw new Error("willContinue parameter is not supported in Gemini API.");
  return t;
}
function dE(e) {
  const t = {}, n = s(e, ["authConfig"]);
  n != null && l(t, ["authConfig"], rE(n));
  const o = s(e, ["enableWidget"]);
  return o != null && l(t, ["enableWidget"], o), t;
}
function fE(e) {
  const t = {}, n = s(e, ["searchTypes"]);
  if (n != null && l(t, ["searchTypes"], n), s(e, ["blockingConfidence"]) !== void 0) throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  if (s(e, ["excludeDomains"]) !== void 0) throw new Error("excludeDomains parameter is not supported in Gemini API.");
  const o = s(e, ["timeRangeFilter"]);
  return o != null && l(t, ["timeRangeFilter"], o), t;
}
function hE(e, t) {
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
  ], Hs(f));
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
  t !== void 0 && g != null && l(t, ["setup", "systemInstruction"], sE(ie(g)));
  const _ = s(e, ["tools"]);
  if (t !== void 0 && _ != null) {
    let w = dn(_);
    Array.isArray(w) && (w = w.map((M) => yE(cn(M)))), l(t, ["setup", "tools"], w);
  }
  const y = s(e, ["sessionResumption"]);
  t !== void 0 && y != null && l(t, ["setup", "sessionResumption"], _E(y));
  const S = s(e, ["inputAudioTranscription"]);
  t !== void 0 && S != null && l(t, ["setup", "inputAudioTranscription"], Hu(S));
  const I = s(e, ["outputAudioTranscription"]);
  t !== void 0 && I != null && l(t, ["setup", "outputAudioTranscription"], Hu(I));
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
    Array.isArray(w) && (w = w.map((M) => gE(M))), l(t, ["setup", "safetySettings"], w);
  }
  return n;
}
function pE(e, t) {
  const n = {}, o = s(t, ["model"]);
  o != null && l(n, ["setup", "model"], V(e, o));
  const r = s(t, ["config"]);
  return r != null && l(n, ["config"], hE(r, n)), n;
}
function mE(e) {
  const t = {}, n = s(e, ["mediaResolution"]);
  n != null && l(t, ["mediaResolution"], n);
  const o = s(e, ["codeExecutionResult"]);
  o != null && l(t, ["codeExecutionResult"], o);
  const r = s(e, ["executableCode"]);
  r != null && l(t, ["executableCode"], r);
  const i = s(e, ["fileData"]);
  i != null && l(t, ["fileData"], uE(i));
  const a = s(e, ["functionCall"]);
  a != null && l(t, ["functionCall"], cE(a));
  const u = s(e, ["functionResponse"]);
  u != null && l(t, ["functionResponse"], u);
  const c = s(e, ["inlineData"]);
  c != null && l(t, ["inlineData"], iE(c));
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
function gE(e) {
  const t = {}, n = s(e, ["category"]);
  if (n != null && l(t, ["category"], n), s(e, ["method"]) !== void 0) throw new Error("method parameter is not supported in Gemini API.");
  const o = s(e, ["threshold"]);
  return o != null && l(t, ["threshold"], o), t;
}
function _E(e) {
  const t = {}, n = s(e, ["handle"]);
  if (n != null && l(t, ["handle"], n), s(e, ["transparent"]) !== void 0) throw new Error("transparent parameter is not supported in Gemini API.");
  return t;
}
function yE(e) {
  const t = {};
  if (s(e, ["retrieval"]) !== void 0) throw new Error("retrieval parameter is not supported in Gemini API.");
  const n = s(e, ["computerUse"]);
  n != null && l(t, ["computerUse"], n);
  const o = s(e, ["fileSearch"]);
  o != null && l(t, ["fileSearch"], o);
  const r = s(e, ["googleSearch"]);
  r != null && l(t, ["googleSearch"], fE(r));
  const i = s(e, ["googleMaps"]);
  i != null && l(t, ["googleMaps"], dE(i));
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
function vE(e) {
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
function AE(e, t) {
  let n = null;
  const o = e.bidiGenerateContentSetup;
  if (typeof o == "object" && o !== null && "setup" in o) {
    const i = o.setup;
    typeof i == "object" && i !== null ? (e.bidiGenerateContentSetup = i, n = i) : delete e.bidiGenerateContentSetup;
  } else o !== void 0 && delete e.bidiGenerateContentSetup;
  const r = e.fieldMask;
  if (n) {
    const i = vE(n);
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
var TE = class extends it {
  constructor(e) {
    super(), this.apiClient = e;
  }
  async create(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    {
      const a = lE(this.apiClient, e);
      r = x("auth_tokens", a._url), i = a._query, delete a.config, delete a._url, delete a._query;
      const u = AE(a, e.config);
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
function SE(e, t) {
  const n = {}, o = s(e, ["force"]);
  return t !== void 0 && o != null && l(t, ["_query", "force"], o), n;
}
function EE(e) {
  const t = {}, n = s(e, ["name"]);
  n != null && l(t, ["_url", "name"], n);
  const o = s(e, ["config"]);
  return o != null && SE(o, t), t;
}
function IE(e) {
  const t = {}, n = s(e, ["name"]);
  return n != null && l(t, ["_url", "name"], n), t;
}
function wE(e, t) {
  const n = {}, o = s(e, ["pageSize"]);
  t !== void 0 && o != null && l(t, ["_query", "pageSize"], o);
  const r = s(e, ["pageToken"]);
  return t !== void 0 && r != null && l(t, ["_query", "pageToken"], r), n;
}
function CE(e) {
  const t = {}, n = s(e, ["parent"]);
  n != null && l(t, ["_url", "parent"], n);
  const o = s(e, ["config"]);
  return o != null && wE(o, t), t;
}
function bE(e) {
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
var RE = class extends it {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t) => new Ot(rt.PAGED_ITEM_DOCUMENTS, (n) => this.listInternal({
      parent: t.parent,
      config: n.config
    }), await this.listInternal(t), t);
  }
  async get(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = IE(e);
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
      const i = EE(e);
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
      const a = CE(e);
      return r = x("{parent}/documents", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = bE(u), d = new F_();
        return Object.assign(d, c), d;
      });
    }
  }
}, PE = class extends it {
  constructor(e, t = new RE(e)) {
    super(), this.apiClient = e, this.documents = t, this.list = async (n = {}) => new Ot(rt.PAGED_ITEM_FILE_SEARCH_STORES, (o) => this.listInternal(o), await this.listInternal(n), n);
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
      const a = pS(e);
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
      const a = _S(e);
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
      const i = gS(e);
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
      const a = ES(e);
      return r = x("fileSearchStores", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "GET",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = IS(u), d = new O_();
        return Object.assign(d, c), d;
      });
    }
  }
  async uploadToFileSearchStoreInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = wS(e);
      return r = x("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = CS(u), d = new G_();
        return Object.assign(d, c), d;
      });
    }
  }
  async importFile(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = AS(e);
      return r = x("{file_search_store_name}:importFile", a._url), i = a._query, delete a._url, delete a._query, o = this.apiClient.request({
        path: r,
        queryParams: i,
        body: JSON.stringify(a),
        httpMethod: "POST",
        httpOptions: (t = e.config) === null || t === void 0 ? void 0 : t.httpOptions,
        abortSignal: (n = e.config) === null || n === void 0 ? void 0 : n.abortSignal
      }).then((u) => u.json()), o.then((u) => {
        const c = vS(u), d = new B_();
        return Object.assign(d, c), d;
      });
    }
  }
}, xf = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return xf = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
}, ME = () => xf();
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
}, ke = class extends Error {
}, $e = class Yi extends ke {
  constructor(t, n, o, r) {
    super(`${Yi.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.error = n;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new Gr({
      message: o,
      cause: zi(n)
    });
    const i = n;
    return t === 400 ? new kf(t, i, o, r) : t === 401 ? new Df(t, i, o, r) : t === 403 ? new $f(t, i, o, r) : t === 404 ? new Lf(t, i, o, r) : t === 409 ? new Uf(t, i, o, r) : t === 422 ? new Ff(t, i, o, r) : t === 429 ? new Of(t, i, o, r) : t >= 500 ? new Gf(t, i, o, r) : new Yi(t, i, o, r);
  }
}, Xi = class extends $e {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, Gr = class extends $e {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Nf = class extends Gr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, kf = class extends $e {
}, Df = class extends $e {
}, $f = class extends $e {
}, Lf = class extends $e {
}, Uf = class extends $e {
}, Ff = class extends $e {
}, Of = class extends $e {
}, Gf = class extends $e {
}, xE = /^[a-z][a-z0-9+.-]*:/i, NE = (e) => xE.test(e), Qi = (e) => (Qi = Array.isArray, Qi(e)), Vu = Qi;
function Ju(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function kE(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var DE = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new ke(`${e} must be an integer`);
  if (t < 0) throw new ke(`${e} must be a positive integer`);
  return t;
}, $E = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, LE = (e) => new Promise((t) => setTimeout(t, e));
function UE() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function Bf(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function FE(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return Bf({
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
function qf(e) {
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
async function OE(e) {
  var t, n;
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await ((n = (t = e[Symbol.asyncIterator]()).return) === null || n === void 0 ? void 0 : n.call(t));
    return;
  }
  const o = e.getReader(), r = o.cancel();
  o.releaseLock(), await r;
}
var GE = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
});
function BE(e) {
  return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
    if (n === null) return `${encodeURIComponent(t)}=`;
    throw new ke(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
  }).join("&");
}
var qE = "0.0.1", Hf = () => {
  var e;
  if (typeof File > "u") {
    const { process: t } = globalThis, n = typeof ((e = t?.versions) === null || e === void 0 ? void 0 : e.node) == "string" && parseInt(t.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (n ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function ci(e, t, n) {
  return Hf(), new File(e, t ?? "unknown_file", n);
}
function HE(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var VE = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Vf = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", JE = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Vf(e), KE = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function WE(e, t, n) {
  if (Hf(), e = await e, JE(e))
    return e instanceof File ? e : ci([await e.arrayBuffer()], e.name);
  if (KE(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), ci(await Zi(r), t, n);
  }
  const o = await Zi(e);
  if (t || (t = HE(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = Object.assign(Object.assign({}, n), { type: r }));
  }
  return ci(o, t, n);
}
async function Zi(e) {
  var t, n, o, r, i;
  let a = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) a.push(e);
  else if (Vf(e)) a.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (VE(e)) try {
    for (var u = !0, c = Ve(e), d; d = await c.next(), t = d.done, !t; u = !0) {
      r = d.value, u = !1;
      const h = r;
      a.push(...await Zi(h));
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
    throw new Error(`Unexpected data type: ${typeof e}${h ? `; constructor: ${h}` : ""}${zE(e)}`);
  }
  return a;
}
function zE(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var Vs = class {
  constructor(e) {
    this._client = e;
  }
};
Vs._key = [];
function Jf(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var Ku = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), YE = (e = Jf) => (function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], a = n.reduce((h, f, p) => {
    var m, g, _;
    /[?#]/.test(f) && (r = !0);
    const y = o[p];
    let S = (r ? encodeURIComponent : e)("" + y);
    return p !== o.length && (y == null || typeof y == "object" && y.toString === ((_ = Object.getPrototypeOf((g = Object.getPrototypeOf((m = y.hasOwnProperty) !== null && m !== void 0 ? m : Ku)) !== null && g !== void 0 ? g : Ku)) === null || _ === void 0 ? void 0 : _.toString)) && (S = y + "", i.push({
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
    throw new ke(`Path parameters result in path with invalid segments:
${i.map((p) => p.error).join(`
`)}
${a}
${f}`);
  }
  return a;
}), Fe = /* @__PURE__ */ YE(Jf), Kf = class extends Vs {
  create(e, t) {
    var n;
    const { api_version: o = this._client.apiVersion } = e, r = gt(e, ["api_version"]);
    if ("model" in r && "agent_config" in r) throw new ke("Invalid request: specified `model` and `agent_config`. If specifying `model`, use `generation_config`.");
    if ("agent" in r && "generation_config" in r) throw new ke("Invalid request: specified `agent` and `generation_config`. If specifying `agent`, use `agent_config`.");
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
    const r = t ?? {}, { api_version: i = this._client.apiVersion } = r, a = gt(r, ["api_version"]);
    return this._client.get(Fe`/${i}/interactions/${e}`, Object.assign(Object.assign({ query: a }, n), { stream: (o = t?.stream) !== null && o !== void 0 ? o : !1 }));
  }
};
Kf._key = Object.freeze(["interactions"]);
var Wf = class extends Kf {
}, zf = class extends Vs {
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
zf._key = Object.freeze(["webhooks"]);
var Yf = class extends zf {
};
function XE(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var Ho;
function Js(e) {
  let t;
  return (Ho ?? (t = new globalThis.TextEncoder(), Ho = t.encode.bind(t)))(e);
}
var Vo;
function Wu(e) {
  let t;
  return (Vo ?? (t = new globalThis.TextDecoder(), Vo = t.decode.bind(t)))(e);
}
var Br = class {
  constructor() {
    this.buffer = new Uint8Array(), this.carriageReturnIndex = null, this.searchIndex = 0;
  }
  decode(e) {
    var t;
    if (e == null) return [];
    const n = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Js(e) : e;
    this.buffer = XE([this.buffer, n]);
    const o = [];
    let r;
    for (; (r = QE(this.buffer, (t = this.carriageReturnIndex) !== null && t !== void 0 ? t : this.searchIndex)) != null; ) {
      if (r.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = r.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (r.index !== this.carriageReturnIndex + 1 || r.carriage)) {
        o.push(Wu(this.buffer.subarray(0, this.carriageReturnIndex - 1))), this.buffer = this.buffer.subarray(this.carriageReturnIndex), this.carriageReturnIndex = null, this.searchIndex = 0;
        continue;
      }
      const i = this.carriageReturnIndex !== null ? r.preceding - 1 : r.preceding, a = Wu(this.buffer.subarray(0, i));
      o.push(a), this.buffer = this.buffer.subarray(r.index), this.carriageReturnIndex = null, this.searchIndex = 0;
    }
    return this.searchIndex = Math.max(0, this.buffer.length - 1), o;
  }
  flush() {
    return this.buffer.length ? this.decode(`
`) : [];
  }
};
Br.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Br.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function QE(e, t) {
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
var _r = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, zu = (e, t, n) => {
  if (e) {
    if (kE(_r, e)) return e;
    he(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(_r))}`);
  }
};
function Gn() {
}
function Jo(e, t, n) {
  return !t || _r[e] > _r[n] ? Gn : t[e].bind(t);
}
var ZE = {
  error: Gn,
  warn: Gn,
  info: Gn,
  debug: Gn
}, Yu = /* @__PURE__ */ new WeakMap();
function he(e) {
  var t;
  const n = e.logger, o = (t = e.logLevel) !== null && t !== void 0 ? t : "off";
  if (!n) return ZE;
  const r = Yu.get(n);
  if (r && r[0] === o) return r[1];
  const i = {
    error: Jo("error", n, o),
    warn: Jo("warn", n, o),
    info: Jo("info", n, o),
    debug: Jo("debug", n, o)
  };
  return Yu.set(n, [o, i]), i;
}
var bt = (e) => (e.options && (e.options = Object.assign({}, e.options), delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "x-goog-api-key" || t.toLowerCase() === "authorization" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), jE = class Bn {
  constructor(t, n, o) {
    this.iterator = t, this.controller = n, this.client = o;
  }
  static fromSSEResponse(t, n, o) {
    let r = !1;
    const i = o ? he(o) : console;
    function a() {
      return He(this, arguments, function* () {
        var c, d, h, f;
        if (r) throw new ke("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Ve(eI(t, n)), _; _ = yield B(g.next()), c = _.done, !c; m = !0) {
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
          if (Wi(y)) return yield B(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Bn(a, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    function i() {
      return He(this, arguments, function* () {
        var c, d, h, f;
        const p = new Br(), m = qf(t);
        try {
          for (var g = !0, _ = Ve(m), y; y = yield B(_.next()), c = y.done, !c; g = !0) {
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
      return He(this, arguments, function* () {
        var c, d, h, f;
        if (r) throw new ke("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        r = !0;
        let p = !1;
        try {
          try {
            for (var m = !0, g = Ve(i()), _; _ = yield B(g.next()), c = _.done, !c; m = !0) {
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
          if (Wi(y)) return yield B(void 0);
          throw y;
        } finally {
          p || n.abort();
        }
      });
    }
    return new Bn(a, n, o);
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
    return [new Bn(() => r(t), this.controller, this.client), new Bn(() => r(n), this.controller, this.client)];
  }
  toReadableStream() {
    const t = this;
    let n;
    return Bf({
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
        var o;
        await ((o = n.return) === null || o === void 0 ? void 0 : o.call(n));
      }
    });
  }
};
function eI(e, t) {
  return He(this, arguments, function* () {
    var o, r, i, a;
    if (!e.body)
      throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new ke("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new ke("Attempted to iterate over a response with no body");
    const u = new nI(), c = new Br(), d = qf(e.body);
    try {
      for (var h = !0, f = Ve(tI(d)), p; p = yield B(f.next()), o = p.done, !o; h = !0) {
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
function tI(e) {
  return He(this, arguments, function* () {
    var n, o, r, i;
    try {
      for (var a = !0, u = Ve(e), c; c = yield B(u.next()), n = c.done, !n; a = !0) {
        i = c.value, a = !1;
        const d = i;
        d != null && (yield yield B(d instanceof ArrayBuffer ? new Uint8Array(d) : typeof d == "string" ? Js(d) : d));
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
var nI = class {
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
    let [t, n, o] = oI(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function oI(e, t) {
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
async function rI(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, a = await (async () => {
    var u;
    if (t.options.stream)
      return he(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e) : jE.fromSSEResponse(n, t.controller, e);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const c = n.headers.get("content-type"), d = (u = c?.split(";")[0]) === null || u === void 0 ? void 0 : u.trim();
    return d?.includes("application/json") || d?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : await n.json() : await n.text();
  })();
  return he(e).debug(`[${o}] response parsed`, bt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
var iI = class Xf extends Promise {
  constructor(t, n, o = rI) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, this.client = t;
  }
  _thenUnwrap(t) {
    return new Xf(this.client, this.responsePromise, async (n, o) => t(await this.parseResponse(n, o), o));
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
}, Qf = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* sI(e) {
  if (!e) return;
  if (Qf in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : Vu(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = Vu(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [r, null]), yield [r, u]);
  }
}
var kn = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, a] of sI(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [Qf]: !0,
    values: t,
    nulls: n
  };
}, di = (e) => {
  var t, n, o, r, i;
  if (typeof globalThis.process < "u") return ((n = (t = globalThis.process.env) === null || t === void 0 ? void 0 : t[e]) === null || n === void 0 ? void 0 : n.trim()) || void 0;
  if (typeof globalThis.Deno < "u") return ((i = (r = (o = globalThis.Deno.env) === null || o === void 0 ? void 0 : o.get) === null || r === void 0 ? void 0 : r.call(o, e)) === null || i === void 0 ? void 0 : i.trim()) || void 0;
}, Zf, jf = class eh {
  constructor(t) {
    var n, o, r, i, a, u, c, { baseURL: d = di("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey: h = (n = di("GEMINI_API_KEY")) !== null && n !== void 0 ? n : null, apiVersion: f = "v1beta" } = t, p = gt(t, [
      "baseURL",
      "apiKey",
      "apiVersion"
    ]);
    const m = Object.assign(Object.assign({
      apiKey: h,
      apiVersion: f
    }, p), { baseURL: d || "https://generativelanguage.googleapis.com" });
    this.baseURL = m.baseURL, this.timeout = (o = m.timeout) !== null && o !== void 0 ? o : eh.DEFAULT_TIMEOUT, this.logger = (r = m.logger) !== null && r !== void 0 ? r : console;
    const g = "warn";
    this.logLevel = g, this.logLevel = (a = (i = zu(m.logLevel, "ClientOptions.logLevel", this)) !== null && i !== void 0 ? i : zu(di("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && a !== void 0 ? a : g, this.fetchOptions = m.fetchOptions, this.maxRetries = (u = m.maxRetries) !== null && u !== void 0 ? u : 2, this.fetch = (c = m.fetch) !== null && c !== void 0 ? c : UE(), this.encoder = GE, this._options = m, this.apiKey = h, this.apiVersion = f, this.clientAdapter = m.clientAdapter;
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
    const n = kn([t.headers]);
    if (!(n.values.has("authorization") || n.values.has("x-goog-api-key"))) {
      if (this.apiKey) return kn([{ "x-goog-api-key": this.apiKey }]);
      if (this.clientAdapter && this.clientAdapter.isVertexAI()) return kn([await this.clientAdapter.getAuthHeaders()]);
    }
  }
  stringifyQuery(t) {
    return BE(t);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${qE}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${ME()}`;
  }
  makeStatusError(t, n, o, r) {
    return $e.generate(t, n, o, r);
  }
  buildURL(t, n, o) {
    const r = !this.baseURLOverridden() && o || this.baseURL, i = NE(t) ? new URL(t) : new URL(r + (r.endsWith("/") && t.startsWith("/") ? t.slice(1) : t)), a = this.defaultQuery(), u = Object.fromEntries(i.searchParams);
    return (!Ju(a) || !Ju(u)) && (n = Object.assign(Object.assign(Object.assign({}, u), a), n)), typeof n == "object" && n && !Array.isArray(n) && (i.search = this.stringifyQuery(n)), i.toString();
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
    return new iI(this, this.makeRequest(t, n, void 0));
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
    if (he(this).debug(`[${p}] sending request`, bt({
      retryOfRequestLogID: o,
      method: u.method,
      url: h,
      options: u,
      headers: d.headers
    })), !((i = u.signal) === null || i === void 0) && i.aborted) throw new Xi();
    const _ = new AbortController(), y = await this.fetchWithTimeout(h, d, f, _).catch(zi), S = Date.now();
    if (y instanceof globalThis.Error) {
      const b = `retrying, ${n} attempts remaining`;
      if (!((a = u.signal) === null || a === void 0) && a.aborted) throw new Xi();
      const P = Wi(y) || /timed? ?out/i.test(String(y) + ("cause" in y ? String(y.cause) : ""));
      if (n)
        return he(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - ${b}`), he(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (${b})`, bt({
          retryOfRequestLogID: o,
          url: h,
          durationMs: S - g,
          message: y.message
        })), this.retryRequest(u, n, o ?? p);
      throw he(this).info(`[${p}] connection ${P ? "timed out" : "failed"} - error; no more retries left`), he(this).debug(`[${p}] connection ${P ? "timed out" : "failed"} (error; no more retries left)`, bt({
        retryOfRequestLogID: o,
        url: h,
        durationMs: S - g,
        message: y.message
      })), P ? new Nf() : new Gr({ cause: y });
    }
    const I = `[${p}${m}] ${d.method} ${h} ${y.ok ? "succeeded" : "failed"} with status ${y.status} in ${S - g}ms`;
    if (!y.ok) {
      const b = await this.shouldRetry(y);
      if (n && b) {
        const w = `retrying, ${n} attempts remaining`;
        return await OE(y.body), he(this).info(`${I} - ${w}`), he(this).debug(`[${p}] response error (${w})`, bt({
          retryOfRequestLogID: o,
          url: y.url,
          status: y.status,
          headers: y.headers,
          durationMs: S - g
        })), this.retryRequest(u, n, o ?? p, y.headers);
      }
      const P = b ? "error; no more retries left" : "error; not retryable";
      he(this).info(`${I} - ${P}`);
      const D = await y.text().catch((w) => zi(w).message), E = $E(D), L = E ? void 0 : D;
      throw he(this).debug(`[${p}] response error (${P})`, bt({
        retryOfRequestLogID: o,
        url: y.url,
        status: y.status,
        headers: y.headers,
        message: L,
        durationMs: Date.now() - g
      })), this.makeStatusError(y.status, E, L, y.headers);
    }
    return he(this).info(I), he(this).debug(`[${p}] response start`, bt({
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
    const i = n || {}, { signal: a, method: u } = i, c = gt(i, ["signal", "method"]), d = this._makeAbort(r);
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
    return await LE(a), this.makeRequest(t, n - 1, o);
  }
  calculateDefaultRetryTimeoutMillis(t, n) {
    const i = n - t;
    return Math.min(0.5 * Math.pow(2, i), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(t, { retryCount: n = 0 } = {}) {
    var o, r, i;
    const a = Object.assign({}, t), { method: u, path: c, query: d, defaultBaseURL: h } = a, f = this.buildURL(c, d, h);
    "timeout" in a && DE("timeout", a.timeout), a.timeout = (o = a.timeout) !== null && o !== void 0 ? o : this.timeout;
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
    let u = kn([
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
    const o = kn([n]);
    return ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof DataView || typeof t == "string" && o.values.has("content-type") || globalThis.Blob && t instanceof globalThis.Blob || t instanceof FormData || t instanceof URLSearchParams || globalThis.ReadableStream && t instanceof globalThis.ReadableStream ? {
      bodyHeaders: void 0,
      body: t
    } : typeof t == "object" && (Symbol.asyncIterator in t || Symbol.iterator in t && "next" in t && typeof t.next == "function") ? {
      bodyHeaders: void 0,
      body: FE(t)
    } : typeof t == "object" && o.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(t)
    } : this.encoder({
      body: t,
      headers: o
    });
  }
};
jf.DEFAULT_TIMEOUT = 6e4;
var oe = class extends jf {
  constructor() {
    super(...arguments), this.interactions = new Wf(this), this.webhooks = new Yf(this);
  }
};
Zf = oe;
oe.GeminiNextGenAPIClient = Zf;
oe.GeminiNextGenAPIClientError = ke;
oe.APIError = $e;
oe.APIConnectionError = Gr;
oe.APIConnectionTimeoutError = Nf;
oe.APIUserAbortError = Xi;
oe.NotFoundError = Lf;
oe.ConflictError = Uf;
oe.RateLimitError = Of;
oe.BadRequestError = kf;
oe.AuthenticationError = Df;
oe.InternalServerError = Gf;
oe.PermissionDeniedError = $f;
oe.UnprocessableEntityError = Ff;
oe.toFile = WE;
oe.Interactions = Wf;
oe.Webhooks = Yf;
function aI(e, t) {
  const n = {}, o = s(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function lI(e, t) {
  const n = {}, o = s(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function uI(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function cI(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  return o != null && l(n, ["sdkHttpResponse"], o), n;
}
function dI(e, t, n) {
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
function fI(e, t, n) {
  const o = {};
  let r = s(n, ["config", "method"]);
  if (r === void 0 && (r = "SUPERVISED_FINE_TUNING"), r === "SUPERVISED_FINE_TUNING") {
    const E = s(e, ["validationDataset"]);
    t !== void 0 && E != null && l(t, ["supervisedTuningSpec"], fi(E));
  } else if (r === "PREFERENCE_TUNING") {
    const E = s(e, ["validationDataset"]);
    t !== void 0 && E != null && l(t, ["preferenceOptimizationSpec"], fi(E));
  } else if (r === "DISTILLATION") {
    const E = s(e, ["validationDataset"]);
    t !== void 0 && E != null && l(t, ["distillationSpec"], fi(E));
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
function hI(e, t) {
  const n = {}, o = s(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = s(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = s(e, ["trainingDataset"]);
  i != null && II(i);
  const a = s(e, ["config"]);
  return a != null && dI(a, n), n;
}
function pI(e, t) {
  const n = {}, o = s(e, ["baseModel"]);
  o != null && l(n, ["baseModel"], o);
  const r = s(e, ["preTunedModel"]);
  r != null && l(n, ["preTunedModel"], r);
  const i = s(e, ["trainingDataset"]);
  i != null && wI(i, n, t);
  const a = s(e, ["config"]);
  return a != null && fI(a, n, t), n;
}
function mI(e, t) {
  const n = {}, o = s(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function gI(e, t) {
  const n = {}, o = s(e, ["name"]);
  return o != null && l(n, ["_url", "name"], o), n;
}
function _I(e, t, n) {
  const o = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function yI(e, t, n) {
  const o = {}, r = s(e, ["pageSize"]);
  t !== void 0 && r != null && l(t, ["_query", "pageSize"], r);
  const i = s(e, ["pageToken"]);
  t !== void 0 && i != null && l(t, ["_query", "pageToken"], i);
  const a = s(e, ["filter"]);
  return t !== void 0 && a != null && l(t, ["_query", "filter"], a), o;
}
function vI(e, t) {
  const n = {}, o = s(e, ["config"]);
  return o != null && _I(o, n), n;
}
function AI(e, t) {
  const n = {}, o = s(e, ["config"]);
  return o != null && yI(o, n), n;
}
function TI(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = s(e, ["tunedModels"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => th(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function SI(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["nextPageToken"]);
  r != null && l(n, ["nextPageToken"], r);
  const i = s(e, ["tuningJobs"]);
  if (i != null) {
    let a = i;
    Array.isArray(a) && (a = a.map((u) => ji(u))), l(n, ["tuningJobs"], a);
  }
  return n;
}
function EI(e, t) {
  const n = {}, o = s(e, ["name"]);
  o != null && l(n, ["model"], o);
  const r = s(e, ["name"]);
  return r != null && l(n, ["endpoint"], r), n;
}
function II(e, t) {
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
function wI(e, t, n) {
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
function th(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], cf(i));
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
  return p != null && l(n, ["tunedModel"], EI(p)), n;
}
function ji(e, t) {
  const n = {}, o = s(e, ["sdkHttpResponse"]);
  o != null && l(n, ["sdkHttpResponse"], o);
  const r = s(e, ["name"]);
  r != null && l(n, ["name"], r);
  const i = s(e, ["state"]);
  i != null && l(n, ["state"], cf(i));
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
    let Tt = E;
    Array.isArray(Tt) && (Tt = Tt.map((Le) => Le)), l(n, ["evaluateDatasetRuns"], Tt);
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
  const ue = s(e, ["serviceAccount"]);
  ue != null && l(n, ["serviceAccount"], ue);
  const z = s(e, ["tunedModelDisplayName"]);
  z != null && l(n, ["tunedModelDisplayName"], z);
  const W = s(e, ["tuningJobState"]);
  W != null && l(n, ["tuningJobState"], W);
  const K = s(e, ["veoTuningSpec"]);
  K != null && l(n, ["veoTuningSpec"], K);
  const me = s(e, ["distillationSamplingSpec"]);
  me != null && l(n, ["distillationSamplingSpec"], me);
  const Ye = s(e, ["tuningJobMetadata"]);
  return Ye != null && l(n, ["tuningJobMetadata"], Ye), n;
}
function CI(e, t) {
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
function fi(e, t) {
  const n = {}, o = s(e, ["gcsUri"]);
  o != null && l(n, ["validationDatasetUri"], o);
  const r = s(e, ["vertexDatasetResource"]);
  return r != null && l(n, ["validationDatasetUri"], r), n;
}
var bI = class extends it {
  constructor(e) {
    super(), this.apiClient = e, this.list = async (t = {}) => new Ot(rt.PAGED_ITEM_TUNING_JOBS, (n) => this.listInternal(n), await this.listInternal(t), t), this.get = async (t) => await this.getInternal(t), this.tune = async (t) => {
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
          state: Oi.JOB_STATE_QUEUED
        };
      }
    };
  }
  async getInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = gI(e);
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
      })), i.then((d) => ji(d));
    } else {
      const c = mI(e);
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
      })), i.then((d) => th(d));
    }
  }
  async listInternal(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = AI(e);
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
        const h = SI(d), f = new Au();
        return Object.assign(f, h), f;
      });
    } else {
      const c = vI(e);
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
        const h = TI(d), f = new Au();
        return Object.assign(f, h), f;
      });
    }
  }
  async cancel(e) {
    var t, n, o, r;
    let i, a = "", u = {};
    if (this.apiClient.isVertexAI()) {
      const c = lI(e);
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
        const h = cI(d), f = new Tu();
        return Object.assign(f, h), f;
      });
    } else {
      const c = aI(e);
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
        const h = uI(d), f = new Tu();
        return Object.assign(f, h), f;
      });
    }
  }
  async tuneInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) {
      const a = pI(e, e);
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
      })), o.then((u) => ji(u));
    } else throw new Error("This method is only supported by the Vertex AI.");
  }
  async tuneMldevInternal(e) {
    var t, n;
    let o, r = "", i = {};
    if (this.apiClient.isVertexAI()) throw new Error("This method is only supported by the Gemini Developer API.");
    {
      const a = hI(e);
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
      })), o.then((u) => CI(u));
    }
  }
}, RI = class {
  async download(e, t) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
}, PI = 1024 * 1024 * 8, MI = 3, xI = 1e3, NI = 2, yr = "x-goog-upload-status";
async function kI(e, t, n, o) {
  var r;
  const i = await nh(e, t, n, o), a = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[yr]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  return a.file;
}
async function DI(e, t, n, o) {
  var r;
  const i = await nh(e, t, n, o), a = await i?.json();
  if (((r = i?.headers) === null || r === void 0 ? void 0 : r[yr]) !== "final") throw new Error("Failed to upload file: Upload status is not finalized.");
  const u = ef(a), c = new z_();
  return Object.assign(c, u), c;
}
async function nh(e, t, n, o) {
  var r, i, a;
  let u = t;
  const c = o?.baseUrl || ((r = n.clientOptions.httpOptions) === null || r === void 0 ? void 0 : r.baseUrl);
  if (c) {
    const m = new URL(c), g = new URL(t);
    g.protocol = m.protocol, g.host = m.host, g.port = m.port, u = g.toString();
  }
  let d = 0, h = 0, f = new Bi(new Response()), p = "upload";
  for (d = e.size; h < d; ) {
    const m = Math.min(PI, d - h), g = e.slice(h, h + m);
    h + m >= d && (p += ", finalize");
    let _ = 0, y = xI;
    for (; _ < MI; ) {
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
      }), !((i = f?.headers) === null || i === void 0) && i[yr]) break;
      _++, await LI(y), y = y * NI;
    }
    if (h += m, ((a = f?.headers) === null || a === void 0 ? void 0 : a[yr]) !== "active") break;
    if (d <= h) throw new Error("All content has been uploaded, but the upload status is not finalized.");
  }
  return f;
}
async function $I(e) {
  return {
    size: e.size,
    type: e.type
  };
}
function LI(e) {
  return new Promise((t) => setTimeout(t, e));
}
var UI = class {
  async upload(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await kI(e, t, n, o);
  }
  async uploadToFileSearchStore(e, t, n, o) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await DI(e, t, n, o);
  }
  async stat(e) {
    if (typeof e == "string") throw new Error("File path is not supported in browser uploader.");
    return await $I(e);
  }
}, FI = class {
  create(e, t, n) {
    return new OI(e, t, n);
  }
}, OI = class {
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
}, Xu = "x-goog-api-key", GI = class {
  constructor(e) {
    this.apiKey = e;
  }
  async addAuthHeaders(e, t) {
    if (e.get(Xu) === null) {
      if (this.apiKey.startsWith("auth_tokens/")) throw new Error("Ephemeral tokens are only supported by the live API.");
      if (!this.apiKey) throw new Error("API key is missing. Please provide a valid API key.");
      e.append(Xu, this.apiKey);
    }
  }
}, BI = class {
  getNextGenClient() {
    var e;
    const t = this.httpOptions;
    if (this._nextGenClient === void 0) {
      const n = this.httpOptions;
      this._nextGenClient = new oe({
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
    const n = __(e.httpOptions, e.vertexai, void 0, void 0);
    n && (e.httpOptions ? e.httpOptions.baseUrl = n : e.httpOptions = { baseUrl: n }), this.apiVersion = e.apiVersion, this.httpOptions = e.httpOptions;
    const o = new GI(this.apiKey);
    this.apiClient = new LS({
      auth: o,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: "gl-node/web",
      uploader: new UI(),
      downloader: new RI()
    }), this.models = new nE(this.apiClient), this.live = new XS(this.apiClient, o, new FI()), this.batches = new Qy(this.apiClient), this.chats = new $v(this.models, this.apiClient), this.caches = new Nv(this.apiClient), this.files = new Wv(this.apiClient), this.operations = new oE(this.apiClient), this.authTokens = new TE(this.apiClient), this.tunings = new bI(this.apiClient), this.fileSearchStores = new PE(this.apiClient);
  }
};
function Qu(e) {
  try {
    return JSON.parse(e || "{}");
  } catch {
    return {};
  }
}
function vr(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function kt(e) {
  return { text: String(e || "") };
}
function qI(e = "") {
  const t = String(e || "").match(/^data:([^;,]+);base64,(.+)$/);
  return t ? { inlineData: {
    mimeType: t[1],
    data: t[2]
  } } : null;
}
function HI(e) {
  if (typeof e == "string") return [kt(e)];
  if (!Array.isArray(e)) return [kt("")];
  const t = e.map((n) => !n || typeof n != "object" ? null : n.type === "text" ? kt(n.text || "") : n.type === "image_url" && n.image_url?.url ? qI(n.image_url.url) : null).filter(Boolean);
  return t.length ? t : [kt("")];
}
function Zu() {
  return {
    role: "user",
    parts: [kt("")]
  };
}
function Ao(e, t = "model") {
  if (!e?.parts?.length) return null;
  const n = vr(e);
  return n ? (n.role || (n.role = t), n) : null;
}
function VI(e) {
  return !!e?.parts?.some((t) => typeof t?.thoughtSignature == "string" && t.thoughtSignature);
}
function JI(e) {
  return !!e?.parts?.some((t) => t?.functionCall?.name);
}
function ju(e, t, n = 0) {
  if (!e?.functionCall?.name) return "";
  const o = String(e.functionCall.id || "").trim();
  return o ? `id:${o}` : [
    String(n),
    String(e.functionCall.name || ""),
    String(t)
  ].join("\0");
}
function KI(e, t) {
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
function WI(e = [], t = "") {
  const n = e.map((h) => Ao(h, "model")).filter(Boolean);
  if (!n.length) return null;
  const o = [...n].reverse().find((h) => VI(h)) || null, r = [...n].reverse().find((h) => JI(h)) || null, i = o || r || n[n.length - 1], a = n.indexOf(i), u = vr(i);
  if (!u?.parts?.length) return n[n.length - 1];
  if (r) {
    const h = /* @__PURE__ */ new Map(), f = [];
    n.forEach((m, g) => {
      m.parts.forEach((_, y) => {
        const S = ju(_, y, g);
        if (!S) return;
        h.has(S) || f.push(S);
        const I = h.get(S);
        I ? h.set(S, KI(I, _)) : h.set(S, vr(_));
      });
    });
    const p = /* @__PURE__ */ new Set();
    u.parts = u.parts.map((m, g) => {
      const _ = ju(m, g, a);
      return _ ? (p.add(_), h.get(_) || m) : m;
    }), f.forEach((m) => {
      p.has(m) || (u.parts.push(h.get(m)), p.add(m));
    });
  }
  const c = String(t || ""), d = u.parts.filter((h) => !(typeof h?.text == "string" && !h?.thought));
  return u.parts = c ? [{ text: c }, ...d] : d, u.parts.length ? u : n[n.length - 1];
}
function ec(e) {
  const t = e?.candidates?.[0]?.content?.parts || [], n = t.filter((o) => !o?.thought && typeof o?.text == "string" && o.text).map((o) => o.text).join(`
`);
  return n || t.length ? n : typeof e?.text == "string" && e.text ? e.text : "";
}
function oh(e) {
  const t = Array.isArray(e?.functionCalls) ? e.functionCalls : [], n = (e?.candidates?.[0]?.content?.parts || []).map((o) => o?.functionCall || o).filter((o) => o && o.name);
  return t.length ? t : n;
}
function rh(e) {
  try {
    return JSON.stringify(e?.args || {});
  } catch {
    return "{}";
  }
}
function tc(e) {
  try {
    const t = JSON.parse(String(e || "{}"));
    return t && typeof t == "object" && !Array.isArray(t) ? t : null;
  } catch {
    return null;
  }
}
function zI(e, t) {
  const n = tc(e), o = tc(t);
  return n && o ? JSON.stringify({
    ...n,
    ...o
  }) : String(t || "").trim() || String(e || "{}");
}
function YI(e, t = "google-tool") {
  return oh(e).map((n, o) => {
    const r = String(n.id || "").trim();
    return {
      id: r || `${t}-${o + 1}`,
      name: n.name || "",
      arguments: rh(n),
      ...r ? {} : { providerId: "" }
    };
  }).filter((n) => n.name);
}
function XI(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let o = 0;
  function r(a, u, c, d) {
    return a.name = String(u.name || a.name || "").trim(), a.arguments = zI(a.arguments, d), c && (n.set(c, a), a.id !== c ? a.providerId = c : delete a.providerId), a;
  }
  function i(a) {
    return oh(a).forEach((u) => {
      const c = String(u?.name || "").trim();
      if (!c) return;
      const d = String(u?.id || "").trim(), h = rh(u);
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
function QI(e = []) {
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
function ZI(e) {
  switch (e) {
    case "minimal":
      return jt.MINIMAL;
    case "high":
      return jt.HIGH;
    case "medium":
      return jt.MEDIUM;
    default:
      return jt.LOW;
  }
}
function nc(e) {
  return (e?.candidates?.[0]?.content?.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function jI(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  if (t.length)
    return [...new Set(t)].join(`

`);
}
function ew(e) {
  const t = e?.providerPayload?.googleContent;
  return Ao(t, "model");
}
function tw(e) {
  const t = e?.providerPayload?.googleContents;
  if (!Array.isArray(t) || !t.length) {
    const n = ew(e);
    return n ? [n] : [];
  }
  return t.map((n) => Ao(n, "model")).filter(Boolean);
}
function Ks(e = []) {
  const t = (Array.isArray(e) ? e : []).map((n) => Ao(n, "model")).filter(Boolean);
  if (t.length)
    return {
      googleContent: t[t.length - 1],
      googleContents: t
    };
}
function nw(e) {
  const t = e?.candidates?.[0]?.content;
  return Ks(t ? [t] : []);
}
function ow(e) {
  return Ks(e ? [e] : []);
}
function ih(e) {
  try {
    if (typeof e?.getHistory == "function") return e.getHistory(!1);
  } catch {
    return [];
  }
  return Array.isArray(e?.history) ? vr(e.history) || [] : [];
}
function rw(e, t = 0) {
  return ih(e).slice(Math.max(0, t)).filter((n) => n?.role === "model").map((n) => Ao(n, "model")).filter(Boolean);
}
function iw(e) {
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
          response: Qu(h.content)
        } }), d += 1;
      }
      o.push({
        role: "user",
        parts: c
      }), a = d - 1;
      continue;
    }
    if (u.role === "assistant") {
      const c = tw(u);
      if (c.length) {
        o.push(...c);
        continue;
      }
    }
    if (u.role === "assistant" && Array.isArray(u.tool_calls) && u.tool_calls.length) {
      o.push({
        role: "model",
        parts: [...u.content ? [kt(u.content)] : [], ...u.tool_calls.map((c) => ({ functionCall: {
          ...(() => {
            const d = Object.prototype.hasOwnProperty.call(c, "providerToolCallId") ? String(c.providerToolCallId || "").trim() : String(c.id || "").trim();
            return d ? { id: d } : {};
          })(),
          name: c.function.name,
          args: Qu(c.function.arguments)
        } }))]
      });
      continue;
    }
    o.push({
      role: u.role === "assistant" ? "model" : "user",
      parts: HI(u.content)
    });
  }
  if (!o.length) return {
    history: [],
    latestMessage: Zu().parts
  };
  const i = o[o.length - 1];
  return i.role === "user" && i.parts?.length ? {
    history: o.slice(0, -1),
    latestMessage: i.parts
  } : {
    history: o,
    latestMessage: Zu().parts
  };
}
function sw(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function oc(e, t) {
  return `${String(e || "")}${String(t || "")}`;
}
var aw = class {
  constructor(e) {
    this.config = e, this.supportsSessionToolLoop = !0, this.activeChat = null, this.toolCallResponseSequence = 0, this.client = new BI({
      apiKey: e.apiKey,
      httpOptions: {
        baseUrl: String(e.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, ""),
        timeout: Number(e.timeoutMs) || 900 * 1e3
      }
    });
  }
  buildChatPayload(e) {
    const t = pe("google", this.config, e.reasoning), n = iw(e.messages), o = Array.isArray(e.tools) ? e.tools : [], r = jI(e), i = {
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
      thinkingLevel: ZI(t.effort)
    } : J(t) && (i.thinkingConfig = { includeThoughts: !0 }), o.length && (i.tools = [{ functionDeclarations: o.map((a) => ({
      name: a.function.name,
      description: a.function.description,
      parameters: a.function.parameters
    })) }]), o.length) {
      const a = String(e.toolChoice || "auto").trim();
      i.toolConfig = { functionCallingConfig: a === "none" ? { mode: Zt.NONE } : a === "auto" ? { mode: Zt.AUTO } : a === "required" ? { mode: Zt.ANY } : {
        mode: Zt.ANY,
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
    const n = t.payload || this.buildChatPayload(e), o = pe("google", this.config, e.reasoning), r = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return lo({
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
      effectiveConfig: yt(e, {
        profileId: o.profileId,
        effectiveMode: o.mode,
        effort: n.createPayload.config?.thinkingConfig?.thinkingLevel,
        budgetTokens: n.createPayload.config?.thinkingConfig?.thinkingBudget,
        controlFields: n.createPayload.config?.thinkingConfig ? { thinkingConfig: n.createPayload.config.thinkingConfig } : {}
      })
    });
  }
  inspectSendRequest(e, t) {
    const n = pe("google", this.config, t.reasoning), o = String(this.config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    return lo({
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
    const u = `google-tool-${++this.toolCallResponseSequence}`, c = XI(u);
    let d = null;
    const h = n.signal ? {
      ...this.sessionConfig || {},
      abortSignal: n.signal
    } : void 0, f = {
      ...t,
      ...h ? { config: h } : {}
    }, p = typeof n.onStreamProgress == "function", m = ih(e).length;
    if (p) {
      const y = await e.sendMessageStream(f), S = /* @__PURE__ */ new Map();
      let I = "", b = null;
      const P = [];
      for await (const D of y) {
        b = D;
        const E = D?.candidates?.[0]?.content;
        E?.parts?.length && P.push(E), J(n.reasoning) && nc(D).forEach((w, M) => {
          const F = `${w.label}:${M}`;
          S.set(F, oc(S.get(F) || "", w.text));
        }), a = c.append(D);
        const L = ec(D);
        I = oc(I, L), sw(n, {
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
      }, d = WI(P, I) || o?.candidates?.[0]?.content || null, r = Array.from(S.values()).filter(Boolean).map((D, E) => ({
        label: `思考块 ${E + 1}`,
        text: D
      })), i = I;
    } else
      o = await e.sendMessage(f), r = J(n.reasoning) ? nc(o) : [], i = ec(o);
    const g = p ? a : YI(o, u), _ = rw(e, m);
    return {
      text: i,
      toolCalls: g,
      thoughts: r,
      finishReason: o.candidates?.[0]?.finishReason || "STOP",
      model: o.modelVersion || this.config.model,
      provider: "google",
      providerPayload: Ks(_) || ow(d) || nw(o)
    };
  }
  async chat(e) {
    if (Array.isArray(e.toolResponses) && e.toolResponses.length) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const o = { message: QI(e.toolResponses) };
      return {
        ...await this.sendThroughChat(this.activeChat, o, e),
        requestInspection: this.inspectSendRequest(o, e)
      };
    }
    const t = String(e.finalAnswerReminderText || "").trim();
    if (t) {
      if (!this.activeChat) throw new Error("google_chat_session_missing");
      const o = { message: [kt(t)] };
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
var sh = function() {
  const { crypto: e } = globalThis;
  if (e?.randomUUID)
    return sh = e.randomUUID.bind(e), e.randomUUID();
  const t = new Uint8Array(1), n = e ? () => e.getRandomValues(t)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (o) => (+o ^ n() & 15 >> +o / 4).toString(16));
};
function es(e) {
  return typeof e == "object" && e !== null && ("name" in e && e.name === "AbortError" || "message" in e && String(e.message).includes("FetchRequestCanceledException"));
}
var ts = (e) => {
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
}, ce = class ns extends U {
  constructor(t, n, o, r) {
    super(`${ns.makeMessage(t, n, o)}`), this.status = t, this.headers = r, this.requestID = r?.get("x-request-id"), this.error = n;
    const i = n;
    this.code = i?.code, this.param = i?.param, this.type = i?.type;
  }
  static makeMessage(t, n, o) {
    const r = n?.message ? typeof n.message == "string" ? n.message : JSON.stringify(n.message) : n ? JSON.stringify(n) : o;
    return t && r ? `${t} ${r}` : t ? `${t} status code (no body)` : r || "(no status code or body)";
  }
  static generate(t, n, o, r) {
    if (!t || !r) return new qr({
      message: o,
      cause: ts(n)
    });
    const i = n?.error;
    return t === 400 ? new ah(t, i, o, r) : t === 401 ? new lh(t, i, o, r) : t === 403 ? new uh(t, i, o, r) : t === 404 ? new ch(t, i, o, r) : t === 409 ? new dh(t, i, o, r) : t === 422 ? new fh(t, i, o, r) : t === 429 ? new hh(t, i, o, r) : t >= 500 ? new ph(t, i, o, r) : new ns(t, i, o, r);
  }
}, Ne = class extends ce {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}, qr = class extends ce {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}, Ws = class extends qr {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}, ah = class extends ce {
}, lh = class extends ce {
}, uh = class extends ce {
}, ch = class extends ce {
}, dh = class extends ce {
}, fh = class extends ce {
}, hh = class extends ce {
}, ph = class extends ce {
}, mh = class extends U {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}, gh = class extends U {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}, qn = class extends Error {
  constructor(e) {
    super(e);
  }
}, _h = class extends ce {
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
}, lw = class extends U {
  constructor(e, t, n) {
    super(e), this.provider = t, this.cause = n;
  }
}, uw = /^[a-z][a-z0-9+.-]*:/i, cw = (e) => uw.test(e), _e = (e) => (_e = Array.isArray, _e(e)), rc = _e;
function zs(e) {
  return typeof e != "object" ? {} : e ?? {};
}
function ic(e) {
  if (!e) return !0;
  for (const t in e) return !1;
  return !0;
}
function dw(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function hi(e) {
  return e != null && typeof e == "object" && !Array.isArray(e);
}
var fw = (e, t) => {
  if (typeof t != "number" || !Number.isInteger(t)) throw new U(`${e} must be an integer`);
  if (t < 0) throw new U(`${e} must be a positive integer`);
  return t;
}, hw = (e) => {
  try {
    return JSON.parse(e);
  } catch {
    return;
  }
}, To = (e) => new Promise((t) => setTimeout(t, e)), zt = "6.44.0", pw = () => typeof window < "u" && typeof window.document < "u" && typeof navigator < "u";
function mw() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
var gw = () => {
  const e = mw();
  if (e === "deno") return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": zt,
    "X-Stainless-OS": ac(Deno.build.os),
    "X-Stainless-Arch": sc(Deno.build.arch),
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
    "X-Stainless-OS": ac(globalThis.process.platform ?? "unknown"),
    "X-Stainless-Arch": sc(globalThis.process.arch ?? "unknown"),
    "X-Stainless-Runtime": "node",
    "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
  };
  const t = _w();
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
function _w() {
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
var sc = (e) => e === "x32" ? "x32" : e === "x86_64" || e === "x64" ? "x64" : e === "arm" ? "arm" : e === "aarch64" || e === "arm64" ? "arm64" : e ? `other:${e}` : "unknown", ac = (e) => (e = e.toLowerCase(), e.includes("ios") ? "iOS" : e === "android" ? "Android" : e === "darwin" ? "MacOS" : e === "win32" ? "Windows" : e === "freebsd" ? "FreeBSD" : e === "openbsd" ? "OpenBSD" : e === "linux" ? "Linux" : e ? `Other:${e}` : "Unknown"), lc, yw = () => lc ?? (lc = gw());
function yh() {
  if (typeof fetch < "u") return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function vh(...e) {
  const t = globalThis.ReadableStream;
  if (typeof t > "u") throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new t(...e);
}
function Ah(e) {
  let t = Symbol.asyncIterator in e ? e[Symbol.asyncIterator]() : e[Symbol.iterator]();
  return vh({
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
function Th(e) {
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
async function uc(e) {
  if (e === null || typeof e != "object") return;
  if (e[Symbol.asyncIterator]) {
    await e[Symbol.asyncIterator]().return?.();
    return;
  }
  const t = e.getReader(), n = t.cancel();
  t.releaseLock(), await n;
}
var vw = ({ headers: e, body: t }) => ({
  bodyHeaders: { "content-type": "application/json" },
  body: JSON.stringify(t)
}), Sh = "RFC3986", Eh = (e) => String(e), cc = {
  RFC1738: (e) => String(e).replace(/%20/g, "+"),
  RFC3986: Eh
};
var os = (e, t) => (os = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), os(e, t)), Ke = /* @__PURE__ */ (() => {
  const e = [];
  for (let t = 0; t < 256; ++t) e.push("%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase());
  return e;
})(), pi = 1024, Aw = (e, t, n, o, r) => {
  if (e.length === 0) return e;
  let i = e;
  if (typeof e == "symbol" ? i = Symbol.prototype.toString.call(e) : typeof e != "string" && (i = String(e)), n === "iso-8859-1") return escape(i).replace(/%u[0-9a-f]{4}/gi, function(u) {
    return "%26%23" + parseInt(u.slice(2), 16) + "%3B";
  });
  let a = "";
  for (let u = 0; u < i.length; u += pi) {
    const c = i.length >= pi ? i.slice(u, u + pi) : i, d = [];
    for (let h = 0; h < c.length; ++h) {
      let f = c.charCodeAt(h);
      if (f === 45 || f === 46 || f === 95 || f === 126 || f >= 48 && f <= 57 || f >= 65 && f <= 90 || f >= 97 && f <= 122 || r === "RFC1738" && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(h);
        continue;
      }
      if (f < 128) {
        d[d.length] = Ke[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = Ke[192 | f >> 6] + Ke[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = Ke[224 | f >> 12] + Ke[128 | f >> 6 & 63] + Ke[128 | f & 63];
        continue;
      }
      h += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(h) & 1023), d[d.length] = Ke[240 | f >> 18] + Ke[128 | f >> 12 & 63] + Ke[128 | f >> 6 & 63] + Ke[128 | f & 63];
    }
    a += d.join("");
  }
  return a;
};
function Tw(e) {
  return !e || typeof e != "object" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function dc(e, t) {
  if (_e(e)) {
    const n = [];
    for (let o = 0; o < e.length; o += 1) n.push(t(e[o]));
    return n;
  }
  return t(e);
}
var Ih = {
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
}, wh = function(e, t) {
  Array.prototype.push.apply(e, _e(t) ? t : [t]);
}, fc, ne = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: Aw,
  encodeValuesOnly: !1,
  format: Sh,
  formatter: Eh,
  indices: !1,
  serializeDate(e) {
    return (fc ?? (fc = Function.prototype.call.bind(Date.prototype.toISOString)))(e);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function Sw(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean" || typeof e == "symbol" || typeof e == "bigint";
}
var mi = {};
function Ch(e, t, n, o, r, i, a, u, c, d, h, f, p, m, g, _, y, S) {
  let I = e, b = S, P = 0, D = !1;
  for (; (b = b.get(mi)) !== void 0 && !D; ) {
    const F = b.get(e);
    if (P += 1, typeof F < "u") {
      if (F === P) throw new RangeError("Cyclic object value");
      D = !0;
    }
    typeof b.get(mi) > "u" && (P = 0);
  }
  if (typeof d == "function" ? I = d(t, I) : I instanceof Date ? I = p?.(I) : n === "comma" && _e(I) && (I = dc(I, function(F) {
    return F instanceof Date ? p?.(F) : F;
  })), I === null) {
    if (i) return c && !_ ? c(t, ne.encoder, y, "key", m) : t;
    I = "";
  }
  if (Sw(I) || Tw(I)) {
    if (c) {
      const F = _ ? t : c(t, ne.encoder, y, "key", m);
      return [g?.(F) + "=" + g?.(c(I, ne.encoder, y, "value", m))];
    }
    return [g?.(t) + "=" + g?.(String(I))];
  }
  const E = [];
  if (typeof I > "u") return E;
  let L;
  if (n === "comma" && _e(I))
    _ && c && (I = dc(I, c)), L = [{ value: I.length > 0 ? I.join(",") || null : void 0 }];
  else if (_e(d)) L = d;
  else {
    const F = Object.keys(I);
    L = h ? F.sort(h) : F;
  }
  const w = u ? String(t).replace(/\./g, "%2E") : String(t), M = o && _e(I) && I.length === 1 ? w + "[]" : w;
  if (r && _e(I) && I.length === 0) return M + "[]";
  for (let F = 0; F < L.length; ++F) {
    const H = L[F], ue = typeof H == "object" && typeof H.value < "u" ? H.value : I[H];
    if (a && ue === null) continue;
    const z = f && u ? H.replace(/\./g, "%2E") : H, W = _e(I) ? typeof n == "function" ? n(M, z) : M : M + (f ? "." + z : "[" + z + "]");
    S.set(e, P);
    const K = /* @__PURE__ */ new WeakMap();
    K.set(mi, S), wh(E, Ch(ue, W, n, o, r, i, a, u, n === "comma" && _ && _e(I) ? null : c, d, h, f, p, m, g, _, y, K));
  }
  return E;
}
function Ew(e = ne) {
  if (typeof e.allowEmptyArrays < "u" && typeof e.allowEmptyArrays != "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof e.encodeDotInKeys < "u" && typeof e.encodeDotInKeys != "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (e.encoder !== null && typeof e.encoder < "u" && typeof e.encoder != "function") throw new TypeError("Encoder has to be a function.");
  const t = e.charset || ne.charset;
  if (typeof e.charset < "u" && e.charset !== "utf-8" && e.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let n = Sh;
  if (typeof e.format < "u") {
    if (!os(cc, e.format)) throw new TypeError("Unknown format option provided.");
    n = e.format;
  }
  const o = cc[n];
  let r = ne.filter;
  (typeof e.filter == "function" || _e(e.filter)) && (r = e.filter);
  let i;
  if (e.arrayFormat && e.arrayFormat in Ih ? i = e.arrayFormat : "indices" in e ? i = e.indices ? "indices" : "repeat" : i = ne.arrayFormat, "commaRoundTrip" in e && typeof e.commaRoundTrip != "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const a = typeof e.allowDots > "u" ? e.encodeDotInKeys ? !0 : ne.allowDots : !!e.allowDots;
  return {
    addQueryPrefix: typeof e.addQueryPrefix == "boolean" ? e.addQueryPrefix : ne.addQueryPrefix,
    allowDots: a,
    allowEmptyArrays: typeof e.allowEmptyArrays == "boolean" ? !!e.allowEmptyArrays : ne.allowEmptyArrays,
    arrayFormat: i,
    charset: t,
    charsetSentinel: typeof e.charsetSentinel == "boolean" ? e.charsetSentinel : ne.charsetSentinel,
    commaRoundTrip: !!e.commaRoundTrip,
    delimiter: typeof e.delimiter > "u" ? ne.delimiter : e.delimiter,
    encode: typeof e.encode == "boolean" ? e.encode : ne.encode,
    encodeDotInKeys: typeof e.encodeDotInKeys == "boolean" ? e.encodeDotInKeys : ne.encodeDotInKeys,
    encoder: typeof e.encoder == "function" ? e.encoder : ne.encoder,
    encodeValuesOnly: typeof e.encodeValuesOnly == "boolean" ? e.encodeValuesOnly : ne.encodeValuesOnly,
    filter: r,
    format: n,
    formatter: o,
    serializeDate: typeof e.serializeDate == "function" ? e.serializeDate : ne.serializeDate,
    skipNulls: typeof e.skipNulls == "boolean" ? e.skipNulls : ne.skipNulls,
    sort: typeof e.sort == "function" ? e.sort : null,
    strictNullHandling: typeof e.strictNullHandling == "boolean" ? e.strictNullHandling : ne.strictNullHandling
  };
}
function Iw(e, t = {}) {
  let n = e;
  const o = Ew(t);
  let r, i;
  typeof o.filter == "function" ? (i = o.filter, n = i("", n)) : _e(o.filter) && (i = o.filter, r = i);
  const a = [];
  if (typeof n != "object" || n === null) return "";
  const u = Ih[o.arrayFormat], c = u === "comma" && o.commaRoundTrip;
  r || (r = Object.keys(n)), o.sort && r.sort(o.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let p = 0; p < r.length; ++p) {
    const m = r[p];
    o.skipNulls && n[m] === null || wh(a, Ch(n[m], m, u, c, o.allowEmptyArrays, o.strictNullHandling, o.skipNulls, o.encodeDotInKeys, o.encode ? o.encoder : null, o.filter, o.sort, o.allowDots, o.serializeDate, o.format, o.formatter, o.encodeValuesOnly, o.charset, d));
  }
  const h = a.join(o.delimiter);
  let f = o.addQueryPrefix === !0 ? "?" : "";
  return o.charsetSentinel && (o.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), h.length > 0 ? f + h : "";
}
function ww(e) {
  return Iw(e, { arrayFormat: "brackets" });
}
function Cw(e) {
  let t = 0;
  for (const r of e) t += r.length;
  const n = new Uint8Array(t);
  let o = 0;
  for (const r of e)
    n.set(r, o), o += r.length;
  return n;
}
var hc;
function Ys(e) {
  let t;
  return (hc ?? (t = new globalThis.TextEncoder(), hc = t.encode.bind(t)))(e);
}
var pc;
function mc(e) {
  let t;
  return (pc ?? (t = new globalThis.TextDecoder(), pc = t.decode.bind(t)))(e);
}
var Ie, we, Hr = class {
  constructor() {
    Ie.set(this, void 0), we.set(this, void 0), O(this, Ie, new Uint8Array(), "f"), O(this, we, null, "f");
  }
  decode(e) {
    if (e == null) return [];
    const t = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Ys(e) : e;
    O(this, Ie, Cw([T(this, Ie, "f"), t]), "f");
    const n = [];
    let o;
    for (; (o = bw(T(this, Ie, "f"), T(this, we, "f"))) != null; ) {
      if (o.carriage && T(this, we, "f") == null) {
        O(this, we, o.index, "f");
        continue;
      }
      if (T(this, we, "f") != null && (o.index !== T(this, we, "f") + 1 || o.carriage)) {
        n.push(mc(T(this, Ie, "f").subarray(0, T(this, we, "f") - 1))), O(this, Ie, T(this, Ie, "f").subarray(T(this, we, "f")), "f"), O(this, we, null, "f");
        continue;
      }
      const r = T(this, we, "f") !== null ? o.preceding - 1 : o.preceding, i = mc(T(this, Ie, "f").subarray(0, r));
      n.push(i), O(this, Ie, T(this, Ie, "f").subarray(o.index), "f"), O(this, we, null, "f");
    }
    return n;
  }
  flush() {
    return T(this, Ie, "f").length ? this.decode(`
`) : [];
  }
};
Ie = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakMap();
Hr.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
Hr.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function bw(e, t) {
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
function Rw(e) {
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
}, gc = (e, t, n) => {
  if (e) {
    if (dw(Ar, e)) return e;
    se(n).warn(`${t} was set to ${JSON.stringify(e)}, expected one of ${JSON.stringify(Object.keys(Ar))}`);
  }
};
function Hn() {
}
function Ko(e, t, n) {
  return !t || Ar[e] > Ar[n] ? Hn : t[e].bind(t);
}
var Pw = {
  error: Hn,
  warn: Hn,
  info: Hn,
  debug: Hn
}, _c = /* @__PURE__ */ new WeakMap();
function se(e) {
  const t = e.logger, n = e.logLevel ?? "off";
  if (!t) return Pw;
  const o = _c.get(t);
  if (o && o[0] === n) return o[1];
  const r = {
    error: Ko("error", t, n),
    warn: Ko("warn", t, n),
    info: Ko("info", t, n),
    debug: Ko("debug", t, n)
  };
  return _c.set(t, [n, r]), r;
}
var Rt = (e) => (e.options && (e.options = { ...e.options }, delete e.options.headers), e.headers && (e.headers = Object.fromEntries((e.headers instanceof Headers ? [...e.headers] : Object.entries(e.headers)).map(([t, n]) => [t, t.toLowerCase() === "authorization" || t.toLowerCase() === "api-key" || t.toLowerCase() === "x-api-key" || t.toLowerCase() === "cookie" || t.toLowerCase() === "set-cookie" ? "***" : n]))), "retryOfRequestLogID" in e && (e.retryOfRequestLogID && (e.retryOf = e.retryOfRequestLogID), delete e.retryOfRequestLogID), e), Dn, uo = class Vn {
  constructor(t, n, o) {
    this.iterator = t, Dn.set(this, void 0), this.controller = n, O(this, Dn, o, "f");
  }
  static fromSSEResponse(t, n, o, r) {
    let i = !1;
    const a = o ? se(o) : console;
    async function* u() {
      if (i) throw new U("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      i = !0;
      let c = !1;
      try {
        for await (const d of Mw(t, n))
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
              if (h && h.error) throw new ce(void 0, h.error, void 0, t.headers);
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
              if (d.event == "error") throw new ce(void 0, h.error, h.message, void 0);
              yield {
                event: d.event,
                data: h
              };
            }
          }
        c = !0;
      } catch (d) {
        if (es(d)) return;
        throw d;
      } finally {
        c || n.abort();
      }
    }
    return new Vn(u, n, o);
  }
  static fromReadableStream(t, n, o) {
    let r = !1;
    async function* i() {
      const u = new Hr(), c = Th(t);
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
        if (es(c)) return;
        throw c;
      } finally {
        u || n.abort();
      }
    }
    return new Vn(a, n, o);
  }
  [(Dn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
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
    return [new Vn(() => r(t), this.controller, T(this, Dn, "f")), new Vn(() => r(n), this.controller, T(this, Dn, "f"))];
  }
  toReadableStream() {
    const t = this;
    let n;
    return vh({
      async start() {
        n = t[Symbol.asyncIterator]();
      },
      async pull(o) {
        try {
          const { value: r, done: i } = await n.next();
          if (i) return o.close();
          const a = Ys(JSON.stringify(r) + `
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
async function* Mw(e, t) {
  if (!e.body)
    throw t.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new U("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new U("Attempted to iterate over a response with no body");
  const n = new Nw(), o = new Hr(), r = Th(e.body);
  for await (const i of xw(r)) for (const a of o.decode(i)) {
    const u = n.decode(a);
    u && (yield u);
  }
  for (const i of o.flush()) {
    const a = n.decode(i);
    a && (yield a);
  }
}
async function* xw(e) {
  let t = new Uint8Array();
  for await (const n of e) {
    if (n == null) continue;
    const o = n instanceof ArrayBuffer ? new Uint8Array(n) : typeof n == "string" ? Ys(n) : n;
    let r = new Uint8Array(t.length + o.length);
    r.set(t), r.set(o, t.length), t = r;
    let i;
    for (; (i = Rw(t)) !== -1; )
      yield t.slice(0, i), t = t.slice(i);
  }
  t.length > 0 && (yield t);
}
var Nw = class {
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
    let [t, n, o] = kw(e, ":");
    return o.startsWith(" ") && (o = o.substring(1)), t === "event" ? this.event = o : t === "data" && this.data.push(o), null;
  }
};
function kw(e, t) {
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
async function bh(e, t) {
  const { response: n, requestLogID: o, retryOfRequestLogID: r, startTime: i } = t, a = await (async () => {
    if (t.options.stream)
      return se(e).debug("response", n.status, n.url, n.headers, n.body), t.options.__streamClass ? t.options.__streamClass.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData) : uo.fromSSEResponse(n, t.controller, e, t.options.__synthesizeEventData);
    if (n.status === 204) return null;
    if (t.options.__binaryResponse) return n;
    const u = n.headers.get("content-type")?.split(";")[0]?.trim();
    return u?.includes("application/json") || u?.endsWith("+json") ? n.headers.get("content-length") === "0" ? void 0 : Rh(await n.json(), n) : await n.text();
  })();
  return se(e).debug(`[${o}] response parsed`, Rt({
    retryOfRequestLogID: r,
    url: n.url,
    status: n.status,
    body: a,
    durationMs: Date.now() - i
  })), a;
}
function Rh(e, t) {
  return !e || typeof e != "object" || Array.isArray(e) ? e : Object.defineProperty(e, "_request_id", {
    value: t.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Jn, Ph = class Mh extends Promise {
  constructor(t, n, o = bh) {
    super((r) => {
      r(null);
    }), this.responsePromise = n, this.parseResponse = o, Jn.set(this, void 0), O(this, Jn, t, "f");
  }
  _thenUnwrap(t) {
    return new Mh(T(this, Jn, "f"), this.responsePromise, async (n, o) => Rh(t(await this.parseResponse(n, o), o), o.response));
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
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((t) => this.parseResponse(T(this, Jn, "f"), t))), this.parsedPromise;
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
var Wo, Vr = class {
  constructor(e, t, n, o) {
    Wo.set(this, void 0), O(this, Wo, e, "f"), this.options = o, this.response = t, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e) throw new U("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await T(this, Wo, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(Wo = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages()) for (const t of e.getPaginatedItems()) yield t;
  }
}, Dw = class extends Ph {
  constructor(e, t, n) {
    super(e, t, async (o, r) => new n(o, r.response, await bh(o, r), r.options));
  }
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e) yield t;
  }
}, vt = class extends Vr {
  constructor(e, t, n, o) {
    super(e, t, n, o), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}, X = class extends Vr {
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
        ...zs(this.options.query),
        after: t
      }
    } : null;
  }
}, le = class extends Vr {
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
        ...zs(this.options.query),
        after: e
      }
    } : null;
  }
}, at = class extends Vr {
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
        ...zs(this.options.query),
        after: e
      }
    } : null;
  }
}, $w = {
  jwt: "urn:ietf:params:oauth:token-type:jwt",
  id: "urn:ietf:params:oauth:token-type:id_token"
}, Lw = "urn:ietf:params:oauth:grant-type:token-exchange", Uw = class {
  constructor(e, t) {
    this.cachedToken = null, this.refreshPromise = null, this.tokenExchangeUrl = "https://auth.openai.com/oauth/token", this.config = e, this.fetch = t ?? yh();
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
      grant_type: Lw,
      subject_token: await this.config.provider.getToken(),
      subject_token_type: $w[this.config.provider.tokenType],
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
      throw t.status === 400 || t.status === 401 || t.status === 403 ? new _h(t.status, a, t.headers) : ce.generate(t.status, a, `Token exchange failed with status ${t.status}`, t.headers);
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
}, xh = () => {
  if (typeof File > "u") {
    const { process: e } = globalThis, t = typeof e?.versions?.node == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (t ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function to(e, t, n) {
  return xh(), new File(e, t ?? "unknown_file", n);
}
function rr(e) {
  return (typeof e == "object" && e !== null && ("name" in e && e.name && String(e.name) || "url" in e && e.url && String(e.url) || "filename" in e && e.filename && String(e.filename) || "path" in e && e.path && String(e.path)) || "").split(/[\\/]/).pop() || void 0;
}
var Xs = (e) => e != null && typeof e == "object" && typeof e[Symbol.asyncIterator] == "function", Jr = async (e, t) => rs(e.body) ? {
  ...e,
  body: await Nh(e.body, t)
} : e, ze = async (e, t) => ({
  ...e,
  body: await Nh(e.body, t)
}), yc = /* @__PURE__ */ new WeakMap();
function Fw(e) {
  const t = typeof e == "function" ? e : e.fetch, n = yc.get(t);
  if (n) return n;
  const o = (async () => {
    try {
      const r = "Response" in t ? t.Response : (await t("data:,")).constructor, i = new FormData();
      return i.toString() !== await new r(i).text();
    } catch {
      return !0;
    }
  })();
  return yc.set(t, o), o;
}
var Nh = async (e, t) => {
  if (!await Fw(t)) throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const n = new FormData();
  return await Promise.all(Object.entries(e || {}).map(([o, r]) => is(n, o, r))), n;
}, kh = (e) => e instanceof Blob && "name" in e, Ow = (e) => typeof e == "object" && e !== null && (e instanceof Response || Xs(e) || kh(e)), rs = (e) => {
  if (Ow(e)) return !0;
  if (Array.isArray(e)) return e.some(rs);
  if (e && typeof e == "object") {
    for (const t in e) if (rs(e[t])) return !0;
  }
  return !1;
}, is = async (e, t, n) => {
  if (n !== void 0) {
    if (n == null) throw new TypeError(`Received null for "${t}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof n == "string" || typeof n == "number" || typeof n == "boolean") e.append(t, String(n));
    else if (n instanceof Response) e.append(t, to([await n.blob()], rr(n)));
    else if (Xs(n)) e.append(t, to([await new Response(Ah(n)).blob()], rr(n)));
    else if (kh(n)) e.append(t, n, rr(n));
    else if (Array.isArray(n)) await Promise.all(n.map((o) => is(e, t + "[]", o)));
    else if (typeof n == "object") await Promise.all(Object.entries(n).map(([o, r]) => is(e, `${t}[${o}]`, r)));
    else throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${n} instead`);
  }
}, Dh = (e) => e != null && typeof e == "object" && typeof e.size == "number" && typeof e.type == "string" && typeof e.text == "function" && typeof e.slice == "function" && typeof e.arrayBuffer == "function", Gw = (e) => e != null && typeof e == "object" && typeof e.name == "string" && typeof e.lastModified == "number" && Dh(e), Bw = (e) => e != null && typeof e == "object" && typeof e.url == "string" && typeof e.blob == "function";
async function qw(e, t, n) {
  if (xh(), e = await e, Gw(e))
    return e instanceof File ? e : to([await e.arrayBuffer()], e.name);
  if (Bw(e)) {
    const r = await e.blob();
    return t || (t = new URL(e.url).pathname.split(/[\\/]/).pop()), to(await ss(r), t, n);
  }
  const o = await ss(e);
  if (t || (t = rr(e)), !n?.type) {
    const r = o.find((i) => typeof i == "object" && "type" in i && i.type);
    typeof r == "string" && (n = {
      ...n,
      type: r
    });
  }
  return to(o, t, n);
}
async function ss(e) {
  let t = [];
  if (typeof e == "string" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) t.push(e);
  else if (Dh(e)) t.push(e instanceof Blob ? e : await e.arrayBuffer());
  else if (Xs(e)) for await (const n of e) t.push(...await ss(n));
  else {
    const n = e?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof e}${n ? `; constructor: ${n}` : ""}${Hw(e)}`);
  }
  return t;
}
function Hw(e) {
  return typeof e != "object" || e === null ? "" : `; props: [${Object.getOwnPropertyNames(e).map((t) => `"${t}"`).join(", ")}]`;
}
var R = class {
  constructor(e) {
    this._client = e;
  }
};
function $h(e) {
  return e.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var vc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), Vw = (e = $h) => function(n, ...o) {
  if (n.length === 1) return n[0];
  let r = !1;
  const i = [], a = n.reduce((h, f, p) => {
    /[?#]/.test(f) && (r = !0);
    const m = o[p];
    let g = (r ? encodeURIComponent : e)("" + m);
    return p !== o.length && (m == null || typeof m == "object" && m.toString === Object.getPrototypeOf(Object.getPrototypeOf(m.hasOwnProperty ?? vc) ?? vc)?.toString) && (g = m + "", i.push({
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
}, v = /* @__PURE__ */ Vw($h), Lh = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/chat/completions/${e}/messages`, X, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
};
function Tr(e) {
  return e !== void 0 && "function" in e && e.function !== void 0;
}
function Qs(e) {
  return e?.$brand === "auto-parseable-response-format";
}
function So(e) {
  return e?.$brand === "auto-parseable-tool";
}
function Jw(e, t) {
  return !t || !Uh(t) ? {
    ...e,
    choices: e.choices.map((n) => (Fh(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        parsed: null,
        ...n.message.tool_calls ? { tool_calls: n.message.tool_calls } : void 0
      }
    }))
  } : Zs(e, t);
}
function Zs(e, t) {
  const n = e.choices.map((o) => {
    if (o.finish_reason === "length") throw new mh();
    if (o.finish_reason === "content_filter") throw new gh();
    return Fh(o.message.tool_calls), {
      ...o,
      message: {
        ...o.message,
        ...o.message.tool_calls ? { tool_calls: o.message.tool_calls?.map((r) => Ww(t, r)) ?? void 0 } : void 0,
        parsed: o.message.content && !o.message.refusal ? Kw(t, o.message.content) : null
      }
    };
  });
  return {
    ...e,
    choices: n
  };
}
function Kw(e, t) {
  return e.response_format?.type !== "json_schema" ? null : e.response_format?.type === "json_schema" ? "$parseRaw" in e.response_format ? e.response_format.$parseRaw(t) : JSON.parse(t) : null;
}
function Ww(e, t) {
  const n = e.tools?.find((o) => Tr(o) && o.function?.name === t.function.name);
  return {
    ...t,
    function: {
      ...t.function,
      parsed_arguments: So(n) ? n.$parseRaw(t.function.arguments) : n?.function.strict ? JSON.parse(t.function.arguments) : null
    }
  };
}
function zw(e, t) {
  if (!e || !("tools" in e) || !e.tools) return !1;
  const n = e.tools?.find((o) => Tr(o) && o.function?.name === t.function.name);
  return Tr(n) && (So(n) || n?.function.strict || !1);
}
function Uh(e) {
  return Qs(e.response_format) ? !0 : e.tools?.some((t) => So(t) || t.type === "function" && t.function.strict === !0) ?? !1;
}
function Fh(e) {
  for (const t of e || []) if (t.type !== "function") throw new U(`Currently only \`function\` tool calls are supported; Received \`${t.type}\``);
}
function Yw(e) {
  for (const t of e ?? []) {
    if (t.type !== "function") throw new U(`Currently only \`function\` tool types support auto-parsing; Received \`${t.type}\``);
    if (t.function.strict !== !0) throw new U(`The \`${t.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
var Sr = (e) => e?.role === "assistant", Oh = (e) => e?.role === "tool", as, ir, sr, Kn, Wn, ar, zn, je, Yn, Er, Ir, Yt, Gh, js = class {
  constructor() {
    as.add(this), this.controller = new AbortController(), ir.set(this, void 0), sr.set(this, () => {
    }), Kn.set(this, () => {
    }), Wn.set(this, void 0), ar.set(this, () => {
    }), zn.set(this, () => {
    }), je.set(this, {}), Yn.set(this, !1), Er.set(this, !1), Ir.set(this, !1), Yt.set(this, !1), O(this, ir, new Promise((e, t) => {
      O(this, sr, e, "f"), O(this, Kn, t, "f");
    }), "f"), O(this, Wn, new Promise((e, t) => {
      O(this, ar, e, "f"), O(this, zn, t, "f");
    }), "f"), T(this, ir, "f").catch(() => {
    }), T(this, Wn, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, T(this, as, "m", Gh).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (T(this, sr, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return T(this, Yn, "f");
  }
  get errored() {
    return T(this, Er, "f");
  }
  get aborted() {
    return T(this, Ir, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(e, t) {
    return (T(this, je, "f")[e] || (T(this, je, "f")[e] = [])).push({ listener: t }), this;
  }
  off(e, t) {
    const n = T(this, je, "f")[e];
    if (!n) return this;
    const o = n.findIndex((r) => r.listener === t);
    return o >= 0 && n.splice(o, 1), this;
  }
  once(e, t) {
    return (T(this, je, "f")[e] || (T(this, je, "f")[e] = [])).push({
      listener: t,
      once: !0
    }), this;
  }
  emitted(e) {
    return new Promise((t, n) => {
      O(this, Yt, !0, "f"), e !== "error" && this.once("error", n), this.once(e, t);
    });
  }
  async done() {
    O(this, Yt, !0, "f"), await T(this, Wn, "f");
  }
  _emit(e, ...t) {
    if (T(this, Yn, "f")) return;
    e === "end" && (O(this, Yn, !0, "f"), T(this, ar, "f").call(this));
    const n = T(this, je, "f")[e];
    if (n && (T(this, je, "f")[e] = n.filter((o) => !o.once), n.forEach(({ listener: o }) => o(...t))), e === "abort") {
      const o = t[0];
      !T(this, Yt, "f") && !n?.length && Promise.reject(o), T(this, Kn, "f").call(this, o), T(this, zn, "f").call(this, o), this._emit("end");
      return;
    }
    if (e === "error") {
      const o = t[0];
      !T(this, Yt, "f") && !n?.length && Promise.reject(o), T(this, Kn, "f").call(this, o), T(this, zn, "f").call(this, o), this._emit("end");
    }
  }
  _emitFinal() {
  }
};
ir = /* @__PURE__ */ new WeakMap(), sr = /* @__PURE__ */ new WeakMap(), Kn = /* @__PURE__ */ new WeakMap(), Wn = /* @__PURE__ */ new WeakMap(), ar = /* @__PURE__ */ new WeakMap(), zn = /* @__PURE__ */ new WeakMap(), je = /* @__PURE__ */ new WeakMap(), Yn = /* @__PURE__ */ new WeakMap(), Er = /* @__PURE__ */ new WeakMap(), Ir = /* @__PURE__ */ new WeakMap(), Yt = /* @__PURE__ */ new WeakMap(), as = /* @__PURE__ */ new WeakSet(), Gh = function(t) {
  if (O(this, Er, !0, "f"), t instanceof Error && t.name === "AbortError" && (t = new Ne()), t instanceof Ne)
    return O(this, Ir, !0, "f"), this._emit("abort", t);
  if (t instanceof U) return this._emit("error", t);
  if (t instanceof Error) {
    const n = new U(t.message);
    return n.cause = t, this._emit("error", n);
  }
  return this._emit("error", new U(String(t)));
};
function Xw(e) {
  return typeof e.parse == "function";
}
var de, ls, wr, us, cs, ds, Bh, qh, Qw = 10, Hh = class extends js {
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
      if (this._emit("message", e), Oh(e) && e.content) this._emit("functionToolCallResult", e.content);
      else if (Sr(e) && e.tool_calls)
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
    return await this.done(), T(this, de, "m", ls).call(this);
  }
  async finalMessage() {
    return await this.done(), T(this, de, "m", wr).call(this);
  }
  async finalFunctionToolCall() {
    return await this.done(), T(this, de, "m", us).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), T(this, de, "m", cs).call(this);
  }
  async totalUsage() {
    return await this.done(), T(this, de, "m", ds).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const t = T(this, de, "m", wr).call(this);
    t && this._emit("finalMessage", t);
    const n = T(this, de, "m", ls).call(this);
    n && this._emit("finalContent", n);
    const o = T(this, de, "m", us).call(this);
    o && this._emit("finalFunctionToolCall", o);
    const r = T(this, de, "m", cs).call(this);
    r != null && this._emit("finalFunctionToolCallResult", r), this._chatCompletions.some((i) => i.usage) && this._emit("totalUsage", T(this, de, "m", ds).call(this));
  }
  async _createChatCompletion(e, t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), T(this, de, "m", Bh).call(this, t);
    const r = await e.chat.completions.create({
      ...t,
      stream: !1
    }, {
      ...n,
      signal: this.controller.signal
    });
    return this._connected(), this._addChatCompletion(Zs(r, t));
  }
  async _runChatCompletion(e, t, n) {
    for (const o of t.messages) this._addMessage(o, !1);
    return await this._createChatCompletion(e, t, n);
  }
  async _runTools(e, t, n) {
    const o = "tool", { tool_choice: r = "auto", stream: i, ...a } = t, u = typeof r != "string" && r.type === "function" && r?.function?.name, { maxChatCompletions: c = Qw } = n || {}, d = t.tools.map((p) => {
      if (So(p)) {
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
          b = Xw(I) ? await I.parse(S) : S;
        } catch (E) {
          const L = E instanceof Error ? E.message : String(E);
          this._addMessage({
            role: o,
            tool_call_id: _,
            content: L
          });
          continue;
        }
        const P = await I.function(b, this), D = T(this, de, "m", qh).call(this, P);
        if (this._addMessage({
          role: o,
          tool_call_id: _,
          content: D
        }), u) return;
      }
    }
  }
};
de = /* @__PURE__ */ new WeakSet(), ls = function() {
  return T(this, de, "m", wr).call(this).content ?? null;
}, wr = function() {
  let t = this.messages.length;
  for (; t-- > 0; ) {
    const n = this.messages[t];
    if (Sr(n)) return {
      ...n,
      content: n.content ?? null,
      refusal: n.refusal ?? null
    };
  }
  throw new U("stream ended without producing a ChatCompletionMessage with role=assistant");
}, us = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Sr(n) && n?.tool_calls?.length) for (let o = n.tool_calls.length - 1; o >= 0; o--) {
      const r = n.tool_calls[o];
      if (r?.type === "function") return r.function;
    }
  }
}, cs = function() {
  for (let t = this.messages.length - 1; t >= 0; t--) {
    const n = this.messages[t];
    if (Oh(n) && n.content != null && typeof n.content == "string" && this.messages.some((o) => o.role === "assistant" && o.tool_calls?.some((r) => r.type === "function" && r.id === n.tool_call_id))) return n.content;
  }
}, ds = function() {
  const t = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: n } of this._chatCompletions) n && (t.completion_tokens += n.completion_tokens, t.prompt_tokens += n.prompt_tokens, t.total_tokens += n.total_tokens);
  return t;
}, Bh = function(t) {
  if (t.n != null && t.n > 1) throw new U("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, qh = function(t) {
  return typeof t == "string" ? t : t === void 0 ? "undefined" : JSON.stringify(t);
};
var Zw = class Vh extends Hh {
  static runTools(t, n, o) {
    const r = new Vh(), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
  _addMessage(t, n = !0) {
    super._addMessage(t, n), Sr(t) && t.content && this._emit("content", t.content);
  }
}, re = {
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
}, jw = class extends Error {
}, eC = class extends Error {
};
function tC(e, t = re.ALL) {
  if (typeof e != "string") throw new TypeError(`expecting str, got ${typeof e}`);
  if (!e.trim()) throw new Error(`${e} is empty`);
  return nC(e.trim(), t);
}
var nC = (e, t) => {
  const n = e.length;
  let o = 0;
  const r = (p) => {
    throw new jw(`${p} at position ${o}`);
  }, i = (p) => {
    throw new eC(`${p} at position ${o}`);
  }, a = () => (f(), o >= n && r("Unexpected end of input"), e[o] === '"' ? u() : e[o] === "{" ? c() : e[o] === "[" ? d() : e.substring(o, o + 4) === "null" || re.NULL & t && n - o < 4 && "null".startsWith(e.substring(o)) ? (o += 4, null) : e.substring(o, o + 4) === "true" || re.BOOL & t && n - o < 4 && "true".startsWith(e.substring(o)) ? (o += 4, !0) : e.substring(o, o + 5) === "false" || re.BOOL & t && n - o < 5 && "false".startsWith(e.substring(o)) ? (o += 5, !1) : e.substring(o, o + 8) === "Infinity" || re.INFINITY & t && n - o < 8 && "Infinity".startsWith(e.substring(o)) ? (o += 8, 1 / 0) : e.substring(o, o + 9) === "-Infinity" || re.MINUS_INFINITY & t && 1 < n - o && n - o < 9 && "-Infinity".startsWith(e.substring(o)) ? (o += 9, -1 / 0) : e.substring(o, o + 3) === "NaN" || re.NAN & t && n - o < 3 && "NaN".startsWith(e.substring(o)) ? (o += 3, NaN) : h()), u = () => {
    const p = o;
    let m = !1;
    for (o++; o < n && (e[o] !== '"' || m && e[o - 1] === "\\"); )
      m = e[o] === "\\" ? !m : !1, o++;
    if (e.charAt(o) == '"') try {
      return JSON.parse(e.substring(p, ++o - Number(m)));
    } catch (g) {
      i(String(g));
    }
    else if (re.STR & t) try {
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
        if (f(), o >= n && re.OBJ & t) return p;
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
          if (re.OBJ & t) return p;
          throw g;
        }
        f(), e[o] === "," && o++;
      }
    } catch {
      if (re.OBJ & t) return p;
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
      if (re.ARR & t) return p;
      r("Expected ']' at end of array");
    }
    return o++, p;
  }, h = () => {
    if (o === 0) {
      e === "-" && re.NUM & t && r("Not sure what '-' is");
      try {
        return JSON.parse(e);
      } catch (m) {
        if (re.NUM & t) try {
          return e[e.length - 1] === "." ? JSON.parse(e.substring(0, e.lastIndexOf("."))) : JSON.parse(e.substring(0, e.lastIndexOf("e")));
        } catch {
        }
        i(String(m));
      }
    }
    const p = o;
    for (e[o] === "-" && o++; e[o] && !",]}".includes(e[o]); ) o++;
    o == n && !(re.NUM & t) && r("Unterminated number literal");
    try {
      return JSON.parse(e.substring(p, o));
    } catch {
      e.substring(p, o) === "-" && re.NUM & t && r("Not sure what '-' is");
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
}, Ac = (e) => tC(e, re.ALL ^ re.NUM), ee, Ze, Vt, dt, gi, zo, _i, yi, vi, Yo, Ai, Tc, Jh = class fs extends Hh {
  constructor(t) {
    super(), ee.add(this), Ze.set(this, void 0), Vt.set(this, void 0), dt.set(this, void 0), O(this, Ze, t, "f"), O(this, Vt, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return T(this, dt, "f");
  }
  static fromReadableStream(t) {
    const n = new fs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static createChatCompletion(t, n, o) {
    const r = new fs(n);
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
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), T(this, ee, "m", gi).call(this);
    const i = await t.chat.completions.create({
      ...n,
      stream: !0
    }, {
      ...o,
      signal: this.controller.signal
    });
    this._connected();
    for await (const a of i) T(this, ee, "m", _i).call(this, a);
    if (i.controller.signal?.aborted) throw new Ne();
    return this._addChatCompletion(T(this, ee, "m", Yo).call(this));
  }
  async _fromReadableStream(t, n) {
    const o = n?.signal;
    o && (o.aborted && this.controller.abort(), o.addEventListener("abort", () => this.controller.abort())), T(this, ee, "m", gi).call(this), this._connected();
    const r = uo.fromReadableStream(t, this.controller);
    let i;
    for await (const a of r)
      i && i !== a.id && this._addChatCompletion(T(this, ee, "m", Yo).call(this)), T(this, ee, "m", _i).call(this, a), i = a.id;
    if (r.controller.signal?.aborted) throw new Ne();
    return this._addChatCompletion(T(this, ee, "m", Yo).call(this));
  }
  [(Ze = /* @__PURE__ */ new WeakMap(), Vt = /* @__PURE__ */ new WeakMap(), dt = /* @__PURE__ */ new WeakMap(), ee = /* @__PURE__ */ new WeakSet(), gi = function() {
    this.ended || O(this, dt, void 0, "f");
  }, zo = function(n) {
    let o = T(this, Vt, "f")[n.index];
    return o || (o = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, T(this, Vt, "f")[n.index] = o, o);
  }, _i = function(n) {
    if (this.ended) return;
    const o = T(this, ee, "m", Tc).call(this, n);
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
      const a = T(this, ee, "m", zo).call(this, i);
      i.finish_reason && (T(this, ee, "m", vi).call(this, i), a.current_tool_call_index != null && T(this, ee, "m", yi).call(this, i, a.current_tool_call_index));
      for (const u of r.delta.tool_calls ?? [])
        a.current_tool_call_index !== u.index && (T(this, ee, "m", vi).call(this, i), a.current_tool_call_index != null && T(this, ee, "m", yi).call(this, i, a.current_tool_call_index)), a.current_tool_call_index = u.index;
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
  }, yi = function(n, o) {
    if (T(this, ee, "m", zo).call(this, n).done_tool_calls.has(o)) return;
    const r = n.message.tool_calls?.[o];
    if (!r) throw new Error("no tool call snapshot");
    if (!r.type) throw new Error("tool call snapshot missing `type`");
    if (r.type === "function") {
      const i = T(this, Ze, "f")?.tools?.find((a) => Tr(a) && a.function.name === r.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: r.function.name,
        index: o,
        arguments: r.function.arguments,
        parsed_arguments: So(i) ? i.$parseRaw(r.function.arguments) : i?.function.strict ? JSON.parse(r.function.arguments) : null
      });
    } else r.type;
  }, vi = function(n) {
    const o = T(this, ee, "m", zo).call(this, n);
    if (n.message.content && !o.content_done) {
      o.content_done = !0;
      const r = T(this, ee, "m", Ai).call(this);
      this._emit("content.done", {
        content: n.message.content,
        parsed: r ? r.$parseRaw(n.message.content) : null
      });
    }
    n.message.refusal && !o.refusal_done && (o.refusal_done = !0, this._emit("refusal.done", { refusal: n.message.refusal })), n.logprobs?.content && !o.logprobs_content_done && (o.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: n.logprobs.content })), n.logprobs?.refusal && !o.logprobs_refusal_done && (o.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: n.logprobs.refusal }));
  }, Yo = function() {
    if (this.ended) throw new U("stream has ended, this shouldn't happen");
    const n = T(this, dt, "f");
    if (!n) throw new U("request ended without sending any chunks");
    return O(this, dt, void 0, "f"), O(this, Vt, [], "f"), oC(n, T(this, Ze, "f"));
  }, Ai = function() {
    const n = T(this, Ze, "f")?.response_format;
    return Qs(n) ? n : null;
  }, Tc = function(n) {
    var o, r, i, a;
    let u = T(this, dt, "f");
    const { choices: c, ...d } = n;
    u ? Object.assign(u, d) : u = O(this, dt, {
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
      if (f && (_.finish_reason = f, T(this, Ze, "f") && Uh(T(this, Ze, "f")))) {
        if (f === "length") throw new mh();
        if (f === "content_filter") throw new gh();
      }
      if (Object.assign(_, g), !h) continue;
      const { content: y, refusal: S, function_call: I, role: b, tool_calls: P, ...D } = h;
      if (Object.assign(_.message, D), S && (_.message.refusal = (_.message.refusal || "") + S), b && (_.message.role = b), I && (_.message.function_call ? (I.name && (_.message.function_call.name = I.name), I.arguments && ((i = _.message.function_call).arguments ?? (i.arguments = ""), _.message.function_call.arguments += I.arguments)) : _.message.function_call = I), y && (_.message.content = (_.message.content || "") + y, !_.message.refusal && T(this, ee, "m", Ai).call(this) && (_.message.parsed = Ac(_.message.content))), P) {
        _.message.tool_calls || (_.message.tool_calls = []);
        for (const { index: E, id: L, type: w, function: M, ...F } of P) {
          const H = (a = _.message.tool_calls)[E] ?? (a[E] = {});
          Object.assign(H, F), L && (H.id = L), w && (H.type = w), M && (H.function ?? (H.function = {
            name: M.name ?? "",
            arguments: ""
          })), M?.name && (H.function.name = M.name), M?.arguments && (H.function.arguments += M.arguments, zw(T(this, Ze, "f"), H) && (H.function.parsed_arguments = Ac(H.function.arguments)));
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
    return new uo(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
};
function oC(e, t) {
  const { id: n, choices: o, created: r, model: i, system_fingerprint: a, ...u } = e;
  return Jw({
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
${Xo(e)}`);
            if (D == null) throw new U(`missing choices[${h}].tool_calls[${b}].type
${Xo(e)}`);
            if (M == null) throw new U(`missing choices[${h}].tool_calls[${b}].function.name
${Xo(e)}`);
            if (w == null) throw new U(`missing choices[${h}].tool_calls[${b}].function.arguments
${Xo(e)}`);
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
function Xo(e) {
  return JSON.stringify(e);
}
var rC = class hs extends Jh {
  static fromReadableStream(t) {
    const n = new hs(null);
    return n._run(() => n._fromReadableStream(t)), n;
  }
  static runTools(t, n, o) {
    const r = new hs(n), i = {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "runTools"
      }
    };
    return r._run(() => r._runTools(t, n, i)), r;
  }
}, ea = class extends R {
  constructor() {
    super(...arguments), this.messages = new Lh(this._client);
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
    return Yw(e.tools), this._client.chat.completions.create(e, {
      ...t,
      headers: {
        ...t?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => Zs(n, e));
  }
  runTools(e, t) {
    return e.stream ? rC.runTools(this._client, e, t) : Zw.runTools(this._client, e, t);
  }
  stream(e, t) {
    return Jh.createChatCompletion(this._client, e, t);
  }
};
ea.Messages = Lh;
var ta = class extends R {
  constructor() {
    super(...arguments), this.completions = new ea(this._client);
  }
};
ta.Completions = ea;
var Kh = class extends R {
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
}, Wh = class extends R {
  list(e = {}, t) {
    return this._client.getAPIList("/organization/audit_logs", le, {
      query: e,
      ...t,
      __security: { adminAPIKeyAuth: !0 }
    });
  }
}, zh = class extends R {
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
}, Yh = class extends R {
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
}, Xh = class extends R {
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
}, Qh = class extends R {
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
}, Zh = class extends R {
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
}, jh = class extends R {
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
}, ep = class extends R {
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
}, tp = class extends R {
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
}, Kr = class extends R {
  constructor() {
    super(...arguments), this.users = new tp(this._client), this.roles = new ep(this._client);
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
Kr.Users = tp;
Kr.Roles = ep;
var np = class extends R {
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
}, op = class extends R {
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
}, rp = class extends R {
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
}, ip = class extends R {
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
}, sp = class extends R {
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
}, ap = class extends R {
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
}, lp = class extends R {
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
}, up = class extends R {
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
}, cp = class extends R {
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
}, dp = class extends R {
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
}, na = class extends R {
  constructor() {
    super(...arguments), this.roles = new dp(this._client);
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
na.Roles = dp;
var fp = class extends R {
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
}, oa = class extends R {
  constructor() {
    super(...arguments), this.roles = new fp(this._client);
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
oa.Roles = fp;
var Re = class extends R {
  constructor() {
    super(...arguments), this.users = new oa(this._client), this.serviceAccounts = new up(this._client), this.apiKeys = new np(this._client), this.rateLimits = new ap(this._client), this.modelPermissions = new sp(this._client), this.hostedToolPermissions = new ip(this._client), this.groups = new na(this._client), this.roles = new lp(this._client), this.dataRetention = new rp(this._client), this.spendAlerts = new cp(this._client), this.certificates = new op(this._client);
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
Re.Users = oa;
Re.ServiceAccounts = up;
Re.APIKeys = np;
Re.RateLimits = ap;
Re.ModelPermissions = sp;
Re.HostedToolPermissions = ip;
Re.Groups = na;
Re.Roles = lp;
Re.DataRetention = rp;
Re.SpendAlerts = cp;
Re.Certificates = op;
var hp = class extends R {
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
}, ra = class extends R {
  constructor() {
    super(...arguments), this.roles = new hp(this._client);
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
ra.Roles = hp;
var Pe = class extends R {
  constructor() {
    super(...arguments), this.auditLogs = new Wh(this._client), this.adminAPIKeys = new Kh(this._client), this.usage = new jh(this._client), this.invites = new Xh(this._client), this.users = new ra(this._client), this.groups = new Kr(this._client), this.roles = new Qh(this._client), this.dataRetention = new Yh(this._client), this.spendAlerts = new Zh(this._client), this.certificates = new zh(this._client), this.projects = new Re(this._client);
  }
};
Pe.AuditLogs = Wh;
Pe.AdminAPIKeys = Kh;
Pe.Usage = jh;
Pe.Invites = Xh;
Pe.Users = ra;
Pe.Groups = Kr;
Pe.Roles = Qh;
Pe.DataRetention = Yh;
Pe.SpendAlerts = Zh;
Pe.Certificates = zh;
Pe.Projects = Re;
var ia = class extends R {
  constructor() {
    super(...arguments), this.organization = new Pe(this._client);
  }
};
ia.Organization = Pe;
var pp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* iC(e) {
  if (!e) return;
  if (pp in e) {
    const { values: o, nulls: r } = e;
    yield* o.entries();
    for (const i of r) yield [i, null];
    return;
  }
  let t = !1, n;
  e instanceof Headers ? n = e.entries() : rc(e) ? n = e : (t = !0, n = Object.entries(e ?? {}));
  for (let o of n) {
    const r = o[0];
    if (typeof r != "string") throw new TypeError("expected header name to be a string");
    const i = rc(o[1]) ? o[1] : [o[1]];
    let a = !1;
    for (const u of i)
      u !== void 0 && (t && !a && (a = !0, yield [r, null]), yield [r, u]);
  }
}
var k = (e) => {
  const t = new Headers(), n = /* @__PURE__ */ new Set();
  for (const o of e) {
    const r = /* @__PURE__ */ new Set();
    for (const [i, a] of iC(o)) {
      const u = i.toLowerCase();
      r.has(u) || (t.delete(i), r.add(u)), a === null ? (t.delete(i), n.add(u)) : (t.append(i, a), n.delete(u));
    }
  }
  return {
    [pp]: !0,
    values: t,
    nulls: n
  };
}, mp = class extends R {
  create(e, t) {
    return this._client.post("/audio/speech", {
      body: e,
      ...t,
      headers: k([{ Accept: "application/octet-stream" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, gp = class extends R {
  create(e, t) {
    return this._client.post("/audio/transcriptions", ze({
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, _p = class extends R {
  create(e, t) {
    return this._client.post("/audio/translations", ze({
      body: e,
      ...t,
      __metadata: { model: e.model },
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Eo = class extends R {
  constructor() {
    super(...arguments), this.transcriptions = new gp(this._client), this.translations = new _p(this._client), this.speech = new mp(this._client);
  }
};
Eo.Transcriptions = gp;
Eo.Translations = _p;
Eo.Speech = mp;
var yp = class extends R {
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
}, vp = class extends R {
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
}, Ap = class extends R {
  create(e, t) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Tp = class extends R {
  create(e, t) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...t,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, Wr = class extends R {
  constructor() {
    super(...arguments), this.sessions = new Ap(this._client), this.transcriptionSessions = new Tp(this._client);
  }
};
Wr.Sessions = Ap;
Wr.TranscriptionSessions = Tp;
var Sp = class extends R {
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
}, Ep = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/chatkit/threads/${e}`, {
      ...t,
      headers: k([{ "OpenAI-Beta": "chatkit_beta=v1" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  list(e = {}, t) {
    return this._client.getAPIList("/chatkit/threads", le, {
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
    return this._client.getAPIList(v`/chatkit/threads/${e}/items`, le, {
      query: t,
      ...n,
      headers: k([{ "OpenAI-Beta": "chatkit_beta=v1" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, zr = class extends R {
  constructor() {
    super(...arguments), this.sessions = new Sp(this._client), this.threads = new Ep(this._client);
  }
};
zr.Sessions = Sp;
zr.Threads = Ep;
var Ip = class extends R {
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
}, wp = class extends R {
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
}, sC = (e) => {
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
}, ae, Dt, ps, We, lr, Ue, $t, tn, Mt, Cr, Ce, ur, cr, no, Xn, Qn, Sc, Ec, Ic, wc, Cc, bc, Rc, oo = class extends js {
  constructor() {
    super(...arguments), ae.add(this), ps.set(this, []), We.set(this, {}), lr.set(this, {}), Ue.set(this, void 0), $t.set(this, void 0), tn.set(this, void 0), Mt.set(this, void 0), Cr.set(this, void 0), Ce.set(this, void 0), ur.set(this, void 0), cr.set(this, void 0), no.set(this, void 0);
  }
  [(ps = /* @__PURE__ */ new WeakMap(), We = /* @__PURE__ */ new WeakMap(), lr = /* @__PURE__ */ new WeakMap(), Ue = /* @__PURE__ */ new WeakMap(), $t = /* @__PURE__ */ new WeakMap(), tn = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap(), Cr = /* @__PURE__ */ new WeakMap(), Ce = /* @__PURE__ */ new WeakMap(), ur = /* @__PURE__ */ new WeakMap(), cr = /* @__PURE__ */ new WeakMap(), no = /* @__PURE__ */ new WeakMap(), ae = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
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
    const t = new Dt();
    return t._run(() => t._fromReadableStream(e)), t;
  }
  async _fromReadableStream(e, t) {
    const n = t?.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const o = uo.fromReadableStream(e, this.controller);
    for await (const r of o) T(this, ae, "m", Xn).call(this, r);
    if (o.controller.signal?.aborted) throw new Ne();
    return this._addRun(T(this, ae, "m", Qn).call(this));
  }
  toReadableStream() {
    return new uo(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, t, n, o) {
    const r = new Dt();
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
    for await (const u of a) T(this, ae, "m", Xn).call(this, u);
    if (a.controller.signal?.aborted) throw new Ne();
    return this._addRun(T(this, ae, "m", Qn).call(this));
  }
  static createThreadAssistantStream(e, t, n) {
    const o = new Dt();
    return o._run(() => o._threadAssistantStream(e, t, {
      ...n,
      headers: {
        ...n?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), o;
  }
  static createAssistantStream(e, t, n, o) {
    const r = new Dt();
    return r._run(() => r._runAssistantStream(e, t, n, {
      ...o,
      headers: {
        ...o?.headers,
        "X-Stainless-Helper-Method": "stream"
      }
    })), r;
  }
  currentEvent() {
    return T(this, ur, "f");
  }
  currentRun() {
    return T(this, cr, "f");
  }
  currentMessageSnapshot() {
    return T(this, Ue, "f");
  }
  currentRunStepSnapshot() {
    return T(this, no, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(T(this, We, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(T(this, lr, "f"));
  }
  async finalRun() {
    if (await this.done(), !T(this, $t, "f")) throw Error("Final run was not received.");
    return T(this, $t, "f");
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
    for await (const a of i) T(this, ae, "m", Xn).call(this, a);
    if (i.controller.signal?.aborted) throw new Ne();
    return this._addRun(T(this, ae, "m", Qn).call(this));
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
    for await (const u of a) T(this, ae, "m", Xn).call(this, u);
    if (a.controller.signal?.aborted) throw new Ne();
    return this._addRun(T(this, ae, "m", Qn).call(this));
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
      else if (hi(r) && hi(o)) r = this.accumulateDelta(r, o);
      else if (Array.isArray(r) && Array.isArray(o)) {
        if (r.every((i) => typeof i == "string" || typeof i == "number")) {
          r.push(...o);
          continue;
        }
        for (const i of o) {
          if (!hi(i)) throw new Error(`Expected array delta entry to be an object but got: ${i}`);
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
Dt = oo, Xn = function(t) {
  if (!this.ended)
    switch (O(this, ur, t, "f"), T(this, ae, "m", Ic).call(this, t), t.event) {
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
        T(this, ae, "m", Rc).call(this, t);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        T(this, ae, "m", Ec).call(this, t);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        T(this, ae, "m", Sc).call(this, t);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
    }
}, Qn = function() {
  if (this.ended) throw new U("stream has ended, this shouldn't happen");
  if (!T(this, $t, "f")) throw Error("Final run has not been received");
  return T(this, $t, "f");
}, Sc = function(t) {
  const [n, o] = T(this, ae, "m", Cc).call(this, t, T(this, Ue, "f"));
  O(this, Ue, n, "f"), T(this, lr, "f")[n.id] = n;
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
        if (r.index != T(this, tn, "f")) {
          if (T(this, Mt, "f")) switch (T(this, Mt, "f").type) {
            case "text":
              this._emit("textDone", T(this, Mt, "f").text, T(this, Ue, "f"));
              break;
            case "image_file":
              this._emit("imageFileDone", T(this, Mt, "f").image_file, T(this, Ue, "f"));
              break;
          }
          O(this, tn, r.index, "f");
        }
        O(this, Mt, n.content[r.index], "f");
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (T(this, tn, "f") !== void 0) {
        const r = t.data.content[T(this, tn, "f")];
        if (r) switch (r.type) {
          case "image_file":
            this._emit("imageFileDone", r.image_file, T(this, Ue, "f"));
            break;
          case "text":
            this._emit("textDone", r.text, T(this, Ue, "f"));
            break;
        }
      }
      T(this, Ue, "f") && this._emit("messageDone", t.data), O(this, Ue, void 0, "f");
  }
}, Ec = function(t) {
  const n = T(this, ae, "m", wc).call(this, t);
  switch (O(this, no, n, "f"), t.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", t.data);
      break;
    case "thread.run.step.delta":
      const o = t.data.delta;
      if (o.step_details && o.step_details.type == "tool_calls" && o.step_details.tool_calls && n.step_details.type == "tool_calls") for (const r of o.step_details.tool_calls) r.index == T(this, Cr, "f") ? this._emit("toolCallDelta", r, n.step_details.tool_calls[r.index]) : (T(this, Ce, "f") && this._emit("toolCallDone", T(this, Ce, "f")), O(this, Cr, r.index, "f"), O(this, Ce, n.step_details.tool_calls[r.index], "f"), T(this, Ce, "f") && this._emit("toolCallCreated", T(this, Ce, "f")));
      this._emit("runStepDelta", t.data.delta, n);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      O(this, no, void 0, "f"), t.data.step_details.type == "tool_calls" && T(this, Ce, "f") && (this._emit("toolCallDone", T(this, Ce, "f")), O(this, Ce, void 0, "f")), this._emit("runStepDone", t.data, n);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, Ic = function(t) {
  T(this, ps, "f").push(t), this._emit("event", t);
}, wc = function(t) {
  switch (t.event) {
    case "thread.run.step.created":
      return T(this, We, "f")[t.data.id] = t.data, t.data;
    case "thread.run.step.delta":
      let n = T(this, We, "f")[t.data.id];
      if (!n) throw Error("Received a RunStepDelta before creation of a snapshot");
      let o = t.data;
      if (o.delta) {
        const r = Dt.accumulateDelta(n, o.delta);
        T(this, We, "f")[t.data.id] = r;
      }
      return T(this, We, "f")[t.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      T(this, We, "f")[t.data.id] = t.data;
      break;
  }
  if (T(this, We, "f")[t.data.id]) return T(this, We, "f")[t.data.id];
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
        let a = n.content[i.index];
        n.content[i.index] = T(this, ae, "m", bc).call(this, i, a);
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
}, bc = function(t, n) {
  return Dt.accumulateDelta(n, t);
}, Rc = function(t) {
  switch (O(this, cr, t.data, "f"), t.event) {
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
      O(this, $t, t.data, "f"), T(this, Ce, "f") && (this._emit("toolCallDone", T(this, Ce, "f")), O(this, Ce, void 0, "f"));
      break;
    case "thread.run.cancelling":
      break;
  }
};
var sa = class extends R {
  constructor() {
    super(...arguments), this.steps = new wp(this._client);
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
    return oo.createAssistantStream(e, this._client.beta.threads.runs, t, n);
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
          await To(a);
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
    return oo.createAssistantStream(e, this._client.beta.threads.runs, t, n);
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
    return oo.createToolAssistantStream(e, this._client.beta.threads.runs, t, n);
  }
};
sa.Steps = wp;
var Yr = class extends R {
  constructor() {
    super(...arguments), this.runs = new sa(this._client), this.messages = new Ip(this._client);
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
    return oo.createThreadAssistantStream(e, this._client.beta.threads, t);
  }
};
Yr.Runs = sa;
Yr.Messages = Ip;
var pn = class extends R {
  constructor() {
    super(...arguments), this.realtime = new Wr(this._client), this.chatkit = new zr(this._client), this.assistants = new vp(this._client), this.threads = new Yr(this._client);
  }
};
pn.Realtime = Wr;
pn.ChatKit = zr;
pn.Assistants = vp;
pn.Threads = Yr;
var Cp = class extends R {
  create(e, t) {
    return this._client.post("/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    });
  }
}, bp = class extends R {
  retrieve(e, t, n) {
    const { container_id: o } = t;
    return this._client.get(v`/containers/${o}/files/${e}/content`, {
      ...n,
      headers: k([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, aa = class extends R {
  constructor() {
    super(...arguments), this.content = new bp(this._client);
  }
  create(e, t, n) {
    return this._client.post(v`/containers/${e}/files`, Jr({
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
aa.Content = bp;
var la = class extends R {
  constructor() {
    super(...arguments), this.files = new aa(this._client);
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
la.Files = aa;
var Rp = class extends R {
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
}, ua = class extends R {
  constructor() {
    super(...arguments), this.items = new Rp(this._client);
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
ua.Items = Rp;
var Pp = class extends R {
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
    return n ? r : (se(this._client).debug("embeddings/decoding base64 embeddings from base64"), r._thenUnwrap((i) => (i && i.data && i.data.forEach((a) => {
      const u = a.embedding;
      a.embedding = sC(u);
    }), i)));
  }
}, Mp = class extends R {
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
}, ca = class extends R {
  constructor() {
    super(...arguments), this.outputItems = new Mp(this._client);
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
ca.OutputItems = Mp;
var da = class extends R {
  constructor() {
    super(...arguments), this.runs = new ca(this._client);
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
da.Runs = ca;
var xp = class extends R {
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
      if (await To(t), i = await this.retrieve(e), Date.now() - r > n) throw new Ws({ message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.` });
    return i;
  }
}, Np = class extends R {
}, kp = class extends R {
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
}, fa = class extends R {
  constructor() {
    super(...arguments), this.graders = new kp(this._client);
  }
};
fa.Graders = kp;
var Dp = class extends R {
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
}, ha = class extends R {
  constructor() {
    super(...arguments), this.permissions = new Dp(this._client);
  }
};
ha.Permissions = Dp;
var $p = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/fine_tuning/jobs/${e}/checkpoints`, X, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, pa = class extends R {
  constructor() {
    super(...arguments), this.checkpoints = new $p(this._client);
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
pa.Checkpoints = $p;
var mn = class extends R {
  constructor() {
    super(...arguments), this.methods = new Np(this._client), this.jobs = new pa(this._client), this.checkpoints = new ha(this._client), this.alpha = new fa(this._client);
  }
};
mn.Methods = Np;
mn.Jobs = pa;
mn.Checkpoints = ha;
mn.Alpha = fa;
var Lp = class extends R {
}, ma = class extends R {
  constructor() {
    super(...arguments), this.graderModels = new Lp(this._client);
  }
};
ma.GraderModels = Lp;
var Up = class extends R {
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
}, Fp = class extends R {
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
}, Op = class extends R {
  create(e, t) {
    return this._client.post("/moderations", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Gp = class extends R {
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
}, Bp = class extends R {
  create(e, t) {
    return this._client.post("/realtime/client_secrets", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Xr = class extends R {
  constructor() {
    super(...arguments), this.clientSecrets = new Bp(this._client), this.calls = new Gp(this._client);
  }
};
Xr.ClientSecrets = Bp;
Xr.Calls = Gp;
function aC(e, t) {
  return !t || !uC(t) ? {
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
  } : qp(e, t);
}
function qp(e, t) {
  const n = e.output.map((r) => {
    if (r.type === "function_call") return {
      ...r,
      parsed_arguments: fC(t, r)
    };
    if (r.type === "message") {
      const i = r.content.map((a) => a.type === "output_text" ? {
        ...a,
        parsed: lC(t, a.text)
      } : a);
      return {
        ...r,
        content: i
      };
    }
    return r;
  }), o = Object.assign({}, e, { output: n });
  return Object.getOwnPropertyDescriptor(e, "output_text") || ms(o), Object.defineProperty(o, "output_parsed", {
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
function lC(e, t) {
  return e.text?.format?.type !== "json_schema" ? null : "$parseRaw" in e.text?.format ? (e.text?.format).$parseRaw(t) : JSON.parse(t);
}
function uC(e) {
  return !!Qs(e.text?.format);
}
function cC(e) {
  return e?.$brand === "auto-parseable-tool";
}
function dC(e, t) {
  return e.find((n) => n.type === "function" && n.name === t);
}
function fC(e, t) {
  const n = dC(e.tools ?? [], t.name);
  return {
    ...t,
    ...t,
    parsed_arguments: cC(n) ? n.$parseRaw(t.arguments) : n?.strict ? JSON.parse(t.arguments) : null
  };
}
function ms(e) {
  const t = [];
  for (const n of e.output)
    if (n.type === "message")
      for (const o of n.content) o.type === "output_text" && t.push(o.text);
  e.output_text = t.join("");
}
var Jt, Qo, ht, Zo, Pc, Mc, xc, Nc, hC = class Hp extends js {
  constructor(t) {
    super(), Jt.add(this), Qo.set(this, void 0), ht.set(this, void 0), Zo.set(this, void 0), O(this, Qo, t, "f");
  }
  static createResponse(t, n, o) {
    const r = new Hp(n);
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
    r && (r.aborted && this.controller.abort(), r.addEventListener("abort", () => this.controller.abort())), T(this, Jt, "m", Pc).call(this);
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
    for await (const u of i) T(this, Jt, "m", Mc).call(this, u, a);
    if (i.controller.signal?.aborted) throw new Ne();
    return T(this, Jt, "m", xc).call(this);
  }
  [(Qo = /* @__PURE__ */ new WeakMap(), ht = /* @__PURE__ */ new WeakMap(), Zo = /* @__PURE__ */ new WeakMap(), Jt = /* @__PURE__ */ new WeakSet(), Pc = function() {
    this.ended || O(this, ht, void 0, "f");
  }, Mc = function(n, o) {
    if (this.ended) return;
    const r = (a, u) => {
      (o == null || u.sequence_number > o) && this._emit(a, u);
    }, i = T(this, Jt, "m", Nc).call(this, n);
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
  }, xc = function() {
    if (this.ended) throw new U("stream has ended, this shouldn't happen");
    const n = T(this, ht, "f");
    if (!n) throw new U("request ended without sending any events");
    O(this, ht, void 0, "f");
    const o = pC(n, T(this, Qo, "f"));
    return O(this, Zo, o, "f"), o;
  }, Nc = function(n) {
    let o = T(this, ht, "f");
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
    const t = T(this, Zo, "f");
    if (!t) throw new U("stream ended without producing a ChatCompletion");
    return t;
  }
};
function pC(e, t) {
  return aC(e, t);
}
var Vp = class extends R {
  list(e, t = {}, n) {
    return this._client.getAPIList(v`/responses/${e}/input_items`, X, {
      query: t,
      ...n,
      __security: { bearerAuth: !0 }
    });
  }
}, Jp = class extends R {
  count(e = {}, t) {
    return this._client.post("/responses/input_tokens", {
      body: e,
      ...t,
      __security: { bearerAuth: !0 }
    });
  }
}, Qr = class extends R {
  constructor() {
    super(...arguments), this.inputItems = new Vp(this._client), this.inputTokens = new Jp(this._client);
  }
  create(e, t) {
    return this._client.post("/responses", {
      body: e,
      ...t,
      stream: e.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((n) => ("object" in n && n.object === "response" && ms(n), n));
  }
  retrieve(e, t = {}, n) {
    return this._client.get(v`/responses/${e}`, {
      query: t,
      ...n,
      stream: t?.stream ?? !1,
      __security: { bearerAuth: !0 }
    })._thenUnwrap((o) => ("object" in o && o.object === "response" && ms(o), o));
  }
  delete(e, t) {
    return this._client.delete(v`/responses/${e}`, {
      ...t,
      headers: k([{ Accept: "*/*" }, t?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
  parse(e, t) {
    return this._client.responses.create(e, t)._thenUnwrap((n) => qp(n, e));
  }
  stream(e, t) {
    return hC.createResponse(this._client, e, t);
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
Qr.InputItems = Vp;
Qr.InputTokens = Jp;
var Kp = class extends R {
  retrieve(e, t) {
    return this._client.get(v`/skills/${e}/content`, {
      ...t,
      headers: k([{ Accept: "application/binary" }, t?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, Wp = class extends R {
  retrieve(e, t, n) {
    const { skill_id: o } = t;
    return this._client.get(v`/skills/${o}/versions/${e}/content`, {
      ...n,
      headers: k([{ Accept: "application/binary" }, n?.headers]),
      __security: { bearerAuth: !0 },
      __binaryResponse: !0
    });
  }
}, ga = class extends R {
  constructor() {
    super(...arguments), this.content = new Wp(this._client);
  }
  create(e, t = {}, n) {
    return this._client.post(v`/skills/${e}/versions`, Jr({
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
ga.Content = Wp;
var Zr = class extends R {
  constructor() {
    super(...arguments), this.content = new Kp(this._client), this.versions = new ga(this._client);
  }
  create(e = {}, t) {
    return this._client.post("/skills", Jr({
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
Zr.Content = Kp;
Zr.Versions = ga;
var zp = class extends R {
  create(e, t, n) {
    return this._client.post(v`/uploads/${e}/parts`, ze({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, _a = class extends R {
  constructor() {
    super(...arguments), this.parts = new zp(this._client);
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
_a.Parts = zp;
var mC = async (e) => {
  const t = await Promise.allSettled(e), n = t.filter((r) => r.status === "rejected");
  if (n.length) {
    for (const r of n) console.error(r.reason);
    throw new Error(`${n.length} promise(s) failed - see the above errors`);
  }
  const o = [];
  for (const r of t) r.status === "fulfilled" && o.push(r.value);
  return o;
}, Yp = class extends R {
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
          await To(a);
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
    return await mC(Array(i).fill(u).map(d)), await this.createAndPoll(e, { file_ids: c });
  }
}, Xp = class extends R {
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
          await To(a);
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
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
}, jr = class extends R {
  constructor() {
    super(...arguments), this.files = new Xp(this._client), this.fileBatches = new Yp(this._client);
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
    return this._client.getAPIList(v`/vector_stores/${e}/search`, vt, {
      body: t,
      method: "post",
      ...n,
      headers: k([{ "OpenAI-Beta": "assistants=v2" }, n?.headers]),
      __security: { bearerAuth: !0 }
    });
  }
};
jr.Files = Xp;
jr.FileBatches = Yp;
var Qp = class extends R {
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
      headers: k([{ Accept: "application/binary" }, n?.headers]),
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
    return this._client.post(v`/videos/${e}/remix`, Jr({
      body: t,
      ...n,
      __security: { bearerAuth: !0 }
    }, this._client));
  }
}, Xt, Zp, dr, jp = class extends R {
  constructor() {
    super(...arguments), Xt.add(this);
  }
  async unwrap(e, t, n = this._client.webhookSecret, o = 300) {
    return await this.verifySignature(e, t, n, o), JSON.parse(e);
  }
  async verifySignature(e, t, n = this._client.webhookSecret, o = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function") throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    T(this, Xt, "m", Zp).call(this, n);
    const r = k([t]).values, i = T(this, Xt, "m", dr).call(this, r, "webhook-signature"), a = T(this, Xt, "m", dr).call(this, r, "webhook-timestamp"), u = T(this, Xt, "m", dr).call(this, r, "webhook-id"), c = parseInt(a, 10);
    if (isNaN(c)) throw new qn("Invalid webhook timestamp format");
    const d = Math.floor(Date.now() / 1e3);
    if (d - c > o) throw new qn("Webhook timestamp is too old");
    if (c > d + o) throw new qn("Webhook timestamp is too new");
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
    throw new qn("The given webhook signature does not match the expected signature");
  }
};
Xt = /* @__PURE__ */ new WeakSet(), Zp = function(t) {
  if (typeof t != "string" || t.length === 0) throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, dr = function(t, n) {
  if (!t) throw new Error("Headers are required");
  const o = t.get(n);
  if (o == null) throw new Error(`Missing required header: ${n}`);
  return o;
};
var gs, ya, fr, em, gC = "workload-identity-auth", q = class {
  constructor({ baseURL: e = ft("OPENAI_BASE_URL"), apiKey: t = ft("OPENAI_API_KEY") ?? null, adminAPIKey: n = ft("OPENAI_ADMIN_KEY") ?? null, organization: o = ft("OPENAI_ORG_ID") ?? null, project: r = ft("OPENAI_PROJECT_ID") ?? null, webhookSecret: i = ft("OPENAI_WEBHOOK_SECRET") ?? null, workloadIdentity: a, ...u } = {}) {
    gs.add(this), fr.set(this, void 0), this.completions = new Cp(this), this.chat = new ta(this), this.embeddings = new Pp(this), this.files = new xp(this), this.images = new Up(this), this.audio = new Eo(this), this.moderations = new Op(this), this.models = new Fp(this), this.fineTuning = new mn(this), this.graders = new ma(this), this.vectorStores = new jr(this), this.webhooks = new jp(this), this.beta = new pn(this), this.batches = new yp(this), this.uploads = new _a(this), this.admin = new ia(this), this.responses = new Qr(this), this.realtime = new Xr(this), this.conversations = new ua(this), this.evals = new da(this), this.containers = new la(this), this.skills = new Zr(this), this.videos = new Qp(this);
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
    if (!c.dangerouslyAllowBrowser && pw()) throw new U(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = c.baseURL, this.timeout = c.timeout ?? ya.DEFAULT_TIMEOUT, this.logger = c.logger ?? console;
    const d = "warn";
    this.logLevel = d, this.logLevel = gc(c.logLevel, "ClientOptions.logLevel", this) ?? gc(ft("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? d, this.fetchOptions = c.fetchOptions, this.maxRetries = c.maxRetries ?? 2, this.fetch = c.fetch ?? yh(), O(this, fr, vw, "f");
    const h = ft("OPENAI_CUSTOM_HEADERS");
    if (h) {
      const f = {};
      for (const p of h.split(`
`)) {
        const m = p.indexOf(":");
        m >= 0 && (f[p.substring(0, m).trim()] = p.substring(m + 1).trim());
      }
      c.defaultHeaders = k([f, c.defaultHeaders]);
    }
    this._options = c, a && (this._workloadIdentityAuth = new Uw(a, this.fetch)), this.apiKey = typeof t == "string" ? t : null, this.adminAPIKey = n, this.organization = o, this.project = r, this.webhookSecret = i;
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
    return ww(e);
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${zt}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${sh()}`;
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
    const o = !T(this, gs, "m", em).call(this) && n || this.baseURL, r = cw(e) ? new URL(e) : new URL(o + (o.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), i = this.defaultQuery(), a = Object.fromEntries(r.searchParams);
    return (!ic(i) || !ic(a)) && (t = {
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
    return new Ph(this, this.makeRequest(e, t, void 0));
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
    if (se(this).debug(`[${c}] sending request`, Rt({
      retryOfRequestLogID: n,
      method: o.method,
      url: a,
      options: o,
      headers: i.headers
    })), o.signal?.aborted) throw new Ne();
    const f = o.__security ?? { bearerAuth: !0 }, p = new AbortController(), m = await this.fetchWithAuth(a, i, u, p, f).catch(ts), g = Date.now();
    if (m instanceof globalThis.Error) {
      const y = `retrying, ${t} attempts remaining`;
      if (o.signal?.aborted) throw new Ne();
      const S = es(m) || /timed? ?out/i.test(String(m) + ("cause" in m ? String(m.cause) : ""));
      if (t)
        return se(this).info(`[${c}] connection ${S ? "timed out" : "failed"} - ${y}`), se(this).debug(`[${c}] connection ${S ? "timed out" : "failed"} (${y})`, Rt({
          retryOfRequestLogID: n,
          url: a,
          durationMs: g - h,
          message: m.message
        })), this.retryRequest(o, t, n ?? c);
      throw se(this).info(`[${c}] connection ${S ? "timed out" : "failed"} - error; no more retries left`), se(this).debug(`[${c}] connection ${S ? "timed out" : "failed"} (error; no more retries left)`, Rt({
        retryOfRequestLogID: n,
        url: a,
        durationMs: g - h,
        message: m.message
      })), m instanceof _h || m instanceof lw ? m : S ? new Ws() : new qr({
        message: _C(m),
        cause: m
      });
    }
    const _ = `[${c}${d}${[...m.headers.entries()].filter(([y]) => y === "x-request-id").map(([y, S]) => ", " + y + ": " + JSON.stringify(S)).join("")}] ${i.method} ${a} ${m.ok ? "succeeded" : "failed"} with status ${m.status} in ${g - h}ms`;
    if (!m.ok) {
      if (m.status === 401 && this._workloadIdentityAuth && f.bearerAuth && !o.__metadata?.hasStreamingBody && !o.__metadata?.workloadIdentityTokenRefreshed)
        return await uc(m.body), this._workloadIdentityAuth.invalidateToken(), this.makeRequest({
          ...o,
          __metadata: {
            ...o.__metadata,
            workloadIdentityTokenRefreshed: !0
          }
        }, t, n ?? c);
      const y = await this.shouldRetry(m);
      if (t && y) {
        const D = `retrying, ${t} attempts remaining`;
        return await uc(m.body), se(this).info(`${_} - ${D}`), se(this).debug(`[${c}] response error (${D})`, Rt({
          retryOfRequestLogID: n,
          url: m.url,
          status: m.status,
          headers: m.headers,
          durationMs: g - h
        })), this.retryRequest(o, t, n ?? c, m.headers);
      }
      const S = y ? "error; no more retries left" : "error; not retryable";
      se(this).info(`${_} - ${S}`);
      const I = await m.text().catch((D) => ts(D).message), b = hw(I), P = b ? void 0 : I;
      throw se(this).debug(`[${c}] response error (${S})`, Rt({
        retryOfRequestLogID: n,
        url: m.url,
        status: m.status,
        headers: m.headers,
        message: P,
        durationMs: Date.now() - h
      })), this.makeStatusError(m.status, b, P, m.headers);
    }
    return se(this).info(_), se(this).debug(`[${c}] response start`, Rt({
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
    return new Dw(this, n, e);
  }
  async fetchWithAuth(e, t, n, o, r = {
    bearerAuth: !0,
    adminAPIKeyAuth: !0
  }) {
    if (this._workloadIdentityAuth && r.bearerAuth) {
      const i = t.headers, a = i.get("Authorization");
      if (!a || a === `Bearer ${gC}`) {
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
    return await To(r), this.makeRequest(e, t - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const r = t - e;
    return Math.min(0.5 * Math.pow(2, r), 8) * (1 - Math.random() * 0.25) * 1e3;
  }
  async buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: o, path: r, query: i, defaultBaseURL: a } = n, u = this.buildURL(r, i, a);
    "timeout" in n && fw("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
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
        ...yw(),
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
      body: Ah(e),
      isStreamingBody: !0
    } : typeof e == "object" && n.values.get("content-type") === "application/x-www-form-urlencoded" ? {
      bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
      body: this.stringifyQuery(e),
      isStreamingBody: !1
    } : {
      ...T(this, fr, "f").call(this, {
        body: e,
        headers: n
      }),
      isStreamingBody: !1
    };
  }
};
ya = q, fr = /* @__PURE__ */ new WeakMap(), gs = /* @__PURE__ */ new WeakSet(), em = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
q.OpenAI = ya;
q.DEFAULT_TIMEOUT = 6e5;
q.OpenAIError = U;
q.APIError = ce;
q.APIConnectionError = qr;
q.APIConnectionTimeoutError = Ws;
q.APIUserAbortError = Ne;
q.NotFoundError = ch;
q.ConflictError = dh;
q.RateLimitError = hh;
q.BadRequestError = ah;
q.AuthenticationError = lh;
q.InternalServerError = ph;
q.PermissionDeniedError = uh;
q.UnprocessableEntityError = fh;
q.InvalidWebhookSignatureError = qn;
q.toFile = qw;
q.Completions = Cp;
q.Chat = ta;
q.Embeddings = Pp;
q.Files = xp;
q.Images = Up;
q.Audio = Eo;
q.Moderations = Op;
q.Models = Fp;
q.FineTuning = mn;
q.Graders = ma;
q.VectorStores = jr;
q.Webhooks = jp;
q.Beta = pn;
q.Batches = yp;
q.Uploads = _a;
q.Admin = ia;
q.Responses = Qr;
q.Realtime = Xr;
q.Conversations = ua;
q.Evals = da;
q.Containers = la;
q.Skills = Zr;
q.Videos = Qp;
function _C(e) {
  if (yC(e)) return "Connection error. This may be caused by passing an undici dispatcher, such as ProxyAgent, that is incompatible with the fetch implementation. If you are using undici's ProxyAgent, pass the fetch implementation from the same undici package: import { fetch, ProxyAgent } from 'undici'; new OpenAI({ fetch, fetchOptions: { dispatcher: new ProxyAgent(...) } });";
}
function yC(e) {
  let t = e;
  for (let n = 0; n < 8 && t && typeof t == "object"; n++) {
    const o = t;
    if (o.code === "UND_ERR_INVALID_ARG" && typeof o.message == "string" && o.message.includes("invalid onRequestStart method")) return !0;
    t = o.cause;
  }
  return !1;
}
function kc(e = "", t = 0) {
  let n = 0;
  for (let o = t - 1; o >= 0 && e[o] === "\\"; o -= 1) n += 1;
  return n % 2 === 1;
}
function vC(e = "") {
  return /^[0-9a-fA-F]{4}$/.test(e);
}
function AC(e = "") {
  return /^[dD][89a-bA-B][0-9a-fA-F]{2}$/.test(e);
}
function TC(e = "") {
  return /^[dD][c-fC-F][0-9a-fA-F]{2}$/.test(e);
}
function SC(e = "") {
  const t = String(e ?? "");
  let n = "", o = 0;
  for (; o < t.length; ) {
    const r = t.slice(o, o + 2), i = t.slice(o + 2, o + 6);
    if (r !== "\\u" || kc(t, o) || !vC(i)) {
      n += t[o] || "", o += 1;
      continue;
    }
    const a = o + 6, u = t.slice(a + 2, a + 6);
    if (AC(i) && t.slice(a, a + 2) === "\\u" && !kc(t, a) && TC(u)) {
      const c = Number.parseInt(i, 16), d = Number.parseInt(u, 16), h = 65536 + (c - 55296 << 10) + (d - 56320);
      n += String.fromCodePoint(h), o += 12;
      continue;
    }
    n += String.fromCharCode(Number.parseInt(i, 16)), o += 6;
  }
  return n;
}
function EC(e = "") {
  let t = String(e ?? "").trim();
  return t.endsWith(",") && (t = t.slice(0, -1).trimEnd()), t.startsWith('\\"') && (t = t.slice(2)), t.endsWith('\\"') && (t = t.slice(0, -2)), t.startsWith('"') && (t = t.slice(1)), t.endsWith('"') && (t = t.slice(0, -1)), SC(t.replace(/\r\n/g, `
`).replace(/\\r/g, "\r").replace(/\\n/g, `
`).replace(/\\t/g, "	").replace(/\\"/g, '"')).replace(/\\\\/g, "\\");
}
function IC(e = "") {
  return String(e || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function va(e = "", t = "", n = 0) {
  const o = new RegExp(`(^|[^A-Za-z0-9_])(?:\\\\?")?${IC(t)}(?:\\\\?")?\\s*:`, "i"), r = String(e || "").slice(Math.max(0, n)).match(o);
  if (!r || r.index === void 0) return null;
  const i = r[1]?.length || 0;
  return {
    key: t,
    index: Math.max(0, n) + r.index + i,
    end: Math.max(0, n) + r.index + r[0].length
  };
}
function wC(e = "", t = [], n = 0) {
  return t.map((o) => va(e, o, n)).filter(Boolean).sort((o, r) => o.index - r.index)[0] || null;
}
function Ge(e = "", t = "", n = []) {
  const o = String(e || ""), r = va(o, t);
  if (!r) return;
  let i = r.end;
  for (; /\s/.test(o[i] || ""); ) i += 1;
  o[i] === '"' && (i += 1);
  const a = wC(o, n.filter((d) => d !== t), i);
  let u = a ? a.index : o.length;
  if (a) {
    const d = o.lastIndexOf(",", a.index);
    d >= i && (u = d);
  }
  let c = o.slice(i, u).trim();
  return a || (c = c.replace(/\}\s*$/, "").trimEnd()), EC(c);
}
function et(e = "") {
  const t = String(e ?? "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : /^true$/i.test(t) ? !0 : /^false$/i.test(t) ? !1 : /^null$/i.test(t) ? null : t;
}
var Zn = {
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
}, CC = [
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
function Dc(e = "", t = [], n = []) {
  for (const o of t) {
    const r = Ge(e, o, n);
    if (r !== void 0) return r;
  }
}
function bC(e = "", t = "") {
  if (t === "Read") {
    const n = Zn.Read, o = {};
    return n.forEach((r, i) => {
      const a = Ge(e, r, n.slice(i + 1));
      a !== void 0 && (o[r] = et(a));
    }), o.filePath === void 0 && o.path !== void 0 && (o.filePath = o.path, delete o.path), o.filePath === void 0 && o.scope !== void 0 && (o.filePath = o.scope, delete o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "Write") {
    const n = {}, o = Dc(e, ["filePath", "path"], ["content"]), r = Ge(e, "content", []);
    return o !== void 0 && (n.filePath = et(o)), r !== void 0 && (n.content = et(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Edit") {
    const n = {}, o = Dc(e, ["filePath", "path"], ["edits"]), r = Ge(e, "edits", []);
    return o !== void 0 && (n.filePath = et(o)), r !== void 0 && (n.edits = et(r)), Object.keys(n).length ? n : null;
  }
  if (t === "Grep") {
    const n = Zn.Grep, o = {};
    return n.forEach((r) => {
      const i = Ge(e, r, n.filter((a) => a !== r));
      i !== void 0 && (o[r] = et(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), Object.keys(o).length ? o : null;
  }
  if (t === "MemoryGrep") {
    const n = Zn.MemoryGrep, o = {};
    return n.forEach((r) => {
      const i = Ge(e, r, n.filter((a) => a !== r));
      i !== void 0 && (o[r] = et(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.path === void 0 && o.scope !== void 0 && (o.path = o.scope), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  if (t === "ChatHistory") {
    const n = Zn.ChatHistory, o = {};
    return n.forEach((r) => {
      const i = Ge(e, r, n.filter((a) => a !== r));
      i !== void 0 && (o[r] = et(i));
    }), o.pattern === void 0 && o.query !== void 0 && (o.pattern = o.query), o.regex === void 0 && o.useRegex !== void 0 && (o.regex = o.useRegex), Object.keys(o).length ? o : null;
  }
  return null;
}
function RC(e = "", t = "") {
  const n = String(e || "").trim();
  if (!n) return null;
  try {
    const a = JSON.parse(n);
    if (a && typeof a == "object" && !Array.isArray(a)) return a;
  } catch {
  }
  const o = bC(n, t);
  if (o) return o;
  const r = Zn[t] || CC, i = {};
  return r.forEach((a, u) => {
    const c = Ge(n, a, r.slice(u + 1));
    c !== void 0 && (i[a] = et(c));
  }), Object.keys(i).length ? i : null;
}
function PC(e = "", t = "") {
  const n = RC(e, t);
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
function ve(e) {
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
  return PC(n, t) || JSON.stringify(tm(n));
}
function MC(e = "") {
  const t = String(e || ""), n = va(t, "arguments");
  if (!n) return "";
  let o = n.end;
  for (; /\s/.test(t[o] || ""); ) o += 1;
  const r = t[o] || "";
  return r === "{" ? t.slice(o).replace(/\}\s*$/, "").trimEnd() : r === '"' ? t.slice(o + 1).replace(/"\s*\}\s*$/, "").trimEnd() : t.slice(o).replace(/\}\s*$/, "").trimEnd();
}
function xC(e = "", t = 0) {
  const n = String(e || "").trim(), o = Ge(n, "name", ["id", "arguments"]) || Ge(n, "toolName", ["id", "arguments"]) || "", r = Ge(n, "id", [
    "name",
    "toolName",
    "arguments"
  ]) || `tool-call-${t + 1}`, i = MC(n);
  return !o || !i ? null : {
    id: r,
    name: o,
    arguments: om(i, o)
  };
}
function NC(e, t = 0, n = "openai-tool") {
  if (!Y(e)) return null;
  const o = Y(e.function) ? e.function : null, r = String(o?.name || "").trim();
  if (!r) return null;
  const i = ve(e) || {};
  return delete i.index, i.id = String(i.id || `${n}-${t + 1}`), i.type = "function", i.function = {
    ...ve(o) || {},
    name: r,
    arguments: nm(o.arguments)
  }, i;
}
function co(e = [], t = "openai-tool") {
  return (Array.isArray(e) ? e : []).map((n, o) => NC(n, o, t)).filter(Boolean);
}
function fo(e, t) {
  return Array.isArray(e) ? e.some((n) => fo(n, t)) : Y(e) ? Object.entries(e).some(([n, o]) => String(n || "").replace(/[_-]/g, "").toLowerCase() === "thoughtsignature" ? t(o) : (Array.isArray(o) || Y(o)) && fo(o, t)) : !1;
}
function kC(e) {
  return fo(e, (t) => typeof t == "string" && t.length > 0);
}
function _s(e) {
  return fo(e, () => !0);
}
function DC(e) {
  return fo(e, (t) => typeof t != "string" || t.length === 0);
}
function $C(e = {}) {
  return Array.isArray(e?.tool_calls) && e.tool_calls.some((t) => kC(t));
}
var $c = /* @__PURE__ */ new WeakSet();
function Aa(e) {
  if (!Y(e)) return null;
  const t = ve(e) || {};
  if (typeof t.content == "string" && /<tool_call\b/i.test(t.content) && (t.content = Nt(xt(t.content).cleaned)), Array.isArray(t.tool_calls)) {
    const n = co(t.tool_calls);
    n.length ? t.tool_calls = n : delete t.tool_calls;
  }
  return t;
}
function Ta(e = [], t = "openai-tool") {
  return co(e, t).map((n, o) => ({
    id: n.id || `${t}-${Date.now()}-${o + 1}`,
    name: n.function.name,
    arguments: n.function.arguments
  }));
}
function Sa(e) {
  return typeof e == "string" ? e : Array.isArray(e) ? e.map((t) => t ? typeof t == "string" ? t : t.text || t.content || "" : "").filter(Boolean).join(`
`) : "";
}
function xt(e = "") {
  const t = [];
  return {
    cleaned: String(e || "").replace(/<think>([\s\S]*?)<\/think>/gi, (n, o) => (Oe(t, "思考块", o), "")).trim(),
    thoughts: t
  };
}
function Nt(e = "") {
  const t = String(e || ""), n = t.search(/<tool_call\b/i);
  return n < 0 ? t.trim() : t.slice(0, n).trim();
}
function ys(e = "") {
  const t = String(e || "");
  return /<tool_call\b/i.test(t) ? [{
    id: "tagged-json-draft",
    name: t.match(/["']?name["']?\s*:\s*["']([^"']+)/i)?.[1] || "工具调用",
    arguments: "{}",
    draft: !0
  }] : [];
}
function Pt(e, t, n) {
  if (t) {
    if (typeof t == "string") {
      Oe(e, n, t);
      return;
    }
    if (Array.isArray(t)) {
      t.forEach((o) => Pt(e, o, n));
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
  return Pt(n, e.reasoning_content, "推理文本"), Pt(n, e.reasoning, "推理文本"), Pt(n, e.reasoning_text, "推理文本"), Pt(n, e.thinking, "思考块"), Pt(n, t.reasoning_content, "推理文本"), Pt(n, t.reasoning, "推理文本"), Array.isArray(e.content) && e.content.forEach((o) => {
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
function ro(e = "") {
  const t = [/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g], n = [];
  return t.forEach((o) => {
    [...e.matchAll(o)].forEach((r, i) => {
      try {
        const a = JSON.parse(r[1]);
        n.push({
          id: a.id || `tool-call-${i + 1}`,
          name: String(a.name || ""),
          arguments: om(a.arguments, a.name)
        });
      } catch {
        const a = xC(r[1], i);
        a && n.push(a);
      }
    });
  }), n.filter((o) => o.name);
}
function Ea(e) {
  const t = e?.providerPayload?.openaiCompatibleMessage;
  return !t || typeof t != "object" || Array.isArray(t) ? null : Aa(t);
}
function LC(e = []) {
  for (let t = e.length - 1; t >= 0; t -= 1) if (e[t]?.role === "user") return t;
  return -1;
}
function UC(e = {}) {
  const t = co(e?.tool_calls);
  if (t.length) return t;
  const n = co(Ea(e)?.tool_calls);
  return n.length ? n : [];
}
function FC(e = "") {
  return /deepseek/i.test(String(e || ""));
}
function OC(e = "") {
  return /claude/i.test(String(e || ""));
}
function GC(e = "") {
  return /^o(?:1|3|4)(?:-|$)/i.test(String(e || "").trim());
}
function rm(e = [], t = "") {
  if (!OC(t)) return e;
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
function Lc(e, t = "") {
  return !Y(e) || !FC(t) || !Array.isArray(e.tool_calls) || !e.tool_calls.length || Object.prototype.hasOwnProperty.call(e, "reasoning_content") ? e : {
    ...e,
    reasoning_content: ""
  };
}
var vs = /* @__PURE__ */ new Set([
  "content",
  "refusal",
  "arguments",
  "reasoning_content",
  "reasoning_text",
  "thinking",
  "text"
]);
function BC(e = [], t = []) {
  const n = Array.isArray(e) ? e.map((o) => ve(o) || {}) : [];
  return (Array.isArray(t) ? t : []).forEach((o, r) => {
    const i = ve(o) || {}, a = Number.isInteger(Number(o?.index)) ? Number(o.index) : r, u = n[a];
    n[a] = Y(u) ? Io(u, i, "tool_call") : i;
  }), n.filter((o) => o !== void 0);
}
function Io(e, t, n = "") {
  if (t === void 0) return e;
  if (e === void 0) return ve(t);
  if (t === null && vs.has(String(n || ""))) return e;
  if (n === "tool_calls" && Array.isArray(e) && Array.isArray(t)) return BC(e, t);
  if (typeof e == "string" && typeof t == "string")
    return vs.has(String(n || "")) ? e === t ? e : t.startsWith(e) ? t : e.startsWith(t) ? e : `${e}${t}` : e === t ? e : ve(t);
  if (Array.isArray(e) && Array.isArray(t)) return e.concat(ve(t) || []);
  if (Y(e) && Y(t)) {
    const o = { ...e };
    return Object.entries(t).forEach(([r, i]) => {
      o[r] = Io(o[r], i, r);
    }), o;
  }
  return ve(t);
}
function br(e = {}, t = {}) {
  const n = Y(e) ? ve(e) || {} : {}, o = Y(t) ? ve(t) || {} : {};
  return delete o.message, delete o.finish_reason, delete o.index, delete o.logprobs, delete o.delta, Object.entries(o).forEach(([r, i]) => {
    n[r] = Io(n[r], i, r);
  }), n.role || (n.role = "assistant"), Aa(n) || { role: "assistant" };
}
function io(e, t = {}) {
  const n = Aa(br(e, t));
  if (!(!n || typeof n != "object" || Array.isArray(n)))
    return { openaiCompatibleMessage: n };
}
function qC(e = {}, t = {}) {
  return Y(e) ? Y(t) ? Io(ve(e) || {}, t, "") : ve(e) : ve(t);
}
function As(e, t = "") {
  const n = Array.isArray(e.messages) ? e.messages : [], o = LC(n), r = [];
  let i = !1;
  n.forEach((u, c) => {
    if (i) {
      if (u?.role === "tool") return;
      i = !1;
    }
    const d = u?.role === "assistant", h = d ? u?.providerPayload?.openaiCompatibleMessage : null, f = sm(Array.isArray(h?.tool_calls) && h.tool_calls.some((S) => _s(S)) ? h.tool_calls : d && Array.isArray(u?.tool_calls) && u.tool_calls.some((S) => _s(S)) ? u.tool_calls : null);
    if (f) {
      const S = Y(h) ? h : u;
      (!Y(S) || !$c.has(S)) && (Y(S) && $c.add(S), console.warn("[LittleWhiteBox/OpenAI-compatible] skipped corrupted signed tool-call history", {
        code: "openai_compatible_signed_tool_call_history_corrupted",
        toolIndex: f.index,
        toolName: f.toolName,
        reason: f.reason
      })), i = !0;
      return;
    }
    const p = d ? co(u?.tool_calls) : [], m = d ? Ea(u) : null, g = Array.isArray(m?.tool_calls) ? m.tool_calls : [], _ = g.length > 0 && $C(m);
    if (g.length && c > o) {
      r.push(Lc({
        ...m,
        ...p.length && !_ ? { tool_calls: p } : {}
      }, t));
      return;
    }
    const y = {
      role: u.role,
      content: u.content
    };
    u.role === "tool" && u.tool_call_id && (y.tool_call_id = u.tool_call_id), _ ? y.tool_calls = g : p.length && (y.tool_calls = p), r.push(Lc(y, t));
  });
  const a = String(e.systemPrompt || "").trim();
  return a && r[0]?.role !== "system" && r.unshift({
    role: "system",
    content: a
  }), rm(r, t);
}
function Uc(e) {
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
function Ts(e, t = "") {
  const n = /* @__PURE__ */ new Map(), o = [];
  return (Array.isArray(e.messages) ? e.messages : []).forEach((r) => {
    if (r.role === "assistant") {
      const i = UC(r);
      if (i.length) {
        const a = Ea(r), u = typeof a?.content == "string" ? a.content : String(r.content || ""), c = i.map((d, h) => {
          const f = d.function?.name || "", p = d.id || `tool-call-${h + 1}`;
          return f && n.set(p, f), `<tool_call>${JSON.stringify({
            id: p,
            name: f,
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
    content: Uc(e)
  }) : o[0] = {
    ...o[0],
    content: Uc({
      ...e,
      systemPrompt: o[0].content || e.systemPrompt
    })
  }, rm(o, t);
}
function Fc(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: J(e.reasoning) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function $n(e, t = []) {
  return J(e.reasoning) ? t : [];
}
function im(e, t, n) {
  !e || !t || n === void 0 || (e[t] = Io(e[t], n, t));
}
function Rr(e, t, n) {
  if (!(!e || !t || n === void 0)) {
    if (Y(n)) {
      const o = Y(e[t]) ? { ...e[t] } : {};
      Object.entries(n).forEach(([r, i]) => {
        Rr(o, r, i);
      }), e[t] = o;
      return;
    }
    if (typeof n == "string" && vs.has(t)) {
      e[t] = typeof e[t] == "string" ? `${e[t]}${n}` : n;
      return;
    }
    n === "" && e[t] || im(e, t, n);
  }
}
function HC(e, t = []) {
  !Array.isArray(t) || !t.length || (Array.isArray(e.tool_calls) || (e.tool_calls = []), t.forEach((n) => {
    const o = Number(n?.index ?? 0), r = { ...e.tool_calls[o] || {} };
    Object.entries(n || {}).forEach(([i, a]) => {
      if (i !== "index" && !(i === "function" && a == null)) {
        if (i === "function" && Y(a)) {
          r.function = Y(r.function) ? { ...r.function } : {}, Object.entries(a).forEach(([u, c]) => {
            Rr(r.function, u, c);
          });
          return;
        }
        Rr(r, i, a);
      }
    }), e.tool_calls[o] = r;
  }));
}
function Ss(e, t = {}) {
  if (!e || !t || typeof t != "object") return;
  Object.entries(t).forEach(([o, r]) => {
    o === "delta" || o === "finish_reason" || o === "index" || o === "logprobs" || im(e, o, r);
  });
  const n = Y(t.delta) ? t.delta : {};
  Object.entries(n).forEach(([o, r]) => {
    if (o === "tool_calls") {
      HC(e, r);
      return;
    }
    Rr(e, o, r);
  });
}
function nn(e = {}) {
  return Sa(e?.content);
}
function on(e = {}) {
  return Ta(e?.tool_calls || []);
}
function VC(e) {
  if (typeof e != "string" || !e.trim()) return !1;
  try {
    return Y(JSON.parse(e));
  } catch {
    return !1;
  }
}
function sm(e) {
  if (!Array.isArray(e) || !e.some((t) => _s(t))) return null;
  for (let t = 0; t < e.length; t += 1) {
    const n = e[t], o = Y(n?.function) ? n.function : null, r = String(o?.name || "").trim();
    let i = "";
    if (!Y(n) || !o ? i = "invalid_function_shape" : r ? VC(o.arguments) ? DC(n) && (i = "invalid_thought_signature") : i = "invalid_function_arguments" : i = "missing_function_name", i) return {
      index: t,
      toolName: r,
      reason: i
    };
  }
  return null;
}
function rn(e = {}) {
  const t = sm(e?.tool_calls);
  if (!t) return;
  const n = /* @__PURE__ */ new Error("openai_compatible_signed_tool_call_corrupted");
  throw n.toolIndex = t.index, n.toolName = t.toolName, n.reason = t.reason, n;
}
async function JC(e, t) {
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
var KC = class {
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
    const t = pe("openai-compatible", this.config, e.reasoning), n = (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0, o = !n && Array.isArray(e.tools) && e.tools.length ? e.tools : null, r = {
      model: this.config.model,
      messages: n ? Ts(e, this.config.model) : As(e, this.config.model),
      ...o ? {
        tools: o,
        tool_choice: e.toolChoice || "auto"
      } : {},
      ...e.maxTokens ? GC(this.config.model) ? { max_completion_tokens: e.maxTokens } : { max_tokens: e.maxTokens } : {}
    };
    return !po({
      ...this.config,
      provider: "openai-compatible"
    }, t) && typeof e.temperature == "number" && (r.temperature = e.temperature), (t.mode === "on" || t.mode === "off") && (t.profileId.startsWith("openai-") || t.profileId === "kimi-k3" ? r.reasoning_effort = t.mode === "off" ? t.profileId === "kimi-k3" ? "off" : "none" : t.effort : t.profileId === "kimi-k2.5-k2.6" ? r.thinking = { type: t.mode === "off" ? "disabled" : "enabled" } : t.profileId === "deepseek-thinking" && (r.thinking = { type: t.mode === "off" ? "disabled" : "enabled" }, t.mode === "on" && (r.reasoning_effort = t.effort))), r;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = {
      ...t.body || this.buildRequestBody(e),
      ...n ? { stream: !0 } : {}
    }, r = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = pe("openai-compatible", this.config, e.reasoning), a = {
      ...Object.hasOwn(o, "reasoning_effort") ? { reasoning_effort: o.reasoning_effort } : {},
      ...Object.hasOwn(o, "thinking") ? { thinking: o.thinking } : {}
    };
    return { ...lo({
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
      effectiveConfig: yt(e, {
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
    await JC(o, (m) => {
      a = m?.model || a;
      const g = m?.choices?.[0];
      Ss(r, g), g?.finish_reason && (i = g.finish_reason);
      const _ = xt(nn(r)), y = on(r), S = y.length ? y : ys(_.cleaned);
      Fc(e, {
        text: y.length ? _.cleaned : Nt(_.cleaned),
        thoughts: $n(e, pt(r, g).concat(_.thoughts)),
        ...S.length ? { toolCalls: S } : {},
        ...!y.length && S.length ? { toolCallDraft: !0 } : {}
      });
    }), rn(r);
    const u = io(r), c = on(r), d = xt(nn(r)), h = pt(r, {});
    d.thoughts.forEach((m) => h.push(m));
    const f = c.length ? [] : ro(d.cleaned), p = [...c, ...f];
    return {
      text: c.length ? d.cleaned : Nt(d.cleaned),
      toolCalls: p,
      thoughts: $n(e, h),
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
        Ss(S, W), W?.finish_reason && (I = W.finish_reason);
        const K = xt(nn(S)), me = on(S), Ye = me.length ? me : ys(K.cleaned);
        Fc(e, {
          text: me.length ? K.cleaned : Nt(K.cleaned),
          thoughts: $n(e, pt(S, W).concat(K.thoughts)),
          ...Ye.length ? { toolCalls: Ye } : {},
          ...!me.length && Ye.length ? { toolCallDraft: !0 } : {}
        });
      }
      const D = (typeof y.finalChatCompletion == "function" ? await y.finalChatCompletion() : null)?.choices?.[0] || null, E = D?.message || S;
      rn(E);
      const L = qC(S, br(E, D || {}));
      rn(L), P = io(L);
      const w = on(L), M = xt(nn(L)), F = pt(L, D || {});
      M.thoughts.forEach((z) => F.push(z));
      const H = w.length ? [] : ro(M.cleaned), ue = [...w, ...H];
      return {
        text: w.length ? M.cleaned : Nt(M.cleaned),
        toolCalls: ue,
        thoughts: $n(e, F),
        finishReason: I,
        model: b,
        provider: "openai-compatible",
        providerPayload: P,
        requestInspection: r
      };
    }
    const a = await i((y) => this.client.chat.completions.create(y, { signal: e.signal })), u = a.choices?.[0] || {}, c = u.message || {};
    rn(c);
    const d = pt(c, u), h = Ta(c.tool_calls || []), f = xt(Sa(c.content));
    f.thoughts.forEach((y) => d.push(y));
    const p = h.length ? [] : ro(f.cleaned), m = [...h, ...p], g = h.length ? f.cleaned : Nt(f.cleaned), _ = br(c, u);
    return {
      text: g,
      toolCalls: m,
      thoughts: $n(e, d),
      finishReason: u.finish_reason || "stop",
      model: a.model || this.config.model,
      provider: "openai-compatible",
      providerPayload: io(_),
      requestInspection: r
    };
  }
};
function Ia(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function am(e, t) {
  return {
    type: "message",
    role: e,
    content: WC(t)
  };
}
function Pr(e) {
  return {
    role: "assistant",
    content: typeof e == "string" ? e : ""
  };
}
function WC(e) {
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
function Mr(e, t, n) {
  const o = String(n || "").trim();
  o && e.push({
    label: t,
    text: o
  });
}
function Oc(e, t = [], n = {}) {
  (t || []).forEach((o) => {
    if (!(!o || typeof o != "object")) {
      if (o.type === "reasoning_text") {
        Mr(e, n.reasoning || "推理文本", o.text);
        return;
      }
      o.type === "summary_text" && Mr(e, n.summary || "推理摘要", o.text);
    }
  });
}
function zC(e = []) {
  const t = [];
  return (e || []).forEach((n) => {
    !n || typeof n != "object" || n.type === "reasoning" && (Oc(t, n.content, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }), Oc(t, n.summary, {
      reasoning: "推理文本",
      summary: "推理摘要"
    }));
  }), t;
}
function YC(e) {
  const t = [String(e.systemPrompt || "").trim(), ...(e.messages || []).filter((n) => n.role === "system").map((n) => String(n.content || "").trim())].filter(Boolean);
  return t.length ? [...new Set(t)].join(`

`) : "";
}
function XC(e) {
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
function QC(e) {
  const t = e?.choices?.[0], n = t?.message?.content, o = String(t?.finish_reason || "");
  if (typeof n != "string" || !n.trim()) return null;
  const r = n.toLowerCase();
  return !r.includes("proxy error") || !r.includes("/responses") && !o.toLowerCase().includes("proxy error") ? null : n.trim();
}
function ZC(e) {
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
        t.push(...Ia(n.providerPayload.openAIResponseOutput) || []);
        continue;
      }
      if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
        n.content?.trim() && t.push(Pr(n.content)), n.tool_calls.forEach((o, r) => {
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
        t.push(Pr(n.content || ""));
        continue;
      }
      t.push(n.role === "user" ? am(n.role, n.content || "") : {
        role: n.role,
        content: typeof n.content == "string" ? n.content : ""
      });
    }
  return t;
}
function jC(e) {
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
      t.push(...Ia(n.providerPayload.openAIResponseOutput) || []);
      continue;
    }
    if (n.role === "assistant" && Array.isArray(n.tool_calls) && n.tool_calls.length) {
      n.content?.trim() && t.push(Pr(n.content)), n.tool_calls.forEach((o, r) => {
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
      t.push(Pr(n.content || ""));
      continue;
    }
    t.push(n.role === "user" ? am(n.role, n.content || "") : {
      role: n.role,
      content: typeof n.content == "string" ? n.content : ""
    });
  }
  return t;
}
function e0(e) {
  try {
    return new URL(String(e || "https://api.openai.com/v1")).hostname === "api.openai.com";
  } catch {
    return !1;
  }
}
function t0(e) {
  const t = String(e?.message || e || "").toLowerCase();
  return t.includes("instructions") || t.includes("unsupported") || t.includes("unknown parameter") || t.includes("invalid input");
}
function n0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {}
  });
}
function Ti(e, t) {
  const [n = "0", o = "0"] = String(e || "").split(":"), [r = "0", i = "0"] = String(t || "").split(":");
  return Number(n) - Number(r) || Number(o) - Number(i);
}
var o0 = class {
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
    const n = pe("openai-responses", this.config, e.reasoning), o = {
      model: this.config.model,
      instructions: t ? void 0 : YC(e) || void 0,
      input: t ? jC(e) : ZC(e),
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
    return !po({
      ...this.config,
      provider: "openai-responses"
    }, n) && typeof e.temperature == "number" && (o.temperature = e.temperature), n.mode === "on" || n.mode === "off" ? o.reasoning = {
      effort: n.mode === "off" ? "none" : n.effort,
      ...n.mode === "on" && J(n) ? { summary: "auto" } : {}
    } : J(n) && (o.reasoning = { summary: "auto" }), n.mode !== "off" && n.profileId.startsWith("openai-") && (o.include = ["reasoning.encrypted_content"]), o;
  }
  inspectRequest(e, t = {}) {
    const n = typeof e.onStreamProgress == "function", o = t.legacySystemInInput === !0, r = String(this.config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, ""), i = t.body || this.buildRequestBody(e, o), a = pe("openai-responses", this.config, e.reasoning);
    return lo({
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
      effectiveConfig: yt(e, {
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
      const d = QC(c);
      if (d) {
        const f = new Error(d);
        throw f.name = "ProxyEndpointError", f.rawDisplay = d, f;
      }
      const h = Array.isArray(c.output) ? c.output : [];
      return {
        output: h,
        thoughts: J(e.reasoning) ? zC(h) : [],
        toolCalls: h.filter((f) => f.type === "function_call" && f.name).map((f, p) => ({
          id: f.call_id || `response-tool-${p + 1}`,
          name: f.name || "",
          arguments: f.arguments || "{}"
        })),
        text: XC(c)
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
        J(e.reasoning) && (Array.from(p.entries()).sort(([y], [S]) => Ti(y, S)).forEach(([, y]) => Mr(_, "推理文本", y)), Array.from(m.entries()).sort(([y], [S]) => Ti(y, S)).forEach(([, y]) => Mr(_, "推理摘要", y))), n0(e, {
          text: Array.from(f.entries()).sort(([y], [S]) => Ti(y, S)).map(([, y]) => y).join(`
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
    }, i = !e0(this.config.baseUrl);
    let a, u;
    try {
      a = typeof e.onStreamProgress == "function" ? await r(!1) : await o(!1), u = n(a), i && !u.text && !u.toolCalls.length && (a = typeof e.onStreamProgress == "function" ? await r(!0) : await o(!0), u = n(a));
    } catch (c) {
      if (!i || !t0(c)) throw c;
      a = typeof e.onStreamProgress == "function" ? await r(!0) : await o(!0), u = n(a);
    }
    return {
      text: u.text,
      toolCalls: u.toolCalls,
      thoughts: u.thoughts,
      finishReason: a.incomplete_details?.reason || a.status || "stop",
      model: a.model || this.config.model,
      provider: "openai-responses",
      providerPayload: u.output.length ? { openAIResponseOutput: Ia(u.output) || [] } : void 0,
      requestInspection: t
    };
  }
};
async function r0(e, t) {
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
var wa = "openai", lm = "claude", um = "makersuite", i0 = "/api/backends/chat-completions/generate", s0 = Object.freeze({
  [lm]: "https://api.anthropic.com/v1",
  [um]: "https://generativelanguage.googleapis.com"
}), cm = null;
function a0(e) {
  return String(e || "").trim().replace(/\/+$/, "");
}
function l0(e = "") {
  return /^o(?:1|3|4)(?:-|$)/i.test(String(e || "").trim());
}
function u0(e, t) {
  const n = a0(e);
  return t === "claude" ? !n || /\/v\d[\w.-]*$/i.test(n) ? n : `${n}/v1` : t === "makersuite" ? n.replace(/\/v\d[\w.-]*$/i, "") : n;
}
function lb(e) {
  cm = typeof e == "function" ? e : null;
}
async function c0() {
  return {
    "Content-Type": "application/json",
    ...await Promise.resolve(cm?.() || {}),
    Accept: "application/json"
  };
}
function d0(e = {}) {
  const t = {};
  return Object.entries(e || {}).forEach(([n, o]) => {
    t[n] = /authorization|csrf|token|api[-_]?key/i.test(n) ? "[redacted]" : o;
  }), t;
}
async function wo(e = {}, t = !1) {
  const n = await c0(), o = {
    url: i0,
    method: "POST",
    headers: d0(n),
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
function f0(e = "") {
  return /^\s*(?:<!DOCTYPE\s+html\b|<html\b)/i.test(String(e || ""));
}
function h0(e = "") {
  return /invalid csrf token/i.test(String(e || ""));
}
function p0() {
  return "酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。";
}
function Gc(e = "", t = 10) {
  const n = Number.parseInt(String(e || ""), t);
  return Number.isInteger(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : "";
}
function Bc(e = "") {
  return String(e || "").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#x([0-9a-f]+);?/gi, (t, n) => Gc(n, 16)).replace(/&#([0-9]+);?/g, (t, n) => Gc(n));
}
function m0(e = "") {
  const t = String(e || ""), n = Bc((t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim(), o = Bc(t.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(), r = n || o;
  return r.length > 240 ? `${r.slice(0, 237)}...` : r;
}
function g0(e = null) {
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
function _0(e = {}) {
  return e.status ? `HTTP ${e.status}${e.statusText ? ` ${e.statusText}` : ""}` : "";
}
function xr(e = "", t = "", n = null) {
  if (h0(e)) return p0();
  const o = g0(n);
  if (f0(e) || /\btext\/html\b/i.test(o.contentType)) {
    const r = _0(o), i = m0(e);
    return [
      "酒馆后端返回了非 JSON 的 HTML 页面",
      r ? `（${r}）` : "",
      i ? `：${i}` : ""
    ].join("");
  }
  return String(e || t || "").trim();
}
function y0(e = {}, t = wa) {
  const n = u0(e.baseUrl, t), o = String(e.apiKey || "").trim(), r = s0[t] || "", i = n || (o ? r : ""), a = { chat_completion_source: t || "openai" };
  return i && (a.reverse_proxy = i), o && (a.proxy_password = o), a;
}
function v0(e = {}) {
  return Object.keys(e).forEach((t) => {
    (e[t] === void 0 || e[t] === "") && delete e[t];
  }), e;
}
function Ca(e = {}, t = {}, n = [], o = !1, r = wa) {
  const i = t.maxTokens, a = r === "openai" && l0(e.model);
  return v0({
    ...y0(e, r),
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
function A0(e = {}, t = {}, n = [], o = !1) {
  return Ca(e, t, n, o, wa);
}
function T0(e = {}, t = {}, n = [], o = !1) {
  return Ca(e, t, n, o, lm);
}
function S0(e = {}, t = {}, n = [], o = !1) {
  return Ca(e, t, n, o, um);
}
async function ba(e = {}, t = {}) {
  const n = await wo(e, !1);
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
    const u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${xr(r, String(a?.message || a), o)}`);
    throw u.status = o.status, u.body = r, u;
  }
  if (!o.ok || i?.error) {
    const a = xr(i?.error?.message || i?.message || r, `HTTP ${o.status}`, o), u = /* @__PURE__ */ new Error(`酒馆后端生成失败：${a}`);
    throw u.status = o.status, u.error = i?.error, u;
  }
  return i;
}
async function Ra(e = {}, t, n = {}) {
  const o = await wo(e, !0);
  typeof n.onRequest == "function" && n.onRequest(o);
  const r = await fetch(o.url, {
    method: o.method,
    headers: o.rawHeaders || o.headers,
    body: JSON.stringify(o.body),
    signal: n.signal
  });
  if (!r.ok) {
    const i = await r.text().catch(() => ""), a = new Error(xr(i, `酒馆后端流式生成失败：HTTP ${r.status}`, r));
    throw a.status = r.status, a.body = i, a;
  }
  typeof n.onResponseAccepted == "function" && n.onResponseAccepted(), await r0(r, (i) => {
    if (i?.error) {
      const a = xr(i.error?.message || i.message || JSON.stringify(i.error), "酒馆后端流式生成失败");
      throw new Error(a);
    }
    t(i);
  });
}
function Ut(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function E0(e) {
  const t = String(e || "").trim();
  if (!t || t === "auto") return "auto";
  if (t === "required") return "any";
  if (t === "none") return "none";
  throw new Error(`酒馆托管 Claude 不支持 tool_choice：${t}。仅支持 auto/required/none。`);
}
function I0(e = {}, t = {}) {
  if (!(Array.isArray(t.tools) && t.tools.length > 0)) return {
    toolChoice: void 0,
    reasoningDisabledForForcedTool: !1
  };
  const n = E0(t.toolChoice), o = pe("sillytavern-claude", e, t.reasoning), r = o.profileId === "sillytavern-claude-manual" || o.profileId === "sillytavern-claude-adaptive-conditional";
  return {
    toolChoice: n,
    reasoningDisabledForForcedTool: n === "any" && o.mode === "on" && r
  };
}
var w0 = "当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。";
function C0(e = {}, t = {}, n = {}) {
  const o = pe("sillytavern-claude", e, t.reasoning), r = n.reasoningDisabledForForcedTool ? "off" : o.mode;
  return yt(t, {
    profileId: o.profileId,
    effectiveMode: r,
    effort: r === "on" ? o.effort : "",
    controlFields: n.controlFields || {}
  });
}
function b0(e = {}, t = {}) {
  return { toolChoice: String(t.toolChoice || "") };
}
function dm(e = "") {
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
function R0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    const n = String(t?.function?.name || "").trim();
    if (!n) return null;
    const o = dm(t.function.arguments || "{}");
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
function P0(e = []) {
  const t = Array.isArray(e) ? Ut(e) : null;
  return Array.isArray(t) && t.length ? t : null;
}
function M0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = Ut(r) || {}, a = P0(i?.providerPayload?.anthropicContent), u = R0(i.tool_calls);
    delete i.providerPayload, i.role === "assistant" && a && u.length ? (delete i.tool_calls, i.content = a.filter((c) => c?.type !== "tool_use").concat(u)) : i.role === "assistant" && a && (delete i.tool_calls, i.content = a), n.push(i);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function x0(e = []) {
  return (Array.isArray(e) ? e : []).map((t) => {
    if (!t || typeof t != "object") return null;
    if (t.type === "text") return {
      type: "text",
      text: String(t.text || "")
    };
    if (t.type === "tool_use" && t.name) {
      if (t.inputJson !== void 0) {
        const o = dm(t.inputJson);
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
      const n = Ut(t.input);
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
    } : Ut(t) || null;
  }).filter(Boolean);
}
function N0(e = []) {
  return e.map((t) => !t || typeof t != "object" ? null : t.type === "tool_use" && t.name ? {
    type: "tool_use",
    id: t.id,
    name: t.name,
    input: Ut(t.input) || {}
  } : Ut(t) || null).filter(Boolean);
}
function k0(e = []) {
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
function fm(e = [], t = {}) {
  const n = x0(e), o = n.filter((r) => r.type === "tool_use" && r.name).map((r, i) => ({
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
    providerPayload: n.length ? { anthropicContent: N0(n) } : void 0
  };
}
function D0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function $0(e, t = {}) {
  const n = [];
  let o = "stop", r = t.model || "";
  const i = (u, c = {}) => {
    const d = Number.isInteger(Number(u)) ? Number(u) : n.length;
    return n[d] ? n[d] = {
      ...n[d],
      ...c
    } : n[d] = { ...c }, n[d];
  }, a = () => {
    const u = k0(n);
    D0(e, {
      text: u.text,
      thoughts: J(e.reasoning) ? u.thoughts : [],
      ...Array.isArray(u.toolCalls) ? { toolCalls: u.toolCalls } : {},
      ...u.toolCallDraft ? { toolCallDraft: !0 } : {}
    });
  };
  return {
    accept(u = {}) {
      if (u?.message?.model && (r = u.message.model), u.type === "content_block_start") {
        i(u.index, Ut(u.content_block) || {}), a();
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
      return fm(n, {
        finishReason: o,
        model: r,
        includeReasoningOutput: J(e.reasoning)
      });
    }
  };
}
var L0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return M0(e);
  }
  resolveToolProtocol(e) {
    return I0(this.config, e);
  }
  buildPayload(e, t = this.resolveToolProtocol(e)) {
    const n = pe("sillytavern-claude", this.config, e.reasoning), o = typeof e.onStreamProgress == "function", r = this.buildMessages(e), i = t.reasoningDisabledForForcedTool ? {
      ...n,
      mode: "off"
    } : n, a = {
      ...e,
      toolChoice: t.toolChoice,
      reasoning: i,
      temperature: po({
        ...this.config,
        provider: "sillytavern-claude"
      }, i) ? void 0 : e.temperature
    }, u = T0(this.config, a, r, o);
    return i.mode === "on" ? (u.reasoning_effort = i.effort, u.include_reasoning = J(i)) : i.mode === "off" ? (u.reasoning_effort = "auto", u.include_reasoning = !1) : (u.reasoning_effort = "auto", u.include_reasoning = J(i)), u;
  }
  async inspectRequest(e, t = {}) {
    const n = this.resolveToolProtocol(e), o = await wo(t.payload || this.buildPayload(e, n), typeof e.onStreamProgress == "function");
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
      request: Lt(e),
      effectiveConfig: {
        ...b0(n, t),
        ...C0(this.config, n, {
          ...t,
          controlFields: o
        })
      },
      ...t.reasoningDisabledForForcedTool ? { notices: [w0] } : {}
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
        const u = $0(e, this.config);
        return await Ra(o, (c) => {
          u.accept(c);
        }, {
          signal: e.signal,
          onRequest: i
        }), {
          ...u.result(),
          requestInspection: r
        };
      }
      const a = await ba(o, {
        signal: e.signal,
        onRequest: i
      });
      return {
        ...fm(Array.isArray(a?.content) ? a.content : [{
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
function Pa(e) {
  if (e !== void 0)
    try {
      return JSON.parse(JSON.stringify(e));
    } catch {
      return;
    }
}
function un(e) {
  if (typeof e == "string") return {
    role: "model",
    parts: e ? [{ text: e }] : []
  };
  if (!e || typeof e != "object") return {
    role: "model",
    parts: []
  };
  const t = Pa(e) || {};
  return t.role = t.role || "model", t.parts = Array.isArray(t.parts) ? t.parts : [], t;
}
function U0(e) {
  const t = Array.isArray(e?.providerPayload?.googleContents) ? e.providerPayload.googleContents : [];
  if (t.length) return t.map((r) => un(r)).filter((r) => Array.isArray(r.parts) && r.parts.length);
  const n = e?.providerPayload?.googleContent, o = un(n);
  return o.parts.length ? [o] : [];
}
function F0(e = {}) {
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
function O0(e = {}, t = 0) {
  const n = un(e);
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
    const u = F0(a.inlineData);
    u && o.content.push(u);
  }), i.length && o.content.push({
    type: "tool_calls",
    tool_calls: i
  }), r && o.content.some((a) => a?.type === "text") && (o.signature = r), o.content.length ? o : null;
}
function G0(e = {}) {
  const t = Array.isArray(e.messages) ? e.messages : [], n = [];
  t.forEach((r) => {
    if (!r || typeof r != "object") return;
    const i = U0(r);
    if (r.role === "assistant" && i.length) {
      i.forEach((u, c) => {
        const d = O0(u, c);
        d && n.push(d);
      });
      return;
    }
    const a = Pa(r) || {};
    delete a.providerPayload, n.push(a);
  });
  const o = typeof e.systemPrompt == "string" ? e.systemPrompt : "";
  return o.trim() && !(n[0]?.role === "system" && n[0]?.content === o) && n.unshift({
    role: "system",
    content: o
  }), n;
}
function hm(e = {}) {
  return un(e?.responseContent || e?.candidates?.[0]?.content || "");
}
function pm(e = {}) {
  return (e.parts || []).filter((t) => !t?.thought && typeof t?.text == "string" && t.text).map((t) => t.text).join(`
`);
}
function mm(e = {}) {
  return (e.parts || []).filter((t) => t?.thought && typeof t.text == "string" && t.text.trim()).map((t, n) => ({
    label: `思考块 ${n + 1}`,
    text: t.text.trim()
  }));
}
function gm(e = {}) {
  return (e.parts || []).map((t) => t?.functionCall || null).filter((t) => t?.name).map((t, n) => ({
    id: t.id || `st-google-tool-${n + 1}`,
    name: t.name,
    arguments: JSON.stringify(t.args || {})
  }));
}
function B0(e, t) {
  const n = String(t || ""), o = String(e || "");
  return n ? !o || n.startsWith(o) ? n : o.endsWith(n) ? o : `${o}${n}` : o;
}
function q0(e = [], t = []) {
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
function _m(e) {
  const t = un(e);
  return t.parts.length ? {
    googleContent: t,
    googleContents: [t]
  } : void 0;
}
function H0(e = {}, t = {}) {
  const n = hm(e), o = e?.choices?.[0]?.message?.content || "";
  return {
    text: pm(n) || o,
    toolCalls: gm(n),
    thoughts: t.includeReasoningOutput === !1 ? [] : mm(n),
    finishReason: e?.candidates?.[0]?.finishReason || e?.choices?.[0]?.finish_reason || t.finishReason || "STOP",
    model: e?.model || e?.modelVersion || t.model || "",
    provider: "sillytavern-google",
    providerPayload: _m(n)
  };
}
function V0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: t.thoughts } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function J0(e, t = {}) {
  let n = "", o = [], r = [], i = "STOP", a = t.model || "";
  const u = [];
  return {
    accept(c = {}) {
      a = c.model || c.modelVersion || a, i = c?.candidates?.[0]?.finishReason || i;
      const d = hm(c);
      d.parts.length && u.push(...Pa(d.parts) || []), n = B0(n, pm(d)), o = q0(o, gm(d));
      const h = J(e.reasoning) ? mm(d) : [];
      h.length && (r = h), V0(e, {
        text: n,
        thoughts: r,
        ...o.length ? {
          toolCalls: o,
          toolCallDraft: !0
        } : {}
      });
    },
    result() {
      const c = un({
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
        providerPayload: _m(c)
      };
    }
  };
}
var K0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return G0(e);
  }
  buildPayload(e) {
    const t = pe("sillytavern-google", this.config, e.reasoning), n = typeof e.onStreamProgress == "function", o = this.buildMessages(e), r = S0(this.config, e, o, n);
    return t.mode === "on" ? (r.reasoning_effort = t.effort, r.include_reasoning = J(t)) : t.mode === "off" ? (r.reasoning_effort = "min", r.include_reasoning = !1) : (r.reasoning_effort = "auto", r.include_reasoning = J(t)), r;
  }
  async inspectRequest(e, t = {}) {
    const n = await wo(t.payload || this.buildPayload(e), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = pe("sillytavern-google", this.config, t.reasoning), o = {
      ...Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {},
      ...Object.hasOwn(e?.body || {}, "include_reasoning") ? { include_reasoning: e.body.include_reasoning } : {}
    };
    return {
      provider: "sillytavern-google",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Lt(e),
      effectiveConfig: yt(t, {
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
        const i = J0(e, this.config);
        return await Ra(n, (a) => {
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
        ...H0(await ba(n, {
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
function W0(e, t) {
  typeof e.onStreamProgress == "function" && e.onStreamProgress({
    ...typeof t.text == "string" ? { text: t.text } : {},
    ...Array.isArray(t.thoughts) ? { thoughts: J(e.reasoning) ? t.thoughts : [] } : {},
    ...Array.isArray(t.toolCalls) ? { toolCalls: t.toolCalls } : {},
    ...t.toolCallDraft ? { toolCallDraft: !0 } : {}
  });
}
function Si(e, t = []) {
  const n = xt(e);
  return {
    thinkTagged: n,
    cleanedText: t.length ? n.cleaned : Nt(n.cleaned)
  };
}
function z0(e) {
  const t = String(e?.message || e || "");
  return /Cannot read properties of null \(reading ['"]function['"]\)/i.test(t) || /reading ['"]function['"]/i.test(t) || /badresponsestatuscode/i.test(t);
}
var Y0 = class {
  constructor(e) {
    this.config = e;
  }
  buildMessages(e) {
    return (this.config.toolMode || "native") === "tagged-json" && Array.isArray(e.tools) && e.tools.length > 0 ? Ts(e, this.config.model) : As(e, this.config.model);
  }
  buildPayload(e, t = !1) {
    const n = pe("sillytavern-openai-compatible", this.config, e.reasoning), o = t ? Ts(e, this.config.model) : As(e, this.config.model), r = {
      ...e,
      temperature: po({
        ...this.config,
        provider: "sillytavern-openai-compatible"
      }, n) ? void 0 : e.temperature
    }, i = A0(this.config, t ? {
      ...r,
      tools: void 0,
      toolChoice: void 0
    } : r, o, typeof e.onStreamProgress == "function");
    return n.mode === "on" ? i.reasoning_effort = n.effort : n.mode === "off" && (i.reasoning_effort = "none"), i;
  }
  async inspectRequest(e, t = {}) {
    const n = await wo(t.payload || this.buildPayload(e, !!t.taggedMode), typeof e.onStreamProgress == "function");
    return this.buildRequestInspection(n, e);
  }
  buildRequestInspection(e, t = {}) {
    const n = pe("sillytavern-openai-compatible", this.config, t.reasoning);
    return {
      provider: "sillytavern-openai-compatible",
      model: this.config.model,
      transport: "sillytavern-chat-completions",
      request: Lt(e),
      effectiveConfig: yt(t, {
        profileId: n.profileId,
        effectiveMode: n.mode,
        effort: e?.body?.reasoning_effort,
        controlFields: Object.hasOwn(e?.body || {}, "reasoning_effort") ? { reasoning_effort: e.body.reasoning_effort } : {}
      })
    };
  }
  async streamChat(e, t, n = {}) {
    const o = { role: "assistant" };
    let r = "stop", i = this.config.model;
    await Ra(t, (f) => {
      i = f?.model || i;
      const p = f?.choices?.[0] || {};
      Ss(o, p), p.finish_reason && (r = p.finish_reason);
      const m = on(o), { thinkTagged: g, cleanedText: _ } = Si(nn(o), m), y = m.length ? m : ys(g.cleaned);
      W0(e, {
        text: _,
        thoughts: J(e.reasoning) ? pt(o, p).concat(g.thoughts) : [],
        ...y.length ? { toolCalls: y } : {},
        ...!m.length && y.length ? { toolCallDraft: !0 } : {}
      });
    }, {
      signal: e.signal,
      onRequest: n.onRequest,
      onResponseAccepted: n.onResponseAccepted
    }), rn(o);
    const a = on(o), { thinkTagged: u, cleanedText: c } = Si(nn(o), a), d = pt(o, {});
    u.thoughts.forEach((f) => d.push(f));
    const h = a.length ? [] : ro(u.cleaned);
    return {
      text: c,
      toolCalls: [...a, ...h],
      thoughts: J(e.reasoning) ? d : [],
      finishReason: r,
      model: i,
      provider: "sillytavern-openai-compatible",
      providerPayload: io(o)
    };
  }
  async nonStreamingChat(e, t, n = {}) {
    const o = await ba(t, {
      signal: e.signal,
      onRequest: n.onRequest
    }), r = o.choices?.[0] || {}, i = r.message || {};
    rn(i);
    const a = pt(i, r), u = Ta(i.tool_calls || []), { thinkTagged: c, cleanedText: d } = Si(Sa(i.content), u);
    c.thoughts.forEach((p) => a.push(p));
    const h = u.length ? [] : ro(c.cleaned), f = br(i, r);
    return {
      text: d,
      toolCalls: [...u, ...h],
      thoughts: J(e.reasoning) ? a : [],
      finishReason: r.finish_reason || "stop",
      model: o.model || this.config.model,
      provider: "sillytavern-openai-compatible",
      providerPayload: io(f)
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
      if (e.allowToolProtocolFallback === !1 || t || !n || !z0(i)) throw i;
    }
    return typeof e.onToolProtocolFallback == "function" && e.onToolProtocolFallback({
      provider: "sillytavern-openai-compatible",
      fromToolMode: "native",
      toToolMode: "tagged-json",
      reason: "malformed_native_tool_host_error"
    }), await o(this.buildPayload(e, !0));
  }
};
function ub(e = {}, t = {}) {
  if (!e.apiKey && !ag(e.provider)) throw new Error(t.missingApiKeyMessage || "请先填写当前模型配置的 API Key。");
  switch (ed(e.reasoning || {}), e.provider) {
    case "sillytavern-openai-compatible":
      return new Y0(e);
    case "sillytavern-claude":
      return new L0(e);
    case "sillytavern-google":
      return new K0(e);
    case "openai-responses":
      return new o0(e);
    case "anthropic":
      return new u_(e);
    case "google":
      return new aw(e);
    default:
      return new KC(e);
  }
}
export {
  ob as AGENT_REQUEST_TIMEOUT_MS,
  sg as PROVIDER_OPTIONS,
  X0 as REASONING_MODE_OPTIONS,
  Q0 as REASONING_OUTPUT_OPTIONS,
  ub as createAgentAdapter,
  ib as getProviderLabel,
  nb as getReasoningEffortOptions,
  tb as getReasoningModeOptions,
  sb as getToolModeLabel,
  ag as isSillyTavernProvider,
  Nm as normalizeAgentConfig,
  eb as normalizeAgentSettings,
  Es as normalizeReasoningConfig,
  Lt as redactRequestSecrets,
  ab as resolveActiveProviderConfig,
  Ms as resolveReasoningCapability,
  Ci as resolveRuntimeReasoning,
  lb as setHostChatCompletionsRequestHeadersProvider
};
