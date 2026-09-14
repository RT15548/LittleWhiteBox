/* eslint-disable */
import { E as p, H as $, K as f, gt as i, h as g, j as c, k as m, l as v, mt as k, o as b, p as C, r as y, s as a, u as r } from "./xiaobai-os-runtime-core.esm-bundler-x_Eikhco.js";
import { o as h } from "./xiaobai-os-runtime-dom.esm-bundler-DWFjb9Vy.js";
import { n as x } from "./xiaobai-os-room-catalog-DarmW-WP.js";
var G = { class: "game-entry-art" }, N = ["src"], R = { class: "game-entry-rules" }, B = {
  key: 0,
  class: "game-entry-blocked"
}, E = {
  key: 1,
  class: "game-entry-stake"
}, L = {
  key: 0,
  class: "game-stake-chips",
  "aria-label": "选择下注"
}, S = ["aria-pressed", "onClick"], z = {
  key: 1,
  class: "game-stake-input"
}, V = [
  "min",
  "max",
  "step"
], T = { class: "game-entry-balance" }, w = ["disabled"], A = {
  key: 2,
  class: "game-inline-note",
  role: "status"
}, D = /* @__PURE__ */ g({
  __name: "GameEntry",
  props: {
    kind: {},
    minimum: {},
    maximum: {},
    step: {},
    initial: {},
    chips: {},
    rules: {},
    balance: {},
    disabledReason: {},
    otherGame: {}
  },
  emits: ["start", "resume"],
  setup(e) {
    const s = e, n = f(s.initial), d = b(() => x(s.kind)), u = b(() => s.disabledReason || (!Number.isSafeInteger(n.value) || n.value < s.minimum || n.value > s.maximum || n.value % s.step !== 0 ? `请选择 ${s.minimum}–${s.maximum}，每次 ${s.step} 小白币。` : s.balance < n.value ? "小白币不够，换个小一点的筹码吧。" : ""));
    return (o, t) => (m(), r("section", { class: k(["game-entry", "is-" + d.value.tone]) }, [
      a("div", G, [a("img", {
        src: d.value.artwork,
        alt: ""
      }, null, 8, N)]),
      a("ol", R, [(m(!0), r(y, null, c(e.rules, (l) => (m(), r("li", { key: l }, i(l), 1))), 128))]),
      e.otherGame ? (m(), r("div", B, [a("p", null, "还有一局" + i(e.otherGame) + "没结束，可以先逛逛，玩完再来。", 1), a("button", {
        type: "button",
        class: "game-primary-action",
        onClick: t[0] || (t[0] = (l) => o.$emit("resume"))
      }, "继续那一局")])) : (m(), r("div", E, [
        a("h3", null, i(e.minimum === e.maximum ? "本局入场" : "本局筹码"), 1),
        e.minimum !== e.maximum ? (m(), r("div", L, [(m(!0), r(y, null, c(e.chips, (l) => (m(), r("button", {
          key: l,
          type: "button",
          "aria-pressed": n.value === l,
          onClick: (F) => n.value = l
        }, [a("span", null, i(l), 1)], 8, S))), 128))])) : v("", !0),
        e.minimum !== e.maximum ? (m(), r("label", z, [
          t[3] || (t[3] = a("span", null, "自选", -1)),
          $(a("input", {
            "onUpdate:modelValue": t[1] || (t[1] = (l) => n.value = l),
            type: "number",
            min: e.minimum,
            max: e.maximum,
            step: e.step,
            "aria-label": "本局下注"
          }, null, 8, V), [[
            h,
            n.value,
            void 0,
            { number: !0 }
          ]]),
          t[4] || (t[4] = a("span", null, "小白币", -1))
        ])) : v("", !0),
        a("p", T, "可用 " + i(e.balance.toLocaleString("zh-CN")) + " 小白币 · 仅使用虚拟币", 1),
        a("button", {
          type: "button",
          class: "game-primary-action game-start",
          disabled: !!u.value,
          onClick: t[2] || (t[2] = (l) => o.$emit("start", n.value))
        }, " 下注 " + i(n.value || "—") + " · 开始 ", 9, w),
        u.value ? (m(), r("p", A, i(u.value), 1)) : v("", !0)
      ]))
    ], 2));
  }
}), q = D, I = { class: "game-result-net" }, M = ["disabled"], j = /* @__PURE__ */ g({
  __name: "GameResult",
  props: {
    record: {},
    balanceAfter: {},
    disabled: { type: Boolean }
  },
  emits: [
    "again",
    "lobby",
    "revealed"
  ],
  setup(e, { emit: s }) {
    const n = e, d = s;
    p(() => d("revealed"));
    const u = b(() => (n.record.net > 0 ? "+" : "") + n.record.net.toLocaleString("zh-CN"));
    return (o, t) => (m(), r("section", {
      class: k(["game-result", "is-" + e.record.outcomeTone]),
      "aria-label": "本局结算"
    }, [
      a("h3", null, i(e.record.outcomeLabel), 1),
      a("strong", I, [C(i(u.value), 1), t[2] || (t[2] = a("small", null, "小白币", -1))]),
      a("p", null, "下注 " + i(e.record.amountIn) + " · 拿回 " + i(e.record.payout) + "（含返还的本金）", 1),
      a("p", null, "现在有 " + i(e.balanceAfter.toLocaleString("zh-CN")) + " 小白币", 1),
      a("div", null, [a("button", {
        type: "button",
        class: "game-primary-action",
        disabled: e.disabled,
        onClick: t[0] || (t[0] = (l) => o.$emit("again"))
      }, " 再玩一局 ", 8, M), a("button", {
        type: "button",
        class: "game-secondary-action",
        onClick: t[1] || (t[1] = (l) => o.$emit("lobby"))
      }, "回大厅")])
    ], 2));
  }
}), J = j;
export {
  q as n,
  J as t
};
