/* eslint-disable */
import { C as Je, D as ge, E as Xe, G as Me, H as Z, K as h, L as Se, O as We, S as we, U as Qe, V as Be, Y as _e, b as ie, c as X, gt as p, h as H, ht as me, j as oe, k as l, l as C, m as E, mt as W, o as D, p as Q, r as R, s as e, u as n, w as ea, z as ce } from "./xiaobai-os-runtime-core.esm-bundler-x_Eikhco.js";
import { c as Ae, i as he, l as le, o as se, s as aa } from "./xiaobai-os-runtime-dom.esm-bundler-DWFjb9Vy.js";
import { n as xe } from "./xiaobai-os-app-navigation-BcQEoInO.js";
import { t as Ee } from "./xiaobai-os-AppDialog-BtiJ8z-w.js";
import { t as sa } from "./xiaobai-os-context-tokens-W3T8vx4V.js";
var ta = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.8",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
}, la = ["d"], na = /* @__PURE__ */ H({
  __name: "MessageIcon",
  props: { name: {} },
  setup(a) {
    const k = {
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
    return (s, b) => (l(), n("svg", ta, [e("path", { d: k[a.name] }, null, 8, la)]));
  }
}), T = na, ia = /* @__PURE__ */ H({
  __name: "ContactAvatar",
  props: {
    identity: {},
    name: {},
    small: { type: Boolean }
  },
  setup(a) {
    const k = a, s = D(() => {
      let b = 0;
      for (const o of k.identity) b = Math.imul(b, 31) + o.codePointAt(0) | 0;
      return String((b >>> 0) % 360);
    });
    return (b, o) => (l(), n("span", {
      class: W(["messages-avatar", { small: a.small }]),
      style: me({ "--avatar-hue": s.value }),
      "aria-hidden": "true"
    }, p(Array.from(a.name)[0]), 7));
  }
}), ue = ia, ua = { class: "messages-contacts" }, oa = { class: "messages-home-header" }, ra = { class: "messages-home-actions" }, da = { class: "messages-search" }, va = {
  key: 0,
  class: "messages-empty"
}, ga = {
  key: 1,
  class: "messages-contact-rows"
}, ma = {
  key: 0,
  class: "messages-subtle"
}, ca = ["onClick"], ya = { class: "messages-contact-copy" }, ba = { class: "messages-contact-heading" }, fa = {
  key: 0,
  class: "messages-preview messages-preview-active"
}, pa = {
  key: 1,
  class: "messages-preview"
}, ka = {
  key: 2,
  class: "messages-preview"
}, $a = /* @__PURE__ */ H({
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
    const k = a, s = h(""), b = D(() => k.contacts.filter((c) => `${c.name} ${c.note}`.toLocaleLowerCase().includes(s.value.toLocaleLowerCase())));
    function o(c) {
      if (c === null) return "";
      const i = new Date(c);
      return i.toDateString() === (/* @__PURE__ */ new Date()).toDateString() ? i.toLocaleTimeString(void 0, {
        hour: "2-digit",
        minute: "2-digit"
      }) : i.toLocaleDateString(void 0, {
        month: "numeric",
        day: "numeric"
      });
    }
    return (c, i) => (l(), n("section", ua, [
      e("header", oa, [i[4] || (i[4] = e("h1", null, "信息", -1)), e("div", ra, [e("button", {
        class: "messages-icon-button",
        title: "设置",
        "aria-label": "设置",
        onClick: i[0] || (i[0] = (r) => c.$emit("settings"))
      }, [E(T, { name: "settings" })]), e("button", {
        class: "messages-icon-button messages-add-contact",
        "aria-label": "添加联系人",
        onClick: i[1] || (i[1] = (r) => c.$emit("add"))
      }, [E(T, { name: "plus" })])])]),
      e("label", da, [E(T, { name: "search" }), Z(e("input", {
        "onUpdate:modelValue": i[2] || (i[2] = (r) => s.value = r),
        type: "search",
        placeholder: "搜索联系人",
        "aria-label": "搜索联系人"
      }, null, 512), [[se, s.value]])]),
      a.contacts.length ? (l(), n("div", ga, [b.value.length ? C("", !0) : (l(), n("p", ma, "没有找到这个人。")), (l(!0), n(R, null, oe(b.value, (r) => (l(), n("button", {
        key: r.id,
        class: "messages-contact-row",
        onClick: (S) => c.$emit("select", r.id)
      }, [E(ue, {
        identity: r.id,
        name: r.name
      }, null, 8, ["identity", "name"]), e("span", ya, [e("span", ba, [e("strong", null, p(r.name), 1), e("time", null, p(o(r.lastAt)), 1)]), a.busyContactId === r.id ? (l(), n("span", fa, "正在等待回复…")) : a.drafts.get(r.id)?.text.trim() || a.drafts.get(r.id)?.image ? (l(), n("span", pa, [i[7] || (i[7] = e("em", null, "草稿", -1)), Q(" " + p(a.drafts.get(r.id)?.image ? "［图片］" : "") + p(a.drafts.get(r.id)?.text), 1)])) : (l(), n("span", ka, p(r.preview), 1))])], 8, ca))), 128))])) : (l(), n("div", va, [
        E(T, { name: "message" }),
        i[6] || (i[6] = e("h2", null, "暂无联系人", -1)),
        e("button", {
          class: "messages-primary",
          onClick: i[3] || (i[3] = (r) => c.$emit("add"))
        }, [i[5] || (i[5] = Q("添加联系人", -1)), E(T, { name: "plus" })])
      ]))
    ]));
  }
}), wa = $a, ha = ["disabled"], Ia = {
  type: "submit",
  class: "messages-primary"
}, Ca = /* @__PURE__ */ H({
  __name: "MessagesSettings",
  props: {
    settings: {},
    busy: { type: Boolean }
  },
  emits: ["save"],
  setup(a, { emit: k }) {
    const s = a, b = k, o = Me({ ...s.settings });
    return (c, i) => (l(), n("form", {
      class: "messages-settings",
      onSubmit: i[2] || (i[2] = le((r) => b("save", { ...o }), ["prevent"]))
    }, [e("fieldset", { disabled: a.busy }, [
      i[5] || (i[5] = e("legend", null, "对方的回复", -1)),
      e("label", null, [i[3] || (i[3] = e("span", null, "允许对方发图片", -1)), Z(e("input", {
        "onUpdate:modelValue": i[0] || (i[0] = (r) => o.imagePrompt = r),
        type: "checkbox"
      }, null, 512), [[he, o.imagePrompt]])]),
      e("label", null, [i[4] || (i[4] = e("span", null, "允许对方发语音", -1)), Z(e("input", {
        "onUpdate:modelValue": i[1] || (i[1] = (r) => o.voicePrompt = r),
        type: "checkbox"
      }, null, 512), [[he, o.voicePrompt]])]),
      e("button", Ia, p(a.busy ? "请稍候…" : "保存设置"), 1)
    ], 8, ha)], 32));
  }
}), Ma = Ca, Sa = ["src", "alt"], Ba = {
  key: 2,
  class: "messages-image-placeholder",
  role: "status",
  "aria-live": "polite"
}, Aa = {
  key: 4,
  class: "messages-image-placeholder messages-media-unavailable"
}, xa = {
  key: 5,
  class: "messages-image-caption"
}, Ea = {
  key: 6,
  class: "messages-media-error",
  role: "status"
}, Da = ["src", "alt"], Ra = /* @__PURE__ */ H({
  __name: "MessageImage",
  props: {
    message: {},
    bridge: {},
    chatIdentity: {},
    available: { type: Boolean }
  },
  emits: ["resize"],
  setup(a, { emit: k }) {
    const s = a, b = k, o = h(null), c = h(!1), i = h(""), r = h(""), S = h(""), w = h(""), x = h(!1), A = h(!1), f = D(() => s.message.payload.type === "image" ? s.message.payload.attachment : void 0), I = D(() => s.message.payload.type === "image" ? s.message.payload.description : ""), v = D(() => f.value?.path || i.value);
    let $ = null;
    function d() {
      const B = w.value;
      w.value = "", B && s.bridge.post("messages/image/cancel", {
        chatIdentity: s.chatIdentity,
        mediaRequestId: B
      });
    }
    async function g() {
      if (w.value) return;
      if (v.value) {
        x.value = !1;
        return;
      }
      if (!s.available) return;
      const B = `image-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      w.value = B, r.value = "", S.value = "正在读取图片…";
      try {
        const { result: y } = await s.bridge.request("messages/image/generate", {
          chatIdentity: s.chatIdentity,
          messageId: s.message.id,
          mediaRequestId: B
        }, 18e4);
        if (w.value !== B) return;
        if (!y.data) throw new Error("画图暂不可用，请开启画图后重试。");
        i.value = y.data, x.value = !1;
      } catch (y) {
        if (w.value !== B) return;
        const L = y instanceof Error ? y.message : "";
        r.value = L === "host_request_timeout" ? "等待图片超过3分钟，已取消本次请求，可重试。" : L || "图片加载失败，请重试。", d();
      } finally {
        w.value === B && (w.value = "");
      }
    }
    const M = s.bridge.subscribe((B) => {
      if (B.type !== "messages/image-progress") return;
      const y = B.payload;
      if (!(!w.value || y.mediaRequestId !== w.value))
        if (y.status === "queued") {
          const L = Math.max(0, Number(y.ahead) || 0);
          S.value = L ? `排队中，前方 ${L} 张` : "已进入图片队列";
        } else y.status === "generating" ? S.value = "正在生成图片…" : y.status === "cooldown" && (S.value = y.delay ? `等待 ${Math.ceil(y.delay / 1e3)} 秒后继续` : "等待继续生成…");
    });
    return Xe(() => {
      if (!f.value) {
        if (typeof IntersectionObserver > "u") {
          c.value = !0;
          return;
        }
        $ = new IntersectionObserver((B) => {
          c.value = B.some((y) => y.isIntersecting);
        }, { root: o.value?.closest(".messages-thread-scroll") ?? null }), o.value && $.observe(o.value);
      }
    }), ce([c, () => s.available], ([B, y]) => {
      B && y && !v.value && !r.value && g();
    }), Je(() => {
      $?.disconnect(), M(), d();
    }), (B, y) => (l(), n("div", {
      ref_key: "root",
      ref: o
    }, [
      v.value && !x.value ? (l(), n("button", {
        key: 0,
        class: "messages-image-open",
        "aria-label": "放大图片",
        onClick: y[2] || (y[2] = (L) => A.value = !0)
      }, [e("img", {
        src: v.value,
        alt: I.value || f.value?.name || "图片",
        onLoad: y[0] || (y[0] = (L) => b("resize")),
        onError: y[1] || (y[1] = (L) => x.value = !0)
      }, null, 40, Sa)])) : x.value ? (l(), n("button", {
        key: 1,
        class: "messages-image-placeholder",
        onClick: g
      }, [
        E(T, { name: "image" }),
        y[5] || (y[5] = e("span", null, "图片暂时无法显示", -1)),
        y[6] || (y[6] = e("small", null, "点击重新加载", -1))
      ])) : w.value ? (l(), n("div", Ba, [E(T, { name: "image" }), e("span", null, p(S.value), 1)])) : a.available ? (l(), n("button", {
        key: 3,
        class: "messages-image-placeholder",
        onClick: g
      }, [E(T, { name: "image" }), e("span", null, p(r.value ? "重试加载图片" : "图片"), 1)])) : (l(), n("div", Aa, [
        E(T, { name: "image" }),
        y[7] || (y[7] = e("span", null, "图片描述", -1)),
        y[8] || (y[8] = e("small", null, "开启画图后自动加载", -1))
      ])),
      I.value ? (l(), n("p", xa, p(I.value), 1)) : C("", !0),
      r.value ? (l(), n("small", Ea, p(r.value), 1)) : C("", !0),
      A.value ? (l(), X(Ee, {
        key: 7,
        class: "messages-image-viewer",
        "aria-label": "查看图片",
        onClose: y[4] || (y[4] = (L) => A.value = !1)
      }, {
        default: Be(() => [e("button", {
          "aria-label": "关闭图片",
          onClick: y[3] || (y[3] = (L) => A.value = !1)
        }, [E(T, { name: "close" })]), v.value ? (l(), n("img", {
          key: 0,
          src: v.value,
          alt: I.value || f.value?.name || "图片"
        }, null, 8, Da)) : C("", !0)]),
        _: 1
      })) : C("", !0)
    ], 512));
  }
}), Ta = Ra, La = ["data-message-id"], qa = {
  class: "messages-bubble-actions",
  role: "group",
  "aria-label": "消息操作"
}, Ua = ["disabled", "title"], Pa = ["disabled"], Na = { key: 0 }, Va = ["disabled", "aria-label"], Fa = {
  key: 0,
  class: "messages-media-unavailable-note"
}, za = {
  key: 2,
  class: "messages-transcript"
}, Ga = {
  key: 3,
  class: "messages-media-error",
  role: "status"
}, Oa = /* @__PURE__ */ H({
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
  setup(a, { emit: k }) {
    const s = a, b = k;
    function o(v) {
      v.target.closest("button, a, dialog") || window.getSelection()?.toString() || b("select", s.message.id);
    }
    const c = h(""), i = h(""), r = h(!1), S = D(() => [
      "playing",
      "loading",
      "generating",
      "queued"
    ].includes(i.value)), w = h(!1);
    let x = !0;
    const A = (v) => s.bridge.request(v, {
      chatIdentity: s.chatIdentity,
      messageId: s.message.id
    }, 18e4);
    async function f() {
      if (w.value) return;
      c.value = "";
      const v = S.value;
      if (!(!v && !s.media.voice))
        try {
          v ? (w.value = !0, await A("messages/voice/stop"), x && (i.value = "")) : (i.value = "loading", await A("messages/voice/play"));
        } catch {
          x && (v || (i.value = ""), c.value = v ? "未能确认停止，请再点一次停止。" : "语音暂时无法播放，原文仍可查看。");
        } finally {
          x && (w.value = !1);
        }
    }
    const I = s.bridge.subscribe((v) => {
      if (v.type !== "messages/voice-state") return;
      const $ = v.payload;
      $.messageId === s.message.id ? i.value = $.status : $.status === "playing" && (i.value = ""), $.messageId === s.message.id && $.status === "error" && (c.value = "播放失败，点击可以重试。");
    });
    return ge(() => {
      x = !1, I(), S.value && A("messages/voice/stop").catch(() => {
      });
    }), (v, $) => (l(), n("article", {
      class: W(["messages-bubble-row", {
        outgoing: a.message.sender === "user",
        "actions-selected": a.selected
      }]),
      "data-message-id": a.message.id,
      tabindex: "0",
      "aria-label": "消息操作",
      onClick: o,
      onFocus: $[4] || ($[4] = (d) => b("select", a.message.id))
    }, [e("div", qa, [e("button", {
      disabled: a.disabled,
      title: a.permission?.reason,
      class: W({ "is-unavailable": a.permission?.reason }),
      "aria-haspopup": "dialog",
      onClick: $[0] || ($[0] = (d) => v.$emit("deleteMessage", a.message.id))
    }, "删除", 10, Ua), a.permission?.regenerate ? (l(), n("button", {
      key: 0,
      disabled: a.disabled,
      onClick: $[1] || ($[1] = (d) => v.$emit("regenerate", a.message.id))
    }, "重新回复", 8, Pa)) : C("", !0)]), e("div", { class: W(["messages-bubble", `messages-bubble-${a.message.payload.type}`]) }, [a.message.payload.type === "text" ? (l(), n("p", Na, p(a.message.payload.text), 1)) : a.message.payload.type === "image" ? (l(), X(Ta, {
      key: 1,
      message: a.message,
      bridge: a.bridge,
      "chat-identity": a.chatIdentity,
      available: a.media.image,
      onResize: $[2] || ($[2] = (d) => v.$emit("resize"))
    }, null, 8, [
      "message",
      "bridge",
      "chat-identity",
      "available"
    ])) : (l(), n(R, { key: 2 }, [
      e("button", {
        class: "messages-voice-button",
        disabled: w.value || !a.media.voice && !S.value,
        "aria-label": S.value ? "停止播放" : "播放语音",
        onClick: f
      }, [
        E(T, { name: S.value ? "stop" : "play" }, null, 8, ["name"]),
        e("span", { class: W(["messages-wave", { playing: i.value === "playing" }]) }, [(l(), n(R, null, oe(16, (d) => e("i", {
          key: d,
          style: me({
            height: `${8 + d * 7 % 17}px`,
            animationDelay: `${d * 45}ms`
          })
        }, null, 4)), 64))], 2),
        e("small", null, p(w.value ? "停止中" : [
          "loading",
          "generating",
          "queued"
        ].includes(i.value) ? "准备中" : "语音"), 1)
      ], 8, Va),
      a.media.voice ? C("", !0) : (l(), n("small", Fa, "开启 TTS 后可播放")),
      a.media.voice ? (l(), n("button", {
        key: 1,
        class: "messages-transcript-toggle",
        onClick: $[3] || ($[3] = (d) => r.value = !r.value)
      }, p(r.value ? "收起原文" : "查看原文"), 1)) : C("", !0),
      r.value || !a.media.voice ? (l(), n("p", za, p(a.message.payload.transcript), 1)) : C("", !0)
    ], 64)), c.value ? (l(), n("small", Ga, p(c.value), 1)) : C("", !0)], 2)], 42, La));
  }
}), Ha = Oa, Ka = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
], Ct = 4 * 1024 * 1024;
async function Za(a) {
  if (!Ka.includes(a.type)) throw new Error("请选择 PNG、JPG、WEBP 或 GIF 图片。");
  if (!a.size || a.size > 4194304) throw new Error("请选择不超过 4MB 的图片。");
  const k = await new Promise((b, o) => {
    const c = new FileReader();
    c.onerror = () => o(/* @__PURE__ */ new Error("图片读取失败，请重新选择。")), c.onload = () => typeof c.result == "string" ? b(c.result) : o(/* @__PURE__ */ new Error("图片读取失败。")), c.readAsDataURL(a);
  }), s = new Image();
  s.src = k;
  try {
    await s.decode();
  } catch {
    throw new Error("这张图片无法打开，请换一张。");
  }
  return {
    dataUrl: k,
    name: a.name.replace(/[\u0000-\u001f\u007f]/gu, "").trim().slice(0, 120) || "图片"
  };
}
var ja = {
  key: 0,
  class: "messages-attachment-preview"
}, Ya = ["src", "alt"], Ja = ["disabled"], Xa = {
  key: 1,
  class: "messages-composer-hint"
}, Wa = {
  key: 2,
  class: "messages-composer-hint",
  role: "status"
}, Qa = {
  key: 3,
  class: "messages-composer-wait",
  role: "status"
}, _a = { class: "messages-composer-line" }, es = ["disabled"], as = ["placeholder", "disabled"], ss = ["disabled"], ts = /* @__PURE__ */ H({
  __name: "MessageComposer",
  props: /* @__PURE__ */ ie({
    disabled: { type: Boolean },
    sending: { type: Boolean },
    waitingFor: {}
  }, {
    draft: { required: !0 },
    draftModifiers: {}
  }),
  emits: /* @__PURE__ */ ie(["send"], ["update:draft"]),
  setup(a, { emit: k }) {
    const s = a, b = k, o = Se(a, "draft"), c = D({
      get: () => o.value.text,
      set: (v) => {
        o.value = {
          ...o.value,
          text: v
        };
      }
    }), i = h(null), r = h(!1), S = h("");
    let w = !0;
    async function x(v) {
      const $ = v.target, d = $.files?.[0];
      if ($.value = "", !(!d || s.sending || r.value)) {
        r.value = !0, S.value = "";
        try {
          const g = await Za(d);
          w && (o.value = {
            ...o.value,
            image: g
          });
        } catch (g) {
          w && (S.value = g instanceof Error ? g.message : "图片读取失败，请重新选择。");
        } finally {
          w && (r.value = !1);
        }
      }
    }
    function A() {
      o.value = {
        ...o.value,
        image: null
      }, S.value = "";
    }
    function f() {
      const v = c.value.trim();
      !v && !o.value.image || s.disabled || r.value || b("send", o.value.image ? {
        type: "image",
        description: v,
        upload: { ...o.value.image }
      } : {
        type: "text",
        text: v
      });
    }
    ge(() => {
      w = !1;
    });
    function I(v) {
      v.key === "Enter" && (v.ctrlKey || v.metaKey) && !v.isComposing && (v.preventDefault(), f());
    }
    return (v, $) => (l(), n("form", {
      class: "messages-composer",
      onSubmit: le(f, ["prevent"])
    }, [
      e("input", {
        ref_key: "fileInput",
        ref: i,
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/gif",
        hidden: "",
        "aria-label": "选择图片文件",
        onChange: x
      }, null, 544),
      o.value.image ? (l(), n("div", ja, [
        e("img", {
          src: o.value.image.dataUrl,
          alt: o.value.image.name
        }, null, 8, Ya),
        e("span", null, [$[2] || ($[2] = e("strong", null, "待发送的图片", -1)), e("small", null, p(o.value.image.name), 1)]),
        e("button", {
          type: "button",
          class: "messages-icon-button",
          "aria-label": "移除图片",
          disabled: a.sending || r.value,
          onClick: A
        }, [E(T, { name: "close" })], 8, Ja)
      ])) : C("", !0),
      o.value.image ? (l(), n("p", Xa, "图片将随消息发送，需要当前模型支持看图。")) : C("", !0),
      r.value || S.value ? (l(), n("p", Wa, p(r.value ? "正在读取图片…" : S.value), 1)) : C("", !0),
      a.waitingFor ? (l(), n("p", Qa, "正在等待 " + p(a.waitingFor) + " 的回复。可以先写好，稍后发送。", 1)) : C("", !0),
      e("div", _a, [
        e("button", {
          type: "button",
          class: "messages-icon-button messages-attach",
          "aria-label": "选择图片",
          disabled: a.sending || r.value,
          onClick: $[0] || ($[0] = (d) => i.value?.click())
        }, [E(T, { name: "plus" })], 8, es),
        Z(e("textarea", {
          "onUpdate:modelValue": $[1] || ($[1] = (d) => c.value = d),
          rows: "1",
          maxlength: "4000",
          placeholder: o.value.image ? "给图片配句话…" : "说点什么…",
          "aria-label": "消息内容",
          disabled: a.sending,
          onKeydown: I
        }, null, 40, as), [[se, c.value]]),
        e("button", {
          class: "messages-send",
          type: "submit",
          disabled: a.disabled || r.value || !c.value.trim() && !o.value.image,
          "aria-label": "发送"
        }, [E(T, { name: "send" })], 8, ss)
      ])
    ], 32));
  }
}), ls = ts, ns = {
  class: "messages-delivery",
  role: "status"
}, is = { key: 0 }, us = ["disabled"], os = ["disabled"], rs = /* @__PURE__ */ H({
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
    return (k, s) => (l(), n("div", ns, [a.sending ? (l(), n("span", is, "发送中…")) : (l(), n(R, { key: 1 }, [
      e("span", null, p(a.error || (a.pendingSave ? "还不确定是否保存成功" : "尚未收到回复")), 1),
      e("button", {
        disabled: a.disabled,
        onClick: s[0] || (s[0] = (b) => k.$emit("retry"))
      }, p(a.pendingSave ? "检查并重试" : "重试"), 9, us),
      a.discard && !a.pendingSave ? (l(), n("button", {
        key: 0,
        disabled: a.disabled,
        onClick: s[1] || (s[1] = (b) => k.$emit("discard"))
      }, "删除", 8, os)) : C("", !0)
    ], 64))]));
  }
}), Ie = rs, ds = 158e3, vs = 128e3, Ce = 6e3;
function gs(a) {
  return String(a ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/{/g, "&#123;").replace(/}/g, "&#125;");
}
var ms = ["aria-label", "aria-expanded"], cs = {
  key: 0,
  class: "messages-context-popover",
  "aria-label": "上下文用量"
}, ys = { class: "messages-context-total" }, bs = {
  key: 1,
  role: "status"
}, fs = { key: 3 }, ps = /* @__PURE__ */ H({
  __name: "MessageContextButton",
  props: {
    bridge: {},
    state: {},
    contactId: {},
    draft: {}
  },
  setup(a) {
    const k = a, s = h(!1), b = h(!1), o = h(!1), c = h(0), i = h(null);
    xe(() => (s.value = !1, !0), () => s.value), ce(() => JSON.stringify([
      k.contactId,
      k.state.chatIdentity,
      k.state.revision,
      k.state.boundary,
      k.state.settings.imagePrompt,
      k.state.settings.voicePrompt,
      !!k.state.busy,
      k.state.generationActive,
      c.value
    ]), async (f, I, v) => {
      let $ = !0;
      if (v(() => {
        $ = !1;
      }), b.value = !0, o.value = !1, k.state.busy || k.state.generationActive) return;
      const d = k.state.revision, g = k.state.boundary;
      try {
        const M = await k.bridge.request("messages/context", {
          chatIdentity: k.state.chatIdentity,
          contactId: k.contactId
        }, 6e4);
        if (!$) return;
        if (M.result.revision !== d || M.result.boundary !== g) throw new Error("stale");
        i.value = M.result.stats;
      } catch {
        $ && (o.value = !0, i.value = null);
      } finally {
        $ && (b.value = !1);
      }
    }, { immediate: !0 });
    const r = D(() => sa(gs(k.draft.text))), S = D(() => (i.value?.imageTokens ?? 0) + (k.draft.image ? Ce : 0)), w = D(() => (i.value?.usedTokens ?? 0) + r.value + (k.draft.image ? Ce : 0)), x = D(() => Math.min(1, w.value / ds)), A = (f) => `${(f / 1e3).toFixed(1)}k`;
    return (f, I) => (l(), n("div", {
      class: "messages-context",
      onKeydown: I[3] || (I[3] = Ae(le((v) => s.value = !1, ["stop"]), ["esc"]))
    }, [e("button", {
      type: "button",
      class: W(["messages-context-ring", { "is-warning": w.value >= _e(vs) }]),
      style: me({ "--context-fill": `${i.value ? x.value * 360 : 0}deg` }),
      "aria-label": i.value ? `上下文：约 ${A(w.value)} / 158k` : "上下文用量",
      "aria-expanded": s.value,
      title: "上下文",
      onClick: I[0] || (I[0] = (v) => s.value = !s.value)
    }, [e("span", null, p(b.value ? "…" : o.value || !i.value ? "—" : Math.round(x.value * 100)), 1)], 14, ms), s.value ? (l(), n("section", cs, [
      e("header", null, [I[4] || (I[4] = e("strong", null, "上下文", -1)), e("button", {
        type: "button",
        "aria-label": "关闭上下文用量",
        onClick: I[1] || (I[1] = (v) => s.value = !1)
      }, "×")]),
      i.value ? (l(), n(R, { key: 0 }, [e("p", ys, "约 " + p(A(w.value)) + " / 158k", 1), e("dl", null, [
        I[6] || (I[6] = e("dt", null, "剧情与设定", -1)),
        e("dd", null, p(A(i.value.backgroundTokens)), 1),
        I[7] || (I[7] = e("dt", null, "通讯摘要", -1)),
        e("dd", null, p(A(i.value.summaryTokens)), 1),
        I[8] || (I[8] = e("dt", null, "通讯原文", -1)),
        e("dd", null, p(A(i.value.historyTokens)), 1),
        I[9] || (I[9] = e("dt", null, "提示词与输入", -1)),
        e("dd", null, p(A(i.value.promptTokens + r.value)), 1),
        S.value ? (l(), n(R, { key: 0 }, [I[5] || (I[5] = e("dt", null, "图片预留", -1)), e("dd", null, p(A(S.value)), 1)], 64)) : C("", !0)
      ])], 64)) : C("", !0),
      b.value ? (l(), n("p", bs, p(a.state.busy?.stage === "summarizing" ? "正在总结较早通讯…" : a.state.busy || a.state.generationActive ? "本轮结束后更新用量。" : "正在读取…"), 1)) : o.value ? (l(), n(R, { key: 2 }, [I[10] || (I[10] = e("p", { role: "status" }, "用量暂时无法读取。", -1)), e("button", {
        type: "button",
        class: "messages-secondary",
        onClick: I[2] || (I[2] = (v) => c.value++)
      }, "重试")], 64)) : C("", !0),
      I[11] || (I[11] = e("p", null, "128k 时在下次回复前自动总结，保留近期原文。", -1)),
      S.value ? (l(), n("small", fs, "图片按每张 6k 预留，实际用量由模型决定。")) : C("", !0)
    ])) : C("", !0)], 32));
  }
}), ks = ps, $s = { class: "messages-conversation" }, ws = { class: "messages-thread-header" }, hs = { class: "messages-thread-heading" }, Is = ["disabled"], Cs = {
  key: 1,
  class: "messages-thread-start"
}, Ms = {
  key: 0,
  class: "messages-time"
}, Ss = { class: "messages-bubble-row outgoing" }, Bs = { key: 0 }, As = ["src", "alt"], xs = {
  key: 0,
  class: "messages-image-caption"
}, Es = {
  key: 3,
  class: "messages-typing",
  role: "status"
}, Ds = /* @__PURE__ */ H({
  __name: "Conversation",
  props: /* @__PURE__ */ ie({
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
  emits: /* @__PURE__ */ ie([
    "back",
    "details",
    "send",
    "retry",
    "discard",
    "deleteMessage",
    "regenerate",
    "latest"
  ], ["update:draft"]),
  setup(a, { expose: k }) {
    const s = Se(a, "draft"), b = a, o = h("");
    function c(d) {
      d.target.closest(".messages-bubble-row") || (o.value = "");
    }
    const i = D(() => b.busy?.contactId === b.contact.id ? b.busy.stage : ""), r = D(() => [
      "replying",
      "summarizing",
      "saving-reply"
    ].includes(i.value));
    function S(d) {
      return [b.sendFailure, b.sendError].find((g) => g?.contactId === b.contact.id && g.messageId === d)?.message;
    }
    const w = h(null);
    let x = !0, A = !1, f = null;
    ea(() => {
      f = null;
      const d = w.value;
      if (!d || x && !A && !b.page.hasNewer) return;
      const g = new Set(b.page.messages.map((B) => B.id)), M = [...d.querySelectorAll("[data-message-id]")].find((B) => g.has(B.dataset.messageId) && B.getBoundingClientRect().bottom > d.getBoundingClientRect().top);
      M && (f = {
        id: M.dataset.messageId,
        offset: M.getBoundingClientRect().top - d.getBoundingClientRect().top
      });
    }), We(() => {
      const d = w.value;
      if (d)
        if (f) {
          const g = [...d.querySelectorAll("[data-message-id]")].find((M) => M.dataset.messageId === f.id);
          g && (d.scrollTop += g.getBoundingClientRect().top - d.getBoundingClientRect().top - f.offset), f = null;
        } else x && !A && !b.page.hasNewer && (d.scrollTop = d.scrollHeight);
    });
    function I() {
      const d = w.value;
      d && (x = d.scrollHeight - d.clientHeight - d.scrollTop < 70);
    }
    async function v() {
      await we(), x && !A && !b.page.hasNewer && w.value && (w.value.scrollTop = w.value.scrollHeight);
    }
    ce(() => [
      b.page.messages.at(-1)?.id,
      b.outgoing?.messageId,
      i.value,
      b.sendFailure,
      b.sendError
    ], v, { immediate: !0 });
    async function $() {
      if (!(!w.value || A)) {
        A = !0;
        try {
          await b.loadMore(), await we();
        } finally {
          A = !1, I();
        }
      }
    }
    return k({ sent() {
      x = !0, v();
    } }), (d, g) => (l(), n("section", $s, [
      e("header", ws, [
        e("button", {
          class: "messages-icon-button",
          "aria-label": "返回信息",
          onClick: g[0] || (g[0] = (M) => d.$emit("back"))
        }, [E(T, { name: "back" })]),
        E(ue, {
          identity: a.contact.id,
          name: a.contact.name,
          small: ""
        }, null, 8, ["identity", "name"]),
        e("div", hs, [e("h2", null, p(a.contact.name), 1)]),
        E(ks, {
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
          onClick: g[1] || (g[1] = (M) => d.$emit("details"))
        }, [E(T, { name: "more" })])
      ]),
      e("div", {
        ref_key: "scroller",
        ref: w,
        class: "messages-thread-scroll",
        onScroll: I,
        onClick: c,
        onKeydown: g[7] || (g[7] = Ae((M) => o.value = "", ["esc"]))
      }, [
        g[12] || (g[12] = e("p", { class: "messages-subtle messages-context-hint" }, "对话参考角色设定、世界书、近期剧情及可用总结。", -1)),
        a.page.hasMore ? (l(), n("button", {
          key: 0,
          class: "messages-older",
          disabled: a.loading,
          onClick: $
        }, p(a.loading ? "读取中…" : "查看更早的消息"), 9, Is)) : C("", !0),
        a.loading && !a.page.messages.length ? (l(), n("p", Cs, "正在读取消息…")) : C("", !0),
        (l(!0), n(R, null, oe(a.page.messages, (M, B) => (l(), n(R, { key: M.id }, [
          B === 0 || M.createdAt - a.page.messages[B - 1].createdAt > 3e5 ? (l(), n("time", Ms, p(new Date(M.createdAt).toLocaleString(void 0, {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })), 1)) : C("", !0),
          E(Ha, {
            message: M,
            bridge: a.bridge,
            "chat-identity": a.chatIdentity,
            media: a.media,
            disabled: a.disabled,
            selected: o.value === M.id,
            permission: a.page.permissions[M.id],
            onSelect: g[2] || (g[2] = (y) => o.value = y),
            onResize: v,
            onDeleteMessage: g[3] || (g[3] = (y) => d.$emit("deleteMessage", y)),
            onRegenerate: g[4] || (g[4] = (y) => d.$emit("regenerate", y))
          }, null, 8, [
            "message",
            "bridge",
            "chat-identity",
            "media",
            "disabled",
            "selected",
            "permission"
          ]),
          M.id === a.page.retryMessageId && !r.value ? (l(), X(Ie, {
            key: 1,
            sending: a.busy?.messageId === M.id && ["saving", "uploading"].includes(i.value),
            error: S(M.id),
            "pending-save": a.pendingSave,
            disabled: a.retryDisabled,
            onRetry: (y) => d.$emit("retry", M.id)
          }, null, 8, [
            "sending",
            "error",
            "pending-save",
            "disabled",
            "onRetry"
          ])) : C("", !0)
        ], 64))), 128)),
        a.outgoing ? (l(), n(R, { key: 2 }, [e("div", Ss, [e("div", { class: W(["messages-bubble", { "messages-bubble-image": a.outgoing.payload.type === "image" }]) }, [a.outgoing.payload.type === "text" ? (l(), n("p", Bs, p(a.outgoing.payload.text), 1)) : (l(), n(R, { key: 1 }, [e("img", {
          class: "messages-pending-image",
          src: a.outgoing.payload.upload.dataUrl,
          alt: a.outgoing.payload.upload.name,
          onLoad: v
        }, null, 40, As), a.outgoing.payload.description ? (l(), n("p", xs, p(a.outgoing.payload.description), 1)) : C("", !0)], 64))], 2)]), E(Ie, {
          sending: a.working || a.busy?.messageId === a.outgoing.messageId,
          error: S(a.outgoing.messageId) || "发送未完成",
          "pending-save": a.pendingSave,
          disabled: a.retryDisabled,
          discard: "",
          onRetry: g[5] || (g[5] = (M) => d.$emit("retry", a.outgoing.messageId)),
          onDiscard: g[6] || (g[6] = (M) => d.$emit("discard", a.outgoing.messageId))
        }, null, 8, [
          "sending",
          "error",
          "pending-save",
          "disabled"
        ])], 64)) : C("", !0),
        r.value ? (l(), n("div", Es, [...g[11] || (g[11] = [e("span", null, [
          e("i"),
          e("i"),
          e("i")
        ], -1), Q("对方正在输入…", -1)])])) : C("", !0)
      ], 544),
      a.page.hasNewer ? (l(), n("button", {
        key: 0,
        class: "messages-latest",
        onClick: g[8] || (g[8] = (M) => {
          Qe(x) ? x.value = !0 : x = !0, d.$emit("latest");
        })
      }, "回到最新消息")) : C("", !0),
      E(ls, {
        draft: s.value,
        "onUpdate:draft": g[9] || (g[9] = (M) => s.value = M),
        disabled: a.sendDisabled,
        sending: !1,
        "waiting-for": a.waitingFor,
        onSend: g[10] || (g[10] = (M) => d.$emit("send", M))
      }, null, 8, [
        "draft",
        "disabled",
        "waiting-for"
      ])
    ]));
  }
}), Rs = Ds, Ts = () => ({
  text: "",
  image: null
});
function ve() {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (a) => a.toString(16).padStart(2, "0")).join("");
}
var Ls = { class: "messages-app" }, qs = {
  key: 0,
  class: "messages-banner",
  role: "status"
}, Us = { class: "messages-save-actions" }, Ps = ["disabled"], Ns = ["disabled"], Vs = {
  key: 1,
  class: "messages-banner",
  role: "status"
}, Fs = ["disabled"], zs = {
  key: 2,
  class: "messages-notice"
}, Gs = {
  key: 3,
  class: "messages-error",
  role: "alert"
}, Os = {
  key: 4,
  class: "messages-banner",
  role: "alert"
}, Hs = ["disabled"], Ks = { id: "messages-dialog-title" }, Zs = ["disabled"], js = {
  key: 0,
  class: "messages-error",
  role: "alert"
}, Ys = { class: "messages-search" }, Js = ["aria-busy"], Xs = {
  key: 0,
  class: "messages-subtle",
  role: "status"
}, Ws = { key: 1 }, Qs = ["disabled"], _s = ["disabled", "onClick"], et = { key: 0 }, at = {
  key: 0,
  class: "messages-subtle"
}, st = { class: "messages-manual" }, tt = ["disabled"], lt = ["disabled"], nt = ["disabled"], it = {
  key: 0,
  role: "status"
}, ut = { key: 1 }, ot = ["disabled"], rt = {
  key: 0,
  role: "status"
}, dt = { key: 1 }, vt = ["disabled"], gt = ["disabled"], mt = { class: "messages-manual" }, ct = ["disabled"], yt = ["disabled"], bt = ["disabled"], ft = ["disabled"], pt = /* @__PURE__ */ H({
  __name: "MessagesApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(a) {
    const k = a, s = h(k.initialState), b = (u = "") => ({
      contactId: u,
      messages: [],
      hasMore: !1,
      hasNewer: !1,
      retryMessageId: null,
      revision: "",
      permissions: {}
    }), o = h(""), c = h(b()), i = h(!1), r = h(!1), S = h(""), w = h(""), x = h(null), A = h(!1), f = h("add"), I = h(""), v = h(""), $ = D(() => f.value === "delete" ? z.value?.deleteReason ?? "" : c.value.permissions[I.value]?.reason ?? ""), d = h(""), g = h(""), M = h(""), B = h("ready"), y = h(ve());
    let L = !0, _ = 0;
    const ee = Me(/* @__PURE__ */ new Map()), ye = D({
      get: () => ee.get(o.value) ?? Ts(),
      set: (u) => {
        ee.set(o.value, u);
      }
    }), q = h(null), K = h(null), J = D(() => s.value.outgoing ?? q.value), De = D(() => J.value?.contactId === o.value && !c.value.messages.some((u) => u.id === J.value?.messageId) ? J.value : null), z = D(() => s.value.contacts.find((u) => u.id === o.value)), Re = D(() => s.value.busy && s.value.busy.contactId !== o.value ? s.value.contacts.find((u) => u.id === s.value.busy?.contactId)?.name ?? "另一位联系人" : ""), te = D(() => s.value.pendingSave || s.value.pendingModification || [
      "unconfirmed",
      "conflict",
      "failed"
    ].includes(s.value.fileState)), N = D(() => r.value || !!s.value.busy || te.value || s.value.fileState !== "ready" || s.value.generationActive), be = D(() => s.value.knownPeople.filter((u) => !s.value.contacts.some((t) => t.name === u.name) && `${u.name} ${u.aliases.join(" ")}`.toLocaleLowerCase().includes(M.value.toLocaleLowerCase())));
    async function U(u, t = {}) {
      return (await k.bridge.request(u, {
        chatIdentity: s.value.chatIdentity,
        ...t
      }, 6e4)).result;
    }
    async function j(u = !1, t = !1) {
      const m = o.value;
      if (!m) return;
      const F = ++_;
      i.value = !0, w.value = "";
      try {
        const O = c.value, Y = await U("messages/thread", {
          contactId: m,
          ...u ? {
            before: O.messages[0]?.seq,
            revision: O.revision
          } : !t && O.messages.length ? { window: {
            first: O.messages[0].seq,
            last: O.messages.at(-1).seq,
            latest: !O.hasNewer
          } } : {}
        });
        if (!L || F !== _ || o.value !== m || Y.revision !== s.value.revision) return;
        const re = u && O.revision === Y.revision, de = re ? [...Y.messages, ...O.messages].slice(0, 100) : Y.messages;
        c.value = {
          ...Y,
          messages: de,
          hasNewer: re ? de.at(-1)?.id !== O.messages.at(-1)?.id || O.hasNewer : Y.hasNewer,
          permissions: re ? {
            ...O.permissions,
            ...Y.permissions
          } : Y.permissions
        }, q.value?.contactId === m && de.some((Ye) => Ye.id === q.value?.messageId) && (q.value = null, K.value = null);
      } catch {
        L && F === _ && o.value === m && (w.value = "消息暂时无法读取。");
      } finally {
        F === _ && (i.value = !1);
      }
    }
    function P(u) {
      if (!L || u.chatIdentity !== s.value.chatIdentity) return;
      const t = s.value.revision !== u.revision || s.value.boundary !== u.boundary || s.value.fileState !== u.fileState || s.value.pendingSave !== u.pendingSave;
      s.value = u, q.value && (u.outgoing?.messageId === q.value.messageId || u.busy?.messageId === q.value.messageId || u.contacts.some((m) => m.lastMessageId === q.value.messageId)) && (q.value = null, K.value = null);
      for (const m of ee.keys()) u.contacts.some((F) => F.id === m) || ee.delete(m);
      q.value && !u.contacts.some((m) => m.id === q.value?.contactId) && (q.value = null, K.value = null), o.value && !u.contacts.some((m) => m.id === o.value) ? ne() : o.value && t && j();
    }
    const Te = k.bridge.subscribe((u) => {
      u.type === "messages/state" && P(u.payload.state);
    });
    function fe(u) {
      o.value = u, S.value = "", c.value = b(u), j();
    }
    function ne() {
      o.value = "", _++, w.value = "", c.value = b();
    }
    xe(() => (ne(), !0), () => !!o.value);
    async function G(u) {
      if (!r.value) {
        r.value = !0, S.value = "";
        try {
          await u();
        } catch (t) {
          L && (S.value = t instanceof Error && t.message !== "host_request_timeout" ? t.message : "暂时没收到操作结果，请先检查保存再重试。");
        } finally {
          r.value = !1;
        }
      }
    }
    function Le(u) {
      if (N.value || J.value) return;
      const t = {
        contactId: o.value,
        messageId: `input:${ve()}`,
        payload: u,
        createdAt: Date.now()
      };
      q.value = t, K.value = null, ee.delete(t.contactId), c.value = {
        ...c.value,
        hasNewer: !1
      }, j(!1, !0), x.value?.sent(), pe(t.contactId, t.messageId, t);
    }
    async function pe(u, t, m) {
      if (!r.value) {
        r.value = !0, K.value = null, S.value = "";
        try {
          if (te.value && (P(await U("messages/confirm")), te.value))
            return;
          const F = m?.payload.type === "image" ? {
            type: "image",
            description: m.payload.description,
            upload: { ...m.payload.upload }
          } : m ? {
            type: "text",
            text: m.payload.text
          } : void 0;
          P(m ? await U("messages/send", {
            contactId: u,
            actionId: t.slice(6),
            payload: F
          }) : await U("messages/retry", {
            contactId: u,
            messageId: t
          }));
        } catch (F) {
          L && (K.value = {
            contactId: u,
            messageId: t,
            message: F instanceof Error && F.message !== "host_request_timeout" ? F.message : "还不确定是否发送成功，可以重试。"
          });
        } finally {
          r.value = !1;
        }
      }
    }
    function qe(u) {
      const t = J.value?.messageId === u ? J.value : void 0;
      pe(o.value, u, t);
    }
    function Ue(u) {
      G(async () => {
        P(await U("messages/discard-send", { messageId: u })), q.value?.messageId === u && (q.value = null), K.value = null, await j();
      });
    }
    function Pe(u) {
      G(async () => P(await U(u)));
    }
    function Ne(u) {
      G(async () => {
        P(await U("messages/settings", { settings: u })), V();
      });
    }
    function Ve() {
      G(async () => {
        P(await U("messages/sync")), V();
      });
    }
    function ae(u) {
      f.value = u, S.value = "", d.value = "", g.value = z.value?.note ?? "", M.value = "", y.value = ve(), A.value = !0, v.value = s.value.revision, u === "add" && ke();
    }
    async function ke() {
      const u = y.value, t = () => L && A.value && f.value === "add" && y.value === u;
      B.value = "loading";
      try {
        const m = await U("messages/refresh");
        if (!t()) return;
        P(m), B.value = "ready";
      } catch {
        t() && (B.value = "failed");
      }
    }
    function V() {
      A.value = !1;
    }
    function Fe() {
      r.value || (f.value === "delete" ? f.value = "detail" : f.value === "recover" ? f.value = "sync" : V());
    }
    function $e(u = d.value) {
      !u.trim() || N.value || B.value === "loading" || G(async () => {
        const t = await U("messages/contact/add", {
          actionId: y.value,
          name: u.trim(),
          note: g.value.trim()
        });
        P(t.state), V(), fe(t.contactId);
      });
    }
    function ze() {
      G(async () => {
        P(await U("messages/contact/note", {
          contactId: o.value,
          note: g.value
        })), V();
      });
    }
    function Ge() {
      G(async () => {
        P(await U("messages/contact/delete", {
          contactId: o.value,
          revision: v.value
        })), V(), ne();
      });
    }
    function Oe(u) {
      I.value = u, ae("delete-message"), v.value = c.value.revision;
    }
    function He() {
      const u = o.value, t = I.value;
      G(async () => {
        P(await U("messages/message/delete", {
          contactId: u,
          messageId: t,
          revision: v.value
        })), await j(), V();
      });
    }
    function Ke(u) {
      const t = {
        contactId: o.value,
        messageId: u,
        revision: c.value.revision
      };
      G(async () => {
        P(await U("messages/regenerate", t));
      });
    }
    function Ze() {
      G(async () => {
        P(await U("messages/recover")), V();
      });
    }
    function je() {
      G(async () => {
        P(await U("messages/adopt-server-state")), s.value.fileState === "ready" && !s.value.pendingSave ? (q.value = null, K.value = null, V()) : S.value = "暂时无法加载已保存版本，请检查网络后重试。当前记录未改。";
      });
    }
    return ge(() => {
      L = !1, _++, Te();
    }), (u, t) => (l(), n("main", Ls, [
      te.value ? (l(), n("div", qs, [e("span", null, p(s.value.fileState === "conflict" ? "服务器上的存档已有变化，请选择如何处理。" : "还不确定部分消息是否保存成功，请先检查保存。"), 1), e("div", Us, [e("button", {
        disabled: r.value || !!s.value.busy,
        onClick: t[0] || (t[0] = (m) => Pe("messages/confirm"))
      }, "检查保存", 8, Ps), s.value.fileState === "conflict" ? (l(), n("button", {
        key: 0,
        disabled: r.value || !!s.value.busy || s.value.generationActive,
        onClick: t[1] || (t[1] = (m) => ae("adopt"))
      }, "使用已保存版本", 8, Ns)) : C("", !0)])])) : s.value.unsynced && !s.value.busy ? (l(), n("div", Vs, [e("span", null, p(s.value.unsynced) + " 条消息已保留，尚未写入主聊天。", 1), e("button", {
        disabled: N.value,
        onClick: t[2] || (t[2] = (m) => ae("sync"))
      }, "查看", 8, Fs)])) : C("", !0),
      s.value.generationActive ? (l(), n("div", zs, "故事正在继续，稍后就能发送消息。")) : C("", !0),
      S.value || s.value.error ? (l(), n("p", Gs, p(S.value || s.value.error), 1)) : C("", !0),
      w.value ? (l(), n("div", Os, [e("span", null, p(w.value), 1), e("button", {
        disabled: i.value,
        onClick: t[3] || (t[3] = (m) => j())
      }, "重新加载", 8, Hs)])) : C("", !0),
      z.value ? (l(), X(Rs, {
        key: z.value.id,
        ref_key: "conversation",
        ref: x,
        draft: ye.value,
        "onUpdate:draft": t[4] || (t[4] = (m) => ye.value = m),
        "context-state": s.value,
        contact: z.value,
        page: c.value,
        bridge: a.bridge,
        "chat-identity": s.value.chatIdentity,
        disabled: N.value,
        "send-disabled": N.value || !!J.value,
        busy: s.value.busy,
        outgoing: De.value,
        "send-failure": s.value.sendFailure,
        "send-error": K.value,
        working: r.value,
        "pending-save": te.value,
        "retry-disabled": r.value || !!s.value.busy || s.value.generationActive || s.value.fileState === "conflict",
        loading: i.value,
        "load-more": () => j(!0),
        media: s.value.media,
        "waiting-for": Re.value,
        onBack: ne,
        onDetails: t[5] || (t[5] = (m) => ae("detail")),
        onSend: Le,
        onRetry: qe,
        onDiscard: Ue,
        onDeleteMessage: Oe,
        onRegenerate: Ke,
        onLatest: t[6] || (t[6] = (m) => j(!1, !0))
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
      ])) : C("", !0),
      Z(E(wa, {
        contacts: s.value.contacts,
        "busy-contact-id": s.value.busy?.contactId ?? "",
        drafts: ee,
        onSelect: fe,
        onAdd: t[7] || (t[7] = (m) => ae("add")),
        onSettings: t[8] || (t[8] = (m) => ae("settings"))
      }, null, 8, [
        "contacts",
        "busy-contact-id",
        "drafts"
      ]), [[aa, !z.value]]),
      A.value ? (l(), X(Ee, {
        key: 6,
        class: "messages-dialog",
        "aria-labelledby": "messages-dialog-title",
        busy: r.value,
        onClose: Fe
      }, {
        default: Be(() => [
          e("header", null, [
            f.value === "detail" && z.value ? (l(), X(ue, {
              key: 0,
              identity: z.value.id,
              name: z.value.name,
              small: ""
            }, null, 8, ["identity", "name"])) : C("", !0),
            e("h2", Ks, p(f.value === "settings" ? "信息设置" : f.value === "add" ? "新的对话" : f.value === "detail" ? z.value?.name : f.value === "delete" ? "删除联系人？" : f.value === "delete-message" ? "删除这条消息？" : f.value === "sync" ? "消息还未写入主聊天" : f.value === "adopt" ? "使用已保存版本？" : "在当前位置补记？"), 1),
            e("button", {
              class: "messages-icon-button",
              "aria-label": "关闭",
              disabled: r.value,
              onClick: V
            }, [E(T, { name: "close" })], 8, Zs)
          ]),
          S.value ? (l(), n("p", js, p(S.value), 1)) : C("", !0),
          f.value === "settings" ? (l(), X(Ma, {
            key: 1,
            settings: s.value.settings,
            busy: r.value || !!s.value.busy,
            onSave: Ne
          }, null, 8, ["settings", "busy"])) : f.value === "add" ? (l(), n(R, { key: 2 }, [
            e("label", Ys, [E(T, { name: "search" }), Z(e("input", {
              "onUpdate:modelValue": t[9] || (t[9] = (m) => M.value = m),
              placeholder: "查找已知人物",
              "aria-label": "查找已知人物",
              "aria-describedby": "messages-people-source"
            }, null, 512), [[se, M.value]])]),
            t[21] || (t[21] = e("div", {
              id: "messages-people-source",
              class: "messages-subtle messages-people-source"
            }, "人物来自当前聊天的剧情总结，需要开启总结功能；找不到的人可以手动添加。", -1)),
            e("div", {
              class: "messages-known-list",
              "aria-busy": B.value === "loading"
            }, [B.value === "loading" ? (l(), n("p", Xs, "正在读取已知人物…")) : B.value === "failed" ? (l(), n("div", Ws, [t[17] || (t[17] = e("p", {
              class: "messages-subtle",
              role: "alert"
            }, "已知人物暂时无法读取，可以重试或手动添加。", -1)), e("button", {
              class: "messages-secondary",
              disabled: r.value,
              onClick: ke
            }, "重新加载", 8, Qs)])) : (l(), n(R, { key: 2 }, [(l(!0), n(R, null, oe(be.value, (m) => (l(), n("button", {
              key: m.name,
              disabled: N.value,
              onClick: (F) => $e(m.name)
            }, [
              E(ue, {
                identity: m.name,
                name: m.name,
                small: ""
              }, null, 8, ["identity", "name"]),
              e("span", null, [Q(p(m.name), 1), m.aliases.length ? (l(), n("small", et, p(m.aliases.join("、")), 1)) : C("", !0)]),
              E(T, { name: "plus" })
            ], 8, _s))), 128)), be.value.length ? C("", !0) : (l(), n("p", at, p(M.value ? "没有匹配的人物，可以在下面手动添加。" : "暂无可添加的已知人物，可以在下面手动添加。"), 1))], 64))], 8, Js),
            e("details", st, [t[20] || (t[20] = e("summary", null, "想联系的人不在这里？", -1)), e("form", { onSubmit: t[12] || (t[12] = le((m) => $e(), ["prevent"])) }, [
              e("label", null, [t[18] || (t[18] = Q("姓名", -1)), Z(e("input", {
                "onUpdate:modelValue": t[10] || (t[10] = (m) => d.value = m),
                maxlength: "120",
                required: "",
                placeholder: "对方的姓名"
              }, null, 512), [[se, d.value]])]),
              e("label", null, [t[19] || (t[19] = Q("身份说明（可选）", -1)), Z(e("textarea", {
                "onUpdate:modelValue": t[11] || (t[11] = (m) => g.value = m),
                maxlength: "600",
                rows: "2",
                placeholder: "例如：住在隔壁的花店老板"
              }, null, 512), [[se, g.value]])]),
              e("button", {
                class: "messages-primary",
                disabled: N.value || B.value === "loading" || !d.value.trim()
              }, "添加并聊天", 8, tt)
            ], 32)])
          ], 64)) : f.value === "detail" ? (l(), n("form", {
            key: 3,
            onSubmit: le(ze, ["prevent"])
          }, [
            e("label", null, [t[22] || (t[22] = Q("身份说明 / 备注", -1)), Z(e("textarea", {
              "onUpdate:modelValue": t[13] || (t[13] = (m) => g.value = m),
              maxlength: "600",
              rows: "3",
              placeholder: "帮助辨认这位联系人"
            }, null, 512), [[se, g.value]])]),
            e("button", {
              class: "messages-primary",
              disabled: N.value
            }, "保存备注", 8, lt),
            e("button", {
              type: "button",
              class: "messages-danger",
              disabled: N.value,
              onClick: t[14] || (t[14] = (m) => f.value = "delete")
            }, "删除联系人与通讯记录", 8, nt)
          ], 32)) : f.value === "delete" ? (l(), n(R, { key: 4 }, [
            $.value ? (l(), n("p", it, p($.value), 1)) : (l(), n("p", ut, "删除与 " + p(z.value?.name) + " 的全部通讯和摘要，同时更新主聊天记录。其他联系人和图库文件保留，删除后不能恢复。", 1)),
            e("button", {
              class: "messages-danger",
              disabled: N.value || !!$.value,
              onClick: Ge
            }, "确认删除", 8, ot),
            e("button", {
              class: "messages-secondary",
              onClick: t[15] || (t[15] = (m) => f.value = "detail")
            }, "保留联系人")
          ], 64)) : f.value === "delete-message" ? (l(), n(R, { key: 5 }, [
            $.value ? (l(), n("p", rt, p($.value), 1)) : (l(), n("p", dt, "删除这条消息，同时更新主聊天记录。后续回复、其他消息和图库文件保留，删除后不能恢复。")),
            e("button", {
              class: "messages-danger",
              disabled: N.value || !!$.value,
              onClick: He
            }, "确认删除", 8, vt),
            e("button", {
              class: "messages-secondary",
              onClick: V
            }, "取消")
          ], 64)) : f.value === "sync" ? (l(), n(R, { key: 6 }, [
            t[25] || (t[25] = e("p", null, "信息 APP 已保留这些消息。重试只会补上主聊天里的记录，不会再次向对方发送，也不会重新生成回复。", -1)),
            e("button", {
              class: "messages-primary",
              disabled: N.value,
              onClick: Ve
            }, "补到主聊天", 8, gt),
            e("details", mt, [
              t[23] || (t[23] = e("summary", null, "原来的记录已被修改或删除？", -1)),
              t[24] || (t[24] = e("p", null, "不会覆盖你的修改。需要这些消息继续进入剧情时，可以在当前位置另加一条补记。", -1)),
              e("button", {
                class: "messages-secondary",
                disabled: N.value,
                onClick: t[16] || (t[16] = (m) => f.value = "recover")
              }, "查看补记方式", 8, ct)
            ])
          ], 64)) : f.value === "adopt" ? (l(), n(R, { key: 7 }, [
            t[26] || (t[26] = e("p", null, "将读取服务器上的当前聊天小白 OS 存档，放弃本地尚未确认的修改。信息 APP 会显示服务器已保存的联系人和消息。", -1)),
            t[27] || (t[27] = e("p", { class: "messages-subtle" }, "这项选择作用于当前聊天的整份 OS 存档，不会删除主聊天里的记录，也不会重新生成回复。", -1)),
            e("button", {
              class: "messages-danger",
              disabled: r.value || !!s.value.busy || s.value.generationActive,
              onClick: je
            }, "确认使用已保存版本", 8, yt),
            e("button", {
              class: "messages-secondary",
              disabled: r.value,
              onClick: V
            }, "暂不处理", 8, bt)
          ], 64)) : (l(), n(R, { key: 8 }, [
            t[28] || (t[28] = e("p", null, "先检查已有记录；仍未写入的消息会在主聊天当前位置标为「补录」，保留原发送时间。不会覆盖旧记录或恢复你删除的那一条。", -1)),
            e("button", {
              class: "messages-primary",
              disabled: N.value,
              onClick: Ze
            }, "确认补记", 8, ft),
            e("button", {
              class: "messages-secondary",
              onClick: V
            }, "暂不补记")
          ], 64))
        ]),
        _: 1
      }, 8, ["busy"])) : C("", !0)
    ]));
  }
}), Mt = pt;
export {
  Mt as default
};
