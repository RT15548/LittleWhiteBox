/* eslint-disable */
import { E as J, F as E, J as K, K as k, M as n, P as D, Q as s, V as L, X as W, Y as _, b as y, f as w, g as r, h, k as P, m as C, p as e, u as S, v as x, y as p } from "./xiaobai-os-runtime-dom.esm-bundler-BcM9c-Z9.js";
import { t as X } from "./xiaobai-os-AppDialog-CI-E933W.js";
var Y = {
  class: "wallet-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.7",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
  focusable: "false"
}, ee = ["d"], te = /* @__PURE__ */ y({
  __name: "WalletIcon",
  props: { name: {} },
  setup(t) {
    const i = {
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
    return (a, l) => (n(), r("svg", Y, [e("path", { d: i[t.name] || i.receipt }, null, 8, ee)]));
  }
}), b = te, ae = { class: "wallet-ui-header" }, le = { class: "wallet-brand" }, ne = ["disabled"], se = /* @__PURE__ */ y({
  __name: "WalletAppHeader",
  props: {
    refreshing: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["refresh"],
  setup(t) {
    return (i, a) => (n(), r("header", ae, [
      e("span", le, [p(b, { name: "wallet" })]),
      a[1] || (a[1] = e("h1", { class: "wallet-ui-title" }, "钱包", -1)),
      a[2] || (a[2] = e("span", { class: "wallet-header-context" }, "当前聊天", -1)),
      e("button", {
        type: "button",
        class: "wallet-icon-button",
        disabled: t.disabled,
        "aria-label": "刷新钱包",
        onClick: a[0] || (a[0] = (l) => i.$emit("refresh"))
      }, [p(b, {
        name: "refresh",
        class: W({ "is-spinning": t.refreshing })
      }, null, 8, ["class"])], 8, ne)
    ]));
  }
}), re = se, ie = {
  class: "wallet-pocket",
  "aria-labelledby": "wallet-balance-title"
}, oe = { class: "wallet-balance" }, ue = { class: "wallet-balance-chip" }, de = ["aria-label"], ce = {
  class: "wallet-pocket-clasp",
  "aria-hidden": "true"
}, ve = /* @__PURE__ */ y({
  __name: "WalletBalanceCard",
  props: {
    balance: {},
    currency: {},
    status: {}
  },
  setup(t) {
    const i = t, a = w(() => ({
      ready: "账目就绪",
      loading: "正在准备",
      saving: "正在保存",
      unconfirmed: "保存待确认",
      conflict: "账目已冻结",
      blocked: "暂时不可用"
    })[i.status]);
    return (l, c) => (n(), r("section", ie, [c[2] || (c[2] = e("div", {
      class: "wallet-pocket-cards",
      "aria-hidden": "true"
    }, [e("span"), e("span")], -1)), e("div", oe, [
      e("header", null, [c[0] || (c[0] = e("span", { id: "wallet-balance-title" }, "可用余额", -1)), e("span", ue, [e("i", { class: W(`is-${t.status}`) }, null, 2), x(s(a.value), 1)])]),
      e("div", {
        class: "wallet-balance-value",
        "aria-label": t.status === "loading" ? "余额正在读取" : `${t.balance.toLocaleString("zh-CN")} ${t.currency}`
      }, [c[1] || (c[1] = e("small", null, "¤", -1)), e("strong", null, s(t.status === "loading" ? "—" : t.balance.toLocaleString("zh-CN")), 1)], 8, de),
      e("footer", null, [e("span", null, s(t.currency) + " · 日常收支", 1), e("span", ce, [p(b, { name: "wallet" })])])
    ])]));
  }
}), me = ve, fe = {
  class: "wallet-ui-notice-icon",
  "aria-hidden": "true"
}, he = { class: "wallet-ui-notice-copy" }, pe = { key: 0 }, ge = /* @__PURE__ */ y({
  __name: "WalletNotice",
  props: {
    title: {},
    message: { default: "" },
    tone: { default: "info" }
  },
  setup(t) {
    return (i, a) => (n(), r("aside", {
      class: W(["wallet-ui-notice", `is-${t.tone}`]),
      role: "status"
    }, [e("span", fe, [E(i.$slots, "icon", {}, () => [a[0] || (a[0] = x("!", -1))])]), e("div", he, [
      e("strong", null, s(t.title), 1),
      t.message ? (n(), r("p", pe, s(t.message), 1)) : h("", !0),
      E(i.$slots, "default")
    ])], 2));
  }
}), be = ge, ye = { class: "wallet-ui-empty" }, we = {
  key: 0,
  class: "wallet-ui-empty-icon",
  "aria-hidden": "true"
}, _e = { key: 1 }, $e = /* @__PURE__ */ y({
  __name: "WalletEmpty",
  props: {
    title: {},
    message: { default: "" }
  },
  setup(t) {
    return (i, a) => (n(), r("div", ye, [
      i.$slots.icon ? (n(), r("span", we, [E(i.$slots, "icon")])) : h("", !0),
      e("strong", null, s(t.title), 1),
      t.message ? (n(), r("p", _e, s(t.message), 1)) : h("", !0)
    ]));
  }
}), ke = $e;
function F(t) {
  return `${t.direction === "income" ? "+" : t.direction === "expense" ? "−" : ""}${t.amount.toLocaleString("zh-CN")}`;
}
var Z = {
  income: "收入",
  expense: "支出",
  transfer: "系统划转"
};
function z(t) {
  return {
    economy: "gift",
    bank: "bank",
    shop: "shop",
    tasks: "tasks",
    game: "game"
  }[t.sourceDomain] || t.direction;
}
var Me = {
  class: "wallet-row-mark",
  "aria-hidden": "true"
}, Ce = { class: "wallet-row-copy" }, We = { class: "wallet-row-value" }, Te = /* @__PURE__ */ y({
  __name: "WalletTransactionRow",
  props: { transaction: {} },
  emits: ["open"],
  setup(t) {
    const i = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !1
    });
    return (a, l) => (n(), r("li", null, [e("button", {
      type: "button",
      class: W(["wallet-row", `is-${t.transaction.direction}`]),
      onClick: l[0] || (l[0] = (c) => a.$emit("open", t.transaction))
    }, [
      e("span", Me, [p(b, { name: _(z)(t.transaction) }, null, 8, ["name"])]),
      e("span", Ce, [e("strong", null, s(t.transaction.title), 1), e("small", null, s(t.transaction.source) + " · " + s(_(i).format(t.transaction.createdAt)), 1)]),
      e("span", We, [e("strong", null, s(_(F)(t.transaction)), 1), e("small", null, s(_(Z)[t.transaction.direction]), 1)])
    ], 2)]));
  }
}), Se = Te, xe = {
  class: "wallet-filters",
  "aria-label": "账单类型"
}, Be = ["aria-pressed", "onClick"], Ne = {
  key: 0,
  class: "wallet-ledger-caption"
}, Ve = {
  key: 1,
  class: "wallet-ui-empty",
  role: "status"
}, Ae = { class: "wallet-ui-list" }, De = { class: "wallet-ledger-foot" }, Ee = {
  key: 0,
  class: "wallet-load-error",
  role: "alert"
}, Le = ["disabled"], Ie = {
  key: 2,
  class: "wallet-ledger-end"
}, He = /* @__PURE__ */ y({
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
    const i = t, a = k("all"), l = [
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
    }), f = w(() => {
      const g = [];
      for (const v of i.transactions) {
        if (a.value !== "all" && v.direction !== a.value) continue;
        const m = c.format(v.createdAt), u = g.at(-1);
        u?.date === m ? u.transactions.push(v) : g.push({
          date: m,
          transactions: [v]
        });
      }
      return g;
    });
    return (g, v) => (n(), r("div", null, [
      e("div", xe, [(n(), r(S, null, D(l, (m) => e("button", {
        key: m.id,
        type: "button",
        "aria-pressed": a.value === m.id,
        onClick: (u) => a.value = m.id
      }, s(m.label), 9, Be)), 64))]),
      a.value === "transfer" ? (n(), r("p", Ne, "系统账户间的划转，不计入你的个人收支。")) : h("", !0),
      t.loading ? (n(), r("div", Ve, [p(b, {
        name: "refresh",
        class: "is-spinning"
      }), v[2] || (v[2] = e("strong", null, "正在准备你的钱包…", -1))])) : (n(), r(S, { key: 2 }, [
        f.value.length ? h("", !0) : (n(), C(ke, {
          key: 0,
          title: t.hasMore ? "已加载的账目中暂无匹配项" : "这里还没有账目",
          message: "每一笔已确认的资金流动，都会记在这里。"
        }, {
          icon: L(() => [p(b, { name: "receipt" })]),
          _: 1
        }, 8, ["title"])),
        (n(!0), r(S, null, D(f.value, (m) => (n(), r("section", {
          key: m.transactions[0].id,
          class: "wallet-day-group"
        }, [e("h3", null, s(m.date), 1), e("ol", Ae, [(n(!0), r(S, null, D(m.transactions, (u) => (n(), C(Se, {
          key: u.id,
          transaction: u,
          onOpen: v[0] || (v[0] = (M) => g.$emit("open", M))
        }, null, 8, ["transaction"]))), 128))])]))), 128)),
        e("div", De, [t.error ? (n(), r("p", Ee, s(t.error), 1)) : h("", !0), t.hasMore ? (n(), r("button", {
          key: 1,
          type: "button",
          class: "wallet-ui-text-button",
          disabled: t.loadingMore,
          onClick: v[1] || (v[1] = (m) => g.$emit("loadMore"))
        }, [x(s(t.loadingMore ? "正在读取…" : "查看更早的账单"), 1), p(b, { name: "next" })], 8, Le)) : t.transactions.length ? (n(), r("span", Ie, "每一笔，都有来处")) : h("", !0)])
      ], 64))
    ]));
  }
}), qe = He, Fe = { class: "wallet-row-mark" }, Ze = {
  key: 0,
  class: "wallet-receipt-note"
}, ze = {
  key: 0,
  class: "wallet-ledger-caption"
}, Re = /* @__PURE__ */ y({
  __name: "WalletTransactionDetail",
  props: { transaction: {} },
  emits: ["close"],
  setup(t) {
    const i = new Intl.DateTimeFormat("zh-CN", {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: !1
    });
    return (a, l) => (n(), C(X, {
      class: "wallet-receipt",
      "aria-label": "账单详情",
      onClose: l[1] || (l[1] = (c) => a.$emit("close"))
    }, {
      default: L(() => [
        e("header", null, [l[2] || (l[2] = e("span", null, "账单详情", -1)), e("button", {
          type: "button",
          class: "wallet-icon-button",
          "aria-label": "关闭账单详情",
          autofocus: "",
          onClick: l[0] || (l[0] = (c) => a.$emit("close"))
        }, [p(b, { name: "close" })])]),
        e("div", { class: W(["wallet-receipt-hero", `is-${t.transaction.direction}`]) }, [
          e("span", Fe, [p(b, { name: _(z)(t.transaction) }, null, 8, ["name"])]),
          e("h2", null, s(t.transaction.title), 1),
          e("strong", null, [x(s(_(F)(t.transaction)), 1), l[3] || (l[3] = e("small", null, "小白币", -1))]),
          e("span", null, s(_(Z)[t.transaction.direction]), 1)
        ], 2),
        e("dl", null, [
          e("div", null, [l[4] || (l[4] = e("dt", null, "来自", -1)), e("dd", null, s(t.transaction.source), 1)]),
          e("div", null, [l[5] || (l[5] = e("dt", null, "发生时间", -1)), e("dd", null, s(_(i).format(t.transaction.createdAt)), 1)]),
          e("div", null, [l[6] || (l[6] = e("dt", null, "账目序号", -1)), e("dd", null, "#" + s(t.transaction.sequence), 1)]),
          t.transaction.note ? (n(), r("div", Ze, [l[7] || (l[7] = e("dt", null, "备注", -1)), e("dd", null, s(t.transaction.note), 1)])) : h("", !0)
        ]),
        t.transaction.direction === "transfer" ? (n(), r("p", ze, "这笔资金在系统账户之间流转，不是你的收入或支出。")) : h("", !0),
        l[8] || (l[8] = e("footer", null, "小白 OS · 当前聊天账本", -1))
      ]),
      _: 1
    }));
  }
}), Oe = Re, Ue = { class: "wallet-ui-app wallet-app" }, Qe = { class: "wallet-ui-scroll" }, je = ["disabled"], Ge = ["disabled"], Je = {
  class: "wallet-ledger",
  "aria-labelledby": "wallet-ledger-title"
}, Ke = { class: "wallet-ui-section-title" }, q = 35e3, Pe = /* @__PURE__ */ y({
  __name: "WalletApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(t) {
    const i = t, a = k(structuredClone(K(i.initialState))), l = k(!1), c = k(!1), f = k(""), g = k(""), v = k(null);
    let m = () => {
    }, u = 0;
    const M = w(() => a.value.status === "unconfirmed"), T = w(() => l.value || a.value.status === "loading" || a.value.status === "saving"), I = w(() => T.value || M.value || a.value.status === "conflict"), R = w(() => !!(a.value.message || f.value)), O = w(() => f.value || a.value.status === "conflict" || a.value.status === "blocked" ? "danger" : M.value ? "warning" : "info"), U = w(() => a.value.status === "conflict" ? "账本发生冲突" : a.value.status === "blocked" ? "钱包暂时无法读取" : "账本状态");
    function B(o) {
      const d = o instanceof Error ? o.message : String(o);
      return d.includes("聊天已切换") ? "聊天已切换，请重新打开钱包。" : d === "host_request_timeout" ? "读取等待超时，请稍后重新读取。" : "钱包数据暂时无法读取，请稍后重试。";
    }
    function N() {
      return { chatIdentity: a.value.chatIdentity };
    }
    function V(o) {
      a.value = structuredClone(o), l.value = !1, c.value = !1, f.value = "", g.value = "";
    }
    async function H() {
      if (T.value || M.value || a.value.status === "conflict") return;
      const o = ++u;
      l.value = !0, f.value = "";
      try {
        const d = await i.bridge.request("wallet/refresh", N(), q);
        o === u && V(d.result);
      } catch (d) {
        o === u && (f.value = B(d));
      } finally {
        o === u && (l.value = !1);
      }
    }
    async function Q() {
      if (T.value) return;
      const o = ++u;
      l.value = !0, f.value = "";
      try {
        const d = await i.bridge.request("wallet/confirm-save", N(), q);
        o === u && V(d.result.state);
      } catch (d) {
        o === u && (f.value = B(d));
      } finally {
        o === u && (l.value = !1);
      }
    }
    async function j() {
      const o = a.value.nextCursor;
      if (!o || c.value || T.value) return;
      const d = u;
      c.value = !0, g.value = "";
      try {
        const $ = await i.bridge.request("wallet/load-more", {
          ...N(),
          beforeSequence: o
        });
        if (d !== u) return;
        const G = new Set(a.value.transactions.map((A) => A.id));
        a.value.transactions.push(...$.result.transactions.filter((A) => !G.has(A.id))), a.value.nextCursor = $.result.nextCursor, a.value.hasMore = $.result.hasMore;
      } catch {
        d === u && (g.value = "更多流水暂时无法读取，请稍后重试。");
      } finally {
        d === u && (c.value = !1);
      }
    }
    return P(() => {
      m = i.bridge.subscribe((o) => {
        o.type === "wallet/state" && (u += 1, V(o.payload.state)), o.type === "wallet/error" && (f.value = B(o.payload?.message || ""));
      });
    }), J(() => {
      u += 1, m();
    }), (o, d) => (n(), r("main", Ue, [
      p(re, {
        refreshing: l.value,
        disabled: I.value,
        onRefresh: H
      }, null, 8, ["refreshing", "disabled"]),
      e("div", Qe, [
        p(me, {
          balance: a.value.balance,
          currency: a.value.currency,
          status: a.value.status
        }, null, 8, [
          "balance",
          "currency",
          "status"
        ]),
        R.value ? (n(), C(be, {
          key: 0,
          class: "wallet-notice",
          tone: O.value,
          title: U.value,
          message: f.value || a.value.message
        }, {
          default: L(() => [M.value ? (n(), r("button", {
            key: 0,
            type: "button",
            class: "wallet-ui-text-button",
            disabled: l.value,
            onClick: Q
          }, s(l.value ? "正在核实…" : "核实保存结果"), 9, je)) : a.value.status === "blocked" || f.value ? (n(), r("button", {
            key: 1,
            type: "button",
            class: "wallet-ui-text-button",
            disabled: I.value,
            onClick: H
          }, s(l.value ? "正在读取…" : "重新读取"), 9, Ge)) : h("", !0)]),
          _: 1
        }, 8, [
          "tone",
          "title",
          "message"
        ])) : h("", !0),
        e("section", Je, [e("div", Ke, [d[2] || (d[2] = e("h2", { id: "wallet-ledger-title" }, "收支账单", -1)), e("small", null, "共 " + s(a.value.transactionCount) + " 笔", 1)]), p(qe, {
          transactions: a.value.transactions,
          "has-more": a.value.hasMore,
          "loading-more": c.value,
          loading: a.value.status === "loading",
          error: g.value,
          onLoadMore: j,
          onOpen: d[0] || (d[0] = ($) => v.value = $)
        }, null, 8, [
          "transactions",
          "has-more",
          "loading-more",
          "loading",
          "error"
        ])])
      ]),
      v.value ? (n(), C(Oe, {
        key: 0,
        transaction: v.value,
        onClose: d[1] || (d[1] = ($) => v.value = null)
      }, null, 8, ["transaction"])) : h("", !0)
    ]));
  }
}), et = Pe;
export {
  et as default
};
