/* eslint-disable */
import { D as Ue, F as fe, H as h, I as pe, J as $, K as _, O as de, R as ke, S as se, V as Re, b as Z, f as B, g as n, h as k, j as le, k as t, l as oe, m as ee, o as W, p as a, q as $e, s as ze, u as E, v as J, w as ye, y as I, z as K } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { n as He } from "./xiaobai-os-app-navigation-D5qZ5Ulq.js";
import { t as he } from "./xiaobai-os-AppDialog-ycKLGrLE.js";
var Ge = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.8",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
}, je = ["d"], Ze = /* @__PURE__ */ Z({
  __name: "MessageIcon",
  props: { name: {} },
  setup(e) {
    const p = {
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
    return (l, u) => (t(), n("svg", Ge, [a("path", { d: p[e.name] }, null, 8, je)]));
  }
}), D = Ze, Ne = /* @__PURE__ */ Z({
  __name: "ContactAvatar",
  props: {
    identity: {},
    name: {},
    small: { type: Boolean }
  },
  setup(e) {
    const p = e, l = B(() => {
      let u = 0;
      for (const o of p.identity) u = Math.imul(u, 31) + o.codePointAt(0) | 0;
      return String((u >>> 0) % 360);
    });
    return (u, o) => (t(), n("span", {
      class: _(["messages-avatar", { small: e.small }]),
      style: $e({ "--avatar-hue": l.value }),
      "aria-hidden": "true"
    }, $(Array.from(e.name)[0]), 7));
  }
}), te = Ne, Oe = { class: "messages-contacts" }, Ke = { class: "messages-home-header" }, Je = { class: "messages-search" }, Ye = {
  key: 0,
  class: "messages-empty"
}, We = {
  key: 1,
  class: "messages-contact-rows"
}, Xe = {
  key: 0,
  class: "messages-subtle"
}, Qe = ["onClick"], _e = { class: "messages-contact-copy" }, ea = { class: "messages-contact-heading" }, aa = {
  key: 0,
  class: "messages-preview messages-preview-active"
}, sa = {
  key: 1,
  class: "messages-preview"
}, ta = {
  key: 2,
  class: "messages-preview"
}, la = /* @__PURE__ */ Z({
  __name: "ContactList",
  props: {
    contacts: {},
    busyContactId: {},
    drafts: {}
  },
  emits: ["select", "add"],
  setup(e) {
    const p = e, l = h(""), u = B(() => p.contacts.filter((c) => `${c.name} ${c.note}`.toLocaleLowerCase().includes(l.value.toLocaleLowerCase())));
    function o(c) {
      if (c === null) return "";
      const v = new Date(c);
      return v.toDateString() === (/* @__PURE__ */ new Date()).toDateString() ? v.toLocaleTimeString(void 0, {
        hour: "2-digit",
        minute: "2-digit"
      }) : v.toLocaleDateString(void 0, {
        month: "numeric",
        day: "numeric"
      });
    }
    return (c, v) => (t(), n("section", Oe, [
      a("header", Ke, [v[3] || (v[3] = a("h1", null, "信息", -1)), a("button", {
        class: "messages-icon-button",
        "aria-label": "添加联系人",
        onClick: v[0] || (v[0] = (d) => c.$emit("add"))
      }, [I(D, { name: "plus" })])]),
      a("label", Je, [I(D, { name: "search" }), K(a("input", {
        "onUpdate:modelValue": v[1] || (v[1] = (d) => l.value = d),
        type: "search",
        placeholder: "搜索联系人",
        "aria-label": "搜索联系人"
      }, null, 512), [[W, l.value]])]),
      e.contacts.length ? (t(), n("div", We, [u.value.length ? k("", !0) : (t(), n("p", Xe, "没有找到这个人。")), (t(!0), n(E, null, le(u.value, (d) => (t(), n("button", {
        key: d.id,
        class: "messages-contact-row",
        onClick: (M) => c.$emit("select", d.id)
      }, [I(te, {
        identity: d.id,
        name: d.name
      }, null, 8, ["identity", "name"]), a("span", _e, [a("span", ea, [a("strong", null, $(d.name), 1), a("time", null, $(o(d.lastAt)), 1)]), e.busyContactId === d.id ? (t(), n("span", aa, "正在等待回复…")) : e.drafts.get(d.id)?.text.trim() || e.drafts.get(d.id)?.image ? (t(), n("span", sa, [v[6] || (v[6] = a("em", null, "草稿", -1)), J(" " + $(e.drafts.get(d.id)?.image ? "［图片］" : "") + $(e.drafts.get(d.id)?.text), 1)])) : (t(), n("span", ta, $(d.preview), 1))])], 8, Qe))), 128))])) : (t(), n("div", Ye, [
        I(D, { name: "message" }),
        v[5] || (v[5] = a("h2", null, "暂无联系人", -1)),
        a("button", {
          class: "messages-primary",
          onClick: v[2] || (v[2] = (d) => c.$emit("add"))
        }, [v[4] || (v[4] = J("添加联系人", -1)), I(D, { name: "plus" })])
      ]))
    ]));
  }
}), na = la, ia = { key: 0 }, ua = ["src", "alt"], oa = ["disabled"], da = {
  key: 3,
  class: "messages-image-placeholder messages-media-unavailable"
}, ra = {
  key: 4,
  class: "messages-image-caption"
}, va = ["disabled"], ma = ["src", "alt"], ga = ["disabled", "aria-label"], ca = {
  key: 0,
  class: "messages-media-unavailable-note"
}, ya = {
  key: 2,
  class: "messages-transcript"
}, ba = {
  key: 3,
  class: "messages-media-error",
  role: "status"
}, fa = /* @__PURE__ */ Z({
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
    const p = e, l = h(""), u = h(!1), o = h(""), c = h(""), v = h(!1), d = B(() => p.message.payload.type === "image" ? p.message.payload.attachment : void 0), M = B(() => d.value?.path || l.value), S = h(!1), L = h(!1), f = B(() => [
      "playing",
      "loading",
      "generating",
      "queued"
    ].includes(c.value)), T = h(!1);
    let b = !0;
    const r = (w) => p.bridge.request(w, {
      chatIdentity: p.chatIdentity,
      messageId: p.message.id
    }, 18e4);
    async function y(w) {
      if (!u.value) {
        u.value = !0, o.value = "";
        try {
          const { result: g } = await r(w ? "messages/image/generate" : "messages/image/check");
          b && (l.value = g.data ?? "", S.value = !1, w && !l.value && (o.value = "请开启画图后再试，画面描述已保留。"));
        } catch {
          b && w && (o.value = "图片生成失败，可以再试一次。");
        } finally {
          b && (u.value = !1);
        }
      }
    }
    async function F() {
      if (T.value) return;
      o.value = "";
      const w = f.value;
      if (!(!w && !p.media.voice))
        try {
          w ? (T.value = !0, await r("messages/voice/stop"), b && (c.value = "")) : (c.value = "loading", await r("messages/voice/play"));
        } catch {
          b && (w || (c.value = ""), o.value = w ? "未能确认停止，请再点一次停止。" : "语音暂时无法播放，原文仍可查看。");
        } finally {
          b && (T.value = !1);
        }
    }
    const A = p.bridge.subscribe((w) => {
      if (w.type !== "messages/voice-state") return;
      const g = w.payload;
      g.messageId === p.message.id ? c.value = g.status : g.status === "playing" && (c.value = ""), g.messageId === p.message.id && g.status === "error" && (o.value = "播放失败，点击可以重试。");
    });
    return Ue(() => {
      p.message.payload.type === "image" && !d.value && y(!1);
    }), pe(() => p.media.image, (w) => {
      w && p.message.payload.type === "image" && !d.value && !l.value && y(!1);
    }), de(() => {
      b = !1, A();
    }), (w, g) => (t(), n("article", { class: _(["messages-bubble-row", { outgoing: e.message.sender === "user" }]) }, [a("div", { class: _(["messages-bubble", `messages-bubble-${e.message.payload.type}`]) }, [e.message.payload.type === "text" ? (t(), n("p", ia, $(e.message.payload.text), 1)) : e.message.payload.type === "image" ? (t(), n(E, { key: 1 }, [
      M.value && !S.value ? (t(), n("button", {
        key: 0,
        class: "messages-image-open",
        "aria-label": "放大图片",
        onClick: g[2] || (g[2] = (x) => L.value = !0)
      }, [a("img", {
        src: M.value,
        alt: e.message.payload.description || d.value?.name || "图片",
        onLoad: g[0] || (g[0] = (x) => w.$emit("resize")),
        onError: g[1] || (g[1] = (x) => S.value = !0)
      }, null, 40, ua)])) : d.value ? (t(), n("button", {
        key: 1,
        class: "messages-image-placeholder",
        onClick: g[3] || (g[3] = (x) => S.value = !1)
      }, [
        I(D, { name: "image" }),
        g[9] || (g[9] = a("span", null, "原图暂时无法读取", -1)),
        g[10] || (g[10] = a("small", null, "点击重试", -1))
      ])) : e.media.image ? (t(), n("button", {
        key: 2,
        class: "messages-image-placeholder",
        disabled: u.value,
        onClick: g[4] || (g[4] = (x) => y(!0))
      }, [I(D, { name: "image" }), a("span", null, $(u.value ? "正在生成图片…" : o.value ? "重新生成图片" : "生成图片"), 1)], 8, oa)) : (t(), n("div", da, [
        I(D, { name: "image" }),
        g[11] || (g[11] = a("span", null, "图片描述", -1)),
        g[12] || (g[12] = a("small", null, "开启画图后可生成图片", -1))
      ])),
      e.message.payload.description ? (t(), n("p", ra, $(e.message.payload.description), 1)) : k("", !0),
      e.message.sender === "user" && d.value ? (t(), n("button", {
        key: 5,
        class: "messages-image-delete",
        disabled: e.disabled,
        onClick: g[5] || (g[5] = (x) => w.$emit("deleteImage", e.message.id))
      }, "删除图片消息", 8, va)) : k("", !0),
      L.value ? (t(), ee(he, {
        key: 6,
        class: "messages-image-viewer",
        "aria-label": "查看图片",
        onClose: g[7] || (g[7] = (x) => L.value = !1)
      }, {
        default: ke(() => [a("button", {
          "aria-label": "关闭图片",
          onClick: g[6] || (g[6] = (x) => L.value = !1)
        }, [I(D, { name: "close" })]), M.value ? (t(), n("img", {
          key: 0,
          src: M.value,
          alt: e.message.payload.description || d.value?.name || "图片"
        }, null, 8, ma)) : k("", !0)]),
        _: 1
      })) : k("", !0)
    ], 64)) : (t(), n(E, { key: 2 }, [
      a("button", {
        class: "messages-voice-button",
        disabled: T.value || !e.media.voice && !f.value,
        "aria-label": f.value ? "停止播放" : "播放语音",
        onClick: F
      }, [
        I(D, { name: f.value ? "stop" : "play" }, null, 8, ["name"]),
        a("span", { class: _(["messages-wave", { playing: c.value === "playing" }]) }, [(t(), n(E, null, le(16, (x) => a("i", {
          key: x,
          style: $e({
            height: `${8 + x * 7 % 17}px`,
            animationDelay: `${x * 45}ms`
          })
        }, null, 4)), 64))], 2),
        a("small", null, $(T.value ? "停止中" : [
          "loading",
          "generating",
          "queued"
        ].includes(c.value) ? "准备中" : "语音"), 1)
      ], 8, ga),
      e.media.voice ? k("", !0) : (t(), n("small", ca, "开启 TTS 后可播放")),
      e.media.voice ? (t(), n("button", {
        key: 1,
        class: "messages-transcript-toggle",
        onClick: g[8] || (g[8] = (x) => v.value = !v.value)
      }, $(v.value ? "收起原文" : "查看原文"), 1)) : k("", !0),
      v.value || !e.media.voice ? (t(), n("p", ya, $(e.message.payload.transcript), 1)) : k("", !0)
    ], 64)), o.value ? (t(), n("small", ba, $(o.value), 1)) : k("", !0)], 2)], 2));
  }
}), pa = fa, ka = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
], qs = 4 * 1024 * 1024;
async function $a(e) {
  if (!ka.includes(e.type)) throw new Error("请选择 PNG、JPG、WEBP 或 GIF 图片。");
  if (!e.size || e.size > 4194304) throw new Error("请选择不超过 4MB 的图片。");
  const p = await new Promise((u, o) => {
    const c = new FileReader();
    c.onerror = () => o(/* @__PURE__ */ new Error("图片读取失败，请重新选择。")), c.onload = () => typeof c.result == "string" ? u(c.result) : o(/* @__PURE__ */ new Error("图片读取失败。")), c.readAsDataURL(e);
  }), l = new Image();
  l.src = p;
  try {
    await l.decode();
  } catch {
    throw new Error("这张图片无法打开，请换一张。");
  }
  return {
    dataUrl: p,
    name: e.name.replace(/[\u0000-\u001f\u007f]/gu, "").trim().slice(0, 120) || "图片"
  };
}
var ha = {
  key: 0,
  class: "messages-attachment-preview"
}, wa = ["src", "alt"], Ia = ["disabled"], Ca = {
  key: 1,
  class: "messages-composer-hint"
}, Ma = {
  key: 2,
  class: "messages-composer-hint",
  role: "status"
}, Sa = {
  key: 3,
  class: "messages-composer-wait",
  role: "status"
}, Aa = { class: "messages-composer-line" }, Da = ["disabled"], Ba = ["placeholder", "disabled"], Ea = ["disabled"], xa = /* @__PURE__ */ Z({
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
  setup(e, { emit: p }) {
    const l = e, u = p, o = fe(e, "draft"), c = B({
      get: () => o.value.text,
      set: (r) => {
        o.value = {
          ...o.value,
          text: r
        };
      }
    }), v = h(null), d = h(!1), M = h("");
    let S = !0;
    async function L(r) {
      const y = r.target, F = y.files?.[0];
      if (y.value = "", !(!F || l.sending || d.value)) {
        d.value = !0, M.value = "";
        try {
          const A = await $a(F);
          S && (o.value = {
            ...o.value,
            image: A
          });
        } catch (A) {
          S && (M.value = A instanceof Error ? A.message : "图片读取失败，请重新选择。");
        } finally {
          S && (d.value = !1);
        }
      }
    }
    function f() {
      o.value = {
        ...o.value,
        image: null
      }, M.value = "";
    }
    function T() {
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
    de(() => {
      S = !1;
    });
    function b(r) {
      r.key === "Enter" && (r.ctrlKey || r.metaKey) && !r.isComposing && (r.preventDefault(), T());
    }
    return (r, y) => (t(), n("form", {
      class: "messages-composer",
      onSubmit: oe(T, ["prevent"])
    }, [
      a("input", {
        ref_key: "fileInput",
        ref: v,
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/gif",
        hidden: "",
        "aria-label": "选择图片文件",
        onChange: L
      }, null, 544),
      o.value.image ? (t(), n("div", ha, [
        a("img", {
          src: o.value.image.dataUrl,
          alt: o.value.image.name
        }, null, 8, wa),
        a("span", null, [y[2] || (y[2] = a("strong", null, "待发送的图片", -1)), a("small", null, $(o.value.image.name), 1)]),
        a("button", {
          type: "button",
          class: "messages-icon-button",
          "aria-label": "移除图片",
          disabled: e.sending || d.value,
          onClick: f
        }, [I(D, { name: "close" })], 8, Ia)
      ])) : k("", !0),
      o.value.image ? (t(), n("p", Ca, "图片将随消息发送，需要当前模型支持看图。")) : k("", !0),
      d.value || M.value ? (t(), n("p", Ma, $(d.value ? "正在读取图片…" : M.value), 1)) : k("", !0),
      e.waitingFor ? (t(), n("p", Sa, "正在等待 " + $(e.waitingFor) + " 的回复。可以先写好，稍后发送。", 1)) : k("", !0),
      a("div", Aa, [
        a("button", {
          type: "button",
          class: "messages-icon-button messages-attach",
          "aria-label": "选择图片",
          disabled: e.sending || d.value,
          onClick: y[0] || (y[0] = (F) => v.value?.click())
        }, [I(D, { name: "plus" })], 8, Da),
        K(a("textarea", {
          "onUpdate:modelValue": y[1] || (y[1] = (F) => c.value = F),
          rows: "1",
          maxlength: "4000",
          placeholder: o.value.image ? "给图片配句话…" : "说点什么…",
          "aria-label": "消息内容",
          disabled: e.sending,
          onKeydown: b
        }, null, 40, Ba), [[W, c.value]]),
        a("button", {
          class: "messages-send",
          type: "submit",
          disabled: e.disabled || d.value || !c.value.trim() && !o.value.image,
          "aria-label": "发送"
        }, [I(D, { name: "send" })], 8, Ea)
      ])
    ], 32));
  }
}), qa = xa, La = {
  class: "messages-delivery",
  role: "status"
}, Ta = { key: 0 }, Fa = ["disabled"], Pa = ["disabled"], Va = /* @__PURE__ */ Z({
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
    return (p, l) => (t(), n("div", La, [e.sending ? (t(), n("span", Ta, "发送中…")) : (t(), n(E, { key: 1 }, [
      a("span", null, $(e.error || (e.pendingSave ? "尚待保存确认" : "尚未收到回复")), 1),
      a("button", {
        disabled: e.disabled,
        onClick: l[0] || (l[0] = (u) => p.$emit("retry"))
      }, $(e.pendingSave ? "检查并重试" : "重试"), 9, Fa),
      e.discard && !e.pendingSave ? (t(), n("button", {
        key: 0,
        disabled: e.disabled,
        onClick: l[1] || (l[1] = (u) => p.$emit("discard"))
      }, "删除", 8, Pa)) : k("", !0)
    ], 64))]));
  }
}), be = Va, Ua = { class: "messages-conversation" }, Ra = { class: "messages-thread-header" }, za = ["disabled"], Ha = {
  key: 1,
  class: "messages-thread-start"
}, Ga = {
  key: 0,
  class: "messages-time"
}, ja = { class: "messages-bubble-row outgoing" }, Za = { key: 0 }, Na = ["src", "alt"], Oa = {
  key: 0,
  class: "messages-image-caption"
}, Ka = {
  key: 3,
  class: "messages-typing",
  role: "status"
}, Ja = /* @__PURE__ */ Z({
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
  setup(e, { expose: p }) {
    const l = fe(e, "draft"), u = e, o = B(() => u.busy?.contactId === u.contact.id ? u.busy.stage : ""), c = B(() => [
      "replying",
      "summarizing",
      "saving-reply"
    ].includes(o.value));
    function v(b) {
      return [u.sendFailure, u.sendError].find((r) => r?.contactId === u.contact.id && r.messageId === b)?.message;
    }
    const d = h(null);
    let M = !0, S = !1;
    function L() {
      const b = d.value;
      b && (M = b.scrollHeight - b.clientHeight - b.scrollTop < 70);
    }
    async function f() {
      await ye(), M && !S && d.value && (d.value.scrollTop = d.value.scrollHeight);
    }
    pe(() => [
      u.page.messages.at(-1)?.id,
      u.outgoing?.messageId,
      o.value,
      u.sendFailure,
      u.sendError
    ], f, { immediate: !0 });
    async function T() {
      const b = d.value;
      if (!b || S) return;
      S = !0;
      const r = b.scrollHeight, y = b.scrollTop;
      try {
        await u.loadMore(), await ye(), b.scrollTop = y + b.scrollHeight - r;
      } finally {
        S = !1, L();
      }
    }
    return p({ sent() {
      M = !0, f();
    } }), (b, r) => (t(), n("section", Ua, [
      a("header", Ra, [
        a("button", {
          class: "messages-icon-button",
          "aria-label": "返回信息",
          onClick: r[0] || (r[0] = (y) => b.$emit("back"))
        }, [I(D, { name: "back" })]),
        I(te, {
          identity: e.contact.id,
          name: e.contact.name,
          small: ""
        }, null, 8, ["identity", "name"]),
        a("div", null, [a("h2", null, $(e.contact.name), 1)]),
        a("button", {
          class: "messages-icon-button",
          "aria-label": "联系人详情",
          onClick: r[1] || (r[1] = (y) => b.$emit("details"))
        }, [I(D, { name: "more" })])
      ]),
      a("div", {
        ref_key: "scroller",
        ref: d,
        class: "messages-thread-scroll",
        onScroll: L
      }, [
        e.page.hasMore ? (t(), n("button", {
          key: 0,
          class: "messages-older",
          disabled: e.loading,
          onClick: T
        }, $(e.loading ? "读取中…" : "查看更早的消息"), 9, za)) : k("", !0),
        e.loading && !e.page.messages.length ? (t(), n("p", Ha, "正在读取消息…")) : k("", !0),
        (t(!0), n(E, null, le(e.page.messages, (y, F) => (t(), n(E, { key: y.id }, [
          F === 0 || y.createdAt - e.page.messages[F - 1].createdAt > 3e5 ? (t(), n("time", Ga, $(new Date(y.createdAt).toLocaleString(void 0, {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })), 1)) : k("", !0),
          I(pa, {
            message: y,
            bridge: e.bridge,
            "chat-identity": e.chatIdentity,
            media: e.media,
            disabled: e.disabled,
            onResize: f,
            onDeleteImage: r[2] || (r[2] = (A) => b.$emit("deleteImage", A))
          }, null, 8, [
            "message",
            "bridge",
            "chat-identity",
            "media",
            "disabled"
          ]),
          y.id === e.page.retryMessageId && !c.value ? (t(), ee(be, {
            key: 1,
            sending: e.busy?.messageId === y.id && ["saving", "uploading"].includes(o.value),
            error: v(y.id),
            "pending-save": e.pendingSave,
            disabled: e.retryDisabled,
            onRetry: (A) => b.$emit("retry", y.id)
          }, null, 8, [
            "sending",
            "error",
            "pending-save",
            "disabled",
            "onRetry"
          ])) : k("", !0)
        ], 64))), 128)),
        e.outgoing ? (t(), n(E, { key: 2 }, [a("div", ja, [a("div", { class: _(["messages-bubble", { "messages-bubble-image": e.outgoing.payload.type === "image" }]) }, [e.outgoing.payload.type === "text" ? (t(), n("p", Za, $(e.outgoing.payload.text), 1)) : (t(), n(E, { key: 1 }, [a("img", {
          class: "messages-pending-image",
          src: e.outgoing.payload.upload.dataUrl,
          alt: e.outgoing.payload.upload.name,
          onLoad: f
        }, null, 40, Na), e.outgoing.payload.description ? (t(), n("p", Oa, $(e.outgoing.payload.description), 1)) : k("", !0)], 64))], 2)]), I(be, {
          sending: e.working || e.busy?.messageId === e.outgoing.messageId,
          error: v(e.outgoing.messageId) || "发送未完成",
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
        ])], 64)) : k("", !0),
        c.value ? (t(), n("div", Ka, [...r[7] || (r[7] = [a("span", null, [
          a("i"),
          a("i"),
          a("i")
        ], -1), J("对方正在输入…", -1)])])) : k("", !0)
      ], 544),
      I(qa, {
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
}), Ya = Ja, Wa = () => ({
  text: "",
  image: null
});
function ue() {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (e) => e.toString(16).padStart(2, "0")).join("");
}
var Xa = { class: "messages-app" }, Qa = {
  key: 0,
  class: "messages-banner",
  role: "status"
}, _a = { class: "messages-save-actions" }, es = ["disabled"], as = ["disabled"], ss = {
  key: 1,
  class: "messages-banner",
  role: "status"
}, ts = ["disabled"], ls = {
  key: 2,
  class: "messages-notice"
}, ns = {
  key: 3,
  class: "messages-error",
  role: "alert"
}, is = {
  key: 4,
  class: "messages-banner",
  role: "alert"
}, us = ["disabled"], os = { id: "messages-dialog-title" }, ds = ["disabled"], rs = {
  key: 0,
  class: "messages-error",
  role: "alert"
}, vs = { class: "messages-search" }, ms = { class: "messages-known-list" }, gs = ["disabled", "onClick"], cs = { key: 0 }, ys = {
  key: 0,
  class: "messages-subtle"
}, bs = { class: "messages-manual" }, fs = ["disabled"], ps = ["disabled"], ks = ["disabled"], $s = ["disabled"], hs = ["disabled"], ws = ["disabled"], Is = { class: "messages-manual" }, Cs = ["disabled"], Ms = ["disabled"], Ss = ["disabled"], As = ["disabled"], Ds = /* @__PURE__ */ Z({
  __name: "MessagesApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(e) {
    const p = e, l = h(p.initialState), u = h(""), o = h({
      contactId: "",
      messages: [],
      hasMore: !1,
      retryMessageId: null
    }), c = h(!1), v = h(!1), d = h(""), M = h(""), S = h(null), L = h(!1), f = h("add"), T = h(""), b = h(""), r = h(""), y = h(""), F = h(ue());
    let A = !0, w = 0;
    const g = Re(/* @__PURE__ */ new Map()), x = B({
      get: () => g.get(u.value) ?? Wa(),
      set: (i) => {
        g.set(u.value, i);
      }
    }), z = h(null), G = h(null), N = B(() => l.value.outgoing ?? z.value), we = B(() => N.value?.contactId === u.value && !o.value.messages.some((i) => i.id === N.value?.messageId) ? N.value : null), V = B(() => l.value.contacts.find((i) => i.id === u.value)), Ie = B(() => l.value.busy && l.value.busy.contactId !== u.value ? l.value.contacts.find((i) => i.id === l.value.busy?.contactId)?.name ?? "另一位联系人" : ""), O = B(() => l.value.pendingSave || [
      "unconfirmed",
      "conflict",
      "failed"
    ].includes(l.value.fileState)), q = B(() => v.value || !!l.value.busy || l.value.pendingSave || l.value.fileState !== "ready" || l.value.generationActive), re = B(() => l.value.knownPeople.filter((i) => !l.value.contacts.some((s) => s.name === i.name) && `${i.name} ${i.aliases.join(" ")}`.toLocaleLowerCase().includes(y.value.toLocaleLowerCase())));
    async function P(i, s = {}) {
      return (await p.bridge.request(i, {
        chatIdentity: l.value.chatIdentity,
        ...s
      }, 6e4)).result;
    }
    async function X(i = !1, s = !1) {
      const m = u.value;
      if (!m) return;
      const C = ++w;
      c.value = !0, M.value = "";
      try {
        const Y = await P("messages/thread", {
          contactId: m,
          ...i ? { before: o.value.messages[0]?.seq } : {}
        });
        if (!A || C !== w || u.value !== m) return;
        const ce = Y.messages.some((j) => o.value.messages.some((ie) => ie.id === j.id)), Ve = !s && (i || ce) ? o.value.messages : [], ne = [...new Map([...Ve, ...Y.messages].map((j) => [j.id, j])).values()].sort((j, ie) => j.seq - ie.seq);
        o.value = {
          ...Y,
          messages: ne,
          hasMore: s || i || !ce || ne.length <= 50 ? Y.hasMore : o.value.hasMore
        }, z.value?.contactId === m && ne.some((j) => j.id === z.value?.messageId) && (z.value = null, G.value = null);
      } catch {
        A && C === w && u.value === m && (M.value = "消息暂时无法读取。");
      } finally {
        C === w && (c.value = !1);
      }
    }
    function U(i) {
      if (!A || i.chatIdentity !== l.value.chatIdentity) return;
      const s = V.value?.lastSeq, m = O.value;
      l.value = i;
      for (const C of g.keys()) i.contacts.some((Y) => Y.id === C) || g.delete(C);
      z.value && !i.contacts.some((C) => C.id === z.value?.contactId) && (z.value = null, G.value = null), u.value && !i.contacts.some((C) => C.id === u.value) ? ae() : u.value && (s !== V.value?.lastSeq || m && !O.value) && X(!1, m && !O.value);
    }
    const Ce = p.bridge.subscribe((i) => {
      i.type === "messages/state" && U(i.payload.state);
    });
    function ve(i) {
      u.value = i, d.value = "", o.value = {
        contactId: i,
        messages: [],
        hasMore: !1,
        retryMessageId: null
      }, X();
    }
    function ae() {
      u.value = "", w++, M.value = "", o.value = {
        contactId: "",
        messages: [],
        hasMore: !1,
        retryMessageId: null
      };
    }
    He(() => (ae(), !0), () => !!u.value);
    async function H(i) {
      if (!v.value) {
        v.value = !0, d.value = "";
        try {
          await i();
        } catch (s) {
          A && (d.value = s instanceof Error && s.message !== "host_request_timeout" ? s.message : "等待操作结果超时，请核实保存状态后重试。");
        } finally {
          v.value = !1;
        }
      }
    }
    function Me(i) {
      if (q.value || N.value) return;
      const s = {
        contactId: u.value,
        messageId: `input:${ue()}`,
        payload: i,
        createdAt: Date.now()
      };
      z.value = s, G.value = null, g.delete(s.contactId), S.value?.sent(), me(s.contactId, s.messageId, s);
    }
    async function me(i, s, m) {
      if (!v.value) {
        v.value = !0, G.value = null, d.value = "";
        try {
          if (O.value && (U(await P(l.value.pendingSave ? "messages/confirm" : "messages/refresh")), O.value))
            return;
          const C = m?.payload.type === "image" ? {
            type: "image",
            description: m.payload.description,
            upload: { ...m.payload.upload }
          } : m ? {
            type: "text",
            text: m.payload.text
          } : void 0;
          U(m ? await P("messages/send", {
            contactId: i,
            actionId: s.slice(6),
            payload: C
          }) : await P("messages/retry", {
            contactId: i,
            messageId: s
          }));
        } catch (C) {
          A && (G.value = {
            contactId: i,
            messageId: s,
            message: C instanceof Error && C.message !== "host_request_timeout" ? C.message : "尚未确认发送结果，可以重试。"
          });
        } finally {
          v.value = !1;
        }
      }
    }
    function Se(i) {
      const s = N.value?.messageId === i ? N.value : void 0;
      me(u.value, i, s);
    }
    function Ae(i) {
      H(async () => {
        U(await P("messages/discard-send", { messageId: i })), z.value?.messageId === i && (z.value = null), G.value = null, await X();
      });
    }
    function De(i) {
      H(async () => U(await P(i)));
    }
    function Be() {
      H(async () => {
        U(await P("messages/sync")), R();
      });
    }
    function Q(i) {
      f.value = i, d.value = "", b.value = "", r.value = V.value?.note ?? "", y.value = "", F.value = ue(), L.value = !0;
    }
    function R() {
      L.value = !1;
    }
    function Ee() {
      v.value || (f.value === "delete" ? f.value = "detail" : f.value === "recover" ? f.value = "sync" : R());
    }
    function ge(i = b.value) {
      !i.trim() || q.value || H(async () => {
        const s = await P("messages/contact/add", {
          actionId: F.value,
          name: i.trim(),
          note: r.value.trim()
        });
        U(s.state), R(), ve(s.contactId);
      });
    }
    function xe() {
      H(async () => {
        U(await P("messages/contact/note", {
          contactId: u.value,
          note: r.value
        })), R();
      });
    }
    function qe() {
      H(async () => {
        U(await P("messages/contact/delete", { contactId: u.value })), R(), ae();
      });
    }
    function Le(i) {
      T.value = i, Q("delete-image");
    }
    function Te() {
      const i = u.value, s = T.value;
      H(async () => {
        const m = await P("messages/message/delete-image", {
          contactId: i,
          messageId: s
        });
        U(m.state), A && u.value === i && (w++, c.value = !1, o.value = {
          ...o.value,
          messages: o.value.messages.filter((C) => C.id !== s).map((C) => C.replyTo === s ? {
            ...C,
            replyTo: null
          } : C),
          retryMessageId: m.retryMessageId
        }), R();
      });
    }
    function Fe() {
      H(async () => {
        U(await P("messages/recover")), R();
      });
    }
    function Pe() {
      H(async () => {
        U(await P("messages/adopt-server-state")), l.value.fileState === "ready" && !l.value.pendingSave ? (z.value = null, G.value = null, R()) : d.value = "暂时未能采用服务器版本，请检查网络后重试。当前记录保持不变。";
      });
    }
    return de(() => {
      A = !1, w++, Ce();
    }), (i, s) => (t(), n("main", Xa, [
      O.value ? (t(), n("div", Qa, [a("span", null, $(l.value.fileState === "conflict" ? "服务器上的存档已有变化，请选择如何处理。" : "有消息还在等待保存确认，已保存的记录不会丢失。"), 1), a("div", _a, [a("button", {
        disabled: v.value || !!l.value.busy,
        onClick: s[0] || (s[0] = (m) => De(l.value.pendingSave ? "messages/confirm" : "messages/refresh"))
      }, "检查保存", 8, es), l.value.fileState === "conflict" ? (t(), n("button", {
        key: 0,
        disabled: v.value || !!l.value.busy || l.value.generationActive,
        onClick: s[1] || (s[1] = (m) => Q("adopt"))
      }, "采用服务器版本", 8, as)) : k("", !0)])])) : l.value.unsynced && !l.value.busy ? (t(), n("div", ss, [a("span", null, $(l.value.unsynced) + " 条消息已保留，尚未写入主聊天。", 1), a("button", {
        disabled: q.value,
        onClick: s[2] || (s[2] = (m) => Q("sync"))
      }, "查看", 8, ts)])) : k("", !0),
      l.value.generationActive ? (t(), n("div", ls, "故事正在继续，稍后就能发送消息。")) : k("", !0),
      d.value || l.value.error ? (t(), n("p", ns, $(d.value || l.value.error), 1)) : k("", !0),
      M.value ? (t(), n("div", is, [a("span", null, $(M.value), 1), a("button", {
        disabled: c.value,
        onClick: s[3] || (s[3] = (m) => X())
      }, "重试读取", 8, us)])) : k("", !0),
      V.value ? (t(), ee(Ya, {
        key: V.value.id,
        ref_key: "conversation",
        ref: S,
        draft: x.value,
        "onUpdate:draft": s[4] || (s[4] = (m) => x.value = m),
        contact: V.value,
        page: o.value,
        bridge: e.bridge,
        "chat-identity": l.value.chatIdentity,
        disabled: q.value,
        "send-disabled": q.value || !!N.value,
        busy: l.value.busy,
        outgoing: we.value,
        "send-failure": l.value.sendFailure,
        "send-error": G.value,
        working: v.value,
        "pending-save": O.value,
        "retry-disabled": v.value || !!l.value.busy || l.value.generationActive || l.value.fileState === "conflict",
        loading: c.value,
        "load-more": () => X(!0),
        media: l.value.media,
        "waiting-for": Ie.value,
        onBack: ae,
        onDetails: s[5] || (s[5] = (m) => Q("detail")),
        onSend: Me,
        onRetry: Se,
        onDiscard: Ae,
        onDeleteImage: Le
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
      ])) : k("", !0),
      K(I(na, {
        contacts: l.value.contacts,
        "busy-contact-id": l.value.busy?.contactId ?? "",
        drafts: g,
        onSelect: ve,
        onAdd: s[6] || (s[6] = (m) => Q("add"))
      }, null, 8, [
        "contacts",
        "busy-contact-id",
        "drafts"
      ]), [[ze, !V.value]]),
      L.value ? (t(), ee(he, {
        key: 6,
        class: "messages-dialog",
        "aria-labelledby": "messages-dialog-title",
        busy: v.value,
        onClose: Ee
      }, {
        default: ke(() => [
          a("header", null, [
            f.value === "detail" && V.value ? (t(), ee(te, {
              key: 0,
              identity: V.value.id,
              name: V.value.name,
              small: ""
            }, null, 8, ["identity", "name"])) : k("", !0),
            a("h2", os, $(f.value === "add" ? "新的对话" : f.value === "detail" ? V.value?.name : f.value === "delete" ? "删除联系人？" : f.value === "delete-image" ? "删除这条图片消息？" : f.value === "sync" ? "消息还未写入主聊天" : f.value === "adopt" ? "采用服务器版本？" : "在当前位置补记？"), 1),
            a("button", {
              class: "messages-icon-button",
              "aria-label": "关闭",
              disabled: v.value,
              onClick: R
            }, [I(D, { name: "close" })], 8, ds)
          ]),
          d.value ? (t(), n("p", rs, $(d.value), 1)) : k("", !0),
          f.value === "add" ? (t(), n(E, { key: 1 }, [
            a("label", vs, [I(D, { name: "search" }), K(a("input", {
              "onUpdate:modelValue": s[7] || (s[7] = (m) => y.value = m),
              placeholder: "查找已知人物",
              "aria-label": "查找已知人物"
            }, null, 512), [[W, y.value]])]),
            a("div", ms, [(t(!0), n(E, null, le(re.value, (m) => (t(), n("button", {
              key: m.name,
              disabled: q.value,
              onClick: (C) => ge(m.name)
            }, [
              I(te, {
                identity: m.name,
                name: m.name,
                small: ""
              }, null, 8, ["identity", "name"]),
              a("span", null, [J($(m.name), 1), m.aliases.length ? (t(), n("small", cs, $(m.aliases.join("、")), 1)) : k("", !0)]),
              I(D, { name: "plus" })
            ], 8, gs))), 128)), re.value.length ? k("", !0) : (t(), n("p", ys, "没有更多已知人物，可以在下面补充。"))]),
            a("details", bs, [s[17] || (s[17] = a("summary", null, "想联系的人不在这里？", -1)), a("form", { onSubmit: s[10] || (s[10] = oe((m) => ge(), ["prevent"])) }, [
              a("label", null, [s[15] || (s[15] = J("姓名", -1)), K(a("input", {
                "onUpdate:modelValue": s[8] || (s[8] = (m) => b.value = m),
                maxlength: "120",
                required: "",
                placeholder: "对方的姓名"
              }, null, 512), [[W, b.value]])]),
              a("label", null, [s[16] || (s[16] = J("身份说明（可选）", -1)), K(a("textarea", {
                "onUpdate:modelValue": s[9] || (s[9] = (m) => r.value = m),
                maxlength: "600",
                rows: "2",
                placeholder: "例如：住在隔壁的花店老板"
              }, null, 512), [[W, r.value]])]),
              a("button", {
                class: "messages-primary",
                disabled: q.value || !b.value.trim()
              }, "添加并聊天", 8, fs)
            ], 32)])
          ], 64)) : f.value === "detail" ? (t(), n("form", {
            key: 2,
            onSubmit: oe(xe, ["prevent"])
          }, [
            a("label", null, [s[18] || (s[18] = J("身份说明 / 备注", -1)), K(a("textarea", {
              "onUpdate:modelValue": s[11] || (s[11] = (m) => r.value = m),
              maxlength: "600",
              rows: "3",
              placeholder: "帮助辨认这位联系人"
            }, null, 512), [[W, r.value]])]),
            a("button", {
              class: "messages-primary",
              disabled: q.value
            }, "保存备注", 8, ps),
            a("button", {
              type: "button",
              class: "messages-danger",
              disabled: q.value,
              onClick: s[12] || (s[12] = (m) => f.value = "delete")
            }, "删除联系人与通讯记录", 8, ks)
          ], 32)) : f.value === "delete" ? (t(), n(E, { key: 3 }, [
            a("p", null, "会删除信息 APP 内与 " + $(V.value?.name) + " 的全部通讯和摘要，不能恢复。主聊天中的「私人信息」楼层不会删除，其他联系人不受影响。", 1),
            a("button", {
              class: "messages-danger",
              disabled: q.value,
              onClick: qe
            }, "确认删除", 8, $s),
            a("button", {
              class: "messages-secondary",
              onClick: s[13] || (s[13] = (m) => f.value = "detail")
            }, "保留联系人")
          ], 64)) : f.value === "delete-image" ? (t(), n(E, { key: 4 }, [
            s[19] || (s[19] = a("p", null, "这条图片及配文将从信息 APP 中删除，不再发送给模型，不能恢复。其他消息保留。", -1)),
            s[20] || (s[20] = a("p", { class: "messages-subtle" }, "主聊天里的记录和图库原图不会删除。", -1)),
            a("button", {
              class: "messages-danger",
              disabled: q.value,
              onClick: Te
            }, "确认删除", 8, hs),
            a("button", {
              class: "messages-secondary",
              onClick: R
            }, "取消")
          ], 64)) : f.value === "sync" ? (t(), n(E, { key: 5 }, [
            s[23] || (s[23] = a("p", null, "信息 APP 已保留这些消息。重试只会补上主聊天里的记录，不会再次向对方发送，也不会重新生成回复。", -1)),
            a("button", {
              class: "messages-primary",
              disabled: q.value,
              onClick: Be
            }, "重试写入", 8, ws),
            a("details", Is, [
              s[21] || (s[21] = a("summary", null, "原来的记录已被修改或删除？", -1)),
              s[22] || (s[22] = a("p", null, "不会覆盖你的修改。需要这些消息继续进入剧情时，可以在当前位置另加一条补记。", -1)),
              a("button", {
                class: "messages-secondary",
                disabled: q.value,
                onClick: s[14] || (s[14] = (m) => f.value = "recover")
              }, "查看补记方式", 8, Cs)
            ])
          ], 64)) : f.value === "adopt" ? (t(), n(E, { key: 6 }, [
            s[24] || (s[24] = a("p", null, "将读取服务器上的当前聊天小白 OS 存档，放弃本地尚未确认的修改。信息 APP 会显示服务器已保存的联系人和消息。", -1)),
            s[25] || (s[25] = a("p", { class: "messages-subtle" }, "这项选择作用于当前聊天的整份 OS 存档，不会删除主聊天里的记录，也不会重新生成回复。", -1)),
            a("button", {
              class: "messages-danger",
              disabled: v.value || !!l.value.busy || l.value.generationActive,
              onClick: Pe
            }, "确认采用服务器版本", 8, Ms),
            a("button", {
              class: "messages-secondary",
              disabled: v.value,
              onClick: R
            }, "暂不处理", 8, Ss)
          ], 64)) : (t(), n(E, { key: 7 }, [
            s[26] || (s[26] = a("p", null, "先检查已有记录；仍未写入的消息会在主聊天当前位置标为「补录」，保留原发送时间。不会覆盖旧记录或恢复你删除的那一条。", -1)),
            a("button", {
              class: "messages-primary",
              disabled: q.value,
              onClick: Fe
            }, "确认补记", 8, As),
            a("button", {
              class: "messages-secondary",
              onClick: R
            }, "暂不补记")
          ], 64))
        ]),
        _: 1
      }, 8, ["busy"])) : k("", !0)
    ]));
  }
}), Ls = Ds;
export {
  Ls as default
};
