/* eslint-disable */
var C = Object.freeze([
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
function c(e = "") {
  return e === "on" || e === "off" ? e : "inherit";
}
function g(e) {
  return String(e ?? "").trim().toLowerCase() || void 0;
}
function O(e) {
  if (e == null || e === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? Math.floor(t) : void 0;
}
function v(e = {}) {
  const t = e && typeof e == "object" ? e : {}, i = g(t.effort), r = O(t.budgetTokens);
  return {
    mode: c(t.mode),
    ...i ? { effort: i } : {},
    ...r !== void 0 ? { budgetTokens: r } : {}
  };
}
function E(e = "") {
  return String(e || "").trim().toLowerCase();
}
function T(e = "") {
  const t = E(e);
  return t.includes("deepseek") ? "deepseek" : t.includes("kimi") || t.includes("moonshot") ? "kimi" : t.includes("gemini") ? "gemini" : t.includes("claude") ? "claude" : /(?:^|[/_.-])gpt(?:\d|[/_.-]|$)/.test(t) || /(?:^|[/_.-])o\d+(?:[/_.-]|$)/.test(t) ? "openai" : "";
}
var m = null;
async function P() {
  if (!m) throw new Error("宿主请求头未注册，无法调用酒馆后端。");
  return await m();
}
var I = Object.freeze({
  minimal: "最小",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "超高",
  max: "最大",
  min: "最小"
});
function h(e) {
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
function o(e, t, i, r, u = {}) {
  return h({
    profileId: e,
    modes: t,
    intensity: {
      kind: "effort",
      values: i,
      defaultValue: r
    },
    outputModes: u.outputModes,
    temperatureOmitModes: u.temperatureOmitModes
  });
}
var l = h({
  profileId: "unsupported",
  modes: ["inherit"],
  outputModes: ["hide"],
  intensity: { kind: "none" },
  unsupportedReason: "当前 Provider、传输方式与模型组合没有已验证的 Reasoning 控制协议。"
}), a = Object.freeze(["on"]), f = Object.freeze([
  "inherit",
  "on",
  "off"
]), p = o("openai-gpt-5.6", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "medium", { temperatureOmitModes: f }), b = o("kimi-k3", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "max", { temperatureOmitModes: a }), A = o("deepseek-thinking", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "high",
  "max"
], "high", { temperatureOmitModes: a }), M = o("openai-compatible-gemini-latest", [
  "inherit",
  "on",
  "off"
], [
  "minimal",
  "low",
  "medium",
  "high"
], "high", { temperatureOmitModes: a }), _ = o("openai-compatible-claude-latest", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: a }), R = o("openai-compatible-default", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high"
], "medium", { temperatureOmitModes: a }), S = o("anthropic-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
], "high", { temperatureOmitModes: f }), L = o("sillytavern-claude-adaptive", [
  "inherit",
  "on",
  "off"
], [
  "low",
  "medium",
  "high",
  "max"
], "high", { temperatureOmitModes: f }), N = o("google-gemini-3-flash", ["inherit", "on"], [
  "minimal",
  "low",
  "medium",
  "high"
], "high"), w = o("sillytavern-google-3-flash", ["inherit", "on"], [
  "min",
  "low",
  "medium",
  "high"
], "high");
function y(e = "") {
  switch (T(e)) {
    case "deepseek":
      return A;
    case "kimi":
      return b;
    case "gemini":
      return M;
    case "claude":
      return _;
    case "openai":
      return p;
    default:
      return R;
  }
}
function z(e = {}) {
  const t = String(e.provider || "").trim(), i = String(e.model || "").trim().toLowerCase();
  switch (t) {
    case "openai-responses":
      return p;
    case "openai-compatible":
    case "sillytavern-openai-compatible":
      return y(i);
    case "anthropic":
      return S;
    case "sillytavern-claude":
      return L;
    case "google":
      return N;
    case "sillytavern-google":
      return w;
    default:
      return l;
  }
}
function j(e = l) {
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
function x(e = l) {
  return e.intensity?.kind !== "effort" ? [] : e.intensity.values.map((t) => ({
    value: t,
    label: I[t] || t
  }));
}
function d(e, t, i, r = "REASONING_CAPABILITY_UNSUPPORTED") {
  return {
    ...e,
    profileId: t.profileId,
    valid: !1,
    error: i,
    code: r
  };
}
function k(e, t) {
  const i = { ...e };
  return delete i.effort, delete i.budgetTokens, t.intensity?.kind === "effort" ? {
    ...i,
    ...e.effort ? { effort: e.effort } : {}
  } : i;
}
function G(e = {}, t = {}) {
  const i = z(e), r = v(t), u = t?.output === "show" || t?.output === "hide" ? t.output : null, n = k({
    ...r,
    output: r.mode === "off" ? "hide" : u || (i.outputModes.includes("show") ? "show" : "hide")
  }, i);
  if (!i.outputModes.includes(n.output)) return d(n, i, "当前任务要求返回 Reasoning 内容，但所选模型不支持。");
  if (!i.modes.includes(n.mode)) return d(n, i, n.mode === "off" ? "当前模型不支持显式关闭 Reasoning。请选择“跟随模型默认”。" : i.unsupportedReason || "当前模型不支持显式开启 Reasoning。");
  if (n.mode !== "on") return {
    ...n,
    profileId: i.profileId,
    valid: !0
  };
  if (i.intensity.kind === "effort") {
    const s = n.effort || i.intensity.defaultValue;
    return i.intensity.values.includes(s) ? {
      ...n,
      effort: s,
      profileId: i.profileId,
      valid: !0
    } : d(n, i, `当前模型不支持 Reasoning 强度“${s}”。`, "REASONING_CONFIG_INVALID");
  }
  return {
    ...n,
    profileId: i.profileId,
    valid: !0
  };
}
export {
  P as a,
  G as i,
  j as n,
  v as o,
  z as r,
  x as t
};
