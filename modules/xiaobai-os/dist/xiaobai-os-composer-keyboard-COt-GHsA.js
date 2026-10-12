/* eslint-disable */
import { i as g } from "./xiaobai-os-reasoning-capabilities-jekAYzl_.js";
function h(n = {}, t = [], e = g(n, n.reasoning)) {
  return n.provider === "openai-compatible" && n.toolMode !== "tagged-json" && Array.isArray(t) && t.length > 0 && e.profileId === "deepseek-thinking" && e.mode !== "off";
}
function _(n = []) {
  for (let t = n.length - 1; t >= 0; t -= 1) if (n[t]?.role === "user") return t;
  return -1;
}
function m(n, t, e) {
  return t > e && Array.isArray(n?.tool_calls) && n.tool_calls.some((i) => String(i?.function?.name || "").trim());
}
var T = 3.35, A = new TextEncoder();
function E(n = [], t = [], e = {}) {
  const i = h(e, t), y = ["openai-compatible", "sillytavern-openai-compatible"].includes(e.provider) && !(e.toolMode === "tagged-json" && t.length), p = _(n);
  return n.map((o, f) => {
    const l = o.role === "assistant" ? o.providerPayload : null, c = ["google", "sillytavern-google"].includes(e.provider) ? l?.googleContents || l?.googleContent : ["anthropic", "sillytavern-claude"].includes(e.provider) ? l?.anthropicContent : e.provider === "openai-responses" ? l?.openAIResponseOutput : null;
    if (c) return {
      role: o.role,
      content: JSON.stringify(c)
    };
    const a = o.role === "assistant" ? o.providerPayload?.openaiCompatibleMessage : null, s = typeof a?.reasoning_content == "string" && (i || y && m(a, f, p)) ? a.reasoning_content : "", u = s ? { reasoning_content: s } : {}, d = Array.isArray(o.content) ? o.content.map((r) => !r || typeof r != "object" ? "" : r.type === "text" ? r.text || "" : r.type === "image_url" ? `[image:${r.name || r.mimeType || "image"}]` : "").filter(Boolean).join(`
`) : o.content || "";
    return o.role === "assistant" && Array.isArray(o.tool_calls) && o.tool_calls.length ? {
      role: "assistant",
      content: [d, o.tool_calls.map((r) => JSON.stringify({
        id: r.id,
        name: r.function?.name || "",
        arguments: r.function?.arguments || "{}"
      })).join(`
`)].filter(Boolean).join(`
`),
      ...u
    } : o.role === "tool" ? {
      role: "tool",
      content: [o.tool_call_id || "", o.content || ""].filter(Boolean).join(`
`)
    } : {
      role: o.role,
      content: d,
      ...u
    };
  });
}
function O(n = [], t = [], e = {}) {
  return [...E(n, t, e), {
    role: "system",
    content: t.length ? `TOOLS
${JSON.stringify(t)}` : ""
  }].filter((i) => i.content || i.reasoning_content);
}
function S(n = "") {
  return Math.ceil(A.encode(String(n || "")).length / T);
}
function M({ messages: n = [], tools: t = [], providerConfig: e = {} } = {}) {
  return S(JSON.stringify(O(n, t, e)));
}
function k(n, t, e = window.matchMedia("(pointer: coarse)").matches) {
  return !e && !t && !n.isComposing && n.keyCode !== 229 && n.key === "Enter" && !n.shiftKey && !n.ctrlKey && !n.altKey && !n.metaKey;
}
export {
  M as n,
  S as r,
  k as t
};
