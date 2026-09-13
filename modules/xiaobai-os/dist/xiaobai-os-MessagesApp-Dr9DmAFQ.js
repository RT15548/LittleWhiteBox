/* eslint-disable */
import { A as ge, C as ie, D as Xe, G as Me, H as Y, K as w, M as l, P as oe, Q as f, R as Se, T as we, U as Je, V as Ae, X as W, Y as Qe, Z as me, b as O, c as Be, f as T, g as n, h, i as he, j as We, k as _e, l as le, m as ae, o as se, p as e, s as ea, u as R, v as _, y as x, z as ce } from "./xiaobai-os-runtime-dom.esm-bundler-BcM9c-Z9.js";
import { n as xe } from "./xiaobai-os-app-navigation-sg-40eOk.js";
import { t as Ee } from "./xiaobai-os-AppDialog-CI-E933W.js";
import { t as aa } from "./xiaobai-os-context-tokens-W3T8vx4V.js";
var sa = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.8",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
}, ta = ["d"], la = /* @__PURE__ */ O({
  __name: "MessageIcon",
  props: { name: {} },
  setup(a) {
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
      stop: "M7 7h10v10H7Z",
      settings: "m9 3-.5 3-2.5 1-2.5-1-2 3.5L4 11v2l-2.5 1.5 2 3.5L6 17l2.5 1L9 21h6l.5-3 2.5-1 2.5 1 2-3.5L20 13v-2l2.5-1.5-2-3.5L18 7l-2.5-1L15 3H9Zm6 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    };
    return (s, c) => (l(), n("svg", sa, [e("path", { d: p[a.name] }, null, 8, ta)]));
  }
}), P = la, na = /* @__PURE__ */ O({
  __name: "ContactAvatar",
  props: {
    identity: {},
    name: {},
    small: { type: Boolean }
  },
  setup(a) {
    const p = a, s = T(() => {
      let c = 0;
      for (const o of p.identity) c = Math.imul(c, 31) + o.codePointAt(0) | 0;
      return String((c >>> 0) % 360);
    });
    return (c, o) => (l(), n("span", {
      class: W(["messages-avatar", { small: a.small }]),
      style: me({ "--avatar-hue": s.value }),
      "aria-hidden": "true"
    }, f(Array.from(a.name)[0]), 7));
  }
}), ue = na, ia = { class: "messages-contacts" }, ua = { class: "messages-home-header" }, oa = { class: "messages-home-actions" }, ra = { class: "messages-search" }, da = {
  key: 0,
  class: "messages-empty"
}, va = {
  key: 1,
  class: "messages-contact-rows"
}, ga = {
  key: 0,
  class: "messages-subtle"
}, ma = ["onClick"], ca = { class: "messages-contact-copy" }, ya = { class: "messages-contact-heading" }, ba = {
  key: 0,
  class: "messages-preview messages-preview-active"
}, fa = {
  key: 1,
  class: "messages-preview"
}, pa = {
  key: 2,
  class: "messages-preview"
}, ka = /* @__PURE__ */ O({
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
    const p = a, s = w(""), c = T(() => p.contacts.filter((y) => `${y.name} ${y.note}`.toLocaleLowerCase().includes(s.value.toLocaleLowerCase())));
    function o(y) {
      if (y === null) return "";
      const r = new Date(y);
      return r.toDateString() === (/* @__PURE__ */ new Date()).toDateString() ? r.toLocaleTimeString(void 0, {
        hour: "2-digit",
        minute: "2-digit"
      }) : r.toLocaleDateString(void 0, {
        month: "numeric",
        day: "numeric"
      });
    }
    return (y, r) => (l(), n("section", ia, [
      e("header", ua, [r[4] || (r[4] = e("h1", null, "信息", -1)), e("div", oa, [e("button", {
        class: "messages-icon-button",
        title: "设置",
        "aria-label": "设置",
        onClick: r[0] || (r[0] = (u) => y.$emit("settings"))
      }, [x(P, { name: "settings" })]), e("button", {
        class: "messages-icon-button messages-add-contact",
        "aria-label": "添加联系人",
        onClick: r[1] || (r[1] = (u) => y.$emit("add"))
      }, [x(P, { name: "plus" })])])]),
      e("label", ra, [x(P, { name: "search" }), Y(e("input", {
        "onUpdate:modelValue": r[2] || (r[2] = (u) => s.value = u),
        type: "search",
        placeholder: "搜索联系人",
        "aria-label": "搜索联系人"
      }, null, 512), [[se, s.value]])]),
      a.contacts.length ? (l(), n("div", va, [c.value.length ? h("", !0) : (l(), n("p", ga, "没有找到这个人。")), (l(!0), n(R, null, oe(c.value, (u) => (l(), n("button", {
        key: u.id,
        class: "messages-contact-row",
        onClick: (I) => y.$emit("select", u.id)
      }, [x(ue, {
        identity: u.id,
        name: u.name
      }, null, 8, ["identity", "name"]), e("span", ca, [e("span", ya, [e("strong", null, f(u.name), 1), e("time", null, f(o(u.lastAt)), 1)]), a.busyContactId === u.id ? (l(), n("span", ba, "正在等待回复…")) : a.drafts.get(u.id)?.text.trim() || a.drafts.get(u.id)?.image ? (l(), n("span", fa, [r[7] || (r[7] = e("em", null, "草稿", -1)), _(" " + f(a.drafts.get(u.id)?.image ? "［图片］" : "") + f(a.drafts.get(u.id)?.text), 1)])) : (l(), n("span", pa, f(u.preview), 1))])], 8, ma))), 128))])) : (l(), n("div", da, [
        x(P, { name: "message" }),
        r[6] || (r[6] = e("h2", null, "暂无联系人", -1)),
        e("button", {
          class: "messages-primary",
          onClick: r[3] || (r[3] = (u) => y.$emit("add"))
        }, [r[5] || (r[5] = _("添加联系人", -1)), x(P, { name: "plus" })])
      ]))
    ]));
  }
}), $a = ka, wa = ["disabled"], ha = {
  type: "submit",
  class: "messages-primary"
}, Ca = /* @__PURE__ */ O({
  __name: "MessagesSettings",
  props: {
    settings: {},
    busy: { type: Boolean }
  },
  emits: ["save"],
  setup(a, { emit: p }) {
    const s = a, c = p, o = Me({ ...s.settings });
    return (y, r) => (l(), n("form", {
      class: "messages-settings",
      onSubmit: r[2] || (r[2] = le((u) => c("save", { ...o }), ["prevent"]))
    }, [e("fieldset", { disabled: a.busy }, [
      r[5] || (r[5] = e("legend", null, "能力", -1)),
      e("label", null, [r[3] || (r[3] = e("span", null, "在提示词中允许图片", -1)), Y(e("input", {
        "onUpdate:modelValue": r[0] || (r[0] = (u) => o.imagePrompt = u),
        type: "checkbox"
      }, null, 512), [[he, o.imagePrompt]])]),
      e("label", null, [r[4] || (r[4] = e("span", null, "在提示词中允许语音", -1)), Y(e("input", {
        "onUpdate:modelValue": r[1] || (r[1] = (u) => o.voicePrompt = u),
        type: "checkbox"
      }, null, 512), [[he, o.voicePrompt]])]),
      e("button", ha, f(a.busy ? "请稍候…" : "保存能力设置"), 1)
    ], 8, wa)], 32));
  }
}), Ia = Ca, Ma = ["data-message-id"], Sa = {
  class: "messages-bubble-actions",
  role: "group",
  "aria-label": "消息操作"
}, Aa = ["disabled", "title"], Ba = ["disabled"], xa = { key: 0 }, Ea = ["src", "alt"], Da = ["disabled"], Ta = {
  key: 3,
  class: "messages-image-placeholder messages-media-unavailable"
}, Ra = {
  key: 4,
  class: "messages-image-caption"
}, La = ["src", "alt"], Pa = ["disabled", "aria-label"], Ua = {
  key: 0,
  class: "messages-media-unavailable-note"
}, qa = {
  key: 2,
  class: "messages-transcript"
}, Va = {
  key: 3,
  class: "messages-media-error",
  role: "status"
}, Na = /* @__PURE__ */ O({
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
  setup(a, { emit: p }) {
    const s = a, c = p;
    function o(A) {
      A.target.closest("button, a, dialog") || window.getSelection()?.toString() || c("select", s.message.id);
    }
    const y = w(""), r = w(!1), u = w(""), I = w(""), M = w(!1), E = T(() => s.message.payload.type === "image" ? s.message.payload.attachment : void 0), B = T(() => E.value?.path || y.value), b = w(!1), $ = w(!1), C = T(() => [
      "playing",
      "loading",
      "generating",
      "queued"
    ].includes(I.value)), S = w(!1);
    let g = !0;
    const d = (A) => s.bridge.request(A, {
      chatIdentity: s.chatIdentity,
      messageId: s.message.id
    }, 18e4);
    async function k(A) {
      if (!r.value) {
        r.value = !0, u.value = "";
        try {
          const { result: m } = await d(A ? "messages/image/generate" : "messages/image/check");
          g && (y.value = m.data ?? "", b.value = !1, A && !y.value && (u.value = "请开启画图后再试，画面描述已保留。"));
        } catch {
          g && A && (u.value = "图片生成失败，可以再试一次。");
        } finally {
          g && (r.value = !1);
        }
      }
    }
    async function L() {
      if (S.value) return;
      u.value = "";
      const A = C.value;
      if (!(!A && !s.media.voice))
        try {
          A ? (S.value = !0, await d("messages/voice/stop"), g && (I.value = "")) : (I.value = "loading", await d("messages/voice/play"));
        } catch {
          g && (A || (I.value = ""), u.value = A ? "未能确认停止，请再点一次停止。" : "语音暂时无法播放，原文仍可查看。");
        } finally {
          g && (S.value = !1);
        }
    }
    const F = s.bridge.subscribe((A) => {
      if (A.type !== "messages/voice-state") return;
      const m = A.payload;
      m.messageId === s.message.id ? I.value = m.status : m.status === "playing" && (I.value = ""), m.messageId === s.message.id && m.status === "error" && (u.value = "播放失败，点击可以重试。");
    });
    return _e(() => {
      s.message.payload.type === "image" && !E.value && k(!1);
    }), ce(() => s.media.image, (A) => {
      A && s.message.payload.type === "image" && !E.value && !y.value && k(!1);
    }), ge(() => {
      g = !1, F(), C.value && d("messages/voice/stop").catch(() => {
      });
    }), (A, m) => (l(), n("article", {
      class: W(["messages-bubble-row", {
        outgoing: a.message.sender === "user",
        "actions-selected": a.selected
      }]),
      "data-message-id": a.message.id,
      tabindex: "0",
      "aria-label": "消息操作",
      onClick: o,
      onFocus: m[10] || (m[10] = (D) => c("select", a.message.id))
    }, [e("div", Sa, [e("button", {
      disabled: a.disabled,
      title: a.permission?.reason,
      class: W({ "is-unavailable": a.permission?.reason }),
      "aria-haspopup": "dialog",
      onClick: m[0] || (m[0] = (D) => A.$emit("deleteMessage", a.message.id))
    }, "删除", 10, Aa), a.permission?.regenerate ? (l(), n("button", {
      key: 0,
      disabled: a.disabled,
      onClick: m[1] || (m[1] = (D) => A.$emit("regenerate", a.message.id))
    }, "重新回复", 8, Ba)) : h("", !0)]), e("div", { class: W(["messages-bubble", `messages-bubble-${a.message.payload.type}`]) }, [a.message.payload.type === "text" ? (l(), n("p", xa, f(a.message.payload.text), 1)) : a.message.payload.type === "image" ? (l(), n(R, { key: 1 }, [
      B.value && !b.value ? (l(), n("button", {
        key: 0,
        class: "messages-image-open",
        "aria-label": "放大图片",
        onClick: m[4] || (m[4] = (D) => $.value = !0)
      }, [e("img", {
        src: B.value,
        alt: a.message.payload.description || E.value?.name || "图片",
        onLoad: m[2] || (m[2] = (D) => A.$emit("resize")),
        onError: m[3] || (m[3] = (D) => b.value = !0)
      }, null, 40, Ea)])) : E.value ? (l(), n("button", {
        key: 1,
        class: "messages-image-placeholder",
        onClick: m[5] || (m[5] = (D) => b.value = !1)
      }, [
        x(P, { name: "image" }),
        m[11] || (m[11] = e("span", null, "原图暂时无法读取", -1)),
        m[12] || (m[12] = e("small", null, "点击重试", -1))
      ])) : a.media.image ? (l(), n("button", {
        key: 2,
        class: "messages-image-placeholder",
        disabled: r.value,
        onClick: m[6] || (m[6] = (D) => k(!0))
      }, [x(P, { name: "image" }), e("span", null, f(r.value ? "正在生成图片…" : u.value ? "重新生成图片" : "生成图片"), 1)], 8, Da)) : (l(), n("div", Ta, [
        x(P, { name: "image" }),
        m[13] || (m[13] = e("span", null, "图片描述", -1)),
        m[14] || (m[14] = e("small", null, "开启画图后可生成图片", -1))
      ])),
      a.message.payload.description ? (l(), n("p", Ra, f(a.message.payload.description), 1)) : h("", !0),
      $.value ? (l(), ae(Ee, {
        key: 5,
        class: "messages-image-viewer",
        "aria-label": "查看图片",
        onClose: m[8] || (m[8] = (D) => $.value = !1)
      }, {
        default: Ae(() => [e("button", {
          "aria-label": "关闭图片",
          onClick: m[7] || (m[7] = (D) => $.value = !1)
        }, [x(P, { name: "close" })]), B.value ? (l(), n("img", {
          key: 0,
          src: B.value,
          alt: a.message.payload.description || E.value?.name || "图片"
        }, null, 8, La)) : h("", !0)]),
        _: 1
      })) : h("", !0)
    ], 64)) : (l(), n(R, { key: 2 }, [
      e("button", {
        class: "messages-voice-button",
        disabled: S.value || !a.media.voice && !C.value,
        "aria-label": C.value ? "停止播放" : "播放语音",
        onClick: L
      }, [
        x(P, { name: C.value ? "stop" : "play" }, null, 8, ["name"]),
        e("span", { class: W(["messages-wave", { playing: I.value === "playing" }]) }, [(l(), n(R, null, oe(16, (D) => e("i", {
          key: D,
          style: me({
            height: `${8 + D * 7 % 17}px`,
            animationDelay: `${D * 45}ms`
          })
        }, null, 4)), 64))], 2),
        e("small", null, f(S.value ? "停止中" : [
          "loading",
          "generating",
          "queued"
        ].includes(I.value) ? "准备中" : "语音"), 1)
      ], 8, Pa),
      a.media.voice ? h("", !0) : (l(), n("small", Ua, "开启 TTS 后可播放")),
      a.media.voice ? (l(), n("button", {
        key: 1,
        class: "messages-transcript-toggle",
        onClick: m[9] || (m[9] = (D) => M.value = !M.value)
      }, f(M.value ? "收起原文" : "查看原文"), 1)) : h("", !0),
      M.value || !a.media.voice ? (l(), n("p", qa, f(a.message.payload.transcript), 1)) : h("", !0)
    ], 64)), u.value ? (l(), n("small", Va, f(u.value), 1)) : h("", !0)], 2)], 42, Ma));
  }
}), Fa = Na, Ga = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
], kt = 4 * 1024 * 1024;
async function za(a) {
  if (!Ga.includes(a.type)) throw new Error("请选择 PNG、JPG、WEBP 或 GIF 图片。");
  if (!a.size || a.size > 4194304) throw new Error("请选择不超过 4MB 的图片。");
  const p = await new Promise((c, o) => {
    const y = new FileReader();
    y.onerror = () => o(/* @__PURE__ */ new Error("图片读取失败，请重新选择。")), y.onload = () => typeof y.result == "string" ? c(y.result) : o(/* @__PURE__ */ new Error("图片读取失败。")), y.readAsDataURL(a);
  }), s = new Image();
  s.src = p;
  try {
    await s.decode();
  } catch {
    throw new Error("这张图片无法打开，请换一张。");
  }
  return {
    dataUrl: p,
    name: a.name.replace(/[\u0000-\u001f\u007f]/gu, "").trim().slice(0, 120) || "图片"
  };
}
var Ha = {
  key: 0,
  class: "messages-attachment-preview"
}, Za = ["src", "alt"], Ka = ["disabled"], Oa = {
  key: 1,
  class: "messages-composer-hint"
}, ja = {
  key: 2,
  class: "messages-composer-hint",
  role: "status"
}, Ya = {
  key: 3,
  class: "messages-composer-wait",
  role: "status"
}, Xa = { class: "messages-composer-line" }, Ja = ["disabled"], Qa = ["placeholder", "disabled"], Wa = ["disabled"], _a = /* @__PURE__ */ O({
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
  setup(a, { emit: p }) {
    const s = a, c = p, o = Se(a, "draft"), y = T({
      get: () => o.value.text,
      set: (C) => {
        o.value = {
          ...o.value,
          text: C
        };
      }
    }), r = w(null), u = w(!1), I = w("");
    let M = !0;
    async function E(C) {
      const S = C.target, g = S.files?.[0];
      if (S.value = "", !(!g || s.sending || u.value)) {
        u.value = !0, I.value = "";
        try {
          const d = await za(g);
          M && (o.value = {
            ...o.value,
            image: d
          });
        } catch (d) {
          M && (I.value = d instanceof Error ? d.message : "图片读取失败，请重新选择。");
        } finally {
          M && (u.value = !1);
        }
      }
    }
    function B() {
      o.value = {
        ...o.value,
        image: null
      }, I.value = "";
    }
    function b() {
      const C = y.value.trim();
      !C && !o.value.image || s.disabled || u.value || c("send", o.value.image ? {
        type: "image",
        description: C,
        upload: { ...o.value.image }
      } : {
        type: "text",
        text: C
      });
    }
    ge(() => {
      M = !1;
    });
    function $(C) {
      C.key === "Enter" && (C.ctrlKey || C.metaKey) && !C.isComposing && (C.preventDefault(), b());
    }
    return (C, S) => (l(), n("form", {
      class: "messages-composer",
      onSubmit: le(b, ["prevent"])
    }, [
      e("input", {
        ref_key: "fileInput",
        ref: r,
        type: "file",
        accept: "image/png,image/jpeg,image/webp,image/gif",
        hidden: "",
        "aria-label": "选择图片文件",
        onChange: E
      }, null, 544),
      o.value.image ? (l(), n("div", Ha, [
        e("img", {
          src: o.value.image.dataUrl,
          alt: o.value.image.name
        }, null, 8, Za),
        e("span", null, [S[2] || (S[2] = e("strong", null, "待发送的图片", -1)), e("small", null, f(o.value.image.name), 1)]),
        e("button", {
          type: "button",
          class: "messages-icon-button",
          "aria-label": "移除图片",
          disabled: a.sending || u.value,
          onClick: B
        }, [x(P, { name: "close" })], 8, Ka)
      ])) : h("", !0),
      o.value.image ? (l(), n("p", Oa, "图片将随消息发送，需要当前模型支持看图。")) : h("", !0),
      u.value || I.value ? (l(), n("p", ja, f(u.value ? "正在读取图片…" : I.value), 1)) : h("", !0),
      a.waitingFor ? (l(), n("p", Ya, "正在等待 " + f(a.waitingFor) + " 的回复。可以先写好，稍后发送。", 1)) : h("", !0),
      e("div", Xa, [
        e("button", {
          type: "button",
          class: "messages-icon-button messages-attach",
          "aria-label": "选择图片",
          disabled: a.sending || u.value,
          onClick: S[0] || (S[0] = (g) => r.value?.click())
        }, [x(P, { name: "plus" })], 8, Ja),
        Y(e("textarea", {
          "onUpdate:modelValue": S[1] || (S[1] = (g) => y.value = g),
          rows: "1",
          maxlength: "4000",
          placeholder: o.value.image ? "给图片配句话…" : "说点什么…",
          "aria-label": "消息内容",
          disabled: a.sending,
          onKeydown: $
        }, null, 40, Qa), [[se, y.value]]),
        e("button", {
          class: "messages-send",
          type: "submit",
          disabled: a.disabled || u.value || !y.value.trim() && !o.value.image,
          "aria-label": "发送"
        }, [x(P, { name: "send" })], 8, Wa)
      ])
    ], 32));
  }
}), es = _a, as = {
  class: "messages-delivery",
  role: "status"
}, ss = { key: 0 }, ts = ["disabled"], ls = ["disabled"], ns = /* @__PURE__ */ O({
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
    return (p, s) => (l(), n("div", as, [a.sending ? (l(), n("span", ss, "发送中…")) : (l(), n(R, { key: 1 }, [
      e("span", null, f(a.error || (a.pendingSave ? "尚待保存确认" : "尚未收到回复")), 1),
      e("button", {
        disabled: a.disabled,
        onClick: s[0] || (s[0] = (c) => p.$emit("retry"))
      }, f(a.pendingSave ? "检查并重试" : "重试"), 9, ts),
      a.discard && !a.pendingSave ? (l(), n("button", {
        key: 0,
        disabled: a.disabled,
        onClick: s[1] || (s[1] = (c) => p.$emit("discard"))
      }, "删除", 8, ls)) : h("", !0)
    ], 64))]));
  }
}), Ce = ns, is = 158e3, us = 128e3, Ie = 6e3;
function os(a) {
  return String(a ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/{/g, "&#123;").replace(/}/g, "&#125;");
}
var rs = ["aria-label", "aria-expanded"], ds = {
  key: 0,
  class: "messages-context-popover",
  "aria-label": "上下文用量"
}, vs = { class: "messages-context-total" }, gs = {
  key: 1,
  role: "status"
}, ms = { key: 3 }, cs = /* @__PURE__ */ O({
  __name: "MessageContextButton",
  props: {
    bridge: {},
    state: {},
    contactId: {},
    draft: {}
  },
  setup(a) {
    const p = a, s = w(!1), c = w(!1), o = w(!1), y = w(0), r = w(null);
    xe(() => (s.value = !1, !0), () => s.value), ce(() => JSON.stringify([
      p.contactId,
      p.state.chatIdentity,
      p.state.revision,
      p.state.boundary,
      p.state.settings.imagePrompt,
      p.state.settings.voicePrompt,
      !!p.state.busy,
      p.state.generationActive,
      y.value
    ]), async (b, $, C) => {
      let S = !0;
      if (C(() => {
        S = !1;
      }), c.value = !0, o.value = !1, p.state.busy || p.state.generationActive) return;
      const g = p.state.revision, d = p.state.boundary;
      try {
        const k = await p.bridge.request("messages/context", {
          chatIdentity: p.state.chatIdentity,
          contactId: p.contactId
        }, 6e4);
        if (!S) return;
        if (k.result.revision !== g || k.result.boundary !== d) throw new Error("stale");
        r.value = k.result.stats;
      } catch {
        S && (o.value = !0, r.value = null);
      } finally {
        S && (c.value = !1);
      }
    }, { immediate: !0 });
    const u = T(() => aa(os(p.draft.text))), I = T(() => (r.value?.imageTokens ?? 0) + (p.draft.image ? Ie : 0)), M = T(() => (r.value?.usedTokens ?? 0) + u.value + (p.draft.image ? Ie : 0)), E = T(() => Math.min(1, M.value / is)), B = (b) => `${(b / 1e3).toFixed(1)}k`;
    return (b, $) => (l(), n("div", {
      class: "messages-context",
      onKeydown: $[3] || ($[3] = Be(le((C) => s.value = !1, ["stop"]), ["esc"]))
    }, [e("button", {
      type: "button",
      class: W(["messages-context-ring", { "is-warning": M.value >= Qe(us) }]),
      style: me({ "--context-fill": `${r.value ? E.value * 360 : 0}deg` }),
      "aria-label": r.value ? `上下文：约 ${B(M.value)} / 158k` : "上下文用量",
      "aria-expanded": s.value,
      title: "上下文",
      onClick: $[0] || ($[0] = (C) => s.value = !s.value)
    }, [e("span", null, f(c.value ? "…" : o.value || !r.value ? "—" : Math.round(E.value * 100)), 1)], 14, rs), s.value ? (l(), n("section", ds, [
      e("header", null, [$[4] || ($[4] = e("strong", null, "上下文", -1)), e("button", {
        type: "button",
        "aria-label": "关闭上下文用量",
        onClick: $[1] || ($[1] = (C) => s.value = !1)
      }, "×")]),
      r.value ? (l(), n(R, { key: 0 }, [e("p", vs, "约 " + f(B(M.value)) + " / 158k", 1), e("dl", null, [
        $[6] || ($[6] = e("dt", null, "剧情与设定", -1)),
        e("dd", null, f(B(r.value.backgroundTokens)), 1),
        $[7] || ($[7] = e("dt", null, "通讯摘要", -1)),
        e("dd", null, f(B(r.value.summaryTokens)), 1),
        $[8] || ($[8] = e("dt", null, "通讯原文", -1)),
        e("dd", null, f(B(r.value.historyTokens)), 1),
        $[9] || ($[9] = e("dt", null, "提示词与输入", -1)),
        e("dd", null, f(B(r.value.promptTokens + u.value)), 1),
        I.value ? (l(), n(R, { key: 0 }, [$[5] || ($[5] = e("dt", null, "图片预留", -1)), e("dd", null, f(B(I.value)), 1)], 64)) : h("", !0)
      ])], 64)) : h("", !0),
      c.value ? (l(), n("p", gs, f(a.state.busy?.stage === "summarizing" ? "正在总结较早通讯…" : a.state.busy || a.state.generationActive ? "本轮结束后更新用量。" : "正在读取…"), 1)) : o.value ? (l(), n(R, { key: 2 }, [$[10] || ($[10] = e("p", { role: "status" }, "用量暂时无法读取。", -1)), e("button", {
        type: "button",
        class: "messages-secondary",
        onClick: $[2] || ($[2] = (C) => y.value++)
      }, "重试")], 64)) : h("", !0),
      $[11] || ($[11] = e("p", null, "128k 时在下次回复前自动总结，保留近期原文。", -1)),
      I.value ? (l(), n("small", ms, "图片按每张 6k 预留，实际用量由模型决定。")) : h("", !0)
    ])) : h("", !0)], 32));
  }
}), ys = cs, bs = { class: "messages-conversation" }, fs = { class: "messages-thread-header" }, ps = { class: "messages-thread-heading" }, ks = ["disabled"], $s = {
  key: 1,
  class: "messages-thread-start"
}, ws = {
  key: 0,
  class: "messages-time"
}, hs = { class: "messages-bubble-row outgoing" }, Cs = { key: 0 }, Is = ["src", "alt"], Ms = {
  key: 0,
  class: "messages-image-caption"
}, Ss = {
  key: 3,
  class: "messages-typing",
  role: "status"
}, As = /* @__PURE__ */ O({
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
  setup(a, { expose: p }) {
    const s = Se(a, "draft"), c = a, o = w("");
    function y(g) {
      g.target.closest(".messages-bubble-row") || (o.value = "");
    }
    const r = T(() => c.busy?.contactId === c.contact.id ? c.busy.stage : ""), u = T(() => [
      "replying",
      "summarizing",
      "saving-reply"
    ].includes(r.value));
    function I(g) {
      return [c.sendFailure, c.sendError].find((d) => d?.contactId === c.contact.id && d.messageId === g)?.message;
    }
    const M = w(null);
    let E = !0, B = !1, b = null;
    Xe(() => {
      b = null;
      const g = M.value;
      if (!g || E && !B && !c.page.hasNewer) return;
      const d = new Set(c.page.messages.map((L) => L.id)), k = [...g.querySelectorAll("[data-message-id]")].find((L) => d.has(L.dataset.messageId) && L.getBoundingClientRect().bottom > g.getBoundingClientRect().top);
      k && (b = {
        id: k.dataset.messageId,
        offset: k.getBoundingClientRect().top - g.getBoundingClientRect().top
      });
    }), We(() => {
      const g = M.value;
      if (g)
        if (b) {
          const d = [...g.querySelectorAll("[data-message-id]")].find((k) => k.dataset.messageId === b.id);
          d && (g.scrollTop += d.getBoundingClientRect().top - g.getBoundingClientRect().top - b.offset), b = null;
        } else E && !B && !c.page.hasNewer && (g.scrollTop = g.scrollHeight);
    });
    function $() {
      const g = M.value;
      g && (E = g.scrollHeight - g.clientHeight - g.scrollTop < 70);
    }
    async function C() {
      await we(), E && !B && !c.page.hasNewer && M.value && (M.value.scrollTop = M.value.scrollHeight);
    }
    ce(() => [
      c.page.messages.at(-1)?.id,
      c.outgoing?.messageId,
      r.value,
      c.sendFailure,
      c.sendError
    ], C, { immediate: !0 });
    async function S() {
      if (!(!M.value || B)) {
        B = !0;
        try {
          await c.loadMore(), await we();
        } finally {
          B = !1, $();
        }
      }
    }
    return p({ sent() {
      E = !0, C();
    } }), (g, d) => (l(), n("section", bs, [
      e("header", fs, [
        e("button", {
          class: "messages-icon-button",
          "aria-label": "返回信息",
          onClick: d[0] || (d[0] = (k) => g.$emit("back"))
        }, [x(P, { name: "back" })]),
        x(ue, {
          identity: a.contact.id,
          name: a.contact.name,
          small: ""
        }, null, 8, ["identity", "name"]),
        e("div", ps, [e("h2", null, f(a.contact.name), 1)]),
        x(ys, {
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
          onClick: d[1] || (d[1] = (k) => g.$emit("details"))
        }, [x(P, { name: "more" })])
      ]),
      e("div", {
        ref_key: "scroller",
        ref: M,
        class: "messages-thread-scroll",
        onScroll: $,
        onClick: y,
        onKeydown: d[7] || (d[7] = Be((k) => o.value = "", ["esc"]))
      }, [
        d[12] || (d[12] = e("p", { class: "messages-subtle messages-context-hint" }, "对话参考角色设定、世界书、近期剧情及可用总结。", -1)),
        a.page.hasMore ? (l(), n("button", {
          key: 0,
          class: "messages-older",
          disabled: a.loading,
          onClick: S
        }, f(a.loading ? "读取中…" : "查看更早的消息"), 9, ks)) : h("", !0),
        a.loading && !a.page.messages.length ? (l(), n("p", $s, "正在读取消息…")) : h("", !0),
        (l(!0), n(R, null, oe(a.page.messages, (k, L) => (l(), n(R, { key: k.id }, [
          L === 0 || k.createdAt - a.page.messages[L - 1].createdAt > 3e5 ? (l(), n("time", ws, f(new Date(k.createdAt).toLocaleString(void 0, {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })), 1)) : h("", !0),
          x(Fa, {
            message: k,
            bridge: a.bridge,
            "chat-identity": a.chatIdentity,
            media: a.media,
            disabled: a.disabled,
            selected: o.value === k.id,
            permission: a.page.permissions[k.id],
            onSelect: d[2] || (d[2] = (F) => o.value = F),
            onResize: C,
            onDeleteMessage: d[3] || (d[3] = (F) => g.$emit("deleteMessage", F)),
            onRegenerate: d[4] || (d[4] = (F) => g.$emit("regenerate", F))
          }, null, 8, [
            "message",
            "bridge",
            "chat-identity",
            "media",
            "disabled",
            "selected",
            "permission"
          ]),
          k.id === a.page.retryMessageId && !u.value ? (l(), ae(Ce, {
            key: 1,
            sending: a.busy?.messageId === k.id && ["saving", "uploading"].includes(r.value),
            error: I(k.id),
            "pending-save": a.pendingSave,
            disabled: a.retryDisabled,
            onRetry: (F) => g.$emit("retry", k.id)
          }, null, 8, [
            "sending",
            "error",
            "pending-save",
            "disabled",
            "onRetry"
          ])) : h("", !0)
        ], 64))), 128)),
        a.outgoing ? (l(), n(R, { key: 2 }, [e("div", hs, [e("div", { class: W(["messages-bubble", { "messages-bubble-image": a.outgoing.payload.type === "image" }]) }, [a.outgoing.payload.type === "text" ? (l(), n("p", Cs, f(a.outgoing.payload.text), 1)) : (l(), n(R, { key: 1 }, [e("img", {
          class: "messages-pending-image",
          src: a.outgoing.payload.upload.dataUrl,
          alt: a.outgoing.payload.upload.name,
          onLoad: C
        }, null, 40, Is), a.outgoing.payload.description ? (l(), n("p", Ms, f(a.outgoing.payload.description), 1)) : h("", !0)], 64))], 2)]), x(Ce, {
          sending: a.working || a.busy?.messageId === a.outgoing.messageId,
          error: I(a.outgoing.messageId) || "发送未完成",
          "pending-save": a.pendingSave,
          disabled: a.retryDisabled,
          discard: "",
          onRetry: d[5] || (d[5] = (k) => g.$emit("retry", a.outgoing.messageId)),
          onDiscard: d[6] || (d[6] = (k) => g.$emit("discard", a.outgoing.messageId))
        }, null, 8, [
          "sending",
          "error",
          "pending-save",
          "disabled"
        ])], 64)) : h("", !0),
        u.value ? (l(), n("div", Ss, [...d[11] || (d[11] = [e("span", null, [
          e("i"),
          e("i"),
          e("i")
        ], -1), _("对方正在输入…", -1)])])) : h("", !0)
      ], 544),
      a.page.hasNewer ? (l(), n("button", {
        key: 0,
        class: "messages-latest",
        onClick: d[8] || (d[8] = (k) => {
          Je(E) ? E.value = !0 : E = !0, g.$emit("latest");
        })
      }, "回到最新消息")) : h("", !0),
      x(es, {
        draft: s.value,
        "onUpdate:draft": d[9] || (d[9] = (k) => s.value = k),
        disabled: a.sendDisabled,
        sending: !1,
        "waiting-for": a.waitingFor,
        onSend: d[10] || (d[10] = (k) => g.$emit("send", k))
      }, null, 8, [
        "draft",
        "disabled",
        "waiting-for"
      ])
    ]));
  }
}), Bs = As, xs = () => ({
  text: "",
  image: null
});
function ve() {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (a) => a.toString(16).padStart(2, "0")).join("");
}
var Es = { class: "messages-app" }, Ds = {
  key: 0,
  class: "messages-banner",
  role: "status"
}, Ts = { class: "messages-save-actions" }, Rs = ["disabled"], Ls = ["disabled"], Ps = {
  key: 1,
  class: "messages-banner",
  role: "status"
}, Us = ["disabled"], qs = {
  key: 2,
  class: "messages-notice"
}, Vs = {
  key: 3,
  class: "messages-error",
  role: "alert"
}, Ns = {
  key: 4,
  class: "messages-banner",
  role: "alert"
}, Fs = ["disabled"], Gs = { id: "messages-dialog-title" }, zs = ["disabled"], Hs = {
  key: 0,
  class: "messages-error",
  role: "alert"
}, Zs = { class: "messages-search" }, Ks = ["aria-busy"], Os = {
  key: 0,
  class: "messages-subtle",
  role: "status"
}, js = { key: 1 }, Ys = ["disabled"], Xs = ["disabled", "onClick"], Js = { key: 0 }, Qs = {
  key: 0,
  class: "messages-subtle"
}, Ws = { class: "messages-manual" }, _s = ["disabled"], et = ["disabled"], at = ["disabled"], st = {
  key: 0,
  role: "status"
}, tt = { key: 1 }, lt = ["disabled"], nt = {
  key: 0,
  role: "status"
}, it = { key: 1 }, ut = ["disabled"], ot = ["disabled"], rt = { class: "messages-manual" }, dt = ["disabled"], vt = ["disabled"], gt = ["disabled"], mt = ["disabled"], ct = /* @__PURE__ */ O({
  __name: "MessagesApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(a) {
    const p = a, s = w(p.initialState), c = (i = "") => ({
      contactId: i,
      messages: [],
      hasMore: !1,
      hasNewer: !1,
      retryMessageId: null,
      revision: "",
      permissions: {}
    }), o = w(""), y = w(c()), r = w(!1), u = w(!1), I = w(""), M = w(""), E = w(null), B = w(!1), b = w("add"), $ = w(""), C = w(""), S = T(() => b.value === "delete" ? H.value?.deleteReason ?? "" : y.value.permissions[$.value]?.reason ?? ""), g = w(""), d = w(""), k = w(""), L = w("ready"), F = w(ve());
    let A = !0, m = 0;
    const D = Me(/* @__PURE__ */ new Map()), ye = T({
      get: () => D.get(o.value) ?? xs(),
      set: (i) => {
        D.set(o.value, i);
      }
    }), U = w(null), j = w(null), Q = T(() => s.value.outgoing ?? U.value), De = T(() => Q.value?.contactId === o.value && !y.value.messages.some((i) => i.id === Q.value?.messageId) ? Q.value : null), H = T(() => s.value.contacts.find((i) => i.id === o.value)), Te = T(() => s.value.busy && s.value.busy.contactId !== o.value ? s.value.contacts.find((i) => i.id === s.value.busy?.contactId)?.name ?? "另一位联系人" : ""), te = T(() => s.value.pendingSave || s.value.pendingModification || [
      "unconfirmed",
      "conflict",
      "failed"
    ].includes(s.value.fileState)), N = T(() => u.value || !!s.value.busy || te.value || s.value.fileState !== "ready" || s.value.generationActive), be = T(() => s.value.knownPeople.filter((i) => !s.value.contacts.some((t) => t.name === i.name) && `${i.name} ${i.aliases.join(" ")}`.toLocaleLowerCase().includes(k.value.toLocaleLowerCase())));
    async function q(i, t = {}) {
      return (await p.bridge.request(i, {
        chatIdentity: s.value.chatIdentity,
        ...t
      }, 6e4)).result;
    }
    async function X(i = !1, t = !1) {
      const v = o.value;
      if (!v) return;
      const z = ++m;
      r.value = !0, M.value = "";
      try {
        const K = y.value, J = await q("messages/thread", {
          contactId: v,
          ...i ? {
            before: K.messages[0]?.seq,
            revision: K.revision
          } : !t && K.messages.length ? { window: {
            first: K.messages[0].seq,
            last: K.messages.at(-1).seq,
            latest: !K.hasNewer
          } } : {}
        });
        if (!A || z !== m || o.value !== v || J.revision !== s.value.revision) return;
        const re = i && K.revision === J.revision, de = re ? [...J.messages, ...K.messages].slice(0, 100) : J.messages;
        y.value = {
          ...J,
          messages: de,
          hasNewer: re ? de.at(-1)?.id !== K.messages.at(-1)?.id || K.hasNewer : J.hasNewer,
          permissions: re ? {
            ...K.permissions,
            ...J.permissions
          } : J.permissions
        }, U.value?.contactId === v && de.some((Ye) => Ye.id === U.value?.messageId) && (U.value = null, j.value = null);
      } catch {
        A && z === m && o.value === v && (M.value = "消息暂时无法读取。");
      } finally {
        z === m && (r.value = !1);
      }
    }
    function V(i) {
      if (!A || i.chatIdentity !== s.value.chatIdentity) return;
      const t = s.value.revision !== i.revision || s.value.boundary !== i.boundary || s.value.fileState !== i.fileState || s.value.pendingSave !== i.pendingSave;
      s.value = i, U.value && (i.outgoing?.messageId === U.value.messageId || i.busy?.messageId === U.value.messageId || i.contacts.some((v) => v.lastMessageId === U.value.messageId)) && (U.value = null, j.value = null);
      for (const v of D.keys()) i.contacts.some((z) => z.id === v) || D.delete(v);
      U.value && !i.contacts.some((v) => v.id === U.value?.contactId) && (U.value = null, j.value = null), o.value && !i.contacts.some((v) => v.id === o.value) ? ne() : o.value && t && X();
    }
    const Re = p.bridge.subscribe((i) => {
      i.type === "messages/state" && V(i.payload.state);
    });
    function fe(i) {
      o.value = i, I.value = "", y.value = c(i), X();
    }
    function ne() {
      o.value = "", m++, M.value = "", y.value = c();
    }
    xe(() => (ne(), !0), () => !!o.value);
    async function Z(i) {
      if (!u.value) {
        u.value = !0, I.value = "";
        try {
          await i();
        } catch (t) {
          A && (I.value = t instanceof Error && t.message !== "host_request_timeout" ? t.message : "等待操作结果超时，请核实保存状态后重试。");
        } finally {
          u.value = !1;
        }
      }
    }
    function Le(i) {
      if (N.value || Q.value) return;
      const t = {
        contactId: o.value,
        messageId: `input:${ve()}`,
        payload: i,
        createdAt: Date.now()
      };
      U.value = t, j.value = null, D.delete(t.contactId), y.value = {
        ...y.value,
        hasNewer: !1
      }, X(!1, !0), E.value?.sent(), pe(t.contactId, t.messageId, t);
    }
    async function pe(i, t, v) {
      if (!u.value) {
        u.value = !0, j.value = null, I.value = "";
        try {
          if (te.value && (V(await q("messages/confirm")), te.value))
            return;
          const z = v?.payload.type === "image" ? {
            type: "image",
            description: v.payload.description,
            upload: { ...v.payload.upload }
          } : v ? {
            type: "text",
            text: v.payload.text
          } : void 0;
          V(v ? await q("messages/send", {
            contactId: i,
            actionId: t.slice(6),
            payload: z
          }) : await q("messages/retry", {
            contactId: i,
            messageId: t
          }));
        } catch (z) {
          A && (j.value = {
            contactId: i,
            messageId: t,
            message: z instanceof Error && z.message !== "host_request_timeout" ? z.message : "尚未确认发送结果，可以重试。"
          });
        } finally {
          u.value = !1;
        }
      }
    }
    function Pe(i) {
      const t = Q.value?.messageId === i ? Q.value : void 0;
      pe(o.value, i, t);
    }
    function Ue(i) {
      Z(async () => {
        V(await q("messages/discard-send", { messageId: i })), U.value?.messageId === i && (U.value = null), j.value = null, await X();
      });
    }
    function qe(i) {
      Z(async () => V(await q(i)));
    }
    function Ve(i) {
      Z(async () => {
        V(await q("messages/settings", { settings: i })), G();
      });
    }
    function Ne() {
      Z(async () => {
        V(await q("messages/sync")), G();
      });
    }
    function ee(i) {
      b.value = i, I.value = "", g.value = "", d.value = H.value?.note ?? "", k.value = "", F.value = ve(), B.value = !0, C.value = s.value.revision, i === "add" && ke();
    }
    async function ke() {
      const i = F.value, t = () => A && B.value && b.value === "add" && F.value === i;
      L.value = "loading";
      try {
        const v = await q("messages/refresh");
        if (!t()) return;
        V(v), L.value = "ready";
      } catch {
        t() && (L.value = "failed");
      }
    }
    function G() {
      B.value = !1;
    }
    function Fe() {
      u.value || (b.value === "delete" ? b.value = "detail" : b.value === "recover" ? b.value = "sync" : G());
    }
    function $e(i = g.value) {
      !i.trim() || N.value || L.value === "loading" || Z(async () => {
        const t = await q("messages/contact/add", {
          actionId: F.value,
          name: i.trim(),
          note: d.value.trim()
        });
        V(t.state), G(), fe(t.contactId);
      });
    }
    function Ge() {
      Z(async () => {
        V(await q("messages/contact/note", {
          contactId: o.value,
          note: d.value
        })), G();
      });
    }
    function ze() {
      Z(async () => {
        V(await q("messages/contact/delete", {
          contactId: o.value,
          revision: C.value
        })), G(), ne();
      });
    }
    function He(i) {
      $.value = i, ee("delete-message"), C.value = y.value.revision;
    }
    function Ze() {
      const i = o.value, t = $.value;
      Z(async () => {
        V(await q("messages/message/delete", {
          contactId: i,
          messageId: t,
          revision: C.value
        })), await X(), G();
      });
    }
    function Ke(i) {
      const t = {
        contactId: o.value,
        messageId: i,
        revision: y.value.revision
      };
      Z(async () => {
        V(await q("messages/regenerate", t));
      });
    }
    function Oe() {
      Z(async () => {
        V(await q("messages/recover")), G();
      });
    }
    function je() {
      Z(async () => {
        V(await q("messages/adopt-server-state")), s.value.fileState === "ready" && !s.value.pendingSave ? (U.value = null, j.value = null, G()) : I.value = "暂时未能采用服务器版本，请检查网络后重试。当前记录保持不变。";
      });
    }
    return ge(() => {
      A = !1, m++, Re();
    }), (i, t) => (l(), n("main", Es, [
      te.value ? (l(), n("div", Ds, [e("span", null, f(s.value.fileState === "conflict" ? "服务器上的存档已有变化，请选择如何处理。" : "有消息还在等待保存确认，已保存的记录不会丢失。"), 1), e("div", Ts, [e("button", {
        disabled: u.value || !!s.value.busy,
        onClick: t[0] || (t[0] = (v) => qe("messages/confirm"))
      }, "检查保存", 8, Rs), s.value.fileState === "conflict" ? (l(), n("button", {
        key: 0,
        disabled: u.value || !!s.value.busy || s.value.generationActive,
        onClick: t[1] || (t[1] = (v) => ee("adopt"))
      }, "采用服务器版本", 8, Ls)) : h("", !0)])])) : s.value.unsynced && !s.value.busy ? (l(), n("div", Ps, [e("span", null, f(s.value.unsynced) + " 条消息已保留，尚未写入主聊天。", 1), e("button", {
        disabled: N.value,
        onClick: t[2] || (t[2] = (v) => ee("sync"))
      }, "查看", 8, Us)])) : h("", !0),
      s.value.generationActive ? (l(), n("div", qs, "故事正在继续，稍后就能发送消息。")) : h("", !0),
      I.value || s.value.error ? (l(), n("p", Vs, f(I.value || s.value.error), 1)) : h("", !0),
      M.value ? (l(), n("div", Ns, [e("span", null, f(M.value), 1), e("button", {
        disabled: r.value,
        onClick: t[3] || (t[3] = (v) => X())
      }, "重试读取", 8, Fs)])) : h("", !0),
      H.value ? (l(), ae(Bs, {
        key: H.value.id,
        ref_key: "conversation",
        ref: E,
        draft: ye.value,
        "onUpdate:draft": t[4] || (t[4] = (v) => ye.value = v),
        "context-state": s.value,
        contact: H.value,
        page: y.value,
        bridge: a.bridge,
        "chat-identity": s.value.chatIdentity,
        disabled: N.value,
        "send-disabled": N.value || !!Q.value,
        busy: s.value.busy,
        outgoing: De.value,
        "send-failure": s.value.sendFailure,
        "send-error": j.value,
        working: u.value,
        "pending-save": te.value,
        "retry-disabled": u.value || !!s.value.busy || s.value.generationActive || s.value.fileState === "conflict",
        loading: r.value,
        "load-more": () => X(!0),
        media: s.value.media,
        "waiting-for": Te.value,
        onBack: ne,
        onDetails: t[5] || (t[5] = (v) => ee("detail")),
        onSend: Le,
        onRetry: Pe,
        onDiscard: Ue,
        onDeleteMessage: He,
        onRegenerate: Ke,
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
      ])) : h("", !0),
      Y(x($a, {
        contacts: s.value.contacts,
        "busy-contact-id": s.value.busy?.contactId ?? "",
        drafts: D,
        onSelect: fe,
        onAdd: t[7] || (t[7] = (v) => ee("add")),
        onSettings: t[8] || (t[8] = (v) => ee("settings"))
      }, null, 8, [
        "contacts",
        "busy-contact-id",
        "drafts"
      ]), [[ea, !H.value]]),
      B.value ? (l(), ae(Ee, {
        key: 6,
        class: "messages-dialog",
        "aria-labelledby": "messages-dialog-title",
        busy: u.value,
        onClose: Fe
      }, {
        default: Ae(() => [
          e("header", null, [
            b.value === "detail" && H.value ? (l(), ae(ue, {
              key: 0,
              identity: H.value.id,
              name: H.value.name,
              small: ""
            }, null, 8, ["identity", "name"])) : h("", !0),
            e("h2", Gs, f(b.value === "settings" ? "信息设置" : b.value === "add" ? "新的对话" : b.value === "detail" ? H.value?.name : b.value === "delete" ? "删除联系人？" : b.value === "delete-message" ? "删除这条消息？" : b.value === "sync" ? "消息还未写入主聊天" : b.value === "adopt" ? "采用服务器版本？" : "在当前位置补记？"), 1),
            e("button", {
              class: "messages-icon-button",
              "aria-label": "关闭",
              disabled: u.value,
              onClick: G
            }, [x(P, { name: "close" })], 8, zs)
          ]),
          I.value ? (l(), n("p", Hs, f(I.value), 1)) : h("", !0),
          b.value === "settings" ? (l(), ae(Ia, {
            key: 1,
            settings: s.value.settings,
            busy: u.value || !!s.value.busy,
            onSave: Ve
          }, null, 8, ["settings", "busy"])) : b.value === "add" ? (l(), n(R, { key: 2 }, [
            e("label", Zs, [x(P, { name: "search" }), Y(e("input", {
              "onUpdate:modelValue": t[9] || (t[9] = (v) => k.value = v),
              placeholder: "查找已知人物",
              "aria-label": "查找已知人物",
              "aria-describedby": "messages-people-source"
            }, null, 512), [[se, k.value]])]),
            t[21] || (t[21] = e("div", {
              id: "messages-people-source",
              class: "messages-subtle messages-people-source"
            }, "候选来自当前聊天的总结人物资料，需开启总结；未列出的人可手动添加。", -1)),
            e("div", {
              class: "messages-known-list",
              "aria-busy": L.value === "loading"
            }, [L.value === "loading" ? (l(), n("p", Os, "正在读取已知人物…")) : L.value === "failed" ? (l(), n("div", js, [t[17] || (t[17] = e("p", {
              class: "messages-subtle",
              role: "alert"
            }, "已知人物暂时无法读取，可以重试或手动添加。", -1)), e("button", {
              class: "messages-secondary",
              disabled: u.value,
              onClick: ke
            }, "重新读取", 8, Ys)])) : (l(), n(R, { key: 2 }, [(l(!0), n(R, null, oe(be.value, (v) => (l(), n("button", {
              key: v.name,
              disabled: N.value,
              onClick: (z) => $e(v.name)
            }, [
              x(ue, {
                identity: v.name,
                name: v.name,
                small: ""
              }, null, 8, ["identity", "name"]),
              e("span", null, [_(f(v.name), 1), v.aliases.length ? (l(), n("small", Js, f(v.aliases.join("、")), 1)) : h("", !0)]),
              x(P, { name: "plus" })
            ], 8, Xs))), 128)), be.value.length ? h("", !0) : (l(), n("p", Qs, f(k.value ? "没有匹配的人物，可以在下面手动添加。" : "暂无可添加的已知人物，可以在下面手动添加。"), 1))], 64))], 8, Ks),
            e("details", Ws, [t[20] || (t[20] = e("summary", null, "想联系的人不在这里？", -1)), e("form", { onSubmit: t[12] || (t[12] = le((v) => $e(), ["prevent"])) }, [
              e("label", null, [t[18] || (t[18] = _("姓名", -1)), Y(e("input", {
                "onUpdate:modelValue": t[10] || (t[10] = (v) => g.value = v),
                maxlength: "120",
                required: "",
                placeholder: "对方的姓名"
              }, null, 512), [[se, g.value]])]),
              e("label", null, [t[19] || (t[19] = _("身份说明（可选）", -1)), Y(e("textarea", {
                "onUpdate:modelValue": t[11] || (t[11] = (v) => d.value = v),
                maxlength: "600",
                rows: "2",
                placeholder: "例如：住在隔壁的花店老板"
              }, null, 512), [[se, d.value]])]),
              e("button", {
                class: "messages-primary",
                disabled: N.value || L.value === "loading" || !g.value.trim()
              }, "添加并聊天", 8, _s)
            ], 32)])
          ], 64)) : b.value === "detail" ? (l(), n("form", {
            key: 3,
            onSubmit: le(Ge, ["prevent"])
          }, [
            e("label", null, [t[22] || (t[22] = _("身份说明 / 备注", -1)), Y(e("textarea", {
              "onUpdate:modelValue": t[13] || (t[13] = (v) => d.value = v),
              maxlength: "600",
              rows: "3",
              placeholder: "帮助辨认这位联系人"
            }, null, 512), [[se, d.value]])]),
            e("button", {
              class: "messages-primary",
              disabled: N.value
            }, "保存备注", 8, et),
            e("button", {
              type: "button",
              class: "messages-danger",
              disabled: N.value,
              onClick: t[14] || (t[14] = (v) => b.value = "delete")
            }, "删除联系人与通讯记录", 8, at)
          ], 32)) : b.value === "delete" ? (l(), n(R, { key: 4 }, [
            S.value ? (l(), n("p", st, f(S.value), 1)) : (l(), n("p", tt, "删除与 " + f(H.value?.name) + " 的全部通讯和摘要，同时更新主聊天记录。其他联系人和图库文件保留，删除后不能恢复。", 1)),
            e("button", {
              class: "messages-danger",
              disabled: N.value || !!S.value,
              onClick: ze
            }, "确认删除", 8, lt),
            e("button", {
              class: "messages-secondary",
              onClick: t[15] || (t[15] = (v) => b.value = "detail")
            }, "保留联系人")
          ], 64)) : b.value === "delete-message" ? (l(), n(R, { key: 5 }, [
            S.value ? (l(), n("p", nt, f(S.value), 1)) : (l(), n("p", it, "删除这条消息，同时更新主聊天记录。后续回复、其他消息和图库文件保留，删除后不能恢复。")),
            e("button", {
              class: "messages-danger",
              disabled: N.value || !!S.value,
              onClick: Ze
            }, "确认删除", 8, ut),
            e("button", {
              class: "messages-secondary",
              onClick: G
            }, "取消")
          ], 64)) : b.value === "sync" ? (l(), n(R, { key: 6 }, [
            t[25] || (t[25] = e("p", null, "信息 APP 已保留这些消息。重试只会补上主聊天里的记录，不会再次向对方发送，也不会重新生成回复。", -1)),
            e("button", {
              class: "messages-primary",
              disabled: N.value,
              onClick: Ne
            }, "重试写入", 8, ot),
            e("details", rt, [
              t[23] || (t[23] = e("summary", null, "原来的记录已被修改或删除？", -1)),
              t[24] || (t[24] = e("p", null, "不会覆盖你的修改。需要这些消息继续进入剧情时，可以在当前位置另加一条补记。", -1)),
              e("button", {
                class: "messages-secondary",
                disabled: N.value,
                onClick: t[16] || (t[16] = (v) => b.value = "recover")
              }, "查看补记方式", 8, dt)
            ])
          ], 64)) : b.value === "adopt" ? (l(), n(R, { key: 7 }, [
            t[26] || (t[26] = e("p", null, "将读取服务器上的当前聊天小白 OS 存档，放弃本地尚未确认的修改。信息 APP 会显示服务器已保存的联系人和消息。", -1)),
            t[27] || (t[27] = e("p", { class: "messages-subtle" }, "这项选择作用于当前聊天的整份 OS 存档，不会删除主聊天里的记录，也不会重新生成回复。", -1)),
            e("button", {
              class: "messages-danger",
              disabled: u.value || !!s.value.busy || s.value.generationActive,
              onClick: je
            }, "确认采用服务器版本", 8, vt),
            e("button", {
              class: "messages-secondary",
              disabled: u.value,
              onClick: G
            }, "暂不处理", 8, gt)
          ], 64)) : (l(), n(R, { key: 8 }, [
            t[28] || (t[28] = e("p", null, "先检查已有记录；仍未写入的消息会在主聊天当前位置标为「补录」，保留原发送时间。不会覆盖旧记录或恢复你删除的那一条。", -1)),
            e("button", {
              class: "messages-primary",
              disabled: N.value,
              onClick: Oe
            }, "确认补记", 8, mt),
            e("button", {
              class: "messages-secondary",
              onClick: G
            }, "暂不补记")
          ], 64))
        ]),
        _: 1
      }, 8, ["busy"])) : h("", !0)
    ]));
  }
}), $t = ct;
export {
  $t as default
};
