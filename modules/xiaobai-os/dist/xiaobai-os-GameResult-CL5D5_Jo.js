/* eslint-disable */
import { $ as p, D as k, R as C, S as m, T as f, U as y, V as u, d as x, ft as s, h as g, rt as h, ut as $, v as c, x as b, y as a } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { r as G } from "./xiaobai-os-room-catalog-C1kpY1HV.js";
var N = { class: "game-entry-art" }, R = ["src"], S = { class: "game-entry-rules" }, B = {
  key: 0,
  class: "game-entry-blocked"
}, L = {
  key: 1,
  class: "game-entry-stake"
}, V = {
  key: 0,
  class: "game-stake-chips",
  "aria-label": "选择下注"
}, z = ["aria-pressed", "onClick"], E = {
  key: 1,
  class: "game-stake-input"
}, T = [
  "min",
  "max",
  "step"
], D = { class: "game-entry-balance" }, w = ["disabled"], A = {
  key: 2,
  class: "game-inline-note",
  role: "status"
}, I = /* @__PURE__ */ k({
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
    const v = { balance: (i) => `可用 ${i.toLocaleString("zh-CN")} 小白币` }, t = e, n = h(t.initial), d = c(() => G(t.kind)), o = c(() => t.disabledReason || (!Number.isSafeInteger(n.value) || n.value < t.minimum || n.value > t.maximum || n.value % t.step !== 0 ? `请选择 ${t.minimum}–${t.maximum}，每次 ${t.step} 小白币。` : t.balance < n.value ? "小白币不够，换个小一点的筹码吧。" : ""));
    return (i, l) => (u(), m("section", { class: $(["game-entry", "is-" + d.value.tone]) }, [
      a("div", N, [a("img", {
        src: d.value.artwork,
        alt: ""
      }, null, 8, R)]),
      a("ol", S, [(u(!0), m(g, null, y(e.rules, (r) => (u(), m("li", { key: r }, s(r), 1))), 128))]),
      e.otherGame ? (u(), m("div", B, [a("p", null, "还有一局" + s(e.otherGame) + "没结束，可以先逛逛，玩完再来。", 1), a("button", {
        type: "button",
        class: "game-primary-action",
        onClick: l[0] || (l[0] = (r) => i.$emit("resume"))
      }, "继续那一局")])) : (u(), m("div", L, [
        a("h3", null, s(e.minimum === e.maximum ? "本局入场" : "本局筹码"), 1),
        e.minimum !== e.maximum ? (u(), m("div", V, [(u(!0), m(g, null, y(e.chips, (r) => (u(), m("button", {
          key: r,
          type: "button",
          "aria-pressed": n.value === r,
          onClick: (O) => n.value = r
        }, [a("span", null, s(r), 1)], 8, z))), 128))])) : b("", !0),
        e.minimum !== e.maximum ? (u(), m("label", E, [
          l[3] || (l[3] = a("span", null, "自选", -1)),
          p(a("input", {
            "onUpdate:modelValue": l[1] || (l[1] = (r) => n.value = r),
            type: "number",
            min: e.minimum,
            max: e.maximum,
            step: e.step,
            "aria-label": "本局下注"
          }, null, 8, T), [[
            x,
            n.value,
            void 0,
            { number: !0 }
          ]]),
          l[4] || (l[4] = a("span", null, "小白币", -1))
        ])) : b("", !0),
        a("p", D, s(v.balance(e.balance)), 1),
        a("button", {
          type: "button",
          class: "game-primary-action game-start",
          disabled: !!o.value,
          onClick: l[2] || (l[2] = (r) => i.$emit("start", n.value))
        }, " 下注 " + s(n.value || "—") + " · 开始 ", 9, w),
        o.value ? (u(), m("p", A, s(o.value), 1)) : b("", !0)
      ]))
    ], 2));
  }
}), j = I, M = { class: "game-result-net" }, U = ["disabled"], F = /* @__PURE__ */ k({
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
  setup(e, { emit: v }) {
    const t = e, n = v;
    C(() => n("revealed"));
    const d = c(() => (t.record.net > 0 ? "+" : "") + t.record.net.toLocaleString("zh-CN"));
    return (o, i) => (u(), m("section", {
      class: $(["game-result", "is-" + e.record.outcomeTone]),
      "aria-label": "本局结算"
    }, [
      a("h3", null, s(e.record.outcomeLabel), 1),
      a("strong", M, [f(s(d.value), 1), i[2] || (i[2] = a("small", null, "小白币", -1))]),
      a("p", null, "下注 " + s(e.record.amountIn) + " · 拿回 " + s(e.record.payout) + "（含返还的本金）", 1),
      a("p", null, "现在有 " + s(e.balanceAfter.toLocaleString("zh-CN")) + " 小白币", 1),
      a("div", null, [a("button", {
        type: "button",
        class: "game-primary-action",
        disabled: e.disabled,
        onClick: i[0] || (i[0] = (l) => o.$emit("again"))
      }, " 再玩一局 ", 8, U), a("button", {
        type: "button",
        class: "game-secondary-action",
        onClick: i[1] || (i[1] = (l) => o.$emit("lobby"))
      }, "回大厅")])
    ], 2));
  }
}), q = F;
export {
  j as n,
  q as t
};
