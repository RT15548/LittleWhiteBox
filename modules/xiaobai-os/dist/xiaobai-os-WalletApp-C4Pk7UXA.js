/* eslint-disable */
import { $ as x, F as s, L as I, M as K, O as X, Q as v, R as H, W as N, Y as M, Z as ee, _ as i, b as g, g as b, h as W, m as e, p as C, tt as n, u as B, x as k, y as L } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { t as R } from "./xiaobai-os-AppDialog-CaAiivYL.js";
var te = {
  class: "wallet-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.7",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
  focusable: "false"
}, ae = ["d"], le = /* @__PURE__ */ k({
  __name: "WalletIcon",
  props: { name: {} },
  setup(t) {
    const o = {
      wallet: "M4 6h14a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12v2M20 11h-5v5h5M17 13.5h.1",
      refresh: "M20 5v6h-6M4 19v-6h6M6 7a7 7 0 0 1 12-1l2 5M4 13l2 5a7 7 0 0 0 12-1",
      income: "M12 4v16m-6-6 6 6 6-6",
      expense: "M12 20V4m-6 6 6-6 6 6",
      transfer: "M3 8h18m-5-5 5 5-5 5M21 16H3m5-5-5 5 5 5",
      shop: "M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2",
      bank: "M3 8h18L12 2 3 8Zm2 3v7m7-7v7m7-7v7M3 21h18",
      tasks: "M6 3h12v18H6V3Zm3 5h6m-6 4h6m-6 4h3",
      game: "M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm1 4h.1m9.9 0h.1M12 12h.1M7 17h.1m9.9 0h.1",
      gift: "M3 8h18v5H3V8Zm2 5v8h14v-8M12 8v13M12 8C2 8 7 0 12 8Zm0 0c10 0 5-8 0 0Z",
      receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6m-6 4h6",
      next: "m9 5 7 7-7 7",
      close: "m6 6 12 12M6 18 18 6"
    };
    return (a, l) => (s(), i("svg", te, [e("path", { d: o[t.name] || o.receipt }, null, 8, ae)]));
  }
}), $ = le, w = {
  scope: "全局账本",
  pageInactive: "钱包页面已关闭，请重新打开。",
  unavailable: "钱包数据暂时无法读取，请稍后重试。",
  blockedTitle: "暂时无法操作",
  operationExpired: "原操作的条件已失效，未重新提交。可使用已保存账本后重新操作。",
  checkSave: "检查保存",
  checking: "正在检查…",
  adopt: "使用已保存账本",
  adoptQuestion: "使用服务器上已保存的全局账本？",
  adoptNotice: "将放弃本次未确认的本地修改。余额和关联业务记录一起使用服务器版本。",
  confirm: "确认使用",
  cancel: "取消"
}, ne = { class: "wallet-ui-header" }, se = { class: "wallet-brand" }, re = { class: "wallet-header-context" }, ie = ["disabled"], oe = /* @__PURE__ */ k({
  __name: "WalletAppHeader",
  props: {
    refreshing: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["refresh"],
  setup(t) {
    return (o, a) => (s(), i("header", ne, [
      e("span", se, [g($, { name: "wallet" })]),
      a[1] || (a[1] = e("h1", { class: "wallet-ui-title" }, "钱包", -1)),
      e("span", re, n(v(w).scope), 1),
      e("button", {
        type: "button",
        class: "wallet-icon-button",
        disabled: t.disabled,
        "aria-label": "刷新钱包",
        onClick: a[0] || (a[0] = (l) => o.$emit("refresh"))
      }, [g($, {
        name: "refresh",
        class: x({ "is-spinning": t.refreshing })
      }, null, 8, ["class"])], 8, ie)
    ]));
  }
}), ue = oe, de = {
  class: "wallet-pocket",
  "aria-labelledby": "wallet-balance-title"
}, ce = { class: "wallet-balance" }, ve = { class: "wallet-balance-chip" }, me = ["aria-label"], fe = {
  class: "wallet-pocket-clasp",
  "aria-hidden": "true"
}, pe = /* @__PURE__ */ k({
  __name: "WalletBalanceCard",
  props: {
    balance: {},
    currency: {},
    status: {}
  },
  setup(t) {
    const o = t, a = C(() => ({
      ready: "正常",
      loading: "正在准备",
      saving: "正在保存",
      unconfirmed: "需要检查保存",
      conflict: "账本有变化",
      blocked: "暂时不可用"
    })[o.status]);
    return (l, c) => (s(), i("section", de, [c[2] || (c[2] = e("div", {
      class: "wallet-pocket-cards",
      "aria-hidden": "true"
    }, [e("span"), e("span")], -1)), e("div", ce, [
      e("header", null, [c[0] || (c[0] = e("span", { id: "wallet-balance-title" }, "可用余额", -1)), e("span", ve, [e("i", { class: x(`is-${t.status}`) }, null, 2), L(n(a.value), 1)])]),
      e("div", {
        class: "wallet-balance-value",
        "aria-label": t.status === "loading" ? "余额正在读取" : `${t.balance.toLocaleString("zh-CN")} ${t.currency}`
      }, [c[1] || (c[1] = e("small", null, "¤", -1)), e("strong", null, n(t.status === "loading" ? "—" : t.balance.toLocaleString("zh-CN")), 1)], 8, me),
      e("footer", null, [e("span", null, n(t.currency) + " · 日常收支", 1), e("span", fe, [g($, { name: "wallet" })])])
    ])]));
  }
}), be = pe, he = {
  class: "wallet-ui-notice-icon",
  "aria-hidden": "true"
}, ge = { class: "wallet-ui-notice-copy" }, ye = { key: 0 }, we = /* @__PURE__ */ k({
  __name: "WalletNotice",
  props: {
    title: {},
    message: { default: "" },
    tone: { default: "info" }
  },
  setup(t) {
    return (o, a) => (s(), i("aside", {
      class: x(["wallet-ui-notice", `is-${t.tone}`]),
      role: "status"
    }, [e("span", he, [H(o.$slots, "icon", {}, () => [a[0] || (a[0] = L("!", -1))])]), e("div", ge, [
      e("strong", null, n(t.title), 1),
      t.message ? (s(), i("p", ye, n(t.message), 1)) : b("", !0),
      H(o.$slots, "default")
    ])], 2));
  }
}), _e = we, $e = { class: "wallet-ui-empty" }, ke = {
  key: 0,
  class: "wallet-ui-empty-icon",
  "aria-hidden": "true"
}, Me = { key: 1 }, Ce = /* @__PURE__ */ k({
  __name: "WalletEmpty",
  props: {
    title: {},
    message: { default: "" }
  },
  setup(t) {
    return (o, a) => (s(), i("div", $e, [
      o.$slots.icon ? (s(), i("span", ke, [H(o.$slots, "icon")])) : b("", !0),
      e("strong", null, n(t.title), 1),
      t.message ? (s(), i("p", Me, n(t.message), 1)) : b("", !0)
    ]));
  }
}), We = Ce;
function O(t) {
  return `${t.direction === "income" ? "+" : t.direction === "expense" ? "−" : ""}${t.amount.toLocaleString("zh-CN")}`;
}
var Q = {
  income: "收入",
  expense: "支出",
  transfer: "系统划转"
};
function U(t) {
  return {
    economy: "gift",
    bank: "bank",
    shop: "shop",
    tasks: "tasks",
    game: "game"
  }[t.sourceDomain] || t.direction;
}
var Te = {
  class: "wallet-row-mark",
  "aria-hidden": "true"
}, xe = { class: "wallet-row-copy" }, Se = { class: "wallet-row-value" }, Be = /* @__PURE__ */ k({
  __name: "WalletTransactionRow",
  props: { transaction: {} },
  emits: ["open"],
  setup(t) {
    const o = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !1
    });
    return (a, l) => (s(), i("li", null, [e("button", {
      type: "button",
      class: x(["wallet-row", `is-${t.transaction.direction}`]),
      onClick: l[0] || (l[0] = (c) => a.$emit("open", t.transaction))
    }, [
      e("span", Te, [g($, { name: v(U)(t.transaction) }, null, 8, ["name"])]),
      e("span", xe, [e("strong", null, n(t.transaction.title), 1), e("small", null, n(t.transaction.source) + " · " + n(v(o).format(t.transaction.createdAt)), 1)]),
      e("span", Se, [e("strong", null, n(v(O)(t.transaction)), 1), e("small", null, n(v(Q)[t.transaction.direction]), 1)])
    ], 2)]));
  }
}), Ne = Be, Le = {
  class: "wallet-filters",
  "aria-label": "账单类型"
}, Ae = ["aria-pressed", "onClick"], Ee = {
  key: 0,
  class: "wallet-ledger-caption"
}, Ve = {
  key: 1,
  class: "wallet-ui-empty",
  role: "status"
}, De = { class: "wallet-ui-list" }, Ie = { class: "wallet-ledger-foot" }, He = {
  key: 0,
  class: "wallet-load-error",
  role: "alert"
}, Ze = ["disabled"], qe = {
  key: 2,
  class: "wallet-ledger-end"
}, Fe = /* @__PURE__ */ k({
  __name: "WalletTransactionList",
  props: {
    transactions: {},
    hasMore: { type: Boolean },
    loadingMore: { type: Boolean },
    loading: { type: Boolean },
    error: {}
  },
  emits: ["loadMore", "open"],
  setup(t) {
    const o = t, a = M("all"), l = [
      {
        id: "all",
        label: "全部"
      },
      {
        id: "income",
        label: "收入"
      },
      {
        id: "expense",
        label: "支出"
      },
      {
        id: "transfer",
        label: "划转"
      }
    ], c = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }), h = C(() => {
      const y = [];
      for (const m of o.transactions) {
        if (a.value !== "all" && m.direction !== a.value) continue;
        const d = c.format(m.createdAt), _ = y.at(-1);
        _?.date === d ? _.transactions.push(m) : y.push({
          date: d,
          transactions: [m]
        });
      }
      return y;
    });
    return (y, m) => (s(), i("div", null, [
      e("div", Le, [(s(), i(B, null, I(l, (d) => e("button", {
        key: d.id,
        type: "button",
        "aria-pressed": a.value === d.id,
        onClick: (_) => a.value = d.id
      }, n(d.label), 9, Ae)), 64))]),
      a.value === "transfer" ? (s(), i("p", Ee, "系统账户间的划转，不计入你的个人收支。")) : b("", !0),
      t.loading ? (s(), i("div", Ve, [g($, {
        name: "refresh",
        class: "is-spinning"
      }), m[2] || (m[2] = e("strong", null, "正在准备你的钱包…", -1))])) : (s(), i(B, { key: 2 }, [
        h.value.length ? b("", !0) : (s(), W(We, {
          key: 0,
          title: t.hasMore ? "当前已加载的账目中没有这类记录" : "这里还没有账目",
          message: "收支记录会显示在这里。"
        }, {
          icon: N(() => [g($, { name: "receipt" })]),
          _: 1
        }, 8, ["title"])),
        (s(!0), i(B, null, I(h.value, (d) => (s(), i("section", {
          key: d.transactions[0].id,
          class: "wallet-day-group"
        }, [e("h3", null, n(d.date), 1), e("ol", De, [(s(!0), i(B, null, I(d.transactions, (_) => (s(), W(Ne, {
          key: _.id,
          transaction: _,
          onOpen: m[0] || (m[0] = (f) => y.$emit("open", f))
        }, null, 8, ["transaction"]))), 128))])]))), 128)),
        e("div", Ie, [t.error ? (s(), i("p", He, n(t.error), 1)) : b("", !0), t.hasMore ? (s(), i("button", {
          key: 1,
          type: "button",
          class: "wallet-ui-text-button",
          disabled: t.loadingMore,
          onClick: m[1] || (m[1] = (d) => y.$emit("loadMore"))
        }, [L(n(t.loadingMore ? "正在读取…" : "查看更早的账单"), 1), g($, { name: "next" })], 8, Ze)) : t.transactions.length ? (s(), i("span", qe, "已显示全部账目")) : b("", !0)])
      ], 64))
    ]));
  }
}), ze = Fe, Re = { class: "wallet-row-mark" }, Oe = {
  key: 0,
  class: "wallet-receipt-note"
}, Qe = {
  key: 0,
  class: "wallet-ledger-caption"
}, Ue = /* @__PURE__ */ k({
  __name: "WalletTransactionDetail",
  props: { transaction: {} },
  emits: ["close"],
  setup(t) {
    const o = new Intl.DateTimeFormat("zh-CN", {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: !1
    });
    return (a, l) => (s(), W(R, {
      class: "wallet-receipt",
      "aria-label": "账单详情",
      onClose: l[1] || (l[1] = (c) => a.$emit("close"))
    }, {
      default: N(() => [
        e("header", null, [l[2] || (l[2] = e("span", null, "账单详情", -1)), e("button", {
          type: "button",
          class: "wallet-icon-button",
          "aria-label": "关闭账单详情",
          autofocus: "",
          onClick: l[0] || (l[0] = (c) => a.$emit("close"))
        }, [g($, { name: "close" })])]),
        e("div", { class: x(["wallet-receipt-hero", `is-${t.transaction.direction}`]) }, [
          e("span", Re, [g($, { name: v(U)(t.transaction) }, null, 8, ["name"])]),
          e("h2", null, n(t.transaction.title), 1),
          e("strong", null, [L(n(v(O)(t.transaction)), 1), l[3] || (l[3] = e("small", null, "小白币", -1))]),
          e("span", null, n(v(Q)[t.transaction.direction]), 1)
        ], 2),
        e("dl", null, [
          e("div", null, [l[4] || (l[4] = e("dt", null, "来自", -1)), e("dd", null, n(t.transaction.source), 1)]),
          e("div", null, [l[5] || (l[5] = e("dt", null, "发生时间", -1)), e("dd", null, n(v(o).format(t.transaction.createdAt)), 1)]),
          e("div", null, [l[6] || (l[6] = e("dt", null, "账目序号", -1)), e("dd", null, "#" + n(t.transaction.sequence), 1)]),
          t.transaction.note ? (s(), i("div", Oe, [l[7] || (l[7] = e("dt", null, "备注", -1)), e("dd", null, n(t.transaction.note), 1)])) : b("", !0)
        ]),
        t.transaction.direction === "transfer" ? (s(), i("p", Qe, "这笔资金在系统账户之间流转，不是你的收入或支出。")) : b("", !0),
        e("footer", null, "小白 OS · " + n(v(w).scope), 1)
      ]),
      _: 1
    }));
  }
}), Ye = Ue, je = { class: "wallet-ui-app wallet-app" }, Ge = { class: "wallet-ui-scroll" }, Pe = ["disabled"], Je = ["disabled"], Ke = ["disabled"], Xe = {
  class: "wallet-ledger",
  "aria-labelledby": "wallet-ledger-title"
}, et = { class: "wallet-ui-section-title" }, tt = { id: "wallet-adopt-title" }, at = { class: "wallet-adopt-actions" }, lt = ["disabled"], nt = ["disabled"], z = 35e3, st = /* @__PURE__ */ k({
  __name: "WalletApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(t) {
    const o = t, a = M(structuredClone(ee(o.initialState))), l = M(!1), c = M(!1), h = M(""), y = M(""), m = M(null), d = M(!1);
    let _ = () => {
    }, f = 0;
    const T = C(() => [
      "unconfirmed",
      "conflict",
      "blocked"
    ].includes(a.value.status)), S = C(() => l.value || a.value.status === "loading" || a.value.status === "saving"), Z = C(() => S.value || T.value || a.value.status === "conflict"), Y = C(() => !!(a.value.message || h.value)), j = C(() => h.value || a.value.status === "conflict" || a.value.status === "blocked" ? "danger" : T.value ? "warning" : "info"), G = C(() => a.value.status === "conflict" ? "账本有变化" : a.value.status === "blocked" ? w.blockedTitle : "保存情况");
    function A(u) {
      return (u instanceof Error ? u.message : String(u)) === "host_request_timeout" ? "暂时没收到结果，请稍后重新加载。" : w.unavailable;
    }
    function E() {
      return { activationId: a.value.activationId };
    }
    function V(u) {
      a.value = structuredClone(u), l.value = !1, c.value = !1, h.value = "", y.value = "";
    }
    async function q() {
      if (S.value || T.value || a.value.status === "conflict") return;
      const u = ++f;
      l.value = !0, h.value = "";
      try {
        const r = await o.bridge.request("wallet/refresh", E(), z);
        u === f && V(r.result);
      } catch (r) {
        u === f && (h.value = A(r));
      } finally {
        u === f && (l.value = !1);
      }
    }
    async function F(u = !1) {
      if (S.value) return;
      const r = ++f;
      l.value = !0, h.value = "";
      try {
        const p = await o.bridge.request(u ? "wallet/adopt-save" : "wallet/confirm-save", E(), z);
        r === f && V(p.result.state), d.value = !1;
      } catch (p) {
        r === f && (h.value = A(p));
      } finally {
        r === f && (l.value = !1);
      }
    }
    async function P() {
      const u = a.value.nextCursor;
      if (!u || c.value || S.value) return;
      const r = f;
      c.value = !0, y.value = "";
      try {
        const p = await o.bridge.request("wallet/load-more", {
          ...E(),
          beforeSequence: u
        });
        if (r !== f) return;
        const J = new Set(a.value.transactions.map((D) => D.id));
        a.value.transactions.push(...p.result.transactions.filter((D) => !J.has(D.id))), a.value.nextCursor = p.result.nextCursor, a.value.hasMore = p.result.hasMore;
      } catch {
        r === f && (y.value = "更多流水暂时无法读取，请稍后重试。");
      } finally {
        r === f && (c.value = !1);
      }
    }
    return K(() => {
      _ = o.bridge.subscribe((u) => {
        u.type === "wallet/state" && (f += 1, V(u.payload.state)), u.type === "wallet/error" && (h.value = A(u.payload?.message || ""));
      });
    }), X(() => {
      f += 1, _();
    }), (u, r) => (s(), i("main", je, [
      g(ue, {
        refreshing: l.value,
        disabled: Z.value,
        onRefresh: q
      }, null, 8, ["refreshing", "disabled"]),
      e("div", Ge, [
        g(be, {
          balance: a.value.balance,
          currency: a.value.currency,
          status: a.value.status
        }, null, 8, [
          "balance",
          "currency",
          "status"
        ]),
        Y.value ? (s(), W(_e, {
          key: 0,
          class: "wallet-notice",
          tone: j.value,
          title: G.value,
          message: h.value || a.value.message
        }, {
          default: N(() => [T.value ? (s(), i("button", {
            key: 0,
            type: "button",
            class: "wallet-ui-text-button",
            disabled: l.value,
            onClick: r[0] || (r[0] = (p) => F())
          }, n(l.value ? v(w).checking : v(w).checkSave), 9, Pe)) : b("", !0), T.value ? (s(), i("button", {
            key: 1,
            type: "button",
            class: "wallet-ui-text-button",
            disabled: l.value,
            onClick: r[1] || (r[1] = (p) => d.value = !0)
          }, n(v(w).adopt), 9, Je)) : h.value ? (s(), i("button", {
            key: 2,
            type: "button",
            class: "wallet-ui-text-button",
            disabled: Z.value,
            onClick: q
          }, n(l.value ? "正在读取…" : "重新加载"), 9, Ke)) : b("", !0)]),
          _: 1
        }, 8, [
          "tone",
          "title",
          "message"
        ])) : b("", !0),
        e("section", Xe, [e("div", et, [r[7] || (r[7] = e("h2", { id: "wallet-ledger-title" }, "收支账单", -1)), e("small", null, "共 " + n(a.value.transactionCount) + " 笔", 1)]), g(ze, {
          transactions: a.value.transactions,
          "has-more": a.value.hasMore,
          "loading-more": c.value,
          loading: a.value.status === "loading",
          error: y.value,
          onLoadMore: P,
          onOpen: r[2] || (r[2] = (p) => m.value = p)
        }, null, 8, [
          "transactions",
          "has-more",
          "loading-more",
          "loading",
          "error"
        ])])
      ]),
      m.value ? (s(), W(Ye, {
        key: 0,
        transaction: m.value,
        onClose: r[3] || (r[3] = (p) => m.value = null)
      }, null, 8, ["transaction"])) : b("", !0),
      d.value ? (s(), W(R, {
        key: 1,
        class: "wallet-adopt-dialog",
        busy: l.value,
        "aria-labelledby": "wallet-adopt-title",
        onClose: r[6] || (r[6] = (p) => d.value = !1)
      }, {
        default: N(() => [
          e("h2", tt, n(v(w).adoptQuestion), 1),
          e("p", null, n(v(w).adoptNotice), 1),
          e("div", at, [e("button", {
            type: "button",
            disabled: l.value,
            onClick: r[4] || (r[4] = (p) => d.value = !1)
          }, n(v(w).cancel), 9, lt), e("button", {
            type: "button",
            disabled: l.value,
            onClick: r[5] || (r[5] = (p) => F(!0))
          }, n(v(w).confirm), 9, nt)])
        ]),
        _: 1
      }, 8, ["busy"])) : b("", !0)
    ]));
  }
}), ot = st;
export {
  ot as default
};
