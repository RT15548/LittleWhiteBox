/* eslint-disable */
import { $ as de, D as N, E as g, P as ve, Q as be, R as ce, S as u, T as O, U as D, V as s, b as R, d as ke, ft as l, h as A, lt as ae, m as me, ot as fe, r as pe, rt as C, ut as P, v as _, x as k, y as e } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as ge } from "./xiaobai-os-AppDialog-B4VpOkFC.js";
import { t as ye } from "./xiaobai-os-identity-DpYJdX5Y.js";
var he = class extends Error {
  code;
  constructor(t, o = "") {
    super(o ? `${t}:${o}` : t), this.name = "BankError", this.code = t;
  }
};
function x(t, o = "") {
  throw new he(t, o);
}
var te = 1e4;
function le(t, o = "amount") {
  return (typeof t != "number" || !Number.isSafeInteger(t) || t <= 0) && x("bank_amount_invalid", o), t;
}
function $e(t, o = "payout") {
  return (typeof t != "number" || !Number.isSafeInteger(t) || t < 0) && x("bank_amount_invalid", o), t > 5e4 && x("bank_amount_overflow", o), t;
}
function ne(t, o) {
  return (typeof t != "number" || !Number.isSafeInteger(t) || t <= 0) && x("bank_amount_invalid", o), t;
}
function _e(t, o, a) {
  const n = le(t), b = ne(o, "numerator"), f = ne(a, "denominator");
  return n > Math.floor(Number.MAX_SAFE_INTEGER / b) && x("bank_amount_overflow"), $e(Math.floor(n * b / f));
}
function we(t, o) {
  const a = le(t, "principal");
  (typeof o != "number" || !Number.isSafeInteger(o)) && x("bank_amount_invalid", "bps");
  const n = te + o;
  return (!Number.isSafeInteger(n) || n < 0) && x("bank_amount_invalid", "bps"), n === 0 ? 0 : _e(a, n, te);
}
var Ce = { class: "bank-dialog-subject" }, Be = { key: 0 }, Se = { class: "bank-dialog-field" }, Ae = { class: "bank-amount-input" }, Me = ["disabled"], Le = {
  id: "bank-amount-help",
  class: "bank-amount-help"
}, Ne = { class: "bank-quick-amounts" }, Ie = [
  "disabled",
  "aria-pressed",
  "onClick"
], Re = {
  key: 1,
  class: "bank-inline-error",
  role: "status"
}, Pe = {
  key: 2,
  class: "bank-dialog-summary"
}, De = { key: 0 }, xe = { class: "bank-dialog-summary" }, ze = { class: "bank-withdraw-amount" }, Ee = { class: "bank-dialog-summary" }, Ve = { class: "is-loss" }, Te = {
  key: 5,
  class: "bank-amount-help"
}, qe = {
  key: 6,
  class: "bank-inline-error",
  role: "status"
}, Fe = {
  key: 7,
  class: "bank-inline-error",
  role: "alert"
}, Oe = { class: "bank-dialog-actions" }, Ue = ["disabled"], We = ["disabled"], Ze = /* @__PURE__ */ N({
  __name: "BankActionDialog",
  props: {
    mode: {},
    product: {},
    position: {},
    balance: {},
    busy: { type: Boolean },
    error: {},
    disabledReason: {},
    claimableCount: {}
  },
  emits: ["cancel", "confirm"],
  setup(t, { emit: o }) {
    const a = t, n = o, b = C(a.product ? String(a.product.minAmount) : ""), f = _(() => a.mode === "deposit-open" ? "存入定期" : a.mode === "fund-open" ? "申购理财" : "提前支取"), c = _(() => /^\d+$/.test(b.value.trim()) ? Number(b.value) : 0), p = _(() => a.mode === "withdraw" ? "" : !a.product || !Number.isSafeInteger(c.value) || c.value <= 0 ? "请输入正整数金额" : c.value < a.product.minAmount || c.value > a.product.maxAmount ? `金额须在 ${a.product.minAmount.toLocaleString("zh-CN")} 至 ${a.product.maxAmount.toLocaleString("zh-CN")} 之间` : c.value > a.balance ? "可用余额不足" : ""), w = _(() => a.mode === "deposit-open" ? a.product : null), h = _(() => a.mode === "fund-open" ? a.product : null), M = _(() => w.value && !p.value ? we(c.value, w.value.interestBps) : null), z = _(() => {
      const v = a.product;
      return v ? [.../* @__PURE__ */ new Set([
        v.minAmount,
        v.minAmount * 2,
        Math.min(v.maxAmount, a.balance)
      ])].filter((d) => d >= v.minAmount && d <= v.maxAmount && d <= a.balance).sort((d, $) => d - $) : [];
    }), L = _(() => !a.busy && !a.disabledReason && !p.value);
    function U() {
      L.value && (a.mode === "withdraw" ? n("confirm") : n("confirm", c.value));
    }
    return (v, d) => (s(), R(ge, {
      class: "bank-dialog",
      "aria-label": f.value,
      busy: t.busy,
      onClose: d[2] || (d[2] = ($) => n("cancel"))
    }, {
      default: be(() => [e("form", { onSubmit: me(U, ["prevent"]) }, [
        e("h2", null, l(f.value), 1),
        e("div", Ce, [e("strong", null, l(t.position?.name || t.product?.name), 1), t.product ? (s(), u("span", Be, l(t.product.lockRounds) + " 回合", 1)) : k("", !0)]),
        t.mode !== "withdraw" ? (s(), u(A, { key: 0 }, [
          e("label", Se, [e("span", null, l(t.mode === "deposit-open" ? "存入金额" : "申购金额"), 1), e("span", Ae, [d[3] || (d[3] = e("i", null, "¤", -1)), de(e("input", {
            "onUpdate:modelValue": d[0] || (d[0] = ($) => b.value = $),
            disabled: t.busy,
            type: "text",
            inputmode: "numeric",
            autocomplete: "off",
            "aria-describedby": "bank-amount-help"
          }, null, 8, Me), [[ke, b.value]])])]),
          e("small", Le, "钱包可用 ¤ " + l(t.balance.toLocaleString("zh-CN")) + " · " + l(t.product?.amountLabel), 1),
          e("div", Ne, [(s(!0), u(A, null, D(z.value, ($) => (s(), u("button", {
            key: $,
            type: "button",
            disabled: t.busy,
            "aria-pressed": c.value === $,
            onClick: (W) => b.value = String($)
          }, "¤ " + l($.toLocaleString("zh-CN")), 9, Ie))), 128))])
        ], 64)) : k("", !0),
        p.value ? (s(), u("p", Re, l(p.value), 1)) : k("", !0),
        w.value ? (s(), u("dl", Pe, [
          e("div", null, [d[4] || (d[4] = e("dt", null, "整期收益率", -1)), e("dd", null, l(w.value.interestLabel), 1)]),
          M.value !== null ? (s(), u("div", De, [d[5] || (d[5] = e("dt", null, "到期到账（含本金）", -1)), e("dd", null, "¤ " + l(M.value.toLocaleString("zh-CN")), 1)])) : k("", !0),
          e("div", null, [d[6] || (d[6] = e("dt", null, "提前支取", -1)), e("dd", null, "本金 " + l(w.value.earlyPenaltyLabel) + "，无利息", 1)])
        ])) : k("", !0),
        h.value ? (s(), u(A, { key: 3 }, [e("dl", xe, [e("div", null, [d[7] || (d[7] = e("dt", null, "整期收益区间", -1)), e("dd", null, l(h.value.returnLabel), 1)]), e("div", null, [d[8] || (d[8] = e("dt", null, "风险等级", -1)), e("dd", null, l(h.value.riskLabel), 1)])]), d[9] || (d[9] = e("p", { class: "bank-dialog-warning" }, "可能损失本金。申购后不能提前退出，实际收益到期后揭晓。", -1))], 64)) : k("", !0),
        t.mode === "withdraw" && t.position ? (s(), u(A, { key: 4 }, [
          e("div", ze, [d[10] || (d[10] = e("span", null, "现在实际到账", -1)), e("strong", null, "¤ " + l(t.position.earlyWithdrawalAmount.toLocaleString("zh-CN")), 1)]),
          e("dl", Ee, [e("div", null, [d[11] || (d[11] = e("dt", null, "原存入本金", -1)), e("dd", null, "¤ " + l(t.position.principal.toLocaleString("zh-CN")), 1)]), e("div", null, [d[12] || (d[12] = e("dt", null, "提前支取损失", -1)), e("dd", Ve, "¤ " + l((t.position.principal - t.position.earlyWithdrawalAmount).toLocaleString("zh-CN")), 1)])]),
          d[13] || (d[13] = e("p", { class: "bank-dialog-warning" }, "不再获得到期利息，确认后不可撤销。", -1))
        ], 64)) : k("", !0),
        t.claimableCount ? (s(), u("p", Te, "另有 " + l(t.claimableCount) + " 笔到期资产，将随本次操作一并兑付至钱包。", 1)) : k("", !0),
        t.disabledReason && !t.busy ? (s(), u("p", qe, l(t.disabledReason), 1)) : k("", !0),
        t.error ? (s(), u("p", Fe, l(t.error), 1)) : k("", !0),
        e("footer", Oe, [e("button", {
          type: "button",
          class: "bank-secondary-button",
          disabled: t.busy,
          autofocus: "",
          onClick: d[1] || (d[1] = ($) => n("cancel"))
        }, "返回", 8, Ue), e("button", {
          type: "submit",
          class: "bank-primary-button",
          disabled: !L.value
        }, l(t.busy ? "正在保存…" : t.mode === "withdraw" ? "确认支取" : t.mode === "fund-open" ? "确认申购" : "确认存入"), 9, We)])
      ], 32)]),
      _: 1
    }, 8, ["aria-label", "busy"]));
  }
}), Ge = Ze, He = {
  class: "bank-page",
  "aria-labelledby": "bank-deposits-title"
}, Ke = { class: "bank-product-grid" }, je = { class: "bank-term-pill" }, Qe = { class: "bank-product-offer" }, Xe = { class: "bank-deposit-rate" }, Je = [
  "aria-label",
  "disabled",
  "onClick"
], Ye = { class: "bank-product-terms" }, ea = {
  key: 0,
  class: "bank-product-hint"
}, aa = /* @__PURE__ */ N({
  __name: "BankDeposits",
  props: {
    products: {},
    balance: {},
    writeDisabledReason: {}
  },
  emits: ["open"],
  setup(t) {
    return (o, a) => (s(), u("section", He, [
      a[3] || (a[3] = e("header", { class: "bank-page-heading" }, [e("h2", { id: "bank-deposits-title" }, "定期存单")], -1)),
      e("div", Ke, [(s(!0), u(A, null, D(t.products, (n) => (s(), u("article", {
        key: n.id,
        class: "bank-product-card bank-deposit-card"
      }, [
        e("header", null, [e("h3", null, l(n.name), 1), e("span", je, l(n.lockRounds) + " 回合", 1)]),
        e("div", Qe, [e("div", Xe, [e("strong", null, l(n.interestLabel), 1), a[0] || (a[0] = e("span", null, "整期收益率 · 非年化", -1))]), e("button", {
          type: "button",
          class: "bank-primary-button",
          "aria-label": `存入${n.name}`,
          disabled: !!t.writeDisabledReason || t.balance < n.minAmount,
          onClick: (b) => o.$emit("open", n)
        }, "存入", 8, Je)]),
        e("dl", Ye, [e("div", null, [a[1] || (a[1] = e("dt", null, "存入范围", -1)), e("dd", null, l(n.amountLabel), 1)]), e("div", null, [a[2] || (a[2] = e("dt", null, "提前支取", -1)), e("dd", null, "本金 " + l(n.earlyPenaltyLabel) + "，无利息", 1)])]),
        t.balance < n.minAmount ? (s(), u("p", ea, "钱包余额不足最低存入金额")) : k("", !0)
      ]))), 128))]),
      a[4] || (a[4] = e("p", { class: "bank-footnote" }, "每完成一条剧情回复，推进一回合。", -1))
    ]));
  }
}), ta = aa, na = {
  class: "bank-page",
  "aria-labelledby": "bank-funds-title"
}, la = { class: "bank-product-grid" }, sa = ["data-risk"], ia = { class: "bank-fund-description" }, ua = { class: "bank-product-offer" }, oa = { class: "bank-return-range" }, ra = [
  "aria-label",
  "disabled",
  "onClick"
], da = { class: "bank-product-terms" }, va = {
  key: 0,
  class: "bank-product-hint"
}, ba = /* @__PURE__ */ N({
  __name: "BankFunds",
  props: {
    products: {},
    balance: {},
    writeDisabledReason: {}
  },
  emits: ["open"],
  setup(t) {
    return (o, a) => (s(), u("section", na, [
      a[3] || (a[3] = e("header", { class: "bank-page-heading" }, [e("h2", { id: "bank-funds-title" }, "浮动理财"), e("p", null, "可能损失本金，到期前不可退出。")], -1)),
      e("div", la, [(s(!0), u(A, null, D(t.products, (n) => (s(), u("article", {
        key: n.id,
        class: "bank-product-card bank-fund-card",
        "data-risk": n.riskLevel
      }, [
        e("header", null, [e("h3", null, l(n.name), 1), e("span", { class: P(["bank-risk-badge", `is-${n.riskLevel}`]) }, l(n.riskLabel), 3)]),
        e("p", ia, l(n.description), 1),
        e("div", ua, [e("div", oa, [e("strong", null, l(n.returnLabel), 1), a[0] || (a[0] = e("span", null, "整期收益区间 · 非年化", -1))]), e("button", {
          type: "button",
          class: "bank-primary-button",
          "aria-label": `申购${n.name}`,
          disabled: !!t.writeDisabledReason || t.balance < n.minAmount,
          onClick: (b) => o.$emit("open", n)
        }, "申购", 8, ra)]),
        e("dl", da, [e("div", null, [a[1] || (a[1] = e("dt", null, "申购范围", -1)), e("dd", null, l(n.amountLabel), 1)]), e("div", null, [a[2] || (a[2] = e("dt", null, "锁定期限", -1)), e("dd", null, l(n.lockRounds) + " 回合", 1)])]),
        t.balance < n.minAmount ? (s(), u("p", va, "钱包余额不足最低申购金额")) : k("", !0)
      ], 8, sa))), 128))]),
      a[4] || (a[4] = e("p", { class: "bank-footnote" }, "以上为合同区间，实际收益到期揭晓。", -1))
    ]));
  }
}), ca = ba, ka = {
  class: "bank-product-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.7",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
  focusable: "false"
}, ma = ["d"], fa = {
  key: 0,
  cx: "12",
  cy: "12",
  r: "6"
}, pa = /* @__PURE__ */ N({
  __name: "BankProductIcon",
  props: { kind: {} },
  setup(t) {
    const o = {
      vault: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm-2 4h2m-2 10h2m7-9v8m-4-4h8",
      deposit: "M5 3h11l3 3v15H5V3Zm11 0v3h3M8 9h8m-8 4h6m-6 4h4",
      fund: "M4 20h16M5 16l5-5 4 3 5-8m-4 0h4v4",
      records: "M5 3h14v18l-3-2-4 2-4-2-3 2V3Zm3 5h8m-8 4h8m-8 4h4",
      withdraw: "M3 12h13m-4-4 4 4-4 4M19 4h2v16h-2",
      positions: "M3 8h18v12H3V8Zm5 0V4h8v4M3 13h18M10 13v3h4v-3",
      refresh: "M20 5v6h-6M4 19v-6h6M6 7a7 7 0 0 1 12-1l2 5M4 13l2 5a7 7 0 0 0 12-1",
      next: "m9 5 7 7-7 7",
      lock: "M5 10h14v11H5V10Zm3 0V6a4 4 0 0 1 8 0v4m-4 5v2",
      check: "m5 12 4 4L19 6"
    };
    return (a, n) => (s(), u("svg", ka, [e("path", { d: o[t.kind] }, null, 8, ma), t.kind === "vault" ? (s(), u("circle", fa)) : k("", !0)]));
  }
}), y = pa, ga = {
  class: "bank-page",
  "aria-labelledby": "bank-positions-title"
}, ya = ["disabled"], ha = {
  key: 1,
  class: "bank-empty-state"
}, $a = {
  key: 2,
  class: "bank-position-group"
}, _a = { class: "bank-section-heading" }, wa = { class: "bank-product-mark" }, Ca = { class: "bank-position-amounts" }, Ba = { key: 0 }, Sa = ["disabled", "onClick"], Aa = {
  key: 3,
  class: "bank-position-group"
}, Ma = { class: "bank-section-heading" }, La = { class: "bank-product-mark" }, Na = { class: "bank-fund-principal" }, Ia = {
  key: 1,
  class: "bank-sealed-copy"
}, Ra = /* @__PURE__ */ N({
  __name: "BankPositions",
  props: {
    deposits: {},
    investments: {},
    claimableCount: {},
    writeDisabledReason: {}
  },
  emits: [
    "withdraw",
    "settle",
    "browse"
  ],
  setup(t) {
    return (o, a) => (s(), u("section", ga, [
      a[10] || (a[10] = e("header", { class: "bank-page-heading" }, [e("h2", { id: "bank-positions-title" }, "我的持有")], -1)),
      t.claimableCount ? (s(), u("button", {
        key: 0,
        type: "button",
        class: "bank-claim-button",
        disabled: !!t.writeDisabledReason,
        onClick: a[0] || (a[0] = (n) => o.$emit("settle"))
      }, [
        g(y, { kind: "check" }),
        e("span", null, l(t.claimableCount) + " 笔已到期", 1),
        a[2] || (a[2] = e("strong", null, "全部领取", -1)),
        g(y, { kind: "next" })
      ], 8, ya)) : k("", !0),
      !t.deposits.length && !t.investments.length ? (s(), u("div", ha, [
        g(y, { kind: "positions" }),
        a[3] || (a[3] = e("h3", null, "暂无持有", -1)),
        e("button", {
          type: "button",
          class: "bank-secondary-button",
          onClick: a[1] || (a[1] = (n) => o.$emit("browse"))
        }, "查看存单")
      ])) : k("", !0),
      t.deposits.length ? (s(), u("div", $a, [e("header", _a, [e("h3", null, [a[4] || (a[4] = O("定期存单 ", -1)), e("small", null, l(t.deposits.length), 1)])]), (s(!0), u(A, null, D(t.deposits, (n) => (s(), u("article", {
        key: n.id,
        class: "bank-position-card"
      }, [
        e("header", null, [
          e("span", wa, [g(y, { kind: "deposit" })]),
          e("h4", null, l(n.name), 1),
          e("span", { class: P(["bank-position-status", { "is-due": n.claimable }]) }, l(n.statusLabel), 3)
        ]),
        e("dl", Ca, [e("div", null, [a[5] || (a[5] = e("dt", null, "存入本金", -1)), e("dd", null, "¤ " + l(n.principal.toLocaleString("zh-CN")), 1)]), e("div", null, [a[6] || (a[6] = e("dt", null, "到期到账", -1)), e("dd", null, "¤ " + l(n.maturityAmount.toLocaleString("zh-CN")), 1)])]),
        n.claimable ? k("", !0) : (s(), u("footer", Ba, [e("span", null, "现在支取到账 ¤ " + l(n.earlyWithdrawalAmount.toLocaleString("zh-CN")), 1), e("button", {
          type: "button",
          class: "bank-text-button is-loss",
          disabled: !!t.writeDisabledReason,
          onClick: (b) => o.$emit("withdraw", n)
        }, "提前支取", 8, Sa)]))
      ]))), 128))])) : k("", !0),
      t.investments.length ? (s(), u("div", Aa, [e("header", Ma, [e("h3", null, [a[7] || (a[7] = O("浮动理财 ", -1)), e("small", null, l(t.investments.length), 1)])]), (s(!0), u(A, null, D(t.investments, (n) => (s(), u("article", {
        key: n.id,
        class: "bank-position-card"
      }, [
        e("header", null, [
          e("span", La, [g(y, { kind: "fund" })]),
          e("h4", null, l(n.name), 1),
          e("span", { class: P(["bank-position-status", { "is-due": n.claimable }]) }, l(n.statusLabel), 3)
        ]),
        e("div", Na, [e("span", null, l(n.riskLabel) + " · 申购本金", 1), e("strong", null, "¤ " + l(n.principal.toLocaleString("zh-CN")), 1)]),
        n.claimable ? (s(), u("div", {
          key: 0,
          class: P(["bank-fund-result", { "is-negative": n.resolvedReturnBps < 0 }])
        }, [
          a[8] || (a[8] = e("span", null, "到期结果已揭晓", -1)),
          e("strong", null, l(n.returnLabel), 1),
          e("small", null, "可领取 ¤ " + l(n.settlementAmount.toLocaleString("zh-CN")), 1)
        ], 2)) : (s(), u("div", Ia, [g(y, { kind: "lock" }), a[9] || (a[9] = e("p", null, "收益到期揭晓，锁定期间不可退出。", -1))]))
      ]))), 128))])) : k("", !0)
    ]));
  }
}), Pa = Ra;
function H(t) {
  return JSON.stringify([
    t.sourceStoryId ? "legacy" : "current",
    t.sourceStoryId ?? null,
    t.id
  ]);
}
var Da = {
  class: "bank-page",
  "aria-labelledby": "bank-records-title"
}, xa = { class: "bank-page-heading" }, za = { id: "bank-records-title" }, Ea = {
  key: 0,
  class: "bank-empty-state"
}, Va = {
  key: 1,
  class: "bank-record-list"
}, Ta = { class: "bank-product-mark" }, qa = { class: "bank-record-main" }, Fa = { class: "bank-record-detail" }, Oa = { key: 0 }, Ua = {
  key: 2,
  class: "bank-inline-error",
  role: "alert"
}, Wa = ["disabled"], Za = /* @__PURE__ */ N({
  __name: "BankRecords",
  props: {
    activities: {},
    total: {},
    hasMore: { type: Boolean },
    loadingMore: { type: Boolean },
    error: {}
  },
  emits: ["loadMore"],
  setup(t) {
    const o = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: !1
    });
    return (a, n) => (s(), u("section", Da, [
      e("header", xa, [e("h2", za, [n[1] || (n[1] = O("兑付记录 ", -1)), e("small", null, l(t.total) + " 笔", 1)])]),
      t.activities.length ? (s(), u("div", Va, [(s(!0), u(A, null, D(t.activities, (b) => (s(), u("details", {
        key: ae(H)(b),
        class: "bank-record-row"
      }, [e("summary", null, [
        e("span", Ta, [g(y, { kind: b.kind }, null, 8, ["kind"])]),
        e("span", qa, [e("strong", null, l(b.productName), 1), e("small", null, l(b.resultLabel), 1)]),
        e("span", { class: P(["bank-record-net", {
          "is-negative": b.net < 0,
          "is-flat": b.net === 0
        }]) }, [e("strong", null, l(b.net > 0 ? "+" : "") + l(b.net.toLocaleString("zh-CN")), 1), e("small", null, l(b.net < 0 ? "净损失" : b.net > 0 ? "净收益" : "持平"), 1)], 2),
        g(y, { kind: "next" })
      ]), e("dl", Fa, [
        e("div", null, [n[3] || (n[3] = e("dt", null, "投入本金", -1)), e("dd", null, "¤ " + l(b.amountIn.toLocaleString("zh-CN")), 1)]),
        e("div", null, [n[4] || (n[4] = e("dt", null, "实际到账", -1)), e("dd", null, "¤ " + l(b.payout.toLocaleString("zh-CN")), 1)]),
        e("div", null, [n[5] || (n[5] = e("dt", null, "结算回合", -1)), e("dd", null, l(b.turnLabel), 1)]),
        e("div", null, [n[6] || (n[6] = e("dt", null, "发生时间", -1)), e("dd", null, l(ae(o).format(b.createdAt)), 1)]),
        b.sourceStoryId ? (s(), u("div", Oa, [n[7] || (n[7] = e("dt", null, "原聊天", -1)), e("dd", null, l(b.sourceStoryId), 1)])) : k("", !0)
      ])]))), 128))])) : (s(), u("div", Ea, [g(y, { kind: "records" }), n[2] || (n[2] = e("h3", null, "暂无兑付记录", -1))])),
      t.error ? (s(), u("p", Ua, l(t.error), 1)) : k("", !0),
      t.hasMore ? (s(), u("button", {
        key: 3,
        type: "button",
        class: "bank-secondary-button bank-full-button bank-load-more",
        disabled: t.loadingMore,
        onClick: n[0] || (n[0] = (b) => a.$emit("loadMore"))
      }, l(t.loadingMore ? "正在读取…" : "查看更早的记录"), 9, Wa)) : k("", !0)
    ]));
  }
}), Ga = Za, Ha = {
  class: "bank-vault bank-page",
  "aria-labelledby": "bank-vault-title"
}, Ka = { class: "bank-assets" }, ja = ["disabled"], Qa = { class: "bank-vault-portals" }, Xa = { class: "bank-portal-mark" }, Ja = { class: "bank-portal-mark" }, Ya = { class: "bank-timing" }, et = /* @__PURE__ */ N({
  __name: "BankVault",
  props: {
    lockedAmount: {},
    currentTurn: {},
    depositCount: {},
    fundCount: {},
    claimableCount: {},
    writeDisabledReason: {}
  },
  emits: ["navigate", "settle"],
  setup(t) {
    return (o, a) => (s(), u("section", Ha, [
      e("header", Ka, [
        a[5] || (a[5] = e("h2", { id: "bank-vault-title" }, "持有本金", -1)),
        e("strong", null, [a[4] || (a[4] = e("small", null, "¤", -1)), O(" " + l(t.lockedAmount.toLocaleString("zh-CN")), 1)]),
        a[6] || (a[6] = e("p", null, "不含未结算收益", -1))
      ]),
      e("button", {
        type: "button",
        class: "bank-holding-link",
        onClick: a[0] || (a[0] = (n) => o.$emit("navigate", "positions"))
      }, [
        e("span", null, "存单 " + l(t.depositCount) + " 笔 · 理财 " + l(t.fundCount) + " 笔", 1),
        a[7] || (a[7] = e("strong", null, "查看持有", -1)),
        g(y, { kind: "next" })
      ]),
      t.claimableCount ? (s(), u("button", {
        key: 0,
        type: "button",
        class: "bank-claim-button",
        disabled: !!t.writeDisabledReason,
        onClick: a[1] || (a[1] = (n) => o.$emit("settle"))
      }, [
        g(y, { kind: "check" }),
        e("span", null, l(t.claimableCount) + " 笔已到期", 1),
        a[8] || (a[8] = e("strong", null, "全部领取", -1)),
        g(y, { kind: "next" })
      ], 8, ja)) : k("", !0),
      e("div", Qa, [e("button", {
        type: "button",
        class: "bank-portal",
        onClick: a[2] || (a[2] = (n) => o.$emit("navigate", "deposits"))
      }, [
        e("span", Xa, [g(y, { kind: "deposit" })]),
        a[9] || (a[9] = e("span", null, [e("strong", null, "定期存单"), e("small", null, "固定收益")], -1)),
        g(y, { kind: "next" })
      ]), e("button", {
        type: "button",
        class: "bank-portal is-fund",
        onClick: a[3] || (a[3] = (n) => o.$emit("navigate", "funds"))
      }, [
        e("span", Ja, [g(y, { kind: "fund" })]),
        a[10] || (a[10] = e("span", null, [e("strong", null, "浮动理财"), e("small", null, "收益浮动，可能损失本金")], -1)),
        g(y, { kind: "next" })
      ])]),
      e("details", Ya, [a[11] || (a[11] = e("summary", null, "计期与兑付", -1)), e("p", null, "当前第 " + l(t.currentTurn) + " 回合。每完成一条剧情回复推进一回合。到期资产可手动领取，也会随下一次银行交易一并结算至钱包。", 1)])
    ]));
  }
}), at = et, tt = { class: "bank-app" }, nt = { class: "bank-header" }, lt = {
  class: "bank-header-balance",
  "aria-label": "钱包可用余额"
}, st = ["disabled"], it = {
  key: 0,
  class: "bank-notice-area"
}, ut = ["disabled"], ot = ["disabled"], rt = ["disabled"], dt = { class: "bank-workspace" }, vt = {
  key: 0,
  class: "bank-empty-state",
  role: "status"
}, bt = {
  class: "bank-navigation",
  "aria-label": "银行主导航"
}, ct = [
  "aria-label",
  "aria-current",
  "onClick"
], kt = { key: 0 }, q = 35e3, mt = /* @__PURE__ */ N({
  __name: "BankApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(t) {
    const o = t, a = C(structuredClone(fe(o.initialState))), n = C("vault"), b = C(null), f = C(null), c = C(!1), p = C(!1), w = C(!1), h = C(""), M = C(""), z = C("");
    let L = null, U = () => {
    }, v = 0, d = 0, $ = a.value.activityPage.offset + a.value.activities.length;
    pe(() => f.value ? (X(), !0) : n.value !== "vault" ? (F("vault"), !0) : !1);
    const W = _(() => a.value.status === "unconfirmed"), B = _(() => p.value ? "正在处理上一项银行操作" : c.value ? "正在刷新银行记录" : a.value.status !== "ready" ? a.value.message || "暂时不能交易" : ""), Z = _(() => c.value || p.value || W.value), K = _(() => h.value || a.value.message || (a.value.status !== "loading" && !f.value ? B.value : ""));
    function G() {
      return `bank-ui:${ye()}`;
    }
    function E() {
      return { chatIdentity: a.value.chatIdentity };
    }
    function V(r) {
      d += 1, a.value = structuredClone(r), $ = r.activityPage.offset + r.activities.length, c.value = !1, w.value = !1, h.value = "", z.value = "", r.claimableCount === 0 && (L = null);
    }
    function I(r) {
      const i = r instanceof Error ? r.message : String(r);
      return i.includes("economy_insufficient_funds") || i.includes("cannot be overdrawn") ? "小白币不足，这次交易未完成。" : i.includes("bank_amount_out_of_range") ? "金额不在该产品允许范围内。" : i.includes("bank_amount_invalid") ? "金额必须是正整数。" : i.includes("bank_revision_conflict") || i.includes("bank_event_id_conflict") ? "银行记录已有变化，请关闭确认框，刷新后再试。" : i.includes("bank_position_missing") || i.includes("bank_position_state_changed") ? "这笔资产已有变化，请刷新银行记录。" : i.includes("bank_no_due_positions") ? "当前没有可领取的到期资产。" : i === "host_request_timeout" ? "暂时没收到保存结果，请保留当前页面并重试。" : "银行操作未完成，请稍后重试。";
    }
    async function j() {
      if (Z.value) return;
      const r = ++v;
      c.value = !0, h.value = "";
      try {
        const i = await o.bridge.request("bank/refresh", E(), q);
        r === v && V(i.result);
      } catch (i) {
        r === v && (h.value = I(i));
      } finally {
        r === v && (c.value = !1);
      }
    }
    async function se() {
      if (c.value || p.value) return;
      const r = ++v;
      c.value = !0, h.value = "";
      try {
        const i = await o.bridge.request("bank/confirm-save", E(), q);
        r === v && V(i.result.state);
      } catch (i) {
        r === v && (h.value = I(i));
      } finally {
        r === v && (c.value = !1);
      }
    }
    async function ie() {
      if (c.value || p.value) return;
      const r = ++v;
      c.value = !0, h.value = "";
      try {
        const i = await o.bridge.request("bank/retry-turns", E(), q);
        r === v && V(i.result);
      } catch (i) {
        r === v && (h.value = I(i));
      } finally {
        r === v && (c.value = !1);
      }
    }
    function F(r) {
      n.value = r, b.value?.scrollTo(0, 0);
    }
    function Q(r, i) {
      B.value || (M.value = "", f.value = {
        mode: i,
        product: r,
        actionId: G()
      });
    }
    function ue(r) {
      B.value || (M.value = "", f.value = {
        mode: "withdraw",
        position: r,
        actionId: G()
      });
    }
    function X() {
      p.value || (f.value = null, M.value = "");
    }
    async function oe(r) {
      const i = f.value;
      if (!i || B.value) return;
      const m = v;
      p.value = !0, M.value = "";
      const S = i.mode === "deposit-open" ? "bank/deposit/open" : i.mode === "fund-open" ? "bank/fund/open" : "bank/deposit/withdraw";
      try {
        const T = await o.bridge.request(S, {
          ...E(),
          expectedRevision: a.value.revision,
          expectedEventId: a.value.eventId,
          actionId: i.actionId,
          ...i.product ? {
            productId: i.product.id,
            amount: r
          } : {},
          ...i.position ? { positionId: i.position.id } : {}
        }, q);
        if (m !== v || f.value !== i) return;
        V(T.result), f.value = null, F("positions");
      } catch (T) {
        m === v && f.value === i && (M.value = I(T));
      } finally {
        m === v && (p.value = !1);
      }
    }
    async function J() {
      if (B.value || a.value.claimableCount === 0) return;
      const r = v;
      L ||= G();
      const i = L;
      p.value = !0, h.value = "";
      try {
        const m = await o.bridge.request("bank/settle-due", {
          ...E(),
          expectedRevision: a.value.revision,
          expectedEventId: a.value.eventId,
          actionId: i
        }, q);
        if (r !== v) return;
        L = null, V(m.result);
      } catch (m) {
        r === v && (h.value = I(m));
      } finally {
        r === v && (p.value = !1);
      }
    }
    async function re() {
      if (!a.value.activityPage.hasMore || w.value || p.value) return;
      const r = v, i = d, m = $;
      w.value = !0, z.value = "";
      try {
        const S = await o.bridge.request("bank/records/load-more", {
          ...E(),
          offset: m
        }, q);
        if (r !== v || i !== d) return;
        if (S.result.activityPage.offset !== m) throw new Error("bank_activity_page_changed");
        const T = new Set(a.value.activities.map(H));
        for (const Y of S.result.activities) {
          const ee = H(Y);
          T.has(ee) || (a.value.activities.push(Y), T.add(ee));
        }
        $ = S.result.activityPage.offset + S.result.activities.length, a.value.activityPage = S.result.activityPage;
      } catch (S) {
        r === v && i === d && (z.value = I(S));
      } finally {
        r === v && i === d && (w.value = !1);
      }
    }
    return ce(() => {
      U = o.bridge.subscribe((r) => {
        r.type === "bank/state" && (p.value || (v += 1), V(r.payload.state)), r.type === "bank/error" && (h.value = I(r.payload?.message || ""));
      });
    }), ve(() => {
      v += 1, U(), f.value = null, L = null;
    }), (r, i) => (s(), u("main", tt, [
      e("header", nt, [
        i[3] || (i[3] = e("h1", null, "银行", -1)),
        e("div", lt, [e("strong", null, "¤ " + l(a.value.status === "loading" ? "—" : a.value.balance.toLocaleString("zh-CN")), 1)]),
        e("button", {
          type: "button",
          class: "bank-icon-button",
          disabled: Z.value,
          "aria-label": "刷新银行",
          onClick: j
        }, [g(y, {
          kind: "refresh",
          class: P({ "is-spinning": c.value })
        }, null, 8, ["class"])], 8, st)
      ]),
      K.value ? (s(), u("div", it, [e("aside", {
        class: P(["bank-notice", { "is-error": !!h.value || a.value.status === "blocked" || a.value.status === "conflict" }]),
        role: "status"
      }, [e("p", null, l(K.value), 1), W.value ? (s(), u("button", {
        key: 0,
        type: "button",
        disabled: c.value || p.value,
        onClick: se
      }, l(c.value ? "正在检查…" : "检查保存"), 9, ut)) : a.value.unsavedTurns > 0 && a.value.status === "blocked" ? (s(), u("button", {
        key: 1,
        type: "button",
        disabled: c.value || p.value,
        onClick: ie
      }, l(c.value ? "正在保存…" : "重试计期"), 9, ot)) : !a.value.turnConfirmationAbandoned && (a.value.status === "blocked" || a.value.status === "conflict") ? (s(), u("button", {
        key: 2,
        type: "button",
        disabled: Z.value,
        onClick: j
      }, l(c.value ? "正在读取…" : "重新加载"), 9, rt)) : k("", !0)], 2)])) : k("", !0),
      e("div", dt, [e("div", {
        ref_key: "content",
        ref: b,
        class: "bank-scroll"
      }, [a.value.status === "loading" ? (s(), u("div", vt, [g(y, {
        kind: "refresh",
        class: "is-spinning"
      }), i[4] || (i[4] = e("h3", null, "正在读取资产…", -1))])) : n.value === "vault" ? (s(), R(at, {
        key: 1,
        "locked-amount": a.value.lockedAmount,
        "current-turn": a.value.currentTurn,
        "deposit-count": a.value.deposits.length,
        "fund-count": a.value.investments.length,
        "claimable-count": a.value.claimableCount,
        "write-disabled-reason": B.value,
        onNavigate: F,
        onSettle: J
      }, null, 8, [
        "locked-amount",
        "current-turn",
        "deposit-count",
        "fund-count",
        "claimable-count",
        "write-disabled-reason"
      ])) : n.value === "deposits" ? (s(), R(ta, {
        key: 2,
        products: a.value.products.deposits,
        balance: a.value.balance,
        "write-disabled-reason": B.value,
        onOpen: i[0] || (i[0] = (m) => Q(m, "deposit-open"))
      }, null, 8, [
        "products",
        "balance",
        "write-disabled-reason"
      ])) : n.value === "funds" ? (s(), R(ca, {
        key: 3,
        products: a.value.products.funds,
        balance: a.value.balance,
        "write-disabled-reason": B.value,
        onOpen: i[1] || (i[1] = (m) => Q(m, "fund-open"))
      }, null, 8, [
        "products",
        "balance",
        "write-disabled-reason"
      ])) : n.value === "positions" ? (s(), R(Pa, {
        key: 4,
        deposits: a.value.deposits,
        investments: a.value.investments,
        "claimable-count": a.value.claimableCount,
        "write-disabled-reason": B.value,
        onWithdraw: ue,
        onSettle: J,
        onBrowse: i[2] || (i[2] = (m) => F("deposits"))
      }, null, 8, [
        "deposits",
        "investments",
        "claimable-count",
        "write-disabled-reason"
      ])) : (s(), R(Ga, {
        key: 5,
        activities: a.value.activities,
        total: a.value.activityPage.total,
        "has-more": a.value.activityPage.hasMore,
        "loading-more": w.value,
        error: z.value,
        onLoadMore: re
      }, null, 8, [
        "activities",
        "total",
        "has-more",
        "loading-more",
        "error"
      ]))], 512), e("nav", bt, [(s(), u(A, null, D([
        {
          page: "vault",
          label: "总览",
          icon: "vault"
        },
        {
          page: "deposits",
          label: "存单",
          icon: "deposit"
        },
        {
          page: "funds",
          label: "理财",
          icon: "fund"
        },
        {
          page: "positions",
          label: "持有",
          icon: "positions"
        },
        {
          page: "records",
          label: "记录",
          icon: "records"
        }
      ], (m) => e("button", {
        key: m.page,
        type: "button",
        "aria-label": m.label,
        "aria-current": n.value === m.page ? "page" : void 0,
        onClick: (S) => F(m.page)
      }, [e("span", null, [g(y, { kind: m.icon }, null, 8, ["kind"]), m.page === "positions" && a.value.claimableCount ? (s(), u("i", kt)) : k("", !0)]), O(l(m.label), 1)], 8, ct)), 64))])]),
      f.value ? (s(), R(Ge, {
        key: 1,
        mode: f.value.mode,
        product: f.value.product,
        position: f.value.position,
        balance: a.value.balance,
        busy: p.value,
        error: M.value,
        "claimable-count": a.value.claimableCount,
        "disabled-reason": B.value,
        onCancel: X,
        onConfirm: oe
      }, null, 8, [
        "mode",
        "product",
        "position",
        "balance",
        "busy",
        "error",
        "claimable-count",
        "disabled-reason"
      ])) : k("", !0)
    ]));
  }
}), yt = mt;
export {
  yt as default
};
