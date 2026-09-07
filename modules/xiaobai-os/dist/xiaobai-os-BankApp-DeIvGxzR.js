/* eslint-disable */
import { D as te, G as le, H as C, J as l, K as I, R as se, T as ie, W as oe, b as M, f as w, g as i, h as c, j as R, k as s, l as ue, m as N, o as re, p as e, u as B, v as q, y as g, z as de } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { n as ve } from "./xiaobai-os-app-navigation-D5qZ5Ulq.js";
import { t as be } from "./xiaobai-os-AppDialog-ycKLGrLE.js";
var ke = class extends Error {
  code;
  constructor(a, u = "") {
    super(u ? `${a}:${u}` : a), this.name = "BankError", this.code = a;
  }
};
function D(a, u = "") {
  throw new ke(a, u);
}
var X = 1e4;
function Q(a, u = "amount") {
  return (typeof a != "number" || !Number.isSafeInteger(a) || a <= 0) && D("bank_amount_invalid", u), a;
}
function ce(a, u = "payout") {
  return (typeof a != "number" || !Number.isSafeInteger(a) || a < 0) && D("bank_amount_invalid", u), a > 5e4 && D("bank_amount_overflow", u), a;
}
function J(a, u) {
  return (typeof a != "number" || !Number.isSafeInteger(a) || a <= 0) && D("bank_amount_invalid", u), a;
}
function me(a, u, n) {
  const t = Q(a), v = J(u, "numerator"), f = J(n, "denominator");
  return t > Math.floor(Number.MAX_SAFE_INTEGER / v) && D("bank_amount_overflow"), ce(Math.floor(t * v / f));
}
function pe(a, u) {
  const n = Q(a, "principal");
  (typeof u != "number" || !Number.isSafeInteger(u)) && D("bank_amount_invalid", "bps");
  const t = X + u;
  return (!Number.isSafeInteger(t) || t < 0) && D("bank_amount_invalid", "bps"), t === 0 ? 0 : me(n, t, X);
}
var fe = { class: "bank-dialog-subject" }, ge = { key: 0 }, ye = { class: "bank-dialog-field" }, he = { class: "bank-amount-input" }, $e = ["disabled"], we = {
  id: "bank-amount-help",
  class: "bank-amount-help"
}, _e = { class: "bank-quick-amounts" }, Ce = [
  "disabled",
  "aria-pressed",
  "onClick"
], Be = {
  key: 1,
  class: "bank-inline-error",
  role: "status"
}, Ae = {
  key: 2,
  class: "bank-dialog-summary"
}, Se = { key: 0 }, Me = { class: "bank-dialog-summary" }, Le = { class: "bank-withdraw-amount" }, Ne = { class: "bank-dialog-summary" }, Ie = { class: "is-loss" }, Re = {
  key: 5,
  class: "bank-amount-help"
}, De = {
  key: 6,
  class: "bank-inline-error",
  role: "status"
}, xe = {
  key: 7,
  class: "bank-inline-error",
  role: "alert"
}, ze = { class: "bank-dialog-actions" }, Pe = ["disabled"], Ee = ["disabled"], Te = /* @__PURE__ */ M({
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
  setup(a, { emit: u }) {
    const n = a, t = u, v = C(n.product ? String(n.product.minAmount) : ""), f = w(() => n.mode === "deposit-open" ? "存入定期" : n.mode === "fund-open" ? "申购理财" : "提前支取"), m = w(() => /^\d+$/.test(v.value.trim()) ? Number(v.value) : 0), h = w(() => n.mode === "withdraw" ? "" : !n.product || !Number.isSafeInteger(m.value) || m.value <= 0 ? "请输入正整数金额" : m.value < n.product.minAmount || m.value > n.product.maxAmount ? `金额须在 ${n.product.minAmount.toLocaleString("zh-CN")} 至 ${n.product.maxAmount.toLocaleString("zh-CN")} 之间` : m.value > n.balance ? "可用余额不足" : ""), _ = w(() => n.mode === "deposit-open" ? n.product : null), $ = w(() => n.mode === "fund-open" ? n.product : null), A = w(() => _.value && !h.value ? pe(m.value, _.value.interestBps) : null), x = w(() => {
      const b = n.product;
      return b ? [.../* @__PURE__ */ new Set([
        b.minAmount,
        b.minAmount * 2,
        Math.min(b.maxAmount, n.balance)
      ])].filter((r) => r >= b.minAmount && r <= b.maxAmount && r <= n.balance).sort((r, p) => r - p) : [];
    }), S = w(() => !n.busy && !n.disabledReason && !h.value);
    function U() {
      S.value && (n.mode === "withdraw" ? t("confirm") : t("confirm", m.value));
    }
    return (b, r) => (s(), N(be, {
      class: "bank-dialog",
      "aria-label": f.value,
      busy: a.busy,
      onClose: r[2] || (r[2] = (p) => t("cancel"))
    }, {
      default: se(() => [e("form", { onSubmit: ue(U, ["prevent"]) }, [
        e("h2", null, l(f.value), 1),
        e("div", fe, [e("strong", null, l(a.position?.name || a.product?.name), 1), a.product ? (s(), i("span", ge, l(a.product.lockRounds) + " 回合", 1)) : c("", !0)]),
        a.mode !== "withdraw" ? (s(), i(B, { key: 0 }, [
          e("label", ye, [e("span", null, l(a.mode === "deposit-open" ? "存入金额" : "申购金额"), 1), e("span", he, [r[3] || (r[3] = e("i", null, "¤", -1)), de(e("input", {
            "onUpdate:modelValue": r[0] || (r[0] = (p) => v.value = p),
            disabled: a.busy,
            type: "text",
            inputmode: "numeric",
            autocomplete: "off",
            "aria-describedby": "bank-amount-help"
          }, null, 8, $e), [[re, v.value]])])]),
          e("small", we, "钱包可用 ¤ " + l(a.balance.toLocaleString("zh-CN")) + " · " + l(a.product?.amountLabel), 1),
          e("div", _e, [(s(!0), i(B, null, R(x.value, (p) => (s(), i("button", {
            key: p,
            type: "button",
            disabled: a.busy,
            "aria-pressed": m.value === p,
            onClick: (F) => v.value = String(p)
          }, "¤ " + l(p.toLocaleString("zh-CN")), 9, Ce))), 128))])
        ], 64)) : c("", !0),
        h.value ? (s(), i("p", Be, l(h.value), 1)) : c("", !0),
        _.value ? (s(), i("dl", Ae, [
          e("div", null, [r[4] || (r[4] = e("dt", null, "整期收益率", -1)), e("dd", null, l(_.value.interestLabel), 1)]),
          A.value !== null ? (s(), i("div", Se, [r[5] || (r[5] = e("dt", null, "到期到账（含本金）", -1)), e("dd", null, "¤ " + l(A.value.toLocaleString("zh-CN")), 1)])) : c("", !0),
          e("div", null, [r[6] || (r[6] = e("dt", null, "提前支取", -1)), e("dd", null, "本金 " + l(_.value.earlyPenaltyLabel) + "，无利息", 1)])
        ])) : c("", !0),
        $.value ? (s(), i(B, { key: 3 }, [e("dl", Me, [e("div", null, [r[7] || (r[7] = e("dt", null, "整期收益区间", -1)), e("dd", null, l($.value.returnLabel), 1)]), e("div", null, [r[8] || (r[8] = e("dt", null, "风险等级", -1)), e("dd", null, l($.value.riskLabel), 1)])]), r[9] || (r[9] = e("p", { class: "bank-dialog-warning" }, "可能损失本金。申购后不能提前退出，实际收益封存至到期才揭晓。", -1))], 64)) : c("", !0),
        a.mode === "withdraw" && a.position ? (s(), i(B, { key: 4 }, [
          e("div", Le, [r[10] || (r[10] = e("span", null, "现在实际到账", -1)), e("strong", null, "¤ " + l(a.position.earlyWithdrawalAmount.toLocaleString("zh-CN")), 1)]),
          e("dl", Ne, [e("div", null, [r[11] || (r[11] = e("dt", null, "原存入本金", -1)), e("dd", null, "¤ " + l(a.position.principal.toLocaleString("zh-CN")), 1)]), e("div", null, [r[12] || (r[12] = e("dt", null, "提前支取损失", -1)), e("dd", Ie, "¤ " + l((a.position.principal - a.position.earlyWithdrawalAmount).toLocaleString("zh-CN")), 1)])]),
          r[13] || (r[13] = e("p", { class: "bank-dialog-warning" }, "不再获得到期利息，确认后不可撤销。", -1))
        ], 64)) : c("", !0),
        a.claimableCount ? (s(), i("p", Re, "另有 " + l(a.claimableCount) + " 笔到期资产，将随本次操作一并兑付至钱包。", 1)) : c("", !0),
        a.disabledReason && !a.busy ? (s(), i("p", De, l(a.disabledReason), 1)) : c("", !0),
        a.error ? (s(), i("p", xe, l(a.error), 1)) : c("", !0),
        e("footer", ze, [e("button", {
          type: "button",
          class: "bank-secondary-button",
          disabled: a.busy,
          autofocus: "",
          onClick: r[1] || (r[1] = (p) => t("cancel"))
        }, "返回", 8, Pe), e("button", {
          type: "submit",
          class: "bank-primary-button",
          disabled: !S.value
        }, l(a.busy ? "正在保存…" : a.mode === "withdraw" ? "确认支取" : a.mode === "fund-open" ? "确认申购" : "确认存入"), 9, Ee)])
      ], 32)]),
      _: 1
    }, 8, ["aria-label", "busy"]));
  }
}), Ve = Te, qe = {
  class: "bank-page",
  "aria-labelledby": "bank-deposits-title"
}, Ue = { class: "bank-product-grid" }, Fe = { class: "bank-term-pill" }, We = { class: "bank-product-offer" }, He = { class: "bank-deposit-rate" }, Oe = [
  "aria-label",
  "disabled",
  "onClick"
], Ze = { class: "bank-product-terms" }, je = {
  key: 0,
  class: "bank-product-hint"
}, Ge = /* @__PURE__ */ M({
  __name: "BankDeposits",
  props: {
    products: {},
    balance: {},
    writeDisabledReason: {}
  },
  emits: ["open"],
  setup(a) {
    return (u, n) => (s(), i("section", qe, [
      n[3] || (n[3] = e("header", { class: "bank-page-heading" }, [e("h2", { id: "bank-deposits-title" }, "定期存单")], -1)),
      e("div", Ue, [(s(!0), i(B, null, R(a.products, (t) => (s(), i("article", {
        key: t.id,
        class: "bank-product-card bank-deposit-card"
      }, [
        e("header", null, [e("h3", null, l(t.name), 1), e("span", Fe, l(t.lockRounds) + " 回合", 1)]),
        e("div", We, [e("div", He, [e("strong", null, l(t.interestLabel), 1), n[0] || (n[0] = e("span", null, "整期收益率 · 非年化", -1))]), e("button", {
          type: "button",
          class: "bank-primary-button",
          "aria-label": `存入${t.name}`,
          disabled: !!a.writeDisabledReason || a.balance < t.minAmount,
          onClick: (v) => u.$emit("open", t)
        }, "存入", 8, Oe)]),
        e("dl", Ze, [e("div", null, [n[1] || (n[1] = e("dt", null, "存入范围", -1)), e("dd", null, l(t.amountLabel), 1)]), e("div", null, [n[2] || (n[2] = e("dt", null, "提前支取", -1)), e("dd", null, "本金 " + l(t.earlyPenaltyLabel) + "，无利息", 1)])]),
        a.balance < t.minAmount ? (s(), i("p", je, "钱包余额不足最低存入金额")) : c("", !0)
      ]))), 128))]),
      n[4] || (n[4] = e("p", { class: "bank-footnote" }, "每完成一条剧情回复，推进一回合。", -1))
    ]));
  }
}), Ke = Ge, Xe = {
  class: "bank-page",
  "aria-labelledby": "bank-funds-title"
}, Je = { class: "bank-product-grid" }, Qe = ["data-risk"], Ye = { class: "bank-fund-description" }, en = { class: "bank-product-offer" }, nn = { class: "bank-return-range" }, an = [
  "aria-label",
  "disabled",
  "onClick"
], tn = { class: "bank-product-terms" }, ln = {
  key: 0,
  class: "bank-product-hint"
}, sn = /* @__PURE__ */ M({
  __name: "BankFunds",
  props: {
    products: {},
    balance: {},
    writeDisabledReason: {}
  },
  emits: ["open"],
  setup(a) {
    return (u, n) => (s(), i("section", Xe, [
      n[3] || (n[3] = e("header", { class: "bank-page-heading" }, [e("h2", { id: "bank-funds-title" }, "浮动理财"), e("p", null, "可能损失本金，到期前不可退出。")], -1)),
      e("div", Je, [(s(!0), i(B, null, R(a.products, (t) => (s(), i("article", {
        key: t.id,
        class: "bank-product-card bank-fund-card",
        "data-risk": t.riskLevel
      }, [
        e("header", null, [e("h3", null, l(t.name), 1), e("span", { class: I(["bank-risk-badge", `is-${t.riskLevel}`]) }, l(t.riskLabel), 3)]),
        e("p", Ye, l(t.description), 1),
        e("div", en, [e("div", nn, [e("strong", null, l(t.returnLabel), 1), n[0] || (n[0] = e("span", null, "整期收益区间 · 非年化", -1))]), e("button", {
          type: "button",
          class: "bank-primary-button",
          "aria-label": `申购${t.name}`,
          disabled: !!a.writeDisabledReason || a.balance < t.minAmount,
          onClick: (v) => u.$emit("open", t)
        }, "申购", 8, an)]),
        e("dl", tn, [e("div", null, [n[1] || (n[1] = e("dt", null, "申购范围", -1)), e("dd", null, l(t.amountLabel), 1)]), e("div", null, [n[2] || (n[2] = e("dt", null, "锁定期限", -1)), e("dd", null, l(t.lockRounds) + " 回合", 1)])]),
        a.balance < t.minAmount ? (s(), i("p", ln, "钱包余额不足最低申购金额")) : c("", !0)
      ], 8, Qe))), 128))]),
      n[4] || (n[4] = e("p", { class: "bank-footnote" }, "以上为合同区间，实际收益到期揭晓。", -1))
    ]));
  }
}), on = sn, un = {
  class: "bank-product-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.7",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
  focusable: "false"
}, rn = ["d"], dn = {
  key: 0,
  cx: "12",
  cy: "12",
  r: "6"
}, vn = /* @__PURE__ */ M({
  __name: "BankProductIcon",
  props: { kind: {} },
  setup(a) {
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
    return (n, t) => (s(), i("svg", un, [e("path", { d: u[a.kind] }, null, 8, rn), a.kind === "vault" ? (s(), i("circle", dn)) : c("", !0)]));
  }
}), y = vn, bn = {
  class: "bank-page",
  "aria-labelledby": "bank-positions-title"
}, kn = ["disabled"], cn = {
  key: 1,
  class: "bank-empty-state"
}, mn = {
  key: 2,
  class: "bank-position-group"
}, pn = { class: "bank-section-heading" }, fn = { class: "bank-product-mark" }, gn = { class: "bank-position-amounts" }, yn = { key: 0 }, hn = ["disabled", "onClick"], $n = {
  key: 3,
  class: "bank-position-group"
}, wn = { class: "bank-section-heading" }, _n = { class: "bank-product-mark" }, Cn = { class: "bank-fund-principal" }, Bn = {
  key: 1,
  class: "bank-sealed-copy"
}, An = /* @__PURE__ */ M({
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
  setup(a) {
    return (u, n) => (s(), i("section", bn, [
      n[10] || (n[10] = e("header", { class: "bank-page-heading" }, [e("h2", { id: "bank-positions-title" }, "我的持有")], -1)),
      a.claimableCount ? (s(), i("button", {
        key: 0,
        type: "button",
        class: "bank-claim-button",
        disabled: !!a.writeDisabledReason,
        onClick: n[0] || (n[0] = (t) => u.$emit("settle"))
      }, [
        g(y, { kind: "check" }),
        e("span", null, l(a.claimableCount) + " 笔已到期", 1),
        n[2] || (n[2] = e("strong", null, "全部领取", -1)),
        g(y, { kind: "next" })
      ], 8, kn)) : c("", !0),
      !a.deposits.length && !a.investments.length ? (s(), i("div", cn, [
        g(y, { kind: "positions" }),
        n[3] || (n[3] = e("h3", null, "暂无持有", -1)),
        e("button", {
          type: "button",
          class: "bank-secondary-button",
          onClick: n[1] || (n[1] = (t) => u.$emit("browse"))
        }, "查看存单")
      ])) : c("", !0),
      a.deposits.length ? (s(), i("div", mn, [e("header", pn, [e("h3", null, [n[4] || (n[4] = q("定期存单 ", -1)), e("small", null, l(a.deposits.length), 1)])]), (s(!0), i(B, null, R(a.deposits, (t) => (s(), i("article", {
        key: t.id,
        class: "bank-position-card"
      }, [
        e("header", null, [
          e("span", fn, [g(y, { kind: "deposit" })]),
          e("h4", null, l(t.name), 1),
          e("span", { class: I(["bank-position-status", { "is-due": t.claimable }]) }, l(t.statusLabel), 3)
        ]),
        e("dl", gn, [e("div", null, [n[5] || (n[5] = e("dt", null, "存入本金", -1)), e("dd", null, "¤ " + l(t.principal.toLocaleString("zh-CN")), 1)]), e("div", null, [n[6] || (n[6] = e("dt", null, "到期到账", -1)), e("dd", null, "¤ " + l(t.maturityAmount.toLocaleString("zh-CN")), 1)])]),
        t.claimable ? c("", !0) : (s(), i("footer", yn, [e("span", null, "现在支取到账 ¤ " + l(t.earlyWithdrawalAmount.toLocaleString("zh-CN")), 1), e("button", {
          type: "button",
          class: "bank-text-button is-loss",
          disabled: !!a.writeDisabledReason,
          onClick: (v) => u.$emit("withdraw", t)
        }, "提前支取", 8, hn)]))
      ]))), 128))])) : c("", !0),
      a.investments.length ? (s(), i("div", $n, [e("header", wn, [e("h3", null, [n[7] || (n[7] = q("浮动理财 ", -1)), e("small", null, l(a.investments.length), 1)])]), (s(!0), i(B, null, R(a.investments, (t) => (s(), i("article", {
        key: t.id,
        class: "bank-position-card"
      }, [
        e("header", null, [
          e("span", _n, [g(y, { kind: "fund" })]),
          e("h4", null, l(t.name), 1),
          e("span", { class: I(["bank-position-status", { "is-due": t.claimable }]) }, l(t.statusLabel), 3)
        ]),
        e("div", Cn, [e("span", null, l(t.riskLabel) + " · 申购本金", 1), e("strong", null, "¤ " + l(t.principal.toLocaleString("zh-CN")), 1)]),
        t.claimable ? (s(), i("div", {
          key: 0,
          class: I(["bank-fund-result", { "is-negative": t.resolvedReturnBps < 0 }])
        }, [
          n[8] || (n[8] = e("span", null, "到期结果已揭晓", -1)),
          e("strong", null, l(t.returnLabel), 1),
          e("small", null, "可领取 ¤ " + l(t.settlementAmount.toLocaleString("zh-CN")), 1)
        ], 2)) : (s(), i("div", Bn, [g(y, { kind: "lock" }), n[9] || (n[9] = e("p", null, "收益到期揭晓，锁定期间不可退出。", -1))]))
      ]))), 128))])) : c("", !0)
    ]));
  }
}), Sn = An, Mn = {
  class: "bank-page",
  "aria-labelledby": "bank-records-title"
}, Ln = { class: "bank-page-heading" }, Nn = { id: "bank-records-title" }, In = {
  key: 0,
  class: "bank-empty-state"
}, Rn = {
  key: 1,
  class: "bank-record-list"
}, Dn = { class: "bank-product-mark" }, xn = { class: "bank-record-main" }, zn = { class: "bank-record-detail" }, Pn = {
  key: 2,
  class: "bank-inline-error",
  role: "alert"
}, En = ["disabled"], Tn = /* @__PURE__ */ M({
  __name: "BankRecords",
  props: {
    activities: {},
    total: {},
    hasMore: { type: Boolean },
    loadingMore: { type: Boolean },
    error: {}
  },
  emits: ["loadMore"],
  setup(a) {
    const u = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: !1
    });
    return (n, t) => (s(), i("section", Mn, [
      e("header", Ln, [e("h2", Nn, [t[1] || (t[1] = q("兑付记录 ", -1)), e("small", null, l(a.total) + " 笔", 1)])]),
      a.activities.length ? (s(), i("div", Rn, [(s(!0), i(B, null, R(a.activities, (v) => (s(), i("details", {
        key: v.id,
        class: "bank-record-row"
      }, [e("summary", null, [
        e("span", Dn, [g(y, { kind: v.kind }, null, 8, ["kind"])]),
        e("span", xn, [e("strong", null, l(v.productName), 1), e("small", null, l(v.resultLabel), 1)]),
        e("span", { class: I(["bank-record-net", {
          "is-negative": v.net < 0,
          "is-flat": v.net === 0
        }]) }, [e("strong", null, l(v.net > 0 ? "+" : "") + l(v.net.toLocaleString("zh-CN")), 1), e("small", null, l(v.net < 0 ? "净损失" : v.net > 0 ? "净收益" : "持平"), 1)], 2),
        g(y, { kind: "next" })
      ]), e("dl", zn, [
        e("div", null, [t[3] || (t[3] = e("dt", null, "投入本金", -1)), e("dd", null, "¤ " + l(v.amountIn.toLocaleString("zh-CN")), 1)]),
        e("div", null, [t[4] || (t[4] = e("dt", null, "实际到账", -1)), e("dd", null, "¤ " + l(v.payout.toLocaleString("zh-CN")), 1)]),
        e("div", null, [t[5] || (t[5] = e("dt", null, "结算回合", -1)), e("dd", null, l(v.turnLabel), 1)]),
        e("div", null, [t[6] || (t[6] = e("dt", null, "发生时间", -1)), e("dd", null, l(le(u).format(v.createdAt)), 1)])
      ])]))), 128))])) : (s(), i("div", In, [g(y, { kind: "records" }), t[2] || (t[2] = e("h3", null, "暂无兑付记录", -1))])),
      a.error ? (s(), i("p", Pn, l(a.error), 1)) : c("", !0),
      a.hasMore ? (s(), i("button", {
        key: 3,
        type: "button",
        class: "bank-secondary-button bank-full-button bank-load-more",
        disabled: a.loadingMore,
        onClick: t[0] || (t[0] = (v) => n.$emit("loadMore"))
      }, l(a.loadingMore ? "正在读取…" : "查看更早的记录"), 9, En)) : c("", !0)
    ]));
  }
}), Vn = Tn, qn = {
  class: "bank-vault bank-page",
  "aria-labelledby": "bank-vault-title"
}, Un = { class: "bank-assets" }, Fn = ["disabled"], Wn = { class: "bank-vault-portals" }, Hn = { class: "bank-portal-mark" }, On = { class: "bank-portal-mark" }, Zn = { class: "bank-timing" }, jn = /* @__PURE__ */ M({
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
  setup(a) {
    return (u, n) => (s(), i("section", qn, [
      e("header", Un, [
        n[5] || (n[5] = e("h2", { id: "bank-vault-title" }, "持有本金", -1)),
        e("strong", null, [n[4] || (n[4] = e("small", null, "¤", -1)), q(" " + l(a.lockedAmount.toLocaleString("zh-CN")), 1)]),
        n[6] || (n[6] = e("p", null, "不含未结算收益", -1))
      ]),
      e("button", {
        type: "button",
        class: "bank-holding-link",
        onClick: n[0] || (n[0] = (t) => u.$emit("navigate", "positions"))
      }, [
        e("span", null, "存单 " + l(a.depositCount) + " 笔 · 理财 " + l(a.fundCount) + " 笔", 1),
        n[7] || (n[7] = e("strong", null, "查看持有", -1)),
        g(y, { kind: "next" })
      ]),
      a.claimableCount ? (s(), i("button", {
        key: 0,
        type: "button",
        class: "bank-claim-button",
        disabled: !!a.writeDisabledReason,
        onClick: n[1] || (n[1] = (t) => u.$emit("settle"))
      }, [
        g(y, { kind: "check" }),
        e("span", null, l(a.claimableCount) + " 笔已到期", 1),
        n[8] || (n[8] = e("strong", null, "全部领取", -1)),
        g(y, { kind: "next" })
      ], 8, Fn)) : c("", !0),
      e("div", Wn, [e("button", {
        type: "button",
        class: "bank-portal",
        onClick: n[2] || (n[2] = (t) => u.$emit("navigate", "deposits"))
      }, [
        e("span", Hn, [g(y, { kind: "deposit" })]),
        n[9] || (n[9] = e("span", null, [e("strong", null, "定期存单"), e("small", null, "固定收益")], -1)),
        g(y, { kind: "next" })
      ]), e("button", {
        type: "button",
        class: "bank-portal is-fund",
        onClick: n[3] || (n[3] = (t) => u.$emit("navigate", "funds"))
      }, [
        e("span", On, [g(y, { kind: "fund" })]),
        n[10] || (n[10] = e("span", null, [e("strong", null, "浮动理财"), e("small", null, "收益浮动，可能损失本金")], -1)),
        g(y, { kind: "next" })
      ])]),
      e("details", Zn, [n[11] || (n[11] = e("summary", null, "计期与兑付", -1)), e("p", null, "当前第 " + l(a.currentTurn) + " 回合。每完成一条剧情回复推进一回合。到期资产可手动领取，也会随下一次银行交易一并结算至钱包。", 1)])
    ]));
  }
}), Gn = jn, Kn = { class: "bank-app" }, Xn = { class: "bank-header" }, Jn = {
  class: "bank-header-balance",
  "aria-label": "钱包可用余额"
}, Qn = ["disabled"], Yn = {
  key: 0,
  class: "bank-notice-area"
}, ea = ["disabled"], na = ["disabled"], aa = {
  key: 0,
  class: "bank-empty-state",
  role: "status"
}, ta = {
  class: "bank-navigation",
  "aria-label": "银行主导航"
}, la = [
  "aria-label",
  "aria-current",
  "onClick"
], sa = { key: 0 }, V = 35e3, ia = /* @__PURE__ */ M({
  __name: "BankApp",
  props: {
    bridge: {},
    initialState: {}
  },
  setup(a) {
    const u = a, n = C(structuredClone(oe(u.initialState))), t = C("vault"), v = C(null), f = C(null), m = C(!1), h = C(!1), _ = C(!1), $ = C(""), A = C(""), x = C("");
    let S = null, U = () => {
    }, b = 0;
    ve(() => f.value ? (G(), !0) : t.value !== "vault" ? (T("vault"), !0) : !1);
    const r = w(() => n.value.status === "unconfirmed"), p = w(() => h.value ? "正在处理上一项银行操作" : m.value ? "正在刷新金库状态" : n.value.status !== "ready" ? n.value.message || "金库暂时不可写入" : n.value.generationActive ? "主剧情正在生成，请等待回复完成" : ""), F = w(() => m.value || h.value || r.value), O = w(() => $.value || n.value.message || (n.value.status !== "loading" && !f.value ? p.value : ""));
    function H() {
      return typeof globalThis.crypto?.randomUUID == "function" ? `bank-ui:${globalThis.crypto.randomUUID()}` : `bank-ui:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
    }
    function P() {
      return { chatIdentity: n.value.chatIdentity };
    }
    function E(d) {
      n.value = structuredClone(d), m.value = !1, _.value = !1, $.value = "", x.value = "", d.claimableCount === 0 && (S = null);
    }
    function z(d) {
      const o = d instanceof Error ? d.message : String(d);
      return o.includes("economy_insufficient_funds") || o.includes("cannot be overdrawn") ? "可用小白币不足，开户未完成。" : o.includes("bank_amount_out_of_range") ? "开户金额不在该产品允许范围内。" : o.includes("bank_amount_invalid") ? "开户金额必须是正整数。" : o.includes("bank_revision_conflict") || o.includes("bank_event_id_conflict") ? "金库状态已变化，请关闭确认框并刷新后重试。" : o.includes("bank_position_missing") || o.includes("bank_position_state_changed") ? "该笔资产状态已经变化，请刷新金库。" : o.includes("bank_no_due_positions") ? "当前没有可领取的到期资产。" : o === "host_request_timeout" ? "等待保存结果超时，请保留当前页面并重试。" : "银行操作未完成，请稍后重试。";
    }
    async function Z() {
      if (F.value) return;
      const d = ++b;
      m.value = !0, $.value = "";
      try {
        const o = await u.bridge.request("bank/refresh", P(), V);
        d === b && E(o.result);
      } catch (o) {
        d === b && ($.value = z(o));
      } finally {
        d === b && (m.value = !1);
      }
    }
    async function Y() {
      if (m.value || h.value) return;
      const d = ++b;
      m.value = !0, $.value = "";
      try {
        const o = await u.bridge.request("bank/confirm-save", P(), V);
        d === b && E(o.result.state);
      } catch (o) {
        d === b && ($.value = z(o));
      } finally {
        d === b && (m.value = !1);
      }
    }
    function T(d) {
      t.value = d, v.value?.scrollTo(0, 0);
    }
    function j(d, o) {
      p.value || (A.value = "", f.value = {
        mode: o,
        product: d,
        actionId: H()
      });
    }
    function ee(d) {
      p.value || (A.value = "", f.value = {
        mode: "withdraw",
        position: d,
        actionId: H()
      });
    }
    function G() {
      h.value || (f.value = null, A.value = "");
    }
    async function ne(d) {
      const o = f.value;
      if (!o || p.value) return;
      const k = b;
      h.value = !0, A.value = "";
      const W = o.mode === "deposit-open" ? "bank/deposit/open" : o.mode === "fund-open" ? "bank/fund/open" : "bank/deposit/withdraw";
      try {
        const L = await u.bridge.request(W, {
          ...P(),
          expectedRevision: n.value.revision,
          expectedEventId: n.value.eventId,
          actionId: o.actionId,
          ...o.product ? {
            productId: o.product.id,
            amount: d
          } : {},
          ...o.position ? { positionId: o.position.id } : {}
        }, V);
        if (k !== b || f.value !== o) return;
        E(L.result), f.value = null, T("positions");
      } catch (L) {
        k === b && f.value === o && (A.value = z(L));
      } finally {
        k === b && (h.value = !1);
      }
    }
    async function K() {
      if (p.value || n.value.claimableCount === 0) return;
      const d = b;
      S ||= H();
      const o = S;
      h.value = !0, $.value = "";
      try {
        const k = await u.bridge.request("bank/settle-due", {
          ...P(),
          expectedRevision: n.value.revision,
          expectedEventId: n.value.eventId,
          actionId: o
        }, V);
        if (d !== b) return;
        S = null, E(k.result);
      } catch (k) {
        d === b && ($.value = z(k));
      } finally {
        d === b && (h.value = !1);
      }
    }
    async function ae() {
      if (!n.value.activityPage.hasMore || _.value || h.value) return;
      const d = b, o = n.value.activities.length;
      _.value = !0, x.value = "";
      try {
        const k = await u.bridge.request("bank/records/load-more", {
          ...P(),
          offset: o
        }, V);
        if (d !== b) return;
        const W = new Set(n.value.activities.map((L) => L.id));
        n.value.activities.push(...k.result.activities.filter((L) => !W.has(L.id))), n.value.activityPage = k.result.activityPage;
      } catch (k) {
        d === b && (x.value = z(k));
      } finally {
        d === b && (_.value = !1);
      }
    }
    return te(() => {
      U = u.bridge.subscribe((d) => {
        d.type === "bank/state" && (h.value || (b += 1), E(d.payload.state)), d.type === "bank/error" && ($.value = z(d.payload?.message || ""));
      });
    }), ie(() => {
      b += 1, U(), f.value = null, S = null;
    }), (d, o) => (s(), i("main", Kn, [
      e("header", Xn, [
        o[3] || (o[3] = e("h1", null, "银行", -1)),
        e("div", Jn, [e("strong", null, "¤ " + l(n.value.status === "loading" ? "—" : n.value.balance.toLocaleString("zh-CN")), 1)]),
        e("button", {
          type: "button",
          class: "bank-icon-button",
          disabled: F.value,
          "aria-label": "刷新银行",
          onClick: Z
        }, [g(y, {
          kind: "refresh",
          class: I({ "is-spinning": m.value })
        }, null, 8, ["class"])], 8, Qn)
      ]),
      O.value ? (s(), i("div", Yn, [e("aside", {
        class: I(["bank-notice", { "is-error": !!$.value || n.value.status === "blocked" || n.value.status === "conflict" }]),
        role: "status"
      }, [e("p", null, l(O.value), 1), r.value ? (s(), i("button", {
        key: 0,
        type: "button",
        disabled: m.value || h.value,
        onClick: Y
      }, l(m.value ? "正在核实…" : "核实保存结果"), 9, ea)) : n.value.status === "blocked" || n.value.status === "conflict" ? (s(), i("button", {
        key: 1,
        type: "button",
        disabled: F.value,
        onClick: Z
      }, l(m.value ? "正在读取…" : "重新读取银行"), 9, na)) : c("", !0)], 2)])) : c("", !0),
      e("div", {
        ref_key: "content",
        ref: v,
        class: "bank-scroll"
      }, [n.value.status === "loading" ? (s(), i("div", aa, [g(y, {
        kind: "refresh",
        class: "is-spinning"
      }), o[4] || (o[4] = e("h3", null, "正在读取资产…", -1))])) : t.value === "vault" ? (s(), N(Gn, {
        key: 1,
        "locked-amount": n.value.lockedAmount,
        "current-turn": n.value.currentTurn,
        "deposit-count": n.value.deposits.length,
        "fund-count": n.value.investments.length,
        "claimable-count": n.value.claimableCount,
        "write-disabled-reason": p.value,
        onNavigate: T,
        onSettle: K
      }, null, 8, [
        "locked-amount",
        "current-turn",
        "deposit-count",
        "fund-count",
        "claimable-count",
        "write-disabled-reason"
      ])) : t.value === "deposits" ? (s(), N(Ke, {
        key: 2,
        products: n.value.products.deposits,
        balance: n.value.balance,
        "write-disabled-reason": p.value,
        onOpen: o[0] || (o[0] = (k) => j(k, "deposit-open"))
      }, null, 8, [
        "products",
        "balance",
        "write-disabled-reason"
      ])) : t.value === "funds" ? (s(), N(on, {
        key: 3,
        products: n.value.products.funds,
        balance: n.value.balance,
        "write-disabled-reason": p.value,
        onOpen: o[1] || (o[1] = (k) => j(k, "fund-open"))
      }, null, 8, [
        "products",
        "balance",
        "write-disabled-reason"
      ])) : t.value === "positions" ? (s(), N(Sn, {
        key: 4,
        deposits: n.value.deposits,
        investments: n.value.investments,
        "claimable-count": n.value.claimableCount,
        "write-disabled-reason": p.value,
        onWithdraw: ee,
        onSettle: K,
        onBrowse: o[2] || (o[2] = (k) => T("deposits"))
      }, null, 8, [
        "deposits",
        "investments",
        "claimable-count",
        "write-disabled-reason"
      ])) : (s(), N(Vn, {
        key: 5,
        activities: n.value.activities,
        total: n.value.activityPage.total,
        "has-more": n.value.activityPage.hasMore,
        "loading-more": _.value,
        error: x.value,
        onLoadMore: ae
      }, null, 8, [
        "activities",
        "total",
        "has-more",
        "loading-more",
        "error"
      ]))], 512),
      e("nav", ta, [(s(), i(B, null, R([
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
      ], (k) => e("button", {
        key: k.page,
        type: "button",
        "aria-label": k.label,
        "aria-current": t.value === k.page ? "page" : void 0,
        onClick: (W) => T(k.page)
      }, [e("span", null, [g(y, { kind: k.icon }, null, 8, ["kind"]), k.page === "positions" && n.value.claimableCount ? (s(), i("i", sa)) : c("", !0)]), q(l(k.label), 1)], 8, la)), 64))]),
      f.value ? (s(), N(Ve, {
        key: 1,
        mode: f.value.mode,
        product: f.value.product,
        position: f.value.position,
        balance: n.value.balance,
        busy: h.value,
        error: A.value,
        "claimable-count": n.value.claimableCount,
        "disabled-reason": p.value,
        onCancel: G,
        onConfirm: ne
      }, null, 8, [
        "mode",
        "product",
        "position",
        "balance",
        "busy",
        "error",
        "claimable-count",
        "disabled-reason"
      ])) : c("", !0)
    ]));
  }
}), da = ia;
export {
  da as default
};
