/* eslint-disable */
import { A as fe, B as _, C as Pe, E as le, F as Ve, H as p, I as k, N as J, T as t, V as pe, _ as M, a as W, b as de, c as ee, d as a, f as ae, g as O, j as ke, l as E, m as n, p as w, s as $e, u as D, v as K, w as re, y as se } from "./xiaobai-os-runtime-dom.esm-bundler-DwdCK5Jt.js";
var Ue = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.8",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
}, He = ["d"], Re = /* @__PURE__ */ K({
  __name: "MessageIcon",
  props: { name: {} },
  setup(e) {
    const f = {
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
      stop: "M7 7h10v10H7Z"
    };
    return (l, u) => (t(), n("svg", Ue, [a("path", { d: f[e.name] }, null, 8, He)]));
  }
}), B = Re, ze = /* @__PURE__ */ K({
  __name: "ContactAvatar",
  props: {
    identity: {},
    name: {},
    small: { type: Boolean }
  },
  setup(e) {
    const f = e, l = D(() => {
      let u = 0;
      for (const o of f.identity) u = Math.imul(u, 31) + o.codePointAt(0) | 0;
      return String((u >>> 0) % 360);
    });
    return (u, o) => (t(), n("span", {
      class: _(["messages-avatar", { small: e.small }]),
      style: pe({ "--avatar-hue": l.value }),
      "aria-hidden": "true"
    }, p(Array.from(e.name)[0]), 7));
  }
}), te = ze, Ge = { class: "messages-contacts" }, je = { class: "messages-home-header" }, Ke = { class: "messages-search" }, Ne = {
  key: 0,
  class: "messages-empty"
}, Ze = {
  key: 1,
  class: "messages-contact-rows"
}, Oe = {
  key: 0,
  class: "messages-subtle"
}, Ye = ["onClick"], Je = { class: "messages-contact-copy" }, We = { class: "messages-contact-heading" }, Xe = {
  key: 0,
  class: "messages-preview messages-preview-active"
}, Qe = {
  key: 1,
  class: "messages-preview"
}, _e = {
  key: 2,
  class: "messages-preview"
}, ea = /* @__PURE__ */ K({
  __name: "ContactList",
  props: {
    contacts: {},
    busyContactId: {},
    drafts: {}
  },
  emits: ["select", "add"],
  setup(e) {
    const f = e, l = k(""), u = D(() => f.contacts.filter((c) => `${c.name} ${c.note}`.toLocaleLowerCase().includes(l.value.toLocaleLowerCase())));
    function o(c) {
      if (c === null) return "";
      const g = new Date(c);
      return g.toDateString() === (/* @__PURE__ */ new Date()).toDateString() ? g.toLocaleTimeString(void 0, {
        hour: "2-digit",
        minute: "2-digit"
      }) : g.toLocaleDateString(void 0, {
        month: "numeric",
        day: "numeric"
      });
    }
    return (c, g) => (t(), n("section", Ge, [
      a("header", je, [g[3] || (g[3] = a("h1", null, "信息", -1)), a("button", {
        class: "messages-icon-button",
        "aria-label": "添加联系人",
        onClick: g[0] || (g[0] = (d) => c.$emit("add"))
      }, [M(B, { name: "plus" })])]),
      a("label", Ke, [M(B, { name: "search" }), J(a("input", {
        "onUpdate:modelValue": g[1] || (g[1] = (d) => l.value = d),
        type: "search",
        placeholder: "搜索联系人",
        "aria-label": "搜索联系人"
      }, null, 512), [[W, l.value]])]),
      e.contacts.length ? (t(), n("div", Ze, [u.value.length ? w("", !0) : (t(), n("p", Oe, "没有找到这个人。")), (t(!0), n(E, null, le(u.value, (d) => (t(), n("button", {
        key: d.id,
        class: "messages-contact-row",
        onClick: (C) => c.$emit("select", d.id)
      }, [M(te, {
        identity: d.id,
        name: d.name
      }, null, 8, ["identity", "name"]), a("span", Je, [a("span", We, [a("strong", null, p(d.name), 1), a("time", null, p(o(d.lastAt)), 1)]), e.busyContactId === d.id ? (t(), n("span", Xe, "正在等待回复…")) : e.drafts.get(d.id)?.text.trim() || e.drafts.get(d.id)?.image ? (t(), n("span", Qe, [g[6] || (g[6] = a("em", null, "草稿", -1)), O(" " + p(e.drafts.get(d.id)?.image ? "［图片］" : "") + p(e.drafts.get(d.id)?.text), 1)])) : (t(), n("span", _e, p(d.preview), 1))])], 8, Ye))), 128))])) : (t(), n("div", Ne, [
        M(B, { name: "message" }),
        g[5] || (g[5] = a("h2", null, "暂无联系人", -1)),
        a("button", {
          class: "messages-primary",
          onClick: g[2] || (g[2] = (d) => c.$emit("add"))
        }, [g[4] || (g[4] = O("添加联系人", -1)), M(B, { name: "plus" })])
      ]))
    ]));
  }
}), aa = ea, sa = { key: 0 }, ta = ["src", "alt"], la = ["disabled"], na = {
  key: 3,
  class: "messages-image-placeholder messages-media-unavailable"
}, ia = {
  key: 4,
  class: "messages-image-caption"
}, ua = ["disabled"], oa = { "aria-label": "关闭图片" }, da = ["src", "alt"], ra = ["disabled", "aria-label"], va = {
  key: 0,
  class: "messages-media-unavailable-note"
}, ga = {
  key: 2,
  class: "messages-transcript"
}, ma = {
  key: 3,
  class: "messages-media-error",
  role: "status"
}, ca = /* @__PURE__ */ K({
  __name: "MessageBubble",
  props: {
    message: {},
    bridge: {},
    chatIdentity: {},
    media: {},
    disabled: { type: Boolean }
  },
  emits: ["resize", "deleteImage"],
  setup(e) {
    const f = e, l = k(""), u = k(!1), o = k(""), c = k(""), g = k(!1), d = D(() => f.message.payload.type === "image" ? f.message.payload.attachment : void 0), C = D(() => d.value?.path || l.value), S = k(!1), q = k(null), $ = D(() => [
      "playing",
      "loading",
      "generating",
      "queued"
    ].includes(c.value)), L = k(!1);
    let b = !0;
    const r = (h) => f.bridge.request(h, {
      chatIdentity: f.chatIdentity,
      messageId: f.message.id
    }, 18e4);
    async function y(h) {
      if (!u.value) {
        u.value = !0, o.value = "";
        try {
          const { result: m } = await r(h ? "messages/image/generate" : "messages/image/check");
          b && (l.value = m.data ?? "", S.value = !1, h && !l.value && (o.value = "请开启画图后再试，画面描述已保留。"));
        } catch {
          b && h && (o.value = "图片生成失败，可以再试一次。");
        } finally {
          b && (u.value = !1);
        }
      }
    }
    async function F() {
      if (L.value) return;
      o.value = "";
      const h = $.value;
      if (!(!h && !f.media.voice))
        try {
          h ? (L.value = !0, await r("messages/voice/stop"), b && (c.value = "")) : (c.value = "loading", await r("messages/voice/play"));
        } catch {
          b && (h || (c.value = ""), o.value = h ? "未能确认停止，请再点一次停止。" : "语音暂时无法播放，原文仍可查看。");
        } finally {
          b && (L.value = !1);
        }
    }
    const A = f.bridge.subscribe((h) => {
      if (h.type !== "messages/voice-state") return;
      const m = h.payload;
      m.messageId === f.message.id ? c.value = m.status : m.status === "playing" && (c.value = ""), m.messageId === f.message.id && m.status === "error" && (o.value = "播放失败，点击可以重试。");
    });
    return Pe(() => {
      f.message.payload.type === "image" && !d.value && y(!1);
    }), ke(() => f.media.image, (h) => {
      h && f.message.payload.type === "image" && !d.value && !l.value && y(!1);
    }), re(() => {
      b = !1, A();
    }), (h, m) => (t(), n("article", { class: _(["messages-bubble-row", { outgoing: e.message.sender === "user" }]) }, [a("div", { class: _(["messages-bubble", `messages-bubble-${e.message.payload.type}`]) }, [e.message.payload.type === "text" ? (t(), n("p", sa, p(e.message.payload.text), 1)) : e.message.payload.type === "image" ? (t(), n(E, { key: 1 }, [
      C.value && !S.value ? (t(), n("button", {
        key: 0,
        class: "messages-image-open",
        "aria-label": "放大图片",
        onClick: m[2] || (m[2] = (x) => q.value?.showModal())
      }, [a("img", {
        src: C.value,
        alt: e.message.payload.description || d.value?.name || "图片",
        onLoad: m[0] || (m[0] = (x) => h.$emit("resize")),
        onError: m[1] || (m[1] = (x) => S.value = !0)
      }, null, 40, ta)])) : d.value ? (t(), n("button", {
        key: 1,
        class: "messages-image-placeholder",
        onClick: m[3] || (m[3] = (x) => S.value = !1)
      }, [
        M(B, { name: "image" }),
        m[9] || (m[9] = a("span", null, "原图暂时无法读取", -1)),
        m[10] || (m[10] = a("small", null, "点击重试", -1))
      ])) : e.media.image ? (t(), n("button", {
        key: 2,
        class: "messages-image-placeholder",
        disabled: u.value,
        onClick: m[4] || (m[4] = (x) => y(!0))
      }, [M(B, { name: "image" }), a("span", null, p(u.value ? "正在生成图片…" : o.value ? "重新生成图片" : "生成图片"), 1)], 8, la)) : (t(), n("div", na, [
        M(B, { name: "image" }),
        m[11] || (m[11] = a("span", null, "图片描述", -1)),
        m[12] || (m[12] = a("small", null, "开启画图后可生成图片", -1))
      ])),
      e.message.payload.description ? (t(), n("p", ia, p(e.message.payload.description), 1)) : w("", !0),
      e.message.sender === "user" && d.value ? (t(), n("button", {
        key: 5,
        class: "messages-image-delete",
        disabled: e.disabled,
        onClick: m[5] || (m[5] = (x) => h.$emit("deleteImage", e.message.id))
      }, "删除图片消息", 8, ua)) : w("", !0),
      a("dialog", {
        ref_key: "viewer",
        ref: q,
        class: "messages-image-viewer",
        onClick: m[6] || (m[6] = (x) => q.value?.close()),
        onKeydown: m[7] || (m[7] = $e(ee(() => {
        }, ["stop"]), ["esc"]))
      }, [a("button", oa, [M(B, { name: "close" })]), C.value ? (t(), n("img", {
        key: 0,
        src: C.value,
        alt: e.message.payload.description || d.value?.name || "图片"
      }, null, 8, da)) : w("", !0)], 544)
    ], 64)) : (t(), n(E, { key: 2 }, [
      a("button", {
        class: "messages-voice-button",
        disabled: L.value || !e.media.voice && !$.value,
        "aria-label": $.value ? "停止播放" : "播放语音",
        onClick: F
      }, [
        M(B, { name: $.value ? "stop" : "play" }, null, 8, ["name"]),
        a("span", { class: _(["messages-wave", { playing: c.value === "playing" }]) }, [(t(), n(E, null, le(16, (x) => a("i", {
          key: x,
          style: pe({
            height: `${8 + x * 7 % 17}px`,
            animationDelay: `${x * 45}ms`
          })
        }, null, 4)), 64))], 2),
        a("small", null, p(L.value ? "停止中" : [
          "loading",
          "generating",
          "queued"
        ].includes(c.value) ? "准备中" : "语音"), 1)
      ], 8, ra),
      e.media.voice ? w("", !0) : (t(), n("small", va, "开启 TTS 后可播放")),
      e.media.voice ? (t(), n("button", {
        key: 1,
        class: "messages-transcript-toggle",
        onClick: m[8] || (m[8] = (x) => g.value = !g.value)
      }, p(g.value ? "收起原文" : "查看原文"), 1)) : w("", !0),
      g.value || !e.media.voice ? (t(), n("p", ga, p(e.message.payload.transcript), 1)) : w("", !0)
    ], 64)), o.value ? (t(), n("small", ma, p(o.value), 1)) : w("", !0)], 2)], 2));
  }
}), ya = ca, ba = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
], Cs = 4 * 1024 * 1024;
async function fa(e) {
  if (!ba.includes(e.type)) throw new Error("请选择 PNG、JPG、WEBP 或 GIF 图片。");
  if (!e.size || e.size > 4194304) throw new Error("请选择不超过 4MB 的图片。");
  const f = await new Promise((u, o) => {
    const c = new FileReader();
    c.onerror = () => o(/* @__PURE__ */ new Error("图片读取失败，请重新选择。")), c.onload = () => typeof c.result == "string" ? u(c.result) : o(/* @__PURE__ */ new Error("图片读取失败。")), c.readAsDataURL(e);
  }), l = new Image();
  l.src = f;
  try {
    await l.decode();
  } catch {
    throw new Error("这张图片无法打开，请换一张。");
  }
  return {
    dataUrl: f,
    name: e.name.replace(/[\u0000-\u001f\u007f]/gu, "").trim().slice(0, 120) || "图片"
  };
}
var pa = {
  key: 0,
  class: "messages-attachment-preview"
}, ka = ["src", "alt"], $a = ["disabled"], wa = {
  key: 1,
  class: "messages-composer-hint"
}, ha = {
  key: 2,
  class: "messages-composer-hint",
  role: "status"
}, Ia = {
  key: 3,
  class: "messages-composer-wait",
  role: "status"
}, Ma = { class: "messages-composer-line" }, Ca = ["disabled"], Sa = ["placeholder", "disabled"], Aa = ["disabled"], Ba = /* @__PURE__ */ K({
  __name: "MessageComposer",
  props: /* @__PURE__ */ se({
    disabled: { type: Boolean },
    sending: { type: Boolean },
    waitingFor: {}
  }, {
    draft: { required: !0 },
    draftModifiers: {}
  }),
  emits: /* @__PURE__ */ se(["send"], ["update:draft"]),
  setup(e, { emit: f }) {
    const l = e, u = f, o = fe(e, "draft"), c = D({
      get: () => o.value.text,
      set: (r) => {
        o.value = {
          ...o.value,
          text: r
        };
      }
    }), g = k(null), d = k(!1), C = k("");
    let S = !0;
    async function q(r) {
      const y = r.target, F = y.files?.[0];
      if (y.value = "", !(!F || l.sending || d.value)) {
        d.value = !0, C.value = "";
        try {
          const A = await fa(F);
          S && (o.value = {
            ...o.value,
            image: A
          });
        } catch (A) {
          S && (C.value = A instanceof Error ? A.message : "图片读取失败，请重新选择。");
        } finally {
          S && (d.value = !1);
        }
      }
    }
    function $() {
      o.value = {
        ...o.value,
        image: null
      }, C.value = "";
    }
    function L() {
      const r = c.value.trim();
      !r && !o.value.image || l.disabled || d.value || u("send", o.value.image ? {
        type: "image",
        description: r,
        upload: { ...o.value.image }
      } : {
        type: "text",
        text: r
      });
    }
    re(() => {
      S = !1;
    });
    function b(r) {
      r.key === "Enter" && (r.ctrlKey || r.metaKey) && !r.isComposing && (r.preventDefault(), L());
    }
    return (r, y) => (t(), n("form", {
      class: "messages-composer",
      onSubmit: ee(L, ["prevent"])
    }, [
      a("input", {
        ref_key: "fileInput",
        ref: g,
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/gif",
        hidden: "",
        "aria-label": "选择图片文件",
        onChange: q
      }, null, 544),
      o.value.image ? (t(), n("div", pa, [
        a("img", {
          src: o.value.image.dataUrl,
          alt: o.value.image.name
        }, null, 8, ka),
        a("span", null, [y[2] || (y[2] = a("strong", null, "待发送的图片", -1)), a("small", null, p(o.value.image.name), 1)]),
        a("button", {
          type: "button",
          class: "messages-icon-button",
          "aria-label": "移除图片",
          disabled: e.sending || d.value,
          onClick: $
        }, [M(B, { name: "close" })], 8, $a)
      ])) : w("", !0),
      o.value.image ? (t(), n("p", wa, "图片将随消息发送，需要当前模型支持看图。")) : w("", !0),
      d.value || C.value ? (t(), n("p", ha, p(d.value ? "正在读取图片…" : C.value), 1)) : w("", !0),
      e.waitingFor ? (t(), n("p", Ia, "正在等待 " + p(e.waitingFor) + " 的回复。可以先写好，稍后发送。", 1)) : w("", !0),
      a("div", Ma, [
        a("button", {
          type: "button",
          class: "messages-icon-button messages-attach",
          "aria-label": "选择图片",
          disabled: e.sending || d.value,
          onClick: y[0] || (y[0] = (F) => g.value?.click())
        }, [M(B, { name: "plus" })], 8, Ca),
        J(a("textarea", {
          "onUpdate:modelValue": y[1] || (y[1] = (F) => c.value = F),
          rows: "1",
          maxlength: "4000",
          placeholder: o.value.image ? "给图片配句话…" : "说点什么…",
          "aria-label": "消息内容",
          disabled: e.sending,
          onKeydown: b
        }, null, 40, Sa), [[W, c.value]]),
        a("button", {
          class: "messages-send",
          type: "submit",
          disabled: e.disabled || d.value || !c.value.trim() && !o.value.image,
          "aria-label": "发送"
        }, [M(B, { name: "send" })], 8, Aa)
      ])
    ], 32));
  }
}), Da = Ba, Ea = {
  class: "messages-delivery",
  role: "status"
}, xa = { key: 0 }, Ta = ["disabled"], qa = ["disabled"], La = /* @__PURE__ */ K({
  __name: "DeliveryStatus",
  props: {
    sending: { type: Boolean },
    error: {},
    pendingSave: { type: Boolean },
    disabled: { type: Boolean },
    discard: { type: Boolean }
  },
  emits: ["retry", "discard"],
  setup(e) {
    return (f, l) => (t(), n("div", Ea, [e.sending ? (t(), n("span", xa, "发送中…")) : (t(), n(E, { key: 1 }, [
      a("span", null, p(e.error || (e.pendingSave ? "尚待保存确认" : "尚未收到回复")), 1),
      a("button", {
        disabled: e.disabled,
        onClick: l[0] || (l[0] = (u) => f.$emit("retry"))
      }, p(e.pendingSave ? "检查并重试" : "重试"), 9, Ta),
      e.discard && !e.pendingSave ? (t(), n("button", {
        key: 0,
        disabled: e.disabled,
        onClick: l[1] || (l[1] = (u) => f.$emit("discard"))
      }, "删除", 8, qa)) : w("", !0)
    ], 64))]));
  }
}), be = La, Fa = { class: "messages-conversation" }, Pa = { class: "messages-thread-header" }, Va = ["disabled"], Ua = {
  key: 1,
  class: "messages-thread-start"
}, Ha = {
  key: 0,
  class: "messages-time"
}, Ra = { class: "messages-bubble-row outgoing" }, za = { key: 0 }, Ga = ["src", "alt"], ja = {
  key: 0,
  class: "messages-image-caption"
}, Ka = {
  key: 3,
  class: "messages-typing",
  role: "status"
}, Na = /* @__PURE__ */ K({
  __name: "Conversation",
  props: /* @__PURE__ */ se({
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
  emits: /* @__PURE__ */ se([
    "back",
    "details",
    "send",
    "retry",
    "discard",
    "deleteImage"
  ], ["update:draft"]),
  setup(e, { expose: f }) {
    const l = fe(e, "draft"), u = e, o = D(() => u.busy?.contactId === u.contact.id ? u.busy.stage : ""), c = D(() => [
      "replying",
      "summarizing",
      "saving-reply"
    ].includes(o.value));
    function g(b) {
      return [u.sendFailure, u.sendError].find((r) => r?.contactId === u.contact.id && r.messageId === b)?.message;
    }
    const d = k(null);
    let C = !0, S = !1;
    function q() {
      const b = d.value;
      b && (C = b.scrollHeight - b.clientHeight - b.scrollTop < 70);
    }
    async function $() {
      await de(), C && !S && d.value && (d.value.scrollTop = d.value.scrollHeight);
    }
    ke(() => [
      u.page.messages.at(-1)?.id,
      u.outgoing?.messageId,
      o.value,
      u.sendFailure,
      u.sendError
    ], $, { immediate: !0 });
    async function L() {
      const b = d.value;
      if (!b || S) return;
      S = !0;
      const r = b.scrollHeight, y = b.scrollTop;
      try {
        await u.loadMore(), await de(), b.scrollTop = y + b.scrollHeight - r;
      } finally {
        S = !1, q();
      }
    }
    return f({ sent() {
      C = !0, $();
    } }), (b, r) => (t(), n("section", Fa, [
      a("header", Pa, [
        a("button", {
          class: "messages-icon-button",
          "aria-label": "返回信息",
          onClick: r[0] || (r[0] = (y) => b.$emit("back"))
        }, [M(B, { name: "back" })]),
        M(te, {
          identity: e.contact.id,
          name: e.contact.name,
          small: ""
        }, null, 8, ["identity", "name"]),
        a("div", null, [a("h2", null, p(e.contact.name), 1)]),
        a("button", {
          class: "messages-icon-button",
          "aria-label": "联系人详情",
          onClick: r[1] || (r[1] = (y) => b.$emit("details"))
        }, [M(B, { name: "more" })])
      ]),
      a("div", {
        ref_key: "scroller",
        ref: d,
        class: "messages-thread-scroll",
        onScroll: q
      }, [
        e.page.hasMore ? (t(), n("button", {
          key: 0,
          class: "messages-older",
          disabled: e.loading,
          onClick: L
        }, p(e.loading ? "读取中…" : "查看更早的消息"), 9, Va)) : w("", !0),
        e.loading && !e.page.messages.length ? (t(), n("p", Ua, "正在读取消息…")) : w("", !0),
        (t(!0), n(E, null, le(e.page.messages, (y, F) => (t(), n(E, { key: y.id }, [
          F === 0 || y.createdAt - e.page.messages[F - 1].createdAt > 3e5 ? (t(), n("time", Ha, p(new Date(y.createdAt).toLocaleString(void 0, {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })), 1)) : w("", !0),
          M(ya, {
            message: y,
            bridge: e.bridge,
            "chat-identity": e.chatIdentity,
            media: e.media,
            disabled: e.disabled,
            onResize: $,
            onDeleteImage: r[2] || (r[2] = (A) => b.$emit("deleteImage", A))
          }, null, 8, [
            "message",
            "bridge",
            "chat-identity",
            "media",
            "disabled"
          ]),
          y.id === e.page.retryMessageId && !c.value ? (t(), ae(be, {
            key: 1,
            sending: e.busy?.messageId === y.id && ["saving", "uploading"].includes(o.value),
            error: g(y.id),
            "pending-save": e.pendingSave,
            disabled: e.retryDisabled,
            onRetry: (A) => b.$emit("retry", y.id)
          }, null, 8, [
            "sending",
            "error",
            "pending-save",
            "disabled",
            "onRetry"
          ])) : w("", !0)
        ], 64))), 128)),
        e.outgoing ? (t(), n(E, { key: 2 }, [a("div", Ra, [a("div", { class: _(["messages-bubble", { "messages-bubble-image": e.outgoing.payload.type === "image" }]) }, [e.outgoing.payload.type === "text" ? (t(), n("p", za, p(e.outgoing.payload.text), 1)) : (t(), n(E, { key: 1 }, [a("img", {
          class: "messages-pending-image",
          src: e.outgoing.payload.upload.dataUrl,
          alt: e.outgoing.payload.upload.name,
          onLoad: $
        }, null, 40, Ga), e.outgoing.payload.description ? (t(), n("p", ja, p(e.outgoing.payload.description), 1)) : w("", !0)], 64))], 2)]), M(be, {
          sending: e.working || e.busy?.messageId === e.outgoing.messageId,
          error: g(e.outgoing.messageId) || "发送未完成",
          "pending-save": e.pendingSave,
          disabled: e.retryDisabled,
          discard: "",
          onRetry: r[3] || (r[3] = (y) => b.$emit("retry", e.outgoing.messageId)),
          onDiscard: r[4] || (r[4] = (y) => b.$emit("discard", e.outgoing.messageId))
        }, null, 8, [
          "sending",
          "error",
          "pending-save",
          "disabled"
        ])], 64)) : w("", !0),
        c.value ? (t(), n("div", Ka, [...r[7] || (r[7] = [a("span", null, [
          a("i"),
          a("i"),
          a("i")
        ], -1), O("对方正在输入…", -1)])])) : w("", !0)
      ], 544),
      M(Da, {
        draft: l.value,
        "onUpdate:draft": r[5] || (r[5] = (y) => l.value = y),
        disabled: e.sendDisabled,
        sending: !1,
        "waiting-for": e.waitingFor,
        onSend: r[6] || (r[6] = (y) => b.$emit("send", y))
      }, null, 8, [
        "draft",
        "disabled",
        "waiting-for"
      ])
    ]));
  }
}), Za = Na, Oa = () => ({
  text: "",
  image: null
});
function oe() {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (e) => e.toString(16).padStart(2, "0")).join("");
}
var Ya = { class: "messages-app" }, Ja = {
  key: 0,
  class: "messages-banner",
  role: "status"
}, Wa = { class: "messages-save-actions" }, Xa = ["disabled"], Qa = ["disabled"], _a = {
  key: 1,
  class: "messages-banner",
  role: "status"
}, es = ["disabled"], as = {
  key: 2,
  class: "messages-notice"
}, ss = {
  key: 3,
  class: "messages-error",
  role: "alert"
}, ts = {
  key: 4,
  class: "messages-banner",
  role: "alert"
}, ls = ["disabled"], ns = {
  key: 0,
  class: "messages-error",
  role: "alert"
}, is = { class: "messages-search" }, us = { class: "messages-known-list" }, os = ["disabled", "onClick"], ds = { key: 0 }, rs = {
  key: 0,
  class: "messages-subtle"
}, vs = { class: "messages-manual" }, gs = ["disabled"], ms = ["disabled"], cs = ["disabled"], ys = ["disabled"], bs = ["disabled"], fs = ["disabled"], ps = { class: "messages-manual" }, ks = ["disabled"], $s = ["disabled"], ws = ["disabled"], hs = ["disabled"], Is = /* @__PURE__ */ K({
  __name: "MessagesApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(e) {
    const f = e, l = k(f.initialState), u = k(""), o = k({
      contactId: "",
      messages: [],
      hasMore: !1,
      retryMessageId: null
    }), c = k(!1), g = k(!1), d = k(""), C = k(""), S = k(null), q = k(null), $ = k("add"), L = k(""), b = k(""), r = k(""), y = k(""), F = k(oe());
    let A = !0, h = 0;
    const m = Ve(/* @__PURE__ */ new Map()), x = D({
      get: () => m.get(u.value) ?? Oa(),
      set: (i) => {
        m.set(u.value, i);
      }
    }), H = k(null), G = k(null), N = D(() => l.value.outgoing ?? H.value), we = D(() => N.value?.contactId === u.value && !o.value.messages.some((i) => i.id === N.value?.messageId) ? N.value : null), R = D(() => l.value.contacts.find((i) => i.id === u.value)), he = D(() => l.value.busy && l.value.busy.contactId !== u.value ? l.value.contacts.find((i) => i.id === l.value.busy?.contactId)?.name ?? "另一位联系人" : ""), Z = D(() => l.value.pendingSave || [
      "unconfirmed",
      "conflict",
      "failed"
    ].includes(l.value.fileState)), T = D(() => g.value || !!l.value.busy || l.value.pendingSave || l.value.fileState !== "ready" || l.value.generationActive), ve = D(() => l.value.knownPeople.filter((i) => !l.value.contacts.some((s) => s.name === i.name) && `${i.name} ${i.aliases.join(" ")}`.toLocaleLowerCase().includes(y.value.toLocaleLowerCase())));
    async function P(i, s = {}) {
      return (await f.bridge.request(i, {
        chatIdentity: l.value.chatIdentity,
        ...s
      }, 6e4)).result;
    }
    async function X(i = !1, s = !1) {
      const v = u.value;
      if (!v) return;
      const I = ++h;
      c.value = !0, C.value = "";
      try {
        const Y = await P("messages/thread", {
          contactId: v,
          ...i ? { before: o.value.messages[0]?.seq } : {}
        });
        if (!A || I !== h || u.value !== v) return;
        const ye = Y.messages.some((j) => o.value.messages.some((ue) => ue.id === j.id)), Fe = !s && (i || ye) ? o.value.messages : [], ie = [...new Map([...Fe, ...Y.messages].map((j) => [j.id, j])).values()].sort((j, ue) => j.seq - ue.seq);
        o.value = {
          ...Y,
          messages: ie,
          hasMore: s || i || !ye || ie.length <= 50 ? Y.hasMore : o.value.hasMore
        }, H.value?.contactId === v && ie.some((j) => j.id === H.value?.messageId) && (H.value = null, G.value = null);
      } catch {
        A && I === h && u.value === v && (C.value = "消息暂时无法读取。");
      } finally {
        I === h && (c.value = !1);
      }
    }
    function V(i) {
      if (!A || i.chatIdentity !== l.value.chatIdentity) return;
      const s = R.value?.lastSeq, v = Z.value;
      l.value = i;
      for (const I of m.keys()) i.contacts.some((Y) => Y.id === I) || m.delete(I);
      H.value && !i.contacts.some((I) => I.id === H.value?.contactId) && (H.value = null, G.value = null), u.value && !i.contacts.some((I) => I.id === u.value) ? ne() : u.value && (s !== R.value?.lastSeq || v && !Z.value) && X(!1, v && !Z.value);
    }
    const Ie = f.bridge.subscribe((i) => {
      i.type === "messages/state" && V(i.payload.state);
    });
    function ge(i) {
      u.value = i, d.value = "", o.value = {
        contactId: i,
        messages: [],
        hasMore: !1,
        retryMessageId: null
      }, X();
    }
    function ne() {
      u.value = "", h++, C.value = "", o.value = {
        contactId: "",
        messages: [],
        hasMore: !1,
        retryMessageId: null
      };
    }
    async function z(i) {
      if (!g.value) {
        g.value = !0, d.value = "";
        try {
          await i();
        } catch (s) {
          A && (d.value = s instanceof Error && s.message !== "host_request_timeout" ? s.message : "等待操作结果超时，请核实保存状态后重试。");
        } finally {
          g.value = !1;
        }
      }
    }
    function Me(i) {
      if (T.value || N.value) return;
      const s = {
        contactId: u.value,
        messageId: `input:${oe()}`,
        payload: i,
        createdAt: Date.now()
      };
      H.value = s, G.value = null, m.delete(s.contactId), S.value?.sent(), me(s.contactId, s.messageId, s);
    }
    async function me(i, s, v) {
      if (!g.value) {
        g.value = !0, G.value = null, d.value = "";
        try {
          if (Z.value && (V(await P(l.value.pendingSave ? "messages/confirm" : "messages/refresh")), Z.value))
            return;
          const I = v?.payload.type === "image" ? {
            type: "image",
            description: v.payload.description,
            upload: { ...v.payload.upload }
          } : v ? {
            type: "text",
            text: v.payload.text
          } : void 0;
          V(v ? await P("messages/send", {
            contactId: i,
            actionId: s.slice(6),
            payload: I
          }) : await P("messages/retry", {
            contactId: i,
            messageId: s
          }));
        } catch (I) {
          A && (G.value = {
            contactId: i,
            messageId: s,
            message: I instanceof Error && I.message !== "host_request_timeout" ? I.message : "尚未确认发送结果，可以重试。"
          });
        } finally {
          g.value = !1;
        }
      }
    }
    function Ce(i) {
      const s = N.value?.messageId === i ? N.value : void 0;
      me(u.value, i, s);
    }
    function Se(i) {
      z(async () => {
        V(await P("messages/discard-send", { messageId: i })), H.value?.messageId === i && (H.value = null), G.value = null, await X();
      });
    }
    function Ae(i) {
      z(async () => V(await P(i)));
    }
    function Be() {
      z(async () => {
        V(await P("messages/sync")), U();
      });
    }
    async function Q(i) {
      $.value = i, d.value = "", b.value = "", r.value = R.value?.note ?? "", y.value = "", F.value = oe(), await de(), q.value?.showModal();
    }
    function U() {
      q.value?.close();
    }
    function ce(i = b.value) {
      !i.trim() || T.value || z(async () => {
        const s = await P("messages/contact/add", {
          actionId: F.value,
          name: i.trim(),
          note: r.value.trim()
        });
        V(s.state), U(), ge(s.contactId);
      });
    }
    function De() {
      z(async () => {
        V(await P("messages/contact/note", {
          contactId: u.value,
          note: r.value
        })), U();
      });
    }
    function Ee() {
      z(async () => {
        V(await P("messages/contact/delete", { contactId: u.value })), U(), ne();
      });
    }
    function xe(i) {
      L.value = i, Q("delete-image");
    }
    function Te() {
      const i = u.value, s = L.value;
      z(async () => {
        const v = await P("messages/message/delete-image", {
          contactId: i,
          messageId: s
        });
        V(v.state), A && u.value === i && (h++, c.value = !1, o.value = {
          ...o.value,
          messages: o.value.messages.filter((I) => I.id !== s).map((I) => I.replyTo === s ? {
            ...I,
            replyTo: null
          } : I),
          retryMessageId: v.retryMessageId
        }), U();
      });
    }
    function qe() {
      z(async () => {
        V(await P("messages/recover")), U();
      });
    }
    function Le() {
      z(async () => {
        V(await P("messages/adopt-server-state")), l.value.fileState === "ready" && !l.value.pendingSave ? (H.value = null, G.value = null, U()) : d.value = "暂时未能采用服务器版本，请检查网络后重试。当前记录保持不变。";
      });
    }
    return re(() => {
      A = !1, h++, Ie();
    }), (i, s) => (t(), n("main", Ya, [
      Z.value ? (t(), n("div", Ja, [a("span", null, p(l.value.fileState === "conflict" ? "服务器上的存档已有变化，请选择如何处理。" : "有消息还在等待保存确认，已保存的记录不会丢失。"), 1), a("div", Wa, [a("button", {
        disabled: g.value || !!l.value.busy,
        onClick: s[0] || (s[0] = (v) => Ae(l.value.pendingSave ? "messages/confirm" : "messages/refresh"))
      }, "检查保存", 8, Xa), l.value.fileState === "conflict" ? (t(), n("button", {
        key: 0,
        disabled: g.value || !!l.value.busy || l.value.generationActive,
        onClick: s[1] || (s[1] = (v) => Q("adopt"))
      }, "采用服务器版本", 8, Qa)) : w("", !0)])])) : l.value.unsynced && !l.value.busy ? (t(), n("div", _a, [a("span", null, p(l.value.unsynced) + " 条消息已保留，尚未写入主聊天。", 1), a("button", {
        disabled: T.value,
        onClick: s[2] || (s[2] = (v) => Q("sync"))
      }, "查看", 8, es)])) : w("", !0),
      l.value.generationActive ? (t(), n("div", as, "故事正在继续，稍后就能发送消息。")) : w("", !0),
      d.value || l.value.error ? (t(), n("p", ss, p(d.value || l.value.error), 1)) : w("", !0),
      C.value ? (t(), n("div", ts, [a("span", null, p(C.value), 1), a("button", {
        disabled: c.value,
        onClick: s[3] || (s[3] = (v) => X())
      }, "重试读取", 8, ls)])) : w("", !0),
      R.value ? (t(), ae(Za, {
        key: R.value.id,
        ref_key: "conversation",
        ref: S,
        draft: x.value,
        "onUpdate:draft": s[4] || (s[4] = (v) => x.value = v),
        contact: R.value,
        page: o.value,
        bridge: e.bridge,
        "chat-identity": l.value.chatIdentity,
        disabled: T.value,
        "send-disabled": T.value || !!N.value,
        busy: l.value.busy,
        outgoing: we.value,
        "send-failure": l.value.sendFailure,
        "send-error": G.value,
        working: g.value,
        "pending-save": Z.value,
        "retry-disabled": g.value || !!l.value.busy || l.value.generationActive || l.value.fileState === "conflict",
        loading: c.value,
        "load-more": () => X(!0),
        media: l.value.media,
        "waiting-for": he.value,
        onBack: ne,
        onDetails: s[5] || (s[5] = (v) => Q("detail")),
        onSend: Me,
        onRetry: Ce,
        onDiscard: Se,
        onDeleteImage: xe
      }, null, 8, [
        "draft",
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
      ])) : (t(), ae(aa, {
        key: 6,
        contacts: l.value.contacts,
        "busy-contact-id": l.value.busy?.contactId ?? "",
        drafts: m,
        onSelect: ge,
        onAdd: s[6] || (s[6] = (v) => Q("add"))
      }, null, 8, [
        "contacts",
        "busy-contact-id",
        "drafts"
      ])),
      a("dialog", {
        ref_key: "dialog",
        ref: q,
        class: "messages-dialog",
        onKeydown: s[15] || (s[15] = $e(ee(() => {
        }, ["stop"]), ["esc"])),
        onClick: s[16] || (s[16] = (v) => {
          v.target === q.value && U();
        })
      }, [
        a("header", null, [
          $.value === "detail" && R.value ? (t(), ae(te, {
            key: 0,
            identity: R.value.id,
            name: R.value.name,
            small: ""
          }, null, 8, ["identity", "name"])) : w("", !0),
          a("h2", null, p($.value === "add" ? "新的对话" : $.value === "detail" ? R.value?.name : $.value === "delete" ? "删除联系人？" : $.value === "delete-image" ? "删除这条图片消息？" : $.value === "sync" ? "消息还未写入主聊天" : $.value === "adopt" ? "采用服务器版本？" : "在当前位置补记？"), 1),
          a("button", {
            class: "messages-icon-button",
            "aria-label": "关闭",
            onClick: U
          }, [M(B, { name: "close" })])
        ]),
        d.value ? (t(), n("p", ns, p(d.value), 1)) : w("", !0),
        $.value === "add" ? (t(), n(E, { key: 1 }, [
          a("label", is, [M(B, { name: "search" }), J(a("input", {
            "onUpdate:modelValue": s[7] || (s[7] = (v) => y.value = v),
            placeholder: "查找已知人物",
            "aria-label": "查找已知人物"
          }, null, 512), [[W, y.value]])]),
          a("div", us, [(t(!0), n(E, null, le(ve.value, (v) => (t(), n("button", {
            key: v.name,
            disabled: T.value,
            onClick: (I) => ce(v.name)
          }, [
            M(te, {
              identity: v.name,
              name: v.name,
              small: ""
            }, null, 8, ["identity", "name"]),
            a("span", null, [O(p(v.name), 1), v.aliases.length ? (t(), n("small", ds, p(v.aliases.join("、")), 1)) : w("", !0)]),
            M(B, { name: "plus" })
          ], 8, os))), 128)), ve.value.length ? w("", !0) : (t(), n("p", rs, "没有更多已知人物，可以在下面补充。"))]),
          a("details", vs, [s[19] || (s[19] = a("summary", null, "想联系的人不在这里？", -1)), a("form", { onSubmit: s[10] || (s[10] = ee((v) => ce(), ["prevent"])) }, [
            a("label", null, [s[17] || (s[17] = O("姓名", -1)), J(a("input", {
              "onUpdate:modelValue": s[8] || (s[8] = (v) => b.value = v),
              maxlength: "120",
              required: "",
              placeholder: "对方的姓名"
            }, null, 512), [[W, b.value]])]),
            a("label", null, [s[18] || (s[18] = O("身份说明（可选）", -1)), J(a("textarea", {
              "onUpdate:modelValue": s[9] || (s[9] = (v) => r.value = v),
              maxlength: "600",
              rows: "2",
              placeholder: "例如：住在隔壁的花店老板"
            }, null, 512), [[W, r.value]])]),
            a("button", {
              class: "messages-primary",
              disabled: T.value || !b.value.trim()
            }, "添加并聊天", 8, gs)
          ], 32)])
        ], 64)) : $.value === "detail" ? (t(), n("form", {
          key: 2,
          onSubmit: ee(De, ["prevent"])
        }, [
          a("label", null, [s[20] || (s[20] = O("身份说明 / 备注", -1)), J(a("textarea", {
            "onUpdate:modelValue": s[11] || (s[11] = (v) => r.value = v),
            maxlength: "600",
            rows: "3",
            placeholder: "帮助辨认这位联系人"
          }, null, 512), [[W, r.value]])]),
          a("button", {
            class: "messages-primary",
            disabled: T.value
          }, "保存备注", 8, ms),
          a("button", {
            type: "button",
            class: "messages-danger",
            disabled: T.value,
            onClick: s[12] || (s[12] = (v) => $.value = "delete")
          }, "删除联系人与通讯记录", 8, cs)
        ], 32)) : $.value === "delete" ? (t(), n(E, { key: 3 }, [
          a("p", null, "会删除信息 APP 内与 " + p(R.value?.name) + " 的全部通讯和摘要，不能恢复。主聊天中的「私人信息」楼层不会删除，其他联系人不受影响。", 1),
          a("button", {
            class: "messages-danger",
            disabled: T.value,
            onClick: Ee
          }, "确认删除", 8, ys),
          a("button", {
            class: "messages-secondary",
            onClick: s[13] || (s[13] = (v) => $.value = "detail")
          }, "保留联系人")
        ], 64)) : $.value === "delete-image" ? (t(), n(E, { key: 4 }, [
          s[21] || (s[21] = a("p", null, "这条图片及配文将从信息 APP 中删除，不再发送给模型，不能恢复。其他消息保留。", -1)),
          s[22] || (s[22] = a("p", { class: "messages-subtle" }, "主聊天里的记录和图库原图不会删除。", -1)),
          a("button", {
            class: "messages-danger",
            disabled: T.value,
            onClick: Te
          }, "确认删除", 8, bs),
          a("button", {
            class: "messages-secondary",
            onClick: U
          }, "取消")
        ], 64)) : $.value === "sync" ? (t(), n(E, { key: 5 }, [
          s[25] || (s[25] = a("p", null, "信息 APP 已保留这些消息。重试只会补上主聊天里的记录，不会再次向对方发送，也不会重新生成回复。", -1)),
          a("button", {
            class: "messages-primary",
            disabled: T.value,
            onClick: Be
          }, "重试写入", 8, fs),
          a("details", ps, [
            s[23] || (s[23] = a("summary", null, "原来的记录已被修改或删除？", -1)),
            s[24] || (s[24] = a("p", null, "不会覆盖你的修改。需要这些消息继续进入剧情时，可以在当前位置另加一条补记。", -1)),
            a("button", {
              class: "messages-secondary",
              disabled: T.value,
              onClick: s[14] || (s[14] = (v) => $.value = "recover")
            }, "查看补记方式", 8, ks)
          ])
        ], 64)) : $.value === "adopt" ? (t(), n(E, { key: 6 }, [
          s[26] || (s[26] = a("p", null, "将读取服务器上的当前聊天小白 OS 存档，放弃本地尚未确认的修改。信息 APP 会显示服务器已保存的联系人和消息。", -1)),
          s[27] || (s[27] = a("p", { class: "messages-subtle" }, "这项选择作用于当前聊天的整份 OS 存档，不会删除主聊天里的记录，也不会重新生成回复。", -1)),
          a("button", {
            class: "messages-danger",
            disabled: g.value || !!l.value.busy || l.value.generationActive,
            onClick: Le
          }, "确认采用服务器版本", 8, $s),
          a("button", {
            class: "messages-secondary",
            disabled: g.value,
            onClick: U
          }, "暂不处理", 8, ws)
        ], 64)) : (t(), n(E, { key: 7 }, [
          s[28] || (s[28] = a("p", null, "先检查已有记录；仍未写入的消息会在主聊天当前位置标为「补录」，保留原发送时间。不会覆盖旧记录或恢复你删除的那一条。", -1)),
          a("button", {
            class: "messages-primary",
            disabled: T.value,
            onClick: qe
          }, "确认补记", 8, hs),
          a("button", {
            class: "messages-secondary",
            onClick: U
          }, "暂不补记")
        ], 64))
      ], 544)
    ]));
  }
}), Ss = Is;
export {
  Ss as default
};
