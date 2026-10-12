/* eslint-disable */
import { D as A, E as G, P as V, R as N, S as r, T as h, U as B, V as i, X as I, b as k, ft as c, h as D, lt as $, rt as T, v as p, x as E, y as e } from "./xiaobai-os-app-navigation-DvMnPkC0.js";
import { a as L, c as C, i as M, l as U, o as w, s as S } from "./xiaobai-os-room-catalog-C1kpY1HV.js";
import { n as O, t as P } from "./xiaobai-os-GameResult-CL5D5_Jo.js";
var X = ["aria-label"], j = {
  class: "dice-call-dice",
  "aria-hidden": "true"
}, q = /* @__PURE__ */ A({
  __name: "DiceCall",
  props: {
    bid: {},
    speaker: {}
  },
  setup(a) {
    return (m, n) => (i(), r("div", {
      class: "dice-call",
      role: "group",
      "aria-label": a.speaker + "叫" + $(w)(a.bid)
    }, [
      e("h3", null, c(a.speaker) + "叫：" + c($(w)(a.bid)), 1),
      e("div", j, [(i(!0), r(D, null, B(a.bid.count, (b) => (i(), k(C, {
        key: b,
        value: a.bid.face,
        animate: !1
      }, null, 8, ["value"]))), 128))]),
      n[0] || (n[0] = e("p", null, "叫的是两个人合起来的数量", -1))
    ], 8, X));
  }
}), F = q, z = {
  class: "dice-table",
  "aria-label": "大话骰牌桌"
}, H = { class: "dice-stake" }, J = { class: "dice-opponent" }, K = {
  key: 1,
  class: "dice-first-call"
}, Q = { class: "dice-own-hand" }, W = { class: "game-dice-row" }, Y = {
  key: 2,
  class: "dice-builder"
}, Z = { class: "dice-builder-label" }, x = { class: "dice-number-picker" }, _ = ["disabled"], ee = ["disabled"], ae = {
  class: "dice-face-picker",
  role: "group",
  "aria-label": "叫哪个点数"
}, le = [
  "aria-label",
  "aria-pressed",
  "disabled",
  "onClick"
], ie = { class: "dice-turn-actions" }, te = ["disabled"], ne = ["disabled"], de = {
  key: 3,
  class: "dice-last-call"
}, se = ["disabled"], ue = { class: "game-small-rules" }, re = { class: "dice-call-history" }, oe = /* @__PURE__ */ A({
  __name: "DiceTable",
  props: {
    game: {},
    disabledReason: {},
    busy: { type: Boolean }
  },
  emits: ["bid", "challenge"],
  setup(a, { emit: m }) {
    const n = a, b = m, u = T(n.game.legalBids[0]?.count || 1), d = T(n.game.legalBids[0]?.face || 2), t = p(() => n.game.bids.at(-1)), s = p(() => [...new Set(n.game.legalBids.map((y) => y.count))]), o = p(() => L(n.game.legalBids, u.value));
    I(() => n.game.legalBids, () => {
      s.value.includes(u.value) || (u.value = s.value[0] || 1), o.value.includes(d.value) || (d.value = o.value[0] || 2);
    }, { immediate: !0 });
    function g(y) {
      const l = s.value[s.value.indexOf(u.value) + y];
      l !== void 0 && (u.value = l, o.value.includes(d.value) || (d.value = o.value[0]));
    }
    function f() {
      !n.disabledReason && o.value.includes(d.value) && b("bid", {
        count: u.value,
        face: d.value
      });
    }
    return (y, l) => (i(), r("section", z, [
      e("p", H, "本局筹码 ¤ " + c(a.game.bet), 1),
      e("div", J, [
        l[5] || (l[5] = e("span", {
          class: "dice-cup",
          "aria-hidden": "true"
        }, null, -1)),
        e("div", null, [l[4] || (l[4] = e("strong", null, "对面那位", -1)), e("small", null, c(a.busy ? "正琢磨怎么接你的话…" : t.value ? "轮到你了，跟着叫，还是开？" : "骰子摇好了，你先叫。"), 1)]),
        l[6] || (l[6] = e("span", { class: "dice-hidden-count" }, "5 颗暗骰", -1))
      ]),
      t.value ? (i(), k(F, {
        key: 0,
        bid: t.value,
        speaker: t.value.by === "dealer" ? "对方" : "你"
      }, null, 8, ["bid", "speaker"])) : (i(), r("div", K, [...l[7] || (l[7] = [e("span", null, "你先来", -1), e("p", null, [
        h("猜猜两个人的骰子里"),
        e("br"),
        h("至少有几个相同的点数？")
      ], -1)])])),
      e("div", Q, [
        l[8] || (l[8] = e("small", null, "你的骰子", -1)),
        e("div", W, [(i(!0), r(D, null, B(a.game.playerDice, (v, R) => (i(), k(C, {
          key: R,
          value: v,
          delay: R * 45
        }, null, 8, ["value", "delay"]))), 128))]),
        l[9] || (l[9] = e("p", null, [e("span", { class: "dice-wild-dot" }), h("一点百搭，开盅时也算你叫的点数")], -1))
      ]),
      a.game.legalActions.includes("bid") ? (i(), r("div", Y, [
        e("div", Z, [l[10] || (l[10] = e("strong", null, "这一口，你叫", -1)), e("span", null, "至少 " + c(u.value) + " 颗", 1)]),
        e("div", x, [
          e("button", {
            type: "button",
            "aria-label": "少叫一个",
            disabled: !!a.disabledReason || u.value === s.value[0],
            onClick: l[0] || (l[0] = (v) => g(-1))
          }, " − ", 8, _),
          e("strong", null, [h(c(u.value), 1), l[11] || (l[11] = e("small", null, "个", -1))]),
          e("button", {
            type: "button",
            "aria-label": "多叫一个",
            disabled: !!a.disabledReason || u.value === s.value.at(-1),
            onClick: l[1] || (l[1] = (v) => g(1))
          }, " + ", 8, ee)
        ]),
        e("div", ae, [(i(), r(D, null, B([
          2,
          3,
          4,
          5,
          6
        ], (v) => e("button", {
          key: v,
          type: "button",
          "aria-label": v + "点",
          "aria-pressed": d.value === v,
          disabled: !!a.disabledReason || !o.value.includes(v),
          onClick: (R) => d.value = v
        }, [G(C, {
          value: v,
          animate: !1
        }, null, 8, ["value"])], 8, le)), 64))]),
        e("div", ie, [e("button", {
          type: "button",
          class: "game-primary-action",
          disabled: !!a.disabledReason || !o.value.includes(d.value),
          onClick: f
        }, " 叫" + c($(w)({
          count: u.value,
          face: d.value
        })), 9, te), a.game.legalActions.includes("challenge") ? (i(), r("button", {
          key: 0,
          type: "button",
          class: "dice-open-cup",
          disabled: !!a.disabledReason,
          onClick: l[2] || (l[2] = (v) => y.$emit("challenge"))
        }, [...l[12] || (l[12] = [h(" 开盅", -1), e("small", null, "不信他有这么多", -1)])], 8, ne)) : E("", !0)])
      ])) : (i(), r("div", de, [l[13] || (l[13] = e("p", null, "已经叫到头了，开盅见分晓。", -1)), e("button", {
        type: "button",
        class: "game-primary-action",
        disabled: !!a.disabledReason,
        onClick: l[3] || (l[3] = (v) => y.$emit("challenge"))
      }, " 开盅 ", 8, se)])),
      e("details", ue, [
        l[14] || (l[14] = e("summary", null, "规则与叫骰记录", -1)),
        l[15] || (l[15] = e("p", null, "数量更多，或数量相同而点数更大，都算加叫。一点只作百搭，不能单独叫。", -1)),
        e("ol", re, [(i(!0), r(D, null, B(a.game.bids, (v, R) => (i(), r("li", { key: R }, [e("span", null, c(v.by === "player" ? "你" : "对方"), 1), e("strong", null, c($(w)(v)), 1)]))), 128))])
      ])
    ]));
  }
}), ve = oe, ce = {
  class: "dice-showdown",
  "aria-label": "开盅结果"
}, me = { class: "dice-reveal-hand" }, be = { class: "game-dice-row" }, ge = { class: "dice-reveal-hand" }, ye = { class: "game-dice-row" }, fe = {
  key: 0,
  class: "dice-verdict"
}, ke = /* @__PURE__ */ A({
  __name: "DiceShowdown",
  props: {
    record: {},
    detail: {},
    balanceAfter: {},
    disabled: { type: Boolean }
  },
  emits: [
    "again",
    "lobby",
    "revealed"
  ],
  setup(a) {
    const m = a, n = T(!1), b = T(!1), u = [], d = p(() => m.detail.matchingDiceCount >= m.detail.finalBid.count), t = p(() => [...m.detail.dealerDice, ...m.detail.playerDice].filter((o) => o === 1).length);
    function s() {
      n.value = !0, b.value = !0, u.forEach(clearTimeout);
    }
    return N(() => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        s();
        return;
      }
      const o = U(5);
      u.push(setTimeout(() => {
        n.value = !0;
      }, o.countAt), setTimeout(() => {
        b.value = !0;
      }, o.verdictAt));
    }), V(() => u.forEach(clearTimeout)), (o, g) => (i(), r("section", ce, [
      G(F, {
        bid: a.detail.finalBid,
        speaker: a.detail.finalBid.by === "player" ? "你" : "对方"
      }, null, 8, ["bid", "speaker"]),
      e("div", me, [g[3] || (g[3] = e("span", null, "对方的骰子", -1)), e("div", be, [(i(!0), r(D, null, B(a.detail.dealerDice, (f, y) => (i(), k(C, {
        key: y,
        value: f,
        delay: y * 45,
        highlight: n.value && $(S)(f, a.detail.finalBid.face)
      }, null, 8, [
        "value",
        "delay",
        "highlight"
      ]))), 128))])]),
      e("div", ge, [g[4] || (g[4] = e("span", null, "你的骰子", -1)), e("div", ye, [(i(!0), r(D, null, B(a.detail.playerDice, (f, y) => (i(), k(C, {
        key: y,
        value: f,
        delay: y * 45,
        highlight: n.value && $(S)(f, a.detail.finalBid.face)
      }, null, 8, [
        "value",
        "delay",
        "highlight"
      ]))), 128))])]),
      n.value ? (i(), r("p", fe, [
        h(" 合起来" + c(d.value ? "有" : "只有"), 1),
        e("strong", null, c($(w)({
          count: a.detail.matchingDiceCount,
          face: a.detail.finalBid.face
        })), 1),
        h("，" + c(d.value ? "够数" : "不够") + "。", 1),
        e("small", null, "包含 " + c(t.value) + " 颗百搭的一点 · " + c(a.detail.challenger === "player" ? "你开的盅" : "对方开的盅"), 1)
      ])) : E("", !0),
      b.value ? (i(), k(P, {
        key: 1,
        record: a.record,
        "balance-after": a.balanceAfter,
        disabled: a.disabled,
        onRevealed: g[0] || (g[0] = (f) => o.$emit("revealed")),
        onAgain: g[1] || (g[1] = (f) => o.$emit("again")),
        onLobby: g[2] || (g[2] = (f) => o.$emit("lobby"))
      }, null, 8, [
        "record",
        "balance-after",
        "disabled"
      ])) : (i(), r("button", {
        key: 2,
        type: "button",
        class: "game-skip-reveal",
        onClick: s
      }, "直接看结果"))
    ]));
  }
}), $e = ke, pe = {
  key: 1,
  class: "dice-opening",
  role: "status"
}, he = /* @__PURE__ */ A({
  __name: "DiceRoom",
  props: {
    state: {},
    disabledReason: {},
    inFlight: {},
    settlement: {}
  },
  emits: [
    "action",
    "again",
    "lobby",
    "revealed",
    "resume"
  ],
  setup(a) {
    const m = a, n = p(() => m.state.activeGame?.kind === "dice" ? m.state.activeGame : null), b = p(() => m.settlement?.record.detail.kind === "dice" ? m.settlement : null), u = p(() => m.inFlight?.endpoint === "game/dice/challenge");
    return (d, t) => b.value && b.value.record.detail.kind === "dice" ? (i(), k($e, {
      key: 0,
      record: b.value.record,
      detail: b.value.record.detail,
      "balance-after": b.value.balanceAfter,
      disabled: !!a.disabledReason,
      onRevealed: t[0] || (t[0] = (s) => d.$emit("revealed")),
      onAgain: t[1] || (t[1] = (s) => d.$emit("again")),
      onLobby: t[2] || (t[2] = (s) => d.$emit("lobby"))
    }, null, 8, [
      "record",
      "detail",
      "balance-after",
      "disabled"
    ])) : u.value ? (i(), r("section", pe, [...t[7] || (t[7] = [
      e("span", {
        class: "dice-cup is-shaking",
        "aria-hidden": "true"
      }, null, -1),
      e("h2", null, "开盅见分晓", -1),
      e("p", null, "结果确认后，双方一起亮骰。", -1)
    ])])) : n.value ? (i(), k(ve, {
      key: 2,
      game: n.value,
      "disabled-reason": a.disabledReason,
      busy: !!a.inFlight,
      onBid: t[3] || (t[3] = (s) => d.$emit("action", {
        endpoint: "game/dice/bid",
        payload: {
          gameId: n.value.id,
          bid: s
        }
      })),
      onChallenge: t[4] || (t[4] = (s) => d.$emit("action", {
        endpoint: "game/dice/challenge",
        payload: { gameId: n.value.id }
      }))
    }, null, 8, [
      "game",
      "disabled-reason",
      "busy"
    ])) : (i(), k(O, {
      key: 3,
      kind: "dice",
      minimum: 50,
      maximum: 500,
      step: 10,
      initial: 50,
      chips: [
        50,
        100,
        200,
        500
      ],
      balance: a.state.balance,
      "disabled-reason": a.disabledReason,
      "other-game": a.state.activeGame ? $(M)(a.state.activeGame.kind).name : "",
      rules: [
        "每人五颗骰子，只能看自己的。轮流叫「几个几」，叫的是两个人合起来至少有这么多。",
        "一点百搭；叫数只能越来越大。不信对方，就开盅：不够数，叫的人输；够数，开的人输。",
        "赢了拿回下注的 1.8 倍（含本金）；输了，本局筹码归对方。"
      ],
      onStart: t[5] || (t[5] = (s) => d.$emit("action", {
        endpoint: "game/dice/start",
        payload: { bet: s }
      })),
      onResume: t[6] || (t[6] = (s) => d.$emit("resume"))
    }, null, 8, [
      "balance",
      "disabled-reason",
      "other-game"
    ]));
  }
}), Ce = he;
export {
  Ce as default
};
