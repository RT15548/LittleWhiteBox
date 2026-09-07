/* eslint-disable */
import { D as K, H as S, I as G, J as w, K as z, T as J, V as L, W as q, b as T, f as U, g as b, h as A, i as P, j as H, k as g, l as Y, m as j, o as M, p as e, u as F, v as V, w as Z, y as Q, z as x } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { n as _, r as X } from "./xiaobai-os-app-navigation-D5qZ5Ulq.js";
var ee = ["src"], te = {
  key: 1,
  class: "fourth-wall-avatar is-placeholder",
  "aria-hidden": "true"
}, ae = { class: "fourth-wall-message-stack" }, se = {
  key: 0,
  class: "fourth-wall-thinking"
}, le = { class: "fourth-wall-bubble" }, ie = {
  key: 0,
  class: "fourth-wall-message-text"
}, ne = {
  key: 1,
  class: "fourth-wall-image-card"
}, re = ["src", "alt"], oe = ["onClick"], ue = { key: 2 }, de = { key: 3 }, ve = ["onClick"], me = { "aria-hidden": "true" }, ge = { key: 0 }, fe = { class: "fourth-wall-message-actions" }, be = { key: 1 }, ye = /* @__PURE__ */ T({
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
    bridge: {}
  },
  emits: ["edit", "delete"],
  setup(i, { emit: k }) {
    const o = i, c = k, v = S(!1);
    _(() => (v.value = !1, !0), () => v.value);
    const h = S(""), a = L({}), f = /* @__PURE__ */ new Set();
    let r = () => {
    };
    function y(m) {
      const n = /\[(?:img|图片)\s*:\s*([^\]]+)\]|\[(?:voice|语音)\s*:([^:\]]*):([^\]]+)\]|\[(?:voice|语音)\s*:\s*([^\]]+)\]/gi, u = [];
      let s = 0, t;
      for (; (t = n.exec(m)) !== null; )
        t.index > s && u.push({
          kind: "text",
          raw: m.slice(s, t.index),
          value: m.slice(s, t.index)
        }), t[1] !== void 0 ? u.push({
          kind: "image",
          raw: t[0],
          value: t[1].trim()
        }) : u.push({
          kind: "voice",
          raw: t[0],
          value: String(t[3] ?? t[4] ?? "").trim(),
          emotion: String(t[2] || "").trim().toLowerCase()
        }), s = n.lastIndex;
      return s < m.length && u.push({
        kind: "text",
        raw: m.slice(s),
        value: m.slice(s)
      }), u.length ? u : [{
        kind: "text",
        raw: m,
        value: m
      }];
    }
    const l = U(() => y(o.message.content)), d = U(() => o.message.ts ? new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(o.message.ts) : "");
    function $(m, n) {
      return `fw-${m}-${Date.now()}-${o.messageIndex}-${n}-${Math.random().toString(36).slice(2, 7)}`;
    }
    function I(m) {
      return m.result;
    }
    function E(m, n) {
      return f.has(n) && a[m]?.requestId === n;
    }
    async function C(m, n) {
      if (a[n]?.status === "loading" || a[n]?.status === "ready") return;
      if (!o.imageAvailable) {
        a[n] = {
          status: "unavailable",
          message: "画图能力未启用"
        };
        return;
      }
      const u = $("image", n);
      f.add(u), a[n] = {
        status: "loading",
        message: "查询图片缓存",
        requestId: u
      };
      const s = {
        chatIdentity: o.chatIdentity,
        sessionId: o.sessionId
      };
      try {
        const t = I(await o.bridge.request("fourth-wall/image-check", {
          ...s,
          tags: m.value,
          mediaRequestId: u
        }, 3e4));
        if (!E(n, u)) return;
        if (!t.available) {
          a[n] = {
            status: "unavailable",
            message: "画图能力未启用",
            requestId: u
          };
          return;
        }
        let p = t.cached || "";
        if (!p) {
          a[n] = {
            status: "loading",
            message: "正在生成图片",
            requestId: u
          };
          const W = I(await o.bridge.request("fourth-wall/image-generate", {
            ...s,
            tags: m.value,
            mediaRequestId: u
          }, 18e4));
          if (!E(n, u)) return;
          p = W.base64;
        }
        a[n] = {
          status: "ready",
          source: /^(?:data:|blob:|https?:)/i.test(p) ? p : `data:image/png;base64,${p}`
        };
      } catch (t) {
        E(n, u) && (a[n] = {
          status: "error",
          message: t instanceof Error ? t.message : String(t),
          requestId: u
        });
      } finally {
        f.delete(u);
      }
    }
    async function B(m, n) {
      if (!o.voiceAvailable) {
        a[n] = {
          status: "unavailable",
          message: "TTS 能力未启用"
        };
        return;
      }
      const u = a[n];
      if (u?.status === "loading") return;
      if (u?.status === "playing" && u.requestId) {
        o.bridge.post("fourth-wall/voice-stop", {
          chatIdentity: o.chatIdentity,
          mediaRequestId: u.requestId
        }), a[n] = { status: "idle" };
        return;
      }
      const s = $("voice", n);
      f.add(s), a[n] = {
        status: "loading",
        message: "正在准备语音",
        requestId: s
      };
      try {
        await o.bridge.request("fourth-wall/voice-play", {
          chatIdentity: o.chatIdentity,
          sessionId: o.sessionId,
          mediaRequestId: s,
          text: m.value,
          emotion: m.emotion
        });
      } catch (t) {
        E(n, s) && (a[n] = {
          status: "error",
          message: t instanceof Error ? t.message : String(t),
          requestId: s
        }), f.delete(s);
      }
    }
    function O() {
      h.value = o.message.content, v.value = !0;
    }
    function D() {
      const m = h.value.trim();
      m && (c("edit", o.messageIndex, m), v.value = !1);
    }
    function N() {
      f.forEach((m) => {
        o.bridge.post("fourth-wall/image-cancel", {
          chatIdentity: o.chatIdentity,
          mediaRequestId: m
        }), o.bridge.post("fourth-wall/voice-stop", {
          chatIdentity: o.chatIdentity,
          mediaRequestId: m
        });
      }), f.clear();
    }
    function R() {
      l.value.forEach((m, n) => {
        m.kind === "image" && C(m, n);
      });
    }
    return K(() => {
      r = o.bridge.subscribe((m) => {
        if (m.type === "fourth-wall/image-progress") {
          const n = m.payload, u = Object.keys(a).map(Number).find((s) => a[s]?.requestId === n.mediaRequestId);
          u !== void 0 && (a[u].message = n.status === "queued" ? `图片队列第 ${n.position || 1} 位` : "正在生成图片");
        }
        if (m.type === "fourth-wall/voice-state") {
          const n = m.payload, u = Object.keys(a).map(Number).find((s) => a[s]?.requestId === n.requestId);
          if (u === void 0) return;
          n.state === "playing" && (a[u].status = "playing"), (n.state === "ended" || n.state === "stopped") && (f.delete(String(n.requestId || "")), a[u] = { status: "idle" }), n.state === "error" && (f.delete(String(n.requestId || "")), a[u] = {
            status: "error",
            message: n.message || "语音播放失败"
          });
        }
      }), R();
    }), G(() => o.message.content, () => {
      N(), Object.keys(a).forEach((m) => delete a[Number(m)]), R();
    }), J(() => {
      r(), N();
    }), (m, n) => (g(), b("article", { class: z(["fourth-wall-message", i.message.role === "user" ? "is-user" : "is-ai"]) }, [(i.message.role === "user" ? i.userAvatar : i.characterAvatar) ? (g(), b("img", {
      key: 0,
      class: "fourth-wall-avatar",
      src: i.message.role === "user" ? i.userAvatar : i.characterAvatar,
      alt: ""
    }, null, 8, ee)) : (g(), b("span", te)), e("div", ae, [
      i.message.thinking ? (g(), b("details", se, [n[3] || (n[3] = e("summary", null, "思考过程", -1)), e("div", null, w(i.message.thinking), 1)])) : A("", !0),
      e("div", le, [v.value ? x((g(), b("textarea", {
        key: 0,
        "onUpdate:modelValue": n[0] || (n[0] = (u) => h.value = u),
        class: "fourth-wall-edit",
        rows: "3"
      }, null, 512)), [[M, h.value]]) : (g(!0), b(F, { key: 1 }, H(l.value, (u, s) => (g(), b(F, { key: `${u.kind}-${s}` }, [u.kind === "text" ? (g(), b("span", ie, w(u.value), 1)) : u.kind === "image" ? (g(), b("figure", ne, [a[s]?.status === "ready" ? (g(), b("img", {
        key: 0,
        src: a[s].source,
        alt: u.value
      }, null, 8, re)) : a[s]?.status === "error" ? (g(), b("button", {
        key: 1,
        type: "button",
        onClick: (t) => C(u, s)
      }, [V(w(u.raw), 1), e("small", null, w(a[s].message) + "，点此重试", 1)], 8, oe)) : a[s]?.status === "unavailable" ? (g(), b("div", ue, [V(w(u.raw), 1), e("small", null, w(a[s].message), 1)])) : (g(), b("div", de, [V(w(u.raw), 1), e("small", null, w(a[s]?.message || "准备图片"), 1)]))])) : (g(), b("button", {
        key: 2,
        class: "fourth-wall-voice",
        type: "button",
        onClick: (t) => B(u, s)
      }, [
        e("span", me, w(a[s]?.status === "playing" ? "■" : "▶"), 1),
        e("span", null, w(u.value), 1),
        a[s]?.message ? (g(), b("small", ge, w(a[s].message), 1)) : A("", !0)
      ], 8, ve))], 64))), 128)), e("div", fe, [v.value ? (g(), b(F, { key: 0 }, [e("button", {
        type: "button",
        onClick: D
      }, "保存"), e("button", {
        type: "button",
        onClick: n[1] || (n[1] = (u) => v.value = !1)
      }, "取消")], 64)) : (g(), b(F, { key: 1 }, [e("button", {
        type: "button",
        onClick: O
      }, "编辑"), e("button", {
        type: "button",
        onClick: n[2] || (n[2] = (u) => c("delete", i.messageIndex))
      }, "删除")], 64))])]),
      d.value ? (g(), b("time", be, w(d.value), 1)) : A("", !0)
    ])], 2));
  }
}), pe = ye, ce = {
  key: 1,
  class: "fourth-wall-empty"
}, he = {
  key: 2,
  class: "fourth-wall-message is-ai is-streaming"
}, we = ["src"], ke = {
  key: 1,
  class: "fourth-wall-avatar is-placeholder"
}, Ie = { class: "fourth-wall-message-stack" }, $e = {
  key: 0,
  class: "fourth-wall-thinking",
  open: ""
}, Ce = { class: "fourth-wall-bubble" }, Se = {
  key: 0,
  class: "fourth-wall-unsaved"
}, xe = /* @__PURE__ */ T({
  __name: "FourthWallConversation",
  props: {
    history: {},
    sessionId: {},
    chatIdentity: {},
    userAvatar: {},
    characterAvatar: {},
    imageAvailable: { type: Boolean },
    voiceAvailable: { type: Boolean },
    generation: {},
    bridge: {}
  },
  emits: ["edit", "delete"],
  setup(i) {
    const k = i, o = S(null), c = S(40), v = U(() => Math.max(0, k.history.length - c.value)), h = U(() => k.history.slice(v.value));
    function a() {
      c.value = Math.min(k.history.length, c.value + 40);
    }
    return G(() => k.sessionId, () => {
      c.value = 40;
    }), G(() => [k.history.length, k.generation.text], async () => {
      await Z(), o.value && (o.value.scrollTop = o.value.scrollHeight);
    }, { immediate: !0 }), (f, r) => (g(), b("section", {
      ref_key: "viewport",
      ref: o,
      class: "fourth-wall-conversation",
      "aria-live": "polite"
    }, [
      v.value > 0 ? (g(), b("button", {
        key: 0,
        type: "button",
        class: "fourth-wall-earlier",
        onClick: a
      }, " 显示更早的 " + w(v.value) + " 条记录 ", 1)) : A("", !0),
      i.history.length === 0 && i.generation.status === "idle" ? (g(), b("div", ce, [...r[2] || (r[2] = [
        e("span", null, "IV", -1),
        e("strong", null, "越过故事边界", -1),
        e("p", null, "这里是你与角色扮演者的皮下私聊。", -1)
      ])])) : A("", !0),
      (g(!0), b(F, null, H(h.value, (y, l) => (g(), j(pe, {
        key: `${y.ts}-${v.value + l}`,
        message: y,
        "message-index": v.value + l,
        "chat-identity": i.chatIdentity,
        "session-id": i.sessionId,
        "user-avatar": i.userAvatar,
        "character-avatar": i.characterAvatar,
        "image-available": i.imageAvailable,
        "voice-available": i.voiceAvailable,
        bridge: i.bridge,
        onEdit: r[0] || (r[0] = (d, $) => f.$emit("edit", d, $)),
        onDelete: r[1] || (r[1] = (d) => f.$emit("delete", d))
      }, null, 8, [
        "message",
        "message-index",
        "chat-identity",
        "session-id",
        "user-avatar",
        "character-avatar",
        "image-available",
        "voice-available",
        "bridge"
      ]))), 128)),
      i.generation.status !== "idle" ? (g(), b("article", he, [i.characterAvatar ? (g(), b("img", {
        key: 0,
        class: "fourth-wall-avatar",
        src: i.characterAvatar,
        alt: ""
      }, null, 8, we)) : (g(), b("span", ke)), e("div", Ie, [i.generation.thinking ? (g(), b("details", $e, [r[3] || (r[3] = e("summary", null, "思考中", -1)), e("div", null, w(i.generation.thinking), 1)])) : A("", !0), e("div", Ce, [V(w(i.generation.text || (i.generation.status === "error" ? i.generation.message : "等待回应...")) + " ", 1), i.generation.unsaved ? (g(), b("small", Se, "未保存")) : A("", !0)])])])) : A("", !0)
    ], 512));
  }
}), Ae = xe, Ve = {
  class: "fourth-wall-modal",
  role: "dialog",
  "aria-label": "四次元壁提示词"
}, qe = { class: "fourth-wall-prompt-fields" }, Me = /* @__PURE__ */ T({
  __name: "FourthWallPromptEditor",
  props: { templates: {} },
  emits: [
    "close",
    "save",
    "restore"
  ],
  setup(i, { emit: k }) {
    const o = i, c = k, v = L(structuredClone(q(o.templates))), h = S(null);
    X(h, () => c("close"));
    function a() {
      c("save", structuredClone(q(v)));
    }
    return (f, r) => (g(), b("div", {
      ref_key: "layer",
      ref: h,
      class: "fourth-wall-modal-backdrop",
      onClick: r[6] || (r[6] = Y((y) => c("close"), ["self"]))
    }, [e("section", Ve, [
      e("header", null, [r[7] || (r[7] = e("strong", null, "提示词模板", -1)), e("button", {
        type: "button",
        onClick: r[0] || (r[0] = (y) => c("close"))
      }, "关闭")]),
      e("div", qe, [
        e("label", null, [r[8] || (r[8] = V("Top User", -1)), x(e("textarea", {
          "onUpdate:modelValue": r[1] || (r[1] = (y) => v.topuser = y),
          rows: "5"
        }, null, 512), [[M, v.topuser]])]),
        e("label", null, [r[9] || (r[9] = V("Confirm", -1)), x(e("textarea", {
          "onUpdate:modelValue": r[2] || (r[2] = (y) => v.confirm = y),
          rows: "3"
        }, null, 512), [[M, v.confirm]])]),
        e("label", null, [r[10] || (r[10] = V("Meta Protocol", -1)), x(e("textarea", {
          "onUpdate:modelValue": r[3] || (r[3] = (y) => v.metaProtocol = y),
          rows: "12"
        }, null, 512), [[M, v.metaProtocol]])]),
        e("label", null, [r[11] || (r[11] = V("Bottom", -1)), x(e("textarea", {
          "onUpdate:modelValue": r[4] || (r[4] = (y) => v.bottom = y),
          rows: "5"
        }, null, 512), [[M, v.bottom]])])
      ]),
      e("footer", null, [e("button", {
        type: "button",
        class: "is-danger",
        onClick: r[5] || (r[5] = (y) => c("restore"))
      }, "恢复默认"), e("button", {
        type: "button",
        class: "is-primary",
        onClick: a
      }, "保存")])
    ])], 512));
  }
}), Ee = Me, Fe = { class: "fourth-wall-settings-section" }, Ue = { class: "fourth-wall-session-row" }, Te = ["value", "disabled"], We = ["value"], Pe = ["disabled"], Be = ["disabled"], De = ["disabled"], Ne = /* @__PURE__ */ T({
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
  setup(i, { emit: k }) {
    const o = k;
    function c() {
      const a = window.prompt("新记录名称", "新记录")?.trim();
      a && o("add", a);
    }
    function v(a, f) {
      const r = window.prompt("重命名记录", f)?.trim();
      r && o("rename", a, r);
    }
    function h(a) {
      window.confirm("确定删除当前记录吗？") && o("delete", a);
    }
    return (a, f) => (g(), b("section", Fe, [f[3] || (f[3] = e("h3", null, "聊天记录", -1)), e("div", Ue, [
      e("select", {
        value: i.activeSessionId,
        disabled: i.disabled,
        onChange: f[0] || (f[0] = (r) => o("switch", r.target.value))
      }, [(g(!0), b(F, null, H(i.sessions, (r) => (g(), b("option", {
        key: r.id,
        value: r.id
      }, w(r.name), 9, We))), 128))], 40, Te),
      e("button", {
        type: "button",
        disabled: i.disabled,
        title: "新建记录",
        onClick: c
      }, "＋", 8, Pe),
      e("button", {
        type: "button",
        disabled: i.disabled,
        title: "重命名记录",
        onClick: f[1] || (f[1] = (r) => v(i.activeSessionId, i.sessions.find((y) => y.id === i.activeSessionId)?.name || ""))
      }, " 改 ", 8, Be),
      e("button", {
        type: "button",
        disabled: i.disabled || i.sessions.length <= 1,
        title: "删除记录",
        class: "is-danger",
        onClick: f[2] || (f[2] = (r) => h(i.activeSessionId))
      }, " 删 ", 8, De)
    ])]));
  }
}), Re = Ne, Le = { class: "fourth-wall-settings-scroll" }, Oe = { class: "fourth-wall-settings-section" }, Ge = { class: "is-toggle" }, je = { class: "is-toggle" }, He = ["disabled"], Ke = { class: "fourth-wall-settings-section" }, ze = { class: "is-toggle" }, Je = { class: "is-toggle" }, Qe = { class: "is-toggle" }, Xe = { key: 0 }, Ye = ["disabled"], Ze = { class: "fourth-wall-settings-section is-actions" }, _e = /* @__PURE__ */ T({
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
  setup(i, { emit: k }) {
    const o = i, c = k, v = L(structuredClone(q(o.chat.settings))), h = S(null);
    X(h, () => c("close"));
    const a = L(structuredClone(q(o.global)));
    function f() {
      c("updateChat", structuredClone(q(v)));
    }
    function r() {
      c("updateGlobal", {
        image: structuredClone(q(a.image)),
        voice: structuredClone(q(a.voice)),
        commentary: structuredClone(q(a.commentary))
      });
    }
    return (y, l) => (g(), b("aside", {
      ref_key: "layer",
      ref: h,
      class: "fourth-wall-settings",
      "aria-label": "四次元壁设置"
    }, [e("header", null, [l[14] || (l[14] = e("strong", null, "四次元壁设置", -1)), e("button", {
      type: "button",
      onClick: l[0] || (l[0] = (d) => c("close"))
    }, "关闭")]), e("div", Le, [
      Q(Re, {
        sessions: i.chat.sessions,
        "active-session-id": i.chat.activeSessionId,
        disabled: i.busy,
        onSwitch: l[1] || (l[1] = (d) => c("switchSession", d)),
        onAdd: l[2] || (l[2] = (d) => c("addSession", d)),
        onRename: l[3] || (l[3] = (d, $) => c("renameSession", d, $)),
        onDelete: l[4] || (l[4] = (d) => c("deleteSession", d))
      }, null, 8, [
        "sessions",
        "active-session-id",
        "disabled"
      ]),
      e("section", Oe, [
        l[19] || (l[19] = e("h3", null, "上下文", -1)),
        e("label", null, [l[15] || (l[15] = V("普通聊天层数", -1)), x(e("input", {
          "onUpdate:modelValue": l[5] || (l[5] = (d) => v.maxChatLayers = d),
          type: "number",
          min: "1",
          max: "9999"
        }, null, 512), [[
          M,
          v.maxChatLayers,
          void 0,
          { number: !0 }
        ]])]),
        e("label", null, [l[16] || (l[16] = V("皮下聊天轮数", -1)), x(e("input", {
          "onUpdate:modelValue": l[6] || (l[6] = (d) => v.maxMetaTurns = d),
          type: "number",
          min: "1",
          max: "9999"
        }, null, 512), [[
          M,
          v.maxMetaTurns,
          void 0,
          { number: !0 }
        ]])]),
        e("label", Ge, [l[17] || (l[17] = e("span", null, "流式生成", -1)), x(e("input", {
          "onUpdate:modelValue": l[7] || (l[7] = (d) => v.stream = d),
          type: "checkbox"
        }, null, 512), [[P, v.stream]])]),
        e("label", je, [l[18] || (l[18] = e("span", null, "禁用 Assistant Prefill", -1)), x(e("input", {
          "onUpdate:modelValue": l[8] || (l[8] = (d) => v.disableAssistantPrefill = d),
          type: "checkbox"
        }, null, 512), [[P, v.disableAssistantPrefill]])]),
        e("button", {
          type: "button",
          class: "is-primary",
          disabled: i.busy,
          onClick: f
        }, "保存上下文设置", 8, He)
      ]),
      e("section", Ke, [
        l[23] || (l[23] = e("h3", null, "能力", -1)),
        e("label", ze, [l[20] || (l[20] = e("span", null, "在提示词中允许图片", -1)), x(e("input", {
          "onUpdate:modelValue": l[9] || (l[9] = (d) => a.image.enablePrompt = d),
          type: "checkbox"
        }, null, 512), [[P, a.image.enablePrompt]])]),
        e("label", Je, [l[21] || (l[21] = e("span", null, "在提示词中允许语音", -1)), x(e("input", {
          "onUpdate:modelValue": l[10] || (l[10] = (d) => a.voice.enabled = d),
          type: "checkbox"
        }, null, 512), [[P, a.voice.enabled]])]),
        e("label", Qe, [l[22] || (l[22] = e("span", null, "实时吐槽", -1)), x(e("input", {
          "onUpdate:modelValue": l[11] || (l[11] = (d) => a.commentary.enabled = d),
          type: "checkbox"
        }, null, 512), [[P, a.commentary.enabled]])]),
        a.commentary.enabled ? (g(), b("label", Xe, [V(" 吐槽概率 " + w(a.commentary.probability) + "% ", 1), x(e("input", {
          "onUpdate:modelValue": l[12] || (l[12] = (d) => a.commentary.probability = d),
          type: "range",
          min: "1",
          max: "99"
        }, null, 512), [[
          M,
          a.commentary.probability,
          void 0,
          { number: !0 }
        ]])])) : A("", !0),
        e("button", {
          type: "button",
          class: "is-primary",
          disabled: i.busy,
          onClick: r
        }, "保存能力设置", 8, Ye)
      ]),
      e("section", Ze, [e("button", {
        type: "button",
        onClick: l[13] || (l[13] = (d) => c("openPrompts"))
      }, "提示词模板")])
    ])], 512));
  }
}), et = _e, tt = { class: "fourth-wall-app" }, at = { class: "fourth-wall-header" }, st = { class: "fourth-wall-heading" }, lt = { class: "fourth-wall-header-actions" }, it = ["disabled"], nt = ["disabled"], rt = {
  key: 0,
  class: "fourth-wall-error",
  role: "alert"
}, ot = { class: "fourth-wall-composer" }, ut = ["disabled"], dt = ["disabled"], vt = 35e3, mt = /* @__PURE__ */ T({
  __name: "FourthWallApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(i) {
    const k = i, o = S(structuredClone(q(k.initialState))), c = S(""), v = S(!1), h = S(!1), a = S(!1), f = S(""), r = S(!1), y = S({
      status: "idle",
      sessionId: "",
      text: "",
      thinking: "",
      message: "",
      unsaved: !1
    });
    let l = () => {
    };
    const d = U(() => o.value.chat.sessions.find((s) => s.id === o.value.chat.activeSessionId)), $ = U(() => y.value.status === "started" || y.value.status === "progress");
    function I(s = d.value.id) {
      return {
        chatIdentity: o.value.chatIdentity,
        sessionId: s
      };
    }
    function E(s) {
      return structuredClone(s.result);
    }
    async function C(s, t) {
      a.value = !0, f.value = "";
      try {
        o.value = E(await k.bridge.request(s, t, vt));
      } catch (p) {
        f.value = p instanceof Error ? p.message : String(p);
      } finally {
        a.value = !1;
      }
    }
    async function B() {
      const s = c.value.trim();
      !s || $.value || a.value || (c.value = "", y.value = {
        status: "started",
        sessionId: d.value.id,
        text: "",
        thinking: "",
        message: "",
        unsaved: !1
      }, await C("fourth-wall/send", {
        ...I(),
        content: s
      }), f.value && (y.value.status = "idle"));
    }
    async function O() {
      $.value || a.value || (y.value = {
        status: "started",
        sessionId: d.value.id,
        text: "",
        thinking: "",
        message: "",
        unsaved: !1
      }, await C("fourth-wall/regenerate", I()), f.value && (y.value.status = "idle"));
    }
    function D() {
      k.bridge.post("fourth-wall/cancel", I());
    }
    function N(s) {
      s.key !== "Enter" || s.shiftKey || r.value || (s.preventDefault(), $.value ? D() : B());
    }
    function R(s) {
      window.confirm("确定删除这条消息吗？") && C("fourth-wall/delete-message", {
        ...I(),
        messageIndex: s
      });
    }
    function m() {
      window.confirm("确定清空当前记录吗？") && C("fourth-wall/clear-history", I());
    }
    function n(s) {
      C("fourth-wall/update-chat-settings", {
        ...I(),
        patch: s
      });
    }
    function u(s) {
      C("fourth-wall/update-global-settings", {
        ...I(),
        patch: s
      });
    }
    return K(() => {
      l = k.bridge.subscribe((s) => {
        if (s.type === "fourth-wall/state" && (o.value = structuredClone(s.payload.state)), s.type !== "fourth-wall/generation") return;
        const t = s.payload;
        if (!(t.sessionId && t.sessionId !== d.value.id)) {
          if (t.status === "complete" || t.status === "cancelled") {
            y.value = {
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
            f.value = t.message || "生成失败", y.value = t.kind === "save" && (t.draft?.text || t.draft?.thinking) ? {
              status: "error",
              sessionId: t.sessionId || d.value.id,
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
          y.value = {
            status: t.status || "progress",
            sessionId: t.sessionId || d.value.id,
            text: t.text || y.value.text,
            thinking: t.thinking || y.value.thinking,
            message: "",
            unsaved: !1
          };
        }
      });
    }), J(() => l()), (s, t) => (g(), b("main", tt, [
      e("header", at, [e("div", st, [t[17] || (t[17] = e("span", null, "IV", -1)), e("div", null, [t[16] || (t[16] = e("strong", null, "四次元壁", -1)), e("small", null, w(d.value.name), 1)])]), e("div", lt, [
        e("button", {
          type: "button",
          title: "重答",
          disabled: a.value || $.value,
          onClick: O
        }, "↻", 8, it),
        e("button", {
          type: "button",
          title: "清空当前记录",
          "aria-label": "清空当前记录",
          disabled: a.value,
          onClick: m
        }, [...t[18] || (t[18] = [e("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [e("path", { d: "M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" })], -1)])], 8, nt),
        e("button", {
          type: "button",
          title: "设置",
          onClick: t[0] || (t[0] = (p) => v.value = !0)
        }, "⚙")
      ])]),
      f.value ? (g(), b("div", rt, [e("span", null, w(f.value), 1), e("button", {
        type: "button",
        onClick: t[1] || (t[1] = (p) => f.value = "")
      }, "×")])) : A("", !0),
      Q(Ae, {
        history: d.value.history,
        "session-id": d.value.id,
        "chat-identity": o.value.chatIdentity,
        "user-avatar": o.value.userAvatar,
        "character-avatar": o.value.characterAvatar,
        "image-available": o.value.capabilities.image.available,
        "voice-available": o.value.capabilities.voice.available,
        generation: y.value,
        bridge: i.bridge,
        onEdit: t[2] || (t[2] = (p, W) => C("fourth-wall/edit-message", {
          ...I(),
          messageIndex: p,
          content: W
        })),
        onDelete: R
      }, null, 8, [
        "history",
        "session-id",
        "chat-identity",
        "user-avatar",
        "character-avatar",
        "image-available",
        "voice-available",
        "generation",
        "bridge"
      ]),
      e("footer", ot, [x(e("textarea", {
        "onUpdate:modelValue": t[3] || (t[3] = (p) => c.value = p),
        rows: "1",
        placeholder: "聊点什么...",
        disabled: a.value,
        onCompositionstart: t[4] || (t[4] = (p) => r.value = !0),
        onCompositionend: t[5] || (t[5] = (p) => r.value = !1),
        onKeydown: N
      }, null, 40, ut), [[M, c.value]]), e("button", {
        type: "button",
        class: z({ "is-stop": $.value }),
        disabled: a.value,
        onClick: t[6] || (t[6] = (p) => $.value ? D() : B())
      }, w($.value ? "■" : "↑"), 11, dt)]),
      v.value ? (g(), j(et, {
        key: 1,
        chat: o.value.chat,
        global: o.value.global,
        busy: a.value || $.value,
        onClose: t[7] || (t[7] = (p) => v.value = !1),
        onUpdateChat: n,
        onUpdateGlobal: u,
        onSwitchSession: t[8] || (t[8] = (p) => C("fourth-wall/switch-session", {
          ...I(),
          targetSessionId: p
        })),
        onAddSession: t[9] || (t[9] = (p) => C("fourth-wall/add-session", {
          ...I(),
          name: p
        })),
        onRenameSession: t[10] || (t[10] = (p, W) => C("fourth-wall/rename-session", {
          ...I(p),
          name: W
        })),
        onDeleteSession: t[11] || (t[11] = (p) => C("fourth-wall/delete-session", I(p))),
        onOpenPrompts: t[12] || (t[12] = (p) => h.value = !0)
      }, null, 8, [
        "chat",
        "global",
        "busy"
      ])) : A("", !0),
      h.value ? (g(), j(Ee, {
        key: 2,
        templates: o.value.global.promptTemplates,
        onClose: t[13] || (t[13] = (p) => h.value = !1),
        onSave: t[14] || (t[14] = (p) => {
          u({ promptTemplates: p }), h.value = !1;
        }),
        onRestore: t[15] || (t[15] = () => {
          C("fourth-wall/restore-prompts", I()), h.value = !1;
        })
      }, null, 8, ["templates"])) : A("", !0)
    ]));
  }
}), bt = mt;
export {
  bt as default
};
