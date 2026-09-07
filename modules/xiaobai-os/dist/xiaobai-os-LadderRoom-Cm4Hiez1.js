/* eslint-disable */
import { G as L, H as b, I as k, J as u, K as c, T as A, b as F, f as B, g as v, h as $, j as C, k as m, m as p, p as a, q as R, u as g } from "./xiaobai-os-runtime-dom.esm-bundler-DGqntx6-.js";
import { r as O } from "./xiaobai-os-room-catalog-BYX95Q29.js";
import { n as G, t as T } from "./xiaobai-os-GameResult-DatmszlD.js";
var S = { class: "ladder-table" }, I = { class: "room-heading" }, j = { class: "ladder-prize" }, z = {
  class: "ladder-stairs",
  "aria-label": "五层阶梯"
}, w = {
  key: 0,
  "aria-hidden": "true"
}, E = { role: "status" }, M = { class: "ladder-next" }, N = { class: "ladder-paths" }, V = ["disabled", "onClick"], q = { "aria-hidden": "true" }, D = ["disabled"], H = /* @__PURE__ */ F({
  __name: "LadderTable",
  props: {
    game: {},
    disabledReason: {},
    stepping: { type: Boolean },
    settlement: {}
  },
  emits: [
    "step",
    "cashOut",
    "again",
    "lobby",
    "revealed"
  ],
  setup(t) {
    const o = t, l = b({ ...o.game }), d = b(!1), s = b(!1);
    let r;
    const f = {
      safe: {
        name: "稳着走",
        mark: "—"
      },
      medium: {
        name: "跨一步",
        mark: "↗"
      },
      risky: {
        name: "大胆跃",
        mark: "↟"
      }
    };
    function y(i) {
      clearTimeout(r), d.value = !0;
      const e = typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 720;
      r = setTimeout(() => {
        i(), d.value = !1;
      }, e);
    }
    k(() => o.game.completedFloors, (i, e) => {
      i > e && y(() => {
        l.value = { ...o.game };
      });
    }), k(() => o.settlement, (i) => {
      if (!i || i.record.detail.kind !== "ladder" || i.record.outcome === "cashed-out") return;
      const e = i.record.detail.steps.at(-1);
      e && y(() => {
        s.value = !e.success, e.success && (l.value = {
          ...o.game,
          completedFloors: e.floor,
          cashoutAmount: e.amountAfterStep,
          canCashOut: !0
        });
      });
    }, { immediate: !0 });
    const h = B(() => !!o.disabledReason || o.stepping || d.value || !!o.settlement);
    return A(() => clearTimeout(r)), (i, e) => (m(), v("section", S, [
      a("header", I, [a("small", null, "本局筹码 ¤ " + u(t.game.bet), 1)]),
      a("div", { class: c(["ladder-landscape", {
        "is-climbing": t.stepping || d.value,
        "is-fallen": s.value
      }]) }, [
        a("div", j, [a("span", null, u(t.settlement && !d.value ? "这一局，拿回" : l.value.canCashOut ? "现在收手，带走" : "走过第一层就能收手"), 1), a("strong", null, u(t.settlement && !d.value ? "¤ " + t.settlement.record.payout : l.value.canCashOut ? "¤ " + l.value.cashoutAmount : "从这里出发"), 1)]),
        a("div", z, [(m(), v(g, null, C(5, (n) => a("div", {
          key: n,
          class: c(["ladder-stair", {
            "is-done": n <= l.value.completedFloors,
            "is-next": n === l.value.completedFloors + 1
          }]),
          style: R({ "--floor": n })
        }, [a("span", null, u(n), 1), n === 5 ? (m(), v("i", w, "✦")) : $("", !0)], 6)), 64)), a("span", {
          class: "ladder-traveler",
          style: R({ "--position": l.value.completedFloors }),
          "aria-hidden": "true"
        }, [...e[4] || (e[4] = [a("i", null, null, -1)])], 4)]),
        a("p", E, u(t.stepping || d.value ? "迈出这一步，看看能不能站稳…" : s.value ? "这一步没站稳，下局再来。" : l.value.completedFloors === 5 ? "五层登顶！" : "已走过 " + l.value.completedFloors + " 层 / 共 5 层"), 1)
      ], 2),
      t.settlement && !d.value ? (m(), p(T, {
        key: 0,
        record: t.settlement.record,
        "balance-after": t.settlement.balanceAfter,
        disabled: !!t.disabledReason,
        onRevealed: e[0] || (e[0] = (n) => i.$emit("revealed")),
        onAgain: e[1] || (e[1] = (n) => i.$emit("again")),
        onLobby: e[2] || (e[2] = (n) => i.$emit("lobby"))
      }, null, 8, [
        "record",
        "balance-after",
        "disabled"
      ])) : t.settlement ? $("", !0) : (m(), v(g, { key: 1 }, [
        a("div", M, [a("h3", null, "第 " + u(l.value.completedFloors + 1) + " 层，怎么走？", 1), e[5] || (e[5] = a("p", null, "成功继续向上，失败本局归零。", -1))]),
        a("div", N, [(m(!0), v(g, null, C(l.value.nextChoices, (n) => (m(), v("button", {
          key: n.choice,
          type: "button",
          class: c("is-" + n.choice),
          disabled: h.value,
          onClick: (P) => i.$emit("step", n.choice)
        }, [
          a("i", q, u(f[n.choice].mark), 1),
          a("strong", null, u(f[n.choice].name), 1),
          a("span", null, u(n.successProbabilityBps / 100) + "% 能走过", 1),
          e[6] || (e[6] = a("small", null, "走过后拿回", -1)),
          a("b", null, "¤ " + u(n.successAmount), 1)
        ], 10, V))), 128))]),
        a("button", {
          type: "button",
          class: "game-secondary-action ladder-cashout",
          disabled: h.value || !l.value.canCashOut,
          onClick: e[3] || (e[3] = (n) => i.$emit("cashOut"))
        }, u(l.value.canCashOut ? "就到这里，带走 ¤ " + l.value.cashoutAmount : "走过第一层后，可以收手"), 9, D)
      ], 64))
    ]));
  }
}), J = H, K = /* @__PURE__ */ F({
  __name: "LadderRoom",
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
  setup(t) {
    const o = t, l = B(() => o.settlement?.before.kind === "ladder" ? o.settlement.before : o.state.activeGame?.kind === "ladder" ? o.state.activeGame : null);
    return (d, s) => l.value ? (m(), p(J, {
      key: l.value.id,
      game: l.value,
      "disabled-reason": t.disabledReason,
      settlement: t.settlement,
      stepping: t.inFlight?.endpoint === "game/ladder/step",
      onStep: s[0] || (s[0] = (r) => d.$emit("action", {
        endpoint: "game/ladder/step",
        payload: {
          gameId: l.value.id,
          choice: r
        }
      })),
      onCashOut: s[1] || (s[1] = (r) => d.$emit("action", {
        endpoint: "game/ladder/cash-out",
        payload: { gameId: l.value.id }
      })),
      onRevealed: s[2] || (s[2] = (r) => d.$emit("revealed")),
      onAgain: s[3] || (s[3] = (r) => d.$emit("again")),
      onLobby: s[4] || (s[4] = (r) => d.$emit("lobby"))
    }, null, 8, [
      "game",
      "disabled-reason",
      "settlement",
      "stepping"
    ])) : (m(), p(G, {
      key: 1,
      kind: "ladder",
      minimum: 30,
      maximum: 300,
      step: 10,
      initial: 30,
      chips: [
        30,
        50,
        100,
        300
      ],
      balance: t.state.balance,
      "disabled-reason": t.disabledReason,
      "other-game": t.state.activeGame ? L(O)(t.state.activeGame.kind).name : "",
      rules: [
        "共五层，每一步都能选一条路。胜算越低，成功后的奖励越高。",
        "走过第一层，就能收手带走奖励；继续走，失败则本局归零。",
        "登顶自动结算，单局最多拿回 50,000 小白币。稳妥的路也有失败的可能。"
      ],
      onStart: s[5] || (s[5] = (r) => d.$emit("action", {
        endpoint: "game/ladder/start",
        payload: { bet: r }
      })),
      onResume: s[6] || (s[6] = (r) => d.$emit("resume"))
    }, null, 8, [
      "balance",
      "disabled-reason",
      "other-game"
    ]));
  }
}), X = K;
export {
  X as default
};
