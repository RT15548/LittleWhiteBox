/* eslint-disable */
import { t as De } from "./xiaobai-os-message-markdown-C9E8FiNZ.js";
import { $ as Ce, D as ne, E as ge, M as de, P as me, Q as we, R as Ae, S as d, T as ue, U as le, V as s, X as F, at as ve, b as Q, d as Te, dt as Ne, ft as r, h as K, i as ze, lt as t, m as ce, ot as ke, p as oe, r as Le, rt as h, ut as Z, v as N, x as y, y as n } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as Ve } from "./xiaobai-os-descriptor-DmDuv1pM.js";
import { t as Ue } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { t as xe } from "./xiaobai-os-AppDialog-B4VpOkFC.js";
import { r as je, t as Fe } from "./xiaobai-os-composer-keyboard-COt-GHsA.js";
import { t as ye } from "./xiaobai-os-MessageMarkdown-_hWt2Lpl.js";
import { n as _e, t as re } from "./xiaobai-os-conversation-window-no8ylrha.js";
var G = Object.freeze({
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
}), Ie = Object.freeze([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
]);
function We() {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (l) => l.toString(16).padStart(2, "0")).join("");
}
var a = Object.freeze({
  webSearch: "搜索网页",
  webFetch: "读取网页",
  title: Ve.name,
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
}), Ke = Object.freeze({
  administrator_stopped: a.stopped,
  administrator_busy: "当前操作尚未结束，请先等待或停止。",
  administrator_context_changed: "聊天已切换，旧操作已停止。",
  administrator_environment_unavailable: "OS 状态读取失败，未能确认当前运行情况。",
  administrator_chat_unavailable: "请先进入一个酒馆聊天。",
  administrator_message_missing: "这条消息已不存在，请刷新记录。",
  administrator_history_conflict: "管理员记录已被其他操作更新，请重新打开核对，不会覆盖现有记录。",
  administrator_input_invalid: `请输入内容或选择图片，文字最多 ${G.maxInputChars} 字符。`,
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
function W(l) {
  const u = l instanceof Error ? l.message : String(l);
  return Ke[u] ?? u.slice(0, 700);
}
var He = [
  "aria-label",
  "title",
  "aria-expanded"
], Ge = {
  key: 0,
  class: "admin-popover"
}, Ye = ["aria-label"], Qe = { class: "admin-context-total" }, Je = /* @__PURE__ */ ne({
  __name: "AdministratorContext",
  props: {
    usage: {},
    draftTokens: {}
  },
  setup(l) {
    const u = l, e = h(!1), m = N(() => u.usage.used + u.draftTokens), v = (c) => `${(c / 1e3).toFixed(1)}k`;
    return Le(() => (e.value = !1, !0), () => e.value), (c, x) => (s(), d("div", {
      class: "admin-context",
      onKeydown: x[2] || (x[2] = oe(ce((w) => e.value = !1, ["stop"]), ["esc"]))
    }, [n("button", {
      type: "button",
      class: Z(["admin-context-ring", { "is-warning": m.value >= l.usage.trigger }]),
      style: Ne({ "--context-fill": `${Math.min(1, m.value / l.usage.limit) * 360}deg` }),
      "aria-label": t(a).context,
      title: t(a).context,
      "aria-expanded": e.value,
      onClick: x[0] || (x[0] = (w) => e.value = !e.value)
    }, [...x[3] || (x[3] = [n("span", null, null, -1)])], 14, He), e.value ? (s(), d("section", Ge, [
      n("header", null, [n("strong", null, r(t(a).context), 1), n("button", {
        type: "button",
        "aria-label": t(a).close,
        onClick: x[1] || (x[1] = (w) => e.value = !1)
      }, "×", 8, Ye)]),
      n("p", Qe, r(v(m.value)) + " / " + r(v(l.usage.limit)), 1),
      n("dl", null, [(s(!0), d(K, null, le(t(a).contextParts, (w, k) => (s(), d(K, { key: k }, [n("dt", null, r(w), 1), n("dd", null, r(v(l.usage[k] + (k === "history" ? l.draftTokens : 0))), 1)], 64))), 128))]),
      n("small", null, r(t(a).budgetNote), 1)
    ])) : y("", !0)], 32));
  }
}), Xe = Je, Ze = ["aria-expanded"], et = {
  key: 1,
  class: "admin-process-body"
}, tt = { key: 0 }, at = {
  key: 0,
  class: "admin-muted"
}, lt = {
  key: 1,
  class: "admin-error",
  role: "status"
}, nt = /* @__PURE__ */ ne({
  __name: "AdministratorProcess",
  props: {
    row: {},
    live: {},
    unsaved: {},
    bridge: {},
    chatIdentity: {}
  },
  setup(l) {
    const u = l, e = h(!1), m = ve([]), v = h(!1), c = h(""), x = N(() => u.live?.process ?? m.value), w = N(() => u.live?.process.length ?? u.unsaved?.length ?? u.row.processCount), k = N(() => !!u.live || e.value);
    let A = 0;
    async function B() {
      const E = ++A;
      if (c.value = "", v.value = !1, !k.value || u.live || !w.value) {
        m.value = [];
        return;
      }
      if (u.unsaved) {
        m.value = u.unsaved;
        return;
      }
      const { turnId: _, revision: f } = u.row, M = u.chatIdentity, z = () => E === A && M === u.chatIdentity && _ === u.row.turnId && f === u.row.revision;
      v.value = !0;
      try {
        const I = await u.bridge.request("administrator/process", {
          chatIdentity: M,
          turnId: _,
          revision: f
        });
        z() && (m.value = I.result);
      } catch (I) {
        z() && (c.value = W(I));
      } finally {
        z() && (v.value = !1);
      }
    }
    return F([
      () => u.chatIdentity,
      () => u.row.id,
      () => u.row.revision,
      () => !!u.live,
      () => u.unsaved,
      e
    ], (E, _) => {
      (E[0] !== _[0] || E[1] !== _[1] || E[3] !== _[3]) && (e.value = !1), B();
    }, { immediate: !0 }), me(() => {
      A++;
    }), (E, _) => w.value ? (s(), d("section", {
      key: 0,
      class: Z(["admin-process", { "is-running": !!l.live }])
    }, [l.live ? y("", !0) : (s(), d("button", {
      key: 0,
      type: "button",
      class: "admin-process-toggle",
      "aria-expanded": k.value,
      onClick: _[0] || (_[0] = (f) => e.value = !e.value)
    }, [_[1] || (_[1] = n("svg", {
      viewBox: "0 0 16 16",
      "aria-hidden": "true"
    }, [n("path", { d: "m6 4 4 4-4 4" })], -1)), ue(r(t(a).process(w.value)), 1)], 8, Ze)), k.value ? (s(), d("div", et, [
      (s(!0), d(K, null, le(x.value, (f) => (s(), d("div", {
        key: f.index,
        class: "admin-process-round"
      }, [f.text ? (s(), Q(ye, {
        key: 0,
        class: "admin-markdown admin-process-narration",
        text: f.text
      }, null, 8, ["text"])) : y("", !0), (s(!0), d(K, null, le(f.tools, (M) => (s(), d("div", {
        key: M.id,
        class: "admin-operation-line"
      }, [
        n("i", { class: Z(["admin-operation-dot", `is-${M.status}`]) }, null, 2),
        n("span", null, [ue(r(M.name), 1), M.target ? (s(), d("small", tt, " · " + r(M.target), 1)) : y("", !0)]),
        n("small", null, r(M.status === "queued" ? t(a).queued : M.status === "not-executed" ? t(a).notExecuted : t(a).operations[M.status]), 1)
      ]))), 128))]))), 128)),
      v.value ? (s(), d("span", at, r(t(a).processLoading), 1)) : y("", !0),
      c.value ? (s(), d("p", lt, [ue(r(c.value), 1), n("button", {
        type: "button",
        onClick: B
      }, r(t(a).check), 1)])) : y("", !0)
    ])) : y("", !0)], 2)) : y("", !0);
  }
}), it = nt, st = ["data-phase"], rt = {
  role: "status",
  "aria-live": "polite"
}, ut = ["datetime"], ot = /* @__PURE__ */ ne({
  __name: "AdministratorStatus",
  props: {
    phase: {},
    startedAt: {}
  },
  setup(l) {
    const u = l, e = h(Date.now()), m = N(() => Math.max(0, Math.floor((e.value - (u.startedAt ?? e.value)) / 1e3)));
    return F(() => u.startedAt, (v, c, x) => {
      if (e.value = Date.now(), v === void 0) return;
      const w = setInterval(() => {
        e.value = Date.now();
      }, 1e3);
      x(() => clearInterval(w));
    }, { immediate: !0 }), (v, c) => (s(), d("div", {
      class: "admin-live-status",
      "data-phase": l.phase
    }, [
      c[0] || (c[0] = n("span", {
        class: "admin-working-dot",
        "aria-hidden": "true"
      }, null, -1)),
      n("span", rt, r(t(a).phases[l.phase]), 1),
      l.startedAt !== void 0 ? (s(), d("time", {
        key: 0,
        datetime: `PT${m.value}S`
      }, r(t(a).elapsed(m.value)), 9, ut)) : y("", !0)
    ], 8, st));
  }
}), Me = /* @__PURE__ */ Ue(ot, [["__scopeId", "data-v-8eac51f2"]]);
async function $e(l, u) {
  let e = u.text;
  const { turnId: m, role: v, revision: c, totalChars: x } = u.row;
  for (; e.length < Math.min(u.through, x); ) {
    const w = await l.request("administrator/text", {
      chatIdentity: u.chatIdentity,
      turnId: m,
      role: v,
      revision: c,
      offset: e.length
    });
    if (!u.current()) throw new Error("administrator_context_changed");
    e += w.result.text;
  }
  return e;
}
var dt = ["data-row-id"], vt = ["aria-label"], ct = ["src", "alt"], mt = [
  "maxlength",
  "aria-label",
  "disabled"
], ft = { class: "admin-message-actions" }, gt = ["disabled"], yt = ["disabled"], pt = ["aria-label"], bt = ["src", "alt"], ht = {
  key: 2,
  class: "admin-muted"
}, wt = {
  key: 0,
  class: "admin-muted"
}, kt = ["aria-label"], xt = ["disabled"], _t = {
  key: 5,
  class: "admin-error",
  role: "status"
}, It = {
  key: 6,
  class: "admin-error",
  role: "status"
}, $t = ["aria-label"], Ct = ["disabled"], At = ["disabled"], Tt = ["disabled"], Mt = ["disabled"], Rt = {
  key: 8,
  class: "admin-muted",
  role: "status"
}, St = /* @__PURE__ */ ne({
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
    const e = l, m = u, v = h(!1), c = h(e.row.text), x = h(!1), w = h(""), k = h(null), A = h(!1), B = h(!1), E = h(!1), _ = h(""), f = h(null), M = h(!1), z = h(null);
    let I = 0, q = 0, T = c.value.length;
    const C = N(() => e.live ? e.live.text : c.value), R = N(() => e.unsavedProcess?.length ?? e.row.processCount);
    function j(S) {
      S.target.closest("a, button, input, textarea, select") || (S instanceof KeyboardEvent && S.preventDefault(), v.value = !v.value);
    }
    F(() => [
      e.chatIdentity,
      e.row.id,
      e.row.revision
    ], (S, $) => {
      q++, x.value = !1, w.value = "", (S[0] !== $[0] || S[1] !== $[1]) && (T = e.row.text.length, f.value = null, v.value = !1), T <= e.row.text.length ? c.value = e.row.text : J(T, !0);
    }), F([
      v,
      () => e.chatIdentity,
      () => e.row.id,
      () => e.row.revision,
      () => !!e.live
    ], () => {
      H();
    }), F(k, (S) => {
      f.value && f.value.row.revision !== e.row.revision && S === f.value.text.trim() && (f.value = null, _.value = "");
    }), me(() => {
      q++, I++;
    });
    async function H() {
      const S = ++I;
      if (k.value = null, A.value = !1, E.value = !1, f.value || (_.value = ""), !v.value || e.live) return;
      const $ = e.row, o = e.chatIdentity, b = () => S === I;
      A.value = !0;
      try {
        const O = await $e(e.bridge, {
          row: $,
          chatIdentity: o,
          text: $.text,
          through: $.totalChars,
          current: b
        });
        b() && (k.value = O);
      } catch (O) {
        b() && (_.value = W(O));
      } finally {
        b() && (A.value = !1);
      }
    }
    async function Y() {
      if (k.value === null || B.value) return;
      const S = I, $ = document.activeElement;
      B.value = !0, E.value = !1, _.value = "";
      try {
        if (!await De(k.value)) throw new Error("administrator_copy_failed");
        S === I && (E.value = !0);
      } catch (o) {
        S === I && (_.value = W(o));
      } finally {
        B.value = !1, $ instanceof HTMLElement && $.isConnected && document.activeElement === document.body && $.focus({ preventScroll: !0 });
      }
    }
    async function ie() {
      e.disabled || k.value === null || (f.value = {
        row: { ...e.row },
        text: k.value
      }, _.value = "", await de(), z.value?.focus());
    }
    async function se() {
      const S = f.value;
      if (!(!S || e.disabled || M.value)) {
        M.value = !0, _.value = "";
        try {
          await e.saveEdit(S.row, S.text), f.value === S && (f.value = null);
        } catch ($) {
          f.value === S && (_.value = W($));
        } finally {
          M.value = !1;
        }
      }
    }
    async function J(S, $ = !1) {
      if (x.value) return;
      T = Math.min(Math.max(T, S), e.row.totalChars);
      const o = ++q, { turnId: b, revision: O } = e.row, D = e.chatIdentity, L = () => o === q && D === e.chatIdentity && O === e.row.revision && b === e.row.turnId;
      x.value = !0, w.value = "";
      try {
        const P = await $e(e.bridge, {
          chatIdentity: D,
          row: e.row,
          text: $ ? e.row.text : c.value,
          through: T,
          current: L
        });
        L() && (c.value = P);
      } catch (P) {
        L() && ($ && (c.value = e.row.text), w.value = W(P));
      } finally {
        L() && (x.value = !1);
      }
    }
    return (S, $) => (s(), d("article", {
      class: Z(["admin-message", `is-${l.row.role}`]),
      "data-row-id": l.row.id
    }, [
      l.row.role === "assistant" ? (s(), Q(it, {
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
      ])) : y("", !0),
      f.value ? (s(), d("form", {
        key: 1,
        class: "admin-message-editor",
        "aria-label": t(a).editMessage,
        onSubmit: ce(se, ["prevent"])
      }, [
        l.row.image ? (s(), d("img", {
          key: 0,
          src: l.row.image.path,
          alt: l.row.image.name,
          class: "admin-message-image"
        }, null, 8, ct)) : y("", !0),
        Ce(n("textarea", {
          ref_key: "editor",
          ref: z,
          "onUpdate:modelValue": $[0] || ($[0] = (o) => f.value.text = o),
          rows: "3",
          maxlength: t(G).maxInputChars,
          "aria-label": t(a).editMessage,
          enterkeyhint: "enter",
          disabled: M.value
        }, null, 8, mt), [[Te, f.value.text]]),
        n("div", ft, [n("button", {
          type: "button",
          "data-action": "cancel-edit",
          disabled: M.value,
          onClick: $[1] || ($[1] = (o) => {
            f.value = null, _.value = "";
          })
        }, r(t(a).cancel), 9, gt), n("button", {
          type: "submit",
          "data-action": "save-edit",
          disabled: l.disabled || M.value || !f.value.text.trim() && !l.row.image
        }, r(M.value ? t(a).saving : t(a).save), 9, yt)])
      ], 40, vt)) : C.value || l.row.image || !l.live && !R.value ? (s(), d("div", {
        key: 2,
        class: "admin-bubble",
        tabindex: "0",
        role: "group",
        "aria-label": t(a).messageActions,
        onClick: j,
        onKeydown: [
          oe(j, ["enter"]),
          oe(j, ["space"]),
          $[2] || ($[2] = oe(ce((o) => v.value = !1, ["stop"]), ["esc"]))
        ]
      }, [
        l.row.image ? (s(), d("img", {
          key: 0,
          src: l.row.image.path,
          alt: l.row.image.name,
          loading: "lazy",
          class: "admin-message-image"
        }, null, 8, bt)) : y("", !0),
        C.value ? (s(), Q(ye, {
          key: 1,
          class: "admin-markdown",
          text: C.value
        }, null, 8, ["text"])) : y("", !0),
        !C.value && !l.row.image ? (s(), d("span", ht, r(l.row.error || t(a).noReply), 1)) : y("", !0)
      ], 40, pt)) : y("", !0),
      l.live ? (s(), d(K, { key: 3 }, [
        (s(!0), d(K, null, le(l.live.preview, (o) => (s(), d("div", {
          key: o.id,
          class: "admin-operation-line"
        }, [
          n("i", { class: Z(["admin-operation-dot", `is-${o.status}`]) }, null, 2),
          n("span", null, r(o.name), 1),
          n("small", null, r(t(a).operations[o.status]), 1)
        ]))), 128)),
        l.live.totalChars > t(G).textBlock ? (s(), d("small", wt, r(t(a).longReply), 1)) : y("", !0),
        ge(Me, {
          phase: l.live.phase,
          "started-at": l.live.startedAt
        }, null, 8, ["phase", "started-at"])
      ], 64)) : y("", !0),
      !l.live && !f.value && l.row.totalChars > c.value.length ? (s(), d("nav", {
        key: 4,
        class: "admin-pager",
        "aria-label": t(a).messagePages
      }, [n("button", {
        type: "button",
        disabled: x.value,
        onClick: $[3] || ($[3] = (o) => J(c.value.length + t(G).textBlock))
      }, r(t(a).moreText), 9, xt)], 8, kt)) : y("", !0),
      l.row.error || w.value ? (s(), d("p", _t, r(w.value || l.row.error), 1)) : y("", !0),
      _.value ? (s(), d("p", It, [ue(r(_.value), 1), k.value === null && !A.value ? (s(), d("button", {
        key: 0,
        type: "button",
        onClick: H
      }, r(t(a).retry), 1)) : y("", !0)])) : y("", !0),
      !f.value && (v.value || !l.live && R.value && !C.value) ? (s(), d("nav", {
        key: 7,
        class: "admin-message-actions",
        "aria-label": t(a).messageActions
      }, [
        !l.live && l.row.totalChars ? (s(), d("button", {
          key: 0,
          type: "button",
          "data-action": "copy",
          disabled: k.value === null || B.value,
          onClick: Y
        }, r(E.value ? t(a).copied : t(a).copy), 9, Ct)) : y("", !0),
        l.row.role === "user" ? (s(), d("button", {
          key: 1,
          type: "button",
          "data-action": "edit",
          disabled: l.disabled || k.value === null,
          onClick: ie
        }, r(t(a).edit), 9, At)) : y("", !0),
        n("button", {
          type: "button",
          disabled: l.disabled,
          onClick: $[4] || ($[4] = (o) => m("delete", l.row))
        }, r(t(a).delete), 9, Tt),
        l.row.canRegenerate ? (s(), d("button", {
          key: 2,
          type: "button",
          "data-action": "regenerate",
          disabled: l.disabled,
          onClick: $[5] || ($[5] = (o) => m("regenerate", l.row))
        }, r(t(a).regenerate), 9, Mt)) : y("", !0),
        R.value ? (s(), d("button", {
          key: 3,
          type: "button",
          onClick: $[6] || ($[6] = (o) => m("details", l.row))
        }, r(t(a).evidence), 1)) : y("", !0)
      ], 8, $t)) : y("", !0),
      A.value ? (s(), d("small", Rt, r(t(a).loadingText), 1)) : y("", !0)
    ], 10, dt));
  }
}), Et = St, Pt = [
  "role",
  "aria-modal",
  "aria-label",
  "onKeydown"
], Bt = ["aria-label"], Ot = { class: "admin-details-body" }, qt = { class: "admin-evidence" }, Dt = ["disabled"], Nt = { class: "admin-operations" }, zt = { key: 0 }, Lt = { class: "admin-muted" }, Vt = ["disabled", "onClick"], Ut = { class: "admin-pager" }, jt = ["disabled"], Ft = ["disabled"], Wt = {
  key: 2,
  class: "admin-error",
  role: "status"
}, Kt = /* @__PURE__ */ ne({
  __name: "AdministratorDetails",
  props: {
    bridge: {},
    chatIdentity: {},
    turnId: {}
  },
  emits: ["close"],
  setup(l, { emit: u }) {
    const e = l, m = u, v = h([]), c = h(0), x = h(0), w = h(""), k = h(!1), A = h(null), B = h(""), E = h(null), _ = h(!0);
    let f;
    function M() {
      de(() => E.value?.focus({ preventScroll: !0 }));
    }
    function z() {
      A.value ? (A.value = null, M()) : m("close");
    }
    ze(E, z, () => _.value);
    async function I(T) {
      k.value = !0, w.value = "", A.value = null;
      try {
        const C = await e.bridge.request("administrator/operations", {
          chatIdentity: e.chatIdentity,
          turnId: e.turnId,
          offset: T
        });
        v.value = C.result.items, x.value = C.result.total, c.value = C.result.offset;
      } catch (C) {
        w.value = W(C);
      } finally {
        k.value = !1;
      }
    }
    async function q(T, C = 0) {
      k.value = !0, w.value = "";
      try {
        A.value = (await e.bridge.request("administrator/evidence", {
          chatIdentity: e.chatIdentity,
          reference: T,
          offset: C
        })).result, B.value = T, M();
      } catch (R) {
        w.value = W(R);
      } finally {
        k.value = !1;
      }
    }
    return Ae(() => {
      const T = E.value.closest(".administrator-app"), C = () => {
        _.value = getComputedStyle(T).getPropertyValue("--admin-details-docked").trim() !== "1";
      };
      C(), f = new ResizeObserver(C), f.observe(T), M(), I(0);
    }), me(() => f?.disconnect()), (T, C) => (s(), d("section", {
      ref_key: "layer",
      ref: E,
      class: "admin-details",
      role: _.value ? "dialog" : "region",
      "aria-modal": _.value ? !0 : void 0,
      tabindex: "-1",
      "aria-label": t(a).details,
      onKeydown: oe(ce(z, ["stop", "prevent"]), ["esc"])
    }, [n("header", null, [n("strong", null, r(t(a).details), 1), n("button", {
      type: "button",
      "aria-label": t(a).close,
      onClick: C[0] || (C[0] = (R) => m("close"))
    }, "×", 8, Bt)]), n("div", Ot, [A.value ? (s(), d(K, { key: 0 }, [
      n("button", {
        type: "button",
        class: "admin-text-button",
        onClick: z
      }, "‹ " + r(t(a).details), 1),
      n("pre", qt, r(A.value.text), 1),
      A.value.nextOffset !== null ? (s(), d("button", {
        key: 0,
        type: "button",
        disabled: k.value,
        onClick: C[1] || (C[1] = (R) => q(B.value, A.value.nextOffset))
      }, r(t(a).moreText), 9, Dt)) : y("", !0)
    ], 64)) : (s(), d(K, { key: 1 }, [n("ol", Nt, [(s(!0), d(K, null, le(v.value, (R) => (s(), d("li", { key: R.id }, [
      n("div", null, [
        n("i", { class: Z(["admin-operation-dot", `is-${R.status}`]) }, null, 2),
        n("strong", null, r(R.name), 1),
        n("span", null, r(t(a).operations[R.status]), 1),
        n("small", null, r((R.elapsedMs / 1e3).toFixed(1)) + "s", 1)
      ]),
      R.target ? (s(), d("p", zt, r(R.target), 1)) : y("", !0),
      n("p", Lt, r(R.summary), 1),
      n("button", {
        type: "button",
        class: "admin-text-button",
        disabled: k.value,
        onClick: (j) => q(R.id)
      }, r(t(a).evidence), 9, Vt)
    ]))), 128))]), n("nav", Ut, [n("button", {
      type: "button",
      disabled: !c.value || k.value,
      onClick: C[2] || (C[2] = (R) => I(Math.max(0, c.value - t(G).pageSize)))
    }, r(t(a).earlier), 9, jt), n("button", {
      type: "button",
      disabled: c.value + v.value.length >= x.value || k.value,
      onClick: C[3] || (C[3] = (R) => I(c.value + v.value.length))
    }, r(t(a).later), 9, Ft)])], 64)), w.value ? (s(), d("p", Wt, r(w.value), 1)) : y("", !0)])], 40, Pt));
  }
}), Ht = Kt;
function Gt(l) {
  const { state: u, pending: e, list: m } = l, v = ve(null), c = ve(u.value.page), x = h(!1), w = h(!0), k = h("");
  let A = 0, B = !1, E = null;
  const _ = N(() => u.value.page.total + Number(e.value)), f = N(() => _e(v.value, c.value.total + Number(e.value))), M = N(() => c.value.rows.slice(Math.max(0, f.value.start - c.value.start), Math.max(0, f.value.end - c.value.start))), z = N(() => f.value.start > 0), I = N(() => v.value !== null && v.value.end !== null && f.value.end < _.value), q = N(() => I.value || f.value.end - f.value.start > re.recent), T = N(() => e.value && f.value.end > u.value.page.total);
  function C(o = f.value) {
    const b = m.value;
    if (!b) return null;
    const O = new Set(c.value.rows.filter((P, V) => {
      const X = c.value.start + V;
      return X >= o.start && X < o.end;
    }).map((P) => P.id)), D = b.getBoundingClientRect().top, L = [...b.querySelectorAll("[data-row-id]")].find((P) => O.has(P.dataset.rowId) && P.getBoundingClientRect().bottom > D);
    return L ? {
      id: L.dataset.rowId,
      offset: L.getBoundingClientRect().top - D
    } : null;
  }
  function R(o) {
    const b = m.value, O = b && [...b.querySelectorAll("[data-row-id]")].find((D) => D.dataset.rowId === o?.id);
    o && O && b && (b.scrollTop += O.getBoundingClientRect().top - b.getBoundingClientRect().top - o.offset);
  }
  function j(o) {
    o && !o.isConnected && m.value?.focus({ preventScroll: !0 });
  }
  async function H() {
    await de(), w.value && !E && m.value && !B && (m.value.scrollTop = m.value.scrollHeight);
  }
  function Y() {
    A++, x.value = !1, B = !1, E = null, k.value = "";
    const o = m.value?.contains(document.activeElement) ? document.activeElement : null;
    v.value = null, w.value = !0, c.value = u.value.page, H().then(() => j(o));
  }
  function ie() {
    const o = m.value;
    !o || B || (w.value = !I.value && o.scrollHeight - o.clientHeight - o.scrollTop < 32, w.value ? v.value && Y() : v.value = {
      start: f.value.start,
      end: I.value ? f.value.end : null
    });
  }
  function se(o, b) {
    return o.revision === u.value.page.revision && o.start <= b.start && o.start + o.rows.length >= Math.min(b.end, u.value.page.total);
  }
  async function J(o, b) {
    const O = u.value.page.revision, D = u.value.page.total, L = {
      start: o.start,
      rows: [],
      total: D,
      revision: O
    };
    for (let P = o.start; P < Math.min(o.end, D); P += G.pageSize) {
      const V = await l.page(P, O);
      if (!b()) return null;
      L.rows.push(...V.rows.slice(0, Math.min(o.end, D) - P));
    }
    return L;
  }
  async function S() {
    const o = _e(E ?? v.value, _.value), b = !!E, O = ++A, D = u.value.chatIdentity, L = u.value.page.revision, P = () => O === A && D === u.value.chatIdentity && L === u.value.page.revision;
    x.value = !0;
    try {
      const V = [u.value.page, c.value].find((te) => se(te, o)) ?? await J(o, P);
      if (!P() || !V) return;
      const X = C(o), ee = m.value?.contains(document.activeElement) ? document.activeElement : null;
      if (B = !0, c.value = V, b && (v.value = {
        start: o.start,
        end: o.end === _.value ? null : o.end
      }, w.value = !1), await de(), !P()) return;
      w.value && m.value ? m.value.scrollTop = m.value.scrollHeight : R(X), B = !1, j(ee);
    } catch (V) {
      P() && (k.value = W(V));
    } finally {
      P() && (x.value = !1, B = !1, E = null);
    }
  }
  function $(o) {
    if (x.value) return;
    k.value = "";
    const b = { ...f.value };
    return o === "older" ? (b.start = Math.max(0, b.start - re.recent), b.end = Math.min(b.end, b.start + re.maximum)) : (b.end = Math.min(_.value, b.end + re.recent), b.start = Math.max(b.start, b.end - re.maximum)), E = {
      start: b.start,
      end: b.end === _.value ? null : b.end
    }, S();
  }
  return F(() => u.value.chatIdentity, Y, { flush: "sync" }), F([() => u.value.page, e], () => {
    S();
  }), F(() => u.value.live, () => {
    H();
  }), F(m, (o, b, O) => {
    if (!o) return;
    const D = new ResizeObserver(() => {
      H();
    });
    D.observe(o), O(() => D.disconnect()), H();
  }, { flush: "post" }), me(() => {
    A++, E = null;
  }), {
    rows: M,
    hasOlder: z,
    hasNewer: I,
    expanded: q,
    pendingVisible: T,
    paging: x,
    pageError: k,
    atBottom: w,
    resetLatest: Y,
    scrolled: ie,
    older: () => $("older"),
    newer: () => $("newer")
  };
}
var Yt = { class: "admin-header" }, Qt = [
  "title",
  "aria-label",
  "disabled"
], Jt = {
  key: 0,
  class: "admin-notice",
  role: "alert"
}, Xt = ["disabled"], Zt = ["disabled"], ea = {
  key: 1,
  class: "admin-empty"
}, ta = ["aria-busy"], aa = { class: "admin-bubble" }, la = ["src", "alt"], na = {
  key: 3,
  class: "admin-live"
}, ia = ["disabled"], sa = {
  key: 2,
  class: "admin-notice",
  role: "status"
}, ra = ["disabled"], ua = ["disabled"], oa = ["disabled"], da = {
  key: 3,
  class: "admin-attachment"
}, va = ["src", "alt"], ca = ["aria-label", "disabled"], ma = ["accept"], fa = [
  "disabled",
  "aria-label",
  "title"
], ga = [
  "maxlength",
  "placeholder",
  "aria-label",
  "disabled"
], ya = [
  "disabled",
  "aria-label",
  "title"
], pa = [
  "disabled",
  "aria-label",
  "title"
], ba = { class: "admin-dialog-actions" }, ha = ["disabled"], wa = { class: "admin-dialog-actions" }, ka = ["disabled"], xa = /* @__PURE__ */ ne({
  __name: "AdministratorApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(l) {
    const u = l, e = ve(structuredClone(ke(u.initialState))), m = h(""), v = h(null), c = h(""), x = h(""), w = h(!1), k = h(null), A = h(null), B = h(null), E = h(null), _ = h(null), f = h(!1), M = h(0);
    let z = 0;
    const I = ve(null);
    let q = 0;
    F([m, v], () => {
      z++;
    }, { flush: "sync" });
    const T = N(() => !!x.value || !!e.value.live), C = N(() => e.value.live?.phase ?? (["send", "regenerate"].includes(x.value) ? "preparing" : null)), R = N(() => T.value || e.value.unsaved || e.value.corrupted), { rows: j, hasOlder: H, hasNewer: Y, expanded: ie, pendingVisible: se, paging: J, pageError: S, atBottom: $, resetLatest: o, scrolled: b, older: O, newer: D } = Gt({
      state: e,
      pending: N(() => !!I.value),
      list: B,
      page: (g, i) => ee("page", {
        start: g,
        revision: i
      })
    }), L = N(() => j.value.some((g) => g.role === "assistant" && g.turnId === e.value.live?.turnId));
    let P = () => {
    }, V;
    const X = () => ({ chatIdentity: e.value.chatIdentity });
    async function ee(g, i = {}) {
      return (await u.bridge.request(`administrator/${g}`, {
        ...X(),
        ...i
      }, 6e4)).result;
    }
    function te(g) {
      const i = e.value;
      if (!(i.chatIdentity === g.chatIdentity && g.page.revision < i.page.revision)) {
        if (e.value = g, i.chatIdentity !== g.chatIdentity) {
          q++, x.value = "", c.value = "", m.value = "", v.value = null, A.value = null, I.value = null;
          return;
        }
        I.value && g.submission?.id === I.value.id && g.submission.accepted && (I.value = null);
      }
    }
    function Re() {
      const g = I.value;
      g && g.revision === z && (m.value = g.text, v.value = g.image), I.value = null;
    }
    function pe(g) {
      g === q && (x.value = "", !e.value.unsaved && !e.value.live && Re());
    }
    function Se() {
      o(), de(() => B.value?.focus({ preventScroll: !0 }));
    }
    async function be() {
      if (R.value || !m.value.trim() && !v.value) return;
      const g = {
        id: We(),
        revision: 0,
        text: m.value,
        image: v.value && ke(v.value)
      };
      m.value = "", v.value = null, g.revision = z, I.value = g, x.value = "send", c.value = "", o();
      const i = ++q;
      try {
        const p = await ee("send", {
          submissionId: g.id,
          text: g.text,
          ...g.image ? { image: g.image } : {}
        });
        i === q && te(p.state);
      } catch (p) {
        i === q && (c.value = W(p));
      } finally {
        pe(i);
      }
    }
    async function ae(g, i = {}) {
      if (T.value) return;
      x.value = g, c.value = "", (g === "regenerate" || g === "confirm") && o();
      const p = ++q;
      try {
        const U = await ee(g, i);
        if (p !== q) return;
        te(U), w.value = !1, k.value = null, g === "clear" && (m.value = "", v.value = null, I.value = null, A.value = null, o());
      } catch (U) {
        p === q && (c.value = W(U));
      } finally {
        pe(p);
      }
    }
    async function Ee(g, i) {
      if (R.value) throw new Error("administrator_busy");
      x.value = "edit", c.value = "";
      try {
        te(await ee("edit", {
          turnId: g.turnId,
          revision: g.revision,
          text: i
        }));
      } finally {
        x.value = "";
      }
    }
    async function Pe(g) {
      const i = g.target, p = i.files?.[0];
      if (i.value = "", !!p) {
        if (c.value = "", p.size > G.maxImageBytes || !Ie.includes(p.type)) {
          c.value = a.invalidImage;
          return;
        }
        try {
          const U = await new Promise((Oe, qe) => {
            const fe = new FileReader();
            fe.onload = () => Oe(String(fe.result)), fe.onerror = () => qe(new Error(a.invalidImage)), fe.readAsDataURL(p);
          }), he = new Image();
          he.src = U, await he.decode(), v.value = {
            name: p.name.slice(0, 120),
            dataUrl: U
          }, _.value?.focus();
        } catch {
          c.value = a.invalidImage;
        }
      }
    }
    function Be(g) {
      Fe(g, f.value) && (g.preventDefault(), T.value || be());
    }
    return F([m, v], () => {
      V && clearTimeout(V), V = setTimeout(() => {
        M.value = je(m.value) + (v.value ? G.imageTokens : 0);
      }, 160);
    }), Ae(() => {
      P = u.bridge.subscribe((g) => {
        g.type === "administrator/state" && te(g.payload.state), g.type === "administrator/live" && (e.value = {
          ...e.value,
          ...g.payload
        });
      });
    }), me(() => {
      q++, P(), V && clearTimeout(V);
    }), (g, i) => (s(), d("div", { class: Z(["administrator-app", { "has-details": !!A.value }]) }, [
      n("header", Yt, [
        n("h1", null, r(t(a).title), 1),
        ge(Xe, {
          usage: e.value.context,
          "draft-tokens": e.value.live ? 0 : M.value
        }, null, 8, ["usage", "draft-tokens"]),
        n("button", {
          type: "button",
          class: "admin-icon-button",
          title: t(a).clear,
          "aria-label": t(a).clear,
          disabled: T.value || e.value.unsaved,
          onClick: i[0] || (i[0] = (p) => w.value = !0)
        }, [...i[24] || (i[24] = [n("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [n("path", { d: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" })], -1)])], 8, Qt)
      ]),
      e.value.corrupted ? (s(), d("div", Jt, [ue(r(t(a).corrupted), 1), n("button", {
        type: "button",
        disabled: T.value,
        onClick: i[1] || (i[1] = (p) => w.value = !0)
      }, r(t(a).clear), 9, Xt)])) : y("", !0),
      n("div", {
        ref_key: "list",
        ref: B,
        class: "admin-conversation",
        tabindex: "-1",
        onScrollPassive: i[7] || (i[7] = (...p) => t(b) && t(b)(...p))
      }, [
        t(H) ? (s(), d("button", {
          key: 0,
          type: "button",
          class: "admin-history-button",
          "data-history": "older",
          disabled: t(J),
          onClick: i[2] || (i[2] = (...p) => t(O) && t(O)(...p))
        }, r(t(a).earlier), 9, Zt)) : y("", !0),
        !t(j).length && !I.value && !C.value && !e.value.corrupted ? (s(), d("p", ea, r(t(a).empty), 1)) : y("", !0),
        (s(!0), d(K, null, le(t(j), (p) => (s(), Q(Et, {
          key: p.id,
          row: p,
          live: p.role === "assistant" && p.turnId === e.value.live?.turnId ? e.value.live : null,
          bridge: l.bridge,
          "chat-identity": e.value.chatIdentity,
          disabled: R.value,
          "unsaved-process": p.role === "assistant" && p.turnId === e.value.unsavedProcess?.turnId ? e.value.unsavedProcess.rounds : null,
          "save-edit": Ee,
          onDelete: i[3] || (i[3] = (U) => k.value = U),
          onRegenerate: i[4] || (i[4] = (U) => ae("regenerate", { turnId: U.turnId })),
          onDetails: i[5] || (i[5] = (U) => A.value = U.turnId)
        }, null, 8, [
          "row",
          "live",
          "bridge",
          "chat-identity",
          "disabled",
          "unsaved-process"
        ]))), 128)),
        t(se) && I.value ? (s(), d("article", {
          key: 2,
          class: "admin-message is-user admin-pending",
          "data-row-id": "pending",
          "aria-busy": !!x.value || !!e.value.live
        }, [n("div", aa, [I.value.image ? (s(), d("img", {
          key: 0,
          src: I.value.image.dataUrl,
          alt: I.value.image.name,
          class: "admin-message-image"
        }, null, 8, la)) : y("", !0), I.value.text ? (s(), Q(ye, {
          key: 1,
          class: "admin-markdown",
          text: I.value.text
        }, null, 8, ["text"])) : y("", !0)])], 8, ta)) : y("", !0),
        C.value && !t(Y) && !L.value ? (s(), d("div", na, [ge(Me, {
          phase: C.value,
          "started-at": e.value.live?.startedAt
        }, null, 8, ["phase", "started-at"])])) : y("", !0),
        t(Y) ? (s(), d("button", {
          key: 4,
          type: "button",
          class: "admin-history-button",
          "data-history": "newer",
          disabled: t(J),
          onClick: i[6] || (i[6] = (...p) => t(D) && t(D)(...p))
        }, r(t(a).later), 9, ia)) : y("", !0)
      ], 544),
      t(ie) || !t($) ? (s(), d("button", {
        key: 1,
        type: "button",
        class: "admin-latest",
        "data-history": "latest",
        onClick: Se
      }, "↓ " + r(t(a).latest), 1)) : y("", !0),
      c.value || t(S) || e.value.error || e.value.unsaved ? (s(), d("div", sa, [
        n("span", null, r(c.value || t(S) || (e.value.unsaved ? t(a).unsaved : e.value.error)), 1),
        e.value.unsaved ? (s(), d("button", {
          key: 0,
          type: "button",
          "data-action": "check",
          disabled: T.value,
          onClick: i[8] || (i[8] = (p) => ae("check"))
        }, r(t(a).check), 9, ra)) : y("", !0),
        e.value.unsaved ? (s(), d("button", {
          key: 1,
          type: "button",
          "data-action": "confirm",
          disabled: T.value,
          onClick: i[9] || (i[9] = (p) => ae("confirm"))
        }, r(t(a).confirm), 9, ua)) : y("", !0),
        e.value.conflict || e.value.unsaved ? (s(), d("button", {
          key: 2,
          type: "button",
          "data-action": "adopt",
          disabled: T.value,
          onClick: i[10] || (i[10] = (p) => ae("adopt"))
        }, r(t(a).adopt), 9, oa)) : y("", !0)
      ])) : y("", !0),
      v.value ? (s(), d("div", da, [
        n("img", {
          src: v.value.dataUrl,
          alt: v.value.name
        }, null, 8, va),
        n("span", null, r(v.value.name), 1),
        n("button", {
          type: "button",
          "aria-label": t(a).removeImage,
          disabled: T.value,
          onClick: i[11] || (i[11] = (p) => v.value = null)
        }, "×", 8, ca)
      ])) : y("", !0),
      n("form", {
        class: "admin-composer",
        onSubmit: ce(be, ["prevent"])
      }, [
        n("input", {
          ref_key: "file",
          ref: E,
          type: "file",
          accept: t(Ie).join(","),
          hidden: "",
          onChange: Pe
        }, null, 40, ma),
        n("button", {
          type: "button",
          class: "admin-icon-button",
          disabled: R.value,
          "aria-label": t(a).attach,
          title: t(a).attach,
          onClick: i[12] || (i[12] = (p) => E.value?.click())
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
        ], -1)])], 8, fa),
        Ce(n("textarea", {
          ref_key: "composer",
          ref: _,
          "onUpdate:modelValue": i[13] || (i[13] = (p) => m.value = p),
          rows: "1",
          maxlength: t(G).maxInputChars,
          enterkeyhint: "enter",
          placeholder: t(a).placeholder,
          "aria-label": t(a).placeholder,
          disabled: e.value.corrupted || T.value,
          onKeydown: Be,
          onCompositionstart: i[14] || (i[14] = (p) => f.value = !0),
          onCompositionend: i[15] || (i[15] = (p) => f.value = !1)
        }, null, 40, ga), [[Te, m.value]]),
        C.value ? (s(), d("button", {
          key: 0,
          type: "button",
          class: "admin-send",
          disabled: C.value === "stopping",
          "aria-label": t(a).stop,
          title: t(a).stop,
          onClick: i[16] || (i[16] = (p) => u.bridge.post("administrator/stop", X()))
        }, [...i[26] || (i[26] = [n("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [n("rect", {
          x: "6",
          y: "6",
          width: "12",
          height: "12",
          rx: "2"
        })], -1)])], 8, ya)) : (s(), d("button", {
          key: 1,
          type: "submit",
          class: "admin-send",
          disabled: R.value || !m.value.trim() && !v.value,
          "aria-label": t(a).send,
          title: t(a).send
        }, [...i[27] || (i[27] = [n("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [n("path", { d: "M12 19V5m-6 6 6-6 6 6" })], -1)])], 8, pa))
      ], 32),
      A.value ? (s(), Q(Ht, {
        key: A.value,
        bridge: l.bridge,
        "chat-identity": e.value.chatIdentity,
        "turn-id": A.value,
        onClose: i[17] || (i[17] = (p) => A.value = null)
      }, null, 8, [
        "bridge",
        "chat-identity",
        "turn-id"
      ])) : y("", !0),
      w.value ? (s(), Q(xe, {
        key: 5,
        class: "admin-dialog",
        "aria-label": t(a).clearTitle,
        busy: T.value,
        onClose: i[20] || (i[20] = (p) => w.value = !1)
      }, {
        default: we(() => [
          n("h2", null, r(t(a).clearTitle), 1),
          n("p", null, r(t(a).clearWarning), 1),
          n("div", ba, [n("button", {
            type: "button",
            onClick: i[18] || (i[18] = (p) => w.value = !1)
          }, r(t(a).cancel), 1), n("button", {
            type: "button",
            disabled: T.value,
            onClick: i[19] || (i[19] = (p) => ae("clear"))
          }, r(t(a).clear), 9, ha)])
        ]),
        _: 1
      }, 8, ["aria-label", "busy"])) : y("", !0),
      k.value ? (s(), Q(xe, {
        key: 6,
        class: "admin-dialog",
        "aria-label": t(a).delete,
        busy: T.value,
        onClose: i[23] || (i[23] = (p) => k.value = null)
      }, {
        default: we(() => [
          n("h2", null, r(t(a).delete), 1),
          n("p", null, r(t(a).deleteWarning), 1),
          n("div", wa, [n("button", {
            type: "button",
            onClick: i[21] || (i[21] = (p) => k.value = null)
          }, r(t(a).cancel), 1), n("button", {
            type: "button",
            disabled: R.value,
            onClick: i[22] || (i[22] = (p) => ae("delete", {
              turnId: k.value.turnId,
              role: k.value.role,
              revision: e.value.page.revision
            }))
          }, r(t(a).delete), 9, ka)])
        ]),
        _: 1
      }, 8, ["aria-label", "busy"])) : y("", !0)
    ], 2));
  }
}), Sa = xa;
export {
  Sa as default
};
