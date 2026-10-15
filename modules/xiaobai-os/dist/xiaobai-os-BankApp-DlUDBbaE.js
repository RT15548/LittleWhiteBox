/* eslint-disable */
import { $ as de, D as N, E as g, P as ve, Q as be, R as ce, S as o, T as F, U as P, V as s, b as R, d as ke, ft as l, h as A, lt as ae, m as me, ot as fe, r as pe, rt as C, ut as D, v as _, x as k, y as e } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { t as ge } from "./xiaobai-os-AppDialog-B4VpOkFC.js";
var ye = class extends Error {
  code;
  constructor(n, u = "") {
    super(u ? `${n}:${u}` : n), this.name = "BankError", this.code = n;
  }
};
function x(n, u = "") {
  throw new ye(n, u);
}
var ne = 1e4;
function le(n, u = "amount") {
  return (typeof n != "number" || !Number.isSafeInteger(n) || n <= 0) && x("bank_amount_invalid", u), n;
}
function he(n, u = "payout") {
  return (typeof n != "number" || !Number.isSafeInteger(n) || n < 0) && x("bank_amount_invalid", u), n > 5e4 && x("bank_amount_overflow", u), n;
}
function te(n, u) {
  return (typeof n != "number" || !Number.isSafeInteger(n) || n <= 0) && x("bank_amount_invalid", u), n;
}
function $e(n, u, a) {
  const t = le(n), b = te(u, "numerator"), f = te(a, "denominator");
  return t > Math.floor(Number.MAX_SAFE_INTEGER / b) && x("bank_amount_overflow"), he(Math.floor(t * b / f));
}
function _e(n, u) {
  const a = le(n, "principal");
  (typeof u != "number" || !Number.isSafeInteger(u)) && x("bank_amount_invalid", "bps");
  const t = ne + u;
  return (!Number.isSafeInteger(t) || t < 0) && x("bank_amount_invalid", "bps"), t === 0 ? 0 : $e(a, t, ne);
}
var we = { class: "bank-dialog-subject" }, Ce = { key: 0 }, Be = { class: "bank-dialog-field" }, Se = { class: "bank-amount-input" }, Ae = ["disabled"], Me = {
  id: "bank-amount-help",
  class: "bank-amount-help"
}, Le = { class: "bank-quick-amounts" }, Ne = [
  "disabled",
  "aria-pressed",
  "onClick"
], Ie = {
  key: 1,
  class: "bank-inline-error",
  role: "status"
}, Re = {
  key: 2,
  class: "bank-dialog-summary"
}, De = { key: 0 }, Pe = { class: "bank-dialog-summary" }, xe = { class: "bank-withdraw-amount" }, ze = { class: "bank-dialog-summary" }, Ee = { class: "is-loss" }, Te = {
  key: 5,
  class: "bank-amount-help"
}, Ve = {
  key: 6,
  class: "bank-inline-error",
  role: "status"
}, qe = {
  key: 7,
  class: "bank-inline-error",
  role: "alert"
}, Ue = { class: "bank-dialog-actions" }, Fe = ["disabled"], Oe = ["disabled"], We = /* @__PURE__ */ N({
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
  setup(n, { emit: u }) {
    const a = n, t = u, b = C(a.product ? String(a.product.minAmount) : ""), f = _(() => a.mode === "deposit-open" ? "存入定期" : a.mode === "fund-open" ? "申购理财" : "提前支取"), c = _(() => /^\d+$/.test(b.value.trim()) ? Number(b.value) : 0), p = _(() => a.mode === "withdraw" ? "" : !a.product || !Number.isSafeInteger(c.value) || c.value <= 0 ? "请输入正整数金额" : c.value < a.product.minAmount || c.value > a.product.maxAmount ? `金额须在 ${a.product.minAmount.toLocaleString("zh-CN")} 至 ${a.product.maxAmount.toLocaleString("zh-CN")} 之间` : c.value > a.balance ? "可用余额不足" : ""), w = _(() => a.mode === "deposit-open" ? a.product : null), h = _(() => a.mode === "fund-open" ? a.product : null), M = _(() => w.value && !p.value ? _e(c.value, w.value.interestBps) : null), z = _(() => {
      const v = a.product;
      return v ? [.../* @__PURE__ */ new Set([
        v.minAmount,
        v.minAmount * 2,
        Math.min(v.maxAmount, a.balance)
      ])].filter((d) => d >= v.minAmount && d <= v.maxAmount && d <= a.balance).sort((d, $) => d - $) : [];
    }), L = _(() => !a.busy && !a.disabledReason && !p.value);
    function O() {
      L.value && (a.mode === "withdraw" ? t("confirm") : t("confirm", c.value));
    }
    return (v, d) => (s(), R(ge, {
      class: "bank-dialog",
      "aria-label": f.value,
      busy: n.busy,
      onClose: d[2] || (d[2] = ($) => t("cancel"))
    }, {
      default: be(() => [e("form", { onSubmit: me(O, ["prevent"]) }, [
        e("h2", null, l(f.value), 1),
        e("div", we, [e("strong", null, l(n.position?.name || n.product?.name), 1), n.product ? (s(), o("span", Ce, l(n.product.lockRounds) + " 回合", 1)) : k("", !0)]),
        n.mode !== "withdraw" ? (s(), o(A, { key: 0 }, [
          e("label", Be, [e("span", null, l(n.mode === "deposit-open" ? "存入金额" : "申购金额"), 1), e("span", Se, [d[3] || (d[3] = e("i", null, "¤", -1)), de(e("input", {
            "onUpdate:modelValue": d[0] || (d[0] = ($) => b.value = $),
            disabled: n.busy,
            type: "text",
            inputmode: "numeric",
            autocomplete: "off",
            "aria-describedby": "bank-amount-help"
          }, null, 8, Ae), [[ke, b.value]])])]),
          e("small", Me, "钱包可用 ¤ " + l(n.balance.toLocaleString("zh-CN")) + " · " + l(n.product?.amountLabel), 1),
          e("div", Le, [(s(!0), o(A, null, P(z.value, ($) => (s(), o("button", {
            key: $,
            type: "button",
            disabled: n.busy,
            "aria-pressed": c.value === $,
            onClick: (W) => b.value = String($)
          }, "¤ " + l($.toLocaleString("zh-CN")), 9, Ne))), 128))])
        ], 64)) : k("", !0),
        p.value ? (s(), o("p", Ie, l(p.value), 1)) : k("", !0),
        w.value ? (s(), o("dl", Re, [
          e("div", null, [d[4] || (d[4] = e("dt", null, "整期收益率", -1)), e("dd", null, l(w.value.interestLabel), 1)]),
          M.value !== null ? (s(), o("div", De, [d[5] || (d[5] = e("dt", null, "到期到账（含本金）", -1)), e("dd", null, "¤ " + l(M.value.toLocaleString("zh-CN")), 1)])) : k("", !0),
          e("div", null, [d[6] || (d[6] = e("dt", null, "提前支取", -1)), e("dd", null, "本金 " + l(w.value.earlyPenaltyLabel) + "，无利息", 1)])
        ])) : k("", !0),
        h.value ? (s(), o(A, { key: 3 }, [e("dl", Pe, [e("div", null, [d[7] || (d[7] = e("dt", null, "整期收益区间", -1)), e("dd", null, l(h.value.returnLabel), 1)]), e("div", null, [d[8] || (d[8] = e("dt", null, "风险等级", -1)), e("dd", null, l(h.value.riskLabel), 1)])]), d[9] || (d[9] = e("p", { class: "bank-dialog-warning" }, "可能损失本金。申购后不能提前退出，实际收益到期后揭晓。", -1))], 64)) : k("", !0),
        n.mode === "withdraw" && n.position ? (s(), o(A, { key: 4 }, [
          e("div", xe, [d[10] || (d[10] = e("span", null, "现在实际到账", -1)), e("strong", null, "¤ " + l(n.position.earlyWithdrawalAmount.toLocaleString("zh-CN")), 1)]),
          e("dl", ze, [e("div", null, [d[11] || (d[11] = e("dt", null, "原存入本金", -1)), e("dd", null, "¤ " + l(n.position.principal.toLocaleString("zh-CN")), 1)]), e("div", null, [d[12] || (d[12] = e("dt", null, "提前支取损失", -1)), e("dd", Ee, "¤ " + l((n.position.principal - n.position.earlyWithdrawalAmount).toLocaleString("zh-CN")), 1)])]),
          d[13] || (d[13] = e("p", { class: "bank-dialog-warning" }, "不再获得到期利息，确认后不可撤销。", -1))
        ], 64)) : k("", !0),
        n.claimableCount ? (s(), o("p", Te, "另有 " + l(n.claimableCount) + " 笔到期资产，将随本次操作一并兑付至钱包。", 1)) : k("", !0),
        n.disabledReason && !n.busy ? (s(), o("p", Ve, l(n.disabledReason), 1)) : k("", !0),
        n.error ? (s(), o("p", qe, l(n.error), 1)) : k("", !0),
        e("footer", Ue, [e("button", {
          type: "button",
          class: "bank-secondary-button",
          disabled: n.busy,
          autofocus: "",
          onClick: d[1] || (d[1] = ($) => t("cancel"))
        }, "返回", 8, Fe), e("button", {
          type: "submit",
          class: "bank-primary-button",
          disabled: !L.value
        }, l(n.busy ? "正在保存…" : n.mode === "withdraw" ? "确认支取" : n.mode === "fund-open" ? "确认申购" : "确认存入"), 9, Oe)])
      ], 32)]),
      _: 1
    }, 8, ["aria-label", "busy"]));
  }
}), Ze = We, Ge = {
  class: "bank-page",
  "aria-labelledby": "bank-deposits-title"
}, He = { class: "bank-product-grid" }, Ke = { class: "bank-term-pill" }, je = { class: "bank-product-offer" }, Qe = { class: "bank-deposit-rate" }, Xe = [
  "aria-label",
  "disabled",
  "onClick"
], Je = { class: "bank-product-terms" }, Ye = {
  key: 0,
  class: "bank-product-hint"
}, ea = /* @__PURE__ */ N({
  __name: "BankDeposits",
  props: {
    products: {},
    balance: {},
    writeDisabledReason: {}
  },
  emits: ["open"],
  setup(n) {
    return (u, a) => (s(), o("section", Ge, [
      a[3] || (a[3] = e("header", { class: "bank-page-heading" }, [e("h2", { id: "bank-deposits-title" }, "定期存单")], -1)),
      e("div", He, [(s(!0), o(A, null, P(n.products, (t) => (s(), o("article", {
        key: t.id,
        class: "bank-product-card bank-deposit-card"
      }, [
        e("header", null, [e("h3", null, l(t.name), 1), e("span", Ke, l(t.lockRounds) + " 回合", 1)]),
        e("div", je, [e("div", Qe, [e("strong", null, l(t.interestLabel), 1), a[0] || (a[0] = e("span", null, "整期收益率 · 非年化", -1))]), e("button", {
          type: "button",
          class: "bank-primary-button",
          "aria-label": `存入${t.name}`,
          disabled: !!n.writeDisabledReason || n.balance < t.minAmount,
          onClick: (b) => u.$emit("open", t)
        }, "存入", 8, Xe)]),
        e("dl", Je, [e("div", null, [a[1] || (a[1] = e("dt", null, "存入范围", -1)), e("dd", null, l(t.amountLabel), 1)]), e("div", null, [a[2] || (a[2] = e("dt", null, "提前支取", -1)), e("dd", null, "本金 " + l(t.earlyPenaltyLabel) + "，无利息", 1)])]),
        n.balance < t.minAmount ? (s(), o("p", Ye, "钱包余额不足最低存入金额")) : k("", !0)
      ]))), 128))]),
      a[4] || (a[4] = e("p", { class: "bank-footnote" }, "每完成一条剧情回复，推进一回合。", -1))
    ]));
  }
}), aa = ea, na = {
  class: "bank-page",
  "aria-labelledby": "bank-funds-title"
}, ta = { class: "bank-product-grid" }, la = ["data-risk"], sa = { class: "bank-fund-description" }, ia = { class: "bank-product-offer" }, oa = { class: "bank-return-range" }, ua = [
  "aria-label",
  "disabled",
  "onClick"
], ra = { class: "bank-product-terms" }, da = {
  key: 0,
  class: "bank-product-hint"
}, va = /* @__PURE__ */ N({
  __name: "BankFunds",
  props: {
    products: {},
    balance: {},
    writeDisabledReason: {}
  },
  emits: ["open"],
  setup(n) {
    return (u, a) => (s(), o("section", na, [
      a[3] || (a[3] = e("header", { class: "bank-page-heading" }, [e("h2", { id: "bank-funds-title" }, "浮动理财"), e("p", null, "可能损失本金，到期前不可退出。")], -1)),
      e("div", ta, [(s(!0), o(A, null, P(n.products, (t) => (s(), o("article", {
        key: t.id,
        class: "bank-product-card bank-fund-card",
        "data-risk": t.riskLevel
      }, [
        e("header", null, [e("h3", null, l(t.name), 1), e("span", { class: D(["bank-risk-badge", `is-${t.riskLevel}`]) }, l(t.riskLabel), 3)]),
        e("p", sa, l(t.description), 1),
        e("div", ia, [e("div", oa, [e("strong", null, l(t.returnLabel), 1), a[0] || (a[0] = e("span", null, "整期收益区间 · 非年化", -1))]), e("button", {
          type: "button",
          class: "bank-primary-button",
          "aria-label": `申购${t.name}`,
          disabled: !!n.writeDisabledReason || n.balance < t.minAmount,
          onClick: (b) => u.$emit("open", t)
        }, "申购", 8, ua)]),
        e("dl", ra, [e("div", null, [a[1] || (a[1] = e("dt", null, "申购范围", -1)), e("dd", null, l(t.amountLabel), 1)]), e("div", null, [a[2] || (a[2] = e("dt", null, "锁定期限", -1)), e("dd", null, l(t.lockRounds) + " 回合", 1)])]),
        n.balance < t.minAmount ? (s(), o("p", da, "钱包余额不足最低申购金额")) : k("", !0)
      ], 8, la))), 128))]),
      a[4] || (a[4] = e("p", { class: "bank-footnote" }, "以上为合同区间，实际收益到期揭晓。", -1))
    ]));
  }
}), ba = va, ca = {
  class: "bank-product-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.7",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
  focusable: "false"
}, ka = ["d"], ma = {
  key: 0,
  cx: "12",
  cy: "12",
  r: "6"
}, fa = /* @__PURE__ */ N({
  __name: "BankProductIcon",
  props: { kind: {} },
  setup(n) {
    const u = {
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
    return (a, t) => (s(), o("svg", ca, [e("path", { d: u[n.kind] }, null, 8, ka), n.kind === "vault" ? (s(), o("circle", ma)) : k("", !0)]));
  }
}), y = fa, pa = {
  class: "bank-page",
  "aria-labelledby": "bank-positions-title"
}, ga = ["disabled"], ya = {
  key: 1,
  class: "bank-empty-state"
}, ha = {
  key: 2,
  class: "bank-position-group"
}, $a = { class: "bank-section-heading" }, _a = { class: "bank-product-mark" }, wa = { class: "bank-position-amounts" }, Ca = { key: 0 }, Ba = ["disabled", "onClick"], Sa = {
  key: 3,
  class: "bank-position-group"
}, Aa = { class: "bank-section-heading" }, Ma = { class: "bank-product-mark" }, La = { class: "bank-fund-principal" }, Na = {
  key: 1,
  class: "bank-sealed-copy"
}, Ia = /* @__PURE__ */ N({
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
  setup(n) {
    return (u, a) => (s(), o("section", pa, [
      a[10] || (a[10] = e("header", { class: "bank-page-heading" }, [e("h2", { id: "bank-positions-title" }, "我的持有")], -1)),
      n.claimableCount ? (s(), o("button", {
        key: 0,
        type: "button",
        class: "bank-claim-button",
        disabled: !!n.writeDisabledReason,
        onClick: a[0] || (a[0] = (t) => u.$emit("settle"))
      }, [
        g(y, { kind: "check" }),
        e("span", null, l(n.claimableCount) + " 笔已到期", 1),
        a[2] || (a[2] = e("strong", null, "全部领取", -1)),
        g(y, { kind: "next" })
      ], 8, ga)) : k("", !0),
      !n.deposits.length && !n.investments.length ? (s(), o("div", ya, [
        g(y, { kind: "positions" }),
        a[3] || (a[3] = e("h3", null, "暂无持有", -1)),
        e("button", {
          type: "button",
          class: "bank-secondary-button",
          onClick: a[1] || (a[1] = (t) => u.$emit("browse"))
        }, "查看存单")
      ])) : k("", !0),
      n.deposits.length ? (s(), o("div", ha, [e("header", $a, [e("h3", null, [a[4] || (a[4] = F("定期存单 ", -1)), e("small", null, l(n.deposits.length), 1)])]), (s(!0), o(A, null, P(n.deposits, (t) => (s(), o("article", {
        key: t.id,
        class: "bank-position-card"
      }, [
        e("header", null, [
          e("span", _a, [g(y, { kind: "deposit" })]),
          e("h4", null, l(t.name), 1),
          e("span", { class: D(["bank-position-status", { "is-due": t.claimable }]) }, l(t.statusLabel), 3)
        ]),
        e("dl", wa, [e("div", null, [a[5] || (a[5] = e("dt", null, "存入本金", -1)), e("dd", null, "¤ " + l(t.principal.toLocaleString("zh-CN")), 1)]), e("div", null, [a[6] || (a[6] = e("dt", null, "到期到账", -1)), e("dd", null, "¤ " + l(t.maturityAmount.toLocaleString("zh-CN")), 1)])]),
        t.claimable ? k("", !0) : (s(), o("footer", Ca, [e("span", null, "现在支取到账 ¤ " + l(t.earlyWithdrawalAmount.toLocaleString("zh-CN")), 1), e("button", {
          type: "button",
          class: "bank-text-button is-loss",
          disabled: !!n.writeDisabledReason,
          onClick: (b) => u.$emit("withdraw", t)
        }, "提前支取", 8, Ba)]))
      ]))), 128))])) : k("", !0),
      n.investments.length ? (s(), o("div", Sa, [e("header", Aa, [e("h3", null, [a[7] || (a[7] = F("浮动理财 ", -1)), e("small", null, l(n.investments.length), 1)])]), (s(!0), o(A, null, P(n.investments, (t) => (s(), o("article", {
        key: t.id,
        class: "bank-position-card"
      }, [
        e("header", null, [
          e("span", Ma, [g(y, { kind: "fund" })]),
          e("h4", null, l(t.name), 1),
          e("span", { class: D(["bank-position-status", { "is-due": t.claimable }]) }, l(t.statusLabel), 3)
        ]),
        e("div", La, [e("span", null, l(t.riskLabel) + " · 申购本金", 1), e("strong", null, "¤ " + l(t.principal.toLocaleString("zh-CN")), 1)]),
        t.claimable ? (s(), o("div", {
          key: 0,
          class: D(["bank-fund-result", { "is-negative": t.resolvedReturnBps < 0 }])
        }, [
          a[8] || (a[8] = e("span", null, "到期结果已揭晓", -1)),
          e("strong", null, l(t.returnLabel), 1),
          e("small", null, "可领取 ¤ " + l(t.settlementAmount.toLocaleString("zh-CN")), 1)
        ], 2)) : (s(), o("div", Na, [g(y, { kind: "lock" }), a[9] || (a[9] = e("p", null, "收益到期揭晓，锁定期间不可退出。", -1))]))
      ]))), 128))])) : k("", !0)
    ]));
  }
}), Ra = Ia;
function H(n) {
  return JSON.stringify([
    n.sourceStoryId ? "legacy" : "current",
    n.sourceStoryId ?? null,
    n.id
  ]);
}
var Da = {
  class: "bank-page",
  "aria-labelledby": "bank-records-title"
}, Pa = { class: "bank-page-heading" }, xa = { id: "bank-records-title" }, za = {
  key: 0,
  class: "bank-empty-state"
}, Ea = {
  key: 1,
  class: "bank-record-list"
}, Ta = { class: "bank-product-mark" }, Va = { class: "bank-record-main" }, qa = { class: "bank-record-detail" }, Ua = { key: 0 }, Fa = {
  key: 2,
  class: "bank-inline-error",
  role: "alert"
}, Oa = ["disabled"], Wa = /* @__PURE__ */ N({
  __name: "BankRecords",
  props: {
    activities: {},
    total: {},
    hasMore: { type: Boolean },
    loadingMore: { type: Boolean },
    error: {}
  },
  emits: ["loadMore"],
  setup(n) {
    const u = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: !1
    });
    return (a, t) => (s(), o("section", Da, [
      e("header", Pa, [e("h2", xa, [t[1] || (t[1] = F("兑付记录 ", -1)), e("small", null, l(n.total) + " 笔", 1)])]),
      n.activities.length ? (s(), o("div", Ea, [(s(!0), o(A, null, P(n.activities, (b) => (s(), o("details", {
        key: ae(H)(b),
        class: "bank-record-row"
      }, [e("summary", null, [
        e("span", Ta, [g(y, { kind: b.kind }, null, 8, ["kind"])]),
        e("span", Va, [e("strong", null, l(b.productName), 1), e("small", null, l(b.resultLabel), 1)]),
        e("span", { class: D(["bank-record-net", {
          "is-negative": b.net < 0,
          "is-flat": b.net === 0
        }]) }, [e("strong", null, l(b.net > 0 ? "+" : "") + l(b.net.toLocaleString("zh-CN")), 1), e("small", null, l(b.net < 0 ? "净损失" : b.net > 0 ? "净收益" : "持平"), 1)], 2),
        g(y, { kind: "next" })
      ]), e("dl", qa, [
        e("div", null, [t[3] || (t[3] = e("dt", null, "投入本金", -1)), e("dd", null, "¤ " + l(b.amountIn.toLocaleString("zh-CN")), 1)]),
        e("div", null, [t[4] || (t[4] = e("dt", null, "实际到账", -1)), e("dd", null, "¤ " + l(b.payout.toLocaleString("zh-CN")), 1)]),
        e("div", null, [t[5] || (t[5] = e("dt", null, "结算回合", -1)), e("dd", null, l(b.turnLabel), 1)]),
        e("div", null, [t[6] || (t[6] = e("dt", null, "发生时间", -1)), e("dd", null, l(ae(u).format(b.createdAt)), 1)]),
        b.sourceStoryId ? (s(), o("div", Ua, [t[7] || (t[7] = e("dt", null, "原聊天", -1)), e("dd", null, l(b.sourceStoryId), 1)])) : k("", !0)
      ])]))), 128))])) : (s(), o("div", za, [g(y, { kind: "records" }), t[2] || (t[2] = e("h3", null, "暂无兑付记录", -1))])),
      n.error ? (s(), o("p", Fa, l(n.error), 1)) : k("", !0),
      n.hasMore ? (s(), o("button", {
        key: 3,
        type: "button",
        class: "bank-secondary-button bank-full-button bank-load-more",
        disabled: n.loadingMore,
        onClick: t[0] || (t[0] = (b) => a.$emit("loadMore"))
      }, l(n.loadingMore ? "正在读取…" : "查看更早的记录"), 9, Oa)) : k("", !0)
    ]));
  }
}), Za = Wa, Ga = {
  class: "bank-vault bank-page",
  "aria-labelledby": "bank-vault-title"
}, Ha = { class: "bank-assets" }, Ka = ["disabled"], ja = { class: "bank-vault-portals" }, Qa = { class: "bank-portal-mark" }, Xa = { class: "bank-portal-mark" }, Ja = { class: "bank-timing" }, Ya = /* @__PURE__ */ N({
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
  setup(n) {
    return (u, a) => (s(), o("section", Ga, [
      e("header", Ha, [
        a[5] || (a[5] = e("h2", { id: "bank-vault-title" }, "持有本金", -1)),
        e("strong", null, [a[4] || (a[4] = e("small", null, "¤", -1)), F(" " + l(n.lockedAmount.toLocaleString("zh-CN")), 1)]),
        a[6] || (a[6] = e("p", null, "不含未结算收益", -1))
      ]),
      e("button", {
        type: "button",
        class: "bank-holding-link",
        onClick: a[0] || (a[0] = (t) => u.$emit("navigate", "positions"))
      }, [
        e("span", null, "存单 " + l(n.depositCount) + " 笔 · 理财 " + l(n.fundCount) + " 笔", 1),
        a[7] || (a[7] = e("strong", null, "查看持有", -1)),
        g(y, { kind: "next" })
      ]),
      n.claimableCount ? (s(), o("button", {
        key: 0,
        type: "button",
        class: "bank-claim-button",
        disabled: !!n.writeDisabledReason,
        onClick: a[1] || (a[1] = (t) => u.$emit("settle"))
      }, [
        g(y, { kind: "check" }),
        e("span", null, l(n.claimableCount) + " 笔已到期", 1),
        a[8] || (a[8] = e("strong", null, "全部领取", -1)),
        g(y, { kind: "next" })
      ], 8, Ka)) : k("", !0),
      e("div", ja, [e("button", {
        type: "button",
        class: "bank-portal",
        onClick: a[2] || (a[2] = (t) => u.$emit("navigate", "deposits"))
      }, [
        e("span", Qa, [g(y, { kind: "deposit" })]),
        a[9] || (a[9] = e("span", null, [e("strong", null, "定期存单"), e("small", null, "固定收益")], -1)),
        g(y, { kind: "next" })
      ]), e("button", {
        type: "button",
        class: "bank-portal is-fund",
        onClick: a[3] || (a[3] = (t) => u.$emit("navigate", "funds"))
      }, [
        e("span", Xa, [g(y, { kind: "fund" })]),
        a[10] || (a[10] = e("span", null, [e("strong", null, "浮动理财"), e("small", null, "收益浮动，可能损失本金")], -1)),
        g(y, { kind: "next" })
      ])]),
      e("details", Ja, [a[11] || (a[11] = e("summary", null, "计期与兑付", -1)), e("p", null, "当前第 " + l(n.currentTurn) + " 回合。每完成一条剧情回复推进一回合。到期资产可手动领取，也会随下一次银行交易一并结算至钱包。", 1)])
    ]));
  }
}), en = Ya, an = { class: "bank-app" }, nn = { class: "bank-header" }, tn = {
  class: "bank-header-balance",
  "aria-label": "钱包可用余额"
}, ln = ["disabled"], sn = {
  key: 0,
  class: "bank-notice-area"
}, on = ["disabled"], un = ["disabled"], rn = ["disabled"], dn = { class: "bank-workspace" }, vn = {
  key: 0,
  class: "bank-empty-state",
  role: "status"
}, bn = {
  class: "bank-navigation",
  "aria-label": "银行主导航"
}, cn = [
  "aria-label",
  "aria-current",
  "onClick"
], kn = { key: 0 }, q = 35e3, mn = /* @__PURE__ */ N({
  __name: "BankApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(n) {
    const u = n, a = C(structuredClone(fe(u.initialState))), t = C("vault"), b = C(null), f = C(null), c = C(!1), p = C(!1), w = C(!1), h = C(""), M = C(""), z = C("");
    let L = null, O = () => {
    }, v = 0, d = 0, $ = a.value.activityPage.offset + a.value.activities.length;
    pe(() => f.value ? (X(), !0) : t.value !== "vault" ? (U("vault"), !0) : !1);
    const W = _(() => a.value.status === "unconfirmed"), B = _(() => p.value ? "正在处理上一项银行操作" : c.value ? "正在刷新银行记录" : a.value.status !== "ready" ? a.value.message || "暂时不能交易" : ""), Z = _(() => c.value || p.value || W.value), K = _(() => h.value || a.value.message || (a.value.status !== "loading" && !f.value ? B.value : ""));
    function G() {
      return typeof globalThis.crypto?.randomUUID == "function" ? `bank-ui:${globalThis.crypto.randomUUID()}` : `bank-ui:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
    }
    function E() {
      return { chatIdentity: a.value.chatIdentity };
    }
    function T(r) {
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
        const i = await u.bridge.request("bank/refresh", E(), q);
        r === v && T(i.result);
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
        const i = await u.bridge.request("bank/confirm-save", E(), q);
        r === v && T(i.result.state);
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
        const i = await u.bridge.request("bank/retry-turns", E(), q);
        r === v && T(i.result);
      } catch (i) {
        r === v && (h.value = I(i));
      } finally {
        r === v && (c.value = !1);
      }
    }
    function U(r) {
      t.value = r, b.value?.scrollTo(0, 0);
    }
    function Q(r, i) {
      B.value || (M.value = "", f.value = {
        mode: i,
        product: r,
        actionId: G()
      });
    }
    function oe(r) {
      B.value || (M.value = "", f.value = {
        mode: "withdraw",
        position: r,
        actionId: G()
      });
    }
    function X() {
      p.value || (f.value = null, M.value = "");
    }
    async function ue(r) {
      const i = f.value;
      if (!i || B.value) return;
      const m = v;
      p.value = !0, M.value = "";
      const S = i.mode === "deposit-open" ? "bank/deposit/open" : i.mode === "fund-open" ? "bank/fund/open" : "bank/deposit/withdraw";
      try {
        const V = await u.bridge.request(S, {
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
        T(V.result), f.value = null, U("positions");
      } catch (V) {
        m === v && f.value === i && (M.value = I(V));
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
        const m = await u.bridge.request("bank/settle-due", {
          ...E(),
          expectedRevision: a.value.revision,
          expectedEventId: a.value.eventId,
          actionId: i
        }, q);
        if (r !== v) return;
        L = null, T(m.result);
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
        const S = await u.bridge.request("bank/records/load-more", {
          ...E(),
          offset: m
        }, q);
        if (r !== v || i !== d) return;
        if (S.result.activityPage.offset !== m) throw new Error("bank_activity_page_changed");
        const V = new Set(a.value.activities.map(H));
        for (const Y of S.result.activities) {
          const ee = H(Y);
          V.has(ee) || (a.value.activities.push(Y), V.add(ee));
        }
        $ = S.result.activityPage.offset + S.result.activities.length, a.value.activityPage = S.result.activityPage;
      } catch (S) {
        r === v && i === d && (z.value = I(S));
      } finally {
        r === v && i === d && (w.value = !1);
      }
    }
    return ce(() => {
      O = u.bridge.subscribe((r) => {
        r.type === "bank/state" && (p.value || (v += 1), T(r.payload.state)), r.type === "bank/error" && (h.value = I(r.payload?.message || ""));
      });
    }), ve(() => {
      v += 1, O(), f.value = null, L = null;
    }), (r, i) => (s(), o("main", an, [
      e("header", nn, [
        i[3] || (i[3] = e("h1", null, "银行", -1)),
        e("div", tn, [e("strong", null, "¤ " + l(a.value.status === "loading" ? "—" : a.value.balance.toLocaleString("zh-CN")), 1)]),
        e("button", {
          type: "button",
          class: "bank-icon-button",
          disabled: Z.value,
          "aria-label": "刷新银行",
          onClick: j
        }, [g(y, {
          kind: "refresh",
          class: D({ "is-spinning": c.value })
        }, null, 8, ["class"])], 8, ln)
      ]),
      K.value ? (s(), o("div", sn, [e("aside", {
        class: D(["bank-notice", { "is-error": !!h.value || a.value.status === "blocked" || a.value.status === "conflict" }]),
        role: "status"
      }, [e("p", null, l(K.value), 1), W.value ? (s(), o("button", {
        key: 0,
        type: "button",
        disabled: c.value || p.value,
        onClick: se
      }, l(c.value ? "正在检查…" : "检查保存"), 9, on)) : a.value.unsavedTurns > 0 && a.value.status === "blocked" ? (s(), o("button", {
        key: 1,
        type: "button",
        disabled: c.value || p.value,
        onClick: ie
      }, l(c.value ? "正在保存…" : "重试计期"), 9, un)) : !a.value.turnConfirmationAbandoned && (a.value.status === "blocked" || a.value.status === "conflict") ? (s(), o("button", {
        key: 2,
        type: "button",
        disabled: Z.value,
        onClick: j
      }, l(c.value ? "正在读取…" : "重新加载"), 9, rn)) : k("", !0)], 2)])) : k("", !0),
      e("div", dn, [e("div", {
        ref_key: "content",
        ref: b,
        class: "bank-scroll"
      }, [a.value.status === "loading" ? (s(), o("div", vn, [g(y, {
        kind: "refresh",
        class: "is-spinning"
      }), i[4] || (i[4] = e("h3", null, "正在读取资产…", -1))])) : t.value === "vault" ? (s(), R(en, {
        key: 1,
        "locked-amount": a.value.lockedAmount,
        "current-turn": a.value.currentTurn,
        "deposit-count": a.value.deposits.length,
        "fund-count": a.value.investments.length,
        "claimable-count": a.value.claimableCount,
        "write-disabled-reason": B.value,
        onNavigate: U,
        onSettle: J
      }, null, 8, [
        "locked-amount",
        "current-turn",
        "deposit-count",
        "fund-count",
        "claimable-count",
        "write-disabled-reason"
      ])) : t.value === "deposits" ? (s(), R(aa, {
        key: 2,
        products: a.value.products.deposits,
        balance: a.value.balance,
        "write-disabled-reason": B.value,
        onOpen: i[0] || (i[0] = (m) => Q(m, "deposit-open"))
      }, null, 8, [
        "products",
        "balance",
        "write-disabled-reason"
      ])) : t.value === "funds" ? (s(), R(ba, {
        key: 3,
        products: a.value.products.funds,
        balance: a.value.balance,
        "write-disabled-reason": B.value,
        onOpen: i[1] || (i[1] = (m) => Q(m, "fund-open"))
      }, null, 8, [
        "products",
        "balance",
        "write-disabled-reason"
      ])) : t.value === "positions" ? (s(), R(Ra, {
        key: 4,
        deposits: a.value.deposits,
        investments: a.value.investments,
        "claimable-count": a.value.claimableCount,
        "write-disabled-reason": B.value,
        onWithdraw: oe,
        onSettle: J,
        onBrowse: i[2] || (i[2] = (m) => U("deposits"))
      }, null, 8, [
        "deposits",
        "investments",
        "claimable-count",
        "write-disabled-reason"
      ])) : (s(), R(Za, {
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
      ]))], 512), e("nav", bn, [(s(), o(A, null, P([
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
        "aria-current": t.value === m.page ? "page" : void 0,
        onClick: (S) => U(m.page)
      }, [e("span", null, [g(y, { kind: m.icon }, null, 8, ["kind"]), m.page === "positions" && a.value.claimableCount ? (s(), o("i", kn)) : k("", !0)]), F(l(m.label), 1)], 8, cn)), 64))])]),
      f.value ? (s(), R(Ze, {
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
        onConfirm: ue
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
}), gn = mn;
export {
  gn as default
};
