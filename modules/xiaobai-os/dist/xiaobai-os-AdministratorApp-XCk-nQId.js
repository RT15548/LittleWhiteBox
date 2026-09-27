/* eslint-disable */
import { $ as Q, E as de, F as r, G as Re, H as ne, L as J, M as _e, O as ce, Q as i, W as be, X as ve, Y as y, Z as he, _ as o, b as Me, c as ae, et as Se, g as m, h as W, l as se, m as a, o as Pe, p as D, tt as s, u as L, x as le, y as Y } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { t as Be } from "./xiaobai-os-descriptor-DmDuv1pM.js";
import { n as qe, r as ze } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
import { t as Oe } from "./xiaobai-os-context-tokens-bfmDTbG3.js";
import { t as we } from "./xiaobai-os-AppDialog-CaAiivYL.js";
import { t as xe } from "./xiaobai-os-MessageMarkdown-CaSkkvsl.js";
var E = Object.freeze({
  inputBudget: 158e3,
  summaryTrigger: 128e3,
  summaryOutput: 4e3,
  imageTokens: 6e3,
  pageSize: 20,
  windowSize: 60,
  textBlock: 4e3,
  streamInterval: 100,
  maxImageBytes: 4 * 1024 * 1024,
  maxToolRounds: 32,
  evidenceChars: 1e6,
  chatReadFloors: 20,
  chatSearchMatches: 20,
  chatQueryChars: 200
}), ke = Object.freeze([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
]);
function Ee() {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (n) => n.toString(16).padStart(2, "0")).join("");
}
var l = Object.freeze({
  title: Be.name,
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
  process: (n) => `工作经过 · ${n} 轮`,
  processLoading: "加载经过",
  queued: "等待执行",
  notExecuted: "未执行",
  evidence: "查看资料",
  inspect: "检查 OS 状态",
  loadTools: "加载工具",
  toolsLoaded: "工具已就绪",
  itemReport: (n, g) => `成功 ${n} 项，未完成 ${g} 项`,
  messageActions: "消息操作",
  messagePages: "展开消息",
  noReply: "尚未回复",
  longReply: "回复结束后可展开完整内容。",
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
    replying: "回复中",
    summarizing: "整理上下文",
    saving: "保存中",
    stopping: "正在停止"
  },
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
}), De = Object.freeze({
  administrator_stopped: l.stopped,
  administrator_busy: "当前操作尚未结束，请先等待或停止。",
  administrator_context_changed: "聊天已切换，旧操作已停止。",
  administrator_environment_unavailable: "OS 状态读取失败，未能确认当前运行情况。",
  administrator_chat_unavailable: "请先进入一个酒馆聊天。",
  administrator_message_missing: "这条消息已不存在，请刷新记录。",
  administrator_history_conflict: "管理员记录已被其他操作更新，请重新打开核对，不会覆盖现有记录。",
  administrator_input_invalid: "请输入内容或选择图片，文字最多 16000 字符。",
  administrator_invalid_image: l.invalidImage,
  administrator_image_missing: "附件读取失败，原消息与附件引用仍然保留，请重试。",
  administrator_image_delete_failed: "记录已保存，但附件删除失败，请再次确认清理。",
  administrator_image_list_failed: "附件目录读取失败，请再次确认清理。",
  administrator_save_pending: l.unsaved,
  administrator_save_failed: "保存失败。可检查结果、重新提交，或放弃未保存内容。",
  administrator_save_unconfirmed: l.unsaved,
  administrator_save_conflict: "服务器记录已更新，未覆盖它。可放弃本地未保存内容，保留服务器记录。",
  administrator_context_full: "本轮资料已超出应用输入预算，请缩小查阅范围后再继续。",
  administrator_summary_failed: "上下文整理失败，原记录未删除，可以重试。",
  administrator_model_refused: "模型没有接受本次请求，原消息和附件仍然保留。",
  administrator_empty_response: "模型未返回回复，可以重试。",
  administrator_tool_round_limit: "本轮已达到工具调用上限，请缩小任务范围。",
  administrator_tool_batch_too_large: "模型一次请求了过多工具，未执行这批操作。",
  administrator_evidence_expired: l.noEvidence,
  management_request_superseded: "记录已被后续修改取代。请说明当前希望怎样处理，不会恢复旧状态。",
  management_source_changed: "所依据的原文已经改变，需要重新查证。"
});
function j(n) {
  const g = n instanceof Error ? n.message : String(n);
  return De[g] ?? g.slice(0, 700);
}
var Le = [
  "aria-label",
  "title",
  "aria-expanded"
], Ne = {
  key: 0,
  class: "admin-popover"
}, je = ["aria-label"], Ke = { class: "admin-context-total" }, Ve = /* @__PURE__ */ le({
  __name: "AdministratorContext",
  props: {
    usage: {},
    draftTokens: {}
  },
  setup(n) {
    const g = n, e = y(!1), b = D(() => g.usage.used + g.draftTokens), h = (k) => `${(k / 1e3).toFixed(1)}k`;
    return qe(() => (e.value = !1, !0), () => e.value), (k, f) => (r(), o("div", {
      class: "admin-context",
      onKeydown: f[2] || (f[2] = ae(se((c) => e.value = !1, ["stop"]), ["esc"]))
    }, [a("button", {
      type: "button",
      class: Q(["admin-context-ring", { "is-warning": b.value >= n.usage.trigger }]),
      style: Se({ "--context-fill": `${Math.min(1, b.value / n.usage.limit) * 360}deg` }),
      "aria-label": i(l).context,
      title: i(l).context,
      "aria-expanded": e.value,
      onClick: f[0] || (f[0] = (c) => e.value = !e.value)
    }, [...f[3] || (f[3] = [a("span", null, null, -1)])], 14, Le), e.value ? (r(), o("section", Ne, [
      a("header", null, [a("strong", null, s(i(l).context), 1), a("button", {
        type: "button",
        "aria-label": i(l).close,
        onClick: f[1] || (f[1] = (c) => e.value = !1)
      }, "×", 8, je)]),
      a("p", Ke, s(h(b.value)) + " / " + s(h(n.usage.limit)), 1),
      a("dl", null, [(r(!0), o(L, null, J(i(l).contextParts, (c, p) => (r(), o(L, { key: p }, [a("dt", null, s(c), 1), a("dd", null, s(h(n.usage[p] + (p === "history" ? n.draftTokens : 0))), 1)], 64))), 128))]),
      a("small", null, s(i(l).budgetNote), 1)
    ])) : m("", !0)], 32));
  }
}), Fe = Ve, We = ["aria-expanded"], Ue = { "aria-hidden": "true" }, Ge = {
  key: 1,
  class: "admin-process-body"
}, He = { key: 0 }, Ye = {
  key: 0,
  class: "admin-muted"
}, Qe = {
  key: 1,
  class: "admin-error",
  role: "status"
}, Je = /* @__PURE__ */ le({
  __name: "AdministratorProcess",
  props: {
    row: {},
    live: {},
    unsaved: {},
    bridge: {},
    chatIdentity: {}
  },
  setup(n) {
    const g = n, e = y(!1), b = ve([]), h = y(!1), k = y(""), f = D(() => g.live?.process ?? b.value), c = D(() => g.live?.process.length ?? g.unsaved?.length ?? g.row.processCount), p = D(() => !!g.live || e.value);
    let x = 0;
    async function S() {
      const A = ++x;
      if (k.value = "", h.value = !1, !p.value || g.live || !c.value) {
        b.value = [];
        return;
      }
      if (g.unsaved) {
        b.value = g.unsaved;
        return;
      }
      const { turnId: $, revision: C } = g.row, v = g.chatIdentity, _ = () => A === x && v === g.chatIdentity && $ === g.row.turnId && C === g.row.revision;
      h.value = !0;
      try {
        const I = await g.bridge.request("administrator/process", {
          chatIdentity: v,
          turnId: $,
          revision: C
        });
        _() && (b.value = I.result);
      } catch (I) {
        _() && (k.value = j(I));
      } finally {
        _() && (h.value = !1);
      }
    }
    return ne([
      () => g.chatIdentity,
      () => g.row.id,
      () => g.row.revision,
      () => !!g.live,
      () => g.unsaved,
      e
    ], (A, $) => {
      (A[0] !== $[0] || A[1] !== $[1] || A[3] !== $[3]) && (e.value = !1), S();
    }, { immediate: !0 }), ce(() => {
      x++;
    }), (A, $) => c.value ? (r(), o("section", {
      key: 0,
      class: Q(["admin-process", { "is-running": !!n.live }])
    }, [n.live ? m("", !0) : (r(), o("button", {
      key: 0,
      type: "button",
      class: "admin-process-toggle",
      "aria-expanded": p.value,
      onClick: $[0] || ($[0] = (C) => e.value = !e.value)
    }, [a("span", Ue, s(p.value ? "⌄" : "›"), 1), Y(s(i(l).process(c.value)), 1)], 8, We)), p.value ? (r(), o("div", Ge, [
      (r(!0), o(L, null, J(f.value, (C) => (r(), o("div", {
        key: C.index,
        class: "admin-process-round"
      }, [C.text ? (r(), W(xe, {
        key: 0,
        class: "admin-markdown admin-process-narration",
        text: C.text
      }, null, 8, ["text"])) : m("", !0), (r(!0), o(L, null, J(C.tools, (v) => (r(), o("div", {
        key: v.id,
        class: "admin-operation-line"
      }, [
        a("i", { class: Q(["admin-operation-dot", `is-${v.status}`]) }, null, 2),
        a("span", null, [Y(s(v.name), 1), v.target ? (r(), o("small", He, " · " + s(v.target), 1)) : m("", !0)]),
        a("small", null, s(v.status === "queued" ? i(l).queued : v.status === "not-executed" ? i(l).notExecuted : i(l).operations[v.status]), 1)
      ]))), 128))]))), 128)),
      h.value ? (r(), o("span", Ye, s(i(l).processLoading), 1)) : m("", !0),
      k.value ? (r(), o("p", Qe, [Y(s(k.value), 1), a("button", {
        type: "button",
        onClick: S
      }, s(i(l).check), 1)])) : m("", !0)
    ])) : m("", !0)], 2)) : m("", !0);
  }
}), Xe = Je, Ze = ["data-row-id"], et = ["aria-label"], tt = ["src", "alt"], at = {
  key: 2,
  class: "admin-muted"
}, lt = {
  key: 0,
  class: "admin-muted"
}, it = {
  class: "admin-live-status",
  role: "status",
  "aria-live": "polite"
}, nt = ["aria-label"], st = ["disabled"], rt = {
  key: 4,
  class: "admin-error",
  role: "status"
}, ut = ["aria-label"], ot = ["disabled"], dt = ["disabled"], vt = /* @__PURE__ */ le({
  __name: "AdministratorMessage",
  props: {
    row: {},
    live: { default: null },
    unsavedProcess: { default: null },
    bridge: {},
    chatIdentity: {},
    disabled: { type: Boolean }
  },
  emits: [
    "delete",
    "regenerate",
    "details"
  ],
  setup(n, { emit: g }) {
    const e = n, b = g, h = y(!1), k = y(e.row.text), f = y(!1), c = y("");
    let p = 0, x = k.value.length;
    const S = D(() => e.live ? e.live.text : k.value), A = D(() => e.unsavedProcess?.length ?? e.row.processCount);
    function $(v) {
      v.target.closest("a, button, input, textarea, select") || (v instanceof KeyboardEvent && v.preventDefault(), h.value = !h.value);
    }
    ne(() => [
      e.chatIdentity,
      e.row.id,
      e.row.revision
    ], (v, _) => {
      p++, f.value = !1, c.value = "", (v[0] !== _[0] || v[1] !== _[1]) && (x = e.row.text.length), x <= e.row.text.length ? k.value = e.row.text : C(x, !0);
    }), ce(() => {
      p++;
    });
    async function C(v, _ = !1) {
      if (f.value) return;
      x = Math.min(Math.max(x, v), e.row.totalChars);
      const I = ++p, { turnId: w, role: T, revision: U } = e.row, G = e.chatIdentity, B = () => I === p && G === e.chatIdentity && U === e.row.revision && w === e.row.turnId;
      f.value = !0, c.value = "";
      try {
        let R = _ ? e.row.text : k.value;
        for (; R.length < x; ) {
          const K = await e.bridge.request("administrator/text", {
            chatIdentity: G,
            turnId: w,
            role: T,
            revision: U,
            offset: R.length
          });
          if (!B()) return;
          R += K.result.text;
        }
        k.value = R;
      } catch (R) {
        B() && (_ && (k.value = e.row.text), c.value = j(R));
      } finally {
        B() && (f.value = !1);
      }
    }
    return (v, _) => (r(), o("article", {
      class: Q(["admin-message", `is-${n.row.role}`]),
      "data-row-id": n.row.id
    }, [
      n.row.role === "assistant" ? (r(), W(Xe, {
        key: 0,
        row: n.row,
        live: n.live,
        unsaved: n.unsavedProcess,
        bridge: n.bridge,
        "chat-identity": n.chatIdentity
      }, null, 8, [
        "row",
        "live",
        "unsaved",
        "bridge",
        "chat-identity"
      ])) : m("", !0),
      S.value || n.row.image || !n.live && !A.value ? (r(), o("div", {
        key: 1,
        class: "admin-bubble",
        tabindex: "0",
        role: "group",
        "aria-label": i(l).messageActions,
        onClick: $,
        onKeydown: [
          ae($, ["enter"]),
          ae($, ["space"]),
          _[0] || (_[0] = ae(se((I) => h.value = !1, ["stop"]), ["esc"]))
        ]
      }, [
        n.row.image ? (r(), o("img", {
          key: 0,
          src: n.row.image.path,
          alt: n.row.image.name,
          loading: "lazy",
          class: "admin-message-image"
        }, null, 8, tt)) : m("", !0),
        S.value ? (r(), W(xe, {
          key: 1,
          class: "admin-markdown",
          text: S.value
        }, null, 8, ["text"])) : m("", !0),
        !S.value && !n.row.image ? (r(), o("span", at, s(n.row.error || i(l).noReply), 1)) : m("", !0)
      ], 40, et)) : m("", !0),
      n.live ? (r(), o(L, { key: 2 }, [
        (r(!0), o(L, null, J(n.live.preview, (I) => (r(), o("div", {
          key: I.id,
          class: "admin-operation-line"
        }, [
          a("i", { class: Q(["admin-operation-dot", `is-${I.status}`]) }, null, 2),
          a("span", null, s(I.name), 1),
          a("small", null, s(i(l).operations[I.status]), 1)
        ]))), 128)),
        n.live.totalChars > i(E).textBlock ? (r(), o("small", lt, s(i(l).longReply), 1)) : m("", !0),
        a("div", it, [_[5] || (_[5] = a("span", { class: "admin-working-dot" }, null, -1)), Y(s(i(l).phases[n.live.phase]), 1)])
      ], 64)) : m("", !0),
      !n.live && n.row.totalChars > k.value.length ? (r(), o("nav", {
        key: 3,
        class: "admin-pager",
        "aria-label": i(l).messagePages
      }, [a("button", {
        type: "button",
        disabled: f.value,
        onClick: _[1] || (_[1] = (I) => C(k.value.length + i(E).textBlock))
      }, s(i(l).moreText), 9, st)], 8, nt)) : m("", !0),
      n.row.error || c.value ? (r(), o("p", rt, s(c.value || n.row.error), 1)) : m("", !0),
      h.value || !n.live && A.value && !S.value ? (r(), o("nav", {
        key: 5,
        class: "admin-message-actions",
        "aria-label": i(l).messageActions
      }, [
        a("button", {
          type: "button",
          disabled: n.disabled,
          onClick: _[2] || (_[2] = (I) => b("delete", n.row))
        }, s(i(l).delete), 9, ot),
        n.row.canRegenerate ? (r(), o("button", {
          key: 0,
          type: "button",
          disabled: n.disabled,
          onClick: _[3] || (_[3] = (I) => b("regenerate", n.row))
        }, s(i(l).regenerate), 9, dt)) : m("", !0),
        A.value ? (r(), o("button", {
          key: 1,
          type: "button",
          onClick: _[4] || (_[4] = (I) => b("details", n.row))
        }, s(i(l).evidence), 1)) : m("", !0)
      ], 8, ut)) : m("", !0)
    ], 10, Ze));
  }
}), ct = vt, mt = ["aria-label", "onKeydown"], gt = ["aria-label"], pt = { class: "admin-details-body" }, yt = { class: "admin-evidence" }, ft = ["disabled"], bt = { class: "admin-operations" }, ht = { key: 0 }, wt = { class: "admin-muted" }, kt = ["disabled", "onClick"], _t = { class: "admin-pager" }, xt = ["disabled"], $t = ["disabled"], It = {
  key: 2,
  class: "admin-error",
  role: "status"
}, Ct = /* @__PURE__ */ le({
  __name: "AdministratorDetails",
  props: {
    bridge: {},
    chatIdentity: {},
    turnId: {}
  },
  emits: ["close"],
  setup(n, { emit: g }) {
    const e = n, b = g, h = y([]), k = y(0), f = y(0), c = y(""), p = y(!1), x = y(null), S = y(""), A = y(null);
    function $() {
      de(() => A.value?.focus({ preventScroll: !0 }));
    }
    function C() {
      x.value ? (x.value = null, $()) : b("close");
    }
    ze(A, C);
    async function v(I) {
      p.value = !0, c.value = "", x.value = null;
      try {
        const w = await e.bridge.request("administrator/operations", {
          chatIdentity: e.chatIdentity,
          turnId: e.turnId,
          offset: I
        });
        h.value = w.result.items, f.value = w.result.total, k.value = w.result.offset;
      } catch (w) {
        c.value = j(w);
      } finally {
        p.value = !1;
      }
    }
    async function _(I, w = 0) {
      p.value = !0, c.value = "";
      try {
        x.value = (await e.bridge.request("administrator/evidence", {
          chatIdentity: e.chatIdentity,
          reference: I,
          offset: w
        })).result, S.value = I, $();
      } catch (T) {
        c.value = j(T);
      } finally {
        p.value = !1;
      }
    }
    return _e(() => v(0)), (I, w) => (r(), o("section", {
      ref_key: "layer",
      ref: A,
      class: "admin-details",
      role: "dialog",
      "aria-modal": "true",
      tabindex: "-1",
      "aria-label": i(l).details,
      onKeydown: ae(se(C, ["stop", "prevent"]), ["esc"])
    }, [a("header", null, [a("strong", null, s(i(l).details), 1), a("button", {
      type: "button",
      "aria-label": i(l).close,
      onClick: w[0] || (w[0] = (T) => b("close"))
    }, "×", 8, gt)]), a("div", pt, [x.value ? (r(), o(L, { key: 0 }, [
      a("button", {
        type: "button",
        class: "admin-text-button",
        onClick: C
      }, "‹ " + s(i(l).details), 1),
      a("pre", yt, s(x.value.text), 1),
      x.value.nextOffset !== null ? (r(), o("button", {
        key: 0,
        type: "button",
        disabled: p.value,
        onClick: w[1] || (w[1] = (T) => _(S.value, x.value.nextOffset))
      }, s(i(l).moreText), 9, ft)) : m("", !0)
    ], 64)) : (r(), o(L, { key: 1 }, [a("ol", bt, [(r(!0), o(L, null, J(h.value, (T) => (r(), o("li", { key: T.id }, [
      a("div", null, [
        a("i", { class: Q(["admin-operation-dot", `is-${T.status}`]) }, null, 2),
        a("strong", null, s(T.name), 1),
        a("span", null, s(i(l).operations[T.status]), 1),
        a("small", null, s((T.elapsedMs / 1e3).toFixed(1)) + "s", 1)
      ]),
      T.target ? (r(), o("p", ht, s(T.target), 1)) : m("", !0),
      a("p", wt, s(T.summary), 1),
      a("button", {
        type: "button",
        class: "admin-text-button",
        disabled: p.value,
        onClick: (U) => _(T.id)
      }, s(i(l).evidence), 9, kt)
    ]))), 128))]), a("nav", _t, [a("button", {
      type: "button",
      disabled: !k.value || p.value,
      onClick: w[2] || (w[2] = (T) => v(Math.max(0, k.value - i(E).pageSize)))
    }, s(i(l).earlier), 9, xt), a("button", {
      type: "button",
      disabled: k.value + h.value.length >= f.value || p.value,
      onClick: w[3] || (w[3] = (T) => v(k.value + h.value.length))
    }, s(i(l).later), 9, $t)])], 64)), c.value ? (r(), o("p", It, s(c.value), 1)) : m("", !0)])], 40, mt));
  }
}), At = Ct, Tt = { class: "administrator-app" }, Rt = { class: "admin-header" }, Mt = [
  "title",
  "aria-label",
  "disabled"
], St = {
  key: 0,
  class: "admin-notice",
  role: "alert"
}, Pt = ["disabled"], Bt = ["disabled"], qt = {
  key: 1,
  class: "admin-empty"
}, zt = {
  key: 2,
  class: "admin-live"
}, Ot = {
  class: "admin-live-status",
  role: "status",
  "aria-live": "polite"
}, Et = ["disabled"], Dt = {
  key: 2,
  class: "admin-notice",
  role: "status"
}, Lt = ["disabled"], Nt = ["disabled"], jt = ["disabled"], Kt = {
  key: 3,
  class: "admin-attachment"
}, Vt = ["src", "alt"], Ft = ["aria-label", "disabled"], Wt = ["accept"], Ut = [
  "disabled",
  "aria-label",
  "title"
], Gt = [
  "placeholder",
  "aria-label",
  "disabled"
], Ht = [
  "disabled",
  "aria-label",
  "title"
], Yt = [
  "disabled",
  "aria-label",
  "title"
], Qt = { class: "admin-dialog-actions" }, Jt = ["disabled"], Xt = { class: "admin-dialog-actions" }, Zt = ["disabled"], ea = /* @__PURE__ */ le({
  __name: "AdministratorApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(n) {
    const g = n, e = ve(structuredClone(he(g.initialState))), b = ve(e.value.page.rows), h = y(e.value.page.start), k = y(e.value.page.total), f = y(""), c = y(null), p = y(""), x = y(""), S = y(!1), A = y(!1), $ = y(null), C = y(null), v = y(null), _ = y(null), I = y(null), w = y(!0), T = y(!1), U = y(0);
    let G = 0, B = null;
    ne([f, c], () => {
      G++;
    }, { flush: "sync" });
    const R = D(() => !!x.value || !!e.value.live), K = D(() => e.value.live?.phase ?? (["send", "regenerate"].includes(x.value) ? "preparing" : null)), X = D(() => R.value || e.value.unsaved || e.value.corrupted), $e = D(() => b.value.some((u) => u.role === "assistant" && u.turnId === e.value.live?.turnId)), V = D(() => h.value + b.value.length >= k.value);
    let me = () => {
    }, Z, F = 0;
    const ge = () => ({ chatIdentity: e.value.chatIdentity });
    async function ie(u, t = {}) {
      return (await g.bridge.request(`administrator/${u}`, {
        ...ge(),
        ...t
      }, 6e4)).result;
    }
    function pe() {
      const u = v.value, t = u && [...u.querySelectorAll("[data-row-id]")].find((d) => d.getBoundingClientRect().bottom > u.getBoundingClientRect().top);
      return t ? {
        id: t.dataset.rowId,
        top: t.getBoundingClientRect().top
      } : null;
    }
    async function re(u) {
      await de();
      const t = v.value && [...v.value.querySelectorAll("[data-row-id]")].find((d) => d.dataset.rowId === u?.id);
      u && t && v.value && (v.value.scrollTop += t.getBoundingClientRect().top - u.top);
    }
    async function ee() {
      await de(), v.value && (v.value.scrollTop = v.value.scrollHeight);
    }
    function ue(u) {
      const t = pe(), d = V.value, P = e.value;
      if (e.value = u, k.value = u.page.total, P.chatIdentity !== u.chatIdentity) {
        F++, b.value = u.page.rows, h.value = u.page.start, f.value = "", c.value = null, C.value = null, B = null;
        return;
      }
      if (u.page.revision !== P.page.revision) {
        const q = Math.max(E.pageSize, b.value.length), z = d && w.value ? Math.max(0, u.page.total - q) : Math.min(h.value, Math.max(0, u.page.total - q));
        z === u.page.start && q === E.pageSize ? (b.value = u.page.rows, h.value = z, w.value || re(t)) : Ie(z, q, t);
      }
      B && u.submission?.id === B.id && u.submission.accepted && (B.revision === G && (f.value = "", c.value = null), B = null), w.value && V.value && ee();
    }
    async function Ie(u, t, d) {
      const P = ++F, q = e.value.chatIdentity, z = e.value.page.revision, M = () => P === F && q === e.value.chatIdentity && z === e.value.page.revision;
      try {
        const O = [];
        for (let N = u; N < Math.min(k.value, u + t); N += E.pageSize) {
          const te = await ie("page", {
            start: N,
            revision: z
          });
          if (!M()) return;
          O.push(...te.rows);
        }
        if (!M()) return;
        b.value = O, h.value = u, w.value && V.value ? await ee() : await re(d);
      } catch (O) {
        M() && (p.value = j(O));
      }
    }
    async function oe(u, t) {
      if (S.value) return;
      const d = ++F;
      S.value = !0, p.value = "";
      const P = pe(), q = e.value.chatIdentity, z = e.value.page.revision;
      try {
        const M = await ie("page", {
          start: u,
          revision: e.value.page.revision
        });
        if (d !== F || q !== e.value.chatIdentity || z !== e.value.page.revision) return;
        const O = b.value.filter((N) => N.revision === z);
        t === "earlier" ? (b.value = [...M.rows, ...O.filter((N) => !M.rows.some((te) => te.id === N.id))].slice(0, E.windowSize), h.value = M.start) : t === "later" ? (b.value = [...O.filter((N) => !M.rows.some((te) => te.id === N.id)), ...M.rows].slice(-E.windowSize), h.value = M.start + M.rows.length - b.value.length) : (b.value = M.rows, h.value = M.start), k.value = M.total, await re(P);
      } catch (M) {
        d === F && q === e.value.chatIdentity && z === e.value.page.revision && (p.value = j(M));
      } finally {
        S.value = !1;
      }
    }
    async function ye() {
      await oe(Math.max(0, k.value - E.pageSize), "replace"), w.value = !0, await ee();
    }
    async function fe() {
      if (!(X.value || !f.value.trim() && !c.value)) {
        x.value = "send", p.value = "", w.value = !0;
        try {
          B = {
            id: Ee(),
            revision: G
          }, ue((await ie("send", {
            submissionId: B.id,
            text: f.value,
            ...c.value ? { image: he(c.value) } : {}
          })).state), await ye();
        } catch (u) {
          p.value = j(u);
        } finally {
          x.value = "";
        }
      }
    }
    async function H(u, t = {}) {
      if (!R.value) {
        x.value = u, p.value = "";
        try {
          ue(await ie(u, t)), A.value = !1, $.value = null, u === "adopt" && (B = null), u === "clear" && (f.value = "", c.value = null, B = null, C.value = null);
        } catch (d) {
          p.value = j(d);
        } finally {
          x.value = "";
        }
      }
    }
    async function Ce(u) {
      const t = u.target, d = t.files?.[0];
      if (t.value = "", !!d) {
        if (p.value = "", d.size > E.maxImageBytes || !ke.includes(d.type)) {
          p.value = l.invalidImage;
          return;
        }
        try {
          const P = await new Promise((z, M) => {
            const O = new FileReader();
            O.onload = () => z(String(O.result)), O.onerror = () => M(new Error(l.invalidImage)), O.readAsDataURL(d);
          }), q = new Image();
          q.src = P, await q.decode(), c.value = {
            name: d.name.slice(0, 120),
            dataUrl: P
          }, I.value?.focus();
        } catch {
          p.value = l.invalidImage;
        }
      }
    }
    function Ae(u) {
      u.key === "Enter" && !u.shiftKey && !T.value && !u.isComposing && (u.preventDefault(), R.value || fe());
    }
    function Te() {
      v.value && (w.value = v.value.scrollHeight - v.value.scrollTop - v.value.clientHeight < 48);
    }
    return ne([f, c], () => {
      Z && clearTimeout(Z), Z = setTimeout(() => {
        U.value = Oe(f.value) + (c.value ? E.imageTokens : 0);
      }, 160);
    }), _e(() => {
      me = g.bridge.subscribe((u) => {
        u.type === "administrator/state" && ue(u.payload.state), u.type === "administrator/live" && (e.value = {
          ...e.value,
          ...u.payload
        }, w.value && V.value && ee());
      }), ee();
    }), ce(() => {
      F++, me(), Z && clearTimeout(Z);
    }), (u, t) => (r(), o("div", Tt, [
      a("header", Rt, [
        a("h1", null, s(i(l).title), 1),
        Me(Fe, {
          usage: e.value.context,
          "draft-tokens": e.value.live ? 0 : U.value
        }, null, 8, ["usage", "draft-tokens"]),
        a("button", {
          type: "button",
          class: "admin-icon-button",
          title: i(l).clear,
          "aria-label": i(l).clear,
          disabled: R.value || e.value.unsaved,
          onClick: t[0] || (t[0] = (d) => A.value = !0)
        }, [...t[23] || (t[23] = [a("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [a("path", { d: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" })], -1)])], 8, Mt)
      ]),
      e.value.corrupted ? (r(), o("div", St, [Y(s(i(l).corrupted), 1), a("button", {
        type: "button",
        disabled: R.value,
        onClick: t[1] || (t[1] = (d) => A.value = !0)
      }, s(i(l).clear), 9, Pt)])) : m("", !0),
      a("div", {
        ref_key: "list",
        ref: v,
        class: "admin-conversation",
        onScrollPassive: Te
      }, [
        h.value > 0 ? (r(), o("button", {
          key: 0,
          type: "button",
          class: "admin-history-button",
          disabled: S.value,
          onClick: t[2] || (t[2] = (d) => oe(Math.max(0, h.value - i(E).pageSize), "earlier"))
        }, s(i(l).earlier), 9, Bt)) : m("", !0),
        !b.value.length && !K.value && !e.value.corrupted ? (r(), o("p", qt, s(i(l).empty), 1)) : m("", !0),
        (r(!0), o(L, null, J(b.value, (d) => (r(), W(ct, {
          key: d.id,
          row: d,
          live: d.role === "assistant" && d.turnId === e.value.live?.turnId ? e.value.live : null,
          bridge: n.bridge,
          "chat-identity": e.value.chatIdentity,
          disabled: X.value,
          "unsaved-process": d.role === "assistant" && d.turnId === e.value.unsavedProcess?.turnId ? e.value.unsavedProcess.rounds : null,
          onDelete: t[3] || (t[3] = (P) => $.value = P),
          onRegenerate: t[4] || (t[4] = (P) => H("regenerate", { turnId: P.turnId })),
          onDetails: t[5] || (t[5] = (P) => C.value = P.turnId)
        }, null, 8, [
          "row",
          "live",
          "bridge",
          "chat-identity",
          "disabled",
          "unsaved-process"
        ]))), 128)),
        K.value && V.value && !$e.value ? (r(), o("div", zt, [a("div", Ot, [t[24] || (t[24] = a("span", { class: "admin-working-dot" }, null, -1)), Y(s(i(l).phases[K.value]), 1)])])) : m("", !0),
        V.value ? m("", !0) : (r(), o("button", {
          key: 3,
          type: "button",
          class: "admin-history-button",
          disabled: S.value,
          onClick: t[6] || (t[6] = (d) => oe(h.value + b.value.length, "later"))
        }, s(i(l).later), 9, Et))
      ], 544),
      !V.value || !w.value ? (r(), o("button", {
        key: 1,
        type: "button",
        class: "admin-latest",
        onClick: ye
      }, "↓ " + s(i(l).latest), 1)) : m("", !0),
      p.value || e.value.error || e.value.unsaved ? (r(), o("div", Dt, [
        a("span", null, s(p.value || (e.value.unsaved ? i(l).unsaved : e.value.error)), 1),
        e.value.unsaved ? (r(), o("button", {
          key: 0,
          type: "button",
          disabled: R.value,
          onClick: t[7] || (t[7] = (d) => H("check"))
        }, s(i(l).check), 9, Lt)) : m("", !0),
        e.value.unsaved ? (r(), o("button", {
          key: 1,
          type: "button",
          disabled: R.value,
          onClick: t[8] || (t[8] = (d) => H("confirm"))
        }, s(i(l).confirm), 9, Nt)) : m("", !0),
        e.value.conflict || e.value.unsaved ? (r(), o("button", {
          key: 2,
          type: "button",
          disabled: R.value,
          onClick: t[9] || (t[9] = (d) => H("adopt"))
        }, s(i(l).adopt), 9, jt)) : m("", !0)
      ])) : m("", !0),
      c.value ? (r(), o("div", Kt, [
        a("img", {
          src: c.value.dataUrl,
          alt: c.value.name
        }, null, 8, Vt),
        a("span", null, s(c.value.name), 1),
        a("button", {
          type: "button",
          "aria-label": i(l).removeImage,
          disabled: R.value,
          onClick: t[10] || (t[10] = (d) => c.value = null)
        }, "×", 8, Ft)
      ])) : m("", !0),
      a("form", {
        class: "admin-composer",
        onSubmit: se(fe, ["prevent"])
      }, [
        a("input", {
          ref_key: "file",
          ref: _,
          type: "file",
          accept: i(ke).join(","),
          hidden: "",
          onChange: Ce
        }, null, 40, Wt),
        a("button", {
          type: "button",
          class: "admin-icon-button",
          disabled: X.value,
          "aria-label": i(l).attach,
          title: i(l).attach,
          onClick: t[11] || (t[11] = (d) => _.value?.click())
        }, [...t[25] || (t[25] = [a("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [
          a("rect", {
            x: "3",
            y: "3",
            width: "18",
            height: "18",
            rx: "3"
          }),
          a("circle", {
            cx: "8",
            cy: "8",
            r: "1.5"
          }),
          a("path", { d: "m3 17 5-5 4 4 4-7 5 8" })
        ], -1)])], 8, Ut),
        Re(a("textarea", {
          ref_key: "composer",
          ref: I,
          "onUpdate:modelValue": t[12] || (t[12] = (d) => f.value = d),
          rows: "1",
          maxlength: "16000",
          placeholder: i(l).placeholder,
          "aria-label": i(l).placeholder,
          disabled: e.value.corrupted || R.value,
          onKeydown: Ae,
          onCompositionstart: t[13] || (t[13] = (d) => T.value = !0),
          onCompositionend: t[14] || (t[14] = (d) => T.value = !1)
        }, null, 40, Gt), [[Pe, f.value]]),
        K.value ? (r(), o("button", {
          key: 0,
          type: "button",
          class: "admin-send",
          disabled: K.value === "stopping",
          "aria-label": i(l).stop,
          title: i(l).stop,
          onClick: t[15] || (t[15] = (d) => g.bridge.post("administrator/stop", ge()))
        }, [...t[26] || (t[26] = [a("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [a("rect", {
          x: "6",
          y: "6",
          width: "12",
          height: "12",
          rx: "2"
        })], -1)])], 8, Ht)) : (r(), o("button", {
          key: 1,
          type: "submit",
          class: "admin-send",
          disabled: X.value || !f.value.trim() && !c.value,
          "aria-label": i(l).send,
          title: i(l).send
        }, [...t[27] || (t[27] = [a("svg", {
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, [a("path", { d: "M12 19V5m-6 6 6-6 6 6" })], -1)])], 8, Yt))
      ], 32),
      C.value ? (r(), W(At, {
        key: C.value,
        bridge: n.bridge,
        "chat-identity": e.value.chatIdentity,
        "turn-id": C.value,
        onClose: t[16] || (t[16] = (d) => C.value = null)
      }, null, 8, [
        "bridge",
        "chat-identity",
        "turn-id"
      ])) : m("", !0),
      A.value ? (r(), W(we, {
        key: 5,
        class: "admin-dialog",
        "aria-label": i(l).clearTitle,
        busy: R.value,
        onClose: t[19] || (t[19] = (d) => A.value = !1)
      }, {
        default: be(() => [
          a("h2", null, s(i(l).clearTitle), 1),
          a("p", null, s(i(l).clearWarning), 1),
          a("div", Qt, [a("button", {
            type: "button",
            onClick: t[17] || (t[17] = (d) => A.value = !1)
          }, s(i(l).cancel), 1), a("button", {
            type: "button",
            disabled: R.value,
            onClick: t[18] || (t[18] = (d) => H("clear"))
          }, s(i(l).clear), 9, Jt)])
        ]),
        _: 1
      }, 8, ["aria-label", "busy"])) : m("", !0),
      $.value ? (r(), W(we, {
        key: 6,
        class: "admin-dialog",
        "aria-label": i(l).delete,
        busy: R.value,
        onClose: t[22] || (t[22] = (d) => $.value = null)
      }, {
        default: be(() => [
          a("h2", null, s(i(l).delete), 1),
          a("p", null, s(i(l).deleteWarning), 1),
          a("div", Xt, [a("button", {
            type: "button",
            onClick: t[20] || (t[20] = (d) => $.value = null)
          }, s(i(l).cancel), 1), a("button", {
            type: "button",
            disabled: X.value,
            onClick: t[21] || (t[21] = (d) => H("delete", {
              turnId: $.value.turnId,
              role: $.value.role,
              revision: e.value.page.revision
            }))
          }, s(i(l).delete), 9, Zt)])
        ]),
        _: 1
      }, 8, ["aria-label", "busy"])) : m("", !0)
    ]));
  }
}), ra = ea;
export {
  ra as default
};
