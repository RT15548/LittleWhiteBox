/* eslint-disable */
import { n as $e } from "./xiaobai-os-message-markdown-p_WvGylV.js";
import { $ as _, E as se, F as c, G as V, H, J as X, L as le, M as ne, O as re, Q as oe, S as Z, W as ee, Y as M, Z as R, _ as p, b as Y, et as Ce, g as W, h as L, i as G, l as Ie, m as e, o as O, p as P, tt as S, u as j, x as z, y as U } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { n as ie, r as ue } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
import { t as J } from "./xiaobai-os-context-tokens-bfmDTbG3.js";
import { t as de } from "./xiaobai-os-AppDialog-CaAiivYL.js";
var xe = { class: "fourth-wall-context" }, Se = ["aria-label", "aria-expanded"], Ae = {
  key: 0,
  class: "fourth-wall-context-popover",
  "aria-label": "上下文用量"
}, Te = { class: "fourth-wall-context-total" }, Me = ["disabled"], qe = { key: 2 }, Ee = /* @__PURE__ */ z({
  __name: "FourthWallContextButton",
  props: {
    stats: {},
    busy: { type: Boolean },
    phase: {}
  },
  emits: ["summarize", "cancel"],
  setup(s, { emit: T }) {
    const l = s, i = T, d = M(!1);
    ie(() => (d.value = !1, !0), () => d.value);
    const m = P(() => Math.min(1, l.stats.usedTokens / l.stats.limit)), o = (a) => `${(a / 1e3).toFixed(1)}k`, v = {
      counting: "计算中",
      summarizing: "总结中",
      saving: "保存中",
      replying: "回复中"
    };
    return (a, n) => (c(), p("div", xe, [e("button", {
      type: "button",
      class: _(["fourth-wall-context-ring", { "is-warning": s.stats.usedTokens >= s.stats.trigger }]),
      style: Ce({ "--context-fill": `${m.value * 360}deg` }),
      "aria-label": `上下文：约 ${o(s.stats.usedTokens)} / 158k`,
      "aria-expanded": d.value,
      title: "上下文",
      onClick: n[0] || (n[0] = (r) => d.value = !d.value)
    }, [e("span", null, S(s.busy ? "…" : ""), 1)], 14, Se), d.value ? (c(), p("section", Ae, [
      e("header", null, [n[4] || (n[4] = e("strong", null, "上下文", -1)), e("button", {
        type: "button",
        "aria-label": "关闭上下文用量",
        onClick: n[1] || (n[1] = (r) => d.value = !1)
      }, "×")]),
      e("p", Te, "约 " + S(o(s.stats.usedTokens)) + " / 158k", 1),
      e("dl", null, [
        n[5] || (n[5] = e("dt", null, "主剧情", -1)),
        e("dd", null, S(o(s.stats.mainTokens)), 1),
        n[6] || (n[6] = e("dt", null, "皮下记忆", -1)),
        e("dd", null, S(o(s.stats.memoryTokens)), 1),
        n[7] || (n[7] = e("dt", null, "皮下聊天", -1)),
        e("dd", null, S(o(s.stats.historyTokens)), 1),
        n[8] || (n[8] = e("dt", null, "提示词与输入", -1)),
        e("dd", null, S(o(s.stats.promptTokens)), 1)
      ]),
      n[9] || (n[9] = e("p", null, "128k 时在下次回复前自动总结。", -1)),
      s.busy ? (c(), p("button", {
        key: 0,
        type: "button",
        onClick: n[2] || (n[2] = (r) => i("cancel"))
      }, S(s.phase ? v[s.phase] : "处理中") + " · 取消", 1)) : (c(), p("button", {
        key: 1,
        type: "button",
        disabled: !s.stats.canSummarize,
        onClick: n[3] || (n[3] = (r) => {
          i("summarize"), d.value = !1;
        })
      }, "立即总结", 8, Me)),
      !s.stats.canSummarize && !s.busy ? (c(), p("small", qe, "暂无可总结的较早聊天，近期原文会保留。")) : W("", !0)
    ])) : W("", !0)]));
  }
}), Fe = Ee, We = ["disabled"], Be = ["disabled"], De = {
  key: 0,
  class: "fourth-wall-dialog-error",
  role: "alert"
}, Ve = ["disabled"], Ue = ["disabled"], Ne = /* @__PURE__ */ z({
  __name: "FourthWallMemory",
  props: {
    content: {},
    busy: { type: Boolean },
    error: {}
  },
  emits: ["close", "save"],
  setup(s, { emit: T }) {
    const l = s, i = T, d = M(l.content);
    function m() {
      (d.value === l.content || window.confirm("放弃尚未保存的记忆修改？")) && i("close");
    }
    function o() {
      window.confirm("清空皮下记忆？聊天记录会保留，但已总结过的旧消息不会自动再发给模型。") && (d.value = "", i("save", ""));
    }
    return (v, a) => (c(), L(de, {
      class: "fourth-wall-memory fourth-wall-dialog",
      "aria-label": "皮下记忆",
      busy: s.busy,
      onClose: m
    }, {
      default: ee(() => [
        e("header", null, [a[2] || (a[2] = e("strong", null, "皮下记忆", -1)), e("button", {
          type: "button",
          disabled: s.busy,
          onClick: m
        }, "关闭", 8, We)]),
        V(e("textarea", {
          "onUpdate:modelValue": a[0] || (a[0] = (n) => d.value = n),
          "aria-label": "皮下记忆正文",
          disabled: s.busy,
          placeholder: "总结后的皮下人设与长期记忆，也可以直接填写。"
        }, null, 8, Be), [[O, d.value]]),
        s.error ? (c(), p("p", De, S(s.error), 1)) : W("", !0),
        e("footer", null, [e("button", {
          type: "button",
          class: "is-danger",
          disabled: s.busy || !s.content,
          onClick: o
        }, "清空记忆", 8, Ve), e("button", {
          type: "button",
          class: "is-primary",
          disabled: s.busy,
          onClick: a[1] || (a[1] = (n) => i("save", d.value))
        }, "保存", 8, Ue)])
      ]),
      _: 1
    }, 8, ["busy"]));
  }
}), Re = Ne, ve = z({
  name: "FourthWallContent",
  props: { content: {
    type: Object,
    required: !0
  } },
  setup(s, { slots: T }) {
    function l(i) {
      if (i.kind === "text") return i.value;
      if (i.kind === "media") {
        const m = s.content.media[i.index];
        return T.media?.({
          segment: m,
          index: i.index
        }) ?? m.raw;
      }
      const d = Z(i.tag, i.attrs, i.children.map(l));
      return i.tag === "table" ? Z("div", { class: "fourth-wall-table-scroll" }, [d]) : d;
    }
    return () => Z("div", { class: "fourth-wall-markdown" }, s.content.nodes.map(l));
  }
}), Oe = /* @__PURE__ */ new Set([
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
]), Pe = /* @__PURE__ */ new Set([
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
  const l = [], i = `XB4W${Array.from(crypto.getRandomValues(new Uint32Array(4))).join("")}MEDIA`, d = s.replace(/\[(?:img|图片)\s*:\s*([^\]]+)\]|\[(?:voice|语音)\s*:([^:\]]*):([^\]]+)\]|\[(?:voice|语音)\s*:\s*([^\]]+)\]/gi, (r, h, x, q, E, F) => {
    let B = 0;
    for (let u = F - 1; u >= 0 && s[u] === "\\"; u--) B++;
    return B % 2 ? r : (l.push(h !== void 0 ? {
      kind: "image",
      raw: r,
      value: h.trim()
    } : {
      kind: "voice",
      raw: r,
      value: String(q ?? E ?? "").trim(),
      emotion: String(x || "").trim().toLowerCase()
    }), `${i}${l.length - 1}END`);
  }), m = new RegExp(`${i}(\\d+)END`, "g"), o = (r) => r.replace(m, (h, x) => l[Number(x)].raw);
  function v(r, h) {
    if (h) return [{
      kind: "text",
      value: o(r)
    }];
    const x = [];
    let q = 0;
    for (const E of r.matchAll(m))
      E.index > q && x.push({
        kind: "text",
        value: r.slice(q, E.index)
      }), x.push({
        kind: "media",
        index: Number(E[1])
      }), q = E.index + E[0].length;
    return q < r.length && x.push({
      kind: "text",
      value: r.slice(q)
    }), x;
  }
  function a(r, h = !1) {
    if (r.nodeType === 3) return v(r.textContent || "", h);
    if (r.nodeType !== 1) return [];
    const x = r, q = x.localName;
    if (Pe.has(q)) return [];
    if (q === "img") return [{
      kind: "text",
      value: o(x.getAttribute("alt") || "")
    }];
    const E = Array.from(x.childNodes).flatMap((B) => a(B, h || [
      "code",
      "pre",
      "a"
    ].includes(q)));
    if (!Oe.has(q)) return E;
    const F = {};
    if (q === "a") {
      const B = o(x.getAttribute("href") || "").trim();
      if (!/^(?:https?:\/\/|mailto:)/i.test(B)) return E;
      F.href = B, F.target = "_blank", F.rel = "noopener noreferrer", x.hasAttribute("title") && (F.title = o(x.getAttribute("title")));
    }
    return q === "ol" && /^\d+$/.test(x.getAttribute("start") || "") && (F.start = x.getAttribute("start")), [{
      kind: "element",
      tag: q,
      attrs: F,
      children: E
    }];
  }
  const n = T.createElement("template");
  return n.innerHTML = $e(d, { htmlFenceMode: "code" }), {
    nodes: Array.from(n.content.childNodes).flatMap((r) => a(r)),
    media: l
  };
}
var ze = ["data-message-index"], Le = ["src"], He = {
  key: 1,
  class: "fourth-wall-avatar is-placeholder",
  "aria-hidden": "true"
}, Ge = { class: "fourth-wall-message-stack" }, je = {
  key: 0,
  class: "fourth-wall-thinking"
}, Ke = { class: "fourth-wall-bubble" }, Qe = ["data-image-index"], Xe = ["src", "alt"], Ze = ["onClick"], Je = {
  key: 2,
  class: "fourth-wall-image-unavailable"
}, Ye = ["disabled", "onClick"], _e = ["onClick"], et = { "aria-hidden": "true" }, tt = { key: 0 }, at = { class: "fourth-wall-message-actions" }, st = ["disabled"], lt = ["disabled"], nt = ["disabled"], rt = { key: 1 }, ot = /* @__PURE__ */ z({
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
    const l = s, i = T, d = P(() => l.editDraft !== void 0);
    ie(() => (i("editCancel"), !0), () => d.value);
    const m = P({
      get: () => l.editDraft || "",
      set: (f) => i("draft", f)
    }), o = M(null);
    let v = null;
    const a = X({}), n = /* @__PURE__ */ new Set();
    let r = () => {
    };
    const h = P(() => me(l.message.content)), x = P(() => l.message.ts ? new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(l.message.ts) : "");
    function q(f, g) {
      return `fw-${f}-${Date.now()}-${l.messageIndex}-${g}-${Math.random().toString(36).slice(2, 7)}`;
    }
    function E(f) {
      return f.result;
    }
    function F(f, g) {
      return n.has(g) && a[f]?.requestId === g;
    }
    async function B(f, g) {
      if (a[g]?.status === "loading" || a[g]?.status === "ready") return;
      if (!l.imageAvailable) {
        a[g] = {
          status: "unavailable",
          message: "请先开启画图功能"
        };
        return;
      }
      const b = q("image", g);
      n.add(b), a[g] = {
        status: "loading",
        message: "正在加载图片",
        requestId: b
      };
      const C = {
        chatIdentity: l.chatIdentity,
        sessionId: l.sessionId
      };
      try {
        const D = E(await l.bridge.request("fourth-wall/image-check", {
          ...C,
          tags: f.value,
          mediaRequestId: b
        }, 3e4));
        if (!F(g, b)) return;
        if (!D.available) {
          a[g] = {
            status: "unavailable",
            message: "请先开启画图功能",
            requestId: b
          };
          return;
        }
        let N = D.cached || "";
        if (!N) {
          a[g] = {
            status: "loading",
            message: "正在生成图片",
            requestId: b
          };
          const K = E(await l.bridge.request("fourth-wall/image-generate", {
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
      } catch (D) {
        F(g, b) && (a[g] = {
          status: "error",
          message: D instanceof Error ? D.message : String(D),
          requestId: b
        });
      } finally {
        n.delete(b);
      }
    }
    async function u(f, g) {
      if (!l.voiceAvailable) {
        a[g] = {
          status: "unavailable",
          message: "请先开启 TTS 语音"
        };
        return;
      }
      const b = a[g];
      if (b?.status === "loading") return;
      if (b?.status === "playing" && b.requestId) {
        l.bridge.post("fourth-wall/voice-stop", {
          chatIdentity: l.chatIdentity,
          mediaRequestId: b.requestId
        }), a[g] = { status: "idle" };
        return;
      }
      const C = q("voice", g);
      n.add(C), a[g] = {
        status: "loading",
        message: "正在准备语音",
        requestId: C
      };
      try {
        await l.bridge.request("fourth-wall/voice-play", {
          chatIdentity: l.chatIdentity,
          sessionId: l.sessionId,
          mediaRequestId: C,
          text: f.value,
          emotion: f.emotion
        });
      } catch (D) {
        F(g, C) && (a[g] = {
          status: "error",
          message: D instanceof Error ? D.message : String(D),
          requestId: C
        }), n.delete(C);
      }
    }
    function I() {
      i("draft", l.message.content);
    }
    function w() {
      const f = m.value.trim();
      f && i("edit", l.messageIndex, f);
    }
    function $() {
      n.forEach((f) => {
        l.bridge.post("fourth-wall/image-cancel", {
          chatIdentity: l.chatIdentity,
          mediaRequestId: f
        }), l.bridge.post("fourth-wall/voice-stop", {
          chatIdentity: l.chatIdentity,
          mediaRequestId: f
        });
      }), n.clear();
    }
    function A() {
      v?.disconnect(), o.value?.querySelectorAll("[data-image-index]").forEach((f) => v?.observe(f));
    }
    return ne(() => {
      r = l.bridge.subscribe((f) => {
        if (f.type === "fourth-wall/image-progress") {
          const g = f.payload, b = Object.keys(a).map(Number).find((C) => a[C]?.requestId === g.mediaRequestId);
          b !== void 0 && (a[b].message = g.status === "queued" ? `图片队列第 ${g.position || 1} 位` : "正在生成图片");
        }
        if (f.type === "fourth-wall/voice-state") {
          const g = f.payload, b = Object.keys(a).map(Number).find((C) => a[C]?.requestId === g.requestId);
          if (b === void 0) return;
          g.state === "playing" && (a[b].status = "playing"), (g.state === "ended" || g.state === "stopped") && (n.delete(String(g.requestId || "")), a[b] = { status: "idle" }), g.state === "error" && (n.delete(String(g.requestId || "")), a[b] = {
            status: "error",
            message: g.message || "语音播放失败"
          });
        }
      }), o.value && typeof IntersectionObserver < "u" && (v = new IntersectionObserver((f) => {
        for (const g of f) {
          if (!g.isIntersecting) continue;
          const b = Number(g.target.dataset.imageIndex), C = h.value.media[b];
          C?.kind === "image" && B(C, b), v?.unobserve(g.target);
        }
      }, { root: o.value.closest(".fourth-wall-conversation") }), A());
    }), H(() => l.message.content, () => {
      $(), Object.keys(a).forEach((f) => delete a[Number(f)]);
    }), H([h, d], A, { flush: "post" }), re(() => {
      r(), v?.disconnect(), $();
    }), (f, g) => (c(), p("article", {
      ref_key: "root",
      ref: o,
      class: _(["fourth-wall-message", s.message.role === "user" ? "is-user" : "is-ai"]),
      "data-message-index": s.messageIndex
    }, [(s.message.role === "user" ? s.userAvatar : s.characterAvatar) ? (c(), p("img", {
      key: 0,
      class: "fourth-wall-avatar",
      src: s.message.role === "user" ? s.userAvatar : s.characterAvatar,
      alt: ""
    }, null, 8, Le)) : (c(), p("span", He)), e("div", Ge, [
      s.message.thinking ? (c(), p("details", je, [g[3] || (g[3] = e("summary", null, "思考过程", -1)), e("div", null, S(s.message.thinking), 1)])) : W("", !0),
      e("div", Ke, [d.value ? V((c(), p("textarea", {
        key: 0,
        "onUpdate:modelValue": g[0] || (g[0] = (b) => m.value = b),
        class: "fourth-wall-edit",
        rows: "3"
      }, null, 512)), [[O, m.value]]) : (c(), L(oe(ve), {
        key: 1,
        content: h.value
      }, {
        media: ee(({ segment: b, index: C }) => [b.kind === "image" ? (c(), p("span", {
          key: 0,
          class: "fourth-wall-image-card",
          "data-image-index": C
        }, [a[C]?.status === "ready" ? (c(), p("img", {
          key: 0,
          src: a[C].source,
          alt: b.value
        }, null, 8, Xe)) : a[C]?.status === "error" ? (c(), p("button", {
          key: 1,
          type: "button",
          onClick: (D) => B(b, C)
        }, [U(S(b.raw), 1), e("small", null, S(a[C].message) + "，点此重试", 1)], 8, Ze)) : a[C]?.status === "unavailable" ? (c(), p("span", Je, [U(S(b.raw), 1), e("small", null, S(a[C].message), 1)])) : (c(), p("button", {
          key: 3,
          type: "button",
          disabled: a[C]?.status === "loading",
          onClick: (D) => B(b, C)
        }, [U(S(b.raw), 1), e("small", null, S(a[C]?.message || "生成图片"), 1)], 8, Ye))], 8, Qe)) : (c(), p("button", {
          key: 1,
          class: "fourth-wall-voice",
          type: "button",
          onClick: (D) => u(b, C)
        }, [
          e("span", et, S(a[C]?.status === "playing" ? "■" : "▶"), 1),
          e("span", null, S(b.value), 1),
          a[C]?.message ? (c(), p("small", tt, S(a[C].message), 1)) : W("", !0)
        ], 8, _e))]),
        _: 1
      }, 8, ["content"])), e("div", at, [d.value ? (c(), p(j, { key: 0 }, [e("button", {
        type: "button",
        disabled: !s.editable,
        onClick: w
      }, "保存", 8, st), e("button", {
        type: "button",
        onClick: g[1] || (g[1] = (b) => i("editCancel"))
      }, "取消")], 64)) : (c(), p(j, { key: 1 }, [e("button", {
        type: "button",
        disabled: !s.editable,
        onClick: I
      }, "编辑", 8, lt), e("button", {
        type: "button",
        disabled: !s.editable,
        onClick: g[2] || (g[2] = (b) => i("delete", s.messageIndex))
      }, "删除", 8, nt)], 64))])]),
      x.value ? (c(), p("time", rt, S(x.value), 1)) : W("", !0)
    ])], 10, ze));
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
}, ht = ["disabled"], kt = /* @__PURE__ */ z({
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
    const l = s, i = T, d = M(null), m = M(l.page), o = P(() => me(l.generation.text || "")), v = M(!1), a = M(!0), n = M(null);
    let r = 0;
    const h = {
      counting: "正在计算上下文…",
      summarizing: "正在整理皮下记忆…",
      saving: "正在保存…",
      replying: "等待回应…"
    };
    function x() {
      const u = d.value;
      if (!u) return null;
      const I = u.getBoundingClientRect().top, w = Array.from(u.querySelectorAll("[data-message-index]")).find(($) => $.getBoundingClientRect().bottom > I);
      return w ? {
        index: w.dataset.messageIndex,
        offset: w.getBoundingClientRect().top - I
      } : null;
    }
    async function q(u, I = !1) {
      const w = x();
      if (n.value && u.sessionId === m.value.sessionId) {
        const A = u.messages[n.value.index - u.start];
        A?.ts === n.value.ts && A.content === n.value.content.trim() ? n.value = null : A?.ts === n.value.ts && A.content === n.value.original ? n.value.revision = u.revision : A && (i("error", `正在编辑的消息已变化，未保存的草稿：${n.value.content}`), n.value = null);
      }
      m.value = u, await se();
      const $ = d.value;
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
      const u = d.value;
      u && (a.value = m.value.start + m.value.messages.length === m.value.total && u.scrollHeight - u.clientHeight - u.scrollTop < 48);
    }
    async function F(u) {
      if (v.value) return;
      const I = ++r;
      v.value = !0;
      const w = l.sessionId;
      try {
        const $ = await l.bridge.request("fourth-wall/history-page", {
          chatIdentity: l.chatIdentity,
          sessionId: w,
          direction: u,
          revision: m.value.revision
        });
        if (I !== r || w !== l.sessionId) return;
        u !== "latest" && (a.value = !1);
        const A = $.result;
        if (u === "earlier") A.messages = [...A.messages, ...m.value.messages].slice(0, 60);
        else if (u === "later") {
          const f = [...m.value.messages, ...A.messages];
          A.start = m.value.start + Math.max(0, f.length - 60), A.messages = f.slice(-60);
        }
        await q(A, u === "latest");
      } catch ($) {
        I === r && i("error", $ instanceof Error ? $.message : String($));
      } finally {
        I === r && (v.value = !1);
      }
    }
    function B(u, I) {
      const w = m.value.messages[u - m.value.start];
      w && (n.value?.index === u ? n.value.content = I : n.value = {
        index: u,
        content: I,
        original: w.content,
        ts: w.ts,
        revision: m.value.revision
      });
    }
    return H(() => l.page, (u) => {
      r++, v.value = !1, q(u, u.sessionId !== m.value.sessionId || a.value);
    }, { immediate: !0 }), H(() => l.sessionId, () => {
      n.value = null, a.value = !0;
    }), H(() => l.generation.text, async () => {
      a.value && (await se(), d.value && (d.value.scrollTop = d.value.scrollHeight));
    }), (u, I) => (c(), p("section", {
      ref_key: "viewport",
      ref: d,
      class: "fourth-wall-conversation",
      "aria-live": "polite",
      onScrollPassive: E
    }, [
      m.value.start > 0 ? (c(), p("button", {
        key: 0,
        type: "button",
        class: "fourth-wall-earlier",
        disabled: v.value,
        onClick: I[0] || (I[0] = (w) => F("earlier"))
      }, S(v.value ? "读取中…" : "查看更早的记录"), 9, ut)) : W("", !0),
      m.value.total === 0 && s.generation.status === "idle" ? (c(), p("div", dt, [...I[6] || (I[6] = [
        e("span", null, "IV", -1),
        e("strong", null, "越过故事边界", -1),
        e("p", null, "这里是你与角色扮演者的皮下私聊。", -1)
      ])])) : W("", !0),
      (c(!0), p(j, null, le(m.value.messages, (w, $) => (c(), L(it, {
        key: w.ts + "-" + (m.value.start + $),
        message: w,
        "message-index": m.value.start + $,
        "chat-identity": s.chatIdentity,
        "session-id": s.sessionId,
        "user-avatar": s.userAvatar,
        "character-avatar": s.characterAvatar,
        "image-available": s.imageAvailable,
        "voice-available": s.voiceAvailable,
        bridge: s.bridge,
        editable: !s.busy,
        "edit-draft": n.value?.index === m.value.start + $ && n.value.ts === w.ts ? n.value.content : void 0,
        onDraft: (A) => B(m.value.start + $, A),
        onEditCancel: I[1] || (I[1] = (A) => n.value = null),
        onEdit: I[2] || (I[2] = (A, f) => i("edit", A, f, n.value?.revision ?? m.value.revision)),
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
      m.value.start + m.value.messages.length < m.value.total ? (c(), p("button", {
        key: 2,
        type: "button",
        class: "fourth-wall-earlier",
        disabled: v.value,
        onClick: I[4] || (I[4] = (w) => F("later"))
      }, " 查看后面的记录 ", 8, vt)) : W("", !0),
      s.generation.status !== "idle" && a.value ? (c(), p("article", mt, [s.characterAvatar ? (c(), p("img", {
        key: 0,
        class: "fourth-wall-avatar",
        src: s.characterAvatar,
        alt: ""
      }, null, 8, ft)) : (c(), p("span", gt)), e("div", bt, [s.generation.thinking ? (c(), p("details", ct, [I[7] || (I[7] = e("summary", null, "思考中", -1)), e("div", null, S(s.generation.thinking), 1)])) : W("", !0), e("div", yt, [s.generation.text ? (c(), L(oe(ve), {
        key: 0,
        content: o.value
      }, null, 8, ["content"])) : (c(), p(j, { key: 1 }, [U(S(s.generation.status === "error" ? s.generation.message : h[s.generation.phase || "replying"]), 1)], 64)), s.generation.unsaved ? (c(), p("small", pt, "未保存")) : W("", !0)])])])) : W("", !0),
      a.value ? W("", !0) : (c(), p("button", {
        key: 4,
        type: "button",
        class: "fourth-wall-latest",
        disabled: v.value,
        onClick: I[5] || (I[5] = (w) => F("latest"))
      }, "回到最新 ↓", 8, ht))
    ], 544));
  }
}), wt = kt, $t = {
  class: "fourth-wall-modal",
  role: "dialog",
  "aria-label": "四次元壁提示词"
}, Ct = { class: "fourth-wall-prompt-fields" }, It = /* @__PURE__ */ z({
  __name: "FourthWallPromptEditor",
  props: { templates: {} },
  emits: [
    "close",
    "save",
    "restore"
  ],
  setup(s, { emit: T }) {
    const l = s, i = T, d = X(structuredClone(R(l.templates))), m = M(null);
    ue(m, () => i("close"));
    function o() {
      i("save", structuredClone(R(d)));
    }
    return (v, a) => (c(), p("div", {
      ref_key: "layer",
      ref: m,
      class: "fourth-wall-modal-backdrop",
      onClick: a[6] || (a[6] = Ie((n) => i("close"), ["self"]))
    }, [e("section", $t, [
      e("header", null, [a[7] || (a[7] = e("strong", null, "提示词模板", -1)), e("button", {
        type: "button",
        onClick: a[0] || (a[0] = (n) => i("close"))
      }, "关闭")]),
      e("div", Ct, [
        e("label", null, [a[8] || (a[8] = U("Top User", -1)), V(e("textarea", {
          "onUpdate:modelValue": a[1] || (a[1] = (n) => d.topuser = n),
          rows: "5"
        }, null, 512), [[O, d.topuser]])]),
        e("label", null, [a[9] || (a[9] = U("Confirm", -1)), V(e("textarea", {
          "onUpdate:modelValue": a[2] || (a[2] = (n) => d.confirm = n),
          rows: "3"
        }, null, 512), [[O, d.confirm]])]),
        e("label", null, [a[10] || (a[10] = U("Meta Protocol", -1)), V(e("textarea", {
          "onUpdate:modelValue": a[3] || (a[3] = (n) => d.metaProtocol = n),
          rows: "12"
        }, null, 512), [[O, d.metaProtocol]])]),
        e("label", null, [a[11] || (a[11] = U("Bottom", -1)), V(e("textarea", {
          "onUpdate:modelValue": a[4] || (a[4] = (n) => d.bottom = n),
          rows: "5"
        }, null, 512), [[O, d.bottom]])])
      ]),
      e("footer", null, [e("button", {
        type: "button",
        class: "is-danger",
        onClick: a[5] || (a[5] = (n) => i("restore"))
      }, "恢复默认"), e("button", {
        type: "button",
        class: "is-primary",
        onClick: o
      }, "保存")])
    ])], 512));
  }
}), xt = It, St = { class: "fourth-wall-settings-section" }, At = { class: "fourth-wall-session-row" }, Tt = ["value", "disabled"], Mt = ["value"], qt = ["disabled"], Et = ["disabled"], Ft = ["disabled"], Wt = /* @__PURE__ */ z({
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
    const l = T;
    function i() {
      const o = window.prompt("新记录名称", "新记录")?.trim();
      o && l("add", o);
    }
    function d(o, v) {
      const a = window.prompt("重命名记录", v)?.trim();
      a && l("rename", o, a);
    }
    function m(o) {
      window.confirm("确定删除当前记录及其皮下记忆吗？") && l("delete", o);
    }
    return (o, v) => (c(), p("section", St, [v[3] || (v[3] = e("h3", null, "聊天记录", -1)), e("div", At, [
      e("select", {
        value: s.activeSessionId,
        disabled: s.disabled,
        onChange: v[0] || (v[0] = (a) => l("switch", a.target.value))
      }, [(c(!0), p(j, null, le(s.sessions, (a) => (c(), p("option", {
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
        onClick: v[1] || (v[1] = (a) => d(s.activeSessionId, s.sessions.find((n) => n.id === s.activeSessionId)?.name || ""))
      }, " 改 ", 8, Et),
      e("button", {
        type: "button",
        disabled: s.disabled || s.sessions.length <= 1,
        title: "删除记录",
        class: "is-danger",
        onClick: v[2] || (v[2] = (a) => m(s.activeSessionId))
      }, " 删 ", 8, Ft)
    ])]));
  }
}), Bt = Wt, Dt = { class: "fourth-wall-settings-scroll" }, Vt = { class: "fourth-wall-settings-section" }, Ut = { class: "is-toggle" }, Nt = ["disabled"], Rt = { class: "fourth-wall-settings-section" }, Ot = { class: "is-toggle" }, Pt = { class: "is-toggle" }, zt = { class: "is-toggle" }, Lt = { key: 0 }, Ht = ["disabled"], Gt = { class: "fourth-wall-settings-section is-actions" }, jt = /* @__PURE__ */ z({
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
    const l = s, i = T, d = X(structuredClone(R(l.chat.settings))), m = M(null);
    ue(m, () => i("close"));
    const o = X(structuredClone(R(l.global)));
    function v() {
      i("updateChat", structuredClone(R(d)));
    }
    function a() {
      i("updateGlobal", {
        image: structuredClone(R(o.image)),
        voice: structuredClone(R(o.voice)),
        commentary: structuredClone(R(o.commentary))
      });
    }
    return (n, r) => (c(), p("aside", {
      ref_key: "layer",
      ref: m,
      class: "fourth-wall-settings",
      "aria-label": "四次元壁设置"
    }, [e("header", null, [r[12] || (r[12] = e("strong", null, "四次元壁设置", -1)), e("button", {
      type: "button",
      onClick: r[0] || (r[0] = (h) => i("close"))
    }, "关闭")]), e("div", Dt, [
      Y(Bt, {
        sessions: s.chat.sessions,
        "active-session-id": s.chat.activeSessionId,
        disabled: s.busy,
        onSwitch: r[1] || (r[1] = (h) => i("switchSession", h)),
        onAdd: r[2] || (r[2] = (h) => i("addSession", h)),
        onRename: r[3] || (r[3] = (h, x) => i("renameSession", h, x)),
        onDelete: r[4] || (r[4] = (h) => i("deleteSession", h))
      }, null, 8, [
        "sessions",
        "active-session-id",
        "disabled"
      ]),
      e("section", Vt, [
        r[15] || (r[15] = e("h3", null, "上下文", -1)),
        e("label", null, [r[13] || (r[13] = U("带入的主聊天楼层数", -1)), V(e("input", {
          "onUpdate:modelValue": r[5] || (r[5] = (h) => d.maxChatLayers = h),
          type: "number",
          min: "1",
          max: "9999"
        }, null, 512), [[
          O,
          d.maxChatLayers,
          void 0,
          { number: !0 }
        ]])]),
        e("label", Ut, [r[14] || (r[14] = e("span", null, "流式生成", -1)), V(e("input", {
          "onUpdate:modelValue": r[6] || (r[6] = (h) => d.stream = h),
          type: "checkbox"
        }, null, 512), [[G, d.stream]])]),
        e("button", {
          type: "button",
          class: "is-primary",
          disabled: s.busy,
          onClick: v
        }, "保存上下文设置", 8, Nt)
      ]),
      e("section", Rt, [
        r[19] || (r[19] = e("h3", null, "回复方式", -1)),
        e("label", Ot, [r[16] || (r[16] = e("span", null, "允许对方发图片", -1)), V(e("input", {
          "onUpdate:modelValue": r[7] || (r[7] = (h) => o.image.enablePrompt = h),
          type: "checkbox"
        }, null, 512), [[G, o.image.enablePrompt]])]),
        e("label", Pt, [r[17] || (r[17] = e("span", null, "允许对方发语音", -1)), V(e("input", {
          "onUpdate:modelValue": r[8] || (r[8] = (h) => o.voice.enabled = h),
          type: "checkbox"
        }, null, 512), [[G, o.voice.enabled]])]),
        e("label", zt, [r[18] || (r[18] = e("span", null, "实时吐槽", -1)), V(e("input", {
          "onUpdate:modelValue": r[9] || (r[9] = (h) => o.commentary.enabled = h),
          type: "checkbox"
        }, null, 512), [[G, o.commentary.enabled]])]),
        o.commentary.enabled ? (c(), p("label", Lt, [U(" 吐槽概率 " + S(o.commentary.probability) + "% ", 1), V(e("input", {
          "onUpdate:modelValue": r[10] || (r[10] = (h) => o.commentary.probability = h),
          type: "range",
          min: "1",
          max: "99"
        }, null, 512), [[
          O,
          o.commentary.probability,
          void 0,
          { number: !0 }
        ]])])) : W("", !0),
        e("button", {
          type: "button",
          class: "is-primary",
          disabled: s.busy,
          onClick: a
        }, "保存设置", 8, Ht)
      ]),
      e("section", Gt, [e("button", {
        type: "button",
        onClick: r[11] || (r[11] = (h) => i("openPrompts"))
      }, "提示词模板")])
    ])], 512));
  }
}), Kt = jt, Qt = { class: "fourth-wall-app" }, Xt = { class: "fourth-wall-header" }, Zt = { class: "fourth-wall-heading" }, Jt = { class: "fourth-wall-header-actions" }, Yt = ["disabled"], _t = ["disabled"], ea = {
  key: 0,
  class: "fourth-wall-error",
  role: "alert"
}, ta = ["disabled"], aa = { class: "fourth-wall-composer" }, sa = ["disabled"], la = ["disabled"], na = ["disabled"], ra = { class: "fourth-wall-clear-choice" }, oa = {
  key: 0,
  class: "fourth-wall-dialog-error",
  role: "alert"
}, ia = ["disabled"], ua = ["disabled"], Q = 35e3, da = /* @__PURE__ */ z({
  __name: "FourthWallApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(s) {
    const T = s, l = M(structuredClone(R(T.initialState))), i = M(""), d = M(!1), m = M(!1), o = M(!1), v = M(""), a = M(!1), n = M(!1), r = M(!1), h = M(!1), x = M(""), q = M(0), E = M(!1), F = M(0);
    let B;
    const u = M({
      status: "idle",
      sessionId: "",
      text: "",
      thinking: "",
      message: "",
      unsaved: !1
    });
    let I = () => {
    };
    const w = P(() => l.value.chat.sessions.find((y) => y.id === l.value.chat.activeSessionId)), $ = P(() => u.value.status === "started" || u.value.status === "progress"), A = P(() => ({
      ...l.value.context,
      usedTokens: l.value.context.usedTokens + F.value,
      promptTokens: l.value.context.promptTokens + F.value
    }));
    H(() => [i.value, u.value.text], () => {
      B || (B = setTimeout(() => {
        F.value = J(i.value) + J(u.value.text), B = void 0;
      }, 200));
    }), H(() => w.value.id, () => {
      h.value = !1, n.value = !1, E.value = !1, i.value = "", u.value = {
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
        chatIdentity: l.value.chatIdentity,
        sessionId: y
      };
    }
    function g(y) {
      return structuredClone(y.result);
    }
    async function b(y, t) {
      o.value = !0, v.value = "";
      try {
        return l.value = g(await T.bridge.request(y, t, Q)), !0;
      } catch (k) {
        return v.value = k instanceof Error ? k.message : String(k), !1;
      } finally {
        o.value = !1;
      }
    }
    async function C() {
      const y = i.value.trim();
      if (!(!y || $.value || o.value)) {
        i.value = "", v.value = "", E.value = !1, u.value = {
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
          }, Q);
        } catch (t) {
          v.value = `还不确定是否发送成功：${t instanceof Error ? t.message : String(t)}。请核对聊天记录后再发送。原输入：${y}`, u.value.status = "idle";
        }
      }
    }
    async function D() {
      if (!($.value || o.value)) {
        v.value = "", E.value = !1, u.value = {
          status: "started",
          sessionId: w.value.id,
          text: "",
          thinking: "",
          message: "",
          unsaved: !1
        };
        try {
          await T.bridge.request("fourth-wall/regenerate", f(), Q);
        } catch (y) {
          v.value = y instanceof Error ? y.message : String(y), u.value.status = "idle";
        }
      }
    }
    function N() {
      T.bridge.post("fourth-wall/cancel", f());
    }
    function K(y) {
      y && (i.value ? v.value += `
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
        revision: l.value.history.revision,
        messageIndex: y
      });
    }
    function be() {
      r.value = !1, n.value = !0;
    }
    async function ce() {
      await b("fourth-wall/clear-history", {
        ...f(),
        clearMemory: r.value
      }) && (n.value = !1);
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
        v.value = "", E.value = !1, u.value = {
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
          await T.bridge.request(`fourth-wall/${y}`, f(), Q);
        } catch (t) {
          u.value.status = "idle", v.value = String(t instanceof Error ? t.message : t);
        }
      }
    }
    async function pe() {
      if (o.value || $.value) return;
      o.value = !0, v.value = "";
      const y = f(), t = l.value.history.revision;
      try {
        const k = await T.bridge.request("fourth-wall/read-memory", {
          ...y,
          revision: t
        });
        if (y.sessionId !== w.value.id || y.chatIdentity !== l.value.chatIdentity) return;
        x.value = k.result.content, q.value = t, h.value = !0;
      } catch (k) {
        v.value = k instanceof Error ? k.message : String(k);
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
      }) && (h.value = !1);
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
        if (y.type === "fourth-wall/state" && (l.value = structuredClone(y.payload.state)), y.type !== "fourth-wall/generation") return;
        const t = y.payload;
        if (!(t.sessionId && t.sessionId !== w.value.id)) {
          if (t.status === "complete" || t.status === "cancelled") {
            t.status === "cancelled" && (t.message && (v.value = t.message), K(t.inputDraft)), F.value = J(i.value), u.value = {
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
            v.value = t.message || "生成失败", E.value = !t.manual && t.kind !== "save" && t.kind !== "input-save", K(t.inputDraft), u.value = t.kind === "save" && (t.draft?.text || t.draft?.thinking) ? {
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
          u.value = {
            status: t.status || "progress",
            sessionId: t.sessionId || w.value.id,
            text: t.text || u.value.text,
            thinking: t.thinking || u.value.thinking,
            message: "",
            unsaved: !1,
            phase: t.phase || u.value.phase,
            manual: t.manual ?? u.value.manual
          };
        }
      });
    }), re(() => {
      I(), clearTimeout(B);
    }), (y, t) => (c(), p("main", Qt, [
      e("header", Xt, [e("div", Zt, [t[23] || (t[23] = e("span", null, "IV", -1)), e("div", null, [t[22] || (t[22] = e("strong", null, "四次元壁", -1)), e("small", null, S(w.value.name), 1)])]), e("div", Jt, [
        Y(Fe, {
          stats: A.value,
          busy: $.value,
          phase: u.value.phase,
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
        }, [e("path", { d: "M12 5c-3-2-7-2-9-1v15c3-1 6-1 9 1m0-15c3-2 7-2 9-1v15c-3-1-6-1-9 1V5Z" })], -1)])], 8, Yt),
        e("button", {
          type: "button",
          title: "清空当前记录",
          "aria-label": "清空当前记录",
          disabled: o.value,
          onClick: be
        }, [...t[25] || (t[25] = [e("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [e("path", { d: "M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" })], -1)])], 8, _t),
        e("button", {
          type: "button",
          title: "设置",
          onClick: t[1] || (t[1] = (k) => d.value = !0)
        }, "⚙")
      ])]),
      v.value ? (c(), p("div", ea, [
        e("span", null, S(v.value), 1),
        E.value ? (c(), p("button", {
          key: 0,
          type: "button",
          disabled: $.value || o.value,
          onClick: t[2] || (t[2] = (k) => te("retry"))
        }, "重试回复", 8, ta)) : W("", !0),
        e("button", {
          type: "button",
          "aria-label": "关闭错误提示",
          onClick: t[3] || (t[3] = (k) => v.value = "")
        }, "×")
      ])) : W("", !0),
      Y(wt, {
        page: l.value.history,
        busy: o.value || $.value,
        "session-id": w.value.id,
        "chat-identity": l.value.chatIdentity,
        "user-avatar": l.value.userAvatar,
        "character-avatar": l.value.characterAvatar,
        "image-available": l.value.capabilities.image.available,
        "voice-available": l.value.capabilities.voice.available,
        generation: u.value,
        bridge: s.bridge,
        onEdit: ye,
        onDelete: ge,
        onError: t[4] || (t[4] = (k) => v.value = k)
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
      e("footer", aa, [
        e("button", {
          type: "button",
          class: "fourth-wall-regenerate",
          title: "重答",
          "aria-label": "重答",
          disabled: o.value || $.value,
          onClick: D
        }, " ↻ ", 8, sa),
        V(e("textarea", {
          "onUpdate:modelValue": t[5] || (t[5] = (k) => i.value = k),
          rows: "1",
          placeholder: "聊点什么...",
          disabled: o.value,
          onCompositionstart: t[6] || (t[6] = (k) => a.value = !0),
          onCompositionend: t[7] || (t[7] = (k) => a.value = !1),
          onKeydown: fe
        }, null, 40, la), [[O, i.value]]),
        e("button", {
          type: "button",
          class: _({ "is-stop": $.value }),
          disabled: o.value,
          onClick: t[8] || (t[8] = (k) => $.value ? N() : C())
        }, S($.value ? "■" : "↑"), 11, na)
      ]),
      d.value ? (c(), L(Kt, {
        key: 1,
        chat: l.value.chat,
        global: l.value.global,
        busy: o.value || $.value,
        onClose: t[9] || (t[9] = (k) => d.value = !1),
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
        onOpenPrompts: t[14] || (t[14] = (k) => m.value = !0)
      }, null, 8, [
        "chat",
        "global",
        "busy"
      ])) : W("", !0),
      m.value ? (c(), L(xt, {
        key: 2,
        templates: l.value.global.promptTemplates,
        onClose: t[15] || (t[15] = (k) => m.value = !1),
        onSave: t[16] || (t[16] = (k) => {
          ae({ promptTemplates: k }), m.value = !1;
        }),
        onRestore: t[17] || (t[17] = () => {
          b("fourth-wall/restore-prompts", f()), m.value = !1;
        })
      }, null, 8, ["templates"])) : W("", !0),
      h.value ? (c(), L(Re, {
        key: 3,
        content: x.value,
        busy: o.value,
        error: v.value,
        onClose: t[18] || (t[18] = (k) => h.value = !1),
        onSave: he
      }, null, 8, [
        "content",
        "busy",
        "error"
      ])) : W("", !0),
      n.value ? (c(), L(de, {
        key: 4,
        class: "fourth-wall-dialog",
        "aria-label": "清空皮下聊天",
        busy: o.value,
        onClose: t[21] || (t[21] = (k) => n.value = !1)
      }, {
        default: ee(() => [
          t[27] || (t[27] = e("header", null, [e("strong", null, "清空皮下聊天？")], -1)),
          t[28] || (t[28] = e("p", null, "当前聊天原文将被删除，默认保留皮下记忆。", -1)),
          e("label", ra, [V(e("input", {
            "onUpdate:modelValue": t[19] || (t[19] = (k) => r.value = k),
            type: "checkbox"
          }, null, 512), [[G, r.value]]), t[26] || (t[26] = U("同时清空皮下记忆", -1))]),
          v.value ? (c(), p("p", oa, S(v.value), 1)) : W("", !0),
          e("footer", null, [e("button", {
            type: "button",
            disabled: o.value,
            onClick: t[20] || (t[20] = (k) => n.value = !1)
          }, "取消", 8, ia), e("button", {
            type: "button",
            class: "is-danger",
            disabled: o.value,
            onClick: ce
          }, "清空聊天", 8, ua)])
        ]),
        _: 1
      }, 8, ["busy"])) : W("", !0)
    ]));
  }
}), ca = da;
export {
  ca as default
};
