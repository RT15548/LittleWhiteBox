/* eslint-disable */
import { D as Oe, G as S, H as T, J as r, K as J, M as Fe, R as ge, T as ze, V as Ke, W as me, b as D, f as B, g as d, h as y, j, k as i, l as Ge, m as M, o as F, p as e, u as I, v as b, w as Je, y as m, z } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { n as Qe } from "./xiaobai-os-app-navigation-D5qZ5Ulq.js";
import { t as We } from "./xiaobai-os-AppDialog-ycKLGrLE.js";
var Xe = {
  class: "tasks-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.7",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
}, Ye = ["d"], _e = /* @__PURE__ */ D({
  __name: "TaskIcon",
  props: { name: {} },
  setup(t) {
    const o = {
      compass: "m14.5 9.5-2 5-5 2 2-5 5-2ZM12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
      send: "m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3",
      archive: "M4 8h16v12H4V8ZM3 4h18v4H3V4Zm6 8h6",
      settings: "M4 7h16M4 17h16M9 4v6m6 4v6",
      back: "m14 5-7 7 7 7",
      next: "m9 5 7 7-7 7",
      refresh: "M20 7v5h-5M4 17v-5h5M18 9A7 7 0 0 0 6 7L4 9m16 6-2 2A7 7 0 0 1 6 15",
      pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
      check: "m5 12 4 4L19 6",
      plus: "M12 5v14M5 12h14",
      ticket: "M5 3h14v18l-3-2-4 2-4-2-3 2V3Zm4 5h6m-6 4h6",
      people: "M9 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM3 20v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v2",
      clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2",
      close: "m6 6 12 12M6 18 18 6"
    };
    return (a, s) => (i(), d("svg", Xe, [e("path", { d: o[t.name] }, null, 8, Ye)]));
  }
}), g = _e, fe = {
  recruiting: "招募中",
  active: "进行中",
  completed: "已完成",
  failed: "未完成",
  cancelled: "已取消"
};
function N(t) {
  return t.toLocaleString("zh-CN");
}
function et(t) {
  return t.source === "received" ? "任务终端" : `${t.issuer.displayName}（你）`;
}
function tt(t) {
  return {
    received: t.active.filter((o) => o.source === "received"),
    published: [...t.recruiting, ...t.active.filter((o) => o.source === "published")].sort((o, a) => a.updatedAt - o.updatedAt || a.taskId.localeCompare(o.taskId))
  };
}
var at = { class: "tasks-page tasks-detail-page" }, st = {
  key: 0,
  class: "tasks-empty",
  role: "status"
}, lt = { class: "tasks-contract-heading" }, nt = ["data-status"], it = { class: "tasks-progress-summary" }, rt = { class: "tasks-eyebrow" }, ut = { class: "tasks-facts" }, dt = { class: "tasks-contract-more" }, ot = {
  key: 0,
  class: "tasks-hint"
}, vt = { class: "tasks-contract-reward" }, kt = { class: "tasks-seal" }, ct = { class: "tasks-party-line" }, bt = { class: "tasks-facts" }, yt = { key: 0 }, mt = { key: 1 }, gt = {
  key: 2,
  class: "is-risk"
}, ft = {
  key: 0,
  class: "tasks-withdraw"
}, ht = ["disabled"], $t = {
  key: 0,
  class: "tasks-hint"
}, pt = { class: "tasks-timeline" }, Ct = {
  key: 2,
  class: "tasks-empty"
}, It = /* @__PURE__ */ D({
  __name: "TaskDetail",
  props: {
    detail: {},
    loading: { type: Boolean },
    busy: { type: Boolean },
    disabledReason: {}
  },
  emits: ["cancel"],
  setup(t) {
    function o(a) {
      return new Date(a).toLocaleString("zh-CN", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: !1
      });
    }
    return (a, s) => (i(), d("section", at, [t.loading ? (i(), d("div", st, [m(g, {
      name: "refresh",
      class: "is-spinning"
    }), s[1] || (s[1] = e("h3", null, "正在读取委托…", -1))])) : t.detail ? (i(), d(I, { key: 1 }, [
      e("header", lt, [e("span", {
        class: "tasks-status",
        "data-status": t.detail.task.status
      }, [s[2] || (s[2] = e("i", null, null, -1)), b(r(S(fe)[t.detail.task.status]), 1)], 8, nt), e("h2", null, r(t.detail.task.title), 1)]),
      e("section", it, [e("span", rt, r(t.detail.task.resultSummary ? "最终结果" : "当前进展"), 1), e("p", null, r(t.detail.task.resultSummary || t.detail.task.progressSummary || "暂无新进展"), 1)]),
      e("dl", ut, [e("div", null, [s[3] || (s[3] = e("dt", null, "完成目标", -1)), e("dd", null, r(t.detail.task.objective), 1)])]),
      e("details", dt, [
        s[12] || (s[12] = e("summary", null, "委托内容与报酬", -1)),
        t.detail.task.hook ? (i(), d("p", ot, r(t.detail.task.hook), 1)) : y("", !0),
        e("div", vt, [e("span", null, [s[5] || (s[5] = b("委托报酬", -1)), e("strong", null, [s[4] || (s[4] = e("small", null, "¤", -1)), b(" " + r(S(N)(t.detail.task.reward)), 1)])]), e("span", kt, r(t.detail.task.source === "received" ? "终端委托" : "我的委托"), 1)]),
        e("div", ct, [
          e("span", null, [s[6] || (s[6] = b("发布者", -1)), e("strong", null, r(S(et)(t.detail.task)), 1)]),
          m(g, { name: "next" }),
          e("span", null, [s[7] || (s[7] = b("执行者", -1)), e("strong", null, r(t.detail.task.assignee?.displayName || "等待选人"), 1)])
        ]),
        e("dl", bt, [
          t.detail.task.requirements ? (i(), d("div", yt, [s[8] || (s[8] = e("dt", null, "要求", -1)), e("dd", null, r(t.detail.task.requirements), 1)])) : y("", !0),
          e("div", null, [s[9] || (s[9] = e("dt", null, "地点", -1)), e("dd", null, r(t.detail.task.location), 1)]),
          t.detail.task.timing ? (i(), d("div", mt, [s[10] || (s[10] = e("dt", null, "时机", -1)), e("dd", null, r(t.detail.task.timing), 1)])) : y("", !0),
          t.detail.task.risk ? (i(), d("div", gt, [s[11] || (s[11] = e("dt", null, "风险", -1)), e("dd", null, r(t.detail.task.risk), 1)])) : y("", !0)
        ])
      ]),
      t.detail.task.status === "active" || t.detail.task.status === "recruiting" ? (i(), d("div", ft, [e("button", {
        type: "button",
        class: "tasks-text-button is-danger",
        disabled: t.busy || !!t.disabledReason,
        onClick: s[0] || (s[0] = (c) => a.$emit("cancel", t.detail.task))
      }, r(t.detail.task.source === "received" ? "放弃任务" : "取消委托并退回报酬"), 9, ht), t.disabledReason ? (i(), d("p", $t, r(t.disabledReason), 1)) : y("", !0)])) : y("", !0),
      e("section", pt, [s[14] || (s[14] = e("h3", null, "进展记录", -1)), e("ol", null, [(i(!0), d(I, null, j(t.detail.timeline, (c) => (i(), d("li", { key: c.eventId }, [s[13] || (s[13] = e("i", null, null, -1)), e("div", null, [e("small", null, r(o(c.createdAt)), 1), e("p", null, r(c.summary), 1)])]))), 128))])])
    ], 64)) : (i(), d("div", Ct, [...s[15] || (s[15] = [e("h3", null, "这份委托暂时无法读取", -1), e("p", null, "请返回后重试。", -1)])]))]));
  }
}), wt = It, Rt = { class: "tasks-page tasks-publish-page" }, Tt = ["disabled"], Bt = { class: "tasks-form-group" }, Mt = { class: "tasks-form-extra" }, St = { class: "tasks-form-group" }, At = { class: "tasks-reward-editor" }, xt = { class: "tasks-amount-input" }, Dt = ["max"], qt = { class: "tasks-reward-presets" }, Lt = [
  "aria-pressed",
  "disabled",
  "onClick"
], Vt = {
  key: 0,
  class: "tasks-error-text",
  role: "status"
}, Pt = { class: "tasks-hint" }, Nt = {
  key: 0,
  class: "tasks-hint"
}, jt = ["disabled"], Et = /* @__PURE__ */ D({
  __name: "TaskPublishForm",
  props: {
    balance: {},
    busy: { type: Boolean },
    disabledReason: {}
  },
  emits: ["submit"],
  setup(t, { emit: o }) {
    const a = o, s = Ke({
      title: "",
      objective: "",
      requirements: "",
      location: "",
      risk: "",
      reward: 20
    });
    function c() {
      a("submit", {
        title: s.title,
        objective: s.objective,
        ...s.requirements.trim() ? { requirements: s.requirements } : {},
        location: s.location,
        risk: s.risk,
        reward: Number(s.reward)
      });
    }
    return ($, u) => (i(), d("section", Rt, [e("form", {
      class: "tasks-publish-form",
      onSubmit: Ge(c, ["prevent"])
    }, [
      e("fieldset", { disabled: t.busy }, [
        u[15] || (u[15] = e("legend", { class: "tasks-sr-only" }, "委托内容", -1)),
        e("div", Bt, [
          e("label", null, [u[6] || (u[6] = e("span", null, [b("委托名称 "), e("b", null, "*")], -1)), z(e("input", {
            "onUpdate:modelValue": u[0] || (u[0] = (k) => s.title = k),
            required: "",
            maxlength: "120",
            autocomplete: "off",
            placeholder: "例如：找回钟楼的手札"
          }, null, 512), [[F, s.title]])]),
          e("label", null, [u[7] || (u[7] = e("span", null, [b("完成目标 "), e("b", null, "*")], -1)), z(e("textarea", {
            "onUpdate:modelValue": u[1] || (u[1] = (k) => s.objective = k),
            required: "",
            maxlength: "8000",
            rows: "3",
            placeholder: "怎样才算完成？"
          }, null, 512), [[F, s.objective]])]),
          e("label", null, [u[8] || (u[8] = e("span", null, [b("行动地点 "), e("b", null, "*")], -1)), z(e("input", {
            "onUpdate:modelValue": u[2] || (u[2] = (k) => s.location = k),
            required: "",
            maxlength: "600",
            autocomplete: "off",
            placeholder: "例如：旧城钟楼"
          }, null, 512), [[F, s.location]])])
        ]),
        e("details", Mt, [u[11] || (u[11] = e("summary", null, [b("补充约束与风险 "), e("span", null, "选填")], -1)), e("div", St, [e("label", null, [u[9] || (u[9] = e("span", null, "执行约束", -1)), z(e("textarea", {
          "onUpdate:modelValue": u[3] || (u[3] = (k) => s.requirements = k),
          maxlength: "8000",
          rows: "3",
          placeholder: "对行动方式的要求，不增加第二个目标"
        }, null, 512), [[F, s.requirements]])]), e("label", null, [u[10] || (u[10] = e("span", null, "已知风险", -1)), z(e("textarea", {
          "onUpdate:modelValue": u[4] || (u[4] = (k) => s.risk = k),
          maxlength: "2000",
          rows: "3",
          placeholder: "有哪些需要执行者提前知道的风险？"
        }, null, 512), [[F, s.risk]])])])]),
        e("div", At, [
          e("label", null, [u[13] || (u[13] = e("span", null, [b("为这份委托设定报酬 "), e("b", null, "*")], -1)), e("span", xt, [u[12] || (u[12] = e("i", null, "¤", -1)), z(e("input", {
            "onUpdate:modelValue": u[5] || (u[5] = (k) => s.reward = k),
            "aria-label": "托管报酬",
            type: "number",
            required: "",
            min: "1",
            max: t.balance,
            step: "1"
          }, null, 8, Dt), [[
            F,
            s.reward,
            void 0,
            { number: !0 }
          ]])])]),
          e("div", qt, [(i(), d(I, null, j([
            20,
            50,
            100
          ], (k) => e("button", {
            key: k,
            type: "button",
            "aria-pressed": Number(s.reward) === k,
            disabled: k > t.balance,
            onClick: (Q) => s.reward = k
          }, "¤ " + r(k), 9, Lt)), 64))]),
          e("p", null, [u[14] || (u[14] = b("可用余额 ", -1)), e("strong", null, "¤ " + r(S(N)(t.balance)), 1)]),
          Number(s.reward) > t.balance ? (i(), d("p", Vt, "报酬超出可用余额，请调整金额。")) : y("", !0)
        ])
      ], 8, Tt),
      e("p", Pt, [m(g, { name: "ticket" }), u[16] || (u[16] = b("发布时托管报酬；招募中或执行中均可取消，全额退还托管报酬。", -1))]),
      t.disabledReason ? (i(), d("p", Nt, r(t.disabledReason), 1)) : y("", !0),
      e("button", {
        type: "submit",
        class: "tasks-primary-button tasks-full-button",
        disabled: t.busy || !!t.disabledReason || Number(s.reward) > t.balance
      }, [b(r(t.busy ? "正在发布…" : "预览并发布"), 1), m(g, { name: "next" })], 8, jt)
    ], 32)]));
  }
}), Ht = Et, Ut = ["data-navigation-id"], Zt = { class: "tasks-record-top" }, Ot = ["data-status"], Ft = { class: "tasks-reward" }, zt = { class: "tasks-record-title" }, Kt = { class: "tasks-record-summary" }, Gt = { class: "tasks-record-foot" }, Jt = /* @__PURE__ */ D({
  __name: "TaskRecordCard",
  props: { task: {} },
  emits: ["open"],
  setup(t) {
    return (o, a) => (i(), d("button", {
      type: "button",
      class: "tasks-record",
      "data-navigation-id": `task:${t.task.taskId}`,
      onClick: a[0] || (a[0] = (s) => o.$emit("open", t.task))
    }, [
      e("span", Zt, [e("span", {
        class: "tasks-status",
        "data-status": t.task.status
      }, [a[1] || (a[1] = e("i", null, null, -1)), b(r(S(fe)[t.task.status]), 1)], 8, Ot), e("span", Ft, [a[2] || (a[2] = e("small", null, "¤", -1)), b(" " + r(S(N)(t.task.reward)), 1)])]),
      e("strong", zt, r(t.task.title), 1),
      e("span", Kt, r(t.task.resultSummary || t.task.progressSummary || (t.task.status === "recruiting" ? "委托已发布，等待你选择执行者。" : "任务已开始，等待新的进展。")), 1),
      e("span", Gt, [e("span", null, [m(g, { name: t.task.source === "received" ? "pin" : "people" }, null, 8, ["name"]), b(r(t.task.source === "received" ? t.task.location : t.task.assignee?.displayName || `${t.task.candidates.length} 位候选人`), 1)]), m(g, { name: "next" })])
    ], 8, Ut));
  }
}), se = Jt, Qt = { class: "tasks-page" }, Wt = { class: "tasks-section-heading" }, Xt = { key: 0 }, Yt = {
  key: 0,
  class: "tasks-empty"
}, _t = {
  key: 1,
  class: "tasks-record-list"
}, ea = /* @__PURE__ */ D({
  __name: "TasksActive",
  props: { records: {} },
  emits: ["detail", "discover"],
  setup(t) {
    return (o, a) => (i(), d("section", Qt, [e("header", Wt, [a[1] || (a[1] = e("h2", null, "我接的", -1)), t.records.length ? (i(), d("small", Xt, r(t.records.length) + " 项", 1)) : y("", !0)]), t.records.length ? (i(), d("div", _t, [(i(!0), d(I, null, j(t.records, (s) => (i(), M(se, {
      key: s.taskId,
      task: s,
      onOpen: (c) => o.$emit("detail", s.taskId)
    }, null, 8, ["task", "onOpen"]))), 128))])) : (i(), d("div", Yt, [
      m(g, { name: "compass" }),
      a[2] || (a[2] = e("h3", null, "暂无进行中的委托", -1)),
      e("button", {
        type: "button",
        class: "tasks-primary-button",
        onClick: a[0] || (a[0] = (s) => o.$emit("discover"))
      }, "发现委托")
    ]))]));
  }
}), ta = ea, aa = { class: "tasks-page tasks-board-page" }, sa = { class: "tasks-section-heading" }, la = ["disabled"], na = {
  key: 0,
  class: "tasks-hint",
  role: "status"
}, ia = {
  key: 1,
  class: "tasks-empty"
}, ra = ["disabled"], ua = ["aria-busy"], da = ["data-navigation-id", "onClick"], oa = { class: "tasks-ticket-top" }, va = ["data-grade", "aria-label"], ka = { class: "tasks-ticket-tags" }, ca = ["aria-label"], ba = { class: "tasks-ticket-title" }, ya = { class: "tasks-ticket-hook" }, ma = { class: "tasks-ticket-foot" }, ga = { class: "tasks-ticket-location" }, fa = {
  key: 0,
  class: "tasks-accepted"
}, ha = {
  key: 3,
  class: "tasks-footnote"
}, $a = /* @__PURE__ */ D({
  __name: "TasksBoard",
  props: {
    board: {},
    busy: { type: Boolean },
    disabledReason: {}
  },
  emits: ["refresh", "detail"],
  setup(t) {
    return (o, a) => (i(), d("section", aa, [
      e("header", sa, [a[2] || (a[2] = e("h2", null, "发现委托", -1)), t.board?.listings.length ? (i(), d("button", {
        key: 0,
        type: "button",
        class: "tasks-text-button",
        disabled: t.busy || !!t.disabledReason,
        onClick: a[0] || (a[0] = (s) => o.$emit("refresh"))
      }, [m(g, {
        name: "refresh",
        class: J({ "is-spinning": t.busy })
      }, null, 8, ["class"]), b(r(t.busy ? "获取中…" : "换一批"), 1)], 8, la)) : y("", !0)]),
      t.disabledReason ? (i(), d("p", na, r(t.disabledReason), 1)) : y("", !0),
      !t.board || !t.board.listings.length ? (i(), d("div", ia, [
        m(g, { name: "compass" }),
        e("h3", null, r(t.busy ? "正在获取委托…" : "暂无委托"), 1),
        t.busy ? y("", !0) : (i(), d("button", {
          key: 0,
          type: "button",
          class: "tasks-primary-button",
          disabled: !!t.disabledReason,
          onClick: a[1] || (a[1] = (s) => o.$emit("refresh"))
        }, "获取委托", 8, ra)),
        a[3] || (a[3] = e("p", null, "获取委托将调用模型", -1))
      ])) : (i(), d("div", {
        key: 2,
        class: "tasks-board-list",
        "aria-busy": t.busy
      }, [(i(!0), d(I, null, j(t.board.listings, (s) => (i(), d("button", {
        key: s.listingId,
        "data-navigation-id": `listing:${s.listingId}`,
        type: "button",
        class: J(["tasks-ticket", { "is-accepted": s.accepted }]),
        onClick: (c) => o.$emit("detail", t.board.boardId, s.listingId)
      }, [
        e("span", oa, [
          e("span", {
            class: "tasks-grade",
            "data-grade": s.grade,
            "aria-label": `等级 ${s.grade}`
          }, r(s.grade), 9, va),
          e("span", ka, r(s.tags.slice(0, 2).join(" · ")), 1),
          e("span", {
            class: "tasks-reward",
            "aria-label": `报酬 ${S(N)(s.reward)} 小白币`
          }, [a[4] || (a[4] = e("small", null, "¤", -1)), b(" " + r(S(N)(s.reward)), 1)], 8, ca)
        ]),
        e("strong", ba, r(s.title), 1),
        e("span", ya, r(s.hook), 1),
        e("span", ma, [e("span", ga, [m(g, { name: "pin" }), b(r(s.location), 1)]), s.accepted ? (i(), d("span", fa, [m(g, { name: "check" }), a[5] || (a[5] = b("已接取", -1))])) : (i(), M(g, {
          key: 1,
          name: "next"
        }))])
      ], 10, da))), 128))], 8, ua)),
      t.board?.listings.length ? (i(), d("p", ha, "任务终端出资 · 换一批将调用模型")) : y("", !0)
    ]));
  }
}), pa = $a, Ca = { class: "tasks-page" }, Ia = {
  class: "tasks-filter",
  "aria-label": "记录来源"
}, wa = ["aria-pressed", "onClick"], Ra = {
  key: 0,
  class: "tasks-empty"
}, Ta = {
  key: 1,
  class: "tasks-record-list"
}, Ba = ["disabled"], Ma = /* @__PURE__ */ D({
  __name: "TasksHistory",
  props: {
    history: {},
    loading: { type: Boolean },
    source: {}
  },
  emits: [
    "detail",
    "loadMore",
    "filter"
  ],
  setup(t) {
    const o = t, a = B(() => o.history.items.filter((s) => o.source === "all" || s.source === o.source));
    return (s, c) => (i(), d("section", Ca, [
      c[1] || (c[1] = e("header", { class: "tasks-section-heading" }, [e("h2", null, "记录")], -1)),
      e("div", Ia, [(i(), d(I, null, j([
        {
          id: "all",
          label: "全部"
        },
        {
          id: "received",
          label: "我接的"
        },
        {
          id: "published",
          label: "我发布的"
        }
      ], ($) => e("button", {
        key: $.id,
        type: "button",
        "aria-pressed": t.source === $.id,
        onClick: (u) => s.$emit("filter", $.id)
      }, r($.label), 9, wa)), 64))]),
      a.value.length ? (i(), d("div", Ta, [(i(!0), d(I, null, j(a.value, ($) => (i(), M(se, {
        key: $.taskId,
        task: $,
        onOpen: (u) => s.$emit("detail", $.taskId)
      }, null, 8, ["task", "onOpen"]))), 128))])) : (i(), d("div", Ra, [m(g, { name: "archive" }), e("h3", null, r(t.history.hasMore ? "已加载的记录中暂无匹配项" : "暂无记录"), 1)])),
      t.history.hasMore ? (i(), d("button", {
        key: 2,
        type: "button",
        class: "tasks-load-more tasks-secondary-button",
        disabled: t.loading,
        onClick: c[0] || (c[0] = ($) => s.$emit("loadMore"))
      }, r(t.loading ? "正在加载…" : "加载更多记录"), 9, Ba)) : y("", !0)
    ]));
  }
}), Sa = Ma, Aa = { class: "tasks-page" }, xa = { class: "tasks-section-heading" }, Da = ["disabled"], qa = {
  key: 0,
  class: "tasks-hint"
}, La = {
  key: 1,
  class: "tasks-empty"
}, Va = {
  key: 2,
  class: "tasks-record-list"
}, Pa = /* @__PURE__ */ D({
  __name: "TasksPublished",
  props: {
    records: {},
    disabledReason: {}
  },
  emits: [
    "open",
    "publish",
    "history"
  ],
  setup(t) {
    return (o, a) => (i(), d("section", Aa, [
      e("header", xa, [a[3] || (a[3] = e("h2", null, "我发布的", -1)), e("button", {
        type: "button",
        class: "tasks-primary-button",
        "data-navigation-id": "publish",
        disabled: !!t.disabledReason,
        onClick: a[0] || (a[0] = (s) => o.$emit("publish"))
      }, [m(g, { name: "plus" }), a[2] || (a[2] = b("发布委托", -1))], 8, Da)]),
      t.disabledReason ? (i(), d("p", qa, r(t.disabledReason), 1)) : y("", !0),
      t.records.length ? (i(), d("div", Va, [(i(!0), d(I, null, j(t.records, (s) => (i(), M(se, {
        key: s.taskId,
        task: s,
        onOpen: (c) => o.$emit("open", s)
      }, null, 8, ["task", "onOpen"]))), 128))])) : (i(), d("div", La, [m(g, { name: "send" }), a[4] || (a[4] = e("h3", null, "还没有发布委托", -1))])),
      e("button", {
        type: "button",
        class: "tasks-text-button tasks-history-link",
        onClick: a[1] || (a[1] = (s) => o.$emit("history"))
      }, [a[5] || (a[5] = b("已结束的委托", -1)), m(g, { name: "next" })])
    ]));
  }
}), Na = Pa, ja = { class: "tasks-page tasks-settings-page" }, Ea = { class: "tasks-setting-card" }, Ha = { class: "tasks-setting-row" }, Ua = { class: "tasks-switch" }, Za = ["checked", "disabled"], Oa = { class: "tasks-setting-card" }, Fa = ["disabled"], za = {
  key: 0,
  class: "tasks-hint"
}, Ka = {
  key: 0,
  class: "tasks-maintenance-message",
  role: "status"
}, Ga = /* @__PURE__ */ D({
  __name: "TasksSettings",
  props: {
    autoMaintenance: { type: Boolean },
    settingsBusy: { type: Boolean },
    maintenanceBusy: { type: Boolean },
    maintenanceMessage: {},
    disabledReason: {}
  },
  emits: ["update", "maintain"],
  setup(t) {
    return (o, a) => (i(), d("section", ja, [
      e("article", Ea, [e("div", Ha, [a[3] || (a[3] = e("h3", null, "自动更新进展", -1)), e("label", Ua, [e("input", {
        type: "checkbox",
        "aria-label": "自动更新任务进展",
        checked: t.autoMaintenance,
        disabled: t.settingsBusy,
        onChange: a[0] || (a[0] = (s) => o.$emit("update", s.target.checked))
      }, null, 40, Za), a[2] || (a[2] = e("span", null, null, -1))])]), a[4] || (a[4] = e("p", null, "发送下一条消息时，根据上一轮剧情更新任务，将调用模型。适用于所有普通聊天。", -1))]),
      e("article", Oa, [
        e("button", {
          type: "button",
          class: "tasks-secondary-button",
          disabled: t.maintenanceBusy || !!t.disabledReason,
          onClick: a[1] || (a[1] = (s) => o.$emit("maintain"))
        }, [m(g, {
          name: "refresh",
          class: J({ "is-spinning": t.maintenanceBusy })
        }, null, 8, ["class"]), b(r(t.maintenanceBusy ? "正在更新…" : "更新任务进展"), 1)], 8, Fa),
        a[5] || (a[5] = e("p", null, "根据当前剧情检查任务，将调用模型。", -1)),
        t.disabledReason ? (i(), d("p", za, r(t.disabledReason), 1)) : y("", !0)
      ]),
      t.maintenanceMessage ? (i(), d("p", Ka, r(t.maintenanceMessage), 1)) : y("", !0)
    ]));
  }
}), Ja = Ga;
function Qa(t, o, a, s) {
  if (s !== a.stateVersion || t.nextCursor !== a.cursor) return null;
  const c = new Set(t.items.map(($) => $.taskId));
  return {
    items: [...t.items, ...o.items.filter(($) => !c.has($.taskId))],
    nextCursor: o.nextCursor,
    hasMore: o.hasMore
  };
}
var Wa = { class: "tasks-page" }, Xa = { class: "tasks-contract-sheet" }, Ya = { class: "tasks-contract-heading" }, _a = { class: "tasks-grade" }, es = { class: "tasks-eyebrow" }, ts = { class: "tasks-contract-reward" }, as = { class: "tasks-seal" }, ss = { class: "tasks-facts" }, ls = { key: 0 }, ns = { class: "is-risk" }, is = { class: "tasks-tags" }, rs = { class: "tasks-action-dock" }, us = {
  key: 0,
  class: "tasks-hint"
}, ds = ["disabled"], os = {
  key: 1,
  class: "tasks-empty"
}, vs = /* @__PURE__ */ D({
  __name: "TaskListingDetail",
  props: {
    listing: {},
    busy: { type: Boolean },
    disabledReason: {}
  },
  emits: ["accept"],
  setup(t) {
    return (o, a) => (i(), d("section", Wa, [t.listing ? (i(), d(I, { key: 0 }, [
      e("article", Xa, [
        e("header", Ya, [
          e("span", _a, r(t.listing.grade), 1),
          e("span", es, "任务终端 · " + r(t.listing.posture), 1),
          e("h2", null, r(t.listing.title), 1),
          e("p", null, r(t.listing.hook), 1)
        ]),
        e("div", ts, [e("span", null, [a[2] || (a[2] = b("完成报酬", -1)), e("strong", null, [a[1] || (a[1] = e("small", null, "¤", -1)), b(" " + r(S(N)(t.listing.reward)), 1)])]), e("span", as, [m(g, { name: "check" }), a[3] || (a[3] = b("终端出资", -1))])]),
        e("dl", ss, [
          e("div", null, [a[4] || (a[4] = e("dt", null, "完成目标", -1)), e("dd", null, r(t.listing.objective), 1)]),
          t.listing.requirements ? (i(), d("div", ls, [a[5] || (a[5] = e("dt", null, "执行约束", -1)), e("dd", null, r(t.listing.requirements), 1)])) : y("", !0),
          e("div", null, [a[6] || (a[6] = e("dt", null, "行动地点", -1)), e("dd", null, r(t.listing.location), 1)]),
          e("div", null, [a[7] || (a[7] = e("dt", null, "行动时机", -1)), e("dd", null, r(t.listing.timing), 1)]),
          e("div", ns, [a[8] || (a[8] = e("dt", null, "留意风险", -1)), e("dd", null, r(t.listing.risk), 1)])
        ]),
        e("div", is, [(i(!0), d(I, null, j(t.listing.tags, (s) => (i(), d("span", { key: s }, r(s), 1))), 128))])
      ]),
      a[9] || (a[9] = e("p", { class: "tasks-hint" }, "接取后由你执行，报酬自动托管；无需另找 NPC 领取任务。", -1)),
      e("div", rs, [t.disabledReason ? (i(), d("p", us, r(t.disabledReason), 1)) : y("", !0), e("button", {
        type: "button",
        class: "tasks-primary-button",
        disabled: t.listing.accepted || t.busy || !!t.disabledReason,
        onClick: a[0] || (a[0] = (s) => o.$emit("accept"))
      }, [m(g, { name: t.listing.accepted ? "check" : "plus" }, null, 8, ["name"]), b(r(t.listing.accepted ? "已接取这份委托" : t.busy ? "正在接取…" : "接下这份委托"), 1)], 8, ds)])
    ], 64)) : (i(), d("div", os, [
      m(g, { name: "ticket" }),
      a[10] || (a[10] = e("h3", null, "这批委托已更新", -1)),
      a[11] || (a[11] = e("p", null, "返回大厅，查看最新的委托。", -1))
    ]))]));
  }
}), ks = vs, cs = {
  key: 0,
  class: "tasks-candidates"
}, bs = ["data-tone"], ys = { class: "tasks-candidate-description" }, ms = { class: "tasks-candidate-facts" }, gs = ["disabled", "onClick"], fs = {
  key: 1,
  class: "tasks-empty"
}, hs = /* @__PURE__ */ D({
  __name: "TaskCandidateList",
  props: {
    task: {},
    busy: { type: Boolean },
    disabledReason: {}
  },
  emits: ["assign"],
  setup(t) {
    return (o, a) => t.task.candidates.length ? (i(), d("div", cs, [(i(!0), d(I, null, j(t.task.candidates, (s, c) => (i(), d("article", {
      key: s.candidateId,
      class: "tasks-candidate"
    }, [
      e("header", null, [e("span", {
        class: "tasks-candidate-avatar",
        "data-tone": c % 3,
        "aria-hidden": "true"
      }, r(Array.from(s.name)[0]), 9, bs), e("h3", null, r(s.name), 1)]),
      e("p", ys, r(s.description), 1),
      e("blockquote", null, "“" + r(s.pitch) + "”", 1),
      e("dl", ms, [e("div", null, [a[0] || (a[0] = e("dt", null, "擅长", -1)), e("dd", null, r(s.capability), 1)]), e("div", null, [a[1] || (a[1] = e("dt", null, "留意", -1)), e("dd", null, r(s.risk), 1)])]),
      e("button", {
        type: "button",
        class: "tasks-secondary-button tasks-full-button",
        disabled: t.busy || !!t.disabledReason,
        onClick: ($) => o.$emit("assign", t.task, s.candidateId)
      }, [e("span", null, "委托给 " + r(s.name), 1), m(g, { name: "next" })], 8, gs)
    ]))), 128))])) : (i(), d("div", fs, [m(g, { name: "people" }), a[2] || (a[2] = e("h3", null, "暂无应征者", -1))]));
  }
}), $s = hs, ps = { class: "tasks-page" }, Cs = { class: "tasks-recruit-heading" }, Is = { class: "tasks-reward" }, ws = { class: "tasks-section-heading" }, Rs = ["disabled"], Ts = ["role"], Bs = {
  key: 0,
  class: "tasks-hint"
}, Ms = { class: "tasks-withdraw" }, Ss = ["disabled"], As = {
  key: 1,
  class: "tasks-empty"
}, xs = {
  key: 1,
  class: "tasks-empty"
}, Ds = /* @__PURE__ */ D({
  __name: "TaskRecruitment",
  props: {
    task: {},
    busy: { type: Boolean },
    recruiting: { type: Boolean },
    disabledReason: {},
    generationDisabledReason: {}
  },
  emits: [
    "recruit",
    "assign",
    "cancel",
    "detail"
  ],
  setup(t) {
    return (o, a) => (i(), d("section", ps, [t.task ? (i(), d(I, { key: 0 }, [e("header", Cs, [
      a[6] || (a[6] = e("span", { class: "tasks-eyebrow" }, "报酬已托管", -1)),
      e("h2", null, r(t.task.title), 1),
      e("div", null, [e("strong", Is, "¤ " + r(S(N)(t.task.reward)), 1), e("button", {
        type: "button",
        class: "tasks-text-button",
        "data-navigation-id": "contract",
        onClick: a[0] || (a[0] = (s) => o.$emit("detail", t.task.taskId))
      }, [a[5] || (a[5] = b("查看委托内容", -1)), m(g, { name: "next" })])])
    ]), t.task.status === "recruiting" ? (i(), d(I, { key: 0 }, [
      e("header", ws, [e("h3", null, [a[7] || (a[7] = b("选择执行者 ", -1)), e("small", null, r(t.task.candidates.length), 1)]), e("button", {
        type: "button",
        class: "tasks-text-button",
        disabled: t.busy || t.recruiting || !!t.generationDisabledReason,
        onClick: a[1] || (a[1] = (s) => o.$emit("recruit", t.task))
      }, [m(g, {
        name: "refresh",
        class: J({ "is-spinning": t.recruiting })
      }, null, 8, ["class"]), b(r(t.recruiting ? "招募中…" : t.task.candidates.length ? "重新招募" : "开始招募"), 1)], 8, Rs)]),
      e("p", {
        class: "tasks-hint",
        role: t.recruiting ? "status" : void 0
      }, r(t.recruiting ? "正在招募，可离开页面等待。" : "招募将调用模型"), 9, Ts),
      t.disabledReason || t.generationDisabledReason ? (i(), d("p", Bs, r(t.disabledReason || t.generationDisabledReason), 1)) : y("", !0),
      m($s, {
        task: t.task,
        busy: t.busy || t.recruiting,
        "disabled-reason": t.disabledReason,
        onAssign: a[2] || (a[2] = (s, c) => o.$emit("assign", s, c))
      }, null, 8, [
        "task",
        "busy",
        "disabled-reason"
      ]),
      e("div", Ms, [e("button", {
        type: "button",
        class: "tasks-text-button is-danger",
        disabled: t.busy || !!t.disabledReason,
        onClick: a[3] || (a[3] = (s) => o.$emit("cancel", t.task))
      }, "取消委托并退回报酬", 8, Ss)])
    ], 64)) : (i(), d("div", As, [
      m(g, { name: "check" }),
      e("h3", null, r(t.task.status === "active" ? "执行者已接下委托" : "这份委托已结束"), 1),
      e("button", {
        type: "button",
        class: "tasks-primary-button",
        onClick: a[4] || (a[4] = (s) => o.$emit("detail", t.task.taskId))
      }, "查看任务进展")
    ]))], 64)) : (i(), d("div", xs, [...a[8] || (a[8] = [e("h3", null, "委托状态已更新", -1), e("p", null, "请返回“我发布”查看最新进展或已结束记录。", -1)])]))]));
  }
}), qs = Ds, Ls = { id: "tasks-confirm-title" }, Vs = { class: "tasks-dialog-copy" }, Ps = {
  key: 0,
  class: "tasks-dialog-error",
  role: "alert"
}, Ns = {
  key: 1,
  class: "tasks-hint"
}, js = ["disabled"], Es = ["disabled"], Hs = /* @__PURE__ */ D({
  __name: "TaskConfirmDialog",
  props: {
    title: {},
    confirmLabel: {},
    busy: { type: Boolean },
    disabledReason: {},
    error: {}
  },
  emits: ["close", "confirm"],
  setup(t, { emit: o }) {
    const a = o;
    return (s, c) => (i(), M(We, {
      class: "tasks-dialog",
      "aria-label": t.title,
      busy: t.busy,
      onClose: c[2] || (c[2] = ($) => a("close"))
    }, {
      default: ge(() => [
        e("h2", Ls, r(t.title), 1),
        e("div", Vs, [Fe(s.$slots, "default")]),
        t.error ? (i(), d("p", Ps, r(t.error), 1)) : y("", !0),
        t.disabledReason && !t.busy ? (i(), d("p", Ns, r(t.disabledReason), 1)) : y("", !0),
        e("footer", null, [e("button", {
          type: "button",
          class: "tasks-secondary-button",
          disabled: t.busy,
          autofocus: "",
          onClick: c[0] || (c[0] = ($) => a("close"))
        }, "返回", 8, js), e("button", {
          type: "button",
          class: "tasks-primary-button",
          disabled: t.busy || !!t.disabledReason,
          onClick: c[1] || (c[1] = ($) => a("confirm"))
        }, r(t.busy ? "正在保存…" : t.confirmLabel), 9, Es)])
      ]),
      _: 3
    }, 8, ["aria-label", "busy"]));
  }
}), Us = Hs, Zs = { class: "tasks-app" }, Os = { class: "tasks-app-header" }, Fs = {
  class: "tasks-balance",
  "aria-label": "小白币余额"
}, zs = {
  class: "tasks-notices",
  "aria-live": "polite"
}, Ks = ["disabled"], Gs = ["disabled"], Js = ["disabled"], Qs = {
  key: 1,
  class: "tasks-notice",
  role: "status"
}, Ws = {
  key: 0,
  class: "tasks-nav",
  "aria-label": "任务主导航"
}, Xs = ["aria-current"], Ys = ["aria-current"], _s = ["aria-current"], el = { key: 0 }, tl = ["aria-current"], al = { class: "tasks-confirm-name" }, sl = { class: "tasks-confirm-amount" }, ll = { class: "tasks-confirm-name" }, nl = {
  key: 0,
  class: "tasks-confirm-amount"
}, il = { class: "tasks-confirm-name" }, rl = 35e3, ul = /* @__PURE__ */ D({
  __name: "TasksApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(t) {
    const o = t;
    function a() {
      return {
        chatIdentity: "",
        status: "blocked",
        message: "任务状态未能载入。",
        writeState: "ready",
        settings: { autoMaintenance: !1 },
        playerBalance: 0,
        generationActive: !1,
        generation: {
          state: "idle",
          kind: null,
          taskId: null,
          message: ""
        },
        board: null,
        active: [],
        recruiting: [],
        history: {
          items: [],
          nextCursor: null,
          hasMore: !1
        },
        maintenance: {
          state: "idle",
          message: ""
        }
      };
    }
    function s(l) {
      return l && typeof l == "object" ? structuredClone(me(l)) : a();
    }
    function c(l) {
      return l !== null && typeof l == "object" && !Array.isArray(l);
    }
    function $(l) {
      return c(l) ? l.result : null;
    }
    const u = T(s(o.initialState)), k = T("board"), Q = {}, W = T(null), f = T(null), X = B(() => f.value?.kind === "cancel" && f.value.task.source === "received"), U = T(null), le = T(""), ee = T("all"), K = T(null), ne = {}, ie = B(() => tt(u.value)), he = B(() => ie.value.received), re = B(() => ie.value.published), $e = B(() => [...re.value, ...u.value.history.items].find((l) => l.taskId === le.value) ?? null), pe = B(() => u.value.board?.boardId === U.value?.boardId ? u.value.board?.listings.find((l) => l.listingId === U.value?.listingId) ?? null : null), te = B(() => [
      "board",
      "active",
      "published",
      "history"
    ].includes(k.value)), Ce = B(() => ({
      board: "任务",
      active: "任务",
      published: "任务",
      history: "任务",
      settings: "任务设置",
      publish: "发布委托",
      detail: "委托详情",
      listing: "委托详情",
      recruit: "招募执行者"
    })[k.value]);
    let Z = 0;
    const ue = B(() => u.value.generation.state === "running" && u.value.generation.kind === "board"), de = B(() => u.value.generation.state === "running" && u.value.generation.kind === "candidates" ? u.value.generation.taskId ?? "" : ""), A = T(!1), Y = T(!1), w = T(!1), ae = T(!1), _ = T(!1), h = T(""), E = T("");
    let R = 0, x = !1, oe = () => {
    };
    const ve = B(() => u.value.status === "unconfirmed"), L = B(() => A.value ? "正在处理上一项任务操作" : u.value.status === "loading" ? "任务数据正在准备" : u.value.status === "saving" ? "任务与资金正在保存" : u.value.status === "unconfirmed" ? "请先核实上一次保存结果" : u.value.status === "conflict" ? "请先采用服务端数据" : u.value.status === "blocked" ? u.value.message || "任务暂时不可用" : u.value.generationActive ? "正在生成内容，请稍后" : ""), O = B(() => L.value || (u.value.maintenance.state === "running" ? "正在更新任务" : "")), Ie = B(() => u.value.maintenance.message);
    function ke(l) {
      if (!l || typeof l.chatIdentity != "string") return;
      u.value = structuredClone(l), h.value = "";
      const n = W.value?.task;
      if (k.value === "detail" && n) {
        const v = [
          ...l.active,
          ...l.recruiting,
          ...l.history.items
        ].find((C) => C.taskId === n.taskId);
        v && v.eventId !== n.eventId && G(v.taskId, !0);
      }
    }
    function we(l) {
      if (!c(l)) return null;
      const n = c(l.state) ? l.state : l;
      return typeof n.chatIdentity == "string" ? n : null;
    }
    function V(l) {
      const n = l instanceof Error ? l.message : String(l);
      return n === "tasks_insufficient_funds" ? "小白币余额不足，任务没有发布。" : n === "tasks_state_changed" || n === "tasks_listing_already_accepted" ? "任务状态已经变化，请按最新状态重试。" : n === "tasks_terminal" ? "该任务已经结束，不能再次操作。" : n === "tasks_publish_invalid" || n === "tasks_request_invalid" ? "任务内容不完整或超出允许范围。" : n === "tasks_write_blocked" || n === "tasks_generation_active" ? "当前有生成或保存正在进行，请稍后重试。" : n === "tasks_chat_changed" ? "聊天已经切换，请重新打开任务。" : n === "host_request_timeout" ? "操作响应超时，结果可能稍后返回，请勿立即重复。" : "任务操作未完成，请稍后重试。";
    }
    async function q(l, n = {}, v = rl) {
      return $(await o.bridge.request(l, {
        chatIdentity: u.value.chatIdentity,
        ...n
      }, v));
    }
    function P(l, n) {
      if (R !== n) return;
      const v = we(l);
      v?.chatIdentity === u.value.chatIdentity && ke(v);
    }
    function H(l) {
      E.value = l, h.value = "";
    }
    async function Re() {
      if (ue.value || O.value) return;
      h.value = "";
      const l = R;
      try {
        const n = await q("tasks/refresh");
        if (!x) return;
        P(n, l);
      } catch (n) {
        x && (h.value = V(n));
      }
    }
    async function Te(l, n) {
      if (L.value) return;
      A.value = !0;
      const v = R;
      try {
        P(await q("tasks/board/accept", {
          boardId: l,
          listingId: n
        }), v), x && k.value === "listing" && p("active"), H("任务已接取，报酬已进入托管。");
      } catch (C) {
        h.value = V(C);
      } finally {
        A.value = !1;
      }
    }
    async function Be(l) {
      if (de.value || O.value) return;
      h.value = "";
      const n = R;
      try {
        const v = await q("tasks/candidates/refresh", {
          taskId: l.taskId,
          expectedTaskRevision: l.taskRevision,
          expectedEventId: l.eventId
        });
        if (!x) return;
        P(v, n);
      } catch (v) {
        x && (h.value = V(v));
      }
    }
    async function Me(l, n) {
      if (L.value) return;
      A.value = !0;
      const v = R;
      try {
        P(await q("tasks/candidates/assign", {
          taskId: l.taskId,
          expectedTaskRevision: l.taskRevision,
          expectedEventId: l.eventId,
          candidateId: n
        }), v), f.value = null, x && p("published"), H("执行者已确认，任务进入进行中。");
      } catch (C) {
        h.value = V(C);
      } finally {
        A.value = !1;
      }
    }
    async function Se(l) {
      if (L.value) return;
      A.value = !0;
      const n = R;
      try {
        P(await q("tasks/cancel", {
          taskId: l.taskId,
          expectedTaskRevision: l.taskRevision,
          expectedEventId: l.eventId
        }), n), f.value = null, x && p(l.source === "received" ? "active" : "published"), H(l.source === "received" ? "已放弃任务，不会扣除小白币。" : "委托已取消，托管报酬已退回钱包。");
      } catch (v) {
        h.value = V(v);
      } finally {
        A.value = !1;
      }
    }
    function Ae(l) {
      L.value || (h.value = "", f.value = {
        kind: "publish",
        form: structuredClone(l)
      });
    }
    async function xe() {
      const l = f.value?.kind === "publish" ? f.value.form : null;
      if (!l || L.value) return;
      A.value = !0;
      const n = R;
      try {
        P(await q("tasks/publish", { form: me(l) }), n), f.value = null, p("published"), H("任务已发布，报酬已锁入托管。");
      } catch (v) {
        h.value = V(v);
      } finally {
        A.value = !1;
      }
    }
    async function De(l) {
      if (Y.value) return;
      Y.value = !0;
      const n = R;
      try {
        P(await q("tasks/settings/update", { autoMaintenance: l }), n), H(l ? "已开启任务进展自动更新。" : "已关闭任务进展自动更新。");
      } catch (v) {
        h.value = V(v);
      } finally {
        Y.value = !1;
      }
    }
    async function qe() {
      if (u.value.maintenance.state === "running" || O.value) return;
      const l = R;
      try {
        P(await q("tasks/maintenance/run"), l);
      } catch (n) {
        h.value = V(n);
      }
    }
    async function G(l, n = !1) {
      n || (p("detail"), W.value = null, ae.value = !0);
      const v = ++Z;
      try {
        const C = await q("tasks/detail/read", { taskId: l });
        if (!x || v !== Z) return;
        c(C) && c(C.task) && Array.isArray(C.timeline) && (W.value = structuredClone(C));
      } catch (C) {
        x && v === Z && (h.value = V(C));
      } finally {
        x && v === Z && (ae.value = !1);
      }
    }
    async function Le() {
      const l = u.value.history.nextCursor;
      if (!l || _.value) return;
      _.value = !0;
      const n = {
        cursor: l,
        stateVersion: R
      };
      try {
        const v = await q("tasks/history/load-more", { cursor: l });
        if (x && c(v) && Array.isArray(v.items)) {
          const C = v, ye = Qa(u.value.history, C, n, R);
          ye && (u.value.history = ye);
        }
      } catch (v) {
        h.value = V(v);
      } finally {
        _.value = !1;
      }
    }
    async function Ve() {
      if (w.value) return;
      w.value = !0, h.value = "", E.value = "";
      const l = R;
      try {
        const n = await q("tasks/save/confirm");
        P(n, l), c(n) && n.confirmation === "confirmed" && H("保存已确认。");
      } catch (n) {
        h.value = V(n);
      } finally {
        w.value = !1;
      }
    }
    async function Pe() {
      if (w.value) return;
      w.value = !0, h.value = "", E.value = "";
      const l = R;
      try {
        const n = await q("tasks/save/adopt-server");
        P(n, l), c(n) && n.adoption === "adopted" && H("已采用服务端数据。");
      } catch (n) {
        h.value = V(n);
      } finally {
        w.value = !1;
      }
    }
    async function Ne() {
      if (w.value) return;
      w.value = !0, h.value = "", E.value = "";
      const l = R;
      try {
        P(await q("tasks/read"), l);
      } catch {
        h.value = "读取未完成，请检查存储连接后重试读取。";
      } finally {
        w.value = !1;
      }
    }
    function p(l, n = !1) {
      E.value = "", l !== k.value && !n && (Q[l] = [
        "board",
        "active",
        "published",
        "history"
      ].includes(l) ? "board" : k.value), ne[k.value] = {
        scrollTop: K.value?.scrollTop ?? 0,
        focusKey: document.activeElement instanceof HTMLElement ? document.activeElement.dataset.navigationId ?? "" : ""
      }, Z += 1, k.value = l, Je(() => {
        if (!x || k.value !== l) return;
        const v = n ? ne[l] : void 0;
        K.value?.scrollTo(0, v?.scrollTop ?? 0), ((v?.focusKey ? Array.from(K.value?.closest("main")?.querySelectorAll("button[data-navigation-id]") ?? []).find((C) => C.dataset.navigationId === v.focusKey) : void 0) ?? K.value)?.focus({ preventScroll: !0 });
      });
    }
    const ce = Qe(() => k.value === "board" ? !1 : (p(Q[k.value] ?? "board", !0), !0));
    function je(l, n) {
      U.value = {
        boardId: l,
        listingId: n
      }, p("listing");
    }
    function Ee(l) {
      l.status === "recruiting" ? (le.value = l.taskId, p("recruit")) : G(l.taskId);
    }
    function He() {
      ee.value = "published", p("history"), Q.history = "published";
    }
    function be(l) {
      h.value = "", f.value = {
        kind: "cancel",
        task: l
      };
    }
    function Ue(l, n) {
      h.value = "", f.value = {
        kind: "assign",
        task: l,
        candidateId: n
      };
    }
    function Ze() {
      const l = f.value;
      l && (l.kind === "publish" ? xe() : l.kind === "cancel" ? Se(l.task) : Me(l.task, l.candidateId));
    }
    return Oe(() => {
      x = !0, oe = o.bridge.subscribe((l) => {
        if (l.type === "tasks/state") {
          const n = l.payload?.state;
          n && (R += 1, ke(n));
        }
        l.type === "tasks/error" && (h.value = "任务状态暂时无法读取，请重新打开。");
      }), o.bridge.post("tasks/activate", { chatIdentity: u.value.chatIdentity });
    }), ze(() => {
      x = !1, Z += 1, oe(), f.value = null;
    }), (l, n) => (i(), d("main", Zs, [
      e("header", Os, [
        te.value ? y("", !0) : (i(), d("button", {
          key: 0,
          type: "button",
          class: "tasks-icon-button",
          "aria-label": "返回上一页",
          onClick: n[0] || (n[0] = (...v) => S(ce) && S(ce)(...v))
        }, [m(g, { name: "back" })])),
        e("h1", null, r(Ce.value), 1),
        e("div", Fs, [e("strong", null, "¤ " + r(S(N)(u.value.playerBalance)), 1)]),
        te.value ? (i(), d("button", {
          key: 1,
          type: "button",
          class: "tasks-icon-button",
          "aria-label": "任务设置",
          "data-navigation-id": "settings",
          onClick: n[1] || (n[1] = (v) => p("settings"))
        }, [m(g, { name: "settings" })])) : y("", !0)
      ]),
      e("div", zs, [u.value.message || h.value && !f.value || E.value ? (i(), d("aside", {
        key: 0,
        class: J(["tasks-notice", {
          "is-error": !!h.value || u.value.status === "conflict" || u.value.status === "blocked",
          "is-warning": ve.value
        }]),
        role: "status"
      }, [e("div", null, [e("p", null, r(u.value.message || (f.value ? "" : h.value) || E.value), 1), ve.value ? (i(), d("button", {
        key: 0,
        type: "button",
        disabled: w.value,
        onClick: Ve
      }, r(w.value ? "正在核实…" : "核实保存结果"), 9, Ks)) : u.value.status === "conflict" ? (i(), d("button", {
        key: 1,
        type: "button",
        disabled: w.value,
        onClick: Pe
      }, r(w.value ? "正在采用…" : "采用服务端数据"), 9, Gs)) : u.value.status === "blocked" ? (i(), d("button", {
        key: 2,
        type: "button",
        disabled: w.value,
        onClick: Ne
      }, r(w.value ? "正在读取…" : "重试读取"), 9, Js)) : y("", !0)]), u.value.message ? y("", !0) : (i(), d("button", {
        key: 0,
        type: "button",
        class: "tasks-icon-button",
        "aria-label": "关闭提示",
        onClick: n[2] || (n[2] = (v) => {
          h.value = "", E.value = "";
        })
      }, [m(g, { name: "close" })]))], 2)) : y("", !0), u.value.generation.message && !u.value.message ? (i(), d("aside", Qs, [e("p", null, r(u.value.generation.message), 1)])) : y("", !0)]),
      e("div", {
        ref_key: "content",
        ref: K,
        class: "tasks-content",
        tabindex: "-1"
      }, [k.value === "board" ? (i(), M(pa, {
        key: 0,
        board: u.value.board,
        busy: ue.value,
        "disabled-reason": O.value,
        onRefresh: Re,
        onDetail: je
      }, null, 8, [
        "board",
        "busy",
        "disabled-reason"
      ])) : k.value === "active" ? (i(), M(ta, {
        key: 1,
        records: he.value,
        onDetail: G,
        onDiscover: n[3] || (n[3] = (v) => p("board"))
      }, null, 8, ["records"])) : k.value === "published" ? (i(), M(Na, {
        key: 2,
        records: re.value,
        "disabled-reason": L.value,
        onOpen: Ee,
        onPublish: n[4] || (n[4] = (v) => p("publish")),
        onHistory: He
      }, null, 8, ["records", "disabled-reason"])) : k.value === "history" ? (i(), M(Sa, {
        key: 3,
        history: u.value.history,
        loading: _.value,
        source: ee.value,
        onFilter: n[5] || (n[5] = (v) => ee.value = v),
        onDetail: G,
        onLoadMore: Le
      }, null, 8, [
        "history",
        "loading",
        "source"
      ])) : k.value === "settings" ? (i(), M(Ja, {
        key: 4,
        "auto-maintenance": u.value.settings.autoMaintenance,
        "settings-busy": Y.value,
        "maintenance-busy": u.value.maintenance.state === "running",
        "maintenance-message": Ie.value,
        "disabled-reason": O.value,
        onUpdate: De,
        onMaintain: qe
      }, null, 8, [
        "auto-maintenance",
        "settings-busy",
        "maintenance-busy",
        "maintenance-message",
        "disabled-reason"
      ])) : k.value === "publish" ? (i(), M(Ht, {
        key: 5,
        balance: u.value.playerBalance,
        busy: A.value,
        "disabled-reason": L.value,
        onSubmit: Ae
      }, null, 8, [
        "balance",
        "busy",
        "disabled-reason"
      ])) : k.value === "listing" ? (i(), M(ks, {
        key: 6,
        listing: pe.value,
        busy: A.value,
        "disabled-reason": L.value,
        onAccept: n[6] || (n[6] = (v) => U.value && Te(U.value.boardId, U.value.listingId))
      }, null, 8, [
        "listing",
        "busy",
        "disabled-reason"
      ])) : k.value === "recruit" ? (i(), M(qs, {
        key: 7,
        task: $e.value,
        busy: A.value,
        recruiting: !!de.value,
        "disabled-reason": L.value,
        "generation-disabled-reason": O.value,
        onRecruit: Be,
        onAssign: Ue,
        onCancel: be,
        onDetail: G
      }, null, 8, [
        "task",
        "busy",
        "recruiting",
        "disabled-reason",
        "generation-disabled-reason"
      ])) : (i(), M(wt, {
        key: 8,
        detail: W.value,
        loading: ae.value,
        busy: A.value,
        "disabled-reason": L.value,
        onCancel: be
      }, null, 8, [
        "detail",
        "loading",
        "busy",
        "disabled-reason"
      ]))], 512),
      te.value ? (i(), d("nav", Ws, [
        e("button", {
          type: "button",
          "aria-label": "发现委托",
          "aria-current": k.value === "board" ? "page" : void 0,
          onClick: n[7] || (n[7] = (v) => p("board"))
        }, [e("span", null, [m(g, { name: "compass" })]), n[12] || (n[12] = b("发现", -1))], 8, Xs),
        e("button", {
          type: "button",
          "aria-label": "我接的",
          "aria-current": k.value === "active" ? "page" : void 0,
          onClick: n[8] || (n[8] = (v) => p("active"))
        }, [e("span", null, [m(g, { name: "ticket" })]), n[13] || (n[13] = b("我接的", -1))], 8, Ys),
        e("button", {
          type: "button",
          "aria-label": "我发布",
          "aria-current": k.value === "published" ? "page" : void 0,
          onClick: n[9] || (n[9] = (v) => p("published"))
        }, [e("span", null, [m(g, { name: "send" }), u.value.recruiting.length ? (i(), d("i", el)) : y("", !0)]), n[14] || (n[14] = b("我发布", -1))], 8, _s),
        e("button", {
          type: "button",
          "aria-label": "记录",
          "aria-current": k.value === "history" ? "page" : void 0,
          onClick: n[10] || (n[10] = (v) => p("history"))
        }, [e("span", null, [m(g, { name: "archive" })]), n[15] || (n[15] = b("记录", -1))], 8, tl)
      ])) : y("", !0),
      f.value ? (i(), M(Us, {
        key: 1,
        title: f.value.kind === "publish" ? "确认发布" : f.value.kind === "cancel" ? X.value ? "放弃任务？" : "取消委托？" : "确认执行者",
        "confirm-label": f.value.kind === "publish" ? "托管并发布" : f.value.kind === "cancel" ? X.value ? "确认放弃" : "取消并退款" : "确认委托",
        busy: A.value,
        "disabled-reason": L.value,
        error: h.value,
        onClose: n[11] || (n[11] = (v) => {
          f.value = null, h.value = "";
        }),
        onConfirm: Ze
      }, {
        default: ge(() => [f.value.kind === "publish" ? (i(), d(I, { key: 0 }, [
          e("p", al, r(f.value.form.title), 1),
          e("strong", sl, "¤ " + r(S(N)(f.value.form.reward)), 1),
          n[16] || (n[16] = e("p", null, "报酬将从钱包托管。发布后可招募执行者；任务结束前，你可以取消并全额退回报酬。", -1))
        ], 64)) : f.value.kind === "cancel" ? (i(), d(I, { key: 1 }, [
          e("p", ll, r(f.value.task.title), 1),
          X.value ? y("", !0) : (i(), d("strong", nl, "¤ " + r(S(N)(f.value.task.reward)), 1)),
          e("p", null, r(X.value ? "放弃后不再获得任务报酬，也不会扣除你的小白币。" : "取消后，托管报酬将全额退回你的钱包。"), 1),
          n[17] || (n[17] = e("p", null, "任务将移入记录，不再参与后续剧情提醒与进展更新。此操作无法撤销。", -1))
        ], 64)) : (i(), d(I, { key: 2 }, [e("p", il, r(f.value.task.candidates.find((v) => v.candidateId === (f.value?.kind === "assign" ? f.value.candidateId : ""))?.name), 1), e("p", null, "确认后开始执行“" + r(f.value.task.title) + "”。完成后，托管报酬将支付给执行者。", 1)], 64))]),
        _: 1
      }, 8, [
        "title",
        "confirm-label",
        "busy",
        "disabled-reason",
        "error"
      ])) : y("", !0)
    ]));
  }
}), kl = ul;
export {
  kl as default
};
