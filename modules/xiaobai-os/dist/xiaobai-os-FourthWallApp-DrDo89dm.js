/* eslint-disable */
import { D as le, H as A, I as H, J as x, K as _, R as ne, T as ie, V as Q, W as P, b as N, f as O, g as c, h as q, i as K, j as ee, k as f, l as pe, m as G, o as R, p as e, q as he, u as j, v as W, w as se, y as X, z as B } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { n as oe, r as re } from "./xiaobai-os-app-navigation-D5qZ5Ulq.js";
import { t as ue } from "./xiaobai-os-AppDialog-ycKLGrLE.js";
var we = 3.35, ke = new TextEncoder();
function Z(s = "") {
  return Math.ceil(ke.encode(String(s || "")).length / we);
}
var $e = { class: "fourth-wall-context" }, Ce = ["aria-label", "aria-expanded"], Ie = {
  key: 0,
  class: "fourth-wall-context-popover",
  "aria-label": "上下文用量"
}, Se = { class: "fourth-wall-context-total" }, xe = ["disabled"], Te = { key: 2 }, Ae = /* @__PURE__ */ N({
  __name: "FourthWallContextButton",
  props: {
    stats: {},
    busy: { type: Boolean },
    phase: {}
  },
  emits: ["summarize", "cancel"],
  setup(s, { emit: E }) {
    const l = s, y = E, m = A(!1);
    oe(() => (m.value = !1, !0), () => m.value);
    const g = O(() => Math.min(1, l.stats.usedTokens / l.stats.limit)), n = (t) => `${(t / 1e3).toFixed(1)}k`, v = {
      counting: "计算中",
      summarizing: "总结中",
      saving: "保存中",
      replying: "回复中"
    };
    return (t, o) => (f(), c("div", $e, [e("button", {
      type: "button",
      class: _(["fourth-wall-context-ring", { "is-warning": s.stats.usedTokens >= s.stats.trigger }]),
      style: he({ "--context-fill": `${g.value * 360}deg` }),
      "aria-label": `上下文：约 ${n(s.stats.usedTokens)} / 158k`,
      "aria-expanded": m.value,
      title: "上下文",
      onClick: o[0] || (o[0] = (r) => m.value = !m.value)
    }, [e("span", null, x(s.busy ? "…" : Math.round(g.value * 100)), 1)], 14, Ce), m.value ? (f(), c("section", Ie, [
      e("header", null, [o[4] || (o[4] = e("strong", null, "上下文", -1)), e("button", {
        type: "button",
        "aria-label": "关闭上下文用量",
        onClick: o[1] || (o[1] = (r) => m.value = !1)
      }, "×")]),
      e("p", Se, "约 " + x(n(s.stats.usedTokens)) + " / 158k", 1),
      e("dl", null, [
        o[5] || (o[5] = e("dt", null, "主剧情", -1)),
        e("dd", null, x(n(s.stats.mainTokens)), 1),
        o[6] || (o[6] = e("dt", null, "皮下记忆", -1)),
        e("dd", null, x(n(s.stats.memoryTokens)), 1),
        o[7] || (o[7] = e("dt", null, "皮下聊天", -1)),
        e("dd", null, x(n(s.stats.historyTokens)), 1),
        o[8] || (o[8] = e("dt", null, "提示词与输入", -1)),
        e("dd", null, x(n(s.stats.promptTokens)), 1)
      ]),
      o[9] || (o[9] = e("p", null, "128k 时在下次回复前自动总结。", -1)),
      s.busy ? (f(), c("button", {
        key: 0,
        type: "button",
        onClick: o[2] || (o[2] = (r) => y("cancel"))
      }, x(s.phase ? v[s.phase] : "处理中") + " · 取消", 1)) : (f(), c("button", {
        key: 1,
        type: "button",
        disabled: !s.stats.canSummarize,
        onClick: o[3] || (o[3] = (r) => {
          y("summarize"), m.value = !1;
        })
      }, "立即总结", 8, xe)),
      !s.stats.canSummarize && !s.busy ? (f(), c("small", Te, "暂无可总结的较早聊天，近期原文会保留。")) : q("", !0)
    ])) : q("", !0)]));
  }
}), Ee = Ae, qe = ["disabled"], Me = ["disabled"], Be = {
  key: 0,
  class: "fourth-wall-dialog-error",
  role: "alert"
}, Fe = ["disabled"], Ve = ["disabled"], We = /* @__PURE__ */ N({
  __name: "FourthWallMemory",
  props: {
    content: {},
    busy: { type: Boolean },
    error: {}
  },
  emits: ["close", "save"],
  setup(s, { emit: E }) {
    const l = s, y = E, m = A(l.content);
    function g() {
      (m.value === l.content || window.confirm("放弃尚未保存的记忆修改？")) && y("close");
    }
    function n() {
      window.confirm("清空皮下记忆？聊天原文仍保留，已归档的内容不会自动重新送入上下文。") && (m.value = "", y("save", ""));
    }
    return (v, t) => (f(), G(ue, {
      class: "fourth-wall-memory fourth-wall-dialog",
      "aria-label": "皮下记忆",
      busy: s.busy,
      onClose: g
    }, {
      default: ne(() => [
        e("header", null, [t[2] || (t[2] = e("strong", null, "皮下记忆", -1)), e("button", {
          type: "button",
          disabled: s.busy,
          onClick: g
        }, "关闭", 8, qe)]),
        B(e("textarea", {
          "onUpdate:modelValue": t[0] || (t[0] = (o) => m.value = o),
          "aria-label": "皮下记忆正文",
          disabled: s.busy,
          placeholder: "总结后的皮下人设与长期记忆，也可以直接填写。"
        }, null, 8, Me), [[R, m.value]]),
        s.error ? (f(), c("p", Be, x(s.error), 1)) : q("", !0),
        e("footer", null, [e("button", {
          type: "button",
          class: "is-danger",
          disabled: s.busy || !s.content,
          onClick: n
        }, "清空记忆", 8, Fe), e("button", {
          type: "button",
          class: "is-primary",
          disabled: s.busy,
          onClick: t[1] || (t[1] = (o) => y("save", m.value))
        }, "保存", 8, Ve)])
      ]),
      _: 1
    }, 8, ["busy"]));
  }
}), De = We, Ue = ["data-message-index"], Pe = ["src"], Re = {
  key: 1,
  class: "fourth-wall-avatar is-placeholder",
  "aria-hidden": "true"
}, ze = { class: "fourth-wall-message-stack" }, Oe = {
  key: 0,
  class: "fourth-wall-thinking"
}, Ne = { class: "fourth-wall-bubble" }, Le = {
  key: 0,
  class: "fourth-wall-message-text"
}, He = ["data-image-index"], Ke = ["src", "alt"], Ge = ["onClick"], je = { key: 2 }, Je = ["disabled", "onClick"], Qe = ["onClick"], Ye = { "aria-hidden": "true" }, Ze = { key: 0 }, Xe = { class: "fourth-wall-message-actions" }, _e = ["disabled"], et = ["disabled"], tt = ["disabled"], at = { key: 1 }, st = /* @__PURE__ */ N({
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
  setup(s, { emit: E }) {
    const l = s, y = E, m = O(() => l.editDraft !== void 0);
    oe(() => (y("editCancel"), !0), () => m.value);
    const g = O({
      get: () => l.editDraft || "",
      set: (h) => y("draft", h)
    }), n = A(null);
    let v = null;
    const t = Q({}), o = /* @__PURE__ */ new Set();
    let r = () => {
    };
    function I(h) {
      const i = /\[(?:img|图片)\s*:\s*([^\]]+)\]|\[(?:voice|语音)\s*:([^:\]]*):([^\]]+)\]|\[(?:voice|语音)\s*:\s*([^\]]+)\]/gi, u = [];
      let p = 0, S;
      for (; (S = i.exec(h)) !== null; )
        S.index > p && u.push({
          kind: "text",
          raw: h.slice(p, S.index),
          value: h.slice(p, S.index)
        }), S[1] !== void 0 ? u.push({
          kind: "image",
          raw: S[0],
          value: S[1].trim()
        }) : u.push({
          kind: "voice",
          raw: S[0],
          value: String(S[3] ?? S[4] ?? "").trim(),
          emotion: String(S[2] || "").trim().toLowerCase()
        }), p = i.lastIndex;
      return p < h.length && u.push({
        kind: "text",
        raw: h.slice(p),
        value: h.slice(p)
      }), u.length ? u : [{
        kind: "text",
        raw: h,
        value: h
      }];
    }
    const V = O(() => I(l.message.content)), L = O(() => l.message.ts ? new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(l.message.ts) : "");
    function F(h, i) {
      return `fw-${h}-${Date.now()}-${l.messageIndex}-${i}-${Math.random().toString(36).slice(2, 7)}`;
    }
    function D(h) {
      return h.result;
    }
    function $(h, i) {
      return o.has(i) && t[h]?.requestId === i;
    }
    async function d(h, i) {
      if (t[i]?.status === "loading" || t[i]?.status === "ready") return;
      if (!l.imageAvailable) {
        t[i] = {
          status: "unavailable",
          message: "画图能力未启用"
        };
        return;
      }
      const u = F("image", i);
      o.add(u), t[i] = {
        status: "loading",
        message: "查询图片缓存",
        requestId: u
      };
      const p = {
        chatIdentity: l.chatIdentity,
        sessionId: l.sessionId
      };
      try {
        const S = D(await l.bridge.request("fourth-wall/image-check", {
          ...p,
          tags: h.value,
          mediaRequestId: u
        }, 3e4));
        if (!$(i, u)) return;
        if (!S.available) {
          t[i] = {
            status: "unavailable",
            message: "画图能力未启用",
            requestId: u
          };
          return;
        }
        let z = S.cached || "";
        if (!z) {
          t[i] = {
            status: "loading",
            message: "正在生成图片",
            requestId: u
          };
          const Y = D(await l.bridge.request("fourth-wall/image-generate", {
            ...p,
            tags: h.value,
            mediaRequestId: u
          }, 18e4));
          if (!$(i, u)) return;
          z = Y.base64;
        }
        t[i] = {
          status: "ready",
          source: /^(?:data:|blob:|https?:)/i.test(z) ? z : `data:image/png;base64,${z}`
        };
      } catch (S) {
        $(i, u) && (t[i] = {
          status: "error",
          message: S instanceof Error ? S.message : String(S),
          requestId: u
        });
      } finally {
        o.delete(u);
      }
    }
    async function T(h, i) {
      if (!l.voiceAvailable) {
        t[i] = {
          status: "unavailable",
          message: "TTS 能力未启用"
        };
        return;
      }
      const u = t[i];
      if (u?.status === "loading") return;
      if (u?.status === "playing" && u.requestId) {
        l.bridge.post("fourth-wall/voice-stop", {
          chatIdentity: l.chatIdentity,
          mediaRequestId: u.requestId
        }), t[i] = { status: "idle" };
        return;
      }
      const p = F("voice", i);
      o.add(p), t[i] = {
        status: "loading",
        message: "正在准备语音",
        requestId: p
      };
      try {
        await l.bridge.request("fourth-wall/voice-play", {
          chatIdentity: l.chatIdentity,
          sessionId: l.sessionId,
          mediaRequestId: p,
          text: h.value,
          emotion: h.emotion
        });
      } catch (S) {
        $(i, p) && (t[i] = {
          status: "error",
          message: S instanceof Error ? S.message : String(S),
          requestId: p
        }), o.delete(p);
      }
    }
    function C() {
      y("draft", l.message.content);
    }
    function k() {
      const h = g.value.trim();
      h && y("edit", l.messageIndex, h);
    }
    function U() {
      o.forEach((h) => {
        l.bridge.post("fourth-wall/image-cancel", {
          chatIdentity: l.chatIdentity,
          mediaRequestId: h
        }), l.bridge.post("fourth-wall/voice-stop", {
          chatIdentity: l.chatIdentity,
          mediaRequestId: h
        });
      }), o.clear();
    }
    function M() {
      v?.disconnect(), n.value?.querySelectorAll("[data-image-index]").forEach((h) => v?.observe(h));
    }
    return le(() => {
      r = l.bridge.subscribe((h) => {
        if (h.type === "fourth-wall/image-progress") {
          const i = h.payload, u = Object.keys(t).map(Number).find((p) => t[p]?.requestId === i.mediaRequestId);
          u !== void 0 && (t[u].message = i.status === "queued" ? `图片队列第 ${i.position || 1} 位` : "正在生成图片");
        }
        if (h.type === "fourth-wall/voice-state") {
          const i = h.payload, u = Object.keys(t).map(Number).find((p) => t[p]?.requestId === i.requestId);
          if (u === void 0) return;
          i.state === "playing" && (t[u].status = "playing"), (i.state === "ended" || i.state === "stopped") && (o.delete(String(i.requestId || "")), t[u] = { status: "idle" }), i.state === "error" && (o.delete(String(i.requestId || "")), t[u] = {
            status: "error",
            message: i.message || "语音播放失败"
          });
        }
      }), n.value && typeof IntersectionObserver < "u" && (v = new IntersectionObserver((h) => {
        for (const i of h) {
          if (!i.isIntersecting) continue;
          const u = Number(i.target.dataset.imageIndex), p = V.value[u];
          p?.kind === "image" && d(p, u), v?.unobserve(i.target);
        }
      }, { root: n.value.closest(".fourth-wall-conversation") }), M());
    }), H(() => l.message.content, () => {
      U(), Object.keys(t).forEach((h) => delete t[Number(h)]);
    }), H([V, m], M, { flush: "post" }), ie(() => {
      r(), v?.disconnect(), U();
    }), (h, i) => (f(), c("article", {
      ref_key: "root",
      ref: n,
      class: _(["fourth-wall-message", s.message.role === "user" ? "is-user" : "is-ai"]),
      "data-message-index": s.messageIndex
    }, [(s.message.role === "user" ? s.userAvatar : s.characterAvatar) ? (f(), c("img", {
      key: 0,
      class: "fourth-wall-avatar",
      src: s.message.role === "user" ? s.userAvatar : s.characterAvatar,
      alt: ""
    }, null, 8, Pe)) : (f(), c("span", Re)), e("div", ze, [
      s.message.thinking ? (f(), c("details", Oe, [i[3] || (i[3] = e("summary", null, "思考过程", -1)), e("div", null, x(s.message.thinking), 1)])) : q("", !0),
      e("div", Ne, [m.value ? B((f(), c("textarea", {
        key: 0,
        "onUpdate:modelValue": i[0] || (i[0] = (u) => g.value = u),
        class: "fourth-wall-edit",
        rows: "3"
      }, null, 512)), [[R, g.value]]) : (f(!0), c(j, { key: 1 }, ee(V.value, (u, p) => (f(), c(j, { key: `${u.kind}-${p}` }, [u.kind === "text" ? (f(), c("span", Le, x(u.value), 1)) : u.kind === "image" ? (f(), c("figure", {
        key: 1,
        class: "fourth-wall-image-card",
        "data-image-index": p
      }, [t[p]?.status === "ready" ? (f(), c("img", {
        key: 0,
        src: t[p].source,
        alt: u.value
      }, null, 8, Ke)) : t[p]?.status === "error" ? (f(), c("button", {
        key: 1,
        type: "button",
        onClick: (S) => d(u, p)
      }, [W(x(u.raw), 1), e("small", null, x(t[p].message) + "，点此重试", 1)], 8, Ge)) : t[p]?.status === "unavailable" ? (f(), c("div", je, [W(x(u.raw), 1), e("small", null, x(t[p].message), 1)])) : (f(), c("button", {
        key: 3,
        type: "button",
        disabled: t[p]?.status === "loading",
        onClick: (S) => d(u, p)
      }, [W(x(u.raw), 1), e("small", null, x(t[p]?.message || "生成图片"), 1)], 8, Je))], 8, He)) : (f(), c("button", {
        key: 2,
        class: "fourth-wall-voice",
        type: "button",
        onClick: (S) => T(u, p)
      }, [
        e("span", Ye, x(t[p]?.status === "playing" ? "■" : "▶"), 1),
        e("span", null, x(u.value), 1),
        t[p]?.message ? (f(), c("small", Ze, x(t[p].message), 1)) : q("", !0)
      ], 8, Qe))], 64))), 128)), e("div", Xe, [m.value ? (f(), c(j, { key: 0 }, [e("button", {
        type: "button",
        disabled: !s.editable,
        onClick: k
      }, "保存", 8, _e), e("button", {
        type: "button",
        onClick: i[1] || (i[1] = (u) => y("editCancel"))
      }, "取消")], 64)) : (f(), c(j, { key: 1 }, [e("button", {
        type: "button",
        disabled: !s.editable,
        onClick: C
      }, "编辑", 8, et), e("button", {
        type: "button",
        disabled: !s.editable,
        onClick: i[2] || (i[2] = (u) => y("delete", s.messageIndex))
      }, "删除", 8, tt)], 64))])]),
      L.value ? (f(), c("time", at, x(L.value), 1)) : q("", !0)
    ])], 10, Ue));
  }
}), lt = st, nt = ["disabled"], it = {
  key: 1,
  class: "fourth-wall-empty"
}, ot = ["disabled"], rt = {
  key: 3,
  class: "fourth-wall-message is-ai is-streaming",
  role: "status"
}, ut = ["src"], dt = {
  key: 1,
  class: "fourth-wall-avatar is-placeholder"
}, vt = { class: "fourth-wall-message-stack" }, mt = {
  key: 0,
  class: "fourth-wall-thinking",
  open: ""
}, ft = { class: "fourth-wall-bubble" }, gt = {
  key: 0,
  class: "fourth-wall-unsaved"
}, bt = ["disabled"], yt = /* @__PURE__ */ N({
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
  setup(s, { emit: E }) {
    const l = s, y = E, m = A(null), g = A(l.page), n = A(!1), v = A(!0), t = A(null);
    let o = 0;
    const r = {
      counting: "正在计算上下文…",
      summarizing: "正在整理皮下记忆…",
      saving: "正在保存…",
      replying: "等待回应…"
    };
    function I() {
      const $ = m.value;
      if (!$) return null;
      const d = $.getBoundingClientRect().top, T = Array.from($.querySelectorAll("[data-message-index]")).find((C) => C.getBoundingClientRect().bottom > d);
      return T ? {
        index: T.dataset.messageIndex,
        offset: T.getBoundingClientRect().top - d
      } : null;
    }
    async function V($, d = !1) {
      const T = I();
      if (t.value && $.sessionId === g.value.sessionId) {
        const k = $.messages[t.value.index - $.start];
        k?.ts === t.value.ts && k.content === t.value.content.trim() ? t.value = null : k?.ts === t.value.ts && k.content === t.value.original ? t.value.revision = $.revision : k && (y("error", `正在编辑的消息已变化，未保存的草稿：${t.value.content}`), t.value = null);
      }
      g.value = $, await se();
      const C = m.value;
      if (C) {
        if (d) {
          C.scrollTop = C.scrollHeight, v.value = !0;
          return;
        }
        if (T) {
          const k = C.querySelector('[data-message-index="' + T.index + '"]');
          k && (C.scrollTop += k.getBoundingClientRect().top - C.getBoundingClientRect().top - T.offset);
        }
      }
    }
    function L() {
      const $ = m.value;
      $ && (v.value = g.value.start + g.value.messages.length === g.value.total && $.scrollHeight - $.clientHeight - $.scrollTop < 48);
    }
    async function F($) {
      if (n.value) return;
      const d = ++o;
      n.value = !0;
      const T = l.sessionId;
      try {
        const C = await l.bridge.request("fourth-wall/history-page", {
          chatIdentity: l.chatIdentity,
          sessionId: T,
          direction: $,
          revision: g.value.revision
        });
        if (d !== o || T !== l.sessionId) return;
        $ !== "latest" && (v.value = !1);
        const k = C.result;
        if ($ === "earlier") k.messages = [...k.messages, ...g.value.messages].slice(0, 60);
        else if ($ === "later") {
          const U = [...g.value.messages, ...k.messages];
          k.start = g.value.start + Math.max(0, U.length - 60), k.messages = U.slice(-60);
        }
        await V(k, $ === "latest");
      } catch (C) {
        d === o && y("error", C instanceof Error ? C.message : String(C));
      } finally {
        d === o && (n.value = !1);
      }
    }
    function D($, d) {
      const T = g.value.messages[$ - g.value.start];
      T && (t.value?.index === $ ? t.value.content = d : t.value = {
        index: $,
        content: d,
        original: T.content,
        ts: T.ts,
        revision: g.value.revision
      });
    }
    return H(() => l.page, ($) => {
      o++, n.value = !1, V($, $.sessionId !== g.value.sessionId || v.value);
    }, { immediate: !0 }), H(() => l.sessionId, () => {
      t.value = null, v.value = !0;
    }), H(() => l.generation.text, async () => {
      v.value && (await se(), m.value && (m.value.scrollTop = m.value.scrollHeight));
    }), ($, d) => (f(), c("section", {
      ref_key: "viewport",
      ref: m,
      class: "fourth-wall-conversation",
      "aria-live": "polite",
      onScrollPassive: L
    }, [
      g.value.start > 0 ? (f(), c("button", {
        key: 0,
        type: "button",
        class: "fourth-wall-earlier",
        disabled: n.value,
        onClick: d[0] || (d[0] = (T) => F("earlier"))
      }, x(n.value ? "读取中…" : "查看更早的记录"), 9, nt)) : q("", !0),
      g.value.total === 0 && s.generation.status === "idle" ? (f(), c("div", it, [...d[6] || (d[6] = [
        e("span", null, "IV", -1),
        e("strong", null, "越过故事边界", -1),
        e("p", null, "这里是你与角色扮演者的皮下私聊。", -1)
      ])])) : q("", !0),
      (f(!0), c(j, null, ee(g.value.messages, (T, C) => (f(), G(lt, {
        key: T.ts + "-" + (g.value.start + C),
        message: T,
        "message-index": g.value.start + C,
        "chat-identity": s.chatIdentity,
        "session-id": s.sessionId,
        "user-avatar": s.userAvatar,
        "character-avatar": s.characterAvatar,
        "image-available": s.imageAvailable,
        "voice-available": s.voiceAvailable,
        bridge: s.bridge,
        editable: !s.busy,
        "edit-draft": t.value?.index === g.value.start + C && t.value.ts === T.ts ? t.value.content : void 0,
        onDraft: (k) => D(g.value.start + C, k),
        onEditCancel: d[1] || (d[1] = (k) => t.value = null),
        onEdit: d[2] || (d[2] = (k, U) => y("edit", k, U, t.value?.revision ?? g.value.revision)),
        onDelete: d[3] || (d[3] = (k) => y("delete", k))
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
      g.value.start + g.value.messages.length < g.value.total ? (f(), c("button", {
        key: 2,
        type: "button",
        class: "fourth-wall-earlier",
        disabled: n.value,
        onClick: d[4] || (d[4] = (T) => F("later"))
      }, " 查看后面的记录 ", 8, ot)) : q("", !0),
      s.generation.status !== "idle" && v.value ? (f(), c("article", rt, [s.characterAvatar ? (f(), c("img", {
        key: 0,
        class: "fourth-wall-avatar",
        src: s.characterAvatar,
        alt: ""
      }, null, 8, ut)) : (f(), c("span", dt)), e("div", vt, [s.generation.thinking ? (f(), c("details", mt, [d[7] || (d[7] = e("summary", null, "思考中", -1)), e("div", null, x(s.generation.thinking), 1)])) : q("", !0), e("div", ft, [W(x(s.generation.text || (s.generation.status === "error" ? s.generation.message : r[s.generation.phase || "replying"])) + " ", 1), s.generation.unsaved ? (f(), c("small", gt, "未保存")) : q("", !0)])])])) : q("", !0),
      v.value ? q("", !0) : (f(), c("button", {
        key: 4,
        type: "button",
        class: "fourth-wall-latest",
        disabled: n.value,
        onClick: d[5] || (d[5] = (T) => F("latest"))
      }, "回到最新 ↓", 8, bt))
    ], 544));
  }
}), ct = yt, pt = {
  class: "fourth-wall-modal",
  role: "dialog",
  "aria-label": "四次元壁提示词"
}, ht = { class: "fourth-wall-prompt-fields" }, wt = /* @__PURE__ */ N({
  __name: "FourthWallPromptEditor",
  props: { templates: {} },
  emits: [
    "close",
    "save",
    "restore"
  ],
  setup(s, { emit: E }) {
    const l = s, y = E, m = Q(structuredClone(P(l.templates))), g = A(null);
    re(g, () => y("close"));
    function n() {
      y("save", structuredClone(P(m)));
    }
    return (v, t) => (f(), c("div", {
      ref_key: "layer",
      ref: g,
      class: "fourth-wall-modal-backdrop",
      onClick: t[6] || (t[6] = pe((o) => y("close"), ["self"]))
    }, [e("section", pt, [
      e("header", null, [t[7] || (t[7] = e("strong", null, "提示词模板", -1)), e("button", {
        type: "button",
        onClick: t[0] || (t[0] = (o) => y("close"))
      }, "关闭")]),
      e("div", ht, [
        e("label", null, [t[8] || (t[8] = W("Top User", -1)), B(e("textarea", {
          "onUpdate:modelValue": t[1] || (t[1] = (o) => m.topuser = o),
          rows: "5"
        }, null, 512), [[R, m.topuser]])]),
        e("label", null, [t[9] || (t[9] = W("Confirm", -1)), B(e("textarea", {
          "onUpdate:modelValue": t[2] || (t[2] = (o) => m.confirm = o),
          rows: "3"
        }, null, 512), [[R, m.confirm]])]),
        e("label", null, [t[10] || (t[10] = W("Meta Protocol", -1)), B(e("textarea", {
          "onUpdate:modelValue": t[3] || (t[3] = (o) => m.metaProtocol = o),
          rows: "12"
        }, null, 512), [[R, m.metaProtocol]])]),
        e("label", null, [t[11] || (t[11] = W("Bottom", -1)), B(e("textarea", {
          "onUpdate:modelValue": t[4] || (t[4] = (o) => m.bottom = o),
          rows: "5"
        }, null, 512), [[R, m.bottom]])])
      ]),
      e("footer", null, [e("button", {
        type: "button",
        class: "is-danger",
        onClick: t[5] || (t[5] = (o) => y("restore"))
      }, "恢复默认"), e("button", {
        type: "button",
        class: "is-primary",
        onClick: n
      }, "保存")])
    ])], 512));
  }
}), kt = wt, $t = { class: "fourth-wall-settings-section" }, Ct = { class: "fourth-wall-session-row" }, It = ["value", "disabled"], St = ["value"], xt = ["disabled"], Tt = ["disabled"], At = ["disabled"], Et = /* @__PURE__ */ N({
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
  setup(s, { emit: E }) {
    const l = E;
    function y() {
      const n = window.prompt("新记录名称", "新记录")?.trim();
      n && l("add", n);
    }
    function m(n, v) {
      const t = window.prompt("重命名记录", v)?.trim();
      t && l("rename", n, t);
    }
    function g(n) {
      window.confirm("确定删除当前记录及其皮下记忆吗？") && l("delete", n);
    }
    return (n, v) => (f(), c("section", $t, [v[3] || (v[3] = e("h3", null, "聊天记录", -1)), e("div", Ct, [
      e("select", {
        value: s.activeSessionId,
        disabled: s.disabled,
        onChange: v[0] || (v[0] = (t) => l("switch", t.target.value))
      }, [(f(!0), c(j, null, ee(s.sessions, (t) => (f(), c("option", {
        key: t.id,
        value: t.id
      }, x(t.name), 9, St))), 128))], 40, It),
      e("button", {
        type: "button",
        disabled: s.disabled,
        title: "新建记录",
        onClick: y
      }, "＋", 8, xt),
      e("button", {
        type: "button",
        disabled: s.disabled,
        title: "重命名记录",
        onClick: v[1] || (v[1] = (t) => m(s.activeSessionId, s.sessions.find((o) => o.id === s.activeSessionId)?.name || ""))
      }, " 改 ", 8, Tt),
      e("button", {
        type: "button",
        disabled: s.disabled || s.sessions.length <= 1,
        title: "删除记录",
        class: "is-danger",
        onClick: v[2] || (v[2] = (t) => g(s.activeSessionId))
      }, " 删 ", 8, At)
    ])]));
  }
}), qt = Et, Mt = { class: "fourth-wall-settings-scroll" }, Bt = { class: "fourth-wall-settings-section" }, Ft = { class: "is-toggle" }, Vt = { class: "is-toggle" }, Wt = ["disabled"], Dt = { class: "fourth-wall-settings-section" }, Ut = { class: "is-toggle" }, Pt = { class: "is-toggle" }, Rt = { class: "is-toggle" }, zt = { key: 0 }, Ot = ["disabled"], Nt = { class: "fourth-wall-settings-section is-actions" }, Lt = /* @__PURE__ */ N({
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
  setup(s, { emit: E }) {
    const l = s, y = E, m = Q(structuredClone(P(l.chat.settings))), g = A(null);
    re(g, () => y("close"));
    const n = Q(structuredClone(P(l.global)));
    function v() {
      y("updateChat", structuredClone(P(m)));
    }
    function t() {
      y("updateGlobal", {
        image: structuredClone(P(n.image)),
        voice: structuredClone(P(n.voice)),
        commentary: structuredClone(P(n.commentary))
      });
    }
    return (o, r) => (f(), c("aside", {
      ref_key: "layer",
      ref: g,
      class: "fourth-wall-settings",
      "aria-label": "四次元壁设置"
    }, [e("header", null, [r[13] || (r[13] = e("strong", null, "四次元壁设置", -1)), e("button", {
      type: "button",
      onClick: r[0] || (r[0] = (I) => y("close"))
    }, "关闭")]), e("div", Mt, [
      X(qt, {
        sessions: s.chat.sessions,
        "active-session-id": s.chat.activeSessionId,
        disabled: s.busy,
        onSwitch: r[1] || (r[1] = (I) => y("switchSession", I)),
        onAdd: r[2] || (r[2] = (I) => y("addSession", I)),
        onRename: r[3] || (r[3] = (I, V) => y("renameSession", I, V)),
        onDelete: r[4] || (r[4] = (I) => y("deleteSession", I))
      }, null, 8, [
        "sessions",
        "active-session-id",
        "disabled"
      ]),
      e("section", Bt, [
        r[17] || (r[17] = e("h3", null, "上下文", -1)),
        e("label", null, [r[14] || (r[14] = W("普通聊天层数", -1)), B(e("input", {
          "onUpdate:modelValue": r[5] || (r[5] = (I) => m.maxChatLayers = I),
          type: "number",
          min: "1",
          max: "9999"
        }, null, 512), [[
          R,
          m.maxChatLayers,
          void 0,
          { number: !0 }
        ]])]),
        e("label", Ft, [r[15] || (r[15] = e("span", null, "流式生成", -1)), B(e("input", {
          "onUpdate:modelValue": r[6] || (r[6] = (I) => m.stream = I),
          type: "checkbox"
        }, null, 512), [[K, m.stream]])]),
        e("label", Vt, [r[16] || (r[16] = e("span", null, "禁用 Assistant Prefill", -1)), B(e("input", {
          "onUpdate:modelValue": r[7] || (r[7] = (I) => m.disableAssistantPrefill = I),
          type: "checkbox"
        }, null, 512), [[K, m.disableAssistantPrefill]])]),
        e("button", {
          type: "button",
          class: "is-primary",
          disabled: s.busy,
          onClick: v
        }, "保存上下文设置", 8, Wt)
      ]),
      e("section", Dt, [
        r[21] || (r[21] = e("h3", null, "能力", -1)),
        e("label", Ut, [r[18] || (r[18] = e("span", null, "在提示词中允许图片", -1)), B(e("input", {
          "onUpdate:modelValue": r[8] || (r[8] = (I) => n.image.enablePrompt = I),
          type: "checkbox"
        }, null, 512), [[K, n.image.enablePrompt]])]),
        e("label", Pt, [r[19] || (r[19] = e("span", null, "在提示词中允许语音", -1)), B(e("input", {
          "onUpdate:modelValue": r[9] || (r[9] = (I) => n.voice.enabled = I),
          type: "checkbox"
        }, null, 512), [[K, n.voice.enabled]])]),
        e("label", Rt, [r[20] || (r[20] = e("span", null, "实时吐槽", -1)), B(e("input", {
          "onUpdate:modelValue": r[10] || (r[10] = (I) => n.commentary.enabled = I),
          type: "checkbox"
        }, null, 512), [[K, n.commentary.enabled]])]),
        n.commentary.enabled ? (f(), c("label", zt, [W(" 吐槽概率 " + x(n.commentary.probability) + "% ", 1), B(e("input", {
          "onUpdate:modelValue": r[11] || (r[11] = (I) => n.commentary.probability = I),
          type: "range",
          min: "1",
          max: "99"
        }, null, 512), [[
          R,
          n.commentary.probability,
          void 0,
          { number: !0 }
        ]])])) : q("", !0),
        e("button", {
          type: "button",
          class: "is-primary",
          disabled: s.busy,
          onClick: t
        }, "保存能力设置", 8, Ot)
      ]),
      e("section", Nt, [e("button", {
        type: "button",
        onClick: r[12] || (r[12] = (I) => y("openPrompts"))
      }, "提示词模板")])
    ])], 512));
  }
}), Ht = Lt, Kt = { class: "fourth-wall-app" }, Gt = { class: "fourth-wall-header" }, jt = { class: "fourth-wall-heading" }, Jt = { class: "fourth-wall-header-actions" }, Qt = ["disabled"], Yt = ["disabled"], Zt = {
  key: 0,
  class: "fourth-wall-error",
  role: "alert"
}, Xt = ["disabled"], _t = { class: "fourth-wall-composer" }, ea = ["disabled"], ta = ["disabled"], aa = ["disabled"], sa = { class: "fourth-wall-clear-choice" }, la = {
  key: 0,
  class: "fourth-wall-dialog-error",
  role: "alert"
}, na = ["disabled"], ia = ["disabled"], J = 35e3, oa = /* @__PURE__ */ N({
  __name: "FourthWallApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(s) {
    const E = s, l = A(structuredClone(P(E.initialState))), y = A(""), m = A(!1), g = A(!1), n = A(!1), v = A(""), t = A(!1), o = A(!1), r = A(!1), I = A(!1), V = A(""), L = A(0), F = A(!1), D = A(0);
    let $;
    const d = A({
      status: "idle",
      sessionId: "",
      text: "",
      thinking: "",
      message: "",
      unsaved: !1
    });
    let T = () => {
    };
    const C = O(() => l.value.chat.sessions.find((b) => b.id === l.value.chat.activeSessionId)), k = O(() => d.value.status === "started" || d.value.status === "progress"), U = O(() => ({
      ...l.value.context,
      usedTokens: l.value.context.usedTokens + D.value,
      promptTokens: l.value.context.promptTokens + D.value
    }));
    H(() => [y.value, d.value.text], () => {
      $ || ($ = setTimeout(() => {
        D.value = Z(y.value) + Z(d.value.text), $ = void 0;
      }, 200));
    }), H(() => C.value.id, () => {
      I.value = !1, o.value = !1, F.value = !1, y.value = "", d.value = {
        status: "idle",
        sessionId: "",
        text: "",
        thinking: "",
        message: "",
        unsaved: !1
      };
    });
    function M(b = C.value.id) {
      return {
        chatIdentity: l.value.chatIdentity,
        sessionId: b
      };
    }
    function h(b) {
      return structuredClone(b.result);
    }
    async function i(b, a) {
      n.value = !0, v.value = "";
      try {
        return l.value = h(await E.bridge.request(b, a, J)), !0;
      } catch (w) {
        return v.value = w instanceof Error ? w.message : String(w), !1;
      } finally {
        n.value = !1;
      }
    }
    async function u() {
      const b = y.value.trim();
      if (!(!b || k.value || n.value)) {
        y.value = "", v.value = "", F.value = !1, d.value = {
          status: "started",
          sessionId: C.value.id,
          text: "",
          thinking: "",
          message: "",
          unsaved: !1
        };
        try {
          await E.bridge.request("fourth-wall/send", {
            ...M(),
            content: b
          }, J);
        } catch (a) {
          v.value = `发送请求未确认：${a instanceof Error ? a.message : String(a)}。请核对聊天记录后再发送。原输入：${b}`, d.value.status = "idle";
        }
      }
    }
    async function p() {
      if (!(k.value || n.value)) {
        v.value = "", F.value = !1, d.value = {
          status: "started",
          sessionId: C.value.id,
          text: "",
          thinking: "",
          message: "",
          unsaved: !1
        };
        try {
          await E.bridge.request("fourth-wall/regenerate", M(), J);
        } catch (b) {
          v.value = b instanceof Error ? b.message : String(b), d.value.status = "idle";
        }
      }
    }
    function S() {
      E.bridge.post("fourth-wall/cancel", M());
    }
    function z(b) {
      b && (y.value ? v.value += `
未保存的原输入：${b}` : y.value = b);
    }
    function Y(b) {
      b.key !== "Enter" || b.shiftKey || t.value || (b.preventDefault(), k.value ? S() : u());
    }
    function de(b) {
      const a = b < C.value.archivedCount ? `这条消息已经归档；删除原文不会修改记忆，需要遗忘的内容请在记忆中删除。
` : "";
      window.confirm(`${a}确定删除这条消息吗？`) && i("fourth-wall/delete-message", {
        ...M(),
        revision: l.value.history.revision,
        messageIndex: b
      });
    }
    function ve() {
      r.value = !1, o.value = !0;
    }
    async function me() {
      await i("fourth-wall/clear-history", {
        ...M(),
        clearMemory: r.value
      }) && (o.value = !1);
    }
    async function fe(b, a, w) {
      b < C.value.archivedCount && !window.confirm("这条消息已经归档，修改原文不会改写记忆；需要同步更正时请编辑记忆。继续修改？") || await i("fourth-wall/edit-message", {
        ...M(),
        revision: w,
        messageIndex: b,
        content: a
      });
    }
    async function te(b) {
      if (!(k.value || n.value)) {
        v.value = "", F.value = !1, d.value = {
          status: "started",
          sessionId: C.value.id,
          text: "",
          thinking: "",
          message: "",
          unsaved: !1,
          phase: "counting",
          manual: b === "summarize"
        };
        try {
          await E.bridge.request(`fourth-wall/${b}`, M(), J);
        } catch (a) {
          d.value.status = "idle", v.value = String(a instanceof Error ? a.message : a);
        }
      }
    }
    async function ge() {
      if (n.value || k.value) return;
      n.value = !0, v.value = "";
      const b = M(), a = l.value.history.revision;
      try {
        const w = await E.bridge.request("fourth-wall/read-memory", {
          ...b,
          revision: a
        });
        if (b.sessionId !== C.value.id || b.chatIdentity !== l.value.chatIdentity) return;
        V.value = w.result.content, L.value = a, I.value = !0;
      } catch (w) {
        v.value = w instanceof Error ? w.message : String(w);
      } finally {
        n.value = !1;
      }
    }
    async function be(b) {
      await i("fourth-wall/save-memory", {
        ...M(),
        revision: L.value,
        expectedContent: V.value,
        content: b
      }) && (I.value = !1);
    }
    function ye(b) {
      i("fourth-wall/update-chat-settings", {
        ...M(),
        patch: b
      });
    }
    function ae(b) {
      i("fourth-wall/update-global-settings", {
        ...M(),
        patch: b
      });
    }
    return le(() => {
      T = E.bridge.subscribe((b) => {
        if (b.type === "fourth-wall/state" && (l.value = structuredClone(b.payload.state)), b.type !== "fourth-wall/generation") return;
        const a = b.payload;
        if (!(a.sessionId && a.sessionId !== C.value.id)) {
          if (a.status === "complete" || a.status === "cancelled") {
            a.status === "cancelled" && (a.message && (v.value = a.message), z(a.inputDraft)), D.value = Z(y.value), d.value = {
              status: "idle",
              sessionId: "",
              text: "",
              thinking: "",
              message: "",
              unsaved: !1
            };
            return;
          }
          if (a.status === "error") {
            v.value = a.message || "生成失败", F.value = !a.manual && a.kind !== "save" && a.kind !== "input-save", z(a.inputDraft), d.value = a.kind === "save" && (a.draft?.text || a.draft?.thinking) ? {
              status: "error",
              sessionId: a.sessionId || C.value.id,
              text: a.draft?.text || "",
              thinking: a.draft?.thinking || "",
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
            status: a.status || "progress",
            sessionId: a.sessionId || C.value.id,
            text: a.text || d.value.text,
            thinking: a.thinking || d.value.thinking,
            message: "",
            unsaved: !1,
            phase: a.phase || d.value.phase,
            manual: a.manual ?? d.value.manual
          };
        }
      });
    }), ie(() => {
      T(), clearTimeout($);
    }), (b, a) => (f(), c("main", Kt, [
      e("header", Gt, [e("div", jt, [a[23] || (a[23] = e("span", null, "IV", -1)), e("div", null, [a[22] || (a[22] = e("strong", null, "四次元壁", -1)), e("small", null, x(C.value.name), 1)])]), e("div", Jt, [
        X(Ee, {
          stats: U.value,
          busy: k.value,
          phase: d.value.phase,
          onSummarize: a[0] || (a[0] = (w) => te("summarize")),
          onCancel: S
        }, null, 8, [
          "stats",
          "busy",
          "phase"
        ]),
        e("button", {
          type: "button",
          title: "皮下记忆",
          "aria-label": "皮下记忆",
          disabled: n.value || k.value,
          onClick: ge
        }, [...a[24] || (a[24] = [e("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [e("path", { d: "M12 5c-3-2-7-2-9-1v15c3-1 6-1 9 1m0-15c3-2 7-2 9-1v15c-3-1-6-1-9 1V5Z" })], -1)])], 8, Qt),
        e("button", {
          type: "button",
          title: "清空当前记录",
          "aria-label": "清空当前记录",
          disabled: n.value,
          onClick: ve
        }, [...a[25] || (a[25] = [e("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [e("path", { d: "M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" })], -1)])], 8, Yt),
        e("button", {
          type: "button",
          title: "设置",
          onClick: a[1] || (a[1] = (w) => m.value = !0)
        }, "⚙")
      ])]),
      v.value ? (f(), c("div", Zt, [
        e("span", null, x(v.value), 1),
        F.value ? (f(), c("button", {
          key: 0,
          type: "button",
          disabled: k.value || n.value,
          onClick: a[2] || (a[2] = (w) => te("retry"))
        }, "重试回复", 8, Xt)) : q("", !0),
        e("button", {
          type: "button",
          "aria-label": "关闭错误提示",
          onClick: a[3] || (a[3] = (w) => v.value = "")
        }, "×")
      ])) : q("", !0),
      X(ct, {
        page: l.value.history,
        busy: n.value || k.value,
        "session-id": C.value.id,
        "chat-identity": l.value.chatIdentity,
        "user-avatar": l.value.userAvatar,
        "character-avatar": l.value.characterAvatar,
        "image-available": l.value.capabilities.image.available,
        "voice-available": l.value.capabilities.voice.available,
        generation: d.value,
        bridge: s.bridge,
        onEdit: fe,
        onDelete: de,
        onError: a[4] || (a[4] = (w) => v.value = w)
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
      e("footer", _t, [
        e("button", {
          type: "button",
          class: "fourth-wall-regenerate",
          title: "重答",
          "aria-label": "重答",
          disabled: n.value || k.value,
          onClick: p
        }, " ↻ ", 8, ea),
        B(e("textarea", {
          "onUpdate:modelValue": a[5] || (a[5] = (w) => y.value = w),
          rows: "1",
          placeholder: "聊点什么...",
          disabled: n.value,
          onCompositionstart: a[6] || (a[6] = (w) => t.value = !0),
          onCompositionend: a[7] || (a[7] = (w) => t.value = !1),
          onKeydown: Y
        }, null, 40, ta), [[R, y.value]]),
        e("button", {
          type: "button",
          class: _({ "is-stop": k.value }),
          disabled: n.value,
          onClick: a[8] || (a[8] = (w) => k.value ? S() : u())
        }, x(k.value ? "■" : "↑"), 11, aa)
      ]),
      m.value ? (f(), G(Ht, {
        key: 1,
        chat: l.value.chat,
        global: l.value.global,
        busy: n.value || k.value,
        onClose: a[9] || (a[9] = (w) => m.value = !1),
        onUpdateChat: ye,
        onUpdateGlobal: ae,
        onSwitchSession: a[10] || (a[10] = (w) => i("fourth-wall/switch-session", {
          ...M(),
          targetSessionId: w
        })),
        onAddSession: a[11] || (a[11] = (w) => i("fourth-wall/add-session", {
          ...M(),
          name: w
        })),
        onRenameSession: a[12] || (a[12] = (w, ce) => i("fourth-wall/rename-session", {
          ...M(w),
          name: ce
        })),
        onDeleteSession: a[13] || (a[13] = (w) => i("fourth-wall/delete-session", M(w))),
        onOpenPrompts: a[14] || (a[14] = (w) => g.value = !0)
      }, null, 8, [
        "chat",
        "global",
        "busy"
      ])) : q("", !0),
      g.value ? (f(), G(kt, {
        key: 2,
        templates: l.value.global.promptTemplates,
        onClose: a[15] || (a[15] = (w) => g.value = !1),
        onSave: a[16] || (a[16] = (w) => {
          ae({ promptTemplates: w }), g.value = !1;
        }),
        onRestore: a[17] || (a[17] = () => {
          i("fourth-wall/restore-prompts", M()), g.value = !1;
        })
      }, null, 8, ["templates"])) : q("", !0),
      I.value ? (f(), G(De, {
        key: 3,
        content: V.value,
        busy: n.value,
        error: v.value,
        onClose: a[18] || (a[18] = (w) => I.value = !1),
        onSave: be
      }, null, 8, [
        "content",
        "busy",
        "error"
      ])) : q("", !0),
      o.value ? (f(), G(ue, {
        key: 4,
        class: "fourth-wall-dialog",
        "aria-label": "清空皮下聊天",
        busy: n.value,
        onClose: a[21] || (a[21] = (w) => o.value = !1)
      }, {
        default: ne(() => [
          a[27] || (a[27] = e("header", null, [e("strong", null, "清空皮下聊天？")], -1)),
          a[28] || (a[28] = e("p", null, "当前聊天原文将被删除，默认保留皮下记忆。", -1)),
          e("label", sa, [B(e("input", {
            "onUpdate:modelValue": a[19] || (a[19] = (w) => r.value = w),
            type: "checkbox"
          }, null, 512), [[K, r.value]]), a[26] || (a[26] = W("同时清空皮下记忆", -1))]),
          v.value ? (f(), c("p", la, x(v.value), 1)) : q("", !0),
          e("footer", null, [e("button", {
            type: "button",
            disabled: n.value,
            onClick: a[20] || (a[20] = (w) => o.value = !1)
          }, "取消", 8, na), e("button", {
            type: "button",
            class: "is-danger",
            disabled: n.value,
            onClick: me
          }, "清空聊天", 8, ia)])
        ]),
        _: 1
      }, 8, ["busy"])) : q("", !0)
    ]));
  }
}), va = oa;
export {
  va as default
};
