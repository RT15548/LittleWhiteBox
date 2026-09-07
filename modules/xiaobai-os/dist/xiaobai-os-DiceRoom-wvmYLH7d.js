/* eslint-disable */
import { D as I, G as $, H as T, I as N, J as m, T as V, b as A, f as p, g as r, h as S, j as B, k as i, m as k, p as e, u as D, v as h, y as F } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { a as C, c as L, i as M, o as G, r as j, s as w } from "./xiaobai-os-room-catalog-BYX95Q29.js";
import { n as H, t as J } from "./xiaobai-os-GameResult-DatmszlD.js";
var O = ["aria-label"], U = {
  class: "dice-call-dice",
  "aria-hidden": "true"
}, q = /* @__PURE__ */ A({
  __name: "DiceCall",
  props: {
    bid: {},
    speaker: {}
  },
  setup(a) {
    return (c, n) => (i(), r("div", {
      class: "dice-call",
      role: "group",
      "aria-label": a.speaker + "叫" + $(C)(a.bid)
    }, [
      e("h3", null, m(a.speaker) + "叫：" + m($(C)(a.bid)), 1),
      e("div", U, [(i(!0), r(D, null, B(a.bid.count, (b) => (i(), k(w, {
        key: b,
        value: a.bid.face,
        animate: !1
      }, null, 8, ["value"]))), 128))]),
      n[0] || (n[0] = e("p", null, "叫的是两个人合起来的数量", -1))
    ], 8, O));
  }
}), E = q, z = {
  class: "dice-table",
  "aria-label": "大话骰牌桌"
}, K = { class: "dice-stake" }, P = { class: "dice-opponent" }, Q = {
  key: 1,
  class: "dice-first-call"
}, W = { class: "dice-own-hand" }, X = { class: "game-dice-row" }, Y = {
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
  setup(a, { emit: c }) {
    const n = a, b = c, u = T(n.game.legalBids[0]?.count || 1), d = T(n.game.legalBids[0]?.face || 2), t = p(() => n.game.bids.at(-1)), s = p(() => [...new Set(n.game.legalBids.map((y) => y.count))]), o = p(() => M(n.game.legalBids, u.value));
    N(() => n.game.legalBids, () => {
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
      e("p", K, "本局筹码 ¤ " + m(a.game.bet), 1),
      e("div", P, [
        l[5] || (l[5] = e("span", {
          class: "dice-cup",
          "aria-hidden": "true"
        }, null, -1)),
        e("div", null, [l[4] || (l[4] = e("strong", null, "对面那位", -1)), e("small", null, m(a.busy ? "正琢磨怎么接你的话…" : t.value ? "轮到你了，跟着叫，还是开？" : "骰子摇好了，你先叫。"), 1)]),
        l[6] || (l[6] = e("span", { class: "dice-hidden-count" }, "5 颗暗骰", -1))
      ]),
      t.value ? (i(), k(E, {
        key: 0,
        bid: t.value,
        speaker: t.value.by === "dealer" ? "对方" : "你"
      }, null, 8, ["bid", "speaker"])) : (i(), r("div", Q, [...l[7] || (l[7] = [e("span", null, "你先来", -1), e("p", null, [
        h("猜猜两个人的骰子里"),
        e("br"),
        h("至少有几个相同的点数？")
      ], -1)])])),
      e("div", W, [
        l[8] || (l[8] = e("small", null, "你的骰子", -1)),
        e("div", X, [(i(!0), r(D, null, B(a.game.playerDice, (v, R) => (i(), k(w, {
          key: R,
          value: v,
          delay: R * 45
        }, null, 8, ["value", "delay"]))), 128))]),
        l[9] || (l[9] = e("p", null, [e("span", { class: "dice-wild-dot" }), h("一点百搭，开盅时也算你叫的点数")], -1))
      ]),
      a.game.legalActions.includes("bid") ? (i(), r("div", Y, [
        e("div", Z, [l[10] || (l[10] = e("strong", null, "这一口，你叫", -1)), e("span", null, "至少 " + m(u.value) + " 颗", 1)]),
        e("div", x, [
          e("button", {
            type: "button",
            "aria-label": "少叫一个",
            disabled: !!a.disabledReason || u.value === s.value[0],
            onClick: l[0] || (l[0] = (v) => g(-1))
          }, " − ", 8, _),
          e("strong", null, [h(m(u.value), 1), l[11] || (l[11] = e("small", null, "个", -1))]),
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
        }, [F(w, {
          value: v,
          animate: !1
        }, null, 8, ["value"])], 8, le)), 64))]),
        e("div", ie, [e("button", {
          type: "button",
          class: "game-primary-action",
          disabled: !!a.disabledReason || !o.value.includes(d.value),
          onClick: f
        }, " 叫" + m($(C)({
          count: u.value,
          face: d.value
        })), 9, te), a.game.legalActions.includes("challenge") ? (i(), r("button", {
          key: 0,
          type: "button",
          class: "dice-open-cup",
          disabled: !!a.disabledReason,
          onClick: l[2] || (l[2] = (v) => y.$emit("challenge"))
        }, [...l[12] || (l[12] = [h(" 开盅", -1), e("small", null, "不信他有这么多", -1)])], 8, ne)) : S("", !0)])
      ])) : (i(), r("div", de, [l[13] || (l[13] = e("p", null, "已经叫到头了，开盅见分晓。", -1)), e("button", {
        type: "button",
        class: "game-primary-action",
        disabled: !!a.disabledReason,
        onClick: l[3] || (l[3] = (v) => y.$emit("challenge"))
      }, " 开盅 ", 8, se)])),
      e("details", ue, [
        l[14] || (l[14] = e("summary", null, "规则与叫骰记录", -1)),
        l[15] || (l[15] = e("p", null, "数量更多，或数量相同而点数更大，都算加叫。一点只作百搭，不能单独叫。", -1)),
        e("ol", re, [(i(!0), r(D, null, B(a.game.bids, (v, R) => (i(), r("li", { key: R }, [e("span", null, m(v.by === "player" ? "你" : "对方"), 1), e("strong", null, m($(C)(v)), 1)]))), 128))])
      ])
    ]));
  }
}), ve = oe, me = {
  class: "dice-showdown",
  "aria-label": "开盅结果"
}, ce = { class: "dice-reveal-hand" }, be = { class: "game-dice-row" }, ge = { class: "dice-reveal-hand" }, ye = { class: "game-dice-row" }, fe = {
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
    const c = a, n = T(!1), b = T(!1), u = [], d = p(() => c.detail.matchingDiceCount >= c.detail.finalBid.count), t = p(() => [...c.detail.dealerDice, ...c.detail.playerDice].filter((o) => o === 1).length);
    function s() {
      n.value = !0, b.value = !0, u.forEach(clearTimeout);
    }
    return I(() => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        s();
        return;
      }
      const o = L(5);
      u.push(setTimeout(() => {
        n.value = !0;
      }, o.countAt), setTimeout(() => {
        b.value = !0;
      }, o.verdictAt));
    }), V(() => u.forEach(clearTimeout)), (o, g) => (i(), r("section", me, [
      F(E, {
        bid: a.detail.finalBid,
        speaker: a.detail.finalBid.by === "player" ? "你" : "对方"
      }, null, 8, ["bid", "speaker"]),
      e("div", ce, [g[3] || (g[3] = e("span", null, "对方的骰子", -1)), e("div", be, [(i(!0), r(D, null, B(a.detail.dealerDice, (f, y) => (i(), k(w, {
        key: y,
        value: f,
        delay: y * 45,
        highlight: n.value && $(G)(f, a.detail.finalBid.face)
      }, null, 8, [
        "value",
        "delay",
        "highlight"
      ]))), 128))])]),
      e("div", ge, [g[4] || (g[4] = e("span", null, "你的骰子", -1)), e("div", ye, [(i(!0), r(D, null, B(a.detail.playerDice, (f, y) => (i(), k(w, {
        key: y,
        value: f,
        delay: y * 45,
        highlight: n.value && $(G)(f, a.detail.finalBid.face)
      }, null, 8, [
        "value",
        "delay",
        "highlight"
      ]))), 128))])]),
      n.value ? (i(), r("p", fe, [
        h(" 合起来" + m(d.value ? "有" : "只有"), 1),
        e("strong", null, m($(C)({
          count: a.detail.matchingDiceCount,
          face: a.detail.finalBid.face
        })), 1),
        h("，" + m(d.value ? "够数" : "不够") + "。", 1),
        e("small", null, "包含 " + m(t.value) + " 颗百搭的一点 · " + m(a.detail.challenger === "player" ? "你开的盅" : "对方开的盅"), 1)
      ])) : S("", !0),
      b.value ? (i(), k(J, {
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
    const c = a, n = p(() => c.state.activeGame?.kind === "dice" ? c.state.activeGame : null), b = p(() => c.settlement?.record.detail.kind === "dice" ? c.settlement : null), u = p(() => c.inFlight?.endpoint === "game/dice/challenge");
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
    ])) : (i(), k(H, {
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
      "other-game": a.state.activeGame ? $(j)(a.state.activeGame.kind).name : "",
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
