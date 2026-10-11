/* eslint-disable */
import { $ as Q, A as fe, B as ua, D as K, E, F as oa, J as Pe, M as Ie, P as ra, Q as Ue, R as da, S as n, T as ie, U as me, V as l, X as pe, b as ve, c as we, d as de, dt as Se, et as va, ft as v, h as R, lt as B, m as ce, nt as Fe, p as Ve, r as ze, rt as $, ut as W, v as A, x as w, y as e, z as Me } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as _e } from "./xiaobai-os-AppDialog-B4VpOkFC.js";
import { r as ga, t as ma } from "./xiaobai-os-composer-keyboard-COt-GHsA.js";
var ca = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.8",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
}, ya = ["d"], ba = /* @__PURE__ */ K({
  __name: "MessageIcon",
  props: { name: {} },
  setup(a) {
    const h = {
      message: "M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 3V6a2 2 0 0 1 2-2Z",
      back: "m14 5-7 7 7 7",
      plus: "M12 5v14M5 12h14",
      send: "m5 12 7-7 7 7M12 5v15",
      image: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm-1 12 5-5 4 4 3-3 4 4M15 8h.01",
      voice: "M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0V5Zm-3 6a6 6 0 0 0 12 0M12 17v4M9 21h6",
      search: "M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 6 6",
      more: "M5 12h.01M12 12h.01M19 12h.01",
      close: "m6 6 12 12M6 18 18 6",
      play: "m8 5 11 7-11 7V5Z",
      stop: "M7 7h10v10H7Z",
      settings: "m9 3-.5 3-2.5 1-2.5-1-2 3.5L4 11v2l-2.5 1.5 2 3.5L6 17l2.5 1L9 21h6l.5-3 2.5-1 2.5 1 2-3.5L20 13v-2l2.5-1.5-2-3.5L18 7l-2.5-1L15 3H9Zm6 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    };
    return (s, p) => (l(), n("svg", ca, [e("path", { d: h[a.name] }, null, 8, ya)]));
  }
}), N = ba, fa = /* @__PURE__ */ K({
  __name: "ContactAvatar",
  props: {
    identity: {},
    name: {},
    small: { type: Boolean }
  },
  setup(a) {
    const h = a, s = A(() => {
      let p = 0;
      for (const r of h.identity) p = Math.imul(p, 31) + r.codePointAt(0) | 0;
      return String((p >>> 0) % 360);
    });
    return (p, r) => (l(), n("span", {
      class: W(["messages-avatar", { small: a.small }]),
      style: Se({ "--avatar-hue": s.value }),
      "aria-hidden": "true"
    }, v(Array.from(a.name)[0]), 7));
  }
}), ke = fa, pa = { class: "messages-contacts" }, ka = { class: "messages-home-header" }, $a = { class: "messages-home-actions" }, ha = { class: "messages-search" }, wa = {
  key: 0,
  class: "messages-empty"
}, Ca = {
  key: 1,
  class: "messages-contact-rows"
}, Ia = {
  key: 0,
  class: "messages-subtle"
}, Sa = ["aria-current", "onClick"], Ma = { class: "messages-contact-copy" }, Ea = { class: "messages-contact-heading" }, xa = {
  key: 0,
  class: "messages-preview messages-preview-active"
}, Ba = {
  key: 1,
  class: "messages-preview"
}, Aa = {
  key: 2,
  class: "messages-preview"
}, Ta = /* @__PURE__ */ K({
  __name: "ContactList",
  props: {
    contacts: {},
    activeContactId: {},
    busyContactId: {},
    drafts: {}
  },
  emits: [
    "select",
    "add",
    "settings"
  ],
  setup(a) {
    const h = a, s = $(""), p = A(() => h.contacts.filter((k) => `${k.name} ${k.note}`.toLocaleLowerCase().includes(s.value.toLocaleLowerCase())));
    function r(k) {
      if (k === null) return "";
      const d = new Date(k);
      return d.toDateString() === (/* @__PURE__ */ new Date()).toDateString() ? d.toLocaleTimeString(void 0, {
        hour: "2-digit",
        minute: "2-digit"
      }) : d.toLocaleDateString(void 0, {
        month: "numeric",
        day: "numeric"
      });
    }
    return (k, d) => (l(), n("section", pa, [
      e("header", ka, [d[4] || (d[4] = e("h1", null, "信息", -1)), e("div", $a, [e("button", {
        class: "messages-icon-button",
        title: "设置",
        "aria-label": "设置",
        onClick: d[0] || (d[0] = (o) => k.$emit("settings"))
      }, [E(N, { name: "settings" })]), e("button", {
        class: "messages-icon-button messages-add-contact",
        "aria-label": "添加联系人",
        onClick: d[1] || (d[1] = (o) => k.$emit("add"))
      }, [E(N, { name: "plus" })])])]),
      e("label", ha, [E(N, { name: "search" }), Q(e("input", {
        "onUpdate:modelValue": d[2] || (d[2] = (o) => s.value = o),
        type: "search",
        placeholder: "搜索联系人",
        "aria-label": "搜索联系人"
      }, null, 512), [[de, s.value]])]),
      a.contacts.length ? (l(), n("div", Ca, [p.value.length ? w("", !0) : (l(), n("p", Ia, "没有找到这个人。")), (l(!0), n(R, null, me(p.value, (o) => (l(), n("button", {
        key: o.id,
        class: "messages-contact-row",
        "aria-current": a.activeContactId === o.id ? "true" : void 0,
        onClick: (M) => k.$emit("select", o.id)
      }, [E(ke, {
        identity: o.id,
        name: o.name
      }, null, 8, ["identity", "name"]), e("span", Ma, [e("span", Ea, [e("strong", null, v(o.name), 1), e("time", null, v(r(o.lastAt)), 1)]), a.busyContactId === o.id ? (l(), n("span", xa, "正在等待回复…")) : a.drafts.get(o.id)?.text.trim() || a.drafts.get(o.id)?.image ? (l(), n("span", Ba, [d[7] || (d[7] = e("em", null, "草稿", -1)), ie(" " + v(a.drafts.get(o.id)?.image ? "［图片］" : "") + v(a.drafts.get(o.id)?.text), 1)])) : (l(), n("span", Aa, v(o.preview), 1))])], 8, Sa))), 128))])) : (l(), n("div", wa, [
        E(N, { name: "message" }),
        d[6] || (d[6] = e("h2", null, "暂无联系人", -1)),
        e("button", {
          class: "messages-primary",
          onClick: d[3] || (d[3] = (o) => k.$emit("add"))
        }, [d[5] || (d[5] = ie("添加联系人", -1)), E(N, { name: "plus" })])
      ]))
    ]));
  }
}), Da = Ta, O = {
  pending: (a) => `${a} 条消息已保留，尚未确认写入主聊天。`,
  title: "主聊天同步",
  view: "查看",
  dismiss: "不再提示",
  setting: "未写入主聊天时提醒",
  retry: "补到主聊天",
  description: "重试不会再次发送消息或生成回复。「不再提示」不会删除消息；仍可从信息设置继续同步。",
  failed: "这次写入未完成，可以稍后重试。",
  operationTimeout: "暂时没收到操作结果，请先检查保存再重试。",
  settingsFailed: "设置未保存，请重试。",
  saveFailed: "还不能确认这次保存，请检查网络后重试。",
  saveOutdated: "原操作已经失效，不能安全重试。可以使用已保存版本；已保存的消息不会重新生成。",
  closed: "原记录已被修改、删除，或故事已继续。可以展开下方说明，在当前位置补记。"
}, Ra = ["disabled"], Na = ["disabled"], qa = ["disabled"], La = /* @__PURE__ */ K({
  __name: "MessagesSettings",
  props: {
    settings: {},
    busy: { type: Boolean }
  },
  emits: ["save"],
  setup(a, { emit: h }) {
    const s = a, p = h, r = Fe({ ...s.settings });
    return (k, d) => (l(), n("form", {
      class: "messages-settings",
      onSubmit: d[3] || (d[3] = ce((o) => p("save", { ...r }), ["prevent"]))
    }, [
      e("fieldset", { disabled: a.busy }, [
        d[6] || (d[6] = e("legend", null, "对方的回复", -1)),
        e("label", null, [d[4] || (d[4] = e("span", null, "允许对方发图片", -1)), Q(e("input", {
          "onUpdate:modelValue": d[0] || (d[0] = (o) => r.imagePrompt = o),
          type: "checkbox"
        }, null, 512), [[we, r.imagePrompt]])]),
        e("label", null, [d[5] || (d[5] = e("span", null, "允许对方发语音", -1)), Q(e("input", {
          "onUpdate:modelValue": d[1] || (d[1] = (o) => r.voicePrompt = o),
          type: "checkbox"
        }, null, 512), [[we, r.voicePrompt]])])
      ], 8, Ra),
      e("fieldset", { disabled: a.busy }, [e("legend", null, v(B(O).title), 1), e("label", null, [e("span", null, v(B(O).setting), 1), Q(e("input", {
        "onUpdate:modelValue": d[2] || (d[2] = (o) => r.syncNoticeEnabled = o),
        type: "checkbox"
      }, null, 512), [[we, r.syncNoticeEnabled]])])], 8, Na),
      e("button", {
        type: "submit",
        class: "messages-primary",
        disabled: a.busy
      }, v(a.busy ? "请稍候…" : "保存设置"), 9, qa)
    ], 32));
  }
}), Pa = La, Ua = ["src", "alt"], Fa = {
  key: 2,
  class: "messages-image-placeholder",
  role: "status",
  "aria-live": "polite"
}, Va = {
  key: 4,
  class: "messages-image-placeholder messages-media-unavailable"
}, za = {
  key: 5,
  class: "messages-image-caption"
}, _a = {
  key: 6,
  class: "messages-media-error",
  role: "status"
}, Oa = ["src", "alt"], Ga = /* @__PURE__ */ K({
  __name: "MessageImage",
  props: {
    message: {},
    bridge: {},
    chatIdentity: {},
    available: { type: Boolean }
  },
  emits: ["resize"],
  setup(a, { emit: h }) {
    const s = a, p = h, r = $(null), k = $(!1), d = $(""), o = $(""), M = $(""), I = $(""), C = $(!1), x = $(!1), T = A(() => s.message.payload.type === "image" ? s.message.payload.attachment : void 0), c = A(() => s.message.payload.type === "image" ? s.message.payload.description : ""), g = A(() => T.value?.path || d.value);
    let y = null;
    function S() {
      const b = I.value;
      I.value = "", b && s.bridge.post("messages/image/cancel", {
        chatIdentity: s.chatIdentity,
        mediaRequestId: b
      });
    }
    async function D() {
      if (I.value) return;
      if (g.value) {
        C.value = !1;
        return;
      }
      if (!s.available) return;
      const b = `image-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      I.value = b, o.value = "", M.value = "正在读取图片…";
      try {
        const { result: i } = await s.bridge.request("messages/image/generate", {
          chatIdentity: s.chatIdentity,
          messageId: s.message.id,
          mediaRequestId: b
        }, 18e4);
        if (I.value !== b) return;
        if (!i.data) throw new Error("画图暂不可用，请开启画图后重试。");
        d.value = i.data, C.value = !1;
      } catch (i) {
        if (I.value !== b) return;
        const f = i instanceof Error ? i.message : "";
        o.value = f === "host_request_timeout" ? "等待图片超过3分钟，已取消本次请求，可重试。" : f || "图片加载失败，请重试。", S();
      } finally {
        I.value === b && (I.value = "");
      }
    }
    const P = s.bridge.subscribe((b) => {
      if (b.type !== "messages/image-progress") return;
      const i = b.payload;
      if (!(!I.value || i.mediaRequestId !== I.value))
        if (i.status === "queued") {
          const f = Math.max(0, Number(i.ahead) || 0);
          M.value = f ? `排队中，前方 ${f} 张` : "已进入图片队列";
        } else i.status === "generating" ? M.value = "正在生成图片…" : i.status === "cooldown" && (M.value = i.delay ? `等待 ${Math.ceil(i.delay / 1e3)} 秒后继续` : "等待继续生成…");
    });
    return da(() => {
      if (!T.value) {
        if (typeof IntersectionObserver > "u") {
          k.value = !0;
          return;
        }
        y = new IntersectionObserver((b) => {
          k.value = b.some((i) => i.isIntersecting);
        }, { root: r.value?.closest(".messages-thread-scroll") ?? null }), r.value && y.observe(r.value);
      }
    }), pe([k, () => s.available], ([b, i]) => {
      b && i && !g.value && !o.value && D();
    }), ra(() => {
      y?.disconnect(), P(), S();
    }), (b, i) => (l(), n("div", {
      ref_key: "root",
      ref: r
    }, [
      g.value && !C.value ? (l(), n("button", {
        key: 0,
        class: "messages-image-open",
        "aria-label": "放大图片",
        onClick: i[2] || (i[2] = (f) => x.value = !0)
      }, [e("img", {
        src: g.value,
        alt: c.value || T.value?.name || "图片",
        onLoad: i[0] || (i[0] = (f) => p("resize")),
        onError: i[1] || (i[1] = (f) => C.value = !0)
      }, null, 40, Ua)])) : C.value ? (l(), n("button", {
        key: 1,
        class: "messages-image-placeholder",
        onClick: D
      }, [
        E(N, { name: "image" }),
        i[5] || (i[5] = e("span", null, "图片暂时无法显示", -1)),
        i[6] || (i[6] = e("small", null, "点击重新加载", -1))
      ])) : I.value ? (l(), n("div", Fa, [E(N, { name: "image" }), e("span", null, v(M.value), 1)])) : a.available ? (l(), n("button", {
        key: 3,
        class: "messages-image-placeholder",
        onClick: D
      }, [E(N, { name: "image" }), e("span", null, v(o.value ? "重试加载图片" : "图片"), 1)])) : (l(), n("div", Va, [
        E(N, { name: "image" }),
        i[7] || (i[7] = e("span", null, "图片描述", -1)),
        i[8] || (i[8] = e("small", null, "开启画图后自动加载", -1))
      ])),
      c.value ? (l(), n("p", za, v(c.value), 1)) : w("", !0),
      o.value ? (l(), n("small", _a, v(o.value), 1)) : w("", !0),
      x.value ? (l(), ve(_e, {
        key: 7,
        class: "messages-image-viewer",
        "aria-label": "查看图片",
        onClose: i[4] || (i[4] = (f) => x.value = !1)
      }, {
        default: Ue(() => [e("button", {
          "aria-label": "关闭图片",
          onClick: i[3] || (i[3] = (f) => x.value = !1)
        }, [E(N, { name: "close" })]), g.value ? (l(), n("img", {
          key: 0,
          src: g.value,
          alt: c.value || T.value?.name || "图片"
        }, null, 8, Oa)) : w("", !0)]),
        _: 1
      })) : w("", !0)
    ], 512));
  }
}), Ha = Ga, Za = ["data-message-id"], ja = {
  class: "messages-bubble-actions",
  role: "group",
  "aria-label": "消息操作"
}, Ka = ["disabled", "title"], Ya = ["disabled"], Ja = { key: 0 }, Xa = ["disabled", "aria-label"], Qa = {
  key: 0,
  class: "messages-media-unavailable-note"
}, Wa = {
  key: 2,
  class: "messages-transcript"
}, es = {
  key: 3,
  class: "messages-media-error",
  role: "status"
}, as = /* @__PURE__ */ K({
  __name: "MessageBubble",
  props: {
    message: {},
    bridge: {},
    chatIdentity: {},
    media: {},
    disabled: { type: Boolean },
    selected: { type: Boolean },
    permission: {}
  },
  emits: [
    "resize",
    "select",
    "deleteMessage",
    "regenerate"
  ],
  setup(a, { emit: h }) {
    const s = a, p = h;
    function r(g) {
      g.target.closest("button, a, dialog") || window.getSelection()?.toString() || p("select", s.message.id);
    }
    const k = $(""), d = $(""), o = $(!1), M = A(() => [
      "playing",
      "loading",
      "generating",
      "queued"
    ].includes(d.value)), I = $(!1);
    let C = !0;
    const x = (g) => s.bridge.request(g, {
      chatIdentity: s.chatIdentity,
      messageId: s.message.id
    }, 18e4);
    async function T() {
      if (I.value) return;
      k.value = "";
      const g = M.value;
      if (!(!g && !s.media.voice))
        try {
          g ? (I.value = !0, await x("messages/voice/stop"), C && (d.value = "")) : (d.value = "loading", await x("messages/voice/play"));
        } catch {
          C && (g || (d.value = ""), k.value = g ? "未能确认停止，请再点一次停止。" : "语音暂时无法播放，原文仍可查看。");
        } finally {
          C && (I.value = !1);
        }
    }
    const c = s.bridge.subscribe((g) => {
      if (g.type !== "messages/voice-state") return;
      const y = g.payload;
      y.messageId === s.message.id ? d.value = y.status : y.status === "playing" && (d.value = ""), y.messageId === s.message.id && y.status === "error" && (k.value = "播放失败，点击可以重试。");
    });
    return Me(() => {
      C = !1, c(), M.value && x("messages/voice/stop").catch(() => {
      });
    }), (g, y) => (l(), n("article", {
      class: W(["messages-bubble-row", {
        outgoing: a.message.sender === "user",
        "actions-selected": a.selected
      }]),
      "data-message-id": a.message.id,
      tabindex: "0",
      "aria-label": "消息操作",
      onClick: r,
      onFocus: y[4] || (y[4] = (S) => p("select", a.message.id))
    }, [e("div", ja, [e("button", {
      disabled: a.disabled,
      title: a.permission?.reason,
      class: W({ "is-unavailable": a.permission?.reason }),
      "aria-haspopup": "dialog",
      onClick: y[0] || (y[0] = (S) => g.$emit("deleteMessage", a.message.id))
    }, "删除", 10, Ka), a.permission?.regenerate ? (l(), n("button", {
      key: 0,
      disabled: a.disabled,
      onClick: y[1] || (y[1] = (S) => g.$emit("regenerate", a.message.id))
    }, "重新回复", 8, Ya)) : w("", !0)]), e("div", { class: W(["messages-bubble", `messages-bubble-${a.message.payload.type}`]) }, [a.message.payload.type === "text" ? (l(), n("p", Ja, v(a.message.payload.text), 1)) : a.message.payload.type === "image" ? (l(), ve(Ha, {
      key: 1,
      message: a.message,
      bridge: a.bridge,
      "chat-identity": a.chatIdentity,
      available: a.media.image,
      onResize: y[2] || (y[2] = (S) => g.$emit("resize"))
    }, null, 8, [
      "message",
      "bridge",
      "chat-identity",
      "available"
    ])) : (l(), n(R, { key: 2 }, [
      e("button", {
        class: "messages-voice-button",
        disabled: I.value || !a.media.voice && !M.value,
        "aria-label": M.value ? "停止播放" : "播放语音",
        onClick: T
      }, [
        E(N, { name: M.value ? "stop" : "play" }, null, 8, ["name"]),
        e("span", { class: W(["messages-wave", { playing: d.value === "playing" }]) }, [(l(), n(R, null, me(16, (S) => e("i", {
          key: S,
          style: Se({
            height: `${8 + S * 7 % 17}px`,
            animationDelay: `${S * 45}ms`
          })
        }, null, 4)), 64))], 2),
        e("small", null, v(I.value ? "停止中" : [
          "loading",
          "generating",
          "queued"
        ].includes(d.value) ? "准备中" : "语音"), 1)
      ], 8, Xa),
      a.media.voice ? w("", !0) : (l(), n("small", Qa, "开启 TTS 后可播放")),
      a.media.voice ? (l(), n("button", {
        key: 1,
        class: "messages-transcript-toggle",
        onClick: y[3] || (y[3] = (S) => o.value = !o.value)
      }, v(o.value ? "收起原文" : "查看原文"), 1)) : w("", !0),
      o.value || !a.media.voice ? (l(), n("p", Wa, v(a.message.payload.transcript), 1)) : w("", !0)
    ], 64)), k.value ? (l(), n("small", es, v(k.value), 1)) : w("", !0)], 2)], 42, Za));
  }
}), ss = as, ts = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
], Qt = 4 * 1024 * 1024;
async function ls(a) {
  if (!ts.includes(a.type)) throw new Error("请选择 PNG、JPG、WEBP 或 GIF 图片。");
  if (!a.size || a.size > 4194304) throw new Error("请选择不超过 4MB 的图片。");
  const h = await new Promise((p, r) => {
    const k = new FileReader();
    k.onerror = () => r(/* @__PURE__ */ new Error("图片读取失败，请重新选择。")), k.onload = () => typeof k.result == "string" ? p(k.result) : r(/* @__PURE__ */ new Error("图片读取失败。")), k.readAsDataURL(a);
  }), s = new Image();
  s.src = h;
  try {
    await s.decode();
  } catch {
    throw new Error("这张图片无法打开，请换一张。");
  }
  return {
    dataUrl: h,
    name: a.name.replace(/[\u0000-\u001f\u007f]/gu, "").trim().slice(0, 120) || "图片"
  };
}
var ns = {
  key: 0,
  class: "messages-attachment-preview"
}, is = ["src", "alt"], us = ["disabled"], os = {
  key: 1,
  class: "messages-composer-hint"
}, rs = {
  key: 2,
  class: "messages-composer-hint",
  role: "status"
}, ds = {
  key: 3,
  class: "messages-composer-wait",
  role: "status"
}, vs = { class: "messages-composer-line" }, gs = ["disabled"], ms = ["placeholder", "disabled"], cs = ["disabled"], ys = /* @__PURE__ */ K({
  __name: "MessageComposer",
  props: /* @__PURE__ */ fe({
    disabled: { type: Boolean },
    sending: { type: Boolean },
    waitingFor: {}
  }, {
    draft: { required: !0 },
    draftModifiers: {}
  }),
  emits: /* @__PURE__ */ fe(["send"], ["update:draft"]),
  setup(a, { emit: h }) {
    const s = a, p = h, r = Pe(a, "draft"), k = A({
      get: () => r.value.text,
      set: (y) => {
        r.value = {
          ...r.value,
          text: y
        };
      }
    }), d = $(null), o = $(!1), M = $(""), I = $(!1);
    let C = !0;
    async function x(y) {
      const S = y.target, D = S.files?.[0];
      if (S.value = "", !(!D || s.sending || o.value)) {
        o.value = !0, M.value = "";
        try {
          const P = await ls(D);
          C && (r.value = {
            ...r.value,
            image: P
          });
        } catch (P) {
          C && (M.value = P instanceof Error ? P.message : "图片读取失败，请重新选择。");
        } finally {
          C && (o.value = !1);
        }
      }
    }
    function T() {
      r.value = {
        ...r.value,
        image: null
      }, M.value = "";
    }
    function c() {
      const y = k.value.trim();
      !y && !r.value.image || s.disabled || o.value || p("send", r.value.image ? {
        type: "image",
        description: y,
        upload: { ...r.value.image }
      } : {
        type: "text",
        text: y
      });
    }
    Me(() => {
      C = !1;
    });
    function g(y) {
      ma(y, I.value) && (y.preventDefault(), c());
    }
    return (y, S) => (l(), n("form", {
      class: "messages-composer",
      onSubmit: ce(c, ["prevent"])
    }, [
      e("input", {
        ref_key: "fileInput",
        ref: d,
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/gif",
        hidden: "",
        "aria-label": "选择图片文件",
        onChange: x
      }, null, 544),
      r.value.image ? (l(), n("div", ns, [
        e("img", {
          src: r.value.image.dataUrl,
          alt: r.value.image.name
        }, null, 8, is),
        e("span", null, [S[4] || (S[4] = e("strong", null, "待发送的图片", -1)), e("small", null, v(r.value.image.name), 1)]),
        e("button", {
          type: "button",
          class: "messages-icon-button",
          "aria-label": "移除图片",
          disabled: a.sending || o.value,
          onClick: T
        }, [E(N, { name: "close" })], 8, us)
      ])) : w("", !0),
      r.value.image ? (l(), n("p", os, "图片将随消息发送，需要当前模型支持看图。")) : w("", !0),
      o.value || M.value ? (l(), n("p", rs, v(o.value ? "正在读取图片…" : M.value), 1)) : w("", !0),
      a.waitingFor ? (l(), n("p", ds, "正在等待 " + v(a.waitingFor) + " 的回复。可以先写好，稍后发送。", 1)) : w("", !0),
      e("div", vs, [
        e("button", {
          type: "button",
          class: "messages-icon-button messages-attach",
          "aria-label": "选择图片",
          disabled: a.sending || o.value,
          onClick: S[0] || (S[0] = (D) => d.value?.click())
        }, [E(N, { name: "plus" })], 8, gs),
        Q(e("textarea", {
          "onUpdate:modelValue": S[1] || (S[1] = (D) => k.value = D),
          rows: "1",
          maxlength: "4000",
          enterkeyhint: "enter",
          placeholder: r.value.image ? "给图片配句话…" : "说点什么…",
          "aria-label": "消息内容",
          disabled: a.sending,
          onKeydown: g,
          onCompositionstart: S[2] || (S[2] = (D) => I.value = !0),
          onCompositionend: S[3] || (S[3] = (D) => I.value = !1)
        }, null, 40, ms), [[de, k.value]]),
        e("button", {
          class: "messages-send",
          type: "submit",
          disabled: a.disabled || o.value || !k.value.trim() && !r.value.image,
          "aria-label": "发送"
        }, [E(N, { name: "send" })], 8, cs)
      ])
    ], 32));
  }
}), bs = ys, fs = {
  class: "messages-delivery",
  role: "status"
}, ps = { key: 0 }, ks = ["disabled"], $s = ["disabled"], hs = /* @__PURE__ */ K({
  __name: "DeliveryStatus",
  props: {
    sending: { type: Boolean },
    error: {},
    pendingSave: { type: Boolean },
    disabled: { type: Boolean },
    discard: { type: Boolean }
  },
  emits: ["retry", "discard"],
  setup(a) {
    return (h, s) => (l(), n("div", fs, [a.sending ? (l(), n("span", ps, "发送中…")) : (l(), n(R, { key: 1 }, [
      e("span", null, v(a.error || (a.pendingSave ? "还不确定是否保存成功" : "尚未收到回复")), 1),
      e("button", {
        disabled: a.disabled,
        onClick: s[0] || (s[0] = (p) => h.$emit("retry"))
      }, v(a.pendingSave ? "检查并重试" : "重试"), 9, ks),
      a.discard && !a.pendingSave ? (l(), n("button", {
        key: 0,
        disabled: a.disabled,
        onClick: s[1] || (s[1] = (p) => h.$emit("discard"))
      }, "删除", 8, $s)) : w("", !0)
    ], 64))]));
  }
}), qe = hs, ws = 158e3, Cs = 128e3, Le = 6e3;
function Is(a) {
  return String(a ?? "").replace(/<(?=\/?[A-Za-z_])/g, "＜");
}
var Ss = ["aria-label", "aria-expanded"], Ms = {
  key: 0,
  class: "messages-context-popover",
  "aria-label": "上下文用量"
}, Es = { class: "messages-context-total" }, xs = {
  key: 1,
  role: "status"
}, Bs = { key: 3 }, As = /* @__PURE__ */ K({
  __name: "MessageContextButton",
  props: {
    bridge: {},
    state: {},
    contactId: {},
    draft: {}
  },
  setup(a) {
    const h = a, s = $(!1), p = $(!1), r = $(!1), k = $(0), d = $(null);
    ze(() => (s.value = !1, !0), () => s.value), pe(() => JSON.stringify([
      h.contactId,
      h.state.chatIdentity,
      h.state.revision,
      h.state.boundary,
      h.state.settings.imagePrompt,
      h.state.settings.voicePrompt,
      !!h.state.busy,
      h.state.generationActive,
      k.value
    ]), async (T, c, g) => {
      let y = !0;
      if (g(() => {
        y = !1;
      }), p.value = !0, r.value = !1, h.state.busy || h.state.generationActive) return;
      const S = h.state.revision, D = h.state.boundary;
      try {
        const P = await h.bridge.request("messages/context", {
          chatIdentity: h.state.chatIdentity,
          contactId: h.contactId
        }, 6e4);
        if (!y) return;
        if (P.result.revision !== S || P.result.boundary !== D) throw new Error("stale");
        d.value = P.result.stats;
      } catch {
        y && (r.value = !0, d.value = null);
      } finally {
        y && (p.value = !1);
      }
    }, { immediate: !0 });
    const o = A(() => ga(Is(h.draft.text))), M = A(() => (d.value?.imageTokens ?? 0) + (h.draft.image ? Le : 0)), I = A(() => (d.value?.usedTokens ?? 0) + o.value + (h.draft.image ? Le : 0)), C = A(() => Math.min(1, I.value / ws)), x = (T) => `${(T / 1e3).toFixed(1)}k`;
    return (T, c) => (l(), n("div", {
      class: "messages-context",
      onKeydown: c[3] || (c[3] = Ve(ce((g) => s.value = !1, ["stop"]), ["esc"]))
    }, [e("button", {
      type: "button",
      class: W(["messages-context-ring", { "is-warning": I.value >= B(Cs) }]),
      style: Se({ "--context-fill": `${d.value ? C.value * 360 : 0}deg` }),
      "aria-label": d.value ? `上下文：约 ${x(I.value)} / 158k` : "上下文用量",
      "aria-expanded": s.value,
      title: "上下文",
      onClick: c[0] || (c[0] = (g) => s.value = !s.value)
    }, [e("span", null, v(p.value ? "…" : r.value || !d.value ? "—" : ""), 1)], 14, Ss), s.value ? (l(), n("section", Ms, [
      e("header", null, [c[4] || (c[4] = e("strong", null, "上下文", -1)), e("button", {
        type: "button",
        "aria-label": "关闭上下文用量",
        onClick: c[1] || (c[1] = (g) => s.value = !1)
      }, "×")]),
      d.value ? (l(), n(R, { key: 0 }, [e("p", Es, "约 " + v(x(I.value)) + " / 158k", 1), e("dl", null, [
        c[6] || (c[6] = e("dt", null, "剧情与设定", -1)),
        e("dd", null, v(x(d.value.backgroundTokens)), 1),
        c[7] || (c[7] = e("dt", null, "通讯摘要", -1)),
        e("dd", null, v(x(d.value.summaryTokens)), 1),
        c[8] || (c[8] = e("dt", null, "通讯原文", -1)),
        e("dd", null, v(x(d.value.historyTokens)), 1),
        c[9] || (c[9] = e("dt", null, "提示词与输入", -1)),
        e("dd", null, v(x(d.value.promptTokens + o.value)), 1),
        M.value ? (l(), n(R, { key: 0 }, [c[5] || (c[5] = e("dt", null, "图片预留", -1)), e("dd", null, v(x(M.value)), 1)], 64)) : w("", !0)
      ])], 64)) : w("", !0),
      p.value ? (l(), n("p", xs, v(a.state.busy?.stage === "summarizing" ? "正在总结较早通讯…" : a.state.busy || a.state.generationActive ? "本轮结束后更新用量。" : "正在读取…"), 1)) : r.value ? (l(), n(R, { key: 2 }, [c[10] || (c[10] = e("p", { role: "status" }, "用量暂时无法读取。", -1)), e("button", {
        type: "button",
        class: "messages-secondary",
        onClick: c[2] || (c[2] = (g) => k.value++)
      }, "重试")], 64)) : w("", !0),
      c[11] || (c[11] = e("p", null, "128k 时在下次回复前自动总结，保留近期原文。", -1)),
      M.value ? (l(), n("small", Bs, "图片按每张 6k 预留，实际用量由模型决定。")) : w("", !0)
    ])) : w("", !0)], 32));
  }
}), Ts = As, _ = {
  back: "返回信息",
  details: "联系人详情",
  contextHint: "对话参考角色设定、世界书、近期剧情及可用总结。",
  loadingOlder: "读取中…",
  older: "查看更早的消息",
  loading: "正在读取消息…",
  unfinished: "发送未完成",
  image: "图片",
  voice: "语音",
  summarizing: "对方正在翻看以前的私信…",
  replying: "对方正在输入…",
  hideCharacterState: "收起内心",
  showCharacterState: "偷看内心",
  latest: "回到最新消息"
}, Ds = { class: "messages-conversation" }, Rs = { class: "messages-thread-header" }, Ns = ["aria-label"], qs = { class: "messages-thread-heading" }, Ls = ["aria-label"], Ps = { class: "messages-subtle messages-context-hint" }, Us = ["disabled"], Fs = {
  key: 1,
  class: "messages-thread-start"
}, Vs = {
  key: 0,
  class: "messages-time"
}, zs = { class: "messages-bubble-row outgoing" }, _s = { key: 0 }, Os = ["src", "alt"], Gs = {
  key: 0,
  class: "messages-image-caption"
}, Hs = { key: 0 }, Zs = { class: "messages-image-placeholder" }, js = { class: "messages-image-caption" }, Ks = { class: "messages-provisional-label" }, Ys = { class: "messages-transcript" }, Js = {
  key: 3,
  class: "messages-typing",
  role: "status"
}, Xs = ["aria-expanded"], Qs = {
  key: 4,
  class: "messages-character-state"
}, Ws = /* @__PURE__ */ K({
  __name: "Conversation",
  props: /* @__PURE__ */ fe({
    contextState: {},
    contact: {},
    page: {},
    bridge: {},
    chatIdentity: {},
    disabled: { type: Boolean },
    sendDisabled: { type: Boolean },
    busy: {},
    outgoing: {},
    sendFailure: {},
    sendError: {},
    working: { type: Boolean },
    pendingSave: { type: Boolean },
    retryDisabled: { type: Boolean },
    loading: { type: Boolean },
    loadMore: { type: Function },
    media: {},
    waitingFor: {}
  }, {
    draft: { required: !0 },
    draftModifiers: {}
  }),
  emits: /* @__PURE__ */ fe([
    "back",
    "details",
    "send",
    "retry",
    "discard",
    "deleteMessage",
    "regenerate",
    "latest"
  ], ["update:draft"]),
  setup(a, { expose: h }) {
    const s = Pe(a, "draft"), p = a, r = $("");
    function k(b) {
      b.target.closest(".messages-bubble-row") || (r.value = "");
    }
    const d = A(() => p.busy?.contactId === p.contact.id ? p.busy.stage : ""), o = A(() => [
      "replying",
      "summarizing",
      "saving-reply"
    ].includes(d.value)), M = A(() => !!p.page.revision && !p.page.hasNewer), I = A(() => o.value && M.value ? p.busy?.preview ?? null : null), C = $(!1);
    pe(() => p.busy?.messageId, () => {
      C.value = !1;
    });
    function x(b) {
      return [p.sendFailure, p.sendError].find((i) => i?.contactId === p.contact.id && i.messageId === b)?.message;
    }
    const T = $(null);
    let c = !0, g = !1, y = null;
    oa(() => {
      y = null;
      const b = T.value;
      if (!b || c && !g && !p.page.hasNewer) return;
      const i = new Set(p.page.messages.map((q) => q.id)), f = [...b.querySelectorAll("[data-message-id]")].find((q) => i.has(q.dataset.messageId) && q.getBoundingClientRect().bottom > b.getBoundingClientRect().top);
      f && (y = {
        id: f.dataset.messageId,
        offset: f.getBoundingClientRect().top - b.getBoundingClientRect().top
      });
    }), ua(() => {
      const b = T.value;
      if (b)
        if (y) {
          const i = [...b.querySelectorAll("[data-message-id]")].find((f) => f.dataset.messageId === y.id);
          i && (b.scrollTop += i.getBoundingClientRect().top - b.getBoundingClientRect().top - y.offset), y = null;
        } else c && !g && !p.page.hasNewer && (b.scrollTop = b.scrollHeight);
    });
    function S() {
      const b = T.value;
      b && (c = b.scrollHeight - b.clientHeight - b.scrollTop < 70);
    }
    async function D() {
      await Ie(), c && !g && !p.page.hasNewer && T.value && (T.value.scrollTop = T.value.scrollHeight);
    }
    pe(() => [
      p.page.messages.at(-1)?.id,
      p.outgoing?.messageId,
      d.value,
      p.sendFailure,
      p.sendError,
      I.value?.replies.length,
      I.value?.characterStateDone,
      C.value && I.value?.characterState
    ], D, { immediate: !0 });
    async function P() {
      if (!(!T.value || g)) {
        g = !0;
        try {
          await p.loadMore(), await Ie();
        } finally {
          g = !1, S();
        }
      }
    }
    return h({ sent() {
      c = !0, D();
    } }), (b, i) => (l(), n("section", Ds, [
      e("header", Rs, [
        e("button", {
          class: "messages-icon-button",
          "aria-label": B(_).back,
          onClick: i[0] || (i[0] = (f) => b.$emit("back"))
        }, [E(N, { name: "back" })], 8, Ns),
        E(ke, {
          identity: a.contact.id,
          name: a.contact.name,
          small: ""
        }, null, 8, ["identity", "name"]),
        e("div", qs, [e("h2", null, v(a.contact.name), 1)]),
        E(Ts, {
          bridge: a.bridge,
          state: a.contextState,
          "contact-id": a.contact.id,
          draft: s.value
        }, null, 8, [
          "bridge",
          "state",
          "contact-id",
          "draft"
        ]),
        e("button", {
          class: "messages-icon-button",
          "aria-label": B(_).details,
          onClick: i[1] || (i[1] = (f) => b.$emit("details"))
        }, [E(N, { name: "more" })], 8, Ls)
      ]),
      e("div", {
        ref_key: "scroller",
        ref: T,
        class: "messages-thread-scroll",
        onScroll: S,
        onClick: k,
        onKeydown: i[8] || (i[8] = Ve((f) => r.value = "", ["esc"]))
      }, [
        e("p", Ps, v(B(_).contextHint), 1),
        a.page.hasMore ? (l(), n("button", {
          key: 0,
          class: "messages-older",
          disabled: a.loading,
          onClick: P
        }, v(a.loading ? B(_).loadingOlder : B(_).older), 9, Us)) : w("", !0),
        a.loading && !a.page.messages.length ? (l(), n("p", Fs, v(B(_).loading), 1)) : w("", !0),
        (l(!0), n(R, null, me(a.page.messages, (f, q) => (l(), n(R, { key: f.id }, [
          q === 0 || f.createdAt - a.page.messages[q - 1].createdAt > 3e5 ? (l(), n("time", Vs, v(new Date(f.createdAt).toLocaleString(void 0, {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })), 1)) : w("", !0),
          E(ss, {
            message: f,
            bridge: a.bridge,
            "chat-identity": a.chatIdentity,
            media: a.media,
            disabled: a.disabled,
            selected: r.value === f.id,
            permission: a.page.permissions[f.id],
            onSelect: i[2] || (i[2] = (G) => r.value = G),
            onResize: D,
            onDeleteMessage: i[3] || (i[3] = (G) => b.$emit("deleteMessage", G)),
            onRegenerate: i[4] || (i[4] = (G) => b.$emit("regenerate", G))
          }, null, 8, [
            "message",
            "bridge",
            "chat-identity",
            "media",
            "disabled",
            "selected",
            "permission"
          ]),
          f.id === a.page.retryMessageId && !o.value ? (l(), ve(qe, {
            key: 1,
            sending: a.busy?.messageId === f.id && ["saving", "uploading"].includes(d.value),
            error: x(f.id),
            "pending-save": a.pendingSave,
            disabled: a.retryDisabled,
            onRetry: (G) => b.$emit("retry", f.id)
          }, null, 8, [
            "sending",
            "error",
            "pending-save",
            "disabled",
            "onRetry"
          ])) : w("", !0)
        ], 64))), 128)),
        a.outgoing && M.value ? (l(), n(R, { key: 2 }, [e("div", zs, [e("div", { class: W(["messages-bubble", { "messages-bubble-image": a.outgoing.payload.type === "image" }]) }, [a.outgoing.payload.type === "text" ? (l(), n("p", _s, v(a.outgoing.payload.text), 1)) : (l(), n(R, { key: 1 }, [e("img", {
          class: "messages-pending-image",
          src: a.outgoing.payload.upload.dataUrl,
          alt: a.outgoing.payload.upload.name,
          onLoad: D
        }, null, 40, Os), a.outgoing.payload.description ? (l(), n("p", Gs, v(a.outgoing.payload.description), 1)) : w("", !0)], 64))], 2)]), E(qe, {
          sending: a.working || a.busy?.messageId === a.outgoing.messageId,
          error: x(a.outgoing.messageId) || B(_).unfinished,
          "pending-save": a.pendingSave,
          disabled: a.retryDisabled,
          discard: "",
          onRetry: i[5] || (i[5] = (f) => b.$emit("retry", a.outgoing.messageId)),
          onDiscard: i[6] || (i[6] = (f) => b.$emit("discard", a.outgoing.messageId))
        }, null, 8, [
          "sending",
          "error",
          "pending-save",
          "disabled"
        ])], 64)) : w("", !0),
        (l(!0), n(R, null, me(I.value?.replies ?? [], (f, q) => (l(), n("div", {
          key: q,
          class: "messages-bubble-row messages-provisional"
        }, [e("div", { class: W(["messages-bubble", `messages-bubble-${f.type}`]) }, [f.type === "text" ? (l(), n("p", Hs, v(f.text), 1)) : f.type === "image" ? (l(), n(R, { key: 1 }, [e("div", Zs, [E(N, { name: "image" }), e("span", null, v(B(_).image), 1)]), e("p", js, v(f.description), 1)], 64)) : (l(), n(R, { key: 2 }, [e("small", Ks, v(B(_).voice), 1), e("p", Ys, v(f.transcript), 1)], 64))], 2)]))), 128)),
        o.value && M.value ? (l(), n("div", Js, [
          i[12] || (i[12] = e("span", null, [
            e("i"),
            e("i"),
            e("i")
          ], -1)),
          ie(v(d.value === "summarizing" ? B(_).summarizing : B(_).replying) + " ", 1),
          I.value?.characterState ? (l(), n("button", {
            key: 0,
            class: "messages-peek",
            "aria-expanded": C.value,
            onClick: i[7] || (i[7] = (f) => C.value = !C.value)
          }, v(C.value ? B(_).hideCharacterState : B(_).showCharacterState), 9, Xs)) : w("", !0)
        ])) : w("", !0),
        C.value && I.value?.characterState ? (l(), n("p", Qs, v(I.value.characterState), 1)) : w("", !0)
      ], 544),
      a.page.hasNewer ? (l(), n("button", {
        key: 0,
        class: "messages-latest",
        onClick: i[9] || (i[9] = (f) => {
          va(c) ? c.value = !0 : c = !0, b.$emit("latest");
        })
      }, v(B(_).latest), 1)) : w("", !0),
      E(bs, {
        draft: s.value,
        "onUpdate:draft": i[10] || (i[10] = (f) => s.value = f),
        disabled: a.sendDisabled,
        sending: !1,
        "waiting-for": a.waitingFor,
        onSend: i[11] || (i[11] = (f) => b.$emit("send", f))
      }, null, 8, [
        "draft",
        "disabled",
        "waiting-for"
      ])
    ]));
  }
}), et = Ws, at = () => ({
  text: "",
  image: null
});
function Ce() {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (a) => a.toString(16).padStart(2, "0")).join("");
}
var st = Object.freeze({ chooseConversation: "选择一个对话" }), tt = { class: "messages-app" }, lt = {
  key: 0,
  class: "messages-banner",
  role: "status"
}, nt = { class: "messages-save-actions" }, it = ["disabled"], ut = ["disabled"], ot = {
  key: 1,
  class: "messages-banner",
  role: "status"
}, rt = { key: 0 }, dt = { class: "messages-save-actions" }, vt = ["disabled"], gt = ["disabled"], mt = {
  key: 2,
  class: "messages-notice"
}, ct = {
  key: 3,
  class: "messages-error",
  role: "alert"
}, yt = {
  key: 4,
  class: "messages-banner",
  role: "alert"
}, bt = ["disabled"], ft = {
  key: 1,
  class: "messages-selection"
}, pt = { id: "messages-dialog-title" }, kt = ["disabled"], $t = {
  key: 0,
  class: "messages-error",
  role: "alert"
}, ht = ["disabled"], wt = { class: "messages-search" }, Ct = ["aria-busy"], It = {
  key: 0,
  class: "messages-subtle",
  role: "status"
}, St = { key: 1 }, Mt = ["disabled"], Et = ["disabled", "onClick"], xt = { key: 0 }, Bt = {
  key: 0,
  class: "messages-subtle"
}, At = { class: "messages-manual" }, Tt = ["disabled"], Dt = ["disabled"], Rt = ["disabled"], Nt = {
  key: 0,
  role: "status"
}, qt = { key: 1 }, Lt = ["disabled"], Pt = {
  key: 0,
  role: "status"
}, Ut = { key: 1 }, Ft = ["disabled"], Vt = ["disabled"], zt = ["disabled"], _t = { class: "messages-manual" }, Ot = ["disabled"], Gt = ["disabled"], Ht = ["disabled"], Zt = ["disabled"], jt = ["disabled"], Kt = /* @__PURE__ */ K({
  __name: "MessagesApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(a) {
    const h = a, s = $(h.initialState), p = (u = "") => ({
      contactId: u,
      messages: [],
      hasMore: !1,
      hasNewer: !1,
      retryMessageId: null,
      revision: "",
      permissions: {}
    }), r = $(""), k = $(p()), d = $(!1), o = $(!1), M = $(!1), I = $(!1), C = $(""), x = $(""), T = $(null), c = $(!1), g = $("add"), y = A(() => c.value && (g.value === "sync" || g.value === "recover")), S = $(null), D = A(() => s.value.syncNotice.messageIds.length), P = $(""), b = $(""), i = A(() => g.value === "delete" ? Z.value?.deleteReason ?? "" : k.value.permissions[P.value]?.reason ?? ""), f = $(""), q = $(""), G = $(""), ee = $("ready"), ye = $(Ce());
    let J = !0, ue = 0, te = 0, oe = !1;
    const re = Fe(/* @__PURE__ */ new Map()), Ee = A({
      get: () => re.get(r.value) ?? at(),
      set: (u) => {
        re.set(r.value, u);
      }
    }), U = $(null), X = $(null), le = A(() => s.value.outgoing ?? U.value), Oe = A(() => le.value?.contactId === r.value && !k.value.messages.some((u) => u.id === le.value?.messageId) ? le.value : null), Z = A(() => s.value.contacts.find((u) => u.id === r.value)), Ge = A(() => s.value.busy && s.value.busy.contactId !== r.value ? s.value.contacts.find((u) => u.id === s.value.busy?.contactId)?.name ?? "另一位联系人" : ""), ge = A(() => s.value.pendingSave || s.value.pendingModification || [
      "unconfirmed",
      "conflict",
      "failed"
    ].includes(s.value.fileState)), V = A(() => o.value || !!s.value.busy || s.value.operationPending || ge.value || s.value.fileState !== "ready" || s.value.generationActive), xe = A(() => s.value.knownPeople.filter((u) => !s.value.contacts.some((t) => t.name === u.name) && `${u.name} ${u.aliases.join(" ")}`.toLocaleLowerCase().includes(G.value.toLocaleLowerCase())));
    async function L(u, t = {}) {
      return (await h.bridge.request(u, {
        chatIdentity: s.value.chatIdentity,
        ...t
      }, 6e4)).result;
    }
    async function ae(u = !1, t = !1) {
      const m = r.value;
      if (!m) return;
      u ? oe = !1 : t && (oe = !0);
      const H = ++ue;
      d.value = !0, x.value = "";
      try {
        const j = k.value, se = await L("messages/thread", {
          contactId: m,
          ...u ? {
            before: j.messages[0]?.seq,
            revision: j.revision
          } : !oe && j.messages.length ? { window: {
            first: j.messages[0].seq,
            last: j.messages.at(-1).seq,
            latest: !j.hasNewer
          } } : {}
        });
        if (!J || H !== ue || r.value !== m || se.revision !== s.value.revision) return;
        const $e = u && j.revision === se.revision, he = $e ? [...se.messages, ...j.messages].slice(0, 100) : se.messages;
        k.value = {
          ...se,
          messages: he,
          hasNewer: $e ? he.at(-1)?.id !== j.messages.at(-1)?.id || j.hasNewer : se.hasNewer,
          permissions: $e ? {
            ...j.permissions,
            ...se.permissions
          } : se.permissions
        }, oe = !1, U.value?.contactId === m && he.some((ia) => ia.id === U.value?.messageId) && (U.value = null, X.value = null);
      } catch {
        J && H === ue && r.value === m && (x.value = "消息暂时无法读取。");
      } finally {
        H === ue && (d.value = !1);
      }
    }
    function F(u) {
      if (!J || u.chatIdentity !== s.value.chatIdentity) return;
      const t = s.value.revision !== u.revision || s.value.boundary !== u.boundary || s.value.fileState !== u.fileState || s.value.pendingSave !== u.pendingSave;
      s.value = u, U.value && (u.outgoing?.messageId === U.value.messageId || u.busy?.messageId === U.value.messageId || u.contacts.some((m) => m.lastMessageId === U.value.messageId)) && (U.value = null, X.value = null);
      for (const m of re.keys()) u.contacts.some((H) => H.id === m) || re.delete(m);
      U.value && !u.contacts.some((m) => m.id === U.value?.contactId) && (U.value = null, X.value = null), r.value && !u.contacts.some((m) => m.id === r.value) ? be() : r.value && t && ae();
    }
    const He = h.bridge.subscribe((u) => {
      u.type === "messages/state" && F(u.payload.state);
    });
    function Be(u) {
      u !== r.value && (r.value = u, oe = !1, C.value = "", k.value = p(u), ae());
    }
    function be() {
      r.value = "", oe = !1, ue++, x.value = "", k.value = p();
    }
    ze(() => (be(), !0), () => !!r.value);
    async function Y(u, t = () => !0) {
      if (!o.value) {
        o.value = !0, C.value = "";
        try {
          await u();
        } catch (m) {
          J && t() && (C.value = m instanceof Error && m.message !== "host_request_timeout" ? m.message : O.operationTimeout);
        } finally {
          o.value = !1;
        }
      }
    }
    function Ze(u) {
      if (V.value || le.value) return;
      const t = {
        contactId: r.value,
        messageId: `input:${Ce()}`,
        payload: u,
        createdAt: Date.now()
      };
      U.value = t, X.value = null, re.delete(t.contactId), ae(!1, !0), T.value?.sent(), Ae(t.contactId, t.messageId, t);
    }
    async function Ae(u, t, m) {
      if (!o.value) {
        o.value = !0, X.value = null, C.value = "";
        try {
          if (ge.value && (F(await L("messages/confirm")), ge.value))
            return;
          const H = m?.payload.type === "image" ? {
            type: "image",
            description: m.payload.description,
            upload: { ...m.payload.upload }
          } : m ? {
            type: "text",
            text: m.payload.text
          } : void 0;
          F(m ? await L("messages/send", {
            contactId: u,
            actionId: t.slice(6),
            payload: H
          }) : await L("messages/retry", {
            contactId: u,
            messageId: t
          }));
        } catch (H) {
          J && (X.value = {
            contactId: u,
            messageId: t,
            message: H instanceof Error && H.message !== "host_request_timeout" ? H.message : "还不确定是否发送成功，可以重试。"
          });
        } finally {
          o.value = !1;
        }
      }
    }
    function je(u) {
      const t = le.value?.messageId === u ? le.value : void 0;
      Ae(r.value, u, t);
    }
    function Ke(u) {
      Y(async () => {
        F(await L("messages/discard-send", { messageId: u })), U.value?.messageId === u && (U.value = null), X.value = null, await ae();
      });
    }
    function Ye(u) {
      Y(async () => F(await L(u)));
    }
    function Je(u) {
      Y(async () => {
        F(await L("messages/settings", { settings: u })), z();
      });
    }
    function Xe() {
      if (M.value) return;
      M.value = !0, C.value = "";
      const u = te;
      L("messages/sync").then((t) => {
        F(t), te === u && z();
      }).catch((t) => {
        J && te === u && s.value.settings.syncNoticeEnabled && (C.value = t instanceof Error && t.message !== "host_request_timeout" ? t.message : O.operationTimeout);
      }).finally(() => {
        M.value = !1;
      });
    }
    function Te() {
      if (I.value || !s.value.settings.syncNoticeEnabled) return;
      I.value = !0, C.value = "";
      const u = te;
      L("messages/dismiss-sync-notice").then((t) => {
        F(t), c.value && te === u && z(), C.value = "";
      }).catch((t) => {
        J && (C.value = t instanceof Error && t.message !== "host_request_timeout" ? t.message : O.settingsFailed);
      }).finally(() => {
        I.value = !1;
      });
    }
    function ne(u) {
      c.value && Ie(() => S.value?.focus()), te++, g.value = u, C.value = "", f.value = "", q.value = Z.value?.note ?? "", G.value = "", ye.value = Ce(), c.value = !0, b.value = s.value.revision, u === "add" && De();
    }
    async function De() {
      const u = ye.value, t = () => J && c.value && g.value === "add" && ye.value === u;
      ee.value = "loading";
      try {
        const m = await L("messages/refresh");
        if (!t()) return;
        F(m), ee.value = "ready";
      } catch {
        t() && (ee.value = "failed");
      }
    }
    function z() {
      y.value && (C.value = ""), c.value = !1, te++;
    }
    function Re() {
      z();
    }
    function Qe() {
      if (o.value && y.value) {
        z();
        return;
      }
      o.value || (g.value === "delete" ? g.value = "detail" : g.value === "recover" ? g.value = "sync" : Re());
    }
    function Ne(u = f.value) {
      !u.trim() || V.value || ee.value === "loading" || Y(async () => {
        const t = await L("messages/contact/add", {
          actionId: ye.value,
          name: u.trim(),
          note: q.value.trim()
        });
        F(t.state), z(), Be(t.contactId);
      });
    }
    function We() {
      Y(async () => {
        F(await L("messages/contact/note", {
          contactId: r.value,
          note: q.value
        })), z();
      });
    }
    function ea() {
      Y(async () => {
        F(await L("messages/contact/delete", {
          contactId: r.value,
          revision: b.value
        })), z(), be();
      });
    }
    function aa(u) {
      P.value = u, ne("delete-message"), b.value = k.value.revision;
    }
    function sa() {
      const u = r.value, t = P.value;
      Y(async () => {
        F(await L("messages/message/delete", {
          contactId: u,
          messageId: t,
          revision: b.value
        })), await ae(), z();
      });
    }
    function ta(u) {
      const t = {
        contactId: r.value,
        messageId: u,
        revision: k.value.revision
      };
      Y(async () => {
        F(await L("messages/regenerate", t));
      });
    }
    function la() {
      Y(async () => {
        F(await L("messages/recover")), z();
      });
    }
    function na() {
      Y(async () => {
        F(await L("messages/adopt-server-state")), s.value.fileState === "ready" && !s.value.pendingSave ? (U.value = null, X.value = null, z()) : C.value = "暂时无法加载已保存版本，请检查网络后重试。当前记录未改。";
      });
    }
    return Me(() => {
      J = !1, ue++, He();
    }), (u, t) => (l(), n("main", tt, [
      ge.value ? (l(), n("div", lt, [e("span", null, v(s.value.fileState === "conflict" ? "服务器上的存档已有变化，请选择如何处理。" : "还不确定部分消息是否保存成功，请先检查保存。"), 1), e("div", nt, [e("button", {
        disabled: o.value || s.value.operationPending || !!s.value.busy,
        onClick: t[0] || (t[0] = (m) => Ye("messages/confirm"))
      }, "检查保存", 8, it), s.value.fileState === "conflict" || s.value.recoveryBlocked ? (l(), n("button", {
        key: 0,
        disabled: o.value || s.value.operationPending || !!s.value.busy || s.value.generationActive,
        onClick: t[1] || (t[1] = (m) => ne("adopt"))
      }, "使用已保存版本", 8, ut)) : w("", !0)])])) : D.value && s.value.settings.syncNoticeEnabled && !s.value.busy ? (l(), n("div", ot, [
        e("span", null, v(B(O).pending(D.value)), 1),
        s.value.syncNotice.error ? (l(), n("span", rt, v(s.value.syncNotice.error), 1)) : w("", !0),
        e("div", dt, [e("button", {
          disabled: V.value,
          onClick: t[2] || (t[2] = (m) => ne("sync"))
        }, v(B(O).view), 9, vt), e("button", {
          disabled: I.value,
          onClick: Te
        }, v(B(O).dismiss), 9, gt)])
      ])) : w("", !0),
      s.value.generationActive ? (l(), n("div", mt, "故事正在继续，稍后就能发送消息。")) : w("", !0),
      C.value && !y.value || s.value.error ? (l(), n("p", ct, v(!y.value && C.value || s.value.error), 1)) : w("", !0),
      x.value ? (l(), n("div", yt, [e("span", null, v(x.value), 1), e("button", {
        disabled: d.value,
        onClick: t[3] || (t[3] = (m) => ae())
      }, "重新加载", 8, bt)])) : w("", !0),
      e("div", { class: W(["messages-layout", {
        "has-conversation": !!Z.value,
        "is-empty": !s.value.contacts.length
      }]) }, [E(Da, {
        contacts: s.value.contacts,
        "active-contact-id": r.value,
        "busy-contact-id": s.value.busy?.contactId ?? "",
        drafts: re,
        onSelect: Be,
        onAdd: t[4] || (t[4] = (m) => ne("add")),
        onSettings: t[5] || (t[5] = (m) => ne("settings"))
      }, null, 8, [
        "contacts",
        "active-contact-id",
        "busy-contact-id",
        "drafts"
      ]), Z.value ? (l(), ve(et, {
        key: Z.value.id,
        ref_key: "conversation",
        ref: T,
        draft: Ee.value,
        "onUpdate:draft": t[6] || (t[6] = (m) => Ee.value = m),
        "context-state": s.value,
        contact: Z.value,
        page: k.value,
        bridge: a.bridge,
        "chat-identity": s.value.chatIdentity,
        disabled: V.value,
        "send-disabled": V.value || !!le.value,
        busy: s.value.busy,
        outgoing: Oe.value,
        "send-failure": s.value.sendFailure,
        "send-error": X.value,
        working: o.value,
        "pending-save": ge.value,
        "retry-disabled": o.value || s.value.operationPending || !!s.value.busy || s.value.generationActive || s.value.fileState === "conflict",
        loading: d.value,
        "load-more": () => ae(!0),
        media: s.value.media,
        "waiting-for": Ge.value,
        onBack: be,
        onDetails: t[7] || (t[7] = (m) => ne("detail")),
        onSend: Ze,
        onRetry: je,
        onDiscard: Ke,
        onDeleteMessage: aa,
        onRegenerate: ta,
        onLatest: t[8] || (t[8] = (m) => ae(!1, !0))
      }, null, 8, [
        "draft",
        "context-state",
        "contact",
        "page",
        "bridge",
        "chat-identity",
        "disabled",
        "send-disabled",
        "busy",
        "outgoing",
        "send-failure",
        "send-error",
        "working",
        "pending-save",
        "retry-disabled",
        "loading",
        "load-more",
        "media",
        "waiting-for"
      ])) : (l(), n("div", ft, [E(N, { name: "message" }), e("p", null, v(B(st).chooseConversation), 1)]))], 2),
      c.value ? (l(), ve(_e, {
        key: 5,
        class: "messages-dialog",
        "aria-labelledby": "messages-dialog-title",
        busy: o.value && !y.value,
        onClose: Qe
      }, {
        default: Ue(() => [
          e("header", null, [
            g.value === "detail" && Z.value ? (l(), ve(ke, {
              key: 0,
              identity: Z.value.id,
              name: Z.value.name,
              small: ""
            }, null, 8, ["identity", "name"])) : w("", !0),
            e("h2", pt, v(g.value === "settings" ? "信息设置" : g.value === "add" ? "新的对话" : g.value === "detail" ? Z.value?.name : g.value === "delete" ? "删除联系人？" : g.value === "delete-message" ? "删除这条消息？" : g.value === "sync" ? B(O).title : g.value === "adopt" ? "使用已保存版本？" : "在当前位置补记？"), 1),
            e("button", {
              ref_key: "dialogClose",
              ref: S,
              class: "messages-icon-button",
              "aria-label": "关闭",
              disabled: o.value && !y.value,
              onClick: Re
            }, [E(N, { name: "close" })], 8, kt)
          ]),
          C.value || y.value && s.value.syncNotice.error ? (l(), n("p", $t, v(C.value || s.value.syncNotice.error), 1)) : w("", !0),
          g.value === "settings" ? (l(), n(R, { key: 1 }, [E(Pa, {
            settings: s.value.settings,
            busy: o.value || s.value.operationPending,
            onSave: Je
          }, null, 8, ["settings", "busy"]), D.value ? (l(), n("button", {
            key: 0,
            class: "messages-secondary messages-sync-entry",
            disabled: o.value,
            onClick: t[9] || (t[9] = (m) => ne("sync"))
          }, v(B(O).title) + " · " + v(D.value), 9, ht)) : w("", !0)], 64)) : g.value === "add" ? (l(), n(R, { key: 2 }, [
            e("label", wt, [E(N, { name: "search" }), Q(e("input", {
              "onUpdate:modelValue": t[10] || (t[10] = (m) => G.value = m),
              placeholder: "查找已知人物",
              "aria-label": "查找已知人物",
              "aria-describedby": "messages-people-source"
            }, null, 512), [[de, G.value]])]),
            t[22] || (t[22] = e("div", {
              id: "messages-people-source",
              class: "messages-subtle messages-people-source"
            }, "人物来自当前聊天的剧情总结，需要开启总结功能；找不到的人可以手动添加。", -1)),
            e("div", {
              class: "messages-known-list",
              "aria-busy": ee.value === "loading"
            }, [ee.value === "loading" ? (l(), n("p", It, "正在读取已知人物…")) : ee.value === "failed" ? (l(), n("div", St, [t[18] || (t[18] = e("p", {
              class: "messages-subtle",
              role: "alert"
            }, "已知人物暂时无法读取，可以重试或手动添加。", -1)), e("button", {
              class: "messages-secondary",
              disabled: o.value,
              onClick: De
            }, "重新加载", 8, Mt)])) : (l(), n(R, { key: 2 }, [(l(!0), n(R, null, me(xe.value, (m) => (l(), n("button", {
              key: m.name,
              disabled: V.value,
              onClick: (H) => Ne(m.name)
            }, [
              E(ke, {
                identity: m.name,
                name: m.name,
                small: ""
              }, null, 8, ["identity", "name"]),
              e("span", null, [ie(v(m.name), 1), m.aliases.length ? (l(), n("small", xt, v(m.aliases.join("、")), 1)) : w("", !0)]),
              E(N, { name: "plus" })
            ], 8, Et))), 128)), xe.value.length ? w("", !0) : (l(), n("p", Bt, v(G.value ? "没有匹配的人物，可以在下面手动添加。" : "暂无可添加的已知人物，可以在下面手动添加。"), 1))], 64))], 8, Ct),
            e("details", At, [t[21] || (t[21] = e("summary", null, "想联系的人不在这里？", -1)), e("form", { onSubmit: t[13] || (t[13] = ce((m) => Ne(), ["prevent"])) }, [
              e("label", null, [t[19] || (t[19] = ie("姓名", -1)), Q(e("input", {
                "onUpdate:modelValue": t[11] || (t[11] = (m) => f.value = m),
                maxlength: "120",
                required: "",
                placeholder: "对方的姓名"
              }, null, 512), [[de, f.value]])]),
              e("label", null, [t[20] || (t[20] = ie("身份说明（可选）", -1)), Q(e("textarea", {
                "onUpdate:modelValue": t[12] || (t[12] = (m) => q.value = m),
                maxlength: "600",
                rows: "2",
                placeholder: "例如：住在隔壁的花店老板"
              }, null, 512), [[de, q.value]])]),
              e("button", {
                class: "messages-primary",
                disabled: V.value || ee.value === "loading" || !f.value.trim()
              }, "添加并聊天", 8, Tt)
            ], 32)])
          ], 64)) : g.value === "detail" ? (l(), n("form", {
            key: 3,
            onSubmit: ce(We, ["prevent"])
          }, [
            e("label", null, [t[23] || (t[23] = ie("身份说明 / 备注", -1)), Q(e("textarea", {
              "onUpdate:modelValue": t[14] || (t[14] = (m) => q.value = m),
              maxlength: "600",
              rows: "3",
              placeholder: "帮助辨认这位联系人"
            }, null, 512), [[de, q.value]])]),
            e("button", {
              class: "messages-primary",
              disabled: V.value
            }, "保存备注", 8, Dt),
            e("button", {
              type: "button",
              class: "messages-danger",
              disabled: V.value,
              onClick: t[15] || (t[15] = (m) => g.value = "delete")
            }, "删除联系人与通讯记录", 8, Rt)
          ], 32)) : g.value === "delete" ? (l(), n(R, { key: 4 }, [
            i.value ? (l(), n("p", Nt, v(i.value), 1)) : (l(), n("p", qt, "删除与 " + v(Z.value?.name) + " 的全部通讯和摘要，同时更新主聊天记录。其他联系人和图库文件保留，删除后不能恢复。", 1)),
            e("button", {
              class: "messages-danger",
              disabled: V.value || !!i.value,
              onClick: ea
            }, "确认删除", 8, Lt),
            e("button", {
              class: "messages-secondary",
              onClick: t[16] || (t[16] = (m) => g.value = "detail")
            }, "保留联系人")
          ], 64)) : g.value === "delete-message" ? (l(), n(R, { key: 5 }, [
            i.value ? (l(), n("p", Pt, v(i.value), 1)) : (l(), n("p", Ut, "删除这条消息，同时更新主聊天记录。后续回复、其他消息和图库文件保留，删除后不能恢复。")),
            e("button", {
              class: "messages-danger",
              disabled: V.value || !!i.value,
              onClick: sa
            }, "确认删除", 8, Ft),
            e("button", {
              class: "messages-secondary",
              onClick: z
            }, "取消")
          ], 64)) : g.value === "sync" ? (l(), n(R, { key: 6 }, [
            e("p", null, v(B(O).pending(D.value)), 1),
            e("p", null, v(B(O).description), 1),
            e("button", {
              class: "messages-primary",
              disabled: V.value || M.value,
              onClick: Xe
            }, v(B(O).retry), 9, Vt),
            s.value.settings.syncNoticeEnabled ? (l(), n("button", {
              key: 0,
              class: "messages-secondary",
              disabled: I.value,
              onClick: Te
            }, v(B(O).dismiss), 9, zt)) : w("", !0),
            e("details", _t, [
              t[24] || (t[24] = e("summary", null, "原来的记录已被修改或删除？", -1)),
              t[25] || (t[25] = e("p", null, "不会覆盖你的修改。需要这些消息继续进入剧情时，可以在当前位置另加一条补记。", -1)),
              e("button", {
                class: "messages-secondary",
                disabled: V.value,
                onClick: t[17] || (t[17] = (m) => g.value = "recover")
              }, "查看补记方式", 8, Ot)
            ])
          ], 64)) : g.value === "adopt" ? (l(), n(R, { key: 7 }, [
            t[26] || (t[26] = e("p", null, "将读取服务器上的当前聊天小白 OS 存档，放弃本地尚未确认的修改。信息 APP 会显示服务器已保存的联系人和消息。", -1)),
            t[27] || (t[27] = e("p", { class: "messages-subtle" }, "这项选择作用于当前聊天的整份 OS 存档，不会删除主聊天里的记录，也不会重新生成回复。", -1)),
            e("button", {
              class: "messages-danger",
              disabled: o.value || !!s.value.busy || s.value.generationActive,
              onClick: na
            }, "确认使用已保存版本", 8, Gt),
            e("button", {
              class: "messages-secondary",
              disabled: o.value,
              onClick: z
            }, "暂不处理", 8, Ht)
          ], 64)) : (l(), n(R, { key: 8 }, [
            t[28] || (t[28] = e("p", null, "先检查已有记录；仍未写入的消息会在主聊天当前位置标为「补录」，保留原发送时间。不会覆盖旧记录或恢复你删除的那一条。", -1)),
            e("button", {
              class: "messages-primary",
              disabled: V.value,
              onClick: la
            }, "确认补记", 8, Zt),
            e("button", {
              class: "messages-secondary",
              disabled: o.value,
              onClick: z
            }, "暂不补记", 8, jt)
          ], 64))
        ]),
        _: 1
      }, 8, ["busy"])) : w("", !0)
    ]));
  }
}), Wt = Kt;
export {
  Wt as default
};
