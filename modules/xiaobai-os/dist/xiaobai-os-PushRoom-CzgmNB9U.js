/* eslint-disable */
import { $ as v, F as m, H as b, L as R, O as B, Q as A, Y as g, _ as p, g as P, h, m as e, p as c, tt as d, u as k, x as w, y as f } from "./xiaobai-os-runtime-dom.esm-bundler-DuiaxqDz.js";
import { i as T } from "./xiaobai-os-room-catalog-wdTdAbjP.js";
import { n as G, t as F } from "./xiaobai-os-GameResult-BT5_3WxE.js";
var L = { class: "push-table" }, N = { class: "room-heading" }, O = { class: "push-felt" }, D = { class: "push-pot" }, I = { class: "push-card-stage" }, S = { class: "push-card-inner" }, V = {
  class: "push-table-talk",
  role: "status"
}, z = ["aria-label"], E = { class: "push-odds" }, M = { class: "room-actions" }, H = ["disabled"], Q = ["disabled"], U = /* @__PURE__ */ w({
  __name: "PushTable",
  props: {
    game: {},
    disabledReason: {},
    drawing: { type: Boolean },
    settlement: {}
  },
  emits: [
    "draw",
    "cashOut",
    "again",
    "lobby",
    "revealed"
  ],
  setup(s) {
    const o = s, l = g({ ...o.game }), i = g(null), t = g(!1);
    let u;
    function y(n, a) {
      clearTimeout(u), i.value = n, t.value = !0;
      const r = typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 660;
      u = setTimeout(() => {
        a(), t.value = !1;
      }, r);
    }
    b(() => o.drawing, (n) => {
      n && (i.value = null);
    }), b(() => o.game.revealedCoins, (n, a) => {
      n > a && y("coin", () => {
        l.value = { ...o.game };
      });
    }), b(() => o.settlement, (n) => {
      !n || n.record.detail.kind !== "push" || n.record.outcome !== "cashed-out" && y(n.record.outcome === "busted" ? "bomb" : "coin", () => {
        n.record.detail.kind === "push" && (l.value = {
          ...o.game,
          revealedCoins: n.record.detail.revealedCoins,
          cashoutAmount: n.record.payout
        });
      });
    }, { immediate: !0 });
    const $ = c(() => !!o.disabledReason || o.drawing || t.value || !!o.settlement), C = c(() => (l.value.nextBombProbabilityBps / 100).toLocaleString("zh-CN", { maximumFractionDigits: 2 }));
    return B(() => clearTimeout(u)), (n, a) => (m(), p("section", L, [
      e("header", N, [e("small", null, "本局筹码 ¤ " + d(s.game.bet), 1)]),
      e("div", O, [
        e("div", D, [e("span", null, d(s.settlement && !t.value ? "这一局，拿回" : "现在收手，带走"), 1), e("strong", null, "¤ " + d(l.value.cashoutAmount), 1)]),
        e("div", I, [a[6] || (a[6] = e("div", {
          class: "push-deck",
          "aria-hidden": "true"
        }, [
          e("i"),
          e("i"),
          e("i")
        ], -1)), e("div", { class: v(["push-card", {
          "is-turning": t.value,
          "is-revealed": i.value,
          "is-waiting": s.drawing
        }]) }, [e("div", S, [a[5] || (a[5] = e("span", {
          class: "push-card-back",
          "aria-hidden": "true"
        }, [e("b", null, "金")], -1)), e("span", {
          class: v(["push-card-face", { "is-bomb": i.value === "bomb" }]),
          "aria-hidden": "true"
        }, [e("b", null, d(i.value === "bomb" ? "✹" : "¤"), 1), e("small", null, d(i.value === "bomb" ? "炸弹" : "+50"), 1)], 2)])], 2)]),
        e("p", V, d(s.drawing ? "牌还没亮，稍等一下…" : t.value ? "翻开看看…" : i.value === "bomb" ? "哎呀，是炸弹。" : i.value === "coin" ? "是金币！还要再来一张吗？" : "牌已洗好，翻一张试试手气。"), 1),
        e("div", {
          class: "push-coins",
          "aria-label": "已找到 " + l.value.revealedCoins + " 张金币"
        }, [(m(), p(k, null, R(7, (r) => e("span", {
          key: r,
          class: v({ "is-found": r <= l.value.revealedCoins }),
          "aria-hidden": "true"
        }, "¤", 2)), 64))], 8, z)
      ]),
      s.settlement && !t.value ? (m(), h(F, {
        key: 0,
        record: s.settlement.record,
        "balance-after": s.settlement.balanceAfter,
        disabled: !!s.disabledReason,
        onRevealed: a[0] || (a[0] = (r) => n.$emit("revealed")),
        onAgain: a[1] || (a[1] = (r) => n.$emit("again")),
        onLobby: a[2] || (a[2] = (r) => n.$emit("lobby"))
      }, null, 8, [
        "record",
        "balance-after",
        "disabled"
      ])) : s.settlement ? P("", !0) : (m(), p(k, { key: 1 }, [
        e("div", E, [e("span", null, [
          a[7] || (a[7] = f("还剩 ", -1)),
          e("b", null, d(l.value.remainingCards), 1),
          a[8] || (a[8] = f(" 张牌，其中 ", -1)),
          e("b", null, d(l.value.remainingBombs), 1),
          a[9] || (a[9] = f(" 张炸弹", -1))
        ]), e("small", null, "下一张翻到炸弹的概率 " + d(C.value) + "%", 1)]),
        e("div", M, [e("button", {
          type: "button",
          class: "game-primary-action",
          disabled: $.value,
          onClick: a[3] || (a[3] = (r) => n.$emit("draw"))
        }, d(l.value.revealedCoins ? "再翻一张" : "翻第一张"), 9, H), e("button", {
          type: "button",
          class: "game-secondary-action",
          disabled: $.value || !s.game.legalActions.includes("cash-out"),
          onClick: a[4] || (a[4] = (r) => n.$emit("cashOut"))
        }, " 收手，拿走 ¤ " + d(l.value.cashoutAmount), 9, Q)]),
        a[10] || (a[10] = e("p", { class: "game-help" }, "每张金币 +50；翻到炸弹，本局归零。", -1))
      ], 64))
    ]));
  }
}), Y = U, j = /* @__PURE__ */ w({
  __name: "PushRoom",
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
  setup(s) {
    const o = s, l = c(() => o.settlement?.before.kind === "push" ? o.settlement.before : o.state.activeGame?.kind === "push" ? o.state.activeGame : null);
    return (i, t) => l.value ? (m(), h(Y, {
      key: l.value.id,
      game: l.value,
      "disabled-reason": s.disabledReason,
      settlement: s.settlement,
      drawing: s.inFlight?.endpoint === "game/push/draw",
      onDraw: t[0] || (t[0] = (u) => i.$emit("action", {
        endpoint: "game/push/draw",
        payload: { gameId: l.value.id }
      })),
      onCashOut: t[1] || (t[1] = (u) => i.$emit("action", {
        endpoint: "game/push/cash-out",
        payload: { gameId: l.value.id }
      })),
      onRevealed: t[2] || (t[2] = (u) => i.$emit("revealed")),
      onAgain: t[3] || (t[3] = (u) => i.$emit("again")),
      onLobby: t[4] || (t[4] = (u) => i.$emit("lobby"))
    }, null, 8, [
      "game",
      "disabled-reason",
      "settlement",
      "drawing"
    ])) : (m(), h(G, {
      key: 1,
      kind: "push",
      minimum: 50,
      maximum: 50,
      step: 1,
      initial: 50,
      chips: [50],
      balance: s.state.balance,
      "disabled-reason": s.disabledReason,
      "other-game": s.state.activeGame ? A(T)(s.state.activeGame.kind).name : "",
      rules: [
        "一副十张牌：七张金币，三张炸弹。每局下注 50 小白币。",
        "每翻出一张金币，攒下 50 小白币。随时收手，把攒下的钱带走。",
        "翻到炸弹，本局一分也拿不走。七张金币全找到，自动结算。"
      ],
      onStart: t[5] || (t[5] = (u) => i.$emit("action", { endpoint: "game/push/start" })),
      onResume: t[6] || (t[6] = (u) => i.$emit("resume"))
    }, null, 8, [
      "balance",
      "disabled-reason",
      "other-game"
    ]));
  }
}), W = j;
export {
  W as default
};
