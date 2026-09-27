/* eslint-disable */
import { $ as Y, E as Qe, F as u, G as Q, J as Ge, L as O, M as Je, O as We, Q as A, R as Ye, W as fe, Y as R, Z as ge, _ as d, b as g, g as m, h as S, l as Xe, m as e, o as G, p as I, tt as r, u as T, x, y } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { n as _e } from "./xiaobai-os-app-navigation-CKmHuh0u.js";
import { t as et } from "./xiaobai-os-AppDialog-CaAiivYL.js";
var tt = {
  class: "tasks-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.7",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true"
}, at = ["d"], st = /* @__PURE__ */ x({
  __name: "TaskIcon",
  props: { name: {} },
  setup(t) {
    const v = {
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
    return (a, s) => (u(), d("svg", tt, [e("path", { d: v[t.name] }, null, 8, at)]));
  }
}), f = st, he = {
  recruiting: "招募中",
  active: "进行中",
  completed: "已完成",
  failed: "未完成",
  cancelled: "已取消"
};
function P(t) {
  return t.toLocaleString("zh-CN");
}
function lt(t) {
  return t.source === "received" ? "任务终端" : `${t.issuer.displayName}（你）`;
}
function nt(t) {
  return {
    received: t.active.filter((v) => v.source === "received"),
    published: [...t.recruiting, ...t.active.filter((v) => v.source === "published")].sort((v, a) => a.updatedAt - v.updatedAt || a.taskId.localeCompare(v.taskId))
  };
}
var it = { class: "tasks-page tasks-detail-page" }, ut = {
  key: 0,
  class: "tasks-empty",
  role: "status"
}, rt = { class: "tasks-contract-heading" }, dt = ["data-status"], ot = {
  key: 0,
  class: "tasks-hint"
}, vt = { class: "tasks-progress-summary" }, kt = { class: "tasks-eyebrow" }, ct = { class: "tasks-facts" }, bt = { class: "tasks-contract-more" }, yt = {
  key: 0,
  class: "tasks-hint"
}, mt = { class: "tasks-contract-reward" }, gt = { class: "tasks-seal" }, ft = { class: "tasks-party-line" }, ht = { class: "tasks-facts" }, $t = { key: 0 }, pt = { key: 1 }, It = {
  key: 2,
  class: "is-risk"
}, Ct = {
  key: 1,
  class: "tasks-withdraw"
}, Rt = ["disabled"], Tt = {
  key: 0,
  class: "tasks-hint"
}, wt = { class: "tasks-timeline" }, Bt = {
  key: 2,
  class: "tasks-empty"
}, Mt = /* @__PURE__ */ x({
  __name: "TaskDetail",
  props: {
    detail: {},
    loading: { type: Boolean },
    busy: { type: Boolean },
    disabledReason: {}
  },
  emits: ["cancel"],
  setup(t) {
    function v(a) {
      return new Date(a).toLocaleString("zh-CN", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: !1
      });
    }
    return (a, s) => (u(), d("section", it, [t.loading ? (u(), d("div", ut, [g(f, {
      name: "refresh",
      class: "is-spinning"
    }), s[1] || (s[1] = e("h3", null, "正在读取委托…", -1))])) : t.detail ? (u(), d(T, { key: 1 }, [
      e("header", rt, [e("span", {
        class: "tasks-status",
        "data-status": t.detail.task.status
      }, [s[2] || (s[2] = e("i", null, null, -1)), y(r(A(he)[t.detail.task.status]), 1)], 8, dt), e("h2", null, r(t.detail.task.title), 1)]),
      t.detail.sourceLabel ? (u(), d("p", ot, "来自 " + r(t.detail.sourceLabel), 1)) : m("", !0),
      e("section", vt, [e("span", kt, r(t.detail.task.resultSummary ? "最终结果" : "当前进展"), 1), e("p", null, r(t.detail.task.resultSummary || t.detail.task.progressSummary || "暂无新进展"), 1)]),
      e("dl", ct, [e("div", null, [s[3] || (s[3] = e("dt", null, "完成目标", -1)), e("dd", null, r(t.detail.task.objective), 1)])]),
      e("details", bt, [
        s[12] || (s[12] = e("summary", null, "委托内容与报酬", -1)),
        t.detail.task.hook ? (u(), d("p", yt, r(t.detail.task.hook), 1)) : m("", !0),
        e("div", mt, [e("span", null, [s[5] || (s[5] = y("委托报酬", -1)), e("strong", null, [s[4] || (s[4] = e("small", null, "¤", -1)), y(" " + r(A(P)(t.detail.task.reward)), 1)])]), e("span", gt, r(t.detail.task.source === "received" ? "终端委托" : "我的委托"), 1)]),
        e("div", ft, [
          e("span", null, [s[6] || (s[6] = y("发布者", -1)), e("strong", null, r(A(lt)(t.detail.task)), 1)]),
          g(f, { name: "next" }),
          e("span", null, [s[7] || (s[7] = y("执行者", -1)), e("strong", null, r(t.detail.task.assignee?.displayName || "等待选人"), 1)])
        ]),
        e("dl", ht, [
          t.detail.task.requirements ? (u(), d("div", $t, [s[8] || (s[8] = e("dt", null, "要求", -1)), e("dd", null, r(t.detail.task.requirements), 1)])) : m("", !0),
          e("div", null, [s[9] || (s[9] = e("dt", null, "地点", -1)), e("dd", null, r(t.detail.task.location), 1)]),
          t.detail.task.timing ? (u(), d("div", pt, [s[10] || (s[10] = e("dt", null, "时机", -1)), e("dd", null, r(t.detail.task.timing), 1)])) : m("", !0),
          t.detail.task.risk ? (u(), d("div", It, [s[11] || (s[11] = e("dt", null, "风险", -1)), e("dd", null, r(t.detail.task.risk), 1)])) : m("", !0)
        ])
      ]),
      t.detail.task.status === "active" || t.detail.task.status === "recruiting" ? (u(), d("div", Ct, [e("button", {
        type: "button",
        class: "tasks-text-button is-danger",
        disabled: t.busy || !!t.disabledReason,
        onClick: s[0] || (s[0] = (c) => a.$emit("cancel", t.detail.task))
      }, r(t.detail.task.source === "received" ? "放弃任务" : "取消委托并退回报酬"), 9, Rt), t.disabledReason ? (u(), d("p", Tt, r(t.disabledReason), 1)) : m("", !0)])) : m("", !0),
      e("section", wt, [s[14] || (s[14] = e("h3", null, "进展记录", -1)), e("ol", null, [(u(!0), d(T, null, O(t.detail.timeline, (c) => (u(), d("li", { key: c.eventId }, [s[13] || (s[13] = e("i", null, null, -1)), e("div", null, [e("small", null, r(v(c.createdAt)), 1), e("p", null, r(c.summary), 1)])]))), 128))])])
    ], 64)) : (u(), d("div", Bt, [...s[15] || (s[15] = [e("h3", null, "这份委托暂时无法读取", -1), e("p", null, "请返回后重试。", -1)])]))]));
  }
}), St = Mt, At = { class: "tasks-page tasks-publish-page" }, Dt = ["disabled"], xt = { class: "tasks-form-group" }, Lt = { class: "tasks-form-extra" }, qt = { class: "tasks-form-group" }, Et = { class: "tasks-reward-editor" }, Nt = { class: "tasks-amount-input" }, Vt = ["max"], Pt = { class: "tasks-reward-presets" }, Ot = [
  "aria-pressed",
  "disabled",
  "onClick"
], jt = {
  key: 0,
  class: "tasks-error-text",
  role: "status"
}, Ut = { class: "tasks-hint" }, Zt = {
  key: 0,
  class: "tasks-hint"
}, Ht = ["disabled"], Ft = /* @__PURE__ */ x({
  __name: "TaskPublishForm",
  props: {
    balance: {},
    busy: { type: Boolean },
    disabledReason: {}
  },
  emits: ["submit"],
  setup(t, { emit: v }) {
    const a = v, s = Ge({
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
    return (p, i) => (u(), d("section", At, [e("form", {
      class: "tasks-publish-form",
      onSubmit: Xe(c, ["prevent"])
    }, [
      e("fieldset", { disabled: t.busy }, [
        i[15] || (i[15] = e("legend", { class: "tasks-sr-only" }, "委托内容", -1)),
        e("div", xt, [
          e("label", null, [i[6] || (i[6] = e("span", null, [y("委托名称 "), e("b", null, "*")], -1)), Q(e("input", {
            "onUpdate:modelValue": i[0] || (i[0] = (k) => s.title = k),
            required: "",
            maxlength: "120",
            autocomplete: "off",
            placeholder: "例如：找回钟楼的手札"
          }, null, 512), [[G, s.title]])]),
          e("label", null, [i[7] || (i[7] = e("span", null, [y("完成目标 "), e("b", null, "*")], -1)), Q(e("textarea", {
            "onUpdate:modelValue": i[1] || (i[1] = (k) => s.objective = k),
            required: "",
            maxlength: "8000",
            rows: "3",
            placeholder: "怎样才算完成？"
          }, null, 512), [[G, s.objective]])]),
          e("label", null, [i[8] || (i[8] = e("span", null, [y("行动地点 "), e("b", null, "*")], -1)), Q(e("input", {
            "onUpdate:modelValue": i[2] || (i[2] = (k) => s.location = k),
            required: "",
            maxlength: "600",
            autocomplete: "off",
            placeholder: "例如：旧城钟楼"
          }, null, 512), [[G, s.location]])])
        ]),
        e("details", Lt, [i[11] || (i[11] = e("summary", null, [y("补充约束与风险 "), e("span", null, "选填")], -1)), e("div", qt, [e("label", null, [i[9] || (i[9] = e("span", null, "执行约束", -1)), Q(e("textarea", {
          "onUpdate:modelValue": i[3] || (i[3] = (k) => s.requirements = k),
          maxlength: "8000",
          rows: "3",
          placeholder: "对行动方式的要求，不增加第二个目标"
        }, null, 512), [[G, s.requirements]])]), e("label", null, [i[10] || (i[10] = e("span", null, "已知风险", -1)), Q(e("textarea", {
          "onUpdate:modelValue": i[4] || (i[4] = (k) => s.risk = k),
          maxlength: "2000",
          rows: "3",
          placeholder: "有哪些需要执行者提前知道的风险？"
        }, null, 512), [[G, s.risk]])])])]),
        e("div", Et, [
          e("label", null, [i[13] || (i[13] = e("span", null, [y("为这份委托设定报酬 "), e("b", null, "*")], -1)), e("span", Nt, [i[12] || (i[12] = e("i", null, "¤", -1)), Q(e("input", {
            "onUpdate:modelValue": i[5] || (i[5] = (k) => s.reward = k),
            "aria-label": "托管报酬",
            type: "number",
            required: "",
            min: "1",
            max: t.balance,
            step: "1"
          }, null, 8, Vt), [[
            G,
            s.reward,
            void 0,
            { number: !0 }
          ]])])]),
          e("div", Pt, [(u(), d(T, null, O([
            20,
            50,
            100
          ], (k) => e("button", {
            key: k,
            type: "button",
            "aria-pressed": Number(s.reward) === k,
            disabled: k > t.balance,
            onClick: (X) => s.reward = k
          }, "¤ " + r(k), 9, Ot)), 64))]),
          e("p", null, [i[14] || (i[14] = y("可用余额 ", -1)), e("strong", null, "¤ " + r(A(P)(t.balance)), 1)]),
          Number(s.reward) > t.balance ? (u(), d("p", jt, "报酬超出可用余额，请调整金额。")) : m("", !0)
        ])
      ], 8, Dt),
      e("p", Ut, [g(f, { name: "ticket" }), i[16] || (i[16] = y("发布时托管报酬；招募中或执行中均可取消，全额退还托管报酬。", -1))]),
      t.disabledReason ? (u(), d("p", Zt, r(t.disabledReason), 1)) : m("", !0),
      e("button", {
        type: "submit",
        class: "tasks-primary-button tasks-full-button",
        disabled: t.busy || !!t.disabledReason || Number(s.reward) > t.balance
      }, [y(r(t.busy ? "正在发布…" : "预览并发布"), 1), g(f, { name: "next" })], 8, Ht)
    ], 32)]));
  }
}), zt = Ft, Kt = ["data-navigation-id"], Qt = { class: "tasks-record-top" }, Gt = ["data-status"], Jt = { class: "tasks-reward" }, Wt = { class: "tasks-record-title" }, Yt = { class: "tasks-record-summary" }, Xt = { class: "tasks-record-foot" }, _t = /* @__PURE__ */ x({
  __name: "TaskRecordCard",
  props: {
    task: {},
    sourceLabel: {}
  },
  emits: ["open"],
  setup(t) {
    return (v, a) => (u(), d("button", {
      type: "button",
      class: "tasks-record",
      "data-navigation-id": `task:${t.task.taskId}`,
      onClick: a[0] || (a[0] = (s) => v.$emit("open", t.task))
    }, [
      e("span", Qt, [e("span", {
        class: "tasks-status",
        "data-status": t.task.status
      }, [a[1] || (a[1] = e("i", null, null, -1)), y(r(A(he)[t.task.status]), 1)], 8, Gt), e("span", Jt, [a[2] || (a[2] = e("small", null, "¤", -1)), y(" " + r(A(P)(t.task.reward)), 1)])]),
      e("strong", Wt, r(t.task.title), 1),
      e("span", Yt, r(t.task.resultSummary || t.task.progressSummary || (t.task.status === "recruiting" ? "委托已发布，等待你选择执行者。" : "任务已开始，等待新的进展。")), 1),
      e("span", Xt, [e("span", null, [g(f, { name: t.task.source === "received" ? "pin" : "people" }, null, 8, ["name"]), y(r(t.sourceLabel || (t.task.source === "received" ? t.task.location : t.task.assignee?.displayName || `${t.task.candidates.length} 位候选人`)), 1)]), g(f, { name: "next" })])
    ], 8, Kt));
  }
}), ie = _t, ea = { class: "tasks-page" }, ta = { class: "tasks-section-heading" }, aa = { key: 0 }, sa = {
  key: 0,
  class: "tasks-empty"
}, la = {
  key: 1,
  class: "tasks-record-list"
}, na = /* @__PURE__ */ x({
  __name: "TasksActive",
  props: { records: {} },
  emits: ["detail", "discover"],
  setup(t) {
    return (v, a) => (u(), d("section", ea, [e("header", ta, [a[1] || (a[1] = e("h2", null, "我接的", -1)), t.records.length ? (u(), d("small", aa, r(t.records.length) + " 项", 1)) : m("", !0)]), t.records.length ? (u(), d("div", la, [(u(!0), d(T, null, O(t.records, (s) => (u(), S(ie, {
      key: s.taskId,
      task: s,
      onOpen: (c) => v.$emit("detail", s.taskId)
    }, null, 8, ["task", "onOpen"]))), 128))])) : (u(), d("div", sa, [
      g(f, { name: "compass" }),
      a[2] || (a[2] = e("h3", null, "暂无进行中的委托", -1)),
      e("button", {
        type: "button",
        class: "tasks-primary-button",
        onClick: a[0] || (a[0] = (s) => v.$emit("discover"))
      }, "发现委托")
    ]))]));
  }
}), ia = na, ua = { class: "tasks-page tasks-board-page" }, ra = { class: "tasks-section-heading" }, da = ["disabled"], oa = {
  key: 0,
  class: "tasks-hint",
  role: "status"
}, va = {
  key: 1,
  class: "tasks-empty"
}, ka = ["disabled"], ca = ["aria-busy"], ba = ["data-navigation-id", "onClick"], ya = { class: "tasks-ticket-top" }, ma = ["data-grade", "aria-label"], ga = { class: "tasks-ticket-tags" }, fa = ["aria-label"], ha = { class: "tasks-ticket-title" }, $a = { class: "tasks-ticket-hook" }, pa = { class: "tasks-ticket-foot" }, Ia = { class: "tasks-ticket-location" }, Ca = {
  key: 0,
  class: "tasks-accepted"
}, Ra = {
  key: 3,
  class: "tasks-footnote"
}, Ta = /* @__PURE__ */ x({
  __name: "TasksBoard",
  props: {
    board: {},
    busy: { type: Boolean },
    disabledReason: {}
  },
  emits: ["refresh", "detail"],
  setup(t) {
    return (v, a) => (u(), d("section", ua, [
      e("header", ra, [a[2] || (a[2] = e("h2", null, "发现委托", -1)), t.board?.listings.length ? (u(), d("button", {
        key: 0,
        type: "button",
        class: "tasks-text-button",
        disabled: t.busy || !!t.disabledReason,
        onClick: a[0] || (a[0] = (s) => v.$emit("refresh"))
      }, [g(f, {
        name: "refresh",
        class: Y({ "is-spinning": t.busy })
      }, null, 8, ["class"]), y(r(t.busy ? "获取中…" : "换一批"), 1)], 8, da)) : m("", !0)]),
      t.disabledReason ? (u(), d("p", oa, r(t.disabledReason), 1)) : m("", !0),
      !t.board || !t.board.listings.length ? (u(), d("div", va, [
        g(f, { name: "compass" }),
        e("h3", null, r(t.busy ? "正在获取委托…" : "暂无委托"), 1),
        t.busy ? m("", !0) : (u(), d("button", {
          key: 0,
          type: "button",
          class: "tasks-primary-button",
          disabled: !!t.disabledReason,
          onClick: a[1] || (a[1] = (s) => v.$emit("refresh"))
        }, "获取委托", 8, ka)),
        a[3] || (a[3] = e("p", null, "获取委托将调用模型", -1))
      ])) : (u(), d("div", {
        key: 2,
        class: "tasks-board-list",
        "aria-busy": t.busy
      }, [(u(!0), d(T, null, O(t.board.listings, (s) => (u(), d("button", {
        key: s.listingId,
        "data-navigation-id": `listing:${s.listingId}`,
        type: "button",
        class: Y(["tasks-ticket", { "is-accepted": s.accepted }]),
        onClick: (c) => v.$emit("detail", t.board.boardId, s.listingId)
      }, [
        e("span", ya, [
          e("span", {
            class: "tasks-grade",
            "data-grade": s.grade,
            "aria-label": `等级 ${s.grade}`
          }, r(s.grade), 9, ma),
          e("span", ga, r(s.tags.slice(0, 2).join(" · ")), 1),
          e("span", {
            class: "tasks-reward",
            "aria-label": `报酬 ${A(P)(s.reward)} 小白币`
          }, [a[4] || (a[4] = e("small", null, "¤", -1)), y(" " + r(A(P)(s.reward)), 1)], 8, fa)
        ]),
        e("strong", ha, r(s.title), 1),
        e("span", $a, r(s.hook), 1),
        e("span", pa, [e("span", Ia, [g(f, { name: "pin" }), y(r(s.location), 1)]), s.accepted ? (u(), d("span", Ca, [g(f, { name: "check" }), a[5] || (a[5] = y("已接取", -1))])) : (u(), S(f, {
          key: 1,
          name: "next"
        }))])
      ], 10, ba))), 128))], 8, ca)),
      t.board?.listings.length ? (u(), d("p", Ra, "任务终端出资 · 换一批将调用模型")) : m("", !0)
    ]));
  }
}), wa = Ta, Ba = { class: "tasks-page" }, Ma = {
  class: "tasks-filter",
  "aria-label": "记录来源"
}, Sa = ["aria-pressed", "onClick"], Aa = {
  key: 0,
  class: "tasks-empty"
}, Da = {
  key: 1,
  class: "tasks-record-list"
}, xa = ["disabled"], La = /* @__PURE__ */ x({
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
    const v = t, a = I(() => v.history.items.filter((s) => v.source === "all" || s.source === v.source));
    return (s, c) => (u(), d("section", Ba, [
      c[1] || (c[1] = e("header", { class: "tasks-section-heading" }, [e("h2", null, "记录")], -1)),
      e("div", Ma, [(u(), d(T, null, O([
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
      ], (p) => e("button", {
        key: p.id,
        type: "button",
        "aria-pressed": t.source === p.id,
        onClick: (i) => s.$emit("filter", p.id)
      }, r(p.label), 9, Sa)), 64))]),
      a.value.length ? (u(), d("div", Da, [(u(!0), d(T, null, O(a.value, (p) => (u(), S(ie, {
        key: p.taskId,
        task: p,
        onOpen: (i) => s.$emit("detail", p.taskId)
      }, null, 8, ["task", "onOpen"]))), 128))])) : (u(), d("div", Aa, [g(f, { name: "archive" }), e("h3", null, r(t.history.hasMore ? "已加载的记录中暂无匹配项" : "暂无记录"), 1)])),
      t.history.hasMore ? (u(), d("button", {
        key: 2,
        type: "button",
        class: "tasks-load-more tasks-secondary-button",
        disabled: t.loading,
        onClick: c[0] || (c[0] = (p) => s.$emit("loadMore"))
      }, r(t.loading ? "正在加载…" : "加载更多记录"), 9, xa)) : m("", !0)
    ]));
  }
}), qa = La, Ea = { class: "tasks-page" }, Na = { class: "tasks-section-heading" }, Va = ["disabled"], Pa = {
  key: 0,
  class: "tasks-hint"
}, Oa = {
  key: 1,
  class: "tasks-empty"
}, ja = {
  key: 2,
  class: "tasks-record-list"
}, Ua = /* @__PURE__ */ x({
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
    return (v, a) => (u(), d("section", Ea, [
      e("header", Na, [a[3] || (a[3] = e("h2", null, "我发布的", -1)), e("button", {
        type: "button",
        class: "tasks-primary-button",
        "data-navigation-id": "publish",
        disabled: !!t.disabledReason,
        onClick: a[0] || (a[0] = (s) => v.$emit("publish"))
      }, [g(f, { name: "plus" }), a[2] || (a[2] = y("发布委托", -1))], 8, Va)]),
      t.disabledReason ? (u(), d("p", Pa, r(t.disabledReason), 1)) : m("", !0),
      t.records.length ? (u(), d("div", ja, [(u(!0), d(T, null, O(t.records, (s) => (u(), S(ie, {
        key: `${s.scopeId}:${s.task.taskId}`,
        task: s.task,
        "source-label": s.sourceLabel,
        onOpen: (c) => v.$emit("open", s)
      }, null, 8, [
        "task",
        "source-label",
        "onOpen"
      ]))), 128))])) : (u(), d("div", Oa, [g(f, { name: "send" }), a[4] || (a[4] = e("h3", null, "还没有发布委托", -1))])),
      e("button", {
        type: "button",
        class: "tasks-text-button tasks-history-link",
        onClick: a[1] || (a[1] = (s) => v.$emit("history"))
      }, [a[5] || (a[5] = y("已结束的委托", -1)), g(f, { name: "next" })])
    ]));
  }
}), Za = Ua, Ha = { class: "tasks-page tasks-settings-page" }, Fa = { class: "tasks-setting-card" }, za = { class: "tasks-setting-row" }, Ka = { class: "tasks-switch" }, Qa = ["checked", "disabled"], Ga = { class: "tasks-setting-card" }, Ja = ["disabled"], Wa = {
  key: 0,
  class: "tasks-hint"
}, Ya = {
  key: 0,
  class: "tasks-maintenance-message",
  role: "status"
}, Xa = /* @__PURE__ */ x({
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
    return (v, a) => (u(), d("section", Ha, [
      e("article", Fa, [e("div", za, [a[3] || (a[3] = e("h3", null, "自动更新进展", -1)), e("label", Ka, [e("input", {
        type: "checkbox",
        "aria-label": "自动更新任务进展",
        checked: t.autoMaintenance,
        disabled: t.settingsBusy,
        onChange: a[0] || (a[0] = (s) => v.$emit("update", s.target.checked))
      }, null, 40, Qa), a[2] || (a[2] = e("span", null, null, -1))])]), a[4] || (a[4] = e("p", null, "发送下一条消息时，根据上一轮剧情更新任务，将调用模型。适用于所有普通聊天。", -1))]),
      e("article", Ga, [
        e("button", {
          type: "button",
          class: "tasks-secondary-button",
          disabled: t.maintenanceBusy || !!t.disabledReason,
          onClick: a[1] || (a[1] = (s) => v.$emit("maintain"))
        }, [g(f, {
          name: "refresh",
          class: Y({ "is-spinning": t.maintenanceBusy })
        }, null, 8, ["class"]), y(r(t.maintenanceBusy ? "正在更新…" : "更新任务进展"), 1)], 8, Ja),
        a[5] || (a[5] = e("p", null, "根据当前剧情检查任务，将调用模型。", -1)),
        t.disabledReason ? (u(), d("p", Wa, r(t.disabledReason), 1)) : m("", !0)
      ]),
      t.maintenanceMessage ? (u(), d("p", Ya, r(t.maintenanceMessage), 1)) : m("", !0)
    ]));
  }
}), _a = Xa;
function es(t, v, a, s) {
  if (s !== a.stateVersion || t.nextCursor !== a.cursor) return null;
  const c = new Set(t.items.map((p) => p.taskId));
  return {
    items: [...t.items, ...v.items.filter((p) => !c.has(p.taskId))],
    nextCursor: v.nextCursor,
    hasMore: v.hasMore
  };
}
var ts = { class: "tasks-page" }, as = { class: "tasks-contract-sheet" }, ss = { class: "tasks-contract-heading" }, ls = { class: "tasks-grade" }, ns = { class: "tasks-eyebrow" }, is = { class: "tasks-contract-reward" }, us = { class: "tasks-seal" }, rs = { class: "tasks-facts" }, ds = { key: 0 }, os = { class: "is-risk" }, vs = { class: "tasks-tags" }, ks = { class: "tasks-action-dock" }, cs = {
  key: 0,
  class: "tasks-hint"
}, bs = ["disabled"], ys = {
  key: 1,
  class: "tasks-empty"
}, ms = /* @__PURE__ */ x({
  __name: "TaskListingDetail",
  props: {
    listing: {},
    busy: { type: Boolean },
    disabledReason: {}
  },
  emits: ["accept"],
  setup(t) {
    return (v, a) => (u(), d("section", ts, [t.listing ? (u(), d(T, { key: 0 }, [
      e("article", as, [
        e("header", ss, [
          e("span", ls, r(t.listing.grade), 1),
          e("span", ns, "任务终端 · " + r(t.listing.posture), 1),
          e("h2", null, r(t.listing.title), 1),
          e("p", null, r(t.listing.hook), 1)
        ]),
        e("div", is, [e("span", null, [a[2] || (a[2] = y("完成报酬", -1)), e("strong", null, [a[1] || (a[1] = e("small", null, "¤", -1)), y(" " + r(A(P)(t.listing.reward)), 1)])]), e("span", us, [g(f, { name: "check" }), a[3] || (a[3] = y("终端出资", -1))])]),
        e("dl", rs, [
          e("div", null, [a[4] || (a[4] = e("dt", null, "完成目标", -1)), e("dd", null, r(t.listing.objective), 1)]),
          t.listing.requirements ? (u(), d("div", ds, [a[5] || (a[5] = e("dt", null, "执行约束", -1)), e("dd", null, r(t.listing.requirements), 1)])) : m("", !0),
          e("div", null, [a[6] || (a[6] = e("dt", null, "行动地点", -1)), e("dd", null, r(t.listing.location), 1)]),
          e("div", null, [a[7] || (a[7] = e("dt", null, "行动时机", -1)), e("dd", null, r(t.listing.timing), 1)]),
          e("div", os, [a[8] || (a[8] = e("dt", null, "留意风险", -1)), e("dd", null, r(t.listing.risk), 1)])
        ]),
        e("div", vs, [(u(!0), d(T, null, O(t.listing.tags, (s) => (u(), d("span", { key: s }, r(s), 1))), 128))])
      ]),
      a[9] || (a[9] = e("p", { class: "tasks-hint" }, "接取后由你执行，报酬自动托管；无需另找 NPC 领取任务。", -1)),
      e("div", ks, [t.disabledReason ? (u(), d("p", cs, r(t.disabledReason), 1)) : m("", !0), e("button", {
        type: "button",
        class: "tasks-primary-button",
        disabled: t.listing.accepted || t.busy || !!t.disabledReason,
        onClick: a[0] || (a[0] = (s) => v.$emit("accept"))
      }, [g(f, { name: t.listing.accepted ? "check" : "plus" }, null, 8, ["name"]), y(r(t.listing.accepted ? "已接取这份委托" : t.busy ? "正在接取…" : "接下这份委托"), 1)], 8, bs)])
    ], 64)) : (u(), d("div", ys, [
      g(f, { name: "ticket" }),
      a[10] || (a[10] = e("h3", null, "这批委托已更新", -1)),
      a[11] || (a[11] = e("p", null, "返回大厅，查看最新的委托。", -1))
    ]))]));
  }
}), gs = ms, fs = {
  key: 0,
  class: "tasks-candidates"
}, hs = ["data-tone"], $s = { class: "tasks-candidate-description" }, ps = { class: "tasks-candidate-facts" }, Is = ["disabled", "onClick"], Cs = {
  key: 1,
  class: "tasks-empty"
}, Rs = /* @__PURE__ */ x({
  __name: "TaskCandidateList",
  props: {
    task: {},
    busy: { type: Boolean },
    disabledReason: {}
  },
  emits: ["assign"],
  setup(t) {
    return (v, a) => t.task.candidates.length ? (u(), d("div", fs, [(u(!0), d(T, null, O(t.task.candidates, (s, c) => (u(), d("article", {
      key: s.candidateId,
      class: "tasks-candidate"
    }, [
      e("header", null, [e("span", {
        class: "tasks-candidate-avatar",
        "data-tone": c % 3,
        "aria-hidden": "true"
      }, r(Array.from(s.name)[0]), 9, hs), e("h3", null, r(s.name), 1)]),
      e("p", $s, r(s.description), 1),
      e("blockquote", null, "“" + r(s.pitch) + "”", 1),
      e("dl", ps, [e("div", null, [a[0] || (a[0] = e("dt", null, "擅长", -1)), e("dd", null, r(s.capability), 1)]), e("div", null, [a[1] || (a[1] = e("dt", null, "留意", -1)), e("dd", null, r(s.risk), 1)])]),
      e("button", {
        type: "button",
        class: "tasks-secondary-button tasks-full-button",
        disabled: t.busy || !!t.disabledReason,
        onClick: (p) => v.$emit("assign", t.task, s.candidateId)
      }, [e("span", null, "委托给 " + r(s.name), 1), g(f, { name: "next" })], 8, Is)
    ]))), 128))])) : (u(), d("div", Cs, [g(f, { name: "people" }), a[2] || (a[2] = e("h3", null, "暂无应征者", -1))]));
  }
}), Ts = Rs, ws = { class: "tasks-page" }, Bs = { class: "tasks-recruit-heading" }, Ms = { class: "tasks-reward" }, Ss = { class: "tasks-section-heading" }, As = ["disabled"], Ds = ["role"], xs = {
  key: 0,
  class: "tasks-hint"
}, Ls = { class: "tasks-withdraw" }, qs = ["disabled"], Es = {
  key: 1,
  class: "tasks-empty"
}, Ns = {
  key: 1,
  class: "tasks-empty"
}, Vs = /* @__PURE__ */ x({
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
    return (v, a) => (u(), d("section", ws, [t.task ? (u(), d(T, { key: 0 }, [e("header", Bs, [
      a[6] || (a[6] = e("span", { class: "tasks-eyebrow" }, "报酬已托管", -1)),
      e("h2", null, r(t.task.title), 1),
      e("div", null, [e("strong", Ms, "¤ " + r(A(P)(t.task.reward)), 1), e("button", {
        type: "button",
        class: "tasks-text-button",
        "data-navigation-id": "contract",
        onClick: a[0] || (a[0] = (s) => v.$emit("detail", t.task.taskId))
      }, [a[5] || (a[5] = y("查看委托内容", -1)), g(f, { name: "next" })])])
    ]), t.task.status === "recruiting" ? (u(), d(T, { key: 0 }, [
      e("header", Ss, [e("h3", null, [a[7] || (a[7] = y("选择执行者 ", -1)), e("small", null, r(t.task.candidates.length), 1)]), e("button", {
        type: "button",
        class: "tasks-text-button",
        disabled: t.busy || t.recruiting || !!t.generationDisabledReason,
        onClick: a[1] || (a[1] = (s) => v.$emit("recruit", t.task))
      }, [g(f, {
        name: "refresh",
        class: Y({ "is-spinning": t.recruiting })
      }, null, 8, ["class"]), y(r(t.recruiting ? "招募中…" : t.task.candidates.length ? "重新招募" : "开始招募"), 1)], 8, As)]),
      e("p", {
        class: "tasks-hint",
        role: t.recruiting ? "status" : void 0
      }, r(t.recruiting ? "正在招募，可离开页面等待。" : "招募将调用模型"), 9, Ds),
      t.disabledReason || t.generationDisabledReason ? (u(), d("p", xs, r(t.disabledReason || t.generationDisabledReason), 1)) : m("", !0),
      g(Ts, {
        task: t.task,
        busy: t.busy || t.recruiting,
        "disabled-reason": t.disabledReason,
        onAssign: a[2] || (a[2] = (s, c) => v.$emit("assign", s, c))
      }, null, 8, [
        "task",
        "busy",
        "disabled-reason"
      ]),
      e("div", Ls, [e("button", {
        type: "button",
        class: "tasks-text-button is-danger",
        disabled: t.busy || !!t.disabledReason,
        onClick: a[3] || (a[3] = (s) => v.$emit("cancel", t.task))
      }, "取消委托并退回报酬", 8, qs)])
    ], 64)) : (u(), d("div", Es, [
      g(f, { name: "check" }),
      e("h3", null, r(t.task.status === "active" ? "执行者已接下委托" : "这份委托已结束"), 1),
      e("button", {
        type: "button",
        class: "tasks-primary-button",
        onClick: a[4] || (a[4] = (s) => v.$emit("detail", t.task.taskId))
      }, "查看任务进展")
    ]))], 64)) : (u(), d("div", Ns, [...a[8] || (a[8] = [e("h3", null, "委托状态已更新", -1), e("p", null, "请返回“我发布”查看最新进展或已结束记录。", -1)])]))]));
  }
}), Ps = Vs, Os = { id: "tasks-confirm-title" }, js = { class: "tasks-dialog-copy" }, Us = {
  key: 0,
  class: "tasks-dialog-error",
  role: "alert"
}, Zs = {
  key: 1,
  class: "tasks-hint"
}, Hs = ["disabled"], Fs = ["disabled"], zs = /* @__PURE__ */ x({
  __name: "TaskConfirmDialog",
  props: {
    title: {},
    confirmLabel: {},
    busy: { type: Boolean },
    disabledReason: {},
    error: {}
  },
  emits: ["close", "confirm"],
  setup(t, { emit: v }) {
    const a = v;
    return (s, c) => (u(), S(et, {
      class: "tasks-dialog",
      "aria-label": t.title,
      busy: t.busy,
      onClose: c[2] || (c[2] = (p) => a("close"))
    }, {
      default: fe(() => [
        e("h2", Os, r(t.title), 1),
        e("div", js, [Ye(s.$slots, "default")]),
        t.error ? (u(), d("p", Us, r(t.error), 1)) : m("", !0),
        t.disabledReason && !t.busy ? (u(), d("p", Zs, r(t.disabledReason), 1)) : m("", !0),
        e("footer", null, [e("button", {
          type: "button",
          class: "tasks-secondary-button",
          disabled: t.busy,
          autofocus: "",
          onClick: c[0] || (c[0] = (p) => a("close"))
        }, "返回", 8, Hs), e("button", {
          type: "button",
          class: "tasks-primary-button",
          disabled: t.busy || !!t.disabledReason,
          onClick: c[1] || (c[1] = (p) => a("confirm"))
        }, r(t.busy ? "正在保存…" : t.confirmLabel), 9, Fs)])
      ]),
      _: 3
    }, 8, ["aria-label", "busy"]));
  }
}), Ks = zs, Qs = { class: "tasks-app" }, Gs = { class: "tasks-app-header" }, Js = {
  class: "tasks-balance",
  "aria-label": "小白币余额"
}, Ws = {
  class: "tasks-notices",
  "aria-live": "polite"
}, Ys = ["disabled"], Xs = ["disabled"], _s = ["disabled"], el = {
  key: 1,
  class: "tasks-notice",
  role: "status"
}, tl = {
  key: 0,
  class: "tasks-empty",
  role: "status"
}, al = {
  key: 0,
  class: "tasks-nav",
  "aria-label": "任务主导航"
}, sl = ["aria-current"], ll = ["aria-current"], nl = ["aria-current"], il = { key: 0 }, ul = ["aria-current"], rl = { class: "tasks-confirm-name" }, dl = { class: "tasks-confirm-amount" }, ol = { class: "tasks-confirm-name" }, vl = {
  key: 0,
  class: "tasks-confirm-amount"
}, kl = { class: "tasks-confirm-name" }, cl = 35e3, bl = "检查保存失败，尚不能确认账目是否写入。请检查连接后再试。", yl = /* @__PURE__ */ x({
  __name: "TasksApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(t) {
    const v = t;
    function a() {
      return {
        chatIdentity: "",
        status: "blocked",
        message: "任务暂时加载不了。",
        writeState: "ready",
        settings: { autoMaintenance: !1 },
        playerBalance: 0,
        currentScopeId: null,
        commissions: [],
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
    function s(n) {
      return n && typeof n == "object" ? structuredClone(ge(n)) : a();
    }
    function c(n) {
      return n !== null && typeof n == "object" && !Array.isArray(n);
    }
    function p(n) {
      return c(n) ? n.result : null;
    }
    const i = R(s(v.initialState)), k = R("board"), X = {}, Z = R(null), b = R(null), _ = I(() => b.value?.kind === "cancel" && b.value.task.source === "received"), H = R(null), ue = R(""), F = R(null), ae = R("all"), J = R(null), re = {}, de = I(() => nt(i.value)), $e = I(() => de.value.received), pe = I(() => de.value.published), Ie = I(() => i.value.commissions), Ce = I(() => [...pe.value, ...i.value.history.items].find((n) => n.taskId === ue.value) ?? null), Re = I(() => i.value.board?.boardId === H.value?.boardId ? i.value.board?.listings.find((n) => n.listingId === H.value?.listingId) ?? null : null), se = I(() => [
      "board",
      "active",
      "published",
      "history"
    ].includes(k.value)), Te = I(() => ({
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
    let z = 0;
    const oe = I(() => i.value.generation.state === "running" && i.value.generation.kind === "board"), ve = I(() => i.value.generation.state === "running" && i.value.generation.kind === "candidates" ? i.value.generation.taskId ?? "" : ""), w = R(!1), ee = R(!1), B = R(!1), le = R(!1), te = R(!1), h = R(""), j = R("");
    let M = 0, D = !1, ke = () => {
    };
    const ce = I(() => i.value.status === "unconfirmed"), q = I(() => w.value ? "正在处理上一项任务操作" : i.value.status === "loading" ? "正在加载任务" : i.value.status === "saving" ? "任务与资金正在保存" : i.value.status === "unconfirmed" ? "请先检查上一次是否保存成功" : i.value.status === "conflict" ? "请先使用已保存版本" : i.value.status === "blocked" ? i.value.message || "任务暂时不可用" : i.value.generationActive ? "正在生成内容，请稍后" : ""), ne = I(() => w.value ? "正在处理上一项任务操作" : i.value.status !== "ready" ? i.value.message || "暂时不能取消委托" : ""), K = I(() => q.value || (i.value.maintenance.state === "running" ? "正在更新任务" : "")), we = I(() => i.value.maintenance.message), Be = I(() => i.value.status !== "ready" && !i.value.board && !i.value.active.length && !i.value.recruiting.length && !i.value.history.items.length && !i.value.commissions.length);
    function be(n) {
      if (!n || typeof n.chatIdentity != "string") return;
      i.value = structuredClone(n), h.value = "";
      const l = Z.value?.task;
      if (k.value === "detail" && l) {
        const o = F.value && F.value !== n.currentScopeId ? n.commissions.find(($) => $.scopeId === F.value && $.task.taskId === l.taskId)?.task : [
          ...n.active,
          ...n.recruiting,
          ...n.history.items
        ].find(($) => $.taskId === l.taskId);
        o && o.eventId !== l.eventId && W(o.taskId, !0, F.value);
      }
    }
    function Me(n) {
      if (!c(n)) return null;
      const l = c(n.state) ? n.state : n;
      return typeof l.chatIdentity == "string" ? l : null;
    }
    function E(n) {
      const l = n instanceof Error ? n.message : String(n);
      return l === "tasks_insufficient_funds" ? "小白币余额不足，任务没有发布。" : l === "tasks_state_changed" || l === "tasks_listing_already_accepted" ? "任务有变化，请查看最新进展后再试。" : l === "tasks_terminal" ? "该任务已经结束，不能再次操作。" : l === "tasks_publish_invalid" || l === "tasks_request_invalid" ? "任务内容不完整或超出允许范围。" : l === "tasks_write_blocked" || l === "tasks_generation_active" ? "当前有生成或保存正在进行，请稍后重试。" : l === "tasks_chat_changed" ? "聊天已经切换，请重新打开任务。" : l === "host_request_timeout" ? "暂时没收到结果，请稍后查看，不要重复操作。" : "任务操作未完成，请稍后重试。";
    }
    async function L(n, l = {}, o = cl) {
      return p(await v.bridge.request(n, {
        chatIdentity: i.value.chatIdentity,
        ...l
      }, o));
    }
    function V(n, l) {
      if (M !== l) return;
      const o = Me(n);
      o?.chatIdentity === i.value.chatIdentity && be(o);
    }
    function U(n) {
      j.value = n, h.value = "";
    }
    async function Se() {
      if (oe.value || K.value) return;
      h.value = "";
      const n = M;
      try {
        const l = await L("tasks/refresh");
        if (!D) return;
        V(l, n);
      } catch (l) {
        D && (h.value = E(l));
      }
    }
    async function Ae(n, l) {
      if (q.value) return;
      w.value = !0;
      const o = M;
      try {
        V(await L("tasks/board/accept", {
          boardId: n,
          listingId: l
        }), o), D && k.value === "listing" && C("active"), U("任务已接取，报酬已进入托管。");
      } catch ($) {
        h.value = E($);
      } finally {
        w.value = !1;
      }
    }
    async function De(n) {
      if (ve.value || K.value) return;
      h.value = "";
      const l = M;
      try {
        const o = await L("tasks/candidates/refresh", {
          taskId: n.taskId,
          expectedTaskRevision: n.taskRevision,
          expectedEventId: n.eventId
        });
        if (!D) return;
        V(o, l);
      } catch (o) {
        D && (h.value = E(o));
      }
    }
    async function xe(n, l) {
      if (q.value) return;
      w.value = !0;
      const o = M;
      try {
        V(await L("tasks/candidates/assign", {
          taskId: n.taskId,
          expectedTaskRevision: n.taskRevision,
          expectedEventId: n.eventId,
          candidateId: l
        }), o), b.value = null, D && C("published"), U("已选好执行者，委托开始了。");
      } catch ($) {
        h.value = E($);
      } finally {
        w.value = !1;
      }
    }
    async function Le(n) {
      const l = b.value?.kind === "cancel" ? b.value.scopeId : null;
      if (l !== i.value.currentScopeId ? ne.value : q.value) return;
      w.value = !0;
      const o = M;
      try {
        const $ = l, N = $ && $ !== i.value.currentScopeId;
        V(await L(N ? "tasks/commission/cancel" : "tasks/cancel", {
          ...N ? { scopeId: $ } : {},
          taskId: n.taskId,
          expectedTaskRevision: n.taskRevision,
          expectedEventId: n.eventId
        }), o), b.value = null, D && C(n.source === "received" ? "active" : "published"), U(n.source === "received" ? "已放弃任务，不会扣除小白币。" : "委托已取消，托管报酬已退回钱包。");
      } catch ($) {
        h.value = E($);
      } finally {
        w.value = !1;
      }
    }
    function qe(n) {
      q.value || (h.value = "", b.value = {
        kind: "publish",
        form: structuredClone(n)
      });
    }
    async function Ee() {
      const n = b.value?.kind === "publish" ? b.value.form : null;
      if (!n || q.value) return;
      w.value = !0;
      const l = M;
      try {
        V(await L("tasks/publish", { form: ge(n) }), l), b.value = null, C("published"), U("任务已发布，报酬已锁入托管。");
      } catch (o) {
        h.value = E(o);
      } finally {
        w.value = !1;
      }
    }
    async function Ne(n) {
      if (ee.value) return;
      ee.value = !0;
      const l = M;
      try {
        V(await L("tasks/settings/update", { autoMaintenance: n }), l), U(n ? "已开启任务进展自动更新。" : "已关闭任务进展自动更新。");
      } catch (o) {
        h.value = E(o);
      } finally {
        ee.value = !1;
      }
    }
    async function Ve() {
      if (i.value.maintenance.state === "running" || K.value) return;
      const n = M;
      try {
        V(await L("tasks/maintenance/run"), n);
      } catch (l) {
        h.value = E(l);
      }
    }
    async function W(n, l = !1, o = null) {
      l || (C("detail"), F.value = o, Z.value = null, le.value = !0);
      const $ = ++z;
      try {
        const N = await L("tasks/detail/read", {
          taskId: n,
          ...o && o !== i.value.currentScopeId ? { scopeId: o } : {}
        });
        if (!D || $ !== z) return;
        c(N) && c(N.task) && Array.isArray(N.timeline) && (Z.value = structuredClone(N));
      } catch (N) {
        D && $ === z && (h.value = E(N));
      } finally {
        D && $ === z && (le.value = !1);
      }
    }
    async function Pe() {
      const n = i.value.history.nextCursor;
      if (!n || te.value) return;
      te.value = !0;
      const l = {
        cursor: n,
        stateVersion: M
      };
      try {
        const o = await L("tasks/history/load-more", { cursor: n });
        if (D && c(o) && Array.isArray(o.items)) {
          const $ = o, N = es(i.value.history, $, l, M);
          N && (i.value.history = N);
        }
      } catch (o) {
        h.value = E(o);
      } finally {
        te.value = !1;
      }
    }
    async function Oe() {
      if (B.value) return;
      B.value = !0, h.value = "", j.value = "";
      const n = M;
      try {
        const l = await L("tasks/save/confirm");
        V(l, n), c(l) && l.confirmation === "confirmed" && U("已确认保存成功。");
      } catch (l) {
        h.value = l instanceof Error && l.message === "host_request_timeout" ? E(l) : bl;
      } finally {
        B.value = !1;
      }
    }
    async function je() {
      if (B.value) return;
      B.value = !0, h.value = "", j.value = "";
      const n = M;
      try {
        const l = await L("tasks/save/adopt-server");
        V(l, n), c(l) && l.adoption === "adopted" && U("已使用保存的任务和账目。");
      } catch (l) {
        h.value = E(l);
      } finally {
        B.value = !1;
      }
    }
    async function Ue() {
      if (B.value) return;
      B.value = !0, h.value = "", j.value = "";
      const n = M;
      try {
        V(await L("tasks/read"), n);
      } catch {
        h.value = "任务暂时加载不了，请检查连接后重试。";
      } finally {
        B.value = !1;
      }
    }
    function C(n, l = !1) {
      j.value = "", n !== k.value && !l && (X[n] = [
        "board",
        "active",
        "published",
        "history"
      ].includes(n) ? "board" : k.value), re[k.value] = {
        scrollTop: J.value?.scrollTop ?? 0,
        focusKey: document.activeElement instanceof HTMLElement ? document.activeElement.dataset.navigationId ?? "" : ""
      }, z += 1, k.value = n, Qe(() => {
        if (!D || k.value !== n) return;
        const o = l ? re[n] : void 0;
        J.value?.scrollTo(0, o?.scrollTop ?? 0), ((o?.focusKey ? Array.from(J.value?.closest("main")?.querySelectorAll("button[data-navigation-id]") ?? []).find(($) => $.dataset.navigationId === o.focusKey) : void 0) ?? J.value)?.focus({ preventScroll: !0 });
      });
    }
    const ye = _e(() => k.value === "board" ? !1 : (C(X[k.value] ?? "board", !0), !0));
    function Ze(n, l) {
      H.value = {
        boardId: n,
        listingId: l
      }, C("listing");
    }
    function He(n) {
      const { task: l, scopeId: o } = n;
      l.status === "recruiting" && o === i.value.currentScopeId ? (ue.value = l.taskId, C("recruit")) : W(l.taskId, !1, o);
    }
    function Fe() {
      ae.value = "published", C("history"), X.history = "published";
    }
    function me(n) {
      h.value = "", b.value = {
        kind: "cancel",
        task: n,
        scopeId: k.value === "detail" ? F.value : i.value.currentScopeId
      };
    }
    function ze(n, l) {
      h.value = "", b.value = {
        kind: "assign",
        task: n,
        candidateId: l
      };
    }
    function Ke() {
      const n = b.value;
      n && (n.kind === "publish" ? Ee() : n.kind === "cancel" ? Le(n.task) : xe(n.task, n.candidateId));
    }
    return Je(() => {
      D = !0, ke = v.bridge.subscribe((n) => {
        if (n.type === "tasks/state") {
          const l = n.payload?.state;
          l && (M += 1, be(l));
        }
        n.type === "tasks/error" && (h.value = "任务状态暂时无法读取，请重新打开。");
      }), v.bridge.post("tasks/activate", { chatIdentity: i.value.chatIdentity });
    }), We(() => {
      D = !1, z += 1, ke(), b.value = null;
    }), (n, l) => (u(), d("main", Qs, [
      e("header", Gs, [
        se.value ? m("", !0) : (u(), d("button", {
          key: 0,
          type: "button",
          class: "tasks-icon-button",
          "aria-label": "返回上一页",
          onClick: l[0] || (l[0] = (...o) => A(ye) && A(ye)(...o))
        }, [g(f, { name: "back" })])),
        e("h1", null, r(Te.value), 1),
        e("div", Js, [e("strong", null, "¤ " + r(A(P)(i.value.playerBalance)), 1)]),
        se.value ? (u(), d("button", {
          key: 1,
          type: "button",
          class: "tasks-icon-button",
          "aria-label": "任务设置",
          "data-navigation-id": "settings",
          onClick: l[1] || (l[1] = (o) => C("settings"))
        }, [g(f, { name: "settings" })])) : m("", !0)
      ]),
      e("div", Ws, [i.value.message || h.value && !b.value || j.value ? (u(), d("aside", {
        key: 0,
        class: Y(["tasks-notice", {
          "is-error": !!h.value || i.value.status === "conflict" || i.value.status === "blocked",
          "is-warning": ce.value
        }]),
        role: "status"
      }, [e("div", null, [e("p", null, r((b.value ? "" : h.value) || i.value.message || j.value), 1), ce.value ? (u(), d("button", {
        key: 0,
        type: "button",
        disabled: B.value,
        onClick: Oe
      }, r(B.value ? "正在检查…" : "检查保存"), 9, Ys)) : i.value.status === "conflict" ? (u(), d("button", {
        key: 1,
        type: "button",
        disabled: B.value,
        onClick: je
      }, r(B.value ? "正在加载…" : "使用已保存版本"), 9, Xs)) : i.value.status === "blocked" ? (u(), d("button", {
        key: 2,
        type: "button",
        disabled: B.value,
        onClick: Ue
      }, r(B.value ? "正在读取…" : "重新加载"), 9, _s)) : m("", !0)]), i.value.message ? m("", !0) : (u(), d("button", {
        key: 0,
        type: "button",
        class: "tasks-icon-button",
        "aria-label": "关闭提示",
        onClick: l[2] || (l[2] = (o) => {
          h.value = "", j.value = "";
        })
      }, [g(f, { name: "close" })]))], 2)) : m("", !0), i.value.generation.message && !i.value.message ? (u(), d("aside", el, [e("p", null, r(i.value.generation.message), 1)])) : m("", !0)]),
      e("div", {
        ref_key: "content",
        ref: J,
        class: "tasks-content",
        tabindex: "-1"
      }, [Be.value ? (u(), d("div", tl, [g(f, { name: "compass" }), e("h3", null, r(i.value.status === "loading" ? "正在读取委托…" : "任务暂时不能读取"), 1)])) : k.value === "board" ? (u(), S(wa, {
        key: 1,
        board: i.value.board,
        busy: oe.value,
        "disabled-reason": K.value,
        onRefresh: Se,
        onDetail: Ze
      }, null, 8, [
        "board",
        "busy",
        "disabled-reason"
      ])) : k.value === "active" ? (u(), S(ia, {
        key: 2,
        records: $e.value,
        onDetail: W,
        onDiscover: l[3] || (l[3] = (o) => C("board"))
      }, null, 8, ["records"])) : k.value === "published" ? (u(), S(Za, {
        key: 3,
        records: Ie.value,
        "disabled-reason": q.value,
        onOpen: He,
        onPublish: l[4] || (l[4] = (o) => C("publish")),
        onHistory: Fe
      }, null, 8, ["records", "disabled-reason"])) : k.value === "history" ? (u(), S(qa, {
        key: 4,
        history: i.value.history,
        loading: te.value,
        source: ae.value,
        onFilter: l[5] || (l[5] = (o) => ae.value = o),
        onDetail: W,
        onLoadMore: Pe
      }, null, 8, [
        "history",
        "loading",
        "source"
      ])) : k.value === "settings" ? (u(), S(_a, {
        key: 5,
        "auto-maintenance": i.value.settings.autoMaintenance,
        "settings-busy": ee.value,
        "maintenance-busy": i.value.maintenance.state === "running",
        "maintenance-message": we.value,
        "disabled-reason": K.value,
        onUpdate: Ne,
        onMaintain: Ve
      }, null, 8, [
        "auto-maintenance",
        "settings-busy",
        "maintenance-busy",
        "maintenance-message",
        "disabled-reason"
      ])) : k.value === "publish" ? (u(), S(zt, {
        key: 6,
        balance: i.value.playerBalance,
        busy: w.value,
        "disabled-reason": q.value,
        onSubmit: qe
      }, null, 8, [
        "balance",
        "busy",
        "disabled-reason"
      ])) : k.value === "listing" ? (u(), S(gs, {
        key: 7,
        listing: Re.value,
        busy: w.value,
        "disabled-reason": q.value,
        onAccept: l[6] || (l[6] = (o) => H.value && Ae(H.value.boardId, H.value.listingId))
      }, null, 8, [
        "listing",
        "busy",
        "disabled-reason"
      ])) : k.value === "recruit" ? (u(), S(Ps, {
        key: 8,
        task: Ce.value,
        busy: w.value,
        recruiting: !!ve.value,
        "disabled-reason": q.value,
        "generation-disabled-reason": K.value,
        onRecruit: De,
        onAssign: ze,
        onCancel: me,
        onDetail: W
      }, null, 8, [
        "task",
        "busy",
        "recruiting",
        "disabled-reason",
        "generation-disabled-reason"
      ])) : (u(), S(St, {
        key: 9,
        detail: Z.value,
        loading: le.value,
        busy: w.value,
        "disabled-reason": Z.value?.originScopeId && Z.value.originScopeId !== i.value.currentScopeId ? ne.value : q.value,
        onCancel: me
      }, null, 8, [
        "detail",
        "loading",
        "busy",
        "disabled-reason"
      ]))], 512),
      se.value ? (u(), d("nav", al, [
        e("button", {
          type: "button",
          "aria-label": "发现委托",
          "aria-current": k.value === "board" ? "page" : void 0,
          onClick: l[7] || (l[7] = (o) => C("board"))
        }, [e("span", null, [g(f, { name: "compass" })]), l[12] || (l[12] = y("发现", -1))], 8, sl),
        e("button", {
          type: "button",
          "aria-label": "我接的",
          "aria-current": k.value === "active" ? "page" : void 0,
          onClick: l[8] || (l[8] = (o) => C("active"))
        }, [e("span", null, [g(f, { name: "ticket" })]), l[13] || (l[13] = y("我接的", -1))], 8, ll),
        e("button", {
          type: "button",
          "aria-label": "我发布",
          "aria-current": k.value === "published" ? "page" : void 0,
          onClick: l[9] || (l[9] = (o) => C("published"))
        }, [e("span", null, [g(f, { name: "send" }), i.value.commissions.some((o) => o.task.status === "recruiting" && o.scopeId === i.value.currentScopeId) ? (u(), d("i", il)) : m("", !0)]), l[14] || (l[14] = y("我发布", -1))], 8, nl),
        e("button", {
          type: "button",
          "aria-label": "记录",
          "aria-current": k.value === "history" ? "page" : void 0,
          onClick: l[10] || (l[10] = (o) => C("history"))
        }, [e("span", null, [g(f, { name: "archive" })]), l[15] || (l[15] = y("记录", -1))], 8, ul)
      ])) : m("", !0),
      b.value ? (u(), S(Ks, {
        key: 1,
        title: b.value.kind === "publish" ? "确认发布" : b.value.kind === "cancel" ? _.value ? "放弃任务？" : "取消委托？" : "确认执行者",
        "confirm-label": b.value.kind === "publish" ? "托管并发布" : b.value.kind === "cancel" ? _.value ? "确认放弃" : "取消并退款" : "确认委托",
        busy: w.value,
        "disabled-reason": b.value.kind === "cancel" && b.value.scopeId !== i.value.currentScopeId ? ne.value : q.value,
        error: h.value,
        onClose: l[11] || (l[11] = (o) => {
          b.value = null, h.value = "";
        }),
        onConfirm: Ke
      }, {
        default: fe(() => [b.value.kind === "publish" ? (u(), d(T, { key: 0 }, [
          e("p", rl, r(b.value.form.title), 1),
          e("strong", dl, "¤ " + r(A(P)(b.value.form.reward)), 1),
          l[16] || (l[16] = e("p", null, "报酬将从钱包托管。发布后可招募执行者；任务结束前，你可以取消并全额退回报酬。", -1))
        ], 64)) : b.value.kind === "cancel" ? (u(), d(T, { key: 1 }, [
          e("p", ol, r(b.value.task.title), 1),
          _.value ? m("", !0) : (u(), d("strong", vl, "¤ " + r(A(P)(b.value.task.reward)), 1)),
          e("p", null, r(_.value ? "放弃后不再获得任务报酬，也不会扣除你的小白币。" : "取消后，托管报酬将全额退回你的钱包。"), 1),
          l[17] || (l[17] = e("p", null, "任务将移入记录，不再参与后续剧情提醒与进展更新。此操作无法撤销。", -1))
        ], 64)) : (u(), d(T, { key: 2 }, [e("p", kl, r(b.value.task.candidates.find((o) => o.candidateId === (b.value?.kind === "assign" ? b.value.candidateId : ""))?.name), 1), e("p", null, "确认后开始执行“" + r(b.value.task.title) + "”。完成后，托管报酬将支付给执行者。", 1)], 64))]),
        _: 1
      }, 8, [
        "title",
        "confirm-label",
        "busy",
        "disabled-reason",
        "error"
      ])) : m("", !0)
    ]));
  }
}), hl = yl;
export {
  hl as default
};
