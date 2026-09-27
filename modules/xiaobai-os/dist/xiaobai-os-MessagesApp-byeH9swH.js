/* eslint-disable */
import { $ as te, E as we, F as l, G as j, H as he, J as qe, K as na, L as be, M as ia, N as Ie, O as ua, P as oa, Q as G, V as Le, W as Pe, Y as $, _ as n, b as x, c as Fe, et as Ce, g as I, h as oe, i as ke, k as ra, l as ve, m as e, o as ue, p as A, s as da, tt as g, u as T, w as ce, x as K, y as le } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { n as Ue } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
import { t as va } from "./xiaobai-os-context-tokens-bfmDTbG3.js";
import { t as Ve } from "./xiaobai-os-AppDialog-CaAiivYL.js";
var ga = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.8",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
}, ma = ["d"], ca = /* @__PURE__ */ K({
  __name: "MessageIcon",
  props: { name: {} },
  setup(a) {
    const w = {
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
    return (s, f) => (l(), n("svg", ga, [e("path", { d: w[a.name] }, null, 8, ma)]));
  }
}), N = ca, ya = /* @__PURE__ */ K({
  __name: "ContactAvatar",
  props: {
    identity: {},
    name: {},
    small: { type: Boolean }
  },
  setup(a) {
    const w = a, s = A(() => {
      let f = 0;
      for (const d of w.identity) f = Math.imul(f, 31) + d.codePointAt(0) | 0;
      return String((f >>> 0) % 360);
    });
    return (f, d) => (l(), n("span", {
      class: te(["messages-avatar", { small: a.small }]),
      style: Ce({ "--avatar-hue": s.value }),
      "aria-hidden": "true"
    }, g(Array.from(a.name)[0]), 7));
  }
}), ye = ya, ba = { class: "messages-contacts" }, fa = { class: "messages-home-header" }, pa = { class: "messages-home-actions" }, ka = { class: "messages-search" }, $a = {
  key: 0,
  class: "messages-empty"
}, wa = {
  key: 1,
  class: "messages-contact-rows"
}, ha = {
  key: 0,
  class: "messages-subtle"
}, Ia = ["onClick"], Ca = { class: "messages-contact-copy" }, Ma = { class: "messages-contact-heading" }, Sa = {
  key: 0,
  class: "messages-preview messages-preview-active"
}, Ea = {
  key: 1,
  class: "messages-preview"
}, Ba = {
  key: 2,
  class: "messages-preview"
}, xa = /* @__PURE__ */ K({
  __name: "ContactList",
  props: {
    contacts: {},
    busyContactId: {},
    drafts: {}
  },
  emits: [
    "select",
    "add",
    "settings"
  ],
  setup(a) {
    const w = a, s = $(""), f = A(() => w.contacts.filter((b) => `${b.name} ${b.note}`.toLocaleLowerCase().includes(s.value.toLocaleLowerCase())));
    function d(b) {
      if (b === null) return "";
      const r = new Date(b);
      return r.toDateString() === (/* @__PURE__ */ new Date()).toDateString() ? r.toLocaleTimeString(void 0, {
        hour: "2-digit",
        minute: "2-digit"
      }) : r.toLocaleDateString(void 0, {
        month: "numeric",
        day: "numeric"
      });
    }
    return (b, r) => (l(), n("section", ba, [
      e("header", fa, [r[4] || (r[4] = e("h1", null, "信息", -1)), e("div", pa, [e("button", {
        class: "messages-icon-button",
        title: "设置",
        "aria-label": "设置",
        onClick: r[0] || (r[0] = (o) => b.$emit("settings"))
      }, [x(N, { name: "settings" })]), e("button", {
        class: "messages-icon-button messages-add-contact",
        "aria-label": "添加联系人",
        onClick: r[1] || (r[1] = (o) => b.$emit("add"))
      }, [x(N, { name: "plus" })])])]),
      e("label", ka, [x(N, { name: "search" }), j(e("input", {
        "onUpdate:modelValue": r[2] || (r[2] = (o) => s.value = o),
        type: "search",
        placeholder: "搜索联系人",
        "aria-label": "搜索联系人"
      }, null, 512), [[ue, s.value]])]),
      a.contacts.length ? (l(), n("div", wa, [f.value.length ? I("", !0) : (l(), n("p", ha, "没有找到这个人。")), (l(!0), n(T, null, be(f.value, (o) => (l(), n("button", {
        key: o.id,
        class: "messages-contact-row",
        onClick: (E) => b.$emit("select", o.id)
      }, [x(ye, {
        identity: o.id,
        name: o.name
      }, null, 8, ["identity", "name"]), e("span", Ca, [e("span", Ma, [e("strong", null, g(o.name), 1), e("time", null, g(d(o.lastAt)), 1)]), a.busyContactId === o.id ? (l(), n("span", Sa, "正在等待回复…")) : a.drafts.get(o.id)?.text.trim() || a.drafts.get(o.id)?.image ? (l(), n("span", Ea, [r[7] || (r[7] = e("em", null, "草稿", -1)), le(" " + g(a.drafts.get(o.id)?.image ? "［图片］" : "") + g(a.drafts.get(o.id)?.text), 1)])) : (l(), n("span", Ba, g(o.preview), 1))])], 8, Ia))), 128))])) : (l(), n("div", $a, [
        x(N, { name: "message" }),
        r[6] || (r[6] = e("h2", null, "暂无联系人", -1)),
        e("button", {
          class: "messages-primary",
          onClick: r[3] || (r[3] = (o) => b.$emit("add"))
        }, [r[5] || (r[5] = le("添加联系人", -1)), x(N, { name: "plus" })])
      ]))
    ]));
  }
}), Aa = xa, V = {
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
}, Da = ["disabled"], Ta = ["disabled"], Na = ["disabled"], Ra = /* @__PURE__ */ K({
  __name: "MessagesSettings",
  props: {
    settings: {},
    busy: { type: Boolean }
  },
  emits: ["save"],
  setup(a, { emit: w }) {
    const s = a, f = w, d = qe({ ...s.settings });
    return (b, r) => (l(), n("form", {
      class: "messages-settings",
      onSubmit: r[3] || (r[3] = ve((o) => f("save", { ...d }), ["prevent"]))
    }, [
      e("fieldset", { disabled: a.busy }, [
        r[6] || (r[6] = e("legend", null, "对方的回复", -1)),
        e("label", null, [r[4] || (r[4] = e("span", null, "允许对方发图片", -1)), j(e("input", {
          "onUpdate:modelValue": r[0] || (r[0] = (o) => d.imagePrompt = o),
          type: "checkbox"
        }, null, 512), [[ke, d.imagePrompt]])]),
        e("label", null, [r[5] || (r[5] = e("span", null, "允许对方发语音", -1)), j(e("input", {
          "onUpdate:modelValue": r[1] || (r[1] = (o) => d.voicePrompt = o),
          type: "checkbox"
        }, null, 512), [[ke, d.voicePrompt]])])
      ], 8, Da),
      e("fieldset", { disabled: a.busy }, [e("legend", null, g(G(V).title), 1), e("label", null, [e("span", null, g(G(V).setting), 1), j(e("input", {
        "onUpdate:modelValue": r[2] || (r[2] = (o) => d.syncNoticeEnabled = o),
        type: "checkbox"
      }, null, 512), [[ke, d.syncNoticeEnabled]])])], 8, Ta),
      e("button", {
        type: "submit",
        class: "messages-primary",
        disabled: a.busy
      }, g(a.busy ? "请稍候…" : "保存设置"), 9, Na)
    ], 32));
  }
}), qa = Ra, La = ["src", "alt"], Pa = {
  key: 2,
  class: "messages-image-placeholder",
  role: "status",
  "aria-live": "polite"
}, Fa = {
  key: 4,
  class: "messages-image-placeholder messages-media-unavailable"
}, Ua = {
  key: 5,
  class: "messages-image-caption"
}, Va = {
  key: 6,
  class: "messages-media-error",
  role: "status"
}, za = ["src", "alt"], Ga = /* @__PURE__ */ K({
  __name: "MessageImage",
  props: {
    message: {},
    bridge: {},
    chatIdentity: {},
    available: { type: Boolean }
  },
  emits: ["resize"],
  setup(a, { emit: w }) {
    const s = a, f = w, d = $(null), b = $(!1), r = $(""), o = $(""), E = $(""), h = $(""), C = $(!1), S = $(!1), D = A(() => s.message.payload.type === "image" ? s.message.payload.attachment : void 0), p = A(() => s.message.payload.type === "image" ? s.message.payload.description : ""), i = A(() => D.value?.path || r.value);
    let k = null;
    function m() {
      const B = h.value;
      h.value = "", B && s.bridge.post("messages/image/cancel", {
        chatIdentity: s.chatIdentity,
        mediaRequestId: B
      });
    }
    async function c() {
      if (h.value) return;
      if (i.value) {
        C.value = !1;
        return;
      }
      if (!s.available) return;
      const B = `image-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      h.value = B, o.value = "", E.value = "正在读取图片…";
      try {
        const { result: y } = await s.bridge.request("messages/image/generate", {
          chatIdentity: s.chatIdentity,
          messageId: s.message.id,
          mediaRequestId: B
        }, 18e4);
        if (h.value !== B) return;
        if (!y.data) throw new Error("画图暂不可用，请开启画图后重试。");
        r.value = y.data, C.value = !1;
      } catch (y) {
        if (h.value !== B) return;
        const q = y instanceof Error ? y.message : "";
        o.value = q === "host_request_timeout" ? "等待图片超过3分钟，已取消本次请求，可重试。" : q || "图片加载失败，请重试。", m();
      } finally {
        h.value === B && (h.value = "");
      }
    }
    const M = s.bridge.subscribe((B) => {
      if (B.type !== "messages/image-progress") return;
      const y = B.payload;
      if (!(!h.value || y.mediaRequestId !== h.value))
        if (y.status === "queued") {
          const q = Math.max(0, Number(y.ahead) || 0);
          E.value = q ? `排队中，前方 ${q} 张` : "已进入图片队列";
        } else y.status === "generating" ? E.value = "正在生成图片…" : y.status === "cooldown" && (E.value = y.delay ? `等待 ${Math.ceil(y.delay / 1e3)} 秒后继续` : "等待继续生成…");
    });
    return ia(() => {
      if (!D.value) {
        if (typeof IntersectionObserver > "u") {
          b.value = !0;
          return;
        }
        k = new IntersectionObserver((B) => {
          b.value = B.some((y) => y.isIntersecting);
        }, { root: d.value?.closest(".messages-thread-scroll") ?? null }), d.value && k.observe(d.value);
      }
    }), he([b, () => s.available], ([B, y]) => {
      B && y && !i.value && !o.value && c();
    }), ua(() => {
      k?.disconnect(), M(), m();
    }), (B, y) => (l(), n("div", {
      ref_key: "root",
      ref: d
    }, [
      i.value && !C.value ? (l(), n("button", {
        key: 0,
        class: "messages-image-open",
        "aria-label": "放大图片",
        onClick: y[2] || (y[2] = (q) => S.value = !0)
      }, [e("img", {
        src: i.value,
        alt: p.value || D.value?.name || "图片",
        onLoad: y[0] || (y[0] = (q) => f("resize")),
        onError: y[1] || (y[1] = (q) => C.value = !0)
      }, null, 40, La)])) : C.value ? (l(), n("button", {
        key: 1,
        class: "messages-image-placeholder",
        onClick: c
      }, [
        x(N, { name: "image" }),
        y[5] || (y[5] = e("span", null, "图片暂时无法显示", -1)),
        y[6] || (y[6] = e("small", null, "点击重新加载", -1))
      ])) : h.value ? (l(), n("div", Pa, [x(N, { name: "image" }), e("span", null, g(E.value), 1)])) : a.available ? (l(), n("button", {
        key: 3,
        class: "messages-image-placeholder",
        onClick: c
      }, [x(N, { name: "image" }), e("span", null, g(o.value ? "重试加载图片" : "图片"), 1)])) : (l(), n("div", Fa, [
        x(N, { name: "image" }),
        y[7] || (y[7] = e("span", null, "图片描述", -1)),
        y[8] || (y[8] = e("small", null, "开启画图后自动加载", -1))
      ])),
      p.value ? (l(), n("p", Ua, g(p.value), 1)) : I("", !0),
      o.value ? (l(), n("small", Va, g(o.value), 1)) : I("", !0),
      S.value ? (l(), oe(Ve, {
        key: 7,
        class: "messages-image-viewer",
        "aria-label": "查看图片",
        onClose: y[4] || (y[4] = (q) => S.value = !1)
      }, {
        default: Pe(() => [e("button", {
          "aria-label": "关闭图片",
          onClick: y[3] || (y[3] = (q) => S.value = !1)
        }, [x(N, { name: "close" })]), i.value ? (l(), n("img", {
          key: 0,
          src: i.value,
          alt: p.value || D.value?.name || "图片"
        }, null, 8, za)) : I("", !0)]),
        _: 1
      })) : I("", !0)
    ], 512));
  }
}), Oa = Ga, Ha = ["data-message-id"], Ka = {
  class: "messages-bubble-actions",
  role: "group",
  "aria-label": "消息操作"
}, Za = ["disabled", "title"], ja = ["disabled"], Ya = { key: 0 }, Ja = ["disabled", "aria-label"], Wa = {
  key: 0,
  class: "messages-media-unavailable-note"
}, Xa = {
  key: 2,
  class: "messages-transcript"
}, Qa = {
  key: 3,
  class: "messages-media-error",
  role: "status"
}, _a = /* @__PURE__ */ K({
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
  setup(a, { emit: w }) {
    const s = a, f = w;
    function d(i) {
      i.target.closest("button, a, dialog") || window.getSelection()?.toString() || f("select", s.message.id);
    }
    const b = $(""), r = $(""), o = $(!1), E = A(() => [
      "playing",
      "loading",
      "generating",
      "queued"
    ].includes(r.value)), h = $(!1);
    let C = !0;
    const S = (i) => s.bridge.request(i, {
      chatIdentity: s.chatIdentity,
      messageId: s.message.id
    }, 18e4);
    async function D() {
      if (h.value) return;
      b.value = "";
      const i = E.value;
      if (!(!i && !s.media.voice))
        try {
          i ? (h.value = !0, await S("messages/voice/stop"), C && (r.value = "")) : (r.value = "loading", await S("messages/voice/play"));
        } catch {
          C && (i || (r.value = ""), b.value = i ? "未能确认停止，请再点一次停止。" : "语音暂时无法播放，原文仍可查看。");
        } finally {
          C && (h.value = !1);
        }
    }
    const p = s.bridge.subscribe((i) => {
      if (i.type !== "messages/voice-state") return;
      const k = i.payload;
      k.messageId === s.message.id ? r.value = k.status : k.status === "playing" && (r.value = ""), k.messageId === s.message.id && k.status === "error" && (b.value = "播放失败，点击可以重试。");
    });
    return Ie(() => {
      C = !1, p(), E.value && S("messages/voice/stop").catch(() => {
      });
    }), (i, k) => (l(), n("article", {
      class: te(["messages-bubble-row", {
        outgoing: a.message.sender === "user",
        "actions-selected": a.selected
      }]),
      "data-message-id": a.message.id,
      tabindex: "0",
      "aria-label": "消息操作",
      onClick: d,
      onFocus: k[4] || (k[4] = (m) => f("select", a.message.id))
    }, [e("div", Ka, [e("button", {
      disabled: a.disabled,
      title: a.permission?.reason,
      class: te({ "is-unavailable": a.permission?.reason }),
      "aria-haspopup": "dialog",
      onClick: k[0] || (k[0] = (m) => i.$emit("deleteMessage", a.message.id))
    }, "删除", 10, Za), a.permission?.regenerate ? (l(), n("button", {
      key: 0,
      disabled: a.disabled,
      onClick: k[1] || (k[1] = (m) => i.$emit("regenerate", a.message.id))
    }, "重新回复", 8, ja)) : I("", !0)]), e("div", { class: te(["messages-bubble", `messages-bubble-${a.message.payload.type}`]) }, [a.message.payload.type === "text" ? (l(), n("p", Ya, g(a.message.payload.text), 1)) : a.message.payload.type === "image" ? (l(), oe(Oa, {
      key: 1,
      message: a.message,
      bridge: a.bridge,
      "chat-identity": a.chatIdentity,
      available: a.media.image,
      onResize: k[2] || (k[2] = (m) => i.$emit("resize"))
    }, null, 8, [
      "message",
      "bridge",
      "chat-identity",
      "available"
    ])) : (l(), n(T, { key: 2 }, [
      e("button", {
        class: "messages-voice-button",
        disabled: h.value || !a.media.voice && !E.value,
        "aria-label": E.value ? "停止播放" : "播放语音",
        onClick: D
      }, [
        x(N, { name: E.value ? "stop" : "play" }, null, 8, ["name"]),
        e("span", { class: te(["messages-wave", { playing: r.value === "playing" }]) }, [(l(), n(T, null, be(16, (m) => e("i", {
          key: m,
          style: Ce({
            height: `${8 + m * 7 % 17}px`,
            animationDelay: `${m * 45}ms`
          })
        }, null, 4)), 64))], 2),
        e("small", null, g(h.value ? "停止中" : [
          "loading",
          "generating",
          "queued"
        ].includes(r.value) ? "准备中" : "语音"), 1)
      ], 8, Ja),
      a.media.voice ? I("", !0) : (l(), n("small", Wa, "开启 TTS 后可播放")),
      a.media.voice ? (l(), n("button", {
        key: 1,
        class: "messages-transcript-toggle",
        onClick: k[3] || (k[3] = (m) => o.value = !o.value)
      }, g(o.value ? "收起原文" : "查看原文"), 1)) : I("", !0),
      o.value || !a.media.voice ? (l(), n("p", Xa, g(a.message.payload.transcript), 1)) : I("", !0)
    ], 64)), b.value ? (l(), n("small", Qa, g(b.value), 1)) : I("", !0)], 2)], 42, Ha));
  }
}), es = _a, as = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
], Ut = 4 * 1024 * 1024;
async function ss(a) {
  if (!as.includes(a.type)) throw new Error("请选择 PNG、JPG、WEBP 或 GIF 图片。");
  if (!a.size || a.size > 4194304) throw new Error("请选择不超过 4MB 的图片。");
  const w = await new Promise((f, d) => {
    const b = new FileReader();
    b.onerror = () => d(/* @__PURE__ */ new Error("图片读取失败，请重新选择。")), b.onload = () => typeof b.result == "string" ? f(b.result) : d(/* @__PURE__ */ new Error("图片读取失败。")), b.readAsDataURL(a);
  }), s = new Image();
  s.src = w;
  try {
    await s.decode();
  } catch {
    throw new Error("这张图片无法打开，请换一张。");
  }
  return {
    dataUrl: w,
    name: a.name.replace(/[\u0000-\u001f\u007f]/gu, "").trim().slice(0, 120) || "图片"
  };
}
var ts = {
  key: 0,
  class: "messages-attachment-preview"
}, ls = ["src", "alt"], ns = ["disabled"], is = {
  key: 1,
  class: "messages-composer-hint"
}, us = {
  key: 2,
  class: "messages-composer-hint",
  role: "status"
}, os = {
  key: 3,
  class: "messages-composer-wait",
  role: "status"
}, rs = { class: "messages-composer-line" }, ds = ["disabled"], vs = ["placeholder", "disabled"], gs = ["disabled"], ms = /* @__PURE__ */ K({
  __name: "MessageComposer",
  props: /* @__PURE__ */ ce({
    disabled: { type: Boolean },
    sending: { type: Boolean },
    waitingFor: {}
  }, {
    draft: { required: !0 },
    draftModifiers: {}
  }),
  emits: /* @__PURE__ */ ce(["send"], ["update:draft"]),
  setup(a, { emit: w }) {
    const s = a, f = w, d = Le(a, "draft"), b = A({
      get: () => d.value.text,
      set: (i) => {
        d.value = {
          ...d.value,
          text: i
        };
      }
    }), r = $(null), o = $(!1), E = $("");
    let h = !0;
    async function C(i) {
      const k = i.target, m = k.files?.[0];
      if (k.value = "", !(!m || s.sending || o.value)) {
        o.value = !0, E.value = "";
        try {
          const c = await ss(m);
          h && (d.value = {
            ...d.value,
            image: c
          });
        } catch (c) {
          h && (E.value = c instanceof Error ? c.message : "图片读取失败，请重新选择。");
        } finally {
          h && (o.value = !1);
        }
      }
    }
    function S() {
      d.value = {
        ...d.value,
        image: null
      }, E.value = "";
    }
    function D() {
      const i = b.value.trim();
      !i && !d.value.image || s.disabled || o.value || f("send", d.value.image ? {
        type: "image",
        description: i,
        upload: { ...d.value.image }
      } : {
        type: "text",
        text: i
      });
    }
    Ie(() => {
      h = !1;
    });
    function p(i) {
      i.key === "Enter" && (i.ctrlKey || i.metaKey) && !i.isComposing && (i.preventDefault(), D());
    }
    return (i, k) => (l(), n("form", {
      class: "messages-composer",
      onSubmit: ve(D, ["prevent"])
    }, [
      e("input", {
        ref_key: "fileInput",
        ref: r,
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/gif",
        hidden: "",
        "aria-label": "选择图片文件",
        onChange: C
      }, null, 544),
      d.value.image ? (l(), n("div", ts, [
        e("img", {
          src: d.value.image.dataUrl,
          alt: d.value.image.name
        }, null, 8, ls),
        e("span", null, [k[2] || (k[2] = e("strong", null, "待发送的图片", -1)), e("small", null, g(d.value.image.name), 1)]),
        e("button", {
          type: "button",
          class: "messages-icon-button",
          "aria-label": "移除图片",
          disabled: a.sending || o.value,
          onClick: S
        }, [x(N, { name: "close" })], 8, ns)
      ])) : I("", !0),
      d.value.image ? (l(), n("p", is, "图片将随消息发送，需要当前模型支持看图。")) : I("", !0),
      o.value || E.value ? (l(), n("p", us, g(o.value ? "正在读取图片…" : E.value), 1)) : I("", !0),
      a.waitingFor ? (l(), n("p", os, "正在等待 " + g(a.waitingFor) + " 的回复。可以先写好，稍后发送。", 1)) : I("", !0),
      e("div", rs, [
        e("button", {
          type: "button",
          class: "messages-icon-button messages-attach",
          "aria-label": "选择图片",
          disabled: a.sending || o.value,
          onClick: k[0] || (k[0] = (m) => r.value?.click())
        }, [x(N, { name: "plus" })], 8, ds),
        j(e("textarea", {
          "onUpdate:modelValue": k[1] || (k[1] = (m) => b.value = m),
          rows: "1",
          maxlength: "4000",
          placeholder: d.value.image ? "给图片配句话…" : "说点什么…",
          "aria-label": "消息内容",
          disabled: a.sending,
          onKeydown: p
        }, null, 40, vs), [[ue, b.value]]),
        e("button", {
          class: "messages-send",
          type: "submit",
          disabled: a.disabled || o.value || !b.value.trim() && !d.value.image,
          "aria-label": "发送"
        }, [x(N, { name: "send" })], 8, gs)
      ])
    ], 32));
  }
}), cs = ms, ys = {
  class: "messages-delivery",
  role: "status"
}, bs = { key: 0 }, fs = ["disabled"], ps = ["disabled"], ks = /* @__PURE__ */ K({
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
    return (w, s) => (l(), n("div", ys, [a.sending ? (l(), n("span", bs, "发送中…")) : (l(), n(T, { key: 1 }, [
      e("span", null, g(a.error || (a.pendingSave ? "还不确定是否保存成功" : "尚未收到回复")), 1),
      e("button", {
        disabled: a.disabled,
        onClick: s[0] || (s[0] = (f) => w.$emit("retry"))
      }, g(a.pendingSave ? "检查并重试" : "重试"), 9, fs),
      a.discard && !a.pendingSave ? (l(), n("button", {
        key: 0,
        disabled: a.disabled,
        onClick: s[1] || (s[1] = (f) => w.$emit("discard"))
      }, "删除", 8, ps)) : I("", !0)
    ], 64))]));
  }
}), Ne = ks, $s = 158e3, ws = 128e3, Re = 6e3;
function hs(a) {
  return String(a ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/{/g, "&#123;").replace(/}/g, "&#125;");
}
var Is = ["aria-label", "aria-expanded"], Cs = {
  key: 0,
  class: "messages-context-popover",
  "aria-label": "上下文用量"
}, Ms = { class: "messages-context-total" }, Ss = {
  key: 1,
  role: "status"
}, Es = { key: 3 }, Bs = /* @__PURE__ */ K({
  __name: "MessageContextButton",
  props: {
    bridge: {},
    state: {},
    contactId: {},
    draft: {}
  },
  setup(a) {
    const w = a, s = $(!1), f = $(!1), d = $(!1), b = $(0), r = $(null);
    Ue(() => (s.value = !1, !0), () => s.value), he(() => JSON.stringify([
      w.contactId,
      w.state.chatIdentity,
      w.state.revision,
      w.state.boundary,
      w.state.settings.imagePrompt,
      w.state.settings.voicePrompt,
      !!w.state.busy,
      w.state.generationActive,
      b.value
    ]), async (D, p, i) => {
      let k = !0;
      if (i(() => {
        k = !1;
      }), f.value = !0, d.value = !1, w.state.busy || w.state.generationActive) return;
      const m = w.state.revision, c = w.state.boundary;
      try {
        const M = await w.bridge.request("messages/context", {
          chatIdentity: w.state.chatIdentity,
          contactId: w.contactId
        }, 6e4);
        if (!k) return;
        if (M.result.revision !== m || M.result.boundary !== c) throw new Error("stale");
        r.value = M.result.stats;
      } catch {
        k && (d.value = !0, r.value = null);
      } finally {
        k && (f.value = !1);
      }
    }, { immediate: !0 });
    const o = A(() => va(hs(w.draft.text))), E = A(() => (r.value?.imageTokens ?? 0) + (w.draft.image ? Re : 0)), h = A(() => (r.value?.usedTokens ?? 0) + o.value + (w.draft.image ? Re : 0)), C = A(() => Math.min(1, h.value / $s)), S = (D) => `${(D / 1e3).toFixed(1)}k`;
    return (D, p) => (l(), n("div", {
      class: "messages-context",
      onKeydown: p[3] || (p[3] = Fe(ve((i) => s.value = !1, ["stop"]), ["esc"]))
    }, [e("button", {
      type: "button",
      class: te(["messages-context-ring", { "is-warning": h.value >= G(ws) }]),
      style: Ce({ "--context-fill": `${r.value ? C.value * 360 : 0}deg` }),
      "aria-label": r.value ? `上下文：约 ${S(h.value)} / 158k` : "上下文用量",
      "aria-expanded": s.value,
      title: "上下文",
      onClick: p[0] || (p[0] = (i) => s.value = !s.value)
    }, [e("span", null, g(f.value ? "…" : d.value || !r.value ? "—" : ""), 1)], 14, Is), s.value ? (l(), n("section", Cs, [
      e("header", null, [p[4] || (p[4] = e("strong", null, "上下文", -1)), e("button", {
        type: "button",
        "aria-label": "关闭上下文用量",
        onClick: p[1] || (p[1] = (i) => s.value = !1)
      }, "×")]),
      r.value ? (l(), n(T, { key: 0 }, [e("p", Ms, "约 " + g(S(h.value)) + " / 158k", 1), e("dl", null, [
        p[6] || (p[6] = e("dt", null, "剧情与设定", -1)),
        e("dd", null, g(S(r.value.backgroundTokens)), 1),
        p[7] || (p[7] = e("dt", null, "通讯摘要", -1)),
        e("dd", null, g(S(r.value.summaryTokens)), 1),
        p[8] || (p[8] = e("dt", null, "通讯原文", -1)),
        e("dd", null, g(S(r.value.historyTokens)), 1),
        p[9] || (p[9] = e("dt", null, "提示词与输入", -1)),
        e("dd", null, g(S(r.value.promptTokens + o.value)), 1),
        E.value ? (l(), n(T, { key: 0 }, [p[5] || (p[5] = e("dt", null, "图片预留", -1)), e("dd", null, g(S(E.value)), 1)], 64)) : I("", !0)
      ])], 64)) : I("", !0),
      f.value ? (l(), n("p", Ss, g(a.state.busy?.stage === "summarizing" ? "正在总结较早通讯…" : a.state.busy || a.state.generationActive ? "本轮结束后更新用量。" : "正在读取…"), 1)) : d.value ? (l(), n(T, { key: 2 }, [p[10] || (p[10] = e("p", { role: "status" }, "用量暂时无法读取。", -1)), e("button", {
        type: "button",
        class: "messages-secondary",
        onClick: p[2] || (p[2] = (i) => b.value++)
      }, "重试")], 64)) : I("", !0),
      p[11] || (p[11] = e("p", null, "128k 时在下次回复前自动总结，保留近期原文。", -1)),
      E.value ? (l(), n("small", Es, "图片按每张 6k 预留，实际用量由模型决定。")) : I("", !0)
    ])) : I("", !0)], 32));
  }
}), xs = Bs, As = { class: "messages-conversation" }, Ds = { class: "messages-thread-header" }, Ts = { class: "messages-thread-heading" }, Ns = ["disabled"], Rs = {
  key: 1,
  class: "messages-thread-start"
}, qs = {
  key: 0,
  class: "messages-time"
}, Ls = { class: "messages-bubble-row outgoing" }, Ps = { key: 0 }, Fs = ["src", "alt"], Us = {
  key: 0,
  class: "messages-image-caption"
}, Vs = {
  key: 3,
  class: "messages-typing",
  role: "status"
}, zs = /* @__PURE__ */ K({
  __name: "Conversation",
  props: /* @__PURE__ */ ce({
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
  emits: /* @__PURE__ */ ce([
    "back",
    "details",
    "send",
    "retry",
    "discard",
    "deleteMessage",
    "regenerate",
    "latest"
  ], ["update:draft"]),
  setup(a, { expose: w }) {
    const s = Le(a, "draft"), f = a, d = $("");
    function b(m) {
      m.target.closest(".messages-bubble-row") || (d.value = "");
    }
    const r = A(() => f.busy?.contactId === f.contact.id ? f.busy.stage : ""), o = A(() => [
      "replying",
      "summarizing",
      "saving-reply"
    ].includes(r.value));
    function E(m) {
      return [f.sendFailure, f.sendError].find((c) => c?.contactId === f.contact.id && c.messageId === m)?.message;
    }
    const h = $(null);
    let C = !0, S = !1, D = null;
    ra(() => {
      D = null;
      const m = h.value;
      if (!m || C && !S && !f.page.hasNewer) return;
      const c = new Set(f.page.messages.map((B) => B.id)), M = [...m.querySelectorAll("[data-message-id]")].find((B) => c.has(B.dataset.messageId) && B.getBoundingClientRect().bottom > m.getBoundingClientRect().top);
      M && (D = {
        id: M.dataset.messageId,
        offset: M.getBoundingClientRect().top - m.getBoundingClientRect().top
      });
    }), oa(() => {
      const m = h.value;
      if (m)
        if (D) {
          const c = [...m.querySelectorAll("[data-message-id]")].find((M) => M.dataset.messageId === D.id);
          c && (m.scrollTop += c.getBoundingClientRect().top - m.getBoundingClientRect().top - D.offset), D = null;
        } else C && !S && !f.page.hasNewer && (m.scrollTop = m.scrollHeight);
    });
    function p() {
      const m = h.value;
      m && (C = m.scrollHeight - m.clientHeight - m.scrollTop < 70);
    }
    async function i() {
      await we(), C && !S && !f.page.hasNewer && h.value && (h.value.scrollTop = h.value.scrollHeight);
    }
    he(() => [
      f.page.messages.at(-1)?.id,
      f.outgoing?.messageId,
      r.value,
      f.sendFailure,
      f.sendError
    ], i, { immediate: !0 });
    async function k() {
      if (!(!h.value || S)) {
        S = !0;
        try {
          await f.loadMore(), await we();
        } finally {
          S = !1, p();
        }
      }
    }
    return w({ sent() {
      C = !0, i();
    } }), (m, c) => (l(), n("section", As, [
      e("header", Ds, [
        e("button", {
          class: "messages-icon-button",
          "aria-label": "返回信息",
          onClick: c[0] || (c[0] = (M) => m.$emit("back"))
        }, [x(N, { name: "back" })]),
        x(ye, {
          identity: a.contact.id,
          name: a.contact.name,
          small: ""
        }, null, 8, ["identity", "name"]),
        e("div", Ts, [e("h2", null, g(a.contact.name), 1)]),
        x(xs, {
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
          "aria-label": "联系人详情",
          onClick: c[1] || (c[1] = (M) => m.$emit("details"))
        }, [x(N, { name: "more" })])
      ]),
      e("div", {
        ref_key: "scroller",
        ref: h,
        class: "messages-thread-scroll",
        onScroll: p,
        onClick: b,
        onKeydown: c[7] || (c[7] = Fe((M) => d.value = "", ["esc"]))
      }, [
        c[12] || (c[12] = e("p", { class: "messages-subtle messages-context-hint" }, "对话参考角色设定、世界书、近期剧情及可用总结。", -1)),
        a.page.hasMore ? (l(), n("button", {
          key: 0,
          class: "messages-older",
          disabled: a.loading,
          onClick: k
        }, g(a.loading ? "读取中…" : "查看更早的消息"), 9, Ns)) : I("", !0),
        a.loading && !a.page.messages.length ? (l(), n("p", Rs, "正在读取消息…")) : I("", !0),
        (l(!0), n(T, null, be(a.page.messages, (M, B) => (l(), n(T, { key: M.id }, [
          B === 0 || M.createdAt - a.page.messages[B - 1].createdAt > 3e5 ? (l(), n("time", qs, g(new Date(M.createdAt).toLocaleString(void 0, {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })), 1)) : I("", !0),
          x(es, {
            message: M,
            bridge: a.bridge,
            "chat-identity": a.chatIdentity,
            media: a.media,
            disabled: a.disabled,
            selected: d.value === M.id,
            permission: a.page.permissions[M.id],
            onSelect: c[2] || (c[2] = (y) => d.value = y),
            onResize: i,
            onDeleteMessage: c[3] || (c[3] = (y) => m.$emit("deleteMessage", y)),
            onRegenerate: c[4] || (c[4] = (y) => m.$emit("regenerate", y))
          }, null, 8, [
            "message",
            "bridge",
            "chat-identity",
            "media",
            "disabled",
            "selected",
            "permission"
          ]),
          M.id === a.page.retryMessageId && !o.value ? (l(), oe(Ne, {
            key: 1,
            sending: a.busy?.messageId === M.id && ["saving", "uploading"].includes(r.value),
            error: E(M.id),
            "pending-save": a.pendingSave,
            disabled: a.retryDisabled,
            onRetry: (y) => m.$emit("retry", M.id)
          }, null, 8, [
            "sending",
            "error",
            "pending-save",
            "disabled",
            "onRetry"
          ])) : I("", !0)
        ], 64))), 128)),
        a.outgoing ? (l(), n(T, { key: 2 }, [e("div", Ls, [e("div", { class: te(["messages-bubble", { "messages-bubble-image": a.outgoing.payload.type === "image" }]) }, [a.outgoing.payload.type === "text" ? (l(), n("p", Ps, g(a.outgoing.payload.text), 1)) : (l(), n(T, { key: 1 }, [e("img", {
          class: "messages-pending-image",
          src: a.outgoing.payload.upload.dataUrl,
          alt: a.outgoing.payload.upload.name,
          onLoad: i
        }, null, 40, Fs), a.outgoing.payload.description ? (l(), n("p", Us, g(a.outgoing.payload.description), 1)) : I("", !0)], 64))], 2)]), x(Ne, {
          sending: a.working || a.busy?.messageId === a.outgoing.messageId,
          error: E(a.outgoing.messageId) || "发送未完成",
          "pending-save": a.pendingSave,
          disabled: a.retryDisabled,
          discard: "",
          onRetry: c[5] || (c[5] = (M) => m.$emit("retry", a.outgoing.messageId)),
          onDiscard: c[6] || (c[6] = (M) => m.$emit("discard", a.outgoing.messageId))
        }, null, 8, [
          "sending",
          "error",
          "pending-save",
          "disabled"
        ])], 64)) : I("", !0),
        o.value ? (l(), n("div", Vs, [...c[11] || (c[11] = [e("span", null, [
          e("i"),
          e("i"),
          e("i")
        ], -1), le("对方正在输入…", -1)])])) : I("", !0)
      ], 544),
      a.page.hasNewer ? (l(), n("button", {
        key: 0,
        class: "messages-latest",
        onClick: c[8] || (c[8] = (M) => {
          na(C) ? C.value = !0 : C = !0, m.$emit("latest");
        })
      }, "回到最新消息")) : I("", !0),
      x(cs, {
        draft: s.value,
        "onUpdate:draft": c[9] || (c[9] = (M) => s.value = M),
        disabled: a.sendDisabled,
        sending: !1,
        "waiting-for": a.waitingFor,
        onSend: c[10] || (c[10] = (M) => m.$emit("send", M))
      }, null, 8, [
        "draft",
        "disabled",
        "waiting-for"
      ])
    ]));
  }
}), Gs = zs, Os = () => ({
  text: "",
  image: null
});
function $e() {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (a) => a.toString(16).padStart(2, "0")).join("");
}
var Hs = { class: "messages-app" }, Ks = {
  key: 0,
  class: "messages-banner",
  role: "status"
}, Zs = { class: "messages-save-actions" }, js = ["disabled"], Ys = ["disabled"], Js = {
  key: 1,
  class: "messages-banner",
  role: "status"
}, Ws = { key: 0 }, Xs = { class: "messages-save-actions" }, Qs = ["disabled"], _s = ["disabled"], et = {
  key: 2,
  class: "messages-notice"
}, at = {
  key: 3,
  class: "messages-error",
  role: "alert"
}, st = {
  key: 4,
  class: "messages-banner",
  role: "alert"
}, tt = ["disabled"], lt = { id: "messages-dialog-title" }, nt = ["disabled"], it = {
  key: 0,
  class: "messages-error",
  role: "alert"
}, ut = ["disabled"], ot = { class: "messages-search" }, rt = ["aria-busy"], dt = {
  key: 0,
  class: "messages-subtle",
  role: "status"
}, vt = { key: 1 }, gt = ["disabled"], mt = ["disabled", "onClick"], ct = { key: 0 }, yt = {
  key: 0,
  class: "messages-subtle"
}, bt = { class: "messages-manual" }, ft = ["disabled"], pt = ["disabled"], kt = ["disabled"], $t = {
  key: 0,
  role: "status"
}, wt = { key: 1 }, ht = ["disabled"], It = {
  key: 0,
  role: "status"
}, Ct = { key: 1 }, Mt = ["disabled"], St = ["disabled"], Et = ["disabled"], Bt = { class: "messages-manual" }, xt = ["disabled"], At = ["disabled"], Dt = ["disabled"], Tt = ["disabled"], Nt = ["disabled"], Rt = /* @__PURE__ */ K({
  __name: "MessagesApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(a) {
    const w = a, s = $(w.initialState), f = (u = "") => ({
      contactId: u,
      messages: [],
      hasMore: !1,
      hasNewer: !1,
      retryMessageId: null,
      revision: "",
      permissions: {}
    }), d = $(""), b = $(f()), r = $(!1), o = $(!1), E = $(!1), h = $(!1), C = $(""), S = $(""), D = $(null), p = $(!1), i = $("add"), k = A(() => p.value && (i.value === "sync" || i.value === "recover")), m = $(null), c = A(() => s.value.syncNotice.messageIds.length), M = $(""), B = $(""), y = A(() => i.value === "delete" ? O.value?.deleteReason ?? "" : b.value.permissions[M.value]?.reason ?? ""), q = $(""), _ = $(""), re = $(""), W = $("ready"), ge = $($e());
    let Y = !0, ne = 0, ee = 0;
    const ie = qe(/* @__PURE__ */ new Map()), Me = A({
      get: () => ie.get(d.value) ?? Os(),
      set: (u) => {
        ie.set(d.value, u);
      }
    }), L = $(null), J = $(null), ae = A(() => s.value.outgoing ?? L.value), ze = A(() => ae.value?.contactId === d.value && !b.value.messages.some((u) => u.id === ae.value?.messageId) ? ae.value : null), O = A(() => s.value.contacts.find((u) => u.id === d.value)), Ge = A(() => s.value.busy && s.value.busy.contactId !== d.value ? s.value.contacts.find((u) => u.id === s.value.busy?.contactId)?.name ?? "另一位联系人" : ""), de = A(() => s.value.pendingSave || s.value.pendingModification || [
      "unconfirmed",
      "conflict",
      "failed"
    ].includes(s.value.fileState)), F = A(() => o.value || !!s.value.busy || s.value.operationPending || de.value || s.value.fileState !== "ready" || s.value.generationActive), Se = A(() => s.value.knownPeople.filter((u) => !s.value.contacts.some((t) => t.name === u.name) && `${u.name} ${u.aliases.join(" ")}`.toLocaleLowerCase().includes(re.value.toLocaleLowerCase())));
    async function R(u, t = {}) {
      return (await w.bridge.request(u, {
        chatIdentity: s.value.chatIdentity,
        ...t
      }, 6e4)).result;
    }
    async function X(u = !1, t = !1) {
      const v = d.value;
      if (!v) return;
      const z = ++ne;
      r.value = !0, S.value = "";
      try {
        const H = b.value, Q = await R("messages/thread", {
          contactId: v,
          ...u ? {
            before: H.messages[0]?.seq,
            revision: H.revision
          } : !t && H.messages.length ? { window: {
            first: H.messages[0].seq,
            last: H.messages.at(-1).seq,
            latest: !H.hasNewer
          } } : {}
        });
        if (!Y || z !== ne || d.value !== v || Q.revision !== s.value.revision) return;
        const fe = u && H.revision === Q.revision, pe = fe ? [...Q.messages, ...H.messages].slice(0, 100) : Q.messages;
        b.value = {
          ...Q,
          messages: pe,
          hasNewer: fe ? pe.at(-1)?.id !== H.messages.at(-1)?.id || H.hasNewer : Q.hasNewer,
          permissions: fe ? {
            ...H.permissions,
            ...Q.permissions
          } : Q.permissions
        }, L.value?.contactId === v && pe.some((la) => la.id === L.value?.messageId) && (L.value = null, J.value = null);
      } catch {
        Y && z === ne && d.value === v && (S.value = "消息暂时无法读取。");
      } finally {
        z === ne && (r.value = !1);
      }
    }
    function P(u) {
      if (!Y || u.chatIdentity !== s.value.chatIdentity) return;
      const t = s.value.revision !== u.revision || s.value.boundary !== u.boundary || s.value.fileState !== u.fileState || s.value.pendingSave !== u.pendingSave;
      s.value = u, L.value && (u.outgoing?.messageId === L.value.messageId || u.busy?.messageId === L.value.messageId || u.contacts.some((v) => v.lastMessageId === L.value.messageId)) && (L.value = null, J.value = null);
      for (const v of ie.keys()) u.contacts.some((z) => z.id === v) || ie.delete(v);
      L.value && !u.contacts.some((v) => v.id === L.value?.contactId) && (L.value = null, J.value = null), d.value && !u.contacts.some((v) => v.id === d.value) ? me() : d.value && t && X();
    }
    const Oe = w.bridge.subscribe((u) => {
      u.type === "messages/state" && P(u.payload.state);
    });
    function Ee(u) {
      d.value = u, C.value = "", b.value = f(u), X();
    }
    function me() {
      d.value = "", ne++, S.value = "", b.value = f();
    }
    Ue(() => (me(), !0), () => !!d.value);
    async function Z(u, t = () => !0) {
      if (!o.value) {
        o.value = !0, C.value = "";
        try {
          await u();
        } catch (v) {
          Y && t() && (C.value = v instanceof Error && v.message !== "host_request_timeout" ? v.message : V.operationTimeout);
        } finally {
          o.value = !1;
        }
      }
    }
    function He(u) {
      if (F.value || ae.value) return;
      const t = {
        contactId: d.value,
        messageId: `input:${$e()}`,
        payload: u,
        createdAt: Date.now()
      };
      L.value = t, J.value = null, ie.delete(t.contactId), b.value = {
        ...b.value,
        hasNewer: !1
      }, X(!1, !0), D.value?.sent(), Be(t.contactId, t.messageId, t);
    }
    async function Be(u, t, v) {
      if (!o.value) {
        o.value = !0, J.value = null, C.value = "";
        try {
          if (de.value && (P(await R("messages/confirm")), de.value))
            return;
          const z = v?.payload.type === "image" ? {
            type: "image",
            description: v.payload.description,
            upload: { ...v.payload.upload }
          } : v ? {
            type: "text",
            text: v.payload.text
          } : void 0;
          P(v ? await R("messages/send", {
            contactId: u,
            actionId: t.slice(6),
            payload: z
          }) : await R("messages/retry", {
            contactId: u,
            messageId: t
          }));
        } catch (z) {
          Y && (J.value = {
            contactId: u,
            messageId: t,
            message: z instanceof Error && z.message !== "host_request_timeout" ? z.message : "还不确定是否发送成功，可以重试。"
          });
        } finally {
          o.value = !1;
        }
      }
    }
    function Ke(u) {
      const t = ae.value?.messageId === u ? ae.value : void 0;
      Be(d.value, u, t);
    }
    function Ze(u) {
      Z(async () => {
        P(await R("messages/discard-send", { messageId: u })), L.value?.messageId === u && (L.value = null), J.value = null, await X();
      });
    }
    function je(u) {
      Z(async () => P(await R(u)));
    }
    function Ye(u) {
      Z(async () => {
        P(await R("messages/settings", { settings: u })), U();
      });
    }
    function Je() {
      if (E.value) return;
      E.value = !0, C.value = "";
      const u = ee;
      R("messages/sync").then((t) => {
        P(t), ee === u && U();
      }).catch((t) => {
        Y && ee === u && s.value.settings.syncNoticeEnabled && (C.value = t instanceof Error && t.message !== "host_request_timeout" ? t.message : V.operationTimeout);
      }).finally(() => {
        E.value = !1;
      });
    }
    function xe() {
      if (h.value || !s.value.settings.syncNoticeEnabled) return;
      h.value = !0, C.value = "";
      const u = ee;
      R("messages/dismiss-sync-notice").then((t) => {
        P(t), p.value && ee === u && U(), C.value = "";
      }).catch((t) => {
        Y && (C.value = t instanceof Error && t.message !== "host_request_timeout" ? t.message : V.settingsFailed);
      }).finally(() => {
        h.value = !1;
      });
    }
    function se(u) {
      p.value && we(() => m.value?.focus()), ee++, i.value = u, C.value = "", q.value = "", _.value = O.value?.note ?? "", re.value = "", ge.value = $e(), p.value = !0, B.value = s.value.revision, u === "add" && Ae();
    }
    async function Ae() {
      const u = ge.value, t = () => Y && p.value && i.value === "add" && ge.value === u;
      W.value = "loading";
      try {
        const v = await R("messages/refresh");
        if (!t()) return;
        P(v), W.value = "ready";
      } catch {
        t() && (W.value = "failed");
      }
    }
    function U() {
      k.value && (C.value = ""), p.value = !1, ee++;
    }
    function De() {
      U();
    }
    function We() {
      if (o.value && k.value) {
        U();
        return;
      }
      o.value || (i.value === "delete" ? i.value = "detail" : i.value === "recover" ? i.value = "sync" : De());
    }
    function Te(u = q.value) {
      !u.trim() || F.value || W.value === "loading" || Z(async () => {
        const t = await R("messages/contact/add", {
          actionId: ge.value,
          name: u.trim(),
          note: _.value.trim()
        });
        P(t.state), U(), Ee(t.contactId);
      });
    }
    function Xe() {
      Z(async () => {
        P(await R("messages/contact/note", {
          contactId: d.value,
          note: _.value
        })), U();
      });
    }
    function Qe() {
      Z(async () => {
        P(await R("messages/contact/delete", {
          contactId: d.value,
          revision: B.value
        })), U(), me();
      });
    }
    function _e(u) {
      M.value = u, se("delete-message"), B.value = b.value.revision;
    }
    function ea() {
      const u = d.value, t = M.value;
      Z(async () => {
        P(await R("messages/message/delete", {
          contactId: u,
          messageId: t,
          revision: B.value
        })), await X(), U();
      });
    }
    function aa(u) {
      const t = {
        contactId: d.value,
        messageId: u,
        revision: b.value.revision
      };
      Z(async () => {
        P(await R("messages/regenerate", t));
      });
    }
    function sa() {
      Z(async () => {
        P(await R("messages/recover")), U();
      });
    }
    function ta() {
      Z(async () => {
        P(await R("messages/adopt-server-state")), s.value.fileState === "ready" && !s.value.pendingSave ? (L.value = null, J.value = null, U()) : C.value = "暂时无法加载已保存版本，请检查网络后重试。当前记录未改。";
      });
    }
    return Ie(() => {
      Y = !1, ne++, Oe();
    }), (u, t) => (l(), n("main", Hs, [
      de.value ? (l(), n("div", Ks, [e("span", null, g(s.value.fileState === "conflict" ? "服务器上的存档已有变化，请选择如何处理。" : "还不确定部分消息是否保存成功，请先检查保存。"), 1), e("div", Zs, [e("button", {
        disabled: o.value || s.value.operationPending || !!s.value.busy,
        onClick: t[0] || (t[0] = (v) => je("messages/confirm"))
      }, "检查保存", 8, js), s.value.fileState === "conflict" || s.value.recoveryBlocked ? (l(), n("button", {
        key: 0,
        disabled: o.value || s.value.operationPending || !!s.value.busy || s.value.generationActive,
        onClick: t[1] || (t[1] = (v) => se("adopt"))
      }, "使用已保存版本", 8, Ys)) : I("", !0)])])) : c.value && s.value.settings.syncNoticeEnabled && !s.value.busy ? (l(), n("div", Js, [
        e("span", null, g(G(V).pending(c.value)), 1),
        s.value.syncNotice.error ? (l(), n("span", Ws, g(s.value.syncNotice.error), 1)) : I("", !0),
        e("div", Xs, [e("button", {
          disabled: F.value,
          onClick: t[2] || (t[2] = (v) => se("sync"))
        }, g(G(V).view), 9, Qs), e("button", {
          disabled: h.value,
          onClick: xe
        }, g(G(V).dismiss), 9, _s)])
      ])) : I("", !0),
      s.value.generationActive ? (l(), n("div", et, "故事正在继续，稍后就能发送消息。")) : I("", !0),
      C.value && !k.value || s.value.error ? (l(), n("p", at, g(!k.value && C.value || s.value.error), 1)) : I("", !0),
      S.value ? (l(), n("div", st, [e("span", null, g(S.value), 1), e("button", {
        disabled: r.value,
        onClick: t[3] || (t[3] = (v) => X())
      }, "重新加载", 8, tt)])) : I("", !0),
      O.value ? (l(), oe(Gs, {
        key: O.value.id,
        ref_key: "conversation",
        ref: D,
        draft: Me.value,
        "onUpdate:draft": t[4] || (t[4] = (v) => Me.value = v),
        "context-state": s.value,
        contact: O.value,
        page: b.value,
        bridge: a.bridge,
        "chat-identity": s.value.chatIdentity,
        disabled: F.value,
        "send-disabled": F.value || !!ae.value,
        busy: s.value.busy,
        outgoing: ze.value,
        "send-failure": s.value.sendFailure,
        "send-error": J.value,
        working: o.value,
        "pending-save": de.value,
        "retry-disabled": o.value || s.value.operationPending || !!s.value.busy || s.value.generationActive || s.value.fileState === "conflict",
        loading: r.value,
        "load-more": () => X(!0),
        media: s.value.media,
        "waiting-for": Ge.value,
        onBack: me,
        onDetails: t[5] || (t[5] = (v) => se("detail")),
        onSend: He,
        onRetry: Ke,
        onDiscard: Ze,
        onDeleteMessage: _e,
        onRegenerate: aa,
        onLatest: t[6] || (t[6] = (v) => X(!1, !0))
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
      ])) : I("", !0),
      j(x(Aa, {
        contacts: s.value.contacts,
        "busy-contact-id": s.value.busy?.contactId ?? "",
        drafts: ie,
        onSelect: Ee,
        onAdd: t[7] || (t[7] = (v) => se("add")),
        onSettings: t[8] || (t[8] = (v) => se("settings"))
      }, null, 8, [
        "contacts",
        "busy-contact-id",
        "drafts"
      ]), [[da, !O.value]]),
      p.value ? (l(), oe(Ve, {
        key: 6,
        class: "messages-dialog",
        "aria-labelledby": "messages-dialog-title",
        busy: o.value && !k.value,
        onClose: We
      }, {
        default: Pe(() => [
          e("header", null, [
            i.value === "detail" && O.value ? (l(), oe(ye, {
              key: 0,
              identity: O.value.id,
              name: O.value.name,
              small: ""
            }, null, 8, ["identity", "name"])) : I("", !0),
            e("h2", lt, g(i.value === "settings" ? "信息设置" : i.value === "add" ? "新的对话" : i.value === "detail" ? O.value?.name : i.value === "delete" ? "删除联系人？" : i.value === "delete-message" ? "删除这条消息？" : i.value === "sync" ? G(V).title : i.value === "adopt" ? "使用已保存版本？" : "在当前位置补记？"), 1),
            e("button", {
              ref_key: "dialogClose",
              ref: m,
              class: "messages-icon-button",
              "aria-label": "关闭",
              disabled: o.value && !k.value,
              onClick: De
            }, [x(N, { name: "close" })], 8, nt)
          ]),
          C.value || k.value && s.value.syncNotice.error ? (l(), n("p", it, g(C.value || s.value.syncNotice.error), 1)) : I("", !0),
          i.value === "settings" ? (l(), n(T, { key: 1 }, [x(qa, {
            settings: s.value.settings,
            busy: o.value || s.value.operationPending,
            onSave: Ye
          }, null, 8, ["settings", "busy"]), c.value ? (l(), n("button", {
            key: 0,
            class: "messages-secondary messages-sync-entry",
            disabled: o.value,
            onClick: t[9] || (t[9] = (v) => se("sync"))
          }, g(G(V).title) + " · " + g(c.value), 9, ut)) : I("", !0)], 64)) : i.value === "add" ? (l(), n(T, { key: 2 }, [
            e("label", ot, [x(N, { name: "search" }), j(e("input", {
              "onUpdate:modelValue": t[10] || (t[10] = (v) => re.value = v),
              placeholder: "查找已知人物",
              "aria-label": "查找已知人物",
              "aria-describedby": "messages-people-source"
            }, null, 512), [[ue, re.value]])]),
            t[22] || (t[22] = e("div", {
              id: "messages-people-source",
              class: "messages-subtle messages-people-source"
            }, "人物来自当前聊天的剧情总结，需要开启总结功能；找不到的人可以手动添加。", -1)),
            e("div", {
              class: "messages-known-list",
              "aria-busy": W.value === "loading"
            }, [W.value === "loading" ? (l(), n("p", dt, "正在读取已知人物…")) : W.value === "failed" ? (l(), n("div", vt, [t[18] || (t[18] = e("p", {
              class: "messages-subtle",
              role: "alert"
            }, "已知人物暂时无法读取，可以重试或手动添加。", -1)), e("button", {
              class: "messages-secondary",
              disabled: o.value,
              onClick: Ae
            }, "重新加载", 8, gt)])) : (l(), n(T, { key: 2 }, [(l(!0), n(T, null, be(Se.value, (v) => (l(), n("button", {
              key: v.name,
              disabled: F.value,
              onClick: (z) => Te(v.name)
            }, [
              x(ye, {
                identity: v.name,
                name: v.name,
                small: ""
              }, null, 8, ["identity", "name"]),
              e("span", null, [le(g(v.name), 1), v.aliases.length ? (l(), n("small", ct, g(v.aliases.join("、")), 1)) : I("", !0)]),
              x(N, { name: "plus" })
            ], 8, mt))), 128)), Se.value.length ? I("", !0) : (l(), n("p", yt, g(re.value ? "没有匹配的人物，可以在下面手动添加。" : "暂无可添加的已知人物，可以在下面手动添加。"), 1))], 64))], 8, rt),
            e("details", bt, [t[21] || (t[21] = e("summary", null, "想联系的人不在这里？", -1)), e("form", { onSubmit: t[13] || (t[13] = ve((v) => Te(), ["prevent"])) }, [
              e("label", null, [t[19] || (t[19] = le("姓名", -1)), j(e("input", {
                "onUpdate:modelValue": t[11] || (t[11] = (v) => q.value = v),
                maxlength: "120",
                required: "",
                placeholder: "对方的姓名"
              }, null, 512), [[ue, q.value]])]),
              e("label", null, [t[20] || (t[20] = le("身份说明（可选）", -1)), j(e("textarea", {
                "onUpdate:modelValue": t[12] || (t[12] = (v) => _.value = v),
                maxlength: "600",
                rows: "2",
                placeholder: "例如：住在隔壁的花店老板"
              }, null, 512), [[ue, _.value]])]),
              e("button", {
                class: "messages-primary",
                disabled: F.value || W.value === "loading" || !q.value.trim()
              }, "添加并聊天", 8, ft)
            ], 32)])
          ], 64)) : i.value === "detail" ? (l(), n("form", {
            key: 3,
            onSubmit: ve(Xe, ["prevent"])
          }, [
            e("label", null, [t[23] || (t[23] = le("身份说明 / 备注", -1)), j(e("textarea", {
              "onUpdate:modelValue": t[14] || (t[14] = (v) => _.value = v),
              maxlength: "600",
              rows: "3",
              placeholder: "帮助辨认这位联系人"
            }, null, 512), [[ue, _.value]])]),
            e("button", {
              class: "messages-primary",
              disabled: F.value
            }, "保存备注", 8, pt),
            e("button", {
              type: "button",
              class: "messages-danger",
              disabled: F.value,
              onClick: t[15] || (t[15] = (v) => i.value = "delete")
            }, "删除联系人与通讯记录", 8, kt)
          ], 32)) : i.value === "delete" ? (l(), n(T, { key: 4 }, [
            y.value ? (l(), n("p", $t, g(y.value), 1)) : (l(), n("p", wt, "删除与 " + g(O.value?.name) + " 的全部通讯和摘要，同时更新主聊天记录。其他联系人和图库文件保留，删除后不能恢复。", 1)),
            e("button", {
              class: "messages-danger",
              disabled: F.value || !!y.value,
              onClick: Qe
            }, "确认删除", 8, ht),
            e("button", {
              class: "messages-secondary",
              onClick: t[16] || (t[16] = (v) => i.value = "detail")
            }, "保留联系人")
          ], 64)) : i.value === "delete-message" ? (l(), n(T, { key: 5 }, [
            y.value ? (l(), n("p", It, g(y.value), 1)) : (l(), n("p", Ct, "删除这条消息，同时更新主聊天记录。后续回复、其他消息和图库文件保留，删除后不能恢复。")),
            e("button", {
              class: "messages-danger",
              disabled: F.value || !!y.value,
              onClick: ea
            }, "确认删除", 8, Mt),
            e("button", {
              class: "messages-secondary",
              onClick: U
            }, "取消")
          ], 64)) : i.value === "sync" ? (l(), n(T, { key: 6 }, [
            e("p", null, g(G(V).pending(c.value)), 1),
            e("p", null, g(G(V).description), 1),
            e("button", {
              class: "messages-primary",
              disabled: F.value || E.value,
              onClick: Je
            }, g(G(V).retry), 9, St),
            s.value.settings.syncNoticeEnabled ? (l(), n("button", {
              key: 0,
              class: "messages-secondary",
              disabled: h.value,
              onClick: xe
            }, g(G(V).dismiss), 9, Et)) : I("", !0),
            e("details", Bt, [
              t[24] || (t[24] = e("summary", null, "原来的记录已被修改或删除？", -1)),
              t[25] || (t[25] = e("p", null, "不会覆盖你的修改。需要这些消息继续进入剧情时，可以在当前位置另加一条补记。", -1)),
              e("button", {
                class: "messages-secondary",
                disabled: F.value,
                onClick: t[17] || (t[17] = (v) => i.value = "recover")
              }, "查看补记方式", 8, xt)
            ])
          ], 64)) : i.value === "adopt" ? (l(), n(T, { key: 7 }, [
            t[26] || (t[26] = e("p", null, "将读取服务器上的当前聊天小白 OS 存档，放弃本地尚未确认的修改。信息 APP 会显示服务器已保存的联系人和消息。", -1)),
            t[27] || (t[27] = e("p", { class: "messages-subtle" }, "这项选择作用于当前聊天的整份 OS 存档，不会删除主聊天里的记录，也不会重新生成回复。", -1)),
            e("button", {
              class: "messages-danger",
              disabled: o.value || !!s.value.busy || s.value.generationActive,
              onClick: ta
            }, "确认使用已保存版本", 8, At),
            e("button", {
              class: "messages-secondary",
              disabled: o.value,
              onClick: U
            }, "暂不处理", 8, Dt)
          ], 64)) : (l(), n(T, { key: 8 }, [
            t[28] || (t[28] = e("p", null, "先检查已有记录；仍未写入的消息会在主聊天当前位置标为「补录」，保留原发送时间。不会覆盖旧记录或恢复你删除的那一条。", -1)),
            e("button", {
              class: "messages-primary",
              disabled: F.value,
              onClick: sa
            }, "确认补记", 8, Tt),
            e("button", {
              class: "messages-secondary",
              disabled: o.value,
              onClick: U
            }, "暂不补记", 8, Nt)
          ], 64))
        ]),
        _: 1
      }, 8, ["busy"])) : I("", !0)
    ]));
  }
}), Vt = Rt;
export {
  Vt as default
};
