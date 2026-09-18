/* eslint-disable */
import { n as $e } from "./xiaobai-os-message-markdown-p_WvGylV.js";
import { C as le, E as ne, G as J, H as D, J as R, K as M, S as se, V as _, Y as re, c as H, gt as S, h as O, ht as Ce, j as oe, k as c, l as B, m as Z, mt as ee, o as P, p as U, r as G, s as e, u as h, v as Q, z as L } from "./xiaobai-os-runtime-core.esm-bundler-x_Eikhco.js";
import { i as j, l as Ie, o as z } from "./xiaobai-os-runtime-dom.esm-bundler-DWFjb9Vy.js";
import { n as ie, r as ue } from "./xiaobai-os-app-navigation-BcQEoInO.js";
import { t as de } from "./xiaobai-os-AppDialog-BtiJ8z-w.js";
import { t as Y } from "./xiaobai-os-context-tokens-W3T8vx4V.js";
var xe = { class: "fourth-wall-context" }, Se = ["aria-label", "aria-expanded"], Ae = {
  key: 0,
  class: "fourth-wall-context-popover",
  "aria-label": "上下文用量"
}, Te = { class: "fourth-wall-context-total" }, Me = ["disabled"], qe = { key: 2 }, Ee = /* @__PURE__ */ O({
  __name: "FourthWallContextButton",
  props: {
    stats: {},
    busy: { type: Boolean },
    phase: {}
  },
  emits: ["summarize", "cancel"],
  setup(s, { emit: T }) {
    const n = s, i = T, u = M(!1);
    ie(() => (u.value = !1, !0), () => u.value);
    const v = P(() => Math.min(1, n.stats.usedTokens / n.stats.limit)), o = (a) => `${(a / 1e3).toFixed(1)}k`, m = {
      counting: "计算中",
      summarizing: "总结中",
      saving: "保存中",
      replying: "回复中"
    };
    return (a, r) => (c(), h("div", xe, [e("button", {
      type: "button",
      class: ee(["fourth-wall-context-ring", { "is-warning": s.stats.usedTokens >= s.stats.trigger }]),
      style: Ce({ "--context-fill": `${v.value * 360}deg` }),
      "aria-label": `上下文：约 ${o(s.stats.usedTokens)} / 158k`,
      "aria-expanded": u.value,
      title: "上下文",
      onClick: r[0] || (r[0] = (l) => u.value = !u.value)
    }, [e("span", null, S(s.busy ? "…" : Math.round(v.value * 100)), 1)], 14, Se), u.value ? (c(), h("section", Ae, [
      e("header", null, [r[4] || (r[4] = e("strong", null, "上下文", -1)), e("button", {
        type: "button",
        "aria-label": "关闭上下文用量",
        onClick: r[1] || (r[1] = (l) => u.value = !1)
      }, "×")]),
      e("p", Te, "约 " + S(o(s.stats.usedTokens)) + " / 158k", 1),
      e("dl", null, [
        r[5] || (r[5] = e("dt", null, "主剧情", -1)),
        e("dd", null, S(o(s.stats.mainTokens)), 1),
        r[6] || (r[6] = e("dt", null, "皮下记忆", -1)),
        e("dd", null, S(o(s.stats.memoryTokens)), 1),
        r[7] || (r[7] = e("dt", null, "皮下聊天", -1)),
        e("dd", null, S(o(s.stats.historyTokens)), 1),
        r[8] || (r[8] = e("dt", null, "提示词与输入", -1)),
        e("dd", null, S(o(s.stats.promptTokens)), 1)
      ]),
      r[9] || (r[9] = e("p", null, "128k 时在下次回复前自动总结。", -1)),
      s.busy ? (c(), h("button", {
        key: 0,
        type: "button",
        onClick: r[2] || (r[2] = (l) => i("cancel"))
      }, S(s.phase ? m[s.phase] : "处理中") + " · 取消", 1)) : (c(), h("button", {
        key: 1,
        type: "button",
        disabled: !s.stats.canSummarize,
        onClick: r[3] || (r[3] = (l) => {
          i("summarize"), u.value = !1;
        })
      }, "立即总结", 8, Me)),
      !s.stats.canSummarize && !s.busy ? (c(), h("small", qe, "暂无可总结的较早聊天，近期原文会保留。")) : B("", !0)
    ])) : B("", !0)]));
  }
}), Fe = Ee, Be = ["disabled"], We = ["disabled"], Ve = {
  key: 0,
  class: "fourth-wall-dialog-error",
  role: "alert"
}, De = ["disabled"], Ue = ["disabled"], Ne = /* @__PURE__ */ O({
  __name: "FourthWallMemory",
  props: {
    content: {},
    busy: { type: Boolean },
    error: {}
  },
  emits: ["close", "save"],
  setup(s, { emit: T }) {
    const n = s, i = T, u = M(n.content);
    function v() {
      (u.value === n.content || window.confirm("放弃尚未保存的记忆修改？")) && i("close");
    }
    function o() {
      window.confirm("清空皮下记忆？聊天记录会保留，但已总结过的旧消息不会自动再发给模型。") && (u.value = "", i("save", ""));
    }
    return (m, a) => (c(), H(de, {
      class: "fourth-wall-memory fourth-wall-dialog",
      "aria-label": "皮下记忆",
      busy: s.busy,
      onClose: v
    }, {
      default: _(() => [
        e("header", null, [a[2] || (a[2] = e("strong", null, "皮下记忆", -1)), e("button", {
          type: "button",
          disabled: s.busy,
          onClick: v
        }, "关闭", 8, Be)]),
        D(e("textarea", {
          "onUpdate:modelValue": a[0] || (a[0] = (r) => u.value = r),
          "aria-label": "皮下记忆正文",
          disabled: s.busy,
          placeholder: "总结后的皮下人设与长期记忆，也可以直接填写。"
        }, null, 8, We), [[z, u.value]]),
        s.error ? (c(), h("p", Ve, S(s.error), 1)) : B("", !0),
        e("footer", null, [e("button", {
          type: "button",
          class: "is-danger",
          disabled: s.busy || !s.content,
          onClick: o
        }, "清空记忆", 8, De), e("button", {
          type: "button",
          class: "is-primary",
          disabled: s.busy,
          onClick: a[1] || (a[1] = (r) => i("save", u.value))
        }, "保存", 8, Ue)])
      ]),
      _: 1
    }, 8, ["busy"]));
  }
}), Re = Ne, ve = O({
  name: "FourthWallContent",
  props: { content: {
    type: Object,
    required: !0
  } },
  setup(s, { slots: T }) {
    function n(i) {
      if (i.kind === "text") return i.value;
      if (i.kind === "media") {
        const v = s.content.media[i.index];
        return T.media?.({
          segment: v,
          index: i.index
        }) ?? v.raw;
      }
      const u = Q(i.tag, i.attrs, i.children.map(n));
      return i.tag === "table" ? Q("div", { class: "fourth-wall-table-scroll" }, [u]) : u;
    }
    return () => Q("div", { class: "fourth-wall-markdown" }, s.content.nodes.map(n));
  }
}), Pe = /* @__PURE__ */ new Set([
  "p",
  "br",
  "em",
  "i",
  "strong",
  "b",
  "del",
  "s",
  "u",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "a"
]), ze = /* @__PURE__ */ new Set([
  "script",
  "style",
  "custom-style",
  "iframe",
  "object",
  "embed",
  "svg",
  "math"
]);
function me(s, T = globalThis.document) {
  const n = [], i = `XB4W${Array.from(crypto.getRandomValues(new Uint32Array(4))).join("")}MEDIA`, u = s.replace(/\[(?:img|图片)\s*:\s*([^\]]+)\]|\[(?:voice|语音)\s*:([^:\]]*):([^\]]+)\]|\[(?:voice|语音)\s*:\s*([^\]]+)\]/gi, (l, p, x, q, E, F) => {
    let W = 0;
    for (let d = F - 1; d >= 0 && s[d] === "\\"; d--) W++;
    return W % 2 ? l : (n.push(p !== void 0 ? {
      kind: "image",
      raw: l,
      value: p.trim()
    } : {
      kind: "voice",
      raw: l,
      value: String(q ?? E ?? "").trim(),
      emotion: String(x || "").trim().toLowerCase()
    }), `${i}${n.length - 1}END`);
  }), v = new RegExp(`${i}(\\d+)END`, "g"), o = (l) => l.replace(v, (p, x) => n[Number(x)].raw);
  function m(l, p) {
    if (p) return [{
      kind: "text",
      value: o(l)
    }];
    const x = [];
    let q = 0;
    for (const E of l.matchAll(v))
      E.index > q && x.push({
        kind: "text",
        value: l.slice(q, E.index)
      }), x.push({
        kind: "media",
        index: Number(E[1])
      }), q = E.index + E[0].length;
    return q < l.length && x.push({
      kind: "text",
      value: l.slice(q)
    }), x;
  }
  function a(l, p = !1) {
    if (l.nodeType === 3) return m(l.textContent || "", p);
    if (l.nodeType !== 1) return [];
    const x = l, q = x.localName;
    if (ze.has(q)) return [];
    if (q === "img") return [{
      kind: "text",
      value: o(x.getAttribute("alt") || "")
    }];
    const E = Array.from(x.childNodes).flatMap((W) => a(W, p || [
      "code",
      "pre",
      "a"
    ].includes(q)));
    if (!Pe.has(q)) return E;
    const F = {};
    if (q === "a") {
      const W = o(x.getAttribute("href") || "").trim();
      if (!/^(?:https?:\/\/|mailto:)/i.test(W)) return E;
      F.href = W, F.target = "_blank", F.rel = "noopener noreferrer", x.hasAttribute("title") && (F.title = o(x.getAttribute("title")));
    }
    return q === "ol" && /^\d+$/.test(x.getAttribute("start") || "") && (F.start = x.getAttribute("start")), [{
      kind: "element",
      tag: q,
      attrs: F,
      children: E
    }];
  }
  const r = T.createElement("template");
  return r.innerHTML = $e(u, { htmlFenceMode: "code" }), {
    nodes: Array.from(r.content.childNodes).flatMap((l) => a(l)),
    media: n
  };
}
var Oe = ["data-message-index"], He = ["src"], Le = {
  key: 1,
  class: "fourth-wall-avatar is-placeholder",
  "aria-hidden": "true"
}, je = { class: "fourth-wall-message-stack" }, Ge = {
  key: 0,
  class: "fourth-wall-thinking"
}, Ke = { class: "fourth-wall-bubble" }, Xe = ["data-image-index"], Je = ["src", "alt"], Qe = ["onClick"], Ye = {
  key: 2,
  class: "fourth-wall-image-unavailable"
}, Ze = ["disabled", "onClick"], _e = ["onClick"], et = { "aria-hidden": "true" }, tt = { key: 0 }, at = { class: "fourth-wall-message-actions" }, st = ["disabled"], lt = ["disabled"], nt = ["disabled"], rt = { key: 1 }, ot = /* @__PURE__ */ O({
  __name: "FourthWallMessage",
  props: {
    message: {},
    messageIndex: {},
    chatIdentity: {},
    sessionId: {},
    userAvatar: {},
    characterAvatar: {},
    imageAvailable: { type: Boolean },
    voiceAvailable: { type: Boolean },
    bridge: {},
    editable: { type: Boolean },
    editDraft: {}
  },
  emits: [
    "edit",
    "delete",
    "draft",
    "editCancel"
  ],
  setup(s, { emit: T }) {
    const n = s, i = T, u = P(() => n.editDraft !== void 0);
    ie(() => (i("editCancel"), !0), () => u.value);
    const v = P({
      get: () => n.editDraft || "",
      set: (f) => i("draft", f)
    }), o = M(null);
    let m = null;
    const a = J({}), r = /* @__PURE__ */ new Set();
    let l = () => {
    };
    const p = P(() => me(n.message.content)), x = P(() => n.message.ts ? new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(n.message.ts) : "");
    function q(f, g) {
      return `fw-${f}-${Date.now()}-${n.messageIndex}-${g}-${Math.random().toString(36).slice(2, 7)}`;
    }
    function E(f) {
      return f.result;
    }
    function F(f, g) {
      return r.has(g) && a[f]?.requestId === g;
    }
    async function W(f, g) {
      if (a[g]?.status === "loading" || a[g]?.status === "ready") return;
      if (!n.imageAvailable) {
        a[g] = {
          status: "unavailable",
          message: "请先开启画图功能"
        };
        return;
      }
      const b = q("image", g);
      r.add(b), a[g] = {
        status: "loading",
        message: "正在加载图片",
        requestId: b
      };
      const C = {
        chatIdentity: n.chatIdentity,
        sessionId: n.sessionId
      };
      try {
        const V = E(await n.bridge.request("fourth-wall/image-check", {
          ...C,
          tags: f.value,
          mediaRequestId: b
        }, 3e4));
        if (!F(g, b)) return;
        if (!V.available) {
          a[g] = {
            status: "unavailable",
            message: "请先开启画图功能",
            requestId: b
          };
          return;
        }
        let N = V.cached || "";
        if (!N) {
          a[g] = {
            status: "loading",
            message: "正在生成图片",
            requestId: b
          };
          const K = E(await n.bridge.request("fourth-wall/image-generate", {
            ...C,
            tags: f.value,
            mediaRequestId: b
          }, 18e4));
          if (!F(g, b)) return;
          N = K.base64;
        }
        a[g] = {
          status: "ready",
          source: /^(?:data:|blob:|https?:)/i.test(N) ? N : `data:image/png;base64,${N}`
        };
      } catch (V) {
        F(g, b) && (a[g] = {
          status: "error",
          message: V instanceof Error ? V.message : String(V),
          requestId: b
        });
      } finally {
        r.delete(b);
      }
    }
    async function d(f, g) {
      if (!n.voiceAvailable) {
        a[g] = {
          status: "unavailable",
          message: "请先开启 TTS 语音"
        };
        return;
      }
      const b = a[g];
      if (b?.status === "loading") return;
      if (b?.status === "playing" && b.requestId) {
        n.bridge.post("fourth-wall/voice-stop", {
          chatIdentity: n.chatIdentity,
          mediaRequestId: b.requestId
        }), a[g] = { status: "idle" };
        return;
      }
      const C = q("voice", g);
      r.add(C), a[g] = {
        status: "loading",
        message: "正在准备语音",
        requestId: C
      };
      try {
        await n.bridge.request("fourth-wall/voice-play", {
          chatIdentity: n.chatIdentity,
          sessionId: n.sessionId,
          mediaRequestId: C,
          text: f.value,
          emotion: f.emotion
        });
      } catch (V) {
        F(g, C) && (a[g] = {
          status: "error",
          message: V instanceof Error ? V.message : String(V),
          requestId: C
        }), r.delete(C);
      }
    }
    function I() {
      i("draft", n.message.content);
    }
    function w() {
      const f = v.value.trim();
      f && i("edit", n.messageIndex, f);
    }
    function $() {
      r.forEach((f) => {
        n.bridge.post("fourth-wall/image-cancel", {
          chatIdentity: n.chatIdentity,
          mediaRequestId: f
        }), n.bridge.post("fourth-wall/voice-stop", {
          chatIdentity: n.chatIdentity,
          mediaRequestId: f
        });
      }), r.clear();
    }
    function A() {
      m?.disconnect(), o.value?.querySelectorAll("[data-image-index]").forEach((f) => m?.observe(f));
    }
    return ne(() => {
      l = n.bridge.subscribe((f) => {
        if (f.type === "fourth-wall/image-progress") {
          const g = f.payload, b = Object.keys(a).map(Number).find((C) => a[C]?.requestId === g.mediaRequestId);
          b !== void 0 && (a[b].message = g.status === "queued" ? `图片队列第 ${g.position || 1} 位` : "正在生成图片");
        }
        if (f.type === "fourth-wall/voice-state") {
          const g = f.payload, b = Object.keys(a).map(Number).find((C) => a[C]?.requestId === g.requestId);
          if (b === void 0) return;
          g.state === "playing" && (a[b].status = "playing"), (g.state === "ended" || g.state === "stopped") && (r.delete(String(g.requestId || "")), a[b] = { status: "idle" }), g.state === "error" && (r.delete(String(g.requestId || "")), a[b] = {
            status: "error",
            message: g.message || "语音播放失败"
          });
        }
      }), o.value && typeof IntersectionObserver < "u" && (m = new IntersectionObserver((f) => {
        for (const g of f) {
          if (!g.isIntersecting) continue;
          const b = Number(g.target.dataset.imageIndex), C = p.value.media[b];
          C?.kind === "image" && W(C, b), m?.unobserve(g.target);
        }
      }, { root: o.value.closest(".fourth-wall-conversation") }), A());
    }), L(() => n.message.content, () => {
      $(), Object.keys(a).forEach((f) => delete a[Number(f)]);
    }), L([p, u], A, { flush: "post" }), le(() => {
      l(), m?.disconnect(), $();
    }), (f, g) => (c(), h("article", {
      ref_key: "root",
      ref: o,
      class: ee(["fourth-wall-message", s.message.role === "user" ? "is-user" : "is-ai"]),
      "data-message-index": s.messageIndex
    }, [(s.message.role === "user" ? s.userAvatar : s.characterAvatar) ? (c(), h("img", {
      key: 0,
      class: "fourth-wall-avatar",
      src: s.message.role === "user" ? s.userAvatar : s.characterAvatar,
      alt: ""
    }, null, 8, He)) : (c(), h("span", Le)), e("div", je, [
      s.message.thinking ? (c(), h("details", Ge, [g[3] || (g[3] = e("summary", null, "思考过程", -1)), e("div", null, S(s.message.thinking), 1)])) : B("", !0),
      e("div", Ke, [u.value ? D((c(), h("textarea", {
        key: 0,
        "onUpdate:modelValue": g[0] || (g[0] = (b) => v.value = b),
        class: "fourth-wall-edit",
        rows: "3"
      }, null, 512)), [[z, v.value]]) : (c(), H(re(ve), {
        key: 1,
        content: p.value
      }, {
        media: _(({ segment: b, index: C }) => [b.kind === "image" ? (c(), h("span", {
          key: 0,
          class: "fourth-wall-image-card",
          "data-image-index": C
        }, [a[C]?.status === "ready" ? (c(), h("img", {
          key: 0,
          src: a[C].source,
          alt: b.value
        }, null, 8, Je)) : a[C]?.status === "error" ? (c(), h("button", {
          key: 1,
          type: "button",
          onClick: (V) => W(b, C)
        }, [U(S(b.raw), 1), e("small", null, S(a[C].message) + "，点此重试", 1)], 8, Qe)) : a[C]?.status === "unavailable" ? (c(), h("span", Ye, [U(S(b.raw), 1), e("small", null, S(a[C].message), 1)])) : (c(), h("button", {
          key: 3,
          type: "button",
          disabled: a[C]?.status === "loading",
          onClick: (V) => W(b, C)
        }, [U(S(b.raw), 1), e("small", null, S(a[C]?.message || "生成图片"), 1)], 8, Ze))], 8, Xe)) : (c(), h("button", {
          key: 1,
          class: "fourth-wall-voice",
          type: "button",
          onClick: (V) => d(b, C)
        }, [
          e("span", et, S(a[C]?.status === "playing" ? "■" : "▶"), 1),
          e("span", null, S(b.value), 1),
          a[C]?.message ? (c(), h("small", tt, S(a[C].message), 1)) : B("", !0)
        ], 8, _e))]),
        _: 1
      }, 8, ["content"])), e("div", at, [u.value ? (c(), h(G, { key: 0 }, [e("button", {
        type: "button",
        disabled: !s.editable,
        onClick: w
      }, "保存", 8, st), e("button", {
        type: "button",
        onClick: g[1] || (g[1] = (b) => i("editCancel"))
      }, "取消")], 64)) : (c(), h(G, { key: 1 }, [e("button", {
        type: "button",
        disabled: !s.editable,
        onClick: I
      }, "编辑", 8, lt), e("button", {
        type: "button",
        disabled: !s.editable,
        onClick: g[2] || (g[2] = (b) => i("delete", s.messageIndex))
      }, "删除", 8, nt)], 64))])]),
      x.value ? (c(), h("time", rt, S(x.value), 1)) : B("", !0)
    ])], 10, Oe));
  }
}), it = ot, ut = ["disabled"], dt = {
  key: 1,
  class: "fourth-wall-empty"
}, vt = ["disabled"], mt = {
  key: 3,
  class: "fourth-wall-message is-ai is-streaming",
  role: "status"
}, ft = ["src"], gt = {
  key: 1,
  class: "fourth-wall-avatar is-placeholder"
}, bt = { class: "fourth-wall-message-stack" }, ct = {
  key: 0,
  class: "fourth-wall-thinking",
  open: ""
}, yt = { class: "fourth-wall-bubble" }, pt = {
  key: 2,
  class: "fourth-wall-unsaved"
}, ht = ["disabled"], kt = /* @__PURE__ */ O({
  __name: "FourthWallConversation",
  props: {
    page: {},
    busy: { type: Boolean },
    sessionId: {},
    chatIdentity: {},
    userAvatar: {},
    characterAvatar: {},
    imageAvailable: { type: Boolean },
    voiceAvailable: { type: Boolean },
    generation: {},
    bridge: {}
  },
  emits: [
    "edit",
    "delete",
    "error"
  ],
  setup(s, { emit: T }) {
    const n = s, i = T, u = M(null), v = M(n.page), o = P(() => me(n.generation.text || "")), m = M(!1), a = M(!0), r = M(null);
    let l = 0;
    const p = {
      counting: "正在计算上下文…",
      summarizing: "正在整理皮下记忆…",
      saving: "正在保存…",
      replying: "等待回应…"
    };
    function x() {
      const d = u.value;
      if (!d) return null;
      const I = d.getBoundingClientRect().top, w = Array.from(d.querySelectorAll("[data-message-index]")).find(($) => $.getBoundingClientRect().bottom > I);
      return w ? {
        index: w.dataset.messageIndex,
        offset: w.getBoundingClientRect().top - I
      } : null;
    }
    async function q(d, I = !1) {
      const w = x();
      if (r.value && d.sessionId === v.value.sessionId) {
        const A = d.messages[r.value.index - d.start];
        A?.ts === r.value.ts && A.content === r.value.content.trim() ? r.value = null : A?.ts === r.value.ts && A.content === r.value.original ? r.value.revision = d.revision : A && (i("error", `正在编辑的消息已变化，未保存的草稿：${r.value.content}`), r.value = null);
      }
      v.value = d, await se();
      const $ = u.value;
      if ($) {
        if (I) {
          $.scrollTop = $.scrollHeight, a.value = !0;
          return;
        }
        if (w) {
          const A = $.querySelector('[data-message-index="' + w.index + '"]');
          A && ($.scrollTop += A.getBoundingClientRect().top - $.getBoundingClientRect().top - w.offset);
        }
      }
    }
    function E() {
      const d = u.value;
      d && (a.value = v.value.start + v.value.messages.length === v.value.total && d.scrollHeight - d.clientHeight - d.scrollTop < 48);
    }
    async function F(d) {
      if (m.value) return;
      const I = ++l;
      m.value = !0;
      const w = n.sessionId;
      try {
        const $ = await n.bridge.request("fourth-wall/history-page", {
          chatIdentity: n.chatIdentity,
          sessionId: w,
          direction: d,
          revision: v.value.revision
        });
        if (I !== l || w !== n.sessionId) return;
        d !== "latest" && (a.value = !1);
        const A = $.result;
        if (d === "earlier") A.messages = [...A.messages, ...v.value.messages].slice(0, 60);
        else if (d === "later") {
          const f = [...v.value.messages, ...A.messages];
          A.start = v.value.start + Math.max(0, f.length - 60), A.messages = f.slice(-60);
        }
        await q(A, d === "latest");
      } catch ($) {
        I === l && i("error", $ instanceof Error ? $.message : String($));
      } finally {
        I === l && (m.value = !1);
      }
    }
    function W(d, I) {
      const w = v.value.messages[d - v.value.start];
      w && (r.value?.index === d ? r.value.content = I : r.value = {
        index: d,
        content: I,
        original: w.content,
        ts: w.ts,
        revision: v.value.revision
      });
    }
    return L(() => n.page, (d) => {
      l++, m.value = !1, q(d, d.sessionId !== v.value.sessionId || a.value);
    }, { immediate: !0 }), L(() => n.sessionId, () => {
      r.value = null, a.value = !0;
    }), L(() => n.generation.text, async () => {
      a.value && (await se(), u.value && (u.value.scrollTop = u.value.scrollHeight));
    }), (d, I) => (c(), h("section", {
      ref_key: "viewport",
      ref: u,
      class: "fourth-wall-conversation",
      "aria-live": "polite",
      onScrollPassive: E
    }, [
      v.value.start > 0 ? (c(), h("button", {
        key: 0,
        type: "button",
        class: "fourth-wall-earlier",
        disabled: m.value,
        onClick: I[0] || (I[0] = (w) => F("earlier"))
      }, S(m.value ? "读取中…" : "查看更早的记录"), 9, ut)) : B("", !0),
      v.value.total === 0 && s.generation.status === "idle" ? (c(), h("div", dt, [...I[6] || (I[6] = [
        e("span", null, "IV", -1),
        e("strong", null, "越过故事边界", -1),
        e("p", null, "这里是你与角色扮演者的皮下私聊。", -1)
      ])])) : B("", !0),
      (c(!0), h(G, null, oe(v.value.messages, (w, $) => (c(), H(it, {
        key: w.ts + "-" + (v.value.start + $),
        message: w,
        "message-index": v.value.start + $,
        "chat-identity": s.chatIdentity,
        "session-id": s.sessionId,
        "user-avatar": s.userAvatar,
        "character-avatar": s.characterAvatar,
        "image-available": s.imageAvailable,
        "voice-available": s.voiceAvailable,
        bridge: s.bridge,
        editable: !s.busy,
        "edit-draft": r.value?.index === v.value.start + $ && r.value.ts === w.ts ? r.value.content : void 0,
        onDraft: (A) => W(v.value.start + $, A),
        onEditCancel: I[1] || (I[1] = (A) => r.value = null),
        onEdit: I[2] || (I[2] = (A, f) => i("edit", A, f, r.value?.revision ?? v.value.revision)),
        onDelete: I[3] || (I[3] = (A) => i("delete", A))
      }, null, 8, [
        "message",
        "message-index",
        "chat-identity",
        "session-id",
        "user-avatar",
        "character-avatar",
        "image-available",
        "voice-available",
        "bridge",
        "editable",
        "edit-draft",
        "onDraft"
      ]))), 128)),
      v.value.start + v.value.messages.length < v.value.total ? (c(), h("button", {
        key: 2,
        type: "button",
        class: "fourth-wall-earlier",
        disabled: m.value,
        onClick: I[4] || (I[4] = (w) => F("later"))
      }, " 查看后面的记录 ", 8, vt)) : B("", !0),
      s.generation.status !== "idle" && a.value ? (c(), h("article", mt, [s.characterAvatar ? (c(), h("img", {
        key: 0,
        class: "fourth-wall-avatar",
        src: s.characterAvatar,
        alt: ""
      }, null, 8, ft)) : (c(), h("span", gt)), e("div", bt, [s.generation.thinking ? (c(), h("details", ct, [I[7] || (I[7] = e("summary", null, "思考中", -1)), e("div", null, S(s.generation.thinking), 1)])) : B("", !0), e("div", yt, [s.generation.text ? (c(), H(re(ve), {
        key: 0,
        content: o.value
      }, null, 8, ["content"])) : (c(), h(G, { key: 1 }, [U(S(s.generation.status === "error" ? s.generation.message : p[s.generation.phase || "replying"]), 1)], 64)), s.generation.unsaved ? (c(), h("small", pt, "未保存")) : B("", !0)])])])) : B("", !0),
      a.value ? B("", !0) : (c(), h("button", {
        key: 4,
        type: "button",
        class: "fourth-wall-latest",
        disabled: m.value,
        onClick: I[5] || (I[5] = (w) => F("latest"))
      }, "回到最新 ↓", 8, ht))
    ], 544));
  }
}), wt = kt, $t = {
  class: "fourth-wall-modal",
  role: "dialog",
  "aria-label": "四次元壁提示词"
}, Ct = { class: "fourth-wall-prompt-fields" }, It = /* @__PURE__ */ O({
  __name: "FourthWallPromptEditor",
  props: { templates: {} },
  emits: [
    "close",
    "save",
    "restore"
  ],
  setup(s, { emit: T }) {
    const n = s, i = T, u = J(structuredClone(R(n.templates))), v = M(null);
    ue(v, () => i("close"));
    function o() {
      i("save", structuredClone(R(u)));
    }
    return (m, a) => (c(), h("div", {
      ref_key: "layer",
      ref: v,
      class: "fourth-wall-modal-backdrop",
      onClick: a[6] || (a[6] = Ie((r) => i("close"), ["self"]))
    }, [e("section", $t, [
      e("header", null, [a[7] || (a[7] = e("strong", null, "提示词模板", -1)), e("button", {
        type: "button",
        onClick: a[0] || (a[0] = (r) => i("close"))
      }, "关闭")]),
      e("div", Ct, [
        e("label", null, [a[8] || (a[8] = U("Top User", -1)), D(e("textarea", {
          "onUpdate:modelValue": a[1] || (a[1] = (r) => u.topuser = r),
          rows: "5"
        }, null, 512), [[z, u.topuser]])]),
        e("label", null, [a[9] || (a[9] = U("Confirm", -1)), D(e("textarea", {
          "onUpdate:modelValue": a[2] || (a[2] = (r) => u.confirm = r),
          rows: "3"
        }, null, 512), [[z, u.confirm]])]),
        e("label", null, [a[10] || (a[10] = U("Meta Protocol", -1)), D(e("textarea", {
          "onUpdate:modelValue": a[3] || (a[3] = (r) => u.metaProtocol = r),
          rows: "12"
        }, null, 512), [[z, u.metaProtocol]])]),
        e("label", null, [a[11] || (a[11] = U("Bottom", -1)), D(e("textarea", {
          "onUpdate:modelValue": a[4] || (a[4] = (r) => u.bottom = r),
          rows: "5"
        }, null, 512), [[z, u.bottom]])])
      ]),
      e("footer", null, [e("button", {
        type: "button",
        class: "is-danger",
        onClick: a[5] || (a[5] = (r) => i("restore"))
      }, "恢复默认"), e("button", {
        type: "button",
        class: "is-primary",
        onClick: o
      }, "保存")])
    ])], 512));
  }
}), xt = It, St = { class: "fourth-wall-settings-section" }, At = { class: "fourth-wall-session-row" }, Tt = ["value", "disabled"], Mt = ["value"], qt = ["disabled"], Et = ["disabled"], Ft = ["disabled"], Bt = /* @__PURE__ */ O({
  __name: "FourthWallSessions",
  props: {
    sessions: {},
    activeSessionId: {},
    disabled: { type: Boolean }
  },
  emits: [
    "switch",
    "add",
    "rename",
    "delete"
  ],
  setup(s, { emit: T }) {
    const n = T;
    function i() {
      const o = window.prompt("新记录名称", "新记录")?.trim();
      o && n("add", o);
    }
    function u(o, m) {
      const a = window.prompt("重命名记录", m)?.trim();
      a && n("rename", o, a);
    }
    function v(o) {
      window.confirm("确定删除当前记录及其皮下记忆吗？") && n("delete", o);
    }
    return (o, m) => (c(), h("section", St, [m[3] || (m[3] = e("h3", null, "聊天记录", -1)), e("div", At, [
      e("select", {
        value: s.activeSessionId,
        disabled: s.disabled,
        onChange: m[0] || (m[0] = (a) => n("switch", a.target.value))
      }, [(c(!0), h(G, null, oe(s.sessions, (a) => (c(), h("option", {
        key: a.id,
        value: a.id
      }, S(a.name), 9, Mt))), 128))], 40, Tt),
      e("button", {
        type: "button",
        disabled: s.disabled,
        title: "新建记录",
        onClick: i
      }, "＋", 8, qt),
      e("button", {
        type: "button",
        disabled: s.disabled,
        title: "重命名记录",
        onClick: m[1] || (m[1] = (a) => u(s.activeSessionId, s.sessions.find((r) => r.id === s.activeSessionId)?.name || ""))
      }, " 改 ", 8, Et),
      e("button", {
        type: "button",
        disabled: s.disabled || s.sessions.length <= 1,
        title: "删除记录",
        class: "is-danger",
        onClick: m[2] || (m[2] = (a) => v(s.activeSessionId))
      }, " 删 ", 8, Ft)
    ])]));
  }
}), Wt = Bt, Vt = { class: "fourth-wall-settings-scroll" }, Dt = { class: "fourth-wall-settings-section" }, Ut = { class: "is-toggle" }, Nt = { class: "is-toggle" }, Rt = ["disabled"], Pt = { class: "fourth-wall-settings-section" }, zt = { class: "is-toggle" }, Ot = { class: "is-toggle" }, Ht = { class: "is-toggle" }, Lt = { key: 0 }, jt = ["disabled"], Gt = { class: "fourth-wall-settings-section is-actions" }, Kt = /* @__PURE__ */ O({
  __name: "FourthWallSettings",
  props: {
    chat: {},
    global: {},
    busy: { type: Boolean }
  },
  emits: [
    "close",
    "updateChat",
    "updateGlobal",
    "switchSession",
    "addSession",
    "renameSession",
    "deleteSession",
    "openPrompts"
  ],
  setup(s, { emit: T }) {
    const n = s, i = T, u = J(structuredClone(R(n.chat.settings))), v = M(null);
    ue(v, () => i("close"));
    const o = J(structuredClone(R(n.global)));
    function m() {
      i("updateChat", structuredClone(R(u)));
    }
    function a() {
      i("updateGlobal", {
        image: structuredClone(R(o.image)),
        voice: structuredClone(R(o.voice)),
        commentary: structuredClone(R(o.commentary))
      });
    }
    return (r, l) => (c(), h("aside", {
      ref_key: "layer",
      ref: v,
      class: "fourth-wall-settings",
      "aria-label": "四次元壁设置"
    }, [e("header", null, [l[13] || (l[13] = e("strong", null, "四次元壁设置", -1)), e("button", {
      type: "button",
      onClick: l[0] || (l[0] = (p) => i("close"))
    }, "关闭")]), e("div", Vt, [
      Z(Wt, {
        sessions: s.chat.sessions,
        "active-session-id": s.chat.activeSessionId,
        disabled: s.busy,
        onSwitch: l[1] || (l[1] = (p) => i("switchSession", p)),
        onAdd: l[2] || (l[2] = (p) => i("addSession", p)),
        onRename: l[3] || (l[3] = (p, x) => i("renameSession", p, x)),
        onDelete: l[4] || (l[4] = (p) => i("deleteSession", p))
      }, null, 8, [
        "sessions",
        "active-session-id",
        "disabled"
      ]),
      e("section", Dt, [
        l[17] || (l[17] = e("h3", null, "上下文", -1)),
        e("label", null, [l[14] || (l[14] = U("带入的主聊天楼层数", -1)), D(e("input", {
          "onUpdate:modelValue": l[5] || (l[5] = (p) => u.maxChatLayers = p),
          type: "number",
          min: "1",
          max: "9999"
        }, null, 512), [[
          z,
          u.maxChatLayers,
          void 0,
          { number: !0 }
        ]])]),
        e("label", Ut, [l[15] || (l[15] = e("span", null, "流式生成", -1)), D(e("input", {
          "onUpdate:modelValue": l[6] || (l[6] = (p) => u.stream = p),
          type: "checkbox"
        }, null, 512), [[j, u.stream]])]),
        e("label", Nt, [l[16] || (l[16] = e("span", null, "禁用助手预填充", -1)), D(e("input", {
          "onUpdate:modelValue": l[7] || (l[7] = (p) => u.disableAssistantPrefill = p),
          type: "checkbox"
        }, null, 512), [[j, u.disableAssistantPrefill]])]),
        e("button", {
          type: "button",
          class: "is-primary",
          disabled: s.busy,
          onClick: m
        }, "保存上下文设置", 8, Rt)
      ]),
      e("section", Pt, [
        l[21] || (l[21] = e("h3", null, "回复方式", -1)),
        e("label", zt, [l[18] || (l[18] = e("span", null, "允许对方发图片", -1)), D(e("input", {
          "onUpdate:modelValue": l[8] || (l[8] = (p) => o.image.enablePrompt = p),
          type: "checkbox"
        }, null, 512), [[j, o.image.enablePrompt]])]),
        e("label", Ot, [l[19] || (l[19] = e("span", null, "允许对方发语音", -1)), D(e("input", {
          "onUpdate:modelValue": l[9] || (l[9] = (p) => o.voice.enabled = p),
          type: "checkbox"
        }, null, 512), [[j, o.voice.enabled]])]),
        e("label", Ht, [l[20] || (l[20] = e("span", null, "实时吐槽", -1)), D(e("input", {
          "onUpdate:modelValue": l[10] || (l[10] = (p) => o.commentary.enabled = p),
          type: "checkbox"
        }, null, 512), [[j, o.commentary.enabled]])]),
        o.commentary.enabled ? (c(), h("label", Lt, [U(" 吐槽概率 " + S(o.commentary.probability) + "% ", 1), D(e("input", {
          "onUpdate:modelValue": l[11] || (l[11] = (p) => o.commentary.probability = p),
          type: "range",
          min: "1",
          max: "99"
        }, null, 512), [[
          z,
          o.commentary.probability,
          void 0,
          { number: !0 }
        ]])])) : B("", !0),
        e("button", {
          type: "button",
          class: "is-primary",
          disabled: s.busy,
          onClick: a
        }, "保存设置", 8, jt)
      ]),
      e("section", Gt, [e("button", {
        type: "button",
        onClick: l[12] || (l[12] = (p) => i("openPrompts"))
      }, "提示词模板")])
    ])], 512));
  }
}), Xt = Kt, Jt = { class: "fourth-wall-app" }, Qt = { class: "fourth-wall-header" }, Yt = { class: "fourth-wall-heading" }, Zt = { class: "fourth-wall-header-actions" }, _t = ["disabled"], ea = ["disabled"], ta = {
  key: 0,
  class: "fourth-wall-error",
  role: "alert"
}, aa = ["disabled"], sa = { class: "fourth-wall-composer" }, la = ["disabled"], na = ["disabled"], ra = ["disabled"], oa = { class: "fourth-wall-clear-choice" }, ia = {
  key: 0,
  class: "fourth-wall-dialog-error",
  role: "alert"
}, ua = ["disabled"], da = ["disabled"], X = 35e3, va = /* @__PURE__ */ O({
  __name: "FourthWallApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(s) {
    const T = s, n = M(structuredClone(R(T.initialState))), i = M(""), u = M(!1), v = M(!1), o = M(!1), m = M(""), a = M(!1), r = M(!1), l = M(!1), p = M(!1), x = M(""), q = M(0), E = M(!1), F = M(0);
    let W;
    const d = M({
      status: "idle",
      sessionId: "",
      text: "",
      thinking: "",
      message: "",
      unsaved: !1
    });
    let I = () => {
    };
    const w = P(() => n.value.chat.sessions.find((y) => y.id === n.value.chat.activeSessionId)), $ = P(() => d.value.status === "started" || d.value.status === "progress"), A = P(() => ({
      ...n.value.context,
      usedTokens: n.value.context.usedTokens + F.value,
      promptTokens: n.value.context.promptTokens + F.value
    }));
    L(() => [i.value, d.value.text], () => {
      W || (W = setTimeout(() => {
        F.value = Y(i.value) + Y(d.value.text), W = void 0;
      }, 200));
    }), L(() => w.value.id, () => {
      p.value = !1, r.value = !1, E.value = !1, i.value = "", d.value = {
        status: "idle",
        sessionId: "",
        text: "",
        thinking: "",
        message: "",
        unsaved: !1
      };
    });
    function f(y = w.value.id) {
      return {
        chatIdentity: n.value.chatIdentity,
        sessionId: y
      };
    }
    function g(y) {
      return structuredClone(y.result);
    }
    async function b(y, t) {
      o.value = !0, m.value = "";
      try {
        return n.value = g(await T.bridge.request(y, t, X)), !0;
      } catch (k) {
        return m.value = k instanceof Error ? k.message : String(k), !1;
      } finally {
        o.value = !1;
      }
    }
    async function C() {
      const y = i.value.trim();
      if (!(!y || $.value || o.value)) {
        i.value = "", m.value = "", E.value = !1, d.value = {
          status: "started",
          sessionId: w.value.id,
          text: "",
          thinking: "",
          message: "",
          unsaved: !1
        };
        try {
          await T.bridge.request("fourth-wall/send", {
            ...f(),
            content: y
          }, X);
        } catch (t) {
          m.value = `还不确定是否发送成功：${t instanceof Error ? t.message : String(t)}。请核对聊天记录后再发送。原输入：${y}`, d.value.status = "idle";
        }
      }
    }
    async function V() {
      if (!($.value || o.value)) {
        m.value = "", E.value = !1, d.value = {
          status: "started",
          sessionId: w.value.id,
          text: "",
          thinking: "",
          message: "",
          unsaved: !1
        };
        try {
          await T.bridge.request("fourth-wall/regenerate", f(), X);
        } catch (y) {
          m.value = y instanceof Error ? y.message : String(y), d.value.status = "idle";
        }
      }
    }
    function N() {
      T.bridge.post("fourth-wall/cancel", f());
    }
    function K(y) {
      y && (i.value ? m.value += `
未保存的原输入：${y}` : i.value = y);
    }
    function fe(y) {
      y.key !== "Enter" || y.shiftKey || a.value || (y.preventDefault(), $.value ? N() : C());
    }
    function ge(y) {
      const t = y < w.value.archivedCount ? `这条消息已记入皮下记忆；删除消息不会让对方忘记，需要遗忘的内容请到皮下记忆中删除。
` : "";
      window.confirm(`${t}确定删除这条消息吗？`) && b("fourth-wall/delete-message", {
        ...f(),
        revision: n.value.history.revision,
        messageIndex: y
      });
    }
    function be() {
      l.value = !1, r.value = !0;
    }
    async function ce() {
      await b("fourth-wall/clear-history", {
        ...f(),
        clearMemory: l.value
      }) && (r.value = !1);
    }
    async function ye(y, t, k) {
      y < w.value.archivedCount && !window.confirm("这条消息已记入皮下记忆，修改消息不会同时修改记忆；需要更正时请另行编辑皮下记忆。继续修改？") || await b("fourth-wall/edit-message", {
        ...f(),
        revision: k,
        messageIndex: y,
        content: t
      });
    }
    async function te(y) {
      if (!($.value || o.value)) {
        m.value = "", E.value = !1, d.value = {
          status: "started",
          sessionId: w.value.id,
          text: "",
          thinking: "",
          message: "",
          unsaved: !1,
          phase: "counting",
          manual: y === "summarize"
        };
        try {
          await T.bridge.request(`fourth-wall/${y}`, f(), X);
        } catch (t) {
          d.value.status = "idle", m.value = String(t instanceof Error ? t.message : t);
        }
      }
    }
    async function pe() {
      if (o.value || $.value) return;
      o.value = !0, m.value = "";
      const y = f(), t = n.value.history.revision;
      try {
        const k = await T.bridge.request("fourth-wall/read-memory", {
          ...y,
          revision: t
        });
        if (y.sessionId !== w.value.id || y.chatIdentity !== n.value.chatIdentity) return;
        x.value = k.result.content, q.value = t, p.value = !0;
      } catch (k) {
        m.value = k instanceof Error ? k.message : String(k);
      } finally {
        o.value = !1;
      }
    }
    async function he(y) {
      await b("fourth-wall/save-memory", {
        ...f(),
        revision: q.value,
        expectedContent: x.value,
        content: y
      }) && (p.value = !1);
    }
    function ke(y) {
      b("fourth-wall/update-chat-settings", {
        ...f(),
        patch: y
      });
    }
    function ae(y) {
      b("fourth-wall/update-global-settings", {
        ...f(),
        patch: y
      });
    }
    return ne(() => {
      I = T.bridge.subscribe((y) => {
        if (y.type === "fourth-wall/state" && (n.value = structuredClone(y.payload.state)), y.type !== "fourth-wall/generation") return;
        const t = y.payload;
        if (!(t.sessionId && t.sessionId !== w.value.id)) {
          if (t.status === "complete" || t.status === "cancelled") {
            t.status === "cancelled" && (t.message && (m.value = t.message), K(t.inputDraft)), F.value = Y(i.value), d.value = {
              status: "idle",
              sessionId: "",
              text: "",
              thinking: "",
              message: "",
              unsaved: !1
            };
            return;
          }
          if (t.status === "error") {
            m.value = t.message || "生成失败", E.value = !t.manual && t.kind !== "save" && t.kind !== "input-save", K(t.inputDraft), d.value = t.kind === "save" && (t.draft?.text || t.draft?.thinking) ? {
              status: "error",
              sessionId: t.sessionId || w.value.id,
              text: t.draft?.text || "",
              thinking: t.draft?.thinking || "",
              message: "",
              unsaved: !0
            } : {
              status: "idle",
              sessionId: "",
              text: "",
              thinking: "",
              message: "",
              unsaved: !1
            };
            return;
          }
          d.value = {
            status: t.status || "progress",
            sessionId: t.sessionId || w.value.id,
            text: t.text || d.value.text,
            thinking: t.thinking || d.value.thinking,
            message: "",
            unsaved: !1,
            phase: t.phase || d.value.phase,
            manual: t.manual ?? d.value.manual
          };
        }
      });
    }), le(() => {
      I(), clearTimeout(W);
    }), (y, t) => (c(), h("main", Jt, [
      e("header", Qt, [e("div", Yt, [t[23] || (t[23] = e("span", null, "IV", -1)), e("div", null, [t[22] || (t[22] = e("strong", null, "四次元壁", -1)), e("small", null, S(w.value.name), 1)])]), e("div", Zt, [
        Z(Fe, {
          stats: A.value,
          busy: $.value,
          phase: d.value.phase,
          onSummarize: t[0] || (t[0] = (k) => te("summarize")),
          onCancel: N
        }, null, 8, [
          "stats",
          "busy",
          "phase"
        ]),
        e("button", {
          type: "button",
          title: "皮下记忆",
          "aria-label": "皮下记忆",
          disabled: o.value || $.value,
          onClick: pe
        }, [...t[24] || (t[24] = [e("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [e("path", { d: "M12 5c-3-2-7-2-9-1v15c3-1 6-1 9 1m0-15c3-2 7-2 9-1v15c-3-1-6-1-9 1V5Z" })], -1)])], 8, _t),
        e("button", {
          type: "button",
          title: "清空当前记录",
          "aria-label": "清空当前记录",
          disabled: o.value,
          onClick: be
        }, [...t[25] || (t[25] = [e("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [e("path", { d: "M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" })], -1)])], 8, ea),
        e("button", {
          type: "button",
          title: "设置",
          onClick: t[1] || (t[1] = (k) => u.value = !0)
        }, "⚙")
      ])]),
      m.value ? (c(), h("div", ta, [
        e("span", null, S(m.value), 1),
        E.value ? (c(), h("button", {
          key: 0,
          type: "button",
          disabled: $.value || o.value,
          onClick: t[2] || (t[2] = (k) => te("retry"))
        }, "重试回复", 8, aa)) : B("", !0),
        e("button", {
          type: "button",
          "aria-label": "关闭错误提示",
          onClick: t[3] || (t[3] = (k) => m.value = "")
        }, "×")
      ])) : B("", !0),
      Z(wt, {
        page: n.value.history,
        busy: o.value || $.value,
        "session-id": w.value.id,
        "chat-identity": n.value.chatIdentity,
        "user-avatar": n.value.userAvatar,
        "character-avatar": n.value.characterAvatar,
        "image-available": n.value.capabilities.image.available,
        "voice-available": n.value.capabilities.voice.available,
        generation: d.value,
        bridge: s.bridge,
        onEdit: ye,
        onDelete: ge,
        onError: t[4] || (t[4] = (k) => m.value = k)
      }, null, 8, [
        "page",
        "busy",
        "session-id",
        "chat-identity",
        "user-avatar",
        "character-avatar",
        "image-available",
        "voice-available",
        "generation",
        "bridge"
      ]),
      e("footer", sa, [
        e("button", {
          type: "button",
          class: "fourth-wall-regenerate",
          title: "重答",
          "aria-label": "重答",
          disabled: o.value || $.value,
          onClick: V
        }, " ↻ ", 8, la),
        D(e("textarea", {
          "onUpdate:modelValue": t[5] || (t[5] = (k) => i.value = k),
          rows: "1",
          placeholder: "聊点什么...",
          disabled: o.value,
          onCompositionstart: t[6] || (t[6] = (k) => a.value = !0),
          onCompositionend: t[7] || (t[7] = (k) => a.value = !1),
          onKeydown: fe
        }, null, 40, na), [[z, i.value]]),
        e("button", {
          type: "button",
          class: ee({ "is-stop": $.value }),
          disabled: o.value,
          onClick: t[8] || (t[8] = (k) => $.value ? N() : C())
        }, S($.value ? "■" : "↑"), 11, ra)
      ]),
      u.value ? (c(), H(Xt, {
        key: 1,
        chat: n.value.chat,
        global: n.value.global,
        busy: o.value || $.value,
        onClose: t[9] || (t[9] = (k) => u.value = !1),
        onUpdateChat: ke,
        onUpdateGlobal: ae,
        onSwitchSession: t[10] || (t[10] = (k) => b("fourth-wall/switch-session", {
          ...f(),
          targetSessionId: k
        })),
        onAddSession: t[11] || (t[11] = (k) => b("fourth-wall/add-session", {
          ...f(),
          name: k
        })),
        onRenameSession: t[12] || (t[12] = (k, we) => b("fourth-wall/rename-session", {
          ...f(k),
          name: we
        })),
        onDeleteSession: t[13] || (t[13] = (k) => b("fourth-wall/delete-session", f(k))),
        onOpenPrompts: t[14] || (t[14] = (k) => v.value = !0)
      }, null, 8, [
        "chat",
        "global",
        "busy"
      ])) : B("", !0),
      v.value ? (c(), H(xt, {
        key: 2,
        templates: n.value.global.promptTemplates,
        onClose: t[15] || (t[15] = (k) => v.value = !1),
        onSave: t[16] || (t[16] = (k) => {
          ae({ promptTemplates: k }), v.value = !1;
        }),
        onRestore: t[17] || (t[17] = () => {
          b("fourth-wall/restore-prompts", f()), v.value = !1;
        })
      }, null, 8, ["templates"])) : B("", !0),
      p.value ? (c(), H(Re, {
        key: 3,
        content: x.value,
        busy: o.value,
        error: m.value,
        onClose: t[18] || (t[18] = (k) => p.value = !1),
        onSave: he
      }, null, 8, [
        "content",
        "busy",
        "error"
      ])) : B("", !0),
      r.value ? (c(), H(de, {
        key: 4,
        class: "fourth-wall-dialog",
        "aria-label": "清空皮下聊天",
        busy: o.value,
        onClose: t[21] || (t[21] = (k) => r.value = !1)
      }, {
        default: _(() => [
          t[27] || (t[27] = e("header", null, [e("strong", null, "清空皮下聊天？")], -1)),
          t[28] || (t[28] = e("p", null, "当前聊天原文将被删除，默认保留皮下记忆。", -1)),
          e("label", oa, [D(e("input", {
            "onUpdate:modelValue": t[19] || (t[19] = (k) => l.value = k),
            type: "checkbox"
          }, null, 512), [[j, l.value]]), t[26] || (t[26] = U("同时清空皮下记忆", -1))]),
          m.value ? (c(), h("p", ia, S(m.value), 1)) : B("", !0),
          e("footer", null, [e("button", {
            type: "button",
            disabled: o.value,
            onClick: t[20] || (t[20] = (k) => r.value = !1)
          }, "取消", 8, ua), e("button", {
            type: "button",
            class: "is-danger",
            disabled: o.value,
            onClick: ce
          }, "清空聊天", 8, da)])
        ]),
        _: 1
      }, 8, ["busy"])) : B("", !0)
    ]));
  }
}), pa = va;
export {
  pa as default
};
