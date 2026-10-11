/* eslint-disable */
import { t as qe } from "./xiaobai-os-message-markdown-C9E8FiNZ.js";
import { $ as Ie, D as ne, E as ye, M as ce, P as me, Q as we, R as Ce, S as u, T as ue, U as ie, V as s, X as te, at as pe, b as ee, d as Ae, dt as ze, ft as r, h as G, i as De, lt as a, m as de, ot as ke, p as oe, r as Oe, rt as g, ut as ae, v as U, x as c, y as n } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as Le } from "./xiaobai-os-descriptor-DmDuv1pM.js";
import { t as Ne } from "./xiaobai-os-_plugin-vue_export-helper-Dj7HTbfw.js";
import { t as xe } from "./xiaobai-os-AppDialog-B4VpOkFC.js";
import { r as Ve, t as je } from "./xiaobai-os-composer-keyboard-COt-GHsA.js";
import { t as Te } from "./xiaobai-os-MessageMarkdown-_hWt2Lpl.js";
var D = Object.freeze({
  inputBudget: 158e3,
  summaryTrigger: 128e3,
  imageTokens: 6e3,
  pageSize: 20,
  windowSize: 60,
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
function Ue() {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (i) => i.toString(16).padStart(2, "0")).join("");
}
var t = Object.freeze({
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
  process: (i) => `工作经过 · ${i} 轮`,
  processLoading: "加载经过",
  queued: "等待执行",
  notExecuted: "未执行",
  evidence: "查看资料",
  inspect: "检查 OS 状态",
  loadTools: "加载工具",
  toolsLoaded: "工具已就绪",
  itemReport: (i, v) => `成功 ${i} 项，未完成 ${v} 项`,
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
  elapsed: (i) => `已用 ${i} 秒`,
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
}), Fe = Object.freeze({
  administrator_stopped: t.stopped,
  administrator_busy: "当前操作尚未结束，请先等待或停止。",
  administrator_context_changed: "聊天已切换，旧操作已停止。",
  administrator_environment_unavailable: "OS 状态读取失败，未能确认当前运行情况。",
  administrator_chat_unavailable: "请先进入一个酒馆聊天。",
  administrator_message_missing: "这条消息已不存在，请刷新记录。",
  administrator_history_conflict: "管理员记录已被其他操作更新，请重新打开核对，不会覆盖现有记录。",
  administrator_input_invalid: `请输入内容或选择图片，文字最多 ${D.maxInputChars} 字符。`,
  administrator_copy_failed: "复制失败，请检查浏览器剪贴板权限后重试。",
  administrator_invalid_image: t.invalidImage,
  administrator_image_missing: "附件读取失败，原消息与附件引用仍然保留，请重试。",
  administrator_image_delete_failed: "记录已保存，但附件删除失败，请再次确认清理。",
  administrator_image_list_failed: "附件目录读取失败，请再次确认清理。",
  administrator_save_pending: t.unsaved,
  administrator_save_failed: "保存失败。可检查结果、重新提交，或放弃未保存内容。",
  administrator_save_unconfirmed: t.unsaved,
  administrator_save_conflict: "服务器记录已更新，未覆盖它。可放弃本地未保存内容，保留服务器记录。",
  administrator_context_full: "本轮资料已超出应用输入预算，请缩小查阅范围后再继续。",
  administrator_summary_failed: "上下文整理失败，原记录未删除，可以重试。",
  administrator_model_refused: "模型没有接受本次请求，原消息和附件仍然保留。",
  administrator_empty_response: "模型未返回回复，可以重试。",
  administrator_tool_round_limit: "本轮已达到工具调用上限，请缩小任务范围。",
  administrator_tool_batch_too_large: "模型一次请求了过多工具，未执行这批操作。",
  administrator_evidence_expired: t.noEvidence,
  management_request_superseded: "记录已被后续修改取代。请说明当前希望怎样处理，不会恢复旧状态。",
  management_source_changed: "所依据的原文已经改变，需要重新查证。"
});
function K(i) {
  const v = i instanceof Error ? i.message : String(i);
  return Fe[v] ?? v.slice(0, 700);
}
var Ke = [
  "aria-label",
  "title",
  "aria-expanded"
], We = {
  key: 0,
  class: "admin-popover"
}, Ge = ["aria-label"], He = { class: "admin-context-total" }, Ye = /* @__PURE__ */ ne({
  __name: "AdministratorContext",
  props: {
    usage: {},
    draftTokens: {}
  },
  setup(i) {
    const v = i, e = g(!1), k = U(() => v.usage.used + v.draftTokens), p = (_) => `${(_ / 1e3).toFixed(1)}k`;
    return Oe(() => (e.value = !1, !0), () => e.value), (_, x) => (s(), u("div", {
      class: "admin-context",
      onKeydown: x[2] || (x[2] = oe(de((m) => e.value = !1, ["stop"]), ["esc"]))
    }, [n("button", {
      type: "button",
      class: ae(["admin-context-ring", { "is-warning": k.value >= i.usage.trigger }]),
      style: ze({ "--context-fill": `${Math.min(1, k.value / i.usage.limit) * 360}deg` }),
      "aria-label": a(t).context,
      title: a(t).context,
      "aria-expanded": e.value,
      onClick: x[0] || (x[0] = (m) => e.value = !e.value)
    }, [...x[3] || (x[3] = [n("span", null, null, -1)])], 14, Ke), e.value ? (s(), u("section", We, [
      n("header", null, [n("strong", null, r(a(t).context), 1), n("button", {
        type: "button",
        "aria-label": a(t).close,
        onClick: x[1] || (x[1] = (m) => e.value = !1)
      }, "×", 8, Ge)]),
      n("p", He, r(p(k.value)) + " / " + r(p(i.usage.limit)), 1),
      n("dl", null, [(s(!0), u(G, null, ie(a(t).contextParts, (m, f) => (s(), u(G, { key: f }, [n("dt", null, r(m), 1), n("dd", null, r(p(i.usage[f] + (f === "history" ? i.draftTokens : 0))), 1)], 64))), 128))]),
      n("small", null, r(a(t).budgetNote), 1)
    ])) : c("", !0)], 32));
  }
}), Qe = Ye, Je = ["aria-expanded"], Xe = {
  key: 1,
  class: "admin-process-body"
}, Ze = { key: 0 }, et = {
  key: 0,
  class: "admin-muted"
}, tt = {
  key: 1,
  class: "admin-error",
  role: "status"
}, at = /* @__PURE__ */ ne({
  __name: "AdministratorProcess",
  props: {
    row: {},
    live: {},
    unsaved: {},
    bridge: {},
    chatIdentity: {}
  },
  setup(i) {
    const v = i, e = g(!1), k = pe([]), p = g(!1), _ = g(""), x = U(() => v.live?.process ?? k.value), m = U(() => v.live?.process.length ?? v.unsaved?.length ?? v.row.processCount), f = U(() => !!v.live || e.value);
    let I = 0;
    async function B() {
      const T = ++I;
      if (_.value = "", p.value = !1, !f.value || v.live || !m.value) {
        k.value = [];
        return;
      }
      if (v.unsaved) {
        k.value = v.unsaved;
        return;
      }
      const { turnId: h, revision: y } = v.row, b = v.chatIdentity, L = () => T === I && b === v.chatIdentity && h === v.row.turnId && y === v.row.revision;
      p.value = !0;
      try {
        const P = await v.bridge.request("administrator/process", {
          chatIdentity: b,
          turnId: h,
          revision: y
        });
        L() && (k.value = P.result);
      } catch (P) {
        L() && (_.value = K(P));
      } finally {
        L() && (p.value = !1);
      }
    }
    return te([
      () => v.chatIdentity,
      () => v.row.id,
      () => v.row.revision,
      () => !!v.live,
      () => v.unsaved,
      e
    ], (T, h) => {
      (T[0] !== h[0] || T[1] !== h[1] || T[3] !== h[3]) && (e.value = !1), B();
    }, { immediate: !0 }), me(() => {
      I++;
    }), (T, h) => m.value ? (s(), u("section", {
      key: 0,
      class: ae(["admin-process", { "is-running": !!i.live }])
    }, [i.live ? c("", !0) : (s(), u("button", {
      key: 0,
      type: "button",
      class: "admin-process-toggle",
      "aria-expanded": f.value,
      onClick: h[0] || (h[0] = (y) => e.value = !e.value)
    }, [h[1] || (h[1] = n("svg", {
      viewBox: "0 0 16 16",
      "aria-hidden": "true"
    }, [n("path", { d: "m6 4 4 4-4 4" })], -1)), ue(r(a(t).process(m.value)), 1)], 8, Je)), f.value ? (s(), u("div", Xe, [
      (s(!0), u(G, null, ie(x.value, (y) => (s(), u("div", {
        key: y.index,
        class: "admin-process-round"
      }, [y.text ? (s(), ee(Te, {
        key: 0,
        class: "admin-markdown admin-process-narration",
        text: y.text
      }, null, 8, ["text"])) : c("", !0), (s(!0), u(G, null, ie(y.tools, (b) => (s(), u("div", {
        key: b.id,
        class: "admin-operation-line"
      }, [
        n("i", { class: ae(["admin-operation-dot", `is-${b.status}`]) }, null, 2),
        n("span", null, [ue(r(b.name), 1), b.target ? (s(), u("small", Ze, " · " + r(b.target), 1)) : c("", !0)]),
        n("small", null, r(b.status === "queued" ? a(t).queued : b.status === "not-executed" ? a(t).notExecuted : a(t).operations[b.status]), 1)
      ]))), 128))]))), 128)),
      p.value ? (s(), u("span", et, r(a(t).processLoading), 1)) : c("", !0),
      _.value ? (s(), u("p", tt, [ue(r(_.value), 1), n("button", {
        type: "button",
        onClick: B
      }, r(a(t).check), 1)])) : c("", !0)
    ])) : c("", !0)], 2)) : c("", !0);
  }
}), lt = at, it = ["data-phase"], nt = {
  role: "status",
  "aria-live": "polite"
}, st = ["datetime"], rt = /* @__PURE__ */ ne({
  __name: "AdministratorStatus",
  props: {
    phase: {},
    startedAt: {}
  },
  setup(i) {
    const v = i, e = g(Date.now()), k = U(() => Math.max(0, Math.floor((e.value - (v.startedAt ?? e.value)) / 1e3)));
    return te(() => v.startedAt, (p, _, x) => {
      if (e.value = Date.now(), p === void 0) return;
      const m = setInterval(() => {
        e.value = Date.now();
      }, 1e3);
      x(() => clearInterval(m));
    }, { immediate: !0 }), (p, _) => (s(), u("div", {
      class: "admin-live-status",
      "data-phase": i.phase
    }, [
      _[0] || (_[0] = n("span", {
        class: "admin-working-dot",
        "aria-hidden": "true"
      }, null, -1)),
      n("span", nt, r(a(t).phases[i.phase]), 1),
      i.startedAt !== void 0 ? (s(), u("time", {
        key: 0,
        datetime: `PT${k.value}S`
      }, r(a(t).elapsed(k.value)), 9, st)) : c("", !0)
    ], 8, it));
  }
}), Me = /* @__PURE__ */ Ne(rt, [["__scopeId", "data-v-8eac51f2"]]);
async function $e(i, v) {
  let e = v.text;
  const { turnId: k, role: p, revision: _, totalChars: x } = v.row;
  for (; e.length < Math.min(v.through, x); ) {
    const m = await i.request("administrator/text", {
      chatIdentity: v.chatIdentity,
      turnId: k,
      role: p,
      revision: _,
      offset: e.length
    });
    if (!v.current()) throw new Error("administrator_context_changed");
    e += m.result.text;
  }
  return e;
}
var ut = ["data-row-id"], ot = ["aria-label"], dt = ["src", "alt"], vt = [
  "maxlength",
  "aria-label",
  "disabled"
], ct = { class: "admin-message-actions" }, mt = ["disabled"], gt = ["disabled"], ft = ["aria-label"], yt = ["src", "alt"], pt = {
  key: 2,
  class: "admin-muted"
}, bt = {
  key: 0,
  class: "admin-muted"
}, ht = ["aria-label"], wt = ["disabled"], kt = {
  key: 5,
  class: "admin-error",
  role: "status"
}, xt = {
  key: 6,
  class: "admin-error",
  role: "status"
}, _t = ["aria-label"], $t = ["disabled"], It = ["disabled"], Ct = ["disabled"], At = ["disabled"], Tt = {
  key: 8,
  class: "admin-muted",
  role: "status"
}, Mt = /* @__PURE__ */ ne({
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
  setup(i, { emit: v }) {
    const e = i, k = v, p = g(!1), _ = g(e.row.text), x = g(!1), m = g(""), f = g(null), I = g(!1), B = g(!1), T = g(!1), h = g(""), y = g(null), b = g(!1), L = g(null);
    let P = 0, E = 0, S = _.value.length;
    const $ = U(() => e.live ? e.live.text : _.value), M = U(() => e.unsavedProcess?.length ?? e.row.processCount);
    function O(A) {
      A.target.closest("a, button, input, textarea, select") || (A instanceof KeyboardEvent && A.preventDefault(), p.value = !p.value);
    }
    te(() => [
      e.chatIdentity,
      e.row.id,
      e.row.revision
    ], (A, w) => {
      E++, x.value = !1, m.value = "", (A[0] !== w[0] || A[1] !== w[1]) && (S = e.row.text.length, y.value = null, p.value = !1), S <= e.row.text.length ? _.value = e.row.text : W(S, !0);
    }), te([
      p,
      () => e.chatIdentity,
      () => e.row.id,
      () => e.row.revision,
      () => !!e.live
    ], () => {
      q();
    }), te(f, (A) => {
      y.value && y.value.row.revision !== e.row.revision && A === y.value.text.trim() && (y.value = null, h.value = "");
    }), me(() => {
      E++, P++;
    });
    async function q() {
      const A = ++P;
      if (f.value = null, I.value = !1, T.value = !1, y.value || (h.value = ""), !p.value || e.live) return;
      const w = e.row, C = e.chatIdentity, H = () => A === P;
      I.value = !0;
      try {
        const F = await $e(e.bridge, {
          row: w,
          chatIdentity: C,
          text: w.text,
          through: w.totalChars,
          current: H
        });
        H() && (f.value = F);
      } catch (F) {
        H() && (h.value = K(F));
      } finally {
        H() && (I.value = !1);
      }
    }
    async function Z() {
      if (f.value === null || B.value) return;
      const A = P, w = document.activeElement;
      B.value = !0, T.value = !1, h.value = "";
      try {
        if (!await qe(f.value)) throw new Error("administrator_copy_failed");
        A === P && (T.value = !0);
      } catch (C) {
        A === P && (h.value = K(C));
      } finally {
        B.value = !1, w instanceof HTMLElement && w.isConnected && document.activeElement === document.body && w.focus({ preventScroll: !0 });
      }
    }
    async function J() {
      e.disabled || f.value === null || (y.value = {
        row: { ...e.row },
        text: f.value
      }, h.value = "", await ce(), L.value?.focus());
    }
    async function ge() {
      const A = y.value;
      if (!(!A || e.disabled || b.value)) {
        b.value = !0, h.value = "";
        try {
          await e.saveEdit(A.row, A.text), y.value === A && (y.value = null);
        } catch (w) {
          y.value === A && (h.value = K(w));
        } finally {
          b.value = !1;
        }
      }
    }
    async function W(A, w = !1) {
      if (x.value) return;
      S = Math.min(Math.max(S, A), e.row.totalChars);
      const C = ++E, { turnId: H, revision: F } = e.row, se = e.chatIdentity, X = () => C === E && se === e.chatIdentity && F === e.row.revision && H === e.row.turnId;
      x.value = !0, m.value = "";
      try {
        const Y = await $e(e.bridge, {
          chatIdentity: se,
          row: e.row,
          text: w ? e.row.text : _.value,
          through: S,
          current: X
        });
        X() && (_.value = Y);
      } catch (Y) {
        X() && (w && (_.value = e.row.text), m.value = K(Y));
      } finally {
        X() && (x.value = !1);
      }
    }
    return (A, w) => (s(), u("article", {
      class: ae(["admin-message", `is-${i.row.role}`]),
      "data-row-id": i.row.id
    }, [
      i.row.role === "assistant" ? (s(), ee(lt, {
        key: 0,
        row: i.row,
        live: i.live,
        unsaved: i.unsavedProcess,
        bridge: i.bridge,
        "chat-identity": i.chatIdentity
      }, null, 8, [
        "row",
        "live",
        "unsaved",
        "bridge",
        "chat-identity"
      ])) : c("", !0),
      y.value ? (s(), u("form", {
        key: 1,
        class: "admin-message-editor",
        "aria-label": a(t).editMessage,
        onSubmit: de(ge, ["prevent"])
      }, [
        i.row.image ? (s(), u("img", {
          key: 0,
          src: i.row.image.path,
          alt: i.row.image.name,
          class: "admin-message-image"
        }, null, 8, dt)) : c("", !0),
        Ie(n("textarea", {
          ref_key: "editor",
          ref: L,
          "onUpdate:modelValue": w[0] || (w[0] = (C) => y.value.text = C),
          rows: "3",
          maxlength: a(D).maxInputChars,
          "aria-label": a(t).editMessage,
          enterkeyhint: "enter",
          disabled: b.value
        }, null, 8, vt), [[Ae, y.value.text]]),
        n("div", ct, [n("button", {
          type: "button",
          "data-action": "cancel-edit",
          disabled: b.value,
          onClick: w[1] || (w[1] = (C) => {
            y.value = null, h.value = "";
          })
        }, r(a(t).cancel), 9, mt), n("button", {
          type: "submit",
          "data-action": "save-edit",
          disabled: i.disabled || b.value || !y.value.text.trim() && !i.row.image
        }, r(b.value ? a(t).saving : a(t).save), 9, gt)])
      ], 40, ot)) : $.value || i.row.image || !i.live && !M.value ? (s(), u("div", {
        key: 2,
        class: "admin-bubble",
        tabindex: "0",
        role: "group",
        "aria-label": a(t).messageActions,
        onClick: O,
        onKeydown: [
          oe(O, ["enter"]),
          oe(O, ["space"]),
          w[2] || (w[2] = oe(de((C) => p.value = !1, ["stop"]), ["esc"]))
        ]
      }, [
        i.row.image ? (s(), u("img", {
          key: 0,
          src: i.row.image.path,
          alt: i.row.image.name,
          loading: "lazy",
          class: "admin-message-image"
        }, null, 8, yt)) : c("", !0),
        $.value ? (s(), ee(Te, {
          key: 1,
          class: "admin-markdown",
          text: $.value
        }, null, 8, ["text"])) : c("", !0),
        !$.value && !i.row.image ? (s(), u("span", pt, r(i.row.error || a(t).noReply), 1)) : c("", !0)
      ], 40, ft)) : c("", !0),
      i.live ? (s(), u(G, { key: 3 }, [
        (s(!0), u(G, null, ie(i.live.preview, (C) => (s(), u("div", {
          key: C.id,
          class: "admin-operation-line"
        }, [
          n("i", { class: ae(["admin-operation-dot", `is-${C.status}`]) }, null, 2),
          n("span", null, r(C.name), 1),
          n("small", null, r(a(t).operations[C.status]), 1)
        ]))), 128)),
        i.live.totalChars > a(D).textBlock ? (s(), u("small", bt, r(a(t).longReply), 1)) : c("", !0),
        ye(Me, {
          phase: i.live.phase,
          "started-at": i.live.startedAt
        }, null, 8, ["phase", "started-at"])
      ], 64)) : c("", !0),
      !i.live && !y.value && i.row.totalChars > _.value.length ? (s(), u("nav", {
        key: 4,
        class: "admin-pager",
        "aria-label": a(t).messagePages
      }, [n("button", {
        type: "button",
        disabled: x.value,
        onClick: w[3] || (w[3] = (C) => W(_.value.length + a(D).textBlock))
      }, r(a(t).moreText), 9, wt)], 8, ht)) : c("", !0),
      i.row.error || m.value ? (s(), u("p", kt, r(m.value || i.row.error), 1)) : c("", !0),
      h.value ? (s(), u("p", xt, [ue(r(h.value), 1), f.value === null && !I.value ? (s(), u("button", {
        key: 0,
        type: "button",
        onClick: q
      }, r(a(t).retry), 1)) : c("", !0)])) : c("", !0),
      !y.value && (p.value || !i.live && M.value && !$.value) ? (s(), u("nav", {
        key: 7,
        class: "admin-message-actions",
        "aria-label": a(t).messageActions
      }, [
        !i.live && i.row.totalChars ? (s(), u("button", {
          key: 0,
          type: "button",
          "data-action": "copy",
          disabled: f.value === null || B.value,
          onClick: Z
        }, r(T.value ? a(t).copied : a(t).copy), 9, $t)) : c("", !0),
        i.row.role === "user" ? (s(), u("button", {
          key: 1,
          type: "button",
          "data-action": "edit",
          disabled: i.disabled || f.value === null,
          onClick: J
        }, r(a(t).edit), 9, It)) : c("", !0),
        n("button", {
          type: "button",
          disabled: i.disabled,
          onClick: w[4] || (w[4] = (C) => k("delete", i.row))
        }, r(a(t).delete), 9, Ct),
        i.row.canRegenerate ? (s(), u("button", {
          key: 2,
          type: "button",
          disabled: i.disabled,
          onClick: w[5] || (w[5] = (C) => k("regenerate", i.row))
        }, r(a(t).regenerate), 9, At)) : c("", !0),
        M.value ? (s(), u("button", {
          key: 3,
          type: "button",
          onClick: w[6] || (w[6] = (C) => k("details", i.row))
        }, r(a(t).evidence), 1)) : c("", !0)
      ], 8, _t)) : c("", !0),
      I.value ? (s(), u("small", Tt, r(a(t).loadingText), 1)) : c("", !0)
    ], 10, ut));
  }
}), St = Mt, Rt = [
  "role",
  "aria-modal",
  "aria-label",
  "onKeydown"
], Pt = ["aria-label"], Et = { class: "admin-details-body" }, Bt = { class: "admin-evidence" }, qt = ["disabled"], zt = { class: "admin-operations" }, Dt = { key: 0 }, Ot = { class: "admin-muted" }, Lt = ["disabled", "onClick"], Nt = { class: "admin-pager" }, Vt = ["disabled"], jt = ["disabled"], Ut = {
  key: 2,
  class: "admin-error",
  role: "status"
}, Ft = /* @__PURE__ */ ne({
  __name: "AdministratorDetails",
  props: {
    bridge: {},
    chatIdentity: {},
    turnId: {}
  },
  emits: ["close"],
  setup(i, { emit: v }) {
    const e = i, k = v, p = g([]), _ = g(0), x = g(0), m = g(""), f = g(!1), I = g(null), B = g(""), T = g(null), h = g(!0);
    let y;
    function b() {
      ce(() => T.value?.focus({ preventScroll: !0 }));
    }
    function L() {
      I.value ? (I.value = null, b()) : k("close");
    }
    De(T, L, () => h.value);
    async function P(S) {
      f.value = !0, m.value = "", I.value = null;
      try {
        const $ = await e.bridge.request("administrator/operations", {
          chatIdentity: e.chatIdentity,
          turnId: e.turnId,
          offset: S
        });
        p.value = $.result.items, x.value = $.result.total, _.value = $.result.offset;
      } catch ($) {
        m.value = K($);
      } finally {
        f.value = !1;
      }
    }
    async function E(S, $ = 0) {
      f.value = !0, m.value = "";
      try {
        I.value = (await e.bridge.request("administrator/evidence", {
          chatIdentity: e.chatIdentity,
          reference: S,
          offset: $
        })).result, B.value = S, b();
      } catch (M) {
        m.value = K(M);
      } finally {
        f.value = !1;
      }
    }
    return Ce(() => {
      const S = T.value.closest(".administrator-app"), $ = () => {
        h.value = getComputedStyle(S).getPropertyValue("--admin-details-docked").trim() !== "1";
      };
      $(), y = new ResizeObserver($), y.observe(S), b(), P(0);
    }), me(() => y?.disconnect()), (S, $) => (s(), u("section", {
      ref_key: "layer",
      ref: T,
      class: "admin-details",
      role: h.value ? "dialog" : "region",
      "aria-modal": h.value ? !0 : void 0,
      tabindex: "-1",
      "aria-label": a(t).details,
      onKeydown: oe(de(L, ["stop", "prevent"]), ["esc"])
    }, [n("header", null, [n("strong", null, r(a(t).details), 1), n("button", {
      type: "button",
      "aria-label": a(t).close,
      onClick: $[0] || ($[0] = (M) => k("close"))
    }, "×", 8, Pt)]), n("div", Et, [I.value ? (s(), u(G, { key: 0 }, [
      n("button", {
        type: "button",
        class: "admin-text-button",
        onClick: L
      }, "‹ " + r(a(t).details), 1),
      n("pre", Bt, r(I.value.text), 1),
      I.value.nextOffset !== null ? (s(), u("button", {
        key: 0,
        type: "button",
        disabled: f.value,
        onClick: $[1] || ($[1] = (M) => E(B.value, I.value.nextOffset))
      }, r(a(t).moreText), 9, qt)) : c("", !0)
    ], 64)) : (s(), u(G, { key: 1 }, [n("ol", zt, [(s(!0), u(G, null, ie(p.value, (M) => (s(), u("li", { key: M.id }, [
      n("div", null, [
        n("i", { class: ae(["admin-operation-dot", `is-${M.status}`]) }, null, 2),
        n("strong", null, r(M.name), 1),
        n("span", null, r(a(t).operations[M.status]), 1),
        n("small", null, r((M.elapsedMs / 1e3).toFixed(1)) + "s", 1)
      ]),
      M.target ? (s(), u("p", Dt, r(M.target), 1)) : c("", !0),
      n("p", Ot, r(M.summary), 1),
      n("button", {
        type: "button",
        class: "admin-text-button",
        disabled: f.value,
        onClick: (O) => E(M.id)
      }, r(a(t).evidence), 9, Lt)
    ]))), 128))]), n("nav", Nt, [n("button", {
      type: "button",
      disabled: !_.value || f.value,
      onClick: $[2] || ($[2] = (M) => P(Math.max(0, _.value - a(D).pageSize)))
    }, r(a(t).earlier), 9, Vt), n("button", {
      type: "button",
      disabled: _.value + p.value.length >= x.value || f.value,
      onClick: $[3] || ($[3] = (M) => P(_.value + p.value.length))
    }, r(a(t).later), 9, jt)])], 64)), m.value ? (s(), u("p", Ut, r(m.value), 1)) : c("", !0)])], 40, Rt));
  }
}), Kt = Ft, Wt = { class: "admin-header" }, Gt = [
  "title",
  "aria-label",
  "disabled"
], Ht = {
  key: 0,
  class: "admin-notice",
  role: "alert"
}, Yt = ["disabled"], Qt = ["disabled"], Jt = {
  key: 1,
  class: "admin-empty"
}, Xt = {
  key: 2,
  class: "admin-live"
}, Zt = ["disabled"], ea = {
  key: 2,
  class: "admin-notice",
  role: "status"
}, ta = ["disabled"], aa = ["disabled"], la = ["disabled"], ia = {
  key: 3,
  class: "admin-attachment"
}, na = ["src", "alt"], sa = ["aria-label", "disabled"], ra = ["accept"], ua = [
  "disabled",
  "aria-label",
  "title"
], oa = [
  "maxlength",
  "placeholder",
  "aria-label",
  "disabled"
], da = [
  "disabled",
  "aria-label",
  "title"
], va = [
  "disabled",
  "aria-label",
  "title"
], ca = { class: "admin-dialog-actions" }, ma = ["disabled"], ga = { class: "admin-dialog-actions" }, fa = ["disabled"], ya = /* @__PURE__ */ ne({
  __name: "AdministratorApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(i) {
    const v = i, e = pe(structuredClone(ke(v.initialState))), k = pe(e.value.page.rows), p = g(e.value.page.start), _ = g(e.value.page.total), x = g(""), m = g(null), f = g(""), I = g(""), B = g(!1), T = g(!1), h = g(null), y = g(null), b = g(null), L = g(null), P = g(null), E = g(!0), S = g(!1), $ = g(0);
    let M = 0, O = null;
    te([x, m], () => {
      M++;
    }, { flush: "sync" });
    const q = U(() => !!I.value || !!e.value.live), Z = U(() => e.value.live?.phase ?? (["send", "regenerate"].includes(I.value) ? "preparing" : null)), J = U(() => q.value || e.value.unsaved || e.value.corrupted), ge = U(() => k.value.some((o) => o.role === "assistant" && o.turnId === e.value.live?.turnId)), W = U(() => p.value + k.value.length >= _.value);
    let A = () => {
    }, w, C = 0;
    const H = () => ({ chatIdentity: e.value.chatIdentity });
    async function F(o, l = {}) {
      return (await v.bridge.request(`administrator/${o}`, {
        ...H(),
        ...l
      }, 6e4)).result;
    }
    function se() {
      const o = b.value, l = o && [...o.querySelectorAll("[data-row-id]")].find((d) => d.getBoundingClientRect().bottom > o.getBoundingClientRect().top);
      return l ? {
        id: l.dataset.rowId,
        top: l.getBoundingClientRect().top
      } : null;
    }
    async function X(o) {
      await ce();
      const l = b.value && [...b.value.querySelectorAll("[data-row-id]")].find((d) => d.dataset.rowId === o?.id);
      o && l && b.value && (b.value.scrollTop += l.getBoundingClientRect().top - o.top);
    }
    async function Y() {
      await ce(), b.value && (b.value.scrollTop = b.value.scrollHeight);
    }
    function ve(o) {
      const l = se(), d = W.value, z = e.value;
      if (e.value = o, _.value = o.page.total, z.chatIdentity !== o.chatIdentity) {
        C++, k.value = o.page.rows, p.value = o.page.start, x.value = "", m.value = null, y.value = null, O = null;
        return;
      }
      if (o.page.revision !== z.page.revision) {
        const N = Math.max(D.pageSize, k.value.length), V = d && E.value ? Math.max(0, o.page.total - N) : Math.min(p.value, Math.max(0, o.page.total - N));
        V === o.page.start && N === D.pageSize ? (k.value = o.page.rows, p.value = V, E.value || X(l)) : Se(V, N, l);
      }
      O && o.submission?.id === O.id && o.submission.accepted && (O.revision === M && (x.value = "", m.value = null), O = null), E.value && W.value && Y();
    }
    async function Se(o, l, d) {
      const z = ++C, N = e.value.chatIdentity, V = e.value.page.revision, R = () => z === C && N === e.value.chatIdentity && V === e.value.page.revision;
      try {
        const j = [];
        for (let Q = o; Q < Math.min(_.value, o + l); Q += D.pageSize) {
          const re = await F("page", {
            start: Q,
            revision: V
          });
          if (!R()) return;
          j.push(...re.rows);
        }
        if (!R()) return;
        k.value = j, p.value = o, E.value && W.value ? await Y() : await X(d);
      } catch (j) {
        R() && (f.value = K(j));
      }
    }
    async function fe(o, l) {
      if (B.value) return;
      const d = ++C;
      B.value = !0, f.value = "";
      const z = se(), N = e.value.chatIdentity, V = e.value.page.revision;
      try {
        const R = await F("page", {
          start: o,
          revision: e.value.page.revision
        });
        if (d !== C || N !== e.value.chatIdentity || V !== e.value.page.revision) return;
        const j = k.value.filter((Q) => Q.revision === V);
        l === "earlier" ? (k.value = [...R.rows, ...j.filter((Q) => !R.rows.some((re) => re.id === Q.id))].slice(0, D.windowSize), p.value = R.start) : l === "later" ? (k.value = [...j.filter((Q) => !R.rows.some((re) => re.id === Q.id)), ...R.rows].slice(-D.windowSize), p.value = R.start + R.rows.length - k.value.length) : (k.value = R.rows, p.value = R.start), _.value = R.total, await X(z);
      } catch (R) {
        d === C && N === e.value.chatIdentity && V === e.value.page.revision && (f.value = K(R));
      } finally {
        B.value = !1;
      }
    }
    async function be() {
      await fe(Math.max(0, _.value - D.pageSize), "replace"), E.value = !0, await Y();
    }
    async function he() {
      if (!(J.value || !x.value.trim() && !m.value)) {
        I.value = "send", f.value = "", E.value = !0;
        try {
          O = {
            id: Ue(),
            revision: M
          }, ve((await F("send", {
            submissionId: O.id,
            text: x.value,
            ...m.value ? { image: ke(m.value) } : {}
          })).state), await be();
        } catch (o) {
          f.value = K(o);
        } finally {
          I.value = "";
        }
      }
    }
    async function le(o, l = {}) {
      if (!q.value) {
        I.value = o, f.value = "";
        try {
          ve(await F(o, l)), T.value = !1, h.value = null, o === "adopt" && (O = null), o === "clear" && (x.value = "", m.value = null, O = null, y.value = null);
        } catch (d) {
          f.value = K(d);
        } finally {
          I.value = "";
        }
      }
    }
    async function Re(o, l) {
      if (J.value) throw new Error("administrator_busy");
      I.value = "edit", f.value = "";
      try {
        ve(await F("edit", {
          turnId: o.turnId,
          revision: o.revision,
          text: l
        }));
      } finally {
        I.value = "";
      }
    }
    async function Pe(o) {
      const l = o.target, d = l.files?.[0];
      if (l.value = "", !!d) {
        if (f.value = "", d.size > D.maxImageBytes || !_e.includes(d.type)) {
          f.value = t.invalidImage;
          return;
        }
        try {
          const z = await new Promise((V, R) => {
            const j = new FileReader();
            j.onload = () => V(String(j.result)), j.onerror = () => R(new Error(t.invalidImage)), j.readAsDataURL(d);
          }), N = new Image();
          N.src = z, await N.decode(), m.value = {
            name: d.name.slice(0, 120),
            dataUrl: z
          }, P.value?.focus();
        } catch {
          f.value = t.invalidImage;
        }
      }
    }
    function Ee(o) {
      je(o, S.value) && (o.preventDefault(), q.value || he());
    }
    function Be() {
      b.value && (E.value = b.value.scrollHeight - b.value.scrollTop - b.value.clientHeight < 48);
    }
    return te([x, m], () => {
      w && clearTimeout(w), w = setTimeout(() => {
        $.value = Ve(x.value) + (m.value ? D.imageTokens : 0);
      }, 160);
    }), Ce(() => {
      A = v.bridge.subscribe((o) => {
        o.type === "administrator/state" && ve(o.payload.state), o.type === "administrator/live" && (e.value = {
          ...e.value,
          ...o.payload
        }, E.value && W.value && Y());
      }), Y();
    }), me(() => {
      C++, A(), w && clearTimeout(w);
    }), (o, l) => (s(), u("div", { class: ae(["administrator-app", { "has-details": !!y.value }]) }, [
      n("header", Wt, [
        n("h1", null, r(a(t).title), 1),
        ye(Qe, {
          usage: e.value.context,
          "draft-tokens": e.value.live ? 0 : $.value
        }, null, 8, ["usage", "draft-tokens"]),
        n("button", {
          type: "button",
          class: "admin-icon-button",
          title: a(t).clear,
          "aria-label": a(t).clear,
          disabled: q.value || e.value.unsaved,
          onClick: l[0] || (l[0] = (d) => T.value = !0)
        }, [...l[23] || (l[23] = [n("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [n("path", { d: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" })], -1)])], 8, Gt)
      ]),
      e.value.corrupted ? (s(), u("div", Ht, [ue(r(a(t).corrupted), 1), n("button", {
        type: "button",
        disabled: q.value,
        onClick: l[1] || (l[1] = (d) => T.value = !0)
      }, r(a(t).clear), 9, Yt)])) : c("", !0),
      n("div", {
        ref_key: "list",
        ref: b,
        class: "admin-conversation",
        onScrollPassive: Be
      }, [
        p.value > 0 ? (s(), u("button", {
          key: 0,
          type: "button",
          class: "admin-history-button",
          disabled: B.value,
          onClick: l[2] || (l[2] = (d) => fe(Math.max(0, p.value - a(D).pageSize), "earlier"))
        }, r(a(t).earlier), 9, Qt)) : c("", !0),
        !k.value.length && !Z.value && !e.value.corrupted ? (s(), u("p", Jt, r(a(t).empty), 1)) : c("", !0),
        (s(!0), u(G, null, ie(k.value, (d) => (s(), ee(St, {
          key: d.id,
          row: d,
          live: d.role === "assistant" && d.turnId === e.value.live?.turnId ? e.value.live : null,
          bridge: i.bridge,
          "chat-identity": e.value.chatIdentity,
          disabled: J.value,
          "unsaved-process": d.role === "assistant" && d.turnId === e.value.unsavedProcess?.turnId ? e.value.unsavedProcess.rounds : null,
          "save-edit": Re,
          onDelete: l[3] || (l[3] = (z) => h.value = z),
          onRegenerate: l[4] || (l[4] = (z) => le("regenerate", { turnId: z.turnId })),
          onDetails: l[5] || (l[5] = (z) => y.value = z.turnId)
        }, null, 8, [
          "row",
          "live",
          "bridge",
          "chat-identity",
          "disabled",
          "unsaved-process"
        ]))), 128)),
        Z.value && W.value && !ge.value ? (s(), u("div", Xt, [ye(Me, {
          phase: Z.value,
          "started-at": e.value.live?.startedAt
        }, null, 8, ["phase", "started-at"])])) : c("", !0),
        W.value ? c("", !0) : (s(), u("button", {
          key: 3,
          type: "button",
          class: "admin-history-button",
          disabled: B.value,
          onClick: l[6] || (l[6] = (d) => fe(p.value + k.value.length, "later"))
        }, r(a(t).later), 9, Zt))
      ], 544),
      !W.value || !E.value ? (s(), u("button", {
        key: 1,
        type: "button",
        class: "admin-latest",
        onClick: be
      }, "↓ " + r(a(t).latest), 1)) : c("", !0),
      f.value || e.value.error || e.value.unsaved ? (s(), u("div", ea, [
        n("span", null, r(f.value || (e.value.unsaved ? a(t).unsaved : e.value.error)), 1),
        e.value.unsaved ? (s(), u("button", {
          key: 0,
          type: "button",
          disabled: q.value,
          onClick: l[7] || (l[7] = (d) => le("check"))
        }, r(a(t).check), 9, ta)) : c("", !0),
        e.value.unsaved ? (s(), u("button", {
          key: 1,
          type: "button",
          disabled: q.value,
          onClick: l[8] || (l[8] = (d) => le("confirm"))
        }, r(a(t).confirm), 9, aa)) : c("", !0),
        e.value.conflict || e.value.unsaved ? (s(), u("button", {
          key: 2,
          type: "button",
          disabled: q.value,
          onClick: l[9] || (l[9] = (d) => le("adopt"))
        }, r(a(t).adopt), 9, la)) : c("", !0)
      ])) : c("", !0),
      m.value ? (s(), u("div", ia, [
        n("img", {
          src: m.value.dataUrl,
          alt: m.value.name
        }, null, 8, na),
        n("span", null, r(m.value.name), 1),
        n("button", {
          type: "button",
          "aria-label": a(t).removeImage,
          disabled: q.value,
          onClick: l[10] || (l[10] = (d) => m.value = null)
        }, "×", 8, sa)
      ])) : c("", !0),
      n("form", {
        class: "admin-composer",
        onSubmit: de(he, ["prevent"])
      }, [
        n("input", {
          ref_key: "file",
          ref: L,
          type: "file",
          accept: a(_e).join(","),
          hidden: "",
          onChange: Pe
        }, null, 40, ra),
        n("button", {
          type: "button",
          class: "admin-icon-button",
          disabled: J.value,
          "aria-label": a(t).attach,
          title: a(t).attach,
          onClick: l[11] || (l[11] = (d) => L.value?.click())
        }, [...l[24] || (l[24] = [n("svg", {
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
        ], -1)])], 8, ua),
        Ie(n("textarea", {
          ref_key: "composer",
          ref: P,
          "onUpdate:modelValue": l[12] || (l[12] = (d) => x.value = d),
          rows: "1",
          maxlength: a(D).maxInputChars,
          enterkeyhint: "enter",
          placeholder: a(t).placeholder,
          "aria-label": a(t).placeholder,
          disabled: e.value.corrupted || q.value,
          onKeydown: Ee,
          onCompositionstart: l[13] || (l[13] = (d) => S.value = !0),
          onCompositionend: l[14] || (l[14] = (d) => S.value = !1)
        }, null, 40, oa), [[Ae, x.value]]),
        Z.value ? (s(), u("button", {
          key: 0,
          type: "button",
          class: "admin-send",
          disabled: Z.value === "stopping",
          "aria-label": a(t).stop,
          title: a(t).stop,
          onClick: l[15] || (l[15] = (d) => v.bridge.post("administrator/stop", H()))
        }, [...l[25] || (l[25] = [n("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [n("rect", {
          x: "6",
          y: "6",
          width: "12",
          height: "12",
          rx: "2"
        })], -1)])], 8, da)) : (s(), u("button", {
          key: 1,
          type: "submit",
          class: "admin-send",
          disabled: J.value || !x.value.trim() && !m.value,
          "aria-label": a(t).send,
          title: a(t).send
        }, [...l[26] || (l[26] = [n("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [n("path", { d: "M12 19V5m-6 6 6-6 6 6" })], -1)])], 8, va))
      ], 32),
      y.value ? (s(), ee(Kt, {
        key: y.value,
        bridge: i.bridge,
        "chat-identity": e.value.chatIdentity,
        "turn-id": y.value,
        onClose: l[16] || (l[16] = (d) => y.value = null)
      }, null, 8, [
        "bridge",
        "chat-identity",
        "turn-id"
      ])) : c("", !0),
      T.value ? (s(), ee(xe, {
        key: 5,
        class: "admin-dialog",
        "aria-label": a(t).clearTitle,
        busy: q.value,
        onClose: l[19] || (l[19] = (d) => T.value = !1)
      }, {
        default: we(() => [
          n("h2", null, r(a(t).clearTitle), 1),
          n("p", null, r(a(t).clearWarning), 1),
          n("div", ca, [n("button", {
            type: "button",
            onClick: l[17] || (l[17] = (d) => T.value = !1)
          }, r(a(t).cancel), 1), n("button", {
            type: "button",
            disabled: q.value,
            onClick: l[18] || (l[18] = (d) => le("clear"))
          }, r(a(t).clear), 9, ma)])
        ]),
        _: 1
      }, 8, ["aria-label", "busy"])) : c("", !0),
      h.value ? (s(), ee(xe, {
        key: 6,
        class: "admin-dialog",
        "aria-label": a(t).delete,
        busy: q.value,
        onClose: l[22] || (l[22] = (d) => h.value = null)
      }, {
        default: we(() => [
          n("h2", null, r(a(t).delete), 1),
          n("p", null, r(a(t).deleteWarning), 1),
          n("div", ga, [n("button", {
            type: "button",
            onClick: l[20] || (l[20] = (d) => h.value = null)
          }, r(a(t).cancel), 1), n("button", {
            type: "button",
            disabled: J.value,
            onClick: l[21] || (l[21] = (d) => le("delete", {
              turnId: h.value.turnId,
              role: h.value.role,
              revision: e.value.page.revision
            }))
          }, r(a(t).delete), 9, fa)])
        ]),
        _: 1
      }, 8, ["aria-label", "busy"])) : c("", !0)
    ], 2));
  }
}), $a = ya;
export {
  $a as default
};
