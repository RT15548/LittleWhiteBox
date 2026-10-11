/* eslint-disable */
import { t as qe } from "./xiaobai-os-message-markdown-C9E8FiNZ.js";
import { $ as $e, D as se, E as ge, M as de, P as me, Q as we, R as Ce, S as o, T as ue, U as ie, V as s, X as F, at as ve, b as J, d as Ae, dt as De, ft as r, h as H, i as Ne, lt as t, m as ce, ot as ke, p as oe, r as ze, rt as b, ut as te, v as N, x as g, y as n } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as Le } from "./xiaobai-os-descriptor-DmDuv1pM.js";
import { t as Ve } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { t as xe } from "./xiaobai-os-AppDialog-B4VpOkFC.js";
import { r as Ue, t as je } from "./xiaobai-os-composer-keyboard-COt-GHsA.js";
import { t as ye } from "./xiaobai-os-MessageMarkdown-_hWt2Lpl.js";
import { t as ne } from "./xiaobai-os-conversation-window-DzAyxmj6.js";
var Q = Object.freeze({
  inputBudget: 158e3,
  summaryTrigger: 128e3,
  imageTokens: 6e3,
  pageSize: 20,
  textBlock: 4e3,
  maxInputChars: 16e3,
  streamInterval: 100,
  maxImageBytes: 4 * 1024 * 1024,
  maxToolRounds: 32,
  evidenceChars: 1e6,
  chatReadFloors: 20,
  chatSearchMatches: 20,
  chatQueryChars: 200
}), _e = Object.freeze([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
]);
function Fe() {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (l) => l.toString(16).padStart(2, "0")).join("");
}
var a = Object.freeze({
  webSearch: "搜索网页",
  webFetch: "读取网页",
  title: Le.name,
  context: "上下文用量",
  clear: "清空聊天",
  clearTitle: "清空管理员聊天？",
  clearWarning: "聊天和附件会被删除，已完成的管理修改不会撤销。",
  cancel: "取消",
  delete: "删除",
  regenerate: "重新生成",
  send: "发送",
  stop: "停止",
  attach: "选择图片",
  removeImage: "移除图片",
  placeholder: "说说需要处理的事…",
  latest: "回到最新",
  earlier: "更早记录",
  later: "后面记录",
  confirm: "重新提交",
  check: "检查保存结果",
  close: "关闭",
  empty: "有什么需要处理？",
  details: "查看过程",
  moreText: "展开更多",
  process: (l) => `工作经过 · ${l} 轮`,
  processLoading: "加载经过",
  queued: "等待执行",
  notExecuted: "未执行",
  evidence: "查看资料",
  inspect: "检查 OS 状态",
  loadTools: "加载工具",
  toolsLoaded: "工具已就绪",
  itemReport: (l, u) => `成功 ${l} 项，未完成 ${u} 项`,
  messageActions: "消息操作",
  messagePages: "展开消息",
  noReply: "尚未回复",
  longReply: "回复结束后可展开完整内容。",
  copy: "复制",
  copied: "已复制",
  edit: "编辑",
  save: "保存",
  saving: "保存中…",
  editMessage: "编辑消息",
  loadingText: "读取完整消息…",
  retry: "重试",
  adopt: "放弃未保存内容",
  budget: "应用输入预算",
  estimated: "估算用量",
  budgetNote: "应用工作预算，不代表模型实际窗口。",
  contextParts: {
    history: "聊天与摘要",
    rules: "规则与资料",
    tools: "工具说明",
    images: "图片预留",
    runtime: "本轮工具结果"
  },
  phases: {
    preparing: "准备中",
    waiting: "等待响应",
    thinking: "思考中",
    replying: "回复中",
    tools: "调用工具中",
    summarizing: "整理上下文",
    saving: "保存中",
    stopping: "正在停止"
  },
  elapsed: (l) => `已用 ${l} 秒`,
  operations: {
    preparing: "准备参数",
    reading: "读取中",
    saving: "保存中",
    read: "已读取",
    saved: "已保存",
    unchanged: "无需修改",
    partial: "部分完成",
    failed: "未完成",
    unconfirmed: "保存待确认"
  },
  invalidImage: "请选择不超过 4MB、可打开的 PNG、JPG、WEBP 或 GIF 图片。",
  imageModel: "图片会发给当前模型，需要模型支持看图。",
  imageRequest: "请查看这张图片。",
  stopped: "已停止；已保存的修改仍然生效。",
  deleteWarning: "只删除这条消息，不撤销已经完成的管理修改。",
  noEvidence: "这份资料的临时查阅入口已失效。已返回给管理员的内容仍保留在会话历史中，需要更多原文时可以重新查阅。",
  corrupted: "管理员记录损坏。可以清空管理员聊天；其他 APP 数据不受影响。",
  unsaved: "保存尚未确认。可检查结果、重新提交，或放弃未保存内容；已保存的修改不会撤销。"
}), We = Object.freeze({
  administrator_stopped: a.stopped,
  administrator_busy: "当前操作尚未结束，请先等待或停止。",
  administrator_context_changed: "聊天已切换，旧操作已停止。",
  administrator_environment_unavailable: "OS 状态读取失败，未能确认当前运行情况。",
  administrator_chat_unavailable: "请先进入一个酒馆聊天。",
  administrator_message_missing: "这条消息已不存在，请刷新记录。",
  administrator_history_conflict: "管理员记录已被其他操作更新，请重新打开核对，不会覆盖现有记录。",
  administrator_input_invalid: `请输入内容或选择图片，文字最多 ${Q.maxInputChars} 字符。`,
  administrator_copy_failed: "复制失败，请检查浏览器剪贴板权限后重试。",
  administrator_invalid_image: a.invalidImage,
  administrator_image_missing: "附件读取失败，原消息与附件引用仍然保留，请重试。",
  administrator_image_delete_failed: "记录已保存，但附件删除失败，请再次确认清理。",
  administrator_image_list_failed: "附件目录读取失败，请再次确认清理。",
  administrator_save_pending: a.unsaved,
  administrator_save_failed: "保存失败。可检查结果、重新提交，或放弃未保存内容。",
  administrator_save_unconfirmed: a.unsaved,
  administrator_save_conflict: "服务器记录已更新，未覆盖它。可放弃本地未保存内容，保留服务器记录。",
  administrator_context_full: "本轮资料已超出应用输入预算，请缩小查阅范围后再继续。",
  administrator_summary_failed: "上下文整理失败，原记录未删除，可以重试。",
  administrator_model_refused: "模型没有接受本次请求，原消息和附件仍然保留。",
  administrator_empty_response: "模型未返回回复，可以重试。",
  administrator_tool_round_limit: "本轮已达到工具调用上限，请缩小任务范围。",
  administrator_tool_batch_too_large: "模型一次请求了过多工具，未执行这批操作。",
  administrator_evidence_expired: a.noEvidence,
  management_request_superseded: "记录已被后续修改取代。请说明当前希望怎样处理，不会恢复旧状态。",
  management_source_changed: "所依据的原文已经改变，需要重新查证。"
});
function K(l) {
  const u = l instanceof Error ? l.message : String(l);
  return We[u] ?? u.slice(0, 700);
}
var Ke = [
  "aria-label",
  "title",
  "aria-expanded"
], He = {
  key: 0,
  class: "admin-popover"
}, Ge = ["aria-label"], Ye = { class: "admin-context-total" }, Qe = /* @__PURE__ */ se({
  __name: "AdministratorContext",
  props: {
    usage: {},
    draftTokens: {}
  },
  setup(l) {
    const u = l, e = b(!1), m = N(() => u.usage.used + u.draftTokens), d = (v) => `${(v / 1e3).toFixed(1)}k`;
    return ze(() => (e.value = !1, !0), () => e.value), (v, w) => (s(), o("div", {
      class: "admin-context",
      onKeydown: w[2] || (w[2] = oe(ce((k) => e.value = !1, ["stop"]), ["esc"]))
    }, [n("button", {
      type: "button",
      class: te(["admin-context-ring", { "is-warning": m.value >= l.usage.trigger }]),
      style: De({ "--context-fill": `${Math.min(1, m.value / l.usage.limit) * 360}deg` }),
      "aria-label": t(a).context,
      title: t(a).context,
      "aria-expanded": e.value,
      onClick: w[0] || (w[0] = (k) => e.value = !e.value)
    }, [...w[3] || (w[3] = [n("span", null, null, -1)])], 14, Ke), e.value ? (s(), o("section", He, [
      n("header", null, [n("strong", null, r(t(a).context), 1), n("button", {
        type: "button",
        "aria-label": t(a).close,
        onClick: w[1] || (w[1] = (k) => e.value = !1)
      }, "×", 8, Ge)]),
      n("p", Ye, r(d(m.value)) + " / " + r(d(l.usage.limit)), 1),
      n("dl", null, [(s(!0), o(H, null, ie(t(a).contextParts, (k, h) => (s(), o(H, { key: h }, [n("dt", null, r(k), 1), n("dd", null, r(d(l.usage[h] + (h === "history" ? l.draftTokens : 0))), 1)], 64))), 128))]),
      n("small", null, r(t(a).budgetNote), 1)
    ])) : g("", !0)], 32));
  }
}), Je = Qe, Xe = ["aria-expanded"], Ze = {
  key: 1,
  class: "admin-process-body"
}, et = { key: 0 }, tt = {
  key: 0,
  class: "admin-muted"
}, at = {
  key: 1,
  class: "admin-error",
  role: "status"
}, lt = /* @__PURE__ */ se({
  __name: "AdministratorProcess",
  props: {
    row: {},
    live: {},
    unsaved: {},
    bridge: {},
    chatIdentity: {}
  },
  setup(l) {
    const u = l, e = b(!1), m = ve([]), d = b(!1), v = b(""), w = N(() => u.live?.process ?? m.value), k = N(() => u.live?.process.length ?? u.unsaved?.length ?? u.row.processCount), h = N(() => !!u.live || e.value);
    let T = 0;
    async function O() {
      const S = ++T;
      if (v.value = "", d.value = !1, !h.value || u.live || !k.value) {
        m.value = [];
        return;
      }
      if (u.unsaved) {
        m.value = u.unsaved;
        return;
      }
      const { turnId: I, revision: x } = u.row, _ = u.chatIdentity, L = () => S === T && _ === u.chatIdentity && I === u.row.turnId && x === u.row.revision;
      d.value = !0;
      try {
        const C = await u.bridge.request("administrator/process", {
          chatIdentity: _,
          turnId: I,
          revision: x
        });
        L() && (m.value = C.result);
      } catch (C) {
        L() && (v.value = K(C));
      } finally {
        L() && (d.value = !1);
      }
    }
    return F([
      () => u.chatIdentity,
      () => u.row.id,
      () => u.row.revision,
      () => !!u.live,
      () => u.unsaved,
      e
    ], (S, I) => {
      (S[0] !== I[0] || S[1] !== I[1] || S[3] !== I[3]) && (e.value = !1), O();
    }, { immediate: !0 }), me(() => {
      T++;
    }), (S, I) => k.value ? (s(), o("section", {
      key: 0,
      class: te(["admin-process", { "is-running": !!l.live }])
    }, [l.live ? g("", !0) : (s(), o("button", {
      key: 0,
      type: "button",
      class: "admin-process-toggle",
      "aria-expanded": h.value,
      onClick: I[0] || (I[0] = (x) => e.value = !e.value)
    }, [I[1] || (I[1] = n("svg", {
      viewBox: "0 0 16 16",
      "aria-hidden": "true"
    }, [n("path", { d: "m6 4 4 4-4 4" })], -1)), ue(r(t(a).process(k.value)), 1)], 8, Xe)), h.value ? (s(), o("div", Ze, [
      (s(!0), o(H, null, ie(w.value, (x) => (s(), o("div", {
        key: x.index,
        class: "admin-process-round"
      }, [x.text ? (s(), J(ye, {
        key: 0,
        class: "admin-markdown admin-process-narration",
        text: x.text
      }, null, 8, ["text"])) : g("", !0), (s(!0), o(H, null, ie(x.tools, (_) => (s(), o("div", {
        key: _.id,
        class: "admin-operation-line"
      }, [
        n("i", { class: te(["admin-operation-dot", `is-${_.status}`]) }, null, 2),
        n("span", null, [ue(r(_.name), 1), _.target ? (s(), o("small", et, " · " + r(_.target), 1)) : g("", !0)]),
        n("small", null, r(_.status === "queued" ? t(a).queued : _.status === "not-executed" ? t(a).notExecuted : t(a).operations[_.status]), 1)
      ]))), 128))]))), 128)),
      d.value ? (s(), o("span", tt, r(t(a).processLoading), 1)) : g("", !0),
      v.value ? (s(), o("p", at, [ue(r(v.value), 1), n("button", {
        type: "button",
        onClick: O
      }, r(t(a).check), 1)])) : g("", !0)
    ])) : g("", !0)], 2)) : g("", !0);
  }
}), nt = lt, it = ["data-phase"], st = {
  role: "status",
  "aria-live": "polite"
}, rt = ["datetime"], ut = /* @__PURE__ */ se({
  __name: "AdministratorStatus",
  props: {
    phase: {},
    startedAt: {}
  },
  setup(l) {
    const u = l, e = b(Date.now()), m = N(() => Math.max(0, Math.floor((e.value - (u.startedAt ?? e.value)) / 1e3)));
    return F(() => u.startedAt, (d, v, w) => {
      if (e.value = Date.now(), d === void 0) return;
      const k = setInterval(() => {
        e.value = Date.now();
      }, 1e3);
      w(() => clearInterval(k));
    }, { immediate: !0 }), (d, v) => (s(), o("div", {
      class: "admin-live-status",
      "data-phase": l.phase
    }, [
      v[0] || (v[0] = n("span", {
        class: "admin-working-dot",
        "aria-hidden": "true"
      }, null, -1)),
      n("span", st, r(t(a).phases[l.phase]), 1),
      l.startedAt !== void 0 ? (s(), o("time", {
        key: 0,
        datetime: `PT${m.value}S`
      }, r(t(a).elapsed(m.value)), 9, rt)) : g("", !0)
    ], 8, it));
  }
}), Te = /* @__PURE__ */ Ve(ut, [["__scopeId", "data-v-8eac51f2"]]);
async function Ie(l, u) {
  let e = u.text;
  const { turnId: m, role: d, revision: v, totalChars: w } = u.row;
  for (; e.length < Math.min(u.through, w); ) {
    const k = await l.request("administrator/text", {
      chatIdentity: u.chatIdentity,
      turnId: m,
      role: d,
      revision: v,
      offset: e.length
    });
    if (!u.current()) throw new Error("administrator_context_changed");
    e += k.result.text;
  }
  return e;
}
var ot = ["data-row-id"], dt = ["aria-label"], vt = ["src", "alt"], ct = [
  "maxlength",
  "aria-label",
  "disabled"
], mt = { class: "admin-message-actions" }, ft = ["disabled"], gt = ["disabled"], yt = ["aria-label"], pt = ["src", "alt"], bt = {
  key: 2,
  class: "admin-muted"
}, ht = {
  key: 0,
  class: "admin-muted"
}, wt = ["aria-label"], kt = ["disabled"], xt = {
  key: 5,
  class: "admin-error",
  role: "status"
}, _t = {
  key: 6,
  class: "admin-error",
  role: "status"
}, It = ["aria-label"], $t = ["disabled"], Ct = ["disabled"], At = ["disabled"], Tt = ["disabled"], Mt = {
  key: 8,
  class: "admin-muted",
  role: "status"
}, Rt = /* @__PURE__ */ se({
  __name: "AdministratorMessage",
  props: {
    row: {},
    live: { default: null },
    unsavedProcess: { default: null },
    bridge: {},
    chatIdentity: {},
    disabled: { type: Boolean },
    saveEdit: {}
  },
  emits: [
    "delete",
    "regenerate",
    "details"
  ],
  setup(l, { emit: u }) {
    const e = l, m = u, d = b(!1), v = b(e.row.text), w = b(!1), k = b(""), h = b(null), T = b(!1), O = b(!1), S = b(!1), I = b(""), x = b(null), _ = b(!1), L = b(null);
    let C = 0, q = 0, M = v.value.length;
    const A = N(() => e.live ? e.live.text : v.value), R = N(() => e.unsavedProcess?.length ?? e.row.processCount);
    function W(E) {
      E.target.closest("a, button, input, textarea, select") || (E instanceof KeyboardEvent && E.preventDefault(), d.value = !d.value);
    }
    F(() => [
      e.chatIdentity,
      e.row.id,
      e.row.revision
    ], (E, $) => {
      q++, w.value = !1, k.value = "", (E[0] !== $[0] || E[1] !== $[1]) && (M = e.row.text.length, x.value = null, d.value = !1), M <= e.row.text.length ? v.value = e.row.text : ee(M, !0);
    }), F([
      d,
      () => e.chatIdentity,
      () => e.row.id,
      () => e.row.revision,
      () => !!e.live
    ], () => {
      X();
    }), F(h, (E) => {
      x.value && x.value.row.revision !== e.row.revision && E === x.value.text.trim() && (x.value = null, I.value = "");
    }), me(() => {
      q++, C++;
    });
    async function X() {
      const E = ++C;
      if (h.value = null, T.value = !1, S.value = !1, x.value || (I.value = ""), !d.value || e.live) return;
      const $ = e.row, P = e.chatIdentity, c = () => E === C;
      T.value = !0;
      try {
        const p = await Ie(e.bridge, {
          row: $,
          chatIdentity: P,
          text: $.text,
          through: $.totalChars,
          current: c
        });
        c() && (h.value = p);
      } catch (p) {
        c() && (I.value = K(p));
      } finally {
        c() && (T.value = !1);
      }
    }
    async function G() {
      if (h.value === null || O.value) return;
      const E = C, $ = document.activeElement;
      O.value = !0, S.value = !1, I.value = "";
      try {
        if (!await qe(h.value)) throw new Error("administrator_copy_failed");
        E === C && (S.value = !0);
      } catch (P) {
        E === C && (I.value = K(P));
      } finally {
        O.value = !1, $ instanceof HTMLElement && $.isConnected && document.activeElement === document.body && $.focus({ preventScroll: !0 });
      }
    }
    async function Z() {
      e.disabled || h.value === null || (x.value = {
        row: { ...e.row },
        text: h.value
      }, I.value = "", await de(), L.value?.focus());
    }
    async function re() {
      const E = x.value;
      if (!(!E || e.disabled || _.value)) {
        _.value = !0, I.value = "";
        try {
          await e.saveEdit(E.row, E.text), x.value === E && (x.value = null);
        } catch ($) {
          x.value === E && (I.value = K($));
        } finally {
          _.value = !1;
        }
      }
    }
    async function ee(E, $ = !1) {
      if (w.value) return;
      M = Math.min(Math.max(M, E), e.row.totalChars);
      const P = ++q, { turnId: c, revision: p } = e.row, z = e.chatIdentity, D = () => P === q && z === e.chatIdentity && p === e.row.revision && c === e.row.turnId;
      w.value = !0, k.value = "";
      try {
        const V = await Ie(e.bridge, {
          chatIdentity: z,
          row: e.row,
          text: $ ? e.row.text : v.value,
          through: M,
          current: D
        });
        D() && (v.value = V);
      } catch (V) {
        D() && ($ && (v.value = e.row.text), k.value = K(V));
      } finally {
        D() && (w.value = !1);
      }
    }
    return (E, $) => (s(), o("article", {
      class: te(["admin-message", `is-${l.row.role}`]),
      "data-row-id": l.row.id
    }, [
      l.row.role === "assistant" ? (s(), J(nt, {
        key: 0,
        row: l.row,
        live: l.live,
        unsaved: l.unsavedProcess,
        bridge: l.bridge,
        "chat-identity": l.chatIdentity
      }, null, 8, [
        "row",
        "live",
        "unsaved",
        "bridge",
        "chat-identity"
      ])) : g("", !0),
      x.value ? (s(), o("form", {
        key: 1,
        class: "admin-message-editor",
        "aria-label": t(a).editMessage,
        onSubmit: ce(re, ["prevent"])
      }, [
        l.row.image ? (s(), o("img", {
          key: 0,
          src: l.row.image.path,
          alt: l.row.image.name,
          class: "admin-message-image"
        }, null, 8, vt)) : g("", !0),
        $e(n("textarea", {
          ref_key: "editor",
          ref: L,
          "onUpdate:modelValue": $[0] || ($[0] = (P) => x.value.text = P),
          rows: "3",
          maxlength: t(Q).maxInputChars,
          "aria-label": t(a).editMessage,
          enterkeyhint: "enter",
          disabled: _.value
        }, null, 8, ct), [[Ae, x.value.text]]),
        n("div", mt, [n("button", {
          type: "button",
          "data-action": "cancel-edit",
          disabled: _.value,
          onClick: $[1] || ($[1] = (P) => {
            x.value = null, I.value = "";
          })
        }, r(t(a).cancel), 9, ft), n("button", {
          type: "submit",
          "data-action": "save-edit",
          disabled: l.disabled || _.value || !x.value.text.trim() && !l.row.image
        }, r(_.value ? t(a).saving : t(a).save), 9, gt)])
      ], 40, dt)) : A.value || l.row.image || !l.live && !R.value ? (s(), o("div", {
        key: 2,
        class: "admin-bubble",
        tabindex: "0",
        role: "group",
        "aria-label": t(a).messageActions,
        onClick: W,
        onKeydown: [
          oe(W, ["enter"]),
          oe(W, ["space"]),
          $[2] || ($[2] = oe(ce((P) => d.value = !1, ["stop"]), ["esc"]))
        ]
      }, [
        l.row.image ? (s(), o("img", {
          key: 0,
          src: l.row.image.path,
          alt: l.row.image.name,
          loading: "lazy",
          class: "admin-message-image"
        }, null, 8, pt)) : g("", !0),
        A.value ? (s(), J(ye, {
          key: 1,
          class: "admin-markdown",
          text: A.value
        }, null, 8, ["text"])) : g("", !0),
        !A.value && !l.row.image ? (s(), o("span", bt, r(l.row.error || t(a).noReply), 1)) : g("", !0)
      ], 40, yt)) : g("", !0),
      l.live ? (s(), o(H, { key: 3 }, [
        (s(!0), o(H, null, ie(l.live.preview, (P) => (s(), o("div", {
          key: P.id,
          class: "admin-operation-line"
        }, [
          n("i", { class: te(["admin-operation-dot", `is-${P.status}`]) }, null, 2),
          n("span", null, r(P.name), 1),
          n("small", null, r(t(a).operations[P.status]), 1)
        ]))), 128)),
        l.live.totalChars > t(Q).textBlock ? (s(), o("small", ht, r(t(a).longReply), 1)) : g("", !0),
        ge(Te, {
          phase: l.live.phase,
          "started-at": l.live.startedAt
        }, null, 8, ["phase", "started-at"])
      ], 64)) : g("", !0),
      !l.live && !x.value && l.row.totalChars > v.value.length ? (s(), o("nav", {
        key: 4,
        class: "admin-pager",
        "aria-label": t(a).messagePages
      }, [n("button", {
        type: "button",
        disabled: w.value,
        onClick: $[3] || ($[3] = (P) => ee(v.value.length + t(Q).textBlock))
      }, r(t(a).moreText), 9, kt)], 8, wt)) : g("", !0),
      l.row.error || k.value ? (s(), o("p", xt, r(k.value || l.row.error), 1)) : g("", !0),
      I.value ? (s(), o("p", _t, [ue(r(I.value), 1), h.value === null && !T.value ? (s(), o("button", {
        key: 0,
        type: "button",
        onClick: X
      }, r(t(a).retry), 1)) : g("", !0)])) : g("", !0),
      !x.value && (d.value || !l.live && R.value && !A.value) ? (s(), o("nav", {
        key: 7,
        class: "admin-message-actions",
        "aria-label": t(a).messageActions
      }, [
        !l.live && l.row.totalChars ? (s(), o("button", {
          key: 0,
          type: "button",
          "data-action": "copy",
          disabled: h.value === null || O.value,
          onClick: G
        }, r(S.value ? t(a).copied : t(a).copy), 9, $t)) : g("", !0),
        l.row.role === "user" ? (s(), o("button", {
          key: 1,
          type: "button",
          "data-action": "edit",
          disabled: l.disabled || h.value === null,
          onClick: Z
        }, r(t(a).edit), 9, Ct)) : g("", !0),
        n("button", {
          type: "button",
          disabled: l.disabled,
          onClick: $[4] || ($[4] = (P) => m("delete", l.row))
        }, r(t(a).delete), 9, At),
        l.row.canRegenerate ? (s(), o("button", {
          key: 2,
          type: "button",
          "data-action": "regenerate",
          disabled: l.disabled,
          onClick: $[5] || ($[5] = (P) => m("regenerate", l.row))
        }, r(t(a).regenerate), 9, Tt)) : g("", !0),
        R.value ? (s(), o("button", {
          key: 3,
          type: "button",
          onClick: $[6] || ($[6] = (P) => m("details", l.row))
        }, r(t(a).evidence), 1)) : g("", !0)
      ], 8, It)) : g("", !0),
      T.value ? (s(), o("small", Mt, r(t(a).loadingText), 1)) : g("", !0)
    ], 10, ot));
  }
}), St = Rt, Et = [
  "role",
  "aria-modal",
  "aria-label",
  "onKeydown"
], Pt = ["aria-label"], Bt = { class: "admin-details-body" }, Ot = { class: "admin-evidence" }, qt = ["disabled"], Dt = { class: "admin-operations" }, Nt = { key: 0 }, zt = { class: "admin-muted" }, Lt = ["disabled", "onClick"], Vt = { class: "admin-pager" }, Ut = ["disabled"], jt = ["disabled"], Ft = {
  key: 2,
  class: "admin-error",
  role: "status"
}, Wt = /* @__PURE__ */ se({
  __name: "AdministratorDetails",
  props: {
    bridge: {},
    chatIdentity: {},
    turnId: {}
  },
  emits: ["close"],
  setup(l, { emit: u }) {
    const e = l, m = u, d = b([]), v = b(0), w = b(0), k = b(""), h = b(!1), T = b(null), O = b(""), S = b(null), I = b(!0);
    let x;
    function _() {
      de(() => S.value?.focus({ preventScroll: !0 }));
    }
    function L() {
      T.value ? (T.value = null, _()) : m("close");
    }
    Ne(S, L, () => I.value);
    async function C(M) {
      h.value = !0, k.value = "", T.value = null;
      try {
        const A = await e.bridge.request("administrator/operations", {
          chatIdentity: e.chatIdentity,
          turnId: e.turnId,
          offset: M
        });
        d.value = A.result.items, w.value = A.result.total, v.value = A.result.offset;
      } catch (A) {
        k.value = K(A);
      } finally {
        h.value = !1;
      }
    }
    async function q(M, A = 0) {
      h.value = !0, k.value = "";
      try {
        T.value = (await e.bridge.request("administrator/evidence", {
          chatIdentity: e.chatIdentity,
          reference: M,
          offset: A
        })).result, O.value = M, _();
      } catch (R) {
        k.value = K(R);
      } finally {
        h.value = !1;
      }
    }
    return Ce(() => {
      const M = S.value.closest(".administrator-app"), A = () => {
        I.value = getComputedStyle(M).getPropertyValue("--admin-details-docked").trim() !== "1";
      };
      A(), x = new ResizeObserver(A), x.observe(M), _(), C(0);
    }), me(() => x?.disconnect()), (M, A) => (s(), o("section", {
      ref_key: "layer",
      ref: S,
      class: "admin-details",
      role: I.value ? "dialog" : "region",
      "aria-modal": I.value ? !0 : void 0,
      tabindex: "-1",
      "aria-label": t(a).details,
      onKeydown: oe(ce(L, ["stop", "prevent"]), ["esc"])
    }, [n("header", null, [n("strong", null, r(t(a).details), 1), n("button", {
      type: "button",
      "aria-label": t(a).close,
      onClick: A[0] || (A[0] = (R) => m("close"))
    }, "×", 8, Pt)]), n("div", Bt, [T.value ? (s(), o(H, { key: 0 }, [
      n("button", {
        type: "button",
        class: "admin-text-button",
        onClick: L
      }, "‹ " + r(t(a).details), 1),
      n("pre", Ot, r(T.value.text), 1),
      T.value.nextOffset !== null ? (s(), o("button", {
        key: 0,
        type: "button",
        disabled: h.value,
        onClick: A[1] || (A[1] = (R) => q(O.value, T.value.nextOffset))
      }, r(t(a).moreText), 9, qt)) : g("", !0)
    ], 64)) : (s(), o(H, { key: 1 }, [n("ol", Dt, [(s(!0), o(H, null, ie(d.value, (R) => (s(), o("li", { key: R.id }, [
      n("div", null, [
        n("i", { class: te(["admin-operation-dot", `is-${R.status}`]) }, null, 2),
        n("strong", null, r(R.name), 1),
        n("span", null, r(t(a).operations[R.status]), 1),
        n("small", null, r((R.elapsedMs / 1e3).toFixed(1)) + "s", 1)
      ]),
      R.target ? (s(), o("p", Nt, r(R.target), 1)) : g("", !0),
      n("p", zt, r(R.summary), 1),
      n("button", {
        type: "button",
        class: "admin-text-button",
        disabled: h.value,
        onClick: (W) => q(R.id)
      }, r(t(a).evidence), 9, Lt)
    ]))), 128))]), n("nav", Vt, [n("button", {
      type: "button",
      disabled: !v.value || h.value,
      onClick: A[2] || (A[2] = (R) => C(Math.max(0, v.value - t(Q).pageSize)))
    }, r(t(a).earlier), 9, Ut), n("button", {
      type: "button",
      disabled: v.value + d.value.length >= w.value || h.value,
      onClick: A[3] || (A[3] = (R) => C(v.value + d.value.length))
    }, r(t(a).later), 9, jt)])], 64)), k.value ? (s(), o("p", Ft, r(k.value), 1)) : g("", !0)])], 40, Et));
  }
}), Kt = Wt;
function Ht(l) {
  const { state: u, pending: e, list: m } = l, d = ve(null), v = ve(u.value.page), w = b(!1), k = b(!0), h = b("");
  let T = 0, O = !1, S = null;
  const I = N(() => u.value.page.total + Number(e.value));
  function x(c) {
    const p = Math.min(c?.end ?? I.value, I.value);
    return {
      start: Math.max(0, Math.min(c?.start ?? p - ne.recent, p - 1)),
      end: p
    };
  }
  const _ = N(() => x(d.value)), L = N(() => v.value.rows.slice(Math.max(0, _.value.start - v.value.start), Math.max(0, _.value.end - v.value.start))), C = N(() => _.value.start > 0), q = N(() => _.value.end < I.value), M = N(() => q.value || _.value.end - _.value.start > ne.recent), A = N(() => e.value && _.value.end > u.value.page.total);
  function R(c = _.value) {
    const p = m.value;
    if (!p) return null;
    const z = new Set(v.value.rows.filter((B, j) => {
      const Y = v.value.start + j;
      return Y >= c.start && Y < c.end;
    }).map((B) => B.id)), D = p.getBoundingClientRect().top, V = [...p.querySelectorAll("[data-row-id]")].find((B) => z.has(B.dataset.rowId) && B.getBoundingClientRect().bottom > D);
    return V ? {
      id: V.dataset.rowId,
      offset: V.getBoundingClientRect().top - D
    } : null;
  }
  function W(c) {
    const p = m.value, z = p && [...p.querySelectorAll("[data-row-id]")].find((D) => D.dataset.rowId === c?.id);
    c && z && p && (p.scrollTop += z.getBoundingClientRect().top - p.getBoundingClientRect().top - c.offset);
  }
  function X(c) {
    c && !c.isConnected && m.value?.focus({ preventScroll: !0 });
  }
  async function G() {
    await de(), !d.value && !S && m.value && !O && (m.value.scrollTop = m.value.scrollHeight);
  }
  function Z() {
    T++, w.value = !1, O = !1, S = null, h.value = "";
    const c = m.value?.contains(document.activeElement) ? document.activeElement : null;
    d.value = null, k.value = !0, v.value = u.value.page, G().then(() => X(c));
  }
  function re() {
    const c = m.value;
    !c || O || (k.value = !q.value && c.scrollHeight - c.clientHeight - c.scrollTop < 32, k.value ? d.value && Z() : d.value = { ..._.value });
  }
  function ee(c, p) {
    return c.revision === u.value.page.revision && c.start <= p.start && c.start + c.rows.length >= Math.min(p.end, u.value.page.total);
  }
  async function E(c, p) {
    for (const B of [u.value.page, v.value]) if (ee(B, c)) return B;
    const z = u.value.page.revision, D = u.value.page.total, V = {
      start: c.start,
      rows: [],
      total: D,
      revision: z
    };
    for (let B = c.start; B < Math.min(c.end, D); B += Q.pageSize) {
      const j = await l.page(B, z);
      if (!p()) return null;
      V.rows.push(...j.rows.slice(0, Math.min(c.end, D) - B));
    }
    return V;
  }
  async function $() {
    const c = x(S ?? d.value), p = !!S, z = ++T, D = u.value.chatIdentity, V = u.value.page.revision, B = () => z === T && D === u.value.chatIdentity && V === u.value.page.revision;
    w.value = !0;
    try {
      const j = await E(c, B);
      if (!B() || !j) return;
      const Y = R(c), ae = m.value?.contains(document.activeElement) ? document.activeElement : null;
      if (O = !0, v.value = j, p && (d.value = c, k.value = !1), await de(), !B()) return;
      !d.value && m.value ? m.value.scrollTop = m.value.scrollHeight : W(Y), O = !1, X(ae);
    } catch (j) {
      B() && (h.value = K(j));
    } finally {
      B() && (w.value = !1, O = !1, S = null);
    }
  }
  function P(c) {
    if (w.value) return;
    h.value = "";
    const p = { ..._.value };
    return c === "older" ? (p.start = Math.max(0, p.start - ne.recent), p.end = Math.min(p.end, p.start + ne.maximum)) : (p.end = Math.min(I.value, p.end + ne.recent), p.start = Math.max(p.start, p.end - ne.maximum)), S = p, $();
  }
  return F(() => u.value.chatIdentity, Z, { flush: "sync" }), F([() => u.value.page, e], () => {
    $();
  }), F(() => u.value.live, () => {
    G();
  }), F(m, (c, p, z) => {
    if (!c) return;
    const D = new ResizeObserver(() => {
      G();
    });
    D.observe(c), z(() => D.disconnect()), G();
  }, { flush: "post" }), me(() => {
    T++, S = null;
  }), {
    rows: L,
    hasOlder: C,
    hasNewer: q,
    expanded: M,
    pendingVisible: A,
    paging: w,
    pageError: h,
    atBottom: k,
    resetLatest: Z,
    scrolled: re,
    older: () => P("older"),
    newer: () => P("newer")
  };
}
var Gt = { class: "admin-header" }, Yt = [
  "title",
  "aria-label",
  "disabled"
], Qt = {
  key: 0,
  class: "admin-notice",
  role: "alert"
}, Jt = ["disabled"], Xt = ["disabled"], Zt = {
  key: 1,
  class: "admin-empty"
}, ea = ["aria-busy"], ta = { class: "admin-bubble" }, aa = ["src", "alt"], la = {
  key: 3,
  class: "admin-live"
}, na = ["disabled"], ia = {
  key: 2,
  class: "admin-notice",
  role: "status"
}, sa = ["disabled"], ra = ["disabled"], ua = ["disabled"], oa = {
  key: 3,
  class: "admin-attachment"
}, da = ["src", "alt"], va = ["aria-label", "disabled"], ca = ["accept"], ma = [
  "disabled",
  "aria-label",
  "title"
], fa = [
  "maxlength",
  "placeholder",
  "aria-label",
  "disabled"
], ga = [
  "disabled",
  "aria-label",
  "title"
], ya = [
  "disabled",
  "aria-label",
  "title"
], pa = { class: "admin-dialog-actions" }, ba = ["disabled"], ha = { class: "admin-dialog-actions" }, wa = ["disabled"], ka = /* @__PURE__ */ se({
  __name: "AdministratorApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(l) {
    const u = l, e = ve(structuredClone(ke(u.initialState))), m = b(""), d = b(null), v = b(""), w = b(""), k = b(!1), h = b(null), T = b(null), O = b(null), S = b(null), I = b(null), x = b(!1), _ = b(0);
    let L = 0;
    const C = ve(null);
    let q = 0;
    F([m, d], () => {
      L++;
    }, { flush: "sync" });
    const M = N(() => !!w.value || !!e.value.live), A = N(() => e.value.live?.phase ?? (["send", "regenerate"].includes(w.value) ? "preparing" : null)), R = N(() => M.value || e.value.unsaved || e.value.corrupted), { rows: W, hasOlder: X, hasNewer: G, expanded: Z, pendingVisible: re, paging: ee, pageError: E, atBottom: $, resetLatest: P, scrolled: c, older: p, newer: z } = Ht({
      state: e,
      pending: N(() => !!C.value),
      list: O,
      page: (f, i) => Y("page", {
        start: f,
        revision: i
      })
    }), D = N(() => W.value.some((f) => f.role === "assistant" && f.turnId === e.value.live?.turnId));
    let V = () => {
    }, B;
    const j = () => ({ chatIdentity: e.value.chatIdentity });
    async function Y(f, i = {}) {
      return (await u.bridge.request(`administrator/${f}`, {
        ...j(),
        ...i
      }, 6e4)).result;
    }
    function ae(f) {
      const i = e.value;
      if (!(i.chatIdentity === f.chatIdentity && f.page.revision < i.page.revision)) {
        if (e.value = f, i.chatIdentity !== f.chatIdentity) {
          q++, w.value = "", v.value = "", m.value = "", d.value = null, T.value = null, C.value = null;
          return;
        }
        C.value && f.submission?.id === C.value.id && f.submission.accepted && (C.value = null);
      }
    }
    function Me() {
      const f = C.value;
      f && f.revision === L && (m.value = f.text, d.value = f.image), C.value = null;
    }
    function pe(f) {
      f === q && (w.value = "", !e.value.unsaved && !e.value.live && Me());
    }
    function Re() {
      P(), de(() => O.value?.focus({ preventScroll: !0 }));
    }
    async function be() {
      if (R.value || !m.value.trim() && !d.value) return;
      const f = {
        id: Fe(),
        revision: 0,
        text: m.value,
        image: d.value && ke(d.value)
      };
      m.value = "", d.value = null, f.revision = L, C.value = f, w.value = "send", v.value = "", P();
      const i = ++q;
      try {
        const y = await Y("send", {
          submissionId: f.id,
          text: f.text,
          ...f.image ? { image: f.image } : {}
        });
        i === q && ae(y.state);
      } catch (y) {
        i === q && (v.value = K(y));
      } finally {
        pe(i);
      }
    }
    async function le(f, i = {}) {
      if (M.value) return;
      w.value = f, v.value = "", (f === "regenerate" || f === "confirm") && P();
      const y = ++q;
      try {
        const U = await Y(f, i);
        if (y !== q) return;
        ae(U), k.value = !1, h.value = null, f === "clear" && (m.value = "", d.value = null, C.value = null, T.value = null, P());
      } catch (U) {
        y === q && (v.value = K(U));
      } finally {
        pe(y);
      }
    }
    async function Se(f, i) {
      if (R.value) throw new Error("administrator_busy");
      w.value = "edit", v.value = "";
      try {
        ae(await Y("edit", {
          turnId: f.turnId,
          revision: f.revision,
          text: i
        }));
      } finally {
        w.value = "";
      }
    }
    async function Ee(f) {
      const i = f.target, y = i.files?.[0];
      if (i.value = "", !!y) {
        if (v.value = "", y.size > Q.maxImageBytes || !_e.includes(y.type)) {
          v.value = a.invalidImage;
          return;
        }
        try {
          const U = await new Promise((Be, Oe) => {
            const fe = new FileReader();
            fe.onload = () => Be(String(fe.result)), fe.onerror = () => Oe(new Error(a.invalidImage)), fe.readAsDataURL(y);
          }), he = new Image();
          he.src = U, await he.decode(), d.value = {
            name: y.name.slice(0, 120),
            dataUrl: U
          }, I.value?.focus();
        } catch {
          v.value = a.invalidImage;
        }
      }
    }
    function Pe(f) {
      je(f, x.value) && (f.preventDefault(), M.value || be());
    }
    return F([m, d], () => {
      B && clearTimeout(B), B = setTimeout(() => {
        _.value = Ue(m.value) + (d.value ? Q.imageTokens : 0);
      }, 160);
    }), Ce(() => {
      V = u.bridge.subscribe((f) => {
        f.type === "administrator/state" && ae(f.payload.state), f.type === "administrator/live" && (e.value = {
          ...e.value,
          ...f.payload
        });
      });
    }), me(() => {
      q++, V(), B && clearTimeout(B);
    }), (f, i) => (s(), o("div", { class: te(["administrator-app", { "has-details": !!T.value }]) }, [
      n("header", Gt, [
        n("h1", null, r(t(a).title), 1),
        ge(Je, {
          usage: e.value.context,
          "draft-tokens": e.value.live ? 0 : _.value
        }, null, 8, ["usage", "draft-tokens"]),
        n("button", {
          type: "button",
          class: "admin-icon-button",
          title: t(a).clear,
          "aria-label": t(a).clear,
          disabled: M.value || e.value.unsaved,
          onClick: i[0] || (i[0] = (y) => k.value = !0)
        }, [...i[24] || (i[24] = [n("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [n("path", { d: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" })], -1)])], 8, Yt)
      ]),
      e.value.corrupted ? (s(), o("div", Qt, [ue(r(t(a).corrupted), 1), n("button", {
        type: "button",
        disabled: M.value,
        onClick: i[1] || (i[1] = (y) => k.value = !0)
      }, r(t(a).clear), 9, Jt)])) : g("", !0),
      n("div", {
        ref_key: "list",
        ref: O,
        class: "admin-conversation",
        tabindex: "-1",
        onScrollPassive: i[7] || (i[7] = (...y) => t(c) && t(c)(...y))
      }, [
        t(X) ? (s(), o("button", {
          key: 0,
          type: "button",
          class: "admin-history-button",
          "data-history": "older",
          disabled: t(ee),
          onClick: i[2] || (i[2] = (...y) => t(p) && t(p)(...y))
        }, r(t(a).earlier), 9, Xt)) : g("", !0),
        !t(W).length && !C.value && !A.value && !e.value.corrupted ? (s(), o("p", Zt, r(t(a).empty), 1)) : g("", !0),
        (s(!0), o(H, null, ie(t(W), (y) => (s(), J(St, {
          key: y.id,
          row: y,
          live: y.role === "assistant" && y.turnId === e.value.live?.turnId ? e.value.live : null,
          bridge: l.bridge,
          "chat-identity": e.value.chatIdentity,
          disabled: R.value,
          "unsaved-process": y.role === "assistant" && y.turnId === e.value.unsavedProcess?.turnId ? e.value.unsavedProcess.rounds : null,
          "save-edit": Se,
          onDelete: i[3] || (i[3] = (U) => h.value = U),
          onRegenerate: i[4] || (i[4] = (U) => le("regenerate", { turnId: U.turnId })),
          onDetails: i[5] || (i[5] = (U) => T.value = U.turnId)
        }, null, 8, [
          "row",
          "live",
          "bridge",
          "chat-identity",
          "disabled",
          "unsaved-process"
        ]))), 128)),
        t(re) && C.value ? (s(), o("article", {
          key: 2,
          class: "admin-message is-user admin-pending",
          "data-row-id": "pending",
          "aria-busy": !!w.value || !!e.value.live
        }, [n("div", ta, [C.value.image ? (s(), o("img", {
          key: 0,
          src: C.value.image.dataUrl,
          alt: C.value.image.name,
          class: "admin-message-image"
        }, null, 8, aa)) : g("", !0), C.value.text ? (s(), J(ye, {
          key: 1,
          class: "admin-markdown",
          text: C.value.text
        }, null, 8, ["text"])) : g("", !0)])], 8, ea)) : g("", !0),
        A.value && !t(G) && !D.value ? (s(), o("div", la, [ge(Te, {
          phase: A.value,
          "started-at": e.value.live?.startedAt
        }, null, 8, ["phase", "started-at"])])) : g("", !0),
        t(G) ? (s(), o("button", {
          key: 4,
          type: "button",
          class: "admin-history-button",
          "data-history": "newer",
          disabled: t(ee),
          onClick: i[6] || (i[6] = (...y) => t(z) && t(z)(...y))
        }, r(t(a).later), 9, na)) : g("", !0)
      ], 544),
      t(Z) || !t($) ? (s(), o("button", {
        key: 1,
        type: "button",
        class: "admin-latest",
        "data-history": "latest",
        onClick: Re
      }, "↓ " + r(t(a).latest), 1)) : g("", !0),
      v.value || t(E) || e.value.error || e.value.unsaved ? (s(), o("div", ia, [
        n("span", null, r(v.value || t(E) || (e.value.unsaved ? t(a).unsaved : e.value.error)), 1),
        e.value.unsaved ? (s(), o("button", {
          key: 0,
          type: "button",
          "data-action": "check",
          disabled: M.value,
          onClick: i[8] || (i[8] = (y) => le("check"))
        }, r(t(a).check), 9, sa)) : g("", !0),
        e.value.unsaved ? (s(), o("button", {
          key: 1,
          type: "button",
          "data-action": "confirm",
          disabled: M.value,
          onClick: i[9] || (i[9] = (y) => le("confirm"))
        }, r(t(a).confirm), 9, ra)) : g("", !0),
        e.value.conflict || e.value.unsaved ? (s(), o("button", {
          key: 2,
          type: "button",
          "data-action": "adopt",
          disabled: M.value,
          onClick: i[10] || (i[10] = (y) => le("adopt"))
        }, r(t(a).adopt), 9, ua)) : g("", !0)
      ])) : g("", !0),
      d.value ? (s(), o("div", oa, [
        n("img", {
          src: d.value.dataUrl,
          alt: d.value.name
        }, null, 8, da),
        n("span", null, r(d.value.name), 1),
        n("button", {
          type: "button",
          "aria-label": t(a).removeImage,
          disabled: M.value,
          onClick: i[11] || (i[11] = (y) => d.value = null)
        }, "×", 8, va)
      ])) : g("", !0),
      n("form", {
        class: "admin-composer",
        onSubmit: ce(be, ["prevent"])
      }, [
        n("input", {
          ref_key: "file",
          ref: S,
          type: "file",
          accept: t(_e).join(","),
          hidden: "",
          onChange: Ee
        }, null, 40, ca),
        n("button", {
          type: "button",
          class: "admin-icon-button",
          disabled: R.value,
          "aria-label": t(a).attach,
          title: t(a).attach,
          onClick: i[12] || (i[12] = (y) => S.value?.click())
        }, [...i[25] || (i[25] = [n("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [
          n("rect", {
            x: "3",
            y: "3",
            width: "18",
            height: "18",
            rx: "3"
          }),
          n("circle", {
            cx: "8",
            cy: "8",
            r: "1.5"
          }),
          n("path", { d: "m3 17 5-5 4 4 4-7 5 8" })
        ], -1)])], 8, ma),
        $e(n("textarea", {
          ref_key: "composer",
          ref: I,
          "onUpdate:modelValue": i[13] || (i[13] = (y) => m.value = y),
          rows: "1",
          maxlength: t(Q).maxInputChars,
          enterkeyhint: "enter",
          placeholder: t(a).placeholder,
          "aria-label": t(a).placeholder,
          disabled: e.value.corrupted || M.value,
          onKeydown: Pe,
          onCompositionstart: i[14] || (i[14] = (y) => x.value = !0),
          onCompositionend: i[15] || (i[15] = (y) => x.value = !1)
        }, null, 40, fa), [[Ae, m.value]]),
        A.value ? (s(), o("button", {
          key: 0,
          type: "button",
          class: "admin-send",
          disabled: A.value === "stopping",
          "aria-label": t(a).stop,
          title: t(a).stop,
          onClick: i[16] || (i[16] = (y) => u.bridge.post("administrator/stop", j()))
        }, [...i[26] || (i[26] = [n("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [n("rect", {
          x: "6",
          y: "6",
          width: "12",
          height: "12",
          rx: "2"
        })], -1)])], 8, ga)) : (s(), o("button", {
          key: 1,
          type: "submit",
          class: "admin-send",
          disabled: R.value || !m.value.trim() && !d.value,
          "aria-label": t(a).send,
          title: t(a).send
        }, [...i[27] || (i[27] = [n("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [n("path", { d: "M12 19V5m-6 6 6-6 6 6" })], -1)])], 8, ya))
      ], 32),
      T.value ? (s(), J(Kt, {
        key: T.value,
        bridge: l.bridge,
        "chat-identity": e.value.chatIdentity,
        "turn-id": T.value,
        onClose: i[17] || (i[17] = (y) => T.value = null)
      }, null, 8, [
        "bridge",
        "chat-identity",
        "turn-id"
      ])) : g("", !0),
      k.value ? (s(), J(xe, {
        key: 5,
        class: "admin-dialog",
        "aria-label": t(a).clearTitle,
        busy: M.value,
        onClose: i[20] || (i[20] = (y) => k.value = !1)
      }, {
        default: we(() => [
          n("h2", null, r(t(a).clearTitle), 1),
          n("p", null, r(t(a).clearWarning), 1),
          n("div", pa, [n("button", {
            type: "button",
            onClick: i[18] || (i[18] = (y) => k.value = !1)
          }, r(t(a).cancel), 1), n("button", {
            type: "button",
            disabled: M.value,
            onClick: i[19] || (i[19] = (y) => le("clear"))
          }, r(t(a).clear), 9, ba)])
        ]),
        _: 1
      }, 8, ["aria-label", "busy"])) : g("", !0),
      h.value ? (s(), J(xe, {
        key: 6,
        class: "admin-dialog",
        "aria-label": t(a).delete,
        busy: M.value,
        onClose: i[23] || (i[23] = (y) => h.value = null)
      }, {
        default: we(() => [
          n("h2", null, r(t(a).delete), 1),
          n("p", null, r(t(a).deleteWarning), 1),
          n("div", ha, [n("button", {
            type: "button",
            onClick: i[21] || (i[21] = (y) => h.value = null)
          }, r(t(a).cancel), 1), n("button", {
            type: "button",
            disabled: R.value,
            onClick: i[22] || (i[22] = (y) => le("delete", {
              turnId: h.value.turnId,
              role: h.value.role,
              revision: e.value.page.revision
            }))
          }, r(t(a).delete), 9, wa)])
        ]),
        _: 1
      }, 8, ["aria-label", "busy"])) : g("", !0)
    ], 2));
  }
}), Ra = ka;
export {
  Ra as default
};
